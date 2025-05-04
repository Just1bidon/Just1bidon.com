import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const width = searchParams.get("width") || "800";
  const height = searchParams.get("height") || "520";
  const format = searchParams.get("format") || "jpeg";

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiUrl = `http://46.202.131.91:3000/screenshot?url=${encodeURIComponent(url)}&width=${width}&height=${height}&format=${format}`;

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: "API error" }), {
        status: apiRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    const contentType = apiRes.headers.get("content-type") || "image/jpeg";
    const buffer = await apiRes.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Proxy error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 