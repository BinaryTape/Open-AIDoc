[//]: # (title: ライブラリとAPI)

<no-index/>

Kotlinを最大限に活用するには、既存のライブラリやAPIを使用して、車輪の再発明に費やす時間を減らし、コーディングにより多くの時間を費やせるようにしましょう。

ライブラリは、一般的なタスクを簡素化する再利用可能なコードを配布します。ライブラリ内には、関連するクラス、関数、ユーティリティをグループ化したパッケージやオブジェクトが存在します。ライブラリは、開発者がコード内で使用できる関数、クラス、またはプロパティのセットとしてAPI（Application Programming Interfaces）を公開します。

![Kotlin libraries and APIs](kotlin-library-diagram.svg){width=600}

Kotlinで何ができるのかを見ていきましょう。

## 標準ライブラリ {id="the-standard-library"}

Kotlinには、コードを簡潔かつ表現力豊かにするための基本的な型、関数、コレクション、ユーティリティを提供する標準ライブラリ（standard library）があります。標準ライブラリの大部分（[`kotlin` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)内のすべて）は、明示的にインポートすることなく、任意のKotlinファイルですぐに使用できます。

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 標準ライブラリの reversed() 関数を使用
    val reversedText = text.reversed()

    // 標準ライブラリの print() 関数を使用
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

ただし、標準ライブラリの一部は、コードで使用する前にインポートが必要です。
例えば、標準ライブラリの時間計測機能を使用したい場合は、[`kotlin.time` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)をインポートする必要があります。

ファイルの先頭に `import` キーワードを追加し、その後に必要なパッケージを指定します。

```kotlin
import kotlin.time.*
```

アスタリスク `*` はワイルドカードインポートであり、パッケージ内のすべてをインポートするようKotlinに指示します。コンパニオンオブジェクトに対してアスタリスク `*` は使用できません。代わりに、使用したいコンパニオンオブジェクトのメンバーを明示的に宣言する必要があります。

例：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

fun main() {
    val thirtyMinutes: Duration = 30.minutes
    val halfHour: Duration = 0.5.hours
    println(thirtyMinutes == halfHour)
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-time"}

この例では：

* `Duration` クラスと、そのコンパニオンオブジェクトから `hours` および `minutes` 拡張プロパティをインポートします。
* `minutes` プロパティを使用して、`30` を30分の `Duration` に変換します。
* `hours` プロパティを使用して、`0.5` を30分の `Duration` に変換します。
* 両方の期間が等しいかどうかを確認し、結果を出力します。

### 作成する前に探す {id="search-before-you-build"}

独自のコードを書く前に、求めているものが標準ライブラリにすでに存在しないか確認してください。
標準ライブラリが多数のクラス、関数、プロパティをすでに提供している分野を以下に挙げます。

* [コレクション (Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [シーケンス (Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [文字列操作 (String manipulation)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理 (Time management)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

標準ライブラリに他に何が含まれているかを詳しく知るには、その[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/)を確認してください。

## Kotlinライブラリ {id="kotlin-libraries"}

標準ライブラリは多くの一般的なユースケースをカバーしていますが、対応していないものもあります。幸いなことに、Kotlinチームやコミュニティによって、標準ライブラリを補完する幅広いライブラリが開発されています。例えば、[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) は、さまざまなプラットフォーム間で時間を管理するのに役立ちます。

便利なライブラリは[検索プラットフォーム（klibs.io）](https://klibs.io/)で見つけることができます。それらを使用するには、依存関係やプラグインを追加するなどの追加手順が必要です。各ライブラリのGitHubリポジトリには、Kotlinプロジェクトにそれを含める方法の手順が記載されています。

ライブラリを追加すると、その中の任意のパッケージをインポートできるようになります。以下は、ニューヨークの現在時刻を取得するために `kotlinx-datetime` パッケージをインポートする例です。

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 現在のインスタントを取得
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

この例では：

* `kotlinx.datetime` パッケージをインポートします。
* `Clock.System.now()` 関数を使用して、現在時刻を含む `Instant` クラスのインスタンスを作成し、その結果を変数 `now` に代入します。
* 現在時刻を出力します。
* `TimeZone.of()` 関数を使用してニューヨークのタイムゾーンを取得し、その結果を変数 `zone` に代入します。
* 現在時刻を含むインスタンスに対して `.toLocalDateTime()` 関数を呼び出し、引数としてニューヨークのタイムゾーンを渡します。
* 結果を変数 `localDateTime` に代入します。
* ニューヨークのタイムゾーンに合わせて調整された時刻を出力します。

> この例で使用されている関数やクラスをさらに詳しく調べるには、[APIリファレンス](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)を参照してください。
>
{style="tip"}

## APIのオプトイン {id="opt-in-to-apis"}

ライブラリの作者は、コードで使用する前にオプトイン（明示的な同意・有効化）を必要とするものとして特定のAPIをマークすることがあります。通常、APIがまだ開発中であり、将来変更される可能性がある場合にこれが行われます。オプトインしない場合、以下のような警告またはエラーが表示されます。

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

オプトインするには、`@OptIn` と書き、その後の括弧内にAPIを分類するクラス名を指定し、末尾に2つのコロン `::` と `class` を付けます。

例えば、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)に示されているように、標準ライブラリの `uintArrayOf()` 関数は `@ExperimentalUnsignedTypes` に該当します。

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

コード内でのオプトインは次のようになります。

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下は、`uintArrayOf()` 関数を使用して符号なし整数の配列を作成し、その要素の1つを変更するためにオプトインを使用する例です。

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 符号なし整数配列を作成
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 要素を変更
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

これはオプトインする最も簡単な方法ですが、他にも方法があります。詳細については、[オプトインの要件 (Opt-in requirements)](opt-in-requirements.md)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="複利を計算する" id="libraries-exercise-1">

ユーザーが投資の将来価値を計算するのに役立つ財務アプリケーションを開発しています。複利を計算する公式は次のとおりです。

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

ここで：

* `A` は利息適用後の累積金額（元金 + 利息）です。
* `P` は元金額（初期投資額）です。
* `r` は年利率（小数）です。
* `n` は1年間に利息が複利計算される回数です。
* `t` は資金が投資される期間（年単位）です。

コードを更新して、次のことを行ってください：

1. [`kotlin.math` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)から必要な関数をインポートします。
2. 複利を適用した後の最終金額を計算する処理を `calculateCompoundInterest()` 関数に追加します。

```kotlin
// ここにコードを記述してください

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // ここにコードを記述してください
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" validate="false" id="kotlin-tour-libraries-exercise-1"}

```kotlin
import kotlin.math.*

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    return P * (1 + r / n).pow(n * t)
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="データ処理にかかる時間を計測する" id="libraries-exercise-2">

プログラム内で複数のデータ処理タスクを実行するのにかかる時間を計測したいと考えています。コードを更新して、[`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) パッケージから適切なインポート文と関数を追加してください。

```kotlin
// ここにコードを記述してください

fun main() {
    val timeTaken = /* ここにコードを記述してください */ {
        // データ処理をシミュレート
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // フィルタリングされたデータの処理をシミュレート
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例: 16 ms
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" validate="false" id="kotlin-tour-libraries-exercise-2"}

```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // データ処理をシミュレート
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // フィルタリングされたデータの処理をシミュレート
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例: 16 ms
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="実験的APIをオプトインする" id="libraries-exercise-3">

最新のKotlinリリースで利用可能な新しい機能が標準ライブラリにあります。それを試してみたいのですが、オプトインが必要です。この機能は [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/) に該当します。
コード内のオプトインはどのように記述すべきでしょうか？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 次のステップ {id="what-s-next"}

お疲れ様でした！中級者向けツアーを完了しました！体験について[フィードバックを共有](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)していただけますか？

次のステップとして、人気のあるKotlinアプリケーションのチュートリアルをぜひチェックしてください：

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>バックエンド向けKotlin</title>
        <p>Spring BootとKotlinでバックエンドアプリケーションを作成します。</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">開始する</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>クロスプラットフォームアプリケーションをゼロから作成し、ビジネスロジックとUIを共有します。</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">開始する</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
</list>