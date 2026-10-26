[//]: # (title: npm 의존성 사용)

Kotlin/JS 프로젝트에서는 모든 의존성을 Gradle 플러그인을 통해 관리할 수 있습니다. 여기에는 `kotlinx.coroutines`, `kotlinx.serialization` 또는 `ktor-client`와 같은 Kotlin/Multiplatform 라이브러리가 포함됩니다.

[npm](https://www.npmjs.com/)의 JavaScript 패키지에 의존성을 설정할 수 있도록, Gradle DSL은 npm에서 가져오려는 패키지를 지정할 수 있는 `npm` 함수를 제공합니다. [`is-sorted`](https://www.npmjs.com/package/is-sorted)라는 npm 패키지를 가져오는 예시를 살펴보겠습니다.

Gradle 빌드 파일의 해당 부분은 다음과 같습니다.

```kotlin
dependencies {
    // ...
    implementation(npm("is-sorted", "^1.0.5"))
}
```

JavaScript 모듈은 대개 동적 타입(dynamically typed)이고 Kotlin은 정적 타입 언어이므로, 일종의 어댑터를 제공해야 합니다. Kotlin에서는 이러한 어댑터를 _외부 선언(external declarations)_이라고 부릅니다. 단 하나의 함수만 제공하는 `is-sorted` 패키지의 경우, 이 선언은 매우 간단하게 작성할 수 있습니다. 소스 폴더 내에 `is-sorted.kt`라는 새 파일을 생성하고 다음 내용을 작성합니다.

```kotlin
@JsModule("is-sorted")
@JsNonModule
external fun <T> sorted(a: Array<T>): Boolean
```

타깃으로 CommonJS를 사용하는 경우, 그에 맞게 `@JsModule` 및 `@JsNonModule` 애너테이션을 조정해야 한다는 점에 유의하세요.

이제 이 JavaScript 함수를 일반적인 Kotlin 함수처럼 사용할 수 있습니다. 매개변수와 반환 타입을 단순히 `dynamic`으로 정의하지 않고 헤더 파일에 타입 정보를 제공했으므로, 컴파일러 지원과 타입 검사(type-checking)도 적절하게 활용할 수 있습니다.

```kotlin
console.log("Hello, Kotlin/JS!")
console.log(sorted(arrayOf(1,2,3)))
console.log(sorted(arrayOf(3,1,2)))
```

브라우저 또는 Node.js에서 이 세 줄을 실행하면, 출력 결과를 통해 `sorted` 호출이 `is-sorted` 패키지에서 내보낸 함수에 올바르게 매핑되었음을 확인할 수 있습니다.

```kotlin
Hello, Kotlin/JS!
true
false
```

JavaScript 생태계에는 패키지 내 함수를 노출하는 여러 방법(예: named 내보내기 또는 default 내보내기)이 존재하므로, 다른 npm 패키지의 경우 외부 선언의 구조를 약간 변경해야 할 수도 있습니다.

선언 작성 방법에 대해 자세히 알아보려면 [Kotlin에서 JavaScript 호출하기](js-interop.md)를 참고하세요.