const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateRegularIcons() {
  try {
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Generated regular ${size}x${size} icon`);
    }
    console.log('All regular icons generated successfully!');
  } catch (error) {
    console.error('Error generating regular icons:', error);
  }
}

async function generateMaskableIcons() {
  try {
    for (const size of sizes) {
      // For maskable icons, we need to add padding to ensure the icon is properly displayed
      // when masked by different shapes (circle, rounded square, etc.)
      const padding = Math.floor(size * 0.1); // 10% padding
      const innerSize = size - (padding * 2);
      
      await sharp(sourceIcon)
        .resize(innerSize, innerSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .toFile(path.join(outputDir, `maskable-icon-${size}x${size}.png`));
      console.log(`Generated maskable ${size}x${size} icon`);
    }
    console.log('All maskable icons generated successfully!');
  } catch (error) {
    console.error('Error generating maskable icons:', error);
  }
}

async function generateAllIcons() {
  await generateRegularIcons();
  await generateMaskableIcons();
  console.log('All icons generated successfully!');
}

generateAllIcons(); 