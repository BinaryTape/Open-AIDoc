[//]: # (title: Null 安全性)

<no-index/>

Kotlin では、`null` 値を持つことが可能です。Kotlin は、何かが欠落している場合や、まだ設定されていない場合に `null` 値を使用します。
[コレクション](kotlin-tour-collections.md#kotlin-tour-map-no-key)の章で、マップに存在しないキーを使用してキーと値のペアにアクセスしようとしたときに、Kotlin が `null` 値を返す例を既に見ました。このように `null` 値を使用することは便利ですが、コードがそれらを処理するように準備されていない場合、問題が発生する可能性があります。

プログラム内での `null` 値に関する問題を防止するために、Kotlin には Null 安全性 (Null safety) が備わっています。Null 安全性は、`null` 値に関する潜在的な問題を、実行時 (run time) ではなくコンパイル時 (compile time) に検出します。

Null 安全性は、以下のことを可能にする機能の組み合わせです：

* プログラム内で `null` 値が許可される場合を明示的に宣言する。
* `null` 値をチェックする。
* `null` 値が含まれている可能性のあるプロパティや関数に対して、安全呼び出し (Safe call) を使用する。
* `null` 値が検出された場合に実行するアクションを宣言する。

## Null 許容型 (Nullable types)

Kotlin は、宣言された型が `null` 値を持つ可能性を許容する「Null 許容型」をサポートしています。デフォルトでは、型は `null` 値を受け入れることが**できません**。Null 許容型は、型宣言の後に明示的に `?` を追加することで宣言します。

例：

```kotlin
fun main() {
    // neverNull は String 型
    var neverNull: String = "This can't be null"

    // コンパイラエラーをスローします
    neverNull = null

    // nullable は Null 許容 String 型
    var nullable: String? = "You can keep a null here"

    // これは OK です
    nullable = null

    // デフォルトでは、null 値は受け入れられません
    var inferredNonNull = "The compiler assumes non-nullable"

    // コンパイラエラーをスローします
    inferredNonNull = null

    // notNull は null 値を受け入れません
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // コンパイラエラーをスローします
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` は [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) クラスのプロパティで、文字列内の文字数を含んでいます。
>
{style="tip"}

## Null 値のチェック

条件式の中で `null` 値の存在をチェックできます。次の例では、`describeString()` 関数に、`maybeString` が `null` **ではなく**、かつその `length` が 0 より大きいかどうかをチェックする `if` 文があります。

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

## 安全呼び出しの使用

`null` 値を含んでいる可能性のあるオブジェクトのプロパティに安全にアクセスするには、安全呼び出し演算子 `?.` を使用します。安全呼び出し演算子は、オブジェクトまたはアクセスされたプロパティのいずれかが `null` の場合に `null` を返します。これは、`null` 値の存在によってコード内でエラーが発生するのを避けたい場合に便利です。

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

> 安全呼び出しは連鎖（チェーン）させることができるため、オブジェクトのいずれかのプロパティに `null` 値が含まれている場合、エラーをスローすることなく `null` が返されます。例：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼び出し演算子は、拡張関数やメンバ関数を安全に呼び出すためにも使用できます。この場合、関数が呼び出される前に null チェックが行われます。チェックによって `null` 値が検出された場合、呼び出しはスキップされ、`null` が返されます。

次の例では、`nullString` が `null` であるため、[`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) の呼び出しはスキップされ、`null` が返されます。

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## エルビス演算子の使用

`null` 値が検出されたときに返すデフォルト値を指定するには、**エルビス演算子** (Elvis operator) `?:` を使用します。

エルビス演算子の左側には、`null` かどうかをチェックする対象を記述します。
エルビス演算子の右側には、`null` 値が検出された場合に返すべき値を記述します。

次の例では、`nullString` が `null` であるため、`length` プロパティにアクセスする安全呼び出しは `null` 値を返します。その結果、エルビス演算子は `0` を返します。

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

Kotlin の Null 安全性に関する詳細については、[Null 安全性](null-safety.md)を参照してください。

## 練習問題 {completion-point="true"}

### 演習 {initial-collapse-state="collapsed" collapsible="true"}

会社の従業員データベースにアクセスできる `employeeById` 関数があります。あいにく、この関数は `Employee?` 型の値を返すため、結果が `null` になる可能性があります。あなたの目標は、従業員の `id` が提供されたときにはその給与を返し、従業員がデータベースに存在しない場合には `0` を返す関数を記述することです。

|---|---|
```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // ここにコードを書いてください

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

|---|---|
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

## 次のステップ

おめでとうございます！初級ツアーを完了しました。次は中級ツアーで Kotlin の理解をさらに深めましょう：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">Kotlin 中級ツアーを開始する</a>
  </li>
</list>