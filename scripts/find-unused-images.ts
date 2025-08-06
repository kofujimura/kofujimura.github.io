import { promises as fs } from 'fs';
import path from 'path';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  featuredImageUrl?: string;
  [key: string]: any;
}

interface Page {
  title: string;
  content: string;
  [key: string]: any;
}

interface Attachment {
  guid: {
    rendered: string;
  };
  source_url: string;
  [key: string]: any;
}

async function loadJsonData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`Could not load ${filePath}:`, error);
    return [];
  }
}

async function findAllImages(dir: string): Promise<string[]> {
  const images: string[] = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        images.push(...await findAllImages(fullPath));
      } else if (/\.(png|jpe?g|gif|webp|avif)$/i.test(item.name)) {
        // Skip already optimized variants to avoid counting duplicates
        const isOptimizedVariant = /-\d+w\.(png|jpe?g|webp|avif)$/i.test(item.name) || 
                                 /-optimized\.(png|jpe?g)$/i.test(item.name);
        
        if (!isOptimizedVariant) {
          images.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.log(`Could not read directory ${dir}:`, error);
  }
  
  return images;
}

function extractImagePaths(content: string): string[] {
  const imagePaths: string[] = [];
  
  // Pattern 1: /wp-content/uploads/... paths
  const wpContentRegex = /\/wp-content\/uploads\/[^"'\s)]+\.(png|jpe?g|gif|webp|avif)/gi;
  const wpContentMatches = content.match(wpContentRegex);
  if (wpContentMatches) {
    imagePaths.push(...wpContentMatches);
  }
  
  // Pattern 2: /images/... paths  
  const imagesRegex = /\/images\/[^"'\s)]+\.(png|jpe?g|gif|webp|avif)/gi;
  const imagesMatches = content.match(imagesRegex);
  if (imagesMatches) {
    imagePaths.push(...imagesMatches);
  }
  
  // Pattern 3: Full URLs with web.fujimura.com
  const fullUrlRegex = /https:\/\/web\.fujimura\.com\/wp-content\/uploads\/[^"'\s)]+\.(png|jpe?g|gif|webp|avif)/gi;
  const fullUrlMatches = content.match(fullUrlRegex);
  if (fullUrlMatches) {
    // Convert full URLs to relative paths
    imagePaths.push(...fullUrlMatches.map(url => url.replace('https://web.fujimura.com', '')));
  }
  
  // Pattern 4: src attributes in img tags
  const imgSrcRegex = /<img[^>]+src=["']([^"']+\.(png|jpe?g|gif|webp|avif))[^"']*["']/gi;
  let match;
  while ((match = imgSrcRegex.exec(content)) !== null) {
    let imgPath = match[1];
    // Convert full URLs to relative paths
    if (imgPath.startsWith('https://web.fujimura.com')) {
      imgPath = imgPath.replace('https://web.fujimura.com', '');
    }
    imagePaths.push(imgPath);
  }
  
  return imagePaths;
}

async function findUsedImages(): Promise<Set<string>> {
  const usedImages = new Set<string>();
  
  console.log('🔍 Analyzing blog posts...');
  
  // Load blog posts
  const posts = await loadJsonData<BlogPost>('src/data/posts.json');
  console.log(`Found ${posts.length} blog posts`);
  
  for (const post of posts) {
    // Check content
    const contentImages = extractImagePaths(post.content || '');
    contentImages.forEach(img => usedImages.add(img));
    
    // Check featured image
    if (post.featuredImageUrl) {
      let featuredImg = post.featuredImageUrl;
      if (featuredImg.startsWith('https://web.fujimura.com')) {
        featuredImg = featuredImg.replace('https://web.fujimura.com', '');
      }
      usedImages.add(featuredImg);
    }
  }
  
  console.log('📄 Analyzing pages...');
  
  // Load pages
  const pages = await loadJsonData<Page>('src/data/pages.json');
  console.log(`Found ${pages.length} pages`);
  
  for (const page of pages) {
    const pageImages = extractImagePaths(page.content || '');
    pageImages.forEach(img => usedImages.add(img));
  }
  
  console.log('📎 Analyzing attachments...');
  
  // Load attachments (these are typically referenced)
  const attachments = await loadJsonData<Attachment>('src/data/attachments.json');
  console.log(`Found ${attachments.length} attachments`);
  
  for (const attachment of attachments) {
    if (attachment.source_url) {
      let url = attachment.source_url;
      if (url.startsWith('https://web.fujimura.com')) {
        url = url.replace('https://web.fujimura.com', '');
      }
      usedImages.add(url);
    }
  }
  
  // Also check generated HTML files if they exist
  console.log('🌐 Checking generated HTML files...');
  
  try {
    const outDir = 'out';
    const htmlFiles = await findHtmlFiles(outDir);
    
    for (const htmlFile of htmlFiles) {
      const content = await fs.readFile(htmlFile, 'utf8');
      const htmlImages = extractImagePaths(content);
      htmlImages.forEach(img => usedImages.add(img));
    }
    
    console.log(`Checked ${htmlFiles.length} HTML files`);
  } catch (error) {
    console.log('No generated HTML files found (run build first for complete analysis)');
  }
  
  return usedImages;
}

async function findHtmlFiles(dir: string): Promise<string[]> {
  const htmlFiles: string[] = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        htmlFiles.push(...await findHtmlFiles(fullPath));
      } else if (item.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  
  return htmlFiles;
}

function normalizeImagePath(imagePath: string): string {
  // Remove leading slash and normalize separators
  return imagePath.replace(/^\/+/, '').replace(/\\/g, '/');
}

function arePathsEquivalent(filePath: string, referencePath: string): boolean {
  const normalizedFile = normalizeImagePath(filePath);
  const normalizedRef = normalizeImagePath(referencePath);
  
  // Direct match
  if (normalizedFile === normalizedRef) {
    return true;
  }
  
  // Check if file path ends with reference path (for cases like public/wp-content/... vs /wp-content/...)
  if (normalizedFile.endsWith(normalizedRef) || normalizedRef.endsWith(normalizedFile)) {
    return true;
  }
  
  return false;
}

async function findUnusedImages() {
  console.log('🧹 Finding unused images in uploads directory...\n');
  
  // Find all used images
  const usedImagePaths = await findUsedImages();
  console.log(`\n📊 Found ${usedImagePaths.size} image references in content`);
  
  // Find all actual image files
  console.log('\n📁 Scanning image directories...');
  
  const uploadsDir = 'public/wp-content/uploads';
  const imagesDir = 'public/images';
  
  let allImages: string[] = [];
  
  try {
    const uploadsImages = await findAllImages(uploadsDir);
    console.log(`Found ${uploadsImages.length} images in ${uploadsDir}`);
    allImages.push(...uploadsImages);
  } catch (error) {
    console.log(`Could not scan ${uploadsDir}`);
  }
  
  try {
    const publicImages = await findAllImages(imagesDir);
    console.log(`Found ${publicImages.length} images in ${imagesDir}`);
    allImages.push(...publicImages);
  } catch (error) {
    console.log(`Could not scan ${imagesDir}`);
  }
  
  console.log(`\n📈 Total images found: ${allImages.length}`);
  
  // Find unused images
  const unusedImages: string[] = [];
  
  for (const imageFile of allImages) {
    const relativePath = imageFile.replace(/^public\//, '/');
    let isUsed = false;
    
    for (const usedPath of usedImagePaths) {
      if (arePathsEquivalent(relativePath, usedPath)) {
        isUsed = true;
        break;
      }
    }
    
    if (!isUsed) {
      unusedImages.push(imageFile);
    }
  }
  
  console.log(`\n🗑️  Unused images found: ${unusedImages.length}`);
  
  if (unusedImages.length > 0) {
    console.log('\n📋 List of unused images:');
    unusedImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img}`);
    });
    
    // Calculate total size
    let totalSize = 0;
    for (const img of unusedImages) {
      try {
        const stat = await fs.stat(img);
        totalSize += stat.size;
      } catch (error) {
        // File might not exist
      }
    }
    
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n💾 Total size of unused images: ${sizeMB} MB`);
    
    console.log('\n⚠️  To delete these images, run: npm run delete-unused-images');
  } else {
    console.log('\n✅ No unused images found! All images are being used.');
  }
  
  return unusedImages;
}

async function deleteUnusedImages() {
  console.log('🗑️  Deleting unused images...\n');
  
  const unusedImages = await findUnusedImages();
  
  if (unusedImages.length === 0) {
    return;
  }
  
  let deletedCount = 0;
  let failedCount = 0;
  
  for (const imagePath of unusedImages) {
    try {
      await fs.unlink(imagePath);
      console.log(`  ✅ Deleted: ${imagePath}`);
      deletedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to delete ${imagePath}:`, error);
      failedCount++;
    }
  }
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`  ✅ Deleted: ${deletedCount} images`);
  if (failedCount > 0) {
    console.log(`  ❌ Failed: ${failedCount} images`);
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  if (command === 'delete') {
    await deleteUnusedImages();
  } else {
    await findUnusedImages();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { findUnusedImages, deleteUnusedImages };