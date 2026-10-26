[//]: # (title: 將 Kotlin 新增至 Java 專案 – 教學)

<web-summary>將 Kotlin 整合至現有的 Java 專案中 − 設定 Maven 或 Gradle 建置檔案、組織原始碼檔案，並在 IntelliJ IDEA 中將 Java 程式碼轉換為 Kotlin。</web-summary>

Kotlin 與 Java 完全互通，因此你可以逐步將其引入現有的 Java 專案中，而無需重寫所有內容。

在本教學中，你將學習如何：

* 設定 Maven 或 Gradle 建置工具以同時編譯 Java 與 Kotlin 程式碼。
* 在專案目錄中組織 Java 與 Kotlin 原始碼檔案。
* 使用 IntelliJ IDEA 將 Java 檔案轉換為 Kotlin。

> 你可以將任何現有的 Java 專案用於本教學，或是複製我們已預先設定好 Maven 與 Gradle 建置檔案的公開[範例專案](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)。
> 
> 你也可以使用我們[準備好的技能](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md)，將轉換工作交由你偏好的 AI agent 處理。請記住，AI 處理的結果並非完全可預測。
>
{style="tip"}

## 專案配置 {id="project-configuration"}

若要將 Kotlin 新增至 Java 專案，你需要根據所使用的建置工具，設定該專案以同時使用 Kotlin 與 Java。

專案配置可確保 Kotlin 與 Java 程式碼均能正確編譯，並能夠無縫地相互參照。

### Maven {id="maven"}

> 從 **IntelliJ IDEA 2025.3** 開始，當你在基於 Maven 的 Java 專案中新增第一個 Kotlin 檔案時，  
> IDE 會自動更新你的 `pom.xml` 檔案，以包含 Kotlin Maven 外掛程式與標準相依性。  
> 如果你想自訂版本或建置階段，仍可手動進行配置。
>
{style="note"}

要在 Maven 專案中同時使用 Kotlin 與 Java，請在 `pom.xml` 檔案中套用 Kotlin Maven 外掛程式並新增 Kotlin 相依性：

1. 在 `<properties>` 區段中，新增 Kotlin 版本屬性：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" ignore-vars="false" include-lines="13,17,18"}

2. 在 `<dependencies>` 區段中，將所需的相依性新增至 `<plugins>` 區段：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="32,38-43,45-49,55"}

3. 在 `<build><plugins>` 區段中，新增 Kotlin 外掛程式：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="57-58,95-96,99-107"}

   在 Kotlin Maven 外掛程式中啟用 `<extensions>true</extensions>` 有助於：

   * 自動將 `kotlin-stdlib` 相依性新增至專案。
   * 設定執行階段，先編譯 Kotlin，再編譯 Java。
   * 在 Java 程式碼中參照 Kotlin 程式碼，反之亦然。
   * 自動將 JVM 目標版本與 Java 編譯器版本對齊。

   當搭配 extensions 使用 Kotlin Maven 外掛程式時，你不需要在 `<build><pluginManagement>` 區段中額外設定單獨的 `maven-compiler-plugin`。

4. 在你的 IDE 中重新載入 Maven 專案。
5. 執行測試以驗證配置：

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

要在 Gradle 專案中同時使用 Kotlin 與 Java，請在 `build.gradle.kts` 檔案中套用 Kotlin JVM 外掛程式並新增 Kotlin 相依性：

1. 在 `plugins {}` 區塊中，新增 Kotlin JVM 外掛程式：

    ```kotlin
    plugins {
        // Other plugins
        kotlin("jvm") version "%kotlinVersion%"
    }
    ```

2. 設定 JVM 工具鏈版本以符合你的 Java 版本：

    ```kotlin
    kotlin {
        jvmToolchain(17)
    }
    ```

   這可確保 Kotlin 使用與你的 Java 程式碼相同的 JDK 版本。

3. 在 `dependencies {}` 區塊中，新增提供 Kotlin 測試公用程式並與 JUnit 整合的 `kotlin("test")` 程式庫：

    ```kotlin
    dependencies {
        // Other dependencies
    
        testImplementation(kotlin("test"))
        // Other test dependencies
    }
    ```

4. 在你的 IDE 中重新載入 Gradle 專案。
5. 執行測試以驗證配置：

    ```bash
    ./gradlew clean test
    ```

## 專案結構 {id="project-structure"}

透過此配置，你可以在相同的原始碼目錄中混合存放 Java 與 Kotlin 檔案：

```none
src/
  ├── main/
  │    ├── java/          # Java 與 Kotlin 生產程式碼
  │    └── kotlin/        # 額外的 Kotlin 生產程式碼（選填）
  └── test/
       ├── java/          # Java 與 Kotlin 測試程式碼
       └── kotlin/        # 額外的 Kotlin 測試程式碼（選填）
```

你可以手動建立這些目錄，也可以在新增第一個 Kotlin 檔案時讓 IntelliJ IDEA 自動建立它們。

Kotlin 外掛程式會自動辨識 `src/main/java` 與 `src/test/java` 兩個目錄，因此你可以將 `.kt` 與 `.java` 檔案存放在相同的目錄中。

## 將 Java 檔案轉換為 Kotlin {id="convert-java-files-to-kotlin"}

Kotlin 外掛程式還隨附了一個 Java 轉 Kotlin 轉換器（_J2K_），可自動將 Java 檔案轉換為 Kotlin。
若要對某個檔案使用 J2K，請在其操作功能表或 IntelliJ IDEA 的 **Code** 功能表中點擊 **Convert Java File to Kotlin File**。

![Convert Java to Kotlin](convert-java-to-kotlin.png){width=500}

雖然此轉換器並非萬無一失，但它能相當出色地將大部分樣板程式碼從 Java 轉換為 Kotlin。
不過，有時仍需要進行一些手動調整。

## 探索編譯器外掛程式 {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

如果你的專案較為複雜且使用了 [Spring](https://spring.io/) 或 Java Persistence API (JPA)，你可以使用 Kotlin 編譯器外掛程式，自動調整 Kotlin 的語言特性以符合架構的預期，進而減少樣板程式碼：

* **[`all-open`](all-open-plugin.md)** 外掛程式會在搭配特定註解使用時，自動將類別及其成員設為 `open`。這對於像 Spring 這樣需要類別為 non-final 的架構特別有用。

  針對 Spring，你可以使用專屬的 [`kotlin-spring`](kotlin-spring-plugin.md) 外掛程式，它是基於 `all-open` 的包裝函式。它會自動指定 Spring 註解。
* **[`no-arg`](no-arg-plugin.md)** 外掛程式會為帶有特定註解的類別產生額外的零引數建構函式。這讓 JPA 能夠具現化原本沒有預設建構函式的類別。

  針對 JPA，你可以使用包裝了 `no-arg` 與 `all-open` 的 [`kotlin-jpa`](kotlin-jpa-plugin.md) 外掛程式。它會自動指定 JPA 註解，讓實體變成 `open` 並取得零引數建構函式。
* **[`power-assert`](power-assert.md)** 外掛程式透過為斷言提供包含上下文資訊的詳細失敗訊息，來改善偵錯體驗。它會顯示中間值，並幫助你了解測試失敗的原因。

## 下一步 {id="next-step"}

在 Java 專案中開始使用 Kotlin 最簡單的方法是先新增 Kotlin 測試：

[將你的第一個 Kotlin 測試新增至 Java 專案](jvm-test-using-junit.md)

### 請參閱 {id="see-also"}

* [Kotlin 與 Java 互通性詳細資訊](java-to-kotlin-interop.md)
* [Maven 組建組態參考](maven.md)