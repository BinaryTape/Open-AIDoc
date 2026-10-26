[//]: # (title: 使用來自 npm 的相依性)

在 Kotlin/JS 專案中，所有的相依性都可以透過 Gradle 外掛程式進行管理。這包括了 Kotlin/Multiplatform 程式庫，例如 `kotlinx.coroutines`、`kotlinx.serialization` 或 `ktor-client`。

若要相依於來自 [npm](https://www.npmjs.com/) 的 JavaScript 套件，Gradle DSL 提供了一個 `npm` 函式，讓你可以指定想要從 npm 匯入的套件。讓我們來看看如何匯入一個名為 [`is-sorted`](https://www.npmjs.com/package/is-sorted) 的 npm 套件。

在 Gradle 建置檔案中的對應部分如下所示：

```kotlin
dependencies {
    // ...
    implementation(npm("is-sorted", "^1.0.5"))
}
```

由於 JavaScript 模組通常是動態型別的，而 Kotlin 是一門靜態型別語言，因此你需要提供一種配接器。在 Kotlin 中，這類配接器被稱為*外部宣告*（external declarations）。對於僅提供一個函式的 `is-sorted` 套件而言，編寫這個宣告非常簡短。在原始碼資料夾內建立名為 `is-sorted.kt` 的新檔案，並填入以下內容：

```kotlin
@JsModule("is-sorted")
@JsNonModule
external fun <T> sorted(a: Array<T>): Boolean
```

請注意，如果你使用 CommonJS 作為目標，則需要相應地調整 `@JsModule` 和 `@JsNonModule` 註解。

現在這個 JavaScript 函式就可以像一般的 Kotlin 函式一樣使用。由於我們在標頭檔中提供了型別資訊（而非僅將參數與傳回型別定義為 `dynamic`），因此也能獲得合適的編譯器支援與型別檢查。

```kotlin
console.log("Hello, Kotlin/JS!")
console.log(sorted(arrayOf(1,2,3)))
console.log(sorted(arrayOf(3,1,2)))
```

無論是在瀏覽器或 Node.js 中執行這三行，輸出結果都會顯示對 `sorted` 的呼叫已正確對應到 `is-sorted` 套件所匯出的函式：

```kotlin
Hello, Kotlin/JS!
true
false
```

由於 JavaScript 生態系統在套件中公開函式的方式有多種（例如，透過具名匯出或預設匯出），其他 npm 套件的外部宣告結構可能需要稍作調整。

若要進一步了解如何撰寫宣告，請參閱[從 Kotlin 呼叫 JavaScript](js-interop.md)。