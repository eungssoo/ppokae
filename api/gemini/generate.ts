export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || '';
  const allowedOrigins = [
    'https://ppokae.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ];

  // Match allowed origin or default to main domain
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed)) || !origin;
  const allowOriginHeader = isAllowed && origin ? origin : 'https://ppokae.vercel.app';

  // Security & CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowOriginHeader);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const headerKey = req.headers['x-gemini-api-key'];
      const apiKey = headerKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();
      return res.status(listRes.status).json(listData);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { model = 'gemini-2.0-flash', payload, apiKey: bodyApiKey } = req.body || {};
    const headerKey = req.headers['x-gemini-api-key'];
    const apiKey = headerKey || bodyApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured. Please register your Gemini API Key in Admin Center or Vercel Environment Variables.' 
      });
    }

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const googleRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const googleData = await googleRes.json();

    if (!googleRes.ok) {
      const errMsg = googleData?.error?.message || '';
      if (errMsg.includes('leaked') || googleRes.status === 403) {
        return res.status(403).json({
          error: 'Google에 의해 해당 Gemini API 키가 만료/차단되었습니다. 관리자 사령탑에서 새 API 키를 등록하거나 aistudio.google.com에서 무료 발급받아 등록해 주세요.'
        });
      }
    }

    return res.status(googleRes.status).json(googleData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Proxy Error' });
  }
}
