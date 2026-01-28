export async function POST(request) {
  try {
    const { pin } = await request.json();
    const correctPin = process.env.DASHBOARD_PIN;

    if (!correctPin) {
      console.error('DASHBOARD_PIN not set in environment variables');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (pin === correctPin) {
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid PIN' }, { status: 401 });

  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
