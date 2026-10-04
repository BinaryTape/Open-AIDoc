[//]: # (title: 멀티플랫폼 라이브러리 의존성 추가)

모든 프로그램은 성공적으로 작동하기 위해 일련의 라이브러리가 필요합니다.
Kotlin Multiplatform 프로젝트는 여러 타겟 플랫폼을 지원하는 크로스 플랫폼 라이브러리, 특정 플랫폼 전용 라이브러리, 그리고 다른 멀티플랫폼 프로젝트에 의존할 수 있습니다.

Android 앱을 개발해 본 경험이 있다면, 멀티플랫폼 의존성을 추가하는 방법은 일반 Android 프로젝트에 Gradle 의존성을 추가하는 것과 유사합니다.
주요 차이점은 모듈 전체가 아니라 특정 소스 세트(source set)에 의존성을 추가해야 한다는 점입니다.

이 페이지에서는 멀티플랫폼 프로젝트에서 의존성을 관리하는 전반적인 접근 방식을 설명합니다.
특정 플랫폼에 대한 세부 사항은 [Android 의존성 추가](multiplatform-android-dependencies.md) 및 [iOS 의존성 추가](multiplatform-ios-dependencies.md)를 참조하세요.

## 의존성 유형 {id="dependency-types"}

Kotlin Multiplatform 프로젝트에서 사용할 수 있는 의존성에는 두 가지 유형이 있습니다.

* _멀티플랫폼 의존성 (Multiplatform dependencies)_. 여러 타겟을 지원하며 공통 소스 세트(common source set)에서 사용할 수 있는 멀티플랫폼 라이브러리입니다.

  [Koin](https://insert-koin.io/), [Coil](https://coil-kt.github.io/coil/), [SQLDelight](https://sqldelight.github.io/sqldelight/latest/)와 같은 최신 Android 라이브러리는 이미 멀티플랫폼을 지원합니다.
  
  배포된 Kotlin Multiplatform 라이브러리 카탈로그인 [klibs.io](https://klibs.io/)에서 더 많은 멀티플랫폼 라이브러리를 찾아보세요.

* _네이티브 의존성 (Native dependencies)_. 해당 생태계의 플랫폼별 라이브러리입니다.
  네이티브 프로젝트에서는 일반적으로 Android용 Gradle이나 iOS용 Swift Package Manager와 같은 플랫폼별 도구를 통해 이러한 라이브러리를 관리합니다.

  멀티플랫폼 프로젝트 모듈을 작업할 때도 안전한 스토리지, 시스템 호출 등과 같은 플랫폼 API를 사용하기 위해 여전히 네이티브 의존성이 필요한 경우가 많습니다.
  빌드 스크립트에서는 `androidMain` 및 `iosMain`과 같은 네이티브 소스 세트의 설정에서 네이티브 의존성을 지정합니다.

두 유형의 의존성 모두 로컬 및 외부 리포지토리를 사용할 수 있습니다.

## Gradle 버전 카탈로그 {id="gradle-version-catalogs"}

Gradle을 사용할 때는 의존성 관리를 위해 [버전 카탈로그(version catalogs)](https://docs.gradle.org/current/userguide/version_catalogs.html)를 사용하는 것을 권장합니다.

버전 카탈로그를 사용하면 아티팩트 이름과 버전을 카탈로그에 정의한 다음, 빌드 스크립트 파일에서 이 정의를 참조할 수 있습니다.

예를 들어, 기본 카탈로그 파일은 다음과 같습니다.

```toml
# libs.versions.toml, 기본 카탈로그 파일
[versions]
my-library = "1.0"

[libraries]
my-library = {module = "com.example:my-library", version.ref = "my-library"}
```

그리고 이 카탈로그를 사용하여 의존성을 추가하는 예시는 다음과 같습니다.

```kotlin
// build.gradle.kts
dependencies {
    // 'libs'는 카탈로그 파일 이름의 첫 번째 부분입니다
    // 'my.library'는 네임스페이스를 제외하고 대시(-) 대신 마침표(.)를 사용한
    // 아티팩트의 이름입니다
    implementation(libs.my.library)
}
```

## Kotlin 핵심 라이브러리 의존성 {id="dependencies-on-core-kotlin-libraries"}

### 표준 라이브러리 {id="standard-library"}

Kotlin Multiplatform 프로젝트의 각 소스 세트는 자동으로 Kotlin 표준 라이브러리(`kotlin-stdlib`)에 의존합니다.
표준 라이브러리의 버전은 적용된 [Kotlin Multiplatform Gradle 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)의 버전과 동일합니다.

플랫폼별 소스 세트의 경우 Gradle이 해당 플랫폼에 맞는 라이브러리 변형을 자동으로 사용하며, 나머지 소스 세트에는 공통 표준 라이브러리가 추가됩니다.
JVM 타겟의 경우 Kotlin Gradle 플러그인은 Gradle 빌드 스크립트의 `compilerOptions.jvmTarget` [컴파일러 옵션](https://kotlinlang.org/docs/gradle-compiler-options.html)에 따라 적절한 JVM 표준 라이브러리를 선택합니다.

[기본 `kotlin-stdlib` 의존성 해결 동작을 변경](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)하는 방법을 알아보세요.

### 테스트 라이브러리 {id="testing-libraries"}

멀티플랫폼 테스트에는 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API를 사용할 수 있습니다.
이 라이브러리는 멀티플랫폼 라이브러리이므로 `commonTest` 소스 세트에 단일 의존성을 지정하는 것만으로 모든 소스 세트에 테스트 의존성을 추가할 수 있습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        // 모든 테스트 소스 세트에서 kotlin.test 클래스를 사용할 수 있도록 합니다
        commonTest.dependencies {
            implementation(kotlin("test")) 
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        // 모든 테스트 소스 세트에서 kotlin.test 클래스를 사용할 수 있도록 합니다
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</TabItem>
</Tabs>

### `kotlinx` 라이브러리 {id="kotlinx-libraries"}

kotlinx 라이브러리는 JetBrains의 핵심 Kotlin 팀에서 유지 관리하는 멀티플랫폼 라이브러리입니다
(대표적인 예로 [kotlinx.serialization](https://github.com/kotlin/kotlinx.serialization) 및 [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines)가 있습니다).

다른 멀티플랫폼 라이브러리와 마찬가지로, 의존성을 추가하려면 해당 소스 세트에서 라이브러리 아티팩트를 참조하면 됩니다.

> `kotlinx` 라이브러리는 웹 타겟 등 특정 환경에서 더 복잡한 설정이 필요할 수 있습니다.
> 자세한 안내는 해당 라이브러리의 문서를 참조하세요.
{style="note"}

## Kotlin Multiplatform 라이브러리 의존성 {id="dependencies-on-kotlin-multiplatform-libraries"}

[SQLDelight](https://github.com/cashapp/sqldelight)와 같이 Kotlin Multiplatform을 도입한 라이브러리의 의존성을 추가할 수 있습니다.
이러한 라이브러리의 작성자는 일반적으로 프로젝트에 의존성을 추가하기 위한 가이드를 제공합니다.

<a as="button" href="https://klibs.io/" mode="classic" icon="arrow-right" icon-position="right">klibs.io에서 Kotlin Multiplatform 라이브러리 찾아보기</a>

### Gradle 버전 카탈로그 예시 {id="sample-gradle-version-catalog"}

Gradle을 사용할 때는 [버전 카탈로그](#gradle-version-catalogs)를 사용하는 것이 좋습니다.
다음은 아래 예제에서 사용되는 모든 라이브러리를 정의한 버전 카탈로그입니다.

```toml
[versions]
ktor = "%ktorVersion%"
kotlinx-coroutines = "%coroutinesVersion%"
sqlDelight = "%sqlDelightVersion%"

[libraries]
ktor-clientCore = { module = "io.ktor:ktor-client-core", version.ref = "%ktorVersion%" }
kotlinx-coroutinesCore = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "%coroutinesVersion%" }
sqldelight-nativeDriver = { module = "com.squareup.sqldelight:native-driver", version.ref = "%sqlDelightVersion%" }
```

### 모든 소스 세트에서 공유되는 라이브러리 {id="library-shared-for-all-source-sets"}

모든 소스 세트에서 라이브러리에 접근하거나 해당 라이브러리를 사용하여 공유 코드를 작성하려는 경우, 공통 소스 세트에만 추가하세요.
Kotlin Multiplatform Gradle 플러그인이 선언된 다른 소스 세트에 대해 해당하는 플랫폼별 아티팩트를 자동으로 해결(resolve)합니다.

> 공통 소스 세트는 플랫폼별 아티팩트에 의존할 수 없습니다.
> 공통 코드는 선언된 모든 타겟에 대해 컴파일될 수 있어야 합니다.
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.clientCore)
        }
        androidMain.dependencies {
            // ktor-client의 플랫폼별 파트에 대한 의존성은
            // 빌드 시점에 해결됩니다
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation(libs.ktor.clientCore)
            }
        }
        androidMain {
            dependencies {
              // ktor-client의 플랫폼별 파트에 대한 의존성은
              // 빌드 시점에 해결됩니다
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 최상위 `dependencies {}` 블록에서 공통 라이브러리를 구성할 수도 있습니다.
> [최상위 레벨에서 의존성 구성](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)을 참조하세요.
> 
{style="tip"}

### 특정 소스 세트에서 사용할 라이브러리 {id="libraries-to-be-used-in-specific-source-sets"}

특정 소스 세트에서만 멀티플랫폼 라이브러리를 사용하려는 경우, 해당 소스 세트에만 전용으로 추가할 수 있습니다.
그러면 라이브러리 선언은 해당 소스 세트에서만 사용할 수 있게 됩니다.

이러한 경우에는 플랫폼별 라이브러리 이름이 아닌 공통 라이브러리 이름을 사용하세요.
Kotlin Multiplatform Gradle 플러그인이 이러한 참조를 자동으로 해결합니다.
정확한 이름은 해당 라이브러리의 문서에 설명되어 있을 것입니다.

다음은 플랫폼별 SQLDelight에 `native-driver-iosx64` 대신 `native-driver`를 사용하는 예입니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines는 모든 소스 세트에서 사용할 수 있습니다
            implementation(libs.kotlinx.coroutinesCore)
        }
        androidMain.dependencies {
            // Android 전용 의존성을 위한 위치
        }
        iosMain.dependencies {
            // SQLDelight는 iOS 소스 세트에서 사용할 수 있지만,
            // Android나 공통 소스 세트에서는 사용할 수 없습니다
            implementation(libs.sqldelight.nativeDriver)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                // kotlinx.coroutines는 모든 소스 세트에서 사용할 수 있습니다
                implementation(libs.kotlinx.coroutinesCore)
            }
        }
        androidMain {
            dependencies {
                // Android 전용 의존성을 위한 위치
            }
        }
        iosMain {
            dependencies {
                // SQLDelight는 iOS 소스 세트에서 사용할 수 있지만,
                // Android나 공통 소스 세트에서는 사용할 수 없습니다
                implementation(sqldelight.nativeDriver)
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 다른 멀티플랫폼 프로젝트에 대한 의존성 {id="dependency-on-another-multiplatform-project"}

한 멀티플랫폼 프로젝트가 다른 멀티플랫폼 프로젝트에 의존할 수 있습니다.
이를 설정하려면 해당 의존성이 필요한 소스 세트에 Gradle 프로젝트 의존성을 추가하세요.
프로젝트 의존성을 모든 소스 세트에서 사용하려면 공통 소스 세트에 추가하세요.
이 경우 컴파일러가 다른 소스 세트에 해당 프로젝트의 플랫폼별 아티팩트를 자동으로 제공합니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(project(":some-other-multiplatform-module"))
        }
        androidMain.dependencies {
            // :some-other-multiplatform-module의 플랫폼별 선언은
            // 자동으로 해결됩니다
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation project(':some-other-multiplatform-module')
            }
        }
        androidMain {
            dependencies {
                // :some-other-multiplatform-module의 플랫폼별 선언은
                // 자동으로 해결됩니다
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 다음 단계 {id="what-s-next"}

멀티플랫폼 프로젝트의 의존성 추가와 관련된 다른 리소스를 확인하고 다음에 대해 자세히 알아보세요.

* [Android 의존성 추가](multiplatform-android-dependencies.md)
* [iOS 의존성 추가](multiplatform-ios-dependencies.md)
* 샘플 프로젝트에서 [Android 및 iOS 라이브러리](multiplatform-samples.md) 사용하기

## 도움 받기 {id="get-help"}

* **Kotlin Slack**. [초대장](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)을 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin 이슈 트래커**. [새 이슈 보고하기](https://youtrack.jetbrains.com/newIssue?project=KT).