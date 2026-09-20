[//]: # (title: 静的コンテンツの配信)

<show-structure for="chapter" depth="2"/>

<tldr>
<p><b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files">static-files</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources">static-resources</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip">static-zip</a>
</p>
</tldr>

<link-summary>
スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。
</link-summary>

ウェブサイトやHTTPエンドポイントを作成する場合、アプリケーションはスタイルシート、スクリプト、画像などのファイルを配信する必要があるでしょう。
Ktorでファイルの内容を読み込んでクライアントに[レスポンスとして送信](server-responses.md)することももちろん可能ですが、Ktorは静的コンテンツを配信するための追加機能を提供することで、このプロセスを簡素化します。

Ktorを使用すると、[フォルダ](#folders)、[ZIPファイル](#zipped)、[組み込みアプリケーションリソース](#resources)からコンテンツを配信できます。

## フォルダ {id="folders"}

ローカルファイルシステムから静的ファイルを配信するには、[`staticFiles()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-files.html)関数を使用します。この場合、相対パスは現在の作業ディレクトリを基準に解決されます。

 ```kotlin
 routing {
     staticFiles("/resources", File("files"))
 }
 ```

上記の例では、`/resources` からのリクエストは、現在の作業ディレクトリにある `files` 物理フォルダにマッピングされます。
Ktorは、URLパスと物理ファイル名が一致する限り、`files` からのファイルを再帰的に配信します。

完全な例については、[static-files](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files)を参照してください。

## ZIPファイル {id="zipped"}

ZIPファイルから静的コンテンツを配信するために、Ktorは[`staticZip()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-zip.html)関数を提供しています。
これにより、以下の例に示すように、リクエストをZIPアーカイブの内容に直接マッピングできます。

 ```kotlin
 routing {
     staticZip("/", "/", Paths.get("files/text-files.zip"))
 }
 ```

この例では、ルートURL `/` からのリクエストは、ZIPファイル `text-files.zip` の内容に直接マッピングされます。

### 自動リロードのサポート {id="zip-auto-reload"}

`staticZip()` 関数は自動リロードもサポートしています。ZIPファイルの親ディレクトリで変更が検出されると、次のリクエスト時にZIPファイルシステムが再ロードされます。これにより、サーバーを再起動することなく、配信されるコンテンツを最新の状態に保つことができます。

完全な例については、[static-zip](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip)を参照してください。

## リソース {id="resources"}

クラスパスからコンテンツを配信するには、[`staticResources()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-resources.html)関数を使用します。

```kotlin
routing {
    staticResources("/resources", "static")
}
```

これは、`/resources` からのリクエストをアプリケーションリソース内の `static` パッケージにマッピングします。
この場合、Ktorは、URLパスとリソースへのパスが一致する限り、`static` パッケージからファイルを再帰的に配信します。

完全な例については、[static-resources](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources)を参照してください。

## 追加設定 {id="configuration"}

Ktorは、静的ファイルやリソースに対してさらなる設定を提供しています。

### インデックスファイル {id="index"}

`index.html` という名前のファイルが存在する場合、ディレクトリがリクエストされたときにKtorはデフォルトでそれを配信します。`index` パラメータを使用してカスタムインデックスファイルを指定することもできます。

```kotlin
staticResources("/custom", "static", index = "custom_index.html")
```

この場合、`/custom` がリクエストされると、Ktorは `/custom_index.html` を配信します。

### 事前圧縮されたファイル {id="precompressed"}

Ktorは、[Compression](server-compression.md)プラグインでレスポンスを動的に圧縮する代わりに、事前圧縮された静的ファイルを配信できます。

この機能を有効にするには、`preCompressed()` 関数を使用して、サポートする圧縮形式を指定します。

```kotlin
staticFiles("/", File("files")) {
    preCompressed(
        CompressedFileType.BROTLI,
        CompressedFileType.GZIP,
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

クライアントが静的ファイルをリクエストすると、Ktorはクライアントがサポートするコンテンツエンコーディングを確認し、利用可能な場合は一致する事前圧縮バージョンを配信します。

たとえば、`/js/script.js` へのリクエストに対して、Ktorは `/js/script.js.br` や `/js/script.js.gz` などの事前圧縮されたバリアントを配信できます。

### HEADリクエスト {id="autohead"}

`enableAutoHeadResponse()` 関数を使用すると、`GET` が定義されている静的ルート内のすべてのパスに対して、`HEAD` リクエストに自動的に応答できるようになります。

```kotlin
staticResources("/", "static"){
    enableAutoHeadResponse()
}
```

### デフォルトファイルレスポンス {id="default-file"}

`default()` 関数は、対応するファイルがない静的ルート内のリクエストに対して、ファイルで応答する機能を提供します。

```kotlin
staticFiles("/", File("files")) {
    default("index.html")
}
```

この例では、クライアントが存在しないリソースをリクエストしたときに、レスポンスとして `index.html` ファイルが配信されます。

### コンテンツタイプ {id="content-type"}

デフォルトでは、Ktorはファイル拡張子から `Content-Type` ヘッダーの値を推測しようとします。`contentType()` 関数を使用すると、`Content-Type` ヘッダーを明示的に設定できます。

```kotlin
staticFiles("/files", File("textFiles")) {
    contentType { file ->
        when (file.name) {
            "html-file.txt" -> ContentType.Text.Html
            else -> null
        }
    }
}
```

この例では、ファイル `html-file.txt` に対するレスポンスには `Content-Type: text/html` ヘッダーが付与され、それ以外のすべてのファイルにはデフォルトの動作が適用されます。

### キャッシュ {id="caching"}

`cacheControl()` 関数を使用すると、HTTPキャッシュ用の `Cache-Control` ヘッダーを構成できます。

```kotlin
fun Application.module() {
    routing {
        staticFiles("/files", File("textFiles")) {
            cacheControl { file ->
                when (file.name) {
                    "file.txt" -> listOf(Immutable, CacheControl.MaxAge(10000))
                    else -> emptyList()
                }
            }
        }
    }
}
object Immutable : CacheControl(null) {
    override fun toString(): String = "immutable"
}
```

[`ConditionalHeaders`](server-conditional-headers.md) プラグインがインストールされている場合、Ktorは `ETag` および `LastModified` ヘッダーを付けて静的リソースを配信し、条件付きヘッダーを処理して、前回の要求からコンテンツが変更されていない場合にボディの送信を回避できます。

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

この例では、`etag` と `lastModified` の値が各リソースに基づいて動的に計算され、レスポンスに適用されます。

`ETag` 生成を簡略化するために、定義済みのプロバイダーを使用することもできます。

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

この例では、リソースコンテンツの SHA-256 ハッシュを使用して強力な `ETag` が生成されます。I/Oエラーが発生した場合、`ETag` は生成されません。

> Ktorでのキャッシュに関する詳細は、[キャッシュヘッダー](server-caching-headers.md)を参照してください。
>
{style="tip"}

### 除外ファイル {id="exclude"}

`exclude()` 関数を使用すると、特定のファイルを配信から除外できます。除外されたファイルがクライアントからリクエストされた場合、サーバーは `403 Forbidden` ステータスコードで応答します。

```kotlin
staticFiles("/files", File("textFiles")) {
    exclude { file -> file.path.contains("excluded") }
}
```

### ファイル拡張子のフォールバック {id="extensions"}

リクエストされたファイルが見つからない場合、Ktorは指定された拡張子をファイル名に追加して検索することができます。

```kotlin
staticResources("/", "static"){
    extensions("html", "htm")
}
```

この例では、`/index` がリクエストされたときに、Ktorは `/index.html` を検索し、見つかったコンテンツを配信します。

### カスタムフォールバック {id="custom-fallback"}

リクエストされた静的リソースが見つからない場合のカスタムフォールバック動作を構成するには、`fallback()` 関数を使用します。
`fallback()` を使用すると、リクエストされたパスを検査して、どのように応答するかを決定できます。たとえば、別のリソースにリダイレクトしたり、特定のHTTPステータスを返したり、代替ファイルを配信したりできます。

`fallback()` は、`staticFiles()`、`staticResources()`、`staticZip()`、または `staticFileSystem()` 内に追加できます。コールバックは、リクエストされたパスと現在の `ApplicationCall` を提供します。

以下の例は、特定の拡張子をリダイレクトしたり、カスタムステータスを返したり、`index.html` にフォールバックしたりする方法を示しています。

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 絶対パス
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 相対パス
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### カスタム修正 {id="modify"}

`modify()` 関数を使用すると、結果のレスポンスにカスタムの修正を適用できます。

```kotlin
staticFiles("/", File("files")) {
    modify { file, call ->
        call.response.headers.append(HttpHeaders.ETag, file.name.toString())
    }
}
```

## エラーの処理 {id="errors"}

リクエストされたコンテンツが見つからない場合、Ktorは自動的に `404 Not Found` HTTPステータスコードで応答します。

エラー処理の構成方法については、[ステータスページ](server-status-pages.md)を参照してください。