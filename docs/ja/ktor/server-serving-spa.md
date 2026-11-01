[//]: # (title: シングルページアプリケーションの配信)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="single-page-application"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor は React、Angular、Vue などを含むシングルページアプリケーションを配信する機能を提供します。
</link-summary>

Ktor は React、Angular、Vue などのシングルページアプリケーションを配信する機能を提供します。

## 依存関係の追加 {id="add_dependencies"}

シングルページアプリケーションを配信するには、[ktor-server-core](server-dependencies.topic#add-ktor-dependencies) 依存関係のみが必要です。
特定の追加依存関係は不要です。

## アプリケーションの配信 {id="configure"}

シングルページアプリケーションを配信するには、コンテンツの配信元（ローカルファイルシステムまたはクラスパス）を定義する必要があります。
少なくとも、シングルページアプリケーションが含まれるフォルダーまたはリソースパッケージを指定する必要があります。

### 特定のフレームワーク向けアプリケーションの配信 {id="serve-framework"}

React、Angular、Vue などの特定のフレームワークを使用して作成されたシングルページアプリケーションのビルド成果物を配信できます。
プロジェクトのルートに React アプリケーションを含む `react-app` フォルダーがあると仮定します。
このアプリケーションは次の構造を持ち、メインページとして `index.html` ファイルが含まれています。

```text
react-app
├── index.html
├── ...
└── static
    └── ...
```

このアプリケーションを配信するには、[routing](server-routing.md) ブロック内で [singlePageApplication](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/single-page-application.html) を呼び出し、フォルダー名を `react` 関数に渡します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            react("react-app")
        }
    }
}
```

Ktor は自動的に `index.html` を検索します。
デフォルトページをカスタマイズする方法については、[配信設定のカスタマイズ](#serve-customize) を参照してください。

> その他のフレームワークについては、`angular`、`vue`、`ember` などの対応する関数を使用してください。

### 配信設定のカスタマイズ {id="serve-customize"}

リソースからシングルページアプリケーションを配信する方法を説明するために、アプリケーションが `sample-web-app` リソースパッケージ内に配置されており、次のような構造になっていると仮定します。

```text
sample-web-app
├── main.html
├── ktor_logo.png
├── css
│   └──styles.css
└── js
    └── script.js
```

このアプリケーションを配信するには、以下の設定を使用します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            useResources = true
            filesPath = "sample-web-app"
            defaultPage = "main.html"
            ignoreFiles { it.endsWith(".txt") }
        }
    }
}
```

- `useResources`: リソースパッケージからのアプリケーションの配信を有効にします。
- `filesPath`: アプリケーションが配置されているパスを指定します。
- `defaultPage`: 配信するデフォルトのリソースとして `main.html` を指定します。
- `ignoreFiles`: 末尾が `.txt` で終わるパスを無視します。

完全なサンプルは、こちらで確認できます: [single-page-application](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/single-page-application)