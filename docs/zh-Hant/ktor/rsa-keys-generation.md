[//]: # (title: RSA 金鑰產生)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA (Rivest–Shamir–Adleman)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) 是一種廣泛使用的公開金鑰密碼系統，可用於實現安全的資料傳輸、數位簽章和金鑰交換。

RS256 是 RSA 加密演算法的一部分，它利用 SHA-256 進行雜湊處理，並使用金鑰（通常為 2048 位元、4096 位元或更高）來確保數位通訊的安全。

在 [JSON Web Token](https://jwt.io/) 驗證領域中，RS256 扮演著至關重要的角色，因為 JWT 的完整性和真實性可以透過簽章機制（例如採用公鑰/私鑰組的 RS256）進行驗證。這可確保權杖內包含的資訊維持防篡改且值得信賴。

在本節中，你將學習如何產生此類金鑰，並將其與 Ktor 提供的 [Authentication JWT](server-jwt.md) 外掛程式搭配使用。

<warning>
<p>
在生產環境中使用時，建議你選擇更現代的替代方案，例如 <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a>，與 RSA 相比，它基於更有效率且更安全的密碼學技術。
</p>
</warning>

## 產生 RSA 私密金鑰 {id="generating-an-rsa-private-key"}

若要產生私密金鑰，你可以使用 OpenSSL、`ssh-keygen` 或其他你習慣用於建立驗證金鑰組的工具。為了進行示範，此處將使用 OpenSSL。

在新的終端視窗中，執行以下指令：

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"/>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html) 指令會使用 RSA 演算法產生 2048 位元的私密金鑰，並將其儲存在指定的檔案中（此處為 `ktor.pk8`）。該檔案的內容經過 [Base64](https://en.wikipedia.org/wiki/Base64) 編碼，因此在衍生公開金鑰之前需要先進行解碼。

> 若要使用來自[程式碼範例](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)中的私密金鑰，請瀏覽至 `src/main/resources` 中的 `application.conf` 檔案，並將該私密金鑰擷取至新的 `.pk8` 檔案中。
>
{style="tip"}

## 衍生公開金鑰 {id="second-step"}

為了從先前產生的私密金鑰中衍生出公開金鑰，你需要執行以下步驟：

1. 解碼私密金鑰。
2. 擷取公開金鑰。
3. 以 PEM 格式儲存公開金鑰。

若要使用 OpenSSL 完成此操作，請執行以下指令：

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"/>

* `openssl rsa`：這是用於處理 RSA 金鑰的 `OpenSSL` 指令。在此情境下，它用於執行與 RSA 金鑰相關的操作。
* `-in ktor.pk8`：此選項指定輸入檔案（`ktor.pk8`），OpenSSL 應從中讀取 RSA 私密金鑰。
* `-pubout`：此選項指示 OpenSSL 輸出與輸入檔案中提供的私密金鑰對應的公開金鑰。
* `|`：管道（|）符號用於將上一個指令的輸出（由 openssl rsa 產生的公開金鑰）重新導向至 tee 指令。
* `tee ktor.spki`：`tee` 是一個命令列公用程式，用於從標準輸入讀取並同時寫入至標準輸出和一個或多個檔案。此部分的指令指示 tee 將接收到的輸入寫入名為 `ktor.spki` 的檔案中。因此，公開金鑰既會顯示在終端上，也會儲存在 `ktor.spki` 檔案中。

有了公開金鑰後，你現在可以衍生其指數（exponent）與模數（modulus）值。

## 擷取模數與指數屬性 {id="extracting-the-modulus-exponent-attributes"}

現在你已經有了金鑰組，你需要擷取公開金鑰的 `e`（指數）和 `n`（模數）屬性，以便在 `jwks.json` 檔案中使用它們。這需要以下步驟：

1. 從你建立的 `.spki` 檔案中讀取公開金鑰。
2. 以人類可讀的格式顯示金鑰資訊。

若要使用 OpenSSL 完成此操作，請執行以下指令：

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"/>

* `pkey`：這是用於處理私密金鑰和公開金鑰的 OpenSSL 命令列公用程式。
* `-in ktor.spki`：指定包含 PEM 格式公開金鑰的輸入檔案。在此情況下，輸入檔案為 `ktor.spki`。
* `-pubin`：表示輸入檔案包含公開金鑰。如果沒有此選項，OpenSSL 會預設輸入檔案包含私密金鑰。
* `-noout`：此選項防止 OpenSSL 輸出編碼後的公開金鑰。該指令只會顯示有關公開金鑰的資訊，實際金鑰不會列印到主控台。
* `-text`：請求 OpenSSL 顯示金鑰的文字表示。這包含金鑰類型、大小以及人類可讀形式的實際金鑰資料等詳細資訊。

預期的輸出如下所示：

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
請注意，在此範例中公開金鑰使用的是 512 位元，這並不安全。理想情況下，你應該選擇 2048 位元或 4096 位元的金鑰。
</p>
</warning>

## 轉換與編碼模數和指數屬性 {id="converting-and-encoding-the-modulus-and-exponent-attributes"}

在前面的步驟中，你擷取了 `jwks.json` 檔案所需的 `n` 和 `e` 屬性。然而，它們是十六進位格式。你現在需要將指數和模數的十六進位表示轉換為各自對應的 [Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications) 編碼。

### 指數 (Exponent) {id="exponent"}

指數屬性的十六進位值為 `0x10001`。若要將該值轉換為 Base64URL，請使用以下指令：

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "/>

* `echo 010001`：此部分的指令使用 `echo` 指令將字串 "010001"（代表 RSA 金鑰的公鑰指數 e）輸出至標準輸出。
* `|`：`|` 字元是一個管道，用於接收前一個指令的輸出並將其作為後續指令的輸入傳遞。
* `xxd -p -r`：此指令用於將十六進位轉換為二進制。它接收十六進位輸入並產生對應的二進制輸出。
* `| base64`：此部分的指令獲取上一步的二進制輸出，並使用 `base64` 指令將其編碼為 Base64 格式。

<note>
<p>
請注意，透過在左側多補一個 0，使用了偶數個十六進位數字。
</p>
</note>

以下是上述指數值的預期輸出：

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

指數的 Base64URL 編碼值為 `AQAB`，在這種情況下不需要進一步處理。在其他情況下，你可能需要使用 `tr` 指令，如下一步所示。

### 模數 (Modulus) {id="modulus"}

對於 `n` 屬性，你將使用 `tr` 公用程式進一步處理模數的十六進位表示。

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: \n&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=\n&quot;"/>

<note>
<p>
請注意，開頭的 00 位元組已被省略。模數中前導的 00 位元組與 RSA 公開金鑰的 ASN.1 編碼有關。在整數的 ASN.1 DER 編碼中，如果整數的最高有效位元為 0，則會移除前導零位元組。這是 ASN.1 編碼規則的標準部分。
在 RSA 公開金鑰的情境下，模數是一個大端序（big-endian）整數，當以 DER 編碼表示時，它遵循這些規則。移除前導零位元組是為了確保根據 DER 規則正確解讀該整數。
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`：此部分的指令 echo 一個多行十六進位字串，代表一系列位元組。每行結尾的反斜線表示行接續。
* `tr -d ": \n"`：`tr` 指令用於刪除引數清單中指定的字元。此處它會從十六進位字串中刪除冒號、空格和換行字元，使其成為連續的十六進位數字字串。
* `xxd -p -r`：`xxd` 是一個用於建立二進制檔案的十六進位傾印（hex dump）或將十六進位傾印轉換回二進制的公用程式。`-p` 選項指定不包含行號或 ASCII 字元欄位的純十六進位傾印。`-r` 選項反轉操作，將十六進位轉換回二進制。
* `base64`：將上一步的二進制輸出編碼為 Base64 格式。
* `tr +/ -_`：將 Base64 輸出中的 + 和 / 字元分別轉換為 - 和 _。這是 URL 安全的 Base64 編碼的常見修改方式。
* `tr -d "=\n"`：從最終的 Base64 編碼字串中移除任何等號（=）和換行字元。

上述指令的輸出為：

```Shell
$ echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:
    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:
    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:
    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:
    2b:d0:87:b4:01" | tr -d ": \n" | xxd -p -r | base64 | tr +/ -_ | tr -d "=\n"
tfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQ
```

透過適當運用 `tr` 指令，模數欄位已被編碼為 Base64URL 字串，你可以在 `jwks.json` 檔案中使用它。

## 填入 jwks.json 檔案 {id="populating-the-jwks-json-file"}

在先前的步驟中，你收集了以下必要資訊：

1. 一組 RSA 金鑰組。
2. Base64URL 格式的 RSA 公開金鑰模數。
3. Base64URL 格式的 RSA 公開金鑰指數。

有了這些資訊後，你現在可以在 Ktor 專案的 [jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) 檔案中填入以下屬性：

- `e` 和 `n` 值填入你在前面步驟中產生的 Base64URL 編碼值。
- 金鑰識別碼（在此情況下，`kid` 衍生自範例專案）。
- `kty` 屬性設定為 `RSA`。

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

唯一剩下的步驟是指定你的私密金鑰，以便你的 Ktor 專案可以將其用於驗證。

## 定義私密金鑰 {id="defining-the-private-key"}

設定好公開金鑰資訊後，最後一步是向你的 Ktor 專案提供對私密金鑰的存取權限。

假設你已將私密金鑰（最初在 `.pk8` 檔案中產生的金鑰）擷取到系統的環境變數中（在此案例中稱為 `jwt_pk`），則你的 `resources/application.conf` 檔案的 jwt 區段應類似於：

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
你的私密金鑰屬於敏感資訊，不應直接儲存在程式碼中。對於敏感資料，請考慮使用環境變數或<a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">機密存放區（secret store）</a>。
</p>
</warning>