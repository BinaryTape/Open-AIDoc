[//]: # (title: 옵트인 요구 사항)

Kotlin 표준 라이브러리는 특정 API 요소를 사용하는 데 있어 명시적인 동의를 요구하고 부여할 수 있는 메커니즘을 제공합니다.
이 메커니즘을 통해 라이브러리 작성자는 API가 실험 단계에 있어 향후 변경될 가능성이 있는 경우와 같이, 옵트인(opt-in)이 필요한 특정 조건에 대해 사용자에게 알릴 수 있습니다.

사용자를 보호하기 위해, 컴파일러는 이러한 조건에 대해 경고를 표시하며 API를 사용하기 전에 옵트인할 것을 요구합니다.

## API 옵트인 {id="opt-in-to-api"}

라이브러리 작성자가 자신의 라이브러리 API 선언을 **[옵트인 요구 사항](#api-사용-시-옵트인-요구하기)**으로 표시한 경우, 코드에서 이를 사용하려면 명시적인 동의를 제공해야 합니다.
옵트인에는 여러 가지 방법이 있으며, 상황에 가장 적합한 방식을 선택하는 것이 좋습니다.

### 국소적으로 옵트인(Opt in locally) {id="opt-in-locally"}

코드에서 특정 API 요소를 사용할 때 옵트인하려면, 실험적 API 마커에 대한 참조와 함께 [`@OptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) 어노테이션을 사용하세요. 예를 들어, 옵트인이 필요한 `DateProvider` 클래스를 사용하려는 경우를 가정해 보겠습니다.

```kotlin
// 라이브러리 코드
@RequiresOptIn(message = "이 API는 실험적입니다. 향후 예고 없이 변경될 수 있습니다.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime

@MyDateTime
// 옵트인이 필요한 클래스
class DateProvider
```

코드에서 `DateProvider` 클래스를 사용하는 함수를 선언하기 전에, `MyDateTime` 어노테이션 클래스에 대한 참조와 함께 `@OptIn` 어노테이션을 추가합니다.

```kotlin
// 클라이언트 코드
@OptIn(MyDateTime::class)

// DateProvider 사용
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

이 접근 방식에서는 `getDate()` 함수가 코드의 다른 곳에서 호출되거나 다른 개발자에 의해 사용될 때 별도의 옵트인이 필요하지 않다는 점에 유의해야 합니다.

```kotlin
// 클라이언트 코드
@OptIn(MyDateTime::class)

// DateProvider 사용
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    // OK: 옵트인이 필요하지 않음
    println(getDate()) 
}
```

옵트인 요구 사항은 전파되지 않으므로, 다른 사용자가 자신도 모르게 실험적 API를 사용할 수 있습니다. 이를 방지하려면 옵트인 요구 사항을 전파하는 것이 더 안전합니다.

#### 옵트인 요구 사항 전파 {id="propagate-opt-in-requirements"}

라이브러리와 같이 서드파티가 사용할 용도의 코드에서 API를 사용하는 경우, 해당 API의 옵트인 요구 사항을 자신의 API로도 전파할 수 있습니다. 이를 위해 해당 라이브러리에서 사용한 것과 동일한 **[옵트인 요구 사항 어노테이션](#옵트인-요구-사항-어노테이션-생성)**으로 자신의 선언을 마킹합니다.

예를 들어, `DateProvider` 클래스를 사용하는 함수를 선언하기 전에 `@MyDateTime` 어노테이션을 추가합니다.

```kotlin
// 클라이언트 코드
@MyDateTime
fun getDate(): Date {
    // OK: 이 함수 또한 옵트인을 요구함
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    println(getDate())
    // 에러: getDate()는 옵트인을 요구함
}
```

이 예제에서 볼 수 있듯이, 어노테이션이 추가된 함수는 `@MyDateTime` API의 일부인 것처럼 보입니다. 옵트인은 `getDate()` 함수 사용자에게 옵트인 요구 사항을 전파합니다.

API 요소의 시그니처에 옵트인이 필요한 타입이 포함된 경우, 시그니처 자체도 옵트인을 요구해야 합니다. 그렇지 않고 API 요소가 옵트인을 요구하지 않는데 시그니처에 옵트인이 필요한 타입이 포함되어 있으면 에러가 발생합니다.

```kotlin
// 클라이언트 코드
@MyDateTime
fun getDate(dateProvider: DateProvider = DateProvider()): Date

@MyDateTime
fun displayDate() {
    // OK: 이 함수 또한 옵트인을 요구함
    println(getDate())
}
```

마찬가지로, 시그니처에 옵트인이 필요한 타입이 포함된 선언에 `@OptIn`을 적용하더라도 옵트인 요구 사항은 여전히 전파됩니다.

```kotlin
// 클라이언트 코드
@OptIn(MyDateTime::class)
// 시그니처의 DateProvider로 인해 옵트인이 전파됨
fun getDate(dateProvider: DateProvider = DateProvider()): Date

fun displayDate() {
    println(getDate())
    // 에러: getDate()는 옵트인을 요구함
}
```

옵트인 요구 사항을 전파할 때 이해해야 할 중요한 점은, 특정 API 요소가 안정화되어 더 이상 옵트인 요구 사항이 없더라도, 해당 옵트인 요구 사항을 여전히 가지고 있는 다른 API 요소들은 계속 실험적 상태로 남는다는 것입니다. 예를 들어, 라이브러리 작성자가 `getDate()` 함수가 안정화되어 옵트인 요구 사항을 제거했다고 가정해 보겠습니다.

```kotlin
// 라이브러리 코드
// 옵트인 요구 사항 없음
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

옵트인 어노테이션을 제거하지 않고 `displayDate()` 함수를 사용하면, 옵트인이 더 이상 필요하지 않더라도 해당 함수는 여전히 실험적인 상태로 남게 됩니다.

```kotlin
// 클라이언트 코드

// 여전히 실험적임!
@MyDateTime 
fun displayDate() {
    // 안정적인 라이브러리 함수를 사용함
    println(getDate())
}
```

#### 여러 API에 옵트인하기 {id="opt-in-to-multiple-apis"}

여러 API에 옵트인하려면, 해당 API들의 모든 옵트인 요구 사항 어노테이션을 선언에 추가하세요. 예를 들면 다음과 같습니다.

```kotlin
@ExperimentalCoroutinesApi
@FlowPreview
```

또는 `@OptIn`을 사용할 수도 있습니다.

```kotlin
@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
```

### 파일 전체 옵트인 {id="opt-in-a-file"}

파일 내의 모든 함수와 클래스에 대해 옵트인이 필요한 API를 사용하려면, 패키지 지정 및 임포트 문 앞에 파일 레벨 어노테이션인 `@file:OptIn`을 추가하세요.

 ```kotlin
 // 클라이언트 코드
 @file:OptIn(MyDateTime::class)
 ```

### 모듈 전체 옵트인 {id="opt-in-a-module"}

> `-opt-in` 컴파일러 옵션은 Kotlin 1.6.0부터 사용할 수 있습니다. 이전 Kotlin 버전에서는 `-Xopt-in`을 사용하세요.
>
{style="note"}

옵트인이 필요한 API의 모든 사용처에 어노테이션을 추가하고 싶지 않다면, 모듈 전체에 대해 옵트인할 수 있습니다. 모듈에서 API 사용을 옵트인하려면, 사용하는 API의 옵트인 요구 사항 어노테이션의 정규화된 이름(FQN)을 지정하여 `-opt-in` 인자와 함께 컴파일하세요: `-opt-in=org.mylibrary.OptInAnnotation`. 이 인자로 컴파일하는 것은 모듈의 모든 선언에 `@OptIn(OptInAnnotation::class)` 어노테이션이 있는 것과 동일한 효과를 가집니다.

Gradle로 모듈을 빌드하는 경우, 다음과 같이 인자를 추가할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions.optIn.add("org.mylibrary.OptInAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

Gradle 모듈이 멀티플랫폼 모듈인 경우, `optIn` 메서드를 사용하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("org.mylibrary.OptInAnnotation")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

Maven의 경우 다음과 같이 사용합니다.

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>...</executions>
            <configuration>
                <args>
                    <arg>-opt-in=org.mylibrary.OptInAnnotation</arg>                    
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

모듈 레벨에서 여러 API에 옵트인하려면, 모듈에서 사용되는 각 옵트인 요구 사항 마커에 대해 위에서 설명한 인자를 각각 추가하세요.

### 클래스 또는 인터페이스 상속 시 옵트인 {id="opt-in-to-inherit-from-a-class-or-interface"}

때로는 라이브러리 작성자가 API를 제공하지만, 사용자가 이를 확장(extend)하기 전에 명시적으로 옵트인하도록 요구하고 싶을 때가 있습니다. 예를 들어, 라이브러리 API가 사용하기에는 안정적이지만 상속하기에는 안정적이지 않을 수 있습니다. 향후 새로운 추상 함수가 추가되어 확장될 수 있기 때문입니다. 라이브러리 작성자는 [open](inheritance.md) 또는 [추상 클래스](classes.md#abstract-classes) 및 [비함수형 인터페이스(non-functional interfaces)](interfaces.md)를 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 어노테이션으로 마킹하여 이를 강제할 수 있습니다.

이러한 API 요소를 사용하고 코드에서 확장하기 위해 옵트인하려면, 어노테이션 클래스에 대한 참조와 함께 `@SubclassOptInRequired` 어노테이션을 사용하세요. 예를 들어, 옵트인이 필요한 `CoreLibraryApi` 인터페이스를 사용하려는 경우를 가정해 보겠습니다.

```kotlin
// 라이브러리 코드
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "이 라이브러리의 인터페이스는 실험적입니다."
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 확장을 위해 옵트인이 필요한 인터페이스
interface CoreLibraryApi 
```

코드에서 `CoreLibraryApi` 인터페이스를 상속하는 새 인터페이스를 만들기 전에, `UnstableApi` 어노테이션 클래스에 대한 참조와 함께 `@SubclassOptInRequired` 어노테이션을 추가합니다.

```kotlin
// 클라이언트 코드
@SubclassOptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi
```

클래스에 `@SubclassOptInRequired` 어노테이션을 사용할 때, 옵트인 요구 사항은 [내부 또는 중첩 클래스](nested-classes.md)로 전파되지 않는다는 점에 유의하세요.

```kotlin
// 라이브러리 코드
@RequiresOptIn
annotation class ExperimentalFeature

@SubclassOptInRequired(ExperimentalFeature::class)
open class FileSystem {
    open class File
}

// 클라이언트 코드

// 옵트인이 필요함
class NetworkFileSystem : FileSystem()

// 중첩 클래스
// 옵트인이 필요하지 않음
class TextFile : FileSystem.File()
```

또는 `@OptIn` 어노테이션을 사용하여 옵트인할 수도 있습니다. 또한 실험적 마커 어노테이션을 사용하여 코드에서 해당 클래스를 사용하는 모든 곳으로 요구 사항을 더 전파할 수도 있습니다.

```kotlin
// 클라이언트 코드
// @OptIn 어노테이션 사용
@OptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi

// 어노테이션 클래스를 참조하는 어노테이션 사용
// 옵트인 요구 사항을 더 멀리 전파함
@UnstableApi
interface SomeImplementation : CoreLibraryApi
```

## API 사용 시 옵트인 요구하기 {id="require-opt-in-to-use-api"}

라이브러리 사용자가 API를 사용하기 전에 옵트인하도록 요구할 수 있습니다. 또한, 옵트인 요구 사항을 제거하기로 결정할 때까지 API 사용에 관한 특별한 조건에 대해 사용자에게 알릴 수 있습니다.

### 옵트인 요구 사항 어노테이션 생성 {id="create-opt-in-requirement-annotations"}

모듈의 API 사용에 옵트인을 요구하려면, **옵트인 요구 사항 어노테이션**으로 사용할 어노테이션 클래스를 만듭니다. 이 클래스는 반드시 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) 어노테이션이 지정되어야 합니다.

```kotlin
@RequiresOptIn
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime
```

옵트인 요구 사항 어노테이션은 몇 가지 요구 사항을 충족해야 합니다. 다음을 가져야 합니다:

* `BINARY` 또는 `RUNTIME` [리텐션(retention)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/).
* `EXPRESSION`, `FILE`, `TYPE`, 또는 `TYPE_PARAMETER`를 [타겟(target)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/)으로 하지 않음.
* 매개변수가 없음.

옵트인 요구 사항은 두 가지 심각도 [수준(level)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/-level/) 중 하나를 가질 수 있습니다.

* `RequiresOptIn.Level.ERROR`: 옵트인이 필수입니다. 그렇지 않으면 마킹된 API를 사용하는 코드가 컴파일되지 않습니다. 이것이 기본 수준입니다.
* `RequiresOptIn.Level.WARNING`: 옵트인이 필수는 아니지만 권장됩니다. 옵트인하지 않으면 컴파일러가 경고를 발생시킵니다.

원하는 수준을 설정하려면 `@RequiresOptIn` 어노테이션의 `level` 매개변수를 지정하세요.

또한 API 사용자에게 `message`를 제공할 수 있습니다. 컴파일러는 옵트인 없이 API를 사용하려는 사용자에게 이 메시지를 표시합니다.

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.WARNING, message = "이 API는 실험적입니다. 향후 호환되지 않게 변경될 수 있습니다.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class ExperimentalDateTime
```

옵트인이 필요한 여러 독립적인 기능을 게시하는 경우, 각 기능에 대해 어노테이션을 별도로 선언하세요. 이렇게 하면 클라이언트가 명시적으로 수락한 기능만 사용할 수 있으므로 API 사용이 더 안전해집니다. 또한 기능별로 옵트인 요구 사항을 독립적으로 제거할 수 있으므로 API 유지 관리가 더 쉬워집니다.

### API 요소 마킹하기 {id="mark-api-elements"}

API 요소를 사용하는 데 옵트인을 요구하려면, 해당 선언에 옵트인 요구 사항 어노테이션을 추가하세요.

```kotlin
@MyDateTime
class DateProvider

@MyDateTime
fun getTime(): Time {}
```

일부 언어 요소에는 옵트인 요구 사항 어노테이션을 적용할 수 없습니다.

* 속성(property) 자체에만 어노테이션을 달 수 있으며, 속성의 배킹 필드(backing field)나 게터(getter)에는 달 수 없습니다.
* 지역 변수나 값 매개변수(value parameter)에는 어노테이션을 달 수 없습니다.

## API 확장 시 옵트인 요구하기 {id="require-opt-in-to-extend-api"}

API의 어떤 특정 부분을 사용할 수 있고 확장할 수 있는지에 대해 더 세밀하게 제어하고 싶을 때가 있을 수 있습니다. 예를 들어, 사용하기에는 안정적이지만 다음과 같은 경우의 API가 있습니다.

* 계속되는 진화로 인해 **구현하기에 불안정함**: 예를 들어, 기본 구현 없이 새로운 추상 함수를 추가할 것으로 예상되는 인터페이스 제품군이 있는 경우입니다.
* **구현하기에 까다롭거나 취약함**: 예를 들어, 조화롭게 동작해야 하는 개별 함수들이 있는 경우입니다.
* **향후 외부 구현에 대해 하위 호환되지 않는 방식으로 약화될 수 있는 계약을 가짐**: 예를 들어, 이전에는 `null` 값을 고려하지 않았던 코드에서 입력 매개변수 `T`를 널 허용 버전인 `T?`로 변경하는 경우입니다.

이러한 경우, 사용자가 API를 더 확장하기 전에 옵트인하도록 요구할 수 있습니다. 사용자는 API를 상속하거나 추상 함수를 구현하여 API를 확장할 수 있습니다. [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 어노테이션을 사용하면 [open](inheritance.md) 또는 [추상 클래스](classes.md#abstract-classes) 및 [비함수형 인터페이스](interfaces.md)에 대해 이 옵트인 요구 사항을 강제할 수 있습니다.

API 요소에 옵트인 요구 사항을 추가하려면, 어노테이션 클래스에 대한 참조와 함께 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 어노테이션을 사용하세요.

```kotlin
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "이 라이브러리의 인터페이스는 실험적입니다."
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 확장을 위해 옵트인이 필요한 인터페이스
interface CoreLibraryApi 
```

옵트인을 요구하기 위해 `@SubclassOptInRequired` 어노테이션을 사용할 때, 이 요구 사항은 [내부 또는 중첩 클래스](nested-classes.md)로 전파되지 않는다는 점에 유의하세요.

API에서 `@SubclassOptInRequired` 어노테이션을 사용하는 실제 사례는 `kotlinx.coroutines` 라이브러리의 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 인터페이스를 확인해 보세요.

## 정식 출시 전 API의 옵트인 요구 사항 {id="opt-in-requirements-for-pre-stable-apis"}

아직 안정화되지 않은 기능에 대해 옵트인 요구 사항을 사용하는 경우, 클라이언트 코드가 깨지지 않도록 API 졸업(graduation)을 신중하게 처리하세요.

정식 출시 전 API가 졸업하고 안정된 상태로 릴리스되면, 선언에서 옵트인 요구 사항 어노테이션을 제거하세요. 그러면 클라이언트는 제한 없이 이를 사용할 수 있습니다. 그러나 기존 클라이언트 코드가 호환되도록 모듈에 어노테이션 클래스는 남겨두어야 합니다.

API 사용자가 자신의 코드에서 어노테이션을 제거하고 다시 컴파일하여 모듈을 업데이트하도록 권장하려면, 해당 어노테이션을 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/)로 표시하고 지원 중단 메시지에 설명을 제공하세요.

```kotlin
@Deprecated("이 옵트인 요구 사항은 더 이상 사용되지 않습니다. 코드에서 사용처를 제거하세요.")
@RequiresOptIn
annotation class ExperimentalDateTime
```
