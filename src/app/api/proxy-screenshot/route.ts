import { NextRequest } from "next/server";

// Configuration de l'API WebScreenshot
const WEBSCREENSHOT_API_URL = process.env.WEBSCREENSHOT_API_URL || "http://localhost:3001";
const WEBSCREENSHOT_TOKEN = process.env.WEBSCREENSHOT_TOKEN;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const width = searchParams.get("width") || "800";
  const height = searchParams.get("height") || "520";
  const format = searchParams.get("format") || "jpeg";
  const force = searchParams.get("force") === "true";

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!WEBSCREENSHOT_TOKEN) {
    console.error("[PROXY-SCREENSHOT] Token WebScreenshot manquant");
    return new Response(JSON.stringify({ 
      error: "Configuration error - Missing API token" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log(`[PROXY-SCREENSHOT] Démarrage du screenshot pour: ${url}`);
    
    // Construire l'URL de l'API WebScreenshot
    const apiParams = new URLSearchParams({
      url,
      width,
      height,
      format,
      removeBackdrops: "true", // Active la suppression automatique des popups
      wait: "2000", // Attente par défaut
    });

    if (force) {
      apiParams.set("force", "true");
    }

    const apiUrl = `${WEBSCREENSHOT_API_URL}/screenshot?${apiParams.toString()}`;

    // Appel à l'API WebScreenshot avec authentification
    const apiRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${WEBSCREENSHOT_TOKEN}`,
      },
      // Timeout de 30 secondes pour l'API externe
      signal: AbortSignal.timeout(30000),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error(`[PROXY-SCREENSHOT] Erreur API WebScreenshot: ${apiRes.status} ${apiRes.statusText}`, errorText);
      
      return new Response(JSON.stringify({ 
        error: "WebScreenshot API error", 
        status: apiRes.status,
        statusText: apiRes.statusText,
        details: errorText
      }), {
        status: apiRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Récupérer l'image
    const imageBuffer = await apiRes.arrayBuffer();
    const contentType = apiRes.headers.get("content-type") || `image/${format}`;

    console.log(`[PROXY-SCREENSHOT] Screenshot réussi pour: ${url} (${imageBuffer.byteLength} bytes)`);

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });

  } catch (e) {
    console.error(`[PROXY-SCREENSHOT] Erreur pour ${url}:`, e);
    
    let errorMessage = "Proxy error";
    if (e instanceof Error) {
      if (e.name === 'TimeoutError') {
        errorMessage = "Timeout - L'API WebScreenshot ne répond pas";
      } else {
        errorMessage = e.message;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: e instanceof Error ? e.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 