[//]: # (title: Dokkaプラグイン)

> このガイドは Dokka Gradle プラグイン（DGP）v2 モードに適用されます。DGP v1 モードはサポートが終了しました。
> v1 から v2 モードにアップグレードするには、[マイグレーションガイド](dokka-migration.md)に従ってください。
>
{style="note"}

Dokka は、簡単に拡張でき、高度にカスタマイズできるようにゼロから構築されています。これにより、標準では提供されていない不足している機能や、非常に特殊な要件のためのプラグインをコミュニティが実装できます。

Dokka プラグインの対象範囲は、他のプログラミング言語のソースサポートから珍しい出力フォーマットまで多岐にわたります。独自の KDoc タグやアノテーションのサポートを追加したり、KDoc の記述に含まれるさまざまな DSL をレンダリングする方法を Dokka に教えたり、組織の Web サイトにシームレスに統合できるように Dokka のページを視覚的に再設計したり、他のツールと連携させたりなど、さまざまなことが可能です。

Dokka プラグインの作成方法を学びたい場合は、[開発者ガイド](https://kotlin.github.io/dokka/%dokkaVersion%/developer_guide/introduction/)を参照してください。

## Dokkaプラグインの適用 {id="apply-dokka-plugins"}

Dokka プラグインは個別のアーティファクトとして公開されているため、Dokka プラグインを適用するには依存関係として追加するだけです。その後はプラグイン自身によって Dokka が拡張されるため、それ以上のアクションは必要ありません。

> 同じ拡張ポイントを使用したり、同様の方法で動作したりするプラグイン同士は、互いに干渉し合う可能性があります。
> これにより、視覚的なバグ、一般的な予期しない動作、あるいはビルドの失敗につながるおそれがあります。ただし、Dokka は変更可能なデータ構造やオブジェクトを公開していないため、並行性の問題にはつながりません。
>
> このような問題に気づいた場合は、どのプラグインが適用されていて、それらが何を行っているかを確認することをお勧めします。
> 
{style="note"}

プロジェクトに [mathjax プラグイン](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax) を適用する方法を見てみましょう。

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

> * 組み込みプラグイン（HTML や Javadoc など）は常に自動的に適用されます。設定を行うだけでよく、それらに対する依存関係を宣言する必要はありません。
>
> * マルチモジュールプロジェクト（マルチプロジェクトビルド）のドキュメントを生成する場合は、[サブプロジェクト間で Dokka の設定とプラグインを共有](dokka-gradle.md#multi-project-configuration)する必要があります。
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

> [マルチプロジェクト](dokka-gradle.md#multi-project-configuration) ビルドのドキュメントを生成する場合は、[サブプロジェクト間で Dokka の設定とプラグインを共有](dokka-gradle.md#multi-project-configuration)する必要があります。
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

[CLI](dokka-cli.md) ランナーを [コマンドラインオプション](dokka-cli.md#run-with-command-line-options) で使用している場合、Dokka プラグインは `.jar` ファイルとして `-pluginsClasspath` に渡す必要があります。

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./mathjax-plugin-%dokkaVersion%.jar" \
     ...
```

[JSON 設定](dokka-cli.md#run-with-json-configuration) を使用している場合、Dokka プラグインは `pluginsClasspath` の下に指定する必要があります。

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

Dokka プラグインは、それぞれ独自の設定オプションを持つこともできます。利用可能なオプションを確認するには、使用しているプラグインのドキュメントを参照してください。

組み込みの HTML プラグインを設定する例として、アセットへのカスタム画像の追加（`customAssets` オプション）、カスタムスタイルシートの追加（`customStyleSheets` オプション）、変更されたフッターメッセージ（`footerMessage` オプション）を設定する方法を見てみましょう。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

Dokka プラグインをタイプセーフな方法で設定するには、`dokka.pluginsConfiguration {}` ブロックを使用します。

```kotlin
dokka {
    pluginsConfiguration.html {
        customAssets.from("logo.png")
        customStyleSheets.from("styles.css")
        footerMessage.set("(c) Your Company")
    }
}
```

Dokka プラグインの設定例については、[Dokka のバージョニングプラグイン](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example) を参照してください。

Dokka では、[カスタムプラグインの設定](https://github.com/Kotlin/dokka/blob/v2.3.0/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts) を行うことで、機能を拡張し、ドキュメント生成プロセスを変更できます。

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
            <!-- プラグインの完全修飾名 -->
            <org.jetbrains.dokka.base.DokkaBase>
                <!-- 名前別のオプション -->
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

[CLI](dokka-cli.md) ランナーを [コマンドラインオプション](dokka-cli.md#run-with-command-line-options) で使用している場合は、`fullyQualifiedPluginName=json` の形式で JSON 設定を受け付ける `-pluginsConfiguration` オプションを使用します。

複数のプラグインを設定する必要がある場合は、`^^` で区切って複数の値を渡すことができます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     ...
     -pluginsConfiguration "org.jetbrains.dokka.base.DokkaBase={\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg CLI\"}"
```

[JSON 設定](dokka-cli.md#run-with-json-configuration) を使用している場合、同様の `pluginsConfiguration` 配列が存在し、`values` で JSON 設定を受け付けます。

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

以下は、役立つ可能性のある代表的な Dokka プラグインです。

| **名前**                                                                                                                            | **説明**                                                                                                       |
|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [Android documentation plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-android-documentation) | Android におけるドキュメント生成体験を向上させます                                                             |
| [Versioning plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-versioning)                       | バージョンセレクターを追加し、アプリケーション/ライブラリの異なるバージョンのドキュメント整理に役立ちます       |
| [MermaidJS HTML plugin](https://github.com/glureau/dokka-mermaid)                                                                  | KDoc 内の [MermaidJS](https://mermaid-js.github.io/mermaid/#/) ダイアグラムやビジュアライゼーションをレンダリングします |
| [Mathjax HTML plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)                        | KDoc 内の数式を綺麗に整形して表示（pretty print）します                                                        |
| [Kotlin as Java plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-kotlin-as-java)               | Java から見た視点で Kotlin のシグネチャをレンダリングします                                                     |
| [GFM plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm)                                              | GitHub Flavored Markdown 形式でドキュメントを生成する機能を追加します                                          |
| [Jekyll plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-jekyll)                                       | Jekyll Flavored Markdown 形式でドキュメントを生成する機能を追加します                                          |

Dokka プラグインの作者の方で、このリストに自身のプラグインを追加したい場合は、[Slack](dokka-introduction.md#community) または [GitHub](https://github.com/Kotlin/dokka/) 経由でメンテナーにお問い合わせください。