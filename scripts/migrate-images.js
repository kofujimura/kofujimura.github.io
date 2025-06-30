#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// WordPress画像をローカルにダウンロードし、JSONファイルのURLを更新するスクリプト

const BASE_URL = 'https://web.fujimura.com';
const DOWNLOAD_DIR = path.join(process.cwd(), 'public');
const ATTACHMENTS_FILE = path.join(process.cwd(), 'src/data/attachments.json');
const POSTS_FILE = path.join(process.cwd(), 'src/data/posts.json');

// ディレクトリを作成
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// ファイルをダウンロード
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const outputDir = path.dirname(outputPath);
    ensureDir(outputDir);

    const file = fs.createWriteStream(outputPath);
    
    const request = client.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${url} -> ${outputPath}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // リダイレクトの場合
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`Redirected: ${url} -> ${redirectUrl}`);
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect without location header: ${url}`));
        }
      } else {
        file.close();
        fs.unlink(outputPath, () => {}); // ファイルを削除
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(outputPath, () => {}); // ファイルを削除
      reject(err);
    });

    file.on('error', (err) => {
      file.close();
      fs.unlink(outputPath, () => {}); // ファイルを削除
      reject(err);
    });
  });
}

// URLをローカルパスに変換
function convertUrlToLocalPath(url) {
  if (url.startsWith(BASE_URL)) {
    return url.replace(BASE_URL, '');
  }
  return url;
}

// 添付ファイルを処理
async function processAttachments() {
  console.log('Processing attachments...');
  
  const attachments = JSON.parse(fs.readFileSync(ATTACHMENTS_FILE, 'utf-8'));
  const updatedAttachments = [];

  for (const attachment of attachments) {
    console.log(`Processing attachment ${attachment.id}: ${attachment.title}`);
    
    const updatedAttachment = { ...attachment };

    // メインURL
    if (attachment.url.startsWith(BASE_URL)) {
      const localPath = convertUrlToLocalPath(attachment.url);
      const outputPath = path.join(DOWNLOAD_DIR, localPath);
      
      try {
        await downloadFile(attachment.url, outputPath);
        updatedAttachment.url = localPath;
      } catch (error) {
        console.error(`Failed to download ${attachment.url}:`, error.message);
        // ダウンロードに失敗した場合は元のURLを保持
      }
    }

    // サイズ別URL
    if (attachment.sizes) {
      const updatedSizes = { ...attachment.sizes };
      
      for (const [sizeKey, sizeData] of Object.entries(attachment.sizes)) {
        if (sizeData && sizeData.url && sizeData.url.startsWith(BASE_URL)) {
          const localPath = convertUrlToLocalPath(sizeData.url);
          const outputPath = path.join(DOWNLOAD_DIR, localPath);
          
          try {
            await downloadFile(sizeData.url, outputPath);
            updatedSizes[sizeKey] = {
              ...sizeData,
              url: localPath
            };
          } catch (error) {
            console.error(`Failed to download ${sizeData.url}:`, error.message);
            // ダウンロードに失敗した場合は元のURLを保持
          }
        }
      }
      
      updatedAttachment.sizes = updatedSizes;
    }

    updatedAttachments.push(updatedAttachment);
  }

  // 更新されたデータを保存
  fs.writeFileSync(ATTACHMENTS_FILE, JSON.stringify(updatedAttachments, null, 2));
  console.log(`Updated ${ATTACHMENTS_FILE}`);
}

// 投稿内容の画像URLを更新
function processPosts() {
  console.log('Processing posts...');
  
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  const updatedPosts = [];

  for (const post of posts) {
    console.log(`Processing post ${post.id}: ${post.title}`);
    
    const updatedPost = { ...post };

    // フィーチャード画像URL
    if (post.featuredImageUrl && post.featuredImageUrl.startsWith(BASE_URL)) {
      updatedPost.featuredImageUrl = convertUrlToLocalPath(post.featuredImageUrl);
    }

    // 投稿内容内の画像URL
    if (post.content) {
      updatedPost.content = post.content.replace(
        new RegExp(`${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/wp-content/uploads/([^"\\s>]+)`, 'g'),
        '/wp-content/uploads/$1'
      );
    }

    // 抜粋内の画像URL（もしあれば）
    if (post.excerpt) {
      updatedPost.excerpt = post.excerpt.replace(
        new RegExp(`${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/wp-content/uploads/([^"\\s>]+)`, 'g'),
        '/wp-content/uploads/$1'
      );
    }

    updatedPosts.push(updatedPost);
  }

  // 更新されたデータを保存
  fs.writeFileSync(POSTS_FILE, JSON.stringify(updatedPosts, null, 2));
  console.log(`Updated ${POSTS_FILE}`);
}

// メイン処理
async function main() {
  try {
    console.log('Starting image migration process...');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Download directory: ${DOWNLOAD_DIR}`);
    
    // 添付ファイルの処理（ダウンロード + URL更新）
    await processAttachments();
    
    // 投稿の処理（URL更新のみ）
    processPosts();
    
    console.log('Image migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update imageUtils.ts for GitHub Pages');
    console.log('2. Run npm run build');
    console.log('3. Deploy to GitHub Pages');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}