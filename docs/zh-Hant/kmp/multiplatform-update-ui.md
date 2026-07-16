[//]: # (title: 更新使用者介面)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
    <br/>
    <p>這是<strong>使用共用邏輯與原生 UI 建立 Kotlin Multiplatform 應用程式</strong>教學的第二部分。在繼續之前，請確保您已完成先前的步驟。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/multiplatform-create-first-app" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the first part of the Create a Kotlin Multiplatform app with shared logic and native UI tutorial. Create your Kotlin Multiplatform app Update the user interface Add dependencies Share more logic Wrap up your project">建立您的 Kotlin Multiplatform 應用程式</Links><br/>
       <img src="icon-2.svg" width="20" alt="第二步"/> <strong>更新使用者介面</strong><br/>
       <img src="icon-3-todo.svg" width="20" alt="第三步"/> 新增相依性<br/>       
       <img src="icon-4-todo.svg" width="20" alt="第四步"/> 共用更多邏輯<br/>
       <img src="icon-5-todo.svg" width="20" alt="第五步"/> 完結您的專案<br/>
    </p>
</tldr>

為了建置使用者介面，您將在專案的 Android 部分使用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 工具組，並在 iOS 部分使用 [SwiftUI](https://developer.apple.com/xcode/swiftui/)。
這兩者都是宣告式 UI 架構，您會看到 UI 實作上的相似之處。在這兩種情況下，
您都會將資料儲存在 `phrases` 變數中，隨後對其進行迭代以產生 `Text` 項目列表。

## 更新 Android 部分

`composeApp` 模組包含一個 Android 應用程式，定義了其主 Activity 與 UI 檢視，並將 `shared` 模組作為一般的 Android 程式庫使用。該應用程式的 UI 使用了 Compose Multiplatform 架構。

進行一些更改並查看它們如何反映在 UI 中：

1. 導覽至 `composeApp/src/androidMain/.../greetingkmp` 目錄下的 `App.kt` 檔案。
2. 找到 `Greeting` 類別呼叫。選取 `greet()` 函式，按右鍵並選取 **跳轉到** | **宣告或用法**。
   您會看到這是來自您在先前步驟中編輯的 `shared` 模組的同一個類別。
3. 在 `Greeting.kt` 檔案中，更新 `Greeting` 類別，使 `greet()` 函式傳回字串列表：

   ```kotlin
   class Greeting {
   
       private val platform: Platform = getPlatform()
   
       fun greet(): `List<String>` = buildList {
           add(if (Random.nextBoolean()) "Hi!" else "Hello!")
           add("Guess what this is! > ${platform.name.reversed()}!")
       }
   }
   ```

4. 回到 `App.kt` 檔案並更新 `App()` 實作：

   ```kotlin
   @Composable
   @Preview
   fun App() {
       MaterialTheme {
           val greeting = remember { Greeting().greet() }
   
           Column(
               modifier = Modifier
                   .padding(all = 10.dp)
                   .safeContentPadding()
                   .fillMaxSize(),
               verticalArrangement = Arrangement.spacedBy(8.dp),
           ) {
               greeting.forEach { greeting ->
                   Text(greeting)
                   HorizontalDivider()
               }
           }
       }
   }
   ```

   這裡 `Column` Composable 會顯示每個 `Text` 項目，並在它們周圍加入填補（padding）以及項目之間的間距。

5. 根據 IntelliJ IDEA 的建議匯入缺失的相依性。
6. 現在您可以執行 Android 應用程式，查看它如何顯示字串列表：

   ![更新後的 Android 多平台應用程式 UI](first-multiplatform-project-on-android-2.png){width=300}

## 處理 iOS 模組

`iosApp` 目錄會編譯為一個 iOS 應用程式。它相依於 `shared` 模組並將其作為 iOS 架構使用。該應用程式的 UI 是使用 Swift 編寫的。

實作與 Android 應用程式相同的變更：

1. 在 IntelliJ IDEA 中，於 **專案** 工具視窗的專案根目錄下找到 `iosApp/iosApp` 資料夾。
2. 開啟 `iosApp/ContentView.swift` 檔案，在 `Greeting().greet()` 呼叫上按右鍵，然後選取 **跳轉到** | **定義**。

    您將會看到 `shared` 模組中定義的 Kotlin 函式的 Objective-C 宣告。當從 Objective-C/Swift 使用時，Kotlin 型別會表示為 Objective-C 型別。在這裡，`greet()` 函式在 Kotlin 中傳回 `List<String>`，而在 Swift 中則被視為傳回 `NSArray<NSString>`。如需更多關於型別對應的資訊，請參閱 [與 Swift/Objective-C 的互通性](https://kotlinlang.org/docs/native-objc-interop.html)。

3. 更新 SwiftUI 程式碼，以與 Android 應用程式相同的方式顯示項目列表：

    ```Swift
    struct ContentView: View {
       let phrases = Greeting().greet()
    
       var body: some View {
           List(phrases, id: \.self) {
               Text($0)
           }
       }
    }
    ```

    * `greet()` 呼叫的結果儲存在 `phrases` 變數中（Swift 中的 `let` 與 Kotlin 的 `val` 類似）。
    * `List` 函式會產生 `Text` 項目列表。

4. 啟動 iOS 執行配置以查看變更：

    ![更新後的 iOS 多平台應用程式 UI](first-multiplatform-project-on-ios-2.png){width=300}

## 可能的問題與解決方案

### Xcode 在呼叫共用框架的程式碼中回報錯誤

如果您正在使用 Xcode，您的 Xcode 專案可能仍在使用舊版本的框架。
要解決此問題，請返回 IntelliJ IDEA 並重新建置專案，或啟動 iOS 執行配置。

### Xcode 在匯入共用框架時回報錯誤

如果您正在使用 Xcode，可能需要清除快取的二進位檔案：嘗試透過在主選單中選擇 **Product | Clean Build Folder** 來重設環境。

## 下一步

在教學的下一部分中，您將學習關於相依性的知識，並新增一個第三方函式庫以擴充專案的功能。

**[繼續下一步](multiplatform-dependencies.md)**

## 取得協助

* **Kotlin Slack**。取得[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**。[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。