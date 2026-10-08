[//]: # (title: 應用程式結構)

<link-summary>
了解如何組織您的 Ktor 應用程式，以實現可維護性、模組化和相依注入。
</link-summary>

<show-structure for="chapter" depth="2"/>

Ktor 應用程式可以根據專案大小、網域複雜度和部署環境，以多種方式進行組織。雖然 Ktor 有意保持不預設立場，但仍有一些常見模式和最佳實務，可協助保持應用程式的模組化、可測試性且易於擴展。

本主題說明 Ktor 專案中使用的常見結構，並提供選擇與應用結構的實務建議。

> 本頁面重點在於應用程式層級的結構。如需更多關於組織路由的資訊，請參閱 [路由組織](server-routing-organization.md)。
>

## 預設專案結構 {id="default-project-structure"}

當您使用 [Ktor 專案產生器](https://start.ktor.io/) 產生 Ktor 專案時，產出的專案會使用單一模組結構。此配置非常精簡，旨在讓您快速啟動並執行一個運作中的 Ktor 應用程式。

```text
project/
└─ src/
   ├─ main/
   │  ├─ kotlin/
   │  │  └─ Application.kt   // 應用程式進入點
   │  └─ resources/
   │     └─ application.conf  // 應用程式配置
   └─ test/
      └─ kotlin/             // 單元測試與整合測試
├─ build.gradle.kts       // Gradle 組建檔案
└─ settings.gradle.kts    // Gradle 設定檔案
```

雖然此結構適用於小型應用程式，但隨著專案成長，其擴展性並不佳。對於較大的專案，建議將功能組織到邏輯套件與模組中，如下列章節所述。

## 選擇應用程式結構 {id="choosing_structure"}

選擇正確的結構取決於您服務的特性：

- 小型服務通常只需幾個 [模組](#modular_architecture) 和簡單的相依注入即可運作良好。
- 中型應用程式通常受益於一致的 [基於功能的結構](#feature_modules)，將相關的路由、服務和資料模型分組在一起。
- 大型或網域繁重的系統可以採用 [網域驅動方法](#ddd)，這能提供更清晰的邊界，並圍繞網域概念組織業務邏輯。
- [微服務導向結構](#microservice-oriented-structure) 通常使用混合樣式，其中每個服務代表一個網域切片，且內部是模組化的。

值得注意的是，這些結構並非互斥。您可以結合多種方法——例如，在網域驅動架構中使用基於功能的組織，或在微服務導向系統中應用模組化。

## 分層結構 {id="layered_structure"}

分層架構將您的應用程式拆分為不同的職責：配置、外掛程式、路由、業務邏輯、持久化、網域模型和資料傳輸物件 (DTO)。這種方法在企業級應用程式中很常見，並為可維護的程式碼提供了一個清晰的起點。

```text
src/main/kotlin/com/example/app/
├─ config/            // 應用程式配置與環境設定
├─ plugins/           // Ktor 外掛程式 (驗證、序列化、監控)
├─ controller/        // 路由或 API 端點
├─ service/           // 業務邏輯
├─ repository/        // 資料存取或持久化
├─ domain/            // 網域模型與聚合
└─ dto/               // 資料傳輸物件
```

## 模組化架構 {id="modular_architecture"}

Ktor 透過允許您定義多個應用程式模組來鼓勵模組化設計。模組是一個擴充 `Application` 的函式，用於配置應用程式的一部分：

```kotlin
fun Application.customerModule() {
    //…
}
```

每個模組都可以安裝外掛程式、配置路由、註冊服務或整合基礎結構組件。模組可以相互依賴或保持完全獨立，這使得這種結構對於單體式應用和微服務都具有靈活性。

相依項通常在模組邊界處注入：

```kotlin
fun Application.customerModule(customerService: CustomerService) {
    routing {
        customerRoutes(customerService)
    }
}
```

模組化結構可協助您：

- 分離關注點並隔離功能邏輯
- 僅在需要之處啟用配置或外掛程式安裝
- 透過隔離具現化模組來提高可測試性
- 支援微服務友善或外掛程式友善的程式碼組織
- 在模組邊界引入相依注入

典型的多模組結構可能如下所示：

```text
db/
├─ core/        // 資料庫抽象 (介面、工廠)
├─ postgres/    // Postgres 實作 (JDBC, Exposed)
└─ mongo/       // MongoDB 實作

server/
├─ core/        // 共用的伺服器公用程式與通用模組
├─ admin/       // 面向管理者的網域與路由
└─ banking/     // 銀行網域與路由
```

以下是 `server/banking` 模組的 <Path>build.gradle.kts</Path> 檔案範例：

```kotlin
plugins {
    id("io.ktor.plugin") version "3.3.3"
}

dependencies {
    implementation(project(":server:core"))
    implementation(project(":db:core"))

    // 儲存實作在執行階段載入
    runtimeOnly(project(":db:postgres"))
    runtimeOnly(project(":db:mongo"))
}
```

在此結構中，銀行模組不會針對任何資料庫實作進行編譯。它僅相依於 `db/core`，使網域與基礎結構細節保持分離。

> 如需模組化、分層的 Ktor 伺服器應用程式完整範例，請參閱 [Ktor Chat](https://github.com/ktorio/ktor-chat) 範例專案。它展示了具有獨立網域、應用程式和基礎結構層的模組化架構，以及相依注入和路由組織。

## 基於功能的模組 {id="feature_modules"}

基於功能的組織按功能或垂直切片對程式碼進行分組。每個功能都成為一個獨立的模組，包含其路由、服務、資料傳輸物件 (DTO) 和網域邏輯。

```text
app/
├─ customer/
│  ├─ CustomerRoutes.kt     // 客戶端點的路由
│  ├─ CustomerService.kt    // 客戶功能的業務邏輯
│  └─ CustomerDto.kt        // 客戶功能的資料傳輸物件
└─ order/
   ├─ OrderRoutes.kt        // 訂單端點的路由
   ├─ OrderService.kt       // 訂單功能的業務邏輯
   └─ OrderDto.kt           // 訂單功能的資料傳輸物件
```

這種結構在大型單體式應用中具有良好的擴展性，或者在以後將個別功能拆分為微服務時也非常有用。每個功能都可以獨立遷移或進行版本控制。一個典型的功能模組可能如下所示：

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

在上述範例中，模組不知道 `CustomerService` 是如何建立的——它只是接收它，這使得相依項保持明確。

## 網域驅動設計 (DDD) 方法 {id="ddd"}

網域驅動結構圍繞其代表的核心業務能力來組織應用程式。對於具有複雜業務規則的大型專案，將網域邏輯與傳輸、持久化和基礎結構關注點分離會非常有幫助：

```text
domain/
├─ customer/
│  ├─ Customer.kt           // 網域實體
│  ├─ CustomerService.kt    // 網域服務
│  ├─ CustomerRepository.kt // 網域存儲庫介面
├─ order/
│  ├─ Order.kt
│  ├─ OrderService.kt
│  └─ OrderRepository.kt

server/                               // Ktor 伺服器應用程式 (相依於網域與基礎結構)
├─ Authentication.kt                  // 作為獨立伺服器模組的橫切關注點
├─ Customers.kt                       // 客戶 HTTP 路由
└─ Orders.kt                          // 訂單 HTTP 路由
```
### 網域層 {id="domain-layer"}

網域層保持獨立於 Ktor。它透過以下元素定義業務規則：

- **實體 (Entities)** 代表具備唯一識別性的網域物件：
```kotlin
data class Customer(
    val id: CustomerId,
    val contacts: List<Contact>
)
```
- **值物件 (Value objects)** 表達不可變的概念，例如識別碼或經過驗證的欄位：
```kotlin
@JvmInline
value class CustomerId(val value: Long)
```
- **聚合 (Aggregates)** 將相關實體歸類在單一一致性邊界下：
```kotlin
class CustomerAggregate(private val customer: Customer) {

    fun addContact(contact: Contact): Customer =
        customer.copy(contacts = customer.contacts + contact)
}
```

- **存儲庫 (Repositories)** 抽象化持久化並公開擷取或儲存聚合的操作。其實作位於基礎結構層中，但介面屬於網域。
```kotlin
interface CustomerRepository {
    suspend fun find(id: CustomerId): Customer?
    suspend fun save(customer: Customer)
}
```
- **網域服務 (Domain services)** 協調跨多個聚合或不自然屬於單一實體的業務邏輯。
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
- **網域事件 (Domain events)** 代表有意義的業務變更。它們允許系統的其他部分對這些事件做出反應，而無需直接耦合到產生事件的服務。
```kotlin
interface DomainEvent

data class CustomerContactAdded(
    val id: CustomerId,
    val contact: Contact
) : DomainEvent
```
這些元素共同支援豐富的網域模型，同時保持基礎結構細節分離。

### 應用程式與路由層 {id="application-and-routing-layer"}

您透過各自的路由檔案或模組函式公開每個網域，並注入管理邏輯與狀態的服務：

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

> 如需網域驅動應用程式的完整程式碼範例，請參閱 [Ktor DDD 範例](https://github.com/antonarhipov/ktor-ddd-example/tree/main)。

## 微服務導向結構 {id="microservice-oriented-structure"}

Ktor 應用程式可以組織為微服務，其中每個服務都是一個可以獨立部署的自足模組。

微服務存儲庫通常結合了模組化架構、用於網域隔離的 DDD，以及用於基礎結構隔離的 Gradle 多模組組建。

```text
service-customer/
├─ domain/        // 網域模型與聚合
├─ repository/    // 客戶服務的持久化層
├─ service/       // 業務邏輯
├─ dto/           // 資料傳輸物件
├─ controller/    // 路由或 API 端點
├─ plugins/       // 此服務的 Ktor 外掛程式安裝
└─ Application.kt // 服務進入點

service-order/
├─ domain/        // 網域模型與聚合
├─ repository/    // 訂單服務的持久化層
├─ service/       // 業務邏輯
├─ dto/           // 資料傳輸物件
├─ controller/    // 路由或 API 端點
├─ plugins/       // 此服務的 Ktor 外掛程式安裝
└─ Application.kt // 服務進入點
```

在此結構中，每個服務都擁有隔離的網域切片，且內部保持模組化，並整合了服務發現、指標和外部配置。

### 進入點 {id="entry-points"}

Ktor 提供現成的引擎進入點，例如：

```kotlin
io.ktor.server.cio.EngineMain
```

當使用預設的引擎 `main` 函式時，您不需要定義自訂的 `main()` 方法或專用的 `Application.kt` 進入點檔案。

應用程式模組可以在任何原始碼檔案中定義，並由引擎根據 [配置](server-configuration-file.topic) 載入。

### 模組化單體 (Modulith) 部署 {id="modulith-deployment"}

與其使用完全獨立的微服務，代表服務的多個 Gradle 模組可以獨立封裝，但一起部署在單一 Ktor 應用程式中。這種方法通常被稱為模組化單體 (Modulith)。

每個 Gradle 模組內部保持隔離，並公開一個可透過配置載入的應用程式模組：

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
