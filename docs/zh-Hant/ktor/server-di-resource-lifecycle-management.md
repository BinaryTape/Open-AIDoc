[//]: # (title: 資源生命週期管理)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[相依注入 (DI) 外掛程式](server-dependency-injection.md)會在應用程式關閉時自動處理生命週期與清理作業。

### AutoCloseable 支援 {id="autocloseable-support"}

預設情況下，任何實作了 `AutoCloseable` 的相依項都會在應用程式停止時自動關閉：

```kotlin
class DatabaseConnection : AutoCloseable {
  override fun close() {
    // 關閉連線、釋放資源
  }
}

dependencies {
  provide<DatabaseConnection> { DatabaseConnection() }
}
```

### 自訂清理邏輯 {id="custom-cleanup-logic"}

你可以透過指定 `cleanup` 函式來自訂清理邏輯：

```kotlin
dependencies {
  provide<ResourceManager> { ResourceManagerImpl() } cleanup { manager ->
    manager.releaseResources()
  }
}
```

### 使用 key 進行作用域清理 {id="scoped-cleanup-with-key"}

使用 `key` 來管理具名資源及其清理作業：

```kotlin
dependencies {
  key<Closer>("second") {
    provide { CustomCloser() }
    cleanup { it.closeMe() }
  }
}
```

相依項會按照宣告的相反順序進行清理，以確保能夠正確拆卸關閉。