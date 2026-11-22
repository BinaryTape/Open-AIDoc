[//]: # (title: KSP 시작하기)
<web-summary>Kotlin Symbol Processing(KSP) 기반 어노테이션 프로세서를 프로젝트에 추가하거나, KSP API를 사용하여 직접 만들어 보세요.</web-summary>

이 가이드에서는 다음 내용을 배웁니다:

* 프로젝트에 KSP 기반 어노테이션 프로세서를 추가하는 방법
* KSP API를 사용하여 직접 어노테이션 프로세서를 만드는 방법
* 프로세서에 의해 생성된 코드를 확인하는 위치

## 프로젝트에 KSP 기반 프로세서 추가하기 {id="add-a-ksp-based-processor-to-your-project"}

프로젝트에서 외부 프로세서를 사용하려면 `build.gradle(.kts)` 파일의 [`plugins {}` 블록](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)에 KSP를 추가합니다. 특정 모듈에서만 프로세서가 필요한 경우, 해당 모듈의 `build.gradle(.kts)` 파일에 대신 추가하세요:

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

> KSP의 최신 버전을 확인하려면 GitHub [Releases](https://github.com/google/ksp/releases)를 참조하세요.
> 
{style="tip"}

최상위 `dependencies {}` 블록에 사용할 프로세서를 추가합니다. 이 예제에서는 [Moshi](https://github.com/square/moshi?tab=readme-ov-file#codegen)를 사용하지만, 다른 프로세서의 경우에도 방식은 동일합니다: 

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

`ksp(...)` 구성(configuration)은 애플리케이션 소스에만 프로세서를 적용합니다. 테스트 소스를 처리하려면 `kspTest(...)` 구성으로 프로세서를 추가하세요.

> `ksp(...)` 구성은 단일 플랫폼 프로젝트에서만 사용할 수 있습니다.
> 개별 Kotlin Multiplatform 타깃 및 컴파일을 위해 프로세서를 구성하는 방법은 [Kotlin Multiplatform에서 KSP 사용](ksp-multiplatform.md)을 참조하세요.
> 
{style="note"}

## 자체 프로세서 만들기 {id="create-your-own-processor"}

다음 단계를 따라 `helloWorld()` 함수를 생성하는 간단한 어노테이션 프로세서를 만듭니다. 실무에서 바로 유용하게 쓰일 수준은 아니지만, 자체 프로세서와 어노테이션을 생성하는 기본 원리를 보여줍니다.

### 프로젝트에 KSP 추가하기 {id="add-ksp-to-the-project"}

새 Kotlin 프로젝트를 생성하고 KSP 플러그인을 추가합니다:

1. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다. 
2. 왼쪽 목록에서 **Kotlin**을 선택합니다.
3. 빌드 시스템으로 **Gradle**을 선택하고 **Create**를 클릭합니다.

    ![새 프로젝트 생성](ksp-new-project.png){width=700}

4. `build.gradle(.kts)` 파일에 KSP 플러그인을 추가합니다:

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

### 어노테이션 생성하기 {id="create-an-annotation"}

프로젝트 루트에 새 모듈을 생성하고 어노테이션을 선언합니다:

1. **File** | **New** | **Module**을 선택합니다. 
2. 왼쪽 목록에서 **Kotlin**을 선택합니다.
3. 다음 필드를 지정하고 **Create**를 클릭합니다:

    * **Name**: annotations
    * **Build system**: Gradle

    ![새 모듈 생성](ksp-new-module.png){width=700}

4. 해당 모듈에 `HelloWorldAnnotation.kt` 파일을 만들고 `HelloWorldAnnotation`이라는 어노테이션을 선언합니다:

    ```kotlin
    // annotations/src/main/kotlin/com/example/annotations/HelloWorldAnnotation.kt
    
    package com.example.annotations
    
    annotation class HelloWorldAnnotation
    ```

### 프로세서 생성 및 등록하기 {id="create-and-register-a-processor"}

1. 프로젝트 루트에 **processor**라는 이름의 또 다른 모듈을 생성합니다.
2. 해당 모듈의 `build.gradle(.kts)` 파일에 KSP API와 앞서 선언한 어노테이션을 의존성으로 추가합니다:

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
3. processor 모듈에 새 `HelloWorldProcessor.kt` 파일을 생성하고 다음 코드를 추가합니다:

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt

    class HelloWorldProcessor(val codeGenerator: CodeGenerator) : SymbolProcessor {
        // 1️⃣ process() function
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
            
       // 3️⃣ createNewFileFrom() function
       private fun createNewFileFrom(function: KSFunctionDeclaration): OutputStream { 
           return codeGenerator.createNewFile(
              dependencies = createDependencyOn(function),
              packageName = "",
              fileName = "GeneratedHelloWorld"
           )
       }
        
       // 3️⃣ createDependencyOn() function
       private fun createDependencyOn(function: KSFunctionDeclaration): Dependencies {
           return Dependencies(aggregating = false, function.containingFile!!)
       }
    }
    
    // Utility function for writing string to OutputStream
    fun OutputStream.write(string: String): Unit {
        this.write(string.toByteArray())
    }
    ```

    IDE에서 제안하는 import 문을 추가합니다. `com.google.devtools.ksp.processing`에서 `Resolver` 및 `Dependencies` 클래스를 import해야 합니다. 또는 `HelloWorldProcessor.kt` 파일 상단에 다음 줄들을 복사해 붙여넣으세요:

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
    {collapsible="true" collapsed-title="Import 문"}

   코드를 자세히 살펴보겠습니다:

    * 1️⃣ `process()` 함수는 프로세서의 메인 로직을 포함합니다. `HelloWorldAnnotation`이 달린 모든 심볼을 가져와 각 심볼에 대해 `HelloWorldVisitor`를 호출합니다.

       `process()` 함수는 이후 라운드에서 처리할 미처리 심볼 목록을 반환합니다. 이 예제에서는 안전하게 `emptyList()`를 반환합니다. 자세한 내용은 [다중 라운드 처리(Multiple round processing)](ksp-multi-round.md)를 참조하세요.

    * 2️⃣ 프로세서는 방문자(visitor)를 사용하여 KSP의 Kotlin 추상 구문 트리(AST) 뷰를 순회합니다. `HelloWorldProcessor` 클래스 내부의 `HelloWorldVisitor` 클래스가 바로 이 방문자입니다. `HelloWorldAnnotation`은 함수에만 사용되므로 `visitFunctionDeclaration()`만 재정의(override)합니다.
   
       > `KSVisitorVoid`는 재정의하여 커스텀할 수 있도록 KSP에서 제공하는 방문자 클래스 중 하나입니다.
       > [`KSVisitor<D, R>` 인터페이스](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/KSVisitor.kt)를 직접 구현하여 고유한 방문자를 생성할 수도 있습니다.
       >
       {style="tip"}

    * 3️⃣ `createNewFileFrom()`은 KSP가 코드를 생성할 파일을 만듭니다. `createDependencyOn()`은 출력 파일이 어노테이션이 사용된 소스 파일에 의존하도록 설정합니다.

       > KSP가 파일을 생성하고 관리하는 방법에 대해 자세히 알아보려면 [`CodeGenerator` 인터페이스](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)의 소스 코드를 확인하세요.
       >
       {style="tip"}
4. `HelloWorldProcessorProvider.kt` 파일을 생성합니다. 그 안에 `SymbolProcessorProvider`를 상속하는 `HelloWorldProcessorProvider` 클래스를 선언합니다:

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
5. 프로세서 프로바이더를 등록합니다. `resources/META-INF/services` 디렉터리에 `com.google.devtools.ksp.processing.SymbolProcessorProvider` 파일을 생성하고 프로바이더의 정규화된 이름(FQN)을 추가합니다:

    ```text
    ## processor/src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider
        
    HelloWorldProcessorProvider
    ```

### 프로세서 사용하기 {id="use-your-processor"}

이제 프로세서를 테스트할 준비가 되었습니다. 다음 단계에 따라 클라이언트 모듈을 생성하고 프로세서가 어노테이션이 적용된 요소를 바탕으로 코드를 생성하도록 합니다:

1. 프로젝트 루트에 `app`이라는 이름의 모듈을 생성합니다. 
2. 해당 모듈의 `build.gradle(.kts)` 파일에서:

    * `plugins {}` 블록에 KSP 플러그인을 추가합니다.
    * `dependencies {}` 블록에 앞서 만든 프로세서와 어노테이션을 추가합니다.

    예:

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

3. 프로젝트 수준의 `settings.gradle(.kts)` 파일에서 모든 서브모듈이 자동으로 포함되었는지 확인합니다:
    
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

4. `app` 모듈에 `Main.kt` 파일을 생성하고 다음 코드를 추가합니다:

    ```kotlin
    // app/src/main/kotlin/Main.kt
   
    import com.example.annotations.HelloWorldAnnotation
    
    @HelloWorldAnnotation
    fun main() {
        helloWorld()
    }
    ```

    > `helloWorld()` 함수가 아직 존재하지 않음에도 `main()` 함수가 이를 호출하고 있습니다. IDE에서는 `helloWorld()`를 정의되지 않은 참조로 강조 표시할 것입니다. 이는 정상적인 동작입니다. 프로젝트를 빌드하고 실행할 때 KSP가 `helloWorld()` 함수를 생성합니다.
    >
    {style="note"}

5. 프로그램을 실행합니다. 콘솔에서 `helloWorld()` 함수의 출력을 확인할 수 있습니다:

    ```text
    Hello world from function generated by KSP
    ```

    KSP는 `GeneratedHelloWorld.kt` 파일에 코드를 생성합니다:
   
    ```text
    app/build/generated/ksp/main/kotlin/GeneratedHelloWorld.kt
    ```

### 프로젝트 구조 살펴보기 {id="explore-the-project-structure"}

프로젝트의 최종 파일 구조는 다음과 같아야 합니다:

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
{collapsible="true" collapsed-title="프로젝트 구조"}

> 추가적인 파일과 디렉터리가 있을 수도 있습니다.
> 
{style="tip"}

## 다음 단계 {id="what-s-next"}

* [KSP 저장소](https://github.com/google/ksp/tree/main/examples/hello-world)에서 이 예제의 전체 코드를 살펴보세요.
* [KSP 저장소](https://github.com/google/ksp/tree/main/examples)에서 더 복잡한 실제 사용 예제를 찾아보세요.
* [KSP 지원 라이브러리](ksp-overview.md#supported-libraries) 목록을 둘러보세요.