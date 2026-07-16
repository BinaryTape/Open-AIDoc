[//]: # (title: 相依注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[相依注入 (DI)](https://en.wikipedia.org/wiki/Dependency_injection) 是一種設計模式，可協助您為組件提供所需的相依性。與其直接建立具體實作，模組更依賴於抽象，而 DI 容器則負責在執行時建構並提供適當的執行個體。這種分離減少了耦合，提高了可測試性，並使得在不修改現有程式碼的情況下更換或重新配置實作變得更加容易。

Ktor 提供了一個內建的 DI 外掛程式，讓您能註冊一次服務和配置物件，並在整個應用程式中存取它們。您可以用一致且型別安全的方式將這些相依性[注入到模組中](server-di-dependency-resolution.md#inject-into-modules)、外掛程式、路由以及其他 Ktor 組件。該外掛程式與 Ktor 應用程式生命週期整合，並支援作用域、結構化配置以及[自動資源管理](server-di-resource-lifecycle-management.md)，這使得組織和維護應用程式層級的服務變得更加輕鬆。

## 新增相依性

若要使用 DI，請在建置指令碼中包含 `%artifact_name%` 構件：

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

## 相依注入在 Ktor 中如何運作

在 Ktor 中，相依注入是一個單一且整合的程序，由兩個密切相關的步驟組成：

* [註冊相依性](server-di-dependency-registration.md) — 宣告執行個體的建立方式。
* [解析相依性](server-di-dependency-resolution.md) — 在執行時存取並注入這些執行個體。

這些步驟由單一 DI 容器處理。

若要開始在應用程式中使用相依注入，請先從[註冊相依性](server-di-dependency-registration.md)開始。一旦宣告了相依性，即可繼續進行[解析相依性](server-di-dependency-resolution.md)。

## 支援的功能

DI 外掛程式支援一系列旨在涵蓋常見應用程式需求的功能：

* [型別安全的相依性解析](server-di-dependency-resolution.md)。
* [選用與可為 null 的相依性](server-di-dependency-resolution.md#optional-dependencies)。
* [協變泛型解析](server-di-dependency-resolution.md#covariant-generics)。
* [非同步相依性解析](server-di-dependency-resolution.md#async-dependency-resolution)。
* [自動與自訂資源生命週期管理](server-di-resource-lifecycle-management.md)。

## 配置與生命週期行為

DI 容器的行為可以使用配置選項進行自訂。這些選項控制相依性金鑰的配對方式、衝突的處理方式，以及在進階情境中解析行為的表現。

有關配置詳情，請參閱[配置 DI 外掛程式](server-di-configuration.md)。

有關資源清理與關閉行為，請參閱[資源生命週期管理](server-di-resource-lifecycle-management.md)。

## 使用相依注入進行測試

DI 外掛程式與 Ktor 的測試公用程式整合，並支援覆寫相依性、載入配置以及在測試環境中控制衝突行為。

若要了解更多資訊與範例，請參閱[使用相依注入進行測試](server-di-testing.md)。