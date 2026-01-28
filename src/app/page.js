'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  drafting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  responded: 'bg-green-500/20 text-green-400 border-green-500/30',
  skipped: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [drafting, setDrafting] = useState(false);
  const [editedDraft, setEditedDraft] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/requests' : `/api/requests?status=${filter}`;
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
        // Refresh the selected request
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

      fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status, final_response: finalResponse });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Request List */}
      <div className="w-96 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold mb-4">MentionMatch</h1>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'new', 'drafting', 'responded', 'skipped'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-4 text-gray-500">No requests found</div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                onClick={() => selectRequest(req)}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors ${
                  selectedRequest?.id === req.id ? 'bg-gray-900' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-100 line-clamp-1">
                    {req.request_topic || 'No topic'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[req.status]}`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                  {req.request_details || 'No details'}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{req.publication || 'Unknown'}</span>
                  <span>{formatDate(req.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content - Request detail */}
      <div className="flex-1 flex flex-col">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedRequest.request_topic || 'No topic'}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{selectedRequest.writer_name || 'Unknown writer'}</span>
                    <span>{selectedRequest.publication || 'Unknown publication'}</span>
                    {selectedRequest.deadline && (
                      <span className="text-orange-400">
                        Deadline: {selectedRequest.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[selectedRequest.status]}`}
                >
                  {selectedRequest.status}
                </span>
              </div>

              {/* Request details */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Request Details</h3>
                <p className="text-gray-100 whitespace-pre-wrap">
                  {selectedRequest.request_details || 'No details provided'}
                </p>
                {selectedRequest.expertise_needed && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <span className="text-sm text-gray-400">Expertise needed: </span>
                    <span className="text-gray-200">{selectedRequest.expertise_needed}</span>
                  </div>
                )}
              </div>

              {/* Contact info */}
              {selectedRequest.writer_email && (
                <div className="text-sm text-gray-400">
                  Contact: <a href={`mailto:${selectedRequest.writer_email}`} className="text-blue-400 hover:underline">{selectedRequest.writer_email}</a>
                </div>
              )}
            </div>

            {/* Draft response section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Draft Response</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateDraft(selectedRequest.id)}
                    disabled={drafting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    {drafting ? 'Generating...' : 'Generate with Sonnet'}
                  </button>
                </div>
              </div>

              <textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                placeholder="Draft response will appear here. Click 'Generate with Sonnet' to create a draft, or write your own."
                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-gray-600"
              />

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => copyToClipboard(editedDraft)}
                  disabled={!editedDraft}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'responded', editedDraft)}
                  disabled={!editedDraft}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Mark as Responded
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'skipped')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors text-gray-400"
                >
                  Skip
                </button>
              </div>

              {/* Final response if exists */}
              {selectedRequest.final_response && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
                  <h4 className="text-sm font-medium text-green-400 mb-2">Final Response Sent</h4>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm">
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
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}
