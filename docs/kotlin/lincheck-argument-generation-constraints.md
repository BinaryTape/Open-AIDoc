[//]: # (title: 实参生成约束)
[//]: # (description: 了解如何在 Lincheck 中配置操作实参的生成。)

为了测试并发数据结构，Lincheck 通过将操作随机放置在不同的线程中并使用随机实参调用它们，来生成一组并发场景。

你可以约束操作实参的范围，以增加发现并发错误的可能性。例如，如果可能键值的范围有限，则哈希映射中的并发操作更有可能访问相同的键。这使 Lincheck 能够更高效地暴露竞态条件和其他并发错误。

要在 Lincheck 中限制生成的实参值范围：

1. 使用 `@Param` 注解声明一个实参生成器：

   ```kotlin
   @Param(name = "key", gen = IntGen::class, conf = "1:2")
   class MultiMapTest {
       // Tests
   }
   ```

   * `name` – 实参生成器的名称。
   * `gen` – 生成器的[类型](#generator-types)。
   * `conf` – 生成器的配置字符串。在这里，Lincheck 生成从 1 到 2 的整数值。

   > Lincheck 为多种值类型提供生成器。每种类型使用不同的配置字符串模板。
   >
   > 请在[生成器类型](#generator-types)部分中详细了解。
   { style = "tip" }

2. 为操作形参添加 `@Param` 注解以应用约束：

   ```kotlin
   @Operation
   fun add(@Param(name = "key") key: Int, value: Int) = map.add(key, value)

   @Operation
   fun get(@Param(name = "key") key: Int) = map.get(key)
   ```

应用约束后，Lincheck 仅使用指定范围内的值生成场景：

```text
| ---------------------------------- |
|    Thread 1     |     Thread 2     |
| ---------------------------------- |
| add(2, 0): void | add(2, -1): void |
| ---------------------------------- |
| get(2): [-1]    |                  |
| ---------------------------------- |
```

## 生成器类型

Lincheck 提供以下实参生成器类型：

<table>
    <tr>
      <th>生成器</th>
      <th>配置模板</th>
      <th>描述</th>
    </tr>
    <tr>
      <td><code>IntGen</code></td>
      <td><code>"min:max"</code></td>
      <td>生成 <code>min</code> 和 <code>max</code> 之间（包含首尾）的 <code>Int</code> 值。 <br/><br/>
          如果配置字符串为空，则使用从 <code>Int.MIN_VALUE</code> 到 <code>Int.MAX_VALUE</code> 的完整整数范围。 <br/><br/>
          示例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>StringGen</code></td>
      <td><code>"maxWordLength:alphabet"</code><br/><code>"maxWordLength"</code><br/><code>""</code></td>
      <td>根据提供的 <code>alphabet</code> 生成长度不超过 <code>maxWordLength</code> 的随机字符串值。
          默认 <code>alphabet</code> 为 <code>[a-zA-Z\d _]</code>。 <br/>
          默认 <code>maxWordLength</code> 为 <code>15</code>。 <br/><br/>
          示例：
          <code-block lang="text">"2:abc" -> [
    "a", "b", "c",
    "aa", "bb", "cc",
    "ab", "bc", "ac",
    "ba", "cb", "ca"
]</code-block></td>
    </tr>
    <tr>
      <td><code>EnumGen</code></td>
      <td><code>"Enum.Const1,Enum.Const2,..."</code></td>
      <td>从指定的枚举值列表中生成随机值。 <br/><br/>
          示例：
          <code-block lang="text">"Enum.Const1,Enum.Const2" -> [
    Enum.Const1, 
    Enum.Const2
]</code-block></td>
    </tr>
    <tr>
      <td><code>BooleanGen</code></td>
      <td><code>""</code></td>
      <td>生成 <code>true</code> 和 <code>false</code> 值。不需要特定的配置字符串。 <br/><br/>
          示例：
          <code>"" -&gt; [true, false]</code></td>
    </tr>
    <tr>
      <td><code>DoubleGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td>生成从 <code>start</code> 到 <code>end</code> 的 <code>Double</code> 值，按 <code>step</code> 递增。 <br/><br/> 
          默认 <code>step</code> 值为 <code>(end - start)/100</code>。 <br/><br/> 
          如果配置字符串为空，则生成从 <code>Int.MIN_VALUE</code> 到 <code>Int.MAX_VALUE</code> 且 <code>step = 0.1</code> 的值。 <br/><br/>
          示例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>FloatGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td>与 <code>DoubleGen</code> 相同，但值转换为 <code>Float</code>。 <br/><br/>
          示例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>LongGen</code></td>
      <td><code>"min:max"</code></td>
      <td>与 <code>IntGen</code> 相同，但值转换为 <code>Long</code>。 <br/><br/>
          示例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ShortGen</code></td>
      <td><code>"min:max"</code></td>
      <td>生成 <code>min</code> 和 <code>max</code> 之间（包含首尾）的 <code>Short</code> 值。 <br/><br/>
          如果配置字符串为空，则使用从 <code>-32768</code> 到 <code>32767</code> 的完整短整数范围。 <br/><br/>
          示例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ByteGen</code></td>
      <td><code>"min:max"</code></td>
      <td>生成 <code>min</code> 和 <code>max</code> 之间（包含首尾）的 <code>Byte</code> 值。 <br/><br/>
          如果配置字符串为空，则使用从 <code>-128</code> 到 <code>127</code> 的完整字节范围。 <br/><br/>
          示例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ThreadIdGen</code></td>
      <td><code>""</code></td>
      <td>返回当前线程的 ID 编号。不需要特定的配置字符串。 <br/><br/>
          示例：
          <code>"" -&gt; [1, 2]</code></td>
    </tr>
</table>

## 下一步

了解如何在 Lincheck 中[将某些操作限制在单个线程](lincheck-operation-execution-options.md)。

## 另请参阅

* [检查非阻塞进度保证](lincheck-progress-guarantees.md)
* [定义算法的顺序规范](lincheck-results-validation.md)