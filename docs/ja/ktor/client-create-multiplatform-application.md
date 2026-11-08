[//]: # (title: クロスプラットフォームモバイルアプリケーションの作成)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-client-kmp"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Kotlin Multiplatform Mobile アプリケーションで Ktor クライアントを使用する方法を学びます。
</link-summary>

Ktor HTTP クライアントは、マルチプラットフォームプロジェクトで使用できます。このチュートリアルでは、リクエストを送信してレスポンスボディをプレーン HTML テキストとして受け取る、シンプルな Kotlin Multiplatform Mobile アプリケーションを作成します。

## 前提条件 {id="prerequisites"}

まず、適切なオペレーティングシステムに必要なツールをインストールして、クロスプラットフォームモバイル開発のための環境をセットアップする必要があります。詳細については、[環境のセットアップ](https://kotlinlang.org/docs/multiplatform-mobile-setup.html)セクションを参照してください。

> このチュートリアルの特定のステップ（iOS 固有のコードの記述や iOS アプリケーションの実行など）を完了するには、macOS を搭載した Mac が必要です。
>
{style="note"}

## 新規プロジェクトの作成 {id="new-project"}

新規プロジェクトを作成するには、IntelliJ IDEA の Kotlin Multiplatform プロジェクトウィザードを使用できます。これにより、クライアントやサービスを追加して拡張できる基本的なマルチプラットフォームプロジェクトが作成されます。

<procedure>

1. IntelliJ IDEA を起動します。
2. IntelliJ IDEA で、**File | New | Project** を選択します。
3. 左側のパネルで、**Kotlin Multiplatform** を選択します。
4. **New Project** ウィンドウで以下のフィールドを指定します：
    * **Name**: KmpKtor
    * **Group**: org.example.ktor
      ![Kotlin Multiplatform ウィザードの設定](tutorial_client_kmp_create_project.png){ width="450" width="706" border-effect="rounded" style="block" }
5. ビルドシステムとして **Gradle** を選択します。
6. ターゲットとして **Android** と **iOS** を選択します。
7. iOS については、UI をネイティブのまま保持するために **Do not share UI** オプションを選択します。
8. **Create** ボタンをクリックし、IDE がプロジェクトを生成してインポートするのを待ちます。

</procedure>

## ビルドスクリプトの設定 {id="build-script"}

### Ktor 依存関係の追加 {id="ktor-dependencies"}

プロジェクトで Ktor HTTP クライアントを使用するには、少なくとも 2 つの依存関係（クライアントの依存関係と[エンジン](client-engines.md)の依存関係）を追加する必要があります。

1. <Path>settings.gradle.kts</Path> ファイルを開き、Ktor バージョンカタログをインポートします：

    ```kotlin
    dependencyResolutionManagement {
        versionCatalogs {
            create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
        }
    }
    ```

2. <Path>sharedLogic/build.gradle.kts</Path> ファイルを開き、`commonMain` ソースセットにデフォルトエンジンの依存関係を追加します：
    
    ```kotlin
    sourceSets {
        commonMain.dependencies {
            api(ktorLibs.client.engineDefaults)
        }
    }
    ```

   各ターゲットプラットフォームにおいて、Ktor は `ktor-client-engine-defaults` によって提供されるデフォルトエンジンを使用します。

### コルーチンの追加 {id="coroutines"}

[Android コード](#android-activity)でコルーチンを使用するには、プロジェクトに `kotlinx.coroutines` を追加する必要があります：

1. <Path>gradle/libs.versions.toml</Path> ファイルを開き、コルーチンのバージョンとライブラリを指定します：

    ```toml
    [versions]
    kotlinx-coroutines = "1.11.0"
    
    [libraries]
    kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
    kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
    ```

2. <Path>sharedLogic/build.gradle.kts</Path> ファイルを開き、`commonMain` ソースセットに `kotlinx-coroutines-core` の依存関係を追加します：

    ```kotlin
    sourceSets {
        commonMain.dependencies {
            api(ktorLibs.client.engineDefaults)
            implementation(libs.kotlinx.coroutines.core)
        }
    }
    ```

3. 次に、<Path>androidApp/build.gradle.kts</Path> ファイルを開き、`androidMain` ソースセットに `kotlinx-coroutines-android` の依存関係を追加します：

   ```kotlin
   dependencies {
       implementation(libs.kotlinx.coroutines.android)
   }
   ```

4. **Build | Sync Project with Gradle Files** を選択して、追加した依存関係をインストールします。

## アプリケーションの更新 {id="code"}

### 共有コード {id="shared-code"}

Android と iOS で共有されるコードを更新するには、<Path>sharedLogic/src/commonMain/kotlin/org/example/ktor/Greeting.kt</Path> ファイルを開き、`Greeting` クラスに以下のコードを追加します：

```kotlin
package org.example.ktor

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText

class Greeting {
    private val client = HttpClient()

    suspend fun greet(): String {
        val response = client.get("https://ktor.io/docs/")
        return response.bodyAsText()
    }
}
```

* `HttpClient()` コンストラクタで HTTP クライアントを作成します。
* サスペンド関数 `greet()` は[リクエスト](client-requests.md)を送信し、[レスポンス](client-responses.md)のボディを文字列値として受け取ります。

### Android コード {id="android-activity"}

<Path>sharedUI/src/commonMain/kotlin/org/example/ktor/App.kt</Path> ファイルを開き、コードを以下のように更新します：

```kotlin
package org.example.ktor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    MaterialTheme {
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            var text by remember { mutableStateOf("Loading") }
            LaunchedEffect(true) {
                text = try {
                    Greeting().greet()
                } catch (e: Exception) {
                    e.message ?: "error"
                }
            }
            GreetingView(text)
        }
    }
}

@Composable
fun GreetingView(text: String) {
    Text(text = text)
}

@Preview
@Composable
fun DefaultPreview() {
    MaterialTheme {
        GreetingView("Hello, Android!")
    }
}
```

`LaunchedEffect()` は、コンポーザブルのライフサイクルに紐づくコルーチンを起動します。このコルーチン内で共有の `greet()` 関数が呼び出され、その結果が `text` に代入され、発生した例外がキャッチされて処理されます。

### iOS コード {id="ios-view"}

<Path>iosApp/iosApp/ContentView.swift</Path> ファイルを開き、コードを以下のように更新します：

```Swift
import SharedLogic
import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = ViewModel()

    var body: some View {
        Text(viewModel.text)
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var text = "Loading..."
        init() {
            Greeting().greet { greeting, error in
                if let greeting = greeting {
                    self.text = greeting
                } else {
                    self.text = error?.localizedDescription ?? "error"
                }
            }
        }
    }
}
```

iOS では、`greet()` サスペンド関数はコールバックを持つ関数として利用できます。

## Android でのインターネットアクセスの有効化 {id="android-internet"}

最後のステップは、Android アプリケーションでインターネットアクセスを有効にすることです。
<Path>androidApp/src/main/AndroidManifest.xml</Path> ファイルを開き、`<uses-permission>` 要素を使用して必要な権限を有効にします：

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <application>
        ...
    </application>
</manifest> 
```

## Android でアプリケーションを実行する {id="run-android"}

1. IntelliJ IDEA で、実行構成のリストから **androidApp** を選択します。
2. 実行構成リストの隣にある Android 仮想デバイスを選択し、**Run** をクリックします。
   ![Pixel 8 API デバイスが選択された androidApp](tutorial_client_kmp_run_android.png){width="381" style="block"}

   リストにデバイスがない場合は、[新しい Android 仮想デバイス](https://developer.android.com/studio/run/managing-avds#createavd)を作成してください。
3. 読み込みが完了すると、シミュレータに受信した HTML ドキュメントがプレーンテキストとして表示されます。
   ![Android シミュレータ](tutorial_client_kmp_android.png){width="381" style="block"}

> Android エミュレータがインターネットに接続できない場合は、コールドブート（Cold Boot）を実行してみてください。
> **Device Manager** ツールウィンドウで、停止しているデバイスの横にある **⋮**（3つの点）をクリックし、メニューから **Cold Boot** を選択します。これにより、接続問題の原因となる破損したエミュレータキャッシュをクリアできることがよくあります。
>
{style="tip"}

## iOS でアプリケーションを実行する {id="run-ios"}

1. IntelliJ IDEA で、実行構成のリストから **iosApp** を選択します。
2. 実行構成リストの隣にある iOS シミュレータデバイスを選択し、**Run** をクリックします。
   ![iPhone 16 デバイスが選択された iosApp](tutorial_client_kmp_run_ios.png){width="381" style="block"}

   リストに利用可能な iOS 構成がない場合は、[新しい実行構成](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-create-first-app.html#run-on-a-new-ios-simulated-device)を追加してください。
3. 読み込みが完了すると、シミュレータに受信した HTML ドキュメントがプレーンテキストとして表示されます。
   ![iOS シミュレータ](tutorial_client_kmp_ios.png){width="381" style="block"}