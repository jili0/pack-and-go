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
            text: "Analyze this image and categorize items into two groups: 1) FURNITURE: only furniture items (chairs, tables, shelves, etc.), 2) OTHERS: larger items like plants, lamps, but exclude small items like pillows and people. For each item, provide: description, name, count. Format as JSON with two arrays: 'furniture' and 'others'. Example: { 'furniture': [{'description': 'white', 'name': 'shelf', 'count': 1}], 'others': [{'description': 'green', 'name': 'plant', 'count': 2}] }",
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
    let furniture = [];
    let others = [];

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
        furniture = parsedData.furniture || [];
        others = parsedData.others || [];
      } else {
        console.log("No JSON found, using fallback parsing");
        // Fallback: parse text response manually
        const lines = textResponse.split("\n").filter((line) => line.trim());
        const furnitureMap = {};
        const othersMap = {};

        for (const line of lines) {
          if (line.includes(":")) {
            const [name, details] = line.split(":").map((s) => s.trim());
            if (name && details) {
              const countMatch = details.match(/\(x(\d+)\)/);
              const count = countMatch ? parseInt(countMatch[1]) : 1;
              const description = details.replace(/\(x\d+\)/, "").trim();

              // Simple categorization - could be improved
              const isFurniture = [
                "chair",
                "table",
                "shelf",
                "cabinet",
                "stool",
                "desk",
                "bed",
                "sofa",
                "armchair",
              ].includes(name.toLowerCase());

              if (isFurniture) {
                if (!furnitureMap[name]) {
                  furnitureMap[name] = { name, count: 0, description };
                }
                furnitureMap[name].count += count;
              } else {
                if (!othersMap[name]) {
                  othersMap[name] = { name, count: 0, description };
                }
                othersMap[name].count += count;
              }
            }
          }
        }
        furniture = Object.values(furnitureMap);
        others = Object.values(othersMap);
      }
      console.log("Final furniture array:", furniture);
      console.log("Final others array:", others);
      console.log("=== GEMINI RESPONSE DEBUG END ===");
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      furniture = [];
      others = [];
    }

    return NextResponse.json({ furniture, others });
  } catch (err) {
    console.error("Analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
