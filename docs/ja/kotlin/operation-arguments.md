[//]: # (title: オペレーション引数)

このチュートリアルでは、オペレーション引数を設定する方法を学びます。

以下のシンプルな `MultiMap` の実装を考えてみましょう。これは `ConcurrentHashMap` に基づいており、内部的に値のリストを保持しています。

```kotlin
import java.util.concurrent.*

class MultiMap<K, V> {
    private val map = ConcurrentHashMap<K, List<V>>()
   
    // 指定されたキーに関連付けられた
    // 値のリストを保持します。
    fun add(key: K, value: V) {
        val list = map[key]
        if (list == null) {
            map[key] = listOf(value)
        } else {
            map[key] = list + value
        }
    }

    fun get(key: K): `List<V>` = map[key] ?: emptyList()
}
```

この `MultiMap` の実装は線形化可能（linearizable）でしょうか？もしそうでない場合、キーの範囲を小さく設定することで、同じキーに対して並行して処理が行われる可能性が高まり、誤ったインターリーブ（interleaving）が検出されやすくなります。

このために、`key: Int` パラメータのジェネレータを設定します。

1. `@Param` アノテーションを宣言します。
2. 整数ジェネレータクラスを指定します：`@Param(gen = IntGen::class)`。
   Lincheck は、ほぼすべてのプリミティブ型と文字列に対して、ランダムなパラメータジェネレータを標準でサポートしています。
3. 文字列設定 `@Param(conf = "1:2")` を使用して、生成される値の範囲を定義します。
4. 複数のオペレーションで共有するために、パラメータ設定名（`@Param(name = "key")`）を指定します。

   以下は、`add(key, value)` と `get(key)` オペレーションのキーを `[1..2]` の範囲で生成する `MultiMap` のストレス（stress）テストです。
   
   ```kotlin
   import java.util.concurrent.*
   import org.jetbrains.lincheck.check
   import org.jetbrains.lincheck.datastructures.*
   import org.junit.*
   
   class MultiMap<K, V> {
       private val map = ConcurrentHashMap<K, List<V>>()
   
       // 指定されたキーに関連付けられた
       // 値のリストを保持します。
       fun add(key: K, value: V) {
           val list = map[key]
           if (list == null) {
               map[key] = listOf(value)
           } else {
               map[key] = list + value
           }
       }

       fun get(key: K): `List<V>` = map[key] ?: emptyList()
   }
   
   @Param(name = "key", gen = IntGen::class, conf = "1:2")
   class MultiMapTest {
       private val map = MultiMap<Int, Int>()
   
       @Operation
       fun add(@Param(name = "key") key: Int, value: Int) = map.add(key, value)
   
       @Operation
       fun get(@Param(name = "key") key: Int) = map.get(key)
   
       @Test
       fun stressTest() = StressOptions().check(this::class)
   
       @Test
       fun modelCheckingTest() = ModelCheckingOptions().check(this::class)
   }
   ```

5. `stressTest()` を実行すると、次のような出力が表示されます。

   ```text
   = Invalid execution results =
   | ---------------------------------- |
   |    Thread 1     |     Thread 2     |
   | ---------------------------------- |
   | add(2, 0): void | add(2, -1): void |
   | ---------------------------------- |
   | get(2): [0]     |                  |
   | ---------------------------------- |
   ```
   
6. 最後に、`modelCheckingTest()` を実行します。これは失敗し、次のような出力が表示されます。

   ```text
   = Invalid execution results =
   | ---------------------------------- |
   |    Thread 1     |     Thread 2     |
   | ---------------------------------- |
   | add(2, 0): void | add(2, -1): void |
   | ---------------------------------- |
   | get(2): [-1]    |                  |
   | ---------------------------------- |
   
   ---
   All operations above the horizontal line | ----- | happen before those below the line
   ---

   The following interleaving leads to the error:
   | ---------------------------------------------------------------------- |
   |    Thread 1     |                       Thread 2                       |
   | ---------------------------------------------------------------------- |
   |                 | add(2, -1)                                           |
   |                 |   add(2,-1) at MultiMapTest.add(MultiMap.kt:31)      |
   |                 |     get(2): null at MultiMap.add(MultiMap.kt:15)     |
   |                 |     switch                                           |
   | add(2, 0): void |                                                      |
   |                 |     put(2,[-1]): [0] at MultiMap.add(MultiMap.kt:17) |
   |                 |   result: void                                       |
   | ---------------------------------------------------------------------- |
   ```

キーの範囲を小さくしたことで、Lincheck はすぐにレース（競合状態）を明らかにします。同じキーに対して 2 つの値が同時に追加されると、一方の値が上書きされて失われる可能性があります。

## 次のステップ

シングルプロデューサー・シングルコンシューマー・キューのように、[実行に対するアクセス制約](constraints.md)を設定するデータ構造をテストする方法を学びましょう。