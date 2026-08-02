[//]: # (title: 建立您的 Kotlin Multiplatform 程式庫 – 教學)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩個 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
</tldr>

在本教學中，您將學習如何在 IntelliJ IDEA 中建立一個多平台程式庫，將該程式庫發佈到本機 Maven 存儲庫，並將其作為相依性新增至另一個專案中。

本教學基於我們的 [多平台程式庫樣板 (multiplatform library template)](https://github.com/Kotlin/multiplatform-library-template)，這是一個包含產生費氏數列 (Fibonacci sequence) 函式的簡單程式庫。

## 設定環境

[安裝所有必要的工具並將其更新至最新版本](quickstart.md)。

## 建立專案

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project from Version Control**。
2. 輸入 [多平台程式庫樣板專案](https://github.com/Kotlin/multiplatform-library-template) 的 URL：

    ```text
    https://github.com/Kotlin/multiplatform-library-template
    ```
   
3. 點擊 **Clone**。

## 檢查專案結構

Kotlin Multiplatform 程式庫樣板專案為開發 Kotlin Multiplatform 程式庫提供了基礎結構。此樣板有助於建立可在各種平台上運行的程式庫。

在樣板專案中，`library` 是核心模組，包含多平台程式庫的主要原始碼與組建資源。

![多平台程式庫專案結構](multiplatform-library-template-project.png){width=350}

`library` 模組的結構旨在容納共享程式碼以及平台特定的實作。以下是其原始碼內容的分解：

* **`commonMain`**：包含在所有目標平台之間共享的 Kotlin 程式碼。這裡是您放置不依賴任何平台特定 API 的程式碼之處。
* **`androidMain`、`iosMain`、`jvmMain` 與 `linuxX64Main`**：包含針對 Android、iOS、JVM 與 Linux 平台的特定程式碼。這裡是您實作這些平台獨有功能的地方。
* **`commonTest`、`androidUnitTest`、`iosTest`、`jvmTest` 與 `linuxX64Test`**：分別包含針對共享 `commonMain` 程式碼的測試，以及針對 Android、iOS、JVM 與 Linux 平台的特定測試。

讓我們關注在所有平台間共享的 `library` 程式碼。在 `src/commonMain/kotlin` 目錄中，您可以找到 `CustomFibi.kt` 檔案，其中包含定義費氏數列產生器的 Kotlin Multiplatform 程式碼：

```kotlin
package io.github.kotlin.fibonacci

// 定義產生費氏數列的函式
fun generateFibi() = sequence {
    var a = firstElement
    yield(a)
    
    var b = secondElement
    yield(b)
    
    while (true) {
        val c = a + b
        yield(c)
        a = b
        b = c
    }
}

// 宣告 `firstElement` 與 `secondElement` 的預期值
expect val firstElement: Int
expect val secondElement: Int
```

`firstElement` 與 `secondElement` 屬性是供平台特定程式碼實作的佔位符號。每個目標平台都應透過在各自的原始碼集中使用 `actual` 關鍵字來提供實際值。

`expect` 宣告會與 `actual` 實作[進行配對](multiplatform-connect-to-apis.md#expected-and-actual-functions-and-properties)。當編寫需要平台特定行為的跨平台程式碼時，此機制非常有用。

在這種情況下，多平台程式庫樣板包含了 `firstElement` 與 `secondElement` 屬性的平台特定實作。`androidMain`、`iosMain`、`jvmMain` 與 `linuxX64Main` 目錄包含為這些屬性提供值的 `actual` 宣告。

例如，以下是包含在 `androidMain/kotlin/fibiprops.android.kt` 中的 Android 實作：

```kotlin
package io.github.kotlin.fibonacci

actual val firstElement: Int = 1
actual val secondElement: Int = 2
```

其他平台遵循相同的模式，僅在 `firstElement` 與 `secondElement` 屬性的值上有所變化。

## 新增一個新平台

既然您已熟悉樣板中共享程式碼與平台特定程式碼的運作方式，讓我們透過新增對額外平台的支援來擴充專案。

透過使用 [`expect`/`actual` 機制](multiplatform-connect-to-apis.md#expected-and-actual-functions-and-properties)來配置對 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) 平台的支援，然後為 `firstElement` 與 `secondElement` 屬性實作平台特定的功能。

### 將 Kotlin/Wasm 目標新增至您的專案

1. 在 `library/build.gradle.kts` 檔案中，新增 Kotlin/Wasm 目標 (`wasmJs`) 與原始碼集：

    ```kotlin
    kotlin {
        // ...
        @OptIn(org.jetbrains.kotlin.gradle.ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
        // ...
        sourceSets {
            //...
            wasmJsMain.dependencies {
                // Wasm 特定的相依性
            }
        }
    }
    ```

2. 點擊出現在組建檔案中的 **Sync Gradle Changes** 圖示 (![Gradle 同步圖示](gradle-sync-icon.png){width=30}{type="joined"}) 來同步 Gradle 檔案。或者，點擊 Gradle 工具視窗中的重新整理按鈕。

### 為 Wasm 建立平台特定程式碼

新增 Wasm 目標後，您需要一個 Wasm 目錄來存放 `firstElement` 與 `secondElement` 的平台特定實作：

1. 右鍵點擊 `library/src` 目錄，然後選取 **New | Directory**。 
2. 從 **Gradle Source Sets** 清單中選取 **wasmJsMain/kotlin**。

   ![Gradle 原始碼集清單](gradle-source-sets-list.png){width=450}

3. 右鍵點擊新建立的 `wasmJsMain/kotlin` 目錄，然後選取 **New | Kotlin Class/File**。 
4. 輸入 **fibiprops.wasm** 作為檔案名稱，並選取 **File**。
5. 將以下程式碼新增至 `fibiprops.wasm.kt` 檔案中：

    ```kotlin
    package io.github.kotlin.fibonacci
    
    actual val firstElement: Int = 3
    actual val secondElement: Int = 5
    ```

    這段程式碼設定了一個 Wasm 特定的實作，將 `firstElement` 的 `actual` 值定義為 `3`，將 `secondElement` 定義為 `5`。

### 組建專案

確保您的專案在新平台上能正確編譯：

1. 選取 **View** | **Tool Windows** | **Gradle** 以開啟 Gradle 工具視窗。
2. 在 **multiplatform-library-template** | **library** | **Tasks** | **build** 中，執行 **build** 任務。

   ![Gradle 工具視窗](library-gradle-build-window-tasks.png){width=450}

   或者，在終端從 `multiplatform-library-template` 根目錄執行以下指令：

   ```bash
   ./gradlew build
   ```

您可以在 **Build** 工具視窗中看到成功的輸出。 

## 將您的程式庫發佈到本機 Maven 存儲庫

您的多平台程式庫已準備好在本地發佈，以便您可以在同一部電腦上的其他專案中使用它。

要發佈您的程式庫，請按如下方式使用 [`maven-publish`](https://docs.gradle.org/current/userguide/publishing_maven.html) Gradle 外掛程式：

1. 在 `library/build.gradle.kts` 檔案中，找到 `plugins { }` 區塊並套用 `maven-publish` 外掛程式：

   ```kotlin
      plugins {
          // ...
          // 新增以下行：
          id("maven-publish")
      }
   ```

2. 找到 `mavenPublishing {}` 區塊，並註解掉 `signAllPublications()` 呼叫，以表示該發佈僅限本機：

    ```kotlin
    mavenPublishing {
        // ...
        // 註解掉以下呼叫：
        // signAllPublications()
    }
    ```

3. 點擊出現在組建檔案中的 **Sync Gradle Changes** 圖示 (![Gradle 同步圖示](gradle-sync-icon.png){width=30}{type="joined"}) 來同步 Gradle 檔案。或者，點擊 Gradle 工具視窗上的重新整理按鈕。

4. 在 Gradle 工具視窗中，前往 **multiplatform-library-template** | **Tasks** | **publishing** 並執行 **publishToMavenLocal** Gradle 任務。

   ![多平台程式庫 Gradle 工具視窗](publish-maven-local-gradle-task.png){width=450}

   或者，在終端從 `multiplatform-library-template` 根目錄執行以下指令：

   ```bash
   ./gradlew publishToMavenLocal
   ```

您的程式庫已發佈到本機 Maven 存儲庫。 

要找到您發佈的產物，請使用您的檔案管理員或終端，並導覽至 `~\.m2\repository\io\github\kotlin\library\1.0.0\` 目錄。

## 將您的程式庫作為相依性新增至另一個專案中

將多平台程式庫發佈到本機 Maven 存儲庫後，您就可以在同一部電腦上的其他 Kotlin 專案中使用它。

在您取用端專案的 `settings.gradle.kts` 檔案中，新增從本機存儲庫尋找套件的選項： 

```kotlin
dependencyResolutionManagement {
    repositories {
        // ...
        mavenLocal()
    }
}
```

在模組的 `build.gradle.kts` 檔案中，新增對已發佈程式庫的相依性。如果您要將其新增至另一個多平台專案，可以將其新增至共享或平台特定的原始碼集：

```kotlin
kotlin {
    //...
    sourceSets {
        // 針對所有平台
        commonMain.dependencies {
                implementation("io.github.kotlin:library:1.0.0")
        }
        // 或針對特定平台
        wasmJsMain.dependencies {
            implementation("io.github.kotlin:library:1.0.0")
        }
    }
}
```

`implementation()` 呼叫接受在您程式庫的 `build.gradle.kts` 檔案中指定的群組、名稱與版本。

同步取用專案並開始使用您的程式庫，例如：

```kotlin
import io.github.kotlin.fibonacci.generateFibi

val seq = generateFibi()
println(seq.elementAt(3))
```

## 下一步

我們鼓勵您進一步探索多平台開發：

* [將您的程式庫發佈到 Maven Central](multiplatform-publish-libraries-to-maven.md)
* [查看程式庫作者指南](https://kotlinlang.org/docs/api-guidelines-introduction.html)

加入社群：

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**：為 [該存儲庫](https://github.com/JetBrains/compose-multiplatform) 加上星標 (star) 並做出貢獻
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：獲取 [邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：訂閱 ["kotlin-multiplatform" 標籤](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 頻道**：訂閱並觀看關於 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 的影片