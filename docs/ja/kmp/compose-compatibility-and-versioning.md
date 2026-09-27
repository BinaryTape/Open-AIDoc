[//]: # (title: 互換性とバージョン)

Compose Multiplatform のリリースは、Kotlin および Jetpack Compose のリリースとは別に行われます。このページでは、Compose Multiplatform のリリース、Compose のリリースサイクル、およびコンポーネントの互換性に関する情報を掲載しています。
サポートされている IDE のバージョンの詳細については、[推奨される IDE とコードエディタ](recommended-ides.md)を参照してください。

Compose Multiplatform は Kotlin Multiplatform 上に構築されているため、[Kotlin Multiplatform 互換性ガイド](multiplatform-compatibility-guide.md)に記載されている Kotlin Multiplatform Gradle プラグイン、Gradle、Android Gradle Plugin、および Xcode とのバージョン互換性の影響も受けます。

## サポート対象プラットフォーム {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose% は以下のプラットフォームをサポートしています。

| プラットフォーム | 最小バージョン |
|----------|-----------------------------------------------------------------------------------------------------|
| Android  | Android 5.0 (API レベル 21) |
| iOS      | iOS 14 |
| macOS    | macOS 13 arm64 |
| Windows  | Windows 10 (x86-64, arm64) |
| Linux    | Ubuntu 20.04 (x86-64, arm64) |
| Web      | [WasmGC サポート](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions)のあるブラウザ |

> すべての Compose Multiplatform リリースは 64 ビットプラットフォームのみをサポートしています。
> 
{style="note"}

## Kotlin の互換性 {id="kotlin-compatibility"}

最新の Compose Multiplatform は、常に最新バージョンの Kotlin と互換性があります。
それらのバージョンを手動で合わせる必要はありません。
いずれかの製品の EAP バージョンを使用する場合は、依然として不安定である可能性があることに注意してください。

Compose Multiplatform は、Kotlin Multiplatform プラグインと同じバージョンの Compose Compiler Gradle プラグインを適用する必要があります。
詳細は [こちら](compose-compiler.md#migrating-a-compose-multiplatform-project) を参照してください。

Compose Multiplatform 1.8.0 以降、UI フレームワークは全面的に K2 コンパイラに移行しました。
最新の Compose Multiplatform リリースを使用するには：

 * プロジェクトで少なくとも Kotlin 2.1.0 を使用してください。
 * Compose Multiplatform ベースのライブラリに依存する場合は、それらが少なくとも Kotlin 2.1.0 でコンパイルされている場合にのみ使用してください。
 * iOS や Web など、サポートが急速に進化しているプラットフォームをターゲットとするプロジェクトの場合は、Kotlin **2.2.20** にアップグレードしてください。
 
すべての依存関係が更新されるまでの後方互換性の問題に対する回避策として、Gradle ビルドファイルで [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL を使用して Gradle キャッシュを無効にすることができます。これにより古いライブラリとの互換性は確保されますが、コンパイル時間は増加します。

## デスクトップ向け Compose Multiplatform の制限事項 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

[Skia](https://skia.org/) バインディングで使用されているメモリ管理スキームのため、デスクトップ向け Compose Multiplatform は JDK 11 以降のみをサポートしています。

さらに：
* [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) の制限により、ネイティブディストリビューションのパッケージングには JDK 17 以降のみがサポートされています。
* macOS でキーボードレイアウトを切り替える際に、OpenJDK 11.0.12 における既知の[問題](https://github.com/JetBrains/compose-multiplatform/issues/940)があります。この問題は OpenJDK 11.0.15 では再現されません。

## Jetpack Compose と Compose Multiplatform のリリースサイクル {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform は、Google が開発した Android 向けフレームワークである [Jetpack Compose](https://developer.android.com/jetpack/compose) と多くのコードを共有しています。共通コードが適切にテストされ安定するように、Compose Multiplatform のリリースサイクルを Jetpack Compose のリリースサイクルに合わせています。

Jetpack Compose の新バージョンがリリースされると、JetBrains は以下の手順を踏みます。

1. そのリリースのコミットを次の [Compose Multiplatform](https://github.com/JetBrains/androidx) バージョンのベースとして使用します。
2. 新しいプラットフォーム機能のサポートを追加します。
3. すべてのプラットフォームを安定化させます。
4. Compose Multiplatform の新バージョンをリリースします。

Compose Multiplatform のリリースと Jetpack Compose のリリースの間隔は、通常 1 〜 3 か月です。

### Compose Multiplatform の開発バージョン {id="development-versions-of-compose-multiplatform"}

Compose Multiplatform コンパイラプラグインの開発バージョン（例: `1.8.2+dev2544`）は、正式リリース間のアップデートをテストするために、決まったスケジュールなしでビルドされます。

これらのビルドは [Maven Central](https://central.sonatype.com/) では利用できません。
これらにアクセスするには、リポジトリのリストに次の行を追加してください。

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 使用される Jetpack Compose アーティファクト {id="jetpack-compose-artifacts-used"}

Android 向けにアプリケーションをビルドする場合、Compose Multiplatform は Google によって公開されたアーティファクトを使用します。

以下の表は、Compose Multiplatform の各バージョンで使用されている Jetpack Compose アーティファクトのバージョンを示しています。

| Compose Multiplatform バージョン | Jetpack Compose バージョン |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.1) | 1.12.1                  |
| [1.11.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.11.1) | 1.11.2                  |
| [1.10.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.3) | 1.10.5                  |
| [1.9.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.3)   | 1.9.4                   |
| [1.8.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.8.2)   | 1.8.2                   |
| [1.7.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.3)   | 1.7.6                   |
| [1.7.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.1)   | 1.7.5                   |
| [1.7.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.0)   | 1.7.1                   |
| [1.6.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.11) | 1.6.7                   |
| [1.6.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.10) | 1.6.7                   |
| [1.6.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.2)   | 1.6.4                   |
| [1.6.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.1)   | 1.6.3                   |
| [1.6.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.0)   | 1.6.1                   |
| [1.5.12](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.12) | 1.5.4                   |
| [1.5.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.11) | 1.5.4                   |
| [1.5.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.10) | 1.5.4                   |
| [1.5.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.1)   | 1.5.0                   |
| [1.5.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.0)   | 1.5.0                   |
| [1.4.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.3)   | 1.4.3                   |
| [1.4.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.1)   | 1.4.3                   |
| [1.4.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.0)   | 1.4.0                   |
| [1.3.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.1)   | 1.3.3                   |
| [1.3.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.0)   | 1.3.3                   |
| [1.2.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.1)   | 1.2.1                   |
| [1.2.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.0)   | 1.2.1                   |
| [1.1.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.1)   | 1.1.0                   |
| [1.1.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.0)   | 1.1.0                   |
| [1.0.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.1)   | 1.1.0-beta02            |
| [1.0.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.0)   | 1.1.0-beta02            |