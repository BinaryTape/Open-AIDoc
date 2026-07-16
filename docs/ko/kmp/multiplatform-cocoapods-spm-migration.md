[//]: # (title: Kotlin 멀티플랫폼 프로젝트를 CocoaPods에서 SwiftPM 의존성으로 전환하기)
<primary-label ref="Experimental"/>

<tldr>

* CocoaPods Gradle 플러그인에서 SwiftPM으로 전환하려면 먼저 Xcode 프로젝트를 재구성해야 합니다.
* `main` 브랜치에서는 CocoaPods를 사용하고 `spm-import` 브랜치에서는 SwiftPM을 사용하는 다음 샘플 프로젝트들을 확인해 보세요:
  * [Firebase 샘플](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)
  * [Compose Multiplatform 샘플](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/)

</tldr>

CocoaPods 의존성이 있는 KMP 모듈이 있고, [SwiftPM import](multiplatform-spm-import.md)를 사용하여 Swift 패키지로 전환하려는 경우 다음 단계를 따르세요:

1. [빌드 스크립트를 업데이트하여 SwiftPM 의존성 및 해당 설정을 포함합니다](#update-your-build-script)
2. [SwiftPM import 툴링의 도움을 받아 직접 통합(direct integration)을 사용하도록 Xcode 프로젝트를 재구성합니다](#reconfigure-your-xcode-project)
3. [프로젝트 구조에 따라 CocoaPods 통합을 완전히 또는 부분적으로 비활성화합니다](#remove-the-cocoapods-kmp-integration)

> [준비된 스킬(prepared skill)](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)을 사용하여 원하는 AI 에이전트에게 CocoaPods에서 SwiftPM으로의 마이그레이션을 맡길 수 있습니다.
> AI 처리 결과는 완전히 예측 가능하지 않을 수 있다는 점에 유의하세요.
>
{style="note"}

## 빌드 스크립트 업데이트

빌드를 업데이트하려면 SwiftPM import 페이지의 지침을 따르세요:

1. [Kotlin 멀티플랫폼 Gradle 플러그인 버전을 **%kotlinEapVersion%**으로 변경합니다](multiplatform-spm-import.md#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [CocoaPods 플러그인을 비활성화하거나 CocoaPods 의존성을 제거하지 않은 상태에서 필요한 SwiftPM 의존성을 지정합니다](multiplatform-spm-import.md#add-and-use-swiftpm-dependencies)

예를 들어, `FirebaseAnalytics` 팟(pod)을 사용하는 경우:

1. Kotlin 멀티플랫폼 Gradle 플러그인이 **%kotlinEapVersion%** 버전을 사용하도록 설정되어 있는지 확인합니다.
2. `FirebaseAnalytics` Swift 패키지를 `swiftPMDependencies {}` 블록에 추가합니다:

   ```kotlin
   // projectDir/sharedLogic/build.gradle.kts
   kotlin {
       swiftPMDependencies {
          swiftPackage(
              url = url("https://github.com/firebase/firebase-ios-sdk.git"),
              version = from("12.5.0"),
              products = listOf(product("FirebaseAnalytics")),
          )
       }

       cocoapods {
           // ...

           pod("FirebaseAnalytics") {
           version = "12.5.0"
           // ...
           }
       }
   }
   ```

3. **Sync Project with Gradle Files** 액션을 실행하여 Swift 패키지에서 API를 가져옵니다.
4. Swift 패키지에서 가져온 API를 사용하도록 코드를 업데이트합니다.
   팟과 해당 Swift 패키지가 정확히 동일한 API를 제공한다면, 다음과 같이 Kotlin import 지시문만 업데이트하면 됩니다:

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            import cocoapods.FirebaseAnalytics.FIRAnalytics"></code-block>
        <code-block lang="kotlin" code="            import swiftPMImport.org.example.package.FIRAnalytics"></code-block>
    </compare>

5. 빌드 스크립트에서 `cocoapods.framework {}` 블록을 사용 중이라면, 해당 설정을 `binaries.framework {}` 블록으로 이동하세요. 예시:

   <compare type="left-right">
   <code-block lang="kotlin" code="   kotlin {&#10;       iosArm64()&#10;       iosSimulatorArm64()&#10;       iosX64()&#10;&#10;       cocoapods {&#10;           framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   <code-block lang="kotlin" code="   kotlin {&#10;       listOf(&#10;           iosArm64(),&#10;           iosSimulatorArm64(),&#10;           iosX64(),&#10;       ).forEach { iosTarget -&gt;&#10;           iosTarget.binaries.framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   </compare>

## Xcode 프로젝트 재구성

CocoaPods Gradle 플러그인(`kotlin("native.cocoapods")`)을 사용 중인 경우, SwiftPM으로 전환하기 전에 Xcode 프로젝트가 [직접 통합(direct integration)](multiplatform-direct-integration.md)을 사용하도록 재구성해야 합니다. SwiftPM import 툴링은 `.xcodeproj` 파일에 필요한 변경 사항을 적용하기 위한 쉘 명령을 생성할 수 있습니다.

1. Xcode에서 프로젝트를 엽니다 (IntelliJ IDEA에서 **File** | **Open Project in Xcode** 선택).
2. Xcode에서 프로젝트를 빌드합니다 (**Product** | **Build**). 빌드는 실패하겠지만, 빌드 오류에 필요한 명령이 포함되어 있습니다.
3. Xcode에서 빌드 오류를 보려면 **View** | **Navigators** | **Report**를 선택한 다음, 상단 필터에서 **Errors Only**를 선택합니다.
   명령은 다음과 같은 형태이며 프로젝트의 올바른 경로를 포함하고 있습니다:

   ```text
   XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' GRADLE_PROJECT_PATH=':kotlin-library' '/path/to/project/gradlew' -p '/path/to/project' ':kotlin-library:integrateEmbedAndSign' ':kotlin-library:integrateLinkagePackage'
   ```

   > Xcode를 열지 않고 터미널에서 프로젝트를 빌드하여 동일한 명령을 생성할 수 있습니다.
   > `/path/to/project/iosApp` 디렉토리에서 다음 명령을 실행하세요:
   > 
   > ```shell
   > xcodebuild -scheme "$(echo -n *.xcworkspace | python3 -c 'import sys, json; from subprocess import check_output; print(list(set(json.loads(check_output(["xcodebuild", "-workspace", sys.stdin.readline(), "-list", "-json"]))["workspace"]["schemes"]) - set(json.loads(check_output(["xcodebuild", "-project", "Pods/Pods.xcodeproj", "-list", "-json"]))["project"]["schemes"]))[0])')" -workspace *.xcworkspace -destination 'generic/platform=iOS Simulator' ARCHS=arm64 | grep -A5 'What went wrong'
   > ```
   {style="note"}

    마지막의 `grep` 호출은 특정 오류 메시지와 실행해야 할 명령을 찾아줍니다.

4. `/path/to/project/iosApp` 디렉토리에서 생성된 명령을 터미널에 실행합니다.
   이 명령은 `iosApp` 프로젝트의 `.xcodeproj` 파일을 수정하여 빌드 중에 `embedAndSignAppleFrameworkForXcode` 태스크가 트리거되도록 하며, 이는 iOS 빌드 과정에 코틀린 멀티플랫폼 컴파일 단계를 삽입합니다.
5. IntelliJ IDEA에서 **Tools** | **Swift Package Manager** | **Resolve Dependencies**를 선택하여 `build.gradle.kts` 파일에 선언된 SwiftPM 의존성을 해결합니다.

이제 iOS 앱이 SwiftPM 의존성을 사용합니다. CocoaPods 플러그인을 비활성화하고 팟(pod) 통합을 해제할 수 있습니다.

## CocoaPods KMP 통합 제거

모든 CocoaPods 의존성을 Swift 패키지로 교체했다면, 이제 `/path/to/project/iosApp` 디렉토리에서 다음 명령을 실행하여 팟 통합을 해제할 수 있습니다:

```shell
pod deintegrate
```

SwiftPM 의존성과 겹치지 않는 의존성을 위해 CocoaPods를 계속 사용하려는 경우, `Podfile`을 편집하여 KMP 모듈을 언급하는 라인만 제거한 다음 `pod install`을 실행하세요. 예시:

```shell
target 'iosApp' do
    # 여기서 'sharedLogic'은 공유 코드 모듈의 이름입니다.
    # 이 라인을 제거하고 'pod install'을 다시 실행하세요.
    pod 'sharedLogic', :path => '../sharedLogic'
    ...
end
```

마지막으로, Gradle 빌드 설정에서 CocoaPods 관련 언급을 제거합니다:

1. 모든 의존성이 이제 SwiftPM import 툴링에 의해 관리되므로, 공유 코드 모듈의 `build.gradle.kts` 파일에서 `cocoapods {}` 블록 전체를 제거합니다.
2. 프로젝트가 더 이상 CocoaPods에 의존하지 않는다면, 루트 `build.gradle.kts` 파일과 공유 모듈의 `build.gradle.kts` 파일 모두의 `plugins {}` 블록에서 CocoaPods Gradle 플러그인 참조를 제거합니다.