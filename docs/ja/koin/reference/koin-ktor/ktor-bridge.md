---
title: Ktor DI Bridge
---

# Ktor DI Bridge

Ktor 3.4 には、独自の依存関係注入（DI）プラグイン（`dependencies { provide<T> { } }` および `by dependencies`）が同梱されています。このページでは、Koin プラグインの `bridge { }` オプションを使用して、Ktor DI と Koin を一方向または双方向に連携させる方法について説明します。[Koin for Ktor](/docs/reference/koin-ktor/ktor) に記載されている手順に従って Koin プラグインをインストールしておく必要があります。

このブリッジは Koin 4.2 以降で利用可能です。その関数には `@KoinExperimentalAPI` が付与されています。

## ブリッジの設定 {id="configuring-the-bridge"}

```kotlin
fun Application.module() {
    install(Koin) {
        slf4jLogger()
        bridge {
            ktorToKoin()
            koinToKtor()
        }
        modules(appModule)
    }

    dependencies {
        provide<KtorSpecificService> { KtorSpecificServiceImpl() }
    }
}
```

| オプション | 効果 |
|---|---|
| `ktorToKoin()` | Ktor の `by dependencies` で Koin の定義を解決可能 |
| `koinToKtor()` | Koin の `get()`、`inject()`、およびコンストラクタインジェクションで Ktor DI の依存関係を解決可能 |

使用する方向のみを有効にしてください。

## Ktor から Koin の定義を解決する {id="ktor-resolving-from-koin"}

`ktorToKoin()` を使用すると、プラグインは Koin を基盤とする依存関係マップを備えた Ktor の `DI` プラグインをインストールします。

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { ktorToKoin() }
        modules(module {
            single<HelloService> { HelloServiceImpl() }
        })
    }

    routing {
        get("/hello") {
            val helloService: HelloService by dependencies // Koin で宣言
            call.respondText(helloService.sayHello())
        }
    }
}
```

名前付きの Ktor 依存関係キーは、同じ値を持つ Koin の `named()` クオリファイアにマッピングされます。

## Koin から Ktor DI の依存関係を解決する {id="koin-resolving-from-ktor-di"}

`koinToKtor()` を使用すると、Koin に解決拡張が追加されます。ある型に対する Koin 定義が存在しない場合、Koin は Ktor DI にその解決を要求します。

```kotlin
fun Application.module() {
    install(Koin) {
        bridge { koinToKtor() }
        modules(appModule)
    }

    dependencies {
        provide<DatabaseConnection> { DatabaseConnectionImpl() }
    }

    routing {
        get("/data") {
            val database: DatabaseConnection by inject() // Ktor DI で宣言
            call.respondText(database.query())
        }
    }
}
```

Koin 定義では、Ktor DI の型をコンストラクタパラメータとして受け取ることもできます。Koin のクオリファイアは、依存関係名として Ktor に渡されます。Ktor DI にも該当する依存関係が存在しない場合、Koin は警告をログに出力し、通常の定義欠落時と同様に解決に失敗します。

## インフラストラクチャとアプリケーションコードの分離 {id="splitting-infrastructure-and-application-code"}

一般的な分離パターンとして、フレームワークレベルのオブジェクトを Ktor DI に保持し、アプリケーションクラスを Koin に保持して、`koinToKtor()` のみを有効にする構成があります。

```kotlin
fun Application.module() {
    // Ktor DI: インフラストラクチャ
    val database = Database(environment.config)
    dependencies {
        provide<Database> { database }
        provide<ApplicationConfig> { environment.config }
    }

    // Koin: アプリケーションクラス
    install(Koin) {
        slf4jLogger()
        bridge { koinToKtor() }
        modules(appModule)
    }
}

val appModule = module {
    singleOf(::CustomerRepository) // Ktor DI から Database を受け取る
    singleOf(::CustomerService)
}
```

## 制限事項 {id="limits"}

- **コンパイル時のチェック**: Koin Compiler Plugin は Ktor DI の宣言を認識しません。コンパイル時セーフティ機能によって Ktor DI の型が見つからないと報告された場合は、[コンパイル時セーフティ（Compile-Time Safety）](/docs/reference/koin-compiler/compile-safety) に記載されているように、その型に `@Provided` を付与してください。
- **KoinIsolated**: Koin 4.2 では、`KoinIsolated` プラグインは `bridge { }` ブロックを受け入れますが、適用されません。ブリッジが必要な場合は `install(Koin)` を使用してください。
- **実験的機能**: ブリッジ API は将来のリリースで変更される可能性があります。

## 関連情報 {id="related"}

- [Koin for Ktor](/docs/reference/koin-ktor/ktor): プラグインのインストールとルーティングでのインジェクション。
- [Ktor における Isolated Context](/docs/reference/koin-ktor/ktor-isolated): グローバルコンテキスト外での Koin の利用。
- [リクエストスコープ（Request Scopes）](/docs/reference/koin-ktor/ktor-scopes): コールごとのインスタンス。
- [Ktor dependency injection](https://ktor.io/docs/server-dependency-injection.html): Ktor 独自の DI プラグイン。