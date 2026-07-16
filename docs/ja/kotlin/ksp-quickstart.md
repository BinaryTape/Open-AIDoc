[//]: # (title: KSP を使い始める)
[//]: # (description: Kotlin Symbol Processing (KSP) に基づくアノテーションプロセッサーをプロジェクトに追加する方法、または KSP API を使用して独自のプロセッサーを作成する方法について説明します。)

このガイドでは、以下の内容について学びます：

* KSP ベースのアノテーションプロセッサーをプロジェクトに追加する方法。
* KSP API を使用して独自のアノテーションプロセッサーを作成する方法。
* プロセッサーによって生成されたコードがどこにあるか。

## KSP ベースのプロセッサーをプロジェクトに追加する

プロジェクトで外部プロセッサーを使用するには、`build.gradle(.kts)` ファイルの [`plugins {}` ブロック](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)に KSP を追加します。プロセッサーが特定のモジュールでのみ必要な場合は、代わりにそのモジュールの `build.gradle(.kts)` ファイルに追加してください。

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

> KSP の最新バージョンを確認するには、GitHub の [Releases](https://github.com/google/ksp/releases) をチェックしてください。
> 
{style="tip"}

トップレベルの `dependencies {}` ブロックに、使用したいプロセッサーを追加します。この例では [Moshi](https://github.com/square/moshi?tab=readme-ov-file#codegen) を使用していますが、他のプロセッサーでも手順は同じです。

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

## 独自のプロセッサーを作成する

以下の手順に従って、`helloWorld()` 関数を生成するシンプルなアノテーションプロセッサーを作成します。実用的ではありませんが、独自のプロセッサーとアノテーションを作成するための基本を理解できます。

### プロジェクトに KSP を追加する

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

### アノテーションを作成する

プロジェクトのルートに新しいモジュールを作成し、アノテーションを宣言します。

1. **File** | **New** | **Module** を選択します。 
2. 左側のリストで **Kotlin** を選択します。
3. 以下のフィールドを指定して **Create** をクリックします。

    * **Name**: annotations
    * **Build system**: Gradle

    ![新しいモジュールの作成](ksp-new-module.png){width=700}

4. モジュール内に `HelloWorldAnnotation.kt` ファイルを作成し、`HelloWorldAnnotation` という名前のアノテーションを宣言します。

    ```kotlin
    // annotations/src/main/kotlin/com/example/annotations/HelloWorldAnnotation.kt
    
    package com.example.annotations
    
    annotation class HelloWorldAnnotation
    ```

### プロセッサーを作成して登録する

1. プロジェクトのルートに **processor** という名前の別のモジュールを作成します。

2. モジュールの `build.gradle(.kts)` ファイルに、KSP API と宣言したアノテーションを依存関係として追加します。

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

3. processor モジュール内に新しい `HelloWorldProcessor.kt` ファイルを作成し、以下のコードを追加します。

    ```kotlin
    // processor/src/main/kotlin/HelloWorldProcessor.kt

    class HelloWorldProcessor(val codeGenerator: CodeGenerator) : SymbolProcessor {
        // 1️⃣ process() 関数
        override fun process(resolver: Resolver): `List<KSAnnotated>` {
            resolver
                .getSymbolsWithAnnotation("com.example.annotations.HelloWorldAnnotation")
                .filter { it.validate() }
                .filterIsInstance<KSFunctionDeclaration>()
                .forEach { it.accept(HelloWorldVisitor(), Unit) }
        
           return emptyList()
        }
        
       // 2️⃣ ビジター
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

    IDE で提案されるインポートを追加してください。`com.google.devtools.ksp.processing` から `Resolver` と `Dependencies` クラスをインポートするようにしてください。または、`HelloWorldProcessor.kt` の冒頭に以下の行をコピーしてください。

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
   

    コードの内容を見ていきましょう：
    
    * 1️⃣ `process()` 関数にはプロセッサーのメインロジックが含まれています。`HelloWorldAnnotation` でアノテーションされたすべてのシンボルを取得し、それぞれに対して `HelloWorldVisitor` を呼び出します。
    
        `process()` 関数は、後のラウンドで処理するために、未処理のシンボルのリストを返します。この例では、安全に `emptyList()` を返しています。詳細については、[複数ラウンドの処理](ksp-multi-round.md)を参照してください。
    
    * 2️⃣ プロセッサーは、ビジターを使用して KSP が提供する Kotlin 抽象構文木 (AST) のビューをトラバースします。`HelloWorldProcessor` クラスの中にある `HelloWorldVisitor` クラスがそのビジターです。`HelloWorldAnnotation` は関数にのみ使用されるため、`visitFunctionDeclaration()` のみをオーバーライドしています。
    
        > `KSVisitorVoid` は KSP が提供するビジタークラスの 1 つで、オーバーライドして調整できます。
        > [`KSVisitor<D, R>` インターフェース](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/KSVisitor.kt)を実装して、独自のビジターを作成することもできます。
        > 
        {style="tip"}
    
    * 3️⃣ `createNewFileFrom()` は、KSP がコードを生成するファイルを作成します。`createDependencyOn()` は、生成された出力ファイルが、アノテーションが使用されているソースファイルに依存するようにします。

        > KSP がファイルを生成・管理する方法について詳しく知るには、[`CodeGenerator` インターフェース](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)のソースコードを参照してください。
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

5. プロセッサープロバイダーを登録します。`resources/META-INF/services` ディレクトリに `com.google.devtools.ksp.processing.SymbolProcessorProvider` という名前のファイルを作成し、プロバイダーの完全修飾名を追加します。

    ```text
    ## processor/src/main/resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider
        
    HelloWorldProcessorProvider
    ```

### プロセッサーを使用する

これでプロセッサーをテストする準備が整いました。以下の手順に従ってクライアントモジュールを作成し、アノテーションが付いた要素に基づいてプロセッサーにコードを生成させます。

1. プロジェクトのルートに `app` という名前のモジュールを作成します。 
2. モジュールの `build.gradle(.kts)` ファイルで：

    * `plugins {}` ブロックに KSP プラグインを追加します。
    * `dependencies {}` ブロックに作成したプロセッサーとアノテーションを追加します。

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

3. プロジェクトレベルの `settings.gradle(.kts)` ファイルで、すべてのサブモジュールが自動的に含まれていることを確認します。
    
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

    > `main()` 関数は `helloWorld()` を呼び出していますが、この関数はまだ存在しません。IDE は `helloWorld()` を未定義の参照としてハイライトします。これは想定通りです。プロジェクトをビルドして実行すると、KSP が `helloWorld()` 関数を生成します。
    >
    {style="note"}

5. プログラムを実行します。コンソールに `helloWorld()` 関数の出力が表示されます。

    ```text
    Hello world from function generated by KSP
    ```

    KSP は `GeneratedHelloWorld.kt` ファイルにコードを生成します：
   
    ```text
    app/build/generated/ksp/main/kotlin/GeneratedHelloWorld.kt
    ```

### プロジェクト構造を確認する

プロジェクトの最終的なファイル構造は以下のようになるはずです。

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

> 追加のファイルやディレクトリがある場合があります。
> 
{style="tip"}

## 次のステップ

* この例の完全なコードは [KSP リポジトリ](https://github.com/google/ksp/tree/main/examples/hello-world)で確認できます。
* より複雑で実践的な例については、[KSP リポジトリ](https://github.com/google/ksp/tree/main/examples)を参照してください。
* [KSP サポートライブラリ](ksp-overview.md#supported-libraries)のリストを確認してください。