[//]: # (title: 建立你自己的應用程式)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教學使用 IntelliJ IDEA，但你也可以在 Android Studio 中進行 —— 兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
    <br/>   
    <p>這是 <strong>使用共享邏輯與 UI 建立 Compose Multiplatform 應用程式</strong> 教學的最後一部分。在繼續之前，請確保你已完成之前的步驟。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/compose-multiplatform-create-first-app" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the first part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">建立你的 Compose Multiplatform 應用程式</Links><br/>
       <img src="icon-2-done.svg" width="20" alt="第二步"/> <Links href="/kmp/compose-multiplatform-explore-composables" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the second part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">探索 composable 程式碼</Links><br/>
       <img src="icon-3-done.svg" width="20" alt="第三步"/> <Links href="/kmp/compose-multiplatform-modify-project" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the third part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">修改專案</Links><br/>
       <img src="icon-4.svg" width="20" alt="第四步"/> <strong>建立你自己的應用程式</strong><br/>
    </p>
</tldr>

既然你已經探索並增強了由精靈建立的範例專案，現在你可以利用已掌握的概念並引入一些新概念，從頭開始建立你自己的應用程式。

你將建立一個「本地時間應用程式」，使用者可以在其中輸入國家和城市，應用程式將顯示該國首都的時間。你的 Compose Multiplatform 應用程式的所有功能都將使用多平台程式庫在共通程式碼中實作。它將在下拉式功能表中載入並顯示圖片，並將使用事件、樣式、佈景主題、修飾符和配置。

在每個階段，你都可以在所有三個平台（iOS、Android 與桌面）上執行應用程式，或者你可以專注於最符合你需求的特定平台。

> 你可以在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/) 中找到專案的最終狀態。
>
{style="note"}

## 奠定基礎

首先，實作一個新的 `App` composable：

1. 在 `composeApp/src/commonMain/kotlin` 中，開啟 `App.kt` 檔案，並將程式碼替換為以下 `App` composable：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

   * 配置是一個包含兩個 composable 的 `Column`。第一個是 `Text` composable，第二個是 `Button`。
   * 這兩個 composable 透過單個共享狀態（即 `timeAtLocation` 屬性）連結在一起。`Text` composable 是此狀態的觀察者。
   * `Button` composable 使用 `onClick` 事件處理常式來更改狀態。

2. 在 Android 和 iOS 上執行應用程式：

   ![Android 和 iOS 上的新 Compose Multiplatform 應用程式](first-compose-project-on-android-ios-3.png){width=500}

   當你執行應用程式並點擊按鈕時，會顯示硬編碼的時間。

3. 使用 [Compose Hot Reload](compose-hot-reload.md) 在桌面平台上執行應用程式：
   1. 在 `composeApp/src/jvmMain/kotlin/main.kt` 檔案中，點擊邊欄中的 **執行** 圖示。
   2. 選擇 **使用 Compose Hot Reload 執行 'composeApp [jvm]'**。
   ![從邊欄執行 Compose Hot Reload](compose-hot-reload-gutter-run.png){width=350 style="block"}

   應用程式可以運作，但視窗顯然對於該 UI 而言太大了：

   ![桌面平台上的新 Compose Multiplatform 應用程式](first-compose-project-on-desktop-3.png){width=400}

4. 若要修正此問題，請按以下方式更新 `main.kt` 檔案：

    ```kotlin
   fun main() = application {
       val state = rememberWindowState(
           size = DpSize(400.dp, 350.dp),
           position = WindowPosition(300.dp, 300.dp)
       )
       Window(
           title = "Local Time App", 
           onCloseRequest = ::exitApplication, 
           state = state,
           alwaysOnTop = true
       ) {
           App()
       }
   }
    ```

    在這裡，你設定了視窗標題，並使用 `WindowState` 型別為視窗提供在螢幕上的初始大小和位置。

5. 依照 IDE 的指示匯入缺失的相依性。

6. 若要查看應用程式自動更新，請儲存任何修改過的檔案（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）。其外觀應該會有所改善：

   ![桌面平台上改進外觀後的 Compose Multiplatform 應用程式](first-compose-project-on-desktop-4.png){width=350}

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## 支援使用者輸入

現在，讓使用者輸入城市名稱以查看該地點的時間。實現此功能最簡單的方法是新增一個 `TextField` composable：

1. 將 `commonMain/kotlin/compose.project.demo/App.kt` 中目前的 `App()` 實作替換為以下內容：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
    
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                TextField(value = location, onValueChange = { location = it })
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

    新程式碼同時新增了 `TextField` 和 `location` 屬性。當使用者在文字欄位中輸入時，該屬性的值會使用 `onValueChange` 事件處理常式遞增更新。

2. 依照 IDE 的指示匯入缺失的相依性。
3. 在你設定的每個目標平台上執行應用程式：

<Tabs>
    <TabItem id="mobile-user-input" title="Android 與 iOS">
        <img src="first-compose-project-on-android-ios-4.png" alt="Android 和 iOS 上的 Compose Multiplatform 應用程式中的使用者輸入" width="500"/>
    </TabItem>
    <TabItem id="desktop-user-input" title="桌面">
        <img src="first-compose-project-on-desktop-5.png" alt="桌面平台上的 Compose Multiplatform 應用程式中的使用者輸入" width="350"/>
    </TabItem>
</Tabs>

## 計算時間

下一步是使用給定的輸入來計算時間。為此，請建立一個 `currentTimeAt()` 函式：

1. 返回 `App.kt` 檔案並新增以下函式：

    ```kotlin
   fun currentTimeAt(location: String): String? {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        return try {
            val time = Clock.System.now()
            val zone = TimeZone.of(location)
            val localTime = time.toLocalDateTime(zone).time
            "The time in $location is ${localTime.formatted()}"
        } catch (ex: IllegalTimeZoneException) {
            null
        }
    }
    ```

    此函式與你之前建立且不再需要的 `todaysDate()` 類似。
    如果專案尚未加入 [kotlinx-datetime](https://github.com/Kotlin/kotlinx-datetime) 程式庫，請開啟 `composeApp/build.gradle.kts` 檔案，並將 `kotlinx-datetime` 相依性新增至配置共通程式碼原始碼集的區段。
    為了簡單起見，你可以直接包含版本號，而不是將其新增到版本目錄（version catalog）中：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            commonMain.dependencies {
                // ...
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            }
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")'}
   
2. 依照 IDE 的指示匯入缺失的相依性。
   請確保從 `kotlin.time` 匯入 `Clock` 類別，而不是從 `kotlinx.datetime` 匯入。
3. 調整你的 `App` composable 以呼叫 `currentTimeAt()`：

    ```kotlin
   @Composable
   @Preview
   fun App() {
   MaterialTheme { 
       var location by remember { mutableStateOf("Europe/Paris") }
       var timeAtLocation by remember { mutableStateOf("No location selected") }
   
       Column(
           modifier = Modifier
               .safeContentPadding()
               .fillMaxSize()
           ) {
               Text(timeAtLocation)
               TextField(value = location, onValueChange = { location = it })
               Button(onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" }) {
                   Text("Show Time At Location")
               }
           }
       }
   }
    ```

4. 再次執行應用程式並輸入有效的時區。
5. 點擊按鈕。你應該會看到正確的時間：

<Tabs>
    <TabItem id="mobile-time-display" title="Android 與 iOS">
        <img src="first-compose-project-on-android-ios-5.png" alt="Android 和 iOS 上的 Compose Multiplatform 應用程式中的時間顯示" width="500"/>
    </TabItem>
    <TabItem id="desktop-time-display" title="桌面">
        <img src="first-compose-project-on-desktop-6.png" alt="桌面平台上的 Compose Multiplatform 應用程式中的時間顯示" width="350"/>
    </TabItem>
</Tabs>

## 改進樣式

應用程式雖然可以運作，但外觀仍有一些問題。Composable 的間距可以更好，時間訊息的呈現也可以更醒目。

1. 若要解決這些問題，請使用以下版本的 `App` composable：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                TextField(
                    value = location,
                    onValueChange = { location = it },
                    modifier = Modifier.padding(top = 10.dp)
                )
                Button(
                    onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" },
                    modifier = Modifier.padding(top = 10.dp)
                ) {
                    Text("Show Time")
                }
            }
        }
    }
    ```

    * `modifier` 參數在 `Column` 的四周以及 `Button` 和 `TextField` 的頂部新增了 padding。
    * `Text` composable 填滿可用的水平空間，並將其內容置中。
    * `style` 參數自訂了 `Text` 的外觀。

2. 依照 IDE 的指示匯入缺失的相依性。
    對於 `Alignment`，請使用 `androidx.compose.ui` 版本。

3. 執行應用程式以查看外觀的改進：

<Tabs>
    <TabItem id="mobile-improved-style" title="Android 與 iOS">
        <img src="first-compose-project-on-android-ios-6.png" alt="Android 和 iOS 上的 Compose Multiplatform 應用程式樣式已改進" width="500"/>
    </TabItem>
    <TabItem id="desktop-improved-style" title="桌面">
        <img src="first-compose-project-on-desktop-7.png" alt="桌面平台上的 Compose Multiplatform 應用程式樣式已改進" width="350"/>
    </TabItem>
</Tabs>

<!--
> 你可以在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage2) 中找到此專案狀態。
>
{style="tip"}
-->

## 重構設計

應用程式雖然可以運作，但很容易出現拼寫錯誤。例如，如果使用者輸入「Franse」而不是「France」，應用程式將無法處理該輸入。更好的做法是要求使用者從預定義的清單中選擇國家。

1. 若要實現此目的，請在 `App` composable 中更改設計：

    ```kotlin
    data class Country(val name: String, val zone: TimeZone)
    
    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"
    
        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time
    
        return "The time in $location is ${localTime.formatted()}"
    }
    
    fun countries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    
    @Composable
    @Preview
    fun App(countries: `List<Country>` = countries()) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries().forEach { (name, zone) ->
                            DropdownMenuItem(
                                text = {   Text(name)},
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

   * 這裡有一個 `Country` 型別，由名稱和時區組成。
   * `currentTimeAt()` 函式將 `TimeZone` 作為其第二個參數。
   * `App` 現在需要一個國家列表作為參數。`countries()` 函式提供該清單。
   * `DropdownMenu` 已取代 `TextField`。`showCountries` 屬性的值決定了 `DropdownMenu` 的可見性。每個國家都有一個 `DropdownMenuItem`。

2. 依照 IDE 的指示匯入缺失的相依性。
3. 執行應用程式以查看重新設計後的版本：

<Tabs>
    <TabItem id="mobile-country-list" title="Android 與 iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Android 和 iOS 上的 Compose Multiplatform 應用程式中的國家列表" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="桌面">
        <img src="first-compose-project-on-desktop-8.png" alt="桌面平台上的 Compose Multiplatform 應用程式中的國家列表" width="350"/>
    </TabItem>
</Tabs>

<!--
> 你可以在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage3) 中找到此專案狀態。
>
{style="tip"}
-->

> 你可以使用相依注入架構（例如 [Koin](https://insert-koin.io/)）來進一步改進設計，以建置和注入位置表。如果資料儲存在外部，你可以使用 [Ktor](https://ktor.io/docs/create-client.html) 程式庫透過網路獲取資料，或使用 [SQLDelight](https://github.com/cashapp/sqldelight) 程式庫從資料庫中獲取資料。
>
{style="note"}

## 導入圖片

國家名稱列表雖然可以運作，但視覺上不夠吸引人。你可以透過將名稱替換為國旗圖片來改進它。

Compose Multiplatform 提供了一個程式庫，用於在所有平台上透過共通程式碼存取資源。Kotlin Multiplatform 精靈已經新增並配置了此程式庫，因此你可以開始載入資源而無需修改組建檔案。

若要在專案中支援圖片，你需要下載圖片檔案，將它們儲存在正確的目錄中，並新增程式碼來載入和顯示它們：

1. 從 [Flag CDN](https://flagcdn.com/) 下載國旗圖片，以符合你已建立的國家列表。在這種情況下，分別是 [日本](https://flagcdn.com/w320/jp.png)、[法國](https://flagcdn.com/w320/fr.png)、[墨西哥](https://flagcdn.com/w320/mx.png)、[印尼](https://flagcdn.com/w320/id.png) 和 [埃及](https://flagcdn.com/w320/eg.png)。

2. 將圖片移至 `composeApp/src/commonMain/composeResources/drawable` 目錄，以便在所有平台上都能使用相同的國旗：

   ![Compose Multiplatform 資源專案結構](compose-resources-project-structure.png){width=300}

3. 建置或執行應用程式，以產生包含新增資源存取子（accessor）的 `Res` 類別。

4. 更新 `commonMain/kotlin/.../App.kt` 檔案中的程式碼以支援圖片：

    ```kotlin
    import demo.composeapp.generated.resources.jp
    import demo.composeapp.generated.resources.mx
    import demo.composeapp.generated.resources.eg
    import demo.composeapp.generated.resources.fr
    import demo.composeapp.generated.resources.id
   
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.formatted()}"
    }

    val defaultCountries = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: `List<Country>` = defaultCountries) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
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
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)"}

    * `Country` 型別儲存了相關圖片的路徑。
    * 傳遞給 `App` 的國家列表包含這些路徑。
    * `App` 在每個 `DropdownMenuItem` 中顯示一個 `Image`，後跟一個帶有國家名稱的 `Text` composable。
    * 每個 `Image` 都需要一個 `Painter` 物件來獲取資料。

5. 依照 IDE 的指示匯入缺失的相依性。
6. 執行應用程式以查看新行為：

<Tabs>
    <TabItem id="mobile-flags" title="Android 與 iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Android 和 iOS 上的 Compose Multiplatform 應用程式中的國旗" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="桌面">
        <img src="first-compose-project-on-desktop-9.png" alt="桌面平台上的 Compose Multiplatform 應用程式中的國旗" width="350"/>
    </TabItem>
</Tabs>

> 你可以在我們的 [GitHub 存儲庫](https://github.com/kotlin-hands-on/get-started-with-cm/) 中找到專案的最終狀態。
>
{style="note"}

## 下一步

我們鼓勵你進一步探索多平台開發並嘗試更多專案：

* [讓你的 Android 應用程式具備跨平台能力](multiplatform-integrate-in-existing-app.md)
* [使用 Ktor 和 SQLDelight 建立多平台應用程式](multiplatform-ktor-sqldelight.md)
* [在 iOS 和 Android 之間共享業務邏輯，同時保持 UI 原生](multiplatform-create-first-app.md)
* [使用 Kotlin/Wasm 建立 Compose Multiplatform 應用程式](https://kotlinlang.org/docs/wasm-get-started.html)
* [查看精選的範例專案列表](multiplatform-samples.md)

加入社群：

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**：為 [該存儲庫](https://github.com/JetBrains/compose-multiplatform) 按星並貢獻程式碼
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：獲取 [邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：訂閱 ["kotlin-multiplatform" 標籤](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 頻道**：訂閱並觀看有關 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 的影片