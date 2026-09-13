[//]: # (title: Kotlin/JS でテストを実行する)

Kotlin Multiplatform Gradle プラグインを使用すると、Gradle 設定を介して指定できるさまざまなテストランナーを使用してテストを実行できます。

Kotlin/JS でテストを実行する一般的なワークフローは、テストの依存関係を追加し、ビルドファイルでテストタスクを設定し、テストを追加して実行することです。

ブラウザテストでは、次のいずれかを選択できます。

* [Karma](https://karma-runner.github.io/) テストランナー
* ブラウザテスト用の新しい DSL

> Karma プロジェクトは[非推奨（deprecated）](https://github.com/karma-runner/karma#karma)になりました。新機能やバグ修正は期待できません。代替として、ブラウザテスト用の新しい Kotlin DSL をお試しください。
>
> ブラウザテスト用の新しい DSL は現在[試験的（Experimental）](components-stability.md#stability-levels-explained)です。いつでも変更される可能性があります。`@OptIn(ExperimentalJsTestDsl::class)` アノテーションによるオプトインが必要です。
>
{style="warning"}

## テストの依存関係を追加する {id="add-test-dependencies"}

マルチプラットフォームプロジェクトを作成する際、`commonTest` に単一の依存関係を使用することで、JavaScript ターゲットを含むすべてのソースセットにテストの依存関係を追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // これにより、JS でテストアノテーションと機能が利用可能になります
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // これにより、JS でテストアノテーションと機能が利用可能になります
            }
        }
    }
}
```

</tab>
</tabs>

## ブラウザを設定する {id="configure-browsers"}

Kotlin/JS では、特定のブラウザに対してテストを実行できます。これを行うには、Gradle ビルドファイルの `browser {}` 設定ブロックで設定を調整します。

デフォルトでは、プラグインはブラウザテストの実行に [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) を使用します。デフォルトでは、Kotlin Multiplatform Gradle プラグインにブラウザは同梱されていません。追加のブラウザを有効にするには、Karma の場合は `testTask {}` ブロックを、ブラウザテスト用の新しい DSL の場合は `test {}` ブロックを使用します。利用可能なすべてのオプションは以下を参照してください。

<tabs group="js-test-dsl">
<tab title="Karma" group-key="karma">

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useIe()
                    useSafari()
                    useFirefox()
                    useChrome()
                    useChromeCanary()
                    useChromeHeadless()
                    usePhantomJS()
                    useOpera()
                }
            }
        }
    }
}
```

Karma を使用する場合、ターゲットシステム（ローカルまたは CI）に必要なすべてのブラウザをインストールする必要があります。

Karma の機能の詳細については、[Kotlin/JS プロジェクトのセットアップ](js-project-setup.md#karma)を参照してください。

</tab>
<tab title="DSL for browser testing" group-key="Browser-test-dsl">

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                chromium()
                firefox()
                webkit() // Safari ブラウザ
            }
        }
    }
}
```

ブラウザテスト用の新しい DSL では、Kotlin Multiplatform Gradle プラグインが [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) コマンドを使用して初回の実行時に必要なブラウザをインストールします。その後、Playwright がこれらのブラウザの場所を管理し、ローカルにインストールされたブラウザは使用しません。

ブラウザテスト用の新しい DSL で利用可能な追加設定については、[高度な設定](#advanced-configuration)を参照してください。

</tab>
</tabs>

## テストを追加する {id="add-a-test"}

テストが正しく実行されるか確認するには、以下の内容で `src/jsTest/kotlin/AppTest.kt` ファイルを作成します。

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

@Test
fun thingsShouldWork() {
    assertEquals(listOf(3,2,1), listOf(1,2,3).reversed())
}

@Test
fun thingsShouldBreak() {
    assertEquals(listOf(1,2,3), listOf(1,2,3).reversed())
}
```

## テストを実行する {id="run-tests"}

ブラウザでテストを実行するには、`jsBrowserTest` タスクを実行するか、IntelliJ IDEA のガター（gutter）アイコンを使用してすべてのテストまたは個別のテストを実行します。

![Gradle browserTest タスク](browsertest-task.png){width=700}

あるいは、コマンドラインからテストを実行したい場合は、Gradle ラッパーを使用します。

```bash
./gradlew jsBrowserTest
```

IntelliJ IDEA でテストを実行すると、**実行（Run）**ツールウィンドウにテスト結果が表示されます。失敗したテストをクリックするとスタックトレースを表示でき、ダブルクリックすると対応するテストの実装に移動できます。

![IntelliJ IDEA でのテスト結果](test-stacktrace-ide.png){width=700}

テストの実行方法に関わらず、各テストの実行後に `build/reports/tests/jsBrowserTest/index.html` に Gradle による適切にフォーマットされたテストレポートが生成されます。このファイルをブラウザで開くと、テスト結果の概要を別の形で確認できます。

![Gradle テストサマリー](test-summary.png){width=700}

上記のスニペットに示されているサンプルのテストセットを使用している場合、1 つのテストが成功し、1 つのテストが失敗するため、テストの成功率は 50% になります。個々のテストケースに関する詳細情報を取得するには、提供されているリンクを使用してください。

![Gradle サマリー内での失敗したテストのスタックトレース](failed-test.png){width=700}

## 高度な設定 {id="advanced-configuration"}
<primary-label ref="experimental-opt-in"/>

> このセクションは、ブラウザテスト用の新しい実験的 DSL にのみ適用されます。
>
{style="note"}

ブラウザテスト用の新しい DSL は、ミニマルでツールに依存しないように設計されています。現在の実装には以下が含まれます。

* [Playwright](https://playwright.dev/)：Chromium、Firefox、および WebKit (Safari) ブラウザエンジンをサポートするブラウザドライバおよび配布マネージャーとして機能します。
* [Mocha](https://mochajs.org/)：テストランナーとして機能します。
* [webpack](https://webpack.js.org/)：バンドラーとして機能します（[今後のリリース](https://youtrack.jetbrains.com/issue/KT-48308/)で [Vite](https://vite.dev/) に置き換えられる予定です）。

この DSL は、タイムアウト、ヘッドレスモード、およびランナーごとのオプションを Gradle プロパティとして公開しているため、ランナー間でデフォルト値を共有したり、特定のブラウザ用にオーバーライドしたり、プロバイダー（providers）を使用して値を遅延計算したりできます。

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // kotlin.Duration を使用してすべてのランナーのデフォルトのタイムアウトを設定
                timeout = 30.seconds

                // Gradle プロバイダーを使用してヘッドレスモードを設定
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)

                // カスタム名で Chromium ランナーを有効化して設定
                chromium("chromium-no-webgl2") {
                    // このランナーのデフォルトのタイムアウトをオーバーライド
                    timeout = 10.seconds

                    // Chromium 固有の追加の起動引数
                    launchArgs.add("--disable-webgl2")
                }

                // Firefox ランナーを有効化
                firefox()

                // WebKit ランナーを有効化して設定
                webkit("safari") {
                    timeout = 35.seconds
                }
            }
        }
    }
}
```

すべてのテストランナーに対するオプションは、`test {}` ブロックで直接設定できます。特定のランナーについてこれらの共通オプションをオーバーライドするには、カスタム名を指定し、ランナーブロック内で異なる値を指定します。この例では、Chromium と WebKit（Safari）ブラウザはそれぞれ 10 秒と 35 秒のタイムアウトを使用し、Firefox は共通のタイムアウトである 30 秒を使用します。

各ランナーは独自の名前で登録されるため、テストレポートで特定の結果がどのブラウザからのものであるかがわかります。

## プラグイン作成者向けの設定 {id="configuration-for-plugin-authors"}
<primary-label ref="experimental-opt-in"/>

> このセクションは、ブラウザテスト用の新しい実験的 DSL にのみ適用されます。
>
{style="note"}

Kotlin Multiplatform Gradle プラグインの上に Gradle プラグインを作成する場合、ブラウザテスト用の新しい DSL により、ブラウザランナーや生成されたテストバンドルの場所へのアクセスも提供されます。

Kotlin は、デフォルトの[テストランナーページ](https://github.com/Kotlin/kotlin-web-helpers/blob/main/static/test.html)を使用して、ブラウザテストを実行するためのテストバンドルを生成します。`testsLocation` プロパティで別の場所を指すようにすることで、これを置き換えることができます。

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // customJsTestsLocation を実装してデフォルトの JS テストバンドルを変更または置き換える
                @OptIn(DelicateKotlinGradlePluginApi::class)
                testsLocation = customJsTestsLocation(extendFrom = defaultTestsLocationProvider)

                chromium()
            }
        }
    }
}
```

カスタムテストバンドラーには、独自の開発サーバー、バンドラー、またはテストランナーを含めることができます。`defaultTestsLocationProvider` プロパティによりデフォルトの場所にアクセスできるため、すべてを一から実装する代わりに、その上に構築することができます。

各テストの場所は、`KotlinJsTestsLocation` インターフェースを通じて、生成されたテストバンドルを含むディレクトリ（`bundleLocation`）、テストページの名前（`testHtmlFileName`）、ブラウザが開く URL（`url`）を公開します。

これらの API にアクセスすることで、以下のことが可能になります。

* ブラウザが開く URL をカスタマイズする。各ブラウザランナーには独自のテストの場所があるため、`test {}` ブロック内のすべてのランナーに対してオーバーライドすることも、特定のランナーに対してオーバーライドすることもできます。
* バンドルの場所自体をオーバーライドする（例：バンドルに追加のファイルを含めるなど）。
* 生成されたテストバンドルを後処理する。独自のタスクを登録し、ブラウザがファイルを開く前にそこでファイルを変更します（例：独自の構成を `test.html` に注入するなど）。

これらの API を使用してプラグインをビルドする際は、以下の制限事項に留意してください。

* `subtarget.test` を設定すると新しいテストパイプラインが有効になり、Karma が無効になります。現在、ユーザーがどちらのパイプラインを選択したかを確実に検出する方法はありません。
* 特定のブラウザランナーを遅延設定する確実な方法がないため、設定は `afterEvaluate` で行う必要があります。ユーザーにテストの場所を明示的に設定するよう求めるか、代わりに `myPluginChromium()` などのデコレータ関数を公開することを検討してください。

## フィードバックの送信 {id="leave-feedback"}

ブラウザテスト用の新しい DSL は現在活発に開発されています。今後の Kotlin リリースに向けて、デバッグなどの新機能が計画されています。

[YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) や [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) Slack チャンネルへのフィードバックをお待ちしています。