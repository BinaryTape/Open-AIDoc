[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing(KSP)은 Kotlin을 위한 소스 코드 생성 프레임워크입니다. KSP API를 사용하면 소스 코드에 대한 정적 정보를 검사하고 이를 바탕으로 새로운 코드를 생성하는 프로세서를 만들 수 있습니다. 가장 일반적인 사용 사례는 [애노테이션](annotations.md)을 기반으로 코드를 생성하는 것입니다.

KSP는 경량 컴파일러 플러그인의 생성을 간소화하는 것을 목표로 합니다. KSP로 빌드된 컴파일러 플러그인을 심볼 프로세서(symbol processor) 또는 줄여서 프로세서라고 부릅니다. KSP의 잘 정의된 API는 컴파일러 변경 사항을 숨겨주므로 프로세서 유지 관리에 많은 노력을 들일 필요가 없습니다. 하지만 이러한 접근 방식에는 트레이드오프가 따릅니다. 예를 들어, KSP 기반 프로세서는 표현식이나 문을 검사할 수 없으며 소스 코드를 수정할 수 없습니다.

KSP 기반 플러그인의 일반적인 사용 사례는 다음과 같습니다: 
* 의존성 주입([Dagger](https://dagger.dev/dev-guide/ksp))
* 직렬화([Moshi](https://github.com/square/moshi))
* 데이터베이스 관리([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

첫 번째 KSP 기반 프로세서를 만드는 방법을 알아보려면 [KSP 시작하기](ksp-quickstart.md)를 참조하세요.

## 요구 사항 {id="requirements"}

최신 KSP 버전인 %kspVersion%은 다음 의존성 버전을 지원합니다:

| 의존성                         | 최소 및 최대 버전                                           |
|-----------------------------|------------------------------------------------------|
| Kotlin Gradle 플러그인 (KGP)  | 2.3.20–2.4.x                                         |
| Android Gradle 플러그인 (AGP) | 8.13.0 이상                                           |
| Gradle                      | 8.13 이상. AGP 9.0 이상의 경우 Gradle 9.x를 사용하세요.        |
| JDK                         | 17 이상                                               |

## 컴파일 중 KSP 동작 방식 {id="how-ksp-works-during-compilation"}

KSP는 [Kotlin 문법](https://kotlinlang.org/grammar/)을 기반으로 Kotlin 소스 코드를 심볼 계층 구조로 표현합니다. 프로세서는 이러한 심볼을 사용하여 클래스, 함수, 프로퍼티, 타입과 같은 선언을 검사합니다.

> KSP는 선언과 타입 정보를 모델링하지만, 프로세서가 표현식이나 함수 본문에 접근할 수 있도록 하지는 않습니다.
{style="note"}

KSP는 다음과 같이 컴파일 프로세스에 결합됩니다:

1. KSP 프로세서가 소스 코드와 리소스를 분석합니다.

2. 프로세서가 소스 파일이나 기타 출력을 생성합니다.

3. Kotlin 컴파일러가 원본 소스 코드와 생성된 코드를 함께 컴파일합니다.

KSP에 대해 자세히 알아보려면 다음 동영상을 시청하세요:

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP가 프로세서를 실행하는 방식 {id="how-ksp-runs-a-processor"}

KSP는 `SymbolProcessor` 인스턴스를 생성하기 위한 진입점으로 `SymbolProcessorProvider` 구현체를 사용합니다:

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor` 인터페이스는 처리 로직을 포함합니다. KSP는 `process()` 함수를 호출하고 `Resolver`를 제공하며, 프로세서는 이를 사용하여 소스 코드의 심볼에 접근합니다:

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

프로세서를 구현하고 등록하는 방법에 대한 단계별 가이드는 [KSP 시작하기](ksp-quickstart.md)를 참조하세요.

## 지원되는 라이브러리 {id="supported-libraries"}

다음 표는 Android에서 널리 사용되는 라이브러리와 이들의 KSP 지원 단계를 나열합니다:

| 라이브러리        | 지원 현황                                                                                           |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [공식 지원](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02)               |
| Moshi            | [공식 지원](https://github.com/square/moshi/)                                                      |
| RxHttp           | [공식 지원](https://github.com/liujingxing/rxhttp)                                                 |
| Kotshi           | [공식 지원](https://github.com/ansman/kotshi)                                                      |
| Lyricist         | [공식 지원](https://github.com/adrielcafe/lyricist)                                                |
| Lich SavedState  | [공식 지원](https://github.com/line/lich/tree/master/savedstate)                                   |
| gRPC Dekorator   | [공식 지원](https://github.com/mottljan/grpc-dekorator)                                            |
| EasyAdapter      | [공식 지원](https://github.com/AmrDeveloper/EasyAdapter)                                           |
| Koin Annotations | [공식 지원](https://github.com/InsertKoinIO/koin-annotations)                                      |
| Glide            | [공식 지원](https://github.com/bumptech/glide)                                                     | 
| Micronaut        | [공식 지원](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)                   |
| Epoxy            | [공식 지원](https://github.com/airbnb/epoxy)                                                       |
| Paris            | [공식 지원](https://github.com/airbnb/paris)                                                       |
| Auto Dagger      | [공식 지원](https://github.com/ansman/auto-dagger)                                                 |
| SealedX          | [공식 지원](https://github.com/skydoves/sealedx)                                                   |
| Ktorfit          | [공식 지원](https://github.com/Foso/Ktorfit)                                                       |
| Mockative        | [공식 지원](https://github.com/mockative/mockative)                                                |
| Kotest           | [공식 지원](https://github.com/kotest/kotest)                                                      |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323을 통해 지원](https://github.com/airbnb/DeepLinkDispatch/pull/323)    |
| Dagger           | [Alpha](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [Alpha](https://github.com/uber/motif)                                                            |
| Hilt             | [진행 중](https://dagger.dev/dev-guide/ksp)                                                         |
| Auto Factory     | [아직 지원되지 않음](https://github.com/google/auto/issues/982)                                     |

## 기타 리소스 {id="other-resources"}

* [KSP 시작하기](ksp-quickstart.md)
* [KSP가 Kotlin 코드를 모델링하는 방식](ksp-kotlin-model.md)
* [Java 애노테이션 프로세서 작성자를 위한 레퍼런스](ksp-reference.md)
* [점진적 처리 참고 사항](ksp-incremental.md)
* [다중 라운드 처리 참고 사항](ksp-multi-round.md)
* [멀티플랫폼 프로젝트에서의 KSP](ksp-multiplatform.md)
* [명령줄에서 KSP 실행하기](ksp-command-line.md)