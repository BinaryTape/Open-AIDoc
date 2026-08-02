[//]: # (title: 概要)
[//]: # (description: LincheckはJVM上で並行コードをテストするためのフレームワークです。Lincheckはコード内の潜在的なスレッドのインターリーブを探索し、誤った動作につながるものを見つけ出します。)

Lincheckは、JVM上で並行コードをテストするためのフレームワークです。テストの実行中、Lincheckはプログラムの潜在的なスレッドのインターリーブ（thread interleaving）を探索し、誤った動作につながるものを報告します。

> [Kotlinマルチプラットフォーム](https://kotlinlang.org/docs/multiplatform/get-started.html)プロジェクトでは、Lincheckを使用してJVM上でのみコードをテストできます。
> 
{style="note"}

Lincheckでの並行テストでは、各スレッドの操作と期待されるアサーションをリストアップするだけです。残りの処理はLincheckが担当します：

```kotlin
class CounterTest {
    @Test // テスト関数の宣言
    fun test() = Lincheck.runConcurrentTest {
        var counter = 0

        // カウンタを並行してインクリメントします
        val t1 = thread { counter++ }
        val t2 = thread { counter++ }

        // スレッドの終了を待機します
        t1.join()
        t2.join()

        // 両方のインクリメントが適用されたことを確認します
        assertEquals(2, counter)
    }
}
```

テストが失敗した場合、Lincheckはエラーにつながったスレッドのインターリーブとスレッドの切り替えポイントを提供します：

```text
| ------------------------------------------------------------------------------- |
|                   Main Thread                   |   Thread 1    |   Thread 2    |
| ------------------------------------------------------------------------------- |
| thread(block = Lambda#2): Thread#1              |               |               |
| thread(block = Lambda#3): Thread#2              |               |               |
| switch (reason: waiting for Thread 1 to finish) |               |               |
|                                                 |               | run()         |
|                                                 |               |   counter ➜ 0 |
|                                                 |               |   switch      |
|                                                 | run()         |               |
|                                                 |   counter ➜ 0 |               |
|                                                 |   counter = 1 |               |
|                                                 |               |   counter = 1 |
| Thread#1.join()                                 |               |               |
| Thread#2.join()                                 |               |               |
| counter.element ➜ 1                             |               |               |
| assertEquals(2, 1): threw AssertionFailedError  |               |               |
| ------------------------------------------------------------------------------- |
```

## Lincheckの仕組み

JVMが並行コードを実行するたびに、スレッド間での操作の実行順序が変わる可能性があります。
例えば、ある操作が別のスレッドの別の操作によって中断されることがあります。これ自体はエラーではありませんが、コードに並行性のバグがある場合、エラーにつながる可能性があります。

![この画像は、プログラムの実行シナリオと実行スケジュールを比較しています。最初の実行スケジュールでは、操作が次々に実行されます。2番目の実行スケジュールでは、最初の操作が2番目の操作によって中断されます。](scenario-vs-schedule.png){ width="700" }

> 実行シナリオ（_execution scenario_）は、操作がスレッド間でどのように分散されるか、および各スレッド内での実行順序を定義します。
> 
> 実行スケジュール（_execution schedule_、またはスレッドのインターリーブ：_thread interleaving_）は、すべてのスレッドにわたるすべての操作の実行順序を定義します。
>
{style="tip"}

Lincheckは、誤った動作につながる実行スケジュールを見つけるために、2つのテスト戦略を実装しています：
* **モデル検査（Model checking）**。Lincheckは、プログラムに明示的なスレッド切り替え命令を挿入することで、スケジューリングを制御します。これらの命令は、同期ポイントや共有メモリへのアクセス箇所に配置されます。モデル検査により、Lincheckはエラーに至る正確な実行トレースを生成できます。
* **ストレス・テスト（Stress testing）**。オペレーティングシステムがスケジューリングを制御します。Lincheckは、エラーを見つける可能性を高めるために、各シナリオを複数回実行します。

## Lincheckを探索する

* [Lincheckを使い始める](lincheck-getting-started.md) で、Lincheckの機能をステップバイステップで学習しましょう。
* Lincheckにおける[並行データ構造をテストするための宣言的な手法](lincheck-how-to-test-data-structures.md)について学びましょう。

## 詳細情報

* Nikita Kovalによる「How we test concurrent algorithms in Kotlin Coroutines」: [動画](https://youtu.be/jZqkWfa11Js)。KotlinConf 2023
* Maria Sokolovaによる「Lincheck: Testing concurrency on the JVM」ワークショップ: [パート1](https://www.youtube.com/watch?v=YNtUK9GK4pA)、[パート2](https://www.youtube.com/watch?v=EW7mkAOErWw)。Hydra 2021
* Nikita Kovalらによる「Lincheck: A Practical Framework for Testing Concurrent Data Structures on JVM」: [論文](https://nikitakoval.org/publications/cav23-lincheck.pdf)。2023