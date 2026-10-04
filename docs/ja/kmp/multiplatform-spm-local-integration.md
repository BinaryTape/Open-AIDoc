[//]: # (title: ローカルSwiftパッケージからKotlinを使用する)

<tldr>
   これはローカル統合方式です。以下の場合に適しています:<br/>

   * ローカルSwiftPMモジュールを含むiOSアプリがある場合。
   * ローカル環境でiOSをターゲットとするKotlin Multiplatformプロジェクトをすでにセットアップしている場合。
   * 既存のiOSプロジェクトのリンクタイプが静的（static linking）である場合。<br/>

   [最適な統合方式を選択する](multiplatform-ios-integration-overview.md)
</tldr>

このチュートリアルでは、Swift Package Manager（SwiftPM）を使用して、Kotlin Multiplatformプロジェクトから生成されたKotlinフレームワークをローカルパッケージに統合する方法を学びます。

![Direct integration diagram](direct-integration-scheme.svg){width=700}

統合をセットアップするには、プロジェクトのビルド設定において、事前アクション（Pre-action）として `embedAndSignAppleFrameworkForXcode` Gradleタスクを実行する特別なスクリプトを追加します。共通コード（common code）で行った変更をXcodeプロジェクトに反映させるには、Kotlin Multiplatformプロジェクトをリビルドするだけで済みます。

この方法を使用すると、ビルドフェーズにスクリプトを追加し、共通コードの変更を反映するためにKotlin MultiplatformプロジェクトとiOSプロジェクトの両方をリビルドする必要がある通常の直接統合方式と比べて、ローカルSwiftパッケージ内でKotlinコードをより手軽に利用できるようになります。

> Kotlin Multiplatformに慣れていない場合は、まず[環境のセットアップ](quickstart.md)と[クロスプラットフォームアプリケーションをゼロから作成する方法](compose-multiplatform-new-project.md)をご確認ください。
>
{style="tip"}

## プロジェクトのセットアップ {id="set-up-the-project"}

この機能はKotlin 2.0.0以降で利用可能です。

> Kotlinのバージョンを確認するには、Kotlin Multiplatformプロジェクトのルートにある `build.gradle(.kts)` ファイルを開いてください。ファイルの先頭にある `plugins {}` ブロックで現在のバージョンを確認できます。
> 
> または、`gradle/libs.versions.toml` ファイルのバージョンカタログを確認してください。
> 
{style="tip"}

このチュートリアルでは、プロジェクトのビルドフェーズで `embedAndSignAppleFrameworkForXcode` タスクを使用する[直接統合](multiplatform-direct-integration.md)アプローチを採用していることを前提としています。CocoaPodsプラグインまたは `binaryTarget` を持つSwiftパッケージ経由でKotlinフレームワークを接続している場合は、先に移行を行ってください。

### SwiftPM binaryTarget統合からの移行 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-swiftpm-binarytarget-integration"}

`binaryTarget` を使用したSwiftPM統合から移行するには:

1. Xcodeで、**Product** | **Clean Build Folder** を選択するか、ショートカット <shortcut>Cmd + Shift + K</shortcut> を使用してビルドディレクトリをクリーンアップします。
2. すべての `Package.swift` ファイルから、内部にKotlinフレームワークを含むパッケージへの依存関係と、プロダクトへのターゲット依存関係の両方を削除します。

### CocoaPodsプラグインからの移行 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-the-cocoapods-plugin"}

> `cocoapods {}` ブロック内に他のPodへの依存関係がある場合は、CocoaPods統合アプローチを使用する必要があります。現時点では、マルチモジュールのSwiftPMプロジェクトにおいて、PodとKotlinフレームワークの両方に依存関係を持たせることはできません。
>
{style="warning"}

CocoaPodsプラグインから移行するには:

1. Xcodeで、**Product** | **Clean Build Folder** を選択するか、ショートカット <shortcut>Cmd + Shift + K</shortcut> を使用してビルドディレクトリをクリーンアップします。
2. Podfileのあるディレクトリで、次のコマンドを実行します:

    ```none
   pod deintegrate
   ```

3. `build.gradle(.kts)` ファイルから `cocoapods {}` ブロックを削除します。
4. `.podspec` ファイルとPodfileを削除します。

## プロジェクトへのフレームワークの接続

> 現時点では、`swift build` への統合はサポートされていません。
>
{style="note"}

ローカルSwiftパッケージでKotlinコードを使用できるようにするには、マルチプラットフォームプロジェクトから生成されたKotlinフレームワークをXcodeプロジェクトに接続します:

1. Xcodeで、**Product** | **Scheme** | **Edit scheme** に進むか、トップバーのスキームアイコンをクリックして **Edit scheme** を選択します:

   ![Edit scheme](xcode-edit-schemes.png){width=700}

2. **Build** | **Pre-actions** 項目を選択し、**+** | **New Run Script Action** をクリックします:

   ![New run script action](xcode-new-run-script-action.png){width=700}

3. 以下のスクリプトを調整し、アクションとして追加します:

   ```bash
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode 
   ```

   * `cd` コマンドには、Kotlin Multiplatformプロジェクトのルートへのパスを指定します（例: `$SRCROOT/..`）。
   * `./gradlew` コマンドには、共有モジュールの名前を指定します（例: `:shared` や `:sharedLogic`）。
  
4. **Provide build settings from** セクションでアプリのターゲットを選択します:

   ![Filled run script action](xcode-filled-run-script-action.png){width=700}

5. これで、ローカルSwiftパッケージに共有モジュールをインポートしてKotlinコードを使用できるようになります。

   XcodeでローカルSwiftパッケージに移動し、モジュールのインポートを含む関数を定義します（例）:

   ```Swift
   import Shared
   
   public func greetingsFromSpmLocalPackage() -> String {
       return Greeting.greet()
   }
   ```

   ![SwiftPM usage](xcode-spm-usage.png){width=700}

6. iOSプロジェクトの `ContentView.swift` ファイルで、ローカルパッケージをインポートすることでこの関数を使用できるようになります:

   ```Swift
   import SwiftUI
   import SpmLocalPackage
   
   struct ContentView: View {
       var body: some View {
           Vstack {
               Image(systemName: "globe")
                   .imageScale(.large)
                   .foregroundStyle(.tint)
               Text(greetingsFromSpmLocalPackage())
           }
           .padding()
       }
   }
   
   #Preview {
       ContentView()
   }
   ```
   
7. Xcodeでプロジェクトをビルドします。すべて正しく設定されていれば、プロジェクトのビルドが成功します。
   
考慮すべき要素がさらにいくつかあります: 

* デフォルトの `Debug` または `Release` とは異なるカスタムビルド構成（custom build configuration）を使用している場合は、**Build Settings** タブの **User-Defined** に `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定を追加し、`Debug` または `Release` に設定してください。
* スクリプトのサンドボックス化に関するエラーが発生した場合は、プロジェクト名をダブルクリックしてiOSプロジェクトの設定を開き、**Build Settings** タブの **Build Options** にある **User Script Sandboxing** を無効にしてください。

## 次のステップ {id="what-s-next"}

* [統合方式を選択する](multiplatform-ios-integration-overview.md)
* [Swiftパッケージのエクスポート設定方法を学ぶ](multiplatform-spm-export.md)