<!--- TEST_NAME DispatcherGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 協同程式上下文與分派器)

協同程式總是在由 Kotlin 標準函式庫中定義的 
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 
型別值所表示的某個上下文中執行。

協同程式上下文是各種元素的集合。主要元素包含我們先前見過的協同程式 [Job]，以及本節涵蓋的分派器。

## 分派器與執行緒 {id="dispatchers-and-threads"}

協同程式上下文包含一個 *協同程式分派器*（參見 [CoroutineDispatcher]），它決定了相應的協同程式使用哪個或哪些執行緒來執行。協同程式分派器可以將協同程式的執行限制在特定執行緒、分派給執行緒池，或是讓它不受限制地執行。

所有協同程式建構器（如 [launch] 和 [async]）都接受一個可選的 
[CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 
參數，可用於為新協同程式明確指定分派器與其他上下文元素。

請嘗試以下範例：

```kotlin
import kotlinx.coroutines.*

//sampleStart
fun main() = runBlocking<Unit> {
    launch { // 父級上下文，main runBlocking 協同程式
        println("main runBlocking      : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Unconfined) { // 未受限制 -- 將在 main 執行緒中工作
        println("Unconfined            : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Default) { // 將被分派到 DefaultDispatcher 
        println("Default               : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(newSingleThreadContext("MyOwnThread")) { // 將獲得自己專屬的新執行緒
        println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-01.kt)取得完整程式碼。
>
{style="note"}

它會產生以下輸出（順序可能不同）：

```text
Unconfined            : I'm working in thread main
Default               : I'm working in thread DefaultDispatcher-worker-1
newSingleThreadContext: I'm working in thread MyOwnThread
main runBlocking      : I'm working in thread main
```

<!--- TEST LINES_START_UNORDERED -->

當 `launch { ... }` 未帶參數使用時，它會從啟動它的 [CoroutineScope] 繼承上下文（從而繼承分派器）。在這種情況下，它繼承了在 `main` 執行緒中執行的主 `runBlocking` 協同程式的上下文。

[Dispatchers.Unconfined] 是一個特殊的分派器，它看起來似乎也在 `main` 執行緒中執行，但事實上這是一種不同的機制，稍後會進行說明。

當作用域中未明確指定其他分派器時，將使用預設分派器。它由 [Dispatchers.Default] 表示，並使用共享的背景執行緒池。
  
[newSingleThreadContext] 會為協同程式建立一個執行緒以供執行。專屬執行緒是非常昂貴的資源。在實際應用程式中，當不再需要時，必須使用 [close][ExecutorCoroutineDispatcher.close] 函式將其釋放，或者將其儲存在頂層變數中並在整個應用程式中重複使用。

## 非受限分派器 vs 受限分派器 {id="unconfined-vs-confined-dispatcher"}
 
[Dispatchers.Unconfined] 協同程式分派器會在呼叫者執行緒中啟動協同程式，但僅持續到第一個暫停點。暫停後，它會在完全由所呼叫的暫停函式決定的執行緒中恢復協同程式。非受限分派器適用於既不消耗 CPU 時間、也不更新受限於特定執行緒的任何共享資料（例如 UI）的協同程式。

另一方面，預設情況下分派器會從外層 [CoroutineScope] 繼承。特別是 [runBlocking] 協同程式的預設分派器受限於調用者執行緒，因此繼承它具有將執行限制在該執行緒並具備可預測的 FIFO 排程的效果。

```kotlin
import kotlinx.coroutines.*

//sampleStart
fun main() = runBlocking<Unit> {
    launch(Dispatchers.Unconfined) { // 未受限制 -- 將在 main 執行緒中工作
        println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
        delay(500)
        println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
    }
    launch { // 父級上下文，main runBlocking 協同程式
        println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
        delay(1000)
        println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-02.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-02.kt)取得完整程式碼。
>
{style="note"}

產生以下輸出：
 
```text
Unconfined      : I'm working in thread main
main runBlocking: I'm working in thread main
Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
main runBlocking: After delay in thread main
```

<!--- TEST LINES_START -->
 
因此，繼承自 `runBlocking {...}` 上下文的協同程式會繼續在 `main` 執行緒中執行，而非受限的協同程式則在 [delay] 函式使用的預設執行器執行緒中恢復執行。

> 非受限分派器是一種進階機制，在某些特定邊緣情況下可能會有所幫助：當協同程式中的某些操作必須立即執行，因而不需要將協同程式分派至稍後執行，或者分派會產生不希望出現的副作用時。非受限分派器不應在一般程式碼中使用。
>
{style="note"}

## 偵錯協同程式與執行緒 {id="debugging-coroutines-and-threads"}

協同程式可以在一個執行緒上暫停，並在另一個執行緒上恢復。如果沒有專門的工具，即使使用單執行緒分派器，也很難弄清楚協同程式在做什麼、在哪裡以及何時進行。

### 使用 IDEA 進行偵錯 {id="debugging-with-idea"}

Kotlin 外掛程式的協同程式偵錯工具簡化了在 IntelliJ IDEA 中偵錯協同程式的過程。

> 偵錯功能適用於 1.3.8 或更新版本的 `kotlinx-coroutines-core`。
>
{style="note"}

**Debug** 工具視窗包含 **Coroutines** 標籤頁。在此標籤頁中，您可以找到有關目前正在執行和已暫停的協同程式的資訊。這些協同程式會依據其執行的分派器進行分組。

![偵錯協同程式](coroutine-idea-debugging-1.png){width=700}

使用協同程式偵錯工具，您可以：
* 檢查每個協同程式的狀態。
* 查看正在執行與已暫停的協同程式之區域變數和擷取變數的值。
* 查看完整的協同程式建立堆疊，以及協同程式內部的呼叫堆疊。該堆疊包含所有帶有變數值的框架，甚至包含在標準偵錯期間會遺失的框架。
* 取得包含每個協同程式狀態及其堆疊的完整報告。若要取得該報告，請在 **Coroutines** 標籤頁內按一下滑鼠右鍵，然後點擊 **Get Coroutines Dump**。

若要開始協同程式偵錯，您只需設定中斷點並在偵錯模式下執行應用程式。

在[教學](https://kotlinlang.org/docs/tutorials/coroutines/debug-coroutines-with-idea.html)中進一步了解協同程式偵錯。

### 使用記錄檔進行偵錯 {id="debugging-using-logging"}

在沒有協同程式偵錯工具的情況下，偵錯帶有執行緒的應用程式的另一種方法是在每個記錄陳述式中將執行緒名稱列印到記錄檔中。此功能受到記錄架構的普遍支援。在使用協同程式時，單憑執行緒名稱並不能提供太多上下文資訊，因此 `kotlinx.coroutines` 包含了除錯設施以簡化此過程。

使用 `-Dkotlinx.coroutines.debug` JVM 選項執行以下程式碼：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

//sampleStart
fun main() = runBlocking<Unit> {
    val a = async {
        log("I'm computing a piece of the answer")
        6
    }
    val b = async {
        log("I'm computing another piece of the answer")
        7
    }
    log("The answer is ${a.await() * b.await()}")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-03.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-03.kt)取得完整程式碼。
>
{style="note"}

這裡有三個協同程式：`runBlocking` 內部的主協同程式 (#1)，以及計算延遲值 `a` (#2) 和 `b` (#3) 的兩個協同程式。它們都在 `runBlocking` 的上下文中執行，並且受限於 main 執行緒。此程式碼的輸出為：

```text
[main @coroutine#2] I'm computing a piece of the answer
[main @coroutine#3] I'm computing another piece of the answer
[main @coroutine#1] The answer is 42
```

<!--- TEST FLEXIBLE_THREAD -->

`log` 函式會在方括號中列印執行緒名稱，您可以看到它是 `main` 執行緒，並附加了目前正在執行的協同程式識別碼。開啟偵錯模式時，該識別碼會連續指派給所有已建立的協同程式。

> 當 JVM 使用 `-ea` 選項執行時，偵錯模式也會開啟。
> 您可以在 [DEBUG_PROPERTY_NAME] 屬性的文件中閱讀有關偵錯功能的更多資訊。
>
{style="note"}

## 在執行緒之間切換 {id="jumping-between-threads"}

使用 `-Dkotlinx.coroutines.debug` JVM 選項執行以下程式碼（請參閱[偵錯](#debugging-coroutines-and-threads)）：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() {
    newSingleThreadContext("Ctx1").use { ctx1 ->
        newSingleThreadContext("Ctx2").use { ctx2 ->
            runBlocking(ctx1) {
                log("Started in ctx1")
                withContext(ctx2) {
                    log("Working in ctx2")
                }
                log("Back to ctx1")
            }
        }
    }
}
```
<!--- KNIT example-context-04.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-04.kt)取得完整程式碼。
>
{style="note"}

上述範例展示了協同程式使用中的新技術。

第一個技術展示如何使用帶有指定上下文的 [runBlocking]。  
第二個技術涉及呼叫 [withContext]，如果新上下文與現有上下文不同，它可能會暫停目前的協同程式並切換到新上下文。具體來說，如果您指定了不同的 [CoroutineDispatcher]，則需要進行額外的分派：程式碼區塊會在新的分派器上進行排程，一旦完成，執行就會返回到原始分派器。

因此，上述程式碼的輸出為：

```text
[Ctx1 @coroutine#1] Started in ctx1
[Ctx2 @coroutine#1] Working in ctx2
[Ctx1 @coroutine#1] Back to ctx1
```

<!--- TEST -->

上述範例使用 Kotlin 標準函式庫中的 `use` 函式，以便在不再需要時妥善釋放由 [newSingleThreadContext] 建立的執行緒資源。

## 上下文中的 Job {id="job-in-the-context"}

協同程式的 [Job] 是其上下文的一部分，可以使用 `coroutineContext[Job]` 運算式從中擷取：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    println("My job is ${coroutineContext[Job]}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-05.kt)取得完整程式碼。
> 
{style="note"}

在[偵錯模式](#debugging-coroutines-and-threads)下，它會輸出類似以下內容：

```
My job is "coroutine#1":BlockingCoroutine{Active}@6d311334
```

<!--- TEST lines.size == 1 && lines[0].startsWith("My job is \"coroutine#1\":BlockingCoroutine{Active}@") -->

請注意，[CoroutineScope] 中的 [isActive] 只是 `coroutineContext[Job]?.isActive == true` 的便利捷徑。

## 協同程式的子代 {id="children-of-a-coroutine"}

當一個協同程式在另一個協同程式的 [CoroutineScope] 中啟動時，它會透過 [CoroutineScope.coroutineContext] 繼承其上下文，並且新協同程式的 [Job] 會成為父協同程式 Job 的*子代*。當父協同程式被取消時，其所有子代也會被遞迴取消。

然而，這種父子關係可以透過以下兩種方式之一明確覆寫：

1. 啟動協同程式時明確指定了不同的作用域（例如 `GlobalScope.launch`），它不會從父作用域繼承 `Job`。
2. 當傳入另一個 `Job` 物件作為新協同程式的上下文時（如下例所示），它會覆寫父作用域的 `Job`。
   
在這兩種情況下，啟動的協同程式均不繫結至啟動它的作用域，並且獨立運作。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 啟動一個協同程式以處理某種傳入請求
    val request = launch {
        // 它衍生出另外兩個工作
        launch(Job()) { 
            println("job1: I run in my own Job and execute independently!")
            delay(1000)
            println("job1: I am not affected by cancellation of the request")
        }
        // 另一個則繼承父級上下文
        launch {
            delay(100)
            println("job2: I am a child of the request coroutine")
            delay(1000)
            println("job2: I will not execute this line if my parent request is cancelled")
        }
    }
    delay(500)
    request.cancel() // 取消請求的處理
    println("main: Who has survived request cancellation?")
    delay(1000) // 延遲 main 執行緒一秒以觀察結果
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-06.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-06.kt)取得完整程式碼。
>
{style="note"}

此程式碼的輸出為：

```text
job1: I run in my own Job and execute independently!
job2: I am a child of the request coroutine
main: Who has survived request cancellation?
job1: I am not affected by cancellation of the request
```

<!--- TEST -->

## 父級職責 {id="parental-responsibilities"}

父協同程式總是會等待其所有子代完成。父級不必明確追蹤它啟動的所有子代，也不必在最後使用 [Job.join] 來等待它們：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 啟動一個協同程式以處理某種傳入請求
    val request = launch {
        repeat(3) { i -> // 啟動幾個子工作
            launch  {
                delay((i + 1) * 200L) // 變動延遲 200 ms、400 ms、600 ms
                println("Coroutine $i is done")
            }
        }
        println("request: I'm done and I don't explicitly join my children that are still active")
    }
    request.join() // 等待請求完成，包括其所有子代
    println("Now processing of the request is complete")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-07.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-07.kt)取得完整程式碼。
>
{style="note"}

結果將會是：

```text
request: I'm done and I don't explicitly join my children that are still active
Coroutine 0 is done
Coroutine 1 is done
Coroutine 2 is done
Now processing of the request is complete
```

<!--- TEST -->

## 為偵錯命名協同程式 {id="naming-coroutines-for-debugging"}

當協同程式經常輸出記錄，而您只需要關聯來自同一協同程式的記錄項目時，自動指派的識別碼很方便。但是，當協同程式與特定請求的處理繫結或執行某些特定背景工作時，為了偵錯目的最好明確命名它。[CoroutineName] 上下文元素具有與執行緒名稱相同的作用。開啟[偵錯模式](#debugging-coroutines-and-threads)時，它會包含在執行此協同程式的執行緒名稱中。

以下範例示範了此概念：

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking(CoroutineName("main")) {
//sampleStart
    log("Started main coroutine")
    // 執行兩個背景數值計算
    val v1 = async(CoroutineName("v1coroutine")) {
        delay(500)
        log("Computing v1")
        6
    }
    val v2 = async(CoroutineName("v2coroutine")) {
        delay(1000)
        log("Computing v2")
        7
    }
    log("The answer for v1 * v2 = ${v1.await() * v2.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-08.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-08.kt)取得完整程式碼。
>
{style="note"}

使用 `-Dkotlinx.coroutines.debug` JVM 選項產生的輸出類似於：
 
```text
[main @main#1] Started main coroutine
[main @v1coroutine#2] Computing v1
[main @v2coroutine#3] Computing v2
[main @main#1] The answer for v1 * v2 = 42
```

<!--- TEST FLEXIBLE_THREAD -->

## 組合上下文元素 {id="combining-context-elements"}

有時我們需要為協同程式上下文定義多個元素。我們可以使用 `+` 運算子來達成此目的。例如，我們可以同時啟動一個具有明確指定分派器和明確指定名稱的協同程式：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Default + CoroutineName("test")) {
        println("I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-09.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-09.kt)取得完整程式碼。
>
{style="note"}

此程式碼在帶有 `-Dkotlinx.coroutines.debug` JVM 選項下的輸出為：

```text
I'm working in thread DefaultDispatcher-worker-1 @test#2
```

<!--- TEST FLEXIBLE_THREAD -->

## 協同程式作用域 {id="coroutine-scope"}

讓我們將關於上下文、子代和 Job 的知識整合在一起。假設我們的應用程式有一個具有生命週期的物件，但該物件並非協同程式。例如，我們正在編寫一個 Android 應用程式，並在 Android activity 的上下文中啟動各種協同程式以執行非同步操作來擷取與更新資料、執行動畫等。當 activity 被銷毀時，必須取消這些協同程式以避免記憶體洩漏。我們當然可以手動操作上下文和 Job 來繫結 activity 及其協同程式的生命週期，但 `kotlinx.coroutines` 提供了一個將其封裝的抽象概念：[CoroutineScope]。您應該已經熟悉協同程式作用域，因為所有協同程式建構器都被宣告為其擴充。

我們透過建立與 activity 生命週期繫結的 [CoroutineScope] 執行個體來管理協同程式的生命週期。`CoroutineScope` 執行個體可透過 [CoroutineScope()] 或 [MainScope()] 工廠函式建立。前者建立通用作用域，而後者為 UI 應用程式建立作用域，並使用 [Dispatchers.Main] 作為預設分派器：

```kotlin
class Activity {
    private val mainScope = MainScope()
    
    fun destroy() {
        mainScope.cancel()
    }
    // to be continued ...
```

現在，我們可以使用定義好的 `mainScope` 在此 `Activity` 的作用域內啟動協同程式。為了進行示範，我們啟動了十個延遲不同時間的協同程式：

```kotlin
    // class Activity 繼續
    fun doSomething() {
        // 啟動十個協同程式用於示範，每個執行不同的時間
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 變動延遲 200 ms、400 ms、...等
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity 結束
``` 

在我們的 main 函式中，我們建立了 activity，呼叫我們的測試 `doSomething` 函式，並在 500 ms 後銷毀 activity。這會取消所有從 `doSomething` 啟動的協同程式。我們可以觀察到這一點，因為在 activity 銷毀後，即使我們多等一會兒，也不會再列印任何訊息。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

class Activity {
    private val mainScope = CoroutineScope(Dispatchers.Default) // 基於測試目的使用 Default
    
    fun destroy() {
        mainScope.cancel()
    }

    fun doSomething() {
        // 啟動十個協同程式用於示範，每個執行不同的時間
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 變動延遲 200 ms、400 ms、...等
                println("Coroutine $i is done")
            }
        }
    }
} // class Activity 結束

fun main() = runBlocking<Unit> {
//sampleStart
    val activity = Activity()
    activity.doSomething() // 執行測試函式
    println("Launched coroutines")
    delay(500L) // 延遲半秒
    println("Destroying activity!")
    activity.destroy() // 取消所有協同程式
    delay(1000) // 目視確認它們不再運作
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-10.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-10.kt)取得完整程式碼。
>
{style="note"}

此範例的輸出為：

```text
Launched coroutines
Coroutine 0 is done
Coroutine 1 is done
Destroying activity!
```

<!--- TEST -->

如您所見，只有前兩個協同程式列印了訊息，其他協同程式都透過 `Activity.destroy()` 中對 [`mainScope.cancel()`][CoroutineScope.cancel] 的單次呼叫而被取消了。

> 請注意，Android 在所有具備生命週期的實體中都對協同程式作用域提供第一方支援。
> 請參閱[相應文件](https://developer.android.com/topic/libraries/architecture/coroutines#lifecyclescope)。
>
{style="note"}

### 執行緒區域資料 {id="thread-local-data"}

有時能夠將某些執行緒區域資料傳遞給協同程式或在協同程式之間傳遞是很方便的。然而，由於它們未繫結至任何特定執行緒，如果手動進行這項工作，很可能會產生大量的樣板程式碼。

對於 [`ThreadLocal`](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html)，[asContextElement] 擴充函式前來解決這個問題。它建立一個額外的上下文元素，用於保存給定 `ThreadLocal` 的值，並在協同程式每次切換其上下文時將其還原。

很容易透過實際操作來示範：

```kotlin
import kotlinx.coroutines.*

val threadLocal = ThreadLocal<String?>() // 宣告執行緒區域變數

fun main() = runBlocking<Unit> {
//sampleStart
    threadLocal.set("main")
    println("Pre-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    val job = launch(Dispatchers.Default + threadLocal.asContextElement(value = "launch")) {
        println("Launch start, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
        yield()
        println("After yield, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    }
    job.join()
    println("Post-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
//sampleEnd    
}
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-11.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-11.kt)取得完整程式碼。
>
{style="note"}

在此範例中，我們使用 [Dispatchers.Default] 在背景執行緒池中啟動一個新的協同程式，因此它在來自執行緒池的不同執行緒上運作，但無論該協同程式在哪個執行緒上執行，它仍然擁有我們使用 `threadLocal.asContextElement(value = "launch")` 所指定的執行緒區域變數值。因此，其輸出（包含[偵錯](#debugging-coroutines-and-threads)）為：

```text
Pre-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
Launch start, current thread: Thread[DefaultDispatcher-worker-1 @coroutine#2,5,main], thread local value: 'launch'
After yield, current thread: Thread[DefaultDispatcher-worker-2 @coroutine#2,5,main], thread local value: 'launch'
Post-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
```

<!--- TEST FLEXIBLE_THREAD -->

很容易忘記設定對應的上下文元素。如果執行協同程式的執行緒不同，那麼從協同程式存取的執行緒區域變數可能會具有非預期的值。為避免此類情況，建議使用 [ensurePresent] 方法並在不當使用時快速失敗。

`ThreadLocal` 擁有一級支援，並且可以與 `kotlinx.coroutines` 提供的任何原語一起使用。但它有一個關鍵限制：當執行緒區域變數被變更時，新值不會傳播給協同程式呼叫者（因為上下文元素無法追蹤所有 `ThreadLocal` 物件的存取），並且更新後的值會在下一次暫停時遺失。請使用 [withContext] 在協同程式中更新執行緒區域變數的值，詳細資訊請參閱 [asContextElement]。

或者，值可以儲存在可變容器中（例如 `class Counter(var i: Int)`），而該容器本身則儲存在執行緒區域變數中。然而在這種情況下，您需要完全負責同步對此可變容器中變數的潛在並行修改。

對於進階用法，例如與記錄 MDC、交易上下文或內部使用執行緒區域變數傳遞資料的任何其他程式庫整合，請參閱應該實作的 [ThreadContextElement] 介面文件。

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[Dispatchers.Unconfined]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[newSingleThreadContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/new-single-thread-context.html
[ExecutorCoroutineDispatcher.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-executor-coroutine-dispatcher/close.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[DEBUG_PROPERTY_NAME]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-d-e-b-u-g_-p-r-o-p-e-r-t-y_-n-a-m-e.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[isActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html
[CoroutineScope.coroutineContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/coroutine-context.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[CoroutineName]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/index.html
[CoroutineScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope.html
[MainScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[CoroutineScope.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[asContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/as-context-element.html
[ensurePresent]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-present.html
[ThreadContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-thread-context-element/index.html

<!--- END -->