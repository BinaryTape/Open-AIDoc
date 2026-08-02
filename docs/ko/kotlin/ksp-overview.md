[//]: # (title: Kotlin 심볼 프로세싱 API)

Kotlin Symbol Processing(_KSP_)은 코틀린을 위한 소스 코드 생성 프레임워크입니다. KSP API를 사용하면 소스 코드의 [어노테이션](annotations.md)을 기반으로 코드를 생성하는 프로세서를 만들 수 있습니다.

KSP는 경량 컴파일러 플러그인을 더 쉽게 만들 수 있도록 하는 것을 목표로 합니다. 잘 정의된 API는 컴파일러의 변경 사항을 숨겨주므로, 프로세서 유지 보수에 큰 노력을 들일 필요가 없습니다. 하지만 이 방식에는 트레이드오프가 있습니다. 예를 들어, KSP 기반 프로세서는 표현식(expressions)이나 문(statements)을 검사할 수 없으며, 소스 코드를 수정할 수 없습니다.

KSP 기반 플러그인의 전형적인 사례는 다음과 같습니다: 
* 의존성 주입 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 직렬화 ([Moshi](https://github.com/square/moshi))
* 데이터베이스 관리 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

첫 번째 KSP 기반 프로세서를 만드는 방법은 [KSP 빠른 시작](ksp-quickstart.md)을 참고하세요.

## 개요

KSP API는 코틀린 프로그램을 관용적(idiomatically)으로 처리합니다. KSP는 확장 함수(extension functions), 선언 지점 변성(declaration-site variance), 로컬 함수와 같은 코틀린 특유의 기능을 이해합니다. 또한 타입을 명시적으로 모델링하며, 동등성(equivalence) 및 할당 호환성(assign-compatibility)과 같은 기본적인 타입 검사 기능을 제공합니다.

이 API는 [코틀린 문법](https://kotlinlang.org/grammar/)에 따라 심볼 수준에서 코틀린 프로그램 구조를 모델링합니다. KSP 기반 플러그인이 소스 프로그램을 처리할 때 클래스, 클래스 멤버, 함수 및 관련 파라미터와 같은 구조체에는 프로세서가 접근할 수 있지만, `if` 블록이나 `for` 루프와 같은 요소에는 접근할 수 없습니다.

개념적으로 KSP는 코틀린 리플렉션의 [KType](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/)과 유사합니다. 이 API를 통해 프로세서는 클래스 선언에서 특정 타입 인자가 포함된 해당 타입으로 이동하거나 그 반대로 이동할 수 있습니다. 또한 타입 인자 대체, 변성 지정, 스타 프로젝션(star projections) 적용, 타입의 널 가능성(nullability) 표시 등도 가능합니다.

KSP를 바라보는 또 다른 관점은 코틀린 프로그램의 전처리기(preprocessor) 프레임워크로 생각하는 것입니다. KSP 기반 플러그인을 _심볼 프로세서(symbol processors)_, 또는 단순히 _프로세서_라고 할 때, 컴파일 과정에서의 데이터 흐름은 다음과 같은 단계로 설명할 수 있습니다:

1. 프로세서가 소스 프로그램과 리소스를 읽고 분석합니다.
2. 프로세서가 코드나 다른 형태의 출력을 생성합니다.
3. 코틀린 컴파일러가 소스 프로그램과 함께 생성된 코드를 컴파일합니다.

일반적인 컴파일러 플러그인과 달리 프로세서는 코드를 수정할 수 없습니다. 언어의 의미론(semantics)을 변경하는 컴파일러 플러그인은 때로 매우 혼란스러울 수 있습니다. KSP는 소스 프로그램을 읽기 전용으로 취급하여 이를 방지합니다.

이 영상에서도 KSP에 대한 개요를 확인할 수 있습니다:

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP가 소스 파일을 바라보는 방식

대부분의 프로세서는 입력 소스 코드의 다양한 프로그램 구조를 탐색합니다. API 사용법을 살펴보기 전에, KSP의 관점에서 파일이 어떻게 보이는지 확인해 보겠습니다:

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

## SymbolProcessorProvider: 진입점

KSP는 `SymbolProcessor`를 인스턴스화하기 위해 `SymbolProcessorProvider` 인터페이스의 구현체를 필요로 합니다:

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor`는 다음과 같이 정의됩니다:

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated> // 여기에 집중해 봅시다
    fun finish() {}
    fun onError() {}
}
```

`Resolver`는 `SymbolProcessor`에 심볼과 같은 컴파일러 세부 정보에 대한 접근 권한을 제공합니다. 모든 최상위 함수와 최상위 클래스 내의 비로컬(non-local) 함수를 찾는 프로세서는 다음과 같을 수 있습니다:

```kotlin
class HelloFunctionFinderProcessor : SymbolProcessor() {
    // ...
    val functions = mutableListOf<KSFunctionDeclaration>()
    val visitor = FindFunctionsVisitor()

    override fun process(resolver: Resolver) {
        resolver.getAllFiles().forEach { it.accept(visitor, Unit) }
    }

    inner class FindFunctionsVisitor : KSVisitorVoid() {
        override fun visitClassDeclaration(classDeclaration: KSClassDeclaration, data: Unit) {
            classDeclaration.getDeclaredFunctions().forEach { it.accept(this, Unit) }
        }

        override fun visitFunctionDeclaration(function: KSFunctionDeclaration, data: Unit) {
            functions.add(function)
        }

        override fun visitFile(file: KSFile, data: Unit) {
            file.declarations.forEach { it.accept(this, Unit) }
        }
    }
    // ...
    
    class Provider : SymbolProcessorProvider {
        override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor = TODO()
    }
}
```

## 리소스

* [빠른 시작](ksp-quickstart.md)
* [왜 KSP를 사용하는가?](ksp-why-ksp.md)
* [예제](ksp-examples.md)
* [KSP가 코틀린 코드를 모델링하는 방법](ksp-additional-details.md)
* [자바 어노테이션 프로세서 작성자를 위한 참조 가이드](ksp-reference.md)
* [증분 처리(Incremental processing) 참고 사항](ksp-incremental.md)
* [다중 라운드 처리(Multiple round processing) 참고 사항](ksp-multi-round.md)
* [멀티플랫폼 프로젝트에서의 KSP](ksp-multiplatform.md)
* [커맨드 라인에서 KSP 실행하기](ksp-command-line.md)
* [자주 묻는 질문(FAQ)](ksp-faq.md)

## 지원되는 라이브러리

다음 표는 안드로이드에서 널리 사용되는 라이브러리들과 각 라이브러리의 KSP 지원 현황입니다:

| 라이브러리 | 상태 |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [공식 지원됨](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi            | [공식 지원됨](https://github.com/square/moshi/)                                          |
| RxHttp           | [공식 지원됨](https://github.com/liujingxing/rxhttp)                                     |
| Kotshi           | [공식 지원됨](https://github.com/ansman/kotshi)                                          |
| Lyricist         | [공식 지원됨](https://github.com/adrielcafe/lyricist)                                    |
| Lich SavedState  | [공식 지원됨](https://github.com/line/lich/tree/master/savedstate)                       |
| gRPC Dekorator   | [공식 지원됨](https://github.com/mottljan/grpc-dekorator)                                |
| EasyAdapter      | [공식 지원됨](https://github.com/AmrDeveloper/EasyAdapter)                               |
| Koin Annotations | [공식 지원됨](https://github.com/InsertKoinIO/koin-annotations)                          |
| Glide            | [공식 지원됨](https://github.com/bumptech/glide)                                         | 
| Micronaut        | [공식 지원됨](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)       |
| Epoxy            | [공식 지원됨](https://github.com/airbnb/epoxy)                                           |
| Paris            | [공식 지원됨](https://github.com/airbnb/paris)                                           |
| Auto Dagger      | [공식 지원됨](https://github.com/ansman/auto-dagger)                                     |
| SealedX          | [공식 지원됨](https://github.com/skydoves/sealedx)                                       |
| Ktorfit          | [공식 지원됨](https://github.com/Foso/Ktorfit)                                           |
| Mockative        | [공식 지원됨](https://github.com/mockative/mockative)                                    |
| Kotest           | [공식 지원됨](https://github.com/kotest/kotest)                                          |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323을 통해 지원됨](https://github.com/airbnb/DeepLinkDispatch/pull/323)  |
| Dagger           | [알파](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [알파](https://github.com/uber/motif)                                                            |
| Hilt             | [진행 중](https://dagger.dev/dev-guide/ksp)                                                   |
| Auto Factory     | [아직 지원되지 않음](https://github.com/google/auto/issues/982)                                    |