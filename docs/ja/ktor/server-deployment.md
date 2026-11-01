[//]: # (title: デプロイ)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>Code example</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

このトピックでは、Ktorアプリケーションをデプロイする方法の概要について説明します。

> サーバーKtorアプリケーションのデプロイプロセスを簡素化するために、以下の機能を提供するGradle用[Ktor](https://github.com/ktorio/ktor-build-plugins)プラグインを使用できます。
> - Fat JARのビルド
> - アプリケーションのDocker化

## Ktorデプロイの仕様 {id="ktor-specifics"}
サーバーKtorアプリケーションのデプロイプロセスは、以下の仕様によって異なります。
* アプリケーションを自己完結型のパッケージとしてデプロイするのか、それともサーブレットコンテナ内にデプロイするのか。
* サーバーの作成と設定にどちらのアプローチを使用するか。

### 自己完結型アプリ vs サーブレットコンテナ {id="self-contained-vs-servlet"}

Ktorを使用すると、アプリケーション内で直接、希望するネットワーク[エンジン](server-engines.md)（Netty、Jetty、Tomcatなど）を含むサーバーを作成して起動できます。この場合、エンジンはアプリケーションの一部となります。アプリケーションはエンジンの設定、接続、およびSSLオプションを制御できます。アプリケーションをデプロイするには、Fat JARまたは実行可能JVMアプリケーションとして[パッケージ化](#packaging)できます。

上記のアプローチとは対照的に、サーブレットコンテナではコンテナ側がアプリケーションのライフサイクルと接続設定を制御する必要があります。Ktorは、アプリケーションの制御をサーブレットコンテナに委任する特別な`ServletApplicationEngine`エンジンを提供します。サーブレットコンテナ内にデプロイするには、[WARアーカイブ](server-war.md)を生成する必要があります。

### 設定：コード vs 設定ファイル {id="code-vs-config"}

自己完結型のKtorアプリケーションをデプロイ用に設定する方法は、[サーバーの作成と設定](server-create-and-configure.topic)に使用したアプローチ（コード内で行うか、[設定ファイル](server-configuration-file.topic)を使用するか）によって異なる場合があります。例えば、[ホスティングプロバイダー](#publishing)によっては、受信リクエストをリッスンするために使用するポートの指定を要求する場合があります。この場合、コードまたは`application.conf`/`application.yaml`のいずれかでポートを[設定](server-configuration-file.topic)する必要があります。

## パッケージ化 {id="packaging"}

アプリケーションをデプロイする前に、以下のいずれかの方法でパッケージ化する必要があります。

* **Fat JAR**

  Fat JARは、すべてのコード依存関係を含む実行可能なJARです。Fat JARをサポートする任意の[クラウドサービス](#publishing)にデプロイできます。また、GraalVM用のネイティブバイナリを生成する必要がある場合にもFat JARが必要です。Fat JARを作成するには、Gradle用[Ktor](server-fatjar.md)プラグインまたはMaven用[Assembly](maven-assembly-plugin.md)プラグインを使用できます。

* **実行可能JVMアプリケーション**

   実行可能JVMアプリケーションは、コードの依存関係と生成された起動スクリプトを含むパッケージ化されたアプリケーションです。Gradleの場合、[Application](server-packaging.md)プラグインを使用してアプリケーションを生成できます。

* **WAR**

   [WARアーカイブ](server-war.md)を使用すると、TomcatやJettyなどのサーブレットコンテナ内にアプリケーションをデプロイできます。

* **GraalVM**

   Ktorサーバーアプリケーションでは、さまざまなプラットフォーム用のネイティブイメージを取得するために[GraalVM](graalvm.md)を利用できます。

## コンテナ化 {id="containerizing"}

アプリケーションをパッケージ化（例えば、実行可能JVMアプリケーションまたはFat JARに）した後、このアプリケーションを含む[Dockerイメージ](docker.md)を準備できます。このイメージは、Kubernetes、Swarm、または必要なクラウドサービスのコンテナインスタンスでアプリケーションを実行するために使用できます。

## 公開 {id="publishing"}

以下のチュートリアルでは、特定のクラウドプロバイダーにKtorアプリケーションをデプロイする方法を示しています。
* [Google App Engine](google-app-engine.md)
* [Heroku](heroku.md)
* [Dokku](dokku.md)
* [AWS Elastic Beanstalk](elastic-beanstalk.md)

## SSL {id="ssl"}

Ktorサーバーがリバースプロキシ（NginxやApacheなど）の背後に配置されている場合、またはサーブレットコンテナ（TomcatやJetty）内で実行されている場合、SSL設定はリバースプロキシまたはサーブレットコンテナによって管理されます。必要に応じて、Java KeyStoreを使用して[直接SSLを提供する](server-ssl.md)ようにKtorを設定できます。

> Ktorアプリケーションがサーブレットコンテナ内にデプロイされている場合、SSL設定は有効にならないことに注意してください。