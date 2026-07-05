[//]: # (title: 리소스 개요)

Compose Multiplatform은 모든 지원되는 플랫폼의 공통 코드(common code)에서 리소스에 접근할 수 있도록 특별한 `compose-multiplatform-resources` 라이브러리와 Gradle 플러그인 지원을 제공합니다.
리소스는 이미지, 폰트, 문자열과 같은 정적 콘텐츠로, 애플리케이션에서 사용할 수 있습니다.

Compose Multiplatform에서 리소스를 다룰 때는 다음 현재 상황을 고려하세요:

* 거의 모든 리소스는 호출자 스레드(caller thread)에서 동기적으로 읽힙니다. 유일한 예외는 비동기적으로 읽히는 raw 파일과 [웹 리소스](compose-web-resources.md)입니다.
* 긴 비디오와 같은 큰 raw 파일을 스트림으로 읽는 것은 아직 지원되지 않습니다.
  [`getUri()`](compose-multiplatform-resources-usage.md#accessing-multiplatform-resources-from-external-libraries) 함수를 사용하여 개별 파일을 시스템 API(예: [kotlinx-io](https://github.com/Kotlin/kotlinx-io) 라이브러리)에 전달하세요.
* 1.6.10 버전부터는 Kotlin 2.0.0 이상 및 Gradle 7.6 이상을 사용하는 경우, 리소스를 모든 모듈이나 소스 세트(source set)에 배치할 수 있습니다.

Compose Multiplatform에서 리소스를 사용하는 방법을 알아보려면 다음 주요 섹션을 참조하세요:

* [멀티플랫폼 리소스 설정 및 구성](compose-multiplatform-resources-setup.md)

  `resources` 라이브러리 의존성을 추가하고 앱에서 접근해야 하는 모든 리소스를 설정합니다.

* [앱에서 멀티플랫폼 리소스 사용하기](compose-multiplatform-resources-usage.md)

  자동 생성된 접근자(accessor)를 사용하여 UI 코드에서 리소스에 직접 접근하는 방법을 알아봅니다.

* [로컬 리소스 환경](compose-resource-environment.md)
  
  인앱 테마 및 언어와 같은 앱의 리소스 환경을 관리합니다.