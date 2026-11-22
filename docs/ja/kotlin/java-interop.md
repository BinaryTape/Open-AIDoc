[//]: # (title: Kotlin から Java を呼び出す)
<web-summary>ゲッターとセッター、null安全とプラットフォーム型、null許容性アノテーション、マップされた型、SAM変換など、KotlinからJavaコードを呼び出す方法を学びます。</web-summary>

Kotlinは、Javaとの相互運用性を念頭に置いて設計されています。既存のJavaコードは自然な方法でKotlinから呼び出すことができ、Kotlinのコードも同様にJavaから使用できます。

特別な設定なしで、ほとんどのJavaコードを使用できます：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // Javaコレクションに対して 'for' ループが機能します:
    for (item in source) {
        list.add(item)
    }
    // 演算子の規約も同様に機能します:
    for (i in 0..<source.size) {
        list[i] = source[i] // get と set が呼び出されます
    }
}
```

## ゲッターとセッター {id="getters-and-setters"}

ゲッターとセッターのJava規約（`get` で始まる名前の引数なしメソッド、および `set` で始まる名前の単一引数メソッド）に従うメソッドは、Kotlinではプロパティとして表現されます。このようなプロパティは「合成プロパティ（_synthetic properties_）」とも呼ばれます。
`Boolean` のアクセサメソッド（ゲッターの名前が `is` で始まり、セッターの名前が `set` で始まるもの）は、ゲッターメソッドと同じ名前を持つプロパティとして表現されます。

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

Javaクラスにセッターしか存在しない場合、Kotlinはset専用のプロパティをサポートしていないため、Kotlinではプロパティとして認識されない点に注意してください。

合成プロパティとして表現されるのは引数なしのゲッターのみです。ゲッターに引数を取るオーバーロードがある場合、そのオーバーロードはプロパティとしては公開されず、多くの場合、完全なメソッド名を使用して呼び出すことになります。次のJavaクラスを考えてみましょう：

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

引数なしの `getMessage()` メソッドは、合成プロパティ `message` を介して利用できます。オーバーロードされた `getMessage(String)` メソッドを使用するには、関数として呼び出します：

```kotlin
// Kotlin
fun main() {
    val greeting = Greeting()
    println(greeting.message)              // 合成プロパティを介して getMessage() にアクセス
    println(greeting.getMessage("Kotlin")) // オーバーロードされた getMessage(String) メソッドを呼び出す
}
```

`message` プロパティは引数を受け取らないため、`greeting.message("Kotlin")` を呼び出してもコンパイルされず、未解決の参照エラー（レシーバーの型の不一致）が返されます。

ただし、パラメータを持つJavaメソッドがKotlinの[メンバ拡張プロパティ](extensions.md#declaring-extensions-as-members)のゲッターをオーバーライドしている場合、Kotlinはそのメソッドをプロパティとして扱います。そのため、メソッド名ではなく、レシーバーのスコープ内でのみプロパティとして呼び出すことができます：

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
    greeter.getText("Kotlin")       // エラー: 未解決の参照 (unresolved reference)
    with(greeter) { "Kotlin".text } // メンバ拡張プロパティを介して getText(String) にアクセス
}
```

## `void` を返すメソッド {id="methods-returning-void"}

Javaメソッドが `void` を返す場合、Kotlinから呼び出すとその戻り値の型は `Unit` になります。その戻り値を使用する場合、値は事前に分かっているため、Kotlinコンパイラは呼び出し側で `Unit` を代入します。

## KotlinのキーワードであるJava識別子のエスケープ {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

Kotlinのキーワードの一部（`in`、`object`、`is` など）は、Javaでは有効な識別子です。JavaライブラリがメソッドにKotlinのキーワードを使用している場合でも、バッククォート（`）文字でエスケープすることでそのメソッドを呼び出すことができます：

```kotlin
matcher.`is`(expected)
```

## Null安全とプラットフォーム型 {id="null-safety-and-platform-types"}

Javaにおけるすべての参照は `null` になり得るため、Javaから持ち込まれるオブジェクトに対してKotlinの厳格なnull安全性の要件を適用することは実用的ではありません。
Java宣言の型はKotlinでは直接指定できない型（non-denotable）として扱われ、[_プラットフォーム型_](https://kotlinlang.org/spec/type-system.html#platform-types)（platform types）と呼ばれます。
コード内でこの指定不可能な型を明示的に記述することはできません。したがって、プラットフォーム型の値がKotlin変数に代入される場合、次のいずれかを行うことができます：

* 型推論に依存する。この場合、変数には推論されたプラットフォーム型が設定されます。
* 期待する型を選択する。Kotlinではnull許容型とnull非許容型の両方が許可されます。

プラットフォーム型ではnullチェックが緩和されるため、[マップされたJava型](#mapped-types)と同じ安全性保証が適用されます。以下の例を考えてみましょう：

```kotlin
val list = ArrayList<String>() // 非null（コンストラクタの結果）
list.add("Item")
val size = list.size // 非null（プリミティブの int）
val item = list[0] // プラットフォーム型と推論される（通常のJavaオブジェクト）
```

プラットフォーム型の変数に対してメソッドを呼び出す場合、Kotlinはコンパイル時にnull許容性のエラーを出しませんが、nullポインタ例外や、nullの伝播を防ぐためにKotlinが生成するアサーションによって、実行時に呼び出しが失敗する可能性があります：

```kotlin
item.substring(1) // 許可されるが、item == null の場合は例外をスロー
```

プラットフォーム型の値は、Kotlinのnull許容型およびnull非許容型の変数の両方に代入できます。ただし、そのような値をnull非許容型の変数に代入し、その値が実行時に実際に `null` であった場合、Kotlinは `NullPointerException` をスローします。これを防ぐには、Kotlinコードに明示的なnull許容性を追加してください：

```kotlin
val nullable: String? = item // 許可され、常に動作する
val notNull: String = item // 許可されるが、実行時に失敗する可能性がある
```

null非許容型を選択した場合、コンパイラは代入時にアサーションを出力します。これにより、Kotlinのnull非許容変数がnullを保持することを防ぎます。アサーションは、非null値を期待するKotlin関数にプラットフォーム値を渡す場合や、その他の状況でも出力されます。
全体として、コンパイラはプログラム全体にnullが広く伝播するのを防ぐために最善を尽くしますが、ジェネリクスが原因でこれを完全に排除できない場合もあります。

### プラットフォーム型の表記法 {id="notation-for-platform-types"}

前述のとおり、プラットフォーム型はプログラム内で明示的に言及できないため、言語内にはそのための構文がありません。それにもかかわらず、コンパイラやIDEはこれらを表示する必要がある場合があるため（エラーメッセージやパラメータ情報など）、記憶用の表記法（ニーモニック表記）が存在します：

* `T!` は「`T` または `T?`」を意味します
* `(Mutable)Collection<T>!` は「`T` のJavaコレクションは可変または不変の可能性があり、null許容または非許容の可能性がある」ことを意味します
* `Array<(out) T>!` は「`T`（または `T` のサブタイプ）のJava配列であり、null許容または非許容」を意味します

エラーメッセージやIDEのツールチップでこの表記を見かけた場合は、Kotlin変数に明示的な型注釈を追加してnull安全チェックを復元するか、null許容性アノテーションを使用して発生元でプラットフォーム型を解消してください。

### Null許容性アノテーション {id="nullability-annotations"}

null許容性アノテーションが付与されたJava型は、プラットフォーム型としてではなく、実際のnull許容またはnull非許容のKotlin型として表現されます。コンパイラは、以下を含むいくつかの種類のnull許容性アノテーションをサポートしています：

* [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
  (`org.jetbrains.annotations` パッケージの `@Nullable` および `@NotNull`)
* [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
* Android (`com.android.annotations`、`android.support.annotation`、`androidx.annotation`、`android.annotation`)
* [JSR-305](#jsr-305-support) (`javax.annotation`)
* FindBugs (`edu.umd.cs.findbugs.annotations`)
* Eclipse (`org.eclipse.jdt.annotation`)
* [Lombok](lombok.md) (`lombok.NonNull`)
* RxJava 3 (`io.reactivex.rxjava3.annotations`)
* [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

次のコンパイラオプションを使用すると、特定のnull許容性アノテーションに対してnull許容性の不一致を報告するようコンパイラに指示できます：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

完全修飾されたnull許容性アノテーションのパッケージ名と、以下のいずれかのレポートレベルを指定します：

* `ignore`: null許容性の不一致を無視
* `warn`: 警告を報告
* `strict`: エラーを報告

> [JSpecify](#jspecify-support) は、デフォルトで `strict` レポートレベルを使用する唯一のサポートされたフレーバーです。
> 追加の設定なしでnull許容性アノテーションのエラーを報告させるために使用してください。
>
{style="note"}

サポートされているnull許容性アノテーションの完全なリストについては、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)を参照してください。

### 可変性アノテーション {id="mutability-annotations"}

Javaの宣言に可変性アノテーション（mutability annotation）を付与して、返されるコレクションがKotlinで読み取り専用か可変かを指定できます。
異なる可変性を持つコレクション型にその値を代入すると、コンパイラは型の不一致を報告します。
診断の深刻度は、特定の可変性アノテーションによって異なります。

コンパイラは、以下を含むいくつかの可変性アノテーションをサポートしています：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

サポートされている可変性アノテーションの完全なリストについては、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)を参照してください。

### 型引数と型パラメータのアノテーション {id="annotating-type-arguments-and-type-parameters"}

ジェネリック型の型引数および型パラメータにアノテーションを付与して、それらにもnull許容性の情報を提供できます。

> このセクションのすべての例では、`org.jetbrains.annotations` パッケージのJetBrains null許容性アノテーションを使用しています。
>
{style="note"}

#### 型引数 {id="type-arguments"}

Java宣言における以下の注釈を考えてみましょう：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

これらはKotlinでは次のシグネチャになります：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

型引数に `@NotNull` アノテーションがない場合、代わりにプラットフォーム型が得られます：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlinは、基底クラスやインターフェースの型引数にあるnull許容性アノテーションも考慮します。例えば、以下のようなシグネチャを持つ2つのJavaクラスがあるとします：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

Kotlinコードにおいて、`Base<String>` が想定されている場所に `Derived` のインスタンスを渡すと、警告が生成されます。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告: nullability mismatch
}
```

`Derived` の上限は `Base<String?>` に設定されており、これは `Base<String>` とは異なります。

詳細については、[KotlinにおけるJavaのジェネリクス](#java-generics-in-kotlin)を参照してください。

#### 型パラメータ {id="type-parameters"}

デフォルトでは、KotlinとJavaの両方で単純な型パラメータのnull許容性は未定義です。Javaでは、null許容性アノテーションを使用してこれを指定できます。`Base` クラスの型パラメータにアノテーションを付けてみましょう：

```java
public class Base<@NotNull T> {}
```

`Base` から継承する場合、Kotlinはnull非許容の型引数または型パラメータを期待します。
したがって、次のKotlinコードは警告を生成します：

```kotlin
class Derived<K> : Base<K> {} // 警告: K has undefined nullability
```

上限として `K : Any` を指定することで、これを修正できます。

Kotlinは、Javaの型パラメータの境界に対するnull許容性アノテーションもサポートしています。`Base` に境界を追加してみましょう：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlinはこれを次のように変換します：

```kotlin
class BaseWithBound<T : Number> {}
```

そのため、型引数または型パラメータとしてnull許容型を渡すと警告が生成されます。

型引数および型パラメータのアノテーションは、Java 8以降をターゲットとする場合に機能します。この機能を使用するには、null許容性アノテーションが `TYPE_USE` ターゲットをサポートしている必要があります（`org.jetbrains.annotations` はバージョン15以降でこれをサポートしています）。

> null許容性アノテーションが、`TYPE_USE` ターゲットに加えて型に適用可能な他のターゲットもサポートしている場合、`TYPE_USE` が優先されます。例えば、`@Nullable` が `TYPE_USE` と `METHOD` の両方のターゲットを持つ場合、Javaのメソッドシグネチャ `@Nullable String[] f()` は、Kotlinでは `fun f(): Array<String?>!` になります。
>
{style="note"}

### JSpecify のサポート {id="jspecify-support"}

Kotlinは、Javaのnull許容性のための統一されたアノテーションセットを提供する [JSpecify](https://jspecify.dev/) のnull許容性アノテーションをサポートしています。JSpecifyを使用すると、Javaの宣言に詳細なnull許容性情報を提供でき、KotlinがJavaコードと連携する際にnull安全性を維持するのに役立ちます。

Kotlinは、`org.jspecify.annotations` パッケージ内の以下の注釈をサポートしています：

* `@Nullable`: 型をnull許容としてマークします。
* `@NonNull`: 型をnull非許容としてマークします。
* `@NullMarked`: 特にアノテーションが付けられていない限り、クラスやパッケージなどのスコープ内のすべての型をデフォルトでnull非許容としてマークします。

  このアノテーションは、ローカル変数および[型変数（ジェネリクス）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)には適用されません。
  型変数は、特定のnull許容またはnull非許容型が提供されるまで「null不可知（null-agnostic）」のままです。

* `@NullUnmarked`: `@NullMarked` の効果を取り消し、スコープ内のすべての型を[プラットフォーム型](#null-safety-and-platform-types)にします。

JSpecifyアノテーションを持つ次のJavaクラスを考えてみましょう：
 
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
    inventory.nullable().length // エラー: 安全呼び出し (?.) または null 非許容アサーション (!!) のみ許可されます
}
```

デフォルトでは、KotlinコンパイラはJSpecifyアノテーションのnull許容性の不一致をエラーとして報告します。
以下のコンパイラオプションを使用して、JSpecifyのnull許容性診断の深刻度をカスタマイズできます：

```bash
-Xjspecify-annotations=<report-level>
```

使用可能なレポートレベルは次のとおりです：

| レベル   | 説明                                               |
|----------|----------------------------------------------------|
| `strict` | null許容性の不一致をエラーとして報告します（デフォルト）。 |
| `warn`   | 警告を報告します。                                 |
| `ignore` | null許容性の不一致を無視します。                   |

> JSpecifyアノテーションの詳細については、[JSpecify ユーザーガイド](https://jspecify.dev/docs/user-guide)を参照してください。
> 
{type="tip"}

### JSR-305 のサポート {id="jsr-305-support"}

Java型のnull許容性を示すために、[JSR-305](https://jcp.org/en/jsr/detail?id=305) で定義されている [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) アノテーションがサポートされています。

`@Nonnull(when = ...)` の値が `When.ALWAYS` の場合、アノテーションが付けられた型はnull非許容として扱われます。`When.MAYBE` と `When.NEVER` はnull許容型を示し、`When.UNKNOWN` はその型を[プラットフォーム型](#null-safety-and-platform-types)に強制します。

ライブラリはJSR-305アノテーションに対してコンパイルできますが、ライブラリの利用者がアノテーションを含むアーティファクト（例: `jsr305.jar`）をコンパイル依存関係にする必要はありません。Kotlinコンパイラは、クラスパスにアノテーションが存在しなくても、ライブラリからJSR-305アノテーションを読み取ることができます。

[カスタムnull許容修飾子（KEEP-79）](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)もサポートされています（下記参照）。

#### 型修飾子のニックネーム {id="type-qualifier-nicknames"}

あるアノテーション型に [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) と JSR-305 の `@Nonnull`（またはその別のニックネーム、例: `@CheckForNull`）の両方が付与されている場合、そのアノテーション型自体が正確なnull許容性を取得するために使用され、そのnull許容性アノテーションと同じ意味を持ちます：

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
    // Kotlin (strict モード): `fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // Kotlin (strict モード): `fun bar(x: List<String>!): String!`
}
```

#### デフォルトの型修飾子 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) を使用すると、適用された際にアノテーション対象要素のスコープ内でのデフォルトのnull許容性を定義するアノテーションを導入できます。

このようなアノテーション型自体には、`@Nonnull`（またはそのニックネーム）と、1つ以上の `ElementType` 値を持つ `@TypeQualifierDefault(...)` の両方を付与する必要があります：

* `ElementType.METHOD`: メソッドの戻り値の型用
* `ElementType.PARAMETER`: 値パラメータ用
* `ElementType.FIELD`: フィールド用
* `ElementType.TYPE_USE`: 型引数、型パラメータの上限、ワイルドカード型を含む任意の型用

デフォルトのnull許容性は、型自体にnull許容性アノテーションが付与されていない場合に使用され、そのデフォルト値は、型の使用方法と一致する `ElementType` を持つ型修飾子のデフォルトアノテーションが付与された最も内側の囲み要素によって決定されます。

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
    String foo(String x); // Kotlin: fun foo(x: String?): String?

    @NonNullApi // インターフェースからのデフォルトをオーバーライド
    String bar(String x, @Nullable String y); // Kotlin: fun bar(x: String, y: String?): String

    // `TYPE_USE` 要素タイプを持つ `@NullableApi` により、
    // List<String> の型引数は null 許容として認識されます:
    String baz(List<String> x); // Kotlin: fun baz(List<String?>?): String?

    // 明示的な UNKNOWN マーク付きの null 許容性アノテーションがあるため、
    // `x` パラメータの型はプラットフォーム型のままになります:
    String qux(@Nonnull(when = When.UNKNOWN) String x); // Kotlin: fun qux(x: String!): String?
}
```

> この例の型は、strictモードが有効な場合にのみ適用されます。それ以外の場合はプラットフォーム型のままになります。
> [`@UnderMigration` アノテーション](#undermigration-annotation) および [コンパイラの設定](#compiler-configuration) セクションを参照してください。
>
{style="note"}

パッケージレベルのデフォルトのnull許容性もサポートされています：

```java
// FILE: test/package-info.java
@NonNullApi // 'test' パッケージ内のすべての型をデフォルトで null 非許容として宣言
package test;
```

#### @UnderMigration アノテーション {id="undermigration-annotation"}

`@UnderMigration` アノテーション（別個のアーティファクト `kotlin-annotations-jvm` で提供）をライブラリメンテナが使用して、null許容型修飾子の移行ステータスを定義できます。

`@UnderMigration(status = ...)` のステータス値は、Kotlinにおいてアノテーションが付けられた型の不適切な使用（例: `@MyNullable` が付けられた型の値を非nullとして使用するなど）をコンパイラがどのように扱うかを指定します：

* `MigrationStatus.STRICT`: アノテーションを通常のnull許容性アノテーションと同様に機能させます。つまり、不適切な使用に対してエラーを報告し、Kotlinから見たアノテーション付き宣言の型に影響を与えます。
* `MigrationStatus.WARN`: 不適切な使用はエラーではなくコンパイル警告として報告されますが、アノテーション付き宣言の型はプラットフォーム型のままになります。
* `MigrationStatus.IGNORE`: コンパイラにnull許容性アノテーションを完全に無視させます。

ライブラリメンテナは、型修飾子のニックネームとデフォルトの型修飾子の両方に `@UnderMigration` ステータスを追加できます：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// クラス内の型は null 非許容ですが、`@NonNullApi` に `@UnderMigration(status = MigrationStatus.WARN)` が
// アノテーションされているため、警告のみが報告されます
@NonNullApi
public class Test {}
```

> null許容性アノテーションの移行ステータスは、その型修飾子のニックネームには継承されませんが、デフォルト型修飾子での使用には適用されます。
>
{style="note"}

デフォルトの型修飾子が型修飾子のニックネームを使用し、両方が `@UnderMigration` である場合、デフォルトの型修飾子からのステータスが使用されます。

#### コンパイラの設定 {id="compiler-configuration"}

JSR-305のチェックは、次の値（およびそれらの組み合わせ）を指定した `-Xjsr305` コンパイラオプションを追加して設定できます：

* `-Xjsr305={strict|warn|ignore}`: 非 `@UnderMigration` アノテーションの動作を設定します。
  カスタムnull修飾子、特に `@TypeQualifierDefault` は、多くのよく知られたライブラリにすでに普及しており、ユーザーはJSR-305サポートを含むKotlinバージョンにアップデートする際にスムーズに移行する必要がある場合があります。
  このオプションは、非 `@UnderMigration` アノテーションにのみ影響します。
* `-Xjsr305=under-migration:{strict|warn|ignore}`: `@UnderMigration` アノテーションの動作をオーバーライドします。
  ライブラリの移行ステータスについて、ユーザーごとに異なる見解を持つ場合があります。公式の移行ステータスが `WARN` である間にエラーを出したい場合や、逆に移行が完了するまで一部のエラー報告を延期したい場合があります。
* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`: 単一のアノテーションの動作をオーバーライドします。ここで `<fq.name>` はアノテーションの完全修飾クラス名です。異なるアノテーションに対して複数回指定できます。
  これは、特定のライブラリの移行状態を管理するのに役立ちます。

`strict`、`warn`、`ignore` の値は `MigrationStatus` の値と同じ意味を持ち、`strict` モードのみがKotlinから見えるアノテーション付き宣言の型に影響します。

> 組み込みのJSR-305アノテーションである [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html)、および [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) は常に有効であり、`-Xjsr305` オプションによるコンパイラ設定に関係なく、Kotlinのアノテーション付き宣言の型に影響を与えます。
>
{style="note"}

例えば、コンパイラ引数に `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` を追加すると、コンパイラは `@org.library.MyNullable` でアノテーションされた型の不適切な使用に対して警告を生成し、他のすべてのJSR-305アノテーションを無視します。

デフォルトの動作は `-Xjsr305=warn` と同等です。
`strict` の値は実験的と見なされるべきです（将来的にさらにチェックが追加される可能性があります）。

## マップされた型 {id="mapped-types"}

Kotlinは、一部のJava型を特別に扱います。そのような型はJavaから「そのまま」ロードされるのではなく、対応するKotlinの型に_マップ_されます。
マッピングはコンパイル時にのみ意味を持ち、実行時の表現は変更されません。
Javaのプリミティブ型は、対応するKotlinの型にマップされます（[プラットフォーム型](#null-safety-and-platform-types)に留意してください）：

| **Java の型** | **Kotlin の型**  |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

一部のプリミティブ以外の組み込みクラスもマップされます：

| **Java の型**                     | **Kotlin の型**        |
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

Javaのボクシングされたプリミティブ型は、null許容のKotlin型にマップされます：

| **Java の型**         | **Kotlin の型**   |
|-----------------------|-------------------|
| `java.lang.Byte`      | `kotlin.Byte?`    |
| `java.lang.Short`     | `kotlin.Short?`   |
| `java.lang.Integer`   | `kotlin.Int?`     |
| `java.lang.Long`      | `kotlin.Long?`    |
| `java.lang.Character` | `kotlin.Char?`    |
| `java.lang.Float`     | `kotlin.Float?`   |
| `java.lang.Double`    | `kotlin.Double?`  |
| `java.lang.Boolean`   | `kotlin.Boolean?` |

型パラメータとして使用されるボクシングされたプリミティブ型は、プラットフォーム型にマップされることに注意してください。
例えば、`List<java.lang.Integer>` はKotlinでは `List<Int!>` になります。

Kotlinのコレクション型は読み取り専用または可変のいずれかであるため、Javaのコレクションは次のようにマップされます
（この表のすべてのKotlin型は `kotlin.collections` パッケージに属します）：

| **Java の型**     | **Kotlin 読み取り専用型** | **Kotlin 可変型**              | **ロードされたプラットフォーム型**   |
|-------------------|---------------------------|--------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`             | `MutableIterator<T>`           | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`             | `MutableIterable<T>`           | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`           | `MutableCollection<T>`         | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                  | `MutableSet<T>`                | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                 | `MutableList<T>`               | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`         | `MutableListIterator<T>`       | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`               | `MutableMap<K, V>`             | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`         | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Javaの配列は[以下](#java-arrays)で述べるようにマップされます：

| **Java の型** | **Kotlin の型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> これらのJava型の静的メンバには、Kotlin型の[コンパニオンオブジェクト](object-declarations.md#companion-objects)から直接アクセスすることはできません。これらを呼び出すには、`java.lang.Integer.toHexString(255)` のように、[Java型の完全修飾名を使用します](#accessing-static-members)。
>
{style="note"}

## KotlinにおけるJavaのジェネリクス {id="java-generics-in-kotlin"}

KotlinのジェネリクスはJavaのものとは少し異なります（[ジェネリクス](generics.md)を参照）。
Javaの型をKotlinにインポートする際、以下の変換が行われます：

* Javaのワイルドカードは型投影（type projections）に変換されます：
  * `Foo<? extends Bar>` は `Foo<out Bar!>!` になります
  * `Foo<? super Bar>` は `Foo<in Bar!>!` になります

* Javaのraw型はスター投影（star projections）に変換されます：
  * `List` は `List<*>!`、つまり `List<out Any?>!` になります

Javaと同様に、Kotlinのジェネリクスは実行時には保持されません。オブジェクトはコンストラクタに渡された実際の型引数に関する情報を保持しません。例えば、`ArrayList<Integer>()` は `ArrayList<Character>()` と区別できません。
このため、ジェネリクスを考慮した `is` チェックを実行することは不可能です。
Kotlinでは、スター投影されたジェネリック型に対する `is` チェックのみが許可されます：

```kotlin
if (a is List<Int>) // エラー: 実際に Int の List であるかどうかはチェックできません
// しかし以下は可能
if (a is List<*>)   // OK: リストの内容については何の保証もありません
```

## Javaの配列 {id="java-arrays"}

Javaとは異なり、Kotlinの配列は不変（invariant）です。これは、Kotlinでは `Array<String>` を `Array<Any>` に代入できないことを意味し、実行時の潜在的な障害を防ぎます。サブクラスの配列をスーパークラスの配列としてKotlinメソッドに渡すことも禁止されていますが、Javaメソッドに対しては `Array<(out) String>!` という形式の[プラットフォーム型](#null-safety-and-platform-types)を介して許可されています。

ボクシング/アンボクシング操作のコストを回避するために、Javaプラットフォームではプリミティブデータ型に配列が使用されます。
Kotlinはそれらの実装の詳細を隠蔽するため、Javaコードと連携するための回避策が必要です。
このケースを処理するために、プリミティブ配列の型ごとに特化したクラス（`IntArray`、`DoubleArray`、`CharArray` など）が存在します。
これらは `Array` クラスとは関係がなく、最大のパフォーマンスを得るためにJavaのプリミティブ配列にコンパイルされます。

インデックスの int 配列を受け取るJavaメソッドがあるとします：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // あなたのコードをここに記述
    }
}
```

プリミティブ値の配列を渡すには、Kotlinで以下のように記述できます：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array) // int[] をメソッドに渡す
```

JVMバイトコードにコンパイルする際、コンパイラはオーバーヘッドが生じないように配列へのアクセスを最適化します：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 実際の get() や set() の呼び出しは生成されません
for (x in array) {      // イテレータは生成されません
    print(x)
}
```

インデックスを使って反復処理を行う場合でも、オーバーヘッドは一切発生しません：

```kotlin
for (i in array.indices) { // イテレータは生成されません
    array[i] += 2
}
```

最後に、`in` チェックにもオーバーヘッドはありません：

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size) と同じ
    print(array[i])
}
```

## Javaの可変長引数 {id="java-varargs"}

Javaクラスでは、可変長引数（varargs）を使用したメソッド宣言が使用されることがあります：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // あなたのコードをここに記述
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

Javaには演算子構文を使用することが理にかなっているメソッドを明示する手段がないため、Kotlinでは正しい名前とシグネチャを持つ任意のJavaメソッドを演算子オーバーロードやその他の規約（`invoke()` など）として使用することを許可しています。
中置呼び出し（infix call）構文を使用したJavaメソッドの呼び出しは許可されていません。

例えば、`get(int)` および `set(int, T)` メソッドを宣言しているJavaクラスを、Kotlinでインデックス付きアクセス演算子とともに使用できます：

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

## 検査例外 {id="checked-exceptions"}

Kotlinでは、すべての[例外は非検査（unchecked）](exceptions.md)です。つまり、コンパイラはいずれの例外のキャッチも強制しません。
したがって、検査例外（checked exception）を宣言しているJavaメソッドを呼び出す場合でも、Kotlinは何も強制しません：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java では、Appendable.append() からスローされる IOException をキャッチする必要があります
    }
}
```

## Object のメソッド {id="object-methods"}

Javaの型がKotlinにインポートされると、`java.lang.Object` 型のすべての参照は `Any` に変換されます。
`Any` はプラットフォーム固有ではないため、メンバとして `toString()`、`hashCode()`、`equals()` のみを宣言しています。そのため、`java.lang.Object` の他のメンバを利用できるようにするために、Kotlinは[拡張関数](extensions.md)を使用します。

### `wait()` と `notify()` {id="wait-and-notify"}

`wait()` および `notify()` メソッドは、`Any` 型の参照では使用できません。これらの使用は一般的に非推奨とされており、`java.util.concurrent` の使用が推奨されます。

これらのメソッドをどうしても呼び出す必要がある場合は、Javaオブジェクトを通じてアクセスし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` の警告を抑制してください：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() と notify() にアクセスするために java.lang.Object インスタンスを使用
    // Kotlin では、標準の 'Any' 型はこれらのメソッドを公開していません
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

または、明示的に `java.lang.Object` にキャストし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制します：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(instance as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

オブジェクトのJavaクラスを取得するには、[クラス参照](reflection.md#obtain-a-runtime-class)の `java` 拡張プロパティを使用します：

```kotlin
val instanceClass = instance::class.java
```

上記のコードでは、[バウンドクラス参照](lambdas.md#bound-and-unbound-references)を使用しています。`javaClass` 拡張プロパティを使用することもできます：

```kotlin
val instanceClass = instance.javaClass
```

### `clone()` {id="clone"}

`clone()` をオーバーライドするには、クラスが `kotlin.Cloneable` を継承する必要があります：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

『[Effective Java 第3版](https://www.oracle.com/technetwork/java/effectivejava-136174.html)』項目13:「*clone は注意してオーバーライドする*」を忘れないでください。

### `finalize()` {id="finalize"}

`finalize()` をオーバーライドするには、`override` キーワードを使用せずに宣言します：

```kotlin
class C {
    protected fun finalize() {
        // 終了処理のロジック
    }
}
```

Javaのルールに従い、`finalize()` を `private` にすることはできません。

> `finalize()` メソッドは現代のJavaバージョンでは非推奨です。代わりに [`java.lang.ref.Cleaner`](https://docs.oracle.com/javase/9/docs/api/java/lang/ref/Cleaner.html) や [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) などの代替手段を検討してください。
>
{style="note"}

## Javaクラスからの継承 {id="inheritance-from-java-classes"}

Kotlinのクラスのスーパークラス（スーパータイプ）として指定できるJavaクラスは最大1つです（Javaインターフェースはいくつでも指定可能です）。

## 静的メンバへのアクセス {id="accessing-static-members"}

Javaクラスの静的メンバは、それらのクラスの「コンパニオンオブジェクト」を形成します。このような「コンパニオンオブジェクト」を値として受け渡すことはできませんが、メンバに明示的にアクセスすることは可能です。例えば：

```kotlin
if (Character.isLetter(a)) { ... }
```

インポートされたJavaクラスの静的メソッドを呼び出すには、Javaと同様にクラス名を直接使用します。次のJavaクラスを考えてみましょう：

```java
package org.example;

public class MathUtils {
    public static int triple(int value) {
        return value * 3;
    }
}
```

クラスをインポートし、クラス名を介してその静的メソッドを呼び出します：

```kotlin
import org.example.MathUtils

fun main() {
    println(MathUtils.triple(5)) // 静的メソッド triple() を呼び出す
}
```

Kotlin型に[マップされている](#mapped-types)Java型の静的メンバにアクセスするには、`java.lang.Integer.bitCount(5)` のようにJava型の完全修飾名を使用します。

## Javaリフレクション {id="java-reflection"}

JavaのリフレクションはKotlinクラスに対して機能し、その逆も同様です。前述のとおり、`instance::class.java`、`ClassName::class.java`、または `instance.javaClass` を使用して、`java.lang.Class` を介してJavaリフレクションに入ることができます。
この目的で `ClassName.javaClass` を使用しないでください。これは `ClassName` の[コンパニオンオブジェクト](object-declarations.md#companion-objects)のクラスを参照しており、`ClassName::class.java` ではなく `ClassName.Companion::class.java` と同じになってしまうためです。

プリミティブ型ごとに2つの異なるJavaクラスが存在し、Kotlinはその両方を取得する方法を提供しています。例えば、`Int::class.java` はプリミティブ型自体を表すクラスインスタンス（Javaの `Integer.TYPE` に対応）を返します。対応するラッパー型のクラスを取得するには、Javaの `Integer.class` に相当する `Int::class.javaObjectType` を使用します。

その他のサポートされるケースとしては、Kotlinプロパティに対するJavaゲッター/セッターメソッドまたはバッキングフィールドの取得、Javaフィールドに対する `KProperty` の取得、`KFunction` に対するJavaメソッドまたはコンストラクタの取得、およびその逆などがあります。

## SAM変換 {id="sam-conversions"}

Kotlinは、Javaおよび[Kotlinのインターフェース](fun-interfaces.md)の両方でSAM変換をサポートしています。
Javaに対するこのサポートは、インターフェースメソッドのパラメータ型がKotlin関数のパラメータ型と一致している限り、単一の非デフォルトメソッドを持つJavaインターフェースの実装へとKotlinの関数リテラルを自動的に変換できることを意味します。

これを使用して、SAMインターフェースのインスタンスを作成できます：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

また、メソッド呼び出し内でも使用できます：

```kotlin
val executor = Executors.newSingleThreadExecutor()
// Java シグネチャ: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Javaクラスが関数型インターフェースを受け取る複数のメソッドを持っている場合、ラムダを特定のSAM型に変換するアダプター関数を使用することで、呼び出す必要のあるメソッドを選択できます。これらのアダプター関数は、必要に応じてコンパイラによっても生成されます：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM変換はインターフェースに対してのみ機能します。抽象メソッドが1つしかない場合であっても、抽象クラスには適用されません。
>
{style="note"}

## KotlinでJNIを使用する {id="using-jni-with-kotlin"}

ネイティブ（CまたはC++）コードで実装されている関数を宣言するには、`external` 修飾子でマークする必要があります：

```kotlin
external fun calculateSum(x: Int): Double
```

手順の残りの部分は、Javaとまったく同じように機能します。

プロパティのゲッターとセッターを `external` としてマークすることもできます：

```kotlin
var myProperty: String
    external get
    external set
```

裏側では、どちらも `external` としてマークされた `getMyProperty` と `setMyProperty` という2つの関数が作成されます。

## KotlinでLombok生成の宣言を使用する {id="using-lombok-generated-declarations-in-kotlin"}

KotlinコードでJavaのLombokによって生成された宣言を使用できます。
同じ混合Java/Kotlinモジュール内でこれらの宣言を生成して使用する必要がある場合は、その方法を[Lombokコンパイラプラグインのページ](lombok.md)で確認できます。
そのような宣言を別のモジュールから呼び出す場合は、そのモジュールをコンパイルするためにこのプラグインを使用する必要はありません。