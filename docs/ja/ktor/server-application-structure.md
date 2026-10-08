[//]: # (title: アプリケーションの構成)

<link-summary>
メンテナンス性、モジュール性、および依存性の注入のために Ktor アプリケーションを整理する方法を学びます。
</link-summary>

<show-structure for="chapter" depth="2"/>

Ktor アプリケーションは、プロジェクトの規模、ドメインの複雑さ、およびデプロイ環境に応じて、いくつかの方法で構成できます。Ktor は意図的に特定の構成を強制しませんが、アプリケーションのモジュール化、テストのしやすさ、および拡張性を維持するのに役立つ一般的なパターンやベストプラクティスが存在します。

このトピックでは、Ktor プロジェクトで使用される一般的な構造について説明し、適切な構造を選択して適用するための実践的な推奨事項を提供します。

> このページでは、アプリケーションレベルの構造に焦点を当てています。ルーティングの構造化の詳細については、
> [ルーティングの構成](server-routing-organization.md)を参照してください。
>

## デフォルトのプロジェクト構造 {id="default-project-structure"}

[Ktor プロジェクトジェネレーター](https://start.ktor.io/)を使用して Ktor プロジェクトを生成すると、結果のプロジェクトはシングルモジュール構造になります。このレイアウトは最小限であり、動作する Ktor アプリケーションを迅速に立ち上げて実行できるように設計されています。

```text
project/
└─ src/
   ├─ main/
   │  ├─ kotlin/
   │  │  └─ Application.kt   // アプリケーションのエントリーポイント
   │  └─ resources/
   │     └─ application.conf  // アプリケーションの設定
   └─ test/
      └─ kotlin/             // ユニットテストおよび統合テスト
├─ build.gradle.kts       // Gradle ビルドファイル
└─ settings.gradle.kts    // Gradle 設定ファイル
```

小規模なアプリケーションには適していますが、プロジェクトが大きくなるにつれて、この構造では対応しきれなくなります。大規模なプロジェクトでは、以降のセクションで説明するように、機能を論理的なパッケージやモジュールに整理することをお勧めします。

## アプリケーション構造の選択 {id="choosing_structure"}

適切な構造の選択は、サービスの特性によって異なります。

- 小規模なサービスは、通常、少数の[モジュール](#modular_architecture)と単純な依存性の注入だけでうまく機能します。
- 中規模のアプリケーションは、関連するルート、サービス、データモデルをグループ化する一貫した[機能ベースの構造](#feature_modules)の恩恵を通常受けます。
- 大規模またはドメインが複雑なシステムは、明確な境界を提供し、ドメインの概念を中心にビジネスロジックを整理する[ドメイン駆動アプローチ](#ddd)を採用できます。
- [マイクロサービス指向の構造](#microservice-oriented-structure)では、通常、各サービスがドメインのスライスを表し、内部的にモジュール化されているハイブリッドスタイルを使用します。

これらの構造は相互に排他的ではないことに注意してください。ドメイン駆動アーキテクチャの中で機能ベースの構成を使用したり、マイクロサービス指向のシステム内でモジュール性を適用したりするなど、複数のアプローチを組み合わせることができます。

## レイヤード構造 {id="layered_structure"}

レイヤードアーキテクチャ（階層化アーキテクチャ）は、アプリケーションを、設定、プラグイン、ルート、ビジネスロジック、永続化、ドメインモデル、およびデータ転送オブジェクト (DTO) といった個別の責務に分離します。このアプローチはエンタープライズアプリケーションで一般的であり、メンテナンスしやすいコードのための明確な出発点となります。

```text
src/main/kotlin/com/example/app/
├─ config/            // アプリケーション設定と環境のセットアップ
├─ plugins/           // Ktor プラグイン（認証、シリアライズ、モニタリング）
├─ controller/        // ルートまたは API エンドポイント
├─ service/           // ビジネスロジック
├─ repository/        // データアクセスまたは永続化
├─ domain/            // ドメインモデルと集約
└─ dto/               // データ転送オブジェクト
```

## モジュール式アーキテクチャ {id="modular_architecture"}

Ktor は、複数のアプリケーションモジュールを定義できるようにすることで、モジュール設計を促進します。モジュールは、アプリケーションの一部を構成する `Application` を拡張する関数です。

```kotlin
fun Application.customerModule() {
    //…
}
```

各モジュールは、プラグインのインストール、ルートの設定、サービスの登録、またはインフラストラクチャコンポーネントの統合を行うことができます。モジュールは互いに依存することも、完全に独立を保つこともできるため、この構造はモノリスとマイクロサービスの両方で柔軟に対応できます。

依存関係は通常、モジュールの境界で注入されます。

```kotlin
fun Application.customerModule(customerService: CustomerService) {
    routing {
        customerRoutes(customerService)
    }
}
```

モジュール式構造には以下の利点があります。

- 関心事の分離と機能ロジックの隔離
- 必要な場所のみでの設定やプラグインインストールの有効化
- モジュールを単独でインスタンス化することによるテスト性の向上
- マイクロサービスフレンドリーまたはプラグインフレンドリーなコード構成のサポート
- モジュールの境界での依存性の注入の導入

典型的なマルチモジュール構造は次のようになります。

```text
db/
├─ core/        // データベースの抽象化（インターフェース、ファクトリ）
├─ postgres/    // Postgres 実装（JDBC、Exposed）
└─ mongo/       // MongoDB 実装

server/
├─ core/        // 共有サーバーユーティリティと共通モジュール
├─ admin/       // 管理者向けドメインとルート
└─ banking/     // 銀行業務ドメインとルート
```

以下は、`server/banking` モジュールの <Path>build.gradle.kts</Path> ファイルの例です。

```kotlin
plugins {
    id("io.ktor.plugin") version "3.3.3"
}

dependencies {
    implementation(project(":server:core"))
    implementation(project(":db:core"))

    // ストレージの実装は実行時にロードされる
    runtimeOnly(project(":db:postgres"))
    runtimeOnly(project(":db:mongo"))
}
```

この構造では、banking モジュールはどのデータベース実装に対してもコンパイルされません。`db/core` にのみ依存し、ドメインをインフラストラクチャの詳細から分離し続けます。

> モジュール化され、レイヤー化された Ktor サーバーアプリケーションの完全な例については、[Ktor Chat](https://github.com/ktorio/ktor-chat) サンプルプロジェクトを参照してください。このプロジェクトでは、ドメイン、アプリケーション、およびインフラストラクチャの各レイヤーを分離したモジュール式アーキテクチャ、ならびに依存性の注入とルーティングの構成を示しています。

## 機能ベースのモジュール {id="feature_modules"}

機能ベースの構成（Feature-based organization）は、機能または垂直スライス（vertical slice）ごとにコードをグループ化します。各機能は、そのルート、サービス、データ転送オブジェクト (DTO)、およびドメインロジックを含む自己完結型のモジュールになります。

```text
app/
├─ customer/
│  ├─ CustomerRoutes.kt     // 顧客エンドポイントのルーティング
│  ├─ CustomerService.kt    // 顧客機能のビジネスロジック
│  └─ CustomerDto.kt        // 顧客機能のデータ転送オブジェクト
└─ order/
   ├─ OrderRoutes.kt        // 注文エンドポイントのルーティング
   ├─ OrderService.kt       // 注文機能のビジネスロジック
   └─ OrderDto.kt           // 注文機能のデータ転送オブジェクト
```

この構造は、中規模から大規模のモノリスや、後に個々の機能をマイクロサービスに分割する場合に適しています。各機能は、独立して移行またはバージョン管理できます。典型的な機能モジュールは次のようになります。

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

上記の例では、モジュールは `CustomerService` がどのように作成されるかを知りません。単にそれを受け取るだけであり、これにより依存関係が明示的に保たれます。

## ドメイン駆動設計 (DDD) アプローチ {id="ddd"}

ドメイン駆動の構造は、アプリケーションが表すコアビジネス機能を中心にアプリケーションを整理します。複雑なビジネスルールを持つ大規模なプロジェクトでは、ドメインロジックをトランスポート、永続化、およびインフラストラクチャの関心事から分離することが役立ちます。

```text
domain/
├─ customer/
│  ├─ Customer.kt           // ドメインエンティティ
│  ├─ CustomerService.kt    // ドメインサービス
│  ├─ CustomerRepository.kt // ドメインリポジトリインターフェース
├─ order/
│  ├─ Order.kt
│  ├─ OrderService.kt
│  └─ OrderRepository.kt

server/                               // Ktor サーバーアプリケーション（domain と infrastructure に依存）
├─ Authentication.kt                  // 独立したサーバーモジュールとしての横断的関心事
├─ Customers.kt                       // 顧客 HTTP ルート
└─ Orders.kt                          // 注文 HTTP ルート
```
### ドメインレイヤー {id="domain-layer"}

ドメインレイヤーは Ktor から独立したままです。以下の要素を通じてビジネスルールを定義します。

- _エンティティ (Entities)_ は、識別可能なドメインオブジェクトを表します。
```kotlin
data class Customer(
    val id: CustomerId,
    val contacts: List<Contact>
)
```
- _値オブジェクト (Value objects)_ は、識別子や検証済みフィールドなどの不変の概念を表現します。
```kotlin
@JvmInline
value class CustomerId(val value: Long)
```
- _集約 (Aggregates)_ は、関連するエンティティを単一の一貫性境界の下にグループ化します。
```kotlin
class CustomerAggregate(private val customer: Customer) {

    fun addContact(contact: Contact): Customer =
        customer.copy(contacts = customer.contacts + contact)
}
```

- _リポジトリ (Repositories)_ は、永続化を抽象化し、集約の取得または保存のための操作を公開します。その実装はインフラストラクチャレイヤーに存在しますが、インターフェースはドメインに属します。
```kotlin
interface CustomerRepository {
    suspend fun find(id: CustomerId): Customer?
    suspend fun save(customer: Customer)
}
```
- _ドメインサービス (Domain services)_ は、複数の集約にまたがるビジネスロジックや、単一のエンティティに自然に属さないビジネスロジックを調整します。
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
- _ドメインイベント (Domain events)_ は、意味のあるビジネス上の変更を表します。これにより、システムの他の部分が、イベントを生成したサービスに直接結合することなく、これらのイベントに反応できるようになります。
```kotlin
interface DomainEvent

data class CustomerContactAdded(
    val id: CustomerId,
    val contact: Contact
) : DomainEvent
```
これらの要素が組み合わさることで、インフラストラクチャの詳細を分離したまま、豊かなドメインモデルをサポートします。

### アプリケーションおよびルーティングレイヤー {id="application-and-routing-layer"}

各ドメインを独自のルートファイルまたはモジュール関数を通じて公開し、ロジックと状態の両方を管理するサービスを注入します。

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

> ドメイン駆動アプリケーションの完全なコード例については、[Ktor DDD example](https://github.com/antonarhipov/ktor-ddd-example/tree/main) を参照してください。

## マイクロサービス指向の構造 {id="microservice-oriented-structure"}

Ktor アプリケーションは、各サービスが独立してデプロイ可能な自己完結型モジュールであるマイクロサービスとして構成できます。

マイクロサービスのリポジトリでは、モジュール式アーキテクチャ、ドメイン分離のための DDD、およびインフラストラクチャ分離のための Gradle マルチモジュールビルドのハイブリッドがよく使用されます。

```text
service-customer/
├─ domain/        // ドメインモデルと集約
├─ repository/    // 顧客サービスの永続化レイヤー
├─ service/       // ビジネスロジック
├─ dto/           // データ転送オブジェクト
├─ controller/    // ルートまたは API エンドポイント
├─ plugins/       // このサービスのための Ktor プラグインのインストール
└─ Application.kt // サービスのエントリーポイント

service-order/
├─ domain/        // ドメインモデルと集約
├─ repository/    // 注文サービスの永続化レイヤー
├─ service/       // ビジネスロジック
├─ dto/           // データ転送オブジェクト
├─ controller/    // ルートまたは API エンドポイント
├─ plugins/       // このサービスのための Ktor プラグインのインストール
└─ Application.kt // サービスのエントリーポイント
```

この構造では、各サービスが隔離されたドメインスライスを所有し、内部的にモジュール化された状態を維持しながら、サービスディスカバリー、メトリクス、および外部設定と統合されます。

### エントリーポイント {id="entry-points"}

Ktor は、次のような既製のエントリーポイントを提供しています。

```kotlin
io.ktor.server.cio.EngineMain
```

既製のエンジン `main` 関数を使用する場合、カスタムの `main()` メソッドや専用の `Application.kt` エントリーポイントファイルを定義する必要はありません。

アプリケーションモジュールは任意のソースファイルで定義でき、[設定](server-configuration-file.topic)に基づいてエンジンによってロードされます。

### モジュリス（Modulith）デプロイ {id="modulith-deployment"}

完全に独立したマイクロサービスの代わりに、サービスを表す複数の Gradle モジュールを個別にパッケージ化し、単一の Ktor アプリケーションでまとめてデプロイすることもできます。このアプローチは一般にモジュリス（Modulith）と呼ばれます。

各 Gradle モジュールは内部的に隔離されたままで、設定を通じてロードできるアプリケーションモジュールを公開します。

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
