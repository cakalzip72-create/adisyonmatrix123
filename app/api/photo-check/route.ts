import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, isGeminiConfigured } from "@/lib/gemini";

const PROMPT = `Bu görsel bir restoran/kafe menüsüne eklenecek bir ürün fotoğrafı olarak yükleniyor.
Görseli değerlendir: gerçek bir yiyecek/içecek ürün fotoğrafı mı, yoksa uygunsuz/alakasız/sahte bir görsel mi
(ekran görüntüsü, çizim, telif hakkı ihlali olabilecek üçüncü taraf logosu, uygunsuz içerik, boş/bulanık görsel vb.)?
Sadece şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"approved": true|false, "reason": "kısa Türkçe açıklama"}`;

export async function POST(req: NextRequest) {
  if (!isGeminiConfigured) {
    return NextResponse.json({ approved: true, reason: "Gemini yapılandırılmamış — kontrol atlandı.", skipped: true });
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 gerekli" }, { status: 400 });
    }

    const text = await generateGeminiContent({ prompt: PROMPT, imageBase64, imageMimeType: mimeType });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ approved: true, reason: "Model beklenmeyen yanıt verdi, kontrol atlandı." });
    }
    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ approved: Boolean(parsed.approved), reason: String(parsed.reason ?? "") });
  } catch (err) {
    return NextResponse.json(
      { approved: true, reason: `Güvenlik taraması yapılamadı (${err instanceof Error ? err.message : "bilinmeyen hata"}), kontrol atlandı.` },
      { status: 200 }
    );
  }
}
