[//]: # (title: 關閉 URL)

<primary-label ref="server-plugin"/>

<tldr>
<var name="example_name" value="shutdown-url"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ShutDownUrl](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-shut-down-url/index.html) 外掛程式可讓你設定用於關閉伺服器的 URL。
啟用此外掛程式有兩種方式：

- 在[設定檔](#config-file)中設定。
- 透過[安裝外掛程式](#install)。

## 在設定檔中設定關閉 URL {id="config-file"}

你可以在[設定檔](server-configuration-file.topic)中使用 [ktor.deployment.shutdown.url](server-configuration-file.topic#predefined-properties) 屬性來設定關閉 URL。

<Tabs group="config">
<TabItem title="application.conf" group-key="hocon">

```shell
ktor {
    deployment {
        shutdown.url = "/shutdown"
    }
}
```

</TabItem>
<TabItem title="application.yaml" group-key="yaml">

```yaml
ktor:
    deployment:
        shutdown:
            url: "/shutdown"
```

</TabItem>
</Tabs>

## 透過安裝外掛程式設定關閉 URL {id="install"}

若要在程式碼中[安裝](server-plugins.md#install)並設定關閉 URL，請將 `ShutDownUrl.ApplicationCallPlugin` 傳遞給 `install` 函式，並使用 `shutDownUrl` 屬性：

```kotlin
install(ShutDownUrl.ApplicationCallPlugin) {
    shutDownUrl = "/shutdown"
    exitCodeSupplier = { 0 }
}
```

如需完整範例，請參閱 [shutdown-url](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/shutdown-url)。