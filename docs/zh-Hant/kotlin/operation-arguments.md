[//]: # (title: 操作引數)

在本教學中，你將學習如何配置操作引數。

請考慮下方這個簡單的 `MultiMap` 實作。它基於 `ConcurrentHashMap`，內部儲存了一個值清單：

```kotlin
import java.util.concurrent.*

class MultiMap<K, V> {
    private val map = ConcurrentHashMap<K, List<V>>()
   
    // 維持與指定金鑰關聯的
    // 值清單。
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

這個 `MultiMap` 實作是否具備線性一致性（linearizable）？如果沒有，當存取小範圍的金鑰時，更有可能偵測到錯誤的交錯（interleaving），進而增加同時處理相同金鑰的可能性。

為此，請為 `key: Int` 參數配置產生器：

1. 宣告 `@Param` 註解。
2. 指定整數產生器類別：`@Param(gen = IntGen::class)`。
   Lincheck 開箱即用，支援幾乎所有基本型別與字串的隨機參數產生器。
3. 使用字串配置 `@Param(conf = "1:2")` 定義產生的值範圍。
4. 指定參數配置名稱 (`@Param(name = "key")`)，以便在多個操作中共用。

   以下是 `MultiMap` 的壓力測試，它會為 `add(key, value)` 和 `get(key)` 操作產生範圍在 `[1..2]` 內的金鑰： 
   
   ```kotlin
   import java.util.concurrent.*
   import org.jetbrains.lincheck.check
   import org.jetbrains.lincheck.datastructures.*
   import org.junit.*
   
   class MultiMap<K, V> {
       private val map = ConcurrentHashMap<K, List<V>>()
   
       // 維持與指定金鑰關聯的
       // 值清單。
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

5. 執行 `stressTest()` 並查看以下輸出：

   ```text
   = Invalid execution results =
   | ---------------------------------- |
   |    執行緒 1     |     執行緒 2     |
   | ---------------------------------- |
   | add(2, 0): void | add(2, -1): void |
   | ---------------------------------- |
   | get(2): [0]     |                  |
   | ---------------------------------- |
   ```
   
6. 最後，執行 `modelCheckingTest()`。它會失敗並顯示以下輸出：

   ```text
   = Invalid execution results =
   | ---------------------------------- |
   |    執行緒 1     |     執行緒 2     |
   | ---------------------------------- |
   | add(2, 0): void | add(2, -1): void |
   | ---------------------------------- |
   | get(2): [-1]    |                  |
   | ---------------------------------- |
   
   ---
   水平線 | ----- | 以上的所有操作都發生在該線以下的操作之前
   ---

   以下交錯導致了錯誤：
   | ---------------------------------------------------------------------- |
   |    執行緒 1     |                       執行緒 2                       |
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

由於金鑰範圍很小，Lincheck 能迅速揭露資料競爭（race）：當同一個金鑰同時加入兩個值時，其中一個值可能會被覆蓋並遺失。

## 下一步

學習如何測試對[執行設定存取約束](constraints.md)的資料結構，例如單一生產者單一消費者（single-producer single-consumer）佇列。