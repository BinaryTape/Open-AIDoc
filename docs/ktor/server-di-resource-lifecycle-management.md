[//]: # (title: 资源生命周期管理)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依赖注入 (DI) 插件](server-dependency-injection.md)会在应用程序关闭时自动处理生命周期和清理。

### AutoCloseable 支持 {id="autocloseable-support"}

默认情况下，任何实现了 `AutoCloseable` 的依赖项都会在应用程序停止时自动关闭：

```kotlin
class DatabaseConnection : AutoCloseable {
  override fun close() {
    // 关闭连接，释放资源
  }
}

dependencies {
  provide<DatabaseConnection> { DatabaseConnection() }
}
```

### 自定义清理逻辑 {id="custom-cleanup-logic"}

您可以通过指定 `cleanup` 函数来自定义清理逻辑：

```kotlin
dependencies {
  provide<ResourceManager> { ResourceManagerImpl() } cleanup { manager ->
    manager.releaseResources()
  }
}
```

### 使用 key 进行作用域清理 {id="scoped-cleanup-with-key"}

使用 `key` 管理指定名称的资源及其清理：

```kotlin
dependencies {
  key<Closer>("second") {
    provide { CustomCloser() }
    cleanup { it.closeMe() }
  }
}
```

依赖项按声明的相反顺序进行清理，以确保正确拆卸。