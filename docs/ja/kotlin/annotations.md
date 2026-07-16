[//]: # (title: アノテーション)

アノテーションは、コード内の要素にメタデータを付加するために使用できるタグです。ツールやフレームワークは、コンパイル時や実行時にこのメタデータを処理し、それに基づいてさまざまなアクションを実行します。

コードにアノテーションを付けることで、ボイラープレートコードの生成、コーディング規格の強制、ドキュメントの作成といった一般的なタスクを簡素化および自動化できます。

> 独自のアノテーションプロセッサを開発したい場合は、[Kotlin Symbol Processing (KSP)](ksp-overview.md) API を使用できます。
>
{style="tip"}

## 宣言 (Declaration)

アノテーションは特殊なクラスの一種です。アノテーションを宣言するには、クラス宣言の前に `annotation` キーワードを使用します。

```kotlin
annotation class Fancy
```

アノテーションの追加属性は、アノテーションクラスにメタアノテーションを付けることで指定できます：

  * [`@Target`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/index.html) は、アノテーションを付加できる要素の種類（クラス、関数、プロパティ、式など）を指定します。
  * [`@Retention`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/index.html) は、アノテーションをコンパイル済みのクラスファイルに保存するかどうか、また実行時にリフレクションを通じて参照できるかどうかを指定します（デフォルトでは両方とも true です）。
  * [`@Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/index.html) は、単一の要素に対して同じアノテーションを複数回使用することを許可します。
  * [`@MustBeDocumented`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-must-be-documented/index.html) は、アノテーションが公開 API の一部であり、生成される API ドキュメントに表示されるクラスまたはメソッドの署名に含まれるべきであることを指定します。

```kotlin
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.TYPE_PARAMETER, AnnotationTarget.VALUE_PARAMETER,
        AnnotationTarget.EXPRESSION)
@Retention(AnnotationRetention.SOURCE)
@MustBeDocumented
annotation class Fancy
```

## 使用法 (Usage)

```kotlin
@Fancy class Foo {
    @Fancy fun baz(@Fancy foo: Int): Int {
        return (@Fancy 1)
    }
}
```

クラスのプライマリコンストラクタにアノテーションを付ける必要がある場合は、コンストラクタ宣言に `constructor` キーワードを追加し、その前にアノテーションを記述する必要があります。

```kotlin
class Foo @Inject constructor(dependency: MyDependency) { ... }
```

プロパティアクセッサにアノテーションを付けることもできます：

```kotlin
class Foo {
    var x: MyDependency? = null
        @Inject set
}
```

## コンストラクタ (Constructors)

アノテーションはパラメータを受け取るコンストラクタを持つことができます。

```kotlin
annotation class Special(val why: String)

@Special("example") class Foo {}
```

許可されているパラメータの型は以下の通りです：

 * Java のプリミティブ型に対応する型（Int, Long など）
 * 文字列 (Strings)
 * クラス (`Foo::class`)
 * 列挙型 (Enums)
 * 他のアノテーション
 * 上記の型の配列

JVM はアノテーション属性の値として `null` を保存することをサポートしていないため、アノテーションのパラメータに null 許容型（nullable types）を使用することはできません。

あるアノテーションが別のアノテーションのパラメータとして使用される場合、その名前の前に `@` 文字は付けません：

```kotlin
annotation class ReplaceWith(val expression: String)

annotation class Deprecated(
        val message: String,
        val replaceWith: ReplaceWith = ReplaceWith(""))

@Deprecated("This function is deprecated, use === instead", ReplaceWith("this === other"))
```

アノテーションの引数としてクラスを指定する必要がある場合は、Kotlin クラス（[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html)）を使用します。Kotlin コンパイラはこれを自動的に Java クラスに変換するため、Java コードからも通常通りアノテーションや引数にアクセスできます。

```kotlin

import kotlin.reflect.KClass

annotation class Ann(val arg1: `KClass<*>`, val arg2: KClass<out Any>)

@Ann(String::class, Int::class) class MyClass
```

## インスタンス化 (Instantiation)

Java では、アノテーション型はインターフェースの一種であるため、それを実装してインスタンスを使用することができます。このメカニズムに代わる方法として、Kotlin では任意のコード内でアノテーションクラスのコンストラクタを呼び出し、得られたインスタンスを同様に使用することができます。

```kotlin
annotation class InfoMarker(val info: String)

fun processInfo(marker: InfoMarker): Unit = TODO()

fun main(args: Array<String>) {
    if (args.isNotEmpty())
        processInfo(getAnnotationReflective(args))
    else
        processInfo(InfoMarker("default"))
}
```

アノテーションクラスのインスタンス化の詳細については、[この KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md) を参照してください。

## ラムダ式 (Lambdas)

アノテーションはラムダ式にも使用できます。アノテーションは、ラムダのボディが生成される `invoke()` メソッドに適用されます。これは、並行性制御にアノテーションを使用する [Quasar](https://docs.paralleluniverse.co/quasar/) のようなフレームワークで役立ちます。

```kotlin
annotation class Suspendable

val f = @Suspendable { Fiber.sleep(10) }
```

## ユースサイトターゲット (Annotation use-site targets)

プロパティやプライマリコンストラクタのパラメータにアノテーションを付ける際、対応する Kotlin 要素から複数の Java 要素が生成されます。そのため、生成された Java バイトコード内ではアノテーションが付与される可能性のある場所が複数存在します。アノテーションをどのように生成するかを正確に指定するには、以下の構文を使用します。

```kotlin
class Example(@field:Ann val foo,    // Java フィールドにのみアノテーションを付ける
              @get:Ann val bar,      // Java ゲッターにのみアノテーションを付ける
              @param:Ann val quux)   // Java コンストラクタパラメータにのみアノテーションを付ける
```

同じ構文を使用してファイル全体にアノテーションを付けることもできます。これを行うには、ファイルの最上部、package 宣言の前、または（ファイルがデフォルトパッケージにある場合は）すべての import の前に、ターゲット `file` を指定したアノテーションを記述します。

```kotlin
@file:JvmName("Foo")

package org.jetbrains.demo
```

同じターゲットに対して複数のアノテーションがある場合は、ターゲットの後に角括弧を追加し、その中にすべてのアノテーションを入れることでターゲットの繰り返しを避けることができます（`all` メターゲットを除く）。

```kotlin
class Example {
     @set:[Inject VisibleForTesting]
     var collaborator: Collaborator
}
```

サポートされているユースサイトターゲットの全リストは以下の通りです：

  * `file`
  * `field`
  * `property` (このターゲットを指定したアノテーションは Java からは見えません)
  * `get` (プロパティのゲッター)
  * `set` (プロパティのセッター)
  * `all` (プロパティ用の実験的なメタターゲット。目的と使用法については[以下](#all-meta-target)を参照)
  * `receiver` (拡張関数またはプロパティのレシーバーパラメータ)

    拡張関数のレシーバーパラメータにアノテーションを付けるには、以下の構文を使用します：

    ```kotlin
    fun @receiver:Fancy String.myExtension() { ... }
    ```

  * `param` (コンストラクタパラメータ)
  * `setparam` (プロパティセッターのパラメータ)
  * `delegate` (委譲プロパティのデリゲートインスタンスを保持するフィールド)

### ユースサイトターゲットが指定されていない場合のデフォルト

ユースサイトターゲットを指定しない場合、ターゲットは使用されているアノテーションの `@Target` アノテーションに従って選択されます。
適用可能なターゲットが複数ある場合は、以下のリストの中で最初に該当するターゲットが使用されます：

* `param`
* `property`
* `field`

[Jakarta Bean Validation の `@Email` アノテーション](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)を例に考えてみましょう：

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

このアノテーションを使用して、次の例を見てみましょう：

```kotlin
data class User(val username: String,
                // @Email は @param:Email と同等
                @Email val email: String) {
    // @Email は @field:Email と同等
    @Email val secondaryEmail: String? = null
}
```

Kotlin 2.2.0 では、パラメータ、フィールド、プロパティへのアノテーションの伝播をより予測可能にするための実験的なデフォルトルールが導入されました。

新しいルールでは、適用可能なターゲットが複数ある場合、以下のように 1 つ以上が選択されます：

* コンストラクタパラメータのターゲット (`param`) が適用可能な場合は、それが使用されます。
* プロパティのターゲット (`property`) が適用可能な場合は、それが使用されます。
* フィールドのターゲット (`field`) が適用可能で、`property` が適用可能でない場合は、`field` が使用されます。

同じ例を使用した場合：

```kotlin
data class User(val username: String,
                // @Email は @param:Email @field:Email と同等になります
                @Email val email: String) {
    // @Email は依然として @field:Email と同等です
    @Email val secondaryEmail: String? = null
}
```

複数のターゲット候補があり、`param`、`property`、`field` のいずれも適用可能でない場合、そのアノテーションは無効となります。

新しいデフォルトルールを有効にするには、Gradle 設定に以下の行を追加してください。

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-default-target=param-property")
    }
}
```

以前の動作を使用したい場合は、いつでも以下の対応が可能です：

* 特定のケースにおいて、`@Annotation` の代わりに `@param:Annotation` を使用するなどして、必要なターゲットを明示的に指定する。
* プロジェクト全体に対して、Gradle ビルドファイルでこのフラグを使用する：

    ```kotlin
    // build.gradle.kts
    kotlin {
        compilerOptions {
            freeCompilerArgs.add("-Xannotation-default-target=first-only")
        }
    }
    ```

### `all` メタターゲット

<primary-label ref="experimental-opt-in"/>

`all` ターゲットを使用すると、同じアノテーションをパラメータやプロパティ、フィールドだけでなく、対応するゲッターやセッターにも簡単に適用できるようになります。

具体的には、`all` が指定されたアノテーションは、適用可能な場合に以下の要素へ伝播されます：

* プロパティがプライマリコンストラクタで定義されている場合、コンストラクタパラメータ (`param`)。
* プロパティ自体 (`property`)。
* プロパティがバッキングフィールドを持つ場合、そのフィールド (`field`)。
* ゲッター (`get`)。
* プロパティが `var` として定義されている場合、セッターパラメータ (`setparam`)。
* クラスに `@JvmRecord` アノテーションがある場合、Java 専用ターゲット `RECORD_COMPONENT`。

次のように定義されている [Jakarta Bean Validation の `@Email` アノテーション](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)を例にします。

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

以下の例では、この `@Email` アノテーションがすべての関連ターゲットに適用されます。

```kotlin
data class User(
    val username: String,
    // @Email を param、field、get に適用
    @all:Email val email: String,
    // @Email を param、field、get、setparam に適用
    @all:Email var name: String,
) {
    // field と getter に @Email を適用（コンストラクタ内にないため param には適用されない）
    @all:Email val secondaryEmail: String? = null
}
```

`all` メタターゲットは、プライマリコンストラクタの内外を問わず、あらゆるプロパティで使用できます。

#### 制限事項

`all` ターゲットにはいくつかの制限があります：

* 型、拡張レシーバーの候補、コンテキストレシーバー、またはパラメータにはアノテーションを伝播しません。
* 複数のアノテーションを一度に指定することはできません：
    ```kotlin
    @all:[A B] // 禁止。@all:A @all:B を使用してください
    val x: Int = 5
    ```
* [委譲プロパティ (delegated properties)](delegated-properties.md) には使用できません。

#### 有効化する方法

プロジェクトで `all` メタターゲットを有効にするには、コマンドラインで以下のコンパイラオプションを使用します：

```Bash
-Xannotation-target-all
```

または、Gradle ビルドファイルの `compilerOptions {}` ブロックに追加します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-target-all")
    }
}
```

## Java アノテーション

Java のアノテーションは、Kotlin と 100% の互換性があります。

```kotlin
import org.junit.Test
import org.junit.Assert.*
import org.junit.Rule
import org.junit.rules.*

class Tests {
    // プロパティのゲッターに @Rule アノテーションを適用
    @get:Rule val tempFolder = TemporaryFolder()

    @Test fun simple() {
        val f = tempFolder.newFile()
        assertEquals(42, getTheAnswer())
    }
}
```

Java で記述されたアノテーションのパラメータの順序は定義されていないため、引数を渡す際に通常の関数呼び出し構文を使用することはできません。代わりに、名前付き引数構文を使用する必要があります。

``` java
// Java
public @interface Ann {
    int intValue();
    String stringValue();
}
```

```kotlin
// Kotlin
@Ann(intValue = 1, stringValue = "abc") class C
```

Java と同様に、`value` パラメータは特別なケースです。その値は明示的な名前なしで指定できます。

``` java
// Java
public @interface AnnWithValue {
    String value();
}
```

```kotlin
// Kotlin
@AnnWithValue("abc") class C
```

### アノテーションパラメータとしての配列

Java の `value` 引数が配列型である場合、Kotlin では `vararg` パラメータになります：

``` java
// Java
public @interface AnnWithArrayValue {
    String[] value();
}
```

```kotlin
// Kotlin
@AnnWithArrayValue("abc", "foo", "bar") class C
```

配列型を持つ他の引数の場合は、配列リテラル構文または `arrayOf(...)` を使用する必要があります：

``` java
// Java
public @interface AnnWithArrayMethod {
    String[] names();
}
```

```kotlin
@AnnWithArrayMethod(names = ["abc", "foo", "bar"])
class C
```

### アノテーションインスタンスのプロパティへのアクセス

アノテーションインスタンスの値は、Kotlin コードからはプロパティとして公開されます。

``` java
// Java
public @interface Ann {
    int value();
}
```

```kotlin
// Kotlin
fun foo(ann: Ann) {
    val i = ann.value
}
```

### JVM 1.8+ アノテーションターゲットを生成しない機能

Kotlin アノテーションのターゲットに `TYPE` が含まれている場合、そのアノテーションは Java アノテーションターゲットのリストにおいて `java.lang.annotation.ElementType.TYPE_USE` にマッピングされます。これは、Kotlin の `TYPE_PARAMETER` ターゲットが Java の `java.lang.annotation.ElementType.TYPE_PARAMETER` ターゲットにマッピングされるのと同じです。これは、API レベルが 26 未満の Android クライアントにおいて、API にこれらのターゲットが含まれていないため、問題となることがあります。

`TYPE_USE` および `TYPE_PARAMETER` アノテーションターゲットの生成を避けるには、新しいコンパイラ引数 `-Xno-new-java-annotation-targets` を使用してください。

## 繰り返し可能なアノテーション (Repeatable annotations)

[Java と同様に](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html)、Kotlin には単一のコード要素に複数回適用できる「繰り返し可能なアノテーション」があります。アノテーションを繰り返し可能にするには、その宣言に [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) メタアノテーションを付与します。これにより、Kotlin と Java の両方で繰り返し可能になります。Java の繰り返し可能なアノテーションも Kotlin 側からサポートされています。

Java で使用されている方式との主な違いは、*含有アノテーション (containing annotation)* の不在です。Kotlin コンパイラは、事前定義された名前で含有アノテーションを自動的に生成します。以下の例のアノテーションの場合、コンパイラは含有アノテーション `@Tag.Container` を生成します。

```kotlin
@Repeatable
annotation class Tag(val name: String)

// コンパイラは @Tag.Container 含有アノテーションを生成します
```

[`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-repeatable/) メタアノテーションを適用し、引数として明示的に宣言された含有アノテーションクラスを渡すことで、含有アノテーションにカスタム名を設定できます。

```kotlin
@JvmRepeatable(Tags::class)
annotation class Tag(val name: String)

annotation class Tags(val value: Array<Tag>)
```

リフレクションを介して Kotlin または Java の繰り返し可能なアノテーションを抽出するには、[`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 関数を使用します。

Kotlin の繰り返し可能なアノテーションの詳細については、[この KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md) を参照してください。