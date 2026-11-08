---
title: R8 / ProGuard
---

# R8 / ProGuard

이 문서는 코드 축소 및 난독화(R8 / ProGuard) 환경에서 Koin이 어떻게 동작하는지, Koin이 기본적으로 어떤 규칙을 보존(keep)해 주며, 여러분의 앱에서 **직접** 보존해야 하는 항목은 무엇인지 설명합니다.

## TL;DR {id="tl-dr"}

- **Koin의 핵심 의존성 해결(resolution)은 R8에 안전합니다.** `get<T>()`, `inject<T>()` 및 `*Of` 빌더(`singleOf`, `factoryOf`, `viewModelOf` 등)는 **컴파일 타임에** 의존성을 해결합니다. 이들은 실체화된 타입(reified types)을 사용하며, Android/JVM에서는 `Class.getName()`을 레지스트리의 키로 사용합니다. **생성자에 대한 런타임 리플렉션이 발생하지 않으므로**, Koin을 위해 정의(definition), ViewModel 또는 이들의 생성자를 별도로 keep 규칙으로 지정할 필요가 **없습니다**.
- Koin은 Android AAR(`koin-android`, `koin-core-viewmodel`, `koin-compose-viewmodel`, `koin-androidx-workmanager`, `koin-androidx-startup`) 내에 `consumer-rules.pro`를 포함하여 배포하므로 아래의 규칙들이 자동으로 적용됩니다. 따라서 일반적으로 직접 추가할 규칙은 없습니다.
- 단, Koin이 아닌 **다른 요소**가 리플렉션을 통해 로드하는 클래스는 여전히 직접 keep 처리를 해주어야 합니다(아래 내용 참조).

## Koin이 기본으로 보존해 주는 것 (포함된 consumer rules) {id="what-koin-keeps-for-you-shipped-consumer-rules"}

AAR 라이브러리들은 Koin 내부 요소에 대한 R8 경고를 비활성화합니다:

```proguard
-dontwarn org.koin.**
```

`koin-androidx-startup`은 매니페스트에서 참조하는 초기화 클래스(initializer)를 추가로 keep 처리합니다. 이들 규칙 중 어떤 것도 애플리케이션 클래스를 keep 처리하지는 않으며, Koin은 이를 keep 처리할 필요가 없습니다.

## 직접 보존(keep)해야 하는 항목 {id="what-you-must-keep"}

다음 항목들은 Koin의 의존성 해결 과정이 아니라 플랫폼 또는 라이브러리에서 기인합니다:

- **`KoinFragmentFactory`로 생성된 Fragment**는 클래스 이름을 통해 인스턴스화됩니다. Fragment 서브클래스들을 keep 처리하세요(대개 `@Keep`, 레이아웃 참조, 또는 AndroidX 규칙을 통해 이미 유지됩니다).
- **WorkManager의 `ListenableWorker` 서브클래스**는 `androidx.work` 자체의 consumer rules를 통해 keep 처리됩니다.
- **프로세스 종료(process death)를 위한 저장된 상태(Saved state).** `SavedStateHandle`은 Koin이 아니라 AndroidX의 `CreationExtras`를 통해 제공됩니다. 여기에 전달하는 값은 다른 저장 상태와 마찬가지로 R8 처리 후에도 유지되어야 합니다. 직접 작성한 `@Parcelize` / `Serializable` 상태 클래스들을 keep 처리하세요:

```proguard
# 예시 — 직접 정의한 saved-state 페이로드 보존
-keep class com.example.** implements android.os.Parcelable { *; }
```

## ViewModel 및 SavedStateHandle (#2044) {id="viewmodels-savedstatehandle-2044"}

간헐적으로 발생하는 `No definition found for SavedStateHandle` 크래시가 R8이 Koin의 ViewModel 리플렉션을 제거하여 발생한다고 오해하는 경우가 많습니다. **하지만 그렇지 않습니다.** `viewModelOf(::MyViewModel)`은 컴파일 타임에 처리되므로, ViewModel에 `-keep` 규칙을 추가하더라도 Koin의 의존성 해결 동작은 달라지지 않습니다.

`SavedStateHandle`은 **ViewModel이 생성되는 동안에만** 사용 가능합니다(팩토리에 전달되는 `CreationExtras`로부터 빌드되기 때문입니다). 지연(lazy) 방식이나 생성 이후가 아닌, **ViewModel 생성자 내부에서 직접** 해결하도록 작성하세요:

```kotlin
// ✅ 생성 시점에 정상적으로 해결됨
class MyViewModel(val handle: SavedStateHandle) : ViewModel()

// ❌ 나중에 해결됨 — 이 시점에는 CreationExtras가 이미 사라진 상태임
class MyViewModel(koin: Koin) : ViewModel() {
    val handle by lazy { koin.get<SavedStateHandle>() } // 실패
}
```

`viewModelScope { }` 내에서 ViewModel을 선언하는 경우, 해당 스코프가 생성될 수 있도록 일치하는 옵션을 활성화하세요:

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

## Android 이외의 타깃 (JS / WASM / Native) {id="non-android-targets-js-wasm-native"}

Android/JVM에서 Koin은 R8 환경에서도 안정적인 `Class.getName()`을 레지스트리 키로 사용합니다. 반면 **Kotlin/JS, WASM, Native**에서는 Kotlin 리플렉션의 `qualifiedName` / `simpleName`을 사용합니다. 해당 타깃에서 공격적인 이름 축소(minification)를 적용하면 타입 식별에 영향을 줄 수 있으므로, Android 이외의 타깃을 축소할 때는 클래스 이름에 의존하기보다 **명명된 한정자(named qualifiers)**(`named("...")`)를 사용하는 것을 권장합니다.