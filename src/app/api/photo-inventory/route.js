import { NextResponse } from "next/server";
import { uploadToOracleObjectStorage } from "@/lib/fileUpload";

export const runtime = "nodejs";

async function analyzeImageWithGemini(imageUrl) {
  // Gemini Vision API endpoint (v1beta, as of 2024)
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:analyzeImage?key=" +
    process.env.GEMINI_API_KEY;

  // The request body for Gemini Vision API
  const body = {
    image: { url: imageUrl },
    features: ["LABEL_DETECTION", "IMAGE_PROPERTIES"],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Gemini Vision API error");
  return await res.json();
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Upload image to Oracle Object Storage
    const imageUrl = await uploadToOracleObjectStorage(file, "photo-inventory");

    // 2. Analyze image with Gemini Vision API
    const geminiResult = await analyzeImageWithGemini(imageUrl);

    // 3. Extract object names, counts, and attributes (color, material, etc.)
    // The structure of geminiResult depends on the API; adjust as needed
    const labelMap = {};
    if (geminiResult.labels) {
      for (const label of geminiResult.labels) {
        const name =
          label.description || label.name || label.label || "Unknown";
        const attributes = [];
        if (label.color) attributes.push(label.color);
        if (label.material) attributes.push(label.material);
        if (label.attributes) attributes.push(...label.attributes);
        const desc = attributes.filter(Boolean).join(", ");
        if (!labelMap[name]) {
          labelMap[name] = { name, count: 1, description: desc };
        } else {
          labelMap[name].count++;
        }
      }
    }
    // Fallback: if Gemini returns a different structure
    if (
      !geminiResult.labels &&
      geminiResult.responses &&
      geminiResult.responses[0]?.labelAnnotations
    ) {
      for (const label of geminiResult.responses[0].labelAnnotations) {
        const name =
          label.description || label.name || label.label || "Unknown";
        const desc = label.properties
          ? label.properties.map((p) => p.value).join(", ")
          : "";
        if (!labelMap[name]) {
          labelMap[name] = { name, count: 1, description: desc };
        } else {
          labelMap[name].count++;
        }
      }
    }
    const items = Object.values(labelMap);

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload or analysis failed" },
      { status: 500 }
    );
  }
}
