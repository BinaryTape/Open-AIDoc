[//]: # (title: CocoaPods Gradle 플러그인 DSL 레퍼런스)

<tldr>

* Pod 의존성을 추가하기 전에, [초기 설정](multiplatform-cocoapods-overview.md#set-up-an-environment-to-work-with-cocoapods)을 완료하세요.
* Kotlin 프로젝트에 [다양한 Pod 의존성이 설정된](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample) 샘플 프로젝트를 확인해 보세요.
* [여러 타겟을 가진 Xcode 프로젝트가 Kotlin 라이브러리에 의존하는](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample) 샘플 프로젝트를 확인해 보세요.

</tldr>
<show-structure for="chapter,procedure" depth="2"/>

Kotlin CocoaPods Gradle 플러그인은 Podspec 파일을 생성하기 위한 도구입니다. 이 파일들은 Kotlin 프로젝트를 [CocoaPods 의존성 관리자](https://cocoapods.org/)와 통합하는 데 필요합니다.

이 DSL 레퍼런스에서는 CocoaPods 통합을 설정할 때 사용할 수 있는 Kotlin CocoaPods Gradle 플러그인의 주요 블록, 함수 및 프로퍼티를 나열합니다.

## 플러그인 활성화

CocoaPods 플러그인을 적용하려면 `build.gradle(.kts)` 파일에 다음 라인을 추가하세요.

```kotlin
plugins {
   kotlin("multiplatform") version "%kotlinVersion%"
   kotlin("native.cocoapods") version "%kotlinVersion%"
}
```

플러그인 버전은 [Kotlin 릴리스 버전](https://kotlinlang.org/docs/releases.html)과 일치합니다. 최신 안정화 버전은 %kotlinVersion%입니다.

## `cocoapods {}` 블록

`cocoapods {}` 블록은 CocoaPods 설정을 위한 최상위 블록입니다. 여기에는 Pod 버전, 요약(summary), 홈페이지와 같은 필수 정보뿐만 아니라 선택적 기능 등 Pod에 대한 일반적인 정보가 포함됩니다.

블록 내부에서 다음 블록, 함수 및 프로퍼티를 사용할 수 있습니다.

| **이름**                              | **설명**                                                                                                                                                                                                                  | 
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`                             | Pod의 버전입니다. 지정되지 않으면 Gradle 프로젝트 버전이 사용됩니다. 두 프로퍼티 모두 설정되지 않으면 에러가 발생합니다.                                                                             |
| `summary`                             | 이 프로젝트에서 빌드된 Pod에 대한 필수 설명입니다.                                                                                                                                                                       |
| `homepage`                            | 이 프로젝트에서 빌드된 Pod의 홈페이지에 대한 필수 링크입니다.                                                                                                                                                              |
| `authors`                             | 이 프로젝트에서 빌드된 Pod의 작성자를 지정합니다.                                                                                                                                                                            |
| `podfile`                             | 기존 Podfile을 설정합니다.                                                                                                                                                                                                 |
| `noPodspec()`                         | `cocoapods` 섹션에 대해 Podspec 파일을 생성하지 않도록 플러그인을 설정합니다.                                                                                                                                                    |
| `name`                                | 이 프로젝트에서 빌드된 Pod의 이름입니다. 제공되지 않으면 프로젝트 이름이 사용됩니다.                                                                                                                                          |
| `license`                             | 이 프로젝트에서 빌드된 Pod의 라이선스, 유형 및 텍스트입니다.                                                                                                                                                          |
| `framework`                           | 플러그인에 의해 생성된 프레임워크를 설정하는 프레임워크 블록입니다.                                                                                                                                                             |
| `source`                              | 이 프로젝트에서 빌드된 Pod의 위치입니다.                                                                                                                                                                                 |
| `extraSpecAttributes`                 | `libraries` 또는 `vendored_frameworks`와 같은 다른 Podspec 속성을 설정합니다.                                                                                                                                                   |
| `xcodeConfigurationToNativeBuildType` | 커스텀 Xcode 구성을 NativeBuildType으로 매핑합니다: "Debug"를 `NativeBuildType.DEBUG`로, "Release"를 `NativeBuildType.RELEASE`로 매핑합니다.                                                                                               |
| `publishDir`                          | Pod 게시를 위한 출력 디렉토리를 설정합니다.                                                                                                                                                                              |
| `pods`                                | Pod 의존성 목록을 반환합니다.                                                                                                                                                                                              |
| `pod()`                               | 이 프로젝트에서 빌드된 Pod에 CocoaPods 의존성을 추가합니다.                                                                                                                                                                  |
| `specRepos`                           | `url()`을 사용하여 사양 저장소(specification repository)를 추가합니다. 이는 비공개 Pod을 의존성으로 사용할 때 필요합니다. 자세한 내용은 [CocoaPods 문서](https://guides.cocoapods.org/making/private-cocoapods.html)를 참조하세요. |

### 타겟

| iOS                 | macOS        | tvOS                 | watchOS                 |
|---------------------|--------------|----------------------|-------------------------|
| `iosArm64`          | `macosArm64` | `tvosArm64`          | `watchosArm64`          |
| `iosSimulatorArm64` |              | `tvosSimulatorArm64` | `watchosSimulatorArm64` |
| `iosX64`            |              |                      | `watchosArm32`          |
|                     |              |                      | `watchosDeviceArm64`    |

각 타겟에 대해 `deploymentTarget` 프로퍼티를 사용하여 Pod 라이브러리의 최소 타겟 버전을 지정하세요.

플러그인이 적용되면 CocoaPods는 모든 타겟에 대해 `debug` 및 `release` 프레임워크를 출력 바이너리로 추가합니다.

```kotlin
kotlin {
    iosArm64()
   
    cocoapods {
        version = "2.0"
        name = "MyCocoaPod"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        license = "{ :type => 'MIT', :text => 'License text'}"
        source = "{ :git => 'git@github.com:vkormushkin/kmmpodlibrary.git', :tag => '$version' }"
        authors = "Kotlin Dev"
        
        specRepos {
            url("https://github.com/Kotlin/kotlin-cocoapods-spec.git")
        }
        pod("example")
        
        xcodeConfigurationToNativeBuildType["CUSTOM_RELEASE"] = NativeBuildType.RELEASE
   }
}
```

### `framework {}` 블록

`framework {}` 블록은 `cocoapods` 내부에 중첩되며, 프로젝트에서 빌드된 Pod의 프레임워크 속성을 설정합니다.

> `baseName`은 필수 필드임에 유의하세요.
>
{style="note"}

| **이름**           | **설명**                                                                         | 
|--------------------|-----------------------------------------------------------------------------------------|
| `baseName`         | 필수 프레임워크 이름입니다. 더 이상 사용되지 않는 `frameworkName` 대신 이 프로퍼티를 사용하세요. |
| `isStatic`         | 프레임워크 링킹 유형을 정의합니다. 기본값은 dynamic(동적)입니다.                            |
| `transitiveExport` | 의존성 내보내기(export)를 활성화합니다.                                                              |                                                      

```kotlin
kotlin {
    cocoapods {
        version = "2.0"
        framework {
            baseName = "MyFramework"
            isStatic = false
            export(project(":anotherKMMModule"))
            transitiveExport = true
        }
    }
}
```

## `pod()` 함수

`pod()` 함수 호출은 프로젝트에서 빌드된 Pod에 CocoaPods 의존성을 추가합니다. 각 의존성마다 별도의 함수 호출이 필요합니다.

함수 파라미터에 Pod 라이브러리의 이름을 지정하고, 설정 블록에서 라이브러리의 `version` 및 `source`와 같은 추가 파라미터 값을 지정할 수 있습니다.

| **이름**                     | **설명**                                                                                                                                                                                                                                                                                    | 
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`                    | 라이브러리 버전입니다. 최신 버전을 사용하려면 파라미터를 생략하세요.                                                                                                                                                                                                                 |
| `source`                     | 다음에서 Pod을 설정합니다: <list><li>`git()`을 사용하는 Git 저장소. `git()` 뒤의 블록에서 특정 커밋을 사용하기 위한 `commit`, 특정 태그를 위한 `tag`, 특정 브랜치를 위한 `branch`를 지정할 수 있습니다.</li><li>`path()`를 사용하는 로컬 저장소</li></list> |
| `packageName`                | 패키지 이름을 지정합니다.                                                                                                                                                                                                                                                                        |
| `extraOpts`                  | Pod 라이브러리에 대한 옵션 목록을 지정합니다. 예를 들어, 특정 플래그: <code-block lang="Kotlin" code="extraOpts = listOf(&quot;-compiler-option&quot;)"></code-block>                                                                                                                                        |
| `linkOnly`                   | CocoaPods 플러그인이 cinterop 바인딩을 생성하지 않고 동적 프레임워크가 있는 Pod 의존성을 사용하도록 지시합니다. 정적 프레임워크와 함께 사용하면 이 옵션은 Pod 의존성을 완전히 제거합니다.                                                                                           |
| `interopBindingDependencies` | 다른 Pod에 대한 의존성 목록을 포함합니다. 이 목록은 새로운 Pod에 대한 Kotlin 바인딩을 빌드할 때 사용됩니다.                                                                                                                                                                                   |
| `useInteropBindingFrom()`    | 의존성으로 사용되는 기존 Pod의 이름을 지정합니다. 이 Pod은 함수 실행 전에 선언되어야 합니다. 이 함수는 새 Pod에 대한 바인딩을 빌드할 때 기존 Pod의 Kotlin 바인딩을 사용하도록 CocoaPods 플러그인에 지시합니다.                                     |

```kotlin
kotlin {
    iosArm64()
    
    cocoapods {
        version = "2.0"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        ios.deploymentTarget = "16.0"
      
        pod("pod_dependency") {
            version = "1.0"
            extraOpts += listOf("-compiler-option")
            linkOnly = true
            source = path(project.file("../pod_dependency"))
        }
    }
}
```

## 다음 단계

* [Kotlin Gradle 플러그인 저장소에서 Kotlin DSL의 전체 구문 확인하기](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/targets/native/cocoapods/CocoapodsExtension.kt)
* [Kotlin 프로젝트에 Pod 라이브러리 의존성 추가하기](multiplatform-cocoapods-libraries.md)
* [Kotlin 프로젝트와 Xcode 프로젝트 간의 의존성 설정하기](multiplatform-cocoapods-xcode.md)