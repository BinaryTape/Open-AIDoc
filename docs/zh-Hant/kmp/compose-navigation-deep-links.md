[//]: # (title: 深層連結)

深層連結（Deep linking）是一種導覽機制，允許作業系統透過引導使用者前往對應應用程式中的特定目的地來處理自訂連結。

深層連結是應用程式連結（Android 上的稱呼）或通用連結（iOS 術語）的一種更通用的情況：這些是應用程式與特定網址之間經過驗證的連線。若要具體了解這些內容，請參閱 [Android App Links](https://developer.android.com/training/app-links) 和 [iOS 通用連結](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/) 的文件。

深層連結對於將外部輸入導入應用程式也非常有用，例如在 OAuth 授權的情況下：您可以剖析深層連結並取得 OAuth 權杖，而不一定需要視覺化地引導使用者進行導覽。

> 由於外部輸入可能是惡意的，請務必遵循 [安全性指南](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks)，以正確減輕與處理原始深層連結 URI 相關的風險。
> 
{style="warning"}

要在 Compose Multiplatform 中實作深層連結：

1. [在應用程式配置中註冊您的深層連結架構（schema）](#register-deep-links-schemas-in-the-operating-system)
2. [在導覽圖中將特定的深層連結指派給目的地](#assign-deep-links-to-destinations)
3. [處理應用程式接收到的深層連結](#handle-received-deep-links)

## 設定

要在 Compose Multiplatform 中使用深層連結，請按照以下方式設定相依性。

在您的 Gradle 目錄（catalog）中列出這些版本、程式庫和外掛程式：

```toml
[versions]
compose-multiplatform = "%org.jetbrains.compose%"
agp = "8.9.0"

# 支援深層連結的多平台導覽程式庫版本
androidx-navigation = "%org.jetbrains.androidx.navigation%"

# 與 Compose Multiplatform 1.8.0 搭配使用的最低 Kotlin 版本
kotlin = "2.1.0"

# 實作型別安全路由所需的序列化程式庫
kotlinx-serialization = "1.7.3"

[libraries]
navigation-compose = { module = "org.jetbrains.androidx.navigation:navigation-compose", version.ref = "androidx-navigation" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }

[plugins]
multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
compose = { id = "org.jetbrains.compose", version.ref = "compose-multiplatform" }
kotlinx-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
android-application = { id = "com.android.application", version.ref = "agp" }
```

將額外的相依性新增至共用模組的 `build.gradle.kts`：

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinx.serialization)
}

// ...

kotlin {
    // ...
    sourceSets {
        commonMain.dependencies {
            // ...
            implementation(libs.androidx.navigation.compose)
            implementation(libs.kotlinx.serialization.json)
        }
    }
}
```

## 在作業系統中註冊深層連結架構

每個作業系統都有自己處理深層連結的方式。參考特定目標平台的文件會更可靠：

* 對於 Android 應用程式，深層連結架構在 `AndroidManifest.xml` 檔案中宣告為意圖篩選器（intent filters）。請參閱 [Android 文件](https://developer.android.com/training/app-links/deep-linking?hl=en#adding-filters) 以了解如何正確設定意圖篩選器。
* 對於 iOS 和 macOS 應用程式，深層連結架構在 `Info.plist` 檔案中的 [CFBundleURLTypes](https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleurltypes) 鍵中宣告。

    > Compose Multiplatform [提供了一個 Gradle DSL](compose-native-distribution.md#information-property-list-on-macos)，用於將值新增至 macOS 應用程式的 `Info.plist`。對於 iOS，您可以直接在 KMP 專案中編輯檔案，或[使用 Xcode GUI 註冊架構](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme)。
    >
    {style="note"}
* 對於 Windows 應用程式，可以透過在 [Windows 登錄檔中新增包含必要資訊的鍵](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa767914(v=vs.85))（適用於 Windows 8 及更早版本），或在 [套件資訊清單中指定副檔名](https://learn.microsoft.com/en-us/windows/apps/develop/launch/handle-uri-activation)（適用於 Windows 10 和 11）來宣告深層連結架構。這可以透過安裝指令碼或第三方發行套件產生器（如 [Hydraulic Conveyor](https://conveyor.hydraulic.dev/)）來完成。Compose Multiplatform 不支援在專案本身內進行此配置。
    
    > 請確保您沒有使用 [Windows 保留的架構](https://learn.microsoft.com/en-us/windows/apps/develop/launch/reserved-uri-scheme-names#reserved-uri-scheme-names)之一。
    >
    {style="tip"}
* 對於 Linux，深層連結架構可以註冊在發行版隨附的 `.desktop` 檔案中。

## 將深層連結指派給目的地

宣告為導覽圖一部分的目的地具有一個選用的 `deepLinks` 參數，該參數可以保存對應的 `NavDeepLink` 物件列表。每個 `NavDeepLink` 都描述了一個應與目的地比對的 URI 模式——您可以定義多個應導向至同一螢幕的 URI 模式。

您可以為一條路由定義的深層連結數量沒有限制。

### 深層連結的通用 URI 模式

通用的 URI 模式應與整個 URI 比對。您可以使用參數的占位符號，以便從接收到的 URI 中提取目的地內的參數。

通用 URI 模式的規則：

* 沒有配置架構（scheme）的 URI 被假設為以 `http://` 或 `https://` 開頭。因此 `uriPattern = "example.com"` 會比對 `http://example.com` 和 `https://example.com`。
* `{placeholder}` 比對一個或多個字元（`example.com/name={name}` 比對 `https://example.com/name=Bob`）。若要比對零個或多個字元，請使用 `.*` 萬用字元（`example.com/name={.*}` 比對 `https://example.com/name=` 以及 `name` 的任何值）。
* 路徑占位符號的參數是必填的，而查詢占位符號的比對則是選用的。例如，模式 `example.com/users/{id}?arg1={arg1}&arg2={arg2}`：
    * 不比對 `http://www.example.com/users?arg1=one&arg2=two`，因為缺少路徑的必要部分（`id`）。
    * 同時比對 `http://www.example.com/users/4?arg2=two` 和 `http://www.example.com/users/4?arg1=one`。
    * 也比對 `http://www.example.com/users/4?other=random`，因為無關的查詢參數不影響比對。
* 如果有多個 composable 具有與接收到的 URI 比對的 `navDeepLink`，則行為是不確定的。請確保您的深層連結模式並不重疊。如果您需要多個 composable 處理相同的深層連結模式，請考慮新增路徑或查詢參數，或使用中間目的地來可預測地引導使用者。

### 為路由型別產生的 URI 模式

您可以避免完整寫出 URI 模式：導覽程式庫可以根據路由的參數自動產生 URI 模式。

要使用此方法，請像這樣定義深層連結：

```kotlin
composable<PlantDetail>(
    deepLinks = listOf(
        navDeepLink<PlantDetail>(basePath = "demo://example.com/plant")
    )
) { ... }
```

這裡 `PlantDetail` 是您用於目的地的路由型別，而 `basePath` 中的 "plant" 是 `PlantDetail` 資料類別的序列化名稱。

URI 模式的其餘部分將產生如下：

* 必要參數會作為路徑參數附加（例如：`/{id}`）
* 具有預設值的參數（選用參數）會作為查詢參數附加（例如：`?name={name}`）
* 集合會作為查詢參數附加（例如：`?items={value1}&items={value2}`）
* 參數的順序與路由定義中欄位的順序一致。

因此，舉例來說，這個路由型別：

```kotlin
@Serializable data class PlantDetail(
  val id: String,
  val name: String,
  val colors: List<String>,
  val latinName: String? = null,
)
```

具有由程式庫產生的以下 URI 模式：

```none
<basePath>/{id}/{name}/?colors={color1}&colors={color2}&latinName={latinName}
```

### 為目的地新增深層連結的範例

在此範例中，我們將多個深層連結指派給一個目的地，然後從接收到的 URI 中提取參數值：

```kotlin
@Serializable @SerialName("dlscreen") data class DeepLinkScreen(val name: String)

// ...

val firstBasePath = "demo://example1.org"

NavHost(
    navController = navController,
    startDestination = FirstScreen
) {
    // ...
    
    composable<DeepLinkScreen>(
        deepLinks = listOf(
            // 此 composable 應同時處理 demo://example1.org 和 demo://example2.org 的連結
            navDeepLink { uriPattern = "$firstBasePath?name={name}" },
            navDeepLink { uriPattern = "demo://example2.org/name={name}" },
            // 產生的模式僅處理參數，
            // 因此我們為路由型別新增序列化名稱
            navDeepLink<DeepLinkScreen>(basePath = "$firstBasePath/dlscreen"),
        )
    ) {
        // 如果應用程式接收到 URI `demo://example1.org/dlscreen/Jane/`，
        // 它會比對產生的 URI 模式（name 是必要參數且已在路徑中提供），
        // 且您可以自動將其對應到路由型別
        val deeplink: DeepLinkScreen = backStackEntry.toRoute()
        val nameGenerated = deeplink.name
        
        // 如果應用程式接收到僅比對通用模式的 URI，
        // 例如 `demo://example1.com/?name=Jane`
        // 則您需要直接剖析該 URI
        val nameGeneral = backStackEntry.arguments?.read { getStringOrNull("name") }
        
        // Composable 內容
    }
}
```

對於 Web，深層連結的工作方式略有不同：由於 Web 版 Compose Multiplatform 製作的是單頁面應用程式，您需要將深層連結 URI 模式的所有參數放在 URL 片段（`#` 字元之後）中，並確保所有參數都經過 URL 編碼。

如果 URL 片段符合 URI 模式規則，您仍然可以使用 `backStackEntry.toRoute()` 方法來剖析參數。有關在 Web 應用程式中存取和剖析 URL 的詳細資訊，以及瀏覽器導覽的細節，請參閱 [這篇文章](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps)。

```kotlin
composable<DeepLinkScreen>(
        deepLinks = listOf(
            // 對於預設的 Compose Multiplatform 設定，localhost:8080
            // 是使用 wasmJsBrowserDevelopmentRun Gradle 任務執行的本機開發端點
            navDeepLink { uriPattern = "localhost:8080/#dlscreen%2F{name}" },
        )
    ) { ... }
```

> 與任何其他單頁面 Web 應用程式一樣，您可以在 Web 上避免使用 URL 片段。為此，您必須配置 Web 伺服器將適當的請求重導向至應用程式，並重寫 [導覽路由到瀏覽器地址的預設對應](compose-navigation-routing.md#full-url-customization)。
>
{style="tip"}

## 處理接收到的深層連結

在 Android 上，傳送至應用程式的深層連結 URI 可作為觸發深層連結的 `Intent` 的一部分取得。跨平台實作需要一種通用的方式來接聽深層連結。

讓我們建立一個基礎實作：

1. 在共用程式碼中宣告一個單例（singleton），用於儲存和快取具有外部 URI 接聽程式的 URI。
2. 在必要之處，實作平台特定的呼叫，傳送從作業系統接收到的 URI。
3. 在主 composable 中為新的深層連結設定接聽程式。

### 宣告具有 URI 接聽程式的單例

在 `commonMain` 中，於頂層宣告單例物件：

```kotlin
object ExternalUriHandler {
    // 當 URI 在接聽程式設定好之前抵達時的儲存空間
    private var cached: String? = null
    
    var listener: ((uri: String) -> Unit)? = null
        set(value) {
            field = value
            if (value != null) {
                // 當接聽程式設定好且 `cached` 不為空時，
                // 立即使用快取的 URI 呼叫接聽程式
                cached?.let { value.invoke(it) }
                cached = null
            }
        }

    // 當新的 URI 抵達時，將其快取。
    // 如果接聽程式已經設定，則呼叫它並立即清除快取。
    fun onNewUri(uri: String) {
        cached = uri
        listener?.let {
            it.invoke(uri)
            cached = null
        }
    }
}
```

### 實作對單例的平台特定呼叫

對於桌面版 JVM 和 iOS，您都需要明確傳遞從系統接收到的 URI。

在 `jvmMain/.../main.kt` 中，剖析每個必要作業系統的命令列引數，並將接收到的 URI 傳遞給單例：

```kotlin
// 匯入單例
import org.company.app.ExternalUriHandler

fun main() {
    if(System.getProperty("os.name").indexOf("Mac") > -1) {
        Desktop.getDesktop().setOpenURIHandler { uri ->
            ExternalUriHandler.onNewUri(uri.uri.toString())
        }
    }
    else {
        ExternalUriHandler.onNewUri(args.getOrNull(0).toString())
    }

    application {
         // ...
    }
}
```

對於 iOS，在 Swift 程式碼中新增一個處理傳入 URI 的 `application()` 變體：

```swift
// 匯入 KMP 模組以存取單例
import SharedUI

func application(
    _ application: UIApplication,
    open uri: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
    // 將完整 URI 傳送至單例
    ExternalUriHandler.shared.onNewUri(uri: uri.absoluteString)    
        return true
    }
```

> 關於從 Swift 存取單例的命名慣例，請參閱 [Kotlin/Native 文件](https://kotlinlang.org/docs/native-objc-interop.html#kotlin-singletons)。
> 
{style="tip"}

### 設定接聽程式

您可以使用 `DisposableEffect(Unit)` 來設定接聽程式，並在 composable 不再處於作用狀態後對其進行清理。例如：

```kotlin
internal fun App(navController: NavHostController = rememberNavController()) = AppTheme {

    // 由於 `Unit` 永不改變，該效應僅產生一次
    DisposableEffect(Unit) {
        // 設定接聽程式以呼叫 `NavController.navigate()`，
        // 針對列有相符 `navDeepLink` 的 composable
        ExternalUriHandler.listener = { uri ->
            navController.navigate(NavUri(uri))
        }
        // 當 composable 不再處於作用狀態時移除接聽程式
        onDispose {
            ExternalUriHandler.listener = null
        }
    }

    // 重用本文前面的範例
    NavHost(
        navController = navController,
        startDestination = FirstScreen
    ) {
        // ...

        composable<DeepLinkScreen>(
            deepLinks = listOf(
                navDeepLink { uriPattern = "$firstBasePath?name={name}" },
                navDeepLink { uriPattern = "demo://example2.com/name={name}" },
            )
        ) {
            // Composable 內容
        }
    }
}
```

## 結果

現在您可以看到完整的流程：
當使用者開啟 `demo://` URI 時，作業系統會將其與註冊的架構進行比對。
接著：
  * 如果處理深層連結的應用程式已關閉，單例會接收該 URI 並將其快取。當主 composable 函式啟動時，它會呼叫單例並導覽至與快取 URI 相符的深層連結。
  * 如果處理深層連結的應用程式已開啟，接聽程式已經設定好，因此當單例接收到 URI 時，應用程式會立即導覽至該處。

## 下一步

查看展示 Compose Multiplatform 導覽程式庫實際運作的專案：

* 基礎範例：[nav_cupcake 專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)，該專案是從 [使用 Compose 在螢幕之間進行導覽](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0) Android 程式碼研究室轉換而來的。
* 進階範例：官方 [KotlinConf](https://github.com/JetBrains/kotlinconf-app) 應用程式。