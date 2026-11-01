[//]: # (title: 使用相依注入進行測試)

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

[相依注入 (DI) 外掛程式](server-dependency-injection.md)提供工具來簡化測試。

你可以在載入應用程式模組之前覆寫相依性：

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

在上述範例中，`loadServices()` 是用於引導應用程式模組的函式——例如註冊路由與服務的函式，相當於 `application.yaml` 中 `modules` 下所列出的內容。

### 在測試中載入配置 {id="loading-configuration-in-tests"}

使用 `configure()` 可在測試中輕鬆載入配置檔案：

```kotlin
fun test() = testApplication {
  // 從預設配置檔案路徑載入屬性
  configure()
  // 載入多個檔案並進行覆寫
  configure("root-config.yaml", "test-overrides.yaml")
}
```

測試引擎會忽略衝突的宣告，以便讓你自由覆寫。