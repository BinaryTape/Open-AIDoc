[//]: # (title: マルチプラットフォームライブラリへの依存関係の追加)

すべてのプログラムが正常に動作するには、一連のライブラリが必要です。
Kotlin Multiplatform プロジェクトは、複数のターゲットプラットフォームをサポートするクロスプラットフォームライブラリ、プラットフォーム固有のライブラリ、および他のマルチプラットフォームプロジェクトに依存できます。

Android アプリの開発経験がある場合、マルチプラットフォーム依存関係の追加は、通常の Android プロジェクトに Gradle の依存関係を追加するのと似ています。
主な違いは、モジュール全体ではなく、特定のソースセット（source set）に依存関係を追加する必要がある点です。

このページでは、マルチプラットフォームプロジェクトにおける依存関係管理の全体的なアプローチについて説明します。
プラットフォーム固有の詳細については、[Android の依存関係の追加](multiplatform-android-dependencies.md)および [iOS の依存関係の追加](multiplatform-ios-dependencies.md)を参照してください。

## 依存関係の種類 {id="dependency-types"}

Kotlin Multiplatform プロジェクトで使用できる依存関係には、主に2つの種類があります。

* _マルチプラットフォーム依存関係_。これらは複数のターゲットをサポートし、共通ソースセット（common source set）で使用できるマルチプラットフォームライブラリです。

  [Koin](https://insert-koin.io/)、[Coil](https://coil-kt.github.io/coil/)、[SQLDelight](https://sqldelight.github.io/sqldelight/latest/) など、多くの最新の Android ライブラリはすでにマルチプラットフォームをサポートしています。
  
  公開されている Kotlin Multiplatform ライブラリのカタログである [klibs.io](https://klibs.io/) で、さらに多くのマルチプラットフォームライブラリを探すことができます。

* _ネイティブ依存関係_。これらは、対応するエコシステム由来のプラットフォーム固有のライブラリです。
  ネイティブプロジェクトでは通常、Android の Gradle や iOS の Swift Package Manager など、プラットフォーム固有のツールを使用してこれらのライブラリを管理します。

  マルチプラットフォームプロジェクトのモジュールで作業する場合でも、通常、セキュアストレージやシステムコールなどのプラットフォーム API を使用するためにネイティブ依存関係が必要になります。
  ビルドスクリプトでは、`androidMain` や `iosMain` などのネイティブソースセットの設定でネイティブ依存関係を指定します。

どちらの種類の依存関係でも、ローカルリポジトリと外部リポジトリの両方を使用できます。

## Gradle バージョンカタログ {id="gradle-version-catalogs"}

Gradle を使用する場合、依存関係の管理には[バージョンカタログ (version catalogs)](https://docs.gradle.org/current/userguide/version_catalogs.html) を使用することをお勧めします。

バージョンカタログを使用すると、カタログ内でアーティファクト名とバージョンを定義し、その定義をビルドスクリプトファイル内で参照できます。

たとえば、基本的なカタログファイルは次のようになります。

```toml
# libs.versions.toml (デフォルトのカタログファイル)
[versions]
my-library = "1.0"

[libraries]
my-library = {module = "com.example:my-library", version.ref = "my-library"}
```

そして、このカタログを使用して依存関係を追加する例は次のとおりです。

```kotlin
// build.gradle.kts
dependencies {
    // 'libs' はカタログファイル名の最初の部分です
    // 'my.library' は名前空間を除いたアーティファクト名で、
    // ダッシュの代わりにドットが使用されます
    implementation(libs.my.library)
}
```

## コア Kotlin ライブラリへの依存関係 {id="dependencies-on-core-kotlin-libraries"}

### 標準ライブラリ {id="standard-library"}

Kotlin Multiplatform プロジェクトの各ソースセットは、自動的に Kotlin 標準ライブラリ (`kotlin-stdlib`) に依存します。
標準ライブラリのバージョンは、適用されている [Kotlin Multiplatform Gradle プラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)のバージョンと同じになります。

プラットフォーム固有のソースセットに対して、Gradle は対応するプラットフォーム固有のライブラリバリアントを自動的に使用し、残りのソースセットには共通の標準ライブラリが追加されます。
JVM ターゲットの場合、Kotlin Gradle プラグインは、Gradle ビルドスクリプトの `compilerOptions.jvmTarget` [コンパイラオプション](https://kotlinlang.org/docs/gradle-compiler-options.html)に応じて、適切な JVM 標準ライブラリを選択します。

デフォルトの `kotlin-stdlib` 依存関係の解決方法を変更する方法については、[標準ライブラリへの依存関係の変更](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)を参照してください。

### テストライブラリ {id="testing-libraries"}

マルチプラットフォームのテストには、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API が利用可能です。
これはマルチプラットフォームライブラリであるため、`commonTest` ソースセットに単一の依存関係を指定するだけで、すべてのテストソースセットにテスト依存関係を追加できます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        // すべてのテストソースセットで kotlin.test のクラスを利用可能にします
        commonTest.dependencies {
            implementation(kotlin("test")) 
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        // すべてのテストソースセットで kotlin.test のクラスを利用可能にします
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</TabItem>
</Tabs>

### `kotlinx` ライブラリ {id="kotlinx-libraries"}

kotlinx ライブラリは、JetBrains のコア Kotlin チームによって保守されているマルチプラットフォームライブラリです
（代表例として [kotlinx.serialization](https://github.com/kotlin/kotlinx.serialization) や [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines) があります）。

他のマルチプラットフォームライブラリと同様に、依存関係を追加するには、対応するソースセットでライブラリアーティファクトを参照します。

> `kotlinx` ライブラリは、Web ターゲット用など、より複雑なセットアップが必要になる場合があります。
> 詳細な手順については、各ライブラリのドキュメントを参照してください。
{style="note"}

## Kotlin Multiplatform ライブラリへの依存関係 {id="dependencies-on-kotlin-multiplatform-libraries"}

[SQLDelight](https://github.com/cashapp/sqldelight) など、Kotlin Multiplatform を採用しているライブラリへの依存関係を追加できます。
このようなライブラリの作者は通常、プロジェクトへの依存関係の追加方法に関するガイドを提供しています。

<a as="button" href="https://klibs.io/" mode="classic" icon="arrow-right" icon-position="right">klibs.io で Kotlin Multiplatform ライブラリを探す</a>

### Gradle バージョンカタログのサンプル {id="sample-gradle-version-catalog"}

Gradle を使用する場合は、[バージョンカタログ](#gradle-バージョンカタログ)を使用することをお勧めします。
以下の例で使用されるすべてのライブラリを定義したバージョンカタログを次に示します。

```toml
[versions]
ktor = "%ktorVersion%"
kotlinx-coroutines = "%coroutinesVersion%"
sqlDelight = "%sqlDelightVersion%"

[libraries]
ktor-clientCore = { module = "io.ktor:ktor-client-core", version.ref = "%ktorVersion%" }
kotlinx-coroutinesCore = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "%coroutinesVersion%" }
sqldelight-nativeDriver = { module = "com.squareup.sqldelight:native-driver", version.ref = "%sqlDelightVersion%" }
```

### すべてのソースセットで共有されるライブラリ {id="library-shared-for-all-source-sets"}

すべてのソースセットからライブラリにアクセスしたい場合、またはそれを使用して共有コードを記述したい場合は、共通ソースセット（common source set）にのみライブラリを追加します。
Kotlin Multiplatform Gradle プラグインが、宣言されている他のソースセットに対応するプラットフォーム固有のアーティファクトを自動的に解決します。

> 共通ソースセットはプラットフォーム固有のアーティファクトに依存できません。
> 共通コードは、宣言されているすべてのターゲットに対してコンパイルできる必要があるためです。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.clientCore)
        }
        androidMain.dependencies {
            // ktor-client のプラットフォーム固有部分への依存関係は、
            // ビルド時に解決されます
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation(libs.ktor.clientCore)
            }
        }
        androidMain {
            dependencies {
              // ktor-client のプラットフォーム固有部分への依存関係は、
              // ビルド時に解決されます
            }
        }
    }
}
```

</TabItem>
</Tabs>

> トップレベルの `dependencies {}` ブロックで共通ライブラリを設定することもできます。
> [トップレベルでの依存関係の設定](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)を参照してください。
> 
{style="tip"}

### 特定のソースセットで使用されるライブラリ {id="libraries-to-be-used-in-specific-source-sets"}

特定のソースセットでのみマルチプラットフォームライブラリを使用したい場合は、そのソースセットにのみ追加できます。
その場合、そのライブラリの宣言は、追加したソースセット内でのみ利用可能になります。

このような場合、プラットフォーム固有の名前ではなく、共通のライブラリ名を使用してください。
Kotlin Multiplatform Gradle プラグインがこれらの参照を自動的に解決します。
正確な名前については、各ライブラリのドキュメントに記載されているはずです。

以下は、プラットフォーム固有の SQLDelight に `native-driver-iosx64` の代わりに `native-driver` を使用する例です。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines はすべてのソースセットで利用可能
            implementation(libs.kotlinx.coroutinesCore)
        }
        androidMain.dependencies {
            // Android固有の依存関係を記述する場所
        }
        iosMain.dependencies {
            // SQLDelight は iOS ソースセットで利用可能ですが、
            // Android や common ソースセットでは利用できません
            implementation(libs.sqldelight.nativeDriver)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                // kotlinx.coroutines はすべてのソースセットで利用可能
                implementation(libs.kotlinx.coroutinesCore)
            }
        }
        androidMain {
            dependencies {
                // Android固有の依存関係を記述する場所
            }
        }
        iosMain {
            dependencies {
                // SQLDelight は iOS ソースセットで利用可能ですが、
                // Android や common ソースセットでは利用できません
                implementation(sqldelight.nativeDriver)
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 他のマルチプラットフォームプロジェクトへの依存関係 {id="dependency-on-another-multiplatform-project"}

あるマルチプラットフォームプロジェクトを、別のマルチプラットフォームプロジェクトに依存させることができます。
これを設定するには、依存関係を必要とするソースセットに Gradle プロジェクト依存関係を追加します。
すべてのソースセットでプロジェクト依存関係を使用したい場合は、共通ソースセットに追加します。
この場合、コンパイラは他のソースセットに対しても、そのプロジェクトのプラットフォーム固有アーティファクトを自動的に提供します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(project(":some-other-multiplatform-module"))
        }
        androidMain.dependencies {
            // :some-other-multiplatform-module のプラットフォーム固有の宣言は
            // 自動的に解決されます
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation project(':some-other-multiplatform-module')
            }
        }
        androidMain {
            dependencies {
                // :some-other-multiplatform-module のプラットフォーム固有の宣言は
                // 自動的に解決されます
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 次のステップ {id="what-s-next"}

マルチプラットフォームプロジェクトにおける依存関係の追加に関するその他のリソースをチェックし、以下について詳しく学びましょう。

* [Android の依存関係の追加](multiplatform-android-dependencies.md)
* [iOS の依存関係の追加](multiplatform-ios-dependencies.md)
* サンプルプロジェクトでの [Android および iOS ライブラリ](multiplatform-samples.md)の使用

## ヘルプの入手 {id="get-help"}

* **Kotlin Slack**。[招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受け取って [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin イシュートラッカー**。[新しいイシューを報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。