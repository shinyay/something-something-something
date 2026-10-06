# GitHub Copilot入門 — 基本とAgenticな使い方

GitとGitHubの基本を知っている方向けに、Copilotの基本とAgenticな使い方を説明する日本語のHTMLプレゼンテーションです。本編20枚と補足4枚で構成し、情報の基準日は2026-10-06、テーマはPrimaryです。既存の [Copilot入門ガイド](../copilot-beginner-guide/) はそのまま残しています。

**公開先（mainへのマージとGitHub Pagesへの反映後）**：
https://shinyay.github.io/something-something-something/copilot-beginner-agentic/

## 保存内容と公開範囲

| ファイル | 内容 |
| --- | --- |
| `index.html` | 完成版HTML。フォント、CSS、JavaScript、SVG、素材のライセンスを内包 |
| `source\artifact.json` | スライド構成、公開用の話者ノート、出典、図のデータなど |
| `source\content.ja.html` | 再生成用の日本語本文 |

話者ノートは秘密の発表者用領域ではなく、HTMLと一緒に共有されます。入力2ファイルも公開対象で、既存のPages設定ではURLから取得できます。内部情報や個人情報を追記しないでください。

閲覧時に外部の実行資源を取得する必要はありません。出典リンクを開くときは、リンク先の外部サイトへ移動します。

## 操作方法

| 操作 | 使い方 |
| --- | --- |
| 前後移動 | 「前へ」「次へ」、左右矢印、PageUp／PageDown。Home／Endは現在の本編・補足の先頭・末尾へ移動 |
| スライド一覧 | 一覧を開き、目的のスライドを選択 |
| 本編・補足 | 「補足へ」「本編に戻る」で切替。本編の末尾から補足へは自動で進まない |
| ノート | 現在のスライドの公開用話者ノートを表示 |
| 出典・共有データ | 出典、共有する条件、使用素材とライセンスを表示 |
| 全画面 | 「全画面」でスライドだけを表示。画面上端へのポインター移動またはTabで操作バーを表示し、「全画面を終了」またはEscで戻る |

大きい画面の全画面表示ではスライドを拡大し、小さい画面では文字を縮めず縦スクロールで読みます。Fullscreen APIが利用できない、または要求が拒否された場合は理由を通知します。

モニター全体に表示するには、Edgeなどの独立したブラウザーで開いてください。埋め込みプレビューでは、Fullscreen APIが成功してもプレビュー枠内に留まる場合があります。

## 再生成

制作標準は **`github-brand-html-artifacts` 0.5.0-p05.2**、制作環境は **Node.js 22.16.x** です。再生成には同じ版のSkillと、そのlockfileに固定された既存の依存を使います。Skillや依存ライブラリ自体は、このリポジトリには含めていません。

リポジトリのルートで実行する例です。`<NEW_OUTPUT_DIR>` は、親ディレクトリが存在する新しい出力先へ置き換えてください。

```powershell
$skill = Join-Path $HOME '.copilot\skills\github-brand-html-artifacts'
node "$skill\scripts\build.mjs" --input ".\copilot-beginner-agentic\source" --output "<NEW_OUTPUT_DIR>"
node "$skill\scripts\validate.mjs" --input ".\copilot-beginner-agentic\source" --output "<NEW_OUTPUT_DIR>"
```

検証した `presentation.html` を、バイトを保持して `index.html` として配置します。本文を変える場合は入力から再生成し、完成HTMLへ直接CSSやJavaScriptを追加しないでください。今回の公開用追加では、完成版HTMLと入力を再生成・改変せずに保存しています。

埋め込みのフォント・アイコンなどの原文ライセンスと、ロゴの利用条件を保持してください。リポジトリのMIT表記を、埋め込み素材のライセンスの代わりにはしません。

## 確認範囲と制限

Fullscreen APIの開始・終了と、独立したブラウザーでの実機操作は区別します。過去に独立したChromeでスライドだけの全画面表示は確認済みですが、バックグラウンド入力ではネイティブなEscとTabの動作を確認できていません。自動検査の成功を、実機のEsc・Tab確認済みという意味には扱いません。

他のOS・ブラウザーで同じ描画を保証するものではありません。製品情報の基準日、出典、条件を確認して利用してください。
