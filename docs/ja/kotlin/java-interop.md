[//]: # (title: Kotlin から Java を呼び出す)

Kotlin は Java との相互運用性を念頭に置いて設計されています。既存の Java コードを Kotlin から自然な方法で呼び出すことができ、Kotlin のコードも Java からきわめてスムーズに使用できます。
このセクションでは、Kotlin から Java コードを呼び出す際の詳細について説明します。

ほとんどすべての Java コードを問題なく使用できます。

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' ループは Java のコレクションに対しても機能します:
    for (item in source) {
        list.add(item)
    }
    // 演算子の規約も機能します:
    for (i in 0..source.size - 1) {
        list[i] = source[i] // get と set が呼び出されます
    }
}
```

## ゲッターとセッター {id="getters-and-setters"}

ゲッターおよびセッターに関する Java の規約に従ったメソッド（`get` で始まる引数のないメソッド、および `set` で始まる単一引数のメソッド）は、Kotlin ではプロパティとして表現されます。このようなプロパティは*合成プロパティ*（synthetic properties）とも呼ばれます。
`Boolean` のアクセサメソッド（ゲッターの名前が `is` で始まり、セッターの名前が `set` で始まるもの）は、ゲッターメソッドと同じ名前を持つプロパティとして表現されます。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // getFirstDayOfWeek() を呼び出し
        calendar.firstDayOfWeek = Calendar.MONDAY // setFirstDayOfWeek() を呼び出し
    }
    if (!calendar.isLenient) { // isLenient() を呼び出し
        calendar.isLenient = true // setLenient() を呼び出し
    }
}
```

上記の `calendar.firstDayOfWeek` は合成プロパティの一例です。

なお、Java クラスにセッターしか存在しない場合、Kotlin は set-only プロパティをサポートしていないため、Kotlin ではプロパティとして認識されないことに注意してください。

## Java 合成プロパティの参照 {id="java-synthetic-property-references"}

> この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。将来的に廃止または変更される可能性があります。
> 評価目的でのみ使用することをお勧めします。
>
{style="warning"}

Kotlin 1.8.20 以降では、Java の合成プロパティへの参照を作成できるようになりました。次の Java コードを考えてみます。

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

Kotlin では従来から、合成プロパティである `age` に対して `person.age` と記述することができました。これに加えて、`Person::age` や `person::age` への参照を作成できるようになりました。`name` についても同様です。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // Java 合成プロパティへの参照を呼び出し:
        .sortedBy(Person::age)
         // Kotlin のプロパティ構文を介して Java のゲッターを呼び出し:
        .forEach { person -> println(person.name) }
```

### Java 合成プロパティの参照を有効にする方法 {initial-collapse-state="collapsed" collapsible="true" id="how-to-enable-java-synthetic-property-references"}

この機能を有効にするには、`-language-version 2.1` コンパイラオプションを設定します。Gradle プロジェクトでは、`build.gradle(.kts)` に以下を追加することで設定できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks
    .withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask<*>>()
    .configureEach {
        compilerOptions
            .languageVersion
            .set(
                org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
            )
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion
            = org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
}
```

</tab>
</tabs>

> Kotlin 1.9.0 より前では、この機能を有効にするために `-language-version 1.9` コンパイラオプションを設定する必要がありました。
> 
{style="note"}

## void を返すメソッド {id="methods-returning-void"}

Java メソッドが `void` を返す場合、Kotlin から呼び出されると `Unit` を返します。
万が一呼び出し側でその戻り値を使用した場合でも、値自体が事前に分かっているため（`Unit` であるため）、コンパイラによって呼び出し箇所で代入が行われます。

## Kotlin のキーワードである Java 識別子のエスケープ {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

Kotlin のキーワードの中には、Java では有効な識別子であるものがあります（`in`、`object`、`is` など）。
Java ライブラリがメソッド名として Kotlin のキーワードを使用している場合でも、バッククォート（`）文字でエスケープすることでそのメソッドを呼び出すことができます。

```kotlin
foo.`is`(bar)
```

## null 安全性とプラットフォーム型 {id="null-safety-and-platform-types"}

Java における任意の参照は `null` になる可能性があるため、Java から渡されるオブジェクトに対して Kotlin の厳格な null 安全性の要件をそのまま適用するのは現実的ではありません。
Java 宣言の型は、Kotlin ではコード上で明示的に指定できない非表示の型（non-denotable）として扱われ、[*プラットフォーム型*（platform types）](https://kotlinlang.org/spec/type-system.html#platform-types)と呼ばれます。
非表示の型はコード内に明示的に記述することはできません。そのため、プラットフォーム型の値が Kotlin の変数に代入される場合、次のいずれかを行うことができます。

* 型推論に依存する。この場合、変数は推論されたプラットフォーム型を持ちます。
* 期待する型を明示的に選択する。Kotlin では null 許容型（nullable）と非 null 型（non-nullable）の両方が許可されます。

このような型に対する null チェックは緩和されており、それらに対する安全性の保証は Java と同等になります（詳細は[後述](#mapped-types)を参照）。
次の例を考えてみます。

```kotlin
val list = ArrayList<String>() // 非 null（コンストラクタの結果）
list.add("Item")
val size = list.size // 非 null（プリミティブの int）
val item = list[0] // プラットフォーム型として推論（通常の Java オブジェクト）
```

プラットフォーム型の変数に対してメソッドを呼び出す場合、Kotlin はコンパイル時に null 可能性エラーを報告しませんが、null ポインタ例外が発生するか、あるいは null の伝播を防ぐために Kotlin が生成したアサーションによって、実行時に呼び出しが失敗する可能性があります。

```kotlin
item.substring(1) // 許可されますが、item == null の場合は例外をスローします
```

プラットフォーム型の値は、Kotlin の null 許容型と非 null 型のどちらの変数にも代入できます。ただし、非 null 型の変数に代入し、実行時にその値が実際には `null` であった場合、Kotlin は `NullPointerException` をスローします。これを防ぐには、Kotlin コードに明示的な null 可能性を追加してください。

```kotlin
val nullable: String? = item // 許可され、常に動作します
val notNull: String = item // 許可されますが、実行時に失敗する可能性があります
```

非 null 型を選択した場合、コンパイラは代入時にアサーションを出力します。これにより、Kotlin の非 null 変数が null を保持するのを防ぎます。アサーションは、非 null 値を期待する Kotlin 関数にプラットフォーム型の値を渡す際や、その他の場合にも出力されます。
全体として、コンパイラはプログラムの広範囲に null が伝播するのを防ぐために最善を尽くしますが、ジェネリクスの関係でこれを完全に排除できない場合もあります。

### プラットフォーム型の表記 {id="notation-for-platform-types"}

前のセクションで述べたように、プラットフォーム型はプログラム内で明示的に言及できないため、言語上にはそのための構文が存在しません。それでもなお、コンパイラや IDE がそれらを表示する必要がある場合があるため（たとえば、エラーメッセージやパラメータ情報など）、それらを表すニーモニック表記が用意されています。

* `T!` は「`T` または `T?`」を意味します
* `(Mutable)Collection<T>!` は「`T` の Java コレクションであり、可変である場合もあればそうでない場合もあり、null 許容である場合もあればそうでない場合もある」ことを意味します
* `Array<(out) T>!` は「`T`（または `T` のサブタイプ）の Java 配列であり、null 許容である場合もそうでない場合もある」ことを意味します

エラーメッセージや IDE のツールチップでこの表記を見かけた場合は、Kotlin 変数に明示的な型注釈を追加して null 安全性チェックを復活させるか、null 可能性アノテーションを使用してソースコード側でプラットフォーム型を解消してください。

### Null 可能性アノテーション {id="nullability-annotations"}

null 可能性アノテーションが付与された Java の型は、プラットフォーム型としてではなく、実際の null 許容または非 null の Kotlin 型として表現されます。コンパイラは、以下を含むいくつかの種類の null 可能性アノテーションをサポートしています。

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
（`org.jetbrains.annotations` パッケージの `@Nullable` および `@NotNull`）
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` および `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

特定の null 可能性アノテーションについて null 可能性の不一致を報告するよう、次のコンパイラオプションでコンパイラに指示できます。

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

完全修飾された null 可能性アノテーションのパッケージ名と、以下のレポートレベルのいずれかを指定します。

* `ignore`: null 可能性の不一致を無視
* `warn`: 警告を報告
* `strict`: エラーを報告

> [JSpecify](#jspecify-support) は、デフォルトで `strict` レポートレベルを使用する唯一のサポートされた種類です。
> 追加の設定なしで null 可能性アノテーションのエラーを報告させるために使用できます。
>
{style="note"}

サポートされている null 可能性アノテーションの完全なリストは、[Kotlin コンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)を参照してください。

### 可変性アノテーション {id="mutability-annotations"}

Java の宣言に可変性アノテーションを付けることで、返されるコレクションが Kotlin で読み取り専用（read-only）か可変（mutable）かを指定できます。
異なる可変性を持つコレクション型にその値を代入すると、コンパイラは型の不一致を報告します。
診断の重大度は、特定の可変性アノテーションによって異なります。

コンパイラは、以下を含むいくつかの可変性アノテーションをサポートしています。

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

サポートされている可変性アノテーションの完全なリストは、[Kotlin コンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)を参照してください。

### 型引数と型パラメータのアノテーション {id="annotating-type-arguments-and-type-parameters"}

ジェネリック型の型引数や型パラメータにアノテーションを付けて、それらに対しても null 可能性情報を提供できます。

> このセクションのすべての例では、`org.jetbrains.annotations` パッケージの JetBrains null 可能性アノテーションを使用しています。
>
{style="note"}

#### 型引数 {id="type-arguments"}

Java 宣言における以下の注釈を考えてみます。

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

これらは、Kotlin では次のシグネチャになります。

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

型引数に `@NotNull` アノテーションがない場合は、代わりにプラットフォーム型が得られます。

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin は、基底クラスやインターフェースの型引数に付けられた null 可能性アノテーションも考慮します。たとえば、以下のシグネチャを持つ2つの Java クラスがあるとします。

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

Kotlin コードにおいて、`Base<String>` が期待される場所に `Derived` のインスタンスを渡すと、警告が発生します。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告: null 可能性の不一致
}
```

`Derived` の上限は `Base<String?>` に設定されており、これは `Base<String>` とは異なるためです。

詳細については、[Kotlin における Java のジェネリクス](#java-generics-in-kotlin)を参照してください。

#### 型パラメータ {id="type-parameters"}

デフォルトでは、Kotlin と Java の両方で通常の型パラメータの null 可能性は未定義です。Java では、null 可能性アノテーションを使用してこれを指定できます。`Base` クラスの型パラメータにアノテーションを付けてみましょう。

```java
public class Base<@NotNull T> {}
```

`Base` から継承する場合、Kotlin は非 null の型引数または型パラメータを期待します。
したがって、次の Kotlin コードは警告を生成します。

```kotlin
class Derived<K> : Base<K> {} // 警告: K の null 可能性が未定義です
```

上限として `K : Any` を指定することで、これを修正できます。

Kotlin は、Java 型パラメータの境界に対する null 可能性アノテーションもサポートしています。`Base` に境界を追加してみましょう。

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin はこれを次のように変換します。

```kotlin
class BaseWithBound<T : Number> {}
```

そのため、型引数または型パラメータとして null 許容型を渡すと警告が生成されます。

型引数や型パラメータへのアノテーション付けは、Java 8 以降をターゲットとする場合に機能します。この機能を使用するには、null 可能性アノテーションが `TYPE_USE` ターゲットをサポートしている必要があります（`org.jetbrains.annotations` はバージョン 15 以降でこれをサポートしています）。

> null 可能性アノテーションが `TYPE_USE` ターゲットに加えて型に適用可能な他のターゲットもサポートしている場合は、`TYPE_USE` が優先されます。たとえば、`@Nullable` が `TYPE_USE` と `METHOD` の両方のターゲットを持つ場合、Java のメソッドシグネチャ `@Nullable String[] f()` は Kotlin では `fun f(): Array<String?>!` になります。
>
{style="note"}

### JSpecify のサポート {id="jspecify-support"}

Kotlin は、Java の null 可能性に対する統合されたアノテーションセットを提供する [JSpecify](https://jspecify.dev/) の null 可能性アノテーションをサポートしています。JSpecify を使用すると、Java の宣言に対して詳細な null 可能性情報を提供でき、Java コードを扱う際に Kotlin が null 安全性を維持するのに役立ちます。

Kotlin は、`org.jspecify.annotations` パッケージの以下の注釈をサポートしています。

* `@Nullable`: 型を null 許容としてマークします。
* `@NonNull`: 型を非 null としてマークします。
* `@NullMarked`: 特にアノテーションが付けられていない限り、あるスコープ内（クラスやパッケージなど）のすべての型をデフォルトで非 null としてマークします。

  このアノテーションは、ローカル変数や[型変数（ジェネリクス）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)には適用されません。
  型変数は、特定の null 許容型または非 null 型が提供されるまで「null 非依存（null-agnostic）」のままとなります。

* `@NullUnmarked`: `@NullMarked` の効果を取り消し、スコープ内のすべての型を[プラットフォーム型](#null-safety-and-platform-types)にします。

JSpecify アノテーションが付いた次の Java クラスを考えてみます。
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
Kotlin では、これらは[プラットフォーム型](#null-safety-and-platform-types)ではなく、通常の null 許容型および非 null 型として扱われます。
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // エラー: 安全呼び出し (?.) または非 null アサーション (!!) 呼び出しのみが許可されます
}
```

デフォルトでは、Kotlin コンパイラは JSpecify アノテーションに対する null 可能性の不一致をエラーとして報告します。
次のコンパイラオプションを使用して、JSpecify の null 可能性診断の重大度をカスタマイズできます。

```bash
-Xjspecify-annotations=<report-level>
```

利用可能なレポートレベルは以下のとおりです。

| レベル   | 説明                                               |
|----------|----------------------------------------------------|
| `strict` | null 可能性の不一致をエラーとして報告します（デフォルト）。 |
| `warn`   | 警告を報告します。                                 |
| `ignore` | null 可能性の不一致を無視します。                   |

> JSpecify アノテーションの詳細については、[JSpecify ユーザーガイド](https://jspecify.dev/docs/user-guide)を参照してください。
> 
{type="tip"}

### JSR-305 のサポート {id="jsr-305-support"}

Java の型の null 可能性を表すために、[JSR-305](https://jcp.org/en/jsr/detail?id=305) で定義されている [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) アノテーションがサポートされています。

`@Nonnull(when = ...)` の値が `When.ALWAYS` の場合、アノテーションが付けられた型は非 null として扱われます。`When.MAYBE` と `When.NEVER` は null 許容型を表し、`When.UNKNOWN` はその型を[プラットフォーム型](#null-safety-and-platform-types)として強制します。

ライブラリは JSR-305 アノテーションに対してコンパイルできますが、そのライブラリの利用者がアノテーションアーティファクト（例: `jsr305.jar`）をコンパイル依存関係に含める必要はありません。Kotlin コンパイラは、クラスパス上にアノテーションが存在しなくても、ライブラリから JSR-305 アノテーションを読み取ることができます。

[カスタム null 可能性修飾子（KEEP-79）](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)もサポートされています（下記参照）。

#### 型修飾子のニックネーム {id="type-qualifier-nicknames"}

あるアノテーション型に [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) と JSR-305 の `@Nonnull`（または `@CheckForNull` などの別のニックネーム）の両方がアノテーションされている場合、そのアノテーション型自体が正確な null 可能性を取得するために使用され、元の null 可能性アノテーションと同じ意味を持ちます。

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
    // Kotlin（strict モード）: `fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // Kotlin（strict モード）: `fun bar(x: List<String>!): String!`
}
```

#### デフォルトの型修飾子 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) を使用すると、適用された際にそのアノテーションが付けられた要素のスコープ内におけるデフォルトの null 可能性を定義するアノテーションを導入できます。

このようなアノテーション型自体には、`@Nonnull`（またはそのニックネーム）と、1つ以上の `ElementType` 値を持つ `@TypeQualifierDefault(...)` の両方がアノテーションされている必要があります。

* `ElementType.METHOD`: メソッドの戻り値の型
* `ElementType.PARAMETER`: 値パラメータ
* `ElementType.FIELD`: フィールド
* `ElementType.TYPE_USE`: 型引数、型パラメータの上限、ワイルドカード型を含む任意の型

型自体に null 可能性アノテーションが付けられていない場合にデフォルトの null 可能性が使用され、そのデフォルトは型の用途と一致する `ElementType` を持つ型修飾子のデフォルトアノテーションで注釈された、最も内側の囲む要素によって決定されます。

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
    String foo(String x); // fun foo(x: String?): String?

    @NotNullApi // インターフェースからのデフォルトをオーバーライド
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // `@NullableApi` が `TYPE_USE` 要素タイプを持っているため、
    // List<String> の型引数は null 許容として認識されます:
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // 明示的な UNKNOWN 指定の null 可能性アノテーションがあるため、
    // `x` パラメータの型はプラットフォーム型のままです:
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> この例の型は、strict モードが有効な場合にのみ適用されます。それ以外の場合はプラットフォーム型のままになります。
> [`@UnderMigration` アノテーション](#undermigration-annotation)および[コンパイラ設定](#compiler-configuration)のセクションを参照してください。
>
{style="note"}

パッケージレベルのデフォルトの null 可能性もサポートされています。

```java
// FILE: test/package-info.java
@NonNullApi // 'test' パッケージ内のすべての型をデフォルトで非 null として宣言
package test;
```

#### @UnderMigration アノテーション {id="undermigration-annotation"}

`@UnderMigration` アノテーション（別個のアーティファクト `kotlin-annotations-jvm` で提供）は、ライブラリのメンテナが null 可能性の型修飾子の移行ステータスを定義するために使用できます。

`@UnderMigration(status = ...)` のステータス値は、Kotlin においてアノテーションが付けられた型の不適切な使用（たとえば、`@MyNullable` でアノテーションされた型の値を非 null として使用するなど）をコンパイラがどのように扱うかを指定します。

* `MigrationStatus.STRICT`: アノテーションを通常の null 可能性アノテーションとして機能させます。つまり、不適切な使用に対してエラーを報告し、アノテーションされた宣言の型が Kotlin から見える型に反映されます。
* `MigrationStatus.WARN`: 不適切な使用はエラーではなくコンパイル警告として報告されますが、アノテーションされた宣言の型はプラットフォーム型のままになります。
* `MigrationStatus.IGNORE`: コンパイラは null 可能性アノテーションを完全に無視します。

ライブラリのメンテナは、型修飾子のニックネームとデフォルトの型修飾子の両方に `@UnderMigration` ステータスを追加できます。

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// クラス内の型は非 null ですが、`@NonNullApi` に `@UnderMigration(status = MigrationStatus.WARN)` が
// アノテーションされているため、警告のみが報告されます
@NonNullApi
public class Test {}
```

> null 可能性アノテーションの移行ステータスは、その型修飾子ニックネームには継承されませんが、デフォルト型修飾子におけるその使用には適用されます。
>
{style="note"}

デフォルトの型修飾子が型修飾子ニックネームを使用しており、その両方に `@UnderMigration` が付けられている場合、デフォルトの型修飾子からのステータスが使用されます。

#### コンパイラ設定 {id="compiler-configuration"}

JSR-305 チェックは、`-Xjsr305` コンパイラフラグに以下のオプション（およびその組み合わせ）を追加することで設定できます。

* `-Xjsr305={strict|warn|ignore}`: `@UnderMigration` 以外のアノテーションの動作を設定します。
カスタムの null 可能性修飾子、特に `@TypeQualifierDefault` はすでに多くの有名なライブラリに広まっており、ユーザーは JSR-305 サポートを含む Kotlin バージョンにアップデートする際にスムーズに移行する必要がある場合があります。Kotlin 1.1.60 以降、このフラグは `@UnderMigration` 以外のアノテーションにのみ影響します。

* `-Xjsr305=under-migration:{strict|warn|ignore}`: `@UnderMigration` アノテーションの動作をオーバーライドします。
ライブラリの移行ステータスに対するユーザーの考え方は異なる場合があります。公式の移行ステータスが `WARN` であってもエラーにしたい場合や、逆に自身の移行が完了するまでエラーの報告を延期したい場合があります。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`: 単一のアノテーションに対する動作をオーバーライドします。ここで `<fq.name>` はアノテーションの完全修飾クラス名です。異なるアノテーションに対して複数回指定できます。これは、特定のライブラリの移行状態を管理するのに役立ちます。

`strict`、`warn`、`ignore` の各値は `MigrationStatus` のものと同じ意味を持ち、`strict` モードのみが、アノテーションされた宣言の型が Kotlin から見える型に影響を与えます。

> 注意: 組み込みの JSR-305 アノテーションである [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html)、[`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) は常に有効であり、`-Xjsr305` フラグによるコンパイラ設定に関係なく、Kotlin におけるアノテーションされた宣言の型に影響を与えます。
>
{style="note"}

たとえば、コンパイラ引数に `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` を追加すると、コンパイラは `@org.library.MyNullable` でアノテーションされた型の不適切な使用に対して警告を生成し、他のすべての JSR-305 アノテーションを無視するようになります。

デフォルトの動作は `-Xjsr305=warn` と同等です。`strict` の値は実験的と見なされるべきです（将来的にさらに多くのチェックが追加される可能性があります）。

## マップされた型 {id="mapped-types"}

Kotlin は一部の Java 型を特別に扱います。そのような型は Java から「そのまま」ロードされるのではなく、対応する Kotlin の型に*マップ*されます。
マッピングはコンパイル時にのみ関係し、実行時の表現は変更されません。
Java のプリミティブ型は、対応する Kotlin の型にマップされます（[プラットフォーム型](#null-safety-and-platform-types)を念頭に置いてください）。

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

一部のプリミティブ以外の組み込みクラスもマップされます。

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

Java のボクシングされたプリミティブ型は、null 許容の Kotlin 型にマップされます。

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
たとえば、`List<java.lang.Integer>` は Kotlin では `List<Int!>` になります。

Kotlin ではコレクション型は読み取り専用または可変のいずれかになるため、Java のコレクションは次のようにマップされます
（この表のすべての Kotlin 型は `kotlin.collections` パッケージに属します）。

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

Java の配列は[後述](#java-arrays)のようにマップされます。

| **Java の型** | **Kotlin の型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

>これらの Java 型の静的メンバには、Kotlin 型の[コンパニオンオブジェクト](object-declarations.md#companion-objects)から直接アクセスすることはできません。これらを呼び出すには、Java 型の完全修飾名を使用してください（例: `java.lang.Integer.toHexString(foo)`）。
>
{style="note"}

## Kotlin における Java のジェネリクス {id="java-generics-in-kotlin"}

Kotlin のジェネリクスは Java のものとは少し異なります（[ジェネリクス](generics.md)を参照）。
Java の型を Kotlin にインポートする際、以下の変換が行われます。

* Java のワイルドカードは型プロジェクション（type projections）に変換されます:
  * `Foo<? extends Bar>` は `Foo<out Bar!>!` になります
  * `Foo<? super Bar>` は `Foo<in Bar!>!` になります

* Java の原型（raw types）はスタープロジェクション（star projections）に変換されます:
  * `List` は `List<*>!`、すなわち `List<out Any?>!` になります

Java と同様に、Kotlin のジェネリクスは実行時には保持されません。オブジェクトは、コンストラクタに渡された実際の型引数に関する情報を保持しません。たとえば、`ArrayList<Integer>()` と `ArrayList<Character>()` を実行時に区別することはできません。
このため、ジェネリクスを考慮した `is` チェックを実行することは不可能です。
Kotlin では、スタープロジェクションされたジェネリック型に対してのみ `is` チェックが許可されます。

```kotlin
if (a is List<Int>) // エラー: 実際に Int の List であるかどうかをチェックすることはできません
// ただし以下は可能
if (a is List<*>) // OK: リストの内容についての保証はありません
```

## Java の配列 {id="java-arrays"}

Kotlin の配列は Java とは異なり不変（invariant）です。つまり、Kotlin では `Array<String>` を `Array<Any>` に代入することはできず、これにより実行時エラーの可能性を防いでいます。Kotlin のメソッドにサブクラスの配列をスーパークラスの配列として渡すことも禁止されていますが、Java のメソッドに対しては `Array<(out) String>!` という形式の[プラットフォーム型](#null-safety-and-platform-types)を通じてこれが許可されています。

Java プラットフォームでは、ボクシング/アンボクシング処理のコストを回避するためにプリミティブデータ型の配列が使用されます。
Kotlin はこれらの実装の詳細を隠蔽するため、Java コードとのインターフェースには回避策が必要です。
このケースを処理するために、プリミティブ配列の各型に対応する専用のクラス（`IntArray`、`DoubleArray`、`CharArray` など）が用意されています。
これらは `Array` クラスとは関連がなく、最大限のパフォーマンスを得るために Java のプリミティブ配列にコンパイルされます。

インデックスの int 配列を受け取る Java メソッドがあるとします。

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // ここにコード...
    }
}
```

プリミティブ値の配列を渡すには、Kotlin で次のように記述します。

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // int[] をメソッドに渡します
```

JVM バイトコードにコンパイルする際、コンパイラは配列へのアクセスを最適化し、オーバーヘッドが発生しないようにします。

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 実際の get() や set() の呼び出しは生成されません
for (x in array) { // イテレータは作成されません
    print(x)
}
```

インデックスを使用してループ処理を行う場合でも、オーバーヘッドは一切発生しません。

```kotlin
for (i in array.indices) { // イテレータは作成されません
    array[i] += 2
}
```

最後に、`in` チェックにもオーバーヘッドはありません。

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size) と同じです
    print(array[i])
}
```

## Java の可変長引数 (varargs) {id="java-varargs"}

Java のクラスでは、インデックスに対して可変長引数（varargs）を使用したメソッド宣言が用いられることがあります。

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // ここにコード...
    }
}
```

その場合、`IntArray` を渡すにはスプレッド演算子 `*` を使用する必要があります。

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 演算子 {id="operators"}

Java には演算子構文を使用することが妥当なメソッドをマークする方法がないため、Kotlin では適切な名前とシグネチャを持つ任意の Java メソッドを、演算子オーバーロードやその他の規約（`invoke()` など）として使用することを許可しています。
中置記法（infix call）構文を使用した Java メソッドの呼び出しは許可されていません。

## 検査例外 {id="checked-exceptions"}

Kotlin では、すべての[例外は非検査例外（unchecked exceptions）](exceptions.md)であり、コンパイラが例外のキャッチを強制することはありません。
そのため、検査例外を宣言している Java メソッドを呼び出す場合でも、Kotlin は何らかの処理を強制することはありません。

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java であればここで IOException のキャッチが要求されます
    }
}
```

## Object のメソッド {id="object-methods"}

Java の型が Kotlin にインポートされると、`java.lang.Object` 型の参照はすべて `Any` に変換されます。
`Any` はプラットフォーム固有ではないため、そのメンバとしては `toString()`、`hashCode()`、`equals()` のみを宣言しています。したがって、`java.lang.Object` の他のメンバを利用できるようにするために、Kotlin は[拡張関数](extensions.md)を使用します。

### `wait()` と `notify()` {id="wait-and-notify"}

メソッド `wait()` と `notify()` は `Any` 型の参照では使用できません。これらの使用は一般的に非推奨とされており、代わりに `java.util.concurrent` を使用することが推奨されます。

これらのメソッドをどうしても呼び出す必要がある場合は、Java のオブジェクトを介してアクセスし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制してください。

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() と notify() にアクセスするために明示的に java.lang.Object を使用します
    // Kotlin では、標準の 'Any' 型はこれらのメソッドを公開していません。
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

あるいは、明示的に `java.lang.Object` にキャストし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制します。

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(foo as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

オブジェクトの Java クラスを取得するには、[クラス参照](reflection.md#obtain-a-runtime-class)の `java` 拡張プロパティを使用します。

```kotlin
val fooClass = foo::class.java
```

上記のコードでは、[バインドされたクラス参照](lambdas.md#bound-and-unbound-references)を使用しています。また、`javaClass` 拡張プロパティを使用することもできます。

```kotlin
val fooClass = foo.javaClass
```

### `clone()` {id="clone"}

`clone()` をオーバーライドするには、クラスが `kotlin.Cloneable` を継承する必要があります。

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

[Effective Java 第3版](https://www.oracle.com/technetwork/java/effectivejava-136174.html)の項目13: *clone は慎重にオーバーライドする* を忘れないでください。

### `finalize()` {id="finalize"}

`finalize()` をオーバーライドするには、`override` キーワードを使用せずに宣言するだけです。

```kotlin
class C {
    protected fun finalize() {
        // ファイナライズのロジック
    }
}
```

Java のルールに従い、`finalize()` を `private` にすることはできません。

## Java クラスからの継承 {id="inheritance-from-java-classes"}

Kotlin のクラスのスーパークラスとして指定できる Java クラスは最大で1つ（Java インターフェースは任意の数）です。

## 静的メンバへのアクセス {id="accessing-static-members"}

Java クラスの静的メンバは、それらのクラスの「コンパニオンオブジェクト」を形成します。このような「コンパニオンオブジェクト」を値として渡すことはできませんが、メンバに明示的にアクセスすることは可能です。たとえば以下のようになります。

```kotlin
if (Character.isLetter(a)) { ... }
```

Kotlin 型に[マップ](#mapped-types)されている Java 型の静的メンバにアクセスするには、その Java 型の完全修飾名を使用します: `java.lang.Integer.bitCount(foo)`。

## Java リフレクション {id="java-reflection"}

Java リフレクションは Kotlin クラスに対しても機能し、その逆も同様です。前述のとおり、`instance::class.java`、`ClassName::class.java`、または `instance.javaClass` を使用して、`java.lang.Class` 経由で Java リフレクションを開始できます。
この目的で `ClassName.javaClass` を使用しないでください。これは `ClassName` のコンパニオンオブジェクトのクラスを参照してしまい、`ClassName::class.java` ではなく `ClassName.Companion::class.java` と同じになってしまうためです。

プリミティブ型ごとに2つの異なる Java クラスが存在しますが、Kotlin はその両方を取得する方法を提供しています。たとえば、`Int::class.java` はプリミティブ型自体を表すクラスインスタンスを返し、これは Java の `Integer.TYPE` に対応します。対応するラッパー型のクラスを取得するには、Java の `Integer.class` に相当する `Int::class.javaObjectType` を使用します。

その他サポートされているケースとして、Kotlin プロパティに対する Java のゲッター/セッターメソッドまたはバッキングフィールドの取得、Java フィールドに対する `KProperty` の取得、`KFunction` に対する Java メソッドまたはコンストラクタの取得、およびその逆などがあります。

## SAM 変換 {id="sam-conversions"}

Kotlin は、Java と [Kotlin インターフェース](fun-interfaces.md)の両方で SAM 変換をサポートしています。
Java に対するこのサポートは、インターフェースのメソッドのパラメータ型が Kotlin 関数のパラメータ型と一致している限り、デフォルトメソッド以外のメソッドを1つだけ持つ Java インターフェースの実装へと Kotlin の関数リテラルを自動的に変換できることを意味します。

これを使用して、SAM インターフェースのインスタンスを作成できます。

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

...また、メソッド呼び出しでも使用できます。

```kotlin
val executor = ThreadPoolExecutor()
// Java のシグネチャ: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Java クラスに複数の関数型インターフェースを受け取るメソッドがある場合、ラムダを特定の SAM 型に変換するアダプタ関数を使用して、呼び出すべきメソッドを選択できます。これらのアダプタ関数も、必要に応じてコンパイラによって生成されます。

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 変換はインターフェースに対してのみ機能し、抽象メソッドが1つだけの場合であっても抽象クラスに対しては機能しません。
>
{style="note"}

## Kotlin での JNI の使用 {id="using-jni-with-kotlin"}

ネイティブ（C または C++）コードで実装された関数を宣言するには、`external` 修飾子でマークする必要があります。

```kotlin
external fun foo(x: Int): Double
```

手続きの残りの部分は、Java の場合とまったく同様に機能します。

プロパティのゲッターとセッターを `external` としてマークすることもできます。

```kotlin
var myProperty: String
    external get
    external set
```

内部的には、これにより `getMyProperty` と `setMyProperty` という2つの関数が作成され、どちらも `external` としてマークされます。

## Kotlin での Lombok 生成宣言の使用 {id="using-lombok-generated-declarations-in-kotlin"}

Java の Lombok によって生成された宣言を Kotlin コードで使用できます。
同一の混合 Java/Kotlin モジュール内でこれらの宣言を生成して使用する必要がある場合は、[Lombok コンパイラプラグインのページ](lombok.md)でその方法を確認できます。
別のモジュールからそのような宣言を呼び出す場合、そのモジュールをコンパイルするためにこのプラグインを使用する必要はありません。