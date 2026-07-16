[//]: # (title: 依赖注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依赖注入 (DI)](https://en.wikipedia.org/wiki/Dependency_injection) 是一种设计模式，旨在帮助您为组件提供其所需的依赖项。模块不再直接创建具体实现，而是依赖于抽象，并由 DI 容器负责在运行时构建并提供适当的实例。这种分离降低了耦合性，提高了可测试性，并使得在不修改现有代码的情况下替换或重新配置实现变得更加容易。

Ktor 提供了一个内置的 DI 插件，允许您仅注册一次服务和配置对象，并在整个应用程序中访问它们。您可以以一致且类型安全的方式将 [这些依赖项注入到模块](server-di-dependency-resolution.md#inject-into-modules)、插件、路由和其他 Ktor 组件中。该插件与 Ktor 应用程序生命周期集成，并支持作用域、结构化配置和 [自动资源管理](server-di-resource-lifecycle-management.md)，从而使组织和维护应用程序级服务变得更加容易。

## 添加依赖项

要使用 DI，请在构建脚本中包含 `%artifact_name%` 构件：

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

## 依赖注入在 Ktor 中的工作方式

在 Ktor 中，依赖注入是一个单一的集成过程，由两个紧密相关的步骤组成：

* [注册依赖项](server-di-dependency-registration.md) — 声明如何创建实例。
* [解析依赖项](server-di-dependency-resolution.md) — 在运行时访问并注入这些实例。

这些步骤由单个 DI 容器处理。

要开始在您的应用程序中使用依赖注入，请先从 [注册依赖项](server-di-dependency-registration.md) 开始。一旦声明了依赖项，请继续进行 [解析依赖项](server-di-dependency-resolution.md)。

## 支持的功能

DI 插件支持一系列旨在涵盖常见应用程序需求的功能：

* [类型安全的依赖项解析](server-di-dependency-resolution.md)。
* [可选与可为 null 的依赖项](server-di-dependency-resolution.md#optional-dependencies)。
* [协变泛型解析](server-di-dependency-resolution.md#covariant-generics)。
* [异步依赖项解析](server-di-dependency-resolution.md#async-dependency-resolution)。
* [自动与自定义资源生命周期管理](server-di-resource-lifecycle-management.md)。

## 配置与生命周期行为

可以使用配置选项自定义 DI 容器的行为。这些选项控制依赖项键的匹配方式、冲突的处理方式以及在高级方案中解析的行为方式。

有关配置详情，请参阅 [配置 DI 插件](server-di-configuration.md)。

有关资源清理和关闭行为，请参阅 [资源生命周期管理](server-di-resource-lifecycle-management.md)。

## 使用依赖注入进行测试

DI 插件与 Ktor 的测试实用程序集成，并支持在测试环境中重写依赖项、加载配置以及控制冲突行为。

欲了解更多信息和示例，请参阅 [使用依赖注入进行测试](server-di-testing.md)。