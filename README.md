# Fujimura Seminar Website

WordPressから移行したNext.js製の静的サイトです。GitHub Pagesでホスティングされています。

## サイト情報

- **URL**: https://kofujimura.github.io/
- **技術スタック**: Next.js 16, TypeScript, Tailwind CSS, Sharp (画像最適化)
- **ホスティング**: GitHub Pages
- **自動デプロイ**: GitHub Actions

## 新しい記事の追加方法

### 1. データファイルの更新

新しい記事を追加するには、以下のファイルを編集します：

#### `src/data/posts.json`
```json
{
  "id": 9999,
  "title": "新しい記事のタイトル",
  "content": "<p>記事の内容をHTMLで記述</p>",
  "slug": "new-article",
  "date": "2025-01-01T00:00:00.000Z",
  "author": "fujimura",
  "categories": ["カテゴリ1", "カテゴリ2"],
  "tags": ["タグ1", "タグ2"],
  "featuredImageUrl": "https://example.com/image.jpg" // オプション
}
```

**重要なフィールド：**
- `id`: 一意の記事番号（既存の最大値+1を使用）
- `title`: 記事のタイトル
- `content`: HTMLフォーマットの記事内容
- `date`: ISO 8601フォーマットの日付
- `categories`: カテゴリの配列
- `tags`: タグの配列
- `featuredImageUrl`: アイキャッチ画像URL（オプション）

### 2. 画像の追加

記事に画像を含める場合：

**重要な画像要件**:
- **推奨サイズ**: 1280px以上の幅（高品質な960w/1280w最適化ファイル生成のため）
- **対応形式**: PNG, JPEG, JPG
- **ファイル名**: 英数字とハイフン（-）のみ（日本語文字は避ける）

**推奨方法**: 
1. **新しい記事用画像**: `public/images/`フォルダに配置
   ```html
   <img src="/images/your-image.jpg" alt="説明" />
   ```

2. **WordPressから継承した画像**: 既存の`public/wp-content/uploads/`構造を使用
   ```html
   <img src="/wp-content/uploads/2025/01/image.jpg" alt="説明" />
   ```

3. **外部画像**: 直接URLを使用（CDNや外部サービス）
   ```html
   <img src="https://example.com/image.jpg" alt="説明" />
   ```

**画像配置のベストプラクティス**:
- **新規画像**: `public/images/記事ID/` または `public/images/年月/` に整理して配置
- **画像最適化**: 自動で AVIF・WebP・最適化PNG/JPEG が生成されます
- **レスポンシブ対応**: 4つのサイズ (320w, 640w, 960w, 1280w) が自動生成
- **生成物もコミット**: 画像を置いたら `npm run optimize-images` を実行し、生成された `*-320w.*` 〜 `*-1280w.*` と `*-optimized.*` も一緒にコミットしてください。生成済みファイルはビルド時にスキップされるので、CI が数分短縮されます（忘れても CI 側で生成されるため、サイトは正しく表示されます）
- **alt属性**: 必ず適切な代替テキストを設定
- **現代ブラウザ対応**: AVIF → WebP → 元フォーマットの順で配信
- **表示動作**: トップページ（3カラム）と記事ページ（大きく表示）で自動調整

**例**:
```html
<!-- 新しい記事の画像例（自動で最適化されます） -->
<img src="/images/2025/01/project-screenshot.jpg" 
     alt="プロジェクトのスクリーンショット" />

<!-- WordPress継承画像例（自動で最適化されます） -->
<img src="/wp-content/uploads/2024/01/existing-image.png" 
     alt="既存の画像" />
```

**React コンポーネント使用例**:
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/images/sample.jpg"
  alt="サンプル画像"
  width={800}
  height={600}
  priority={true}  // 重要な画像の場合
/>
```

### 3. デプロイ

記事を追加した後：

```bash
# 画像を追加した場合は最適化ファイルを生成（数秒〜1分）
npm run optimize-images

# 変更をコミット（生成された画像ファイルも含める）
git add .
git commit -m "新しい記事を追加: [記事タイトル]"

# GitHubにプッシュ（自動デプロイされます）
git push origin main
```

GitHub Actionsが自動的にサイトをビルド・デプロイします（約2-3分）。

## 固定ページの追加方法

### 1. ページファイルの作成

`src/app/[page-name]/page.tsx`を作成：

```tsx
import Navigation from '@/components/Navigation';

export default function CustomPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ページタイトル</h1>
        <div className="prose prose-lg max-w-none">
          {/* ページ内容 */}
        </div>
      </main>
    </div>
  );
}
```

### 2. ナビゲーションの更新

`src/components/Navigation.tsx`にリンクを追加：

```tsx
<a href="/new-page/" className="hover:text-gray-300 transition-colors">
  新しいページ
</a>
```

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 静的サイトのビルド（画像最適化含む）
npm run build

# 静的サイトのエクスポート（画像最適化含む）
npm run export

# 画像最適化のみ実行
npm run optimize-images
```

## ファイル構成

```
src/
├── app/                    # Next.js App Router
│   ├── blog/archives/[id]/ # 動的な記事ページ
│   ├── page.tsx           # トップページ（記事一覧）
│   └── layout.tsx         # 共通レイアウト
├── components/
│   ├── Navigation.tsx     # ナビゲーションコンポーネント
│   └── OptimizedImage.tsx # 最適化画像コンポーネント
├── data/
│   ├── posts.json        # 記事データ
│   ├── pages.json        # 固定ページデータ
│   └── attachments.json  # 添付ファイルデータ
├── utils/
│   └── imageUtils.ts     # 画像処理ユーティリティ
└── scripts/
    ├── create-post.js    # 記事作成スクリプト
    ├── migrate-images.js # 画像移行スクリプト
    └── optimize-images.ts # 画像最適化スクリプト
```

## 注意事項

1. **記事ID**: 既存の記事IDと重複しないように注意
2. **画像最適化**: 元画像をそのまま `public/images/` に置けばよい。生成された最適化ファイルは削除せずにコミットする（既に存在するファイルは再生成されない）
3. **HTML**: 記事内容はHTMLエスケープされないため、適切なHTMLを記述
4. **URL構造**: 記事URLは`/blog/archives/[id]/`の形式を維持
5. **画像フォーマット**: PNG・JPEG・WebP・AVIFがサポートされています

## 画像最適化システム

### 自動最適化の詳細

- **実行タイミング**: `npm run build` および `npm run export` 時に自動実行（`npm run optimize-images` で単独実行も可）
- **対象ディレクトリ**: `public/images/` のみ（`public/wp-content/uploads/` の WordPress 継承画像は元ファイルをそのまま配信）
- **生成される形式**:
  - AVIF（最新・最高効率）
  - WebP（広くサポート）
  - 最適化PNG（フォールバック）、および元形式の `*-optimized.*`
- **レスポンシブサイズ**: 320w, 640w, 960w, 1280w
- **圧縮率**: 80%品質、90-99%のファイルサイズ削減を実現
- **スキップ条件**: 出力ファイルが既に存在すればスキップ。生成物は git にコミットしてあるため、CI（GitHub Actions）では実質すべてスキップされ、画像生成に時間がかからない
- **再生成したい場合**: 同名で画像を差し替えたときは古い生成物を削除してから実行する（下記「画像を差し替えたとき」参照）

### 最適化の効果

- **PageSpeed Insights**: 大幅なスコア向上
- **ロード時間**: 画像ダウンロード時間を大幅短縮
- **帯域幅**: サーバー転送量の削減
- **ユーザー体験**: 高速な画像表示

### 手動最適化

```bash
# 画像最適化のみ実行
npm run optimize-images

# 特定画像の確認
ls public/images/sample-320w.webp
ls public/images/sample-optimized.png
```

### 画像を差し替えたとき

既存の生成物があると再生成されないため、同じファイル名で画像を差し替えた場合は古い生成物を削除してから実行します：

```bash
# 例: public/images/sample.png を差し替えた場合
rm public/images/sample-{320,640,960,1280}w.* public/images/sample-optimized.*
npm run optimize-images
```

## トラブルシューティング

### ビルドエラーが発生した場合

```bash
# 型チェック
npx tsc --noEmit

# リンターチェック（src/ 配下）
npm run lint

# ローカルでビルドテスト（画像最適化含む）
npm run build
```

### 画像最適化関連のトラブル

```bash
# Sharp の再インストール
npm uninstall sharp
npm install sharp --save-dev

# 生成画像をすべて削除して作り直す（必要に応じて。約1分）
find public/images \( -name "*-320w.*" -o -name "*-640w.*" -o -name "*-960w.*" -o -name "*-1280w.*" -o -name "*-optimized.*" \) -delete
npm run optimize-images
```

### GitHub Actions失敗時

1. GitHubリポジトリの「Actions」タブでエラーログを確認
2. `package.json`の依存関係を確認
3. 必要に応じて`npm install`を実行してpackage-lock.jsonを更新

### サイトが更新されない場合

1. GitHub Pages設定で「Source」が「GitHub Actions」になっているか確認
2. ブラウザのキャッシュをクリア
3. GitHub Actionsのワークフローが完了しているか確認

## サポート

技術的な問題や質問は、GitHubのIssueで報告してください。