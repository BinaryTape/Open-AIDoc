[//]: # (title: 在 JavaScript 中使用 Kotlin 程式碼)

根據所選的 [JavaScript 模組](js-modules.md) 系統，Kotlin/JS 編譯器會產生不同的輸出。
但總體而言，Kotlin 編譯器會產生一般的 JavaScript 類別、函式和屬性，您可以從 JavaScript 程式碼中自由使用它們。
不過，您應該記住一些細微之處。

## 在 plain 模式下將宣告隔離在單獨的 JavaScript 物件中 {id="isolating-declarations-in-a-separate-javascript-object-in-plain-mode"}

如果您已明確將模組種類設定為 `plain`，Kotlin 會建立一個物件，其中包含來自當前模組的所有 Kotlin 宣告。這樣做是為了防止破壞全域物件。這意味著對於一個名為 `myModule` 的模組，所有宣告都可以透過 JavaScript 的 `myModule` 物件來存取。例如：

```kotlin
fun foo() = "Hello"
```

此函式可以像這樣從 JavaScript 中呼叫：

```javascript
alert(myModule.foo());
```

當您將 Kotlin 模組編譯為 JavaScript 模組（例如 [UMD](https://github.com/umdjs/umd)（`browser` 和 `nodejs` 目標的預設設定）、[ESM](https://tc39.es/ecma262/#sec-modules)、[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) 或 [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)）時，直接呼叫此函式的方式並不適用。在這些情況下，您的宣告會根據所選的 JavaScript 模組系統進行暴露。例如，使用 UMD、ESM 或 CommonJS 時，您的呼叫點會如下所示：

```javascript
alert(require('myModule').foo());
```

有關 JavaScript 模組系統的更多資訊，請參閱 [JavaScript 模組](js-modules.md)。

## 套件結構 {id="package-structure"}

對於大多數模組系統（CommonJS、Plain 和 UMD），Kotlin 會將其套件結構暴露給 JavaScript。
除非您在根套件中定義宣告，否則您必須在 JavaScript 中使用完全限定名稱。例如：

```kotlin
package my.qualified.packagename

fun foo() = "Hello"
```

例如，使用 UMD 或 CommonJS 時，您的呼叫點可能如下所示：

```javascript
alert(require('myModule').my.qualified.packagename.foo())
```

當使用 `plain` 作為模組系統設定時，呼叫點將為：

```javascript
alert(myModule.my.qualified.packagename.foo());
```

當目標為 ECMAScript 模組 (ESM) 時，套件資訊不會被保留，以縮減應用程式的套件大小並符合 ESM 套件的典型佈局。在這種情況下，在 ES 模組中使用 Kotlin 宣告如下所示：

```javascript
import { foo } from 'myModule';

alert(foo());
```

### `@JsName` 註解 {id="jsname-annotation"}

在某些情況下（例如為了支援多載），Kotlin 編譯器會重整 JavaScript 程式碼中產生的函式和屬性的名稱。要控制產生的名稱，您可以使用 `@JsName` 註解：

```kotlin
// 模組 'kjs'
class Person(val name: String) {
    fun hello() {
        println("Hello $name!")
    }

    @JsName("helloWithGreeting")
    fun hello(greeting: String) {
        println("$greeting $name!")
    }
}
```

現在您可以按照以下方式在 JavaScript 中使用此類別：

```javascript
// 如有必要，根據所選的模組系統匯入 'kjs'
var person = new kjs.Person("Dmitry");   // 參照模組 'kjs'
person.hello();                          // 列印 "Hello Dmitry!"
person.helloWithGreeting("Servus");      // 列印 "Servus Dmitry!"
```

如果我們沒有指定 `@JsName` 註解，相應函式的名稱將包含一個根據函式簽章計算出的後綴，例如 `hello_61zpoe$`。

請注意，在某些情況下 Kotlin 編譯器不會套用名稱重整 (mangling)：
- `external` 宣告不會被重整。
- 繼承自 `external` 類別的非 `external` 類別中的任何覆寫函式都不會被重整。

`@JsName` 的參數必須是常數字串常值，且該常值必須是有效的識別符號。
任何嘗試將非識別符號字串傳遞給 `@JsName` 的行為，編譯器都會報錯。
以下範例會產生編譯期錯誤：

```kotlin
@JsName("new C()")   // 這裡會出錯
external fun newC()
```

### `@JsExport` 註解 {id="jsexport-annotation"}
<primary-label ref="experimental-general"/>

透過將 `@JsExport` 註解套用至頂層宣告（如類別、介面或函式），您可以讓 Kotlin 宣告在 JavaScript 或 TypeScript 中可用。此註解會匯出所有具有 Kotlin 中指定名稱的巢狀宣告。

例如，以下是如何匯出包含巢狀類別和具名伴隨物件的 Kotlin 介面：

```kotlin
@JsExport
interface Identity {
     class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

目前，`@JsExport` 註解是使您的函式從 Kotlin 中可見的唯一方法。

`@JsExport` 註解也可用於：

* 多平台專案的通用程式碼中。它僅在針對 JavaScript 目標進行編譯時生效，並允許您同時匯出非平台特定的 Kotlin 宣告。
* 與 [`@JsName` 註解](#jsname-annotation)結合使用，以指定產生和匯出的函式名稱。這有助於解決匯出中的歧義（例如同名函式的多載）。
* 使用 `@file:JsExport` 套用於檔案層級。

#### 支援值類別 (value class) 匯出 {id="export-value-classes"}

您可以將 Kotlin 的 [內嵌值類別](inline-classes.md) 匯出為一般的 TypeScript 類別。

要匯出值類別，請在 Kotlin 端將其標記為 `@JsExport` 註解：

```kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

從 TypeScript 端來看，它就像一個普通的類別：

```typescript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

#### 匯出掛起 Lambda {id="export-suspending-lambdas"}

您可以將 Kotlin 的 [掛起 Lambda 運算式](lambdas.md#lambda-expressions-and-anonymous-functions) 匯出為 JavaScript 的 [async 函式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)：

1. 要啟用此功能，請將以下編譯器選項新增到您的 `build.gradle.kts` 檔案中：

    ```kotlin
    kotlin {
        js {
            compilations.all {
                compileTaskProvider.configure {
                    compilerOptions {
                        freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                    }
                }
            }
        }
    }
    ```

2. 使用 `@JsExport` 註解標記相關的 Kotlin 宣告：

    ```kotlin
    // Kotlin
    @JsExport
    class TaskRunner {
        suspend fun runTask(task: suspend () -> String): String {
            return task()
        }
    }
    ```

3. 在 TypeScript 端，`suspend` Lambda 將被對應為一般的 `async` 函式：

    ```typescript
    // TypeScript
    import { TaskRunner } from "..."
    
    const runner = new TaskRunner();
    const result = await runner.runTask(async () => "done");
    console.log(result); // "done"
    ```

### `@JsNoRuntime` 註解 {id="jsnoruntime-annotation"}

您可以使用 `@JsNoRuntime` 註解將 Kotlin 介面匯出到 JavaScript/TypeScript。這允許直接對應到一般的 TypeScript 介面。

要匯出 Kotlin 介面（例如從 Kotlin 多平台專案匯出）：

1. 在通用程式碼中為 Kotlin 介面加上 `@JsNoRuntime` 註解：

    ```kotlin
    // commonMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    expect interface DataProcessor {
        fun process(data: String): Int 
    }
    ```

2. 在 JavaScript 特定的原始碼中提供帶有 `@JsNoRuntime` 的實際實作：

    ```kotlin
    // jsMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    actual interface DataProcessor {
        actual fun process(data: String): Int
    } 
    ```
    
3. 在 TypeScript 端，該介面將被對應為一般的 TypeScript 介面：
    
    ```typescript
    // 產生的 .d.ts
    export interface DataProcessor {
        process(data: string): number;
    }
    ```

對於 Kotlin 多平台專案，一般規則如下：

* `expect` 和 `actual` 介面宣告都必須加上 `@JsNoRuntime` 註解。唯一的例外是平台特定程式碼中 `actual` 端不需要註解的 `external` 實作。
* 禁止在 `expect` 端的通用程式碼中使用 `external` 介面宣告。應改用加上 `@JsNoRuntime` 註解的一般介面。

使用 `@JsNoRuntime` 匯出 Kotlin 介面有一些限制。該註解不允許用於：

* `external` 介面，因為它們預設的行為就已經像是有 `@JsNoRuntime`。加上它會導致編譯器警告。
* `is` 和 `as` 型別檢查。
* 使用 [`::class` 語法](js-reflection.md) 的類別參照。
* 作為 [具體化型別引數 (reified type argument)](inline-functions.md#reified-type-parameters) 傳遞的介面。

### `@JsStatic` {id="jsstatic"}
<primary-label ref="experimental-general"/>

`@JsStatic` 註解指示編譯器為目標宣告產生額外的靜態方法。這有助於您直接在 JavaScript 中使用 Kotlin 程式碼中的靜態成員。

您可以將 `@JsStatic` 註解套用至在命名物件中定義的函式，以及在類別和介面內宣告的伴隨物件。如果您使用此註解，編譯器將同時產生該物件的靜態方法以及物件本身的執行個體方法。例如：

```kotlin
// Kotlin
class C {
    companion object {
        @JsStatic
        fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

現在，`callStatic()` 函式在 JavaScript 中是靜態的，而 `callNonStatic()` 函式則不是：

```javascript
// JavaScript
C.callStatic();              // 有效，存取靜態函式
C.callNonStatic();           // 錯誤，在產生的 JavaScript 中不是靜態函式
C.Companion.callStatic();    // 執行個體方法仍然存在
C.Companion.callNonStatic(); // 這是它能運作的唯一方式
```

也可以將 `@JsStatic` 註解套用至物件或伴隨物件的屬性，使其取得方法 (getter) 和設定方法 (setter) 成為該物件或包含伴隨物件之類別中的靜態成員。

此功能為 [實驗性](components-stability.md#stability-levels-explained)。請在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-18891/JS-provide-a-way-to-declare-static-members-JsStatic) 中分享您的回饋。

### 使用 `BigInt` 型別來表示 Kotlin 的 `Long` 型別 {id="use-bigint-type-to-represent-kotlin-s-long-type"}
<primary-label ref="experimental-general"/>

當編譯為現代 JavaScript (ES2020) 時，Kotlin/JS 使用 JavaScript 內建的 `BigInt` 型別來表示 Kotlin 的 `Long` 值。

要啟用對 `BigInt` 型別的支援，您需要將以下編譯器選項新增到您的 `build.gradle(.kts)` 檔案中：

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。請在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128/KJS-Use-BigInt-to-represent-Long-values-in-ES6-mode) 中分享您的回饋。

#### 在匯出的宣告中使用 `Long` {id="use-long-in-exported-declarations"}

由於 Kotlin 的 `Long` 型別可以編譯為 JavaScript 的 `BigInt` 型別，因此 Kotlin/JS 支援將 `Long` 值匯出到 JavaScript。

要啟用此功能：

1. 允許在 Kotlin/JS 中匯出 `Long`。將以下編譯器選項新增到 `build.gradle(.kts)` 檔案中的 `freeCompilerArgs` 屬性：

     ```kotlin
    // build.gradle.kts
    kotlin {
        js {
            ...
            compilerOptions { 
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. 啟用 `BigInt` 型別。請參閱[使用 `BigInt` 型別來表示 Kotlin 的 `Long` 型別](#use-bigint-type-to-represent-kotlin-s-long-type)以了解如何啟用它。

### 使用 `BigInt64Array` 型別來表示 Kotlin 的 `LongArray` 型別 {id="use-bigint64array-type-to-represent-kotlin-s-longarray-type"}
<primary-label ref="experimental-general"/>

當編譯為 JavaScript 時，Kotlin/JS 可以使用 JavaScript 內建的 `BigInt64Array` 型別來表示 Kotlin 的 `LongArray` 值。

要啟用對 `BigInt64Array` 型別的支援，請將以下編譯器選項新增到您的 `build.gradle(.kts)` 檔案中：

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。請在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray) 中分享您的回饋。

## JavaScript 中的 Kotlin 型別 {id="kotlin-types-in-javascript"}

了解 Kotlin 型別如何對應到 JavaScript 型別：

| Kotlin                                                           | JavaScript                | 說明                                                                                                |
|------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `Byte`, `Short`, `Int`, `Float`, `Double`                        | `Number`                  |                                                                                                         |
| `Char`                                                           | `Number`                  | 該數字代表字元的代碼。                                                             |
| `Long`                                                           | `BigInt`                  | 需要配置 [`-Xes-long-as-bigint` 編譯器選項](compiler-reference.md#xes-long-as-bigint)。 |
| `Boolean`                                                        | `Boolean`                 |                                                                                                         |
| `String`                                                         | `String`                  |                                                                                                         |
| `Array`                                                          | `Array`                   |                                                                                                         |
| `ByteArray`                                                      | `Int8Array`               |                                                                                                         |
| `ShortArray`                                                     | `Int16Array`              |                                                                                                         |
| `IntArray`                                                       | `Int32Array`              |                                                                                                         |
| `CharArray`                                                      | `UInt16Array`             | 包含屬性 `$type$ == "CharArray"`。                                                           |
| `FloatArray`                                                     | `Float32Array`            |                                                                                                         |
| `DoubleArray`                                                    | `Float64Array`            |                                                                                                         |
| `LongArray`                                                      | `BigInt64Array`           |                                                                                                         |
| `BooleanArray`                                                   | `Int8Array`               | 包含屬性 `$type$ == "BooleanArray"`。                                                        |
| `List`, `MutableList`                                            | `KtList`, `KtMutableList` | 透過 `KtList.asJsReadonlyArrayView` 或 `KtMutableList.asJsArrayView` 暴露 `Array`。                 |
| `Map`, `MutableMap`                                              | `KtMap`, `KtMutableMap`   | 透過 `KtMap.asJsReadonlyMapView` 或 `KtMutableMap.asJsMapView` 暴露 ES2015 `Map`。                  |
| `Set`, `MutableSet`                                              | `KtSet`, `KtMutableSet`   | 透過 `KtSet.asJsReadonlySetView` 或 `KtMutableSet.asJsSetView` 暴露 ES2015 `Set`。                  |
| `Unit`                                                           | Undefined                 | 當用作傳回型別時可匯出，但用作參數型別時則不可。                               |
| `Any`                                                            | `Object`                  |                                                                                                         |
| `Throwable`                                                      | `Error`                   |                                                                                                         |
| `enum class Type`                                                | `Type`                    | 列舉成員會被暴露為靜態類別屬性 (`Type.ENTRY`)。                                     |
| 可為 Null 的 `Type?`                                                 | `Type                     | null                                                                                                    | undefined` |                                                                                            |
| 除了標記有 `@JsExport` 的型別外，所有其他 Kotlin 型別 | 不支援             | 包含 Kotlin 的[無符號整數類型](unsigned-integer-types.md)。                                  |

此外，請務必了解：

* Kotlin 為 `kotlin.Int`、`kotlin.Byte`、`kotlin.Short`、`kotlin.Char` 和 `kotlin.Long` 保留了溢位語意。
* Kotlin 在執行時無法區分數值型別（`kotlin.Long` 除外），因此以下程式碼可以運作：
  
  ```kotlin
  fun f() {
      val x: Int = 23
      val y: Any = x
      println(y as Float)
  }
  ```

* Kotlin 在 JavaScript 中保留了延遲物件初始化。