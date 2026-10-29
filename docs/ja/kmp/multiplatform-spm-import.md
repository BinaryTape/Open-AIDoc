[//]: # (title: SwiftパッケージをKMPモジュールの依存関係として追加する)
<primary-label ref="alpha"/>

<tldr>
   <p>Swift Package Manager (SwiftPM) は CocoaPods と同じ役割を果たします。これにより、iOS アプリのネイティブ iOS 依存関係を透過的にオーケストレート（管理）できます。</p>
   <p>ここでは、KMP プロジェクトで SwiftPM 依存関係をセットアップする方法と、必要に応じて KMP のセットアップを CocoaPods から SwiftPM へ移行する方法について説明します。</p>
</tldr>

> この機能は [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) です。
> 発生した問題やフィードバックは、専用の Kotlin Slack チャンネル [#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C) で共有してください。
>
{style="note"}

SwiftPM インポート統合を備えた Kotlin Gradle プラグインを使用すると、Apple ターゲットに対して宣言された SwiftPM 依存関係を使用して、Objective-C および Swift コードから Objective-C API をインポートできます。

推移的依存関係（SwiftPM インポートを使用するプロジェクトに依存するプロジェクト）の場合、Kotlin Gradle プラグインは SwiftPM 依存関係から必要なマシンコードを自動的に提供します。
例えば、Kotlin/Native テストの実行やフレームワークのリンク時に、追加の設定を行う必要はありません。

> SwiftPM インポートを使用する KMP モジュール自体を Swift パッケージとして [エクスポート](multiplatform-spm-export.md) することは、まだサポートされておらず、動作しない可能性があります。
> 詳細については、こちらの [YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-84420) を参照し、あなたのユースケースについてお知らせください。
>
{style="note"}

プロジェクトを構成するには：

1. [開発環境のセットアップ](#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [KMP モジュールでの SwiftPM 依存関係の追加と使用](#add-and-use-swiftpm-dependencies)

## Kotlin Multiplatform Gradle プラグインのバージョン設定 {id="set-the-kotlin-multiplatform-gradle-plugin-version"}

SwiftPM インポート機能を試すには、Kotlin Multiplatform Gradle プラグインの **%kotlinEapVersion%** バージョンを使用していることを確認してください。
`gradle/libs.versions.toml` ファイルの例：

```toml
[versions]
kotlin = "%kotlinEapVersion%"

[plugins]
kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
```

## SwiftPM 依存関係の追加と使用 {id="add-and-use-swiftpm-dependencies"}

> 動作する例については、サンプルプロジェクトを参照してください。
> `master` ブランチでは各プロジェクトは CocoaPods を使用してセットアップされていますが、`spm_import` ブランチでは SwiftPM を使用しています。
> 
> * [SwiftUI と Firebase のサンプルアプリ](https://github.com/Kotlin/kmp-with-cocoapods-firebase-sample/tree/spm_import)
> * [Compose Multiplatform iOS サンプルアプリ](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/tree/spm_import)
>
{type="tip"}

### ビルドの構成 {id="configure-the-build"}

特定の SwiftPM 依存関係は、Apple ターゲットが宣言されている `build.gradle.kts` ファイルの `swiftPMDependencies {}` ブロックに追加できます。
例えば、Firebase の場合は以下のようになります。

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()

    swiftPMDependencies {
        // FirebaseAnalytics を Kotlin コードにインポートする
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(product("FirebaseAnalytics")),
        )
        // swift-protobuf は Firebase の推移的依存関係であるため、
        // 特定のバージョンを使用したい場合にのみ
        // 含める必要があります
        swiftPackage(
            url = url("https://github.com/apple/swift-protobuf.git"),
            version = exact("1.32.0"),
            products = listOf(),
        )
    }
}
```

SwiftPM 統合は Clang モジュールのインポートに基づいています。
デフォルトでは、インポートメカニズムは指定された Swift パッケージ内の Clang モジュールを自動的に検出し、利用可能なすべてのモジュールを Kotlin コードからアクセス可能にします。これは Swift や Objective-C における API の可視性の仕組みに似ています。
<!-- TODO link to where it is explained? -->

デフォルトの動作と自動的なモジュール検出を無効にするには、`discoverClangModulesImplicitly` を `false` に設定します。
モジュール検出が無効な場合、SwiftPM インポートはプロダクト名を Clang モジュール名として使用します。

プロダクト名と異なる名前の Clang モジュールをインポートするには、`importedClangModules` パラメーターを使用します。例：

```kotlin
kotlin {
    swiftPMDependencies {
        // 'discoverClangModulesImplicitly' が 'true' に設定されている場合、
        // 以下の 'importedClangModules' パラメーターは無視されます
        discoverClangModulesImplicitly = false

        // インポートされるパッケージ、そのプロダクト、および Clang モジュール
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(
                product("FirebaseAnalytics"),
                product("FirebaseFirestore")
            ),
            importedClangModules = listOf(
                "FirebaseAnalytics", 
                // FirebaseFirestore の Objective-C API は
                // 'FirebaseFirestoreInternal' Clang モジュールにあります
                "FirebaseFirestoreInternal"
            ),
        )
    }
}
```

### プラットフォーム制約の設定 {id="set-platform-constraints"}

一部の SwiftPM 依存関係は、ビルドスクリプト内のすべてのターゲットに対してコンパイルできなかったり、有効な API を提供できなかったりする場合があります。
例えば、Google Maps SDK は現在 iOS ターゲットのみをサポートしています。

プロジェクトが iOS のみをターゲットとしている場合は、プラットフォームを明示的に宣言する必要はありません。
しかし、macOS などの別のターゲットを追加した場合は、各依存関係に対してプラットフォーム制約を指定する必要があります。

依存関係が関連するコンパイルにのみ適用されるようにするには、`product` 指定の `platforms` パラメーターで正しいターゲットを指定します。

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()
    macosArm64()

    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/googlemaps/ios-maps-sdk.git"),
            version = exact("10.3.0"),
            products = listOf(
                product(
                    "GoogleMaps", 
                    platforms = setOf(
                        // `GoogleMaps` パッケージは
                        // iOS のコンパイルに対してのみ可視になります
                        iOS()
                    )
                )
            )
        ) 
    }
}
```

### SwiftPM 統合タスクの実行 {id="run-the-swiftpm-integration-task"}

SwiftPM インポートツールは、現在の SwiftPM 依存関係のリストを追跡するための中間パッケージを生成します。
プロジェクトに初めて SwiftPM 依存関係を追加するときは、生成されたパッケージを Xcode プロジェクトにリンクする必要があります。

これを行うには、プロジェクトのディレクトリで以下のコマンドを使用して、専用の Gradle タスクを実行します。

```shell
XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' ./gradlew :kotlin-library:integrateLinkagePackage
```

このコマンドは SwiftPM パッケージを生成し、Xcode プロジェクトに必要な変更を加えます。生成されたパッケージと更新された Xcode プロジェクトは、必ずリポジトリにコミットしてください。

最初の統合後は、SwiftPM 依存関係のセットやそのバージョンを変更するたびに、合成パッケージが自動的に更新されます。

### インポートされた API の使用 {id="use-imported-apis"}

インポートされた Objective-C API は、`swiftPMImport` プレフィックスで始まり、プロジェクトとそのグループの Gradle 名で終わる名前空間に含まれます。

例えば、Kotlin ビルドスクリプトでグループ名を以下のように指定しているとします。

```kotlin
// subproject/build.gradle.kts
group = "groupName"
```

ここで、`groupName` はプロジェクトの Gradle グループ名であり、`subproject` はプロジェクト名です。
これで、そのモジュールの `iosMain` ソースセットで Firebase API をインポートできます。例：

```kotlin
// subproject/src/iosMain/kotlin/useFirebaseAnalytics.kt
import swiftPMImport.groupName.subproject.FIRAnalytics
import swiftPMImport.groupName.subproject.FIRApp
```

## 生成される `Package.resolved` ファイル {id="generated-package-resolved-files"}

Swift パッケージに依存するビルドをより安定させるために、SwiftPM インポートツールは `Package.resolved` ファイルによるロックメカニズムを導入しています。これらは初回のパッケージ解決中に、各サブプロジェクトに対して生成されます。

デフォルトでは、これらのファイルは単一の `Package.resolved` ファイルにマージされ、`.swiftpm-locks/default/swiftImport` ディレクトリ内の合成パッケージ内に配置されます。この共有ロックファイルはプロジェクトのビルドに使用され、すべてのサブプロジェクトが同じバージョンの Swift パッケージを使用することを保証します。サブプロジェクトをグループ化したり、同期から除外したりすることで、[ロックファイルのマージ動作をカスタマイズ](#customize-aggregation-of-swift-package-versions)できます。

すべてのビルドで同じ依存関係が使用されるように、ロックファイルをリポジトリにコミットする必要があります。ファイル管理を簡素化するために、`.swiftpm-locks` ディレクトリ全体をリポジトリにコミットすることもできます。依存関係の同期に不可欠なのは `Package.resolved` ファイルだけですが、ディレクトリ全体を保持することで最初のビルド時の解決プロセスを高速化できます。

ロックファイルは、ビルドスクリプトで SwiftPM 依存関係のセットやバージョンを変更すると自動的に更新されます。
また、[手動でロックファイルの更新を強制する](#force-an-update-of-the-lock-file)こともできます。

### Swift パッケージバージョンの集約設定のカスタマイズ {id="customize-aggregation-of-swift-package-versions"}

すべてのサブプロジェクトに `default` グループを使用する代わりに、カスタムグループを定義して、グループごとに個別の `Package.resolved` ロックファイルを生成できます。

マージの挙動は、`swiftDependencies {}` ブロックの `packageResolvedSynchronization` オプションで制御されます。

```kotlin
kotlin {
    swiftDependencies {
        // `packageResolvedSynchronization` に値が設定されていない場合、
        // サブプロジェクトには以下のように設定された場合と同様に
        // デフォルトのグループ識別子が割り当てられます：
        // packageResolvedSynchronization = identifier("default")
    }
}
```

マージの挙動をカスタマイズするには、各サブプロジェクトにデフォルト以外のグループ識別子を割り当てます。
以下の例では、サブプロジェクト `one` と `two` は同じ `custom` パッケージバージョンのセットを使用し、サブプロジェクト `three` はデフォルトのセットを使用します。

<Tabs>
<TabItem title="サブプロジェクト &quot;one&quot;">

```kotlin
// one/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```
</TabItem>

<TabItem title="サブプロジェクト &quot;two&quot;">

```kotlin
// two/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```

</TabItem>

<TabItem title="サブプロジェクト &quot;three&quot;">

```kotlin
// three/build.gradle.kts

kotlin {
    swiftDependencies {
        // 以下が設定されている場合と同様に、デフォルトの識別子が使用されます：
        // packageResolvedSynchronization = identifier("default")
        ...
    }
}
```

</TabItem>

</Tabs>

サブプロジェクトの同期メカニズムを完全に無効にしたい場合は、`identifier()` の代わりに `noSynchronization()` 呼び出しを使用します。

```kotlin
kotlin {
    swiftDependencies { 
        // このサブプロジェクトの Package.resolved ファイルは
        // 他のファイルとマージされません
        packageResolvedSynchronization = noSynchronization()
    }
}
```

同期が無効化されたサブプロジェクトは、独自の `Package.resolved` ロックファイルを保持し、それはサブプロジェクトディレクトリ内の `build.gradle.kts` ファイルの隣に配置されます。

デフォルトの同期の場合と同様に、カスタマイズされたサブプロジェクトのすべての `Package.resolved` ファイルをリポジトリにコミットする必要があります。

### ロックファイルの手動更新 {id="force-an-update-of-the-lock-file"}

ロックファイルを手動で強制的に更新したい場合は：

1. ロックファイルを更新する必要があるすべてのサブプロジェクトの `build` ディレクトリを削除します。
2. 既存の `Package.resolved` ファイルを削除します。
   * 特定の同期設定がないサブプロジェクトの場合は、`.swiftpm-locks/default/` ディレクトリを削除します。
   * [カスタム同期グループ](#customize-aggregation-of-swift-package-versions)を持つサブプロジェクトの場合は、`.swiftpm-locks/<group-name>/` ディレクトリを探して削除します。
   * `noSynchronization()` が設定されているサブプロジェクトの場合は、サブプロジェクトディレクトリ内の `Package.resolved` ファイルを探して削除します。
3. 依存関係解決タスクを再度実行します： `./gradlew :yourModuleName:fetchSyntheticImportProjectPackages`。

## 追加のインポートオプション {id="additional-import-options"}

### ローカル Swift パッケージのインポート {id="importing-local-swift-packages"}

SwiftPM インポートメカニズムでは、ローカルファイルシステムからの Swift パッケージのインポートも可能です。

`/path/to/ExamplePackage` ディレクトリに配置された、以下のマニフェストを持つ Swift パッケージを考えてみましょう。

```swift
// /path/to/ExamplePackage/Package.swift
let package = Package(
  name: "ExamplePackage",
  platforms: [.iOS("15.0")],
  products: [
    .library(name: "ExamplePackage", targets: ["ExamplePackage"]),
  ],
  dependencies: [
    .package(url: "https://github.com/grpc/grpc-swift.git", exact: "1.27.0",),
  ],
  targets: [
    // このターゲットは @objc API を持つ Swift または Objective-C で実装可能です
    .target(name: "ExamplePackage", dependencies: [.product(name: "GRPC", package: "grpc-swift")]),
  ]
)
```
{collapsible="true" collapsed-title-line-number="3"}

これを Kotlin ビルドスクリプトにインポートするには、`localSwiftPackage` API を使用します。

```kotlin
// <projectDir>/shared/build.gradle.kts
kotlin {
    swiftPMDependencies {
        localSwiftPackage(
            directory = project.layout.projectDirectory.dir("/path/to/ExamplePackage/"),
            products = listOf("ExamplePackage")
        )
    }
}
```

Gradle ファイルを同期して SwiftPM インポートを実行し、インポートされた API を Kotlin コードで使用します。

```kotlin
// /path/to/shared/src/appleMain/kotlin/useExamplePackage.kt

@OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
fun useExamplePackage() {
    // Swift パッケージが正常にインポートされている場合、
    // IDE はクラスの正しいインポートを提案します
    HelloFromExamplePackage().hello()
}
```

### 特定のデプロイメントターゲット {id="specific-deployment-versions"}

依存関係により高い[デプロイメントバージョン（deployment version）](https://developer.apple.com/documentation/packagedescription/supportedplatform)が必要な場合は、`*MinimumDeploymentTarget` パラメーターで指定します。例えば、iOS の場合は以下のようになります。

```kotlin
kotlin {
    swiftPMDependencies {
        iosMinimumDeploymentTarget.set("16.0")
    }
}
```

### Swift パッケージの場所とバージョン {id="location-and-version-of-swift-packages"}

`Package.swift` マニフェストファイルと同様に、`swiftPackage()` 呼び出しで Swift パッケージの場所とバージョンを指定できます。それぞれに、いくつか排他的なオプションがあります。

場所を設定するには、URL または [SwiftPM レジストリ ID](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/usingswiftpackageregistry) を使用できます。

```kotlin
swiftPackage(
    // オプション 1: URL 文字列
    // パッケージの Git リポジトリを指します
    url = url("https://github.com/firebase/firebase-ios-sdk.git")

    // オプション 2: Swift パッケージレジストリ ID
    // 上記リンクのパッケージレジストリの使用に関する Apple のドキュメントを参照してください  
    repository = id("...")
)
```

バージョンを指定するには、以下の Gradle スタイルおよび Git スタイルのバージョン指定を使用します。

```kotlin
swiftPackage(
    // Gradle の 'require' バージョン制約と同様に、
    // 指定されたバージョンから開始します
    version = from("1.0")

    // Gradle の 'strict' バージョン制約と同様に、
    // 指定されたバージョンと正確に一致させます
    version = exact("2.0")

    // Git 特有のバージョン指定で、
    // 指定されたブランチまたはリビジョンに一致させます
    version = branch("master")
    // または
    version = revision("e74b07278b926c9ec6f9643455ea00d1ce04a021")
)
```

## 動的な Kotlin/Native フレームワークに関する既知の制限 {id="known-limitations-with-dynamic-kotlin-native-frameworks"}

現在、SwiftPM インポート統合は、動的な Kotlin/Native フレームワークを生成する際に発生する可能性のあるすべてのエッジケースをサポートしているわけではありません。Xcode でのビルド中に問題が発生したり、実行時に警告が表示されたりすることがあります。例：

* `Undefined symbols for architecture ...: "...", referenced from: ld: symbol(s) not found ...`
* `dyld: Symbol not found: ...`
* `objc[...]: Class _Foo is implemented in both /path/to/Shared and /path/to/Bar. This may cause spurious casting failures and mysterious crashes. One of the duplicates must be removed or renamed.`

これらの問題の一般的な解決策は、`isStatic` プロパティを `true` に設定してフレームワークのリンクモードを変更することです。

```kotlin
// shared/build.gradle.kts
kotlin {
    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"

            // このプロパティを "true" に設定します
            isStatic = true
        }
    }
}
```

これらの問題のいずれかに遭遇した場合、`isStatic=false` を維持する必要がある場合、またはこのプロパティを変更してもビルドの失敗が解決しなかった場合は、Slack チャンネルでお知らせください。[招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を取得して、[#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C) に参加してください。

## 次のステップ {id="what-s-next"}

[KMP プロジェクトで CocoaPods から SwiftPM 依存関係に切り替える方法](multiplatform-cocoapods-spm-migration.md)について詳細を学びましょう。