# WordPress to Next.js Migration Project History

## User Prompts & Requirements

### 1. Initial Request (Japanese)
```
はい。このサイトはWordpressなのですが、これからYAMLのexportファイルを提示するので、そのデータからWordPressを使用しない静的なWebサイトに変換してほしい。なお、各記事のURLのパス../blog/archives/[記事番号]は保持し、固定ページなどもそのまま移行してほしい。3列x4行の12記事にページ分けし、1ページ毎にローディングするようにしたい。どのようなライブラリを使用するべきか、実際に作業に移る前に方針を示してください
```

**Translation**: "Yes. This site is WordPress, but I will present a YAML export file next, so I want you to convert that data into a static website that doesn't use WordPress. Please maintain the URL path ../blog/archives/[article number] for each article and migrate fixed pages as well. I want pagination with 12 articles in 3 columns x 4 rows, with loading for each page. What libraries should I use? Please show the approach before starting the actual work."

### 2. File Correction
```
wordpress-backup.yamlはもしかすると少し違うかもしれないので、最新版を置きました。fujimuraseminar.WordPress.2025-06-30.xml
```

**Translation**: "The wordpress-backup.yaml might be slightly different, so I've placed the latest version. fujimuraseminar.WordPress.2025-06-30.xml"

### 3. Confirmation to Proceed
```
はい
```

**Translation**: "Yes" (confirming to proceed with the implementation)

### 4. Image and Error Issues
```
画像が一つも表示されていませんでした。また、コンソールにはエラーが出ていました：[followed by console error logs about Next.js 15 async params and CORS warnings]
```

**Translation**: "No images were displayed at all. Also, there were errors in the console:" [followed by technical error details]

### 5. Featured Image and Layout Issues
```
このブログでは記事内で使っている画像をアイキャッチ画像として指定してるケースが多いのですが、この場合、記事を表示したときに、アイキャッチ画像と元々の画像が２つ表示されてしまっています。アイキャッチ画像を各記事のヘッダに使用していませんか？それをやめてください。それから、元々のWebサイトにあるように上部に他サイトへのリンクや固定ページのリンクがあります。これらを追加してください。元々のfaviconも追加してください。
```

**Translation**: "In this blog, there are many cases where images used within articles are designated as featured images, but in this case, when displaying an article, both the featured image and the original image are displayed twice. Aren't you using the featured image in each article's header? Please stop doing that. Also, like the original website, there are links to other sites and fixed page links at the top. Please add these. Also add the original favicon."

### 6. Current Request
```
これまでに私が入力したプロンプトをファイルに保存しておいてください
```

**Translation**: "Please save the prompts I have entered so far to a file."

## Technical Requirements Summary

1. **Migration Goal**: Convert WordPress site to static Next.js website
2. **URL Structure**: Maintain `../blog/archives/[article_number]` format
3. **Pagination**: 12 articles per page (3 columns x 4 rows) with loading functionality
4. **Fixed Pages**: Migrate all WordPress pages with original paths
5. **Image Handling**: 
   - Extract and display featured images on blog listing
   - Avoid duplicate display in article headers
   - Support WordPress wp-content/uploads images
6. **Navigation**: Add top navigation with:
   - Links to fixed pages (About, Seminar Introduction, Works, Faculty)
   - External links to university sites
7. **Branding**: Use original favicon from the WordPress site
8. **Technical Issues Resolved**:
   - Next.js 15 async params compatibility
   - CORS warnings in development
   - Image display and optimization
   - WordPress XML parsing (not YAML as initially mentioned)

## File Structure Created

- `/scripts/parse-wordpress.ts` - WordPress XML parser
- `/src/data/` - JSON data files (posts, pages, attachments)
- `/src/components/Navigation.tsx` - Site navigation component
- `/src/utils/imageUtils.ts` - Image processing utilities
- `/src/app/` - Next.js app router pages
- `next.config.ts` - Next.js configuration for external images

## Final Result

A fully functional static Next.js website that replicates the original WordPress site's functionality while maintaining URL compatibility and improving performance through static generation.