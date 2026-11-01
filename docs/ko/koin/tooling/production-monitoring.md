---
title: 프로덕션 모니터링
---

# 프로덕션 모니터링

Kotzilla 플랫폼은 프로덕션 환경에서 Koin 앱을 모니터링합니다. Kotzilla SDK는 Koin 컨테이너에 연동되어 실제 사용자 세션에서 의존성이 어떻게 해결(resolve)되는지 기록하며, Kotzilla 콘솔은 이 데이터를 기반으로 성능 문제와 크래시 리포트를 생성합니다. Kotzilla는 Koin을 개발한 회사입니다. 이 플랫폼은 별도의 선택적 서비스로 제공되며, Koin은 이 플랫폼 없이도 완전하게 동작합니다.

프로덕션 배포 전에는 [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety), [로깅](/docs/reference/koin-core/starting-koin#logging), [모듈 검증](/docs/reference/koin-test/verify)과 같은 Koin 자체 도구를 통해 대부분의 설정 오류를 잡아낼 수 있습니다. 이 페이지에서는 배포 이후에 일어나는 작업을 다룹니다. 전체 도구에 대한 개요는 [프로덕션 및 툴링(Production & Tooling)](/docs/tooling)을 참조하세요.

## 감지하는 항목 {id="what-it-detects"}

콘솔은 세션 데이터를 다음과 같은 이슈로 그룹화합니다.

| 이슈 | 설명 |
|-------|---------------|
| Startup Performance | 앱 초기화 중 발생하는 지연 |
| Main Thread Performance | 화면을 멈추게(freeze) 하는 메인 스레드의 작업. 메인 스레드에서 100ms 이상 소요된 의존성 해결 작업이 여기에 보고됩니다. |
| Background Performance | 백그라운드 스레드 처리 시 발생하는 병목 현상 |
| Crashes | 실제 사용자 세션에서 발생한 크래시 |

콘솔에서는 성능 병목, 크래시, 아키텍처 문제를 조사할 수 있는 그래픽 뷰를 제공합니다. 동일한 이슈들을 [IDE 플러그인](/docs/tooling/ide-plugin)에서도 확인할 수 있습니다.

## 동작 방식 {id="how-it-works"}

SDK는 앱 시작 시 Koin 컨테이너에 연동(hook)됩니다. 그 이후부터 다음 두 가지 유형의 데이터를 기록합니다.

- **구조(Structure)**: 모듈, 정의(definition), 바인딩을 포함하는 의존성 그래프.
- **런타임 동작(Runtime behavior)**: 의존성 해결 시간, 라이프사이클 이벤트 및 크래시.

클래스에 별도의 트레이싱 코드를 추가할 필요가 없습니다. 데이터는 컨테이너에서 직접 수집됩니다. 자체 함수도 함께 트레이싱하려면 [@Monitor](/docs/tooling/monitor)를 추가하세요.

SDK가 지원하는 플랫폼: Android 및 iOS, JVM 데스크톱, JS, Wasm을 포함하는 Kotlin Multiplatform 타깃.

## 설정 개요 {id="setup-overview"}

최신의 상세한 설정 절차는 Kotzilla 공식 가이드에 나와 있습니다. 실제 설정 시에는 해당 가이드를 참고하시기 바라며, 아래 내용은 전체적인 설정 흐름만 보여줍니다.

1. [Kotzilla 콘솔](https://console.kotzilla.io), [IDE 플러그인](/docs/tooling/ide-plugin) 또는 MCP 서버에서 계정을 생성하고 앱을 등록합니다. 앱 키가 포함된 `kotzilla.json` 파일을 받게 됩니다.
2. Kotzilla Gradle 플러그인(`io.kotzilla.kotzilla-plugin`)과 SDK 의존성(`io.kotzilla:kotzilla-sdk`)을 추가합니다.
3. `kotzilla.json`을 앱 모듈(Android) 또는 공유 모듈(KMP)에 배치합니다.
4. `startKoin` 블록의 마지막에서 `monitoring()`을 호출합니다.

Android의 경우:

```kotlin
import io.kotzilla.generated.monitoring

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
            monitoring()
        }
    }
}
```

`monitoring()`은 Kotzilla Gradle 플러그인이 `kotzilla.json`을 기반으로 빌드 타임에 생성합니다. 이 함수는 컴포저블(composable) 내부가 아닌, 각 플랫폼의 진입점(entry point)에서 한 번만 호출해야 합니다.

플랫폼별 가이드:

- [Android](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroid)
- [Android Compose](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroidCompose)
- [Kotlin Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupKMP)
- [Compose Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupCMP)
- [라이브러리용 SDK](https://doc.kotzilla.io/docs/getstartedCustom/setupSDKLibrary)

:::note
iOS의 경우 크래시 심볼리케이션(symbolication)을 위해 dSYM 업로드 단계가 필요합니다. 자세한 내용은 Kotlin Multiplatform 가이드에서 다룹니다.
:::

## AI 어시스턴트 연동 {id="ai-assistant-integration"}

Kotzilla MCP 서버는 AI 코딩 어시스턴트(Claude Code, Cursor, Windsurf, Android Studio 및 기타 MCP 클라이언트)를 Koin 진단 기능과 연결합니다. 어시스턴트에 Koin 오류를 붙여넣으면 서버가 이를 분류한 다음 단계별 해결 워크플로를 반환합니다. 다음 항목들을 인식할 수 있습니다.

- Koin 컴파일러 플러그인이 제공하는 `KOIN-D001`부터 `KOIN-M001`까지의 **컴파일 타임 진단**
- `NoBeanDefFoundException`, `InstanceCreationException`, 순환 의존성 오류와 같은 **런타임 예외**

엔드포인트는 `https://mcp.kotzilla.io/mcp` (스트리밍 가능한 HTTP)입니다. Claude Code의 경우 다음과 같이 설정합니다.

```bash
claude mcp add kotzilla --transport http https://mcp.kotzilla.io/mcp
```

서버를 처음 사용할 때 Kotzilla 계정 로그인을 요청합니다. 컴파일 오류 수정은 SDK 없이도 동작합니다. 런타임 동작을 분석하려면 SDK와 세션 데이터가 필요합니다.

빌드 중에 Koin 진단 정보가 보고되면, Koin 컴파일러 플러그인이 MCP 서버를 가리키는 힌트를 하나 출력합니다. 이 힌트를 끄려면 `koinCompiler { }` 블록에서 `aiAssist = false`로 설정하세요.

다른 클라이언트에 대한 내용은 [MCP 서버 가이드](https://doc.kotzilla.io/docs/fixIssues/koinMcp)를 참조하세요.

## 데이터 및 개인정보 보호 {id="data-and-privacy"}

SDK는 기술적인 세션 데이터를 전송합니다. 여기에는 의존성 그래프와 [동작 방식](#how-it-works)에 나열된 런타임 데이터가 포함됩니다. MCP 서버는 어시스턴트로부터 전달받은 오류 텍스트와 구조화된 쿼리만 전송합니다. 사용자의 소스 코드는 로컬 머신에 안전하게 유지됩니다.

전체 정책은 [Kotzilla 개인정보 처리방침(privacy policy)](https://kotzilla.io/privacy)을 참조하세요.

## 요금 {id="cost"}

개발자 플랜(Developer plan)은 무료이며, 기간 제한 없이 제한된 이벤트 할당량을 제공합니다. 엔터프라이즈 플랜(Enterprise plan)에는 팀 협업 기능이 추가됩니다. 최신 요금제 정보는 [kotzilla.io](https://kotzilla.io)를 참조하세요.

## 지원하지 않는 기능 {id="what-it-does-not-do"}

- **빌드 타임에 설정을 검증하지 않습니다.** 이 작업은 [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety)의 역할입니다.
- **테스트를 대체하지 않습니다.** 배포 전에 동작을 확인하려면 [테스팅(Testing)](/docs/reference/koin-test/testing)을 사용하세요.
- **Koin이 의존성을 해결하는 방식을 변경하지 않습니다.** SDK는 컨테이너를 관찰할 뿐이며, 정의(definition)는 그대로 유지됩니다.
- **기본적으로 사용자 코드를 직접 트레이싱하지 않습니다.** [@Monitor](/docs/tooling/monitor)를 추가하지 않는 한 Koin의 의존성 해결 작업만 기록됩니다.

## 관련 문서 {id="related"}

- [프로덕션 및 툴링(Production & Tooling)](/docs/tooling): 용도별 도구 안내
- [@Monitor](/docs/tooling/monitor): Kotzilla SDK로 자체 함수 트레이싱하기
- [IDE 플러그인](/docs/tooling/ide-plugin): 코드 옆에서 프로덕션 이슈 확인하기
- [트러블슈팅](/docs/reference/koin-core/troubleshooting): Koin 오류 확인 및 해결하기
- [Kotzilla 문서](https://doc.kotzilla.io): 플랫폼 및 SDK 전체 문서