---
title: Kotlin Multiplatformのセットアップ
---

# Kotlin Multiplatformのセットアップ

このページでは、Kotlin Multiplatform (KMP) プロジェクトでKoinをセットアップする方法を説明します。Gradleの依存関係、Koinコードの配置場所、Koinを開始する1つの共通関数、そして各プラットフォームからそれを呼び出す方法について扱います。なお、[モジュール](/docs/reference/koin-core/modules)および[Koinの開始](/docs/reference/koin-core/starting-koin)について理解していることを前提としています。各プラットフォーム独自の実装を提供する方法については、[KMP共有パターン](/docs/reference/koin-core/kmp-shared-modules)で解説しています。

## サポートされているターゲット {id="supported-targets"}

`koin-core`とCompiler Pluginは、すべてのKotlinターゲットをサポートしています。

| ターゲット | サポート状況 |
|--------|-----------|
| Android | 対応 |
| iOS (`iosArm64`, `iosX64`, `iosSimulatorArm64`) | 対応 |
| JVM (デスクトップ、サーバー) | 対応 |
| JSおよびWasm (`js`, `wasmJs`) | 対応 |
| macOS、Linux、Windows (Kotlin/Native) | 対応 |

Composeアーティファクトは、Compose Multiplatformのターゲットに準拠します。[Gradleのセットアップ](/docs/setup/gradle)のアーティファクト一覧表を参照してください。

## 依存関係 {id="dependencies"}

共有モジュールに[Koin Compiler Plugin](/docs/setup/compiler-plugin)を適用し、ソースセットにKoinを追加します:

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    androidTarget()
    iosArm64()
    iosSimulatorArm64()
    jvm()

    sourceSets {
        commonMain.dependencies {
            implementation(project.dependencies.platform(libs.koin.bom))
            implementation(libs.koin.core)
            implementation(libs.koin.annotations) // アノテーションを使用する場合のみ

            // Compose Multiplatform
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
        }
        androidMain.dependencies {
            implementation(libs.koin.android)
        }
        commonTest.dependencies {
            implementation(libs.koin.test)
        }
    }
}
```

Compiler Pluginは、1つの宣言からすべてのターゲットに対して実行されます。Koin Annotations 1.xのKSPセットアップとは異なり、ターゲットごとの設定は不要です（[KSPからの移行](/docs/migration/from-ksp-to-compiler-plugin)を参照）。

## プロジェクト構成 {id="project-structure"}

```
shared/
└── src/
    ├── commonMain/kotlin/di/
    │   ├── Koin.kt              // モジュールと initKoin()
    │   └── PlatformModule.kt    // expect 宣言
    ├── androidMain/kotlin/di/
    │   └── PlatformModule.android.kt
    └── iosMain/kotlin/di/
        └── PlatformModule.ios.kt
androidApp/   // Application クラスが initKoin() を呼び出す
iosApp/       // Swift の App が initKoin() を呼び出す
```

共通の定義は`commonMain`に配置します。各プラットフォームのソースセットには、プラットフォームごとに異なるコードのみを含めます。

## 共通の開始関数 {id="shared-start-function"}

`commonMain`にKoinを開始する関数を1つ記述します。各プラットフォームはこの関数を呼び出し、`config`パラメータを介してプラットフォーム固有の設定を追加できます:

**Compiler Plugin DSL**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.context.startKoin
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val dataModule = module {
    single<UserRepository>()
    viewModel<UserViewModel>()
}

val appModule = module {
    includes(dataModule, platformModule())
}

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin {
        includes(config)
        modules(appModule)
    }
}
```

**アノテーション**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.annotation.*
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.plugin.module.dsl.startKoin

@Module(includes = [PlatformModule::class])
@ComponentScan("com.example.app")
@Configuration
class AppModule

@KoinApplication
object KoinApp

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin<KoinApp> {
        includes(config)
    }
}
```

`@Configuration`モジュールは、ビルド時に`@KoinApplication`によって検出されます。`PlatformModule`は`expect`モジュールクラスです。[KMP共有パターン](/docs/reference/koin-core/kmp-shared-modules)を参照してください。

**Constructor / Classic DSL**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.context.startKoin
import org.koin.core.module.dsl.*
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.dsl.module

val dataModule = module {
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}

val appModule = module {
    includes(dataModule, platformModule())
}

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin {
        includes(config)
        modules(appModule)
    }
}
```

`includes(config)`は、プラットフォーム固有の設定（Android context、ロガー、追加モジュール）を同一のKoin起動プロセスに適用します。`platformModule()`は`expect`関数です。[KMP共有パターン](/docs/reference/koin-core/kmp-shared-modules)を参照してください。

## プラットフォームのエントリーポイント {id="platform-entry-points"}

### Android {id="android"}

`Application`クラスから`initKoin`を呼び出し、Androidコンテキストを渡します:

```kotlin
// androidApp
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initKoin {
            androidContext(this@MainApplication)
            androidLogger()
        }
    }
}
```

これにより、Androidの定義で`Context`をコンストラクタパラメータとして使用できるようになります。[Androidでの開始](/docs/reference/koin-android/start)を参照してください。

### iOS {id="ios"}

`iosMain`にパラメータのない関数を追加し、Swiftの`App`イニシャライザから呼び出します:

```kotlin
// iosMain/kotlin/di/KoinIos.kt
fun initKoinIos() = initKoin()
```

```swift
// iosApp/iOSApp.swift
import Shared

@main
struct iOSApp: App {
    init() {
        KoinIosKt.doInitKoinIos()
    }

    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

Swiftからの呼び出し方法は、Kotlin/Nativeの命名規則に基づいています。`KoinIos.kt`のトップレベル関数は、`KoinIosKt`という名前のクラスにエクスポートされます。名前が`init`で始まる関数には`do`プレフィックスが付加されるため、`initKoinIos`は`doInitKoinIos`になります。このヘルパー関数を用意することで、SwiftからKotlinのラムダ（`config`）を渡す必要がなくなります。

SwiftコードからKoinを呼び出す方法については、[KMPプラットフォーム統合](/docs/reference/koin-mp/kmp)で説明しています。

### JVMデスクトップ {id="jvm-desktop"}

```kotlin
// jvmMain
fun main() = application {
    initKoin {
        printLogger()
    }
    Window(onCloseRequest = ::exitApplication) {
        App()
    }
}
```

### Web {id="web"}

```kotlin
// jsMain または wasmJsMain
fun main() {
    initKoin()
    // UIを開始
}
```

## Compose Multiplatform {id="compose-multiplatform"}

Compose Multiplatformを使用する場合、各プラットフォームで`initKoin`を呼び出す代わりに、ルートのComposableから`KoinApplication`を使用してKoinを開始できます。Androidでは、自動的にAndroidコンテキストが設定されます:

**Compiler Plugin DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

**アノテーション**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<T>()`は`org.koin.plugin.module.dsl`から提供されています。

**Constructor / Classic DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

Compose外部のコード（バックグラウンドサービスやSwiftコードなど）が最初の画面表示前にKoinを必要とする場合は、`initKoin`を引き続き使用してください。両方の選択肢の比較については、[Koin for Compose](/docs/reference/koin-compose/compose)を参照してください。

## 関連情報 {id="related"}

- [KMP共有パターン](/docs/reference/koin-core/kmp-shared-modules): プラットフォームモジュールと`expect`/`actual`定義。
- [KMPプラットフォーム統合](/docs/reference/koin-mp/kmp): 共通コードでのAndroidコンテキスト、Swiftとの相互運用性、デスクトップおよびWeb。
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication`と`koinInject()`。
- [ViewModel](/docs/reference/koin-core/viewmodel): AndroidとCompose Multiplatformで共有されるViewModel。
- [Gradleのセットアップ](/docs/setup/gradle): BOM、バージョンカタログ、アーティファクト一覧。