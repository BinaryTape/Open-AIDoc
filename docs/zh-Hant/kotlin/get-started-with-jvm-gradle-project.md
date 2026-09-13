[//]: # (title: Gradle 與 Kotlin/JVM 快速入門)

本教學示範如何使用 IntelliJ IDEA 與 Gradle 建立 JVM 主控台應用程式。

若要開始使用，請先下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。

## 建立專案 {id="create-a-project"}

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側面板中，選取 **Kotlin**。
3. 為新專案命名，並在必要時變更其位置。

   > 選取 **Create Git repository** 核取方塊，將新專案納入版本控制。你稍後可以隨時執行此操作。
   >
   {style="tip"}

   ![建立主控台應用程式](jvm-new-gradle-project.png){width=700}

4. 選取 **Gradle** 建構系統。
5. 從 **JDK** 清單中，選取你想要在專案中使用的 [JDK](https://www.oracle.com/java/technologies/downloads/)。
    * 如果電腦上已安裝 JDK，但尚未在 IDE 中定義，請選取 **Add JDK** 並指定 JDK 根目錄的路徑。
    * 如果電腦上沒有所需的 JDK，請選取 **Download JDK**。

6. 為 Gradle DSL 選取 **Kotlin**。
7. 選取 **Add sample code** 核取方塊，以建立包含範例 `"Hello World!"` 應用程式的檔案。
8. 點擊 **Create**。

你已成功使用 Gradle 建立專案！

#### 為專案指定 Gradle 版本 {initial-collapse-state="collapsed" collapsible="true" id="specify-a-gradle-version-for-your-project"}

你可以在 **Advanced Settings** 區段下明確指定專案的 Gradle 版本，可以使用 Gradle Wrapper 或本機安裝的 Gradle：

* **Gradle Wrapper：**
   1. 從 **Gradle distribution** 清單中，選取 **Wrapper**。
   2. 停用 **Auto-select** 核取方塊。
   3. 從 **Gradle version** 清單中，選取你的 Gradle 版本。
* **本機安裝：**
   1. 從 **Gradle distribution** 清單中，選取 **Local installation**。 
   2. 對於 **Gradle location**，指定本機 Gradle 版本的路徑。

   ![進階設定](jvm-new-gradle-project-advanced.png){width=700}

## 探索建置指令碼 {id="explore-the-build-script"}

開啟 `build.gradle.kts` 檔案。這是 Gradle Kotlin 建置指令碼，其中包含 Kotlin 相關構件以及應用程式所需的其他部分：

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%" // 要使用的 Kotlin 版本
}

group = "org.example" // 公司名稱，例如 `org.jetbrains.kotlin`
version = "1.0-SNAPSHOT" // 分配給建置構件的版本

repositories { // 相依性來源。參見 1️⃣
    mavenCentral() // Maven Central 儲存庫。參見 2️⃣
}

dependencies { // 所有你想要使用的程式庫。參見 3️⃣
    // 在儲存庫中找到相依性名稱後進行複製
    testImplementation(kotlin("test")) // Kotlin 測試程式庫
}

kotlin { // 產生的 JVM 工具鏈配置。參見 4️⃣
    jvmToolchain(25) // 用於編譯專案的 JDK。
}

tasks.test { // 測試任務配置。參見 5️⃣ 
    useJUnitPlatform() // 用於測試的 JUnitPlatform。參見 6️⃣
}
```

* 1️⃣ 進一步了解 [相依性來源](https://docs.gradle.org/current/userguide/declaring_repositories.html)。
* 2️⃣ [Maven Central 儲存庫](https://central.sonatype.com/)。它也可以是 [Google 的 Maven 儲存庫](https://maven.google.com/) 或你公司的私有儲存庫。
* 3️⃣ 進一步了解 [宣告相依性](https://docs.gradle.org/current/userguide/declaring_dependencies.html)。
* 4️⃣ 進一步了解 [Java 工具鏈支援](gradle-configure-project.md#gradle-java-toolchains-support)。
* 5️⃣ 進一步了解 [任務](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html)。
* 6️⃣ [用於測試的 JUnitPlatform](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform)。

Gradle 建置檔案中包含幾個 Kotlin 特有的構件：

1. 在 `plugins {}` 區塊中，有 `kotlin("jvm")` 構件。此外掛程式定義了專案中要使用的 Kotlin 版本。

2. 在 `dependencies {}` 區塊中，有 `testImplementation(kotlin("test"))`。 
   進一步了解 [設定測試程式庫的相依性](gradle-configure-project.md#set-dependencies-on-test-libraries)。

## 執行應用程式 {id="run-the-application"}

1. 透過選取 **View** | **Tool Windows** | **Gradle** 開啟 Gradle 視窗：

   ![包含 main 函式的 Main.kt](jvm-gradle-view-build.png){width=450}

2. 執行 `Tasks/build` 中的 **build** Gradle 任務。在 **Build** 視窗中，會出現 `BUILD SUCCESSFUL`。
   這表示 Gradle 已成功建置應用程式。

3. 在 `src/main/kotlin` 中，開啟 `Main.kt` 檔案：
   * `src` 目錄包含 Kotlin 原始碼檔案和資源。 
   * `Main.kt` 檔案包含會印出 `Hello World!` 的範例程式碼。

4. 點擊裝訂邊中的綠色 **Run** 圖示並選取 **Run 'MainKt'** 以執行應用程式。

   ![執行主控台應用程式](jvm-run-app-gradle.png){width=350}

你可以在 **Run** 工具視窗中查看結果：

![Kotlin 執行輸出](jvm-output-gradle.png){width=700}

恭喜！你剛剛執行了你的第一個 Kotlin 應用程式。

## 下一步 {id="what-s-next"}

進一步了解：
* [Gradle 建置檔案屬性](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#N14E9A)。
* [目標平台與設定程式庫相依性](gradle-configure-project.md)。
* [編譯器選項以及如何傳遞它們](gradle-compiler-options.md)。
* [增量編譯、快取支援、建置報告和 Kotlin 精靈](gradle-compilation-and-caches.md)。