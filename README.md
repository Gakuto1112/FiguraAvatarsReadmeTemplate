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

各テンプレートには、レポジトリ名が入るプレースホルダ（`<!-- $REPOSITORY_NAME -->`）がありますが、ここには[Github Actions](https://github.co.jp/features/actions)によって実際の値が代入されます。

## ワークフローファイルについて
`.github/workflows`に[Github Actions](https://github.co.jp/features/actions)ワークフローの定義ファイルがあります。

### generate_my_figura_avatar_readme.yml
FiguraアバターのREADMEが変更された時（`push`）にこのワークフローが呼ばれ（`workflow_call`）、READMEが生成されます。

#### 実行引数
##### branch-name
必須、string

READMEを生成する対象のブランチ名

### call_dispatcher.yml
このレポジトリのテンプレートが変更された時（`push`）に対象のFiguraレポジトリに対してワークフローを実行させます（`repository_dispatch`）。

レポジトリ変数の`TARGET_REPOSITORIES`に呼び出し対象のレポジトリ名が配列で定義されています。また、レポジトリシークレットの`DISPATCH_TOKEN`にこのワークフローを実行する為のPersonal Access Tokenが定義されています。

## アバターを新規作成した後にやること
（改良されたワークフローでは手順4が不要となります。）
1. アバターのレポジトリに`.github`を作成する。
2. `.github/README_templates`に`ja.md`（日本語版README）と`en.md`（英語版README）を作成する。これらのファイルにREADMEを記述する。[テンプレートの挿入方法](#テンプレートの挿入方法)も参照する。
3. `.github/workflows`に`generate_readme.yml`と`dispatch_readme.yml`を追加する。これらのファイルは既存のアバターのレポジトリからコピーする。
4. レポジトリの変数に`TARGET_BRANCHES`という名前でREADMEを生成する対象のブランチの配列を定義する（例：`["Senko", "Shiro", "Suzu"]`）。
5. このレポジトリの変数`TARGET_REPOSITORIES`に新規アバターのレポジトリを追加する。

## アバターのブランチを増やした後にやること
（改良されたワークフローでは手順2及び3が不要となります。）
1. 増やしたアバターのブランチにも`.github`の中身を追加する。
2. `.github/workflows/generate_readme.yml`の`on`->`push`->`branches`に増やしたアバターのブランチを追加する。
3. このレポジトリの変数`TARGET_BRANCHES`に増やしたアバターのブランチを追加する。