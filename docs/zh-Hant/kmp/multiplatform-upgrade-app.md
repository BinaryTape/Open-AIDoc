[//]: # (title: 原生 UI：REST API 請求的共用邏輯)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

本教學展示如何共用特定業務邏輯的程式碼，同時使用原生程式碼實作各自獨立的 UI。
如需共用邏輯與 UI 的範例，請參閱[完全共用程式碼：時區選擇器應用程式](compose-multiplatform-new-project.md)。

你將建立一個應用程式，從 [Launch Library 2](https://lldev.thespacedevs.com/docs) REST API 擷取最近一次成功進行太空發射的相關資訊並顯示結果。
網路連線與資料序列化程式碼將在 iOS 與 Android 之間共用。

從 Kotlin Multiplatform IDE 精靈建立的專案到最終成品，你將會：

1. [設定通用與平台專屬的相依性](#add-dependencies)
2. [設定 API 請求與用於儲存回應的資料模型](#set-up-api-requests)
3. 在原生 UI 中取用並顯示資料：
   * [更新 Android 原生 UI](#update-native-android-ui) 
   * [更新 iOS 原生 UI](#update-native-ios-ui)。
     你可以嘗試兩種不同的程式庫，將 Kotlin 協同程式整合至 Swift 程式碼中。

> 專案的最終狀態可在我們 GitHub 存儲庫的兩個分支中取得，分別採用不同的 iOS 協同程式解決方案：
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 的實作，
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE（Kotlin-Swift 互通性程式庫）的實作。
>
{style="tip"}

## 建立專案 {id="create-a-project"}

在安裝好 IDE 以及 Kotlin Multiplatform IDE 外掛程式後，建立一個新的 Kotlin Multiplatform 專案：

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側面板中，選取 **Kotlin Multiplatform**。
3. 在 **New Project** 視窗中指定以下欄位：

    * **Name**：GreetingKMP
    * **Project ID**（用作套件名稱）：com.jetbrains.greetingkmp

4. 選取 **Android** 與 **iOS** 目標。
   針對 iOS，選取 **Do not share UI** 選項以保留原生 UI。
5. 點擊 **Create**。

   ![建立 Kotlin Multiplatform 專案](create-first-multiplatform-app.png){width=700}

首次匯入需要幾分鐘的時間。
完成後，請確認所有預先檢查皆為綠色通過狀態（**View | Tool Windows | Projects Environment Preflight Checks**）。

## 檢視專案結構 {id="examine-the-project-structure"}

在 IntelliJ IDEA 中，展開 `GreetingKMP` 資料夾。

此 Kotlin Multiplatform 專案包含以下模組：

* **androidApp** 是一個用於建置 Android 應用程式的 Kotlin 模組。它使用 Gradle 作為建構系統。
  **androidApp** 模組依賴並使用 **sharedLogic** 模組，就像使用一般的 Android 程式庫一樣。
* **iosApp** 是用於建置 iOS 應用程式的 Xcode 專案。
* **sharedLogic** 是一個多平台模組，包含 Android 與 iOS 應用程式共用的邏輯。
* **sharedUI** 是包含使用 Compose Multiplatform 實作 UI 程式碼的模組。
  在此專案中，**sharedUI** 僅由 Android 應用程式使用，但只要有需要，隨時可以擴充至其他目標。
  在 Android 上，[Compose Multiplatform 呼叫會直接轉換為 Jetpack Compose](compose-multiplatform-jetpack-libraries.md)，
  因此在這種特殊設定下不會產生任何額外開銷。

除 **iosApp** 外的每個模組都使用 Gradle 作為建構系統。
**iosApp** 模組則是使用 Xcode 建置，它會叫用 Kotlin Gradle 建置，從 **sharedLogic** 模組建立一個 iOS 框架。
這是 Kotlin Multiplatform 中*直接 iOS 整合*的一個範例。

> 若要進一步了解如何針對 iOS 建置 Kotlin，請參閱 [iOS 整合方法](multiplatform-ios-integration-overview.md)。
> 
{style="tip"}

## 新增相依性 {id="add-dependencies"}

你的專案需要以下多平台程式庫：

* [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime)，用於處理與格式化時間戳記。
* [Ktor](https://ktor.io/)，一個用於透過 HTTP 傳送與擷取資料的架構。
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines)，用於透過協同程式 Flow 非同步處理網路呼叫。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)，用於將 API 的 JSON 回應還原序列化為 Kotlin 物件。

所有平台專屬的程式碼都已封裝在程式庫的平台產物中，
因此你不需要親自實作平台專屬的呼叫。

原生 iOS UI 將需要額外的程式庫，以在 Swift 與 Kotlin 之間銜接非同步程式碼。
這部分組態將在通用 API 準備好取用後，於 [更新 iOS 原生 UI](#update-native-ios-ui) 一節中介紹。

### 更新 Gradle 版本目錄 {id="update-the-gradle-version-catalog"}

將以下項目新增至 `gradle/libs.versions.toml`，然後同步 Gradle 檔案，使這些參照在組建組態程式碼中可用：

```toml
[versions]
# ...
kotlinx-coroutines = "%coroutinesVersion%"
kotlinx-datetime = "%dateTimeVersion%"
ktor = "%ktorVersion%"

[libraries]
# ...
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }

[plugins]
# ...
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 將相依性新增至對應的原始碼集 {id="add-dependencies-to-corresponding-source-sets"}

在 `sharedLogic/build.gradle.kts` 檔案中，將程式庫參照新增至對應的原始碼集：

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle 外掛程式會
            // 自動新增協同程式與 datetime 的平台專屬構件
            implementation(libs.kotlinx.coroutines)
            implementation(libs.kotlinx.datetime)
            // 主要 Ktor 相依性
            implementation(libs.ktor.client.core)
            // 允許 Ktor 使用特定格式進行序列化的相依性
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
        }
        androidMain.dependencies {
            // 提供 Ktor 的 Android 引擎
            implementation(libs.ktor.client.android)
        }
        iosMain.dependencies {
            // 提供 Ktor 的 Darwin 引擎
            implementation(libs.ktor.client.darwin)
        }
    }
}
```

同步 Gradle 檔案：按兩下 **Shift 鍵**，然後尋找並執行 **Sync Project with Gradle Files** 指令。

> 如需有關如何管理多平台相依性的詳細資訊，
> 請參閱[新增多平台程式庫的相依性](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 設定 API 請求 {id="set-up-api-requests"}

你將使用 [Launch Library API](https://lldev.thespacedevs.com/docs) 來擷取資料，
具體來說是從 **/2.3.0/launches** 端點擷取發射清單。

### 建立資料模型 {id="create-a-data-model"}

在 `sharedLogic/src/commonMain/.../greetingkmp` 目錄中，建立一個新的 `RocketLaunch.kt` 檔案，
並新增一個儲存來自 Launch Library API 資料的資料類別：

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// @Serializable 指示 kotlinx.serialization 外掛程式
// 自動為該類別產生預設的序列化器
@Serializable
data class RocketLaunch(
    // @SerialName 重新定義欄位名稱，使屬性名稱
    // 在序列化格式中更具可讀性
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val missionName: String,
    @SerialName("net")
    val launchDateUTC: String,
    @SerialName("status")
    val status: LaunchStatus,
)

@Serializable
data class LaunchStatus(
    @SerialName("id")
    val id: Int,
    @SerialName("name")
    val name: String,
)

@Serializable
data class LaunchListResponse(
    @SerialName("results")
    val results: List<RocketLaunch>,
)
```

### 連接 HTTP 用戶端 {id="connect-http-client"}

1. 在 `sharedLogic/src/commonMain/.../greetingkmp` 目錄中，建立一個新的 `RocketComponent` 類別。
2. 新增 `httpClient` 屬性，並使用它根據 HTTP GET 請求的結果建構最終字串：

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.call.body
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.client.request.get
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.toLocalDateTime
    import kotlinx.serialization.json.Json
    import kotlin.time.Instant
    
    class RocketComponent {
        private val httpClient = HttpClient {
            // ContentNegotiation Ktor 外掛程式與 JSON 序列化器
            // 會將 GET 請求的結果還原序列化
            install(ContentNegotiation) {
                json(Json {
                    // 產生更具可讀性的 JSON
                    prettyPrint = true
                    // 允許非標準的 JSON 輸入，
                    // 例如未加引號的鍵與字串值
                    isLenient = true
                    // 忽略模型中未宣告的鍵
                    ignoreUnknownKeys = true
                })
            }
        }

        // 傳回最新一次成功發射的日期字串。
        // 標記為 suspending，因為它呼叫了
        // suspending 的 httpClient.get() 函式
        private suspend fun getDateOfLastSuccessfulLaunch(): String {
            // 非同步擷取火箭發射的相關資訊
            val response: LaunchListResponse =
                httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
            // 取得最新一次成功的發射。
            // 在回應中，發射記錄從最新到最舊排序，
            // 且成功的發射會標記 'status.id' 為 3
            val lastSuccessLaunch = response.results.first { it.status.id == 3 }
            // 將發射時間戳記轉換為當地時間
            val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
                .toLocalDateTime(TimeZone.currentSystemDefault())

            // 日期以 "MMMM D, YYYY" 格式顯示，
            // 例如 "JULY 15, 2026"
            return "${date.month} ${date.day}, ${date.year}"
        }

        // 使用 suspending 的 getDateOfLastSuccessfulLaunch() 函式
        // 建構用於 UI 的最終字串
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

   Suspending 函式只能從協同程式或其他 suspending 函式中呼叫。
   例如，`httpClient.get()` 是一個 suspending 函式，因為它需要透過網路非同步擷取資料而不阻塞執行緒。
   由於 `getDateOfLastSuccessfulLaunch()` 函式呼叫了 `httpClient.get()`，因此它也標記了 `suspend` 關鍵字。

### 建立協同程式 Flow {id="create-a-coroutine-flow"}

除了單純呼叫 suspending 函式之外，當你需要產生一系列的值時，也可以使用 [Flow](https://kotlinlang.org/docs/flow.html)。
Flow 可以在產生數值時依序發出值，而不是像 suspending 函式那樣只傳回單一值。

1. 開啟 `sharedLogic/src/commonMain/kotlin` 目錄中的 `Greeting.kt` 檔案。
2. 更新 `Greeting` 類別中的 `greet()` 函式以傳回字串的 `Flow`，主要用於配合網路請求。
   在 `Flow` 中，使用 `RocketComponent` 屬性發出發射日期：

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.random.Random
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        private val platform = getPlatform()
   
        // 儲存最新一次成功發射的日期
        private val rocketComponent = RocketComponent()
        // 逐一建構並非同步發出問候字串
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

    該 `Flow` 是使用包裝了可掛起區塊的 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 建構函式建立的。

`greet()` 函式現在傳回 `Flow<String>` 而不是單一的 `String`。
你的原生 UI 程式碼將匯入 `Greeting` 類別並收集 `greet()` 函式發出的字串。

請按照以下各節所示，在原生 UI 中實作對應的變更。

## 更新 Android 原生 UI {id="update-native-android-ui"}

由於共用模組與 Android 應用程式皆以 Kotlin 編寫，因此從 Android 使用共用程式碼非常直覺簡單。

### 引入 ViewModel {id="introduce-a-view-model"}

在 Android 開發中，ViewModel 通常用於在 [Android Activity](https://developer.android.com/guide/components/activities/intro-activities) 的整個生命週期中管理 UI 相關的資料。
你的應用程式變得越來越複雜，因此也可以從 ViewModel 中獲益。
ViewModel 將儲存從 Launch Library API 收到的資料，並將其提供給 UI。

在 `sharedUI/src/commonMain/.../greetingkmp` 目錄中，建立一個新的 `MainViewModel` 類別，該類別繼承自多平台 AndroidX 程式庫的 `[ViewModel](https://developer.android.com/reference/kotlin/androidx/lifecycle/ViewModel)`，以使用 Android 的生命週期機制與組態追蹤：

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainViewModel: ViewModel() {
    // StateFlow 是一個持有單一當前狀態值的 Flow
    val greetingList: StateFlow<List<String>>
        // 明確的支援欄位在類別外部是唯讀的，
        // 在內部則是可變的
        field = MutableStateFlow<List<String>>(listOf())

    // 收集 Greeting().greet() 呼叫所發出的所有字串
    init {
        // 在此 ViewModel 所擁有的協同程式中啟動收集。
        // 它在 ViewModel 保留期間保持作用中，
        // 並在 ViewModel 清除時自動取消。
        viewModelScope.launch {
            // 將每個新短語附加到 greetingList
            Greeting().greet().collect { phrase ->
                greetingList.update { list -> list + phrase }
            }
        }
    }
}
```

### 使用 ViewModel 的 Flow {id="use-the-view-model-s-flow"}

在 `sharedUI/src/commonMain/.../greetingkmp` 中，開啟 `App.kt` 檔案，
並取代原有的實作以使用新實作的 ViewModel。

隨著 Flow 發出新值，組合（composition）會更新並逐一顯示問候短語：

```kotlin
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.HorizontalDivider
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App(mainViewModel: MainViewModel = viewModel()) {
    MaterialTheme {
        // 從 ViewModel 的 Flow 收集 greetingList 的值，
        // 並以感知生命週期的方式將其表示為可組合狀態
        val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()

        // 將問候短語呈現為一個欄（Column），以分隔線分隔
        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            greetings.forEach { greeting ->
                Text(greeting)
                HorizontalDivider()
            }
        }
    }
}
```

### 新增網際網路存取權限 {id="add-internet-access-permission"}

若要允許 Android 應用程式存取網際網路，
請將以下權限新增至 `androidApp/src/main/AndroidManifest.xml` 檔案中：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <!-- The rest of the manifest -->
</manifest>
```

### 執行應用程式 {id="run-the-app"}

若要查看最終結果，請執行你的 **androidApp** 运行配置。

> 有關建立新模擬器或在實體裝置上執行應用程式的詳細資訊，請參閱[建置與執行 Kotlin Multiplatform 應用程式](build-and-run-kmp.md)。
>
{style="note"}

![Android 最終結果](multiplatform-mobile-upgrade-android.png){width=350}

## 更新 iOS 原生 UI {id="update-native-ios-ui"}

針對專案的 iOS 部分，你將使用 ViewModel 模式（就像在 Android 應用程式中所做的那樣）將 UI 連接至 `sharedLogic` 模組。
該模組已經透過 `import SharedLogic` 宣告匯入至 `ContentView.swift` 檔案中。

iOS 應用程式的程式碼位於 `iosApp/iosApp` 目錄中：
`ContentView.swift` 包含大部分的邏輯，而 `iOSApp.swift` 則包含應用程式的入口點。

### 引入 `ViewModel` {id="introduce-a-viewmodel"}

在 `iosApp/ContentView.swift` 檔案中，為 `ContentView` 建立一個 `ViewModel` 類別，用於準備與管理其資料。
使用以下程式碼取代整個檔案的內容：

```swift
import SwiftUI
import SharedLogic

struct ContentView: View {
    // 讓視圖訂閱在下方宣告為
    // ObservableObject 的 ViewModel
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            // 呼叫 startObserving() 函式，
            // 搭配 .task 修飾符以支援並行
            .task { await self.viewModel.startObserving() }
    }
}

// ViewModel 宣告為 ContentView 的擴充，
// 因為它們緊密相連
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        // 此屬性用於保存 ViewModel 的 Flow 所發出的
        // 問候短語
        @Published var greetings: [String] = []
        
        func startObserving() {
            // 實作取決於所選的 iOS 協同程式程式庫（見下文）
        }
    }
}

struct ListView: View {
    let phrases: Array<String>

    var body: some View {
        List(phrases, id: \.self) {
            Text($0)
        }
    }
}
```

SwiftUI 將 ViewModel（`ContentView.ViewModel`）與視圖（`ContentView`）連接在一起：

* `ContentView.ViewModel` 類別被宣告為 `ObservableObject`，這讓它能夠回報變更。
  `ContentView` 中 `viewModel` 屬性的 `@ObservedObject` 包裝函式讓視圖訂閱這些變更。
* 帶有 `@Published` 包裝函式的 `greetings` 屬性發生變更時，會觸發 SwiftUI 更新 `ContentView`。

現在你需要使用可用於在 Swift 中取用 Kotlin Flow 的其中一個 KMP 程式庫來實作 `startObserving()` 函式。

### 選擇在 Swift 中取用 Kotlin Flow 的程式庫 {id="choose-a-library-for-consuming-kotlin-flows-in-swift"}

在本教學中，你可以使用 [SKIE](https://skie.touchlab.co/) 或 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 程式庫來協助你在 iOS 中處理 Flow。
兩者都是開源解決方案，支援 Flow 的取消與泛型，而這些功能是 Kotlin/Native 編譯器預設尚未提供的：

* KMP-NativeCoroutines 程式庫透過產生必要的包裝函式，協助你從 iOS 取用 suspending 函式與 Flow。
  KMP-NativeCoroutines 支援 Swift 的 `async`/`await` 功能以及 Combine 和 RxSwift。
  使用 KMP-NativeCoroutines 需要在 iOS 專案中新增 SwiftPM 或 CocoaPod 相依性。
* SKIE 程式庫增強了 Kotlin 編譯器所產生的 Objective-C API：SKIE 將 Flow 轉換為等同於 Swift 的 `AsyncSequence`。SKIE 直接支援 Swift 的 `async`/`await`，沒有執行緒限制，並具備自動雙向取消機制（Combine 與 RxSwift 則需要介接配接器）。SKIE 還提供其他功能，從 Kotlin 產生對 Swift 友好的 API，包括將各種 Kotlin 型別橋接為 Swift 等效型別。它也不需要在 iOS 專案中新增額外的相依性。

  > 最新版的 SKIE 可能不支援最新的穩定版 Kotlin。
  > 請查看[最新版本的更新日誌](https://skie.touchlab.co/category/changelog)，
  > 以確認應降級至哪個 Kotlin 版本。

### 選項 1. 設定 KMP-NativeCoroutines {initial-collapse-state="collapsed" collapsible="true" id="option-1-configure-kmp-nativecoroutines"}

更新組建指令碼以納入 KMP-NativeCoroutines 相依性：

1. 將 KMP-NativeCoroutines 版本與外掛程式參照新增至 Gradle [版本目錄](https://docs.gradle.org/current/userguide/version_catalogs.html)：

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. 在專案的根目錄 `build.gradle.kts` 檔案中（**不是** `sharedLogic/build.gradle.kts` 檔案），將 KMP-NativeCoroutines 外掛程式新增至 `plugins {}` 區塊：

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines) apply false
    }
    ```

3. 在 `sharedLogic/build.gradle.kts` 檔案中，將 KMP-NativeCoroutines 外掛程式新增至 `plugins {}` 區塊：

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines)
    }
    ```

4. 在同一個 `sharedLogic/build.gradle.kts` 檔案中，選擇採用實驗性 `@ObjCName` 註解：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. 按兩下 **Shift 鍵**，然後尋找並執行 **Sync Project with Gradle Files** 指令。

#### 使用 KMP-NativeCoroutines 標記 Flow {id="mark-the-flow-with-kmp-nativecoroutines"}

1. 開啟 `sharedLogic/src/commonMain/kotlin` 目錄中的 `Greeting.kt` 檔案。
2. 為 `greet()` 函式新增 `@NativeCoroutines` 註解。
   這會使外掛程式產生支援在 iOS 上正確處理 Flow 的程式碼：

   ```kotlin
    import com.rickclephas.kmp.nativecoroutines.NativeCoroutines
    
    class Greeting {
        // ...
       
        @NativeCoroutines
        fun greet(): Flow<String> = flow {
            // ...
        }
    }
    ```

#### 在 Xcode 中使用 SwiftPM 匯入程式庫

安裝與 `async/await` 機制搭配運作所需的 KMP-NativeCoroutines Swift 套件組件：

1. 前往 **File | Open Project in Xcode**。
2. 在 Xcode 中，於左側選單的 `iosApp` 專案上按一下滑鼠右鍵，然後選取 **Add Package Dependencies**。
3. 在搜尋列中輸入套件名稱：

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![匯入 KMP-NativeCoroutines](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. 在 **Dependency Rule** 下拉式功能表中，選取 **Exact Version** 項目，並在相鄰欄位中輸入 `%kmpncVersion%` 版本。
5. 點擊 **Add Package** 按鈕。Xcode 將從 GitHub 擷取套件，並開啟另一個視窗以供選擇套件產品。
6. 如圖所示，將 **KMPNativeCoroutinesAsync** 與 **KMPNativeCoroutinesCore** 新增至你的應用程式，然後點擊 **Add Package**：

   ![新增 KMP-NativeCoroutines 套件](multiplatform-add-package.png){width=500}
7. 返回 IntelliJ IDEA 並選取 **Tools | Swift Package Manager | Resolve Dependencies**。
   這會建立一個 `Package.resolved` 鎖定檔案，供 Kotlin Multiplatform 建置任務使用，
   並可提交至存儲庫以保持 Swift 套件版本的一致性。

#### 使用 KMP-NativeCoroutines 程式庫取用 Flow

1. 在 `iosApp/ContentView.swift` 中更新 `startObserving()` 函式，以使用來自 KMP-NativeCoroutines 的 `asyncSequence()` 函式取用 Flow：

    ```swift
    func startObserving() async {
        do {
            // 取用來自 Kotlin 的 Greeting().greet() 發出的 Flow
            let sequence = asyncSequence(for: Greeting().greet())
            for try await phrase in sequence {
                self.greetings.append(phrase)
            }
        } catch {
            print("Failed with error: \(error)")
        }
    }
    ```

   此處使用迴圈與 `await` 機制來遍歷 Flow，並在 Flow 每次發出值時更新 `greetings` 屬性。

2. 確認 `ViewModel` 已標記 `@MainActor` 註解：

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        // 確保 `ViewModel` 內的所有非同步操作
        // 都在應用程式的主要 UI 上下文中執行。
        // 這可避免對 `@Published` 屬性的更新
        // 未反映在 UI 中。
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: [String] = []
    
            func startObserving() async {
                do {
                    let sequence = asyncSequence(for: Greeting().greet())
                    for try await phrase in sequence {
                        self.greetings.append(phrase)
                    }
                } catch {
                    print("Failed with error: \(error)")
                }
            }
        }
    }
    ```

在建置專案之前，此處的 `@MainActor` 可能會產生未解析的參照錯誤，
建置專案將使 Kotlin 符號（具體而言是 `greet()`）與 iOS 專案相依性保持同步。

> 如果出現建置錯誤，請確認 Kotlin 與 KMP-NativeCoroutines 的版本相容：
> Gradle 外掛程式版本與 Swift 套件版本皆應根據[相容性對照表](https://github.com/rickclephas/KMP-NativeCoroutines#compatibility)進行設定。
>
{style="warning"}

### 選項 2. 設定 SKIE {initial-collapse-state="collapsed" collapsible="true"}

若要設定該程式庫，請將 SKIE 版本與外掛程式參照新增至 Gradle 版本目錄：

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE 可能不支援最新的穩定版 Kotlin。
> 如果你的 Kotlin 版本過新，系統會在 Gradle 同步期間回報此情況，並列出可安全降級的版本清單。
> 
{style="note"}

然後將其新增至 `sharedLogic/build.gradle.kts` 檔案的外掛程式清單中：

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

按兩下 **Shift 鍵**，然後尋找並執行 **Sync Project with Gradle Files** 指令。

#### 使用 SKIE 取用 Flow {id="consume-the-flow-using-skie"}

你將使用迴圈與 `await` 機制來遍歷 `Greeting().greet()` Flow，並在 Flow 每次發出值時更新 `greetings` 屬性。

確認 `ViewModel` 已標記 `@MainActor` 註解。
該註解確保 `ViewModel` 內的所有非同步操作都在主執行緒上執行，以符合 Kotlin/Native 的要求：

```Swift
// ...
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: [String] = []

        func startObserving() async {
            for await phrase in Greeting().greet() {
                self.greetings.append(phrase)
            }
        }
    }
}
```

### 取用 ViewModel 並執行 iOS 應用程式 {id="consume-the-viewmodel-and-run-the-ios-app"}

在 `iosApp/iOSApp.swift` 中，更新應用程式的入口點：

```swift
import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: ContentView.ViewModel())
        }
    }
}
```

從 IntelliJ IDEA 執行 **iosApp** 組態，確保應用程式的邏輯已完成同步。

> 有關建立新模擬器或在實體裝置上執行應用程式的詳細資訊，請參閱[建置與執行 Kotlin Multiplatform 應用程式](build-and-run-kmp.md)。
>
{style="note"}

![最終結果](multiplatform-mobile-upgrade-ios.png){width=350}

## 專案的最終狀態 {id="final-state-of-the-project"}

你可以在我們 GitHub 存儲庫的兩個分支中找到專案的最終狀態，分別採用不同的協同程式解決方案：
* [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 實作，
* [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE 實作。

## 可能的問題與解決方案 {id="possible-issues-and-solutions"}

### Xcode 回報呼叫共用架構的程式碼發生錯誤 {id="xcode-reports-errors-in-the-code-calling-the-shared-framework"}

如果你在 Xcode 中作業，你的 Xcode 專案可能正在使用舊版本的框架。
若要解決此問題，請返回 IntelliJ IDEA 或 Android Studio，重新建置專案或啟動 iOS 运行配置。

### Xcode 在匯入共用架構時回報錯誤 {id="xcode-reports-an-error-when-importing-the-shared-framework"}

如果你正在使用 Xcode，可能需要清除快取的二進位檔：嘗試在主選單中選取 **Product | Clean Build Folder** 以重設環境。

## 後續步驟 {id="what-s-next"}

* 請參閱[另一個教學](compose-multiplatform-new-project.md)，其中 UI 程式碼也是共用的。
* 若要了解 Kotlin Multiplatform 支援的各種共用程式碼方法，請參閱[在平台之間共用程式碼](multiplatform-share-on-platforms.md)。
* 了解 [Kotlin Multiplatform 專案結構背後的原理](multiplatform-discover-project.md)。
* 如需有關如何管理多平台相依性的詳細資訊，請參閱[新增多平台程式庫的相依性](multiplatform-add-dependencies.md)。
* 了解 Kotlin Multiplatform 專案如何[與 iOS 應用程式整合](multiplatform-ios-integration-overview.md)。
* 按照關於[網路連線與資料儲存](multiplatform-ktor-sqldelight.md)的教學建立更複雜的 KMP 應用程式。
* [查看精選的多平台範例專案清單](multiplatform-samples.md)。
* 探索各種[組合 suspending 函式的方法](https://kotlinlang.org/docs/coroutines-basics.html)。

## 取得協助 {id="get-help"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：取得協助並參與關於 KMP 與 Compose Multiplatform 的討論。
  申請[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**：[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。