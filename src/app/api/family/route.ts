import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FamilyConversationTurn, PersonaId, VisualContext } from '@/types/chat';

const PERSONA_ORDER: PersonaId[] = ['sheela', 'anjali', 'soman', 'latha'];

function buildFallbackVisualContext(caption: string, imageUrl?: string): VisualContext {
  const cap = caption.toLowerCase();
  const isGreeting = /(^(hi|hello|hey|hii|namaskaram|vanakkam)|how is everyone|how are you all|what are you all doing|what are you doing|good morning|good evening)/i.test(cap);
  const isPhotoTopic = /(photo|picture|image|look at this|see this|this pic|this photo|in the photo|in this picture|what happened today|look what happened)/i.test(cap);
  const signals = {
    tea: cap.includes('tea') || cap.includes('chai') || cap.includes('coffee') || cap.includes('kattan'),
    food: cap.includes('food') || cap.includes('biryani') || cap.includes('meal') || cap.includes('snack'),
    travel: cap.includes('trip') || cap.includes('travel') || cap.includes('beach') || cap.includes('resort') || cap.includes('wedding'),
    people: cap.includes('friend') || cap.includes('group') || cap.includes('family') || cap.includes('two') || cap.includes('team'),
  };

  const activities = [] as string[];
  if (!isGreeting && !isPhotoTopic && signals.tea) activities.push('drinking tea or coffee');
  if (!isGreeting && !isPhotoTopic && signals.food) activities.push('sharing food or snacks');
  if (!isGreeting && !isPhotoTopic && signals.travel) activities.push('travelling or relaxing together');
  if (signals.people) activities.push('socialising in a group');
  if (!activities.length) activities.push(isGreeting ? 'chatting naturally as a family' : 'posing together naturally');

  const objects = [] as string[];
  if (!isGreeting && !isPhotoTopic && signals.tea) objects.push('tea or coffee cups');
  if (!isGreeting && !isPhotoTopic && signals.food) objects.push('food or snacks');
  if (!isGreeting && !isPhotoTopic && signals.travel) objects.push('travel gear or scenic backdrop');
  if (!objects.length) objects.push(isGreeting ? 'everyday family conversation cues' : 'everyday household items');

  return {
    people: 2,
    visible_people_description: ['Two people are pictured together in a casual setting.'],
    setting: imageUrl ? 'Everyday family or social scene' : 'Casual group scene',
    objects,
    activities,
    food_or_drink: !isGreeting && !isPhotoTopic && (signals.tea || signals.food) ? ['tea', 'snacks', 'coffee'] : ['light refreshments'],
    notable_details: caption ? ['The current message provides the active conversation context.'] : ['No explicit caption provided.'],
    relationship_unknown: !isGreeting && !isPhotoTopic,
    social_context: isGreeting ? 'An ordinary family check-in with no special gossip behind it.' : 'A relaxed social moment with room for harmless family speculation.',
    gossip_potential: isGreeting ? 0.08 : isPhotoTopic ? 0.8 : 0.22,
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

function normalizeMessageText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function inferConversationContext({
  latestUserMessage,
  recentMessages,
  visualContext,
  caption,
}: {
  latestUserMessage: string;
  recentMessages: any[];
  visualContext?: VisualContext | null;
  caption?: string;
}) {
  const latestText = normalizeMessageText(latestUserMessage || caption || '');
  const recentText = recentMessages
    .filter((message) => typeof message?.content === 'string' && message.content.trim())
    .slice(-8)
    .map((message) => `${message.senderId}: ${message.content}`)
    .join(' ');

  const lastUserMessage = [...recentMessages].reverse().find((message) => message?.senderId === 'user')?.content ?? '';
  const lastUserText = normalizeMessageText(lastUserMessage);

  const greeting = /(hi|hello|hey|hii|namaskaram|vanakkam|good morning|good evening|how is everyone|how are you all)/i.test(latestText);
  const question = /(what|why|how|when|where|who|are you|is it|did|do you|can you)/i.test(latestText) || latestText.includes('?');
  const explicitPhotoReference = /(photo|picture|image|look at this|this pic|this photo|in the photo|in this picture|look what happened|what happened today|caption)/i.test(latestText);
  const topicChangeMarker = /(btw|by the way|anyway|also|now|today|tomorrow|exam|school|college|work|job|travel|movie|doctor|party|wedding)/i.test(latestText);
  const continuationRef = /(it|they|that|this|those|them|he|she|we)/i.test(latestText) && (/(exam|plan|trip|movie|meeting|party|appointment|doctor|school|college|work)/i.test(lastUserText) || /(exam|plan|trip|movie|meeting|party|appointment|doctor|school|college|work)/i.test(recentText));

  const photoRelevant = !!visualContext && (explicitPhotoReference || /look|see|this|that/.test(latestText) && /(photo|picture|image|scene|person|girl|guy|dress|food|tea)/i.test(latestText));
  const currentTopic =
    explicitPhotoReference && photoRelevant
      ? 'Photo discussion'
      : greeting
        ? 'Family greeting and check-in'
        : continuationRef
          ? 'Continuing the recent topic'
          : topicChangeMarker
            ? 'New topic or plan'
            : question
              ? 'Question about current situation'
              : 'General family chat';

  const userIntent = greeting
    ? 'greeting'
    : explicitPhotoReference && photoRelevant
      ? 'photo_discussion'
      : continuationRef
        ? 'continuation'
        : topicChangeMarker
          ? 'topic_change'
          : question
            ? 'question'
            : 'general_chat';

  const relevantRecentMessages = recentMessages
    .filter((message) => {
      if (!message || !message.content) return false;
      if (message.senderId === 'system') return false;
      if (message.senderId === 'user' && message.content === latestText) return false;
      return true;
    })
    .slice(-6);

  const unresolvedQuestions = relevantRecentMessages
    .filter((message) => typeof message.content === 'string' && /\?$/.test(message.content.trim()))
    .map((message) => message.content.trim());

  const gossipRelevant = !!visualContext && photoRelevant && (
    /(who is that|who is she|who is he|interesting|romance|girl|boy|cute|gossip|what happened)/i.test(latestText) ||
    (visualContext.gossip_potential > 0.55 && /(look|see|this|that|who|what)/i.test(latestText))
  );

  return {
    currentTopic,
    userIntent,
    topicChanged: !!lastUserText && lastUserText !== latestText && (topicChangeMarker || greeting || continuationRef),
    latestUserMessage: latestText,
    relevantRecentMessages,
    photoRelevant,
    gossipRelevant,
    unresolvedQuestions,
    activeCharacters: Array.from(new Set(recentMessages.filter((message) => message?.senderId && message.senderId !== 'user' && message.senderId !== 'system').map((message) => message.senderId as PersonaId))),
  };
}

function buildFallbackTurn({
  context,
  visualContext,
  caption,
  conversationHistory,
  previousSpeaker,
}: {
  context: ReturnType<typeof inferConversationContext>;
  visualContext: VisualContext;
  caption: string;
  conversationHistory: any[];
  previousSpeaker?: PersonaId | null;
}): FamilyConversationTurn {
  const speaker = getSpeakerForTurn(conversationHistory, previousSpeaker);
  const messageText = context.latestUserMessage || caption || 'hello';
  const isGreeting = context.userIntent === 'greeting';
  const isQuestion = context.userIntent === 'question';
  const isPhoto = context.userIntent === 'photo_discussion' || context.photoRelevant;
  const isTopicChange = context.userIntent === 'topic_change' || context.userIntent === 'continuation';

  const greetingTemplates: Record<PersonaId, string[]> = {
    sheela: [
      `Ayyoo, hello mone. Njangal ellam nannayittundu. Entha cheyyan aayi?`,
      `Haan, hello da. Family okke nannayirikkunnu. Enthu karyam?`,
      `Mone, welcome to the family chat. Njangal ellam here.`,
    ],
    anjali: [
      `Hiyaaa! We are all alive and mildly dramatic, as usual. What is the update?`,
      `Hello da 😂 we are all here. What happened now?`,
      `Aah, the family has been summoned. Tell us the real news, chetta.`,
    ],
    soman: [
      `Hello. Family is fine. What is the matter?`,
      `All good here. Tell us what you need.`,
      `Good to hear from you. We are all okay, just keep it simple.`,
    ],
    latha: [
      `mmm... hello, okay. Njangal ellam nannayirikkunnu. Enthu aayi?`,
      `Ayyo, no problem. We are all here. What is the story?`,
      `Namukkellam nannayittundu, mone. What is happening?`,
    ],
  };

  const questionTemplates: Record<PersonaId, string[]> = {
    sheela: [
      `Njangal ellam okay aanu. Enthu cheyyam? It is all fine, just keep it simple.`,
      `Family is doing fine, mone. Everything is calm for now.`,
      `Athu nannayanu. Need anything specific?`,
    ],
    anjali: [
      `We are all doing fine, just living our best low-stakes chaos.`,
      `Same old family energy. Nothing broken, very little sense.`,
      `We are surviving, which is the same as thriving in this family.`,
    ],
    soman: [
      `We are all doing okay. Nothing serious. Stay steady and keep things practical.`,
      `Not much to report. Just family life, warm and ordinary.`,
      `All good here. A little quiet, a little chaos, and that is normal.`,
    ],
    latha: [
      `mmm... nannayirikkunnu. Family is fine, just a little curious about the latest update.`,
      `Athu okay aanu. Njangal ellam good. What is going on?`,
      `No big drama. Just checking in, mone.`,
    ],
  };

  const topicTemplates: Record<PersonaId, string[]> = {
    sheela: [
      `Athu okay aanu. We can handle it. Tell us more, mone.`,
      `Njan paranjathinayi, okke. Let us focus on this properly.`,
      `Ithu nannayittundu. We will deal with it step by step.`,
    ],
    anjali: [
      `Aah, okay. So this is the actual topic now. We can absolutely make it dramatic, but we will keep it sensible.`,
      `Now we are talking. Good, this is a proper current topic.`,
      `Okay, so the story changed. We are doing this properly now.`,
    ],
    soman: [
      `This is the current matter, so we should address it directly and calmly.`,
      `Okay. Let us treat this as the real topic and not overcomplicate it.`,
      `This is the point we should focus on. Keep it practical and steady.`,
    ],
    latha: [
      `mmm... okay, now I understand the topic. So what exactly is happening?`,
      `Ah, this is the thing now. Tell us more, no need for mystery.`,
      `Now the actual story is clear. We are listening.`,
    ],
  };

  const photoTemplates: Record<PersonaId, string[]> = {
    sheela: [
      `Ayyoo, this is the actual scene. We can talk about what is visible and leave the rest alone.`,
      `Okay, this one makes sense. Let us focus on what is in front of us.`,
    ],
    anjali: [
      `Ah, now this is a real photo conversation. The vibe is visible, and I am not inventing drama beyond that.`,
      `This one is actually relevant. We are talking about the image, not random gossip.`,
    ],
    soman: [
      `This is the relevant context. We should respond to what is actually visible and not speculate too much.`,
      `Okay, this is the proper topic. Keep it grounded and practical.`,
    ],
    latha: [
      `mmm... now this makes sense. We will talk about the actual photo and the visible details.`,
      `Ah, this is the real context. No need to invent a story beyond what is there.`,
    ],
  };

  const templatePool = isGreeting ? greetingTemplates[speaker] : isQuestion ? questionTemplates[speaker] : isPhoto ? photoTemplates[speaker] : topicTemplates[speaker];
  const fallbackText = templatePool[(conversationHistory.length + speaker.length) % templatePool.length] ?? templatePool[0];

  return {
    speaker,
    message: fallbackText,
    messageType: 'text',
    replyTo: conversationHistory.at(-1)?.id ?? null,
    emotion: speaker === 'anjali' ? 'teasing' : speaker === 'soman' ? 'advice' : speaker === 'latha' ? 'curious' : 'warm',
    continueConversation: true,
  };
}

function shouldUseVisualContextForMessage(userMessage: string, caption: string, visualContext?: VisualContext | null): boolean {
  if (!visualContext) return false;

  const merged = `${userMessage} ${caption}`.toLowerCase();
  const text = normalizeMessageText(merged);
  const explicitPhotoReference = /(photo|picture|image|look at this|see this|this pic|this photo|in the photo|in this picture|what happened today|look what happened|caption)/i.test(text);
  const mentionRelatesToImage = /(look|see|this|that|scene|visible|picture|photo|image|dress|tea|food|travel)/i.test(text);
  const socialPrompt = /(who is that|who is she|who is he|cute|girl|boy|romance|gossip|interesting)/i.test(text);

  if (explicitPhotoReference && mentionRelatesToImage) return true;
  if (socialPrompt && visualContext.gossip_potential > 0.6) return true;
  return false;
}

function buildFallbackVerdict(caption: string, visualContext: VisualContext) {
  const summary = caption
    ? `The family verdict is that ${caption.trim()} was treated like a real thread in the family chat, but nobody is proving a scandal — just a harmless bit of chaos.`
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
  let body: any = {};

  try {
    body = await req.json();
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
      const relevantRecentMessages = Array.isArray(conversationHistory) ? conversationHistory.slice(-12) : [];
      const context = inferConversationContext({
        latestUserMessage: topicText,
        recentMessages: relevantRecentMessages,
        visualContext: shouldUseVisualContextForMessage(userMessage, caption, visualContext) ? visualContext : null,
        caption,
      });

      const aiResult = await requestOpenAIJSON(
        JSON.stringify({
          stage: 'context_analysis_and_response',
          instruction: 'Context priority order: 1) latest user message, 2) recent conversation, 3) active photo context only if relevant, 4) older conversation. Determine the current topic, intent, photo relevance, gossip relevance, and then generate one family reply. If the user greets the family, answer the greeting. If they ask a question, answer the question. If they change topic, follow the new topic. Do not continue old gossip or photo topics unless the current message clearly references them. Do not invent girl/romance/tea/snack assumptions unless they are explicitly present in current context.',
          context,
          recentConversation: relevantRecentMessages.slice(-8),
          latestUserMessage: topicText,
          photoContext: context.photoRelevant ? visualContext : null,
          previousSpeaker,
          style: 'Malayalam family WhatsApp, natural English + Manglish, warm and playful, no forced gossip, no random romance, no tea-shop assumptions.',
        }),
      );

      if (aiResult && typeof aiResult === 'object' && 'error' in aiResult && aiResult.error) {
        const fallbackTurn = buildFallbackTurn({
          context,
          visualContext: shouldUseVisualContextForMessage(userMessage, caption, visualContext) ? visualContext ?? buildFallbackVisualContext(topicText, imageUrl) : buildFallbackVisualContext(topicText, imageUrl),
          caption: topicText,
          conversationHistory,
          previousSpeaker,
        });
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

      const fallbackTurn = buildFallbackTurn({
        context,
        visualContext: shouldUseVisualContextForMessage(userMessage, caption, visualContext) ? visualContext ?? buildFallbackVisualContext(topicText, imageUrl) : buildFallbackVisualContext(topicText, imageUrl),
        caption: topicText,
        conversationHistory,
        previousSpeaker,
      });
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
