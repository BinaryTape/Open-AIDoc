[//]: # (title: ネイティブ配布)

ここでは、ネイティブ配布について学びます。サポートされているすべてのシステム向けのインストーラーやパッケージの作成方法、および配布用と同じ設定でアプリケーションをローカルで実行する方法について説明します。

以下のトピックの詳細については、このまま読み進めてください。

* [Compose Multiplatform Gradle プラグインとは](#gradle-plugin)
* [基本的なタスクの詳細](#basic-tasks)（アプリケーションのローカル実行など）と、[高度なタスク](#minification-and-obfuscation)（ミニファイや難読化など）
* [JDK モジュールの含め方](#including-jdk-modules)と `ClassNotFoundException` への対処法
* [配布プロパティの指定方法](#specifying-distribution-properties)：パッケージバージョン、JDK バージョン、出力ディレクトリ、ランチャープロパティ、メタデータ
* [リソースの管理方法](#managing-resources)：リソースライブラリの使用、JVM リソースのロード、パッケージ化されたアプリケーションへのファイルの追加
* [ソースセットのカスタマイズ方法](#custom-source-sets)：Gradle ソースセット、Kotlin JVM ターゲット、または手動による設定
* [アプリケーションアイコンの指定方法](#application-icon)（各 OS ごと）
* [プラットフォーム固有のオプション](#platform-specific-options)：Linux のパッケージメンテナーのメールアドレスや、macOS の Apple App Store 用アプリカテゴリなど
* [macOS 固有の設定](#macos-specific-configuration)：署名、公証（Notarization）、`Info.plist`

## Gradle プラグイン {id="gradle-plugin"}

このガイドは、主に Compose Multiplatform Gradle プラグインを使用した Compose アプリケーションのパッケージ化に焦点を当てています。
`org.jetbrains.compose` プラグインは、基本的なパッケージ化、難読化、および macOS のコード署名のためのタスクを提供します。

このプラグインは、`jpackage` を使用したネイティブ配布用のパッケージ化プロセスと、ローカルでのアプリケーション実行を簡素化します。
配布可能なアプリケーションは、必要なすべての Java ランタイムコンポーネントを含む自己完結型のインストール可能なバイナリであり、ターゲットシステムに JDK がインストールされている必要はありません。

パッケージサイズを最小限に抑えるために、Gradle プラグインは [jlink](https://openjdk.org/jeps/282) ツールを使用して、配布パッケージに必要な Java モジュールのみが含まれるようにします。
ただし、どのモジュールが必要かを指定するために Gradle プラグインを設定する必要があります。
詳細については、[JDK モジュールの含め方](#including-jdk-modules)のセクションを参照してください。

代替案として、JetBrains が開発していない外部ツールである [Conveyor](https://www.hydraulic.software) を使用することもできます。
Conveyor はオンラインアップデート、クロスビルド、およびその他のさまざまな機能をサポートしていますが、オープンソースでないプロジェクトには[ライセンス](https://hydraulic.software/pricing.html)が必要です。
詳細については、[Conveyor のドキュメント](https://conveyor.hydraulic.dev/latest/tutorial/hare/jvm)を参照してください。

## 基本的なタスク {id="basic-tasks"}

Compose Multiplatform Gradle プラグインにおける基本的な設定単位は `application` です（非推奨となった [Gradle application](https://docs.gradle.org/current/userguide/application_plugin.html) プラグインと混同しないでください）。

`application` DSL メソッドは、最終的なバイナリセットの共有設定を定義します。これにより、ファイルのコレクションを JDK ディストリビューションとともに、さまざまな形式の圧縮されたバイナリインストーラーにパックできます。

サポートされているオペレーティングシステムでは、以下の形式が利用可能です。

* **macOS**: `.dmg` (`TargetFormat.Dmg`)、`.pkg` (`TargetFormat.Pkg`)
* **Windows**: `.exe` (`TargetFormat.Exe`)、`.msi` (`TargetFormat.Msi`)
* **Linux**: `.deb` (`TargetFormat.Deb`)、`.rpm` (`TargetFormat.Rpm`)

以下は、基本的なデスクトップ設定を含む `build.gradle.kts` ファイルの例です。

```kotlin
import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}

dependencies {
    implementation(compose.desktop.currentOs)
}

compose.desktop {
    application {
        mainClass = "example.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Exe)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { mainClass = "}

プロジェクトをビルドすると、プラグインは以下のタスクを作成します。

<table>
    
<tr>
<td>Gradle タスク</td>
        <td>説明</td>
</tr>

    
<tr>
<td><code>package&lt;FormatName&gt;</code></td> 
        <td>アプリケーションを対応する <code>FormatName</code> バイナリにパッケージ化します。現在、クロスコンパイルはサポートされていません。
            つまり、特定の形式をビルドするには、対応する互換性のある OS を使用する必要があります。
            たとえば、<code>.dmg</code> バイナリをビルドするには、macOS で <code>packageDmg</code> タスクを実行する必要があります。
            現在の OS と互換性のないタスクは、デフォルトでスキップされます。</td>
</tr>

    
<tr>
<td><code>packageDistributionForCurrentOS</code></td>
        <td>アプリケーションのすべてのパッケージタスクを集約します。これは <a href="https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_categories">ライフサイクルタスク</a> です。</td>
</tr>

    
<tr>
<td><code>packageUberJarForCurrentOS</code></td>
        <td>現在のオペレーティングシステムのすべての依存関係を含む単一の jar ファイルを作成します。
        このタスクは、<code>compose.desktop.currentOS</code> が <code>compile</code>、<code>implementation</code>、または <code>runtime</code> 依存関係として使用されていることを想定しています。</td>
</tr>

    
<tr>
<td><code>run</code></td>
        <td><code>mainClass</code> で指定されたエントリポイントからアプリケーションをローカルで実行します。<code>run</code> タスクは、フルランタイムを備えたパッケージ化されていない JVM アプリケーションを起動します。
        この方法は、ランタイムを最小化したコンパクトなバイナリイメージを作成するよりも高速でデバッグが容易です。
        最終的なバイナリイメージを実行するには、代わりに <code>runDistributable</code> タスクを使用してください。</td>
</tr>

    
<tr>
<td><code>createDistributable</code></td>
        <td>インストーラーを作成せずに、最終的なアプリケーションイメージを作成します。</td>
</tr>

    
<tr>
<td><code>runDistributable</code></td>
        <td>事前パッケージ化されたアプリケーションイメージを実行します。</td>
</tr>

</table>

利用可能なすべてのタスクは、Gradle ツールウィンドウにリストされます。タスクを実行すると、Gradle は `${project.buildDir}/compose/binaries` ディレクトリに出力バイナリを生成します。

## JDK モジュールの含め方 {id="including-jdk-modules"}

配布サイズを削減するために、Gradle プラグインは [jlink](https://openjdk.org/jeps/282) を使用して、必要な JDK モジュールのみをバンドルします。

現時点では、Gradle プラグインは必要な JDK モジュールを自動的に判断しません。これはコンパイルエラーの原因にはなりませんが、
必要なモジュールが提供されない場合、実行時に `ClassNotFoundException` が発生する可能性があります。

パッケージ化されたアプリケーションまたは `runDistributable` タスクの実行時に `ClassNotFoundException` が発生した場合は、`modules` DSL メソッドを使用して追加の JDK モジュールを含めることができます。

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            modules("java.sql")
            // または: includeAllModules = true
        }
    }
}
```

必要なモジュールを手動で指定するか、`suggestModules` を実行することができます。`suggestModules` タスクは [jdeps](https://docs.oracle.com/javase/9/tools/jdeps.htm) 静的解析ツールを使用して、不足している可能性のあるモジュールを特定します。
ツールの出力は不完全であったり、不要なモジュールがリストされたりする場合があることに注意してください。

配布物のサイズが重要な要素ではなく、無視できる場合は、`includeAllModules` DSL プロパティを使用してすべてのランタイムモジュールを含めることを選択できます。

## 配布プロパティの指定方法 {id="specifying-distribution-properties"}

### パッケージバージョン

ネイティブ配布パッケージには、特定のパッケージバージョンが必要です。
パッケージバージョンを指定するには、以下の DSL プロパティを使用できます。これらは優先度の高い順に並んでいます。

* `nativeDistributions.<os>.<packageFormat>PackageVersion` は、単一のパッケージ形式のバージョンを指定します。
* `nativeDistributions.<os>.packageVersion` は、単一のターゲット OS のバージョンを指定します。
* `nativeDistributions.packageVersion` は、すべてのパッケージのバージョンを指定します。

macOS では、以下の DSL プロパティを使用してビルドバージョンを指定することもできます。これも優先度の高い順に並んでいます。

* `nativeDistributions.macOS.<packageFormat>PackageBuildVersion` は、単一のパッケージ形式のビルドバージョンを指定します。
* `nativeDistributions.macOS.packageBuildVersion` は、すべての macOS パッケージのビルドバージョンを指定します。

ビルドバージョンを指定しない場合、Gradle は代わりにパッケージバージョンを使用します。macOS でのバージョニングの詳細については、
[`CFBundleShortVersionString`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring) 
および [`CFBundleVersion`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion) のドキュメントを参照してください。

以下は、優先順位に従ってパッケージバージョンを指定するためのテンプレートです。

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            // すべてのパッケージのバージョン
            packageVersion = "..." 
          
            macOS {
              // すべての macOS パッケージのバージョン
              packageVersion = "..."
              // dmg パッケージのみのバージョン
              dmgPackageVersion = "..." 
              // pkg パッケージのみのバージョン
              pkgPackageVersion = "..." 
              
              // すべての macOS パッケージのビルドバージョン
              packageBuildVersion = "..."
              // dmg パッケージのみのビルドバージョン
              dmgPackageBuildVersion = "..." 
              // pkg パッケージのみのビルドバージョン
              pkgPackageBuildVersion = "..." 
            }
            windows {
              // すべての Windows パッケージのバージョン
              packageVersion = "..."  
              // msi パッケージのみのバージョン
              msiPackageVersion = "..."
              // exe パッケージのみのバージョン
              exePackageVersion = "..." 
            }
            linux {
              // すべての Linux パッケージのバージョン
              packageVersion = "..."
              // deb パッケージのみのバージョン
              debPackageVersion = "..."
              // rpm パッケージのみのバージョン
              rpmPackageVersion = "..."
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { nativeDistributions { packageVersion ="}

パッケージバージョンを定義するには、以下のルールに従ってください。

<table>
    
<tr>
<td>ファイル形式</td>
        <td>バージョン形式</td>
        <td>詳細</td>
</tr>

    
<tr>
<td><code>dmg</code>, <code>pkg</code></td>
        <td><code>MAJOR[.MINOR][.PATCH]</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> は非負の整数</li>
                <li><code>MINOR</code> はオプションの非負の整数</li>
                <li><code>PATCH</code> はオプションの非負の整数</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>msi</code>, <code>exe</code></td>
        <td><code>MAJOR.MINOR.BUILD</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> は 255 以下の非負の整数</li>
                <li><code>MINOR</code> は 255 以下の非負の整数</li>
                <li><code>BUILD</code> は 65535 以下の非負の整数</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>deb</code></td>
        <td><code>[EPOCH:]UPSTREAM_VERSION[-DEBIAN_REVISION]</code></td>
        <td>
            <ul>
                <li><code>EPOCH</code> はオプションの非負の整数</li>
                <li><code>UPSTREAM_VERSION</code>:
                    <ul>
                        <li>英数字と <code>.</code>, <code>+</code>, <code>-</code>, <code>~</code> 文字のみを含めることができます</li>
                        <li>数字で始まる必要があります</li>
                    </ul>
                </li>
                <li><code>DEBIAN_REVISION</code>:
                    <ul>
                        <li>オプション</li>
                        <li>英数字と <code>.</code>, <code>+</code>, <code>~</code> 文字のみを含めることができます</li>
                    </ul>
                </li>
            </ul>
            詳細については、<a href="https://www.debian.org/doc/debian-policy/ch-controlfields.html#version">Debian のドキュメント</a> を参照してください。
        </td>
</tr>

    
<tr>
<td><code>rpm</code></td>
        <td>任意の形式</td>
        <td>バージョンに <code>-</code> (ハイフン) 文字を含めることはできません。</td>
</tr>

</table>

### JDK バージョン

このプラグインは `jpackage` を使用します。これには [JDK 17](https://openjdk.java.net/projects/jdk/17/) 以上の JDK バージョンが必要です。
JDK バージョンを指定するときは、以下の要件の少なくとも 1 つを満たしていることを確認してください。

* `JAVA_HOME` 環境変数が、互換性のある JDK バージョンを指している。
* DSL を介して `javaHome` プロパティが設定されている：

  ```kotlin
  compose.desktop {
      application {
          javaHome = System.getenv("JDK_17")
      }
  }
  ```

### 出力ディレクトリ

ネイティブ配布用にカスタム出力ディレクトリを使用するには、以下に示すように `outputBaseDir` プロパティを設定します。

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            outputBaseDir.set(project.layout.buildDirectory.dir("customOutputDir"))
        }
    }
}
```

### ランチャープロパティ

アプリケーションの起動プロセスを調整するために、以下のプロパティをカスタマイズできます。

<table>
  
<tr>
<td>プロパティ</td>
    <td>説明</td>
</tr>

  
<tr>
<td><code>mainClass</code></td>
    <td><code>main</code> メソッドを含むクラスの完全修飾名。</td>
</tr>

  
<tr>
<td><code>args</code></td>
    <td>アプリケーションの <code>main</code> メソッドへの引数。</td>
</tr>

  
<tr>
<td><code>jvmArgs</code></td>
    <td>アプリケーションの JVM への引数。</td>
</tr>

</table>

設定例を以下に示します。

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        args += listOf("-customArgument")
        jvmArgs += listOf("-Xmx2G")
    }
}
```

### メタデータ

`nativeDistributions` DSL ブロック内で、以下のプロパティを設定できます。

<table>
  
<tr>
<td>プロパティ</td>
    <td>説明</td>
    <td>デフォルト値</td>
</tr>

  
<tr>
<td><code>packageName</code></td>
    <td>アプリケーション名。</td>
    <td>Gradle プロジェクトの <a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getName--">名前 (name)</a></td>
</tr>

  
<tr>
<td><code>packageVersion</code></td>
    <td>アプリケーションのバージョン。</td>
    <td>Gradle プロジェクトの <a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getVersion--">バージョン (version)</a></td>
</tr>

  
<tr>
<td><code>description</code></td>
    <td>アプリケーションの説明。</td>
    <td>なし</td>
</tr>

  
<tr>
<td><code>copyright</code></td>
    <td>アプリケーションの著作権情報。</td>
    <td>なし</td>
</tr>

  
<tr>
<td><code>vendor</code></td>
    <td>アプリケーションのベンダー。</td>
    <td>なし</td>
</tr>

  
<tr>
<td><code>licenseFile</code></td>
    <td>アプリケーションのライセンスファイル。</td>
    <td>なし</td>
</tr>

</table> 

設定例を以下に示します。

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            packageName = "ExampleApp"
            packageVersion = "0.1-SNAPSHOT"
            description = "Compose Multiplatform App"
            copyright = "© 2024 My Name. All rights reserved."
            vendor = "Example vendor"
            licenseFile.set(project.file("LICENSE.txt"))
        }
    }
}
```

## リソースの管理 {id="managing-resources"}

リソースをパッケージ化してロードするには、Compose Multiplatform リソースライブラリ、JVM リソースロードを使用するか、パッケージ化されたアプリケーションにファイルを追加します。

### リソースライブラリ

プロジェクトのリソースをセットアップする最も簡単な方法は、リソースライブラリを使用することです。
リソースライブラリを使用すると、サポートされているすべてのプラットフォームにわたる共通コードからリソースにアクセスできます。
詳細については、[マルチプラットフォームリソース](compose-multiplatform-resources.md) を参照してください。

### JVM リソースロード

デスクトップ用の Compose Multiplatform は JVM プラットフォーム上で動作するため、`java.lang.Class` API を使用して `.jar` ファイルからリソースをロードできます。`src/main/resources` ディレクトリ内のファイルには、[`Class::getResource`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResource(java.lang.String))
または [`Class::getResourceAsStream`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResourceAsStream(java.lang.String)) を介してアクセスできます。

### パッケージ化されたアプリケーションへのファイルの追加

`.jar` ファイルからリソースをロードするのがあまり実用的でない場合があります。たとえば、ターゲット固有のアセットがあり、macOS パッケージには含めるが Windows パッケージには含めたくないファイルがある場合などです。

このような場合、インストールディレクトリに追加のリソースファイルを含めるように Gradle プラグインを設定できます。
以下のように DSL を使用して、ルートリソースディレクトリを指定します。

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageVersion = "1.0.0"

            appResourcesRootDir.set(project.layout.projectDirectory.dir("resources"))
        }
    }
}
```

上記の例では、ルートリソースディレクトリは `<PROJECT_DIR>/resources` として定義されています。

Gradle プラグインは、以下のようにリソースサブディレクトリからファイルを取り込みます。

1. **共通リソース:**
`<RESOURCES_ROOT_DIR>/common` にあるファイルは、ターゲットの OS やアーキテクチャに関係なく、すべてのパッケージに含まれます。

2. **OS 固有のリソース:**
`<RESOURCES_ROOT_DIR>/<OS_NAME>` にあるファイルは、特定のオペレーティングシステム用にビルドされたパッケージにのみ含まれます。
`<OS_NAME>` の有効な値は、`windows`、`macos`、`linux` です。

3. **OS およびアーキテクチャ固有のリソース:**
`<RESOURCES_ROOT_DIR>/<OS_NAME>-<ARCH_NAME>` にあるファイルは、特定のオペレーティングシステムと CPU アーキテクチャの組み合わせに対してビルドされたパッケージにのみ含まれます。
`<ARCH_NAME>` の有効な値は、`x64` および `arm64` です。
たとえば、`<RESOURCES_ROOT_DIR>/macos-arm64` 内のファイルは、Apple シリコン搭載の Mac 用のパッケージにのみ含まれます。

`compose.application.resources.dir` システムプロパティを使用して、含まれているリソースにアクセスできます。

```kotlin
import java.io.File

val resourcesDir = File(System.getProperty("compose.application.resources.dir"))

fun main() {
    println(resourcesDir.resolve("resource.txt").readText())
}
```

## カスタムソースセット {id="custom-source-sets"}

`org.jetbrains.kotlin.jvm` または `org.jetbrains.kotlin.multiplatform` プラグインを使用している場合は、デフォルト設定を利用できます。

* `org.jetbrains.kotlin.jvm` を使用した設定には、`main` [ソースセット](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets) の内容が含まれます。
* `org.jetbrains.kotlin.multiplatform` を使用した設定には、単一の [JVM ターゲット](multiplatform-dsl-reference.md#targets) の内容が含まれます。
  複数の JVM ターゲットを定義すると、デフォルト設定は無効になります。この場合、プラグインを手動で設定するか、単一のターゲットを指定する必要があります（下記参照）。

デフォルト設定が曖昧または不十分な場合は、いくつかの方法でカスタマイズできます。

Gradle [ソースセット](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets) を使用する場合:

``` kotlin
plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}
val customSourceSet = sourceSets.create("customSourceSet")
compose.desktop {
    application {
        from(customSourceSet)
    }
}
``` 

Using a Kotlin [JVM ターゲット](multiplatform-dsl-reference.md#targets) を使用する場合:

``` kotlin
plugins {
    kotlin("multiplatform")
    id("org.jetbrains.compose")
} 
kotlin {
    jvm("customJvmTarget") {}
}
compose.desktop {
    application {
        from(kotlin.targets["customJvmTarget"])
    }
}
```

手動で設定する場合:

* デフォルト設定を無効にするには `disableDefaultConfiguration` を使用します。
* 含めるファイルを指定するには `fromFiles` を使用します。
* メインクラスを含む `.jar` ファイルを指すように `mainJar` ファイルプロパティを指定します。
* すべてのプラグインタスクにタスク依存関係を追加するには `dependsOn` を使用します。
``` kotlin
compose.desktop {
    application {
        disableDefaultConfiguration()
        fromFiles(project.fileTree("libs/") { include("**/*.jar") })
        mainJar.set(project.file("main.jar"))
        dependsOn("mainJarTask")
    }
}
```

## アプリケーションアイコン {id="application-icon"}

アプリのアイコンが、以下の OS 固有の形式で利用可能であることを確認してください。

* macOS 用: `.icns`
* Windows 用: `.ico`
* Linux 用: `.png`

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                iconFile.set(project.file("icon.icns"))
            }
            windows {
                iconFile.set(project.file("icon.ico"))
            }
            linux {
                iconFile.set(project.file("icon.png"))
            }
        }
    }
}
```

## プラットフォーム固有のオプション {id="platform-specific-options"}

プラットフォーム固有の設定は、対応する DSL ブロックを使用して構成できます。

``` kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                // macOS 用のオプション
            }
            windows {
                // Windows 用のオプション
            }
            linux {
                // Linux 用のオプション
            }
        }
    }
}
```

以下の表は、サポートされているすべてのプラットフォーム固有のオプションを示しています。ドキュメント化されていないプロパティの使用は **推奨されません**。

<table>
    
<tr>
<td>プラットフォーム</td>
        <td>オプション</td>
        <td width="500">説明</td>
</tr>

    
<tr>
<td rowspan="3">全プラットフォーム</td>
        <td><code>iconFile.set(File("PATH_TO_ICON"))</code></td>
        <td>アプリケーションのプラットフォーム固有のアイコンへのパスを指定します。詳細は <a href="#application-icon">アプリケーションアイコン</a> セクションを参照してください。</td>
</tr>

    
<tr>
<td><code>packageVersion = "1.0.0"</code></td>
        <td>プラットフォーム固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。</td>
</tr>

    
<tr>
<td><code>installationPath = "PATH_TO_INST_DIR"</code></td>
        <td>デフォルトのインストールディレクトリへの絶対パスまたは相対パスを指定します。
            Windows では、インストール中にパスをカスタマイズできるように <code>dirChooser = true</code> を使用することもできます。</td>
</tr>

    
<tr>
<td rowspan="8">Linux</td>
        <td><code>packageName = "custom-package-name"</code></td>
        <td>デフォルトのアプリケーション名をオーバーライドします。</td>
</tr>

    
<tr>
<td><code>debMaintainer = "maintainer@example.com"</code></td>
        <td>パッケージメンテナーのメールアドレスを指定します。</td>
</tr>

    
<tr>
<td><code>menuGroup = "my-example-menu-group"</code></td>
        <td>アプリケーションのメニューグループを定義します。</td>
</tr>

    
<tr>
<td><code>appRelease = "1"</code></td>
        <td>rpm パッケージのリリース値、または deb パッケージのリビジョン値を設定します。</td>
</tr>

    
<tr>
<td><code>appCategory = "CATEGORY"</code></td>
        <td>rpm パッケージのグループ値、または deb パッケージのセクション値を割り当てます。</td>
</tr>

    
<tr>
<td><code>rpmLicenseType = "TYPE_OF_LICENSE"</code></td>
        <td>rpm パッケージのライセンスの種類を指定します。</td>
</tr>

    
<tr>
<td><code>debPackageVersion = "DEB_VERSION"</code></td>
        <td>deb 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。</td>
</tr>

    
<tr>
<td><code>rpmPackageVersion = "RPM_VERSION"</code></td>
        <td>rpm 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。</td>
</tr>

    
<tr>
<td rowspan="15">macOS</td>
        <td><code>bundleID</code></td>
        <td>
            一意のアプリケーション識別子を指定します。これには英数字（<code>A-Z</code>、<code>a-z</code>、<code>0-9</code>）、ハイフン（<code>-</code>）、
            ピリオド（<code>.</code>）のみを含めることができます。リバース DNS 表記（<code>com.mycompany.myapp</code>）の使用が推奨されます。
        </td>
</tr>

    
<tr>
<td><code>packageName</code></td>
        <td>アプリケーションの名前。</td>
</tr>

    
<tr>
<td><code>dockName</code></td>
        <td>
            メニューバー、「&lt;アプリ&gt;について」メニュー項目、および Dock に表示されるアプリケーションの名前。
            デフォルト値は <code>packageName</code> です。
        </td>
</tr>

    
<tr>
<td><code>minimumSystemVersion</code></td>
        <td>
            アプリケーションの実行に必要な最小 macOS バージョン。詳細は
            <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion">
                <code>LSMinimumSystemVersion</code></a> を参照してください。
        </td>
</tr>

    
<tr>
<td><code>signing</code>, <code>notarization</code>, <code>provisioningProfile</code>, <code>runtimeProvisioningProfile</code></td>
        <td>
            <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">
               macOS 用の配布物の署名と公証</a> チュートリアルを参照してください。
        </td>
</tr>

    
<tr>
<td><code>appStore = true</code></td>
        <td>Apple App Store 用にアプリをビルドして署名するかどうかを指定します。JDK 17 以上が必要です。</td>
</tr>

    
<tr>
<td><code>appCategory</code></td>
        <td>
            Apple App Store 用のアプリのカテゴリ。App Store 用にビルドする場合、デフォルト値は 
            <code>public.app-category.utilities</code> で、それ以外の場合は <code>Unknown</code> です。
            有効なカテゴリのリストについては 
            <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsapplicationcategorytype">
                <code>LSApplicationCategoryType</code>
            </a> を参照してください。
        </td>
</tr>

    
<tr>
<td><code>entitlementsFile.set(File("PATH_ENT"))</code></td>
        <td>
            署名時に使用されるエンタイトルメントを含むファイルへのパスを指定します。カスタムファイルを提供するときは、
            Java アプリケーションに必要なエンタイトルメントを追加してください。App Store 用にビルドするときに使用されるデフォルトのファイルについては、
            <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">
                sandbox.plist</a> を参照してください。このデフォルトファイルは JDK バージョンによって異なる場合があることに注意してください。
            ファイルが指定されていない場合、プラグインは <code>jpackage</code> によって提供されるデフォルトのエンタイトルメントを使用します。
            詳細は <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">
               macOS 用の配布物の署名と公証</a> チュートリアルを参照してください。
        </td>
</tr>

    
<tr>
<td><code>runtimeEntitlementsFile.set(File("PATH_R_ENT"))</code></td>
        <td>
            JVM ランタイムの署名時に使用されるエンタイトルメントを含むファイルへのパスを指定します。カスタムファイルを提供するときは、
            Java アプリケーションに必要なエンタイトルメントを追加してください。デフォルトのファイルについては 
            <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">
                sandbox.plist</a> を参照してください。ファイルが指定されていない場合、プラグインは <code>jpackage</code> によって提供されるデフォルトのエンタイトルメントを使用します。
            詳細は 
            <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">
               macOS 用の配布物の署名と公証</a> チュートリアルを参照してください。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageVersion = "DMG_VERSION"</code></td>
        <td>
            DMG 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageVersion = "PKG_VERSION"</code></td>
        <td>
            PKG 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。
        </td>
</tr>

    
<tr>
<td><code>packageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            パッケージのビルドバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            DMG 固有のパッケージビルドバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageBuildVersion = "PKG_VERSION"</code></td>
        <td>
            PKG 固有のパッケージビルドバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。
        </td>
</tr>

    
<tr>
<td><code>infoPlist</code></td>
        <td><a href="#information-property-list-on-macos">macOS での <code>Info.plist</code></a> セクションを参照してください。</td>
</tr>

        
<tr>
<td rowspan="7">Windows</td>
            <td><code>console = true</code></td>
            <td>アプリケーションにコンソールランチャーを追加します。</td>
</tr>

        
<tr>
<td><code>dirChooser = true</code></td>
            <td>インストール中にインストールパスをカスタマイズできるようにします。</td>
</tr>

        
<tr>
<td><code>perUserInstall = true</code></td>
            <td>アプリケーションをユーザーごとにインストールできるようにします。</td>
</tr>

        
<tr>
<td><code>menuGroup = "start-menu-group"</code></td>
            <td>指定したスタートメニューグループにアプリケーションを追加します。</td>
</tr>

        
<tr>
<td><code>upgradeUuid = "UUID"</code></td>
            <td>インストールされているバージョンよりも新しいバージョンがある場合に、ユーザーがインストーラーを介して
            アプリケーションを更新できるようにする一意の ID を指定します。値は単一のアプリケーションに対して一定である必要があります。
            詳細については <a href="https://wixtoolset.org/documentation/manual/v3/howtos/general/generate_guids.html">How To: Generate a GUID</a> を参照してください。</td>
</tr>

        
<tr>
<td><code>msiPackageVersion = "MSI_VERSION"</code></td>
            <td>MSI 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。</td>
</tr>

        
<tr>
<td><code>exePackageVersion = "EXE_VERSION"</code></td>
            <td>EXE 固有のパッケージバージョンを設定します。詳細は <a href="#package-version">パッケージバージョン</a> セクションを参照してください。</td>
</tr>

</table>

## macOS 固有の設定 {id="macos-specific-configuration"}

### macOS での署名と公証

最新の macOS バージョンでは、インターネットからダウンロードした署名されていないアプリケーションの実行を許可していません。そのようなアプリケーションを実行しようとすると、次のエラーが発生します：「"YourApp"は壊れているため開けません。ディスクイメージを取り出す必要があります。」

アプリケーションに署名して公証する方法については、こちらの [チュートリアル](https://github.com/JetBrains/compose-multiplatform/blob/master/tutorials/Signing_and_notarization_on_macOS/README.md) を参照してください。

### macOS での Information property list

DSL は重要なプラットフォーム固有のカスタマイズをサポートしていますが、提供されている機能だけでは不十分な場合があります。
DSL で表現されていない `Info.plist` の値を指定する必要がある場合は、回避策として生の XML スニペットを含めることができます。この XML はアプリケーションの `Info.plist` に追加されます。

#### 例：ディープリンク

1. `build.gradle.kts` ファイルでカスタム URL スキームを定義します。

  ``` kotlin
  compose.desktop {
      application {
          mainClass = "MainKt"
          nativeDistributions {
              targetFormats(TargetFormat.Dmg)
              packageName = "Deep Linking Example App"
              macOS {
                  bundleID = "org.jetbrains.compose.examples.deeplinking"
                  infoPlist {
                      extraKeysRawXml = macExtraPlistKeys
                  }
              }
          }
      }
  }
  
  val macExtraPlistKeys: String
      get() = """
        <key>CFBundleURLTypes</key>
        <array>
          <dict>
            <key>CFBundleURLName</key>
            <string>Example deep link</string>
            <key>CFBundleURLSchemes</key>
            <array>
              <string>compose</string>
            </array>
          </dict>
        </array>
      """
  ```
  {initial-collapse-state="collapsed" collapsible="true" collapsed-title="infoPlist { extraKeysRawXml = macExtraPlistKeys"}

2. `java.awt.Desktop` クラスを使用して、`src/main/main.kt` ファイルに URI ハンドラーをセットアップします。

  ``` kotlin 
  import androidx.compose.material.MaterialTheme
  import androidx.compose.material.Text
  import androidx.compose.runtime.getValue
  import androidx.compose.runtime.mutableStateOf
  import androidx.compose.runtime.setValue
  import androidx.compose.ui.window.singleWindowApplication
  import java.awt.Desktop
  
  fun main() {
      var text by mutableStateOf("Hello, World!")
  
      try {
          Desktop.getDesktop().setOpenURIHandler { event ->
              text = "Open URI: " + event.uri
          }
      } catch (e: UnsupportedOperationException) {
          println("setOpenURIHandler is unsupported")
      }
  
      singleWindowApplication {
          MaterialTheme {
              Text(text)
          }
      }
  }
  ```
  {initial-collapse-state="collapsed" collapsible="true" collapsed-title="Desktop.getDesktop().setOpenURIHandler { event ->"}

3. `runDistributable` タスクを実行します：`./gradlew runDistributable`

その結果、`compose://foo/bar` のようなリンクをブラウザからアプリケーションにリダイレクトできるようになります。

## ミニファイと難読化 {id="minification-and-obfuscation"}

Compose Multiplatform Gradle プラグインには、[ProGuard](https://www.guardsquare.com/proguard) のサポートが組み込まれています。
ProGuard は、コードのミニファイ（縮小化）と難読化のための [オープンソースツール](https://github.com/Guardsquare/proguard) です。

各 *デフォルト* パッケージングタスク（ProGuard なし）に対して、Gradle プラグインは *リリース* タスク（ProGuard あり）を提供します。

<table>
  
<tr>
<td width="400">Gradle タスク</td>
    <td>説明</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>createDistributable</code></p>
        <p>リリース: <code>createReleaseDistributable</code></p>
    </td>
    <td>JDK とリソースがバンドルされたアプリケーションイメージを作成します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>runDistributable</code></p>
        <p>リリース: <code>runReleaseDistributable</code></p>
    </td>
    <td>JDK とリソースがバンドルされたアプリケーションイメージを実行します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>run</code></p>
        <p>リリース: <code>runRelease</code></p>
    </td>
    <td>Gradle JDK を使用して、パッケージ化されていないアプリケーション <code>.jar</code> を実行します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>package&lt;FORMAT_NAME&gt;</code></p>
        <p>リリース: <code>packageRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>アプリケーションイメージを <code>&lt;FORMAT_NAME&gt;</code> ファイルにパッケージ化します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>packageDistributionForCurrentOS</code></p>
        <p>リリース: <code>packageReleaseDistributionForCurrentOS</code></p>
    </td>
    <td>現在の OS と互換性のある形式でアプリケーションイメージをパッケージ化します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>packageUberJarForCurrentOS</code></p>
        <p>リリース: <code>packageReleaseUberJarForCurrentOS</code></p>
    </td>
    <td>アプリケーションイメージを uber (fat) <code>.jar</code> にパッケージ化します。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>notarize&lt;FORMAT_NAME&gt;</code></p>
        <p>リリース: <code>notarizeRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>公証のために <code>&lt;FORMAT_NAME&gt;</code> アプリケーションイメージをアップロードします（macOS のみ）。</td>
</tr>

  
<tr>
<td>
        <p>デフォルト: <code>checkNotarizationStatus</code></p>
        <p>リリース: <code>checkReleaseNotarizationStatus</code></p>
    </td>
    <td>公証が成功したかどうかを確認します（macOS のみ）。</td>
</tr>

</table>

デフォルト設定では、いくつかの定義済みの ProGuard ルールが有効になっています。

* アプリケーションイメージがミニファイされ、使用されていないクラスが削除されます。
* `compose.desktop.application.mainClass` がエントリポイントとして使用されます。
* Compose ランタイムが機能し続けることを保証するために、いくつかの `keep` ルールが含まれています。

ほとんどの場合、ミニファイされたアプリケーションを得るために追加の設定は必要ありません。
ただし、ProGuard はバイトコード内の一部の使用箇所を追跡できない場合があります（例：リフレクションを介してクラスが使用される場合）。
ProGuard 処理後にのみ発生する問題に遭遇した場合は、カスタムルールを追加する必要があるかもしれません。

`buildTypes.release.proguard` ブロック内で Gradle DSL を使用し、以下のオプションで ProGuard を設定できます。

* `configurationFiles` はカスタム ProGuard 設定ファイルを指定します。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                configurationFiles.from(project.file("compose-desktop.pro"))
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='configurationFiles.from(project.file("compose-desktop.pro"))'}

* `obfuscate` はコードの難読化を有効にします。デフォルトでは無効になっています。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                obfuscate.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="obfuscate.set(true)"}

* `optimize` は ProGuard の最適化を制御します。デフォルトでは有効になっています。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                optimize.set(false)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="optimize.set(false)"}

* `joinOutputJars` は単一の uber-JAR を生成します。デフォルトでは、ProGuard は入力された各 `.jar` に対して個別の `.jar` ファイルを生成します。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                joinOutputJars.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="joinOutputJars.set(true)"}

[//]: # (TODO update version for stable release)

* `version` は特定の ProGuard バージョンを設定します。JDK 25 には少なくとも ProGuard 7.8.0 が必要で、これは Compose Multiplatform 1.12.0-beta01 以降のデフォルトです。それ以前のバージョンの Compose Multiplatform を使用し、JDK 25 でビルドする場合は、このプロパティを明示的に `7.8.0` に設定してください。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                version.set("7.8.0")
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='version.set("7.8.0")'}

ProGuard ルールと設定オプションの完全なリストについては、Guardsquare の [ProGuard マニュアル](https://www.guardsquare.com/manual/configuration/usage) を参照してください。

## 次のステップ

[デスクトップコンポーネント](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop) に関するチュートリアルをご覧ください。