[//]: # (title: Kotlin/JS에서 테스트 실행하기)

Kotlin 멀티플랫폼 Gradle 플러그인을 사용하면 Gradle 설정을 통해 지정할 수 있는 다양한 테스트 러너를 통해 테스트를 실행할 수 있습니다.

Kotlin/JS에서 테스트를 실행하는 일반적인 워크플로는 테스트 의존성을 추가하고, 빌드 파일에서 테스트 태스크를 구성하고, 테스트를 추가한 다음 실행하는 것입니다.

브라우저 테스트의 경우 다음 중에서 선택할 수 있습니다.

* [Karma](https://karma-runner.github.io/) 테스트 러너.
* 브라우저 테스트를 위한 새로운 DSL.

> Karma 프로젝트는 [지원 중단(deprecated)](https://github.com/karma-runner/karma#karma)되었습니다. 새로운 기능 추가나 버그 수정은 예정되어 있지 않습니다. 대안으로 브라우저 테스트를 위한 새로운 Kotlin DSL을 사용해 보세요.
>
> 브라우저 테스트를 위한 새로운 DSL은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained) 상태입니다. 언제든지 변경될 수 있으며, `@OptIn(ExperimentalJsTestDsl::class)` 어노테이션을 통한 옵트인(opt-in)이 필요합니다.
>
{style="warning"}

## 테스트 의존성 추가하기 {id="add-test-dependencies"}

멀티플랫폼 프로젝트를 생성할 때, `commonTest`에서 단일 의존성을 사용하여 JavaScript 타겟을 포함한 모든 소스 세트에 테스트 의존성을 추가할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // JS에서 테스트 어노테이션과 기능을 사용할 수 있게 합니다.
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // JS에서 테스트 어노테이션과 기능을 사용할 수 있게 합니다.
            }
        }
    }
}
```

</tab>
</tabs>

## 브라우저 구성하기 {id="configure-browsers"}

특정 브라우저를 대상으로 Kotlin/JS에서 테스트를 실행할 수 있습니다. 이렇게 하려면 Gradle 빌드 파일의 `browser {}` 구성 블록에서 설정을 조정하세요.

기본적으로 플러그인은 브라우저 테스트를 실행하기 위해 [헤드리스 크롬(Headless Chrome)](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)을 사용합니다. Kotlin 멀티플랫폼 Gradle 플러그인에는 기본적으로 브라우저가 포함되어 있지 않습니다. 추가 브라우저를 활성화하려면 Karma의 경우 `testTask {}` 블록을, 브라우저 테스트용 새 DSL의 경우 `test {}` 블록을 사용하세요. 사용 가능한 모든 옵션은 다음과 같습니다.

<tabs group="js-test-dsl">
<tab title="Karma" group-key="karma">

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useIe()
                    useSafari()
                    useFirefox()
                    useChrome()
                    useChromeCanary()
                    useChromeHeadless()
                    usePhantomJS()
                    useOpera()
                }
            }
        }
    }
}
```

Karma를 사용하는 경우 대상 시스템(로컬 또는 CI 환경)에 필요한 모든 브라우저를 설치해야 합니다.

Karma 기능에 대한 자세한 내용은 [Kotlin/JS 프로젝트 설정](js-project-setup.md#karma)을 참고하세요.

</tab>
<tab title="DSL for browser testing" group-key="Browser-test-dsl">

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                chromium()
                firefox()
                webkit() // Safari 브라우저
            }
        }
    }
}
```

브라우저 테스트를 위한 새로운 DSL을 사용하면 Kotlin 멀티플랫폼 Gradle 플러그인이 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 명령을 사용하여 처음 실행할 때 필요한 브라우저를 설치합니다. 그런 다음 Playwright가 이 브라우저들의 위치를 관리하며, 로컬에 설치된 브라우저는 사용하지 않습니다.

브라우저 테스트용 새 DSL에서 사용할 수 있는 추가 설정은 [고급 구성](#advanced-configuration)을 참고하세요.

</tab>
</tabs>

## 테스트 추가하기 {id="add-a-test"}

테스트가 제대로 실행되는지 확인하려면 `src/jsTest/kotlin/AppTest.kt` 파일을 생성하고 다음 내용을 입력하세요.

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

@Test
fun thingsShouldWork() {
    assertEquals(listOf(3,2,1), listOf(1,2,3).reversed())
}

@Test
fun thingsShouldBreak() {
    assertEquals(listOf(1,2,3), listOf(1,2,3).reversed())
}
```

## 테스트 실행하기 {id="run-tests"}

브라우저에서 테스트를 실행하려면 `jsBrowserTest` 태스크를 실행하거나 IntelliJ IDEA에서 거터(gutter) 아이콘을 사용하여 전체 또는 개별 테스트를 실행하세요.

![Gradle browserTest 태스크](browsertest-task.png){width=700}

또는 커맨드 라인에서 테스트를 실행하려면 Gradle 래퍼(wrapper)를 사용하세요.

```bash
./gradlew jsBrowserTest
```

IntelliJ IDEA에서 테스트를 실행하면 **Run** 도구 창에 테스트 결과가 표시됩니다. 실패한 테스트를 클릭하면 스택 트레이스(stack trace)를 볼 수 있으며, 더블 클릭하면 해당 테스트 구현으로 이동할 수 있습니다.

![IntelliJ IDEA의 테스트 결과](test-stacktrace-ide.png){width=700}

테스트 실행 방식과 관계없이 각 테스트를 실행한 후에는 Gradle에서 생성한 올바른 형식의 테스트 보고서를 `build/reports/tests/jsBrowserTest/index.html`에서 찾을 수 있습니다. 이 파일을 브라우저에서 열어 테스트 결과의 또 다른 개요를 확인하세요.

![Gradle 테스트 요약](test-summary.png){width=700}

위의 코드 스니펫에 표시된 예제 테스트 세트를 사용하는 경우, 하나는 통과하고 하나는 실패하여 총 50%의 성공률을 보입니다. 개별 테스트 케이스에 대한 자세한 정보를 확인하려면 제공된 링크를 사용하세요.

![Gradle 요약의 실패한 테스트 스택 트레이스](failed-test.png){width=700}

## 고급 구성 {id="advanced-configuration"}
<primary-label ref="experimental-opt-in"/>

> 이 섹션은 브라우저 테스트를 위한 새로운 실험적 DSL에만 적용됩니다.
>
{style="note"}

브라우저 테스트를 위한 새로운 DSL은 미니멀하고 도구에 구애받지 않도록(tool-agnostic) 설계되었습니다. 현재 구현에는 다음이 포함됩니다.

* [Playwright](https://playwright.dev/): Chromium, Firefox, WebKit(Safari) 브라우저 엔진을 지원하는 브라우저 드라이버 및 배포 관리자 역할을 합니다.
* [Mocha](https://mochajs.org/): 테스트 러너 역할을 합니다.
* [webpack](https://webpack.js.org/): 번들러 역할을 합니다([향후 릴리스](https://youtrack.jetbrains.com/issue/KT-48308/)에서 [Vite](https://vite.dev/)로 대체될 예정).

이 DSL은 타임아웃, 헤드리스 모드, 러너별 옵션을 Gradle 프로퍼티로 노출하므로, 러너 간에 기본값을 공유하거나 특정 브라우저에 대해 이를 재정의(override)할 수 있으며 프로바이더(provider)를 통해 값을 지연 계산할 수 있습니다.

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // kotlin.Duration을 사용하여 모든 러너의 기본 타임아웃 구성
                timeout = 30.seconds

                // Gradle 프로바이더를 사용하여 헤드리스 모드 구성
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)

                // 커스텀 이름으로 Chromium 러너 활성화 및 구성
                chromium("chromium-no-webgl2") {
                    // 이 러너의 기본 타임아웃 재정의
                    timeout = 10.seconds

                    // Chromium 전용 추가 실행 인자
                    launchArgs.add("--disable-webgl2")
                }

                // Firefox 러너 활성화
                firefox()

                // WebKit 러너 활성화 및 구성
                webkit("safari") {
                    timeout = 35.seconds
                }
            }
        }
    }
}
```

모든 테스트 러너에 대한 옵션은 `test {}` 블록에서 직접 설정할 수 있습니다. 특정 러너에 대해 이러한 공통 옵션을 재정의하려면 커스텀 이름을 사용하고 해당 러너 블록 내에 다른 값을 지정하세요. 이 예제에서는 Chromium 및 WebKit(Safari) 브라우저가 각각 10초와 35초의 타임아웃을 사용하며, Firefox는 공통 타임아웃인 30초를 사용합니다.

각 러너는 고유한 이름으로 등록되므로, 테스트 보고서에서 특정 결과가 어떤 브라우저에서 나온 것인지 확인할 수 있습니다.

## 플러그인 작성자를 위한 구성 {id="configuration-for-plugin-authors"}
<primary-label ref="experimental-opt-in"/>

> 이 섹션은 브라우저 테스트를 위한 새로운 실험적 DSL에만 적용됩니다.
>
{style="note"}

Kotlin 멀티플랫폼 Gradle 플러그인을 기반으로 하는 Gradle 플러그인을 작성하는 경우, 브라우저 테스트를 위한 새로운 DSL을 통해 브라우저 러너와 생성된 테스트 번들의 위치에도 접근할 수 있습니다.

Kotlin은 기본 [테스트 러너 페이지](https://github.com/Kotlin/kotlin-web-helpers/blob/main/static/test.html)를 사용하여 브라우저 테스트 실행을 위한 테스트 번들을 생성합니다. `testsLocation` 프로퍼티에서 다른 위치를 지정하여 이를 대체할 수 있습니다.

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 기본 JS 테스트 번들을 수정하거나 대체하기 위해 customJsTestsLocation 구현
                @OptIn(DelicateKotlinGradlePluginApi::class)
                testsLocation = customJsTestsLocation(extendFrom = defaultTestsLocationProvider)

                chromium()
            }
        }
    }
}
```

커스텀 테스트 번들러에는 자체 개발 서버, 번들러 또는 테스트 러너를 포함할 수 있습니다. `defaultTestsLocationProvider` 프로퍼티를 통해 기본 위치에 접근할 수 있으므로, 모든 것을 처음부터 구현하는 대신 이를 기반으로 빌드할 수 있습니다.

각 테스트 위치는 `KotlinJsTestsLocation` 인터페이스를 통해 생성된 테스트 번들이 있는 디렉터리(`bundleLocation`), 테스트 페이지 이름(`testHtmlFileName`), 브라우저가 여는 URL(`url`)을 노출합니다.

이러한 API에 접근하여 다음 작업을 수행할 수 있습니다.

* 브라우저가 여는 URL 커스터마이즈. 각 브라우저 러너는 자체 테스트 위치를 가지므로, `test {}` 블록에서 모든 러너에 대해 재정의하거나 특정 러너에 대해서만 재정의할 수 있습니다.
* 번들 위치 자체를 재정의(예: 번들에 추가 파일 추가).
* 생성된 테스트 번들 후처리. 자체 태스크를 등록하고 브라우저가 파일을 열기 전에 해당 파일을 수정할 수 있습니다(예: `test.html`에 자체 구성 삽입).

이러한 API를 사용하여 플러그인을 빌드할 때는 다음 제한 사항을 염두에 두세요.

* `subtarget.test`를 구성하면 새로운 테스트 파이프라인이 활성화되고 Karma가 비활성화됩니다. 현재 사용자가 어떤 파이프라인을 선택했는지 감지할 수 있는 신뢰할 만한 방법이 없습니다.
* 특정 브라우저 러너를 지연(lazily) 구성할 수 있는 신뢰할 만한 방법이 없으므로 `afterEvaluate`에서 구성이 이루어져야 합니다. 사용자가 테스트 위치를 명시적으로 설정하도록 요청하거나 `myPluginChromium()`과 같은 데코레이팅 함수를 대신 노출하는 것을 고려해 보세요.

## 피드백 남기기 {id="leave-feedback"}

브라우저 테스트를 위한 새로운 DSL은 활발히 개발 중입니다. 디버깅과 같은 새로운 기능이 다음 Kotlin 릴리스에 계획되어 있습니다.

[YouTrack](https://youtrack.jetbrains.com/issue/KT-66897)이나 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) Slack 채널을 통해 피드백을 남겨주시면 감사하겠습니다.