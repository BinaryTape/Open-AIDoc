[//]: # (title: 実行)

<show-structure for="chapter" depth="2"/>

<link-summary>
Ktor サーバーアプリケーションを実行する方法を学びます。
</link-summary>

Ktor サーバーアプリケーションを実行する際は、以下の点に注意してください。
* [サーバーを作成する](server-create-and-configure.topic)方法は、[パッケージ化された Ktor アプリケーション](#package)を実行する際にコマンドライン引数を渡してサーバーパラメータを上書きできるかどうかに影響します。
* [EngineMain](server-create-and-configure.topic#engine-main) を使用してサーバーを起動する場合、Gradle/Maven のビルドスクリプトでメインクラス名を指定する必要があります。
* アプリケーションを[サーブレットコンテナ](server-war.md)内で実行するには、特定のサーブレット設定が必要です。

このトピックでは、これらの設定の詳細を確認し、IntelliJ IDEA 内やパッケージ化されたアプリケーションとして Ktor アプリケーションを実行する方法を説明します。

## 設定の詳細 {id="specifics"}

### 設定: コード vs 設定ファイル {id="code-vs-config"}

Ktor アプリケーションの実行方法は、[サーバーを作成した](server-create-and-configure.topic)方法（`embeddedServer` または `EngineMain`）によって異なります。
* `embeddedServer` の場合、サーバーパラメータ（ホストアドレスやポートなど）はコード内で設定されるため、アプリケーションの実行時にこれらのパラメータを変更することはできません。
* `EngineMain` の場合、Ktor は `HOCON` または `YAML` 形式を使用した外部ファイルから設定を読み込みます。このアプローチを使用すると、コマンドラインから[パッケージ化されたアプリケーション](#package)を実行し、対応する[コマンドライン引数](server-configuration-file.topic#command-line)を渡すことで必要なサーバーパラメータを上書きできます。

### EngineMain の起動: Gradle と Maven の詳細 {id="gradle-maven"}

サーバーの作成に `EngineMain` を使用する場合、目的の[エンジン](server-engines.md)でサーバーを起動するための `main` 関数を指定する必要があります。
以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)は、Netty エンジンでサーバーを実行するために使用される `main` 関数を示しています。

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

`main` 関数の内部でエンジンを設定せずに Gradle/Maven を使用して Ktor サーバーを実行するには、ビルドスクリプトで次のようにメインクラス名を指定する必要があります。

<Tabs group="languages" id="main-class-set-engine-main">
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
</Tabs>

### WAR の詳細 {id="war-specifics"}

Ktor では、アプリケーション内で目的のエンジン（Netty、Jetty、Tomcat など）を使用して[サーバーを作成および起動](server-create-and-configure.topic)できます。この場合、アプリケーションがエンジンの設定、接続、および SSL オプションを制御します。

このアプローチとは対照的に、サーブレットコンテナがアプリケーションのライフサイクルと接続設定を制御する必要があります。Ktor は、アプリケーションの制御をサーブレットコンテナに委譲する特別な `ServletApplicationEngine` エンジンを提供しています。アプリケーションの設定方法については、[War プラグインの設定](server-war.md#configure-war)を参照してください。

## アプリケーションの実行 {id="run"}
> 開発中のサーバーの再起動には時間がかかる場合があります。Ktor では、コードの変更時にアプリケーションクラスをリロードして高速なフィードバックループを提供する[自動リロード](server-auto-reload.topic)を使用することで、この制限を克服できます。

### Gradle/Maven を使用したアプリケーションの実行 {id="gradle-maven-run"}

Gradle または Maven を使用して Ktor アプリケーションを実行するには、対応するプラグインを使用します。
* Gradle の場合は [Application](server-packaging.md) プラグイン。[Native サーバー](server-native.md)の場合は [Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform) プラグインを使用します。
* Maven の場合は [Exec](https://www.mojohaus.org/exec-maven-plugin/) プラグイン。

> IntelliJ IDEA で Ktor アプリケーションを実行する方法については、IntelliJ IDEA ドキュメントの [Ktor アプリケーションの実行](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app) セクションを参照してください。

### パッケージ化されたアプリケーションの実行 {id="package"}

アプリケーションをデプロイする前に、[パッケージ化](server-deployment.md#packaging)セクションで説明されているいずれかの方法でパッケージ化する必要があります。
生成されたパッケージから Ktor アプリケーションを実行する方法はパッケージの種類によって異なり、次のようになります。
* fat JAR にパッケージ化された Ktor サーバーを実行し、設定されたポートを上書きするには、次のコマンドを実行します:
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* Gradle の [Application](server-packaging.md) プラグインを使用してパッケージ化されたアプリケーションを実行するには、対応する実行可能ファイルを実行します:

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
  
* サーブレットの Ktor アプリケーションを実行するには、[Gretty](server-war.md#run) プラグインの `run` タスクを使用します。