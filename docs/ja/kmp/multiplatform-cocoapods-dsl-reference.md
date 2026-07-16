[//]: # (title: CocoaPods Gradle プラグイン DSL リファレンス)

<tldr>

* Pod 依存関係を追加する前に、[初期設定を完了](multiplatform-cocoapods-overview.md#set-up-an-environment-to-work-with-cocoapods)してください。
* [Kotlin プロジェクトでさまざまな Pod 依存関係をセットアップした](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample) サンプルプロジェクトを参照してください。
* [複数のターゲットを持つ Xcode プロジェクトが Kotlin ライブラリに依存している](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample) サンプルプロジェクトを確認してください。

</tldr>
<show-structure for="chapter,procedure" depth="2"/>

Kotlin CocoaPods Gradle プラグインは、Podspec ファイルを作成するためのツールです。これらのファイルは、Kotlin プロジェクトを [CocoaPods 依存関係マネージャー](https://cocoapods.org/) と統合するために必要です。

この DSL リファレンスでは、CocoaPods の統合をセットアップする際に使用できる Kotlin CocoaPods Gradle プラグインの主なブロック、関数、プロパティをリストしています。

## プラグインを有効にする

CocoaPods プラグインを適用するには、`build.gradle(.kts)` ファイルに以下の行を追加します。

```kotlin
plugins {
   kotlin("multiplatform") version "%kotlinVersion%"
   kotlin("native.cocoapods") version "%kotlinVersion%"
}
```

プラグインのバージョンは [Kotlin のリリースバージョン](https://kotlinlang.org/docs/releases.html) と一致します。最新の安定版は %kotlinVersion% です。

## `cocoapods {}` ブロック

`cocoapods {}` ブロックは、CocoaPods 設定のトップレベルブロックです。これには、Pod のバージョン、サマリー、ホームページなどの必須情報や、オプション機能を含む Pod の全般的な情報が含まれます。

その中では以下のブロック、関数、プロパティを使用できます。

| **名前** | **説明** | 
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version` | Pod のバージョン。指定しない場合、Gradle プロジェクトのバージョンが使用されます。どちらのプロパティも設定されていない場合はエラーになります。 |
| `summary` | このプロジェクトからビルドされる Pod の必須の説明。 |
| `homepage` | このプロジェクトからビルドされる Pod のホームページへの必須のリンク。 |
| `authors` | このプロジェクトからビルドされる Pod の作成者を指定します。 |
| `podfile` | 既存の Podfile を設定します。 |
| `noPodspec()` | `cocoapods` セクションに対して Podspec ファイルを生成しないようにプラグインを設定します。 |
| `name` | このプロジェクトからビルドされる Pod の名前。指定されない場合は、プロジェクト名が使用されます。 |
| `license` | このプロジェクトからビルドされる Pod のライセンス、そのタイプ、およびテキスト。 |
| `framework` | framework ブロックは、プラグインによって生成されるフレームワークを設定します。 |
| `source` | このプロジェクトからビルドされる Pod の場所。 |
| `extraSpecAttributes` | `libraries` や `vendored_frameworks` などの他の Podspec 属性を設定します。 |
| `xcodeConfigurationToNativeBuildType` | カスタムの Xcode 設定を NativeBuildType にマッピングします。"Debug" を `NativeBuildType.DEBUG` に、"Release" を `NativeBuildType.RELEASE` にマッピングします。 |
| `publishDir` | Pod 公開用の出力ディレクトリを設定します。 |
| `pods` | Pod 依存関係のリストを返します。 |
| `pod()` | このプロジェクトからビルドされる Pod に CocoaPods 依存関係を追加します。 |
| `specRepos` | `url()` を使用して仕様リポジトリ（specification repository）を追加します。これは、プライベートな Pod を依存関係として使用する場合に必要です。詳細は [CocoaPods のドキュメント](https://guides.cocoapods.org/making/private-cocoapods.html) を参照してください。 |

### ターゲット

| iOS | macOS | tvOS | watchOS |
|---------------------|--------------|----------------------|-------------------------|
| `iosArm64` | `macosArm64` | `tvosArm64` | `watchosArm64` |
| `iosSimulatorArm64` | | `tvosSimulatorArm64` | `watchosSimulatorArm64` |
| `iosX64` | | | `watchosArm32` |
| | | | `watchosDeviceArm64` |

各ターゲットについて、`deploymentTarget` プロパティを使用して Pod ライブラリの最小ターゲットバージョンを指定します。

適用されると、CocoaPods はすべてのターゲットの出力バイナリとして `debug` と `release` 両方のフレームワークを追加します。

```kotlin
kotlin {
    iosArm64()
   
    cocoapods {
        version = "2.0"
        name = "MyCocoaPod"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        license = "{ :type => 'MIT', :text => 'License text'}"
        source = "{ :git => 'git@github.com:vkormushkin/kmmpodlibrary.git', :tag => '$version' }"
        authors = "Kotlin Dev"
        
        specRepos {
            url("https://github.com/Kotlin/kotlin-cocoapods-spec.git")
        }
        pod("example")
        
        xcodeConfigurationToNativeBuildType["CUSTOM_RELEASE"] = NativeBuildType.RELEASE
   }
}
```

### `framework {}` ブロック

`framework {}` ブロックは `cocoapods` 内にネストされ、プロジェクトからビルドされる Pod のフレームワークプロパティを設定します。

> `baseName` は必須フィールドであることに注意してください。
>
{style="note"}

| **名前** | **説明** | 
|--------------------|-----------------------------------------------------------------------------------------|
| `baseName` | 必須のフレームワーク名。非推奨の `frameworkName` の代わりにこのプロパティを使用してください。 |
| `isStatic` | フレームワークのリンクタイプを定義します。デフォルトでは動的（dynamic）です。 |
| `transitiveExport` | 依存関係のエクスポートを有効にします。 |

```kotlin
kotlin {
    cocoapods {
        version = "2.0"
        framework {
            baseName = "MyFramework"
            isStatic = false
            export(project(":anotherKMMModule"))
            transitiveExport = true
        }
    }
}
```

## `pod()` 関数

`pod()` 関数の呼び出しは、このプロジェクトからビルドされる Pod に CocoaPods 依存関係を追加します。依存関係ごとに個別の関数呼び出しが必要です。

関数パラメータで Pod ライブラリの名前を指定し、その設定ブロックでライブラリの `version` や `source` などの追加のパラメータ値を指定できます。

| **名前** | **説明** | 
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version` | ライブラリのバージョン。ライブラリの最新バージョンを使用するには、パラメータを省略します。 |
| `source` | Pod の取得元を設定します：<list><li>`git()` を使用した Git リポジトリ。`git()` の後のブロックで、特定のコミットを使用するための `commit`、特定のタグを使用するための `tag`、リポジトリの特定のブランチを使用するための `branch` を指定できます。</li><li>`path()` を使用したローカルリポジトリ</li></list> |
| `packageName` | パッケージ名を指定します。 |
| `extraOpts` | Pod ライブラリのオプションのリストを指定します。例えば、特定のフラグなどです：<code-block lang="Kotlin" code="extraOpts = listOf(&quot;-compiler-option&quot;)"></code-block> |
| `linkOnly` | cinterop バインディングを生成せずに、動的フレームワークを持つ Pod 依存関係を使用するように CocoaPods プラグインに指示します。静的フレームワークで使用された場合、このオプションは Pod 依存関係を完全に削除します。 |
| `interopBindingDependencies` | 他の Pod への依存関係のリストが含まれます。このリストは、新しい Pod 用の Kotlin バインディングをビルドするときに使用されます。 |
| `useInteropBindingFrom()` | 依存関係として使用される既存の Pod の名前を指定します。この Pod は、この関数の実行前に宣言されている必要があります。この関数は、新しい Pod のバインディングをビルドするときに、既存の Pod の Kotlin バインディングを使用するように CocoaPods プラグインに指示します。 |

```kotlin
kotlin {
    iosArm64()
    
    cocoapods {
        version = "2.0"
        summary = "CocoaPods test library"
        homepage = "https://github.com/JetBrains/kotlin"
        ios.deploymentTarget = "16.0"
      
        pod("pod_dependency") {
            version = "1.0"
            extraOpts += listOf("-compiler-option")
            linkOnly = true
            source = path(project.file("../pod_dependency"))
        }
    }
}
```

## 次のステップ

* [Kotlin Gradle プラグインのリポジトリで Kotlin DSL の完全な構文を確認する](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/targets/native/cocoapods/CocoapodsExtension.kt)
* [Kotlin プロジェクトに Pod ライブラリへの依存関係を追加する](multiplatform-cocoapods-libraries.md)
* [Kotlin プロジェクトと Xcode プロジェクト間の依存関係をセットアップする](multiplatform-cocoapods-xcode.md)