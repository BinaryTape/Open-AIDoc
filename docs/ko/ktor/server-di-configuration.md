[//]: # (title: DI 플러그인 구성)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

애플리케이션 구성 파일에서 [의존성 주입(DI) 플러그인](server-dependency-injection.md)을 구성할 수 있습니다. 이러한 설정은 의존성 확인(resolution) 동작에 전역적으로 영향을 미치며, 등록된 모든 의존성에 적용됩니다.

### 의존성 키 매핑 {id="dependency-key-mapping"}

`ktor.di.keyMapping` 속성은 의존성 확인 과정에서 키를 일반화하고 매칭하는 방식을 정의합니다. 이는 요청된 타입을 확인할 때 등록된 어떤 의존성을 호환 가능한 것으로 간주할지 결정합니다.

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

위 예제는 DI 플러그인이 사용하는 기본 키 매핑과 일치합니다.

#### 사용 가능한 키 매핑 옵션 {id="available-key-mapping-options"}

<deflist>
<def>
<title><code>Default</code></title>
기본 조합을 사용합니다:
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"/>
</def>
<def>
<title><code>Supertypes</code></title>
상위 타입(supertype) 중 어느 것으로든 의존성을 확인할 수 있도록 허용합니다.
</def>
<def>
<title><code>Nullables</code></title>
타입의 널 허용(nullable) 및 널 불허(non-nullable) 변형 매칭을 허용합니다.
</def>
<def>
<title><code>OutTypeArgumentsSupertypes</code></title>
<code>out</code> 타입 매개변수에 대한 공변성(covariance)을 허용합니다.
</def>
<def>
<title><code>RawTypes</code></title>
타입 인자를 고려하지 않고 제네릭 타입을 확인할 수 있도록 허용합니다.
</def>
<def>
<title><code>Unnamed</code></title>
매칭 시 의존성 이름(<code>@Named</code>)을 무시합니다.
</def>
</deflist>

#### 키 매핑 옵션 조합 {id="combine-key-mapping-options"}

집합 연산자인 `*`(교집합), `+`(합집합), `()`(그룹화)를 사용하여 키 매핑 옵션을 조합할 수 있습니다.

다음 예제에서 `List<String>`으로 등록된 의존성은 `Collection<String>`(`Supertypes`), `List` 또는 `List?`(`RawTypes` 및 `Nullables`)로 확인할 수 있습니다:

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

이 조합은 표현식에 포함되지 않았으므로 `Collection?`으로는 확인되지 않습니다.

### 충돌 해결 정책 {id="conflict-resolution-policy"}

`ktor.di.conflictPolicy` 속성은 동일한 의존성 키에 대해 여러 프로바이더가 등록되었을 때 DI 컨테이너가 동작하는 방식을 제어합니다:

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 사용 가능한 정책 {id="available-policies"}

<deflist>
<def>
<title><code>Default</code></title>
충돌하는 의존성이 선언되면 예외를 발생시킵니다.
</def>
<def>
<title><code>OverridePrevious</code></title>
이전 의존성을 새로 제공된 의존성으로 덮어씁니다.
</def>
<def>
<title><code>IgnoreConflicts</code></title>
테스트 환경에서 DI 플러그인은 기본적으로 <code>IgnoreConflicts</code>를 사용합니다. 이를 통해 테스트 코드가 오류를 발생시키지 않고 프로덕션 의존성을 재정의할 수 있습니다.
</def>
</deflist>