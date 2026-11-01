---
title: 注入パラメータ (Injected Parameters)
---

# 注入パラメータ (Injected Parameters)

一部のオブジェクトは、ユーザーIDや現在の画面など、呼び出し元だけが知っている値を必要とします。注入パラメータ（Injected parameters）を使用すると、呼び出し元がKoinにインスタンスを要求する際にこれらの値を渡すことができます。このページでは、定義内でパラメータを宣言する方法、それを渡す方法、そしてKoinが値をパラメータにどのようにマッチングするかについて解説します。なお、定義の宣言方法を理解していることを前提としています（[定義 (Definitions)](/docs/reference/koin-core/definitions) を参照）。

## パラメータの宣言と受け渡し {id="declare-and-pass-a-parameter"}

どのコンストラクタパラメータが呼び出し元から渡されるかを指定します。その他のパラメータは通常どおりコンテナから解決されます。

**コンパイラプラグインDSL**
```kotlin
import org.koin.core.annotation.InjectedParam

class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)

val appModule = module {
    single<UserRepository>()
    factory<UserPresenter>()
}
```

`@InjectedParam` は `koin-annotations` アーティファクトから提供されます。これにより、`userId` が定義ではないことをコンパイラプラグインに伝え、ビルド時のチェックで不足していると報告されないようにします。

**アノテーション**
```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)
```

`@InjectedParam` はプロバイダ関数のパラメータに対しても機能します。

**コンストラクタ / クラシックDSL**
定義ラムダはパラメータを `params` として受け取ります。

```kotlin
val appModule = module {
    singleOf(::UserRepository)
    factory { params -> UserPresenter(userId = params.get(), repository = get()) }
}
```

呼び出し元は、パラメータと同じ順序で `parametersOf()` を使用して値を渡します。

```kotlin
import org.koin.core.parameter.parametersOf

val presenter: UserPresenter = get { parametersOf("user-42") }

// または遅延取得
val presenter: UserPresenter by inject { parametersOf("user-42") }
```

パラメータブロックはラムダであるため、値はインスタンスが作成されるときに読み取られます。`by inject()` を使用する場合、これは初回アクセス時になります。

注入パラメータは `factory` 定義を対象としています。`single` は1度だけ作成されるため、初回に渡された値が使用され、以降の値は無視されます。

各プラットフォームのAPIも同じブロックを受け取ります。Composeでは `koinInject { parametersOf(userId) }`（[Koin for Compose](/docs/reference/koin-compose/compose) を参照）、ViewModelでは `by viewModel { parametersOf(userId) }` または `koinViewModel { parametersOf(userId) }` となります（[ViewModel](/docs/reference/koin-core/viewmodel) を参照）。

## 複数のパラメータ {id="several-parameters"}

**コンパイラプラグインDSL**
```kotlin
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)

val appModule = module {
    factory<OrderPresenter>()
}
```

**アノテーション**
```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)
```

**コンストラクタ / クラシックDSL**
ラムダ内でパラメータを分割代入します。

```kotlin
val appModule = module {
    factory { (userId: String, orderId: Long) ->
        OrderPresenter(userId, orderId, get())
    }
}
```

または、`params[i]` や `params.get<T>(i)` を使ってインデックスで読み取ることもできます。

```kotlin
val appModule = module {
    factory { params -> OrderPresenter(params[0], params[1], get()) }
}
```

分割代入は最大5つの値に制限されており、宣言された型は呼び出し元が渡した値に対してチェックされません。順序が間違っている場合、キャストは実行時に失敗します。

```kotlin
val presenter: OrderPresenter = get { parametersOf("user-42", 1001L) }
```

## Koinが値をマッチングする仕組み {id="how-koin-matches-values"}

`params.get<T>()` および生成されたコードは、以下のルールに基づいて各値を検索します。

- Koinはまず現在の位置にある値を確認します。要求された型と一致する場合、Koinはその値を返して次の位置に進みます。
- 一致しない場合、Koinはどこにあっても要求された型の最初の値を返します。
- `params.getOrNull<T>()` はその型の値が渡されなかった場合に `null` を返します。`get<T>()` は `DefinitionParameterException` をスローします。

実際には、コンストラクタの順序で値を渡します。`parametersOf("user-42", 1001L)` は `userId`、続いて `orderId` を設定し、2つの `String` パラメータは順序どおりに2つの `String` 値を受け取ります。

特定の動作のみが必要な場合は、別の関数を使用してパラメータを構築します。

| 関数 | マッチング方法 |
|----------|----------|
| `parametersOf(...)` | 位置を優先、その後に型（デフォルト、上記のルール） |
| `parameterArrayOf(...)` | 位置のみ。現在の位置の値が要求された型である必要があります |
| `parameterSetOf(...)` | 型のみ。すべての `get<T>()` はその型の最初の値を返します |

```kotlin
val byIndex = parameterArrayOf(1, 2, 3)
byIndex.get<Int>() // 1
byIndex.get<Int>() // 2

val byType = parameterSetOf("a_string", 42)
byType.get<Int>()    // 42
byType.get<Int>()    // 42
```

## パラメータから解決される値 {id="values-resolved-from-parameters"}

Koinがパラメータを指定してインスタンスを作成する場合、定義内の通常の `get()` はコンテナよりも前に渡された値をチェックします。マークされていないパラメータであっても、渡された値を受け取ることができます。

```kotlin
val appModule = module {
    factory { UserPresenter(userId = get(), repository = get()) }
}

get<UserPresenter> { parametersOf("user-42") } // userId = "user-42"
```

これは依存関係のさらに奥にある依存先に対しても機能します。たとえば、`UserPresenter` が画面名を必要とする `Tracker` を必要としている場合、プレゼンター用に渡された値が `Tracker` の定義にまで到達することが可能です。

いずれにしても、`@InjectedParam` または `params.get()` の使用をお勧めします。これらを使用することで値がどこから来るのかが明確になり、コンパイラプラグインがグラフの残りの部分をチェックできるようになります。

:::warning
渡された値が要求された定義と同じ型を持つ場合、Koinはその値を直接返し、定義を実行しません。`get<String> { parametersOf("x") }` は `"x"` を返します。定義の型と競合する場合は、そのようなパラメータを独自の型（value class など）でラップしてください。
:::

`get(named("local"))` のような修飾子付きのリクエストは、パラメータから値を取得することは決してありません。パラメータには修飾子（qualifier）が付与されないためです。

## 関連情報 {id="related"}

- [インジェクション (Injection)](/docs/reference/koin-core/injection): パラメータを渡す場所である `get()` と `inject()` について。
- [定義 (Definitions)](/docs/reference/koin-core/definitions#constructor-parameters): その他のコンストラクタパラメータがどのように解決されるかについて。
- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModelのパラメータと `SavedStateHandle` について。
- [修飾子 (Qualifiers)](/docs/reference/koin-core/qualifiers): 値を渡す代わりに定義を選択する方法について。
- [アノテーションリファレンス](/docs/reference/koin-annotations/annotations-inventory): `@InjectedParam` およびその他のパラメータアノテーションについて。