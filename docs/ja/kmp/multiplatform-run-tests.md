[//]: # (title: マルチプラットフォームアプリのテスト − チュートリアル)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>このチュートリアルではIntelliJ IDEAを使用しますが、Android Studioでも同様に進めることができます。両方のIDEで同じコア機能とKotlin Multiplatformサポートが共有されています。</p>
</tldr>

このチュートリアルでは、Kotlin Multiplatformアプリケーションでテストを作成、設定、実行する方法を学びます。

マルチプラットフォームプロジェクトのテストは、大きく2つのカテゴリに分けることができます。

* 共通コードのテスト: これらのテストは、サポートされている任意のフレームワークを使用して任意のプラットフォーム上で実行できます。
* プラットフォーム固有コードのテスト: プラットフォーム固有のロジックをテストするために不可欠です。プラットフォーム固有のフレームワークを使用し、より豊富なAPIや幅広いアサーションなど、その追加機能の恩恵を受けることができます。

マルチプラットフォームプロジェクトでは、両方のカテゴリがサポートされています。このチュートリアルでは、まずシンプルなKotlin Multiplatformプロジェクトにおいて、共通コードのユニットテストをセットアップ、作成、実行する方法を説明します。その後、共通コードとプラットフォーム固有コードの両方のテストが必要な、より複雑な例を扱います。

> このチュートリアルでは、以下について理解していることを前提としています:
> * Kotlin Multiplatformプロジェクトの構成。よくわからない場合は、始める前に[こちらのチュートリアル](multiplatform-upgrade-app.md)を完了してください。
> * [JUnit](https://junit.org/junit5/)などの代表的なユニットテストフレームワークの基礎。
>
{style="tip"}

## シンプルなマルチプラットフォームプロジェクトのテスト {id="test-a-simple-multiplatform-project"}

### プロジェクトの作成 {id="create-a-project"}

1. [クイックスタート](quickstart.md)で、[Kotlin Multiplatform開発用の環境をセットアップする](quickstart.md#set-up-the-environment)手順を完了します。
2. IntelliJ IDEAで、**File** | **New** | **Project**を選択します。
3. 左側のパネルで**Kotlin Multiplatform**を選択します。
4. **New Project**ウィンドウで以下のフィールドを指定します:

    * **Name**: KMP testing
    * **Project ID**: kmp.project.testing

5. **Android**ターゲットを選択します。
   Macを使用している場合は、**iOS**も選択してください。その際、**Do not share UI**オプションを選択していることを確認してください。
6. **Include tests**の選択を解除し、**Create**をクリックします。

   ![Create simple multiplatform project](create-test-multiplatform-project.png){width=800}

### コードを書く {id="write-code"}

`sharedLogic/src/commonMain/kotlin`ディレクトリ内に、新しいパッケージ`common.example.search`を作成します。
このパッケージ内にKotlinファイル`Grep.kt`を作成し、以下の関数を記述します:

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

この関数は、[UNIXの`grep`コマンド](https://en.wikipedia.org/wiki/Grep)を模倣するように設計されています。この関数はテキスト行のリスト、正規表現として使用されるパターン、そして行がパターンに一致するたびに呼び出される関数を受け取ります。

### テストを追加する {id="add-tests"}

それでは、共通コードをテストしてみましょう。重要な要素となるのは共通テスト用のソースセットであり、これには[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) APIライブラリへの依存関係が含まれます。

1. `sharedLogic/build.gradle.kts`ファイルで、`kotlin.test`ライブラリへの依存関係があることを確認します:

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest`ソースセットにはすべての共通テストが格納されます。プロジェクト内に同じ名前のディレクトリを作成する必要があります:

    1. `sharedLogic/src`ディレクトリを右クリックし、**New | Directory**を選択します。IDEに選択肢のリストが表示されます。
    2. `commonTest/kotlin`パスを入力し始めて候補を絞り込み、リストから選択します:

      ![Creating common test directory](create-common-test-dir.png){width=350}

3. `commonTest/kotlin`ディレクトリ内に、新しいパッケージ`common.example.search`を作成します。
4. このパッケージ内に`Grep.kt`ファイルを作成し、以下のユニットテストを記述します:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class GrepTest {
        companion object {
            val sampleData = listOf(
                "123 abc",
                "abc 123",
                "123 ABC",
                "ABC 123"
            )
        }
    
        @Test
        fun shouldFindMatches() {
            val results = mutableListOf<String>()
            grep(sampleData, "[a-z]+") {
                results.add(it)
            }
    
            assertEquals(2, results.size)
            for (result in results) {
                assertContains(result, "abc")
            }
        }
    }
    ```

ご覧のとおり、インポートされたアノテーションやアサーションはプラットフォーム固有でもフレームワーク固有でもありません。後でこのテストを実行する際、プラットフォーム固有のフレームワークがテストランナーを提供します。

#### `kotlin.test` APIの詳細 {initial-collapse-state="collapsed" collapsible="true"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/)ライブラリは、テストで使用するためのプラットフォームに依存しないアノテーションとアサーションを提供します。`Test`などのアノテーションは、選択されたフレームワークが提供するもの、またはそれに最も近い同等のものにマッピングされます。

アサーションは、[`Asserter`インターフェース](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/)の実装を通じて実行されます。このインターフェースは、テストで一般的に行われるさまざまなチェックを定義しています。APIにはデフォルトの実装がありますが、通常はフレームワーク固有の実装が使用されます。

例えば、JVM上ではJUnit 4、JUnit 5、およびTestNGフレームワークがすべてサポートされています。Androidでは、`assertEquals()`の呼び出しによって`asserter.assertEquals()`が呼び出される場合があり、その際の`asserter`オブジェクトは`JUnit4Asserter`のインスタンスになります。iOSでは、`Asserter`型のデフォルト実装がKotlin/Nativeテストランナーと組み合わせて使用されます。

### テストの実行

テストは以下のいずれかの方法で実行できます:

* ガター（エディタ左端）にある**Run**アイコンを使用して、テスト関数`shouldFindMatches()`を実行する。
* コンテキストメニューからテストファイルを実行する。
* ガターにある**Run**アイコンを使用して、テストクラス`GrepTest`を実行する。

便利なショートカット<shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut>もあります。
どの方法を選択しても、テストを実行するターゲットのリストが表示されます:

![Run test task](run-test-tasks.png){width=300}

`android`オプションの場合、テストはJUnit 4を使用して実行されます。`iosSimulatorArm64`の場合、Kotlinコンパイラがテストアノテーションを検出し、Kotlin/Native独自のテストランナーによって実行される*テストバイナリ*を作成します。

テストが正常に実行された際に出力される例を以下に示します:

![Test output](run-test-results.png){width=700}

## より複雑なプロジェクトでの作業

### 共通コードのテストを書く

すでに`grep()`関数を使用して共通コードのテストを作成しました。次は、`CurrentRuntime`クラスを使ったより高度な共通コードのテストを考えてみましょう。このクラスには、コードが実行されているプラットフォームの詳細情報が含まれます。例えば、ローカルJVM上で実行されるAndroidユニットテストの場合、「OpenJDK」や「17.0」といった値を持つことがあります。

`CurrentRuntime`のインスタンスは、プラットフォームの名前とバージョンを文字列として渡して作成される必要があります（バージョンは省略可能）。バージョンが存在する場合は、文字列の先頭にある数値のみを取得します（取得可能な場合）。

1. `commonMain/kotlin`ディレクトリ内に、新しいパッケージ`org.kmp.testing`を作成します。
2. このパッケージ内に`CurrentRuntime.kt`ファイルを作成し、以下の実装を記述します:

    ```kotlin
    class CurrentRuntime(val name: String, rawVersion: String?) {
        companion object {
            val versionRegex = Regex("^[0-9]+(\\.[0-9]+)?")
        }
    
        val version = parseVersion(rawVersion)
    
        override fun toString() = "$name version $version"
    
        private fun parseVersion(rawVersion: String?): String {
            val result = rawVersion?.let { versionRegex.find(it) }
            return result?.value ?: "unknown"
        }
    }
    ```

3. `commonTest/kotlin`ディレクトリ内に、新しいパッケージ`org.kmp.testing`を作成します。
4. このパッケージ内に`CurrentRuntimeTest.kt`ファイルを作成し、以下のプラットフォームおよびフレームワークに依存しないテストを記述します:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals

    class CurrentRuntimeTest {
        @Test
        fun shouldDisplayDetails() {
            val runtime = CurrentRuntime("MyRuntime", "1.1")
            assertEquals("MyRuntime version 1.1", runtime.toString())
        }
    
        @Test
        fun shouldHandleNullVersion() {
            val runtime = CurrentRuntime("MyRuntime", null)
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    
        @Test
        fun shouldParseNumberFromVersionString() {
            val runtime = CurrentRuntime("MyRuntime", "1.2 Alpha Experimental")
            assertEquals("MyRuntime version 1.2", runtime.toString())
        }
    
        @Test
        fun shouldHandleMissingVersion() {
            val runtime = CurrentRuntime("MyRuntime", "Alpha Experimental")
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    }
    ```

[IDEで利用可能な任意の方法](#run-tests)を使用して、このテストを実行できます。

### プラットフォーム固有のテストを追加する

> ここでは、簡潔さとシンプルさのために[expect/actual宣言の仕組み](multiplatform-connect-to-apis.md)を使用しています。より複雑なコードでは、インターフェースとファクトリ関数を使用するアプローチの方が適しています。
>
{style="note"}

共通コードのテストを書く経験ができたので、次はAndroidとiOS向けのプラットフォーム固有テストの作成を見ていきましょう。

`CurrentRuntime`のインスタンスを作成するために、共通の`CurrentRuntime.kt`ファイルで以下のように関数を宣言します:

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

この関数は、サポートされているプラットフォームごとに個別の実装を持つ必要があります。そうでない場合、ビルドは失敗します。各プラットフォームでこの関数を実装するだけでなく、テストも提供する必要があります。それでは、AndroidとiOS向けにテストを作成しましょう。

#### Androidの場合 {id="for-android"}

1. `androidMain/kotlin`ディレクトリ内に、新しいパッケージ`org.kmp.testing`を作成します。
2. このパッケージ内に`AndroidRuntime.kt`ファイルを作成し、expected関数`determineCurrentRuntime()`のactual実装を記述します:

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. `sharedLogic/src`ディレクトリ内にテスト用のディレクトリを作成します:
 
   1. `sharedLogic/src`ディレクトリを右クリックし、**New | Directory**を選択します。IDEに選択肢のリストが表示されます。
   2. `androidHostTest/kotlin`パスを入力し始めて候補を絞り込み、リストから選択します:

      ![Creating Android test directory](create-android-test-dir.png){width=350}

4. `androidHostTest/kotlin`ディレクトリ内に、新しいパッケージ`org.kmp.testing`を作成します。
5. このパッケージ内に`AndroidRuntimeTest.kt`ファイルを作成し、以下のAndroidテストを記述します。
   テストを成功させるには、ランタイムの実際の名前とバージョンを設定してください（ただし、テストがどのように失敗するかを確認するのも有益です）:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class AndroidRuntimeTest {
        @Test
        fun shouldDetectAndroid() {
            val runtime = determineCurrentRuntime()
            assertContains(runtime.name, "OpenJDK")
            assertEquals(runtime.version, "21.0")
        }
    }
    ```
   
Android固有のテストがローカルJVM上で実行されるのは不思議に思えるかもしれません。これは、これらのテストが現在のマシン上でローカルユニットテストとして実行されるためです。[Android Studioのドキュメント](https://developer.android.com/studio/test/test-in-android-studio)で説明されているように、これらのテストは実機またはエミュレータ上で実行されるインストゥルメンテーションテスト（instrumented tests）とは異なります。

プロジェクトには他の種類のテストを追加することもできます。インストゥルメンテーションテストの詳細については、こちらの[Touchlabガイド](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)を参照してください。

#### iOSの場合 {id="for-ios"}

1. `iosMain/kotlin`ディレクトリ内に、新しいディレクトリ`org.kmp.testing`を作成します。
2. このディレクトリ内に`IOSRuntime.kt`ファイルを作成し、expected関数`determineCurrentRuntime()`のactual実装を記述します:

    ```kotlin
    import kotlin.experimental.ExperimentalNativeApi
    import kotlin.native.Platform
    
    @OptIn(ExperimentalNativeApi::class)
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = Platform.osFamily.name.lowercase()
        return CurrentRuntime(name, null)
    }
    ```

3. `sharedLogic/src`ディレクトリ内に新しいディレクトリを作成します:
   
   1. `sharedLogic/src`ディレクトリを右クリックし、**New | Directory**を選択します。IDEに選択肢のリストが表示されます。
   2. `iosTest/kotlin`パスを入力し始めて候補を絞り込み、リストから選択します:

4. `iosTest/kotlin`ディレクトリ内に、新しいディレクトリ`org.kmp.testing`を作成します。
5. このディレクトリ内に`IOSRuntimeTest.kt`ファイルを作成し、以下のiOSテストを記述します:

    ```kotlin 
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class IOSRuntimeTest {
        @Test
        fun shouldDetectOS() {
            val runtime = determineCurrentRuntime()
            assertEquals(runtime.name, "ios")
            assertEquals(runtime.version, "unknown")
        }
    }
    ```

### 複数のテストの実行とレポートの分析 {id="run-multiple-tests-and-analyze-reports"}

この段階で、共通、Android、およびiOSの実装コードとそのテストが揃いました。プロジェクトのディレクトリ構造は以下のようになっているはずです:

![Whole project structure](code-and-test-structure.png){width=300}

個別のテストは、コンテキストメニューから実行するかショートカットを使用できます。もう1つの選択肢として、Gradleタスクを使用する方法もあります。例えば、`allTests` Gradleタスクを実行すると、プロジェクト内のすべてのテストが対応するテストランナーで実行されます:

![Gradle test tasks](gradle-alltests.png){width=700}

テストを実行すると、IDEでの出力に加えてHTMLレポートが生成されます。これらは`sharedLogic/build/reports/tests`ディレクトリで確認できます:

![HTML reports for multiplatform tests](shared-tests-folder-reports.png){width=300}

`allTests`タスクを実行し、生成されたレポートを確認してみましょう:

* `allTests/index.html`ファイルには、共通テストとiOSテストの統合レポートが含まれています（iOSテストは共通テストに依存しており、共通テストの後に実行されます）。
* `testDebugUnitTest`および`testReleaseUnitTest`フォルダには、デフォルトのAndroidビルドフレーバー双方のレポートが含まれています（現時点では、Androidのテストレポートは`allTests`レポートに自動的にはマージされません）。

![HTML report for multiplatform tests](multiplatform-test-report.png){width=700}

## マルチプラットフォームプロジェクトでテストを使用する際のルール {id="rules-for-using-tests-in-multiplatform-projects"}

これで、Kotlin Multiplatformアプリケーションでのテストの作成、設定、実行が一通り完了しました。今後のプロジェクトでテストを扱う際は、以下の点に留意してください:

* 共通コードのテストを作成する際は、[kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/)のようなマルチプラットフォームライブラリのみを使用してください。依存関係は`commonTest`ソースセットに追加します。
* `kotlin.test` APIの`Asserter`型は、間接的にのみ使用してください。`Asserter`インスタンスは参照可能ですが、テスト内で直接使用する必要はありません。
* 常にテストライブラリのAPIの範囲内にとどめてください。幸いにも、コンパイラとIDEによってフレームワーク固有の機能の使用が制限されます。
* `commonTest`内のテストを実行するためにどのフレームワークを使用しても基本的には問題ありませんが、開発環境が正しく設定されているか確認するためにも、使用予定の各フレームワークでテストを実行してみることをお勧めします。
* 物理的な挙動の違い（physics difference）を考慮してください。例えば、スクロールの慣性や摩擦の値はプラットフォームやデバイスによって異なるため、同じスクロール速度を設定してもスクロール位置が異なる場合があります。コンポーネントが期待どおりに動作することを確認するため、常にターゲットプラットフォーム上でテストしてください。
* プラットフォーム固有コードのテストを作成する際は、対応するフレームワークの機能（アノテーションや拡張機能など）を使用できます。
* テストはIDEから実行することも、Gradleタスクを使用して実行することもできます。
* テストを実行すると、HTMLテストレポートが自動的に生成されます。

## 次のステップ {id="what-s-next"}

* [マルチプラットフォームプロジェクトの構造を理解する](multiplatform-discover-project.md)で、マルチプラットフォームプロジェクトの構成を詳しく確認しましょう。
* Kotlinエコシステムが提供するもう1つのマルチプラットフォームテストフレームワークである[Kotest](https://kotest.io/)もチェックしてみてください。Kotestを使用すると、さまざまなスタイルでテストを記述でき、通常のテストを補完するアプローチがサポートされています。これには、[データ駆動テスト（data-driven testing）](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)や[プロパティベーステスト（property-based testing）](https://kotest.io/docs/proptest/property-based-testing.html)などが含まれます。