[//]: # (title: Kotlin 멀티플랫폼 라이브러리 만들기 – 튜토리얼)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 동일하게 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin 멀티플랫폼 지원을 공유합니다.</p>
</tldr>

이 튜토리얼에서는 IntelliJ IDEA에서 멀티플랫폼 라이브러리를 만들고, 해당 라이브러리를 로컬 Maven 저장소에 배포한 후, 다른 프로젝트에서 의존성(dependency)으로 추가하는 방법을 배웁니다.

이 튜토리얼은 피보나치(Fibonacci) 수열을 생성하는 함수가 포함된 간단한 라이브러리인 [멀티플랫폼 라이브러리 템플릿(multiplatform library template)](https://github.com/Kotlin/multiplatform-library-template)을 기반으로 합니다.

## 환경 설정 

[필요한 모든 도구를 설치하고 최신 버전으로 업데이트하세요](quickstart.md).

## 프로젝트 생성

1. IntelliJ IDEA에서 **File** | **New** | **Project from Version Control**을 선택합니다.
2. [멀티플랫폼 라이브러리 템플릿 프로젝트](https://github.com/Kotlin/multiplatform-library-template)의 URL을 입력합니다:

    ```text
    https://github.com/Kotlin/multiplatform-library-template
    ```
   
3. **Clone**을 클릭합니다.

## 프로젝트 구조 살펴보기

Kotlin 멀티플랫폼 라이브러리 템플릿 프로젝트는 Kotlin 멀티플랫폼 라이브러리 개발을 위한 기초 구조를 제공합니다. 이 템플릿은 다양한 플랫폼에서 작동할 수 있는 라이브러리를 만드는 데 도움이 됩니다.

템플릿 프로젝트에서 `library`는 핵심 모듈 역할을 하며, 멀티플랫폼 라이브러리를 위한 메인 소스 코드와 빌드 리소스를 포함하고 있습니다.

![멀티플랫폼 라이브러리 프로젝트 구조](multiplatform-library-template-project.png){width=350}

`library` 모듈은 공통 코드뿐만 아니라 플랫폼별 구현을 수용할 수 있도록 구조화되어 있습니다. 소스 코드의 구성은 다음과 같습니다:

* **`commonMain`**: 모든 타겟 플랫폼에서 공유되는 Kotlin 코드가 포함됩니다. 플랫폼별 API에 의존하지 않는 코드를 여기에 배치합니다.
* **`androidMain`, `iosMain`, `jvmMain`, `linuxX64Main`**: Android, iOS, JVM, Linux 플랫폼에 특화된 코드가 포함됩니다. 각 플랫폼에 고유한 기능을 여기에서 구현합니다.
* **`commonTest`, `androidUnitTest`, `iosTest`, `jvmTest`, `linuxX64Test`**: 각각 공유 `commonMain` 코드에 대한 테스트와 Android, iOS, JVM, Linux 플랫폼 전용 테스트가 포함됩니다.

모든 플랫폼에서 공유되는 `library` 코드에 집중해 보겠습니다. `src/commonMain/kotlin` 디렉토리 안에서 피보나치 수열 생성기를 정의하는 Kotlin 멀티플랫폼 코드가 담긴 `CustomFibi.kt` 파일을 찾을 수 있습니다:

```kotlin
package io.github.kotlin.fibonacci

// 피보나치 수열을 생성하는 함수를 정의합니다.
fun generateFibi() = sequence {
    var a = firstElement
    yield(a)
    
    var b = secondElement
    yield(b)
    
    while (true) {
        val c = a + b
        yield(c)
        a = b
        b = c
    }
}

// `firstElement`와 `secondElement`에 기대되는(expected) 값을 선언합니다.
expect val firstElement: Int
expect val secondElement: Int
```

`firstElement`와 `secondElement` 프로퍼티는 플랫폼별 코드에서 구현할 수 있는 플레이스홀더(placeholder)입니다. 각 타겟은 해당 소스 세트에서 `actual` 키워드를 사용하여 실제 값을 제공해야 합니다.

`expect` 선언은 `actual` 구현과 [매칭](multiplatform-connect-to-apis.md#expected-and-actual-functions-and-properties)됩니다. 이 메커니즘은 플랫폼별 동작이 필요한 크로스 플랫폼 코드를 작성할 때 유용합니다.

이 경우, 멀티플랫폼 라이브러리 템플릿에는 `firstElement` 및 `secondElement` 프로퍼티의 플랫폼별 구현이 포함되어 있습니다. `androidMain`, `iosMain`, `jvmMain`, `linuxX64Main` 디렉토리에는 이러한 프로퍼티에 값을 제공하는 `actual` 선언이 포함되어 있습니다.

예를 들어, `androidMain/kotlin/fibiprops.android.kt`에 포함된 Android 구현은 다음과 같습니다:

```kotlin
package io.github.kotlin.fibonacci

actual val firstElement: Int = 1
actual val secondElement: Int = 2
```

다른 플랫폼들도 동일한 패턴을 따르며, `firstElement`와 `secondElement` 프로퍼티 값만 다르게 설정되어 있습니다.

## 새로운 플랫폼 추가하기

템플릿에서 공유 코드와 플랫폼별 코드가 어떻게 작동하는지 익혔으므로, 이제 추가 플랫폼에 대한 지원을 추가하여 프로젝트를 확장해 보겠습니다.

[`expect`/`actual` 메커니즘](multiplatform-connect-to-apis.md#expected-and-actual-functions-and-properties)을 사용하여 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) 플랫폼 지원을 구성한 후, `firstElement` 및 `secondElement` 프로퍼티에 대해 플랫폼 전용 기능을 구현해 보겠습니다.

### 프로젝트에 Kotlin/Wasm 타겟 추가하기

1. `library/build.gradle.kts` 파일에서 Kotlin/Wasm 타겟(`wasmJs`)과 소스 세트를 추가합니다:

    ```kotlin
    kotlin {
        // ...
        @OptIn(org.jetbrains.kotlin.gradle.ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
        // ...
        sourceSets {
            //...
            wasmJsMain.dependencies {
                // Wasm 전용 의존성
            }
        }
    }
    ```

2. 빌드 파일에 나타나는 **Sync Gradle Changes** 아이콘(![Gradle sync icon](gradle-sync-icon.png){width=30}{type="joined"})을 클릭하여 Gradle 파일을 동기화합니다. 또는 Gradle 도구 창에서 새로고침 버튼을 클릭합니다.

### Wasm 전용 코드 만들기

Wasm 타겟을 추가한 후에는 `firstElement` 및 `secondElement`의 플랫폼별 구현을 담을 Wasm 디렉토리가 필요합니다:

1. `library/src` 디렉토리를 우클릭하고 **New | Directory**를 선택합니다. 
2. **Gradle Source Sets** 목록에서 **wasmJsMain/kotlin**을 선택합니다.

   ![Gradle 소스 세트 목록](gradle-source-sets-list.png){width=450}

3. 새로 생성된 `wasmJsMain/kotlin` 디렉토리를 우클릭하고 **New | Kotlin Class/File**을 선택합니다. 
4. 파일 이름으로 **fibiprops.wasm**을 입력하고 **File**을 선택합니다.
5. `fibiprops.wasm.kt` 파일에 다음 코드를 추가합니다:

    ```kotlin
    package io.github.kotlin.fibonacci
    
    actual val firstElement: Int = 3
    actual val secondElement: Int = 5
    ```

    이 코드는 Wasm 전용 구현을 설정하며, `firstElement`를 `3`으로, `secondElement`를 `5`로 정의하는 `actual` 값을 제공합니다.

### 프로젝트 빌드하기

새로운 플랫폼을 포함하여 프로젝트가 올바르게 컴파일되는지 확인합니다:

1. **View** | **Tool Windows** | **Gradle**을 선택하여 Gradle 도구 창을 엽니다.
2. **multiplatform-library-template** | **library** | **Tasks** | **build**에서 **build** 태스크를 실행합니다.

   ![Gradle 도구 창](library-gradle-build-window-tasks.png){width=450}

   또는 `multiplatform-library-template` 루트 디렉토리의 터미널에서 다음 명령을 실행합니다:

   ```bash
   ./gradlew build
   ```

**Build** 도구 창에서 성공적인 출력 결과를 확인할 수 있습니다. 

## 로컬 Maven 저장소에 라이브러리 배포하기

이제 멀티플랫폼 라이브러리를 로컬에 배포하여 동일한 컴퓨터의 다른 프로젝트에서 사용할 준비가 되었습니다.

라이브러리를 배포하려면 다음과 같이 [`maven-publish`](https://docs.gradle.org/current/userguide/publishing_maven.html) Gradle 플러그인을 사용합니다:

1. `library/build.gradle.kts` 파일에서 `plugins { }` 블록을 찾아 `maven-publish` 플러그인을 적용합니다:

   ```kotlin
      plugins {
          // ...
          // 다음 라인을 추가합니다:
          id("maven-publish")
      }
   ```

2. `mavenPublishing { }` 블록을 찾아 `signAllPublications()` 호출을 주석 처리하여 배포가 로컬 전용임을 나타냅니다:

    ```kotlin
    mavenPublishing {
        // ...
        // 다음 호출을 주석 처리합니다:
        // signAllPublications()
    }
    ```

3. 빌드 파일에 나타나는 **Sync Gradle Changes** 아이콘(![Gradle sync icon](gradle-sync-icon.png){width=30}{type="joined"})을 클릭하여 Gradle 파일을 동기화합니다. 또는 Gradle 도구 창에서 새로고침 버튼을 클릭합니다.

4. Gradle 도구 창에서 **multiplatform-library-template** | **Tasks** | **publishing**으로 이동하여 **publishToMavenLocal** Gradle 태스크를 실행합니다.

   ![멀티플랫폼 라이브러리 Gradle 도구 창](publish-maven-local-gradle-task.png){width=450}

   또는 `multiplatform-library-template` 루트 디렉토리의 터미널에서 다음 명령을 실행합니다:

   ```bash
   ./gradlew publishToMavenLocal
   ```

라이브러리가 로컬 Maven 저장소에 배포되었습니다. 

배포된 아티팩트(artifacts)를 확인하려면 파일 탐색기나 터미널을 사용하여 `~\.m2\repository\io\github\kotlin\library\1.0.0\` 디렉토리로 이동하세요.

## 다른 프로젝트에서 라이브러리를 의존성으로 추가하기

멀티플랫폼 라이브러리를 로컬 Maven 저장소에 배포한 후에는 동일한 컴퓨터의 다른 Kotlin 프로젝트에서 사용할 수 있습니다.

라이브러리를 사용할 프로젝트의 `settings.gradle.kts` 파일에 로컬 저장소에서 패키지를 찾도록 설정을 추가합니다: 

```kotlin
dependencyResolutionManagement {
    repositories {
        // ...
        mavenLocal()
    }
}
```

모듈의 `build.gradle.kts` 파일에 배포된 라이브러리에 대한 의존성을 추가합니다. 다른 멀티플랫폼 프로젝트에 추가하는 경우, 공유 또는 플랫폼 전용 소스 세트에 추가할 수 있습니다:

```kotlin
kotlin {
    //...
    sourceSets {
        // 모든 플랫폼을 위한 설정
        commonMain.dependencies {
                implementation("io.github.kotlin:library:1.0.0")
        }
        // 또는 특정 플랫폼을 위한 설정
        wasmJsMain.dependencies {
            implementation("io.github.kotlin:library:1.0.0")
        }
    }
}
```

`implementation()` 호출은 해당 라이브러리의 `build.gradle.kts` 파일에 지정된 그룹(group), 이름(name), 버전(version)을 인자로 받습니다.

사용자 프로젝트를 동기화하고 라이브러리 사용을 시작해 보세요. 예시는 다음과 같습니다:

```kotlin
import io.github.kotlin.fibonacci.generateFibi

val seq = generateFibi()
println(seq.elementAt(3))
```

## 다음 단계

멀티플랫폼 개발에 대해 더 자세히 알아보시기를 권장합니다:

* [Maven Central에 라이브러리 배포하기](multiplatform-publish-libraries-to-maven.md)
* [라이브러리 작성자 가이드 확인하기](https://kotlinlang.org/docs/api-guidelines-introduction.html)

커뮤니티에 참여하세요:

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**: [저장소](https://github.com/JetBrains/compose-multiplatform)에 스타를 누르고 기여해 보세요.
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: ["kotlin-multiplatform" 태그](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)를 구독하세요.
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 채널**: 구독하고 [Kotlin 멀티플랫폼](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C)에 관한 영상을 시청하세요.