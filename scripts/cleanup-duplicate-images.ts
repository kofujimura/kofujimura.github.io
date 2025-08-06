import { promises as fs } from 'fs';
import path from 'path';

async function findDuplicateImages(dir: string): Promise<string[]> {
  const duplicates: string[] = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      duplicates.push(...await findDuplicateImages(fullPath));
    } else {
      // Detect duplicate optimization patterns:
      // - Files with multiple size suffixes: *-320w-640w.*, *-1280w-1280w-1280w.*
      // - Files with multiple -optimized suffixes: *-optimized-optimized.*
      const isDuplicate = 
        /-\d+w-\d+w/i.test(item.name) || // Multiple size suffixes
        /-optimized-optimized/i.test(item.name) || // Multiple optimized suffixes
        /-optimized-\d+w/i.test(item.name) || // optimized + size suffix
        /-\d+w-optimized/i.test(item.name); // size + optimized suffix
      
      if (isDuplicate) {
        duplicates.push(fullPath);
      }
    }
  }
  
  return duplicates;
}

async function cleanupDuplicates() {
  const imagePaths = [
    'public/images',
    'public/wp-content/uploads'
  ];
  
  console.log('🧹 Starting duplicate image cleanup...');
  let totalDeleted = 0;
  
  for (const imagePath of imagePaths) {
    const fullPath = path.join(process.cwd(), imagePath);
    try {
      await fs.access(fullPath);
      console.log(`\n📂 Processing directory: ${imagePath}`);
      const duplicates = await findDuplicateImages(fullPath);
      
      console.log(`Found ${duplicates.length} duplicate files to remove`);
      
      for (const duplicate of duplicates) {
        try {
          await fs.unlink(duplicate);
          console.log(`  🗑️  Deleted: ${path.relative(process.cwd(), duplicate)}`);
          totalDeleted++;
        } catch (error) {
          console.error(`  ❌ Failed to delete ${duplicate}:`, error);
        }
      }
    } catch (error) {
      console.log(`Directory ${imagePath} not found, skipping...`);
    }
  }
  
  console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate files.`);
}

if (require.main === module) {
  cleanupDuplicates().catch(console.error);
}

export { cleanupDuplicates, findDuplicateImages };