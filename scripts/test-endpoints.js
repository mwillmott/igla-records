const http = require('http');

const urls = [
  '/results',
  '/tournaments',
  '/tournaments/valencia-2026',
  '/clubs',
  '/clubs/wh2o',
  '/clubs/btn', // club utilizing seeded default history
  '/athletes/a-mateo', // athlete 1 from seed
  '/admin'
];

function fetchUrl(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        // Set a mock admin session cookie if needed, or check public accessibility
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          headers: res.headers,
          length: data.length,
          snippet: data.slice(0, 500)
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, statusCode: 500, error: err.message });
    });

    req.end();
  });
}

async function runTests() {
  console.log('--- Testing App Local Routes ---');
  for (const url of urls) {
    const res = await fetchUrl(url);
    if (res.statusCode === 200) {
      console.log(`✅ ${res.path} -> 200 OK (${res.length} bytes)`);
      // check for critical rendering tags
      const hasG3 = res.snippet ? res.snippet.includes('view-enter') || res.snippet.includes('<body') : false;
      const hasTitle = res.snippet ? res.snippet.includes('<title>') : false;
    } else {
      console.log(`❌ ${res.path} -> ${res.statusCode} !! (${res.error || 'Check server logs'})`);
    }
  }
}

runTests();
