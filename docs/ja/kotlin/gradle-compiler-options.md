[//]: # (title: Kotlin Gradleプラグインのコンパイラオプション)

Kotlinの各リリースには、サポートされているターゲット用のコンパイラが含まれています：
JVM、JavaScript、そして[サポートされているプラットフォーム](native-overview.md#target-platforms)向けのネイティブバイナリです。

これらのコンパイラは以下によって使用されます：
* Kotlinプロジェクトで __Compile__ または __Run__ ボタンをクリックしたときのIDE。
* コンソールまたはIDEで `gradle build` を呼び出したときのGradle。
* コンソールまたはIDEで `mvn compile` や `mvn test-compile` を呼び出したときのMaven。

また、[コマンドラインコンパイラでの作業](command-line.md)のチュートリアルで説明されているように、コマンドラインから手動でKotlinコンパイラを実行することもできます。

## オプションの定義方法 {id="how-to-define-options"}

Kotlinコンパイラには、コンパイルプロセスをカスタマイズするための多数のオプションが用意されています。

Gradle DSLを使用すると、コンパイラオプションの包括的な設定が可能です。これは[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)および[JVM/Android](#target-the-jvm)プロジェクトで利用できます。

Gradle DSLを使用すると、ビルドスクリプト内で3つのレベルでコンパイラオプションを設定できます：
* **[拡張レベル（Extension level）](#extension-level)**：すべてのターゲットと共有ソースセットを対象とする `kotlin {}` ブロック内。
* **[ターゲットレベル（Target level）](#target-level)**：特定のターゲット用のブロック内。
* **[コンパイル単位レベル（Compilation unit level）](#compilation-unit-level)**：通常は特定のコンパイルタスク内。

![Kotlin compiler options levels](compiler-options-levels.svg){width=700}

上位レベルの設定は、下位レベルの規約（デフォルト）として使用されます：

* 拡張レベルで設定されたコンパイラオプションは、`commonMain`、`nativeMain`、`commonTest` などの共有ソースセットを含むターゲットレベルのオプションのデフォルトになります。
* ターゲットレベルで設定されたコンパイラオプションは、`compileKotlinJvm` や `compileTestKotlinJvm` タスクなどのコンパイル単位（タスク）レベルのオプションのデフォルトになります。

逆に、下位レベルで行われた設定は、上位レベルの関連する設定をオーバーライドします：

* タスクレベルのコンパイラオプションは、ターゲットレベルまたは拡張レベルの関連する設定をオーバーライドします。
* ターゲットレベルのコンパイラオプションは、拡張レベルの関連する設定をオーバーライドします。

コンパイルにどのレベルのコンパイラ引数が適用されているかを確認するには、Gradleの[ロギング](https://docs.gradle.org/current/userguide/logging.html)の `DEBUG` レベルを使用してください。
JVMおよびJS/WASMタスクの場合は、ログ内で `"Kotlin compiler args:"` という文字列を検索します。Nativeタスクの場合は、`"Arguments ="` という文字列を検索してください。

> サードパーティ製プラグインの作成者の場合は、オーバーライドの問題を避けるためにプロジェクトレベルで設定を適用することをお勧めします。これには、新しい[KotlinプラグインDSL拡張タイプ](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)を使用できます。この設定については、プラグイン側で明示的にドキュメント化することを推奨します。
>
{style="tip"}

### 拡張レベル {id="extension-level"}

トップレベルの `compilerOptions {}` ブロックで、すべてのターゲットと共有ソースセットに対する共通のコンパイラオプションを設定できます：

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### ターゲットレベル {id="target-level"}

`target {}` ブロック内の `compilerOptions {}` ブロックで、JVM/Androidターゲットのコンパイラオプションを設定できます：

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

Kotlin Multiplatformプロジェクトでは、特定のターゲット内でコンパイラオプションを設定できます。例えば、`jvm { compilerOptions {}}` のようになります。詳細については、[Multiplatform Gradle DSLリファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)を参照してください。

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

JVM/Androidや[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)とは異なるターゲットのプラグインを設定したい場合は、対応するKotlinコンパイルタスクの `compilerOptions {}` プロパティを使用します。以下の例は、Kotlin DSLとGroovy DSLの両方でこの設定を行う方法を示しています：

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

Kotlin 2.2.0より前は、`kotlinOptions {}` ブロックを使用してコンパイラオプションを設定できました。`kotlinOptions {}` ブロックはKotlin 2.0.0から非推奨となっているため、このセクションではビルドスクリプトを移行して代わりに `compilerOptions {}` ブロックを使用するためのガイダンスと推奨事項を提供します：

* [コンパイラオプションの集約と型の使用](#centralize-compiler-options-and-use-types)
* [`android.kotlinOptions` からの移行](#migrate-away-from-android-kotlinoptions)
* [`freeCompilerArgs` の移行](#migrate-freecompilerargs)

#### コンパイラオプションの集約と型の使用 {id="centralize-compiler-options-and-use-types"}

可能な限り、コンパイラオプションは[拡張レベル](#extension-level)で設定し、特定のタスクに対しては[コンパイル単位レベル](#compilation-unit-level)でオーバーライドしてください。

`compilerOptions {}` ブロック内では生の文字列を使用できないため、型指定された値に変換します。例えば、次のような設定がある場合：

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

移行後は次のようになります：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // 拡張レベル
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// コンパイル単位レベルでのオーバーライド例
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
  // 拡張レベル
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// コンパイル単位レベルでのオーバーライド例
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### `android.kotlinOptions` からの移行 {id="migrate-away-from-android-kotlinoptions"}

ビルドスクリプトで以前 `android.kotlinOptions` を使用していた場合は、拡張レベルまたはターゲットレベルのいずれかで、代わりに `kotlin.compilerOptions` へ移行してください。

例えば、Androidプロジェクトで次のように記述している場合：

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

また、Androidターゲットを持つKotlin Multiplatformプロジェクトの例として、次のような設定がある場合：

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

* すべての `+=` 操作を `add()` または `addAll()` 関数に置き換えます。
* `-opt-in` コンパイラオプションを使用している場合は、[KGP APIリファレンス](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)で専用のDSLが既に利用可能かどうかを確認し、代わりにそれを使用してください。
* `-progressive` コンパイラオプションの使用は、すべて専用のDSLである `progressiveMode.set(true)` を使用するように移行してください。
* `-Xjvm-default` コンパイラオプションの使用は、すべて[専用のDSLを使用する](gradle-compiler-options.md#attributes-specific-to-jvm)ように移行してください（`jvmDefault.set()`）。オプションには次のマッピングを使用します：

  | 以前                              | 以後                                              |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

例えば、次のような設定がある場合：

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

## JVMをターゲットにする {id="target-the-jvm"}

[前述のとおり](#how-to-define-options)、JVM/Androidプロジェクトのコンパイラオプションは、拡張、ターゲット、およびコンパイル単位レベル（タスク）で定義できます。

デフォルトのJVMコンパイルタスクは、本番コード用が `compileKotlin`、テストコード用が `compileTestKotlin` と呼ばれます。カスタムソースセット用のタスクは、`compile<Name>Kotlin` パターンに従って命名されます。

ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*Kotlin` タスク名を検索することで、Androidコンパイルタスクの一覧を確認できます。

注意すべき重要な詳細事項：

* `kotlin.compilerOptions` は、プロジェクト内のすべてのKotlinコンパイルタスクを設定します。
* `kotlin.compilerOptions` DSLによって適用された設定は、`tasks.named<KotlinJvmCompile>("compileKotlin") { }`（または `tasks.withType<KotlinJvmCompile>().configureEach { }`）のアプローチを使用してオーバーライドできます。

## JavaScriptをターゲットにする {id="target-javascript"}

JavaScriptのコンパイルタスクは、本番コード用が `compileKotlinJs`、テストコード用が `compileTestKotlinJs`、カスタムソースセット用が `compile<Name>KotlinJs` と呼ばれます。

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

Gradle Kotlin DSLでは、最初にプロジェクトの `tasks` からタスクを取得する必要があることに注意してください。

JSおよび共通（common）ターゲットには、それぞれ `Kotlin2JsCompile` および `KotlinCompileCommon` 型を使用します。

ターミナルで `gradlew tasks --all` コマンドを実行し、`Other tasks` グループ内の `compile*KotlinJS` タスク名を検索することで、JavaScriptコンパイルタスクの一覧を確認できます。

## すべてのKotlinコンパイルタスク {id="all-kotlin-compilation-tasks"}

プロジェクト内のすべてのKotlinコンパイルタスクを設定することも可能です：

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

以下は、Gradleコンパイラ用オプションの完全なリストです：

### 共通属性 {id="common-attributes"}

| 名前 | 説明 | 指定可能な値 | デフォルト値 |
|---|---|---|---|
| `optIn` | [オプトインコンパイラ引数](opt-in-requirements.md)のリストを設定するためのプロパティ | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | [プログレッシブコンパイラモード](whatsnew13.md#progressive-mode)を有効化 | `true`, `false` | `false` |
| `extraWarnings` | trueの場合に警告を出力する、[追加の宣言、式、型のコンパイラチェック](whatsnew21.md#extra-compiler-checks)を有効化 | `true`, `false` | `false` |

### JVM固有の属性 {id="attributes-specific-to-jvm"}

| 名前 | 説明 | 指定可能な値 | デフォルト値 |
|---|---|---|---|
| `javaParameters` | メソッドパラメータに対するJava 1.8リフレクション用のメタデータを生成 | | false |
| `jvmTarget` | 生成されるJVMバイトコードのターゲットバージョン | "1.8", "9", "10", ..., "25", "26"。また、[コンパイラオプションの型](#types-for-compiler-options)も参照 | "%defaultJvmTargetVersion%" |
| `noJdk` | Javaランタイムをクラスパスに自動的に含めない | | false |
| `jvmTargetValidationMode` | <list><li>KotlinとJavaの間の[JVMターゲット互換性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)の検証</li><li>`KotlinCompile` 型のタスク用プロパティ。</li></list> | `WARNING`, `ERROR`, `IGNORE` | `ERROR` |
| `jvmDefault` | インターフェースで宣言された関数をJVM上のデフォルトメソッドにコンパイルする方法を制御 | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE` | `ENABLE` |
| `-Xadd-modules` | （実験的）初期モジュールに加えて、指定されたルートモジュールを解決。モジュールパス上のすべてのモジュールを解決するには `ALL-MODULE-PATH` の値を設定。 | カンマ区切りのモジュール名、または[`freeCompilerArgs`](#example-of-additional-arguments-usage-via-freecompilerargs)経由で渡される `ALL-MODULE-PATH` | |

### JVMとJavaScriptの共通属性 {id="attributes-common-to-jvm-and-javascript"}

| 名前 | 説明 | 指定可能な値 | デフォルト値 |
|---|---|---|---|
| `allWarningsAsErrors` | 警告がある場合にエラーとして報告 | | false |
| `suppressWarnings` | 警告を生成しない | | false |
| `verbose` | 詳細なログ出力を有効化。[Gradleのデバッグログレベルが有効](https://docs.gradle.org/current/userguide/logging.html)な場合のみ動作 | | false |
| `freeCompilerArgs` | 追加のコンパイラ引数のリスト。実験的な `-X` 引数もここで使用可能。[例](#example-of-additional-arguments-usage-via-freecompilerargs)を参照 | | [] |
| `apiVersion` | コードが使用できるKotlin APIを制御。詳細については、[`-api-version`](compiler-reference.md#api-version-version)を参照。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `languageVersion` | コンパイル中に利用可能なKotlin言語機能と構文を制御。詳細については、[`-language-version`](compiler-reference.md#language-version-version)を参照。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |

> 今後のリリースで属性 `freeCompilerArgs` は非推奨（deprecated）となる予定です。Kotlin Gradle DSLに不足しているオプションがある場合は、[課題（issue）を報告](https://youtrack.jetbrains.com/newissue?project=kt)してください。
>
{style="warning"}

#### freeCompilerArgsを使用した追加引数の使用例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

追加の（実験的なものを含む）コンパイラ引数を渡すには、`freeCompilerArgs` 属性を使用します。
この属性には単一の引数または引数のリストを追加できます：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // Kotlin APIのバージョンとJVMターゲットを指定
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 単一の実験的引数
        freeCompilerArgs.add("-Xexport-kdoc")

        // 単一の追加引数
        freeCompilerArgs.add("-Xno-param-assertions")

        // モジュールパス上の追加ルートモジュールを解決
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
        // Kotlin APIのバージョンとJVMターゲットを指定
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 単一の実験的引数
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 単一の追加引数（キー・バリューのペアも可能）
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // モジュールパス上の追加ルートモジュールを解決
        freeCompilerArgs.add("-Xadd-modules=jdk.incubator.vector")
        
        // 引数のリスト
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 属性は、[拡張](#extension-level)、[ターゲット](#target-level)、および[コンパイル単位（タスク）](#compilation-unit-level)レベルで利用可能です。
>
{style="tip"} 

#### languageVersionの設定例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

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

### JavaScript固有の属性 {id="attributes-specific-to-javascript"}

| 名前 | 説明 | 指定可能な値 | デフォルト値 |
|---|---|---|---|
| `friendModulesDisabled` | internal宣言のエクスポートを無効化 | | `false` |
| `main` | 実行時に `main` 関数を呼び出すかどうかを指定 | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | コンパイラによって生成されるJSモジュールの種類 | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | ソースマップを生成 | | `false` |
| `sourceMapEmbedSources` | ソースファイルをソースマップ内に埋め込む | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | Kotlinコードで宣言した変数名や関数名をソースマップに追加する。動作の詳細については、[コンパイラリファレンス](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no)を参照 | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | ソースマップ内のパスに指定されたプレフィックスを追加 | | `null` |
| `target` | 特定のECMAバージョン向けのJSファイルを生成 | `"es5"`, `"es2015"`, `"es2020"` | `"es5"` |
| `useEsClasses` | 生成されるJavaScriptコードでES2015クラスの使用を許可。ES2015およびES2020ターゲットの使用時はデフォルトで有効 | | `null` |

### コンパイラオプションの型 {id="types-for-compiler-options"}

一部の `compilerOptions` では、`String` 型の代わりに新しい型が使用されます：

| オプション | 型 | 例 |
|---|---|---|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` および `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 次のステップ {id="what-s-next"}

以下について詳しく学ぶ：
* [Kotlin Multiplatform DSLリファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)
* [インクリメンタルコンパイル、キャッシュのサポート、ビルドレポート、およびKotlinデーモン](gradle-compilation-and-caches.md)
* [Gradleの基本と詳細事項](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradleプラグインバリアントのサポート](gradle-plugin-variants.md)