import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

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

  let browser;
  try {
    console.log(`[PROXY-SCREENSHOT] Démarrage du screenshot pour: ${url}`);
    
    // Lancer le navigateur
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Configurer la taille de la fenêtre
    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
      deviceScaleFactor: 1,
    });

    // Aller sur la page avec un timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    // Prendre le screenshot
    const screenshot = await page.screenshot({
      type: format as 'png' | 'jpeg',
      quality: format === 'jpeg' ? 80 : undefined,
      fullPage: false
    });

    console.log(`[PROXY-SCREENSHOT] Screenshot réussi pour: ${url}`);

    return new Response(screenshot, {
      status: 200,
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=86400",
      },
    });

  } catch (e) {
    console.error(`[PROXY-SCREENSHOT] Erreur pour ${url}:`, e);
    
    let errorMessage = "Screenshot error";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: e instanceof Error ? e.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 