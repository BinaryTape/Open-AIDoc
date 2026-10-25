[//]: # (title: ネイティブサーバー)

<tldr>
<var name="example_name" value="embedded-server-native"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。
</link-summary>

Ktor は [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。現在、Kotlin/Native で Ktor サーバーを実行する際には、以下の制限事項があります:
* [サーバーの作成](server-create-and-configure.topic)には `embeddedServer` を使用する必要がある
* [CIO エンジン](server-engines.md)のみがサポートされている
* リバースプロキシなしの [HTTPS](server-ssl.md) はサポートされていない

> Kotlin/Native プロジェクトで Ktor を使用するには、[新しいメモリマネージャー](https://kotlinlang.org/docs/native-memory-manager.html)が必要です。これは Kotlin 1.7.20 以降でデフォルトで有効になっています。
>
{id="newmm-note" style="note"}

## 依存関係の追加 {id="add-dependencies"}

Kotlin/Native プロジェクトの Ktor サーバーには、少なくとも2つの依存関係が必要です:
* `ktor-server-core`（コア依存関係）
* `ktor-server-cio`（CIO エンジン）

以下のコードスニペットは、<Path>build.gradle.kts</Path> ファイルの `nativeMain` ソースセットに依存関係を追加する方法を示しています:

```kotlin
kotlin {
    sourceSets {
        nativeMain.dependencies {
            implementation("io.ktor:ktor-server-core:$ktor_version")
            implementation("io.ktor:ktor-server-cio:$ktor_version")
        }
    }
}
```

Native サーバーを[テスト](server-testing.md)するには、`nativeTest` ソースセットに `ktor-server-test-host` アーティファクトを追加します:

```kotlin
kotlin {
    sourceSets {
        nativeTest.dependencies {
            implementation(kotlin("test"))
            implementation("io.ktor:ktor-server-test-host:$ktor_version")
        }
    }
}
```

## ネイティブターゲットの設定 {id="native-target"}

必要なネイティブターゲットを指定し、`binaries` プロパティを使用して[ネイティブバイナリを宣言](https://kotlinlang.org/docs/mpp-build-native-binaries.html)します:

```kotlin
kotlin {
    val hostOs = System.getProperty("os.name")
    val arch = System.getProperty("os.arch")
    val nativeTarget = when {
        hostOs == "Mac OS X" && arch == "x86_64" -> macosX64("native")
        hostOs == "Mac OS X" && arch == "aarch64" -> macosArm64("native")
        hostOs == "Linux" && (arch == "x86_64" || arch == "amd64") -> linuxX64("native")
        hostOs == "Linux" && arch == "aarch64" -> linuxArm64("native")
        hostOs.startsWith("Windows") -> mingwX64("native")
        // Other supported targets are listed here: https://ktor.io/docs/server-native.html#targets
        else -> throw GradleException("Host OS is not supported in Kotlin/Native.")
    }

    nativeTarget.apply {
        binaries {
            executable {
                entryPoint = "main"
            }
        }
    }
}
```

> 完全なサンプルについては、[embedded-server-native](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-native) を参照してください。
>
{style="tip"}

## 次のステップ {id="create-server"}

Gradle ビルドスクリプトを設定したら、続いて [Ktor サーバーの作成](server-create-and-configure.topic)を行うことができます。