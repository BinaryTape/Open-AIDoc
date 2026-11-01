---
title: KSPからコンパイラプラグインへの移行
---

# KSPからコンパイラプラグインへの移行

このガイドでは、Koin AnnotationsプロジェクトをKSPプロセッサ（`koin-ksp-compiler`）からKoinコンパイラプラグイン（Koin Compiler Plugin）へ移行する手順を説明します。アノテーションを付与したクラスはそのまま維持され、Gradle設定、Koinの起動方法、および一部のインポートのみが変更されます。コンパイラプラグインの概要や仕組みについては、[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) を参照してください。

## 主な変更点 {id="what-changes"}

| 項目 | KSPプロセッサ | コンパイラプラグイン |
|--------|---------------|-----------------|
| 処理方式 | KSP（コンパイル前の個別ステップ） | Kotlin K2コンパイラ内部 |
| 生成ファイル | `build/generated/ksp` 内で確認可能 | なし（コンパイラ内部でコードを生成） |
| KMP設定 | ターゲットごとに1つのKSP設定が必要 | 全ターゲットで1つのプラグイン |
| `koin-annotations` のバージョン | 個別のバージョン（`koin-ksp`） | `koin-core` と同じバージョン |
| Koinの起動 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| コンパイル時チェック | `KOIN_CONFIG_CHECK` オプション | デフォルトで有効（完全なグラフと呼び出し箇所を検証） |
| ステータス | 非推奨（Deprecated） | 活発に開発中（Active development） |

## 要件 {id="requirements"}

- Kotlin 2.3.20以降（K2コンパイラ）。
- Gradle 8以降。
- Koin 4.2以降。

## ステップ1: Kotlinのアップデート {id="step-1-update-kotlin"}

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20"
}
```

## ステップ2: バージョンカタログのアップデート {id="step-2-update-the-version-catalog"}

変更前（KSP）:

```toml
[versions]
koin = "4.0.0"
koin-ksp = "2.0.0"
ksp = "2.0.0-1.0.22"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin-ksp" }
koin-ksp-compiler = { module = "io.insert-koin:koin-ksp-compiler", version.ref = "koin-ksp" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

変更後（コンパイラプラグイン）:

```toml
[versions]
koin = "4.2.0"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

`koin-annotations` はメインのKoinプロジェクトの一部となり、`koin-core` と同じバージョンを使用するようになりました。最新のプラグインバージョンについては [Compiler Plugin Setup](/docs/setup/compiler-plugin) を確認してください。

## ステップ3: ビルド設定のアップデート {id="step-3-update-the-build-configuration"}

変更前（KSP）:

```kotlin
plugins {
    alias(libs.plugins.ksp)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
    ksp(libs.koin.ksp.compiler)
}

ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

変更後（コンパイラプラグイン）:

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}

// 任意
koinCompiler {
    userLogs = true // 検出されたコンポーネントをログ出力
}
```

`ksp { }` ブロックは削除してください。コンパイル時チェックはデフォルトで有効になっています。すべてのプラグインオプションについては [Compiler Plugin Options](/docs/reference/koin-annotations/options) を参照してください。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

KSPを使用している場合、ターゲットごとにプロセッサ設定が必要でした。

```kotlin
dependencies {
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

コンパイラプラグインでは、共有モジュールにプラグインを1度適用するだけで済み、すべての `ksp...` エントリを削除できます。

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

## ステップ4: Koinの起動方法のアップデート {id="step-4-update-how-koin-starts"}

KSPは各 `@Module` クラスに対して `.module` 拡張関数を生成していました。コンパイラプラグインにはそのような拡張関数はありません。代わりに `@KoinApplication` クラスを宣言し、型付けされたAPIを使って起動します。

変更前（KSP）:

```kotlin
import org.koin.ksp.generated.*

@Module
@ComponentScan("com.myapp")
class AppModule

fun main() {
    startKoin {
        modules(AppModule().module)
    }
}
```

変更後（コンパイラプラグイン）:

```kotlin
import org.koin.plugin.module.dsl.startKoin

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

Androidでは、ラムダ式内で通常のオプションを渡します。

```kotlin
@KoinApplication(modules = [AppModule::class])
class MyApp

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@MyApplication)
        }
    }
}
```

その他の型付けされたAPIとして、既存の `startKoin { }` やテストルール内で使用できる `koinApplication<T>()`、`koinConfiguration<T>()`、`withConfiguration<T>()` があります。単一のモジュールクラスをロードするには、通常の `startKoin { }` 内で `module<AppModule>()` を使用します。詳細は [Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## ステップ5: インポートのアップデート {id="step-5-update-imports"}

`@KoinViewModel` はコアアノテーションパッケージに移動しました。

```kotlin
// 変更前（KSP）
import org.koin.android.annotation.KoinViewModel

// 変更後（コンパイラプラグイン）
import org.koin.core.annotation.KoinViewModel
```

`import org.koin.ksp.generated.*` はすべて削除してください。

## ステップ6: クリーンとリビルド {id="step-6-clean-and-rebuild"}

KSPによって生成されたファイルを削除し、リビルドを実行します。

```bash
rm -rf build/generated/ksp
./gradlew clean build
```

初回のビルドでは完全なコンパイル時チェックが実行されます。KSPでは報告されなかった不足している定義がある場合、ビルドが失敗するようになります。エラーメッセージや `@Provided` については [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。

## 変更されない点 {id="what-stays-the-same"}

アノテーションを付与したクラスを変更する必要はありません。

```kotlin
@Singleton
class UserRepository(private val database: Database)

@Factory
class GetUserUseCase(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val useCase: GetUserUseCase) : ViewModel()
```

すべてのアノテーションは [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory) に記載されています。

## 移行後に利用可能になる機能 {id="what-you-can-use-after-migrating"}

以下の機能を利用するにはコンパイラプラグインが必要です。

- トップレベル関数: `@Singleton fun database(): Database` は、クラスと同様に `@ComponentScan` によって検出されます（[Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own) を参照）。
- モジュールの自動検出: 任意のGradleモジュール内で `@Configuration` が付けられたモジュールは、明示的にリストアップすることなく `@KoinApplication` によって読み込まれます。
- コンフィグレーションラベル: `@Configuration("test")` と `@KoinApplication(configurations = ["test"])` を組み合わせることで、そのラベルが付いたモジュールのみを読み込めます（[Modules](/docs/reference/koin-core/modules) を参照）。
- コンパイラプラグインDSL: DSLモジュールも併用している場合、コンパイラプラグインDSLに切り替えることができます。

| Constructor / Classic DSL | Compiler Plugin DSL |
|---------------------------|---------------------|
| `singleOf(::MyService)` | `single<MyService>()` |
| `factoryOf(::MyRepository)` | `factory<MyRepository>()` |
| `viewModelOf(::MyViewModel)` | `viewModel<MyViewModel>()` |
| `scopedOf(::MyScoped)` | `scoped<MyScoped>()` |
| `workerOf(::MyWorker)` | `worker<MyWorker>()` |
| `single { build(get()) }` | `single { create(::build) }` |

コンパイラプラグインDSLは `org.koin.plugin.module.dsl` にあります。Constructor DSLは引き続き `org.koin.core.module.dsl` に、Classic DSLは `org.koin.dsl` に残ります。どちらも引き続き動作し、プラグインによるチェックも行われるため、移行は必須ではありません。

## トラブルシューティング {id="troubleshooting"}

### KSP削除後にビルドが失敗する {id="the-build-fails-after-removing-ksp"}

古い生成コードがクラスパスに残っている可能性があります。`./gradlew clean` を実行し、`build/generated/ksp` を削除した上で、IDEのキャッシュを破棄（Invalidate Caches）してリビルドしてください。

### アノテーション付きクラスが検出されない {id="annotated-classes-are-not-detected"}

プラグインのログを有効にして、どのクラスが検出されているかを確認してください。

```kotlin
koinCompiler {
    userLogs = true
}
```

`@ComponentScan` に指定されているパッケージが、クラスのパッケージと一致しているか確認してください。

### ランタイム時に依存関係が見つからない {id="a-dependency-is-missing-at-runtime"}

- そのモジュールが `@KoinApplication(modules = [...])` にリストされているか、または `@Configuration` が付与されているか確認してください。
- `@ComponentScan` のパッケージ指定を確認してください。
- Koinの外部で作成された型の場合は、`@Provided` をマークしてください（[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照）。

## チェックリスト {id="checklist"}

- [ ] Kotlinを2.3.20以降にアップデート
- [ ] Koinを4.2.0以降にアップデート
- [ ] KSPプラグインを削除
- [ ] `koin-ksp-compiler` の依存関係と `ksp { }` ブロックを削除
- [ ] `koin-annotations` にメインのKoinバージョンを使用（`io.insert-koin:koin-annotations:$koin_version`）
- [ ] Koinコンパイラプラグインを適用（`io.insert-koin.compiler.plugin`）
- [ ] `@KoinViewModel` のインポートを `org.koin.core.annotation` に変更
- [ ] `@KoinApplication` クラスを作成し、`modules(X().module)` を `startKoin<MyApp>()` に置き換え
- [ ] `import org.koin.ksp.generated.*` を削除
- [ ] （任意）DSLモジュールを `org.koin.plugin.module.dsl.*` および `single<X>()` に切り替え
- [ ] クリーンとリビルドを実行（`rm -rf build/generated/ksp && ./gradlew clean build`）

## 関連情報 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin): プラグインの導入方法とバージョンの選定。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): プラグインが検証する内容とエラーコード。
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin<T>()` およびその他の型付きAPI。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): 各種Gradleオプション。
- [KSP Processor Setup](/docs/setup/annotations-ksp): 参考用の非推奨KSPセットアップガイド。