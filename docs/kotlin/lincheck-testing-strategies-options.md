[//]: # (title: 配置测试策略)
[//]: # (description: 了解 Lincheck 为模型检查和压力测试提供的各种选项。)

Lincheck 支持测试策略的各种配置选项，包括场景生成、停滞执行检测、验证等。

## 如何启用选项

要为测试策略启用选项，请在策略类中进行设置：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
    .iterations(100) // 指定生成的场景数量
    .check(this::class)
```

## 场景最小化

默认情况下，Lincheck 会尝试通过移除不改变测试行为的操作来最小化失败场景。

将 `minimizeFailedScenario` 选项设置为 `false` 可以查看完整的失败场景。

<compare first-title="Full" second-title="Minimized">
<code-block lang="text">
| ------------------------- |
|    Thread 1    | Thread 2 |
| --------------------------|
| inc(): 1       |          |
| get(): 1       |          |
| get(): 1       |          |
| --------------------------|
| inc(): 4 [0,1] | inc(): 2 |
| get(): 4 [1,1] | inc(): 4 |
| get(): 4 [2,1] | get(): 4 |
| --------------------------|
| get(): 4       |          |
| get(): 4       |          |
| get(): 4       |          |
| --------------------------|
</code-block>
<code-block lang="text">
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| inc(): 1 | inc(): 1 |
| ------------------- |
</code-block>
</compare>

## 场景生成

| 选项 | 默认值 | 描述 |
|---------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `iterations`              | `100`         | 生成的并发场景数量。 |
| `invocationsPerIteration` | `10_000`      | 每个并发场景的调用次数。 |
| `threads`                 | `2`           | 每个场景中的线程数。 |
| `actorsBefore`            | `5`           | 在场景并行部分之前调用的操作数量。 |
| `actorsPerThread`         | `5`           | 场景并行部分中每个线程的操作数量。 |
| `actorsAfter`             | `5`           | 在场景并行部分之后调用的操作数量。 |
| `customScenarios`         | –             | [自定义并发场景](#defining-a-custom-scenario)列表。自定义场景会在随机生成的场景之前执行。 |

### 定义自定义场景

Lincheck 使用一种[领域专用语言](https://kotlinlang.org/docs/type-safe-builders.html)来定义自定义场景：

```kotlin
@Test
fun test() = StressOptions()
    .customScenarios {
        initial {
            actor(SomeClass1::foo)
        }
        parallel {
            thread {
                actor(SomeClass1::buzz, 1)
                actor(SomeClass1::buzz, 2)
            }
            thread {
                actor(SomeClass1::buzz, 3)
            }
        }
        post {
            actor(SomeClass1::foo)
        }
    }
    .check(this::class)
```

每个场景由三个可选部分组成：

* `initial` – 在并行部分之前执行的操作。
* `parallel` – 线程定义。线程使用 `thread` 块定义。并行部分可能包含多个 `thread` 块。
* `post` – 在并行部分之后执行的操作。

操作使用 `actor(function, arg1, arg2, ...)` 函数定义。单个块内的操作按顺序执行。

## 停滞执行检测

<table>
<tr><td>选项</td><td>默认值</td><td>描述</td></tr>
<tr>
    <td><code>timeoutMs</code></td>
    <td><code>3000</code></td>
    <td>调用超时（以毫秒为单位），超过此时间后 Lincheck 将报告停滞执行。</td></tr>
<tr>
    <td><code>loopBound</code></td>
    <td><code>50</code></td>
    <td>循环迭代次数，超过此次数后 Lincheck 将报告停滞执行。<br/>
        如果 Lincheck 为长循环错误地报告了停滞执行，请增加 <code>loopBound</code> 的值。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
<tr>
    <td><code>recursionBound</code></td>
    <td><code>20</code></td>
    <td>递归调用次数，超过此次数后 Lincheck 将报告停滞执行。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 的值应小于 <code>loopBound</code>。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
</table>

## 循环中的线程切换

<table><tr><td>选项</td><td>默认值</td><td>描述</td></tr>
<tr>
    <td><code>loopIterationsBeforeThreadSwitch</code></td>
    <td><code>10</code></td>
    <td>线程在尝试切换到另一个线程之前可以执行的循环迭代次数。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 的值应小于 
        <a href="#stalled-execution-detection"><code>loopBound</code></a>。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
</table>

## 验证

<table>
<tr><td>选项</td><td>默认值</td><td>描述</td></tr>
<tr>
    <td><code>verifierClass</code></td>
    <td><code>LinearizabilityVerifier</code></td>
    <td>在 <a href="lincheck-results-validation.md#verification-models">验证过程</a> 中使用的验证器类：
        <list>
            <li><code>LinearizabilityVerifier</code></li>
            <li><code>SerializabilityVerifier</code></li>
            <li><code>QuiescentConsistencyVerifier</code></li>
        </list></td></tr>
<tr>
    <td><code>sequentialSpecification</code></td>
    <td>与测试的数据结构相同。</td>
    <td>测试数据结构的顺序版本。该结构在
        <a href="lincheck-results-validation.md">验证过程</a> 中使用。</td>
</tr>
</table>

## 进度保证

<table><tr><td>选项</td><td>默认值</td><td>描述</td></tr>
<tr>
    <td><code>checkObstructionFreedom</code></td>
    <td><code>false</code></td>
    <td>将此选项设置为 <code>true</code> 以验证数据结构操作的 <a href="lincheck-progress-guarantees.md">无阻碍（obstruction-freedom）保证</a>。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
</table>

## 库分析

<table>
<tr><td>选项</td><td>默认值</td><td>描述</td></tr>
<tr>
    <td><code>stdLibAnalysisEnabled</code></td>
    <td><code>false</code></td>
    <td>默认情况下，Lincheck 不会验证标准库操作的行为，将其视为线程安全。将此选项设置为 <code>true</code> 以启用对标准库函数/类的分析。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
<tr>
    <td><code>addGuarantee</code></td>
    <td>–</td>
    <td>使用 <code>addGuarantee</code> 选项为线程安全或与分析无关的方法 <a href="#defining-a-guarantee">定义保证</a>，以将它们从模型检查中排除。<br/><br/>
        此选项仅适用于 <a href="lincheck-testing-strategies.md#model-checking">模型检查</a>。</td></tr>
</table>

### 定义保证

要定义保证，请使用构建器链：先选择类，然后选择方法，最后选择保证类型。

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
        .addGuarantee(
            forClasses("java.util.concurrent.ConcurrentHashMap")
                .allMethods()
                .treatAsAtomic()
        )
        .check(this::class)
```

1. 使用 `forClasses` 重载之一选择类：

   * `forClasses(vararg fullClassNames: String)` — 如果类的全名存在于 `fullClassNames` 字符串中，则匹配。
   * `forClasses(vararg classes: KClass<*>)` — 通过引用匹配类。
   * `forClasses(classPredicate: (fullClassName: String) -> Boolean)` — 使用类全名上的谓词匹配类。

2. 选择要应用保证的方法：

   * `methods(methodNames: String)` – 如果方法名存在于 `methodNames` 字符串中，则匹配。
   * `methods(methodPredicate: (methodName: String) -> Boolean)` – 使用谓词匹配方法。
   * `allMethods()` – 匹配所选类的所有方法。

3. 选择保证类型：

   * `treatAsAtomic()` — 将每个方法视为原子操作。Lincheck 不会在方法调用内部插入切换点，但可能会在调用之前或之后添加。

     对于已知线程安全的方法，请使用 `treatAsAtomic()`。
   * `ignore()` — 从分析中排除这些方法。Lincheck 不会在方法调用内部、之前或之后插入切换点。 

     > 如果方法内部使用了同步原语（例如 `synchronized` 块），忽略该方法可能会导致 Lincheck 死锁。
     >
     {style="warning"}

     对于与分析无关的方法（例如日志或调试实用程序），请使用 `ignore()`。

## 下一步

了解如何为 Lincheck 执行场景中使用的操作[配置实参生成](lincheck-argument-generation-constraints.md)。

## 相关阅读

* [配置操作执行选项](lincheck-operation-execution-options.md)
* [检查非阻塞进度保证](lincheck-progress-guarantees.md)
* [定义算法的顺序规范](lincheck-results-validation.md)