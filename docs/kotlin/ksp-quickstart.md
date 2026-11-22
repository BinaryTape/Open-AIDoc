[//]: # (title: KSP 使用入门)
<web-summary>将基于 Kotlin 符号处理 (KSP) 的注解处理器添加到项目中，或使用 KSP API 创建您自己的注解处理器。</web-summary>

在本指南中，您将学习到：

* 如何在项目中添加基于 KSP 的注解处理器。
* 如何使用 KSP API 创建您自己的注解处理器。
* 在何处查找处理器生成的代码。

## 将基于 KSP 的处理器添加到项目中 {id="add-a-ksp-based-processor-to-your-project"}

要在项目中使用外部处理器，请将 KSP 添加到 `build.gradle(.kts)` 文件的 [`plugins {}` 代码块](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)中。如果仅在特定模块中需要该处理器，请改为将其添加到该模块的 `build.gradle(.kts)` 文件中：

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

> 要查找 KSP 的最新版本，请查看 GitHub [Releases](https://github.com/google/ksp/releases)。
> 
{style="tip"}

在顶级 `dependencies {}` 代码块中，添加您要使用的处理器。本示例使用的是 [Moshi](https://github.com/square/moshi?tab=readme-ov-file#codegen)，其他处理器的使用方式也相同：

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

`ksp(...)` 配置仅将处理器应用于应用程序源代码。若要处理测试源代码，请使用 `kspTest(...)` 配置添加该处理器。

> `ksp(...)` 配置仅适用于单平台项目。
> 要了解如何为各个 Kotlin Multiplatform 目标和编译配置处理器，请参阅 [在 Kotlin Multiplatform 中使用 KSP](ksp-multiplatform.md)。
> 
{style="note"}

## 创建您自己的处理器 {id="create-your-own-processor"}

按照以下步骤，您将创建一个简单的注解处理器，用于生成 `helloWorld()` 函数。虽然它在实际中用处不大，但演示了创建自定义处理器和注解的基础知识。

### 将 KSP 添加到项目中 {id="add-ksp-to-the-project"}

创建一个新的 Kotlin 项目并添加 KSP 插件：

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。 
2. 在左侧列表中选择 **Kotlin**。
3. 选择 **Gradle** 作为构建系统，然后点击 **Create**。

    ![创建新项目](ksp-new-project.png){width=700}

4. 将 KSP 插件添加到 `build.gradle(.kts)` 文件中：

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

### 创建注解 {id="create-an-annotation"}

在项目的根目录下创建一个新模块并声明一个注解：

1. 选择 **File** | **New** | **Module**。 
2. 在左侧列表中选择 **Kotlin**。
3. 指定以下字段并点击 **Create**：

    * **Name**：annotations
    * **Build system**：Gradle

    ![创建新模块](ksp-new-module.png){width=700}

4. 在该模块中，创建 `HelloWorldAnnotation.kt` 文件并声明名为 `HelloWorldAnnotation` 的注解：

    ```kotlin
    // annotations/src/main/kotlin/com/example/annotations/HelloWorldAnnotation.kt
    
    package com.example.annotations
    
    annotation class HelloWorldAnnotation
    ```

### 创建并注册处理器 {id="create-and-register-a-processor"}

1. 在项目根目录下创建另一个名为 **processor** 的模块。
2. 在该模块的 `build.gradle(.kts)` 文件中，将 KSP API 以及之前声明的注解添加为依赖项：

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
3. 在 processor 模块中，创建一个新的 `HelloWorldProcessor.kt` 文件并添加以下代码：

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt

    class HelloWorldProcessor(val codeGenerator: CodeGenerator) : SymbolProcessor {
        // 1️⃣ process() 函数
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
            
       // 3️⃣ createNewFileFrom() 函数
       private fun createNewFileFrom(function: KSFunctionDeclaration): OutputStream { 
           return codeGenerator.createNewFile(
              dependencies = createDependencyOn(function),
              packageName = "",
              fileName = "GeneratedHelloWorld"
           )
       }
        
       // 3️⃣ createDependencyOn() 函数
       private fun createDependencyOn(function: KSFunctionDeclaration): Dependencies {
           return Dependencies(aggregating = false, function.containingFile!!)
       }
    }
    
    // 用于将字符串写入 OutputStream 的工具函数
    fun OutputStream.write(string: String): Unit {
        this.write(string.toByteArray())
    }
    ```

    添加 IDE 建议的导入。确保从 `com.google.devtools.ksp.processing` 导入 `Resolver` 和 `Dependencies` 类。或者，将以下几行复制到 `HelloWorldProcessor.kt` 的顶部：

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
    {collapsible="true" collapsed-title="导入语句"}

   让我们逐步了解这些代码：

    * 1️⃣ `process()` 函数包含了处理器的主要逻辑。它获取所有带有 `HelloWorldAnnotation` 注解的符号，并为每个符号调用 `HelloWorldVisitor`。

       `process()` 函数会返回未处理的符号列表，以便在后续轮次中处理。在本示例中，直接返回 `emptyList()` 即可。要了解更多信息，请参阅[多轮处理](ksp-multi-round.md)。

    * 2️⃣ 处理器使用 visitor（访问者）遍历 KSP 视角的 Kotlin 抽象语法树 (AST)。在 `HelloWorldPocessor` 类内部，`HelloWorldVisitor` 类充当 visitor。由于 `HelloWorldAnnotation` 仅用于函数上，因此仅重写了 `visitFunctionDeclaration()`。
   
       > `KSVisitorVoid` 是 KSP 提供的 visitor 类之一，您可以对其进行重写和调整。您也可以通过实现 [`KSVisitor<D, R>` 接口](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/KSVisitor.kt)来创建自己的 visitor。
       >
       {style="tip"}

    * 3️⃣ `createNewFileFrom()` 创建 KSP 生成代码所在的文件。`createDependencyOn()` 使输出文件依赖于使用该注解的源文件。

       > 要详细了解 KSP 如何创建和管理文件，请访问 [`CodeGenerator` 接口](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)的源代码。
       >
       {style="tip"}
4. 创建 `HelloWorldProcessorProvider.kt` 文件。在其中声明继承自 `SymbolProcessorProvider` 的 `HelloWorldProcessorProvider` 类：

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
5. 注册处理器提供程序。在 `resources/META-INF/services` 目录下，创建 `com.google.devtools.ksp.processing.SymbolProcessorProvider` 文件并添加该提供程序的完全限定名：

    ```text
    ## processor/src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider
        
    HelloWorldProcessorProvider
    ```

### 使用您的处理器 {id="use-your-processor"}

现在您已准备好测试您的处理器。请按照以下步骤创建一个客户端模块，并让处理器根据带有注解的元素生成代码：

1. 在项目根目录下创建一个名为 `app` 的模块。 
2. 在该模块的 `build.gradle(.kts)` 文件中：

    * 将 KSP 插件添加到 `plugins {}` 代码块中。
    * 将您的处理器和注解添加到 `dependencies {}` 代码块中。

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

3. 在项目级的 `settings.gradle(.kts)` 文件中，确保已自动包含所有子模块：
    
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

4. 在 `app` 模块中，创建 `Main.kt` 文件并添加以下代码：

    ```kotlin
    // app/src/main/kotlin/Main.kt
   
    import com.example.annotations.HelloWorldAnnotation
    
    @HelloWorldAnnotation
    fun main() {
        helloWorld()
    }
    ```

    > `main()` 函数调用了 `helloWorld()`，尽管该函数尚不存在。您的 IDE 会将 `helloWorld()` 高亮显示为未解析的引用。这是符合预期的：当您构建并运行项目时，KSP 会生成 `helloWorld()` 函数。
    >
    {style="note"}

5. 运行程序。您将在控制台中看到 `helloWorld()` 函数的输出：

    ```text
    Hello world from function generated by KSP
    ```

    KSP 会在 `GeneratedHelloWorld.kt` 文件中生成代码：
   
    ```text
    app/build/generated/ksp/main/kotlin/GeneratedHelloWorld.kt
    ```

### 查看项目结构 {id="explore-the-project-structure"}

项目的最终文件结构应如下所示：

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
{collapsible="true" collapsed-title="项目结构"}

> 您可能还会看到其他的文件和目录。
> 
{style="tip"}

## 后续步骤 {id="what-s-next"}

* 在 [KSP 仓库](https://github.com/google/ksp/tree/main/examples/hello-world)中查看本示例的完整代码。
* 在 [KSP 仓库](https://github.com/google/ksp/tree/main/examples)中查找更复杂、符合实际场景的示例。
* 浏览 [KSP 支持的库](ksp-overview.md#supported-libraries)列表。