[//]: # (title: ライブラリとAPI)

<no-index/>

Kotlinを最大限に活用するには、既存のライブラリやAPIを使用して、車輪の再発明を避け、コーディングにより多くの時間を割けるようにしましょう。

ライブラリは、一般的なタスクを簡素化する再利用可能なコードを配布するものです。ライブラリ内には、関連するクラス、関数、ユーティリティをグループ化したパッケージやオブジェクトがあります。ライブラリは、開発者が自身のコードで使用できる関数、クラス、プロパティのセットとしてAPI（Application Programming Interface）を公開します。

![KotlinのライブラリとAPI](kotlin-library-diagram.svg){width=600}

Kotlinで何ができるか見ていきましょう。

## 標準ライブラリ

Kotlinには、コードを簡潔で表現豊かにするための必須の型、関数、コレクション、ユーティリティを提供する標準ライブラリがあります。標準ライブラリの大部分（[`kotlin` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)内のすべて）は、明示的にインポートすることなく、どのKotlinファイルでもすぐに利用できます。

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 標準ライブラリの reversed() 関数を使用する
    val reversedText = text.reversed()

    // 標準ライブラリの print() 関数を使用する
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

ただし、標準ライブラリの一部には、コードで使用する前にインポートが必要なものもあります。 
例えば、標準ライブラリの時間計測機能を使用したい場合は、[`kotlin.time` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)をインポートする必要があります。

ファイルの先頭に、`import` キーワードに続けて必要なパッケージを追加します。

```kotlin
import kotlin.time.*
```

アスタリスク `*` はワイルドカードインポートで、そのパッケージ内のすべてのものをインポートするようKotlinに指示します。アスタリスク `*` はコンパニオンオブジェクトには使用できません。代わりに、使用したいコンパニオンオブジェクトのメンバを明示的に宣言する必要があります。

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
* `minutes` プロパティを使用して、`30` を30分の `Duration` に変換しています。
* `hours` プロパティを使用して、`0.5` を30分の `Duration` に変換しています。
* 両方の期間が等しいかどうかを確認し、結果を出力しています。

### 作る前に探す

独自のコードを書くと決める前に、探しているものがすでに存在するかどうかを標準ライブラリで確認してください。以下は、標準ライブラリがすでに多数のクラス、関数、プロパティを提供している分野のリストです。

* [コレクション](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [シーケンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [文字列操作](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [時間管理](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

標準ライブラリに他に何があるか詳しく知るには、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/)を探索してください。

## Kotlinライブラリ

標準ライブラリは多くの一般的なユースケースをカバーしていますが、対応していないものもあります。幸いなことに、Kotlinチームやコミュニティは標準ライブラリを補完するために幅広いライブラリを開発しています。例えば、[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) は、異なるプラットフォーム間で時間を管理するのに役立ちます。

有用なライブラリは、[検索プラットフォーム](https://klibs.io/)で見つけることができます。それらを使用するには、依存関係やプラグインの追加といった追加の手順が必要です。各ライブラリには、Kotlinプロジェクトにそれを含める方法が記載されたGitHubリポジトリがあります。

ライブラリを追加したら、その中の任意のパッケージをインポートできます。以下は、ニューヨークの現在時刻を確認するために `kotlinx-datetime` パッケージをインポートする例です。

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 現在の瞬間を取得
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

この例では：

* `kotlinx.datetime` パッケージをインポートしています。
* `Clock.System.now()` 関数を使用して、現在時刻を含む `Instant` クラスのインスタンスを作成し、その結果を `now` 変数に代入しています。
* 現在時刻を出力しています。
* `TimeZone.of()` 関数を使用してニューヨークのタイムゾーンを見つけ、その結果を `zone` 変数に代入しています。
* 現在時刻を含むインスタンスに対して `.toLocalDateTime()` 関数を呼び出し、引数としてニューヨークのタイムゾーンを渡しています。
* 結果を `localDateTime` 変数に代入しています。
* ニューヨークのタイムゾーンに調整された時刻を出力しています。

> この例で使用されている関数やクラスの詳細については、[APIリファレンス](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)を参照してください。
>
{style="tip"}

## APIへのオプトイン

ライブラリの作者は、特定のAPIをコードで使用する前にオプトイン（承認）が必要であるとマークする場合があります。これは通常、APIがまだ開発中であり、将来変更される可能性がある場合に行われます。オプトインしない場合、以下のような警告やエラーが表示されます。

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

オプトインするには、`@OptIn` と書き、その後にAPIを分類するクラス名を括弧で囲み、末尾に2つのコロン `::` と `class` を付けます。

例えば、標準ライブラリの `uintArrayOf()` 関数は、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)に示されているように、`@ExperimentalUnsignedTypes` に該当します。

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

コード内でのオプトインは以下のようになります。

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下は、`uintArrayOf()` 関数を使用して符号なし整数の配列を作成し、その要素の1つを変更するためにオプトインする例です。

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

これはオプトインの最も簡単な方法ですが、他にも方法はあります。詳細については、[オプトイン要件](opt-in-requirements.md)を参照してください。

## 練習問題 {completion-point="true"}

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-1"}

ユーザーが投資の将来価値を計算するのを助ける財務アプリケーションを開発しています。複利を計算する公式は以下の通りです。

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

ここで：

* `A` は、利息適用後の累積金額（元本 + 利息）。
* `P` は元本（初期投資額）。
* `r` は年利率（小数）。
* `n` は1年あたりの複利計算回数。
* `t` は投資期間（年）。

コードを更新して以下を行ってください。

1. [`kotlin.math` パッケージ](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)から必要な関数をインポートします。
2. 複利適用後の最終的な金額を計算する処理を `calculateCompoundInterest()` 関数の本体に追加します。

|--|--|

```kotlin
// ここにコードを書いてください

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // ここにコードを書いてください
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

|---|---|
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

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-2"}

プログラム内で複数のデータ処理タスクを実行するのにかかる時間を計測したいと考えています。コードを更新して、[`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) パッケージから正しいインポート文と関数を追加してください。

|---|---|

```kotlin
// ここにコードを書いてください

fun main() {
    val timeTaken = /* ここにコードを書いてください */ {
        // 何らかのデータ処理をシミュレート
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

|---|---|
```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 何らかのデータ処理をシミュレート
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

### 演習 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

最新のKotlinリリースで利用可能な標準ライブラリの新機能があります。それを試してみたいのですが、オプトインが必要です。その機能は [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/) に該当します。コード内でのオプトインはどのようになるべきですか？

|---|---|
```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-libraries-solution-3"}

## 次のステップ

おめでとうございます！中級編のツアーを完了しました。今回の体験について[フィードバックを共有](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)していただけませんか？ 

次のステップとして、人気のKotlinアプリケーションのチュートリアルをチェックしてください。

* [Spring BootとKotlinでバックエンドアプリケーションを作成する](jvm-create-project-with-spring-boot.md)
* AndroidとiOS向けのクロスプラットフォームアプリケーションをゼロから作成する：
    * [UIをネイティブに保ちつつビジネスロジックを共有する](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
    * [ビジネスロジックとUIを共有する](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
</list>