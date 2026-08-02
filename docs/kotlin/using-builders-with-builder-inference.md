[//]: # (title: 使用构建器类型推断)

Kotlin 支持*构建器类型推断*（或构建器推断），这在处理泛型构建器时非常有用。它可以帮助编译器根据构建器 lambda 实参内部其他调用的类型信息，推断出构建器调用的类型实参。

请看这个 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html) 的使用示例：

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

这里的类型信息不足以通过常规方式推断类型实参，但构建器推断可以分析 lambda 实参内部的调用。根据 `putAll()` 和 `put()` 调用的类型信息，编译器可以自动将 `buildMap()` 调用的类型实参推断为 `String` 和 `Number`。构建器推断允许在正式使用泛型构建器时省略类型实参。

## 编写您自己的构建器

### 启用构建器推断的要求

> 在 Kotlin 1.7.0 之前，为构建器函数启用构建器推断需要使用 `-Xenable-builder-inference` 编译器选项。从 1.7.0 版本开始，该选项默认启用。
>
{style="note"}

要让构建器推断适用于您自己的构建器，请确保其声明具有一个带接收者的函数类型的构建器 lambda 参数。接收者类型还需满足两个要求：

1. 它应该使用构建器推断预期推断的类型实参。例如：
   ```kotlin
   fun <V> buildList(builder: MutableList<V>.() -> Unit) { ... }
   ```
   
   > 请注意，目前尚不支持直接传递类型形参的类型，例如 `fun <T> myBuilder(builder: T.() -> Unit)`。
   > 
   {style="note"}

2. 它应该提供公共成员或扩展，且在其签名中包含相应的类型形参。例如：
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
       val itemHolder1 = itemHolderBuilder { // itemHolder1 的类型为 ItemHolder<String>
           addItem(s)
       }
       val itemHolder2 = itemHolderBuilder { // itemHolder2 的类型为 ItemHolder<String>
           addAllItems(listOf(s)) 
       }
       val itemHolder3 = itemHolderBuilder { // itemHolder3 的类型为 ItemHolder<String?>
           val lastItem: String? = getLastItem()
           // ...
       }
   }
   ```

### 支持的功能

构建器推断支持： 
* 推断多个类型实参
  ```kotlin
  fun <K, V> myBuilder(builder: MutableMap<K, V>.() -> Unit): Map<K, V> { ... }
  ```
* 在一次调用中推断多个构建器 lambda 的类型实参，包括相互依赖的 lambda
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
      // result 的类型为 Pair<List<Int>, Map<String, Int>>
  }
  ```
* 推断其类型形参作为 lambda 参数或返回值类型的类型实参
  ```kotlin
  fun <K, V> myBuilder1(
      mapBuilder: MutableMap<K, V>.() -> K
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder() }
  
  fun <K, V> myBuilder2(
      mapBuilder: MutableMap<K, V>.(K) -> Unit
  ): Map<K, V> = mutableMapOf<K, V>().apply { mapBuilder(2 as K) }
  
  fun main() {
      // result1 推断为 Map<Long, String> 类型
      val result1 = myBuilder1 {
          put(1L, "value")
          2
      }
      val result2 = myBuilder2 {
          put(1, "value 1")
          // 您可以将 `it` 用作“推迟类型变量”类型
          // 详见下文
          put(it, "value 2")
      }
  }
  ```

## 构建器推断的工作原理

### 推迟类型变量

构建器推断是根据*推迟类型变量*工作的，这些变量在构建器推断分析期间出现在构建器 lambda 内部。推迟类型变量是正在推断过程中的类型实参类型。编译器使用它来收集有关类型实参的类型信息。

以 [`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 为例：

```kotlin
val result = buildList {
    val x = get(0)
}
```

这里 `x` 具有推迟类型变量的类型：`get()` 调用返回 `E` 类型的值，但 `E` 本身尚未固定。此时，`E` 的具体类型尚不明确。

当推迟类型变量的值与具体类型相关联时，构建器推断会收集此信息，以便在构建器推断分析结束时推断出相应类型实参的结果类型。例如：

```kotlin
val result = buildList {
    val x = get(0)
    val y: String = x
} // result 推断为 List<String> 类型
```

在将推迟类型变量赋值给 `String` 类型的变量后，构建器推断获得信息：`x` 是 `String` 的子类型。此赋值是构建器 lambda 中的最后一条语句，因此构建器推断分析结束，将类型实参 `E` 推断为 `String`。

请注意，您始终可以使用推迟类型变量作为接收者来调用 `equals()`、`hashCode()` 和 `toString()` 函数。

### 辅助构建器推断结果

构建器推断可以收集多种对分析结果有贡献的类型信息。它会考虑：
* 在 lambda 接收者上调用使用类型形参类型的函数
  ```kotlin
  val result = buildList {
      // 根据传递的 "value" 实参，类型实参被推断为 String
      add("value")
  } // result 推断为 List<String> 类型
  ```
* 为返回类型形参类型的调用指定预期类型
  ```kotlin
  val result = buildList {
      // 根据预期类型，类型实参被推断为 Float
      val x: Float = get(0)
  } // result 类型为 List<Float>
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
      } // result 类型为 Foo<CharSequence>
  }
  ```
* 将推迟类型变量的类型传递给期望具体类型的方法
  ```kotlin
  fun takeMyLong(x: Long) { ... }

  fun String.isMoreThan3() = length > 3

  fun takeListOfStrings(x: List<String>) { ... }

  fun main() {
      val result1 = buildList {
          val x = get(0)
          takeMyLong(x)
      } // result1 类型为 List<Long>

      val result2 = buildList {
          val x = get(0)
          val isLong = x.isMoreThan3()
      // ...
      } // result2 类型为 List<String>
  
      val result3 = buildList {
          takeListOfStrings(this)
      } // result3 类型为 List<String>
  }
  ```
* 获取指向 lambda 接收者成员的可调用引用
  ```kotlin
  fun main() {
      val result = buildList {
          val x: KFunction1<Int, Float> = ::get
      } // result 类型为 List<Float>
  }
  ```
  ```kotlin
  fun takeFunction(x: KFunction1<Int, Float>) { ... }

  fun main() {
      val result = buildList {
          takeFunction(::get)
      } // result 类型为 List<Float>
  }
  ```

在分析结束时，构建器推断会考虑所有收集到的类型信息，并尝试将其合并到结果类型中。请参阅示例。

```kotlin
val result = buildList { // 推断推迟类型变量 E
    // 考虑到 E 是 Number 或 Number 的子类型
    val n: Number? = getOrNull(0)
    // 考虑到 E 是 Int 或 Int 的超类型
    add(1)
    // E 被推断为 Int
} // result 类型为 List<Int>
```

结果类型是与分析期间收集到的类型信息相对应的最具体类型。如果给定的类型信息相互矛盾且无法合并，编译器将报告错误。

请注意，Kotlin 编译器仅在常规类型推断无法推断类型实参时才会使用构建器推断。这意味着您可以在构建器 lambda 之外提供类型信息，这样就不需要进行构建器推断分析。请看示例：

```kotlin
fun someMap() = mutableMapOf<CharSequence, String>()

fun <E> MutableMap<E, String>.f(x: MutableMap<E, String>) { ... }

fun main() {
    val x: Map<in String, String> = buildMap {
        put("", "")
        f(someMap()) // 类型不匹配（预期为 String，实际为 CharSequence）
    }
}
```

这里出现了类型不匹配，因为 map 的预期类型是在构建器 lambda 之外指定的。编译器使用固定的接收者类型 `Map<in String, String>` 分析内部的所有语句。