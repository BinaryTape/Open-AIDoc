[//]: # (title: 測試策略)
[//]: # (description: 了解 Lincheck 中模型檢查與壓力測試之間的差異。)

Lincheck 提供兩種測試並行資料結構的策略：模型檢查與壓力測試。

在本文中，你將了解這些策略之間的差異，以及在選擇測試策略時需要注意的事項。

## 模型檢查 (Model checking)

透過模型檢查，Lincheck 會模擬可能的執行緒交錯，並報告那些導致錯誤行為的交錯。

若要使用模型檢查策略來測試資料結構，請使用 `ModelCheckingOptions()` 宣告測試函式：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .check(this::class)
```

當使用模型檢查策略時，Lincheck 會在共享記憶體存取（`read` 和 `write`）點或同步點（例如鎖定的獲取與釋放、`park`/`unpark`、`wait`/`notify` 等）插入明確的執行緒切換指令。

控制執行緒切換使 Lincheck 能夠：

* 確定性地探索程式各種可能的執行排程。
* 提供詳細的執行追蹤。

目前，模型檢查要求 Lincheck 假設執行的 [順序一致性記憶體模型](https://en.wikipedia.org/wiki/Sequential_consistency)。這意味著 Lincheck 不會模擬，也無法捕捉在寬鬆的 [Java 記憶體模型](https://en.wikipedia.org/wiki/Java_memory_model)下與指令重排、記憶體快取行為及其他類似效應相關的錯誤。

<!-- TODO: uncomment after the article is published
> 若要了解更多資訊，請參閱 [模型檢查](lincheck-model-checking.md)。
>
{style=”tip”}
-->

## 壓力測試 (Stress testing)

透過壓力測試，Lincheck 會多次執行每個場景，以增加發現錯誤的機會。

若要使用壓力測試，請使用 `StressOptions()` 宣告測試函式：

```kotlin
@Test
fun stressTest() = StressOptions()
   .check(this::class)
```

與模型檢查不同，Lincheck 不會控制或追蹤執行緒切換。這使得壓力測試速度更快，且不需要 Lincheck 對記憶體模型做任何假設。然而，使用壓力測試時，測試是不可重現的，且 Lincheck 無法提供執行追蹤。

## 選擇策略

選擇策略時，請考慮以下幾點：

<table style="both">
    <tr>
        <td></td>
        <td><b>模型檢查</b></td>
        <td><b>壓力測試</b></td>
    </tr>
    <tr>
        <td><b>速度</b></td>
        <td>較慢。</td>
        <td>較快。</td>
    </tr>
    <tr>
        <td><b>可重現性</b></td>
        <td>如果輸入資料沒有變更，測試會回傳完全相同的結果。</td>
        <td>測試可能會回傳不同的結果，因為執行緒排程可能會因次而異。</td>
    </tr>
    <tr>
        <td><b>假設</b></td>
        <td><list>
            <li>假設順序一致性記憶體模型。</li>
            <li>會錯過由該模型之外的錯誤行為所引起的錯誤。</li>
        </list></td>
        <td><list>
            <li>不對記憶體模型做任何假設。</li>
            <li>有機會捕捉任何錯誤行為，無論其根本原因為何。</li>
        </list></td>
    </tr>
    <tr>
        <td><b>詳細程度</b></td>
        <td>同時報告並行場景以及導致錯誤行為的執行追蹤。</td>
        <td>僅報告並行場景。</td>
    </tr>
    <tr>
        <td><b>標準程式庫涵蓋範圍</b></td>
        <td><list>
            <li>不模擬某些標準程式庫功能的行為，例如弱引用（weak references）。</li>
            <li>會錯過由這些功能引起的錯誤。</li>
        </list></td>
        <td>有機會捕捉因使用任何功能而引起的錯誤。</td>
    </tr>
</table>

## 下一步

了解如何透過自訂場景產生、啟用停滯執行偵測以及為程式庫提供執行緒安全保證來[配置測試策略](lincheck-testing-strategies-options.md)。

## 延伸閱讀

* [產生操作引數](lincheck-argument-generation-constraints.md)
* [配置操作執行選項](lincheck-operation-execution-options.md)
* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)
* [定義演算法的順序規格](lincheck-results-validation.md)