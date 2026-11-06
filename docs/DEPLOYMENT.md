# GitHub Pages

Pagesの「Build and deployment」→「Source」を **GitHub Actions** に設定してください（最初の一度のみ）。

公開URL：

- 本番：`https://naoiw.github.io/stl-viewer/`
- 開発：`https://naoiw.github.io/stl-viewer/develop/`

`main` 更新時に `.github/workflows/deploy-pages.yml` が実行されます。
`develop` 更新時は検証ワークフロー `Validate develop` が成功したときだけ、`main` 側のデプロイワークフローからプレビューが更新されます。

1回のデプロイで、本番とプレビューを同じPages artifactへ統合します。これにより個別のGitHub Pages環境が必要ありません。

`npm run build:pages:main` と `npm run build:pages:develop` は、それぞれViteのbaseパスを変更します。ローカル開発は `npm run dev` で動作します。

GitHub Pagesの有効化はリポジトリ管理権限を持つアカウントの設定で確認してください。
