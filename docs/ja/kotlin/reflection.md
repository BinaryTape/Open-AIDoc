[//]: # (title: リフレクション)
<web-summary>Kotlinの組み込みリフレクションサポートと、完全なランタイムイントロスペクションのために独立したkotlin-reflectライブラリを使用する方法について学びます。</web-summary>

_リフレクション_（Reflection）は、実行時にプログラムの構造を調査（イントロスペクト）できるようにする言語およびライブラリ機能のセットです。
たとえば、プロパティの読み書き、関数の呼び出し、クラスコンストラクタを呼び出してインスタンスを生成することなどが可能です。これは、コンパイル時に宣言がわからない場合に役立ちます。

リフレクションは、コンパイルされた宣言を記述するランタイムオブジェクトを提供します。たとえば、クラスは [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)、型は [`KType`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-type/)、プロパティや関数は [`KCallable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) のサブタイプによって表されます。
これらのオブジェクトを調査し、値にアクセスしたり関数を呼び出したりするために使用できます。

## リフレクションの仕組み {id="how-reflection-works"}

[リフレクションAPI](https://kotlinlang.org/api/core/kotlin-reflect/) は、コンパイルされた宣言を `KClass` や `KFunction` などのKotlinの型を通して表現します。
リフレクションオブジェクトは宣言されたオブジェクトの値ではなく、宣言そのものを表します。たとえば、オブジェクトからそのプロパティを読み取ることなく、`KProperty` を使用してプロパティ名を取得し、その型を返すことができます。

Kotlinは、クラスリテラルや[呼び出し可能参照](lambdas.md#callable-reference)などのいくつかの基本機能を、言語および標準ライブラリの一部として提供しています。より広範なランタイムイントロスペクションを利用するには、[`kotlin-reflect`](https://kotlinlang.org/api/core/kotlin-reflect/) ライブラリをインポートしてください。

リフレクションAPIは以下のパッケージで構成されています:

* [`kotlin.reflect`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/): 標準ライブラリの一部であり、コアとなるリフレクションの型と関数が含まれています。
* [`kotlin.reflect.full`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/): Kotlinの宣言を調査するための拡張機能を含みます。
* [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/): KotlinとJavaのリフレクションを連携させるJVM固有の拡張機能を含みます。

> プラットフォームによってリフレクションのサポートが異なる場合があります。このページはKotlin/JVMのリフレクションAPIに準拠しています。[Kotlin/JSでのリフレクション](js-reflection.md)について詳しく確認してください。
> 
{style="note"}

### Javaリフレクションとの相互運用性 {id="interoperability-with-java-reflection"}

JVMでは、`kotlin-reflect` ライブラリの [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) パッケージで、KotlinとJavaのリフレクションオブジェクトを相互に変換する拡張機能が提供されています。たとえば、Kotlinプロパティのゲッターを実装するJavaメソッドや、プロパティのバッキングフィールドを見つけることができます:

```kotlin
import kotlin.reflect.jvm.*

class User(val name: String)

fun main() {
    println(User::name.javaGetter)
    // public final java.lang.String User.getName()

    println(User::name.javaField)
    // private final java.lang.String User.name
}
```

Kotlinのプロパティには必ずしも対応するJavaのフィールドやゲッターが存在するとは限らないため、一致するJavaリフレクションオブジェクトが存在しない場合、どちらのプロパティも `null` を返します。

Kotlinの `KClass` オブジェクトとJavaの `Class` オブジェクトの間で変換を行うこともできます。Javaクラスに対応するKotlinクラスを取得するには、`.kotlin` 拡張プロパティを使用します:

```kotlin
fun getKClass(o: Any): KClass<Any> = value.javaClass.kotlin
```

## ランタイムクラスの取得 {id="obtain-a-runtime-class"}

ほとんどのリフレクション操作は [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) から始まります。その取得方法は、コンパイル時にクラスが判明しているかどうかによって異なります:

* コンパイル時に判明しているクラスを参照するには、`ClassName::class` を使用します。
* 実行時の値の実際のクラスを取得するには、`value::class` を使用します。これは宣言された型よりも具体的な場合があります。

```kotlin
import kotlin.reflect.KClass

class User(val name: String)

open class Language
class Kotlin : Language()

fun main() {
    // User を表す KClass を返す
    val userClass: KClass<User> = User::class
    println(userClass.simpleName)
    // User
    
    val language: Language = Kotlin()

    // 実行時の値の具象クラスを表す
    // KClass を返す
    val runtimeClass: KClass<out Language> = language::class
    println(runtimeClass.simpleName)
    // Kotlin
}
```
{kotlin-runnable="true"}

Kotlin標準ライブラリは、クラスを調査するための基本的なツールを提供しています。より広範なランタイムイントロスペクションを行うには、`kotlin-reflect` の依存関係を追加してそのAPIを使用してください。

## JVM依存関係の追加 {id="add-the-jvm-dependency"}

JVMプラットフォームでは、Kotlinコンパイラのディストリビューションに、リフレクション機能を使用するために必要なランタイムコンポーネントが別個のアーティファクト `kotlin-reflect.jar` として含まれています。これにより、リフレクション機能を使用しないアプリケーションはこのアーティファクトを除外して、ランタイムクラスパスのサイズを削減できます。

GradleまたはMavenプロジェクトでリフレクションを使用するには、`kotlin-reflect` への依存関係を追加します:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
dependencies {
    implementation(kotlin("reflect"))
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-reflect</artifactId>
        <version>${kotlin.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

GradleやMavenを使用していない場合は、プロジェクトのクラスパスに `kotlin-reflect.jar` が含まれていることを確認してください。コマンドラインコンパイラはデフォルトでこのライブラリを追加します。クラスパスから除外するには、`-no-reflect` [コンパイラオプション](compiler-reference.md#compiler-options)を使用します。

## 型の調査 {id="inspect-types"}

`KClass` と `KType` は異なる情報を表します。`KClass` は、型引数やnull許容性（nullability）を保持せずにクラスを表します。たとえば、`List<String>` と `List<Int>` は同じ `List::class` という表現を共有し、`String` と `String?` は `String::class` を共有します。そのため、静的に判明している型 `T` の型引数やnull許容性を含んだ `KType` を取得するには、[`typeOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/type-of.html) 関数を使用します。

以下の例では、`classifier` プロパティが型をそのクラスまたは型パラメータに関連付けます。`arguments` コレクションにはその型引数が含まれます。これにより、コードは `List` とは別に `String?` を調査することができます:

```kotlin
import kotlin.reflect.typeOf

fun main() {
    val type = typeOf<List<String?>>()

    println(type.classifier)
    // class kotlin.collections.List
    println(type.arguments.single().type)
    // kotlin.String?
}
```

> JVM上では、ソースコードで型にアノテーションを付与していても、作成された型にはアノテーションが含まれません。型アノテーションのサポートは、`kotlin-reflect` ライブラリの将来のバージョンで追加される可能性があります。
>
{style="note"}

## 値のチェック {id="check-values"}

コード内にターゲットの型を直接記述する場合は、[`is`、`as`、`as?` 演算子](typecasts.md)が機能します。しかし、ターゲットのクラスを `KClass` に保持している場合は、以下を使用します:

* [`isInstance()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-instance.html) 関数: 値がそのクラスのインスタンスであるかどうかをチェックします。`true` または `false` を返します。
* [`cast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/cast.html) 関数: 値をターゲットの型として返します。値が `null` または互換性のない型である場合は例外をスローします。
* [`safeCast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/safe-cast.html) 関数: 値をターゲットの型として返します。値が `null` または互換性のない型である場合は `null` を返します。

```kotlin
import kotlin.reflect.cast
import kotlin.reflect.safeCast

fun main() {
    val expectedClass = String::class
    val value: Any = "Kotlin"

    // キャストせずに値をチェックする
    println(expectedClass.isInstance(value))
    // true

    // 値を String として返す
    val text = expectedClass.cast(value)
    println(text.length)
    // 6

    // 互換性のないキャストは例外をスローする
    val failedCast = runCatching {
        Int::class.cast(value)
    }
    println(failedCast.isFailure)
    // true

    // セーフキャストは同じ不一致を null で表す
    val number = Int::class.safeCast(value)
    println(number)
    // null
}
```
{kotlin-runnable="true"}

## クラスの調査 {id="inspect-a-class"}

`KClass` を取得した後は、そのメンバーを調査できます。これにより、使用する前にどのような宣言が存在するかを確認できます。
クラスの関数やプロパティを調査するには、[`members`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/members.html) プロパティを使用します。これには、継承された宣言を含め、そのクラスでアクセス可能なすべての宣言の `KCallable` オブジェクトのコレクションが含まれます。

たとえば、次のコードはデータクラスでアクセス可能な関数とプロパティを一覧表示します:

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    println(User::class.members.map { it.name }.sorted())
    // [age, component1, component2, copy, equals, hashCode, name, toString]
}
```

`kotlin.reflect.full` パッケージは、種類、スコープ、レシーバーによって宣言を選択するためのより具体的なプロパティを提供します:

| プロパティ                                                                                                                                           | 戻り値                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| [`declaredMembers`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-members.html)                                       | 継承された宣言を除き、クラスで直接宣言された関数およびプロパティ                                                                                    |
| [`functions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/functions.html)                                                    | クラスから利用可能なすべての関数: クラスおよびそのスーパークラスの非静的関数、ならびにクラスで宣言された静的関数                                |
| [`declaredFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-functions.html)                                   | クラスで宣言されたすべての関数                                                                                                          |
| [`memberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-functions.html)                                       | クラスおよびそのスーパークラスで宣言された、非拡張かつ非静的な関数                                                                               |
| [`declaredMemberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-functions.html)                      | クラスで宣言された、非拡張かつ非静的な関数                                                                                                    |
| [`memberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-functions.html)                    | クラスまたはそのスーパークラスのメンバーとして宣言された拡張関数                                                                                     |
| [`declaredMemberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-functions.html)   | クラスで宣言された拡張関数                                                                                                                    |
| [`staticFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-functions.html)                                       | クラスで宣言された静的関数                                                                                                       |
| [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html)                                     | クラスおよびそのスーパークラスで宣言された、非拡張プロパティ                                                                                          |
| [`declaredMemberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-properties.html)                    | クラスで宣言された、非拡張プロパティ                                                                                               |
| [`memberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-properties.html)                  | クラスまたはそのスーパークラスのメンバーとして宣言された拡張プロパティ                                                                                    |
| [`declaredMemberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-properties.html) | クラスのメンバーとして宣言された拡張プロパティ                                                                                                       |
| [`staticProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-properties.html)                                     | Javaクラスで宣言された静的フィールドを表すプロパティ                                                                               |

コードが必要とする宣言に合致する、最も限定的なプロパティを選択してください。たとえば、シリアライザーは特定のクラスで導入されたプロパティのみを処理するために `declaredMemberProperties` を使用するかもしれませんが、呼び出し可能なAPIを検索するフレームワークは継承された `memberFunctions` も必要とする場合があります。

リフレクションを使用して[sealedサブクラスを調査](sealed-classes.md#inspect-sealed-subclasses-with-reflection)することもできます。

## プロパティの読み取り {id="read-a-property"}

リフレクションを使用すると、実行時に選択されたプロパティを読み取ることができます。
たとえば、`User` オブジェクトから表示するプロパティとして `name` を指定するUI構成があるとします。
そのためには、アプリケーションは一致するプロパティ宣言を見つけてから、そのゲッターを呼び出す必要があります:

```kotlin
import kotlin.reflect.full.memberProperties

data class User(val name: String, val age: Int)

fun readProperty(instance: Any, propertyName: String): Any? {
    // ランタイムクラスを調査する
    val runtimeClass = instance::class

    // プロパティ宣言を見つける
    val property = runtimeClass.memberProperties
        .firstOrNull { it.name == propertyName }
        ?: error("Unknown property: $propertyName")

    // オブジェクトをレシーバーとしてゲッターを呼び出す
    return property.getter.call(instance)
}

fun main() {
    val user = User("Jane Doe", 22)

    println(readProperty(user, "name"))
    // Jane Doe
    println(readProperty(user, "age"))
    // 22
}
```

この例では、[`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) を使用してバインドされていない（unbound）プロパティオブジェクトを返します。これらのオブジェクトは、クラスに属しているものの特定のインスタンスには紐付けられていないプロパティを表します。そのため、`getter.call()` にはレシーバーとして `instance` が必要になります。実行時に選択されるプロパティは任意の型を返す可能性があるため、結果は `Any?` 型になります。

> プロパティがコンパイル時に判明している場合は、リフレクションの代わりに、プロパティへの直接アクセスまたは[呼び出し可能参照](lambdas.md#callable-reference)を使用してください。
> 
{style="tip"}

## 関数の呼び出し {id="call-a-function"}

動的な関数呼び出しは、[プロパティ](#read-a-property)と同じパターンに従います。すべての引数が宣言された順序で利用可能な場合は、[`call()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call.html) を使用できます。バインドされていないメンバー関数を呼び出す際は、最初にそのオブジェクトインスタンスを指定し、その後に通常の引数を追加します:

```kotlin
import kotlin.reflect.full.memberFunctions

class Formatter {
    fun format(text: String, uppercase: Boolean): String =
        if (uppercase) text.uppercase() else text
}

fun main() {
    val formatter = Formatter()

    // 実行時に名前で関数を見つける
    val function = Formatter::class.memberFunctions
        .single { it.name == "format" }

    // レシーバーを最初に渡し、次に宣言された引数を順番に渡す
    val result = function.call(formatter, "Kotlin", true)

    println(result)
    // KOTLIN
}
```

この例では、呼び出しに3つの値（`Formatter` レシーバー、`text`、`uppercase`）が含まれています。また、戻り値は `Any?` 型となり、互換性のないレシーバーや引数は実行時にエラーとして報告されます。

位置（引数の順序）で値を渡す代わりに、値を `KParameter` オブジェクトに関連付けることもできます。そのためには、[`callBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call-by.html) 関数を使用します:

```kotlin
import kotlin.reflect.full.instanceParameter
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.valueParameters

class Greeter {
    fun greet(name: String, punctuation: String = "!") =
        "Hello, $name$punctuation"
}

fun main() {
    val greeter = Greeter()
    val function = Greeter::class.memberFunctions
        .single { it.name == "greet" }

    // valueParameters には greet() で宣言されたパラメータが含まれるが、
    // Greeter レシーバーは含まれない
    val nameParameter = function.valueParameters
        .single { it.name == "name" }

    val result = function.callBy(
        mapOf(
            // メンバー関数にはインスタンスレシーバーが必要
            function.instanceParameter!! to greeter,
            nameParameter to "Kotlin"
        )
    )

    println(result)
    // Hello, Kotlin!
}
```

この例では、`instanceParameter` がメンバー関数のレシーバーを特定し、`valueParameters` には関数のシグネチャで宣言されたパラメータのみが含まれます。

> 順序付けられた完全な引数リストがすでに揃っている場合は、`call()` を使用してください。
> 
> 引数をパラメータオブジェクトに対応付ける場合や、省略可能なパラメータでデフォルト値を使用する場合は、`callBy()` を使用してください。
> 
{style="tip"}