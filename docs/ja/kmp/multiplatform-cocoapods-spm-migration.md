[//]: # (title: Kotlin Multiplatform プロジェクトを CocoaPods から SwiftPM 依存関係に切り替える)
<primary-label ref="Experimental"/>

<tldr>

* CocoaPods Gradle プラグインから SwiftPM に切り替えるには、まず Xcode プロジェクトを再構成する必要があります。
* `main` ブランチで CocoaPods を、`spm-import` ブランチで SwiftPM を使用している以下のサンプルプロジェクトを確認してください：
  * [Firebase サンプル](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)
  * [Compose Multiplatform サンプル](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/)

</tldr>

CocoaPods 依存関係を持つ KMP モジュールがあり、[SwiftPM インポート](multiplatform-spm-import.md)を使用して Swift パッケージに切り替えたい場合は、以下の手順に従ってください：

1. [ビルドスクリプトを更新して、SwiftPM 依存関係と対応する設定を含める](#update-your-build-script)
2. [SwiftPM インポートツールの助けを借りて、直接統合（direct integration）を使用するように Xcode プロジェクトを再構成する](#reconfigure-your-xcode-project)
3. [プロジェクト構造に応じて、CocoaPods 統合を完全または部分的に無効にする](#remove-the-cocoapods-kmp-integration)

> [用意されているスキル](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)を使用して、CocoaPods から SwiftPM への移行をお好みの AI エージェントに任せることができます。
> AI による処理結果は完全に予測可能ではないことに注意してください。
>
{style="note"}

## ビルドスクリプトを更新する

ビルドを更新するには、SwiftPM インポートのページの指示に従ってください：

1. [Kotlin Multiplatform Gradle プラグインのバージョンを **%kotlinEapVersion%** に変更する](multiplatform-spm-import.md#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [CocoaPods プラグインを無効にしたり CocoaPods 依存関係を削除したりせずに、必要な SwiftPM 依存関係を指定する](multiplatform-spm-import.md#add-and-use-swiftpm-dependencies)

例えば、`FirebaseAnalytics` pod を使用している場合：

1. Kotlin Multiplatform Gradle プラグインをバージョン **%kotlinEapVersion%** を使用するように設定していることを確認してください。
2. `FirebaseAnalytics` Swift パッケージを `swiftPMDependencies {}` ブロックに追加します：

   ```kotlin
   // projectDir/sharedLogic/build.gradle.kts
   kotlin {
       swiftPMDependencies {
          swiftPackage(
              url = url("https://github.com/firebase/firebase-ios-sdk.git"),
              version = from("12.5.0"),
              products = listOf(product("FirebaseAnalytics")),
          )
       }

       cocoapods {
           // ...

           pod("FirebaseAnalytics") {
           version = "12.5.0"
           // ...
           }
       }
   }
   ```

3. **Sync Project with Gradle Files** アクションを実行して、Swift パッケージから API をインポートします。
4. Swift パッケージからインポートされた API を使用するようにコードを更新します。
   pod と対応する Swift パッケージが全く同じ API を提供している場合、Kotlin のインポートディレクティブを更新するだけで済むはずです。例：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            import cocoapods.FirebaseAnalytics.FIRAnalytics"></code-block>
        <code-block lang="kotlin" code="            import swiftPMImport.org.example.package.FIRAnalytics"></code-block>
    </compare>

5. ビルドスクリプトで `cocoapods.framework {}` ブロックを使用している場合は、その設定を `binaries.framework {}` ブロックに移動します。例：

   <compare type="left-right">
   <code-block lang="kotlin" code="   kotlin {&#10;       iosArm64()&#10;       iosSimulatorArm64()&#10;       iosX64()&#10;&#10;       cocoapods {&#10;           framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   <code-block lang="kotlin" code="   kotlin {&#10;       listOf(&#10;           iosArm64(),&#10;           iosSimulatorArm64(),&#10;           iosX64(),&#10;       ).forEach { iosTarget -&gt;&#10;           iosTarget.binaries.framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   </compare>

## Xcode プロジェクトを再構成する

CocoaPods Gradle プラグイン (`kotlin("native.cocoapods")`) を使用している場合、SwiftPM に切り替える前に、Xcode プロジェクトを[直接統合（direct integration）](multiplatform-direct-integration.md)を使用するように再構成する必要があります。
SwiftPM インポートツールは、`.xcodeproj` ファイルに必要な変更を加えるためのシェルコマンドを生成できます。

1. Xcode でプロジェクトを開く（IntelliJ IDEA では **File** | **Open Project in Xcode** を選択）。
2. Xcode でプロジェクトをビルドする (**Product** | **Build**)。ビルドは失敗しますが、ビルドエラーには必要なコマンドが含まれています。
3. Xcode でビルドエラーを確認するには、**View** | **Navigators** | **Report** を選択し、上部のフィルターで **Errors Only** を選択します。
   コマンドは以下のようになり、プロジェクトへの正しいパスが含まれています。

   ```text
   XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' GRADLE_PROJECT_PATH=':kotlin-library' '/path/to/project/gradlew' -p '/path/to/project' ':kotlin-library:integrateEmbedAndSign' ':kotlin-library:integrateLinkagePackage'
   ```

   > Xcode を開かずに、ターミナルからプロジェクトをビルドすることで同じコマンドを生成できます。
   > `/path/to/project/iosApp` ディレクトリで以下のコマンドを実行してください：
   > 
   > ```shell
   > xcodebuild -scheme "$(echo -n *.xcworkspace | python3 -c 'import sys, json; from subprocess import check_output; print(list(set(json.loads(check_output(["xcodebuild", "-workspace", sys.stdin.readline(), "-list", "-json"]))["workspace"]["schemes"]) - set(json.loads(check_output(["xcodebuild", "-project", "Pods/Pods.xcodeproj", "-list", "-json"]))["project"]["schemes"]))[0])')" -workspace *.xcworkspace -destination 'generic/platform=iOS Simulator' ARCHS=arm64 | grep -A5 'What went wrong'
   > ```
   {style="note"}

    末尾の `grep` 呼び出しにより、特定のエラーメッセージと実行する必要のあるコマンドが表示されます。

4. `/path/to/project/iosApp` ディレクトリで、生成されたコマンドをターミナルで実行します。
   これにより `iosApp` プロジェクトの `.xcodeproj` ファイルが修正され、ビルド中に `embedAndSignAppleFrameworkForXcode` タスクがトリガーされるようになります。これにより、iOS ビルドに Kotlin Multiplatform のコンパイルフェーズが挿入されます。
5. IntelliJ IDEA で **Tools** | **Swift Package Manager** | **Resolve Dependencies** を選択し、`build.gradle.kts` ファイルで宣言された SwiftPM 依存関係を解決します。

これで iOS アプリは SwiftPM 依存関係を使用するようになります。CocoaPods プラグインを無効にし、pod を解除（deintegrate）できます。

## CocoaPods KMP 統合を削除する

すべての CocoaPods 依存関係を Swift パッケージに置き換えた場合は、`/path/to/project/iosApp` ディレクトリで以下のコマンドを実行して pod を解除できます：

```shell
pod deintegrate
```

SwiftPM 依存関係と重複しない依存関係のために CocoaPods を使い続けたい場合は、`Podfile` を編集して KMP モジュールに言及している行のみを削除し、`pod install` を実行してください。例：

```shell
target 'iosApp' do
    # ここで 'sharedLogic' は共有コードモジュールの名前です。
    # この行を削除して 'pod install' を再実行してください。
    pod 'sharedLogic', :path => '../sharedLogic'
    ...
end
```

最後に、Gradle ビルド設定から CocoaPods の記述を削除します：

1. 共有コードモジュールの `build.gradle.kts` ファイルから `cocoapods {}` ブロック全体を削除します。すべての依存関係は SwiftPM インポートツールによって管理されるようになったためです。
2. プロジェクトが CocoaPods に依存しなくなった場合は、ルートの `build.gradle.kts` ファイルと共有モジュールの `build.gradle.kts` の両方の `plugins {}` ブロックから CocoaPods Gradle プラグインへの参照を削除します。