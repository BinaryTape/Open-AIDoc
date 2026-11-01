---
title: WorkManager
---

# WorkManager

Koin 將 `WorkerFactory` 插入至 [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)，讓你的 Worker 能透過建構函式取得其相依性。本頁面涵蓋設定方式、如何宣告 Worker 以及如何傳遞輸入資料。本文假設 Koin 已在你的 `Application` 中啟動（請參閱[在 Android 上啟動 Koin](/docs/reference/koin-android/start)）。

## 設定 {id="setup"}

在 `koin-android` 旁新增 WorkManager 構件：

```kotlin
// build.gradle.kts
dependencies {
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-workmanager")
}
```

版本來自 Koin BOM（請參閱 [Gradle 設定](/docs/setup/gradle)）。

在 `startKoin` 中於 `androidContext()` 之後呼叫 `workManagerFactory()`：

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

`workManagerFactory()` 會使用包含 Koin `WorkerFactory` 的配置來初始化 WorkManager。如果 WorkManager 已經初始化，它則不會執行任何動作，而預設的 AndroidX 初始設定式優先執行時就是這種情況。請在 `AndroidManifest.xml` 中移除該初始設定式：

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
如果你保留預設的初始設定式，WorkManager 將在沒有 Koin 工廠的情況下啟動。隨後 Worker 會在執行階段失敗，因為 WorkManager 無法建立具有額外建構函式參數的類別。
:::

## 宣告 Worker {id="declaring-a-worker"}

Worker 會從 WorkManager 接收 `Context` 與 `WorkerParameters`，並從 Koin 接收其他任何相依性：

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

將其宣告為 Worker：

**編譯器外掛程式 DSL**
```kotlin
import org.koin.plugin.module.dsl.worker

val workModule = module {
    single<SyncRepository>()
    worker<SyncWorker>()
}
```

**註解**
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

**建構函式 / 傳統 DSL**
```kotlin
import org.koin.androidx.workmanager.dsl.worker
import org.koin.androidx.workmanager.dsl.workerOf

val workModule = module {
    singleOf(::SyncRepository)
    workerOf(::SyncWorker)

    // or write the constructor call
    worker { params -> SyncWorker(androidContext(), params.get(), get()) }
}
```

`WorkerParameters` 是唯一被注入的參數：可以使用 `params.get()` 或 `get()` 讀取，並透過 `androidContext()` 讀取 `Context`。

Worker 定義是一個以該 Worker 類別命名並繫結至 `ListenableWorker` 的 `factory`。當 WorkManager 請求 Worker 類別時，Koin 工廠會查詢該名稱。如果沒有相符的定義，Koin 會傳回 `null`，且 WorkManager 會退回至其預設工廠。

## 將工作加入佇列 {id="enqueuing-work"}

WorkManager 端沒有任何改變：

```kotlin
val request = OneTimeWorkRequestBuilder<SyncWorker>().build()
WorkManager.getInstance(context).enqueue(request)
```

## 輸入資料 {id="input-data"}

每次執行時都會變更的值應透過 WorkManager 輸入資料傳遞，而不是透過 Koin：

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

輸入資料由 WorkManager 儲存，且在處理程序終止後依然能留存，而 Koin 參數則無法。

## 相關內容 {id="related"}

- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：`startKoin` 與 `androidContext()`。
- [定義](/docs/reference/koin-core/definitions)：定義類型，包括 `worker`。
- [Android 入口點](/docs/reference/koin-android/entry-points)：將工作從 BroadcastReceiver 移交給 WorkManager。
- [Android WorkManager 指南](https://developer.android.com/topic/libraries/architecture/workmanager)：WorkManager API。