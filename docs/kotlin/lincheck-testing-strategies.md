[//]: # (title: 测试策略)
[//]: # (description: 了解 Lincheck 中模型检查与压力测试的区别。)

Lincheck 提供了两种用于测试并发数据结构的策略：模型检查和压力测试。

在本文中，您将了解这些策略之间的区别，以及在选择测试策略时需要注意的事项。

## 模型检查

通过模型检查，Lincheck 会模拟可能的线程交错，并报告那些导致错误行为的交错。

要使用模型检查策略来测试数据结构，请使用 `ModelCheckingOptions()` 声明一个测试函数：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .check(this::class)
```

当使用模型检查策略时，Lincheck 会在共享内存访问（`read` 和 `write`）点或同步点（如锁的获取与释放、`park`/`unpark`、`wait`/`notify` 等）插入显式的线程切换指令。

控制线程切换使 Lincheck 能够：

* 确定性地探索程序的不同可能执行调度。
* 提供详细的执行跟踪。

目前，模型检查要求 Lincheck 假设执行过程符合[顺序一致内存模型](https://en.wikipedia.org/wiki/Sequential_consistency)。这意味着 Lincheck 不会模拟，也无法捕获与指令重排、内存缓存行为以及在宽松的 [Java 内存模型](https://en.wikipedia.org/wiki/Java_memory_model)下其他类似影响相关的错误。

<!-- TODO: uncomment after the article is published
> 有关更多信息，请参阅 [模型检查](lincheck-model-checking.md)。
>
{style=”tip”}
-->

## 压力测试

通过压力测试，Lincheck 会多次执行每个场景，以增加发现错误的机会。

要使用压力测试，请使用 `StressOptions()` 声明一个测试函数：

```kotlin
@Test
fun stressTest() = StressOptions()
   .check(this::class)
```

与模型检查不同，Lincheck 不会控制或跟踪线程切换。这使得压力测试速度更快，且不需要 Lincheck 对内存模型做出任何假设。
然而，对于压力测试，测试是不可复现的，且 Lincheck 无法提供执行跟踪。

## 选择策略

在选择策略时，请考虑以下几点：

<table style="both">
    <tr>
        <td></td>
        <td><b>模型检查</b></td>
        <td><b>压力测试</b></td>
    </tr>
    <tr>
        <td><b>速度</b></td>
        <td>较慢。</td>
        <td>较快。</td>
    </tr>
    <tr>
        <td><b>可复现性</b></td>
        <td>如果输入数据未更改，测试将返回完全相同的结果。</td>
        <td>由于线程调度可能会随运行次数而变化，测试可能会返回不同的结果。</td>
    </tr>
    <tr>
        <td><b>假设</b></td>
        <td><list>
            <li>假设顺序一致内存模型。</li>
            <li>会遗漏该模型之外的错误行为所引起的错误。</li>
        </list></td>
        <td><list>
            <li>不对内存模型做任何假设。</li>
            <li>有机会捕获任何错误行为，无论其根本原因是什么。</li>
        </list></td>
    </tr>
    <tr>
        <td><b>详尽程度</b></td>
        <td>同时报告并发场景和导致错误行为的执行跟踪。</td>
        <td>仅报告并发场景。</td>
    </tr>
    <tr>
        <td><b>标准库覆盖范围</b></td>
        <td><list>
            <li>不模拟某些标准库功能（如弱引用）的行为。</li>
            <li>会遗漏由此类功能引起的错误。</li>
        </list></td>
        <td>有机会捕获由于使用任何功能而引起的错误。</td>
    </tr>
</table>

## 下一步

了解如何通过自定义场景生成、启用停滞执行检测以及为库提供线程安全保证来[配置测试策略](lincheck-testing-strategies-options.md)。

## 另请参阅

* [生成操作实参](lincheck-argument-generation-constraints.md)
* [配置操作执行选项](lincheck-operation-execution-options.md)
* [检查非阻塞进度保证](lincheck-progress-guarantees.md)
* [定义算法的顺序规范](lincheck-results-validation.md)