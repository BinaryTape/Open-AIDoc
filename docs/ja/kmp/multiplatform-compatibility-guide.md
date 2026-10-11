[//]: # (title: Kotlin Multiplatform 互換性ガイド)

<show-structure depth="1"/>

このガイドでは、Kotlin Multiplatform でプロジェクトを開発する際に発生する可能性がある[互換性のない変更（incompatible changes）](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)についてまとめています。

> Compose Multiplatform に関する情報については、
> [Compose Multiplatform の新機能](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)
> および [Kotlin と Jetpack の互換性](compose-compatibility-and-versioning.md)ページを参照してください。
> 
{style="note"}

現在の Kotlin の安定版（Stable）バージョンは %kotlinVersion% です。プロジェクトで使用している Kotlin バージョンに関連する特定の変更の非推奨サイクルに注意してください。例えば：

* Kotlin 1.7.0 から Kotlin 1.9.0 へアップグレードする場合、[Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) と [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) の両方で発効した互換性のない変更を確認してください。
* Kotlin 1.9.0 から Kotlin 2.0.0 へアップグレードする場合、[Kotlin 2.0.0](#kotlin-2-0-0-and-later) と [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) の両方で発効した互換性のない変更を確認してください。

## バージョン互換性 {id="version-compatibility"}

プロジェクトを設定する際は、特定のバージョンの Kotlin Multiplatform Gradle プラグイン（プロジェクトの Kotlin バージョンと同じ）と、Gradle、Xcode、および Android Gradle プラグインの各バージョンとの互換性を確認してください：

| Kotlin Multiplatform プラグインバージョン | Gradle                                | Android Gradle プラグイン                            | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.20–2.4.21                              | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.4.0–2.4.10                        | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         | 26.4    |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3–8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5–8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5–8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 および Kotlin 2.1.0–2.1.10 は、Gradle 8.6 までと完全な互換性があります。
> Gradle バージョン 8.7–8.10 もサポートされていますが、1点だけ例外があります。Kotlin Multiplatform Gradle プラグインを使用している場合、
> JVM ターゲットで `withJava()` 関数を呼び出しているマルチプラットフォームプロジェクトで非推奨の警告が表示されることがあります。
> 詳細については、[デフォルトで作成される Java ソースセット](#java-source-sets-created-by-default)を参照してください。
>
{style="warning"}

## Kotlin 2.0.0 以降 {id="kotlin-2-0-0-and-later"}

このセクションでは、Kotlin 2.0.0−%kotlinVersion% で非推奨サイクルが終了し、有効になった互換性のない変更について説明します。

<a id="android-target-rename"></a>
### Android ターゲット向けの Google 製プラグインへの移行 {id="migrate-to-google-s-plugin-for-android-targets"}

**何が変わったのか？**

Kotlin 2.3.0 より前は、`com.android.application` および `com.android.library` プラグインを通じて Android ターゲットのサポートを提供していました。
これは、Google の Android チームが Kotlin Multiplatform に特化した別のプラグインを開発する間の一時的な解決策でした。

当初は `android` ブロックを使用していましたが、後に新しいプラグインで使用できるように `android` という名前を予約するため、`androidTarget` ブロックへと移行しました。

現在、Android チームから [`com.android.kotlin.multiplatform.library` プラグイン](https://developer.android.com/kotlin/multiplatform/plugin)が利用可能になり、オリジナルの `android` ブロックで使用できるようになりました。

Kotlin 2.3.0 では、Kotlin Multiplatform プロジェクトで `androidTarget` 名が使用された場合に非推奨の警告が導入されます。`android` ブロックへの移行にもう少し時間が必要な場合は、警告が表示されない AGP 8.x と Kotlin 2.3.10 を使用してください。

**現在のベストプラクティスは？**

新しい `com.android.kotlin.multiplatform.library` プラグインへ移行してください。出現するすべての `androidTarget` ブロックを `android` にリネームします。
移行方法の詳細な手順については、Google の[移行ガイド](https://developer.android.com/kotlin/multiplatform/plugin#migrate)を参照してください。

**変更はいつ発効するのか？**

Kotlin Multiplatform Gradle プラグインの非推奨サイクルは以下のとおりです：

* 1.9.0: Kotlin Multiplatform プロジェクトで `android` 名が使用された場合に非推奨警告を導入
* 2.1.0: この警告をエラーに引き上げ
* 2.2.0: Kotlin Multiplatform Gradle プラグインから `android` ターゲット DSL を削除
* 2.3.0: 新しい Android プラグインが利用可能になり、Kotlin Multiplatform プロジェクトで `androidTarget` 名が使用された場合に非推奨警告を導入
* 2.3.10: Kotlin Multiplatform プロジェクトで `androidTarget` 名が使用された場合の非推奨警告を取り消し

### ビットコード埋め込みの非推奨化 {id="deprecated-bitcode-embedding"}

**何が変わったのか？**

ビットコード（Bitcode）の埋め込みは、Xcode 14 で非推奨となり、Xcode 15 ですべての Apple ターゲットに対して削除されました。これに伴い、フレームワーク設定用の `embedBitcode` パラメータ、ならびに `-Xembed-bitcode` および `-Xembed-bitcode-marker` コマンドライン引数は Kotlin において非推奨となりました。

**現在のベストプラクティスは？**

依然として以前のバージョンの Xcode を使用しているものの、Kotlin 2.0.20 以降にアップグレードしたい場合は、Xcode プロジェクトでビットコードの埋め込みを無効にしてください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 2.0.20: Kotlin/Native コンパイラがビットコードの埋め込みをサポートしなくなる
* 2.1.0: Kotlin Multiplatform Gradle プラグインで `embedBitcode` DSL が警告付きで非推奨になる
* 2.2.0: 警告がエラーに引き上げられる
* 2.3.0: `embedBitcode` DSL が削除される

<a id="java-source-set-created-by-default"></a>
### デフォルトで作成される Java ソースセット {id="java-source-sets-created-by-default"}

**何が変わったのか？**

Kotlin Multiplatform を今後の Gradle の変更に合わせるため、`withJava()` 関数を段階的に廃止しています。`withJava()` 関数は、必要な Java ソースセットを作成することで Gradle の Java プラグインとの統合を可能にしていました。Kotlin 2.1.20 からは、これらの Java ソースセットがデフォルトで作成されるようになります。

**現在のベストプラクティスは？**

以前は、`src/jvmMain/java` および `src/jvmTest/java` ソースセットを作成するために `withJava()` 関数を明示的に使用する必要がありました：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

Kotlin 2.1.20 からは、ビルドスクリプトから `withJava()` 関数を削除できます。

さらに、Gradle は Java ソースが存在する場合にのみ Java コンパイルタスクを実行するようになり、以前は実行されなかった JVM 検証診断がトリガーされるようになりました。この診断は、`KotlinJvmCompile` タスクに対して、または `compilerOptions` 内で互換性のない JVM ターゲットを明示的に設定している場合に失敗します。JVM ターゲットの互換性を確保するためのガイダンスについては、[関連するコンパイルタスクの JVM ターゲット互換性の確認](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)を参照してください。

プロジェクトで 8.7 より新しい Gradle バージョンを使用しており、[Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html)、[Application](https://docs.gradle.org/current/userguide/application_plugin.html) などの Gradle Java プラグインや、Gradle Java プラグインに依存関係を持つサードパーティの Gradle プラグインに依存していない場合は、`withJava()` 関数を削除できます。

プロジェクトで [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java プラグインを使用している場合は、[新しい実験的（Experimental）DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin) への移行をおすすめします。Gradle 8.7 以降、Application プラグインは Kotlin Multiplatform Gradle プラグインで動作しなくなります。

マルチプラットフォームプロジェクトで Kotlin Multiplatform Gradle プラグインと Java 向けの他の Gradle プラグインの両方を使用したい場合は、[Kotlin Multiplatform Gradle プラグインと Java プラグインの互換性の非推奨化](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)を参照してください。

Kotlin 2.1.20 と 8.7 より新しい Gradle バージョンで [Java test fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle プラグインを使用している場合、このプラグインは動作しません。代わりに、この問題が解決されている [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details) にアップグレードしてください。

問題が発生した場合は、[課題トラッカー](https://kotl.in/issue)に報告するか、[公開 Slack チャンネル](https://kotlinlang.slack.com/archives/C19FD9681)でサポートを求めてください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* Gradle >8.6: `withJava()` 関数を使用しているマルチプラットフォームプロジェクトにおいて、以前のバージョンの Kotlin に対する非推奨警告を導入。
* Gradle 9.0: この警告をエラーに引き上げ。
* 2.1.20: いずれのバージョンの Gradle でも `withJava()` 関数を使用した場合に非推奨警告を導入。

<a id="declaring-multiple-targets"></a>
### 複数の類似ターゲットの宣言 {id="declaring-several-similar-targets"}

**What's changed?**

単一の Gradle プロジェクト内で複数の類似ターゲットを宣言することは非推奨です。例えば：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 非推奨であり、非推奨警告が発生します
}
```

よくあるケースの1つは、関連する2つのコードをまとめることです。例えば、`:shared` Gradle プロジェクトで `jvm("jvmKtor")` と `jvm("jvmOkHttp")` を使用して、Ktor または OkHttp ライブラリを使用したネットワーキングを実装したい場合があります：

```kotlin
// shared/build.gradle.kts:
kotlin {
    jvm("jvmKtor") {
        attributes.attribute(/* ... */)
    }
    jvm("jvmOkHttp") {
        attributes.attribute(/* ... */)
    }

    sourceSets {
        val commonMain by getting
        val commonJvmMain by sourceSets.creating {
            dependsOn(commonMain)
            dependencies {
                // 共有の依存関係
            }
        }
        val jvmKtorMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // Ktor の依存関係
            }
        }
        val jvmOkHttpMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // OkHttp の依存関係
            }
        }
    }
}
```

この実装には、軽視できない設定の複雑さが伴います：

* `:shared` 側と各コンシューマー側の両方で Gradle 属性を設定する必要があります。そうしないと、追加情報なしにはコンシューマーが Ktor ベースの実装を受け取るべきか OkHttp ベースの実装を受け取るべきかが明確でないため、Gradle はそのようなプロジェクトで依存関係を解決できません。
* `commonJvmMain` ソースセットを手動で設定する必要があります。
* この設定には、多くの低レベルな Gradle および Kotlin Gradle プラグインの抽象化や API が関わっています。

**現在のベストプラクティスは？**

設定が複雑になるのは、Ktor ベースと OkHttp ベースの実装が*同じ Gradle プロジェクト内にある*ためです。多くの場合、これらの部分を別々の Gradle プロジェクトに切り出すことが可能です。このようなリファクタリングの概要は以下のとおりです：

1. 元のプロジェクトの重複する2つのターゲットを単一のターゲットに置き換えます。これらのターゲット間で共有ソースセットがある場合は、そのソースと設定を新しく作成したターゲットのデフォルトソースセットに移動します：

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // ここに jvmCommonMain の設定をコピー
            }
        }
    }
    ```

2. 通常は `settings.gradle.kts` ファイルで `include` を呼び出すことにより、2つの新しい Gradle プロジェクトを追加します。例えば：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. それぞれの新しい Gradle プロジェクトを設定します：

    * これらのプロジェクトは1つのターゲットのみにコンパイルされるため、ほとんどの場合、`kotlin("multiplatform")` プラグインを適用する必要はありません。この例では、`kotlin("jvm")` を適用できます。
    * 元のターゲット固有のソースセットの内容をそれぞれのプロジェクトに移動します（例: `jvmKtorMain` から `ktor-impl/src` へ）。
    * ソースセットの設定（依存関係、コンパイラオプションなど）をコピーします。
    * 新しい Gradle プロジェクトから元のプロジェクトへの依存関係を追加します。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 元のプロジェクトへの依存関係を追加
        // ここに jvmKtorMain の依存関係をコピー
    }
    
    kotlin {
        compilerOptions {
            // ここに jvmKtorMain のコンパイラオプションをコピー
        }
    }
    ```

このアプローチは初期セットアップにより多くの作業を必要としますが、Gradle や Kotlin Gradle プラグインの低レベルなエンティティを使用しないため、結果として得られるビルドの使用と保守が容易になります。

> 残念ながら、すべてのケースに対して詳細な移行手順を提供することはできません。上記の手順でうまくいかない場合は、この [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-59316)でご自身のユースケースを説明してください。
>
{style="tip"}

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.9.20: Kotlin Multiplatform プロジェクトで複数の類似ターゲットが使用された場合に非推奨警告を導入
* 2.1.0: Kotlin/JS ターゲットを除き、そのような場合にエラーを報告。この例外の詳細については、[YouTrack](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode) の課題を参照してください。

<a id="deprecate-pre-hmpp-dependencies"></a>
### レガシーモードで公開されたマルチプラットフォームライブラリのサポート非推奨化 {id="deprecated-support-of-multiplatform-libraries-published-in-legacy-mode"}

**何が変わったのか？**

以前、Kotlin Multiplatform プロジェクトにおいて「レガシー」バイナリの公開を防ぐために[レガシーモードを非推奨](#deprecated-gradle-properties-for-hierarchical-structure-support)にし、プロジェクトを[階層構造（hierarchical structure）](multiplatform-hierarchy.md)に移行することを推奨しました。

エコシステムから「レガシー」バイナリを段階的に排除し続けるため、Kotlin 1.9.0 以降、レガシーライブラリの使用も非推奨となっています。プロジェクトがレガシーライブラリへの依存関係を使用している場合、次の警告が表示されます：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**現在のベストプラクティスは？**

*マルチプラットフォームライブラリを使用している場合*、そのほとんどはすでに「階層構造」モードに移行しているため、ライブラリのバージョンを更新するだけで済みます。詳細については、各ライブラリのドキュメントを参照してください。

ライブラリがまだ非レガシーバイナリをサポートしていない場合は、メンテナに連絡してこの互換性の問題について伝えてください。

*ライブラリの作者である場合*は、Kotlin Gradle プラグインを最新バージョンに更新し、[非推奨の Gradle プロパティ](#deprecated-gradle-properties-for-hierarchical-structure-support)を修正したことを確認してください。

Kotlin チームはエコシステムの移行を積極的に支援したいと考えていますので、問題が発生した場合は遠慮なく [YouTrack で課題を作成](https://kotl.in/issue)してください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.9.0: レガシーライブラリへの依存関係に対して非推奨警告を導入
* 2.0.0: レガシーライブラリへの依存関係に対する警告をエラーに引き上げ
* &gt;2.0.0: レガシーライブラリへの依存関係のサポートを削除。このような依存関係を使用するとビルドエラーが発生する可能性があります

<a id="deprecate-hmpp-properties"></a>
### 階層構造サポートのための非推奨となった Gradle プロパティ {id="deprecated-gradle-properties-for-hierarchical-structure-support"}

**何が変わったのか？**

Kotlin の進化に伴い、マルチプラットフォームプロジェクトにおける[階層構造](multiplatform-hierarchy.md)（共通ソースセット `commonMain` と特定のプラットフォーム固有ソースセット（例: `jvmMain`）との間に中間ソースセットを持つ機能）のサポートが段階的に導入されてきました。

ツールチェーンが十分に安定していなかった移行期間中は、きめ細かいオプトインおよびオプトアウトを可能にするいくつかの Gradle プロパティが導入されていました。

Kotlin 1.6.20 以降、階層プロジェクト構造のサポートはデフォルトで有効になっています。しかし、ブロッキングな問題が発生した場合のオプトアウト用として、これらのプロパティは維持されていました。すべてのフィードバックを処理した結果、現在これらのプロパティを完全に廃止し始めています。

以下のプロパティが非推奨となりました：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**現在のベストプラクティスは？**

* これらのプロパティを `gradle.properties` および `local.properties` ファイルから削除してください。
* Gradle ビルドスクリプトや独自の Gradle プラグインでこれらをプログラムから設定することは避けてください。
* ビルドで使用されているサードパーティの Gradle プラグインによって非推奨のプロパティが設定されている場合は、プラグインのメンテナにこれらのプロパティを設定しないよう依頼してください。

Kotlin 1.6.20 以降、Kotlin ツールチェーンのデフォルトの動作にはこのようなプロパティが含まれていないため、重大な影響はないと予想されます。ほとんどの影響は、プロジェクトをリビルドした直後に確認できます。

ライブラリの作者であり、万全を期したい場合は、コンシューマーがライブラリを使用できることを確認してください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.8.20: 非推奨の Gradle プロパティが使用された場合に警告を報告
* 1.9.20: この警告をエラーに引き上げ
* 2.0.0: 非推奨のプロパティを削除。Kotlin Gradle プラグインはその使用を無視します

これらのプロパティを削除した後に問題が発生するという万が一の場合は、[YouTrack で課題を作成](https://kotl.in/issue)してください。

<a id="target-presets-deprecation"></a>
### 非推奨となったターゲットプリセット API {id="deprecated-target-presets-api"}

**何が変わったのか？**

非常に初期の開発段階において、Kotlin Multiplatform は、いわゆる*ターゲットプリセット（target presets）*を扱うための API を導入しました。各ターゲットプリセットは、実質的に Kotlin Multiplatform ターゲットのファクトリを表していました。`jvm()` や `iosSimulatorArm64()` などの DSL 関数は、はるかに直接的で簡潔でありながら同じユースケースをカバーしているため、この API は大部分が冗長であることが判明しました。

混乱を減らし、より明確なガイドラインを提供するために、プリセット関連のすべての API は Kotlin Gradle プラグインの公開 API において非推奨となりました。これには以下が含まれます：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` の `presets` プロパティ
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` インターフェースおよびそのすべての継承者
* `fromPreset` のオーバーロード

**現在のベストプラクティスは？**

代わりに、対応する [Kotlin ターゲット](multiplatform-dsl-reference.md#targets)を使用してください。例えば：

<table>
    
<tr>
<td>以前</td>
        <td>現在</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        fromPreset(presets.iosArm64, 'ios')&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    iosArm64()&#10;}"/>
</td>
</tr>

</table>

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.9.20: プリセット関連 API の使用に対して警告を報告
* 2.0.0: この警告をエラーに引き上げ
* 2.2.0: Kotlin Gradle プラグインの公開 API からプリセット関連 API を削除。これらを引き続き使用しているソースは「unresolved reference」エラーで失敗し、バイナリ（Gradle プラグインなど）は最新バージョンの Kotlin Gradle プラグインに対して再コンパイルされない限り、リンケージエラーで失敗する可能性があります

<a id="target-shortcuts-deprecation"></a>
### 非推奨となった Apple ターゲットショートカット {id="deprecated-apple-target-shortcuts"}

**何が変わったのか？**

Kotlin Multiplatform DSL における `ios()`、`watchos()`、および `tvos()` ターゲットショートカットを非推奨としています。これらは、Apple ターゲット用のソースセット階層を部分的に作成するように設計されていました。しかし、拡張が難しく、時に混乱を招くことが判明しました。

例えば、`ios()` ショートカットは `iosArm64` と `iosX64` の両方のターゲットを作成しましたが、Apple M チップを搭載したホストで作業する際に必要な `iosSimulatorArm64` ターゲットは含まれていませんでした。しかし、このショートカットを変更することは実装が難しく、既存のユーザープロジェクトで問題を引き起こす可能性がありました。

**現在のベストプラクティスは？**

Kotlin Gradle プラグインは現在、組み込みの階層テンプレートを提供しています。Kotlin 1.9.20 以降、これはデフォルトで有効になっており、一般的なユースケース向けに事前定義された中間ソースセットが含まれています。

ショートカットの代わりにターゲットのリストを指定すると、プラグインがそのリストに基づいて中間ソースセットを自動的に設定します。

例えば、プロジェクトに `iosArm64` と `iosSimulatorArm64` ターゲットがある場合、プラグインは `iosMain` と `iosTest` の中間ソースセットを自動的に作成します。`iosArm64` と `macosArm64` ターゲットがある場合は、`appleMain` と `appleTest` のソースセットが作成されます。

詳細については、[階層プロジェクト構造](multiplatform-hierarchy.md)を参照してください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.9.20: `ios()`、`watchos()`、および `tvos()` ターゲットショートカットが使用された場合に警告を報告。代わりにデフォルトの階層テンプレートがデフォルトで有効化
* 2.1.0: ターゲットショートカットが使用された場合にエラーを報告
* 2.2.0: Kotlin Multiplatform Gradle プラグインからターゲットショートカット DSL を削除

### Kotlin アップグレード後の iOS フレームワークのバージョンが不正確になる問題 {id="incorrect-version-of-ios-framework-after-kotlin-upgrade"}

**問題の内容は？**

直接統合（direct integration）を使用している場合、Kotlin コードの変更が Xcode の iOS アプリに反映されないことがあります。直接統合は、マルチプラットフォームプロジェクトの iOS フレームワークを Xcode の iOS アプリに接続する `embedAndSignAppleFrameworkForXcode` タスクで設定されます。

これは、マルチプラットフォームプロジェクトで Kotlin バージョンを 1.9.2x から 2.0.0 にアップグレード（または 2.0.0 から 1.9.2x にダウングレード）した後、Kotlin ファイルに変更を加えてアプリをビルドしようとしたときに発生することがあり、Xcode が誤って以前のバージョンの iOS フレームワークを使用してしまう場合があります。そのため、Xcode の iOS アプリに変更が表示されません。

**回避策は？**

1. Xcode で、**Product** | **Clean Build Folder** を使用してビルドディレクトリをクリーンアップします。
2. ターミナルで、次のコマンドを実行します：

   ```none
   ./gradlew clean
   ```

3. アプリを再度ビルドして、新しいバージョンの iOS フレームワークが確実に使用されるようにします。

**問題はいつ修正されるのか？**

この問題は Kotlin 2.0.10 で修正を予定しています。[Kotlin 早期アクセスプレビューへの参加](https://kotlinlang.org/docs/eap.html)セクションで、Kotlin 2.0.10 のプレビューバージョンがすでに利用可能かどうかを確認できます。

詳細については、[YouTrack の該当する課題](https://youtrack.jetbrains.com/issue/KT-68257)を参照してください。

## Kotlin 1.9.0−1.9.25 {id="kotlin-1-9-0-1-9-25"}

このセクションでは、Kotlin 1.9.0−1.9.25 で非推奨サイクルが終了し、有効になった互換性のない変更について説明します。

<a id="compilation-source-deprecation"></a>
### Kotlin コンパイルに直接 Kotlin ソースセットを追加する API の削除 {initial-collapse-state="collapsed" collapsible="true" id="removed-api-for-adding-kotlin-source-sets-directly-to-the-kotlin-compilation"}

**何が変わったのか？**

`KotlinCompilation.source` へのアクセスが削除されました。以下のようなコードはサポートされなくなりました：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()
    
    sourceSets {
        val commonMain by getting
        val myCustomIntermediateSourceSet by creating {
            dependsOn(commonMain)
        }
        
        targets["jvm"].compilations["main"].source(myCustomIntermediateSourceSet)
    }
}
```

**現在のベストプラクティスは？**

`KotlinCompilation.source(someSourceSet)` を置き換えるには、`.srcDir()` 関数を使用して適切なソースセットにソースを直接追加します。あるいは、`KotlinCompilation` のデフォルトソースセットから `someSourceSet` への `dependsOn` 関係を追加して、新しいソースセットを作成することもできます。また、IDE との親和性が高く、最も堅牢なアプローチと見なされている[ソースセットの規則（source set conventions）](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/)を使用してソースを直接参照することもできます。最後に、すべてのケースで機能する `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)` を使用することも可能です。

上記のコードは、次のいずれかの方法で変更できます：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // commonMain ソースセットには .get() 関数で
            // アクセスする必要があります
            dependsOn(commonMain.get())
        }

        // 選択肢 1. 適切なソースセットに直接ソースを追加する:
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 選択肢 2. デフォルトの Kotlin Multiplatform ターゲットが
        // main および test ソースセット向けに提供する規則を使用する:
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 選択肢 3. より汎用的な解決策。ビルドスクリプトで
        // より高度なアプローチが必要な場合に使用します:
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**変更はいつ発効するのか？**

非推奨サイクルは以下のとおりです：

* 1.9.0: `KotlinCompilation.source` が使用された場合に非推奨警告を導入
* 1.9.20: この警告をエラーに引き上げ
* 2.3.0: Kotlin Gradle プラグインから `KotlinCompilation.source` を削除。これを使用しようとするとビルドスクリプトのコンパイル中に「unresolved reference」エラーが発生

<a id="kotlin-js-plugin-deprecation"></a>
### `kotlin-js` Gradle プラグインから `kotlin-multiplatform` Gradle プラグインへの移行 {initial-collapse-state="collapsed" collapsible="true" id="migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin"}

**何が変わったのか？**

Kotlin 1.9.0 以降、`kotlin-js` Gradle プラグインは非推奨となりました。基本的には、`js()` ターゲットを持つ `kotlin-multiplatform` プラグインの機能を重複して提供しており、内部で同じ実装を共有していました。このような重複は混乱を生み、Kotlin チームのメンテナンス負荷を増大させていました。代わりに `js()` ターゲットを持つ `kotlin-multiplatform` Gradle プラグインに移行することをお勧めします。

**現在のベストプラクティスは？**

1. プロジェクトから `kotlin-js` Gradle プラグインを削除し、`pluginManagement {}` ブロックを使用している場合は `settings.gradle.kts` ファイルで `kotlin-multiplatform` を適用します：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 次の行を削除:
           kotlin("js") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 代わりに次の行を追加:
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   プラグインを適用する別の方法を使用している場合は、移行手順について [Gradle ドキュメント](https://docs.gradle.org/current/userguide/plugins.html)を参照してください。

2. ソースファイルを同じディレクトリ内の `main` および `test` フォルダから `jsMain` および `jsTest` フォルダに移動します。
3. 依存関係の宣言を調整します：

   * `sourceSets {}` ブロックを使用し、各ソースセットの依存関係を設定することをお勧めします（本番用の依存関係には `jsMain {}`、テスト用の依存関係には `jsTest {}`）。詳細は[依存関係の追加](multiplatform-add-dependencies.md)を参照してください。
   * ただし、トップレベルのブロックで依存関係を宣言したい場合は、宣言を `api("group:artifact:1.0")` から `add("jsMainApi", "group:artifact:1.0")` などに変更してください。

     > この場合、トップレベルの `dependencies {}` ブロックは必ず `kotlin {}` ブロックの**後**に来るようにしてください。そうしないと、「Configuration not found」というエラーが発生します。
     >
     {style="note"}

   `build.gradle.kts` ファイル内のコードは、次のいずれかの方法で変更できます：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("js") version "1.9.0"
   }
   
   dependencies {
       testImplementation(kotlin("test"))
       implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
   }
   
   kotlin {
       js {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("multiplatform") version "1.9.0"
   }
   
   kotlin {
       js {
           // ...
       }
       
       // 選択肢 1. sourceSets {} ブロックで依存関係を宣言する:
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // ここでは js プレフィックスは不要で、トップレベルのブロックからコピー＆ペーストするだけです
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 選択肢 2. 依存関係の宣言に js プレフィックスを追加する:
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. `kotlin {}` ブロック内で Kotlin Gradle プラグインによって提供される DSL は、ほとんどの場合変更されません。ただし、タスクやコンフィギュレーションなどの低レベルな Gradle エンティティを名前で参照していた場合は、通常は `js` プレフィックスを追加して調整する必要があります。例えば、`browserTest` タスクは `jsBrowserTest` という名前で見つけることができます。

**変更はいつ発効するのか？**

`kotlin-js` Gradle プラグインの非推奨サイクルは以下のとおりです：

* 1.9.0: `kotlin-js` プラグインが使用された場合に非推奨警告を生成
* 2.4.0: [警告をエラーに引き上げ](https://youtrack.jetbrains.com/issue/KT-59305)

<a id="jvmWithJava-preset-deprecation"></a>
### 非推奨となった `jvmWithJava` プリセット {initial-collapse-state="collapsed" collapsible="true" id="deprecated-jvmwithjava-preset"}

**何が変わったのか？**

`targetPresets.jvmWithJava` は非推奨となり、その使用はお勧めしません。

**現在のベストプラクティスは？**

代わりに `jvm { withJava() }` ターゲットを使用してください。`jvm { withJava() }` に切り替えた後は、`.java` ソースを含むソースディレクトリへのパスを調整する必要がある点に注意してください。

例えば、デフォルト名「jvm」の `jvm` ターゲットを使用している場合：

| 以前            | 現在                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.3.40: `targetPresets.jvmWithJava` が使用された場合に警告を導入
* 1.9.20: この警告をエラーに引き上げ
* &gt;1.9.20: `targetPresets.jvmWithJava` API を削除。使用を試みるとビルドスクリプトのコンパイルが失敗

> `targetPresets` API 全体が非推奨となっていますが、`jvmWithJava` プリセットには異なる非推奨スケジュールがあります。
>
{style="note"}

<a id="android-sourceset-layout-v1-deprecation"></a>
### 非推奨となった従来の Android ソースセットレイアウト {initial-collapse-state="collapsed" collapsible="true" id="deprecated-legacy-android-source-set-layout"}

**何が変わったのか？**

Kotlin 1.9.0 以降、デフォルトで[新しい Android ソースセットレイアウト](multiplatform-android-layout.md)が使用されます。従来のレイアウトのサポートは非推奨となり、`kotlin.mpp.androidSourceSetLayoutVersion` Gradle プロパティを使用すると非推奨の診断がトリガーされるようになりました。

**変更はいつ発効するのか？**

非推奨サイクルは以下のとおりです：

* <=1.9.0: `kotlin.mpp.androidSourceSetLayoutVersion=1` が使用された場合に警告を報告。この警告は `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle プロパティで抑制可能
* 1.9.20: この警告をエラーに引き上げ。エラーを抑制することは**できません**
* 2.4.0: 従来の Android ソースセットレイアウトのサポートを削除し、[`kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle プロパティを削除](https://youtrack.jetbrains.com/issue/KT-82265)

<a id="common-sourceset-with-dependson-deprecation"></a>
### カスタム `dependsOn` を持つ `commonMain` および `commonTest` の非推奨化 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-commonmain-and-commontest-with-custom-dependson"}

**何が変わったのか？**

`commonMain` および `commonTest` ソースセットは通常、それぞれ `main` および `test` ソースセット階層のルートを表します。しかし、これらのソースセットの `dependsOn` 関係を手動で設定することによって、それをオーバーライドすることが可能でした。

そのような設定を保守するには、マルチプラットフォームビルドの内部構造に関する追加の労力と知識が必要になります。さらに、`commonMain` が `main` ソースセット階層のルートであるかどうかを確認するために特定のビルドスクリプトを読む必要があるため、コードの可読性と再利用性が低下します。

そのため、`commonMain` および `commonTest` での `dependsOn` へのアクセスは非推奨となりました。

**現在のベストプラクティスは？**

`commonMain.dependsOn(customCommonMain)` を使用している `customCommonMain` ソースセットを 1.9.20 に移行する必要があるとします。ほとんどの場合、`customCommonMain` は `commonMain` と同じコンパイルに参加するため、`customCommonMain` を `commonMain` にマージできます：

1. `customCommonMain` のソースを `commonMain` にコピーします。
2. `customCommonMain` のすべての依存関係を `commonMain` に追加します。
3. `customCommonMain` のすべてのコンパイラオプション設定を `commonMain` に追加します。

まれに、`customCommonMain` が `commonMain` よりも多くのコンパイルに参加している場合があります。そのような設定には、ビルドスクリプトの追加の低レベルな設定が必要です。それがご自身のユースケースに該当するかどうかわからない場合は、該当しない可能性が極めて高いです。

該当する場合は、`customCommonMain` のソースと設定を `commonMain` に移動し、その逆も行うことで、これら2つのソースセットを「入れ替え」てください。

**変更はいつ発効するのか？**

計画されている非推奨サイクルは以下のとおりです：

* 1.9.0: `commonMain` で `dependsOn` が使用された場合に警告を報告
* &gt;=1.9.20: `commonMain` または `commonTest` で `dependsOn` が使用された場合にエラーを報告

### 前方宣言（Forward Declarations）への新しいアプローチ {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-forward-declarations"}

**何が変わったのか？**

JetBrains チームは、Kotlin における前方宣言の動作をより予測しやすくするためにそのアプローチを刷新しました：

* 前方宣言は `cnames` または `objcnames` パッケージを使用してのみインポートできます。
* 対応する C および Objective-C の前方宣言への明示的なキャスト、およびそこからのキャストが必要になります。

**現在のベストプラクティスは？**

* `cstructName` 前方宣言を宣言する `library.package` を持つ C ライブラリを考えます。以前は、`import library.package.cstructName` でライブラリから直接インポートすることが可能でした。今後は、そのための特別な前方宣言パッケージを使用する必要があります：`import cnames.structs.cstructName`。これは `objcnames` についても同様です。

* 2つの objcinterop ライブラリを考えます。1つは `objcnames.protocols.ForwardDeclaredProtocolProtocol` を使用し、もう1つには実際の定義が含まれています：

  ```ObjC
  // 1つ目の objcinterop ライブラリ
  #import <Foundation/Foundation.h>
  
  @protocol ForwardDeclaredProtocol;
  
  NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
      return [NSString stringWithUTF8String:"Protocol"];
  }
  ```

  ```ObjC
  // 2つ目の objcinterop ライブラリ
  // ヘッダー:
  #import <Foundation/Foundation.h>
  @protocol ForwardDeclaredProtocol
  @end
  // 実装:
  @interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
  @end

  id<ForwardDeclaredProtocol> produceProtocol() {
      return [ForwardDeclaredProtocolImpl new];
  }
  ```

  以前は、それらの間でオブジェクトをシームレスに受け渡すことができました。今後は、前方宣言に対して明示的な `as` キャストが必要になります：

  ```kotlin
  // Kotlin コード:
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > `objcnames.protocols.ForwardDeclaredProtocolProtocol` へキャストできるのは、対応する実際のクラスからのみです。それ以外の場合はエラーが発生します。
  >
  {style="note"}

**変更はいつ発効するのか？**

Kotlin 1.9.20 以降、対応する C および Objective-C の前方宣言との間で明示的なキャストを行う必要があります。また、前方宣言は特別なパッケージを使用してのみインポートできるようになりました。

## Kotlin 1.7.0−1.8.22 {id="kotlin-1-7-0-1-8-22"}

このセクションでは、Kotlin 1.7.0−1.8.22 で非推奨サイクルが終了し、有効になった互換性のない変更について説明します。

<a id="deprecated-compatibility-with-kmp-gradle-plugin-and-gradle-java-plugins"></a>
### Kotlin Multiplatform Gradle プラグインと Gradle Java プラグインの互換性の非推奨化 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins"}

**何が変わったのか？**

Kotlin Multiplatform Gradle プラグインと、Gradle プラグインである [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html)、および [Application](https://docs.gradle.org/current/userguide/application_plugin.html) との間の互換性の問題により、これらを同じプロジェクトに適用した場合に非推奨警告が表示されるようになりました。この警告は、マルチプラットフォームプロジェクト内の別の Gradle プラグインが Gradle Java プラグインを適用している場合にも表示されます。例えば、[Spring Boot Gradle プラグイン](https://docs.spring.io/spring-boot/gradle-plugin/index.html)は Application プラグインを自動的に適用します。

この非推奨警告が追加されたのは、Kotlin Multiplatform のプロジェクトモデルと Gradle の Java エコシステムプラグインとの間に根本的な互換性の問題があるためです。Gradle の Java エコシステムプラグインは現在、他のプラグインが以下を行う可能性を考慮していません：

* Java エコシステムプラグインとは異なる方法で JVM ターゲット向けに公開またはコンパイルも行う。
* 同じプロジェクト内に JVM と Android など、2つの異なる JVM ターゲットを持つ。
* 複数の非 JVM ターゲットを含む可能性のある複雑なマルチプラットフォームプロジェクト構造を持つ。

残念ながら、Gradle は現在これらの問題に対処するための API を提供していません。

以前は、Java エコシステムプラグインとの統合を支援するために Kotlin Multiplatform でいくつかの回避策を使用していました。しかし、これらの回避策は互換性の問題を真に解決したわけではなく、Gradle 8.8 のリリース以降、これらの回避策は使用できなくなりました。詳細については、弊社の [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)を参照してください。

この互換性の問題をどのように解決するかはまだ正確には分かっていませんが、Kotlin Multiplatform プロジェクトでの何らかの形での Java ソースコンパイルのサポート継続には取り組んでいます。最低でも、Java ソースのコンパイルと、マルチプラットフォームプロジェクト内での Gradle の [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) プラグインの使用はサポートされます。

**現在のベストプラクティスは？**

マルチプラットフォームプロジェクトでこの非推奨警告が表示された場合は、次の対応をお勧めします：
1. プロジェクトで実際に Gradle Java プラグインが必要かどうかを判断します。不要であれば、削除を検討してください。
2. Gradle Java プラグインが単一のタスクのためにのみ使用されているかどうかを確認します。その場合、大きな労力をかけずにプラグインを削除できる可能性があります。例えば、タスクが Javadoc JAR ファイルを作成するために Gradle Java プラグインを使用している場合、代わりに Javadoc タスクを手動で定義できます。

そうではなく、マルチプラットフォームプロジェクトで Kotlin Multiplatform Gradle プラグインとこれらの Java 用 Gradle プラグインの両方を使用したい場合は、次の対応をお勧めします：

1. Gradle プロジェクト内に別のサブプロジェクトを作成します。
2. その別のサブプロジェクトで、Java 用の Gradle プラグインを適用します。
3. その別のサブプロジェクトで、親のマルチプラットフォームプロジェクトへの依存関係を追加します。

> この別のサブプロジェクトはマルチプラットフォームプロジェクトであっては**ならず**、親のマルチプラットフォームプロジェクトへの依存関係を設定するためだけにのみ使用する必要があります。
>
{style="warning"}

例えば、`my-main-project` というマルチプラットフォームプロジェクトがあり、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle プラグインを使用したいとします。

サブプロジェクト（仮に `subproject-A` とします）を作成すると、親プロジェクトの構造は次のようになります：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

サブプロジェクトの `build.gradle.kts` ファイルで、`plugins {}` ブロック内に Java Library プラグインを適用します：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("java-library")
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id('java-library')
}
```

</TabItem>
</Tabs>

サブプロジェクトの `build.gradle.kts` ファイルで、親のマルチプラットフォームプロジェクトへの依存関係を追加します：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 親のマルチプラットフォームプロジェクトの名前
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 親のマルチプラットフォームプロジェクトの名前
}
```

</TabItem>
</Tabs>

これで、親プロジェクトで両方のプラグインを使用できるように設定されました。

### 自動生成されたターゲットへの新しいアプローチ {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-auto-generated-targets"}

**何が変わったのか？**

Gradle によって自動生成されたターゲットアクセサは、`kotlin.targets {}` ブロック内では使用できなくなりました。代わりに `findByName("targetName")` メソッドを使用してください。

このようなアクセサは、`kotlin.targets {}` の場合（例: `kotlin.targets.linuxX64`）では引き続き使用可能であることに注意してください。

**現在のベストプラクティスは？**

<table>
    
<tr>
<td>以前</td>
        <td>現在</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure(['windows',&#10;            'linux']) {&#10;        }&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure([findByName('windows'),&#10;            findByName('linux')]) {&#10;        }&#10;    }&#10;}"/>
</td>
</tr>

</table>

**変更はいつ発効するのか？**

Kotlin 1.7.20 では、`kotlin.targets {}` ブロックでターゲットアクセサを使用した場合にエラーが導入されます。

詳細については、[YouTrack の該当する課題](https://youtrack.jetbrains.com/issue/KT-47047)を参照してください。

### Gradle の入力および出力コンパイルタスクの変更 {initial-collapse-state="collapsed" collapsible="true" id="changes-in-gradle-input-and-output-compile-tasks"}

**何が変わったのか？**

Kotlin コンパイルタスクは、`sourceCompatibility` および `targetCompatibility` 入力を持つ Gradle の `AbstractCompile` タスクを継承しなくなり、これらは Kotlin ユーザーのスクリプトで使用できなくなりました。

コンパイルタスクにおけるその他の互換性を破る変更（breaking changes）：

**現在のベストプラクティスは？**

| 以前                                                                  | 現在                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 入力は使用できなくなりました。           | 代わりに `sources` 入力を使用してください。なお、`setSource()` メソッドは引き続き利用可能です。                 |
| `sourceFilesExtensions` 入力は削除されました。                      | コンパイルタスクは引き続き `PatternFilterable` インターフェースを実装しています。Kotlin ソースのフィルタリングにはそのメソッドを使用してください。 |
| `Gradle destinationDir: File` 出力は非推奨となりました。            | 代わりに `destinationDirectory: DirectoryProperty` 出力を使用してください。                                     |
| `KotlinCompile` タスクの `classpath` プロパティは非推奨となりました。 | すべてのコンパイルタスクで、コンパイルに必要なライブラリのリストに `libraries` 入力を使用するようになりました。 |

**変更はいつ発効するのか？**

Kotlin 1.7.20 では、入力が利用不可になり、出力が置き換えられ、`classpath` プロパティが非推奨になります。

詳細については、[YouTrack の該当する課題](https://youtrack.jetbrains.com/issue/KT-32805)を参照してください。

### コンパイルに対する依存関係の新しいコンフィギュレーション名 {initial-collapse-state="collapsed" collapsible="true" id="new-configuration-names-for-dependencies-on-the-compilation"}

**何が変わったのか？**

Kotlin Multiplatform Gradle プラグインによって作成されるコンパイルコンフィギュレーションに新しい名前が付けられました。

Kotlin Multiplatform プロジェクトのターゲットには、`main` と `test` という2つのデフォルトコンパイルがあります。これらのコンパイルにはそれぞれ、`jvmMain` や `jvmTest` などの独自のデフォルトソースセットがあります。以前は、テストコンパイルとそのデフォルトソースセットのコンフィギュレーション名が同一であったため名前の衝突が発生し、プラットフォーム固有の属性でマークされたコンフィギュレーションが別のコンフィギュレーションに含まれる際に問題が発生する可能性がありました。

現在、コンパイルコンフィギュレーションには追加の `Compilation` ポストフィックスが付くようになり、古いハードコードされたコンフィギュレーション名を使用しているプロジェクトやプラグインはコンパイルできなくなりました。

対応するソースセットに対する依存関係のコンフィギュレーション名は変更されません。

**現在のベストプラクティスは？**

<table>
    
<tr>
<td></td>
        <td>以前</td>
        <td>現在</td>
</tr>

    
<tr>
<td rowspan="2"><code>jvmMain</code> コンパイルの依存関係</td>
<td>
<code-block lang="kotlin" code="jvm&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmCompilationImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
</tr>

    
<tr>
<td><code>jvmMain</code> ソースセットの依存関係</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmMain&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> コンパイルの依存関係</td>
<td>
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmTestCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> ソースセットの依存関係</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
</tr>

</table>

利用可能なスコープは `Api`、`Implementation`、`CompileOnly`、および `RuntimeOnly` です。

**変更はいつ発効するのか？**

Kotlin 1.8.0 では、ハードコードされた文字列で古いコンフィギュレーション名を使用した場合にエラーが導入されます。

詳細については、[YouTrack の該当する課題](https://youtrack.jetbrains.com/issue/KT-35916/)を参照してください。