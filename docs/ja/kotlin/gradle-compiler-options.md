[//]: # (title: Kotlin Gradle プラグインにおけるコンパイラオプション)

Kotlin の各リリースには、サポートされているターゲット（JVM、JavaScript、および[サポートされているプラットフォーム](native-overview.md#target-platforms)向けのネイティブバイナリ）用のコンパイラが含まれています。

これらのコンパイラは以下によって使用されます：
* IDE：Kotlin プロジェクトで __Compile__ または __Run__ ボタンをクリックしたとき。
* Gradle：コンソールまたは IDE で `gradle build` を実行したとき。
* Maven：コンソールまたは IDE で `mvn compile` または `mvn test-compile` を実行したとき。

また、[コマンドラインコンパイラの使用](command-line.md)チュートリアルで説明されているように、コマンドラインから手動で Kotlin コンパイラを実行することもできます。

## オプションの定義方法 {id="how-to-define-options"}

Kotlin コンパイラには、コンパイルプロセスをカスタマイズするための多数のオプションがあります。

Gradle DSL を使用すると、コンパイラオプションの包括的な設定が可能です。これは [Kotlin マルチプラットフォーム](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)および [JVM/Android](#target-the-jvm) プロジェクトで利用できます。

Gradle DSL を使用すると、ビルドスクリプト内の 3 つのレベルでコンパイラオプションを設定できます：
* **[拡張レベル (Extension level)](#extension-level)**：`kotlin {}` ブロック内。すべてのターゲットと共有ソースセットに適用されます。
* **[ターゲットレベル (Target level)](#target-level)**：特定のターゲットのブロック内。
* **[コンパイル単位レベル (Compilation unit level)](#compilation-unit-level)**：通常は特定のコンパイルタスク内。

![Kotlin コンパイラオプションのレベル](compiler-options-levels.svg){width=700}

上位レベルの設定は、下位レベルの慣習（デフォルト）として使用されます：

* 拡張レベルで設定されたコンパイラオプションは、ターゲットレベルのオプション（`commonMain`、`nativeMain`、`commonTest` などの共有ソースセットを含む）のデフォルトになります。
* ターゲットレベルで設定されたコンパイラオプションは、コンパイル単位（タスク）レベル（`compileKotlinJvm` や `compileTestKotlinJvm` タスクなど）のオプションのデフォルトになります。

逆に、下位レベルで行われた設定は、関連する上位レベルの設定を上書き（override）します：

* タスクレベルのコンパイラオプションは、ターゲットレベルまたは拡張レベルの関連する設定を上書きします。
* ターゲットレベルのコンパイラオプションは、拡張レベルの関連する設定を上書きします。

コンパイルにどのレベルのコンパイラ引数が適用されているかを確認するには、Gradle [ロギング](https://docs.gradle.org/current/userguide/logging.html)の `DEBUG` レベルを使用してください。
JVM および JS/WASM タスクの場合はログ内で `"Kotlin compiler args:"` という文字列を、Native タスクの場合は `"Arguments ="` という文字列を検索してください。

> サードパーティ製プラグインの作者である場合は、上書きの問題を避けるために、プロジェクトレベルで設定を適用するのが最善です。これには、新しい [Kotlin プラグイン DSL 拡張型](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)を使用できます。この設定については、プラグイン側で明示的にドキュメント化することをお勧めします。
>
{style="tip"}

### 拡張レベル {id="extension-level"}

トップレベルの `compilerOptions {}` ブロックで、すべてのターゲットと共有ソースセットに共通のコンパイラオプションを設定できます：

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### ターゲットレベル {id="target-level"}

`target {}` ブロック内の `compilerOptions {}` ブロックで、JVM/Android ターゲットのコンパイラオプションを設定できます：

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

Kotlin マルチプラットフォームプロジェクトでは、特定のターゲット内でコンパイラオプションを設定できます。例えば、`jvm { compilerOptions {}}` です。詳細については、[マルチプラットフォーム Gradle DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)を参照してください。

### コンパイル単位レベル {id="compilation-unit-level"}

タスク設定内の `compilerOptions {}` ブロックで、特定のコンパイル単位またはタスクのコンパイラオプションを設定できます：

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

また、`KotlinCompilation` を介してコンパイル単位レベルでコンパイラオプションにアクセスし、設定することもできます：

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

JVM/Android および [Kotlin マルチプラットフォーム](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)以外のターゲットのプラグインを設定したい場合は、対応する Kotlin コンパイルタスクの `compilerOptions {}` プロパティを使用してください。以下の例は、Kotlin および Groovy DSL の両方でこの設定を行う方法を示しています：

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

Kotlin 2.2.0 より前は、`kotlinOptions {}` ブロックを使用してコンパイラオプションを設定できました。`kotlinOptions {}` ブロックは Kotlin 2.0.0 から非推奨（deprecated）となっているため、このセクションではビルドスクリプトを `compilerOptions {}` ブロックを使用するように移行するためのガイドと推奨事項を提供します：

* [コンパイラオプションの中央集約と型の使用](#centralize-compiler-options-and-use-types)
* [`android.kotlinOptions` からの移行](#migrate-away-from-android-kotlinoptions)
* [`freeCompilerArgs` の移行](#migrate-freecompilerargs)

#### コンパイラオプションの中央集約と型の使用 {id="centralize-compiler-options-and-use-types"}

可能な限り、[拡張レベル](#extension-level)でコンパイラオプションを設定し、[コンパイル単位レベル](#compilation-unit-level)で特定のタスクに対してそれらを上書きしてください。

`compilerOptions {}` ブロックでは生の文字列を使用できないため、型指定された値に変換してください。例えば、以下のような設定がある場合：

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

移行後は以下のようになります：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // Extension level
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Example of overriding at compilation unit level
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
  // Extension level
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Example of overriding at compilation unit level
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### `android.kotlinOptions` からの移行 {id="migrate-away-from-android-kotlinoptions"}

ビルドスクリプトで以前に `android.kotlinOptions` を使用していた場合は、代わりに `kotlin.compilerOptions` に移行してください。これは拡張レベルまたはターゲットレベルのいずれかで行います。

例えば、Android プロジェクトの場合：

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

これを次のように更新します：

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

また、例えば Android ターゲットを持つ Kotlin マルチプラットフォームプロジェクトの場合：

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

これを次のように更新します：

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

* すべての `+=` 操作を `add()` または `addAll()` 関数に置き換えてください。
* `-opt-in` コンパイラオプションを使用している場合は、[KGP API リファレンス](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)に専用の DSL が既に用意されていないか確認し、あればそれを使用してください。
* `-progressive` コンパイラオプションの使用を、専用の DSL である `progressiveMode.set(true)` に移行してください。
* `-Xjvm-default` コンパイラオプションの使用を、[専用の DSL を使用](gradle-compiler-options.md#attributes-specific-to-jvm)するように移行してください（`jvmDefault.set()`）。オプションには以下のマッピングを使用してください：

  | 以前 (Before) | 以降 (After) |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

例えば、以下のような設定がある場合：

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

次のように移行します：

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

[前述のとおり](#how-to-define-options)、JVM/Android プロジェクトのコンパイラオプションは、拡張、ターゲット、およびコンパイル単位レベル（タスク）で定義できます。

デフォルトの JVM コンパイルタスクは、プロダクションコード用が `compileKotlin`、テストコード用が `compileTestKotlin` と呼ばれます。カスタムソースセットのタスクは、`compile<Name>Kotlin` のパターンに従って命名されます。

ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*Kotlin` タスク名を検索することで、Android のコンパイルタスクの一覧を確認できます。

注意すべき重要な詳細事項：

* `kotlin.compilerOptions` は、プロジェクト内のすべての Kotlin コンパイルタスクを設定します。
* `tasks.named<KotlinJvmCompile>("compileKotlin") { }`（または `tasks.withType<KotlinJvmCompile>().configureEach { }`）のアプローチを使用して、`kotlin.compilerOptions` DSL によって適用された設定を上書きできます。

## JavaScript をターゲットにする {id="target-javascript"}

JavaScript のコンパイルタスクは、プロダクションコード用が `compileKotlinJs`、テストコード用が `compileTestKotlinJs`、カスタムソースセット用が `compile<Name>KotlinJs` と呼ばれます。

単一のタスクを設定するには、その名前を使用します：

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

JS ターゲットには `Kotlin2JsCompile` を、共通（common）ターゲットには `KotlinCompileCommon` 型を使用してください。

ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*KotlinJS` タスク名を検索することで、JavaScript のコンパイルタスクの一覧を確認できます。

## すべての Kotlin コンパイルタスク {id="all-kotlin-compilation-tasks"}

プロジェクト内のすべての Kotlin コンパイルタスクを設定することも可能です：

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

Gradle コンパイラのオプションの完全なリストは以下のとおりです：

### 共通属性 {id="common-attributes"}

| 名前 | 説明 | 設定可能な値 | デフォルト値 |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|
| `optIn`           | [オプトインが必要なコンパイラ引数](opt-in-requirements.md)のリストを設定するためのプロパティ | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | [プログレッシブコンパイラモード](whatsnew13.md#progressive-mode)を有効にします | `true`, `false`           | `false`       |
| `extraWarnings`   | 有効な場合、警告を出力する[追加の宣言、式、および型のコンパイラチェック](whatsnew21.md#extra-compiler-checks)を有効にします | `true`, `false`           | `false`       |

### JVM 固有の属性 {id="attributes-specific-to-jvm"}

| 名前 | 説明 | 設定可能な値 | デフォルト値 |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-----------------------------|
| `javaParameters`          | メソッドパラメータに対して Java 1.8 のリフレクション用メタデータを生成します | | false |
| `jvmTarget`               | 生成される JVM バイトコードのターゲットバージョン | "1.8", "9", "10", ..., "25", "26"。 [コンパイラオプションの型](#types-for-compiler-options)も参照してください | "%defaultJvmTargetVersion%" |
| `noJdk`                   | Java ランタイムをクラスパスに自動的に含めません | | false |
| `jvmTargetValidationMode` | <list><li>Kotlin と Java 間の [JVM ターゲットの互換性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)の検証</li><li>`KotlinCompile` 型のタスク用のプロパティ。</li></list> | `WARNING`, `ERROR`, `IGNORE` | `ERROR` |
| `jvmDefault`              | インターフェースで宣言された関数を JVM 上のデフォルトメソッドにコンパイルする方法を制御します | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE` | `ENABLE` |

### JVM と JavaScript に共通の属性 {id="attributes-common-to-jvm-and-javascript"}

| 名前 | 説明 | 設定可能な値 | デフォルト値 |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|---------------|
| `allWarningsAsErrors` | 警告がある場合にエラーとして報告します | | false |
| `suppressWarnings`    | 警告を生成しません | | false |
| `verbose`             | 詳細なロギング出力を有効にします。[Gradle のデバッグログレベルが有効](https://docs.gradle.org/current/userguide/logging.html)な場合にのみ機能します | | false |
| `freeCompilerArgs`    | 追加のコンパイラ引数のリスト。ここでは実験的な `-X` 引数も使用できます。[freeCompilerArgs を介した追加引数の使用例](#example-of-additional-arguments-usage-via-freecompilerargs)を参照してください | | [] |
| `apiVersion`          | コードで使用できる Kotlin API を制御します。詳細については、[`-api-version`](compiler-reference.md#api-version-version) を参照してください。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (実験的) | |
| `languageVersion`     | コンパイル中に使用可能な Kotlin 言語機能と構文を制御します。詳細については、[`-language-version`](compiler-reference.md#language-version-version) を参照してください。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (実験的) | |

> 将来のリリースで `freeCompilerArgs` 属性を非推奨にする予定です。Kotlin Gradle DSL に不足しているオプションがある場合は、[問題を報告](https://youtrack.jetbrains.com/newissue?project=kt)してください。
>
{style="warning"}

#### freeCompilerArgs を介した追加引数の使用例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

追加の（実験的なものを含む）コンパイラ引数を提供するには、`freeCompilerArgs` 属性を使用します。
この属性に単一の引数または引数のリストを追加できます：

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
        
        // 単一の追加引数、キーと値のペアも可能
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // 引数のリスト
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 属性は、[拡張](#extension-level)、[ターゲット](#target-level)、および[コンパイル単位（タスク）](#compilation-unit-level)レベルで使用可能です。
>
{style="tip"} 

#### languageVersion の設定例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

言語バージョンを設定するには、次の構文を使用します：

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

また、[コンパイラオプションの型](#types-for-compiler-options)も参照してください。

### JavaScript 固有の属性 {id="attributes-specific-to-javascript"}

| 名前 | 説明 | 設定可能な値 | デフォルト値 |
|---|---|---|---|
| `friendModulesDisabled` | 内部（internal）宣言のエクスポートを無効にします | | `false` |
| `main` | 実行時に `main` 関数を呼び出すかどうかを指定します | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | コンパイラによって生成される JS モジュールの種類 | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | ソースマップを生成します | | `false` |
| `sourceMapEmbedSources` | ソースファイルをソースマップに埋め込みます | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | Kotlin コードで宣言した変数名と関数名をソースマップに追加します。動作の詳細については、[コンパイラリファレンス](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no)を参照してください | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | ソースマップ内のパスに指定されたプレフィックスを追加します | | `null` |
| `target` | 特定の ECMA バージョン用の JS ファイルを生成します | `"es5"`, `"es2015"`, `"es2020"` | `"es5"` |
| `useEsClasses` | 生成された JavaScript コードで ES2015 クラスを使用できるようにします。ES2015 および ES2020 ターゲットを使用する場合はデフォルトで有効になります | | `null` |

### コンパイラオプションの型 {id="types-for-compiler-options"}

一部の `compilerOptions` では、`String` 型の代わりに新しい型が使用されます：

| オプション | 型 | 例 |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` および `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 次のステップ {id="what-s-next"}

以下についてさらに詳しく学習してください：
* [Kotlin マルチプラットフォーム DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)
* [増分コンパイル、キャッシュのサポート、ビルドレポート、および Kotlin デーモン](gradle-compilation-and-caches.md)
* [Gradle の基本と詳細事項](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle プラグインバリアントのサポート](gradle-plugin-variants.md)