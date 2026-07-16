[//]: # (title: 推奨される Kotlin Multiplatform プロジェクト構造)
<show-structure for="chapter,procedure" depth="3"/>

[基本](multiplatform-discover-project.md)および[高度](multiplatform-advanced-project-structure.md)なプロジェクト構造の概念の概要により、ソースセットと依存関係管理についての理解が得られたはずです。
では、ソースセットを整理し、依存関係を利用するモジュールについてはどうでしょうか？

> この記事では、具体的に KMP プロジェクトについて説明します。
> モジュール化の意思決定に関する一般的な理解については、[Android のモジュール化の概要](https://developer.android.com/topic/modularization)を参照してください。

## 最適なモジュール構造

最適なモジュール構造は、目的や必要なターゲットによって異なります。
[KMP IDE プラグインウィザード]()の出力をさまざまな構成やターゲットセットで分析することで、デフォルトでプロジェクトがどのように整理されているかを確認できます。

一般的なアプローチは次のように要約できます：
* アプリのエントリポイントは個別のモジュールに含める必要があり、それぞれが必要な共有コードモジュールに依存するようにします。
* 共有コードは一般的にビジネスロジックと UI に分けられ、戦略としては不要な依存関係を避けることです：
  * KMP プロジェクトによって生成されるすべてのアプリが、共有ビジネスロジックに加えて共有 UI コードも使用している場合は、すべての共有コードに対して単一の `shared` モジュールだけで十分な場合があります。
  * いずれかのアプリの UI がネイティブコードで記述されている場合（例：iOS UI を純粋な Swift で実装したなど）、不要な場所に Compose Multiplatform の依存関係が入るのを避けるために、UI コードをビジネスロジックから分離するのが合理的です。
    その場合、`sharedLogic` モジュールと `sharedUI` モジュールを用意し、必要に応じてエントリポイントモジュールに依存関係として追加できます。
* プロジェクトにクライアントアプリとロジックを共有すべきサーバーコードが含まれている場合、推奨される構造は以下の通りです：
  * エントリポイントモジュールと、上記のように整理されたクライアント共通コードモジュールを含む `app` フォルダ。
  * サーバー固有のコードを含む `server` モジュール。
  * モデルやバリデーションなど、サーバーとクライアント間で共有されるコードのための `core` モジュール。

プロジェクトが古い構造（アプリのエントリポイントと共有コードが単一のモジュールに含まれている状態）を使用している場合は、以下のガイドに従ってエントリポイントを個別のモジュールに抽出できます。

> Android Gradle Plugin 9 以降を使用する予定がある場合は、Android アプリのエントリポイントを共通コードから分離することが必須です。
> 詳細については、[AGP 9 移行に関する記事](multiplatform-project-agp-9-migration.md)を参照してください。
> 
{style="note"}

## アプリエントリポイント用の個別モジュールの作成

推奨される構造への移行を説明するために使用するサンプルプロジェクトは、サンプルのリポジトリの [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) ブランチにある、古い Compose Multiplatform のサンプルです。

この例は、すべての共有コードと KMP エントリポイントを含む単一の Gradle モジュール（`composeApp`）と、iOS プロジェクトのコードと設定を含む `iosApp` フォルダで構成されています。

エントリポイントを独自のモジュールに抽出するには、モジュールを作成し、コードを移動し、新しいモジュールと共通コードモジュールの両方の設定を適宜調整する必要があります。

undefined

### デスクトップ JVM アプリ

#### デスクトップアプリモジュールの作成と設定

デスクトップアプリモジュール（`desktopApp`）を作成するには：

1. プロジェクトのルートに `desktopApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルに次の行を追加して、プロジェクト設定に新しいモジュールを追加します：

    ```kotlin
    include(":desktopApp")
    ```

#### デスクトップアプリのビルドスクリプトの設定

デスクトップアプリのビルドスクリプトを機能させるには：

1. `gradle/libs.versions.toml` ファイルで、Kotlin JVM Gradle プラグインをバージョンカタログに追加します：

    ```text
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

3. これらのプラグインがすべて**ルート**の `build.gradle.kts` ファイルに記述されていることを確認してください：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 他のモジュールへの必要な依存関係を追加するために、`composeApp` ビルドスクリプトの `commonMain.dependencies {}` ブロックと `jvmMain.dependencies {}` ブロックから既存の依存関係をコピーします。この例では、最終結果は次のようになります：

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

5. デスクトップ固有の設定を含む `compose.desktop {}` ブロックを、`composeApp/build.gradle.kts` ファイルから `desktopApp/build.gradle.kts` ファイルにコピーします：

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
6. メインメニューから **Build | Sync Project with Gradle Files** を選択するか、エディタの Gradle リフレッシュボタンをクリックします。

#### コードの移動とデスクトップアプリの実行

設定が完了したら、デスクトップアプリのコードを新しいディレクトリに移動します：

1. `desktopApp/src` ディレクトリ内に、新しい `main` ディレクトリを作成します。
2. `composeApp/src/jvmMain/kotlin` ディレクトリを `desktopApp/src/main/` ディレクトリに移動します。
   パッケージの座標が `compose.desktop {}` の設定と一致していることが重要です。
3. すべてが正しく設定されていれば、`desktopApp/src/main/.../main.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
4. デスクトップアプリを実行するには、**composeApp [jvm]** 実行構成を変更します：
   1. 実行構成のドロップダウンで、**Edit Configurations** を選択します。
   2. **Gradle** カテゴリで **composeApp [jvm]** 構成を見つけます。
   3. **Gradle project** フィールドで、`ComposeDemo:composeApp` を `ComposeDemo:desktopApp` に変更します。
5. 更新された構成を開始して、アプリが期待通りに動作することを確認します。
6. すべてが正しく動作する場合：
   * `composeApp/src/jvmMain` ディレクトリを削除します。
   * `composeApp/build.gradle.kts` ファイルからデスクトップ関連のコードを削除します：
       * `compose.desktop {}` ブロック
       * Kotlin `sourceSets {}` ブロック内の `jvmMain.dependencies {}` ブロック
       * `kotlin {}` ブロック内の `jvm()` ターゲット宣言

### Web アプリ

#### Web アプリモジュールの作成と設定

Web アプリモジュール（`webApp`）を作成するには：

1. プロジェクトのルートに `webApp` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` ファイルの最後に次の行を追加して、プロジェクト設定に新しいモジュールを追加します：

    ```kotlin
    include(":webApp")
    ```

#### Web アプリのビルドスクリプトの設定

Web アプリのビルドスクリプトを機能させるには：

1. `webApp/build.gradle.kts` ファイルで、共有 UI モジュールに必要なプラグインを指定します：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. これらのプラグインがすべて**ルート**の `build.gradle.kts` ファイルに記述されていることを確認してください：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. JavaScript と Wasm のターゲット宣言を `composeApp/build.gradle.kts` ファイルから `webApp/build.gradle.kts` ファイルの `kotlin {}` ブロックにコピーします：

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
               // 必要なエントリポイント API を提供します
               implementation(compose.ui)
           }
       }
   }
   ```

5. メインメニューから **Build | Sync Project with Gradle Files** を選択するか、エディタの Gradle リフレッシュボタンをクリックします。

#### コードの移動と Web アプリの実行

設定が完了したら、Web アプリのコードを新しいディレクトリに移動します：

1. `composeApp/src/webMain` ディレクトリ全体を `webApp/src` ディレクトリに移動します。
   すべてが正しく設定されていれば、`webApp/src/webMain/.../main.kt` ファイル内のインポートが機能し、コードがコンパイルされます。
2. `webApp/src/webMain/resources/index.html` ファイルで、スクリプト名を `composeApp.js` から `webApp.js` に更新します。
3. Web アプリを実行するには、**composeApp [wasmJs]** 実行構成を変更します：
    1. 実行構成のドロップダウンで、**Edit Configurations** を選択します。
    2. **Gradle** カテゴリで **composeApp [wasmJs]** 構成を見つけます。
    3. **Gradle project** フィールドで、`ComposeDemo:composeApp` を `ComposeDemo:webApp` に変更します。
4. JavaScript バージョンも実行できるように、**composeApp [js]** についても同様の手順を繰り返します。
5. 実行構成を開始して、アプリが期待通りに動作することを確認します。
6. すべてが正しく動作する場合：
    * `composeApp/src/webMain` ディレクトリを削除します。
    * `composeApp/build.gradle.kts` ファイルから Web 関連のコードを削除します：
        * Kotlin `sourceSets {}` ブロック内の `webMain.dependencies {}` ブロック
        * `kotlin {}` ブロック内の `js {}` および `wasmJs {}` ターゲット宣言

### 共有モジュールの設定

サンプルアプリでは、UI とビジネスロジックの両方のコードが共有されているため、すべての共通コードを保持するために単一の共有モジュールのみが必要です。`composeApp` を共通コードモジュールとして再利用するだけで済みます。

[//]: # (TODO 他のプロジェクト構成の概要とそれらの対処方法については、新しい推奨プロジェクト構造に関するブログ投稿 [リンク] を参照してください)

Gradle 設定で調整が必要な唯一のこと（エントリポイントモジュールとの接続に関係しないもの）は、新しい Android Library Gradle プラグインです。
新しいプラグインはマルチプラットフォームプロジェクト専用に構築されており、AGP 9 以降を使用するために必要です。

必要な変更は以下の通りです：

1. `gradle/libs.versions.toml` で、Android-KMP ライブラリプラグインをバージョンカタログに追加します：

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. `composeApp/build.gradle.kts` ファイルに、共有 UI モジュールに必要なプラグインを追加します：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. ルートの `build.gradle.kts` ファイルに次の行を追加して、プラグインの適用における競合を避けます：

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
7. Android アプリが期待通りに動作していることを確認します。

### (任意) 共有ロジックと共有 UI の分離 {collapsible="true"}

プロジェクトの一部のターゲットがネイティブ UI を実装している場合、共通コードを `sharedLogic` モジュールと `sharedUI` モジュールに分離することをお勧めします。これにより、ネイティブ UI を持つアプリモジュールが、共有コードを使用するために Compose Multiplatform に依存する必要がなくなります。

以下は、同じサンプルアプリに基づいたアプローチの例です。

#### 共有ロジックモジュールの作成

実際にモジュールを作成する前に、何がビジネスロジックであるか、つまり UI とプラットフォームの両方に依存しないコードはどれかを判断する必要があります。
この例では、唯一の候補は `currentTimeAt()` 関数です。これは、場所とタイムゾーンのペアに対して正確な時刻を返します。
対照的に、`Country` データクラスは Compose Multiplatform の `DrawableResource` に依存しているため、UI コードから分離することはできません。

> プロジェクトにすでに `shared` モジュールがある場合（たとえば、すべての UI コードを共有していないため）、`sharedLogic` の代わりにこのモジュールを使用できます。
> 共有ロジックを UI と明確に区別するために、名前を変更するとよいでしょう。
> 
{style="note"}

対応するコードを `sharedLogic` モジュールに分離します：

1. プロジェクトのルートに `sharedLogic` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` の最後に次の行を追加して、新しいモジュールを追加します：

    ```kotlin
    include(":sharedLogic")
    ```
4. 新しいモジュールの Gradle ビルドスクリプトを設定します。

    1. `gradle/libs.versions.toml` ファイルで、Android-KMP ライブラリプラグインをバージョンカタログに追加します：

        ```text
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
    3. これらのプラグインが**ルート**の `build.gradle.kts` ファイルに記述されていることを確認してください：

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
    5. Android については、`androidTarget {}` ブロックの代わりに、`androidLibrary {}` 設定を `kotlin {}` ブロックに追加します：

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
    6. `composeApp` で宣言されているのと同じ方法で、共通ソースセットと JavaScript ソースセットに必要な時刻の依存関係を追加します：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "2.22.0"))
                }
            }
        }
        ```
    7. メインメニューから **Build | Sync Project with Gradle Files** を選択するか、エディタの Gradle リフレッシュボタンをクリックします。

5. 最初に特定したビジネスロジックコードを移動します：
    1. `sharedLogic/src` 内に `commonMain/kotlin` ディレクトリを作成します。
    2. `commonMain/kotlin` 内に `CurrentTime.kt` ファイルを作成します。
    3. `currentTimeAt` 関数を元の `App.kt` から `CurrentTime.kt` に移動します。
6. 新しい場所にある関数を `App()` コンポーザブルで使用できるようにします。
   これを行うには、`composeApp/build.gradle.kts` ファイルで `composeApp` と `sharedLogic` の間の依存関係を宣言します：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再度 **Build | Sync Project with Gradle Files** を実行して変更を適用します。
8. `composeApp/commonMain/.../App.kt` ファイルで、`currentTimeAt()` 関数をインポートしてコードを修正します。
9. アプリケーションを実行して、新しいモジュールが正しく機能することを確認します。

これで、共有ロジックを別のモジュールに分離し、クロスプラットフォームで使用することに成功しました。
次のステップ：共有 UI モジュールの作成。

#### 共有 UI モジュールの作成

共通の UI 要素を実装する共有コードを `sharedUI` モジュールに抽出します：

1. プロジェクトのルートに `sharedUI` ディレクトリを作成します。
2. そのディレクトリ内に、空の `build.gradle.kts` ファイルと `src` ディレクトリを作成します。
3. `settings.gradle.kts` の最後に次の行を追加して、新しいモジュールを追加します：

    ```kotlin
    include(":sharedUI")
    ```
4. 新しいモジュールの Gradle ビルドスクリプトを設定します：

    1. `sharedLogic` モジュールでまだ行っていない場合は、`gradle/libs.versions.toml` で Android-KMP ライブラリプラグインをバージョンカタログに追加します：

        ```text
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

    3. これらのプラグインがすべて**ルート**の `build.gradle.kts` ファイルに記述されていることを確認してください：

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

    5. Android については、`androidTarget {}` ブロックの代わりに、`androidLibrary {}` 設定を `kotlin {}` ブロックに追加します：

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
       
                // Compose Multiplatform リソースを Android アプリで使用できるようにします
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
    7. メインメニューから **Build | Sync Project with Gradle Files** を選択するか、エディタの Gradle リフレッシュボタンをクリックします。
5. `sharedUI/src` 内に新しい `commonMain/kotlin` ディレクトリを作成します。
6. リソースファイルを `sharedUI` モジュールに移動します：`composeApp/commonMain/composeResources` ディレクトリ全体を `sharedUI/commonMain/composeResources` に再配置する必要があります。
7. `sharedUI/src/commonMain/kotlin` ディレクトリ内に、新しい `App.kt` ファイルを作成します。
8. 元の `composeApp/src/commonMain/.../App.kt` の内容全体を新しい `App.kt` ファイルにコピーします。
9. 古い `App.kt` ファイル内のすべてのコードを一時的にコメントアウトします。
   これにより、古いコードを完全に削除する前に、共有 UI モジュールが動作しているかどうかをテストできます。
10. 新しい `App.kt` ファイルは、リソースのインポートを除いて期待通りに動作するはずです。リソースは別のパッケージに配置されました。
    正しいパスで `Res` オブジェクトとすべての描画可能リソースを再インポートします。例：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"></code-block>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"></code-block>
    </compare>
11. 新しい `App()` コンポーザブルを、それに依存するアプリモジュールのエントリポイントで使用できるようにするために、対応する `build.gradle.kts` ファイルに依存関係を追加します：

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
12. アプリを実行して、新しいモジュールがアプリのエントリポイントに共有 UI コードを正常に提供していることを確認します。
13. `composeApp/src/commonMain/.../App.kt` ファイルを削除します。

これで、クロスプラットフォーム UI コードを専用のモジュールに正常に移動できました。

### iOS 統合の更新

iOS アプリのエントリポイントは個別の Gradle モジュールとして構築されていないため、ソースコードを任意のモジュールに埋め込むことができます。
この例では、`shared` 内に残すことができます：

1. `composeApp/src/iosMain` ディレクトリを `shared/src` ディレクトリに移動します。
2. `shared` モジュールによって生成されたフレームワークを消費するように Xcode プロジェクトを設定します：
    1. **File | Open Project in Xcode** メニュー項目を選択します。
    2. **Project navigator** ツールウィンドウで **iosApp** プロジェクトをクリックし、**Build Phases** タブを選択します。
    3. **Compile Kotlin Framework** フェーズを見つけます。
    4. `./gradlew` で始まる行を見つけ、`composeApp` を `sharedUi` に置き換えます：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. `ContentView.swift` ファイル内のインポートは、モジュールの実際の名前ではなく、iOS ターゲットの Gradle 設定の `baseName` パラメータと一致するため、そのままにする必要があることに注意してください。
       `shared/build.gradle.kts` ファイルでフレームワーク名を変更した場合は、それに応じてインポートディレクティブを変更する必要があります。

3. Xcode から、または IntelliJ IDEA の **iosApp** 実行構成を使用してアプリを実行します。

[//]: # (TODO ## 次のステップ：ここでの提案 — 最初の考えはプラットフォーム固有のガイダンスをリンクすることです)