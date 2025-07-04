#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// posts.jsonのパスを取得
const postsPath = path.join(__dirname, '../src/data/posts.json');

try {
    // posts.jsonを読み込み
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    // 全ての記事のIDを取得
    const ids = postsData.map(post => post.id);
    
    // 最大IDを取得
    const maxId = Math.max(...ids);
    
    // 次のIDを計算
    const nextId = maxId + 1;
    
    // 結果を出力
    console.log(nextId);
    
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}