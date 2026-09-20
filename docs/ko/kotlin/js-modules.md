[//]: # (title: JavaScript 모듈)

Kotlin 프로젝트를 다양한 인기 모듈 시스템을 위한 JavaScript 모듈로 컴파일할 수 있습니다. 현재 JavaScript 모듈에 대해 다음 구성을 지원합니다.

- [ES 모듈 (ES Modules)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules): JavaScript에서 모듈을 선언하는 표준 방식입니다(`import/export` JavaScript 구문 사용). `target`이 `es2015`로 설정된 경우 기본적으로 사용됩니다.
- [UMD (Unified Module Definitions)](https://github.com/umdjs/umd): *AMD*와 *CommonJS* 모두와 호환됩니다. UMD 모듈은 임포트(import)되지 않거나 모듈 시스템이 없는 환경에서도 실행될 수 있습니다. `browser` 및 `nodejs` 타겟의 기본 옵션입니다.
- [AMD (Asynchronous Module Definitions)](https://github.com/amdjs/amdjs-api/wiki/AMD): 특히 [RequireJS](https://requirejs.org/) 라이브러리에서 사용됩니다.
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1): Node.js/npm에서 널리 사용됩니다(`require` 함수와 `module.exports` 객체 사용).
- Plain (일반): 어떤 모듈 시스템으로도 컴파일하지 않습니다. 전역 스코프(global scope)에서 이름을 통해 모듈에 접근할 수 있습니다.

## 브라우저 타겟 {id="browser-targets"}

웹 브라우저 환경에서 코드를 실행하려 하고 UMD 이외의 모듈 시스템을 사용하고 싶다면, `webpackTask` 구성 블록에서 원하는 모듈 유형을 지정할 수 있습니다. 예를 들어, CommonJS로 전환하려면 다음과 같이 사용합니다.

```groovy
kotlin {
    js {
        browser {
            webpackTask {
                output.libraryTarget = "commonjs2"
            }
        }
        binaries.executable()
    }
}

```

Webpack은 `commonjs`와 `commonjs2`라는 두 가지 다른 방식의 CommonJS를 제공하며, 이는 선언(declaration)이 노출되는 방식에 영향을 미칩니다. 대부분의 경우, 생성된 라이브러리에 `module.exports` 구문을 추가하는 `commonjs2`를 사용하는 것이 좋습니다. 또는 CommonJS 사양을 엄격하게 준수하는 `commonjs` 옵션을 선택할 수도 있습니다. `commonjs`와 `commonjs2`의 차이점에 대해 더 자세히 알아보려면 [Webpack 저장소](https://github.com/webpack/webpack/issues/1114)를 참조하세요.

## JavaScript 라이브러리 및 Node.js 파일 {id="javascript-libraries-and-node-js-files"}

JavaScript 또는 Node.js 환경에서 사용할 라이브러리를 만들고 있고 다른 모듈 시스템을 사용하려는 경우, 방법이 약간 다릅니다.

### 타겟 모듈 시스템 선택 {id="choose-the-target-module-system"}

타겟 모듈 시스템을 선택하려면 Gradle 빌드 스크립트에서 `moduleKind` 컴파일러 옵션을 설정하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlinJs.compilerOptions.moduleKind = org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS
```

</tab>
</tabs>

사용 가능한 값은 `umd` (기본값), `es`, `commonjs`, `amd`, `plain`입니다.

> 이는 `webpackTask.output.libraryTarget`을 조정하는 것과는 다릅니다. library target은 (코드가 이미 컴파일된 후) _webpack에 의해 생성된_ 출력을 변경합니다. `compilerOptions.moduleKind`는 _Kotlin 컴파일러에 의해 생성된_ 출력을 변경합니다.
>
{style="note"}  

Kotlin Gradle DSL에는 CommonJS 및 ESM 모듈 종류를 설정하기 위한 단축어(shortcut)도 있습니다.

```kotlin
kotlin {
    js {
        useCommonJs()
        // 또는
        useEsModules()
        // ...
    }
}
```

## @JsModule 어노테이션 {id="jsmodule-annotation"}

`external` 클래스, 패키지, 함수 또는 프로퍼티가 JavaScript 모듈임을 Kotlin에 알리려면 `@JsModule` 어노테이션을 사용할 수 있습니다. "hello"라는 이름의 다음과 같은 CommonJS 모듈이 있다고 가정해 보겠습니다.

```javascript
module.exports.sayHello = function (name) { alert("Hello, " + name); }
```

Kotlin에서는 다음과 같이 선언해야 합니다.

```kotlin
@JsModule("hello")
external fun sayHello(name: String)
```

### 패키지에 @JsModule 적용하기 {id="apply-jsmodule-to-packages"}

일부 JavaScript 라이브러리는 함수나 클래스 대신 패키지(네임스페이스)를 내보냅니다.
JavaScript 관점에서 이는 클래스, 함수, 프로퍼티를 멤버로 가진 *객체(object)*입니다.
이러한 패키지를 Kotlin 객체로 임포트하는 것은 종종 부자연스러워 보일 수 있습니다.
컴파일러는 다음 표기법을 사용하여 임포트된 JavaScript 패키지를 Kotlin 패키지에 매핑할 수 있습니다.

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

external class C
```

여기서 해당 JavaScript 모듈은 다음과 같이 선언됩니다.

```javascript
module.exports = {
  foo: { /* 코드가 여기에 위치함 */ },
  C: { /* 코드가 여기에 위치함 */ }
}
```

`@file:JsModule` 어노테이션이 표시된 파일은 external이 아닌 멤버를 선언할 수 없습니다.
아래 예제는 컴파일 시 오류(compile-time error)를 발생시킵니다.

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

fun bar() = "!" + foo() + "!" // 여기서 오류 발생
```

### 더 깊은 패키지 계층 구조 임포트하기 {id="import-deeper-package-hierarchies"}

이전 예제에서 JavaScript 모듈은 단일 패키지를 내보냈습니다.
하지만 일부 JavaScript 라이브러리는 하나의 모듈 내에서 여러 패키지를 내보냅니다.
Kotlin은 이 경우도 지원하지만, 임포트하는 각 패키지에 대해 새로운 `.kt` 파일을 선언해야 합니다.

예를 들어, 예제를 조금 더 복잡하게 만들어 보겠습니다.

```javascript
module.exports = {
  mylib: {
    pkg1: {
      foo: function () { /* 코드가 여기에 위치함 */ },
      bar: function () { /* 코드가 여기에 위치함 */ }
    },
    pkg2: {
      baz: function () { /* 코드가 여기에 위치함 */ }
    }
  }
}
```

Kotlin에서 이 모듈을 임포트하려면 두 개의 Kotlin 소스 파일을 작성해야 합니다.

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg1")

package extlib.pkg1

external fun foo()

external fun bar()
```

그리고

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg2")

package extlib.pkg2

external fun baz()
```

### @JsNonModule 어노테이션 {id="jsnonmodule-annotation"}

선언이 `@JsModule`로 표시된 경우, JavaScript 모듈로 컴파일하지 않으면 Kotlin 코드에서 이를 사용할 수 없습니다.
일반적으로 개발자들은 라이브러리를 JavaScript 모듈과, 프로젝트의 정적 리소스에 복사하여 `<script>` 태그를 통해 포함할 수 있는 다운로드 가능한 `.js` 파일 두 가지 형태로 배포합니다. 모듈이 아닌 환경에서 `@JsModule` 선언을 사용해도 괜찮다는 것을 Kotlin에 알리려면 `@JsNonModule` 어노테이션을 추가하세요. 예를 들어, 다음과 같은 JavaScript 코드를 고려해 보십시오.

```javascript
function topLevelSayHello (name) { alert("Hello, " + name); }

if (module && module.exports) {
  module.exports = topLevelSayHello;
}
```

Kotlin에서 다음과 같이 설명할 수 있습니다.

```kotlin
@JsModule("hello")
@JsNonModule
@JsName("topLevelSayHello")
external fun sayHello(name: String)
```

### Kotlin 표준 라이브러리에서 사용하는 모듈 시스템 {id="module-system-used-by-the-kotlin-standard-library"}

Kotlin은 Kotlin/JS 표준 라이브러리와 함께 단일 파일로 배포되며, 이 파일 자체는 UMD 모듈로 컴파일되므로 위에서 설명한 모든 모듈 시스템에서 사용할 수 있습니다. Kotlin/JS의 대부분의 사용 사례에서는 `kotlin-stdlib-js`에 대한 Gradle 의존성을 사용하는 것이 권장되며, 이는 NPM에서 [`kotlin`](https://www.npmjs.com/package/kotlin) 패키지로도 제공됩니다.