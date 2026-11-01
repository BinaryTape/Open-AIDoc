[//]: # (title: 의존성 주입을 활용한 테스트)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[의존성 주입(DI) 플러그인](server-dependency-injection.md)은 테스트를 간소화할 수 있는 도구를 제공합니다.

애플리케이션 모듈을 로드하기 전에 의존성을 재정의(override)할 수 있습니다:

```kotlin
fun test() = testApplication {
  application {
    dependencies.provide<MyService> {
      MockService()
    }
    loadServices()
  }
}
```

위 예제에서 `loadServices()`는 애플리케이션의 모듈을 부트스트랩하는 함수입니다. 예를 들어 라우트와 서비스를 등록하는 함수이며, `application.yaml`의 `modules` 아래에 나열된 항목과 동일합니다.

### 테스트에서 설정 로드하기 {id="loading-configuration-in-tests"}

테스트에서 설정 파일을 쉽게 로드하려면 `configure()`를 사용하세요:

```kotlin
fun test() = testApplication {
  // 기본 설정 파일 경로에서 프로퍼티 로드
  configure()
  // 재정의를 적용하여 여러 파일 로드
  configure("root-config.yaml", "test-overrides.yaml")
}
```

충돌하는 선언은 테스트 엔진에서 무시하므로 자유롭게 재정의할 수 있습니다.