[//]: # (title: 配置 DI 插件)

<show-structure for="chapter" depth="2"/>

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

您可以在应用程序配置文件中配置[依赖注入 (DI) 插件](server-dependency-injection.md)。这些设置会全局影响依赖解析的行为，并应用于所有已注册的依赖项。

### 依赖键映射 {id="dependency-key-mapping"}

`ktor.di.keyMapping` 属性定义了在解析过程中如何对依赖键进行泛化和匹配。这决定了在解析请求的类型时，哪些已注册的依赖项会被视为兼容。

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

上面的示例与 DI 插件所使用的默认键映射相匹配。

#### 可用的键映射选项 {id="available-key-mapping-options"}

<deflist>
<def>
<title><code>Default</code></title>
使用默认组合：
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"/>
</def>
<def>
<title><code>Supertypes</code></title>
允许使用依赖项的任意超类型来解析该依赖项。
</def>
<def>
<title><code>Nullables</code></title>
允许匹配类型的可空与不可空变体。
</def>
<def>
<title><code>OutTypeArgumentsSupertypes</code></title>
允许 <code>out</code> 类型形参上的协变。
</def>
<def>
<title><code>RawTypes</code></title>
允许在不考虑类型实参的情况下解析泛型类型。
</def>
<def>
<title><code>Unnamed</code></title>
匹配时忽略依赖项名称（<code>@Named</code>）。
</def>
</deflist>

#### 组合键映射选项 {id="combine-key-mapping-options"}

您可以使用设置运算符 `*`（交集）、`+`（并集）和 `()`（分组）来组合键映射选项。

在以下示例中，注册为 `List<String>` 的依赖项可以解析为 `Collection<String>`（`Supertypes`）、`List` 或 `List?`（`RawTypes` 和 `Nullables`）：

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

它不会被解析为 `Collection?`，因为该组合未包含在此表达式中。

### 冲突解决策略 {id="conflict-resolution-policy"}

`ktor.di.conflictPolicy` 属性控制当为同一个依赖键注册了多个提供程序时，DI 容器的行为方式：

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 可用策略 {id="available-policies"}

<deflist>
<def>
<title><code>Default</code></title>
当声明了冲突的依赖项时抛出异常。
</def>
<def>
<title><code>OverridePrevious</code></title>
使用新提供的依赖项覆盖先前的依赖项。
</def>
<def>
<title><code>IgnoreConflicts</code></title>
在测试环境中，DI 插件默认使用 <code>IgnoreConflicts</code>。这允许测试代码覆盖生产依赖项而不会触发错误。
</def>
</deflist>