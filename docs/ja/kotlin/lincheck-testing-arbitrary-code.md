[//]: # (title: 任意のコードのテスト)
[//]: # (description: Lincheck の `runConcurrentTest()` 関数を使用して、あらゆる並行処理コードをテストする方法を学びます。)

Lincheck は、任意の並行処理（concurrent）コードをテストするための `runConcurrentTest()` 関数を提供しています。

`runConcurrentTest()` 関数は、並行処理コードのブロックを複数回実行し、モデル検査（model checking）を使用して潜在的な実行スケジュールを探索します。

Lincheck で並行処理コードをテストするには：

1. テストクラスを作成します。

   ```kotlin
   class NewConcurrentTest {
       // テスト
   }
   ```

2. `runConcurrentTest()` を使用して、メンバー関数としてテスト関数を作成します。

   ```kotlin
   @Test
   fun test() = runConcurrentTest(100_000) {
       // 並行処理コード
   }
   ```

> 関数のパラメータは任意です。これは探索する実行スケジュールの数を指定します。
> デフォルト値は `10_000` です。
>
{style="tip"}

3. テストを実行します。テストが失敗した場合、Lincheck は不正な動作につながる実行スケジュールを含むレポートを生成します。

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

## 例: ConcurrentHashMap 関数のテスト

`ConcurrentHashMap` 関数の以下のテストについて考えてみましょう。

```kotlin
import org.jetbrains.lincheck.*
import java.util.concurrent.*
import kotlin.concurrent.*
import kotlin.test.*

// このテストは、2つのスレッドが逆の順序でネストされた `computeIfAbsent`
// 呼び出しを実行することによって発生するデッドロックを示しています。
class ConcurrentHashMapDeadlock {
   @Test
   fun test() = Lincheck.runConcurrentTest {
       val map = ConcurrentHashMap<String, String>()
       // `key1` をロックしながら `key2` を更新します。
       val thread1 = thread {
           map.computeIfAbsent("key1") {
               map.computeIfAbsent("key2") { "value2" }
               "value1"
           }
       }
       // `key2` をロックしながら `key1` を更新します。
       val thread2 = thread {
           map.computeIfAbsent("key2") {
               map.computeIfAbsent("key1") { "value1" }
               "value2"
           }
       }
      
       // 両方のスレッドが完了するまで待機します。
       thread1.join()
       thread2.join()
   }
}
```

Lincheck がデッドロックにつながる実行スケジュールを発見したため、テストは失敗します。

1. スレッド 2 が `key2` をインデックス 1 のバケット（bucket）にマッピングし、このバケットにロックをかけ、`computeIfAbsent("key1")` の実行を開始します。スレッド 2 が `key1` をマッピングして `key1` のバケットをロックする**前**に、実行がスレッド 2 からスレッド 1 に切り替わります。
2. スレッド 1 が `key1` をインデックス 0 のバケットにマッピングし、このバケットにロックをかけ、`computeIfAbsent("key2")` の実行を開始します。スレッド 1 は `key2` をインデックス 1 のバケットにマッピングし、そのバケットをロックしようとしますが、すでにスレッド 2 によってロックされています。実行がスレッド 1 からスレッド 2 に切り替わります。
3. スレッド 2 が `key1` のバケットをロックしようとしますが、すでにスレッド 1 によってロックされています。

両方のスレッドがロックされているため、実行はデッドロックに陥りました。

![失敗したテストの Lincheck レポートのスクリーンショット。](concurrenthashmapdeadlock.png){thumbnail="true" width=700}

## 次のステップ

[Lincheck を使用したデータ構造のテスト](lincheck-how-to-test-data-structures.md)の方法を学びましょう。

<!-- TODO: uncomment after the articles are published
## See also

* [Model checking in Lincheck](lincheck-model-checking.md)
* [Lincheck in Kotlin Multiplatform projects](lincheck-kmp.md)
-->