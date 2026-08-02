[//]: # (title: Kotlin/JS 프로젝트 설정하기)

Kotlin/JS 프로젝트는 빌드 시스템으로 Gradle을 사용합니다. 개발자가 Kotlin/JS 프로젝트를 쉽게 관리할 수 있도록, 프로젝트 구성 도구와 JavaScript 개발에서 일반적으로 반복되는 작업들을 자동화하는 헬퍼 태스크를 제공하는 `kotlin.multiplatform` Gradle 플러그인을 제공합니다.

이 플러그인은 [npm](https://www.npmjs.com/) 또는 [Yarn](https://yarnpkg.com/) 패키지 관리자를 사용하여 백그라운드에서 npm 의존성을 다운로드하고, [webpack](https://webpack.js.org/)을 사용하여 Kotlin 프로젝트에서 JavaScript 번들을 빌드합니다. 의존성 관리 및 구성 조정의 상당 부분은 Gradle 빌드 파일에서 직접 수행할 수 있으며, 완전한 제어를 위해 자동 생성된 구성을 재정의(override)하는 옵션도 제공합니다.

`org.jetbrains.kotlin.multiplatform` 플러그인을 `build.gradle(.kts)` 파일에서 수동으로 Gradle 프로젝트에 적용할 수 있습니다:

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

Kotlin Multiplatform Gradle 플러그인을 사용하면 빌드 스크립트의 `kotlin {}` 블록에서 프로젝트의 다양한 측면을 관리할 수 있습니다:

```groovy
kotlin {
    // ...
}
```

`kotlin {}` 블록 내에서 다음 사항들을 관리할 수 있습니다:

* [타겟 실행 환경](#execution-environments): 브라우저(browser) 또는 Node.js 
* [ES2015 기능 지원](#support-for-es2015-features): 클래스, 모듈, 제너레이터(generator)
* [출력 세분화 구성](#configure-output-granularity)
* [TypeScript 선언 파일 생성](#generation-of-typescript-declaration-files-d-ts)
* [프로젝트 의존성](#dependencies): Maven 및 npm
* [실행 구성](#run-task)
* [테스트 구성](#test-task)
* 브라우저 프로젝트를 위한 [번들링](#webpack-bundling) 및 [CSS 지원](#css)
* [타겟 디렉토리](#distribution-target-directory) 및 [모듈 이름](#module-name)
* [프로젝트의 `package.json` 파일](#package-json-customization)

## 실행 환경

Kotlin/JS 프로젝트는 두 가지 다른 실행 환경을 타겟으로 할 수 있습니다: 

* 브라우저에서의 클라이언트 측 스크립팅을 위한 **브라우저(Browser)**
* 브라우저 외부에서 JavaScript 코드를 실행하기 위한(예: 서버 측 스크립팅) [Node.js](https://nodejs.org/)

Kotlin/JS 프로젝트의 타겟 실행 환경을 정의하려면, `js {}` 블록 내부에 `browser {}` 또는 `nodejs {}`를 추가하세요:

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

`binaries.executable()` 지시문은 Kotlin 컴파일러에게 실행 가능한 `.js` 파일을 생성하도록 명시적으로 지시합니다. `binaries.executable()`을 생략하면 컴파일러는 다른 프로젝트에서 사용할 수는 있지만 단독으로 실행할 수는 없는 Kotlin 내부 라이브러리 파일만 생성합니다.

> 이는 실행 파일을 만드는 것보다 보통 더 빠르며, 프로젝트의 리프 모듈(non-leaf modules)이 아닌 모듈을 다룰 때 유효한 최적화 방법이 될 수 있습니다.
>
{style="tip"}

Kotlin Multiplatform 플러그인은 선택한 환경에 맞춰 작업 태스크를 자동으로 구성합니다. 여기에는 애플리케이션 실행 및 테스트를 위해 필요한 환경과 의존성을 다운로드하고 설치하는 과정이 포함됩니다. 이를 통해 개발자는 추가 설정 없이 간단한 프로젝트를 빌드하고 실행하며 테스트할 수 있습니다. 기존에 설치된 환경을 사용하는 옵션도 있습니다. [사전 설치된 Node.js 사용하기](#use-pre-installed-node-js) 방법을 알아보세요.

## ES2015 기능 지원

Kotlin은 다음과 같은 ES2015 기능에 대한 지원을 제공합니다:

* 코드베이스를 단순화하고 유지보수성을 향상시키는 모듈.
* OOP 원칙을 통합하여 더 깨끗하고 직관적인 코드를 작성할 수 있게 해주는 클래스.
* [중단 함수(suspend functions)](https://kotlinlang.org/docs/composing-suspending-functions.html) 컴파일을 위한 제너레이터(Generator). 이는 최종 번들 크기를 개선하고 디버깅을 돕습니다.
* [JavaScript 코드 인라이닝(inlining)](js-interop.md#inline-javascript).

`build.gradle(.kts)` 파일에 `es2015` 컴파일 타겟을 추가하여 지원되는 모든 ES2015 기능을 한 번에 활성화할 수 있습니다:

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2015"
    }
}
```

[공식 문서에서 ES2015(ECMAScript 2015, ES6)에 대해 더 자세히 알아보세요](https://262.ecma-international.org/6.0/).

## 출력 세분화 구성

컴파일러가 프로젝트에서 `.js` 파일을 출력하는 방식을 선택할 수 있습니다:

* **모듈당 하나(One per module)**. 기본적으로 JS 컴파일러는 컴파일 결과로 각 프로젝트 모듈에 대해 별도의 `.js` 파일을 출력합니다.
* **프로젝트당 하나(One per project)**. `gradle.properties` 파일에 다음 라인을 추가하여 전체 프로젝트를 단일 `.js` 파일로 컴파일할 수 있습니다:

  ```none
  kotlin.js.ir.output.granularity=whole-program // 'per-module'이 기본값입니다.
  ```

* **파일당 하나(One per file)**. 각 Kotlin 파일당 하나의 JavaScript 파일(파일에 내보낸 선언이 포함된 경우 두 개)을 생성하는 더 세분화된 출력을 설정할 수 있습니다. 파일별 컴파일 모드를 활성화하려면:
  1. 프로젝트에서 ES2015 기능을 지원하도록 `es2015`를 [컴파일 타겟](#support-for-es2015-features)으로 설정합니다.
  2. `gradle.properties` 파일에 다음 라인을 추가합니다:
     ```none
     kotlin.js.ir.output.granularity=per-file // 'per-module'이 기본값입니다.
     ```

## TypeScript 선언 파일(`d.ts`) 생성
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 컴파일러는 Kotlin 코드에서 TypeScript 정의를 생성할 수 있습니다. 이 정의는 하이브리드 애플리케이션을 작업할 때 JavaScript 도구 및 IDE에서 다음 용도로 사용될 수 있습니다:

* 자동 완성 제공
* 정적 분석 도구 지원
* JavaScript 및 TypeScript 프로젝트에 Kotlin 코드를 추가하는 과정 단순화

TypeScript 정의를 생성하는 것은 특히 [비즈니스 로직 공유 사례](js-overview.md#use-cases-for-kotlin-js)에서 매우 가치가 있습니다.

컴파일러는 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)로 표시된 모든 최상위 선언을 수집하여 `.d.ts` 파일에 TypeScript 정의를 자동으로 생성합니다.

TypeScript 정의를 생성하려면 Gradle 빌드 파일에서 명시적으로 구성해야 합니다. `build.gradle.kts` 파일의 [`js {}` 블록](js-project-setup.md#execution-environments) 내에 `generateTypeScriptDefinitions()` 함수를 추가하세요:

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

생성된 정의는 `build/js/packages/<package_name>/kotlin` 디렉토리에서 해당 webpack 처리 전 JavaScript 코드와 함께 찾을 수 있습니다.

## 의존성

의존성을 선언하려면 `build.gradle(.kts)` 파일의 `jsMain` 소스 세트 내에 `dependencies {}` 블록을 사용하세요:

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

Kotlin/JS용 아티팩트를 포함하는 라이브러리만 의존성으로 사용할 수 있습니다. 의존성을 해결하려면 `build.gradle(.kts)` 파일의 `repositories {}` 블록에 Gradle이 의존성을 찾을 저장소를 선언하세요. 예:

```kotlin
repositories {
    mavenCentral()
}
```

추가하려는 라이브러리에 [npm 패키지](#npm-dependencies)에 대한 의존성이 있는 경우, Gradle은 이러한 전이 의존성(transitive dependencies)도 자동으로 해결합니다.

### Kotlin 표준 라이브러리

[표준 라이브러리(standard library)](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)에 대한 의존성은 자동으로 추가됩니다. 표준 라이브러리의 버전은 Kotlin Multiplatform 플러그인의 버전과 동일합니다.

멀티플랫폼 테스트를 위해 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API를 사용할 수 있습니다. 멀티플랫폼 프로젝트를 생성할 때 `commonTest`에서 단일 의존성을 사용하여 모든 소스 세트에 테스트 의존성을 추가할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 모든 플랫폼 의존성을 자동으로 가져옵니다.
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
                implementation kotlin("test") // 모든 플랫폼 의존성을 자동으로 가져옵니다.
            }
        }
    }
}
```

</tab>
</tabs>

### npm 의존성

JavaScript 세계에서 의존성을 관리하는 가장 일반적인 방법은 [npm](https://www.npmjs.com/)입니다. npm은 가장 큰 JavaScript 모듈 공용 저장소를 제공합니다.

Kotlin Multiplatform Gradle 플러그인을 사용하면 다른 의존성을 선언하는 것과 마찬가지로 Gradle 빌드 스크립트에서 npm 의존성을 선언할 수 있습니다.

npm 의존성을 선언하려면 의존성 선언 내의 `npm()` 함수에 이름과 버전을 전달하세요. [npm의 semver 구문](https://docs.npmjs.com/about-semantic-versioning)에 따라 하나 또는 여러 버전 범위를 지정할 수도 있습니다.

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

기본적으로 플러그인은 별도의 [Yarn](https://yarnpkg.com/lang/en/) 패키지 관리자 인스턴스를 사용하여 npm 의존성을 다운로드하고 설치합니다. 추가 설정 없이 바로 작동하지만, [특정 필요에 맞게 조정](#yarn)할 수 있습니다.

대신 [npm](https://www.npmjs.com/) 패키지 관리자를 직접 사용하여 npm 의존성을 처리할 수도 있습니다. npm을 패키지 관리자로 사용하려면 `gradle.properties` 파일에 다음 속성을 설정하세요:

```none
kotlin.js.yarn=false
```

일반 의존성 외에도 Gradle DSL에서 사용할 수 있는 세 가지 유형의 의존성이 더 있습니다. 각 유형의 의존성을 언제 사용하는 것이 가장 좋은지 알아보려면 npm에서 링크된 공식 문서를 확인하세요:

* [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies): `devNpm(...)`을 통해 사용
* [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies): `optionalNpm(...)`을 통해 사용
* [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies): `peerNpm(...)`을 통해 사용

npm 의존성이 설치되면, [Kotlin에서 JS 호출하기(Calling JS from Kotlin)](js-interop.md)에 설명된 대로 코드에서 해당 API를 사용할 수 있습니다.

## run 태스크

Kotlin Multiplatform Gradle 플러그인은 추가 설정 없이 순수 Kotlin/JS 프로젝트를 실행할 수 있는 `jsBrowserDevelopmentRun` 태스크를 제공합니다.

브라우저에서 Kotlin/JS 프로젝트를 실행하는 경우, 이 태스크는 `browserDevelopmentRun` 태스크(Kotlin 멀티플랫폼 프로젝트에서도 사용 가능)의 별칭(alias)입니다. 이 태스크는 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)를 사용하여 JavaScript 아티팩트를 제공합니다. 만약 `webpack-dev-server`에서 사용하는 구성을 사용자 정의하고 싶다면(예: 서버가 실행되는 포트 조정), [webpack 구성 파일](#webpack-bundling)을 사용하세요.

Node.js를 타겟으로 하는 Kotlin/JS 프로젝트를 실행하려면, `nodeRun` 태스크의 별칭인 `jsNodeDevelopmentRun` 태스크를 사용하세요.

프로젝트를 실행하려면 표준 수명 주기 태스크인 `jsBrowserDevelopmentRun` 또는 이에 해당하는 별칭을 실행하세요:

```bash
./gradlew jsBrowserDevelopmentRun
```

소스 파일을 수정한 후 자동으로 애플리케이션 다시 빌드를 트리거하려면 Gradle의 [연속 빌드(continuous build)](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build) 기능을 사용하세요:

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

또는 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

프로젝트 빌드가 성공하면 `webpack-dev-server`가 브라우저 페이지를 자동으로 새로고침합니다.

## test 태스크

Kotlin Multiplatform Gradle 플러그인은 프로젝트를 위한 테스트 인프라를 자동으로 설정합니다. 브라우저 프로젝트의 경우 [Karma](https://karma-runner.github.io/) 테스트 러너와 기타 필요한 의존성을 다운로드하고 설치하며, Node.js 프로젝트의 경우 [Mocha](https://mochajs.org/) 테스트 프레임워크가 사용됩니다.

플러그인은 다음과 같은 유용한 테스트 기능도 제공합니다:

* 소스 맵(Source maps) 생성
* 테스트 보고서 생성
* 콘솔에 테스트 실행 결과 표시

브라우저 테스트 실행을 위해 플러그인은 기본적으로 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)을 사용합니다. 빌드 스크립트의 `useKarma {}` 블록 내에 해당 항목을 추가하여 테스트를 실행할 다른 브라우저를 선택할 수도 있습니다:

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

또는 `gradle.properties` 파일에 브라우저 테스트 타겟을 추가할 수 있습니다:

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

이 방식을 사용하면 모든 모듈에 대해 브라우저 목록을 정의한 다음, 특정 모듈의 빌드 스크립트에서 특정 브라우저를 추가할 수 있습니다.

Kotlin Multiplatform Gradle 플러그인이 이러한 브라우저를 자동으로 설치해주지는 않으며, 실행 환경에서 사용 가능한 브라우저만 사용한다는 점에 유의하세요. 예를 들어 지속적 통합(CI) 서버에서 Kotlin/JS 테스트를 실행하는 경우, 테스트하려는 브라우저가 설치되어 있는지 확인해야 합니다.

테스트를 건너뛰려면 `testTask {}`에 `enabled = false` 라인을 추가하세요:

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled = false
            }
        }
        binaries.executable()
        // ...
    }
}
```

테스트를 실행하려면 표준 수명 주기 태스크인 `check`를 실행하세요:

```bash
./gradlew check
```

Node.js 테스트 러너에서 사용되는 환경 변수를 지정하려면(예: 테스트에 외부 정보를 전달하거나 패키지 확인을 미세 조정하기 위해), 빌드 스크립트의 `testTask {}` 블록 내에서 `environment()` 함수를 키-값 쌍과 함께 사용하세요:

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

### Karma 구성

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 `build.gradle(.kts)`의 [`kotlin.js.browser.testTask.useKarma {}` 블록](#test-task) 설정을 포함하는 Karma 구성 파일을 자동으로 생성합니다. 이 파일은 `build/js/packages/projectName-test/karma.conf.js`에서 찾을 수 있습니다.
Karma에서 사용하는 구성을 조정하려면, 프로젝트 루트에 `karma.config.d`라는 디렉토리를 만들고 그 안에 추가 구성 파일을 배치하세요. 이 디렉토리에 있는 모든 `.js` 구성 파일은 빌드 시점에 자동으로 감지되어 생성된 `karma.conf.js`에 병합됩니다.

모든 Karma 구성 기능은 Karma의 [문서](https://karma-runner.github.io/5.0/config/configuration-file.html)에 잘 설명되어 있습니다.

## webpack 번들링

브라우저 타겟의 경우, Kotlin Multiplatform Gradle 플러그인은 널리 알려진 [webpack](https://webpack.js.org/) 모듈 번들러를 사용합니다.

### webpack 태스크

가장 일반적인 webpack 조정은 Gradle 빌드 파일의 `kotlin.js.browser.webpackTask {}` 구성 블록을 통해 직접 수행할 수 있습니다:
* `mainOutputFileName` - webpack 출력 파일의 이름입니다. webpack 태스크 실행 후 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>`에 생성됩니다. 기본값은 프로젝트 이름입니다.
* `output.libraryTarget` - webpack 출력의 모듈 시스템입니다. [Kotlin/JS 프로젝트에서 사용 가능한 모듈 시스템](js-modules.md)에 대해 더 자세히 알아보세요. 기본값은 `umd`입니다.
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

번들링, 실행 및 테스트 태스크에서 공통으로 사용할 webpack 설정은 `commonWebpackConfig {}` 블록에서 구성할 수 있습니다.

### webpack 구성 파일 

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 표준 webpack 구성 파일을 자동으로 생성합니다. 이 파일은 `build/js/packages/projectName/webpack.config.js`에 위치합니다.

webpack 구성을 더 세부적으로 조정하려면, 프로젝트 루트에 `webpack.config.d`라는 디렉토리를 만들고 그 안에 추가 구성 파일을 배치하세요. 프로젝트를 빌드할 때 모든 `.js` 구성 파일이 `build/js/packages/projectName/webpack.config.js` 파일에 자동으로 병합됩니다.
예를 들어, 새로운 [webpack 로더(loader)](https://webpack.js.org/loaders/)를 추가하려면 `webpack.config.d` 디렉토리 내의 `.js` 파일에 다음 내용을 추가하세요:

> 이 경우 구성 객체는 `config` 전역 객체입니다. 스크립트에서 이를 수정해야 합니다.
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

모든 webpack 구성 기능은 webpack [문서](https://webpack.js.org/concepts/configuration/)에 잘 설명되어 있습니다.

### 실행 파일 빌드

webpack을 통해 실행 가능한 JavaScript 아티팩트를 빌드하기 위해 Kotlin Multiplatform Gradle 플러그인은 `jsBrowserDevelopmentWebpack` 및 `jsBrowserProductionWebpack` Gradle 태스크를 포함하고 있습니다.

* `jsBrowserDevelopmentWebpack`은 크기는 크지만 생성 시간이 짧은 개발용 아티팩트를 생성합니다. 따라서 활발한 개발 중에는 `jsBrowserDevelopmentWebpack` 태스크를 사용하세요.
* `jsBrowserProductionWebpack`은 생성된 아티팩트에 데드 코드 제거(dead code elimination)를 적용하고 결과 JavaScript 파일을 축소(minify)합니다. 시간이 더 걸리지만 크기가 작은 실행 파일을 생성합니다. 따라서 프로젝트를 운영 환경에 사용할 준비가 되었을 때 `jsBrowserProductionWebpack` 태스크를 사용하세요.
 
 이 중 하나를 실행하여 개발 또는 운영 환경에 맞는 각각의 아티팩트를 얻을 수 있습니다. [별도로 지정](#distribution-target-directory)하지 않는 한 생성된 파일은 `build/kotlin-webpack`에서 확인할 수 있습니다.

```bash
./gradlew jsBrowserProductionWebpack
```

이러한 태스크는 타겟이 실행 파일을 생성하도록 구성된 경우(`binaries.executable()`을 통해)에만 사용할 수 있습니다.

배포물을 `build/dist/<targetName>/<binaryName>` 디렉토리에 생성하려면 대신 `jsBrowserDistribution` 태스크를 실행하세요:

```bash
./gradlew jsBrowserDistribution
```

이 태스크는 프로젝트 리소스를 포함하여 바로 사용할 수 있는 배포물을 생성합니다.

## CSS

Kotlin Multiplatform Gradle 플러그인은 webpack의 [CSS](https://webpack.js.org/loaders/css-loader/) 및 [style](https://webpack.js.org/loaders/style-loader/) 로더에 대한 지원도 제공합니다. 프로젝트를 빌드하는 데 사용되는 [webpack 구성 파일](#webpack-bundling)을 직접 수정하여 모든 옵션을 변경할 수 있지만, 가장 자주 사용되는 설정은 `build.gradle(.kts)` 파일에서 직접 사용할 수 있습니다.

프로젝트에서 CSS 지원을 켜려면 Gradle 빌드 파일의 `commonWebpackConfig {}` 블록에서 `cssSupport.enabled` 옵션을 설정하세요. 마법사를 사용하여 새 프로젝트를 생성할 때도 이 구성이 기본적으로 활성화됩니다.

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

또는 `webpackTask {}`, `runTask {}`, `testTask {}`에 대해 독립적으로 CSS 지원을 추가할 수 있습니다:

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

프로젝트에서 CSS 지원을 활성화하면 구성되지 않은 프로젝트에서 스타일 시트를 사용하려고 할 때 발생하는 `Module parse failed: Unexpected character '@' (14:0)`와 같은 일반적인 오류를 방지하는 데 도움이 됩니다.

`cssSupport.mode`를 사용하여 발견된 CSS를 처리하는 방법을 지정할 수 있습니다. 다음 값들을 사용할 수 있습니다:

* `"inline"` (기본값): 스타일이 전역 `<style>` 태그에 추가됩니다.
* `"extract"`: 스타일이 별도의 파일로 추출됩니다. 그런 다음 HTML 페이지에서 이를 포함할 수 있습니다.
* `"import"`: 스타일이 문자열로 처리됩니다. 코드에서 CSS에 접근해야 하는 경우(예: `val styles = require("main.css")`) 유용할 수 있습니다.

동일한 프로젝트에서 서로 다른 모드를 사용하려면 `cssSupport.rules`를 사용하세요. 여기에서 각각 모드를 정의하는 `KotlinWebpackCssRules` 목록과 [include](https://webpack.js.org/configuration/module/#ruleinclude) 및 [exclude](https://webpack.js.org/configuration/module/#ruleexclude) 패턴을 지정할 수 있습니다.

## Node.js

Node.js를 타겟으로 하는 Kotlin/JS 프로젝트의 경우, 플러그인이 호스트에 Node.js 환경을 자동으로 다운로드하고 설치합니다. 이미 설치된 Node.js 인스턴스가 있다면 그것을 사용할 수도 있습니다.

각 하위 프로젝트에 대해 Node.js 설정을 구성하거나 프로젝트 전체에 대해 설정할 수 있습니다.

### Node.js 버전 변경

기본 Node.js 버전은 현재 24.16.0이지만, 특정 하위 프로젝트에 대해 다른 버전을 사용할 수 있습니다. 하위 프로젝트의 `build.gradle(.kts)` 파일에 다음 라인을 추가하세요. 예:

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

모든 하위 프로젝트를 포함하여 전체 프로젝트의 버전을 설정하려면 `allprojects {}` 블록에 동일한 코드를 적용하세요. 예:

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

### 사전 설치된 Node.js 사용하기

Kotlin/JS 프로젝트를 빌드하는 호스트에 이미 Node.js가 설치되어 있는 경우, 자체 Node.js 인스턴스를 설치하는 대신 이를 사용하도록 Kotlin Multiplatform Gradle 플러그인을 구성할 수 있습니다.

사전 설치된 Node.js 인스턴스를 사용하려면 `build.gradle(.kts)` 파일에 다음 라인을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // 기본 동작으로 설정하려면 `true`로 지정
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // 기본 동작으로 설정하려면 `true`로 지정
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn

기본적으로 빌드 시점에 선언된 의존성을 다운로드하고 설치하기 위해 플러그인은 자체 [Yarn](https://yarnpkg.com/lang/en/) 패키지 관리자 인스턴스를 관리합니다. 추가 구성 없이 바로 작동하지만, 이를 미세 조정하거나 호스트에 이미 설치된 Yarn을 사용할 수 있습니다.

### 추가 Yarn 기능: .yarnrc

추가적인 Yarn 기능을 구성하려면 프로젝트 루트에 `.yarnrc` 파일을 배치하세요.
빌드 시점에 자동으로 감지됩니다.

예를 들어 npm 패키지에 커스텀 레지스트리를 사용하려면 프로젝트 루트의 `.yarnrc` 파일에 다음 라인을 추가하세요:

```text
registry "http://my.registry/api/npm/"
```

`.yarnrc`에 대해 더 자세히 알아보려면 [공식 Yarn 문서](https://classic.yarnpkg.com/en/docs/yarnrc/)를 방문하세요.

### 사전 설치된 Yarn 사용하기

Kotlin/JS 프로젝트를 빌드하는 호스트에 이미 Yarn이 설치되어 있는 경우, 자체 Yarn 인스턴스를 설치하는 대신 이를 사용하도록 Kotlin Multiplatform Gradle 플러그인을 구성할 수 있습니다.

사전 설치된 Yarn 인스턴스를 사용하려면 `build.gradle(.kts)`에 다음 라인을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // 기본 동작은 "true"입니다.
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

### kotlin-js-store를 통한 버전 고정

프로젝트 루트의 `kotlin-js-store` 디렉토리는 버전 고정에 필요한 `yarn.lock` 파일을 보관하기 위해 Kotlin Multiplatform Gradle 플러그인에 의해 자동으로 생성됩니다. lock 파일은 Yarn 플러그인에 의해 완전히 관리되며 `kotlinNpmInstall` Gradle 태스크 실행 중에 업데이트됩니다.

[권장되는 관행](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)에 따라 `kotlin-js-store`와 그 내용을 버전 제어 시스템(VCS)에 커밋하세요. 이는 모든 머신에서 애플리케이션이 정확히 동일한 의존성 트리로 빌드되도록 보장합니다.

필요한 경우 `build.gradle(.kts)`에서 디렉토리와 lock 파일 이름을 모두 변경할 수 있습니다:

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

> lock 파일의 이름을 변경하면 의존성 검사 도구가 파일을 더 이상 인식하지 못할 수 있습니다.
> 
{style="warning"}

`yarn.lock`에 대해 더 자세히 알아보려면 [공식 Yarn 문서](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)를 방문하세요.

### yarn.lock 업데이트 보고

Kotlin/JS는 `yarn.lock` 파일이 업데이트되었을 때 이를 알려주는 Gradle 설정을 제공합니다. CI 빌드 프로세스 중에 `yarn.lock`이 자동으로 변경되었는지 확인하고 싶을 때 이 설정을 사용할 수 있습니다:

* `YarnLockMismatchReport`: `yarn.lock` 파일의 변경 사항을 보고하는 방법을 지정합니다. 다음 값 중 하나를 사용할 수 있습니다:
    * `FAIL`: 해당 Gradle 태스크를 실패하게 합니다. 이것이 기본값입니다.
    * `WARNING`: 변경 사항에 대한 정보를 경고 로그에 기록합니다.
    * `NONE`: 보고를 비활성화합니다.
* `reportNewYarnLock`: 새로 생성된 `yarn.lock` 파일에 대해 명시적으로 보고합니다. 기본적으로 이 옵션은 비활성화되어 있습니다. 처음 시작할 때 새 `yarn.lock` 파일을 생성하는 것이 일반적인 관행이기 때문입니다. 이 옵션을 사용하여 파일이 저장소에 커밋되었는지 확인할 수 있습니다.
* `yarnLockAutoReplace`: Gradle 태스크가 실행될 때마다 `yarn.lock`을 자동으로 교체합니다.

이 옵션들을 사용하려면 다음과 같이 `build.gradle(.kts)`를 업데이트하세요:

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

### 기본적으로 --ignore-scripts를 사용하여 npm 의존성 설치

해킹된 npm 패키지로부터 악성 코드가 실행될 가능성을 줄이기 위해, Kotlin Multiplatform Gradle 플러그인은 기본적으로 npm 의존성 설치 중에 [수명 주기 스크립트(lifecycle scripts)](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)가 실행되는 것을 방지합니다.

`build.gradle(.kts)`에 다음 라인을 추가하여 수명 주기 스크립트 실행을 명시적으로 활성화할 수 있습니다:

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

## 배포 타겟 디렉토리

기본적으로 Kotlin/JS 프로젝트 빌드 결과물은 프로젝트 루트 내의 `/build/dist/<targetName>/<binaryName>` 디렉토리에 위치합니다.

프로젝트 배포 파일의 위치를 다른 곳으로 설정하려면, 빌드 스크립트의 `browser {}` 블록 내부에 `distribution {}` 블록을 추가하고 `set()` 메서드를 사용하여 `outputDirectory` 속성에 값을 할당하세요. 프로젝트 빌드 태스크를 실행하면 Gradle은 이 위치에 프로젝트 리소스와 함께 출력 번들을 저장합니다.

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

## 모듈 이름

해당 `.js` 및 `.d.ts` 파일을 포함하여 JavaScript *모듈*(이는 `build/js/packages/myModuleName`에 생성됨)의 이름을 조정하려면 `outputModuleName` 옵션을 사용하세요:

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

이 설정은 `build/dist`에 있는 webpack 출력물에는 영향을 주지 않는다는 점에 유의하세요.

## package.json 사용자 정의

`package.json` 파일은 JavaScript 패키지의 메타데이터를 보관합니다. npm과 같은 대중적인 패키지 저장소는 게시된 모든 패키지에 이 파일이 포함되도록 요구합니다. 이 파일은 패키지 게시물을 추적하고 관리하는 데 사용됩니다.

Kotlin Multiplatform Gradle 플러그인은 빌드 시점에 Kotlin/JS 프로젝트를 위한 `package.json`을 자동으로 생성합니다. 기본적으로 이 파일에는 이름, 버전, 라이선스, 의존성 및 기타 패키지 속성과 같은 필수 데이터가 포함됩니다.

기본 패키지 속성 외에도 `package.json`은 실행 가능한 스크립트를 식별하는 것과 같이 JavaScript 프로젝트가 어떻게 동작해야 하는지 정의할 수 있습니다.

Gradle DSL을 통해 프로젝트의 `package.json`에 커스텀 항목을 추가할 수 있습니다. `package.json`에 커스텀 필드를 추가하려면 `jsMain` 소스 세트의 `packageJson` 블록에서 `customField()` 함수를 사용하세요:

```kotlin
kotlin {
    sourceSets {
        jsMain {
            packageJson {
                customField("hello", mapOf("one" to 1, "two" to 2))
            }
        }
    }
}
```

프로젝트를 빌드하면 이 코드는 `package.json` 파일에 다음 블록을 추가합니다:

```json
"hello": {
    "one": 1,
    "two": 2
}
```

npm 저장소를 위한 `package.json` 파일 작성에 대해 더 자세히 알아보려면 [npm 문서](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)를 확인하세요.