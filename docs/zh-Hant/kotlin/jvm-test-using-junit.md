[//]: # (title: 使用 Kotlin 和 JUnit 測試 Java 程式碼 – 教學)

<web-summary>設定以 Maven 或 Gradle 建置的 Java 專案，以整合用 Kotlin 編寫的 JUnit 測試。</web-summary>

Kotlin 與 Java 完全互通，這意味著你可以使用 Kotlin 為 Java 程式碼撰寫測試，並在同一個專案中與現有的 Java 測試一起執行。

在本教學中，你將學習如何：

* 配置混合 Java–Kotlin 的專案以使用 [JUnit](https://junit.org/) 執行測試。
* 新增驗證 Java 程式碼的 Kotlin 測試。
* 使用 Maven 或 Gradle 執行測試。

> 開始之前，請確認你具備：
>
> * 已安裝 [Kotlin 擴充套件](https://github.com/Kotlin/kotlin-lsp/tree/main?tab=readme-ov-file#vs-code-quick-start) 的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 或 [VS Code](https://code.visualstudio.com/Download)。
> * Java 17 或更新版本。
>
{style="note"}

## 配置專案 {id="configure-the-project"}

1. 在你的 IDE 中，從版本控制系統複製範例專案：

   ```text
   https://github.com/kotlin-hands-on/kotlin-junit-sample.git
   ```

2. 導覽至 `initial` 模組並檢視專案結構：

    ```text
    kotlin-junit-sample/
    ├── initial/
    │   ├── src/
    │   │   ├── main/java/    # Java 原始碼
    │   │   └── test/java/    # Java 編寫的 JUnit 測試
    │   ├── pom.xml           # Maven 配置
    │   └── build.gradle.kts  # Gradle 配置
    ```

   `initial` 模組包含一個使用 Java 編寫的簡易 Todo 應用程式，並附帶一個單一測試。

3. 在同一個目錄下，開啟你的組建檔案並更新其內容以支援 Kotlin：

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="pom.xml file"}

    * 在 `<properties>` 區段中，設定 Kotlin 版本。
    * 在 `<dependencies>` 區段中，新增 JUnit Jupiter 相依性以執行測試。
    * 在 `<build><plugins>` 區段中，套用 `kotlin-maven-plugin` 並將 `<extensions>` 設定為 `true`。它會自動向組建新增對應的 execution 和 `kotlin-stdlib` 相依性。
    * 當使用啟用了 extensions 的 Kotlin Maven 外掛程式時，你不需要將 `maven-compiler-plugin` 新增至 `<build><pluginManagement>` 區段。

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```kotlin
    // build.gradle.kts
    group = "org.jetbrains.kotlin"
    version = "1.0-SNAPSHOT"
    description = "kotlin-junit-complete"
    java.sourceCompatibility = JavaVersion.VERSION_17
    
    plugins {
        application
        kotlin("jvm") version "%kotlinVersion%"
    }

    kotlin {
        jvmToolchain(17)
    }

    application {
        mainClass.set("org.jetbrains.kotlin.junit.App")
    }

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation("com.gitlab.klamonte:jexer:1.6.0")

        testImplementation(kotlin("test"))
        testImplementation(libs.org.junit.jupiter.junit.jupiter.api)
        testImplementation(libs.org.junit.jupiter.junit.jupiter.params)
        testRuntimeOnly(libs.org.junit.jupiter.junit.jupiter.engine)
        testRuntimeOnly(libs.org.junit.platform.junit.platform.launcher)
    }

    tasks.test {
        useJUnitPlatform()
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="build.gradle.kts"}

    * 在 `plugins {}` 區塊中，新增 `kotlin("jvm")` 外掛程式。
    * 設定 JVM toolchain 版本以符合你的 Java 版本。
    * 在 `dependencies {}` 區塊中，新增提供 Kotlin 測試公用程式並與 JUnit 整合的 `kotlin.test` 程式庫。
      
    Kotlin/JVM 支援最新的穩定 JUnit 版本 JUnit 6。你可以在 `gradle/libs.versions.toml` 版本目錄（version catalog）中找到它。
   
    如果你通常偏好使用版本目錄，你甚至可以將 `kotlin("jvm")` 外掛程式新增至其中：

    ```toml
    # gradle/libs.versions.toml
    [versions]
    kotlin = "%kotlinVersion%"
    junit = "6.0.3"

    [libraries]
    org-junit-jupiter-junit-jupiter-api = { module = "org.junit.jupiter:junit-jupiter-api", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-params = { module = "org.junit.jupiter:junit-jupiter-params", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-engine = { module = "org.junit.jupiter:junit-jupiter-engine", version.ref = "junit" }
    org-junit-platform-junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
      
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="libs.versions.toml"}

    </tab>
    </tabs>

4. 在 IDE 中重新載入組建檔案。

如需組建檔案設定的更詳細指示，請參閱[專案配置](mixing-java-kotlin-intellij.md#project-configuration)。

## 新增你的第一個 Kotlin 測試 {id="add-your-first-kotlin-test"}

`initial/src/test/java` 中的 `TodoItemTest.java` 測試已經驗證了應用程式的基本功能：項目建立、預設值、唯一識別碼和狀態變更。

你可以透過新增驗證存儲庫層級行為的 Kotlin 測試來擴展測試涵蓋率：

1. 導覽至同一個測試原始碼目錄：`initial/src/test/java`。
2. 在與 Java 測試相同的套件中建立 `TodoRepositoryTest.kt` 檔案。
3. 建立帶有欄位宣告和設定函式的測試類別：

   ```kotlin
   package org.jetbrains.kotlin.junit

   import org.junit.jupiter.api.BeforeEach
   import org.junit.jupiter.api.Assertions
   import org.junit.jupiter.api.Test
   import org.junit.jupiter.api.DisplayName

   internal class TodoRepositoryTest {
       lateinit var repository: TodoRepository
       lateinit var testItem1: TodoItem
       lateinit var testItem2: TodoItem

       @BeforeEach
       fun setUp() {
           repository = TodoRepository()
           testItem1 = TodoItem("Task 1", "Description 1")
           testItem2 = TodoItem("Task 2", "Description 2")
       }
   }
   ```

    * JUnit 註解在 Kotlin 中的運作方式與在 Java 中相同。
    * 在 Kotlin 中，[`lateinit` 關鍵字](properties.md#late-initialized-properties-and-variables)允許宣告稍後才初始化的非 null 屬性。這有助於避免在測試中使用可 null 型別（`TodoRepository?`）。

4. 在 `TodoRepositoryTest` 類別內新增一個測試，以檢查初始存儲庫狀態及其大小：

   ```kotlin
   @Test
   @DisplayName("Should start with empty repository")
   fun shouldStartEmpty() {
       Assertions.assertEquals(0, repository.size())
       Assertions.assertTrue(repository.all.isEmpty())
   }
   ```

    * 與 Java 的 static 匯入不同，Jupiter 的 `Assertions` 作為類別匯入，並用作斷言函式的限定詞。
    * 在 Kotlin 中，你可以透過 `repository.all` 將 Java getter 作為屬性存取，而不是呼叫 `.getAll()`。

5. 撰寫另一個測試以驗證所有項目的複本行為：

   ```kotlin
   @Test
   @DisplayName("Should return defensive copy of items")
   fun shouldReturnDefensiveCopy() {
       repository.add(testItem1)

       val items1 = repository.all
       val items2 = repository.all

       Assertions.assertNotSame(items1, items2)
       Assertions.assertThrows(
           UnsupportedOperationException::class.java
       ) { items1.clear() }
       Assertions.assertEquals(1, repository.size())
   }
   ```

    * 要從 Kotlin 類別取得 Java 類別物件，請使用 `::class.java`。
    * 你可以將複雜的斷言拆分成多行，而無需使用任何特殊的接續字元。

6. 新增測試以驗證透過 ID 尋找項目：

   ```kotlin
   @Test
   @DisplayName("Should find item by ID")
   fun shouldFindItemById() {
       repository.add(testItem1)
       repository.add(testItem2)

        val found = repository.getById(testItem1.id())

        Assertions.assertTrue(found.isPresent)
        Assertions.assertEquals(testItem1, found.get())
   }
   ```

   Kotlin 能順暢地與 Java [`Optional` API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html) 協同運作。它會自動將 getter 方法轉換為屬性，這就是為什麼此處將 `isPresent()` 方法作為屬性來存取。

7. 撰寫測試以驗證項目移除機制：

   ```kotlin
    @Test
    @DisplayName("Should remove item by ID")
    fun shouldRemoveItemById() {
        repository.add(testItem1)
        repository.add(testItem2)

        val removed = repository.remove(testItem1.id())

        Assertions.assertTrue(removed)
        Assertions.assertEquals(1, repository.size())
        Assertions.assertTrue(repository.getById(testItem1.id()).isEmpty)
        Assertions.assertTrue(repository.getById(testItem2.id()).isPresent)
    }
   
    @Test
    @DisplayName("Should return false when removing non-existent item")
    fun shouldReturnFalseForNonExistentRemoval() {
        repository.add(testItem1)

        val removed = repository.remove("non-existent-id")

        Assertions.assertFalse(removed)
        Assertions.assertEquals(1, repository.size())
    }
   ```

   在 Kotlin 中，你可以鏈式呼叫方法與屬性存取，例如 `repository.getById(id).isEmpty`。

> 你可以在 `TodoRepositoryTest` 測試類別中新增更多測試以涵蓋其他功能。請在範例專案的 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/blob/main/complete/src/test/java/org/jetbrains/kotlin/junit/TodoRepositoryTest.kt) 模組中查看完整原始碼。
>
{style="tip"}

## 執行測試 {id="run-tests"}

執行 Java 和 Kotlin 測試以驗證專案是否如預期運作：

1. 使用裝訂邊圖示執行測試：

   ![執行測試](run-test.png)

   你也可以在命令列中於 `initial` 目錄下執行所有專案測試：

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```bash
    mvn test
    ```

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```bash
    ./gradlew test
    ```

    </tab>
    </tabs>

2. 透過變更其中一個變數的值來確認測試能正常發揮作用。例如，修改 `shouldAddItem` 測試以預期不正確的存儲庫大小：

   ```kotlin
   @Test
   @DisplayName("Should add item to repository")
   fun shouldAddItem() {
       repository.add(testItem1)

       Assertions.assertEquals(2, repository.size())  // 從 1 改為 2
       Assertions.assertTrue(repository.all.contains(testItem1))
   }
   ```

3. 再次執行測試並確認它失敗：

   ![檢查測試結果。測試已失敗](test-failed.png)

> 你可以在範例專案的 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) 模組中找到完整配置好測試的專案。
>
{style="tip"}

## 後續步驟 {id="what-s-next"}

* 進一步了解[使用 Maven 測試 Kotlin 專案](jvm-test-maven.md)。
* 在 [Kotlin 後端開發常見問題](jvm-backend-faq.md)中尋找常見問題的解答。