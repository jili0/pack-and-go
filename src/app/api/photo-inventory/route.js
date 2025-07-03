import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function analyzeImageWithGemini(base64Image, mimeType) {
  // Gemini Vision API endpoint (v1beta, as of 2024)
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    process.env.GEMINI_API_KEY;

  // Prepare image data for Base64
  const imageData = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };

  // The request body for Gemini Vision API
  const body = {
    contents: [
      {
        parts: [
          {
            text: "Analyze this image and list only furniture items you can see. For each furniture item, provide: 1) The furniture name, 2) A short description (1 word like 'white', 'black', 'wooden'), 3) Count (how many). Format as: 'furniture_name description x count'. Example: 'cardboard box white x 7'. Exclude people, plants, and non-furniture items. Format as JSON with objects array containing name, description, and count fields.",
          },
          imageData,
        ],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini API error:", errorText);
    throw new Error("Gemini Vision API error");
  }

  return await res.json();
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64 for direct Gemini API call
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // Analyze image with Gemini Vision API
    const geminiResult = await analyzeImageWithGemini(base64Image, file.type);

    // Extract object information from Gemini response
    let items = [];

    try {
      // Try to parse JSON from Gemini's text response
      const textResponse =
        geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "";

      console.log("=== GEMINI RESPONSE DEBUG ===");
      console.log("Raw Gemini response:", geminiResult);
      console.log("Text response:", textResponse);

      // Look for JSON in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON data:", parsedData);
        items = parsedData.furniture || parsedData.objects || [];
      } else {
        console.log("No JSON found, using fallback parsing");
        // Fallback: parse text response manually
        const lines = textResponse.split("\n").filter((line) => line.trim());
        const itemMap = {};

        for (const line of lines) {
          if (line.includes(":")) {
            const [name, details] = line.split(":").map((s) => s.trim());
            if (name && details) {
              const countMatch = details.match(/\(x(\d+)\)/);
              const count = countMatch ? parseInt(countMatch[1]) : 1;
              const description = details.replace(/\(x\d+\)/, "").trim();

              if (!itemMap[name]) {
                itemMap[name] = { name, count: 0, description };
              }
              itemMap[name].count += count;
            }
          }
        }
        items = Object.values(itemMap);
      }
      console.log("Final items array:", items);
      console.log("=== GEMINI RESPONSE DEBUG END ===");
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      items = [
        {
          name: "Objects detected",
          count: 1,
          description: "Analysis completed",
        },
      ];
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
