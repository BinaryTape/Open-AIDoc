[//]: # (title: ライブラリとAPI)

<no-index/>

Kotlinを最大限に活用するには、既存のライブラリやAPIを利用しましょう。そうすることで、車輪の再発明にかける時間を減らし、本来のコーディングにより多くの時間を充てることができます。

ライブラリは、一般的なタスクを簡素化する再利用可能なコードを提供します。ライブラリの内部には、関連するクラス、関数、ユーティリティをグループ化したパッケージやオブジェクトが含まれています。ライブラリは、開発者が自身のコード内で利用できる一連の関数、クラス、プロパティをAPI（Application Programming Interfaces）として公開します。

![KotlinのライブラリとAPI](kotlin-library-diagram.svg){width=600}

Kotlinで何ができるのかを見ていきましょう。

## 標準ライブラリ {id="the-standard-library"}

Kotlinには、コードを簡潔かつ表現力豊かにするための基本的な型、関数、コレクション、ユーティリティを提供する標準ライブラリ（standard library）があります。標準ライブラリの大部分（[`kotlin` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)内のすべて）は、明示的にインポートすることなく、どのKotlinファイルからでもすぐに利用できます。

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

ただし、標準ライブラリの一部の機能は、コードで使用する前にインポートが必要です。
例えば、標準ライブラリの時間計測機能を使用したい場合は、[`kotlin.time` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)をインポートする必要があります。

ファイルの先頭に `import` キーワードを追加し、その後に必要なパッケージを指定します。

```kotlin
import kotlin.time.*
```

アスタリスク `*` はワイルドカードインポートであり、パッケージ内のすべての要素をインポートするようKotlinに指示します。なお、コンパニオンオブジェクトに対してアスタリスク `*` を使用することはできません。代わりに、使用したいコンパニオンオブジェクトのメンバーを明示的に宣言する必要があります。

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

この例では以下を行っています。

* `Duration` クラスと、そのコンパニオンオブジェクトから `hours` および `minutes` 拡張プロパティをインポートしています。
* `minutes` プロパティを使用して、`30` を30分の `Duration` に変換しています。
* `hours` プロパティを使用して、`0.5` を30分の `Duration` に変換しています。
* 両方の期間（Duration）が等しいかどうかをチェックし、結果を出力しています。

### 自作する前に探す {id="search-before-you-build"}

自分でコードを書く前に、求めているものが標準ライブラリにすでに存在しないか確認しましょう。
標準ライブラリには、以下のような領域ですでに多数のクラス、関数、プロパティが用意されています。

* [コレクション（Collections）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [シーケンス（Sequences）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [文字列操作（String manipulation）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理（Time management）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

標準ライブラリに他に何が含まれているかを詳しく知るには、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/)を参照してください。

## Kotlinライブラリ {id="kotlin-libraries"}

標準ライブラリは多くの一般的なユースケースをカバーしていますが、対応していないケースもあります。幸いなことに、Kotlinチームやコミュニティによって、標準ライブラリを補完する幅広いライブラリが開発されています。例えば、[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) は、異なるプラットフォーム間で時間を管理するのに役立ちます。

便利なライブラリは[検索プラットフォーム](https://klibs.io/)で見つけることができます。それらを使用するには、依存関係やプラグインを追加するなどの追加の手順が必要です。各ライブラリのGitHubリポジトリには、Kotlinプロジェクトに導入するための手順が記載されています。

ライブラリを追加したら、その中の任意のパッケージをインポートできます。以下は、ニューヨークの現在時刻を取得するために `kotlinx-datetime` パッケージをインポートする例です。

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

この例では以下を行っています。

* `kotlinx.datetime` パッケージをインポートしています。
* `Clock.System.now()` 関数を使用して現在時刻を含む `Instant` クラスのインスタンスを作成し、その結果を変数 `now` に代入しています。
* 現在時刻を出力しています。
* `TimeZone.of()` 関数を使用してニューヨークのタイムゾーンを取得し、その結果を変数 `zone` に代入しています。
* 現在時刻を保持するインスタンスに対して `.toLocalDateTime()` 関数を呼び出し、引数としてニューヨークのタイムゾーンを渡しています。
* その結果を変数 `localDateTime` に代入しています。
* ニューヨークのタイムゾーンに合わせて調整された時間を出力しています。

> この例で使用されている関数やクラスの詳細については、[APIリファレンス](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)を参照してください。
>
{style="tip"}

## APIへのオプトイン {id="opt-in-to-apis"}

ライブラリの作成者は、コードで使用する前に特定のAPIに対してオプトインを要求するように設定している場合があります。これは通常、APIがまだ開発中であり、将来変更される可能性がある場合に行われます。オプトインしない場合、次のような警告やエラーが表示されます。

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

オプトインするには、`@OptIn` の後に括弧を記述し、その中にAPIを分類するクラス名を指定して、末尾に2つのコロン `::` と `class` を付けます。

例えば、標準ライブラリの `uintArrayOf()` 関数は、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)に示されているように `@ExperimentalUnsignedTypes` の対象となっています。

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

これは最も簡単なオプトインの方法ですが、他にも方法はあります。詳細については、[オプトイン要件](opt-in-requirements.md)を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="複利の計算" id="libraries-exercise-1">

あなたは、ユーザーが投資の将来価値を計算できるようにする金融アプリケーションを開発しています。複利を計算する計算式は以下のとおりです。

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

ここで：

* `A` は利息を含めた累積金額（元金 ＋ 利息）です。
* `P` は元金額（初期投資額）です。
* `r` は年利（小数）です。
* `n` は1年あたりの利息の複利計算回数です。
* `t` は資金が投資される期間（年数）です。

以下のコードを更新してください。

1. [`kotlin.math` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)から必要な関数をインポートします。
2. 複利を適用した後の最終金額を計算する処理を `calculateCompoundInterest()` 関数の本体に追加します。

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
<def title="データ処理にかかる時間の計測" id="libraries-exercise-2">

プログラム内の複数のデータ処理タスクにかかる時間を計測したいと考えています。コードを更新して、[`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) パッケージから正しいインポート文と関数を追加してください。

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
<def title="実験的APIへのオプトイン" id="libraries-exercise-3">

最新のKotlinリリースで利用可能な新しい機能が標準ライブラリに追加されました。それを試してみたいのですが、オプトインが必要です。この機能は [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/) の対象です。
コード内でのオプトインはどのように記述すべきでしょうか？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 次のステップ {id="what-s-next"}

お疲れ様でした！これで中級ツアーは完了です。体験に関する[フィードバックを共有](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)していただけますか？

次のステップとして、人気のKotlinアプリケーションに関するチュートリアルをご覧ください。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>バックエンド向けKotlin</title>
        <p>Spring BootとKotlinを使用してバックエンドアプリケーションを作成します。</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">開始</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>クロスプラットフォームアプリケーションをゼロから作成し、ビジネスロジックとUIを共有します。</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-new-project.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">開始</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
</list>