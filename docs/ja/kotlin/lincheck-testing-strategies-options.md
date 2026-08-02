[//]: # (title: テスト戦略の設定)
[//]: # (description: モデルチェックおよびストレス・テスト用に Lincheck が提供するさまざまなオプションについて学びます。)

Lincheck は、シナリオ生成、実行のスタール（停滞）検出、検証など、テスト戦略のためのさまざまな設定オプションをサポートしています。

## オプションを有効にする方法

テスト戦略のオプションを有効にするには、戦略クラスで設定を行います。

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
    .iterations(100) // 生成されるシナリオの数を指定
    .check(this::class)
```

## シナリオの最小化

デフォルトでは、Lincheck はテストの動作を変更しない操作を削除することで、失敗したシナリオの最小化を試みます。

失敗したシナリオの全容を確認するには、`minimizeFailedScenario` オプションを `false` に設定します。

<compare first-title="フル（最小化なし）" second-title="最小化済み">
<code-block lang="text">
| ------------------------- |
|    Thread 1    | Thread 2 |
| --------------------------|
| inc(): 1       |          |
| get(): 1       |          |
| get(): 1       |          |
| --------------------------|
| inc(): 4 [0,1] | inc(): 2 |
| get(): 4 [1,1] | inc(): 4 |
| get(): 4 [2,1] | get(): 4 |
| --------------------------|
| get(): 4       |          |
| get(): 4       |          |
| get(): 4       |          |
| --------------------------|
</code-block>
<code-block lang="text">
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| inc(): 1 | inc(): 1 |
| ------------------- |
</code-block>
</compare>

## シナリオの生成

| オプション | デフォルト値 | 説明 |
|---------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `iterations`              | `100`         | 生成される並行シナリオの数。 |
| `invocationsPerIteration` | `10_000`      | 各並行シナリオごとの呼び出し回数。 |
| `threads`                 | `2`           | 各シナリオにおけるスレッドの数。 |
| `actorsBefore`            | `5`           | シナリオの並列セクションの前に呼び出される操作の数。 |
| `actorsPerThread`         | `5`           | シナリオの並列セクションにおける、各スレッド内の操作の数。 |
| `actorsAfter`             | `5`           | シナリオの並列セクションの後に呼び出される操作の数。 |
| `customScenarios`         | –             | [カスタム並行シナリオ](#カスタムシナリオの定義)のリスト。カスタムシナリオは、ランダムに生成されたシナリオの前に実行されます。 |

### カスタムシナリオの定義

Lincheck は、カスタムシナリオを定義するために [ドメイン特有言語 (DSL)](https://kotlinlang.org/docs/type-safe-builders.html) を使用します：

```kotlin
@Test
fun test() = StressOptions()
    .customScenarios {
        initial {
            actor(SomeClass1::foo)
        }
        parallel {
            thread {
                actor(SomeClass1::buzz, 1)
                actor(SomeClass1::buzz, 2)
            }
            thread {
                actor(SomeClass1::buzz, 3)
            }
        }
        post {
            actor(SomeClass1::foo)
        }
    }
    .check(this::class)
```

各シナリオは、3 つのオプションセクションで構成されます：

* `initial` – 並列部分の前に実行される操作。
* `parallel` – スレッドの定義。スレッドは `thread` ブロックを使用して定義されます。
  並列セクションには複数の `thread` ブロックを含めることができます。
* `post` – 並列部分の後に実行される操作。

操作は `actor(function, arg1, arg2, ...)` 関数を使用して定義されます。単一のブロック内の操作は順次実行されます。

## 実行のスタール検出

<table>
<tr><td>オプション</td><td>デフォルト値</td><td>説明</td></tr>
<tr>
    <td><code>timeoutMs</code></td>
    <td><code>3000</code></td>
    <td>Lincheck が実行のスタール（停滞）を報告するまでの呼び出しタイムアウト（ミリ秒単位）。</td></tr>
<tr>
    <td><code>loopBound</code></td>
    <td><code>50</code></td>
    <td>Lincheck が実行のスタールを報告するまでのループ反復回数。<br/>
        長いループに対して Lincheck が誤って実行のスタールを報告する場合は、<code>loopBound</code> の値を増やしてください。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
<tr>
    <td><code>recursionBound</code></td>
    <td><code>20</code></td>
    <td>Lincheck が実行のスタールを報告するまでの再帰呼び出し回数。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> の値は <code>loopBound</code> 未満である必要があります。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
</table>

## ループ内でのスレッド切り替え

<table><tr><td>オプション</td><td>デフォルト値</td><td>説明</td></tr>
<tr>
    <td><code>loopIterationsBeforeThreadSwitch</code></td>
    <td><code>10</code></td>
    <td>別のスレッドへの切り替えを試みる前に、スレッドが実行できるループ反復回数。<br/>
        <code>loopIterationsBeforeThreadSwitch</code> の値は、<a href="#実行のスタール検出"><code>loopBound</code></a> 未満である必要があります。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
</table>

## 検証

<table>
<tr><td>オプション</td><td>デフォルト値</td><td>説明</td></tr>
<tr>
    <td><code>verifierClass</code></td>
    <td><code>LinearizabilityVerifier</code></td>
    <td><a href="lincheck-results-validation.md#verification-models">検証プロセス</a>中に使用される検証クラス：
        <list>
            <li><code>LinearizabilityVerifier</code> (線形化可能性検証)</li>
            <li><code>SerializabilityVerifier</code> (直列化可能性検証)</li>
            <li><code>QuiescentConsistencyVerifier</code> (静止整合性検証)</li>
        </list></td></tr>
<tr>
    <td><code>sequentialSpecification</code></td>
    <td>テスト対象のデータ構造と同じ。</td>
    <td>テスト対象のデータ構造の逐次（シーケンシャル）バージョン。この構造は <a href="lincheck-results-validation.md">検証プロセス</a> で使用されます。</td>
</tr>
</table>

## 進捗保証

<table><tr><td>オプション</td><td>デフォルト値</td><td>説明</td></tr>
<tr>
    <td><code>checkObstructionFreedom</code></td>
    <td><code>false</code></td>
    <td>データ構造操作の <a href="lincheck-progress-guarantees.md">障害自由 (obstruction-freedom) 保証</a> を検証するには、このオプションを <code>true</code> に設定します。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
</table>

## ライブラリ解析

<table>
<tr><td>オプション</td><td>デフォルト値</td><td>説明</td></tr>
<tr>
    <td><code>stdLibAnalysisEnabled</code></td>
    <td><code>false</code></td>
    <td>デフォルトでは、Lincheck は標準ライブラリの操作をスレッドセーフとして扱い、その動作を検証しません。標準ライブラリの関数やクラスの解析を有効にするには、このオプションを <code>true</code> に設定します。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
<tr>
    <td><code>addGuarantee</code></td>
    <td>–</td>
    <td><code>addGuarantee</code> オプションを使用して、スレッドセーフなメソッドや解析に無関係なメソッドの <a href="#保証の定義">保証を定義</a> し、それらをモデルチェックから除外します。<br/><br/>
        このオプションは <a href="lincheck-testing-strategies.md#model-checking">モデルチェック</a> にのみ適用可能です。</td></tr>
</table>

### 保証の定義

保証を定義するには、ビルダーチェーンを使用します。クラスを選択し、次にメソッドを選択し、最後に保証タイプを選択します。

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
        .addGuarantee(
            forClasses("java.util.concurrent.ConcurrentHashMap")
                .allMethods()
                .treatAsAtomic()
        )
        .check(this::class)
```

1. `forClasses` のオーバーロードのいずれかを使用してクラスを選択します：

   * `forClasses(vararg fullClassNames: String)` — `fullClassNames` 文字列に完全修飾名が含まれているクラスに一致します。
   * `forClasses(vararg classes: KClass<*>)` — 参照によってクラスを一致させます。
   * `forClasses(classPredicate: (fullClassName: String) -> Boolean)` — 完全修飾名に対する述語（プレディケート）を使用してクラスを一致させます。

2. 保証を適用するメソッドを選択します：

   * `methods(methodNames: String)` – `methodNames` 文字列にメソッド名が含まれている場合に一致します。
   * `methods(methodPredicate: (methodName: String) -> Boolean)` – 述語を使用してメソッドを一致させます。
   * `allMethods()` – 選択されたクラスのすべてのメソッドを一致させます。

3. 保証タイプを選択します：

   * `treatAsAtomic()` — 各メソッドをアトミックな操作として扱います。Lincheck はメソッド呼び出しの内部にスイッチポイントを挿入しませんが、呼び出しの前後にスイッチポイントを追加する場合があります。

     スレッドセーフであることが既知のメソッドには `treatAsAtomic()` を使用してください。
   * `ignore()` — メソッドを解析から除外します。Lincheck は、メソッド呼び出しの内部、前、後のいずれにもスイッチポイントを挿入しません。

     > メソッドが内部で同期プリミティブ（例：`synchronized` ブロック）を使用している場合、メソッドを無視すると Lincheck がデッドロックを引き起こす可能性があります。
     >
     {style="warning"}

     ロギングやデバッグユーティリティなど、解析に無関係なメソッドには `ignore()` を使用してください。

## 次のステップ

Lincheck の実行シナリオで使用される操作の [引数生成の設定](lincheck-argument-generation-constraints.md) 方法について学びます。

## 関連項目

* [操作の実行オプションの設定](lincheck-operation-execution-options.md)
* [非ブロック進捗保証のチェック](lincheck-progress-guarantees.md)
* [アルゴリズムの逐次仕様の定義](lincheck-results-validation.md)