[//]: # (title: DI 플러그인 구성)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

애플리케이션 설정 파일에서 [의존성 주입(DI) 플러그인](server-dependency-injection.md)을 구성할 수 있습니다. 이 설정은 전역적으로 의존성 해결(resolution) 동작에 영향을 미치며 등록된 모든 의존성에 적용됩니다.

### 의존성 키 매핑 (Dependency key mapping)

`ktor.di.keyMapping` 속성은 의존성 해결 중에 의존성 키가 일반화(generalized)되고 일치(matched)되는 방식을 정의합니다. 이는 요청된 타입을 해결할 때 어떤 등록된 의존성이 호환 가능한 것으로 간주될지를 결정합니다.

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

위의 예제는 DI 플러그인에서 사용하는 기본 키 매핑과 일치합니다.

#### 사용 가능한 키 매핑 옵션

<deflist>
<def>
<title><code>Default</code></title>
기본 조합을 사용합니다:
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"></code-block>
</def>
<def>
<title><code>Supertypes</code></title>
의존성의 상위 타입(supertypes) 중 하나를 사용하여 의존성을 해결할 수 있도록 허용합니다.
</def>
<def>
<title><code>Nullables</code></title>
타입의 Nullable 및 Non-nullable 변형을 일치시킬 수 있도록 허용합니다.
</def>
<def>
<title><code>OutTypeArgumentsSupertypes</code></title>
<code>out</code> 타입 파라미터에 대한 공변성(covariance)을 허용합니다.
</def>
<def>
<title><code>RawTypes</code></title>
타입 인자(type arguments)를 고려하지 않고 제네릭 타입을 해결할 수 있도록 허용합니다.
</def>
<def>
<title><code>Unnamed</code></title>
일치 여부를 확인할 때 의존성 이름(<code>@Named</code>)을 무시합니다.
</def>
</deflist>

#### 키 매핑 옵션 조합

집합 연산자인 `*`(교집합), `+`(합집합) 및 `()`(그룹화)를 사용하여 키 매핑 옵션을 조합할 수 있습니다.

다음 예제에서 `List<String>`으로 등록된 의존성은 `Collection<String>`(`Supertypes`), `List` 또는 `List?`(`RawTypes` 및 `Nullables`)로 해결될 수 있습니다:

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

이 조합은 표현식에 포함되지 않았으므로 `Collection?`으로는 해결되지 않습니다.

### 충돌 해결 정책 (Conflict resolution policy)

`ktor.di.conflictPolicy` 속성은 동일한 의존성 키에 대해 여러 프로바이더가 등록되었을 때 DI 컨테이너가 어떻게 동작할지를 제어합니다.

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 사용 가능한 정책

<deflist>
<def>
<title><code>Default</code></title>
충돌하는 의존성이 선언되면 예외를 발생시킵니다.
</def>
<def>
<title><code>OverridePrevious</code></title>
기존 의존성을 새로 제공된 의존성으로 재정의(override)합니다.
</def>
<def>
<title><code>IgnoreConflicts</code></title>
테스트 환경에서 DI 플러그인은 기본적으로 <code>IgnoreConflicts</code>를 사용합니다. 이를 통해 테스트 코드가 오류를 발생시키지 않고 프로덕션 의존성을 재정의할 수 있습니다.
</def>
</deflist>