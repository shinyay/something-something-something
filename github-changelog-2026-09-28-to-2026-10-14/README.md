# GitHub Changelog 詳細解説 — 2026年9月28日〜10月14日

開発者・GitHub管理者向けに、公開Changelogの57記事を7カテゴリ・28章で解説する、日本語の単一HTML文書です。短い記事要約の羅列ではなく、背景、変更点、利用・移行の流れ、対象、既定値、制約、実務上の注意を関連づけています。

[詳細ガイドを開く](./document.html) · [ディレクトリの入口](./index.html)

**GitHub Pagesの配信先**：[ガイドの入口](https://shinyay.github.io/something-something-something/github-changelog-2026-09-28-to-2026-10-14/) · [正規文書](https://shinyay.github.io/something-something-something/github-changelog-2026-09-28-to-2026-10-14/document.html)

情報の基準時点は **2026年10月14日12:17 JST**、テーマは **Primary** です。掲載日を基準に9月28日〜10月14日を調査し、最新の掲載日は10月13日でした。月次・週次まとめを含むため、57記事は57個の独立した新機能の数ではありません。

## 構成

| カテゴリ | 詳細解説 |
| --- | --- |
| 1. Copilotのモデルと開発環境 | 新モデル4種、プラン、非推奨モデル、ローカルモデル、VS Code・app・JetBrains |
| 2. エージェントの実行・自動化・隔離 | HydraFusion、Dynamic workflows、Computer use、ローカルサンドボックス |
| 3. プルリクエスト・レビュー・共同作業 | 非同期マージ、Stacked PR、レビューAPI、effort、モデレーション、アクセシビリティ |
| 4. GitHub ActionsとCI基盤 | ランナー最低版、ARC、macOS 14廃止、保存期間、coverage upload |
| 5. コード品質・脆弱性検出・シークレット保護 | CodeQL、AI Scan、Code Quality、検出器と料金、脆弱性報告・機密コメント・API |
| 6. Dependabot・npmとソフトウェア供給網 | 実行環境、registry、withdrawn alerts、OIDC、staged publishing、trustの失効 |
| 7. 企業ガバナンス・課金・監査・API統合 | 外部属性、認証主体、最小権限、token、管理設定、telemetry、費用・計測、TLS |

期限・互換性の一覧、プラットフォーム横断比較、担当者別の確認項目、全57記事の対応索引も含みます。3つの説明図は、モデルとツール隔離、非同期マージの受付と完了、npmのstagingと公開を区別するために使っています。

GA、公開・限定公開・Private・Research preview、提供予定を区別しています。記事の掲載日と実施日、CloudとServer、利用資格と追加課金も分けて説明しています。

## 保存内容

| ファイル | 内容 |
| --- | --- |
| `document.html` | 標準生成器が作った、28章・3図・57出典の正規文書 |
| `index.html` | `document.html`と全バイトが同じ入口用の別名。別の資料やリダイレクトではない |
| `source\artifact.json` | 書式、章、57出典、共有する数値・条件、図の定義 |
| `source\content.ja.html` | カテゴリ別の詳細本文、表、説明、出典参照 |
| `source\coverage.json` | 57記事のID、掲載日、主カテゴリ、解説章、主要論点、照合用語、調査snapshotのハッシュ |

各HTMLはMona Sans、Mona Sans Mono、Noto Sans JP、CSS、操作、図、ロゴ、原文ライセンスを内包し、閲覧時の外部資源取得は不要です。フォント埋め込みのため、HTMLはそれぞれ約13.4 MBあります。出典を開く操作は外部サイトへの移動です。

公開記事に基づく独自の技術解説で、元記事の全文や引用画像を配布するものではありません。本文入力、折りたたみ、図の説明、共有データ、coverageもHTMLや入力と一緒に共有されます。内部情報や個人情報を追記しないでください。ロゴは公式な推薦・認定を意味しません。

## 読み方と操作

- 広い画面では目次と本文を並べ、狭い画面では目次を開閉して章を選びます。現在章はURLと目次へ反映します。
- 明暗は「表示」で切り替えます。日本語のみのため言語切替はありません。
- 出典参照から出典一覧へ進み、戻りリンクで参照箇所へ復帰できます。
- 長い表は、名前付きの表領域を横スクロールして読めます。
- 補足はネイティブの折りたたみです。JavaScriptが無効でも本文・図・出典は残ります。
- 標準の印刷では補足、出典、ライセンスも対象になります。PDFは追加配布物にはしていません。

「出典確認済み」は記事本文を取得・確認した意味です。各製品機能の実アカウントでの動作確認、未掲載の単価、将来の提供日、記事にないAPI仕様まで検証した意味ではありません。製品情報は基準時点のsnapshotとして利用してください。

## 再生成

制作標準は **github-brand-html-artifacts 0.5.0-p05.2**、Node.jsは **22.16.0** です。同じSkill版とlockfileに固定された既存依存を使います。Skill本体や依存ライブラリは本リポジトリに同梱していません。

リポジトリのルートで実行する例です。`<NEW_OUTPUT_DIR>`は、親が存在し、そのディレクトリ自体はまだ存在しない新規出力先に置き換えます。

```powershell
$skill = Join-Path $HOME '.copilot\skills\github-brand-html-artifacts'
$input = '.\github-changelog-2026-09-28-to-2026-10-14\source'
$output = '<NEW_OUTPUT_DIR>'
node "$skill\scripts\build.mjs" --input "$input" --output "$output"
node "$skill\scripts\validate.mjs" --input "$input" --output "$output"
```

成功を確認した`document.html`を配置し、同じバイト列で`index.html`も作ります。新規候補内で別名を作る例は次のとおりです。

```powershell
Copy-Item -LiteralPath (Join-Path $output 'document.html') -Destination (Join-Path $output 'index.html')
Get-FileHash -LiteralPath (Join-Path $output 'document.html'), (Join-Path $output 'index.html') -Algorithm SHA256
```

両方のハッシュが一致することを確認します。標準のvalidateは、指定形式の正規生成物だけが入った出力先を対象にします。`index.html`、README、sourceを加えた配布フォルダーを直接指定すると、正規ファイル集合ではないため`OUTPUT_SET`になります。これはHTML本文の不一致とは別です。配布後の確認は、配布する`document.html`を新規の検証用フォルダーへコピーしてvalidateし、別名・正規候補とのハッシュ一致を確認します。

既存の公開先や失敗候補を自動で削除・上書きせず、他の編集がないか確認してから配置してください。本文の変更は入力で行い、完成HTMLへCSSやJavaScriptを直接追加しないでください。

このディレクトリは`.gitattributes`で改行をLFに固定しています。Windowsの自動改行変換によって、生成物のハッシュや再生成入力が変わることを防ぐためです。埋め込んだ原文ライセンスの末尾空白も含め、正規生成物のバイト列を保持してください。

coverageの件数や出典一覧の存在だけでは、各記事を詳しく解説した証明になりません。更新時は、各記事の主要論点が対応章に残ること、提供状態・否定・例外・数値が変わっていないことを本文と照合してください。

## 確認範囲と制限

今回の最終候補では、次を確認しています。

- 標準のbuild／validateによる生成物のバイト単位の照合。
- 57記事のID集合、題名、URL、掲載日、7カテゴリの件数、28章の順序、57件の索引、主要論点の語句と本文中の出典参照。
- 新4モデルのプラン欄を、保存した元記事の対象プラン記述と直接照合。
- 件数を57のまま誤った記事IDへ変える、REST条件の否定を反転する、索引・出典リンクを残して詳細説明だけ削る否定fixtureを、意図した理由で検出。
- 既存Microsoft Edgeのheadlessで1440px／320px、ライト／ダークの4組を表示。実フォント、文字サイズ、コントラスト、全3図のラベル・余白・接続、横overflowを確認。
- キーボード目次、狭幅のEscapeとフォーカス復帰、出典往復、履歴・再読み込み、明暗切替、実ホイール入力による表の横スクロール。
- JavaScript無効・オフラインで28章と57出典が存在し、補足を開けること。外部HTTP要求と実行時エラーがないこと。
- 確認用の実PDFで本文・出典・ライセンスの文字を照合し、欠落・意図しない反復・空白ページ・見出し分断と印刷前後の画面状態を確認。初回に見つかった見出し分断と狭幅図ラベルの改行は、入力を直して新候補で再確認。
- 代表画面と3図の広幅・狭幅を目視。元記事全文のsnapshotと確認用の画像・レポートは公開ディレクトリに含めていません。

実200%ズーム、ネイティブ印刷ダイアログのキャンセル、全PDFページの視覚確認、他OS・他ブラウザーは確認済みに含めません。製品設定の変更や課金機能の有効化も行っていません。

## 公開と権利

公開には、リポジトリの既存GitHub Pages設定（`main`ブランチのルートを配信）を使います。このディレクトリを含むPRを`main`へマージし、`pages-build-deployment`が正常に完了すると、上記URLへ反映されます。作業ブランチへのpushやPR作成だけでは公開されません。Pagesの公開元、ドメイン、他の資料のURLは変更しません。

埋め込みフォント・Octiconsの原文ライセンスとロゴの利用条件を保持してください。リポジトリのMIT表記を、元記事・ブランド素材の権利や埋め込み素材のライセンスの代わりにはしません。
