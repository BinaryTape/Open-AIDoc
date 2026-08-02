[//]: # (title: 結果の検証とバリデーション)
[//]: # (description: Lincheckがどのように並行実行の結果を検証するかを学びます。)

並行データ構造向けに生成されたシナリオを実行した後、Lincheckは指定された検証モデル（例：線形化可能性（linearizability））に照らして結果を検証し、オプションでユーザー提供のバリデーション関数を使用してデータ構造の最終状態をチェックします。

## 検証 (Verification)

検証プロセス中、Lincheckは並行実行と同じ結果が得られるような、並行シナリオ内の操作のシーケンシャル（逐次）実行を見つけようと試みます。

![Lincheckにおける検証プロセスの図。Lincheckは並行実行をさまざまなシーケンシャル実行と比較します。](verification-process.svg){width=700}

[検証モデル](#検証モデル)によっては、シーケンシャルな実行に追加の制限が課される場合があります。検証プロパティに一致するシーケンシャルな実行で、観測された結果を再現できるものがない場合、Lincheckはエラーを報告します。

### シーケンシャル仕様 (Sequential specification)

デフォルトでは、検証プロセス中にLincheckは「並行」データ構造の操作を使用してシーケンシャルな実行を構築します。

一致する操作を持つシーケンシャルなデータ構造を指定することで、以下が可能になります：
* 並行データ構造がシーケンシャルなものと同じ結果を提供することを確認する。

  通常、シングルスレッドの実装はスレッドセーフな実装よりも単純であり、そのため正しさの検証がはるかに容易です（例：`HashMap` と `ConcurrentHashMap`、`LinkedList` と `ConcurrentLinkedQueue`）。

  2つのバージョンの構造体の実行結果を比較することで、より複雑な並行構造体が、シングルスレッド環境において単純な構造体と同様に動作することを確認できます。

* 1つのテストでシーケンシャルな正しさと並行性の安全性の両方を検証する。

![Lincheckにおける検証プロセスの図。Lincheckは並行実行をさまざまなシーケンシャル実行と比較します。シーケンシャル実行は、指定された構造体のシーケンシャルバージョンを使用します。](verification-process-seq.svg){width=700}

データ構造のシーケンシャルバージョンを指定するには：

1. Lincheckによってテストされるすべての並行関数のシーケンシャルバージョンを備えたデータ構造を実装します。
2. `sequentialSpecification()` オプションを使用してデータ構造を指定します。

   ```kotlin
   @Test
   fun stressTest() = StressOptions()
       .sequentialSpecification(SequentialStructure::class)
       .check(this::class)
   ```

`ConcurrentLinkedQueue` のシーケンシャル仕様としてシングルスレッドの `LinkedList` を使用するLincheckテストの例は以下の通りです：

```kotlin
class ConcurrentLinkedQueueTest {
    private val s = ConcurrentLinkedQueue<Int>()

    @Operation
    fun add(value: Int) = s.add(value)

    @Operation
    fun poll(): Int? = s.poll()

    @Test
    fun stressTest() = StressOptions()
        .sequentialSpecification(SequentialQueue::class.java)
        .check(this::class)
}

class SequentialQueue {
    private val s = LinkedList<Int>()

    fun add(x: Int) = s.add(x)
    fun poll(): Int? = s.poll()
}
```

### 検証モデル

デフォルトでは、Lincheckは線形化可能性（linearizability）モデルに対して並行実行の結果を検証します。
別の検証モデルを適用するには、`verifierClass` オプションを使用します：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .verifierClass(SerializabilityVerifier::class)
   .check(this::class)
```

Lincheckは以下の検証クラス（verifier classes）を提供しています：

* `LinearizabilityVerifier` – デフォルトのオプション。並行実行内の操作間の ["happens-before"（先行発生）](https://ja.wikipedia.org/wiki/Happened-before) 関係を維持するシーケンシャルな実行が存在する場合、その並行実行は有効です。
* `QuiescentConsistencyVerifier` – クワイエスセント整合性（quiescent consistency）モデルを使用します。これは線形化可能性モデルと同様に動作しますが、`@QuiescentConsistent` アノテーションが付けられた操作には "happens-before" 制約が適用されません。

   ```kotlin
   @Operation
   @QuiescentConsistent
   fun someOperation() = { ... }
   ```

   > `QuiescentConsistencyVerifier` は実際の [クワイエスセントポイント（quiescent points）](https://bura.brunel.ac.uk/bitstream/2438/9717/1/Fulltext.pdf) を追跡しません。そのため、検証器はクワイエスセントポイントの境界を越えて発生するバグを見逃す可能性があります。
   >
   {style="note"}

* `SerializabilityVerifier` – 直列化可能性（serializability）モデルを使用します。このモデルでは、"happens-before" 制約に関係なく、並行実行と同じ結果をもたらす「何らかの」シーケンシャルな実行（任意の順序）が存在すれば、その並行実行は有効であるとみなされます。これは、並行操作の相対的な順序が重要ではない構造体に使用できます。

#### 直列化可能性と線形化可能性の比較

2つのモデルの違いを理解するために、データ構造が直列化可能（serializable）ではあるが線形化可能（linearizable）ではない例を見てみましょう：

1. 次のようなデータ構造を考えます：

   ```kotlin
   class ConcurrentQueue {
       private val elements: MutableList<Int> = ArrayList()

       fun put(x: Int) = synchronized(this) {
           elements += x
       }

       fun poll(): Int? = synchronized(this) {
           if (elements.isEmpty()) return null
           elements.shuffle()
           elements.removeAt(0)
       }
   }
   ```

   この並行構造体は正しく動作しません。典型的なキューのように要素を保存しますが、取り出すときはランダムに返します。

2. 要素を正しく保存して返すキューのシーケンシャルバージョンを実装します：

   ```kotlin
   class SequentialQueue {
       private val elements: MutableList<Int> = ArrayList()
  
       fun put(x: Int) {
           elements += x
       }
  
       fun poll(): Int? = if (elements.isEmpty()) null else elements.removeAt(0)
   }
   ```

3. テストクラスを作成し、`put()` と `poll()` 操作を宣言します：

   ```kotlin
   @Param(name = "value", gen = IntGen::class, conf = "1:2")
   class ConcurrentQueueTest {
       private val q = ConcurrentQueue()
  
       @Operation
       fun put(@Param(name = "value") x: Int) = q.put(x)
  
       @Operation
       fun poll(): Int? = q.poll()
   }
   ```

4. 直列化可能性テストを宣言して実行します：

   ```kotlin
   @Test
   fun serializabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 直列化可能性に対して検証
       .verifier(SerializabilityVerifier::class.java)
       // 構造体のシーケンシャルバージョンを指定
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   これは成功するはずです。

5. 線形化可能性テストを宣言して実行します：

   ```kotlin
   @Test
   fun linearizabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 失敗したフルシナリオを表示
       .minimizeFailedScenario(false)
       // 構造体のシーケンシャルバージョンを指定
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   テストは次のレポートを出して失敗するはずです：

   ```text
   | -------------------- |
   | Thread 1  | Thread 2 |
   | -------------------- |
   |           | put(2)   |
   |           | put(1)   |
   | put(3)    |          |
   | poll(): 1 |          |
   | -------------------- |
   ```

6. 結果を分析します。

   直列化可能性テストが合格した理由は、`poll(): 1` を生成する `SequentialQueue` 操作の「何らかの」シーケンシャルな順序が存在するためです。例えば：

   ![2スレッドシナリオの操作を、シングルスレッドシナリオに並べ替えるアニメーション。スレッド2が最初に実行され、`put(2)`、次に `put(1)` の2つの操作があります。スレッド1が2番目に実行され、`put(3)`、次に `poll(): 1` の2つの操作があります。シングルスレッドシナリオでは、操作は `put(1)`、`put(2)`、`put(3)`、`poll(): 1` の順序になります。`put(1)` が最初の操作になったため、`poll()` は正しく値 `1` を返します。](reorder.gif){width=500}

   しかし、線形化可能性は操作順序をさらに制限します。並行実行において操作 `A` が操作 `B` の開始前に終了した場合、シーケンシャル実行でも `A` は `B` より前に実行されなければなりません。線形化可能な実行の例は以下のようになります：

   ![2スレッドシナリオの操作を、シングルスレッドシナリオに並べ替えるアニメーション。スレッド1が最初に実行され、`put(1)`、次に `put(2)` の2つの操作があります。スレッド2が2番目に実行され、`poll(): 1`、次に `poll(): 2` の2つの操作があります。シングルスレッドシナリオでは、操作は `put(1)`、`put(2)`、`poll(): 1`、`poll(): 2` の順序になります。すべての `poll()` 操作は正しい値を返します。](reorderLin.gif){width=500}

   Lincheckは検証中に `put()` 操作を並べ替えることができないため（元の実行順序の制約があるため）、線形化可能性の制限に準拠したシーケンシャルな実行を見つけることができません。その結果、テストは失敗します。

## バリデーション (Validation)

デフォルトでは、Lincheckは生成されたシナリオの実行後に、並行データ構造の状態を検証しません。
最終状態をチェックするには、テストクラス内のバリデーション関数に `@Validate` アノテーションを使用します：

```kotlin
@Validate
fun validate() {
    // データ構造の何らかのプロパティをチェック
    // 不変条件が違反されている場合は例外をスロー
    check(size >= 0) { "Size must be non-negative, but was $size" }
}
```

バリデーション関数は以下の条件を満たす必要があります：
* 引数を受け取らない。
* データ構造が無効な状態にある場合に例外をスローする。

## 次のステップ

* [引数生成制約の設定](lincheck-argument-generation-constraints.md)
* [操作実行の設定](lincheck-operation-execution-options.md)
* [非ブロック進行保証のチェック](lincheck-progress-guarantees.md)