[//]: # (title: Kotlin Multiplatform アプリケーションのビルドと実行)

Kotlin Multiplatform (KMP) はビルドシステムとして Gradle を使用します。
IntelliJ IDEA および Android Studio 向けの [KMP IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)は、カスタマイズされた実行構成（Run Configuration）の自動作成や Compose Hot Reload の統合の処理など、さらなるサポートを提供します。

## KMP アプリケーションのビルドと実行 {id="build-and-run-kmp-applications"}

KMP アプリをビルドするには、Gradle と Java だけで十分です。
しかし、IntelliJ IDEA と Android Studio は、環境の管理からビルドスクリプトやマルチプラットフォームコードの記述に至るまで、KMP 開発における利便性を大幅に向上させる多くの機能を提供します。

同じ IDE を使用して、サポートされている任意のプラットフォームでアプリケーションを実行できます。

* Android アプリは、利用可能な Android Virtual Device 上で動作します。
* iOS アプリは、Device Hub で利用可能な iOS シミュレータ上で動作します（Apple ターゲットでアプリを実行するには、Xcode がインストールされた macOS マシンが必要です）。
* デスクトップアプリは、システムの JVM 上で動作します。
* ウェブアプリは、デフォルトのブラウザで動作します。

KMP IDE プラグインが提供する実行構成は、一般的な Gradle ビルドタスクよりも効率的です。
デフォルトの Gradle ビルドタスクが常にすべてのターゲットのデバッグ版およびリリース版をビルドするのに対し、KMP IDE プラグインの実行構成は対応するターゲットのビルドのみをトリガーします。

### Android Emulator でのアプリケーションの実行 {id="run-your-application-on-android-emulator"}

デフォルトの実行構成では、利用可能な Android 仮想デバイスのリストが自動的に提案されます。
デバイスが存在しない場合や、別のデバイスをシミュレートしたい場合は、Android Device Manager を使用してデバイスを設定できます（IntelliJ IDEA では **View | Tool Window | Device Manager**、または [Android Studio ガイド](https://developer.android.com/studio/run/managing-avds)に従ってください）。

> Android Studio の Device Manager の方が通常は幅広いデバイスセットを提供していますが、一度デバイスを作成すれば、IntelliJ IDEA の実行構成を含むシステム全体で利用可能になります。
>
{style="tip"}

デバイスは作成されるとすぐに実行構成から利用できるようになります。

1. 実行構成のリストから **androidApp** を選択します。
2. Android 仮想デバイスを選択し、**Run** をクリックします。

![Run the Compose Multiplatform app on Android](compose-run-android.png){width=352}

IDE がアプリを実行します。選択した仮想デバイスが起動していない場合は起動されます。

### 実機の Android デバイスでの実行 {id="run-on-a-real-android-device"}

実機の Android デバイスを KMP の実行構成で利用できるようにするには、[デバイスを設定してマシンに接続](https://developer.android.com/studio/run/device)します。

正しくセットアップされると、仮想デバイスとともに利用可能なデバイスのリストに表示されます。

### iOS Simulator でのアプリケーションの実行 {id="run-your-application-on-ios-simulator"}

初期セットアップの一部としてまだ Xcode を起動していない場合は、iOS アプリを実行する前に起動してください。
iOS プラットフォームのサポートをインストールします。
Xcode で **Xcode | Settings | Components** を確認し、少なくとも1つの iOS シミュレータがインストールされていることを確認してください。

Kotlin Multiplatform IDE で、実行構成のリストから iOS エントリを選択し、その隣のリストからシミュレートするデバイスを選択して、**Run** をクリックします。

![Run the Compose Multiplatform app on iOS](compose-run-ios.png){width=405}

#### 実機の iOS デバイスでの実行 {initial-collapse-state="collapsed" collapsible="true" id="run-on-a-real-ios-device"}

マルチプラットフォームアプリケーションは、実機の iOS デバイスで実行できます。開始する前に、[Apple ID](https://support.apple.com/en-us/HT204316) に関連付けられている Team ID を設定する必要があります。

##### Team ID の設定 {id="set-your-team-id"}

プロジェクトに初めて新しい Team ID を設定するには、Xcode でプロジェクトを開きます（**File | Open Project in Xcode**）。

1. 左側の Project navigator で **iosApp** を選択します。
2. **Targets** の下にある **iosApp** を選択し、**Signing & Capabilities** タブに切り替えます。
3. **Team** リストで、ご自身のチームを選択します。

   まだチームをセットアップしていない場合は、**Team** リストの **Add an Account** オプションを使用し、Xcode の指示に従ってください。

4. Bundle Identifier が一意であり、Signing Certificate が正常に割り当てられていることを確認します。

Xcode でチームをセットアップした後は、IntelliJ IDEA でチームを設定または変更できます。

1. **iosApp** の実行構成を編集します。

   ![Edit iOS run configuration](ios-edit-configurations.png){width=450}

2. **Options** タブに切り替え、**Development team** ドロップダウンで必要な変更を行ってから **OK** をクリックします。

##### アプリの実行 {id="run-the-app"}

iPhone をケーブルで接続します。Xcode にデバイスがすでに登録されている場合、IntelliJ IDEA の実行構成のリストにデバイスが表示されるはずです。対応する `iosApp` 構成を実行します。

まだ Xcode に iPhone を登録していない場合は、[Apple の推奨事項](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)に従ってください。
要約すると、次の手順を実行します。

1. iPhone をケーブルで接続します。
2. iPhone の **Settings**（設定）| **Privacy & Security**（プライバシーとセキュリティ）でデベロッパモードを有効にします。
3. Xcode で、トップメニューから **Window** | **Devices and Simulators** を選択します。
4. iPhone が接続済みとして表示されない場合は、左下のプラス記号をクリックして選択します。
5. 画面の指示に従ってペアリングプロセスを完了します。

Xcode に iPhone を登録すると、IntelliJ IDEA で **iosApp** 実行構成を選択した際に、利用可能なデバイスのリストに表示されるようになります。

### デスクトップでのアプリケーションの実行 {id="run-your-application-on-desktop"}

実行構成のリストで **desktopApp [hot] 🔥** を選択し、**Run** をクリックします。

![Run the Compose Multiplatform app on desktop](compose-run-desktop.png){width=350}

デフォルトでは、アプリは [Compose Hot Reload](compose-hot-reload.md) が実行された状態で起動します。
これにより、変更を加えたファイルを手動で保存すると、UI がほぼ瞬時にリロードされます。

### ウェブアプリケーションの実行 {id="run-your-web-application"}

ウェブターゲットのデフォルトオプションは次のとおりです。

* **webApp[js]**: Kotlin/JS アプリケーションを実行します。
* **webApp[wasmJs]**: Kotlin/Wasm アプリケーションを実行します。

ウェブアプリケーションはデフォルトのブラウザで自動的に開き、デフォルトでは [http://localhost:8080/](http://localhost:8080/) で利用可能です。

> ポート 8080 が利用できない場合、ビルドは別のポートを使用します。
> 実際のポート番号は、Gradle ビルドコンソールで `Project is running at` を検索することで確認できます。
>
{style="note"}

![Compose web application](first-compose-project-on-web.png){width=600}

#### ウェブターゲットの互換モード {id="compatibility-mode-for-web-targets"}

ウェブアプリケーションの互換モード（Compatibility mode）を有効にすることで、特別な設定なしですべてのブラウザで動作させることができます。
このモードでは、モダンブラウザは Wasm バージョンを使用し、古いブラウザは JS バージョンにフォールバックします。
このモードは、`js` と `wasmJs` の両ターゲットに対するクロスコンパイルによって実現されます。

ウェブアプリケーションの互換モードを有効にするには:

1. **View | Tool Windows | Gradle** を選択して Gradle ツールウィンドウを開きます。
2. **ComposeDemo | Tasks | compose** で、**composeCompatibilityBrowserDistribution** タスクを選択して実行します。

   > タスクが正常にロードされるには、Gradle JVM として少なくとも Java 11 が必要です。Compose Multiplatform プロジェクト全般では、Java 17 以上を推奨します。
   >
   {style="note"}

   ![Run compatibility task](web-compatibility-gradle-task.png){width=500}

   または、プロジェクトのルートディレクトリからターミナルで以下のコマンドを実行することもできます。

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

Gradle タスクが完了すると、互換性のある成果物がウェブアプリケーションモジュールのディレクトリ（例: `webApp/build/dist/composeWebCompatibility/productionExecutable`）に生成されます。
これらの成果物を使用して、`js` と `wasmJs` の両ターゲット向けに[アプリケーションを公開](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)できます。