---
title: WorkManager
---

# WorkManager

Koin 将 `WorkerFactory` 接入到 [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager) 中，因此您的 Worker 可以通过构造函数获取其依赖项。本页涵盖了相关设置、如何声明 Worker 以及如何传递输入数据。本文假设您已在 `Application` 中启动了 Koin（请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)）。

## 设置 {id="setup"}

在 `koin-android` 旁边添加 WorkManager 构件：

```kotlin
// build.gradle.kts
dependencies {
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-workmanager")
}
```

版本来自 Koin BOM（请参阅 [Gradle 设置](/docs/setup/gradle)）。

在 `startKoin` 中，于 `androidContext()` 之后调用 `workManagerFactory()`：

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

`workManagerFactory()` 使用包含 Koin `WorkerFactory` 的配置初始化 WorkManager。如果 WorkManager 已经初始化，则它不会执行任何操作——当默认的 AndroidX 初始化器先运行时就会发生这种情况。请在 `AndroidManifest.xml` 中移除该初始化器：

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
如果保留默认初始化器，WorkManager 启动时将不会包含 Koin 工厂。此时 Worker 会在运行时失败，因为 WorkManager 无法创建具有额外构造函数形参的类。
:::

## 声明 Worker {id="declaring-a-worker"}

Worker 从 WorkManager 获取 `Context` 和 `WorkerParameters`，然后从 Koin 获取任意依赖项：

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

将其声明为 worker：

**编译器插件 DSL**
```kotlin
import org.koin.plugin.module.dsl.worker

val workModule = module {
    single<SyncRepository>()
    worker<SyncWorker>()
}
```

**注解**
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

**构造函数 / 经典 DSL**
```kotlin
import org.koin.androidx.workmanager.dsl.worker
import org.koin.androidx.workmanager.dsl.workerOf

val workModule = module {
    singleOf(::SyncRepository)
    workerOf(::SyncWorker)

    // 或者直接编写构造函数调用
    worker { params -> SyncWorker(androidContext(), params.get(), get()) }
}
```

`WorkerParameters` 是唯一注入的形参：通过 `params.get()` 或 `get()` 读取它，并通过 `androidContext()` 获取 `Context`。

worker 定义是一个以 Worker 类命名并绑定到 `ListenableWorker` 的 `factory`。当 WorkManager 请求 Worker 类时，Koin 工厂会查找该名称。如果没有匹配的定义，Koin 将返回 `null`，WorkManager 则会回退到其默认工厂。

## 将工作加入队列 {id="enqueuing-work"}

WorkManager 端的使用方式保持不变：

```kotlin
val request = OneTimeWorkRequestBuilder<SyncWorker>().build()
WorkManager.getInstance(context).enqueue(request)
```

## 输入数据 {id="input-data"}

每次运行时发生变化的值通过 WorkManager 输入数据传递，而不是通过 Koin：

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

输入数据由 WorkManager 存储，并能在进程终止后保留，而 Koin 参数则不具备此特性。

## 相关内容 {id="related"}

- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`startKoin` 与 `androidContext()`。
- [定义](/docs/reference/koin-core/definitions)：定义类型，包括 `worker`。
- [Android 入口点](/docs/reference/koin-android/entry-points)：将工作从 BroadcastReceiver 传递给 WorkManager。
- [Android WorkManager 指南](https://developer.android.com/topic/libraries/architecture/workmanager)：WorkManager API。