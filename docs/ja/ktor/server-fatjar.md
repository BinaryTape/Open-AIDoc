[//]: # (title: Ktor Gradleプラグインを使用したfat JARの作成)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>Ktor Gradleプラグインを使用して実行可能なfat JARを作成および実行する方法を学びます。</link-summary>

[Ktor Gradleプラグイン](https://github.com/ktorio/ktor-build-plugins)を使用すると、すべてのコード依存関係を含む実行可能JAR（fat JAR）を作成して実行できます。

## Ktorプラグインの設定 {id="configure-plugin"}

fat JARをビルドするには、まずKtorプラグインを設定する必要があります。

1. <Path>build.gradle.kts</Path>ファイルを開き、`plugins {}`ブロックにKtorプラグインを追加します。
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上記のコードスニペットでは、<a href="server-dependencies.topic#using-version-catalog">
       Ktorバージョンカタログ</a>を使用してKtorの依存関係を指定しています。
   </note>

2. [メインアプリケーションクラス](server-dependencies.topic#create-entry-point)が設定されていることを確認します。
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

3. 必要に応じて、`ktor.fatJar`拡張を使用して生成されるfat JARの名前を設定できます。
   ```kotlin
   ktor {
       fatJar {
           archiveFileName.set("fat.jar")
       }
   }
   ```

> Ktor GradleプラグインをKotlin Multiplatform Gradleプラグインと一緒に適用すると、fat JAR作成機能は自動的に無効になります。
> これらを併用できるようにするには、以下のようにします:
> 1. 上記のようにKtor Gradleプラグインを適用したJVM専用プロジェクトを作成します。
> 2. そのJVM専用プロジェクトに、Kotlin Multiplatformプロジェクトを依存関係として追加します。
> 
> この回避策で問題が解決しない場合は、[KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464)にコメントを残してお知らせください。
>
{style="warning"}

## fat JARのビルドと実行 {id="build"}

Ktorプラグインには、fat JARを作成および実行するための以下のタスクが用意されています。
- `buildFatJar`: プロジェクトとランタイム依存関係を結合したJARをビルドします。このビルドが完了すると、`build/libs`ディレクトリに`***-all.jar`ファイルが生成されます。
- `runFatJar`: プロジェクトのfat JARをビルドして実行します。

> ProGuardを使用して生成されたJARを最小化する方法については、[proguard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/proguard)サンプルを参照してください。