---
title: 編譯器外掛程式選項
---

# 編譯器外掛程式選項

此頁面列出了 Koin 編譯器外掛程式的所有選項，這些選項設定於 `build.gradle.kts` 的 `koinCompiler { }` 區塊中。本文假設外掛程式已安裝（請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin)）。這些選項同時適用於編譯器外掛程式 DSL 與註解。

## 所有選項 {id="all-options"}

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

koinCompiler {
    compileSafety = true
    skipDefaultValues = true
    unsafeDslChecks = true
    userLogs = false
    debugLogs = false
}
```

| 選項 | 型別 | 預設值 | 效果 |
|--------|------|---------|--------|
| `compileSafety` | Boolean | `true` | 在建置期驗證相依圖 |
| `strictSafety` | Boolean | 自動偵測 | 在聚合模組的每次建置中重新執行完整圖檢查 |
| `strictSafetyForceOff` | Boolean | `false` | 確認錯誤的 `strictSafety` 自動偵測並將其關閉 |
| `skipDefaultValues` | Boolean | `true` | 使用 Kotlin 預設值，而不是解析這些參數 |
| `unsafeDslChecks` | Boolean | `true` | 要求 `create()` 必須是其 Lambda 中的唯一指令 |
| `userLogs` | Boolean | `false` | 記錄外掛程式偵測到的組建 |
| `debugLogs` | Boolean | `false` | 記錄外掛程式內部資訊 |
| `logSeverity` | String | `"warning"` | 外掛程式資訊輸出的嚴重等級 |
| `versionCheckSeverity` | String | `"warning"` | Kotlin 版本相容性警告的嚴重等級 |
| `aiAssist` | Boolean | `true` | 在包含 Koin 診斷的建置結尾新增一行說明 |

## compileSafety {id="compilesafety"}

啟用時，外掛程式會在建置期檢查圖中的每個相依項是否都能被解析：遺漏的定義、限定詞不符、循環相依性，以及沒有相符定義的 `get()` 或 `inject()` 呼叫點。發生問題時會使建置失敗，而不是在執行階段發生崩潰。

```kotlin
koinCompiler {
    compileSafety = false
}
```

請保持其啟用狀態。關閉它會移除所有編譯期檢查，並使 `strictSafety` 失效。檢查內容在 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) 中有詳細說明。

## strictSafety {id="strictsafety"}

完整圖檢查會在啟動 Koin 的模組中執行（即聚合器：包含 `startKoin`、`koinApplication` 或 `@KoinApplication` 的 Gradle 模組）。當圖在其他位置變更時（例如編輯 `module { }` Lambda 主體後），Kotlin 累加編譯可能會將該模組標記為最新（up to date）。此時檢查將不會再次執行，錯誤將會在執行階段才顯現。

`strictSafety` 會使聚合器的 `compileKotlin` 任務在每次建置時重新執行，不使用建置快取且不跳過最新狀態。程式庫與功能模組則保持累加編譯。

您不需要設定它。當未設定此選項時，Gradle 外掛程式會掃描模組原始碼中的 `startKoin`、`koinApplication` 或 `@KoinApplication`，並為該模組啟用它。生命週期記錄會宣告此決策：

```
[Koin] Auto-enabling strictSafety on :app (detected startKoin / @KoinApplication / koinApplication).
```

在偵測遺漏的模組上設定 `strictSafety = true` 來強制啟用：

```kotlin
koinCompiler {
    strictSafety = true
}
```

在已偵測到入口點的模組上設定 `strictSafety = false` 沒有效果（自編譯器外掛程式 1.1.0 起）。它僅對未偵測到入口點的模組有作用。當 `compileSafety = false` 時，此選項沒有作用。

其代價是每次建置都要對聚合模組進行一次完整重新編譯。有關累加編譯落差的背景資訊，請參閱 [koin-compiler-plugin issue #32](https://github.com/InsertKoinIO/koin-compiler-plugin/issues/32)。

## strictSafetyForceOff {id="strictsafetyforceoff"}

偵測採用的是文字比對。它也會比對註解或字串常值中的 `startKoin`，從而為非聚合模組啟用 `strictSafety`。如果您已確認此比對有誤，請同時設定這兩個選項：

```kotlin
koinCompiler {
    strictSafety = false
    strictSafetyForceOff = true
}
```

兩者都需要：`strictSafetyForceOff` 僅在與 `strictSafety = false` 一起使用時生效。請僅在確認誤觸時使用。如果是在真正的入口點上使用，它會停用重新執行，導致累加編譯後的圖錯誤可能延遲至執行階段才暴露。

## skipDefaultValues {id="skipdefaultvalues"}

啟用時，具有 Kotlin 預設值的不可為 null 參數會保留其預設值，而不會從 Koin 解析：

```kotlin
@Singleton
class ApiClient(
    val repository: UserRepository,                         // resolved from Koin
    val timeout: Int = 30_000,                              // Kotlin default
    @Property("api_url") val url: String = "https://...",   // resolved, it is annotated
    val logger: Logger? = null,                             // resolved with getOrNull()
)
```

可為 null 的參數仍會使用 `getOrNull()` 進行解析。帶有 `@Named`、`@Qualifier`、`@InjectedParam` 或 `@Property` 的參數無論其預設值為何，一律會進行解析。設定 `skipDefaultValues = false` 可從 Koin 解析所有參數。

## unsafeDslChecks {id="unsafedslchecks"}

啟用時，`create(::T)` 呼叫必須是其定義 Lambda 中的唯一指令。這能讓 Lambda 保持為外掛程式可分析與驗證的形式。違規將會導致建置失敗：

```
[Koin][KOIN-S001] create(::UserRepository) must be the only instruction in the lambda. Other statements are not allowed when using create(). To disable this check, set koinCompiler { unsafeDslChecks = false } in your build.gradle.kts
```

當您遷移在 `create()` Lambda 中執行其他陳述式的傳統 DSL 程式碼時，請將其設為 `false`，遷移完成後再將其重新開啟。

## userLogs 與 debugLogs {id="userlogs-and-debuglogs"}

`userLogs = true` 會印出外掛程式偵測並處理的內容：它攔截的 DSL 定義（`single<T>()`、`factory<T>()`）、帶有註解的類別（`@Singleton`、`@Module`）以及產生的模組。當定義未被採納時可以使用此選項。

`debugLogs = true` 會印出外掛程式內部資訊（FIR 與 IR 階段、模組探索）。當您回報外掛程式錯誤時可以使用此選項。

兩者都會印出帶有 `[Koin]` 前置詞的行，嚴重等級由 `logSeverity` 設定。

## logSeverity 與 versionCheckSeverity {id="logseverity-and-versioncheckseverity"}

兩者皆接受 `"warning"`（預設值）或 `"info"`。

```kotlin
koinCompiler {
    logSeverity = "info"
    versionCheckSeverity = "info"
}
```

- **logSeverity**：資訊輸出的嚴重等級（`userLogs`、`debugLogs`、「無 Koin 入口點」通知、`@Monitor` 摘要）。如果您的組建使用 `allWarningsAsErrors`，請將其設為 `"info"`，以免此輸出導致建置失敗。
- **versionCheckSeverity**：使用外掛程式尚未驗證過的 Kotlin 版本進行建置時所顯示的警告嚴重等級。此設定為獨立分開的，因此將記錄輸出靜音時不會同時隱藏相容性風險。僅在您確認您的 Kotlin 版本能正常運作後，才將其設為 `"info"`。

這兩個選項都不會改變實際的診斷（`KOIN-D001`、`KOIN-W003` 等）：它們會保留自己的嚴重等級。

## aiAssist {id="aiassist"}

當建置回報至少一個 Koin 診斷時，外掛程式會在編譯結尾新增一行，指向 Kotzilla MCP Server，AI 編碼協助工具可使用該伺服器來對錯誤進行分類並提出修復建議：

```
[Koin] → Fix with AI: set up Kotzilla MCP at https://kotzilla.io/koin-mcp
```

此行在每次建置中僅出現一次，而非每個錯誤出現一次。設定 `aiAssist = false` 可將其隱藏。

## 相關內容 {id="related"}

- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：`compileSafety` 檢查的項目及其回報的診斷。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安裝外掛程式及其相依性。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：外掛程式的功能與運作原理。
- [Troubleshooting](/docs/reference/koin-core/troubleshooting)：執行階段錯誤與偵錯。