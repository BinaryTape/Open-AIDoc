[//]: # (title: Kotlin/JS 프로젝트 설정하기)

Kotlin/JS 프로젝트는 빌드 시스템으로 Gradle을 사용합니다. 개발자가 Kotlin/JS 프로젝트를 쉽게 관리할 수 있도록, 일반적인 JavaScript 개발 루틴을 자동화하는 헬퍼 작업과 프로젝트 구성 도구를 함께 제공하는 `kotlin.multiplatform` Gradle 플러그인을 제공합니다.

이 플러그인은 [npm](https://www.npmjs.com/) 또는 [Yarn](https://yarnpkg.com/) 패키지 관리자를 사용하여 백그라운드에서 npm 종속성을 다운로드하고, [webpack](https://webpack.js.org/)을 사용하여 Kotlin 프로젝트에서 JavaScript 번들을 빌드합니다. 종속성 관리 및 구성 조정은 대부분 Gradle 빌드 파일에서 직접 수행할 수 있으며, 완벽한 제어를 위해 자동 생성된 구성을 재정의하는 옵션도 제공합니다.

`build.gradle(.kts)` 파일에서 다음과 같이 수동으로 `org.jetbrains.kotlin.multiplatform` 플러그인을 Gradle 프로젝트에 적용할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

Kotlin Multiplatform Gradle 플러그인을 사용하면 빌드 스크립트의 `kotlin {}` 블록에서 프로젝트의 다양한 측면을 관리할 수 있습니다.

```groovy
kotlin {
    // ...
}
```

`kotlin {}` 블록 내에서 다음과 같은 항목들을 구성할 수 있습니다.

* [대상 실행 환경](#execution-environments): 브라우저 또는 Node.js
* [ECMAScript 대상 설정](#set-an-ecmascript-target): ES5, ES2015, 또는 ES2020
* [출력 세분성 구성](#configure-output-granularity)
* [TypeScript 선언 파일 생성](#generation-of-typescript-declaration-files-d-ts)
* [프로젝트 종속성](#dependencies): Maven 및 npm
* [실행 구성](#run-task)
* [테스트 구성](#test-task)
* 브라우저 프로젝트를 위한 [번들링](#webpack-bundling) 및 [CSS 지원](#css)
* [대상 디렉터리](#distribution-target-directory) 및 [모듈 이름](#module-name)
* [프로젝트의 `package.json` 파일](#package-json-customization)

## 실행 환경 {id="execution-environments"}

Kotlin/JS 프로젝트는 두 가지 다른 실행 환경을 대상으로 할 수 있습니다.

* 브라우저에서의 클라이언트 측 스크립팅을 위한 Browser
* 서버 측 스크립팅 등 브라우저 외부에서 JavaScript 코드를 실행하기 위한 [Node.js](https://nodejs.org/)

Kotlin/JS 프로젝트의 대상 실행 환경을 정의하려면 `js {}` 블록 내에 `browser {}` 또는 `nodejs {}`를 추가합니다.

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

`binaries.executable()` 지시문은 Kotlin 컴파일러에 실행 가능한 `.js` 파일을 생성하도록 명시적으로 지시합니다.
`binaries.executable()`을 생략하면 컴파일러는 다른 프로젝트에서 사용할 수 있지만 단독으로 실행할 수는 없는 Kotlin 내부 라이브러리 파일만 생성합니다.

> 이는 일반적으로 실행 파일을 생성하는 것보다 빠르며, 프로젝트의 리프(leaf) 모듈이 아닌 중간 모듈을 다룰 때 유용한 최적화 방법이 될 수 있습니다.
>
{style="tip"}

Kotlin Multiplatform 플러그인은 선택한 환경에서 작동하도록 작업을 자동으로 구성합니다.
여기에는 애플리케이션 실행 및 테스트에 필요한 환경과 종속성을 다운로드하고 설치하는 작업이 포함됩니다.
덕분에 개발자는 추가 구성 없이도 간단한 프로젝트를 빌드, 실행 및 테스트할 수 있습니다. 이미 설치된 환경을 사용하는 옵션도 제공됩니다. [사전 설치된 Node.js 사용 방법](#use-pre-installed-node-js)을 참조하세요.

## ECMAScript 대상 설정 {id="set-an-ecmascript-target"}

Kotlin/JS는 ECMAScript 표준의 ES5, ES2015 및 ES2020 버전을 대상으로 JavaScript를 생성할 수 있습니다. 대상 환경에서 지원하는 최신 버전을 선택하세요.

* `es5`: 구형 JavaScript 환경과의 호환성을 제공하며 기본 타깃입니다.
* `es2015`: 다음과 같은 ES2015 기능을 지원합니다.
    * 코드베이스를 단순화하고 유지보수성을 향상시키는 모듈.
    * 객체 지향 프로그래밍(OOP) 원칙을 적용하여 더 깔끔하고 직관적인 코드를 작성할 수 있는 클래스.
    * 최종 번들 크기를 줄이고 디버깅을 돕는 [일시 중단 함수(suspend functions)](https://kotlinlang.org/docs/composing-suspending-functions.html) 컴파일용 제너레이터.
    * [JavaScript 코드 인라인화](js-interop.md#inline-javascript).
* `es2020`: 지원되는 모든 ES2015 기능을 포함하며, 생성된 JavaScript 코드에서 컴파일러가 ECMAScript 2020 기능을 사용할 수 있도록 합니다. 예를 들어, Kotlin의 `Long` 값을 JavaScript의 `BigInt` 값으로 컴파일합니다.

ECMAScript 대상을 구성하려면 `build.gradle(.kts)` 파일에서 `target` 프로퍼티를 설정합니다. 예를 들어, ES2020을 대상으로 설정하려면 다음과 같이 작성합니다.

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

[ES5](https://262.ecma-international.org/5.1/), [ES2015](https://262.ecma-international.org/6.0/), [ES2020](https://262.ecma-international.org/11.0/) 표준에 대해 자세히 알아보세요.

## 출력 세분성 구성 {id="configure-output-granularity"}

프로젝트에서 컴파일러가 `.js` 파일을 출력하는 방식을 선택할 수 있습니다.

* **모듈당 하나(One per module)**: 기본적으로 JS 컴파일러는 각 프로젝트 모듈에 대해 별도의 `.js` 파일을 컴파일 결과물로 출력합니다.
* **프로젝트당 하나(One per project)**: `gradle.properties` 파일에 다음 줄을 추가하여 전체 프로젝트를 단일 `.js` 파일로 컴파일할 수 있습니다.

  ```properties
  # 기본값: per-module
  kotlin.js.ir.output.granularity=whole-program
  ```

* **파일당 하나(One per file)**: 각 Kotlin 파일당 하나의 JavaScript 파일(내보낸 선언이 포함된 경우 2개)을 생성하는 더 세분화된 출력을 설정할 수 있습니다. 파일별 컴파일 모드를 활성화하려면 다음을 수행합니다.
  1. 프로젝트에서 ES2015 기능을 지원하도록 [컴파일 대상](#set-an-ecmascript-target)을 `es2015` 또는 `es2020`으로 설정합니다.
  2. `gradle.properties` 파일에 다음 줄을 추가합니다.
  
     ```properties
     # 기본값: per-module
     kotlin.js.ir.output.granularity=per-file
     ```

## TypeScript 선언 파일(`d.ts`) 생성 {id="generation-of-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 컴파일러는 Kotlin 코드로부터 TypeScript 정의를 생성할 수 있습니다. 이러한 정의는 하이브리드 애플리케이션을 작업할 때 JavaScript 도구 및 IDE에서 다음과 같은 목적으로 사용될 수 있습니다.

* 자동 완성 제공
* 정적 분석기 지원
* JavaScript 및 TypeScript 프로젝트에 Kotlin 코드 추가 간소화

TypeScript 정의를 생성하는 것은 [비즈니스 로직 공유 사용 사례](js-overview.md#use-cases-for-kotlin-js)에서 특히 유용합니다.

컴파일러는 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)로 표시된 최상위 선언을 수집하여 `.d.ts` 파일에 TypeScript 정의를 자동으로 생성합니다.

TypeScript 정의를 생성하려면 Gradle 빌드 파일에서 이를 명시적으로 구성해야 합니다.
[`js {}` 블록](js-project-setup.md#execution-environments) 내의 `build.gradle.kts` 파일에 `generateTypeScriptDefinitions()` 함수를 추가하세요.

```kotlin
kotlin {
    js {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

생성된 정의는 webpack이 적용되지 않은 해당 JavaScript 코드와 함께 `build/js/packages/<package_name>/kotlin` 디렉터리에서 확인할 수 있습니다.

## 종속성 {id="dependencies"}

종속성을 선언하려면 `build.gradle(.kts)` 파일의 `jsMain` 소스 세트 내에서 `dependencies {}` 블록을 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation("org.example.myproject:1.1.0")
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
        jsMain {
            dependencies {
                implementation 'org.example.myproject:1.1.0'
            }
        }
    }
}
```

</tab>
</tabs>

Kotlin/JS용 아티팩트를 포함하는 라이브러리만 종속성으로 사용할 수 있습니다. 종속성을 해결(resolve)하려면 `build.gradle(.kts)` 파일의 `repositories {}` 블록에 Gradle이 종속성을 검색해야 할 저장소를 선언합니다. 예를 들면 다음과 같습니다.

```kotlin
repositories {
    mavenCentral()
}
```

추가하려는 라이브러리에 [npm 패키지](#npm-dependencies)에 대한 종속성이 있는 경우, Gradle은 이러한 전이적 종속성도 자동으로 해결합니다.

### Kotlin 표준 라이브러리 {id="kotlin-standard-libraries"}

[표준 라이브러리](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)에 대한 종속성은 자동으로 추가됩니다. 표준 라이브러리의 버전은 Kotlin Multiplatform 플러그인의 버전과 동일합니다.

멀티플랫폼 테스트에는 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API를 사용할 수 있습니다. 멀티플랫폼 프로젝트를 생성할 때 `commonTest`에 단일 종속성을 사용하여 모든 소스 세트에 테스트 종속성을 추가할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 모든 플랫폼 종속성을 자동으로 가져옵니다
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
                implementation kotlin("test") // 모든 플랫폼 종속성을 자동으로 가져옵니다
            }
        }
    }
}
```

</tab>
</tabs>

### npm 종속성 {id="npm-dependencies"}

JavaScript 생태계에서 종속성을 관리하는 가장 일반적인 방법은 [npm](https://www.npmjs.com/)입니다.
npm은 가장 큰 JavaScript 모듈 퍼블릭 레포지토리를 제공합니다.

Kotlin Multiplatform Gradle 플러그인을 사용하면 다른 종속성을 선언하는 것과 동일하게 Gradle 빌드 스크립트에서 npm 종속성을 선언할 수 있습니다.

npm 종속성을 선언하려면 종속성 선언 내부의 `npm()` 함수에 패키지 이름과 버전을 전달합니다.
[npm의 유의적 버전(semver) 구문](https://docs.npmjs.com/about-semantic-versioning)을 기반으로 하나 이상의 버전 범위를 지정할 수도 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation(npm("core-js", "^3.38.1"))
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
        jsMain {
            dependencies {
                implementation npm('core-js', '^3.38.1')
            }
        }
    }
}
```

</tab>
</tabs>

기본적으로 플러그인은 npm 종속성을 다운로드하고 설치하기 위해 [Yarn](https://yarnpkg.com/lang/en/) 패키지 관리자의 자체 인스턴스를 사용합니다. 추가 구성 없이도 바로 작동하지만, [특정 필요에 맞게 조정](#yarn)할 수 있습니다.

Yarn 대신 [npm](https://www.npmjs.com/) 패키지 관리자를 직접 사용하여 npm 종속성을 다룰 수도 있습니다.
npm을 패키지 관리자로 사용하려면 `gradle.properties` 파일에 다음 프로퍼티를 설정하세요.

```none
kotlin.js.yarn=false
```

일반 종속성 외에도 Gradle DSL에서 사용할 수 있는 종속성 유형이 세 가지 더 있습니다.
각 종속성 유형을 언제 사용하는 것이 가장 좋은지 자세히 알아보려면 링크된 npm 공식 문서를 참조하세요.

* `devNpm(...)`을 통한 [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)
* `optionalNpm(...)`을 통한 [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)
* `peerNpm(...)`을 통한 [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)

npm 종속성이 설치되면 [Kotlin에서 JS 호출하기](js-interop.md)에 설명된 대로 코드에서 해당 API를 사용할 수 있습니다.

## run 작업 {id="run-task"}

Kotlin Multiplatform Gradle 플러그인은 추가 구성 없이 순수 Kotlin/JS 프로젝트를 실행할 수 있는 `jsBrowserDevelopmentRun` 작업을 제공합니다.

브라우저에서 Kotlin/JS 프로젝트를 실행할 때 이 작업은 `browserDevelopmentRun` 작업(Kotlin 멀티플랫폼 프로젝트에서도 사용 가능)의 별칭(alias)입니다. 이 작업은 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)를 사용하여 JavaScript 아티팩트를 제공합니다.
서버가 실행되는 포트 변경 등 `webpack-dev-server`에서 사용하는 구성을 커스터마이즈하려면 [webpack 구성 파일](#webpack-bundling)을 사용하세요.

Node.js를 대상으로 하는 Kotlin/JS 프로젝트를 실행하려면 `nodeRun` 작업의 별칭인 `jsNodeDevelopmentRun` 작업을 사용합니다.

프로젝트를 실행하려면 표준 수명 주기 작업인 `jsBrowserDevelopmentRun` 또는 이에 해당하는 별칭을 실행합니다.

```bash
./gradlew jsBrowserDevelopmentRun
```

소스 파일을 변경한 후 애플리케이션 빌드를 자동으로 다시 트리거하려면 Gradle의 [지속적 빌드(continuous build)](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build) 기능을 사용하세요.

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

또는 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

프로젝트 빌드가 성공하면 `webpack-dev-server`가 브라우저 페이지를 자동으로 새로 고칩니다.

## test 작업 {id="test-task"}

Kotlin Multiplatform Gradle 플러그인은 프로젝트를 위한 테스트 인프라를 자동으로 설정합니다. 필요한 테스트 러너 및 기타 종속성을 다운로드하고 설치합니다.

브라우저 프로젝트의 경우 [Karma](#karma) 테스트 러너와 새로운 [브라우저 테스트용 DSL](#dsl-for-browser-testing) 중에서 선택할 수 있습니다.
Node.js 프로젝트의 경우 [Mocha](#node-js) 테스트 프레임워크를 사용할 수 있습니다.

또한 플러그인은 다음과 같은 유용한 테스트 기능을 제공합니다.

* 소스 맵(Source map) 생성
* 테스트 리포트 생성
* 콘솔에서의 테스트 실행 결과 표시

### Karma {id="karma"}

> Karma 프로젝트는 [지원 중단(deprecated)](https://github.com/karma-runner/karma#karma)되었습니다. 새로운 기능 추가나 버그 수정은 예정되어 있지 않습니다. 브라우저 테스트를 위한 대안으로 새로운 [브라우저 테스트용 DSL](#dsl-for-browser-testing)을 사용해 보세요.
> 
{style="warning"}

[Karma](https://karma-runner.github.io/) 테스트 러너를 구성하려면 `build.gradle(.kts)` 파일의 브라우저 `testTask` 내에 `useKarma {}` 블록을 추가합니다. 예를 들어, 특정 브라우저를 대상으로 테스트를 실행하려면 다음과 같이 작성합니다.

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
        binaries.executable()
        // ...
    }
}
```

또는 `gradle.properties` 파일에 브라우저 테스트 대상을 추가할 수도 있습니다.

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

이를 통해 모든 모듈에 대한 브라우저 목록을 정의한 다음 특정 모듈의 빌드 파일에서 특정 브라우저를 추가할 수 있습니다.

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 `build/js/packages/projectName-test/karma.conf.js` 위치에 Karma 구성 파일을 자동으로 생성합니다. 이 파일에는 빌드 파일의 `useKarma {}` 블록에서 설정한 항목들이 포함됩니다.

프로젝트 루트의 `karma.config.d` 디렉터리 내에 추가 구성 파일을 배치할 수도 있습니다. 이 디렉터리의 모든 `.js` 구성 파일은 빌드 시점에 자동으로 감지되어 생성된 `karma.conf.js`에 병합됩니다.

Karma 구성에 대한 자세한 내용은 [Karma 문서](https://karma-runner.github.io/6.4/config/configuration-file.html)를 참조하세요.

### 브라우저 테스트용 DSL {id="dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>

Kotlin은 브라우저 환경에서 Kotlin/JS 테스트를 실행하기 위한 실험적 DSL을 제공합니다. 이는 특정 기술에 종속되지 않도록 설계되었습니다.
현재 구현은 내부적으로 다음과 같은 도구를 포함합니다.

* [Playwright](https://playwright.dev/): Chromium, Firefox, WebKit(Safari) 브라우저 엔진을 지원하는 브라우저 드라이버이자 배포 관리자 역할을 수행합니다.
* [Mocha](https://mochajs.org/): 테스트 러너 역할을 수행합니다.
* [webpack](https://webpack.js.org/): 번들러 역할을 수행합니다([향후 릴리스](https://youtrack.jetbrains.com/issue/KT-48308/)에서 [Vite](https://vite.dev/)로 대체될 예정).

새로운 브라우저 테스트용 DSL을 사용해 보려면 Kotlin/JS 대상의 `browser {}` 내에 opt-in `test {}` 블록을 추가하세요.

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
                // Gradle provider를 사용하여 headless 모드 구성
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // 커스텀 Chromium 러너 활성화 및 구성
                chromium("chromium-no-webgl2") {
                    // 이 러너에 대한 기본 타임아웃 재정의
                    timeout = 10.seconds

                    // Chromium 전용 추가 실행 인수
                    launchArgs.add("--disable-webgl2")
                }
                // Firefox 러너 활성화
                firefox()
                // WebKit (Safari) 테스트 러너 활성화
                webkit()
                // 커스텀 WebKit 러너 활성화 및 구성
                webkit("headful") {
                    headless = false
                }
            }
        }
    }
}
```

새로운 브라우저 테스트용 DSL 구성에 대한 자세한 내용은 [Kotlin/JS에서 테스트 실행하기](js-running-tests.md#advanced-configuration)를 참조하세요.

### Node.js {id="node-js-test-task"}

Node.js 프로젝트의 경우, Kotlin Multiplatform Gradle 플러그인이 [Mocha](https://mochajs.org/) 테스트 프레임워크를 자동으로 설정합니다.

Node.js 테스트 러너에서 사용할 환경 변수를 지정하려면(예: 테스트에 외부 정보를 전달하거나 패키지 확인을 미세 조정하기 위해) 빌드 파일의 `testTask {}` 블록 내에서 키-값 쌍과 함께 `environment()` 함수를 사용하세요.

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

### 테스트 실행 {id="run-tests"}

기본적으로 Kotlin Multiplatform Gradle 플러그인은 [헤드리스 크롬(Headless Chrome)](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)을 사용하여 브라우저 테스트를 실행합니다. 플러그인에 브라우저가 번들로 제공되지 않으므로, 테스트 러너마다 누락된 브라우저를 다르게 처리합니다.

* [Karma](#karma)의 경우, 플러그인이 테스트를 실행하는 데 사용할 수 있도록 다른 모든 브라우저가 머신에 미리 설치되어 있어야 합니다. 지속적 통합(CI) 서버에서 Kotlin/JS 테스트를 실행하는 경우 테스트하려는 브라우저가 해당 서버에도 설치되어 있는지 확인하세요.
* 새로운 [브라우저 테스트용 DSL](#dsl-for-browser-testing)의 경우, 플러그인이 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 명령을 사용하여 최초 실행 시 필요한 브라우저를 설치합니다. Playwright가 이러한 브라우저의 위치를 관리하며 로컬에 설치된 브라우저를 사용하지 않습니다.

테스트를 실행하려면 표준 수명 주기 작업인 `check`를 실행합니다.

```bash
./gradlew check
```

테스트를 건너뛰려면 빌드 파일의 `testTask {}` 블록에서 테스트를 비활성화합니다.

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled.set(false)
            }
        }
        binaries.executable()
        // ...
    }
}
```

## webpack 번들링 {id="webpack-bundling"}

브라우저 타깃의 경우, Kotlin Multiplatform Gradle 플러그인은 널리 알려진 [webpack](https://webpack.js.org/) 모듈 번들러를 사용합니다.

### webpack 작업 {id="webpack-task"}

가장 일반적인 webpack 조정은 Gradle 빌드 파일의 `kotlin.js.browser.webpackTask {}` 구성 블록을 통해 직접 수행할 수 있습니다.
* `mainOutputFileName`: webpack으로 출력되는 파일의 이름입니다. webpack 작업이 실행된 후 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>`에 생성됩니다. 기본값은 프로젝트 이름입니다.
* `output.libraryTarget`: webpack 출력물의 모듈 시스템입니다. [Kotlin/JS 프로젝트에서 사용 가능한 모듈 시스템](js-modules.md)에 대해 자세히 알아보세요. 기본값은 `umd`입니다.
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

또한 `commonWebpackConfig {}` 블록에서 번들링, 실행 및 테스트 작업에 사용할 공통 webpack 설정을 구성할 수 있습니다.

### webpack 구성 파일 {id="webpack-configuration-file"}

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 표준 webpack 구성 파일을 자동으로 생성합니다. 위치는 `build/js/packages/projectName/webpack.config.js`입니다.

webpack 구성을 추가로 조정하려면 프로젝트 루트의 `webpack.config.d`라는 디렉터리 내에 추가 구성 파일을 배치하세요. 프로젝트를 빌드할 때 모든 `.js` 구성 파일이 `build/js/packages/projectName/webpack.config.js` 파일에 자동으로 병합됩니다.
예를 들어 새 [webpack 로더](https://webpack.js.org/loaders/)를 추가하려면 `webpack.config.d` 디렉터리 내의 `.js` 파일에 다음을 추가합니다.

> 이 경우 구성 객체는 `config` 전역 객체입니다. 스크립트에서 이를 수정해야 합니다.
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

모든 webpack 구성 기능은 webpack [공식 문서](https://webpack.js.org/concepts/configuration/)에 자세히 설명되어 있습니다.

### 실행 파일 빌드 {id="building-executables"}

webpack을 통해 실행 가능한 JavaScript 아티팩트를 빌드하기 위해 Kotlin Multiplatform Gradle 플러그인은 `jsBrowserDevelopmentWebpack` 및 `jsBrowserProductionWebpack` Gradle 작업을 제공합니다.

* `jsBrowserDevelopmentWebpack`: 크기는 더 크지만 생성 시간이 짧은 개발용 아티팩트를 생성합니다. 따라서 활발히 개발 중일 때는 `jsBrowserDevelopmentWebpack` 작업을 사용하세요.
* `jsBrowserProductionWebpack`: 생성된 아티팩트에 데드 코드 제거(dead code elimination)를 적용하고 결과 JavaScript 파일을 압축(minify)합니다. 시간이 더 오래 걸리지만 크기가 더 작은 실행 파일을 생성합니다. 따라서 프로덕션 용도로 프로젝트를 준비할 때는 `jsBrowserProductionWebpack` 작업을 사용하세요.
 
이러한 작업 중 하나를 실행하여 개발용 또는 프로덕션용 아티팩트를 얻을 수 있습니다. [달리 지정](#distribution-target-directory)하지 않는 한 생성된 파일은 `build/kotlin-webpack`에 위치합니다.

```bash
./gradlew jsBrowserProductionWebpack
```

이러한 작업은 타깃이 실행 파일을 생성하도록 구성된 경우(`binaries.executable()`을 통해)에만 사용할 수 있습니다.

`build/dist/<targetName>/<binaryName>` 디렉터리에 배포본(distribution)을 생성하려면 대신 `jsBrowserDistribution` 작업을 실행하세요.

```bash
./gradlew jsBrowserDistribution
```

이 작업은 프로젝트 리소스가 포함된 바로 사용 가능한 배포본을 생성합니다.

## CSS {id="css"}

Kotlin Multiplatform Gradle 플러그인은 webpack의 [CSS](https://webpack.js.org/loaders/css-loader/) 및 [style](https://webpack.js.org/loaders/style-loader/) 로더도 지원합니다. 프로젝트 빌드에 사용되는 [webpack 구성 파일](#webpack-bundling)을 직접 수정하여 모든 옵션을 변경할 수 있지만, 가장 일반적으로 사용되는 설정은 `build.gradle(.kts)` 파일에서 직접 사용할 수 있습니다.

프로젝트에서 CSS 지원을 켜려면 Gradle 빌드 파일의 `commonWebpackConfig {}` 블록에서 `cssSupport.enabled` 옵션을 설정합니다. 이 구성은 마법사를 사용하여 새 프로젝트를 생성할 때도 기본적으로 활성화되어 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    commonWebpackConfig {
        cssSupport {
            enabled.set(true)
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    commonWebpackConfig {
        cssSupport {
            it.enabled = true
        }
    }
}
```

</tab>
</tabs>

또는 `webpackTask {}`, `runTask {}`, `testTask {}`에 대해 독립적으로 CSS 지원을 추가할 수도 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    webpackTask {
        cssSupport {
            enabled.set(true)
        }
    }
    runTask {
        cssSupport {
            enabled.set(true)
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                enabled.set(true)
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    webpackTask {
        cssSupport {
            it.enabled = true
        }
    }
    runTask {
        cssSupport {
            it.enabled = true
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                it.enabled = true
            }
        }
    }
}
```

</tab>
</tabs>

프로젝트에서 CSS 지원을 활성화하면 구성되지 않은 프로젝트에서 스타일시트를 사용하려고 할 때 발생하는 일반적인 오류(예: `Module parse failed: Unexpected character '@' (14:0)`)를 방지하는 데 도움이 됩니다.

`cssSupport.mode`를 사용하여 발견된 CSS를 처리하는 방법을 지정할 수 있습니다. 사용 가능한 값은 다음과 같습니다.

* `"inline"`(기본값): 스타일이 전역 `<style>` 태그에 추가됩니다.
* `"extract"`: 스타일이 별도의 파일로 추출됩니다. 그런 다음 HTML 페이지에서 이를 포함할 수 있습니다.
* `"import"`: 스타일이 문자열로 처리됩니다. 코드에서 CSS에 접근해야 하는 경우(예: `val styles = require("main.css")`) 유용할 수 있습니다.

동일한 프로젝트에서 서로 다른 모드를 사용하려면 `cssSupport.rules`를 사용합니다. 여기에서 모드뿐만 아니라 [include](https://webpack.js.org/configuration/module/#ruleinclude) 및 [exclude](https://webpack.js.org/configuration/module/#ruleexclude) 패턴을 정의하는 `KotlinWebpackCssRules` 목록을 지정할 수 있습니다.

## Node.js {id="node-js"}

Node.js를 대상으로 하는 Kotlin/JS 프로젝트의 경우 플러그인이 호스트에 Node.js 환경을 자동으로 다운로드하고 설치합니다. 이미 보유하고 있는 기존 Node.js 인스턴스를 사용할 수도 있습니다.

각 하위 프로젝트에 대해 Node.js 설정을 구성하거나 프로젝트 전체에 대해 일괄 설정할 수 있습니다.

### Node.js 버전 변경 {id="change-node-js-version"}

현재 기본 Node.js 버전은 24.16.0이지만, 특정 하위 프로젝트에 대해 다른 버전을 사용할 수 있습니다.
하위 프로젝트의 `build.gradle(.kts)` 파일에 다음 줄을 추가하세요. 예를 들면 다음과 같습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
}
```

</tab>
</tabs>

모든 하위 프로젝트를 포함하여 전체 프로젝트의 버전을 설정하려면 `allprojects {}` 블록에 동일한 코드를 적용합니다. 예를 들면 다음과 같습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allprojects {
    project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
        project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
    }
}
```

</tab>
</tabs>

### 사전 설치된 Node.js 사용 {id="use-pre-installed-node-js"}

Kotlin/JS 프로젝트를 빌드하는 호스트에 이미 Node.js가 설치되어 있는 경우, Kotlin Multiplatform Gradle 플러그인이 자체 Node.js 인스턴스를 설치하는 대신 기존 인스턴스를 사용하도록 구성할 수 있습니다.

사전 설치된 Node.js 인스턴스를 사용하려면 `build.gradle(.kts)` 파일에 다음 줄을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // 기본 동작으로 되돌리려면 `true`로 설정하세요
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // 기본 동작으로 되돌리려면 `true`로 설정하세요
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn {id="yarn"}

기본적으로 플러그인은 빌드 시 선언된 종속성을 다운로드하고 설치하기 위해 [Yarn](https://yarnpkg.com/lang/en/) 패키지 관리자의 자체 인스턴스를 관리합니다. 추가 구성 없이도 바로 작동하지만, 이를 조정하거나 호스트에 이미 설치된 Yarn을 사용할 수 있습니다.

### 추가 Yarn 기능: .yarnrc {id="additional-yarn-features-yarnrc"}

추가 Yarn 기능을 구성하려면 프로젝트 루트에 `.yarnrc` 파일을 배치하세요.
빌드 시 자동으로 감지됩니다.

예를 들어 npm 패키지에 커스텀 레지스트리를 사용하려면 프로젝트 루트의 `.yarnrc` 파일에 다음 줄을 추가합니다.

```text
registry "http://my.registry/api/npm/"
```

`.yarnrc`에 대한 자세한 내용은 [Yarn 공식 문서](https://classic.yarnpkg.com/en/docs/yarnrc/)를 참조하세요.

### 사전 설치된 Yarn 사용 {id="use-pre-installed-yarn"}

Kotlin/JS 프로젝트를 빌드하는 호스트에 이미 Yarn이 설치되어 있는 경우, Kotlin Multiplatform Gradle 플러그인이 자체 Yarn 인스턴스를 설치하는 대신 해당 인스턴스를 사용하도록 구성할 수 있습니다.

사전 설치된 Yarn 인스턴스를 사용하려면 `build.gradle(.kts)`에 다음 줄을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // 기본 동작은 "true"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec).download = false
}
 
```

</tab>
</tabs>

### kotlin-js-store를 통한 버전 고정(Version locking) {id="version-locking-via-kotlin-js-store"}

프로젝트 루트의 `kotlin-js-store` 디렉터리는 버전 고정에 필요한 `yarn.lock` 파일을 보관하기 위해 Kotlin Multiplatform Gradle 플러그인에 의해 자동으로 생성됩니다. 이 락 파일은 전적으로 Yarn 플러그인에 의해 관리되며 `kotlinNpmInstall` Gradle 작업이 실행되는 동안 업데이트됩니다.

[권장 방식](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)에 따라 `kotlin-js-store`와 그 내용을 버전 제어 시스템(VCS)에 커밋하세요. 이렇게 하면 모든 머신에서 애플리케이션이 정확히 동일한 종속성 트리로 빌드되도록 보장할 수 있습니다.

필요한 경우 `build.gradle(.kts)`에서 디렉터리와 락 파일 이름을 모두 변경할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
```

</tab>
</tabs>

> 락 파일의 이름을 변경하면 종속성 검사 도구가 파일을 더 이상 인식하지 못할 수 있습니다.
> 
{style="warning"}

`yarn.lock`에 대한 자세한 내용은 [Yarn 공식 문서](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)를 참조하세요.

### yarn.lock 업데이트 알림 보고 {id="reporting-that-yarn-lock-has-been-updated"}

Kotlin/JS는 `yarn.lock` 파일이 업데이트되었을 때 이를 알려주는 Gradle 설정을 제공합니다. CI 빌드 프로세스 중에 `yarn.lock`이 모르게 변경된 경우 알림을 받으려면 다음 설정들을 사용할 수 있습니다.

* `YarnLockMismatchReport`: `yarn.lock` 파일에 대한 변경 사항이 보고되는 방식을 지정합니다. 다음 값 중 하나를 사용할 수 있습니다.
    * `FAIL`: 해당 Gradle 작업을 실패 처리합니다. 기본값입니다.
    * `WARNING`: 변경 사항에 대한 정보를 경고 로그에 기록합니다.
    * `NONE`: 보고를 비활성화합니다.
* `reportNewYarnLock`: 최근 생성된 `yarn.lock` 파일에 대해 명시적으로 보고합니다. 기본적으로 이 옵션은 비활성화되어 있습니다. 처음 시작할 때 새 `yarn.lock` 파일을 생성하는 것이 일반적이기 때문입니다. 이 옵션을 사용하여 파일이 저장소에 커밋되었는지 확인할 수 있습니다.
* `yarnLockAutoReplace`: Gradle 작업이 실행될 때마다 `yarn.lock`을 자동으로 교체합니다.

이러한 옵션을 사용하려면 `build.gradle(.kts)`를 다음과 같이 업데이트하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<YarnRootExtension>().yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.the<YarnRootExtension>().reportNewYarnLock = false // true
    rootProject.the<YarnRootExtension>().yarnLockAutoReplace = false // true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).reportNewYarnLock = false // true
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockAutoReplace = false // true
}
```

</tab>
</tabs>

### 기본적으로 --ignore-scripts를 사용하여 npm 종속성 설치 {id="installing-npm-dependencies-with-ignore-scripts-by-default"}

보안이 침해된 npm 패키지에서 악성 코드가 실행될 가능성을 줄이기 위해, Kotlin Multiplatform Gradle 플러그인은 기본적으로 npm 종속성을 설치하는 동안 [수명 주기 스크립트(lifecycle scripts)](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)의 실행을 차단합니다.

`build.gradle(.kts)`에 다음 줄을 추가하여 수명 주기 스크립트 실행을 명시적으로 활성화할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> { 
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
```

</tab>
</tabs>

## 배포 대상 디렉터리 {id="distribution-target-directory"}

기본적으로 Kotlin/JS 프로젝트 빌드 결과물은 프로젝트 루트 내의 `/build/dist/<targetName>/<binaryName>` 디렉터리에 위치합니다.

프로젝트 배포 파일의 위치를 다른 곳으로 지정하려면 빌드 스크립트의 `browser {}` 블록 내에 `distribution {}` 블록을 추가하고 `set()` 메서드를 사용하여 `outputDirectory` 프로퍼티에 값을 할당합니다.
프로젝트 빌드 작업을 실행하면 Gradle이 프로젝트 리소스와 함께 출력 번들을 이 위치에 저장합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    js {
        browser {
            distribution {
                outputDirectory.set(projectDir.resolve("output"))
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    js {
        browser {
            distribution {
                outputDirectory = file("$projectDir/output")
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
</tabs>

## 모듈 이름 {id="module-name"}

해당 `.js` 및 `.d.ts` 파일을 포함하여 JavaScript _모듈_(`build/js/packages/myModuleName`에 생성됨)의 이름을 조정하려면 `outputModuleName` 옵션을 사용합니다.

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

이 설정은 `build/dist`에 있는 webpack 출력물에는 영향을 주지 않습니다.

## package.json 커스터마이즈 {id="package-json-customization"}

`package.json` 파일은 JavaScript 패키지의 메타데이터를 담고 있습니다. npm과 같은 널리 사용되는 패키지 레지스트리는 게시되는 모든 패키지에 이 파일이 포함되어 있을 것을 요구하며, 이를 통해 패키지 배포를 추적하고 관리합니다.

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 Kotlin/JS 프로젝트를 위한 `package.json`을 자동으로 생성합니다. 기본적으로 이 파일에는 이름, 버전, 라이선스, 종속성 및 기타 일부 패키지 속성과 같은 필수 데이터가 포함됩니다.

기본 패키지 속성 외에도 `package.json`은 실행 가능한 스크립트 식별 등 JavaScript 프로젝트가 동작하는 방식을 정의할 수 있습니다.

Gradle DSL을 통해 프로젝트의 `package.json`에 커스텀 항목을 추가할 수 있습니다. `package.json`에 커스텀 필드를 추가하려면 컴파일의 `packageJson` 블록에서 `customField()` 함수를 사용하세요.

```kotlin
kotlin {
    js {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

프로젝트를 빌드하면 이 코드는 `package.json` 파일에 다음 블록을 추가합니다.

```json
"hello": {
    "one": 1,
    "two": 2
}
```

npm 레지스트리용 `package.json` 파일 작성에 대한 자세한 내용은 [npm 문서](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)를 참조하세요.