[//]: # (title: Kotlin 2.3.20의 새로운 기능)

<show-structure depth="1"/>

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm 업데이트 및 Gradle과 Maven용 빌드 도구 지원을 다루는 Kotlin 2.3.20 릴리스 노트를 확인해 보세요.</web-summary>

_[출시일: 2026년 3월 16일](releases.md#release-history)_

<tldr>
    <p>버그 수정 릴리스 2.3.21에 대한 자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">변경 로그(changelog)</a>를 참조하세요.</p>
</tldr>

Kotlin 2.3.20 릴리스가 출시되었습니다! 주요 하이라이트는 다음과 같습니다.

* **Gradle**: [Gradle 9.3.0과의 호환성](#compatibility-with-gradle-9-3-0) 및 [Kotlin/JVM 컴파일에서 기본적으로 BTA 사용](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**: [Kotlin 프로젝트를 위한 간소화된 설정](#simplified-setup-for-kotlin-projects)
* **Kotlin 컴파일러 플러그인**: [Lombok Alpha 단계 진입](#lombok-is-now-alpha) 및 [`kotlin.plugin.jpa` 플러그인의 향상된 JPA 지원](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **언어**: [이름 기반 구조 분해 선언 지원](#name-based-destructuring)
* **표준 라이브러리**: [`Map.Entry`의 불변 복사본을 생성하기 위한 새로운 API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**: [C 및 Objective-C 라이브러리를 위한 새로운 상호 운용성 모드](#new-interoperability-mode-for-c-or-objective-c-libraries)

> Kotlin 릴리스 주기에 대한 자세한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin 2.3.20으로 업데이트 {id="update-to-kotlin-2-3-20"}

Kotlin 최신 버전은 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio) 최신 버전에 포함되어 있습니다.

새로운 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전으로 업데이트되었는지 확인하고, 빌드 스크립트에서 [Kotlin 버전을 2.3.20으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 새로운 기능 {id=new-stable-features}
<primary-label ref="stable"/>

이번 릴리스에서 다음 기능이 [안정화(Stable)](components-stability.md#stability-levels-explained)되었습니다.

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### Kotlin 프로젝트를 위한 간소화된 설정 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20에서는 Maven 프로젝트에서 Kotlin을 설정하기가 더 쉬워졌습니다. 이제 소스 루트와 Kotlin 표준 라이브러리의 자동 구성을 지원합니다.

새로운 구성을 사용하면 Maven 빌드 시스템으로 새 Kotlin 프로젝트를 생성하거나 기존 Java Maven 프로젝트에 Kotlin을 도입할 때, POM 빌드 파일에 소스 루트 경로를 수동으로 지정하거나 `kotlin-stdlib` 의존성을 추가할 필요가 없습니다.

#### 활성화 방법 {id="%id2%"}

`pom.xml` 파일의 Kotlin Maven 플러그인 `<build><plugins>` 섹션에 `<extensions>true</extensions>`를 추가합니다.

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 이 확장을 추가합니다 -->
         </plugin>
    </plugins>
</build>
```

여기서 `<extensions>` 옵션의 새로운 기능은 다음과 같습니다.

* `src/main/kotlin` 및 `src/test/kotlin` 디렉터리가 이미 존재하지만 플러그인 구성에 지정되지 않은 경우 이를 소스 루트로 등록합니다.
* `kotlin-stdlib` 의존성이 아직 명시적으로 정의되지 않은 경우 자동으로 추가합니다.

Kotlin 표준 라이브러리의 자동 추가를 비활성화할 수도 있습니다. 이를 위해 `<properties>` 섹션에 다음을 추가하세요.

```xml
<project>
    <properties>
        <!-- 프로퍼티를 통해 스마트 기본값 비활성화 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

이 프로퍼티는 표준 라이브러리의 자동 추가뿐만 아니라 소스 루트 경로의 등록도 비활성화한다는 점에 유의하세요.
다른 `<extensions>` 기능에는 영향을 주지 않습니다.

Kotlin Maven 프로젝트 구성에 대한 자세한 내용은 [Maven 프로젝트 구성](maven-configure-project.md)을 참조하세요.

</snippet>

## 새로운 기능 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

이번 릴리스에서는 다음과 같은 안정화 이전 단계의 기능을 사용할 수 있습니다.
여기에는 [Beta](components-stability.md#stability-levels-explained), [Alpha](components-stability.md#stability-levels-explained), [Experimental](components-stability.md#stability-levels-explained) 상태의 기능이 포함됩니다.

* [컴파일러: Lombok Alpha 단계 진입](#lombok-is-now-alpha)
* [언어: 이름 기반 구조 분해](#name-based-destructuring)
* [표준 라이브러리: `Map.Entry`의 불변 복사본 생성을 위한 새로운 API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native: C 또는 Objective-C 라이브러리를 위한 새로운 상호 운용성 모드](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok Alpha 단계 진입 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20에서는 Kotlin과 Java 코드가 혼합된 모듈에서 [Java의 Lombok 선언](https://projectlombok.org/)을 생성하고 사용할 수 있는 실험적 [Lombok 컴파일러 플러그인](lombok.md)을 도입했습니다.

Kotlin 2.3.20에서는 이 기능을 상용 환경에서 사용할 수 있도록 준비할 계획이므로 Lombok 컴파일러 플러그인이 [Alpha](components-stability.md#stability-levels-explained) 단계로 격상되었습니다. 단, 아직 개발 중인 기능입니다.

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 이름 기반 구조 분해 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20에서는 위치 기반 `componentN()` 함수에 의존하는 대신 변수를 프로퍼티 이름과 일치시키는 *이름 기반 구조 분해 선언(name-based destructuring declarations)*을 도입했습니다.

이전에는 [구조 분해 선언](destructuring-declarations.md)에서 위치 기반 구조 분해를 사용했습니다.

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

이 예제에서는 구조 분해가 `componentN()` 함수의 순서에 의존하기 때문에 `email`이 `username`의 값을 받고, `username`이 `email`의 값을 받게 됩니다.

Kotlin 2.3.20부터는 각 변수가 프로퍼티를 이름으로 참조하는 이름 기반 구조 분해를 사용할 수 있습니다.

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 명시적 형태의 이름 기반 구조 분해 사용
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

이름 기반 구조 분해는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
`-Xname-based-destructuring` 컴파일러 옵션을 사용하여 컴파일러가 구조 분해 선언을 해석하는 방식을 제어할 수 있습니다.

이 옵션에는 다음과 같은 모드가 있습니다.

* `only-syntax`: 기존 구조 분해 선언의 동작을 변경하지 않고 명시적 형태의 이름 기반 구조 분해를 활성화합니다.
* `name-mismatch`: 데이터 클래스의 위치 기반 구조 분해에서 프로퍼티 이름과 일치하지 않는 변수 이름을 사용할 때 경고를 보고합니다.
* `complete`: 괄호를 사용하는 축약형 이름 기반 구조 분해를 활성화하고 대괄호 구문을 통한 위치 기반 구조 분해를 계속 지원합니다.

`complete` 모드를 사용하면 괄호를 사용하는 축약형 구조 분해 구문이 위치에 의존하지 않고 변수를 프로퍼티 이름과 일치시킵니다.

```kotlin
val (email, username) = user
```
#### 활성화 방법 {id="%id5%"}

프로젝트에서 이름 기반 구조 분해를 사용하려면 빌드 구성 파일에 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

이름 기반 구조 분해를 사용하도록 설정하면 대괄호를 사용하는 위치 기반 구조 분해의 새로운 구문도 도입됩니다.

```kotlin
// 명시적 위치 기반 구조 분해 사용
val [username, email] = user
```

향후에는 새로운 대괄호 구문으로 위치 기반 구조 분해를 유지하면서 기본적으로 이름 기반 매칭을 사용하는 구조 분해 선언으로 점진적으로 전환할 계획입니다.

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)을 참조하세요.

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627)을 통해 공유해 주시면 감사하겠습니다.

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### `Map.Entry`의 불변 복사본 생성을 위한 새로운 API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20에서는 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/)의 불변 복사본을 생성하는 `Map.Entry.copy()` 확장 함수를 도입했습니다.
이 함수를 사용하면 맵을 수정한 후에도 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html)에서 가져온 엔트리를 먼저 복사해 두어 재사용할 수 있습니다.

`Map.Entry.copy()`는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
사용을 선택(opt-in)하려면 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션이나 컴파일러 옵션을 사용하세요.

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

다음은 `Map.Entry.copy()`를 사용하여 가변 맵에서 엔트리를 제거하는 예제입니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

</snippet>

<snippet id="new-interoperability-mode-for-c-or-objective-c-libraries-content">

<var name="id7" value="new-interoperability-mode-for-c-or-objective-c-libraries"/>

<var name="id8" value="new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>

<var name="id9" value="new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>

### C 또는 Objective-C 라이브러리를 위한 새로운 상호 운용성 모드 {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

Kotlin Multiplatform(KMP) 라이브러리나 애플리케이션에서 C 또는 Objective-C 라이브러리를 사용하는 경우, 새로운 상호 운용성 모드를 테스트하고 결과를 공유해 주시기 바랍니다.

일반적으로 Kotlin/Native는 C 및 Objective-C 라이브러리를 Kotlin으로 가져올 수 있도록 지원합니다.
그러나 KMP 라이브러리의 경우, 이전 컴파일러 버전과의 KMP 호환성 문제로 인해 이 기능이 현재 [영향을 받고 있습니다](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import).

즉, 특정 Kotlin 버전으로 컴파일된 KMP 라이브러리를 배포할 때 C 또는 Objective-C 라이브러리를 가져오면 이전 Kotlin 버전을 사용하는 프로젝트에서 해당 Kotlin 라이브러리를 사용하지 못할 수 있습니다.

이 문제와 기타 문제를 해결하기 위해 Kotlin 팀은 내부에서 사용되는 상호 운용성 메커니즘을 개선해 왔습니다.
Kotlin 2.3.20부터 컴파일러 옵션을 통해 새로운 모드를 사용해 볼 수 있습니다.

#### 활성화 방법 {id="%id8%"}

1. Gradle 빌드 파일에서 `cinterops {}` 블록이나 `pod()` 의존성이 있는지 확인합니다.
   이 항목들이 있다면 프로젝트에서 C 또는 Objective-C 라이브러리를 사용하는 것입니다.

2. 프로젝트에서 `2.3.20` 이상의 버전을 사용하는지 확인합니다.
3. 동일한 빌드 파일에서 cinterop 도구 호출 부분에 `-Xccall-mode` 컴파일러 옵션을 추가합니다.

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 평소와 같이 단위 테스트, 앱 실행 등을 통해 프로젝트를 빌드하고 테스트합니다.
   실패 후에도 Gradle이 작업을 계속 실행하도록 해 주는 `--continue` 옵션을 사용하면 한 번에 더 많은 문제를 찾는 데 도움이 됩니다.

> 새로운 상호 운용성 모드는 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이므로, 이 모드로 컴파일된 라이브러리를 아직 배포하지 **마세요**.
>
{style="warning"}

#### 결과 공유하기 {id="%id9%"}

새로운 상호 운용성 모드는 대부분의 경우 바로 대체하여 사용할 수 있도록 설계되었습니다.
궁극적으로는 기본적으로 활성화할 계획이지만, 이를 달성하려면 최대한 원활하게 작동하는지 확인하고 다음과 같은 이유로 다양한 프로젝트에서 테스트해야 합니다.

* 일부 C 및 Objective-C 선언은 새로운 모드에서 아직 지원되지 않습니다(주로 호환성 문제 때문). 이것이 실제 환경에 미치는 영향을 더 잘 이해하고 이에 따라 향후 단계의 우선순위를 정하고자 합니다.
* 버그나 미처 고려하지 못한 부분이 있을 수 있습니다. 수많은 기능이 상호 작용하는 단일 언어를 테스트하는 것도 어렵지만, 고유한 기능을 가진 언어 간의 상호 작용을 테스트하는 것은 더욱 까다롭습니다.

실제 프로젝트를 검토하고 해결하기 어려운 사례를 파악할 수 있도록 도와주세요.
문제가 발생하든 발생하지 않든, [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218)의 댓글로 결과를 공유해 주세요.

</snippet>

## 언어 {id="language"}

Kotlin 2.3.20에는 위치에 의존하지 않고 변수를 프로퍼티 이름과 일치시키는 이름 기반 구조 분해 선언이 추가되었습니다.
또한 컨텍스트 파라미터가 있는 선언에 대한 오버로드 확인 방식의 변경 사항도 도입되었습니다.

### 컨텍스트 파라미터에 대한 오버로드 확인 방식 변경 {id="changes-to-overload-resolution-for-context-parameters"}
<secondary-label ref="language"/>

Kotlin 2.3.20에서는 컨텍스트 파라미터가 있는 선언에 대한 오버로드 확인(overload resolution) 방식이 변경되었습니다.

이전에는 오버로드 확인 시 컨텍스트 파라미터가 있는 선언을 그렇지 않은 선언보다 더 구체적인(more specific) 것으로 취급했습니다.

Kotlin 2.3.20부터는 이 규칙이 더 이상 적용되지 않아 오버로드 선택이 더욱 일관되게 동작합니다.
그 결과, 이전에는 확인되었던 호출이 이제 모호해져 오버로드가 컨텍스트 파라미터로만 구별되는 경우 컴파일 오류가 발생합니다.
이러한 경우 컴파일러는 잠재적인 모호성에 대해 경고를 보고합니다.

다음은 예시입니다.

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 경고 보고: Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 2.3.20에서는 모호성 오류 보고
        saveUser(1)
    }
}
```

또한 Kotlin 2.3.20에서는 확인 및 코드 완성 시 과도한 오버로드 후보를 줄이기 위해 `kotlin.context` 오버로드 수를 22개에서 6개로 줄였습니다.

### 이름 기반 구조 분해 {id="language-name-based-destructuring"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20에서는 위치 기반 `componentN()` 함수에 의존하는 대신 변수를 프로퍼티 이름과 일치시키는 *이름 기반 구조 분해 선언(name-based destructuring declarations)*을 도입했습니다.

이전에는 [구조 분해 선언](destructuring-declarations.md)에서 위치 기반 구조 분해를 사용했습니다.

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

이 예제에서는 구조 분해가 `componentN()` 함수의 순서에 의존하기 때문에 `email`이 `username`의 값을 받고, `username`이 `email`의 값을 받게 됩니다.

Kotlin 2.3.20부터는 각 변수가 프로퍼티를 이름으로 참조하는 이름 기반 구조 분해를 사용할 수 있습니다.

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 명시적 형태의 이름 기반 구조 분해 사용
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

이름 기반 구조 분해는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
`-Xname-based-destructuring` 컴파일러 옵션을 사용하여 컴파일러가 구조 분해 선언을 해석하는 방식을 제어할 수 있습니다.

이 옵션에는 다음과 같은 모드가 있습니다.

* `only-syntax`: 기존 구조 분해 선언의 동작을 변경하지 않고 명시적 형태의 이름 기반 구조 분해를 활성화합니다.
* `name-mismatch`: 데이터 클래스의 위치 기반 구조 분해에서 프로퍼티 이름과 일치하지 않는 변수 이름을 사용할 때 경고를 보고합니다.
* `complete`: 괄호를 사용하는 축약형 이름 기반 구조 분해를 활성화하고 대괄호 구문을 통한 위치 기반 구조 분해를 계속 지원합니다.

`complete` 모드를 사용하면 괄호를 사용하는 축약형 구조 분해 구문이 위치에 의존하지 않고 변수를 프로퍼티 이름과 일치시킵니다.

```kotlin
val (email, username) = user
```
#### 활성화 방법 {id="language-name-based-destructuring-how-to-enable"}

프로젝트에서 이름 기반 구조 분해를 사용하려면 빌드 구성 파일에 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

이름 기반 구조 분해를 사용하도록 설정하면 대괄호를 사용하는 위치 기반 구조 분해의 새로운 구문도 도입됩니다.

```kotlin
// 명시적 위치 기반 구조 분해 사용
val [username, email] = user
```

향후에는 새로운 대괄호 구문으로 위치 기반 구조 분해를 유지하면서 기본적으로 이름 기반 매칭을 사용하는 구조 분해 선언으로 점진적으로 전환할 계획입니다.

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md)을 참조하세요.

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627)을 통해 공유해 주시면 감사하겠습니다.

## 표준 라이브러리 {id="standard-library"}

Kotlin 2.3.20에는 표준 라이브러리를 위한 새로운 실험적 기능이 포함되어 있습니다.

### `Map.Entry`의 불변 복사본 생성을 위한 새로운 API {id="standard-library-new-api-for-creating-immutable-copies-of-map-entry"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20에서는 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/)의 불변 복사본을 생성하는 `Map.Entry.copy()` 확장 함수를 도입했습니다.
이 함수를 사용하면 맵을 수정한 후에도 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html)에서 가져온 엔트리를 먼저 복사해 두어 재사용할 수 있습니다.

`Map.Entry.copy()`는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
사용을 선택(opt-in)하려면 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션이나 컴파일러 옵션을 사용하세요.

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

다음은 `Map.Entry.copy()`를 사용하여 가변 맵에서 엔트리를 제거하는 예제입니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

## Kotlin 컴파일러 플러그인 {id="kotlin-compiler-plugins"}

Kotlin 2.3.20에는 Lombok 및 `kotlin.plugin.jpa` 컴파일러 플러그인에 대한 중요한 업데이트가 포함되어 있습니다.

### `kotlin.plugin.jpa` 플러그인의 향상된 JPA 지원 {id="improved-jpa-support-in-the-kotlin-plugin-jpa-plugin"}
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` 플러그인은 기존 [`no-arg`](no-arg-plugin.md) 컴파일러 플러그인을 적용하는 것 외에도 새로 추가된 내장 JPA 프리셋과 함께 [`all-open`](all-open-plugin.md) 컴파일러 플러그인을 자동으로 적용합니다.

이전에는 `kotlin("plugin.jpa")`를 사용하면 JPA 프리셋이 적용된 `no-arg` 플러그인만 활성화되었습니다.

이번 릴리스에서는 `kotlin.plugin.jpa` 프리셋을 개선하여 `all-open` 플러그인이 자동으로 구성되도록 했습니다.
이를 통해 지연 로딩(lazy association)이 즉시 로딩(eager loading)을 유발하여 추가 쿼리를 발생시키는 대신 예상대로 작동하도록 보장합니다.

Kotlin 2.3.20부터는 다음과 같이 변경됩니다.

* `all-open` 컴파일러 플러그인이 JPA 프리셋을 제공합니다.
* Gradle `org.jetbrains.kotlin.plugin.jpa` 플러그인이 JPA 프리셋이 활성화된 `org.jetbrains.kotlin.plugin.all-open` 플러그인을 자동으로 적용합니다.
* [Maven JPA 설정](kotlin-jpa-plugin.md#maven)에서 기본적으로 JPA 프리셋과 함께 `all-open`을 활성화합니다. (IntelliJ IDEA 지원은 2026.1부터 제공됩니다.)
* Maven 의존성 `org.jetbrains.kotlin:kotlin-maven-noarg`에 이제 `org.jetbrains.kotlin:kotlin-maven-allopen`이 암시적으로 포함되므로 `<plugin><dependencies>` 블록에 명시적으로 추가할 필요가 없습니다.

결과적으로 다음 어노테이션이 지정된 JPA 엔티티는
추가 구성 없이 자동으로 `open`으로 처리되며 매개변수 없는(no-argument) 생성자를 갖게 됩니다.

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

이 변경 사항은 빌드 구성을 간소화하고 JPA 프레임워크와 함께 Kotlin을 사용할 때의 기본 제공 환경을 개선합니다.

> 곧 출시될 [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/)에서는 프로젝트에서 Kotlin을 설정할 때 `kotlin.plugin.jpa` 플러그인을 자동으로 구성합니다. IDE는 플러그인을 추가하고 중복된 `no-arg` 생성자 선언을 제거하는 퀵픽스(quick-fix)를 제공합니다.
>
{style="tip"}

### Lombok Alpha 단계 진입 {id="compiler-lombok-is-now-alpha"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20에서는 Kotlin과 Java 코드가 혼합된 모듈에서 [Java의 Lombok 선언](https://projectlombok.org/)을 생성하고 사용할 수 있는 실험적 [Lombok 컴파일러 플러그인](lombok.md)을 도입했습니다.

Kotlin 2.3.20에서는 이 기능을 상용 환경에서 사용할 수 있도록 준비할 계획이므로 Lombok 컴파일러 플러그인이 [Alpha](components-stability.md#stability-levels-explained) 단계로 격상되었습니다. 단, 아직 개발 중인 기능입니다.

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 2.3.20에서는 Java 상호 운용성에 대한 몇 가지 개선 사항이 도입되었습니다. 이제 컴파일러가 널 가능성(nullability) 검사를 위해 Vert.x `@Nullable` 어노테이션을 인식합니다.
또한 이번 릴리스에서는 어노테이션이 지정된 컬렉션을 Kotlin에서 읽기 전용으로 처리하도록 Java `@Unmodifiable` 및 `@UnmodifiableView` 어노테이션 지원을 추가했습니다.

### Vert.x `@Nullable` 어노테이션 지원 {id="support-for-vert-x-nullable-annotation"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20에서는 [`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) 어노테이션에 대한 지원을 추가했습니다.
컴파일러는 이제 이 어노테이션을 인식하며 기본적으로 널 가능성 불일치를 경고로 보고합니다.

엄격한 널 가능성 검사를 적용하고 이러한 경고를 오류로 격상하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnullability-annotations=@io.vertx.codegen.annotations:strict")
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
                    <arg>-Xnullability-annotations=@io.vertx.codegen.annotations:strict</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab>
</tabs>

### Java의 불변 컬렉션 어노테이션 지원 {id="support-for-java-unmodifiable-collection-annotations"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20에서는 [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) 및 [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) Java 어노테이션에 대한 지원을 추가했습니다.

Kotlin 2.3.20부터 이러한 어노테이션이 표시된 Java 선언에서 반환된 컬렉션은 Kotlin에서 읽기 전용으로 처리됩니다. 이를 가변 컬렉션 타입에 할당하면 타입 불일치 경고가 발생합니다. 이 경고는 Kotlin 2.5.0에서 오류가 될 예정입니다.

다음은 예시입니다.

```java
// Java
public class Java {
    public static @UnmodifiableView List<Object> unmodifiableView() {
        return List.of();
    }

    public static @Unmodifiable List<Object> unmodifiable() {
        return List.of();
    }
}
```

```kotlin
// Kotlin

fun main() {
    // 경고 보고: Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.3.20에서는 C 및 Objective-C 라이브러리를 위한 새로운 실험적 상호 운용성 모드, 크로스 컴파일 검사기, Kotlin/Native 프로젝트에서 컴파일 캐시를 비활성화하기 위한 새로운 DSL을 도입했습니다.

### 크로스 컴파일 검사기 {id="cross-compilation-checker"}
<secondary-label ref="native"/>

Kotlin 2.3.20에서는 지정된 타깃에 대해 크로스 컴파일이 지원되는지 확인할 수 있는 방법을 도입했습니다.
이는 컴파일 작업의 상태를 추적하는 타사 플러그인에 유용할 수 있습니다.

일반적으로 Kotlin/Native는 크로스 컴파일을 지원하므로 지원되는 모든 호스트가 지원되는 타깃에 대한 `.klib` 아티팩트를 생성할 수 있습니다.
그러나 프로젝트에서 [cinterop 의존성](native-c-interop.md)을 사용하는 경우 Apple 타깃에 대한 아티팩트 생성은 여전히 제한적입니다.

새로운 `crossCompilationSupported` API는 이제 크로스 컴파일이 지원되는지 확인합니다. 즉, 타깃이 호스트 관리자에 의해 활성화되어야 하며 타깃의 컴파일 중 어느 것도 cinterop 의존성을 포함하지 않아야 합니다.
검사기는 기본적으로 활성화되어 있습니다.

지원되는 타깃 및 호스트에 대한 자세한 내용은 [Kotlin/Native 설명서](native-target-support.md)를 참조하세요.

### 컴파일 캐시 비활성화를 위한 새로운 DSL {id="new-dsl-for-disabling-compilation-cache"}
<secondary-label ref="native"/>

Kotlin 2.3.20에는 Kotlin/Native 프로젝트에서 컴파일 캐시를 비활성화하기 위한 새로운 DSL이 포함되어 있습니다.
이는 캐시 비활성화 결정을 보다 신중하고 명시적으로 내릴 수 있도록 하기 위한 것입니다.

캐시를 비활성화하면 Kotlin/Native 빌드 속도가 크게 느려지므로 일시적이거나 예외적인 경우에만 사용해야 합니다.
그렇기 때문에 이제 캐시 비활성화가 특정 Kotlin 버전에 연결되며 문서 역할을 하는 이유를 반드시 포함해야 합니다.

프로젝트에서 컴파일 캐시를 비활성화해야 하는 경우 Gradle 빌드 파일의 `binaries {}` 블록을 다음과 같이 업데이트하세요.

```kotlin
kotlin {
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        // 바이너리 종류 지정
        it.binaries.framework {
            baseName = "CacheKind"
            isStatic = true

            // 새로운 DSL로 캐시 비활성화
            disableNativeCache(
                 version = DisableCacheInKotlinVersion.2_3_0, 
                 reason = "Cache bug",
                 issue = URI("https://youtrack.com/YY-1111")
            )
        }
    }
}
```

* `version` – 컴파일 캐시가 비활성화되는 Kotlin 버전입니다.
* `reason` (필수) – 컴파일 캐시가 비활성화되는 이유입니다.
* `issue` (선택 사항) – 버그 트래커의 해당 이슈에 대한 URL입니다.

새로운 DSL은 지원 중단된 `kotlin.native.cacheKind` Gradle 프로퍼티를 대체합니다. `gradle.properties` 파일에서 안전하게 제거해도 됩니다.

컴파일 시간 단축에 대한 자세한 팁은 [Kotlin/Native 설명서](native-improving-compilation-time.md)를 참조하세요.

### C 또는 Objective-C 라이브러리를 위한 새로운 상호 운용성 모드 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

Kotlin Multiplatform(KMP) 라이브러리나 애플리케이션에서 C 또는 Objective-C 라이브러리를 사용하는 경우, 새로운 상호 운용성 모드를 테스트하고 결과를 공유해 주시기 바랍니다.

일반적으로 Kotlin/Native는 C 및 Objective-C 라이브러리를 Kotlin으로 가져올 수 있도록 지원합니다.
그러나 KMP 라이브러리의 경우, 이전 컴파일러 버전과의 KMP 호환성 문제로 인해 이 기능이 현재 [영향을 받고 있습니다](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import).

즉, 특정 Kotlin 버전으로 컴파일된 KMP 라이브러리를 배포할 때 C 또는 Objective-C 라이브러리를 가져오면 이전 Kotlin 버전을 사용하는 프로젝트에서 해당 Kotlin 라이브러리를 사용하지 못할 수 있습니다.

이 문제와 기타 문제를 해결하기 위해 Kotlin 팀은 내부에서 사용되는 상호 운용성 메커니즘을 개선해 왔습니다.
Kotlin 2.3.20부터 컴파일러 옵션을 통해 새로운 모드를 사용해 볼 수 있습니다.

#### 활성화 방법 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"}

1. Gradle 빌드 파일에서 `cinterops {}` 블록이나 `pod()` 의존성이 있는지 확인합니다.
   이 항목들이 있다면 프로젝트에서 C 또는 Objective-C 라이브러리를 사용하는 것입니다.

2. 프로젝트에서 `2.3.20` 이상의 버전을 사용하는지 확인합니다.
3. 동일한 빌드 파일에서 cinterop 도구 호출 부분에 `-Xccall-mode` 컴파일러 옵션을 추가합니다.

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 평소와 같이 단위 테스트, 앱 실행 등을 통해 프로젝트를 빌드하고 테스트합니다.
   실패 후에도 Gradle이 작업을 계속 실행하도록 해 주는 `--continue` 옵션을 사용하면 한 번에 더 많은 문제를 찾는 데 도움이 됩니다.

> 새로운 상호 운용성 모드는 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이므로, 이 모드로 컴파일된 라이브러리를 아직 배포하지 **마세요**.
>
{style="warning"}

#### 결과 공유하기 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"}

새로운 상호 운용성 모드는 대부분의 경우 바로 대체하여 사용할 수 있도록 설계되었습니다.
궁극적으로는 기본적으로 활성화할 계획이지만, 이를 달성하려면 최대한 원활하게 작동하는지 확인하고 다음과 같은 이유로 다양한 프로젝트에서 테스트해야 합니다.

* 일부 C 및 Objective-C 선언은 새로운 모드에서 아직 지원되지 않습니다(주로 호환성 문제 때문). 이것이 실제 환경에 미치는 영향을 더 잘 이해하고 이에 따라 향후 단계의 우선순위를 정하고자 합니다.
* 버그나 미처 고려하지 못한 부분이 있을 수 있습니다. 수많은 기능이 상호 작용하는 단일 언어를 테스트하는 것도 어렵지만, 고유한 기능을 가진 언어 간의 상호 작용을 테스트하는 것은 더욱 까다롭습니다.

실제 프로젝트를 검토하고 해결하기 어려운 사례를 파악할 수 있도록 도와주세요.
문제가 발생하든 발생하지 않든, [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218)의 댓글로 결과를 공유해 주세요.

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.3.20에서는 문자열 연산 성능, 컴파일 시간 및 메모리 사용량이 개선되었습니다.
또한 Kotlin 객체나 클래스를 JavaScript 함수처럼 호출할 수 있는 실험적 `@nativeInvoke` 어노테이션 지원도 추가되었습니다.

### 향상된 문자열 성능 {id="improved-string-performance"}
<secondary-label ref="wasm"/>

Kotlin/Wasm은 이제 `kotlin.String` 값에 대한 연산에 JS 문자열 내장(String builtins) 기능을 사용합니다.
이를 통해 Kotlin/Wasm은 브라우저 및 해당 제안을 지원하는 Wasm 런타임에서 JavaScript 엔진의 문자열 최적화 혜택을 누릴 수 있습니다.
이 최적화는 연결(concatenation), 보간(interpolation), `StringBuilder.append()` 및 숫자-문자열 변환과 같은 연산에 적용됩니다.

이를 통해 다음과 같은 결과를 얻을 수 있습니다.

* 대상 벤치마크에서 문자열 보간 속도가 최대 4.6배 향상되었습니다.
* [KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app) 빌드에서 Wasm 바이너리 크기가 약 5% 줄어들었습니다.
* 모든 Wasm 벤치마크에서 중앙값 기준 약 1%의 개선이 있었습니다.
* 추가 연산이 많은(append-heavy) 워크로드에서 `StringBuilder.append()` 및 `kotlin.String` 인스턴스 연결 속도가 20% 이상 향상되었습니다.

### 컴파일 시간 단축 및 메모리 최적화 {id="improved-compilation-time-and-memory-optimizations"}
<secondary-label ref="wasm"/>

Kotlin 2.3.20에는 컴파일 중, 특히 대규모 프로젝트에서 메모리 소비를 크게 줄여주는 컴파일러 최적화가 추가되었습니다.
이러한 최적화는 증분 빌드 성능도 개선합니다.

테스트 결과, 클린 빌드 시간은 65%, 증분 빌드 시간은 21% 개선된 것으로 나타났습니다.

### `@nativeInvoke` 어노테이션 지원 {id="support-for-nativeinvoke-annotation"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20에서는 `wasmJs` 타깃을 위한 `@nativeInvoke` 어노테이션 지원을 도입했습니다.
이 어노테이션을 사용하면 Kotlin 객체나 클래스를 JavaScript의 함수처럼 취급할 수 있습니다.
`external` 선언(클래스 또는 인터페이스)의 멤버 함수를 JavaScript 객체의 "호출 연산자(invoke operator)"로 표시하도록 설계되었습니다.

함수에 이 어노테이션을 지정하면 Kotlin에서 해당 함수를 호출할 때마다 JavaScript 객체 자체를 직접 호출하는 것으로 변환됩니다.

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

이는 Kotlin/Wasm과 JavaScript 간의 안정적인 상호 운용성이 설계될 때까지의 임시 솔루션입니다.
향후 릴리스에서 수정되거나 제거될 수 있으며, 사용할 때 컴파일러가 경고를 보고합니다.

Kotlin/Wasm과 JavaScript 간의 상호 운용성에 대한 자세한 내용은 [JavaScript와의 상호 운용성](wasm-js-interop.md)을 참조하세요.

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.3.20에서는 TypeScript에서 Kotlin 인터페이스를 구현할 수 있게 되었으며, SWC 컴파일 플랫폼에 대한 실험적 지원이 도입되었습니다.

### JavaScript/TypeScript에서 Kotlin 인터페이스 구현 {id="implementing-kotlin-interfaces-from-javascript-typescript"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20에서는 JavaScript/TypeScript 측에서 Kotlin 인터페이스를 구현하는 것에 대한 제한이 해제되었습니다. 이전에는 Kotlin 인터페이스를 TypeScript 인터페이스로 TypeScript에 내보내는 것만 가능했고, TypeScript에서 이를 구현하는 것은 금지되어 있었습니다.

이제 다음과 같은 방식으로 모든 Kotlin 인터페이스를 구현할 수 있습니다.

```kotlin
// Kotlin
@JsExport
interface DataProcessor {
    suspend fun process(): String
}

@JsExport
fun registerProcessor(processor: DataProcessor) { ... }
```

```TypeScript
// TypeScript
import { DataProcessor, registerProcessor } from "my-kmp-library"

class JsonProcessor implements DataProcessor {
    readonly [DataProcessor.Symbol] = true

    async process(): Promise<string> {
        return "processed JSON data"
    }
}

registerProcessor(new JsonProcessor())
```

TypeScript에서 Kotlin 기본 구현(default implementation)을 재사용하는 것도 가능합니다.
TypeScript에는 인터페이스의 기본 구현 개념이 없지만, `DefaultImpls` 객체에 위임하여 이를 해결할 수 있습니다.

```kotlin
// Kotlin
@JsExport
interface Logger {
    fun log(): String = "[INFO] Default log entry"
    val prefix: String get() = "LOG"
}
```

```TypeScript
// TypeScript
import { Logger, acceptLogger } from "my-kmp-library"

class ConsoleLogger implements Logger {
    readonly [Logger.Symbol] = true

    // 기본 메서드 구현에 위임
    log(): string {
        return Logger.DefaultImpls.log(this);
    }

    // 기본 프로퍼티 구현에 위임
    get prefix(): string {
        return Logger.DefaultImpls.prefix.get(this);
    }
}

acceptLogger(new ConsoleLogger())
```

#### 활성화 방법 {id="how-to-enable-implementing-interfaces-from-typescript"}

빌드 파일에 새로운 컴파일러 옵션을 추가합니다.

```kotlin
kotlin { 
    js {
        // ...
        generateTypeScriptDefinitions()
        compilerOptions {
            freeCompilerArgs.add("-Xenable-implementing-interfaces-from-typescript")
        }
    }
}
```

자세한 내용은 [`@JsExport` 어노테이션](js-to-kotlin-interop.md#jsexport-annotation)을 참조하세요.

### SWC 컴파일 플랫폼 지원 {id="support-for-swc-compilation-platform"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20부터 Kotlin/JS는 [SWC](https://swc.rs/) 컴파일 플랫폼을 지원합니다.
이를 통해 최신 버전의 JavaScript/TypeScript 코드를 이전 버전과 호환성이 높은 JavaScript 코드로 트랜스파일할 수 있습니다.

코드 변환 작업을 외부 도구에 위임하면 Kotlin/JS 컴파일러가 생성하는 변형의 수를 줄이고 최신 JavaScript 기능 지원에만 집중하여 컴파일러 현대화를 가속화할 수 있습니다.
현재 지원되는 최신 ECMAScript 버전은 여전히 `es2015`입니다.

또한 트랜스파일 작업을 위임함으로써 [인라인 JavaScript](js-interop.md#inline-javascript) 기능을 개선할 수 있습니다.
현재는 ES5 구문만 지원됩니다(이는 2.4.0에서 변경될 예정입니다).
낮은 버전을 타깃으로 하면서 최신 구문을 지원하는 것은 컴파일러가 인라인 JS 블록 내의 JS 코드를 자체적으로 트랜스파일해야 하므로 까다로운 작업이었습니다.
SWC를 사용하면 최신 JS 구문을 추가할 수 있고, 도구가 최종 사용자 버전에 필요한 구문으로 코드를 트랜스파일해 줍니다.

SWC로 마이그레이션하면 Kotlin Gradle 플러그인 내에서 [browserslist](https://browsersl.ist/) 기반 DSL을 구현할 수도 있습니다.
이를 통해 특정 JS 버전 대신 대상 브라우저나 환경을 선언할 수 있습니다.

#### 활성화 방법 {id="how-to-enable-swc-compilation"}

`gradle.properties` 파일에 다음 옵션을 추가합니다.

```properties
kotlin.js.delegated.transpilation=true
```

향후 Kotlin 릴리스에서 SWC를 통한 트랜스파일 기능을 안정화할 계획입니다.
기본값이 된 후에는 여러 JS 타깃을 컴파일하는 기능이 Kotlin/JS 컴파일러에서 트랜스파일러로 완전히 위임됩니다.

SWC 플랫폼에 대한 자세한 내용은 공식 [문서](https://swc.rs/docs/getting-started)를 참조하세요.

## Gradle {id="gradle"}

Kotlin 2.3.20은 최신 버전의 Gradle과 호환되며 Kotlin Gradle 플러그인의 Kotlin/JVM 컴파일에 대한 변경 사항이 포함되어 있습니다.

### Gradle 9.3.0과의 호환성 {id="compatibility-with-gradle-9-3-0"}
<secondary-label ref="gradle"/>

Kotlin 2.3.20은 Gradle 7.6.3부터 9.3.0까지 완벽하게 호환됩니다. 최신 Gradle 릴리스 버전까지도 사용할 수 있습니다.
그러나 최신 버전을 사용할 경우 지원 중단(deprecation) 경고가 발생할 수 있으며 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다.

### KGP의 바이너리 호환성 검증 개선 {id="improvements-to-binary-compatibility-validation-in-kgp"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0에서는 [Kotlin Gradle 플러그인의 바이너리 호환성 검증](gradle-binary-compatibility-validation.md) 지원이 처음으로 도입되었습니다. Kotlin 2.3.20에서는 두 가지 개선 사항이 추가되었습니다.

첫째, 바이너리 호환성 검증 Gradle 작업의 이름에 더 이상 "Legacy"가 포함되지 않습니다.
이전 명명 규칙이 Kotlin 개발자들에게 혼란을 주었기 때문에 이 변경을 진행했습니다.

| 이전 이름             | 새로운 이름                   |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

이전 작업 이름은 새로운 이름으로의 원활한 전환을 위해 Kotlin 2.3.20에서도 계속 유지됩니다.

둘째, 프로젝트에서 바이너리 호환성 검증을 사용하도록 설정한 경우, 이제 `check` 작업을 실행할 때 Gradle이 자동으로 `checkKotlinAbi` 작업을 실행합니다.
이전에는 `check` 작업이 모든 검증 작업을 실행해야 함에도 불구하고 Gradle이 `checkKotlinAbi` 작업을 실행하지 않았습니다.
이로 인해 Gradle 프로젝트에서 일관되지 않은 동작이 발생했습니다.

### Kotlin/JVM 컴파일에서 기본적으로 빌드 도구 API 사용 {id="kotlin-jvm-compilation-uses-build-tools-api-by-default"}
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

Kotlin 2.3.20에서는 Kotlin Gradle 플러그인의 Kotlin/JVM 컴파일이 기본적으로 [빌드 도구 API(Build tools API)](build-tools-api.md)(BTA)를 사용합니다. 내부 컴파일 인프라의 이러한 변화를 통해 Kotlin 컴파일러에 대한 빌드 도구 지원을 더욱 빠르게 개발할 수 있게 되었습니다.

문제가 발견되면 [이슈 트래커](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration)를 통해 의견을 공유해 주세요.

## Maven {id="maven"}

Kotlin 2.3.20에는 Maven 프로젝트를 더 쉽게 설정할 수 있도록 돕는 중요한 변경 사항이 포함되어 있습니다.

### Kotlin 프로젝트를 위한 간소화된 설정 {id="maven-simplified-setup-for-kotlin-projects"}
<secondary-label ref="maven"/>

Kotlin 2.3.20에서는 Maven 프로젝트에서 Kotlin을 설정하기가 더 쉬워졌습니다. 이제 소스 루트와 Kotlin 표준 라이브러리의 자동 구성을 지원합니다.

새로운 구성을 사용하면 Maven 빌드 시스템으로 새 Kotlin 프로젝트를 생성하거나 기존 Java Maven 프로젝트에 Kotlin을 도입할 때, POM 빌드 파일에 소스 루트 경로를 수동으로 지정하거나 `kotlin-stdlib` 의존성을 추가할 필요가 없습니다.

#### 활성화 방법 {id="maven-simplified-setup-for-kotlin-projects-how-to-enable"}

`pom.xml` 파일의 Kotlin Maven 플러그인 `<build><plugins>` 섹션에 `<extensions>true</extensions>`를 추가합니다.

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 이 확장을 추가합니다 -->
         </plugin>
    </plugins>
</build>
```

여기서 `<extensions>` 옵션의 새로운 기능은 다음과 같습니다.

* `src/main/kotlin` 및 `src/test/kotlin` 디렉터리가 이미 존재하지만 플러그인 구성에 지정되지 않은 경우 이를 소스 루트로 등록합니다.
* `kotlin-stdlib` 의존성이 아직 명시적으로 정의되지 않은 경우 자동으로 추가합니다.

Kotlin 표준 라이브러리의 자동 추가를 비활성화할 수도 있습니다. 이를 위해 `<properties>` 섹션에 다음을 추가하세요.

```xml
<project>
    <properties>
        <!-- 프로퍼티를 통해 스마트 기본값 비활성화 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

이 프로퍼티는 표준 라이브러리의 자동 추가뿐만 아니라 소스 루트 경로의 등록도 비활성화한다는 점에 유의하세요.
다른 `<extensions>` 기능에는 영향을 주지 않습니다.

Kotlin Maven 프로젝트 구성에 대한 자세한 내용은 [Maven 프로젝트 구성](maven-configure-project.md)을 참조하세요.

## 빌드 도구 API (Build tools API) {id="build-tools-api"}

Kotlin 2.3.20에서는 빌드 도구 API(BTA)를 사용하여 빌드 시스템을 Kotlin 컴파일러와 통합하려는 개발자를 위한 추가 변경 사항이 도입되었습니다.

### 빌드 작업(Build operation) 개선 {id="improvements-to-build-operations"}
<secondary-label ref="bta"/>

이번 릴리스에서 BTA는 빌드 도구가 빌드 작업을 관리하는 방식을 개선했습니다.
빌드 작업을 통해 빌드 도구가 Kotlin 컴파일러와 상호 작용할 수 있습니다.
각 빌드 작업은 [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) 인터페이스의 구현체입니다.

이제 [`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 함수를 사용하여 [`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) 인터페이스를 구현하는 빌드 작업을 취소할 수 있습니다.

`cancel()` 함수는 "최선의 노력(best effort)" 방식으로 동작합니다. 즉, 작업이 반드시 취소된다고 보장되지는 않습니다.

예시:

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("Build operation has been cancelled.")
    }
}

// ...

// 다른 스레드에서:
operation.cancel()
```

또한 빌드 작업이 시작된 후에는 변경할 수 없도록 생성할 수 있어 빌드 작업이 더욱 견고해졌습니다. 이를 위해 빌드 도구는 빌더 패턴을 사용해야 합니다.

1. 가변(mutable) 빌더를 사용하여 객체를 구성합니다.
2. [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 함수를 호출하여 객체의 불변(immutable) 인스턴스를 생성합니다.

예시:

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // 빌더를 사용하여 작업 구성
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // 불변 작업 반환
    return builder.build()
}
```

### 빌드 도구 전반에 걸친 일관된 메트릭 수집 {id="consistent-metric-collection-across-build-tools"}
<secondary-label ref="bta"/>

Kotlin 2.3.20 이전에는 빌드 메트릭 인프라가 Gradle 중심으로 구성되어 있어 메트릭 이름 등 인프라의 일부에 영향을 미쳤습니다.
또한 다양한 [컴파일러 실행 전략](compiler-execution-strategy.md)에 따라 모든 메트릭을 사용할 수 있는 것은 아니었습니다.

Kotlin 2.3.20에서 BTA는 JVM을 위한 빌드 도구 독립적인 메트릭 수집 기능을 제공합니다.
또한 BTA는 컴파일러 실행 전략과 관계없이 일관된 메트릭 세트를 도입합니다.
특정 컴파일 방식이나 컴파일러 실행 전략에 고유한 메트릭은 해당되는 경우에만 보고됩니다.
예를 들어 증분 컴파일 메트릭은 증분 빌드에서만 사용할 수 있고, 데몬 전용 메트릭은 Kotlin 데몬을 사용할 때만 제공됩니다.

이제 빌드 도구는 빌드 작업에 대해 [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) 객체를 구성하여 사용자에게 빌드 성능에 대한 인사이트를 제공하는 빌드 메트릭을 캡처할 수 있습니다.

```kotlin
val operation =
    kotlinToolchains.jvm.jvmCompilationOperationBuilder(sources, outputDirectory)
operation[BuildOperation.METRICS_COLLECTOR] = object : BuildMetricsCollector {
    override fun collectMetric(
        name: String,
        type: BuildMetricsCollector.ValueType,
        value: Long
    ) {
        // ...
    }
}
```

### 빌드 도구의 컴파일러 플러그인 구성 용이화 {id="easier-configuration-of-compiler-plugins-by-build-tools"}
<secondary-label ref="bta"/>

Kotlin 2.3.20에서 BTA는 빌드 도구가 컴파일러 플러그인을 구성할 수 있는 새롭고 더 간단한 방법을 제공합니다.
이 접근 방식을 통해 빌드 도구는 구성을 사용자에게 직접 전파할 수 있습니다.

실험적 컴파일러 옵션을 사용하여 명령줄을 통해 컴파일러 플러그인을 구성하는 대신,
빌드 도구는 `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` 옵션을 사용하여 컴파일러 플러그인 구성을 나타내는 객체 목록을 구성할 수 있습니다.

```kotlin
import org.jetbrains.kotlin.buildtools.api.KotlinToolchains
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.arguments.CommonCompilerArguments.Companion.COMPILER_PLUGINS
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain.Companion.jvm
import org.jetbrains.kotlin.buildtools.api.jvm.operations.JvmCompilationOperation
import java.nio.file.Path

...

val toolchains: KotlinToolchains = ...
val jvmToolchain: JvmPlatformToolchain = toolchains.jvm
val operation: JvmCompilationOperation.Builder = jvmToolchain.jvmCompilationOperationBuilder(...)
val noArgPluginClasspath: List<Path> = ...
operation.compilerArguments[COMPILER_PLUGINS] = listOf(
    CompilerPlugin(
        pluginId = "org.jetbrains.kotlin.noarg",
        classpath = noArgPluginClasspath,
        rawArguments = listOf(CompilerPluginOption("annotation", "GenerateNoArgsConstructor")),
        orderingRequirements = emptySet(),
    )
)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example code"}

## 호환성을 깨뜨리는 변경 사항 및 지원 중단 {id="breaking-changes-and-deprecations"}

이 섹션에서는 중요한 호환성을 깨뜨리는 변경 사항(breaking changes)과 지원 중단 사항을 다룹니다. Kotlin 2.3.0 및 2.3.20의 지원 중단에 대한 자세한 내용은 [호환성 가이드](compatibility-guide-23.md)를 참조하세요.

* Kotlin 2.3.20에서 Kotlin/Wasm은 사후에 `_initialize()` 함수를 호출하기 위해 외부 JavaScript에 의존하는 대신 Wasm 모듈 인스턴스화의 일환으로 모듈 초기화를 수행합니다.
  이 변경으로 Kotlin/Wasm의 독립성이 향상되었으며 [ES 모듈 통합 제안(ES module integration proposal)](https://github.com/WebAssembly/esm-integration)에 대비할 수 있게 되었습니다.

  [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) 어노테이션을 사용하는 경우 모듈 초기화가 완료되기 전에 관련 코드가 실행되면 실패할 수 있습니다. 꼭 필요한 경우가 아니라면 `@EagerInitialization` 어노테이션을 사용하지 않는 것을 권장합니다.
* 실험적 컨텍스트 리시버(context receivers)는 더 이상 지원되지 않으며 [컨텍스트 파라미터(context parameters)](context-parameters.md)로 대체됩니다.
* 이번 릴리스에서는 [인텔 칩 기반 Apple 타깃의 지원 중단 주기](whatsnew2220.md#deprecation-of-x86-64-apple-targets)에서 다음 단계를 진행합니다. Kotlin 2.3.20부터 `macosX64`, `tvosX64`, `watchosX64` 타깃에 대한 지원 중단을 예고합니다. 다음 Kotlin 릴리스에서 이 타깃들에 대한 지원을 완전히 제거할 계획입니다.

  많은 타사 라이브러리가 여전히 `iosX64` 타깃에 의존하고 있으므로 당분간은 지원 티어 3에 유지할 예정입니다. 즉, CI 테스트를 보장하지 않으며 서로 다른 컴파일러 릴리스 간의 소스 및 바이너리 호환성을 제공하지 않을 수 있습니다. 지원 티어에 대한 자세한 내용은 [Kotlin/Native 타깃 지원](native-target-support.md)을 참조하세요.
* Kotlin 2.3.20에서는 공통 소스 세트와 플랫폼 소스 세트 간에 의존성 확인 결과가 다를 때 Kotlin Multiplatform의 엄격해진 의존성 매칭으로 인해 메타데이터 컴파일 실패가 발생할 수 있습니다. 자세한 내용과 해결 방법은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) 이슈를 참조하세요.

## 설명서 업데이트 {id="documentation-updates"}

Kotlin 생태계의 설명서에 다음과 같은 변경 사항이 있었습니다.

* [Kotlin 로드맵](roadmap.md) – 언어 및 생태계 발전에 대한 Kotlin의 업데이트된 우선순위 목록을 확인하세요.
* [AGP 9로 업그레이드](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – Android 앱이 포함된 멀티플랫폼 프로젝트를 AGP 9로 마이그레이션하기 위한 권장 사항을 확인하세요.
* [KMP 앱을 위한 CI 구성](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – 튜토리얼을 따라 멀티플랫폼 프로젝트에서 지속적 통합(CI)을 위한 GitHub Actions를 구성해 보세요.
* [Compose UI 미리보기](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – 에뮬레이터를 실행하지 않고 IDE에서 컴포저블을 미리 보는 방법을 알아보세요.
* [웹 리소스 처리](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – Compose Multiplatform에서 웹 리소스를 처리하는 방법에 대한 정보를 찾아보세요.
* [뷰포트 설정](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – 웹용 Compose Multiplatform을 사용하여 HTML 캔버스에 UI를 렌더링하기 위해 `ComposeViewport()` 함수를 사용하는 방법을 알아보세요.
* [커스텀 컴파일러 플러그인](custom-compiler-plugins.md) – 컴파일러 플러그인의 작동 방식과 사용 사례에 맞는 플러그인을 찾을 수 없을 때 취할 수 있는 조치에 대해 알아보세요.
* [애플리케이션 구조](https://ktor.io/docs/server-application-structure.html) – Ktor Server 앱에 가장 적합한 애플리케이션 구조를 선택해 보세요.
* [HTTP 요청 라이프사이클](https://ktor.io/docs/server-http-request-lifecycle.html) – HTTP 요청 라이프사이클을 사용하여 클라이언트의 연결이 끊어졌을 때 Ktor에서 요청 처리를 취소하는 방법을 알아보세요.
* [의존성 주입](https://ktor.io/docs/server-dependency-injection.html) – 최신 안내와 실용적인 예제를 통해 Ktor Server에서 의존성 주입을 구성하는 방법을 알아보세요.
* [Exposed의 Spring Boot 연동](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – Spring Boot 3 및 4에서 Exposed를 사용하는 방법을 알아보세요.