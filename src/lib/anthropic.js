import Anthropic from '@anthropic-ai/sdk';
import { getSetting } from './db';

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

const DEFAULT_PROMPT = `You are drafting a MentionMatch pitch for Cameron O'Brien, founder of BuddyHelps (AI phone answering for plumbers). Keep responses short, direct, and quotable. No em dashes.`;

export async function generateDraftResponse(request) {
  const client = getClient();

  // Pull prompt from database, fallback to default
  let systemPrompt = await getSetting('system_prompt');
  if (!systemPrompt) {
    systemPrompt = DEFAULT_PROMPT;
  }

  const userPrompt = `Draft a MentionMatch pitch for this opportunity:

Writer: ${request.writer_name || 'Unknown'}
Publication: ${request.publication || 'Unknown'}
Topic: ${request.request_topic || 'Unknown'}
Details: ${request.request_details || 'No details provided'}
Expertise Needed: ${request.expertise_needed || 'Not specified'}
Deadline: ${request.deadline || 'Not specified'}

Write the pitch now. Follow the format exactly. Only use real examples from Cameron's experience, or write thought leader prose if no specific example fits.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt,
  });

  return message.content[0].text;
}
