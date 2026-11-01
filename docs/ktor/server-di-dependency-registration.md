[//]: # (title: 依赖项注册)

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

Ktor 的 [依赖注入 (DI)](server-dependency-injection.md) 容器需要了解如何创建应用程序所依赖的对象。此过程称为依赖项注册。

### 基础依赖项注册 {id="basic-dependency-registration"}

基础依赖项注册在代码中完成，通常是在 `Application` 模块中使用 `dependencies {}` 代码块。

您可以通过提供 [lambda](#lambda-registration)、[函数引用](#function-reference)、[类引用](#class-reference) 或 [构造函数引用](#constructor-reference) 来注册依赖项：

#### 使用 lambda {id="lambda-registration"}

如果您希望完全控制实例的创建方式，请使用 lambda：

```kotlin
dependencies {
    provide<GreetingService> { GreetingServiceImpl() }
}
```
这将为 `GreetingService` 注册一个提供程序。每当请求 `GreetingService` 时，都会执行该 lambda 来创建实例。

#### 使用构造函数引用 {id="constructor-reference"}

如果某个类可以通过其构造函数创建，并且所有构造函数形参均已在 DI 容器中注册，则可以使用构造函数引用。

```kotlin
dependencies {
    provide<GreetingService>(::GreetingServiceImpl)
}
```
这会指示应用程序使用 `GreetingServiceImpl` 的构造函数，并让 DI 解析其形参。

#### 使用类引用 {id="class-reference"}

您可以注册一个具体类，而无需将其绑定到接口：

```kotlin
dependencies {
    provide(BankServiceImpl::class)
}
```
在这种情况下，依赖项通过其 `BankServiceImpl` 类型进行解析。
当直接注入实现类型且不需要抽象时，这非常有用。

#### 使用函数引用 {id="function-reference"}

您可以注册一个用于创建并返回实例的函数：

```kotlin
dependencies {
    provide(::createBankTeller)
}
```

DI 容器会解析函数形参，并将返回值用作依赖项实例。

#### 使用工厂 lambda {id="factory-lambda-registration"}

您可以将函数本身注册为依赖项：

```kotlin
dependencies {
    provide<() -> GreetingService> {
        { GreetingServiceImpl() }
    }
}
```

这会注册一个可以被注入并手动调用以创建新实例的函数。

### 命名依赖项注册 {id="named-registration"}

您可以在注册时为依赖项指定名称，以区分同一类型的多个提供程序。

当您需要为单个类型注册多个实现或实例，并在解析期间显式选择其中一个时，这非常有用。

要为依赖项指定名称，请将该名称作为第一个实参传递给 `provide()` 函数：

```kotlin
dependencies {
    provide("default") { GreetingServiceImpl() }
    provide("alternative") { AlternativeGreetingServiceImpl() }
}
```

命名依赖项必须[使用 `@Named` 注解显式解析](server-di-dependency-resolution.md#resolve-named)。

### 基于配置的依赖项注册 {id="configuration-based-dependency-registration"}

您可以在配置文件中使用类路径引用声明式配置依赖项。您可以列出一个返回对象的函数，或者一个具有可解析构造函数的类。

在配置文件中的 `ktor.application.dependencies` 分组下列出这些依赖项：

<Tabs>
<TabItem title="application.yaml">

```yaml
ktor:
  application:
    dependencies:
      - com.example.RepositoriesKt.provideDatabase
      - com.example.UserRepository
```

</TabItem>
</Tabs>

Ktor 会使用 DI 容器自动解析函数和构造函数形参。