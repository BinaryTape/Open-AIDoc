[//]: # (title: KotlinとJUnitを使用したJavaコードのテスト – チュートリアル)

<web-summary>MavenまたはGradleでビルドされたJavaプロジェクトを設定し、Kotlinで記述されたJUnitテストを統合します。</web-summary>

KotlinはJavaと完全に相互運用可能であるため、Kotlinを使用してJavaコードのテストを作成し、同じプロジェクト内で既存のJavaテストと一緒に実行できます。

このチュートリアルでは、次の方法を学びます：

* [JUnit](https://junit.org/)を使用してテストを実行するための、JavaとKotlinの混在プロジェクトの設定。
* Javaコードを検証するKotlinテストの追加。
* MavenまたはGradleを使用したテストの実行。

> 開始する前に、以下が準備されていることを確認してください：
>
> * [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)、または[Kotlin拡張機能](https://github.com/Kotlin/kotlin-lsp/tree/main?tab=readme-ov-file#vs-code-quick-start)がインストールされた[VS Code](https://code.visualstudio.com/Download)。
> * Java 17以降。
>
{style="note"}

## プロジェクトの設定 {id="configure-the-project"}

1. IDEで、バージョン管理からサンプルプロジェクトをクローンします：

   ```text
   https://github.com/kotlin-hands-on/kotlin-junit-sample.git
   ```

2. `initial` モジュールに移動し、プロジェクト構造を確認します：

    ```text
    kotlin-junit-sample/
    ├── initial/
    │   ├── src/
    │   │   ├── main/java/    # Java ソースコード
    │   │   └── test/java/    # Java で書かれた JUnit テスト
    │   ├── pom.xml           # Maven 設定
    │   └── build.gradle.kts  # Gradle 設定
    ```

   `initial` モジュールには、単一のテストを含むJavaのシンプルなTodoアプリケーションが含まれています。

3. 同じディレクトリでビルドファイルを開き、Kotlinをサポートするように内容を更新します：

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="pom.xml ファイル"}

    * `<properties>` セクションで、Kotlinのバージョンを設定します。
    * `<dependencies>` セクションに、テストを実行するためのJUnit Jupiterの依存関係を追加します。
    * `<build><plugins>` セクションで、`<extensions>` を `true` に設定して `kotlin-maven-plugin` を適用します。これにより、対応する実行構成と `kotlin-stdlib` の依存関係がビルドに自動的に追加されます。
    * extensionsを有効にしてKotlin Mavenプラグインを使用する場合、`<build><pluginManagement>` セクションに `maven-compiler-plugin` を追加する必要はありません。

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

    * `plugins {}` ブロックに、`kotlin("jvm")` プラグインを追加します。
    * JVMツールチェーンのバージョンをJavaのバージョンに合わせて設定します。
    * `dependencies {}` ブロックに、Kotlinのテストユーティリティを提供し、JUnitと統合する `kotlin.test` ライブラリを追加します。
      
    Kotlin/JVMは、最新の安定版JUnitであるJUnit 6をサポートしています。これは `gradle/libs.versions.toml` バージョンカタログに記述されています。
   
    通常バージョンカタログを使用したい場合は、`kotlin("jvm")` プラグインをバージョンカタログに追加することもできます：

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

4. IDEでビルドファイルを再読み込み（リロード）します。

ビルドファイルの設定に関する詳細な手順については、[プロジェクト設定](mixing-java-kotlin-intellij.md#project-configuration)を参照してください。

## 最初のKotlinテストを追加する {id="add-your-first-kotlin-test"}

`initial/src/test/java` 内の `TodoItemTest.java` テストでは、アイテムの作成、デフォルト値、一意のID、状態の変化といったアプリケーションの基本的な動作がすでに検証されています。

リポジトリレベルの振る舞いを検証するKotlinテストを追加することで、テストカバレッジを広げることができます：

1. 同じテストソースディレクトリ `initial/src/test/java` に移動します。
2. Javaテストと同じパッケージ内に `TodoRepositoryTest.kt` ファイルを作成します。
3. フィールド宣言とセットアップ関数を含むテストクラスを作成します：

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

    * JUnitのアノテーションは、Javaと同様にKotlinでも機能します。
    * Kotlinでは、[`lateinit` キーワード](properties.md#late-initialized-properties-and-variables)を使用することで、後から初期化される非nullプロパティを宣言できます。これにより、テスト内でnullable型（`TodoRepository?`）を使用する必要がなくなります。

4. `TodoRepositoryTest` クラス内に、リポジトリの初期状態とそのサイズを確認するテストを追加します：

   ```kotlin
   @Test
   @DisplayName("Should start with empty repository")
   fun shouldStartEmpty() {
       Assertions.assertEquals(0, repository.size())
       Assertions.assertTrue(repository.all.isEmpty())
   }
   ```

    * Javaのstaticインポートとは異なり、Jupiterの `Assertions` はクラスとしてインポートされ、アサーション関数の修飾子として使用されます。
    * `.getAll()` を呼び出す代わりに、Kotlinでは `repository.all` のようにJavaのゲッターにプロパティとしてアクセスできます。

5. すべてのアイテムに対するコピーの振る舞いを検証する別のテストを作成します：

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

    * KotlinクラスからJavaのクラスオブジェクトを取得するには、`::class.java` を使用します。
    * 特別な行継続文字を使用せずに、複雑なアサーションを複数行に分割できます。

6. IDによるアイテムの検索を検証するテストを追加します：

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

   KotlinはJavaの [`Optional` API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html) とスムーズに連携します。ゲッターメソッドが自動的にプロパティに変換されるため、ここでは `isPresent()` メソッドがプロパティとしてアクセスされています。

7. アイテムの削除メカニズムを検証するテストを作成します：

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

   Kotlinでは、`repository.getById(id).isEmpty` のようにメソッド呼び出しとプロパティアクセスをチェーンさせることができます。

> `TodoRepositoryTest` テストクラスにさらにテストを追加して、追加の機能をカバーすることもできます。完全なソースコードは、サンプルプロジェクトの [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/blob/main/complete/src/test/java/org/jetbrains/kotlin/junit/TodoRepositoryTest.kt) モジュールで確認できます。
>
{style="tip"}

## テストの実行 {id="run-tests"}

JavaとKotlinの両方のテストを実行して、プロジェクトが期待どおりに動作することを確認します：

1. ガターアイコンを使用してテストを実行します：

   ![テストの実行](run-test.png)

   コマンドラインを使用して、`initial` ディレクトリからすべてのプロジェクトテストを実行することもできます：

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

2. 変数の値のいずれかを変更して、テストが正しく動作することを確認します。たとえば、`shouldAddItem` テストを変更して、誤ったリポジトリサイズを期待するようにします：

   ```kotlin
   @Test
   @DisplayName("Should add item to repository")
   fun shouldAddItem() {
       repository.add(testItem1)

       Assertions.assertEquals(2, repository.size())  // 1 から 2 に変更
       Assertions.assertTrue(repository.all.contains(testItem1))
   }
   ```

3. テストを再度実行し、失敗することを確認します：

   ![テスト結果の確認。テストは失敗](test-failed.png)

> テストが含まれる完全に設定されたプロジェクトは、サンプルプロジェクトの [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) モジュールにあります。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

* [Mavenを使用したKotlinプロジェクトのテスト](jvm-test-maven.md)について詳しく学びます。
* [Kotlinバックエンド開発のFAQ](jvm-backend-faq.md)でよくある質問の回答を確認します。