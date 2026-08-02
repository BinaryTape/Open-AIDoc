<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 協同程式基礎)

為了建立能同時執行多個任務的應用程式（這種概念稱為並行 (concurrency)），Kotlin 使用了 _協同程式 (coroutines)_。協同程式是一種可暫停的計算，讓你能以清晰、順序化的風格撰寫並行程式碼。協同程式可以與其他協同程式並行執行，且可能以平行 (parallel) 方式運作。

在 JVM 與 Kotlin/Native 中，所有並行程式碼（例如協同程式）都執行在由作業系統管理的 _執行緒 (threads)_ 上。協同程式可以暫停執行，而不是阻塞執行緒。這允許一個協同程式在等待資料到達時暫停，而另一個協同程式在同一個執行緒上執行，確保有效的資源利用。

![比較平行與並行執行緒](parallelism-and-concurrency.svg){width="700"}

若要了解更多關於協同程式與執行緒之間差異的資訊，請參閱[比較協同程式與 JVM 執行緒](#comparing-coroutines-and-jvm-threads)。

## 暫停函式

協同程式最基本的建構要素是 _暫停函式 (suspending function)_。它允許執行中的操作暫停並在稍後恢復，而不會影響程式碼的結構。

要宣告一個暫停函式，請使用 `suspend` 關鍵字：

```kotlin
suspend fun greet() {
    println("Hello world from a suspending function")
}
```

你只能從另一個暫停函式中呼叫暫停函式。要在 Kotlin 應用程式的入口點呼叫暫停函式，請將 `main()` 函式標記為 `suspend` 關鍵字：

```kotlin
suspend fun main() {
    showUserInfo()
}

suspend fun showUserInfo() {
    println("Loading user...")
    greet()
    println("User: John Smith")
}

suspend fun greet() {
    println("Hello world from a suspending function")
}
```
{kotlin-runnable="true"}

這個範例尚未利用並行，但透過使用 `suspend` 關鍵字標記函式，你便能讓它們呼叫其他暫停函式並在內部執行並行程式碼。

雖然 `suspend` 關鍵字是 Kotlin 核心語言的一部分，但大多數協同程式功能都是透過 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 程式庫提供的。

## 將 kotlinx.coroutines 程式庫加入你的專案

要將 `kotlinx.coroutines` 程式庫包含在你的專案中，請根據你的建置工具新增對應的相依性配置：

<tabs group="build-tool">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
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
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
}
```
</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlinx</groupId>
            <artifactId>kotlinx-coroutines-core</artifactId>
            <version>%coroutinesVersion%</version>
        </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 建立你的第一個協同程式

> 此頁面中的範例在協同程式建構器函式 `CoroutineScope.launch()` 與 `CoroutineScope.async()` 中使用了明確的 `this` 表達式。
> 這些協同程式建構器是 `CoroutineScope` 上的 [擴充函式](extensions.md)，而 `this` 表達式指的是作為接收者 (receiver) 的當前 `CoroutineScope`。
>
> 如需實際範例，請參閱[從協同程式作用域中提取協同程式建構器](#extract-coroutine-builders-from-the-coroutine-scope)。
>
{style="note"}

要在 Kotlin 中建立協同程式，你需要以下要素：

* 一個 [暫停函式](#suspending-functions)。
* 一個供其執行的 [協同程式作用域 (coroutine scope)](#coroutine-scope-and-structured-concurrency)，例如在 `withContext()` 函式內部。
* 一個像 `CoroutineScope.launch()` 的 [協同程式建構器](#coroutine-builder-functions) 來啟動它。
* 一個 [分派器 (dispatcher)](#coroutine-dispatchers) 來控制它使用哪些執行緒。

讓我們來看一個在多執行緒環境中使用多個協同程式的範例：

1. 匯入 `kotlinx.coroutines` 程式庫：

    ```kotlin
    import kotlinx.coroutines.*
    ```

2. 使用 `suspend` 關鍵字標記可以暫停與恢復的函式：

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
    }
    
    suspend fun main() {}
    ```

    > 雖然在某些專案中可以將 `main()` 函式標記為 `suspend`，但在與現有程式碼整合或使用框架時可能無法這樣做。
    > 在這種情況下，請查看框架的文件，了解它是否支援呼叫暫停函式。
    > 如果不支援，請使用 [`runBlocking()`](#runblocking) 透過阻塞當前執行緒來呼叫它們。
    > 
    {style="note"}

3. 加入 [`delay()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html#) 函式來模擬暫停任務，例如獲取資料或寫入資料庫：

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        delay(1000L)
    }
   ```

    <!-- > 使用 Kotlin 標準程式庫中的 [`kotlin.time.Duration`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/) 來表示時長，例如 `delay(1.seconds)`，而不是使用毫秒。
    >
    {style="tip"} -->

4. 使用 [`withContext(Dispatchers.Default)`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) 為在共享執行緒池上執行的多執行緒並行程式碼定義一個入口點：

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) {
            // 在此處加入協同程式建構器
        }
    }
    ```

   > 暫停函式 `withContext()` 通常用於 [內容切換](coroutine-context-and-dispatchers.md#jumping-between-threads)，但在這個範例中，
   > 它也為並行程式碼定義了一個非阻塞的入口點。
   > 它使用 [`Dispatchers.Default` 分派器](#coroutine-dispatchers) 在共享執行緒池上執行程式碼以進行多執行緒執行。
   > 預設情況下，此執行緒池最多使用與執行時可用 CPU 核心數相同的執行緒，最少為兩個。
   > 
   > 在 `withContext()` 區塊內啟動的協同程式共用同一個協同程式作用域，這確保了 [結構化並行](#coroutine-scope-and-structured-concurrency)。
   > 
   {style="note"}

5. 使用 [協同程式建構器函式](#coroutine-builder-functions)（如 [`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)）來啟動協同程式：

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) { // this: CoroutineScope
            // 使用 CoroutineScope.launch() 在作用域內啟動協同程式
            this.launch { greet() }
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```

6. 結合這些部分，在共享執行緒池上同時執行多個協同程式：

    ```kotlin
    // 匯入協同程式程式庫
    import kotlinx.coroutines.*

    // 匯入 kotlin.time.Duration 以秒為單位表示時長
    import kotlin.time.Duration.Companion.seconds

    // 定義一個暫停函式
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        // 暫停 1 秒並釋放執行緒
        delay(1.seconds) 
        // 此處的 delay() 函式模擬了一個暫停 API 呼叫
        // 你可以在此處加入暫停 API 呼叫，例如網路請求
    }

    suspend fun main() {
        // 在共享執行緒池上執行此區塊內的程式碼
        withContext(Dispatchers.Default) { // this: CoroutineScope
            this.launch() {
                greet()
            }
   
            // 啟動另一個協同程式
            this.launch() {
                println("The CoroutineScope.launch() on the thread: ${Thread.currentThread().name}")
                delay(1.seconds)
                // 此處的 delay 函式模擬了一個暫停 API 呼叫
                // 你可以在此處加入暫停 API 呼叫，例如網路請求
            }
    
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```
    {kotlin-runnable="true"}

嘗試多次執行此範例。 
你可能會注意到每次執行程式時，輸出順序和執行緒名稱都可能發生變化，因為作業系統決定了執行緒何時執行。

> 你可以在程式碼輸出中的執行緒名稱旁顯示協同程式名稱，以獲得額外資訊。
> 為此，請在你的建置工具或 IDE 執行配置中傳遞 `-Dkotlinx.coroutines.debug` VM 選項。
>
> 請參閱[偵錯協同程式](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/topics/debugging.md)以獲取更多資訊。
>
{style="tip"}

## 協同程式作用域與結構化並行

當你在應用程式中執行許多協同程式時，你需要一種將它們作為群組管理的方法。Kotlin 協同程式依賴一個稱為 _結構化並行 (structured concurrency)_ 的原則來提供這種結構。

根據這個原則，協同程式會形成一個父項與子項任務的樹狀階層結構，並具有連結的生命週期。協同程式的生命週期是從其建立到完成、失敗或取消的一系列狀態。

父項協同程式會等待其所有子項完成後才結束。如果父項協同程式失敗或被取消，其所有子項協同程式也會被遞迴取消。保持協同程式以此方式連結，可以讓取消和錯誤處理變得可預測且安全。

為了維持結構化並行，新的協同程式只能在定義並管理其生命週期的 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 中啟動。`CoroutineScope` 包含 _協同程式上下文 (coroutine context)_，其定義了分派器與其他執行屬性。當你在另一個協同程式內部啟動協同程式時，它會自動成為其父項作用域的子項。

在 `CoroutineScope` 上呼叫 [協同程式建構器函式](#coroutine-builder-functions)（例如 `CoroutineScope.launch()`）會啟動一個與該作用域相關聯的協同程式的子項。在建構器的區塊內，[接收者 (receiver)](lambdas.md#function-literals-with-receiver) 是一個巢狀的 `CoroutineScope`，因此你在該處啟動的任何協同程式都會成為其子項。

### 使用 `coroutineScope()` 函式建立協同程式作用域

要使用當前的協同程式上下文建立一個新的協同程式作用域，請使用
[`coroutineScope()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html) 函式。
此函式會建立協同程式子樹的根。
它是該區塊內啟動的協同程式的直接父項，也是它們啟動的任何協同程式的間接父項。
`coroutineScope()` 會執行該暫停區塊，並等待該區塊及其內部啟動的所有協同程式完成。

這是一個範例：

```kotlin
// 匯入 kotlin.time.Duration 以秒為單位表示時長
import kotlin.time.Duration.Companion.seconds

import kotlinx.coroutines.*

// 如果協同程式上下文未指定分派器，
// CoroutineScope.launch() 會使用 Dispatchers.Default
//sampleStart
suspend fun main() {
    // 協同程式子樹的根
    coroutineScope { // this: CoroutineScope
        this.launch {
            this.launch {
                delay(2.seconds)
                println("Child of the enclosing coroutine completed")
            }
            println("Child coroutine 1 completed")
        }
        this.launch {
            delay(1.seconds)
            println("Child coroutine 2 completed")
        }
    }
    // 僅在 coroutineScope 中的所有子項都完成後執行
    println("Coroutine scope completed")
}
//sampleEnd
```
{kotlin-runnable="true"}

由於此範例中未指定 [分派器](#coroutine-dispatchers)，因此 `coroutineScope()` 區塊中的 `CoroutineScope.launch()` 建構器函式會繼承當前的上下文。如果該上下文沒有指定的分派器，`CoroutineScope.launch()` 會使用 `Dispatchers.Default`，它在共享執行緒池上執行。

### 從協同程式作用域中提取協同程式建構器

在某些情況下，你可能希望將協同程式建構器呼叫（例如 [`CoroutineScope.launch()`](#coroutinescope-launch)）提取到個別的函式中。

請考慮以下範例：

```kotlin
suspend fun main() {
    coroutineScope { // this: CoroutineScope
        // 呼叫 CoroutineScope.launch()，其中 CoroutineScope 是接收者
        this.launch { println("1") }
        this.launch { println("2") }
    } 
}
```

> 你也可以省略明確的 `this` 表達式，直接寫成 `launch`。
> 這些範例使用明確的 `this` 表達式，是為了強調它是 `CoroutineScope` 上的擴充函式。
>
> 關於 Kotlin 中具有接收者的 Lambda 如何運作的更多資訊，請參閱[具有接收者的函式常值](lambdas.md#function-literals-with-receiver)。
>
{style="tip"}

`coroutineScope()` 函式接受一個具有 `CoroutineScope` 接收者的 Lambda。在該 Lambda 內部，隱含接收者是一個 `CoroutineScope`，因此像 `CoroutineScope.launch()` 與 [`CoroutineScope.async()`](#coroutinescope-async) 這樣的建構器函式會被解析為該接收者上的 [擴充函式](extensions.md#extension-functions) 上。

要將協同程式建構器提取到另一個函式中，該函式必須宣告一個 `CoroutineScope` 接收者，否則會發生編譯錯誤：

```kotlin
import kotlinx.coroutines.*
//sampleStart
suspend fun main() {
    coroutineScope {
        launchAll()
    }
}

fun CoroutineScope.launchAll() { // this: CoroutineScope
    // 在 CoroutineScope 上呼叫 .launch()
    this.launch { println("1") }
    this.launch { println("2") } 
}
//sampleEnd
/* -- 呼叫 launch 而未將 CoroutineScope 宣告為接收者會導致編譯錯誤 --

fun launchAll() {
    // 編譯錯誤：this 未定義
    this.launch { println("1") }
    this.launch { println("2") }
}
 */
```
{kotlin-runnable="true"}

在執行此範例時，`launchAll()` 函式不需要 `suspend` 關鍵字，因為它僅在當前的 `CoroutineScope` 中啟動協同程式並立即返回。僅在函式需要在返回前暫停與恢復時，才將其標記為 `suspend`。

## 協同程式建構器函式

協同程式建構器函式是一個接受 `suspend` [Lambda](lambdas.md) 的函式，該 Lambda 定義了要執行的協同程式。這裡有一些範例：

* [`CoroutineScope.launch()`](#coroutinescope-launch)
* [`CoroutineScope.async()`](#coroutinescope-async)
* [`runBlocking()`](#runblocking)
* [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html)
* [`coroutineScope()`](#create-a-coroutine-scope-with-the-coroutinescope-function)

協同程式建構器函式需要一個 `CoroutineScope` 才能執行。這可以是現有的作用域，也可以是使用 `coroutineScope()`、[`runBlocking()`](#runblocking) 或 [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#) 等輔助函式建立的作用域。每個建構器都定義了協同程式如何啟動以及你如何與其結果進行互動。

### `CoroutineScope.launch()`

[`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html#) 協同程式建構器函式是 `CoroutineScope` 上的擴充函式。它在現有的 [協同程式作用域](#coroutine-scope-and-structured-concurrency) 內啟動一個新的協同程式，且不會阻塞作用域的其餘部分。

當不需要結果或你不希望等待結果時，請使用 `CoroutineScope.launch()` 與其他工作一起並行執行任務：

```kotlin
// 匯入 kotlin.time.Duration 以毫秒為單位表示時長
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        performBackgroundWork()
    }
}

//sampleStart
suspend fun performBackgroundWork() = coroutineScope { // this: CoroutineScope
    // 啟動一個協同程式，該協同程式執行時不會阻塞作用域
    this.launch {
        // 暫停以模擬背景工作
        delay(100.milliseconds)
        println("Sending notification in background")
    }

    // 主協同程式繼續執行，而前一個協同程式正在暫停中
    println("Scope continues")
}
//sampleEnd
```
{kotlin-runnable="true"}

執行此範例後，你可以看到 `main()` 函式並未被 `CoroutineScope.launch()` 阻塞，並在協同程式於背景運作時繼續執行其他程式碼。

> `CoroutineScope.launch()` 函式會回傳一個 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 控制代碼。
> 使用此控制代碼可等待已啟動的協同程式完成。
> 若要了解更多資訊，請參閱[取消與逾時](coroutines-cancellation.md#cancel-coroutines)。
> 
{style="tip"}

### `CoroutineScope.async()`

[`CoroutineScope.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 協同程式建構器函式是 `CoroutineScope` 上的擴充函式。它在現有的 [協同程式作用域](#coroutine-scope-and-structured-concurrency) 內啟動一個並行計算，並回傳一個代表最終結果的 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/) 控制代碼。使用 `.await()` 函式來暫停程式碼，直到結果就緒為止：

```kotlin
// 匯入 kotlin.time.Duration 以毫秒為單位表示時長
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    // 開始下載第一個頁面
    val firstPage = this.async {
        delay(50.milliseconds)
        "First page"
    }

    // 開始平行下載第二個頁面
    val secondPage = this.async {
        delay(100.milliseconds)
        "Second page"
    }

    // 等待兩個結果並進行比較
    val pagesAreEqual = firstPage.await() == secondPage.await()
    println("Pages are equal: $pagesAreEqual")
}
//sampleEnd
```
{kotlin-runnable="true"}

### `runBlocking()`

[`runBlocking()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) 協同程式建構器函式會建立一個協同程式作用域，並阻塞當前 [執行緒](#comparing-coroutines-and-jvm-threads)，直到該作用域內啟動的協同程式完成。

僅在沒有其他選擇從非暫停程式碼呼叫暫停程式碼時，才使用 `runBlocking()`：

```kotlin
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.*

// 你無法更改的第三方介面
interface Repository {
    fun readItem(): Int
}

object MyRepository : Repository {
    override fun readItem(): Int {
        // 橋接到一個暫停函式
        return runBlocking {
            myReadItem()
        }
    }
}

suspend fun myReadItem(): Int {
    delay(100.milliseconds)
    return 4
}
```

## 協同程式分派器

一個 [_協同程式分派器 (coroutine dispatcher)_](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/#) 控制協同程式執行時使用哪個執行緒或執行緒池。協同程式並不總是繫結於單一執行緒。根據分派器的不同，它們可以在一個執行緒上暫停並在另一個執行緒上恢復。這讓你可以同時執行許多協同程式，而無需為每個協同程式分配個別的執行緒。

> 儘管協同程式可以在不同的執行緒上暫停與恢復，
> 但在協同程式暫停前寫入的值，保證在協同程式恢復時仍然可以在同一個協同程式中使用。
>
{style="tip"}

分派器與 [協同程式作用域](#coroutine-scope-and-structured-concurrency) 配合運作，以定義協同程式何時執行以及在何處執行。雖然協同程式作用域控制協同程式的生命週期，但分派器控制使用哪些執行緒進行執行。

> 你不必為每個協同程式都指定分派器。
> 預設情況下，協同程式會從其父項作用域繼承分派器。
> 你可以指定分派器，讓協同程式在不同的上下文中執行。
> 
> 如果協同程式上下文中未包含分派器，協同程式建構器會使用 `Dispatchers.Default`。
>
{style="note"}

`kotlinx.coroutines` 程式庫包含了針對不同使用案例的不同分派器。例如，[`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 在共享執行緒池上執行協同程式，在背景執行工作，與主執行緒分離。這使其成為資料處理等 CPU 密集型操作的理想選擇。

要為 `CoroutineScope.launch()` 等協同程式建構器指定分派器，請將其作為引數傳遞：

```kotlin
suspend fun runWithDispatcher() = coroutineScope { // this: CoroutineScope
    this.launch(Dispatchers.Default) {
        println("Running on ${Thread.currentThread().name}")
    }
}
```

或者，你可以使用 `withContext()` 區塊來讓其中的所有程式碼在指定的分派器上執行：

```kotlin
// 匯入 kotlin.time.Duration 以毫秒為單位表示時長
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    println("Running withContext block on ${Thread.currentThread().name}")

    val one = this.async {
        println("First calculation starting on ${Thread.currentThread().name}")
        val sum = (1L..500_000L).sum()
        delay(200L)
        println("First calculation done on ${Thread.currentThread().name}")
        sum
    }

    val two = this.async {
        println("Second calculation starting on ${Thread.currentThread().name}")
        val sum = (500_001L..1_000_000L).sum()
        println("Second calculation done on ${Thread.currentThread().name}")
        sum
    }

    // 等待兩個計算並印出結果
    println("Combined total: ${one.await() + two.await()}")
}
//sampleEnd
```
{kotlin-runnable="true"}

若要了解更多關於協同程式分派器及其用途的資訊，包括 [`Dispatchers.IO`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html) 和 [`Dispatchers.Main`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html) 等其他分派器，請參閱[協同程式上下文與分派器](coroutine-context-and-dispatchers.md)。

## 比較協同程式與 JVM 執行緒

雖然協同程式是可暫停的計算，且能像 JVM 上的執行緒一樣並行執行程式碼，但它們在底層的運作方式不同。

_執行緒 (thread)_ 由作業系統管理。執行緒可以在多個 CPU 核心上平行執行任務，代表了 JVM 上並行的標準方法。當你建立一個執行緒時，作業系統會為其堆疊分配記憶體，並使用核心在執行緒之間進行切換。這使得執行緒功能強大，但也耗費資源。每個執行緒通常需要幾 MB 的記憶體，且通常 JVM 同時只能處理幾千個執行緒。

另一方面，協同程式並不繫結於特定的執行緒。它可以在一個執行緒上暫停並在另一個執行緒上恢復，因此許多協同程式可以共用同一個執行緒池。當協同程式暫停時，執行緒不會被阻塞，並能自由執行其他任務。這使得協同程式比執行緒輕量得多，並允許在一個程序中執行數百萬個協同程式而不會耗盡系統資源。

![比較協同程式與執行緒](coroutines-and-threads.svg){width="700"}

讓我們來看一個範例，其中有 50,000 個協同程式，每個都等待五秒，然後印出一個點 (`.`)：

```kotlin
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 啟動 50,000 個協同程式，每個都等待五秒，然後印出一個點
        printPeriods()
    }
}

//sampleStart
suspend fun printPeriods() = coroutineScope { // this: CoroutineScope
    // 啟動 50,000 個協同程式，每個都等待五秒，然後印出一個點
    repeat(50_000) {
        this.launch {
            delay(5.seconds)
            print(".")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

現在讓我們來看使用 JVM 執行緒的相同範例：

```kotlin
import kotlin.concurrent.thread

fun main() {
    repeat(50_000) {
        thread {
            Thread.sleep(5000L)
            print(".")
        }
    }
}
```
{kotlin-runnable="true" validate="false"}

執行這個版本會消耗更多記憶體，因為每個執行緒都需要自己的記憶體堆疊。對於 50,000 個執行緒，這可能高達 100 GB，而相同數量的協同程式大約僅需 500 MB。

根據你的作業系統、JDK 版本與設定，JVM 執行緒版本可能會丟出記憶體不足錯誤 (out-of-memory error)，或者為了避免同時執行過多執行緒而減慢執行緒建立的速度。

## 下一步

* 在[組合暫停函式](composing-suspending-functions.md)中探索更多關於結合暫停函式的資訊。
* 在[取消與逾時](coroutines-cancellation.md)中了解如何取消協同程式並處理逾時。
* 在[協同程式上下文與分派器](coroutine-context-and-dispatchers.md)中深入研究協同程式的執行與執行緒管理。
* 了解如何在[非同步流](coroutines-flow.md)中回傳多個非同步計算的值。