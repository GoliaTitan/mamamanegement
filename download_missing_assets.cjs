const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: "strawberry-og.png", url: "https://mamamary.io/cdn/shop/files/STRAWBERRY00.png?v=1700671579" },
  { name: "white-widow.png", url: "https://mamamary.io/cdn/shop/files/WHITEWIDOW00.png?v=1700671478" },
  { name: "bubble-hash.jpg", url: "https://mamamary.io/cdn/shop/files/preview_images/07ae8c8ac0f64c3f824d474fc1cbd993.thumbnail.0000000000.jpg?v=1760272545" },
  { name: "gelato.png", url: "https://mamamary.io/cdn/shop/files/GELATO00.png?v=1700670987" },
  { name: "gelato41.png", url: "https://mamamary.io/cdn/shop/files/GELATOMAMAQ.png?v=1768752641" },
  { name: "day-cream.jpg", url: "https://mamamary.io/cdn/shop/products/Cannabis_Bakehouse_21062Medium.jpg?v=1669382905" },
  { name: "pax-plus.png", url: "https://mamamary.io/cdn/shop/files/Screenshot2023-11-10at16.40.10.png?v=1699630893" }
];

const downloadDir = path.join(__dirname, 'public', 'products');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
      reject(err);
    });
  });
}

async function start() {
    for (const img of images) {
        const targetPath = path.join(downloadDir, img.name);
        try {
            console.log(`Downloading ${img.name}...`);
            await downloadImage(img.url, targetPath);
            console.log(`Success: ${img.name}`);
        } catch (e) {
            console.error(`Error with ${img.name}: ${e.message}`);
        }
    }
}

start();
