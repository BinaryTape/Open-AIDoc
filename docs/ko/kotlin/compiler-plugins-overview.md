[//]: # (title: 컴파일러 플러그인)

<snippet id="compiler-plugin-description">
컴파일러 플러그인은 컴파일러 자체를 수정하지 않고도 코드가 컴파일되는 동안 컴파일 프로세스에 개입하여 코드를 분석하거나 변경합니다. 예를 들어, 코드에 어노테이션을 추가하거나 다른 프레임워크 또는 API와 호환되도록 새로운 코드를 생성할 수 있습니다.
</snippet>

이 페이지에서는 사용할 수 있는 Kotlin 컴파일러 플러그인과 이러한 플러그인 중 사용 사례에 맞는 것이 없을 때 취할 수 있는 조치에 대해 설명합니다.

Kotlin 팀은 다음 컴파일러 플러그인을 유지 관리합니다.

| 플러그인 | 설명 |
|---|---|
| [All-open](all-open-plugin.md) | 어노테이션이 지정된 클래스와 그 멤버를 자동으로 `open`으로 만들어 런타임에 프레임워크가 이를 확장할 수 있도록 합니다. |
| [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu) | 락 프리(lock-free) 동시성을 위해 원자적 연산을 효율적인 플랫폼별 구현으로 변환합니다. |
| [DataFrame](https://kotlin.github.io/dataframe/compiler-plugin.html) | [`DataFrame`](https://kotlin.github.io/dataframe/home.html)을 안전하고 Kotlin 친화적인 방식으로 다룰 수 있는 타입 지정 API를 생성합니다. |
| [JPA](kotlin-jpa-plugin.md) | JPA 어노테이션이 지정된 엔티티를 `open`으로 만들고 인자 없는 생성자(zero-argument constructor)를 생성합니다. `all-open` 및 `no-arg`를 래핑한 플러그인입니다. |
| [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects) | Kotlin 클래스를 일반 JavaScript 객체(plain JavaScript object)로 노출하여 JS 툴링 및 라이브러리와의 상호 운용성을 향상시킵니다. |
| [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen) | 애플리케이션 바이너리 인터페이스(ABI) JAR를 생성합니다. |
| [kapt](kapt.md) | Kotlin 코드에서 Java 어노테이션 프로세서를 실행하고 추가 소스 파일을 생성합니다. |
| [Lombok](lombok.md) | Kotlin 코드가 Java 소스의 Lombok 어노테이션으로 생성된 코드를 인식하고 사용할 수 있도록 지원합니다. |
| [`no-arg`](no-arg-plugin.md) | 어노테이션이 지정된 클래스에 인자 없는 생성자(no-argument constructor)를 생성하여 이를 필요로 하는 프레임워크를 지원합니다. |
| [Power-assert](power-assert.md) | 식(expression)의 각 부분에 대한 상세한 값을 표시하여 단언문 실패(assertion failure) 정보를 개선합니다. |
| [SAM with receiver](sam-with-receiver-plugin.md) | SAM 인터페이스가 수신 객체 지정 람다(lambda with receiver)를 사용할 수 있도록 하여 더욱 DSL다운 문법을 제공합니다. |
| [Serialization](serialization.md) | 리플렉션 없이 Kotlin 객체를 직렬화 및 역직렬화하는 코드를 생성합니다. |
| [Spring](kotlin-spring-plugin.md) | Spring 어노테이션이 지정된 클래스와 멤버를 `open`으로 만듭니다. `all-open`을 기반으로 사전 구성된 래퍼 플러그인입니다. |

Google의 Android 팀은 다음 플러그인을 유지 관리합니다.

| 플러그인 | 설명 |
|---|---|
| [Compose compiler Gradle plugin](https://developer.android.com/develop/ui/compose/compiler) | Compose 컴파일러를 Gradle과 통합하여 선언형 UI 기능 및 Compose 전용 최적화를 활성화합니다. |
| [Parcelize plugin](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize) | Android 컴포넌트 간에 Kotlin 객체를 전달할 수 있도록 `Parcelable` 구현을 자동으로 생성합니다. |

이러한 플러그인이 지원하지 않는 방식으로 컴파일 프로세스를 조정해야 한다면, 먼저 [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html)나 [Android lint](https://developer.android.com/studio/write/lint)와 같은 외부 린터(linter)를 사용할 수 있는지 확인해 보세요. [Kotlin Slack](https://slack-chats.kotlinlang.org/c/compiler)을 살펴보거나 [문의하여](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 해당 사용 사례에 대한 조언을 구할 수도 있습니다.

_여전히_ 필요한 것을 찾을 수 없다면 [커스텀 컴파일러 플러그인을 제작](custom-compiler-plugins.md)할 수 있습니다. 하지만 Kotlin 컴파일러 플러그인 API는 **불안정(unstable)**하므로, 이 방법은 최후의 수단으로만 사용해야 합니다. 커스텀 컴파일러 플러그인을 제작할 경우 새 컴파일러 릴리스마다 호환성을 깨뜨리는 변경 사항(breaking changes)이 도입되므로, 이를 유지 관리하기 위해 지속적으로 많은 노력을 기울여야 합니다.