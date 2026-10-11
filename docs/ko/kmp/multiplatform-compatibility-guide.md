[//]: # (title: Kotlin Multiplatform 호환성 가이드)

<show-structure depth="1"/>

이 가이드는 Kotlin Multiplatform으로 프로젝트를 개발할 때 마주칠 수 있는 [호환성을 깨뜨리는 변경 사항(incompatible changes)](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)을 정리합니다.

> Compose Multiplatform에 대한 정보는
> [Compose Multiplatform의 새로운 기능](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)
> 및 [Kotlin 및 Jetpack 호환성](compose-compatibility-and-versioning.md) 페이지를 참조하세요.
> 
{style="note"}

현재 Kotlin의 Stable 버전은 %kotlinVersion%입니다. 프로젝트에 적용된 Kotlin 버전과 관련하여 특정 변경 사항의 지원 중단(deprecation) 주기를 유념하세요. 예를 들면 다음과 같습니다.

* Kotlin 1.7.0에서 Kotlin 1.9.0으로 업그레이드할 때는 [Kotlin 1.9.0](#kotlin-1-9-0-1-9-25)과 [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) 모두에서 적용된 호환성을 깨뜨리는 변경 사항을 확인하세요.
* Kotlin 1.9.0에서 Kotlin 2.0.0으로 업그레이드할 때는 [Kotlin 2.0.0](#kotlin-2-0-0-and-later)과 [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) 모두에서 적용된 호환성을 깨뜨리는 변경 사항을 확인하세요.

## 버전 호환성 {id="version-compatibility"}

프로젝트를 구성할 때 특정 버전의 Kotlin Multiplatform Gradle 플러그인(프로젝트의 Kotlin 버전과 동일)이 Gradle, Xcode 및 Android Gradle 플러그인 버전과 호환되는지 확인하세요.

| Kotlin Multiplatform 플러그인 버전 | Gradle                                | Android Gradle 플러그인                              | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.20–2.4.21                              | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.4.0–2.4.10                        | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         | 26.4    |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3–8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5–8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5–8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 및 Kotlin 2.1.0–2.1.10은 최대 8.6 버전의 Gradle과 완벽히 호환됩니다.
> Gradle 버전 8.7–8.10도 지원되지만, 단 한 가지 예외가 있습니다. Kotlin Multiplatform Gradle 플러그인을 사용하는 경우, JVM 타깃에서 `withJava()` 함수를 호출하는 멀티플랫폼 프로젝트에서 지원 중단 경고가 표시될 수 있습니다.
> 자세한 내용은 [기본으로 생성되는 Java 소스 세트](#java-source-sets-created-by-default)를 참조하세요.
>
{style="warning"}

## Kotlin 2.0.0 이상 {id="kotlin-2-0-0-and-later"}

이 섹션에서는 지원 중단 주기가 끝나고 Kotlin 2.0.0−%kotlinVersion%에서 적용되는 호환성을 깨뜨리는 변경 사항을 다룹니다.

<a id="android-target-rename"></a>
### Android 타깃용 Google 플러그인으로 마이그레이션 {id="migrate-to-google-s-plugin-for-android-targets"}

**무엇이 변경되었나요?**

Kotlin 2.3.0 이전에는 `com.android.application` 및 `com.android.library` 플러그인을 통해 Android 타깃 지원을 제공했습니다. 이는 Google의 Android 팀이 Kotlin Multiplatform에 맞춘 별도의 플러그인을 개발하는 동안 사용된 임시 솔루션이었습니다.

초기에는 `android` 블록을 사용했으나, 새 플러그인에서 `android`라는 이름을 예약하여 사용할 수 있도록 나중에 `androidTarget` 블록으로 전환했습니다.

현재는 Android 팀에서 제공하는 [`com.android.kotlin.multiplatform.library` 플러그인](https://developer.android.com/kotlin/multiplatform/plugin)을 사용할 수 있으며, 기존의 `android` 블록과 함께 사용할 수 있습니다.

Kotlin 2.3.0에서는 Kotlin Multiplatform 프로젝트에서 `androidTarget` 이름이 사용될 때 지원 중단 경고가 도입되었습니다. `android` 블록으로 마이그레이션할 시간이 더 필요하다면 경고가 표시되지 않는 AGP 8.x와 함께 Kotlin 2.3.10을 사용하세요.

**현재 권장되는 모범 사례는 무엇인가요?**

새로운 `com.android.kotlin.multiplatform.library` 플러그인으로 마이그레이션하세요. 모든 `androidTarget` 블록 항목의 이름을 `android`로 변경하세요. 마이그레이션 방법에 대한 자세한 지침은 Google의 [마이그레이션 가이드](https://developer.android.com/kotlin/multiplatform/plugin#migrate)를 참조하세요.

**변경 사항은 언제 적용되나요?**

Kotlin Multiplatform Gradle 플러그인의 지원 중단 주기는 다음과 같습니다.

* 1.9.0: Kotlin Multiplatform 프로젝트에서 `android` 이름이 사용될 때 지원 중단 경고 도입
* 2.1.0: 이 경고를 오류로 격상
* 2.2.0: Kotlin Multiplatform Gradle 플러그인에서 `android` 타깃 DSL 제거
* 2.3.0: 새 Android 플러그인 사용 가능, Kotlin Multiplatform 프로젝트에서 `androidTarget` 이름이 사용될 때 지원 중단 경고 도입
* 2.3.10: Kotlin Multiplatform 프로젝트에서 `androidTarget` 이름이 사용될 때 표시되는 지원 중단 경고 되돌림(revert)

### 비트코드 임베딩 지원 중단 {id="deprecated-bitcode-embedding"}

**무엇이 변경되었나요?**

비트코드(Bitcode) 임베딩은 Xcode 14에서 지원 중단되었으며, Xcode 15에서는 모든 Apple 타깃에 대해 제거되었습니다. 이에 따라 Kotlin에서도 프레임워크 구성을 위한 `embedBitcode` 매개변수와 `-Xembed-bitcode` 및 `-Xembed-bitcode-marker` 명령줄 인수가 지원 중단되었습니다.

**현재 권장되는 모범 사례는 무엇인가요?**

여전히 이전 버전의 Xcode를 사용 중이지만 Kotlin 2.0.20 이상으로 업그레이드하려는 경우, Xcode 프로젝트에서 비트코드 임베딩을 비활성화하세요.

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 2.0.20: Kotlin/Native 컴파일러가 비트코드 임베딩을 더 이상 지원하지 않음
* 2.1.0: Kotlin Multiplatform Gradle 플러그인에서 `embedBitcode` DSL이 경고와 함께 지원 중단됨
* 2.2.0: 경고가 오류로 격상됨
* 2.3.0: `embedBitcode` DSL 제거

<a id="java-source-set-created-by-default"></a>
### 기본으로 생성되는 Java 소스 세트 {id="java-source-sets-created-by-default"}

**무엇이 변경되었나요?**

Gradle의 향후 변경 사항에 발맞추기 위해 Kotlin Multiplatform에서 `withJava()` 함수를 점진적으로 폐지하고 있습니다. `withJava()` 함수는 필요한 Java 소스 세트를 생성하여 Gradle의 Java 플러그인과의 통합을 가능하게 했습니다. Kotlin 2.1.20부터 이러한 Java 소스 세트는 기본적으로 생성됩니다.

**현재 권장되는 모범 사례는 무엇인가요?**

이전에는 `src/jvmMain/java` 및 `src/jvmTest/java` 소스 세트를 생성하기 위해 `withJava()` 함수를 명시적으로 사용해야 했습니다.

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

Kotlin 2.1.20부터는 빌드 스크립트에서 `withJava()` 함수를 제거할 수 있습니다.

또한, Gradle은 이제 Java 소스가 있는 경우에만 Java 컴파일 태스크를 실행하므로, 이전에는 실행되지 않았던 JVM 유효성 검사 진단이 트리거됩니다. 이 진단은 `KotlinJvmCompile` 태스크 또는 `compilerOptions` 내부에서 호환되지 않는 JVM 타깃을 명시적으로 구성한 경우 실패합니다. JVM 타깃 호환성을 확보하는 방법에 대한 지침은 [관련 컴파일 태스크의 JVM 타깃 호환성 확인](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)을 참조하세요.

프로젝트에서 8.7보다 높은 버전의 Gradle을 사용하고 있으며 [Java](https://docs.gradle.org/current/userguide/java_plugin.html), [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html), [Application](https://docs.gradle.org/current/userguide/application_plugin.html)과 같은 Gradle Java 플러그인이나 Gradle Java 플러그인에 종속된 서드파티 Gradle 플러그인에 의존하지 않는다면 `withJava()` 함수를 제거할 수 있습니다.

프로젝트에서 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java 플러그인을 사용하는 경우, [새로운 실험적 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin)로 마이그레이션하는 것을 권장합니다. Gradle 8.7부터 Application 플러그인은 Kotlin Multiplatform Gradle 플러그인과 더 이상 함께 작동하지 않습니다.

멀티플랫폼 프로젝트에서 Kotlin Multiplatform Gradle 플러그인과 다른 Java용 Gradle 플러그인을 모두 사용하려면 [Kotlin Multiplatform Gradle 플러그인과 Java 플러그인 간의 호환성 지원 중단](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)을 참조하세요.

Kotlin 2.1.20 및 8.7보다 높은 Gradle 버전에서 [Java test fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle 플러그인을 사용하는 경우 해당 플러그인이 작동하지 않습니다. 대신 이 문제가 해결된 [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details)로 업그레이드하세요.

문제가 발생하는 경우 [이슈 트래커](https://kotl.in/issue)에 보고하거나 [공개 Slack 채널](https://kotlinlang.slack.com/archives/C19FD9681)에 도움을 요청하세요.

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* Gradle >8.6: `withJava()` 함수를 사용하는 멀티플랫폼 프로젝트의 모든 이전 버전 Kotlin에 대해 지원 중단 경고 도입
* Gradle 9.0: 이 경고를 오류로 격상
* 2.1.20: 모든 버전의 Gradle에서 `withJava()` 함수를 사용할 때 지원 중단 경고 도입

<a id="declaring-multiple-targets"></a>
### 유사한 타깃을 여러 개 선언하는 방식 {id="declaring-several-similar-targets"}

**무엇이 변경되었나요?**

단일 Gradle 프로젝트 내에서 유사한 타깃을 여러 개 선언하는 것은 권장되지 않습니다. 예를 들면 다음과 같습니다.

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 권장되지 않으며 지원 중단 경고가 발생함
}
```

흔히 볼 수 있는 사용 사례 중 하나는 관련된 두 개의 코드 조각을 함께 유지하는 것입니다. 예를 들어 `:shared` Gradle 프로젝트에서 Ktor 또는 OkHttp 라이브러리를 사용하여 네트워킹을 구현하기 위해 `jvm("jvmKtor")` 및 `jvm("jvmOkHttp")`를 사용하고자 할 수 있습니다.

```kotlin
// shared/build.gradle.kts:
kotlin {
    jvm("jvmKtor") {
        attributes.attribute(/* ... */)
    }
    jvm("jvmOkHttp") {
        attributes.attribute(/* ... */)
    }

    sourceSets {
        val commonMain by getting
        val commonJvmMain by sourceSets.creating {
            dependsOn(commonMain)
            dependencies {
                // 공통 종속성
            }
        }
        val jvmKtorMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // Ktor 종속성
            }
        }
        val jvmOkHttpMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // OkHttp 종속성
            }
        }
    }
}
```

이 구현은 상당한 구성 복잡성을 초래합니다.

* `:shared` 측과 각 컨슈머(consumer) 측 모두에서 Gradle 속성(attribute)을 설정해야 합니다. 그렇지 않으면 추가 정보 없이는 컨슈머가 Ktor 기반 구현을 받아야 하는지 OkHttp 기반 구현을 받아야 하는지 불분명하므로 Gradle이 이러한 프로젝트에서 종속성을 해결할 수 없습니다.
* `commonJvmMain` 소스 세트를 수동으로 설정해야 합니다.
* 이 구성에는 여러 저수준 Gradle 및 Kotlin Gradle 플러그인 추상화 및 API가 수반됩니다.

**현재 권장되는 모범 사례는 무엇인가요?**

구성이 복잡한 이유는 Ktor 기반 및 OkHttp 기반 구현이 _동일한 Gradle 프로젝트 내에_ 있기 때문입니다. 대부분의 경우 이러한 부분을 별도의 Gradle 프로젝트로 분리할 수 있습니다. 이러한 리팩터링의 일반적인 개요는 다음과 같습니다.

1. 기존 프로젝트의 중복된 두 타깃을 단일 타깃으로 교체합니다. 이러한 타깃 간에 공유 소스 세트가 있는 경우 해당 소스와 구성을 새로 생성된 타깃의 기본 소스 세트로 이동합니다.

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // jvmCommonMain의 구성을 여기에 복사
            }
        }
    }
    ```

2. 보통 `settings.gradle.kts` 파일에서 `include`를 호출하여 두 개의 새 Gradle 프로젝트를 추가합니다. 예를 들면 다음과 같습니다.

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 각 새 Gradle 프로젝트를 구성합니다.

    * 이러한 프로젝트는 단 하나의 타깃으로만 컴파일되므로 `kotlin("multiplatform")` 플러그인을 적용할 필요가 없을 가능성이 높습니다. 이 예제에서는 `kotlin("jvm")`을 적용할 수 있습니다.
    * 기존의 타깃 전용 소스 세트의 콘텐츠를 각자의 프로젝트로 이동합니다(예: `jvmKtorMain`에서 `ktor-impl/src`로).
    * 소스 세트의 구성(종속성, 컴파일러 옵션 등)을 복사합니다.
    * 새 Gradle 프로젝트에서 기존 프로젝트로의 종속성을 추가합니다.

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 기존 프로젝트에 대한 종속성 추가
        // jvmKtorMain의 종속성을 여기에 복사
    }
    
    kotlin {
        compilerOptions {
            // jvmKtorMain의 컴파일러 옵션을 여기에 복사
        }
    }
    ```

이 접근 방식은 초기 설정에 더 많은 작업이 필요하지만, Gradle 및 Kotlin Gradle 플러그인의 저수준 엔티티를 사용하지 않으므로 결과 빌드를 사용하고 유지 관리하기가 더 쉬워집니다.

> 안타깝게도 모든 사례에 대해 상세한 마이그레이션 단계를 제공할 수는 없습니다. 위의 지침이 적용되지 않는 경우 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-59316)에 사용 사례를 작성해 주세요.
>
{style="tip"}

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.9.20: Kotlin Multiplatform 프로젝트에서 여러 개의 유사한 타깃이 사용될 때 지원 중단 경고 도입
* 2.1.0: 이러한 경우 오류 보고(Kotlin/JS 타깃 제외. 이 예외에 대해 자세히 알아보려면 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode) 참조)

<a id="deprecate-pre-hmpp-dependencies"></a>
### 레거시 모드로 게시된 멀티플랫폼 라이브러리 지원 중단 {id="deprecated-support-of-multiplatform-libraries-published-in-legacy-mode"}

**무엇이 변경되었나요?**

이전에 Kotlin Multiplatform 프로젝트에서 "레거시" 바이너리의 게시를 방지하는 [레거시 모드를 지원 중단](#deprecated-gradle-properties-for-hierarchical-structure-support)하고 프로젝트를 [계층 구조(hierarchical structure)](multiplatform-hierarchy.md)로 마이그레이션하도록 권장했습니다.

에코시스템에서 "레거시" 바이너리를 계속해서 단계적으로 퇴출하기 위해, Kotlin 1.9.0부터는 레거시 라이브러리의 사용도 권장되지 않습니다. 프로젝트에서 레거시 라이브러리에 대한 종속성을 사용하는 경우 다음과 같은 경고가 표시됩니다.

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**현재 권장되는 모범 사례는 무엇인가요?**

_멀티플랫폼 라이브러리를 사용하는 경우_, 대부분의 라이브러리가 이미 "계층 구조" 모드로 마이그레이션되었으므로 라이브러리 버전만 업데이트하면 됩니다. 자세한 내용은 각 라이브러리의 문서를 참조하세요.

라이브러리가 아직 비레거시(non-legacy) 바이너리를 지원하지 않는 경우, 유지 관리자에게 문의하여 이 호환성 문제에 대해 알릴 수 있습니다.

_라이브러리 작성자인 경우_, Kotlin Gradle 플러그인을 최신 버전으로 업데이트하고 [지원 중단된 Gradle 속성](#deprecated-gradle-properties-for-hierarchical-structure-support)을 수정했는지 확인하세요.

Kotlin 팀은 에코시스템의 마이그레이션을 돕고자 적극적으로 지원하고 있으므로, 문제가 발생하면 주저하지 말고 [YouTrack에 이슈를 생성](https://kotl.in/issue)해 주세요.

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.9.0: 레거시 라이브러리 종속성에 대한 지원 중단 경고 도입
* 2.0.0: 레거시 라이브러리 종속성에 대한 경고를 오류로 격상
* &gt;2.0.0: 레거시 라이브러리 종속성에 대한 지원 제거. 이러한 종속성을 사용하면 빌드 실패가 발생할 수 있음

<a id="deprecate-hmpp-properties"></a>
### 계층 구조 지원을 위한 Gradle 속성 지원 중단 {id="deprecated-gradle-properties-for-hierarchical-structure-support"}

**무엇이 변경되었나요?**

Kotlin은 발전 과정 전반에 걸쳐 멀티플랫폼 프로젝트에서 공통 소스 세트인 `commonMain`과 `jvmMain` 같은 플랫폼별 소스 세트 사이에 중간 소스 세트를 둘 수 있는 [계층 구조(hierarchical structure)](multiplatform-hierarchy.md) 지원을 점진적으로 도입해 왔습니다.

툴체인이 충분히 안정적이지 않았던 과도기에는 세부적인 선택적 활성화(opt-in) 및 비활성화(opt-out)를 허용하는 몇 가지 Gradle 속성이 도입되었습니다.

Kotlin 1.6.20부터 계층적 프로젝트 구조 지원이 기본적으로 활성화되었습니다. 그러나 문제가 발생했을 때 비활성화할 수 있도록 이러한 속성들이 유지되었습니다. 모든 피드백을 검토한 후, 이제 이러한 속성을 완전히 폐지하기 시작했습니다.

다음 속성들은 이제 지원 중단되었습니다.

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**현재 권장되는 모범 사례는 무엇인가요?**

* `gradle.properties` 및 `local.properties` 파일에서 이러한 속성을 제거하세요.
* Gradle 빌드 스크립트나 Gradle 플러그인에서 이를 프로그래밍 방식으로 설정하지 마세요.
* 빌드에 사용되는 서드파티 Gradle 플러그인에 의해 지원 중단된 속성이 설정되는 경우, 플러그인 유지 관리자에게 이러한 속성을 설정하지 않도록 요청하세요.

Kotlin 1.6.20 이후 Kotlin 툴체인의 기본 동작에는 이러한 속성이 포함되지 않으므로 심각한 영향은 없을 것으로 예상됩니다. 대부분의 영향은 프로젝트를 다시 빌드한 직후 즉시 확인할 수 있습니다.

라이브러리 작성자이고 확실성을 기하고 싶다면 컨슈머가 해당 라이브러리를 정상적으로 사용할 수 있는지 확인하세요.

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.8.20: 지원 중단된 Gradle 속성이 사용될 때 경고 보고
* 1.9.20: 이 경고를 오류로 격상
* 2.0.0: 지원 중단된 속성 제거. Kotlin Gradle 플러그인은 해당 속성의 사용을 무시함

이러한 속성을 제거한 후 문제가 발생하는 드문 경우에는 [YouTrack에 이슈를 생성](https://kotl.in/issue)하세요.

<a id="target-presets-deprecation"></a>
### 타깃 프리셋 API 지원 중단 {id="deprecated-target-presets-api"}

**무엇이 변경되었나요?**

초기 개발 단계에서 Kotlin Multiplatform은 이른바 _타깃 프리셋(target presets)_ 작업을 위한 API를 도입했습니다. 각 타깃 프리셋은 본질적으로 Kotlin Multiplatform 타깃을 위한 팩토리 역할을 했습니다. 그러나 `jvm()`이나 `iosSimulatorArm64()`와 같은 DSL 함수가 훨씬 더 직관적이고 간결하면서도 동일한 사용 사례를 처리할 수 있었기 때문에 이 API는 대부분 불필요한 것으로 판명되었습니다.

혼란을 줄이고 더 명확한 가이드라인을 제공하기 위해, 이제 Kotlin Gradle 플러그인의 공개 API에서 모든 프리셋 관련 API가 지원 중단되었습니다. 여기에는 다음이 포함됩니다.

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension`의 `presets` 속성
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` 인터페이스 및 이를 상속하는 모든 하위 인터페이스/클래스
* `fromPreset` 오버로드

**현재 권장되는 모범 사례는 무엇인가요?**

대신 해당하는 [Kotlin 타깃](multiplatform-dsl-reference.md#targets)을 사용하세요. 예를 들면 다음과 같습니다.

<table>
    
<tr>
<td>이전</td>
        <td>현재</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        fromPreset(presets.iosArm64, 'ios')&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    iosArm64()&#10;}"/>
</td>
</tr>

</table>

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.9.20: 프리셋 관련 API 사용 시 경고 보고
* 2.0.0: 이 경고를 오류로 격상
* 2.2.0: Kotlin Gradle 플러그인의 공개 API에서 프리셋 관련 API 제거. 이를 계속 사용하는 소스는 "unresolved reference" 오류로 실패하며, 최신 버전의 Kotlin Gradle 플러그인을 대상으로 다시 컴파일하지 않는 한 바이너리(예: Gradle 플러그인)는 링키지(linkage) 오류로 실패할 수 있음

<a id="target-shortcuts-deprecation"></a>
### Apple 타깃 단축 함수 지원 중단 {id="deprecated-apple-target-shortcuts"}

**무엇이 변경되었나요?**

Kotlin Multiplatform DSL에서 `ios()`, `watchos()`, `tvos()` 타깃 단축 함수(shortcuts)가 지원 중단됩니다. 이 함수들은 Apple 타깃에 대한 소스 세트 계층 구조를 부분적으로 생성하도록 설계되었습니다. 그러나 확장하기 어렵고 때로는 혼란을 초래하는 것으로 나타났습니다.

예를 들어 `ios()` 단축 함수는 `iosArm64` 및 `iosX64` 타깃을 모두 생성했지만, Apple M 칩 기반 호스트에서 작업할 때 필요한 `iosSimulatorArm64` 타깃은 포함하지 않았습니다. 그러나 이 단축 함수를 변경하는 것은 구현하기 어려웠으며 기존 사용자 프로젝트에서 문제를 일으킬 수 있었습니다.

**현재 권장되는 모범 사례는 무엇인가요?**

이제 Kotlin Gradle 플러그인은 내장 계층 템플릿(hierarchy template)을 제공합니다. Kotlin 1.9.20부터 기본적으로 활성화되어 있으며 자주 사용되는 사례를 위한 사전 정의된 중간 소스 세트를 포함하고 있습니다.

단축 함수 대신 타깃 목록을 명시적으로 지정하면, 플러그인이 이 목록을 기반으로 중간 소스 세트를 자동으로 설정합니다.

예를 들어 프로젝트에 `iosArm64` 및 `iosSimulatorArm64` 타깃이 있는 경우, 플러그인은 자동으로 `iosMain` 및 `iosTest` 중간 소스 세트를 생성합니다. `iosArm64` 및 `macosArm64` 타깃이 있는 경우에는 `appleMain` 및 `appleTest` 소스 세트가 생성됩니다.

자세한 내용은 [계층적 프로젝트 구조](multiplatform-hierarchy.md)를 참조하세요.

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.9.20: `ios()`, `watchos()`, `tvos()` 타깃 단축 함수 사용 시 경고 보고. 대신 기본 계층 템플릿이 기본적으로 활성화됨
* 2.1.0: 타깃 단축 함수 사용 시 오류 보고
* 2.2.0: Kotlin Multiplatform Gradle 플러그인에서 타깃 단축 DSL 제거

### Kotlin 업그레이드 후 iOS 프레임워크 버전 불일치 문제 {id="incorrect-version-of-ios-framework-after-kotlin-upgrade"}

**어떤 문제인가요?**

직접 연동(direct integration)을 사용할 때 Kotlin 코드의 변경 사항이 Xcode의 iOS 앱에 반영되지 않을 수 있습니다. 직접 연동은 멀티플랫폼 프로젝트의 iOS 프레임워크를 Xcode의 iOS 앱에 연결하는 `embedAndSignAppleFrameworkForXcode` 태스크로 설정됩니다.

이 문제는 멀티플랫폼 프로젝트에서 Kotlin 버전을 1.9.2x에서 2.0.0으로 업그레이드(또는 2.0.0에서 1.9.2x로 다운그레이드)한 후 Kotlin 파일을 변경하고 앱 빌드를 시도할 때 발생할 수 있으며, Xcode가 이전 버전의 iOS 프레임워크를 잘못 사용할 수 있습니다. 따라서 Xcode의 iOS 앱에 변경 사항이 표시되지 않습니다.

**해결 방법은 무엇인가요?**

1. Xcode에서 **Product** | **Clean Build Folder**를 사용하여 빌드 디렉터리를 정리합니다.
2. 터미널에서 다음 명령을 실행합니다.

   ```none
   ./gradlew clean
   ```

3. 새 버전의 iOS 프레임워크가 사용되는지 확인하기 위해 앱을 다시 빌드합니다.

**언제 수정되나요?**

Kotlin 2.0.10에서 이 문제를 수정할 예정입니다. Kotlin 2.0.10의 프리뷰 버전을 이미 사용할 수 있는지 여부는 [Kotlin 얼리 액세스 프리뷰(EAP) 참여](https://kotlinlang.org/docs/eap.html) 섹션에서 확인할 수 있습니다.

자세한 내용은 [YouTrack의 해당 이슈](https://youtrack.jetbrains.com/issue/KT-68257)를 참조하세요.

## Kotlin 1.9.0−1.9.25 {id="kotlin-1-9-0-1-9-25"}

이 섹션에서는 지원 중단 주기가 끝나고 Kotlin 1.9.0−1.9.25에서 적용되는 호환성을 깨뜨리는 변경 사항을 다룹니다.

<a id="compilation-source-deprecation"></a>
### Kotlin 컴파일에 Kotlin 소스 세트를 직접 추가하는 API 제거 {initial-collapse-state="collapsed" collapsible="true" id="removed-api-for-adding-kotlin-source-sets-directly-to-the-kotlin-compilation"}

**무엇이 변경되었나요?**

`KotlinCompilation.source`에 대한 접근이 제거되었습니다. 다음과 같은 코드는 더 이상 지원되지 않습니다.

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()
    
    sourceSets {
        val commonMain by getting
        val myCustomIntermediateSourceSet by creating {
            dependsOn(commonMain)
        }
        
        targets["jvm"].compilations["main"].source(myCustomIntermediateSourceSet)
    }
}
```

**현재 권장되는 모범 사례는 무엇인가요?**

`KotlinCompilation.source(someSourceSet)`를 대체하려면 `.srcDir()` 함수를 사용하여 적절한 소스 세트에 소스를 직접 추가하세요. 또는 `KotlinCompilation`의 기본 소스 세트에서 `someSourceSet`으로 `dependsOn` 관계를 추가하여 새 소스 세트를 생성할 수 있습니다. 또한 IDE 친화적이고 가장 견고한 접근 방식으로 간주되는 [소스 세트 컨벤션](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/)을 사용하여 소스를 직접 참조할 수도 있습니다. 마지막으로 모든 경우에 작동하는 `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)`을 사용할 수도 있습니다.

위 코드는 다음 방법 중 하나로 변경할 수 있습니다.

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // commonMain 소스 세트는 .get() 함수를 사용하여
            // 접근해야 합니다.
            dependsOn(commonMain.get())
        }

        // 방법 1. 적절한 소스 세트에 소스를 직접 추가:
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 방법 2. 기본 Kotlin Multiplatform 타깃에서 제공하는
        // main 및 test 소스 세트 규칙(conventions)을 사용:
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 방법 3. 보다 일반적인 솔루션. 빌드 스크립트에
        // 더 고급 접근 방식이 필요한 경우 사용:
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**변경 사항은 언제 적용되나요?**

지원 중단 주기는 다음과 같습니다.

* 1.9.0: `KotlinCompilation.source`가 사용될 때 지원 중단 경고 도입
* 1.9.20: 이 경고를 오류로 격상
* 2.3.0: Kotlin Gradle 플러그인에서 `KotlinCompilation.source` 제거. 사용 시도시 빌드스크립트 컴파일 중 "unresolved reference" 오류 발생

<a id="kotlin-js-plugin-deprecation"></a>
### `kotlin-js` Gradle 플러그인에서 `kotlin-multiplatform` Gradle 플러그인으로 마이그레이션 {initial-collapse-state="collapsed" collapsible="true" id="migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin"}

**무엇이 변경되었나요?**

Kotlin 1.9.0부터 `kotlin-js` Gradle 플러그인이 지원 중단되었습니다. 기본적으로 이 플러그인은 `js()` 타깃이 포함된 `kotlin-multiplatform` 플러그인의 기능을 중복하여 제공했으며 내부적으로 동일한 구현을 공유했습니다. 이러한 중복은 혼란을 초래하고 Kotlin 팀의 유지 관리 부담을 가중시켰습니다. 대신 `js()` 타깃과 함께 `kotlin-multiplatform` Gradle 플러그인으로 마이그레이션하는 것을 권장합니다.

**현재 권장되는 모범 사례는 무엇인가요?**

1. 프로젝트에서 `kotlin-js` Gradle 플러그인을 제거하고, `pluginManagement {}` 블록을 사용하는 경우 `settings.gradle.kts` 파일에 `kotlin-multiplatform`을 적용합니다.

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 다음 줄을 제거합니다.
           kotlin("js") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 대신 다음 줄을 추가합니다.
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   다른 방식으로 플러그인을 적용하는 경우에는 [Gradle 문서](https://docs.gradle.org/current/userguide/plugins.html)에서 마이그레이션 지침을 참조하세요.

2. 소스 파일을 동일한 디렉터리 내의 `main` 및 `test` 폴더에서 `jsMain` 및 `jsTest` 폴더로 이동합니다.
3. 종속성 선언을 조정합니다.

   * `sourceSets {}` 블록을 사용하여 프로덕션 종속성에는 `jsMain {}`, 테스트 종속성에는 `jsTest {}`와 같이 각 소스 세트의 종속성을 구성하는 것을 권장합니다. 자세한 내용은 [종속성 추가](multiplatform-add-dependencies.md)를 참조하세요.
   * 최상위 블록에서 종속성을 선언하려면 `api("group:artifact:1.0")` 선언을 `add("jsMainApi", "group:artifact:1.0")` 등으로 변경하세요.

     > 이 경우 최상위 `dependencies {}` 블록이 반드시 `kotlin {}` 블록 **뒤에** 오도록 해야 합니다. 그렇지 않으면 "Configuration not found" 오류가 발생합니다.
     >
     {style="note"}

   `build.gradle.kts` 파일의 코드를 다음 방법 중 하나로 변경할 수 있습니다.

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("js") version "1.9.0"
   }
   
   dependencies {
       testImplementation(kotlin("test"))
       implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
   }
   
   kotlin {
       js {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("multiplatform") version "1.9.0"
   }
   
   kotlin {
       js {
           // ...
       }
       
       // 방법 1. sourceSets {} 블록에서 종속성 선언:
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // 여기서는 js 접두사가 필요하지 않으며, 최상위 블록에서 그대로 복사하여 붙여넣을 수 있습니다.
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 방법 2. 종속성 선언에 js 접두사 추가:
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. 대부분의 경우 `kotlin {}` 블록 내부에서 Kotlin Gradle 플러그인이 제공하는 DSL은 변경되지 않은 상태로 유지됩니다. 그러나 태스크 및 구성과 같은 저수준 Gradle 엔티티를 이름으로 참조하고 있었다면, 일반적으로 `js` 접두사를 추가하여 조정해야 합니다. 예를 들어 `browserTest` 태스크는 `jsBrowserTest`라는 이름으로 찾을 수 있습니다.

**변경 사항은 언제 적용되나요?**

`kotlin-js` Gradle 플러그인의 지원 중단 주기는 다음과 같습니다.

* 1.9.0: `kotlin-js` 플러그인 사용 시 지원 중단 경고 발생
* 2.4.0: [경고를 오류로 격상](https://youtrack.jetbrains.com/issue/KT-59305)

<a id="jvmWithJava-preset-deprecation"></a>
### `jvmWithJava` 프리셋 지원 중단 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-jvmwithjava-preset"}

**무엇이 변경되었나요?**

`targetPresets.jvmWithJava`는 지원 중단되었으며 사용하지 않는 것이 좋습니다.

**현재 권장되는 모범 사례는 무엇인가요?**

대신 `jvm { withJava() }` 타깃을 사용하세요. `jvm { withJava() }`로 전환한 후에는 `.java` 소스가 있는 소스 디렉터리의 경로를 조정해야 합니다.

예를 들어 기본 이름이 "jvm"인 `jvm` 타깃을 사용하는 경우 다음과 같습니다.

| 이전          | 현재                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.3.40: `targetPresets.jvmWithJava` 사용 시 경고 도입
* 1.9.20: 이 경고를 오류로 격상
* &gt;1.9.20: `targetPresets.jvmWithJava` API 제거. 사용 시도시 빌드스크립트 컴파일 실패

> 전체 `targetPresets` API가 지원 중단되었음에도 불구하고 `jvmWithJava` 프리셋은 다른 지원 중단 일정을 가집니다.
>
{style="note"}

<a id="android-sourceset-layout-v1-deprecation"></a>
### 레거시 Android 소스 세트 레이아웃 지원 중단 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-legacy-android-source-set-layout"}

**무엇이 변경되었나요?**

Kotlin 1.9.0부터 [새로운 Android 소스 세트 레이아웃](multiplatform-android-layout.md)이 기본적으로 사용됩니다. 레거시 레이아웃 지원은 중단되었으며, `kotlin.mpp.androidSourceSetLayoutVersion` Gradle 속성을 사용하면 이제 지원 중단 진단이 발생합니다.

**변경 사항은 언제 적용되나요?**

지원 중단 주기는 다음과 같습니다.

* <=1.9.0: `kotlin.mpp.androidSourceSetLayoutVersion=1` 사용 시 경고 보고. 이 경고는 `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle 속성으로 억제할 수 있음
* 1.9.20: 이 경고를 오류로 격상. 이 오류는 억제할 수 **없음**
* 2.4.0: 레거시 Android 소스 세트 레이아웃 지원을 제거하고 [`kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle 속성 제거](https://youtrack.jetbrains.com/issue/KT-82265)

<a id="common-sourceset-with-dependson-deprecation"></a>
### 커스텀 `dependsOn`을 사용하는 `commonMain` 및 `commonTest` 지원 중단 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-commonmain-and-commontest-with-custom-dependson"}

**무엇이 변경되었나요?**

`commonMain` 및 `commonTest` 소스 세트는 일반적으로 각각 `main` 및 `test` 소스 세트 계층 구조의 루트를 나타냅니다. 그러나 이러한 소스 세트의 `dependsOn` 관계를 수동으로 구성하여 이를 재정의할 수 있었습니다.

이러한 구성을 유지하려면 멀티플랫폼 빌드 내부에 대한 추가적인 지식과 노력이 필요합니다. 또한 특정 빌드스크립트를 읽어야만 `commonMain`이 `main` 소스 세트 계층 구조의 루트인지 확인할 수 있으므로 코드 가독성과 코드 재사용성이 떨어집니다.

따라서 `commonMain` 및 `commonTest`에서 `dependsOn`에 접근하는 것은 이제 지원 중단되었습니다.

**현재 권장되는 모범 사례는 무엇인가요?**

`commonMain.dependsOn(customCommonMain)`을 사용하는 `customCommonMain` 소스 세트를 1.9.20으로 마이그레이션해야 한다고 가정해 보겠습니다. 대부분의 경우 `customCommonMain`은 `commonMain`과 동일한 컴파일에 참여하므로 `customCommonMain`을 `commonMain`으로 병합할 수 있습니다.

1. `customCommonMain`의 소스를 `commonMain`으로 복사합니다.
2. `customCommonMain`의 모든 종속성을 `commonMain`에 추가합니다.
3. `customCommonMain`의 모든 컴파일러 옵션 설정을 `commonMain`에 추가합니다.

드물게 `customCommonMain`이 `commonMain`보다 더 많은 컴파일에 참여할 수 있습니다. 이러한 구성에는 빌드 스크립트의 추가적인 저수준 구성이 필요합니다. 이것이 본인의 사용 사례인지 확실하지 않다면 아닐 가능성이 높습니다.

만약 해당 사용 사례가 맞다면 `customCommonMain`의 소스 및 설정을 `commonMain`으로 옮기고 그 반대로도 수행하여 두 소스 세트를 "맞바꾸십시오(swap)".

**변경 사항은 언제 적용되나요?**

예정된 지원 중단 주기는 다음과 같습니다.

* 1.9.0: `commonMain`에서 `dependsOn` 사용 시 경고 보고
* &gt;=1.9.20: `commonMain` 또는 `commonTest`에서 `dependsOn` 사용 시 오류 보고

### 전방 선언(Forward Declaration)에 대한 새로운 접근 방식 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-forward-declarations"}

**무엇이 변경되었나요?**

JetBrains 팀은 전방 선언의 동작을 보다 예측 가능하게 만들기 위해 Kotlin에서의 전방 선언 접근 방식을 개편했습니다.

* `cnames` 또는 `objcnames` 패키지를 통해서만 전방 선언을 임포트할 수 있습니다.
* 해당하는 C 및 Objective-C 전방 선언과의 명시적인 타입 변환(cast)을 수행해야 합니다.

**현재 권장되는 모범 사례는 무엇인가요?**

* `cstructName` 전방 선언을 선언하는 `library.package`를 가진 C 라이브러리를 고려해 보세요. 이전에는 `import library.package.cstructName`을 통해 라이브러리에서 직접 임포트할 수 있었습니다. 이제는 이를 위해 특별한 전방 선언 패키지만 사용할 수 있습니다: `import cnames.structs.cstructName`. `objcnames`의 경우에도 마찬가지입니다.

* 두 개의 objcinterop 라이브러리가 있다고 가정해 보겠습니다. 하나는 `objcnames.protocols.ForwardDeclaredProtocolProtocol`을 사용하고, 다른 하나는 실제 정의를 가지고 있습니다.

  ```ObjC
  // 첫 번째 objcinterop 라이브러리
  #import <Foundation/Foundation.h>
  
  @protocol ForwardDeclaredProtocol;
  
  NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
      return [NSString stringWithUTF8String:"Protocol"];
  }
  ```

  ```ObjC
  // 두 번째 objcinterop 라이브러리
  // 헤더:
  #import <Foundation/Foundation.h>
  @protocol ForwardDeclaredProtocol
  @end
  // 구현:
  @interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
  @end

  id<ForwardDeclaredProtocol> produceProtocol() {
      return [ForwardDeclaredProtocolImpl new];
  }
  ```

  이전에는 이들 간에 객체를 원활하게 전달할 수 있었습니다. 이제는 전방 선언에 대해 명시적인 `as` 캐스팅이 필요합니다.

  ```kotlin
  // Kotlin 코드:
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 해당하는 실제 클래스에서 `objcnames.protocols.ForwardDeclaredProtocolProtocol`로만 캐스팅할 수 있습니다. 그렇지 않으면 오류가 발생합니다.
  >
  {style="note"}

**변경 사항은 언제 적용되나요?**

Kotlin 1.9.20부터 해당하는 C 및 Objective-C 전방 선언과의 캐스팅을 명시적으로 수행해야 합니다. 또한 이제는 특수 패키지를 통해서만 전방 선언을 임포트할 수 있습니다.

## Kotlin 1.7.0−1.8.22 {id="kotlin-1-7-0-1-8-22"}

이 섹션에서는 지원 중단 주기가 끝나고 Kotlin 1.7.0−1.8.22에서 적용되는 호환성을 깨뜨리는 변경 사항을 다룹니다.

<a id="deprecated-compatibility-with-kmp-gradle-plugin-and-gradle-java-plugins"></a>
### Kotlin Multiplatform Gradle 플러그인과 Gradle Java 플러그인 간의 호환성 지원 중단 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins"}

**무엇이 변경되었나요?**

Kotlin Multiplatform Gradle 플러그인과 Gradle 플러그인인 [Java](https://docs.gradle.org/current/userguide/java_plugin.html), [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html), [Application](https://docs.gradle.org/current/userguide/application_plugin.html) 간의 호환성 문제로 인해, 동일한 프로젝트에 이러한 플러그인들을 함께 적용할 경우 지원 중단 경고가 표시됩니다. 또한 멀티플랫폼 프로젝트의 다른 Gradle 플러그인이 Gradle Java 플러그인을 적용하는 경우에도 경고가 나타납니다. 예를 들어 [Spring Boot Gradle 플러그인](https://docs.spring.io/spring-boot/gradle-plugin/index.html)은 자동으로 Application 플러그인을 적용합니다.

이러한 지원 중단 경고를 추가한 이유는 Kotlin Multiplatform의 프로젝트 모델과 Gradle의 Java 에코시스템 플러그인 간의 근본적인 호환성 문제 때문입니다. 현재 Gradle의 Java 에코시스템 플러그인은 다른 플러그인이 다음과 같은 동작을 할 수 있다는 점을 고려하지 않습니다.

* Java 에코시스템 플러그인과 다른 방식으로 JVM 타깃을 게시하거나 컴파일하는 경우
* 동일한 프로젝트 내에 JVM 및 Android와 같이 서로 다른 두 개의 JVM 타깃이 있는 경우
* 잠재적으로 여러 비 JVM(non-JVM) 타깃이 포함된 복잡한 멀티플랫폼 프로젝트 구조를 가진 경우

안타깝게도 현재 Gradle은 이러한 문제를 해결할 수 있는 API를 제공하지 않습니다.

이전에는 Java 에코시스템 플러그인과의 통합을 돕기 위해 Kotlin Multiplatform에서 몇 가지 임시 해결책(workaround)을 사용했습니다. 그러나 이러한 해결책은 호환성 문제를 근본적으로 해결하지 못했으며, Gradle 8.8 릴리스 이후로는 더 이상 적용할 수 없게 되었습니다. 자세한 내용은 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)를 참조하세요.

이 호환성 문제를 정확히 어떻게 해결해야 할지는 아직 명확하지 않지만, Kotlin Multiplatform 프로젝트에서 어떤 형태로든 Java 소스 컴파일을 지속적으로 지원하기 위해 최선을 다하고 있습니다. 최소한 멀티플랫폼 프로젝트 내에서 Java 소스를 컴파일하고 Gradle의 [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) 플러그인을 사용하는 기능은 지원할 것입니다.

**현재 권장되는 모범 사례는 무엇인가요?**

멀티플랫폼 프로젝트에서 이 지원 중단 경고가 표시되는 경우 다음을 권장합니다.
1. 프로젝트에 Gradle Java 플러그인이 실제로 필요한지 확인합니다. 필요하지 않다면 제거하는 것을 고려하세요.
2. Gradle Java 플러그인이 단일 태스크에만 사용되는지 확인합니다. 그렇다면 큰 어려움 없이 플러그인을 제거할 수 있습니다. 예를 들어 해당 태스크가 Javadoc JAR 파일을 생성하기 위해 Gradle Java 플러그인을 사용하는 경우, 대신 Javadoc 태스크를 수동으로 정의할 수 있습니다.

그 외에 멀티플랫폼 프로젝트에서 Kotlin Multiplatform Gradle 플러그인과 이러한 Java용 Gradle 플러그인을 둘 다 사용해야 하는 경우 다음을 권장합니다.

1. Gradle 프로젝트에 별도의 서브프로젝트를 생성합니다.
2. 별도의 서브프로젝트에 Java용 Gradle 플러그인을 적용합니다.
3. 별도의 서브프로젝트에서 상위 멀티플랫폼 프로젝트에 대한 종속성을 추가합니다.

> 별도의 서브프로젝트는 멀티플랫폼 프로젝트여서는 **안 되며**, 멀티플랫폼 프로젝트에 대한 종속성을 설정하는 용도로만 사용해야 합니다.
>
{style="warning"}

예를 들어 `my-main-project`라는 멀티플랫폼 프로젝트가 있고 [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle 플러그인을 사용하려는 경우가 있습니다.

서브프로젝트(이름을 `subproject-A`라고 가정)를 생성하고 나면 상위 프로젝트 구조는 다음과 같아야 합니다.

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

서브프로젝트의 `build.gradle.kts` 파일 내 `plugins {}` 블록에서 Java Library 플러그인을 적용합니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("java-library")
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id('java-library')
}
```

</TabItem>
</Tabs>

서브프로젝트의 `build.gradle.kts` 파일에서 상위 멀티플랫폼 프로젝트에 대한 종속성을 추가합니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 상위 멀티플랫폼 프로젝트의 이름
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 상위 멀티플랫폼 프로젝트의 이름
}
```

</TabItem>
</Tabs>

이제 상위 프로젝트가 두 플러그인 모두와 함께 작동하도록 설정되었습니다.

### 자동 생성된 타깃에 대한 새로운 접근 방식 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-auto-generated-targets"}

**무엇이 변경되었나요?**

Gradle에 의해 자동 생성된 타깃 접근자(target accessor)를 `kotlin.targets {}` 블록 내부에서 더 이상 사용할 수 없습니다. 대신 `findByName("targetName")` 메서드를 사용하세요.

이러한 접근자는 `kotlin.targets.linuxX64`와 같이 `kotlin.targets {}` 외부에서는 여전히 사용할 수 있습니다.

**현재 권장되는 모범 사례는 무엇인가요?**

<table>
    
<tr>
<td>이전</td>
        <td>현재</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure(['windows',&#10;            'linux']) {&#10;        }&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure([findByName('windows'),&#10;            findByName('linux')]) {&#10;        }&#10;    }&#10;}"/>
</td>
</tr>

</table>

**변경 사항은 언제 적용되나요?**

Kotlin 1.7.20에서는 `kotlin.targets {}` 블록에서 타깃 접근자를 사용할 때 오류가 도입되었습니다.

자세한 내용은 [YouTrack의 해당 이슈](https://youtrack.jetbrains.com/issue/KT-47047)를 참조하세요.

### Gradle 입력 및 출력 컴파일 태스크의 변경 사항 {initial-collapse-state="collapsed" collapsible="true" id="changes-in-gradle-input-and-output-compile-tasks"}

**무엇이 변경되었나요?**

Kotlin 컴파일 태스크가 `sourceCompatibility` 및 `targetCompatibility` 입력을 갖는 Gradle `AbstractCompile` 태스크를 더 이상 상속하지 않으므로 Kotlin 사용자의 스크립트에서 해당 입력을 사용할 수 없게 되었습니다.

컴파일 태스크의 기타 호환성을 깨뜨리는 변경 사항:

**현재 권장되는 모범 사례는 무엇인가요?**

| 이전                                                              | 현재                                                                                                           |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 입력을 더 이상 사용할 수 없습니다.        | 대신 `sources` 입력을 사용하세요. 또한 `setSource()` 메서드는 여전히 사용할 수 있습니다.                          |
| `sourceFilesExtensions` 입력이 제거되었습니다.                      | 컴파일 태스크는 여전히 `PatternFilterable` 인터페이스를 구현합니다. Kotlin 소스를 필터링하려면 해당 메서드를 사용하세요. |
| `Gradle destinationDir: File` 출력이 지원 중단되었습니다.            | 대신 `destinationDirectory: DirectoryProperty` 출력을 사용하세요.                                              |
| `KotlinCompile` 태스크의 `classpath` 속성이 지원 중단되었습니다. | 이제 모든 컴파일 태스크는 컴파일에 필요한 라이브러리 목록에 `libraries` 입력을 사용합니다.              |

**변경 사항은 언제 적용되나요?**

Kotlin 1.7.20에서는 해당 입력을 사용할 수 없으며, 출력이 교체되고, `classpath` 속성이 지원 중단되었습니다.

자세한 내용은 [YouTrack의 해당 이슈](https://youtrack.jetbrains.com/issue/KT-32805)를 참조하세요.

### 컴파일 종속성에 대한 새로운 구성 이름 {initial-collapse-state="collapsed" collapsible="true" id="new-configuration-names-for-dependencies-on-the-compilation"}

**무엇이 변경되었나요?**

Kotlin Multiplatform Gradle 플러그인에 의해 생성된 컴파일 구성(compilation configuration)의 이름이 새로 변경되었습니다.

Kotlin Multiplatform 프로젝트의 타깃에는 두 개의 기본 컴파일인 `main`과 `test`가 있습니다. 각 컴파일에는 고유한 기본 소스 세트(예: `jvmMain`, `jvmTest`)가 있습니다. 이전에는 테스트 컴파일과 해당 기본 소스 세트의 구성 이름이 동일하여, 플랫폼 전용 속성으로 표시된 구성이 다른 구성에 포함될 때 이름 충돌로 인한 문제가 발생할 수 있었습니다.

이제 컴파일 구성에는 추가로 `Compilation` 접미사가 붙으며, 하드코딩된 이전 구성 이름을 사용하는 프로젝트 및 플러그인은 더 이상 컴파일되지 않습니다.

해당 소스 세트에 대한 종속성 구성 이름은 동일하게 유지됩니다.

**현재 권장되는 모범 사례는 무엇인가요?**

<table>
    
<tr>
<td></td>
        <td>이전</td>
        <td>현재</td>
</tr>

    
<tr>
<td rowspan="2"><code>jvmMain</code> 컴파일의 종속성</td>
<td>
<code-block lang="kotlin" code="jvm&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmCompilationImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
</tr>

    
<tr>
<td><code>jvmMain</code> 소스 세트의 종속성</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmMain&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 컴파일의 종속성</td>
<td>
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmTestCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 소스 세트의 종속성</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
</tr>

</table>

사용 가능한 스코프는 `Api`, `Implementation`, `CompileOnly`, `RuntimeOnly`입니다.

**변경 사항은 언제 적용되나요?**

Kotlin 1.8.0에서는 하드코딩된 문자열에서 이전 구성 이름을 사용할 때 오류가 도입되었습니다.

자세한 내용은 [YouTrack의 해당 이슈](https://youtrack.jetbrains.com/issue/KT-35916/)를 참조하세요.