[//]: # (title: 直接統合)

<tldr>
   これはローカル統合の方法です。次の場合に適しています：<br/>

   * ローカルマシン上に iOS をターゲットとする Kotlin Multiplatform プロジェクトが既にセットアップされている。
   * Kotlin Multiplatform プロジェクトに CocoaPods の依存関係がない。<br/>

   [最適な統合方法を選択する](multiplatform-ios-integration-overview.md)
</tldr>

Kotlin Multiplatform プロジェクトと iOS プロジェクトの間でコードを共有しながら同時に開発したい場合、専用のスクリプトを使用して直接統合を設定できます。

このスクリプトは、Kotlin フレームワークを Xcode の iOS プロジェクトに接続するプロセスを自動化します：

![Direct integration diagram](direct-integration-scheme.svg){width=700}

このスクリプトは、Xcode 環境専用に設計された `embedAndSignAppleFrameworkForXcode` Gradle タスクを使用します。セットアップ時に、これを iOS アプリビルドの Run Script フェーズに追加します。これにより、iOS アプリのビルドが実行される前に Kotlin アーティファクトがビルドされ、派生データ（Derived Data）に含まれるようになります。

基本的に、このスクリプトは以下の処理を行います：

* コンパイルされた Kotlin フレームワークを、iOS プロジェクト構造内の適切なディレクトリにコピーする。
* 埋め込まれたフレームワークのコード署名プロセスを処理する。
* Kotlin フレームワーク内のコード変更が、Xcode 上の iOS アプリに確実に反映されるようにする。

## セットアップ方法 {id="how-to-set-up"}

現在、Kotlin フレームワークを接続するために CocoaPods プラグインを使用している場合は、まず移行を行ってください。プロジェクトに CocoaPods の依存関係がない場合は、[この手順をスキップ](#connect-the-framework-to-your-project)してください。

### CocoaPods プラグインからの移行 {id="migrate-from-the-cocoapods-plugin"}

CocoaPods プラグインから移行するには：

1. Xcode で、**Product** | **Clean Build Folder** を選択するか、<shortcut>Cmd + Shift + K</shortcut> ショートカットを使用してビルドディレクトリをクリーンします。
2. Podfile のあるディレクトリで、次のコマンドを実行します：

    ```none
   pod deintegrate
   ```

3. `build.gradle(.kts)` ファイルから `cocoapods {}` ブロックを削除します。
4. `.podspec` ファイルと Podfile を削除します。

### フレームワークをプロジェクトに接続する

マルチプラットフォームプロジェクトから生成された Kotlin フレームワークを Xcode プロジェクトに接続するには：

1. `embedAndSignAppleFrameworkForXcode` タスクは、`binaries.framework` 設定オプションが宣言されている場合にのみ登録されます。Kotlin Multiplatform プロジェクトの `build.gradle.kts` ファイルで、iOS ターゲットの宣言を確認してください。
2. Xcode で、プロジェクト名をダブルクリックして iOS プロジェクト設定を開きます。
3. 左側の **Targets** セクションでターゲットを選択し、**Build Phases** タブに移動します。
4. **+** をクリックし、**New Run Script Phase** を選択します。

   ![Add run script phase](xcode-run-script-phase-1.png){width=700}

5. 以下のスクリプトを調整し、新しいフェーズのスクリプトテキストフィールドに貼り付けます：

   ```bash
   if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
       echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
       exit 0
   fi
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode
   ```

   * `cd` コマンドで、Kotlin Multiplatform プロジェクトのルートへのパスを指定します（例: `$SRCROOT/..`）。
   * `./gradlew` コマンドで、共有モジュールの名前を指定します（例: `:shared` や `:sharedUI`）。
   
   IntelliJ IDEA や Android Studio で iOS の実行構成を開始すると、Xcode のビルドを開始する前に Kotlin フレームワークの依存関係がビルドされ、環境変数 `OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED` が "YES" に設定されます。提供されているシェルスクリプトはこの変数を確認し、Kotlin フレームワークが Xcode から二重にビルドされるのを防ぎます。
     
   > これをサポートしていないプロジェクトで iOS の実行構成を起動すると、IDE はビルドガードを設定するための修正を提案します。
   >
   {style="note"}

6. **Based on dependency analysis** オプションを無効にします。

   ![Add the script](xcode-run-script-phase-2.png){width=700}

   これにより、Xcode が毎回のビルドでスクリプトを実行するようになり、出力の依存関係が見つからないという警告が毎回表示されるのを防ぎます。

7. **Run Script** フェーズを上に移動し、**Compile Sources** フェーズの前に配置します。

   ![Drag the Run Script phase](xcode-run-script-phase-3.png){width=700}

8. **Build Settings** タブで、**Build Options** にある **User Script Sandboxing** オプションを無効にします：

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 事前にサンドボックス化を無効にせずに iOS プロジェクトをビルドした場合、Gradle デーモンの再起動が必要になることがあります。
   > サンドボックス化された可能性のある Gradle デーモンプロセスを停止してください：
   > ```shell
   > ./gradlew --stop
   > ```
   >
   {style="tip"}

9. Xcode でプロジェクトをビルドします。すべてが正しく設定されていれば、プロジェクトは正常にビルドされます。

> デフォルトの `Debug` または `Release` とは異なるカスタムビルド構成を使用している場合は、**Build Settings** タブで、**User-Defined** の下に `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定を追加し、`Debug` または `Release` に設定してください。
>
{style="note"}

## 次のステップ {id="what-s-next"}

Swift Package Manager を使用する場合でも、ローカル統合を利用できます。[ローカルパッケージで Kotlin フレームワークへの依存関係を追加する方法を見る](multiplatform-spm-local-integration.md)。