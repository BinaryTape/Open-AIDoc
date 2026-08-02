[//]: # (title: 測試任意程式碼)
[//]: # (description: 了解如何使用 Lincheck 的 runConcurrentTest() 函式測試任何並行程式碼。)

Lincheck 提供 `runConcurrentTest()` 函式來測試任意並行程式碼。

`runConcurrentTest()` 函式會多次執行一段並行程式碼區塊，並使用模型檢查來探索其可能的執行排程。

要使用 Lincheck 測試並行程式碼：

1. 建立一個測試類別：

   ```kotlin
   class NewConcurrentTest {
       // 測試
   }
   ```

2. 使用 `runConcurrentTest()` 建立一個測試函式作為成員函數。

   ```kotlin
   @Test
   fun test() = runConcurrentTest(100_000) {
       // 並行程式碼
   }
   ```

> 該函式參數為選填；它指定了要探索的執行排程數量。
> 預設值為 `10_000`。
>
{style="tip"}

3. 執行測試。如果測試失敗，Lincheck 會產生一份包含導致錯誤行為之執行排程的報告。

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

## 範例：測試 `ConcurrentHashMap` 函式

考慮以下針對 `ConcurrentHashMap` 函式的測試：

```kotlin
import org.jetbrains.lincheck.*
import java.util.concurrent.*
import kotlin.concurrent.*
import kotlin.test.*

// 此測試展示了由兩個執行緒
// 以相反順序執行巢狀 `computeIfAbsent` 呼叫所導致的死結。
class ConcurrentHashMapDeadlock {
   @Test
   fun test() = Lincheck.runConcurrentTest {
       val map = ConcurrentHashMap<String, String>()
       // 在鎖定 `key1` 的同時更新 `key2`。
       val thread1 = thread {
           map.computeIfAbsent("key1") {
               map.computeIfAbsent("key2") { "value2" }
               "value1"
           }
       }
       // 在鎖定 `key2` 的同時更新 `key1`。
       val thread2 = thread {
           map.computeIfAbsent("key2") {
               map.computeIfAbsent("key1") { "value1" }
               "value2"
           }
       }
      
       // 等待兩個執行緒完成。
       thread1.join()
       thread2.join()
   }
}
```

由於 Lincheck 發現了導致死結的執行排程，測試失敗：

1. 執行緒 2 將 `key2` 對應到索引為 1 的桶位 (bucket)，並在該桶位加上鎖，接著開始執行 `computeIfAbsent("key1")`。在執行緒 2 對應 `key1` 並鎖定包含 `key1` 的桶位**之前**，執行從執行緒 2 切換到了執行緒 1。
2. 執行緒 1 將 `key1` 對應到索引為 0 的桶位，並在該桶位加上鎖，接著開始執行 `computeIfAbsent("key2")`。執行緒 1 將 `key2` 對應到索引為 1 的桶位並嘗試鎖定該桶位，但它已被執行緒 2 鎖定。執行從執行緒 1 切換到了執行緒 2。
3. 執行緒 2 嘗試鎖定包含 `key1` 的桶位，但它已被執行緒 1 鎖定。

兩個執行緒都被鎖定，因此執行遇到了死結。

![失敗測試的 Lincheck 報告螢幕截圖。](concurrenthashmapdeadlock.png){thumbnail="true" width=700}

## 接續步驟

了解如何[使用 Lincheck 測試資料結構](lincheck-how-to-test-data-structures.md)。

<!-- TODO: uncomment after the articles are published
## 延伸閱讀

* [Lincheck 中的模型檢查](lincheck-model-checking.md)
* [Kotlin Multiplatform 專案中的 Lincheck](lincheck-kmp.md)
-->