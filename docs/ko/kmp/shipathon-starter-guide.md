[//]: # (title: Kotlin Multiplatform 시작 가이드)

## 시작하기

1. Kotlin Multiplatform(KMP) 및 Compose Multiplatform(CMP)에 대해 알아봅니다. 이들이 무엇인지, [장점과 사용 사례](kmp-overview.md)를 확인하세요.
2. [샘플 프로젝트에서 KMP를 직접 실행](quickstart.md)하여 프로젝트 구조가 어떻게 구성되어 있고 다양한 플랫폼에서 어떻게 동작하는지 확인해 보세요.

## KMP 기본 사항 배우기

기본 사항은 다음과 같습니다.

* [KMP / CMP 프로젝트 구성 방식 이해하기](multiplatform-discover-project.md).
  다음 내용을 다룹니다:
    * 공유 모듈(shared module) 내의 공통 코드 및 플랫폼별 코드.
    * 대상 플랫폼(Targeted platform) 선언.
* [KMP 프로젝트에 종속성 추가하기](multiplatform-add-dependencies.md).
    * 멀티플랫폼 및 플랫폼별 종속성 구성의 실제 예시는 [샘플](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)에서 확인할 수 있습니다.
    * 해당 샘플의 최종 상태에 도달하는 과정을 설명하는 [튜토리얼이 문서에 제공](multiplatform-upgrade-app.md)되어 있습니다.
* 이미 KMP에 익숙하다면, 일반적인 프로젝트를 위한 [권장 프로젝트 구조](multiplatform-project-recommended-structure.md) 최신 내용을 확인하세요.
  이 가이드는 Android Gradle plugin 9.0의 출시가 KMP 프로젝트 요구 사항에 미친 영향을 고려하며 다음 내용을 다룹니다:
    * 모듈 구조 (라이브러리로 사용되는 공유 코드 모듈과 독립적인 앱 모듈).
    * 새로운 앱 모듈 생성 및 AGP 8에서 사용하던 이전 구조로부터의 전환.
* JetBrains 개발자 에드보킷(developer advocate)이 녹화한 [프로젝트 구조에 관한 권장 영상](https://www.youtube.com/watch?v=Atvl0l7fm1Y).

<!-- ## \[AI Agents scenario tools TODO\] -->

## 코드 공유하기

KMP 프로젝트에서 코드를 공유하는 방법은 다양하며, 플랫폼별 특성이 있습니다.

* 앱 모듈에서 공통 코드를 호출하는 기본적인 예시는 온보딩 튜토리얼에서 다룹니다:
    * [네이티브 UI 및 공유 로직용](multiplatform-create-first-app.md)
    * [공유 UI 및 로직용](compose-multiplatform-create-first-app.md)
* [플랫폼별 API에 접근하는 방법](multiplatform-connect-to-apis.md):
    * 가능한 경우 멀티플랫폼 라이브러리를 사용하세요.
    * 적절한 멀티플랫폼 라이브러리가 없는 경우 `expect`/`actual` 메커니즘을 사용하세요.
* Android Kotlin에서 공유 Kotlin 코드를 호출하는 것은 비교적 간단하지만, iOS 상호 운용성(interoperability)은 별도의 학습이 필요합니다:
    * [공유 코드를 iOS 앱과 통합하는 방법](multiplatform-ios-integration-overview.md#local-integration)을 알아보세요 (이 문서에서 참조된 모든 샘플에는 iOS 통합 설정 예시가 포함되어 있습니다).
      > CocoaPods는 일반적으로 Swift Package Manager로 대체되는 추세이며, 새 프로젝트에서 사용을 권장하지 않습니다.
      >
      {style="note"}   
    * Kotlin 코루틴을 iOS에서 작동시키는 방법이 포함된 [샘플 및 튜토리얼](multiplatform-upgrade-app.md#add-more-dependencies)을 확인하세요.
    * [KMP iOS 앱에서 기존 SPM 패키지 사용](multiplatform-spm-import.md)에 관한 가이드를 읽어보세요.
    * [Kotlin에서 Swift / ObjC 호출 및 그 반대](https://kotlinlang.org/docs/native-objc-interop.html)에 대한 심층 설명을 읽어보세요.
    * 더 직관적인 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 방식(현재 Alpha 단계)에 대해 알아보세요.
    * 일반적으로 상호 운용성이 적을수록 좋습니다. 따라서 더 매끄러운 경험을 위해 모든 플랫폼의 주요 UI 구축에는 Compose Multiplatform을 활용하는 것을 권장합니다.

## 생태계 살펴보기

멀티플랫폼 라이브러리에 대한 종합적인 카탈로그는 [klibs.io](https://klibs.io/)에서 확인할 수 있습니다.

* 가장 대중적인 사례들은 이미 견고한 솔루션들로 해결 가능하며, 대안들도 존재합니다:
  데이터베이스를 위한 [SQLDelight](https://sqldelight.github.io/sqldelight/) 및 [Room](https://developer.android.com/kotlin/multiplatform/room), 네트워킹을 위한 [Ktor](https://ktor.io/) 및 [OkHttp](https://square.github.io/okhttp/), 이미지 로딩을 위한 [Coil](https://coil-kt.github.io/coil/) 등이 있습니다.
* 주요 사용 사례에 멀티플랫폼 라이브러리를 사용하도록 빌드된 앱 샘플들이 제공됩니다:
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) 및 관련 [튜토리얼](multiplatform-ktor-sqldelight.md).
    * [기존 Android 샘플](https://github.com/android/compose-samples/tree/main/Jetcaster)에서 전환된 [멀티플랫폼 Jetcaster 앱](https://github.com/kotlin-hands-on/jetcaster-kmp-migration).

## KMP 라이브러리 만들기

멀티플랫폼 라이브러리를 사용하여 코드를 공유하는 앱을 만들기로 했다면 다음 문서들을 확인하세요:

* [기본 라이브러리 튜토리얼](create-kotlin-multiplatform-library.md)
* [KMP 라이브러리 배포 설정](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) 및 [npm](multiplatform-publish-libraries-to-npm.md)에 아티팩트를 배포하는 튜토리얼

## 아티팩트 배포하기

* [KMP 앱 배포에 관한 일반적인 문서](multiplatform-publish-apps.md)를 읽어보세요.
* Apple App Store에서 요구하는 [개인정보 보호 매니페스트(privacy manifest)](multiplatform-privacy-manifest.md)를 잊지 마세요.

## 학습 리소스 카탈로그

앞서 언급된 모든 리소스와 더불어 심층 가이드 및 서드파티 콘텐츠가 [학습 리소스](kmp-learning-resources.md) 페이지에 정리되어 있습니다.