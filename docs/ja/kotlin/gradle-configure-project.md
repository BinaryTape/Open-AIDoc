[//]: # (title: Gradle プロジェクトの構成)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html) を使用して Kotlin プロジェクトをビルドするには、ビルドスクリプトファイル `build.gradle(.kts)` に [Kotlin Gradle プラグインを追加](#apply-the-plugin)し、そこで[プロジェクトの依存関係を構成](#configure-dependencies)する必要があります。

> ビルドスクリプトの内容の詳細については、
> [ビルドスクリプトを調べる](get-started-with-jvm-gradle-project.md#explore-the-build-script)セクションを参照してください。
>
{style="note"}

## プラグインの適用 {id="apply-the-plugin"}

Kotlin Gradle プラグインを適用するには、Gradle プラグイン DSL の [`plugins{}` ブロック](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)を使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // Replace `<...>` with the plugin name appropriate for your target environment
    kotlin("<...>") version "%kotlinVersion%"
    // For example, if your target environment is JVM:
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // Replace `<...>` with the plugin name appropriate for your target environment
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // For example, if your target environment is JVM: 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle プラグイン（KGP）と Kotlin は同じバージョン番号を共有します。
>
{style="note"}

プロジェクトを構成する際は、利用可能な Gradle バージョンと Kotlin Gradle プラグイン（KGP）の互換性を確認してください。
次の表は、**完全サポート**されている Gradle および Android Gradle プラグイン（AGP）の最小バージョンと最大バージョンを示しています:

| KGP バージョン | Gradle の最小/最大バージョン | AGP の最小/最大バージョン |
|---|---|---|
| 2.4.20–2.4.21 | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.4.0–2.4.10 | 7.6.3–9.5.0 | 8.5.2–9.1.0 |
| 2.3.20–2.3.21 | 7.6.3–9.3.0 | 8.2.2–9.0.0 |
| 2.3.10 | 7.6.3–9.0.0 | 8.2.2–9.0.0 |
| 2.3.0 | 7.6.3–9.0.0 | 8.2.2–8.13.0 |
| 2.2.20–2.2.21 | 7.6.3–8.14 | 7.3.1–8.11.1 |
| 2.2.0–2.2.10 | 7.6.3–8.14 | 7.3.1–8.10.0 |
| 2.1.20–2.1.21 | 7.6.3–8.12.1 | 7.3.1–8.7.2 |
| 2.1.0–2.1.10 | 7.6.3–8.10* | 7.3.1–8.7.2 |
| 2.0.20–2.0.21 | 6.8.3–8.8* | 7.1.3–8.5 |
| 2.0.0 | 6.8.3–8.5 | 7.1.3–8.3.1 |
| 1.9.20–1.9.25 | 6.8.3–8.1.1 | 4.2.2–8.1.0 |

> *Kotlin 2.0.20–2.0.21 および Kotlin 2.1.0–2.1.10 は、Gradle 8.6 まで完全に互換性があります。
> Gradle バージョン 8.7–8.10 もサポートされていますが、1 つだけ例外があります: Kotlin Multiplatform Gradle プラグインを使用している場合、
> JVM ターゲットで `withJava()` 関数を呼び出しているマルチプラットフォームプロジェクトで非推奨の警告が表示されることがあります。
> 詳細については、[デフォルトで作成される Java ソースセット](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)を参照してください。
>
{style="warning"}

最新リリースまでの Gradle および AGP バージョンを使用することも可能ですが、その場合は非推奨の警告が発生したり、一部の新機能が動作しなかったりする可能性がある点に留意してください。

例えば、Kotlin Gradle プラグインおよび `kotlin-multiplatform` プラグインの %kotlinVersion% では、プロジェクトをコンパイルするために最低でも %minGradleVersion% の Gradle バージョンが必要です。

同様に、完全にサポートされている最大バージョンは %maxGradleVersion% です。このバージョンには非推奨の Gradle メソッドやプロパティが含まれておらず、現在のすべての Gradle 機能をサポートしています。

### 過去の KGP バージョン {initial-collapse-state="collapsed" collapsible="true" id="earlier-kgp-versions"}

| KGP バージョン | Gradle の最小/最大バージョン | AGP の最小/最大バージョン |
|---|---|---|
| 1.9.0–1.9.10 | 6.8.3–7.6.0 | 4.2.2–7.4.0 |
| 1.8.20–1.8.22 | 6.8.3–7.6.0 | 4.1.3–7.4.0 |
| 1.8.0–1.8.11 | 6.8.3–7.3.3 | 4.1.3–7.2.1 |
| 1.7.20–1.7.22 | 6.7.1–7.1.1 | 3.6.4–7.0.4 |
| 1.7.0–1.7.10 | 6.7.1–7.0.2 | 3.4.3–7.0.2 |
| 1.6.20–1.6.21 | 6.1.1–7.0.2 | 3.4.3–7.0.2 |

### プロジェクト内の Kotlin Gradle プラグインデータ {id="kotlin-gradle-plugin-data-in-a-project"}

デフォルトでは、Kotlin Gradle プラグインはプロジェクト固有の永続データをプロジェクトのルートにある `.kotlin` ディレクトリに保存します。

> `.kotlin` ディレクトリはバージョン管理にコミットしないでください。
> 例えば Git を使用している場合は、プロジェクトの `.gitignore` ファイルに `.kotlin` を追加してください。
>
{style="warning"}

この動作を設定するために、プロジェクトの `gradle.properties` ファイルに追加できるプロパティがあります:

| Gradle プロパティ | 説明 |
|---|---|
| `kotlin.project.persistent.dir` | プロジェクトレベルのデータが保存される場所を設定します。デフォルト: `<project-root-directory>/.kotlin` |
| `kotlin.project.persistent.dir.gradle.disableWrite` | Kotlin データの `.gradle` ディレクトリへの書き込みを無効にするかどうかを制御します（古い IDEA バージョンとの下位互換性のため）。デフォルト: false |

## JVM をターゲットにする {id="targeting-the-jvm"}

JVM をターゲットにするには、Kotlin JVM プラグインを適用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

このブロック内の `version` はリテラルである必要があり、別のビルドスクリプトから適用することはできません。

### Kotlin および Java のソース {id="kotlin-and-java-sources"}

Kotlin のソースと Java のソースは、同じディレクトリに配置することも、異なるディレクトリに配置することもできます。

デフォルトの規則では、異なるディレクトリを使用します:

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> Java の `.java` ファイルを `src/*/kotlin` ディレクトリに配置しないでください。`.java` ファイルはコンパイルされません。
> 
> 代わりに、`src/main/java` を使用できます。
>
{style="warning"} 

デフォルトの規則を使用しない場合は、対応する `sourceSets` プロパティを更新する必要があります:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
sourceSets.main {
    java.srcDirs("src/main/myJava", "src/main/myKotlin")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
sourceSets {
    main.kotlin.srcDirs += 'src/main/myKotlin'
    main.java.srcDirs += 'src/main/myJava'
}
```

</tab>
</tabs>

<!-- The following header is used in the Mari link service. If you wish to change it here, change the link there too -->

### 関連するコンパイルタスクの JVM ターゲット互換性のチェック {id="check-for-jvm-target-compatibility-of-related-compile-tasks"}

ビルドモジュール内には、次のような関連するコンパイルタスクが存在する場合があります:
* `compileKotlin` と `compileJava`
* `compileTestKotlin` と `compileTestJava`

> `main` と `test` ソースセットのコンパイルタスクは関連していません。
>
{style="note"}

このような関連タスクについて、Kotlin Gradle プラグインは JVM ターゲットの互換性をチェックします。`kotlin` エクステンションまたはタスクの [`jvmTarget` 属性](gradle-compiler-options.md#attributes-specific-to-jvm)と、`java` エクステンションまたはタスクの [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension) の値が異なると、JVM ターゲットの不互換性が発生します。例えば、`compileKotlin` タスクが `jvmTarget=1.8` を持ち、`compileJava` タスクが `targetCompatibility=15` を持っている（または[継承している](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)）場合などです。

このチェックの挙動をプロジェクト全体で構成するには、`gradle.properties` ファイルで `kotlin.jvm.target.validation.mode` プロパティを以下のように設定します:

* `error` – プラグインはビルドを失敗させます。Gradle 8.0 以上のプロジェクトにおけるデフォルト値です。
* `warning` – プラグインは警告メッセージを出力します。Gradle 8.0 未満のプロジェクトにおけるデフォルト値です。
* `ignore` – プラグインはチェックをスキップし、メッセージを出力しません。

`build.gradle(.kts)` ファイル内のタスクレベルで構成することも可能です:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>().configureEach {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile.class).configureEach {
    jvmTargetValidationMode = org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING
}
```

</tab>
</tabs>

JVM ターゲットの不互換性を回避するには、[ツールチェーンを構成する](#gradle-java-toolchains-support)か、手動で JVM バージョンを一致させてください。

#### ターゲットに互換性がない場合に何が起こり得るか {initial-collapse-state="collapsed" collapsible="true" id="what-can-go-wrong-if-targets-are-incompatible"}

Kotlin および Java ソースセットの JVM ターゲットを手動で設定するには、2 つの方法があります:
* [Java ツールチェーンの設定](#gradle-java-toolchains-support)による暗黙的な方法。
* `kotlin` エクステンションまたはタスクの `jvmTarget` 属性と、`java` エクステンションまたはタスクの `targetCompatibility` を設定する明示的な方法。

次の場合に JVM ターゲットの不互換性が発生します:
* `jvmTarget` と `targetCompatibility` に異なる値を明示的に設定した場合。
* デフォルト設定のままで、使用している JDK が `1.8` ではない場合。

ビルドスクリプトに Kotlin JVM プラグインのみが含まれ、JVM ターゲットに関する追加設定がないデフォルトの構成を考えてみましょう:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

ビルドスクリプトに `jvmTarget` の値に関する明示的な情報がない場合、そのデフォルト値は `null` となり、コンパイラはこれをデフォルト値の `1.8` として解釈します。一方で `targetCompatibility` は現在の Gradle の JDK バージョンと等しくなり、これはお使いの JDK バージョンと同じになります（[Java ツールチェーンのアプローチ](gradle-configure-project.md#gradle-java-toolchains-support)を使用していない場合）。お使いの JDK バージョンが `%jvmLTSVersionSupportedByKotlin%` だとすると、公開されるライブラリアーティファクトは JDK %jvmLTSVersionSupportedByKotlin%+ と[互換性があると宣言](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)してしまいます（`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`）。これは誤りです。この場合、バイトコードのバージョンが `1.8` であるにもかかわらず、このライブラリを追加するメインプロジェクトでは Java %jvmLTSVersionSupportedByKotlin% を使用しなければならなくなります。この問題を解決するには、[ツールチェーンを構成](gradle-configure-project.md#gradle-java-toolchains-support)してください。

### Gradle Java ツールチェーンのサポート {id="gradle-java-toolchains-support"}

> Android ユーザー向けの注意: Gradle ツールチェーンサポートを使用するには、Android Gradle プラグイン（AGP）バージョン 8.1.0-alpha09 以上を使用してください。
> 
> Gradle Java ツールチェーンサポートが[利用可能になった](https://issuetracker.google.com/issues/194113162)のは AGP 7.4.0 からです。
> しかしながら、[この問題](https://issuetracker.google.com/issues/260059413)のため、バージョン 8.1.0-alpha09 になるまで、AGP は `targetCompatibility` をツールチェーンの JDK と同じになるように設定していませんでした。
> 8.1.0-alpha09 未満のバージョンを使用している場合は、`compileOptions` を介して手動で `targetCompatibility` を構成する必要があります。
> プレースホルダー `<MAJOR_JDK_VERSION>` を使用したい JDK バージョンに置き換えてください:
>
> ```kotlin
> android {
>     compileOptions {
>         sourceCompatibility = <MAJOR_JDK_VERSION>
>         targetCompatibility = <MAJOR_JDK_VERSION>
>     }
> }
> ```
>
{style="warning"} 

Gradle 6.7 で [Java ツールチェーンのサポート](https://docs.gradle.org/current/userguide/toolchains.html)が導入されました。
この機能を使用すると、次のことができます:
* Gradle 自体が実行されているものとは異なる JDK や JRE を使用して、コンパイル、テスト、実行可能ファイルを実行する。
* まだリリースされていない言語バージョンでコードをコンパイルおよびテストする。

ツールチェーンのサポートにより、Gradle はローカルの JDK を自動検出し、ビルドに必要な不足している JDK をインストールできます。
これにより、Gradle 自体は任意の JDK で実行しつつ、メジャー JDK バージョンに依存するタスクに対して[リモートビルドキャッシュ機能](gradle-compilation-and-caches.md#gradle-build-cache-support)を再利用できるようになります。

Kotlin Gradle プラグインは、Kotlin/JVM コンパイルタスクに対する Java ツールチェーンをサポートしています。JS および Native タスクはツールチェーンを使用しません。
Kotlin コンパイラは、常に Gradle デーモンが実行されている JDK 上で動作します。
Java ツールチェーンは:
* JVM ターゲットで利用可能な [`-jdk-home` オプション](compiler-reference.md#jdk-home-path)を設定します。
* ユーザーが明示的に `jvmTarget` オプションを設定していない場合、[`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm) をツールチェーンの JDK バージョンに設定します。
  ユーザーがツールチェーンを構成しない場合、`jvmTarget` フィールドはデフォルト値を使用します。
  詳細については、[JVM ターゲットの互換性](#check-for-jvm-target-compatibility-of-related-compile-tasks)を参照してください。
* すべての Java コンパイル、テスト、javadoc タスクで使用されるツールチェーンを設定します。
* [`kapt` ワーカー](kapt.md#run-kapt-tasks-in-parallel)が実行される JDK に影響を与えます。

ツールチェーンを設定するには、次のコードを使用します。プレースホルダー `<MAJOR_JDK_VERSION>` を使用したい JDK バージョンに置き換えてください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // Or shorter:
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // For example:
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvmToolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
    // Or shorter:
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // For example:
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

`kotlin` エクステンション経由でツールチェーンを設定すると、Java のコンパイルタスクのツールチェーンも更新されることに注意してください。

`java` エクステンション経由でツールチェーンを設定することもでき、その場合 Kotlin のコンパイルタスクもそれを使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

</tab>
</tabs>

Gradle 8.0.2 以上を使用している場合は、[ツールチェーンリゾルバープラグイン](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)も追加する必要があります。
このプラグインは、ツールチェーンをどのリポジトリからダウンロードするかを管理します。例として、`settings.gradle(.kts)` に次のプラグインを追加します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version("%foojayResolver%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '%foojayResolver%'
}
```

</tab>
</tabs>

`foojay-resolver-convention` のバージョンがお使いの Gradle バージョンに対応しているかを [Gradle のサイト](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)で確認してください。

> Gradle がどのツールチェーンを使用しているかを確認するには、[ログレベル `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) で Gradle ビルドを実行し、
> 出力の中から `[KOTLIN] Kotlin compilation 'jdkHome' argument:` で始まる文字列を探してください。
> コロンの後の部分が、ツールチェーンからの JDK バージョンになります。
>
{style="note"}

特定のタスクに対して任意の JDK（ローカルのものを含む）を設定するには、[Task DSL](#set-jdk-version-with-the-task-dsl) を使用します。

詳細については、[Kotlin プラグインにおける Gradle JVM ツールチェーンのサポート](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)を参照してください。

### Task DSL を使用した JDK バージョンの設定 {id="set-jdk-version-with-the-task-dsl"}

Task DSL を使用すると、`UsesKotlinJavaToolchain` インターフェースを実装する任意のタスクに対して任意の JDK バージョンを設定できます。
現時点では、これらのタスクは `KotlinCompile` および `KaptTask` です。
Gradle にメジャー JDK バージョンを検索させたい場合は、ビルドスクリプト内の `<MAJOR_JDK_VERSION>` プレースホルダーを置き換えてください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val service = project.extensions.getByType<JavaToolchainService>()
val customLauncher = service.launcherFor {
    languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
}
project.tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
JavaToolchainService service = project.getExtensions().getByType(JavaToolchainService.class)
Provider<JavaLauncher> customLauncher = service.launcherFor {
    it.languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
}
tasks.withType(UsesKotlinJavaToolchain::class).configureEach { task ->
    task.kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
</tabs>

あるいは、ローカル JDK へのパスを指定し、プレースホルダー `<LOCAL_JDK_VERSION>` をその JDK バージョンに置き換えることもできます:

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // Put a path to your JDK
        JavaVersion.<LOCAL_JDK_VERSION> // For example, JavaVersion.17
    )
}
```

### コンパイラタスクの関連付け（Associate） {id="associate-compiler-tasks"}

一方のコンパイルが他方のコンパイル済み出力を利用するようにコンパイル間の関係を設定することで、コンパイル同士を「関連付け（associate）」できます。コンパイルを関連付けることで、それらの間に `internal` 可視性が確立されます。

Kotlin コンパイラは、デフォルトで各ターゲットの `test` コンパイルと `main` コンパイルなど、一部のコンパイルを関連付けます。カスタムコンパイルが別のコンパイルと接続されていることを明示する必要がある場合は、独自の関連付けられたコンパイルを作成してください。

ソースセット間の可視性を推論するために IDE に関連付けられたコンパイルをサポートさせるには、`build.gradle(.kts)` に次のコードを追加します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val integrationTestCompilation = kotlin.target.compilations.create("integrationTest") {
    associateWith(kotlin.target.compilations.getByName("main"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
integrationTestCompilation {
    kotlin.target.compilations.create("integrationTest") {
        associateWith(kotlin.target.compilations.getByName("main"))
    }
}
```

</tab>
</tabs>

ここでは、`integrationTest` コンパイルが `main` コンパイルに関連付けられており、機能テストから `internal` オブジェクトへのアクセスが可能になっています。

### Java モジュール（JPMS）を有効にした構成 {id="configure-with-java-modules-jpms-enabled"}

Kotlin Gradle プラグインを [Java モジュール](https://dev.java/learn/modules/) と連携させるには、ビルドスクリプトに以下の行を追加し、`YOUR_MODULE_NAME` を JPMS モジュールの参照（例えば `org.company.module`）に置き換えてください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileJava", JavaCompile::class.java) {
    // Provide compiled Kotlin classes to javac – needed for Java/Kotlin mixed sources to work
    val mainOutput: FileCollection = sourceSets["main"].output
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        listOf("--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileJava", JavaCompile.class) {
    // Provide compiled Kotlin classes to javac – needed for Java/Kotlin mixed sources to work
    FileCollection mainOutput = sourceSets["main"].output
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            return ["--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> `module-info.java` は通常どおり `src/main/java` ディレクトリに配置してください。
> 
> モジュールの場合、「パッケージが空であるか存在しません（package is empty or does not exist）」というビルドエラーを防ぐため、Kotlin ファイル内のパッケージ名は `module-info.java` のパッケージ名と同じにする必要があります。
>
{style="note"}

詳細については以下を参照してください:
* [Java モジュールシステム向けモジュールのビルド](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [Java モジュールシステムを使用したアプリケーションのビルド](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin における「モジュール」の意味](visibility-modifiers.md#modules)

### その他の詳細 {id="other-details"}

#### コンパイルタスクでのアーティファクト使用の無効化 {id="disable-use-of-artifact-in-compilation-task"}

稀なシナリオとして、循環依存エラーによってビルドが失敗することがあります。例えば、あるコンパイルが別のコンパイルのすべての internal 宣言を参照でき、生成されたアーティファクトが両方のコンパイルタスクの出力に依存している複数のコンパイルが存在する場合などです:

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

この循環依存エラーを解消するために、Gradle プロパティ `archivesTaskOutputAsFriendModule` が追加されました。
このプロパティは、コンパイルタスクでのアーティファクト入力の使用を制御し、結果としてタスク依存関係が作成されるかどうかを決定します。

デフォルトでは、タスク依存関係を追跡するためにこのプロパティは `true` に設定されています。循環依存エラーが発生した場合は、コンパイルタスクでのアーティファクトの使用を無効にしてタスク依存関係を削除し、エラーを回避できます。

コンパイルタスクでのアーティファクトの使用を無効にするには、`gradle.properties` ファイルに以下を追加します:

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### Kotlin/JVM タスクの遅延作成 {id="lazy-kotlin-jvm-task-creation"}

Kotlin 1.8.20 以降、Kotlin Gradle プラグインはすべてのタスクを登録（register）し、ドライラン（dry run）時にはそれらを構成（configure）しません。

#### コンパイルタスクの destinationDirectory の非デフォルト配置 {id="non-default-location-of-compile-tasks-destinationdirectory"}

Kotlin/JVM の `KotlinJvmCompile`/`KotlinCompile` タスクの `destinationDirectory` の場所をオーバーライドする場合は、ビルドスクリプトを更新してください。JAR ファイル内の `sourceSets.main.outputs` に `sourceSets.main.kotlin.classesDirectories` を明示的に追加する必要があります:

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 複数プラットフォームをターゲットにする {id="targeting-multiple-platforms"}

[複数プラットフォーム](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)をターゲットにするプロジェクトは[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/get-started.html)と呼ばれ、`kotlin-multiplatform` プラグインが必要です。

>`kotlin-multiplatform` プラグインは Gradle %minGradleVersion% 以降で動作します。
>
{style="note"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

詳細については、[さまざまなプラットフォーム向けの Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) および [iOS および Android 向けの Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html) を参照してください。

## Android をターゲットにする {id="targeting-android"}

Android アプリケーションを作成する際は、Android Studio を使用することをお勧めします。[Android Gradle プラグインの使用方法を確認してください](https://developer.android.com/studio/releases/gradle-plugin)。

## Web をターゲットにする {id="targeting-the-web"}

Kotlin は、Kotlin Multiplatform を通じて Web 開発向けに 2 つのアプローチを提供しています:

* JavaScript ベース（Kotlin/JS コンパイラを使用）
* WebAssembly ベース（Kotlin/Wasm コンパイラを使用）

どちらのアプローチも Kotlin Multiplatform プラグインを使用しますが、サポートするユースケースが異なります。
以下のセクションでは、Gradle ビルドで各ターゲットを構成する方法と、それぞれをいつ使用するかについて説明します。

### JavaScript をターゲットにする {id="targeting-javascript"}

次の目的がある場合は Kotlin/JS を使用します:

* JavaScript/TypeScript コードベースとビジネスロジックを共有する
* Kotlin で共有不可（単独）の Web アプリケーションを構築する

詳細については、[Web 開発](web-overview.md#kotlin-js)を参照してください。

JavaScript をターゲットにする場合は、`kotlin-multiplatform` プラグインを使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

ブラウザ環境または Node.js 環境のどちらで実行するかを指定して、JavaScript ターゲットを構成します:

```kotlin
kotlin {
    js().browser {  // or js().nodejs
        /* ... */
    }
}
```

> [JavaScript 向けの Gradle 構成に関する詳細](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)を参照し、[Kotlin/JS プロジェクトのセットアップ](js-project-setup.md)についてさらに詳しく学びましょう。
>
{style="note"}

### WebAssembly をターゲットにする {id="targeting-webassembly"}

複数のプラットフォーム間でロジックと UI の両方を共有したい場合は、Kotlin/Wasm を使用します。詳細については、[Web 開発](web-overview.md#kotlin-wasm)を参照してください。

JavaScript と同様に、WebAssembly（Wasm）をターゲットにする場合も `kotlin-multiplatform` プラグインを使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

要件に応じて、以下をターゲットに設定できます:

* **`wasmJs`**: ブラウザまたは Node.js での実行用
* **`wasmWasi`**: Wasmtime や WasmEdge など、[WASI（WebAssembly System Interface）](https://wasi.dev/) をサポートする Wasm 環境での実行用

Web ブラウザまたは Node.js 向けに `wasmJs` ターゲットを構成します:

```kotlin
kotlin {
    wasmJs {
        browser { // or nodejs
            /* ... */
        }
    }
}
```

WASI 環境向けには、Node.js または Wasmtime を指定して `wasmWasi` ターゲットを構成します:

```kotlin
kotlin {
    wasmWasi {
        nodejs { // or wasmtime
            /* ... */
        }
    }
}
```

> [Wasm 向けの Gradle 構成に関する詳細を参照してください](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)。
>
{style="note"}

### Web ターゲットにおける Kotlin および Java のソース {id="kotlin-and-java-sources-for-the-web-target"}

KGP は Kotlin ファイルに対してのみ機能するため、（プロジェクトに Java ファイルが含まれている場合は）Kotlin ファイルと Java ファイルを分けておくことが推奨されます。別々に配置しない場合は、`sourceSets{}` ブロックでソースフォルダーを指定してください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets["main"].apply {
        kotlin.srcDir("src/main/myKotlin")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        main.kotlin.srcDirs += 'src/main/myKotlin'
    }
}
```

</tab>
</tabs>

## KotlinBasePlugin インターフェースによる構成アクションのトリガー {id="triggering-configuration-actions-with-the-kotlinbaseplugin-interface"}

Kotlin Gradle プラグイン（JVM、JS、Multiplatform、Native など）のいずれかが適用されたときに常に何らかの構成アクションをトリガーするには、すべての Kotlin プラグインが継承している `KotlinBasePlugin` インターフェースを使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // Configure your action here
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // Configure your action here
}
```

</tab>
</tabs>

## 依存関係の構成 {id="configure-dependencies"}

ライブラリへの依存関係を追加するには、ソースセット DSL の `dependencies{}` ブロックで必要な[タイプ](#dependency-types)（例えば `implementation`）の依存関係を設定します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</tab>
</tabs>

### トップレベルでの依存関係の構成 {id="configure-dependencies-at-the-top-level"}
<primary-label ref="experimental-opt-in"/>

トップレベルの `dependencies {}` ブロックを使用して、マルチプラットフォームプロジェクトの共通依存関係を構成できます。
ここで宣言された依存関係は、`commonMain` または `commonTest` ソースセットに追加された場合と同様に動作します。

トップレベルの `dependencies {}` ブロックを使用するには、ブロックの前に `@OptIn(ExperimentalKotlinGradlePluginApi::class)` アノテーションを追加してオプトインしてください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</tab>
</tabs>

プラットフォーム固有の依存関係は、対応するターゲットの `sourceSets {}` ブロック内に追加します。

この機能に関するフィードバックは、[YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) で共有できます。

### 依存関係のタイプ {id="dependency-types"}

要件に基づいて依存関係のタイプを選択してください。

<table>
    <tr>
        <th>タイプ</th>
        <th>説明</th>
        <th>使用するタイミング</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>コンパイル時とランタイム時の両方で使用され、ライブラリの利用者にエクスポートされます。</td>
        <td>依存関係の型が現在のモジュールのパブリック API で使用されている場合は、<code>api</code> 依存関係を使用します。
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>現在のモジュールのコンパイル時およびランタイム時に使用されますが、<code>implementation</code> 依存関係を持つモジュールに依存する他のモジュールのコンパイルには公開されません。</td>
        <td>
            <p>モジュールの内部ロジックに必要な依存関係に使用します。</p>
            <p>モジュールが公開されないエンドポイントアプリケーションである場合は、<code>api</code> 依存関係の代わりに <code>implementation</code> 依存関係を使用します。</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>現在のモジュールのコンパイルに使用され、ランタイム時や他のモジュールのコンパイル時には利用できません。</td>
        <td>ランタイム時にサードパーティの実装が利用可能である API に使用します。</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>ランタイム時に利用可能ですが、モジュールのコンパイル時には認識されません。</td>
        <td></td>
    </tr>
</table>

### 標準ライブラリへの依存関係 {id="dependency-on-the-standard-library"}

標準ライブラリ（`stdlib`）への依存関係は、各ソースセットに自動的に追加されます。使用される標準ライブラリのバージョンは、Kotlin Gradle プラグインのバージョンと同じです。

プラットフォーム固有のソースセットには対応するプラットフォーム固有のバリアントが使用され、その他のソースセットには共通の標準ライブラリが追加されます。Kotlin Gradle プラグインは、Gradle ビルドスクリプトの `compilerOptions.jvmTarget` [コンパイラオプション](gradle-compiler-options.md)に応じて適切な JVM 標準ライブラリを選択します。

標準ライブラリの依存関係を明示的に宣言した場合（例えば別のバージョンが必要な場合）、Kotlin Gradle プラグインはそれを上書きしたり、2 つ目の標準ライブラリを追加したりすることはありません。

標準ライブラリがまったく必要ない場合は、`gradle.properties` ファイルに次の Gradle プロパティを追加できます:

```none
kotlin.stdlib.default.dependency=false
```

#### 推移的依存関係のバージョンアラインメント {id="versions-alignment-of-transitive-dependencies"}

Kotlin 標準ライブラリのバージョン 1.9.20 以降、Gradle は標準ライブラリに含まれるメタデータを使用して、推移的な `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` の依存関係のバージョンを自動的にアライン（調整・一致）させます。

1.8.0 ～ 1.9.10 の間のいずれかの Kotlin 標準ライブラリバージョンに対する依存関係（例: `implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`）を追加した場合、Kotlin Gradle プラグインは推移的な `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` の依存関係に対してこの Kotlin バージョンを使用します。これにより、異なる標準ライブラリバージョンによるクラスの重複が回避されます。[`kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` の `kotlin-stdlib` への統合についての詳細](whatsnew18.md#updated-jvm-compilation-target)を参照してください。この動作は、`gradle.properties` ファイルで `kotlin.stdlib.jdk.variants.version.alignment` Gradle プロパティを設定することで無効化できます:

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### バージョンをアラインさせるその他の方法 {initial-collapse-state="collapsed" collapsible="true" id="other-ways-to-align-versions"}

* バージョンアラインメントに問題がある場合は、Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import) を使用してすべてのバージョンを一致させることができます。ビルドスクリプトで `kotlin-bom` へのプラットフォーム依存関係を宣言します:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  implementation(platform("org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%"))
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  implementation platform('org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%')
  ```

  </tab>
  </tabs>

* 標準ライブラリのバージョンに対する依存関係を追加していないものの、2 つの異なる依存関係が推移的に異なる古いバージョンの Kotlin 標準ライブラリを取り込んでいる場合、それらの推移的ライブラリに対して `%kotlinVersion%` バージョンを明示的に要求できます:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  </tabs>
  
* Kotlin 標準ライブラリバージョン `%kotlinVersion%` への依存関係（`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`）を追加しており、Kotlin Gradle プラグインの古いバージョン（`1.8.0` 未満）を使用している場合は、標準ライブラリのバージョンに合わせて Kotlin Gradle プラグインを更新してください:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // replace `<...>` with the plugin name
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // replace `<...>` with the plugin name
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* `1.8.0` より前のバージョンの `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8`（例: `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`）を使用していて、`kotlin-stdlib:1.8+` を推移的に取り込む依存関係がある場合は、[`kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION` を `kotlin-stdlib-jdk*:%kotlinVersion%` に置き換える](whatsnew18.md#updated-jvm-compilation-target)か、それを取り込むライブラリから推移的な `kotlin-stdlib:1.8+` を[除外（exclude）](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)してください:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib")
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib"
      }
  }
  ```

  </tab>
  </tabs>

### テストライブラリへの依存関係の設定 {id="set-dependencies-on-test-libraries"}

サポートされているすべてのプラットフォームで Kotlin プロジェクトをテストするために、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API が利用可能です。
`kotlin-test` の依存関係を `commonTest` ソースセットに追加すると、Gradle プラグインが各テストソースセットに対応するテスト依存関係を推論できるようになります。

Kotlin/Native ターゲットには追加のテスト依存関係は必要なく、`kotlin.test` API の実装が組み込まれています。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // This brings all the platform dependencies automatically
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // This brings all the platform dependencies automatically
            }
        }
    }
}
```

</tab>
</tabs>

> Kotlin モジュールへの依存関係には短縮表記を使用できます（例: "org.jetbrains.kotlin:kotlin-test" の代わりに kotlin("test")）。
>
{style="note"}

`kotlin-test` の依存関係は、任意の共有ソースセットまたはプラットフォーム固有のソースセットでも使用できます。

#### kotlin-test の JVM バリアント {id="jvm-variants-of-kotlin-test"}

Kotlin/JVM では、Gradle はデフォルトで JUnit 4 を使用します。そのため、`kotlin("test")` の依存関係は JUnit 4 用のバリアントである `kotlin-test-junit` に解決されます。

ビルドスクリプトのテストタスクで [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) または [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) を呼び出すことで、JUnit 5 または TestNG を選択できます。
以下の例は、Kotlin Multiplatform プロジェクト用のものです:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</tab>
</tabs>

以下の例は、JVM プロジェクト用のものです:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    testImplementation(kotlin("test"))
}

tasks {
    test {
        useTestNG()
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useTestNG()
}
```

</tab>
</tabs>

[JVM 上で JUnit を使用してコードをテストする方法を学ぶ](jvm-test-using-junit.md)。

JVM バリアントの自動解決が原因で構成に問題が発生することがあります。その場合は、プロジェクトの `gradle.properties` ファイルに次の行を追加することで、必要なフレームワークを明示的に指定し、自動解決を無効にすることができます:

```text
kotlin.test.infer.jvm.variant=false
```

ビルドスクリプトで `kotlin("test")` のバリアントを明示的に使用しており、互換性の競合によりプロジェクトのビルドが停止した場合は、[互換性ガイドのこの問題](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)を参照してください。

### kotlinx ライブラリへの依存関係の設定 {id="set-a-dependency-on-a-kotlinx-library"}

マルチプラットフォームライブラリを使用していて共通コードに依存する必要がある場合は、共有ソースセットで一度だけ依存関係を設定します。ライブラリのベースアーティファクト名（`kotlinx-coroutines-core` や `ktor-client-core` など）を使用してください:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

プラットフォーム固有の依存関係として kotlinx ライブラリが必要な場合でも、対応するプラットフォームのソースセットでライブラリのベースアーティファクト名を使用できます:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

## リポジトリの宣言 {id="declare-repositories"}

一般に公開されているリポジトリを宣言して、そのオープンソース依存関係を利用できます。`repositories{}` ブロックでリポジトリの名前を設定します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
repositories {
    mavenCentral()
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
repositories {
    mavenCentral()
}
```
</tab>
</tabs>

代表的なリポジトリには [Maven Central](https://central.sonatype.com/) や [Google の Maven リポジトリ](https://maven.google.com/web/index.html) があります。

> Maven プロジェクトも扱っている場合、Gradle プロジェクトと Maven プロジェクトを切り替える際に問題が発生する可能性があるため、リポジトリとして `mavenLocal()` を追加することは避けることをお勧めします。どうしても `mavenLocal()` リポジトリを追加する必要がある場合は、`repositories{}` ブロックの最後に追加してください。詳細については、[mavenLocal() についての検討事項](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)を参照してください。
> 
{style="warning"}

複数のサブプロジェクトで同じリポジトリを宣言する必要がある場合は、`settings.gradle(.kts)` ファイルの `dependencyResolutionManagement{}` ブロックでリポジトリを一元的に宣言します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
</tabs>

サブプロジェクトで宣言されたリポジトリは、一元的に宣言されたリポジトリを上書きします。この動作を制御する方法と利用可能なオプションの詳細については、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)を参照してください。

## 生成されたソースの登録 {id="register-generated-sources"}
<primary-label ref="experimental-general"/>

IDE、サードパーティ製プラグイン、その他のツールが生成されたコードと通常のソースファイルを区別できるように、生成されたソースを登録します。
これにより、IDE などのツールが UI 上で生成されたコードを識別しやすくハイライト表示したり、プロジェクトのインポート時に生成タスクをトリガーしたりできるようになります。
生成されたソースを登録するには、[`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) インターフェースを使用します。

Kotlin ファイルを含むディレクトリを登録するには、`build.gradle.kts` ファイルで [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 型の [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) プロパティを使用します。以下は例です:

```kotlin
val generatorTask = project.tasks.register("generator") {
    val outputDirectory = project.layout.projectDirectory.dir("src/main/kotlinGen")
    outputs.dir(outputDirectory)
    doLast {
        outputDirectory.file("generated.kt").asFile.writeText(
            // language=kotlin
            """
            fun printHello() {
                println("hello")
            }
            """.trimIndent()
        )
    }
}

kotlin.sourceSets.getByName("main").generatedKotlin.srcDir(generatorTask)
```

この例では、出力ディレクトリを `"src/main/kotlinGen"` とする新しいタスク `generator` を作成しています。タスクが実行されると、`doLast {}` タスクアクションによって出力ディレクトリに `generated.kt` ファイルが作成されます。最後に、このタスクの出力を生成されたソースとして登録しています。

Gradle プラグインを開発している場合は、[`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) プロパティを使用して、[`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) および `KotlinSourceSet.generatedKotlin` プロパティに登録されているすべてのソースにアクセスできます。

## 次のステップ {id="what-s-next"}

以下についてさらに詳しく学びましょう:
* [コンパイラオプションとその引き渡し方法](gradle-compiler-options.md)。
* [インクリメンタルコンパイル、キャッシュサポート、ビルドレポート、および Kotlin デーモン](gradle-compilation-and-caches.md)。
* [Gradle の基本と詳細](https://docs.gradle.org/current/userguide/userguide.html)。
* [Gradle プラグインバリアントのサポート](gradle-plugin-variants.md)。