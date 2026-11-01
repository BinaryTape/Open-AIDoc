[//]: # (title: 依赖注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依赖注入 (DI)](https://en.wikipedia.org/wiki/Dependency_injection) 是一种设计模式，可帮助你为组件提供所需的依赖项。模块不再直接创建具体实现，而是依赖于抽象，并且由 DI 容器负责在运行时构建并提供相应的实例。这种解耦降低了耦合度，提高了可测试性，并使得在不修改现有代码的情况下替换或重新配置实现变得更加容易。

Ktor 提供了内置的 DI 插件，允许你一次性注册服务和配置对象，并在整个应用程序中访问它们。你可以通过一致且类型安全的方式，[将这些依赖项注入到模块](server-di-dependency-resolution.md#inject-into-modules)、插件、路由以及其他 Ktor 组件中。该插件与 Ktor 应用程序生命周期集成，支持作用域划分、结构化配置以及[自动资源管理](server-di-resource-lifecycle-management.md)，从而使组织和维护应用程序级服务更加轻松。

## 添加依赖项 {id="add-dependencies"}

要使用 DI，请在构建脚本中包含 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 依赖注入在 Ktor 中的工作原理 {id="how-dependency-injection-works-in-ktor"}

在 Ktor 中，依赖注入是一个单一且集成的过程，由两个紧密相关的步骤组成：

* [注册依赖项](server-di-dependency-registration.md) — 声明实例的创建方式。
* [解析依赖项](server-di-dependency-resolution.md) — 在运行时访问并注入这些实例。

这两个步骤均由单个 DI 容器统一处理。

要在应用程序中开始使用依赖注入，请先从[注册依赖项](server-di-dependency-registration.md)开始。在声明依赖项之后，继续学习[解析依赖项](server-di-dependency-resolution.md)。

## 支持的功能 {id="supported-features"}

DI 插件支持一系列旨在满足常见应用程序需求的功能：

* [类型安全的依赖项解析](server-di-dependency-resolution.md)。
* [可选和可为 null 的依赖项](server-di-dependency-resolution.md#optional-dependencies)。
* [协变泛型解析](server-di-dependency-resolution.md#covariant-generics)。
* [异步依赖项解析](server-di-dependency-resolution.md#async-dependency-resolution)。
* [自动与自定义资源生命周期管理](server-di-resource-lifecycle-management.md)。

## 配置与生命周期行为 {id="configuration-and-lifecycle-behavior"}

可以使用配置选项自定义 DI 容器的行为。这些选项用于控制依赖项键的匹配方式、冲突的处理方式，以及高级场景下的解析行为。

有关配置详情，请参阅[配置 DI 插件](server-di-configuration.md)。

有关资源清理和关闭行为，请参阅[资源生命周期管理](server-di-resource-lifecycle-management.md)。

## 使用依赖注入进行测试 {id="testing-with-dependency-injection"}

DI 插件与 Ktor 的测试工具集成，支持在测试环境中覆盖依赖项、加载配置以及控制冲突行为。

有关详细信息和示例，请参阅[使用依赖注入进行测试](server-di-testing.md)。