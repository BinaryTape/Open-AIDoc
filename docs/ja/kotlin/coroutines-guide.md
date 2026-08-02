<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンガイド)

Kotlinは、他のライブラリがコルーチンを利用できるように、標準ライブラリでは最小限の低レベルAPIのみを提供しています。同様の機能を持つ他の多くの言語とは異なり、`async` と `await` はKotlinのキーワードではなく、標準ライブラリの一部ですらありません。さらに、Kotlinの「中断関数 (suspending function)」という概念は、フューチャーやプロミス（futures and promises）よりも安全でエラーの起こりにくい、非同期操作のための抽象化を提供します。

`kotlinx.coroutines` は、JetBrainsによって開発されたコルーチン用の豊富なライブラリです。このガイドで扱う `launch` や `async` などを含む、コルーチンに対応した多くのハイレベルなプリミティブが含まれています。

これは、`kotlinx.coroutines` の主要な機能について、一連の例とともに、いくつかのトピックに分けて解説するガイドです。

コルーチンを使用したり、このガイドの例を試したりするには、[プロジェクトのREADME](https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md#using-in-your-projects) で説明されているように、`kotlinx-coroutines-core` モジュールへの依存関係を追加する必要があります。

## 目次

* [コルーチンの基本](coroutines-basics.md)
* [チュートリアル：コルーチンとチャネルの概要](coroutines-and-channels.md)
* [キャンセルとタイムアウト](coroutines-cancellation.md)
* [中断関数の構成](composing-suspending-functions.md)
* [コルーチンのコンテキストとディスパッチャ](coroutine-context-and-dispatchers.md)
* [Flow](coroutines-flow.md)
* [チャネル](channels.md)
* [コルーチンの例外処理](exception-handling.md)
* [共有ミュータブル状態と並行性](shared-mutable-state-and-concurrency.md)
* [Select式（実験的）](select-expression.md)
* [チュートリアル：IntelliJ IDEAを使用したコルーチンのデバッグ](debug-coroutines-with-idea.md)
* [チュートリアル：IntelliJ IDEAを使用したKotlin Flowのデバッグ](debug-flow-with-idea.md)

## 追加リファレンス

* [コルーチンを使用したUIプログラミングガイド](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md)
* [コルーチン設計ドキュメント (KEEP)](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
* [kotlinx.coroutines APIリファレンス（全文）](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Androidでのコルーチンのベストプラクティス](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)
* [KotlinコルーチンとFlowに関するAndroidの追加リソース](https://developer.android.com/kotlin/coroutines/additional-resources)