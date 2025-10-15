import { NextRequest, NextResponse } from 'next/server';

// Simple image proxy to avoid CORS/hotlinking issues
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      // Spoof a reasonable referer and UA; some CDNs require it
      headers: {
        'User-Agent': 'GB-CMS/1.0 (+https://example.local)'
      },
      // Revalidate periodically
      cache: 'no-store'
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Allow caching by browser/CDN if desired
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (err) {
    return new NextResponse('Proxy fetch failed', { status: 500 });
  }
}


