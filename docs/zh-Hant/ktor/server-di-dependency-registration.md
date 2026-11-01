[//]: # (title: 相依性註冊)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 的[相依注入 (DI)](server-dependency-injection.md) 容器需要知道如何建立應用程式所相依的物件。這個過程稱為相依性註冊。

### 基本相依性註冊 {id="basic-dependency-registration"}

基本相依性註冊是在程式碼中完成的，通常是在 `Application` 模組內使用 `dependencies {}` 區塊。

您可以透過提供 [Lambda](#lambda-registration)、[函式參照](#function-reference)、[類別參照](#class-reference)或[建構函式參照](#constructor-reference)來註冊相依性：

#### 使用 Lambda {id="lambda-registration"}

當您希望完全控制如何建立執行個體時，請使用 Lambda：

```kotlin
dependencies {
    provide<GreetingService> { GreetingServiceImpl() }
}
```
這會為 `GreetingService` 註冊一個提供者。每當請求 `GreetingService` 時，都會執行該 Lambda 以建立執行個體。

#### 使用建構函式參照 {id="constructor-reference"}

如果某個類別可以使用其建構函式建立，且所有建構函式參數都已在 DI 容器中註冊，則您可以使用建構函式參照。

```kotlin
dependencies {
    provide<GreetingService>(::GreetingServiceImpl)
}
```
這會告訴您的應用程式使用 `GreetingServiceImpl` 的建構函式，並讓 DI 解析其參數。

#### 使用類別參照 {id="class-reference"}

您可以註冊具體類別，而無須將其繫結至介面：

```kotlin
dependencies {
    provide(BankServiceImpl::class)
}
```
在這種情況下，相依性會由其 `BankServiceImpl` 型別進行解析。當實作型別被直接注入且不需要抽象時，這非常有用。

#### 使用函式參照 {id="function-reference"}

您可以註冊一個建立並傳回執行個體的函式：

```kotlin
dependencies {
    provide(::createBankTeller)
}
```

DI 容器會解析函式參數，並將傳回值作為相依性執行個體。

#### 使用工廠 Lambda {id="factory-lambda-registration"}

您可以將函式本身註冊為相依性：

```kotlin
dependencies {
    provide<() -> GreetingService> {
        { GreetingServiceImpl() }
    }
}
```

這會註冊一個可以被注入並手動呼叫以建立新執行個體的函式。

### 具名相依性註冊 {id="named-registration"}

您可以在註冊時為相依性指定名稱，以區分相同型別的多個提供者。

當您需要為單一型別註冊多個實作或執行個體，並在解析期間明確在它們之間進行選擇時，這非常有用。

若要為相依性指定名稱，請將該名稱作為第一個引數傳遞給 `provide()` 函式：

```kotlin
dependencies {
    provide("default") { GreetingServiceImpl() }
    provide("alternative") { AlternativeGreetingServiceImpl() }
}
```

具名相依性必須[使用 `@Named` 註解明確解析](server-di-dependency-resolution.md#resolve-named)。

### 基於配置的相依性註冊 {id="configuration-based-dependency-registration"}

您可以在配置檔案中使用類別路徑參照以宣告方式配置相依性。您可以列出傳回物件的函式，或是具有可解析建構函式的類別。

在您的配置檔案中，將相依性列在 `ktor.application.dependencies` 群組下：

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

Ktor 會使用 DI 容器自動解析函式和建構函式參數。