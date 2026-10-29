[//]: # (title: iOS 앱을 위한 개인정보 처리 매니페스트 (Privacy manifest))

앱을 Apple App Store에 출시하려 하고 [필수 사유 API (required reasons APIs)](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)를 사용한다면,
App Store Connect에서 앱에 올바른 개인정보 처리 매니페스트(privacy manifest)가 없다는 경고를 보낼 수 있습니다:

![필수 사유 경고](app-store-required-reasons-warning.png){width=700}

이는 네이티브나 멀티플랫폼에 관계없이 모든 Apple 에코시스템 앱에 영향을 줄 수 있습니다. 앱에서 서드파티 라이브러리나 SDK를 통해 필수 사유 API를 사용하고 있을 수 있으며, 이는 명확하게 드러나지 않을 수 있습니다. Kotlin Multiplatform은 사용자가 인지하지 못하는 사이에 이러한 API를 사용하는 프레임워크 중 하나일 수 있습니다.

이 페이지에서는 문제에 대한 자세한 설명과 대응을 위한 권장 사항을 안내합니다.

> 이 페이지는 이 이슈에 대한 Kotlin 팀의 현재 이해를 반영하고 있습니다.
> 허용된 접근 방식과 해결 방법에 대한 더 많은 데이터와 지식이 확보되는 대로, 이를 반영하여 페이지를 업데이트할 예정입니다.
>
{style="tip"}

## 무엇이 문제인가요 {id="what-s-the-issue"}

Apple의 App Store 제출 요구 사항이 [2024년 봄에 변경되었습니다](https://developer.apple.com/news/?id=r1henawx).
[App Store Connect](https://appstoreconnect.apple.com)는 이제 개인정보 처리 매니페스트에 필수 사유 API를 사용하는 이유를 명시하지 않은 앱을 허용하지 않습니다.

이는 수동 검토가 아닌 자동 체크 방식입니다. 앱의 코드가 분석되고, 이슈 목록이 이메일로 전송됩니다. 이메일에는 "ITMS-91053: Missing API declaration" 이슈가 언급되며, 앱에서 사용된 [필수 사유](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) 카테고리에 해당하는 모든 API 카테고리가 나열됩니다.

이상적으로는 앱에서 사용하는 모든 SDK가 자체 개인정보 처리 매니페스트를 제공해야 하며, 이 경우 사용자가 걱정할 필요가 없습니다. 하지만 일부 종속성(dependencies)이 이를 제공하지 않는 경우, App Store 제출 시 플래그가 지정될 수 있습니다.

## 해결 방법 {id="how-to-resolve"}

앱 제출을 시도한 후 App Store로부터 상세 이슈 목록을 받았다면, Apple 문서를 따라 매니페스트를 작성할 수 있습니다:

* [개인정보 처리 매니페스트 파일 개요 (Privacy manifest files overview)](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
* [개인정보 처리 매니페스트의 데이터 사용 설명 (Describing data use in privacy manifests)](https://developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests)
* [필수 사유 API 사용 설명 (Describing use of required reason API)](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)

결과 파일은 딕셔너리(dictionaries)의 모음입니다. 액세스한 각 API 유형에 대해 제공된 목록에서 사용 사유를 하나 이상 선택하세요. Xcode는 시각적 레이아웃과 각 필드에 유효한 값의 드롭다운 리스트를 제공하여 `.xcprivacy` 파일 편집을 도와줍니다.

[특수 도구](#find-usages-of-required-reason-apis)를 사용하여 Kotlin 프레임워크의 종속성에서 필수 사유 API 사용처를 찾을 수 있으며, [별도의 플러그인](#place-the-xcprivacy-file-in-your-kotlin-artifacts)을 사용하여 Kotlin 아티팩트(artifacts)에 `.xcprivacy` 파일을 포함할 수 있습니다.

새로운 개인정보 처리 매니페스트가 App Store 요구 사항을 충족하는 데 도움이 되지 않거나 단계를 진행하는 방법을 파악할 수 없는 경우, [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-67603)에 사례를 공유하고 저희에게 연락해 주세요.

## 필수 사유 API 사용처 찾기 {id="find-usages-of-required-reason-apis"}

앱의 Kotlin 코드나 종속성 중 하나가 `platform.posix`와 같은 라이브러리의 필수 사유 API(예: `fstat`)에 액세스할 수 있습니다:

```kotlin
import platform.posix.fstat

fun useRequiredReasonAPI() {
    fstat(...)
}
```

어떤 종속성이 필수 사유 API를 사용하는지 판단하기 어려운 경우가 있습니다. 이를 돕기 위해 간단한 도구를 제작했습니다.

이 도구를 사용하려면 프로젝트에서 Kotlin 프레임워크가 선언된 디렉토리에서 다음 명령을 실행하세요:

```shell
/usr/bin/python3 -c "$(curl -fsSL https://github.com/JetBrains/kotlin/raw/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)"
```

[이 스크립트를 별도로 다운로드](https://github.com/JetBrains/kotlin/blob/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)하여 검토한 후 `python3`를 사용하여 실행할 수도 있습니다.

## Kotlin 아티팩트에 .xcprivacy 파일 배치하기 {id="place-the-xcprivacy-file-in-your-kotlin-artifacts"}

Kotlin 아티팩트에 `PrivacyInfo.xcprivacy` 파일을 포함해야 하는 경우, `apple-privacy-manifests` 플러그인을 사용하세요:

```kotlin
plugins {
    kotlin("multiplatform")
    kotlin("apple-privacy-manifests") version "1.0.0"
}

kotlin {
    privacyManifest {
        embed(
            privacyManifest = layout.projectDirectory.file("PrivacyInfo.xcprivacy").asFile,
        )
    }
}
```

이 플러그인은 개인정보 처리 매니페스트 파일을 [해당 출력 위치](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk?language=objc)로 복사합니다.

## 알려진 사용 사례 {id="known-usages"}

### Compose Multiplatform {id="compose-multiplatform"}

Compose Multiplatform을 사용하면 바이너리에 `fstat`, `stat` 및 `mach_absolute_time` 사용이 포함될 수 있습니다. 이러한 함수가 추적이나 핑거프린팅(fingerprinting)에 사용되지 않고 기기 외부로 전송되지 않더라도, Apple은 이를 필수 사유가 누락된 API로 플래그를 지정할 수 있습니다.

`stat` 및 `fstat` 사용에 대한 사유를 명시해야 하는 경우 `0A2A.1`을 사용하세요. `mach_absolute_time`의 경우 `35F9.1`을 사용하세요.

Compose Multiplatform에서 사용되는 필수 사유 API에 대한 추가 업데이트는 [이 이슈](https://github.com/JetBrains/compose-multiplatform/issues/4738)를 확인하세요.

### 1.9.10 이하 버전의 Kotlin/Native 런타임 {id="kotlin-native-runtime-in-versions-1-9-10-or-earlier"}

`mach_absolute_time` API는 Kotlin/Native 런타임의 `mimalloc` 할당자(allocator)에서 사용됩니다. 이는 Kotlin 1.9.10 및 이전 버전의 기본 할당자였습니다.

Kotlin 1.9.20 이상 버전으로 업그레이드할 것을 권장합니다. 업그레이드가 불가능한 경우 메모리 할당자를 변경하세요. 이를 위해 현재 Kotlin 할당자의 경우 `-Xallocator=custom`, 시스템 할당자의 경우 `-Xallocator=std` 컴파일 옵션을 Gradle 빌드 스크립트에 설정하세요.

자세한 정보는 [Kotlin/Native 메모리 관리](https://kotlinlang.org/docs/native-memory-manager.html)를 참조하세요.