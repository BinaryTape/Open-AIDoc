---
title: 테스트에서의 주입
---

## KoinTest를 사용하여 테스트를 KoinComponent로 만들기 {id="making-your-test-a-koincomponent-with-kointest"}

*경고*: 이는 Android 계측 테스트(Android Instrumented tests)에는 적용되지 않습니다. Koin을 이용한 계측 테스트에 대해서는 [Android 계측 테스트](/docs/reference/koin-android/instrumented-testing)를 참조하세요.

클래스에 `KoinTest`를 태깅하면 해당 클래스는 `KoinComponent`가 되며 다음 기능을 제공합니다:

* `by inject()` & `get()` - Koin에서 인스턴스를 조회하는 함수
* `verify()` - 모듈 구성 확인을 도움
* `declareMock` & `declare` - 현재 컨텍스트에 mock 또는 새로운 정의를 선언함

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // 지연 주입 속성
    val componentB : ComponentB by inject()

    @Test
    fun `should inject my components`() {
        startKoin {
            modules(
                module {
                    single { ComponentA() }
                    single { ComponentB(get()) }
                })
        }

        // 인스턴스를 직접 요청
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 앱을 부분적으로 빌드하는 데 도움이 되도록 Koin 모듈 구성을 오버로드하는 것을 주저하지 마세요.
:::

## JUnit Rules {id="junit-rules"}

### 테스트를 위한 Koin 컨텍스트 생성 {id="create-a-koin-context-for-your-test"}

다음 규칙(rule)을 사용하여 각 테스트에 대한 Koin 컨텍스트를 쉽게 생성하고 유지할 수 있습니다:

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // 여기에 KoinApplication 인스턴스 작성
    modules(myModule)
}
```

### Mock Provider 지정 {id="specify-your-mock-provider"}

`declareMock` API를 사용하려면 Koin이 Mock 인스턴스를 빌드하는 방법을 알 수 있도록 규칙을 지정해야 합니다. 이를 통해 필요에 맞는 적절한 모킹 프레임워크를 선택할 수 있습니다.

Mockito를 사용하여 mock 생성: 

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 여기에 Mock을 빌드하는 방법 작성
    Mockito.mock(clazz.java)
}
```

MockK를 사용하여 mock 생성: 

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 여기에 Mock을 빌드하는 방법 작성
    mockkClass(clazz)
}
```

!> koin-test 프로젝트는 더 이상 mockito에 종속되지 않습니다.

## 즉각적인 모킹 (Mocking out of the box) {id="mocking-out-of-the-box"}

Mock이 필요할 때마다 매번 새 모듈을 만드는 대신, `declareMock`을 사용하여 즉석에서 Mock을 선언할 수 있습니다:

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(
            module {
                single { ComponentA() }
                single { ComponentB(get()) }
            })
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }
    
    @Test
    fun `should inject my components`() {
    
    }
        // 현재 정의를 Mock으로 교체
        val mock = declareMock<ComponentA>()

        // mock 조회, 위 변수와 동일 
        assertNotNull(get<ComponentA>())

        // 모킹된 ComponentA로 빌드됨
        assertNotNull(get<ComponentB>())
    }
```

:::note
 `declareMock`은 single 또는 factory 여부와 모듈 경로에 포함할지 여부를 지정할 수 있습니다.
:::

## 즉석에서 컴포넌트 선언하기 {id="declaring-a-component-on-the-fly"}

Mock만으로 충분하지 않고 이를 위해 전용 모듈을 만들고 싶지 않을 때는 `declare`를 사용할 수 있습니다:

```kotlin
    @Test
    fun `successful declare an expression mock`() {
        startKoin { }

        declare {
            factory { ComponentA("Test Params") }
        }

        Assert.assertNotEquals(get<ComponentA>(), get<ComponentA>())
    }
```

## Koin 모듈 확인하기 {id="checking-your-koin-modules"}

Koin은 Koin 모듈이 올바른지 테스트하는 방법을 제공합니다: `verify()`는 정의 트리를 탐색하며 각 정의가 바인딩되었는지 확인합니다.

```kotlin
@Test
fun checkKoinModules() {
    myModule.verify()
}
```

:::tip
`checkModules()` API는 더 이상 사용되지 않습니다(deprecated). Koin 컴파일러 플러그인(Koin Compiler Plugin)은 이제 컴파일 타임 의존성 검증(compile-time dependency validation)을 제공하여, `verify()`와 `checkModules()`의 필요성을 대체합니다. [컴파일 타임 안정성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety)을 참조하세요.
:::

## 테스트를 위한 Koin 시작 및 중지 {id="starting-stopping-koin-for-your-tests"}

테스트마다 Koin 인스턴스를 중지하는 데 주의하세요(테스트에서 `startKoin`을 사용하는 경우). 그렇지 않으면 로컬 Koin 인스턴스에는 `koinApplication`을 사용하거나, 현재 글로벌 인스턴스를 중지하려면 `stopKoin()`을 사용해야 합니다.

## JUnit5로 테스트하기 {id="testing-with-junit5"}
JUnit 5 지원은 Koin 컨텍스트의 시작과 중지를 처리하는 [Extensions](https://junit.org/junit5/docs/current/user-guide/#extensions)을 제공합니다. 즉, 이 확장 기능을 사용하는 경우 `AutoCloseKoinTest`를 사용할 필요가 없습니다.

### 의존성 {id="dependency"}
JUnit 5로 테스트하려면 `koin-test-junit5` 의존성을 사용해야 합니다.

### 테스트 작성하기 {id="writing-tests"}
`KoinTestExtension`을 등록하고 모듈 구성을 제공해야 합니다. 이 작업이 완료되면 테스트에서 컴포넌트를 가져오거나(get) 주입(inject)할 수 있습니다. `@RegisterExtension`과 함께 `@JvmField`를 사용하는 것을 잊지 마세요.

```kotlin
class ExtensionTests: KoinTest {

    private val componentB by inject<Simple.ComponentB>()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
            single { Simple.ComponentA() }
            single { Simple.ComponentB(get()) }
        })
    }

    @Test
    fun contextIsCreatedForTheTest() {
        Assertions.assertNotNull(get<Simple.ComponentA>())
        Assertions.assertNotNull(componentB)
    }
}

```

### JUnit5에서 모킹하기 {id="mocking-with-junit5"}
이는 `@RegisterExtension`을 사용해야 한다는 점을 제외하고 JUnit 4와 동일하게 작동합니다.

```kotlin
class MockExtensionTests: KoinTest {

    val mock: Simple.UUIDComponent by inject()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.UUIDComponent() }
                })
    }

    @JvmField
    @RegisterExtension
    val mockProvider = MockProviderExtension.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun mockProviderTest() {
        val uuidValue = "UUID"
        declareMock<Simple.UUIDComponent> {
            BDDMockito.given(getUUID()).will { uuidValue }
        }

        Assertions.assertEquals(uuidValue, mock.getUUID())
    }
}
```

### 생성된 Koin 인스턴스 가져오기 {id="getting-the-created-koin-instances"}
생성된 Koin 컨텍스트를 함수 파라미터로 받을 수도 있습니다. 테스트 함수에 파라미터를 추가하여 이를 수행할 수 있습니다.

```kotlin
class ExtensionTests: KoinTest {
    
    @RegisterExtension
    @JvmField
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.ComponentA() }
                })
    }

    @Test
    fun contextIsCreatedForTheTest(koin: Koin) {
        // get<SimpleComponentA>() == koin.get<Simple.ComponentA>()
        Assertions.assertNotNull(koin.get<Simple.ComponentA>())
    }
}
```
