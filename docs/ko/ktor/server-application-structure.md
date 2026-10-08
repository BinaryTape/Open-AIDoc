[//]: # (title: 애플리케이션 구조)

<link-summary>
유지 관리성, 모듈성 및 의존성 주입을 위해 Ktor 애플리케이션을 구성하는 방법을 알아봅니다.
</link-summary>

<show-structure for="chapter" depth="2"/>

Ktor 애플리케이션은 프로젝트 규모, 도메인 복잡성 및 배포 환경에 따라 여러 가지 방식으로 구성할 수 있습니다. Ktor는 의도적으로 특정한 방식을 강요하지 않지만(unopinionated), 애플리케이션을 모듈화하고 테스트 가능하며 확장하기 쉽게 유지하는 데 도움이 되는 공통적인 패턴과 모범 사례가 있습니다.

이 주제에서는 Ktor 프로젝트에서 사용되는 일반적인 구조를 설명하고, 구조를 선택하고 적용하기 위한 실질적인 권장 사항을 제공합니다.

> 이 페이지는 애플리케이션 수준의 구조에 초점을 맞춥니다. 라우트 구성에 대한 자세한 내용은 [라우팅 구성(Routing organization)](server-routing-organization.md)을 참조하세요.
>

## 기본 프로젝트 구조 {id="default-project-structure"}

[Ktor 프로젝트 생성기(Ktor project generator)](https://start.ktor.io/)를 사용하여 Ktor 프로젝트를 생성하면, 결과 프로젝트는 단일 모듈 구조를 사용합니다. 이 레이아웃은 최소한의 구성으로 Ktor 애플리케이션을 빠르게 시작하고 실행할 수 있도록 설계되었습니다.

```text
project/
└─ src/
   ├─ main/
   │  ├─ kotlin/
   │  │  └─ Application.kt   // 애플리케이션 진입점
   │  └─ resources/
   │     └─ application.conf  // 애플리케이션 설정
   └─ test/
      └─ kotlin/             // 단위 및 통합 테스트
├─ build.gradle.kts       // Gradle 빌드 파일
└─ settings.gradle.kts    // Gradle 설정 파일
```

소규모 애플리케이션에는 적합하지만, 이 구조는 프로젝트가 커짐에 따라 확장성이 떨어집니다. 대규모 프로젝트의 경우, 다음 섹션에서 설명하는 것처럼 기능을 논리적 패키지와 모듈로 구성하는 것이 좋습니다.

## 애플리케이션 구조 선택하기 {id="choosing_structure"}

적절한 구조를 선택하는 것은 서비스의 특성에 따라 다릅니다:

- **소규모 서비스**는 대개 몇 개의 [모듈](#modular_architecture)과 단순한 의존성 주입만으로도 잘 작동합니다.
- **중간 규모 애플리케이션**은 일반적으로 관련 라우트, 서비스 및 데이터 모델을 함께 그룹화하는 일관된 [기능 기반 구조(feature-based structure)](#feature_modules)를 통해 이점을 얻습니다.
- **대규모 또는 도메인 중심 시스템**은 비즈니스 로직을 도메인 개념 중심으로 구성하고 경계를 더 명확하게 제공하는 [도메인 주도 접근 방식(domain-driven approach)](#ddd)을 채택할 수 있습니다.
- [**마이크로서비스 아키텍처**](#microservice-oriented-structure)는 보통 각 서비스가 도메인의 한 조각(slice)을 나타내고 내부적으로 모듈화된 하이브리드 스타일을 사용합니다.

이러한 구조들이 상호 배타적이지 않다는 점에 유의해야 합니다. 도메인 주도 아키텍처 내에서 기능 기반 구성을 사용하거나, 마이크로서비스 지향 시스템에서 모듈성을 적용하는 등 여러 접근 방식을 결합할 수 있습니다.

## 계층형 구조 {id="layered_structure"}

계층형 아키텍처는 애플리케이션을 설정, 플러그인, 라우트, 비즈니스 로직, 영속성(persistence), 도메인 모델 및 데이터 전송 객체(DTO)와 같이 서로 다른 책임으로 분리합니다. 이 접근 방식은 엔터프라이즈 애플리케이션에서 흔히 사용되며 유지 관리가 용이한 코드의 명확한 출발점을 제공합니다.

```text
src/main/kotlin/com/example/app/
├─ config/            // 애플리케이션 설정 및 환경 구성
├─ plugins/           // Ktor 플러그인 (인증, 직렬화, 모니터링)
├─ controller/        // 라우트 또는 API 엔드포인트
├─ service/           // 비즈니스 로직
├─ repository/        // 데이터 액세스 또는 영속성
├─ domain/            // 도메인 모델 및 애그리거트
└─ dto/               // 데이터 전송 객체
```

## 모듈형 아키텍처 {id="modular_architecture"}

Ktor는 여러 애플리케이션 모듈을 정의할 수 있도록 하여 모듈형 설계를 장려합니다. 모듈은 `Application`을 확장하여 애플리케이션의 일부를 구성하는 함수입니다.

```kotlin
fun Application.customerModule() {
    //…
}
```

각 모듈은 플러그인을 설치하거나, 라우트를 구성하거나, 서비스를 등록하거나, 인프라 구성 요소를 통합할 수 있습니다. 모듈은 서로 의존하거나 완전히 독립적으로 유지될 수 있으므로, 이 구조는 모놀리스(monolith)와 마이크로서비스 모두에 유연하게 적용할 수 있습니다.

의존성은 일반적으로 모듈 경계에서 주입됩니다:

```kotlin
fun Application.customerModule(customerService: CustomerService) {
    routing {
        customerRoutes(customerService)
    }
}
```

모듈형 구조는 다음과 같은 이점을 제공합니다:

- 관심사 분리 및 기능 로직 격리
- 필요한 곳에만 설정 또는 플러그인 설치 가능
- 모듈을 개별적으로 인스턴스화하여 테스트 가능성 향상
- 마이크로서비스 또는 플러그인 친화적인 코드 구성 지원
- 모듈 경계에 의존성 주입 도입

전형적인 멀티 모듈 구조는 다음과 같을 수 있습니다:

```text
db/
├─ core/        // 데이터베이스 추상화 (인터페이스, 팩토리)
├─ postgres/    // Postgres 구현체 (JDBC, Exposed)
└─ mongo/       // MongoDB 구현체

server/
├─ core/        // 공통 서버 유틸리티 및 공통 모듈
├─ admin/       // 관리자용 도메인 및 라우트
└─ banking/     // 뱅킹 도메인 및 라우트
```

다음은 `server/banking` 모듈에 대한 <Path>build.gradle.kts</Path> 파일 예시입니다:

```kotlin
plugins {
    id("io.ktor.plugin") version "3.3.3"
}

dependencies {
    implementation(project(":server:core"))
    implementation(project(":db:core"))

    // 저장소 구현체는 런타임에 로드됨
    runtimeOnly(project(":db:postgres"))
    runtimeOnly(project(":db:mongo"))
}
```

이 구조에서 banking 모듈은 어떤 데이터베이스 구현체에 대해서도 컴파일되지 않습니다. 오직 `db/core`에만 의존하여 도메인을 인프라 세부 사항과 분리된 상태로 유지합니다.

> 모듈화되고 계층화된 Ktor 서버 애플리케이션의 전체 예시는 [Ktor Chat](https://github.com/ktorio/ktor-chat) 샘플 프로젝트를 참조하세요. 이 프로젝트는 별도의 도메인, 애플리케이션 및 인프라 계층을 가진 모듈형 아키텍처뿐만 아니라 의존성 주입 및 라우팅 구성을 보여줍니다.

## 기능 기반 모듈 {id="feature_modules"}

기능 기반 구성은 코드의 기능이나 수직적 슬라이스(vertical slice)별로 코드를 그룹화합니다. 각 기능은 라우트, 서비스, 데이터 전송 객체(DTO) 및 도메인 로직을 포함하는 독립적인 모듈이 됩니다.

```text
app/
├─ customer/
│  ├─ CustomerRoutes.kt     // 고객 엔드포인트를 위한 라우팅
│  ├─ CustomerService.kt    // 고객 기능을 위한 비즈니스 로직
│  └─ CustomerDto.kt        // 고객 기능을 위한 데이터 전송 객체
└─ order/
   ├─ OrderRoutes.kt        // 주문 엔드포인트를 위한 라우팅
   ├─ OrderService.kt       // 주문 기능을 위한 비즈니스 로직
   └─ OrderDto.kt           // 주문 기능을 위한 데이터 전송 객체
```

이 구조는 중간 또는 대규모 모놀리스 프로젝트에서, 혹은 나중에 개별 기능을 마이크로서비스로 분리할 때 확장성이 좋습니다. 각 기능은 독립적으로 마이그레이션하거나 버전을 관리할 수 있습니다. 전형적인 기능 모듈은 다음과 같을 수 있습니다:

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

위의 예에서 모듈은 `CustomerService`가 어떻게 생성되는지 알지 못하며 오직 전달받기만 합니다. 이는 의존성을 명시적으로 유지해 줍니다.

## 도메인 주도 설계(DDD) 접근 방식 {id="ddd"}

도메인 주도 구조는 애플리케이션이 나타내는 핵심 비즈니스 역량을 중심으로 애플리케이션을 구성합니다. 복잡한 비즈니스 규칙이 있는 대규모 프로젝트의 경우, 도메인 로직을 전송(transport), 영속성 및 인프라 관심사와 분리하는 것이 도움이 됩니다.

```text
domain/
├─ customer/
│  ├─ Customer.kt           // 도메인 엔티티
│  ├─ CustomerService.kt    // 도메인 서비스
│  ├─ CustomerRepository.kt // 도메인 리포지토리 인터페이스
├─ order/
│  ├─ Order.kt
│  ├─ OrderService.kt
│  └─ OrderRepository.kt

server/                               // Ktor 서버 애플리케이션 (도메인 및 인프라에 의존)
├─ Authentication.kt                  // 별도의 서버 모듈로서의 횡단 관심사
├─ Customers.kt                       // 고객 HTTP 라우트
└─ Orders.kt                          // 주문 HTTP 라우트
```

### 도메인 계층 {id="domain-layer"}

도메인 계층은 Ktor와 독립적으로 유지됩니다. 다음과 같은 요소를 통해 비즈니스 규칙을 정의합니다.

- **엔티티(Entities)**는 식별 가능한 도메인 객체를 나타냅니다.
```kotlin
data class Customer(
    val id: CustomerId,
    val contacts: List<Contact>
)
```
- **값 객체(Value objects)**는 식별자나 검증된 필드와 같이 불변인 개념을 표현합니다.
```kotlin
@JvmInline
value class CustomerId(val value: Long)
```
- **애그리거트(Aggregates)**는 단일 일관성 경계 아래에서 관련 엔티티들을 그룹화합니다.
```kotlin
class CustomerAggregate(private val customer: Customer) {

    fun addContact(contact: Contact): Customer =
        customer.copy(contacts = customer.contacts + contact)
}
```

- **리포지토리(Repositories)**는 영속성을 추상화하고 애그리거트를 조회하거나 저장하기 위한 작업을 노출합니다. 구현체는 인프라 계층에 위치하지만, 인터페이스는 도메인에 속합니다.
```kotlin
interface CustomerRepository {
    suspend fun find(id: CustomerId): Customer?
    suspend fun save(customer: Customer)
}
```
- **도메인 서비스(Domain services)**는 여러 애그리거트에 걸쳐 있거나 단일 엔티티에 자연스럽게 속하지 않는 비즈니스 로직을 조정합니다.
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
- **도메인 이벤트(Domain events)**는 의미 있는 비즈니스 변화를 나타냅니다. 시스템의 다른 부분들이 이벤트를 생성한 서비스에 직접 결합되지 않고도 이러한 이벤트에 반응할 수 있게 해줍니다.
```kotlin
interface DomainEvent

data class CustomerContactAdded(
    val id: CustomerId,
    val contact: Contact
) : DomainEvent
```
이러한 요소들은 함께 인프라 세부 사항을 분리하면서도 풍부한 도메인 모델을 지원합니다.

### 애플리케이션 및 라우팅 계층 {id="application-and-routing-layer"}

로직과 상태를 모두 관리하는 서비스를 주입하여 각 도메인을 자체 라우트 파일 또는 모듈 함수를 통해 노출합니다.

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

> 도메인 주도 애플리케이션의 전체 코드 예시는 [Ktor DDD 예제](https://github.com/antonarhipov/ktor-ddd-example/tree/main)를 참조하세요.

## 마이크로서비스 지향 구조 {id="microservice-oriented-structure"}

Ktor 애플리케이션은 마이크로서비스로 구성될 수 있으며, 여기서 각 서비스는 독립적으로 배포할 수 있는 자체 완결형 모듈입니다.

마이크로서비스 저장소는 흔히 모듈형 아키텍처, 도메인 격리를 위한 DDD, 그리고 인프라 격리를 위한 Gradle 멀티 모듈 빌드가 혼합된 하이브리드 방식을 사용합니다.

```text
service-customer/
├─ domain/        // 도메인 모델 및 애그리거트
├─ repository/    // 고객 서비스를 위한 영속성 계층
├─ service/       // 비즈니스 로직
├─ dto/           // 데이터 전송 객체
├─ controller/    // 라우트 또는 API 엔드포인트
├─ plugins/       // 이 서비스를 위한 Ktor 플러그인 설치
└─ Application.kt // 서비스 진입점

service-order/
├─ domain/        // 도메인 모델 및 애그리거트
├─ repository/    // 주문 서비스를 위한 영속성 계층
├─ service/       // 비즈니스 로직
├─ dto/           // 데이터 전송 객체
├─ controller/    // 라우트 또는 API 엔드포인트
├─ plugins/       // 이 서비스를 위한 Ktor 플러그인 설치
└─ Application.kt // 서비스 진입점
```

이 구조에서 각 서비스는 격리된 도메인 조각을 소유하고 내부적으로 모듈화된 상태를 유지하며 서비스 검색(service discovery), 메트릭 및 외부 설정과 통합됩니다.

### 진입점(Entry points) {id="entry-points"}

Ktor는 다음과 같은 미리 만들어진 엔진 진입점을 제공합니다.

```kotlin
io.ktor.server.cio.EngineMain
```

기성 엔진 `main` 함수를 사용할 때는 커스텀 `main()` 메서드나 전용 `Application.kt` 진입점 파일을 정의할 필요가 없습니다.

애플리케이션 모듈은 모든 소스 파일에서 정의할 수 있으며 [설정(configuration)](server-configuration-file.topic)에 따라 엔진에 의해 로드됩니다.

### 모듈리스(Modulith) 배포 {id="modulith-deployment"}

완전히 독립적인 마이크로서비스 대신, 서비스를 나타내는 여러 Gradle 모듈을 독립적으로 패키징하되 단일 Ktor 애플리케이션에서 함께 배포할 수 있습니다. 이 접근 방식을 흔히 모듈리스(modulith)라고 합니다.

각 Gradle 모듈은 내부적으로 격리된 상태를 유지하고 설정을 통해 로드할 수 있는 애플리케이션 모듈을 노출합니다.

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
