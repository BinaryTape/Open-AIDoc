[//]: # (title: Dokkaプラグイン)

> このガイドは Dokka Gradle プラグイン (DGP) v2 モードに適用されます。DGP v1 モードはサポートされなくなりました。
> v1 から v2 モードにアップグレードするには、[移行ガイド](dokka-migration.md)に従ってください。
>
{style="note"}

Dokka は、簡単に拡張でき高度にカスタマイズできるようにゼロから構築されているため、標準では提供されていない機能や非常に特殊な機能に対応するプラグインをコミュニティで実装できます。

Dokka プラグインの適用範囲は、他のプログラミング言語のソースコードのサポートから、一般的ではない出力フォーマットのサポートまで多岐にわたります。独自の KDoc タグやアノテーションのサポートを追加したり、KDoc の説明に含まれるさまざまな DSL を Dokka にレンダリングさせたり、Dokka のページを自社のウェブサイトとシームレスに統合できるように視覚的にリデザインしたり、他のツールと連携させたりなど、他にも多くのことが可能です。

Dokka プラグインの作成方法を学びたい場合は、[開発者ガイド](https://kotlin.github.io/dokka/%dokkaVersion%/developer_guide/introduction/)を参照してください。

## Dokkaプラグインの適用 {id="apply-dokka-plugins"}

Dokka プラグインは個別のアーティファクトとして公開されているため、Dokka プラグインを適用するには依存関係として追加するだけです。プラグインは自律的に Dokka を拡張するため、それ以上のアクションは必要ありません。

> 同じ拡張ポイントを使用したり、同様の方法で動作したりするプラグイン同士は、互いに干渉する可能性があります。
> これにより、表示の不具合や一般的な未定義の動作、さらにはビルドの失敗につながる可能性があります。ただし、Dokka は可変 (mutable) なデータ構造やオブジェクトを公開しないため、並行性の問題 (concurrency issues) が発生することはありません。
>
> このような問題に気づいた場合は、どのプラグインが適用されていて、それらが何を行っているかを確認することをお勧めします。
> 
{style="note"}

プロジェクトに [mathjax プラグイン](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)を適用する方法を見てみましょう。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dependencies {
    dokkaPlugin("org.jetbrains.dokka:mathjax-plugin")
}
```

> * 組み込みプラグイン (HTML や Javadoc など) は常に自動的に適用されます。これらは設定を行うだけでよく、依存関係を宣言する必要はありません。
>
> * マルチモジュールプロジェクト (マルチプロジェクトビルド) をドキュメント化する場合は、[サブプロジェクト間で Dokka の設定とプラグインを共有](dokka-gradle.md#multi-project-configuration)する必要があります。
> 
{style="note"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dependencies {
    dokkaPlugin 'org.jetbrains.dokka:mathjax-plugin'
}
```

> [マルチプロジェクト](dokka-gradle.md#multi-project-configuration)ビルドをドキュメント化する場合は、[サブプロジェクト間で Dokka の設定を共有](dokka-gradle.md#multi-project-configuration)する必要があります。
>
{style="note"}

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>mathjax-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

[CLI](dokka-cli.md) ランナーを[コマンドラインオプション](dokka-cli.md#run-with-command-line-options)と一緒に使用している場合、Dokka プラグインは `.jar` ファイルとして `-pluginsClasspath` に渡す必要があります。

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./mathjax-plugin-%dokkaVersion%.jar" \
     ...
```

[JSON 設定](dokka-cli.md#run-with-json-configuration)を使用している場合、Dokka プラグインは `pluginsClasspath` の下で指定する必要があります。

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./mathjax-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

</tab>
</tabs>

## Dokkaプラグインの設定 {id="configure-dokka-plugins"}

Dokka プラグインには、独自の設定オプションを用意することもできます。利用可能なオプションを確認するには、使用しているプラグインのドキュメントを参照してください。

組み込みの HTML プラグインを設定する例として、アセットへのカスタム画像の追加 (`customAssets` オプション)、カスタムスタイルシートの追加 (`customStyleSheets` オプション)、変更されたフッターメッセージの追加 (`footerMessage` オプション) を見てみましょう。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

型安全な方法で Dokka プラグインを設定するには、`dokka.pluginsConfiguration {}` ブロックを使用します。

```kotlin
dokka {
    pluginsConfiguration.html {
        customAssets.from("logo.png")
        customStyleSheets.from("styles.css")
        footerMessage.set("(c) Your Company")
    }
}
```

Dokka プラグインの設定例については、[Dokka のバージョニングプラグイン](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)を参照してください。

Dokka では、[カスタムプラグインの設定](https://github.com/Kotlin/dokka/blob/v2.3.0/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)により、その機能を拡張し、ドキュメント生成プロセスを変更することができます。

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    pluginsConfiguration {
        html {
            customAssets.from("logo.png")
            customStyleSheets.from("styles.css")
            footerMessage.set("(c) Your Company")
        }
    }
}
```

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <pluginsConfiguration>
            <!-- Fully qualified plugin name -->
            <org.jetbrains.dokka.base.DokkaBase>
                <!-- Options by name -->
                <customAssets>
                    <asset>${project.basedir}/my-image.png</asset>
                </customAssets>
                <customStyleSheets>
                    <stylesheet>${project.basedir}/my-styles.css</stylesheet>
                </customStyleSheets>
                <footerMessage>(c) MyOrg 2022 Maven</footerMessage>
            </org.jetbrains.dokka.base.DokkaBase>
        </pluginsConfiguration>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

[CLI](dokka-cli.md) ランナーを[コマンドラインオプション](dokka-cli.md#run-with-command-line-options)と一緒に使用している場合は、`fullyQualifiedPluginName=json` の形式で JSON 設定を受け取る `-pluginsConfiguration` オプションを使用します。

複数のプラグインを設定する必要がある場合は、`^^` で区切って複数の値を渡すことができます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     ...
     -pluginsConfiguration "org.jetbrains.dokka.base.DokkaBase={\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg CLI\"}"
```

[JSON 設定](dokka-cli.md#run-with-json-configuration)を使用している場合、同様に `values` で JSON 設定を受け取る `pluginsConfiguration` 配列が存在します。

```json
{
  "moduleName": "Dokka Example",
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg\"}"
    }
  ]
}
```

</tab>
</tabs>

## 主なプラグイン {id="notable-plugins"}

以下は、役立つ可能性のある Dokka の主なプラグインです。

| **名前**                                                                                                                           | **説明**                                                                                                     |
|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [Android documentation plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-android-documentation) | Android におけるドキュメンテーション体験を向上させます                                                       |
| [Versioning plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-versioning)                       | バージョンセレクターを追加し、アプリケーション/ライブラリの異なるバージョン向けのドキュメント整理を支援します |
| [MermaidJS HTML plugin](https://github.com/glureau/dokka-mermaid)                                                                  | KDoc 内にある [MermaidJS](https://mermaid-js.github.io/mermaid/#/) ダイアグラムと視覚化をレンダリングします   |
| [Mathjax HTML plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)                        | KDoc 内にある数式を整形して表示します                                                                       |
| [Kotlin as Java plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-kotlin-as-java)               | Java の視点から見た Kotlin のシグネチャをレンダリングします                                                 |
| [GFM plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm)                                              | GitHub Flavored Markdown 形式でドキュメントを生成する機能を追加します                                       |
| [Jekyll plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-jekyll)                                       | Jekyll Flavored Markdown 形式でドキュメントを生成する機能を追加します                                       |

Dokka プラグインの作者で、このリストにプラグインを追加したい場合は、[Slack](dokka-introduction.md#community) または [GitHub](https://github.com/Kotlin/dokka/) 経由でメンテナーにご連絡ください。