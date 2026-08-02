[//]: # (title: 設定測試策略)
[//]: # (description: 了解 Lincheck 為模型檢查和壓力測試提供的不同選項。)

Lincheck 支援測試策略的各種設定選項，包括場景產生、停滯執行偵測、驗證等。

## 如何啟用選項

若要為測試策略啟用選項，請在策略類別中進行設定：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
    .iterations(100) // 指定產生的場景數量
    .check(this::class)
```

## 場景最小化

預設情況下，Lincheck 會透過移除不改變測試行為的操作，嘗試將失敗的場景最小化。

將 `minimizeFailedScenario` 選項設定為 `false` 以查看完整的失敗場景。

<compare first-title="完整" second-title="最小化">
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

## 場景產生

| 選項 | 預設值 | 描述 |
|---------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `iterations`              | `100`         | 產生的並行場景數量。 |
| `invocationsPerIteration` | `10_000`      | 每個並行場景的調用次數。 |
| `threads`                 | `2`           | 每個場景中的執行緒數量。 |
| `actorsBefore`            | `5`           | 在場景並行部分之前調用的操作數量。 |
| `actorsPerThread`         | `5`           | 場景並行部分中每個執行緒的操作數量。 |
| `actorsAfter`             | `5`           | 在場景並行部分之後調用的操作數量。 |
| `customScenarios`         | –             | [自訂並行場景](#defining-a-custom-scenario)列表。自訂場景會在隨機產生的場景之前執行。 |

### 定義自訂場景

Lincheck 使用[領域特定語言](https://kotlinlang.org/docs/type-safe-builders.html)來定義自訂場景：

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

每個場景由三個可選部分組成：

* `initial` – 並行部分之前執行的操作。
* `parallel` – 執行緒定義。使用 `thread` 區塊定義執行緒。並行部分可能包含多個 `thread` 區塊。
* `post` – 並行部分之後執行的操作。

操作是使用 `actor(function, arg1, arg2, ...)` 函式定義的。單個區塊內的操作是按順序執行的。

## 停滯執行偵測

<table>
<tr><td>選項</td><td>預設值</td><td>描述</td></tr>
<tr>
    <td><code>timeoutMs</code></td>
    <td><code>3000</code></td>
    <td>調用逾時（以毫秒為單位），超過此時間後 Lincheck 將回報停滯執行。</td></tr>
<tr>
    <td><code>loopBound</code></td>
    <td><code>50</code></td>
    <td>Lincheck 回報停滯執行之前的迴圈反覆運算次數。<br/>
        如果 Lincheck 對長迴圈誤報停滯執行，請增加 <code>loopBound</code> 的值。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
<tr>
    <td><code>recursionBound</code></td>
    <td><code>20</code></td>
    <td>Lincheck 回報停滯執行之前的遞迴呼叫次數。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 的值應小於 <code>loopBound</code>。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
</table>

## 迴圈中的執行緒切換

<table><tr><td>選項</td><td>預設值</td><td>描述</td></tr>
<tr>
    <td><code>loopIterationsBeforeThreadSwitch</code></td>
    <td><code>10</code></td>
    <td>執行緒在嘗試切換到另一個執行緒之前可以執行的迴圈反覆運算次數。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 的值應小於 
        <a href="#stalled-execution-detection"><code>loopBound</code></a>。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
</table>

## 驗證

<table>
<tr><td>選項</td><td>預設值</td><td>描述</td></tr>
<tr>
    <td><code>verifierClass</code></td>
    <td><code>LinearizabilityVerifier</code></td>
    <td>在 <a href="lincheck-results-validation.md#verification-models">驗證過程</a> 中使用的驗證器類別：
        <list>
            <li><code>LinearizabilityVerifier</code></li>
            <li><code>SerializabilityVerifier</code></li>
            <li><code>QuiescentConsistencyVerifier</code></li>
        </list></td></tr>
<tr>
    <td><code>sequentialSpecification</code></td>
    <td>與受測資料結構相同。</td>
    <td>受測資料結構的循序版本。此結構用於
        <a href="lincheck-results-validation.md">驗證過程</a>。</td>
</tr>
</table>

## 進度保證

<table><tr><td>選項</td><td>預設值</td><td>描述</td></tr>
<tr>
    <td><code>checkObstructionFreedom</code></td>
    <td><code>false</code></td>
    <td>將此選項設定為 <code>true</code> 以驗證資料結構操作的 <a href="lincheck-progress-guarantees.md">無障礙 (obstruction-freedom) 保證</a>。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
</table>

## 程式庫分析

<table>
<tr><td>選項</td><td>預設值</td><td>描述</td></tr>
<tr>
    <td><code>stdLibAnalysisEnabled</code></td>
    <td><code>false</code></td>
    <td>預設情況下，Lincheck 不會驗證標準程式庫操作的行為，並將其視為執行緒安全。將此選項設定為 <code>true</code> 以啟用對標準程式庫函式/類別的分析。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
<tr>
    <td><code>addGuarantee</code></td>
    <td>–</td>
    <td>使用 <code>addGuarantee</code> 選項為執行緒安全或與分析無關的方法 <a href="#defining-a-guarantee">定義保證</a>，以將其從模型檢查中排除。<br/><br/>
        此選項僅適用於 <a href="lincheck-testing-strategies.md#model-checking">模型檢查 (model checking)</a>。</td></tr>
</table>

### 定義保證

若要定義保證，請使用建構子鏈：選擇類別，然後是方法，最後是保證類型。

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

1. 使用 `forClasses` 的其中一個多載版本選擇類別：

   * `forClasses(vararg fullClassNames: String)` — 如果類別的完整名稱存在於 `fullClassNames` 字串中，則比對該類別。
   * `forClasses(vararg classes: KClass<*>)` — 透過參考比對類別。
   * `forClasses(classPredicate: (fullClassName: String) -> Boolean)` — 使用對完整類別名稱的述詞比對類別。

2. 選擇要套用保證的方法：

   * `methods(methodNames: String)` – 如果方法名稱存在於 `methodNames` 字串中，則比對該方法。
   * `methods(methodPredicate: (methodName: String) -> Boolean)` – 使用述詞比對方法。
   * `allMethods()` – 比對所選類別的所有方法。

3. 選擇保證類型：

   * `treatAsAtomic()` — 將每個方法視為原子操作。Lincheck 不會在方法呼叫內部插入切換點，但可能會在呼叫之前或之後添加。

     對已知為執行緒安全的方法使用 `treatAsAtomic()`。
   * `ignore()` — 將方法排除在分析之外。Lincheck 不會在方法呼叫內部、之前或之後插入切換點。

     > 如果方法內部使用了同步原語（例如 `synchronized` 區塊），忽略該方法可能會導致 Lincheck 發生死結。
     >
     {style="warning"}

     對與分析無關的方法（例如日誌記錄或偵錯公用程式）使用 `ignore()`。

## 下一步

了解如何為 Lincheck 執行場景中使用的操作[設定引數產生](lincheck-argument-generation-constraints.md)。

## 延伸閱讀

* [設定操作執行選項](lincheck-operation-execution-options.md)
* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)
* [定義演算法的循序規格](lincheck-results-validation.md)