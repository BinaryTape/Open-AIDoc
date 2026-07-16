[//]: # (title: Null安全)

Null安全（Null safety）は、[「10億ドルの間違い（The Billion-Dollar Mistake）」](https://en.wikipedia.org/wiki/Null_pointer#History)としても知られるnull参照のリスクを大幅に軽減するために設計されたKotlinの機能です。

Javaを含む多くのプログラミング言語における最も一般的な落とし穴の一つは、null参照のメンバーにアクセスすると、null参照例外が発生することです。Javaでは、これは `NullPointerException`（略して *NPE*）に相当します。

Kotlinは型システムの一部としてnull許容性（nullability）を明示的にサポートしています。これは、どの変数やプロパティが `null` を保持できるかを明示的に宣言できることを意味します。また、非null変数を宣言すると、コンパイル時にそれらの変数が `null` 値を保持できないことが強制され、NPEを防ぐことができます。

KotlinのNull安全は、実行時ではなくコンパイル時に潜在的なnull関連の問題をキャッチすることで、より安全なコードを保証します。この機能は、`null` 値を明示的に表現することで、コードの堅牢性、可読性、および保守性を向上させ、コードの理解と管理を容易にします。

KotlinでNPEが発生する可能性がある唯一の原因は以下の通りです：

* [`throw NullPointerException()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/) を明示的に呼び出した場合。
* [非nullアサーション演算子 `!!`](#not-null-assertion-operator) を使用した場合。
* 初期化中のデータの不整合。例えば以下のようなケース：
  * コンストラクタで使用可能な未初期化の `this` が他の場所で使用された場合（[「リークする `this`」](https://youtrack.jetbrains.com/issue/KTIJ-9751)）。
  * [スーパークラスのコンストラクタがオープンメンバーを呼び出し](inheritance.md#derived-class-initialization-order)、その派生クラスでの実装が未初期化の状態を使用している場合。
* Javaとの相互運用：
  * [プラットフォーム型](java-interop.md#null-safety-and-platform-types)の `null` 参照のメンバーにアクセスしようとした場合。
  * ジェネリック型に関するnull許容性の問題。例えば、JavaのコードがKotlinの `MutableList<String>` に `null` を追加した場合。これを正しく扱うには `MutableList<String?>` が必要になります。
  * 外部のJavaコードによって引き起こされるその他の問題。

> NPE以外に、Null安全に関連する別の例外として [`UninitializedPropertyAccessException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-uninitialized-property-access-exception/) があります。Kotlinは、初期化されていないプロパティにアクセスしようとしたときにこの例外をスローし、非nullプロパティが準備できるまで使用されないことを保証します。これは通常、[`lateinit` プロパティ](properties.md#late-initialized-properties-and-variables)で発生します。
>
{style="tip"}

## Null許容型と非null型

Kotlinの型システムは、`null` を保持できる型（nullable types）と保持できない型（non-nullable types）を区別します。例えば、通常の `String` 型の変数は `null` を保持できません。

```kotlin
fun main() {
//sampleStart
    // 非null文字列を変数に代入
    var a: String = "abc"
    // 非null変数にnullを再代入しようとする
    a = null
    print(a)
    // Null can not be a value of a non-null type String (nullは非null型Stringの値にはなれません)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

`a` に対してメソッドを呼び出したりプロパティにアクセスしたりすることは安全に行えます。`a` は非null変数であるため、NPEを引き起こさないことが保証されています。コンパイラは `a` が常に有効な `String` 値を保持することを保証するため、`null` のときにそのプロパティやメソッドにアクセスするリスクはありません。

```kotlin
fun main() {
//sampleStart
    // 非null文字列を変数に代入
    val a: String = "abc"
    // 非null変数の長さを返す
    val l = a.length
    print(l)
    // 3
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

`null` 値を許可するには、変数の型の直後に `?` を付けて宣言します。例えば、`String?` と書くことで、nullableな文字列を宣言できます。この表現により、`String` は `null` を受け入れられる型になります。

```kotlin
fun main() {
//sampleStart
    // nullableな文字列を変数に代入
    var b: String? = "abc"
    // nullableな変数にnullを正常に再代入
    b = null
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

`b` に対して直接 `length` にアクセスしようとすると、コンパイラはエラーを報告します。これは `b` がnullableな変数として宣言されており、`null` 値を保持する可能性があるためです。nullableなものに対して直接プロパティにアクセスしようとすると、NPEにつながる可能性があります。

```kotlin
fun main() {
//sampleStart
    // nullableな文字列を変数に代入
    var b: String? = "abc"
    // nullableな変数にnullを再代入
    b = null
    // nullableな変数の長さを直接返そうとする
    val l = b.length
    print(l)
    // Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type String? 
    // (String?型のnullableなレシーバーには、安全な呼び出し(?.)または非nullアサーション(!!.)のみが許可されます)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

上記の例では、コンパイラはプロパティにアクセスしたり操作を実行したりする前に、null許容性をチェックするために安全な呼び出し（safe call）を使用することを要求します。nullableなものを扱う方法はいくつかあります。

* [`if` 条件式による `null` チェック](#check-for-null-with-the-if-conditional)
* [安全呼び出し演算子 `?.`](#safe-call-operator)
* [エルビス演算子 `?:`](#elvis-operator)
* [非nullアサーション演算子 `!!`](#not-null-assertion-operator)
* [Nullableレシーバー](#nullable-receiver)
* [`let` 関数](#let-function)
* [安全なキャスト `as?`](#safe-casts)
* [Nullable型のコレクション](#collections-of-a-nullable-type)

詳細と `null` 処理のツールやテクニックの例については、次のセクションを読んでください。

## if条件式によるnullチェック

nullableな型を扱うときは、NPEを避けるためにnull許容性を安全に処理する必要があります。一つの方法は、`if` 条件式を使用して明示的にnull許容性をチェックすることです。

例えば、`b` が `null` かどうかをチェックしてから `b.length` にアクセスします：

```kotlin
fun main() {
//sampleStart
    // nullableな変数にnullを代入
    val b: String? = null
    // 最初にnull許容性をチェックし、その後lengthにアクセス
    val l = if (b != null) b.length else -1
    print(l)
    // -1
//sampleEnd
}
```
{kotlin-runnable="true"}

上記の例では、コンパイラは[スマートキャスト](typecasts.md#smart-casts)を実行して、型をnullableな `String?` から非nullの `String` に変更します。また、実行したチェックに関する情報を追跡し、`if` 条件式の内部で `length` の呼び出しを許可します。

より複雑な条件もサポートされています：

```kotlin
fun main() {
//sampleStart
    // nullableな文字列を変数に代入
    val b: String? = "Kotlin"

    // 最初にnull許容性をチェックし、その後lengthにアクセス
    if (b != null && b.length > 0) {
        print("String of length ${b.length}")
        // String of length 6
    } else {
        // 条件が満たされない場合の代替手段を提供
        print("Empty string")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

上記の例は、[スマートキャストの前提条件](typecasts.md#smart-cast-prerequisites)と同様に、コンパイラがチェックとその使用の間に `b` が変更されないことを保証できる場合にのみ機能することに注意してください。

## 安全呼び出し演算子

安全呼び出し（safe call）演算子 `?.` を使用すると、null許容性をより短い形式で安全に処理できます。オブジェクトが `null` の場合、`?.` 演算子はNPEをスローする代わりに、単に `null` を返します。

```kotlin
fun main() {
//sampleStart
    // nullableな文字列を変数に代入
    val a: String? = "Kotlin"
    // nullableな変数にnullを代入
    val b: String? = null
    
    // null許容性をチェックし、長さまたはnullを返す
    println(a?.length)
    // 6
    println(b?.length)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

`b?.length` という式は、null許容性をチェックし、`b` が非nullであれば `b.length` を返し、そうでなければ `null` を返します。この式の型は `Int?` になります。

Kotlinでは、[`var` および `val` 変数](basic-syntax.md#variables)の両方で `?.` 演算子を使用できます。

* nullableな `var` は、`null`（例：`var nullableValue: String? = null`）または非null値（例：`var nullableValue: String? = "Kotlin"`）を保持できます。非null値である場合、いつでも `null` に変更できます。
* nullableな `val` は、`null`（例：`val nullableValue: String? = null`）または非null値（例：`val nullableValue: String? = "Kotlin"`）を保持できます。非null値である場合、その後 `null` に変更することはできません。

安全呼び出しはチェーン（連鎖）させると便利です。例えば、Bobという従業員が部署に配属されている（あるいはされていない）可能性があるとします。その部署には、別の従業員が部長として存在するかもしれません。Bobの部長の名前（もし存在すれば）を取得するには、次のように記述します：

```kotlin
bob?.department?.head?.name
```

このチェーンは、プロパティのいずれかが `null` であれば `null` を返します。

また、代入の左側に安全呼び出しを配置することもできます：

```kotlin
person?.department?.head = managersPool.getManager()
```

上記の例で、安全呼び出しチェーン内のレシーバーのいずれかが `null` の場合、代入はスキップされ、右側の式は一切評価されません。例えば、`person` または `person.department` のいずれかが `null` の場合、関数は呼び出されません。以下は、同じ安全呼び出しを `if` 条件式で書いた場合の同等のコードです：

```kotlin
if (person != null && person.department != null) {
    person.department.head = managersPool.getManager()
}
```

## エルビス演算子

nullableな型を扱うとき、`null` かどうかをチェックして代替値を提供できます。例えば、`b` が `null` でなければ `b.length` にアクセスし、そうでなければ代替値を返すようにします：

```kotlin
fun main() {
//sampleStart
    // nullableな変数にnullを代入
    val b: String? = null
    // null許容性をチェック。nullでなければ長さを返し、nullなら0を返す
    val l: Int = if (b != null) b.length else 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

完全な `if` 式を書く代わりに、エルビス演算子（Elvis operator） `?:` を使ってより簡潔に記述できます。

```kotlin
fun main() {
//sampleStart
    // nullableな変数にnullを代入
    val b: String? = null
    // null許容性をチェック。nullでなければ長さを返し、nullなら非null値を返す
    val l = b?.length ?: 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

`?:` の左側の式が `null` でなければ、エルビス演算子はそれを返します。そうでなければ、右側の式を返します。右側の式は、左側が `null` の場合にのみ評価されることに注意してください。

Kotlinでは `throw` や `return` も式であるため、エルビス演算子の右側で使用することもできます。これは、例えば関数の引数をチェックする場合などに非常に便利です：

```kotlin
fun foo(node: Node): String? {
    // getParent()をチェック。nullでなければparentに代入。nullならnullを返す
    val parent = node.getParent() ?: return null
    // getName()をチェック。nullでなければnameに代入。nullなら例外をスロー
    val name = node.getName() ?: throw IllegalArgumentException("name expected")
    // ...
}
```

## 非nullアサーション演算子

非nullアサーション演算子 `!!` は、あらゆる値を非null型に変換します。

値が `null` ではない変数に `!!` 演算子を適用すると、それは安全に非null型として扱われ、コードは正常に実行されます。しかし、値が `null` の場合、`!!` 演算子はそれを強制的に非nullとして扱おうとし、結果としてNPEが発生します。

`b` が `null` ではなく、`!!` 演算子によってその非null値（この例では `String`）が返される場合、`length` に正しくアクセスできます。

```kotlin
fun main() {
//sampleStart
    // nullableな文字列を変数に代入
    val b: String? = "Kotlin"
    // bを非nullとして扱い、その長さにアクセス
    val l = b!!.length
    println(l)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

`b` が `null` で、`!!` 演算子が非null値を返そうとすると、NPEが発生します。

```kotlin
fun main() {
//sampleStart
    // nullableな変数にnullを代入
    val b: String? = null
    // bを非nullとして扱い、その長さにアクセスしようとする
    val l = b!!.length
    println(l) 
    // Exception in thread "main" java.lang.NullPointerException
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

`!!` 演算子は、ある値が `null` ではなくNPEが発生する可能性がないと確信しているが、特定のルールのためにコンパイラがそれを保証できない場合に特に便利です。そのような場合、`!!` 演算子を使用して、値が `null` ではないことを明示的にコンパイラに伝えることができます。

## Nullableレシーバー

[nullableなレシーバー型](extensions.md#nullable-receivers)を持つ拡張関数を使用することができ、これにより `null` になる可能性のある変数に対してこれらの関数を呼び出すことができます。

nullableなレシーバー型に対して拡張関数を定義することで、関数を呼び出すたびに `null` チェックを行う代わりに、関数自体の中で `null` 値を処理できます。

例えば、[`.toString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to-string.html) 拡張関数は、nullableなレシーバーに対して呼び出すことができます。`null` 値に対して呼び出された場合、例外をスローすることなく安全に文字列 `"null"` を返します。

```kotlin
//sampleStart
fun main() {
    // person変数に格納されたnullableなPersonオブジェクトにnullを代入
    val person: Person? = null

    // nullableなperson変数に.toStringを適用し、文字列を出力
    println(person.toString())
    // null
}

// シンプルなPersonクラスを定義
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

上記の例では、`person` が `null` であっても、`.toString()` 関数は安全に文字列 `"null"` を返します。これはデバッグやロギングに役立ちます。

もし `.toString()` 関数がnullableな文字列（文字列表現または `null`）を返すことを期待する場合は、[安全呼び出し演算子 `?.`](#safe-call-operator) を使用してください。`?.` 演算子はオブジェクトが `null` でない場合にのみ `.toString()` を呼び出し、そうでなければ `null` を返します。

```kotlin
//sampleStart
fun main() {
    // nullableなPersonオブジェクトを変数に代入
    val person1: Person? = null
    val person2: Person? = Person("Alice")

    // personがnullなら"null"を出力。そうでなければperson.toString()の結果を出力
    println(person1?.toString())
    // null
    println(person2?.toString())
    // Person(name=Alice)
}

// Personクラスを定義
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

`?.` 演算子を使用すると、`null` になる可能性のあるオブジェクトのプロパティや関数にアクセスしつつ、潜在的な `null` 値を安全に処理できます。

## Let関数

`null` 値を処理し、非null型に対してのみ操作を実行するには、安全呼び出し演算子 `?.` を [`let` 関数](scope-functions.md#let) と組み合わせて使用できます。

この組み合わせは、式を評価し、結果が `null` かどうかをチェックして、`null` でない場合にのみコードを実行するのに便利で、手動のnullチェックを避けることができます。

```kotlin
fun main() {
//sampleStart
    // nullableな文字列のリストを宣言
    val listWithNulls: `List<String?>` = listOf("Kotlin", null)

    // リストの各項目に対して反復処理
    for (item in listWithNulls) {
        // 項目がnullかどうかをチェックし、非null値のみを出力
        item?.let { println(it) }
        //Kotlin 
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 安全なキャスト

Kotlinにおける通常の[型キャスト](typecasts.md#unsafe-cast-operator)演算子は `as` 演算子です。しかし、通常のキャストでは、オブジェクトが対象の型でない場合に例外が発生する可能性があります。

安全なキャストには `as?` 演算子を使用できます。これは値を指定された型にキャストしようと試み、値がその型でない場合は `null` を返します。

```kotlin
fun main() {
//sampleStart
    // 任意の型の値を保持できるAny型の変数を宣言
    val a: Any = "Hello, Kotlin!"

    // 'as?' 演算子を使用してIntへ安全にキャスト
    val aInt: Int? = a as? Int
    // 'as?' 演算子を使用してStringへ安全にキャスト
    val aString: String? = a as? String

    println(aInt)
    // null
    println(aString)
    // "Hello, Kotlin!"
//sampleEnd
}
```
{kotlin-runnable="true"}

上記のコードでは、`a` は `Int` ではないためキャストが安全に失敗し、`null` が出力されます。また、`String?` 型には一致するため、安全なキャストが成功し、`"Hello, Kotlin!"` が出力されます。

## Nullable型のコレクション

nullableな要素のコレクションがあり、非nullの要素だけを保持したい場合は、`filterNotNull()` 関数を使用します。

```kotlin
fun main() {
//sampleStart
    // nullと非nullの整数値を含むリストを宣言
    val nullableList: `List<Int?>` = listOf(1, 2, null, 4)

    // null値をフィルタリングし、結果として非nullの整数のリストを得る
    val intList: `List<Int>` = nullableList.filterNotNull()
  
    println(intList)
    // [1, 2, 4]
//sampleEnd
}
```
{kotlin-runnable="true"}

## 次のステップ

* [JavaとKotlinにおけるnull許容性の扱い方](java-to-kotlin-nullability-guide.md)を学ぶ。
* [確実に非nullな型（definitely non-nullable types）](generics.md#definitely-non-nullable-types)であるジェネリック型について学ぶ。