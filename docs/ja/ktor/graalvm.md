[//]: # (title: GraalVM)

[//]: # (title: GraalVM)

<tldr>
<p>
<control>サンプルプロジェクト</control>: <a href="https://github.com/ktorio/ktor-samples/tree/main/graalvm">graalvm</a>
</p>
</tldr>

<web-summary>
Ktor Serverアプリケーションは、さまざまなプラットフォーム向けのネイティブイメージを作成するためにGraalVMを利用できます。
</web-summary>
<link-summary>
さまざまなプラットフォームでネイティブイメージを作成するためにGraalVMを使用する方法を学びます。
</link-summary>

Ktor Serverアプリケーションは、さまざまなプラットフォーム向けのネイティブイメージを作成するために[GraalVM](https://graalvm.org)を利用できます。これにより、GraalVMが提供する起動時間の短縮やその他の利点を当然ながら享受できます。

現在、GraalVMを活用したいKtor Serverアプリケーションは、[アプリケーションエンジン](server-engines.md)としてCIOを使用する必要があります。

## GraalVMの準備 {id="prepare-for-graalvm"}

GraalVMをインストールしてインストールディレクトリをシステムパスに追加することに加え、すべての依存関係がバンドルされるようにアプリケーションを準備する必要があります。つまり、fat jarを作成する必要があります。

### リフレクションの設定 {id="reflection-configuration"}

GraalVMには、Ktorのようにリフレクションを使用するアプリケーションに関して[いくつかの要件](https://www.graalvm.org/22.1/reference-manual/native-image/Reflection/)があります。
これには、特定の型情報を含む[JSONファイル](https://github.com/ktorio/ktor-samples/blob/main/graalvm/src/main/resources/META-INF/native-image/reflect-config.json)を提供することが求められます。この設定ファイルは、その後`native-image`ツールの引数として渡されます。

## `native-image`ツールの実行 {id="execute-the-native-image-tool"}

fat jarの準備ができたら、残るステップは`native-image` CLIツールを使用してネイティブイメージを作成することだけです。
これは[Gradleプラグイン](https://graalvm.github.io/native-build-tools/0.9.8/gradle-plugin.html)を使用しても実行できます。
`build.gradle.kts`ファイルの例は[こちら](https://github.com/ktorio/ktor-samples/blob/main/graalvm/build.gradle.kts)で確認できます。
ただし、使用している依存関係やプロジェクトのパッケージ名などに応じて、一部のオプションが異なる場合があることに注意してください。

## 生成されたバイナリの実行 {id="run-the-resulting-binary"}

シェルスクリプトがエラーなしで実行されると、ネイティブアプリケーションが取得できます。このサンプルの場合は`graal-server`という名前になります。これを実行するとKtor Serverが起動し、`https://0.0.0.0:8080`で応答します。

[//]: # (<tldr>)

[//]: # (<var name="example_name" value="deployment-ktor-plugin"/>)

[//]: # (<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>)

[//]: # (</tldr>)

[//]: # ()
[//]: # (<link-summary>)

[//]: # (Ktor Serverアプリケーションは、さまざまなプラットフォーム向けのネイティブイメージを作成するためにGraalVMを利用できます。)

[//]: # (</link-summary>)

[//]: # ()
[//]: # (Ktor Serverアプリケーションは、さまざまなプラットフォーム向けのネイティブイメージを作成するために[GraalVM]&#40;https://graalvm.org&#41;を利用できます。これにより、GraalVMが提供する起動時間の短縮やその他の利点を当然ながら享受できます。[Ktor Gradleプラグイン]&#40;https://github.com/ktorio/ktor-build-plugins&#41;を使用すると、プロジェクトのGraalVMネイティブイメージをビルドできます。)

[//]: # ()
[//]: # (> 現在、GraalVMを活用したいKtor Serverアプリケーションは、[アプリケーションエンジン]&#40;Engines.md&#41;としてCIOを使用する必要があります。)

[//]: # ()
[//]: # (## GraalVMの準備)

[//]: # ()
[//]: # (プロジェクトのGraalVMネイティブイメージをビルドする前に、以下の前提条件が満たされていることを確認してください:)

[//]: # (- [GraalVM]&#40;https://www.graalvm.org/docs/getting-started/&#41;と[Native Image]&#40;https://www.graalvm.org/reference-manual/native-image/&#41;がインストールされていること。)

[//]: # (- `GRAALVM_HOME`および`JAVA_HOME`環境変数が設定されていること。)

[//]: # ()
[//]: # (## Ktorプラグインの設定 {id="configure-plugin"})

[//]: # (ネイティブ実行可能ファイルをビルドするには、まずKtorプラグインを設定する必要があります:)

[//]: # (1. `build.gradle.kts`ファイルを開き、`plugins`ブロックにプラグインを追加します:)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="1,4-5"})

[//]: # ()
[//]: # (2. [メインアプリケーションクラス]&#40;server-dependencies.xml#create-entry-point&#41;が設定されていることを確認します:)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="7-9"})

[//]: # ()
[//]: # (## ネイティブ実行可能ファイルのビルドと実行 {id="build"})

[//]: # ()
[//]: # (Ktorプラグインによって提供される`buildNativeImage`タスクは、`build/native/nativeCompile`ディレクトリ内にアプリケーションを含むネイティブ実行可能ファイルを生成します。)

[//]: # (これを実行するとKtor Serverが起動し、デフォルトで`https://0.0.0.0:8080`で応答します。)