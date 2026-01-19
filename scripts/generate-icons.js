const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 512, name: 'icon-512x512.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 180, name: 'apple-touch-icon-180.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
];

const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('Generating icons from logo.png...');
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);
    
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Generate favicon
  try {
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(publicDir, 'favicon-32.png'));
    console.log('✓ Generated favicon-32.png');
  } catch (error) {
    console.error('✗ Failed to generate favicon:', error.message);
  }
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
