#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// posts.jsonのパスを取得
const postsPath = path.join(__dirname, '../src/data/posts.json');

function getNextId() {
    try {
        const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        const ids = postsData.map(post => post.id);
        return Math.max(...ids) + 1;
    } catch (error) {
        console.error('Error reading posts.json:', error.message);
        return 1;
    }
}

function createPostTemplate(title = "新しい記事のタイトル", outputFile = null) {
    const nextId = getNextId();
    const currentDate = new Date().toISOString();
    
    const postTemplate = {
        id: nextId,
        title: title,
        content: "<p>記事の内容をここに書きます。</p>",
        excerpt: "記事の要約をここに書きます。",
        date: currentDate,
        modified: currentDate,
        slug: `post-${nextId}`,
        status: "publish",
        author: "fujimura",
        categories: ["未分類"],
        tags: [],
        featuredImageUrl: ""
    };
    
    if (outputFile) {
        try {
            fs.writeFileSync(outputFile, JSON.stringify(postTemplate, null, 2));
            console.log(`✅ テンプレートを作成しました: ${outputFile}`);
            return true;
        } catch (error) {
            console.error('Error creating template file:', error.message);
            return false;
        }
    } else {
        return postTemplate;
    }
}

function addPostFromFile(jsonFilePath) {
    try {
        // JSONファイルを読み込み
        const postData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // 必要なフィールドの検証
        if (!postData.id || !postData.title) {
            console.error('Error: JSONファイルにidとtitleが必要です');
            return false;
        }
        
        // posts.jsonを読み込み
        const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        
        // IDの重複チェック
        const existingIds = postsData.map(post => post.id);
        if (existingIds.includes(postData.id)) {
            console.error(`Error: ID ${postData.id} は既に存在します`);
            return false;
        }
        
        // 配列の先頭に追加（最新記事として）
        postsData.unshift(postData);
        
        // posts.jsonを更新
        fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));
        console.log(`✅ 記事を追加しました: ID ${postData.id} - "${postData.title}"`);
        return true;
    } catch (error) {
        console.error('Error adding post:', error.message);
        return false;
    }
}

function addPostDirect(postData) {
    try {
        // 必要なフィールドの検証
        if (!postData.id || !postData.title) {
            console.error('Error: postDataにidとtitleが必要です');
            return false;
        }
        
        // posts.jsonを読み込み
        const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
        
        // IDの重複チェック
        const existingIds = postsData.map(post => post.id);
        if (existingIds.includes(postData.id)) {
            console.error(`Error: ID ${postData.id} は既に存在します`);
            return false;
        }
        
        // 配列の先頭に追加（最新記事として）
        postsData.unshift(postData);
        
        // posts.jsonを更新
        fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));
        console.log(`✅ 記事を追加しました: ID ${postData.id} - "${postData.title}"`);
        return true;
    } catch (error) {
        console.error('Error adding post:', error.message);
        return false;
    }
}

// コマンドライン引数を処理
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'next-id':
        console.log(getNextId());
        break;
    
    case 'template':
        const title = args[1] || "新しい記事のタイトル";
        const outputFile = args[2];
        
        if (outputFile) {
            createPostTemplate(title, outputFile);
        } else {
            console.log(JSON.stringify(createPostTemplate(title), null, 2));
        }
        break;
    
    case 'add':
        if (args.length < 2) {
            console.error('使用方法: node create-post.js add <JSONファイルのパス>');
            process.exit(1);
        }
        addPostFromFile(args[1]);
        break;
    
    case 'add-direct':
        if (args.length < 2) {
            console.error('使用方法: node create-post.js add-direct \'{"title":"記事タイトル","content":"..."}\'');
            process.exit(1);
        }
        try {
            let postData;
            if (args[1].startsWith('{')) {
                // JSON文字列として解析
                postData = JSON.parse(args[1]);
            } else {
                // ファイルパスとして処理
                postData = JSON.parse(fs.readFileSync(args[1], 'utf8'));
            }
            
            // IDが指定されていない場合は自動生成
            if (!postData.id) {
                postData.id = getNextId();
            }
            
            // 必須フィールドのデフォルト値設定
            const currentDate = new Date().toISOString();
            const defaults = {
                content: postData.content || "<p>記事の内容をここに書きます。</p>",
                excerpt: postData.excerpt || "",
                date: postData.date || currentDate,
                modified: postData.modified || currentDate,
                slug: postData.slug || `post-${postData.id}`,
                status: postData.status || "publish",
                author: postData.author || "fujimura",
                categories: postData.categories || ["未分類"],
                tags: postData.tags || [],
                featuredImageUrl: postData.featuredImageUrl || ""
            };
            
            const finalPostData = { ...defaults, ...postData };
            addPostDirect(finalPostData);
            
        } catch (error) {
            console.error('Error parsing JSON:', error.message);
            process.exit(1);
        }
        break;
    
    default:
        console.log('使用方法:');
        console.log('  node create-post.js next-id                    # 次の記事IDを取得');
        console.log('  node create-post.js template [title] [file]    # 記事テンプレートを生成');
        console.log('  node create-post.js add <json-file>            # JSONファイルから記事を追加');
        console.log('  node create-post.js add-direct <json-string>   # JSON文字列から直接記事を追加');
        console.log('');
        console.log('例（人間向け）:');
        console.log('  node create-post.js template "新記事" > new.json');
        console.log('  node create-post.js template "新記事" new.json');
        console.log('  node create-post.js add new.json');
        console.log('');
        console.log('例（AIエージェント向け）:');
        console.log('  node create-post.js next-id');
        console.log('  node create-post.js add-direct \'{"title":"AI記事","content":"<p>AIが作成した記事</p>"}\'');
        break;
}