[//]: # (title: AndroidアプリケーションをiOSで動作させる – チュートリアル)

<secondary-label ref="Android Studio"/>

このチュートリアルでは、既存のAndroidアプリケーションをクロスプラットフォーム化し、AndroidとiOSの両方で動作させる方法を説明します。AndroidとiOSの両方のコードを、同じ場所で一度に記述できるようになります。

このチュートリアルでは、ユーザー名とパスワードを入力するためのシングルスクリーンの[サンプルAndroidアプリケーション](https://github.com/Kotlin/kmp-integration-sample)を使用します。認証情報は検証され、メモリ内データベースに保存されます。

アプリケーションをiOSとAndroidの両方で動作させるために、まず一部のコードを共有モジュール（shared module）に移動して、コードをクロスプラットフォーム化します。その後、そのクロスプラットフォームコードをAndroidアプリケーションで使用し、次に同じコードを新しいiOSアプリケーションで使用します。

> Kotlinマルチプラットフォームに詳しくない場合は、まず[クロスプラットフォームアプリケーションをゼロから作成する](quickstart.md)方法を学習してください。
>
{style="tip"}

## 開発環境の準備

1. クイックスタートの指示に従い、[Kotlinマルチプラットフォーム開発のための環境構築](quickstart.md#set-up-the-environment)を完了させてください。

   > iOSアプリケーションの実行など、このチュートリアルの特定のステップを完了するには、macOSを搭載したMacが必要です。これはAppleの要件によるものです。
   >
   {style="note"}

2. Android Studioで、バージョン管理から新しいプロジェクトを作成します：

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` ブランチにはプロジェクトの初期状態（シンプルなAndroidアプリケーション）が含まれています。iOSアプリケーションと共有モジュールを含む最終的な状態を確認するには、`final` ブランチに切り替えてください。
   
3. **Project** ビューに切り替えます：

   ![Project view](switch-to-project.png){width="513"}

## コードをクロスプラットフォーム化する

コードをクロスプラットフォーム化するために、以下の手順に従います：

1. [どのコードをクロスプラットフォーム化するか決定する](#decide-what-code-to-make-cross-platform)
2. [クロスプラットフォームコード用の共有モジュールを作成する](#create-a-shared-module-for-cross-platform-code)
3. [コード共有をテストする](#add-code-to-the-shared-module)
4. [Androidアプリケーションに共有モジュールへの依存関係を追加する](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [ビジネスロジックをクロスプラットフォーム化する](#make-the-business-logic-cross-platform)
6. [Androidでクロスプラットフォームアプリケーションを実行する](#run-your-cross-platform-application-on-android)

### どのコードをクロスプラットフォーム化するか決定する

AndroidアプリケーションのどのコードをiOSと共有し、どのコードをネイティブのままにするかを決定します。シンプルなルールは、できるだけ再利用したいものを共有することです。ビジネスロジックはAndroidとiOSの両方で同じであることが多いため、再利用の絶好の候補です。

サンプルAndroidアプリケーションでは、ビジネスロジックは `com.jetbrains.simplelogin.androidapp.data` パッケージに保存されています。将来のiOSアプリケーションでも同じロジックを使用するため、これもクロスプラットフォーム化する必要があります。

![Business logic to share](business-logic-to-share.png){width=366}

### クロスプラットフォームコード用の共有モジュールを作成する

iOSとAndroidの両方で使用されるクロスプラットフォームコードは、共有（shared）モジュールに保存されます。Android StudioとIntelliJ IDEAはどちらも、Kotlinマルチプラットフォーム用の共有モジュールを作成するためのウィザードを提供しています。

既存のAndroidアプリケーションと将来のiOSアプリケーションの両方に接続するための共有モジュールを作成します：

1. Android Studioで、メインメニューから **File** | **New** | **New Module** を選択します。
2. テンプレートのリストから **Kotlin Multiplatform Shared Module** を選択します。
   ライブラリ名は `shared` のままにし、パッケージ名を入力します：
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. **Finish** をクリックします。ウィザードが共有モジュールを作成し、それに応じてビルドスクリプトを変更し、Gradleの同期を開始します。
4. 同期が完了するまで待ちます。
   `shared` ディレクトリに以下のファイル構造が表示されます：

   ![Final file structure inside the shared directory](shared-directory-structure.png){width="341"}

   作成されたプロジェクトのレイアウトをより詳しく理解したい場合は、[Kotlinマルチプラットフォームプロジェクト構造の基本](multiplatform-discover-project.md)を参照してください。

5. `shared` モジュールはAndroidアプリケーションのライブラリとして使用されるため、`shared/build.gradle.kts` の `kotlin.android {}` ブロックを以下の `androidLibrary {}` ブロックに置き換えます：

    ```kotlin
    import org.jetbrains.kotlin.gradle.dsl.JvmTarget

    kotlin {
        androidLibrary {
            namespace = "com.jetbrains.simplelogin.shared"
            compileSdk = libs.versions.android.compileSdk.get().toInt()
            compilerOptions {
                jvmTarget = JvmTarget.JVM_11
            }
        
            androidResources {
                enable = true
            }
        
            withHostTestBuilder {
            }
        
            withDeviceTestBuilder {
                sourceSetTreeName = "test"
            }.configure {
                instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
        }
        //...
    }
    ```
   
### 共有モジュールにコードを追加する

共有モジュールが作成されたので、`shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` ディレクトリに共有される共通コードを追加します：

1. 以下のコードで新しい `Greeting` クラスを作成します：

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 既存のファイルのコードを以下のように置き換えます：

     * `commonMain/Platform.kt` 内：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         interface Platform {
             val name: String
         }
        
         expect fun getPlatform(): Platform
         ```
     
     * `androidMain/Platform.android.kt` 内：

         ```kotlin
         package com.jetbrains.simplelogin.shared
         
         import android.os.Build

         class AndroidPlatform : Platform {
             override val name: String = "Android ${Build.VERSION.SDK_INT}"
         }

         actual fun getPlatform(): Platform = AndroidPlatform()
         ```
     * `iosMain/Platform.ios.kt` 内：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         import platform.UIKit.UIDevice

         class IOSPlatform: Platform {
             override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
         }

         actual fun getPlatform(): Platform = IOSPlatform()
         ```

これで、プラットフォーム名をプロパティとして持つプラットフォーム固有のオブジェクトを返す共通の `getPlatform()` 関数が作成されました。

### Androidアプリケーションに共有モジュールへの依存関係を追加する

Androidアプリケーションでクロスプラットフォームコードを使用するには、共有モジュールをアプリケーションに接続し、ビジネスロジックコードをそこに移動して、そのコードをクロスプラットフォーム化します。

1. `app/build.gradle.kts` ファイルに共有モジュールへの依存関係を追加します：

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. IDEの提案に従うか、**File** | **Sync Project with Gradle Files** メニュー項目を使用してGradleファイルを同期します。
3. `app/src/main/java/` ディレクトリの `com.jetbrains.simplelogin.androidapp.ui.login` パッケージにある `LoginActivity.kt` ファイルを開きます。
4. 共有モジュールがアプリケーションに正常に接続されていることを確認するために、`onCreate()` メソッドに `Log.i()` 呼び出しを追加して `greet()` 関数の結果をログに出力します：

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. IDEの提案に従って、不足しているクラスをインポートします。
6. ツールバーで、実行構成ドロップダウンの隣にあるデバッグアイコンをクリックします：

   ![App from list to debug](app-list-android.png){width="300"}

7. **Logcat** ツールウィンドウで、ログから "Hello" を検索すると、共有モジュールからの挨拶が見つかります：

   ![Greeting from the shared module](shared-module-greeting.png){width="700"}

### ビジネスロジックをクロスプラットフォーム化する

これで、ビジネスロジックコードをKotlinマルチプラットフォームの共有モジュールの `commonMain` ソースセットに抽出できます。これにより、AndroidとiOSの両方でコードを使用できるようになります。

1. ビジネスロジックコード `com.jetbrains.simplelogin.androidapp.data` を `app` ディレクトリから `shared/src/commonMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに移動します。

   ![Drag and drop the package with the business logic code](moving-business-logic.png){width=300}

2. Android Studioで実行内容を確認されたら、パッケージの移動を選択し、リファクタリングを承認します。

   ![Refactor the business logic package](refactor-business-logic-package.png){width=300}

3. プラットフォーム依存のコードに関する警告はすべて無視し、**Refactor Anyway** をクリックします。

   ![Warnings about platform-dependent code](warnings-android-specific-code.png){width=450}

4. Android固有のコードをクロスプラットフォームのKotlinコードに置き換えるか、[期待される宣言と実際の宣言（expected and actual declarations）](multiplatform-connect-to-apis.md)を使用してAndroid固有のAPIに接続することで、Android固有のコードを削除します。詳細は以下のセクションを参照してください：

   #### Android固有のコードをクロスプラットフォームコードに置き換える {initial-collapse-state="collapsed" collapsible="true"}
   
   AndroidとiOSの両方でコードが適切に動作するように、移動した `data` ディレクトリ内の可能な限りすべての場所で、JVMの依存関係をKotlinの依存関係に置き換えます。

   1. `LoginDataValidator` クラスで、`android.utils` パッケージの `Patterns` クラスを、メール検証のパターンに一致するKotlinの正規表現に置き換えます：
   
       ```kotlin
       // Before
       private fun isEmailValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
       ```
   
       ```kotlin
       // After
       private fun isEmailValid(email: String) = emailRegex.matches(email)
       
       companion object {
           private val emailRegex = 
               ("[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}" +
                   "\\@" +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}" +
                   "(" +
                   "\\." +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}" +
                   ")+").toRegex()
       }
       ```
   
   2. `Patterns` クラスのインポート文を削除します：
   
       ```kotlin
       import android.util.Patterns
       ```

   3. `LoginDataSource` クラスで、`login()` 関数の `IOException` を `RuntimeException` に置き換えます。`IOException` は Kotlin/JVM 以外では利用できません。

          ```kotlin
          // Before
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // After
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. `IOException` のインポート文も削除します：

       ```kotlin
       import java.io.IOException
       ```

   #### プラットフォーム固有のUUID生成の実装 {initial-collapse-state="collapsed" collapsible="true"}
   
   `LoginDataSource` クラスでは、`fakeUser` 用の汎用一意識別子（UUID）が `java.util.UUID` クラスを使用して生成されていますが、これはiOSでは利用できません。
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   Kotlin標準ライブラリは[UUID生成用のクラス](https://kotlinlang.org/docs/uuids.html)を提供していますが、ここでは練習のためにプラットフォーム固有の機能を使用してみましょう。
   
   共有コードに `randomUUID()` 関数の `expect` 宣言を提供し、AndroidとiOSの各プラットフォームに対応するソースセットにその `actual` 実装を提供します。詳細は[プラットフォーム固有のAPIへの接続](multiplatform-connect-to-apis.md)で確認できます。
   
   1. `login()` 関数内の `java.util.UUID.randomUUID()` 呼び出しを、各プラットフォームで実装する `randomUUID()` 呼び出しに変更します：
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. `shared/src/commonMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに `Utils.kt` ファイルを作成し、`expect` 宣言を記述します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. `shared/src/androidMain` ディレクトリ의 `com.jetbrains.simplelogin.shared` パッケージに `Utils.android.kt` ファイルを作成し、Androidでの `randomUUID()` の `actual` 実装を記述します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. `shared/src/iosMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに `Utils.ios.kt` ファイルを作成し、iOSでの `randomUUID()` の `actual` 実装を記述します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. `shared/src/commonMain` ディレクトリの `LoginDataSource.kt` ファイルで `randomUUID` 関数をインポートします：
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
これで、KotlinはAndroidとiOSでそれぞれのプラットフォーム固有のUUID実装を使用するようになります。

### Androidでクロスプラットフォームアプリケーションを実行する

`app` 実行構成を実行し、Androidアプリが以前と同じように動作することを確認します。

![Android login application](android-login.png){width=300}

## クロスプラットフォームアプリケーションをiOSで動作させる

Androidアプリケーションをクロスプラットフォーム化したら、iOSアプリケーションを作成し、その中で共有ビジネスロジックを再利用できます。

1. [XcodeでiOSプロジェクトを作成する](#create-an-ios-project-in-xcode)
2. [KMPフレームワークを使用するようにiOSプロジェクトを設定する](#configure-the-ios-project-to-use-a-kmp-framework)
3. [Android StudioでiOSの実行構成をセットアップする](#set-up-an-ios-run-configuration-in-android-studio)
4. [iOSプロジェクトで共有モジュールを使用する](#use-the-shared-module-in-the-ios-project)

### XcodeでiOSプロジェクトを作成する

1. Xcodeで、**File** | **New** | **Project** をクリックします。
2. ダイアログで **iOS** タブに切り替えます：

   ![iOS project template](ios-project-wizard-1.png){width=700}

3. **App** テンプレートを選択し、**Next** をクリックします。

4. プロダクト名として "simpleLoginIOS" を指定し、**Next** をクリックします。

   ![iOS project settings](ios-project-wizard-2.png){width=700}

5. プロジェクトの保存場所として、クロスプラットフォームアプリケーションが保存されているディレクトリ（例：`kmp-integration-sample`）を選択します。

    Android Studioでは、以下の構造になります：
    
    ![iOS project in Android Studio](ios-project-in-as.png){width=194}

6. クロスプラットフォームプロジェクトの他のトップレベルディレクトリとの一貫性を保つために、Xcodeを閉じてから `simpleLoginIOS` ディレクトリを `iosApp` にリネームします。

   > Xcodeを開いたままフォルダ名を変更すると、警告が表示されたり、プロジェクトが破損したりする可能性があります。
   >
   {style="warning"}

   ![Renamed iOS project directory in Android Studio](ios-directory-renamed-in-as.png){width=194}

### KMPフレームワークを使用するようにiOSプロジェクトを設定する

iOSアプリとKotlinマルチプラットフォームによってビルドされたフレームワーク間の統合を直接セットアップできます。

> この方法の代替案（SwiftPM および CocoaPods）については、[iOS統合方法の概要](multiplatform-ios-integration-overview.md)で説明されています。
> 
{style="note"}

1. Android Studioで `iosApp/simpleLoginIOS.xcodeproj` ディレクトリを右クリックし、**Open In** | **Open In Associated Application** を選択して、XcodeでiOSプロジェクトを開きます。
2. Xcodeで、**Project** ナビゲーターのプロジェクト名をクリックして、iOSプロジェクトの設定を開きます。

3. 左側の **Targets** セクションで **simpleLoginIOS** を選択し、**Build Phases** タブをクリックします。

4. **+** アイコンをクリックし、**New Run Script Phase** を選択します。

    ![Add a run script phase](xcode-run-script-phase-1.png){width=700}

5. 実行スクリプト（run script）フィールドに以下のスクリプトを貼り付けます：

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. **Based on dependency analysis** オプションを無効にします。
   これにより、Xcodeはビルドのたびにスクリプトを実行し、出力依存関係の欠落に関する警告が毎回出ないようになります。

   ![Add the script](xcode-run-script-phase-2.png){width=700}

7. **Run Script** フェーズを上に移動し、**Compile Sources** フェーズの前に配置します：

   ![Move the Run Script phase](xcode-run-script-phase-3.png){width=700}

8. **Build Settings** タブの **Build Options** で、**User Script Sandboxing** オプションを無効にします：

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > デフォルトの `Debug` または `Release` と異なるカスタムビルド構成を使用している場合は、**Build Settings** タブの **User-Defined** に `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定を追加し、`Debug` または `Release` に設定してください。
   >
   {style="note"}

9. **Info** タブで、カスタムの `CADisableMinimumFrameDurationOnPhone` プロパティを追加し、`YES` に設定して、iOSでの高リフレッシュレートを有効にします。

10. **Signing & Capabilities** タブで、開発チームを選択するか、まだ作成していない場合は作成します。これにより、KMPモジュールによって生成された `shared` フレームワークの署名が可能になります。

    また、ここで **Bundle Identifier** が一意の値に設定されていることを確認してください。そうでない場合、Xcodeでビルドが失敗する可能性があります。

11. Xcodeでプロジェクトをビルドします（メインメニューの **Product** | **Build**）。
    すべてが正しく設定されていれば、プロジェクトのビルドに成功するはずです（「build phase will be run during every build」という警告は無視しても問題ありません）。
   
    > **User Script Sandboxing** オプションを無効にする前にプロジェクトをビルドした場合、ビルドが失敗することがあります。Gradleデーモンプロセスがサンドボックス化されている可能性があるため、再起動が必要です。
    > プロジェクトディレクトリ（この例では `kmp-integration-sample`）で次のコマンドを実行して、プロジェクトを再度ビルドする前に停止させてください：
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### Android StudioでiOSの実行構成をセットアップする

Xcodeが正しくセットアップされたことを確認したら、Android Studioに戻ります：

1. メインメニューで **File | Sync Project with Gradle Files** を選択します。Android Studioは自動的に **simpleLoginIOS** という実行構成を生成します。

   Android Studioは自動的に **simpleLoginIOS** という実行構成を生成し、`iosApp` ディレクトリをリンクされたXcodeプロジェクトとしてマークします。

2. 実行構成のリストから **simpleLoginIOS** を選択します。
   iOSエミュレータを選択し、**Run** をクリックしてiOSの実行構成が正しく動作することを確認します。

   ![The iOS run configuration in the list of run configurations](ios-run-configuration-simplelogin.png)

### iOSプロジェクトで共有モジュールを使用する

`shared/build.gradle.kts` ファイルは、各iOSターゲットの `binaries.framework.baseName` プロパティを `sharedKit` として定義しています。
これが、iOSアプリが利用するためにKotlinマルチプラットフォームがビルドするフレームワークの名前です。

統合をテストするために、Swiftコードから共通コードへの呼び出しを追加します：

1. Android Studioで `iosApp/simpleloginIOS/ContentView.swift` ファイルを開き、フレームワークをインポートします：

   ```swift
   import sharedKit
   ```

2. 適切に接続されているか確認するために、`shared` モジュールの `greet()` 関数を使用するように `ContentView` 構造体のコードを更新します：

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. Android StudioのiOS実行構成を使用してアプリを実行し、結果を確認します：

   ![Greeting from the shared module](xcode-iphone-hello.png){width=300}

4. 共有モジュールのビジネスロジックを使用してアプリケーションUIをレンダリングするために、`ContentView.swift` ファイルのコードを再度更新します：

   ```kotlin
   
   ```

5. `simpleLoginIOSApp.swift` ファイルで `sharedKit` モジュールをインポートし、`ContentView()` 関数の引数を指定します：

    ```swift
    import SwiftUI
    import sharedKit
    
    @main
    struct SimpleLoginIOSApp: App {
        var body: some Scene {
            WindowGroup {
                ContentView(viewModel: .init(loginRepository: LoginRepository(dataSource: LoginDataSource()), loginValidator: LoginDataValidator()))
            }
        }
    }
    ```

6. iOSの実行構成を再度実行し、iOSアプリにログインフォームが表示されることを確認します。
7. ユーザー名に "Jane"、パスワードに "password" と入力します。
8. [以前に統合をセットアップした](#configure-the-ios-project-to-use-a-kmp-framework)ため、iOSアプリは共通コードを使用して入力を検証します：

   ![Simple login application](xcode-iphone-login.png){width=300}

## 結果を楽しむ – ロジックの更新は一度だけ

これで、アプリケーションはクロスプラットフォームになりました。`shared` モジュールでビジネスロジックを更新すると、AndroidとiOSの両方で結果を確認できます。

1. ユーザーのパスワードの検証ロジックを変更します。"password" を有効なオプションにしないようにします。
    そのためには、`LoginDataValidator` クラスの `checkPassword()` 関数を更新します
    （すぐに見つけるには、<shortcut>Shift</shortcut> を2回押し、クラス名を入力して **Classes** タブに切り替えます）：

   ```kotlin
   package com.jetbrains.simplelogin.shared.data
   
   class LoginDataValidator {
   //...
       fun checkPassword(password: String): Result {
           return when {
               password.length < 5 -> Result.Error("Password must be >5 characters")
               password.lowercase() == "password" -> Result.Error("Password shouldn't be \"password\"")
               else -> Result.Success
           }
       }
   //...
   }
   ```

2. Android StudioからiOS and Androidの両方のアプリケーションを実行して、変更を確認します
   （iOSのエラーメッセージは、赤い警告の三角形をタップすると表示されます）：

   ![Android and iOS applications password error](android-iphone-password-error.png){width=600}

このチュートリアルの[最終的なコード](https://github.com/Kotlin/kmp-integration-sample/tree/final)を確認できます。

## 他に何を共有できるか？

アプリケーションのビジネスロジックを共有しましたが、アプリケーションの他のレイヤーを共有することも決定できます。
たとえば、`ViewModel` クラスのコードは [Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt) と [iOSアプリケーション](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84) でほぼ同じであり、モバイルアプリケーションが同じプレゼンテーションレイヤーを持つ必要がある場合は、それを共有できます。

## 次のステップ

Androidアプリケーションをクロスプラットフォーム化した後は、以下に進むことができます：

* [マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md)
* [Android依存関係の追加](multiplatform-android-dependencies.md)
* [iOS依存関係の追加](multiplatform-ios-dependencies.md)

Compose Multiplatformを使用して、すべてのプラットフォームで統合されたUIを作成できます：

* [Compose MultiplatformとJetpack Composeについて学ぶ](compose-multiplatform-and-jetpack-compose.md)
* [Compose Multiplatformで利用可能なリソースを探索する](compose-multiplatform-resources.md)
* [共有ロジックとUIを備えたアプリを作成する](compose-multiplatform-create-first-app.md)

コミュニティのリソースもチェックしてみてください：

* [ビデオ: AndroidプロジェクトをKotlinマルチプラットフォームに移行する方法](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [ビデオ: Kotlin JVMコードをKotlinマルチプラットフォームに対応させる3つの方法](https://www.youtube.com/watch?v=X6ckI1JWjqo)