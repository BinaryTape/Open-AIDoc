[//]: # (title: 結果驗證與確認)
[//]: # (description: 了解 Lincheck 如何驗證並行執行的結果。)

在執行為並行資料結構產生的場景後，Lincheck 會根據指定的驗證模型（例如：線性化，linearizability）驗證結果，並可選擇性地根據使用者提供的驗證（validation）函式檢查資料結構的最終狀態。

## 驗證 (Verification)

在驗證過程中，Lincheck 會嘗試尋找並行場景中操作的循序執行順序，使其達成與並行執行相同的結果：

![Lincheck 驗證過程圖解。Lincheck 將並行執行與不同的循序執行進行比較。](verification-process.svg){width=700}

根據 [驗證模型](#verification-models) 的不同，循序執行可能會受到額外的限制。如果沒有符合驗證屬性的循序執行能產生觀察到的結果，Lincheck 就會報告錯誤。

### 循序規格 (Sequential specification)

預設情況下，在驗證過程中，Lincheck 會使用「並行」資料結構的操作來建構循序執行。

您可以指定具有相符操作的循序資料結構，以便：
* 確保並行資料結構提供與循序資料結構相同的結果。

  通常，單執行緒實作比執行緒安全（thread-safe）實作更簡單，因此更容易驗證其正確性（例如：`HashMap` 與 `ConcurrentHashMap`、`LinkedList` 與 `ConcurrentLinkedQueue`）。

  藉由比較結構的兩個版本的執行結果，您可以確保較複雜的並行結構在單執行緒環境中的行為與較簡單的結構相似。

* 在單個測試中同時驗證循序正確性與並行安全性。

![Lincheck 驗證過程圖解。Lincheck 將並行執行與不同的循序執行進行比較。循序執行使用結構的指定循序版本操作。](verification-process-seq.svg){width=700}

若要指定資料結構的循序版本：

1. 實作一個資料結構，其中包含由 Lincheck 測試的所有並行函式的循序版本。
2. 使用 `sequentialSpecification()` 選項指定該資料結構：

   ```kotlin
   @Test
   fun stressTest() = StressOptions()
       .sequentialSpecification(SequentialStructure::class)
       .check(this::class)
   ```

以下是一個 Lincheck 測試範例，使用單執行緒的 `LinkedList` 作為 `ConcurrentLinkedQueue` 的循序規格：

```kotlin
class ConcurrentLinkedQueueTest {
    private val s = ConcurrentLinkedQueue<Int>()

    @Operation
    fun add(value: Int) = s.add(value)

    @Operation
    fun poll(): Int? = s.poll()

    @Test
    fun stressTest() = StressOptions()
        .sequentialSpecification(SequentialQueue::class.java)
        .check(this::class)
}

class SequentialQueue {
    private val s = LinkedList<Int>()

    fun add(x: Int) = s.add(x)
    fun poll(): Int? = s.poll()
}
```

### 驗證模型 (Verification models)

預設情況下，Lincheck 會根據線性化（linearizability）模型來驗證並行執行的結果。
若要套用不同的驗證模型，請使用 `verifierClass` 選項：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .verifierClass(SerializabilityVerifier::class)
   .check(this::class)
```

Lincheck 提供以下驗證器類別：

* `LinearizabilityVerifier` – 預設選項。如果存在一個循序執行，且該執行保留了並行執行中操作間的 ["happens-before"](https://en.wikipedia.org/wiki/Happened-before) 關係，則該並行執行是有效的。
* `QuiescentConsistencyVerifier` – 使用「靜止一致性」（quiescent consistency）模型，其運作方式與線性化模型類似，但「happens-before」約束不適用於標註了 `@QuiescentConsistent` 的操作：

   ```kotlin
   @Operation
   @QuiescentConsistent
   fun someOperation() = { ... }
   ```

   > `QuiescentConsistencyVerifier` 不會追蹤實際的 [靜止點 (quiescent points)](https://bura.brunel.ac.uk/bitstream/2438/9717/1/Fulltext.pdf)。
   > 驗證器可能會漏掉發生在靜止點邊界之外的錯誤。
   >
   {style="note"}

* `SerializabilityVerifier` – 使用「可序列化性」（serializability）模型，如果存在某種循序執行（以任何順序）能導致與並行執行相同的結果，且不論「happens-before」約束為何，則該並行執行即為有效。它可用於並行操作的相對順序並不重要的結構。

#### 比較可序列化性與線性化

為了理解這兩個模型之間的差異，請看一個資料結構如何做到可序列化但非線性化：

1. 考慮以下資料結構：

   ```kotlin
   class ConcurrentQueue {
       private val elements: MutableList<Int> = ArrayList()

       fun put(x: Int) = synchronized(this) {
           elements += x
       }

       fun poll(): Int? = synchronized(this) {
           if (elements.isEmpty()) return null
           elements.shuffle()
           elements.removeAt(0)
       }
   }
   ```

   這個並行結構的行為是不正確的：它像一般佇列一樣儲存元素，但卻隨機傳回它們。

2. 實作一個能正確儲存並傳回元素的佇列循序版本：

   ```kotlin
   class SequentialQueue {
       private val elements: MutableList<Int> = ArrayList()
  
       fun put(x: Int) {
           elements += x
       }
  
       fun poll(): Int? = if (elements.isEmpty()) null else elements.removeAt(0)
   }
   ```

3. 建立一個測試類別並宣告 `put()` 與 `poll()` 操作：

   ```kotlin
   @Param(name = "value", gen = IntGen::class, conf = "1:2")
   class ConcurrentQueueTest {
       private val q = ConcurrentQueue()
  
       @Operation
       fun put(@Param(name = "value") x: Int) = q.put(x)
  
       @Operation
       fun poll(): Int? = q.poll()
   }
   ```

4. 宣告並執行可序列化性測試：

   ```kotlin
   @Test
   fun serializabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 根據可序列化性進行驗證
       .verifier(SerializabilityVerifier::class.java)
       // 指定結構的循序版本
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   該測試應該會成功通過。

5. 宣告並執行線性化測試：

   ```kotlin
   @Test
   fun linearizabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 顯示完整的失敗場景
       .minimizeFailedScenario(false)
       // 指定結構的循序版本
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   測試應該會失敗並顯示以下報告：

   ```text
   | -------------------- |
   | Thread 1  | Thread 2 |
   | -------------------- |
   |           | put(2)   |
   |           | put(1)   |
   | put(3)    |          |
   | poll(): 1 |          |
   | -------------------- |
   ```

6. 分析結果。

   因為可序列化性測試通過，說明存在「某種」`SequentialQueue` 操作的循序順序可以產生 `poll(): 1`，例如：

   ![雙執行緒場景中操作的動畫，重新排序為單執行緒場景。執行緒 2 首先執行，有兩個操作：`put(2)`，然後是 `put(1)`。執行緒 1 接著執行，有兩個操作：`put(3)` 然後是 `poll(): 1`。單執行緒場景的操作順序如下：`put(1)`, `put(2)`, `put(3)`, `poll(): 1`。因為 `put(1)` 現在是第一個操作，`poll()` 正確地傳回值 `1`。](reorder.gif){width=500}

   然而，線性化對操作順序有進一步的限制：如果在並行執行中操作 `A` 在操作 `B` 開始之前就已結束，那麼在循序執行中 `A` 必須在 `B` 之前執行。線性化執行的範例如下：

   ![雙執行緒場景中操作的動畫，重新排序為單執行緒場景。執行緒 1 首先執行，有兩個操作：`put(1)`，然後是 `put(2)`。執行緒 2 接著執行，有兩個操作：`poll(): 1` 然後是 `poll(): 2`。單執行緒場景的操作順序如下：`put(1)`, `put(2)`, `poll(): 1`, `poll(): 2`。所有 `poll()` 操作都傳回正確的值。](reorderLin.gif){width=500}

   由於 Lincheck 在驗證過程中無法重新排序 `put()` 操作，因此找不到符合線性化限制的循序執行。這導致測試失敗。

## 確認 (Validation)

預設情況下，Lincheck 在執行產生的場景後不會確認（validate）並行資料結構的狀態。
若要檢查最終狀態，請在測試類別的確認函式上使用 `@Validate` 註解：

```kotlin
@Validate
fun validate() {
    // 檢查資料結構的某些屬性
    // 如果違反不變量 (invariant)，則拋出例外
    check(size >= 0) { "Size 必須為非負值，但結果為 $size" }
}
```

確認函式應該：
* 不接受任何引數。
* 如果資料結構處於無效狀態，則拋出例外。

## 接下來的內容

* [配置引數產生約束](lincheck-argument-generation-constraints.md)
* [配置操作執行](lincheck-operation-execution-options.md)
* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)