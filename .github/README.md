# FiguraAvatarsReadmeTemplate
私（Gakuto1112）のFiguraアバターのREADMEに含まれる共通の文章をテンプレート化するレポジトリです。

`templates/`に英語版と日本語版の各種README用のテンプレートがあります。

それぞれのFiguraアバターのレポジトリでREADMEが変更されると、[Github Actions](https://github.co.jp/features/actions)によって、このレポジトリのテンプレートを使用して表示用のREADMEを生成します。

READMEのテンプレートが変更されると、[Github Actions](https://github.co.jp/features/actions)によって、対象の全レポジトリと対象の全ブランチのREADMEを生成します。

## テンプレートの挿入方法
対象のレポジトリには`.github/README_templates`配下に生成するREADMEの素になるファイルがあります。これらのファイル内に`<!-- $inject(<テンプレート名>) -->`と入力することで、この場所がテンプレートに置換されます。テンプレート名については下の[テンプレートファイルについて](#テンプレートファイルについて)を確認して下さい。

## テンプレートファイルについて
`templates/`に各種テンプレート用のマークダウンファイルがあります。`templates/`配下はテンプレート名のディレクトリがあります。更にそれらの配下に英語版のテンプレート（`en.md`）と日本語版のテンプレート（`jp.md`）があります。

現在このレポジトリにあるテンプレートは以下の通りです。

| テンプレート名 | 内容 |
| - | - |
| locale_link | 言語切り替えリンク |
| how_to_use | 使用方法の章 |
| notes | 注意事項の章 |

注意事項の章のテンプレートには、レポジトリ名が入るプレースホルダがありますが、ここには[Github Actions](https://github.co.jp/features/actions)によって実際の値が代入されます。

## ワークフローファイルについて
`.github/workflows`に[Github Actions](https://github.co.jp/features/actions)ワークフローの定義ファイルがあります。

### generate_my_figura_avatar_readme.yaml
FiguraアバターのREADMEが変更された時（`push`）にこのワークフローが呼ばれ（`workflow_call`）、READMEが生成されます。

#### 実行引数
##### branch-name
必須、string

READMEを生成する対象のブランチ名

### call_dispatcher.yaml
このレポジトリのテンプレートが変更された時（`push`）に対象のFiguraレポジトリに対してワークフローを実行させます（`repository_dispatch`）。

レポジトリ変数の`TARGET_REPOSITORIES`に呼び出し対象のレポジトリ名が配列で定義されています。また、レポジトリシークレットの`DISPATCH_TOKEN`にこのワークフローを実行する為のPersonal Access Tokenが定義されています。