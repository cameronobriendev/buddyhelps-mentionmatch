import { getRequest, updateRequest } from '@/lib/db';
import { generateDraftResponse } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'Request ID required' }, { status: 400 });
    }

    // Get the request from DB
    const requestData = await getRequest(id);

    if (!requestData) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update status to drafting
    await updateRequest(id, { status: 'drafting' });

    // Generate draft with Sonnet
    const draft = await generateDraftResponse(requestData);

    // Save draft to DB
    await updateRequest(id, {
      draft_response: draft,
      status: 'drafting'
    });

    return Response.json({
      success: true,
      draft
    });

  } catch (error) {
    console.error('Error generating draft:', error);
    return Response.json({
      error: 'Failed to generate draft',
      message: error.message
    }, { status: 500 });
  }
}
