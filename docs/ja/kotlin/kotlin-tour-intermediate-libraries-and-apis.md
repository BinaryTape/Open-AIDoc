[//]: # (title: ライブラリとAPI)

<no-index/>

Kotlinを最大限に活用するために、既存のライブラリやAPIを利用して、車輪の再発明に費やす時間を減らし、コーディングにより多くの時間を使いましょう。

ライブラリは、一般的なタスクを簡素化する再利用可能なコードを配布します。ライブラリ内には、関連するクラス、関数、ユーティリティをグループ化したパッケージやオブジェクトが存在します。ライブラリは、開発者が自身のコード内で利用できる関数、クラス、プロパティのセットとしてAPI（Application Programming Interface）を公開します。

![KotlinのライブラリとAPI](kotlin-library-diagram.svg){width=600}

Kotlinでどのようなことが可能になるのかを見ていきましょう。

## 標準ライブラリ {id="the-standard-library"}

Kotlinには、コードを簡潔かつ表現力豊かにするための基本的な型、関数、コレクション、ユーティリティを提供する標準ライブラリ（standard library）があります。標準ライブラリの大部分（[`kotlin` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)内のすべて）は、明示的にインポートすることなく、任意のKotlinファイルでそのまま利用できます。

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

ファイルの先頭に `import` キーワードを追加し、その後に必要なパッケージを記述します。

```kotlin
import kotlin.time.*
```

アスタリスク `*` はワイルドカードインポートで、パッケージ内のすべてをインポートするようKotlinに指示します。コンパニオンオブジェクトに対してアスタリスク `*` を使用することはできません。代わりに、使用したいコンパニオンオブジェクトのメンバーを明示的に宣言する必要があります。

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

* `Duration` クラスと、そのコンパニオンオブジェクトから `hours` および `minutes` 拡張プロパティをインポートしています。
* `minutes` プロパティを使用して `30` を30分の `Duration` に変換しています。
* `hours` プロパティを使用して `0.5` を30分の `Duration` に変換しています。
* 両方のDurationが等しいかどうかをチェックし、結果を出力しています。

### 作る前に探す（Search before you build） {id="search-before-you-build"}

自分でコードを書く前に、求めているものがすでに存在しないか標準ライブラリを確認してください。
以下は、標準ライブラリが多数のクラス、関数、プロパティをあらかじめ提供している分野のリストです。

* [コレクション（Collections）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [シーケンス（Sequences）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [文字列操作（String manipulation）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理（Time management）](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

標準ライブラリに他にどのようなものが含まれているかを詳しく知るには、その[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/)を参照してください。

## Kotlinライブラリ {id="kotlin-libraries"}

標準ライブラリは多くの一般的なユースケースをカバーしていますが、対応していないものもあります。幸いなことに、Kotlinチームやコミュニティは標準ライブラリを補完する幅広いライブラリを開発しています。例えば、[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/)は異なるプラットフォーム間での時間管理を支援します。

便利なライブラリは[検索プラットフォーム](https://klibs.io/)で見つけることができます。それらを使用するには、依存関係やプラグインを追加するなどの追加手順が必要です。各ライブラリには、Kotlinプロジェクトにそれを含める方法を説明したGitHubリポジトリがあります。

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

この例では：

* `kotlinx.datetime` パッケージをインポートしています。
* `Clock.System.now()` 関数を使用して現在時刻を含む `Instant` クラスのインスタンスを作成し、その結果を `now` 変数に代入しています。
* 現在時刻を出力しています。
* `TimeZone.of()` 関数を使用してニューヨークのタイムゾーンを取得し、その結果を `zone` 変数に代入しています。
* 現在時刻を含むインスタンスに対して `.toLocalDateTime()` 関数を呼び出し、引数としてニューヨークのタイムゾーンを渡しています。
* その結果を `localDateTime` 変数に代入しています。
* ニューヨークのタイムゾーンに合わせて調整された時刻を出力しています。

> この例で使用している関数やクラスの詳細については、[APIリファレンス](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)を参照してください。
>
{style="tip"}

## APIのオプトイン {id="opt-in-to-apis"}

ライブラリの作者は、コードで使用する前にオプトイン（明示的な利用許可）を要求するように特定のAPIをマークする場合があります。これは通常、APIがまだ開発中であり、将来変更される可能性がある場合に行われます。オプトインしない場合、以下のような警告またはエラーが表示されます。

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

オプトインするには、`@OptIn` と記述し、続けてAPIを分類するクラス名を丸括弧で囲み、末尾に2つのコロン `::` と `class` を付けます。

例えば、標準ライブラリの `uintArrayOf()` 関数は、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)に示されているように `@ExperimentalUnsignedTypes` に該当します。

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

コード内でのオプトインは次のようになります：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下は、`uintArrayOf()` 関数を使用して符号なし整数の配列を作成し、その要素の1つを変更するためにオプトインする例です：

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

これは最も簡単なオプトインの方法ですが、他にも方法があります。詳細については、[オプトインの要件](opt-in-requirements.md)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="複利の計算" id="libraries-exercise-1">

ユーザーが投資の将来価値を計算できるように支援する金融アプリケーションを開発しています。複利を計算する計算式は以下のとおりです。

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

ここで：

* `A` は利息発生後の元利合計額（元金 + 利息）。
* `P` は元金額（初期投資額）。
* `r` は年利（小数）。
* `n` は1年あたりの複利計算頻度（回数）。
* `t` は資金が投資される期間（年単位）。

次の手順に従ってコードを更新してください。

1. [`kotlin.math` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)から必要な関数をインポートします。
2. 複利適用後の最終金額を計算する処理を `calculateCompoundInterest()` 関数の本体に追加します。

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="データ処理にかかる時間の測定" id="libraries-exercise-2">

プログラム内の複数のデータ処理タスクにかかる時間を測定したいと考えています。コードを更新して、[`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) パッケージから正しいインポート文と関数を追加してください。

```kotlin
// ここにコードを記述してください

fun main() {
    val timeTaken = /* ここにコードを記述してください */ {
        // データ処理のシミュレーション
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // フィルタリングされたデータの処理をシミュレート
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例: 16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // データ処理のシミュレーション
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // フィルタリングされたデータの処理をシミュレート
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例: 16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="実験的APIへのオプトイン" id="libraries-exercise-3">

最新のKotlinリリースで利用可能な新機能が標準ライブラリに追加されました。それを試してみたいのですが、オプトインが必要です。この機能は [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/) に該当します。
コード内のオプトインはどのように記述すべきでしょうか？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 次のステップ {id="what-s-next"}

おめでとうございます！中級ツアーを完了しました！体験に関する[フィードバックを共有](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)していただけませんか？

次のステップとして、人気のあるKotlinアプリケーションのチュートリアルをご覧ください。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>バックエンド向けKotlin</title>
        <p>Spring BootとKotlinを使用してバックエンドアプリケーションを作成します。</p>
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