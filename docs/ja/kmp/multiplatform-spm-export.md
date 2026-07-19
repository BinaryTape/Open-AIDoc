[//]: # (title: Swift package エクスポートの設定)

<tldr>
   これはリモート統合の手法です。以下のような場合に適しています：<br/>

   * 最終的なアプリケーションのコードベースと共通のコードベースを分離したい。
   * ローカルマシンで iOS をターゲットとした Kotlin Multiplatform プロジェクトをすでにセットアップしている。
   * iOS プロジェクトの依存関係の管理に Swift Package Manager を使用している。<br/>

   [自分に最適な統合方法を選択する](multiplatform-ios-integration-overview.md)
</tldr>

Apple ターゲット向けの Kotlin/Native 出力を、Swift Package Manager (SwiftPM) の依存関係として利用できるように設定できます。

iOS ターゲットを持つ Kotlin Multiplatform プロジェクトを想定してください。この iOS バイナリを、ネイティブの Swift プロジェクトで作業している iOS 開発者が依存関係として利用できるようにしたい場合があります。Kotlin Multiplatform のツールを使用すると、Xcode プロジェクトにシームレスに統合できるアーティファクトを提供できます。

このチュートリアルでは、Kotlin Gradle プラグインを使用して [XCFrameworks](multiplatform-build-native-binaries.md#build-xcframeworks) を構築することで、これを実現する方法を説明します。

## リモート統合のセットアップ

フレームワークを利用可能にするには、次の 2 つのファイルをアップロードする必要があります：

* XCFramework を含む ZIP アーカイブ。これを、直接アクセス可能な便利なファイルストレージ（例えば、アーカイブを添付した GitHub リリースの作成、Amazon S3、または Maven など）にアップロードする必要があります。ワークフローに最も統合しやすいオプションを選択してください。
* パッケージを記述する `Package.swift` ファイル。これを別の Git リポジトリにプッシュする必要があります。

#### プロジェクト構成のオプション {initial-collapse-state="collapsed" collapsible="true"}

このチュートリアルでは、XCFramework をバイナリとして任意のファイルストレージに保存し、`Package.swift` ファイルを別の Git リポジトリに保存します。

ただし、プロジェクトを異なる方法で構成することもできます。Git リポジトリの構成については、以下のオプションを検討してください：

* `Package.swift` ファイルと、XCFramework にパッケージ化されるコードを別々の Git リポジトリに保存する。これにより、Swift マニフェストをプロジェクト自体とは別にバージョン管理できるようになります。これが推奨されるアプローチです。スケーリングが可能で、一般的にメンテナンスが容易になります。
* `Package.swift` ファイルを Kotlin Multiplatform のコードと同じ場所に置く。これはより直接的なアプローチですが、この場合、Swift パッケージとコードが同じバージョニングを使用することに注意してください。SwiftPM はパッケージのバージョニングに Git タグを使用するため、プロジェクトで使用されるタグと競合する可能性があります。
* `Package.swift` ファイルを利用側のプロジェクトのリポジトリ内に保存する。これにより、バージョニングやメンテナンスの問題を回避できます。ただし、このアプローチは、利用側プロジェクトのマルチリポジトリ SwiftPM セットアップや、さらなる自動化において問題を引き起こす可能性があります：

  * マルチパッケージプロジェクトでは、プロジェクト内での依存関係の競合を避けるために、1 つのコンシューマーパッケージのみが外部モジュールに依存できます。そのため、Kotlin Multiplatform モジュールに依存するすべてのロジックは、特定のコンシューマーパッケージにカプセル化される必要があります。
  * 自動化された CI プロセスを使用して Kotlin Multiplatform プロジェクトを公開する場合、このプロセスには更新された `Package.swift` ファイルを利用側のリポジトリに公開する工程を含める必要があります。これにより、利用側リポジトリでの更新の競合が発生する可能性があり、CI におけるそのようなフェーズの維持が困難になる場合があります。

### マルチプラットフォームプロジェクトの設定

以下の例では、Kotlin Multiplatform プロジェクトの共通コードがローカルの `shared` モジュールに保存されています。プロジェクトの構造が異なる場合は、コードやパスの例にある "shared" を実際のモジュール名に置き換えてください。

XCFramework の公開を設定するには：

1. `shared/build.gradle.kts` 設定ファイルを更新し、iOS ターゲットリストに `XCFramework` の呼び出しを追加します：

   ```kotlin
   import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework
   
   kotlin {
       // 他の Kotlin Multiplatform ターゲット
       // ...
       // 利用側のプロジェクトでインポートされるモジュールの名前
       val xcframeworkName = "Shared"
       val xcf = XCFramework(xcframeworkName)
   
       listOf(
           iosArm64(),
           iosSimulatorArm64(),
       ).forEach { 
           it.binaries.framework {
               baseName = xcframeworkName
               
               // フレームワークを一意に識別するための CFBundleIdentifier を指定
               binaryOption("bundleId", "org.example.${xcframeworkName}")
               xcf.add(this)
               isStatic = true
           }
       }
       //...
   }
   ```
   
2. フレームワークを作成するための Gradle タスクを実行します：
   
   ```shell
   ./gradlew :shared:assembleSharedXCFramework
   ```
  
   生成されたフレームワークは、プロジェクトディレクトリ内の `shared/build/XCFrameworks/release/Shared.xcframework` フォルダとして作成されます。

   > プロジェクトで SwiftPM 依存関係を利用している場合、Kotlin %kotlinEapVersion% 以降、このタスクは XCFramework の隣に一連の SwiftPM 関連ファイルも生成します。
   > [以下](#xcframework-と-swift-パッケージマニフェストの準備)で説明するように、マニフェストを一から作成する代わりに、生成された `Package.swift` をフレームワークと一緒に配布できます。
   >
   {style="note"} 

3. エクスポートしたい共有コードを持つモジュールが複数ある場合（例：共有ロジックモジュールと共有 UI モジュール）、それらを[単一の新しいモジュールに統合](#複数のモジュールを-xcframework-としてエクスポートする)し、代わりにこのアンブレラ (umbrella) モジュールを配布してください。

### XCFramework と Swift パッケージマニフェストの準備

1. `Shared.xcframework` フォルダを ZIP ファイルに圧縮し、生成されたアーカイブのチェックサムを計算します。例：
   
   `swift package compute-checksum Shared.xcframework.zip`

2. ZIP ファイルを選択したファイルストレージにアップロードします。ファイルはダイレクトリンクでアクセスできる必要があります。例えば、GitHub のリリース機能を使用する方法は以下の通りです：
   
   <deflist collapsible="true">
       <def title="GitHub リリースへのアップロード">
           <list type="decimal">
               <li><a href="https://github.com">GitHub</a> にアクセスし、アカウントにログインします。</li>
               <li>リリースを作成したいリポジトリに移動します。</li>
               <li>右側の <b>Releases</b> セクションで、<b>Create a new release</b> リンクをクリックします。</li>
               <li>リリースの情報を入力し、新しいタグを追加または作成し、リリースのタイトルを指定して説明を書きます。</li>
               <li>
                   <p>下部にある <b>Attach binaries by dropping them here or selecting them</b> フィールドから、XCFramework の ZIP ファイルをアップロードします：</p>
                   <img src="github-release-description.png" alt="リリースの情報を入力する" width="700"/>
               </li>
               <li><b>Publish release</b> をクリックします。</li>
               <li>
                   <p>リリースの <b>Assets</b> セクションで、ZIP ファイルを右クリックし、ブラウザで <b>Copy link address</b>（または同様のオプション）を選択します：</p>
                   <img src="github-release-link.png" alt="アップロードされたファイルへのリンクをコピーする" width="500"/>
               </li>
         </list>
       </def>
   </deflist>

3. [推奨] リンクが機能し、ファイルがダウンロードできることを確認します。ターミナルで次のコマンドを実行します：

    ```none
    curl <アップロードされた XCFramework ZIP ファイルへのダウンロード可能なリンク>
    ```

4. プロジェクトで SwiftPM 依存関係を利用している場合、Kotlin %kotlinEapVersion% 以降、`assembleSharedXCFramework` Gradle タスクは XCFramework の隣に `Package.swift` ファイルを生成します。

   そうでない場合は、以下のテンプレートを使用して手動で `Package.swift` ファイルを作成できます：

   ```Swift
   // swift-tools-version:5.3
   import PackageDescription
    
   let package = Package(
      name: "Shared",
      platforms: [
        .iOS(.v14),
      ],
      products: [
         .library(name: "Shared", targets: ["Shared"])
      ],
      targets: [
         .binaryTarget(
            name: "Shared",
            url: "<アップロードされた XCFramework ZIP ファイルへのリンク>",
            checksum:"<ZIP ファイルに対して計算されたチェックサム>")
      ]
   )
   ```
   
5. 不足しているフィールドを指定します：
   * `url` フィールドに、XCFramework を含む ZIP アーカイブへのリンクを指定します。
   * `checksum` フィールドに、先ほど ZIP ファイルに対して計算したチェックサムを指定します。

6. [推奨] 生成されたマニフェストを検証するには、`Package.swift` ファイルがあるディレクトリで次のシェルコマンドを実行します：

    ```shell
    swift package reset && swift package show-dependencies --format json
    ```
    
    マニフェストが正しい場合、出力にはエラーが表示されないか、ダウンロードと解析の成功結果が表示されます。

7. `Package.swift` ファイルをリモートリポジトリにプッシュします。パッケージのセマンティックバージョンを含む Git タグを作成してプッシュしてください。

### パッケージ依存関係の追加

両方のファイルにアクセスできるようになったので、既存のクライアント iOS プロジェクトに作成したパッケージへの依存関係を追加するか、新しいプロジェクトを作成できます。パッケージ依存関係を追加するには：

1. Xcode で、**File | Add Package Dependencies** を選択します。
2. 検索フィールドに、`Package.swift` ファイルが含まれている Git リポジトリの URL を入力します：

   ![パッケージファイルを含むリポジトリを指定する](multiplatform-spm-url.png)

3. **Add package** ボタンをクリックし、パッケージの製品と対応するターゲットを選択します。

   > Swift パッケージを作成している場合、ダイアログが異なります。この場合は、**Copy package** ボタンをクリックします。これにより、`.package` の行がクリップボードにコピーされます。この行を自身の `Package.swift` ファイルの [Package.Dependency](https://developer.apple.com/documentation/packagedescription/package/dependency) ブロックに貼り付け、適切な `Target.Dependency` ブロックに必要な製品を追加してください。
   >
   {style="tip"}

### セットアップの確認

すべてが正しく設定されているかを確認するために、Xcode でインポートをテストします：

1. プロジェクトで、UI ビューファイル（例：`ContentView.swift`）に移動します。
2. コードを次のスニペットに置き換えます：
   
    ```Swift
    import SwiftUI
    import Shared
    
    struct ContentView: View {
        var body: some View {
            VStack {
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                Text("Hello, world! \(Shared.Platform_iosKt.getPlatform().name)")
            }
            .padding()
        }
    }
    
    #Preview {
        ContentView()
    }
    ```
   
    ここでは、`Shared` XCFramework をインポートし、それを使用して `Text` フィールドにプラットフォーム名を取得しています。

3. プレビューが新しいテキストで更新されることを確認します。

## 複数のモジュールを XCFramework としてエクスポートする

複数の Kotlin Multiplatform モジュールのコードを iOS バイナリとして利用可能にするには、これらのモジュールを単一のアンブレラ (umbrella) モジュールに統合します。その後、そのアンブレラモジュールの XCFramework をビルドしてエクスポートします。

例えば、`network` モジュールと `database` モジュールがあり、これらを `together` モジュールに統合する場合：

1. `together/build.gradle.kts` ファイルで、依存関係とフレームワークの構成を指定します：

    ```kotlin
    kotlin {
        val frameworkName = "together"
        val xcf = XCFramework(frameworkName)
    
        listOf(
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            // 上記の例と同様ですが、
            // 依存関係のエクスポート呼び出しが追加されています
            iosTarget.binaries.framework {
                export(projects.network)
                export(projects.database)
    
                baseName = frameworkName
                xcf.add(this)
            }
        }
    
        // 内部モジュールをエクスポートするために、依存関係を "api"（"implementation" ではなく）として設定
        sourceSets {
            commonMain.dependencies {
                api(projects.network)
                api(projects.database)
            }
        }
    }
    ```

2. 含まれる各モジュールには、iOS ターゲットが設定されている必要があります。例：

    ```kotlin
    kotlin {
        android {
            //...
        }
        
        iosArm64()
        iosSimulatorArm64()
        
        //...
    }
    ```

3. `together` フォルダ内に空の Kotlin ファイル（例：`together/src/commonMain/kotlin/Together.kt`）を作成します。これは、現在の Gradle スクリプトでは、エクスポートされたモジュールにソースコードが含まれていないとフレームワークを組み立てられないための回避策です。

4. フレームワークを組み立てる Gradle タスクを実行します：

    ```shell
    ./gradlew :together:assembleTogetherReleaseXCFramework
    ```

5. [前のセクション](#xcframework-と-swift-パッケージマニフェストの準備)の手順に従って `together.xcframework` を準備します：アーカイブの作成、チェックサムの計算、アーカイブされた XCFramework のファイルストレージへのアップロード、`Package.swift` ファイルの作成とプッシュを行います。

これで、Xcode プロジェクトに依存関係をインポートできます。`import together` ディレクティブを追加すると、Swift コードで `network` モジュールと `database` モジュールの両方のクラスをインポートして利用できるようになります。