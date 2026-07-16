[//]: # (title: 의존성 주입)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />

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

[의존성 주입(Dependency injection, DI)](https://en.wikipedia.org/wiki/Dependency_injection)은 컴포넌트에 필요한 의존성을 공급하는 데 도움을 주는 디자인 패턴입니다. 구체적인 구현체를 직접 생성하는 대신, 모듈은 추상화에 의존하며, DI 컨테이너가 런타임에 적절한 인스턴스를 생성하고 제공하는 역할을 담당합니다. 이러한 분리는 결합도를 낮추고, 테스트 가능성을 높이며, 기존 코드를 수정하지 않고도 구현체를 교체하거나 재구성하기 쉽게 만들어 줍니다.

Ktor는 서비스와 구성 객체를 한 번 등록한 후 애플리케이션 전반에서 액세스할 수 있는 내장 DI 플러그인을 제공합니다. 이러한 의존성을 [모듈](server-di-dependency-resolution.md#inject-into-modules), 플러그인, 라우트 및 기타 Ktor 컴포넌트에 일관되고 타입 안전한(type-safe) 방식으로 주입할 수 있습니다. 이 플러그인은 Ktor 애플리케이션 수명 주기와 통합되며 스코핑, 구조화된 구성 및 [자동 리소스 관리](server-di-resource-lifecycle-management.md)를 지원하여 애플리케이션 수준의 서비스를 더 쉽게 구성하고 유지 관리할 수 있게 해줍니다.

## 의존성 추가

DI를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함하세요:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## Ktor에서 의존성 주입이 작동하는 방식

Ktor에서 의존성 주입은 서로 밀접하게 관련된 두 단계로 구성된 단일 통합 프로세스입니다:

* [의존성 등록(Registering dependencies)](server-di-dependency-registration.md) — 인스턴스가 생성되는 방식을 선언합니다.
* [의존성 해결(Resolving dependencies)](server-di-dependency-resolution.md) — 런타임에 해당 인스턴스에 액세스하고 주입합니다.

이 단계들은 단일 DI 컨테이너에 의해 처리됩니다.

애플리케이션에서 의존성 주입을 사용하려면 먼저 [의존성 등록](server-di-dependency-registration.md)부터 시작하세요. 의존성이 선언되면 [의존성 해결](server-di-dependency-resolution.md)을 진행할 수 있습니다.

## 지원되는 기능

DI 플러그인은 일반적인 애플리케이션 요구 사항을 충족하기 위한 다양한 기능을 지원합니다:

* [타입 안전한 의존성 해결](server-di-dependency-resolution.md).
* [선택적 및 Null 허용 의존성](server-di-dependency-resolution.md#optional-dependencies).
* [공변 제네릭 해결(Covariant generic resolution)](server-di-dependency-resolution.md#covariant-generics).
* [비동기 의존성 해결](server-di-dependency-resolution.md#async-dependency-resolution).
* [자동 및 커스텀 리소스 수명 주기 관리](server-di-resource-lifecycle-management.md).

## 구성 및 수명 주기 동작

DI 컨테이너의 동작은 구성 옵션을 사용하여 커스텀할 수 있습니다. 이 옵션들은 의존성 키 매칭 방식, 충돌 처리 방식, 고급 시나리오에서의 해결 동작 등을 제어합니다.

구성 세부 사항은 [DI 플러그인 구성](server-di-configuration.md)을 참조하세요.

리소스 정리 및 종료 동작에 대해서는 [리소스 수명 주기 관리](server-di-resource-lifecycle-management.md)를 참조하세요.

## 의존성 주입을 사용한 테스트

DI 플러그인은 Ktor의 테스트 유틸리티와 통합되어 테스트 환경에서 의존성 재정의, 구성 로드 및 충돌 동작 제어를 지원합니다.

더 자세한 정보와 예제는 [의존성 주입을 사용한 테스트](server-di-testing.md)를 참조하세요.