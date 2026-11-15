[//]: # (title: KotlinからJavaを呼び出す)
[//]: # (description: ゲッターとセッター、null安全性とプラットフォーム型、null許容性アノテーション、マップされた型、SAM変換など、KotlinからJavaコードを呼び出す方法を学びます。)

KotlinはJavaとの相互運用性を念頭に置いて設計されています。既存のJavaコードは自然な方法でKotlinから呼び出すことができ、
Kotlinコードも同様にJavaから使用できます。

ほとんどのJavaコードは、追加の設定なしで使用できます：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' ループはJavaのコレクションに対して機能します：
    for (item in source) {
        list.add(item)
    }
    // 演算子の規約も同様に機能します：
    for (i in 0..<source.size) {
        list[i] = source[i] // get と set が呼び出されます
    }
}
```

## ゲッターとセッター {id="getters-and-setters"}

ゲッターとセッターに関するJavaの慣例に従っているメソッド（名前が `get` で始まる引数のないメソッド、
および名前が `set` で始まる単一引数のメソッド）は、Kotlinではプロパティとして表現されます。このようなプロパティは
_合成プロパティ (synthetic properties)_ とも呼ばれます。
`Boolean` のアクセサメソッド（ゲッターの名前が `is` で始まり、セッターの名前が `set` で始まるもの）は、
ゲッターメソッドと同じ名前を持つプロパティとして表現されます。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // getFirstDayOfWeek() を呼び出す
        calendar.firstDayOfWeek = Calendar.MONDAY     // setFirstDayOfWeek() を呼び出す
    }
    if (!calendar.isLenient) {    // isLenient() を呼び出す
        calendar.isLenient = true // setLenient() を呼び出す
    }
}
```

上記の `calendar.firstDayOfWeek` は合成プロパティの例です。

なお、Javaクラスにセッターしか存在しない場合、Kotlinは set 専用のプロパティをサポートしていないため、
Kotlin側でプロパティとしては認識されないことに注意してください。

合成プロパティとして表現されるのは引数のないゲッターのみです。ゲッターに引数を取るオーバーロードがある場合、
そのオーバーロードはプロパティとして公開されず、ほとんどの場合は完全なメソッド名を使って呼び出すことになります。
以下のJavaクラスを考えてみましょう：

```java
// Java
public class Greeting {
    public String getMessage() {
        return "Hello!";
    }

    public String getMessage(String name) {
        return "Hello, " + name + "!";
    }
}
```

引数のない `getMessage()` メソッドは合成プロパティ `message` を通じて利用可能です。オーバーロードされた
`getMessage(String)` メソッドを使用するには、関数として呼び出します：

```kotlin
// Kotlin
fun main() {
    val greeting = Greeting()
    println(greeting.message)              // 合成プロパティを通じて getMessage() にアクセス
    println(greeting.getMessage("Kotlin")) // オーバーロードされた getMessage(String) メソッドを呼び出す
}
```

`message` プロパティは引数を受け取らないため、`greeting.message("Kotlin")` を呼び出してもコンパイルされず、未解決の参照エラー（レシーバの型不一致）が返されます。

ただし場合によっては、パラメータを持つJavaメソッドがKotlinの[メンバー拡張プロパティ](extensions.md#declaring-extensions-as-members)のゲッターをオーバーライドするとき、Kotlinはそのメソッドをプロパティとして扱います。そのため、メソッド名ではなく、レシーバのスコープ内でのみプロパティとして呼び出すことができます：

```java
// Java
public class Greeter implements Message {
    public String getText(String name) {
        return "Hello, " + name + "!";
    }
}
```

```kotlin
// Kotlin
interface Message {
    val String.text: String
}

fun demo(greeter: Greeter) {
    greeter.getText("Kotlin")       // エラー：未解決の参照 (unresolved reference)
    with(greeter) { "Kotlin".text } // メンバー拡張プロパティを通じて getText(String) にアクセス
}
```

## `void` を返すメソッド {id="methods-returning-void"}

Javaメソッドが `void` を返す場合、Kotlinから呼び出すとその戻り値の型は `Unit` になります。その戻り値を使用する場合、
値は事前にわかっているため、Kotlinコンパイラは呼び出し元で `Unit` を代入します。

## KotlinのキーワードであるJava識別子のエスケープ {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

Kotlinのキーワードの中には、Javaにおいて有効な識別子であるものがあります（`in`、`object`、`is` など）。Javaライブラリが
メソッドにKotlinのキーワードを使用している場合でも、バッククォート（`）文字でエスケープすることでそのメソッドを呼び出すことができます：

```kotlin
matcher.`is`(expected)
```

## Null安全性とプラットフォーム型 {id="null-safety-and-platform-types"}

Javaのあらゆる参照は `null` になる可能性があるため、Javaから渡されるオブジェクトに対してKotlinの厳格なNull安全性の要件をそのまま適用するのは現実的ではありません。
Javaの宣言の型は、Kotlinでは明示的に記述できない型（non-denotable）として扱われ、[_プラットフォーム型 (platform types)_](https://kotlinlang.org/spec/type-system.html#platform-types) と呼ばれます。
明示的に記述できない型は、コード内に直接書くことができません。そのため、プラットフォーム型の値がKotlinの変数に代入される場合、次のいずれかを行うことができます：

* 型推論に依存する。この場合、変数は推論されたプラットフォーム型を持ちます。
* 期待する型を選択する。Kotlinではnull許容型とnull非許容型の両方が許可されます。

プラットフォーム型ではnullチェックが緩和されているため、[マップされたJava型](#mapped-types)と同じ安全性保証を持ちます。
以下の例を考えてみましょう：

```kotlin
val list = ArrayList<String>() // null非許容（コンストラクタの結果）
list.add("Item")
val size = list.size // null非許容（プリミティブの int）
val item = list[0] // プラットフォーム型と推論される（通常のJavaオブジェクト）
```

プラットフォーム型の変数のメソッドを呼び出す場合、Kotlinはコンパイル時にnull許容性エラーを出しませんが、
実行時にnullポインタ例外が発生したり、nullの伝播を防ぐためにKotlinが生成するアサーションによって呼び出しが失敗する可能性があります：

```kotlin
item.substring(1) // 許可されるが、item == null の場合は例外をスロー
```

プラットフォーム型の値は、Kotlinのnull許容型およびnull非許容型の変数の両方に代入できます。しかし、
そのような値をnull非許容型の変数に代入し、実行時にその値が実際に `null` であった場合、Kotlinは
`NullPointerException` をスローします。これを回避するには、Kotlinコードに明示的なnull許容性を追加してください：

```kotlin
val nullable: String? = item // 許可され、常に動作する
val notNull: String = item // 許可されるが、実行時に失敗する可能性がある
```

null非許容型を選択した場合、コンパイラは代入時にアサーションを出力します。これにより、Kotlinのnull非許容変数が
nullを保持するのを防ぎます。アサーションは、null以外の値を期待するKotlin関数にプラットフォーム型の値を渡す際や、その他の場合にも出力されます。
全体として、コンパイラはプログラム内でnullが広範囲に伝播するのを防ぐために最善を尽くしますが、ジェネリクスの関係で
完全に排除することが不可能な場合もあります。

### プラットフォーム型の表記法 {id="notation-for-platform-types"}

前節で述べたように、プラットフォーム型はプログラム内で明示的に言及できないため、言語内にそれらを表す構文はありません。それでも、コンパイラやIDEは時々それらを表示する必要があるため（たとえば、エラーメッセージやパラメータ情報など）、ニーモニック（記憶を助ける）表記法が存在します：

* `T!` は「`T` または `T?`」を意味します
* `(Mutable)Collection<T>!` は「`T` のJavaコレクションであり、可変かもしれないし不可変かもしれない、null許容かもしれないし不可逆かもしれない」を意味します
* `Array<(out) T>!` は「`T`（または `T` のサブタイプ）のJava配列であり、null許容かもしれないし不可逆かもしれない」を意味します

エラーメッセージやIDEのツールチップでこの表記を見かけた場合は、Kotlin変数に明示的な型注釈を追加してnull安全性チェックを復元するか、null許容性アノテーションを使用してソース側でプラットフォーム型を解消してください。

### Null許容性アノテーション {id="nullability-annotations"}

null許容性アノテーションを持つJavaの型は、プラットフォーム型としてではなく、実際のnull許容型またはnull非許容型のKotlin型として表現されます。コンパイラは、以下を含むいくつかの種類のnull許容性アノテーションをサポートしています：

* [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
  （`org.jetbrains.annotations` パッケージの `@Nullable` および `@NotNull`）
* [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
* Android (`com.android.annotations`、`android.support.annotation`、`androidx.annotation`、`android.annotation`)
* [JSR-305](#jsr-305-support) (`javax.annotation`)
* FindBugs (`edu.umd.cs.findbugs.annotations`)
* Eclipse (`org.eclipse.jdt.annotation`)
* [Lombok](lombok.md) (`lombok.NonNull`)
* RxJava 3 (`io.reactivex.rxjava3.annotations`)
* [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

以下のコンパイラオプションを使用して、特定のnull許容性アノテーションに対してnull許容性の不一致を報告するようコンパイラに指示できます：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

完全修飾されたnull許容性アノテーションのパッケージ名と、以下のいずれかのレポートレベルを指定します：

* `ignore`：null許容性の不一致を無視する
* `warn`：警告を報告する
* `strict`：エラーを報告する

> デフォルトで `strict` レポートレベルを使用するサポート対象の種類は [JSpecify](#jspecify-support) のみです。
> 追加設定なしでnull許容性アノテーションに関するエラーを報告させるには、これを使用してください。
>
{style="note"}

サポートされているnull許容性アノテーションの完全なリストは、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt) を参照してください。

### 可変性アノテーション {id="mutability-annotations"}

Javaの宣言に可変性アノテーションを付けることで、返されるコレクションがKotlinにおいて読み取り専用か可変かを指定できます。
異なる可変性を持つコレクション型にその値を代入した場合、コンパイラは型の不一致を報告します。
診断の重大度は、特定の可変性アノテーションによって異なります。

コンパイラは、以下を含むいくつかの可変性アノテーションをサポートしています：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

サポートされている可変性アノテーションの完全なリストは、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt) を参照してください。

### 型引数と型パラメータのアノテーション {id="annotating-type-arguments-and-type-parameters"}

ジェネリック型の型引数や型パラメータにアノテーションを付けることで、それらに対してもnull許容性情報を提供できます。

> このセクションのすべての例では、`org.jetbrains.annotations` パッケージの JetBrains null許容性アノテーションを使用しています。
>
{style="note"}

#### 型引数 {id="type-arguments"}

Javaの宣言における以下のアノテーションについて考えてみましょう：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

これらは、Kotlinにおいて以下のシグネチャになります：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

型引数に `@NotNull` アノテーションがない場合、代わりにプラットフォーム型が得られます：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlinは、基底クラスやインターフェースの型引数にあるnull許容性アノテーションも考慮に入れます。たとえば、
以下に示すシグネチャを持つ2つのJavaクラスがあるとします：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

Kotlinコードにおいて、`Base<String>` が期待される場所に `Derived` のインスタンスを渡すと警告が発生します。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：null許容性の不一致 (nullability mismatch)
}
```

`Derived` の上限は `Base<String?>` に設定されており、これは `Base<String>` とは異なるためです。

詳細については、[KotlinにおけるJavaジェネリクス](#java-generics-in-kotlin) を参照してください。

#### 型パラメータ {id="type-parameters"}

デフォルトでは、KotlinとJavaの双方においてプレーンな型パラメータのnull許容性は未定義です。Javaでは、null許容性アノテーションを使用してこれを指定できます。`Base` クラスの型パラメータにアノテーションを付けてみましょう：

```java
public class Base<@NotNull T> {}
```

`Base` を継承する際、Kotlinはnull非許容の型引数または型パラメータを期待します。
したがって、以下のKotlinコードは警告を生成します：

```kotlin
class Derived<K> : Base<K> {} // 警告：K のnull許容性が未定義です
```

上限として `K : Any` を指定することで、これを修正できます。

Kotlinは、Java型パラメータの境界（バウンド）に対するnull許容性アノテーションもサポートしています。`Base` に境界を追加してみましょう：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlinはこれを次のように解釈します：

```kotlin
class BaseWithBound<T : Number> {}
```

そのため、型引数または型パラメータとしてnull許容型を渡すと警告が生成されます。

型引数や型パラメータへのアノテーションは、Java 8ターゲット以降で機能します。この機能を使用するには、
null許容性アノテーションが `TYPE_USE` ターゲットをサポートしている必要があります（`org.jetbrains.annotations` はバージョン15以上でこれをサポートしています）。

> null許容性アノテーションが `TYPE_USE` ターゲットに加えて型に適用可能な他のターゲットもサポートしている場合、
> `TYPE_USE` が優先されます。たとえば、`@Nullable` が `TYPE_USE` と `METHOD` の両方のターゲットを持つ場合、Javaのメソッド
> シグネチャ `@Nullable String[] f()` は、Kotlinでは `fun f(): Array<String?>!` になります。
>
{style="note"}

### JSpecifyのサポート {id="jspecify-support"}

Kotlinは、Javaのnull許容性のための統一されたアノテーションセットを提供する [JSpecify](https://jspecify.dev/) のnull許容性アノテーションをサポートしています。JSpecifyを使用すると、Javaの宣言に詳細なnull許容性情報を提供でき、KotlinがJavaコードと連携する際にnull安全性を維持するのに役立ちます。

Kotlinは `org.jspecify.annotations` パッケージ内の以下のアノテーションをサポートしています：

* `@Nullable` は、型をnull許容としてマークします。
* `@NonNull` は、型をnull非許容としてマークします。
* `@NullMarked` は、特にアノテーションが付けられていない限り、クラスやパッケージなどのスコープ内のすべての型をデフォルトでnull非許容としてマークします。

  このアノテーションは、ローカル変数および[型変数（ジェネリクス）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)には適用されません。
  型変数は、特定のnull許容型またはnull非許容型が提供されるまで「null不可知 (null-agnostic)」のままです。

* `@NullUnmarked` は `@NullMarked` の効果を取り消し、スコープ内のすべての型を[プラットフォーム型](#null-safety-and-platform-types)にします。

JSpecifyアノテーションを持つ以下のJavaクラスを考えてみましょう：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
Kotlinでは、これらは[プラットフォーム型](#null-safety-and-platform-types)ではなく、通常のnull許容型およびnull非許容型として扱われます：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
    inventory.notNull().length  // OK
    inventory.nullable().length // エラー：安全呼び出し (?.) または非nullアサート (!!) 呼び出しのみが許可されます
}
```

デフォルトでは、KotlinコンパイラはJSpecifyアノテーションに対するnull許容性の不一致をエラーとして報告します。
以下のコンパイラオプションを使用して、JSpecify null許容性診断の重大度をカスタマイズできます：

```bash
-Xjspecify-annotations=<report-level>
```

利用可能なレポートレベルは以下のとおりです：

| レベル   | 説明                                               |
|----------|----------------------------------------------------|
| `strict` | null許容性の不一致に対してエラーを報告する（デフォルト）。 |
| `warn`   | 警告を報告する。                                   |
| `ignore` | null許容性の不一致を無視する。                     |

> JSpecifyアノテーションの詳細については、[JSpecifyユーザーガイド](https://jspecify.dev/docs/user-guide) を参照してください。
> 
{type="tip"}

### JSR-305のサポート {id="jsr-305-support"}

Java型のnull許容性を示すために、[JSR-305](https://jcp.org/en/jsr/detail?id=305) で定義されている [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) アノテーションがサポートされています。

`@Nonnull(when = ...)` の値が `When.ALWAYS` の場合、アノテーションが付けられた型はnull非許容として扱われます。`When.MAYBE` と
`When.NEVER` はnull許容型を示し、`When.UNKNOWN` はその型を強制的に[プラットフォーム型](#null-safety-and-platform-types)にします。

ライブラリはJSR-305アノテーションに対してコンパイルできますが、アノテーションを含む成果物（例：`jsr305.jar`）をライブラリ利用者のコンパイル依存関係にする必要はありません。Kotlinコンパイラは、クラスパスにアノテーションが存在しなくても、ライブラリからJSR-305アノテーションを読み取ることができます。

[カスタムnull許容修飾子 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md) もサポートされています（後述）。

#### 型修飾子のニックネーム (Type qualifier nicknames) {id="type-qualifier-nicknames"}

アノテーション型に [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) とJSR-305の `@Nonnull`（または `@CheckForNull` などの別のニックネーム）の両方が付けられている場合、そのアノテーション型自体が正確なnull許容性を取得するために使用され、そのnull許容性アノテーションと同じ意味を持ちます：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 別の型修飾子ニックネームに対するニックネーム
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // Kotlin（strictモード）：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // Kotlin（strictモード）：`fun bar(x: List<String>!): String!`
}
```

#### デフォルト型修飾子 (Type qualifier defaults) {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) を使用すると、適用された際に、アノテーションが付けられた要素のスコープ内におけるデフォルトのnull許容性を定義するアノテーションを導入できます。

このようなアノテーション型自体には、`@Nonnull`（またはそのニックネーム）と、1つ以上の `ElementType` 値を持つ `@TypeQualifierDefault(...)` の両方が付けられている必要があります：

* `ElementType.METHOD`：メソッドの戻り値の型
* `ElementType.PARAMETER`：値パラメータ
* `ElementType.FIELD`：フィールド
* `ElementType.TYPE_USE`：型引数、型パラメータの上限、ワイルドカード型を含む任意の型

型自体にnull許容性アノテーションが付けられていない場合にデフォルトのnull許容性が使用され、デフォルトは、型の使用箇所と一致する `ElementType` を持つデフォルト型修飾子アノテーションが付けられた最も内側の囲む要素によって決定されます。

```java
@Nonnull
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
public @interface NonNullApi {
}

@Nonnull(when = When.MAYBE)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE_USE})
public @interface NullableApi {
}

@NullableApi
interface A {
    String foo(String x); // Kotlin：fun foo(x: String?): String?

    @NonNullApi // インターフェースからのデフォルトをオーバーライド
    String bar(String x, @Nullable String y); // Kotlin：fun bar(x: String, y: String?): String

    // `@NullableApi` が `TYPE_USE` 要素タイプを持っているため、
    // List<String> の型引数はnull許容と見なされる：
    String baz(List<String> x); // Kotlin：fun baz(List<String?>?): String?

    // 明示的な UNKNOWN マークのnull許容性アノテーションがあるため、
    // パラメータ `x` の型はプラットフォーム型のままとなる：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // Kotlin：fun qux(x: String!): String?
}
```

> この例の型は strict モードが有効な場合にのみ適用され、それ以外の場合はプラットフォーム型のままになります。
> [`@UnderMigration` アノテーション](#undermigration-annotation) および [コンパイラ設定](#compiler-configuration) セクションを参照してください。
>
{style="note"}

パッケージレベルのデフォルトnull許容性もサポートされています：

```java
// FILE: test/package-info.java
@NonNullApi // パッケージ 'test' 内のすべての型をデフォルトでnull非許容として宣言
package test;
```

#### @UnderMigration アノテーション {id="undermigration-annotation"}

`@UnderMigration` アノテーション（別の成果物 `kotlin-annotations-jvm` で提供）は、null許容型修飾子の移行ステータスを定義するためにライブラリのメンテナが使用できます。

`@UnderMigration(status = ...)` のステータス値は、Kotlinにおいてアノテーションが付けられた型の不適切な使用（例：`@MyNullable` でアノテーションされた型の値をnull非許容として使用するなど）をコンパイラがどのように扱うかを指定します：

* `MigrationStatus.STRICT`：通常のアノテーションと同様に機能し、不適切な使用に対してエラーを報告し、アノテーションされた宣言の型がKotlinから見える型に影響を与えます
* `MigrationStatus.WARN`：不適切な使用はエラーではなくコンパイル警告として報告されますが、アノテーションされた宣言内の型はプラットフォーム型のままになります
* `MigrationStatus.IGNORE`：コンパイラはnull許容性アノテーションを完全に無視します

ライブラリのメンテナは、型修飾子のニックネームとデフォルト型修飾子の両方に `@UnderMigration` ステータスを追加できます：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// `@NonNullApi` に `@UnderMigration(status = MigrationStatus.WARN)` が注釈されているため、
// クラス内の型はnull非許容ですが、警告のみが報告されます
@NonNullApi
public class Test {}
```

> null許容性アノテーションの移行ステータスは、その型修飾子ニックネームには継承されませんが、デフォルト型修飾子での使用には適用されます。
>
{style="note"}

デフォルト型修飾子が型修飾子ニックネームを使用しており、その両方に `@UnderMigration` が付いている場合は、デフォルト型修飾子のステータスが使用されます。

#### コンパイラ設定 {id="compiler-configuration"}

JSR-305のチェックは、以下の値（およびその組み合わせ）を指定した `-Xjsr305` コンパイラオプションを追加することで設定できます：

* `-Xjsr305={strict|warn|ignore}`：`@UnderMigration` 以外のアノテーションに対する動作を設定します。
  カスタムnull許容修飾子、特に `@TypeQualifierDefault` は多くのよく知られたライブラリですでに広く使われており、ユーザーはJSR-305サポートを含むKotlinバージョンに更新する際にスムーズに移行する必要がある場合があります。
  このオプションは `@UnderMigration` 以外のアノテーションにのみ影響します。
* `-Xjsr305=under-migration:{strict|warn|ignore}`：`@UnderMigration` アノテーションの動作をオーバーライドします。
  ライブラリの移行ステータスについてのユーザーの視点は異なる場合があります。公式の移行ステータスが `WARN` であってもエラーとして扱いたい場合や、逆に移行が完了するまでエラー報告を延期したい場合があります。
* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`：単一のアノテーションに対する動作をオーバーライドします。ここで `<fq.name>` はアノテーションの完全修飾クラス名です。異なるアノテーションに対して複数回指定できます。
  これは、特定のライブラリの移行状態を管理するのに便利です。

`strict`、`warn`、`ignore` の値は `MigrationStatus` の値と同じ意味を持ち、`strict` モードのみがKotlinから見えるアノテーション付き宣言の型に影響します。

> 組み込みのJSR-305アノテーションである [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html)、および [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) は常に有効であり、`-Xjsr305` オプションによるコンパイラ設定に関係なく、Kotlinにおけるアノテーション付き宣言の型に影響を与えます。
>
{style="note"}

たとえば、コンパイラ引数に `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` を追加すると、コンパイラは `@org.library.MyNullable` でアノテーションされた型の不適切な使用に対して警告を生成し、他のすべてのJSR-305アノテーションを無視するようになります。

デフォルトの動作は `-Xjsr305=warn` と同じです。
`strict` の値は実験的なものとみなされるべきです（将来的にさらに多くのチェックが追加される可能性があります）。

## マップされた型 {id="mapped-types"}

Kotlinは、一部のJavaの型を特別に扱います。そのような型はJavaから「そのまま」ロードされるのではなく、対応するKotlinの型に_マップ（対応付け）_されます。
このマッピングはコンパイル時にのみ意味を持ち、実行時の表現は変更されません。
Javaのプリミティブ型は、対応するKotlinの型にマップされます（[プラットフォーム型](#null-safety-and-platform-types)を念頭に置いてください）：

| **Javaの型**  | **Kotlinの型**   |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

プリミティブではない組み込みクラスの一部もマップされます：

| **Javaの型**                      | **Kotlinの型**         |
|-----------------------------------|------------------------|
| `java.lang.Object`                | `kotlin.Any!`          |
| `java.lang.Cloneable`             | `kotlin.Cloneable!`    |
| `java.lang.Comparable`            | `kotlin.Comparable!`   |
| `java.lang.Enum`                  | `kotlin.Enum!`         |
| `java.lang.annotation.Annotation` | `kotlin.Annotation!`   |
| `java.lang.CharSequence`          | `kotlin.CharSequence!` |
| `java.lang.String`                | `kotlin.String!`       |
| `java.lang.Number`                | `kotlin.Number!`       |
| `java.lang.Throwable`             | `kotlin.Throwable!`    |

Javaのボックス化されたプリミティブ型は、null許容のKotlin型にマップされます：

| **Javaの型**          | **Kotlinの型**    |
|-----------------------|-------------------|
| `java.lang.Byte`      | `kotlin.Byte?`    |
| `java.lang.Short`     | `kotlin.Short?`   |
| `java.lang.Integer`   | `kotlin.Int?`     |
| `java.lang.Long`      | `kotlin.Long?`    |
| `java.lang.Character` | `kotlin.Char?`    |
| `java.lang.Float`     | `kotlin.Float?`   |
| `java.lang.Double`    | `kotlin.Double?`  |
| `java.lang.Boolean`   | `kotlin.Boolean?` |

なお、型パラメータとして使用されるボックス化されたプリミティブ型は、プラットフォーム型にマップされることに注意してください。
たとえば、`List<java.lang.Integer>` はKotlinでは `List<Int!>` になります。

Kotlinのコレクション型は読み取り専用または可変のいずれかになり得るため、Javaのコレクションは次のようにマップされます
（この表にあるすべてのKotlinの型は `kotlin.collections` パッケージに属しています）：

| **Javaの型**      | **Kotlinの読み取り専用型** | **Kotlinの可変型**             | **ロードされたプラットフォーム型**   |
|-------------------|----------------------------|--------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`              | `MutableIterator<T>`           | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`              | `MutableIterable<T>`           | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`            | `MutableCollection<T>`         | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                   | `MutableSet<T>`                | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                  | `MutableList<T>`               | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`          | `MutableListIterator<T>`       | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`                | `MutableMap<K, V>`             | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`          | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Javaの配列は[後述](#java-arrays)のようにマップされます：

| **Javaの型**  | **Kotlinの型**                 |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> これらのJava型の静的メンバーには、Kotlin型の[コンパニオンオブジェクト](object-declarations.md#companion-objects)から直接アクセスすることはできません。これらを呼び出すには、`java.lang.Integer.toHexString(255)` のように [Java型の完全修飾名を使用します](#accessing-static-members)。
>
{style="note"}

## KotlinにおけるJavaジェネリクス {id="java-generics-in-kotlin"}

KotlinのジェネリクスはJavaのものとは少し異なります（[ジェネリクス](generics.md) を参照）。
Javaの型をKotlinにインポートする際、以下の変換が行われます：

* Javaのワイルドカードは型投影（type projection）に変換されます：
  * `Foo<? extends Bar>` は `Foo<out Bar!>!` になります
  * `Foo<? super Bar>` は `Foo<in Bar!>!` になります

* Javaの原型（raw types）はスター投影（star projection）に変換されます：
  * `List` は `List<*>!`、つまり `List<out Any?>!` になります

Javaと同様に、Kotlinのジェネリクスは実行時に保持されません。オブジェクトはそのコンストラクタに渡された実際の型引数に関する情報を保持しません。たとえば、`ArrayList<Integer>()` と `ArrayList<Character>()` は区別できません。
このため、ジェネリクスを考慮した `is` チェックを実行することはできません。
Kotlinでは、スター投影されたジェネリック型に対する `is` チェックのみが許可されます：

```kotlin
if (a is List<Int>) // エラー：実際に Int の List であるかどうかはチェックできない
// しかし
if (a is List<*>)   // OK：リストの内容についての保証はない
```

## Java配列 {id="java-arrays"}

Javaとは異なり、Kotlinの配列は不変（invariant）です。つまり、Kotlinでは `Array<String>` を `Array<Any>` に代入することができず、これにより実行時エラーの可能性を防いでいます。サブクラスの配列をスーパークラスの配列としてKotlinのメソッドに渡すことも禁止されていますが、Javaのメソッドに対しては `Array<(out) String>!` という形式の[プラットフォーム型](#null-safety-and-platform-types)を通じてこれが許可されています。

Javaプラットフォームでは、ボクシング/アンボクシング処理のコストを回避するために、配列がプリミティブデータ型とともに使用されます。
Kotlinはそれらの実装の詳細を隠蔽しているため、Javaコードと相互接続するための回避策が必要です。
このケースを処理するために、プリミティブ配列の型ごとに特化したクラス（`IntArray`、`DoubleArray`、`CharArray` など）が存在します。
これらは `Array` クラスとは関連がなく、最大限のパフォーマンスを得るためにJavaのプリミティブ配列へとコンパイルされます。

インデックスの int 配列を受け取るJavaメソッドがあるとします：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // ここにコードを記述
    }
}
```

プリミティブ値の配列を渡すには、Kotlinで以下のように記述できます：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array) // int[] をメソッドに渡す
```

JVMバイトコードにコンパイルされる際、コンパイラはオーバーヘッドが生じないように配列へのアクセスを最適化します：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 実際の get() や set() の呼び出しは生成されない
for (x in array) {      // イテレータは生成されない
    print(x)
}
```

インデックスを使って走査する場合でも、オーバーヘッドは一切発生しません：

```kotlin
for (i in array.indices) { // イテレータは生成されない
    array[i] += 2
}
```

最後に、`in` チェックにもオーバーヘッドはありません：

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size) と同じ
    print(array[i])
}
```

## Javaの可変長引数 (varargs) {id="java-varargs"}

Javaクラスでは、可変長引数（varargs）を持つインデックスのメソッド宣言が使用されることがあります：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // ここにコードを記述
    }
}
```

その場合、`IntArray` を渡すにはスプレッド演算子 `*` を使用する必要があります：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 演算子 {id="operators"}

Javaには演算子構文を使用することが理にかなっているメソッドをマークする方法がないため、Kotlinでは正しい名前とシグネチャを持つ任意のJavaメソッドを演算子オーバーロードやその他の規約（`invoke()` など）として使用することが許可されています。
中置呼び出し（infix call）構文を使用したJavaメソッドの呼び出しは許可されていません。

たとえば、`get(int)` および `set(int, T)` メソッドを宣言しているJavaクラスを、Kotlinでインデックスアクセス演算子とともに使用できます：

```java
public class IntContainer {
    private final int[] values = new int[10];

    public int get(int index) {
        return values[index];
    }

    public void set(int index, int value) {
        values[index] = value;
    }
}
```

```kotlin
fun main() {
    val container = IntContainer()
    container[0] = 42     // set(0, 42) を呼び出す
    println(container[0]) // get(0) を呼び出す
}
```

## チェック例外 {id="checked-exceptions"}

Kotlinでは、すべての[例外は非チェック例外（unchecked exceptions）](exceptions.md)です。つまり、コンパイラがいずれかの例外をキャッチすることを強制することはありません。
そのため、チェック例外を宣言しているJavaメソッドを呼び出す場合でも、Kotlinは何も強制しません：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Javaでは、Appendable.append() からスローされる IOException をキャッチする必要がある
    }
}
```

## Objectのメソッド {id="object-methods"}

Javaの型がKotlinにインポートされると、`java.lang.Object` 型の参照はすべて `Any` に変換されます。
`Any` はプラットフォーム固有のものではないため、メンバーとして `toString()`、`hashCode()`、`equals()` のみを宣言しています。
そのため、`java.lang.Object` の他のメンバーを利用できるようにするために、Kotlinは[拡張関数](extensions.md)を使用します。

### `wait()` と `notify()` {id="wait-and-notify"}

メソッド `wait()` と `notify()` は、`Any` 型の参照では利用できません。これらの使用は一般的に非推奨であり、`java.util.concurrent` の使用が推奨されます。

これらのメソッドを呼び出さなければならない場合は、Javaオブジェクトを通じてアクセスし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制してください：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() と notify() にアクセスするために java.lang.Object のインスタンスを使用
    // Kotlinでは、標準の 'Any' 型はこれらのメソッドを公開していません
    @Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
    private val lock = Object()

    fun put(item: T) {
        synchronized(lock) {
            while (queue.size >= capacity) {
                lock.wait()
            }
            queue.add(item)
            println("Produced: $item")

            lock.notifyAll()
        }
    }

    fun take(): T {
        synchronized(lock) {
            while (queue.isEmpty()) {
                lock.wait()
            }
            val item = queue.removeFirst()
            println("Consumed: $item")

            lock.notifyAll()
            return item
        }
    }
}
```

または、明示的に `java.lang.Object` にキャストして、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制します：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(instance as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

オブジェクトのJavaクラスを取得するには、[クラス参照](reflection.md#obtain-a-runtime-class) の `java` 拡張プロパティを使用します：

```kotlin
val instanceClass = instance::class.java
```

上記のコードは[バインドされたクラス参照](lambdas.md#bound-and-unbound-references)を使用しています。また、`javaClass` 拡張プロパティを使用することもできます：

```kotlin
val instanceClass = instance.javaClass
```

### `clone()` {id="clone"}

`clone()` をオーバーライドするには、クラスが `kotlin.Cloneable` を拡張（実装）する必要があります：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

『[Effective Java 第3版](https://www.oracle.com/technetwork/java/effectivejava-136174.html)』の項目13「*cloneは慎重にオーバーライドする*」を忘れないでください。

### `finalize()` {id="finalize"}

`finalize()` をオーバーライドするには、`override` キーワードを使わずに宣言します：

```kotlin
class C {
    protected fun finalize() {
        // ファイナライズのロジック
    }
}
```

Javaのルールに従い、`finalize()` は `private` にしてはいけません。

> `finalize()` メソッドは最近のJavaバージョンでは非推奨（deprecated）です。代わりに [`java.lang.ref.Cleaner`](https://docs.oracle.com/javase/9/docs/api/java/lang/ref/Cleaner.html) や [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) などの代替手段を検討してください。
>
{style="note"}

## Javaクラスからの継承 {id="inheritance-from-java-classes"}

Kotlinのクラスのスーパータイプに指定できるJavaクラスは最大1つ（Javaインターフェースはいくつでも可）です。

## 静的メンバーへのアクセス {id="accessing-static-members"}

Javaクラスの静的（static）メンバーは、それらのクラスの「コンパニオンオブジェクト」を形成します。このような「コンパニオンオブジェクト」を値として渡すことはできませんが、以下のように明示的にメンバーにアクセスできます：

```kotlin
if (Character.isLetter(a)) { ... }
```

インポートされたJavaクラスの静的メソッドを呼び出すには、Javaと同様にクラス名を直接使用します。以下のJavaクラスを考えてみましょう：

```java
package org.example;

public class MathUtils {
    public static int triple(int value) {
        return value * 3;
    }
}
```

クラスをインポートし、クラス名を通じてその静的メソッドを呼び出します：

```kotlin
import org.example.MathUtils

fun main() {
    println(MathUtils.triple(5)) // 静的メソッド triple() を呼び出す
}
```

Kotlin型に[マップ](#mapped-types)されているJava型の静的メンバーにアクセスするには、`java.lang.Integer.bitCount(5)` のようにJava型の完全修飾名を使用します。

## Javaリフレクション {id="java-reflection"}

JavaリフレクションはKotlinクラスに対して機能し、その逆も同様です。前述のように、`instance::class.java`、`ClassName::class.java`、または `instance.javaClass` を使用して `java.lang.Class` を介したJavaリフレクションに入ることができます。
この目的で `ClassName.javaClass` を使用しないでください。これは `ClassName` の[コンパニオンオブジェクト](object-declarations.md#companion-objects)のクラスを参照しており、`ClassName::class.java` ではなく `ClassName.Companion::class.java` と同じになってしまうためです。

プリミティブ型ごとに異なる2つのJavaクラスが存在し、Kotlinはその両方を取得する方法を提供しています。たとえば、`Int::class.java` はJavaの `Integer.TYPE` に対応する、プリミティブ型自体を表すクラスインスタンスを返します。対応するラッパー型のクラスを取得するには、Javaの `Integer.class` に相当する `Int::class.javaObjectType` を使用します。

その他のサポートされているケースとしては、Kotlinプロパティに対するJavaゲッター/セッターメソッドやバッキングフィールドの取得、Javaフィールドに対する `KProperty`、`KFunction` に対するJavaメソッドまたはコンストラクタの取得、およびその逆などがあります。

## SAM変換 {id="sam-conversions"}

Kotlinは、Javaと[Kotlinのインターフェース](fun-interfaces.md)の両方に対してSAM変換（Single Abstract Method変換）をサポートしています。
Javaに対するこのサポートにより、インターフェースメソッドのパラメータ型がKotlin関数のパラメータ型と一致している限り、Kotlinの関数リテラルを単一の非デフォルトメソッドを持つJavaインターフェースの実装へと自動的に変換できます。

これを使用して、SAMインターフェースのインスタンスを作成できます：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

また、メソッド呼び出し内でも使用できます：

```kotlin
val executor = Executors.newSingleThreadExecutor()
// Javaのシグネチャ：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Javaクラスに関数型インターフェースを受け取る複数のメソッドがある場合、ラムダを特定のSAM型に変換するアダプタ関数を使用することで、呼び出すメソッドを選択できます。これらのアダプタ関数も、必要に応じてコンパイラによって生成されます：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM変換はインターフェースに対してのみ機能します。抽象クラスに抽象メソッドが1つしかない場合であっても、抽象クラスには適用されません。
>
{style="note"}

## KotlinでのJNIの使用 {id="using-jni-with-kotlin"}

ネイティブコード（CまたはC++）で実装されている関数を宣言するには、`external` 修飾子でマークする必要があります：

```kotlin
external fun calculateSum(x: Int): Double
```

手順の残りの部分は、Javaとまったく同じように動作します。

また、プロパティのゲッターとセッターを `external` としてマークすることもできます：

```kotlin
var myProperty: String
    external get
    external set
```

裏側では、これにより両方に `external` のマークが付いた2つの関数 `getMyProperty` と `setMyProperty` が作成されます。

## KotlinでのLombok生成宣言の使用 {id="using-lombok-generated-declarations-in-kotlin"}

Kotlinコード内でJavaのLombokによって生成された宣言を使用できます。
同一のJava/Kotlin混在モジュール内でこれらの宣言を生成して使用する必要がある場合は、その方法について [Lombokコンパイラプラグインのページ](lombok.md) を参照してください。
別のモジュールからそのような宣言を呼び出す場合は、そのモジュールをコンパイルするためにこのプラグインを使用する必要はありません。