[//]: # (title: コルーチン)

アプリケーションでは、ユーザー入力への応答、データの読み込み、画面の更新など、複数のタスクを同時に実行する必要があることがよくあります。
これをサポートするために、オペレーションを互いにブロックすることなく独立して実行できるようにする「並行処理（concurrency）」を利用します。

タスクを並行して実行する最も一般的な方法は、オペレーティングシステムによって管理される独立した実行パスである「スレッド（threads）」を使用することです。
しかし、スレッドは比較的重く、大量に作成するとパフォーマンスの問題につながる可能性があります。

効率的な並行処理をサポートするため、Kotlinは「コルーチン（coroutines）」を中心とした非同期プログラミングを採用しています。これにより、サスペンド関数（suspending functions）を使用して、非同期コードを自然で逐次的なスタイルで記述できます。
コルーチンはスレッドに代わる軽量な手法です。
システムリソースをブロックすることなく中断（suspend）でき、リソース効率が良いため、きめ細かな並行処理に適しています。

ほとんどのコルーチン機能は [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) ライブラリによって提供されています。
このライブラリには、コルーチンの起動、並行処理の制御、非同期ストリームの操作などのためのツールが含まれています。

Kotlinのコルーチンを初めて使用する場合は、より複雑なトピックに進む前に [コルーチンの基本](coroutines-basics.md) ガイドから始めてください。
このガイドでは、サスペンド関数、コルーチンビルダー、構造化された並行処理（structured concurrency）の主要な概念を、シンプルな例を通して紹介します。

<a href="coroutines-basics.md"><img src="get-started-coroutines.svg" width="700" alt="Get started with coroutines" style="block"/></a>

> 実際のプロジェクトでコルーチンがどのように使用されているかを確認するためのサンプルプロジェクトとして、[KotlinConf アプリ](https://github.com/JetBrains/kotlinconf-app)をチェックしてください。
> 
{style="tip"}

## コルーチンの概念

`kotlinx.coroutines` ライブラリは、タスクを並行して実行し、コルーチンの実行を構造化し、共有状態を管理するためのコアとなる構成要素を提供します。

### サスペンド関数とコルーチンビルダー

Kotlinのコルーチンはサスペンド関数（suspending functions）に基づいて構築されています。サスペンド関数を使用すると、スレッドをブロックすることなくコードを一時停止（pause）し、再開（resume）させることができます。
`suspend` キーワードは、長時間実行されるオペレーションを非同期的に実行できる関数であることを示します。

新しいコルーチンを起動するには、[`.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) や [`.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) などのコルーチンビルダーを使用します。
これらのビルダーは [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) の拡張関数であり、コルーチンのライフサイクルを定義し、コルーチンコンテキストを提供します。

これらのビルダーの詳細については、[コルーチンの基本](coroutines-basics.md) および [サスペンド関数の構成](coroutines-and-channels.md) で学ぶことができます。

### コルーチンコンテキストと動作

`CoroutineScope` からコルーチンを起動すると、その実行を制御する「コンテキスト（context）」が作成されます。
`.launch()` や `.async()` などのビルダー関数は、コルーチンの動作を定義する一連の要素を自動的に作成します。

* [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) インターフェースは、コルーチンのライフサイクルを追跡し、構造化された並行処理を可能にします。
* [`CoroutineDispatcher`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/) は、バックグラウンドスレッドやUIアプリケーションのメインスレッドなど、コルーチンが実行される場所を制御します。
* [`CoroutineExceptionHandler`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/) は、キャッチされなかった例外を処理します。

これらは他の要素とともに、デフォルトで親コルーチンから継承される「[コルーチンコンテキスト（coroutine context）](coroutine-context-and-dispatchers.md)」を構成します。
このコンテキストは階層構造を形成し、関連するコルーチンをまとめて[キャンセル](coroutines-cancellation.md)したり、グループとして[例外を処理](exception-handling.md)したりできる「構造化された並行処理」を実現します。

### 非同期フローと共有ミュータブル状態

Kotlinは、コルーチン同士が通信するためのいくつかの方法を提供しています。
コルーチン間で値を共有する方法に基づいて、以下のオプションから選択してください。

* [`Flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) は、コルーチンがアクティブに値を収集（collect）しているときにのみ値を生成します。
* [`Channel`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/) は、複数のコルーチンが値を送信および受信できるようにし、各値は正確に1つのコルーチンに配信されます。
* [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) は、すべての値をアクティブなすべての収集コルーチンと継続的に共有します。

複数のコルーチンが同じデータにアクセスまたは更新する必要がある場合、それらは「共有ミュータブル状態（shared mutable state）」を共有します。
適切な調整がないと、操作が予期しない方法で互いに干渉する「レースコンディション（race conditions）」が発生する可能性があります。
共有ミュータブル状態を安全に管理するには、[`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/#) を使用して共有データをラップします。
これにより、あるコルーチンからデータを更新し、他のコルーチンからその最新の値を収集することができます。
<!-- 詳細については、[Shared mutable state and concurrency](shared-mutable-state-and-concurrency.md) を参照してください。 -->

詳細については、[非同期フロー](coroutines-flow.md)、[チャネル](channels.md)、および [コルーチンとチャネルのチュートリアル](coroutines-and-channels.md) を参照してください。

## 次のステップ

* [コルーチンの基本ガイド](coroutines-basics.md) で、コルーチン、サスペンド関数、ビルダーの基礎を学びましょう。
* [サスペンド関数の構成](coroutine-context-and-dispatchers.md) で、サスペンド関数を組み合わせ、コルーチンのパイプラインを構築する方法を確認しましょう。
* IntelliJ IDEAに組み込まれているツールを使用して [コルーチンをデバッグ](debug-coroutines-with-idea.md) する方法を学びましょう。
* Flowに特化したデバッグについては、[IntelliJ IDEAを使用したKotlin Flowのデバッグ](debug-flow-with-idea.md) チュートリアルを参照してください。
* [コルーチンを使用したUIプログラミングガイド](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md) を読んで、コルーチンベースのUI開発について学びましょう。
* [Androidでのコルーチン使用に関するベストプラクティス](https://developer.android.com/kotlin/coroutines/coroutines-best-practices) を確認しましょう。
* [`kotlinx.coroutines` API リファレンス](https://kotlinlang.org/api/kotlinx.coroutines/) をチェックしてください。