[//]: # (title: シャットダウン URL)

<primary-label ref="server-plugin"/>

<tldr>
<var name="example_name" value="shutdown-url"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ShutDownUrl](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-shut-down-url/index.html) プラグインを使用すると、サーバーをシャットダウンするために使用する URL を設定できます。
このプラグインを有効にするには、主に 2 つの方法があります。

- [設定ファイル](#config-file)で設定する
- [プラグインをインストール](#install)する

## 設定ファイルでシャットダウン URL を設定する {id="config-file"}

[設定ファイル](server-configuration-file.topic)内で [ktor.deployment.shutdown.url](server-configuration-file.topic#predefined-properties) プロパティを使用して、シャットダウン URL を設定できます。

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

## プラグインをインストールしてシャットダウン URL を設定する {id="install"}

コード内でシャットダウン URL を[インストール](server-plugins.md#install)して設定するには、`install` 関数に `ShutDownUrl.ApplicationCallPlugin` を渡し、`shutDownUrl` プロパティを使用します。

```kotlin
install(ShutDownUrl.ApplicationCallPlugin) {
    shutDownUrl = "/shutdown"
    exitCodeSupplier = { 0 }
}
```

完全なコード例については、[shutdown-url](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/shutdown-url) を参照してください。