[//]: # (title: 사용되지 않는 반환 값 검사기)

<primary-label ref="experimental-general"/>

> 이 기능은 향후 Kotlin 릴리스에서 안정화 및 개선될 예정입니다.
> 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719)에 여러분의 피드백을 남겨주시면 감사하겠습니다.
> 
> 자세한 내용은 관련 [KEEP 제안서](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)를 참조하세요.
>
{style="note"}

사용되지 않는 반환 값 검사기(unused return value checker)를 사용하면 _무시된 결과(ignored results)_를 감지할 수 있습니다.
무시된 결과란 `Unit`, `Nothing`, 또는 `Nothing?` 이외의 타입을 반환하는 표현식의 결과값 중 다음 중 어디에도 해당하지 않는 것을 말합니다:

* 변수나 프로퍼티에 저장됨.
* 반환되거나 던져짐(thrown).
* 다른 함수의 인자로 전달됨.
* 호출 또는 안전한 호출(safe call)에서 수신 객체(receiver)로 사용됨.
* `if`, `when`, 또는 `while`과 같은 조건문에서 확인됨.
* 람다의 마지막 문장으로 사용됨.

이 검사기는 `++` 및 `--`와 같은 증감 연산이나, 우측 항이 현재 함수를 종료하는 논리 단축 평가(예: `condition || return`)에 대해서는 무시된 결과를 보고하지 않습니다.

사용되지 않는 반환 값 검사기를 사용하여 함수 호출이 의미 있는 결과를 생성하지만 그 결과가 조용히 버려지는 버그를 찾아낼 수 있습니다. 이는 예기치 않은 동작을 방지하고 문제를 더 쉽게 추적할 수 있도록 도와줍니다.

다음은 문자열이 생성되었지만 사용되지 않아 검사기가 이를 무시된 결과로 보고하는 예시입니다:

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 검사기가 이 결과가 무시되었다는 경고를 보고합니다:
        // "Unused return value of 'plus'."
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

## 사용되지 않는 반환 값 검사기 설정 {id="configure-the-unused-return-value-checker"}

`-Xreturn-value-checker` 컴파일러 옵션을 사용하여 컴파일러가 무시된 결과를 보고하는 방식을 제어할 수 있습니다.

다음과 같은 모드가 있습니다:

* `disable`: 사용되지 않는 반환 값 검사기를 비활성화합니다 (기본값).
* `check`: 검사기를 활성화하며, [표시된 함수](#mark-functions-to-check-ignored-results)에서 발생한 무시된 결과에 대해 경고를 보고합니다.
* `full`: 검사기를 활성화하며, 프로젝트의 모든 함수를 [표시된 함수](#mark-functions-to-check-ignored-results)로 간주하고 무시된 결과에 대해 경고를 보고합니다.

> 표시된 모든 함수는 그 특성이 그대로 전파되며, 해당 코드를 종속성으로 사용하는 프로젝트에서 검사기가 활성화되어 있다면 무시된 결과가 보고됩니다.
> 
{style="note"}

프로젝트에서 사용되지 않는 반환 값 검사기를 사용하려면 빌드 구성 파일에 컴파일러 옵션을 추가하세요:

<tabs>
<tab id="kotlin" title="Gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```
</tab>

<tab id="maven" title="Maven">

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    ..
    <configuration>
        <args>
            <arg>-Xreturn-value-checker=check</arg>
        </args>
    </configuration>
</plugin>
```

</tab>
</tabs>

## 무시된 결과를 검사할 함수 표시 {id="mark-functions-to-check-ignored-results"}

[`-Xreturn-value-checker` 컴파일러 옵션](#configure-the-unused-return-value-checker)을 `check`으로 설정하면, 검사기는 Kotlin 표준 라이브러리의 대부분의 함수처럼 표시된 표현식에서 발생하는 무시된 결과만 보고합니다.

직접 작성한 코드에 표시하려면 [`@MustUseReturnValues`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-must-use-return-values/) 어노테이션을 사용하세요. 검사기가 적용되기를 원하는 범위에 따라 파일, 클래스 또는 함수에 적용할 수 있습니다.

예를 들어, 파일 전체에 표시할 수 있습니다:

```kotlin
// 이 파일의 모든 함수와 클래스에 표시하여 검사기가 사용되지 않는 반환 값을 보고하도록 합니다
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

또는 특정 클래스에 표시할 수도 있습니다:

```kotlin
// 이 클래스의 모든 함수에 표시하여 검사기가 사용되지 않는 반환 값을 보고하도록 합니다
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```

> `-Xreturn-value-checker` 컴파일러 옵션을 `full`로 설정하면 프로젝트 전체에 검사기를 적용할 수 있습니다. 이 옵션을 사용하면 코드에 `@MustUseReturnValues` 어노테이션을 달지 않아도 됩니다.
>
{style="note"}

## 무시된 결과에 대한 보고 억제 {id="suppress-reports-for-ignored-results"}

특정 함수에 [`@IgnorableReturnValue`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-ignorable-return-value/) 어노테이션을 달아 보고를 억제할 수 있습니다. `MutableList.add`와 같이 결과를 무시하는 것이 일반적이고 예상되는 함수에 어노테이션을 추가하세요:

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

함수 자체에 어노테이션을 달지 않고도 경고를 억제할 수 있습니다. 이를 위해 언더스코어 구문(`_`)을 사용하여 결과를 이름 없는 특수 변수에 할당하면 됩니다:

```kotlin
// 반환 값을 반드시 사용해야 하는 함수
fun computeValue(): Int = 42

fun main() {

    // 경고 보고: 결과가 무시됨
    computeValue()

    // 특수한 미사용 변수를 사용하여 호출 지점에서만 경고를 억제함
    val _ = computeValue()
}
```

### 함수 오버라이드에서의 무시된 결과 {id="ignored-results-in-function-overrides"}

함수를 오버라이드(override)할 때, 오버라이드된 함수는 기본 선언에 정의된 어노테이션의 보고 규칙을 상속받습니다. 이는 기본 선언이 Kotlin 표준 라이브러리나 다른 라이브러리 종속성의 일부인 경우에도 적용되므로, `Any.hashCode()`와 같은 함수를 오버라이드한 경우에도 검사기가 무시된 결과를 보고합니다.

또한, `@IgnorableReturnValue`가 지정된 함수를 [반환 값을 반드시 사용해야 하는](#mark-functions-to-check-ignored-results) 다른 함수로 오버라이드할 수 없습니다. 그러나 `@MustUseReturnValues`가 지정된 클래스나 인터페이스 내에서, 결과값을 안전하게 무시해도 되는 오버라이드 함수에는 `@IgnorableReturnValue`를 표시할 수 있습니다:

```kotlin
@MustUseReturnValues
interface Greeter {
    fun greet(name: String): String
}

object SilentGreeter : Greeter {
    @IgnorableReturnValue
    override fun greet(name: String): String = ""
}

fun check(g: Greeter) {
    // 경고 보고: 사용되지 않는 반환 값
    g.greet("John")

    // 경고 없음
    SilentGreeter.greet("John")
}
```

## 고차 함수에서의 사용되지 않는 결과 검사 {id="check-for-unused-results-in-higher-order-functions"}

스코프 함수인 `let`과 같은 일부 고차 함수(higher-order functions)는 람다의 결과를 반환합니다. 고차 함수의 사용되지 않는 람다 결과를 검사하려면, 함수의 계약(contract)에 [Experimental](components-stability.md#stability-levels-explained) `returnsResultOf()` 계약을 추가하세요.

> Kotlin 계약(contracts)은 실험적(Experimental) 기능입니다. 이를 옵트인하려면 계약이 포함된 함수를 선언할 때 `@OptIn(ExperimentalContracts::class)` 어노테이션을 추가하세요.
>
{style="warning"}

예시는 다음과 같습니다:

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

이제 `.customLet()`과 같이 이 계약이 적용된 함수를 사용하여 람다 결과가 사용되는지 확인할 수 있습니다:

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // append()의 반환 값은 무시될 수 있으므로 검사기가 경고를 보고하지 않습니다
    packageName?.customLet { builder.append(it) }

    // 반환된 문자열이 사용되지 않으므로 검사기가 경고를 보고합니다
    packageName?.customLet { "kotlin.$it" }
}
```

> `returnsResultOf()` 계약을 사용하려면 별도의 컴파일러 옵션을 통한 옵트인이 필요합니다. 이를 사용하면 2.4.0 이전 버전의 Kotlin 컴파일러에서는 읽을 수 없는 프리릴리스 바이너리가 생성되므로 주의하시기 바랍니다.
>
{style="warning"}

프로젝트에 이를 적용하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

## Java 어노테이션과의 상호운용성 {id="interoperability-with-java-annotations"}

일부 Java 라이브러리들은 다른 어노테이션을 사용하여 유사한 메커니즘을 사용합니다. 사용되지 않는 반환 값 검사기는 다음 어노테이션들을 `@MustUseReturnValues`와 동일하게 취급합니다:

* [`com.google.errorprone.annotations.CheckReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CheckReturnValue.html)
* [`edu.umd.cs.findbugs.annotations.CheckReturnValue`](https://findbugs.sourceforge.net/api/edu/umd/cs/findbugs/annotations/CheckReturnValue.html)
* [`org.jetbrains.annotations.CheckReturnValue`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/CheckReturnValue.html)
* [`org.springframework.lang.CheckReturnValue`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/lang/CheckReturnValue.html)
* [`org.jooq.CheckReturnValue`](https://www.jooq.org/javadoc/latest/org.jooq/org/jooq/CheckReturnValue.html)

또한 [`com.google.errorprone.annotations.CanIgnoreReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CanIgnoreReturnValue.html)를 `@IgnorableReturnValue`와 동일하게 취급합니다.