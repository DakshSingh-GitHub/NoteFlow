const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const sourceSvg = path.join(__dirname, 'icon.svg');

const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const faviconSizes = [16, 32];
const appleTouchSize = 180;

async function writePng(size, outputName) {
  const outputPath = path.join(__dirname, outputName);
  await sharp(sourceSvg)
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

async function generate() {
  if (!fs.existsSync(sourceSvg)) {
    throw new Error(`Missing source SVG: ${sourceSvg}`);
  }

  await Promise.all(pwaSizes.map((size) => writePng(size, `icon-${size}x${size}.png`)));
  await Promise.all(faviconSizes.map((size) => writePng(size, `icon-${size}x${size}.png`)));
  await writePng(appleTouchSize, 'apple-touch-icon.png');

  console.log('Generated icon set from icon.svg');
  console.log('PWA icons:', pwaSizes.map((size) => `icon-${size}x${size}.png`).join(', '));
  console.log('Favicon icons: icon-16x16.png, icon-32x32.png');
  console.log('Apple icon: apple-touch-icon.png');
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
