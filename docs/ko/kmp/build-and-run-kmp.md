[//]: # (title: Kotlin Multiplatform 애플리케이션 빌드 및 실행)

Kotlin Multiplatform (KMP)은 빌드 시스템으로 Gradle을 사용합니다.
IntelliJ IDEA 및 Android Studio용 [KMP IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)은
맞춤형 실행 구성(Run configuration)을 자동으로 생성하고 Compose Hot Reload 연동을 처리하는 등 추가적인 지원을 제공합니다.

## KMP 애플리케이션 빌드 및 실행 {id="build-and-run-kmp-applications"}

KMP 앱을 빌드하는 데는 Gradle과 Java만 있으면 됩니다.
하지만 IntelliJ IDEA와 Android Studio는 환경 관리부터 빌드 스크립트 및 멀티플랫폼 코드 작성에 이르기까지,
KMP 개발에 유용한 다양한 편의 기능(Quality-of-life features)을 제공합니다.

동일한 IDE를 사용하여 지원되는 모든 플랫폼에서 애플리케이션을 실행할 수 있습니다.

* Android 앱은 사용 가능한 Android 가상 기기(Android Virtual Device)에서 실행됩니다.
* iOS 앱은 Device Hub에서 사용 가능한 iOS 시뮬레이터에서 실행됩니다
  (Apple 타깃에서 앱을 실행하려면 Xcode가 설치된 macOS 머신이 필요합니다).
* 데스크톱 앱은 시스템 JVM에서 실행됩니다.
* 웹 앱은 기본 브라우저에서 실행됩니다.

KMP IDE 플러그인이 제공하는 실행 구성은 일반 Gradle 빌드 태스크보다 더 효율적입니다.
기본 Gradle 빌드 태스크는 항상 모든 타깃의 디버그 및 릴리스 버전을 빌드하는 반면,
이 실행 구성은 해당하는 타깃에 대해서만 빌드를 트리거합니다.

### Android Emulator에서 애플리케이션 실행 {id="run-your-application-on-android-emulator"}

기본 실행 구성은 사용 가능한 Android 가상 기기 목록을 자동으로 제안합니다.
사용 가능한 기기가 없거나 다른 기기를 시뮬레이션하고 싶다면 Android Device Manager를 사용하여 기기를 구성할 수 있습니다
(IntelliJ IDEA에서는 **View | Tool Window | Device Manager**를 이용하거나,
[Android Studio 가이드](https://developer.android.com/studio/run/managing-avds)를 따르세요).

> Android Studio의 Device Manager가 일반적으로 더 다양한 기기 목록을 제공하지만,
> 기기를 생성하고 나면 IntelliJ IDEA의 실행 구성을 포함하여 시스템 전체에서 해당 기기를 사용할 수 있습니다.
>
{style="tip"}

기기가 생성되는 즉시 실행 구성에서 선택할 수 있습니다.

1. 실행 구성 목록에서 **androidApp**을 선택합니다.
2. Android 가상 기기를 선택한 다음 **Run**을 클릭합니다.

![Android에서 Compose Multiplatform 앱 실행](compose-run-android.png){width=352}

선택한 가상 기기가 꺼져 있다면 전원을 켜면서 IDE가 앱을 실행합니다.

### 실제 Android 기기에서 실행 {id="run-on-a-real-android-device"}

실제 Android 하드웨어 기기를 KMP 실행 구성에서 사용할 수 있도록 하려면
[기기를 설정하고 컴퓨터에 연결](https://developer.android.com/studio/run/device)하세요.

올바르게 설정되면 가상 기기와 함께 사용 가능한 기기 목록에 표시됩니다.

### iOS 시뮬레이터에서 애플리케이션 실행 {id="run-your-application-on-ios-simulator"}

초기 설정 과정에서 Xcode를 실행하지 않았다면 iOS 앱을 실행하기 전에 먼저 Xcode를 실행하세요.
iOS 플랫폼 지원 컴포넌트를 설치합니다:
Xcode에서 **Xcode | Settings | Components**로 이동하여 최소 하나 이상의 iOS 시뮬레이터가 설치되어 있는지 확인합니다.

Kotlin Multiplatform IDE의 실행 구성 목록에서 iOS 항목을 선택하고,
옆에 있는 목록에서 시뮬레이션할 기기를 선택한 후 **Run**을 클릭합니다.

![iOS에서 Compose Multiplatform 앱 실행](compose-run-ios.png){width=405}

#### 실제 iOS 기기에서 실행 {initial-collapse-state="collapsed" collapsible="true" id="run-on-a-real-ios-device"}

멀티플랫폼 애플리케이션을 실제 iOS 기기에서 실행할 수 있습니다. 시작하기 전에
[Apple ID](https://support.apple.com/en-us/HT204316)와 연결된 Team ID를 설정해야 합니다.

##### Team ID 설정 {id="set-your-team-id"}

프로젝트에 새 Team ID를 처음으로 설정하려면 Xcode에서 프로젝트를 엽니다
(**File | Open Project in Xcode**):

1. 왼쪽 Project navigator에서 **iosApp**을 선택합니다.
2. **Targets** 아래에서 **iosApp**을 선택하고 **Signing & Capabilities** 탭으로 전환합니다.
3. **Team** 목록에서 본인의 팀을 선택합니다.

   아직 팀을 설정하지 않았다면 **Team** 목록의 **Add an Account** 옵션을 사용하여 Xcode의 안내를 따릅니다.

4. Bundle Identifier가 고유한지, Signing Certificate가 성공적으로 할당되었는지 확인합니다.

Xcode에서 팀을 설정한 후 IntelliJ IDEA에서 팀을 설정하거나 변경할 수 있습니다.

1. **iosApp**의 실행 구성을 편집합니다.

   ![iOS 실행 구성 편집](ios-edit-configurations.png){width=450}

2. **Options** 탭으로 전환하고 **Development team** 드롭다운에서 필요한 내용을 변경한 후 **OK**를 클릭합니다.

##### 앱 실행 {id="run-the-app"}

iPhone을 케이블로 연결합니다. 이미 Xcode에 기기를 등록했다면 IntelliJ IDEA의
실행 구성 목록에 표시됩니다. 해당하는 `iosApp` 구성을 실행하세요.

아직 Xcode에 iPhone을 등록하지 않았다면 [Apple 권장 사항](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)을 따르세요.
간단히 요약하면 다음과 같습니다.

1. iPhone을 케이블로 연결합니다.
2. iPhone의 **설정** | **개인정보 보호 및 보안**에서 개발자 모드를 활성화합니다.
3. Xcode 상단 메뉴에서 **Window** | **Devices and Simulators**를 선택합니다.
4. iPhone이 연결된 상태로 표시되지 않으면 왼쪽 하단의 더하기(+) 기호를 클릭하여 기기를 선택합니다.
5. 화면의 안내에 따라 페어링 과정을 완료합니다.

Xcode에 iPhone을 등록하고 나면, IntelliJ IDEA에서 **iosApp** 실행 구성을 선택할 때
사용 가능한 기기 목록에 표시됩니다.

### 데스크톱에서 애플리케이션 실행 {id="run-your-application-on-desktop"}

실행 구성 목록에서 **desktopApp [hot] 🔥**을 선택하고 **Run**을 클릭합니다.

![데스크톱에서 Compose Multiplatform 앱 실행](compose-run-desktop.png){width=350}

기본적으로 앱은 [Compose Hot Reload](compose-hot-reload.md)가 실행된 상태로 시작됩니다.
이를 통해 변경 사항이 있는 파일을 수동으로 저장할 때 UI를 거의 즉시 다시 로드할 수 있습니다.

### 웹 애플리케이션 실행 {id="run-your-web-application"}

웹 타깃의 기본 옵션은 다음과 같습니다.

* **webApp[js]**: Kotlin/JS 애플리케이션을 실행합니다.
* **webApp[wasmJs]**: Kotlin/Wasm 애플리케이션을 실행합니다.

웹 애플리케이션은 기본 브라우저에서 자동으로 열리며,
기본적으로 [http://localhost:8080/](http://localhost:8080/)에서 접속할 수 있습니다.

> 8080 포트를 사용할 수 없는 경우 다른 포트가 사용됩니다.
> 실제 포트는 Gradle 빌드 콘솔에서 `Project is running at`을 검색하여 확인할 수 있습니다.
>
{style="note"}

![Compose 웹 애플리케이션](first-compose-project-on-web.png){width=600}

#### 웹 타깃 호환 모드(Compatibility mode) {id="compatibility-mode-for-web-targets"}

웹 애플리케이션의 호환 모드를 활성화하여 모든 브라우저에서 별도의 설정 없이 바로 작동하도록 할 수 있습니다.
이 모드에서는 최신 브라우저의 경우 Wasm 버전을 사용하고, 구형 브라우저는 JS 버전으로 대체(fallback)하여 사용합니다.
이 모드는 `js` 및 `wasmJs` 타깃 모두에 대한 크로스 컴파일을 통해 이루어집니다.

웹 애플리케이션의 호환 모드를 활성화하려면 다음과 같이 진행합니다.

1. **View | Tool Windows | Gradle**을 선택하여 Gradle 도구 창을 엽니다.
2. **ComposeDemo | Tasks | compose**에서 **composeCompatibilityBrowserDistribution** 태스크를 선택하고 실행합니다.

   > 태스크가 정상적으로 로드되려면 Gradle JVM으로 최소 Java 11 이상이 필요하며, 일반적인
   > Compose Multiplatform 프로젝트에는 최소 Java 17 이상을 권장합니다.
   >
   {style="note"}

   ![호환성 태스크 실행](web-compatibility-gradle-task.png){width=500}

   또는 프로젝트 루트 디렉터리의 터미널에서 다음 명령을 실행할 수도 있습니다.

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

Gradle 태스크가 완료되면 웹 애플리케이션 모듈 디렉터리(예: `webApp/build/dist/composeWebCompatibility/productionExecutable`)에 호환 아티팩트가 생성됩니다.
이 아티팩트를 사용하여 `js` 및 `wasmJs` 타깃 모두에 대해 [애플리케이션을 배포(publish)](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)할 수 있습니다.