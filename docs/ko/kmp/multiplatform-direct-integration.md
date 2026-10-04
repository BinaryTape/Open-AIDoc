[//]: # (title: 직접 연동)

<tldr>
   이 방식은 로컬 연동 방식입니다. 다음과 같은 경우에 적합합니다:<br/>

   * 로컬 머신에 iOS를 타깃으로 하는 Kotlin Multiplatform 프로젝트가 이미 설정되어 있는 경우.
   * Kotlin Multiplatform 프로젝트에 CocoaPods 의존성이 없는 경우.<br/>

   [자신에게 가장 적합한 연동 방식 선택하기](multiplatform-ios-integration-overview.md)
</tldr>

Kotlin Multiplatform 프로젝트와 iOS 프로젝트 간에 코드를 공유하여 동시에 개발하려는 경우, 특수 스크립트를 사용하여 직접 연동을 설정할 수 있습니다.

이 스크립트는 Xcode에서 Kotlin 프레임워크를 iOS 프로젝트에 연결하는 과정을 자동화합니다:

![Direct integration diagram](direct-integration-scheme.svg){width=700}

이 스크립트는 Xcode 환경을 위해 특별히 설계된 `embedAndSignAppleFrameworkForXcode` Gradle 태스크를 사용합니다. 설정 과정에서 iOS 앱 빌드의 Run Script 단계에 이 태스크를 추가합니다. 이후 iOS 앱 빌드가 실행되기 전에 Kotlin 아티팩트가 빌드되어 Derived Data에 포함됩니다.

일반적으로 이 스크립트는 다음 작업을 수행합니다:

* 컴파일된 Kotlin 프레임워크를 iOS 프로젝트 구조 내의 올바른 디렉터리로 복사합니다.
* 임베드된 프레임워크의 코드 서명(Code signing) 프로세스를 처리합니다.
* Kotlin 프레임워크의 코드 변경 사항이 Xcode의 iOS 앱에 반영되도록 보장합니다.

## 설정 방법 {id="how-to-set-up"}

현재 CocoaPods 플러그인을 사용하여 Kotlin 프레임워크를 연결하고 있다면 먼저 마이그레이션해야 합니다. 프로젝트에 CocoaPods 의존성이 없는 경우 [이 단계를 건너뛰세요](#connect-the-framework-to-your-project).

### CocoaPods 플러그인에서 마이그레이션 {id="migrate-from-the-cocoapods-plugin"}

CocoaPods 플러그인에서 마이그레이션하려면:

1. Xcode에서 **Product** | **Clean Build Folder**를 선택하거나 <shortcut>Cmd + Shift + K</shortcut> 단축키를 사용하여 빌드 디렉터리를 정리합니다.
2. Podfile이 있는 디렉터리에서 다음 명령을 실행합니다:

    ```none
   pod deintegrate
   ```

3. `build.gradle(.kts)` 파일에서 `cocoapods {}` 블록을 제거합니다.
4. `.podspec` 파일과 Podfile을 삭제합니다.

### 프로젝트에 프레임워크 연결

다중 플랫폼 프로젝트에서 생성된 Kotlin 프레임워크를 Xcode 프로젝트에 연결하려면:

1. `embedAndSignAppleFrameworkForXcode` 태스크는 `binaries.framework` 설정 옵션이 선언되어 있을 때만 등록됩니다. Kotlin Multiplatform 프로젝트의 `build.gradle.kts` 파일에서 iOS 타깃 선언을 확인하세요.
2. Xcode에서 프로젝트 이름을 더블 클릭하여 iOS 프로젝트 설정을 엽니다.
3. 왼쪽의 **Targets** 섹션에서 타깃을 선택한 다음 **Build Phases** 탭으로 이동합니다.
4. **+**를 클릭하고 **New Run Script Phase**를 선택합니다.

   ![Add run script phase](xcode-run-script-phase-1.png){width=700}

5. 다음 스크립트를 알맞게 수정한 후 새 단계의 스크립트 텍스트 필드에 붙여넣습니다:

   ```bash
   if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
       echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
       exit 0
   fi
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode
   ```

   * `cd` 명령에는 Kotlin Multiplatform 프로젝트의 루트 경로(예: `$SRCROOT/..`)를 지정합니다.
   * `./gradlew` 명령에는 공유 모듈의 이름(예: `:shared` 또는 `:sharedUI`)을 지정합니다.
   
   iOS 실행 구성을 시작할 때 IntelliJ IDEA와 Android Studio는 Xcode 빌드를 시작하기 전에 Kotlin 프레임워크 의존성을 빌드하고 `OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED` 환경 변수를 "YES"로 설정합니다. 제공된 셸 스크립트는 이 변수를 확인하여 Xcode에서 Kotlin 프레임워크가 중복으로 빌드되는 것을 방지합니다.
     
   > 이를 지원하지 않는 프로젝트에 대해 iOS 실행 구성을 실행하면, IDE에서 빌드 가드를 설정하기 위한 수정 사항을 제안합니다.
   >
   {style="note"}

6. **Based on dependency analysis** 옵션을 비활성화합니다.

   ![Add the script](xcode-run-script-phase-2.png){width=700}

   이렇게 하면 Xcode가 빌드할 때마다 스크립트를 실행하며, 매번 누락된 출력 의존성에 대한 경고를 표시하지 않습니다.

7. **Run Script** 단계를 위로 이동하여 **Compile Sources** 단계 앞에 배치합니다.

   ![Drag the Run Script phase](xcode-run-script-phase-3.png){width=700}

8. **Build Settings** 탭의 **Build Options** 아래에서 **User Script Sandboxing** 옵션을 비활성화합니다:

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 샌드박싱을 먼저 비활성화하지 않고 iOS 프로젝트를 빌드한 경우 Gradle 데몬을 다시 시작해야 할 수 있습니다. 샌드박스 처리되었을 수 있는 Gradle 데몬 프로세스를 중지하세요:
   > ```shell
   > ./gradlew --stop
   > ```
   >
   {style="tip"}

9. Xcode에서 프로젝트를 빌드합니다. 모든 것이 올바르게 설정되었다면 프로젝트가 성공적으로 빌드됩니다.

> 기본 `Debug` 또는 `Release`와 다른 커스텀 빌드 구성이 있는 경우, **Build Settings** 탭의 **User-Defined** 아래에 `KOTLIN_FRAMEWORK_BUILD_TYPE` 설정을 추가하고 이를 `Debug` 또는 `Release`로 설정하세요.
>
{style="note"}

## 다음 단계는? {id="what-s-next"}

Swift Package Manager를 사용할 때도 로컬 연동의 이점을 활용할 수 있습니다. [로컬 패키지에서 Kotlin 프레임워크에 대한 의존성을 추가하는 방법](multiplatform-spm-local-integration.md)을 알아보세요.