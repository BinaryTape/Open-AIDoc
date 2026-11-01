[//]: # (title: リソースのライフサイクル管理)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依存性注入（DI）プラグイン](server-dependency-injection.md)は、アプリケーションのシャットダウン時にライフサイクルとクリーンアップを自動的に処理します。

### AutoCloseable のサポート {id="autocloseable-support"}

デフォルトでは、`AutoCloseable` を実装している依存関係は、アプリケーション停止時に自動的にクローズされます。

```kotlin
class DatabaseConnection : AutoCloseable {
  override fun close() {
    // 接続を閉じ、リソースを解放する
  }
}

dependencies {
  provide<DatabaseConnection> { DatabaseConnection() }
}
```

### カスタムクリーンアップロジック {id="custom-cleanup-logic"}

`cleanup` 関数を指定することで、カスタムクリーンアップロジックを定義できます。

```kotlin
dependencies {
  provide<ResourceManager> { ResourceManagerImpl() } cleanup { manager ->
    manager.releaseResources()
  }
}
```

### キーを使用したスコープ付きクリーンアップ {id="scoped-cleanup-with-key"}

名前付きリソースとそのクリーンアップを管理するには、`key` を使用します。

```kotlin
dependencies {
  key<Closer>("second") {
    provide { CustomCloser() }
    cleanup { it.closeMe() }
  }
}
```

適切な終了処理を確実に行うため、依存関係は宣言された逆の順序でクリーンアップされます。