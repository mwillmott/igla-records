const http = require('http');

function fetchHtml(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const html = await fetchHtml('/tournaments/valencia-2026');
  if (!html) {
    console.log('Could not connect to server.');
    return;
  }

  console.log('--- Searching for Empty Pill Elements ---');
  
  // Simple regex to scan for tags with pill classes
  const pillRegex = /<[^>]*class="[^"]*(?:pill|status-pill)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/g;
  let match;
  let count = 0;
  
  while ((match = pillRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const content = match[1].trim();
    
    // We only care about pills that have no text or only whitespace
    const textOnly = content.replace(/<[^>]+>/g, '').trim();
    
    if (textOnly === '' && !content.includes('animate-pulse') && !content.includes('pill-bg')) {
      console.log(`\nFound potential empty pill ${++count}:`);
      console.log(`Tag: ${fullTag.slice(0, 150)}...`);
      console.log(`Inner Content: "${content}"`);
    }
  }

  if (count === 0) {
    console.log('No empty pill elements found in the raw HTML.');
  }
}

run();
