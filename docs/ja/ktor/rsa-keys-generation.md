[//]: # (title: RSA 鍵の生成)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA（Rivest–Shamir–Adleman）](https://en.wikipedia.org/wiki/RSA_(cryptosystem))は、安全なデータ転送、デジタル署名、鍵交換を可能にする、広く使われている公開鍵暗号システムです。

RSA 暗号アルゴリズムの一部である RS256 は、ハッシュ化に SHA-256 を、デジタル通信の保護に鍵（通常は 2048 ビット、4096 ビット以上）を使用します。

[JSON Web Token](https://jwt.io/)（JWT）認証の領域において、RS256 は重要な役割を果たします。公開鍵/秘密鍵のペアを用いる RS256 などの署名メカニズムを通じて、JWT の完全性と真正性を検証できるためです。これにより、トークンに含まれる情報が改ざんされておらず、信頼できるものであることが保証されます。

このセクションでは、このような鍵を生成し、Ktor が提供する [Authentication JWT](server-jwt.md) プラグインとともに使用する方法を学びます。

<warning>
<p>
本番環境での使用には、RSA と比較してより効率的で安全な暗号化に基づいている <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a> などの、より現代的な代替手段を選択することをお勧めします。
</p>
</warning>

## RSA 秘密鍵の生成 {id="generating-an-rsa-private-key"}

秘密鍵を生成するには、OpenSSL、`ssh-keygen`、または認証鍵ペアを作成するための他の任意のツールを使用できます。ここではデモを目的として OpenSSL を使用します。

新しいターミナルウィンドウで、次のコマンドを実行します。

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"/>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html) コマンドは、RSA アルゴリズムを使用して 2048 ビットの秘密鍵を生成し、指定されたファイル（ここでは `ktor.pk8`）に保存します。このファイルの内容は [Base64](https://en.wikipedia.org/wiki/Base64) でエンコードされているため、公開鍵を導出する前にデコードする必要があります。

> [コード例](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)の秘密鍵を使用するには、`src/main/resources` 内の `application.conf` ファイルに移動し、秘密鍵を新しい `.pk8` ファイルに抽出してください。
>
{style="tip"}

## 公開鍵の導出 {id="second-step"}

先ほど生成した秘密鍵から公開鍵を導出するには、以下の手順を実行する必要があります。

1. 秘密鍵をデコードする。
2. 公開鍵を抽出する。
3. 公開鍵を PEM 形式で保存する。

OpenSSL でこれを行うには、次のコマンドを実行します。

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"/>

* `openssl rsa`: RSA 鍵を操作するための `OpenSSL` コマンドです。このコンテキストでは、RSA 鍵に関連する操作を実行するために使用されます。
* `-in ktor.pk8`: OpenSSL が RSA 秘密鍵を読み込む入力ファイル（`ktor.pk8`）を指定するオプションです。
* `-pubout`: 入力ファイルで提供された秘密鍵に対応する公開鍵を出力するよう OpenSSL に指示するオプションです。
* `|`: パイプ（|）記号は、前のコマンドの出力（`openssl rsa` によって生成された公開鍵）を `tee` コマンドにリダイレクトするために使用されます。
* `tee ktor.spki`: `tee` は、標準入力から読み込み、標準出力と 1 つ以上のファイルの両方に書き込むコマンドラインユーティリティです。コマンドのこの部分は、受け取った入力を `ktor.spki` という名前のファイルに書き込むよう `tee` に指示します。これにより、公開鍵はターミナルに表示されると同時に `ktor.spki` ファイルにも保存されます。

公開鍵が手に入ったら、その指数（exponent）とモジュラス（modulus）の値を導出できるようになります。

## モジュラスと指数属性の抽出 {id="extracting-the-modulus-exponent-attributes"}

鍵ペアを入手できたので、`jwks.json` ファイルで使用するために、公開鍵の `e`（指数）属性と `n`（モジュラス）属性を抽出する必要があります。これには次の手順が必要です。

1. 作成した `.spki` ファイルから公開鍵を読み取る。
2. 人間が読める形式で鍵に関する情報を表示する。

OpenSSL を使用してこれを行うには、次のコマンドを実行します。

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"/>

* `pkey`: 秘密鍵と公開鍵を処理するための OpenSSL コマンドラインユーティリティです。
* `-in ktor.spki`: PEM 形式の公開鍵を含む入力ファイルを指定します。この場合、入力ファイルは `ktor.spki` です。
* `-pubin`: 入力ファイルに公開鍵が含まれていることを示します。このオプションがない場合、OpenSSL は入力ファイルに秘密鍵が含まれていると想定します。
* `-noout`: OpenSSL がエンコードされた公開鍵を出力しないようにするオプションです。コマンドは公開鍵に関する情報のみを表示し、実際の鍵自体はコンソールに出力されません。
* `-text`: 鍵のテキスト表現を表示するよう OpenSSL に要求します。これには、鍵のタイプ、サイズ、人間が読める形式の実際の鍵データなどの詳細が含まれます。

期待される出力は次のようになります。

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
この例では公開鍵に 512 ビットが使用されていますが、これは安全ではない点に注意してください。理想的には、2048 ビットまたは 4096 ビットの鍵を選択する必要があります。
</p>
</warning>

## モジュラスと指数属性の変換とエンコード {id="converting-and-encoding-the-modulus-and-exponent-attributes"}

前のステップで、`jwks.json` ファイルに必要な `n` 属性と `e` 属性を抽出しました。ただし、これらは 16 進数形式になっています。次に、指数とモジュラスの 16 進数表現をそれぞれの [Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications) エンコーディングに変換する必要があります。

### 指数（Exponent） {id="exponent"}

指数属性の 16 進数値は `0x10001` です。この値を Base64URL に変換するには、次のコマンドを使用します。

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "/>

* `echo 010001`: コマンドのこの部分は、`echo` コマンドを使用して、RSA 鍵の公開指数（e）を表す文字列 "010001" を標準出力に出力します。
* `|`: `|` 文字は、前のコマンドからの出力を受け取り、次のコマンドの入力として渡すパイプです。
* `xxd -p -r`: 16 進数をバイナリに変換するために使用されるコマンドです。16 進数の入力を受け取り、対応するバイナリ出力を生成します。
* `| base64`: コマンドのこの部分は、前のステップからのバイナリ出力を受け取り、`base64` コマンドを使用して Base64 形式にエンコードします。

<note>
<p>
左側に余分な 0 を追加することで、16 進数の桁数を偶数にしている点に注意してください。
</p>
</note>

前述の指数の値に対して期待される出力は次のとおりです。

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

指数の Base64URL エンコードされた値は `AQAB` であり、このケースではこれ以上の処理は不要です。他のケースでは、次のステップで示すように `tr` コマンドを使用する必要がある場合があります。

### モジュラス（Modulus） {id="modulus"}

`n` 属性については、モジュラスの 16 進数表現をさらに処理するために `tr` ユーティリティを使用します。

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: \n&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=\n&quot;"/>

<note>
<p>
先頭の 00 バイトが省略されていることに注意してください。モジュラスの先頭の 00 バイトは、RSA 公開鍵の ASN.1 エンコーディングに関連しています。整数の ASN.1 DER エンコーディングでは、整数の最上位ビットが 0 の場合、先頭のゼロバイトは削除されます。これは ASN.1 エンコーディング規則の標準的な部分です。
RSA 公開鍵のコンテキストでは、モジュラスはビッグエンディアンの整数であり、DER エンコーディングで表現される場合、これらの規則に従います。先頭のゼロバイトの削除は、DER 規則に従って整数が正しく解釈されるようにするために行われます。
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`: コマンドのこの部分は、一連のバイトを表す複数行の 16 進数文字列を出力（echo）します。各行末のバックスラッシュは行の継続を示します。
* `tr -d ": \n"`: `tr` コマンドは、引数リストで指定された文字を削除するために使用されます。ここでは、16 進数文字列からコロン、スペース、改行文字を削除し、連続した 16 進数文字列にします。
* `xxd -p -r`: `xxd` は、バイナリファイルの 16 進ダンプを作成したり、16 進ダンプをバイナリに戻したりするためのユーティリティです。`-p` オプションは、行番号や ASCII 文字列のないプレーンな 16 進ダンプを指定します。`-r` オプションは操作を反転し、16 進数をバイナリに戻します。
* `base64`: 前のステップからのバイナリ出力を Base64 形式にエンコードします。
* `tr +/ -_`: Base64 出力内の + 文字と / 文字を、それぞれ - と _ に変換します。これは、URL セーフな Base64 エンコーディングのための一般的な変換です。
* `tr -d "=\n"`: 最終的な Base64 エンコード文字列から等号（=）および改行文字を削除します。

上記コマンドの出力は次のようになります。

```Shell
$ echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:
    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:
    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:
    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:
    2b:d0:87:b4:01" | tr -d ": \n" | xxd -p -r | base64 | tr +/ -_ | tr -d "=\n"
tfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQ
```

`tr` コマンドを適切に活用することで、モジュラスフィールドが `jwks.json` ファイルで使用できる Base64URL 文字列にエンコードされました。

## jwks.json ファイルへの設定 {id="populating-the-jwks-json-file"}

前のステップで、以下の必要な情報を収集しました。

1. RSA 鍵ペア。
2. Base64URL 形式の RSA 公開鍵のモジュラス。
3. Base64URL 形式の RSA 公開鍵の指数。

これらを手元に用意できたら、Ktor プロジェクトの [jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) ファイルに以下の属性を設定できます。

- `e` および `n` の値: 前のステップで生成した Base64URL エンコード値。
- 鍵 ID（このケースでは、`kid` はサンプルプロジェクトから取得されます）。
- `kty` 属性: `RSA`。

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

残るステップは、Ktor プロジェクトが認証に使用できるように秘密鍵を指定することだけです。

## 秘密鍵の定義 {id="defining-the-private-key"}

公開鍵情報の設定が完了したら、最後のステップとして Ktor プロジェクトに秘密鍵へのアクセス権を提供します。

最初に `.pk8` ファイルで生成した秘密鍵を、システムの環境変数（この場合は `jwt_pk`）に抽出したと仮定すると、`resources/application.conf` ファイルの jwt セクションは次のようになります。

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
秘密鍵は機密情報とみなされるため、コード内に直接保存してはいけません。機密データには環境変数または<a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">シークレットストア</a>を使用することを検討してください。
</p>
</warning>