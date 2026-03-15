const fs = require('fs');
const https = require('https');
const path = require('path');

const missingProducts = [
  { name: "strawberry-og.jpg", pageUrl: "https://mamamary.io/products/strawberry-og-cbd-thc-legale" },
  { name: "white-widow.jpg", pageUrl: "https://mamamary.io/products/white-widow" },
  { name: "bubble-hash.jpg", pageUrl: "https://mamamary.io/products/special-bubble-hash-super-strong-formula" },
  { name: "gelato.jpg", pageUrl: "https://mamamary.io/products/gelato-italiano-cbd-thc-roma" },
  { name: "day-cream.jpg", pageUrl: "https://mamamary.io/products/crema-viso-giorno-alla-canapa-100mg-cbd-50ml" },
  { name: "gelato41.png", pageUrl: "https://mamamary.io/products/gelato" },
  { name: "pax-plus.jpg", pageUrl: "https://mamamary.io/products/pax-plus" }
];

const downloadDir = path.join(__dirname, 'public', 'products');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).href;
          return fetchHtml(redirectUrl).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractOgImage(html) {
  const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (match && match[1]) {
    let url = match[1];
    if (url.startsWith('//')) url = 'https:' + url;
    // remove query params from image url if needed, but not necessary
    return url;
  }
  return null;
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).href;
          return downloadImage(redirectUrl, dest).then(resolve).catch(reject);
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const item of missingProducts) {
    console.log(`Processing ${item.name}...`);
    try {
      const html = await fetchHtml(item.pageUrl);
      const imgUrl = extractOgImage(html);
      if (imgUrl) {
        console.log(`Found image URL for ${item.name}: ${imgUrl}`);
        await downloadImage(imgUrl, path.join(downloadDir, item.name));
        console.log(`Successfully downloaded ${item.name}`);
      } else {
        console.log(`Could not find og:image for ${item.name}`);
      }
    } catch (e) {
      console.log(`Error processing ${item.name}: ${e.message}`);
    }
  }
}

run();
