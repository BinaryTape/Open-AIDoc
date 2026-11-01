[//]: # (title: 推奨される Kotlin Multiplatform プロジェクト構造)
<show-structure for="chapter,procedure" depth="3"/>

[基本](multiplatform-discover-project.md)および[高度](multiplatform-advanced-project-structure.md)なプロジェクト構造の概念の概要を通じて、ソースセットと依存関係の管理について理解できたかと思います。
では、ソースセットを整理し、依存関係に依存するモジュール自体はどう構成すべきでしょうか？

> この記事では、特に KMP プロジェクトについて説明します。
> モジュール化の意思決定に関する一般的な理解については、[Android のモジュール化の概要](https://developer.android.com/topic/modularization)を参照してください。

## 最適なモジュール構造 {id="optimal-module-structure"}

最適なモジュール構造は、目的や必要なターゲットによって異なります。
デフォルトでプロジェクトがどのように構成されているかを確認するには、KMP IDE プラグインのウィザードでさまざまな構成やターゲットのセットを指定した際の出力を分析してみてください。

一般的なアプローチは次のようにまとめられます：
* アプリのエントリポイントは個別のモジュールに配置し、それぞれのモジュールが必要な共有コードモジュールに依存するようにします。
* 共有コードは一般にビジネスロジックと UI に分割され、不要な依存関係を避ける戦略をとります：
  * KMP プロジェクトによって作成されるすべてのアプリで共有 UI コードと共有ビジネスロジックの両方を使用する場合、すべての共有コードに対して単一の `shared` モジュールを用意するだけで十分な場合があります。
  * いずれかのアプリの UI がネイティブコードで記述されている場合（たとえば、iOS の UI を純粋な Swift で実装した場合）、不要な場所で Compose Multiplatform への依存が発生するのを避けるため、UI コードをビジネスロジックから分離するのが合理的です。
    そのため、`sharedLogic` モジュールと `sharedUI` モジュールを用意し、必要に応じてエントリポイントモジュールへの依存関係として追加できます。
* プロジェクトにクライアントアプリとロジックを共有するサーバーコードが含まれている場合、推奨される構成は次のとおりです：
  * 上記のように構成されたエントリポイントモジュールとクライアント共通コードモジュールを含む `app` フォルダ。
  * サーバー固有のコードを含む `server` モジュール。
  * モデルやバリデーションなど、サーバーとクライアント間で共有されるコード用の `core` モジュール。

プロジェクトで、アプリのエントリポイントと共有コードが単一のモジュールに含まれる古い構造を使用している場合は、以下のガイドに従ってエントリポイントを個別のモジュールに抽出できます。

> Android Gradle Plugin 9 以降を使用する場合は、Android アプリのエントリポイントを共通コードから分離することが必須となります。
> 詳細については、[AGP 9 移行に関する記事](multiplatform-project-agp-9-migration.md)を参照してください。
> 
{style="note"}

## アプリのエントリポイント用に個別のモジュールを作成する {id="creating-separate-modules-for-app-entry-points"}

推奨構造への移行を説明するために使用するサンプルプロジェクトは、サンプルリポジトリの [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) ブランチにある古い Compose Multiplatform サンプルです。

このサンプルは、すべての共有コードと KMP エントリポイントを含む単一の Gradle モジュール（`composeApp`）と、iOS プロジェクトのコードと設定を含む `iosApp` フォルダで構成されています。

エントリポイントを独自のモジュールに抽出するには、モジュールを作成し、コードを移動し、新しいモジュールと共通コードモジュールの両方に対して設定を適宜調整する必要があります。

### Android アプリのエントリポイント用モジュール {id="android-app"}

#### Android アプリモジュールの作成と設定 {id="create-and-configure-the-android-app-module"}

Android アプリモジュール（`androidApp`）を作成するには：

1. プロジェクトのルートに `androidApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルの末尾に次の行を追加して、プロジェクト設定に新しいモジュールを追加します：

    ```kotlin
    include(":androidApp")
    ```
4. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。

#### Android アプリ用ビルドスクリプトの設定 {id="configure-the-build-script-for-the-android-app"}

新しいモジュールの Gradle ビルドスクリプトを設定します：

1. `gradle/libs.versions.toml` ファイルで、バージョンカタログに Kotlin Android Gradle プラグインを追加します：

    ```toml
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. `androidApp/build.gradle.kts` ファイルで、Android アプリモジュールに必要なプラグインを指定します：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. これらすべてのプラグインが**ルート**の `build.gradle.kts` ファイルに記載されていることを確認します：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 必要な依存関係を追加するには、`composeApp` のビルドスクリプトの `androidMain.dependencies {}` ブロックから既存の依存関係をコピーし、`composeApp` モジュール自体への依存関係を追加します。
   この例では、結果は次のようになります：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. Android 固有の設定が含まれる `composeApp/build.gradle.kts` ファイルの `android {}` ブロック全体を、`androidApp/build.gradle.kts` ファイルにコピーします。

6. `composeApp/build.gradle.kts` ファイルの `androidTarget {}` ブロックからコンパイラオプションを、`androidApp/build.gradle.kts` ファイルの `target {}` ブロックにコピーします：

    ```kotlin
    kotlin {
        target {
            compilerOptions {
                jvmTarget.set(JvmTarget.JVM_11)
            }
        }
    }
    ```

   > `composeApp` ビルドスクリプトに設定されているその他のプラグインやプロパティがある場合は、それらも `androidApp` ビルドスクリプトに移行してください。
   >
   {style="note"}

7. `composeApp` モジュールは実質的に Android ライブラリとなるため、Android アプリケーションから Android ライブラリへと設定を変更します。`composeApp/build.gradle.kts` で以下を行います：
   * Gradle プラグインの参照を変更します：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"/>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"/>
       </compare>

    * `android.defaultConfig {}` ブロックからアプリケーションプロパティの行を削除します：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"/>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"/>
       </compare>

8. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。

#### コードの移動と Android アプリの実行 {id="move-the-code-and-run-the-android-app"}

1. `composeApp/src/androidMain` ディレクトリを `androidApp/src/` ディレクトリに移動します。ただし、クロスプラットフォームのままにしておくべきコードに注意してください：

   * Android アプリを適切にビルドするには、サンプルの `MainActivity.kt` などのエントリポイントコードが `androidApp` モジュール内に存在する必要があります。
   * すべての[期待される宣言と実際の宣言 (expected and actual declarations)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)は、すべてのプラットフォームで利用できるようにするために、共通モジュール（この例では `composeApp`）のソースセットに残しておく必要があります。
     `androidApp` から `composeApp` への依存関係を設定しているため、宣言はエントリポイントコードでも利用できます。

2. `androidApp/src/androidMain` ディレクトリの名前を `main` に変更します。
3. すべてが正しく設定されていれば、`androidApp/src/main/.../MainActivity.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
4. IntelliJ IDEA または Android Studio を使用している場合、IDE は新しいモジュールを認識し、新しい実行構成（**androidApp**）を自動的に作成します。
   作成されない場合は、**composeApp** の Android 実行構成を手動で変更します：
   1. 実行構成のドロップダウンで **Edit Configurations** を選択します。
   2. **Android** カテゴリから **composeApp** 構成を見つけます。
   3. **General | Module** フィールドで、`demo.composeApp` を `demo.androidApp` に変更します。
5. 新しい実行構成を開始して、アプリが期待どおりに動作することを確認します。
6. すべてが正しく動作したら、`composeApp/build.gradle.kts` ファイルで `kotlin.sourceSets.androidMain.dependencies {}` ブロックを削除します。

これで、Android のエントリポイントを個別のモジュールに抽出できました。
次に、新しい Android-KMP ライブラリプラグインを使用するように共通コードモジュールを更新します。

### デスクトップ JVM アプリ {id="desktop-jvm-app"}

#### デスクトップアプリモジュールの作成と設定 {id="create-and-configure-the-desktop-app-module"}

デスクトップアプリモジュール（`desktopApp`）を作成するには：

1. プロジェクトのルートに `desktopApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルに次の行を追加して、プロジェクト設定に新しいモジュールを追加します：

    ```kotlin
    include(":desktopApp")
    ```

#### デスクトップアプリ用ビルドスクリプトの設定 {id="configure-the-build-script-for-the-desktop-app"}

デスクトップアプリのビルドスクリプトを機能させるには：

1. `gradle/libs.versions.toml` ファイルで、バージョンカタログに Kotlin JVM Gradle プラグインを追加します：

    ```toml
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```

2. `desktopApp/build.gradle.kts` ファイルで、共有 UI モジュールに必要なプラグインを指定します：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinJvm)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. これらすべてのプラグインが**ルート**の `build.gradle.kts` ファイルに記載されていることを確認します：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 他のモジュールへの必要な依存関係を追加するために、`composeApp` ビルドスクリプトの `commonMain.dependencies {}` および `jvmMain.dependencies {}` ブロックから既存の依存関係をコピーします。この例では、最終結果は次のようになります：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.sharedLogic)
           implementation(projects.sharedUI)
           implementation(compose.desktop.currentOs)
           implementation(libs.kotlinx.coroutinesSwing)
       }
   }
   ```

5. デスクトップ固有の設定が含まれる `composeApp/build.gradle.kts` ファイルの `compose.desktop {}` ブロックを、`desktopApp/build.gradle.kts` ファイルにコピーします：

    ```kotlin
    compose.desktop {
        application {
            mainClass = "compose.project.demo.MainKt"

            nativeDistributions {
                targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
                packageName = "compose.project.demo"
                packageVersion = "1.0.0"
            }
        }
    }
    ```
6. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。

#### コードの移動とデスクトップアプリの実行 {id="move-the-code-and-run-the-desktop-app"}

設定が完了したら、デスクトップアプリのコードを新しいディレクトリに移動します：

1. `desktopApp/src` ディレクトリ内に、新しい `main` ディレクトリを作成します。
2. `composeApp/src/jvmMain/kotlin` ディレクトリを `desktopApp/src/main/` ディレクトリに移動します：
   パッケージ座標が `compose.desktop {}` の設定と一致していることが重要です。
3. すべてが正しく設定されていれば、`desktopApp/src/main/.../main.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
4. デスクトップアプリを実行するには、**composeApp [jvm]** 実行構成を変更します：
   1. 実行構成のドロップダウンで **Edit Configurations** を選択します。
   2. **Gradle** カテゴリから **composeApp [jvm]** 構成を見つけます。
   3. **Gradle project** フィールドで、`ComposeDemo:composeApp` を `ComposeDemo:desktopApp` に変更します。
5. 更新した構成を開始して、アプリが期待どおりに動作することを確認します。
6. すべてが正しく動作したら：
   * `composeApp/src/jvmMain` ディレクトリを削除します。
   * `composeApp/build.gradle.kts` ファイルから、デスクトップ関連のコードを削除します：
       * `compose.desktop {}` ブロック
       * Kotlin `sourceSets {}` ブロック内の `jvmMain.dependencies {}` ブロック
       * `kotlin {}` ブロック内の `jvm()` ターゲット宣言

### Web アプリ {id="web-app"}

#### Web アプリモジュールの作成と設定 {id="create-and-configure-the-web-app-module"}

Web アプリモジュール（`webApp`）を作成するには：

1. プロジェクトのルートに `webApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルの末尾に次の行を追加して、プロジェクト設定に新しいモジュールを追加します：

    ```kotlin
    include(":webApp")
    ```

#### Web アプリ用ビルドスクリプトの設定 {id="configure-the-build-script-for-the-web-app"}

Web アプリのビルドスクリプトを機能させるには：

1. `webApp/build.gradle.kts` ファイルで、共有 UI モジュールに必要なプラグインを指定します：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. これらすべてのプラグインが**ルート**の `build.gradle.kts` ファイルに記載されていることを確認します：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. `composeApp/build.gradle.kts` ファイルから `webApp/build.gradle.kts` ファイルの `kotlin {}` ブロックへ、JavaScript および Wasm ターゲット宣言をコピーします：

    ```kotlin
    kotlin {
        js {
            browser()
            binaries.executable()
        }

        @OptIn(ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
    }
    ```

4. 他のモジュールへの必要な依存関係を追加します：

   ```kotlin
   kotlin {
       sourceSets {
           commonMain.dependencies { 
               implementation(projects.sharedLogic)
               // 必要なエントリポイント API を提供
               implementation(compose.ui)
           }
       }
   }
   ```

5. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。

#### コードの移動と Web アプリの実行 {id="move-the-code-and-run-the-web-app"}

設定が完了したら、Web アプリのコードを新しいディレクトリに移動します：

1. `composeApp/src/webMain` ディレクトリ全体を `webApp/src` ディレクトリに移動します。
   すべてが正しく設定されていれば、`webApp/src/webMain/.../main.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
2. `webApp/src/webMain/resources/index.html` ファイルでスクリプト名を更新します：`composeApp.js` から `webApp.js` に変更します。
3. Web アプリを実行するには、**composeApp [wasmJs]** 実行構成を変更します：
    1. 実行構成のドロップダウンで **Edit Configurations** を選択します。
    2. **Gradle** カテゴリから **composeApp [wasmJs]** 構成を見つけます。
    3. **Gradle project** フィールドで、`ComposeDemo:composeApp` を `ComposeDemo:webApp` に変更します。
4. JavaScript バージョンも実行できるように、**composeApp [js]** に対しても同様の手順を繰り返します。
5. 実行構成を開始して、アプリが期待どおりに動作することを確認します。
6. すべてが正しく動作したら：
    * `composeApp/src/webMain` ディレクトリを削除します。
    * `composeApp/build.gradle.kts` ファイルから、Web 関連のコードを削除します：
        * Kotlin `sourceSets {}` ブロック内の `webMain.dependencies {}` ブロック
        * `kotlin {}` ブロック内の `js {}` および `wasmJs {}` ターゲット宣言

### 共有モジュールの設定 {id="configure-the-shared-module"}

サンプルのアプリでは UI とビジネスロジックの両方のコードが共有されているため、すべての共通コードを保持するのに必要な共有モジュールは 1 つだけです。単に `composeApp` を共通コードモジュールとして再利用できます。

[//]: # (TODO For an overview of other project configurations and ways of dealing with them, see our blogpost about the new recommended project structure [link])

Gradle 設定で調整する必要があるエントリポイントモジュールとの接続に関係のない唯一の変更点は、新しい Android Library Gradle プラグインです。
この新しいプラグインはマルチプラットフォームプロジェクト専用に構築されており、AGP 9 以降を使用するために必須です。

必要な変更は以下のとおりです：

1. `gradle/libs.versions.toml` で、バージョンカタログに Android-KMP ライブラリプラグインを追加します：

    ```toml
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. `composeApp/build.gradle.kts` ファイルで、共有 UI モジュールに必要なプラグインを追加します：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. プラグイン適用時の競合を避けるため、ルートの `build.gradle.kts` ファイルに次の行を追加します：

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. `composeApp/build.gradle.kts` ファイルで、`kotlin.androidTarget {}` ブロックの代わりに `kotlin.androidLibrary {}` ブロックを追加します：

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget = JvmTarget.JVM_11
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. `composeApp/build.gradle.kts` ファイルからルートの `android {}` ブロックを削除します。
6. すべてのコードがアプリモジュールに移動されたため、`androidMain` の依存関係を削除します：
   `kotlin.sourceSets.androidMain.dependencies {}` ブロックを削除します。
7. Android アプリが期待どおりに動作することを確認します。

### (オプション) 共有ロジックと共有 UI の分離 {collapsible="true" id="optional-separate-shared-logic-and-shared-ui"}

プロジェクト内の一部のターゲットでネイティブ UI が実装されている場合、共通コードを `sharedLogic` モジュールと `sharedUI` モジュールに分離することをお勧めします。これにより、ネイティブ UI を備えたアプリモジュールが共有コードを使用するために Compose Multiplatform に依存する必要がなくなります。

以下は、同じサンプルアプリに基づいたそのアプローチの例です。

#### 共有ロジックモジュールの作成 {id="create-a-shared-logic-module"}

モジュールを実際に作成する前に、何がビジネスロジックであり、どのコードが UI とプラットフォームの両方に依存しないかを判断する必要があります。
この例で唯一該当するのは、場所とタイムゾーンのペアに対して正確な時刻を返す `currentTimeAt()` 関数です。
対照的に、`Country` データクラスは Compose Multiplatform の `DrawableResource` に依存しているため、UI コードから分離できません。

> プロジェクトにすでに `shared` モジュールが存在する場合（たとえば、UI コードを一部しか共有していない場合など）、`sharedLogic` の代わりにそのモジュールを使用できます。
> 共有ロジックと UI をより明確に区別するために、名前を変更してもよいでしょう。
> 
{style="note"}

該当するコードを `sharedLogic` モジュールに切り離します：

1. プロジェクトのルートに `sharedLogic` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` の末尾に次の行を追加して、新しいモジュールを追加します：

    ```kotlin
    include(":sharedLogic")
    ```
4. 新しいモジュールの Gradle ビルドスクリプトを設定します。

    1. `gradle/libs.versions.toml` ファイルで、バージョンカタログに Android-KMP ライブラリプラグインを追加します：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. `sharedLogic/build.gradle.kts` ファイルで、共有ロジックモジュールに必要なプラグインを指定します：

       ```kotlin
       plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
       }
       ```
    3. これらのプラグインが**ルート**の `build.gradle.kts` ファイルに記載されていることを確認します：

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. `sharedLogic/build.gradle.kts` ファイルで、この例で共通モジュールがサポートすべきターゲットを指定します：

        ```kotlin
        kotlin {
            // sharedLogic はフレームワークとしてエクスポートされず、
            // 'sharedUI' のみがエクスポートされるため、iOS フレームワークの設定は不要です。
            iosArm64()
            iosSimulatorArm64()
     
            jvm()
     
            js {
                browser()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
            }
        }
        ```
    5. Android の場合、`androidTarget {}` ブロックの代わりに `kotlin {}` ブロックへ `androidLibrary {}` 設定を追加します：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedLogic"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
        
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
            }
        }
        ```
    6. `composeApp` で宣言されているのと同じ方法で、共通および JavaScript ソースセットに必要な日時の依存関係を追加します：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
                }
            }
        }
        ```
    7. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。

5. 最初に特定したビジネスロジックコードを移動します：
    1. `sharedLogic/src` 内に `commonMain/kotlin` ディレクトリを作成します。
    2. `commonMain/kotlin` 内に `CurrentTime.kt` ファイルを作成します。
    3. 元の `App.kt` から `currentTimeAt` 関数を `CurrentTime.kt` に移動します。
6. 新しい場所にあるこの関数を `App()` コンポーザブルから利用できるようにします。
   そのためには、`composeApp/build.gradle.kts` ファイルで `composeApp` と `sharedLogic` 間の依存関係を宣言します：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再度 **Build | Sync Project with Gradle Files** を実行して変更を適用します。
8. `composeApp/commonMain/.../App.kt` ファイルで `currentTimeAt()` 関数をインポートし、コードを修正します。
9. アプリケーションを実行して、新しいモジュールが適切に機能することを確認します。

これで、共有ロジックを個別のモジュールに分離し、クロスプラットフォームで使用することに成功しました。
次のステップは、共有 UI モジュールの作成です。

#### 共有 UI モジュールの作成 {id="create-a-shared-ui-module"}

共通の UI 要素を実装する共有コードを `sharedUI` モジュールに抽出します：

1. プロジェクトのルートに `sharedUI` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` の末尾に次の行を追加して、新しいモジュールを追加します：

    ```kotlin
    include(":sharedUI")
    ```
4. 新しいモジュールの Gradle ビルドスクリプトを設定します：

    1. `sharedLogic` モジュールでまだ行っていない場合は、`gradle/libs.versions.toml` でバージョンカタログに Android-KMP ライブラリプラグインを追加します：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. `sharedUI/build.gradle.kts` ファイルで、共有 UI モジュールに必要なプラグインを指定します：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

    3. これらすべてのプラグインが**ルート**の `build.gradle.kts` ファイルに記載されていることを確認します：

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. `kotlin {}` ブロックで、この例で共有 UI モジュールがサポートすべきターゲットを指定します：

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // これは Swift コードでインポートする
                    // iOS フレームワークの名前です。
                    baseName = "sharedUI"
                    isStatic = true
                }
            }
     
            jvm()
     
            js {
                browser()
                binaries.executable()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
                binaries.executable()
            }
        }
        ```

    5. Android の場合、`androidTarget {}` ブロックの代わりに `kotlin {}` ブロックへ `androidLibrary {}` 設定を追加します：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedUI"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
         
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
       
                // Compose Multiplatform リソースを Android アプリで使用できるようにする
                androidResources {
                    enable = true
                }
            }
        }
        ```

    6. `composeApp` で宣言されているのと同じ方法で、共有 UI に必要な依存関係を追加します：

       ```kotlin
       kotlin {
           sourceSets {
               commonMain.dependencies { 
                   implementation(projects.sharedLogic)
                   implementation(compose.runtime)
                   implementation(compose.foundation)
                   implementation(compose.material3)
                   implementation(compose.ui)
                   implementation(compose.components.resources)
                   implementation(compose.components.uiToolingPreview)
                   implementation(libs.androidx.lifecycle.viewmodelCompose)
                   implementation(libs.androidx.lifecycle.runtimeCompose)
                   implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
               }
           }
       }
       ```
    7. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタ内の Gradle リフレッシュボタンをクリックします。
5. `sharedUI/src` 内に新しい `commonMain/kotlin` ディレクトリを作成します。
6. リソースファイルを `sharedUI` モジュールに移動します：`composeApp/commonMain/composeResources` ディレクトリ全体を `sharedUI/commonMain/composeResources` に配置し直します。
7. `sharedUI/src/commonMain/kotlin` ディレクトリ内に、新しい `App.kt` ファイルを作成します。
8. 元の `composeApp/src/commonMain/.../App.kt` の内容全体を新しい `App.kt` ファイルにコピーします。
9. 古い `App.kt` ファイル内のすべてのコードを一時的にコメントアウトします。
   これにより、古いコードを完全に削除する前に、共有 UI モジュールが動作しているかどうかをテストできます。
10. 新しい `App.kt` ファイルは期待どおりに動作するはずですが、リソースのインポートのみ異なるパッケージに配置されているため調整が必要です。
    正しいパスで `Res` オブジェクトとすべてのドローアブルリソースを再インポートします。例：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 新しい `App()` コンポーザブルを、これを利用するアプリモジュールのエントリポイントから利用できるようにするために、対応する `build.gradle.kts` ファイルに依存関係を追加します：

    ```kotlin
    kotlin {
        sourceSets {
            commonMain.dependencies {
                implementation(projects.sharedUI)
                // ...
            }
        }
    }
    ```
12. アプリを実行して、新しいモジュールがアプリのエントリポイントに共有 UI コードを適切に提供していることを確認します。
13. `composeApp/src/commonMain/.../App.kt` ファイルを削除します。

これで、クロスプラットフォーム UI コードを専用モジュールに正常に移動できました。

### iOS 連携の更新 {id="update-the-ios-integration"}

iOS アプリのエントリポイントは個別の Gradle モジュールとしてビルドされないため、ソースコードは任意のモジュールに組み込むことができます。
この例では、`shared` 内に残しておくことができます：

1. `composeApp/src/iosMain` ディレクトリを `shared/src` ディレクトリに移動します。
2. `shared` モジュールによって生成されたフレームワークを使用するように Xcode プロジェクトを設定します：
    1. **File | Open Project in Xcode** メニュー項目を選択します。
    2. **Project navigator** ツールウィンドウで **iosApp** プロジェクトをクリックし、**Build Phases** タブを選択します。
    3. **Compile Kotlin Framework** フェーズを見つけます。
    4. `./gradlew` で始まる行を見つけ、`composeApp` を `sharedUi` に置き換えます：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. `ContentView.swift` ファイル内のインポートは、モジュールの実際の名前ではなく、iOS ターゲットの Gradle 設定における `baseName` パラメータと一致しているため、変更せずにそのままにする必要がある点に注意してください。
       `shared/build.gradle.kts` ファイルでフレームワーク名を変更した場合は、それに応じて import ディレクティブを変更する必要があります。

3. Xcode から、または IntelliJ IDEA の **iosApp** 実行構成を使用してアプリを実行します。

<!-- ## What's next -->