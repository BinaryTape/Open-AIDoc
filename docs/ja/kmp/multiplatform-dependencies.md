[//]: # (title: プロジェクトへの依存関係の追加)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE もコア機能と Kotlin マルチプラットフォーム（Kotlin Multiplatform）のサポートを共有しています。</p>
    <br/>   
    <p>これは「<strong>共有ロジックとネイティブ UI を使用した Kotlin マルチプラットフォーム アプリの作成</strong>」チュートリアルの第 3 部です。続行する前に、前のステップを完了していることを確認してください。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第 1 ステップ"/> <Links href="/kmp/multiplatform-create-first-app" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE もコア機能と Kotlin マルチプラットフォームのサポートを共有しています。これは「共有ロジックとネイティブ UI を使用した Kotlin マルチプラットフォーム アプリの作成」チュートリアルの第 1 部です。Kotlin マルチプラットフォーム アプリの作成、ユーザーインターフェースの更新、依存関係の追加、より多くのロジックの共有、プロジェクトの仕上げを行います。">Kotlin マルチプラットフォーム アプリの作成</Links><br/>
        <img src="icon-2-done.svg" width="20" alt="第 2 ステップ"/> <Links href="/kmp/multiplatform-update-ui" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE もコア機能と Kotlin マルチプラットフォームのサポートを共有しています。これは「共有ロジックとネイティブ UI を使用した Kotlin マルチプラットフォーム アプリの作成」チュートリアルの第 2 部です。続行する前に、前のステップを完了していることを確認してください。Kotlin マルチプラットフォーム アプリの作成、ユーザーインターフェースの更新、依存関係の追加、より多くのロジックの共有、プロジェクトの仕上げを行います。">ユーザーインターフェースの更新</Links><br/>
        <img src="icon-3.svg" width="20" alt="第 3 ステップ"/> <strong>依存関係の追加</strong><br/>
        <img src="icon-4-todo.svg" width="20" alt="第 4 ステップ"/> より多くのロジックの共有<br/>
        <img src="icon-5-todo.svg" width="20" alt="第 5 ステップ"/> プロジェクトの仕上げ<br/>
    </p>
</tldr>

最初のクロスプラットフォーム Kotlin マルチプラットフォーム プロジェクトを作成できました！次は、成功するクロスプラットフォーム アプリケーションを構築するために不可欠な、サードパーティ ライブラリへの依存関係を追加する方法を学びましょう。

## 依存関係の種類

Kotlin マルチプラットフォーム プロジェクトで使用できる依存関係には 2 つの種類があります。

*   **マルチプラットフォームの依存関係 (Multiplatform dependencies)**: 複数のターゲットをサポートし、共通ソースセット `commonMain` で使用できるマルチプラットフォーム ライブラリです。

    [Koin](https://insert-koin.io/)、[Apollo](https://www.apollographql.com/)、[Okio](https://square.github.io/okio/) など、最新の Android ライブラリの多くはすでにマルチプラットフォームをサポートしています。その他のマルチプラットフォーム ライブラリについては、JetBrains の実験的な検索サービスである [klibs.io](https://klibs.io/) で探すことができます。

*   **ネイティブの依存関係 (Native dependencies)**: 関連するエコシステムの通常のライブラリです。ネイティブ プロジェクトでは通常、Android の場合は Gradle を、iOS の場合は CocoaPods やその他の依存関係マネージャーを使用してこれらを扱います。

    共有モジュール（shared module）を扱う際、通常、セキュリティ ストレージなどのプラットフォーム API を使用したい場合には、依然としてネイティブの依存関係が必要になります。ネイティブの依存関係は、ネイティブ ソースセットである `androidMain` や `iosMain` に追加できます。

どちらのタイプの依存関係についても、ローカルおよび外部のリポジトリを使用できます。

## マルチプラットフォーム依存関係の追加

> Android アプリの開発経験がある場合、マルチプラットフォーム依存関係の追加は、通常の Android プロジェクトで Gradle 依存関係を追加するのと似ています。唯一の違いは、ソースセットを指定する必要がある点です。
>
{style="tip"}

アプリに戻って、挨拶をもう少し華やかにしてみましょう。デバイス情報に加えて、元旦までの残り日数を表示する機能を追加します。完全にマルチプラットフォームをサポートしている `kotlinx-datetime` ライブラリは、共有コードで日付を扱うための最も便利な方法です。

1. `shared` ディレクトリにある `build.gradle.kts` ファイルを開きます。
2. `commonMain` ソースセットの依存関係に、以下の依存関係と Kotlin time のオプトインを追加します。

    ```kotlin
    kotlin {
        //... 
        sourceSets {
            all { languageSettings.optIn("kotlin.time.ExperimentalTime") }
   
            commonMain.dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            } 
        }
    }
    ```

3. **Build | Sync Project with Gradle Files** メニュー項目を選択するか、ビルドスクリプトエディターの **Sync Gradle Changes** ボタンをクリックして Gradle ファイルを同期します： ![Gradle ファイルを同期する](gradle-sync.png){width=50}
4. `shared/src/commonMain/.../greetingkmp` ディレクトリを右クリックし、**New | Kotlin Class/File** を選択して、新しいファイル `NewYear.kt` を作成します。
5. `datetime` の日付演算を使用して、今日から新年までの日数を計算する短い関数でファイルを更新します。
   
   ```kotlin
   fun daysUntilNewYear(): Int {
       val today = Clock.System.todayIn(TimeZone.currentSystemDefault())
       val closestNewYear = LocalDate(today.year + 1, 1, 1)
       return today.daysUntil(closestNewYear)
   }
   
   fun daysPhrase(): String = "There are only ${daysUntilNewYear()} days left until New Year! 🎆"
   ```
6. IDE の提案に従って、必要なインポートをすべて追加します。
   `Clock` クラスは `kotlin.time` パッケージからインポートするようにしてください。
7. `Greeting.kt` ファイルで `Greeting` クラスを更新して、結果を確認します。
    
    ```kotlin
    class Greeting {
        private val platform: Platform = getPlatform()
   
        fun greet(): `List<String>` = buildList {
            add(if (Random.nextBoolean()) "Hi!" else "Hello!")
            add("Guess what this is! > ${platform.name.reversed()}!")
            add(daysPhrase())
        }
    }
    ```

8. 結果を確認するには、IntelliJ IDEA から **composeApp** と **iosApp** の構成を再実行します。

![外部依存関係を追加して更新されたモバイル マルチプラットフォーム アプリ](first-multiplatform-project-3.png){width=500}

## 次のステップ

チュートリアルの次のパートでは、さらに多くの依存関係と、より複雑なロジックをプロジェクトに追加します。

**[次のパートに進む](multiplatform-upgrade-app.md)**

### 関連項目

*   あらゆる種類のマルチプラットフォーム依存関係を扱う方法を確認してください: [Kotlin ライブラリ、Kotlin マルチプラットフォーム ライブラリ、およびその他のマルチプラットフォーム プロジェクト](multiplatform-add-dependencies.md)
*   プラットフォーム固有のソースセットで使用するための [Android 依存関係の追加](multiplatform-android-dependencies.md) および [CocoaPods を使用する/使用しない iOS 依存関係の追加](multiplatform-ios-dependencies.md) について学びます。
*   サンプルプロジェクトで [Android および iOS ライブラリを使用する方法](multiplatform-samples.md) の例を確認してください。

## ヘルプの利用

*   **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受け取り、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
*   **Kotlin 課題トラッカー**: [新しい課題を報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。