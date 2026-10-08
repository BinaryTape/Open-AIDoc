[//]: # (title: 지원되는 버전 및 설정)

<primary-label ref="beta"/> 

이 페이지는 효율적인 Kotlin/Wasm 개발을 위한 [WebAssembly 제안(proposals)](https://webassembly.org/roadmap/), 지원되는 브라우저 및 설정 권장 사항에 대한 세부 정보를 제공합니다.

## 브라우저 버전 {id="browser-versions"}

Kotlin/Wasm은 WebAssembly 내의 기능 개선 및 새로운 기능 도입을 위해 [가비지 컬렉션(WasmGC)](#garbage-collection-proposal) 및 [예외 처리](#exception-handling-proposal)와 같은 최신 WebAssembly 제안에 의존합니다.

이러한 기능이 제대로 작동하도록 하려면 최신 제안을 지원하는 환경을 제공해야 합니다. 사용 중인 브라우저 버전이 새로운 WasmGC를 기본으로 지원하는지, 아니면 환경 설정을 변경해야 하는지 확인하세요.

### Chrome {id="chrome"}

* **119 버전 이상:**

  기본적으로 작동합니다.

* **이전 버전:**

  > 이전 브라우저에서 애플리케이션을 실행하려면 1.9.20 이전 버전의 Kotlin이 필요합니다.
  >
  {style="note"}

  1. 브라우저에서 `chrome://flags/#enable-webassembly-garbage-collection`으로 이동합니다.
  2. **WebAssembly Garbage Collection**을 활성화(Enable)합니다.
  3. 브라우저를 다시 시작합니다.

### Chromium 기반 브라우저 {id="chromium-based"}

Edge, Brave, Opera 또는 Samsung Internet과 같은 Chromium 기반 브라우저를 포함합니다.

* **119 버전 이상:**

  기본적으로 작동합니다.

* **이전 버전:**

   > 이전 브라우저에서 애플리케이션을 실행하려면 1.9.20 이전 버전의 Kotlin이 필요합니다.
   >
   {style="note"}

  `--js-flags=--experimental-wasm-gc` 명령줄 인수를 사용하여 애플리케이션을 실행하세요.

### Firefox {id="firefox"}

* **120 버전 이상:**

  기본적으로 작동합니다.

* **119 버전:**

  1. 브라우저에서 `about:config`로 이동합니다.
  2. `javascript.options.wasm_gc` 옵션을 활성화합니다.
  3. 페이지를 새로고침합니다.

### Safari/WebKit {id="safari-webkit"}

* **18.2 버전 이상:**

  기본적으로 작동합니다.

* **이전 버전:**

   지원되지 않습니다.

> Safari 18.2는 iOS 18.2, iPadOS 18.2, visionOS 2.2, macOS 15.2, macOS Sonoma 및 macOS Ventura에서 사용할 수 있습니다.
> iOS 및 iPadOS에서 Safari 18.2는 운영 체제와 함께 번들로 제공됩니다. 이를 사용하려면 기기를 18.2 버전 이상으로 업데이트하세요.
>
> 자세한 내용은 [Safari 릴리스 노트](https://developer.apple.com/documentation/safari-release-notes/safari-18_2-release-notes#Overview)를 참고하세요.
>
{style="note"}

## Wasm 제안 지원 {id="wasm-proposals-support"}

Kotlin/Wasm의 개선 사항은 [WebAssembly 제안](https://webassembly.org/roadmap/)을 기반으로 합니다. 여기에서 WebAssembly의 가비지 컬렉션 및 (레거시) 예외 처리 제안에 대한 지원 세부 정보를 확인할 수 있습니다.

### 가비지 컬렉션 제안 {id="garbage-collection-proposal"}

Kotlin 1.9.20부터 Kotlin 툴체인은 최신 버전의 [Wasm 가비지 컬렉션](https://github.com/WebAssembly/gc) (WasmGC) 제안을 사용합니다.

이러한 이유로 Wasm 프로젝트를 최신 버전의 Kotlin으로 업데이트할 것을 강력히 권장합니다. 또한 Wasm 환경을 지원하는 최신 버전의 브라우저를 사용하는 것이 좋습니다.

### 예외 처리 제안 {id="exception-handling-proposal"}

Kotlin 툴체인은 [레거시(legacy)](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md) 버전과 [신규(new)](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) 버전의 예외 처리 제안을 모두 지원합니다. 이를 통해 Kotlin으로 생성된 Wasm 바이너리가 더 넓은 범위의 환경에서 실행될 수 있습니다.

[`wasmJs` 타겟](wasm-overview.md#kotlin-wasm-and-compose-multiplatform)은 기본적으로 레거시 예외 처리 제안을 사용합니다. `wasmJs` 타겟에 대해 새로운 예외 처리 제안을 활성화하려면 `-Xwasm-use-new-exception-proposal` 컴파일러 옵션을 사용하세요.

반면, [`wasmWasi` 타겟](wasm-overview.md#kotlin-wasm-and-wasi)은 기본적으로 새로운 제안을 사용하여 현대적인 WebAssembly 런타임과의 호환성을 높입니다. 레거시 제안으로 전환하려면 `-Xwasm-use-new-exception-proposal=false` 컴파일러 옵션을 사용하세요.

`wasmWasi` 타겟의 경우, 새로운 예외 처리 제안을 채택하는 것이 안전합니다. 이 환경을 타겟팅하는 애플리케이션은 일반적으로 사용자가 제어하는 덜 다양한 런타임 환경(종종 특정 단일 VM)에서 실행되므로 호환성 문제의 위험이 적습니다.

> 프로젝트 설정, 종속성 사용 및 기타 작업에 대한 자세한 내용은 [Kotlin/Wasm 예제](https://github.com/Kotlin/kotlin-wasm-examples#readme)를 참고하세요.
>
{style="tip"}

## 기본 임포트(default import) 사용 {id="use-default-import"}

[Kotlin/Wasm 코드를 JavaScript로 임포트](wasm-js-interop.md)하는 방식이 기본 내보내기(default exports)에서 명명된 내보내기(named exports)로 변경되었습니다.

여전히 기본 임포트를 사용하려면 새로운 JavaScript 래퍼 모듈을 생성하세요. 다음 스니펫을 사용하여 `.mjs` 파일을 만듭니다:

```Javascript
// 메인 .mjs 파일의 경로를 지정합니다.
import * as moduleExports from "./wasm-test.mjs";

export { moduleExports as default };
```

새 `.mjs` 파일을 리소스 폴더에 넣으면 빌드 프로세스 중에 메인 `.mjs` 파일 옆에 자동으로 배치됩니다.

`.mjs` 파일을 커스텀 위치에 둘 수도 있습니다. 이 경우 파일을 수동으로 메인 `.mjs` 파일 옆으로 옮기거나, 해당 위치에 맞게 임포트 문(import statement)의 경로를 조정해야 합니다.

## Kotlin/Wasm 증분 컴파일 {id="kotlin-wasm-incremental-compilation"}

Kotlin/Wasm 타겟은 증분 컴파일(incremental compilation)을 지원합니다. 증분 컴파일을 사용하면 컴파일러가 최근 변경 사항의 영향을 받는 파일만 다시 컴파일할 수 있어 컴파일 시간을 단축하는 데 도움이 됩니다.

Wasm 타겟에 대한 증분 컴파일은 기본적으로 활성화되어 있습니다. 이를 비활성화하려면 프로젝트의 `local.properties` 또는 `gradle.properties` 파일에 다음 라인을 추가하세요:

```text
kotlin.incremental.wasm=false
```

## 정규화된 클래스 이름(FQN)의 진단 {id="diagnostics-in-fully-qualified-class-names"}

Kotlin/Wasm에서 컴파일러는 애플리케이션 크기가 커지는 것을 방지하기 위해 생성된 바이너리에 클래스의 정규화된 이름(Fully Qualified Names, FQNs)을 기본적으로 저장하지 않습니다.

이러한 이유로 정규화된 이름 기능을 명시적으로 활성화하지 않는 한, Kotlin/Wasm 프로젝트에서 `KClass::qualifiedName` 속성을 호출하면 컴파일러가 에러를 보고합니다.

이 진단은 기본적으로 활성화되어 있으며 에러가 자동으로 보고됩니다. 이 진단을 비활성화하고 Kotlin/Wasm에서 `qualifiedName`을 허용하려면, `build.gradle.kts` 파일에 다음 옵션을 추가하여 컴파일러가 모든 클래스에 대해 정규화된 이름을 저장하도록 지시하세요:

```kotlin
// build.gradle.kts
kotlin {
   wasmJs {
       ...
       compilerOptions {
           freeCompilerArgs.add("-Xwasm-kclass-fqn")
       }
   }
}
```

이 옵션을 활성화하면 애플리케이션 크기가 커진다는 점에 유의하세요.

### 정규화된 이름 {id="fully-qualified-names"}

Kotlin/Wasm 타겟에서 정규화된 이름(FQNs)은 별도의 추가 설정 없이 런타임에 사용할 수 있습니다. 즉, `KClass.qualifiedName` 속성이 기본적으로 활성화되어 있습니다.

정규화된 이름을 사용하면 JVM에서 Wasm 타겟으로의 코드 이식성이 향상되고, 런타임 에러 발생 시 정규화된 이름을 전체로 보여줌으로써 더 많은 정보를 제공할 수 있습니다.

## 배열 범위를 벗어난 접근 및 트랩(trap) {id="array-out-of-bounds-access-and-traps"}

Kotlin/Wasm에서 범위를 벗어난 인덱스로 배열에 접근하면 일반적인 Kotlin 예외 대신 WebAssembly 트랩(trap)이 발생합니다. 트랩은 현재 실행 스택을 즉시 중단합니다.

JavaScript 환경에서 실행될 때 이러한 트랩은 `WebAssembly.RuntimeError`로 나타나며 JavaScript 측에서 포착(catch)할 수 있습니다.

실행 파일을 링크할 때 명령줄에서 다음 컴파일러 옵션을 사용하여 Kotlin/Wasm 환경에서 이러한 트랩을 방지할 수 있습니다:

```
-Xwasm-enable-array-range-checks
```

또는 Gradle 빌드 파일의 `compilerOptions {}` 블록에 추가하세요:

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwasm-enable-array-range-checks")
    }
}
```

컴파일러 옵션을 활성화하면 트랩 대신 `IndexOutOfBoundsException`이 발생합니다. 

자세한 내용을 확인하고 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-73452/K-Wasm-turning-on-range-checks-by-default)에서 피드백을 공유해 주세요.

## 실험적 어노테이션 {id="experimental-annotations"}

Kotlin/Wasm은 일반적인 WebAssembly 상호운용성을 위해 몇 가지 실험적 어노테이션을 제공합니다.

[`@WasmImport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-import/) 및 [`@WasmExport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-export/)를 사용하면 각각 Kotlin/Wasm 모듈 외부에서 정의된 함수를 호출하거나, Kotlin 함수를 호스트 또는 다른 Wasm 모듈에 노출할 수 있습니다.

이러한 메커니즘은 아직 발전 중이므로 모든 어노테이션은 실험적으로 표시되어 있습니다. [사용하려면 명시적으로 옵트인(opt-in)해야 하며](opt-in-requirements.md), 향후 Kotlin 버전에서 설계나 동작이 변경될 수 있습니다.

## 디버깅 중 재로드 {id="reloads-during-debugging"}

[최신 브라우저](#browser-versions)에서 애플리케이션을 [디버깅](wasm-debugging.md)하는 기능은 별도의 설정 없이 바로 작동합니다. 개발 Gradle 태스크(`*DevRun`)를 실행하면 Kotlin이 자동으로 소스 파일을 브라우저에 제공합니다.

그러나 기본적으로 소스를 제공하면 [Kotlin 컴파일 및 번들링이 완료되기 전에 브라우저에서 애플리케이션이 반복적으로 재로드되는 현상](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)이 발생할 수 있습니다. 이에 대한 해결 방법으로, Kotlin 소스 파일을 무시하고 제공된 정적 파일에 대한 감시(watching)를 비활성화하도록 webpack 설정을 조정하세요. 프로젝트 루트의 `webpack.config.d` 디렉토리에 다음 내용이 포함된 `.js` 파일을 추가합니다:

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
            return {
                directory: file,
                watch: false,
            }
        } else {
            return file
        }
    })
}
```
