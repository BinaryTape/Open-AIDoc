[//]: # (title: Compose 中的導覽)

[Android 的 Navigation 程式庫](https://developer.android.com/guide/navigation)支援在 Jetpack Compose 中進行導覽。
Compose Multiplatform 團隊為 AndroidX Navigation 程式庫貢獻了多平台支援。

除了在應用程式內容片段之間進行實際導覽外，該程式庫還解決了基本的導覽問題：

* 以型別安全的方式在目的地之間傳遞資料。
* 透過保持清晰且可存取的導覽歷程記錄，輕鬆追蹤使用者在應用程式中的歷程。
* 支援深層連結 (deep linking) 機制，允許將使用者導覽至應用程式中一般工作流程之外的特定位置。
* 支援導覽時的統一動畫和轉場，並允許以最少的額外工作實作常見模式（如返回手勢）。

如果您對基礎知識已有足夠的了解，請前往 [導覽與路由](compose-navigation-routing.md)，了解如何在跨平台專案中利用 Navigation 程式庫。
否則，請繼續閱讀以了解該程式庫運作的基本概念。

> 您可以在我們的 [新功能](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html) 中追蹤 Navigation 程式庫多平台版本的變更，
> 或是在 [Compose Multiplatform 變更記錄](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md) 中關注特定的 EAP 發佈。
>
{style="tip"}

## Compose Navigation 的基本概念

Navigation 程式庫使用以下概念來對應導覽使用案例：

* **導覽圖 (navigation graph)** 描述了應用程式內所有可能的目的地及其之間的連接。
  導覽圖可以巢狀嵌套，以適應應用程式中的子流程。
* **目的地 (destination)** 是導覽圖中可以導覽至的節點。
    這可以是一個可組合項 (composable)、一個巢狀導覽圖或一個對話方塊。
    當使用者導覽至該目的地時，應用程式會顯示其內容。
* **路由 (route)** 識別一個目的地並定義導覽至該目的地所需的引數，但不描述 UI。
    透過這種方式，資料與呈現分離，這讓您可以使每個 UI 實作片段獨立於整體應用程式結構。
    例如，這讓在專案中測試和重新編排可組合項變得更加容易。

牢記這些概念，Navigation 程式庫實作了基本規則來引導您的導覽架構：

<!--* 有一個固定的 _起始目的地_，這是使用者啟動應用程式時**通常**會看到的第一個畫面。
  初始設定或登入等條件畫面不應被視為
  起始目的地，即使它們對於新使用者來說是不可避免的，請考慮主要工作流程。-->
<!-- Android 引入了這個概念，但在我們的文件中到目前為止還沒有用到它。以後可能會。 -->

* 應用程式將使用者的路徑表示為目的地的堆疊，即 **返回堆疊 (back stack)**。
    預設情況下，每當使用者導覽至新目的地時，該目的地就會被新增至堆疊頂部。
    您可以使用返回堆疊讓導覽更加直觀：
    您可以將目前的目的地從堆疊頂部彈出 (pop)，然後自動返回到上一個目的地，而不是直接在兩者之間來回導覽。
* 每個目的地都可以有一組與其關聯的 **深層連結 (deep links)**：
    當應用程式從作業系統接收到連結時，應引導至該目的地的 URI 模式。

## 基本導覽範例

要使用 Navigation 程式庫，請將以下相依性新增至您的 `commonMain` 原始碼集：

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

設定導覽時，建議遵循以下步驟順序：

1. 定義您的路由。
    為每個目的地建立一個[可序列化 (serializable)](https://kotlinlang.org/docs/serialization.html) 的物件或資料類別，以保存對應目的地所需的引數。
2. 建立一個 `NavController`，這將是您的導覽介面，請將其置於可組合項階層結構中足夠高的位置，以便所有可組合項都能存取它。
   `NavController` 持有應用程式的返回堆疊，並提供在導覽圖中目的地之間切換的方法。
3. 設計您的導覽圖，選擇其中一個路由作為起始目的地。
   為此，請建立一個 `NavHost` 可組合項來持有導覽圖（描述所有可導覽的目的地）。

以下是應用程式內導覽基礎架構的一個基本範例：

```kotlin
// 建立路由
@Serializable
object Profile
@Serializable
object FriendsList

// 建立 NavController
val navController = rememberNavController()

// 建立 NavHost，其導覽圖由提供的目的地組成
NavHost(navController = navController, startDestination = Profile) {
    composable<Profile> { ProfileScreen( /* ... */ ) }
    composable<FriendsList> { FriendsListScreen( /* ... */ ) }
    // 您可以以類似方式新增更多目的地
}
```

### Navigation 程式庫的主要類別

Navigation 程式庫提供以下核心型別：

* `NavController`：
    提供核心導覽功能的 API：在目的地之間切換、處理深層連結、管理返回堆疊等。
    <!--您應該在可組合項階層結構的高處建立 `NavController`，高到所有需要引用它的可組合項都可以引用。
    這樣，您可以使用 `NavController` 作為更新畫面外可組合項的單一事實來源。
    [NB: 這對於試圖涵蓋基礎知識的人來說似乎沒什麼用。]-->
* `NavHost`：根據導覽圖顯示目前目的地內容的可組合項。
    每個 `NavHost` 都有一個必要的 `startDestination` 參數：對應於使用者啟動應用程式時應該看到的第一個畫面的目的地。
* `NavGraph`：
    描述應用程式內所有可能的目的地及其之間的連接。
    導覽圖通常定義為傳回 `NavGraph` 的生成器 lambda，例如在 `NavHost` 宣告中。

除了核心型別的功能外，Navigation 組件還提供動畫和轉場、深層連結支援、型別安全性、`ViewModel` 支援以及其他用於處理應用程式導覽的便利功能。

## 導覽使用案例

### 前往目的地

要導覽至目的地，請呼叫 `NavController.navigate()` 函式。延續上面的範例：

```kotlin
Button(onClick = { navController.navigate(Profile) }) {
    Text("前往個人資料")
}
```

### 傳遞引數至目的地

設計導覽圖時，您可以將路由定義為帶有參數的資料類別，例如：

```kotlin
@Serializable
data class Profile(val name: String)
```

要將引數傳遞至目的地，請在導覽至該目的地時，將引數傳遞給對應類別的建構函式。

```kotlin
Button(onClick = { navController.navigate(Profile("Alice")) }) {
    Text("前往個人資料")
}
```

然後在目的地擷取資料：

```kotlin
composable<Profile> { backStackEntry ->
    val profile: Profile = backStackEntry.toRoute()
    
    // 在任何需要使用者名稱的地方使用 `profile.name`
}
```

### 導覽時擷取複雜資料

在目的地之間導覽時，請考慮僅在它們之間傳遞必要的最小資訊。
反映應用程式整體狀態的檔案或複雜物件應儲存在資料層：
當使用者到達目的地時，UI 應從單一事實來源載入實際資料。

例如：

* **不要**傳遞整個使用者個人資料；**要**傳遞使用者識別碼 (ID)，以便在目的地擷取個人資料。
* **不要**傳遞圖片物件；**要**傳遞 URI 或檔案名稱，以便在目的地從來源載入圖片。
* **不要**傳遞應用程式狀態或 ViewModel；**要**僅傳遞目的地畫面運作所需的資訊。

這種方法有助於防止在配置變更期間遺失資料，並防止在引用物件被更新或更改時發生任何不一致。

有關在應用程式中正確實作資料層的指引，請參閱 [Android 關於資料層的文章](https://developer.android.com/topic/architecture/data-layer)。

### 管理返回堆疊

返回堆疊由 `NavController` 類別控制。
與任何其他堆疊一樣，`NavController` 將新項目推送 (push) 到堆疊頂部，並從頂部彈出 (pop) 它們：

* 應用程式啟動時，返回堆疊中出現的第一個項目是在 `NavHost` 中定義的起始目的地。
* 每個 `NavController.navigate()` 呼叫預設都會將給定的目的地推送至堆疊頂部。
* 使用返回手勢、返回按鈕或 `NavController.popBackStack()` 方法會將目前的目的地從堆疊中彈出，並將使用者帶回上一個目的地。
    如果使用者是透過深層連結進入目前目的地的，則彈出堆疊會將他們帶回上一個應用程式。
    或者，`NavController.navigateUp()` 函式僅在 `NavController` 的上下文中引導使用者在應用程式內移動。

Navigation 程式庫在處理返回堆疊方面具有一定的靈活性。
您可以：

* 指定返回堆疊中的特定目的地並導覽至該目的地，同時彈出堆疊中在該目的地之上（在其之後進入）的所有內容。
* 導覽至目的地 X，同時彈出返回堆疊直到目的地 Y（透過在 `.navigate()` 呼叫中新增 `popUpTo()` 引數）。
* 處理彈出空返回堆疊的情況（這會讓使用者停留在空白畫面上）。
* 為應用程式的不同部分維護多個返回堆疊。
    例如，對於具有底部導覽列的應用程式，您可以為每個分頁維護獨立的巢狀導覽圖，同時在分頁切換時儲存並還原導覽狀態。
    或者，您可以為每個分頁建立獨立的 `NavHost`，這會使設定稍微複雜一些，但在某些情況下可能更容易追蹤。

有關詳細資訊和使用案例，請參閱 [關於返回堆疊的 Jetpack Compose 文件](https://developer.android.com/guide/navigation/backstack)。

### 深層連結

Navigation 程式庫允許您將特定的 URI、操作或 MIME 型別與目的地關聯。
這種關聯稱為 **深層連結 (deep link)**。

預設情況下，深層連結不會向外部應用程式公開：您需要為每個目標發行版本向作業系統註冊適當的 URI 配置。

有關建立、註冊和處理深層連結的詳細資訊，請參閱 [深層連結](compose-navigation-deep-links.md)。

### 返回手勢

多平台 Navigation 程式庫會將各個平台上的返回手勢轉換為導覽至上一個畫面（例如，在 iOS 上這是一個簡單的向後滑動，而在桌面上則是 <shortcut>Esc</shortcut> 鍵）。

預設情況下，在 iOS 上，返回手勢會觸發原生風格的滑動轉場動畫至另一個畫面。
如果您使用 `enterTransition` 或 `exitTransition` 引數自訂了 `NavHost` 動畫，則預設動畫將不會觸發：

```kotlin
NavHost(
    navController = navController,
    startDestination = Profile,
    // 明確指定轉場會關閉預設動畫，
    // 改用選定的動畫 
    enterTransition = { slideInHorizontally() },
    exitTransition = { slideOutVertically() }
) { ... }
```

在 Android 上，您可以[在資訊清單檔案中](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture#opt-predictive)啟用或停用返回手勢處理常式。

在 iOS 上，該處理常式預設為啟用。
要停用它，請在 `ViewController` 配置中設定此旗標：

```kotlin
ComposeUIViewController(
    configure = { enableBackGesture = false }
) {
    App()
}
```

## 替代導覽解決方案

如果基於 Compose 的導覽實作不符合您的需求，還有一些第三方替代方案可供評估：

| 名稱                                                | 描述                                                                                                                                                     |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Voyager](https://voyager.adriel.cafe)              | 一種務實的導覽方法                                                                                                                              |
| [Decompose](https://arkivanov.github.io/Decompose/) | 一種進階的導覽方法，涵蓋了完整生命週期和任何潛在的相依注入                                                        |
| [Circuit](https://slackhq.github.io/circuit/)       | 一種為 Kotlin 應用程式設計的 Compose 驅動架構，具備導覽和進階狀態管理功能。                                                            |
| [Appyx](https://bumble-tech.github.io/appyx/)       | 具備手勢控制的模型驅動導覽                                                                                                                    |
| [PreCompose](https://tlaster.github.io/PreCompose/) | 受 Jetpack Lifecycle、ViewModel、LiveData 和 Navigation 啟發的導覽與 ViewModel                                                                  |

如果您鎖定 iOS 平台，且希望在導覽 UI 中使用系統呈現的效果，例如 [Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)，請考慮[將導覽遷移至原生 SwiftUI](ios-liquid-glass.md)，同時保留 Compose 處理畫面內容。

## 下一步

Android 開發者入口網站深入介紹了 Compose 導覽。
雖然這些文件有時使用僅限 Android 的範例，但基本的引導和導覽原則對於多平台 (Multiplatform) 是相同的：

* [Compose 導覽總覽](https://developer.android.com/develop/ui/compose/navigation)。
* [Jetpack Navigation 起始頁面](https://developer.android.com/guide/navigation)，其中包含關於導覽圖、在其中移動以及其他導覽使用案例的子頁面。