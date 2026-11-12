# 開発

Node.js 26系を想定。

```bash
npm install
npm run dev
npm test
npm run build
```

ブランチ運用は `develop` で実装・確認し、Pull Requestで `main` に統合します。

## サンプルSTLの管理

`public/samples/` 直下に `.stl` ファイルを置くと、ビルド開始前に `scripts/generate-samples-index.mjs` が `public/samples/index.json` を生成します（Git管理外）。ページのサンプル選択欄はこの一覧を取得します。ファイル名はURLエンコードして同一オリジンから読み込みます。

対象は直下のファイルのみです。サブディレクトリは探索しません。 `npm run dev` 起動時にも一覧を生成しますが、起動後にSTLを追加した場合は開発サーバーを再起動してください。

## 主なコンポーネント

- `src/lib/stl.ts` はSTLLoaderを使用してモデルのメタデータを計算し、原点中心へ移動します。
- `src/components/StlCanvas.tsx` はWebGLコンテキストとカメラを保持し、アップロードされたジオメトリを表示します。
- `src/App.tsx` はファイル読み込みと操作UIを管理します。

## 実装上の注意

- ファイルの読み込みは `File.arrayBuffer()` を使用し、バックエンドには転送しません。
- モデルを置換したら旧ジオメトリ・マテリアルをdisposeします。
- OrbitControlsとResizeObserver、アニメーションフレームはコンポーネント破棄時に必ず解除します。
- STLは単位を持たないため、寸法表示にmm等の単位を付けないでください。
- デフォルトはSTLで一般的なZ-upとし、カメラのup方向をZに設定します。
- `npm run build:pages:main` / `npm run build:pages:develop` で公開パスを切り替えます。
