[//]: # (title: Kotlin を使用した Spring Boot プロジェクトの作成)

<web-summary>IntelliJ IDEA を使用して Kotlin で Spring Boot アプリケーションを作成します。</web-summary>

このチュートリアルの最初のパートでは、IntelliJ IDEA の Project Wizard を使用して、Gradle を使った Spring Boot プロジェクトを作成する方法を説明します。

> このチュートリアルでは、ビルドシステムとして Gradle を使用することが必須ではありません。Maven を使用する場合でも、同様の手順に従うことができます。
> 
{style="note"}

## 始める前に {id="before-you-start"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) の最新バージョンをダウンロードしてインストールし、Ultimate サブスクリプションを使用してください。

> Ultimate サブスクリプションのない IntelliJ IDEA を使用している場合や、別の IDE を使用している場合は、[Web ベースのプロジェクトジェネレーター](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin) を使用して Spring Boot プロジェクトを生成できます。
> 
{style="tip"}

## Spring Boot プロジェクトの作成 {id="create-a-spring-boot-project"}

IntelliJ IDEA の Project Wizard を使用して、Kotlin を使った新しい Spring Boot プロジェクトを作成します。

1. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
2. 左側のパネルで、**Generators** セクションの **Spring Boot** を選択します。
3. **New Project** ウィンドウで以下のフィールドとオプションを指定します。
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > このオプションはビルドシステムと DSL を指定します。
     >
     {style="tip"}

   * **Package name**: com.example.demo
   * **JDK**: Java JDK
     
     > このチュートリアルでは **Amazon Corretto バージョン 23** を使用しています。
     > JDK がインストールされていない場合は、ドロップダウンリストからダウンロードできます。
     >
     {style="note"}
   
   * **Java**: 17
   
     > Java 17 がインストールされていない場合は、JDK ドロップダウンリストからダウンロードできます。
     >
     {style="tip"}

   ![Spring Boot プロジェクトの作成](create-spring-boot-project.png){width=700}

4. すべてのフィールドを指定したことを確認し、**Next** をクリックします。

5. チュートリアルで必要となる以下の依存関係を選択します。

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![Spring Boot プロジェクトのセットアップ](set-up-spring-boot-project.png){width=700}

6. **Create** をクリックしてプロジェクトを生成およびセットアップします。

   > IDE が新しいプロジェクトを生成して開きます。プロジェクトの依存関係のダウンロードとインポートには少し時間がかかる場合があります。
   >
   {style="tip"} 

7. その後、**Project ビュー**で以下の構造を確認できます。

   ![Spring Boot プロジェクトのセットアップ](spring-boot-project-view.png){width=400}

   生成された Gradle プロジェクトは、Maven の標準ディレクトリレイアウトに対応しています。
   * `main/kotlin` フォルダの下には、アプリケーションに属するパッケージとクラスがあります。
   * アプリケーションのエントリポイントは、`DemoApplication.kt` ファイルの `main()` メソッドです。

## プロジェクトの Gradle ビルドファイルの確認 {initial-collapse-state="collapsed" collapsible="true" id="explore-the-project-gradle-build-file"}

`build.gradle.kts` ファイルを開きます。これは Gradle Kotlin ビルドスクリプトであり、アプリケーションに必要な依存関係のリストが含まれています。

この Gradle ファイルは Spring Boot の標準的なものですが、[`kotlin-spring` Gradle プラグイン](kotlin-spring-plugin.md)（`kotlin("plugin.spring")`）を含む、必要な Kotlin の依存関係も含まれています。

すべてのパーツと依存関係の説明を含む完全なスクリプトは以下のとおりです。

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%" // 使用する Kotlin のバージョン
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring プラグイン
    id("org.springframework.boot") version "%springBootVersion%"
    id("io.spring.dependency-management") version "1.1.7"
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
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Spring との連携に必要な Kotlin リフレクションライブラリ
    implementation("tools.jackson.module:jackson-module-kotlin") // JSON を扱うための Kotlin 向け Jackson 拡張機能
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict` は JSR-305 アノテーションの厳格モード（strict mode）を有効にします
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

ご覧のとおり、Gradle ビルドファイルにはいくつかの Kotlin 関連のアーティファクトが追加されています。

1. `plugins` ブロックには、2 つの Kotlin アーティファクトがあります。

   * `kotlin("jvm")` プラグインは、プロジェクトで使用される Kotlin のバージョンを定義します。
   * Kotlin Spring コンパイラプラグインである `kotlin("plugin.spring")` は、Kotlin クラスに `open` 修飾子を追加して Spring Framework の機能との互換性を持たせます。

2. `dependencies` ブロックには、いくつかの Kotlin 関連モジュールがリストされています。

   * `tools.jackson.module:jackson-module-kotlin` モジュールは、Kotlin クラスおよびデータクラスのシリアライズとデシリアライズのサポートを追加します。
   * `org.jetbrains.kotlin:kotlin-reflect` は、[リフレクション機能](reflection.md)の完全なサポートを有効にする Kotlin リフレクションライブラリです。

3. 依存関係セクションの後には、`kotlin` プラグインの設定ブロックがあります。
   ここでは、さまざまな言語機能を有効または無効にするためのコンパイラへの追加引数を追加できます。

Kotlin コンパイラオプションの詳細については、[](gradle-compiler-options.md) を参照してください。

## 生成された Spring Boot アプリケーションの確認 {id="explore-the-generated-spring-boot-application"}

`DemoApplication.kt` ファイルを開きます。

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
   <def title="クラスの宣言 – class DemoApplication">
      <p>パッケージ宣言と import 文の直後に、最初のクラス宣言である <code>class DemoApplication</code> があります。</p>
      <p>Kotlin では、クラスにメンバー（プロパティや関数）が含まれていない場合、クラス本体（<code>{}</code>）を完全に省略できます。</p>
   </def>
   <def title="@SpringBootApplication アノテーション">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication</code> アノテーション</a>は、Spring Boot アプリケーションにおける便利なアノテーションです。
      Spring Boot の<a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">自動構成（auto-configuration）</a>、<a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">コンポーネントスキャン（component scan）</a>を有効にし、「アプリケーションクラス」上で追加の設定を定義できるようにします。
      </p>
   </def>
   <def title="プログラムのエントリポイント – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 関数は、アプリケーションへのエントリポイントです。</p>
      <p>これは <code>DemoApplication</code> クラスの外部に<a href="functions.md#function-scope">トップレベル関数</a>として宣言されています。<code>main()</code> 関数は Spring の <code>runApplication(&#42;args)</code> 関数を呼び出し、Spring Framework でアプリケーションを起動します。</p>
   </def>
   <def title="可変長引数 – args: Array&lt;String&gt;">
      <p><code>runApplication()</code> 関数の宣言を確認すると、関数のパラメータに <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 修飾子</a>が付いていることがわかります（<code>vararg args: String</code>）。
        これは、関数に可変個の String 引数を渡すことができることを意味します。
      </p>
   </def>
   <def title="スプレッド演算子 – (*args)">
      <p><code>args</code> は、String の配列として宣言された <code>main()</code> 関数のパラメータです。
        文字列の配列が存在し、その内容を関数に渡したいため、スプレッド演算子（配列の前にアスタリスク記号 <code>&#42;</code> を付ける）を使用します。
      </p>
   </def>
</deflist>

## コントローラーの作成 {id="create-a-controller"}

アプリケーションを実行する準備は整いましたが、まずはそのロジックを更新しましょう。

Spring アプリケーションでは、Web リクエストを処理するためにコントローラーが使用されます。
同じパッケージ内の `DemoApplication.kt` ファイルの隣に、以下のような `MessageController` クラスを持つ `MessageController.kt` ファイルを作成します。

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
   <def title="@RestController アノテーション">
      <p><code>MessageController</code> が REST コントローラーであることを Spring に伝える必要があるため、<code>@RestController</code> アノテーションを付ける必要があります。</p>
      <p>このアノテーションにより、このクラスは <code>DemoApplication</code> クラスと同じパッケージにあるため、コンポーネントスキャンによって検出されます。</p>
   </def>
   <def title="@GetMapping アノテーション">
      <p><code>@GetMapping</code> は、HTTP GET 呼び出しに対応するエンドポイントを実装する REST コントローラーの関数に付けられます。</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam アノテーション">
      <p>関数のパラメータ <code>name</code> には <code>@RequestParam</code> アノテーションが付いています。このアノテーションは、メソッドパラメータが Web リクエストパラメータにバインドされるべきであることを示します。</p>
      <p>したがって、ルートでアプリケーションにアクセスし、<code>/?name=&lt;your-value&gt;</code> のように「name」というリクエストパラメータを指定すると、そのパラメータ値が <code>index()</code> 関数を呼び出すための引数として使用されます。</p>
   </def>
   <def title="単一式関数 – index()">
      <p><code>index()</code> 関数にはステートメントが 1 つしか含まれていないため、<a href="functions.md#single-expression-functions">単一式関数（single-expression function）</a>として宣言できます。</p>
      <p>これは波括弧を省略でき、本体を等号 <code>=</code> の後に指定できることを意味します。</p>
   </def>
   <def title="関数の戻り値の型推論">
      <p><code>index()</code> 関数は戻り値の型を明示的に宣言していません。代わりに、コンパイラは等号 <code>=</code> の右側にあるステートメントの結果を見て戻り値の型を推論します。</p>
      <p><code>Hello, $name!</code> 式の型は <code>String</code> であるため、関数の戻り値の型も <code>String</code> になります。</p>
   </def>
   <def title="文字列テンプレート – $name">
      <p><code>Hello, $name!</code> という式は、Kotlin では<a href="strings.md#string-templates"><i>文字列テンプレート（String template）</i></a>と呼ばれます。</p>
      <p>文字列テンプレートは、埋め込み式を含む文字列リテラルです。</p>
      <p>これは、文字列の連結操作を便利に置き換えるものです。</p>
   </def>
</deflist>

## アプリケーションの実行 {id="run-the-application"}

これで Spring アプリケーションを実行する準備が整いました。

1. `DemoApplication.kt` ファイルで、`main()` メソッドの横にあるガターの緑色の **Run** アイコンをクリックします。

    ![Spring Boot アプリケーションの実行](run-spring-boot-application.png){width=700}
    
    > ターミナルで `./gradlew bootRun` コマンドを実行することもできます。
    >
    {style="tip"}

    これにより、コンピューター上でローカルサーバーが起動します。

2. アプリケーションが起動したら、次の URL を開きます。

    ```text
    http://localhost:8080?name=John
    ```

    レスポンスとして "Hello, John!" と表示されるはずです。

    ![Spring アプリケーションのレスポンス](spring-application-response.png){width=700}

## 次のステップ {id="next-step"}

チュートリアルの次のパートでは、Kotlin のデータクラスと、それをアプリケーションでどのように使用できるかについて学びます。

<list id="tour-nav">
  <li>
    <a as="button" href="jvm-spring-boot-add-data-class.md" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
  </li>
</list>