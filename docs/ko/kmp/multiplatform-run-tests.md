[//]: # (title: 멀티플랫폼 앱 테스트하기 − 튜토리얼)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 동일하게 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
</tldr>

이 튜토리얼에서는 Kotlin Multiplatform 애플리케이션에서 테스트를 생성, 구성 및 실행하는 방법을 배웁니다.

멀티플랫폼 프로젝트의 테스트는 크게 두 가지 범주로 나눌 수 있습니다:

* 공통 코드(common code)를 위한 테스트. 이 테스트는 지원되는 프레임워크를 사용하여 모든 플랫폼에서 실행할 수 있습니다.
* 플랫폼별 코드(platform-specific code)를 위한 테스트. 플랫폼 전용 로직을 테스트하는 데 필수적입니다. 이 테스트는 특정 플랫폼의 프레임워크를 사용하며, 더 풍부한 API 및 다양한 단언문(assertion)과 같은 해당 프레임워크의 추가 기능을 활용할 수 있습니다.

멀티플랫폼 프로젝트에서는 두 범주가 모두 지원됩니다. 이 튜토리얼에서는 먼저 간단한 Kotlin Multiplatform 프로젝트에서 공통 코드를 위한 단위 테스트를 설정, 작성 및 실행하는 방법을 보여줍니다. 그런 다음 공통 코드와 플랫폼별 코드 모두에 대한 테스트가 필요한 보다 복잡한 예제를 다룹니다.

> 이 튜토리얼은 독자가 다음 사항에 익숙하다고 가정합니다:
> * Kotlin Multiplatform 프로젝트의 구조. 익숙하지 않다면 시작하기 전에 [이 튜토리얼](multiplatform-upgrade-app.md)을 먼저 완료하세요.
> * [JUnit](https://junit.org/junit5/)과 같은 널리 사용되는 단위 테스트 프레임워크의 기초.
>
{style="tip"}

## 간단한 멀티플랫폼 프로젝트 테스트하기 {id="test-a-simple-multiplatform-project"}

### 프로젝트 생성하기 {id="create-a-project"}

1. [빠른 시작 가이드](quickstart.md)에서 [Kotlin Multiplatform 개발 환경 설정](quickstart.md#set-up-the-environment) 안내를 완료합니다.
2. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
4. **New Project** 창에서 다음 필드를 지정합니다:

    * **Name**: KMP testing
    * **Project ID**: kmp.project.testing

5. **Android** 타깃을 선택합니다.
   Mac을 사용하는 경우 **iOS**도 함께 선택합니다. **Do not share UI** 옵션이 선택되어 있는지 확인하세요.
6. **Include tests**를 선택 해제하고 **Create**를 클릭합니다.

   ![간단한 멀티플랫폼 프로젝트 생성](create-test-multiplatform-project.png){width=800}

### 코드 작성하기 {id="write-code"}

`sharedLogic/src/commonMain/kotlin` 디렉터리에 새 `common.example.search` 패키지를 생성합니다.
이 패키지 안에 다음 함수를 포함하는 Kotlin 파일 `Grep.kt`를 생성합니다:

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

이 함수는 [UNIX `grep` 명령어](https://en.wikipedia.org/wiki/Grep)와 유사하게 동작하도록 설계되었습니다. 텍스트 라인 목록, 정규 표현식으로 사용할 패턴, 그리고 라인이 패턴과 일치할 때마다 호출되는 함수를 매개변수로 받습니다.

### 테스트 추가하기 {id="add-tests"}

이제 공통 코드를 테스트해 보겠습니다. 핵심적인 부분은 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 라이브러리를 의존성으로 갖는 공통 테스트용 소스 세트(source set)입니다.

1. `sharedLogic/build.gradle.kts` 파일에서 `kotlin.test` 라이브러리에 대한 의존성이 있는지 확인합니다:

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest` 소스 세트는 모든 공통 테스트를 저장합니다. 프로젝트에 이와 동일한 이름의 디렉터리를 생성해야 합니다:

    1. `sharedLogic/src` 디렉터리를 마우스 오른쪽 버튼으로 클릭하고 **New | Directory**를 선택합니다. IDE에 옵션 목록이 표시됩니다.
    2. `commonTest/kotlin` 경로를 입력하여 검색 범위를 좁힌 후, 목록에서 해당 항목을 선택합니다:

      ![공통 테스트 디렉터리 생성](create-common-test-dir.png){width=350}

3. `commonTest/kotlin` 디렉터리에 새 `common.example.search` 패키지를 생성합니다.
4. 이 패키지 안에 `Grep.kt` 파일을 생성하고 다음 단위 테스트로 업데이트합니다:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class GrepTest {
        companion object {
            val sampleData = listOf(
                "123 abc",
                "abc 123",
                "123 ABC",
                "ABC 123"
            )
        }
    
        @Test
        fun shouldFindMatches() {
            val results = mutableListOf<String>()
            grep(sampleData, "[a-z]+") {
                results.add(it)
            }
    
            assertEquals(2, results.size)
            for (result in results) {
                assertContains(result, "abc")
            }
        }
    }
    ```

보시다시피 임포트된 애너테이션과 단언문은 특정 플랫폼이나 프레임워크에 종속되지 않습니다.
나중에 이 테스트를 실행할 때 플랫폼별 프레임워크가 테스트 러너를 제공하게 됩니다.

#### `kotlin.test` API 살펴보기 {initial-collapse-state="collapsed" collapsible="true"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리는 테스트에서 사용할 수 있는 플랫폼 독립적인 애너테이션과 단언문을 제공합니다. `Test`와 같은 애너테이션은 선택한 프레임워크에서 제공하는 애너테이션이나 가장 유사한 애너테이션으로 매핑됩니다.

단언문은 [`Asserter` 인터페이스](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/)의 구현체를 통해 실행됩니다. 이 인터페이스는 테스트에서 일반적으로 수행되는 다양한 검사를 정의합니다. API에는 기본 구현이 포함되어 있지만, 일반적으로는 프레임워크별 구현체를 사용하게 됩니다.

예를 들어 JVM에서는 JUnit 4, JUnit 5, TestNG 프레임워크가 모두 지원됩니다. Android에서는 `assertEquals()` 호출이 `asserter.assertEquals()` 호출로 이어질 수 있으며, 이때 `asserter` 객체는 `JUnit4Asserter`의 인스턴스가 됩니다. iOS에서는 `Asserter` 타입의 기본 구현체가 Kotlin/Native 테스트 러너와 함께 사용됩니다.

### 테스트 실행하기

다음 방법 중 하나로 테스트를 실행할 수 있습니다:

* 거터(gutter)에 있는 **Run** 아이콘을 사용하여 `shouldFindMatches()` 테스트 함수 실행.
* 콘텍스트 메뉴를 사용하여 테스트 파일 실행.
* 거터에 있는 **Run** 아이콘을 사용하여 `GrepTest` 테스트 클래스 실행.

또한 편리한 단축키인 <shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut>을 사용할 수도 있습니다.
어떤 옵션을 선택하든 테스트를 실행할 타깃 목록이 표시됩니다:

![테스트 작업 실행](run-test-tasks.png){width=300}

`android` 옵션의 경우 JUnit 4를 사용하여 테스트가 실행됩니다. `iosSimulatorArm64`의 경우 Kotlin 컴파일러가 테스트 애너테이션을 감지하고 Kotlin/Native 자체 테스트 러너에 의해 실행되는 *테스트 바이너리(test binary)*를 생성합니다.

다음은 성공적인 테스트 실행으로 생성된 출력 예시입니다:

![테스트 출력](run-test-results.png){width=700}

## 더 복잡한 프로젝트 다루기

### 공통 코드용 테스트 작성하기

앞서 `grep()` 함수를 통해 공통 코드용 테스트를 작성해 보았습니다. 이제 `CurrentRuntime` 클래스를 사용해 더 발전된 공통 코드 테스트를 살펴보겠습니다. 이 클래스는 코드가 실행되는 플랫폼에 대한 세부 정보를 포함합니다. 예를 들어 로컬 JVM에서 실행되는 Android 단위 테스트의 경우 "OpenJDK" 및 "17.0"과 같은 값을 가질 수 있습니다.

`CurrentRuntime`의 인스턴스는 플랫폼의 이름과 버전(선택 사항)을 문자열로 받아 생성해야 합니다. 버전이 존재하는 경우, 가능한 경우 문자열 시작 부분의 숫자만 필요합니다.

1. `commonMain/kotlin` 디렉터리에 새 `org.kmp.testing` 패키지를 생성합니다.
2. 이 패키지 안에 `CurrentRuntime.kt` 파일을 생성하고 다음 구현으로 업데이트합니다:

    ```kotlin
    class CurrentRuntime(val name: String, rawVersion: String?) {
        companion object {
            val versionRegex = Regex("^[0-9]+(\\.[0-9]+)?")
        }
    
        val version = parseVersion(rawVersion)
    
        override fun toString() = "$name version $version"
    
        private fun parseVersion(rawVersion: String?): String {
            val result = rawVersion?.let { versionRegex.find(it) }
            return result?.value ?: "unknown"
        }
    }
    ```

3. `commonTest/kotlin` 디렉터리에 새 `org.kmp.testing` 패키지를 생성합니다.
4. 이 패키지 안에 `CurrentRuntimeTest.kt` 파일을 생성하고 다음의 플랫폼 및 프레임워크 독립적인 테스트 코드로 업데이트합니다:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals

    class CurrentRuntimeTest {
        @Test
        fun shouldDisplayDetails() {
            val runtime = CurrentRuntime("MyRuntime", "1.1")
            assertEquals("MyRuntime version 1.1", runtime.toString())
        }
    
        @Test
        fun shouldHandleNullVersion() {
            val runtime = CurrentRuntime("MyRuntime", null)
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    
        @Test
        fun shouldParseNumberFromVersionString() {
            val runtime = CurrentRuntime("MyRuntime", "1.2 Alpha Experimental")
            assertEquals("MyRuntime version 1.2", runtime.toString())
        }
    
        @Test
        fun shouldHandleMissingVersion() {
            val runtime = CurrentRuntime("MyRuntime", "Alpha Experimental")
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    }
    ```

[IDE에서 제공하는 방식](#run-tests) 중 아무 방법이나 사용하여 이 테스트를 실행할 수 있습니다.

### 플랫폼별 테스트 추가하기

> 여기서는 간결성과 단순함을 위해 [expected 및 actual 선언 메커니즘](multiplatform-connect-to-apis.md)을 사용합니다. 더 복잡한 코드에서는 인터페이스와 팩토리 함수를 사용하는 것이 더 나은 접근 방식입니다.
>
{style="note"}

이제 공통 코드 테스트 작성에 익숙해졌으므로, Android와 iOS를 위한 플랫폼별 테스트 작성을 살펴보겠습니다.

`CurrentRuntime`의 인스턴스를 생성하기 위해 공통 `CurrentRuntime.kt` 파일에 다음과 같이 함수를 선언합니다:

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

이 함수는 지원되는 각 플랫폼마다 별도의 구현을 가져야 합니다. 그렇지 않으면 빌드가 실패합니다.
각 플랫폼에 이 함수를 구현하는 것뿐만 아니라 테스트도 제공해야 합니다. Android와 iOS용 테스트를 생성해 보겠습니다.

#### Android의 경우 {id="for-android"}

1. `androidMain/kotlin` 디렉터리에 새 `org.kmp.testing` 패키지를 생성합니다.
2. 이 패키지 안에 `AndroidRuntime.kt` 파일을 생성하고 expect 함수인 `determineCurrentRuntime()`의 실제(actual) 구현으로 업데이트합니다:

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. `sharedLogic/src` 디렉터리 내에 테스트용 디렉터리를 생성합니다:
 
   1. `sharedLogic/src` 디렉터리를 마우스 오른쪽 버튼으로 클릭하고 **New | Directory**를 선택합니다. IDE에 옵션 목록이 표시됩니다.
   2. `androidHostTest/kotlin` 경로를 입력하여 검색 범위를 좁힌 후, 목록에서 해당 항목을 선택합니다:

      ![Android 테스트 디렉터리 생성](create-android-test-dir.png){width=350}

4. `androidHostTest/kotlin` 디렉터리에 새 `org.kmp.testing` 패키지를 생성합니다.
5. 이 패키지 안에 `AndroidRuntimeTest.kt` 파일을 생성하고 다음 Android 테스트로 업데이트합니다.
   테스트를 통과시키려면 런타임의 실제 이름과 버전을 설정해야 합니다(단, 테스트가 어떻게 실패하는지 확인해보는 것도 유용합니다):

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class AndroidRuntimeTest {
        @Test
        fun shouldDetectAndroid() {
            val runtime = determineCurrentRuntime()
            assertContains(runtime.name, "OpenJDK")
            assertEquals(runtime.version, "21.0")
        }
    }
    ```
   
Android 전용 테스트가 로컬 JVM에서 실행되는 것이 이상하게 보일 수 있습니다. 이는 이러한 테스트가 현재 머신에서 로컬 단위 테스트로 실행되기 때문입니다. [Android Studio 문서](https://developer.android.com/studio/test/test-in-android-studio)에 설명되어 있듯이, 이러한 테스트는 기기나 에뮬레이터에서 실행되는 계측 테스트(instrumented tests)와는 다릅니다.

프로젝트에 다른 유형의 테스트를 추가할 수도 있습니다. 계측 테스트에 대해 자세히 알아보려면 이 [Touchlab 가이드](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)를 참조하세요.

#### iOS의 경우 {id="for-ios"}

1. `iosMain/kotlin` 디렉터리에 새 `org.kmp.testing` 디렉터리를 생성합니다.
2. 이 디렉터리 안에 `IOSRuntime.kt` 파일을 생성하고 expect 함수인 `determineCurrentRuntime()`의 실제(actual) 구현으로 업데이트합니다:

    ```kotlin
    import kotlin.experimental.ExperimentalNativeApi
    import kotlin.native.Platform
    
    @OptIn(ExperimentalNativeApi::class)
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = Platform.osFamily.name.lowercase()
        return CurrentRuntime(name, null)
    }
    ```

3. `sharedLogic/src` 디렉터리에 새 디렉터리를 생성합니다:
   
   1. `sharedLogic/src` 디렉터리를 마우스 오른쪽 버튼으로 클릭하고 **New | Directory**를 선택합니다. IDE에 옵션 목록이 표시됩니다.
   2. `iosTest/kotlin` 경로를 입력하여 검색 범위를 좁힌 후, 목록에서 해당 항목을 선택합니다:

4. `iosTest/kotlin` 디렉터리에 새 `org.kmp.testing` 디렉터리를 생성합니다.
5. 이 디렉터리 안에 `IOSRuntimeTest.kt` 파일을 생성하고 다음 iOS 테스트로 업데이트합니다:

    ```kotlin 
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class IOSRuntimeTest {
        @Test
        fun shouldDetectOS() {
            val runtime = determineCurrentRuntime()
            assertEquals(runtime.name, "ios")
            assertEquals(runtime.version, "unknown")
        }
    }
    ```

### 여러 테스트 실행 및 리포트 분석하기 {id="run-multiple-tests-and-analyze-reports"}

이 단계까지 완료하면 공통, Android, iOS 구현 코드와 해당 테스트가 모두 준비됩니다.
프로젝트의 디렉터리 구조는 다음과 같아야 합니다:

![전체 프로젝트 구조](code-and-test-structure.png){width=300}

콘텍스트 메뉴에서 개별 테스트를 실행하거나 단축키를 사용할 수 있습니다. 또 다른 방법은 Gradle 태스크를 사용하는 것입니다. 예를 들어 `allTests` Gradle 태스크를 실행하면 프로젝트의 모든 테스트가 해당 테스트 러너를 통해 실행됩니다:

![Gradle 테스트 태스크](gradle-alltests.png){width=700}

테스트를 실행하면 IDE에 표시되는 출력 외에도 HTML 리포트가 생성됩니다. 리포트는 `sharedLogic/build/reports/tests` 디렉터리에서 확인할 수 있습니다:

![멀티플랫폼 테스트용 HTML 리포트](shared-tests-folder-reports.png){width=300}

`allTests` 태스크를 실행하고 생성된 리포트를 확인해 보세요:

* `allTests/index.html` 파일에는 공통 테스트 및 iOS 테스트에 대한 결합된 리포트가 포함되어 있습니다.
  (iOS 테스트는 공통 테스트에 의존하며 공통 테스트 이후에 실행됩니다.)
* `testDebugUnitTest` 및 `testReleaseUnitTest` 폴더에는 두 기본 Android 빌드 플레이버(flavor)에 대한 리포트가 포함되어 있습니다.
  (현재 Android 테스트 리포트는 `allTests` 리포트에 자동으로 병합되지 않습니다.)

![멀티플랫폼 테스트용 HTML 리포트 화면](multiplatform-test-report.png){width=700}

## 멀티플랫폼 프로젝트에서 테스트를 사용할 때 유의할 점 {id="rules-for-using-tests-in-multiplatform-projects"}

지금까지 Kotlin Multiplatform 애플리케이션에서 테스트를 생성, 구성 및 실행해 보았습니다.
향후 프로젝트에서 테스트를 다룰 때는 다음 사항들을 기억하세요:

* 공통 코드를 위한 테스트를 작성할 때는 [kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/)와 같은 멀티플랫폼 라이브러리만 사용하세요. 의존성은 `commonTest` 소스 세트에 추가합니다.
* `kotlin.test` API의 `Asserter` 타입은 간접적으로만 사용해야 합니다.
  `Asserter` 인스턴스가 노출되어 있더라도 테스트에서 직접 사용할 필요는 없습니다.
* 항상 테스트 라이브러리 API 범위 내에서 작업하세요. 다행히 컴파일러와 IDE가 프레임워크 전용 기능을 사용하지 못하도록 방지해 줍니다.
* `commonTest`에서 테스트를 실행할 때 어떤 프레임워크를 사용하는지는 중요하지 않지만, 개발 환경이 올바르게 설정되었는지 확인하기 위해 사용하려는 각 프레임워크로 테스트를 실행해 보는 것이 좋습니다.
* 물리적 동작의 차이를 고려하세요. 예를 들어 스크롤 관성 및 마찰 계수 값은 플랫폼과 기기마다 다르므로 동일한 스크롤 속도를 설정하더라도 스크롤 위치가 달라질 수 있습니다. 기대한 대로 동작하는지 확인하려면 항상 대상 플랫폼에서 컴포넌트를 테스트하세요.
* 플랫폼별 코드를 위한 테스트를 작성할 때는 해당 프레임워크의 기능(예: 애너테이션 및 확장 기능)을 자유롭게 사용할 수 있습니다.
* IDE와 Gradle 태스크 모두를 통해 테스트를 실행할 수 있습니다.
* 테스트를 실행하면 HTML 테스트 리포트가 자동으로 생성됩니다.

## 다음 단계 {id="what-s-next"}

* [멀티플랫폼 프로젝트 구조 이해하기](multiplatform-discover-project.md)에서 멀티플랫폼 프로젝트의 구조를 자세히 알아보세요.
* Kotlin 생태계에서 제공하는 또 다른 멀티플랫폼 테스팅 프레임워크인 [Kotest](https://kotest.io/)를 확인해 보세요.
  Kotest를 사용하면 다양한 스타일로 테스트를 작성할 수 있으며 일반적인 테스트 방식을 보완하는 여러 접근법을 지원합니다.
  여기에는 [데이터 기반(data-driven)](https://kotest.io/docs/framework/datatesting/data-driven-testing.html) 및 [속성 기반(property-based)](https://kotest.io/docs/proptest/property-based-testing.html) 테스트가 포함됩니다.