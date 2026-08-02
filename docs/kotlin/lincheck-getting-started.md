[//]: # (title: Lincheck 入门)
[//]: # (description: 本快速入门指南将引导您完成 Lincheck 的设置、编写您的第一个 Lincheck 测试以及解读测试报告。)

本快速入门指南将引导您完成 Lincheck 的设置、编写您的第一个 Lincheck 测试以及解读测试报告。

您将：
* 创建一个新的 IntelliJ IDEA 项目并安装 Lincheck。
* 编写您的第一个并发测试并使用 Lincheck 运行它。
* 创建一个并发数据结构，并使用两种测试策略通过 Lincheck 对其进行测试。

## 创建项目

在 IntelliJ IDEA 中打开一个现有的 Kotlin 项目或[创建一个新项目](https://kotlinlang.org/docs/jvm-get-started.html)。

## 添加依赖项

要在项目中使用 Lincheck，请将相应的依赖项添加到您的构建配置中：

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

## 编写您的第一个测试

对于基本的并发测试，请创建一个测试函数，其中描述应在每个线程中执行的操作以及预期的断言。Lincheck 使用[模型检查](lincheck-testing-strategies.md#model-checking)探索程序可能的线程交替，并在出现错误行为时提供错误报告。

1. 在 `src/test` 目录中，创建一个 `CounterTest.kt` 文件。
2. 导入 `org.jetbrains.lincheck`、`kotlinx.concurrent` 和 `kotlin.test` 库： 
    
    ```kotlin
    import org.jetbrains.lincheck.*
    import kotlin.concurrent.*
    import kotlin.test.*
    ```

3. 编写一个测试，创建一个变量和两个操作该变量的线程：

    ```kotlin
    class CounterTest {
        @Test // 测试函数声明
        fun test() = Lincheck.runConcurrentTest {
            var counter = 0

            // 并发增加计数器
            val t1 = thread { counter++ }
            val t2 = thread { counter++ }

            // 等待线程执行完毕
            t1.join()
            t2.join()

            // 检查两次增加是否都已应用
            assertEquals(2, counter)
        }
    }
    ```

4. 运行测试。Lincheck 会生成一个报告，其中包含导致错误行为的线程交替：

    > 安装 [Lincheck 插件](https://plugins.jetbrains.com/plugin/24171-lincheck)以可视化错误跟踪。
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

    Lincheck 发现了一个线程交替，其中一个 `inc()` 操作覆盖了 `counter` 的值。
    <deflist collapsible="true">
        <def title="报告的逐步说明" default-state="collapsed">
        <list type="decimal">
            <li> 在线程 2 中，JVM 读取初始的 <code>counter</code> 值。</li>
            <li> 执行从线程 2 切换到线程 1。</li>
            <li> 在线程 1 中，JVM 增加计数器。<code>inc()</code> 操作的所有步骤都在没有中断的情况下执行：从变量中读取值、增加值并将值写回变量。</li>
            <li> 执行切换回线程 2。</li>
            <li> 在线程 2 中，JVM 增加在步骤 1 中获取的值，并将结果写入 <code>counter</code> 变量。</li>
            </list>
            </def>
    </deflist>

## 为数据结构编写测试

除了基本的并发测试外，Lincheck 还支持一种[声明式方法](lincheck-how-to-test-data-structures.md)来测试并发数据结构。

要在 Lincheck 中测试数据结构，您只需要声明该结构的并发方法和测试函数。Lincheck 生成随机并发方案，使用指定的测试策略执行它们，并提供错误报告。

在本节中，您将测试一个简单的计数器：

1. 在 `src/test` 目录中，创建一个 `CounterStructureTest.kt` 文件。
2. 导入 `lincheck.datastructures` 和 `kotlin.test` 库：

    ```kotlin
    import org.jetbrains.lincheck.datastructures.*
    import kotlin.test.*
    ```

3. 创建一个 `Counter` 结构：

    ```kotlin
    class Counter {
        @Volatile
        private var value = 0
    
        fun inc(): Int = ++value
        fun get() = value
    }
    ```
   
4. 创建一个 `CounterStructureTest` 类。设置结构的初始状态，并使用 `@Operation` 注解标记结构的并发操作：

    ```kotlin
    class CounterStructureTest {
        // 初始状态
        private val c = Counter()
    
        // 并发操作
        @Operation
        fun inc() = c.inc()
    
        @Operation
        fun get() = c.get()
    }
    ```
   
5. 在 `CounterTest` 类中，使用 `ModelCheckingOptions()` 声明一个测试函数：
    
    ```kotlin
    @Test
    fun stressTest() = ModelCheckingOptions().check(this::class)
    ```
   
    > 在[测试策略](lincheck-testing-strategies.md#model-checking)文章中了解模型检查的工作原理。
    > 
    {style=”tip”}

6. 运行测试。Lincheck 生成一份错误报告，其中包含并发方案以及导致错误行为的具体线程交替：
    
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

## 下一步

了解 Lincheck 中[测试并发数据结构的声明式方法](lincheck-how-to-test-data-structures.md)。