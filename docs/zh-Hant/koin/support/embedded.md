---
title: 適用於 SDK 與程式庫的 Koin
---

# 適用於 SDK 與程式庫的 Koin

Koin Embedded 允許 SDK 和程式庫開發人員在不同的套件名稱下重新打包（relocate）Koin 的重定位版本。這樣一來，你的程式庫在內部使用的 Koin 就不會與應用程式中其他任何地方使用的 Koin 發生衝突。本頁面專為程式庫作者設計。若為一般應用程式，請使用標準版 Koin。

獲取重定位後的 Koin 有兩種方式：自助式（使用預建構構件或重定位指令碼），或是 [Koin Embedded LTS](#koin-embedded-lts)——由 Kotzilla 在 [企業支援](/docs/support/#enterprise-support-by-kotzilla) 中為你建置、簽名、託管並維護專屬版本。

## 衝突問題 {id="the-conflict-problem"}

內部使用 Koin 的程式庫會將 `org.koin.*` 作為其相依性關係圖的一部分發佈。這會產生兩個衝突風險，而第二個風險往往容易被忽略。

### 情況 1：與宿主應用程式衝突 {id="case-1-conflict-with-the-host-application"}

使用你的 SDK 的應用程式本身也在使用 Koin，且擁有其自己的發布週期：

```kotlin
// 你的 SDK 使用 Koin 3.5.6
implementation("io.insert-koin:koin-core:3.5.6")

// 使用者應用程式使用 Koin 4.2.2
implementation("io.insert-koin:koin-core:4.2.2")
// 衝突：Gradle 會為兩者解析出單一版本
```

這會導致：

- **單一版本強制套用**：Gradle 會為整個應用程式選擇單一的 `org.koin` 版本，因此雙方之中必然有一方是在從未測試過渡的版本上執行。
- **執行期錯誤**：不同版本之間的 API 變更會在執行期引發崩潰。
- **強迫升級**：你的 SDK 會強迫使用者升級其 Koin 版本，或者阻礙其進行升級。

### 情況 2：與其他 SDK 衝突 {id="case-2-conflict-with-other-sdks"}

你的 SDK 很少是應用程式中唯一的一個。如果另一個廠商的 SDK 也內嵌了 Koin，雙方就會產生衝突，而且雙方都無法控制對方的發布週期：

```kotlin
// 應用程式整合了兩個內部皆使用 Koin 的 SDK
implementation("com.vendor-a:analytics-sdk:2.1.0")  // 內嵌 Koin 3.5.6
implementation("com.vendor-b:payments-sdk:5.0.0")   // 內嵌 Koin 4.2.2
// 同樣的衝突，且鏈條中的任何人都無法修復它
```

這就是為什麼共用的重定位命名空間遠遠不夠。從 `org.koin.*` 遷移到所有內嵌者共用的命名空間，只不過是轉移了衝突點：重定位到相同目標的兩個 SDK 仍會如以往一樣發生衝突。你需要一個專屬於你自己的命名空間。

## 套件重定位（Package relocation） {id="package-relocation"}

重定位會將 Koin 的套件重寫至不同的命名空間，並將其重新建置為獨立的構件：

```kotlin
// 重定位前
import org.koin.core.module.dsl.singleOf
import org.koin.core.context.startKoin

// 重定位後
import acme.koin.core.module.dsl.singleOf
import acme.koin.core.context.startKoin
```

兩個不同的命名空間代表兩組不同的類別，因此它們可以共存而不會產生解析衝突：

```kotlin
// 你的 SDK 打包了專屬的重定位 Koin
implementation("io.insert-koin:acme-koin-core:3.5.6")

// 使用者應用程式使用標準 Koin
implementation("io.insert-koin:koin-core:4.2.2")
// 無衝突：兩個獨立的套件
```

:::warning
請勿將內嵌式 Koin 用於一般應用程式開發。它是專為需要避免相依性衝突的程式庫作者（支付、分析或身分驗證 SDK、共用內部程式庫、第三方整合）所設計。
:::

## 預建構內嵌版本 {id="prebuilt-embedded-version"}

Kotzilla 維護了預建構構件 `embedded-koin-core` 與 `embedded-koin-android`，重定位至共用的 `embedded.koin.*` 命名空間。存取權限需按需求申請：請聯絡 [Koin 團隊](mailto:koin@kotzilla.io)。

:::warning
這些構件處於 Beta 階段，並且使用共用命名空間。它們僅供評估使用，不應用於正式發佈的 SDK。由於每個使用者都重定位到相同的 `embedded.koin.*` 命名空間，若在同一個應用程式中建置兩個基於該構件的 SDK，仍會像使用 `org.koin.*` 時一樣發生衝突（請參閱 [情況 2](#case-2-conflict-with-other-sdks)）。請僅將其用於嘗試重定位，或是用於你具備端到端完整控制權的內部建置。若要向第三方交付 SDK，請使用 [重定位指令碼](#custom-relocation) 自行重定位，或使用 [Koin Embedded LTS](#koin-embedded-lts)。
:::

## 自訂重定位 {id="custom-relocation"}

若要獲得專屬於你的命名空間，請使用重定位指令碼自行重新建置 Koin。

:::warning
這些指令碼屬於 Beta 階段的計畫，按「原樣」提供，不提供維護保證。下游的一切均由你自行負責：建置、驗證、發布，以及在未來每次 Koin 發布（包含安全性修復）時進行重新建置。
:::

### 使用重定位指令碼 {id="using-the-relocation-scripts"}

[koin-relocate](https://github.com/InsertKoinIO/koin-relocate) 專案提供了用於以自訂套件名稱重新建置 Koin 的指令碼。重定位是由字首前綴（prefix）驅動的，會同時套用至套件名稱與模組名稱：

```
RELOCATION_PREFIX=acme   ->   org.koin.*  變為  acme.koin.*
                              koin-core   變為  acme-koin-core
```

步驟如下：

1. 複製（Clone）重定位指令碼存放庫：

   ```bash
   git clone https://github.com/InsertKoinIO/koin-relocate.git
   cd koin-relocate
   ```

2. 編輯 `relocate.properties` 以配置建置：

   ```properties
   RELOCATION_PREFIX=acme
   TARGET_KOIN_VERSION=3.5.6
   KOIN_MODULES=core/koin-core;android/koin-android
   BUILD_DIR=./build
   ```

   - `RELOCATION_PREFIX`：套用至套件與模組名稱的字首。
   - `TARGET_KOIN_VERSION`：作為建置來源的 Koin 版本標籤。
   - `KOIN_MODULES`：要重定位的 Koin 模組。
   - `BUILD_DIR`：建置完成的產物所複製到的目錄。

3. 執行重定位。這會從原始碼複製並重新建置 Koin，且需要 JDK 17 環境：

   ```bash
   ./relocate.sh
   ```

4. 從 `BUILD_DIR` 收集 `aar` 和 `jar` 構件。所有重定位後的模組也會安裝至你的本機 Maven 存儲庫中，以便在測試時立即可用。

5. 將它們發佈到你自己的 Maven 存儲庫，以供你的 SDK 建置使用。

如需詳細說明，請參閱 [koin-relocate 存放庫](https://github.com/InsertKoinIO/koin-relocate)。

### 自行託管所涉及的事項 {id="what-self-hosting-involves"}

使用指令碼可以完成首次建置。但是，將重定位後的 Koin 作為正式發布 SDK 的相依性來執行，是一項長期的承諾。在投入之前請先了解其工作範疇：

- **Koin 的建置結構**：重定位是從原始碼重新建置 Koin。你必須繼承其多模組 Gradle 設定、版本目錄（version catalog）以及工具鏈需求，並且需要一個在 CI 中保持可重現的 JDK 17 環境。
- **不只是套件宣告**：在 Kotlin 原始碼中重寫 `org.koin` 只是最簡單的部分。資源檔案與宣告式服務檔案（例如 `META-INF/services` 項目）同樣包含完全限定名稱。任何重寫所遺漏的內容都會在執行期失敗，而非編譯期。
- **Android 與多平台構件**：`koin-android` 會產生具有專屬清單和使用者規則的 `aar` 構件。在 Kotlin Multiplatform 中，每個目標都會發佈帶有專屬元資料的構件，而重定位後的座標必須在所有目標間保持一致。
- **發布與簽名**：該指令碼會在 `io.insert-koin` 群組下產生帶有字首模組名稱的構件，並安裝至你的本機 Maven 存儲庫。發佈到你所控制的存儲庫足以供內部使用。但公開散布意味著你必須承擔使用者預期的 POM 元資料、群組所有權及簽名責任，因為重定位後的 Koin 現已成為你軟體供應鏈的一部分。
- **驗證等價性**：重定位後的建置行為必須與原始版本完全一致。Koin 自帶的測試套件是針對 `org.koin` 執行的，因此你需要自行確保解析、作用域與生命週期行為在你的 SDK 所使用的 Koin 功能範圍內，於重寫後仍能正常運作。
- **每個 Koin 修補版本都要重複此流程**：上游發佈的每個你需要的新版本（包含所有安全性修復），都意味著需要重新執行重定位、重新建置、驗證、簽名並發布。一次性的重定位只是快照，從你切割它的那天起就開始老化。

這些都不是反對自行託管的理由，但應謹慎評估，而不是在遇到第三個安全性通報時才發現其成本。

### Koin 註解與編譯器外掛程式 {id="koin-annotations-and-the-compiler-plugin"}

:::warning
重定位建置中不支援 Koin Annotations（註解）與 Koin Compiler Plugin（編譯器外掛程式）。
:::

兩者都會產生直接參照 `org.koin` 的程式碼。這些程式碼是在編譯期於你的專案中產生的（此時重定位早已完成），因此它會指向重定位建置不再提供的標準 Koin 套件。重定位指令碼無法重定位自動產生的程式碼。

在重定位建置中，請使用建構函式或經典 DSL（`module { }`、`single`、`factory`、`singleOf`、`factoryOf`）來宣告模組。

## 自助式途徑的限制 {id="limits-of-the-self-service-paths"}

除了 Beta 狀態以及共用命名空間的注意事項外，自助式途徑還具有以下限制：

- **無法使用註解**：無法使用 Koin Annotations 與編譯器外掛程式。
- **受限的模組**：並非所有 Koin 模組都能乾淨俐落地重定位。
- **建置複雜度**：重定位意味著必須自行維護一套建置、驗證與發布管線。
- **維護負擔**：Koin 的每次更新（包含安全性修復），都必須由你自行重定位並重新發布。

最後一點永遠無法避免，而這正是 Koin Embedded LTS 能為你分擔的工作。

## Koin Embedded LTS {id="koin-embedded-lts"}

Koin Embedded LTS 提供專屬於你的 Koin LTS 版本，無衝突問題，並獲得至少 18 個月的維護支援。這是 [Kotzilla 企業支援](/docs/support/#enterprise-support-by-kotzilla) 的一部分。Kotzilla 會為你建置、簽名、託管並維護專屬於你的重定位 Koin，無需自行執行指令碼。

### 專屬版本 {id="your-own-version"}

你將獲得一個僅供你使用、絕無他人的專屬命名空間。Kotzilla 會從受維護的 Koin LTS 分支切出組建，重定位到你的命名空間中進行簽名，並為你的組織託管在私有存儲庫中。你只需新增一個 Maven 存儲庫，即可依賴專屬於你的重定位模組。

你無需執行重定位指令碼、維護建置管線，也無需自行發布構件。

### 無衝突 {id="conflict-free"}

由於命名空間由你獨享，因此無論宿主應用程式或與你的 SDK 一同發布的其他 SDK 執行何種 Koin 版本，或者它們是否內嵌了 Koin，你的內嵌式 Koin 對它們來說都是完全隔離不可見的。兩種自助式途徑都無法提供這種保障：預建構構件在所有使用者間共用同一個命名空間，而自行重定位的命名空間只有在持續修補的情況下才能保持隔離。

### 18 個月的維護支援 {id="18-months-of-maintenance"}

你的組建基於受維護的 LTS 分支（[適用於 Kotlin 1.x 的 Koin 3.5.6，或適用於 Kotlin 2.x 的 Koin 4.2.x](/docs/support/#available-lts-lines)），自指定起享有至少 18 個月的維護期。只要你的訂閱處於有效狀態，針對你所發布的版本支援就會持續進行。

該分支上的每個修補版本（包括安全性反向移植修復）都會重新建置並發佈到你的命名空間。你只需使用自己構件的新版本即可，無需重複執行重定位。

### 涵蓋範疇 {id="scope"}

Koin Embedded LTS 涵蓋 `koin-core` 與 `koin-android`。

上線引導流程包含協助你遷移至 LTS 修補版本層級。如果你目前使用的是該分支的舊版本，此遷移作業屬於初始設定的一部分，無需預先自行處理。

:::note
Embedded LTS 僅基於 LTS 分支建置。重定位任意的 Koin 版本屬於一次性工作：該構件脫離了任何受維護的分支，因此沒有上游修復串流可供重新建置。這類構件將無人修補，而將未修補的 DI 架構編譯進廣泛分發的 SDK，正是本服務旨在防止的問題。只要你的訂閱有效，LTS 分支永遠會有下一個修補版本可供重定位。
:::

請造訪 kotzilla.io 查看 [Koin Embedded LTS](https://kotzilla.io/koin-lts)。

## SDK 開發最佳實務 {id="sdk-development-practices"}

當 Koin 在你的 SDK 內部執行時：

- **保持 Koin 的內部化**：它是你 SDK 的內部實作細節。
- **不要公開 Koin 型別**：切勿將 `KoinComponent`、`Module` 及其他 Koin 型別暴露在 SDK 的公開 API 中。
- **使用隔離的執行個體**：透過 `koinApplication` 為你的 SDK 啟動獨立的 Koin 執行個體，絕不要使用全域的 `startKoin`。請參閱 [情境隔離（Context Isolation）](/docs/reference/koin-core/context-isolation)。
- **鎖定版本**：請依賴精確的重定位版本，切勿使用版本範圍。
- **記錄相依性**：在你的 SDK 文件中註明其在內部使用了 Koin。

將 Koin 作為內部細節使用：

```kotlin
class PaymentSDK private constructor(context: Context) {

    companion object {
        private var instance: PaymentSDK? = null

        fun initialize(context: Context): PaymentSDK {
            return instance ?: PaymentSDK(context).also { instance = it }
        }
    }

    private val koinApp = koinApplication {
        androidContext(context)
        modules(paymentModule)
    }

    private val paymentService: PaymentService = koinApp.koin.get()

    fun processPayment(amount: Double): PaymentResult {
        return paymentService.process(amount)
    }
}
```

避免在公開 API 中公開 Koin：

```kotlin
// 錯誤示範：KoinComponent 與 get() 會洩漏到你的公開 API 中
class PaymentSDK : KoinComponent {
    fun getPaymentService(): PaymentService = get()
}
```

在你的 SDK 文件中註明內部相依性：

```markdown
## Dependencies

This SDK uses Koin internally (embedded version) for dependency injection.
The embedded version is isolated and will not conflict with Koin usage
in your application.

Internal dependency: `io.insert-koin:acme-koin-core:3.5.6`
Package namespace: `acme.koin.*`
```

## 將 SDK 遷移至重定位 Koin {id="moving-an-sdk-to-a-relocated-koin"}

1. **置換相依性**：將 `io.insert-koin:koin-core` 替換為你的重定位座標，例如 `io.insert-koin:acme-koin-core`。
2. **更新匯入陳述式**：將 `import org.koin` 替換為 `import acme.koin`。
3. **將註解替換為 DSL**：如果你的 SDK 使用了 Koin Annotations 或編譯器外掛程式，請使用建構函式或經典 DSL 重寫這些宣告。請參閱 [Koin 註解與編譯器外掛程式](#koin-annotations-and-the-compiler-plugin)。
4. **在真實環境中進行測試**：在同時使用標準 Koin 的應用程式中測試，若你的 SDK 可能面臨此情況，亦請在旁邊放置另一個內嵌 Koin 的 SDK 共同測試。

復原方式步驟相反：還原標準的 `koin-*` 座標以及 `org.koin` 匯入。

## 疑難排解 {id="troubleshooting"}

### 無法解析重定位後的構件 {id="the-relocated-artifact-can-t-be-resolved"}

```
Could not find io.insert-koin:acme-koin-core:3.5.6
```

請檢查重定位後的構件是否已發布，以及你發布該構件的存儲庫是否已在取用端的建置中宣告：

```kotlin
repositories {
    maven("https://maven.acme.com/releases")  // 發布構件的位置
}
```

### 執行期出現 ClassNotFoundException {id="classnotfoundexception-at-runtime"}

請檢查是否在所有位置都使用了重定位後的套件名稱：

```kotlin
// 錯誤
import org.koin.core.context.startKoin

// 正確
import acme.koin.core.context.startKoin
```

如果遺失的類別僅在資源檔或 `META-INF/services` 項目中被參照，則表示重定位遺漏了非原始碼參照。請檢查這些檔案是否也已帶有重定位後的名稱。

### 版本衝突仍然存在 {id="version-conflicts-remain"}

請勿在同一個模組中混用標準版與重定位版 Koin：

```kotlin
// 請勿混用
implementation("io.insert-koin:koin-core:3.5.6")       // 標準版
implementation("io.insert-koin:acme-koin-core:3.5.6")  // 重定位版

// 僅使用你重定位後的組建
implementation("io.insert-koin:acme-koin-core:3.5.6")
```

### 與另一個內嵌 Koin 的 SDK 衝突 {id="conflict-with-another-sdk-that-embeds-koin"}

雙方重定位到了相同的命名空間，最可能的原因是雙方均使用了預建構的 `embedded.koin.*` 構件。其中一方需要使用獨立專屬的命名空間：請自行重定位，或使用 [Koin Embedded LTS](#koin-embedded-lts)。

## 回饋 {id="feedback"}

針對自助式途徑（預建構構件與重定位指令碼）：

- **問題回報**：[koin-relocate GitHub issues](https://github.com/InsertKoinIO/koin-relocate/issues)
- **提問討論**：[Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)
- **電子郵件**：[koin@kotzilla.io](mailto:koin@kotzilla.io)

## 相關內容 {id="related"}

- [版本、藍圖與支援](/docs/support/)：LTS 分支與 Kotzilla 企業支援。
- [情境隔離（Context Isolation）](/docs/reference/koin-core/context-isolation)：在程式庫內部執行私有的 Koin 執行個體。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：`startKoin` 與 `koinApplication`。
- [koin-relocate](https://github.com/InsertKoinIO/koin-relocate)：重定位指令碼與其相關文件。
- [Koin Embedded LTS](https://kotzilla.io/koin-lts)：專屬於你、受長期維護且無衝突的 Koin。