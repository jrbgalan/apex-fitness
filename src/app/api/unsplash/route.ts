import { NextResponse } from 'next/server';

const FALLBACK_KEY = 'b9EG__Cy4cafxm2GzruCt6XY40ZiBc2lJnXUAPn4kgA';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'gym interior';
  const count = searchParams.get('count') || '6';

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || FALLBACK_KEY;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        next: { revalidate: 86400 }, // Cache on server for 24 hours
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: res.status });
    }

    const data = await res.json();
    const photos = (data.results || []).map((item: any) => ({
      id: item.id,
      url: `${item.urls.raw}&w=1200&q=80&auto=format`,
      thumb: `${item.urls.raw}&w=400&q=70&auto=format`,
      alt: item.alt_description || item.description || query,
      photographer: item.user.name,
      photographerUrl: item.user.links.html,
    }));

    return NextResponse.json({ photos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

