[//]: # (title: 의존성 주입)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

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

[의존성 주입(Dependency injection, DI)](https://en.wikipedia.org/wiki/Dependency_injection)은 컴포넌트에 필요한 의존성을 제공할 수 있도록 돕는 디자인 패턴입니다. 모듈이 구체적인 구현을 직접 생성하는 대신 추상화에 의존하며, DI 컨테이너가 런타임에 적절한 인스턴스를 생성하고 제공하는 역할을 담당합니다. 이러한 분리를 통해 결합도를 낮추고 테스트 가능성을 향상시키며, 기존 코드를 수정하지 않고도 구현을 쉽게 교체하거나 재구성할 수 있습니다.

Ktor는 서비스 및 설정 객체를 한 번 등록한 후 애플리케이션 전반에서 접근할 수 있도록 하는 내장 DI 플러그인을 제공합니다. 일관되고 타입 안전한(type-safe) 방식으로 [이러한 의존성을 모듈](server-di-dependency-resolution.md#inject-into-modules), 플러그인, 라우트 및 기타 Ktor 컴포넌트에 주입할 수 있습니다. 이 플러그인은 Ktor 애플리케이션 라이프사이클과 통합되며 스코프 지정, 구조화된 설정, [자동 리소스 관리](server-di-resource-lifecycle-management.md)를 지원하여 애플리케이션 수준의 서비스를 구성하고 유지 관리하기 쉽게 해줍니다.

## 의존성 추가 {id="add-dependencies"}

DI를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함하세요:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Ktor에서 의존성 주입이 작동하는 방식 {id="how-dependency-injection-works-in-ktor"}

Ktor에서 의존성 주입은 밀접하게 관련된 두 단계로 구성된 단일 통합 프로세스입니다:

* [의존성 등록](server-di-dependency-registration.md) — 인스턴스 생성 방식 선언.
* [의존성 해결](server-di-dependency-resolution.md) — 런타임에 해당 인스턴스에 접근하고 주입.

이러한 단계는 단일 DI 컨테이너에 의해 처리됩니다.

애플리케이션에서 의존성 주입을 사용하려면 먼저 [의존성 등록](server-di-dependency-registration.md)부터 살펴보세요.
의존성이 선언되고 나면 [의존성 해결](server-di-dependency-resolution.md)을 진행합니다.

## 지원되는 기능 {id="supported-features"}

DI 플러그인은 일반적인 애플리케이션 요구사항을 충족하기 위한 다양한 기능을 지원합니다:

* [타입 안전한 의존성 해결](server-di-dependency-resolution.md).
* [선택적 및 널 허용(Nullable) 의존성](server-di-dependency-resolution.md#optional-dependencies).
* [공변 제네릭(Covariant generic) 해결](server-di-dependency-resolution.md#covariant-generics).
* [비동기 의존성 해결](server-di-dependency-resolution.md#async-dependency-resolution).
* [자동 및 커스텀 리소스 라이프사이클 관리](server-di-resource-lifecycle-management.md).

## 설정 및 라이프사이클 동작 {id="configuration-and-lifecycle-behavior"}

DI 컨테이너의 동작은 설정 옵션을 통해 사용자 정의할 수 있습니다. 이러한 옵션은 의존성 키가 일치하는 방식, 충돌이 처리되는 방식, 그리고 고급 시나리오에서 해결이 작동하는 방식을 제어합니다.

설정에 대한 자세한 내용은 [DI 플러그인 구성](server-di-configuration.md)을 참조하세요.

리소스 정리 및 종료 동작에 대해서는 [리소스 라이프사이클 관리](server-di-resource-lifecycle-management.md)를 참조하세요.

## 의존성 주입을 활용한 테스트 {id="testing-with-dependency-injection"}

DI 플러그인은 Ktor의 테스트 유틸리티와 통합되어 테스트 환경에서 의존성 오버라이드, 설정 로드, 충돌 동작 제어를 지원합니다.

자세한 정보와 예제는 [의존성 주입을 활용한 테스트](server-di-testing.md)를 참조하세요.