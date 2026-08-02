[//]: # (title: 協同程式)

應用程式通常需要同時執行多個任務，例如回應使用者輸入、載入資料或更新螢幕。
為了支援這一點，它們依賴並行（concurrency），這讓各個操作可以獨立執行而不會互相阻塞。

並行執行任務最常見的方式是使用執行緒（thread），這是由作業系統管理的獨立執行路徑。
然而，執行緒相對較重，建立過多執行緒可能會導致效能問題。

為了支援高效的並行，Kotlin 使用圍繞著 _協同程式（coroutine）_ 構建的非同步程式設計，這讓您可以使用暫停函式（suspending function），以自然、循序的方式撰寫非同步程式碼。
協同程式是執行緒的輕量級替代方案。
它們可以在不阻塞系統資源的情況下暫停，且對資源友善，使其更適合細粒度的並行作業。

大多數的協同程式功能是由 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 程式庫提供的，
該程式庫包含用於啟動協同程式、處理並行、處理非同步串流等工具。

如果您是初次接觸 Kotlin 中的協同程式，在深入探討更複雜的主題之前，請先從 [協同程式基礎](coroutines-basics.md) 指南開始。
本指南透過簡單的範例介紹了暫停函式、協同程式建立器和結構化並行（structured concurrency）等核心概念：

<a href="coroutines-basics.md"><img src="get-started-coroutines.svg" width="700" alt="協同程式快速入門" style="block"/></a>

> 參考 [KotlinConf app](https://github.com/JetBrains/kotlinconf-app) 範例專案，了解協同程式在實務中如何使用。
> 
{style="tip"}

## 協同程式概念

`kotlinx.coroutines` 程式庫提供了執行並行任務、結構化協同程式執行以及管理共用狀態的核心建構區塊。

### 暫停函式與協同程式建立器

Kotlin 中的協同程式是建立在暫停函式之上的，暫停函式允許程式碼暫停與恢復執行而不阻塞執行緒。
`suspend` 關鍵字用於標記可以非同步執行長時間操作的函式。

要啟動新的協同程式，請使用協同程式建立器，例如 [`.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) 和 [`.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)。
這些建立器是 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 的擴充方法，
它定義了協同程式的生命週期並提供協同程式上下文（coroutine context）。

您可以在 [協同程式基礎](coroutines-basics.md) 和 [組合暫停函式](coroutines-and-channels.md) 中了解更多關於這些建立器的資訊。

### 協同程式上下文與行為

從 `CoroutineScope` 啟動協同程式會建立一個控管其執行的上下文。
像是 `.launch()` 和 `.async()` 的建立器函式會自動建立一組定義協同程式行為的元素：

* [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 介面追蹤協同程式的生命週期並啟用結構化並行。
* [`CoroutineDispatcher`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/) 控制協同程式執行的位置，例如在背景執行緒上或 UI 應用程式的主執行緒上。
* [`CoroutineExceptionHandler`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/) 處理未捕獲的例外。

這些元素與其他可能的元素共同構成了 [_協同程式上下文_](coroutine-context-and-dispatchers.md)，該上下文預設從協同程式的父級繼承。
此上下文形成了一個支援結構化並行的階層結構，相關的協同程式可以被整合地[取消](coroutines-cancellation.md)或成組地[處理例外](exception-handling.md)。

### 非同步流與共用可變狀態

Kotlin 提供了多種讓協同程式進行通訊的方式。
根據您想要在協同程式之間共用值的方式，選擇以下選項之一：

* [`Flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) 僅在協同程式主動收集（collect）它們時才會產生值。
* [`Channel`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/) 允許複數個協同程式傳送與接收值，且每個值只會傳遞給正好一個協同程式。
* [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 會持續地將每個值共用給所有活動中的收集協同程式。

當多個協同程式需要存取或更新相同的資料時，它們會 _共用可變狀態_。
如果沒有協調，這可能會導致資料競爭（race condition），即各項操作以不可預測的方式互相干擾。
為了安全地管理共用可變狀態，請使用 [`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/#) 來封裝共用資料。
接著，您可以從一個協同程式更新它，並從其他協同程式收集其最新值。
<!-- 進一步了解 [共用可變狀態與並行](shared-mutable-state-and-concurrency.md)。 -->

如需更多資訊，請參閱 [非同步流](coroutines-flow.md)、[通道 (Channels)](channels.md) 以及 [協同程式與通道教學](coroutines-and-channels.md)。

## 後續步驟

* 在 [協同程式基礎指南](coroutines-basics.md) 中學習協同程式、暫停函式和建立器的基本原理。
* 在 [組合暫停函式](coroutine-context-and-dispatchers.md) 中探索如何結合暫停函式並建構協同程式管線。
* 了解如何使用 IntelliJ IDEA 中的內建工具來 [偵錯協同程式](debug-coroutines-with-idea.md)。
* 關於 Flow 專有的偵錯，請參閱 [使用 IntelliJ IDEA 偵錯 Kotlin Flow](debug-flow-with-idea.md) 教學。
* 閱讀 [使用協同程式進行 UI 程式設計指南](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md) 以了解基於協同程式的 UI 開發。
* 查看 [在 Android 中使用協同程式的最佳實務](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)。
* 查閱 [`kotlinx.coroutines` API 參考文件](https://kotlinlang.org/api/kotlinx.coroutines/)。