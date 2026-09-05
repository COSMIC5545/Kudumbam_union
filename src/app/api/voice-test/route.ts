import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { character, text } = await request.json();

    const voiceMap: Record<string, string | undefined> = {
      sister: process.env.ELEVENLABS_SISTER_VOICE_ID,
      aunty: process.env.ELEVENLABS_AUNTY_VOICE_ID,
      amma: process.env.ELEVENLABS_AMMA_VOICE_ID,
    };
    const voiceId = voiceMap[character];

    if (!voiceId) {
      return NextResponse.json(
        { error: `No voice ID configured for ${character}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_v3",
          output_format: "mp3_44100_128",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: `ElevenLabs error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Voice test error:", error);

    return NextResponse.json(
      { error: "Voice generation failed" },
      { status: 500 }
    );
  }
}