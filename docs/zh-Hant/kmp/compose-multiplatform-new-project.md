[//]: # (title: 完全共用程式碼：時區選擇器應用程式)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

本教學著重於盡可能在不同平台之間共用程式碼：
UI 是使用 Compose Multiplatform 在通用程式碼中實作的，
而功能則是基於多平台程式庫。
關於僅共用邏輯並保持原生 UI 的範例，請參閱[原生 UI：REST API 請求的共用邏輯](multiplatform-upgrade-app.md)。

你將建立一個應用程式，讓使用者可以選擇國家並檢視該國首都的目前時間。
該應用程式將在下拉式功能表中載入並顯示圖片，並使用具備事件、樣式、佈景主題與修飾符的典型 Compose 版面配置。

若要從精靈產生的專案達到最終成果，你將會：

1. [實作基本的 Compose UI 版面配置](#implement-the-basic-layout)
2. [試用 Compose Hot Reload](#use-compose-hot-reload-to-quickly-iterate-on-the-ui)
3. [新增用於時間計算的多平台程式庫相依性](#add-the-kotlinx-datetime-dependency)
4. 整合應用程式：
   * [支援使用者輸入](#support-user-input)
   * [新增並匯入圖片資源](#introduce-images)

由於程式碼幾乎完全共用，本教學將協助你同時為所有支援的平台建立示範應用程式。
但基於相同的原因，你也可以自由挑選只感興趣的平台。

> 專案的最終狀態可在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/)中取得。
>
{style="tip"}
<!-- TODO the project will be a bit different, but can be synced later -->

## 建立專案 {id="create-a-project"}

在已安裝 IDE 與 Kotlin Multiplatform IDE 外掛程式的情況下，
建立一個新的 Compose Multiplatform 專案：

1. 在 IntelliJ IDEA 中，選取 **File | New | Project**。
2. 在左側面板中，選取 **Kotlin Multiplatform**。
3. 在 **New Project** 視窗中指定下列欄位：

    * **Name**：ComposeDemo
    * **Project ID**（用作套件名稱）：compose.project.demo

4. 選取 **Android**、**iOS**、**Desktop** 及 **Web** 目標。
   確保 iOS 與 Web 均已勾選 **Share UI** 選項。
5. 指定完所有欄位與目標後，點擊 **Create**。

   ![建立 Compose Multiplatform 專案](create-compose-multiplatform-project.png){width=800}

首次匯入需要幾分鐘的時間。
完成後，請確保所有預先檢查皆已成功完成（**View | Tool Windows | Project Environment Preflight Checks**）。

## 實作基本版面配置 {id="implement-the-basic-layout"}

產生的 Compose Multiplatform 專案由各平台專屬的應用程式模組以及一個共用 UI 模組組織而成。
每個應用程式模組都定義了一個呼叫共用 `App()` composable 的入口點。

> 若要了解共用 UI 程式碼如何在不同平台上掛載至系統入口點，
> 請參閱[原生應用程式入口點](compose-multiplatform-entry-points.md)。
>
{style="tip"}

在本教學中，通用 UI 程式碼中的所有功能變更都會無縫傳遞至各個應用程式，
但你也會看到為使平台設定正常運作所需的幾項調整。

首先，在通用的 `App()` composable 中實作基本版面配置：

1. 在 `shared/src/commonMain/kotlin` 中，開啟 `compose.project.demo/App.kt` 檔案，並將 `App()` composable 替換為新的實作：

    ```kotlin
    // @Composable 標記一個 composable 函式：
    // 在 Compose 中發出 UI 元素的函式
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            // 將 UI 宣告為在按鈕上方包含文字標籤的 Column
            Column(
                // 基本版面配置改進，確保 Column()
                // 填滿所有可用空間，且不會與系統列重疊
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                // 宣告一個觀察 timeAtLocation 狀態的 Text()
                Text(timeAtLocation)
                // 宣告一個同樣觀察 timeAtLocation 狀態的 Button()，
                // 但目前僅顯示寫死的時間
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```
   
    > `remember` API 實作了 Compose 特有的狀態管理。
    > 狀態物件封裝在 `remember()` 呼叫中，以便建立一次狀態後，在多次 composition 之間保留該狀態。
    > 當狀態值變更時，任何觀察該狀態的 composable 都會被重新調用並重新繪製。
    > 這稱為*重組* (recomposition)。
    >
    > 如需深入介紹，請參閱 Jetpack Compose 文件中的[管理狀態](https://developer.android.com/develop/ui/compose/state)。
   
2. 在 Android 和 iOS 上執行應用程式：

   ![在 Android 和 iOS 上的新 Compose Multiplatform 應用程式](first-compose-project-on-android-ios-3.png){width=500}

   當你執行應用程式並點擊按鈕時，應用程式會顯示寫死的時間 — 13:30。

3. 透過啟動 **desktopApp [hot] 🔥** 运行配置，使用 [Compose Hot Reload](compose-hot-reload.md) 在桌上型電腦上執行應用程式。
   應用程式可以正常運作，但視窗大小與 UI 看起來不太協調：

   ![桌上型電腦上的新 Compose Multiplatform 應用程式](first-compose-project-on-desktop-3.png){width=400}

   感謝 Compose Hot Reload，你無需完全重新啟動即可修正此問題。

### 使用 Compose Hot Reload 快速迭代 UI {id="use-compose-hot-reload-to-quickly-iterate-on-the-ui"}

你可以修正桌面端 UI 並驗證修正，而無需重新啟動應用程式：

1. 依照下列方式更新 `desktopApp/src/` 目錄下的 `main.kt` 檔案：

    ```kotlin
    fun main() = application {
        // 設定視窗在螢幕上的初始大小與位置
        val state = rememberWindowState(
            size = DpSize(400.dp, 350.dp),
            position = WindowPosition(300.dp, 300.dp)
        )
        // 設定應用程式視窗的標題，
        // 並使用上方初始化的視窗狀態
        Window(
            title = "Local Time App", 
            onCloseRequest = ::exitApplication, 
            state = state,
            // 確保視窗始終置頂，
            // 使偵錯和 UI 迭代更加容易
            alwaysOnTop = true
        ) {
            App()
        }
    }
    ```

2. 依照 IDE 的建議匯入缺少的符號。
   針對 `rememberWindowState()` 函式，請選擇 `androidx.compose.ui.window` 版本。

3. 若要查看應用程式自動更新，請儲存修改過的檔案（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）。
   視窗應該會隨之調整：

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## 新增 `kotlinx-datetime` 相依性 {id="add-the-kotlinx-datetime-dependency"}

若要處理時區與時間計算，你將結合使用 [`kotlin.time`](https://kotlinlang.org/docs/time-measurement.html) 類別與多平台 [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime) 程式庫。

雖然 `kotlin.time` 作為標準函式庫的一部分始終可用，
但 `kotlinx-datetime` 需要設定為明確的相依性。
它是一個多平台程式庫，而且你只會在通用程式碼中使用它。
因此，你只需指定一次相依性，[僅 Web 需要額外設定](#add-the-kotlinx-datetime-dependency-for-the-web-app)。

請按照[該程式庫存儲庫](https://github.com/Kotlin/kotlinx-datetime#gradle)中的指示操作：

1. 開啟 `gradle/libs.versions.toml` 檔案，將 `kotlinx-datetime` 相依性新增至[版本目錄 (version catalog)](https://docs.gradle.org/current/userguide/version_catalogs.html)：

    ```toml
    [versions]
    kotlinx-datetime = "%dateTimeVersion%"

    [libraries]
    kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
    ```

2. 開啟 `shared/build.gradle.kts` 檔案，並在 `commonMain` 原始碼集配置中新增對版本目錄項目的參照：

    ```kotlin
    kotlin {
        // ... 
        sourceSets {
            commonMain.dependencies {
                // ...
                implementation(libs.kotlinx.datetime)
            } 
        }
    }
    ```

3. 按兩下 **Shift 鍵**，然後尋找並執行 **Sync Project with Gradle Files** 指令。

現在你可以在通用程式碼中使用 `kotlinx-datetime` API。
對於 Web 目標，你需要如[下文所述](#add-the-kotlinx-datetime-dependency-for-the-web-app)解決 JavaScript 與 Wasm/JS 中時區支援的限制。

> 如需更多關於如何管理多平台相依性的一般資訊，
> 請參閱[新增多平台程式庫的相依性](multiplatform-add-dependencies.md)。
>
{style="tip"}

### 為 Web 應用程式新增 `kotlinx-datetime` 相依性 {id="add-the-kotlinx-datetime-dependency-for-the-web-app"}

對於 Web 目標，時區支援還需要 [`js-joda`](https://js-joda.github.io/js-joda/) npm 套件：

1. 在 `webApp/build.gradle.kts` 檔案中新增對該套件的參照：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            webMain.dependencies {
                implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
            }
        }
    }
    
    ```

   將相依性新增至 `webMain` 原始碼集可讓 `wasmJs` 和 `js` 目標都能使用該程式庫。

2. 按兩下 **Shift 鍵**，然後尋找並執行 **Sync Project with Gradle Files** 指令。

3. 在 **Terminal** 工具視窗中，執行下列指令以使用最新的相依性版本更新 `yarn.lock` 檔案：

    ```shell
    ./gradlew kotlinUpgradeYarnLock kotlinWasmUpgradeYarnLock
    ```

4. 在 `webApp/src/webMain/kotlin/.../main.kt` 檔案中，使用 `@JsModule` 註解匯入 `js-joda` npm 套件。
   將 `main()` 函式替換為下列程式碼：

    ```kotlin
    import kotlin.js.ExperimentalWasmJsInterop
    import kotlin.js.JsModule

    @OptIn(ExperimentalWasmJsInterop::class)
    @JsModule("@js-joda/timezone")
    external object JsJodaTimeZoneModule
    
    private val jsJodaTz = JsJodaTimeZoneModule
    
    @OptIn(ExperimentalComposeUiApi::class)
    fun main() {
        ComposeViewport {
            App()
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='@JsModule("@js-joda/timezone")'}

> 將專案提交至版本控制時，請包含在 `kotlin-js-store` 目錄中產生的 `yarn.lock` 檔案。
> 同步的 `yarn.lock` 可確保建置專案的任何人都能使用相同版本的 JavaScript 相依性。
>
{style="note"}

## 支援使用者輸入 {id="support-user-input"}

為求簡潔，我們不會實作指定和驗證時區的複雜邏輯。
應用程式將提供多個國家供選擇，並顯示所選國家首都的時間：

1. 在 `shared/src/commonMain/kotlin` 中，開啟 `compose.project.demo/App.kt` 檔案，
   並在 `App()` composable 上方新增一個資料類別來保存國家資訊：

    ```kotlin
    // 此範例中時區的簡化表示法 
    data class Country(val name: String, val zone: TimeZone)
    
    // 寫死支援的國家清單
    // 以及特定關聯的時區
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    ```

2. 在同一個 `App.kt` 檔案中，新增一個 `currentTimeAt()` 函式，用於計算指定時區的當地時間。
   為了將時間顯示為 `HH:MM:SS`，該函式使用 `kotlinx-datetime` 的[格式建構器](https://github.com/Kotlin/kotlinx-datetime#working-with-other-string-formats)描述格式，將每個組成部分補零至兩位數：

    ```kotlin
    // 接受 TimeZone 參數以計算時間
    fun currentTimeAt(location: String, zone: TimeZone): String {
        // 描述時間格式：小時、分鐘和秒數，
        // 各補零至兩位數並以冒號分隔
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }
    ```

3. 更新 `App()` composable 以使用新增的功能：
   將國家清單顯示為下拉式選單，並計算時間而不是寫死。
   將整個 `App()` 函式替換為以下內容：

    ```kotlin
    // 現在需要國家清單以在下拉式功能表中顯示
    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
      MaterialTheme {
          var showCountries by remember { mutableStateOf(false) }
          var timeAtLocation by remember { mutableStateOf("No location selected") }
    
    
          // Composable 接收 .padding() 修飾符以在控制項之間及周圍添加間距
          Column(
              modifier = Modifier
                  .padding(20.dp)
                  .safeContentPadding()
                  .fillMaxSize(),
          ) {
              Text(
                  timeAtLocation,
                  style = TextStyle(fontSize = 20.sp),
                  textAlign = TextAlign.Center,
                  modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
              )
              Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                  DropdownMenu(
                      // 使用記住的值來控制
                      // 下拉式功能表的可見性
                      expanded = showCountries,
                      onDismissRequest = { showCountries = false }
                  ) {
                      // 為每個國家建立一個下拉式功能表項目
                      countries.forEach { (name, zone) ->
                          DropdownMenuItem(
                              text = { Text(name) },
                              onClick = {
                                  timeAtLocation = currentTimeAt(name, zone)
                                  showCountries = false
                              }
                          )
                      }
                  }
              }
    
              Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                  onClick = { showCountries = !showCountries }) {
                  Text("Select Location")
              }
          }
      }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="countries.forEach { (name, zone) ->"}
   
4. 依照 IDE 的建議匯入缺少的符號：
   * 匯入 `Row()` 時，請選擇 `@Composable` 版本。
   * 匯入 `Clock` 時，請選擇來自 `kotlin.time` 套件的版本。

執行應用程式以查看重新設計的版本：

<Tabs>
    <TabItem id="mobile-country-list" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="在 Android 和 iOS 上的 Compose Multiplatform 應用程式國家清單" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="Desktop">
        <img src="first-compose-project-on-desktop-8.png" alt="桌上型電腦上的 Compose Multiplatform 應用程式國家清單" width="350"/>
    </TabItem>
   <TabItem id="web-country-list" title="Web">
        <img src="first-compose-project-on-web-6.png" alt="Web 上的 Compose Multiplatform 應用程式國家清單" width="500"/>
    </TabItem>
</Tabs>

> 關於建立新模擬器或在實體裝置上執行應用程式的詳細資訊，請參閱[建置與執行 Kotlin Multiplatform 應用程式](build-and-run-kmp.md)。
>
{style="note"}

## 引入圖片 {id="introduce-images"}

為了更好地展示不同的國家，請在下拉式選單中的國家名稱旁新增國旗圖片。

為此，請將圖片放置在正確的目錄中，然後新增程式碼以載入並顯示它們：

1. 從 [Flag CDN](https://flagcdn.com/) 下載國旗圖片，以對應你已建立的國家清單。在此範例中，分別為[日本](https://flagcdn.com/w320/jp.png)、[法國](https://flagcdn.com/w320/fr.png)、[墨西哥](https://flagcdn.com/w320/mx.png)、[印尼](https://flagcdn.com/w320/id.png)與[埃及](https://flagcdn.com/w320/eg.png)。

2. 將圖片移動到 `shared/src/commonMain/composeResources/drawable` 目錄中，以便在所有平台上都能使用相同的國旗：

   ![Compose Multiplatform 資源專案結構](compose-resources-project-structure.png){width=300}

3. 請確保圖片名稱與上述完全一致：Compose Multiplatform 會根據檔案名稱產生存取子。

4. 更新 UI 程式碼以使用這些圖片。
   將 `commonMain/kotlin/.../App.kt` 檔案中的全部程式碼替換為以下內容：

    ```kotlin
    package compose.project.demo

    import androidx.compose.foundation.Image
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Row
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.fillMaxWidth
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.layout.safeContentPadding
    import androidx.compose.foundation.layout.size
    import androidx.compose.material3.Button
    import androidx.compose.material3.DropdownMenu
    import androidx.compose.material3.DropdownMenuItem
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Text
    import androidx.compose.runtime.*
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.text.TextStyle
    import androidx.compose.ui.text.style.TextAlign
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import androidx.compose.ui.unit.sp
    import kotlinx.datetime.LocalTime
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.format
    import kotlinx.datetime.format.char
    import kotlinx.datetime.toLocalDateTime
    import kotlin.time.Clock
    import composedemo.shared.generated.resources.Res
    import composedemo.shared.generated.resources.eg
    import composedemo.shared.generated.resources.fr
    import composedemo.shared.generated.resources.id
    import composedemo.shared.generated.resources.jp
    import composedemo.shared.generated.resources.mx
    import org.jetbrains.compose.resources.DrawableResource
    import org.jetbrains.compose.resources.painterResource
    
    // 該型別現在還包含對國旗圖片的參照
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }

    // 使用匯入的 Compose Multiplatform 資源初始化清單並傳回
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
        MaterialTheme {
            var showCountries by remember { mutableStateOf(false) }
            var timeAtLocation by remember { mutableStateOf("No location selected") }

            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            // 每個國家都在 'DropdownMenuItem' 中顯示為
                            // 國旗 ('Image()') 與名稱 ('Text()')
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        // 'painterResource()' 提供 'Image()' 所需的 Painter 物件
                                        painterResource(image),
                                        modifier = Modifier.size(50.dp).padding(end = 10.dp),
                                        contentDescription = "$name flag"
                                    )
                                    Text(name)
                                } },
                                onClick = {
                                    timeAtLocation = currentTimeAt(name, zone)
                                    showCountries = false
                                }
                            )
                        }
                    }
                }

                Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                    onClick = { showCountries = !showCountries }) {
                    Text("Select Location")
                }
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="import composedemo.shared.generated.resources.Res"}

5. 執行應用程式以查看新效果：

<Tabs>
    <TabItem id="mobile-flags" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="在 Android 和 iOS 上的 Compose Multiplatform 應用程式國旗" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="Desktop">
        <img src="first-compose-project-on-desktop-9.png" alt="桌上型電腦上的 Compose Multiplatform 應用程式國旗" width="350"/>
    </TabItem>
   <TabItem id="web-flags" title="Web">
        <img src="first-compose-project-on-web-7.png" alt="Web 上的 Compose Multiplatform 應用程式國旗" width="500"/>
    </TabItem>
</Tabs>

> 你可以在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/)中找到專案的最終狀態。
>
{style="note"}

## 後續步驟 {id="what-s-next"}

本教學介紹了多平台專案的基本構建區塊。
若要深入了解細節：
* **Kotlin Multiplatform**
  * 參閱[另一篇教學](multiplatform-upgrade-app.md)，其中應用程式 UI 為原生，僅共用商務邏輯。 
  * 深入閱讀 [Kotlin Multiplatform 提供的程式碼共用機制](multiplatform-share-on-platforms.md)。 
  * 了解 [Kotlin Multiplatform 專案結構背後的原理](multiplatform-discover-project.md)。
  * 如需更多關於如何管理多平台相依性的資訊，請參閱[新增多平台程式庫的相依性](multiplatform-add-dependencies.md)。
* **Compose Multiplatform**
  * 了解 [Compose 版面配置的基本概念](compose-layout.md)以及[使用 Compose 修飾符](compose-layout-modifiers.md)。
  * 了解 [Compose 中多平台資源的可能性與挑戰](compose-multiplatform-resources.md)。
* **更進階專案的教學**
  * [使用 Ktor 與 SQLDelight 共用資料和網路邏輯](multiplatform-ktor-sqldelight.md)。
  * [將進階 Android 應用程式遷移至 KMP](migrate-from-android.md)。
* 瀏覽[精選多平台範例專案清單](multiplatform-samples.md)。

加入社群：

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：獲取協助並參與關於 KMP 和 Compose Multiplatform 的討論。
  申請[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU)
  與 [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 頻道。
* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**：在[存儲庫](https://github.com/JetBrains/compose-multiplatform)給顆星並做出貢獻。
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：訂閱 ["kotlin-multiplatform" 標籤](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)。
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 頻道**：訂閱並觀看有關 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 的影片。