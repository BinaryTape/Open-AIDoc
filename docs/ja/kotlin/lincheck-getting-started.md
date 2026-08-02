[//]: # (title: Lincheck 入門)
[//]: # (description: このクイックスタートでは、Lincheck のセットアップ、最初の Lincheck テストの記述、およびテストレポートの解釈について説明します。)

このクイックスタートでは、Lincheck のセットアップ、最初の Lincheck テストの記述、およびテストレポートの解釈について説明します。

以下の内容を学習します：
* IntelliJ IDEA プロジェクトを新規作成し、Lincheck をインストールする。
* 最初の並行テストを記述し、Lincheck で実行する。
* 並行データ構造を作成し、2 つのテスト戦略を使用して Lincheck でテストする。

## プロジェクトの作成

IntelliJ IDEA で既存の Kotlin プロジェクトを開くか、[新しく作成](https://kotlinlang.org/docs/jvm-get-started.html)してください。

## 依存関係の追加

プロジェクトで Lincheck を使用するには、ビルド設定に対応する依存関係を追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.jetbrains.lincheck:lincheck:%lincheckVersion%")
    testImplementation(kotlin("test"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    testImplementation "org.jetbrains.lincheck:lincheck:%lincheckVersion%"
    testImplementation "org.jetbrains.kotlin:kotlin-test"
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
         <dependency>
             <groupId>org.jetbrains.lincheck</groupId>
             <artifactId>lincheck</artifactId>
             <version>%lincheckVersion%</version>
             <scope>test</scope>
         </dependency>
         <dependency>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-test</artifactId>
             <scope>test</scope>
         </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 最初のテストの記述

基本的な並行テストでは、各スレッドで実行すべき操作と期待されるアサーションを記述するテスト関数を作成します。Lincheck は[モデル検査 (model checking)](lincheck-testing-strategies.md#model-checking) を使用してプログラムの考えられるスレッド・インターリービングを探索し、不正な動作が発生した場合にはエラーレポートを提供します。

1. `src/test` ディレクトリに `CounterTest.kt` ファイルを作成します。
2. `org.jetbrains.lincheck`、`kotlinx.concurrent`、および `kotlin.test` ライブラリをインポートします： 
    
    ```kotlin
    import org.jetbrains.lincheck.*
    import kotlin.concurrent.*
    import kotlin.test.*
    ```

3. 変数を作成し、その変数を操作する 2 つのスレッドを持つテストを記述します：

    ```kotlin
    class CounterTest {
        @Test // テスト関数の宣言
        fun test() = Lincheck.runConcurrentTest {
            var counter = 0

            // 並行してカウンタをインクリメントします
            val t1 = thread { counter++ }
            val t2 = thread { counter++ }

            // スレッドの終了を待ちます
            t1.join()
            t2.join()

            // 両方のインクリメントが適用されたことを確認します
            assertEquals(2, counter)
        }
    }
    ```

4. テストを実行します。Lincheck は、不正な動作につながったスレッド・インターリービングを含むレポートを生成します：

    > [Lincheck プラグイン](https://plugins.jetbrains.com/plugin/24171-lincheck)をインストールして、エラートレースを視覚化しましょう。
    > 
    {style="note"}
   
    ```text
    | ------------------------------------------------------------------------------- |
    |                   Main Thread                   |   Thread 1    |   Thread 2    |
    | ------------------------------------------------------------------------------- |
    | thread(block = Lambda#2): Thread#1              |               |               |
    | thread(block = Lambda#3): Thread#2              |               |               |
    | switch (reason: waiting for Thread 1 to finish) |               |               |
    |                                                 |               | run()         |
    |                                                 |               |   counter ➜ 0 |
    |                                                 |               |   switch      |
    |                                                 | run()         |               |
    |                                                 |   counter ➜ 0 |               |
    |                                                 |   counter = 1 |               |
    |                                                 |               |   counter = 1 |
    | Thread#1.join()                                 |               |               |
    | Thread#2.join()                                 |               |               |
    | counter.element ➜ 1                             |               |               |
    | assertEquals(2, 1): threw AssertionFailedError  |               |               |
    | ------------------------------------------------------------------------------- |
    ```

    Lincheck は、一方の `inc()` 操作が `counter` の値を上書きしてしまうスレッド・インターリービングを発見しました。
    <deflist collapsible="true">
        <def title="レポートの段階的な説明" default-state="collapsed">
        <list type="decimal">
            <li> スレッド 2 において、JVM が初期の <code>counter</code> 値を読み取ります。</li>
            <li> 実行がスレッド 2 からスレッド 1 に切り替わります。</li>
            <li> スレッド 1 において、JVM がカウンタをインクリメントします。<code>inc()</code> 操作のすべてのステップ（変数からの値の読み取り、値のインクリメント、変数への値の書き戻し）が中断されることなく実行されます。</li>
            <li> 実行がスレッド 2 に戻ります。</li>
            <li> スレッド 2 において、JVM はステップ 1 で取得した値をインクリメントし、その結果を <code>counter</code> 変数に書き込みます。</li>
            </list>
            </def>
    </deflist>

## データ構造のテストの記述

基本的な並行テストに加えて、Lincheck は並行データ構造をテストするための[宣言的アプローチ (declarative approach)](lincheck-how-to-test-data-structures.md) をサポートしています。

Lincheck でデータ構造をテストするには、構造の並行メソッドとテスト関数を宣言するだけです。Lincheck はランダムな並行シナリオを生成し、指定されたテスト戦略を使用してそれらを実行し、エラーレポートを提供します。

このセクションでは、単純なカウンタをテストします：

1. `src/test` ディレクトリに `CounterStructureTest.kt` ファイルを作成します。
2. `lincheck.datastructures` および `kotlin.test` ライブラリをインポートします：

    ```kotlin
    import org.jetbrains.lincheck.datastructures.*
    import kotlin.test.*
    ```

3. `Counter` 構造を作成します：

    ```kotlin
    class Counter {
        @Volatile
        private var value = 0
    
        fun inc(): Int = ++value
        fun get() = value
    }
    ```
   
4. `CounterStructureTest` クラスを作成します。構造の初期状態を設定し、構造の並行操作に `@Operation` アノテーションを付けます：

    ```kotlin
    class CounterStructureTest {
        // 初期状態
        private val c = Counter()
    
        // 並行操作
        @Operation
        fun inc() = c.inc()
    
        @Operation
        fun get() = c.get()
    }
    ```
   
5. `CounterTest` クラスで、`ModelCheckingOptions()` を使用してテスト関数を宣言します：
    
    ```kotlin
    @Test
    fun stressTest() = ModelCheckingOptions().check(this::class)
    ```
   
    > モデル検査の仕組みについては、[テスト戦略](lincheck-testing-strategies.md#model-checking)の記事で詳しく学んでください。
    > 
    {style=”tip”}

6. テストを実行します。Lincheck は、並行シナリオと、不正な動作につながった特定のスレッド・インターリービングを含むエラーレポートを生成します：
    
    ```text
    | ------------------- |
    | Thread 1 | Thread 2 |
    | ------------------- |
    | inc(): 1 | inc(): 1 |
    | ------------------- |
    ```

    ```text
    | ------------------------ |
    | Thread 1 |   Thread 2    |
    | ------------------------ |
    |          | inc(): 1      |
    |          |   c.inc(): 1  |
    |          |     value ➜ 0 |
    |          |     switch    |
    | inc(): 1 |               |
    |          |     value = 1 |
    |          |     value ➜ 1 |
    |          |   result: 1   |
    | ------------------------ |
    ```

## 次のステップ

Lincheck での[並行データ構造をテストするための宣言的アプローチ (declarative approach)](lincheck-how-to-test-data-structures.md) について詳細を学習してください。