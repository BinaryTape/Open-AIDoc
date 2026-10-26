[//]: # (title: Kotlin Gradle プラグインのコンパイラオプション)

Kotlin の各リリースには、サポートされているターゲット（JVM、JavaScript、および[サポートされているプラットフォーム](native-overview.md#target-platforms)向けのネイティブバイナリ）用のコンパイラが含まれています。

これらのコンパイラは、以下によって使用されます:
* IDE: Kotlin プロジェクトで __Compile__ または __Run__ ボタンをクリックしたとき。
* Gradle: コンソールまたは IDE で `gradle build` を実行したとき。
* Maven: コンソールまたは IDE で `mvn compile` や `mvn test-compile` を実行したとき。

また、[コマンドラインコンパイラでの作業](command-line.md)のチュートリアルで説明されているように、コマンドラインから手動で Kotlin コンパイラを実行することもできます。

## オプションの定義方法 {id="how-to-define-options"}

Kotlin コンパイラには、コンパイルプロセスを細かく調整するためのオプションが多数用意されています。

Gradle DSL を使用すると、コンパイラオプションを包括的に設定できます。これは [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options) および [JVM/Android](#target-the-jvm) プロジェクトで利用可能です。

Gradle DSL では、ビルドスクリプト内でコンパイラオプションを次の 3 つのレベルで設定できます:
* **[Extension（拡張）レベル](#extension-level)**: すべてのターゲットおよび共有ソースセットを対象とする `kotlin {}` ブロック内。
* **[Target（ターゲット）レベル](#target-level)**: 特定のターゲットを対象とするブロック内。
* **[Compilation unit（コンパイル単位）レベル](#compilation-unit-level)**: 通常は特定のコンパイルタスク内。

![Kotlin コンパイラオプションのレベル](compiler-options-levels.svg){width=700}

上位レベルの設定は、下位レベルの規約（デフォルト）として使用されます:

* Extension レベルで設定されたコンパイラオプションは、`commonMain`、`nativeMain`、`commonTest` などの共有ソースセットを含む Target レベルのオプションのデフォルトになります。
* Target レベルで設定されたコンパイラオプションは、`compileKotlinJvm` や `compileTestKotlinJvm` タスクなどの Compilation unit（タスク）レベルのオプションのデフォルトになります。

逆に、下位レベルで行われた設定は、上位レベルの関連する設定をオーバーライドします:

* タスクレベルのコンパイラオプションは、Target レベルまたは Extension レベルの関連設定をオーバーライドします。
* Target レベルのコンパイラオプションは、Extension レベルの関連設定をオーバーライドします。

コンパイルにどのレベルのコンパイラ引数が適用されているかを確認するには、Gradle の `DEBUG` レベルの[ロギング](https://docs.gradle.org/current/userguide/logging.html)を使用します。
JVM および JS/WASM タスクの場合は、ログ内で `"Kotlin compiler args:"` という文字列を検索してください。Native タスクの場合は `"Arguments ="` という文字列を検索してください。

> サードパーティ製プラグインの作者である場合、オーバーライドの問題を避けるために、設定はプロジェクトレベルで適用することをお勧めします。これには、新しい [Kotlin プラグイン DSL 拡張タイプ](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)を使用できます。この設定については、プラグイン側で明示的にドキュメント化しておくことが推奨されます。
>
{style="tip"}

### Extension レベル {id="extension-level"}

すべてのターゲットおよび共有ソースセットに対する共通のコンパイラオプションは、トップレベルの `compilerOptions {}` ブロックで設定できます:

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### Target レベル {id="target-level"}

JVM/Android ターゲットのコンパイラオプションは、`target {}` ブロック内の `compilerOptions {}` ブロックで設定できます:

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

Kotlin Multiplatform プロジェクトでは、特定のターゲット内でコンパイラオプションを設定できます。例えば、`jvm { compilerOptions {}}` のように記述します。詳細については、[Multiplatform Gradle DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)を参照してください。

### Compilation unit レベル {id="compilation-unit-level"}

特定のコンパイル単位またはタスクのコンパイラオプションは、タスク設定内の `compilerOptions {}` ブロックで設定できます:

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

また、`KotlinCompilation` 経由でコンパイル単位レベルのコンパイラオプションにアクセスして設定することもできます:

```kotlin
kotlin {
    target {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    optIn.add("kotlin.RequiresOptIn")
                }
            }
        }
    }
}
```

JVM/Android や [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) とは異なるターゲットのプラグインを設定したい場合は、対応する Kotlin コンパイルタスクの `compilerOptions {}` プロパティを使用します。以下の例は、Kotlin DSL と Groovy DSL の両方でこの設定を行う方法を示しています:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named('compileKotlin', org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
</tabs>

### `kotlinOptions {}` から `compilerOptions {}` への移行 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-kotlinoptions-to-compileroptions"}

Kotlin 2.2.0 より前は、`kotlinOptions {}` ブロックを使用してコンパイラオプションを設定できました。`kotlinOptions {}` ブロックは Kotlin 2.0.0 から非推奨（deprecated）となっているため、このセクションではビルドスクリプトを `compilerOptions {}` ブロックに移行するためのガイダンスと推奨事項を提供します:

* [コンパイラオプションの集約と型の使用](#centralize-compiler-options-and-use-types)
* [`android.kotlinOptions` からの移行](#migrate-away-from-android-kotlinoptions)
* [`freeCompilerArgs` の移行](#migrate-freecompilerargs)

#### コンパイラオプションの集約と型の使用 {id="centralize-compiler-options-and-use-types"}

可能な限り、コンパイラオプションは [Extension レベル](#extension-level)で設定し、特定のタスクについては [Compilation unit レベル](#compilation-unit-level)でオーバーライドしてください。

`compilerOptions {}` ブロックでは生の文字列を使用できないため、型付けされた値に変換してください。例えば、以下のような設定がある場合:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        languageVersion = "%languageVersion%"
        apiVersion = "%apiVersion%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

tasks.withType(KotlinCompile).configureEach {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
        languageVersion = '%languageVersion%'
        apiVersion = '%apiVersion%'
    }
}
```

</tab>
</tabs>

移行後は次のようになります:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // Extension レベル
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Compilation unit レベルでのオーバーライドの例
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

kotlin {
  // Extension レベル
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Compilation unit レベルでのオーバーライドの例
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### `android.kotlinOptions` からの移行 {id="migrate-away-from-android-kotlinoptions"}

ビルドスクリプトで以前 `android.kotlinOptions` を使用していた場合は、代わりに Extension レベルまたは Target レベルの `kotlin.compilerOptions` に移行してください。

例えば、以下のような Android プロジェクトの場合:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
    }
}
```
</tab>
</tabs>

次のように更新します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
</tabs>

また、Android ターゲットを持つ Kotlin Multiplatform プロジェクトの場合:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions.jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
            }
        }
    }
}
```

</tab>
</tabs>

次のように更新します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
</tabs>

#### `freeCompilerArgs` の移行 {id="migrate-freecompilerargs"}

* すべての `+=` 操作を `add()` または `addAll()` 関数に置き換えます。
* `-opt-in` コンパイラオプションを使用している場合は、[KGP API リファレンス](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)で専用の DSL が既に利用可能かどうかを確認し、代わりにそれを使用してください。
* `-progressive` コンパイラオプションの使用は、専用の DSL である `progressiveMode.set(true)` を使用するように移行してください。
* `-Xjvm-default` コンパイラオプションの使用は、[専用の DSL](gradle-compiler-options.md#attributes-specific-to-jvm) である `jvmDefault.set()` を使用するように移行してください。オプションには以下のマッピングを使用します:

  | 移行前                            | 移行後                                            |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

例えば、以下のような設定がある場合:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += listOf("-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += ["-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all"]
}
```

</tab>
</tabs>

次のように移行します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(listOf("-Xcontext-receivers", "-Xinline-classes"))
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(["-Xcontext-receivers", "-Xinline-classes"])
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
</tabs>

## JVM をターゲットにする {id="target-the-jvm"}

[前述のとおり](#how-to-define-options)、JVM/Android プロジェクトのコンパイラオプションは、Extension、Target、および Compilation unit レベル（タスク）で定義できます。

デフォルトの JVM コンパイルタスクは、本番コード向けが `compileKotlin`、テストコード向けが `compileTestKotlin` と呼ばれます。カスタムソースセットのタスクには、`compile<Name>Kotlin` パターンに従って名前が付けられます。

Android のコンパイルタスクの一覧を確認するには、ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*Kotlin` タスク名を検索してください。

注意すべき重要な詳細:

* `kotlin.compilerOptions` は、プロジェクト内のすべての Kotlin コンパイルタスクを設定します。
* `kotlin.compilerOptions` DSL によって適用された設定は、`tasks.named<KotlinJvmCompile>("compileKotlin") { }`（または `tasks.withType<KotlinJvmCompile>().configureEach { }`）のアプローチを使用してオーバーライドできます。

## JavaScript をターゲットにする {id="target-javascript"}

JavaScript のコンパイルタスクは、本番コード向けが `compileKotlinJs`、テストコード向けが `compileTestKotlinJs`、カスタムソースセット向けが `compile<Name>KotlinJs` と呼ばれます。

単一のタスクを設定するには、その名前を使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

val compileKotlin: KotlinCompilationTask<*> by tasks

compileKotlin.compilerOptions.suppressWarnings.set(true)
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        suppressWarnings = true
    }
}
```

</tab>
</tabs>

Gradle Kotlin DSL では、最初にプロジェクトの `tasks` からタスクを取得する必要があることに注意してください。

JS および common ターゲットには、それぞれ `Kotlin2JsCompile` および `KotlinCompileCommon` 型を使用します。

JavaScript のコンパイルタスクの一覧を確認するには、ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*KotlinJS` タスク名を検索してください。

## すべての Kotlin コンパイルタスク {id="all-kotlin-compilation-tasks"}

プロジェクト内のすべての Kotlin コンパイルタスクを設定することも可能です:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions { /*...*/ }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions { /*...*/ }
}
```

</tab>
</tabs>

## すべてのコンパイラオプション {id="all-compiler-options"}

Kotlin Gradle プラグインを通じて利用可能な Kotlin コンパイラオプションの完全なリストは以下のとおりです:

### 共通属性 {id="common-attributes"}

| 名前                  | 説明                                                                                                                                                                                 | 取り得る値                                              | デフォルト値  |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|---------------|
| `allWarningsAsErrors` | 警告がある場合にエラーとして報告する                                                                                                                                                 |                                                         | false         |
| `apiVersion`          | コードで使用できる Kotlin API を制御する。詳細については、[`-api-version`](compiler-reference.md#api-version-version) を参照。                                                      | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) |               |
| `extraWarnings`       | 有効な場合、警告を出力する[追加の宣言、式、型のコンパイラチェック](whatsnew21.md#extra-compiler-checks)を有効にする                                                                 | `true`, `false`                                         | `false`       |
| `freeCompilerArgs`    | 追加のコンパイラ引数のリスト。実験的な `-X` 引数もここで使用できます。[例](#example-of-additional-arguments-usage-via-freecompilerargs)を参照                                        |                                                         | []            |
| `languageVersion`     | コンパイル中に利用可能な Kotlin 言語機能および構文を制御する。詳細については、[`-language-version`](compiler-reference.md#language-version-version) を参照。                         | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) |               |
| `optIn`               | [オプトイン（opt-in）コンパイラ引数](opt-in-requirements.md)のリストを設定するためのプロパティ                                                                                     | `listOf( /* opt-ins */ )`                               | `emptyList()` |
| `progressiveMode`     | [プログレッシブコンパイラモード](whatsnew13.md#progressive-mode)を有効にする                                                                                                       | `true`, `false`                                         | `false`       |
| `suppressWarnings`    | 警告を生成しない                                                                                                                                                                     |                                                         | false         |
| `verbose`             | 詳細なログ出力を有効にする。[Gradle のデバッグログレベルが有効](https://docs.gradle.org/current/userguide/logging.html)な場合にのみ機能します                                        |                                                         | false         |

> 今後のリリースで `freeCompilerArgs` 属性を非推奨にする予定です。Kotlin Gradle DSL に不足しているオプションがある場合は、[課題を報告](https://youtrack.jetbrains.com/newissue?project=kt)してください。
>
{style="warning"}

#### freeCompilerArgs による追加引数の使用例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

追加の（実験的なものを含む）コンパイラ引数を指定するには、`freeCompilerArgs` 属性を使用します。
この属性には、単一の引数または引数のリストを追加できます:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // Kotlin API のバージョンと JVM ターゲットを指定
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 単一の実験的引数
        freeCompilerArgs.add("-Xexport-kdoc")

        // 単一の追加引数
        freeCompilerArgs.add("-Xno-param-assertions")

        // モジュールパス上の追加のルートモジュールを解決
        freeCompilerArgs.add("-Xadd-modules=jdk.incubator.vector")

        // 引数のリスト
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-receiver-assertions",
                "-Xno-call-assertions"
            )
        ) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // Kotlin API のバージョンと JVM ターゲットを指定
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 単一の実験的引数
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 単一の追加引数（キー・値ペアも可能）
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // モジュールパス上の追加のルートモジュールを解決
        freeCompilerArgs.add("-Xadd-modules=jdk.incubator.vector")
        
        // 引数のリスト
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 属性は、[Extension](#extension-level)、[Target](#target-level)、および [Compilation unit (タスク)](#compilation-unit-level) レベルで利用可能です。
>
{style="tip"}

#### languageVersion の設定例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

言語バージョンを設定するには、次の構文を使用します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion =
            org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%
    }
```

</tab>
</tabs>

一部の属性ではカスタム型が使用されます。詳細については、[コンパイラオプションの型](#types-for-compiler-options)を参照してください。

### JVM に固有の属性 {id="attributes-specific-to-jvm"}

| 名前                      | 説明                                                                                                                                                                                                                                          | 取り得る値                                                                                                                                         | デフォルト値                |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `javaParameters`          | メソッドパラメータに対する Java 1.8 リフレクション用のメタデータを生成する                                                                                                                                                                    |                                                                                                                                                    | false                       |
| `jvmTarget`               | 生成される JVM バイトコードのターゲットバージョン                                                                                                                                                                                            | "1.8", "9", "10", ..., "25", "26"。また、[コンパイラオプションの型](#types-for-compiler-options)も参照                                              | "%defaultJvmTargetVersion%" |
| `jvmTargetValidationMode` | <list><li>Kotlin と Java 間の [JVM ターゲット互換性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)の検証</li><li>`KotlinCompile` 型のタスク用プロパティ。</li></list>                              | `WARNING`, `ERROR`, `IGNORE`                                                                                                                       | `ERROR`                     |
| `jvmDefault`              | インターフェースで宣言された関数を JVM 上のデフォルトメソッドにコンパイルする方法を制御する                                                                                                                                                   | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE`                                                                                                            | `ENABLE`                    |
| `noJdk`                   | クラスパスに Java ランタイムを自動的に含めない                                                                                                                                                                                                |                                                                                                                                                    | false                       |
| `-Xadd-modules`           | (実験的) 初期モジュールに加えて、指定されたルートモジュールを解決する。モジュールパス上のすべてのモジュールを解決するには、`ALL-MODULE-PATH` の値を設定します。                                                                               | カンマ区切りのモジュール名、または [`freeCompilerArgs`](#example-of-additional-arguments-usage-via-freecompilerargs) 経由で渡される `ALL-MODULE-PATH` |                             |

### JavaScript に固有の属性 {id="attributes-specific-to-javascript"}

| 名前                    | 説明                                                                                                                                                                                                                                          | 取り得る値                                                                                                                                                                    | デフォルト値                       |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| `friendModulesDisabled` | internal 宣言のエクスポートを無効にする                                                                                                                                                                                                       |                                                                                                                                                                               | `false`                            |
| `main`                  | 実行時に `main` 関数を呼び出すかどうかを指定する                                                                                                                                                                                              | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL`                                                                                                     | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind`            | コンパイラによって生成される JS モジュールの種類                                                                                                                                                                                              | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD`                                   | `null`                             |
| `sourceMap`             | ソースマップを生成する                                                                                                                                                                                                                        |                                                                                                                                                                               | `false`                            |
| `sourceMapEmbedSources` | ソースファイルをソースマップ内に埋め込む                                                                                                                                                                                                      | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS`    | `null`                             |
| `sourceMapNamesPolicy`  | Kotlin コードで宣言した変数名と関数名をソースマップに追加する。動作の詳細については、[コンパイラリファレンス](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no)を参照                                 | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null`                             |
| `sourceMapPrefix`       | ソースマップ内のパスに指定されたプレフィックスを追加する                                                                                                                                                                                      |                                                                                                                                                                               | `null`                             |
| `target`                | 特定の ECMA バージョン向けの JS ファイルを生成する                                                                                                                                                                                            | `"es5"`, `"es2015"`, `"es2020"`                                                                                                                                               | `"es5"`                            |
| `useEsClasses`          | 生成された JavaScript コードに ES2015 クラスを使用させる。ES2015 および ES2020 ターゲットを使用する場合はデフォルトで有効                                                                                                                   |                                                                                                                                                                               | `null`                             |

### コンパイラオプションの型 {id="types-for-compiler-options"}

一部の `compilerOptions` では、`String` 型の代わりにカスタム型が使用されます:

| オプション                         | 型                                                                                                                                                                                                                | 例                                                                                                   |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `apiVersion` および `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt)                             | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)`                         |
| `jvmTarget`                        | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt)                                     | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)`                                                    |
| `main`                             | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)`                                      |
| `moduleKind`                       | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt)                               | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)`                                             |
| `sourceMapEmbedSources`            | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt)               | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy`             | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt)           | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)`  |

## 次のステップ {id="what-s-next"}

以下の詳細についてもご確認ください:
* [Kotlin Multiplatform DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)
* [インクリメンタルコンパイル、キャッシュサポート、ビルドレポート、および Kotlin デーモン](gradle-compilation-and-caches.md)
* [Gradle の基本と詳細](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle プラグインバリアントのサポート](gradle-plugin-variants.md)