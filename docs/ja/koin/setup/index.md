---
title: セットアップ
---

# セットアップ

このセクションでは、Koinを使用するためにGradleビルドへ追加する内容について説明します。以下から対象のプラットフォームを選択し、リンク先の[Gradleのセットアップ](/docs/setup/gradle)のセクションに従ってください。宣言スタイルをまだ決めていない場合は、まず[スタイルの選択](/docs/intro/choosing-your-style)をお読みください。スタイルによってCompiler Pluginが必要かどうかが決まります。

## インストール対象 {id="what-to-install"}

| プラットフォーム | アーティファクト | セットアップ |
|----------|-----------|-------|
| Kotlin/JVM | `koin-core` | [Kotlin/JVM](/docs/setup/gradle#kotlin) |
| Android | `koin-android` | [Android](/docs/setup/gradle#android) |
| Jetpack Composeを使用するAndroid | `koin-android`, `koin-compose`, `koin-compose-viewmodel` | [Jetpack Compose](/docs/setup/gradle#compose-android) |
| Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose Multiplatform](/docs/setup/gradle#compose) |
| Kotlin Multiplatform | `commonMain` 内の `koin-core` | [Kotlin Multiplatform](/docs/setup/gradle#kotlin-multiplatform) |
| Ktor | `koin-ktor`, `koin-logger-slf4j` | [Ktor](/docs/setup/gradle#ktor) |
| テスト | `koin-test`, `koin-test-junit4` または `koin-test-junit5` | [テスト](/docs/setup/gradle#testing) |

## 推奨セットアップ {id="recommended-setup"}

新規プロジェクトの場合:

1. **Koin BOM**: `io.insert-koin:koin-bom` をインポートし、バージョンを指定せずにKoinアーティファクトを宣言することで、バージョンが常に一致するようにします。[Gradleのセットアップ](/docs/setup/gradle)を参照してください。
2. **Koin Compiler Plugin**: Gradleプラグイン `io.insert-koin.compiler.plugin` を適用して、コンパイル時チェックを備えたCompiler Plugin DSLまたはアノテーションを利用できるようにします。これにはKotlin 2.3.20以降が必要です。[Compiler Pluginのセットアップ](/docs/setup/compiler-plugin)を参照してください。

Constructor DSLまたはClassic DSLのみを使用する場合、ステップ1だけで十分です。ただし、これらの定義にもコンパイル時チェックが追加されるため、ステップ2も推奨されます。

:::warning
KSPプロセッサ `koin-ksp-compiler` は非推奨（deprecated）です。既存プロジェクト向けにのみ、そのセットアップ手順が[KSPプロセッサのセットアップ](/docs/setup/annotations-ksp)に残されています。新規プロジェクトではCompiler Pluginを使用してください。
:::

## バージョン {id="versions"}

| コンポーネント | 現在のバージョン | Kotlin |
|-----------|-----------------|----------|
| Koin（`koin-annotations` を含むすべてのライブラリ） | 4.2.2 | 2.3.20でビルド |
| Koin Compiler Plugin | 1.2.1 | 2.3.20、2.4.0、2.4.10、2.4.20で検証済み（Koin 4.2.0以上が必要） |

最新の公開バージョン:

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

以前のKoinバージョン系列:

| Koin | Kotlin | Compiler Plugin |
|------|--------|-----------------|
| 4.2.x | 2.3.20+ | 対応 |
| 4.1.x | 2.1+ | 非対応（KSPプロセッサのみ） |
| 4.0.x | 1.9+ | 非対応（KSPプロセッサのみ） |
| 3.5.x | 1.8+ | 非対応 |

バージョン間の変更点およびアップグレード方法については、[リリース](/docs/support/releases)を参照してください。

## 関連情報 {id="related"}

- [Gradleのセットアップ](/docs/setup/gradle): BOMおよび各Koinアーティファクトについて。
- [Compiler Pluginのセットアップ](/docs/setup/compiler-plugin): プラグインのインストールと設定。
- [スタイルの選択](/docs/intro/choosing-your-style): 各スタイルに必要なものについて。
- [チュートリアル](/docs/quickstart/kotlin): 各プラットフォーム向けの最初のアプリケーション作成。
- [リリース](/docs/support/releases): バージョン情報とアップグレードの注意事項。