[//]: # (title: 关闭 URL)

<primary-label ref="server-plugin"/>

<tldr>
<var name="example_name" value="shutdown-url"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ShutDownUrl](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-shut-down-url/index.html) 插件允许你配置用于关闭服务器的 URL。
启用此插件有两种方式：

- 在[配置文件](#config-file)中。
- 通过[安装插件](#install)。

## 在配置文件中配置关闭 URL {id="config-file"}

你可以在[配置文件](server-configuration-file.topic)中使用 [ktor.deployment.shutdown.url](server-configuration-file.topic#predefined-properties) 属性来配置关闭 URL。

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

## 通过安装插件配置关闭 URL {id="install"}

要在代码中[安装](server-plugins.md#install)并配置关闭 URL，请将 `ShutDownUrl.ApplicationCallPlugin` 传递给 `install` 函数并使用 `shutDownUrl` 属性：

```kotlin
install(ShutDownUrl.ApplicationCallPlugin) {
    shutDownUrl = "/shutdown"
    exitCodeSupplier = { 0 }
}
```

有关完整示例，请参阅 [shutdown-url](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/shutdown-url)。