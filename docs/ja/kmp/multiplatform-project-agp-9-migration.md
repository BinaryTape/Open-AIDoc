[//]: # (title: Android アプリを含むマルチプラットフォームプロジェクトを AGP 9 に対応させるためのアップデート)
<show-structure for="chapter,procedure" depth="3"/>

Android Gradle プラグイン (AGP) 9.0 以降を使用する場合、Kotlin マルチプラットフォーム Gradle プラグインは `com.android.application` および `com.android.library` プラグインとの互換性がなくなります。

プロジェクトをアップデートするには、以下の手順を行ってください。
* 現在、Android のエントリーポイントが共有コードモジュールに実装されている場合は、Gradle プラグインの競合を避けるために、それを別のモジュールに抽出してください。
* 共有コードモジュールを、マルチプラットフォームプロジェクト専用に構築された新しい [Android-KMP ライブラリプラグイン](https://developer.android.com/kotlin/multiplatform/plugin) を使用するように移行してください。

<video src="https://www.youtube.com/v/m0Cq6J-V_RY" title="Kotlin プロジェクトの Android Gradle プラグイン 9.0 への移行"/>

> Android Studio は、Otter 3 Feature Drop 2025.2.3 以降で AGP 9.0.0 をサポートしています。
> IntelliJ IDEA での AGP 9.0.0 のサポートは、2026 年第 1 四半期を予定しています。
> 
{style="note"}

## Android-KMP ライブラリプラグインへの移行

以前は、マルチプラットフォームモジュールで Android ターゲットを構成するために、KMP プラグイン (`org.jetbrains.kotlin.multiplatform`) を、Android アプリケーションプラグイン (`com.android.application`) または Android ライブラリプラグイン (`com.android.library`) のいずれかと組み合わせて使用する必要がありました。

AGP 9.0 では、これらのプラグインは KMP との互換性がなくなるため、KMP 専用に構築された新しい Android-KMP ライブラリプラグインに移行する必要があります。

### 移行方法

ライブラリの移行手順については、[Android ドキュメントのガイド](https://developer.android.com/kotlin/multiplatform/plugin#migrate) を参照してください。

Android アプリプロジェクトを移行するには、Android のエントリーポイントと共有コードが、適切に構成された別々のモジュールにある必要があります。
以下は、サンプルアプリを移行するための一般的なチュートリアルです。以下の内容を確認できます。
* [Android アプリのエントリーポイントを別のモジュールに抽出する方法](#android-app)
* [共有モジュールの構成をアップデートする方法](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)

> [用意されたスキル](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-agp9-migration/SKILL.md) を使用して、任意の AI エージェントに移行を任せることができます。
> AI による処理結果は完全に予測可能ではないことに注意してください。
>
{style="note"}

### AGP 10 までのレガシー API の有効化

短期的には、プロジェクトを AGP 9.0 で動作させるために、非推奨の API を手動で有効にすることができます。
これを行うには、プロジェクトの `gradle.properties` ファイルに次のプロパティを追加します。
`android.enableLegacyVariantApi=true`

レガシー API は [AGP 10 で完全に削除される](https://developer.android.com/build/releases/gradle-plugin-roadmap#agp-10) 予定であり、これは 2026 年後半にリリースされる見込みです。
それまでに移行を完了させるようにしてください。

## サンプルアプリの移行

移行の準備に使用するサンプルプロジェクトは、[独自のアプリケーションを作成する](compose-multiplatform-new-project.md) チュートリアルの結果である Compose Multiplatform アプリです。
* アップデートが必要なアプリの例を含むサンプルは、サンプルリポジトリの [main](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main) ブランチにあります。
* `androidApp` が分離されたアプリの最終状態は、[new-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/new-project-structure) ブランチで利用可能です。
このブランチには、他のプラットフォーム用に分離されたアプリモジュールの例も含まれています。

<!-- When the new structure is implemented in the wizard, this is going to change: 
     following the tutorial will bring you to the new structure already.
     So when the update hits we update with the following:

The sample with an example of older structure is in the [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure)
branch of the sample repository. -->

このサンプルは、すべての共有コードと KMP エントリーポイントを含む単一の Gradle モジュール (`composeApp`) と、iOS 固有のコードと構成を含む `iosApp` プロジェクトで構成されています。

AGP 9.0 への移行を準備するために、以下の作業を行います。

* Android アプリのエントリーポイントを別の `androidApp` モジュールに [抽出します](#android-app)。
* 共有コードを含むモジュール (`composeApp`) を Android-KMP ライブラリプラグインを使用するように [再構成します](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)。

### Android アプリのエントリーポイント用モジュール {id="android-app"}

#### Android アプリモジュールの作成と構成

Android アプリモジュール (`androidApp`) を作成するには：

1. プロジェクトのルートに `androidApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルの末尾に次の行を追加して、新しいモジュールをプロジェクト設定に追加します。

    ```kotlin
    include(":androidApp")
    ```
4. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタで Gradle のリフレッシュボタンをクリックします。

#### Android アプリのビルドスクリンスの構成

新しいモジュールの Gradle ビルドスクリプトを構成します。

1. `gradle/libs.versions.toml` ファイルで、Kotlin Android Gradle プラグインをバージョンカタログに追加します。

    ```text
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. `androidApp/build.gradle.kts` ファイルで、Android アプリモジュールに必要なプラグインを指定します。

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. **ルート**の `build.gradle.kts` ファイルで、これらのプラグインがすべて記述されていることを確認します。

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 必要な依存関係を追加するために、`composeApp` ビルドスクリプトの `androidMain.dependencies {}` ブロックから既存の依存関係をコピーし、`composeApp` モジュール自体への依存関係を追加します。
   この例では、結果は次のようになります。

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. Android 固有の構成を含む `android {}` ブロック全体を、`composeApp/build.gradle.kts` ファイルから `androidApp/build.gradle.kts` ファイルにコピーします。

6. コンパイラオプションを、`composeApp/build.gradle.kts` ファイルの `androidTarget {}` ブロックから `androidApp/build.gradle.kts` ファイルの `target {}` ブロックにコピーします。

    ```kotlin
    target {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
    ```

   > `composeApp` ビルドスクリプトに設定されている他のプラグインやプロパティがある場合は、それらも `androidApp` ビルドスクリプトに移行するようにしてください。
   >
   {style="note"}

7. `composeApp` モジュールは実質的に Android ライブラリとなるため、その構成を Android アプリケーションから Android ライブラリに変更します。`composeApp/build.gradle.kts` にて：
   * Gradle プラグインへの参照を変更します。

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"></code-block>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"></code-block>
       </compare>
   
    * `android.defaultConfig {}` ブロックからアプリケーションプロパティの行を削除します。

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"></code-block>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"></code-block>
       </compare>
   
8. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタで Gradle のリフレッシュボタンをクリックします。

#### コードの移動と Android アプリの実行

1. `composeApp/src/androidMain` ディレクトリを `androidApp/src/` ディレクトリに移動します。ただし、クロスプラットフォームとして残すべきコードに注意してください。
   
   * Android アプリを適切にビルドするために、このサンプルの `MainActivity.kt` のようなエントリーポイントコードは `androidApp` モジュールにある必要があります。
   * すべての [expected および actual 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) は、すべてのプラットフォームで利用できるように、共通モジュール（この例では `composeApp`）のソースセットに残しておく必要があります。
     `androidApp` の `composeApp` への依存関係を設定したため、これらの宣言はエントリーポイントコードでも利用可能になります。
   
2. `androidApp/src/androidMain` ディレクトリを `main` にリネームします。
3. すべてが正しく構成されていれば、`androidApp/src/main/.../MainActivity.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
4. IntelliJ IDEA または Android Studio を使用している場合、IDE は新しいモジュールを認識し、新しい実行構成 **androidApp** を自動的に作成します。
   作成されない場合は、**composeApp** Android 実行構成を手動で修正してください。
   1. 実行構成のドロップダウンで **Edit Configurations** を選択します。
   2. **Android** カテゴリで **composeApp** 構成を見つけます。
   3. **General | Module** フィールドで、`demo.composeApp` を `demo.androidApp` に変更します。
5. 新しい実行構成を開始して、アプリが期待どおりに動作することを確認します。
6. すべてが正常に動作する場合は、`composeApp/build.gradle.kts` ファイルから `kotlin.sourceSets.androidMain.dependencies {}` ブロックを削除します。

これで Android のエントリーポイントを別のモジュールに抽出できました。
次に、共通コードモジュールをアップデートして、新しい Android-KMP ライブラリプラグインを使用するようにします。

### 共有モジュールで Android-KMP ライブラリプラグインを使用するように構成する

単に Android エントリーポイントを抽出するために、共有 `composeApp` モジュールに `com.android.library` プラグインを適用しました。
次に、新しいマルチプラットフォームライブラリプラグインに移行します。

1. `gradle/libs.versions.toml` で、Android-KMP ライブラリプラグインをバージョンカタログに追加します。

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. `composeApp/build.gradle.kts` ファイルで、古い Android ライブラリプラグインを新しいものに置き換えます。

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            alias(libs.plugins.androidLibrary)"></code-block>
        <code-block lang="kotlin" code="            alias(libs.plugins.androidMultiplatformLibrary)"></code-block>
    </compare>
3. ルートの `build.gradle.kts` ファイルに次の行を追加して、プラグイン適用時の競合を回避します。

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. `composeApp/build.gradle.kts` ファイルで、`kotlin.androidTarget {}` ブロックの代わりに `kotlin.androidLibrary {}` ブロックを追加します。

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. `composeApp/build.gradle.kts` ファイルから `android {}` ブロックを削除します。これは `kotlin.androidLibrary {}` 構成に置き換えられたためです。
6. `dependencies {}` ブロックで、`debugImplementation(libs.compose.uiTooling)` の行を `androidRuntimeClasspath(libs.compose.uiTooling)` に置き換えます。新しい Android KMP ライブラリプラグインはビルドバリアントをサポートしていないためです。
7. メインメニューで **Build | Sync Project with Gradle Files** を選択するか、エディタで Gradle のリフレッシュボタンをクリックします。
8. Android アプリが期待どおりに動作していることを確認します。

### Android Gradle プラグインのバージョンの更新

すべてのコードが新しい構成で動作するようになったら、以下の手順を行います。

1. 手順に従った場合、新しいアプリモジュール用の実行構成が機能しているはずです。
      `composeApp` モジュールに関連付けられた古い実行構成は削除して構いません。
2. `gradle/libs.versions.toml` ファイルで、AGP を 9.* バージョン（例：9.0.0）にアップデートします。

    ```text
    [versions]
    agp = "9.0.0"
    ```
3. `gradle/wrapper/gradle-wrapper.properties` ファイルの Gradle バージョンを少なくとも 9.1.0 にアップデートします。

    ```text
    distributionUrl=https\://services.gradle.org/distributions/gradle-9.1.0-bin.zip
    ```
4. `androidApp/build.gradle.kts` ファイルから次の行を削除します。[AGP 9.0 では Kotlin サポートが組み込まれており](https://developer.android.com/build/migrate-to-built-in-kotlin)、Kotlin Android プラグインを適用する必要がなくなったためです。

    ```kotlin
    alias(libs.plugins.kotlinAndroid)
    ```
5. `composeApp/build.gradle.kts` ファイルで、アプリのネームスペースと競合しないように `kotlin.androidLibrary {}` ブロックのネームスペースを更新します。例：

    ```kotlin
    kotlin {
        androidLibrary {
            namespace = "compose.project.demo.composedemolibrary"
            // ...
    ```
   
6. ビルドスクリプトエディタで **Build | Sync Project with Gradle Files** を選択するか、Gradle のリフレッシュボタンをクリックします。

7. アプリが新しい AGP バージョンでビルドされ、実行されることを確認します。

おめでとうございます！プロジェクトを AGP 9.0 と互換性のあるものにアップグレードできました。

<!-- Commented out for now
## What's next

Check out the [recommended project structure](multiplatform-project-recommended-structure.md)
which follows the logic of separating entry points for any app target you might have. -->