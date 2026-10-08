[//]: # (title: 最終的なネイティブバイナリのビルド)

デフォルトでは、Kotlin/Native ターゲットは `*.klib` ライブラリアーティファクトにコンパイルされます。これは Kotlin/Native 自体から依存関係として利用できますが、実行したりネイティブライブラリとして使用したりすることはできません。

実行可能ファイルや共有ライブラリなどの最終的なネイティブバイナリを宣言するには、ネイティブターゲットの `binaries` プロパティを使用します。このプロパティは、デフォルトの `*.klib` アーティファクトに加えて、このターゲット用にビルドされるネイティブバイナリのコレクションを表し、それらを宣言および設定するための一連のメソッドを提供します。

> `kotlin-multiplatform` プラグインは、デフォルトでは製品版（production）のバイナリを作成しません。デフォルトで利用可能な唯一のバイナリは、`test` コンパイルからユニットテストを実行するためのデバッグテスト実行可能ファイルです。
>
{style="note"}

Kotlin/Native コンパイラによって生成されるバイナリには、サードパーティのコード、データ、または派生物が含まれる場合があります。つまり、Kotlin/Native でコンパイルされた最終的なバイナリを配布する場合は、バイナリ配布物に常に必要な [ライセンスファイル](https://kotlinlang.org/docs/native-binary-licenses.html) を含める必要があります。

## バイナリの宣言 {id="declare-binaries"}

`binaries` コレクションの要素を宣言するには、以下のファクトリメソッドを使用します。

| ファクトリメソッド | バイナリの種類 | 利用可能なターゲット |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | 製品実行可能ファイル | すべてのネイティブターゲット |
| `test`         | テスト実行可能ファイル | すべてのネイティブターゲット |
| `sharedLib`    | 共有ネイティブライブラリ | すべてのネイティブターゲット |
| `staticLib`    | 静的ネイティブライブラリ | すべてのネイティブターゲット |
| `framework`    | Objective-C フレームワーク | macOS、iOS、watchOS、および tvOS ターゲットのみ |

最もシンプルな形式では追加のパラメータを必要とせず、ビルドタイプごとに1つのバイナリを作成します。現在、2つのビルドタイプが利用可能です：

* `DEBUG` – [デバッガツール](https://kotlinlang.org/docs/native-debugging.html) を使用する際に役立つ追加のメタデータを含む、最適化されていないバイナリを生成します。
* `RELEASE` – デバッグ情報を含まない、最適化されたバイナリを生成します。

次のスニペットは、デバッグとリリースの2つの実行可能バイナリを作成します。

```kotlin
kotlin {
    linuxX64 { // 代わりに自身のターゲットを定義してください。
        binaries {
            executable {
                // バイナリの設定。
            }
        }
    }
}
```

[追加の設定](multiplatform-dsl-reference.md#native-targets) が不要な場合は、ラムダを省略できます：

```kotlin
binaries {
    executable()
}
```

バイナリを作成するビルドタイプを指定することもできます。次の例では、`debug` 実行可能ファイルのみが作成されます：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // バイナリの設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // バイナリの設定。
    }
}
```

</TabItem>
</Tabs>

また、カスタム名を使用してバイナリを宣言することもできます：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("foo", listOf(DEBUG)) {
        // バイナリの設定。
    }

    // ビルドタイプのリストを省略することも可能です
    //（この場合、利用可能なすべてのビルドタイプが使用されます）。
    executable("bar") {
        // バイナリの設定。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // バイナリの設定。
    }

    // ビルドタイプのリストを省略することも可能です
    //（この場合、利用可能なすべてのビルドタイプが使用されます）。
    executable('bar') {
        // バイナリの設定。
    }
}
```

</TabItem>
</Tabs>

最初の引数は名前のプレフィックスを設定し、これがバイナリファイルのデフォルト名になります。例えば、Windows の場合、このコードは `foo.exe` と `bar.exe` というファイルを生成します。また、この名前のプレフィックスを使用して、[ビルドスクリプト内でバイナリにアクセス](#access-binaries) することもできます。

## バイナリへのアクセス {id="access-binaries"}

バイナリにアクセスして [設定](multiplatform-dsl-reference.md#native-targets) を行ったり、プロパティ（出力ファイルへのパスなど）を取得したりできます。

バイナリは一意の名前で取得できます。この名前は、名前のプレフィックス（指定されている場合）、ビルドタイプ、およびバイナリの種類に基づき、`<optional-name-prefix><build-type><binary-kind>` というパターンに従います。例えば、`releaseFramework` や `testDebugExecutable` のようになります。

> 静的ライブラリと共有ライブラリには、それぞれ static と shared というサフィックスが付きます。例えば、`fooDebugStatic` や `barReleaseShared` です。
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

あるいは、型付きゲッターを使用して、名前のプレフィックスとビルドタイプでバイナリにアクセスすることもできます。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// そのようなバイナリが存在しない場合は失敗します。
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 名前のプレフィックスが設定されていない場合は、最初の引数を省略します。
binaries.getExecutable("bar", "DEBUG") // ビルドタイプに文字列を使用することもできます。

// 他のバイナリの種類に対しても同様のゲッターが利用可能です：
// getFramework, getStaticLib, getSharedLib

// そのようなバイナリが存在しない場合は null を返します。
binaries.findExecutable("foo", DEBUG)

// 他のバイナリの種類に対しても同様のゲッターが利用可能です：
// findFramework, findStaticLib, findSharedLib
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// そのようなバイナリが存在しない場合は失敗します。
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 名前のプレフィックスが設定されていない場合は、最初の引数を省略します。
binaries.getExecutable('bar', 'DEBUG') // ビルドタイプに文字列を使用することもできます。

// 他のバイナリの種類に対しても同様のゲッターが利用可能です：
// getFramework, getStaticLib, getSharedLib

// そのようなバイナリが存在しない場合は null を返します。
binaries.findExecutable('foo', DEBUG)

// 他のバイナリの種類に対しても同様のゲッターが利用可能です：
// findFramework, findStaticLib, findSharedLib
```

</TabItem>
</Tabs>

## 依存関係をバイナリにエクスポートする {id="export-dependencies-to-binaries"}

Objective-C フレームワークやネイティブライブラリ（共有または静的）をビルドする際、現在のプロジェクトのクラスだけでなく、その依存関係のクラスもパックする必要がある場合があります。`export` メソッドを使用して、どの依存関係をバイナリにエクスポートするかを指定します。

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
            // 異なるバイナリに異なる依存関係セットをエクスポートすることが可能です。
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
            // 異なるバイナリに異なる依存関係セットをエクスポートすることが可能です。
            export project(':dependency')
        }
    }
}
```

</TabItem>
</Tabs>

例えば、Kotlin で複数のモジュールを実装し、それらに Swift からアクセスしたいとします。Swift アプリケーションで複数の Kotlin/Native フレームワークを使用することには制限がありますが、アンブレラ（umbrella）フレームワークを作成し、これらすべてのモジュールをそこにエクスポートすることができます。

> 対応するソースセットの [`api` 依存関係](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types) のみをエクスポートできます。
>
{style="note"}

依存関係をエクスポートすると、そのすべての API がフレームワークの API に含まれます。コンパイラは、その依存関係のコードの一部しか使用していない場合でも、その依存関係のコードをフレームワークに追加します。これにより、エクスポートされた依存関係（およびある程度はその依存関係）に対してデッドコード削除（DCE）が無効になります。

デフォルトでは、エクスポートは非推移的（non-transitive）に動作します。つまり、ライブラリ `bar` に依存しているライブラリ `foo` をエクスポートした場合、`foo` のメソッドのみが出力フレームワークに追加されます。

この動作は `transitiveExport` オプションを使用して変更できます。`true` に設定すると、ライブラリ `bar` の宣言もエクスポートされます。

> `transitiveExport` の使用は推奨されません。これは、エクスポートされた依存関係のすべての推移的依存関係をフレームワークに追加するためです。これにより、コンパイル時間とバイナリサイズの両方が増加する可能性があります。
>
> ほとんどの場合、これらすべての依存関係をフレームワーク API に追加する必要はありません。Swift または Objective-C コードから直接アクセスする必要がある依存関係に対してのみ、明示的に `export` を使用してください。
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

デフォルトでは、Kotlin/Native によって生成される Objective-C フレームワークは 1 つのプラットフォームのみをサポートします。しかし、[`lipo` ツール](https://llvm.org/docs/CommandGuide/llvm-lipo.html) を使用して、このようなフレームワークを単一のユニバーサル（ファット）バイナリにマージすることができます。この操作は、特に 32 ビットおよび 64 ビットの iOS フレームワークで意味があります。この場合、結果として得られるユニバーサルフレームワークを 32 ビットと 64 ビットの両方のデバイスで使用できます。

> ファットフレームワークは、元のフレームワークと同じベース名（base name）を持つ必要があります。そうでない場合、エラーが発生します。
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
    // ファットフレームワークをビルドするタスクを登録します。
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // ファットフレームワークは元のフレームワークと同じベース名である必要があります。
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
    // ファットフレームワークをビルドするタスクを登録します。
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // ファットフレームワークは元のフレームワークと同じベース名である必要があります。
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

## XCFrameworks のビルド {id="build-xcframeworks"}

すべての Kotlin マルチプラットフォームプロジェクトは、すべてのターゲットプラットフォームとアーキテクチャのロジックを単一のバンドルにまとめる出力として XCFrameworks を使用できます。[ユニバーサル（ファット）フレームワーク](#build-universal-frameworks) とは異なり、アプリケーションを App Store に公開する前に不要なアーキテクチャをすべて削除する必要はありません。

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

XCFrameworks を宣言すると、Kotlin Gradle プラグインはいくつかの Gradle タスクを登録します：

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

undefined

プロジェクトで [CocoaPods 統合](multiplatform-cocoapods-overview.md) を使用している場合は、Kotlin CocoaPods Gradle プラグインを使用して XCFrameworks をビルドできます。これには、登録されたすべてのターゲットで XCFrameworks をビルドし、podspec ファイルを生成する以下のタスクが含まれます：

* `podPublishReleaseXCFramework`: podspec ファイルと共にリリース XCFramework を生成します。
* `podPublishDebugXCFramework`: podspec ファイルと共にデバッグ XCFramework を生成します。
* `podPublishXCFramework`: podspec ファイルと共にデバッグおよびリリース両方の XCFramework を生成します。

これにより、CocoaPods を通じてモバイルアプリとは別にプロジェクトの共通部分を配布するのに役立ちます。また、プライベートまたはパブリックの podspec リポジトリへの公開に XCFrameworks を使用することもできます。

> 異なるバージョンの Kotlin 用にビルドされた Kotlin フレームワークをパブリックリポジトリに公開することは推奨されません。これを行うと、エンドユーザーのプロジェクトで競合が発生する可能性があります。
>
{style="warning"}

## Info.plist ファイルのカスタマイズ {id="customize-the-info-plist-file"}

フレームワークを生成する際、Kotlin/Native コンパイラは情報プロパティリストファイル `Info.plist` を生成します。対応するバイナリオプションを使用して、そのプロパティをカスタマイズできます。

| プロパティ | バイナリオプション |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

この機能を有効にするには、`-Xbinary=$option=$value` コンパイラフラグを渡すか、特定のフレームワークに対して `binaryOption("option", "value")` Gradle DSL を設定します。

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```
