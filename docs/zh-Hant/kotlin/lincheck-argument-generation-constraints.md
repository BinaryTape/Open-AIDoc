[//]: # (title: 引數產生約束)
[//]: # (description: 了解如何配置 Lincheck 中操作引數的產生。)

為了測試並行資料結構，Lincheck 會將操作隨機放置在不同的執行緒中，並使用隨機引數呼叫它們，藉此產生一組並行情境。

您可以約束操作引數的範圍，以增加發現並行錯誤的機會。例如，如果可能的主鍵值範圍受到限制，hash map 中的並行操作就更有可能存取同一個鍵。這使 Lincheck 能夠更有效地揭示競態條件和其他並行錯誤。

若要限制 Lincheck 中產生的引數值範圍：

1. 使用 `@Param` 註解來宣告引數產生器：

   ```kotlin
   @Param(name = "key", gen = IntGen::class, conf = "1:2")
   class MultiMapTest {
       // 測試
   }
   ```

   * `name` – 引數產生器的名稱。
   * `gen` – 產生器的[型別](#generator-types)。
   * `conf` – 產生器的配置字串。在此，Lincheck 會產生 1 到 2 之間的整數值。

   > Lincheck 為多種值型別提供了產生器。每種型別都使用不同的配置字串範本。
   >
   > 請參閱[產生器型別](#generator-types)章節以進一步了解。
   { style = "tip" }

2. 為操作參數加上 `@Param` 註解以套用約束：

   ```kotlin
   @Operation
   fun add(@Param(name = "key") key: Int, value: Int) = map.add(key, value)

   @Operation
   fun get(@Param(name = "key") key: Int) = map.get(key)
   ```

設定好約束後，Lincheck 產生的情境將僅使用指定範圍內的值：

```text
| ---------------------------------- |
|    Thread 1     |     Thread 2     |
| ---------------------------------- |
| add(2, 0): void | add(2, -1): void |
| ---------------------------------- |
| get(2): [-1]    |                  |
| ---------------------------------- |
```

## 產生器型別

Lincheck 提供以下引數產生器型別：

<table>
    <tr>
      <th>產生器</th>
      <th>配置範本</th>
      <th>說明</th>
    </tr>
    <tr>
      <td><code>IntGen</code></td>
      <td><code>"min:max"</code></td>
      <td>產生介於 <code>min</code> 與 <code>max</code> 之間（含）的 <code>Int</code> 值。<br/><br/>
          如果配置字串為空，則使用從 <code>Int.MIN_VALUE</code> 到 
          <code>Int.MAX_VALUE</code> 的完整整數範圍。<br/><br/>
          範例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>StringGen</code></td>
      <td><code>"maxWordLength:alphabet"</code><br/><code>"maxWordLength"</code><br/><code>""</code></td>
      <td>從提供的 <code>alphabet</code> 中產生長度最高為 <code>maxWordLength</code> 的隨機字串值。
          預設 <code>alphabet</code> 為 <code>[a-zA-Z\d _]</code>。<br/>
          預設 <code>maxWordLength</code> 為 <code>15</code>。<br/><br/>
          範例：
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
      <td>從指定的列舉值清單中產生隨機值。<br/><br/>
          範例：
          <code-block lang="text">"Enum.Const1,Enum.Const2" -> [
    Enum.Const1, 
    Enum.Const2
]</code-block></td>
    </tr>
    <tr>
      <td><code>BooleanGen</code></td>
      <td><code>""</code></td>
      <td>產生 <code>true</code> 和 <code>false</code> 值。不需要特定的配置字串。<br/><br/>
          範例：
          <code>"" -&gt; [true, false]</code></td>
    </tr>
    <tr>
      <td><code>DoubleGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td>產生從 <code>start</code> 到 <code>end</code> 的 <code>Double</code> 值，並以 
          <code>step</code> 遞增。<br/><br/> 
          預設 <code>step</code> 值為 <code>(end - start)/100</code>。<br/><br/> 
          如果配置字串為空，則產生從 <code>Int.MIN_VALUE</code> 到 
          <code>Int.MAX_VALUE</code> 且 <code>step = 0.1</code> 的值。<br/><br/>
          範例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>FloatGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td>與 <code>DoubleGen</code> 相同，但值會轉換為 <code>Float</code>。<br/><br/>
          範例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>LongGen</code></td>
      <td><code>"min:max"</code></td>
      <td>與 <code>IntGen</code> 相同，但值會轉換為 <code>Long</code>。<br/><br/>
          範例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ShortGen</code></td>
      <td><code>"min:max"</code></td>
      <td>產生介於 <code>min</code> 與 <code>max</code> 之間（含）的 <code>Short</code> 值。<br/><br/>
          如果配置字串為空，則使用從 <code>-32768</code> 
          到 <code>32767</code> 的完整短整數範圍。<br/><br/>
          範例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ByteGen</code></td>
      <td><code>"min:max"</code></td>
      <td>產生介於 <code>min</code> 與 <code>max</code> 之間（含）的 <code>Byte</code> 值。<br/><br/>
          如果配置字串為空，則使用從 <code>-128</code> 到 
          <code>127</code> 的完整位元組範圍。<br/><br/>
          範例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ThreadIdGen</code></td>
      <td><code>""</code></td>
      <td>回傳目前執行緒的 ID 編號。不需要特定的配置字串。<br/><br/>
          範例：
          <code>"" -&gt; [1, 2]</code></td>
    </tr>
</table>

## 下一步

了解如何在 Lincheck 中[將特定操作限制在單一執行緒](lincheck-operation-execution-options.md)。

## 另請參閱

* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)
* [定義演算法的序列化規格](lincheck-results-validation.md)