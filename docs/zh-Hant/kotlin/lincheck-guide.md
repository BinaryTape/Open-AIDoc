[//]: # (title: 概覽)
[//]: # (description: Lincheck 是一個用於在 JVM 上測試並行程式碼的架構。Lincheck 會探索程式碼中潛在的執行緒交錯，以找出導致錯誤行為的交錯。)

Lincheck 是一個用於在 JVM 上測試並行程式碼的架構。執行測試時，Lincheck 會探索程式中潛在的執行緒交錯 (thread interleavings)，並回報導致錯誤行為的交錯。

> 在 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 專案中，您只能使用 Lincheck 在 JVM 上測試程式碼。
> 
{style="note"}

在 Lincheck 中，並行測試只需要您列出每個執行緒的操作以及預期的斷言 (assertions)。Lincheck 會處理其餘部分：

```kotlin
class CounterTest {
    @Test // 測試函式宣告
    fun test() = Lincheck.runConcurrentTest {
        var counter = 0

        // 並行遞增計數器
        val t1 = thread { counter++ }
        val t2 = thread { counter++ }

        // 等待執行緒結束
        t1.join()
        t2.join()

        // 檢查兩個遞增是否都已套用
        assertEquals(2, counter)
    }
}
```

如果測試失敗，Lincheck 會提供導致錯誤的執行緒交錯和執行緒切換點：

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

## Lincheck 的運作方式

每當 JVM 執行並行程式碼時，跨執行緒的操作執行順序可能會發生變化。例如，一個操作可能會被另一個執行緒中的操作中斷。這本身不是錯誤，但如果程式碼中存在並行錯誤 (concurrency bugs)，則可能導致錯誤。

![該圖比較了程式的執行案例與執行排程。在第一個執行排程中，操作是依序執行的。在第二個執行排程中，第一個操作被第二個操作中斷。](scenario-vs-schedule.png){ width="700" }

> **執行案例** (execution scenario) 定義了操作如何在執行緒之間分佈，以及每個執行緒內的執行順序。
> 
> **執行排程** (execution schedule，也稱為 **執行緒交錯**) 定義了所有執行緒中所有操作的執行順序。
>
{style="tip"}

Lincheck 實作了兩種測試策略，以尋找導致錯誤行為的執行排程：
* **模型檢查** (Model checking)。Lincheck 透過在程式中插入明確的執行緒切換指令來控制排程。這些指令被放置在同步點或共用記憶體存取處。模型檢查使 Lincheck 能夠產生導致錯誤的精確執行追蹤 (trace)。
* **壓力測試** (Stress testing)。由作業系統控制排程。Lincheck 會多次執行每個案例，以增加發現錯誤的機會。

## 探索 Lincheck

* 在 [Lincheck 快速入門](lincheck-getting-started.md) 中逐步學習 Lincheck 特性。
* 了解 Lincheck 中 [測試並行資料結構的宣告式方法](lincheck-how-to-test-data-structures.md)。

## 了解更多

* Nikita Koval 的 "How we test concurrent algorithms in Kotlin Coroutines"：[影片](https://youtu.be/jZqkWfa11Js)。KotlinConf 2023
* Maria Sokolova 的 "Lincheck: Testing concurrency on the JVM" 工作坊：[第 1 部分](https://www.youtube.com/watch?v=YNtUK9GK4pA)，[第 2 部分](https://www.youtube.com/watch?v=EW7mkAOErWw)。Hydra 2021
* Nikita Koval 等人的 "Lincheck: A Practical Framework for Testing Concurrent Data Structures on JVM"：[論文](https://nikitakoval.org/publications/cav23-lincheck.pdf)。2023