---
title: コンテキストの分離 (Context Isolation)
---

# コンテキストの分離 (Context Isolation)

分離されたコンテキスト（Isolated Context）は、グローバルコンテキストに登録されていない Koin コンテナです。このページでは、SDK やライブラリ用に分離されたコンテキストを作成する方法、クラスがそこから依存関係を解決するようにする方法、およびそれをテストする方法について説明します。なお、[Koin の起動方法](/docs/reference/koin-core/starting-koin) を理解していることを前提としています。

## なぜ分離するのか {id="why-isolate"}

`startKoin` は、1つのコンテナをグローバルコンテキスト（`GlobalContext`）に登録します。すべての `KoinComponent` およびすべての `by inject()` はそこから読み取りを行い、2回目の `startKoin` 呼び出しは `KoinApplicationAlreadyStartedException` で失敗します。

もしライブラリが `startKoin` を呼び出すと、その単一のスロットを巡ってホストアプリケーションと競合し、ライブラリの定義がアプリの定義を上書きしてしまう可能性があります。代わりに、ライブラリは `koinApplication` を使用して独自のコンテナを作成し、それを非公開（private）にしておくべきです。

## 分離されたコンテキストの作成 {id="creating-an-isolated-context"}

`koinApplication` は、グローバルに登録することなく、`startKoin` と同じ DSL でコンテナを構築します。これを SDK の `object` 内に保持します。

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

internal val sdkModule = module {
    single<SdkRepository>()
    single<SdkService>()
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.koinApplication

@Module
@ComponentScan("com.example.sdk")
internal class SdkModule

@KoinApplication(modules = [SdkModule::class])
internal object SdkApplication

internal object SdkKoinContext {
    val koinApp = koinApplication<SdkApplication>()
    val koin = koinApp.koin
}
```

`koinApplication<T>()` は、`startKoin<T>()` と同様に `@KoinApplication` クラスのモジュールをロードしますが、コンテナをグローバルには登録しません。SDK コンテナがホストアプリの `@Configuration` モジュールを取り込まないように、SDK モジュールを明示的に指定してください。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.core.module.dsl.*

internal val sdkModule = module {
    singleOf(::SdkRepository)
    singleOf(::SdkService)
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

この `object` は、初回アクセス時にコンテナを作成します。起動と停止のタイミングを制御したい場合（SDK API に `init()` や `shutdown()` を用意する場合など）、関数内で作成し、シャットダウン時に `koinApp.close()` を呼び出します。

## 分離されたコンテキストからの解決 {id="resolving-from-the-isolated-context"}

`KoinComponent` はデフォルトでグローバルコンテキストから読み取ります。`internal` なインターフェースで `getKoin()` をオーバーライドし、SDK のクラスでそのインターフェースを使用します。

```kotlin
internal interface SdkKoinComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koin
}

class SdkClient : SdkKoinComponent {
    // ホストアプリからではなく、SdkKoinContext から解決される
    private val service: SdkService by inject()
}
```

Koin によって作成されたクラスは、自身を作成したコンテナから、コンストラクタ経由で依存関係を取得します。`SdkKoinComponent` が必要なのは、SDK のエントリポイント（ホストアプリがインスタンス化するクラス）のみです。

## テスト {id="testing"}

テストでは、`getKoin()` が分離されたコンテキストを指すようにし、そこにテストモジュールをロードします。

```kotlin
class SdkClientTest : KoinTest {

    private val testModule = module {
        single<SdkService> { FakeSdkService() }
    }

    override fun getKoin(): Koin = SdkKoinContext.koin

    @Before
    fun setUp() {
        getKoin().loadModules(listOf(testModule))
    }

    @After
    fun tearDown() {
        getKoin().unloadModules(listOf(testModule))
    }
}
```

`testModule` は `sdkModule` の後にロードされるため、その `SdkService` が実際の実装を上書きします。テストの詳細については [Testing](/docs/reference/koin-test/testing) を参照してください。

## プラットフォームのサポート {id="platform-support"}

Compose と Ktor には、分離されたコンテキストを使用するための独自の API が用意されています。

- **Compose**: `KoinIsolatedContext` は、Composable ツリーに分離されたコンテナを提供します。[Isolated Context in Compose](/docs/reference/koin-compose/isolated-context) を参照してください。
- **Ktor**: `KoinIsolated` プラグインは、独自のコンテナでサーバーを実行します。[Isolated Context in Ktor](/docs/reference/koin-ktor/ktor-isolated) を参照してください。

## 制限事項 {id="limits"}

- **グローバルヘルパーは利用不可**: `GlobalContext.get()`、`KoinPlatform.getKoin()`、あるいは Android の Activity 内のデフォルトの `by inject()` など、グローバルコンテキストを使用するトップレベル関数は分離されたコンテナを参照しません。代わりに作成した `SdkKoinComponent` を使用してください。
- **ライフサイクルの管理は自身で行う**: Koin は分離されたコンテキストを自動でクローズしません。SDK がシャットダウンする際に `koinApp.close()` を呼び出してください。
- **デフォルトでは共有されない**: 分離されたコンテナはホストアプリの定義を参照しません。ホストから必要なものがある場合は、`init(context)` など、SDK の API 経由で渡すようにしてください。

## 関連情報 {id="related"}

- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin`、`koinApplication`、およびアプリケーション DSL。
- [Koin Component](/docs/reference/koin-core/koin-component): `KoinComponent` と `getKoin()`。
- [Isolated Context in Compose](/docs/reference/koin-compose/isolated-context): `KoinIsolatedContext`。
- [Isolated Context in Ktor](/docs/reference/koin-ktor/ktor-isolated): `KoinIsolated` プラグイン。
- [Testing](/docs/reference/koin-test/testing): `KoinTest` とテストモジュール。