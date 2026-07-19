[//]: # (title: Kotlin Multiplatform 互換性ガイド)

<show-structure depth="1"/>

このガイドでは、Kotlin Multiplatform での開発中に遭遇する可能性のある[互換性のない変更](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)をまとめています。

> Compose Multiplatform に関する情報については、[Compose Multiplatform の新機能](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)および [Kotlin と Jetpack の互換性](compose-compatibility-and-versioning.md)のページを参照してください。
> 
{style="note"}

現在の Kotlin の安定版（Stable）は %kotlinVersion% です。プロジェクトで使用している Kotlin バージョンに関連して、特定の変更の非推奨サイクル（deprecation cycle）に注意してください。例：

* Kotlin 1.7.0 から Kotlin 1.9.0 にアップグレードする場合、[Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) と [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) の両方で有効になった互換性のない変更を確認してください。
* Kotlin 1.9.0 から Kotlin 2.0.0 にアップグレードする場合、[Kotlin 2.0.0](#kotlin-2-0-0-and-later) と [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) の両方で有効になった互換性のない変更を確認してください。 

## バージョンの互換性

プロジェクトを構成する際は、Kotlin Multiplatform Gradle プラグインの特定のバージョン（プロジェクトの Kotlin バージョンと同じ）と、Gradle、Xcode、Android Gradle プラグインのバージョンとの互換性を確認してください：

| Kotlin Multiplatform プラグインのバージョン | Gradle                                | Android Gradle プラグイン                               | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.0-2.4.10                        | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3-8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5-8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5-8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 および Kotlin 2.1.0–2.1.10 は、Gradle 8.6 まで完全に互換性があります。Gradle バージョン 8.7–8.10 もサポートされていますが、1 つだけ例外があります。Kotlin Multiplatform Gradle プラグインを使用している場合、JVM ターゲットで `withJava()` 関数を呼び出しているマルチプラットフォームプロジェクトで非推奨の警告が表示されることがあります。詳細については、[デフォルトで作成される Java ソースセット](#java-source-sets-created-by-default)を参照してください。
>
{style="warning"}

## Kotlin 2.0.0 以降

このセクションでは、非推奨サイクルが終了し、Kotlin 2.0.0−%kotlinVersion% で有効になる互換性のない変更について説明します。

### Android ターゲット用 Google 製プラグインへの移行

**何が変更されましたか？**

Kotlin 2.3.0 より前は、`com.android.application` および `com.android.library` プラグインを通じて Android ターゲットのサポートを提供していました。これは、Google の Android チームが Kotlin Multiplatform 用に調整された個別のプラグインを開発している間の暫定的な解決策でした。

当初は `android` ブロックを使用していましたが、後に新しいプラグインで `android` という名前を予約できるように、`androidTarget` ブロックに移行しました。

現在、Android チームから [`com.android.kotlin.multiplatform.library` プラグイン](https://developer.android.com/kotlin/multiplatform/plugin)が提供されており、元の `android` ブロックを使用できるようになりました。

Kotlin 2.3.0 では、Kotlin Multiplatform プロジェクトで `androidTarget` という名前が使用されている場合に非推奨の警告が表示されます。`android` ブロックへの移行にさらに時間が必要な場合は、警告が表示されない AGP 8.x を備えた Kotlin 2.3.10 を使用してください。

**現在のベストプラクティスは何ですか？**

新しい `com.android.kotlin.multiplatform.library` プラグインに移行してください。`androidTarget` ブロックのすべての出現箇所を `android` に名前変更してください。移行方法の詳細については、Google の[移行ガイド](https://developer.android.com/kotlin/multiplatform/plugin#migrate)を参照してください。

**変更はいつから有効になりますか？**

Kotlin Multiplatform Gradle プラグインの非推奨サイクルは以下の通りです：

* 1.9.0: Kotlin Multiplatform プロジェクトで `android` という名前が使用された場合に非推奨の警告を導入
* 2.1.0: この警告をエラーに引き上げ
* 2.2.0: Kotlin Multiplatform Gradle プラグインから `android` ターゲット DSL を削除
* 2.3.0: 新しい Android プラグインが利用可能。Kotlin Multiplatform プロジェクトで `androidTarget` という名前が使用された場合に非推奨の警告を導入。
* 2.3.10: `androidTarget` 名が使用された場合の非推奨の警告を元に戻す。

### ビットコード埋め込みの非推奨

**何が変更されましたか？**

ビットコード（Bitcode）の埋め込みは Xcode 14 で非推奨となり、Xcode 15 ではすべての Apple ターゲットで削除されました。これに伴い、フレームワーク設定の `embedBitcode` パラメータ、および `-Xembed-bitcode` と `-Xembed-bitcode-marker` コマンドライン引数は Kotlin で非推奨となりました。

**現在のベストプラクティスは何ですか？**

以前のバージョンの Xcode を引き続き使用しており、かつ Kotlin 2.0.20 以降にアップグレードしたい場合は、Xcode プロジェクトでビットコード埋め込みを無効にしてください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 2.0.20: Kotlin/Native コンパイラがビットコード埋め込みをサポートしなくなりました
* 2.1.0: Kotlin Multiplatform Gradle プラグインで `embedBitcode` DSL が非推奨となり、警告が表示されます
* 2.2.0: 警告がエラーに引き上げられます
* 2.3.0: `embedBitcode` DSL が削除されます 

### デフォルトで作成される Java ソースセット

**何が変更されましたか？**

Gradle の今後の変更に Kotlin Multiplatform を対応させるため、`withJava()` 関数を段階的に廃止しています。`withJava()` 関数は、必要な Java ソースセットを作成することで Gradle の Java プラグインとの統合を可能にしていました。Kotlin 2.1.20 からは、これらの Java ソースセットがデフォルトで作成されるようになります。

**現在のベストプラクティスは何ですか？**

以前は、`src/jvmMain/java` および `src/jvmTest/java` ソースセットを作成するために `withJava()` 関数を明示的に使用する必要がありました：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

Kotlin 2.1.20 からは、ビルドスクリプトから `withJava()` 関数を削除できます。

さらに、Gradle は Java ソースが存在する場合にのみ Java コンパイルタスクを実行するようになり、以前は実行されなかった JVM バリデーション診断がトリガーされます。`KotlinJvmCompile` タスクまたは `compilerOptions` 内で互換性のない JVM ターゲットを明示的に設定している場合、この診断は失敗します。JVM ターゲットの互換性を確保するためのガイダンスについては、[関連するコンパイルタスクの JVM ターゲット互換性のチェック](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)を参照してください。

プロジェクトで 8.7 より新しい Gradle バージョンを使用しており、[Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html)、[Application](https://docs.gradle.org/current/userguide/application_plugin.html) などの Gradle Java プラグイン、または Gradle Java プラグインに依存するサードパーティ製 Gradle プラグインに依存していない場合は、`withJava()` 関数を削除できます。

プロジェクトで [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java プラグインを使用している場合は、[新しい実験的 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin) への移行をお勧めします。Gradle 8.7 以降、Application プラグインは Kotlin Multiplatform Gradle プラグインでは動作しなくなります。

Kotlin Multiplatform Gradle プラグインと他の Java 用 Gradle プラグインの両方をマルチプラットフォームプロジェクトで使用したい場合は、[Kotlin Multiplatform Gradle プラグインと Gradle Java プラグインの非推奨の互換性](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)を参照してください。

Kotlin 2.1.20 と 8.7 より新しい Gradle バージョンで [Java test fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle プラグインを使用している場合、そのプラグインは動作しません。代わりに、この問題が解決されている [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details) にアップグレードしてください。

問題が発生した場合は、[課題トラッカー](https://kotl.in/issue)で報告するか、[公開 Slack チャンネル](https://kotlinlang.slack.com/archives/C19FD9681)で助けを求めてください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* Gradle >8.6: `withJava()` 関数を使用しているマルチプラットフォームプロジェクトにおいて、以前のすべての Kotlin バージョンに対して非推奨の警告を導入。
* Gradle 9.0: この警告をエラーに引き上げ。
* 2.1.20: Gradle のバージョンに関わらず、`withJava()` 関数を使用した場合に非推奨の警告を導入。

### 複数の類似ターゲットの宣言

**何が変更されましたか？**

1 つの Gradle プロジェクト内で複数の類似ターゲットを宣言することはお勧めしません。例：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 推奨されず、非推奨の警告が表示されます
}
```

よくあるケースは、2 つの関連するコードをまとめている場合です。例えば、`:shared` Gradle プロジェクトで Ktor または OkHttp ライブラリを使用してネットワーク機能を実装するために、`jvm("jvmKtor")` と `jvm("jvmOkHttp")` を使用したい場合があります：

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

この実装には、少なからず構成の複雑さが伴います：

* `:shared` 側と各コンシューマー（利用者）側で Gradle 属性（attributes）を設定する必要があります。そうしないと、追加情報なしではコンシューマーが Ktor ベースの実装と OkHttp ベースの実装のどちらを受け取るべきか不明確になり、Gradle はそのようなプロジェクトの依存関係を解決できません。
* `commonJvmMain` ソートセットを手動で設定する必要があります。
* 構成には、Gradle および Kotlin Gradle プラグインのいくつかの低レベルな抽象化や API が関わります。

**現在のベストプラクティスは何ですか？**

Ktor ベースと OkHttp ベースの実装が*同じ Gradle プロジェクト内にある*ため、構成が複雑になっています。多くの場合、これらの部分を別々の Gradle プロジェクトに抽出することが可能です。リファクタリングの概要は以下の通りです：

1. 元のプロジェクトの 2 つの重複するターゲットを単一のターゲットに置き換えます。これらのターゲット間で共有ソースセットがあった場合は、そのソースと設定を新しく作成したターゲットのデフォルトソースセットに移動します：

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // jvmCommonMain の設定をここにコピー
            }
        }
    }
    ```

2. 通常、`settings.gradle.kts` ファイルで `include` を呼び出して、2 つの新しい Gradle プロジェクトを追加します。例：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 各新しい Gradle プロジェクトを構成します：

    * これらのプロジェクトは 1 つのターゲットに対してのみコンパイルされるため、多くの場合 `kotlin("multiplatform")` プラグインを適用する必要はありません。この例では、`kotlin("jvm")` を適用できます。
    * 元のターゲット固有のソースセットの内容をそれぞれのプロジェクトに移動します。例えば、`jvmKtorMain` から `ktor-impl/src` へ移動します。
    * ソースセットの設定（依存関係、コンパイラオプションなど）をコピーします。
    * 新しい Gradle プロジェクトから元のプロジェクトへの依存関係を追加します。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 元のプロジェクトへの依存関係を追加
        // jvmKtorMain の依存関係をここにコピー
    }
    
    kotlin {
        compilerOptions {
            // jvmKtorMain のコンパイラオプションをここにコピー
        }
    }
    ```

このアプローチは初期設定に手間がかかりますが、Gradle や Kotlin Gradle プラグインの低レベルなエンティティを使用しないため、結果としてビルドの利用と保守が容易になります。

> 残念ながら、すべてのケースに対して詳細な移行手順を提供することはできません。上記の指示がうまくいかない場合は、この [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-59316) でユースケースを説明してください。
>
{style="tip"}

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.9.20: Kotlin Multiplatform プロジェクトで複数の類似ターゲットが使用された場合に非推奨の警告を導入
* 2.1.0: このような場合にエラーを報告します（Kotlin/JS ターゲットは例外）。この例外の詳細については、[YouTrack の課題](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)を参照してください。

### レガシーモードで公開されたマルチプラットフォームライブラリのサポート非推奨

**何が変更されましたか？**

以前、Kotlin Multiplatform プロジェクトにおける[レガシーモードを非推奨](#deprecated-gradle-properties-for-hierarchical-structure-support)とし、"レガシー" バイナリの公開を停止して、プロジェクトを[階層構造](multiplatform-hierarchy.md)に移行することを推奨しました。

エコシステムから "レガシー" バイナリを段階的に排除し続けるため、Kotlin 1.9.0 以降、レガシーライブラリの使用も推奨されなくなりました。プロジェクトがレガシーライブラリへの依存関係を使用している場合、次の警告が表示されます：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**現在のベストプラクティスは何ですか？**

*マルチプラットフォームライブラリを使用している場合*、その多くはすでに "階層構造" モードに移行しているため、ライブラリのバージョンを更新するだけで済みます。詳細は各ライブラリのドキュメントを参照してください。

ライブラリがまだ非レガシーバイナリをサポートしていない場合は、メンテナに連絡して、この互換性の問題について伝えてください。

*ライブラリの作者である場合*、Kotlin Gradle プラグインを最新バージョンに更新し、[階層構造サポートのための非推奨の Gradle プロパティ](#deprecated-gradle-properties-for-hierarchical-structure-support)を修正したことを確認してください。

Kotlin チームはエコシステムの移行を支援したいと考えています。問題が発生した場合は、遠慮なく [YouTrack で課題](https://kotl.in/issue)を作成してください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.9.0: レガシーライブラリへの依存関係に対して非推奨の警告を導入
* 2.0.0: レガシーライブラリへの依存関係に対する警告をエラーに引き上げ
* &gt;2.0.0: レガシーライブラリへの依存関係のサポートを削除。そのような依存関係を使用するとビルドが失敗する可能性があります

### 階層構造サポートのための非推奨の Gradle プロパティ

**何が変更されましたか？**

進化の過程で、Kotlin はマルチプラットフォームプロジェクトにおける[階層構造](multiplatform-hierarchy.md)（共通ソースセット `commonMain` と任意のプラットフォーム固有ソースセット（例：`jvmMain`）の間に中間ソースセットを持たせる機能）のサポートを段階的に導入してきました。

ツールチェーンが十分に安定していなかった移行期間のために、きめ細かなオプトインおよびオプトアウトを可能にするいくつかの Gradle プロパティが導入されました。

Kotlin 1.6.20 以降、階層的なプロジェクト構造のサポートはデフォルトで有効になっています。しかし、ブロッキングの問題が発生した場合にオプトアウトできるように、これらのプロパティは維持されていました。すべてのフィードバックを処理した結果、現在、これらのプロパティを完全に段階廃止するプロセスを開始しています。

以下のプロパティは現在非推奨です：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**現在のベストプラクティスは何ですか？**

* `gradle.properties` および `local.properties` ファイルからこれらのプロパティを削除してください。
* Gradle ビルドスクリプトや Gradle プラグインでプログラム的にこれらを指定しないでください。
* ビルドで使用しているサードパーティ製 Gradle プラグインによって非推奨のプロパティが設定されている場合は、プラグインのメンテナにこれらのプロパティを設定しないよう依頼してください。

Kotlin 1.6.20 以降、Kotlin ツールチェーンのデフォルトの動作にはこれらのプロパティが含まれていないため、重大な影響はないと考えています。ほとんどの結果は、プロジェクトを再ビルドした直後に確認できます。

ライブラリの作者であり、より慎重を期す場合は、コンシューマーがライブラリを使用できるかどうかを確認してください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.8.20: 非推奨の Gradle プロパティが使用された場合に警告を報告
* 1.9.20: この警告をエラーに引き上げ
* 2.0.0: 非推奨のプロパティを削除。Kotlin Gradle プラグインはそれらの使用を無視します

これらのプロパティを削除した後に万が一問題が発生した場合は、[YouTrack で課題](https://kotl.in/issue)を作成してください。

### ターゲットプリセット API の非推奨

**何が変更されましたか？**

開発の非常に初期の段階で、Kotlin Multiplatform は、いわゆる*ターゲットプリセット（target presets）*を操作するための API を導入しました。各ターゲットプリセットは、本質的に Kotlin Multiplatform ターゲットのファクトリを表していました。`jvm()` や `iosSimulatorArm64()` のような DSL 関数が同じユースケースをカバーしつつ、はるかに直感的で簡潔であるため、この API は大部分が冗長であることが判明しました。

混乱を避け、より明確なガイドラインを提供するために、プリセットに関連するすべての API は現在、Kotlin Gradle プラグインのパブリック API において非推奨となっています。これには以下が含まれます：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` の `presets` プロパティ
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` インターフェースとそのすべての継承クラス
* `fromPreset` オーバーロード

**現在のベストプラクティスは何ですか？**

代わりにそれぞれの [Kotlin ターゲット](multiplatform-dsl-reference.md#targets)を使用してください。例：

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

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.9.20: プリセット関連 API の使用に対して警告を報告
* 2.0.0: この警告をエラーに引き上げ
* 2.2.0: Kotlin Gradle プラグインのパブリック API からプリセット関連 API を削除。これらを引き続き使用しているソースはビルドスクリプトのコンパイル中に "unresolved reference"（未解決の参照）エラーで失敗し、バイナリ（例：Gradle プラグイン）は、最新バージョンの Kotlin Gradle プラグインに対して再コンパイルされない限り、リンケージエラーで失敗する可能性があります。

### Apple ターゲットのショートカットの非推奨

**何が変更されましたか？**

Kotlin Multiplatform DSL における `ios()`、`watchos()`、`tvos()` ターゲットショートカットを非推奨にします。これらは Apple ターゲット用のソースセット階層を部分的に作成するために設計されました。しかし、拡張が難しく、混乱を招く場合があることが判明しました。

例えば、`ios()` ショートカットは `iosArm64` と `iosX64` ターゲットの両方を作成しましたが、Apple シリコン（M チップ）搭載ホストで作業する際に必要な `iosSimulatorArm64` ターゲットは含まれていませんでした。しかし、このショートカットを変更することは実装が難しく、既存のユーザープロジェクトで問題を引き起こす可能性がありました。

**現在のベストプラクティスは何ですか？**

Kotlin Gradle プラグインは現在、組み込みの階層テンプレートを提供しています。Kotlin 1.9.20 以降、これはデフォルトで有効になっており、一般的なユースケース向けに定義済みの階層的なソースセットが含まれています。

ショートカットの代わりにターゲットのリストを指定してください。プラグインはこのリストに基づいて中間ソースセットを自動的に設定します。

例えば、プロジェクトに `iosArm64` と `iosSimulatorArm64` ターゲットがある場合、プラグインは `iosMain` と `iosTest` 中間ソースセットを自動的に作成します。`iosArm64` と `macosArm64` ターゲットがある場合は、`appleMain` と `appleTest` ソースセットが作成されます。

詳細については、[階層的なプロジェクト構造](multiplatform-hierarchy.md)を参照してください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.9.20: `ios()`、`watchos()`、`tvos()` ターゲットショートカットが使用された場合に警告を報告。代わりにデフォルトの階層テンプレートがデフォルトで有効になります
* 2.1.0: ターゲットショートカットが使用された場合にエラーを報告
* 2.2.0: Kotlin Multiplatform Gradle プラグインからターゲットショートカット DSL を削除

### Kotlin アップグレード後の iOS フレームワークのバージョンが正しくない問題

**何が問題ですか？**

直接統合（direct integration）を使用している場合、Kotlin コードの変更が Xcode の iOS アプリに反映されないことがあります。直接統合は、マルチプラットフォームプロジェクトの iOS フレームワークを Xcode の iOS アプリに接続する `embedAndSignAppleFrameworkForXcode` タスクによって設定されます。

これは、マルチプラットフォームプロジェクトで Kotlin バージョンを 1.9.2x から 2.0.0 にアップグレード（または 2.0.0 から 1.9.2x にダウングレード）し、Kotlin ファイルを変更してアプリをビルドしようとしたときに発生する可能性があります。Xcode が誤って以前のバージョンの iOS フレームワークを使用する場合があり、その結果、変更が Xcode の iOS アプリに反映されません。

**回避策は何ですか？**

1. Xcode で、**Product** | **Clean Build Folder** を使用してビルドディレクトリをクリーンアップします。
2. ターミナルで次のコマンドを実行します：

   ```none
   ./gradlew clean
   ```

3. アプリを再ビルドして、新しいバージョンの iOS フレームワークが使用されていることを確認します。

**この問題はいつ修正されますか？**

この問題は Kotlin 2.0.10 で修正される予定です。Kotlin 2.0.10 のプレビュー版がすでに利用可能かどうかは、[Kotlin 早期アクセスプレビューへの参加](https://kotlinlang.org/docs/eap.html)セクションで確認できます。

詳細については、[YouTrack の対応する課題](https://youtrack.jetbrains.com/issue/KT-68257)を参照してください。

## Kotlin 1.9.0−1.9.25

このセクションでは、非推奨サイクルが終了し、Kotlin 1.9.0−1.9.25 で有効になる互換性のない変更について説明します。

### Kotlin コンパイルに Kotlin ソースセットを直接追加するための API の削除 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

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

**現在のベストプラクティスは何ですか？**

`KotlinCompilation.source(someSourceSet)` を置き換えるには、`.srcDir()` 関数を使用して、適切なソースセットに直接ソースを追加します。あるいは、`KotlinCompilation` のデフォルトソースセットから `someSourceSet` への `dependsOn` 関係を追加して、新しいソースセットを作成することもできます。また、IDE フレンドリーで最も堅牢なアプローチと考えられている [ソースセットコンベンション（source set conventions）](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/) を直接参照することもできます。最後に、すべての場合に動作する `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)` を使用することもできます。

上記のコードは、以下のいずれかの方法で変更できます：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // commonMain ソースセットには
            // .get() 関数でアクセスする必要があります
            dependsOn(commonMain.get())
        }

        // オプション 1. 適切なソースセットにソースを
        // 直接追加する：
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // オプション 2. main および test ソースセット用のデフォルトの
        // Kotlin Multiplatform ターゲットで提供されるコンベンションを使用する：
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // オプション 3. より汎用的な解決策。ビルドスクリプトがより高度なアプローチを
        // 必要とする場合に使用してください：
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**変更はいつから有効になりますか？**

非推奨サイクルは以下の通りです：

* 1.9.0: `KotlinCompilation.source` が使用された場合に非推奨の警告を導入
* 1.9.20: この警告をエラーに引き上げ
* 2.3.0: Kotlin Gradle プラグインから `KotlinCompilation.source` を削除。これを使用しようとすると、ビルドスクリプトのコンパイル中に "unresolved reference" エラーが発生します

### `kotlin-js` Gradle プラグインから `kotlin-multiplatform` Gradle プラグインへの移行 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Kotlin 1.9.0 以降、`kotlin-js` Gradle プラグインは非推奨になりました。基本的に、これは `js()` ターゲットを備えた `kotlin-multiplatform` プラグインの機能を複製しており、内部で同じ実装を共有していました。このような重複は混乱を招き、Kotlin チームのメンテナンス負荷を増大させていました。代わりに `js()` ターゲットを使用する `kotlin-multiplatform` Gradle プラグインに移行することをお勧めします。

**現在のベストプラクティスは何ですか？**

1. プロジェクトから `kotlin-js` Gradle プラグインを削除し、`pluginManagement {}` ブロックを使用している場合は `settings.gradle.kts` ファイルに `kotlin-multiplatform` を適用します：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 次の行を削除：
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
           // 代わりに次の行を追加：
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   プラグインを適用する別の方法を使用している場合は、移行手順について [Gradle ドキュメント](https://docs.gradle.org/current/userguide/plugins.html) を参照してください。

2. ソースファイルを同じディレクトリ内の `main` および `test` フォルダから `jsMain` および `jsTest` フォルダに移動します。
3. 依存関係の宣言を調整します：

   * `sourceSets {}` ブロックを使用し、それぞれのソースセットの依存関係を設定することをお勧めします。製品の依存関係には `jsMain {}`、テストの依存関係には `jsTest {}` を使用します。詳細は [依存関係の追加](multiplatform-add-dependencies.md) を参照してください。
   * ただし、トップレベルのブロックで依存関係を宣言したい場合は、宣言を `api("group:artifact:1.0")` から `add("jsMainApi", "group:artifact:1.0")` などに変更してください。

     > この場合、トップレベルの `dependencies {}` ブロックが `kotlin {}` ブロックの**後**に来るようにしてください。そうしないと、"Configuration not found"（構成が見つかりません）というエラーが発生します。
     >
     {style="note"}

   `build.gradle.kts` ファイル内のコードを以下のいずれかの方法で変更できます：

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
       
       // オプション 1. sourceSets {} ブロックで依存関係を宣言する：
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // ここでは js プレフィックスは不要です。トップレベルブロックからコピー＆ペーストできます
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // オプション 2. 依存関係の宣言に js プレフィックスを追加する：
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. Kotlin Gradle プラグインによって提供される `kotlin {}` ブロック内の DSL は、ほとんどの場合変更されません。ただし、タスクや構成などの低レベルな Gradle エンティティを名前で参照していた場合は、通常は `js` プレフィックスを追加して調整する必要があります。例えば、`browserTest` タスクは `jsBrowserTest` という名前で見つけることができます。

**変更はいつから有効になりますか？**

`kotlin-js` Gradle プラグインの非推奨サイクルは以下の通りです：

* 1.9.0: `kotlin-js` プラグインを使用すると非推奨の警告を表示
* 2.4.0: [この警告をエラーに引き上げ](https://youtrack.jetbrains.com/issue/KT-59305)

### `jvmWithJava` プリセットの非推奨 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

`targetPresets.jvmWithJava` は非推奨となり、その使用は推奨されません。

**現在のベストプラクティスは何ですか？**

代わりに `jvm { withJava() }` ターゲットを使用してください。`jvm { withJava() }` に切り替えた後は、`.java` ソースを含むソースディレクトリへのパスを調整する必要があることに注意してください。

例えば、デフォルト名 "jvm" の `jvm` ターゲットを使用する場合：

| 以前          | 現在                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.3.40: `targetPresets.jvmWithJava` が使用された場合に警告を導入
* 1.9.20: この警告をエラーに引き上げ
* &gt;1.9.20: `targetPresets.jvmWithJava` API を削除。これを使用しようとするとビルドスクリプトのコンパイルが失敗します

> `targetPresets` API 全体が非推奨になっていますが、`jvmWithJava` プリセットには異なる non-deprecated タイムラインがあります。
>
{style="note"}

### レガシーな Android ソースセットレイアウトの非推奨 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Kotlin 1.9.0 以降、[新しい Android ソースセットレイアウト](multiplatform-android-layout.md)がデフォルトで使用されます。レガシーレイアウトのサポートは非推奨となり、`kotlin.mpp.androidSourceSetLayoutVersion` Gradle プロパティを使用すると非推奨の診断メッセージが表示されます。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* <=1.9.0: `kotlin.mpp.androidSourceSetLayoutVersion=1` が使用された場合に警告を報告。警告は `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle プロパティで抑制できます
* 1.9.20: この警告をエラーに引き上げ。このエラーは抑制**できません**
* 2.4.0: レガシーな Android ソースセットレイアウトのサポートを削除し、[`kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle プロパティを削除](https://youtrack.jetbrains.com/issue/KT-82265)

### カスタム `dependsOn` を使用した `commonMain` および `commonTest` の非推奨 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

`commonMain` および `commonTest` ソースセットは、通常、それぞれ `main` および `test` ソースセット階層のルートを表します。しかし、これらソースセットの `dependsOn` 関係を手動で構成することで、それを上書きすることが可能でした。

このような構成を維持するには、マルチプラットフォームビルドの内部に関する追加の労力と知識が必要です。さらに、特定のビルドスクリプトを読まなければ `commonMain` が `main` ソースセット階層のルートであるかどうか確信が持てなくなるため、コードの可読性と再利用性が低下します。

そのため、`commonMain` および `commonTest` に対する `dependsOn` へのアクセスは非推奨となりました。

**現在のベストプラクティスは何ですか？**

1.9.20 に `commonMain.dependsOn(customCommonMain)` を使用している `customCommonMain` ソースセットを移行する必要があるとします。ほとんどの場合、`customCommonMain` は `commonMain` と同じコンパイルに参加するため、`customCommonMain` を `commonMain` にマージできます：

1. `customCommonMain` のソースを `commonMain` にコピーします。
2. `customCommonMain` のすべての依存関係を `commonMain` に追加します。
3. `customCommonMain` のすべてのコンパイラオプション設定を `commonMain` に追加します。

まれなケースとして、`customCommonMain` が `commonMain` よりも多くのコンパイルに参加している場合があります。そのような構成には、ビルドスクリプトの追加の低レベルな構成が必要です。それが自分のユースケースかどうかわからない場合は、おそらくそうではありません。

もしそうであれば、`customCommonMain` のソースと設定を `commonMain` に移動し、その逆も行うことで、これら 2 つのソースセットを「入れ替え」てください。

**変更はいつから有効になりますか？**

計画されている非推奨サイクルは以下の通りです：

* 1.9.0: `commonMain` で `dependsOn` が使用された場合に警告を報告
* &gt;=1.9.20: `commonMain` または `commonTest` で `dependsOn` が使用された場合にエラーを報告

### 前方宣言への新しいアプローチ {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

JetBrains チームは、Kotlin における前方宣言（forward declarations）の動作をより予測可能にするために、そのアプローチを刷新しました：

* `cnames` または `objcnames` パッケージを使用することによってのみ、前方宣言をインポートできます。
* 対応する C および Objective-C の前方宣言との間で、明示的なキャストを行う必要があります。

**現在のベストプラクティスは何ですか？**

* `cstructName` 前方宣言を宣言する `library.package` を持つ C ライブラリを考えます。以前は、ライブラリから `import library.package.cstructName` で直接インポートすることが可能でした。現在は、そのための特別な前方宣言パッケージ、`import cnames.structs.cstructName` のみを使用できます。`objcnames` についても同様です。

* 2 つの objcinterop ライブラリがあり、一方が `objcnames.protocols.ForwardDeclaredProtocolProtocol` を使用し、もう一方が実際の定義を持っている場合を考えます：

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

  以前は、それらの間でオブジェクトをシームレスに転送することが可能でした。現在は、前方宣言に対して明示的な `as` キャストが必要です：

  ```kotlin
  // Kotlin コード:
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 対応する実際のクラスから `objcnames.protocols.ForwardDeclaredProtocolProtocol` にのみキャストできます。そうでない場合はエラーになります。
  >
  {style="note"}

**変更はいつから有効になりますか？**

Kotlin 1.9.20 以降、対応する C および Objective-C の前方宣言との間で明示的にキャストを行う必要があります。また、特別なパッケージを使用することによってのみ前方宣言をインポートできるようになりました。

## Kotlin 1.7.0−1.8.22

このセクションでは、非推奨サイクルが終了し、Kotlin 1.7.0−1.8.22 で有効になる互換性のない変更について説明します。

### Kotlin Multiplatform Gradle プラグインと Gradle Java プラグインの非推奨の互換性 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Kotlin Multiplatform Gradle プラグインと、Gradle プラグインである [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html)、および [Application](https://docs.gradle.org/current/userguide/application_plugin.html) の間の互換性の問題により、これらのプラグインを同じプロジェクトに適用すると非推奨の警告が表示されるようになりました。この警告は、マルチプラットフォームプロジェクト内の別の Gradle プラグインが Gradle Java プラグインを適用する場合にも表示されます。例えば、[Spring Boot Gradle プラグイン](https://docs.spring.io/spring-boot/gradle-plugin/index.html) は Application プラグインを自動的に適用します。

この非推奨の警告は、Kotlin Multiplatform のプロジェクトモデルと Gradle の Java エコシステムプラグインの間の根本的な互換性の問題のために追加されました。Gradle の Java エコシステムプラグインは現在、他のプラグインが以下を行う可能性があることを考慮していません：

* Java エコシステムプラグインとは異なる方法で、JVM ターゲット向けに公開またはコンパイルする。
* 同じプロジェクト内に JVM と Android など、2 つの異なる JVM ターゲットを持つ。
* 複数の非 JVM ターゲットを持つ可能性のある、複雑なマルチプラットフォームプロジェクト構造を持つ。

残念ながら、Gradle は現在、これらの問題に対処するための API を提供していません。

以前は統合を助けるために Kotlin Multiplatform でいくつかの回避策を使用していました。しかし、これらの回避策は互換性の問題を真に解決するものではなく、Gradle 8.8 のリリース以降、これらの回避策は使用できなくなりました。詳細は、[YouTrack の課題](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning) を参照してください。

この互換性の問題をどのように解決するかはまだ正確には分かっていませんが、マルチプラットフォームプロジェクトにおける何らかの形式の Java ソースコンパイルのサポートは継続することを約束します。最低でも、Java ソースのコンパイルと、マルチプラットフォームプロジェクト内での Gradle の [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) プラグインの使用はサポートします。

**現在のベストプラクティスは何ですか？**

マルチプラットフォームプロジェクトでこの非推奨の警告が表示された場合は、以下を推奨します：
1. プロジェクトに Gradle Java プラグインが本当に必要かどうかを確認してください。不要な場合は、削除を検討してください。
2. Gradle Java プラグインが単一のタスクにのみ使用されているかどうかを確認してください。その場合、あまり手間をかけずにプラグインを削除できる可能性があります。例えば、タスクが Javadoc JAR ファイルを作成するために Gradle Java プラグインを使用している場合は、代わりに Javadoc タスクを手動で定義できます。

あるいは、Kotlin Multiplatform Gradle プラグインとこれら Java 用の Gradle プラグインの両方をマルチプラットフォームプロジェクトで使用したい場合は、以下を推奨します：

1. Gradle プロジェクトに個別のサブプロジェクトを作成します。
2. その個別のサブプロジェクトで、Java 用の Gradle プラグインを適用します。
3. その個別のサブプロジェクトで、親のマルチプラットフォームプロジェクトへの依存関係を追加します。

> 個別のサブプロジェクトはマルチプラットフォームプロジェクトであっては**なりません**。また、マルチプラットフォームプロジェクトへの依存関係を設定するためだけにそれを使用する必要があります。
>
{style="warning"}

例えば、`my-main-project` というマルチプラットフォームプロジェクトがあり、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle プラグインを使用したいとします。

サブプロジェクトを作成すると（ここでは `subproject-A` とします）、親プロジェクトの構造は以下のようになります：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

サブプロジェクトの `build.gradle.kts` ファイルで、`plugins {}` ブロックに Java Library プラグインを適用します：

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

これで、親プロジェクトで両方のプラグインを使用する準備が整いました。

### 自動生成されたターゲットへの新しいアプローチ {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Gradle によって自動生成されるターゲットアクセサ（accessors）は、`kotlin.targets {}` ブロック内では使用できなくなりました。代わりに `findByName("targetName")` メソッドを使用してください。

なお、`kotlin.targets.linuxX64` のように、`kotlin.targets` 自体に対するアクセサは引き続き利用可能であることに注意してください。

**現在のベストプラクティスは何ですか？**

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

**変更はいつから有効になりますか？**

Kotlin 1.7.20 では、`kotlin.targets {}` ブロックでターゲットアクセサを使用するとエラーが発生するようになりました。

詳細については、[YouTrack の対応する課題](https://youtrack.jetbrains.com/issue/KT-47047) を参照してください。

### Gradle のコンパイルタスクの入力と出力における変更 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Kotlin コンパイルタスクは、`sourceCompatibility` および `targetCompatibility` 入力を持つ Gradle の `AbstractCompile` タスクを継承しなくなったため、Kotlin ユーザーのスクリプトではこれらを使用できなくなりました。

コンパイルタスクにおけるその他の破壊的変更：

**現在のベストプラクティスは何ですか？**

| 以前                                                              | 現在                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 入力は利用できなくなりました。        | 代わりに `sources` 入力を使用してください。また、`setSource()` メソッドは引き続き利用可能です。                          |
| `sourceFilesExtensions` 入力は削除されました。                      | コンパイルタスクは引き続き `PatternFilterable` インターフェースを実装しています。Kotlin ソースのフィルタリングにはそのメソッドを使用してください。 |
| `Gradle destinationDir: File` 出力は非推奨になりました。            | 代わりに `destinationDirectory: DirectoryProperty` 出力を使用してください。                                              |
| `KotlinCompile` タスクの `classpath` プロパティは非推奨です。 | すべてのコンパイルタスクは、コンパイルに必要なライブラリのリストに `libraries` 入力を使用するようになりました。              |

**変更はいつから有効になりますか？**

Kotlin 1.7.20 では、入力が利用できなくなり、出力が置き換えられ、`classpath` プロパティが非推奨となりました。

詳細については、[YouTrack の対応する課題](https://youtrack.jetbrains.com/issue/KT-32805) を参照してください。

### コンパイルに対する依存関係の新しい構成名 {initial-collapse-state="collapsed" collapsible="true"}

**何が変更されましたか？**

Kotlin Multiplatform Gradle プラグインによって作成されるコンパイル構成（configurations）に、新しい名前が付けられました。

Kotlin Multiplatform プロジェクトのターゲットには、`main` と `test` という 2 つのデフォルトのコンパイルがあります。これらの各コンパイルには、`jvmMain` や `jvmTest` などの独自のデフォルトソースセットがあります。以前は、テストコンパイルとそのデフォルトソースセットの構成名が同じであったため、プラットフォーム固有の属性を持つ構成が別の構成に含まれる際に名前の衝突が発生し、問題の原因となることがありました。

現在、コンパイル構成には `Compilation` というサフィックスが追加されています。古いハードコードされた構成名を使用しているプロジェクトやプラグインはコンパイルできなくなります。

対応するソースセットに対する依存関係の構成名はそのままです。

**現在のベストプラクティスは何ですか？**

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

利用可能なスコープは `Api`、`Implementation`、`CompileOnly`、`RuntimeOnly` です。

**変更はいつから有効になりますか？**

Kotlin 1.8.0 では、ハードコードされた文字列で古い構成名を使用するとエラーが発生するようになりました。

詳細については、[YouTrack の対応する課題](https://youtrack.jetbrains.com/issue/KT-35916/) を参照してください。