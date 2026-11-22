[//]: # (title: KSP 入門)
<web-summary>將以 Kotlin 符號處理 (KSP) 為基礎的註解處理器新增至您的專案中，或使用 KSP API 建立自己的處理器。</web-summary>

在本指南中，您將學習：

* 如何將以 KSP 為基礎的註解處理器新增至您的專案中。
* 如何使用 KSP API 建立您自己的註解處理器。
* 在何處尋找由處理器產生的程式碼。

## 將以 KSP 為基礎的處理器新增至您的專案 {id="add-a-ksp-based-processor-to-your-project"}

若要在您的專案中使用外部處理器，請在 `build.gradle(.kts)` 檔案中的 [`plugins {}` 區塊](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)中新增 KSP。如果該處理器僅在特定模組中需要，請改為新增至該模組的 `build.gradle(.kts)` 檔案中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {  
    kotlin("jvm") version "%kotlinVersion%"  
    id("com.google.devtools.ksp") version "%kspVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    id 'com.google.devtools.ksp' version '%kspVersion%'
}
```

</tab>
</tabs>

> 若要尋找 KSP 的最新版本，請查看 GitHub 的 [Releases](https://github.com/google/ksp/releases)。
> 
{style="tip"}

在頂層的 `dependencies {}` 區塊中，新增您想要使用的處理器。本範例使用 
[Moshi](https://github.com/square/moshi?tab=readme-ov-file#codegen)，但其他處理器的方法也相同：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

dependencies {
    ksp("com.squareup.moshi:moshi-kotlin-codegen:1.15.2")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

dependencies {
    ksp 'com.squareup.moshi:moshi-kotlin-codegen:1.15.2'
}
```

</tab>
</tabs>

`ksp(...)` 組態僅將處理器套用於應用程式原始碼。若要處理測試原始碼，請使用 `kspTest(...)` 組態新增處理器。

> `ksp(...)` 組態僅適用於單平台專案。
> 若要了解如何為個別 Kotlin Multiplatform 目標和編譯設定處理器，請參閱
> [在 Kotlin Multiplatform 中使用 KSP](ksp-multiplatform.md)。
> 
{style="note"}

## 建立您自己的處理器 {id="create-your-own-processor"}

按照以下步驟，您將建立一個產生 `helloWorld()` 函式的簡單註解處理器。
雖然在實務上用處不大，但它展示了建立您自己的處理器與註解的基本概念。

### 將 KSP 新增至專案 {id="add-ksp-to-the-project"}

建立一個新的 Kotlin 專案並新增 KSP 外掛程式：

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側清單中，選擇 **Kotlin**。
3. 選擇 **Gradle** 作為建構系統，然後點擊 **Create**。

    ![建立新專案](ksp-new-project.png){width=700}

4. 將 KSP 外掛程式新增至 `build.gradle(.kts)` 檔案中：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    // build.gradle.kts
    
    plugins { 
        kotlin("jvm") version "%kotlinVersion%"
        id("com.google.devtools.ksp") version "%kspVersion%" apply false
    }
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    // build.gradle
    
    plugins {
        id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
        id 'com.google.devtools.ksp' version '%kspVersion%' apply false
    }
    ```
    
    </tab>
    </tabs>

### 建立註解 {id="create-an-annotation"}

在專案根目錄下建立一個新模組並宣告一個註解：

1. 選取 **File** | **New** | **Module**。
2. 在左側清單中，選取 **Kotlin**。
3. 指定下列欄位並點擊 **create**：

    * **Name**：annotations
    * **Build system**：Gradle

    ![建立新模組](ksp-new-module.png){width=700}

4. 在該模組中，建立 `HelloWorldAnnotation.kt` 檔案並宣告一個名為 `HelloWorldAnnotation` 的註解：

    ```kotlin
    // annotations/src/main/kotlin/com/example/annotations/HelloWorldAnnotation.kt
    
    package com.example.annotations
    
    annotation class HelloWorldAnnotation
    ```

### 建立並註冊處理器 {id="create-and-register-a-processor"}

1. 在專案根目錄下建立另一個名為 **processor** 的模組。
2. 在該模組的 `build.gradle(.kts)` 檔案中，將 KSP API 以及您宣告的註解新增為相依性：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    // processor/build.gradle.kts
        
    plugins {  
        kotlin("jvm")
    }
        
    dependencies {
        implementation(project(":annotations"))
        implementation("com.google.devtools.ksp:symbol-processing-api:2.3.6")  
    }
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    // processor/build.gradle
    
    plugins {
        id 'org.jetbrains.kotlin.jvm'
    }
    
    dependencies {
        implementation project ':annotations'
        implementation 'com.google.devtools.ksp:symbol-processing-api:2.3.6'
    }
    ```

    </tab>
    </tabs>
3. 在 processor 模組中，建立一個新的 `HelloWorldProcessor.kt` 檔案並新增以下程式碼：

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt

    class HelloWorldProcessor(val codeGenerator: CodeGenerator) : SymbolProcessor {
        // 1️⃣ process() 函式
        override fun process(resolver: Resolver): List<KSAnnotated> {
            resolver
                .getSymbolsWithAnnotation("com.example.annotations.HelloWorldAnnotation")
                .filter { it.validate() }
                .filterIsInstance<KSFunctionDeclaration>()
                .forEach { it.accept(HelloWorldVisitor(), Unit) }
        
           return emptyList()
        }
        
       // 2️⃣ Visitor
       inner class HelloWorldVisitor : KSVisitorVoid() {
           override fun visitFunctionDeclaration(function: KSFunctionDeclaration, data: Unit) {
               createNewFileFrom(function).use { file ->
                   file.write(
                       """
                           fun helloWorld(): Unit {
                               println("Hello world from function generated by KSP")
                           }
                       """.trimIndent()
                   ) 
               } 
           } 
       }
            
       // 3️⃣ createNewFileFrom() 函式
       private fun createNewFileFrom(function: KSFunctionDeclaration): OutputStream { 
           return codeGenerator.createNewFile(
              dependencies = createDependencyOn(function),
              packageName = "",
              fileName = "GeneratedHelloWorld"
           )
       }
        
       // 3️⃣ createDependencyOn() 函式
       private fun createDependencyOn(function: KSFunctionDeclaration): Dependencies {
           return Dependencies(aggregating = false, function.containingFile!!)
       }
    }
    
    // 用於將字串寫入 OutputStream 的公用程式函式
    fun OutputStream.write(string: String): Unit {
        this.write(string.toByteArray())
    }
    ```

    新增 IDE 建議的匯入項目。請確認從 `com.google.devtools.ksp.processing` 匯入 `Resolver` 和 `Dependencies` 類別。或者，直接複製以下幾行至 `HelloWorldProcessor.kt` 的頂部：

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt
   
    import com.google.devtools.ksp.processing.CodeGenerator
    import com.google.devtools.ksp.processing.Dependencies
    import com.google.devtools.ksp.processing.Resolver
    import com.google.devtools.ksp.processing.SymbolProcessor
    import com.google.devtools.ksp.symbol.KSAnnotated
    import com.google.devtools.ksp.symbol.KSFunctionDeclaration
    import com.google.devtools.ksp.symbol.KSVisitorVoid
    import com.google.devtools.ksp.validate
    import java.io.OutputStream
    ```
    {collapsible="true" collapsed-title="匯入陳述式"}

   讓我們逐一解析這段程式碼：

    * 1️⃣ `process()` 函式包含處理器的核心邏輯。它會取得所有標註有 `HelloWorldAnnotation` 的符號，並對每個符號呼叫 `HelloWorldVisitor`。

       `process()` 函式會回傳未處理的符號清單，以供後續輪次處理。在本範例中，它安全地回傳 `emptyList()`。如需更多資訊，請參閱[多輪次處理](ksp-multi-round.md)。

    * 2️⃣ 處理器透過 Visitor 遍歷 KSP 檢視下的 Kotlin 抽象語法樹 (AST)。在 `HelloWorldProcessor` 類別內部，`HelloWorldVisitor` 類別就是該 Visitor。由於 `HelloWorldAnnotation` 僅用於函式上，因此僅覆寫了 `visitFunctionDeclaration()`。
   
       > `KSVisitorVoid` 是 KSP 提供的 Visitor 類別之一，您可以對其進行覆寫與調整。
       > 您也可以透過實作 [`KSVisitor<D, R>` 介面](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/KSVisitor.kt)來建立自己的 Visitor。
       >
       {style="tip"}

    * 3️⃣ `createNewFileFrom()` 會建立 KSP 產生程式碼的檔案。`createDependencyOn()` 則讓產生的檔案相依於使用該註解的原始碼檔案。

       > 若要深入了解 KSP 如何建立和管理檔案，請參閱 [`CodeGenerator` 介面](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)的原始碼。
       >
       {style="tip"}
4. 建立一個 `HelloWorldProcessorProvider.kt` 檔案。在其中宣告繼承自 `SymbolProcessorProvider` 的 `HelloWorldProcessorProvider` 類別：

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessorProvider.kt
    
    import com.google.devtools.ksp.processing.SymbolProcessor
    import com.google.devtools.ksp.processing.SymbolProcessorEnvironment
    import com.google.devtools.ksp.processing.SymbolProcessorProvider

    class HelloWorldProcessorProvider : SymbolProcessorProvider {  
        override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor {  
            return HelloWorldProcessor(environment.codeGenerator)  
        }  
    }
    ```
5. 註冊處理器提供者。在 `resources/META-INF/services` 目錄中，建立一個名為 `com.google.devtools.ksp.processing.SymbolProcessorProvider` 的檔案，並填入提供者的完全限定類名：

    ```text
    ## processor/src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider
        
    HelloWorldProcessorProvider
    ```

### 使用您的處理器 {id="use-your-processor"}

現在您可以開始測試您的處理器了。請按照以下步驟建立用戶端模組，並讓您的處理器根據標註的元素產生程式碼：

1. 在專案根目錄下建立一個名為 `app` 的模組。
2. 在該模組的 `build.gradle(.kts)` 檔案中：

    * 將 KSP 外掛程式新增至 `plugins {}` 區塊。
    * 將您的處理器和註解新增至 `dependencies {}` 區塊。

    例如：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // app/build.gradle.kts

    plugins {
        kotlin("jvm")
        id("com.google.devtools.ksp")
    }

    dependencies { 
        implementation(project(":annotations"))
        ksp(project(":processor"))
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    // app/build.gradle
    
    plugins {
        id 'com.google.devtools.ksp'
    }
    
    dependencies {
        implementation project (':annotations')
        ksp project (':processor')
    }
    ```
    
    </tab>
    </tabs>

3. 在專案層級的 `settings.gradle(.kts)` 檔案中，確認所有子模組都已自動包含：
    
    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    // settings.gradle.kts
    
    include("annotations")
    include("app")
    include("processor")
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    // settings.gradle
    
    include 'processor'
    include 'annotations'
    include 'app'
    ```
    
    </tab>
    </tabs>

4. 在 `app` 模組中，建立一個 `Main.kt` 檔案並新增以下程式碼：

    ```kotlin
    // app/src/main/kotlin/Main.kt
   
    import com.example.annotations.HelloWorldAnnotation
    
    @HelloWorldAnnotation
    fun main() {
        helloWorld()
    }
    ```

    > `main()` 函式呼叫了 `helloWorld()`，即使該函式目前尚不存在。您的 IDE 會將 `helloWorld()` 醒目提示為未定義的參照。這是正常現象：當您建置並執行專案時，KSP 即會產生 `helloWorld()` 函式。
    >
    {style="note"}

5. 執行程式。您會在主控台中看到 `helloWorld()` 函式的輸出：

    ```text
    Hello world from function generated by KSP
    ```

    KSP 會在 `GeneratedHelloWorld.kt` 檔案中產生程式碼：
   
    ```text
    app/build/generated/ksp/main/kotlin/GeneratedHelloWorld.kt
    ```

### 探索專案結構 {id="explore-the-project-structure"}

您專案的最終檔案結構應如下所示：

```text
.
├── app  
│   ├── build.gradle.kts  
│   └── src  
│       └── main  
│           └── kotlin  
│               └── Main.kt   
├── annotations  
│   ├── build.gradle.kts  
│   └── src  
│       └── main  
│           └── kotlin
|				└── com  
|	                └── example
|						└── annotations
|							└── HelloWorldAnnotation.kt  
├── processor  
│   ├── build.gradle.kts  
│   └── src  
│       └── main  
│           ├── kotlin  
│           │   ├── HelloWorldProcessor.kt  
│           │   └── HelloWorldProcessorProvider.kt  
│           └── resources/META-INF/services
|				└── com.google.devtools.ksp.processing.SymbolProcessorProvider 
├── build.gradle.kts  
└── settings.gradle.kts

```
{collapsible="true" collapsed-title="專案結構"}

> 您可能會有其他額外的檔案和目錄。
> 
{style="tip"}

## 後續步驟？ {id="what-s-next"}

* 在 [KSP 儲存庫](https://github.com/google/ksp/tree/main/examples/hello-world)中瀏覽本範例的完整程式碼。
* 在 [KSP 儲存庫](https://github.com/google/ksp/tree/main/examples)中尋找更複雜的實際應用範例。
* 瀏覽[支援 KSP 的程式庫](ksp-overview.md#supported-libraries)清單。