[//]: # (title: 应用程序结构)

<link-summary>
了解如何为了可维护性、模块化和依赖注入组织您的 Ktor 应用程序。
</link-summary>

<show-structure for="chapter" depth="2"/>

Ktor 应用程序可以根据项目规模、领域复杂性和部署环境以多种方式组织。虽然 Ktor 刻意保持无偏见 (unopinionated)，但仍有一些常见的模式和最佳做法有助于保持您的应用程序模块化、可测试且易于扩展。

本主题描述了 Ktor 项目中使用的常见结构，并为选择和应用其中一种结构提供了实用建议。

> 本页面侧重于应用程序级别的结构。有关组织路由的更多信息，请参阅[路由组织](server-routing-organization.md)。

## 默认项目结构 {id="default-project-structure"}

当您使用 [Ktor 项目生成器](https://start.ktor.io/)生成 Ktor 项目时，生成的项目使用单模块结构。此布局非常精简，旨在让您通过一个正常的 Ktor 应用程序快速上手并运行。

```text
project/
└─ src/
   ├─ main/
   │  ├─ kotlin/
   │  │  └─ Application.kt   // 应用程序入口点
   │  └─ resources/
   │     └─ application.conf  // 应用程序配置
   └─ test/
      └─ kotlin/             // 单元测试与集成测试
├─ build.gradle.kts       // Gradle 构建文件
└─ settings.gradle.kts    // Gradle 设置文件
```

虽然这种结构适用于小型应用程序，但随着项目的增长，它的扩展性并不好。对于较大的项目，建议将功能组织到逻辑软件包和模块中，如以下章节所述。

## 选择应用程序结构 {id="choosing_structure"}

选择正确的结构取决于您服务的特性：

- 小型服务通常只需几个[模块](#modular_architecture)和简单的依赖注入即可良好运行。
- 中型应用程序通常受益于一致的[基于功能的结构](#feature_modules)，该结构将相关的路由、服务和数据模型分组在一起。
- 大型或领域繁重的系统可以采用[领域驱动方法](#ddd)，它提供了更清晰的边界，并围绕领域概念组织业务逻辑。
- [微服务导向结构](#microservice-oriented-structure)通常使用混合风格，其中每个服务代表一个领域切片，并且在内部是模块化的。

值得注意的是，这些结构并不是互斥的。您可以结合多种方法 —— 例如，在领域驱动架构中使用基于功能的组织，或者在微服务导向系统中应用模块化。

## 分层结构 {id="layered_structure"}

分层架构将您的应用程序划分为不同的职责：配置、插件、路由、业务逻辑、持久化、领域模型和数据传输对象 (DTO)。这种方法在企业级应用程序中很常见，并为可维护的代码提供了一个清晰的起点。

```text
src/main/kotlin/com/example/app/
├─ config/            // 应用程序配置和环境设置
├─ plugins/           // Ktor 插件（身份验证、序列化、监控）
├─ controller/        // 路由或 API 端点
├─ service/           // 业务逻辑
├─ repository/        // 数据访问或持久化
├─ domain/            // 领域模型和聚合
└─ dto/               // 数据传输对象
```

## 模块化架构 {id="modular_architecture"}

Ktor 通过允许您定义多个应用程序模块来鼓励模块化设计。模块是一个扩展 `Application` 的函数，用于配置应用程序的一部分：

```kotlin
fun Application.customerModule() {
    //…
}
```

每个模块都可以安装插件、配置路由、注册服务或集成基础架构组件。模块可以相互依赖或保持完全独立，这使得该结构对于单体应用和微服务都非常灵活。

依赖项通常在模块边界处注入：

```kotlin
fun Application.customerModule(customerService: CustomerService) {
    routing {
        customerRoutes(customerService)
    }
}
```

模块化结构可以帮助您：

- 分离关注点并隔离功能逻辑
- 仅在需要的地方启用配置或插件安装
- 通过隔离实例化模块来提高可测试性
- 支持微服务友好或插件友好的代码组织
- 在模块边界引入依赖注入

典型的多模块结构可能如下所示：

```text
db/
├─ core/        // 数据库抽象（接口、工厂）
├─ postgres/    // Postgres 实现 (JDBC, Exposed)
└─ mongo/       // MongoDB 实现

server/
├─ core/        // 共享服务器实用程序和常用模块
├─ admin/       // 面向管理员的领域和路由
└─ banking/     // 银行业务领域和路由
```

下面是一个 `server/banking` 模块的 <Path>build.gradle.kts</Path> 文件示例：

```kotlin
plugins {
    id("io.ktor.plugin") version "3.3.3"
}

dependencies {
    implementation(project(":server:core"))
    implementation(project(":db:core"))

    // 存储实现在运行时加载
    runtimeOnly(project(":db:postgres"))
    runtimeOnly(project(":db:mongo"))
}
```

在这种结构中，银行业务模块不会针对任何数据库实现进行编译。它仅依赖于 `db/core`，使领域与基础架构细节保持分离。

> 有关模块化、分层 Ktor 服务器应用程序的完整示例，请参阅 [Ktor Chat](https://github.com/ktorio/ktor-chat) 示例项目。它演示了具有独立领域、应用程序和基础架构层的模块化架构，以及依赖注入和路由组织。

## 基于功能的模块 {id="feature_modules"}

基于功能的组织按功能或垂直切片对代码进行分组。每个功能都成为一个自包含的模块，包含其路由、服务、数据传输对象 (DTO) 和领域逻辑。

```text
app/
├─ customer/
│  ├─ CustomerRoutes.kt     // 客户端点的路由
│  ├─ CustomerService.kt    // 客户功能的业务逻辑
│  └─ CustomerDto.kt        // 客户功能的数据传输对象
└─ order/
   ├─ OrderRoutes.kt        // 订单端点的路由
   ├─ OrderService.kt       // 订单功能的业务逻辑
   └─ OrderDto.kt           // 订单功能的数据传输对象
```

这种结构在中大型单体应用中扩展良好，或者在以后将单个功能拆分为微服务时也很有用。每个功能都可以独立迁移或进行版本控制。一个典型的功能模块可能如下所示：

```kotlin
fun Application.customerModule(service: CustomerService) {
    routing {
        route("/customer") {
            get("/{id}") { 
                call.respond(service.get(call.parameters["id"]!!)) 
            }
            post {
                val dto = call.receive<CustomerDto>()
                call.respond(service.create(dto))
            }
        }
    }
}
```

在上述示例中，模块不知道 `CustomerService` 是如何创建的 —— 它只是接收它，这保持了依赖关系的显式性。

## 领域驱动设计 (DDD) 方法 {id="ddd"}

领域驱动结构围绕其代表的核心业务能力来组织您的应用程序。对于具有复杂业务规则的大型项目，将领域逻辑与传输、持久化和基础架构关注点分离是很有帮助的：

```text
domain/
├─ customer/
│  ├─ Customer.kt           // 领域实体
│  ├─ CustomerService.kt    // 领域服务
│  ├─ CustomerRepository.kt // 领域仓库接口
├─ order/
│  ├─ Order.kt
│  ├─ OrderService.kt
│  └─ OrderRepository.kt

server/                               // Ktor 服务器应用程序（依赖于领域和基础架构）
├─ Authentication.kt                  // 作为独立服务器模块的横切关注点
├─ Customers.kt                       // 客户 HTTP 路由
└─ Orders.kt                          // 订单 HTTP 路由
```

### 领域层 {id="domain-layer"}

领域层保持独立于 Ktor。它通过以下元素定义业务规则：

- _实体 (Entities)_ 代表可识别的领域对象：
```kotlin
data class Customer(
    val id: CustomerId,
    val contacts: List<Contact>
)
```
- _值对象 (Value objects)_ 表达不可变的概念，如标识符或经过验证的字段：
```kotlin
@JvmInline
value class CustomerId(val value: Long)
```
- _聚合 (Aggregates)_ 将相关的实体分组在一个单一的一致性边界下：
```kotlin
class CustomerAggregate(private val customer: Customer) {

    fun addContact(contact: Contact): Customer =
        customer.copy(contacts = customer.contacts + contact)
}
```

- _仓库 (Repositories)_ 抽象了持久化并公开了用于检索或保存聚合的操作。它们的实现在基础架构层中，但接口属于领域。
```kotlin
interface CustomerRepository {
    suspend fun find(id: CustomerId): Customer?
    suspend fun save(customer: Customer)
}
```
- _领域服务 (Domain services)_ 协调跨越多个聚合或不自然属于单个实体的业务逻辑。
```kotlin
class CustomerService(
    private val repository: CustomerRepository,
    private val events: EventPublisher
) {
    suspend fun addContact(id: CustomerId, contact: Contact): Customer? {
        val customer = repository.find(id) ?: return null
        val updated = CustomerAggregate(customer).addContact(contact)
        repository.save(updated)
        events.publish(CustomerContactAdded(id, contact))
        return updated
    }
}
```
- _领域事件 (Domain events)_ 代表有意义的业务变更。它们允许系统的其他部分对这些事件做出反应，而无需直接耦合到产生这些事件的服务。
```kotlin
interface DomainEvent

data class CustomerContactAdded(
    val id: CustomerId,
    val contact: Contact
) : DomainEvent
```
这些元素共同支持丰富的领域模型，同时保持基础架构细节的分离。

### 应用程序和路由层 {id="application-and-routing-layer"}

您通过各自的路由文件或模块函数公开每个领域，并注入管理逻辑和状态的服务：

```kotlin
// server/CustomerRoutes.kt
fun Application.customerRoutes(service: CustomerService) {
    route("/customers") {
        post("/{id}/contacts") {
            val id = call.parameters["id"]!!.toLong()
            val contact = call.receive<Contact>()
            val updated = service.addContact(CustomerId(id), contact)
            call.respond(updated ?: HttpStatusCode.NotFound)
        }

        get("/{id}") {
            val id = call.parameters["id"]!!.toLong()
            val customer = service.findById(CustomerId(id))
            call.respond(customer ?: HttpStatusCode.NotFound)
        }
    }
}
```

```kotlin
// Application.kt
fun Application.module() {
    val customerRepository: CustomerRepository = ExposedCustomerRepository()
    val eventPublisher: EventPublisher = EventPublisherImpl()

    val customerService = CustomerService(customerRepository, eventPublisher)

    routing {
        customerRoutes(customerService)
    }
}
```

> 有关领域驱动应用程序的完整代码示例，请参阅 [Ktor DDD 示例](https://github.com/antonarhipov/ktor-ddd-example/tree/main)。

## 微服务导向结构 {id="microservice-oriented-structure"}

Ktor 应用程序可以组织为微服务，其中每个服务都是一个自包含的模块，可以独立部署。

微服务仓库通常混合使用模块化架构、用于领域隔离的 DDD 以及用于基础架构隔离的 Gradle 多模块构建。

```text
service-customer/
├─ domain/        // 领域模型和聚合
├─ repository/    // 客户服务的持久化层
├─ service/       // 业务逻辑
├─ dto/           // 数据传输对象
├─ controller/    // 路由或 API 端点
├─ plugins/       // 此服务的 Ktor 插件安装
└─ Application.kt // 服务的入口点

service-order/
├─ domain/        // 领域模型和聚合
├─ repository/    // 订单服务的持久化层
├─ service/       // 业务逻辑
├─ dto/           // 数据传输对象
├─ controller/    // 路由或 API 端点
├─ plugins/       // 此服务的 Ktor 插件安装
└─ Application.kt // 服务的入口点
```

在这种结构中，每个服务都拥有一个隔离的领域切片，并在内部保持模块化，与服务发现、指标和外部配置集成。

### 入口点 {id="entry-points"}

Ktor 提供了现成的引擎入口点，例如：

```kotlin
io.ktor.server.cio.EngineMain
```

当使用预设的引擎 `main` 函数时，您不需要定义自定义的 `main()` 方法或专门的 `Application.kt` 入口点文件。

应用程序模块可以在任何源文件中定义，并由引擎根据[配置](server-configuration-file.topic)加载。

### 模块化单体 (Modulith) 部署 {id="modulith-deployment"}

代表服务的多个 Gradle 模块可以独立打包，但在单个 Ktor 应用程序中共同部署，而不是完全独立的微服务。这种方法通常被称为模块化单体 (modulith)。

每个 Gradle 模块在内部保持隔离，并公开一个可以通过配置加载的应用程序模块：

```yaml
# application.yaml

ktor:
  deployment:
    port: 8080

  application:
    modules:
      - com.example.customer.customerModule
      - com.example.order.orderModule
```
