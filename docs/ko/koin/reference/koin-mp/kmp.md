---
title: KMP 플랫폼 통합
---

# KMP 플랫폼 통합

이 페이지에서는 Koin을 사용하는 Kotlin Multiplatform 앱의 플랫폼별 세부 사항을 다룹니다. 공유 코드에서 Android `Context` 사용하기, Swift에서 Koin 호출하기, 그리고 데스크톱 및 웹 타깃에 대해 설명합니다. 이 문서는 프로젝트가 [KMP 설정](/docs/reference/koin-core/kmp-setup) 및 [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules)을 따르고 있다고 가정합니다.

완성된 프로젝트 예제: [Compose Multiplatform 샘플](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose) (컴파일러 플러그인 DSL) 및 [어노테이션 샘플](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations).

## 공유 코드에서의 Android Context {id="android-context-in-shared-code"}

공유 코드에서는 `android.content.Context`를 직접 사용할 수 없지만, 일부 공유 클래스는 Android 환경에서 이 객체를 필요로 합니다(파일 열기, 환경설정 읽기 등). 공통 코드가 의존할 수 있는 플랫폼 타입으로 감싸서 사용하세요:

**컴파일러 플러그인 DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    single<FileStore>()
}
```

```kotlin
// androidMain
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidContextWrapper>() bind ContextWrapper::class
}
```

```kotlin
// iosMain
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSContextWrapper>() bind ContextWrapper::class
}
```

**어노테이션**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

@Singleton
class FileStore(private val ctx: ContextWrapper)
```

```kotlin
// androidMain
@Singleton
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}
```

```kotlin
// iosMain
@Singleton
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}
```

플랫폼 클래스는 `@ComponentScan`이 적용된 `actual` 플랫폼 모듈에 의해 탐색됩니다([KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules) 참조).

**생성자 / 클래식 DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    singleOf(::FileStore)
}
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidContextWrapper) bind ContextWrapper::class
}

// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSContextWrapper) bind ContextWrapper::class
}
```

`FileStore`는 `commonMain`에서 한 번만 컴파일되며 플랫폼 래퍼를 주입받습니다. 오직 하나의 Android 정의만이 `Context`를 다루며, 시작 시점에 `androidContext()`가 설정되면 정상적으로 의존성이 해결(resolve)됩니다. 공통 코드에서 플랫폼 타입을 직접 확인하기보다는 Android 전용 작업을 `ContextWrapper`의 메서드 뒤로 숨겨 추상화하세요.

## iOS 및 Swift {id="ios-and-swift"}

### Swift에서 의존성 가져오기 {id="retrieving-dependencies-from-swift"}

Swift에서는 `get<T>()`와 같은 Koin의 실체화된(reified) 함수를 호출할 수 없습니다. 따라서 Swift 경계에서는 `iosMain`에 `KoinComponent`를 구현하는 작은 Kotlin 헬퍼를 작성하여 Swift에서 호출해 사용합니다. 이는 상호 운용성을 위한 진입점 역할을 하며, 공유 클래스는 계속해서 생성자를 통해 의존성을 주입받을 수 있습니다.

```kotlin
// iosMain
class GreetingHelper : KoinComponent {
    private val greeting: Greeting by inject()
    fun greet(): String = greeting.greeting()
}
```

```swift
struct ContentView: View {
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

헬퍼를 사용하기 전에 반드시 Koin이 시작되어 있어야 합니다. [KMP 설정](/docs/reference/koin-core/kmp-setup)의 iOS 진입점을 참조하세요. `KoinComponent`에 대한 자세한 내용은 [KoinComponent](/docs/reference/koin-core/koin-component) 문서를 참고하시기 바랍니다.

### Koin에서 Swift 인스턴스 선언하기 {id="declaring-a-swift-instance-in-koin"}

때로는 Swift 클래스가 Kotlin 인터페이스를 구현하고, Kotlin 코드에서 Koin을 통해 해당 인스턴스를 가져와야 할 때가 있습니다. 이 경우 런타임에 `Koin.declare()`를 사용하여 인스턴스를 등록할 수 있습니다. Swift는 타입을 Objective-C 클래스 또는 프로토콜로 전달하며, 이 `iosMain` 헬퍼가 이를 Kotlin `KClass`로 변환합니다:

```kotlin
// iosMain
@OptIn(BetaInteropApi::class)
fun Koin.declareFromSwift(
    instance: Any,
    bindTo: ObjCObject,
    qualifier: Qualifier? = null,
    allowOverride: Boolean = true
) {
    val kClass: KClass<*> = when (bindTo) {
        is ObjCClass -> getOriginalKotlinClass(bindTo)
        is ObjCProtocol -> getOriginalKotlinClass(bindTo)
        else -> null
    } ?: error("Can't resolve Kotlin KClass from $bindTo")

    declare(
        instance = instance,
        qualifier = qualifier,
        secondaryTypes = listOf(kClass),
        allowOverride = allowOverride
    )
}
```

```swift
koin.declareFromSwift(
    instance: SwiftAnalytics(),
    bindTo: Analytics.self,
    qualifier: nil,
    allowOverride: true
)
```

`getOriginalKotlinClass()`는 `kotlin.native`에서 제공되며, 클래스(클래스의 `.self`) 또는 프로토콜(프로토콜의 `.self`)을 해당하는 원래의 Kotlin 타입으로 매핑해 줍니다. 이렇게 선언된 인스턴스는 컴파일 타임에 검사되지 않으므로, Swift에서 인스턴스를 미리 선언해 두지 않으면 Kotlin 측 소비자가 런타임에 실패하게 됩니다. 이 헬퍼는 [@SarahDelCastillo의 제안](https://github.com/InsertKoinIO/koin/issues/1108#issuecomment-3645990426)을 기반으로 작성되었습니다.

### 스레딩 (Threading) {id="threading"}

Koin은 현재 Kotlin/Native 메모리 모델(Kotlin 1.7.20부터 기본값)에서 동작합니다. 프리징(freezing)이나 `@SharedImmutable` 어노테이션 없이도 어떤 스레드에서든 의존성을 조회하고 스코프를 사용할 수 있습니다.

## 데스크톱 (JVM) {id="desktop-jvm"}

첫 번째 윈도우가 뜨기 전 `main()`에서 Koin을 시작합니다:

```kotlin
// jvmMain
fun main() = application {
    initKoin {
        printLogger()
        modules(desktopModule)
    }

    Window(onCloseRequest = ::exitApplication) {
        App()
    }
}

val desktopModule = module {
    single<DesktopFileManager>()
}
```

공유 `initKoin`의 `config` 파라미터를 통해 데스크톱 전용 모듈과 로거를 추가합니다. 데스크톱은 JVM 타깃이므로 `fileProperties()`와 같은 JVM 전용 기능을 사용할 수 있습니다([Koin 시작하기](/docs/reference/koin-core/starting-koin) 참조).

## 웹 (JS 및 Wasm) {id="web-js-and-wasm"}

`js` 또는 `wasmJs` 소스 세트의 `main()`에서 Koin을 시작합니다:

```kotlin
// jsMain or wasmJsMain
fun main() {
    initKoin {
        modules(webModule)
    }
    // UI 시작
}

val webModule = module {
    single<BrowserStorage>()
}
```

웹용 Compose Multiplatform에서는 루트 Composable에서 `KoinApplication`을 사용하여 Koin을 시작할 수도 있습니다([Compose용 Koin](/docs/reference/koin-compose/compose) 참조).

## 관련 문서 {id="related"}

- [KMP 설정](/docs/reference/koin-core/kmp-setup): 의존성, `initKoin`, 진입점.
- [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules): 플랫폼 모듈 및 `expect`/`actual` 정의.
- [KoinComponent](/docs/reference/koin-core/koin-component): Koin이 직접 생성하지 않는 클래스에서 의존성 가져오기.
- [Compose용 Koin](/docs/reference/koin-compose/compose): Compose Multiplatform 연동.
- [테스트](/docs/reference/koin-test/testing): `commonTest`에서 공유 모듈 테스트하기.