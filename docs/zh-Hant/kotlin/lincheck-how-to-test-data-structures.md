---
title: 如何測試資料結構
description: 了解如何使用 Lincheck 測試並行資料結構：設定測試並了解測試過程的內部原理。
---

[//]: # (title: 如何測試資料結構)

Lincheck 為測試並行資料結構提供了宣告式介面。與其描述如何執行測試，不如宣告所有需要測試的操作，Lincheck 會產生並行執行場景、執行它們並分析結果。

讓我們使用 Lincheck 測試這個 `Counter` 資料結構：

```kotlin
class Counter {
    var value = 0

    fun inc(): Int = ++value
    fun dec(): Int = --value
}
```

1. 建立一個測試類別：

    ```kotlin
    class CounterTest {
    }
    ```

2. 建立一個持有結構執行個體的類別屬性：

   ```kotlin
   private val c = Counter()
   ```

3. 將您想要測試的操作宣告為成員函數，並使用 `@Operation` 對其進行註解：

    ```kotlin
    @Operation
    fun inc() = c.inc()
    
    @Operation
    fun dec() = c.dec()
    ```

    此註解會告知 Lincheck 在產生執行場景時應包含哪些方法。

4. 使用 `ModelCheckingOptions()` 或 `StressOptions()` 將測試函式宣告為成員函數。並使用 `@Test` 對其進行註解：

   ```kotlin
   @Test
   fun modelCheckingTest() = ModelCheckingOptions()
       .check(this::class)
   ```

   > 在[測試策略](lincheck-testing-strategies.md)一文中了解模型檢查與壓力測試之間的區別。
   >
   {style=”tip”}

5. 執行測試。如果失敗，Lincheck 會產生一份包含導致錯誤行為的場景和執行追蹤 (trace) 的錯誤報告：

    ```text
    = Invalid execution results =
    | -------------------- |
    | Thread 1  | Thread 2 |
    | -------------------- |
    | dec(): -1 | inc(): 1 |
    | -------------------- |
    ```

## 測試過程

在測試資料結構時，Lincheck 會產生一份執行場景列表，執行它們並分析結果。

考慮這個 `Counter` 資料結構：

![具有兩個方法 inc() 和 dec() 的 Counter 資料結構圖](counter_structure.svg){width=150}

為了測試它，Lincheck 會執行以下步驟：

1. 透過將宣告的操作隨機分配到不同的執行緒中，產生一個隨機執行場景列表：

   ![四個執行場景的圖表。在每個場景中，操作以不同的順序放置在兩個執行緒中。](execution_scenarios.svg){width=400}

   您可以使用 Lincheck 提供的[配置選項](lincheck-testing-strategies-options.md#scenario-generation)來指定執行緒數量和每個執行緒的操作數量。

2. 使用指定的測試策略執行產生的場景：[模型檢查或壓力測試](lincheck-testing-strategies.md)。每個產生的場景都會執行多次，以檢查不同的執行排程：

   ![四個執行排程的圖表。所有排程都對應於單一執行場景。在每個排程中，操作在不同的時間互相中斷。](execution_schedules.svg){width=400}

3. 根據正確性屬性驗證執行結果。預設為[線性一致性](https://en.wikipedia.org/wiki/Linearizability)。

   ![驗證過程圖。將一個執行排程的結果與循序執行相同操作的結果進行比較。](verification.svg){width=300}

   在此步驟中，如果提供了[驗證函式](lincheck-results-validation.md)，Lincheck 也可以驗證該結構。

## 範例：測試 Treiber 堆疊結構的實作

考慮這個 *不正確* 的 [Treiber 堆疊](https://en.wikipedia.org/wiki/Treiber_stack) 實作：

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

        // 錯誤：當 `pop()` 完成執行時，
        // 另一個執行緒可能已經彈出了此項目。
        return oldHead.item
    }

    private class Node<E>(
        val item: E,
        var next: Node<E>? = null
    )
}
```

您可以使用 Lincheck 測試此結構，以檢查注入的錯誤如何影響程式的行為：

1. 建立一個測試結構：

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

2. 執行測試。Lincheck 會產生一份錯誤報告，並提供導致錯誤行為的執行場景：

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

   此圖顯示了操作如何分配到不同的執行緒以及操作的傳回值。Lincheck 還提供了導致錯誤結果的特定執行緒交錯：

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

   由於實作未考慮到另一個執行緒中斷 `pop()` 函式的情況，導致 `pop()` 傳回了兩次 `1`，這是不應該發生的。

3. 修復資料結構。正確的實作會在傳回結果之前將 `oldHead` 變數更新為最新值：

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

## 下一步

了解 Lincheck 中可用的[測試策略](lincheck-testing-strategies.md)。

## 延伸閱讀

* [產生操作引數](lincheck-argument-generation-constraints.md)
* [配置操作執行選項](lincheck-operation-execution-options.md)
* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)
* [定義演算法的循序規格](lincheck-results-validation.md)