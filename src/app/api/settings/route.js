import { getSetting, setSetting } from '@/lib/db';

// GET setting by key
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return Response.json({ error: 'Key required' }, { status: 400 });
    }

    const value = await getSetting(key);

    return Response.json({
      success: true,
      key,
      value
    });

  } catch (error) {
    console.error('Error fetching setting:', error);
    return Response.json({
      error: 'Failed to fetch setting',
      message: error.message
    }, { status: 500 });
  }
}

// POST to update setting
export async function POST(request) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return Response.json({ error: 'Key required' }, { status: 400 });
    }

    await setSetting(key, value);

    return Response.json({
      success: true,
      message: 'Setting updated'
    });

  } catch (error) {
    console.error('Error updating setting:', error);
    return Response.json({
      error: 'Failed to update setting',
      message: error.message
    }, { status: 500 });
  }
}
