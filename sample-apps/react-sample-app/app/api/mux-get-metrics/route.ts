export async function GET(
  req: Request,
) {
  const url = new URL(req.url);
  const videoId =
    url.searchParams.get('video_id');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'missing_video_id' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = Buffer.from(`${process.env.NEXT_MUX_ACCESS_TOKEN}:${process.env.NEXT_MUX_SECRET_KEY}`).toString('base64');

  const params = new URLSearchParams({
    'timeframe[]': '100:days',
    'filters[]': `video_id:${videoId}`,
    limit: '5',
  });

  const res = await fetch(`https://api.mux.com/data/v1/metrics/views/overall?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
  });

  const json = await res.json();

  return new Response(JSON.stringify({ metrics: json }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
