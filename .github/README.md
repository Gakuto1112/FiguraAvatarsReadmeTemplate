# FiguraAvatarsReadmeTemplate
私（Gakuto1112）のFiguraアバターのREADMEに含まれる共通の文章をテンプレート化するレポジトリです。

`templates/`に英語版と日本語版の各種README用のテンプレートがあります。

それぞれのFiguraアバターのレポジトリでREADMEが変更されると、[Github Actions](https://github.co.jp/features/actions)によって、このレポジトリのテンプレートを使用して表示用のREADMEを生成します。

READMEのテンプレートが変更されると、[Github Actions](https://github.co.jp/features/actions)によって、対象の全レポジトリと対象の全ブランチのREADMEを生成します。

## テンプレートファイルについて
`templates/`に各種テンプレート用のマークダウンファイルが格納されています。`templates/`配下はテンプレート名のディレクトリがあります。更にそれらの配下に英語版のテンプレート（`en.md`）と日本語版のテンプレート（`jp.md`）があります。

現在このレポジトリにあるテンプレートは以下の通りです。

| テンプレート名 | 内容 |
| - | - |
| locale_link | 言語切り替えリンク |
| how_to_use | 使用方法の章 |
| notes | 注意事項の章 |

注意事項の章のテンプレートには、レポジトリ名が入るプレースホルダがありますが、ここには[Github Actions](https://github.co.jp/features/actions)によって実際の値が代入されます。