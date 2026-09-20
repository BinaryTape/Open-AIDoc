[//]: # (title: Ktor Server 中的 Digest 驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在不使用額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器 (Native server)</Links> 支援</b>：✖️
</p>
</tldr>

Digest 驗證方案是 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分，用於存取控制與驗證。在此方案中，在透過網路傳送使用者名稱與密碼之前，會先對其套用雜湊函式。

Ktor 支援 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616) (HTTP Digest Access Authentication)，其透過現代安全特性增強了舊版的 RFC 2617，包括更強的雜湊演算法、品質保護 (Quality of Protection) 選項以及用於隱私保護的使用者名稱雜湊。

Ktor 允許您使用 Digest 驗證來登入使用者並保護特定的 [路由 (routes)](server-routing.md)。您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得關於 Ktor 驗證的一般資訊。

> Digest 驗證提供比 [Basic 驗證](server-basic-auth.md) 更強的安全性，因為密碼絕不會以純文字形式傳送。然而，仍建議在生產環境中使用 [HTTPS/TLS](server-ssl.md) 以增加傳輸層級的安全性。

## 新增相依性 {id="add_dependencies"}

若要啟用 `digest` 驗證，您需要在建置指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Digest 驗證流程 {id="flow"}

Digest 驗證流程如下所示：

1. 用戶端向伺服器應用程式中的特定 [路由 (route)](server-routing.md) 發送一個不含 `Authorization` 標頭的請求。
2. 伺服器向用戶端傳回 `401` (Unauthorized) 回應狀態，並使用 `WWW-Authenticate` 回應標頭提供資訊，說明該路由使用 Digest 驗證方案進行保護。典型的 `WWW-Authenticate` 標頭如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   在 Ktor 中，您可以在 [配置](#configure-provider) `digest` 驗證提供者時指定領域 (realm)、支援的演算法、品質保護以及產生 nonce 值的方式。

3. 通常用戶端會顯示一個登入對話方塊，讓使用者輸入憑據。接著，用戶端會發送帶有以下 `Authorization` 標頭的請求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=SHA-512-256,
           qop=auth,
           nc=00000001,
           cnonce="0a4f113b",
           response="6629fae49393a05397450978507c4ef1"
   ```
   {style="block"}

   `response` 值的產生方式如下：

    * `HA1 = H(username:realm:password)`，其中 `H` 為配置的雜湊演算法（例如 SHA-512-256）
   > 此部分 [儲存](#digest-table) 在伺服器上，Ktor 可用來驗證使用者憑據。

    * `HA2 = H(method:digestURI)`（針對 `qop=auth`）或 `HA2 = H(method:digestURI:H(entityBody))`（針對 `qop=auth-int`）

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. 伺服器 [驗證](#configure-provider) 用戶端傳送的憑據，並回應所請求的內容。在成功完成帶有 QoP 的驗證後，伺服器還會傳回 `Authentication-Info` 標頭以進行相互驗證。

## 安裝 Digest 驗證 {id="install"}

若要安裝 `digest` 驗證提供者，請在 `install` 區塊內呼叫 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // 配置 Digest 驗證
    }
}
```

您可以選擇性地指定一個 [提供者名稱 (provider name)](server-auth.md#provider-name)，該名稱可用於 [驗證指定的路由](#authenticate-route)。

## 配置 Digest 驗證 {id="configure"}

若要了解如何在 Ktor 中配置不同驗證提供者的一般概念，請參閱 [配置驗證](server-auth.md#configure)。在本節中，我們將探討 `digest` 驗證提供者的特定配置。

### 步驟 1：選擇雜湊演算法 {id="choose-algorithms"}

Ktor 支援多種用於 Digest 驗證的雜湊演算法。您可以使用 `algorithms` 屬性來配置伺服器接受哪些演算法：

| 演算法 | 常數 | 安全等級 | 備註 |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **建議** | 最強安全性，用於新實作 |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **建議** | 工作階段變體 - 在 HA1 中包含用戶端 nonce |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 良好 | 生產環境的最低建議演算法 |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 良好 | 工作階段變體 - 在 HA1 中包含用戶端 nonce |
| MD5              | `DigestAlgorithm.MD5`              | **棄用** | 僅用於向後相容性 |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **棄用** | 工作階段變體 - 僅用於舊版相容性 |

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Access to the '/' path"
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        // ...
    }
}
```

配置多個演算法時，伺服器會發送多個 `WWW-Authenticate` 標頭，允許用戶端選擇其支援的最強演算法。

> 預設演算法為 `SHA-512-256` 與 `MD5`（用於與舊版用戶端的向後相容性）。

#### 工作階段演算法 (-sess 變體) {id="sess-algorithms"}

`-sess` 演算法變體（例如 `SHA-512-256-sess`、`SHA-256-sess`、`MD5-sess`）會修改 `HA1` 雜湊的計算方式。工作階段演算法不會直接儲存 `H(username:realm:password)`，而是計算 `H(H(username:realm:password):nonce:cnonce)`，其中 `cnonce` 是用戶端提供的 nonce。

**優點：**

- 特定於工作階段的雜湊可防止預先計算的字典攻擊
- 洩漏一個工作階段的雜湊不會暴露密碼，也不會對其他工作階段造成威脅

**缺點：**

- 伺服器必須為每個驗證請求計算雜湊（無法使用預先計算的值）

對於大多數應用程式，標準（非工作階段）演算法已足夠，特別是與 SHA-512-256 等強雜湊函式一起使用時。

### 步驟 2：提供包含 Digest 的使用者表 {id="digest-table"}

`digest` 驗證提供者使用 Digest 訊息的 `HA1` 部分來驗證使用者憑據，因此您可以提供一個包含使用者名稱及其對應 `HA1` 雜湊值的使用者表。

由於不同的演算法會產生不同的雜湊值，您需要為支援的每個演算法儲存適當的雜湊，或者根據用戶端請求的演算法動態計算雜湊：

```kotlin
val userPasswords: Map<String, String> = mapOf(
    "jetbrains" to "foobar",
    "admin" to "password"
)

fun computeHash(
    userName: String,
    realm: String,
    password: String,
    algorithm: DigestAlgorithm
): ByteArray =
    algorithm.toDigester()
        .digest("$userName:$realm:$password".toByteArray(UTF_8))
```

### 步驟 3：配置 Digest 提供者 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 驗證提供者透過 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 類別公開其設定。在下面的範例中，指定了以下設定：

* `realm` 屬性設定要在 `WWW-Authenticate` 標頭中傳遞的領域。
* `algorithms` 屬性指定要接受哪些雜湊演算法。
* `digestProvider` 函式為指定的使用者名稱和演算法獲取 Digest 的 `HA1` 部分。
* （選用）`validate` 函式允許您將憑據映射到自訂的 Principal。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 同時支援現代 SHA-512-256
        // 與舊版 MD5 用戶端
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 使用請求的演算法計算
            // H(username:realm:password)
            userPasswords[userName]?.let { password ->
                computeHash(
                    userName, realm, password, algorithm
                )
            }
        }
        validate { credentials ->
            if (credentials.userName.isNotEmpty()) {
                CustomPrincipal(
                    credentials.userName,
                    credentials.realm
                )
            } else {
                null
            }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型別安全的驗證方案 API 處於實驗階段。它可能隨時被移除或變更。需要明確選擇加入 (Opt-in)。如需詳細資訊，請參閱<a href="server-typed-auth.md#prerequisites">啟用 API</a>。
    </p>
</note>

`digest()` 函式會為您選擇的 Principal 型別建立方案。沒有 `install(Authentication)` 步驟：該方案是一個值，您將其傳遞給需要它的路由。

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 同時支援現代 SHA-512-256
    // 與舊版 MD5 用戶端
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 使用請求的演算法計算
        // H(username:realm:password)
        userPasswords[userName]?.let { password ->
            computeHash(userName, realm, password, algorithm)
        }
    }
    validate { credentials ->
        if (credentials.userName.isNotEmpty()) {
            CustomPrincipal(
                credentials.userName,
                credentials.realm
            )
        } else {
            null
        }
    }
}
```

型別安全的 `digest()` 函式僅在 JVM 上可用。如需完整的 API，請參閱[型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

`digestProvider` 函式接收三個參數：

- `userName` – 來自用戶端請求的使用者名稱
- `realm` - 配置的領域
- `algorithm` – 用戶端正在使用的雜湊演算法

您應該傳回使用指定演算法計算出的 `HA1` 雜湊，如果找不到該使用者則傳回 `null`。

您也可以使用 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 屬性來指定產生 nonce 值的方式。

### 步驟 4：配置品質保護 (Quality of Protection) {id="configure-qop"}

品質保護 (QoP) 決定了 Digest 計算中包含的內容：

- `DigestQop.AUTH` – 僅驗證（預設）。Digest 包含請求方法和 URI。
- `DigestQop.AUTH_INT` – 具有完整性保護的驗證。Digest 還包含請求主體，提供防篡改保護。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure API"
        supportedQop = listOf(
            DigestQop.AUTH,
            DigestQop.AUTH_INT
        )
        // ...
    }
}
```

> 使用 `auth-int` 時，請求主體會在驗證期間被消耗。如果您需要在路由處理常式中存取主體，請安裝 [DoubleReceive](server-double-receive.md) 外掛程式。

### 步驟 5：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置完 `digest` 提供者後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式擷取已驗證的 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)，並取得已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            val user = call.principal<CustomPrincipal>()
            call.respondText("Hello, ${user?.userName}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

將方案傳遞給 `authenticateWith()`。在區塊內，`call.principal` 為您的 Principal 型別且絕不為 `null`，因此不需要型別轉換或 null 檢查：

```kotlin
routing {
    authenticateWith(digestAuth) {
        get("/") {
            val user = call.principal
            call.respondText("Hello, ${user.userName}!")
        }
    }
}
```

</TabItem>
</Tabs>

## 進階配置 {id="advanced"}

### 使用者雜湊支援 {id="userhash"}

RFC 7616 引入了使用者名稱雜湊 (`userhash`) 以保護隱私。啟用後，用戶端可以發送使用者名稱的雜湊版本，而不是純文字使用者名稱。

若要支援使用者名稱雜湊，請配置 `userHashResolver`：

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // 從雜湊中尋找實際的使用者名稱
            users.find { username ->
                val digester = algorithm.toDigester()
                val bytes = "$username:$realm".toByteArray()
                hex(digester.digest(bytes)) == userhash
            }
        }
        digestProvider { userName, realm, algorithm ->
            // ...
        }
    }
}
```

配置 `userHashResolver` 後，伺服器會在 `WWW-Authenticate` 質問標頭中宣告 `userhash=true`。

### 嚴格 RFC 7616 模式 {id="strict-mode"}

為了在沒有舊版用戶端需求的新應用程式中獲得最大安全性，請使用 `strictRfc7616Mode()`：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // 在嚴格模式下，演算法絕不會是 MD5
        }
    }
}
```

嚴格模式：

- 移除 MD5 演算法（僅允許 SHA-256、SHA-512-256 及其工作階段變體）
- 強制使用 UTF-8 字元集

### UTF-8 字元集支援 {id="charset"}

`digest` 驗證提供者支援 UTF-8 字元集，適用於包含非 ASCII 字元的使用者名稱與密碼：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // 此為預設值
        // ...
    }
}
```

### Authentication-Info 標頭 {id="auth-info"}

在成功完成帶有 QoP 的驗證後，伺服器會自動傳回包含以下內容的 `Authentication-Info` 標頭：

- `rspauth` - 用於相互驗證的回應驗證值
- `nextnonce` - 用戶端下一次使用的 nonce
- `qop`、`nc`、`cnonce` - 驗證參數的回顯

這允許用戶端驗證伺服器的身分（相互驗證）。

## 安全建議 {id="security"}

1. **使用 SHA-512-256 或 SHA-256** - 避免在生產環境中使用 MD5；它僅包含用於舊版相容性。

2. **使用 `strictRfc7616Mode()`** - 用於沒有舊版用戶端需求的新應用程式。

3. **實作正確的 nonce 管理** – 使用自訂 `NonceManager` 以防止分散式環境中的重放攻擊。

4. **考慮使用 `auth-int`** - 當請求主體完整性對您的應用程式很重要時。

5. **啟用 `userhash`** - 用於使用者名稱的隱私保護。

6. **務必使用 HTTPS** – 單靠 Digest 驗證並不會加密流量；在生產環境中務必使用 TLS。