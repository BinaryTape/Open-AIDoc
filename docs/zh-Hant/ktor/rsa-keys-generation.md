[//]: # (title: RSA 金鑰產生)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA (Rivest–Shamir–Adleman)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) 是一種廣泛使用的公鑰加密系統，可用於安全數據傳輸、數位簽章和金鑰交換。

RS256 是 RSA 加密演算法的一部分，利用 SHA-256 進行雜湊，並使用金鑰（通常為 2048 位元、4096 位元或更高）來保護數位通訊。

在 [JSON Web Token](https://jwt.io/) 驗證領域，RS256 扮演著至關重要的角色，因為 JWT 的完整性和真實性可以透過簽章機制（如 RS256，採用公鑰/私鑰對）進行驗證。這確保了令牌中包含的資訊保持防竄改且值得信賴。

在本節中，您將學習如何產生此類金鑰，並將其與 Ktor 提供的 [Authentication JWT](server-jwt.md) 外掛程式結合使用。

<warning>
<p>
對於正式環境，建議您選擇更現代的替代方案，例如 <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a>，與 RSA 相比，它基於更高效且更安全的加密技術。
</p>
</warning>

## 產生 RSA 私鑰

要產生私鑰，您可以使用 OpenSSL、`ssh-keygen` 或其他您選擇的工具來建立驗證金鑰對。為了演示目的，將使用 OpenSSL。

在新的終端視窗中，執行以下指令：

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"></code-block>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html) 指令使用 RSA 演算法產生 2048 位元的私鑰，並將其存儲在指定的檔案中（在此為 `ktor.pk8`）。該檔案的內容經過 [Base64](https://en.wikipedia.org/wiki/Base64) 編碼，因此在衍生公鑰之前需要進行解碼。

> 若要使用來自
> [程式碼範例](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)
> 的私鑰，請導覽至 `src/main/resources` 內的 `application.conf` 檔案，並將私鑰提取到新的 `.pk8` 檔案中。
>
{style="tip"}

## 衍生公鑰 {id="second-step"}

為了從您先前產生的私鑰衍生出公鑰，您需要執行以下步驟：

1. 解碼私鑰。
2. 提取公鑰。
3. 將公鑰以 PEM 格式儲存。

若要使用 OpenSSL 執行此操作，請執行以下指令：

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"></code-block>

* `openssl rsa`：這是處理 RSA 金鑰的 `OpenSSL` 指令。在此上下文中，它用於執行與 RSA 金鑰相關的操作。
* `-in ktor.pk8`：此選項指定 OpenSSL 應從中讀取 RSA 私鑰的輸入檔案（`ktor.pk8`）。
* `-pubout`：此選項指示 OpenSSL 輸出與輸入檔案中提供的私鑰相對應的公鑰。
* `|`：管道 (|) 符號用於將前一個指令的輸出（由 openssl rsa 產生的公鑰）重新導向到 tee 指令。
* `tee ktor.spki`：`tee` 是一個命令列公用程式，它從標準輸入讀取並同時寫入標準輸出和一個或多個檔案。指令的這一部分指示 tee 將接收到的輸入寫入名為 `ktor.spki` 的檔案。因此，公鑰將同時顯示在終端上並儲存在 `ktor.spki` 檔案中。

有了公鑰後，您現在可以衍生其指數 (exponent) 和模數 (modulus) 的值。

## 提取模數與指數屬性

現在您已經有了金鑰對，您需要提取公鑰的 `e`（指數）和 `n`（模數）屬性，以便在 `jwks.json` 檔案中使用它們。這需要以下步驟：

1. 從您建立的 `.spki` 檔案中讀取公鑰。
2. 以易於閱讀的格式顯示金鑰資訊。

若要使用 OpenSSL 執行此操作，請執行以下指令：

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"></code-block>

* `pkey`：這是用於處理私鑰和公鑰的 OpenSSL 命令列公用程式。
* `-in ktor.spki`：指定包含 PEM 格式公鑰的輸入檔案。在這種情況下，輸入檔案是 `ktor.spki`。
* `-pubin`：表示輸入檔案包含公鑰。如果沒有這個選項，OpenSSL 會假設輸入檔案包含私鑰。
* `-noout`：此選項防止 OpenSSL 輸出編碼後的公鑰。該指令只會顯示有關公鑰的資訊，實際的金鑰不會列印到主控台。
* `-text`：要求 OpenSSL 顯示金鑰的文字表示。這包括金鑰類型、大小以及易於閱讀格式的實際金鑰資料等細節。

預期輸出如下所示：

```Shell
$ openssl pkey -in ktor.spki -pubin -noout -text
RSA Public-Key: (512 bit)
Modulus:
    00:b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:
    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:
    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:
    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:
    2b:d0:87:b4:01
Exponent: 65537 (0x10001)
```

<warning>
<p>
請注意，在此範例中公鑰使用 512 位元，這是不安全的。理想情況下，您應該選擇 2048 位元或 4096 位元的金鑰。
</p>
</warning>

## 轉換與編碼模數和指數屬性

在上一個步驟中，您提取了 `jwks.json` 檔案所需的 `n` 和 `e` 屬性。然而，它們是十六進位格式。您現在需要將指數和模數的十六進位表示形式轉換為其各自的 [Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications) 編碼。

### 指數 (Exponent)

指數屬性的十六進位值為 `0x10001`。要將值轉換為 Base64URL，請使用以下指令：

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "></code-block>

* `echo 010001`：指令的這一部分使用 `echo` 指令將字串 "010001"（代表 RSA 金鑰的公有指數 (e)）輸出到標準輸出。
* `|`：`|` 字元是一個管道，它將前一個指令的輸出作為輸入傳遞給下一個指令。
* `xxd -p -r`：此指令用於將十六進位轉換為二進位。它接收十六進位輸入並產生相應的二進位輸出。
* `| base64`：指令的這一部分接收上一步的二進位輸出，並使用 `base64` 指令將其編碼為 Base64 格式。

<note>
<p>
請注意，透過在左側添加一個額外的 0，使用了偶數個十六進位位數。
</p>
</note>

以下是上述指數值的預期輸出：

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

指數的 Base64URL 編碼值為 `AQAB`，在這種情況下不需要進一步處理。在其他情況下，您可能需要使用下一個步驟中所示的 `tr` 指令。

### 模數 (Modulus)

對於 `n` 屬性，您將使用 `tr` 公用程式進一步處理模數的十六進位表示。

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: 
&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=
&quot;"></code-block>

<note>
<p>
請注意，前導的 00 位元組已被省略。模數中的前導 00 位元組與 RSA 公鑰的 ASN.1 編碼有關。在整數的 ASN.1 DER 編碼中，如果整數的最高有效位元為 0，則移除前導零位元組。這是 ASN.1 編碼規則的標準部分。
在 RSA 公鑰的上下文中，模數是一個大端 (big-endian) 整數，當以 DER 編碼表示時，它遵循這些規則。移除前導零位元組是為了確保根據 DER 規則正確解讀整數。
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`：指令的這一部分輸出一個多行十六進位字串，代表一系列位元組。每行末尾的反斜線表示行延續。
* `tr -d ": 
"`：`tr` 指令用於刪除參數清單中指定的字元。在這裡，它從十六進位字串中移除冒號、空格和換行符，使其成為連續的十六進位數字字串。
* `xxd -p -r`：`xxd` 是一個用於建立二進位檔案的十六進位傾印或將十六進位傾印轉換回二進位的公用程式。`-p` 選項指定不含行號或 ASCII 字元欄位的純十六進位傾印。`-r` 選項反轉操作，將十六進位轉換回二進位。
* `base64`：將上一步的二進位輸出編碼為 Base64 格式。
* `tr +/ -_`：將 Base64 輸出中的 + 和 / 字元分別轉換為 - 和 _。這是 URL 安全 Base64 編碼的常見修改。
* `tr -d "=
"`：從最終的 Base64 編碼字串中移除任何等號 (=) 和換行符。

上述指令的輸出為：

```Shell
$ echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:
    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:
    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:
    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:
    2b:d0:87:b4:01" | tr -d ": 
" | xxd -p -r | base64 | tr +/ -_ | tr -d "=
"
tfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQ
```

透過正確利用 `tr` 指令，模數欄位已被編碼為一個 Base64URL 字串，您可以在 `jwks.json` 檔案中使用它。

## 填寫 jwks.json 檔案

在先前的步驟中，您收集了以下必要資訊：

1. 一個 RSA 金鑰對。
2. Base64URL 格式的 RSA 公鑰模數。
3. Base64URL 格式的 RSA 公鑰指數。

有了這些後，您現在可以使用以下屬性填寫 Ktor 專案的 [jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) 檔案：

- `e` 和 `n` 值使用您在先前步驟中產生的 Base64URL 編碼值。
- 金鑰 ID（在這種情況下，`kid` 是從範例專案衍生的）。
- `kty` 屬性為 `RSA`。

```json
{
  "keys": [
    {
      "kty": "RSA",
      "e": "AQAB",
      "kid": "6f8856ed-9189-488f-9011-0ff4b6c08edc",
      "n":"tfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQ"
    }
  ]
}
```

剩下的唯一步驟是指定您的私鑰，以便您的 Ktor 專案可以使用它進行驗證。

## 定義私鑰

設定好公鑰資訊後，最後一個步驟是讓您的 Ktor 專案能夠存取您的私鑰。

假設您已將私鑰（您在開始時產生的 `.pk8` 檔案）提取到系統中的環境變數中（在此案例中稱為 `jwt_pk`），則 `resources/application.conf` 檔案的 jwt 區段應類似於：

```
jwt {
  privateKey = ${jwt_pk}
  issuer = "http://0.0.0.0:8080/"
  audience = "http://0.0.0.0:8080/login"
  realm = "MyProject"
}
```

<warning>
<p>
您的私鑰被視為敏感資訊，不應直接儲存在程式碼中。請考慮為敏感數據使用環境變數或<a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">秘密存儲 (secret store)</a>。
</p>
</warning>