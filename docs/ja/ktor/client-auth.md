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

Ktor は、クライアントアプリケーションで認証と認可を処理するための [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) プラグインを提供しています。一般的な使用シナリオには、ユーザーのログインや特定のリソースへのアクセス取得などがあります。

> サーバー側では、Ktor は認証と認可を処理するための [`Authentication`](server-auth.md) プラグインを提供しています。
> 
{style="tip"}

## サポートされている認証タイプ {id="supported"}

HTTP はアクセス制御と認証のための[一般的なフレームワーク](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)を提供しています。Ktor クライアントでは、以下の HTTP 認証スキームを使用できます:

* [Basic](client-basic-auth.md) - `Base64` エンコーディングを使用してユーザー名とパスワードを提供します。HTTPS と組み合わせて使用しない限り、通常は推奨されません。
* [Digest](client-digest-auth.md) - ユーザー名とパスワードにハッシュ関数を適用することにより、暗号化された形式でユーザー認証情報を通信する認証方式です。
* [Bearer](client-bearer-auth.md) - ベアラートークン（Bearer token）と呼ばれるセキュリティトークンを使用する認証スキームです。例えば、OAuth フローの一部としてこのスキームを使用し、Google、Facebook、X などの外部プロバイダーを利用してアプリケーションのユーザーを認可することができます。

## 依存関係の追加 {id="add_dependencies"}

認証を有効にするには、ビルドスクリプトに `ktor-client-auth` アーティファクトを含めます:

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を説明します。">クライアントの依存関係の追加</Links> を参照してください。
</tip>

## Auth のインストール {id="install_plugin"}

`Auth` プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内の `install()` 関数に渡します:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 認証を設定
    }
}
```

## 認証の設定 {id="configure_authentication"}

### 認証プロバイダーの選択 {id="choose-provider"}

特定の認証プロバイダー（[`basic`](client-basic-auth.md)、[`digest`](client-digest-auth.md)、または [`bearer`](client-bearer-auth.md)）を使用するには、`install {}` ブロック内で対応する関数を呼び出します。

例えば、Basic 認証を設定するには、[`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 関数を使用します:

```kotlin
install(Auth) {
    basic {
        // Basic 認証を設定
    }
}
```

ブロック内では、このプロバイダーに固有の設定を構成できます。

> プロバイダー固有の設定については、対応するトピックを参照してください:
> * [Basic 認証](client-basic-auth.md)
> * [Digest 認証](client-digest-auth.md)
> * [Bearer 認証](client-bearer-auth.md)
> 
{style="tip"}

### レルムの設定 {id="realm"}

必要に応じて、`realm` プロパティを使用してレルムを設定できます:

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

異なるリソースにアクセスするために、異なるレルムを持つ複数のプロバイダーを作成できます:

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

この場合、クライアントはレルムを含む `WWW-Authenticate` レスポンスヘッダーに基づいて必要なプロバイダーを選択します。

## プロバイダーの選択 {id="provider-selection"}

サーバーが `401 Unauthorized` を返すと、クライアントは `WWW-Authenticate` レスポンスヘッダーに基づいて認証プロバイダーを選択します。このヘッダーは、サーバーが受け入れる認証スキームを指定します。

クライアントにインストールされている認証プロバイダーが1つだけの場合、`Auth` プラグインは、サーバーが `401 Unauthorized` を返したときに、`WWW-Authenticate` ヘッダーが存在しないか異なるスキームを指定している場合でも、常にそのプロバイダーを試行します。

クライアントに複数の認証プロバイダーがインストールされている場合、クライアントは `WWW-Authenticate` ヘッダーに基づいてプロバイダーを選択します。

## トークンのキャッシュとキャッシュ制御 {id="token-caching"}

[Basic](client-basic-auth.md) および [Bearer](client-bearer-auth.md) 認証プロバイダーは、内部の認証情報またはトークンのキャッシュを保持します。このキャッシュにより、クライアントはリクエストごとに認証データを再ロードする代わりに、以前ロードした認証データを再利用できるため、パフォーマンスが向上し、認証情報が変更された場合の完全な制御も維持されます。

### 認証プロバイダーへのアクセス {id="accessing-authentication-providers"}

クライアントセッション中に認証状態を動的に更新する必要がある場合は、`authProvider` 拡張機能を使用して特定のプロバイダーにアクセスできます:

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

インストールされているすべてのプロバイダーを取得するには、`authProviders` プロパティを使用します:

```kotlin
val providers = client.authProviders
```

これらのユーティリティを使用すると、プロバイダーをインスペクトしたり、キャッシュされたトークンをプログラムでクリアしたりできます。

### キャッシュされたトークンのクリア {id="clearing-cached-tokens"}

単一プロバイダーのキャッシュされた認証情報をクリアするには、`.clearToken()` 関数を使用します:

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

キャッシュのクリアをサポートしているすべての認証プロバイダーにわたってキャッシュされたトークンをクリアするには、`.clearAuthTokens()` 関数を使用します:

```kotlin
client.clearAuthTokens()
```

キャッシュされたトークンのクリアは、通常、次のようなシナリオで使用されます:

* ユーザーがログアウトしたとき。
* アプリケーションによって保存されている認証情報またはトークンが変更されたとき。
* 次回のリクエストでプロバイダーに認証状態を強制的に再ロードさせる必要があるとき。

以下は、ユーザーがログアウトしたときにキャッシュされたトークンをクリアする例です:

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### キャッシュ動作の制御 {id="controlling-caching-behavior"}

Basic 認証プロバイダーと Bearer 認証プロバイダーは両方とも、`cacheTokens` オプションを使用して、リクエスト間でトークンまたは認証情報をキャッシュするかどうかを制御できます。

例えば、認証情報が動的に提供される場合にキャッシュを無効化できます:

```kotlin
basic {
    cacheTokens = false   // リクエストごとに認証情報を再ロードする
    credentials {
        loadCurrentCredentials()
    }
}
```

トークンのキャッシュを無効にすることは、認証データが頻繁に変更される場合や、最新の状態を反映する必要がある場合に特に役立ちます。