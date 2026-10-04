[//]: # (title: Kotlin 1.5.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS 업데이트, Gradle 및 Maven 빌드 도구 지원을 다루는 Kotlin 1.5.0 릴리스 노트를 확인해 보세요.</web-summary>

_[출시일: 2021년 5월 5일](releases.md#release-history)_

Kotlin 1.5.0에서는 새로운 언어 기능, 안정화된 IR 기반 JVM 컴파일러 백엔드, 성능 개선뿐만 아니라 실험적 기능의 안정화 및 오래된 기능의 지원 중단(deprecate)과 같은 발전적인 변경 사항이 도입되었습니다.

[릴리스 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/)에서도 변경 사항에 대한 개요를 확인할 수 있습니다.

> Kotlin 릴리스 주기에 대한 자세한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참고하세요.
>
{style="tip"}

## 언어 기능 {id="language-features"}

Kotlin 1.5.0에서는 [1.4.30에서 미리 보기(preview)로 제공](whatsnew1430.md#language-features)되었던 새로운 언어 기능들의 안정화(Stable) 버전이 제공됩니다.
* [JVM 레코드 지원](#jvm-records-support)
* [Sealed 인터페이스](#sealed-interfaces) 및 [sealed 클래스 개선 사항](#package-wide-sealed-class-hierarchies)
* [인라인 클래스](#inline-classes)

이러한 기능에 대한 자세한 설명은 [이 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)과 Kotlin 문서의 해당 페이지에서 확인할 수 있습니다.

### JVM 레코드 지원 {id="jvm-records-support"}

Java는 빠르게 발전하고 있으며, Kotlin이 Java와의 상호 운용성을 유지할 수 있도록 Java의 최신 기능 중 하나인 [레코드 클래스(record classes)](https://openjdk.java.net/jeps/395)에 대한 지원을 도입했습니다.

Kotlin의 JVM 레코드 지원에는 양방향 상호 운용성이 포함됩니다.
* Kotlin 코드에서는 프로퍼티가 있는 일반 클래스를 사용하는 것처럼 Java 레코드 클래스를 사용할 수 있습니다.
* Java 코드에서 Kotlin 클래스를 레코드로 사용하려면 해당 클래스를 `data` 클래스로 만들고 `@JvmRecord` 애너테이션을 추가하세요.

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[Kotlin에서 JVM 레코드 사용에 대해 자세히 알아보기](jvm-records.md).

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Support for JVM Records in Kotlin 1.5.0"/>

### Sealed 인터페이스 {id="sealed-interfaces"}

이제 Kotlin 인터페이스에 `sealed` 제어자를 사용할 수 있습니다. 이는 클래스에서 작동하는 방식과 동일하게 작동하며, sealed 인터페이스의 모든 구현체는 컴파일 시점에 파악됩니다.

```kotlin
sealed interface Polygon
```

예를 들어, 이러한 특성을 활용하여 완전한(exhaustive) `when` 식을 작성할 수 있습니다.

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // 모든 가능한 구현체가 처리되었으므로 else 분기가 필요하지 않습니다.
}

```

또한, 하나의 클래스가 둘 이상의 sealed 인터페이스를 직접 상속받을 수 있으므로 더욱 유연하게 제한된 클래스 계층 구조를 구성할 수 있습니다.

```kotlin
class FilledRectangle: Polygon, Fillable
```

[Sealed 인터페이스에 대해 자세히 알아보기](sealed-classes.md).

<video src="https://www.youtube.com/v/d_Mor21W_60" title="Sealed Interfaces and Sealed Classes Improvements"/>

### 패키지 단위의 sealed 클래스 계층 구조 {id="package-wide-sealed-class-hierarchies"}

이제 동일한 컴파일 단위(compilation unit) 및 동일한 패키지의 모든 파일에 sealed 클래스의 서브클래스를 선언할 수 있습니다. 이전에는 모든 서브클래스가 동일한 파일에 위치해야 했습니다.

직접적인 서브클래스는 최상위(top-level)에 둘 수도 있고, 다른 이름 있는 클래스, 이름 있는 인터페이스 또는 이름 있는 객체 내에 원하는 만큼 중첩시킬 수도 있습니다.

sealed 클래스의 서브클래스는 반드시 적절한 정규화된 이름(qualified name)을 가져야 합니다. 즉, 로컬 객체나 익명 객체는 될 수 없습니다.

[Sealed 클래스 계층 구조에 대해 자세히 알아보기](sealed-classes.md#inheritance).

### 인라인 클래스 {id="inline-classes"}

인라인 클래스는 값만 보유하는 [값 기반(value-based)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md) 클래스의 하위 집합입니다. 메모리 할당으로 인한 추가 오버헤드 없이 특정 타입의 값에 대한 래퍼(wrapper)로 사용할 수 있습니다.

인라인 클래스는 클래스 이름 앞에 `value` 제어자를 붙여 선언할 수 있습니다.

```kotlin
value class Password(val s: String)
```

JVM 백엔드에서는 특수한 `@JvmInline` 애너테이션도 추가로 필요합니다.

```kotlin
@JvmInline
value class Password(val s: String)
```

기존의 `inline` 제어자는 경고와 함께 지원 중단(deprecated)되었습니다.

[인라인 클래스에 대해 자세히 알아보기](inline-classes.md).

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="From Inline to Value Classes"/>

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin/JVM에는 내부적 변경과 사용자 대면 기능 모두를 아우르는 여러 개선 사항이 적용되었습니다. 주요 변경 사항은 다음과 같습니다.

* [안정적인 JVM IR 백엔드](#stable-jvm-ir-backend)
* [새로운 기본 JVM 타깃: 1.8](#new-default-jvm-target-1-8)
* [invokedynamic을 통한 SAM 어댑터](#sam-adapters-via-invokedynamic)
* [invokedynamic을 통한 람다](#lambdas-via-invokedynamic)
* [@JvmDefault 및 기존 Xjvm-default 모드 지원 중단](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [null 허용 여부(nullability) 애너테이션 처리 개선](#improvements-to-handling-nullability-annotations)

### 안정적인 JVM IR 백엔드 {id="stable-jvm-ir-backend"}

Kotlin/JVM 컴파일러용 [IR 기반 백엔드](whatsnew14.md#new-jvm-ir-backend)가 이제 [안정화(Stable)](components-stability.md)되었으며 기본적으로 활성화됩니다.

[Kotlin 1.4.0](whatsnew14.md)부터 IR 기반 백엔드의 초기 버전을 미리 보기로 제공해 왔으며, 이제 언어 버전 `1.5`의 기본값이 되었습니다. 이전 언어 버전의 경우 기본적으로 기존 백엔드가 계속 사용됩니다.

IR 백엔드의 장점과 향후 개발 계획에 대한 자세한 내용은 [이 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)에서 확인할 수 있습니다.

Kotlin 1.5.0에서 기존 백엔드를 사용해야 하는 경우 프로젝트 설정 파일에 다음 줄을 추가할 수 있습니다.

* Gradle의 경우:

 <tabs group="build-script">
 <tab title="Kotlin" group-key="kotlin">

 ```kotlin
 tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
   kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 <tab title="Groovy" group-key="groovy">

 ```groovy
 tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
  kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 </tabs>

* Maven의 경우:

 ```xml
 <configuration>
     <args>
         <arg>-Xuse-old-backend</arg>
     </args>
 </configuration>
 ```

### 새로운 기본 JVM 타깃: 1.8 {id="new-default-jvm-target-1-8"}

Kotlin/JVM 컴파일의 기본 타깃 버전이 이제 `1.8`로 변경되었습니다. `1.6` 타깃은 지원 중단되었습니다.

JVM 1.6용 빌드가 필요한 경우 해당 타깃으로 전환할 수 있습니다. 설정 방법은 다음 문서를 확인하세요.

* [Gradle의 경우](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven의 경우](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [명령줄 컴파일러의 경우](compiler-reference.md#jvm-target-version)

### invokedynamic을 통한 SAM 어댑터 {id="sam-adapters-via-invokedynamic"}

Kotlin 1.5.0에서는 SAM(단일 추상 메서드, Single Abstract Method) 변환을 컴파일할 때 동적 호출(`invokedynamic`)을 사용합니다.
* SAM 타입이 [Java 인터페이스](java-interop.md#sam-conversions)인 경우 모든 식에 대해 적용
* SAM 타입이 [Kotlin 함수형 인터페이스](fun-interfaces.md#sam-conversions)인 경우 람다에 대해 적용

새로운 구현체는 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-)를 사용하며 컴파일 시 보조 래퍼 클래스를 더 이상 생성하지 않습니다. 이로 인해 애플리케이션의 JAR 크기가 줄어들어 JVM 시작 성능이 향상됩니다.

익명 클래스 생성 기반의 기존 구현 방식으로 롤백하려면 컴파일러 옵션 `-Xsam-conversions=class`를 추가하세요.

컴파일러 옵션 추가 방법은 [Gradle](gradle-compiler-options.md), [Maven](maven-kotlin-compiler.md#specify-compiler-options) 및 [명령줄 컴파일러](compiler-reference.md#compiler-options) 문서를 참고하세요.

### invokedynamic을 통한 람다 {id="lambdas-via-invokedynamic"}

> 일반 Kotlin 람다를 invokedynamic으로 컴파일하는 기능은 [실험적(Experimental)](components-stability.md) 기능입니다. 이 기능은 언제든지 중단되거나 변경될 수 있습니다.
> 옵트인(opt-in)이 필요하며(아래 세부 정보 참조), 평가 목적으로만 사용해야 합니다. [YouTrack](https://youtrack.jetbrains.com/issue/KT-45375)을 통해 여러분의 피드백을 전달해 주시면 감사하겠습니다.
>
{style="warning"}

Kotlin 1.5.0에서는 (함수형 인터페이스의 인스턴스로 변환되지 않는) 일반 Kotlin 람다를 동적 호출(`invokedynamic`)로 컴파일하는 실험적 지원을 도입합니다. 이 구현체는 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-)를 사용하여 런타임에 필요한 클래스를 효율적으로 생성하므로 더 가벼운 바이너리를 생성합니다. 현재 일반 람다 컴파일과 비교했을 때 세 가지 제한 사항이 있습니다.

* invokedynamic으로 컴파일된 람다는 직렬화(serializable)할 수 없습니다.
* 해당 람다에서 `toString()`을 호출하면 가독성이 떨어지는 문자열 표현이 반환됩니다.
* 실험적 기능인 [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API는 `LambdaMetafactory`로 생성된 람다를 지원하지 않습니다.

이 기능을 사용해 보려면 `-Xlambdas=indy` 컴파일러 옵션을 추가하세요. 이 [YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-45375)을 통해 의견을 공유해 주시면 감사하겠습니다.

컴파일러 옵션 추가 방법은 [Gradle](gradle-compiler-options.md), [Maven](maven-kotlin-compiler.md#specify-compiler-options) 및 [명령줄 컴파일러](compiler-reference.md#compiler-options) 문서를 참고하세요.

### @JvmDefault 및 기존 Xjvm-default 모드 지원 중단 {id="deprecation-of-jvmdefault-and-old-xjvm-default-modes"}

Kotlin 1.4.0 이전에는 `-Xjvm-default=enable` 및 `-Xjvm-default=compatibility` 모드와 함께 `@JvmDefault` 애너테이션이 제공되었습니다. 이는 Kotlin 인터페이스의 특정 비추상 멤버에 대해 JVM 디폴트 메서드를 생성하는 역할을 했습니다.

Kotlin 1.4.0에서는 프로젝트 전체에 대해 디폴트 메서드 생성을 활성화하는 [새로운 `Xjvm-default` 모드가 도입](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)되었습니다.

Kotlin 1.5.0에서는 `@JvmDefault`와 이전 Xjvm-default 모드인 `-Xjvm-default=enable` 및 `-Xjvm-default=compatibility`를 지원 중단합니다.

[Java 상호 운용성에서의 디폴트 메서드에 대해 자세히 알아보기](java-to-kotlin-interop.md#default-methods-in-interfaces).

### null 허용 여부(nullability) 애너테이션 처리 개선 {id="improvements-to-handling-nullability-annotations"}

Kotlin은 [nullability 애너테이션](java-interop.md#nullability-annotations)을 통해 Java의 타입 nullability 정보를 처리할 수 있도록 지원합니다. Kotlin 1.5.0에서는 이 기능에 대한 여러 개선 사항이 도입되었습니다.

* 의존성으로 사용되는 컴파일된 Java 라이브러리의 타입 인자에 붙은 nullability 애너테이션을 읽습니다.
* 다음 항목에 대해 `TYPE_USE` 타깃을 가진 nullability 애너테이션을 지원합니다.
  * 배열(Arrays)
  * 가변 인자(Varargs)
  * 필드(Fields)
  * 타입 파라미터 및 해당 경계(bounds)
  * 기본 클래스 및 인터페이스의 타입 인자
* nullability 애너테이션에 특정 타입에 적용 가능한 타깃이 여러 개 있고, 그중 하나가 `TYPE_USE`인 경우 `TYPE_USE`가 우선 적용됩니다.
  예를 들어, `@Nullable`이 `TYPE_USE`와 `METHOD`를 모두 타깃으로 지원하는 경우 `@Nullable String[] f()` 메서드 시그니처는 `fun f(): Array<String?>!`가 됩니다.

새롭게 지원되는 이러한 경우에 대해, Kotlin에서 Java를 호출할 때 잘못된 타입 nullability를 사용하면 경고가 발생합니다. 오류 보고 기능이 포함된 엄격 모드를 활성화하려면 `-Xtype-enhancement-improvements-strict-mode` 컴파일러 옵션을 사용하세요.

[Null 안정성 및 플랫폼 타입에 대해 자세히 알아보기](java-interop.md#null-safety-and-platform-types).

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native의 성능과 안정성이 한층 더 강화되었습니다. 주목할 만한 변경 사항은 다음과 같습니다.
* [성능 개선](#performance-improvements)
* [메모리 누수 검사기(memory leak checker) 비활성화](#deactivation-of-the-memory-leak-checker)

### 성능 개선 {id="performance-improvements"}

1.5.0에서 Kotlin/Native는 컴파일과 실행 속도를 모두 향상시키는 일련의 성능 개선 사항을 적용받았습니다.

이제 `linuxX64`(Linux 호스트에만 해당) 및 `iosArm64` 타깃의 디버그 모드에서 [컴파일러 캐시](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native)가 지원됩니다. 컴파일러 캐시가 활성화되면 첫 번째 컴파일을 제외한 대부분의 디버그 컴파일이 훨씬 빠르게 완료됩니다. 테스트 프로젝트에서 측정한 결과 약 200%의 속도 향상이 나타났습니다.

새로운 타깃에 컴파일러 캐시를 사용하려면 프로젝트의 `gradle.properties`에 다음 줄을 추가하여 옵트인하세요.
* `linuxX64`의 경우: `kotlin.native.cacheKind.linuxX64=static`
* `iosArm64`의 경우: `kotlin.native.cacheKind.iosArm64=static`

컴파일러 캐시를 활성화한 후 문제가 발생하면 이슈 트래커인 [YouTrack](https://kotl.in/issue)에 보고해 주시기 바랍니다.

그 외 Kotlin/Native 코드의 실행 속도를 높여주는 개선 사항은 다음과 같습니다.
* 단순 프로퍼티 접근자(trivial property accessor)가 인라인 처리됩니다.
* 문자열 리터럴의 `trimIndent()`가 컴파일 중에 계산됩니다.

### 메모리 누수 검사기(memory leak checker) 비활성화 {id="deactivation-of-the-memory-leak-checker"}

내장된 Kotlin/Native 메모리 누수 검사기가 기본적으로 비활성화되었습니다.

이 기능은 원래 내부용으로 설계되었으며, 모든 누수를 찾는 것이 아니라 제한된 경우에만 누수를 감지할 수 있었습니다. 게다가 애플리케이션 충돌을 유발할 수 있는 문제가 발생하는 것으로 밝혀졌습니다. 이에 따라 메모리 누수 검사기를 끄기로 결정했습니다.

메모리 누수 검사기는 단위 테스트 등 특정 상황에서는 여전히 유용할 수 있습니다. 이러한 경우에는 다음 코드 라인을 추가하여 활성화할 수 있습니다.

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

애플리케이션 런타임에 이 검사기를 활성화하는 것은 권장되지 않습니다.

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS는 1.5.0에서 점진적인 변화를 겪고 있습니다. [JS IR 컴파일러 백엔드](js-ir-compiler.md)의 안정화를 위한 작업을 계속 진행하고 있으며, 그 외 다음과 같은 업데이트를 제공합니다.

* [webpack 5 버전 업그레이드](#upgrade-to-webpack-5)
* [IR 컴파일러용 프레임워크 및 라이브러리](#frameworks-and-libraries-for-the-ir-compiler)

### webpack 5 버전 업그레이드 {id="upgrade-to-webpack-5"}

Kotlin/JS Gradle 플러그인이 브라우저 타깃에 대해 기존 webpack 4 대신 webpack 5를 사용합니다. 이는 호환되지 않는 변경 사항이 포함된 주요 webpack 업그레이드입니다. 커스텀 webpack 설정을 사용하고 있다면 [webpack 5 릴리스 노트](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)를 반드시 확인하세요.

[webpack을 이용한 Kotlin/JS 프로젝트 번들링에 대해 자세히 알아보기](js-project-setup.md#webpack-bundling).

### IR 컴파일러용 프레임워크 및 라이브러리 {id="frameworks-and-libraries-for-the-ir-compiler"}

> Kotlin/JS IR 컴파일러는 [알파(Alpha)](components-stability.md) 단계입니다. 향후 호환되지 않는 방식으로 변경될 수 있으며 수동 마이그레이션이 필요할 수 있습니다. [YouTrack](https://youtrack.jetbrains.com/issues/KT)을 통해 여러분의 피드백을 전달해 주시면 감사하겠습니다.
>
{style="warning"}

Kotlin/JS 컴파일러용 IR 기반 백엔드 작업과 함께, 라이브러리 작성자가 프로젝트를 `both` 모드로 빌드하도록 장려하고 지원하고 있습니다. 이는 두 Kotlin/JS 컴파일러 모두를 위한 아티팩트를 생성할 수 있음을 의미하며, 결과적으로 새 컴파일러의 생태계를 확장할 수 있습니다.

[KVision](https://kvision.io/), [fritz2](https://www.fritz2.dev/), [doodle](https://github.com/nacular/doodle) 등 잘 알려진 많은 프레임워크와 라이브러리가 이미 IR 백엔드를 지원합니다. 프로젝트에서 이러한 라이브러리를 사용 중이라면 이미 IR 백엔드로 빌드하여 그 이점을 확인할 수 있습니다.

자체 라이브러리를 작성하고 있다면 사용자가 새 컴파일러에서도 사용할 수 있도록 'both' 모드로 컴파일하세요.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin 1.5.0에서는 [각 플랫폼의 테스트 의존성 선택이 단순화](#simplified-test-dependencies-usage-in-multiplatform-projects)되었으며, 이제 Gradle 플러그인이 이를 자동으로 처리합니다.

또한 [멀티플랫폼 프로젝트에서 문자(char) 카테고리를 가져오는 새로운 API를 사용할 수 있습니다](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code).

## 표준 라이브러리 {id="standard-library"}

표준 라이브러리는 실험적 기능의 안정화부터 새로운 기능 추가에 이르기까지 다양한 변경과 개선을 거쳤습니다.

* [안정화된 부호 없는 정수(unsigned integer) 타입](#stable-unsigned-integer-types)
* [대소문자 텍스트 변환을 위한 로캘에 독립적인(locale-agnostic) 안정적인 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [안정화된 Char-to-integer 변환 API](#stable-char-to-integer-conversion-api)
* [안정화된 Path API](#stable-path-api)
* [내림 나눗셈(floored division) 및 mod 연산자](#floored-division-and-the-mod-operator)
* [Duration API 변경 사항](#duration-api-changes)
* [멀티플랫폼 코드에서 사용 가능한 문자 카테고리 확인용 신규 API](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [새로운 컬렉션 함수 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [엄격한 버전의 String?.toBoolean()](#strict-version-of-string-toboolean)

표준 라이브러리 변경 사항에 대한 자세한 내용은 [이 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released)에서 확인할 수 있습니다.

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="New Standard Library Features"/>

### 안정화된 부호 없는 정수(unsigned integer) 타입 {id="stable-unsigned-integer-types"}

`UInt`, `ULong`, `UByte`, `UShort` 부호 없는 정수 타입이 이제 [안정화(Stable)](components-stability.md)되었습니다. 이러한 타입에 대한 연산, 범위(ranges) 및 수열(progressions)도 마찬가지입니다. 부호 없는 배열 및 이에 대한 연산은 베타 상태로 유지됩니다.

[부호 없는 정수 타입에 대해 자세히 알아보기](unsigned-integer-types.md).

### 대소문자 텍스트 변환을 위한 로캘에 독립적인(locale-agnostic) 안정적인 API {id="stable-locale-agnostic-api-for-upper-lowercasing-text"}

이번 릴리스에서는 대소문자 텍스트 변환을 위한 새로운 로캘 독립적 API가 도입되었습니다. 이는 로캘에 민감하게 반응하는 `toLowerCase()`, `toUpperCase()`, `capitalize()`, `decapitalize()` API 함수를 대체합니다. 새로운 API는 서로 다른 로캘 설정으로 인해 발생하는 오류를 방지하는 데 도움이 됩니다.

Kotlin 1.5.0에서는 완전히 [안정화(Stable)](components-stability.md)된 다음 대안들을 제공합니다.

* `String` 함수의 경우:

  |**이전 버전**|**1.5.0 대체 기능**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* `Char` 함수의 경우:

  |**이전 버전**|**1.5.0 대체 기능**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> Kotlin/JVM의 경우, 명시적 `Locale` 파라미터를 받는 오버로드된 `uppercase()`, `lowercase()`, `titlecase()` 함수도 제공됩니다.
>
{style="note"}

기존 API 함수는 지원 중단(deprecated)으로 표시되었으며 향후 릴리스에서 제거될 예정입니다.

텍스트 처리 함수의 전체 변경 목록은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md)을 참고하세요.

### 안정화된 Char-to-integer 변환 API {id="stable-char-to-integer-conversion-api"}

Kotlin 1.5.0부터 새로운 char-to-code 및 char-to-digit 변환 함수가 [안정화(Stable)](components-stability.md)되었습니다. 이 함수들은 비슷한 이름의 string-to-Int 변환과 혼동되기 쉬웠던 기존 API 함수를 대체합니다.

새로운 API는 이러한 명명 혼란을 없애고 코드의 동작을 더욱 명확하고 모호하지 않게 만듭니다.

이번 릴리스에서는 명확하게 명명된 다음과 같은 함수 세트로 구분되는 `Char` 변환이 도입되었습니다.

* `Char`의 정수 코드를 가져오고 주어진 코드로부터 `Char`를 구성하는 함수:

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* `Char`를 그것이 나타내는 숫자의 숫자 값으로 변환하는 함수:

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* `Int`가 나타내는 음이 아닌 한 자리 숫자를 해당하는 `Char` 표현으로 변환하는 `Int`용 확장 함수:

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

`Int.toChar()`를 제외한 모든 구현체를 포함하는 `Number.toChar()` 및 `Char.toInt()`와 같이 숫자 타입으로 변환하기 위한 `Char` 확장 함수를 포함한 기존 변환 API는 이제 지원 중단되었습니다.

[KEEP에서 char-to-integer 변환 API에 대해 자세히 알아보기](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md).

### 안정화된 Path API {id="stable-path-api"}

`java.nio.file.Path`용 확장 함수를 제공하는 [실험적 Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/)가 이제 [안정화(Stable)](components-stability.md)되었습니다.

```kotlin
// div(/) 연산자를 사용하여 경로 생성
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// 디렉터리 내 파일 목록 조회
val kotlinFiles: List<Path> = Path("/home/user").listDirectoryEntries("*.kt")
```

[Path API에 대해 자세히 알아보기](whatsnew1420.md#extensions-for-java-nio-file-path).

### 내림 나눗셈(floored division) 및 mod 연산자 {id="floored-division-and-the-mod-operator"}

표준 라이브러리에 모듈러 연산을 위한 새로운 연산이 추가되었습니다.
* `floorDiv()`는 [내림 나눗셈(floored division)](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions)의 결과를 반환합니다. 정수 타입에서 사용할 수 있습니다.
* `mod()`는 내림 나눗셈의 나머지(_modulus_)를 반환합니다. 모든 숫자 타입에서 사용할 수 있습니다.

이러한 연산은 기존의 [정수 나눗셈](numbers.md#integer-division) 및 [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 함수(또는 `%` 연산자)와 매우 유사해 보이지만, 음수에서 다르게 작동합니다.
* `a.floorDiv(b)`는 `/`가 0에 더 가까운 정수로 결과를 버림(truncate)하는 것과 달리, 결과를 아래로(더 작은 정수 방향으로) 내림한다는 점에서 일반 `/`와 다릅니다.
* `a.mod(b)`는 `a`와 `a.floorDiv(b) * b`의 차이입니다. 결과는 0이거나 `b`와 같은 부호를 갖습니다. 반면 `a % b`는 다른 부호를 가질 수 있습니다.

```kotlin
fun main() {
//sampleStart
    println("Floored division -5/3: ${(-5).floorDiv(3)}")
    println( "Modulus: ${(-5).mod(3)}")
    
    println("Truncated division -5/3: ${-5 / 3}")
    println( "Remainder: ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API 변경 사항 {id="duration-api-changes"}

> Duration API는 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 중단되거나 변경될 수 있습니다.
> 평가 목적으로만 사용하시기 바랍니다. [YouTrack](https://youtrack.jetbrains.com/issues/KT)을 통해 여러분의 피드백을 전달해 주시면 감사하겠습니다.
>
{style="warning"}

다양한 시간 단위의 기간을 나타내기 위한 실험적 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 클래스가 있습니다. 1.5.0에서 Duration API는 다음과 같은 변경 사항이 적용되었습니다.

* 내부 값 표현에서 더 나은 정밀도를 제공하기 위해 `Double` 대신 `Long`을 사용합니다.
* `Long`으로 특정 시간 단위로 변환하기 위한 새로운 API가 제공됩니다. 이는 `Double` 값으로 작동하며 현재 지원 중단된 기존 API를 대체합니다. 예를 들어, [`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html)는 `Long`으로 표현된 기간 값을 반환하며 `Duration.inMinutes`를 대체합니다.
* 숫자로부터 `Duration`을 생성하기 위한 새로운 동반(companion) 함수가 추가되었습니다. 예를 들어, [`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html)는 정수 초를 나타내는 `Duration` 객체를 생성합니다. `Int.seconds`와 같은 기존 확장 프로퍼티는 지원 중단되었습니다.

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("There are ${duration.inWholeSeconds} seconds in ${duration.inWholeMinutes} minutes")
//sampleEnd
}
```
{validate="false"}

### 멀티플랫폼 코드에서 사용 가능한 문자 카테고리 확인용 신규 API {id="new-api-for-getting-a-char-category-now-available-in-multiplatform-code"}

Kotlin 1.5.0에서는 멀티플랫폼 프로젝트에서 유니코드에 따라 문자의 카테고리를 가져오는 새로운 API를 도입했습니다. 이제 여러 함수를 모든 플랫폼과 공통(common) 코드에서 사용할 수 있습니다.

문자가 문자인지 숫자인지 확인하는 함수:
* [`Char.isDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-digit.html)
* [`Char.isLetter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter.html)
* [`Char.isLetterOrDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter-or-digit.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('a', '1', '+')
    val (letterOrDigitList, notLetterOrDigitList) = chars.partition { it.isLetterOrDigit() }
    println(letterOrDigitList) // [a, 1]
    println(notLetterOrDigitList) // [+]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

문자의 대소문자를 확인하는 함수:
* [`Char.isLowerCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-lower-case.html)
* [`Char.isUpperCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-upper-case.html)
* [`Char.isTitleCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-title-case.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('ǅ', 'ǈ', 'ǋ', 'ǲ', '1', 'A', 'a', '+')
    val (titleCases, notTitleCases) = chars.partition { it.isTitleCase() }
    println(titleCases) // [ǅ, ǈ, ǋ, ǲ]
    println(notTitleCases) // [1, A, a, +]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

기타 함수:
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

유니코드에 따른 문자의 일반 카테고리를 나타내는 프로퍼티인 [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html)와 해당 반환 타입인 enum 클래스 [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/) 역시 멀티플랫폼 프로젝트에서 사용할 수 있습니다.

[문자에 대해 자세히 알아보기](characters.md).

### 새로운 컬렉션 함수 firstNotNullOf() {id="new-collections-function-firstnotnullof"}

새로운 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 및 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 함수는 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html)과 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 또는 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)을 결합한 것입니다.
이 함수들은 커스텀 선택자(selector) 함수를 사용해 원본 컬렉션을 매핑하고 null이 아닌 첫 번째 값을 반환합니다. 그러한 값이 없으면 `firstNotNullOf()`는 예외를 던지고, `firstNotNullOfOrNull()`은 null을 반환합니다.

```kotlin
fun main() {
//sampleStart
    val data = listOf("Kotlin", "1.5")
    println(data.firstNotNullOf(String::toDoubleOrNull))
    println(data.firstNotNullOfOrNull(String::toIntOrNull))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### 엄격한 버전의 String?.toBoolean() {id="strict-version-of-string-toboolean"}

기존의 [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html)에 대해 대소문자를 구분하는 엄격한(strict) 버전의 신규 함수 두 개가 도입되었습니다.
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html)는 리터럴 `true`와 `false`를 제외한 모든 입력에 대해 예외를 발생시킵니다.
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html)은 리터럴 `true`와 `false`를 제외한 모든 입력에 대해 null을 반환합니다.

```kotlin
fun main() {
//sampleStart
    println("true".toBooleanStrict())
    println("1".toBooleanStrictOrNull())
    // println("1".toBooleanStrict()) // Exception
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## kotlin-test 라이브러리 {id="kotlin-test-library"}
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리에서 다음과 같은 새로운 기능이 도입되었습니다.
* [멀티플랫폼 프로젝트에서 간소화된 테스트 의존성 사용](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [Kotlin/JVM 소스 세트용 테스트 프레임워크 자동 선택](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [단언(assertion) 함수 업데이트](#assertion-function-updates)

### 멀티플랫폼 프로젝트에서 간소화된 테스트 의존성 사용 {id="simplified-test-dependencies-usage-in-multiplatform-projects"}

이제 `kotlin-test` 의존성을 사용하여 `commonTest` 소스 세트에 테스트용 의존성을 추가하면, Gradle 플러그인이 각 테스트 소스 세트에 해당하는 플랫폼 의존성을 추론합니다.
* JVM 소스 세트의 경우 `kotlin-test-junit`, 자세한 내용은 [Kotlin/JVM 소스 세트용 테스트 프레임워크 자동 선택](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)을 참고하세요.
* Kotlin/JS 소스 세트의 경우 `kotlin-test-js`
* 공통(common) 소스 세트의 경우 `kotlin-test-common` 및 `kotlin-test-annotations-common`
* Kotlin/Native 소스 세트의 경우 별도의 아티팩트 없음

또한, 모든 공유(shared) 또는 플랫폼 전용 소스 세트에서 `kotlin-test` 의존성을 사용할 수 있습니다.

명시적 의존성이 설정된 기존의 kotlin-test 설정도 Gradle과 Maven 모두에서 계속 작동합니다.

[테스트 라이브러리에 대한 의존성 설정](gradle-configure-project.md#set-dependencies-on-test-libraries)에 대해 자세히 알아보세요.

### Kotlin/JVM 소스 세트용 테스트 프레임워크 자동 선택 {id="automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets"}

이제 Gradle 플러그인이 테스트 프레임워크에 대한 의존성을 자동으로 선택하고 추가합니다. 공통 소스 세트에 `kotlin-test` 의존성을 추가하기만 하면 됩니다.

Gradle은 기본적으로 JUnit 4를 사용합니다. 따라서 `kotlin("test")` 의존성은 JUnit 4용 변형인 `kotlin-test-junit`으로 확인(resolve)됩니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // JUnit 4에 대한 의존성을
                                               // 전이적(transitively)으로 가져옵니다.
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // JUnit 4에 대한 의존성을
                                              // 전이적(transitively)으로 가져옵니다.
            }
        }
    }
}
```

</tab>
</tabs>

테스트 태스크에서 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 또는 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG)를 호출하여 JUnit 5 또는 TestNG를 선택할 수 있습니다.

```groovy
tasks {
    test {
        // TestNG 지원 활성화
        useTestNG()
        // 또는
        // JUnit Platform(JUnit 5) 지원 활성화
        useJUnitPlatform()
    }
}
```

프로젝트의 `gradle.properties`에 `kotlin.test.infer.jvm.variant=false` 라인을 추가하면 테스트 프레임워크 자동 선택을 비활성화할 수 있습니다.

[테스트 라이브러리에 대한 의존성 설정](gradle-configure-project.md#set-dependencies-on-test-libraries)에 대해 자세히 알아보세요.

### 단언(assertion) 함수 업데이트 {id="assertion-function-updates"}

이번 릴리스에서는 새로운 단언 함수가 도입되었으며 기존 함수도 개선되었습니다.

이제 `kotlin-test` 라이브러리에서 다음과 같은 기능을 제공합니다.

* **값의 타입 확인**

  새로운 `assertIs<T>` 및 `assertIsNot<T>`를 사용하여 값의 타입을 확인할 수 있습니다.

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // 단언이 실패하면 s의 실제 타입을 언급하는 AssertionError 발생
      // assertIs의 계약(contract) 덕분에 s.length를 출력할 수 있음
      println("${s.length}")
  }
  ```

  타입 소거(type erasure)로 인해, 다음 예제에서 이 assert 함수는 `value`가 `List` 타입인지만 확인하며 특정 `String` 요소 타입의 리스트인지는 확인하지 않습니다: `assertIs<List<String>>(value)`.

* **배열, 시퀀스 및 임의의 이터러블에 대한 컨테이너 내용 비교**

  [구조적 동등성(structural equality)](equality.md#structural-equality)을 구현하지 않는 서로 다른 컬렉션의 내용을 비교할 수 있는 오버로드된 새 `assertContentEquals()` 함수 세트가 제공됩니다.

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **`Double` 및 `Float` 숫자를 위한 `assertEquals()` 및 `assertNotEquals()`의 새로운 오버로드**

  절대 정밀도로 두 `Double` 또는 `Float` 숫자를 비교할 수 있는 `assertEquals()` 함수의 새로운 오버로드가 추가되었습니다. 정밀도 값은 함수의 세 번째 파라미터로 지정합니다.

  ```kotlin
   @Test
  fun test() {
      val x = sin(PI)

      // 정밀도 파라미터
      val tolerance = 0.000001

      assertEquals(0.0, x, tolerance)
  }
  ```

* **컬렉션 및 요소의 내용을 확인하기 위한 새로운 함수**

  이제 `assertContains()` 함수를 사용하여 컬렉션이나 요소에 특정 항목이 포함되어 있는지 확인할 수 있습니다.
  `IntRange`, `String` 등 `contains()` 연산자가 있는 Kotlin 컬렉션 및 요소와 함께 사용할 수 있습니다.

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // 컬렉션 내 요소 확인
      assertContains(sampleString, "amp")       // 문자열 내 부분 문자열 확인
  }
  ```

* **`assertTrue()`, `assertFalse()`, `expect()` 함수가 이제 inline으로 변경됨**

  이제 이러한 함수가 인라인 함수로 작동하므로 람다 식 내부에서 [suspend 함수](composing-suspending-functions.md)를 호출할 수 있습니다.

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("Kotlin substring should be present") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx 라이브러리 {id="kotlinx-libraries"}

Kotlin 1.5.0과 함께 다음과 같은 새로운 버전의 kotlinx 라이브러리가 릴리스되었습니다.
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC {id="coroutines-1-5-0-rc"}

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC)에는 다음과 같은 기능이 포함되어 있습니다.
* [새로운 채널 API](channels.md)
* 안정적인 리액티브 통합
* 기타 변경 사항

Kotlin 1.5.0부터 [실험적 코루틴](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines)이 비활성화되며 `-Xcoroutines=experimental` 플래그는 더 이상 지원되지 않습니다.

자세한 내용은 [변경 로그](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 및 [`kotlinx.coroutines` 1.5.0 릴리스 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/)을 참고하세요.

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1 {id="serialization-1-2-1"}

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1)에는 다음과 같은 기능이 포함되어 있습니다.
* JSON 직렬화 성능 개선
* JSON 직렬화에서 여러 이름 지원
* `@Serializable` 클래스로부터 실험적인 .proto 스키마 생성
* 기타 변경 사항

자세한 내용은 [변경 로그](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 및 [`kotlinx.serialization` 1.2.1 릴리스 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/)을 참고하세요.

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0 {id="datetime-0-2-0"}

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0)에는 다음과 같은 기능이 포함되어 있습니다.
* `@Serializable` Datetime 객체
* 정규화된 `DateTimePeriod` 및 `DatePeriod` API
* 기타 변경 사항

자세한 내용은 [변경 로그](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 및 [`kotlinx-datetime` 0.2.0 릴리스 블로그 게시물](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/)을 참고하세요.

## Kotlin 1.5.0으로 마이그레이션 {id="migrating-to-kotlin-1-5-0"}

IntelliJ IDEA 및 Android Studio에서는 1.5.0이 제공되면 Kotlin 플러그인을 1.5.0으로 업데이트하도록 제안합니다.

기존 프로젝트를 Kotlin 1.5.0으로 마이그레이션하려면 Kotlin 버전을 `1.5.0`으로 변경하고 Gradle 또는 Maven 프로젝트를 다시 임포트하기만 하면 됩니다. [Kotlin 1.5.0으로 업데이트하는 방법 알아보기](releases.md#update-to-a-new-kotlin-version).

Kotlin 1.5.0으로 새 프로젝트를 시작하려면 Kotlin 플러그인을 업데이트하고 **File** | **New** | **Project**에서 프로젝트 마법사를 실행하세요.

새로운 명령줄 컴파일러는 [GitHub 릴리스 페이지](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0)에서 다운로드할 수 있습니다.

Kotlin 1.5.0은 기능 릴리스(feature release)이므로 언어에 호환되지 않는 변경 사항이 포함될 수 있습니다. 이러한 변경 사항의 상세 목록은 [Kotlin 1.5 호환성 가이드](compatibility-guide-15.md)에서 확인하세요.