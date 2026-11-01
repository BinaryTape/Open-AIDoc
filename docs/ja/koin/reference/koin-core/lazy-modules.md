---
title: Lazyモジュール
---

# Lazy Modules

Lazyモジュール（遅延モジュール）とは、Koinが `startKoin` 実行中ではなく、バックグラウンドのコルーチンで登録するモジュールのことです。このページでは、Lazyモジュールの宣言、並列読み込み、完了の待機、および本機能の制限事項について説明します。なお、本ページは[モジュール](/docs/reference/koin-core/modules)と[Koinの起動](/docs/reference/koin-core/starting-koin)について理解していることを前提としています。

## 依存関係 {id="dependency"}

Lazyモジュールは `koin-core-coroutines` アーティファクトに含まれています。

```kotlin
// build.gradle.kts
implementation("io.insert-koin:koin-core-coroutines")
```

## Lazyモジュールの宣言 {id="declaring-a-lazy-module"}

`lazyModule` は `module` と同様の内容を受け取ります。Koinが読み込むまで、何も作成または割り当てられません。

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.plugin.module.dsl.*

val analyticsModule = lazyModule {
    single<AnalyticsService>()
    single<EventTracker>()
}
```

**アノテーション**
アノテーションモジュール（`@Module`）は起動時に読み込まれ、遅延（lazy）として宣言することはできません。一部の定義をバックグラウンドで読み込むには、いずれかのDSL形式（Compiler Plugin、Constructor、またはClassic DSL）を使用して `lazyModule` 内で宣言してください。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.core.module.dsl.*

val analyticsModule = lazyModule {
    singleOf(::AnalyticsService)
    singleOf(::EventTracker)
}
```

Lazyモジュールには、他のLazyモジュールを含めることができます。

```kotlin
val dataModule = lazyModule {
    single<UserRepository>()
}

val featureModule = lazyModule {
    includes(dataModule)
    single<FeatureService>()
}
```

## Lazyモジュールの読み込み {id="loading-lazy-modules"}

`startKoin` 内の `lazyModules()` にLazyモジュールを渡します。`modules()` に渡されたモジュールは呼び出し元スレッドで読み込まれ、`startKoin` が復帰する前に完了します。一方、Lazyモジュールはバックグラウンドのコルーチンで読み込まれます。

```kotlin
startKoin {
    modules(coreModule)
    lazyModules(analyticsModule, reportingModule)
}
```

Koin 4.2以降では、各Lazyモジュールが独自のコルーチンで読み込まれるため、複数のLazyモジュールが並列に読み込まれます。4.2より前は順次読み込まれていました。

`lazyModules()` は必要に応じてKoinのコルーチンエンジンをセットアップします。これはプラットフォームのデフォルトディスパッチャ（JVMおよびNativeでは `Dispatchers.Default`）上で実行されます。別のディスパッチャを選択するには、`dispatcher` を渡します。

```kotlin
startKoin {
    lazyModules(databaseModule, networkModule, dispatcher = Dispatchers.IO)
}
```

ディスパッチャは、最初の `lazyModules()` 呼び出しによってコルーチンエンジンが作成される際に設定されます。以降の呼び出しで渡された `dispatcher` は効果がありません。

## Lazyモジュールの待機 {id="waiting-for-lazy-modules"}

Lazyモジュールの定義は、そのモジュールが読み込まれるまで利用できません。解決（resolve）する前に、読み込みが完了するのを待機してください。

| 関数 | プラットフォーム | 動作 |
|----------|----------|----------|
| `Koin.awaitAllStartJobs()` | すべて | すべてのLazyモジュールが読み込まれるまでサスペンドします |
| `Koin.onKoinStarted { koin -> }` | すべて | 読み込みが完了するまでサスペンドし、その後にブロックを実行します |
| `Koin.waitAllStartJobs()` | すべて | 読み込みが完了するまでスレッドをブロックします。JSではブロックせず警告をログに出力します |
| `Koin.runOnKoinStarted { koin -> }` | JVM | 読み込みが完了するまでブロックし、その後にブロックを実行します |
| `Koin.isAllStartedJobsDone()` | すべて | すべてのLazyモジュールが読み込まれている場合に `true` を返します |

コルーチンから呼び出す場合:

```kotlin
suspend fun trackAppStart() {
    val koin = KoinPlatform.getKoin()
    koin.awaitAllStartJobs()
    koin.get<AnalyticsService>().trackAppStart()
}
```

ブロッキングコードから呼び出す場合:

```kotlin
startKoin {
    lazyModules(analyticsModule)
}

KoinPlatform.getKoin().waitAllStartJobs()
val analytics = KoinPlatform.getKoin().get<AnalyticsService>()
```

:::warning
起動中にAndroidのメインスレッドで `waitAllStartJobs()` を呼び出さないでください。すべてのLazyモジュールが読み込まれるまでUIがブロックされ、遅延読み込みのメリットが失われてしまいます。代わりにコルーチン内から待機してください。
:::

## Androidでの例 {id="android-example"}

最初の画面に必要なものを `modules()` で読み込み、残りをバックグラウンドで読み込みます。

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(coreModule)
            lazyModules(analyticsModule, databaseModule, dispatcher = Dispatchers.IO)
        }
    }
}
```

Lazyモジュールの適した候補としては、アナリティクス、クラッシュレポート、ナビゲーション遷移後の画面の機能、およびモジュール本体の初期化コストが高い定義などが挙げられます。最初の画面で解決されるものはすべて `modules()` に残してください。

## 制限事項 {id="limits"}

- **通常のモジュールからLazyモジュールへの依存は不可**: 通常のモジュールの定義がLazyモジュールの定義に依存している場合、Lazyモジュールが読み込まれる前にそれを解決しようとすると `NoDefinitionFoundException` で失敗します。Koinはこのチェックを自動的には行いません。
- **Lazyモジュールは起動時に読み込まれる**: `lazyModules()` はバックグラウンドですぐに読み込みを開始します。初回使用時にモジュールを読み込むわけではありません。
- **モジュールの登録のみが対象**: 遅延読み込みはモジュールの登録処理をメインスレッドからオフロードするだけです。`single` は依然として初回リクエスト時に、それを要求したスレッド上で作成されます。Lazyモジュール内での `createdAtStart` の使用は避けてください。Koinは即時インスタンス（eager instances）を `startKoin` の終了時に作成するため、まだ読み込まれていないLazyモジュールはそのステップをスキップしてしまいます。
- **アノテーションの非対応**: `@Module` クラスをlazyにすることはできません。

:::tip
実機で起動およびモジュールの読み込みにどれくらいの時間がかかるかを測定するには、[Production Monitoring](/docs/tooling/production-monitoring)（プロダクションモニタリング）を参照してください。
:::

## 関連情報 {id="related"}

- [Modules](/docs/reference/koin-core/modules): モジュール宣言と `includes()`。
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin` とアプリケーションDSL。
- [Definitions](/docs/reference/koin-core/definitions#eager-creation): `createdAtStart` と即時生成（eager creation）。
- [Android Setup](/docs/reference/koin-android/start): Androidの `Application` におけるKoinの起動。
- [DSL Reference](/docs/reference/koin-core/dsl): 各種DSLキーワードのリファレンス。