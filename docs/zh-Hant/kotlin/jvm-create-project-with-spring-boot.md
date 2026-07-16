[//]: # (title: 使用 Kotlin 建立 Spring Boot 專案)

<web-summary>使用 IntelliJ IDEA 並透過 Kotlin 建立 Spring Boot 應用程式。</web-summary>

<tldr>
    <p>這是<strong>開始使用 Spring Boot 與 Kotlin</strong> 教學的第一部分：</p><br/>
    <p><img src="icon-1.svg" width="20" alt="第一步"/> <strong>使用 Kotlin 建立 Spring Boot 專案</strong><br/><img src="icon-2-todo.svg" width="20" alt="第二步"/> 為 Spring Boot 專案新增資料類別<br/><img src="icon-3-todo.svg" width="20" alt="第三步"/> 為 Spring Boot 專案新增資料庫支援<br/><img src="icon-4-todo.svg" width="20" alt="第四步"/> 使用 Spring Data CrudRepository 進行資料庫存取<br/></p>
</tldr>

本教學的第一部分將展示如何在 IntelliJ IDEA 中透過專案產生器，使用 Gradle 建立 Spring Boot 專案。

> 本教學不強制要求使用 Gradle 作為建置系統。如果您使用 Maven，也可以遵循相同的步驟。
> 
{style="note"}

## 開始之前

下載並安裝最新版本的 [IntelliJ IDEA Ultimate Edition](https://www.jetbrains.com/idea/download/)。

> 如果您使用 IntelliJ IDEA Community Edition 或其他 IDE，可以使用 [網頁版專案產生器](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin) 來產生 Spring Boot 專案。
> 
{style="tip"}

## 建立 Spring Boot 專案

在 IntelliJ IDEA Ultimate Edition 中使用專案產生器建立新的 Kotlin Spring Boot 專案：

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側面板的 **Generators** 區段中選取 **Spring Boot**。
3. 在 **New Project** 視窗中指定以下欄位與選項：
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > 此選項指定了建置系統與 DSL。
     >
     {style="tip"}

   * **Package name**: com.example.demo
   * **JDK**: Java JDK
     
     > 本教學使用 **Amazon Corretto version 23**。
     > 如果您尚未安裝 JDK，可以從下拉式功能表中下載。
     >
     {style="note"}
   
   * **Java**: 17
   
     > 如果您尚未安裝 Java 17，可以從 JDK 下拉式功能表中下載。
     >
     {style="tip"}

   ![建立 Spring Boot 專案](create-spring-boot-project.png){width=700}

4. 確認您已填寫所有欄位後，點擊 **Next**。

5. 選取本教學所需的以下相依性：

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![設定 Spring Boot 專案](set-up-spring-boot-project.png){width=700}

6. 點擊 **Create** 以產生並設定專案。

   > IDE 將產生並開啟一個新專案。下載與匯入專案相依性可能需要一些時間。
   >
   {style="tip"} 

7. 完成後，您可以在 **專案檢視** 中觀察到以下結構：

   ![設定 Spring Boot 專案](spring-boot-project-view.png){width=400}

   產生的 Gradle 專案符合 Maven 的標準目錄配置：
   * 在 `main/kotlin` 資料夾下有屬於該應用程式的套件與類別。
   * 應用程式的進入點是 `DemoApplication.kt` 檔案中的 `main()` 方法。

## 探索專案 Gradle 組建檔案 {initial-collapse-state="collapsed" collapsible="true"}

開啟 `build.gradle.kts` 檔案：這是 Gradle Kotlin 組建指令碼，其中包含應用程式所需的相依性列表。

此 Gradle 檔案對於 Spring Boot 來說是標準格式，但也包含了必要的 Kotlin 相依性，包括 kotlin-spring Gradle 外掛程式 – `kotlin("plugin.spring")`。

以下是完整指令碼，並附帶各部分與相依性的說明：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%" // 要使用的 Kotlin 版本
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 外掛程式
    id("org.springframework.boot") version "%springBootVersion%"
    id("id.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-h2console")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Kotlin 反射程式庫，與 Spring 搭配運作時所需
    implementation("tools.jackson.module:jackson-module-kotlin") // 用於處理 JSON 的 Jackson Kotlin 擴充套件
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict` 啟用 JSR-305 註解的嚴格模式
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

如您所見，Gradle 組建檔案中新增了幾個與 Kotlin 相關的構件：

1. 在 `plugins` 區塊中，有兩個 Kotlin 構件：

   * `kotlin("jvm")` 外掛程式定義了專案中要使用的 Kotlin 版本。
   * Kotlin Spring 編譯器外掛程式 `kotlin("plugin.spring")` 會為 Kotlin 類別新增 `open` 修飾詞，使其與 Spring Framework 特性相容。

2. 在 `dependencies` 區塊中，列出了幾個與 Kotlin 相關的模組：

   * `tools.jackson.module:jackson-module-kotlin` 模組新增了對 Kotlin 類別與資料類別序列化與反序列化的支援。
   * `org.jetbrains.kotlin:kotlin-reflect` 是 Kotlin 反射程式庫，可完整支援 [反射特性](reflection.md)。

3. 在相依性區段之後，您可以看到 `kotlin` 外掛程式組態區塊。
   您可以在此處向編譯器新增額外引數，以啟用或停用各種語言特性。

在 [](gradle-compiler-options.md) 中進一步了解 Kotlin 編譯器選項。

## 探索產生的 Spring Boot 應用程式

開啟 `DemoApplication.kt` 檔案：

```kotlin
// DemoApplication.kt
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}
```

<deflist collapsible="true">
   <def title="宣告類別 – class DemoApplication">
      <p>在套件宣告與 import 陳述式之後，您可以看到第一個類別宣告 <code>class DemoApplication</code>。</p>
      <p>在 Kotlin 中，如果類別不包含任何成員（屬性或函式），您可以直接省略類別主體 (<code>{}</code>)。</p>
   </def>
   <def title="@SpringBootApplication 註解">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication 註解</code></a> 是 Spring Boot 應用程式中的一個便利註解。它啟用了 Spring Boot 的 <a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">自動配置</a>、<a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">組件掃描</a>，並能夠在「應用程式類別」上定義額外組態。</p>
   </def>
   <def title="程式進入點 – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 函式是應用程式的進入點。</p>
      <p>它被宣告為 <code>DemoApplication</code> 類別之外的 <a href="functions.md#function-scope">頂層函式</a>。<code>main()</code> 函式會調用 Spring 的 `runApplication(*args)` 函式，以透過 Spring Framework 啟動應用程式。</p>
   </def>
   <def title="可變參數 – args: Array&lt;String&gt;">
      <p>如果您查看 <code>runApplication()</code> 函式的宣告，會發現該函式的參數標有 <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 修飾詞</a>：<code>vararg args: String</code>。這意味著您可以向該函式傳遞可變數量的字串引數。</p>
   </def>
   <def title="展開運算子 – (*args)">
      <p><code>args</code> 是 <code>main()</code> 函式的參數，宣告為字串陣列。由於這是一個字串陣列，而您希望將其內容傳遞給函式，請使用展開運算子（在陣列前加上星號 <code>*</code>）。</p>
   </def>
</deflist>

## 建立控制器

應用程式已準備好執行，但讓我們先更新其邏輯。

在 Spring 應用程式中，控制器用於處理 Web 請求。
在同一個套件中，於 `DemoApplication.kt` 檔案旁邊建立 `MessageController.kt` 檔案，內容如下：

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```

<deflist collapsible="true">
   <def title="@RestController 註解">
      <p>您需要告訴 Spring，<code>MessageController</code> 是一個 REST 控制器，因此應該用 <code>@RestController</code> 註解標記它。</p>
      <p>此註解意味著該類別將被組件掃描偵測到，因為它與我們的 <code>DemoApplication</code> 類別位於同一個套件中。</p>
   </def>
   <def title="@GetMapping 註解">
      <p><code>@GetMapping</code> 標記 REST 控制器中實作對應於 HTTP GET 調用端點的函式：</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam 註解">
      <p>函式參數 <code>name</code> 標有 <code>@RequestParam</code> 註解。此註解表示方法參數應繫結至 Web 請求參數。</p>
      <p>因此，如果您存取應用程式的根目錄並提供名為 "name" 的請求參數，例如 <code>/?name=&lt;your-value&gt;</code>，該參數值將作為引數用於調用 <code>index()</code> 函式。</p>
   </def>
   <def title="單一運算式函式 – index()">
      <p>由於 <code>index()</code> 函式僅包含一個陳述式，您可以將其宣告為 <a href="functions.md#single-expression-functions">單一運算式函式</a>。</p>
      <p>這意味著可以省略花括號，並在等號 <code>=</code> 後指定主體。</p>
   </def>
   <def title="函式傳回型別的型別推論">
      <p><code>index()</code> 函式沒有明確宣告傳回型別。相反，編譯器會透過查看等號 <code>=</code> 右側陳述式的結果來推論傳回型別。</p>
      <p><code>Hello, $name!</code> 運算式的型別是 <code>String</code>，因此函式的傳回型別也是 <code>String</code>。</p>
   </def>
   <def title="字串範本 – $name">
      <p><code>Hello, $name!</code> 運算式在 Kotlin 中稱為 <a href="strings.md#string-templates"><i>字串範本</i></a>。</p>
      <p>字串範本是包含內嵌運算式的字串常值。</p>
      <p>這是字串連接操作的一種便捷替代方式。</p>
   </def>
</deflist>

## 執行應用程式

Spring 應用程式現在已準備好執行：

1. 在 `DemoApplication.kt` 檔案中，點擊 `main()` 方法旁邊邊欄中的綠色 **Run** 圖示：

    ![執行 Spring Boot 應用程式](run-spring-boot-application.png){width=700}
    
    > 您也可以在終端機中執行 `./gradlew bootRun` 指令。
    >
    {style="tip"}

    這將在您的電腦上啟動本機伺服器。

2. 應用程式啟動後，開啟以下 URL：

    ```text
    http://localhost:8080?name=John
    ```

    您應該會看到「Hello, John!」作為回應印出：

    ![Spring 應用程式回應](spring-application-response.png){width=700}

## 下一步

在本教學的下一部分中，您將學習 Kotlin 資料類別以及如何在應用程式中使用它們。

**[繼續閱讀下一章節](jvm-spring-boot-add-data-class.md)**