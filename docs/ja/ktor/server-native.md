[//]: # (title: Native サーバー)

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
KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。
</link-summary>

Ktorは[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。現在、Kotlin/NativeでKtorサーバーを実行する場合、以下の制限があります:
* `embeddedServer`を使用して[サーバーを作成する](server-create-and-configure.topic)必要がある
* [CIOエンジン](server-engines.md)のみがサポートされている
* リバースプロキシなしの[HTTPS](server-ssl.md)はサポートされていない

undefined

## 依存関係の追加 {id="add-dependencies"}

Kotlin/NativeプロジェクトのKtorサーバーには、少なくとも2つの依存関係が必要です。
* `ktor-server-core`（コア依存関係）
* `ktor-server-cio`（CIOエンジン）

以下のコードスニペットは、`<Path>build.gradle.kts</Path>`ファイルの`nativeMain`ソースセットに依存関係を追加する方法を示しています。

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

Nativeサーバーを[テスト](server-testing.md)するには、`nativeTest`ソースセットに`ktor-server-test-host`アーティファクトを追加します。

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

## Nativeターゲットの設定 {id="native-target"}

必要なNativeターゲットを指定し、`binaries`プロパティを使用して[Nativeバイナリを宣言](https://kotlinlang.org/docs/mpp-build-native-binaries.html)します。

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
        // その他のサポートされているターゲットはこちらに記載されています: https://ktor.io/docs/server-native.html#targets
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

> 完全な例については、[embedded-server-native](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-native)を参照してください。
>
{style="tip"}

## 次のステップ {id="create-server"}

Gradleビルドスクリプトを設定した後、[Ktorサーバーの作成](server-create-and-configure.topic)に進むことができます。