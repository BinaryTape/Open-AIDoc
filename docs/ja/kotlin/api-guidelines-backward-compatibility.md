[//]: # (title: ライブラリ作者のための後方互換性ガイドライン)

ライブラリを作成する最も一般的な動機は、その機能をより広いコミュニティに公開することです。
このコミュニティは、単一のチーム、会社、特定の業界、あるいはテクノロジープラットフォームである可能性があります。
どの場合においても、後方互換性（backward compatibility）は重要な考慮事項となります。
コミュニティが広ければ広いほど、誰がユーザーであるか、また彼らがどのような制約の下で作業しているかを把握しにくくなるため、後方互換性はより重要になります。

後方互換性は単一の用語ではなく、バイナリ、ソース、および振る舞いのレベルで定義できます。
これらのタイプの詳細については、このセクションで説明します。

以下の点に注意してください：

* ソース互換性を壊さずにバイナリ互換性を壊すことも、その逆も可能です。
* ソース互換性を保証することは望ましいことですが、非常に困難です。ライブラリ作者として、ライブラリのユーザーによって関数や型が呼び出されたりインスタンス化されたりするあらゆる可能性を考慮しなければなりません。ソース互換性は通常、約束（promise）ではなく、目指すべき指標（aspiration）です。

このセクションの残りの部分では、さまざまな種類の互換性を確保するために実行できるアクションと、使用できるツールについて説明します。

## 互換性のタイプ {initial-collapse-state="collapsed" collapsible="true"}

**バイナリ互換性（Binary compatibility）**とは、ライブラリの新しいバージョンが、以前にコンパイルされたバージョンのライブラリを置き換えられることを意味します。
以前のバージョンのライブラリに対してコンパイルされたソフトウェアは、引き続き正しく動作する必要があります。

> バイナリ互換性の詳細については、[Binary compatibility validatorのREADME](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#what-makes-an-incompatible-change-to-the-public-binary-api) または [Evolving Java-based APIs](https://github.com/eclipse-platform/eclipse.platform/blob/master/docs/Evolving-Java-based-APIs-2.md) ドキュメントを参照してください。
>
{style="tip"}

**ソース互換性（Source compatibility）**とは、ライブラリを使用しているソースコードを一切修正することなく、新しいバージョンのライブラリで以前のものを置き換えられることを意味します。ただし、このクライアントコードをコンパイルした出力は、ライブラリをコンパイルした出力ともはや互換性がない可能性があるため、互換性を保証するにはクライアントコードを新しいバージョンのライブラリに対して再ビルドする必要があります。

**振る舞いの互換性（Behavioral compatibility）**とは、ライブラリの新しいバージョンが、バグ修正を除いて既存の機能を変更しないことを意味します。同じ機能が含まれ、それらは同じセマンティクス（意味論）を持ちます。

## Binary compatibility validatorの使用

JetBrainsは、APIの異なるバージョン間でバイナリ互換性を確保するために使用できる [Binary compatibility validator](https://github.com/Kotlin/binary-compatibility-validator) ツールを提供しています。

このツールはGradleプラグインとして実装されており、ビルドに2つのタスクを追加します：

* `apiDump` タスクは、APIを記述した人間が読める形式の `.api` ファイルを作成します。
* `apiCheck` タスクは、保存されたAPIの記述と、現在のビルドでコンパイルされたクラスを比較します。

`apiCheck` タスクは、標準のGradle `check` タスクによってビルド時に呼び出されます。
互換性が壊れている場合、ビルドは失敗します。その時点で、手動で `apiDump` タスクを実行し、古いバージョンと新しいバージョンの違いを比較する必要があります。
変更内容に問題がなければ、VCS内にある既存の `.api` ファイルを更新できます。

このバリデーターは、マルチプラットフォームライブラリによって生成される [KLibの検証を実験的にサポート](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#experimental-klib-abi-validation-support) しています。

### Kotlin Gradleプラグインでのバイナリ互換性検証

<primary-label ref="experimental-general"/>

バージョン 2.2.0 以降、Kotlin Gradle プラグインはバイナリ互換性の検証をサポートしています。詳細については、[Kotlin Gradle プラグインでのバイナリ互換性検証](gradle-binary-compatibility-validation.md) を参照してください。

## 戻り値の型を明示的に指定する

[Kotlinコーディングガイドライン](coding-conventions.md#coding-conventions-for-libraries) で議論されているように、API内の関数の戻り値の型とプロパティの型は常に明示的に指定する必要があります。[Explicit APIモード](api-guidelines-simplicity.md#use-explicit-api-mode) に関するセクションも参照してください。

次の例を考えてみましょう。ライブラリ作者が `JsonDeserializer` を作成し、利便性のために拡張関数を使用してそれを `Int` 型に関連付けています。

```kotlin
class JsonDeserializer<T>(private val fromJson: (String) -> T) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonDeserializer { ... }
```

ここで、作者がこの実装を `JsonOrXmlDeserializer` に置き換えたとします。

```kotlin
class JsonOrXmlDeserializer<T>(
    private val fromJson: (String) -> T,
    private val fromXML: (String) -> T
) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonOrXmlDeserializer({ ... }, { ... })
```

既存の機能は、XMLをデシリアライズする機能が追加された状態で引き続き動作します。しかし、これはバイナリ互換性を壊します。

## 既存のAPI関数への引数の追加を避ける

公開APIにデフォルト値のない引数を追加すると、ユーザーは以前よりも多くの情報を呼び出し時に提供する必要があるため、バイナリ互換性とソース互換性の両方が壊れます。
しかし、[デフォルト引数](functions.md#parameters-with-default-values) を追加する場合であっても、互換性が壊れる可能性があります。

例えば、`lib.kt` に次の関数があるとします：

```kotlin
fun fib() = … // 0を返す
```

そして、`client.kt` に次の関数があるとします：

```kotlin
fun main() {
    println(fib()) // 0を出力する
}
```
これら2つのファイルをJVM上でコンパイルすると、出力として `LibKt.class` と `ClientKt.class` が生成されます。

ここで、`fib(3)` が 2 を返し、`fib(4)` が 3 を返し、のように、フィボナッチ数列を表す `fib` 関数を再実装してコンパイルするとします。既存の動作を維持するために、パラメータを追加しつつ、それにデフォルト値として 0 を与えます：

```kotlin
fun fib(input: Int = 0) = … // フィボナッチの項を返す
```

ここで `lib.kt` ファイルを再コンパイルする必要があります。あなたは `client.kt` ファイルを再コンパイルする必要はなく、関連するクラスファイルを次のように呼び出せると期待するかもしれません：

```shell
$ kotlin ClientKt.class
```

しかし、これを試みると `NoSuchMethodError` が発生します：

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'int LibKt.fib()'
       at LibKt.main(fib.kt:2)
       at LibKt.main(fib.kt)
       …
```

これは、Kotlin/JVMコンパイラによって生成されたバイトコード内でメソッドのシグネチャが変更され、バイナリ互換性が壊れたためです。

ただし、ソース互換性は維持されます。両方のファイルを再コンパイルすれば、プログラムは以前と同様に動作します。

### バイナリ互換性を維持するためにオーバーロードを使用する {initial-collapse-state="collapsed" collapsible="true"}

公開されたAPIにオプションのパラメータを追加する際、バイナリ互換性を維持するために[実験的（Experimental）](components-stability.md#stability-levels-explained)な [`@IntroducedAt`](java-to-kotlin-interop.md#overloads-generation) アノテーションを使用できます。

新しい各オプションパラメータに、それが導入されたバージョンを指定してアノテーションを追加します。例：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun fib(@IntroducedAt("1.1") input: Int = 0) = …
```

コンパイラはこの情報を使用して、対応する隠しオーバーロードを生成します。

JVM向けのKotlinコードを記述する際は、デフォルト引数を持つ関数に [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/) アノテーションを付けてオーバーロードを生成することもできます。

> `@JvmOverloads` アノテーションは、Kotlinの呼び出し元に対してはバイナリ互換性を維持しません。
> 代わりに、公開されたAPIを変更する際は `@IntroducedAt` アノテーションを使用するか、手動でオーバーロードを追加してください。
>
{style="warning"}

デフォルト引数を持つ単一の関数を使用する代わりに、手動でオーバーロードを作成することもできます。
例えば、`fib()` 関数が `Int` パラメータを受け取れるようにしたい場合は、個別のオーバーロードを作成します：

```kotlin
fun fib() = … 
fun fib(input: Int) = …
```

## 戻り値の型の拡張や縮小を避ける

APIを進化させる際、関数の戻り値の型を拡張（widen）したり縮小（narrow）したりしたくなることはよくあります。
例えば、APIの将来のバージョンで、戻り値の型を `List` から `Collection` に、あるいは `Collection` から `List` に変更したい場合があります。

インデックスのサポートを求めるユーザーのリクエストに応えるために、型を `List` に縮小したいかもしれません。逆に、扱っているデータに自然な順序がないことに気づき、型を `Collection` に拡張したい場合もあるでしょう。

戻り値の型を拡張すると互換性が壊れる理由は容易に理解できます。例えば、`List` から `Collection` に変換すると、インデックスを使用しているすべてのコードが壊れます。

戻り値の型を縮小すること（例えば `Collection` から `List` へ）は互換性を維持するように思えるかもしれません。残念ながら、ソース互換性は維持されますが、バイナリ互換性は壊れます。

`Library.kt` ファイルにデモ関数があるとします：

```kotlin
public fun demo(): Number = 3
```

そして `Client.kt` にその関数のクライアントがあるとします：

```kotlin
fun main() {
    println(demo()) // 3を出力する
}
```

ここで、`demo` の戻り値の型を変更し、`Library.kt` のみを再コンパイルするシナリオを想定してみましょう：

```kotlin
fun demo(): Int = 3
```

クライアントを再実行すると、以下のエラーが発生します（JVM上）：

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'java.lang.Number Library.demo()'
        at ClientKt.main(call.kt:2)
        at ClientKt.main(call.kt)
        …
```

これは、`main` メソッドから生成されたバイトコード内の以下の命令が原因で発生します：

```text
0: invokestatic  #12 // Method Library.demo:()Ljava/lang/Number;
```

JVMは `Number` を返す `demo` という名前の静的メソッドを呼び出そうとしています。
しかし、そのメソッドはもはや存在しないため、バイナリ互換性を壊したことになります。

## APIでのデータクラスの使用を避ける

通常の開発において、データクラスの強みは自動生成される追加の関数にあります。
APIデザインにおいては、この強みが弱点となります。

例えば、APIで次のデータクラスを使用しているとします：

```kotlin
data class User(
    val name: String,
    val email: String
)
```

後で、`active` というプロパティを追加したくなったとします：

```kotlin
data class User(
    val name: String,
    val email: String,
    val active: Boolean = true
)
```

これは2つの方法でバイナリ互換性を壊します。第一に、生成されるコンストラクタのシグネチャが異なります。さらに、生成される `copy` メソッドのシグネチャも変更されます。

元のシグネチャ（Kotlin/JVM上）は次のようになります：

```text
public final User copy(java.lang.String, java.lang.String)
```

`active` プロパティを追加した後、シグネチャは次のようになります：

```text
public final User copy(java.lang.String, java.lang.String, boolean)
```

コンストラクタと同様に、これはバイナリ互換性を壊します。

手動でセカンダリコンストラクタを記述し、`copy` メソッドをオーバーライドすることで、これらの問題を回避することは可能です。しかし、それに費やす労力はデータクラスを使用する利便性を打ち消してしまいます。

データクラスに関するもう一つの問題は、コンストラクタ引数の順序を変更すると、非構造化（destructuring）に使用される生成された `componentX` メソッドに影響が及ぶことです。たとえバイナリ互換性が壊れなかったとしても、順序の変更は確実に振る舞いの互換性を壊します。

## アノテーションターゲットの変更を避ける

アノテーションを公開する際は、ライブラリのリリース後に許可されるターゲット（allowed targets）を変更しないようにしてください。これらを変更すると、ユーザーが既存のコードを再コンパイルした際、同じアノテーションが適用される方法に影響を与える可能性があります。

例えば、アノテーションが `AnnotationTarget.FIELD` のみを宣言している場合、プロパティに対する修飾子のないアノテーションは、そのバッキングフィールドに適用されます：

```kotlin
@Target(AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

後から `AnnotationTarget.PROPERTY` を追加すると、同じ修飾子のないアノテーションが、代わりにプロパティに適用されるようになります：

```kotlin
@Target(AnnotationTarget.PROPERTY, AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

これは、[Kotlinコンパイラが `field` ターゲットよりも先に `property` ターゲットを選択する](annotations.md#defaults-when-no-use-site-targets-are-specified)ためです。`field` ターゲットは、`property` が適用できない場合にのみ使用されます。

これにより、生成された特定の要素にアノテーションがあることを期待するツールやフレームワークにおいて互換性が壊れる可能性があります。特に、`property` ターゲットはJavaからは見えません。
JavaのリフレクションやJavaアノテーションプロセッサがバッキングフィールド上のアノテーションを見つける必要がある場合、ユーザーは次のように `field` 使用部位ターゲットを明示的に指定する必要があります：

```kotlin
class User {
    @field:Example
    val name: String = ""
}
```

## PublishedApiアノテーションを使用する際の考慮事項

Kotlinでは、インライン関数をライブラリのAPIの一部にすることができます。これらの関数への呼び出しは、ユーザーが記述したクライアントコード内にインライン展開されます。これは互換性の問題を引き起こす可能性があるため、これらの関数が非公開APIの宣言を呼び出すことは許可されていません。

インライン化された公開関数からライブラリの内部APIを呼び出す必要がある場合は、その内部APIに [`@PublishedApi`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-published-api/) アノテーションを付けることで呼び出しが可能になります。
これにより内部宣言は実質的に公開され、その参照はコンパイルされたクライアントコードに含まれることになります。したがって、内部宣言を変更する際には、それらの変更がバイナリ互換性に影響を与える可能性があるため、公開宣言と同様に扱う必要があります。

## APIを実利的に進化させる

既存の宣言を削除または変更することで、時間をかけてライブラリのAPIに破壊的変更を加える必要がある場合があります。このセクションでは、そのようなケースに実利的に対処する方法について説明します。

ユーザーがライブラリの新しいバージョンにアップグレードした際、プロジェクトのソースコード内でライブラリのAPIへの参照が未解決（unresolved）になってしまうような事態は避けるべきです。ライブラリの公開APIから何かを即座に削除するのではなく、非推奨サイクル（deprecation cycle）に従うべきです。そうすることで、ユーザーに代替手段へ移行するための時間を与えることができます。

古い宣言に [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) アノテーションを使用して、それが置き換えられる予定であることを示します。このアノテーションのパラメータは、非推奨化に関する重要な詳細を提供します：

* `message` は、何が変更されるのか、なぜ変更されるのかを説明する必要があります。
* `replaceWith` パラメータは、可能な限り、新しいAPIへの自動移行を提供するために使用されるべきです。
* 非推奨レベル（level）を使用して、APIを段階的に非推奨にする必要があります。詳細については、[KotlinドキュメントのDeprecatedページ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) を参照してください。

一般的に、非推奨化はまず「警告（warning）」を出し、次に「エラー（error）」にし、その後「宣言を隠す（hide）」というプロセスを辿るべきです。
このプロセスはいくつかのマイナーリリースにわたって行われるべきであり、ユーザーがプロジェクトで必要な変更を行うための時間を提供します。APIの削除などの破壊的変更は、メジャーリリースでのみ行うべきです。
ライブラリは異なるバージョニングおよび非推奨戦略を採用する場合がありますが、適切な期待値を設定するために、それをユーザーに伝える必要があります。

詳細は、[Kotlin Evolution principles ドキュメント](kotlin-evolution-principles.md#libraries) または KotlinConf 2023 での Leonid Startsev によるトーク [Evolving your Kotlin API painlessly for clients](https://www.youtube.com/watch?v=cCgXtpVPO-o&t=1468s) で学ぶことができます。

## RequiresOptInメカニズムの使用

Kotlin標準ライブラリは、APIの一部を使用する前にユーザーからの明示的な同意を要求するための [オプトインメカニズムを提供](opt-in-requirements.md) しています。
これは、それ自体に [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) アノテーションが付いたマーカーアノテーションを作成することに基づいています。
このメカニズムを使用して、特にライブラリに新しいAPIを導入する際の、ソース互換性や振る舞いの互換性に関する期待値を管理する必要があります。

このメカニズムを使用する場合は、以下のベストプラクティスに従うことを推奨します：

* オプトインメカニズムを使用して、APIの異なる部分に異なる保証を提供します。例えば、機能を *Preview*（プレビュー）、*Experimental*（実験的）、*Delicate*（慎重な扱いが必要）としてマークできます。各カテゴリは、ドキュメントや [KDocコメント](kotlin-doc.md) で、適切な警告メッセージとともに明確に説明されるべきです。
* ライブラリが実験的APIを使用している場合は、その [アノテーションを自身のユーザーに伝播](opt-in-requirements.md#propagate-opt-in-requirements) させてください。これにより、ユーザーはまだ進化途中の依存関係があることを認識できます。
* ライブラリ内の既存の宣言を非推奨にするためにオプトインメカニズムを使用することは避けてください。代わりに、[APIを実利的に進化させる](#apiを実利的に進化させる) セクションで説明されているように、`@Deprecated` を使用してください。

## 次のステップ

まだ確認していない場合は、以下のページも参照してください：

* 思考の複雑さを最小限に抑えるための戦略については、[思考の複雑さの最小化](api-guidelines-minimizing-mental-complexity.md) ページをご覧ください。
* 効果的なドキュメント作成方法に関する広範な概要については、[有益なドキュメント作成](api-guidelines-informative-documentation.md) を参照してください。