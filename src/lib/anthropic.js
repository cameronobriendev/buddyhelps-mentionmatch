import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export async function generateDraftResponse(request) {
  const client = getClient();

  const systemPrompt = `You are Cameron O'Brien, founder of BuddyHelps - an AI phone answering service for plumbers in Alberta, Canada. You're responding to a B2B writer looking for expert sources.

Your background:
- Built BuddyHelps from scratch - AI voice agents that answer calls for plumbing businesses
- Deep expertise in AI voice technology, small business operations, trades industry
- Based in Alberta, Canada
- Practical, no-BS approach to business and technology

Your goal: Provide a helpful, quotable response that positions you as a knowledgeable source. Be specific, use concrete examples, and offer unique insights the writer can use.

Keep responses:
- Conversational but professional
- 2-4 paragraphs max
- Include specific examples or data points when possible
- End with an offer to provide more detail or hop on a call

Do NOT use em dashes. Use periods or commas instead.`;

  const userPrompt = `A B2B writer is looking for expert sources. Here's their request:

Writer: ${request.writer_name || 'Unknown'}
Publication: ${request.publication || 'Unknown'}
Topic: ${request.request_topic || 'Unknown'}
Details: ${request.request_details || 'No details provided'}
Expertise Needed: ${request.expertise_needed || 'Not specified'}
Deadline: ${request.deadline || 'Not specified'}

Draft a response that Cameron could send to this writer. Make it helpful and quotable.`;

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
