[//]: # (title: ビルダー型推論を使用したビルダーの使用)

Kotlinは「ビルダー型推論（builder type inference）」、または「ビルダー推論」をサポートしています。これはジェネリックなビルダーを使用する際に非常に役立ちます。ビルダー推論を使用すると、コンパイラはビルダーのラムダ引数内にある他の呼び出しの型情報に基づいて、ビルダー呼び出しの型引数を推論できるようになります。

[`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html) を使用した以下の例を考えてみましょう。

```kotlin
fun addEntryToMap(baseMap: Map<String, Number>, additionalEntry: Pair<String, Int>?) {
   val myMap = buildMap {
       putAll(baseMap)
       if (additionalEntry != null) {
           put(additionalEntry.first, additionalEntry.second)
       }
   }
}
```

ここでは、通常のやり方で型引数を推論するには型情報が不足していますが、ビルダー推論はラムダ引数内の呼び出しを分析できます。`putAll()` および `put()` 呼び出しの型情報に基づき、コンパイラは `buildMap()` 呼び出しの型引数が `String` と `Number` であると自動的に推論できます。ビルダー推論により、ジェネリックなビルダーを使用する際に型引数を省略できるようになります。

## 独自のビルダーを作成する

### ビルダー推論を有効にするための要件

> Kotlin 1.7.0より前は、ビルダー関数でビルダー推論を有効にするには、`-Xenable-builder-inference` コンパイラオプションが必要でした。1.7.0からは、このオプションはデフォルトで有効になっています。
>
{style="note"}

独自のビルダーでビルダー推論を機能させるには、その宣言に「レシーバー付き関数型」のビルダーラムダパラメータが含まれていることを確認してください。また、レシーバー型には2つの要件があります。

1. ビルダー推論が推論すべき型引数を使用していること。例：
   ```kotlin
   fun <V> buildList(builder: MutableList<V>.() -> Unit) { ... }
   ```
   
   > `fun <T> myBuilder(builder: T.() -> Unit)` のように、型パラメータの型を直接渡すことはまだサポートされていないことに注意してください。
   > 
   {style="note"}

2. シグネチャに対応する型パラメータを含む、公開された（public）メンバーまたは拡張機能を提供していること。
   例：
   ```kotlin
   class ItemHolder<T> {
       private val items = mutableListOf<T>()

       fun addItem(x: T) {
           items.add(x)
       }

       fun getLastItem(): T? = items.lastOrNull()
   }
   
   fun <T> ItemHolder<T>.addAllItems(xs: List<T>) {
       xs.forEach { addItem(it) }
   }

   fun <T> itemHolderBuilder(builder: ItemHolder<T>.() -> Unit): ItemHolder<T> = 
       ItemHolder<T>().apply(builder)

   fun test(s: String) {
       val itemHolder1 = itemHolderBuilder { // itemHolder1 の型は ItemHolder<String>
           addItem(s)
       }
       val itemHolder2 = itemHolderBuilder { // itemHolder2 の型は ItemHolder<String>
           addAllItems(listOf(s)) 
       }
       val itemHolder3 = itemHolderBuilder { // itemHolder3 の型は ItemHolder<String?>
           val lastItem: String? = getLastItem()
           // ...
       }
   }
   ```

### サポートされている機能

ビルダー推論は以下の機能をサポートしています： 
* 複数の型引数の推論
  ```kotlin
  fun <K, V> myBuilder(builder: MutableMap<K, V>.() -> Unit): Map<K, V> { ... }
  ```
* 1つの呼び出し内にある複数のビルダーラムダ（相互に依存するものを含む）の型引数の推論
  ```kotlin
  fun <K, V> myBuilder(
      listBuilder: MutableList<V>.() -> Unit,
      mapBuilder: MutableMap<K, V>.() -> Unit
  ): Pair<List<V>, Map<K, V>> =
      mutableListOf<V>().apply(listBuilder) to mutableMapOf<K, V>().apply(mapBuilder)
  
  fun main() {
      val result = myBuilder(
          { add(1) },
          { put("key", 2) }
      )
      // result は Pair<List<Int>, Map<String, Int>> 型になります
  }
  ```
* 型パラメータがラムダのパラメータ型または戻り値の型である型引数の推論
  ```kotlin
  fun <K, V> myBuilder1(
      mapBuilder: MutableMap<K, V>.() -> K
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder() }
  
  fun <K, V> myBuilder2(
      mapBuilder: MutableMap<K, V>.(K) -> Unit
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder(2 as K) }
  
  fun main() {
      // result1 は Map<Long, String> 型と推論されます
      val result1 = myBuilder1 {
          put(1L, "value")
          2
      }
      val result2 = myBuilder2 {
          put(1, "value 1")
          // `it` を「遅延型変数」の型として使用できます
          // 詳細は以下のセクションを参照してください
          put(it, "value 2")
      }
  }
  ```

## ビルダー推論の仕組み

### 遅延型変数（Postponed type variables）

ビルダー推論は、ビルダー推論の分析中にビルダーラムダ内に現れる「遅延型変数（postponed type variables）」に基づいて動作します。遅延型変数とは、推論の過程にある型引数の型のことです。コンパイラはこれを使用して、型引数に関する型情報を収集します。

[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) を使用した例を考えてみましょう：

```kotlin
val result = buildList {
    val x = get(0)
}
```

ここで `x` は遅延型変数の型を持っています。`get()` 呼び出しは `E` 型の値を返しますが、`E` 自体はまだ確定（fixed）していません。現時点では、`E` の具体的な型は不明です。

遅延型変数の値が具体的な型に関連付けられると、ビルダー推論はこの情報を収集し、ビルダー推論分析の最後に、対応する型引数の最終的な型を推論します。例えば：

```kotlin
val result = buildList {
    val x = get(0)
    val y: String = x
} // result は List<String> 型と推論されます
```

遅延型変数が `String` 型の変数に代入された後、ビルダー推論は `x` が `String` のサブタイプであるという情報を得ます。この代入がビルダーラムダ内の最後のステートメントであるため、ビルダー推論分析は型引数 `E` を `String` に推論して終了します。

遅延型変数をレシーバーとして、常に `equals()`、`hashCode()`、および `toString()` 関数を呼び出すことができる点に注意してください。

### ビルダー推論の結果への寄与

ビルダー推論は、分析結果に寄与するさまざまな種類の型情報を収集できます。以下を考慮します：
* ラムダのレシーバーに対して、型パラメータ의型を使用するメソッドを呼び出す
  ```kotlin
  val result = buildList {
      // 渡された "value" 引数に基づいて、型引数は String と推論される
      add("value")
  } // result は List<String> 型と推論される
  ```
* 型パラメータの型を返す呼び出しに対して、期待される型を指定する
  ```kotlin
  val result = buildList {
      // 期待される型に基づいて、型引数は Float と推論される
      val x: Float = get(0)
  } // result は List<Float> 型になる
  ```
  ```kotlin
  class Foo<T> {
      val items = mutableListOf<T>()
  }

  fun <K> myBuilder(builder: Foo<K>.() -> Unit): Foo<K> = Foo<K>().apply(builder)

  fun main() {
      val result = myBuilder {
          val x: List<CharSequence> = items
          // ...
      } // result は Foo<CharSequence> 型になる
  }
  ```
* 具体的な型を期待するメソッドに、遅延型変数の型を渡す
  ```kotlin
  fun takeMyLong(x: Long) { ... }

  fun String.isMoreThan3() = length > 3

  fun takeListOfStrings(x: List<String>) { ... }

  fun main() {
      val result1 = buildList {
          val x = get(0)
          takeMyLong(x)
      } // result1 は List<Long> 型になる

      val result2 = buildList {
          val x = get(0)
          val isLong = x.isMoreThan3()
      // ...
      } // result2 は List<String> 型になる
  
      val result3 = buildList {
          takeListOfStrings(this)
      } // result3 は List<String> 型になる
  }
  ```
* ラムダレシーバーのメンバーへの呼び出し可能参照（callable reference）を取得する
  ```kotlin
  fun main() {
      val result = buildList {
          val x: KFunction1<Int, Float> = ::get
      } // result は List<Float> 型になる
  }
  ```
  ```kotlin
  fun takeFunction(x: KFunction1<Int, Float>) { ... }

  fun main() {
      val result = buildList {
          takeFunction(::get)
      } // result は List<Float> 型になる
  }
  ```

分析の最後に、ビルダー推論は収集されたすべての型情報を考慮し、それらを最終的な型にマージしようとします。以下の例を参照してください。

```kotlin
val result = buildList { // 遅延型変数 E を推論
    // E が Number または Number のサブタイプであると考慮
    val n: Number? = getOrNull(0)
    // E が Int または Int のスーパータイプであると考慮
    add(1)
    // E は Int と推論される
} // result は List<Int> 型になる
```

最終的な型は、分析中に収集された型情報に対応する、最も具体的な型（most specific type）になります。提供された型情報が矛盾しておりマージできない場合、コンパイラはエラーを報告します。

Kotlinコンパイラは、通常の型推論で型引数を推論できない場合にのみビルダー推論を使用することに注意してください。つまり、ビルダーラムダの外側で型情報を提供すれば、ビルダー推論による分析は必要ありません。以下の例を考えてみましょう。

```kotlin
fun someMap() = mutableMapOf<CharSequence, String>()

fun <E> MutableMap<E, String>.f(x: MutableMap<E, String>) { ... }

fun main() {
    val x: Map<in String, String> = buildMap {
        put("", "")
        f(someMap()) // 型の不一致（String が必要だが CharSequence が見つかった）
    }
}
```

ここでは、マップの期待される型がビルダーラムダの外側で指定されているため、型の不一致が発生します。コンパイラは、レシーバー型を `Map<in String, String>` に固定して、内部のすべてのステートメントを分析します。