import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FamilyConversationTurn, PersonaId, VisualContext } from '@/types/chat';

const PERSONA_ORDER: PersonaId[] = ['sheela', 'anjali', 'soman', 'latha'];

function buildFallbackVisualContext(caption: string, imageUrl?: string): VisualContext {
  const cap = caption.toLowerCase();
  const signals = {
    tea: cap.includes('tea') || cap.includes('chai') || cap.includes('coffee') || cap.includes('kattan'),
    food: cap.includes('food') || cap.includes('biryani') || cap.includes('meal') || cap.includes('snack'),
    travel: cap.includes('trip') || cap.includes('travel') || cap.includes('beach') || cap.includes('resort') || cap.includes('wedding'),
    people: cap.includes('friend') || cap.includes('group') || cap.includes('family') || cap.includes('two') || cap.includes('team'),
  };

  const activities = [] as string[];
  if (signals.tea) activities.push('drinking tea or coffee');
  if (signals.food) activities.push('sharing food or snacks');
  if (signals.travel) activities.push('travelling or relaxing together');
  if (signals.people) activities.push('socialising in a group');
  if (!activities.length) activities.push('posing together naturally');

  const objects = [] as string[];
  if (signals.tea) objects.push('tea or coffee cups');
  if (signals.food) objects.push('food or snacks');
  if (signals.travel) objects.push('travel gear or scenic backdrop');
  if (!objects.length) objects.push('everyday household items');

  return {
    people: 2,
    visible_people_description: ['Two people are pictured together in a casual setting.'],
    setting: imageUrl ? 'Everyday family or social scene' : 'Casual group scene',
    objects,
    activities,
    food_or_drink: signals.tea || signals.food ? ['tea', 'snacks', 'coffee'] : ['light refreshments'],
    notable_details: caption ? ['The user caption adds context to the scene.'] : ['No explicit caption provided.'],
    relationship_unknown: true,
    social_context: 'A relaxed social moment with room for harmless family speculation.',
    gossip_potential: 0.72,
  };
}

function getSpeakerForTurn(conversationHistory: any[], previousSpeaker?: PersonaId | null): PersonaId {
  const lastSpeaker = conversationHistory.filter((msg) => msg.senderId && msg.senderId !== 'user' && msg.senderId !== 'system').at(-1)?.senderId as PersonaId | undefined;
  const order = previousSpeaker ? [...PERSONA_ORDER.filter((id) => id !== previousSpeaker), previousSpeaker] : PERSONA_ORDER;
  const lastIndex = lastSpeaker ? PERSONA_ORDER.indexOf(lastSpeaker) : -1;
  const candidates = [...PERSONA_ORDER.slice(lastIndex + 1), ...PERSONA_ORDER.slice(0, lastIndex + 1)];
  const pick = candidates.find((person) => !conversationHistory.some((msg) => msg.senderId === person && msg.senderId !== 'user')) ?? order[(conversationHistory.length + (previousSpeaker ? 1 : 0)) % PERSONA_ORDER.length];
  return pick ?? 'latha';
}

function buildFallbackTurn({
  visualContext,
  caption,
  conversationHistory,
  previousSpeaker,
}: {
  visualContext: VisualContext;
  caption: string;
  conversationHistory: any[];
  previousSpeaker?: PersonaId | null;
}): FamilyConversationTurn {
  const speaker = getSpeakerForTurn(conversationHistory, previousSpeaker);
  const intro = caption ? `The caption says "${caption.trim()}" and the family is absolutely treating it like evidence.` : 'The family is reading the whole scene like it is a legal case.';
  const keyTheme = visualContext.food_or_drink.length > 0 ? 'tea, snacks, or a relaxed hangout' : 'the vibe and the background details';

  const templates: Record<PersonaId, string[]> = {
    sheela: [
      `Ente monine ariyam, ithu onnum problem aanu. But still, ${keyTheme} kandu family pengalude aalochana thakarnnilla.`,
      `Ammayi pole ithu kurachu sharamalla. Njangal onnu parayanam, just because there are two cups, that does not mean drama.`,
      `Mone, ithu karyam thanne aanu. Family discussionilum thirichu poyi indum karyamachellum.`,
    ],
    anjali: [
      `WAIT... this is already suspicious in the most harmless way possible. ${intro}`,
      `I can absolutely make this 10 times more embarrassing. The vibe is very "we have a story".`,
      `Aah, okay, now I see the gossip angle. This is either a cute moment or a full family scandal.`,
    ],
    soman: [
      `Enthu cheytha, oru chitram kandu, jeevitham ellam professional decision pole aayi. But nammal ippol karyam paranju nokkuka.`,
      `This is somehow connected to your future, your health, your budget, and your marriage prospects.`,
      `Karyam athu njan parayan varunnathil oru important lesson undayirunnu, but let us not overdo it.`,
    ],
    latha: [
      `mmm... njan veruthe chodichatha... aa second person aaranu? just asking, of course.`,
      `Ayyo, ithu onnum parayenda, but background-il aa detail kandu. Very interesting, yes.`,
      `Ithu oru small clue aanu, no big issue, but still... hmm.`,
    ],
  };

  const options = templates[speaker];
  const text = options[(conversationHistory.length + speaker.length) % options.length];
  const continueConversation = conversationHistory.length < 7;

  return {
    speaker,
    message: text,
    messageType: 'text',
    replyTo: conversationHistory.at(-1)?.id ?? null,
    emotion: speaker === 'anjali' ? 'teasing' : speaker === 'soman' ? 'advice' : speaker === 'latha' ? 'curious' : 'defensive',
    continueConversation,
  };
}

function buildFallbackVerdict(caption: string, visualContext: VisualContext) {
  const teaProbability = visualContext.food_or_drink.some((item) => item.toLowerCase().includes('tea')) ? 79 : 42;
  const suspicion = Math.min(97, Math.max(52, Math.round((visualContext.gossip_potential || 0.7) * 100)));
  const summary = caption
    ? `The family verdict is that ${caption.trim()} was treated like a major clue, but nobody is proving a scandal — just a strong case for harmless chaos.`
    : 'The family verdict is that this is a classic harmless family mystery: a casual scene, a little too much curiosity, and absolutely zero proof of anything serious.';

  return {
    approvalRating: Math.min(99, Math.max(50, 85 - (visualContext.people > 2 ? 8 : 0) + (visualContext.gossip_potential > 0.7 ? 8 : 0))),
    title: 'Family Verdict™',
    summary,
    sheelaComment: 'This is all very cute, but if anyone is making fuss, I am protecting the family from unnecessary drama.',
    anjaliComment: 'The energy is suspiciously funny, and I am absolutely making it more embarrassing by accident.',
    somanComment: 'Camera poyi mood okke, but if there is a future lesson here, it is about staying calm and not overthinking.',
    lathaComment: 'I am just asking a few small questions, and somehow now it is a full investigation. Mmm.',
  };
}

async function requestOpenAIJSON(prompt: string, imageUrl?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === 'PASTE_YOUR_KEY_HERE') {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });

    const content: any[] = [{ type: 'text', text: prompt }];
    if (imageUrl) {
      content.push({ type: 'image_url', image_url: { url: imageUrl } });
    }

    const completion = await client.chat.completions.create({
      model: imageUrl ? 'gpt-4o-mini' : 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content }],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    return JSON.parse(raw);
  } catch (error: any) {
    const message = error?.message || 'OpenAI request failed.';
    return {
      error: message.includes('API key')
        ? 'OpenAI is not configured correctly. Add a valid OPENAI_API_KEY in your local .env.local file and restart the app.'
        : 'The family AI is currently unavailable. Please try again in a moment.',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action ?? 'analyze';
    const caption = typeof body.caption === 'string' ? body.caption : '';
    const userMessage = typeof body.userMessage === 'string' ? body.userMessage : '';
    const visualContext = body.visualContext ?? buildFallbackVisualContext(caption || userMessage, body.imageUrl);
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const previousSpeaker = body.previousSpeaker as PersonaId | null | undefined;
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : undefined;

    if (action === 'analyze') {
      const aiResult = await requestOpenAIJSON(
        `You are analyzing a family photo. Produce a strict JSON object with keys: people, visible_people_description, setting, objects, activities, food_or_drink, notable_details, relationship_unknown, social_context, gossip_potential. Keep facts conservative and avoid assumptions. Do not invent a romantic relationship unless explicitly shown.`,
        imageUrl,
      );

      if (aiResult && typeof aiResult === 'object' && 'error' in aiResult && aiResult.error) {
        return NextResponse.json({ error: aiResult.error }, { status: 500 });
      }

      const fallback = buildFallbackVisualContext(caption, imageUrl);
      const analyzed = aiResult && typeof aiResult === 'object' ? aiResult : fallback;

      return NextResponse.json({
        visualContext: { ...fallback, ...analyzed },
        ok: true,
      });
    }

    if (action === 'next-turn') {
      const topicText = userMessage || caption || 'general family chat';
      const aiResult = await requestOpenAIJSON(
        JSON.stringify({
          instruction: 'Generate a single next-family-message turn in JSON. Return speaker, message, messageType, replyTo, emotion, continueConversation, verdict. speaker must be one of sheela, anjali, soman, latha. The conversation is a Kerala family WhatsApp chat with natural English + Manglish + Malayalam flavor. Use the user message and current conversation context to decide who answers and how. Let the family talk to each other, disagree, tease, defend, or ask questions. Keep it harmless and lively. Do not generate endless scripts; stop naturally after 1-4 turns.',
          userMessage: topicText,
          caption,
          visualContext,
          conversationHistory: conversationHistory.slice(-10),
          previousSpeaker,
          style: 'Kerala family group chat, playful, light gossip, natural Manglish, no serious accusations, no harmful claims.',
        }),
      );

      if (aiResult && typeof aiResult === 'object' && 'error' in aiResult && aiResult.error) {
        const fallbackTurn = buildFallbackTurn({ visualContext, caption: caption || userMessage, conversationHistory, previousSpeaker });
        return NextResponse.json({
          ...fallbackTurn,
          ok: true,
        });
      }

      if (aiResult && aiResult.speaker && aiResult.message) {
        return NextResponse.json({
          ...aiResult,
          ok: true,
        });
      }

      const fallbackTurn = buildFallbackTurn({ visualContext, caption: caption || userMessage, conversationHistory, previousSpeaker });
      return NextResponse.json({
        ...fallbackTurn,
        ok: true,
      });
    }

    if (action === 'finalize-verdict') {
      const aiResult = await requestOpenAIJSON(
        JSON.stringify({
          instruction: 'Create a family verdict JSON object for this photo and conversation. Return title, summary, approvalRating, sheelaComment, anjaliComment, somanComment, lathaComment.',
          caption,
          visualContext,
          conversationHistory: conversationHistory.slice(-8),
          style: 'fun, harmless, family-gossip tone',
        }),
      );

      if (aiResult && typeof aiResult === 'object' && 'error' in aiResult && aiResult.error) {
        return NextResponse.json({ error: aiResult.error }, { status: 500 });
      }

      return NextResponse.json({
        verdict: aiResult && typeof aiResult === 'object' ? aiResult : buildFallbackVerdict(caption, visualContext),
        ok: true,
      });
    }

    return NextResponse.json({ ok: true, visualContext, message: 'No action provided' });
  } catch (error) {
    console.error('Family API error:', error);
    const fallbackCaption = typeof body?.caption === 'string' ? body.caption : typeof body?.userMessage === 'string' ? body.userMessage : '';
    const fallback = buildFallbackVisualContext(fallbackCaption, body?.imageUrl);
    return NextResponse.json({ ok: true, visualContext: fallback, message: 'Fallback triggered' });
  }
}
