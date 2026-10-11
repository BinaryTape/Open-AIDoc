[//]: # (title: 実行)

<show-structure for="chapter" depth="2"/>

<link-summary>
Ktorサーバーアプリケーションを実行する方法を学びます。
</link-summary>

Ktorサーバーアプリケーションを実行する際は、以下の点に注意してください。
* [サーバーの作成](server-create-and-configure.topic)方法によって、[パッケージ化されたKtorアプリケーション](#package)の実行時にコマンドライン引数を渡してサーバーパラメータを上書きできるかどうかが決まります。
* [EngineMain](server-create-and-configure.topic#engine-main)を使用してサーバーを起動する場合、Gradle/Mavenのビルドスクリプトでメインクラス名を指定する必要があります。
* [サーブレットコンテナ](server-war.md)内でアプリケーションを実行するには、特定のサーブレット設定が必要です。

このトピックでは、これらの設定に関する詳細を確認し、IntelliJ IDEAでの実行方法およびパッケージ化されたアプリケーションとしての実行方法について説明します。

## 設定の詳細 {id="specifics"}

### 設定：コード vs 設定ファイル {id="code-vs-config"}

Ktorアプリケーションの実行方法は、[サーバーの作成](server-create-and-configure.topic)に使用した方法（`embeddedServer` または `EngineMain`）によって異なります。
* `embeddedServer` の場合、サーバーパラメータ（ホストアドレスやポートなど）はコード内で設定されるため、アプリケーションの実行時にこれらのパラメータを変更することはできません。
* `EngineMain` の場合、Ktorは `HOCON` または `YAML` 形式の外部ファイルから設定を読み込みます。このアプローチを使用すると、コマンドラインから[パッケージ化されたアプリケーション](#package)を実行し、対応する[コマンドライン引数](server-configuration-file.topic#command-line)を渡すことで、必要なサーバーパラメータを上書きできます。

### EngineMainの起動：GradleおよびMavenにおける詳細 {id="gradle-maven"}

`EngineMain` を使用してサーバーを作成する場合、目的の[エンジン](server-engines.md)でサーバーを起動するための `main` 関数を指定する必要があります。
以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)は、Nettyエンジンを使用してサーバーを実行するための `main` 関数を示しています。

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

`main` 関数内でエンジンを設定せずにGradle/Mavenを使用してKtorサーバーを実行するには、ビルドスクリプトで次のようにメインクラス名を指定する必要があります。

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

### WARに関する詳細 {id="war-specifics"}

Ktorでは、アプリケーション内で目的のエンジン（Netty、Jetty、Tomcatなど）を使用して[サーバーを作成および起動](server-create-and-configure.topic)できます。この場合、アプリケーション側がエンジン設定、接続、SSLオプションを制御します。

このアプローチとは対照的に、サーブレットコンテナを使用する場合はコンテナ側がアプリケーションのライフサイクルと接続設定を制御する必要があります。Ktorには、アプリケーションの制御をサーブレットコンテナに委ねる特別な `ServletApplicationEngine` エンジンが用意されています。アプリケーションの設定方法については、[Warプラグインの設定](server-war.md#configure-war)を参照してください。

## アプリケーションの実行 {id="run"}
> 開発中にサーバーを再起動すると、時間がかかる場合があります。Ktorでは[自動リロード（Auto-reload）](server-auto-reload.topic)を使用することでこの制約を回避できます。コードの変更時にアプリケーションクラスがリロードされるため、迅速なフィードバックループが得られます。

### Gradle/Mavenを使用したアプリケーションの実行 {id="gradle-maven-run"}

GradleまたはMavenを使用してKtorアプリケーションを実行するには、対応するプラグインを使用します。
* Gradleの場合は [Application](server-packaging.md) プラグイン。[Nativeサーバー](server-native.md)の場合は [Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform) プラグインを使用します。
* Mavenの場合は [Exec](https://www.mojohaus.org/exec-maven-plugin/) プラグインを使用します。

> IntelliJ IDEAでKtorアプリケーションを実行する方法については、IntelliJ IDEAドキュメントの [Ktorアプリケーションの実行](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app) セクションを参照してください。

### パッケージ化されたアプリケーションの実行 {id="package"}

アプリケーションをデプロイする前に、[パッケージ化](server-deployment.md#packaging)セクションで説明されているいずれかの方法でパッケージ化する必要があります。
生成されたパッケージからのKtorアプリケーションの実行はパッケージのタイプによって異なり、次のようになります。
* fat JARにパッケージ化されたKtorサーバーを実行し、設定されたポートを上書きするには、次のコマンドを実行します。
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* Gradleの [Application](server-packaging.md) プラグインを使用してパッケージ化されたアプリケーションを実行するには、対応する実行可能ファイルを実行します。

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
  
* サーブレットKtorアプリケーションを実行するには、[Gretty](server-war.md#run) プラグインの `run` タスクを使用します。