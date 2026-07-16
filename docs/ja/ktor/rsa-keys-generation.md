[//]: # (title: RSA鍵の生成)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA (Rivest–Shamir–Adleman)](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) は、安全なデータ転送、デジタル署名、鍵交換を可能にする、広く使用されている公開鍵暗号システムです。

RSA暗号アルゴリズムの一部であるRS256は、ハッシュ化にSHA-256を使用し、デジタル通信を保護するために鍵（通常は2048ビット、4096ビット以上）を利用します。

[JSON Web Token](https://jwt.io/)（JWT）認証の領域において、RS256は重要な役割を果たします。公開鍵/秘密鍵のペアが採用されるRS256のような署名メカニズムを通じて、JWTの整合性と真正性を検証できるためです。これにより、トークンに含まれる情報が改ざん防止されており、信頼できるものであることが保証されます。

このセクションでは、このような鍵がどのように生成され、Ktorが提供する[Authentication JWT](server-jwt.md)プラグインとともに使用されるかを学びます。

<warning>
<p>
本番環境での使用には、RSAと比較してより効率的で安全な暗号化に基づいた、<a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a>などのより現代的な代替手段を選択することをお勧めします。
</p>
</warning>

## RSA秘密鍵の生成

秘密鍵を生成するには、OpenSSL、`ssh-keygen`、または認証鍵ペアを作成するための他の任意のツールを使用できます。ここではデモンストレーション目的でOpenSSLを使用します。

新しいターミナルウィンドウで、次のコマンドを実行します。

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"></code-block>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html)コマンドは、RSAアルゴリズムを使用して2048ビットの秘密鍵を生成し、指定されたファイル（ここでは`ktor.pk8`）に保存します。このファイルの内容は[Base64](https://en.wikipedia.org/wiki/Base64)でエンコードされているため、公開鍵を導出する前にデコードする必要があります。

> [コード例](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)の秘密鍵を使用するには、`src/main/resources`内の`application.conf`ファイルに移動し、秘密鍵を新しい`.pk8`ファイルに抽出してください。
>
{style="tip"}

## 公開鍵の導出 {id="second-step"}

先ほど生成した秘密鍵から公開鍵を導出するには、次の手順を実行する必要があります。

1. 秘密鍵をデコードする。
2. 公開鍵を抽出する。
3. 公開鍵をPEM形式で保存する。

OpenSSLでこれを行うには、次のコマンドを実行します。

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"></code-block>

* `openssl rsa`: RSA鍵を操作するための`OpenSSL`コマンドです。このコンテキストでは、RSA鍵に関連する操作を実行するために使用されます。
* `-in ktor.pk8`: OpenSSLがRSA秘密鍵を読み込む入力ファイル（`ktor.pk8`）を指定するオプションです。
* `-pubout`: 入力ファイルで提供された秘密鍵に対応する公開鍵を出力するようにOpenSSLに指示するオプションです。
* `|`: パイプ（|）記号は、前のコマンドの出力（openssl rsaによって生成された公開鍵）をteeコマンドにリダイレクトするために使用されます。
* `tee ktor.spki`: `tee`は、標準入力から読み取り、標準出力と1つ以上のファイルの両方に書き込むコマンドラインユーティリティです。コマンドのこの部分は、受け取った入力を`ktor.spki`という名前のファイルに書き込むようteeに指示します。これにより、公開鍵はターミナルに表示されると同時に`ktor.spki`ファイルにも保存されます。

公開鍵が手元にあれば、そのエキスポネント（指数）とモジュラス（係数）の値を導出できます。

## モジュラスとエキスポネント属性の抽出

鍵ペアが用意できたので、`jwks.json`ファイルで使用するために、公開鍵の`e`（エキスポネント）属性と`n`（モジュラス）属性を抽出する必要があります。これには次の手順が必要です。

1. 作成した`.spki`ファイルから公開鍵を読み取る。
2. 鍵に関する情報を人間が読める形式で表示する。

OpenSSLを使用してこれを行うには、次のコマンドを実行します。

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"></code-block>

* `pkey`: 秘密鍵および公開鍵を処理するためのOpenSSLコマンドラインユーティリティです。
* `-in ktor.spki`: PEM形式の公開鍵を含む入力ファイルを指定します。この場合、入力ファイルは`ktor.spki`です。
* `-pubin`: 入力ファイルに公開鍵が含まれていることを示します。このオプションがない場合、OpenSSLは入力ファイルに秘密鍵が含まれていると想定します。
* `-noout`: OpenSSLがエンコードされた公開鍵を出力しないようにするオプションです。コマンドは公開鍵に関する情報のみを表示し、実際の鍵はコンソールに印刷されません。
* `-text`: 鍵のテキスト表現を表示するようにOpenSSLに要求します。これには、鍵のタイプ、サイズ、人間が読める形式の実際の鍵データなどの詳細が含まれます。

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
この例の公開鍵は512ビットを使用していますが、これは安全ではないことに注意してください。理想的には、2048ビットまたは4096ビットの鍵を選択する必要があります。
</p>
</warning>

## モジュラスとエキスポネント属性の変換とエンコード

前のステップで、`jwks.json`ファイルに必要な`n`属性と`e`属性を抽出しました。しかし、これらは16進数形式です。次に、エキスポネントとモジュラスの16進数表現を、それぞれの[Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications)エンコードに変換する必要があります。

### エキスポネント (Exponent)

エキスポネント属性のHEX（16進数）値は`0x10001`です。この値をBase64URLに変換するには、次のコマンドを使用します。

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "></code-block>

* `echo 010001`: コマンドのこの部分は、`echo`コマンドを使用して、RSA鍵の公開エキスポネント（e）を表す文字列 "010001" を標準出力に出力します。
* `|`: `|` 文字は、前のコマンドからの出力を受け取り、それを次のコマンドへの入力として渡すパイプです。
* `xxd -p -r`: このコマンドは、16進数をバイナリに変換するために使用されます。16進数の入力を受け取り、対応するバイナリ出力を生成します。
* `| base64`: コマンドのこの部分は、前のステップからのバイナリ出力を受け取り、`base64`コマンドを使用してBase64形式でエンコードします。

<note>
<p>
左側に余分な0を追加することで、偶数個のHEX桁が使用されていることに注意してください。
</p>
</note>

前述のエキスポネント値に対する期待される出力は次のとおりです。

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

エキスポネントのBase64URLエンコードされた値は`AQAB`であり、このケースではこれ以上の処理は必要ありません。他のケースでは、次のステップで示すように`tr`コマンドを使用する必要がある場合があります。

### モジュラス (Modulus)

`n`属性については、`tr`ユーティリティを使用してモジュラスの16進数表現をさらに処理します。

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: 
&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=
&quot;"></code-block>

<note>
<p>
先頭の00バイトが省略されていることに注意してください。モジュラスの先頭の00バイトは、RSA公開鍵のASN.1エンコードに関連しています。整数のASN.1 DERエンコードでは、整数の最上位ビットが0の場合、先頭のゼロバイトは削除されます。これはASN.1エンコード規則の標準的な部分です。
RSA公開鍵のコンテキストでは、モジュラスはビッグエンディアンの整数であり、DERエンコードで表現される場合、これらの規則に従います。先頭のゼロバイトの削除は、DER規則に従って整数が正しく解釈されることを保証するために行われます。
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`: この部分は、一連のバイトを表す複数行の16進文字列をエコーします。各行の終わりのバックスラッシュは行の継続を示します。
* `tr -d ": 
"`: `tr`コマンドは、引数リストで指定された文字を削除するために使用されます。ここでは、16進文字列からコロン、スペース、改行文字を削除し、16進数の連続した文字列にします。
* `xxd -p -r`: `xxd`は、バイナリファイルのヘキサダンプを作成したり、ヘキサダンプをバイナリに戻したりするためのユーティリティです。`-p`オプションは、行番号やASCII文字カラムのないプレーンなヘキサダンプを指定します。`-r`オプションは操作を逆転させ、16進数をバイナリに戻します。
* `base64`: 前のステップからのバイナリ出力をBase64形式にエンコードします。
* `tr +/ -_`: Base64出力内の `+` と `/` 文字を、それぞれ `-` と `_` に変換します。これは、URLセーフなBase64エンコードのための一般的な修正です。
* `tr -d "=
"`: 最終的なBase64エンコードされた文字列から、等号（=）と改行文字をすべて削除します。

上記のコマンドの出力は次のようになります。

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

`tr`コマンドを適切に活用することで、モジュラスフィールドがBase64URL文字列にエンコードされ、`jwks.json`ファイルで使用できるようになりました。

## jwks.jsonファイルへの設定

前の手順で、以下の必要な情報を収集しました。

1. RSA鍵ペア。
2. Base64URL形式のRSA公開鍵のモジュラス。
3. Base64URL形式のRSA公開鍵のエキスポネント。

これらが手元にあれば、Ktorプロジェクトの[jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)ファイルに以下の属性を設定できます。

- `e` と `n` の値に、前の手順で作成したBase64URLエンコードされた値を設定。
- 鍵ID（この例では、`kid`はサンプルプロジェクトから派生しています）。
- `kty` 属性に `RSA` を設定。

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

残っている唯一のステップは、Ktorプロジェクトが認証に使用できるように秘密鍵を指定することです。

## 秘密鍵の定義

公開鍵情報の設定が完了したら、最後のステップは、Ktorプロジェクトに秘密鍵へのアクセス権を与えることです。

（最初に`.pk8`ファイルで生成した）秘密鍵を、システムの環境変数（この例では`jwt_pk`）に抽出したと仮定すると、`resources/application.conf`ファイルのjwtセクションは次のようになります。

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
秘密鍵は機密情報と見なされ、コード内に直接保存すべきではありません。機密データには環境変数または<a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">シークレットストア</a>の使用を検討してください。
</p>
</warning>