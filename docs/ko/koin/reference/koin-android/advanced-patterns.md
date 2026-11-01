---
title: 고급 Android 패턴
---

# 고급 Android 패턴

이 페이지에서는 빌드 타입(Build Type) 또는 플레이버(Flavor)별 구현체 선택, 현재 Activity가 필요한 UI 헬퍼 선언 등 Android 전용 패턴을 다룹니다. 모든 플랫폼에서 공통으로 동작하는 패턴(컬렉션, 제네릭, 데코레이터, 프로바이더)은 [Advanced Patterns](/docs/reference/koin-core/advanced-patterns)에서, 스코프 연결은 [Scopes](/docs/reference/koin-core/scopes)에서 확인할 수 있습니다.

## 빌드 변체(Build Variant)별 구현체 {id="implementations-per-build-variant"}

### BuildConfig 사용하기 {id="with-buildconfig"}

프로바이더 함수 내에서 구현체를 선택합니다.

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun analytics(context: Context): Analytics =
    if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()

val analyticsModule = module {
    single { create(::analytics) }
}
```

**Annotations**
```kotlin
@Module
class AnalyticsModule {

    @Singleton
    fun analytics(context: Context): Analytics =
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()
}
```

**Constructor / Classic DSL**
```kotlin
val analyticsModule = module {
    single<Analytics> {
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(androidContext()) else NoOpAnalytics()
    }
}
```

`ENABLE_ANALYTICS`는 빌드 타입 또는 플레이버별로 설정된 `buildConfigField`입니다. `BuildConfig.DEBUG`도 동일한 방식으로 동작합니다. 두 구현체 모두 모든 변체에 컴파일되지만, 인스턴스는 하나만 생성됩니다.

### 소스 세트(Source Set) 사용하기 {id="with-source-sets"}

릴리스 APK에 디버그 전용 코드가 포함되지 않도록 하려면, 각 변체 소스 세트에 동일한 Koin 모듈을 선언하세요.

```kotlin
// src/debug/kotlin/com/app/di/VariantModule.kt
val variantModule = module {
    single<Logger> { VerboseLogger() }
    single<NetworkInspector> { ChuckerInspector(androidContext()) }
}
```

```kotlin
// src/release/kotlin/com/app/di/VariantModule.kt
val variantModule = module {
    single<Logger> { CrashlyticsLogger() }
    single<NetworkInspector> { NoOpInspector() }
}
```

```kotlin
// src/main
startKoin {
    androidContext(this@MainApplication)
    modules(appModule, variantModule)
}
```

`src/main`은 빌드마다 하나의 `variantModule`만 참조하므로 양쪽 빌드에서 모두 정상적으로 컴파일됩니다. 각 변체는 자체 구현체와 해당 라이브러리만 포함하여 패키징됩니다(디버그 전용 의존성에는 `debugImplementation` 사용).

## Activity가 필요한 UI 헬퍼 {id="ui-helpers-that-need-the-activity"}

다이얼로그, 권한 요청, Activity 테마를 사용하는 기능 등 일부 헬퍼는 Application이 아닌 현재 Activity를 필요로 합니다. Application 컨텍스트로 생성된 `AlertDialog`는 화면에 표시될 때 오류가 발생합니다. 이러한 헬퍼는 `Context`가 Activity로 확인(resolve)되는 Activity 스코프에 선언해야 합니다.

**Compiler Plugin DSL**
```kotlin
class DialogProvider(private val context: Context) {

    fun confirm(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton(android.R.string.ok) { _, _ -> onConfirm() }
            .create()
}

val uiModule = module {
    activityScope {
        scoped<DialogProvider>()
    }
}
```

**Annotations**
```kotlin
@ActivityScope
class DialogProvider(private val context: Context) {

    fun confirm(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton(android.R.string.ok) { _, _ -> onConfirm() }
            .create()
}
```

**Constructor / Classic DSL**
```kotlin
val uiModule = module {
    activityScope {
        scopedOf(::DialogProvider)
    }
}
```

```kotlin
class SettingsActivity : ScopeActivity() {

    private val dialogs: DialogProvider by inject()

    fun onResetClicked() {
        dialogs.confirm("Reset settings?") { resetSettings() }.show()
    }
}
```

Activity는 반드시 스코프를 가져야 합니다(`ScopeActivity` 또는 `AndroidScopeComponent`). 스코프가 없는 Activity에서는 `DialogProvider`를 찾을 수 없습니다. 스코프는 Activity와 함께 닫히므로, 헬퍼가 Activity보다 오래 유지되지 않습니다. 자세한 내용은 [Android Scopes](/docs/reference/koin-android/scope)를 참조하세요.

이러한 헬퍼를 `single`로 선언하지 마세요. `single`은 `Context`가 Application인 루트 스코프에서 의존성을 해결하며, 결과적으로 Activity의 수명 주기보다 오래 남게 됩니다.

## 관련 문서 {id="related"}

- [Advanced Patterns](/docs/reference/koin-core/advanced-patterns): 모든 플랫폼에서의 컬렉션, 제네릭, 데코레이터 및 프로바이더 활용법.
- [Android Scopes](/docs/reference/koin-android/scope): Activity 및 Fragment 스코프와 `Context` 해결 방식.
- [Android Best Practices](/docs/reference/koin-android/best-practices): Context 누수 및 메모리 관리.
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): 순환 참조 및 의존성 해결 오류 해결.