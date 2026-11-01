---
title: Ktor のテスト
---

# Ktor のテスト

このページでは、Koin を使用する Ktor サーバーのテストについて解説します。`testApplication` を使用したルートの実行、テストモジュールによる定義の置き換え、およびテスト間の分離（アイソレーション）について取り上げます。前提として、[Ktor への Koin のインストール](/docs/reference/koin-ktor/ktor) を理解しているものとします。HTTP レイヤーを伴わないプレーンなクラスのテストについては、[ユニットテスト](/docs/reference/koin-test/testing) の手法を使用してください。

## 依存関係 {id="dependencies"}

```kotlin
dependencies {
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("io.insert-koin:koin-test")
    testImplementation("io.insert-koin:koin-test-junit4") // または koin-test-junit5
}
```

## testApplication でルートを実行する {id="run-routes-with-testapplication"}

`install(Koin)` は、本番環境と同様に `testApplication` 内でも動作します。テストモジュールとともにインストールし、ルートを追加します。

**Compiler Plugin DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.withConfiguration

class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                withConfiguration<MyApp>()
                modules(testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

**Constructor / Classic DSL**
```kotlin
class UserRoutesTest {

    @Test
    fun `returns a user`() = testApplication {
        application {
            install(Koin) {
                modules(appModule, testModule)
            }
            configureRouting()
        }

        val response = client.get("/users/1")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

```kotlin
val testModule = module {
    single<UserRepository> { InMemoryUserRepository(User("1", "Alice")) }
}
```

テストモジュールは最後にロードされるため、その `UserRepository` が本番用のものを置き換えます（[定義](/docs/reference/koin-core/definitions#overriding-a-definition) を参照）。このようなラムダ定義は、どのスタイルでも機能します。

ルートは本番環境と同様に、`org.koin.ktor.ext` の `inject()` および `get()` を使用して依存関係を解決します。`testApplication` が終了すると、Ktor はアプリケーションを停止し、Koin プラグインはそのコンテナをクローズします。

## アプリケーションモジュールを再利用する {id="reuse-your-application-module"}

本番用の `Application.module()` で Koin をインストールしている場合は、テスト内でそれを呼び出し、`koinModules()` でオーバーライドを追加します。

```kotlin
// 本番環境
fun Application.module() {
    install(Koin) {
        modules(appModule)
    }
    configureRouting()
}

// テスト
@Test
fun `returns a user`() = testApplication {
    application {
        module()
        koinModules(testModule)
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`koinModules()` は、`install(Koin)` によって作成されたコンテナにモジュールをロードします。Ktor プラグインは一度しかインストールできないため、テスト内で2回目の `install(Koin)` を行うと失敗します。

`koinModules()` は `install(Koin)` の後にオーバーライドをロードします。インストール時に作成された定義（例えば `createdAtStart` を使用したもの）は、本番用の依存関係を保持したままになります。

## テストを分離する {id="isolate-tests"}

`install(Koin)` はグローバルコンテキストで Koin を起動します。コンテナが既に実行されている場合、プラグインはまずそれを停止します。順次実行されるテストであれば問題ありませんが、同時に実行される2つのテストはグローバルコンテキストを共有するため、互いに干渉して失敗する原因となります。

アプリケーションがシャットダウンする前にテストが失敗した場合でも、各テストの後に Koin を停止できるようにするには、`AutoCloseKoinTest` を継承します。

```kotlin
class UserRoutesTest : AutoCloseKoinTest() {
    // テスト
}
```

並行して実行されるテストには、代わりに `KoinIsolated` をインストールします。各アプリケーションはグローバルコンテキストの外側にある独自のコンテナを取得します。

```kotlin
@Test
fun `returns a user`() = testApplication {
    application {
        install(KoinIsolated) {
            modules(appModule, testModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users/1").status)
}
```

`KoinIsolated` では、Ktor の拡張機能（`inject()`、`get()`、`call.scope`）を通じて依存関係を解決します。`KoinComponent` や `GlobalContext.get()` からは、分離されたコンテナを参照できません。[Ktor での分離されたコンテキスト](/docs/reference/koin-ktor/ktor-isolated) を参照してください。

## 依存関係をモックする {id="mock-a-dependency"}

モックをテストモジュールに配置します。

```kotlin
@Test
fun `returns 404 for an unknown user`() = testApplication {
    val repository = mockk<UserRepository> {
        every { findById(any()) } returns null
    }

    application {
        install(Koin) {
            modules(appModule, module { single { repository } })
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.NotFound, client.get("/users/999").status)
    verify { repository.findById("999") }
}
```

`declareMock`（[declareMock によるモック](/docs/reference/koin-test/testing#mocking-with-declaremock) を参照）も、グローバルコンテキストを使用するため `install(Koin)` と一緒に動作します。ただし、`KoinIsolated` では動作しません。

## リクエストスコープ {id="request-scope"}

`requestScope { }` で宣言された定義は、呼び出し（call）ごとに作成され、レスポンスが送信されるとクローズされます（[Ktor のリクエストスコープ](/docs/reference/koin-ktor/ktor-scopes) を参照）。これらをリクエストを通じてテストします。

```kotlin
@Test
fun `each call gets its own request logger`() = testApplication {
    application {
        install(Koin) {
            modules(module {
                requestScope {
                    scoped { RequestLogger() }
                }
            })
        }
        routing {
            get("/id") {
                call.respondText(call.scope.get<RequestLogger>().id)
            }
        }
    }

    val first = client.get("/id").bodyAsText()
    val second = client.get("/id").bodyAsText()
    assertNotEquals(first, second)
}
```

`call.scope` は、呼び出しの処理中のみ存在します。ルートの外部でリクエストスコープの定義を解決しようとすると失敗します。

## Ktor DI ブリッジ {id="ktor-di-bridge"}

[Ktor DI ブリッジ](/docs/reference/koin-ktor/ktor-bridge) が有効になっている場合、本番環境と同じように、テストアプリケーション内で Ktor の `dependencies { }` を使用してテスト用の値を提供します。`koinToKtor()` により、Koin の定義からそれらを解決できるようになります。

```kotlin
@Test
fun `uses the Ktor-provided database`() = testApplication {
    application {
        dependencies {
            provide<Database> { InMemoryDatabase() }
        }
        install(Koin) {
            bridge { koinToKtor() }
            modules(appModule)
        }
        configureRouting()
    }

    assertEquals(HttpStatusCode.OK, client.get("/users").status)
}
```

## 設定の検証 {id="check-your-configuration"}

サーバーを起動せずに、すべての定義の依存関係が宣言されているか検証するには、[設定の検証](/docs/reference/koin-test/verify) を参照してください。リクエストスコープ内の `ApplicationCall` など、実行時に Ktor から提供される型は `extraTypes` に指定します。

## 関連情報 {id="related"}

- [Ktor 向け Koin](/docs/reference/koin-ktor/ktor): プラグインのインストールとルートでのインジェクション。
- [Ktor での分離されたコンテキスト](/docs/reference/koin-ktor/ktor-isolated): `KoinIsolated` とその使用タイミング。
- [Ktor のリクエストスコープ](/docs/reference/koin-ktor/ktor-scopes): 呼び出しにバインドされた定義。
- [ユニットテスト](/docs/reference/koin-test/testing): `KoinTest`、オーバーライド、および `declareMock`。
- [設定の検証](/docs/reference/koin-test/verify): テスト内でのモジュールの検証。