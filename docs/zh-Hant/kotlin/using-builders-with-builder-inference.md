[//]: # (title: 使用產生器型別推論搭配產生器)

Kotlin 支援 *產生器型別推論*（或稱 builder inference），這在處理泛型產生器時非常有用。它能幫助編譯器根據其 Lambda 引數內其他呼叫的型別資訊，推論出產生器呼叫的型別引數。

考慮以下 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html) 的使用範例：

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

這裡沒有足夠的型別資訊以一般方式推論型別引數，但產生器型別推論可以分析 Lambda 引數內部的呼叫。根據 `putAll()` 與 `put()` 呼叫的型別資訊，編譯器可以自動將 `buildMap()` 呼叫的型別引數推論為 `String` 與 `Number`。產生器型別推論允許在使用泛型產生器時省略型別引數。

## 撰寫您自己的產生器

### 啟用產生器型別推論的需求

> 在 Kotlin 1.7.0 之前，為產生器函式啟用產生器型別推論需要使用 `-Xenable-builder-inference` 編譯器選項。在 1.7.0 中，此選項預設為啟用。
>
{style="note"}

若要讓產生器型別推論適用於您自己的產生器，請確保其宣告具有一個帶有接收者的函式型別的產生器 Lambda 參數。對於接收者型別還有兩個要求：

1. 它應該使用產生器型別推論預計要推論的型別引數。例如：
   ```kotlin
   fun <V> buildList(builder: MutableList<V>.() -> Unit) { ... }
   ```
   
   > 請注意，目前尚不支援直接傳遞型別參數的型別，例如 `fun <T> myBuilder(builder: T.() -> Unit)`。
   > 
   {style="note"}

2. 它應該提供在其簽章中包含對應型別參數的公開成員或擴充。例如：
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
       val itemHolder1 = itemHolderBuilder { // itemHolder1 的型別為 ItemHolder<String>
           addItem(s)
       }
       val itemHolder2 = itemHolderBuilder { // itemHolder2 的型別為 ItemHolder<String>
           addAllItems(listOf(s)) 
       }
       val itemHolder3 = itemHolderBuilder { // itemHolder3 的型別為 ItemHolder<String?>
           val lastItem: String? = getLastItem()
           // ...
       }
   }
   ```

### 支援的特性

產生器型別推論支援： 
* 推論多個型別引數
  ```kotlin
  fun <K, V> myBuilder(builder: MutableMap<K, V>.() -> Unit): Map<K, V> { ... }
  ```
* 在單次呼叫中推論多個產生器 Lambda 的型別引數，包括相互依賴的 Lambda
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
      // result 的型別為 Pair<List<Int>, Map<String, Int>>
  }
  ```
* 推論型別參數作為 Lambda 的參數或傳回型別的型別引數
  ```kotlin
  fun <K, V> myBuilder1(
      mapBuilder: MutableMap<K, V>.() -> K
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder() }
  
  fun <K, V> myBuilder2(
      mapBuilder: MutableMap<K, V>.(K) -> Unit
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder(2 as K) }
  
  fun main() {
      // result1 推論出 Map<Long, String> 型別
      val result1 = myBuilder1 {
          put(1L, "value")
          2
      }
      val result2 = myBuilder2 {
          put(1, "value 1")
          // 您可以使用 `it` 作為「延遲型別變數」型別
          // 詳情請參閱下方章節
          put(it, "value 2")
      }
  }
  ```

## 產生器型別推論的運作方式

### 延遲型別變數

產生器型別推論是以 *延遲型別變數*（postponed type variables）的方式運作，這些變數在產生器型別推論分析期間出現在產生器 Lambda 內部。延遲型別變數是正在推論過程中的型別引數型別。編譯器使用它來收集有關該型別引數的型別資訊。

考慮使用 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 的範例：

```kotlin
val result = buildList {
    val x = get(0)
}
```

這裡 `x` 具有延遲型別變數的型別：`get()` 呼叫傳回一個 `E` 型別的值，但 `E` 本身尚未確定。此時，`E` 的具體型別仍是未知的。

當延遲型別變數的值與具體型別相關聯時，產生器型別推論會收集此資訊，以便在產生器型別推論分析結束時推論出對應型別引數的最終型別。例如：

```kotlin
val result = buildList {
    val x = get(0)
    val y: String = x
} // result 推論出 List<String> 型別
```

在延遲型別變數被指派給 `String` 型別的變數後，產生器型別推論會獲得 `x` 是 `String` 的子型別的資訊。此指派是產生器 Lambda 中的最後一個陳述式，因此產生器型別推論分析結束，並將型別引數 `E` 推論為 `String`。

請注意，您始終可以呼叫 `equals()`、`hashCode()` 與 `toString()` 函式，並使用延遲型別變數作為接收者。

### 貢獻至產生器型別推論結果

產生器型別推論可以收集多種有助於分析結果的型別資訊。它會考慮：
* 在 Lambda 接收者上呼叫使用型別參數型別的方法
  ```kotlin
  val result = buildList {
      // 根據傳遞的 "value" 引數，型別引數被推論為 String
      add("value")
  } // result 推論出 List<String> 型別
  ```
* 為傳回型別參數型別的呼叫指定預期型別
  ```kotlin
  val result = buildList {
      // 根據預期型別，型別引數被推論為 Float
      val x: Float = get(0)
  } // result 具有 List<Float> 型別
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
      } // result 具有 Foo<CharSequence> 型別
  }
  ```
* 將延遲型別變數的型別傳遞給預期具體型別的方法
  ```kotlin
  fun takeMyLong(x: Long) { ... }

  fun String.isMoreThan3() = length > 3

  fun takeListOfStrings(x: List<String>) { ... }

  fun main() {
      val result1 = buildList {
          val x = get(0)
          takeMyLong(x)
      } // result1 具有 List<Long> 型別

      val result2 = buildList {
          val x = get(0)
          val isLong = x.isMoreThan3()
      // ...
      } // result2 具有 List<String> 型別
  
      val result3 = buildList {
          takeListOfStrings(this)
      } // result3 具有 List<String> 型別
  }
  ```
* 取得 Lambda 接收者成員的可呼叫參照
  ```kotlin
  fun main() {
      val result = buildList {
          val x: KFunction1<Int, Float> = ::get
      } // result 具有 List<Float> 型別
  }
  ```
  ```kotlin
  fun takeFunction(x: KFunction1<Int, Float>) { ... }

  fun main() {
      val result = buildList {
          takeFunction(::get)
      } // result 具有 List<Float> 型別
  }
  ```

在分析結束時，產生器型別推論會考慮所有收集到的型別資訊，並嘗試將其合併為結果型別。請參見範例。

```kotlin
val result = buildList { // 推論延遲型別變數 E
    // 考慮 E 為 Number 或 Number 的子型別
    val n: Number? = getOrNull(0)
    // 考慮 E 為 Int 或 Int 的父型別
    add(1)
    // E 被推論為 Int
} // result 具有 List<Int> 型別
```

結果型別是與分析期間收集的型別資訊相對應的最具體型別。如果給定的型別資訊互相矛盾且無法合併，編譯器將回報錯誤。

請注意，只有在正規型別推論無法推論型別引數時，Kotlin 編譯器才會使用產生器型別推論。這意味著您可以在產生器 Lambda 外部提供型別資訊，這樣就不需要進行產生器型別推論分析。請看範例：

```kotlin
fun someMap() = mutableMapOf<CharSequence, String>()

fun <E> MutableMap<E, String>.f(x: MutableMap<E, String>) { ... }

fun main() {
    val x: Map<in String, String> = buildMap {
        put("", "")
        f(someMap()) // 型別不相符（要求 String，但發現 CharSequence）
    }
}
```

這裡會出現型別不相符，是因為 Map 的預期型別是在產生器 Lambda 外部指定的。編譯器會以固定的接收者型別 `Map<in String, String>` 來分析內部的所有陳述式。