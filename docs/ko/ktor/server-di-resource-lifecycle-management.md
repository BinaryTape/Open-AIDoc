[//]: # (title: 리소스 라이프사이클 관리)

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

[의존성 주입(DI) 플러그인](server-dependency-injection.md)은 애플리케이션이 종료될 때 라이프사이클과 정리 작업을 자동으로 처리합니다.

### AutoCloseable 지원 {id="autocloseable-support"}

기본적으로 `AutoCloseable`을 구현하는 모든 의존성은 애플리케이션이 중지될 때 자동으로 닫힙니다.

```kotlin
class DatabaseConnection : AutoCloseable {
  override fun close() {
    // 연결을 닫고 리소스를 해제합니다
  }
}

dependencies {
  provide<DatabaseConnection> { DatabaseConnection() }
}
```

### 커스텀 정리 로직 {id="custom-cleanup-logic"}

`cleanup` 함수를 지정하여 커스텀 정리 로직을 정의할 수 있습니다.

```kotlin
dependencies {
  provide<ResourceManager> { ResourceManagerImpl() } cleanup { manager ->
    manager.releaseResources()
  }
}
```

### key를 사용한 스코프 정리 {id="scoped-cleanup-with-key"}

이름이 지정된 리소스와 해당 리소스의 정리를 관리하려면 `key`를 사용합니다.

```kotlin
dependencies {
  key<Closer>("second") {
    provide { CustomCloser() }
    cleanup { it.closeMe() }
  }
}
```

올바른 종료 처리를 보장하기 위해 의존성은 선언된 역순으로 정리됩니다.