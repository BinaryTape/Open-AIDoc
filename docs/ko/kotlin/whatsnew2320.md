[//]: # (title: Kotlin 2.3.20의 새로운 기능)

<show-structure depth="1"/>

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm 업데이트, 그리고 Gradle 및 Maven 빌드 도구 지원을 포함한 Kotlin 2.3.20 릴리스 노트를 확인해 보세요.</web-summary>

_[릴리스일: 2026년 3월 16일](releases.md#release-history)_

<tldr>
    <p>버그 수정 릴리스인 2.3.21에 대한 자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">변경 로그(changelog)</a>를 참조하세요.</p>
</tldr>

Kotlin 2.3.20 버전이 릴리스되었습니다! 이번 버전의 주요 하이라이트는 다음과 같습니다.

* **Gradle**: [Gradle 9.3.0 호환성](#compatibility-with-gradle-9-3-0) 및 [Kotlin/JVM 컴파일 시 BTA 기본 사용](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**: [Kotlin 프로젝트 설정 간소화](#simplified-setup-for-kotlin-projects)
* **Kotlin 컴파일러 플러그인**: [Lombok 플러그인 Alpha 단계 진입](#lombok-is-now-alpha) 및 [`kotlin.plugin.jpa` 플러그인의 JPA 지원 개선](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **언어**: [이름 기반 구조 분해 선언(Name-based destructuring declarations) 지원](#name-based-destructuring)
* **표준 라이브러리**: [`Map.Entry`의 불변 복사본 생성을 위한 새로운 API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**: [C 및 Objective-C 라이브러리를 위한 새로운 상호운용성(Interoperability) 모드](#new-interoperability-mode-for-c-or-objective-c-libraries)

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 출시 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin 2.3.20으로 업데이트하기

최신 버전의 Kotlin은 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)에 포함되어 있습니다.

새로운 Kotlin 버전으로 업데이트하려면 IDE를 최신 버전으로 업데이트하고, 빌드 스크립트에서 [Kotlin 버전](releases.md#update-to-a-new-kotlin-version)을 2.3.20으로 변경하세요.

## 새로운 기능 {id=new-stable-features}
<primary-label ref="stable"/>

이번 릴리스에서 다음 기능이 [Stable(안정화)](components-stability.md#stability-levels-explained) 단계가 되었습니다.

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### Kotlin 프로젝트 설정 간소화 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20에서는 Maven 프로젝트에서 Kotlin을 더 쉽게 설정할 수 있습니다. 이제 Kotlin은 소스 루트(Source roots)와 Kotlin 표준 라이브러리의 자동 구성을 지원합니다.

새로운 구성을 사용하면, Maven 빌드 시스템으로 새로운 Kotlin 프로젝트를 생성하거나 기존 Java Maven 프로젝트에 Kotlin을 도입할 때 POM 빌드 파일에 소스 루트 경로를 수동으로 지정하거나 `kotlin-stdlib` 의존성을 추가할 필요가 없습니다.

#### 활성화 방법 {id="%id2%"}

`pom.xml` 파일에서 Kotlin Maven 플러그인의 `<build><plugins>` 섹션에 `<extensions>true</extensions>`를 추가하세요.

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- 이 익스텐션을 추가하세요 -->
         </plugin>
    </plugins>
</build>
```

새로운 `<extensions>` 옵션의 기능은 다음과 같습니다:

* `src/main/kotlin` 및 `src/test/kotlin` 디렉터리가 이미 존재하지만 플러그인 설정에 지정되지 않은 경우, 이를 소스 루트로 등록합니다.
* `kotlin-stdlib` 의존성이 명시적으로 정의되지 않은 경우 이를 추가합니다.

Kotlin 표준 라이브러리의 자동 추가 기능을 사용하지 않도록 설정할 수도 있습니다. 이를 위해 `<properties>` 섹션에 다음 내용을 추가하세요.

```xml
<project>
    <properties>
        <!-- 프로퍼티를 통해 스마트 기본값(Smart defaults) 비활성화 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

이 프로퍼티는 표준 라이브러리의 자동 추가뿐만 아니라 소스 루트 경로의 등록도 비활성화한다는 점에 유의하세요. 다른 `<extensions>` 기능에는 영향을 주지 않습니다.

Kotlin Maven 프로젝트 구성에 대한 자세한 내용은 [Maven 프로젝트 구성](maven-configure-project.md)을 참조하세요.

</snippet>

## 새로운 기능 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

이번 릴리스에서는 다음과 같은 Pre-stable(안정화 전) 기능을 사용할 수 있습니다.
여기에는 [Beta](components-stability.md#stability-levels-explained), [Alpha](components-stability.md#stability-levels-explained), [Experimental](components-stability.md#stability-levels-explained) 상태의 기능이 포함됩니다.

* [컴파일러: Lombok 플러그인 Alpha 단계 진입](#lombok-is-now-alpha)
* [언어: 이름 기반 구조 분해(Name-based destructuring)](#name-based-destructuring)
* [표준 라이브러리: `Map.Entry`의 불변 복사본 생성을 위한 새로운 API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native: C 또는 Objective-C 라이브러리를 위한 새로운 상호운용성 모드](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok 플러그인 Alpha 단계 진입 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20에서 도입된 실험적인 [Lombok 컴파일러 플러그인](lombok.md)은 Kotlin과 Java 코드가 섞여 있는 모듈에서 [Java의 Lombok 선언](https://projectlombok.org/)을 생성하고 사용할 수 있게 해줍니다.

Kotlin 2.3.20에서는 Lombok 컴파일러 플러그인이 [Alpha](components-stability.md#stability-levels-explained) 단계로 승격되었습니다. 이 기능을 프로덕션에서 사용할 수 있도록 준비할 계획이며, 현재 계속 개발 중입니다.

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 이름 기반 구조 분해 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20은 위치 기반의 `componentN()` 함수에 의존하는 대신, 변수를 프로퍼티 이름과 일치시키는 *이름 기반 구조 분해 선언(Name-based destructuring declarations)*을 도입합니다.

이전의 [구조 분해 선언](destructuring-declarations.md)은 위치 기반 구조 분해를 사용했습니다.

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

이 예제에서 구조 분해는 `componentN()` 함수의 순서에 의존하기 때문에, `email` 변수는 `username`의 값을 받고 `username` 변수는 `email`의 값을 받게 됩니다.

Kotlin 2.3.20부터는 각 변수가 이름으로 프로퍼티를 참조하는 이름 기반 구조 분해를 사용할 수 있습니다.

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

이름 기반 구조 분해는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. `-Xname-based-destructuring` 컴파일러 옵션을 사용하여 컴파일러가 구조 분해 선언을 해석하는 방식을 제어할 수 있습니다.

다음과 같은 모드를 지원합니다:

* `only-syntax`: 기존 구조 분해 선언의 동작을 변경하지 않고 명시적 형태의 이름 기반 구조 분해 구문만 활성화합니다.
* `name-mismatch`: 데이터 클래스에서 위치 기반 구조 분해를 사용할 때 변수 이름이 프로퍼티 이름과 일치하지 않으면 경고를 보고합니다.
* `complete`: 괄호를 사용하는 짧은 형태의 이름 기반 구조 분해를 활성화하며, 대괄호 구문을 통한 위치 기반 구조 분해도 계속 지원합니다.

`complete` 모드를 사용하면 괄호를 사용한 짧은 형태의 구조 분해 구문이 위치에 의존하지 않고 변수를 프로퍼티 이름과 일치시킵니다.

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

이름 기반 구조 분해를 옵트인(Opt-in)하면 대괄호를 사용하는 위치 기반 구조 분해를 위한 새로운 구문도 도입됩니다.

```kotlin
// 명시적 위치 기반 구조 분해 사용
val [username, email] = user
```

향후 새로운 대괄호 구문으로 위치 기반 구조 분해를 유지하면서, 기본적으로 이름 기반 매칭을 사용하는 구조 분해 선언으로 점진적으로 전환할 계획입니다.

더 자세한 정보는 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md) 문서를 참조하세요.

[YouTrack](https://youtrack.jetbrains.com/issue/KT-19627)을 통해 여러분의 피드백을 기다리고 있습니다.

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### `Map.Entry`의 불변 복사본 생성을 위한 새로운 API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20은 [`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/)의 불변(immutable) 복사본을 생성하기 위한 `Map.Entry.copy()` 확장 함수를 도입합니다. 이 함수를 사용하면 맵을 수정하기 전에 항목을 먼저 복사함으로써 [`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html)에서 얻은 항목을 재사용할 수 있습니다.

`Map.Entry.copy()`는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. 옵트인하려면 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션이나 컴파일러 옵션을 사용하세요.

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

다음은 `Map.Entry.copy()`를 사용하여 가변(mutable) 맵에서 항목을 제거하는 예제입니다.

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

### C 또는 Objective-C 라이브러리를 위한 새로운 상호운용성 모드 {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

Kotlin Multiplatform(KMP) 라이브러리나 애플리케이션에서 C 또는 Objective-C 라이브러리를 사용하는 경우, 새로운 상호운용성 모드를 테스트하고 그 결과를 공유해 주시기 바랍니다.

일반적으로 Kotlin/Native는 C 및 Objective-C 라이브러리를 Kotlin으로 가져오는 기능을 지원합니다. 그러나 KMP 라이브러리의 경우, 이 기능은 현재 이전 컴파일러 버전과의 KMP 호환성 이슈의 [영향을 받고 있습니다](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import).

즉, 특정 Kotlin 버전으로 컴파일된 KMP 라이브러리를 게시할 때 C 또는 Objective-C 라이브러리를 가져오면, 해당 Kotlin 라이브러리를 이전 버전의 Kotlin 프로젝트에서 사용하지 못할 수도 있습니다.

이 문제와 다른 이슈들을 해결하기 위해 Kotlin 팀은 내부적으로 사용되는 상호운용성 메커니즘을 수정해 왔습니다. Kotlin 2.3.20부터 컴파일러 옵션을 통해 새로운 모드를 사용해 볼 수 있습니다.

#### 활성화 방법 {id="%id8%"}

1. Gradle 빌드 파일에서 `cinterops {}` 블록이나 `pod()` 의존성이 있는지 확인하세요. 이것이 있다면 해당 프로젝트는 C 또는 Objective-C 라이브러리를 사용 중인 것입니다.
2. 프로젝트가 `2.3.20` 이상의 버전을 사용하는지 확인하세요.
3. 동일한 빌드 파일에서 cinterop 도구 호출에 `-Xccall-mode` 컴파일러 옵션을 추가하세요.

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

4. 유닛 테스트, 앱 실행 등을 통해 평소와 같이 프로젝트를 빌드하고 테스트하세요. `--continue` 옵션을 사용하면 태스크가 실패하더라도 Gradle이 실행을 계속하게 하여 여러 문제를 한 번에 찾는 데 도움이 됩니다.

> 새로운 상호운용성 모드로 컴파일된 라이브러리는 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이므로 아직 **게시하지 마세요**.
>
{style="warning"}

#### 결과 보고 {id="%id9%"}

새로운 상호운용성 모드는 대부분의 경우 기존 방식을 그대로 대체(drop-in replacement)할 수 있도록 설계되었습니다. 향후 이를 기본값으로 활성화할 계획입니다. 하지만 이를 위해 가능한 한 잘 작동하는지 확인하고 광범위한 프로젝트에서 테스트해야 합니다. 이유는 다음과 같습니다:

* 일부 C 및 Objective-C 선언이 새로운 모드에서 아직 지원되지 않습니다(주로 호환성 문제 때문). 이러한 실제 영향도를 파악하고 향후 단계의 우선순위를 정하고자 합니다.
* 아직 고려하지 못한 버그나 사항이 있을 수 있습니다. 수많은 기능이 상호작용하는 언어를 테스트하는 것은 도전적인 일이며, 각기 고유한 기능을 가진 언어 간의 상호작용을 테스트하는 것은 더욱 어렵습니다.

실제 프로젝트를 조사하고 까다로운 사례를 식별할 수 있도록 도와주세요. 문제가 발생하든 발생하지 않든, [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218)의 댓글로 결과를 공유해 주시기 바랍니다.

</snippet>

## 언어

Kotlin 2.3.20은 위치에 의존하지 않고 변수를 프로퍼티 이름과 일치시키는 이름 기반 구조 분해 선언을 추가합니다. 또한 컨텍스트 파라미터(context parameters)가 있는 선언에 대한 오버로드 해소(overload resolution) 규칙이 변경되었습니다.

### 컨텍스트 파라미터 오버로드 해소 규칙 변경
<secondary-label ref="language"/>

Kotlin 2.3.20에서는 컨텍스트 파라미터가 있는 선언의 오버로드 해소 방식이 변경되었습니다.

이전에는 오버로드 해소 시 컨텍스트 파라미터가 있는 선언이 없는 선언보다 더 구체적인(more specific) 것으로 처리되었습니다.

Kotlin 2.3.20부터 이 규칙은 더 이상 적용되지 않으며, 오버로드 선택이 더 일관되게 이루어집니다. 결과적으로 이전에는 해결되었던 호출이 이제 모호해질 수 있으며, 오버로드가 컨텍스트 파라미터에 의해서만 차이가 나는 경우 컴파일 에러가 발생합니다. 이러한 경우 컴파일러는 잠재적인 모호성에 대해 경고합니다.

예시는 다음과 같습니다:

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 경고 발생: Contextual declaration is shadowed (컨텍스트 선언이 가려짐)
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 2.3.20에서는 모호성 에러가 발생함
        saveUser(1)
    }
}
```

추가로, Kotlin 2.3.20은 오버로드 해소 및 코드 완성 중 과도한 오버로드 후보군을 줄이기 위해 `kotlin.context` 오버로드 수를 22개에서 6개로 줄였습니다.

<include from="whatsnew2320.md" element-id="name-based-destructuring-content">
<var name="id4" value="language-name-based-destructuring"/>
<var name="id5" value="language-name-based-destructuring-how-to-enable"/>
</include>

## 표준 라이브러리

Kotlin 2.3.20은 표준 라이브러리에 새로운 실험적 기능을 포함합니다.

<include from="whatsnew2320.md" element-id="new-api-for-creating-immutable-copies-of-map-entry-content">
<var name="id6" value="standard-library-new-api-for-creating-immutable-copies-of-map-entry"/>
</include>

## Kotlin 컴파일러 플러그인

Kotlin 2.3.20은 Lombok 및 `kotlin.plugin.jpa` 컴파일러 플러그인에 중요한 업데이트를 가져왔습니다.

### `kotlin.plugin.jpa` 플러그인의 JPA 지원 개선
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` 플러그인은 이제 기존의 [`no-arg`](no-arg-plugin.md) 컴파일러 플러그인 적용과 더불어, 새로 추가된 내장 JPA 프리셋과 함께 [`all-open`](all-open-plugin.md) 컴파일러 플러그인을 자동으로 적용합니다.

이전에는 `kotlin("plugin.jpa")` 사용 시 JPA 프리셋이 적용된 `no-arg` 플러그인만 활성화되었습니다.

이번 릴리스에서는 `all-open` 플러그인이 자동으로 구성되도록 `kotlin.plugin.jpa` 프리셋을 개선했습니다. 이를 통해 지연 연관 관계(lazy associations)가 의도한 대로 작동하며, 즉시 로딩(eager loading)으로 인한 추가 쿼리 발생을 방지합니다.

Kotlin 2.3.20부터 변경되는 사항:

* `all-open` 컴파일러 플러그인이 JPA 프리셋을 제공합니다.
* Gradle `org.jetbrains.kotlin.plugin.jpa` 플러그인은 JPA 프리셋이 활성화된 `org.jetbrains.kotlin.plugin.all-open` 플러그인을 자동으로 적용합니다.
* [Maven JPA 설정](no-arg-plugin.md#jpa-support)은 기본적으로 JPA 프리셋과 함께 `all-open`을 활성화합니다. (IntelliJ IDEA 지원은 2026.1부터 가능합니다.)
* Maven 의존성 `org.jetbrains.kotlin:kotlin-maven-noarg`에 이제 `org.jetbrains.kotlin:kotlin-maven-allopen`이 암시적으로 포함되므로, 더 이상 `<plugin><dependencies>` 블록에 명시적으로 추가할 필요가 없습니다.

결과적으로 다음 어노테이션이 지정된 JPA 엔티티는 별도의 설정 없이 자동으로 `open`으로 처리되고 인자 없는 생성자(no-argument constructor)를 갖게 됩니다:

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

이러한 변경은 빌드 구성을 단순화하고 Kotlin을 JPA 프레임워크와 함께 사용할 때의 초기 경험을 개선합니다.

> 곧 출시될 [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/)은 프로젝트에서 Kotlin을 설정할 때 `kotlin.plugin.jpa` 플러그인을 자동으로 구성합니다. IDE는 플러그인을 추가하고 불필요한 인자 없는 생성자 선언을 제거하는 퀵픽스(quick-fix) 기능을 제공합니다.
>
{style="tip"}

<include from="whatsnew2320.md" element-id="lombok-is-now-alpha-content">
<var name="id3" value="compiler-lombok-is-now-alpha"/>
</include>

## Kotlin/JVM

Kotlin 2.3.20은 Java 상호운용성에 대한 여러 개선 사항을 도입합니다. 이제 컴파일러는 null 가능성 검사를 위해 Vert.x의 `@Nullable` 어노테이션을 인식합니다. 또한 Java의 `@Unmodifiable` 및 `@UnmodifiableView` 어노테이션을 지원하여, 해당 어노테이션이 달린 컬렉션을 Kotlin에서 읽기 전용으로 처리합니다.

### Vert.x `@Nullable` 어노테이션 지원
<secondary-label ref="jvm"/>

Kotlin 2.3.20은 [`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) 어노테이션에 대한 지원을 추가했습니다. 컴파일러는 이제 이 어노테이션을 인식하고 기본적으로 null 가능성 불일치를 경고로 보고합니다.

엄격한 null 가능성 검사를 강제하고 이러한 경고를 에러로 승격시키려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

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

### Java 불변 컬렉션 어노테이션 지원
<secondary-label ref="jvm"/>

Kotlin 2.3.20은 Java의 [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) 및 [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) 어노테이션에 대한 지원을 추가했습니다.

Kotlin 2.3.20부터 이러한 어노테이션이 달린 Java 선언에서 반환되는 컬렉션은 Kotlin에서 읽기 전용으로 처리됩니다. 이를 가변 컬렉션 타입에 할당하면 타입 불일치 경고가 발생합니다. 이 경고는 Kotlin 2.5.0에서 에러로 변경될 예정입니다.

예시는 다음과 같습니다:

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
    // 경고 발생: Java 타입 불일치
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native

Kotlin 2.3.20은 C 및 Objective-C 라이브러리를 위한 새로운 실험적 상호운용성 모드, 크로스 컴파일 체커, 그리고 Kotlin/Native 프로젝트에서 컴파일 캐시를 비활성화하기 위한 새로운 DSL을 도입합니다.

### 크로스 컴파일 체커 (Cross-compilation checker)
<secondary-label ref="native"/>

Kotlin 2.3.20은 주어진 타겟에 대해 크로스 컴파일이 지원되는지 확인하는 방법을 도입했습니다. 이는 컴파일 태스크의 상태를 추적하는 서드파티 플러그인에 유용할 수 있습니다.

일반적으로 Kotlin/Native는 크로스 컴파일을 허용하므로, 지원되는 모든 호스트에서 지원되는 타겟에 대한 `.klib` 아티팩트를 생성할 수 있습니다. 그러나 프로젝트에서 [cinterop 의존성](native-c-interop.md)을 사용하는 경우 Apple 타겟에 대한 아티팩트 생성은 여전히 제한적입니다.

새로운 `crossCompilationSupported` API는 이제 크로스 컴파일이 지원되는지 확인합니다. 즉, 타겟이 호스트 매니저에 의해 활성화되어야 하며, 해당 타겟의 컴파일 중 어느 것도 cinterop 의존성을 포함하지 않아야 합니다. 이 체커는 기본적으로 활성화되어 있습니다.

지원되는 타겟 및 호스트에 대한 자세한 정보는 [Kotlin/Native 문서](native-target-support.md)를 참조하세요.

### 컴파일 캐시 비활성화를 위한 새로운 DSL
<secondary-label ref="native"/>

Kotlin 2.3.20에는 Kotlin/Native 프로젝트에서 컴파일 캐시를 비활성화하기 위한 새로운 DSL이 포함되어 있습니다. 이는 캐시 비활성화 결정을 더 신중하고 명시적으로 만들기 위한 것입니다.

캐시를 비활성화하면 Kotlin/Native 빌드 속도가 현저히 느려지므로, 예외적인 상황에서 일시적으로만 사용해야 합니다. 따라서 캐시 비활성화는 이제 특정 Kotlin 버전과 연결되며, 문서 역할을 하는 사유를 반드시 포함해야 합니다.

프로젝트에서 컴파일 캐시를 비활성화해야 하는 경우, Gradle 빌드 파일의 `binaries {}` 블록을 다음과 같이 업데이트하세요.

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

* `version` – 컴파일 캐시가 비활성화될 Kotlin 버전입니다.
* `reason` (필수) – 컴파일 캐시를 비활성화하는 이유입니다.
* `issue` (선택 사항) – 버그 트래커의 관련 이슈 URL입니다.

새로운 DSL은 지원 중단된(deprecated) `kotlin.native.cacheKind` Gradle 프로퍼티를 대체합니다. `gradle.properties` 파일에서 해당 프로퍼티를 안전하게 제거할 수 있습니다.

컴파일 시간 단축을 위한 더 많은 팁은 [Kotlin/Native 문서](native-improving-compilation-time.md)를 참조하세요.

<include from="whatsnew2320.md" element-id="new-interoperability-mode-for-c-or-objective-c-libraries-content">
<var name="id7" value="native-new-interoperability-mode-for-c-or-objective-c-libraries"/>
<var name="id8" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>
<var name="id9" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>
</include>

## Kotlin/Wasm

Kotlin 2.3.20은 문자열 연산 성능, 컴파일 시간 및 메모리 사용량을 개선했습니다. 또한 Kotlin 객체나 클래스를 JavaScript 함수처럼 호출할 수 있게 해주는 실험적인 `@nativeInvoke` 어노테이션에 대한 지원을 추가했습니다.

### 문자열 성능 개선
<secondary-label ref="wasm"/>

이제 Kotlin/Wasm은 `kotlin.String` 값의 연산에 JS String 내장 기능(builtins)을 사용합니다. 이를 통해 Kotlin/Wasm은 브라우저의 JavaScript 엔진 문자열 최적화와 해당 제안을 지원하는 Wasm 런타임의 이점을 누릴 수 있습니다. 이 최적화는 문자열 연결(concatenation), 보간(interpolation), `StringBuilder.append()`, 숫자-문자열 변환 등의 연산에 적용됩니다.

결과적으로 다음과 같은 효과가 있습니다:

* 타겟 벤치마크에서 문자열 보간 성능이 최대 4.6배 향상되었습니다.
* [KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app) 빌드 시 Wasm 바이너리 크기가 약 5% 감소했습니다.
* 모든 Wasm 벤치마크에서 중앙값 기준 약 1%의 개선이 있었습니다.
* 추가 작업이 많은 워크로드에서 `StringBuilder.append()` 및 `kotlin.String` 인스턴스 연결 속도가 최소 20% 향상되었습니다.

### 컴파일 시간 개선 및 메모리 최적화
<secondary-label ref="wasm"/>

Kotlin 2.3.20은 특히 대규모 프로젝트에서 컴파일 중 메모리 소비를 현저히 줄이는 컴파일러 최적화를 추가했습니다. 이러한 최적화는 증분 빌드(incremental build) 성능도 개선합니다.

테스트 결과, 클린 빌드(clean build) 시간은 65%, 증분 빌드 시간은 21% 개선된 것으로 나타났습니다.

### `@nativeInvoke` 어노테이션 지원
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20은 `wasmJs` 타겟에 대한 `@nativeInvoke` 어노테이션 지원을 도입합니다. 이 어노테이션을 사용하면 Kotlin 객체나 클래스를 JavaScript의 함수인 것처럼 취급할 수 있습니다. 이는 `external` 선언(클래스 또는 인터페이스)의 멤버 함수를 JavaScript 객체의 "호출 연산자(invoke operator)"로 표시하도록 설계되었습니다.

함수에 어노테이션을 달면, Kotlin에서의 해당 함수 호출은 모두 JavaScript 객체 자체의 직접 호출로 번역됩니다.

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

이는 Kotlin/Wasm과 JavaScript 간의 안정적인 상호운용성이 설계될 때까지의 임시 솔루션입니다. 향후 릴리스에서 수정되거나 제거될 수 있으며, 사용 시 컴파일러 경고가 보고됩니다.

Kotlin/Wasm과 JavaScript의 상호운용성에 대한 자세한 내용은 [JavaScript 상호운용성](wasm-js-interop.md)을 참조하세요.

## Kotlin/JS

Kotlin 2.3.20은 TypeScript에서 Kotlin 인터페이스를 구현할 수 있게 하며, SWC 컴파일 플랫폼에 대한 실험적 지원을 도입합니다.

### JavaScript/TypeScript에서 Kotlin 인터페이스 구현하기
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20은 JavaScript/TypeScript 측에서 Kotlin 인터페이스를 구현할 수 없었던 제한을 해제했습니다. 이전에는 Kotlin 인터페이스를 TypeScript 인터페이스로 내보내는 것만 가능했고, TypeScript에서 이를 구현하는 것은 금지되었습니다.

이제 다음과 같은 방식으로 모든 Kotlin 인터페이스를 구현할 수 있습니다:

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

TypeScript에서 Kotlin의 기본 구현(default implementations)을 재사용할 수도 있습니다. TypeScript에는 인터페이스의 기본 구현 개념이 없지만, `DefaultImpls` 객체에 위임하여 이를 처리할 수 있습니다.

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

빌드 파일에 새로운 컴파일러 옵션을 추가하세요.

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

### SWC 컴파일 플랫폼 지원
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20부터 Kotlin/JS는 [SWC](https://swc.rs/) 컴파일 플랫폼을 지원합니다. SWC는 최신 버전의 JavaScript/TypeScript 코드를 더 오래되고 호환성이 높은 JavaScript 코드로 트랜스파일(transpile)하는 데 도움을 줍니다.

코드 변환을 외부 도구에 위임함으로써 Kotlin/JS 컴파일러가 생성하는 변종의 수를 줄이고, 최신 JavaScript 기능을 지원하는 데만 집중하여 컴파일러 현대화 속도를 높일 수 있습니다. 현재 지원되는 최신 ECMAScript 버전은 여전히 `es2015`입니다.

또한 트랜스파일 작업을 위임함으로써 [인라인 JavaScript(inlined JavaScript)](js-interop.md#inline-javascript) 기능을 개선할 수 있습니다. 현재는 ES5 구문만 지원하지만(2.4.0에서 변경 예정), 하위 버전을 타겟팅하면서 최신 구문을 지원하는 것은 컴파일러가 인라인 JS 블록 내의 JS 코드를 직접 트랜스파일해야 하므로 어려운 일이었습니다. SWC를 사용하면 최신 JS 구문을 추가할 수 있고, 도구가 사용자 버전에 맞게 코드를 트랜스파일해 줄 것입니다.

SWC로의 마이그레이션은 Kotlin Gradle 플러그 내부에서 [browserlist](https://browsersl.ist/) 기반 DSL을 구현할 기회도 제공합니다. 이를 통해 특정 JS 버전 대신 대상 브라우저나 환경을 선언할 수 있게 됩니다.

#### 활성화 방법 {id="how-to-enable-swc-compilation"}

`gradle.properties` 파일에 다음 옵션을 추가하세요.

```properties
kotlin.js.delegated.transpilation=true
```

향후 Kotlin 릴리스에서 SWC를 통한 트랜스파일을 안정화할 계획입니다. 이것이 기본값이 되면 여러 JS 타겟을 컴파일하는 기능은 Kotlin/JS 컴파일러에서 트랜스파일러로 완전히 위임될 것입니다.

SWC 플랫폼에 대한 자세한 정보는 [공식 문서](https://swc.rs/docs/getting-started)를 참조하세요.

## Gradle

Kotlin 2.3.20은 새로운 버전의 Gradle과 호환되며 Kotlin Gradle 플러그인의 Kotlin/JVM 컴파일 변경 사항을 포함합니다.

### Gradle 9.3.0 호환성
<secondary-label ref="gradle"/>

Kotlin 2.3.20은 Gradle 7.6.3부터 9.3.0까지 완벽하게 호환됩니다. 최신 Gradle 릴리스 버전까지 사용할 수 있으나, 이 경우 지원 중단(deprecation) 경고가 발생할 수 있으며 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다.

### KGP의 바이너리 호환성 검증 개선
<secondary-label ref="gradle"/>

Kotlin 2.2.0에서 처음으로 [Kotlin Gradle 플러그인의 바이너리 호환성 검증](gradle-binary-compatibility-validation.md)이 도입되었습니다. Kotlin 2.3.20에서는 두 가지 개선 사항이 추가되었습니다.

첫째, 바이너리 호환성 검증 Gradle 태스크 이름에서 더 이상 "Legacy"가 포함되지 않습니다. 기존 명명 규칙이 Kotlin 개발자들에게 혼란을 주었기 때문에 이를 변경했습니다:

| 기존 이름           | 새로운 이름                 |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

이전 태스크 이름은 새로운 이름으로의 원활한 전환을 위해 Kotlin 2.3.20에서도 여전히 존재합니다.

둘째, 프로젝트에서 바이너리 호환성 검증을 활성화한 경우, 이제 `check` 태스크 실행 시 Gradle이 자동으로 `checkKotlinAbi` 태스크를 실행합니다. 이전에는 `check` 태스크가 모든 검증 태스크를 실행해야 함에도 불구하고 `checkKotlinAbi` 태스크를 실행하지 않았으며, 이로 인해 Gradle 프로젝트에서 일관성 없는 동작이 발생했습니다.

### Kotlin/JVM 컴파일 시 Build tools API 기본 사용
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

Kotlin 2.3.20에서 Kotlin/JVM 컴파일 시 Kotlin Gradle 플러그인은 [빌드 도구 API (BTA)](build-tools-api.md)를 기본적으로 사용합니다. 이러한 내부 컴파일 인프라의 변경은 Kotlin 컴파일러에 대한 빌드 도구 지원의 더 빠른 개발을 가능하게 합니다.

문제가 발견되면 [이슈 트래커](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration)를 통해 피드백을 공유해 주세요.

## Maven

Kotlin 2.3.20은 Maven 프로젝트 설정을 더 쉽게 만드는 중요한 변경 사항을 가져왔습니다.

<include from="whatsnew2320.md" element-id="simplified-setup-for-kotlin-projects-content">
<var name="id1" value="maven-simplified-setup-for-kotlin-projects"/>
<var name="id2" value="maven-simplified-setup-for-kotlin-projects-how-to-enable"/>
</include>

## 빌드 도구 API

Kotlin 2.3.20은 빌드 도구 API(BTA)를 사용하여 자신의 빌드 시스템을 Kotlin 컴파일러와 통합하려는 개발자들을 위한 더 많은 변경 사항을 도입했습니다.

### 빌드 작업 개선
<secondary-label ref="bta"/>

이번 릴리스에서 BTA는 빌드 도구가 빌드 작업을 관리하는 방식을 개선했습니다. 빌드 작업을 통해 빌드 도구는 Kotlin 컴파일러와 상호작용할 수 있습니다. 각 빌드 작업은 [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) 인터페이스의 구현체입니다.

이제 [`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 함수를 사용하여 [`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) 인터페이스를 구현하는 빌드 작업을 취소할 수 있습니다.

`cancel()` 함수는 "최선의 노력(best effort)" 원칙으로 작동합니다. 즉, 작업이 취소된다는 보장은 없습니다.

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

추가로, 빌드 작업이 시작된 후에는 변경할 수 없도록 생성할 수 있어 더욱 견고해졌습니다. 이를 위해 빌드 도구는 빌더 패턴(builder pattern)을 사용해야 합니다:

1. 가변 빌더를 사용하여 객체를 구성합니다.
2. [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 함수를 호출하여 객체의 불변 인스턴스를 생성합니다.

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

### 빌드 도구 간 일관된 메트릭 수집
<secondary-label ref="bta"/>

Kotlin 2.3.20 이전에는 빌드 메트릭 인프라가 Gradle 중심으로 구성되어 있어 메트릭 이름 등 인프라 일부에 영향을 주었습니다. 또한 모든 메트릭이 서로 다른 [컴파일러 실행 전략(compiler execution strategies)](compiler-execution-strategy.md)에서 사용 가능한 것은 아니었습니다.

Kotlin 2.3.20에서 BTA는 JVM을 위한 빌드 도구에 구애받지 않는(agnostic) 메트릭 수집을 제공합니다. 또한 BTA는 컴파일러 실행 전략에 관계없이 일관된 메트릭 세트를 도입합니다. 특정 컴파일 방식이나 실행 전략에 특화된 메트릭은 해당되는 경우에만 보고됩니다. 예를 들어, 증분 컴파일 메트릭은 증분 빌드 시에만 사용 가능하며, 데몬 관련 메트릭은 Kotlin 데몬을 사용할 때만 사용 가능합니다.

빌드 도구는 이제 빌드 성능에 대한 통찰력을 사용자에게 제공하는 빌드 메트릭을 캡처하기 위해 빌드 작업에 대한 [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) 객체를 구성할 수 있습니다:

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

### 빌드 도구에 의한 컴파일러 플러그인 구성 간소화
<secondary-label ref="bta"/>

Kotlin 2.3.20에서 BTA는 빌드 도구가 컴파일러 플러그인을 구성할 수 있는 더 간단한 새로운 방법을 제공합니다. 이 방식을 통해 빌드 도구는 구성을 사용자에게 직접 전달할 수 있습니다.

실험적인 컴파일러 옵션을 사용하여 커맨드 라인을 통해 컴파일러 플러그인을 구성하는 대신, 빌드 도구는 `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` 옵션을 사용하여 컴파일러 플러그인 구성을 나타내는 객체 리스트를 구성할 수 있습니다.

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="코드 예시"}

## 주요 변경 사항 및 지원 중단(Deprecations)

이 섹션에서는 중요한 주요 변경 사항 및 지원 중단 사항을 다룹니다. Kotlin 2.3.0 및 2.3.20의 지원 중단 사항에 대한 자세한 정보는 [호환성 가이드](compatibility-guide-23.md)를 참조하세요.

* Kotlin 2.3.20에서 Kotlin/Wasm은 외부 JavaScript가 나중에 `_initialize()` 함수를 호출하는 방식 대신, Wasm 모듈의 인스턴스화 과정의 일부로 모듈 초기화를 수행합니다. 이러한 변경은 Kotlin/Wasm의 독립성을 높이고 [ES 모듈 통합 제안](https://github.com/WebAssembly/esm-integration)에 대비하기 위한 것입니다.

  [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) 어노테이션을 사용하는 경우, 모듈 초기화가 완료되기 전에 관련 코드가 실행되면 실패할 수 있습니다. 정말로 필요한 경우가 아니라면 `@EagerInitialization` 어노테이션 사용을 피하는 것을 권장합니다.
* 실험적이었던 컨텍스트 리시버(context receivers)는 더 이상 지원되지 않으며 [컨텍스트 파라미터(context parameters)](context-parameters.md)로 대체됩니다.
* 이번 릴리스는 [Intel 칩 기반 Apple 타겟에 대한 지원 중단 주기](whatsnew2220.md#deprecation-of-x86-64-apple-targets)의 다음 단계를 진행합니다. Kotlin 2.3.20부터 `macosX64`, `tvosX64`, `watchosX64` 타겟을 지원 중단합니다. 다음 Kotlin 릴리스에서 이러한 타겟에 대한 지원을 완전히 제거할 계획입니다.

  많은 서드파티 라이브러리가 여전히 `iosX64` 타겟에 의존하고 있으므로, 당분간 지원 티어 3(support tier 3) 상태를 유지할 예정입니다. 이는 CI 테스트를 보장하지 않으며, 서로 다른 컴파일러 릴리스 간의 소스 및 바이너리 호환성을 제공하지 않을 수도 있음을 의미합니다. 지원 티어에 대한 자세한 내용은 [Kotlin/Native 타겟 지원](native-target-support.md)을 참조하세요.
* Kotlin 2.3.20에서는 Kotlin Multiplatform의 엄격해진 의존성 매칭으로 인해 공통 소스 세트와 플랫폼 소스 세트 간의 의존성 해소가 다를 경우 메타데이터 컴파일 실패가 발생할 수 있습니다. 자세한 내용과 해결 방법은 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround)를 확인하세요.

## 문서 업데이트

Kotlin 생태계에서 다음과 같은 문서 변경이 있었습니다:

* [Kotlin 로드맵](roadmap.md) – 언어 및 생태계 진화에 대한 Kotlin의 업데이트된 우선순위 리스트를 확인하세요.
* [AGP 9로 업그레이드하기](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – Android 앱이 포함된 멀티플랫폼 프로젝트를 AGP 9로 마이그레이션하기 위한 조언을 살펴보세요.
* [KMP 앱을 위한 CI 구성](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – 멀티플랫폼 프로젝트에서 지속적 통합을 위한 GitHub Actions 구성 튜토리얼을 따라해 보세요.
* [Compose UI 미리보기](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – 에뮬레이터를 실행하지 않고 IDE에서 컴포저블을 미리 보는 방법을 알아보세요.
* [웹 리소스 처리](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – Compose Multiplatform에서 웹 리소스를 처리하는 방법에 대한 정보를 찾아보세요.
* [뷰포트 설정](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – Compose Multiplatform for web을 사용하여 HTML 캔버스에 UI를 렌더링하기 위해 `ComposeViewport()` 함수를 사용하는 방법을 알아보세요.
* [커스텀 컴파일러 플러그인](custom-compiler-plugins.md) – 컴파일러 플러그인의 작동 방식과 자신의 사용 사례에 맞는 플러그인을 찾을 수 없을 때 무엇을 할 수 있는지 알아보세요.
* [애플리케이션 구조](https://ktor.io/docs/server-application-structure.html) – Ktor 서버 앱에 가장 적합한 애플리케이션 구조를 선택하세요.
* [HTTP 요청 생명주기](https://ktor.io/docs/server-http-request-lifecycle.html) – HTTP 요청 생명주기를 사용하여 클라이언트 연결이 끊겼을 때 Ktor에서 요청 처리를 취소하는 방법을 알아보세요.
* [의존성 주입](https://ktor.io/docs/server-dependency-injection.html) – 업데이트된 가이드와 실용적인 예제를 통해 Ktor 서버에서 의존성 주입을 구성하는 방법을 알아보세요.
* [Exposed의 Spring Boot 통합](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – Exposed를 Spring Boot 3 및 4와 함께 사용하는 방법을 알아보세요.