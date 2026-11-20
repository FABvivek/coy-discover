import { NextRequest, NextResponse } from 'next/server';
import { getMessages, saveMessage, getInternalProfile, getCurrentUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PROFILE_REPLIES: Record<string, string[]> = {
  coy_1: [
    "Hey! So happy we matched! Love your bio :) Would love to get chai this weekend! Have you been to Blue Tokai in Hauz Khas?",
    "Haha yes! Let's definitely meet up for coffee and check out some records.",
  ],
  coy_2: [
    "Hey! Love your vibe. Sundays at Church Street are my favorite ritual. Would love to grab coffee!",
    "Totally agree! Let's plan something this weekend.",
  ],
  coy_3: [
    "Hey! Monsoon walks along Marine Drive are truly the best! Let's definitely meet up soon :)",
    "I'd love that! Fort has the cutest cafes too.",
  ],
  coy_4: [
    "Hey! Always happy to meet fellow Cubbon Park lovers. Up for an iced brew this week?",
    "Sounds great! Looking forward to it.",
  ],
  coy_5: [
    "Hey! So glad we matched. Always up for good filter kaapi and talking architecture! How's your week going?",
    "Terracotta architecture is so timeless. Would love to chat more over coffee!",
  ],
  coy_6: [
    "Hey! Thanks for saying hi :) Always happy to talk sourdough and music. How are you doing?",
    "I'm baking some sourdough boules tomorrow, wish I could send you one haha!",
  ],
  coy_8: [
    "Hey! Stepwells and brutalist buildings are so fascinating. Glad we connected!",
    "Let's grab a coffee and talk design!",
  ],
  coy_11: [
    "Hey! College street adda and cha is an emotion. So nice matching with you!",
    "College street book browsing this Sunday sounds perfect!",
  ],
  coy_14: [
    "Hey! So nice to connect! Early morning ocean swims and pottery keep me sane haha. How are you?",
    "Pondicherry is lovely right now. Hope you're having a calm week!",
  ],
  coy_15: [
    "Hey! 16mm film and Goan sunsets never get old. Happy we matched!",
    "Let's grab a drink sometime!",
  ],
  coy_16: [
    "Hey! Cardamom chai and good books are the best combination. Loved matching with you :)",
    "What book are you reading right now?",
  ],
  coy_19: [
    "Hey! Kathak rehearsals all day, so happy to see your message! How's your day going?",
    "Filter kaapi sounds wonderful! Let's plan something soon.",
  ],
  coy_24: [
    "Hey! Restoring antique teakwood in Colaba today. Hope you're having a good week!",
    "Colaba cafes are the best for long conversations. Let's go!",
  ],
  coy_27: [
    "Hey! Printing small riso zines today! So happy you said hi :)",
    "Sulaimani tea is the best! Let's grab some soon.",
  ],
  coy_31: [
    "Hey! Ragas and acoustics research keep me busy, but so glad we matched! How are you?",
    "Besant Nagar beach walks at sunset are so peaceful. Let's do that!",
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json({ error: 'targetId is required' }, { status: 400 });
    }

    const messages = getMessages(targetId);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.targetId || !body.text) {
      return NextResponse.json({ error: 'targetId and text are required' }, { status: 400 });
    }

    const { targetId, text } = body;
    const existingMessages = getMessages(targetId);

    // 1. Save user's message
    const userMessage = saveMessage(targetId, 'me', text);

    // 2. If this is the user's first message to this person (or they are continuing),
    // trigger a natural simulated reply after the user's message
    const replies = PROFILE_REPLIES[targetId] || [
      "Hey! So glad we matched :) Loved your profile. How is your week going?",
      "That sounds great! I'd love to chat more.",
    ];

    const replyIndex = Math.min(
      existingMessages.filter((m) => m.senderId !== 'me').length,
      replies.length - 1
    );
    const replyText = replies[replyIndex];

    // Save match's reply
    const replyMessage = saveMessage(targetId, targetId, replyText);

    const allMessages = getMessages(targetId);

    return NextResponse.json(
      {
        messages: allMessages,
        reply: replyMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
