<!--- TEST_NAME SharedStateGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 共享可變狀態與並行)

協同程式可以使用多執行緒分派器（如 [Dispatchers.Default]）平行執行。這會帶來所有常見的平行處理問題，而主要問題在於**共享可變狀態**存取的同步。
在協同程式領域，此問題的一些解決方案與多執行緒世界中的解決方案相似，但有些則是獨有的。

## 問題所在 {id="the-problem"}

讓我們啟動一百個協同程式，每個都執行一千次相同的操作。
我們還會測量它們的完成時間，以便進一步比較：

```kotlin
suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}
```

我們從一個非常簡單的操作開始，使用多執行緒 [Dispatchers.Default] 遞增一個共享可變變數。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*    

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-01.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-01.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

最後會列印出什麼？極不可能列印出 "Counter = 100000"，因為一百個協同程式在多個執行緒中並行地遞增 `counter`，且沒有進行任何同步。

## Volatiles 無濟於事 {id="volatiles-are-of-no-help"}

有一種常見的誤解，認為將變數設為 `volatile` 就能解決並行問題。讓我們試試看：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
@Volatile // 在 Kotlin 中 `volatile` 是一個註解 
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-02.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-02.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

這段程式碼執行速度較慢，但最後仍然不一定能得到 "Counter = 100000"，因為 volatile 變數保證了對應變數的線性化（這是「原子性」的技術術語）讀取與寫入，但不提供較大操作（在我們的案例中是遞增）的原子性。

## 執行緒安全的資料結構 {id="thread-safe-data-structures"}

適用於執行緒與協同程式的通用解決方案，是使用執行緒安全（又稱同步、線性化或原子性）的資料結構，該結構為需要在共享狀態上執行的對應操作提供所有必要的同步。
在簡單計數器的情況下，我們可以使用 `AtomicInteger` 類別，它具有原子的 `incrementAndGet` 操作：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import java.util.concurrent.atomic.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counter = AtomicInteger()

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter.incrementAndGet()
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-03.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-03.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

這是針對此特定問題最快的解決方案。它適用於普通計數器、集合、隊列和其他標準資料結構及其基本操作。然而，它不容易擴充到複雜狀態或沒有現成執行緒安全實作的複雜操作。

## 細粒度的執行緒限制 {id="thread-confinement-fine-grained"}

「執行緒限制」（Thread confinement）是處理共享可變狀態問題的一種方法，即所有對特定共享狀態的存取都限制在單個執行緒中。它通常用於 UI 應用程式，其中所有 UI 狀態都限制在單個事件分派／應用程式執行緒中。透過使用單執行緒上下文，可以輕鬆地在協同程式中應用此方法。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 將每次遞增限制在單執行緒上下文中
            withContext(counterContext) {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd      
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-04.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-04.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

這段程式碼執行得非常慢，因為它進行了「細粒度」（fine-grained）的執行緒限制。每個單獨的遞增都會使用 [withContext(counterContext)][withContext] 區塊，從多執行緒的 [Dispatchers.Default] 上下文切換到單執行緒上下文。

## 粗粒度的執行緒限制 {id="thread-confinement-coarse-grained"}

在實踐中，執行緒限制通常是以較大的區塊執行的，例如：將更新狀態的大部分商業邏輯都限制在單個執行緒中。下面的範例就是這樣做的，首先在單執行緒上下文中執行每個協同程式。

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    // 將所有內容限制在單執行緒上下文中
    withContext(counterContext) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd     
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-05.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-05.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

現在這段程式碼執行速度快得多，並產生了正確的結果。

## 互斥 {id="mutual-exclusion"}

解決此問題的「互斥」（Mutual exclusion）方案是使用永遠不會平行執行的「關鍵區域」（critical section）來保護共享狀態的所有修改。在阻塞世界中，您通常會使用 `synchronized` 或 `ReentrantLock`。協同程式的替代方案稱為 [Mutex]。它具有 [lock][Mutex.lock] 與 [unlock][Mutex.unlock] 函式來定義關鍵區域。關鍵區別在於 `Mutex.lock()` 是一個掛起函式，它不會阻塞執行緒。

還有 [withLock] 擴充函式，可以方便地表示 `mutex.lock(); try { ... } finally { mutex.unlock() }` 模式：

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 啟動的協同程式數量
    val k = 1000 // 每個協同程式重複執行操作的次數
    val time = measureTimeMillis {
        coroutineScope { // 協同程式的作用域 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val mutex = Mutex()
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 使用鎖保護每次遞增
            mutex.withLock {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-06.kt -->
> 您可以在[此處](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-06.kt)取得完整程式碼。
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

此範例中的鎖定是細粒度的，因此需要付出效能代價。然而，對於某些您絕對必須定期修改某些共享狀態，但該狀態又沒有所屬的自然執行緒的情況下，這是一個不錯的選擇。

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html

<!--- INDEX kotlinx.coroutines.sync -->

[Mutex]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/index.html
[Mutex.lock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/lock.html
[Mutex.unlock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/unlock.html
[withLock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/with-lock.html

<!--- END -->