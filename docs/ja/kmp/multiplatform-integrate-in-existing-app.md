[//]: # (title: Android アプリケーションを iOS で動作させる – チュートリアル)

<secondary-label ref="Android Studio"/>

このチュートリアルでは、既存の Android アプリケーションをクロスプラットフォーム化し、Android と iOS の両方で動作させる方法を説明します。
Android と iOS の両方のコードを一度に、同じ場所で記述できるようになります。

このチュートリアルでは、ユーザー名とパスワードを入力するための単一画面を持つ [サンプル Android アプリケーション](https://github.com/Kotlin/kmp-integration-sample) を使用します。入力された認証情報は検証され、インメモリデータベースに保存されます。

アプリケーションを iOS と Android の両方で動作させるには、まず一部のコードを共有モジュール（shared module）に移動してコードをクロスプラットフォーム化します。
その後、クロスプラットフォーム化したコードを Android アプリケーションで使用し、さらに同じコードを新しい iOS アプリケーションでも使用します。

> Kotlin Multiplatform にまだ慣れていない場合は、まず [クロスプラットフォームアプリケーションをゼロから作成する](quickstart.md) 方法をご覧ください。
>
{style="tip"}

## 開発環境の準備 {id="prepare-an-environment-for-development"}

1. クイックスタートの指示に従って、[Kotlin Multiplatform 開発用の環境をセットアップ](quickstart.md#set-up-the-environment) します。

   > iOS アプリケーションの実行など、このチュートリアルの特定の手順を完了するには macOS を搭載した Mac が必要です。
   > これは Apple の要件によるものです。
   >
   {style="note"}

2. Android Studio で、バージョン管理から新しいプロジェクトを作成します：

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` ブランチにはプロジェクトの初期状態（シンプルな Android アプリケーション）が含まれています。
   iOS アプリケーションと共有モジュールを含む最終状態を確認するには、`final` ブランチに切り替えてください。
   
3. **Project** ビューに切り替えます：

   ![Project ビュー](switch-to-project.png){width="513"}

## コードのクロスプラットフォーム化 {id="make-your-code-cross-platform"}

コードをクロスプラットフォーム化するには、以下の手順に従います：

1. [クロスプラットフォーム化するコードの決定](#decide-what-code-to-make-cross-platform)
2. [クロスプラットフォームコード用の共有モジュールの作成](#create-a-shared-module-for-cross-platform-code)
3. [コード共有のテスト](#add-code-to-the-shared-module)
4. [Android アプリケーションに共有モジュールへの依存関係を追加](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [ビジネスロジックのクロスプラットフォーム化](#make-the-business-logic-cross-platform)
6. [Android でクロスプラットフォームアプリケーションを実行](#run-your-cross-platform-application-on-android)

### クロスプラットフォーム化するコードの決定 {id="decide-what-code-to-make-cross-platform"}

Android アプリケーションのどのコードを iOS と共有し、どのコードをネイティブのまま残すかを決定します。シンプルなルールとして、「可能な限り再利用したいものを共有する」というものがあります。ビジネスロジックは Android と iOS の両方で同じであることが多いため、再利用に最適な候補です。

サンプルの Android アプリケーションでは、ビジネスロジックは `com.jetbrains.simplelogin.androidapp.data` パッケージに格納されています。今後作成する iOS アプリケーションでも同じロジックを使用するため、これもクロスプラットフォーム化する必要があります。

![共有するビジネスロジック](business-logic-to-share.png){width=366}

### クロスプラットフォームコード用の共有モジュールの作成 {id="create-a-shared-module-for-cross-platform-code"}

iOS と Android の両方で使用されるクロスプラットフォームコードは、共有モジュールに格納されます。
Android Studio と IntelliJ IDEA の両方に、Kotlin Multiplatform 用の共有モジュールを作成するためのウィザードが用意されています。

既存の Android アプリケーションと今後作成する iOS アプリケーションの両方に接続するための共有モジュールを作成します：

1. Android Studio で、メインメニューから **File** | **New** | **New Module** を選択します。
2. テンプレートの一覧から **Kotlin Multiplatform Shared Module** を選択します。
   モジュール名は `shared` のままにし、パッケージ名を入力します：
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. **Finish** をクリックします。ウィザードによって共有モジュールが作成され、それに応じてビルドスクリプトが変更され、Gradle の同期（sync）が開始されます。
4. 同期が完了するのを待ちます。
   `shared` ディレクトリ内に以下のようなファイル構造が表示されます：

   ![shared ディレクトリ内の最終的なファイル構造](shared-directory-structure.png){width="341"}

   生成されたプロジェクトのレイアウトをより詳しく理解したい場合は、[Kotlin Multiplatform プロジェクト構造の基本](multiplatform-discover-project.md) を参照してください。

5. `shared` モジュールは Android アプリケーションのライブラリとして使用されるため、`shared/build.gradle.kts` 内の `kotlin.android {}` ブロックを以下の `androidLibrary {}` ブロックに置き換えます：

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
   
### 共有モジュールへのコードの追加 {id="add-code-to-the-shared-module"}

共有モジュールが作成できたので、`shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` ディレクトリに共有する共通コードを追加します：

1. 以下のコードを含む新しい `Greeting` クラスを作成します：

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 既存のファイル内のコードを以下のように置き換えます：

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

これで、プラットフォーム名をプロパティとして持つプラットフォーム固有のオブジェクトを返す共通の `getPlatform()` 関数が用意できました。

### Android アプリケーションに共有モジュールへの依存関係を追加 {id="add-a-dependency-on-the-shared-module-to-your-android-application"}

Android アプリケーションでクロスプラットフォームコードを使用するには、共有モジュールを接続し、ビジネスロジックコードをそこに移動して、そのコードをクロスプラットフォーム化します。

1. `app/build.gradle.kts` ファイルに共有モジュールへの依存関係を追加します：

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. IDE のプロンプトに従うか、**File** | **Sync Project with Gradle Files** メニュー項目を使用して Gradle ファイルを同期します。
3. `app/src/main/java/` ディレクトリで、`com.jetbrains.simplelogin.androidapp.ui.login` パッケージ内の `LoginActivity.kt` ファイルを開きます。
4. 共有モジュールがアプリケーションに正常に接続されていることを確認するために、`onCreate()` メソッドに `Log.i()` 呼び出しを追加して `greet()` 関数の結果をログに出力します：

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. IDE の提案に従って、不足しているクラスをインポートします。
6. ツールバーで、実行構成ドロップダウンの横にあるデバッグアイコンをクリックします：

   ![デバッグするリストからのアプリ](app-list-android.png){width="300"}

7. **Logcat** ツールウィンドウでログ内の「Hello」を検索すると、共有モジュールからの挨拶が表示されます：

   ![共有モジュールからの挨拶](shared-module-greeting.png){width="700"}

### ビジネスロジックのクロスプラットフォーム化 {id="make-the-business-logic-cross-platform"}

これで、ビジネスロジックコードを Kotlin Multiplatform 共有モジュールの `commonMain` ソースセットに抽出できるようになりました。
これにより、Android と iOS の両方でコードを使用できるようになります。

1. ビジネスロジックコード `com.jetbrains.simplelogin.androidapp.data` を `app` ディレクトリから `shared/src/commonMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージへ移動します。

   ![ビジネスロジックコードを含むパッケージをドラッグ＆ドロップ](moving-business-logic.png){width=300}

2. Android Studio からどのような処理を行うか尋ねられたら、パッケージの移動を選択し、リファクタリングを承認します。

   ![ビジネスロジックパッケージのリファクタリング](refactor-business-logic-package.png){width=300}

3. プラットフォーム依存のコードに関するすべての警告を無視し、**Refactor Anyway** をクリックします。

   ![プラットフォーム依存コードに関する警告](warnings-android-specific-code.png){width=450}

4. Android 固有のコードをクロスプラットフォームの Kotlin コードに置き換えるか、[expect/actual 宣言](multiplatform-connect-to-apis.md) を使用して Android 固有の API に接続することで、Android 固有のコードを削除します。詳細については以下のセクションを参照してください：

   #### Android 固有のコードをクロスプラットフォームコードに置き換える {initial-collapse-state="collapsed" collapsible="true" id="replace-android-specific-code-with-cross-platform-code"}
   
   コードが Android と iOS の両方で適切に動作するように、移動した `data` ディレクトリ内のすべての JVM 依存関係を可能な限り Kotlin の依存関係に置き換えます。

   1. `LoginDataValidator` クラスで、`android.utils` パッケージの `Patterns` クラスを、メール検証用のパターンに一致する Kotlin の正規表現に置き換えます：
   
       ```kotlin
       // 変更前
       private fun isEmailValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
       ```
   
       ```kotlin
       // 変更後
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
   
   2. `Patterns` クラスのインポートディレクティブを削除します：
   
       ```kotlin
       import android.util.Patterns
       ```

   3. `LoginDataSource` クラスで、`login()` 関数内の `IOException` を `RuntimeException` に置き換えます。
      `IOException` は Kotlin/JVM 以外では利用できません。

          ```kotlin
          // 変更前
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // 変更後
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. `IOException` のインポートディレクティブも同様に削除します：

       ```kotlin
       import java.io.IOException
       ```

   #### プラットフォーム固有の UUID 生成を実装する {initial-collapse-state="collapsed" collapsible="true" id="implement-platform-specific-uuid-generation"}
   
   `LoginDataSource` クラスでは、`fakeUser` の汎用一意識別子（UUID）が `java.util.UUID` クラスを使用して生成されていますが、これは iOS では利用できません。
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   Kotlin 標準ライブラリには [UUID 生成用のクラス](https://kotlinlang.org/docs/uuids.html) が用意されていますが、ここではプラットフォーム固有の機能の接続を練習するために、プラットフォーム固有の機能を使用してみましょう。
   
   共有コードで `randomUUID()` 関数の `expect` 宣言を提供し、Android と iOS の各プラットフォームに対応するソースセットでその `actual` 実装を提供します。
   詳細については、[プラットフォーム固有の API への接続](multiplatform-connect-to-apis.md) を参照してください。
   
   1. `login()` 関数内の `java.util.UUID.randomUUID()` 呼び出しを、各プラットフォーム向けに実装する `randomUUID()` 呼び出しに変更します：
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. `shared/src/commonMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに `Utils.kt` ファイルを作成し、`expect` 宣言を提供します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. `shared/src/androidMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに `Utils.android.kt` ファイルを作成し、Android 向けの `randomUUID()` の `actual` 実装を提供します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. `shared/src/iosMain` ディレクトリの `com.jetbrains.simplelogin.shared` パッケージに `Utils.ios.kt` ファイルを作成し、iOS 向けの `randomUUID()` の `actual` 実装を提供します：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. `shared/src/commonMain` ディレクトリの `LoginDataSource.kt` ファイルに `randomUUID` 関数をインポートします：
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
これで、Kotlin は Android と iOS 向けにプラットフォーム固有の UUID 実装を使用するようになります。

### Android でクロスプラットフォームアプリケーションを実行 {id="run-your-cross-platform-application-on-android"}

`app` 実行構成を実行して、Android アプリが以前と同じように動作することを確認します。

![Android ログインアプリケーション](android-login.png){width=300}

## iOS でクロスプラットフォームアプリケーションを動作させる {id="make-your-cross-platform-application-work-on-ios"}

Android アプリケーションをクロスプラットフォーム化したら、iOS アプリケーションを作成し、共有ビジネスロジックをその中で再利用できます。

1. [Xcode で iOS プロジェクトを作成](#create-an-ios-project-in-xcode)
2. [KMP フレームワークを使用するように iOS プロジェクトを設定](#configure-the-ios-project-to-use-a-kmp-framework)
3. [Android Studio で iOS の実行構成を設定](#set-up-an-ios-run-configuration-in-android-studio)
4. [iOS プロジェクトで共有モジュールを使用](#use-the-shared-module-in-the-ios-project)

### Xcode で iOS プロジェクトを作成 {id="create-an-ios-project-in-xcode"}

1. Xcode で、**File** | **New** | **Project** をクリックします。
2. ダイアログで、**iOS** タブに切り替えます：

   ![iOS プロジェクトテンプレート](ios-project-wizard-1.png){width=700}

3. **App** テンプレートを選択し、**Next** をクリックします。

4. プロダクト名として「simpleLoginIOS」を指定し、**Next** をクリックします。

   ![iOS プロジェクト設定](ios-project-wizard-2.png){width=700}

5. プロジェクトの保存場所として、クロスプラットフォームアプリケーションを格納しているディレクトリ（例: `kmp-integration-sample`）を選択します。

    Android Studio では、以下のような構造になります：
    
    ![Android Studio 内の iOS プロジェクト](ios-project-in-as.png){width=194}

6. クロスプラットフォームプロジェクトの他のトップレベルディレクトリとの一貫性を保つため、Xcode を閉じて、`simpleLoginIOS` ディレクトリの名前を `iosApp` に変更します。

   > Xcode を開いたままフォルダの名前を変更すると、警告が表示され、プロジェクトが破損する可能性があります。
   >
   {style="warning"}

   ![Android Studio で名前を変更した iOS プロジェクトディレクトリ](ios-directory-renamed-in-as.png){width=194}

### KMP フレームワークを使用するように iOS プロジェクトを設定 {id="configure-the-ios-project-to-use-a-kmp-framework"}

iOS アプリと Kotlin Multiplatform によってビルドされたフレームワークとの連携を直接設定できます。

> この方法の代替手段（SwiftPM および CocoaPods）については、[iOS 連携方法の概要](multiplatform-ios-integration-overview.md) で説明されています。
> 
{style="note"}

1. Android Studio で、`iosApp/simpleLoginIOS.xcodeproj` ディレクトリを右クリックし、**Open In** | **Open In Associated Application** を選択して Xcode で iOS プロジェクトを開きます。
2. Xcode で、**Project** ナビゲータのプロジェクト名をクリックして iOS プロジェクト設定を開きます。

3. 左側の **Targets** セクションで **simpleLoginIOS** を選択し、**Build Phases** タブをクリックします。

4. **+** アイコンをクリックし、**New Run Script Phase** を選択します。

    ![Run Script フェーズの追加](xcode-run-script-phase-1.png){width=700}

5. run script フィールドに以下のスクリプトを貼り付けます：

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. **Based on dependency analysis** オプションを無効にします。
   これにより、Xcode がビルドのたびにスクリプトを実行するようになり、出力の依存関係の欠落に関する警告が毎回表示されるのを防ぎます。

   ![スクリプトの追加](xcode-run-script-phase-2.png){width=700}

7. **Run Script** フェーズを上へ移動し、**Compile Sources** フェーズの前に配置します：

   ![Run Script フェーズの移動](xcode-run-script-phase-3.png){width=700}

8. **Build Settings** タブで、**Build Options** の下にある **User Script Sandboxing** オプションを無効にします：

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > デフォルトの `Debug` や `Release` と異なるカスタムビルド構成を使用している場合は、**Build Settings** タブの **User-Defined** に `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定を追加し、`Debug` または `Release` に設定してください。
   >
   {style="note"}

9. **Info** タブで、カスタムの `CADisableMinimumFrameDurationOnPhone` プロパティを追加し、`YES` に設定して iOS での高リフレッシュレートを有効にします。

10. **Signing & Capabilities** タブで、開発チームを選択するか、まだ作成していない場合は作成します。
    これにより、KMP モジュールによって生成された `shared` フレームワークの署名が有効になります。

    ここでは、**Bundle Identifier** に一意の値が設定されていることも確認してください。そうしないと Xcode でビルドに失敗する可能性があります。

11. Xcode でプロジェクトをビルドします（メインメニューの **Product** | **Build**）。
    すべてが正しく設定されていれば、プロジェクトは正常にビルドされるはずです
    （「build phase will be run during every build」という警告は無視しても問題ありません）。
   
    > **User Script Sandboxing** オプションを無効にする前にプロジェクトをビルドした場合、ビルドが失敗することがあります。
    > Gradle デーモンプロセスがサンドボックス化されている可能性があるため、再起動が必要です。
    > プロジェクトディレクトリ（この例では `kmp-integration-sample`）で次のコマンドを実行し、プロジェクトを再度ビルドする前にデーモンを停止してください：
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### Android Studio で iOS の実行構成を設定 {id="set-up-an-ios-run-configuration-in-android-studio"}

Xcode のセットアップが正しく完了していることを確認したら、Android Studio に戻ります：

1. メインメニューで **File | Sync Project with Gradle Files** を選択します。Android Studio は **simpleLoginIOS** という名前の実行構成を自動的に生成します。

   Android Studio は **simpleLoginIOS** という名前の実行構成を自動的に生成し、`iosApp` ディレクトリをリンクされた Xcode プロジェクトとしてマークします。

2. 実行構成のリストで **simpleLoginIOS** を選択します。
   iOS エミュレータを選択し、**Run** をクリックして iOS 実行構成が正しく動作することを確認します。

   ![実行構成リスト内の iOS 実行構成](ios-run-configuration-simplelogin.png)

### iOS プロジェクトで共有モジュールを使用 {id="use-the-shared-module-in-the-ios-project"}

`shared/build.gradle.kts` ファイルでは、各 iOS ターゲットの `binaries.framework.baseName` プロパティが `sharedKit` として定義されています。
これは、Kotlin Multiplatform が iOS アプリで使用するためにビルドするフレームワークの名前です。

連携をテストするために、Swift コードに共通コードへの呼び出しを追加します：

1. Android Studio で `iosApp/simpleloginIOS/ContentView.swift` ファイルを開き、フレームワークをインポートします：

   ```swift
   import sharedKit
   ```

2. 適切に接続されていることを確認するために、`ContentView` 構造体のコードを更新して `shared` モジュールの `greet()` 関数を使用するようにします：

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. Android Studio の iOS 実行構成を使用してアプリを実行し、結果を確認します：

   ![共有モジュールからの挨拶](xcode-iphone-hello.png){width=300}

4. `ContentView.swift` ファイルのコードを再度更新し、共有モジュールのビジネスロジックを使用してアプリケーション UI を描画します：

   ```kotlin
   
   ```

5. `simpleLoginIOSApp.swift` ファイルで、`sharedKit` モジュールをインポートし、`ContentView()` 関数の引数を指定します：

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

6. iOS 実行構成を再度実行して、iOS アプリにログインフォームが表示されることを確認します。
7. ユーザー名に「Jane」、パスワードに「password」と入力します。
8. [先ほど連携を設定した](#configure-the-ios-project-to-use-a-kmp-framework) ため、iOS アプリは共通コードを使用して入力を検証します：

   ![シンプルなログインアプリケーション](xcode-iphone-login.png){width=300}

## 結果の確認 – ロジックの更新は一度だけ {id="enjoy-the-results-update-the-logic-only-once"}

これでアプリケーションがクロスプラットフォーム化されました。`shared` モジュールのビジネスロジックを更新すれば、Android と iOS の両方でその結果を確認できます。

1. ユーザーのパスワードの検証ロジックを変更します：「password」は無効なオプションとします。
    これを行うには、`LoginDataValidator` クラスの `checkPassword()` 関数を更新します
    （素早く見つけるには、<shortcut>Shift</shortcut> を2回押し、クラス名を貼り付けて **Classes** タブに切り替えます）：

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

2. Android Studio から iOS と Android の両方のアプリケーションを実行して変更を確認します
   （iOS のエラーメッセージは、赤い警告三角形をタップすると表示されます）：

   ![Android および iOS アプリケーションのパスワードエラー](android-iphone-password-error.png){width=600}

このチュートリアルの [最終的なコード](https://github.com/Kotlin/kmp-integration-sample/tree/final) を確認できます。

## 他に何を共有できるか？ {id="what-else-to-share"}

ここではアプリケーションのビジネスロジックを共有しましたが、アプリケーションの他のレイヤーも共有することを検討できます。
たとえば、`ViewModel` クラスのコードは [Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt) と [iOS アプリケーション](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84) でほぼ同じであり、モバイルアプリケーションで同一のプレゼンテーション層を持たせる必要がある場合は、これも共有することが可能です。

## 次のステップ {id="what-s-next"}

Android アプリケーションをクロスプラットフォーム化したら、さらに以下のステップに進むことができます：

* [マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md)
* [Android 依存関係の追加](multiplatform-android-dependencies.md)
* [iOS 依存関係の追加](multiplatform-ios-dependencies.md)

Compose Multiplatform を使用して、すべてのプラットフォームで統一された UI を作成できます：

* [Compose Multiplatform と Jetpack Compose について学ぶ](compose-multiplatform-and-jetpack-compose.md)
* [Compose Multiplatform の利用可能なリソースを確認する](compose-multiplatform-resources.md)
* [共有ロジックと UI を持つアプリを作成する](compose-multiplatform-new-project.md)

コミュニティリソースも確認できます：

* [動画: Android プロジェクトを Kotlin Multiplatform に移行する方法](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [動画: Kotlin JVM コードを Kotlin Multiplatform に対応させる3つの方法](https://www.youtube.com/watch?v=X6ckI1JWjqo)