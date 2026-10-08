[//]: # (title: Opt-in 需求)

Kotlin 標準函式庫提供了一種機制，要求在使用某些 API 元素時必須獲得明確同意。
此機制允許程式庫作者告知使用者有關需要 Opt-in 的特定條件，
例如當 API 處於實驗狀態且未來可能會發生變化時。

為了保護使用者，編譯器會針對這些條件發出警告，並要求在使用 API 之前先進行 Opt-in。

## 對 API 進行 Opt-in {id="opt-in-to-api"}

如果程式庫作者將其程式庫 API 中的宣告標記為 **[需要 Opt-in](#require-opt-in-to-use-api)**，
您必須在程式碼中使用它之前給予明確同意。
有幾種 Opt-in 的方法。我們建議選擇最適合您情況的方式。

### 在本機 Opt-in {id="opt-in-locally"}

要在程式碼中使用特定的 API 元素時對其進行 Opt-in，請使用 [`@OptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/)
註解，並參照實驗性 API 的標記。例如，假設您想要使用需要 Opt-in 的 `DateProvider` 類別：

```kotlin
// 程式庫程式碼
@RequiresOptIn(message = "This API is experimental. It could change in the future without notice.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime

@MyDateTime
// 需要 Opt-in 的類別
class DateProvider
```

在您的程式碼中，在宣告使用 `DateProvider` 類別的函式之前，加上 `@OptIn` 註解並
參照 `MyDateTime` 註解類別：

```kotlin
// 用戶端程式碼
@OptIn(MyDateTime::class)

// 使用 DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

值得注意的是，使用此方法時，如果 `getDate()` 函式在您程式碼的其他地方被呼叫或被
其他開發人員使用，則不需要 Opt-in：

```kotlin
// 用戶端程式碼
@OptIn(MyDateTime::class)

// 使用 DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    // OK：不需要 Opt-in
    println(getDate()) 
}
```

Opt-in 需求不會傳播，這意味著其他人可能會在不知情的情況下使用實驗性 API。為了避免這種情況，
傳播 Opt-in 需求會更安全。

#### 傳播 Opt-in 需求 {id="propagate-opt-in-requirements"}

當您在旨在供第三方使用的程式碼（例如在程式庫中）中使用 API 時，您也可以將其 Opt-in 需求
傳播到您的 API。要執行此操作，請使用與該程式庫相同的 **[Opt-in 需求註解](#create-opt-in-requirement-annotations)** 
來標記您的宣告。

例如，在宣告使用 `DateProvider` 類別的函式之前，加上 `@MyDateTime` 註解：

```kotlin
// 用戶端程式碼
@MyDateTime
fun getDate(): Date {
    // OK：此函式也需要 Opt-in
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    println(getDate())
    // 錯誤：getDate() 需要 Opt-in
}
```

如您在此範例中所見，帶有註解的函式看起來像是 `@MyDateTime` API 的一部分。
Opt-in 會將 Opt-in 需求傳播給 `getDate()` 函式的使用者。

如果 API 元素的簽章包含需要 Opt-in 的型別，則該簽章本身也必須要求 Opt-in。
否則，如果 API 元素不需要 Opt-in，但其簽章包含需要 Opt-in 的型別，則使用它會觸發錯誤。

```kotlin
// 用戶端程式碼
@MyDateTime
fun getDate(dateProvider: DateProvider = DateProvider()): Date

@MyDateTime
fun displayDate() {
    // OK：此函式也需要 Opt-in
    println(getDate())
}
```

同樣地，如果您對簽章包含需要 Opt-in 型別的宣告套用 `@OptIn`，Opt-in 需求
仍然會傳播：

```kotlin
// 用戶端程式碼
@OptIn(MyDateTime::class)
// 由於簽章中的 DateProvider，會傳播 Opt-in 需求
fun getDate(dateProvider: DateProvider = DateProvider()): Date

fun displayDate() {
    println(getDate())
    // 錯誤：getDate() 需要 Opt-in
}
```

在傳播 Opt-in 需求時，重要的是要了解：如果某個 API 元素變得穩定且不再
具有 Opt-in 需求，則任何其他仍具有 Opt-in 需求的 API 元素仍維持實驗性。例如，
假設程式庫作者因為 `getDate()` 函式現在已經穩定，而移除了它的 Opt-in 需求：

```kotlin
// 程式庫程式碼
// 無需 Opt-in
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

如果您在未移除 Opt-in 註解的情況下使用 `displayDate()` 函式，即使不再
需要 Opt-in，它仍然維持實驗性：

```kotlin
// 用戶端程式碼

// 仍然是實驗性的！
@MyDateTime 
fun displayDate() {
    // 使用穩定的程式庫函式
    println(getDate())
}
```

#### 對多個 API 進行 Opt-in {id="opt-in-to-multiple-apis"}

要對多個 API 進行 Opt-in，請使用所有它們的 Opt-in 需求註解標記該宣告。例如：

```kotlin
@ExperimentalCoroutinesApi
@FlowPreview
```

或者使用 `@OptIn`：

```kotlin
@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
```

### 對檔案進行 Opt-in {id="opt-in-a-file"}

若要對檔案中的所有函式和類別使用需要 Opt-in 的 API，請在檔案頂部、
套件規格和匯入之前加上檔案層級的註解 `@file:OptIn`。

 ```kotlin
 // 用戶端程式碼
 @file:OptIn(MyDateTime::class)
 ```

### 對模組進行 Opt-in {id="opt-in-a-module"}

> `-opt-in` 編譯器選項自 Kotlin 1.6.0 起可用。對於較早的 Kotlin 版本，請使用 `-Xopt-in`。
>
{style="note"}

如果您不想在每次使用需要 Opt-in 的 API 時都加上註解，您可以為整個模組進行 Opt-in。
要在模組中 Opt-in 使用 API，請使用引數 `-opt-in` 進行編譯，
並指定您使用的 API Opt-in 需求註解的完全限定名稱：`-opt-in=org.mylibrary.OptInAnnotation`。
使用此引數編譯的效果與模組中的每個宣告都具有註解 `@OptIn(OptInAnnotation::class)` 相同。

如果您使用 Gradle 組建您的模組，可以像這樣加入引數：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions.optIn.add("org.mylibrary.OptInAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

如果您的 Gradle 模組是多平台模組，請使用 `optIn` 方法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("org.mylibrary.OptInAnnotation")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

對於 Maven，請使用以下內容：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>...</executions>
            <configuration>
                <args>
                    <arg>-opt-in=org.mylibrary.OptInAnnotation</arg>                    
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

要在模組層級對多個 API 進行 Opt-in，請為模組中使用的每個 Opt-in 需求標記加入一個上述引數。

### 透過繼承類別或介面進行 Opt-in {id="opt-in-to-inherit-from-a-class-or-interface"}

有時，程式庫作者提供了一個 API，但希望要求使用者在擴充它之前必須先明確 Opt-in。
例如，該程式庫 API 在使用上可能是穩定的，但在繼承上則不然，因為未來可能會擴充
新的抽象函式。程式庫作者可以透過使用 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 註解標記 [open](inheritance.md) 或 [抽象類別](classes.md#abstract-classes) 以及 [非功能性介面](interfaces.md) 來強制執行此要求。

要在您的程式碼中 Opt-in 使用此類 API 元素並擴充它，請使用 `@SubclassOptInRequired` 註解
並參照註解類別。例如，假設您想要使用需要 Opt-in 的 `CoreLibraryApi` 介面：

```kotlin
// 程式庫程式碼
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 需要 Opt-in 才能擴充的介面
interface CoreLibraryApi 
```

在您的程式碼中，在建立繼承自 `CoreLibraryApi` 介面的新介面之前，加上 `@SubclassOptInRequired`
註解並參照 `UnstableApi` 註解類別：

```kotlin
// 用戶端程式碼
@SubclassOptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi
```

請注意，當您在類別上使用 `@SubclassOptInRequired` 註解時，Opt-in 需求不會傳播到
任何 [內部或巢狀類別](nested-classes.md)：

```kotlin
// 程式庫程式碼
@RequiresOptIn
annotation class ExperimentalFeature

@SubclassOptInRequired(ExperimentalFeature::class)
open class FileSystem {
    open class File
}

// 用戶端程式碼

// 需要 Opt-in
class NetworkFileSystem : FileSystem()

// 巢狀類別
// 不需要 Opt-in
class TextFile : FileSystem.File()
```

或者，您也可以使用 `@OptIn` 註解來進行 Opt-in。您也可以使用實驗性標記註解
將需求進一步傳播到您程式碼中該類別的任何用法：

```kotlin
// 用戶端程式碼
// 使用 @OptIn 註解
@OptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi

// 使用參照註解類別的註解
// 進一步傳播 Opt-in 需求
@UnstableApi
interface SomeImplementation : CoreLibraryApi
```

## 要求 Opt-in 才能使用 API {id="require-opt-in-to-use-api"}

您可以要求程式庫的使用者在能夠使用您的 API 之前先進行 Opt-in。此外，您可以告知使用者
在使用您的 API 時的任何特殊條件，直到您決定移除 Opt-in 需求為止。

### 建立 Opt-in 需求註解 {id="create-opt-in-requirement-annotations"}

要要求 Opt-in 才能使用您模組的 API，請建立一個註解類別作為 **Opt-in 需求註解**。
此類別必須使用 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) 進行註解：

```kotlin
@RequiresOptIn
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime
```

Opt-in 需求註解必須符合幾個要求。它們必須具備：

* `BINARY` 或 `RUNTIME` [保留 (retention)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/)。
* 沒有 `EXPRESSION`、`FILE`、`TYPE` 或 `TYPE_PARAMETER` 作為 [目標 (target)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/)。
* 沒有參數。

Opt-in 需求可以具有兩種嚴重性 [等級 (levels)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/-level/) 之一：

* `RequiresOptIn.Level.ERROR`。Opt-in 是強制性的。否則，使用標記 API 的程式碼將無法編譯。這是預設等級。
* `RequiresOptIn.Level.WARNING`。Opt-in 並非強制性，但建議使用。如果沒有它，編譯器會發出警告。

要設定所需的等級，請指定 `@RequiresOptIn` 註解的 `level` 參數。

此外，您可以向 API 使用者提供一個 `message`。編譯器會向嘗試在未 Opt-in 情況下使用 API 的使用者顯示此訊息：

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.WARNING, message = "This API is experimental. It can be incompatibly changed in the future.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class ExperimentalDateTime
```

如果您發布了多個需要 Opt-in 的獨立功能，請為每個功能宣告一個註解。
這對您的客戶來說更安全，因為他們可以只使用他們明確接受的功能。
這也意味著您可以獨立地從功能中移除 Opt-in 需求，這使您的 API 更易於維護。

### 標記 API 元素 {id="mark-api-elements"}

要要求 Opt-in 才能使用某個 API 元素，請使用 Opt-in 需求註解來標記其宣告：

```kotlin
@MyDateTime
class DateProvider

@MyDateTime
fun getTime(): Time {}
```

請注意，對於某些語言元素，Opt-in 需求註解並不適用：

* 您不能標記屬性的支援欄位或 getter，只能標記屬性本身。
* 您不能標記區域變數或值參數。

## 要求 Opt-in 才能擴充 API {id="require-opt-in-to-extend-api"}

有時您可能想要更細緻地控制 API 的哪些特定部分可以被使用和
擴充。例如，當您有一些使用上穩定但具有以下特性的 API 時：

* 由於持續演進，**實作上不穩定**，例如當您有一組預計在沒有預設實作的情況下加入新抽象函式的介面。
* **實作上棘手或脆弱**，例如需要以協調方式運作的個別函式。
* **具有未來可能被削弱的契約**，且對外部實作是以回溯不相容的方式進行，例如將輸入參數 `T` 變更為可為 null 的版本 `T?`，而程式碼先前並未考慮 `null` 值。

在這種情況下，您可以要求使用者在進一步擴充您的 API 之前先進行 Opt-in。使用者可以透過繼承 API 或實作抽象函式來擴充您的 API。透過使用 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 註解，
您可以對 [open](inheritance.md) 或 [抽象類別](classes.md#abstract-classes) 以及 [非功能性介面](interfaces.md) 強制執行此 Opt-in 要求。

To add the opt-in requirement to an API element, use the [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/)
annotation with a reference to the annotation class:

```kotlin
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 需要 Opt-in 才能擴充的介面
interface CoreLibraryApi 
```

請注意，當您使用 `@SubclassOptInRequired` 註解來要求 Opt-in 時，該要求不會傳播到
任何 [內部或巢狀類別](nested-classes.md)。

有關如何在您的 API 中使用 `@SubclassOptInRequired` 註解的實際範例，請查看 `kotlinx.coroutines` 程式庫中的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 介面。

## 預先穩定 (Pre-stable) API 的 Opt-in 需求 {id="opt-in-requirements-for-pre-stable-apis"}

如果您對尚未穩定的功能使用 Opt-in 需求，請謹慎處理 API 晉進，以避免
破壞用戶端程式碼。

一旦您的預先穩定 API 晉升並以穩定狀態發布，請從您的宣告中移除 Opt-in 需求註解。
用戶端隨後可以不受限制地使用它們。但是，您應該將註解類別留在模組中，
以便現有的用戶端程式碼保持相容。

為了鼓勵 API 使用者更新他們的模組（透過從其程式碼中移除任何註解並重新編譯），請將註解標記為 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/)，並在棄用訊息中提供說明。

```kotlin
@Deprecated("This opt-in requirement is not used anymore. Remove its usages from your code.")
@RequiresOptIn
annotation class ExperimentalDateTime
```
