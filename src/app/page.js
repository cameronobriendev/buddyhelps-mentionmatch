'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700 border-blue-300',
  drafting: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  responded: 'bg-green-100 text-green-700 border-green-300',
  skipped: 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('new');
  const [drafting, setDrafting] = useState(false);
  const [editedDraft, setEditedDraft] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Check if already authenticated (session storage)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('mm_authenticated');
    if (isAuth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchRequests();
    }
  }, [filter, authenticated]);

  async function handlePinSubmit(e) {
    e.preventDefault();
    setPinError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem('mm_authenticated', 'true');
        setAuthenticated(true);
      } else {
        setPinError('Invalid PIN');
        setPin('');
      }
    } catch (error) {
      setPinError('Error verifying PIN');
    }
  }

  async function fetchRequests() {
    setLoading(true);
    try {
      const url = `/api/requests?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
    setLoading(false);
  }

  async function generateDraft(id) {
    setDrafting(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.draft) {
        setEditedDraft(data.draft);
        const updated = requests.map(r =>
          r.id === id ? { ...r, draft_response: data.draft, status: 'drafting' } : r
        );
        setRequests(updated);
        if (selectedRequest?.id === id) {
          setSelectedRequest({ ...selectedRequest, draft_response: data.draft, status: 'drafting' });
        }
      }
    } catch (error) {
      console.error('Failed to generate draft:', error);
      alert('Failed to generate draft. Check console for details.');
    }
    setDrafting(false);
  }

  async function updateStatus(id, status, finalResponse = null) {
    try {
      const body = { id, status };
      if (finalResponse) {
        body.final_response = finalResponse;
        body.responded_at = new Date().toISOString();
      }

      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // If skipping, clear selection and refresh
      if (status === 'skipped') {
        setSelectedRequest(null);
        setEditedDraft('');
      }

      fetchRequests();
      if (selectedRequest?.id === id && status !== 'skipped') {
        setSelectedRequest({ ...selectedRequest, status, final_response: finalResponse });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function deleteRequest(id) {
    try {
      await fetch('/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      setShowDeleteModal(false);
      setDeleteTarget(null);
      setSelectedRequest(null);
      setEditedDraft('');
      fetchRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  }

  function confirmDelete(request) {
    setDeleteTarget(request);
    setShowDeleteModal(true);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  function selectRequest(request) {
    setSelectedRequest(request);
    setEditedDraft(request.draft_response || '');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // PIN entry screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">MentionMatch</h1>
          <p className="text-gray-500 text-center mb-6">Enter PIN to access dashboard</p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {pinError && (
              <p className="text-red-500 text-sm text-center mt-2">{pinError}</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Request?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this request from <strong>{deleteTarget.publication || 'Unknown'}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
              "{deleteTarget.request_topic || 'No topic'}"
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRequest(deleteTarget.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Request List */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">MentionMatch</h1>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {['new', 'drafting', 'responded', 'skipped'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'skipped' ? 'archive' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-4 text-gray-500">
              {filter === 'new' ? 'No new requests' : `No ${filter === 'skipped' ? 'archived' : filter} requests`}
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                onClick={() => selectRequest(req)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRequest?.id === req.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {req.request_topic || 'No topic'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[req.status]}`}
                  >
                    {req.status === 'skipped' ? 'archived' : req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {req.request_details || 'No details'}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{req.publication || 'Unknown'}</span>
                  <span>{formatDate(req.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content - Request detail */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRequest.request_topic || 'No topic'}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>{selectedRequest.writer_name || 'Unknown writer'}</span>
                    <span>{selectedRequest.publication || 'Unknown publication'}</span>
                    {selectedRequest.deadline && (
                      <span className="text-orange-600">
                        Deadline: {selectedRequest.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[selectedRequest.status]}`}
                  >
                    {selectedRequest.status === 'skipped' ? 'archived' : selectedRequest.status}
                  </span>
                  <button
                    onClick={() => confirmDelete(selectedRequest)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Request details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Request Details</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedRequest.request_details || 'No details provided'}
                </p>
                {selectedRequest.expertise_needed && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Expertise needed: </span>
                    <span className="text-gray-700">{selectedRequest.expertise_needed}</span>
                  </div>
                )}
              </div>

              {/* Contact info */}
              {selectedRequest.writer_email && (
                <div className="text-sm text-gray-500">
                  Contact: <a href={`mailto:${selectedRequest.writer_email}`} className="text-blue-600 hover:underline">{selectedRequest.writer_email}</a>
                </div>
              )}
            </div>

            {/* Draft response section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Draft Response</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateDraft(selectedRequest.id)}
                    disabled={drafting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {drafting ? 'Generating...' : 'Generate with Sonnet'}
                  </button>
                </div>
              </div>

              <textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                placeholder="Draft response will appear here. Click 'Generate with Sonnet' to create a draft, or write your own."
                className="w-full h-64 bg-white border border-gray-300 rounded-lg p-4 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => copyToClipboard(editedDraft)}
                  disabled={!editedDraft}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'responded', editedDraft)}
                  disabled={!editedDraft}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark as Responded
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'skipped')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-600"
                >
                  Archive
                </button>
              </div>

              {/* Final response if exists */}
              {selectedRequest.final_response && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-700 mb-2">Final Response Sent</h4>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {selectedRequest.final_response}
                  </p>
                  {selectedRequest.responded_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded: {formatDate(selectedRequest.responded_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}
