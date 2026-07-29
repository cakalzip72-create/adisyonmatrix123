// Sunucu tarafı Gemini istemcisi — API key asla client'a sızdırılmaz.
// Not: "gemini-2.5-flash" bu proje için artık yeni kullanıcılara kapalı (Google tarafında
// kaldırılmış), bu yüzden Google'ın önerdiği "gemini-flash-latest" takma adı kullanılıyor —
// bu da flash katmanı (düşük maliyetli) bir modele karşılık gelir.
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(GEMINI_API_KEY);

interface GenerateOptions {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function generateGeminiContent({ prompt, imageBase64, imageMimeType }: GenerateOptions) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY tanımlı değil.");
  }

  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: imageMimeType || "image/jpeg", data: imageBase64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API hatası (${res.status}): ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
  return text ?? "";
}
