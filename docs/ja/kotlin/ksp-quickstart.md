[//]: # (title: KSP 入門)
<web-summary>Kotlin Symbol Processing（KSP）ベースのアノテーションプロセッサをプロジェクトに追加するか、KSP API を使用して独自のアノテーションプロセッサを作成します。</web-summary>

このガイドでは、以下の内容について説明します。

* プロジェクトに KSP ベースのアノテーションプロセッサを追加する方法。
* KSP API を使用して独自のアノテーションプロセッサを作成する方法。
* プロセッサによって生成されたコードの確認場所。

## プロジェクトに KSP ベースのプロセッサを追加する {id="add-a-ksp-based-processor-to-your-project"}

プロジェクトで外部プロセッサを使用するには、`build.gradle(.kts)` ファイルの [`plugins {}` ブロック](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) に KSP を追加します。プロセッサが特定のモジュールでのみ必要な場合は、代わりにそのモジュールの `build.gradle(.kts)` ファイルに追加します。

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

> KSP の最新バージョンについては、GitHub の [Releases](https://github.com/google/ksp/releases) を確認してください。
> 
{style="tip"}

トップレベルの `dependencies {}` ブロックで、使用したいプロセッサを追加します。この例では [Moshi](https://github.com/square/moshi?tab=readme-ov-file#codegen) を使用していますが、他のプロセッサでも同様の手順となります。

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

`ksp(...)` 設定は、アプリケーションのソースにのみプロセッサを適用します。テストソースを処理するには、`kspTest(...)` 設定でプロセッサを追加してください。

> `ksp(...)` 設定はシングルプラットフォームプロジェクトでのみ利用可能です。
> 個々の Kotlin Multiplatform ターゲットおよびコンパイルに対してプロセッサを設定する方法については、[Kotlin Multiplatform での KSP](ksp-multiplatform.md) を参照してください。
> 
{style="note"}

## 独自のプロセッサを作成する {id="create-your-own-processor"}

以下の手順に従って、`helloWorld()` 関数を生成するシンプルなアノテーションプロセッサを作成します。実際にはあまり実用的ではありませんが、独自のプロセッサやアノテーションを作成する基本を学ぶことができます。

### プロジェクトに KSP を追加する {id="add-ksp-to-the-project"}

新しい Kotlin プロジェクトを作成し、KSP プラグインを追加します。

1. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
2. 左側のリストで **Kotlin** を選択します。
3. ビルドシステムとして **Gradle** を選択し、**Create** をクリックします。

    ![新しいプロジェクトの作成](ksp-new-project.png){width=700}

4. `build.gradle(.kts)` ファイルに KSP プラグインを追加します。

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

### アノテーションを作成する {id="create-an-annotation"}

プロジェクトのルートに新しいモジュールを作成し、アノテーションを宣言します。

1. **File** | **New** | **Module** を選択します。
2. 左側のリストで **Kotlin** を選択します。
3. 以下の項目を指定し、**Create** をクリックします。

    * **Name**: annotations
    * **Build system**: Gradle

    ![新しいモジュールの作成](ksp-new-module.png){width=700}

4. モジュール内に `HelloWorldAnnotation.kt` ファイルを作成し、`HelloWorldAnnotation` という名前のアノテーションを宣言します。

    ```kotlin
    // annotations/src/main/kotlin/com/example/annotations/HelloWorldAnnotation.kt
    
    package com.example.annotations
    
    annotation class HelloWorldAnnotation
    ```

### プロセッサを作成して登録する {id="create-and-register-a-processor"}

1. プロジェクトのルートに **processor** という名前の別のモジュールを作成します。
2. モジュールの `build.gradle(.kts)` ファイルに、KSP API と先ほど宣言したアノテーションを依存関係として追加します。

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
3. processor モジュール内に `HelloWorldProcessor.kt` ファイルを作成し、以下のコードを追加します。

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt

    class HelloWorldProcessor(val codeGenerator: CodeGenerator) : SymbolProcessor {
        // 1️⃣ process() 関数
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
            
       // 3️⃣ createNewFileFrom() 関数
       private fun createNewFileFrom(function: KSFunctionDeclaration): OutputStream { 
           return codeGenerator.createNewFile(
              dependencies = createDependencyOn(function),
              packageName = "",
              fileName = "GeneratedHelloWorld"
           )
       }
        
       // 3️⃣ createDependencyOn() 関数
       private fun createDependencyOn(function: KSFunctionDeclaration): Dependencies {
           return Dependencies(aggregating = false, function.containingFile!!)
       }
    }
    
    // 文字列を OutputStream に書き込むためのユーティリティ関数
    fun OutputStream.write(string: String): Unit {
        this.write(string.toByteArray())
    }
    ```

    IDE から提案されたインポートを追加します。`Resolver` クラスと `Dependencies` クラスは必ず `com.google.devtools.ksp.processing` からインポートしてください。または、以下の行を `HelloWorldProcessor.kt` の先頭にコピーしてください。

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
    {collapsible="true" collapsed-title="インポート文"}

   コードの内容を確認してみましょう。

    * 1️⃣ `process()` 関数には、プロセッサのメインロジックが含まれています。`HelloWorldAnnotation` でアノテーションされたすべてのシンボルを取得し、それぞれに対して `HelloWorldVisitor` を呼び出します。

       `process()` 関数は、以降のラウンドで処理するための未処理シンボルのリストを返します。この例では、安全に `emptyList()` を返しています。詳細については、[複数ラウンド処理](ksp-multi-round.md) を参照してください。

    * 2️⃣ プロセッサは、ビジターを使用して KSP が提供する Kotlin の抽象構文木（AST）のビューを巡回します。`HelloWorldProcessor` クラス内では、`HelloWorldVisitor` クラスがビジターとなります。`HelloWorldAnnotation` は関数に対してのみ使用されるため、`visitFunctionDeclaration()` のみがオーバーライドされています。
   
       > `KSVisitorVoid` は、オーバーライドしてカスタマイズできる KSP 提供のビジタークラスの 1 つです。
       > また、[`KSVisitor<D, R>` インターフェース](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/KSVisitor.kt) を実装して独自のビジターを作成することもできます。
       >
       {style="tip"}

    * 3️⃣ `createNewFileFrom()` は、KSP がコードを生成するファイルを作成します。`createDependencyOn()` は、生成される出力ファイルをアノテーションが使用されているソースファイルに依存させます。

       > KSP がファイルを作成・管理する方法の詳細については、[`CodeGenerator` インターフェース](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt) のソースコードを参照してください。
       >
       {style="tip"}
4. `HelloWorldProcessorProvider.kt` ファイルを作成します。その中で、`SymbolProcessorProvider` を継承する `HelloWorldProcessorProvider` クラスを宣言します。

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
5. プロセッサプロバイダを登録します。`resources/META-INF/services` ディレクトリに `com.google.devtools.ksp.processing.SymbolProcessorProvider` という名前のファイルを作成し、プロバイダの完全修飾名を追加します。

    ```text
    ## processor/src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider
        
    HelloWorldProcessorProvider
    ```

### プロセッサを使用する {id="use-your-processor"}

これで、プロセッサをテストする準備が整いました。以下の手順に従ってクライアントモジュールを作成し、アノテーションが付与された要素に基づいてプロセッサにコードを生成させます。

1. プロジェクトのルートに `app` というモジュールを作成します。
2. そのモジュールの `build.gradle(.kts)` ファイルで以下を行います。

    * `plugins {}` ブロックに KSP プラグインを追加します。
    * `dependencies {}` ブロックにプロセッサとアノテーションを追加します。

    例：

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

3. プロジェクトレベルの `settings.gradle(.kts)` ファイルで、すべてのサブモジュールが自動的にインクルードされていることを確認します。
    
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

4. `app` モジュール内に `Main.kt` ファイルを作成し、以下のコードを追加します。

    ```kotlin
    // app/src/main/kotlin/Main.kt
   
    import com.example.annotations.HelloWorldAnnotation
    
    @HelloWorldAnnotation
    fun main() {
        helloWorld()
    }
    ```

    > `helloWorld()` 関数はまだ存在しないにもかかわらず、`main()` 関数から呼び出されています。IDE では `helloWorld()` が未定義の参照としてハイライトされますが、これは想定通りの挙動です。プロジェクトをビルドして実行すると、KSP が `helloWorld()` 関数を生成します。
    >
    {style="note"}

5. プログラムを実行します。コンソールに `helloWorld()` 関数の出力が表示されます。

    ```text
    Hello world from function generated by KSP
    ```

    KSP は `GeneratedHelloWorld.kt` ファイル内にコードを生成します。
   
    ```text
    app/build/generated/ksp/main/kotlin/GeneratedHelloWorld.kt
    ```

### プロジェクト構造を確認する {id="explore-the-project-structure"}

プロジェクトの最終的なファイル構造は以下のようになります。

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
{collapsible="true" collapsed-title="プロジェクト構造"}

> 追加のファイルやディレクトリが存在する場合もあります。
> 
{style="tip"}

## 次のステップ {id="what-s-next"}

* このサンプルの完全なコードは [KSP リポジトリ](https://github.com/google/ksp/tree/main/examples/hello-world) で確認できます。
* より複雑で実践的なサンプルは [KSP リポジトリ](https://github.com/google/ksp/tree/main/examples) を参照してください。
* [KSP 対応ライブラリ一覧](ksp-overview.md#supported-libraries) をご覧ください。