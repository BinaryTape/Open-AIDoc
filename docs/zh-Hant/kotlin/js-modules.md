[//]: # (title: JavaScript 模組)

您可以將您的 Kotlin 專案編譯為適用於各種流行模組系統的 JavaScript 模組。我們目前為 JavaScript 模組支援以下組態：

- [ES 模組](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，在 JavaScript 中宣告模組的標準方式（使用 `import/export` JavaScript 語法）。如果 `target` 設定為 `es2015`，則預設使用它。
- [Unified Module Definitions (UMD)](https://github.com/umdjs/umd)，與 *AMD* 和 *CommonJS* 均相容。UMD 模組在不被匯入或不存在模組系統時也能夠執行。這是 `browser` 和 `nodejs` 目標的預設選項。
- [Asynchronous Module Definitions (AMD)](https://github.com/amdjs/amdjs-api/wiki/AMD)，特別是由 [RequireJS](https://requirejs.org/) 程式庫所使用。
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)，廣泛用於 Node.js/npm（`require` 函式和 `module.exports` 物件）。
- Plain。不針對任何模組系統進行編譯。您可以在全域作用域中透過模組名稱存取模組。

## 瀏覽器目標 {id="browser-targets"}

如果您打算在網頁瀏覽器環境中執行程式碼，並希望使用 UMD 以外的模組系統，您可以在 `webpackTask` 組態區塊中指定所需的模組類型。例如，要切換到 CommonJS，請使用：

```groovy
kotlin {
    js {
        browser {
            webpackTask {
                output.libraryTarget = "commonjs2"
            }
        }
        binaries.executable()
    }
}
```

Webpack 提供兩種不同形式的 CommonJS：`commonjs` 與 `commonjs2`，這會影響您宣告的可用方式。在大多數情況下，您可能需要 `commonjs2`，它會將 `module.exports` 語法新增到產生的程式庫中。或者，您也可以選擇 `commonjs` 選項，它嚴格遵循 CommonJS 規範。若要了解更多關於 `commonjs` 與 `commonjs2` 之間的差異，請參閱 [Webpack 存儲庫](https://github.com/webpack/webpack/issues/1114)。

## JavaScript 程式庫與 Node.js 檔案 {id="javascript-libraries-and-node-js-files"}

如果您正在建立用於 JavaScript 或 Node.js 環境的程式庫，且想要使用不同的模組系統，則操作說明會略有不同。

### 選擇目標模組系統 {id="choose-the-target-module-system"}

要選擇目標模組系統，請在 Gradle 建置指令碼中設定 `moduleKind` 編譯器選項：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlinJs.compilerOptions.moduleKind = org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS
```

</tab>
</tabs>

可用的值為：`umd`（預設）、`es`、`commonjs`、`amd`、`plain`。

> 這與調整 `webpackTask.output.libraryTarget` 不同。程式庫目標會更改由 _webpack 產生的_輸出（在您的程式碼編譯完成後）。`compilerOptions.moduleKind` 則會更改由 _Kotlin 編譯器產生的_輸出。
>
{style="note"}  

在 Kotlin Gradle DSL 中，還有一個用於設定 CommonJS 和 ESM 模組類型的快速鍵：

```kotlin
kotlin {
    js {
        useCommonJs()
        // 或
        useEsModules()
        // ...
    }
}
```

## @JsModule 註解 {id="jsmodule-annotation"}

要告訴 Kotlin 某個 `external` 類別、軟件包、函式或屬性是 JavaScript 模組，您可以使用 `@JsModule` 註解。假設您有一個名為「hello」的 CommonJS 模組：

```javascript
module.exports.sayHello = function (name) { alert("Hello, " + name); }
```

您應該在 Kotlin 中像這樣宣告它：

```kotlin
@JsModule("hello")
external fun sayHello(name: String)
```

### 應用 @JsModule 於軟件包 {id="apply-jsmodule-to-packages"}

某些 JavaScript 程式庫匯出軟件包（命名空間）而不是函式和類別。就 JavaScript 而言，這是一個具有類別、函式和屬性等成員的*物件*。將這些軟件包作為 Kotlin 物件匯入通常看起來不自然。編譯器可以使用以下表示法將匯入的 JavaScript 軟件包對應到 Kotlin 軟件包：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

external class C
```

其中對應的 JavaScript 模組宣告如下：

```javascript
module.exports = {
  foo: { /* 此處為某些程式碼 */ },
  C: { /* 此處為某些程式碼 */ }
}
```

標記有 `@file:JsModule` 註解的檔案不能宣告非 external 成員。下面的範例會產生編譯期錯誤：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

fun bar() = "!" + foo() + "!" // 此處發生錯誤
```

### 匯入更深層的軟件包階層 {id="import-deeper-package-hierarchies"}

在前面的範例中，JavaScript 模組匯出單個軟件包。然而，某些 JavaScript 程式庫會從一個模組中匯出多個軟件包。Kotlin 也支援這種情況，但您必須為匯入的每個軟件包宣告一個新的 `.kt` 檔案。

例如，讓我們讓範例稍微複雜一點：

```javascript
module.exports = {
  mylib: {
    pkg1: {
      foo: function () { /* 此處為某些程式碼 */ },
      bar: function () { /* 此處為某些程式碼 */ }
    },
    pkg2: {
      baz: function () { /* 此處為某些程式碼 */ }
    }
  }
}
```

要在 Kotlin 中匯入此模組，您必須編寫兩個 Kotlin 原始碼檔案：

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg1")

package extlib.pkg1

external fun foo()

external fun bar()
```

以及

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg2")

package extlib.pkg2

external fun baz()
```

### @JsNonModule 註解 {id="jsnonmodule-annotation"}

當宣告標記為 `@JsModule` 時，如果您未將其編譯為 JavaScript 模組，則無法在 Kotlin 程式碼中使用它。通常，開發者會同時以 JavaScript 模組和可下載的 `.js` 檔案形式分發他們的程式庫，您可以將後者複製到專案的靜態資源中並透過 `<script>` 標籤包含。要告訴 Kotlin 在非模組環境中使用 `@JsModule` 宣告是沒問題的，請新增 `@JsNonModule` 註解。例如，考慮以下 JavaScript 程式碼：

```javascript
function topLevelSayHello (name) { alert("Hello, " + name); }

if (module && module.exports) {
  module.exports = topLevelSayHello;
}
```

您可以從 Kotlin 中按如下方式描述它：

```kotlin
@JsModule("hello")
@JsNonModule
@JsName("topLevelSayHello")
external fun sayHello(name: String)
```

### Kotlin 標準函式庫使用的模組系統 {id="module-system-used-by-the-kotlin-standard-library"}

Kotlin 隨 Kotlin/JS 標準函式庫以單個檔案形式分發，該檔案本身被編譯為 UMD 模組，因此您可以將其與上述任何模組系統一起使用。對於 Kotlin/JS 的大多數使用案例，建議在 Gradle 相依性中使用 `kotlin-stdlib-js`，它在 NPM 上也可以作為 [`kotlin`](https://www.npmjs.com/package/kotlin) 軟件包使用。