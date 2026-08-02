[//]: # (title: テスト戦略)
[//]: # (description: Lincheckにおけるモデルチェックとストレス検証の違いについて学びます。)

Lincheckは、並行データ構造をテストするための2つの戦略、モデルチェックとストレス検証を提供します。

この記事では、これらの戦略の違いと、テスト戦略を選択する際に考慮すべき点について説明します。

## モデルチェック (Model checking)

モデルチェックでは、Lincheckは起こりうるスレッドのインターリーブ（実行順序の組み合わせ）をシミュレートし、不正な動作の原因となるものを報告します。

データ構造のテストにモデルチェック戦略を使用するには、`ModelCheckingOptions()` を使用してテスト関数を宣言します。

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .check(this::class)
```

モデルチェック戦略を使用すると、Lincheckは共有メモリアクセス（`read` および `write`）や、ロックの取得と解放、`park`/`unpark`、`wait`/`notify` などの同期ポイントに、明示的なスレッド切り替え命令を挿入します。

スレッドの切り替えを制御することで、Lincheckは以下のことが可能になります。

* プログラムの異なる実行スケジュールの可能性を決定論的に探索する。
* 詳細な実行トレースを提供する。

現在、モデルチェックを使用する場合、Lincheckは実行において[逐次一貫性メモリモデル (sequentially consistent memory model)](https://en.wikipedia.org/wiki/Sequential_consistency)を想定しています。これは、緩和された [Java メモリモデル](https://en.wikipedia.org/wiki/Java_memory_model)下での命令の並べ替え（リオーダリング）やメモリキャッシュの動作、およびその他の同様のエフェクトに関連するバグはシミュレートされず、検出できないことを意味します。

<!-- TODO: uncomment after the article is published
> 詳細については、[モデルチェック](lincheck-model-checking.md)を参照してください。
>
{style=”tip”}
-->

## ストレス検証 (Stress testing)

ストレス検証では、Lincheckはエラーが見つかる可能性を高めるために、各シナリオを複数回実行します。

ストレス検証を使用するには、`StressOptions()` を使用してテスト関数を宣言します。

```kotlin
@Test
fun stressTest() = StressOptions()
   .check(this::class)
```

モデルチェックとは異なり、Lincheckはスレッドの切り替えを制御したり追跡したりしません。これにより、ストレス検証はより高速になり、メモリモデルについての仮定を必要としません。
ただし、ストレス検証ではテストの再現性がなく、Lincheckは実行トレースを提供できません。

## 戦略の選択

戦略を選択する際は、以下の点を考慮してください。

<table style="both">
    <tr>
        <td></td>
        <td><b>モデルチェック</b></td>
        <td><b>ストレス検証</b></td>
    </tr>
    <tr>
        <td><b>速度</b></td>
        <td>遅い。</td>
        <td>速い。</td>
    </tr>
    <tr>
        <td><b>再現性</b></td>
        <td>入力データが変わらなければ、テストは正確に同じ結果を返します。</td>
        <td>実行ごとにスレッドのスケジュールが変わる可能性があるため、テスト結果が異なる場合があります。</td>
    </tr>
    <tr>
        <td><b>前提条件</b></td>
        <td><list>
            <li>逐次一貫性メモリモデルを想定しています。</li>
            <li>そのモデル外の不正な動作に起因するバグは見逃されます。</li>
        </list></td>
        <td><list>
            <li>メモリモデルに関する仮定を一切行いません。</li>
            <li>根本的な原因に関わらず、あらゆる不正な動作を検出できる可能性があります。</li>
        </list></td>
    </tr>
    <tr>
        <td><b>詳細度</b></td>
        <td>並行シナリオと、不正な動作に至った実行トレースの両方を報告します。</td>
        <td>並行シナリオのみを報告します。</td>
    </tr>
    <tr>
        <td><b>標準ライブラリのサポート</b></td>
        <td><list>
            <li>弱参照 (weak references) など、一部の標準ライブラリ機能の動作をシミュレートしません。</li>
            <li>そのような機能に起因するバグは見逃されます。</li>
        </list></td>
        <td>あらゆる機能の使用に起因するバグを検出できる可能性があります。</td>
    </tr>
</table>

## 次のステップ

シナリオ生成のカスタマイズ、実行停止（ストール）検出の有効化、ライブラリのトレッドセーフ保証の提供など、[テスト戦略を構成する](lincheck-testing-strategies-options.md)方法について学びましょう。

## 関連項目

* [操作引数の生成](lincheck-argument-generation-constraints.md)
* [操作実行オプションの構成](lincheck-operation-execution-options.md)
* [ノンブロッキングな進行保証のチェック](lincheck-progress-guarantees.md)
* [アルゴリズムの逐次仕様の定義](lincheck-results-validation.md)