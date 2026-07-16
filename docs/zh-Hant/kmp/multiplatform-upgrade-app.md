[//]: # (title: 在 iOS 與 Android 之間共享更多邏輯)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
    <br/>
    <p>這是<strong>使用共享邏輯與原生 UI 建立 Kotlin Multiplatform 應用程式</strong>教學的第四部分。在繼續之前，請確保您已完成前面的步驟。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/multiplatform-create-first-app" summary="本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。這是使用共享邏輯與原生 UI 建立 Kotlin Multiplatform 應用程式教學的第一部分。建立您的 Kotlin Multiplatform 應用程式、更新使用者介面、新增相依性、共享更多邏輯、完成您的專案">建立您的 Kotlin Multiplatform 應用程式</Links><br/>
      <img src="icon-2-done.svg" width="20" alt="第二步"/> <Links href="/kmp/multiplatform-update-ui" summary="本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。這是使用共享邏輯與原生 UI 建立 Kotlin Multiplatform 應用程式教學的第二部分。在繼續之前，請確保您已完成前面的步驟。建立您的 Kotlin Multiplatform 應用程式、更新使用者介面、新增相依性、共享更多邏輯、完成您的專案">更新使用者介面</Links><br/>
      <img src="icon-3-done.svg" width="20" alt="第三步"/> <Links href="/kmp/multiplatform-dependencies" summary="本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。這是使用共享邏輯與原生 UI 建立 Kotlin Multiplatform 應用程式教學的第三部分。在繼續之前，請確保您已完成前面的步驟。建立您的 Kotlin Multiplatform 應用程式、更新使用者介面、新增相依性、共享更多邏輯、完成您的專案">新增相依性</Links><br/>
      <img src="icon-4.svg" width="20" alt="第四步"/> <strong>共享更多邏輯</strong><br/>
      <img src="icon-5-todo.svg" width="20" alt="第五步"/> 完成您的專案<br/>
    </p>
</tldr>

既然您已經使用外部相依性實作了通用邏輯，現在可以開始加入更複雜的邏輯。網路請求與資料序列化是使用 Kotlin Multiplatform 共享程式碼[最受歡迎的使用案例](https://kotlinlang.org/lp/multiplatform/)。了解如何在您的第一個應用程式中實作這些功能，以便在完成此引導歷程後，將其應用於未來的專案中。

更新後的應用程式將透過網際網路從 [SpaceX API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) 擷取資料，並顯示 SpaceX 火箭最後一次成功發射的日期。

> 您可以在我們 GitHub 存儲庫的兩個分支中找到專案的最終狀態，分別使用了不同的協同程式解決方案：
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 實作，
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE 實作。
>
{style="note"}

## 新增更多相依性

您需要在專案中新增以下多平台程式庫：

* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines)：用於非同步程式碼的協同程式，允許同步操作。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)：用於將 JSON 回應反序列化為實體類別的物件，以便處理網路操作。
* [Ktor](https://ktor.io/)：一個用於建立 HTTP 用戶端的架構，以便透過網際網路擷取資料。

### kotlinx.coroutines

若要將 `kotlinx.coroutines` 新增到您的專案，請在通用原始碼集中指定相依性。為此，請將以下內容新增至 `shared/build.gradle.kts` 檔案：

```kotlin
kotlin {
    // ... 
    sourceSets {
        commonMain.dependencies {
           // ...
           implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

Kotlin Multiplatform Gradle 外掛程式會自動將相依性新增至 `kotlinx.coroutines` 的平台特定（iOS 與 Android）部分。

### kotlinx.serialization

若要使用 `kotlinx.serialization` 程式庫，請設定對應的 Gradle 外掛程式。
為此，請在 `shared/build.gradle.kts` 檔案開頭的現有 `plugins {}` 區塊中新增以下內容：

```kotlin
plugins {
    // ...
    kotlin("plugin.serialization") version "%kotlinVersion%"
}
```

### Ktor

您需要將核心相依性 (`ktor-client-core`) 新增到共享模組的通用原始碼集中。
您還需要新增支援性的相依性：

* 新增 `ContentNegotiation` 功能 (`ktor-client-content-negotiation`)，它允許對特定格式的內容進行序列化與反序列化。
* 新增 `ktor-serialization-kotlinx-json` 相依性，以指示 Ktor 使用 JSON 格式，並將 `kotlinx.serialization` 作為序列化程式庫。Ktor 在收到回應時會預期 JSON 資料並將其反序列化為資料類別。
* 透過在平台原始碼集 (`ktor-client-android`, `ktor-client-darwin`) 中新增對應構件的相依性來提供平台引擎。

```kotlin
kotlin {
    // ...
    val ktorVersion = "%ktorVersion%"

    sourceSets {
        commonMain.dependencies {
            // ...

            implementation("io.ktor:ktor-client-core:$ktorVersion")
            implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
            implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
        }
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-android:$ktorVersion")
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:$ktorVersion")
        }
    }
}
```

點擊 **Sync Gradle Changes** 按鈕同步 Gradle 檔案。

## 建立 API 請求

您將需要 [SpaceX API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) 來擷取資料，並使用單個方法從 **v4/launches** 端點獲取所有發射清單。

### 新增資料模型

在 `shared/src/commonMain/.../greetingkmp` 目錄中，建立一個新的 `RocketLaunch.kt` 檔案，並新增一個用於儲存 SpaceX API 資料的資料類別：

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RocketLaunch (
    @SerialName("flight_number")
    val flightNumber: Int,
    @SerialName("name")
    val missionName: String,
    @SerialName("date_utc")
    val launchDateUTC: String,
    @SerialName("success")
    val launchSuccess: Boolean?,
)
```

* `RocketLaunch` 類別標記有 `@Serializable` 註解，以便 `kotlinx.serialization` 外掛程式可以自動為其產生預設序列化器。
* `@SerialName` 註解允許您重新定義欄位名稱，從而可以在資料類別中宣告具有更易讀名稱的屬性。

### 連接 HTTP 用戶端

1. 在 `shared/src/commonMain/.../greetingkmp` 目錄中，建立一個新的 `RocketComponent` 類別。
2. 新增 `httpClient` 屬性，透過 HTTP GET 請求擷取火箭發射資訊：

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.serialization.json.Json
    
    class RocketComponent {
        private val httpClient = HttpClient {
            install(ContentNegotiation) {
                json(Json {
                    prettyPrint = true
                    isLenient = true
                    ignoreUnknownKeys = true
                })
            }
        }
    }
    ```

   * Ktor 的 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html#register_json) 外掛程式與 JSON 序列化器會反序列化 GET 請求的結果。
   * 此處的 JSON 序列化器配置為：透過 `prettyPrint` 屬性以更易讀的方式列印 JSON；透過 `isLenient` 在讀取格式不良的 JSON 時更具彈性；並透過 `ignoreUnknownKeys` 忽略火箭發射模型中未宣告的鍵。

3. 在 `RocketComponent` 中新增 `getDateOfLastSuccessfulLaunch()` 掛起函式：

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
       
       }
   }
   ```

4. 呼叫 `httpClient.get()` 函式以擷取火箭發射資訊：

   ```kotlin
   import io.ktor.client.request.get
   import io.ktor.client.call.body

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` = httpClient.get("https://api.spacexdata.com/v4/launches").body()
       }
   }
   ```

   * `httpClient.get()` 也是一個掛起函式，因為它需要透過網路非同步擷取資料而不會阻塞執行緒。
   * 掛起函式只能從協同程式或其他掛起函式中呼叫。這就是為什麼 `getDateOfLastSuccessfulLaunch()` 被標記了 `suspend` 關鍵字。網路請求會在 HTTP 用戶端的執行緒池中執行。

5. 再次更新函式，以在清單中尋找最後一次成功的發射：

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` = httpClient.get("https://api.spacexdata.com/v4/launches").body()
           val lastSuccessLaunch = rockets.last { it.launchSuccess == true }
       }
   }
   ```

   火箭發射清單已按日期從最早到最晚排序。

6. 將發射日期從 UTC 轉換為您的本機日期並格式化輸出：

   ```kotlin
   import kotlinx.datetime.TimeZone
   import kotlinx.datetime.toLocalDateTime
   import kotlin.time.ExperimentalTime
   import kotlin.time.Instant

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` =
               httpClient.get("https://api.spacexdata.com/v4/launches").body()
           val lastSuccessLaunch = rockets.last { it.launchSuccess == true }
           val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
               .toLocalDateTime(TimeZone.currentSystemDefault())
       
           return "${date.month} ${date.day}, ${date.year}"
       }
   }
   ```

   日期格式將為 "MMMM DD, YYYY"，例如 OCTOBER 5, 2022。

7. 新增另一個掛起函式 `launchPhrase()`，它將使用 `getDateOfLastSuccessfulLaunch()` 函式建立訊息：

    ```kotlin
    class RocketComponent {
        // ...
    
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

### 建立 Flow

您可以使用 Flow 取代掛起函式。它們會發射一系列值，而不是掛起函式傳回的單個值。

1. 開啟 `shared/src/commonMain/kotlin` 目錄中的 `Greeting.kt` 檔案。
2. 在 `Greeting` 類別中新增一個 `rocketComponent` 屬性。該屬性將儲存包含最後一次成功發射日期的訊息：

   ```kotlin
   private val rocketComponent = RocketComponent()
   ```

3. 修改 `greet()` 函式以傳回 `Flow`：

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        // ...
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            delay(1.seconds)
            emit(daysPhrase())
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

   * 此處使用 `flow()` 建構函式建立 `Flow`，它封裝了所有陳述式。
   * 此 `Flow` 每隔一秒發射一個字串。最後一個元素僅在網路回應傳回後發射，因此確切的延遲取決於您的網路。

### 新增網際網路存取權限

為了存取網際網路，Android 應用程式需要適當的權限。由於所有網路請求都是從共享模組發出的，因此在該模組的資訊清單中新增網際網路存取權限是合理的。

使用存取權限更新您的 `composeApp/src/androidMain/AndroidManifest.xml` 檔案：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    ...
</manifest>
```

您已經透過將 `greet()` 函式的傳回型別更改為 `Flow` 更新了共享模組的 API。現在您需要更新專案的原生部分，以便它們能夠正確處理呼叫 `greet()` 函式的結果。

## 更新原生 Android UI

由於共享模組和 Android 應用程式都是用 Kotlin 編寫的，從 Android 使用共享程式碼非常簡單。

### 引入 ViewModel

現在應用程式變得更加複雜，是時候為名為 `MainActivity` 的 [Android Activity](https://developer.android.com/guide/components/activities/intro-activities) 引入 ViewModel 了。它會呼叫實作 UI 的 `App()` 函式。ViewModel 將管理來自 Activity 的資料，且在 Activity 經歷生命週期變化時不會消失。

1. 在 `composeApp/src/androidMain/.../greetingkmp` 目錄中，建立一個新的 `MainViewModel` Kotlin 類別：

    ```kotlin
    import androidx.lifecycle.ViewModel
    
    class MainViewModel : ViewModel() {
        // ...
    }
    ```

   此類別繼承了 Android 的 `ViewModel` 類別，這確保了關於生命週期和組態變更的正確行為。

2. 建立一個 [StateFlow](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 型別的 `greetingList` 值及其支援屬性：

    ```kotlin
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    
    class MainViewModel : ViewModel() {
        private val _greetingList = MutableStateFlow<List<String>>(listOf())
        val greetingList: StateFlow<List<String>> get() = _greetingList
    }
    ```

   * 此處的 `StateFlow` 繼承了 `Flow` 介面，但具有單一的值或狀態。
   * 私有支援屬性 `_greetingList` 確保只有此類別的用戶端可以存取唯讀的 `greetingList` 屬性。

3. 在 ViewModel 的 `init` 函式中，收集來自 `Greeting().greet()` Flow 的所有字串：

    ```kotlin
   import androidx.lifecycle.viewModelScope
   import kotlinx.coroutines.launch
   
   class MainViewModel : ViewModel() {
       private val _greetingList = MutableStateFlow<List<String>>(listOf())
       val greetingList: StateFlow<List<String>> get() = _greetingList
       
       init {
           viewModelScope.launch {
               Greeting().greet().collect { phrase ->
                    //...
               }
           }
       }
    }
    ```

   由於 `collect()` 函式是掛起的，因此在 ViewModel 的作用域內使用 `launch` 協同程式。這意味著 `launch` 協同程式僅在 ViewModel 生命週期的正確階段運行。

4. 在 `collect` 尾隨 Lambda 內部，更新 `_greetingList` 的值，將收集到的 `phrase` 附加到 `list` 中的片語清單：

    ```kotlin
    import kotlinx.coroutines.flow.update
   
    class MainViewModel : ViewModel() {
        //...
   
        init {
            viewModelScope.launch {
                Greeting().greet().collect { phrase ->
                    _greetingList.update { list -> list + phrase }
                }
            }
        }
    }
    ```

   `update()` 函式會自動更新值。

### 使用 ViewModel 的 Flow

1. 在 `composeApp/src/androidMain/kotlin` 中，開啟 `App.kt` 檔案並進行更新，取代之前的實作：

    ```kotlin
    import androidx.lifecycle.compose.collectAsStateWithLifecycle
    import androidx.compose.runtime.getValue
    import androidx.lifecycle.viewmodel.compose.viewModel
    
    @Composable
    @Preview
    fun App(mainViewModel: MainViewModel = viewModel()) {
        MaterialTheme {
            val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()
    
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

   * `collectAsStateWithLifecycle()` 函式呼叫 `greetingList` 以從 ViewModel 的 Flow 中收集值，並將其表示為生命週期感知的 composable 狀態。
   * 當新的 Flow 建立時，Compose 狀態將會改變，並顯示一個可捲動的 `Column`，其中包含垂直排列並由分隔線隔開的問候片語。

2. 若要查看結果，請重新執行您的 **composeApp** 配置：

   ![最終結果](multiplatform-mobile-upgrade-android.png){width=300}

## 更新原生 iOS UI

對於專案的 iOS 部分，您將再次利用 [Model–view–viewmodel](https://en.wikipedia.org/wiki/Model–view–viewmodel) 模式將 UI 連接到包含所有商業邏輯的共享模組。

該模組已透過 `import Shared` 宣告匯入到 `ContentView.swift` 檔案中。

### 引入 ViewModel

在 `iosApp/ContentView.swift` 中，為 `ContentView` 建立一個 `ViewModel` 類別，它將為其準備與管理資料。在 `task()` 呼叫中呼叫 `startObserving()` 函式以支援並行：

```swift
import SwiftUI
import Shared

struct ContentView: View {
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            .task { await self.viewModel.startObserving() }
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: `Array<String>` = []
        
        func startObserving() {
            // ...
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

* `ViewModel` 被宣告為 `ContentView` 的擴充，因為它們緊密相連。
* `ViewModel` 具有一個 `greetings` 屬性，它是一個 `String` 片語陣列。SwiftUI 將 ViewModel (`ContentView.ViewModel`) 與視圖 (`ContentView`) 連接起來。
* `ContentView.ViewModel` 被宣告為 `ObservableObject`。
* `@Published` 包裝器用於 `greetings` 屬性。
* `@ObservedObject` 屬性包裝器用於訂閱 ViewModel。

每當此屬性變更時，此 ViewModel 就會發出訊號。現在您需要實作 `startObserving()` 函式來取用 Flow。

### 選擇一個程式庫在 iOS 中取用 Flow

在本教學中，您可以使用 [SKIE](https://skie.touchlab.co/) 或 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 程式庫來協助您在 iOS 中處理 Flow。
兩者都是開源解決方案，支援 Flow 的取消與泛型，而 Kotlin/Native 編譯器目前預設尚未提供這些功能：

* SKIE 程式庫增強了 Kotlin 編譯器產生的 Objective-C API：SKIE 將 Flow 轉換為等同於 Swift 的 `AsyncSequence`。SKIE 直接支援 Swift 的 `async`/`await`，無執行緒限制，並具有自動雙向取消功能（Combine 和 RxSwift 需要適配器）。SKIE 還提供其他功能，以便從 Kotlin 產生 Swift 友善的 API，包括將各種 Kotlin 型別橋接至 Swift 的對等型別。它也不需要在 iOS 專案中新增額外的相依性。
* KMP-NativeCoroutines 程式庫透過產生必要的包裝函式，協助您從 iOS 取用掛起函式與 Flow。KMP-NativeCoroutines 支援 Swift 的 `async`/`await` 功能以及 Combine 和 RxSwift。使用 KMP-NativeCoroutines 需要在 iOS 專案中新增 SPM 或 CocoaPod 相依性。

### 選項 1. 配置 KMP-NativeCoroutines {initial-collapse-state="collapsed" collapsible="true"}

> 我們建議使用程式庫的最新版本。請查看 [KMP-NativeCoroutines 存儲庫](https://github.com/rickclephas/KMP-NativeCoroutines/releases)以確認是否有更新版本的外掛程式可用。
>
{style="note"}

1. 在您專案的根目錄 `build.gradle.kts` 檔案中（**不是** `shared/build.gradle.kts` 檔案），將 KSP (Kotlin Symbol Processor) 與 KMP-NativeCoroutines 外掛程式新增至 `plugins {}` 區塊：

    ```kotlin
    plugins {
        // ...
        id("com.google.devtools.ksp").version("%kspVersion%").apply(false)
        id("com.rickclephas.kmp.nativecoroutines").version("%kmpncVersion%").apply(false)
    }
    ```

2. 在 `shared/build.gradle.kts` 檔案中，新增 KMP-NativeCoroutines 外掛程式：

    ```kotlin
    plugins {
        // ...
        id("com.google.devtools.ksp")
        id("com.rickclephas.kmp.nativecoroutines")
    }
    ```

3. 同樣在 `shared/build.gradle.kts` 檔案中，啟用實驗性的 `@ObjCName` 註解：

    ```kotlin
    kotlin {
        // ...
        sourceSets{
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                    optIn("kotlin.time.ExperimentalTime")
                }
            }
            // ...
        }
    }
    ```

4. 點擊 **Sync Gradle Changes** 按鈕同步 Gradle 檔案。

#### 使用 KMP-NativeCoroutines 標記 Flow

1. 開啟 `shared/src/commonMain/kotlin` 目錄中的 `Greeting.kt` 檔案。
2. 將 `@NativeCoroutines` 註解新增至 `greet()` 函式。這將確保外掛程式產生正確的程式碼，以支援在 iOS 上的 Flow 處理：

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

#### 在 Xcode 中使用 SPM 匯入程式庫

1. 前往 **File** | **Open Project in Xcode**。
2. 在 Xcode 中，右鍵點擊左側功能表中的 `iosApp` 專案，然後選擇 **Add Package Dependencies**。
3. 在搜尋列中輸入套件名稱：

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![匯入 KMP-NativeCoroutines](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. 在 **Dependency Rule** 下拉式功能表中，選擇 **Exact Version** 並在相鄰欄位中輸入 `%kmpncVersion%` 版本。
5. 點擊 **Add Package** 按鈕：Xcode 將從 GitHub 獲取套件並開啟另一個視窗以選擇套件產品。
6. 將 "KMPNativeCoroutinesAsync" 和 "KMPNativeCoroutinesCore" 新增至您的應用程式（如下圖所示），然後點擊 **Add Package**：

   ![新增 KMP-NativeCoroutines 套件](multiplatform-add-package.png){width=500}

這應該會安裝 KMP-NativeCoroutines 套件中配合 `async/await` 機制運作所需的部分。

#### 使用 KMP-NativeCoroutines 程式庫取用 Flow

1. 在 `iosApp/ContentView.swift` 中，更新 `startObserving()` 函式，對 `Greeting().greet()` 函式使用 KMP-NativeCoroutine 的 `asyncSequence()` 函式來取用 Flow：

    ```Swift
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
    ```

   此處使用迴圈與 `await` 機制來逐一查看 Flow，並在 Flow 每發射一個值時更新 `greetings` 屬性。

2. 確保 `ViewModel` 標記有 `@MainActor` 註解。該註解確保 `ViewModel` 內的所有非同步操作都在主執行緒上執行，以符合 Kotlin/Native 的要求：

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: `Array<String>` = []
    
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

### 選項 2. 配置 SKIE {initial-collapse-state="collapsed" collapsible="true"}

若要設定程式庫，請在 `shared/build.gradle.kts` 中指定 SKIE 外掛程式，然後點擊 **Sync Gradle Changes** 按鈕。

```kotlin
plugins {
   id("co.touchlab.skie") version "%skieVersion%"
}
```

> 在撰寫本文時，最新的 0.10.6 版本 SKIE 不支援最新的 Kotlin。若要使用它，請在 `gradle/libs.versions.toml` 檔案中將您的 Kotlin 版本降級為 2.2.10。
> 
{style="warning"}

#### 使用 SKIE 取用 Flow

您將使用迴圈與 `await` 機制來逐一查看 `Greeting().greet()` Flow，並在 Flow 每發射一個值時更新 `greetings` 屬性。

確保 `ViewModel` 標記有 `@MainActor` 註解。該註解確保 `ViewModel` 內的所有非同步操作都在主執行緒上執行，以符合 Kotlin/Native 的要求：

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

### 取用 ViewModel 並執行 iOS 應用程式

在 `iosApp/iOSApp.swift` 中，更新您應用程式的進入點：

```swift
@main
struct iOSApp: App {
   var body: some Scene {
       WindowGroup {
           ContentView(viewModel: ContentView.ViewModel())
       }
   }
}
```

從 IntelliJ IDEA 執行 **iosApp** 配置，以確保您的應用程式邏輯已同步：

![最終結果](multiplatform-mobile-upgrade-ios.png){width=300}

> 您可以在我們 GitHub 存儲庫的兩個分支中找到專案的最終狀態，分別使用了不同的協同程式解決方案：
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 實作，
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE 實作。
>
{style="note"}

## 下一步

在教學的最後一部分，您將完成您的專案，並瞭解接下來該採取哪些步驟。

**[前往下一部分](multiplatform-wrap-up.md)**

### 延伸閱讀

* 探索[組合掛起函式](https://kotlinlang.org/docs/composing-suspending-functions.html)的各種方法。
* 進一步了解 [Objective-C 架構與程式庫的互通性](https://kotlinlang.org/docs/native-objc-interop.html)。
* 完成此關於[網路與資料儲存](multiplatform-ktor-sqldelight.md)的教學。

## 獲取協助

* **Kotlin Slack**。獲取[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**。[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。