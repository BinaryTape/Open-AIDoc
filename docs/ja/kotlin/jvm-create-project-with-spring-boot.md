[//]: # (title: KotlinでSpring Bootプロジェクトを作成する)

<web-summary>IntelliJ IDEAを使用して、KotlinでSpring Bootアプリケーションを作成します。</web-summary>

<tldr>
    <p>これは <strong>Spring BootとKotlinをはじめよう</strong> チュートリアルの第1パートです：</p><br/>
    <p><img src="icon-1.svg" width="20" alt="ステップ1"/> <strong>KotlinでSpring Bootプロジェクトを作成する</strong><br/><img src="icon-2-todo.svg" width="20" alt="ステップ2"/> Spring Bootプロジェクトにデータクラスを追加する<br/><img src="icon-3-todo.svg" width="20" alt="ステップ3"/> Spring Bootプロジェクトにデータベースのサポートを追加する<br/><img src="icon-4-todo.svg" width="20" alt="ステップ4"/> データベースアクセスにSpring Data CrudRepositoryを使用する<br/></p>
</tldr>

このチュートリアルの第1パートでは、IntelliJ IDEAのプロジェクトウィザードを使用して、Gradleを用いたSpring Bootプロジェクトを作成する方法を説明します。

> このチュートリアルでは、ビルドシステムとしてGradleを使用することは必須ではありません。Mavenを使用する場合でも、同じ手順に従うことができます。
> 
{style="note"}

## 始める前に

最新バージョンの [IntelliJ IDEA Ultimate Edition](https://www.jetbrains.com/idea/download/) をダウンロードしてインストールしてください。

> IntelliJ IDEA Community Editionまたは別のIDEを使用している場合は、[ウェブベースのプロジェクトジェネレーター](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)を使用してSpring Bootプロジェクトを生成できます。
> 
{style="tip"}

## Spring Bootプロジェクトの作成

IntelliJ IDEA Ultimate Editionのプロジェクトウィザードを使用して、Kotlinによる新しいSpring Bootプロジェクトを作成します。

1. IntelliJ IDEAで、**File** | **New** | **Project** を選択します。 
2. 左側のパネルの **Generators** セクションで **Spring Boot** を選択します。
3. **New Project** ウィンドウで、以下のフィールドとオプションを指定します。
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > このオプションは、ビルドシステムとDSLを指定します。
     >
     {style="tip"}

   * **Package name**: com.example.demo
   * **JDK**: Java JDK
     
     > このチュートリアルでは **Amazon Corretto version 23** を使用しています。
     > JDKがインストールされていない場合は、ドロップダウンリストからダウンロードできます。
     >
     {style="note"}
   
   * **Java**: 17
   
     > Java 17がインストールされていない場合は、JDKのドロップダウンリストからダウンロードできます。
     >
     {style="tip"}

   ![Spring Bootプロジェクトの作成](create-spring-boot-project.png){width=700}

4. すべてのフィールドが指定されていることを確認し、**Next** をクリックします。

5. チュートリアルで必要となる以下の依存関係（dependencies）を選択します。

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![Spring Bootプロジェクトのセットアップ](set-up-spring-boot-project.png){width=700}

6. **Create** をクリックして、プロジェクトを生成およびセットアップします。

   > IDEが新しいプロジェクトを生成して開きます。プロジェクトの依存関係のダウンロードとインポートに時間がかかる場合があります。
   >
   {style="tip"} 

7. その後、**Projectビュー** で以下の構造を確認できます。

   ![Spring Bootプロジェクトのセットアップ](spring-boot-project-view.png){width=400}

   生成されたGradleプロジェクトは、Mavenの標準的なディレクトリレイアウトに対応しています。
   * `main/kotlin` フォルダの下に、アプリケーションに属するパッケージとクラスがあります。
   * アプリケーションの開始点は、`DemoApplication.kt` ファイルの `main()` メソッドです。

## プロジェクトのGradleビルドファイルを調べる {initial-collapse-state="collapsed" collapsible="true"}

`build.gradle.kts` ファイルを開きます。これはGradleのKotlinビルドスクリプトで、アプリケーションに必要な依存関係のリストが含まれています。

このGradleファイルはSpring Bootの標準的なものですが、`kotlin-spring` Gradleプラグイン（`kotlin("plugin.spring")`）を含む、必要なKotlinの依存関係も含まれています。

以下は、すべての構成要素と依存関係の説明を含むフルスクリプトです。

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%" // 使用するKotlinのバージョン
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Springプラグイン
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
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Kotlinリフレクションライブラリ、Springでの動作に必要
    implementation("tools.jackson.module:jackson-module-kotlin") // JSONを扱うためのKotlin用Jackson拡張
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict` はJSR-305アノテーションの厳密モードを有効にします
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

見ての通り、GradleビルドファイルにはKotlin関連の成果物がいくつか追加されています。

1. `plugins` ブロックには、2つのKotlin成果物があります。

   * `kotlin("jvm")` プラグインは、プロジェクトで使用されるKotlinのバージョンを定義します。
   * Kotlin Springコンパイラプラグイン `kotlin("plugin.spring")` は、Kotlinクラスに `open` 修飾子を追加し、Spring Frameworkの機能との互換性を持たせます。

2. `dependencies` ブロックには、いくつかのKotlin関連モジュールがリストされています。

   * `tools.jackson.module:jackson-module-kotlin` モジュールは、Kotlinクラスやデータクラスのシリアル化とデシリアル化のサポートを追加します。
   * `org.jetbrains.kotlin:kotlin-reflect` は、[リフレクション機能](reflection.md)を完全にサポートするためのKotlinリフレクションライブラリです。

3. 依存関係セクションの後に、`kotlin` プラグインの設定ブロックがあります。
   ここでは、さまざまな言語機能を有効または無効にするための追加のコンパイラ引数を追加できます。

Kotlinコンパイラオプションの詳細については、[](gradle-compiler-options.md) を参照してください。

## 生成されたSpring Bootアプリケーションを調べる

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
      <p>パッケージ宣言とインポート文の直後に、最初のクラス宣言 <code>class DemoApplication</code> があります。</p>
      <p>Kotlinでは、クラスにメンバー（プロパティや関数）が含まれていない場合、クラス本体（<code>{}</code>）を省略できます。</p>
   </def>
   <def title="@SpringBootApplication アノテーション">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication</code> アノテーション</a> は、Spring Bootアプリケーションにおける便利なアノテーションです。
      これにより、Spring Bootの <a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">自動設定（auto-configuration）</a>、<a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">コンポーネントスキャン</a> が有効になり、"アプリケーションクラス"上で追加の設定を定義できるようになります。
      </p>
   </def>
   <def title="プログラムの開始点 – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 関数は、アプリケーションの開始点（エントリーポイント）です。</p>
      <p>これは <code>DemoApplication</code> クラスの外側で <a href="functions.md#function-scope">トップレベル関数</a> として宣言されています。<code>main()</code> 関数はSpringの `runApplication(*args)` 関数を呼び出し、Spring Frameworkでアプリケーションを開始します。</p>
   </def>
   <def title="可変長引数 – args: Array&lt;String&gt;">
      <p><code>runApplication()</code> 関数の宣言を確認すると、関数のパラメータに <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 修飾子</a> が付いていることがわかります（<code>vararg args: String</code>）。
        これは、関数に可変個のString引数を渡せることを意味します。
      </p>
   </def>
   <def title="スプレッド演算子 – (*args)">
      <p><code>args</code> は、文字列の配列として宣言された <code>main()</code> 関数のパラメータです。
        文字列の配列があり、その内容を関数に渡したい場合は、スプレッド演算子（配列の前にアスタリスク <code>*</code> を付ける）を使用します。
      </p>
   </def>
</deflist>

## コントローラーの作成

アプリケーションを実行する準備はできていますが、先にロジックを更新しましょう。

Springアプリケーションでは、Webリクエストを処理するためにコントローラーを使用します。
`DemoApplication.kt` ファイルと同じパッケージ内に、`MessageController` クラスを持つ `MessageController.kt` ファイルを次のように作成します。

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
      <p>Springに対して <code>MessageController</code> がRESTコントローラーであることを伝える必要があるため、<code>@RestController</code> アノテーションを付けます。</p>
      <p>このアノテーションにより、このクラスは <code>DemoApplication</code> クラスと同じパッケージにあるため、コンポーネントスキャンによって自動的に検出されます。</p>
   </def>
   <def title="@GetMapping アノテーション">
      <p><code>@GetMapping</code> は、HTTP GET呼び出しに対応するエンドポイントを実装するRESTコントローラーの関数をマークします。</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam アノテーション">
      <p>関数のパラメータ <code>name</code> には <code>@RequestParam</code> アノテーションが付いています。このアノテーションは、メソッドのパラメータがウェブのリクエストパラメータにバインドされるべきであることを示します。</p>
      <p>したがって、アプリケーションのルートにアクセスし、<code>/?name=&lt;your-value&gt;</code> のように "name" という名前のリクエストパラメータを指定すると、そのパラメータ値が <code>index()</code> 関数の呼び出し時の引数として使用されます。</p>
   </def>
   <def title="単一式関数 – index()">
      <p><code>index()</code> 関数には文が1つしかないため、<a href="functions.md#single-expression-functions">単一式関数（single-expression function）</a> として宣言できます。</p>
      <p>これは、波括弧を省略でき、等号 <code>=</code> の後に本体を指定することを意味します。</p>
   </def>
   <def title="関数の戻り値型の型推論">
      <p><code>index()</code> 関数は戻り値の型を明示的に宣言していません。代わりに、コンパイラが等号 <code>=</code> の右側にある文の結果を見て戻り値の型を推論します。</p>
      <p><code>Hello, $name!</code> 式の型は <code>String</code> であるため、関数の戻り値の型も <code>String</code> になります。</p>
   </def>
   <def title="文字列テンプレート – $name">
      <p><code>Hello, $name!</code> という式は、Kotlinでは <a href="strings.md#string-templates"><i>文字列テンプレート（String template）</i></a> と呼ばれます。</p>
      <p>文字列テンプレートは、埋め込み式を含む文字列リテラルです。</p>
      <p>これは、文字列結合操作の便利な代替手段です。</p>
   </def>
</deflist>

## アプリケーションの実行

Springアプリケーションを実行する準備が整いました。

1. `DemoApplication.kt` ファイルで、`main()` メソッドの横にあるガターの緑色の **Run** アイコンをクリックします。

    ![Spring Bootアプリケーションの実行](run-spring-boot-application.png){width=700}
    
    > ターミナルで `./gradlew bootRun` コマンドを実行することもできます。
    >
    {style="tip"}

    これにより、コンピュータ上でローカルサーバーが起動します。

2. アプリケーションが起動したら、次のURLを開きます。

    ```text
    http://localhost:8080?name=John
    ```

    レスポンスとして "Hello, John!" と表示されるはずです。

    ![Springアプリケーションのレスポンス](spring-application-response.png){width=700}

## 次のステップ

チュートリアルの次のパートでは、Kotlinのデータクラスと、それをアプリケーションでどのように使用できるかについて学びます。

**[次の章に進む](jvm-spring-boot-add-data-class.md)**