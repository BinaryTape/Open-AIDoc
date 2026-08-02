---
title: 進度保證
description: 了解如何在 Lincheck 中檢查演算法的無阻礙 (obstruction-freedom) 特性。
---

[//]: # (title: 進度保證)

許多並行 (concurrent) 演算法提供[非阻塞進度保證](https://en.wikipedia.org/wiki/Non-blocking_algorithm)，例如無等待 (wait-freedom)、無鎖 (lock-freedom) 或無阻礙 (obstruction-freedom)。

Lincheck 僅支援驗證無阻礙。然而，由於無鎖和無等待演算法也是無阻礙的，任何違反無阻礙的行為也代表違反了那些更強的保證。

使用 `checkObstructionFreedom` 選項來驗證程式的無阻礙保證：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .checkObstructionFreedom()
   .check(this::class)
```

> `checkObstructionFreedom` 選項僅適用於 [模型檢查 (model checking)](lincheck-testing-strategies.md#model-checking) 策略。
>
{style="warning"}

Lincheck 透過檢查當所有其他執行緒都暫停時，某個執行緒是否可以繼續執行來驗證無阻礙。如果執行緒的執行[陷入迴圈](lincheck-testing-strategies-options.md#stalled-execution-detection)，Lincheck 會回報活動鎖。

如果某些函式是刻意設定為阻塞的，您可以使用 [`@Operation(blocking = true)`](lincheck-operation-execution-options.md#blocking-operations) 對其進行標記，以防止誤報。

## 範例：測試 `ConcurrentHashMap` 的無阻礙性

在此範例中，您將測試 `ConcurrentHashMap` 結構的 `put()` 函式。

1. 建立 `ConcurrentHashMapTest.kt` 檔案。
2. 為 `ConcurrentHashMap` 結構建立一個測試類別並宣告 `put()` 函式：

   ```kotlin
   class ConcurrentHashMapTest {
       private val map = ConcurrentHashMap<Int, Int>()

       @Operation
       fun put(key: Int, value: Int) = map.put(key, value)
   }
   ```

3. 宣告一個啟用了 `checkObstructionFreedom()` 選項的測試函式：

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .threads(2)
        .actorsPerThread(1)
        .check(this::class)
   ```
   
   [`threads`](lincheck-testing-strategies-options.md#scenario-generation) 和 [`actorsPerThread`](lincheck-testing-strategies-options.md#scenario-generation) 選項用於減少潛在的執行場景數量。這些選項不會改變測試的通過/失敗狀態，但能顯著減少測試時間。

4. 執行測試。應該會失敗並顯示以下報告：

   ```text
   = The algorithm should be non-blocking, but an active lock is detected =
   | --------------------- |
   | Thread 1  | Thread 2  |
   | --------------------- |
   | put(1, 0) | put(1, 1) |
   | --------------------- |
   
   The following interleaving leads to the error:
   | -------------------------------------------------------------------------------------------------------------- |
   |                                          Thread 1                                          |     Thread 2      |
   | -------------------------------------------------------------------------------------------------------------- |
   | put(1, 0): <hung>                                                                          |                   |
   |   map.put(1, 0)                                                                            |                   |
   |     putVal(1, 0, false)                                                                    |                   |
   |       spread(1): 1                                                                         |                   |
   |       table ➜ null                                                                         |                   |
   |       loop(1 iterations) at ConcurrentHashMap.putVal(ConcurrentHashMap.java:1016)          |                   |
   |         <iteration 1>                                                                      |                   |
   |           initTable()                                                                      |                   |
   |             loop(1 iterations) at ConcurrentHashMap.initTable(ConcurrentHashMap.java:2293) |                   |
   |             table ➜ null                                                                   |                   |
   |             switch                                                                         |                   |
   |                                                                                            | put(1, 1): <hung> |
   | -------------------------------------------------------------------------------------------------------------- |
   ```

5. 在 `put()` 函式的註解中加入 `blocking = true` 選項：

   ```kotlin
   @Operation(blocking = true)
   fun put(key: Int, value: Int) = map.put(key, value)
   ```

6. 重新執行測試。應該會成功通過。

## 範例：測試 `ConcurrentSkipListMap` 的無阻礙性

在此範例中，您將測試非阻塞 `ConcurrentSkipListMap` 結構的 `put()` 函式。

1. 建立 `ConcurrentSkipListMapTest.kt` 檔案。
2. 為 `ConcurrentSkipListMap` 結構建立一個測試類別並宣告 `put()` 函式：

    ```kotlin
    class ConcurrentSkipListMapTest {
        private val map = ConcurrentSkipListMap<Int, Int>()
   
        @Operation
        fun put(key: Int, value: Int) = map.put(key, value)
    }
    ```

3. 宣告一個啟用了 `checkObstructionFreedom()` 選項的測試函式：

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .check(this::class)
    ```

4. 執行測試。應該會成功通過。

## 參閱

* [設定引數生成約束](lincheck-argument-generation-constraints.md)
* [設定操作執行](lincheck-operation-execution-options.md)
* [驗證執行結果](lincheck-results-validation.md)