[//]: # (title: Gradle プロジェクトの構成)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html) を使用して Kotlin プロジェクトをビルドするには、
ビルドスクリプトファイル `build.gradle(.kts)` に [Kotlin Gradle プラグインを追加](#apply-the-plugin)し、
そこで[プロジェクトの依存関係を構成](#configure-dependencies)する必要があります。

> ビルドスクリプトの内容についての詳細は、
> [ビルドスクリプトの調査](get-started-with-jvm-gradle-project.md#explore-the-build-script)セクションを参照してください。
>
{style="note"}

## プラグインの適用

Kotlin Gradle プラグインを適用するには、Gradle プラグイン DSL の [`plugins{}` ブロック](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)を使用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // `<...>` をターゲット環境に適したプラグイン名に置き換えてください
    kotlin("<...>") version "%kotlinVersion%"
    // 例えば、ターゲット環境が JVM の場合：
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // `<...>` をターゲット環境に適したプラグイン名に置き換えてください
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例えば、ターゲット環境が JVM の場合： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle プラグイン (KGP) と Kotlin は同じバージョン番号を共有しています。
>
{style="note"}

プロジェクトを構成する際は、Kotlin Gradle プラグイン (KGP) と利用可能な Gradle バージョンとの互換性を確認してください。
次の表は、**完全にサポートされている** Gradle および Android Gradle プラグイン (AGP) の最小および最大バージョンです。

| KGP バージョン | Gradle の最小および最大バージョン | AGP の最小および最大バージョン |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.0-2.4.10  | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.3.20–2.3.21 | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         |
| 2.3.10        | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         |
| 2.3.0         | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        |
| 2.2.20–2.2.21 | 7.6.3–8.14                            | 7.3.1–8.11.1                                        |
| 2.2.0–2.2.10  | 7.6.3–8.14                            | 7.3.1–8.10.0                                        |
| 2.1.20–2.1.21 | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         |
| 2.1.0–2.1.10  | 7.6.3–8.10*                           | 7.3.1–8.7.2                                         |
| 2.0.20–2.0.21 | 6.8.3–8.8*                            | 7.1.3–8.5                                           |
| 2.0.0         | 6.8.3–8.5                             | 7.1.3–8.3.1                                         |
| 1.9.20–1.9.25 | 6.8.3–8.1.1                           | 4.2.2–8.1.0                                         |

> *Kotlin 2.0.20–2.0.21 および Kotlin 2.1.0–2.1.10 は、Gradle 8.6 まで完全に互換性があります。
> Gradle バージョン 8.7–8.10 もサポートされていますが、1 つだけ例外があります。Kotlin Multiplatform Gradle プラグインを使用している場合、JVM ターゲットで `withJava()` 関数を呼び出しているマルチプラットフォームプロジェクトで非推奨の警告が表示されることがあります。
> 詳細については、[デフォルトで作成される Java ソースセット](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)を参照してください。
>
{style="warning"}

最新リリースの Gradle および AGP バージョンを使用することも可能ですが、その場合は非推奨の警告が発生したり、一部の新機能が動作しない可能性があることに注意してください。

例えば、Kotlin Gradle プラグインおよび `kotlin-multiplatform` プラグイン %kotlinVersion% では、プロジェクトのコンパイルに最小 Gradle バージョン %minGradleVersion% が必要です。

同様に、完全にサポートされている最大バージョンは %maxGradleVersion% です。これには非推奨の Gradle メソッドやプロパティが含まれず、現在のすべての Gradle 機能をサポートしています。

### 以前の KGP バージョン {initial-collapse-state="collapsed" collapsible="true"}

| KGP バージョン | Gradle の最小および最大バージョン | AGP の最小および最大バージョン |
|---------------|---------------------------------------|-----------------------------------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                           | 4.2.2–7.4.0                                         |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                           | 4.1.3–7.4.0                                         |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                           | 4.1.3–7.2.1                                         |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                           | 3.6.4–7.0.4                                         |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                           | 3.4.3–7.0.2                                         |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                           | 3.4.3–7.0.2                                         |

### プロジェクト内の Kotlin Gradle プラグインデータ

デフォルトでは、Kotlin Gradle プラグインはプロジェクト固有の永続データをプロジェクトのルートにある `.kotlin` ディレクトリに保存します。

> `.kotlin` ディレクトリをバージョン管理システムにコミットしないでください。
> 例えば、Git を使用している場合は、プロジェクトの `.gitignore` ファイルに `.kotlin` を追加してください。
>
{style="warning"}

この動作を構成するためにプロジェクトの `gradle.properties` ファイルに追加できるプロパティがあります。

| Gradle プロパティ | 説明 |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir` | プロジェクトレベルのデータが保存される場所を構成します。デフォルト：`<project-root-directory>/.kotlin` |
| `kotlin.project.persistent.dir.gradle.disableWrite` | Kotlin データの `.gradle` ディレクトリへの書き込みを無効にするかどうかを制御します（古い IDEA バージョンとの後方互換性のため）。デフォルト：false |

## JVM をターゲットにする

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

### Kotlin および Java ソース

Kotlin ソースと Java ソースは、同じディレクトリに保存することも、別のディレクトリに配置することもできます。

デフォルトの規約では、異なるディレクトリを使用します。

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> Java の `.java` ファイルを `src/*/kotlin` ディレクトリに保存しないでください。これらの `.java` ファイルはコンパイルされません。
> 
> 代わりに `src/main/java` を使用できます。
>
{style="warning"} 

デフォルトの規約を使用しない場合は、対応する `sourceSets` プロパティを更新する必要があります。

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

### 関連するコンパイルタスクの JVM ターゲット互換性のチェック

ビルドモジュール内には、以下のような関連するコンパイルタスクが存在する場合があります。
* `compileKotlin` と `compileJava`
* `compileTestKotlin` と `compileTestJava`

> `main` と `test` ソースセットのコンパイルタスクは関連していません。
>
{style="note"}

このような関連タスクについて、Kotlin Gradle プラグインは JVM ターゲットの互換性をチェックします。`kotlin` エクステンションまたはタスク内の [`jvmTarget` 属性](gradle-compiler-options.md#attributes-specific-to-jvm)と、`java` エクステンションまたはタスク内の [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension) の値が異なると、JVM ターゲットの不整合が発生します。例えば、`compileKotlin` タスクが `jvmTarget=1.8` で、`compileJava` タスクが `targetCompatibility=15` を持っている（または[継承している](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)）場合などです。

このチェックの動作をプロジェクト全体で構成するには、`gradle.properties` ファイルで `kotlin.jvm.target.validation.mode` プロパティを以下のように設定します。

* `error` – プラグインはビルドを失敗させます。Gradle 8.0 以降のプロジェクトのデフォルト値です。
* `warning` – プラグインは警告メッセージを表示します。Gradle 8.0 未満のプロジェクトのデフォルト値です。
* `ignore` – プラグインはチェックをスキップし、メッセージを出力しません。

`build.gradle(.kts)` ファイル内のタスクレベルで構成することもできます。

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

JVM ターゲットの不整合を避けるには、[ツールチェーンを構成する](#gradle-java-toolchains-support)か、手動で JVM バージョンを合わせてください。

#### ターゲットに互換性がない場合に起こり得ること {initial-collapse-state="collapsed" collapsible="true"}

Kotlin および Java ソースセットの JVM ターゲットを手動で設定する方法は 2 つあります。
* [Java ツールチェーンの設定](#gradle-java-toolchains-support)による暗黙的な方法。
* `kotlin` エクステンションまたはタスクで `jvmTarget` 属性を設定し、`java` エクステンションまたはタスクで `targetCompatibility` を設定する明示的な方法。

JVM ターゲットの不整合は、次の場合に発生します。
* `jvmTarget` と `targetCompatibility` に明示的に異なる値を設定した場合。
* デフォルト構成であり、JDK が `1.8` ではない場合。

ビルドスクリプトに Kotlin JVM プラグインのみがあり、JVM ターゲットの追加設定がないデフォルトの構成を考えてみましょう。

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

ビルドスクリプトに `jvmTarget` の値に関する明示的な情報がない場合、そのデフォルト値は `null` となり、コンパイラはそれをデフォルト値の `1.8` として扱います。`targetCompatibility` は現在の Gradle の JDK バージョンと等しくなります。これは（[Java ツールチェーンのアプローチ](gradle-configure-project.md#gradle-java-toolchains-support)を使用しない限り）使用している JDK バージョンと同じです。JDK バージョンが `%jvmLTSVersionSupportedByKotlin%` であると仮定すると、公開されるライブラリアーティファクトは JDK %jvmLTSVersionSupportedByKotlin% 以上との[互換性を宣言](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)します（`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`）。これは誤りです。この場合、バイトコードのバージョンが `1.8` であっても、メインプロジェクトでこのライブラリを追加するには Java %jvmLTSVersionSupportedByKotlin% を使用しなければなりません。この問題を解決するには、[ツールチェーンを構成](gradle-configure-project.md#gradle-java-toolchains-support)してください。

### Gradle Java ツールチェーンのサポート

> Android ユーザーへの警告。Gradle ツールチェーンのサポートを使用するには、Android Gradle プラグイン (AGP) バージョン 8.1.0-alpha09 以降を使用してください。
> 
> Gradle Java ツールチェーンのサポートは AGP 7.4.0 から[利用可能](https://issuetracker.google.com/issues/194113162)になりました。
> しかし、[この問題](https://issuetracker.google.com/issues/260059413)のため、AGP はバージョン 8.1.0-alpha09 まで `targetCompatibility` をツールチェーンの JDK と等しく設定しませんでした。
> 8.1.0-alpha09 未満のバージョンを使用する場合は、`compileOptions` を介して手動で `targetCompatibility` を構成する必要があります。プレースホルダー `<MAJOR_JDK_VERSION>` を使用したい JDK バージョンに置き換えてください。
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
この機能を使用すると、以下のことが可能になります。
* コンパイル、テスト、実行可能ファイルの実行に、Gradle 自体の実行環境とは異なる JDK および JRE を使用する。
* まだリリースされていない言語バージョンでコードをコンパイルおよびテストする。

ツールチェーンのサポートにより、Gradle はローカルの JDK を自動検出し、ビルドに必要な不足している JDK をインストールできます。これにより、Gradle 自体は任意の JDK で実行しながら、メジャー JDK バージョンに依存するタスクに対して[リモートビルドキャッシュ機能](gradle-compilation-and-caches.md#gradle-build-cache-support)を再利用できます。

Kotlin Gradle プラグインは、Kotlin/JVM コンパイルタスクで Java ツールチェーンをサポートしています。JS および Native タスクはツールチェーンを使用しません。Kotlin コンパイラは常に Gradle デーモンが実行されている JDK 上で動作します。
Java ツールチェーンは以下のことを行います。
* JVM ターゲットで利用可能な [`-jdk-home` オプション](compiler-reference.md#jdk-home-path)を設定する。
* ユーザーが `jvmTarget` オプションを明示的に設定していない場合、[`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm) をツールチェーンの JDK バージョンに設定する。
  ユーザーがツールチェーンを構成していない場合、`jvmTarget` フィールドはデフォルト値を使用します。
  [関連するコンパイルタスクの JVM ターゲット互換性のチェック](#check-for-jvm-target-compatibility-of-related-compile-tasks)についての詳細を確認してください。
* すべての Java コンパイル、テスト、javadoc タスクで使用されるツールチェーンを設定する。
* [`kapt` ワーカー](kapt.md#run-kapt-tasks-in-parallel)が実行される JDK に影響を与える。

ツールチェーンを設定するには、以下のコードを使用します。プレースホルダー `<MAJOR_JDK_VERSION>` を使用したい JDK バージョンに置き換えてください。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // またはより短く：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例えば：
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
    // またはより短く：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例えば：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

`kotlin` エクステンションを介してツールチェーンを設定すると、Java コンパイルタスクのツールチェーンも更新されることに注意してください。

`java` エクステンションを介してツールチェーンを設定することもでき、Kotlin コンパイルタスクはそれを使用します。

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

Gradle 8.0.2 以降を使用している場合は、[ツールチェーンリゾルバープラグイン](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)も追加する必要があります。
このタイプのプラグインは、どのリポジトリからツールチェーンをダウンロードするかを管理します。例として、`settings.gradle(.kts)` に以下のプラグインを追加します。

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

`foojay-resolver-convention` のバージョンが使用している Gradle バージョンに対応しているかを [Gradle サイト](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)で確認してください。

> Gradle がどのツールチェーンを使用しているかを把握するには、Gradle ビルドを[ログレベル `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) で実行し、出力の中で `[KOTLIN] Kotlin compilation 'jdkHome' argument:` で始まる文字列を探してください。コロンの後の部分がツールチェーンの JDK バージョンになります。
>
{style="note"}

特定のタスクに対して任意の JDK（ローカルのものを含む）を設定するには、[タスク DSL](#set-jdk-version-with-the-task-dsl) を使用します。

[Kotlin プラグインにおける Gradle JVM ツールチェーンサポート](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)の詳細についてはこちらを参照してください。

### タスク DSL による JDK バージョンの設定

タスク DSL を使用すると、`UsesKotlinJavaToolchain` インターフェースを実装する任意のタスクに任意の JDK バージョンを設定できます。
現時点では、これらのタスクは `KotlinCompile` および `KaptTask` です。
Gradle にメジャー JDK バージョンを検索させたい場合は、ビルドスクリプト内の `<MAJOR_JDK_VERSION>` プレースホルダーを置き換えてください。

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

または、ローカル JDK へのパスを指定し、プレースホルダー `<LOCAL_JDK_VERSION>` をその JDK バージョンで置き換えることもできます。

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // JDK へのパスを指定してください
        JavaVersion.<LOCAL_JDK_VERSION> // 例：JavaVersion.17
    )
}
```

### コンパイルタスクの関連付け

コンパイルを*関連付け*（Associate）し、あるコンパイルが別のコンパイルのコンパイル済み出力を使用するように関係を設定できます。コンパイルを関連付けることで、それらの間に `internal` 可視性が確立されます。

Kotlin コンパイラは、各ターゲットの `test` コンパイルと `main` コンパイルなど、一部のコンパイルをデフォルトで関連付けます。カスタムコンパイルの 1 つを別のコンパイルに接続する必要がある場合は、独自の関連コンパイルを作成してください。

IDE でソースセット間の可視性を推論するための関連コンパイルをサポートするには、`build.gradle(.kts)` に以下のコードを追加します。

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

ここでは、`integrationTest` コンパイルを `main` コンパイルに関連付けており、これにより機能テストから `internal` オブジェクトへのアクセスが可能になります。

### Java モジュール (JPMS) を有効にした構成

Kotlin Gradle プラグインを [Java モジュール (Java Modules)](https://www.oracle.com/corporate/features/understanding-java-9-modules.html) で動作させるには、ビルドスクリプトに以下の行を追加し、`YOUR_MODULE_NAME` を JPMS モジュールへの参照（例：`org.company.module`）に置き換えます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileJava", JavaCompile::class.java) {
    // javac にコンパイル済みの Kotlin クラスを提供します。Java/Kotlin 混合ソースを動作させるために必要です
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
    // javac にコンパイル済みの Kotlin クラスを提供します。Java/Kotlin 混合ソースを動作させるために必要です
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
> モジュールの場合、Kotlin ファイル内のパッケージ名は `module-info.java` のパッケージ名と一致させる必要があります。そうしないと、「パッケージが空であるか存在しない」というビルドエラーが発生します。
>
{style="note"}

詳細については以下を参照してください。
* [Java モジュールシステム用のモジュールの構築](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [Java モジュールシステムを使用したアプリケーションの構築](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin における「モジュール」の意味](visibility-modifiers.md#modules)

### その他の詳細

#### コンパイルタスクでのアーティファクト使用の無効化

稀なシナリオで、循環依存エラーによるビルド失敗が発生することがあります。例えば、あるコンパイルが別のコンパイルのすべての内部宣言を見ることができ、生成されたアーティファクトが両方のコンパイルタスクの出力に依存している複数のコンパイルがある場合などです。

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

この循環依存エラーを修正するために、Gradle プロパティ `archivesTaskOutputAsFriendModule` を追加しました。
このプロパティは、コンパイルタスクでのアーティファクト入力の使用を制御し、その結果としてタスク依存関係が作成されるかどうかを決定します。

デフォルトでは、タスクの依存関係を追跡するためにこのプロパティは `true` に設定されています。循環依存エラーが発生した場合は、コンパイルタスクでのアーティファクトの使用を無効にしてタスクの依存関係を削除し、循環依存エラーを回避できます。

コンパイルタスクでのアーティファクトの使用を無効にするには、`gradle.properties` ファイルに以下を追加します。

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### Kotlin/JVM タスクのレイジーな作成

Kotlin 1.8.20 以降、Kotlin Gradle プラグインはすべてのタスクを登録し、ドライラン（実行前の検証）ではそれらを構成しません。

#### コンパイルタスクの destinationDirectory のデフォルト以外の場所

Kotlin/JVM の `KotlinJvmCompile`/`KotlinCompile` タスクの `destinationDirectory` の場所をオーバーライドする場合は、ビルドスクリプトを更新してください。JAR ファイル内で `sourceSets.main.kotlin.classesDirectories` を `sourceSets.main.outputs` に明示的に追加する必要があります。

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 複数のプラットフォームをターゲットにする

[複数のプラットフォーム](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)をターゲットにするプロジェクトは[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/get-started.html)と呼ばれ、`kotlin-multiplatform` プラグインが必要です。

>`kotlin-multiplatform` プラグインは、Gradle %minGradleVersion% 以降で動作します。
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

[さまざまなプラットフォーム向けの Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) および [iOS と Android 向けの Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html) の詳細についてはこちらを参照してください。

## Android をターゲットにする

Android アプリケーションの作成には Android Studio を使用することをお勧めします。[Android Gradle プラグインの使用方法](https://developer.android.com/studio/releases/gradle-plugin)を学んでください。

## Web をターゲットにする

Kotlin は Kotlin Multiplatform を通じて、Web 開発のための 2 つのアプローチを提供しています。

* JavaScript ベース（Kotlin/JS コンパイラを使用）
* WebAssembly ベース（Kotlin/Wasm コンパイラを使用）

どちらのアプローチも Kotlin Multiplatform プラグインを使用しますが、サポートするユースケースが異なります。
以下のセクションでは、Gradle ビルドで各ターゲットを構成する方法と、それらをいつ使用すべきかについて説明します。

### JavaScript をターゲットにする

以下の目的がある場合は Kotlin/JS を使用してください。

* ビジネスロジックを JavaScript/TypeScript のコードベースと共有する
* Kotlin で共有不可能な Web アプリを構築する

詳細については、[Web 開発](web-overview.md#kotlin-js)を参照してください。

JavaScript をターゲットにする場合は、`kotlin-multiplatform` プラグインを使用します。

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

ブラウザまたは Node.js 環境のどちらで実行するかを指定して、JavaScript ターゲットを構成します。

```kotlin
kotlin {
    js().browser {  // または js().nodejs
        /* ... */
    }
}
```

> [JavaScript 用の Gradle 構成の詳細](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)を参照し、[Kotlin/JS プロジェクトの設定](js-project-setup.md)についてさらに学んでください。
>
{style="note"}

### WebAssembly をターゲットにする

複数のプラットフォーム間でロジックと UI の両方を共有したい場合は、Kotlin/Wasm を使用してください。詳細については、[Web 開発](web-overview.md#kotlin-wasm)を参照してください。

JavaScript と同様に、WebAssembly (Wasm) をターゲットにする場合も `kotlin-multiplatform` プラグインを使用します。

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

要件に応じて、以下のターゲットを指定できます。

* **`wasmJs`**: ブラウザまたは Node.js での実行用
* **`wasmWasi`**: Wasmtime、WasmEdge などの [WASI (WebAssembly System Interface)](https://wasi.dev/) をサポートする Wasm環境での実行用

Web ブラウザまたは Node.js 用に `wasmJs` ターゲットを構成します。

```kotlin
kotlin {
    wasmJs {
        browser { // または nodejs
            /* ... */
        }
    }
}
```

WASI 環境の場合は、`wasmWasi` ターゲットを構成します。

```kotlin
kotlin {
    wasmWasi {
        nodejs {
            /* ... */
        }
    }
}
```

> [Wasm 用の Gradle 構成の詳細](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)を参照してください。
>
{style="note"}

### Web ターゲットにおける Kotlin および Java ソース

KGP は Kotlin ファイルに対してのみ動作するため、（プロジェクトに Java ファイルが含まれている場合は）Kotlin ファイルと Java ファイルを分けて管理することをお勧めします。個別に保存しない場合は、`sourceSets{}` ブロックでソースフォルダを指定してください。

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

## KotlinBasePlugin インターフェースによる構成アクションのトリガー

Kotlin Gradle プラグイン（JVM、JS、マルチプラットフォーム、Native など）が適用されるたびに構成アクションをトリガーするには、すべての Kotlin プラグインが継承している `KotlinBasePlugin` インターフェースを使用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // ここでアクションを構成します
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // ここでアクションを構成します
}
```

</tab>
</tabs>

## 依存関係の構成

ライブラリへの依存関係を追加するには、ソースセット DSL の `dependencies{}` ブロックで、必要な[タイプ](#dependency-types)（例：`implementation`）の依存関係を設定します。

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

### トップレベルでの依存関係の構成
<primary-label ref="experimental-opt-in"/>

マルチプラットフォームプロジェクトでは、トップレベルの `dependencies {}` ブロックを使用して共通の依存関係を構成できます。ここで宣言された依存関係は、`commonMain` または `commonTest` ソースセットに追加されたかのように動作します。

トップレベルの `dependencies {}` ブロックを使用するには、ブロックの前に `@OptIn(ExperimentalKotlinGradlePluginApi::class)` アノテーションを追加してオプトインしてください。

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

この機能に関するフィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) で共有できます。

### 依存関係のタイプ

要件に基づいて依存関係のタイプを選択してください。

<table>
    <tr>
        <th>タイプ</th>
        <th>説明</th>
        <th>いつ使用するか</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>コンパイル時とランタイム時の両方で使用され、ライブラリの利用者にエクスポートされます。</td>
        <td>依存関係の任意の型が現在のモジュールのパブリック API で使用されている場合は、<code>api</code> 依存関係を使用します。
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>現在のモジュールのコンパイル時およびランタイム時に使用されますが、<code>implementation</code> 依存関係を持つモジュールに依存している他のモジュールのコンパイルには公開されません。</td>
        <td>
            <p>モジュールの内部ロジックに必要な依存関係に使用します。</p>
            <p>モジュールが公開されないエンドポイントアプリケーションである場合は、<code>api</code> 依存関係の代わりに <code>implementation</code> 依存関係を使用してください。</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>現在のモジュールのコンパイルに使用され、ランタイム時や他のモジュールのコンパイル時には利用できません。</td>
        <td>実行時にサードパーティの実装が利用可能である API に使用します。</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>実行時には利用可能ですが、どのモジュールのコンパイル時にも表示されません。</td>
        <td></td>
    </tr>
</table>

### 標準ライブラリへの依存関係

標準ライブラリ (`stdlib`) への依存関係は、各ソースセットに自動的に追加されます。使用される標準ライブラリのバージョンは、Kotlin Gradle プラグインのバージョンと同じです。

プラットフォーム固有のソースセットには、対応するプラットフォーム固有のライブラリバリアントが使用され、その他のソースセットには共通の標準ライブラリが追加されます。Kotlin Gradle プラグインは、Gradle ビルドスクリプトの `compilerOptions.jvmTarget` [コンパイラオプション](gradle-compiler-options.md)に応じて適切な JVM 標準ライブラリを選択します。

標準ライブラリの依存関係を明示的に宣言した場合（例：別のバージョンが必要な場合）、Kotlin Gradle プラグインはそれをオーバーライドしたり、2 つ目の標準ライブラリを追加したりすることはありません。

標準ライブラリがまったく不要な場合は、`gradle.properties` ファイルに以下の Gradle プロパティを追加できます。

```none
kotlin.stdlib.default.dependency=false
```

#### 推移的依存関係のバージョンアライメント

Kotlin 標準ライブラリのバージョン 1.9.20 から、Gradle は標準ライブラリに含まれるメタデータを使用して、推移的な `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` の依存関係を自動的にアライン（調整）します。

1.8.0 ～ 1.9.10 の間の Kotlin 標準ライブラリバージョンの依存関係を追加した場合（例：`implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`）、Kotlin Gradle プラグインは推移的な `kotlin-stdlib-jdk7` および `kotlin-stdlib-jdk8` 依存関係にこの Kotlin バージョンを使用します。これにより、異なる標準ライブラリバージョンによるクラスの重複が回避されます。[kotlin-stdlib-jdk7 および kotlin-stdlib-jdk8 の kotlin-stdlib への統合](whatsnew18.md#updated-jvm-compilation-target)についての詳細を確認してください。この動作は、`gradle.properties` ファイルの `kotlin.stdlib.jdk.variants.version.alignment` プロパティで無効にできます。

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### バージョンをアラインするその他の方法 {initial-collapse-state="collapsed" collapsible="true"}

* バージョンのアライメントに問題がある場合は、Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import) を介してすべてのバージョンをアラインできます。ビルドスクリプトで `kotlin-bom` へのプラットフォーム依存関係を宣言してください。

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

* 標準ライブラリバージョンの依存関係を追加していないが、推移的に異なる古いバージョンの Kotlin 標準ライブラリを持ち込む 2 つの異なる依存関係がある場合は、これらの推移的ライブラリに対して明示的に `%kotlinVersion%` バージョンを要求できます。

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
  
* Kotlin 標準ライブラリバージョン `%kotlinVersion%` の依存関係（`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`）と、古いバージョン（`1.8.0` より前）の Kotlin Gradle プラグインを追加した場合は、標準ライブラリのバージョンに合わせて Kotlin Gradle プラグインを更新してください。

  
  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // `<...>` をプラグイン名に置き換えてください
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // `<...>` をプラグイン名に置き換えてください
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* `1.8.0` より前のバージョンの `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8`（例：`implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`）と、推移的に `kotlin-stdlib:1.8+` を持ち込む依存関係を使用している場合は、[`kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION` を `kotlin-stdlib-jdk*:%kotlinVersion%` に置き換える](whatsnew18.md#updated-jvm-compilation-target)か、それを持ち込むライブラリから推移的な `kotlin-stdlib:1.8+` を[除外](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)してください。

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

### テストライブラリの依存関係の設定

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API は、サポートされているすべてのプラットフォームでの Kotlin プロジェクトのテストに利用できます。
Gradle プラグインが各テストソースセットに対して対応するテスト依存関係を推論できるように、`kotlin-test` 依存関係を `commonTest` ソースセットに追加します。

Kotlin/Native ターゲットは追加のテスト依存関係を必要とせず、`kotlin.test` API の実装は組み込まれています。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // これにより、すべてのプラットフォーム依存関係が自動的に持ち込まれます
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
                implementation kotlin("test") // これにより、すべてのプラットフォーム依存関係が自動的に持ち込まれます
            }
        }
    }
}
```

</tab>
</tabs>

> Kotlin モジュールへの依存関係には短縮形を使用できます。例えば、"org.jetbrains.kotlin:kotlin-test" の代わりに kotlin("test") と記述できます。
>
{style="note"}

`kotlin-test` 依存関係は、共有ソースセットまたはプラットフォーム固有のソースセットでも使用できます。

#### kotlin-test の JVM バリアント

Kotlin/JVM の場合、Gradle はデフォルトで JUnit 4 を使用します。そのため、`kotlin("test")` 依存関係は JUnit 4 用のバリアント、すなわち `kotlin-test-junit` に解決されます。

ビルドスクリプトのテストタスクで [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) または [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) を呼び出すことで、JUnit 5 または TestNG を選択できます。
以下の例は、Kotlin Multiplatform プロジェクトの場合です。

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

以下の例は、JVM プロジェクトの場合です。

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

[JVM 上で JUnit を使用してコードをテストする方法](jvm-test-using-junit.md)を学んでください。

自動的な JVM バリアント解決が構成に問題を引き起こす場合があります。その場合は、プロジェクトの `gradle.properties` ファイルに次の行を追加することで、必要なフレームワークを明示的に指定し、自動解決を無効にできます。

```text
kotlin.test.infer.jvm.variant=false
```

ビルドスクリプトで `kotlin("test")` のバリアントを明示的に使用しており、プロジェクトのビルドが互換性の競合で停止した場合は、[互換性ガイドのこの問題](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)を参照してください。

### kotlinx ライブラリへの依存関係の設定

マルチプラットフォームライブラリを使用し、共有コードに依存する必要がある場合は、共有ソースセットで一度だけ依存関係を設定します。`kotlinx-coroutines-core` や `ktor-client-core` などのライブラリのベースアーティファクト名を使用してください。

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

プラットフォーム固有の依存関係として kotlinx ライブラリが必要な場合でも、対応するプラットフォームソースセットでライブラリのベースアーティファクト名を使用できます。

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

## リポジトリの宣言

公開されているリポジトリを宣言して、そのオープンソース依存関係を使用できます。`repositories{}` ブロックで、リポジトリの名前を設定します。

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

人気のあるリポジトリには [Maven Central](https://central.sonatype.com/) や [Google's Maven repository](https://maven.google.com/web/index.html) があります。

> Maven プロジェクトも扱っている場合、Gradle と Maven プロジェクトを切り替える際に問題が発生する可能性があるため、リポジトリとして `mavenLocal()` を追加することはお勧めしません。どうしても `mavenLocal()` リポジトリを追加する必要がある場合は、`repositories{}` ブロックの最後に配置してください。詳細については、[The case for mavenLocal()](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local) を参照してください。
> 
{style="warning"}

複数のサブプロジェクトで同じリポジトリを宣言する必要がある場合は、`settings.gradle(.kts)` ファイルの `dependencyResolutionManagement{}` ブロックで一括して宣言します。

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

サブプロジェクトで宣言されたリポジトリは、一括宣言されたリポジトリをオーバーライドします。この動作の制御方法と利用可能なオプションの詳細については、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)を参照してください。

## 生成されたソースの登録
<primary-label ref="experimental-general"/>

生成されたソースを登録すると、IDE、サードパーティプラグイン、その他のツールが、生成されたコードと通常のソースファイルを区別しやすくなります。これにより、IDE などのツールが UI 上で生成されたコードを強調表示したり、プロジェクトのインポート時に生成タスクをトリガーしたりするのに役立ちます。生成されたソースを登録するには、[`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) インターフェースを使用します。

Kotlin ファイルを含むディレクトリを登録するには、`build.gradle.kts` ファイルで [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 型の [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) プロパティを使用します。例：

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

この例では、出力ディレクトリを `"src/main/kotlinGen"` とする新しいタスク `generator` を作成します。タスクが実行されると、`doLast {}` タスクアクションによって出力ディレクトリに `generated.kt` ファイルが作成されます。最後に、このタスクの出力を生成されたソースとして登録します。

Gradle プラグインを開発している場合は、[`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) プロパティを使用して、[`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) および `KotlinSourceSet.generatedKotlin` プロパティに登録されているすべてのソースにアクセスできます。

## 次のステップ

詳細については以下を参照してください。
* [コンパイラオプションとその渡し方](gradle-compiler-options.md)
* [インクリメンタルコンパイル、キャッシュサポート、ビルドレポート、および Kotlin デーモン](gradle-compilation-and-caches.md)
* [Gradle の基本と詳細](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle プラグインバリアントのサポート](gradle-plugin-variants.md)