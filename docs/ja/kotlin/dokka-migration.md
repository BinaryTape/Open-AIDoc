[//]: # (title: Dokka Gradle plugin v2 への移行)

> このページは、DGP v1 を使用しており、DGP v2 への移行を検討している場合にのみ該当します。Dokka 2.1.0 以降、DGP v2 はデフォルトで有効になっています。
> Dokka 2.1.0 以降を使用している場合は、このページをスキップして直接 [Dokka Gradle ドキュメント](dokka-gradle.md) を参照してください。
>
{style="note"}

Dokka Gradle plugin (DGP) は、Gradle で構築された Kotlin プロジェクト向けの包括的な API ドキュメントを生成するためのツールです。

DGP は、Kotlin の KDoc コメントと Java の Javadoc コメントの両方をシームレスに処理して情報を抽出し、[HTML または Javadoc](#select-documentation-output-format) 形式で構造化されたドキュメントを作成します。

Dokka Gradle plugin v2 モードはデフォルトで有効になっており、Gradle のベストプラクティスに準拠しています。

* Gradle の型を採用しており、パフォーマンスが向上しています。
* 低レベルのタスクベースのセットアップではなく、直感的なトップレベル DSL 設定を使用するため、ビルドスクリプトが簡素化され、可読性が向上します。
* ドキュメントの集約に対してより宣言的なアプローチをとっており、マルチプロジェクトのドキュメント管理が容易になります。
* 型安全なプラグイン設定を使用するため、ビルドスクリプトの信頼性とメンテナンス性が向上します。
* Gradle の [コンフィギュレーションキャッシュ](https://docs.gradle.org/current/userguide/configuration_cache.html) および [ビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html) を完全にサポートしており、パフォーマンスを向上させ、ビルド作業を簡素化します。

DGP v1 から v2 モードへの変更点および移行の詳細については、このガイドをお読みください。

## 始める前に {id="before-you-start"}

移行を開始する前に、以下の手順を完了してください。

### サポートされているバージョンの確認 {id="verify-supported-versions"}

プロジェクトが最小バージョンの要件を満たしていることを確認してください。

| **ツール**                                                                          | **バージョン**   |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 以上 |
| [Android Gradle plugin](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 以上 |
| [Kotlin Gradle plugin](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 以上 |

### DGP v2 を有効にする {id="enable-dgp-v2"}

プロジェクトの `build.gradle.kts` ファイルの `plugins {}` ブロックで、Dokka のバージョンを %dokkaVersion% に更新します。

```kotlin
plugins {
    kotlin("jvm") version "2.1.10"
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

あるいは、[バージョンカタログ](https://docs.gradle.org/current/userguide/platforms.html#sub:version-catalog) を使用して Dokka Gradle plugin v2 を有効にすることもできます。

> デフォルトでは、DGP v2 は HTML 形式でドキュメントを生成します。Javadoc、または HTML と Javadoc の両方の形式を生成するには、適切なプラグインを追加してください。プラグインの詳細については、[ドキュメントの出力形式を選択する](#select-documentation-output-format) を参照してください。
>
{style="tip"}

### 移行ヘルパーを有効にする {id="enable-migration-helpers"}

プロジェクトの `gradle.properties` ファイルで、以下の Gradle プロパティを設定して、ヘルパー付きの DGP v2 をアクティブにします。

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2EnabledWithHelpers
```

> プロジェクトに `gradle.properties` ファイルがない場合は、プロジェクトのルートディレクトリに作成してください。
>
{style="tip"}

このプロパティは、移行ヘルパーを備えた DGP v2 プラグインをアクティブにします。これらのヘルパーは、ビルドスクリプトが DGP v2 では利用できなくなった DGP v1 のタスクを参照している場合に、コンパイルエラーが発生するのを防ぎます。

> 移行ヘルパーは、移行自体を能動的に支援するものではありません。新しい API への移行中にビルドスクリプトが壊れないようにするだけのものです。
>
{style="note"}

移行が完了したら、[移行ヘルパーを無効にします](#set-the-opt-in-flag)。

### プロジェクトを Gradle と同期する {id="sync-your-project-with-gradle"}

DGP v2 と移行ヘルパーを有効にした後、プロジェクトを Gradle と同期して、DGP v2 が正しく適用されていることを確認します。

* IntelliJ IDEA を使用している場合は、Gradle ツールウィンドウの **Reload All Gradle Projects** ![Reload button](gradle-reload-button.png){width=30}{type="joined"} ボタンをクリックします。
* Android Studio を使用している場合は、**File** | **Sync Project with Gradle Files** を選択します。

## プロジェクトの移行 {id="migrate-your-project"}

Dokka Gradle plugin を v2 に更新した後、プロジェクトに該当する移行手順に従ってください。

### 設定オプションの調整 {id="adjust-configuration-options"}

DGP v2 では、[Gradle 設定オプション](dokka-gradle-configuration-options.md) にいくつかの変更が導入されています。`build.gradle.kts` ファイルで、プロジェクトのセットアップに合わせて設定オプションを調整してください。

#### DGP v2 におけるトップレベル DSL 設定 {id="top-level-dsl-configuration-in-dgp-v2"}

DGP v1 の設定構文を、DGP v2 のトップレベル `dokka {}` DSL 設定に置き換えます。

DGP v1 での設定:

```kotlin
tasks.withType<DokkaTask>().configureEach {
    suppressInheritedMembers.set(true)
    failOnWarning.set(true)
    dokkaSourceSets {
        named("main") {
            moduleName.set("Project Name")
            includes.from("README.md")
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}

tasks.dokkaHtml {
    pluginConfiguration<DokkaBase, DokkaBaseConfiguration> {
        customStyleSheets.set(listOf("styles.css"))
        customAssets.set(listOf("logo.png"))
        footerMessage.set("(c) Your Company")
    }
}
```

DGP v2 での設定:

Gradle の Kotlin DSL は型安全なアクセサを使用するため、`build.gradle.kts` ファイルの構文は、通常の `.kt` ファイル（カスタム Gradle プラグインに使用されるものなど）とは異なります。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    moduleName.set("Project Name")
    dokkaPublications.html {
        suppressInheritedMembers.set(true)
        failOnWarning.set(true)
    }
    dokkaSourceSets.main {
        includes.from("README.md")
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://example.com/src")
            remoteLineSuffix.set("#L")
        }
    }
    pluginsConfiguration.html {
        customStyleSheets.from("styles.css")
        customAssets.from("logo.png")
        footerMessage.set("(c) Your Company")
    }
}
```

</tab>
<tab title="Kotlin カスタムプラグイン" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension
import org.jetbrains.dokka.gradle.engine.plugins.DokkaHtmlPluginParameters

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->

            dokka.dokkaPublications.named("html") { publication ->
                publication.suppressInheritedMembers.set(true)
                publication.failOnWarning.set(true)
            }

            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }

            dokka.pluginsConfiguration.named("html", DokkaHtmlPluginParameters::class.java) { html ->
                html.customStyleSheets.from("styles.css")
                html.customAssets.from("logo.png")
                html.footerMessage.set("(c) Your Company")
            }
        }
    }
}
```

</tab>
</tabs>

#### 可視性の設定 {id="visibility-settings"}

`documentedVisibilities` プロパティを `Visibility.PUBLIC` から `VisibilityModifier.Public` に変更します。

DGP v1 での設定:

```kotlin
import org.jetbrains.dokka.DokkaConfiguration.Visibility

// ...
documentedVisibilities.set(
    setOf(Visibility.PUBLIC)
) 
```

DGP v2 での設定:

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

// ...
documentedVisibilities.set(
    setOf(VisibilityModifier.Public)
)

// または

documentedVisibilities(VisibilityModifier.Public)
```

さらに、DGP v2 の [ユーティリティ関数](https://github.com/Kotlin/dokka/blob/v2.2.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16) を使用して、ドキュメント化する可視性を追加できます。

```kotlin
fun documentedVisibilities(vararg visibilities: VisibilityModifier): Unit =
    documentedVisibilities.set(visibilities.asList()) 
```

#### ソースリンク {id="source-links"}

生成されたドキュメントからリモートリポジトリの対応するソースコードへのナビゲーションを可能にするために、ソースリンクを設定します。この設定には `dokkaSourceSets.main{}` ブロックを使用します。

DGP v1 での設定:

```kotlin
tasks.withType<DokkaTask>().configureEach {
    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

DGP v2 での設定:

Gradle の Kotlin DSL は型安全なアクセサを使用するため、`build.gradle.kts` ファイルの構文は、通常の `.kt` ファイル（カスタム Gradle プラグインに使用されるものなど）とは異なります。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://github.com/your-repo")
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Kotlin カスタムプラグイン" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }
        }
    }
}
```

</tab>
</tabs>

ソースリンクの設定が [変更](https://docs.gradle.org/current/userguide/upgrading_version_8.html#deprecated_invalid_url_decoding) されたため、リモート URL の指定には `URL` クラスの代わりに `URI` クラスを使用してください。

DGP v1 での設定:

```kotlin
remoteUrl.set(URL("https://github.com/your-repo"))
```

DGP v2 での設定:

```kotlin
remoteUrl.set(URI("https://github.com/your-repo"))

// または

remoteUrl("https://github.com/your-repo")
```

さらに、DGP v2 には URL を設定するための 2 つの [ユーティリティ関数](https://github.com/Kotlin/dokka/blob/220922378e6c68eb148fda2ec80528a1b81478c9/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/DokkaSourceLinkSpec.kt#L82-L96) があります。

```kotlin
fun remoteUrl(@Language("http-url-reference") value: String): Unit =
    remoteUrl.set(URI(value))

// および

fun remoteUrl(value: Provider<String>): Unit =
    remoteUrl.set(value.map(::URI))
```

#### 外部ドキュメントへのリンク {id="external-documentation-links"}

外部ドキュメントへのリンクを登録するには、`register()` メソッドを使用して各リンクを定義します。`externalDocumentationLinks` API は、Gradle DSL の慣習に合わせてこのメソッドを使用します。

DGP v1 での設定:

```kotlin
tasks.dokkaHtml {
    dokkaSourceSets {
        configureEach {
            externalDocumentationLink {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }
        }
    }
}
```

DGP v2 での設定:

```kotlin
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url("https://example.com/docs/")
            packageListUrl("https://example.com/docs/package-list")
        }
    }
}
```

#### カスタムアセット {id="custom-assets"}

リスト (`var List<File>`) の代わりに、ファイルのコレクション [(`FileCollection`)](https://docs.gradle.org/8.10/userguide/lazy_configuration.html#working_with_files_in_lazy_properties) を持つ [`customAssets`](dokka-html.md#customize-assets) プロパティを使用します。

DGP v1 での設定:

```kotlin
customAssets = listOf(file("example.png"), file("example2.png"))
```

DGP v2 での設定:

```kotlin
customAssets.from("example.png", "example2.png")
```

#### 出力ディレクトリ {id="output-directory"}

生成された Dokka ドキュメントの出力ディレクトリを指定するには、`dokka {}` ブロックを使用します。

DGP v1 での設定:

```kotlin
tasks.dokkaHtml {
    outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
}
```

DGP v2 での設定:

```kotlin
dokka {
    dokkaPublications.html {
        outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
    }
}
```

#### 追加ファイルの出力ディレクトリ {id="output-directory-for-additional-files"}

シングルモジュールプロジェクトとマルチモジュールプロジェクトの両方について、`dokka {}` ブロック内で出力ディレクトリを指定し、追加ファイルを含めます。

DGP v2 では、シングルモジュールプロジェクトとマルチモジュールプロジェクトの設定が統一されました。`dokkaHtml` タスクと `dokkaHtmlMultiModule` タスクを個別に設定する代わりに、`dokka {}` ブロック内の `dokkaPublications.html {}` で設定を指定します。

マルチモジュールプロジェクトの場合は、ルートプロジェクトの設定で出力ディレクトリを設定し、追加ファイル (`README.md` など) を含めます。

DGP v1 での設定:

```kotlin
tasks.dokkaHtmlMultiModule {
    outputDirectory.set(rootDir.resolve("docs/api/0.x"))
    includes.from(project.layout.projectDirectory.file("README.md"))
}
```

DGP v2 での設定:

Gradle の Kotlin DSL は型安全なアクセサを使用するため、`build.gradle.kts` ファイルの構文は、通常の `.kt` ファイル（カスタム Gradle プラグインに使用されるものなど）とは異なります。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaPublications.html {
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        includes.from(project.layout.projectDirectory.file("README.md"))
    }
}
```

</tab>
<tab title="Kotlin カスタムプラグイン" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaPublications.named("html") { html ->
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
                html.includes.from(project.layout.projectDirectory.file("README.md"))
            }
        }
    }
}
```

</tab>
</tabs>

### Dokka プラグインの設定 {id="configure-dokka-plugins"}

ビルトインの Dokka プラグインを JSON で設定する方法は非推奨となり、型安全な DSL が推奨されます。この変更により、Gradle のインクリメンタルビルドシステムとの互換性が向上し、タスク入力のトラッキングが改善されます。

DGP v1 での設定:

DGP v1 では、Dokka プラグインは JSON を使用して手動で設定されていました。このアプローチでは、Gradle の最新状態チェックのための [タスク入力の登録](https://docs.gradle.org/current/userguide/incremental_build.html) に関して問題が発生していました。

以下は、[Dokka Versioning プラグイン](https://kotl.in/dokka-versioning-plugin) に対する、非推奨となった JSON ベースの設定例です。

```kotlin
tasks.dokkaHtmlMultiModule {
    pluginsMapConfiguration.set(
        mapOf(
            "org.jetbrains.dokka.versioning.VersioningPlugin" to """
                { "version": "1.2", "olderVersionsDir": "$projectDir/dokka-docs" }
                """.trimIndent()
        )
    )
}
```

DGP v2 での設定:

DGP v2 では、Dokka プラグインは型安全な DSL を使用して設定されます。Dokka プラグインを型安全な方法で設定するには、`pluginsConfiguration{}` ブロックを使用します。

```kotlin
dokka {
    pluginsConfiguration {
        versioning {
            version.set("1.2")
            olderVersionsDir.set(projectDir.resolve("dokka-docs"))
        }
    }
}
```

DGP v2 設定の例については、[Dokka の versioning プラグインの例](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example) を参照してください。

DGP v2 では、[カスタムプラグインを設定する](https://github.com/Kotlin/dokka/blob/ae3840edb4e4afd7b3e3768a5fddfe8ec0e08f31/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts) ことで機能を拡張できます。カスタムプラグインを使用すると、ドキュメント生成プロセスに追加の処理や変更を加えることができます。

### サブプロジェクト間での Dokka 設定の共有 {id="share-dokka-configuration-across-subprojects"}

DGP v2 では、サブプロジェクト間で設定を共有するために `subprojects {}` や `allprojects {}` を使用することを避けています。将来の Gradle バージョンでは、これらのアプローチを使用すると [エラーが発生します](https://docs.gradle.org/current/userguide/isolated_projects.html)。

[既存のコンベンションプラグインがある場合](#multi-module-projects-with-convention-plugins) または [コンベンションプラグインがない場合](#multi-module-projects-without-convention-plugins) のマルチモジュールプロジェクトで、Dokka 設定を適切に共有するには、以下の手順に従ってください。

Dokka 設定を共有した後、複数のサブプロジェクトからのドキュメントを単一の出力に集約できます。詳細については、[マルチモジュールプロジェクトでのドキュメント集約の更新](#update-documentation-aggregation-in-multi-module-projects) を参照してください。

> マルチモジュールプロジェクトの例については、[Dokka GitHub リポジトリ](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example) を参照してください。
>
{style="tip"}

#### コンベンションプラグインのないマルチモジュールプロジェクト {id="multi-module-projects-without-convention-plugins"}

プロジェクトでコンベンションプラグインを使用していない場合でも、各サブプロジェクトを直接設定することで Dokka 設定を共有できます。これには、各サブプロジェクトの `build.gradle.kts` ファイルで共有設定を手動でセットアップすることが含まれます。このアプローチは集中管理性が低くなりますが、コンベンションプラグインのような追加のセットアップが不要になります。

あるいは、プロジェクトでコンベンションプラグインを使用している場合は、`buildSrc` ディレクトリにコンベンションプラグインを作成し、そのプラグインをサブプロジェクトに適用することで、マルチモジュールプロジェクトで Dokka 設定を共有することもできます。

##### buildSrc ディレクトリのセットアップ {id="set-up-the-buildsrc-directory"}

1. プロジェクトのルートに、以下の 2 つのファイルを含む `buildSrc` ディレクトリを作成します。

   * `settings.gradle.kts`
   * `build.gradle.kts`

2. `buildSrc/settings.gradle.kts` ファイルに、以下のスニペットを追加します。

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. `buildSrc/build.gradle.kts` ファイルに、以下のスニペットを追加します。

    ```kotlin
    plugins {
        `kotlin-dsl`
    }
    
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    
    dependencies {
        implementation("org.jetbrains.dokka:dokka-gradle-plugin:%dokkaVersion%")
    }   
    ```

##### Dokka コンベンションプラグインのセットアップ {id="set-up-the-dokka-convention-plugin"}

`buildSrc` ディレクトリをセットアップした後:

1. [コンベンションプラグイン](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins) を配置するために `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` ファイルを作成します。
2. `dokka-convention.gradle.kts` ファイルに、以下のスニペットを追加します。

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 共有設定をここに記述します
    }
    ```

   `dokka {}` ブロック内に、すべてのサブプロジェクトに共通の共有 Dokka [設定](#adjust-configuration-options) を追加する必要があります。また、Dokka のバージョンを指定する必要はありません。バージョンはすでに `buildSrc/build.gradle.kts` ファイルで設定されています。

##### サブプロジェクトへのコンベンションプラグインの適用 {id="apply-the-convention-plugin-to-your-subprojects"}

各サブプロジェクトの `build.gradle.kts` ファイルに Dokka コンベンションプラグインを追加して、サブプロジェクト全体に適用します。

```kotlin
plugins {
    id("dokka-convention")
}
```

#### コンベンションプラグインを使用したマルチモジュールプロジェクト {id="multi-module-projects-with-convention-plugins"}

すでにコンベンションプラグインを使用している場合は、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins) に従って、専用の Dokka コンベンションプラグインを作成してください。

その後、[Dokka コンベンションプラグインのセットアップ](#set-up-the-dokka-convention-plugin) と [サブプロジェクトへの適用](#apply-the-convention-plugin-to-your-subprojects) の手順に従ってください。

### マルチモジュールプロジェクトでのドキュメント集約の更新 {id="update-documentation-aggregation-in-multi-module-projects"}

Dokka は、複数のサブプロジェクトからのドキュメントを単一の出力またはパブリケーションに集約できます。

[前述のとおり](#apply-the-convention-plugin-to-your-subprojects)、ドキュメント化するすべてのサブプロジェクトに Dokka プラグインを適用してから、ドキュメントを集約してください。

DGP v2 での集約は、タスクではなく `dependencies {}` ブロックを使用し、任意の `build.gradle.kts` ファイルに追加できます。

DGP v1 では、集約はルートプロジェクトで暗黙的に作成されていました。DGP v2 でこの動作を再現するには、ルートプロジェクトの `build.gradle.kts` ファイルに `dependencies {}` ブロックを追加します。

DGP v1 での集約:

```kotlin
    tasks.dokkaHtmlMultiModule {
        // ...
    }
```

DGP v2 での集約:

```kotlin
dependencies {
    dokka(project(":some-subproject:"))
    dokka(project(":another-subproject:"))
}
```

### 集約ドキュメントのディレクトリの変更 {id="change-directory-of-aggregated-documentation"}

DGP がサブプロジェクトを集約すると、各サブプロジェクトは集約されたドキュメント内に独自のサブディレクトリを持ちます。

DGP v2 では、Gradle の慣習によりよく適合するように集約メカニズムが更新されました。DGP v2 は、任意の場所でドキュメントを集約する際の競合を防ぐために、完全なサブプロジェクトディレクトリを保持するようになりました。

DGP v1 での集約ディレクトリ:

DGP v1 では、集約されたドキュメントはフラット化されたディレクトリ構造に配置されていました。たとえば、`:turbo-lib` で集約を行い、ネストされたサブプロジェクト `:turbo-lib:maths` があるプロジェクトの場合、生成されたドキュメントは以下に配置されていました。

```text
turbo-lib/build/dokka/html/maths/
```

DGP v2 での集約ディレクトリ:

DGP v2 では、プロジェクト構造全体を保持することで、各サブプロジェクトがユニークなディレクトリを持つようにします。同じ集約ドキュメントは、以下の構造になります。

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

この変更により、同じ名前のサブプロジェクトが衝突するのを防ぎます。ただし、ディレクトリ構造が変更されたため、外部リンクが古くなり、`404` エラーが発生する可能性があります。

#### DGP v1 のディレクトリ動作に戻す {id="revert-to-the-dgp-v1-directory-behavior"}

プロジェクトが DGP v1 で使用されていたディレクトリ構造に依存している場合は、サブプロジェクトのディレクトリを手動で指定することで、この動作を元に戻すことができます。各サブプロジェクトの `build.gradle.kts` ファイルに以下の設定を追加します。

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // V1 の構造に一致するようにサブプロジェクトのディレクトリをオーバーライドします
    modulePath.set("maths")
}
```

### 更新されたタスクによるドキュメント生成 {id="generate-documentation-with-the-updated-task"}

DGP v2 では、API ドキュメントを生成する Gradle タスクの名前が変更されました。

DGP v1 でのタスク:

```text
./gradlew dokkaHtml

// または

./gradlew dokkaHtmlMultiModule
```

DGP v2 ででのタスク:

```text
./gradlew :dokkaGenerate
```

`dokkaGenerate` タスクは、`build/dokka/` ディレクトリに API ドキュメントを生成します。

DGP v2 バージョンでは、`dokkaGenerate` タスク名はシングルモジュールとマルチモジュールの両方のプロジェクトで機能します。HTML、Javadoc、またはその両方で出力を生成するために、異なるタスクを使用できます。詳細については、[ドキュメントの出力形式を選択する](#select-documentation-output-format) を参照してください。

### ドキュメントの出力形式を選択する {id="select-documentation-output-format"}

> Javadoc 出力形式は [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 段階です。バグが見つかったり、移行上の問題が発生したりする可能性があります。Javadoc を入力として受け取るツールとの正常な統合は保証されません。自己責任で使用してください。
>
{style="warning"}

DGP v2 のデフォルトの出力形式は HTML です。ただし、API ドキュメントを HTML、Javadoc、またはその両方の形式で同時に生成することを選択できます。

1. プロジェクトの `build.gradle.kts` ファイルの `plugins {}` ブロックに対応するプラグイン `id` を記述します。

   ```kotlin
   plugins {
       // HTML ドキュメントを生成
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // Javadoc ドキュメントを生成
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 両方のプラグイン ID を保持すると両方の形式が生成されます
   }
   ```

2. 対応する Gradle タスクを実行します。

各形式に対応するプラグイン `id` と Gradle タスクのリストは以下の通りです。

|             | **HTML**                       | **Javadoc**                         | **両方**                          |
|-------------|--------------------------------|-------------------------------------|-----------------------------------|
| プラグイン `id` | `id("org.jetbrains.dokka")`    | `id("org.jetbrains.dokka-javadoc")` | HTML と Javadoc 両方のプラグインを使用 |
| Gradle タスク | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc`   | `./gradlew :dokkaGenerate`        |

> `dokkaGenerate` タスクは、適用されているプラグインに基づいて、利用可能なすべての形式でドキュメントを生成します。HTML プラグインと Javadoc プラグインの両方が適用されている場合、`dokkaGeneratePublicationHtml` タスクを実行して HTML のみを生成するか、`dokkaGeneratePublicationJavadoc` タスクを実行して Javadoc のみを生成するかを選択できます。
> 
{style="tip"}

IntelliJ IDEA を使用している場合、`dokkaGenerateHtml` という Gradle タスクが表示されることがあります。このタスクは単に `dokkaGeneratePublicationHtml` のエイリアスです。どちらのタスクもまったく同じ操作を実行します。

### 非推奨および削除への対応 {id="address-deprecations-and-removals"}

* **出力形式のサポート:** DGP v2 は HTML と Javadoc の出力のみをサポートしています。Markdown や Jekyll などの実験的な形式はサポートされなくなりました。
* **コレクタータスク:** `DokkaCollectorTask` は削除されました。現在は、各サブプロジェクトごとに個別にドキュメントを生成し、必要に応じて [ドキュメントを集約](#update-documentation-aggregation-in-multi-module-projects) する必要があります。

## 移行の完了 {id="finalize-your-migration"}

プロジェクトを移行した後は、以下の手順を実行して仕上げを行い、パフォーマンスを向上させてください。

### オプトインフラグを設定する {id="set-the-opt-in-flag"}

移行が正常に完了したら、プロジェクトの `gradle.properties` ファイルで、ヘルパーなしの以下のオプトインフラグを設定します。

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2Enabled
```

DGP v2 では利用できなくなった DGP v1 の Gradle タスクへの参照を削除していれば、それに関連するコンパイルエラーは表示されないはずです。

### ビルドキャッシュとコンフィギュレーションキャッシュを有効にする {id="enable-build-cache-and-configuration-cache"}

DGP v2 は Gradle のビルドキャッシュとコンフィギュレーションキャッシュをサポートするようになり、ビルドパフォーマンスが向上しました。

* ビルドキャッシュを有効にするには、[Gradle ビルドキャッシュのドキュメント](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable) の指示に従ってください。
* コンフィギュレーションキャッシュを有効にするには、[Gradle コンフィギュレーションキャッシュのドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable ) の指示に従ってください。

## 次のステップ {id="what-s-next"}

* [DGP v2 プロジェクトのその他の例を探索する](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2)。
* [Dokka を使い始める](dokka-get-started.md)。
* [Dokka プラグインについて詳しく学ぶ](dokka-plugins.md)。