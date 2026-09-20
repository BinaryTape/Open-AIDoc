[//]: # (title: Kotlin 심볼 프로세싱 API)

Kotlin Symbol Processing(KSP)은 코틀린을 위한 소스 코드 생성 프레임워크입니다. KSP API를 사용하면 소스 코드에 대한 정적 정보를 검사하고 이를 기반으로 새로운 코드를 생성하는 프로세서를 만들 수 있습니다. 가장 일반적인 사용 사례는 [어노테이션](annotations.md)을 기반으로 코드를 생성하는 것입니다.

KSP는 경량 컴파일러 플러그인을 더 쉽게 만들 수 있도록 하는 것을 목표로 합니다. KSP로 빌드된 컴파일러 플러그인을 심볼 프로세서(symbol processor), 또는 줄여서 프로세서라고 부릅니다. 잘 정의된 KSP의 API는 컴파일러 변경 사항을 숨겨주므로, 프로세서 유지 보수에 큰 노력을 들일 필요가 없습니다. 하지만 이 방식에는 트레이드오프가 있습니다. 예를 들어, KSP 기반 프로세서는 표현식(expressions)이나 문(statements)을 검사할 수 없으며 소스 코드를 수정할 수 없습니다.

KSP 기반 플러그인의 전형적인 사용 사례는 다음과 같습니다: 
* 의존성 주입 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 직렬화 ([Moshi](https://github.com/square/moshi))
* 데이터베이스 관리 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

첫 번째 KSP 기반 프로세서를 만드는 방법은 [KSP 시작하기](ksp-quickstart.md)를 참고하세요.

## 요구 사항 {id="requirements"}

최신 KSP 버전인 %kspVersion%은 다음 의존성 버전을 지원합니다:

| 의존성                          | 최소 및 최대 버전                                       |
| ------------------------------  | ------------------------------------------------------ |
| Kotlin Gradle 플러그인 (KGP)     | 2.2.10–2.3.x                                           |
| Android Gradle 플러그인 (AGP)    | 8.12.0 이상                                            |
| Gradle                          | 8.13 이상. AGP 9.0 이상의 경우 Gradle 9.x를 사용하세요. |
| JDK                             | 17 이상                                                |

## 컴파일 중 KSP 동작 방식 {id="how-ksp-works-during-compilation"}

KSP는 [코틀린 문법](https://kotlinlang.org/grammar/)에 따라 코틀린 소스 코드를 심볼 계층 구조로 나타냅니다. 프로세서는 이러한 심볼을 사용하여 클래스, 함수, 프로퍼티, 타입 등의 선언을 검사합니다.

> KSP는 선언과 타입 정보를 모델링하지만, 프로세서에 표현식이나 함수 본문에 대한 접근 권한은 제공하지 않습니다.
{style="note"}

KSP는 컴파일 과정에서 다음과 같이 동작합니다:

1. KSP 프로세서가 소스 코드와 리소스를 분석합니다.

2. 프로세서가 소스 파일이나 다른 형태의 출력을 생성합니다.

3. 코틀린 컴파일러가 원본 소스 코드와 함께 생성된 코드를 컴파일합니다.

KSP에 대해 자세히 알아보려면 다음 영상을 시청하세요:

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP가 소스 파일을 바라보는 방식 {id="how-ksp-looks-at-source-files"}

대부분의 프로세서는 입력 소스 코드의 다양한 프로그램 구조를 탐색합니다.
API 사용법을 살펴보기 전에, KSP의 관점에서 파일이 어떻게 보이는지 확인해 보겠습니다:

```text
KSFile
  packageName: KSName
  fileName: String
  annotations: List<KSAnnotation>  (파일 어노테이션)
  declarations: List<KSDeclaration>
    KSClassDeclaration // 클래스, 인터페이스, 객체(object)
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      classKind: ClassKind
      primaryConstructor: KSFunctionDeclaration
      superTypes: List<KSTypeReference>
      // 내부 클래스, 멤버 함수, 프로퍼티 등을 포함
      declarations: List<KSDeclaration>
    KSFunctionDeclaration // 최상위 함수
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      functionKind: FunctionKind
      extensionReceiver: KSTypeReference?
      returnType: KSTypeReference
      parameters: List<KSValueParameter>
      // 로컬 클래스, 로컬 함수, 로컬 변수 등을 포함
      declarations: List<KSDeclaration>
    KSPropertyDeclaration // 전역 변수
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      extensionReceiver: KSTypeReference?
      type: KSTypeReference
      getter: KSPropertyGetter
        returnType: KSTypeReference
      setter: KSPropertySetter
        parameter: KSValueParameter
```

이 구조는 파일에 선언된 클래스, 함수, 프로퍼티 등 일반적인 요소들을 나열합니다.

## KSP가 프로세서를 실행하는 방식 {id="how-ksp-runs-a-processor"}

KSP는 `SymbolProcessor` 인스턴스를 생성하기 위한 진입점으로 `SymbolProcessorProvider`의 구현체를 사용합니다:

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

프로세서를 구현하고 등록하는 방법에 대한 단계별 가이드는 [KSP 시작하기](ksp-quickstart.md)를 참고하세요.

## 지원되는 라이브러리 {id="supported-libraries"}

다음 표는 안드로이드에서 널리 사용되는 라이브러리들과 각 라이브러리의 KSP 지원 현황입니다:

| 라이브러리       | 상태                                                                                              |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [공식 지원됨](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02)          |
| Moshi            | [공식 지원됨](https://github.com/square/moshi/)                                                   |
| RxHttp           | [공식 지원됨](https://github.com/liujingxing/rxhttp)                                              |
| Kotshi           | [공식 지원됨](https://github.com/ansman/kotshi)                                                   |
| Lyricist         | [공식 지원됨](https://github.com/adrielcafe/lyricist)                                             |
| Lich SavedState  | [공식 지원됨](https://github.com/line/lich/tree/master/savedstate)                                |
| gRPC Dekorator   | [공식 지원됨](https://github.com/mottljan/grpc-dekorator)                                         |
| EasyAdapter      | [공식 지원됨](https://github.com/AmrDeveloper/EasyAdapter)                                        |
| Koin Annotations | [공식 지원됨](https://github.com/InsertKoinIO/koin-annotations)                                   |
| Glide            | [공식 지원됨](https://github.com/bumptech/glide)                                                  | 
| Micronaut        | [공식 지원됨](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)                |
| Epoxy            | [공식 지원됨](https://github.com/airbnb/epoxy)                                                    |
| Paris            | [공식 지원됨](https://github.com/airbnb/paris)                                                    |
| Auto Dagger      | [공식 지원됨](https://github.com/ansman/auto-dagger)                                              |
| SealedX          | [공식 지원됨](https://github.com/skydoves/sealedx)                                                |
| Ktorfit          | [공식 지원됨](https://github.Foso/Ktorfit)                                                        |
| Mockative        | [공식 지원됨](https://github.com/mockative/mockative)                                             |
| Kotest           | [공식 지원됨](https://github.com/kotest/kotest)                                                   |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323을 통해 지원됨](https://github.com/airbnb/DeepLinkDispatch/pull/323)   |
| Dagger           | [알파](https://dagger.dev/dev-guide/ksp)                                                          |
| Motif            | [알파](https://github.com/uber/motif)                                                             |
| Hilt             | [진행 중](https://dagger.dev/dev-guide/ksp)                                                        |
| Auto Factory     | [아직 지원되지 않음](https://github.com/google/auto/issues/982)                                     |

## 기타 리소스 {id="other-resources"}

* [KSP 시작하기](ksp-quickstart.md)
* [예제](ksp-examples.md)
* [KSP가 코틀린 코드를 모델링하는 방법](ksp-additional-details.md)
* [자바 어노테이션 프로세서 작성자를 위한 참조 가이드](ksp-reference.md)
* [증분 처리(Incremental processing) 참고 사항](ksp-incremental.md)
* [다중 라운드 처리(Multiple round processing) 참고 사항](ksp-multi-round.md)
* [멀티플랫폼 프로젝트에서의 KSP](ksp-multiplatform.md)
* [커맨드 라인에서 KSP 실행하기](ksp-command-line.md)