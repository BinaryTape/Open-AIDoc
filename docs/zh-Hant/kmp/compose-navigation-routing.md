[//]: # (title: 導航與路由)

導航是 UI 應用程式的關鍵部分，允許使用者在不同的應用程式螢幕之間移動。
Compose Multiplatform 採用了 [Jetpack Compose 的導航方式](https://developer.android.com/guide/navigation/design#frameworks)。

## 設定

若要使用導航程式庫，請將以下相依性新增至您的 `commonMain` 原始碼集：

```kotlin
kotlin {
    // ...
    sourceSets {
        // ...
        commonMain.dependencies {
            // ...
            implementation("org.jetbrains.androidx.navigation:navigation-compose:%org.jetbrains.androidx.navigation%")
        }
        // ...
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="org.jetbrains.androidx.navigation:navigation-compose:%org.jetbrains.androidx.navigation%"}

## 範例專案

若要查看 Compose Multiplatform 導航程式庫的實際運作情況，請查看 [nav_cupcake 專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)，該專案是從 [使用 Compose 在螢幕之間導航](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0) Android codelab 轉換而來。如需更複雜的範例，請參閱官方的 [KotlinConf](https://github.com/JetBrains/kotlinconf-app) 應用程式。

就像 Jetpack Compose 一樣，若要實作導航，您應該：
1. [列出路由](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L50)，這些路由應包含在導航圖中。每個路由都必須是定義路徑的唯一字串。
2. [建立 `NavHostController` 執行個體](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L89) 作為您的主要可組合屬性以管理導航。
3. [在您的應用程式中新增 `NavHost` 可組合項](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L109)：
    1. 從您先前定義的路由清單中選擇起始目的地。
    2. 直接在建立 `NavHost` 時或使用 `NavController.createGraph()` 函式以程式化方式建立導航圖。

每個返回堆疊項（導航圖中包含的每個導航路由）都會實作 `LifecycleOwner` 介面。
在應用程式的不同螢幕之間切換會使其狀態從 `RESUMED` 變更為 `STARTED` 並返回。
`RESUMED` 也被描述為「已定位（settled）」：當新螢幕準備就緒且處於活動狀態時，導航被視為已完成。
有關 Compose Multiplatform 中目前實作的詳細資訊，請參閱 [生命週期](compose-lifecycle.md) 頁面。

## 在 Web 應用程式中支援瀏覽器導航
<primary-label ref="Experimental"/>

Compose Multiplatform for web 完全支援通用的導航程式庫 API，並允許您的應用程式從瀏覽器接收導航輸入。
使用者可以使用瀏覽器中的**返回**與**前進**按鈕在反映於瀏覽器歷程記錄中的導航路由之間移動，也可以使用網址列來了解他們目前的位置並直接前往目的地。

若要將 Web 應用程式繫結到通用程式碼中定義的導航圖，您可以在您的 Kotlin/Wasm 程式碼中使用 `NavController.bindToBrowserNavigation()` 方法。 
您也可以在 Kotlin/JS 中使用相同的方法，但需將其封裝在 `onWasmReady {}` 區塊中，以確保 Wasm 應用程式已初始化且 Skia 已準備好渲染圖形。
以下是如何進行設定的範例：

```kotlin
//commonMain 原始碼集
@Composable
fun App(
    onNavHostReady: suspend (NavController) -> Unit = {}
) {
    val navController = rememberNavController()
    NavHost(...) {
        //...
    }
    LaunchedEffect(navController) {
        onNavHostReady(navController)
    }
}

//wasmJsMain 原始碼集
@OptIn(ExperimentalComposeUiApi::class)
@ExperimentalBrowserHistoryApi
fun main() {
    val body = document.body ?: return
    ComposeViewport(body) {
        App(
          onNavHostReady = { it.bindToBrowserNavigation() }
        )
    }
}

//jsMain 原始碼集
@OptIn(ExperimentalComposeUiApi::class)
@ExperimentalBrowserHistoryApi
fun main() {
    onWasmReady {
        val body = document.body ?: return@onWasmReady
        ComposeViewport(body) {
            App(
                onNavHostReady = { it.bindToBrowserNavigation() }
            )
        }
    }
}
```

呼叫 `navController.bindToBrowserNavigation()` 後：
* 瀏覽器中顯示的 URL 會反映目前的路由（在 URL 片段中，位於 `#` 字元之後）。
* 應用程式會剖析手動輸入的 URL，將其轉換為應用程式內的目的地。

預設情況下，使用型別安全導航時，目的地會根據 [`kotlinx.serialization` 預設值](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 並附加引數，轉換為 URL 片段：
`<app package>.<serializable type>/<argument1>/<argument2>`。
例如：`example.org#org.example.app.StartScreen/123/Alice%2520Smith`。

### 自訂路由與 URL 之間的轉換

由於 Compose Multiplatform 應用程式是單頁應用程式 (SPA)，該框架會操作網址列以模擬常見的 Web 導航。
如果您希望使您的 URL 更具可讀性並將實作與 URL 模式隔離，您可以直接為螢幕分配名稱，或為目的地路由開發完全自訂的處理方式：

* 若要簡單地使 URL 具備可讀性，請使用 `@SerialName` 註解為可序列化物件或類別明確設定序列化名稱：

    ```kotlin
    // 這裡不再使用應用程式套件和物件名稱，
    // 此路由將被簡單地轉換為 URL "#start"
    @Serializable @SerialName("start") data object StartScreen
    ```
* 若要完全建構每個 URL，您可以使用選用的 `getBackStackEntryRoute` Lambda。

#### 完全自訂 URL

若要實作完全自訂的路由至 URL 轉換： 

1. 將選用的 `getBackStackEntryRoute` Lambda 傳遞給 `navController.bindToBrowserNavigation()` 函式，以指定必要時應如何將路由轉換為 URL 片段。
2. 如果需要，新增程式碼以捕捉網址列中的 URL 片段（當有人點擊或貼上您應用程式的 URL 時），並將 URL 轉換為路由以據此引導使用者。

以下是一個簡單的型別安全導航圖範例，用於後續的 Web 程式碼範例 (`commonMain/kotlin/org.example.app/App.kt`)：

```kotlin
// 用於導航圖中路由引數的可序列化物件和類別
@Serializable data object StartScreen
@Serializable data class Id(val id: Long)
@Serializable data class Patient(val name: String, val age: Long)

@Composable
internal fun App(
    onNavHostReady: suspend (NavController) -> Unit = {}
) = AppTheme {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = StartScreen
    ) {
        composable<StartScreen> {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text("Starting screen")
                // 開啟具有合適參數的 'Id' 螢幕的按鈕
                Button(onClick = { navController.navigate(Id(222)) }) {
                    Text("Pass 222 as a parameter to the ID screen")
                }
                // 開啟具有合適參數的 'Patient' 螢幕的按鈕
                Button(onClick = { navController.navigate(Patient( "Jane Smith-Baker", 33)) }) {
                    Text("Pass 'Jane Smith-Baker' and 33 to the Person screen")
                }
            }
        }
        composable<Id> {...}
        composable<Patient> {...}
    }
    LaunchedEffect(navController) {
        onNavHostReady(navController)
    }
}
```
{default-state="collapsed" collapsible="true" collapsed-title="NavHost(navController = navController, startDestination = StartScreen)"}

在 `wasmJsMain/kotlin/main.kt` 中，將 Lambda 新增至 `.bindToBrowserNavigation()` 呼叫：

```kotlin
@OptIn(
    ExperimentalComposeUiApi::class,
    ExperimentalBrowserHistoryApi::class,
    ExperimentalSerializationApi::class
)
fun main() {
    val body = document.body ?: return
    ComposeViewport(body) {
        App(
            onNavHostReady = { navController ->
                navController.bindToBrowserNavigation() { entry ->
                    val route = entry.destination.route.orEmpty()
                    when {
                        // 使用其序列化描述符識別路由
                        route.startsWith(StartScreen.serializer().descriptor.serialName) -> {
                            // 將對應的 URL 片段設定為 "#start"
                            // 而不是 "#org.example.app.StartScreen"
                            //
                            // 此字串必須始終以 `#` 字元開頭，以保持
                            // 處理過程在前端進行
                            "#start"
                        }
                        route.startsWith(Id.serializer().descriptor.serialName) -> {
                            // 存取路由引數
                            val args = entry.toRoute<Id>()

                            // 將對應的 URL 片段設定為 "#find_id_222"
                            // 而不是 "#org.example.app.ID%2F222"
                            "#find_id_${args.id}"
                        }
                        route.startsWith(Patient.serializer().descriptor.serialName) -> {
                            val args = entry.toRoute<Patient>()
                            // 將對應的 URL 片段設定為 "#patient_Jane%20Smith-Baker_33"
                            // 而不是 "#org.company.app.Patient%2FJane%2520Smith-Baker%2F33"
                            "#patient_${args.name}_${args.age}"
                        }
                        // 不為所有其他路由設定 URL 片段
                        else -> ""
                    }
                }
            }
        )
    }
}
```
<!--{default-state="collapsed" collapsible="true" collapsed-title="navController.bindToBrowserNavigation() { entry ->"}-->

> 確保每個與路由對應的字串都以 `#` 字元開頭，以便將資料保留在 URL 片段內。
> 否則，當使用者複製並貼上 URL 時，瀏覽器會嘗試存取錯誤的端點，而不是將控制權交給您的應用程式。
> 
{style="note"}

如果您的 URL 具有自訂格式，您應該新增反向處理，以將手動輸入的 URL 與目的地路由進行配對。
執行配對的程式碼需要在 `navController.bindToBrowserNavigation()` 呼叫將瀏覽器位置繫結到導航圖之前執行：

<Tabs>
    <TabItem title="Kotlin/Wasm">
        <code-block lang="Kotlin" code="        @OptIn(&#10;            ExperimentalComposeUiApi::class,&#10;            ExperimentalBrowserHistoryApi::class,&#10;            ExperimentalSerializationApi::class&#10;        )&#10;        fun main() {&#10;            val body = document.body ?: return&#10;            ComposeViewport(body) {&#10;                App(&#10;                    onNavHostReady = { navController -&gt;&#10;                        // 存取目前 URL 的片段子字串&#10;                        val initRoute = window.location.hash.substringAfter('#', &quot;&quot;)&#10;                        when {&#10;                            // 識別對應的路由並導航至該路由&#10;                            initRoute.startsWith(&quot;start&quot;) -&gt; {&#10;                                navController.navigate(StartScreen)&#10;                            }&#10;                            initRoute.startsWith(&quot;find_id&quot;) -&gt; {&#10;                                // 在導航之前剖析字串以提取路由參數&#10;                                val id = initRoute.substringAfter(&quot;find_id_&quot;).toLong()&#10;                                navController.navigate(Id(id))&#10;                            }&#10;                            initRoute.startsWith(&quot;patient&quot;) -&gt; {&#10;                                val name = initRoute.substringAfter(&quot;patient_&quot;).substringBefore(&quot;_&quot;)&#10;                                val id = initRoute.substringAfter(&quot;patient_&quot;).substringAfter(&quot;_&quot;).toLong()&#10;                                navController.navigate(Patient(name, id))&#10;                            }&#10;                        }&#10;                        navController.bindToBrowserNavigation() { ... }&#10;                    }&#10;                )&#10;            }&#10;        }"></code-block>
    </TabItem>
    <TabItem title="Kotlin/JS">
        <code-block lang="kotlin" code="        @OptIn(&#10;            ExperimentalComposeUiApi::class,&#10;            ExperimentalBrowserHistoryApi::class,&#10;            ExperimentalSerializationApi::class&#10;        )&#10;        fun main() {&#10;            onWasmReady {&#10;                val body = document.body ?: return@onWasmReady&#10;                ComposeViewport(body) {&#10;                    App(&#10;                        onNavHostReady = { navController -&gt;&#10;                            // 存取目前 URL 的片段子字串&#10;                            val initRoute = window.location.hash.substringAfter('#', &quot;&quot;)&#10;                            when {&#10;                                // 識別對應的路由並導航至該路由&#10;                                initRoute.startsWith(&quot;start&quot;) -&gt; {&#10;                                    navController.navigate(StartScreen)&#10;                                }&#10;                                initRoute.startsWith(&quot;find_id&quot;) -&gt; {&#10;                                    // 在導航之前剖析字串以提取路由參數&#10;                                    val id = initRoute.substringAfter(&quot;find_id_&quot;).toLong()&#10;                                    navController.navigate(Id(id))&#10;                                }&#10;                                initRoute.startsWith(&quot;patient&quot;) -&gt; {&#10;                                    val name = initRoute.substringAfter(&quot;patient_&quot;).substringBefore(&quot;_&quot;)&#10;                                    val id = initRoute.substringAfter(&quot;patient_&quot;).substringAfter(&quot;_&quot;).toLong()&#10;                                    navController.navigate(Patient(name, id))&#10;                                }&#10;                            }&#10;                            navController.bindToBrowserNavigation() { ... }&#10;                        }&#10;                    )&#10;                }&#10;            }&#10;        }"></code-block>
    </TabItem>
</Tabs>