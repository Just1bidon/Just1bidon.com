import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 500 });
    }
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;

    // Favicon
    let favicon = null;
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i);
    if (faviconMatch) {
      const hrefMatch = faviconMatch[0].match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        favicon = hrefMatch[1].startsWith('http') ? hrefMatch[1] : new URL(hrefMatch[1], url).href;
      }
    } else {
      // Fallback: /favicon.ico
      try {
        const testFavicon = new URL('/favicon.ico', url).href;
        favicon = testFavicon;
      } catch {
        favicon = null;
      }
    }

    // Domaine
    const hostname = new URL(url).hostname;

    return NextResponse.json({ title, favicon, hostname });
  } catch (e) {
    return NextResponse.json({ error: 'Error fetching or parsing site', details: (e as Error).message }, { status: 500 });
  }
} 