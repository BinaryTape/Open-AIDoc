[//]: # (title: ライブラリをnpmに公開する – チュートリアル)

<tldr>
<p><a href="https://npm-publish.petuska.dev/latest/">npm-publish Gradle プラグイン</a>を使用して、Kotlin Multiplatformライブラリを手動またはGitHub Actionsを使ってnpmに公開します。</p>
</tldr>

ライブラリを公開するには、以下の手順が必要です。

1. [npmのアカウント](https://docs.npmjs.com/creating-a-new-npm-user-account)や[アクセストークン](https://docs.npmjs.com/creating-and-viewing-access-tokens)などの認証情報を準備する。
2. Kotlin Multiplatformプロジェクトで公開プラグインを設定する。
3. 公開プラグインに認証情報を提供するか、継続的インテグレーション（CI）用のTrusted Publisherを設定する。
4. 手動またはCIを使用して公開タスクを実行する。

このチュートリアルでは、プロジェクトのホスティングにGitHubを使用し、GitHub Actions経由でCIを実行します。

## サンプルライブラリ {id="sample-library"}

実際の動作する設定を確認しながら進めるために、[サンプルライブラリプロジェクト](https://github.com/Kotlin/kotlin-multiplatform-web-library)を利用できます。

コードを再利用する場合は、**すべてのサンプル値を実際のプロジェクトに応じた値に置き換えてください**。

## アカウントと認証情報の準備 {id="prepare-accounts-and-credentials"}

npmに公開するには、[npmポータルにサインイン](https://www.npmjs.com/login)している必要があります。

このチュートリアルでは、手動公開を設定するためにOrganization（組織）とアクセストークンが必要です。

### シンプルなOrganizationの作成 {id="create-a-simple-organization"}

このチュートリアルでは、名前の衝突を避けるためにnpmのOrganization配下にライブラリを公開します。

新しいOrganizationを作成するには、[npmのドキュメント](https://docs.npmjs.com/creating-an-organization)に従ってください。

### アクセストークンの生成 {id="generate-an-access-token"}

手動でnpmに公開するには、新しく作成したOrganization配下にパッケージを公開できるアクセストークンが必要です。
トークンを生成するには、[npmのガイド](https://docs.npmjs.com/creating-and-viewing-access-tokens)に従ってください。

このチュートリアルでは、簡略化したセキュリティ設定を使用します。
* **Bypass two-factor authentication (2FA)** オプションを有効にします。
* トークンの全般的な権限（general permissions）とOrganizationの権限の両方を **Read and write** に設定します。

## ライブラリプロジェクトの設定 {id="configure-the-library-project"}

[サンプルプロジェクト](https://github.com/Kotlin/kotlin-multiplatform-web-library)を使用する場合は、公開前にデフォルトの名前を更新してください。
これには以下が含まれます。

* ライブラリモジュールの名前
* `settings.gradle.kts` ファイルで設定されているプロジェクト名

名前を設定したら、次の手順に従って公開の設定を行います。

### 公開プラグインの設定 {id="set-up-the-publishing-plugin"}

このチュートリアルでは、npmへの公開を支援する公式の [npm-publish プラグイン](https://github.com/Kotlin/npm-publish) を使用します。
プラグインの詳細や利用可能な設定オプションについては、[プラグインのドキュメント](https://npm-publish.petuska.dev)を参照してください。

Kotlin Multiplatformプロジェクトにプラグインを追加します。

1. ライブラリモジュールの `build.gradle.kts` ファイルを開きます。

2. `plugins {}` ブロックに次の行を追加します。

    ```kotlin
    // <module directory>/build.gradle.kts
    
    plugins {
        kotlin("npm-publish") version "%npmPublishPlugin%"
    }
    ```
    
    > プラグインの最新バージョンについては、[Releases](https://github.com/Kotlin/npm-publish/releases) ページを確認してください。
    > 
    {style="note"}

3. 次の設定を追加します。
   ライブラリに応じた値にカスタマイズしてください。
   必須のパラメータは `organization`、`authToken`、`packageName`、`version` のみです。
   残りは拡張例として記載しています。

    ```kotlin
    // <module directory>/build.gradle.kts
    npmPublish {
        organization = "organization_name_without_the_@_sign"
        
        registries {
            npmjs {
                // パッケージを公開するコマンドを実行する際、
                // この環境変数としてnpmトークンを渡します
                authToken = System.getenv("NPM_TOKEN")
            }
        }
    
        packages {
            named("js") {
                version = "0.0.1"
                packageName = "greetings"
                readme = file("../README.md")
    
                packageJson {
                    license = "Apache 2.0"
                    homepage = "https://github.com/Kotlin/kotlin-multiplatform-web-library#readme"
                    description = "Shared Kotlin/JS Greetings library"
                    keywords = listOf("kotlin", "kotlin-js", "greetings", "shared", "api")
                    author {
                        name = "Kotlin Developer Advocate"
                        url = "https://github.com/kotlin-hands-on/"
                    }
                    contributors = listOf(
                        Person {
                            name = "John Smith"
                            email = "john.smith@example.com"
                            url = "https://github.com/johnsmith"
                        },
                    )
                    repository {
                        type = "git"
                        url = "https://github.com/Kotlin/kotlin-multiplatform-web-library.git"
                    }
                }
            }
        }
    }
    ```

    > これを設定するために、[Gradleプロパティ](https://docs.gradle.org/current/userguide/build_environment.html)を使用することもできます。
    > 
    {style="tip"}

`npmPublish {}` ブロックの重要な設定は以下のとおりです。

* `organization` パラメータと `registries {}` ブロックで認証の詳細を指定します。
  ここではメインのnpmレジストリと、公開タスク実行時にトークンを保持する `NPM_TOKEN` 環境変数の名前を使用します。
* `packageName` パラメータと `version` パラメータは、必須のパッケージオプションを定義します。
  * `version` パラメータは省略可能で、省略した場合はモジュールのバージョンがデフォルト値として使用されます。
  * `packageName` パラメータは省略可能で、省略した場合はモジュール名がデフォルト値として使用されます。
* `packageJson {}` ブロックには各種メタデータを指定します。

## 手動での公開 {id="publish-manually"}

手動公開は、プロジェクト構造を試行錯誤している段階や、公開の自動化を独自に実装したい場合に役立ちます。

これでローカルマシンからライブラリをnpmに公開できるようになりました。
公開するには、`YOUR_ACCESS_TOKEN` の部分に先ほど生成したアクセストークンを貼り付けて、次のコマンドを実行します。

```bash
NPM_TOKEN=YOUR_ACCESS_TOKEN ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

ライブラリが公開されると、npmレジストリで確認できるようになります。
npmのOrganizationページを開き、（個人の **Packages** ページではなく）**Packages** タブを確認してください。

![npmに公開されたライブラリ](published-on-npm.png){width=700}

### トラブルシューティング {id="troubleshooting"}

手動公開でよく発生する問題には、以下のようなものがあります。

* `build.gradle.kts` 設定内の `version` フィールドに注意してください。
  すでに同じバージョンまたはそれ以前のバージョンでパッケージが公開されている場合、npmは公開を失敗させます。
* Organizationスコープのパッケージ用にトークンを生成する際は、全般的な権限（general permissions）**および** Organizationの権限の両方を設定していることを確認してください。

## 継続的インテグレーション（CI）を使用した公開 {id="publish-using-continuous-integration-ci"}

npmのTrusted Publisher機能を使用すると、OpenID Connectを利用したCIを素早くセットアップできます。
このアプローチにより、トークンの生成と管理が完全に不要になります。

この例では、[GitHub Actions](https://docs.github.com/en/actions) を使用したワークフローを設定します。

### GitHub Actionsワークフローファイルの作成 {id="create-a-github-actions-workflow-file"}

GitHub Actionを設定する `.github/workflows/publish.yml` ファイルを作成します。

```yaml
# .github/workflows/publish.yml

name: Publish

on:
  release:
    types: [released, prereleased]

permissions:
  id-token: write  # GitHub ActionsがnpmのTrusted Publishingと
                   # 連携するために必要です
  contents: read

jobs:
  publish:
    name: Release build and publish
    runs-on: ubuntu-latest
    steps:
      # トリガーとなったブランチをチェックアウト
      - name: Check out code
        uses: actions/checkout@v4

      # Gradleタスクを実行するためのJDKをセットアップ
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: 21

      # ライブラリモジュールのnpm公開Gradleタスクを実行
      - name: Publish to npm
        run: ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

このファイルをプロジェクトをホストしているGitHubリポジトリにコミットしてプッシュすると、そのリポジトリでGitHubリリースが作成されるたびにワークフローが実行されます。

> リポジトリに[タグがプッシュされたときにトリガー](https://stackoverflow.com/a/61892639)するようにワークフローを設定することもできます。
> 
{style="tip"}

### GitHub ActionsをTrusted Publisherとして設定 {id="set-up-github-actions-as-your-trusted-publisher"}

ワークフローをプッシュしたら、GitHub Actionを使用してnpmパッケージに[Trusted Publisher](https://docs.npmjs.com/trusted-publishers)を追加できます。

1. [公開済みパッケージ](#手動での公開)のページを開きます。
2. **Settings** タブを開き、**Trusted Publisher** セクションを見つけます。
3. **Select your publisher** の下にある **GitHub Actions** ボタンをクリックします。
4. フォームに入力します。
   * GitHubの名前（またはOrganization）
   * リポジトリ名
   * ワークフローファイル名（このチュートリアルでは [publish.yml](#github-actionsワークフローファイルの作成) を使用しました）。
5. **Setup connection** ボタンをクリックします。

![GitHub Actions向けのnpm Trusted Publisher設定](npm-trusted-publisher-github.png)

> [npmは入力された座標情報を検証しない](https://docs.npmjs.com/trusted-publishers#troubleshooting)ため、詳細を正しく入力していることを確認してください。
> 
{style="warning"}

作成された接続は、パッケージの設定にある **Trusted Publishers** セクションに一覧表示されます。
これにより、指定された座標のワークフローがnpmへの公開を承認されたことになります。

### GitHubでリリースを作成する {id="create-a-release-on-github"}

ワークフローとTrusted Publisherの接続が設定できたら、[GitHubリリースを作成](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release)して公開をトリガーする準備が整いました。

1. `build.gradle.kts` の設定で、パッケージのバージョンを公開したいバージョンに設定します。

   > バージョン番号がすでに使用されている場合、またはすでに公開されているバージョンより低い場合、npmは公開を許可しません。
   > 
   {style="note"}

2. GitHubリポジトリに移動します。
3. 右側のサイドバーで **Releases** をクリックします。
4. **Draft a new release** ボタン（このリポジトリで過去にリリースを作成したことがない場合は **Create a new release** ボタン）をクリックします。
5. Gitタグを作成または選択します（システム間での番号の一貫性を保つため、可能な限りモジュールのバージョンと一致させてください）。
6. リリースのタイトルを設定します（タグと同じ名前にすると便利です）。
   
   すべてを把握しやすくするために、タグのバージョンは `build.gradle.kts` ファイルで指定したライブラリのバージョン番号と同じにすることをお勧めします。

   ![GitHubでリリースを作成](create-release-and-tag-for-npm.png){width=700}

7. **Publish release** ボタンをクリックします。

Actionがトリガーされたかどうかを確認するには、GitHubリポジトリのページ上部にある **Actions** タブをクリックします。
新しく公開されたリリースによって、公開ワークフローの実行がトリガーされたことが確認できるはずです。
ワークフローをクリックすると、公開タスクのログを表示できます。

ワークフローの実行が完了すると、npmレジストリのパッケージページにパッケージの新しいバージョンが表示されます。

![CI/CDからnpmに公開されたライブラリ](published-second-version-on-npm.png){width=700}

## 次のステップ {id="what-s-next"}

* [READMEにshields.ioバッジを追加する](https://shields.io/badges/npm-version)
* [DokkaでAPIドキュメントを生成する](https://kotl.in/dokka)
* [Renovateで依存関係の更新を自動化する](https://docs.renovatebot.com/)
* [Kotlin Slackでコミュニティとライブラリを共有する](https://kotlinlang.slack.com/)
  （登録は https://kotl.in/slack をご覧ください）