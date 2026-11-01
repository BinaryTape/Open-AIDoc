---
title: WorkManager
---

# WorkManager

Koinは `WorkerFactory` を [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager) に接続し、Workerがコンストラクタ経由で依存関係を取得できるようにします。このページでは、セットアップ、Workerの宣言方法、および入力データの渡し方について説明します。ここでは、Koinが `Application` 内で開始されていることを前提としています（[Starting Koin on Android](/docs/reference/koin-android/start) を参照）。

## セットアップ {id="setup"}

`koin-android` に加えて WorkManager アーティファクトを追加します：

```kotlin
// build.gradle.kts
dependencies {
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-workmanager")
}
```

バージョンは Koin BOM から取得されます（[Gradle Setup](/docs/setup/gradle) を参照）。

`startKoin` 内で、`androidContext()` の後に `workManagerFactory()` を呼び出します：

```kotlin
import org.koin.androidx.workmanager.koin.workManagerFactory

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            workManagerFactory()
            modules(appModule)
        }
    }
}
```

`workManagerFactory()` は、Koinの `WorkerFactory` を使用する構成で WorkManager を初期化します。デフォルトの AndroidX イニシャライザが先に実行される場合など、WorkManager がすでに初期化されている場合は何もしません。`AndroidManifest.xml` でそのイニシャライザを削除してください：

```xml
<provider
    android:name="androidx.startup.InitializationProvider"
    android:authorities="${applicationId}.androidx-startup"
    android:exported="false"
    tools:node="merge">
    <meta-data
        android:name="androidx.work.WorkManagerInitializer"
        android:value="androidx.startup"
        tools:node="remove" />
</provider>
```

:::warning
デフォルトのイニシャライザを残しておくと、WorkManager は Koin ファクトリなしで起動します。その場合、WorkManager は追加のコンストラクタパラメータを持つクラスを作成できないため、実行時に Worker が失敗します。
:::

## Workerの宣言 {id="declaring-a-worker"}

Worker は WorkManager から `Context` と `WorkerParameters` を受け取り、さらに Koin から任意の依存関係を受け取ります：

```kotlin
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: SyncRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        repository.sync()
        return Result.success()
    }
}
```

Worker として宣言します：

**コンパイラプラグイン DSL**
```kotlin
import org.koin.plugin.module.dsl.worker

val workModule = module {
    single<SyncRepository>()
    worker<SyncWorker>()
}
```

**アノテーション**
```kotlin
import org.koin.android.annotation.KoinWorker

@KoinWorker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: SyncRepository,
) : CoroutineWorker(context, params) {
    ...
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androidx.workmanager.dsl.worker
import org.koin.androidx.workmanager.dsl.workerOf

val workModule = module {
    singleOf(::SyncRepository)
    workerOf(::SyncWorker)

    // またはコンストラクタ呼び出しを直接記述
    worker { params -> SyncWorker(androidContext(), params.get(), get()) }
}
```

`WorkerParameters` はインジェクションされる唯一のパラメータです。`params.get()` または `get()` で読み取り、`Context` は `androidContext()` で取得します。

Worker の定義は、Worker クラス名に基づいて名前が付けられ、`ListenableWorker` にバインドされた `factory` です。WorkManager が Worker クラスを要求すると、Koin ファクトリはその名前を検索します。一致する定義がない場合、Koin は `null` を返し、WorkManager はデフォルトのファクトリにフォールバックします。

## Workのエンキュー {id="enqueuing-work"}

WorkManager 側では何も変更する必要はありません：

```kotlin
val request = OneTimeWorkRequestBuilder<SyncWorker>().build()
WorkManager.getInstance(context).enqueue(request)
```

## 入力データ {id="input-data"}

実行ごとに変化する値は、Koin 経由ではなく WorkManager の入力データ（Input data）経由で渡します：

```kotlin
class UserSyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val userId = inputData.getString("USER_ID") ?: return Result.failure()
        repository.syncUser(userId)
        return Result.success()
    }
}
```

```kotlin
val request = OneTimeWorkRequestBuilder<UserSyncWorker>()
    .setInputData(workDataOf("USER_ID" to "123"))
    .build()

WorkManager.getInstance(context).enqueue(request)
```

入力データは WorkManager によって保存され、プロセスの強制終了（Process death）が発生しても保持されますが、Koin のパラメータは保持されません。

## 関連情報 {id="related"}

- [Starting Koin on Android](/docs/reference/koin-android/start): `startKoin` および `androidContext()`。
- [Definitions](/docs/reference/koin-core/definitions): `worker` を含む定義タイプ。
- [Android Entry Points](/docs/reference/koin-android/entry-points): BroadcastReceiver から WorkManager への処理の引き渡し。
- [Android WorkManager guide](https://developer.android.com/topic/libraries/architecture/workmanager): WorkManager API。