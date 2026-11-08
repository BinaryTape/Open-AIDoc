[//]: # (title: Kotlin/JS 編譯器特性)

Kotlin/JS 編譯器在產生 JavaScript 程式碼之前，會先將 Kotlin 程式碼轉換為中間表示（IR）。
這個中間步驟讓編譯器能夠針對效能、大小和開發速度最佳化輸出內容，並讓你能掌控產生的 JavaScript，例如目標 JavaScript 版本、模組系統、TypeScript 宣告檔以及輸出細微度。

## 設定目標 JavaScript 版本 {id="set-the-target-javascript-version"}

Kotlin/JS 編譯器可以產生符合 ECMAScript 標準 ES5、ES2015 和 ES2020 版本的 JavaScript。
請選擇你的目標環境所支援的最新版本。
在 `build.gradle.kts` 檔案中設定 `target` 屬性。例如，將目標設定為 ES2020：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

關於各個目標可用的功能，請參閱[設定 ECMAScript 目標](js-project-setup.md#set-an-ecmascript-target)。

## 設定模組系統 {id="configure-the-module-system"}

Kotlin/JS 編譯器可以為不同的模組系統產生程式碼，例如 UMD、CommonJS、AMD 和 ES 模組。
若要選擇目標模組系統，請在 `build.gradle.kts` 檔案中設定 `moduleKind` 編譯器選項：

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

關於支援的 `moduleKind` 值和詳細設定，請參閱 [JavaScript 模組](js-modules.md)。

## 產生 TypeScript 宣告檔 (`d.ts`) {id="generate-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 編譯器可以從你的 Kotlin 程式碼產生 TypeScript 定義。這些定義為 JavaScript 工具和 IDE 中的程式碼補全與靜態分析提供型別資訊，讓 Kotlin API 在 JavaScript 和 TypeScript 專案中更易於使用。

若要產生定義檔，請使用 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 標註 Kotlin 宣告，並在 `build.gradle.kts` 檔案的 `js {}` 區塊中新增 `generateTypeScriptDefinitions()` 函式：

```kotlin
kotlin {
    js {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

編譯器會收集標有 `@JsExport` 的頂層宣告，並在 `.d.ts` 檔案中產生 TypeScript 定義。

如需更多詳細資訊，請參閱[產生 TypeScript 宣告檔 (`d.ts`)](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)。

## 設定輸出細微度 {id="configure-output-granularity"}

你可以選擇編譯器在專案中輸出 `.js` 檔案的方式：

* **個別模組 (Per module)**：為每個專案模組產生單獨的 `.js` 檔案（預設）。
* **整個程式 (Whole program)**：為整個程式產生單一的 `.js` 檔案。
* **個別檔案 (Per file)**：為每個 Kotlin 檔案產生一個 `.js` 檔案，若該檔案包含匯出的宣告則產生兩個（適用於 `es2015` 和 `es2020` 目標 JavaScript 版本）。

若要變更細微度，請在 `gradle.properties` 檔案中設定 `kotlin.js.ir.output.granularity` 屬性：

```properties
# Default: per-module
kotlin.js.ir.output.granularity=whole-program
```

關於設定詳細資訊（包含個別檔案的需求），請參閱[設定輸出細微度](js-project-setup.md#configure-output-granularity)。

## 頂層屬性的延遲初始化 {id="lazy-initialization-of-top-level-properties"}

為了提升應用程式的啟動效能，Kotlin/JS 編譯器會延遲初始化頂層屬性。如此一來，應用程式載入時不需要初始化其程式碼中使用的所有頂層屬性。它只會初始化啟動時所需的屬性；其他屬性則會在實際執行使用它們的程式碼時才接收其值。

```kotlin
val a = run {
    val result = // 密集運算
    println(result)
    result
} // 僅在首次使用時計算數值
```

若因某些原因需要急切初始化屬性（在應用程式啟動時），請使用 [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-eager-initialization/){nullable="true"} 註解進行標記。

## 開發二進位檔的累加編譯 {id="incremental-compilation-for-development-binaries"}

Kotlin/JS 編譯器提供了*開發二進位檔的累加編譯模式*，以加快開發流程。
在此模式下，編譯器會在模組層級快取 `compileDevelopmentExecutableKotlinJs` Gradle 任務的結果。
在後續編譯期間，編譯器會針對未變更的原始碼檔案使用快取的編譯結果，從而加快編譯速度，在變更幅度較小時尤為明顯。

累加編譯預設已啟用。若要停用開發二進位檔的累加編譯，請將以下行新增至專案的 `gradle.properties` 或 `local.properties`：

```none
# Default: true
kotlin.incremental.js.ir=false
```

> 累加編譯模式下的全新組建通常較慢，因為需要建立並填入快取內容。
>
{style="note"}

## 生產環境中成員名稱的縮小化 {id="minification-of-member-names-in-production"}

Kotlin/JS 編譯器會利用其關於 Kotlin 類別與函式之間關聯的內部資訊來套用更有效率的縮小化，縮短函式、屬性和類別的名稱。這能縮小最終打包應用程式的大小。

當你在[生產環境 (production)](js-project-setup.md#building-executables) 模式下組建 Kotlin/JS 應用程式時，會自動套用這種類型的縮小化，且預設已啟用。若要停用成員名稱縮小化，請使用 `-Xir-minimized-member-names` 編譯器選項：

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
            }
        }
    }
}
```

## 無效程式碼消除 {id="dead-code-elimination"}

[無效程式碼消除](https://wikipedia.org/wiki/Dead_code_elimination) (Dead code elimination, DCE) 透過移除未使用的屬性、函式和類別，來縮小產生的 JavaScript 程式碼大小。

未使用的宣告可能出現在以下情況：

* 函式已內嵌且從未被直接呼叫（除了少數情況外通常都會發生）。
* 模組使用了共用程式庫。在沒有 DCE 的情況下，即使未使用該程式庫的部分內容，這些內容仍會包含在最終的打包成果中。
  例如，Kotlin 標準程式庫包含用於操作清單、陣列、字元序列的函式，以及 DOM（文件物件模型）配接器等。所有這些功能作為 JavaScript 檔案將需要約 1.3 MB。而一個簡單的「Hello, world」應用程式只需要主控台常式，整個檔案僅有幾 KB。

在 Kotlin/JS 編譯器中，DCE 會自動處理：

* DCE 在*開發環境*打包任務中處於停用狀態，對應於以下 Gradle 任務：

  * `jsBrowserDevelopmentRun`
  * `jsBrowserDevelopmentWebpack`
  * `jsNodeDevelopmentRun`
  * `compileDevelopmentExecutableKotlinJs`
  * `compileDevelopmentLibraryKotlinJs`
  * 名稱中包含 "development" 的其他 Gradle 任務

* 如果你組建*生產環境*打包成品，DCE 則會啟用，對應於以下 Gradle 任務：

  * `jsBrowserProductionRun`
  * `jsBrowserProductionWebpack`
  * `compileProductionExecutableKotlinJs`
  * `compileProductionLibraryKotlinJs`
  * 名稱中包含 "production" 的其他 Gradle 任務

透過 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 註解，你可以指定希望 DCE 視為根節點的宣告。