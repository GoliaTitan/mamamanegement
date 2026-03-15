const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { name: "pax-2.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/files/P2blackinhand_600x600_81a16a64-5c72-434c-a54d-f3923472566c.png?v=1694865658" },
  { name: "party-e.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/HappyCaps_Party-e_MockupLarge.jpg?v=1669382428" },
  { name: "strawberry-og.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/strawberry-og.jpg" },
  { name: "white-widow.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/white-widow.jpg" },
  { name: "sleep-gummies.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/files/sleep_gummies_4web.png?v=1754828187" },
  { name: "bubble-hash.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/bubble-hash.jpg" },
  { name: "pax-plus.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/pax-plus.jpg" },
  { name: "gelato.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/gelato.jpg" },
  { name: "relax-e.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/HappyCaps_Relax-e_MockupLarge.jpg?v=1669382431" },
  { name: "cassata.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/cassata.png?v=1674036410" },
  { name: "amnesia-auto.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/files/amnesia-auto-final.png?v=1714671674" },
  { name: "olio-mint.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/files/mamaoil10_mint.png?v=1711213931" },
  { name: "gelato41.png", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/gelato41.png" },
  { name: "day-cream.jpg", url: "https://cdn.shopify.com/s/files/1/2776/2484/products/day-cream.jpg" }
];

const downloadDir = path.join(__dirname, 'public', 'products');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          // Handle redirects
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
