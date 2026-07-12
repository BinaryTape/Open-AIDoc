[//]: # (title: KotlinからJavaを呼び出す)

KotlinはJavaとの相互運用性を念頭に置いて設計されています。既存のJavaコードを自然な方法でKotlinから呼び出すことができ、またKotlinのコードもJavaからスムーズに利用できます。
このセクションでは、KotlinからJavaコードを呼び出す際の詳細について説明します。

ほぼすべてのJavaコードを問題なく使用できます：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // Javaのコレクションに対して'for'ループが動作します：
    for (item in source) {
        list.add(item)
    }
    // 演算子の慣習も動作します：
    for (i in 0..source.size - 1) {
        list[i] = source[i] // get と set が呼び出されます
    }
}
```

## ゲッターとセッター (Getters and setters)

ゲッターとセッターに関するJavaの慣習（`get`で始まる名前の引数なしメソッドと、`set`で始まる名前の単一引数メソッド）に従うメソッドは、Kotlinではプロパティとして表されます。このようなプロパティは、*シンセティックプロパティ (synthetic properties)* とも呼ばれます。
`Boolean`のアクセサメソッド（ゲッターの名前が`is`で始まり、セッターの名前が`set`で始まるもの）は、ゲッターメソッドと同じ名前を持つプロパティとして表されます。

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

上記の `calendar.firstDayOfWeek` はシンセティックプロパティの例です。

なお、Javaクラスにセッターしかない場合、Kotlinはセット専用（set-only）プロパティをサポートしていないため、Kotlinからはプロパティとして見えません。

## Javaシンセティックプロパティのリファレンス

> この機能は[実験的](components-stability.md#stability-levels-explained)なものです。いつでも削除または変更される可能性があります。
> 評価目的でのみ使用することをお勧めします。
>
{style="warning"}

Kotlin 1.8.20以降、Javaのシンセティックプロパティへのリファレンスを作成できるようになりました。以下のJavaコードを考えてみましょう：

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

Kotlinでは常に `person.age`（`age`はシンセティックプロパティ）と書くことができました。今後は、`Person::age` や `person::age` というリファレンスを作成することも可能です。これは `name` についても同様です。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // Javaシンセティックプロパティへのリファレンスを呼び出し：
        .sortedBy(Person::age)
         // Kotlinのプロパティ構文経由でJavaのゲッターを呼び出し：
        .forEach { person -> println(person.name) }
```

### Javaシンセティックプロパティのリファレンスを有効にする方法 {initial-collapse-state="collapsed" collapsible="true"}

この機能を有効にするには、コンパイラオプション `-language-version 2.1` を設定してください。Gradleプロジェクトでは、`build.gradle(.kts)` に以下を追加することで設定できます：

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

> Kotlin 1.9.0より前では、この機能を有効にするためにコンパイラオプション `-language-version 1.9` を設定する必要がありました。
> 
{style="note"}

## voidを返すメソッド

Javaのメソッドが `void` を返す場合、Kotlinから呼び出されると `Unit` を返します。
もし誰かがその戻り値を使用した場合、値自体は事前に分かっている（`Unit` である）ため、Kotlinコンパイラによって呼び出し側で割り当てられます。

## KotlinのキーワードであるJava識別子のエスケープ

Kotlinのキーワードの中には、Javaで有効な識別子であるものがあります：`in`、`object`、`is` など。
Javaライブラリがメソッド名にKotlinのキーワードを使用している場合、バックティック (`) 文字でエスケープすることで、そのメソッドを呼び出すことができます：

```kotlin
foo.`is`(bar)
```

## Null安全とプラットフォーム型 (Null-safety and platform types)

Javaのあらゆる参照は `null` になる可能性があるため、Javaから来るオブジェクトに対してKotlinの厳格なNull安全要件を適用するのは現実的ではありません。
Java宣言の型はKotlinでは特別な方法で扱われ、[*プラットフォーム型 (platform types)*](https://kotlinlang.org/spec/type-system.html#platform-types) と呼ばれます。
プラットフォーム型は *non-denotable（明示的に記述できない）* 型であり、言語内で明示的に書き下ろすことはできません。そのため、プラットフォーム値がKotlinの変数に代入されるとき、以下のことが可能です：

* 型推論に任せる。この場合、変数は推論されたプラットフォーム型になります。
* 期待する型を選択する。KotlinではNull許容型と非Null型の両方が許可されます。

これら型についてはNullチェックが緩和されるため、安全性の保証はJavaと同じになります（詳細は[後述](#mapped-types)を参照）。
以下の例を考えてみましょう：

```kotlin
val list = ArrayList<String>() // 非null（コンストラクタの結果）
list.add("Item")
val size = list.size // 非null（プリミティブの int）
val item = list[0] // プラットフォーム型と推論される（通常のJavaオブジェクト）
```

プラットフォーム型の変数に対してメソッドを呼び出す際、Kotlinはコンパイル時にNull許容性エラーを出しませんが、実行時に呼び出しが失敗する可能性があります。これはNullポインタ例外が発生するか、KotlinがNullの伝播を防ぐために生成するアサーションが失敗するためです：

```kotlin
item.substring(1) // 許可されるが、item == null の場合は例外を投げる
```

プラットフォーム型の値は、Null許容型と非Null型の両方のKotlin変数に代入できます。しかし、そのような値を非Null型の変数に代入し、その値が実行時に実際に `null` であった場合、Kotlinは `NullPointerException` をスローします。これを避けるには、Kotlinコードに明示的なNull許容性を追加してください：

```kotlin
val nullable: String? = item // 許可される、常に動作する
val notNull: String = item // 許可されるが、実行時に失敗する可能性がある
```

非Null型を選択した場合、コンパイラは代入時にアサーションを挿入します。これにより、Kotlinの非Null変数がNullを保持することを防ぎます。アサーションは、プラットフォーム値を非Null値を期待するKotlin関数に渡す際などにも挿入されます。
全体として、コンパイラはプログラムの遠くまでNullが伝播するのを防ぐために最善を尽くしますが、ジェネリクスの影響などで完全に排除することが不可能な場合もあります。

### プラットフォーム型の表記法

前述の通り、プラットフォーム型をプログラム内で明示的に言及することはできないため、言語としての構文はありません。
しかし、コンパイラやIDEは時としてそれらを表示する必要があるため（エラーメッセージやパラメータ情報など）、それらを表すためのニーモニック表記があります：

* `T!` は「`T` または `T?`」を意味します。
* `(Mutable)Collection<T>!` は「`T` のJavaコレクション。ミュータブルかもしれないし、そうでないかもしれない。Null許容かもしれないし、そうでないかもしれない」を意味します。
* `Array<(out) T>!` は「`T`（または `T` のサブタイプ）のJava配列。Null許容かもしれないし、そうでないかもしれない」を意味します。

エラーメッセージやIDEのツールチップでこの表記を見た場合は、Kotlinの変数に明示的な型アノテーションを追加してNull安全チェックを復元するか、Null許容性アノテーションを使用してソースレベルでプラットフォーム型を排除してください。

### Null許容性アノテーション (Nullability annotations)

Null許容性アノテーションを持つJavaの型は、プラットフォーム型としてではなく、実際のNull許容または非NullのKotlin型として表されます。コンパイラは、以下を含むいくつかの種類のNull許容性アノテーションをサポートしています：

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
(`org.jetbrains.annotations` パッケージの `@Nullable` と `@NotNull`)
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` と `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

以下のコンパイラオプションを使用して、特定のNull許容性アノテーションに対してNull許容性の不一致を報告するようにコンパイラに指示できます：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

完全修飾されたNull許容性アノテーションのパッケージ名と、以下のレポートレベルのいずれかを指定します：

* `ignore`: Null許容性の不一致を無視する
* `warn`: 警告を報告する
* `strict`: エラーを報告する

> [JSpecify](#jspecify-support) は、デフォルトで `strict` レポートレベルを使用する唯一のサポート対象フレーバーです。
> 追加設定なしでNull許容性アノテーションに関するエラーを報告するにはこれを使用してください。
>
{style="note"}

サポートされているNull許容性アノテーションの完全なリストは、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)で確認できます。

### ミュータビリティアノテーション (Mutability annotations)

Javaの宣言にミュータビリティアノテーションを付けて、返されるコレクションがKotlinで読み取り専用かミュータブルかを指定できます。
もしミュータビリティの異なるコレクション型に値を代入した場合、コンパイラは型不一致を報告します。診断の重要度は、特定のミュータビリティアノテーションによって異なります。

コンパイラは、以下を含むいくつかのミュータビリティアノテーションをサポートしています：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

サポートされているミュータビリティアノテーションの完全なリストは、[Kotlinコンパイラのソースコード](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)で確認できます。

### 型引数と型パラメータへのアノテーション

ジェネリック型の型引数や型パラメータにアノテーションを付けて、それらに対してもNull許容性情報を提供できます。

> このセクションのすべての例では、`org.jetbrains.annotations` パッケージの JetBrains Null許容性アノテーションを使用しています。
>
{style="note"}

#### 型引数

Javaの宣言に対する以下のアノテーションを考えてみましょう：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

これらは、Kotlinでは次のようなシグネチャになります：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

型引数に `@NotNull` アノテーションがない場合は、代わりにプラットフォーム型になります：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlinは、基底クラスやインターフェースの型引数にあるNull許容性アノテーションも考慮します。例えば、以下のようなシグネチャを持つ2つのJavaクラスがあるとします：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

Kotlinコードにおいて、`Base<String>` が想定されている場所に `Derived` のインスタンスを渡すと、警告が発生します。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：Null許容性の不一致
}
```

`Derived` の上限は `Base<String?>` に設定されており、これは `Base<String>` とは異なります。

詳細は[KotlinにおけるJavaジェネリクス](#java-generics-in-kotlin)を参照してください。

#### 型パラメータ

デフォルトでは、KotlinとJavaの両方において、単純な型パラメータのNull許容性は未定義です。Javaでは、Null許容性アノテーションを使用してこれを指定できます。`Base` クラスの型パラメータにアノテーションを付けてみましょう：

```java
public class Base<@NotNull T> {}
```

`Base` を継承する場合、Kotlinは非Nullの型引数または型パラメータを期待します。したがって、以下のKotlinコードは警告を生成します：

```kotlin
class Derived<K> : Base<K> {} // 警告：K の Null許容性が未定義です
```

これは、上限 `K : Any` を指定することで修正できます。

Kotlinは、Java型パラメータの境界（bounds）に対するNull許容性アノテーションもサポートしています。`Base` に境界を追加してみましょう：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlinはこれを次のように翻訳します：

```kotlin
class BaseWithBound<T : Number> {}
```

そのため、Null許容型を型引数や型パラメータとして渡すと警告が発生します。

型引数と型パラメータへのアノテーションは、Java 8ターゲット以降で動作します。この機能には、Null許容性アノテーションが `TYPE_USE` ターゲットをサポートしている必要があります（`org.jetbrains.annotations` はバージョン15以降でこれをサポートしています）。

> あるNull許容性アノテーションが `TYPE_USE` ターゲットに加えて他の適用可能なターゲットもサポートしている場合、`TYPE_USE` が優先されます。例えば、`@Nullable` が `TYPE_USE` と `METHOD` の両方のターゲットを持っている場合、Javaのメソッドシグネチャ `@Nullable String[] f()` は Kotlinでは `fun f(): Array<String?>!` となります。
>
{style="note"}

### JSpecifyのサポート

Kotlinは、JavaのNull許容性に対する統一されたアノテーションセットを提供する [JSpecify](https://jspecify.dev/) Null許容性アノテーションをサポートしています。JSpecifyを使用すると、Java宣言に対して詳細なNull許容性情報を提供でき、Javaコードを扱う際にKotlinがNull安全を維持するのに役立ちます。

Kotlinは、`org.jspecify.annotations` パッケージの以下のアノテーションをサポートしています：

* `@Nullable` は、型がNull許容であることを示します。
* `@NonNull` は、型が非Nullであることを示します。
* `@NullMarked` は、クラスやパッケージなどのスコープ内のすべての型を、別途アノテーションがない限りデフォルトで非Nullとしてマークします。

  このアノテーションは、ローカル変数や[型変数（ジェネリクス）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)には適用されません。型変数は、具体的なNull許容型または非Null型が提供されるまで「null-agnostic（Nullを特定しない）」のままです。

* `@NullUnmarked` は `@NullMarked` の効果を打ち消し、そのスコープ内のすべての型を [プラットフォーム型](#null-safety-and-platform-types) にします。

JSpecifyアノテーションを使用した以下のJavaクラスを考えてみましょう：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
Kotlinでは、これらは[プラットフォーム型](#null-safety-and-platform-types)ではなく、通常の非Null型およびNull許容型として扱われます：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // エラー：安全呼び出し (?.) または非Nullアサーション (!!) 呼び出しのみ許可されます
}
```

デフォルトでは、KotlinコンパイラはJSpecifyアノテーションに対するNull許容性の不一致をエラーとして報告します。
以下のコンパイラオプションを使用して、JSpecifyのNull許容性診断の重要度をカスタマイズできます：

```bash
-Xjspecify-annotations=<report-level>
```

利用可能なレポートレベルは以下の通りです：

| レベル    | 説明                                          |
|----------|-----------------------------------------------|
| `strict` | Null許容性の不一致をエラーとして報告する（デフォルト）。 |
| `warn`   | 警告を報告する。                                |
| `ignore` | Null許容性の不一致を無視する。                   |

> JSpecifyアノテーションの詳細については、[JSpecifyユーザーガイド](https://jspecify.dev/docs/user-guide)を参照してください。
> 
{type="tip"}

### JSR-305のサポート

[JSR-305](https://jcp.org/en/jsr/detail?id=305) で定義されている [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) アノテーションは、Java型のNull許容性を示すためにサポートされています。

`@Nonnull(when = ...)` の値が `When.ALWAYS` の場合、アノテーションが付いた型は非Nullとして扱われます。`When.MAYBE` と `When.NEVER` はNull許容型を示し、`When.UNKNOWN` はその型を強制的に [プラットフォーム型](#null-safety-and-platform-types) にします。

ライブラリはJSR-305アノテーションに対してコンパイルできますが、ライブラリの利用者がアノテーションのアーティファクト（例：`jsr305.jar`）をコンパイル依存関係にする必要はありません。Kotlinコンパイラは、クラスパスにアノテーションが存在しなくても、ライブラリからJSR-305アノテーションを読み取ることができます。

[カスタムNull許容性クオリファイア (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md) もサポートされています（後述）。

#### 型クオリファイアのニックネーム (Type qualifier nicknames)

アノテーション型が [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) と JSR-305 の `@Nonnull`（または `@CheckForNull` などの別のニックネーム）の両方でアノテーションされている場合、そのアノテーション型自体が正確なNull許容性を取得するために使用され、そのNull許容性アノテーションと同じ意味を持ちます：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 別の型クオリファイア・ニックネームへのニックネーム
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

#### 型クオリファイアのデフォルト (Type qualifier defaults)

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) を使用すると、適用された際にそのアノテーションされた要素のスコープ内でのデフォルトのNull許容性を定義するアノテーションを導入できます。

このようなアノテーション型自体が、`@Nonnull`（またはそのニックネーム）と、1つ以上の `ElementType` 値を持つ `@TypeQualifierDefault(...)` の両方でアノテーションされている必要があります：

* `ElementType.METHOD`: メソッドの戻り値の型
* `ElementType.PARAMETER`: 値パラメータ
* `ElementType.FIELD`: フィールド
* `ElementType.TYPE_USE`: 型引数、型パラメータの上限、ワイルドカード型を含む任意の型

デフォルトのNull許容性は、型自体にNull許容性アノテーションが付いておらず、かつ、型の使用箇所に一致する `ElementType` を持つ型クオリファイア・デフォルト・アノテーションでアノテーションされた、最も内側の囲み要素によってデフォルトが決定される場合に使用されます。

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

    @NotNullApi // インターフェースからのデフォルトを上書き
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // `@NullableApi` が `TYPE_USE` 要素型を持っているため、
    // List<String> 型引数は Null許容とみなされる：
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // 明示的な UNKNOWN マークの Null許容性アノテーションがあるため、
    // x パラメータの型はプラットフォーム型のまま：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> この例の型は strict モードが有効な場合にのみ適用されます。それ以外の場合はプラットフォーム型のままになります。
> [`@UnderMigration` アノテーション](#undermigration-annotation) および [コンパイラ構成](#compiler-configuration) のセクションを参照してください。
>
{style="note"}

パッケージレベルのデフォルトNull許容性もサポートされています：

```java
// FILE: test/package-info.java
@NonNullApi // 'test' パッケージ内のすべての型をデフォルトで非Nullとして宣言
package test;
```

#### @UnderMigration アノテーション

`@UnderMigration` アノテーション（別個のアーティファクト `kotlin-annotations-jvm` で提供）は、ライブラリのメンテナがNull許容型クオリファイアの移行ステータスを定義するために使用できます。

`@UnderMigration(status = ...)` のステータス値は、アノテーションされた型をKotlinで不適切に使用した場合（例：`@MyNullable` でアノテーションされた型の値を非Nullとして使用した場合）にコンパイラがどのように扱うかを指定します：

* `MigrationStatus.STRICT`: アノテーションを通常のNull許容性アノテーションとして機能させます。つまり、不適切な使用に対してエラーを報告し、Kotlinから見えるアノテーションされた宣言の型に影響を与えます。
* `MigrationStatus.WARN`: 不適切な使用はエラーではなくコンパイル警告として報告されますが、アノテーションされた宣言の型はプラットフォーム型のままになります。
* `MigrationStatus.IGNORE`: コンパイラにNull許容性アノテーションを完全に無視させます。

ライブラリメンテナは、型クオリファイア의 ニックネームと型クオリファイアのデフォルトの両方に `@UnderMigration` ステータスを追加できます：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// クラス内の型は非Nullですが、`@NonNullApi` が
// `@UnderMigration(status = MigrationStatus.WARN)` でアノテーションされているため、
// 警告のみが報告されます。
@NonNullApi
public class Test {}
```

> Null許容性アノテーションの移行ステータスは、その型クオリファイアのニックネームには継承されませんが、デフォルト型クオリファイアでの使用には適用されます。
>
{style="note"}

デフォルト型クオリファイアが型クオリファイアのニックネームを使用し、両方が `@UnderMigration` である場合、デフォルト型クオリファイアのステータスが使用されます。

#### コンパイラ構成

JSR-305チェックは、`-Xjsr305` コンパイラフラグに以下のオプション（およびそれらの組み合わせ）を追加することで構成できます：

* `-Xjsr305={strict|warn|ignore}`: `@UnderMigration` でないアノテーションの動作を設定します。
カスタムNull許容性クオリファイア、特に `@TypeQualifierDefault` は、すでに多くの有名なライブラリに普及しており、JSR-305サポートを含むKotlinバージョンにアップデートする際にユーザーがスムーズに移行する必要があるかもしれません。Kotlin 1.1.60以降、このフラグは `@UnderMigration` でないアノテーションにのみ影響します。

* `-Xjsr305=under-migration:{strict|warn|ignore}`: `@UnderMigration` アノテーションの動作を上書きします。
ユーザーはライブラリの移行ステータスについて異なる考えを持つかもしれません。公式の移行ステータスが `WARN` であってもエラーにしたい、あるいは逆に、自身の移行が完了するまで一部のエラー報告を延期したい、といった場合です。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`: 単一のアノテーションの動作を上書きします。`<fq.name>` はアノテーションの完全修飾クラス名です。異なるアノテーションに対して複数回指定できます。これは特定のライブラリの移行状態を管理するのに便利です。

`strict`、`warn`、`ignore` の各値は `MigrationStatus` のものと同じ意味を持ち、`strict` モードのみがKotlinから見えるアノテーションされた宣言の型に影響を与えます。

> 注：組み込みのJSR-305アノテーション [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html)、[`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) は常に有効であり、`-Xjsr305` フラグによるコンパイラ構成に関係なく、Kotlinにおけるアノテーションされた宣言の型に影響を与えます。
>
{style="note"}

例えば、`-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` をコンパイラ引数に追加すると、コンパイラは `@org.library.MyNullable` でアノテーションされた型の不適切な使用に対して警告を生成し、他のすべてのJSR-305アノテーションを無視します。

デフォルトの動作は `-Xjsr305=warn` と同じです。`strict` 値は実験的なものとみなされるべきです（将来的にさらなるチェックが追加される可能性があります）。

## マップされた型 (Mapped types)

Kotlinは一部のJava型を特別に扱います。そのような型はJavaから「そのまま」ロードされるのではなく、対応するKotlinの型に *マップ* されます。
マッピングはコンパイル時にのみ重要であり、実行時の表現は変更されません。
Javaのプリミティブ型は、対応するKotlinの型にマップされます（[プラットフォーム型](#null-safety-and-platform-types)を考慮した上で）：

| **Javaの型** | **Kotlinの型**  |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

プリミティブでない一部の組み込みクラスもマップされます：

| **Javaの型** | **Kotlinの型**  |
|---------------|------------------|
| `java.lang.Object`       | `kotlin.Any!`    |
| `java.lang.Cloneable`    | `kotlin.Cloneable!`    |
| `java.lang.Comparable`   | `kotlin.Comparable!`    |
| `java.lang.Enum`         | `kotlin.Enum!`    |
| `java.lang.annotation.Annotation`   | `kotlin.Annotation!`    |
| `java.lang.CharSequence` | `kotlin.CharSequence!`   |
| `java.lang.String`       | `kotlin.String!`   |
| `java.lang.Number`       | `kotlin.Number!`     |
| `java.lang.Throwable`    | `kotlin.Throwable!`    |

Javaのプリミティブ型のラッパークラスは、Null許容のKotlin型にマップされます：

| **Javaの型**           | **Kotlinの型**  |
|-------------------------|------------------|
| `java.lang.Byte`        | `kotlin.Byte?`   |
| `java.lang.Short`       | `kotlin.Short?`  |
| `java.lang.Integer`     | `kotlin.Int?`    |
| `java.lang.Long`        | `kotlin.Long?`   |
| `java.lang.Character`   | `kotlin.Char?`   |
| `java.lang.Float`       | `kotlin.Float?`  |
| `java.lang.Double`      | `kotlin.Double?`  |
| `java.lang.Boolean`     | `kotlin.Boolean?` |

なお、型パラメータとして使用されるラッパープリミティブ型はプラットフォーム型にマップされます。例えば、`List<java.lang.Integer>` はKotlinでは `List<Int!>` になります。

Kotlinのコレクション型は読み取り専用またはミュータブルである可能性があるため、Javaのコレクションは次のようにマップされます（この表のすべてのKotlin型は `kotlin.collections` パッケージに属します）：

| **Javaの型** | **Kotlin読み取り専用型**  | **Kotlinミュータブル型** | **ロードされたプラットフォーム型** |
|---------------|----------------------------|-------------------------|--------------------------|
| `Iterator<T>`        | `Iterator<T>`        | `MutableIterator<T>`            | `(Mutable)Iterator<T>!`            |
| `Iterable<T>`        | `Iterable<T>`        | `MutableIterable<T>`            | `(Mutable)Iterable<T>!`            |
| `Collection<T>`      | `Collection<T>`      | `MutableCollection<T>`          | `(Mutable)Collection<T>!`          |
| `Set<T>`             | `Set<T>`             | `MutableSet<T>`                 | `(Mutable)Set<T>!`                 |
| `List<T>`            | `List<T>`            | `MutableList<T>`                | `(Mutable)List<T>!`                |
| `ListIterator<T>`    | `ListIterator<T>`    | `MutableListIterator<T>`        | `(Mutable)ListIterator<T>!`        |
| `Map<K, V>`          | `Map<K, V>`          | `MutableMap<K, V>`              | `(Mutable)Map<K, V>!`              |
| `Map.Entry<K, V>`    | `Map.Entry<K, V>`    | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Javaの配列は[後述](#java-arrays)の通りマップされます：

| **Javaの型** | **Kotlinの型**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> これらのJava型の静的メンバは、Kotlin型の[コンパニオンオブジェクト](object-declarations.md#companion-objects)から直接アクセスすることはできません。それらを呼び出すには、Java型の完全修飾名を使用してください。例：`java.lang.Integer.toHexString(foo)`。
>
{style="note"}

## KotlinにおけるJavaジェネリクス

KotlinのジェネリクスはJavaのものとは少し異なります（[ジェネリクス](generics.md)を参照）。
Javaの型をKotlinにインポートする際、以下の変換が行われます：

* Javaのワイルドカードは型投影（type projections）に変換されます：
  * `Foo<? extends Bar>` は `Foo<out Bar!>!` になります。
  * `Foo<? super Bar>` は `Foo<in Bar!>!` になります。

* Javaの原型（raw types）は星投影（star projections）に変換されます：
  * `List` は `List<*>!`、つまり `List<out Any?>!` になります。

Javaと同様に、Kotlinのジェネリクスは実行時には保持されません。オブジェクトはコンストラクタに渡された実際の型引数に関する情報を保持しません。例えば、`ArrayList<Integer>()` は `ArrayList<Character>()` と区別できません。
このため、ジェネリクスを考慮した `is` チェックを実行することは不可能です。
Kotlinでは、星投影されたジェネリック型に対してのみ `is` チェックが許可されます：

```kotlin
if (a is List<Int>) // エラー：本当に Int の List かどうかチェックできない
// ただし
if (a is List<*>) // OK：リストの内容については保証しない
```

## Javaの配列

Javaとは異なり、Kotlinの配列は不変（invariant）です。これは、Kotlinが `Array<String>` を `Array<Any>` に代入することを許可しないことを意味し、実行時の失敗を防ぎます。Kotlinのメソッドにサブクラスの配列をスーパークラスの配列として渡すことも禁止されていますが、Javaのメソッドに対しては `Array<(out) String>!` という形式の[プラットフォーム型](#null-safety-and-platform-types)を介して許可されます。

Javaプラットフォームでは、ボクシング/アンボクシング操作のコストを避けるためにプリミティブデータ型の配列が使用されます。
Kotlinはそれらの実装の詳細を隠しているため、Javaコードとのインターフェースには回避策が必要です。
このケースを処理するために、プリミティブ配列の各型に対応する専用のクラス（`IntArray`、`DoubleArray`、`CharArray` など）があります。
これらは `Array` クラスとは関係がなく、最高のパフォーマンスを得るためにJavaのプリミティブ配列にコンパイルされます。

int配列のインデックスを受け取るJavaメソッドがあるとします：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // code here...
    }
}
```

プリミティブ値の配列を渡すには、Kotlinで次のように記述できます：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // メソッドに int[] を渡す
```

JVMバイトコードにコンパイルする際、コンパイラは配列へのアクセスを最適化し、オーバーヘッドが発生しないようにします：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // get() や set() の実際の呼び出しは生成されません
for (x in array) { // イテレータは作成されません
    print(x)
}
```

インデックスを使用して巡回する場合でも、オーバーヘッドは発生しません：

```kotlin
for (i in array.indices) { // イテレータは作成されません
    array[i] += 2
}
```

最後に、`in` チェックにもオーバーヘッドはありません：

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size) と同じです
    print(array[i])
}
```

## Javaの可変長引数 (Java varargs)

Javaクラスでは、可変長引数（varargs）を使用したメソッド宣言が使われることがあります：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // code here...
    }
}
```

その場合、`IntArray` を渡すにはスプレッド演算子 `*` を使用する必要があります：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 演算子 (Operators)

Javaには演算子構文を使用するのが妥当なメソッドをマークする方法がないため、Kotlinでは、適切な名前とシグネチャを持つ任意のJavaメソッドを、演算子オーバーロードやその他の慣習（`invoke()` など）として使用することを許可しています。
中置呼び出し（infix call）構文を使用したJavaメソッドの呼び出しは許可されていません。

## チェック例外 (Checked exceptions)

Kotlinでは、すべての[例外は非チェック例外](exceptions.md)です。つまり、コンパイラはいかなる例外のキャッチも強制しません。
そのため、チェック例外を宣言しているJavaメソッドを呼び出す際、Kotlinは何も強制しません：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Javaではここで IOException をキャッチする必要があります
    }
}
```

## Objectのメソッド

Javaの型がKotlinにインポートされると、`java.lang.Object` 型のすべての参照は `Any` に変換されます。
`Any` はプラットフォーム固有ではないため、メンバとして `toString()`、`hashCode()`、`equals()` のみを宣言しています。
そのため、`java.lang.Object` の他のメンバを利用可能にするために、Kotlinは[拡張関数](extensions.md)を使用します。

### `wait()` と `notify()`

`wait()` および `notify()` メソッドは、`Any` 型の参照では利用できません。通常、これらの使用は `java.util.concurrent` を優先して控えることが推奨されます。

どうしてもこれらのメソッドを呼び出す必要がある場合は、Javaのオブジェクトとしてアクセスし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制してください：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() と notify() にアクセスするために java.lang.Object を明示的に使用。
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

あるいは、明示的に `java.lang.Object` にキャストし、`PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告を抑制します：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(foo as java.lang.Object).wait()
```

### `getClass()`

オブジェクトのJavaクラスを取得するには、[クラス参照](reflection.md#class-references)の `java` 拡張プロパティを使用します：

```kotlin
val fooClass = foo::class.java
```

上記のコードは[束縛クラス参照](reflection.md#bound-class-references)を使用しています。また、`javaClass` 拡張プロパティを使用することもできます：

```kotlin
val fooClass = foo.javaClass
```

### `clone()`

`clone()` をオーバーライドするには、クラスが `kotlin.Cloneable` を継承する必要があります：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

[Effective Java 第3版](https://www.oracle.com/technetwork/java/effectivejava-136174.html) 項目13：*cloneは注意してオーバーライドする* を忘れないでください。

### `finalize()`

`finalize()` をオーバーライドするには、`override` キーワードを使わずに単に宣言するだけです：

```kotlin
class C {
    protected fun finalize() {
        // 終了処理ロジック
    }
}
```

Javaのルールに従い、`finalize()` は `private` であってはなりません。

## Javaクラスからの継承

Kotlinのクラスにとってのスーパークラスとして、最大1つのJavaクラス（および任意の数のJavaインターフェース）を指定できます。

## 静的メンバへのアクセス

Javaクラスの静的メンバ（static members）は、それらのクラスの「コンパニオンオブジェクト」を形成します。このような「コンパニオンオブジェクト」を値として受け渡しすることはできませんが、メンバに明示的にアクセスすることは可能です。例：

```kotlin
if (Character.isLetter(a)) { ... }
```

Kotlinの型に[マップ](#mapped-types)されているJava型の静的メンバにアクセスするには、Java型の完全修飾名を使用してください：`java.lang.Integer.bitCount(foo)`。

## Javaのリフレクション

JavaのリフレクションはKotlinクラスに対して動作し、その逆も同様です。前述のように、`java.lang.Class` を通じてJavaのリフレクションに入るには、`instance::class.java`、`ClassName::class.java`、または `instance.javaClass` を使用できます。
この目的で `ClassName.javaClass` を使用しないでください。これは `ClassName` のコンパニオンオブジェクトのクラスを参照しており、`ClassName.Companion::class.java` と同じであって `ClassName::class.java` ではないからです。

各プリミティブ型について、2つの異なるJavaクラスがあり、Kotlinは両方を取得する方法を提供しています。例えば、`Int::class.java` はプリミティブ型自体を表すクラスインスタンスを返し、これはJavaの `Integer.TYPE` に対応します。対応するラッパー型のクラスを取得するには、Javaの `Integer.class` に相当する `Int::class.javaObjectType` を使用します。

その他のサポートされているケースには、KotlinプロパティのJavaゲッター/セッターメソッドやバッキングフィールドの取得、Javaフィールドの `KProperty` の取得、`KFunction` のJavaメソッドやコンストラクタの取得、およびその逆が含まれます。

## SAM変換 (SAM conversions)

Kotlinは、Javaと[Kotlinの両方のインターフェース](fun-interfaces.md)に対してSAM変換をサポートしています。
Javaにおけるこのサポートは、インターフェースメソッドのパラメータ型がKotlin関数のパラメータ型と一致する限り、単一の非デフォルトメソッドを持つJavaインターフェースの実装にKotlin関数リテラルを自動的に変換できることを意味します。

これを利用して、SAMインターフェースのインスタンスを作成できます：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

...また、メソッド呼び出しにおいても：

```kotlin
val executor = ThreadPoolExecutor()
// Javaのシグネチャ: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Javaクラスが関数型インターフェースを受け取る複数のメソッドを持っている場合、ラムダを特定のSAM型に変換するアダプタ関数を使用して、呼び出す必要のあるものを選択できます。これらのアダプタ関数も、必要に応じてコンパイラによって生成されます：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM変換はインターフェースに対してのみ動作し、抽象メソッドが1つだけであっても抽象クラスに対しては動作しません。
>
{style="note"}

## KotlinでJNIを使用する

ネイティブ（CまたはC++）コードで実装された関数を宣言するには、`external` 修飾子を付けてマークする必要があります：

```kotlin
external fun foo(x: Int): Double
```

残りの手順はJavaとまったく同じ方法で動作します。

プロパティのゲッターとセッターを `external` としてマークすることもできます：

```kotlin
var myProperty: String
    external get
    external set
```

内部的には、これにより `getMyProperty` と `setMyProperty` という2つの関数が作成され、両方とも `external` としてマークされます。

## KotlinでLombok生成の宣言を使用する

JavaのLombokで生成された宣言をKotlinコードで使用できます。
同じJava/Kotlin混在モジュール内でこれらの宣言を生成して使用する必要がある場合は、[Lombokコンパイラプラグインのページ](lombok.md)でその方法を確認できます。
別のモジュールからそのような宣言を呼び出す場合は、そのモジュールをコンパイルするためにこのプラグインを使用する必要はありません。