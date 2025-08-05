import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageOptimizationConfig {
  quality: number;
  sizes: number[];
  formats: ('webp' | 'avif' | 'png' | 'jpeg')[];
}

const config: ImageOptimizationConfig = {
  quality: 80,
  sizes: [320, 640, 960, 1280, 1920], // Responsive breakpoints
  formats: ['webp', 'avif', 'png'] // Modern formats first, fallback to original
};

async function findImages(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await findImages(fullPath));
    } else if (/\.(png|jpe?g)$/i.test(item.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function optimizeImage(inputPath: string): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();
  const basePath = inputPath.slice(0, -ext.length);
  const relativePath = path.relative(process.cwd(), inputPath);
  
  console.log(`Optimizing: ${relativePath}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      console.log(`  Skipping: No metadata for ${relativePath}`);
      return;
    }
    
    // Calculate appropriate sizes (don't upscale)
    const targetSizes = config.sizes.filter(size => size <= Math.max(metadata.width, metadata.height));
    if (targetSizes.length === 0) {
      targetSizes.push(Math.max(metadata.width, metadata.height));
    }
    
    for (const format of config.formats) {
      for (const size of targetSizes) {
        const outputPath = `${basePath}-${size}w.${format}`;
        
        // Skip if already exists and is newer
        try {
          const inputStat = await fs.stat(inputPath);
          const outputStat = await fs.stat(outputPath);
          if (outputStat.mtime > inputStat.mtime) {
            continue;
          }
        } catch {
          // File doesn't exist, continue with optimization
        }
        
        let processor = image.clone().resize(size, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        });
        
        if (format === 'webp') {
          processor = processor.webp({ quality: config.quality });
        } else if (format === 'avif') {
          processor = processor.avif({ quality: config.quality });
        } else if (format === 'png') {
          processor = processor.png({ quality: config.quality, compressionLevel: 9 });
        } else if (format === 'jpeg') {
          processor = processor.jpeg({ quality: config.quality });
        }
        
        await processor.toFile(outputPath);
        
        const originalSize = (await fs.stat(inputPath)).size;
        const optimizedSize = (await fs.stat(outputPath)).size;
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  Created: ${path.relative(process.cwd(), outputPath)} (${savings}% smaller)`);
      }
    }
    
    // Also create an optimized version of the original
    const originalFormat = ext.slice(1) as 'png' | 'jpeg';
    const optimizedOriginal = `${basePath}-optimized${ext}`;
    
    let processor = image.clone();
    if (originalFormat === 'png') {
      processor = processor.png({ quality: config.quality, compressionLevel: 9 });
    } else {
      processor = processor.jpeg({ quality: config.quality });
    }
    
    await processor.toFile(optimizedOriginal);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const optimizedSize = (await fs.stat(optimizedOriginal)).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  Optimized original: ${path.relative(process.cwd(), optimizedOriginal)} (${savings}% smaller)`);
    
  } catch (error) {
    console.error(`  Error processing ${relativePath}:`, error);
  }
}

async function main() {
  const imagePaths = [
    'public/images',
    'public/wp-content/uploads'
  ];
  
  console.log('Starting image optimization...');
  
  for (const imagePath of imagePaths) {
    const fullPath = path.join(process.cwd(), imagePath);
    try {
      await fs.access(fullPath);
      console.log(`\nProcessing directory: ${imagePath}`);
      const images = await findImages(fullPath);
      
      console.log(`Found ${images.length} images to process`);
      
      for (const image of images) {
        await optimizeImage(image);
      }
    } catch (error) {
      console.log(`Directory ${imagePath} not found, skipping...`);
    }
  }
  
  console.log('\nImage optimization complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { optimizeImage, findImages };