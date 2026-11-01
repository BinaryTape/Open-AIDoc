[//]: # (title: 相依注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[相依注入 (DI)](https://en.wikipedia.org/wiki/Dependency_injection) 是一種設計模式，可協助你為組建提供所需的相依性。模組不再直接建立具體實作，而是依賴抽象，並由 DI 容器負責在執行時期建構並提供適當的執行個體。這種分離降低了耦合度、提升了可測試性，並使替換或重新配置實作更加容易，而無需修改現有程式碼。

Ktor 提供了內建的 DI 外掛程式，讓你可以一次性註冊服務與配置物件，並在整個應用程式中存取它們。你可以透過一致且型別安全的方式，[將這些相依性注入模組](server-di-dependency-resolution.md#inject-into-modules)、外掛程式、路由及其他 Ktor 組建中。該外掛程式與 Ktor 應用程式生命週期整合，並支援作用域、結構化配置以及[自動資源管理](server-di-resource-lifecycle-management.md)，讓組織與維護應用程式層級的服務更加輕鬆。

## 新增相依性 {id="add-dependencies"}

若要使用 DI，請在建置指令碼中加入 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 相依注入在 Ktor 中如何運作 {id="how-dependency-injection-works-in-ktor"}

在 Ktor 中，相依注入是一個由兩個緊密相關的步驟組成的單一整合流程：

* [註冊相依性](server-di-dependency-registration.md) — 宣告如何建立執行個體。
* [解析相依性](server-di-dependency-resolution.md) — 在執行時期存取並注入這些執行個體。

這些步驟由單一 DI 容器處理。

若要在應用程式中開始使用相依注入，請先從[註冊相依性](server-di-dependency-registration.md)開始。相依性宣告完成後，接著請參閱[解析相依性](server-di-dependency-resolution.md)。

## 支援的功能 {id="supported-features"}

DI 外掛程式支援多種功能，旨在滿足常見的應用程式需求：

* [型別安全的相依性解析](server-di-dependency-resolution.md)。
* [可選與可為 null 的相依性](server-di-dependency-resolution.md#optional-dependencies)。
* [協變泛型解析](server-di-dependency-resolution.md#covariant-generics)。
* [非同步相依性解析](server-di-dependency-resolution.md#async-dependency-resolution)。
* [自動與自訂資源生命週期管理](server-di-resource-lifecycle-management.md)。

## 配置與生命週期行為 {id="configuration-and-lifecycle-behavior"}

DI 容器的行為可以透過配置選項進行自訂。這些選項控制相依性索引鍵如何比對、如何處理衝突，以及解析在進階案例中的行為方式。

如需配置詳細資訊，請參閱[配置 DI 外掛程式](server-di-configuration.md)。

如需資源清理與關閉行為，請參閱[資源生命週期管理](server-di-resource-lifecycle-management.md)。

## 使用相依注入進行測試 {id="testing-with-dependency-injection"}

DI 外掛程式與 Ktor 的測試公用程式整合，並支援在測試環境中覆寫相依性、載入配置以及控制衝突行為。

如需更多資訊與範例，請參閱[使用相依注入進行測試](server-di-testing.md)。