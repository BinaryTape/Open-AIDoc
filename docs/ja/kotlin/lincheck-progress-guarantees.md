[//]: # (title: プログレス保証)
[//]: # (description: Lincheckでアルゴリズムがオブストラクション・フリー（obstruction-freedom）かどうかを確認する方法を学びます。)

多くの並行アルゴリズムは、ウェイト・フリーダム（wait-freedom）、ロック・フリーダム（lock-freedom）、またはオブストラクション・フリーダム（obstruction-freedom）などの[ノンブロッキング・プログレス保証](https://en.wikipedia.org/wiki/Non-blocking_algorithm)を提供しています。

Lincheckは、オブストラクション・フリーダムの検証のみをサポートしています。しかし、ロック・フリーやウェイト・フリーのアルゴリズムはオブストラクション・フリーでもあるため、オブストラクション・フリーダムへのいかなる違反も、それらのより強力な保証への違反を意味します。

`checkObstructionFreedom`オプションを使用して、プログラムのオブストラクション・フリーダム保証を検証します。

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .checkObstructionFreedom()
   .check(this::class)
```

> `checkObstructionFreedom`オプションは、[モデル・チェック](lincheck-testing-strategies.md#model-checking)戦略でのみ利用可能です。
>
{style="warning"}

Lincheckは、他のすべてのスレッドが一時停止しているときにスレッドが進行できるかどうかをチェックすることで、オブストラクション・フリーダムを検証します。スレッドの実行が[ループでスタック（stuck in a loop）](lincheck-testing-strategies-options.md#stalled-execution-detection)した場合、Lincheckはアクティブなロックを報告します。

特定の関数が意図的にブロッキングである場合は、[`@Operation(blocking = true)`](lincheck-operation-execution-options.md#blocking-operations)でマークすることで誤検知を防ぐことができます。

## 例: `ConcurrentHashMap` のオブストラクション・フリーダムのテスト

この例では、`ConcurrentHashMap` 構造の `put()` 関数をテストします。

1. `ConcurrentHashMapTest.kt` ファイルを作成します。
2. `ConcurrentHashMap` 構造のテストクラスを作成し、`put()` 関数を宣言します。

   ```kotlin
   class ConcurrentHashMapTest {
       private val map = ConcurrentHashMap<Int, Int>()

       @Operation
       fun put(key: Int, value: Int) = map.put(key, value)
   }
   ```

3. `checkObstructionFreedom()` オプションを有効にしたテスト関数を宣言します。

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .threads(2)
        .actorsPerThread(1)
        .check(this::class)
   ```
   
   [`threads`](lincheck-testing-strategies-options.md#scenario-generation) および [`actorsPerThread`](lincheck-testing-strategies-options.md#scenario-generation) オプションは、潜在的な実行シナリオの数を減らすために使用されます。これらのオプションはテストの合否結果を変えるものではありませんが、テスト時間を大幅に短縮します。 

4. テストを実行します。以下のレポートとともに失敗するはずです。

   ```text
   = The algorithm should be non-blocking, but an active lock is detected =
   | --------------------- |
   | Thread 1  | Thread 2  |
   | --------------------- |
   | put(1, 0) | put(1, 1) |
   | --------------------- |
   
   The following interleaving leads to the error:
   | -------------------------------------------------------------------------------------------------------------- |
   |                                          Thread 1                                          |     Thread 2      |
   | -------------------------------------------------------------------------------------------------------------- |
   | put(1, 0): <hung>                                                                          |                   |
   |   map.put(1, 0)                                                                            |                   |
   |     putVal(1, 0, false)                                                                    |                   |
   |       spread(1): 1                                                                         |                   |
   |       table ➜ null                                                                         |                   |
   |       loop(1 iterations) at ConcurrentHashMap.putVal(ConcurrentHashMap.java:1016)          |                   |
   |         <iteration 1>                                                                      |                   |
   |           initTable()                                                                      |                   |
   |             loop(1 iterations) at ConcurrentHashMap.initTable(ConcurrentHashMap.java:2293) |                   |
   |             table ➜ null                                                                   |                   |
   |             switch                                                                         |                   |
   |                                                                                            | put(1, 1): <hung> |
   | -------------------------------------------------------------------------------------------------------------- |
   ```

5. `put()` 関数のアノテーションに `blocking = true` オプションを追加します。

   ```kotlin
   @Operation(blocking = true)
   fun put(key: Int, value: Int) = map.put(key, value)
   ```

6. テストを再実行します。正常にパスするはずです。

## 例: `ConcurrentSkipListMap` のオブストラクション・フリーダムのテスト

この例では、ノンブロッキングな `ConcurrentSkipListMap` 構造の `put()` 関数をテストします。

1. `ConcurrentSkipListMapTest.kt` ファイルを作成します。
2. `ConcurrentSkipListMap` 構造のテストクラスを作成し、`put()` 関数を宣言します。

    ```kotlin
    class ConcurrentSkipListMapTest {
        private val map = ConcurrentSkipListMap<Int, Int>()
   
        @Operation
        fun put(key: Int, value: Int) = map.put(key, value)
    }
    ```

3. `checkObstructionFreedom()` オプションを有効にしたテスト関数を宣言します。

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .check(this::class)
    ```

4. テストを実行します。正常にパスするはずです。

## 関連項目

* [引数生成の制約の設定](lincheck-argument-generation-constraints.md)
* [オペレーション実行の設定](lincheck-operation-execution-options.md)
* [実行結果の検証](lincheck-results-validation.md)