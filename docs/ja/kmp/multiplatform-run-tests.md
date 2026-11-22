[//]: # (title: マルチプラットフォームアプリのテスト − チュートリアル)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>このチュートリアルではIntelliJ IDEAを使用しますが、Android Studioでも同様に進めることができます。両方のIDEで同じコア機能とKotlin Multiplatformサポートが共有されています。</p>
</tldr>

このチュートリアルでは、Kotlin Multiplatformアプリケーションでテストを作成、設定、実行する方法を学びます。

マルチプラットフォームプロジェクトのテストは、次の2つのカテゴリに分類できます。

* 共通コードのテスト。これらのテストは、サポートされている任意のフレームワークを使用して任意のプラットフォーム上で実行できます。
* プラットフォーム固有コードのテスト。プラットフォーム固有のロジックをテストするために不可欠です。これらはプラットフォーム固有のフレームワークを使用し、より豊富なAPIや幅広いアサーションなど、その追加機能の恩恵を受けることができます。

マルチプラットフォームプロジェクトでは、両方のカテゴリがサポートされています。このチュートリアルでは、まずシンプルなKotlin Multiplatformプロジェクトで共通コードのユニットテストを設定、作成、実行する方法を説明します。その後、共通コードとプラットフォーム固有コードの両方にテストが必要な、より複雑な例を扱います。

> このチュートリアルでは、以下を理解していることを前提としています:
> * Kotlin Multiplatformプロジェクトのレイアウト。まだ慣れていない場合は、開始する前に[このチュートリアル](multiplatform-upgrade-app.md)を完了してください。
> * [JUnit](https://junit.org/junit5/)などの一般的なユニットテストフレームワークの基本。
>
{style="tip"}

## シンプルなマルチプラットフォームプロジェクトのテスト {id="test-a-simple-multiplatform-project"}

### プロジェクトの作成 {id="create-a-project"}

1. [クイックスタート](quickstart.md)の[Kotlin Multiplatform開発環境のセットアップ](quickstart.md#set-up-the-environment)の手順を完了します。
2. IntelliJ IDEAで、**File** | **New** | **Project** を選択します。
3. 左側のパネルで、**Kotlin Multiplatform** を選択します。
4. **New Project** ウィンドウで以下のフィールドを指定します:

    * **Name**: KMP testing
    * **Project ID**: kmp.project.testing

5. **Android** ターゲットを選択します。
   Macを使用している場合は、**iOS** も選択します。**Do not share UI** オプションが選択されていることを確認してください。
6. **Include tests** の選択を解除し、**Create** をクリックします。

   ![シンプルなマルチプラットフォームプロジェクトの作成](create-test-multiplatform-project.png){width=800}

### コードの記述 {id="write-code"}

`sharedLogic/src/commonMain/kotlin` ディレクトリに、新しい `common.example.search` パッケージを作成します。
このパッケージ内に、以下の関数を含むKotlinファイル `Grep.kt` を作成します:

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

この関数は、[UNIXの `grep` コマンド](https://en.wikipedia.org/wiki/Grep)に似せて設計されています。ここでは、テキストの行、正規表現として使用されるパターン、そして行がパターンに一致するたびに呼び出される関数を受け取ります。

### テストの追加 {id="add-tests"}

それでは、共通コードをテストしてみましょう。不可欠な部分となるのが共通テスト用のソースセット（source set）であり、これには [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) APIライブラリへの依存関係が含まれます。

1. `sharedLogic/build.gradle.kts` ファイルで、`kotlin.test` ライブラリへの依存関係があることを確認します:

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest` ソースセットには、すべての共通テストが格納されます。プロジェクト内に同じ名前のディレクトリを作成する必要があります:

    1. `sharedLogic/src` ディレクトリを右クリックし、**New | Directory** を選択します。IDEに候補のリストが表示されます。
    2. `commonTest/kotlin` パスを入力して候補を絞り込み、リストから選択します:

      ![共通テストディレクトリの作成](create-common-test-dir.png){width=350}

3. `commonTest/kotlin` ディレクトリ内に、新しい `common.example.search` パッケージを作成します。
4. このパッケージ内に `Grep.kt` ファイルを作成し、以下のユニットテストで更新します:

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

ご覧のとおり、インポートされたアノテーションやアサーションはプラットフォーム固有でもフレームワーク固有でもありません。
後でこのテストを実行するときに、プラットフォーム固有のフレームワークがテストランナーを提供します。

#### `kotlin.test` APIを調べる {initial-collapse-state="collapsed" collapsible="true" id="explore-the-kotlin-test-api"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリは、テストで使用できるプラットフォームに依存しないアノテーションとアサーションを提供します。`Test` などのアノテーションは、選択されたフレームワークによって提供されるもの、またはそれに最も近い同等物にマッピングされます。

アサーションは、[`Asserter` インターフェース](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/)の実装を通じて実行されます。このインターフェースは、テストで一般的に実行されるさまざまなチェックを定義しています。APIにはデフォルトの実装がありますが、通常はフレームワーク固有の実装を使用します。

たとえば、JVMではJUnit 4、JUnit 5、TestNGフレームワークがすべてサポートされています。Androidでは、`assertEquals()` の呼び出しが `asserter.assertEquals()` の呼び出しにつながる場合があり、ここでの `asserter` オブジェクトは `JUnit4Asserter` のインスタンスです。iOSでは、`Asserter` 型のデフォルト実装がKotlin/Nativeテストランナーと組み合わせて使用されます。

### テストの実行 {id="run-tests"}

テストは以下のいずれかを実行することで実行できます:

* ガター（gutter）にある **Run** アイコンを使用して `shouldFindMatches()` テスト関数を実行する。
* コンテキストメニューを使用してテストファイルを実行する。
* ガターにある **Run** アイコンを使用して `GrepTest` テストクラスを実行する。

また、便利なショートカット <shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut> もあります。
どの方法を選択しても、テストを実行するためのターゲットのリストが表示されます:

![テストタスクの実行](run-test-tasks.png){width=300}

`android` オプションの場合、テストはJUnit 4を使用して実行されます。`iosSimulatorArm64` の場合、Kotlinコンパイラはテストアノテーションを検出し、Kotlin/Native独自のテストランナーによって実行される_テストバイナリ_を作成します。

テストの実行が成功したときに生成される出力例を以下に示します:

![テスト出力](run-test-results.png){width=700}

## より複雑なプロジェクトでの作業 {id="work-with-more-complex-projects"}

### 共通コードのテストを作成する {id="write-tests-for-common-code"}

すでに `grep()` 関数を使用して共通コードのテストを作成しました。次は、`CurrentRuntime` クラスを使用した、より高度な共通コードのテストを検討してみましょう。このクラスには、コードが実行されるプラットフォームの詳細が含まれます。たとえば、ローカルJVM上で実行されるAndroidのユニットテストの場合、「OpenJDK」や「17.0」という値を持つ可能性があります。

`CurrentRuntime` のインスタンスは、プラットフォームの名前とバージョン（文字列）を指定して作成する必要があります。バージョンは省略可能です。バージョンが存在する場合は、可能であれば文字列の先頭にある数値のみが必要です。

1. `commonMain/kotlin` ディレクトリに、新しい `org.kmp.testing` パッケージを作成します。
2. このパッケージ内に `CurrentRuntime.kt` ファイルを作成し、以下の実装で更新します:

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

3. `commonTest/kotlin` ディレクトリに、新しい `org.kmp.testing` パッケージを作成します。
4. このパッケージ内に `CurrentRuntimeTest.kt` ファイルを作成し、以下のプラットフォームおよびフレームワーク非依存のテストで更新します:

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

このテストは、[IDEで利用可能](#run-tests)な任意の方法で実行できます。

### プラットフォーム固有のテストを追加する {id="add-platform-specific-tests"}

> ここでは、簡潔さとシンプルさのために[expectedとactual宣言のメカニズム](multiplatform-connect-to-apis.md)を使用しています。より複雑なコードでは、インターフェースとファクトリ関数を使用するアプローチの方が適しています。
>
{style="note"}

共通コードのテスト作成を経験したので、次はAndroidとiOS向けのプラットフォーム固有のテストの作成について見ていきましょう。

`CurrentRuntime` のインスタンスを作成するために、共通の `CurrentRuntime.kt` ファイルで次のように関数を宣言します:

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

この関数には、サポートされているプラットフォームごとに個別の実装が必要です。そうでない場合、ビルドは失敗します。
各プラットフォームでこの関数を実装するだけでなく、テストも提供する必要があります。AndroidとiOS向けに作成してみましょう。

#### Androidの場合 {id="for-android"}

1. `androidMain/kotlin` ディレクトリに、新しい `org.kmp.testing` パッケージを作成します。
2. このパッケージ内に `AndroidRuntime.kt` ファイルを作成し、expectされた `determineCurrentRuntime()` 関数のactual実装で更新します:

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. `sharedLogic/src` ディレクトリ内にテスト用のディレクトリを作成します:
 
   1. `sharedLogic/src` ディレクトリを右クリックし、**New | Directory** を選択します。IDEに候補のリストが表示されます。
   2. `androidHostTest/kotlin` パスを入力して候補を絞り込み、リストから選択します:

      ![Androidテストディレクトリの作成](create-android-test-dir.png){width=350}

4. `androidHostTest/kotlin` ディレクトリ内に、新しい `org.kmp.testing` パッケージを作成します。
5. このパッケージ内に `AndroidRuntimeTest.kt` ファイルを作成し、以下のAndroidテストで更新します。
   テストをパスさせるには、ランタイムの実際の名前とバージョンを正しく設定してください（ただし、テストがどのように失敗するかを確認するのも有益です）:

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
   
Android固有のテストがローカルJVM上で実行されるのは奇妙に思えるかもしれません。これは、これらのテストが現在のマシン上でローカルユニットテストとして実行されるためです。[Android Studioのドキュメント](https://developer.android.com/studio/test/test-in-android-studio)で説明されているように、これらのテストはデバイスやエミュレータ上で実行されるインストゥルメンテッドテスト（instrumented test）とは異なります。

プロジェクトに他の種類のテストを追加することもできます。インストゥルメンテッドテストの詳細については、この[Touchlabのガイド](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)を参照してください。

#### iOSの場合 {id="for-ios"}

1. `iosMain/kotlin` ディレクトリに、新しい `org.kmp.testing` ディレクトリを作成します。
2. このディレクトリ内に `IOSRuntime.kt` ファイルを作成し、expectされた `determineCurrentRuntime()` 関数のactual実装で更新します:

    ```kotlin
    import kotlin.experimental.ExperimentalNativeApi
    import kotlin.native.Platform
    
    @OptIn(ExperimentalNativeApi::class)
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = Platform.osFamily.name.lowercase()
        return CurrentRuntime(name, null)
    }
    ```

3. `sharedLogic/src` ディレクトリに新しいディレクトリを作成します:
   
   1. `sharedLogic/src` ディレクトリを右クリックし、**New | Directory** を選択します。IDEに候補のリストが表示されます。
   2. `iosTest/kotlin` パスを入力して候補を絞り込み、リストから選択します:

4. `iosTest/kotlin` ディレクトリに、新しい `org.kmp.testing` ディレクトリを作成します。
5. このディレクトリ内に `IOSRuntimeTest.kt` ファイルを作成し、以下のiOSテストで更新します:

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

この段階で、共通、Android、iOSの実装コードとそのテストが揃いました。
プロジェクトのディレクトリ構造は次のようになっているはずです:

![プロジェクト全体の構造](code-and-test-structure.png){width=300}

コンテキストメニューから個々のテストを実行したり、ショートカットを使用したりできます。もう1つの選択肢はGradleタスクを使用することです。たとえば、`allTests` Gradleタスクを実行すると、プロジェクト内のすべてのテストが対応するテストランナーで実行されます:

![Gradleテストタスク](gradle-alltests.png){width=700}

テストを実行すると、IDEでの出力に加えてHTMLレポートが生成されます。レポートは `sharedLogic/build/reports/tests` ディレクトリにあります:

![マルチプラットフォームテスト用のHTMLレポート](shared-tests-folder-reports.png){width=300}

`allTests` タスクを実行し、生成されたレポートを確認してみましょう:

* `allTests/index.html` ファイルには、共通テストとiOSテストの結合されたレポートが含まれています（iOSテストは共通テストに依存しており、共通テストの後に実行されます）。
* `testDebugUnitTest` および `testReleaseUnitTest` フォルダには、デフォルトのAndroidビルドフレーバー両方のレポートが含まれています（現在、Androidのテストレポートは `allTests` レポートと自動的にはマージされません）。

![マルチプラットフォームテストのHTMLレポート](multiplatform-test-report.png){width=700}

## マルチプラットフォームプロジェクトでテストを使用するためのルール {id="rules-for-using-tests-in-multiplatform-projects"}

これで、Kotlin Multiplatformアプリケーションでテストを作成、設定、実行しました。
今後のプロジェクトでテストを扱う際は、以下の点に留意してください:

* 共通コードのテストを作成する場合は、[kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/) などのマルチプラットフォームライブラリのみを使用してください。依存関係は `commonTest` ソースセットに追加します。
* `kotlin.test` APIの `Asserter` 型は、間接的にのみ使用してください。`Asserter` インスタンスは参照可能ですが、テスト内で直接使用する必要はありません。
* 常にテストライブラリのAPIの範囲内にとどめてください。幸いにも、コンパイラとIDEによってフレームワーク固有の機能の使用は防止されます。
* `commonTest` でのテスト実行にどのフレームワークを使用するかは重要ではありませんが、開発環境が正しく設定されていることを確認するために、使用予定の各フレームワークでテストを実行することをお勧めします。
* 物理的な挙動の違いを考慮してください。たとえば、スクロールの慣性や摩擦値はプラットフォームやデバイスによって異なるため、同じスクロール速度を設定してもスクロール位置が異なる場合があります。期待通りの動作を確認するために、コンポーネントは常にターゲットプラットフォーム上でテストしてください。
* プラットフォーム固有コードのテストを作成する際は、対応するフレームワークの機能（アノテーションや拡張機能など）を使用できます。
* テストはIDEから実行することも、Gradleタスクを使用して実行することもできます。
* テストを実行すると、HTMLテストレポートが自動的に生成されます。

## 次のステップ {id="what-s-next"}

* [マルチプラットフォームプロジェクトの構造を理解する](multiplatform-discover-project.md)でマルチプラットフォームプロジェクトのレイアウトを確認してください。
* [TestBalloon](https://infix-de.github.io/testBalloon/latest/) は、すべてのKotlin Multiplatformターゲットに加え、[Kotlin Power Assert](https://kotlinlang.org/docs/power-assert.html) やその他のアサーションライブラリをサポートするマルチプラットフォームテストフレームワークです。
* [Kotest](https://kotest.io/) は、さまざまなスタイルでテストを作成でき、通常のテストを補完するアプローチをサポートするもう1つのマルチプラットフォームテストフレームワークです。これには、[データ駆動テスト (data-driven testing)](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)や[プロパティベーステスト (property-based testing)](https://kotest.io/docs/proptest/property-based-testing.html)が含まれます。