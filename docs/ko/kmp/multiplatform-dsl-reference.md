[//]: # (title: 멀티플랫폼 Gradle DSL 레퍼런스)

Kotlin 멀티플랫폼 Gradle 플러그인은 Kotlin 멀티플랫폼 프로젝트를 생성하기 위한 도구입니다.
이 문서는 플러그인 구성 요소에 대한 레퍼런스를 제공하며, Kotlin 멀티플랫폼 프로젝트용 Gradle 빌드 스크립트를 작성할 때 참고 자료로 활용할 수 있습니다. [Kotlin 멀티플랫폼 프로젝트의 개념과 생성 및 설정 방법](multiplatform-discover-project.md)에 대해 자세히 알아보세요.

## ID 및 버전

Kotlin 멀티플랫폼 Gradle 플러그인의 정규화된 이름(Fully qualified name)은 `org.jetbrains.kotlin.multiplatform`입니다.
Kotlin Gradle DSL을 사용하는 경우 `kotlin("multiplatform")`으로 플러그인을 적용할 수 있습니다.
플러그인 버전은 Kotlin 릴리스 버전과 일치합니다. 최신 버전은 %kotlinVersion%입니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</TabItem>
</Tabs>

## 최상위 블록

`kotlin {}`은 Gradle 빌드 스크립트에서 멀티플랫폼 프로젝트 설정을 위한 최상위 블록입니다.
`kotlin {}` 내부에서는 다음과 같은 블록을 작성할 수 있습니다.

| **블록**            | **설명**                                                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| _&lt;targetName&gt;_ | 프로젝트의 특정 타겟을 선언합니다. 사용 가능한 타겟 이름은 [타겟](#targets) 섹션에 나열되어 있습니다.                |
| `targets`            | 프로젝트의 모든 타겟을 나열합니다.                                                                                                       |
| `sourceSets`         | 프로젝트의 사전 정의된 [소스 세트](#source-sets)를 설정하고 커스텀 소스 세트를 선언합니다.                                                   |
| `compilerOptions`    | 모든 타겟과 공유 소스 세트의 기본값으로 사용되는 공통 확장 수준의 [컴파일러 옵션](#compiler-options)을 지정합니다. |
| `dependencies`       | [공통 의존성](#configure-dependencies-at-the-top-level)을 설정합니다. (실험적 기능)                                              |

## 타겟

_타겟(Target)_은 지원되는 플랫폼 중 하나를 대상으로 소프트웨어를 컴파일, 테스트 및 패키징하는 빌드의 일부입니다. Kotlin은 각 플랫폼에 대한 타겟을 제공하므로, 특정 타겟을 위해 코드를 컴파일하도록 Kotlin에 지시할 수 있습니다. [타겟 설정](multiplatform-discover-project.md#targets)에 대해 더 자세히 알아보세요.

각 타겟은 하나 이상의 [컴파일(Compilation)](#compilations) 단위를 가질 수 있습니다. 테스트 및 프로덕션 용도의 기본 컴파일 외에도 [커스텀 컴파일을 생성](multiplatform-configure-compilations.md#create-a-custom-compilation)할 수 있습니다.

멀티플랫폼 프로젝트의 타겟은 `kotlin {}` 내부의 해당 블록(예: `jvm`, `android`, `iosArm64`)에 설명되어 있습니다. 사용 가능한 전체 타겟 목록은 다음과 같습니다.

<table>
    
<tr>
<th>타겟 플랫폼</th>
        <th>타겟</th>
        <th>설명</th>
</tr>

    
<tr>
<td>Kotlin/JVM</td>
        <td><code>jvm</code></td>
        <td></td>
</tr>

    
<tr>
<td rowspan="2">Kotlin/Wasm</td>
        <td><code>wasmJs</code></td>
        <td>프로젝트를 JavaScript 런타임에서 실행하려는 경우에 사용합니다.</td>
</tr>

    
<tr>
<td><code>wasmWasi</code></td>
        <td><a href="https://github.com/WebAssembly/WASI">WASI</a> 시스템 인터페이스 지원이 필요한 경우에 사용합니다.</td>
</tr>

    
<tr>
<td>Kotlin/JS</td>
        <td><code>js</code></td>
        <td>
            <p>실행 환경을 선택하세요:</p>
            <list>
                <li>브라우저에서 실행되는 애플리케이션의 경우 <code>browser {}</code>.</li>
                <li>Node.js에서 실행되는 애플리케이션의 경우 <code>nodejs {}</code>.</li>
            </list>
            <p>자세한 내용은 <a href="https://kotlinlang.org/docs/js-project-setup.html#execution-environments">Kotlin/JS 프로젝트 설정</a>을 참조하세요.</p>
        </td>
</tr>

    
<tr>
<td>Kotlin/Native</td>
        <td></td>
        <td>
            <p>현재 지원되는 macOS, Linux, Windows 호스트용 타겟에 대해서는 <a href="https://kotlinlang.org/docs/native-target-support.html">Kotlin/Native 타겟 지원</a>을 참조하세요.</p>
        </td>
</tr>

    
<tr>
<td>Android 애플리케이션 및 라이브러리</td>
        <td><code>android</code></td>
        <td>
            <p>Android Gradle 플러그인(<code>com.android.application</code> 또는 <code>com.android.kotlin.multiplatform.library</code>)을 수동으로 적용해야 합니다.</p>
            <p>Gradle 서브프로젝트당 하나의 Android 타겟만 생성할 수 있습니다.</p>
        </td>
</tr>

</table>

> 현재 호스트에서 지원되지 않는 타겟은 빌드 중에 무시되므로 배포(Publish)되지 않습니다.
>
{style="note"}

```groovy
kotlin {
    jvm()
    iosArm64()
    macosArm64()
    js().browser()
}
```

타겟 설정은 다음 두 부분으로 구성될 수 있습니다.

* 모든 타겟에서 사용할 수 있는 [공통 타겟 설정](#common-target-configuration).
* 타겟별 설정.

각 타겟은 하나 이상의 [컴파일](#compilations) 단위를 가질 수 있습니다.

### 공통 타겟 설정

모든 타겟 블록에서 다음 선언을 사용할 수 있습니다.

| **이름**            | **설명**                                                                                                                                                                            | 
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `platformType`      | 이 타겟의 Kotlin 플랫폼입니다. 사용 가능한 값: `jvm`, `androidJvm`, `js`, `wasm`, `native`, `common`.                                                                              |
| `artifactsTaskName` | 이 타겟의 결과 아티팩트를 빌드하는 태스크 이름입니다.                                                                                                                   |
| `components`        | Gradle 배포(Publication)를 설정하는 데 사용되는 컴포넌트입니다.                                                                                                                                             |
| `compilerOptions`   | 타겟에 사용되는 [컴파일러 옵션](#compiler-options)입니다. 이 선언은 [최상위 레벨](multiplatform-dsl-reference.md#top-level-blocks)에서 구성된 모든 `compilerOptions {}`보다 우선합니다. |

### 웹 타겟

`js {}` 블록은 Kotlin/JS 타겟의 구성을 설명하고, `wasmJs {}` 블록은 JavaScript와 상호 운용 가능한 Kotlin/Wasm 타겟의 구성을 설명합니다. 타겟 실행 환경에 따라 다음 두 블록 중 하나를 포함할 수 있습니다.

| **이름**              | **설명**                      | 
|-----------------------|--------------------------------------|
| [`browser`](#browser) | 브라우저 타겟 설정입니다. |
| [`nodejs`](#node-js)  | Node.js 타겟 설정입니다. |

[Kotlin/JS 프로젝트 구성](https://kotlinlang.org/docs/js-project-setup.html)에 대해 더 자세히 알아보세요.

별도의 `wasmWasi {}` 블록은 WASI 시스템 인터페이스를 지원하는 Kotlin/Wasm 타겟의 구성을 설명합니다. 여기서는 [`nodejs`](#node-js) 실행 환경만 사용할 수 있습니다.

```kotlin
kotlin {
    wasmWasi {
        nodejs()
        binaries.executable()
    }
}
```

모든 웹 타겟(`js`, `wasmJs`, `wasmWasi`)은 `binaries.executable()` 호출을 지원합니다. 이는 Kotlin 컴파일러가 실행 파일을 생성하도록 명시적으로 지시합니다. 자세한 내용은 Kotlin/JS 문서의 [실행 환경](https://kotlinlang.org/docs/js-project-setup.html#execution-environments)을 참조하세요.

#### Browser

`browser {}`는 다음과 같은 구성 블록을 포함할 수 있습니다.

| **이름**       | **설명**                                                            | 
|----------------|----------------------------------------------------------------------------|
| `testRuns`     | 테스트 실행 설정입니다.                                           |
| `runTask`      | 프로젝트 실행 설정입니다.                                          |
| `webpackTask`  | [Webpack](https://webpack.js.org/)을 사용한 프로젝트 번들링 설정입니다. |
| `distribution` | 출력 파일 경로입니다.                                                      |

```kotlin
kotlin {
    js().browser {
        webpackTask { /* ... */ }
        testRuns { /* ... */ }
        distribution {
            directory = File("$projectDir/customdir/")
        }
    }
}
```

#### Node.js

`nodejs {}`는 테스트 및 실행 태스크 설정을 포함할 수 있습니다.

| **이름**   | **설명**                   | 
|------------|-----------------------------------|
| `testRuns` | 테스트 실행 설정입니다.  |
| `runTask`  | 프로젝트 실행 설정입니다. |

```kotlin
kotlin {
    js().nodejs {
        runTask { /* ... */ }
        testRuns { /* ... */ }
    }
}
```

### 네이티브 타겟

네이티브 타겟의 경우 다음과 같은 특정 블록을 사용할 수 있습니다.

| **이름**    | **설명**                                          | 
|-------------|----------------------------------------------------------|
| `binaries`  | 생성할 [바이너리](#binaries) 설정입니다.       |
| `cinterops` | [C 라이브러리와의 상호 운용성(interop)](#cinterops) 설정입니다. |

#### 바이너리 (Binaries)

다음과 같은 종류의 바이너리가 있습니다.

| **이름**     | **설명**        | 
|--------------|------------------------|
| `executable` | 프로덕션 실행 파일입니다.    |
| `test`       | 테스트 실행 파일입니다.       |
| `sharedLib`  | 공유 라이브러리입니다.       |
| `staticLib`  | 정적 라이브러리입니다.       |
| `framework`  | Objective-C 프레임워크입니다. |

```kotlin
kotlin {
    linuxX64 { // 본인의 타겟으로 교체하세요.
        binaries {
            executable {
                // 바이너리 설정.
            }
        }
    }
}
```

바이너리 설정을 위해 다음 파라미터를 사용할 수 있습니다.

| **이름**             | **설명**                                                                                                                                                                                                                                              | 
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compilation`        | 바이너리가 빌드되는 컴파일 단위입니다. 기본적으로 `test` 바이너리는 `test` 컴파일을 기반으로 하며, 다른 바이너리는 `main` 컴파일을 기반으로 합니다.                                                                                            |
| `linkerOpts`         | 바이너리 빌드 중 시스템 링커에 전달되는 옵션입니다.                                                                                                                                                                                                    |
| `baseName`           | 출력 파일의 커스텀 기본 이름입니다. 최종 파일 이름은 이 기본 이름에 시스템 종속적인 접두사와 접미사를 추가하여 형성됩니다.                                                                                                                    |
| `entryPoint`         | 실행 바이너리의 진입점 함수입니다. 기본적으로 루트 패키지의 `main()`입니다.                                                                                                                                                             |
| `outputFile`         | 출력 파일에 대한 액세스를 제공합니다.                                                                                                                                                                                                                                   |
| `linkTask`           | 링크 태스크에 대한 액세스를 제공합니다.                                                                                                                                                                                                                                     |
| `runTask`            | 실행 바이너리의 실행 태스크에 대한 액세스를 제공합니다. `linuxX64`, `macosArm64`, `mingwX64` 이외의 타겟에서는 값이 `null`입니다.                                                                                                                            |
| `isStatic`           | Objective-C 프레임워크용입니다. 동적 라이브러리 대신 정적 라이브러리를 포함합니다.                                                                                                                                                                              |
| `disableNativeCache` | <p>컴파일 캐시를 비활성화합니다. 컴파일 시간이 늘어나므로 예외적인 경우에만 사용하세요.</p><p>캐시가 비활성화된 Kotlin `version`과 `reason`이 반드시 포함되어야 합니다. 선택적으로 버그 트래커의 `issue` URL을 지정할 수 있습니다.</p> |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("my_executable", listOf(RELEASE)) {
        // test 컴파일을 기반으로 바이너리 빌드.
        compilation = compilations["test"]

        // 링커를 위한 커스텀 커맨드 라인 옵션.
        linkerOpts = mutableListOf("-L/lib/search/path", "-L/another/search/path", "-lmylib")

        // 출력 파일의 기본 이름.
        baseName = "foo"

        // 커스텀 진입점 함수.
        entryPoint = "org.example.main"

        // 출력 파일 액세스.
        println("Executable path: ${outputFile.absolutePath}")

        // 링크 태스크 액세스.
        linkTask.dependsOn(additionalPreprocessingTask)

        // 실행 태스크 액세스.
        // 호스트 플랫폼이 아닌 경우 runTask는 null입니다.
        runTask?.dependsOn(prepareForRun)
    }

    framework("my_framework" listOf(RELEASE)) {
        // 프레임워크에 동적 라이브러리 대신 정적 라이브러리 포함.
        isStatic = true

        // 이 바이너리에 대한 컴파일 캐시 비활성화
        disableNativeCache(
            version = DisableCacheInKotlinVersion.2_3_0,
            reason = "Cache bug",
            issue = URI("https://youtrack.com/YY-1111")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('my_executable', [RELEASE]) {
        // test 컴파일을 기반으로 바이너리 빌드.
        compilation = compilations.test

        // 링커를 위한 커스텀 커맨드 라인 옵션.
        linkerOpts = ['-L/lib/search/path', '-L/another/search/path', '-lmylib']

        // 출력 파일의 기본 이름.
        baseName = 'foo'

        // 커스텀 진입점 함수.
        entryPoint = 'org.example.main'

        // 출력 파일 액세스.
        println("Executable path: ${outputFile.absolutePath}")

        // 링크 태스크 액세스.
        linkTask.dependsOn(additionalPreprocessingTask)

        // 실행 태스크 액세스.
        // 호스트 플랫폼이 아닌 경우 runTask는 null입니다.
        runTask?.dependsOn(prepareForRun)
    }

    framework('my_framework' [RELEASE]) {
        // 프레임워크에 동적 라이브러리 대신 정적 라이브러리 포함.
        isStatic = true

        // 이 바이너리에 대한 컴파일 캐시 비활성화
        disableNativeCache(
            version = DisableCacheInKotlinVersion .2_3_0,
            reason = 'Cache bug',
            issue = URI('https://youtrack.com/YY-1111')
        )
    }
}
```

</TabItem>
</Tabs>

[네이티브 바이너리 빌드](multiplatform-build-native-binaries.md)에 대해 더 자세히 알아보세요.

#### Cinterops

`cinterops`는 네이티브 라이브러리와의 상호 운용을 위한 설정 모음입니다.
라이브러리와의 상호 운용성을 제공하려면 `cinterops`에 항목을 추가하고 해당 파라미터를 정의하세요.

| **이름**         | **설명**                                       | 
|------------------|-------------------------------------------------------|
| `definitionFile` | 네이티브 API를 설명하는 `.def` 파일입니다.            |
| `packageName`    | 생성된 Kotlin API의 패키지 접두사입니다.          |
| `compilerOpts`   | cinterop 도구에 의해 컴파일러에 전달될 옵션입니다. |
| `includeDirs`    | 헤더를 찾을 디렉토리입니다.                      |
| `header`         | 바인딩에 포함될 헤더입니다.                |
| `headers`        | 바인딩에 포함될 헤더 목록입니다.   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // 필요한 타겟으로 교체하세요.
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // 네이티브 API를 설명하는 정의 파일.
                // 기본 경로는 src/nativeInterop/cinterop/<interop-name>.def 입니다.
                definitionFile.set(project.file("def-file.def"))

                // 생성된 Kotlin API를 배치할 패키지.
                packageName("org.sample")

                // cinterop 도구에 의해 컴파일러에 전달될 옵션.
                compilerOpts("-Ipath/to/headers")

                // 헤더 검색 디렉토리 (-I<path> 컴파일러 옵션과 유사함).
                includeDirs.allHeaders("path1", "path2")

                // includeDirs.allHeaders의 축약형.
                includeDirs("include/directory", "another/directory")

                // 바인딩에 포함될 헤더 파일들.
                header("path/to/header.h")
                headers("path/to/header1.h", "path/to/header2.h")
            }

            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // 필요한 타겟으로 교체하세요.
        compilations.main {
            cinterops {
                myInterop {
                    // 네이티브 API를 설명하는 정의 파일.
                    // 기본 경로는 src/nativeInterop/cinterop/<interop-name>.def 입니다.
                    definitionFile = project.file("def-file.def")

                    // 생성된 Kotlin API를 배치할 패키지.
                    packageName 'org.sample'

                    // cinterop 도구에 의해 컴파일러에 전달될 옵션.
                    compilerOpts '-Ipath/to/headers'

                    // 헤더 검색 디렉토리 (-I<path> 컴파일러 옵션과 유사함).
                    includeDirs.allHeaders("path1", "path2")

                    // includeDirs.allHeaders의 축약형.
                    includeDirs("include/directory", "another/directory")

                    // 바인딩에 포함될 헤더 파일들.
                    header("path/to/header.h")
                    headers("path/to/header1.h", "path/to/header2.h")
                }

                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</TabItem>
</Tabs>

더 많은 cinterop 속성은 [정의 파일(Definition file)](https://kotlinlang.org/docs/native-definition-file.html#properties)을 참조하세요.

### Android 타겟

Kotlin 멀티플랫폼 Gradle 플러그인에는 Android 타겟의 [빌드 변환(Build variants)](https://developer.android.com/studio/build/build-variants) 구성을 도와주는 특정 함수가 있습니다.

| **이름**                      | **설명**                                                                                                                                      | 
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `publishLibraryVariants()`    | 배포할 빌드 변환을 지정합니다. [Android 라이브러리 배포](multiplatform-publish-lib-setup.md#publish-an-android-library)에 대해 더 자세히 알아보세요. |

```kotlin
kotlin {
    android {
        publishLibraryVariants("release")
    }
}
```

[Android용 컴파일](multiplatform-configure-compilations.md#compilation-for-android)에 대해 더 자세히 알아보세요.

> `kotlin {}` 블록 내부의 `android` 구성은 Android 프로젝트의 빌드 구성을 대체하지 않습니다.
> Android 프로젝트용 빌드 스크립트 작성에 대한 자세한 내용은 [Android 개발자 문서](https://developer.android.com/studio/build)를 참조하세요.
>
{style="note"}

## 소스 세트

`sourceSets {}` 블록은 프로젝트의 소스 세트를 설명합니다. 소스 세트에는 함께 컴파일되는 Kotlin 소스 파일과 해당 리소스 및 의존성이 포함됩니다.

멀티플랫폼 프로젝트에는 타겟에 대한 [사전 정의된 소스 세트](#predefined-source-sets)가 포함되어 있으며, 개발자는 필요에 따라 [커스텀 소스 세트](#custom-source-sets)를 생성할 수도 있습니다.

### 사전 정의된 소스 세트

사전 정의된 소스 세트는 멀티플랫폼 프로젝트 생성 시 자동으로 설정됩니다.
사용 가능한 사전 정의된 소스 세트는 다음과 같습니다.

| **이름**                                    | **설명**                                                                                                                                                                                               | 
|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commonMain`                                | 모든 플랫폼 간에 공유되는 코드 및 리소스입니다. 모든 멀티플랫폼 프로젝트에서 사용할 수 있습니다. 프로젝트의 모든 메인 [컴파일](#compilations)에 사용됩니다.                                                        |
| `commonTest`                                | 모든 플랫폼 간에 공유되는 테스트 코드 및 리소스입니다. 모든 멀티플랫폼 프로젝트에서 사용할 수 있습니다. 프로젝트의 모든 테스트 컴파일에 사용됩니다.                                                                    |
| _&lt;targetName&gt;&lt;compilationName&gt;_ | 컴파일을 위한 타겟별 소스입니다. _&lt;targetName&gt;_은 사전 정의된 타겟의 이름이고 _&lt;compilationName&gt;_은 이 타겟에 대한 컴파일의 이름입니다. 예: `jsTest`, `jvmMain`. |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain { /* ... */ }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        commonMain { /* ... */ }
    }
}
```

</TabItem>
</Tabs>

[소스 세트](multiplatform-discover-project.md#source-sets)에 대해 더 자세히 알아보세요.

### 커스텀 소스 세트

커스텀 소스 세트는 프로젝트 개발자가 수동으로 생성합니다.
커스텀 소스 세트를 생성하려면 `sourceSets` 섹션 내부에 해당 이름으로 섹션을 추가하세요.
Kotlin Gradle DSL을 사용하는 경우 커스텀 소스 세트를 `by creating`으로 표시하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets { 
        val myMain by creating { /* ... */ } // 'myMain'이라는 이름의 새 소스 세트 생성
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        myMain { /* ... */ } // 'myMain'이라는 이름의 소스 세트 생성 또는 구성
    }
}
```

</TabItem>
</Tabs>

새로 생성된 소스 세트는 다른 소스 세트와 연결되어 있지 않습니다. 프로젝트의 컴파일에서 이를 사용하려면 [다른 소스 세트와 연결](multiplatform-hierarchy.md#manual-configuration)해야 합니다.

### 소스 세트 파라미터

소스 세트 구성은 `sourceSets {}`의 해당 블록 내에 저장됩니다. 소스 세트에는 다음과 같은 파라미터가 있습니다.

| **이름**           | **설명**                                                                        | 
|--------------------|----------------------------------------------------------------------------------------|
| `kotlin.srcDir`    | 소스 세트 디렉토리 내 Kotlin 소스 파일의 위치입니다.                       |
| `resources.srcDir` | 소스 세트 디렉토리 내 리소스의 위치입니다.                                 |
| `dependsOn`        | [다른 소스 세트와의 연결](multiplatform-hierarchy.md#manual-configuration)입니다. |
| `dependencies`     | 소스 세트의 [의존성](#dependencies)입니다.                                       |
| `languageSettings` | 공유 소스 세트에 적용된 [언어 설정](#language-settings)입니다.              |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    //...
    sourceSets { 
        commonMain {
            kotlin.srcDir("src")
            resources.srcDir("res")

            dependencies {
                /* ... */
            }
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
            kotlin.srcDir('src')
            resources.srcDir('res')

            dependencies {
                /* ... */
            }
        }
    }
}
``` 

</TabItem>
</Tabs>

## 컴파일 (Compilations)

타겟은 프로덕션용 또는 테스트용과 같이 하나 이상의 컴파일 단위를 가질 수 있습니다. 타겟 생성 시 자동으로 추가되는 [사전 정의된 컴파일](#predefined-compilations)이 있습니다. 추가로 [커스텀 컴파일](#custom-compilations)을 생성할 수 있습니다.

타겟의 모든 또는 특정 컴파일을 참조하려면 `compilations` 객체 컬렉션을 사용하세요. `compilations`에서 이름으로 컴파일을 참조할 수 있습니다.

[컴파일 구성](multiplatform-configure-compilations.md)에 대해 더 자세히 알아보세요.

### 사전 정의된 컴파일

사전 정의된 컴파일은 Android 타겟을 제외한 프로젝트의 각 타겟에 대해 자동으로 생성됩니다.
사용 가능한 사전 정의된 컴파일은 다음과 같습니다.

| **이름** | **설명**                     | 
|----------|-------------------------------------|
| `main`   | 프로덕션 소스용 컴파일입니다. |
| `test`   | 테스트용 컴파일입니다.              |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            output // main 컴파일 출력 가져오기
        }

        compilations["test"].runtimeDependencyFiles // test 런타임 클래스패스 가져오기
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.output // main 컴파일 출력 가져오기
        compilations.test.runtimeDependencyFiles // test 런타임 클래스패스 가져오기
    }
}
```

</TabItem>
</Tabs>

### 커스텀 컴파일

사전 정의된 컴파일 외에도 자신만의 커스텀 컴파일을 생성할 수 있습니다.
이를 위해 새 컴파일과 `main` 컴파일 사이에 [`associateWith`](https://kotlinlang.org/docs/gradle-configure-project.html#associate-compiler-tasks) 관계를 설정하세요. Kotlin Gradle DSL을 사용하는 경우 커스텀 컴파일을 `by creating`으로 표시하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations {
            val main by getting
            val integrationTest by creating {
                // main과 그 클래스패스를 의존성으로 가져오고 internal 가시성 설정
                associateWith(main)
                defaultSourceSet {
                    dependencies {
                        implementation(kotlin("test-junit"))
                        /* ... */
                    }
                }

                // 이 컴파일에서 생성된 테스트를 실행하기 위한 테스트 태스크 생성
                testRuns.create("integration") {
                    // 테스트 태스크 구성
                    setExecutionSourceFrom(integrationTest)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.create('integrationTest') {
            def main = compilations.main
            // main과 그 클래스패스를 의존성으로 가져오고 internal 가시성 설정
            associateWith(main)
            defaultSourceSet {
                dependencies {
                    implementation kotlin('test-junit')
                    /* ... */
                }
            }

            // 이 컴파일에서 생성된 테스트를 실행하기 위한 테스트 태스크 생성
            testRuns.create('integration') {
                // 테스트 태스크 구성
                setExecutionSourceFrom(compilations.integrationTest)
            }
        }
    }
}
```

</TabItem>
</Tabs>

컴파일을 연관시키면(associating) 메인 컴파일 출력이 의존성으로 추가되고 컴파일 간에 `internal` 가시성이 설정됩니다.

[커스텀 컴파일 생성](multiplatform-configure-compilations.md#create-a-custom-compilation)에 대해 더 자세히 알아보세요.

### 컴파일 파라미터

컴파일에는 다음과 같은 파라미터가 있습니다.

| **이름**                 | **설명**                                                                                                                                                           | 
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `defaultSourceSet`       | 컴파일의 기본 소스 세트입니다.                                                                                                                                     |
| `kotlinSourceSets`       | 컴파일에 참여하는 소스 세트입니다.                                                                                                                             |
| `allKotlinSourceSets`    | 컴파일에 참여하는 소스 세트 및 `dependsOn()`을 통한 해당 연결 세트입니다.                                                                                     |
| `compilerOptions`        | 컴파일에 적용되는 컴파일러 옵션입니다. 사용 가능한 옵션 목록은 [컴파일러 옵션](https://kotlinlang.org/docs/gradle-compiler-options.html)을 참조하세요.         |
| `compileKotlinTask`      | Kotlin 소스 컴파일을 위한 Gradle 태스크입니다.                                                                                                                                 |
| `compileKotlinTaskName`  | `compileKotlinTask`의 이름입니다.                                                                                                                                              |
| `compileAllTaskName`     | 컴파일의 모든 소스를 컴파일하기 위한 Gradle 태스크 이름입니다.                                                                                                       |
| `output`                 | 컴파일 출력물입니다.                                                                                                                                                   |
| `compileDependencyFiles` | 컴파일 단위의 컴파일 타임 의존성 파일(클래스패스)입니다. 모든 Kotlin/Native 컴파일의 경우, 여기에는 표준 라이브러리 및 플랫폼 의존성이 자동으로 포함됩니다. |
| `runtimeDependencyFiles` | 컴파일 단위의 런타임 의존성 파일(클래스패스)입니다.                                                                                                                  |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    // 'main' 컴파일에 대한 Kotlin 컴파일러 옵션 설정:
                    jvmTarget.set(JvmTarget.JVM_1_8)
                }
            }
        
            compileKotlinTask // Kotlin 태스크 'compileKotlinJvm' 가져오기
            output // main 컴파일 출력 가져오기
        }
        
        compilations["test"].runtimeDependencyFiles // test 런타임 클래스패스 가져오기
    }

    // 모든 타겟의 모든 컴파일 구성:
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main {
            compileTaskProvider.configure {
                compilerOptions {
                    // 'main' 컴파일에 대한 Kotlin 컴파일러 옵션 설정:
                    jvmTarget = JvmTarget.JVM_1_8
                }
            }
        }

        compilations.main.compileKotlinTask // Kotlin 태스크 'compileKotlinJvm' 가져오기
        compilations.main.output // main 컴파일 출력 가져오기
        compilations.test.runtimeDependencyFiles // test 런타임 클래스패스 가져오기
    }

    // 모든 타겟의 모든 컴파일 구성:
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

## 컴파일러 옵션

프로젝트의 컴파일러 옵션을 세 가지 다른 수준에서 구성할 수 있습니다.

* **확장 수준 (Extension level)**: `kotlin {}` 블록 내부.
* **타겟 수준 (Target level)**: 타겟 블록 내부.
* **컴파일 단위 수준 (Compilation unit level)**: 일반적으로 특정 컴파일 태스크 내부.

![Kotlin 컴파일러 옵션 수준](compiler-options-levels.svg){width=700}

상위 수준의 설정은 하위 수준의 기본값으로 작동합니다.

* 확장 수준에서 설정된 컴파일러 옵션은 `commonMain`, `nativeMain`, `commonTest`와 같은 공유 소스 세트를 포함한 타겟 수준 옵션의 기본값이 됩니다.
* 타겟 수준에서 설정된 컴파일러 옵션은 `compileKotlinJvm`, `compileTestKotlinJvm` 태스크와 같은 컴파일 단위(태스크) 수준 옵션의 기본값이 됩니다.

하위 수준에서 수행된 구성은 상위 수준의 유사한 설정을 오버라이드합니다.

* 태스크 수준 컴파일러 옵션은 타겟 또는 확장 수준의 유사한 설정을 오버라이드합니다.
* 타겟 수준 컴파일러 옵션은 확장 수준의 유사한 설정을 오버라이드합니다.

가능한 컴파일러 옵션 목록은 [모든 컴파일러 옵션](https://kotlinlang.org/docs/gradle-compiler-options.html#all-compiler-options)을 참조하세요.

### 확장 수준

프로젝트의 모든 타겟에 대해 컴파일러 옵션을 구성하려면 최상위 레벨에서 `compilerOptions {}` 블록을 사용하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    // 모든 타겟의 모든 컴파일을 구성합니다.
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    // 모든 타겟의 모든 컴파일을 구성합니다:
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

### 타겟 수준

프로젝트의 특정 타겟에 대해 컴파일러 옵션을 구성하려면 타겟 블록 내부에서 `compilerOptions {}` 블록을 사용하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        // JVM 타겟의 모든 컴파일을 구성합니다.
        compilerOptions {
            allWarningsAsErrors.set(true)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        // JVM 타겟의 모든 컴파일을 구성합니다.
        compilerOptions {
            allWarningsAsErrors = true
        }
    }
}
```

</TabItem>
</Tabs>

### 컴파일 단위 수준

특정 태스크에 대해 컴파일러 옵션을 구성하려면 태스크 내부에서 `compilerOptions {}` 블록을 사용하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

특정 컴파일에 대해 컴파일러 옵션을 구성하려면 해당 컴파일의 태스크 프로바이더 내에서 `compilerOptions {}` 블록을 사용하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 'main' 컴파일을 구성합니다:
                compilerOptions {
                    allWarningsAsErrors.set(true)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 'main' 컴파일을 구성합니다:
                compilerOptions {
                    allWarningsAsErrors = true
                }
            }
        }
    }
}
```

</TabItem>
</Tabs>

### `kotlinOptions {}`에서 `compilerOptions {}`로 마이그레이션 {collapsible="true"}

Kotlin 2.2.0 이전에는 `kotlinOptions {}` 블록을 사용하여 컴파일러 옵션을 구성할 수 있었습니다. Kotlin 2.2.0부터 `kotlinOptions {}` 블록은 지원 중단(deprecated)되었으므로 빌드 스크립트에서 대신 `compilerOptions {}` 블록을 사용해야 합니다. 자세한 정보는 [`kotlinOptions{}`에서 `compilerOptions{}`로 마이그레이션](https://kotlinlang.org/docs/gradle-compiler-options.html#migrate-from-kotlinoptions-to-compileroptions)을 참조하세요.

## 의존성

소스 세트 선언의 `dependencies {}` 블록은 해당 소스 세트의 의존성을 포함합니다.

[의존성 구성](https://kotlinlang.org/docs/gradle-configure-project.html)에 대해 더 자세히 알아보세요.

의존성에는 네 가지 유형이 있습니다.

| **이름**         | **설명**                                                                     | 
|------------------|-------------------------------------------------------------------------------------|
| `api`            | 현재 모듈의 API에 사용되는 의존성입니다.                                 |
| `implementation` | 모듈 내에서 사용되지만 외부로 노출되지 않는 의존성입니다.                         |
| `compileOnly`    | 현재 모듈의 컴파일에만 사용되는 의존성입니다.                       |
| `runtimeOnly`    | 런타임에는 사용 가능하지만 모듈 컴파일 중에는 보이지 않는 의존성입니다. |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                api("com.example:foo-metadata:1.0")
            }
        }
        jvmMain {
            dependencies {
                implementation("com.example:foo-jvm:1.0")
            }
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
                api 'com.example:foo-metadata:1.0'
            }
        }
        jvmMain {
            dependencies {
                implementation 'com.example:foo-jvm:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

추가로, 소스 세트는 서로 의존하여 계층 구조를 형성할 수 있습니다. 이 경우 [`dependsOn()`](#source-set-parameters) 관계가 사용됩니다.

### 최상위 레벨에서 의존성 구성
<primary-label ref="Experimental"/>

최상위 `dependencies {}` 블록을 사용하여 공통 의존성을 구성할 수 있습니다. 여기서 선언된 의존성은 `commonMain` 또는 `commonTest` 소스 세트에 추가된 것처럼 작동합니다.

최상위 `dependencies {}` 블록을 사용하려면 블록 앞에 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 어노테이션을 추가하여 옵트인해야 합니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</TabItem>
</Tabs>

해당 타겟의 `sourceSets {}` 블록 내부에 플랫폼별 의존성을 추가하세요.

이 기능에 대한 피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446)에서 공유할 수 있습니다.

## 언어 설정

소스 세트의 `languageSettings {}` 블록은 프로젝트 분석 및 컴파일의 특정 측면을 정의합니다. `languageSettings {}` 블록은 공유 소스 세트에 특별히 적용되는 설정을 구성할 때만 사용하세요. 그 외의 모든 경우에는 `compilerOptions {}` 블록을 사용하여 확장 또는 타겟 수준에서 [컴파일러 옵션을 구성](#compiler-options)하세요.

다음과 같은 언어 설정을 사용할 수 있습니다.

| **이름**                | **설명**                                                                                                                                                                 | 
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `languageVersion`       | 지정된 버전의 Kotlin과의 소스 호환성을 제공합니다.                                                                                                             |
| `apiVersion`            | 지정된 버전의 Kotlin 번들 라이브러리 선언만 사용할 수 있도록 허용합니다.                                                                                          |
| `enableLanguageFeature` | 지정된 언어 기능을 활성화합니다. 사용 가능한 값은 현재 실험적이거나 특정 시점에 실험적으로 도입되었던 언어 기능들에 해당합니다. |
| `optIn`                 | 지정된 [옵트인 어노테이션](https://kotlinlang.org/docs/opt-in-requirements.html)의 사용을 허용합니다.                                                                           |
| `progressiveMode`       | [점진적 모드(Progressive mode)](https://kotlinlang.org/docs/whatsnew13.html#progressive-mode)를 활성화합니다.                                                                                   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "%languageVersion%" // 가능한 값: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)
            apiVersion = "%apiVersion%" // 가능한 값: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)
            enableLanguageFeature("InlineClasses") // 언어 기능 이름
            optIn("kotlin.ExperimentalUnsignedTypes") // 어노테이션 정규화 이름(FQ-name)
            progressiveMode = true // 기본값은 false
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '%languageVersion%' // 가능한 값: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (EXPERIMENTAL)
            apiVersion = '%apiVersion%' // 가능한 값: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (EXPERIMENTAL)
            enableLanguageFeature('InlineClasses') // 언어 기능 이름
            optIn('kotlin.ExperimentalUnsignedTypes') // 어노테이션 정규화 이름(FQ-name)
            progressiveMode = true // 기본값은 false
        }
    }
}
```

</TabItem>
</Tabs>