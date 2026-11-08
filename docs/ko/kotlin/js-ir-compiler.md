[//]: # (title: Kotlin/JS 컴파일러 기능)

Kotlin/JS 컴파일러는 JavaScript 코드를 생성하기 전에 Kotlin 코드를 중간 표현(IR, Intermediate Representation)으로 변환합니다.
이 중간 단계를 통해 컴파일러는 성능, 크기, 개발 속도 측면에서 출력을 최적화할 수 있으며, 대상 JavaScript 버전, 모듈 시스템, TypeScript 선언 파일, 출력 단위(granularity) 등 생성되는 JavaScript를 세부적으로 제어할 수 있습니다.

## 대상 JavaScript 버전 설정 {id="set-the-target-javascript-version"}

Kotlin/JS 컴파일러는 ECMAScript 표준의 ES5, ES2015, ES2020 버전에 맞는 JavaScript를 생성할 수 있습니다.
타깃 환경에서 지원하는 최신 버전을 선택하세요.
`build.gradle.kts` 파일에서 `target` 프로퍼티를 설정합니다. 예를 들어 ES2020을 타깃으로 지정하려면 다음과 같이 작성합니다.

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

각 타깃에서 사용할 수 있는 기능에 대한 자세한 내용은 [ECMAScript 타깃 설정](js-project-setup.md#set-an-ecmascript-target)을 참고하세요.

## 모듈 시스템 구성 {id="configure-the-module-system"}

Kotlin/JS 컴파일러는 UMD, CommonJS, AMD, ES 모듈과 같은 다양한 모듈 시스템에 맞는 코드를 생성할 수 있습니다.
대상 모듈 시스템을 선택하려면 `build.gradle.kts` 파일에서 `moduleKind` 컴파일러 옵션을 설정합니다.

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

지원되는 `moduleKind` 값과 구성 세부 정보는 [JavaScript 모듈](js-modules.md)을 참고하세요.

## TypeScript 선언 파일(`d.ts`) 생성 {id="generate-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 컴파일러는 Kotlin 코드에서 TypeScript 정의를 생성할 수 있습니다. 이러한 정의는 JavaScript 도구 및 IDE에서 코드 완성 및 정적 분석을 위한 타입 정보를 제공하므로, JavaScript 및 TypeScript 프로젝트에서 Kotlin API를 더 쉽게 사용할 수 있도록 해줍니다.

정의 파일을 생성하려면 Kotlin 선언에 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation)를 추가하고, `build.gradle.kts` 파일의 `js {}` 블록에 `generateTypeScriptDefinitions()` 함수를 추가합니다.

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

컴파일러는 `@JsExport`가 지정된 최상위 선언을 수집하여 `.d.ts` 파일에 TypeScript 정의를 생성합니다.

자세한 내용은 [TypeScript 선언 파일(`d.ts`) 생성](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)을 참고하세요.

## 출력 세분성 구성 {id="configure-output-granularity"}

프로젝트에서 컴파일러가 `.js` 파일을 출력하는 방식을 선택할 수 있습니다.

* **모듈별(Per module)**: 각 프로젝트 모듈마다 별도의 `.js` 파일을 생성합니다(기본값).
* **전체 프로그램(Whole program)**: 전체 프로그램에 대해 단일 `.js` 파일을 생성합니다.
* **파일별(Per file)**: 각 Kotlin 파일마다 하나의 `.js` 파일을 생성하거나, 파일에 내보낸(exported) 선언이 포함된 경우 두 개를 생성합니다(`es2015` 및 `es2020` 대상 JavaScript 버전에서 사용 가능).

출력 단위를 변경하려면 `gradle.properties` 파일에서 `kotlin.js.ir.output.granularity` 프로퍼티를 설정합니다.

```properties
# Default: per-module
kotlin.js.ir.output.granularity=whole-program
```

파일별 요구 사항을 포함한 구성 세부 정보는 [출력 세분성 구성](js-project-setup.md#configure-output-granularity)을 참고하세요.

## 최상위 프로퍼티의 지연 초기화 {id="lazy-initialization-of-top-level-properties"}

애플리케이션 시작 성능을 향상하기 위해 Kotlin/JS 컴파일러는 최상위 프로퍼티를 지연(lazily) 초기화합니다. 이렇게 하면 애플리케이션 코드에 사용된 모든 최상위 프로퍼티를 시작 시점에 초기화하지 않고도 애플리케이션을 로드할 수 있습니다.
시작할 때 필요한 프로퍼티만 초기화되며, 다른 프로퍼티는 해당 프로퍼티를 사용하는 코드가 실제로 실행될 때 나중에 값을 받게 됩니다.

```kotlin
val a = run {
    val result = // intensive computations
    println(result)
    result
} // value is computed upon the first usage
```

어떤 이유로든 프로퍼티를 즉시(애플리케이션 시작 시점에) 초기화해야 하는 경우, [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-eager-initialization/){nullable="true"} 애너테이션을 지정하세요.

## 개발용 바이너리를 위한 증분 컴파일 {id="incremental-compilation-for-development-binaries"}

Kotlin/JS 컴파일러는 개발 프로세스 속도를 높여주는 _개발용 바이너리를 위한 증분 컴파일 모드_를 제공합니다.
이 모드에서 컴파일러는 모듈 수준에서 `compileDevelopmentExecutableKotlinJs` Gradle 태스크의 결과를 캐시합니다.
이후 컴파일 시 변경되지 않은 소스 파일에 대해 캐시된 컴파일 결과를 사용하므로, 특히 변경 사항이 적을 때 컴파일이 훨씬 빠르게 완료됩니다.

증분 컴파일은 기본적으로 활성화되어 있습니다. 개발용 바이너리의 증분 컴파일을 비활성화하려면 프로젝트의 `gradle.properties` 또는 `local.properties`에 다음 줄을 추가합니다.

```none
# Default: true
kotlin.incremental.js.ir=false
```

> 증분 컴파일 모드에서 클린 빌드(clean build)는 캐시를 생성하고 채워야 하므로 일반적으로 더 느립니다.
>
{style="note"}

## 프로덕션 환경에서 멤버 이름 축소(Minification) {id="minification-of-member-names-in-production"}

Kotlin/JS 컴파일러는 Kotlin 클래스와 함수 간의 관계에 대한 내부 정보를 활용하여 보다 효율적인 축소(minification)를 적용하며, 함수, 프로퍼티, 클래스의 이름을 단축합니다. 이를 통해 최종 번들 애플리케이션의 크기를 줄일 수 있습니다.

이러한 유형의 축소는 [프로덕션](js-project-setup.md#building-executables) 모드로 Kotlin/JS 애플리케이션을 빌드할 때 자동으로 적용되며 기본적으로 활성화되어 있습니다. 멤버 이름 축소를 비활성화하려면 `-Xir-minimized-member-names` 컴파일러 옵션을 사용합니다.

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
            }
        }
    }
}
```

## 데드 코드 제거(Dead Code Elimination) {id="dead-code-elimination"}

[데드 코드 제거](https://wikipedia.org/wiki/Dead_code_elimination)(Dead code elimination, DCE)는 사용되지 않는 프로퍼티, 함수, 클래스를 제거하여 결과 JavaScript 코드의 크기를 줄여줍니다.

사용되지 않는 선언은 다음과 같은 경우에 나타날 수 있습니다.

* 함수가 인라인(inline)화되어 직접 호출되지 않는 경우(몇 가지 예외를 제외하고 항상 발생함).
* 모듈이 공유 라이브러리를 사용하는 경우. DCE가 없으면 사용하지 않는 라이브러리 부분도 최종 번들에 그대로 포함됩니다.
  예를 들어 Kotlin 표준 라이브러리에는 리스트, 배열, 문자 시퀀스 조작을 위한 함수, DOM용 어댑터 등이 포함되어 있습니다. 이 모든 기능은 JavaScript 파일로 변환할 때 약 1.3MB의 크기를 차지합니다. 단순한 "Hello, world" 애플리케이션에는 콘솔 루틴만 필요하며, 이는 전체 파일에서 몇 킬로바이트에 불과합니다.

Kotlin/JS 컴파일러에서는 DCE가 자동으로 처리됩니다.

* _개발(development)_ 번들링 태스크에서는 DCE가 비활성화되며, 이는 다음 Gradle 태스크에 해당합니다.

  * `jsBrowserDevelopmentRun`
  * `jsBrowserDevelopmentWebpack`
  * `jsNodeDevelopmentRun`
  * `compileDevelopmentExecutableKotlinJs`
  * `compileDevelopmentLibraryKotlinJs`
  * 이름에 "development"가 포함된 기타 Gradle 태스크

* _프로덕션(production)_ 번들을 빌드하는 경우에는 DCE가 활성화되며, 이는 다음 Gradle 태스크에 해당합니다.

  * `jsBrowserProductionRun`
  * `jsBrowserProductionWebpack`
  * `compileProductionExecutableKotlinJs`
  * `compileProductionLibraryKotlinJs`
  * 이름에 "production"이 포함된 기타 Gradle 태스크

[`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 애너테이션을 사용하면 DCE가 루트(root)로 처리하도록 할 선언을 지정할 수 있습니다.