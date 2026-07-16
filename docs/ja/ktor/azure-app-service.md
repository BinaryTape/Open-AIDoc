[//]: # (title: Azure App Service)

<show-structure for="chapter" depth="2"/>

<link-summary>このチュートリアルでは、Ktor アプリケーションのビルド、設定、および [Azure App Service](https://azure.microsoft.com/products/app-service/) へのデプロイ方法について説明します。</link-summary>

このチュートリアルでは、Ktor アプリケーションのビルド、設定、および [Azure App Service](https://azure.microsoft.com/products/app-service/) へのデプロイ方法について説明します。

## 前提条件 {id="prerequisites"}
このチュートリアルを開始する前に、以下が必要です。
* Azure アカウント（[無料試用版はこちら](https://azure.microsoft.com/en-us/free/)）。
* マシンにインストールされた [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)。

## サンプルアプリケーションの作成 {id="create-sample-app"}

[Ktor プロジェクトの作成、オープン、および実行](server-create-a-new-project.topic)の説明に従って、サンプルアプリケーションを作成します。この例では、[embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) および [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) のプロジェクトに基づいたコードとコマンドを示します。

> 上記のチュートリアルでは、アプリケーションを設定する 2 つの方法が示されています。コード内で値を直接指定する方法と、設定ファイルを使用する方法です。どちらの場合も、重要な設定はサーバーが受信リクエストをリッスンするポートです。

## アプリケーションのセットアップ {id="setup-app"}

### ステップ 1: ポートの設定 {id="port"}

Azure App Service では、環境変数 `PORT` に受信リクエスト用に開放されているポート番号が含まれています。[Ktor サーバーの設定](server-create-and-configure.topic)でアプリケーションをどのように作成したかに応じて、次の 2 つの場所のいずれかでこの環境変数を読み込むようにコードを更新する必要があります。

* ポート設定を**コード内**で行う例を使用した場合は、`PORT` 環境変数は `System.getenv()` で読み込み、`.toIntOrNull()` で整数にパースできます。`Application.kt` ファイルを開き、以下のようにポート番号を変更します。

   ```kotlin
   fun runBasicServer() {
      val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
      embeddedServer(Netty, port = port) {
          // ...
      }.start(wait = true)
   }
    ```
* サーバー設定が**設定ファイル** `application.conf` で定義されている場合は、次の例のように `PORT` 環境変数を読み込むように更新します。

   ```
   ktor {
       deployment {
           port = ${PORT:8080}
       }
   }
   ```
   {style="block"}

### ステップ 2: プラグインの追加 {id="plugins"}
`build.gradle.kts` ファイルを開き、`plugins` セクションに以下の行を追加します。
```kotlin
plugins {
    application
    kotlin("jvm")
    id("io.ktor.plugin") version "%ktor_version%" // 追加
    id("com.microsoft.azure.azurewebapp") version "1.10.0" // 追加
}
```

`io.ktor.plugin` は[ファット JAR (fat JAR)](server-fatjar.md) を作成するためのタスクを提供し、[Azure WebApp Plugin for Gradle](https://github.com/microsoft/azure-gradle-plugins) は Azure で必要なすべてのリソースを簡単に作成するために使用されます。

ファット JAR に明確なエントリポイントが定義されるように、`application` セクションに `mainClass` が定義されていることを確認してください。

```kotlin
application {
    mainClass.set("com.example.ApplicationKt")
}
```
`engine-main` テンプレートを使用してプロジェクトを作成した場合、メインクラスは次のようになります。

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

### ステップ 3: 設定 {id="configuration"}

デプロイ先となる Java Web アプリを App Service にすでに作成済みの場合は、このステップをスキップできます。

そうでない場合は、Azure Webapp プラグインが自動的に作成するように、`build.gradle.kts` ファイルの末尾に以下のエントリを追加します。

```kotlin
 // デプロイタスクが想定する名前にファット JAR の名前を変更します
ktor {
    fatJar {
        archiveFileName.set("embedded-server.jar")
    }
}

// 通常 Azure プラグインが実行する `jar` タスクを無効にし、
// 代わりに `fatJar` タスクによって作成されたアーカイブをデプロイするようにします
tasks.named("jar") {
    enabled = false
}

// デプロイタスクが最初にファット JAR をビルドするようにします
tasks.named("azureWebAppDeploy") {
    dependsOn("buildFatJar")
}

// Azure Webapp プラグインの設定
azurewebapp {
  subscription = "YOUR-SUBSCRIPTION-ID"
  resourceGroup = "RESOURCE-GROUP-NAME"
  appName = "WEBAPP-NAME"
  pricingTier = "YOUR-PLAN" // 例: "F1", "B1", "P0v3" など
  region = "YOUR-REGION" // 例: "westus2"
  setRuntime(closureOf<com.microsoft.azure.gradle.configuration.GradleRuntimeConfig> {
    os("Linux") // または "Windows"
    webContainer("Java SE")
    javaVersion("Java 21")
  })
  setAuth(closureOf<com.microsoft.azure.gradle.auth.GradleAuthConfig> {
    type = "azure_cli"
  })
}
```

利用可能な設定プロパティの詳細な説明については、[Webapp 設定のドキュメント](https://github.com/microsoft/azure-gradle-plugins/wiki/Webapp-Configuration)を参照してください。

* `pricingTier`（サービスプラン）の値は、[Linux 用](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/)および [Windows 用](https://azure.microsoft.com/en-us/pricing/details/app-service/windows/)で確認できます。
* `region` の値のリストは、次の Azure CLI コマンド：`az account list-locations --query "[].name" --output tsv` を実行するか、[製品の可用性表](https://go.microsoft.com/fwlink/?linkid=2300348&clcid=0x409)で "App Service" を検索することで取得できます。

## アプリケーションのデプロイ {id="deploy-app"}

### 新しい Web アプリへのデプロイ

Azure Web App Deploy プラグインで使用される認証方法には Azure CLI が使用されます。まだ行っていない場合は、`az login` で一度ログインし、指示に従ってください。

最後に、`azureWebAppDeploy` タスクを実行してアプリケーションをデプロイします。このタスクは、最初にファット JAR をビルドしてからデプロイするように設定されています。

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
</Tabs>

このタスクは、リソースグループ、プラン、および Web アプリを作成し、ファット JAR をデプロイします。デプロイが成功すると、次のような出力が表示されるはずです。

```text
> Task: :embedded-server:azureWebAppDeploy
Auth type: AZURE_CLI
Username: some.username@example.com
Subscription: Some Subscription(13936cf1-cc18-40be-a0d4-177fe532b3dd)
Start creation Resource Group(resource-group) in region (Some Region)
Resource Group (resource-group) is successfully created.
Start creating App Service plan (asp-your-webapp-name)...
App Service plan (asp-your-webapp-name) is successfully created
Start creating Web App(your-webapp-name)...
Web App(your-webapp-name) is successfully created
Trying to deploy artifact to your-webapp-name...
Deploying (C:\docs\ktor-documentation\codeSnippets\snippets\embedded-server\build\libs\embedded-server.jar)[jar] ...
Application url: https://your-webapp-name.azurewebsites.net
```

デプロイが完了すると、上記の URL で新しい Web アプリが実行されていることを確認できるはずです。

### 既存の Web アプリへのデプロイ

Azure App Service に既存の Java Web アプリがすでにある場合は、まず [Ktor プラグイン](#plugins)によって提供される `buildFatJar` タスクを実行して、ファット JAR をビルドします。

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:buildFatJar"></code-block>
</TabItem>
</Tabs>

次に、Azure CLI の次のコマンドを使用して、先ほど作成したファット JAR をデプロイします。

```bash
az webapp deploy -g RESOURCE-GROUP-NAME -n WEBAPP-NAME --src-path ./path/to/embedded-server.jar --restart true
```

このコマンドは JAR ファイルをアップロードし、Web アプリを再起動します。しばらくすると、デプロイの結果が表示されるはずです。

```text
Deployment type: jar. To override deployment type, please specify the --type parameter. Possible values: war, jar, ear, zip, startup, script, static
Initiating deployment
Deploying from local path: ./snippets/embedded-server/build/libs/embedded-server.jar
Warming up Kudu before deployment.
Warmed up Kudu instance successfully.
Polling the status of sync deployment. Start Time: 2025-09-07 00:07:14.729383+00:00 UTC
Status: Build successful. Time: 5(s)
Status: Starting the site... Time: 23(s)
Status: Starting the site... Time: 41(s)
Status: Site started successfully. Time: 44(s)
Deployment has completed successfully
You can visit your app at: http://your-app-name.some-region.azurewebsites.net