[//]: # (title: 依存性注入によるテスト)

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

[依存性注入（DI）プラグイン](server-dependency-injection.md)は、テストを簡素化するためのツールを提供します。

アプリケーションモジュールを読み込む前に、依存関係をオーバーライドできます。

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

上記の例における `loadServices()` は、アプリケーションのモジュールをブートストラップする関数です。たとえば、ルートやサービスを登録する関数であり、`application.yaml` の `modules` に記述される内容と同等です。

### テストでの設定の読み込み {id="loading-configuration-in-tests"}

テスト内で設定ファイルを簡単に読み込むには、`configure()` を使用します。

```kotlin
fun test() = testApplication {
  // デフォルトの設定ファイルパスからプロパティを読み込む
  configure()
  // オーバーライドを適用して複数のファイルを読み込む
  configure("root-config.yaml", "test-overrides.yaml")
}
```

自由にオーバーライドできるように、競合する宣言はテストエンジンによって無視されます。