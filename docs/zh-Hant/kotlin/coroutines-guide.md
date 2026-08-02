<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 協同程式指南)

Kotlin 在其標準函式庫中僅提供最少量的底層 API，以便讓其他程式庫能夠利用協同程式。與許多具有類似功能的其他語言不同，`async` 和 `await` 在 Kotlin 中並非關鍵字，甚至不屬於其標準函式庫的一部分。此外，Kotlin 的暫停函式 (suspending function) 概念為非同步作業提供了比 future 和 promise 更安全且更不易出錯的抽象化。

`kotlinx.coroutines` 是由 JetBrains 開發、功能豐富的協同程式庫。它包含許多本指南將介紹的高階協同程式原語，包括 `launch`、`async` 等。

這是一份關於 `kotlinx.coroutines` 核心特性的指南，透過一系列範例並劃分為不同的主題進行說明。

為了使用協同程式並操作本指南中的範例，您需要按照[專案 README 中所述](https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md#using-in-your-projects)新增對 `kotlinx-coroutines-core` 模組的相依性。

## 目錄

* [協同程式基礎](coroutines-basics.md)
* [教學：協同程式與通道 (Channel) 簡介](coroutines-and-channels.md)
* [取消與逾時](coroutines-cancellation.md)
* [組合暫停函式](composing-suspending-functions.md)
* [協同程式上下文與分派器](coroutine-context-and-dispatchers.md)
* [Flow](coroutines-flow.md)
* [通道 (Channel)](channels.md)
* [協同程式例外處理](exception-handling.md)
* [共用可變狀態與並行](shared-mutable-state-and-concurrency.md)
* [Select 表達式（實驗性）](select-expression.md)
* [教學：使用 IntelliJ IDEA 偵錯協同程式](debug-coroutines-with-idea.md)
* [教學：使用 IntelliJ IDEA 偵錯 Kotlin Flow](debug-flow-with-idea.md)

## 其他參考資料

* [協同程式 UI 程式設計指南](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md)
* [協同程式設計文件 (KEEP)](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
* [完整的 kotlinx.coroutines API 參考](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Android 協同程式最佳實務](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)
* [Kotlin 協同程式與 Flow 的其他 Android 資源](https://developer.android.com/kotlin/coroutines/additional-resources)