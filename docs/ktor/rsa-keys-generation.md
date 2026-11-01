[//]: # (title: RSA 密钥生成)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA (Rivest–Shamir–Adleman)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) 是一种广泛使用的公钥密码系统，可实现安全的数据传输、数字签名和密钥交换。

RS256 是 RSA 加密算法的一部分，它利用 SHA-256 进行哈希计算，并使用密钥（通常为 2048 位、4096 位或更高）来保护数字通信的安全。

在 [JSON Web Token](https://jwt.io/) 身份验证领域，RS256 起着至关重要的作用，因为 JWT 的完整性和真实性可以通过签名机制（例如采用公钥/私钥对的 RS256）来进行验证。这确保了令牌中包含的信息防篡改且值得信赖。

在本节中，你将学习如何生成此类密钥并将其与 Ktor 提供的 [Authentication JWT](server-jwt.md) 插件配合使用。

<warning>
<p>
在生产环境中，建议你选择更现代的替代方案（如 <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a>），与 RSA 相比，它基于更高效、更安全的密码学。
</p>
</warning>

## 生成 RSA 私钥 {id="generating-an-rsa-private-key"}

要生成私钥，可以使用 OpenSSL、`ssh-keygen` 或你选择的其他工具来创建身份验证密钥对。出于演示目的，我们将使用 OpenSSL。

在新的终端窗口中，运行以下命令：

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"/>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html) 命令使用 RSA 算法生成一个 2048 位的私钥，并将其存储在指定的文件中（此处为 `ktor.pk8`）。该文件的内容采用 [Base64](https://en.wikipedia.org/wiki/Base64) 编码，因此在派生公钥之前需要进行解码。

> 要使用来自[代码示例](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)中的私钥，请转到 `src/main/resources` 中的 `application.conf` 文件，并将私钥提取到一个新的 `.pk8` 文件中。
>
{style="tip"}

## 派生公钥 {id="second-step"}

为了从先前生成的私钥中派生出公钥，需要执行以下步骤：

1. 解码私钥。
2. 提取公钥。
3. 将公钥保存为 PEM 格式。

若要使用 OpenSSL 执行此操作，请运行以下命令：

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"/>

* `openssl rsa`：这是用于处理 RSA 密钥的 `OpenSSL` 命令。在此上下文中，它用于执行与 RSA 密钥相关的操作。
* `-in ktor.pk8`：此选项指定输入文件（`ktor.pk8`），OpenSSL 应从中读取 RSA 私钥。
* `-pubout`：此选项指示 OpenSSL 输出与输入文件中提供的私钥相对应的公钥。
* `|`：管道（|）符号用于将前一个命令的输出（由 openssl rsa 生成的公钥）重定向到 tee 命令。
* `tee ktor.spki`：`tee` 是一个命令行实用工具，它从标准输入读取并同时写入标准输出和一个或多个文件。命令的这一部分指示 tee 将接收到的输入写入名为 `ktor.spki` 的文件。因此，公钥既会显示在终端上，也会保存在 `ktor.spki` 文件中。

获得公钥后，你现在可以提取其指数与模数值。

## 提取模数与指数属性 {id="extracting-the-modulus-exponent-attributes"}

现在你已经拥有了密钥对，接下来需要提取公钥的 `e`（指数）和 `n`（模数）属性，以便在 `jwks.json` 文件中使用它们。这需要执行以下步骤：

1. 从创建的 `.spki` 文件中读取公钥。
2. 以人类可读的格式显示有关密钥的信息。

若要使用 OpenSSL 执行此操作，请运行以下命令：

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"/>

* `pkey`：这是用于处理私钥和公钥的 OpenSSL 命令行实用工具。
* `-in ktor.spki`：指定包含 PEM 格式公钥的输入文件。在本例中，输入文件为 `ktor.spki`。
* `-pubin`：指明输入文件包含公钥。若没有此选项，OpenSSL 将假定输入文件包含私钥。
* `-noout`：此选项阻止 OpenSSL 输出已编码的公钥。该命令将仅显示有关公钥的信息，实际的密钥不会打印到控制台。
* `-text`：请求 OpenSSL 以文本形式显示密钥。这包括密钥类型、大小等详细信息，以及人类可读形式的实际密钥数据。

预期输出如下所示：

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
注意，在本示例中公钥使用了 512 位，这是不安全的。理想情况下，应选择 2048 位或 4096 位密钥。
</p>
</warning>

## 转换并编码模数和指数属性 {id="converting-and-encoding-the-modulus-and-exponent-attributes"}

在上一步中，你提取了 `jwks.json` 文件所需的 `n` 和 `e` 属性。但是，它们是十六进制格式。现在，你需要将指数和模数的十六进制表示转换为各自的 [Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications) 编码。

### 指数 {id="exponent"}

指数属性的十六进制值为 `0x10001`。要将该值转换为 Base64URL，请使用以下命令：

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "/>

* `echo 010001`：命令的这一部分使用 `echo` 命令将字符串 "010001"（代表 RSA 密钥的公钥指数 e）输出到标准输出。
* `|`：`|` 字符是一个管道，它获取前一个命令的输出并将其作为输入传递给后一个命令。
* `xxd -p -r`：此命令用于将十六进制转换为二进制。它接收十六进制输入并生成相应的二进制输出。
* `| base64`：命令的这一部分获取上一步的二进制输出，并使用 `base64` 命令将其编码为 Base64 格式。

<note>
<p>
注意，通过在左侧添加一个额外的 0，使用了偶数个十六进制数字。
</p>
</note>

上述指数值的预期输出为：

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

指数的 Base64URL 编码值为 `AQAB`，在此情况下不需要进一步处理。在其他情况下，可能需要使用下一步中所示的 `tr` 命令。

### 模数 {id="modulus"}

对于 `n` 属性，你将使用 `tr` 实用工具进一步处理模数的十六进制表示。

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: \n&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=\n&quot;"/>

<note>
<p>
请注意，前导的 00 字节已被省略。模数中的前导 00 字节与 RSA 公钥的 ASN.1 编码有关。在整数的 ASN.1 DER 编码中，如果整数的最高有效位是 0，则前导零字节会被移除。这是 ASN.1 编码规则的标准部分。
在 RSA 公钥的语境下，模数是一个大端序（big-endian）整数，当以 DER 编码表示时，它遵循这些规则。移除前导零字节是为了确保根据 DER 规则正确解释该整数。
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`：命令的这一部分输出一个表示一系列字节的多行十六进制字符串。每行末尾的反斜杠表示行延续。
* `tr -d ": \n"`：`tr` 命令用于删除实参列表中指定的字符。在此处，它从十六进制字符串中移除冒号、空格和换行符，使其成为连续的十六进制数字字符串。
* `xxd -p -r`：`xxd` 是一个实用工具，用于创建二进制文件的十六进制转储，或将十六进制转储转换回二进制。`-p` 选项指定不带行号或 ASCII 字符列的纯十六进制转储。`-r` 选项反转该操作，将十六进制转换回二进制。
* `base64`：将上一步的二进制输出编码为 Base64 格式。
* `tr +/ -_`：分别将 Base64 输出中的 + 和 / 字符转换为 - 和 _。这是 URL 安全的 Base64 编码的常见转换。
* `tr -d "=\n"`：从最终的 Base64 编码字符串中移除所有等号（=）和换行符。

上述命令的输出为：

```Shell
$ echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:
    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:
    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:
    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:
    2b:d0:87:b4:01" | tr -d ": \n" | xxd -p -r | base64 | tr +/ -_ | tr -d "=\n"
tfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQ
```

通过合理利用 `tr` 命令，模数字段已被编码为 Base64URL 字符串，可供你在 `jwks.json` 文件中使用。

## 填充 jwks.json 文件 {id="populating-the-jwks-json-file"}

在前面的步骤中，你收集了以下必要信息：

1. 一个 RSA 密钥对。
2. Base64URL 格式的 RSA 公钥模数。
3. Base64URL 格式的 RSA 公钥指数。

掌握了这些信息后，你现在可以使用以下属性填充 Ktor 项目的 [jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) 文件：

- 将 `e` 和 `n` 的值设置为你在前面步骤中生成的 Base64URL 编码值。
- 密钥 ID（在本例中，`kid` 源自示例项目）。
- 将 `kty` 属性设置为 `RSA`。

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

唯一剩下的步骤是指定你的私钥，以便你的 Ktor 项目可以使用它进行身份验证。

## 定义私钥 {id="defining-the-private-key"}

设置好公钥信息后，最后一步是让你的 Ktor 项目能够访问你的私钥。

假设你已将最初在 `.pk8` 文件中生成的私钥提取到了系统上的环境变量中（在本例中名为 `jwt_pk`），则 `resources/application.conf` 文件的 jwt 部分应类似于：

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
你的私钥被视为敏感信息，不应直接存储在代码中。对于敏感数据，请考虑使用环境变量或<a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">密钥存储库</a>。
</p>
</warning>