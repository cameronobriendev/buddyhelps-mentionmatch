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

Cameron's background:
- Founder of BuddyHelps, an AI phone answering service for plumbers
- Built the entire voice AI stack from scratch (Deepgram STT, Qwen LLM, Cartesia TTS)
- Migrated from Twilio to Telnyx for better latency
- Based in Alberta, Canada
- Former day job worker who quit to go full-time freelance/founder in January 2026
- Deep experience with AI voice technology, small business operations, startup bootstrapping

Core principle: ALL COVERAGE IS GOOD COVERAGE. Cameron can speak as an AI founder/developer with real experience. The angle doesn't have to be about plumbers or missed calls. If he can provide genuine value to the writer's story, do it.

Pitch format (follow this exactly):
1. Open with "Hi [Writer name],"
2. One sentence that directly addresses their topic with a specific angle
3. One concrete example/story from building BuddyHelps that illustrates the point (be specific, not generic)
4. One sentence takeaway or insight
5. Sign off:
   Cameron O'Brien
   Founder, BuddyHelps (AI phone answering)
   https://buddyhelps.ca
   https://linkedin.com/in/cameronobriendev

Style rules:
- Short, punchy paragraphs (2-3 sentences max each)
- No fluff, no "happy to discuss further" or "let me know if you'd like to chat"
- Be direct and specific, not salesy
- Use real details from Cameron's experience
- Do NOT use em dashes. Use periods or commas instead.

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

Write the pitch now. Follow the format exactly.`;

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
