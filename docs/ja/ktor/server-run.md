[//]: # (title: 実行)

<show-structure for="chapter" depth="2"/>

<link-summary>
サーバーKtorアプリケーションの実行方法を学びます。
</link-summary>

Ktorサーバーアプリケーションを実行する際は、以下の点に注意してください。
* [サーバーの作成方法](server-create-and-configure.topic)によって、[パッケージ化されたKtorアプリケーション](#package)の実行時にコマンドライン引数を渡してサーバーパラメータをオーバーライドできるかどうかが決まります。
* [EngineMain](server-create-and-configure.topic#engine-main)を使用してサーバーを起動する場合、GradleやMavenのビルドスクリプトでメインクラス名を指定する必要があります。
* [サーブレットコンテナ](server-war.md)内でアプリケーションを実行するには、特定のサーブレット構成が必要です。

このトピックでは、これらの構成の詳細を確認し、IntelliJ IDEAおよびパッケージ化されたアプリケーションとしてKtorアプリケーションを実行する方法を説明します。

## 構成の詳細 {id="specifics"}

### 構成: コード vs 設定ファイル {id="code-vs-config"}

Ktorアプリケーションの実行は、[サーバーの作成](server-create-and-configure.topic)に使用した方法（`embeddedServer`または`EngineMain`）によって異なります。
* `embeddedServer`の場合、ホストアドレスやポートなどのサーバーパラメータはコード内で構成されるため、アプリケーション実行時にこれらのパラメータを変更することはできません。
* `EngineMain`の場合、Ktorは`HOCON`または`YAML`形式の外部ファイルから設定を読み込みます。このアプローチでは、[パッケージ化されたアプリケーション](#package)をコマンドラインから実行し、対応する[コマンドライン引数](server-configuration-file.topic#command-line)を渡すことで、必要なサーバーパラメータをオーバーライドできます。

### EngineMainの起動: GradleおよびMavenの詳細 {id="gradle-maven"}

`EngineMain`を使用してサーバーを作成する場合、目的の[エンジン](server-engines.md)でサーバーを起動するための`main`関数を指定する必要があります。
以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)は、Nettyエンジンでサーバーを実行するために使用される`main`関数を示しています。

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

`main`関数内でエンジンを構成せずにGradle/Mavenを使用してKtorサーバーを実行するには、以下のようにビルドスクリプトでメインクラス名を指定する必要があります。

<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
mainClassName = "io.ktor.server.netty.EngineMain"
```

</TabItem>
<TabItem title="Maven" group-key="maven">

```xml
<properties>
    <main.class>io.ktor.server.netty.EngineMain</main.class>
</properties>
```

</TabItem>

### WARの詳細

Ktorでは、Netty、Jetty、Tomcatなどの任意のエンジンを使用して、アプリケーション内で直接[サーバーを作成して起動](server-create-and-configure.topic)することができます。この場合、アプリケーションはエンジンの設定、接続、SSLオプションを制御できます。

このアプローチとは対照的に、サーブレットコンテナはアプリケーションのライフサイクルと接続設定を制御する必要があります。Ktorは、アプリケーションの制御をサーブレットコンテナに委譲する特別な`ServletApplicationEngine`エンジンを提供しています。アプリケーションの構成方法については、[Warプラグインの構成](server-war.md#configure-war)から確認できます。

## アプリケーションの実行 {id="run"}
> 開発中にサーバーを再起動すると時間がかかる場合があります。Ktorでは、[オートリロード](server-auto-reload.topic)を使用することでこの制限を克服できます。これはコードの変更時にアプリケーションクラスをリロードし、迅速なフィードバックループを提供します。

### Gradle/Mavenを使用したアプリケーションの実行 {id="gradle-maven-run"}

GradleまたはMavenを使用してKtorアプリケーションを実行するには、対応するプラグインを使用します。
* Gradleの場合は[Application](server-packaging.md)プラグイン。 [Nativeサーバー](server-native.md)の場合は、[Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform)プラグインを使用します。
* Mavenの場合は[Exec](https://www.mojohaus.org/exec-maven-plugin/)プラグイン。

> IntelliJ IDEAでKtorアプリケーションを実行する方法については、IntelliJ IDEAドキュメントの[Run a Ktor application](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app)セクションを参照してください。

### パッケージ化されたアプリケーションの実行 {id="package"}

アプリケーションをデプロイする前に、[パッケージ化](server-deployment.md#packaging)セクションで説明されているいずれかの方法でパッケージ化する必要があります。
生成されたパッケージからKtorアプリケーションを実行する方法はパッケージの種類によって異なり、以下のようになります。
* ファットJAR（fat JAR）にパッケージ化されたKtorサーバーを実行し、構成されたポートをオーバーライドするには、次のコマンドを実行します。
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* Gradleの[Application](server-packaging.md)プラグインを使用してパッケージ化されたアプリケーションを実行するには、対応する実行ファイルを実行します。

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
  
* サーブレットKtorアプリケーションを実行するには、[Gretty](server-war.md#run)プラグインの`run`タスクを使用します。

    ```_
    ./gradlew run