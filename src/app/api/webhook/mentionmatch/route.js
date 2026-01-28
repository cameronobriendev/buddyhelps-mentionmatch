import { createRequest } from '@/lib/db';

export async function POST(request) {
  try {
    // Optional: Verify webhook secret
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization');
      const providedSecret = request.headers.get('x-webhook-secret');

      if (authHeader !== `Bearer ${webhookSecret}` && providedSecret !== webhookSecret) {
        console.log('Webhook auth failed');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload = await request.json();
    console.log('MentionMatch webhook received:', JSON.stringify(payload, null, 2));

    // Map payload fields to our schema
    // Adjust field names based on actual MentionMatch payload structure
    const requestData = {
      writer_name: payload.writer_name || payload.writerName || payload.name || null,
      writer_email: payload.writer_email || payload.writerEmail || payload.email || null,
      publication: payload.publication || payload.outlet || payload.media || null,
      request_topic: payload.topic || payload.subject || payload.title || null,
      request_details: payload.details || payload.description || payload.query || payload.request || null,
      deadline: payload.deadline || payload.due_date || payload.dueDate || null,
      expertise_needed: payload.expertise || payload.expertise_needed || payload.tags || null,
      raw_payload: payload
    };

    const id = await createRequest(requestData);

    console.log(`Created request ID: ${id}`);

    return Response.json({
      success: true,
      message: 'Request received and stored',
      id: Number(id)
    }, { status: 201 });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// Also handle GET for testing
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'MentionMatch webhook endpoint is ready',
    usage: 'POST requests from MentionMatch will be stored in the database'
  });
}
