[//]: # (title: ユーザーインターフェースを更新する)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。両方の IDE は同じコア機能と Kotlin Multiplatform サポートを共有しています。</p>
    <br/>
    <p>これは「<strong>共有ロジックとネイティブ UI を備えた Kotlin Multiplatform アプリの作成</strong>」チュートリアルの第 2 部です。続行する前に、前のステップを完了していることを確認してください。</p>
    <p><img src="icon-1-done.svg" width="20" alt="最初のステップ"/> <Links href="/kmp/multiplatform-create-first-app" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。両方の IDE は同じコア機能と Kotlin Multiplatform サポートを共有しています。これは「共有ロジックとネイティブ UI を備えた Kotlin Multiplatform アプリの作成」チュートリアルの第 1 部です。Kotlin Multiplatform アプリの作成 ユーザーインターフェースの更新 依存関係の追加 共有ロジックの追加 プロジェクトの仕上げ">Kotlin Multiplatform アプリを作成する</Links><br/>
       <img src="icon-2.svg" width="20" alt="2 番目のステップ"/> <strong>ユーザーインターフェースを更新する</strong><br/>
       <img src="icon-3-todo.svg" width="20" alt="3 番目のステップ"/> 依存関係を追加する<br/>       
       <img src="icon-4-todo.svg" width="20" alt="4 番目のステップ"/> 共有ロジックをさらに追加する<br/>
       <img src="icon-5-todo.svg" width="20" alt="5 番目のステップ"/> プロジェクトを仕上げる<br/>
    </p>
</tldr>

ユーザーインターフェースを構築するには、プロジェクトの Android 部分には [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) ツールキットを使用し、iOS 部分には [SwiftUI](https://developer.apple.com/xcode/swiftui/) を使用します。
これらはどちらも宣言的 UI フレームワーク (declarative UI frameworks) であり、UI 実装に類似点があることがわかります。どちらの場合も、データを `phrases` 変数に格納し、後でそれを反復処理して `Text` アイテムのリストを作成します。

## Android 部分を更新する

`composeApp` モジュールには Android アプリケーションが含まれており、そのメインアクティビティと UI ビューを定義し、`shared` モジュールを通常の Android ライブラリとして使用します。アプリケーションの UI は Compose Multiplatform フレームワークを使用しています。

変更を加えて、UI にどのように反映されるかを確認してみましょう。

1. `composeApp/src/androidMain/.../greetingkmp` ディレクトリにある `App.kt` ファイルに移動します。
2. `Greeting` クラスの呼び出しを見つけます。`greet()` 関数を選択し、右クリックして **Go To** | **Declaration or Usages** を選択します。
   これが、前のステップで編集した `shared` モジュールにあるのと同じクラスであることがわかります。
3. `Greeting.kt` ファイルで、`greet()` 関数が文字列のリストを返すように `Greeting` クラスを更新します。

   ```kotlin
   class Greeting {
   
       private val platform: Platform = getPlatform()
   
       fun greet(): `List<String>` = buildList {
           add(if (Random.nextBoolean()) "Hi!" else "Hello!")
           add("Guess what this is! > ${platform.name.reversed()}!")
       }
   }
   ```

4. `App.kt` ファイルに戻り、`App()` の実装を更新します。

   ```kotlin
   @Composable
   @Preview
   fun App() {
       MaterialTheme {
           val greeting = remember { Greeting().greet() }
   
           Column(
               modifier = Modifier
                   .padding(all = 10.dp)
                   .safeContentPadding()
                   .fillMaxSize(),
               verticalArrangement = Arrangement.spacedBy(8.dp),
           ) {
               greeting.forEach { greeting ->
                   Text(greeting)
                   HorizontalDivider()
               }
           }
       }
   }
   ```

   ここでは、`Column` コンポーザブルが各 `Text` アイテムを表示し、それらの周囲にパディングを追加し、アイテム間にスペースを追加しています。

5. IntelliJ IDEA の提案に従って、不足している依存関係をインポートします。
6. これで Android アプリを実行して、文字列のリストがどのように表示されるかを確認できます。

   ![Android マルチプラットフォームアプリの更新された UI](first-multiplatform-project-on-android-2.png){width=300}

## iOS モジュールで作業する

`iosApp` ディレクトリは iOS アプリケーションとしてビルドされます。これは `shared` モジュールを iOS フレームワークとして依存・使用します。アプリの UI は Swift で記述されています。

Android アプリと同じ変更を実装します。

1. IntelliJ IDEA の **Project** ツールウィンドウで、プロジェクトのルートにある `iosApp/iosApp` フォルダを見つけます。
2. `iosApp/ContentView.swift` ファイルを開き、`Greeting().greet()` 呼び出しを右クリックして **Go To** | **Definition** を選択します。

    `shared` モジュールで定義された Kotlin 関数の Objective-C 宣言が表示されます。Kotlin の型は、Objective-C/Swift から使用される場合、Objective-C の型として表されます。ここでは、`greet()` 関数は Kotlin では `List<String>` を返しますが、Swift からは `NSArray<NSString>` を返すように見えます。型マッピングの詳細については、[Interoperability with Swift/Objective-C](https://kotlinlang.org/docs/native-objc-interop.html) を参照してください。

3. Android アプリと同じ方法でアイテムのリストを表示するように SwiftUI のコードを更新します。

    ```Swift
    struct ContentView: View {
       let phrases = Greeting().greet()
    
       var body: some View {
           List(phrases, id: \.self) {
               Text($0)
           }
       }
    }
    ```

    * `greet()` 呼び出しの結果は `phrases` 変数に格納されます（Swift の `let` は Kotlin の `val` に似ています）。
    * `List` 関数は `Text` アイテムのリストを生成します。

4. iOS の実行構成（Run Configuration）を開始して、変更を確認します。

    ![iOS マルチプラットフォームアプリの更新された UI](first-multiplatform-project-on-ios-2.png){width=300}

## 発生する可能性のある問題と解決策

### Xcode が共有フレームワークを呼び出すコードでエラーを報告する

Xcode を使用している場合、Xcode プロジェクトがまだ古いバージョンのフレームワークを使用している可能性があります。これを解決するには、IntelliJ IDEA に戻ってプロジェクトを再ビルドするか、iOS の実行構成を開始してください。

### Xcode が共有フレームワークのインポート時にエラーを報告する

Xcode を使用している場合、キャッシュされたバイナリをクリアする必要がある場合があります。メインメニューで **Product | Clean Build Folder** を選択して、環境のリセットを試みてください。

## 次のステップ

チュートリアルの次のパートでは、依存関係について学び、サードパーティライブラリを追加してプロジェクトの機能を拡張します。

**[次のパートへ進む](multiplatform-dependencies.md)**

## ヘルプを得る

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受けて、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin イシュートラッカー**: [新しい問題を報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。