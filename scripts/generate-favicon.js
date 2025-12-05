import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import svg2img from 'svg2img';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const svg2imgAsync = promisify(svg2img);

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgContent = fs.readFileSync(path.join(__dirname, '../public/store-icon.svg'), 'utf8');
    
    // Convert SVG to PNG buffer with 32x32 dimensions
    const pngBuffer = await svg2imgAsync(svgContent, {
      width: 32,
      height: 32
    });

    // Write the PNG buffer to file
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), pngBuffer);
    // console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon(); 