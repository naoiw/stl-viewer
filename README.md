# STL VIEWER

STLファイルをブラウザ上で読み込み、Three.jsで自由に回転・拡大縮小して確認する3Dビュワーです。既存のnaoiw系ツールと共通のダークUIと、main/develop構成を採用しています。

## 主な機能

- ASCII / Binary STLのローカル読み込み（ファイル選択、ドラッグ＆ドロップ）
- マウスドラッグやタッチによる3D回転、ズーム、平行移動
- 読み込み時の自動フレーミングと視点リセット
- モデル色、ワイヤーフレーム、グリッド、XYZ軸の表示切替
- ファイル名、サイズ、三角形数、X/Y/Z寸法の確認
- PC / スマートフォン対応
- サーバー不要。モデルはブラウザ内で処理し、外部送信しません

**注意:** STL規格に長さの単位は定義されていません。画面の寸法はSTLの座標値そのものであり、mmと断定しません。STLのZ方向を上として表示します。大容量ファイルはブラウザのメモリ・GPU性能に依存します（読み込み上限80 MB）。

## 公開URL

| 環境 | ブランチ | URL |
| --- | --- | --- |
| 本番 | `main` | https://naoiw.github.io/stl-viewer/ |
| 開発プレビュー | `develop` | https://naoiw.github.io/stl-viewer/develop/ |

GitHub Pagesの公開元に **GitHub Actions** を設定してください。デプロイ処理は本番と開発プレビューを1つのPages成果物に統合します。

## ローカル開発

```bash
git clone https://github.com/naoiw/stl-viewer.git
cd stl-viewer
git switch develop
npm install
npm run dev
npm test
npm run build
```

## ファイル構成

- `src/App.tsx`：ファイル選択、ドロップ、表示設定・情報UI
- `src/components/StlCanvas.tsx`：Three.js描画、OrbitControls、カメラ操作
- `src/lib/stl.ts`：STL解析と寸法計算
- `src/styles.css`：既存ツールと共通したレイアウト
- `tests/stl.test.ts`：ASCII/Binary STLの読み込みと境界値テスト
- `docs/`：仕様・開発・デプロイ手順
- `.github/workflows/`：develop検証とGitHub Pagesデプロイ

## 技術

React / TypeScript / Vite / Three.js。ライセンスは[MIT](LICENSE)。
