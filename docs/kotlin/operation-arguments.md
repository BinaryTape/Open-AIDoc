[//]: # (title: 操作参数)

在本教程中，你将学习如何配置操作参数。

考虑下面这个简单的 `MultiMap` 实现。它基于 `ConcurrentHashMap`，在内部存储一个值列表：

```kotlin
import java.util.concurrent.*

class MultiMap<K, V> {
    private val map = ConcurrentHashMap<K, List<V>>()
   
    // 维护与指定键关联的
    // 值列表。
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

这个 `MultiMap` 实现是可线性化的吗？如果不是，在访问较小范围的键时，更有可能检测到错误的交错，从而增加了并发处理相同键的可能性。

为此，请为 `key: Int` 形参配置生成器：

1. 声明 `@Param` 注解。
2. 指定整数生成器类：`@Param(gen = IntGen::class)`。
   Lincheck 开箱即用支持几乎所有基本类型和字符串的随机形参生成器。
3. 使用字符串配置 `@Param(conf = "1:2")` 定义生成值的范围。
4. 指定形参配置名称 (`@Param(name = "key")`)，以便在多个操作之间共享。

   下面是 `MultiMap` 的压力测试，它为 `add(key, value)` 和 `get(key)` 操作生成 `[1..2]` 范围内的键： 
   
   ```kotlin
   import java.util.concurrent.*
   import org.jetbrains.lincheck.check
   import org.jetbrains.lincheck.datastructures.*
   import org.junit.*
   
   class MultiMap<K, V> {
       private val map = ConcurrentHashMap<K, List<V>>()
   
       // 维护与指定键关联的
       // 值列表。
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

5. 运行 `stressTest()`，查看以下输出：

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
   
6. 最后，运行 `modelCheckingTest()`。它失败并显示以下输出：

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

由于键的范围较小，Lincheck 会快速揭示竞争：当使用相同的键并发添加两个值时，其中一个值可能会被覆盖并丢失。

## 下一步

学习如何测试对执行设置了 [访问约束](constraints.md) 的数据结构，例如单生产者单消费者队列。