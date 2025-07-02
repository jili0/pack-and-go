import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // TODO: Hier Oracle Object Storage Upload implementieren
    // Beispiel: await uploadToOracleObjectStorage(file);
    // Die URL des gespeicherten Bildes könnte zurückgegeben werden

    // TODO: Oracle Vision & Gemini API aufrufen und Ergebnis holen
    // Beispiel: const aiResult = await analyzePhotoWithAI(fileUrl);

    // Beispielhafte Dummy-Antwort (Stub)
    return NextResponse.json({
      items: ["Sofa", "Tisch", "Stuhl", "Lampe"],
      materials: "5 Umzugskartons, 2 Rollen Luftpolsterfolie",
    });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
