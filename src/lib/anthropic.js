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

  // Add subject line instruction
  systemPrompt += `

IMPORTANT: Your response must be in this exact format:
SUBJECT: [A short, compelling subject line - 5-10 words max]
---
[The email body]

The subject line should be specific to the topic and grab attention. Examples:
- "AI founder on vendor lock-in bottleneck"
- "Voice AI perspective on automation mistakes"
- "Bootstrapped founder take on [topic]"`;

  const userPrompt = `Draft a MentionMatch pitch for this opportunity:

Writer: ${request.writer_name || 'Unknown'}
Publication: ${request.publication || 'Unknown'}
Topic: ${request.request_topic || 'Unknown'}
Details: ${request.request_details || 'No details provided'}
Expertise Needed: ${request.expertise_needed || 'Not specified'}
Deadline: ${request.deadline || 'Not specified'}

Write the pitch now with SUBJECT: line first, then --- separator, then email body.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt,
  });

  const fullResponse = message.content[0].text;

  // Parse subject and body
  let subject = '';
  let body = fullResponse;

  if (fullResponse.includes('SUBJECT:') && fullResponse.includes('---')) {
    const parts = fullResponse.split('---');
    const subjectLine = parts[0].trim();
    subject = subjectLine.replace('SUBJECT:', '').trim();
    body = parts.slice(1).join('---').trim();
  }

  return { subject, body, full: fullResponse };
}
