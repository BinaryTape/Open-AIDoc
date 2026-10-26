[//]: # (title: 最終的なネイティブバイナリのビルド)

デフォルトでは、Kotlin/Native ターゲットは `*.klib` ライブラリアーティファクトにコンパイルされます。これは Kotlin/Native 自体から依存関係として利用できますが、実行したりネイティブライブラリとして使用したりすることはできません。

実行可能ファイルや共有ライブラリなどの最終的なネイティブバイナリを宣言するには、ネイティブターゲットの `binaries` プロパティを使用します。このプロパティは、デフォルトの `*.klib` アーティファクトに加えて、このターゲット向けにビルドされるネイティブバイナリのコレクションを表し、それらを宣言および設定するための一連のメソッドを提供します。

> `kotlin-multiplatform` プラグインは、デフォルトでは本番用バイナリを一切作成しません。デフォルトで利用可能な唯一のバイナリは、`test` コンパイルから単体テストを実行できるようにするデバッグ用テスト実行ファイルです。
>
{style="note"}

Kotlin/Native コンパイラによって生成されるバイナリには、サードパーティのコード、データ、または派生物が含まれる場合があります。これは、Kotlin/Native でコンパイルされた最終バイナリを配布する場合、バイナリ配布物に常に必要な[ライセンスファイル](https://kotlinlang.org/docs/native-binary-licenses.html)を含める必要があることを意味します。

## バイナリの宣言 {id="declare-binaries"}

`binaries` コレクションの要素を宣言するには、以下のファクトリメソッドを使用します。

| ファクトリメソッド | バイナリ種別 | 利用可能なターゲット |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | プロダクト実行可能ファイル | すべてのネイティブターゲット |
| `test`         | テスト実行可能ファイル | すべてのネイティブターゲット |
| `sharedLib`    | 共有ネイティブライブラリ | すべてのネイティブターゲット |
| `staticLib`    | 静的ネイティブライブラリ | すべてのネイティブターゲット |
| `framework`    | Objective-C フレームワーク | macOS、iOS、watchOS、tvOS ターゲットのみ |

最も単純なバージョンでは追加のパラメータは必要なく、各ビルドタイプに対して1つのバイナリが作成されます。現在、2つのビルドタイプが利用可能です:

* `DEBUG` – [デバッガツール](https://kotlinlang.org/docs/native-debugging.html)を使用する際に役立つ追加のメタデータを含む、最適化されていないバイナリを生成します
* `RELEASE` – デバッグ情報のない最適化されたバイナリを生成します

以下のスニペットは、debug と release の2つの実行可能バイナリを作成します:

```kotlin
kotlin {
    linuxX64 { // 代わりに独自のターゲットを定義してください。
        binaries {
            executable {
                // バイナリ設定。
            }
        }
    }
}
```

[追加の設定](multiplatform-dsl-reference.md#native-targets)が不要な場合は、ラムダを省略できます:

```kotlin
binaries {
    executable()
}
```

どのビルドタイプに対してバイナリを作成するかを指定できます。次の例では、`debug` 実行可能ファイルのみが作成されます:

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // バイナリ設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // バイナリ設定。
    }
}
```

</TabItem>
</Tabs>

カスタム名を指定してバイナリを宣言することもできます:

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("foo", listOf(DEBUG)) {
        // バイナリ設定。
    }

    // ビルドタイプのリストは省略可能です
    // （この場合、利用可能なすべてのビルドタイプが使用されます）。
    executable("bar") {
        // バイナリ設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // バイナリ設定。
    }

    // ビルドタイプのリストは省略可能です
    // （この場合、利用可能なすべてのビルドタイプが使用されます）。
    executable('bar') {
        // バイナリ設定。
    }
}
```

</TabItem>
</Tabs>

最初の引数は、バイナリファイルのデフォルト名となる名前プレフィックスを設定します。例えば、Windows の場合、このコードは `foo.exe` と `bar.exe` というファイルを生成します。また、この名前プレフィックスを使用して[ビルドスクリプト内でバイナリにアクセス](#access-binaries)することもできます。

## バイナリへのアクセス {id="access-binaries"}

バイナリにアクセスして、[バイナリを設定](multiplatform-dsl-reference.md#native-targets)したり、そのプロパティ（出力ファイルへのパスなど）を取得したりできます。

一意の名前によってバイナリを取得できます。この名前は、`<任意の名前プレフィックス><ビルドタイプ><バイナリ種別>` というパターンに従い、名前プレフィックス（指定されている場合）、ビルドタイプ、およびバイナリ種別に基づきます（例: `releaseFramework` や `testDebugExecutable`）。

> 静的ライブラリおよび共有ライブラリには、それぞれ static および shared というサフィックスが付きます（例: `fooDebugStatic` や `barReleaseShared`）。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// そのようなバイナリが存在しない場合は失敗します。
binaries["fooDebugExecutable"]
binaries.getByName("fooDebugExecutable")

// そのようなバイナリが存在しない場合は null を返します。
binaries.findByName("fooDebugExecutable")
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// そのようなバイナリが存在しない場合は失敗します。
binaries['fooDebugExecutable']
binaries.fooDebugExecutable
binaries.getByName('fooDebugExecutable')

// そのようなバイナリが存在しない場合は null を返します。
binaries.findByName('fooDebugExecutable')
```

</TabItem>
</Tabs>

あるいは、型付けされたゲッターを使用して、名前プレフィックスとビルドタイプによってバイナリにアクセスすることもできます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// そのようなバイナリが存在しない場合は失敗します。
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 名前プレフィックスが設定されていない場合は、最初の引数を省略します。
binaries.getExecutable("bar", "DEBUG") // ビルドタイプには文字列を使用することもできます。

// 他のバイナリ種別に対しても同様のゲッターが利用可能です:
// getFramework、getStaticLib、getSharedLib。

// そのようなバイナリが存在しない場合は null を返します。
binaries.findExecutable("foo", DEBUG)

// 他のバイナリ種別に対しても同様のゲッターが利用可能です:
// findFramework、findStaticLib、findSharedLib。
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// そのようなバイナリが存在しない場合は失敗します。
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 名前プレフィックスが設定されていない場合は、最初の引数を省略します。
binaries.getExecutable('bar', 'DEBUG') // ビルドタイプには文字列を使用することもできます。

// 他のバイナリ種別に対しても同様のゲッターが利用可能です:
// getFramework、getStaticLib、getSharedLib。

// そのようなバイナリが存在しない場合は null を返します。
binaries.findExecutable('foo', DEBUG)

// 他のバイナリ種別に対しても同様のゲッターが利用可能です:
// findFramework、findStaticLib、findSharedLib。
```

</TabItem>
</Tabs>

## バイナリへの依存関係のエクスポート {id="export-dependencies-to-binaries"}

Objective-C フレームワークやネイティブライブラリ（共有または静的）をビルドする際、現在のプロジェクトのクラスだけでなく、その依存関係のクラスもパックする必要がある場合があります。`export` メソッドを使用して、バイナリにエクスポートする依存関係を指定します。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // エクスポートされます。
            api(project(":dependency"))
            api("org.example:exported-library:1.0")
            // エクスポートされません。
            api("org.example:not-exported-library:1.0")
        }
    }
    macosArm64("macos").binaries {
        framework {
            export(project(":dependency"))
            export("org.example:exported-library:1.0")
        }
        sharedLib {
            // 異なるバイナリに対して異なる依存関係のセットをエクスポートすることが可能です。
            export(project(':dependency'))
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
        macosMain.dependencies {
            // エクスポートされます。
            api project(':dependency')
            api 'org.example:exported-library:1.0'
            // エクスポートされません。
            api 'org.example:not-exported-library:1.0'
        }
    }
    macosArm64("macos").binaries {
        framework {
            export project(':dependency')
            export 'org.example:exported-library:1.0'
        }
        sharedLib {
            // 異なるバイナリに対して異なる依存関係のセットをエクスポートすることが可能です。
            export project(':dependency')
        }
    }
}
```

</TabItem>
</Tabs>

例えば、Kotlin で複数のモジュールを実装し、それらに Swift からアクセスしたいとします。Swift アプリケーションで複数の Kotlin/Native フレームワークを使用することには制限がありますが、アンブレラフレームワークを作成して、これらすべてのモジュールをそこにエクスポートすることができます。

> エクスポートできるのは、対応するソースセットの [`api` 依存関係](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)のみです。
>
{style="note"}

依存関係をエクスポートすると、そのすべての API がフレームワーク API に含まれます。そのごく一部しか使用していない場合でも、コンパイラはその依存関係のコードをフレームワークに追加します。これにより、エクスポートされた依存関係（およびある程度はその依存関係）に対するデッドコードの削除（dead code elimination）が無効化されます。

デフォルトでは、エクスポートは非推移的に動作します。つまり、ライブラリ `bar` に依存しているライブラリ `foo` をエクスポートした場合、出力されるフレームワークに追加されるのは `foo` のメソッドのみです。

`transitiveExport` オプションを使用すると、この動作を変更できます。`true` に設定すると、ライブラリ `bar` の宣言もエクスポートされます。

> `transitiveExport` の使用は推奨されません。エクスポートされた依存関係のすべての推移的依存関係がフレームワークに追加されるためです。これにより、コンパイル時間とバイナリサイズの両方が増加する可能性があります。
>
> ほとんどの場合、これらすべての依存関係をフレームワーク API に追加する必要はありません。Swift や Objective-C のコードから直接アクセスする必要がある依存関係に対してのみ、明示的に `export` を使用してください。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    framework {
        export(project(":dependency"))
        // 推移的にエクスポートします。
        transitiveExport = true
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    framework {
        export project(':dependency')
        // 推移的にエクスポートします。
        transitiveExport = true
    }
}
```

</TabItem>
</Tabs>

## ユニバーサルフレームワークのビルド {id="build-universal-frameworks"}

デフォルトでは、Kotlin/Native によって生成される Objective-C フレームワークは単一のプラットフォームしかサポートしません。しかし、[`lipo` ツール](https://llvm.org/docs/CommandGuide/llvm-lipo.html)を使用することで、そのようなフレームワークを単一のユニバーサル（fat）バイナリにマージできます。この操作は、特に 32 ビットおよび 64 ビットの iOS フレームワークにとって有用です。この場合、生成されたユニバーサルフレームワークを 32 ビットと 64 ビットの両方のデバイスで使用できます。

> fat フレームワークは、元のフレームワークと同じベース名（base name）を持つ必要があります。そうでない場合、エラーが発生します。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // ターゲットを作成して設定します。
    val watchos32 = watchosArm32("watchos32")
    val watchos64 = watchosArm64("watchos64")
    configure(listOf(watchos32, watchos64)) {
        binaries.framework {
            baseName = "MyFramework"
        }
    }
    // fat フレームワークをビルドするタスクを作成します。
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // fat フレームワークは、元のフレームワークと同じベース名を持つ必要があります。
        baseName = "MyFramework"
        // デフォルトの出力先ディレクトリは "<build directory>/fat-framework" です。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // マージするフレームワークを指定します。
        from(
            watchos32.binaries.getFramework("DEBUG"),
            watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // ターゲットを作成して設定します。
    targets {
        watchosArm32("watchos32")
        watchosArm64("watchos64")
        configure([watchos32, watchos64]) {
            binaries.framework {
                baseName = "MyFramework"
            }
        }
    }
    // fat フレームワークをビルドするタスクを作成します。
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // fat フレームワークは、元のフレームワークと同じベース名を持つ必要があります。
        baseName = "MyFramework"
        // デフォルトの出力先ディレクトリは "<build directory>/fat-framework" です。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // マージするフレームワークを指定します。
        from(
            targets.watchos32.binaries.getFramework("DEBUG"),
            targets.watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
</Tabs>

## XCFramework のビルド {id="build-xcframeworks"}

すべての Kotlin Multiplatform プロジェクトは、すべてのターゲットプラットフォームおよびアーキテクチャ向けのロジックを単一のバンドルにまとめるための出力として XCFramework を使用できます。[ユニバーサル（fat）フレームワーク](#build-universal-frameworks)とは異なり、App Store にアプリケーションを公開する前に不要なアーキテクチャをすべて削除する必要はありません。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}

kotlin {
    val xcf = XCFramework()
    val iosTargets = listOf(iosArm64(), iosSimulatorArm64())
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = "shared"
            xcf.add(this)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFrameworkConfig

plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}

kotlin {
    def xcf = new XCFrameworkConfig(project)
    def iosTargets = [iosArm64(), iosSimulatorArm64()]
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = 'shared'
            xcf.add(it)
        }
    }
}
```

</TabItem>
</Tabs>

XCFramework を宣言すると、Kotlin Gradle プラグインはいくつかの Gradle タスクを登録します:

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

<a id="build-frameworks"></a>

プロジェクトで [CocoaPods の統合](multiplatform-cocoapods-overview.md)を使用している場合は、Kotlin CocoaPods Gradle プラグインを使用して XCFramework をビルドできます。これには、登録されているすべてのターゲットで XCFramework をビルドし、podspec ファイルを生成する以下のタスクが含まれています:

* `podPublishReleaseXCFramework`: release XCFramework を podspec ファイルとともに生成します。
* `podPublishDebugXCFramework`: debug XCFramework を podspec ファイルとともに生成します。
* `podPublishXCFramework`: debug および release の両方の XCFramework を podspec ファイルとともに生成します。

これにより、プロジェクトの共有部分を CocoaPods 経由でモバイルアプリとは別に配布するのに役立ちます。また、プライベートまたはパブリックの podspec リポジトリへの公開にも XCFramework を使用できます。

> 異なるバージョンの Kotlin 向けにビルドされた Kotlin フレームワークをパブリックリポジトリに公開することは推奨されません。エンドユーザーのプロジェクトで競合が発生する可能性があります。
>
{style="warning"}

## Info.plist ファイルのカスタマイズ {id="customize-the-info-plist-file"}

フレームワークを生成する際、Kotlin/Native コンパイラは情報プロパティリストファイルである `Info.plist` を生成します。対応するバイナリオプションを使用して、そのプロパティをカスタマイズできます:

| プロパティ | バイナリオプション |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

この機能を有効にするには、`-Xbinary=$option=$value` コンパイラフラグを渡すか、特定のフレームワークに対して `binaryOption("option", "value")` Gradle DSL を設定します:

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```