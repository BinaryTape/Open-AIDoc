[//]: # (title: RSA 키 생성)

<show-structure for="chapter" depth="2"/>

<var name="example_name" value="auth-jwt-rs256"/>

<tldr>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[RSA (Rivest–Shamir–Adleman)](https://en.wikipedia.org/wiki/RSA_(cryptosystem))는 안전한 데이터 전송, 디지털 서명 및 키 교환을 가능하게 하는 널리 사용되는 공개 키 암호화 시스템입니다.

RSA 암호화 알고리즘의 일부인 RS256은 해싱을 위해 SHA-256을 사용하며, 디지털 통신을 보호하기 위해 키(보통 2048비트, 4096비트 이상)를 활용합니다.

[JSON Web Token](https://jwt.io/)(JWT) 인증 영역에서 RS256은 중요한 역할을 합니다. JWT의 무결성과 진정성은 공개/개인 키 쌍이 사용되는 RS256과 같은 서명 메커니즘을 통해 검증될 수 있기 때문입니다. 이를 통해 토큰에 포함된 정보가 변조되지 않고 신뢰할 수 있음을 보장합니다.

이 섹션에서는 이러한 키가 어떻게 생성되고 Ktor에서 제공하는 [Authentication JWT](server-jwt.md) 플러그인과 함께 어떻게 사용되는지 알아봅니다.

<warning>
<p>
프로덕션 용도로는 RSA보다 효율적이고 안전한 암호화 기술에 기반한 <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm">ES256</a>과 같은 더 현대적인 대안을 선택하는 것이 좋습니다.
</p>
</warning>

## RSA 개인 키 생성

개인 키를 생성하려면 OpenSSL, `ssh-keygen` 또는 인증 키 쌍 생성을 위한 다른 도구를 사용할 수 있습니다. 여기서는 시연을 위해 OpenSSL을 사용합니다.

새 터미널 창에서 다음 명령을 실행합니다.

<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &amp;gt; ktor.pk8"></code-block>

[openssl genpkey](https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html) 명령은 RSA 알고리즘을 사용하여 2048비트 개인 키를 생성하고 지정된 파일(여기서는 `ktor.pk8`)에 저장합니다. 파일의 내용은 [Base64](https://en.wikipedia.org/wiki/Base64)로 인코딩되어 있으므로 공개 키를 파생시키기 전에 디코딩해야 합니다.

> [코드 예제](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/auth-jwt-rs256/)의 개인 키를 사용하려면 `src/main/resources` 내의 `application.conf` 파일로 이동하여 개인 키를 새로운 `.pk8` 파일로 추출하십시오.
>
{style="tip"}

## 공개 키 파생 {id="second-step"}

이전에 생성한 개인 키에서 공개 키를 파생시키려면 다음 단계를 수행해야 합니다.

1. 개인 키를 디코딩합니다.
2. 공개 키를 추출합니다.
3. 공개 키를 PEM 형식으로 저장합니다.

OpenSSL을 사용하여 이 작업을 수행하려면 다음 명령을 실행하십시오.

<code-block lang="shell" code="openssl rsa -in ktor.pk8 -pubout | tee ktor.spki"></code-block>

* `openssl rsa`: RSA 키 작업을 위한 `OpenSSL` 명령입니다. 이 문맥에서는 RSA 키와 관련된 작업을 수행하는 데 사용됩니다.
* `-in ktor.pk8`: OpenSSL이 RSA 개인 키를 읽어올 입력 파일(`ktor.pk8`)을 지정합니다.
* `-pubout`: 입력 파일에 제공된 개인 키에 해당하는 공개 키를 출력하도록 OpenSSL에 지시합니다.
* `|`: 파이프(|) 기호는 이전 명령의 출력(openssl rsa로 생성된 공개 키)을 tee 명령으로 전달하는 데 사용됩니다.
* `tee ktor.spki`: `tee`는 표준 입력에서 읽어 표준 출력과 하나 이상의 파일에 모두 쓰는 명령줄 유틸리티입니다. 명령의 이 부분은 tee가 받은 입력을 `ktor.spki`라는 파일에 쓰도록 지시합니다. 따라서 공개 키는 터미널에 표시되는 동시에 `ktor.spki` 파일에 저장됩니다.

공개 키가 준비되면 이제 해당 키의 지수(exponent) 및 모듈러스(modulus) 값을 파생시킬 수 있습니다.

## 모듈러스 및 지수 속성 추출

이제 키 쌍이 준비되었으므로, `jwks.json` 파일에서 사용하기 위해 공개 키의 `e`(지수) 및 `n`(모듈러스) 속성을 추출해야 합니다. 여기에는 다음 단계가 필요합니다.

1. 생성한 `.spki` 파일에서 공개 키를 읽습니다.
2. 키에 대한 정보를 사람이 읽을 수 있는 형식으로 표시합니다.

OpenSSL을 사용하여 이 작업을 수행하려면 다음 명령을 실행하십시오.

<code-block lang="shell" code="openssl pkey -in ktor.spki -pubin -noout -text"></code-block>

* `pkey`: 개인 키 및 공개 키를 처리하기 위한 OpenSSL 명령줄 유틸리티입니다.
* `-in ktor.spki`: PEM 형식의 공개 키가 포함된 입력 파일을 지정합니다. 이 경우 입력 파일은 `ktor.spki`입니다.
* `-pubin`: 입력 파일에 공개 키가 포함되어 있음을 나타냅니다. 이 옵션이 없으면 OpenSSL은 입력 파일에 개인 키가 포함되어 있다고 가정합니다.
* `-noout`: 이 옵션은 OpenSSL이 인코딩된 공개 키를 출력하지 않도록 합니다. 명령은 공개 키에 대한 정보만 표시하며 실제 키는 콘솔에 출력되지 않습니다.
* `-text`: 키의 텍스트 표현을 표시하도록 요청합니다. 여기에는 키 유형, 크기 및 사람이 읽을 수 있는 형식의 실제 키 데이터와 같은 세부 정보가 포함됩니다.

예상 출력은 다음과 같습니다.

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
이 예제에서 사용된 공개 키는 보안상 안전하지 않은 512비트를 사용합니다. 이상적으로는 2048비트 또는 4096비트 키를 선택해야 합니다.
</p>
</warning>

## 모듈러스 및 지수 속성 변환 및 인코딩

이전 단계에서 `jwks.json` 파일에 필요한 `n` 및 `e` 속성을 추출했습니다. 그러나 이들은 16진수(hexadecimal) 형식입니다. 이제 지수와 모듈러스의 16진수 표현을 각각의 [Base64URL](https://en.wikipedia.org/wiki/Base64#URL_applications) 인코딩으로 변환해야 합니다.

### 지수 (Exponent)

지수 속성의 16진수 값은 `0x10001`입니다. 이 값을 Base64URL로 변환하려면 다음 명령을 사용하십시오.

<code-block lang="shell" code="echo 010001 | xxd -p -r | base64 "></code-block>

* `echo 010001`: 명령의 이 부분은 RSA 키의 공개 지수(e)를 나타내는 문자열 "010001"을 표준 출력으로 보냅니다.
* `|`: `|` 문자는 이전 명령의 출력을 가져와 다음 명령의 입력으로 전달하는 파이프입니다.
* `xxd -p -r`: 이 명령은 16진수를 바이너리로 변환하는 데 사용됩니다. 16진수 입력을 받아 해당 바이너리 출력을 생성합니다.
* `| base64`: 명령의 이 부분은 이전 단계의 바이너리 출력을 가져와 `base64` 명령을 사용하여 Base64 형식으로 인코딩합니다.

<note>
<p>
왼쪽에 0을 추가하여 16진수 자릿수를 짝수로 맞췄다는 점에 유의하십시오.
</p>
</note>

위에서 언급한 지수 값에 대한 예상 출력은 다음과 같습니다.

```Shell
$ echo 010001 | xxd -p -r | base64
AQAB
```

지수의 Base64URL 인코딩 값은 `AQAB`이며 이 경우에는 추가 처리가 필요하지 않습니다. 다른 경우에는 다음 단계에서 보여주는 것처럼 `tr` 명령을 사용해야 할 수도 있습니다.

### 모듈러스 (Modulus)

`n` 속성의 경우, `tr` 유틸리티를 사용하여 모듈러스의 16진수 표현을 추가로 처리합니다.

<code-block lang="shell" code="echo &quot;b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5:&#10;    7c:c8:9a:fd:d8:61:e7:e4:eb:58:65:1e:ea:5a:4d:&#10;    4c:73:87:32:e0:91:a3:92:56:2e:a7:bc:1e:32:30:&#10;    43:f5:fd:db:05:5a:08:b2:25:15:5f:ac:4d:71:82:&#10;    2b:d0:87:b4:01&quot; | tr -d &quot;: 
&quot; | xxd -p -r | base64 | tr +/ -_ | tr -d &quot;=
&quot;"></code-block>

<note>
<p>
앞에 붙은 00 바이트가 생략되었음에 유의하십시오. 모듈러스의 선행 00 바이트는 RSA 공개 키의 ASN.1 인코딩과 관련이 있습니다. 정수의 ASN.1 DER 인코딩에서 정수의 최상위 비트(most significant bit)가 0이면 선행 제로 바이트가 제거됩니다. 이는 ASN.1 인코딩 규칙의 표준 부분입니다.
RSA 공개 키의 맥락에서 모듈러스는 빅 엔디안(big-endian) 정수이며, DER 인코딩으로 표현될 때 이러한 규칙을 따릅니다. 선행 제로 바이트의 제거는 DER 규칙에 따라 정수가 올바르게 해석되도록 하기 위해 수행됩니다.
</p>
</note>

* `echo "b5:f2:5a:2e:bc:d7:20:b5:20:d5:4d:cd:d4:a5: \ ... "`: 명령의 이 부분은 일련의 바이트를 나타내는 여러 줄의 16진수 문자열을 출력합니다. 각 줄 끝의 백슬래시는 줄 바꿈이 계속됨을 나타냅니다.
* `tr -d ": 
"`: `tr` 명령은 인자 목록에 지정된 문자를 삭제하는 데 사용됩니다. 여기서는 16진수 문자열에서 콜론, 공백 및 줄 바꿈 문자를 제거하여 연속된 16진수 문자열로 만듭니다.
* `xxd -p -r`: `xxd`는 바이너리 파일의 헥스 덤프를 생성하거나 헥스 덤프를 다시 바이너리로 변환하는 유틸리티입니다. `-p` 옵션은 줄 번호나 ASCII 문자 열이 없는 일반 헥스 덤프를 지정합니다. `-r` 옵션은 작업을 반전시켜 헥스를 다시 바이너리로 변환합니다.
* `base64`: 이전 단계의 바이너리 출력을 Base64 형식으로 인코딩합니다.
* `tr +/ -_`: Base64 출력의 + 및 / 문자를 각각 - 및 _로 변환합니다. 이는 URL 안전(URL-safe) Base64 인코딩을 위한 일반적인 수정 사항입니다.
* `tr -d "=
"`: 최종 Base64 인코딩 문자열에서 등호(=)와 줄 바꿈 문자를 제거합니다.

위 명령의 출력은 다음과 같습니다.

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

`tr` 명령을 적절히 활용하여 모듈러스 필드가 `jwks.json` 파일에서 사용할 수 있는 Base64URL 문자열로 인코딩되었습니다.

## jwks.json 파일 채우기

이전 단계에서 다음의 필요한 정보를 수집했습니다.

1. RSA 키 쌍.
2. Base64URL 형식의 RSA 공개 키 모듈러스.
3. Base64URL 형식의 RSA 공개 키 지수.

이 정보가 준비되면 이제 Ktor 프로젝트의 [jwks.json](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) 파일을 다음 속성으로 채울 수 있습니다.

- `e` 및 `n` 값은 이전 단계에서 생성한 Base64URL 인코딩 값으로 채웁니다.
- 키 ID(이 경우 `kid`는 샘플 프로젝트에서 파생됨).
- `kty` 속성은 `RSA`로 지정합니다.

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

남은 마지막 단계는 Ktor 프로젝트에서 인증에 사용할 수 있도록 개인 키를 지정하는 것입니다.

## 개인 키 정의

공개 키 정보 설정이 완료되었으므로, 마지막 단계는 Ktor 프로젝트에서 개인 키에 접근할 수 있도록 하는 것입니다.

시스템의 환경 변수(이 경우 `jwt_pk`)에 개인 키(처음에 `.pk8` 파일로 생성한 것)를 추출했다고 가정하면, `resources/application.conf` 파일의 jwt 섹션은 다음과 같아야 합니다.

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
개인 키는 민감한 정보로 간주되며 코드에 직접 저장해서는 안 됩니다. 민감한 데이터에는 환경 변수나 <a href="https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html">비밀 저장소(secret store)</a>를 사용하는 것을 고려하십시오.
</p>
</warning>