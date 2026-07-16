---
title: KSP アノテーションのセットアップ (非推奨)
---

# KSP アノテーションのセットアップ

:::warning
**非推奨**: KSP ベースのアノテーション処理アプローチは非推奨となりました。すべての新規プロジェクトについては、[Koin Compiler Plugin](/docs/setup/compiler-plugin) への移行をお願いします。
:::

:::info
**アノテーションはそのまま維持されます** - ビルド設定のみが変更されます。詳細は以下の [移行ガイド](#koin-compiler-plugin-への移行) を参照してください。
:::

## なぜ移行するのか？

| 項目 | KSP アノテーション | Compiler Plugin |
|--------|-----------------|-----------------|
| **生成ファイル** | build/ 内に表示される | なし |
| **ビルド速度** | ⚠️ 低速 | 高速 |
| **KMP のセットアップ** | ⚠️ 複雑 | シンプル |
| **今後のサポート** | ⚠️ 非推奨 | ✅ 活発な開発 |
| **コード** | ⚠️ 生成された拡張機能を使用 | Kotlin Compiler Plugin 専用 API を使用 |

## KSP を使用する場合 (一時的)

以下の場合にのみ KSP を使用してください：
- Kotlin 1.x から更新できない場合 (アップグレードを推奨)
- 移行の途中で、まだ切り替えられない場合
- 特定の KSP 要件がある場合

## 現在の KSP セットアップ (リファレンス)

KSP を使用する必要がある場合のセットアップは以下の通りです：

### Gradle のセットアップ

```kotlin
// build.gradle.kts
plugins {
    id("com.google.devtools.ksp") version "$ksp_version"
}

dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-core")
    implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

### バージョンの互換性

| Koin Annotations | KSP バージョン | Kotlin バージョン |
|------------------|-------------|----------------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1/2.2 | 2.1/2.2 | 2.1/2.2 |
| 2.3 | 2.3 | 依存なし |

### 基本的な使い方

```kotlin
@Single
class MyComponent

@Module
class MyModule

// 生成された拡張機能をインポート
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

### KSP オプション

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")  // コンパイル時の検証を有効にする
}
```

:::note
この KSP ベースのコンパイル時チェックは、**Koin Compiler Plugin** におけるネイティブのコンパイル時安全性に置き換えられます。[Compiler Plugin](/docs/setup/compiler-plugin) を参照してください。
:::

### KMP のセットアップ (複雑)

```kotlin
// shared/build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("io.insert-koin:koin-core:$koin_version")
            implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
        }
    }
}

dependencies {
    // プラットフォームごとの KSP 設定が必要
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

## Koin Compiler Plugin への移行

### ステップ 1: Kotlin の更新

Kotlin 2.3.20 以降を使用していることを確認してください：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1" // またはそれ以前
}
```

### ステップ 2: KSP の削除

KSP プラグインと依存関係を削除します：

```kotlin
// これらを削除:
plugins {
    // id("com.google.devtools.ksp")  // 削除
}

dependencies {
    // ksp("io.insert-koin:koin-ksp-compiler:...")  // 削除
}
```

### ステップ 3: Compiler Plugin の追加

詳細な手順については、**[Compiler Plugin セットアップガイド](/docs/setup/compiler-plugin)** を参照してください。

### ステップ 4: コードの維持

**アノテーションは全く同じままです 👍**

```kotlin
// このコードは変わりません！
@Singleton
class MyService(val repository: MyRepository)

@Factory
class MyRepository

@KoinViewModel
class MyViewModel(val service: MyService)

@Module
@ComponentScan("com.myapp")
class AppModule
```

### ステップ 5: Koin の起動処理を更新する

Compiler Plugin では、**生成されたコードは使用されません**。生成された拡張機能を型付けされた API に置き換えます：

**以前 (KSP):**
```kotlin
import org.koin.ksp.generated.*

startKoin {
    modules(AppModule().module)  // 生成された拡張機能を使用
}
```

**以降 (Compiler Plugin):**
```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 型付けされた API を使用 - 生成されたコードは不要！
startKoin<MyApp>()

// または設定を伴う場合
startKoin<MyApp> {
    androidContext(this@MyApplication)
}
```

利用可能な型付けされた API:
- `startKoin<T>()` - アプリケーション T を使用して Koin をグローバルに開始する
- `koinApplication<T>()` - T を使用して分離された KoinApplication を作成する
- `koinConfiguration<T>()` - T から KoinConfiguration を作成する (Compose の KoinApplication や Ktor など用)

ここで `T` は `@KoinApplication` が付与されたクラスです。

### ステップ 6: クリーンアップ

生成されたファイルを削除します：

```bash
rm -rf build/generated/ksp
```

プロジェクトをリビルドします。

### 変わらないもの

| アノテーション | ステータス |
|------------|--------|
| `@Singleton` / `@Single` | ✅ 同じ |
| `@Factory` | ✅ 同じ |
| `@Scoped` | ✅ 同じ |
| `@KoinViewModel` | ✅ 同じ |
| `@KoinWorker` | ✅ 同じ |
| `@Named` | ✅ 同じ |
| `@InjectedParam` | ✅ 同じ |
| `@Property` | ✅ 同じ |
| `@Module` | ✅ 同じ |
| `@ComponentScan` | ✅ 同じ |
| `@Configuration` | ✅ 同じ |

### 変わるもの

| 項目 | KSP | Compiler Plugin |
|--------|-----|-----------------|
| ビルドプラグイン | `com.google.devtools.ksp` | `io.insert-koin.compiler.plugin` |
| 依存関係 | `ksp()` 設定 | 不要 |
| 生成ファイル | `build/` 内に表示される | なし |
| Koin の起動処理 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| KMP のセットアップ | プラットフォームごとの KSP | プラグインのみ |

## タイムライン

:::warning
KSP アノテーションは将来の Koin バージョンで削除される予定です。できるだけ早い移行を推奨します。
:::

## ヘルプ

移行中に問題が発生した場合は：
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting) を確認
- [Slack](https://kotlinlang.slack.com/messages/koin/) で質問
- [GitHub](https://github.com/InsertKoinIO/koin) で issue を作成

## 次のステップ

- **[移行ガイド](/docs/migration/from-ksp-to-compiler-plugin)** - Compiler Plugin へのステップバイステップの移行
- **[Compiler Plugin のセットアップ](/docs/setup/compiler-plugin)** - 完全なセットアップガイド