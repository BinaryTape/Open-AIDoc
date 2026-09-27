[//]: # (title: Kotlin %kotlinEapVersion% 的新功能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 早期體驗預覽 (EAP) 版本說明，並在正式發佈前試用最新的實驗性 Kotlin 功能。</web-summary>

_[發佈日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文件並未涵蓋早期體驗預覽 (EAP) 發佈版的所有功能，但重點介紹了一些重大改進。
>
> 請參閱 [GitHub 變更記錄](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%) 中的完整變更清單。
>
{style="note"}

Kotlin %kotlinEapVersion% 版本已發佈！以下是此 EAP 版本的一些詳細資訊：

* **語言**：[`only-syntax` 模式下穩定的基於名稱的解構](#stable-language-features)以及[新的實驗性伴隨擴充與伴隨區塊](#companion-extensions-and-blocks)
* **標準函式庫**：[用於簡化 `if` 運算式常見模式的新實驗性函式](#standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions)
* **Kotlin/JS**：[支援 `es2020` 目標](#kotlin-js-support-for-the-es2020-target)
* **Kotlin 編譯器**：[在 `.klib` 編譯期間更一致的 inline 函式行為](#consistent-cross-module-function-inlining-during-klib-compilation)<!--and a [new experimental compilation scheme for Kotlin Multiplatform]().-->

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## 更新到 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

若要更新到新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在建置指令碼中[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 %kotlinEapVersion%。

## 語言 {id="language"}

Kotlin %kotlinEapVersion% 穩定了在先前版本中引入的兩個語言特性。它還引入了實驗性的伴隨擴充（companion extensions）和伴隨區塊（companion blocks）。

### 穩定的語言特性 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.20 和 2.4.0 引入了一些處於[實驗性](components-stability.md#stability-levels-explained)階段的語言特性。我們很高興地宣布，以下語言特性在此版本中已達到[穩定](components-stability.md#stability-levels-explained)狀態：

* `only-syntax` 模式下的[基於名稱的解構](destructuring-declarations.md#name-based-destructuring)。

  在此模式下，「舊的」解構語法 `val (x, y)` 保持其基於位置的行為，而「新的」語法 `(val x, val y)` 則執行基於名稱的解構。

* [改進的編譯期常數](whatsnew24.md#improved-compile-time-constants)。

### 伴隨擴充與伴隨區塊 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了伴隨擴充與伴隨區塊。

先前，若要宣告可透過型別名稱存取的擴充、函式和屬性，該型別必須具有伴隨物件（companion object）。伴隨擴充與伴隨區塊移除了這項要求，並讓您可以：

* 透過將 `companion` 修飾詞新增到頂層擴充中來宣告伴隨擴充，即使它所擴充的型別沒有伴隨物件也是如此。
* 在類別或介面內的 `companion {}` 區塊中宣告函式和屬性，而無需建立物件執行個體。在支援 static 成員的平台上，編譯器會將這些宣告產生為 static 成員。因此，在 JVM 上您不需要為它們加上 `@JvmStatic` 註解。

以下是將 `UnitX` 宣告為伴隨擴充，並在伴隨區塊中宣告 `Zero` 的範例：

```kotlin
// 將 UnitX 宣告為伴隨擴充
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // 在伴隨區塊中宣告 Zero
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)
    
    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

如需有關此設計的更多資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。

伴隨擴充與伴隨區塊處於[實驗性](components-stability.md#stability-levels-explained)階段。若要選擇加入，請將以下編譯器選項新增至您的建置檔案中：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中向我們提供回饋。

## 標準函式庫：用於簡化 `if` 運算式常見模式的新函式 {id="standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的標準函式庫函式，讓您可以在回傳 `Boolean` 值之前先檢查該值，或根據該值回傳可為 null 的結果。

先前，這些模式需要使用帶有 `else` 分支的明確 `if` 運算式。現在您可以使用以下函式來簡化它們：

* `onTrue()`：當 `Boolean` 值為 `true` 時執行指定的程式碼區塊，並回傳原始的 Boolean 值。
* `onFalse()`：當 `Boolean` 值為 `false` 時執行指定的程式碼區塊，並回傳原始的 Boolean 值。
* `ifOrNull()`：當 `Boolean` 值為 `true` 時執行指定的程式碼區塊並回傳其結果。如果值為 `false`，該函式會回傳 `null` 且不執行該區塊。

這些函式處於[實驗性](components-stability.md#stability-levels-explained)階段，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項進行選擇加入。

以下為範例：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // 使用 onTrue() 函式在 add() 回傳 true 時輸出訊息
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // 使用 onFalse() 函式在 remove() 回傳 false 時輸出訊息
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // 使用 ifOrNull() 函式在 tags 中包含 "wasm" 時回傳訊息
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中向我們提供回饋。

## Kotlin/JS：支援 `es2020` 目標 {id="kotlin-js-support-for-the-es2020-target"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 在 Kotlin/JS 編譯器與 Gradle 外掛程式中新增了 `es2020` 目標。先前僅提供 `es5` 和 `es2015` 目標，且對較新 JavaScript 功能（例如 `BigInt`）的支援必須在以 ES2015 為目標時單獨啟用。透過以 ES2020 為目標，您可以在無需額外設定的情況下，使用最高至 ECMAScript 2020 的所有受支援 JavaScript 功能（包括 `BigInt`）。

若要啟用新目標，請在 `compilerOptions` 區塊中將 `target` 設定為 `es2020`：

```kotlin
kotlin { 
    js { 
        compilerOptions { 
            target.set("es2020") 
        }
    }
}
```

## Kotlin 編譯器 {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% 為 `.klib` 編譯期間的函式 inlining 帶來了更多改進，並帶來了諸如改進型別推論效能等實驗性功能<!-- and a new compilation scheme for Kotlin Multiplatform -->。

### klib 編譯期間一致的跨模組函式 inlining {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `.klib` 編譯期間啟用了 [Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上一致的模組內函式 inlining](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。跨不同 Kotlin 平台之函式 inlining 的一致性使得提供相容性保證變得更容易。

Kotlin 2.4.0 還引入了在 `.klib` 編譯期間啟用**跨模組** inlining 的可能性，以確保專案中的所有 inline 函式都能一致地進行 inline 處理。Kotlin %kotlinEapVersion% 預設啟用跨模組 inlining。

如果您遇到此功能的非預期問題，可以使用以下命令列編譯器選項將其停用：

```bash
-Xklib-ir-inliner=disabled
```

請在 [YouTrack](https://kotl.in/issue) 中分享您的回饋並回報任何問題。

### 改進的型別推論效能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 透過減少型別推論期間產生的約束數量來提高編譯器效能。先前，複雜的泛型程式碼可能會產生過多的約束，導致編譯或 IDE 分析卡住無回應。此變更可能會影響某些邊緣情況下的型別推論，尤其是涉及建構器推論（builder inference）或具有非典型邊界的複雜平台型別的情況。因此，編譯器可能會推論出不同的型別、選擇不同的多載，或回報不同的診斷資訊。這些差異可能是此改進的預期結果。

此功能預設為啟用。若要還原先前的型別推論行為，請使用 `-XXLanguage:-EliminateSecondKindIncorporation` 選項。

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中向我們提供回饋。

<!--
### New experimental compilation scheme for Kotlin Multiplatform {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% introduces a new experimental compilation scheme for Kotlin Multiplatform (KMP) that makes the
compiler handle common source sets more consistently with the IDE. This change prevents common code from accidentally
resolving to platform-specific declarations, improves consistency in overload resolution and type inference, and enables
incremental compilation for common source sets. Learn more about KMP separate compilation and how to try it in our [blog post](TBD).
-->

## 破壞性變更與棄用 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% 引入了一項警告，作為將執行 Kotlin 編譯器所需的最低 JDK 版本從 JDK 8 提升至 JDK 17 的第一步。我們提升最低要求的 JDK 版本，以加快開發速度，並讓編譯器能夠使用需要較新 Java 版本的新程式庫。JDK 17 具有較長的支援週期，並有助於我們保持與較新版本 Gradle 和 Maven 的相容性。您可以使用 `-Xallow-pre-17-runtime-jdk` 編譯器選項來選擇不接收此警告。當 JDK 17 成為強制要求時，此選項將在 Kotlin 2.5.20 或 2.6.0 中移除。

如果您在升級專案時遇到困難，請在 [YouTrack](https://kotl.in/issue) 上分享您的經驗，或直接在 Kotlin Slack 上聯絡開發人員。[獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)並加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 頻道。