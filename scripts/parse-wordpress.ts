import * as fs from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';

interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  author: string;
  categories: string[];
  tags: string[];
  link: string;
  featuredImageId?: number;
  featuredImageUrl?: string;
}

interface WordPressAttachment {
  id: number;
  title: string;
  url: string;
  filename: string;
  parentId: number;
}

interface WordPressPage {
  id: number;
  title: string;
  content: string;
  date: string;
  modified: string;
  slug: string;
  status: string;
  author: string;
  link: string;
}

async function parseWordPressXML(): Promise<void> {
  const xmlPath = path.join(__dirname, '../fujimuraseminar.WordPress.2025-06-30.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  parseString(xmlContent, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
      return;
    }

    const channel = result.rss.channel[0];
    const items = channel.item || [];

    const posts: WordPressPost[] = [];
    const pages: WordPressPage[] = [];
    const attachments: WordPressAttachment[] = [];

    // First pass: collect all attachments
    items.forEach((item: any) => {
      const postType = item['wp:post_type']?.[0];
      
      if (postType === 'attachment') {
        const id = parseInt(item['wp:post_id']?.[0] || '0');
        const title = item.title?.[0] || '';
        const url = item['wp:attachment_url']?.[0] || '';
        const parentId = parseInt(item['wp:post_parent']?.[0] || '0');
        
        if (url) {
          attachments.push({
            id,
            title,
            url,
            filename: url.split('/').pop() || '',
            parentId
          });
        }
      }
    });

    // Second pass: process posts and pages
    items.forEach((item: any) => {
      const postType = item['wp:post_type']?.[0];
      const status = item['wp:status']?.[0];
      
      // Skip private posts and attachments
      if (status === 'private' || postType === 'attachment') {
        return;
      }

      const id = parseInt(item['wp:post_id']?.[0] || '0');
      const title = item.title?.[0] || '';
      const content = item['content:encoded']?.[0] || '';
      const excerpt = item['excerpt:encoded']?.[0] || '';
      const date = item['wp:post_date']?.[0] || '';
      const modified = item['wp:post_modified']?.[0] || '';
      const slug = item['wp:post_name']?.[0] || '';
      const author = item['dc:creator']?.[0] || '';
      const link = item.link?.[0] || '';

      const categories: string[] = [];
      const tags: string[] = [];

      if (item.category) {
        item.category.forEach((cat: any) => {
          const domain = cat.$.domain;
          const name = cat._;
          if (domain === 'category') {
            categories.push(name);
          } else if (domain === 'post_tag') {
            tags.push(name);
          }
        });
      }

      // Extract featured image ID from post meta
      let featuredImageId: number | undefined;
      let featuredImageUrl: string | undefined;
      
      if (item['wp:postmeta']) {
        const thumbnailMeta = item['wp:postmeta'].find((meta: any) => 
          meta['wp:meta_key']?.[0] === '_thumbnail_id'
        );
        if (thumbnailMeta) {
          featuredImageId = parseInt(thumbnailMeta['wp:meta_value']?.[0] || '0');
          const attachment = attachments.find(att => att.id === featuredImageId);
          if (attachment) {
            featuredImageUrl = attachment.url;
          }
        }
      }

      if (postType === 'post') {
        posts.push({
          id,
          title,
          content,
          excerpt,
          date,
          modified,
          slug,
          status,
          type: postType,
          author,
          categories,
          tags,
          link,
          featuredImageId,
          featuredImageUrl
        });
      } else if (postType === 'page') {
        pages.push({
          id,
          title,
          content,
          date,
          modified,
          slug,
          status,
          author,
          link
        });
      }
    });

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write posts and pages to JSON files
    fs.writeFileSync(
      path.join(dataDir, 'posts.json'),
      JSON.stringify(posts, null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'pages.json'),
      JSON.stringify(pages, null, 2)
    );

    // Write attachments data as well
    fs.writeFileSync(
      path.join(dataDir, 'attachments.json'),
      JSON.stringify(attachments, null, 2)
    );

    console.log(`Parsed ${posts.length} posts, ${pages.length} pages, and ${attachments.length} attachments`);
    console.log('Data saved to src/data/posts.json, src/data/pages.json, and src/data/attachments.json');
  });
}

parseWordPressXML().catch(console.error);