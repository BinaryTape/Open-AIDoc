---
title: JUnit テスト
---

# JUnit テスト

このチュートリアルでは、[Kotlin チュートリアル](/docs/quickstart/kotlin)のアプリに対して JUnit 4 テストを作成します。`KoinTestRule` を使用して各テストで Koin を起動する方法、`verify()` でモジュールをチェックする方法、そして依存関係を Mockito のモックに置き換える方法を学びます。所要時間は約10分です。まず Kotlin チュートリアルを完了するか、そのサンプルから開始してください。

このチュートリアルは Compiler Plugin DSL アプリに準拠しています。すべてのテスト API については、[Unit Testing](/docs/reference/koin-test/testing) で解説されています。

## コードの取得 {id="get-the-code"}

テストは [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin) サンプルの `app/src/test` に配置されています。リポジトリをクローンし、`kotlin` フォルダーからテストを実行してください。

```bash
./gradlew test
```

## Gradle のセットアップ {id="gradle-setup"}

サンプルでは、テスト依存関係として `koin-test`、`koin-test-junit4`、および Mockito を追加しています。

```toml
# gradle/libs.versions.toml
[versions]
koin = "<KOIN_VERSION>"
mockito = "<MOCKITO_VERSION>"

[libraries]
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
mockito = { module = "org.mockito:mockito-inline", version.ref = "mockito" }
```

```kotlin
// app/build.gradle.kts
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.mockito)
}
```

`koin-test` はモックライブラリに依存していないため、使用するものを個別に追加します。JUnit 5 の場合は、代わりに `koin-test-junit5` を使用してください（[Unit Testing](/docs/reference/koin-test/testing) を参照）。

## テスト対象のモジュール {id="the-module-under-test"}

テストでは、Kotlin チュートリアルのモジュールを読み込みます。

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

各テストはこのモジュールを使用して Koin を起動するため、アプリと同じ依存関係グラフに対して実行されます。

## モジュールを検証する {id="let-s-verify-the-module"}

`verify()` は、インスタンスを一切生成することなく、モジュール内のすべてのコンストラクタパラメータに対応する定義が存在するかどうかをチェックします。

```kotlin
import org.koin.test.AutoCloseKoinTest
import org.koin.test.verify.verify

class ModuleVerificationTest : AutoCloseKoinTest() {

    @Test
    fun verifyModules() {
        appModule.verify()
    }
}
```

定義が不足しているか無効な場合、テストは失敗します。Compiler Plugin はすでにビルド時にこのチェックを実行するため、`verify()` はプラグインがカバーしていないモジュールで特に重要となります。これが必要かどうかを判断するには、[Verifying your Configuration](/docs/reference/koin-test/verify) を参照してください。

## テストで Koin を起動する {id="let-s-start-koin-in-a-test"}

`KoinTest` を実装し、`KoinTestRule` を追加します。このルールは各テストの前に Koin を起動し、テスト終了後に停止します。

```kotlin
import org.koin.test.KoinTest
import org.koin.test.KoinTestRule

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }
}
```

`KoinTest` により、テストクラスで `get()` や `by inject()`（例: `val userService: UserService by inject()`）が利用可能になります。テストごとに新しいコンテナを起動することで、テスト間でのインスタンスのリークを防ぎます。

## 依存関係をモックする {id="let-s-mock-a-dependency"}

Koin にモックの作成方法を指示するための `MockProviderRule` を追加し、`declareMock` で `UserRepository` を置き換えます。

```kotlin
import org.koin.test.mock.MockProviderRule
import org.koin.test.mock.declareMock
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.mockito.Mockito.times

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz -> Mockito.mock(clazz.java) }

    @Test
    fun `mock test`() {
        val service = declareMock<UserRepository> {
            given(findUserOrNull(anyString())).willReturn(User("Mock", "mock@example.com"))
        }

        getKoin().get<UserApplication>().sayHello("Mock")
        Mockito.verify(service, times(1)).findUserOrNull(anyString())
    }
}
```

`declareMock` は、このテストに限り `UserRepository` の定義を置き換えます。`UserApplication` と `UserService` は本物のインスタンスであるため、このテストでは呼び出しが `UserService` を経由してリポジトリに1回渡されることを検証します。

## 次のステップ {id="next-steps"}

- [Unit Testing](/docs/reference/koin-test/testing): すべてのテスト API、JUnit 5、および定義のオーバーライド。
- [Verifying your Configuration](/docs/reference/koin-test/verify): `verify()` のオプションと、Compiler Plugin が代替となるケースについて。
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koin を使用した Android アプリのテスト。
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing): Koin を使用した Ktor ルートのテスト。
- [Tooling](/docs/tooling): Koin 向けの IDE プラグインおよびモニタリングツール。