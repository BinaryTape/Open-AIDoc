[//]: # (title: Ktor Client における認証と認可)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-client-auth</code>
</p>
</tldr>

<link-summary>
Auth プラグインは、クライアントアプリケーションにおける認証と認可を処理します。
</link-summary>

Ktor は、クライアントアプリケーションで認証と認可を処理するための [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) プラグインを提供しています。
典型的な使用シナリオには、ユーザーのログインや特定のリソースへのアクセス権の取得が含まれます。

> サーバー側では、Ktor は認証と認可を処理するための [`Authentication`](server-auth.md) プラグインを提供しています。
> 
{style="tip"}

## サポートされている認証タイプ {id="supported"}

HTTP は、アクセス制御と認証のための[一般的なフレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication)を提供しています。Ktor クライアントでは、以下の HTTP 認証スキームを使用できます。

* [Basic](client-basic-auth.md) - `Base64` エンコーディングを使用してユーザー名とパスワードを提供します。通常、HTTPS と組み合わせて使用しない場合は推奨されません。
* [Digest](client-digest-auth.md) - ユーザー名とパスワードにハッシュ関数を適用し、暗号化された形式でユーザーのクレデンシャル（認証情報）を転送する認証方法です。
* [Bearer](client-bearer-auth.md) - ベアラートークンと呼ばれるセキュリティトークンを使用する認証スキームです。たとえば、Google、Facebook、X などの外部プロバイダーを使用してアプリケーションのユーザーを認可するための OAuth フローの一部として、このスキームを使用できます。

## 依存関係の追加 {id="add_dependencies"}

認証を有効にするには、ビルドスクリプトに `ktor-client-auth` アーティファクトを含める必要があります。

<var name="artifact_name" value="ktor-client-auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="/ktor/client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>を参照してください。
</tip>

## Auth のインストール {id="install_plugin"}

`Auth` プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内の `install()` 関数に渡します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 認証の設定を行う
    }
}
```

## 認証の設定 {id="configure_authentication"}

### 認証プロバイダーを選択する {id="choose-provider"}

特定の認証プロバイダー（[`basic`](client-basic-auth.md)、[`digest`](client-digest-auth.md)、または [`bearer`](client-bearer-auth.md)）を使用するには、`install {}` ブロック内で対応する関数を呼び出す必要があります。

たとえば、basic 認証を設定するには、[`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 関数を使用します。

```kotlin
install(Auth) {
    basic {
        // basic 認証の設定
    }
}
```

ブロック内では、そのプロバイダー固有の設定を行うことができます。

> プロバイダー固有の設定については、対応するトピックを参照してください。
> * [Basic 認証](client-basic-auth.md)
> * [Digest 認証](client-digest-auth.md)
> * [Bearer 認証](client-bearer-auth.md)
> 
{style="tip"}

### レルム（realm）を設定する {id="realm"}

必要に応じて、`realm` プロパティを使用してレルムを設定できます。

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

異なるレルムを持つ複数のプロバイダーを作成して、異なるリソースにアクセスすることができます。

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
    basic {
        realm = "Access to the '/admin' path"
        // ...
    }
}
```

この場合、クライアントはレルムを含む `WWW-Authenticate` レスポンスヘッダーに基づいて、必要なプロバイダーを選択します。

## プロバイダーの選択

サーバーが `401 Unauthorized` を返すと、クライアントは `WWW-Authenticate` レスポンスヘッダーに基づいて認証プロバイダーを選択します。このヘッダーは、サーバーが受け入れる認証スキームを指定します。

クライアントに認証プロバイダーが 1 つしかインストールされていない場合、`WWW-Authenticate` ヘッダーが欠落しているか別のスキームを指定していても、サーバーが `401 Unauthorized` を返すと `Auth` プラグインは常にそのプロバイダーを試行します。

クライアントに複数の認証プロバイダーがインストールされている場合、クライアントは `WWW-Authenticate` ヘッダーに基づいてプロバイダーを選択します。

## トークンのキャッシュとキャッシュ制御 {id="token-caching"}

[Basic](client-basic-auth.md) および [Bearer](client-bearer-auth.md) 認証プロバイダーは、内部でクレデンシャルまたはトークンのキャッシュを保持します。このキャッシュにより、クライアントはリクエストごとに認証データをリロードするのではなく、以前にロードされたデータを再利用できるため、クレデンシャルが変更された場合の制御を維持しつつ、パフォーマンスを向上させることができます。

### 認証プロバイダーへのアクセス

クライアントセッション中に認証状態を動的に更新する必要がある場合は、`authProvider` 拡張機能を使用して特定のプロバイダーにアクセスできます。

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

インストールされているすべてのプロバイダーを取得するには、`authProviders` プロパティを使用します。

```kotlin
val providers = client.authProviders
```

これらのユーティリティを使用すると、プロバイダーを検査したり、キャッシュされたトークンをプログラムでクリアしたりできます。

### キャッシュされたトークンのクリア

単一のプロバイダーのキャッシュされたクレデンシャルをクリアするには、`.clearToken()` 関数を使用します。

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

キャッシュのクリアをサポートしているすべての認証プロバイダーにわたって、キャッシュされたトークンをクリアするには、`.clearAuthTokens()` 関数を使用します。

```kotlin
client.clearAuthTokens()
```

キャッシュされたトークンのクリアは、通常、以下のシナリオで使用されます。

* ユーザーがログアウトしたとき。
* アプリケーションに保存されているクレデンシャルまたはトークンが変更されたとき。
* 次回のリクエストでプロバイダーに認証状態を強制的にリロードさせる必要があるとき。

以下は、ユーザーがログアウトしたときにキャッシュされたトークンをクリアする例です。

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### キャッシュ動作の制御

Basic と Bearer の両方の認証プロバイダーでは、`cacheTokens` オプションを使用して、リクエスト間でトークンやクレデンシャルをキャッシュするかどうかを制御できます。

たとえば、クレデンシャルが動的に提供される場合にキャッシュを無効にすることができます。

```kotlin
basic {
    cacheTokens = false   // リクエストごとにクレデンシャルをリロードする
    credentials {
        loadCurrentCredentials()
    }
}
```

トークンキャッシュの無効化は、認証データが頻繁に変更される場合や、最新の状態を反映させる必要がある場合に特に便利です。