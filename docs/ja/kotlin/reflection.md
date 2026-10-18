[//]: # (title: リフレクション（Reflection）)
[//]: # (description: Kotlinの組み込みリフレクションサポートと、完全なランタイムイントロスペクションのための独立したkotlin-reflectライブラリの使用方法について説明します。)

リフレクション（_Reflection_）は、プログラムの構造を実行時（ランタイム）に内省（イントロスペクト）できるようにする言語およびライブラリ機能のセットです。
例えば、プロパティの読み取りや更新、関数の呼び出し、クラスのコンストラクタを呼び出してインスタンスを生成することなどが可能です。これは、コンパイル時に宣言がわからない場合に役立ちます。

リフレクションは、コンパイルされた宣言を記述するランタイムオブジェクトを提供します。例えば、クラスは [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)、型は [`KType`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-type/)、プロパティや関数は [`KCallable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) のサブタイプによって表されます。
これらのオブジェクトをインスペクト（検査）し、値へのアクセスや関数の呼び出しに使用できます。

## リフレクションの仕組み {id="how-reflection-works"}

[リフレクションAPI](https://kotlinlang.org/api/core/kotlin-reflect/) は、コンパイルされた宣言を `KClass` や `KFunction` などのKotlinの型を通して表現します。
リフレクションオブジェクトは宣言自体を表し、宣言されたオブジェクトの値を表すわけではありません。例えば、`KProperty` を使用すると、オブジェクトからそのプロパティを読み取ることなく、プロパティの名前を取得したり、その型を返したりできます。

Kotlinは、言語および標準ライブラリの一部として、クラスリテラルや[呼び出し可能参照（callable references）](lambdas.md#callable-reference)などの基本的な機能を提供しています。より広範なランタイムイントロスペクションにアクセスするには、[`kotlin-reflect`](https://kotlinlang.org/api/core/kotlin-reflect/) ライブラリをインポートします。

リフレクションAPIは以下のパッケージで構成されています：

* [`kotlin.reflect`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/)：標準ライブラリの一部であり、コアとなるリフレクションの型と関数を含みます。
* [`kotlin.reflect.full`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/)：Kotlinの宣言をインスペクトするための拡張機能を含みます。
* [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/)：KotlinとJavaのリフレクションを橋渡しするJVM固有の拡張機能を含みます。

> リフレクションのサポート状況はプラットフォームによって異なる場合があります。このページの内容はKotlin/JVMのリフレクションAPIに準拠しています。[Kotlin/JSにおけるリフレクション](js-reflection.md)についての詳細も参照してください。
> 
{style="note"}

### Javaリフレクションとの相互運用性 {id="interoperability-with-java-reflection"}

JVM上では、`kotlin-reflect` ライブラリの [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) パッケージにある拡張機能によって、KotlinとJavaのリフレクションオブジェクト間の変換が提供されます。例えば、Kotlinプロパティのゲッターを実装するJavaメソッドや、プロパティのバッキングフィールドを見つけることができます：

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

Kotlinのプロパティには対応するJavaフィールドやゲッターが常に存在するとは限らないため、一致するJavaリフレクションオブジェクトが存在しない場合、両プロパティは `null` を返します。

また、Kotlinの `KClass` とJavaの `Class` オブジェクトを相互に変換することもできます。Javaクラスに対応するKotlinクラスを取得するには、`.kotlin` 拡張プロパティを使用します：

```kotlin
fun getKClass(o: Any): KClass<Any> = value.javaClass.kotlin
```

## ランタイムクラスの取得 {id="obtain-a-runtime-class"}

ほとんどのリフレクション操作は [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) から始まります。その取得方法は、クラスがコンパイル時に既知であるかどうかによって異なります：

* コンパイル時に既知のクラスを参照するには、`ClassName::class` を使用します。
* 宣言された型よりも具体的である可能性がある、ランタイム値の実際のクラスを取得するには、`value::class` を使用します。

```kotlin
import kotlin.reflect.KClass

class User(val name: String)

open class Language
class Kotlin : Language()

fun main() {
    // Userを表すKClassを返す
    val userClass: KClass<User> = User::class
    println(userClass.simpleName)
    // User
    
    val language: Language = Kotlin()

    // 実行時の値の具象クラスを表す
    // KClassを返す
    val runtimeClass: KClass<out Language> = language::class
    println(runtimeClass.simpleName)
    // Kotlin
}
```
{kotlin-runnable="true"}

Kotlin標準ライブラリは、クラスをインスペクトするための基本的なツールを提供します。より広範なランタイムイントロスペクションを行うには、`kotlin-reflect` の依存関係を追加し、そのAPIを使用してください。

## JVM依存関係の追加 {id="add-the-jvm-dependency"}

JVMプラットフォームでは、リフレクション機能を使用するために必要なランタイムコンポーネントが、Kotlinコンパイラの配布物において個別のアーティファクトである `kotlin-reflect.jar` として提供されています。これにより、リフレクション機能を使用しないアプリケーションではこのアーティファクトを除外して、ランタイムのクラスパスサイズを削減できます。

GradleまたはMavenプロジェクトでリフレクションを使用するには、`kotlin-reflect` への依存関係を追加します：

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

## 型のインスペクト {id="inspect-types"}

`KClass` と `KType` は異なる情報を表します。`KClass` は、型引数やnull可能性（nullability）を保持せずにクラスを表します。例えば、`List<String>` と `List<Int>` は同じ `List::class` 表現を共有し、`String` と `String?` は `String::class` を共有します。したがって、静的に既知の型 `T` に対する型引数やnull可能性を含む `KType` を取得するには、[`typeOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/type-of.html) 関数を使用します。

以下の例では、`classifier` プロパティが型をそのクラスまたは型パラメータに関連付けます。`arguments` コレクションにはその型引数が含まれます。これにより、コードは `String?` を `List` とは別にインスペクトできます：

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

> JVM上では、ソースコード内で型にアノテーションを付与していても、作成された型にはアノテーションが含まれません。型アノテーションのサポートは、将来のバージョンの `kotlin-reflect` ライブラリで追加される可能性があります。
>
{style="note"}

## 値のチェック {id="check-values"}

[`is`、`as`、および `as?` 演算子](typecasts.md)は、コード内にターゲットの型を直接記述する場合に機能します。しかし、ターゲットのクラスを `KClass` 内に格納している場合は、以下を使用します：

* [`isInstance()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-instance.html) 関数：値がそのクラスのインスタンスであるかどうかをチェックします。`true` または `false` を返します。
* [`cast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/cast.html) 関数：ターゲットの型を持つ値を返します。値が `null` であるか、互換性のない型を持つ場合は例外をスローします。
* [`safeCast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/safe-cast.html) 関数：ターゲットの型を持つ値を返します。値が `null` であるか、互換性のない型を持つ場合は `null` を返します。

```kotlin
import kotlin.reflect.cast
import kotlin.reflect.safeCast

fun main() {
    val expectedClass = String::class
    val value: Any = "Kotlin"

    // キャストせずに値をチェック
    println(expectedClass.isInstance(value))
    // true

    // 値をStringとして返す
    val text = expectedClass.cast(value)
    println(text.length)
    // 6

    // 互換性のないキャストは例外をスローする
    val failedCast = runCatching {
        Int::class.cast(value)
    }
    println(failedCast.isFailure)
    // true

    // セーフキャストは同じ不一致をnullで表す
    val number = Int::class.safeCast(value)
    println(number)
    // null
}
```
{kotlin-runnable="true"}

## クラスのインスペクト {id="inspect-a-class"}

`KClass` を取得した後は、そのメンバーをインスペクトできます。これにより、宣言を使用する前にどのような宣言が存在するかを知ることができます。
クラスの関数やプロパティをインスペクトするには、[`members`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/members.html) プロパティを使用します。これには、継承された宣言を含め、そのクラスでアクセス可能なすべての宣言を持つ `KCallable` オブジェクトのコレクションが含まれます。

例えば、次のコードはデータクラスでアクセス可能な関数とプロパティを一覧表示します：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    println(User::class.members.map { it.name }.sorted())
    // [age, component1, component2, copy, equals, hashCode, name, toString]
}
```

`kotlin.reflect.full` パッケージは、種類、スコープ、レシーバによって宣言を選択するための、より具体的なプロパティを提供します：

| プロパティ | 戻り値 |
|---|---|
| [`declaredMembers`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-members.html) | 継承された宣言を除き、そのクラスで直接宣言されている関数とプロパティ |
| [`functions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/functions.html) | そのクラスから利用可能なすべての関数：クラスおよびそのスーパークラスの非静的関数、ならびにクラスで宣言された静的関数 |
| [`declaredFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-functions.html) | そのクラスで宣言されているすべての関数 |
| [`memberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-functions.html) | クラスおよびそのスーパークラスで宣言されている非拡張、非静的関数 |
| [`declaredMemberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-functions.html) | そのクラスで宣言されている非拡張、非静的関数 |
| [`memberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-functions.html) | クラスまたはそのスーパークラスのメンバーとして宣言されている拡張関数 |
| [`declaredMemberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-functions.html) | そのクラスで宣言されている拡張関数 |
| [`staticFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-functions.html) | そのクラスで宣言されている静的関数 |
| [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) | クラスおよびそのスーパークラスで宣言されている非拡張プロパティ |
| [`declaredMemberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-properties.html) | そのクラスで宣言されている非拡張プロパティ |
| [`memberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-properties.html) | クラスまたはそのスーパークラスのメンバーとして宣言されている拡張プロパティ |
| [`declaredMemberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-properties.html) | そのクラスでメンバーとして宣言されている拡張プロパティ |
| [`staticProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-properties.html) | Javaクラスで宣言された静的フィールドを表すプロパティ |

コードが必要とする宣言に一致する、最も絞り込まれたプロパティを選択してください。例えば、シリアライザは特定のクラスによって導入されたプロパティのみを処理するために `declaredMemberProperties` を使用するかもしれませんが、呼び出し可能なAPIを検索するフレームワークでは継承された `memberFunctions` も必要になる場合があります。

また、リフレクションを使用して [sealed サブクラスをインスペクト](sealed-classes.md#inspect-sealed-subclasses-with-reflection) することもできます。

## プロパティの読み取り {id="read-a-property"}

リフレクションを使用すると、実行時に選択されたプロパティを読み取ることができます。
例えば、`User` オブジェクトから表示するプロパティとして `name` を指定するUI設定があるとします。
そのために、アプリケーションは一致するプロパティ宣言を見つけ、そのゲッターを呼び出す必要があります：

```kotlin
import kotlin.reflect.full.memberProperties

data class User(val name: String, val age: Int)

fun readProperty(instance: Any, propertyName: String): Any? {
    // ランタイムクラスをインスペクト
    val runtimeClass = instance::class

    // プロパティ宣言を検索
    val property = runtimeClass.memberProperties
        .firstOrNull { it.name == propertyName }
        ?: error("Unknown property: $propertyName")

    // オブジェクトをレシーバとしてゲッターを呼び出す
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

この例では、[`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) を使用してアンバウンド（未束縛）なプロパティオブジェクトを返しています。これらのオブジェクトはクラスに属しているものの、特定のインスタンスにはアタッチされていないプロパティを表します。そのため、`getter.call()` にはレシーバとして `instance` が必要です。実行時に選択されるプロパティは任意の型を返す可能性があるため、結果は `Any?` 型になります。

> プロパティがコンパイル時に既知である場合は、リフレクションの代わりに直接のプロパティアクセスまたは[呼び出し可能参照](lambdas.md#callable-reference)を使用してください。
> 
{style="tip"}

## 関数の呼び出し {id="call-a-function"}

動的な関数の呼び出しも、[プロパティ](#read-a-property)と同じパターンに従います。すべての引数が宣言された順序で揃っている場合は、[`call()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call.html) を使用できます。アンバウンドなメンバー関数を宣言する場合、最初にそのオブジェクトインスタンスを指定し、その後に通常の引数を追加します：

```kotlin
import kotlin.reflect.full.memberFunctions

class Formatter {
    fun format(text: String, uppercase: Boolean): String =
        if (uppercase) text.uppercase() else text
}

fun main() {
    val formatter = Formatter()

    // 実行時に関数をその名前で検索
    val function = Formatter::class.memberFunctions
        .single { it.name == "format" }

    // レシーバを最初に渡し、宣言された引数を順番に渡す
    val result = function.call(formatter, "Kotlin", true)

    println(result)
    // KOTLIN
}
```

この例では、呼び出しに `Formatter` レシーバ、`text`、`uppercase` の3つの値が含まれています。これも `Any?` 型を返し、互換性のないレシーバや引数がある場合は実行時にエラーを報告します。

また、位置によって引数を渡す代わりに、値を `KParameter` オブジェクトに関連付けることもできます。そのためには、[`callBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call-by.html) 関数を使用します：

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

    // valueParametersにはgreet()で宣言されたパラメータが含まれるが、
    // Greeterレシーバは含まれない
    val nameParameter = function.valueParameters
        .single { it.name == "name" }

    val result = function.callBy(
        mapOf(
            // メンバー関数にはインスタンスレシーバが必要
            function.instanceParameter!! to greeter,
            nameParameter to "Kotlin"
        )
    )

    println(result)
    // Hello, Kotlin!
}
```

この例では、`instanceParameter` がメンバー関数のレシーバを特定し、`valueParameters` には関数のシグネチャで宣言されたパラメータのみが含まれます。

> 順序通りの完全な引数リストがすでに用意されている場合は、`call()` を使用してください。
> 
> 引数をパラメータオブジェクトに対応付ける場合や、オプショナルなパラメータにデフォルト値を使用させる場合は、`callBy()` を使用してください。
> 
{style="tip"}