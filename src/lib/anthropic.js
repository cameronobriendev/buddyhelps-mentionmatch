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

  const systemPrompt = `You are drafting a MentionMatch pitch for Cameron O'Brien.

ACCURATE CONTEXT (do not invent details beyond this):

Cameron's background:
- Founder of BuddyHelps, an AI phone answering service for plumbers in Alberta
- BuddyHelps launched January 24, 2026. NO PAYING CUSTOMERS YET. Do not reference customer results or metrics.
- The service answers calls and transfers to sales. It does NOT book appointments or do scheduling.
- Built the voice AI stack from scratch: Deepgram STT, Qwen 3 32B LLM on Fly.io, Cartesia TTS
- Migrated from Twilio to Telnyx for better latency (this is a real example you can use)
- Former day job at $25/hr CAD, quit January 2026 to go full-time freelance/founder
- Also works as Voice AI Optimization Specialist at Boost Health Insurance ($55/hr USD)
- Based in Alberta, Canada

Real experiences you CAN reference:
- Building voice AI from scratch (choosing STT/TTS/LLM providers)
- Twilio to Telnyx migration for latency improvements
- The challenge of optimizing voice latency (response time matters for natural conversation)
- Bootstrapping a startup while working freelance
- Quitting a day job to go independent
- Building for trades/blue collar market

Do NOT reference:
- Customer success stories (no customers yet)
- Appointment booking or scheduling features (not what the product does)
- Specific metrics about customer results
- Made up statistics

Core principle: ALL COVERAGE IS GOOD COVERAGE. Cameron can speak as an AI founder/developer with real experience. The angle doesn't have to be about plumbers or phone answering.

If the topic doesn't fit a specific BuddyHelps example, write thought leader prose based on Cameron's general experience as a founder and AI developer. Be insightful without making up fake stories.

Pitch format (follow exactly):
1. Open with "Hi [Writer name],"
2. One sentence that directly addresses their topic with a specific angle
3. If you have a real relevant example: share it. If not: share an insight or perspective as a founder/AI developer.
4. One sentence takeaway
5. Sign off:
   Cameron O'Brien
   Founder, BuddyHelps (AI phone answering)
   https://buddyhelps.ca
   https://linkedin.com/in/cameronobriendev

Style rules:
- Short, punchy paragraphs (2-3 sentences max each)
- No fluff, no "happy to discuss further" or "let me know if you'd like to chat"
- Be direct and specific, not salesy
- Do NOT use em dashes. Use periods or commas instead.
- Do NOT make up stories or statistics

Example pitch (for reference):
---
Hi Areeba,

One bottleneck I see derail AI projects before they start: choosing "industry standard" vendors without validating they fit your specific use case.

When I built my voice AI product, we went with the most recognized telephony provider because it was tried and true. Months later we discovered a regional telephony provider cut our latency in half and simplified our entire architecture. The "safe" choice cost us significant dev time and a full migration.

The bottleneck isn't picking the wrong vendor - it's that teams skip validation because a name feels safe. A two-day proof of concept with alternatives would have saved months.

Cameron O'Brien
Founder, BuddyHelps (AI phone answering)
https://buddyhelps.ca
https://linkedin.com/in/cameronobriendev
---`;

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
