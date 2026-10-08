---
title: アプリケーション、設定、およびモジュール 
---

## @KoinApplication によるアプリケーションのブートストラップ {id="application-bootstrap-with-koinapplication"}

アプリケーションのエントリポイントを定義するには、`@KoinApplication` を使用します。

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp
```

型指定された API を使用して Koin を開始します。

```kotlin
fun main() {
    startKoin<MyApp>()

    // または設定を伴う場合
    startKoin<MyApp> {
        printLogger()
    }
}
```

### 利用可能な型指定された API {id="available-typed-apis"}

| API | 説明 |
|-----|-------------|
| `startKoin<T>()` | Koin をグローバルに開始する |
| `startKoin<T> { }` | 設定ブロックを使用して開始する |
| `koinApplication<T>()` | 隔離された KoinApplication を作成する |
| `koinConfiguration<T>()` | 設定を作成する（Compose、Ktor 用） |
| `module<T>()` | 単一の `@Module` クラスをロードする |
| `modules(A::class, B::class)` | 複数の `@Module` クラスをロードする |

### 個別モジュールのロード {id="loading-individual-modules"}

`module<T>()` または `modules(vararg KClass)` を使用すると、`@KoinApplication` を必要とせずに `@Module` クラスを直接ロードできます。

```kotlin
startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

これはテストや、アノテーションベースのモジュールと DSL 設定を併用する場合に便利です。

```kotlin
// テストにおいて — 必要なモジュールのみをロードする
@get:Rule
val koinTestRule = KoinTestRule.create {
    module<NetworkModule>()
}
```

:::info
`module<T>()` および `modules(vararg KClass)` は、コンパイラプラグインがコンパイル時にインターセプト（傍受）して変換するためのスタブ関数です。これらを使用するには、Koin コンパイラプラグインを適用する必要があります。
:::

### @KoinApplication のパラメータ {id="koinapplication-parameters"}

- `modules`: 含めるモジュールクラスの配列
- `configurations`: ロードする設定ラベルの配列

```kotlin
@KoinApplication(
    modules = [CoreModule::class],
    configurations = ["production"]
)
class ProdApp
```

:::info
設定が指定されていない場合、`@Configuration`（デフォルトラベル）でマークされたモジュールが自動的にロードされます。
:::

### モジュールのロード順序とオーバーライド {id="module-load-order-and-overrides"}

Koin は実行時に **最後にロードされたものが優先（last-wins）** されます。2 つのモジュールが同じ型を定義している場合、最後にロードされた方が優先されます。コンパイラプラグインは、`@KoinApplication` から以下の順序でモジュールリストを組み立てます。

1.  **自動検出された `@Configuration` モジュール**（ローカル + 依存関係の JAR） — 最初にロードされる
2.  **明示的な `@KoinApplication(modules = [A, B, C])`** — **宣言された順序で** 最後にロードされる

そのため、アプリレベルのオーバーライドは常に依存関係のデフォルト設定よりも優先されます。

```kotlin
// 依存ライブラリモジュール内
@Module @Configuration
class CoreModule {
    @Singleton fun feature(): Feature = DefaultFeature()
}

// アプリモジュール内
@Module
class AppModule {
    @Singleton fun feature(): Feature = AppFeature()  // カスタムオーバーライド
}

@KoinApplication(modules = [AppModule::class])
class MyApp
// ロード順序: CoreModule (DefaultFeature) → AppModule (AppFeature が優先)
// 実行時の get<Feature>() は AppFeature を返す
```

明示的なリスト内では、宣言された順序が保持されます。したがって、`@KoinApplication(modules = [A, B, C])` は A、B、そして C の順にロードされ、この 3 つの中では C が優先されます。各エントリの `@Module(includes = [...])` チェーンは、そのエントリとグループ化されたままになります。

モジュールが明示的なリストに含まれ、かつ `@Configuration` としても検出される場合、そのモジュールは一度だけ — **明示的に指定された位置** で — ロードされます。したがって、`modules = [...]` での宣言順序が常にオーバーライドの優先順位を制御します。

:::tip
（クラスパススキャンの順序ではなく）複数の `@Configuration` モジュール間で特定のロード順序が必要な場合は、`@KoinApplication(modules = [Core::class, Feature::class, App::class])` のように明示的にリストしてください。明示的なリストは宣言順序を尊重します。
:::

## @Configuration による設定管理 {id="configuration-management-with-configuration"}

`@Configuration` アノテーションを使用すると、モジュールを異なる設定（環境、フレーバーなど）に整理できます。これは、デプロイ環境や機能セットごとにモジュールを整理するのに便利です。

### 基本的な設定の使用方法 {id="basic-configuration-usage"}

```kotlin
// モジュールをデフォルトの Configuration に配置
@Module
@Configuration
class CoreModule
```

:::info
デフォルトの設定名は "default" です。`@Configuration` または `@Configuration("default")` として使用できます。
:::

設定からモジュールをスキャンできるようにするには、`@KoinApplication` を使用する必要があります。

```kotlin
// モジュール A
@Module
@Configuration
class ModuleA

// モジュール B
@Module
@Configuration
class ModuleB

// アプリケーションモジュール、すべての @Configuration モジュールをスキャン
@KoinApplication
object MyApp
```

### 複数設定のサポート {id="multiple-configuration-support"}

モジュールは複数の設定に関連付けることができます。

```kotlin
// このモジュールは "prod" と "test" 両方の設定で使用可能です
@Module
@Configuration("prod", "test")
class DatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// このモジュールは default、test、development で使用可能です
@Module
@Configuration("default", "test", "development") 
class LoggingModule {
    @Single
    fun logger() = Logger()
}
```

### 環境固有の設定 {id="environment-specific-configurations"}

```kotlin
// 開発環境専用の設定
@Module
@Configuration("development")
class DevDatabaseModule {
    @Single
    fun database() = InMemoryDatabase()
}

// 本番環境専用の設定  
@Module
@Configuration("production")
class ProdDatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 複数の環境で使用可能
@Module
@Configuration("default", "production", "development")
class CoreModule {
    @Single
    fun logger() = Logger()
}
```

### @KoinApplication での設定の使用 {id="using-configurations-with-koinapplication"}

デフォルトでは、`@KoinApplication` はすべてのデフォルト設定（`@Configuration` でタグ付けされたモジュール）をロードします。

アプリケーションのブートストラップでこれらの設定を参照することもできます。

```kotlin
@KoinApplication(configurations = ["default", "production"])
class ProductionApp

@KoinApplication(configurations = ["default", "development"])  
class DevelopmentApp

// デフォルト設定のみをロード（パラメータなしの @KoinApplication と同じ）
@KoinApplication
class SimpleApp
```

:::info
- 空の `@Configuration` は `@Configuration("default")` と同等です
- 特定の設定が指定されていない場合、"default" 設定が自動的にロードされます
- アノテーション内にリストすることで、モジュールを複数の設定に所属させることができます
:::

## モジュールによる整理 {id="organizing-with-modules"}

定義は常に `@Module` を使用して明示的なモジュールに整理してください。

## @Module によるクラスモジュール {id="class-module-with-module"}

モジュールを宣言するには、クラスに `@Module` アノテーションを付与します。

```kotlin
@Module
class MyModule
```

`@KoinApplication` 内でモジュールを参照します。

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

## @ComponentScan によるコンポーネントスキャン {id="components-scan-with-componentscan"}

アノテーションが付与されたコンポーネントを自動的に検出するには、`@ComponentScan` を使用します。

```kotlin
@Module
@ComponentScan
class MyModule
```

これにより、現在のパッケージおよびサブパッケージからアノテーション付きコンポーネントがスキャンされます。次のようにパッケージを明示的に指定することもできます。

```kotlin
@Module
@ComponentScan("com.myapp.features")
class FeatureModule
```

:::info
`@ComponentScan` は同じパッケージを対象にすべての Gradle モジュールを横断してスキャンします。
:::

## クラスモジュール内での定義 {id="definitions-in-class-modules"}

コード内で直接定義を宣言するには、関数に定義用のアノテーションを付与します。

```kotlin
// 例 
// class MyComponent(val myDependency : MyDependency)

@Module
class MyModule {

  @Single
  fun myComponent(myDependency : MyDependency) = MyComponent(myDependency)
}
```

> **注意**: `@InjectedParam` (startKoin からの注入パラメータ用) および `@Property` (プロパティ注入用) も関数メンバで使用可能です。これらのアノテーションの詳細については、定義（definitions）のドキュメントを参照してください。

## モジュールの包含 (Including Modules) {id="including-modules"}

モジュールを構成するには、`includes` 属性を使用します。

```kotlin
@Module
class ModuleA

@Module(includes = [ModuleA::class])
class ModuleB
```

アプリケーションでルートモジュールを参照します。

```kotlin
@KoinApplication(modules = [ModuleB::class])  // ModuleA が自動的に含まれます
class MyApp

fun main() {
    startKoin<MyApp>()
}
```
