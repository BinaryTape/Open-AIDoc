---
title: Lincheck 快速入門
description: 本快速入門指南將引導您完成 Lincheck 的設定、撰寫您的第一個 Lincheck 測試，並解讀測試報告。
---

[//]: # (title: Lincheck 快速入門)
[//]: # (description: 本快速入門指南將引導您完成 Lincheck 的設定、撰寫您的第一個 Lincheck 測試，並解讀測試報告。)

本快速入門指南將引導您完成 Lincheck 的設定、撰寫您的第一個 Lincheck 測試，並解讀測試報告。

您將會：
* 建立一個新的 IntelliJ IDEA 專案並安裝 Lincheck。
* 撰寫您的第一個並行測試並使用 Lincheck 執行。
* 建立一個並行資料結構，並使用兩種測試策略透過 Lincheck 進行測試。

## 建立專案

在 IntelliJ IDEA 中開啟現有的 Kotlin 專案或[建立新專案](https://kotlinlang.org/docs/jvm-get-started.html)。

## 新增相依性

若要在專案中使用 Lincheck，請將相應的相依性新增至您的組建組態中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.jetbrains.lincheck:lincheck:%lincheckVersion%")
    testImplementation(kotlin("test"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    testImplementation "org.jetbrains.lincheck:lincheck:%lincheckVersion%"
    testImplementation "org.jetbrains.kotlin:kotlin-test"
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
         <dependency>
             <groupId>org.jetbrains.lincheck</groupId>
             <artifactId>lincheck</artifactId>
             <version>%lincheckVersion%</version>
             <scope>test</scope>
         </dependency>
         <dependency>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-test</artifactId>
             <scope>test</scope>
         </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 撰寫您的第一個測試

對於基本的並行測試，請建立一個測試函式，描述每個執行緒中應執行的操作以及預期的斷言。Lincheck 使用 [model checking](lincheck-testing-strategies.md#model-checking) 探索程式可能的執行緒交錯 (interleaving)，並在行為不正確時提供錯誤報告。

1. 在 `src/test` 目錄中，建立一個 `CounterTest.kt` 檔案。
2. 匯入 `org.jetbrains.lincheck`、`kotlinx.concurrent` 和 `kotlin.test` 程式庫： 
    
    ```kotlin
    import org.jetbrains.lincheck.*
    import kotlin.concurrent.*
    import kotlin.test.*
    ```

3. 撰寫一個測試，建立一個變數以及兩個操作該變數的執行緒：

    ```kotlin
    class CounterTest {
        @Test // 測試函式宣告
        fun test() = Lincheck.runConcurrentTest {
            var counter = 0

            // 並行地遞增計數器
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

4. 執行測試。Lincheck 會產生一份報告，其中包含導致不正確行為的執行緒交錯：

    > 安裝 [Lincheck 外掛程式](https://plugins.jetbrains.com/plugin/24171-lincheck) 以視覺化錯誤追蹤 (trace)。
    > 
    {style="note"}
   
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

    Lincheck 發現了一個執行緒交錯，其中一個 `inc()` 操作覆寫了 `counter` 的值。
    <deflist collapsible="true">
        <def title="逐步報告說明" default-state="collapsed">
        <list type="decimal">
            <li> 在執行緒 2 中，JVM 讀取初始 <code>counter</code> 值。</li>
            <li> 執行從執行緒 2 切換到執行緒 1。</li>
            <li> 在執行緒 1 中，JVM 遞增計數器。<code>inc()</code> 操作的所有步驟都在沒有中斷的情況下執行：從變數中讀取值、遞增值，並將值寫回變數。</li>
            <li> 執行切換回執行緒 2。</li>
            <li> 在執行緒 2 中，JVM 遞增在步驟 1 取得的值，並將結果寫入 <code>counter</code> 變數。</li>
            </list>
            </def>
    </deflist>

## 為資料結構撰寫測試

除了基本的並行測試外，Lincheck 還支援以[宣告式方法](lincheck-how-to-test-data-structures.md)測試並行資料結構。

要在 Lincheck 中測試資料結構，您只需要宣告結構的並行方法和測試函式。Lincheck 會產生隨機並行案例，使用指定的測試策略執行它們，並提供錯誤報告。

在本節中，您將測試一個簡單的計數器：

1. 在 `src/test` 目錄中，建立一個 `CounterStructureTest.kt` 檔案。
2. 匯入 `lincheck.datastructures` 和 `kotlin.test` 程式庫：

    ```kotlin
    import org.jetbrains.lincheck.datastructures.*
    import kotlin.test.*
    ```

3. 建立一個 `Counter` 結構：

    ```kotlin
    class Counter {
        @Volatile
        private var value = 0
    
        fun inc(): Int = ++value
        fun get() = value
    }
    ```
   
4. 建立一個 `CounterStructureTest` 類別。設定結構的初始狀態，並使用 `@Operation` 註解標記結構的並行操作：

    ```kotlin
    class CounterStructureTest {
        // 初始狀態
        private val c = Counter()
    
        // 並行操作
        @Operation
        fun inc() = c.inc()
    
        @Operation
        fun get() = c.get()
    }
    ```
   
5. 在 `CounterTest` 類別中，使用 `ModelCheckingOptions()` 宣告一個測試函式：
    
    ```kotlin
    @Test
    fun stressTest() = ModelCheckingOptions().check(this::class)
    ```
   
    > 若要了解 model checking 的運作方式，請參閱[測試策略](lincheck-testing-strategies.md#model-checking)文章。
    > 
    {style=”tip”}

6. 執行測試。Lincheck 會產生一份包含並行案例和導致不正確行為的特定執行緒交錯的錯誤報告：
    
    ```text
    | ------------------- |
    | Thread 1 | Thread 2 |
    | ------------------- |
    | inc(): 1 | inc(): 1 |
    | ------------------- |
    ```

    ```text
    | ------------------------ |
    | Thread 1 |   Thread 2    |
    | ------------------------ |
    |          | inc(): 1      |
    |          |   c.inc(): 1  |
    |          |     value ➜ 0 |
    |          |     switch    |
    | inc(): 1 |               |
    |          |     value = 1 |
    |          |     value ➜ 1 |
    |          |   result: 1   |
    | ------------------------ |
    ```

## 後續步驟

進一步了解 Lincheck 中[測試並行資料結構的宣告式方法](lincheck-how-to-test-data-structures.md)。