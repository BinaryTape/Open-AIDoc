---
title: JUnit 測試
---

# JUnit 測試

在本教學中，你將為來自 [Kotlin 教學](/docs/quickstart/kotlin) 的應用程式撰寫 JUnit 4 測試。你將學習如何使用 `KoinTestRule` 為每個測試啟動 Koin、使用 `verify()` 檢查模組，以及使用 Mockito mock 替換相依項。這大約需要 10 分鐘。請先完成 Kotlin 教學，或是直接從其範例開始。

本教學以 Compiler Plugin DSL 應用程式為基礎。所有測試 API 均於[單元測試](/docs/reference/koin-test/testing)中說明。

## 取得程式碼 {id="get-the-code"}

測試位於 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin) 範例的 `app/src/test` 目錄下。複製該存儲庫並在 `kotlin` 資料夾中執行它們：

```bash
./gradlew test
```

## Gradle 設定 {id="gradle-setup"}

該範例將 `koin-test`、`koin-test-junit4` 和 Mockito 新增為測試相依性：

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

`koin-test` 不相依於任何 mocking 程式庫，因此你需要自行新增所使用的程式庫。若使用 JUnit 5，請改用 `koin-test-junit5`（請參閱[單元測試](/docs/reference/koin-test/testing)）。

## 受測模組 {id="the-module-under-test"}

測試會載入來自 Kotlin 教學的模組：

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

每個測試都會使用此模組啟動 Koin，因此它會在與應用程式相同的圖（graph）中執行。

## 驗證模組 {id="let-s-verify-the-module"}

`verify()` 會檢查模組中的每個建構函式參數是否都有定義，而無需建立任何執行個體：

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

若缺少定義或定義無效，測試將會失敗。Compiler 外掛程式在組建期就已經執行了這項檢查，因此 `verify()` 主要適用於該外掛程式未涵蓋的模組。請參閱[驗證你的配置](/docs/reference/koin-test/verify)以決定是否需要它。

## 在測試中啟動 Koin {id="let-s-start-koin-in-a-test"}

實作 `KoinTest` 並新增 `KoinTestRule`。該規則會在每個測試之前啟動 Koin，並在測試之後將其停止：

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

`KoinTest` 為測試類別提供了 `get()` 和 `by inject()`，例如 `val userService: UserService by inject()`。為每個測試啟動全新的容器可防止執行個體在測試之間洩漏。

## Mock 相依項 {id="let-s-mock-a-dependency"}

新增 `MockProviderRule` 以告知 Koin 如何建立 mock，接著使用 `declareMock` 替換 `UserRepository`：

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

`declareMock` 僅針對此測試替換 `UserRepository` 的定義。`UserApplication` 和 `UserService` 均為真實物件，因此該測試會檢查呼叫是否透過 `UserService` 傳遞至 repository 一次。

## 後續步驟 {id="next-steps"}

- [單元測試](/docs/reference/koin-test/testing)：完整的測試 API、JUnit 5 以及覆寫定義。
- [驗證你的配置](/docs/reference/koin-test/verify)：`verify()` 的選項以及 Compiler 外掛程式在何時能取代它。
- [插樁測試](/docs/reference/koin-android/instrumented-testing)：測試使用 Koin 的 Android 應用程式。
- [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)：使用 Koin 測試 Ktor 路由。
- [工具支援](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。