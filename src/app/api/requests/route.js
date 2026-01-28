import { getRequests, updateRequest, deleteRequest } from '@/lib/db';

// GET all requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const requests = await getRequests(status);

    return Response.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    return Response.json({
      error: 'Failed to fetch requests',
      message: error.message
    }, { status: 500 });
  }
}

// PATCH to update a request
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: 'Request ID required' }, { status: 400 });
    }

    const rowsAffected = await updateRequest(id, updates);

    if (rowsAffected === 0) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Request updated'
    });

  } catch (error) {
    console.error('Error updating request:', error);
    return Response.json({
      error: 'Failed to update request',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE a request
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: 'Request ID required' }, { status: 400 });
    }

    const rowsAffected = await deleteRequest(id);

    if (rowsAffected === 0) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Request deleted'
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    return Response.json({
      error: 'Failed to delete request',
      message: error.message
    }, { status: 500 });
  }
}
