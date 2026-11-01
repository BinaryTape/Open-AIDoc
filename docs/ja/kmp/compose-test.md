[//]: # (title: Compose Multiplatform UI のテスト)

Compose Multiplatform における UI テストは、Jetpack Compose テスト API と同じファインダー（finder）、アサーション（assertion）、アクション（action）、マッチャー（matcher）を使用して実装されています。これらに馴染みがない場合は、本記事を読み進める前に [Jetpack Compose のガイド](https://developer.android.com/jetpack/compose/testing) をお読みください。

> この API は[実験的（Experimental）](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)です。
> 将来変更される可能性があります。
>
{style="warning"}

## Compose Multiplatform のテストが Jetpack Compose と異なる点 {id="how-compose-multiplatform-testing-is-different-from-jetpack-compose"}

Compose Multiplatform の共通テスト API は、JUnit の `TestRule` クラスに依存しません。代わりに、`runComposeUiTest` 関数を呼び出し、`ComposeUiTest` レシーバー上でテスト関数を実行します。

ただし、[デスクトップターゲット](compose-desktop-ui-testing.md)では JUnit ベースの API を利用できます。

## Compose Multiplatform でのテストの作成と実行 {id="writing-and-running-tests-with-compose-multiplatform"}

まず、テスト用のソースセットと必要な依存関係をモジュールに追加します。その後、サンプルテストを作成して実行し、カスタマイズしてみてください。

### テストソースセットの作成と依存関係へのテストライブラリの追加 {id="create-the-test-source-set-and-add-the-testing-library-to-dependencies"}

具体的な例を示すため、このページの手順は [Kotlin Multiplatform ウィザード](https://kmp.jetbrains.com/) によって生成されたプロジェクト構造に沿って説明します。
既存のプロジェクトにテストを追加する場合は、パスやコマンド内の `shared` をテスト対象のモジュール名に置き換える必要がある場合があります。

Kotlin Multiplatform ウィザードで **Include tests** オプションにチェックを入れると、`*Test` ソースセットを含むテストの基本構造が生成されます。

UI テストライブラリのセットアップ：
`shared/build.gradle.kts` ファイルで、`commonTest` ソースセットの依存関係に UI テストライブラリを追加します。

```kotlin
kotlin {
    //...
    sourceSets {
        // 共通テストの依存関係を追加
        commonTest.dependencies {
            //...
            implementation("org.jetbrains.compose.ui:ui-test:%org.jetbrains.compose%")
        }

        // デスクトップテストの依存関係を追加
        jvmTest.dependencies { 
            implementation(compose.desktop.currentOs)
        }
    }
}
```

Android 向けのインストゥルメンテッド（エミュレーター）テストを実行する必要がある場合は、Gradle の設定を次のように修正します：
   
1. `shared/build.gradle.kts` ファイルで、`androidLibrary {}` ブロックに以下のコードを追加し、インストゥルメンテッドテストソースセットが共通テストソースセットに依存するように設定します。

   ```kotlin
   kotlin {
       //...
       androidLibrary {
           withDeviceTestBuilder { 
               sourceSetTreeName = "test"
           }
       } 
   }
   ```
   
2. `androidApp/build.gradle.kts` ファイルで、`android.defaultConfig {}` ブロックに以下のコードを追加し、Android テストインストルメンテーションランナーを設定します：

   ```kotlin
   android {
       //...
       defaultConfig {
           //...
           testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
   }
   ```

3. `androidApp/build.gradle.kts` ファイルのルートの `dependencies {}` ブロックに必要な依存関係を追加します：

    ```kotlin
    dependencies { 
        androidTestImplementation("androidx.compose.ui:ui-test-junit4-android:%androidx.compose%")
        debugImplementation("androidx.compose.ui:ui-test-manifest:%androidx.compose%")
    }
    ```
4. メインメニューから **Build | Sync Project with Gradle Files** を選択するか、ビルドスクリプトエディターで Gradle 更新ボタンをクリックします。

5. インストゥルメンテッドテスト用に `shared/src/androidDeviceTest` ソースセットを作成することを忘れないでください。
   テストの大半が `commonTest` にある場合でも、`androidDeviceTest` ディレクトリには、テストで使用する汎用アクティビティを指定する `AndroidManifest.xml` ファイルが少なくとも必要です：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        <application>
            <activity
                    android:name="androidx.activity.ComponentActivity"
                    android:exported="true">
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>
    </manifest>
    ```
    {collapsible="true" collapsed-title-line-number="5"}

これで、Compose Multiplatform UI の共通テストを作成して実行する準備が整いました。

### 共通テストの作成と実行 {id="write-and-run-common-tests"}

`shared/src/commonTest/kotlin/<package>` ディレクトリに `ExampleTest.kt` という名前のファイルを作成し、以下のコードをコピーします：

```kotlin
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.v2.runComposeUiTest
import kotlin.test.Test

class ExampleTest {

    @OptIn(ExperimentalTestApi::class)
    @Test
    fun myTest() = runComposeUiTest {
        // API呼び出しを実演するためのモックUIを宣言
        //
        // プロジェクトのコードをテストするために独自の宣言に置き換えてください
        setContent {
            var text by remember { mutableStateOf("Hello") }
            Text(
                text = text,
                modifier = Modifier.testTag("text")
            )
            Button(
                onClick = { text = "Compose" },
                modifier = Modifier.testTag("button")
            ) {
                Text("Click me")
            }
        }

        // Compose Multiplatform テストAPIのアサーションとアクションを使用して宣言されたUIをテスト
        onNodeWithTag("text").assertTextEquals("Hello")
        onNodeWithTag("button").performClick()
        onNodeWithTag("text").assertTextEquals("Compose")
    }
}
```

テストを実行するには：

<Tabs>
<TabItem title="iOS Simulator">

2つの方法があります：
* IntelliJ IDEA では、`myTest()` 関数の横のガターにある緑色の実行アイコンをクリックし、**Run | ExampleTest.myTest** を選択して、テスト対象の iOS ターゲットを選択します。
* ターミナルで以下のコマンドを実行します：

   ```shell
   ./gradlew :shared:iosSimulatorArm64Test
   ```

</TabItem>
<TabItem title="Android Emulator">

ターミナルで以下のコマンドを実行します：

```shell
./gradlew :shared:connectedAndroidTest
```

現在、`android (local)` テスト構成を使用して共通 Compose Multiplatform テストを実行することはできないため、Android Studio などのガターアイコンは利用できません。

</TabItem>
<TabItem title="Desktop">

2つの方法があります：
* `myTest()` 関数の横のガターにある緑色の実行アイコンをクリックして **Run | ExampleTest.myTest** を選択し、JVM ターゲットを選択します。
* ターミナルで以下のコマンドを実行します：

   ```shell
   ./gradlew :shared:jvmTest
   ```

</TabItem>
<TabItem title="Wasm (headless browser)">

ターミナルで以下のコマンドを実行します：

```shell
./gradlew :shared:wasmJsTest
```

</TabItem>
</Tabs>

## 次のステップ {id="what-s-next"}

Compose Multiplatform UI テストの基本を理解したら、さらにテスト関連のリソースを確認してみるとよいでしょう：
* Kotlin Multiplatform プロジェクトでのテスト全般の概要については、[基本的なプロジェクト構造を理解する](multiplatform-discover-project.md#integration-with-tests)および[マルチプラットフォームアプリのテスト](multiplatform-run-tests.md)チュートリアルを参照してください。
* デスクトップターゲット向けの JUnit ベースのテストのセットアップと実行の詳細については、[JUnit を使用した Compose Multiplatform UI のテスト](compose-desktop-ui-testing.md)を参照してください。
* ローカライゼーションのテストについては、[さまざまなプラットフォームでのロケールのテスト](compose-localization-tests.md#testing-locales-on-different-platforms)を参照してください。
* 自動化を含む Android Studio でのより高度なテストについては、Android Studio ドキュメントの[アプリのテスト](https://developer.android.com/studio/test)記事で解説されています。