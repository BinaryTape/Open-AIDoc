[//]: # (title: データ構造のテスト方法)
[//]: # (description: Lincheck を使用して並行データ構造をテストする方法を学びます。テストをセットアップし、テストプロセスの内部を理解しましょう。)

Lincheck は、並行（concurrent）データ構造をテストするための宣言的なインターフェースを提供します。
テストの実行方法を記述する代わりに、テストが必要なすべての操作を宣言すると、Lincheck が並行実行シナリオを生成し、それを実行して結果を分析します。

この `Counter` データ構造を Lincheck でテストしてみましょう。

```kotlin
class Counter {
    var value = 0

    fun inc(): Int = ++value
    fun dec(): Int = --value
}
```

1. テストクラスを作成します。

    ```kotlin
    class CounterTest {
    }
    ```

2. 構造体のインスタンスを保持するクラスプロパティを作成します。

   ```kotlin
   private val c = Counter()
   ```

3. テストしたい操作をメンバ関数として宣言し、`@Operation` アノテーションを付けます。

    ```kotlin
    @Operation
    fun inc() = c.inc()
    
    @Operation
    fun dec() = c.dec()
    ```

    このアノテーションは、実行シナリオを生成する際にどのメソッドを含めるかを Lincheck に伝えます。

4. `ModelCheckingOptions()` または `StressOptions()` を使用して、テスト関数をメンバ関数として宣言します。これに `@Test` アノテーションを付けます。

   ```kotlin
   @Test
   fun modelCheckingTest() = ModelCheckingOptions()
       .check(this::class)
   ```

   > モデル検査（model checking）とストレス・テスト（stress testing）の違いについては、[テスト戦略](lincheck-testing-strategies.md)の記事で詳しく学べます。
   >
   {style=”tip”}

5. テストを実行します。テストが失敗した場合、Lincheck は不正確な動作を招いたシナリオと実行トレース（execution trace）を含むエラーレポートを生成します。

    ```text
    = Invalid execution results =
    | -------------------- |
    | Thread 1  | Thread 2 |
    | -------------------- |
    | dec(): -1 | inc(): 1 |
    | -------------------- |
    ```

## テストプロセス

データ構造をテストするとき、Lincheck は実行シナリオのリストを生成し、それらを実行して結果を分析します。

この `Counter` データ構造を考えてみましょう。

![2つのメソッド `inc()` と `dec()` を持つ `Counter` データ構造の図](counter_structure.svg){width=150}

これをテストするために、Lincheck は以下の手順を実行します。

1. 宣言された操作を異なるスレッドにランダムに配置することで、ランダムな実行シナリオのリストを生成します。

   ![4つの実行シナリオの図。各シナリオでは、2つのスレッドに操作が異なる順序で配置されている。](execution_scenarios.svg){width=400}

   Lincheck が提供する[設定オプション](lincheck-testing-strategies-options.md#scenario-generation)を使用して、スレッド数やスレッドあたりの操作数を指定できます。

2. 指定されたテスト戦略（[モデル検査またはストレス・テスト](lincheck-testing-strategies.md)）を使用して、生成されたシナリオを実行します。生成された各シナリオは、異なる実行スケジュールを調査するために複数回実行されます。

   ![4つの実行スケジュールの図。すべてのスケジュールは単一の実行シナリオに対応している。各スケジュールでは、操作が異なるタイミングで互いに割り込んでいる。](execution_schedules.svg){width=400}

3. 実行結果を正確性のプロパティ（correctness property）に照らして検証します。デフォルトでは、[線形化可能性（linearizability）](https://en.wikipedia.org/wiki/Linearizability)が使用されます。

   ![検証プロセスの図。1つの実行スケジュールの結果が、同じ操作を順次実行した際の結果と比較されている。](verification.svg){width=300}

   このステップでは、[検証関数（validation function）](lincheck-results-validation.md)が提供されている場合、Lincheck は構造の検証も行うことができます。

## 例：Treiber スタック構造の実装をテストする

以下の *不正確な* [Treiber スタック](https://en.wikipedia.org/wiki/Treiber_stack)の実装を考えてみましょう。

```kotlin
import org.jetbrains.lincheck.*
import org.jetbrains.lincheck.annotations.*
import org.jetbrains.lincheck.strategy.managed.modelchecking.*
import java.util.concurrent.atomic.AtomicReference
import kotlin.test.*

class TreiberStack<E> {
    private val top = AtomicReference<Node<E>?>(null)

    fun push(item: E) {
        val newHead = Node(item)
        var oldHead: Node<E>?

        do {
            oldHead = top.get()
            newHead.next = oldHead
        } while (!top.compareAndSet(oldHead, newHead))
    }

    fun pop(): E? {
        val oldHead = top.get()

        if (oldHead == null) {
            return null
        }

        val newHead = oldHead.next
        top.compareAndSet(oldHead, newHead)

        // バグ: pop() の実行が終了するまでに、
        // 別のスレッドがすでにこのアイテムをポップしている可能性があります。
        return oldHead.item
    }

    private class Node<E>(
        val item: E,
        var next: Node<E>? = null
    )
}
```

Lincheck を使用してこの構造をテストし、注入されたバグがプログラムの動作にどのように影響するかを確認できます。

1. テスト構造を作成します。

    ```kotlin
   class TreiberStackTest {
       private val stack = TreiberStack<Int>()
  
       @Operation
       fun push(value: Int) = stack.push(value)
  
       @Operation
       fun pop(): Int? = stack.pop()
  
       @Test
       fun modelCheckingTest() = ModelCheckingOptions()
           .check(this::class)
   }
   ```

2. テストを実行します。Lincheck はエラーレポートを生成し、不正確な動作の原因となる実行シナリオを提供します。

   ```text
   | ------------------------------ |
   |   Thread 1    |    Thread 2    |
   | ------------------------------ |
   | push(1): void |                |
   | ------------------------------ |
   | pop(): 1      | push(-1): void |
   | ------------------------------ |
   | pop(): -1     |                |
   | pop(): 1      |                |
   | ------------------------------ |
   ```

   この図は、操作が異なるスレッドにどのように配置されているかと、操作の戻り値を示しています。Lincheck は、不正確な結果を招く具体的なスレッドのインターリービング（割り込みの順序）も提供します。

   ```text
   | ----------------------------------------------------- |
   |                  Thread 1                  | Thread 2 |
   | ----------------------------------------------------- |
   | push(1)                                    |          |
   | ----------------------------------------------------- |
   | pop(): 1                                   |          |
   |   stack.pop(): 1                           |          |
   |     top.get(): Node#1                      |          |
   |     switch                                 |          |
   |                                            | push(-1) |
   |     oldHead.getNext(): null                |          |
   |     top.compareAndSet(Node#1, null): false |          |
   |     oldHead.getItem(): 1                   |          |
   |   result: 1                                |          |
   | ----------------------------------------------------- |
   | pop(): -1                                  |          |
   | pop(): 1                                   |          |
   | ----------------------------------------------------- |
   ```

   この実装では、別のスレッドが `pop()` 関数を中断することを考慮していないため、`pop()` が `1` を2回返していますが、これは本来あり得ない動作です。

3. データ構造を修正します。正しい実装では、結果を返す前に `oldHead` 変数を最新の値に更新します。

   ```kotlin
   fun pop(): E? {
       var oldHead: Node<E>?
       var newHead: Node<E>?
 
       do {
           oldHead = top.get()
           if (oldHead == null) return null
           newHead = oldHead.next
       } while (!top.compareAndSet(oldHead, newHead))
 
       return oldHead.item
   }
   ```

## 次のステップ

Lincheck で利用可能な[テスト戦略](lincheck-testing-strategies.md)について学びましょう。

## 関連項目

* [操作引数の生成](lincheck-argument-generation-constraints.md)
* [操作実行オプションの設定](lincheck-operation-execution-options.md)
* [ノンブロッキングの進捗保証のチェック](lincheck-progress-guarantees.md)
* [アルゴリズムの順次仕様の定義](lincheck-results-validation.md)