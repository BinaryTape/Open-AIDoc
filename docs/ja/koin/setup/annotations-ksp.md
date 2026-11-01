---
title: KSPプロセッサのセットアップ（非推奨）
---

# KSPプロセッサのセットアップ（非推奨）

このページでは、以前Koinアノテーションの読み取りに使用されていたKSPプロセッサである `koin-ksp-compiler` のGradleセットアップについて説明します。本ドキュメントは、現在もこれを使用しているプロジェクトのために残されています。新規プロジェクトでは [Koin Compiler Plugin](/docs/setup/compiler-plugin) を使用してください。

:::warning
`koin-ksp-compiler` は非推奨であり、将来のKoinバージョンで削除される予定です。アノテーション自体は非推奨ではありません。`koin-annotations` はメインのKoinプロジェクトの一部であり、Koin Compiler Pluginによって処理されます。変更されるのはプロセッサのみです。詳細は [KSPからCompiler Pluginへの移行](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。
:::

## KSPプロセッサを引き続き使用すべきケース {id="when-to-keep-the-ksp-processor"}

以下のような場合に限り、一時的にのみ使用を継続してください:

- **Kotlinのバージョン**: プロジェクトが、Compiler Pluginで要求されるKotlin 2.3.20以降にまだ移行できない場合。
- **移行の途中**: ビルド構成を切り替える前にリリース（出荷）する必要がある場合。

Compiler Pluginと比較して、KSPプロセッサは可視ソースファイルを生成し、Kotlin MultiplatformのターゲットごとにKSPの設定が必要であり、Koinを開始するために `AppModule().module` などの生成された拡張関数を使用します。

## Gradleのセットアップ {id="gradle-setup"}

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

KSPを使用する場合、`koin-annotations` と `koin-ksp-compiler` はKoinのバージョンではなく、Koin Annotationsのバージョン（`$koin_ksp_version`）を使用します。Compiler Pluginを使用する場合、`koin-annotations` はKoinのバージョンに従います。

### バージョン互換性 {id="version-compatibility"}

| Koin Annotations | KSP | Kotlin |
|------------------|-----|--------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1, 2.2 | 2.1, 2.2 | 2.1, 2.2 |
| 2.3 | 2.3 | 依存なし |

## 生成されたモジュールを使用してKoinを開始する {id="starting-koin-with-generated-modules"}

KSPは、各 `@Module` クラスに対して `.module` 拡張を生成します:

```kotlin
import org.koin.ksp.generated.*

@Single
class MyComponent

@Module
@ComponentScan
class MyModule

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

## コンパイル時のチェック {id="compile-time-check"}

KSPプロセッサには独自の設定チェック機能があり、KSP引数を使用して有効化できます:

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

Compiler Pluginではこれが置き換えられ、グラフ全体やすべての `get()` 呼び出し箇所のチェックが行われます。[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

KSPではターゲットごとに1つの設定が必要です:

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
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

Compiler Pluginを使用すると、プラグインを1度適用し、`commonMain` に `koin-annotations` を追加するだけで済みます。

## Compiler Pluginへの移行 {id="moving-to-the-compiler-plugin"}

移行しても、アノテーションが付与されたクラスはそのまま維持されます。KSPと `koin-ksp-compiler` を削除し、Compiler Pluginを適用し、生成されたソースを削除して、`modules(MyModule().module)` を `startKoin<MyApp>()` に置き換えます。段階的な手順については、[KSPからCompiler Pluginへの移行](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。

問題が発生した場合は、[Kotlin Slackの#koinチャンネル](https://kotlinlang.slack.com/messages/koin/)で質問するか、[InsertKoinIO/koin-annotations](https://github.com/InsertKoinIO/koin-annotations)でIssueを作成してください。

## 関連情報 {id="related"}

- [KSPからの移行](/docs/migration/from-ksp-to-compiler-plugin): ステップバイステップの移行ガイド。
- [Compiler Pluginのセットアップ](/docs/setup/compiler-plugin): 後継プラグインの導入。
- [スタイルの選択](/docs/intro/choosing-your-style): アノテーションおよびその他のスタイル。
- [アノテーションリファレンス](/docs/reference/koin-annotations/annotations-inventory): 全アノテーションの一覧。