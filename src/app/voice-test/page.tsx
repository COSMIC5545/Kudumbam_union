"use client";

import { useState } from "react";

export default function VoiceTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function testVoice(character: string, text: string) {
    try {
      setLoading(character);
      setError("");

      const response = await fetch("/api/voice-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character,
          text,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Voice test failed");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setLoading(null);
      };

      await audio.play();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px",
        background: "#f7f1e8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          🎙️ Kudumbam Union Voice Test
        </h1>

        <p style={{ color: "#666", marginBottom: "35px" }}>
          Test the three Kerala family voices before connecting them to the
          main chat.
        </p>

        <button
          onClick={() =>
            testVoice(
              "sister",
              "Eda chetta, ithentha scene? You are getting suspicious alle? 😏"
            )
          }
          disabled={loading !== null}
          style={buttonStyle}
        >
          {loading === "sister" ? "🔊 Playing Sister..." : "👩 Sister"}
        </button>

        <button
          onClick={() =>
            testVoice(
              "aunty",
              "Njan veruthe chodichatha mone... but ee photo kandittu entho oru doubt undu. Mmm... 🤨"
            )
          }
          disabled={loading !== null}
          style={buttonStyle}
        >
          {loading === "aunty" ? "🔊 Playing Aunty..." : "👩 Aunty"}
        </button>

        <button
          onClick={() =>
            testVoice(
              "amma",
              "Ente mone aaruum onnum parayanda. Avan nalloru kutti aanu. ❤️"
            )
          }
          disabled={loading !== null}
          style={buttonStyle}
        >
          {loading === "amma" ? "🔊 Playing Amma..." : "👩 Amma"}
        </button>

        {error && (
          <pre
            style={{
              marginTop: "30px",
              padding: "20px",
              background: "#ffe5e5",
              color: "#a00",
              borderRadius: "12px",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </pre>
        )}
      </div>
    </main>
  );
}

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: "18px",
  marginBottom: "15px",
  border: "none",
  borderRadius: "14px",
  fontSize: "18px",
  cursor: "pointer",
  background: "#ffffff",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};