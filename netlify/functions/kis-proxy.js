bash

cat /mnt/user-data/outputs/kospi200/netlify/functions/kis-proxy.js
출력

const https = require('https');

const KIS_BASE = 'openapi.koreainvestment.com';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, authorization, appkey, appsecret, tr_id, custtype',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { path, method, body, reqHeaders } = JSON.parse(event.body || '{}');
    if (!path) return { statusCode: 400, headers, body: JSON.stringify({ error: 'path required' }) };

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

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
완료
