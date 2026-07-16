[//]: # (title: 將相依性新增至您的專案)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能和 Kotlin Multiplatform 支援。</p>
    <br/>   
    <p>這是<strong>建立具有共享邏輯和原生 UI 的 Kotlin Multiplatform 應用程式</strong>教學的第三部分。在繼續之前，請確保您已完成前面的步驟。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/multiplatform-create-first-app" summary="本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能和 Kotlin Multiplatform 支援。這是建立具有共享邏輯和原生 UI 的 Kotlin Multiplatform 應用程式教學的第一部分。建立您的 Kotlin Multiplatform 應用程式、更新使用者介面、新增相依性、共享更多邏輯、完成您的專案">建立您的 Kotlin Multiplatform 應用程式</Links><br/>
        <img src="icon-2-done.svg" width="20" alt="第二步"/> <Links href="/kmp/multiplatform-update-ui" summary="本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩款 IDE 共享相同的核心功能和 Kotlin Multiplatform 支援。這是建立具有共享邏輯和原生 UI 的 Kotlin Multiplatform 應用程式教學的第二部分。在繼續之前，請確保您已完成前面的步驟。建立您的 Kotlin Multiplatform 應用程式、更新使用者介面、新增相依性、共享更多邏輯、完成您的專案">更新使用者介面</Links><br/>
        <img src="icon-3.svg" width="20" alt="第三步"/> <strong>新增相依性</strong><br/>
        <img src="icon-4-todo.svg" width="20" alt="第四步"/> 共享更多邏輯<br/>
        <img src="icon-5-todo.svg" width="20" alt="第五步"/> 完成您的專案<br/>
    </p>
</tldr>

您已經建立了第一個跨平台的 Kotlin Multiplatform 專案！現在讓我們學習如何新增對第三方連結庫的相依性，這對於建置成功的跨平台應用程式至關重要。

## 相依性類型

在 Kotlin Multiplatform 專案中，您可以使用兩種類型的相依性：

* _多平台相依性 (Multiplatform dependencies)_。這些是支援多個目標的多平台程式庫，可以在共通原始碼集 `commonMain` 中使用。

  許多現代 Android 程式庫已經支援多平台，例如 [Koin](https://insert-koin.io/)、[Apollo](https://www.apollographql.com/) 和 [Okio](https://square.github.io/okio/)。您可以在 [klibs.io](https://klibs.io/) 上找到更多多平台程式庫，這是由 JetBrains 提供的實驗性搜尋服務，用於探索 Kotlin Multiplatform 程式庫。

* _原生相依性 (Native dependencies)_。這些是來自相關生態系統的常規程式庫。在原生專案中，您通常在 Android 中使用 Gradle，在 iOS 中使用 CocoaPods 或其他相依管理器來處理它們。 
  
  當您處理共享模組時，通常在想要使用平台 API（如安全存儲）時，仍需要原生相依性。您可以將原生相依性新增到原生原始碼集 `androidMain` 和 `iosMain` 中。

對於這兩種類型的相依性，您都可以使用本機和外部存儲庫。

## 新增多平台相依性

> 如果您有開發 Android 應用程式的經驗，新增多平台相依性與在一般 Android 專案中新增 Gradle 相依性非常相似。唯一的區別在於您需要指定原始碼集。
>
{style="tip"}

讓我們回到應用程式，讓問候語更具節日氛圍。除了裝置資訊外，再新增一個功能來顯示距離元旦還有多少天。`kotlinx-datetime` 程式庫具有完整的多平台支援，是在共享程式碼中處理日期的最便捷方式。

1. 開啟位於 `shared` 目錄中的 `build.gradle.kts` 檔案。
2. 在 `commonMain` 原始碼集相依性中新增以下相依性以及 Kotlin 時間 opt-in：

    ```kotlin
    kotlin {
        //... 
        sourceSets {
            all { languageSettings.optIn("kotlin.time.ExperimentalTime") }
   
            commonMain.dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            } 
        }
    }
    ```

3. 選取 **Build | Sync Project with Gradle Files** 功能表項目，或點擊建置指令碼編輯器中的 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案： ![同步 Gradle 檔案](gradle-sync.png){width=50}
4. 在 `shared/src/commonMain/.../greetingkmp` 目錄上按右鍵，然後選取 **New | Kotlin Class/File** 以建立一個新檔案 `NewYear.kt`。
5. 使用 `datetime` 的日期運算，更新該檔案並加入一個計算從今天到新年天數的簡短函式：
   
   ```kotlin
   fun daysUntilNewYear(): Int {
       val today = Clock.System.todayIn(TimeZone.currentSystemDefault())
       val closestNewYear = LocalDate(today.year + 1, 1, 1)
       return today.daysUntil(closestNewYear)
   }
   
   fun daysPhrase(): String = "There are only ${daysUntilNewYear()} days left until New Year! 🎆"
   ```
6. 根據 IDE 的建議新增所有必要的匯入。
   確保您從 `kotlin.time` 套件匯入 `Clock` 類別。
7. 在 `Greeting.kt` 檔案中，更新 `Greeting` 類別以查看結果：
    
    ```kotlin
    class Greeting {
        private val platform: Platform = getPlatform()
   
        fun greet(): `List<String>` = buildList {
            add(if (Random.nextBoolean()) "Hi!" else "Hello!")
            add("Guess what this is! > ${platform.name.reversed()}!")
            add(daysPhrase())
        }
    }
    ```

8. 要查看結果，請從 IntelliJ IDEA 重新執行您的 **composeApp** 和 **iosApp** 執行組態：

![已更新且包含外部相依性的行動多平台應用程式](first-multiplatform-project-3.png){width=500}

## 下一步

在教學的下一部分中，您將在專案中新增更多相依性和更複雜的邏輯。

**[繼續前往下一部分](multiplatform-upgrade-app.md)**

### 延伸閱讀

* 了解如何處理各種類型的多平台相依性：[Kotlin 程式庫、Kotlin Multiplatform 程式庫和其他多平台專案](multiplatform-add-dependencies.md)。
* 了解如何[新增 Android 相依性](multiplatform-android-dependencies.md)以及[使用或不使用 CocoaPods 新增 iOS 相依性](multiplatform-ios-dependencies.md)，以便在平台專用的原始碼集中使用。
* 查看範例專案中[如何使用 Android 和 iOS 程式庫](multiplatform-samples.md)的範例。

## 獲取協助

* **Kotlin Slack**。獲取[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**。[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。