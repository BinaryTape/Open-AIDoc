[//]: # (title: 互換性とバージョン)

Compose Multiplatform のリリースは、Kotlin および Jetpack Compose のリリースとは別に行われます。このページでは、Compose Multiplatform のリリース、Compose のリリースサイクル、およびコンポーネントの互換性に関する情報を提供します。
サポートされている IDE のバージョンに関する詳細については、[推奨される IDE とコードエディタ](recommended-ides.md) を参照してください。

Compose Multiplatform は Kotlin Multiplatform 上に構築されているため、[Kotlin Multiplatform 互換性ガイド](multiplatform-compatibility-guide.md) に記載されている Kotlin Multiplatform Gradle プラグイン、Gradle、Android Gradle プラグイン、および Xcode とのバージョン互換性にも影響を受けます。

## サポートされているプラットフォーム {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose% は以下のプラットフォームをサポートしています:

| プラットフォーム | 最小バージョン                                                                                        |
|------------------|-------------------------------------------------------------------------------------------------------|
| Android          | Android 5.0 (API レベル 21)                                                                           |
| iOS              | iOS 14                                                                                                |
| macOS            | macOS 13 arm64                                                                                        |
| Windows          | Windows 10 (x86-64, arm64)                                                                            |
| Linux            | Ubuntu 20.04 (x86-64, arm64)                                                                          |
| Web              | [WasmGC をサポートするブラウザ](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions) |

> すべての Compose Multiplatform リリースは、64ビットプラットフォームのみをサポートしています。
> 
{style="note"}

## Kotlin の互換性 {id="kotlin-compatibility"}

最新の Compose Multiplatform は、常に最新バージョンの Kotlin と互換性があります。
手動でバージョンを合わせる必要はありません。
どちらかの製品の EAP バージョンを使用する場合は、不安定になる可能性があることに留意してください。

Compose Multiplatform では、Kotlin Multiplatform プラグインと同じバージョンが適用された Compose Compiler Gradle プラグインが必要です。
詳細は [Compose Multiplatform プロジェクトの移行](compose-compiler.md#migrating-a-compose-multiplatform-project) を参照してください。

Compose Multiplatform 1.8.0 以降、UI フレームワークは完全に K2 コンパイラへと移行しました。
最新の Compose Multiplatform リリースを使用するには、以下を行ってください:

 * プロジェクトで少なくとも Kotlin 2.1.0 を使用する
 * 少なくとも Kotlin 2.1.0 に対してコンパイルされた Compose Multiplatform ベースのライブラリにのみ依存する
 * iOS や Web など、急速に進化しているサポート対象プラットフォーム向けのプロジェクトでは、Kotlin **2.2.20** にアップグレードする
 
すべての依存関係が更新されるまでの後方互換性の問題に対する回避策として、Gradle ビルドファイルで [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL を使用して Gradle キャッシュを無効にすることができます。
これにより古いライブラリとの互換性は確保されますが、コンパイル時間は増加します。

## デスクトップ向け Compose Multiplatform リリースの制限事項 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

デスクトップ向け Compose Multiplatform では、[Skia](https://skia.org/) バインディングで使用されているメモリ管理スキームのため、JDK 11 以降のみがサポートされています。

さらに:
* [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) の制限により、ネイティブディストリビューションのパッケージングには JDK 17 以降のみがサポートされています。
* macOS でキーボードレイアウトを切り替える際の OpenJDK 11.0.12 における既知の[問題](https://github.com/JetBrains/compose-multiplatform/issues/940)があります。
  この問題は OpenJDK 11.0.15 では再現しません。

## Jetpack Compose と Compose Multiplatform のリリースサイクル {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform は、Google によって開発された Android 向けの [Jetpack Compose](https://developer.android.com/jetpack/compose) と多くのコードを共有しています。共通コードが適切にテストされ安定化するように、Compose Multiplatform のリリースサイクルは Jetpack Compose のリリースサイクルに合わせて調整されています。

Jetpack Compose の新しいバージョンがリリースされると、JetBrains は次の手順を実行します:

1. そのリリースコミットを次の [Compose Multiplatform](https://github.com/JetBrains/androidx) バージョンのベースとして使用する。
2. 新しいプラットフォーム機能のサポートを追加する。
3. すべてのプラットフォームを安定化させる。
4. Compose Multiplatform の新しいバージョンをリリースする。

Compose Multiplatform のリリースと Jetpack Compose のリリースの間隔は、通常 1〜3 か月です。

### Compose Multiplatform の開発バージョン {id="development-versions-of-compose-multiplatform"}

Compose Multiplatform コンパイラプラグインの開発バージョン（例: `1.8.2+dev2544`）は、正式リリース間のアップデートをテストするために、決まったスケジュールなしでビルドされます。

これらのビルドは [Maven Central](https://central.sonatype.com/) では入手できません。
これらにアクセスするには、リポジトリのリストに次の行を追加してください:

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 使用される Jetpack Compose アーティファクト {id="jetpack-compose-artifacts-used"}

Android 向けにアプリケーションをビルドする際、Compose Multiplatform は Google から公開されているアーティファクトを使用します。

以下の表は、Compose Multiplatform の各バージョンで使用されている Jetpack Compose アーティファクトのバージョンを示しています:

| Compose Multiplatform バージョン                                                 | Jetpack Compose バージョン |
|-----------------------------------------------------------------------------------|----------------------------|
| [1.12.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.2) | 1.12.1                     |
| [1.11.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.11.1) | 1.11.2                     |
| [1.10.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.3) | 1.10.5                     |
| [1.9.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.3)   | 1.9.4                      |
| [1.8.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.8.2)   | 1.8.2                      |
| [1.7.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.3)   | 1.7.6                      |
| [1.7.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.1)   | 1.7.5                      |
| [1.7.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.0)   | 1.7.1                      |
| [1.6.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.11) | 1.6.7                      |
| [1.6.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.10) | 1.6.7                      |
| [1.6.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.2)   | 1.6.4                      |
| [1.6.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.1)   | 1.6.3                      |
| [1.6.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.0)   | 1.6.1                      |
| [1.5.12](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.12) | 1.5.4                      |
| [1.5.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.11) | 1.5.4                      |
| [1.5.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.10) | 1.5.4                      |
| [1.5.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.1)   | 1.5.0                      |
| [1.5.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.0)   | 1.5.0                      |
| [1.4.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.3)   | 1.4.3                      |
| [1.4.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.1)   | 1.4.3                      |
| [1.4.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.0)   | 1.4.0                      |
| [1.3.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.1)   | 1.3.3                      |
| [1.3.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.0)   | 1.3.3                      |
| [1.2.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.1)   | 1.2.1                      |
| [1.2.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.0)   | 1.2.1                      |
| [1.1.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.1)   | 1.1.0                      |
| [1.1.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.0)   | 1.1.0                      |
| [1.0.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.1)   | 1.1.0-beta02               |
| [1.0.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.0)   | 1.1.0-beta02               |