[//]: # (title: 引数生成の制約)
[//]: # (description: Lincheckにおけるオペレーション引数の生成設定方法について学びます。)

並行データ構造をテストするために、Lincheckはオペレーションを異なるスレッドにランダムに配置し、それらをランダムな引数で呼び出すことによって、一連の並行シナリオを生成します。

並行性に関するバグが見つかる確率を高めるために、オペレーション引数の範囲を制約することができます。
例えば、ハッシュマップにおける並行オペレーションでは、可能なキー値の範囲を制限することで、同じキーにアクセスする可能性が高くなります。これにより、Lincheckは競合状態やその他の並行性バグをより効率的に顕在化させることができます。

Lincheckで生成される引数値の範囲を制限するには：

1. `@Param` アノテーションを使用して引数ジェネレータを宣言します：

   ```kotlin
   @Param(name = "key", gen = IntGen::class, conf = "1:2")
   class MultiMapTest {
       // テスト
   }
   ```

   * `name` – 引数ジェネレータの名前。
   * `gen` – ジェネレータの[型](#generator-types)。
   * `conf` – ジェネレータの設定文字列。ここでは、Lincheckは1から2までの整数値を生成します。

   > Lincheckは、複数の値型に対応したジェネレータを提供しています。型ごとに異なる設定文字列のテンプレートを使用します。
   >
   > 詳細は [ジェネレータの型](#generator-types) セクションを参照してください。
   { style = "tip" }

2. オペレーションのパラメータに `@Param` を付与して制約を適用します：

   ```kotlin
   @Operation
   fun add(@Param(name = "key") key: Int, value: Int) = map.add(key, value)

   @Operation
   fun get(@Param(name = "key") key: Int) = map.get(key)
   ```

制約を適用すると、Lincheckは指定された範囲内の値のみを使用してシナリオを生成します：

```text
| ---------------------------------- |
|    Thread 1     |     Thread 2     |
| ---------------------------------- |
| add(2, 0): void | add(2, -1): void |
| ---------------------------------- |
| get(2): [-1]    |                  |
| ---------------------------------- |
```

## ジェネレータの型

Lincheckは、以下の引数ジェネレータ型を提供しています：

<table>
    <tr>
      <th>ジェネレータ</th>
      <th>設定テンプレート</th>
      <th>説明</th>
    </tr>
    <tr>
      <td><code>IntGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code> から <code>max</code> までの <code>Int</code> 値（両端を含む）を生成します。 <br/><br/>
          設定文字列が空の場合、<code>Int.MIN_VALUE</code> から <code>Int.MAX_VALUE</code> までの全整数範囲を使用します。 <br/><br/>
          例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>StringGen</code></td>
      <td><code>"maxWordLength:alphabet"</code><br/><code>"maxWordLength"</code><br/><code>""</code></td>
      <td>提供された <code>alphabet</code> から、<code>maxWordLength</code> までの長さのランダムな文字列値を生成します。
          デフォルトの <code>alphabet</code> は <code>[a-zA-Z\d _]</code> です。 <br/>
          デフォルトの <code>maxWordLength</code> は <code>15</code> です。 <br/><br/>
          例：
          <code-block lang="text">"2:abc" -> [
    "a", "b", "c",
    "aa", "bb", "cc",
    "ab", "bc", "ac",
    "ba", "cb", "ca"
]</code-block></td>
    </tr>
    <tr>
      <td><code>EnumGen</code></td>
      <td><code>"Enum.Const1,Enum.Const2,..."</code></td>
      <td>指定された列挙型（enum）値のリストからランダムな値を生成します。 <br/><br/>
          例：
          <code-block lang="text">"Enum.Const1,Enum.Const2" -> [
    Enum.Const1, 
    Enum.Const2
]</code-block></td>
    </tr>
    <tr>
      <td><code>BooleanGen</code></td>
      <td><code>""</code></td>
      <td><code>true</code> および <code>false</code> の値を生成します。特定の設定文字列は必要ありません。 <br/><br/>
          例：
          <code>"" -&gt; [true, false]</code></td>
    </tr>
    <tr>
      <td><code>DoubleGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td><code>start</code> から <code>end</code> まで、<code>step</code> ずつ増加させた <code>Double</code> 値を生成します。 <br/><br/> 
          デフォルトの <code>step</code> 値は <code>(end - start)/100</code> です。 <br/><br/> 
          設定文字列が空の場合、<code>Int.MIN_VALUE</code> から <code>Int.MAX_VALUE</code> までの値を <code>step = 0.1</code> で生成します。 <br/><br/>
          例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>FloatGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td><code>DoubleGen</code> と同様ですが、値は <code>Float</code> に変換されます。 <br/><br/>
          例：
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>LongGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>IntGen</code> と同様ですが、値は <code>Long</code> に変換されます。 <br/><br/>
          例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ShortGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code> から <code>max</code> までの <code>Short</code> 値（両端を含む）を生成します。 <br/><br/>
          設定文字列が空の場合、<code>-32768</code> から <code>32767</code> までの全短整数範囲を使用します。 <br/><br/>
          例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ByteGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code> から <code>max</code> までの <code>Byte</code> 値（両端を含む）を生成します。 <br/><br/>
          設定文字列が空の場合、<code>-128</code> から <code>127</code> までの全バイト範囲を使用します。 <br/><br/>
          例：
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ThreadIdGen</code></td>
      <td><code>""</code></td>
      <td>現在のスレッドのID番号を返します。特定の設定文字列は必要ありません。 <br/><br/>
          例：
          <code>"" -&gt; [1, 2]</code></td>
    </tr>
</table>

## 次のステップ

Lincheckで[特定のオペレーションを単一スレッドに制限する](lincheck-operation-execution-options.md)方法を学びます。

## 関連項目

* [ノンブロッキングな進捗保証のチェック](lincheck-progress-guarantees.md)
* [アルゴリズムの逐次仕様の定義](lincheck-results-validation.md)