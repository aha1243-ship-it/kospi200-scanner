import https from 'https';

const KIS_BASE = 'openapi.koreainvestment.com';

export default async (request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  try {
    const { path, method, body, reqHeaders } = await request.json();
    if (!path) {
      return new Response(JSON.stringify({ error: 'path required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: KIS_BASE,
        port: 9443,
        path,
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(reqHeaders || {}),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch(_) { resolve({ raw: data }); }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });

    return new Response(JSON.stringify(result), {
      status: 200, headers: corsHeaders
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: corsHeaders
    });
  }
};

export const config = { path: '/api/kis-proxy' };
