[//]: # (title: Gradle)

> このガイドは Dokka Gradle プラグイン (DGP) v2 モードに適用されます。以前の DGP v1 モードはサポートされなくなりました。
> v1 から v2 モードにアップグレードする場合は、[移行ガイド (Migration guide)](dokka-migration.md) を参照してください。
>
{style="note"}

Gradle ベースのプロジェクトのドキュメントを生成するには、[Dokka 用の Gradle プラグイン](https://plugins.gradle.org/plugin/org.jetbrains.dokka)を使用できます。

Dokka Gradle プラグイン (DGP) には、プロジェクト用の基本的な自動構成が含まれており、ドキュメント生成用の [Gradle タスク](#ドキュメントの生成)が含まれています。また、出力をカスタマイズするための [構成オプション](dokka-gradle-configuration-options.md) も提供されています。

Dokka を試したり、さまざまなプロジェクトでの構成方法を確認したりするには、[Gradle サンプルプロジェクト](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2)を探索してください。

## サポートされているバージョン {id="supported-versions"}

プロジェクトが以下の最小バージョン要件を満たしていることを確認してください。

| **ツール**                                                                          | **バージョン**   |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 以上 |
| [Android Gradle プラグイン](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 以上 |
| [Kotlin Gradle プラグイン](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 以上 |

## Dokka の適用 {id="apply-dokka"}

Dokka Gradle プラグインを適用する推奨される方法は、[plugins ブロック](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)を使用することです。
プロジェクトの `build.gradle.kts` ファイルの `plugins {}` ブロックに以下を追加します。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

</tab>
</tabs>

マルチプロジェクトビルドをドキュメント化する場合、ドキュメント化したいすべてのサブプロジェクトにプラグインを明示的に適用する必要があります。
各サブプロジェクトで直接 Dokka を構成することも、コンベンションプラグインを使用してサブプロジェクト間で Dokka の構成を共有することもできます。
詳細については、[シングルプロジェクト構成](#シングルプロジェクト構成) および [マルチプロジェクト構成](#マルチプロジェクト構成) の方法を参照してください。

> * 内部的には、Dokka は [Kotlin Gradle プラグイン](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) を使用して、ドキュメントが生成される [ソースセット (source sets)](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets) を自動的に構成します。Kotlin Gradle プラグインを適用するか、[ソースセットを手動で構成](dokka-gradle-configuration-options.md#source-set-configuration) してください。
>
> * [プリコンパイル済みスクリプトプラグイン (precompiled script plugin)](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:precompiled_plugins) で Dokka を使用している場合は、[Kotlin Gradle プラグイン](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) を依存関係として追加し、正しく動作することを確認してください。
>
{style="tip"}

## ビルドキャッシュと構成キャッシュの有効化 {id="enable-build-cache-and-configuration-cache"}

DGP は Gradle のビルドキャッシュ (build cache) と構成キャッシュ (configuration cache) をサポートしており、ビルドのパフォーマンスが向上します。

* ビルドキャッシュを有効にするには、[Gradle ビルドキャッシュのドキュメント](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable) の指示に従ってください。
* 構成キャッシュを有効にするには、[Gradle 構成キャッシュのドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable ) の指示に従ってください。

## ドキュメントの生成 {id="generate-documentation"}

Dokka Gradle プラグインには、[HTML](dokka-html.md) および [Javadoc](dokka-javadoc.md) の出力形式が組み込まれています。

ドキュメントを生成するには、以下の Gradle タスクを使用します。

```shell
./gradlew :dokkaGenerate
```

`dokkaGenerate` Gradle タスクの主な動作は以下の通りです。

* このタスクは、[シングルプロジェクト](#シングルプロジェクト構成) および [マルチプロジェクト](#マルチプロジェクト構成) ビルドの両方でドキュメントを生成します。
* デフォルトでは、ドキュメントの出力形式は HTML です。[適切なプラグインを追加](#ドキュメントの出力形式の構成) することで、Javadoc を生成したり、HTML と Javadoc の両方の形式を生成したりすることもできます。
* 生成されたドキュメントは、シングルプロジェクトおよびマルチプロジェクトビルドの両方で、自動的に `build/dokka/html` ディレクトリに配置されます。[場所 (`outputDirectory`) を変更](dokka-gradle-configuration-options.md#general-configuration) することも可能です。

### ドキュメントの出力形式の構成 {id="configure-documentation-output-format"}

> Javadoc 出力形式は [アルファ版 (Alpha)](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) です。
> 使用中にバグが発生したり、移行の問題が発生したりする可能性があります。
> Javadoc を入力として受け入れるツールとの正常な統合は保証されません。
> 自己責任で使用してください。
>
{style="warning"}

API ドキュメントを HTML、Javadoc、またはその両方の形式で同時に生成するように選択できます。

1. プロジェクトの `build.gradle.kts` ファイルの `plugins {}` ブロックに対応するプラグイン `id` を配置します。

   ```kotlin
   plugins {
       // HTML ドキュメントを生成
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // Javadoc ドキュメントを生成
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 両方のプラグイン ID を保持すると、両方の形式が生成されます
   }
   ```

2. 対応する Gradle タスクを実行します。

   各形式に対応するプラグイン `id` と Gradle タスクのリストは以下の通りです。

   |             | **HTML**                                  | **Javadoc**                                  | **両方**                          |
   |-------------|-------------------------------------------|----------------------------------------------|-----------------------------------|
   | プラグイン `id` | `id("org.jetbrains.dokka")`               | `id("org.jetbrains.dokka-javadoc")`          | HTML と Javadoc 両方のプラグインを使用 |
   | Gradle タスク | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc` | `./gradlew :dokkaGenerate`        |

    > * `dokkaGenerate` タスクは、適用されているプラグインに基づいて、利用可能なすべての形式でドキュメントを生成します。
    > HTML と Javadoc の両方のプラグインが適用されている場合、`dokkaGeneratePublicationHtml` タスクを実行して HTML のみを生成するか、`dokkaGeneratePublicationJavadoc` タスクを実行して Javadoc のみを生成するかを選択できます。
    > 
    {style="tip"}

IntelliJ IDEA を使用している場合、`dokkaGenerateHtml` という Gradle タスクが表示されることがあります。
このタスクは単に `dokkaGeneratePublicationHtml` のエイリアスです。両方のタスクはまったく同じ操作を実行します。

### マルチプロジェクトビルドでのドキュメント出力の集約 {id="aggregate-documentation-output-in-multi-project-builds"}

Dokka は、複数のサブプロジェクトからのドキュメントを単一の出力またはパブリケーションに集約 (aggregate) できます。

ドキュメントを集約する前に、ドキュメント化可能なすべてのサブプロジェクトに [Dokka プラグインを適用](#コンベンションプラグインをサブプロジェクトに適用する) する必要があります。

複数のサブプロジェクトからドキュメントを集約するには、ルートプロジェクトの `build.gradle.kts` ファイルに `dependencies {}` ブロックを追加します。

```kotlin
dependencies {
    dokka(project(":childProjectA:"))
    dokka(project(":childProjectB:"))
}
```

次のような構造のプロジェクトを想定します。

```text
.
└── parentProject/
    ├── childProjectA/
    │   └── demo/
    │       └── ChildProjectAClass.kt
    └── childProjectB/
        └── demo/
            └── ChildProjectBClass.kt
```

生成されたドキュメントは次のように集約されます。

![dokkaHtmlMultiModule タスクの出力のスクリーンショット](dokkaHtmlMultiModule-example.png){width=600}

詳細については、[マルチプロジェクトのサンプル](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2/multimodule-example) を参照してください。

#### 集約されたドキュメントのディレクトリ {id="directory-of-aggregated-documentation"}

DGP がサブプロジェクトを集約すると、各サブプロジェクトは集約されたドキュメント内に独自のサブディレクトリを持ちます。
DGP は、完全なプロジェクト構造を維持することで、各サブプロジェクトがユニークなディレクトリを持つようにします。

例えば、`:turbo-lib` に集約があり、ネストされたサブプロジェクト `:turbo-lib:maths` があるプロジェクトの場合、生成されたドキュメントは以下の場所に配置されます。

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

サブプロジェクトのディレクトリを手動で指定することで、この動作を変更できます。
各サブプロジェクトの `build.gradle.kts` ファイルに以下の構成を追加します。

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // サブプロジェクトのディレクトリをオーバーライド
    modulePath.set("maths")
}
```

この構成により、`:turbo-lib:maths` モジュールの生成されたドキュメントは `turbo-lib/build/dokka/html/maths/` に生成されるようになります。

## javadoc.jar のビルド {id="build-javadoc-jar"}

ライブラリをリポジトリに公開する場合、ライブラリの API リファレンスドキュメントを含む `javadoc.jar` ファイルを提供する必要がある場合があります。

例えば、[Maven Central](https://central.sonatype.org/) に公開する場合、プロジェクトと一緒に `javadoc.jar` を提供する[必要があります](https://central.sonatype.org/publish/requirements/)。ただし、すべてのリポジトリにそのルールがあるわけではありません。

Dokka Gradle プラグインは、これをそのまま行う方法は提供していませんが、カスタムの Gradle タスクで実現できます。1 つは [HTML](dokka-html.md) 形式でドキュメントを生成するためのもの、もう 1 つは [Javadoc](dokka-javadoc.md) 形式のためのものです。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// HTML でドキュメントを生成する場合
val dokkaHtmlJar by tasks.registering(Jar::class) {
    description = "A HTML Documentation JAR containing Dokka HTML"
    from(tasks.dokkaGeneratePublicationHtml.flatMap { it.outputDirectory })
    archiveClassifier.set("html-doc")
}

// Javadoc でドキュメントを生成する場合
val dokkaJavadocJar by tasks.registering(Jar::class) {
    description = "A Javadoc JAR containing Dokka Javadoc"
    from(tasks.dokkaGeneratePublicationJavadoc.flatMap { it.outputDirectory })
    archiveClassifier.set("javadoc")
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
// HTML でドキュメントを生成する場合
tasks.register('dokkaHtmlJar', Jar) {
    description = 'A HTML Documentation JAR containing Dokka HTML'
    from(tasks.named('dokkaGeneratePublicationHtml').flatMap { it.outputDirectory })
    archiveClassifier.set('html-doc')
}

// Javadoc でドキュメントを生成する場合
tasks.register('dokkaJavadocJar', Jar) {
    description = 'A Javadoc JAR containing Dokka Javadoc'
    from(tasks.named('dokkaGeneratePublicationJavadoc').flatMap { it.outputDirectory })
    archiveClassifier.set('javadoc')
}
```

</tab>
</tabs>

> ライブラリを Maven Central に公開する場合、[javadoc.io](https://javadoc.io/) のようなサービスを使用して、ライブラリの API ドキュメントを無料で、セットアップなしでホストできます。このサービスは `javadoc.jar` から直接ドキュメントページを取得します。[この例](https://javadoc.io/doc/com.trib3/server/latest/index.html) に示されているように、HTML 形式でもうまく機能します。
>
{style="tip"}

## 構成例 {id="configuration-examples"}

お使いのプロジェクトの種類によって、Dokka の適用方法と構成方法が若干異なります。ただし、[構成オプション](dokka-gradle-configuration-options.md) 自体はプロジェクトの種類に関係なく同じです。

プロジェクトのルートにある単一の `build.gradle.kts` または `build.gradle` ファイルを持つ、シンプルでフラットなプロジェクトについては、[シングルプロジェクト構成](#シングルプロジェクト構成) を参照してください。

サブプロジェクトや複数のネストされた `build.gradle.kts` または `build.gradle` ファイルを持つ、より複雑なビルドについては、[マルチプロジェクト構成](#マルチプロジェクト構成) を参照してください。

### シングルプロジェクト構成 {id="single-project-configuration"}

シングルプロジェクトビルドには、通常、プロジェクトのルートに `build.gradle.kts` または `build.gradle` ファイルが 1 つだけあります。
これらはシングルプラットフォームまたはマルチプラットフォームのいずれかであり、通常は次のような構造をしています。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

シングルプラットフォーム:

```text
.
├── build.gradle.kts
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

マルチプラットフォーム:

```text
.
├── build.gradle.kts
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

シングルプラットフォーム:

```text
.
├── build.gradle
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

マルチプラットフォーム:

```text
.
├── build.gradle
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
</tabs>

ルートの `build.gradle.kts` ファイルで Dokka Gradle プラグインを適用し、トップレベルの `dokka {}` DSL を使用して構成します。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set("MyProject")
        outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
        includes.from("README.md")
   }

    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl.set(URI("https://github.com/your-repo"))
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

`./build.gradle` 内:

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set("MyProject")
            outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
            includes.from("README.md")
        }
    }

    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

</tab>
</tabs>

この構成により、プロジェクトに Dokka が適用され、ドキュメントの出力ディレクトリが設定され、メインのソースセットが定義されます。
同じ `dokka {}` ブロック内でカスタムアセット、可視性フィルタ、またはプラグイン構成を追加することで、さらに拡張できます。
詳細については、[構成オプション](dokka-gradle-configuration-options.md) を参照してください。

### マルチプロジェクト構成 {id="multi-project-configuration"}

[マルチプロジェクトビルド](https://docs.gradle.org/current/userguide/multi_project_builds.html) には、通常、複数のネストされた `build.gradle.kts` ファイルが含まれ、次のような構造になります。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```text
.
├── build.gradle.kts
├── settings.gradle.kts
├── subproject-A/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle.kts
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

```text
.
├── build.gradle
├── settings.gradle
├── subproject-A/
│   ├── build.gradle
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
</tabs>

シングルプロジェクトとマルチプロジェクトのドキュメントは、同じ [トップレベル `dokka {}` DSL を使用した構成モデル](#シングルプロジェクト構成) を共有します。

マルチプロジェクトビルドで Dokka を構成するには、2 つの方法があります。

* **[コンベンションプラグインを介した共有構成](#コンベンションプラグインを介した共有構成) (推奨)**: コンベンションプラグインを定義し、それをすべてのサブプロジェクトに適用します。これにより、Dokka の設定が集中管理されます。

* **[手動構成](#手動構成)**: 各サブプロジェクトで Dokka プラグインを適用し、同じ `dokka {}` ブロックを繰り返します。コンベンションプラグインは必要ありません。

サブプロジェクトを構成した後、複数のサブプロジェクトからのドキュメントを単一の出力に集約できます。詳細については、[マルチプロジェクトビルドでのドキュメント出力の集約](#マルチプロジェクトビルドでのドキュメント出力の集約) を参照してください。

> マルチプロジェクトの例については、[Dokka の GitHub リポジトリ](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example) を参照してください。
>
{style="tip"}

#### コンベンションプラグインを介した共有構成 {id="shared-configuration-via-a-convention-plugin"}

以下の手順に従って、コンベンションプラグインをセットアップし、サブプロジェクトに適用します。

##### buildSrc ディレクトリをセットアップする {id="set-up-the-buildsrc-directory"}

1. プロジェクトルートに、次の 2 つのファイルを含む `buildSrc` ディレクトリを作成します。

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

##### Dokka コンベンションプラグインをセットアップする {id="set-up-the-dokka-convention-plugin"}

`buildSrc` ディレクトリをセットアップした後、Dokka コンベンションプラグインをセットアップします。

1. [コンベンションプラグイン](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins) をホストするために `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` ファイルを作成します。
2. `dokka-convention.gradle.kts` ファイルに、以下のスニペットを追加します。

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 共有構成をここに記述します
    }
    ```

   `dokka {}` ブロック内に、すべてのサブプロジェクトに共通する共有の Dokka [構成](dokka-gradle-configuration-options.md) を追加する必要があります。
   また、Dokka のバージョンを指定する必要はありません。バージョンはすでに `buildSrc/build.gradle.kts` ファイルで設定されています。

##### コンベンションプラグインをサブプロジェクトに適用する {id="apply-the-convention-plugin-to-your-subprojects"}

各サブプロジェクトの `build.gradle.kts` ファイルに追加することで、サブプロジェクト全体に Dokka コンベンションプラグインを適用します。

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 手動構成 {id="manual-configuration"}

プロジェクトでコンベンションプラグインを使用していない場合は、同じ `dokka {}` ブロックを各サブプロジェクトに手動でコピーすることで、同じ Dokka 構成パターンを再利用できます。

1. すべてのサブプロジェクトの `build.gradle.kts` ファイルで Dokka プラグインを適用します。

   ```kotlin
   plugins {
       id("org.jetbrains.dokka") version "%dokkaVersion%"
   }
   ```

2. 各サブプロジェクトの `dokka {}` ブロックで共有構成を宣言します。構成を集中管理するコンベンションプラグインがないため、サブプロジェクト間で必要な構成を複製します。詳細については、[構成オプション](dokka-gradle-configuration-options.md) を参照してください。

#### 親プロジェクトの構成 {id="parent-project-configuration"}

マルチプロジェクトビルドでは、ルートプロジェクトでドキュメント全体に適用される設定を構成できます。
これには、出力形式の定義、出力ディレクトリ、ドキュメントのサブプロジェクト名、すべてのサブプロジェクトからのドキュメントの集約、およびその他の [構成オプション](dokka-gradle-configuration-options.md) が含まれます。

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    // プロジェクト全体にプロパティを設定します
    dokkaPublications.html {
        moduleName.set("My Project")
        outputDirectory.set(layout.buildDirectory.dir("docs/html"))
        includes.from("README.md")
    }

    dokkaSourceSets.configureEach {
        documentedVisibilities.set(setOf(VisibilityModifier.Public)) // または documentedVisibilities(VisibilityModifier.Public)    
    }
}

// サブプロジェクトのドキュメントを集約
dependencies {
    dokka(project(":childProjectA"))
    dokka(project(":childProjectB"))
}
```

さらに、カスタム構成が必要な場合は、各サブプロジェクトに独自の `dokka {}` ブロックを持たせることができます。
次の例では、サブプロジェクトが Dokka プラグインを適用し、カスタムサブプロジェクト名を設定し、その `README.md` ファイルから追加のドキュメントを含めています。

```kotlin
// subproject/build.gradle.kts
plugins {
    id("org.jetbrains.dokka")
}

dokka {
    dokkaPublications.html {
        moduleName.set("Child Project A")
        includes.from("README.md")
    }
}
```
