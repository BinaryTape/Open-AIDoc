[//]: # (title: 可読性)

読みやすいAPIを作成するには、単にクリーンなコードを書くだけ以上のことが求められます。
それには、統合と利用を簡素化する思慮深い設計が必要です。
このセクションでは、コンポーザビリティ（合成可能性）を念頭に置いてライブラリを構造化し、簡潔で表現力豊かなセットアップのためにドメイン固有言語（DSL）を活用し、明確でメンテナンスしやすいコードのために拡張関数やプロパティを使用することで、APIの可読性を高める方法を探ります。

## 明示的なコンポーザビリティを優先する

ライブラリは、カスタマイズを可能にする高度なオペレーターを提供することがよくあります。
たとえば、ある操作において、ユーザーが独自のデータ構造、ネットワークチャネル、タイマー、またはライフサイクルオブザーバーを提供することを許可する場合があります。
しかし、これらのカスタマイズオプションを関数の引数を追加することで導入すると、APIの複雑さが大幅に増す可能性があります。

カスタマイズのために引数を増やす代わりに、異なる動作を互いに合成（compose）できるようにAPIを設計する方が効果的です。
たとえば、コルーチンの Flow API では、[バッファリングとコンフレーション](coroutines-flow-operators.md#concurrent-processing-operators)の両方が個別の関数として実装されています。
これらは、各基本操作がバッファリングやコンフレーションを制御するための引数を受け取るのではなく、[`filter`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) や [`map`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) のようなより基本的な操作とチェーン（連結）させることができます。

別の例として、[Jetpack Compose の Modifiers API](https://developer.android.com/develop/ui/compose/modifiers) があります。
これにより、Composable コンポーネントは、パディング、サイズ指定、背景色などの一般的なカスタマイズオプションを処理する単一の `Modifier` 引数を受け取ることができます。
このアプローチにより、各 Composable がこれらのカスタマイズのために個別の引数を受け取る必要がなくなり、APIが合理化され、複雑さが軽減されます。

```kotlin
Box(
    modifier = Modifier
        .padding(10.dp)
        .onClick { println("Box clicked!") }
        .fillMaxWidth()
        .fillMaxHeight()
        .verticalScroll(rememberScrollState())
        .horizontalScroll(rememberScrollState())
) {
    // Box content goes here
}
```

## DSLを使用する

Kotlin ライブラリは、ビルダーDSLを提供することで可読性を大幅に向上させることができます。
DSLを使用すると、ドメイン固有のデータ宣言を簡潔に繰り返すことができます。
たとえば、Ktor ベースのサーバーアプリケーションの次のサンプルを考えてみましょう。

```kotlin
fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
    routing {
        post("/article") {
            call.respond<String>(HttpStatusCode.Created, ...)
        }
        get("/article/list") {
            call.respond<List<CreateArticle>>(...)
        }
        get("/article/{id}") {
            call.respond<Article>(...)
        }
    }
}
```

これはアプリケーションをセットアップし、Json シリアル化を使用するように構成された `ContentNegotiation` プラグインをインストールし、アプリケーションがさまざまな `/article` エンドポイントへのリクエストに応答するようにルーティングを設定します。

DSLの作成に関する詳細な説明については、[型安全なビルダー](type-safe-builders.md)を参照してください。
ライブラリ作成の文ランクでは、以下の点が注目に値します。

* DSLで使用される関数はビルダー関数であり、最後の引数としてレシーバー付きラムダを受け取ります。この設計により、これらの関数を括弧なしで呼び出すことができ、構文がより明確になります。渡されるラムダは、作成されるエンティティを構成するために使用できます。上記の例では、`routing` 関数に渡されるラムダは、ルーティングの詳細を構成するために使用されています。
* クラスのインスタンスを作成するファクトリ関数は、戻り値の型と同じ名前にし、大文字で始める必要があります。これは、上記のサンプルの `Json` インスタンスの作成で確認できます。これらの関数は、構成のために引き続きラムダ引数を受け取ることができます。詳細については、[コーディング規約](coding-conventions.md#function-names)を参照してください。
* ビルダー関数に提供されるラムダ内で、必須のプロパティが設定されていることをコンパイル時に保証することは不可能であるため、必須の値は関数の引数として渡すことをお勧めします。

オブジェクトを構築するためにDSLを使用することは、可読性を向上させるだけでなく、後方互換性を向上させ、ドキュメント作成プロセスを簡素化します。たとえば、次の関数を見てみましょう。

```kotlin
fun Json(prettyPrint: Boolean, isLenient: Boolean): Json
```

この関数は `Json{}` DSL ビルダーを置き換えることができます。しかし、DSL アプローチには顕著な利点があります。

* DSL ビルダーを使用すると、新しい構成オプションを追加することは単に新しいプロパティ（または他の例では新しい関数）を追加することを意味し、これは既存の関数の引数リストを変更するのとは異なり、後方互換性のある変更であるため、後方互換性の維持が容易になります。
* また、ドキュメントの作成と維持も容易になります。関数の多くの引数を一箇所ですべて説明する代わりに、各プロパティをその宣言箇所で個別にドキュメント化できます。

## 拡張関数とプロパティを使用する

可読性を向上させるために、[拡張関数とプロパティ](extensions.md)を使用することをお勧めします。

クラスとインターフェースは、型のコアとなる概念を定義する必要があります。
追加の機能や情報は、拡張関数およびプロパティとして記述されるべきです。
これにより、追加の機能がコア概念の上に実装できることや、追加の情報が型のデータから計算できることが、読者にとって明確になります。

たとえば、[`CharSequence`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-sequence/) 型（`String` もこれを実装しています）には、その内容にアクセスするための最も基本的な情報と演算子のみが含まれています。

```kotlin
interface CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun subSequence(startIndex: Int, endIndex: Int): CharSequence
}
```

文字列に一般的に関連付けられる機能は、そのほとんどが拡張関数として定義されており、これらはすべてその型のコア概念と基本APIの上に実装できます。

```kotlin
inline fun CharSequence.isEmpty(): Boolean = length == 0
inline fun CharSequence.isNotEmpty(): Boolean = length > 0

inline fun CharSequence.trimStart(predicate: (Char) -> Boolean): CharSequence {
    for (index in this.indices)
        if (!predicate(this[index]))
           return subSequence(index, length)
    return ""
}
```

算出プロパティ（computed properties）や通常のメソッドを拡張として宣言することを検討してください。
デフォルトでは、通常のプロパティ、オーバーライド、およびオーバーロードされた演算子のみをメンバーとして宣言する必要があります。

## 引数として Boolean 型を使用することを避ける

次の関数を考えてみましょう。

```kotlin
fun doWork(optimizeForSpeed: Boolean) { ... }
```

この関数をAPIで提供した場合、次のように呼び出される可能性があります。

```kotlin
doWork(true)
doWork(optimizeForSpeed=true)
```

最初の呼び出しでは、IDEでパラメーター名ヒント（Parameter Name Hints）を有効にしてコードを読んでいない限り、Boolean 引数が何のためのものかを推測することは不可能です。
名前付き引数を使用すれば意図は明確になりますが、ユーザーにこのスタイルを強制する方法はありません。
その結果、可読性を向上させるために、コードでは引数として Boolean 型を使用すべきではありません。

代わりに、API は Boolean 引数によって制御されていたタスク専用の個別の関数を作成できます。
この関数には、何を行うかを示す説明的な名前を付ける必要があります。

たとえば、[`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/) インターフェースには以下の拡張機能が用意されています。

```kotlin
fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>
fun <T, R : Any> Iterable<T>.mapNotNull(
    transform: (T) -> R?
): List<R>
```

これは、次のような単一のメソッドの代わりになります。

```kotlin
fun <T, R> Iterable<T>.map(
    includeNullResults: Boolean = true, 
    transform: (T) -> R
): List<R>
```

もう一つの良いアプローチは、`enum` クラスを使用して異なる操作モードを定義することです。
このアプローチは、いくつかの操作モードがある場合や、それらのモードが時間の経過とともに変化することが予想される場合に役立ちます。

## 数値型を適切に使用する

Kotlin は、API の一部として使用できる一連の数値型を定義しています。それらを適切に使用する方法は以下の通りです。

* `Int`、`Long`、`Double` 型を算術型として使用します。これらは、計算が実行される値を表します。
* 非算術的なエンティティに算術型を使用することは避けてください。たとえば、ID を `Long` として表すと、ユーザーは ID が順番に割り当てられているという仮定に基づいて、ID を比較したくなるかもしれません。これは信頼性の低い、あるいは無意味な結果を招いたり、警告なしに変更される可能性のある実装への依存を生み出したりする可能性があります。より良い戦略は、ID の抽象化のために専用のクラスを定義することです。[インライン値クラス](inline-classes.md) (Inline value classes) を使用すれば、パフォーマンスに影響を与えずにそのような抽象化を構築できます。例として [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) クラスを参照してください。
* `Byte`、`Float`、`Short` 型はメモリレイアウト型です。これらは、キャッシュやネットワーク経由でデータを送信する場合など、値を格納するために使用可能なメモリ量を制限するために使用されます。これらの型は、基礎となるデータが確実にその型に収まり、計算が必要ない場合にのみ使用されるべきです。
* 符号なし整数型 `UByte`、`UShort`、`UInt`、`ULong` は、特定のフォーマットで利用可能な正の値の全範囲を利用するために使用されるべきです。これらは、符号付き型の範囲を超える値を必要とするシナリオや、ネイティブライブラリとの相互運用性に適しています。ただし、ドメインが[非負の整数](unsigned-integer-types.md#non-goals)のみを必要とするような状況での使用は避けてください。

## 次のステップ

ガイドの次のパートでは、一貫性（consistency）について学びます。

[次のパートへ進む](api-guidelines-consistency.md)