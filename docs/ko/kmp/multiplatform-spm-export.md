[//]: # (title: Swift 패키지 내보내기 설정)

<tldr>
   이것은 원격 통합 방식입니다. 다음과 같은 경우에 적합합니다:<br/>

   * 최종 애플리케이션의 코드베이스를 공통 코드베이스와 분리하고 싶은 경우.
   * 로컬 머신에 iOS를 타겟으로 하는 Kotlin Multiplatform 프로젝트를 이미 설정한 경우.
   * iOS 프로젝트에서 의존성 관리를 위해 Swift 패키지 관리자(SPM)를 사용하는 경우.<br/>

   [가장 적합한 통합 방식을 선택하세요](multiplatform-ios-integration-overview.md)
</tldr>

Apple 타겟에 대한 Kotlin/Native 출력을 Swift 패키지 관리자(SwiftPM) 의존성으로 사용할 수 있도록 설정할 수 있습니다.

iOS 타겟이 있는 Kotlin Multiplatform 프로젝트를 가정해 보겠습니다. 이 iOS 바이너리를 네이티브 Swift 프로젝트에서 작업하는 iOS 개발자가 의존성으로 사용할 수 있게 만들고 싶을 수 있습니다. Kotlin Multiplatform 도구를 사용하면 Xcode 프로젝트와 원활하게 통합되는 아티팩트(artifact)를 제공할 수 있습니다.

이 튜토리얼에서는 Kotlin Gradle 플러그인으로 [XCFrameworks](multiplatform-build-native-binaries.md#build-xcframeworks)를 빌드하여 이를 수행하는 방법을 보여줍니다.

## 원격 통합 설정

프레임워크를 사용할 수 있게 만들려면 두 개의 파일을 업로드해야 합니다:

* XCFramework가 포함된 ZIP 아카이브. 직접 접근이 가능한 편리한 파일 저장소(예: 아카이브가 첨부된 GitHub 릴리스 생성, Amazon S3 또는 Maven 사용)에 업로드해야 합니다. 워크플로우에 통합하기 가장 쉬운 옵션을 선택하세요.
* 패키지를 설명하는 `Package.swift` 파일. 이를 별도의 Git 저장소에 푸시해야 합니다.

#### 프로젝트 구성 옵션 {initial-collapse-state="collapsed" collapsible="true"}

이 튜토리얼에서는 XCFramework를 선호하는 파일 저장소에 바이너리로 저장하고, `Package.swift` 파일을 별도의 Git 저장소에 저장합니다.

하지만 프로젝트를 다르게 구성할 수도 있습니다. Git 저장소를 구성하기 위한 다음 옵션들을 고려해 보세요:

* `Package.swift` 파일과 XCFramework로 패키징할 코드를 별도의 Git 저장소에 저장합니다. 이를 통해 Swift 매니페스트를 파일이 설명하는 프로젝트와 별도로 버저닝할 수 있습니다. 이것이 권장되는 방식입니다. 확장이 가능하고 일반적으로 유지 관리가 더 쉽기 때문입니다.
* `Package.swift` 파일을 Kotlin Multiplatform 코드 옆에 둡니다. 이는 더 간단한 방식이지만, 이 경우 Swift 패키지와 코드가 동일한 버저닝을 사용하게 된다는 점에 유의하세요. SwiftPM은 패키지 버저닝을 위해 Git 태그를 사용하며, 이는 프로젝트에서 사용하는 태그와 충돌할 수 있습니다.
* `Package.swift` 파일을 소비자(consumer) 프로젝트의 저장소 내에 저장합니다. 이는 버저닝 및 유지 관리 문제를 피하는 데 도움이 됩니다. 하지만 이 방식은 소비자 프로젝트의 멀티 저장소 SwiftPM 설정 및 추가 자동화에서 문제를 일으킬 수 있습니다:

  * 멀티 패키지 프로젝트에서는 (프로젝트 내의 의존성 충돌을 피하기 위해) 하나의 소비자 패키지만 외부 모듈에 의존할 수 있습니다. 따라서 Kotlin Multiplatform 모듈에 의존하는 모든 로직은 특정 소비자 패키지에 캡슐화되어야 합니다.
  * 자동 CI 프로세스를 사용하여 Kotlin Multiplatform 프로젝트를 게시하는 경우, 이 프로세스에 업데이트된 `Package.swift` 파일을 소비자 저장소에 게시하는 과정이 포함되어야 합니다. 이는 소비자 저장소의 업데이트 충돌로 이어질 수 있으므로 CI의 이러한 단계는 유지 관리가 어려울 수 있습니다.

### 멀티플랫폼 프로젝트 구성

다음 예제에서 Kotlin Multiplatform 프로젝트의 공통 코드는 `shared` 모듈에 로컬로 저장되어 있습니다. 프로젝트 구조가 다른 경우 코드 및 경로 예제의 "shared"를 모듈 이름으로 바꾸세요.

XCFramework 게시를 설정하려면:

1. `shared/build.gradle.kts` 설정 파일의 iOS 타겟 목록에서 `XCFramework` 호출을 업데이트합니다:

   ```kotlin
   import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework
   
   kotlin {
       // 기타 Kotlin Multiplatform 타겟
       // ...
       // 소비자 프로젝트에서 임포트할 모듈의 이름
       val xcframeworkName = "Shared"
       val xcf = XCFramework(xcframeworkName)
   
       listOf(
           iosArm64(),
           iosSimulatorArm64(),
       ).forEach { 
           it.binaries.framework {
               baseName = xcframeworkName
               
               // 프레임워크를 고유하게 식별하기 위한 CFBundleIdentifier 지정
               binaryOption("bundleId", "org.example.${xcframeworkName}")
               xcf.add(this)
               isStatic = true
           }
       }
       //...
   }
   ```
   
2. 프레임워크를 생성하기 위해 Gradle 태스크를 실행합니다:
   
   ```shell
   ./gradlew :shared:assembleSharedXCFramework
   ```
  
   결과물인 프레임워크는 프로젝트 디렉토리의 `shared/build/XCFrameworks/release/Shared.xcframework` 폴더에 생성됩니다.

   > 프로젝트에서 SwiftPM 의존성을 사용하는 경우, Kotlin %kotlinEapVersion%부터 태스크가 XCFramework 옆에 일련의 SwiftPM 관련 파일도 생성합니다.
   > [아래](#xcframework-및-swift-패키지-매니페스트-준비) 설명된 대로, 매니페스트를 처음부터 작성하는 대신 생성된 `Package.swift`를 프레임워크와 함께 배포할 수 있습니다.
   >
   {style="note"} 

3. 내보내고 싶은 공통 코드가 포함된 모듈이 둘 이상인 경우(예: 공통 로직 모듈과 공통 UI 모듈), [이를 하나의 새로운 모듈로 결합](#여러-모듈을-xcframework로-내보내기)하고 대신 이 엄브렐러(umbrella) 모듈을 배포하세요.

### XCFramework 및 Swift 패키지 매니페스트 준비

1. `Shared.xcframework` 폴더를 ZIP 파일로 압축하고 결과 아카이브의 체크섬(checksum)을 계산합니다. 예:
   
   `swift package compute-checksum Shared.xcframework.zip`

2. ZIP 파일을 선택한 파일 저장소에 업로드합니다. 파일은 직접 링크로 접근 가능해야 합니다. 예를 들어, GitHub의 릴리스를 사용하는 방법은 다음과 같습니다:
   
   <deflist collapsible="true">
       <def title="GitHub 릴리스에 업로드">
           <list type="decimal">
               <li><a href="https://github.com">GitHub</a>로 이동하여 계정에 로그인합니다.</li>
               <li>릴리스를 생성하려는 저장소로 이동합니다.</li>
               <li>오른쪽의 <b>Releases</b> 섹션에서 <b>Create a new release</b> 링크를 클릭합니다.</li>
               <li>릴리스 정보를 입력하고, 새 태그를 추가하거나 생성하며, 릴리스 제목을 지정하고 설명을 작성합니다.</li>
               <li>
                   <p>하단의 <b>Attach binaries by dropping them here or selecting them</b> 필드를 통해 XCFramework가 포함된 ZIP 파일을 업로드합니다:</p>
                   <img src="github-release-description.png" alt="릴리스 정보 입력" width="700"/>
               </li>
               <li><b>Publish release</b>를 클릭합니다.</li>
               <li>
                   <p>릴리스의 <b>Assets</b> 섹션에서 ZIP 파일을 마우스 오른쪽 버튼으로 클릭하고 브라우저에서 <b>링크 주소 복사</b> 또는 이와 유사한 옵션을 선택합니다:</p>
                   <img src="github-release-link.png" alt="업로드된 파일의 링크 복사" width="500"/>
               </li>
         </list>
       </def>
   </deflist>

3. [권장] 링크가 작동하고 파일을 다운로드할 수 있는지 확인합니다. 터미널에서 다음 명령을 실행하세요:

    ```none
    curl <업로드된 XCFramework ZIP 파일의 다운로드 가능한 링크>
    ```

4. 프로젝트에서 SwiftPM 의존성을 사용하는 경우, Kotlin %kotlinEapVersion%부터 `assembleSharedXCFramework` Gradle 태스크가 XCFramework 옆에 `Package.swift` 파일을 생성합니다.

   그렇지 않은 경우, 다음 템플릿을 사용하여 `Package.swift` 파일을 수동으로 생성할 수 있습니다:

   ```Swift
   // swift-tools-version:5.3
   import PackageDescription
    
   let package = Package(
      name: "Shared",
      platforms: [
        .iOS(.v14),
      ],
      products: [
         .library(name: "Shared", targets: ["Shared"])
      ],
      targets: [
         .binaryTarget(
            name: "Shared",
            url: "<업로드된 XCFramework ZIP 파일의 링크>",
            checksum:"<ZIP 파일에 대해 계산된 체크섬>")
      ]
   )
   ```
   
5. 누락된 필드를 지정합니다:
   * `url` 필드에 XCFramework가 포함된 ZIP 아카이브의 링크를 지정합니다.
   * `checksum` 필드에 이전에 ZIP 파일에 대해 계산된 체크섬을 지정합니다.

6. [권장] 결과 매니페스트를 검증하려면 `Package.swift` 파일이 있는 디렉토리에서 다음 셸 명령을 실행할 수 있습니다:

    ```shell
    swift package reset && swift package show-dependencies --format json
    ```
    
    결과물에는 발견된 오류가 설명되거나 매니페스트가 올바른 경우 성공적인 다운로드 및 파싱 결과가 표시됩니다.

7. `Package.swift` 파일을 원격 저장소에 푸시합니다. 패키지의 시맨틱 버전(semantic version)이 포함된 Git 태그를 생성하고 푸시해야 합니다.

### 패키지 의존성 추가

두 파일 모두 접근 가능한 상태이므로, 생성한 패키지에 대한 의존성을 기존 클라이언트 iOS 프로젝트에 추가하거나 새 프로젝트를 생성할 수 있습니다. 패키지 의존성을 추가하려면:

1. Xcode에서 **File | Add Package Dependencies**를 선택합니다.
2. 검색 필드에 `Package.swift` 파일이 들어 있는 Git 저장소의 URL을 입력합니다:

   ![패키지 파일이 있는 저장소 지정](multiplatform-spm-url.png)

3. **Add package** 버튼을 클릭한 다음, 패키지에 대한 제품과 해당 타겟을 선택합니다.

   > Swift 패키지를 만드는 중이라면 대화 상자가 다릅니다. 이 경우 **Copy package** 버튼을 클릭하세요. 그러면 `.package` 라인이 클립보드에 복사됩니다. 이 라인을 본인 `Package.swift` 파일의 [Package.Dependency](https://developer.apple.com/documentation/packagedescription/package/dependency) 블록에 붙여넣고, 적절한 `Target.Dependency` 블록에 필요한 제품을 추가하세요.
   >
   {style="tip"}

### 설정 확인

모든 것이 올바르게 설정되었는지 확인하려면 Xcode에서 임포트를 테스트하세요:

1. 프로젝트에서 UI 뷰 파일(예: `ContentView.swift`)로 이동합니다.
2. 코드를 다음 스니펫으로 바꿉니다:
   
    ```Swift
    import SwiftUI
    import Shared
    
    struct ContentView: View {
        var body: some View {
            VStack {
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                Text("Hello, world! \(Shared.Platform_iosKt.getPlatform().name)")
            }
            .padding()
        }
    }
    
    #Preview {
        ContentView()
    }
    ```
   
    여기서 `Shared` XCFramework를 임포트한 다음, `Text` 필드에서 플랫폼 이름을 가져오는 데 사용합니다.

3. 프리뷰가 새 텍스트로 업데이트되는지 확인합니다.

## 여러 모듈을 XCFramework로 내보내기

여러 Kotlin Multiplatform 모듈의 코드를 하나의 iOS 바이너리로 사용하려면, 이 모듈들을 하나의 엄브렐러(umbrella) 모듈로 결합하세요. 그런 다음 이 엄브렐러 모듈의 XCFramework를 빌드하고 내보냅니다.

예를 들어, `network`와 `database` 모듈이 있고 이를 `together` 모듈로 결합하는 경우:

1. `together/build.gradle.kts` 파일에서 의존성과 프레임워크 구성을 지정합니다:

    ```kotlin
    kotlin {
        val frameworkName = "together"
        val xcf = XCFramework(frameworkName)
    
        listOf(
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            // 위의 예제와 동일하며,
            // 의존성에 대한 export 호출이 추가됨
            iosTarget.binaries.framework {
                export(projects.network)
                export(projects.database)
    
                baseName = frameworkName
                xcf.add(this)
            }
        }
    
        // 하위 모듈을 내보내기 위해 의존성을 "api"로 설정 ("implementation" 대신)
        sourceSets {
            commonMain.dependencies {
                api(projects.network)
                api(projects.database)
            }
        }
    }
    ```

2. 포함된 각 모듈은 iOS 타겟이 구성되어 있어야 합니다. 예:

    ```kotlin
    kotlin {
        android {
            //...
        }
        
        iosArm64()
        iosSimulatorArm64()
        
        //...
    }
    ```

3. `together` 폴더 안에 빈 Kotlin 파일을 생성합니다 (예: `together/src/commonMain/kotlin/Together.kt`). 이는 현재 Gradle 스크립트가 내보낸 모듈에 소스 코드가 없는 경우 프레임워크를 어셈블할 수 없는 문제를 해결하기 위한 임시 방편(workaround)입니다.

4. 프레임워크를 어셈블하는 Gradle 태스크를 실행합니다:

    ```shell
    ./gradlew :together:assembleTogetherReleaseXCFramework
    ```

5. [이전 섹션](#xcframework-및-swift-패키지-매니페스트-준비)의 단계에 따라 `together.xcframework`를 준비합니다: 아카이브하고, 체크섬을 계산하고, 아카이브된 XCFramework를 파일 저장소에 업로드하고, `Package.swift` 파일을 생성하여 푸시합니다.

이제 Xcode 프로젝트로 의존성을 임포트할 수 있습니다. `import together` 디렉티브를 추가한 후, Swift 코드에서 `network`와 `database` 모듈의 클래스를 모두 사용할 수 있습니다.