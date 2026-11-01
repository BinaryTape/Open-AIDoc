---
title: WorkManager
---

# WorkManager

Koin은 [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)에 `WorkerFactory`를 연결하므로, Worker가 생성자를 통해 의존성을 주입받을 수 있습니다. 이 페이지에서는 설정 방법, Worker를 선언하는 방법 및 입력 데이터를 전달하는 방법을 다룹니다. `Application`에서 Koin이 이미 시작되었다고 가정합니다([Android에서 Koin 시작하기](/docs/reference/koin-android/start) 참조).

## 설정 {id="setup"}

`koin-android`와 함께 WorkManager 아티팩트를 추가합니다:

```kotlin
// build.gradle.kts
dependencies {
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-workmanager")
}
```

버전은 Koin BOM에서 가져옵니다([Gradle 설정](/docs/setup/gradle) 참조).

`androidContext()` 뒤의 `startKoin` 내부에서 `workManagerFactory()`를 호출합니다:

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

`workManagerFactory()`는 Koin의 `WorkerFactory`를 사용하는 구성으로 WorkManager를 초기화합니다. 기본 AndroidX initializer가 먼저 실행되어 이미 WorkManager가 초기화된 경우에는 아무 작업도 수행하지 않습니다. `AndroidManifest.xml`에서 해당 initializer를 제거하세요:

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
기본 initializer를 유지하면 WorkManager가 Koin 팩토리 없이 시작됩니다. 이 경우 WorkManager가 추가 생성자 매개변수가 있는 클래스를 생성할 수 없기 때문에 런타임에 Worker가 실패하게 됩니다.
:::

## Worker 선언하기 {id="declaring-a-worker"}

Worker는 WorkManager로부터 `Context`와 `WorkerParameters`를 전달받고, Koin으로부터 필요한 의존성을 주입받습니다:

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

Worker로 선언합니다:

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.plugin.module.dsl.worker

val workModule = module {
    single<SyncRepository>()
    worker<SyncWorker>()
}
```

**어노테이션**
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

**생성자 / 클래식 DSL**
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

`WorkerParameters`는 유일하게 주입되는 매개변수입니다. `params.get()` 또는 `get()`으로 읽어오고, `Context`는 `androidContext()`로 가져옵니다.

worker 정의는 Worker 클래스의 이름을 따르고 `ListenableWorker`에 바인딩된 `factory`입니다. WorkManager가 Worker 클래스를 요청하면 Koin 팩토리가 해당 이름을 조회합니다. 일치하는 정의가 없으면 Koin은 `null`을 반환하고 WorkManager는 기본 팩토리로 대체(fallback)하여 동작합니다.

## 작업 큐에 추가하기 {id="enqueuing-work"}

WorkManager 측에서는 달라지는 부분이 없습니다:

```kotlin
val request = OneTimeWorkRequestBuilder<SyncWorker>().build()
WorkManager.getInstance(context).enqueue(request)
```

## 입력 데이터 {id="input-data"}

실행할 때마다 변경되는 값은 Koin이 아닌 WorkManager의 입력 데이터를 통해 전달됩니다:

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

입력 데이터는 WorkManager에 저장되므로 프로세스 종료(process death) 시에도 유지되지만, Koin 매개변수는 유지되지 않습니다.

## 관련 문서 {id="related"}

- [Android에서 Koin 시작하기](/docs/reference/koin-android/start): `startKoin` 및 `androidContext()`.
- [정의 (Definitions)](/docs/reference/koin-core/definitions): `worker`를 포함한 정의 유형.
- [Android 진입점 (Android Entry Points)](/docs/reference/koin-android/entry-points): BroadcastReceiver에서 WorkManager로 작업 전달하기.
- [Android WorkManager 가이드](https://developer.android.com/topic/libraries/architecture/workmanager): WorkManager API.