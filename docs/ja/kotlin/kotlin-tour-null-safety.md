[//]: # (title: Null安全性)

<no-index/>

Kotlinでは、`null` 値を持つことができます。Kotlinは、何かが欠落しているか、まだ設定されていない場合に `null` 値を使用します。
[コレクション](kotlin-tour-collections.md#kotlin-tour-map-no-key)の章で、マップに存在しないキーを使ってキーと値のペアにアクセスしようとしたときに、Kotlinが `null` 値を返す例をすでに見ました。
このように `null` 値を使用するのは便利ですが、コードがそれらを処理するように準備されていない場合、問題が発生する可能性があります。

プログラムでの `null` 値に関する問題を防ぐために、KotlinにはNull安全性（null safety）が備わっています。Null安全性は、実行時ではなくコンパイル時に `null` 値に関する潜在的な問題を検出します。

Null安全性は、以下のことを可能にする一連の機能です。

* プログラム内でいつ `null` 値が許可されるかを明示的に宣言する。
* `null` 値をチェックする。
* `null` 値を含む可能性のあるプロパティや関数に対して安全呼び出し（safe call）を使用する。
* `null` 値が検出された場合に実行するアクションを宣言する。

## Null許容型 {id="nullable-types"}

KotlinはNull許容型（nullable types）をサポートしており、宣言された型が `null` 値を持つ可能性を許容します。デフォルトでは、型は `null` 値を受け入れることが**できません**。Null許容型は、型宣言の後に明示的に `?` を追加することによって宣言されます。

例えば：

```kotlin
fun main() {
    // neverNullはString型
    var neverNull: String = "This can't be null"

    // コンパイラエラーをスロー
    neverNull = null

    // nullableはNull許容のString型
    var nullable: String? = "You can keep a null here"

    // これはOK
    nullable = null

    // デフォルトでは、null値は受け入れられません
    var inferredNonNull = "The compiler assumes non-nullable"

    // コンパイラエラーをスロー
    inferredNonNull = null

    // notNullはnull値を受け入れません
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // コンパイラエラーをスロー
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` は、文字列内の文字数を含む [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) クラスのプロパティです。
>
{style="tip"}

## Null値のチェック {id="check-for-null-values"}

条件式の中で `null` 値の存在をチェックできます。次の例では、`describeString()` 関数に `if` 文があり、`maybeString` が `null` で**ない**こと、およびその `length` が0より大きいかどうかをチェックしています。

```kotlin
fun describeString(maybeString: String?): String {
    if (maybeString != null && maybeString.length > 0) {
        return "String of length ${maybeString.length}"
    } else {
        return "Empty or null string"
    }
}

fun main() {
    val nullString: String? = null
    println(describeString(nullString))
    // Empty or null string
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-check-nulls"}

## 安全呼び出しの使用 {id="use-safe-calls"}

`null` 値を含む可能性のあるオブジェクトのプロパティに安全にアクセスするには、安全呼び出し演算子（safe call operator）`?.` を使用します。安全呼び出し演算子は、オブジェクトまたはアクセスされたそのプロパティのいずれかが `null` の場合に `null` を返します。これは、`null` 値の存在によってコード内でエラーが発生するのを防ぎたい場合に便利です。

次の例では、`lengthString()` 関数が安全呼び出しを使用して、文字列の長さまたは `null` のいずれかを返します。

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 安全呼び出しはチェーン（連鎖）させることができるため、オブジェクトのいずれかのプロパティに `null` 値が含まれている場合、エラーがスローされることなく `null` が返されます。例えば：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼び出し演算子は、拡張関数やメンバ関数を安全に呼び出すためにも使用できます。この場合、関数が呼び出される前にnullチェックが実行されます。チェックで `null` 値が検出された場合、呼び出しはスキップされ、`null` が返されます。

次の例では、`nullString` が `null` であるため、[`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) の呼び出しはスキップされ、`null` が返されます。

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## Elvis演算子の使用 {id="use-elvis-operator"}

**Elvis演算子** `?:` を使用すると、`null` 値が検出された場合に返すデフォルト値を指定できます。

Elvis演算子の左辺には、`null` 値かどうかをチェックする対象を記述します。
Elvis演算子の右辺には、`null` 値が検出された場合に返すべき値を記述します。

次の例では、`nullString` が `null` であるため、`length` プロパティへの安全呼び出しアクセスは `null` 値を返します。
その結果、Elvis演算子は `0` を返します。

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

KotlinのNull安全性に関する詳細については、[Null安全性](null-safety.md)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="従業員の給与を計算する" id="null-safety-basics-exercise-1">

会社の従業員データベースへのアクセスを提供する `employeeById` 関数があります。残念ながら、この関数は `Employee?` 型の値を返すため、結果が `null` になる可能性があります。あなたの目標は、従業員の `id` が提供されたときにその給与を返し、従業員がデータベースに存在しない場合は `0` を返す関数を作成することです。

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // ここにコードを記述してください

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = employeeById(id)?.salary ?: 0

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 次のステップ {id="what-s-next"}

おめでとうございます！初級ツアーを完了しました。中級ツアーに進んで、Kotlinへの理解をさらに深めましょう：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">Kotlin中級ツアーを開始する</a>
  </li>
</list>