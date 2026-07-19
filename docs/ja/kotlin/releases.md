[//]: # (title: Kotlinのリリースプロセス)

<web-summary>Kotlinの各種リリースタイプ、それぞれのアップデート方法、およびKotlinのリリースの歴史について説明します。</web-summary>

<tldr>
    <p>Kotlinの最新バージョン: <strong>%kotlinVersion%</strong></p>
    <p><a href="%kotlinLatestWhatsnew%">Kotlin 2.4.0の新機能</a>を参照してください。また、バグ修正の詳細は<a href="%kotlinLatestUrl%">変更履歴</a>で確認できます。</p>
</tldr>

このページでは、Kotlinのリリースサイクルと、提供している各種リリースタイプについて説明します。また、過去および今後のKotlinリリースに関する詳細と、特定のリリースにアップデートする方法についても記載しています。

Kotlin 2.0.0以降、以下のタイプのリリースを提供しています：

*   _言語リリース_ (2._x_._0_): 言語における主要な変更をもたらし、ツールのアップデートも含まれます。6ヶ月に1回リリースされます。
*   _ツールリリース_ (2._x_._20_): 言語リリースの間に提供され、ツールの更新、パフォーマンスの向上、およびバグ修正が含まれます。対応する言語リリースの3ヶ月後にリリースされます。
*   _バグ修正リリース_ (2._x_._yz_): ツールリリースに対するバグ修正が含まれます。これらのリリースに決まったリリーススケジュールはありません。

> 例えば、言語リリース 2.2.0 に対しては、1つのツールリリース 2.2.20 と、1つのバグ修正リリース 2.2.21 がありました。
>
{style="tip"}

各言語リリースおよびツールリリースについては、新機能が正式にリリースされる前に試用できるよう、いくつかのプレビュー（_EAP_）バージョンも提供しています。詳細は [Early Access Preview](eap.md) を参照してください。

> Kotlinの新しいリリースに関する通知を受け取りたい場合は、[Kotlinニュースレター](https://lp.jetbrains.com/subscribe-to-kotlin-news/)を購読するか、[XのKotlin公式アカウント](https://x.com/kotlin)をフォローしてください。また、[Kotlin GitHubリポジトリ](https://github.com/JetBrains/kotlin)で **Watch | Custom | Releases** オプションを有効にすることもできます。
> 
{style="note"}

## 今後のKotlinリリース

今後の安定版Kotlinリリースの大まかなスケジュールは以下の通りです：

*   **2.4.20**: 2026年9月を予定
*   **2.5.0**: 2026年12月を予定

## 新しいKotlinバージョンへのアップデート

プロジェクトを新しいリリースにアップグレードするには、ビルドシステムのKotlinバージョンを更新します。

### Gradle

Kotlin %kotlinVersion% にアップデートするには、`build.gradle(.kts)` ファイル内の Kotlin Gradle プラグインのバージョンを変更します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // `<...>` をターゲット環境に適したプラグイン名に置き換えてください
    kotlin("<...>") version "%kotlinVersion%"
    // 例えば、ターゲット環境が JVM の場合:
    // kotlin("jvm") version "%kotlinVersion%"
    // ターゲットが Kotlin Multiplatform の場合:
    // kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // `<...>` をターゲット環境に適したプラグイン名に置き換えてください
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例えば、ターゲット環境が JVM の場合: 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    // ターゲットが Kotlin Multiplatform の場合:
    // id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

以前のKotlinバージョンで作成されたプロジェクトがある場合は、[kotlinxライブラリのバージョンを更新](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)する必要があるかどうかも確認してください。

新しい言語リリースに移行する場合、Kotlinプラグインの移行ツールがプロセスをサポートします。

> プロジェクトでGradleを操作する方法の詳細については、[Gradleプロジェクトの設定](gradle-configure-project.md)を参照してください。
> 
{style="tip"}

### Maven

Kotlin %kotlinVersion% にアップデートするには、`pom.xml` ファイルのバージョンを変更します。

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>
```

または、`pom.xml` ファイル内の `kotlin-maven-plugin` のバージョンを変更することもできます。

```xml
<plugins>
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>%kotlinVersion%</version>
    </plugin>
</plugins>
```

以前のKotlinバージョンで作成されたプロジェクトがある場合は、[kotlinxライブラリのバージョンを更新](maven-set-dependencies.md#dependency-on-a-kotlinx-library)する必要があるかどうかも確認してください。

> プロジェクトでMavenを操作する方法の詳細については、[Maven](maven.md)を参照してください。
>
{style="tip"}

## IDEのサポート

Kotlinは、JetBrainsが開発した公式のKotlinプラグインにより、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/kotlin/get-started) で標準（out-of-the-box）サポートされています。

## 標準ライブラリのセキュリティサポート

Kotlin 2.4.0以降、JVM向けのKotlin標準ライブラリには、各リリースラインに対して18ヶ月のサポート期間が設けられています。言語リリース (2._x_._0_) とその後のツールリリース (2._x_._20_) は、同じリリースライン (2._x_) に属します。

JVM向けのKotlin標準ライブラリに影響を与えるセキュリティの脆弱性が発見された場合、以下のリリースを同時に提供します：

*   セキュリティ修正を含む、そのリリースラインにおける最新のKotlinリリースに基づいたバグ修正リリース。
*   アクティブなサポート期間内にあるすべてのリリースラインに対するバグ修正リリース。

例えば、セキュリティの脆弱性が発見され、最新のKotlinリリースが Kotlin 2.4.20 である場合、Kotlin 2.4.20 に対してのみバグ修正バージョンをリリースします。Kotlin 2.4.0 に対するバグ修正バージョンはリリースされません。

以下の表は、すべてのKotlinリリースとそのサポート期間をリストしたものです：

<table>
    <tr>
        <th>Kotlin リリースライン</th>
        <th>リリース日</th>
        <th>サポート終了日</th>
        <th>最新のバグ修正リリース</th>
    </tr>
    <tr>
        <td><strong>2.4</strong>
        </td>
        <td>
            <p>2026年6月3日</p>
        </td>
        <td>
            <p>2027年12月3日</p>
        </td>
        <td>
            <p>2.4.10</p>
        </td>
    </tr>
</table>

> 発見されたセキュリティ上の問題については、常に報告をお待ちしております。Kotlinで発見した問題を報告するには、弊社の[課題トラッカー](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem)に直接メッセージを投稿するか、[電子メール](mailto:security@jetbrains.org)をお送りください。
> 
{style="tip"}

## リリースの歴史

以下の表は、過去のKotlinリリースの詳細をリストしたものです：

> [KotlinのEarly Access Preview (EAP) バージョン](eap.md#build-details)を試すこともできます。
> 
{style="tip"}

<table>
    <tr>
        <th>ビルド情報</th>
        <th>ビルドのハイライト</th>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>リリース日: <strong>2026年7月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.0のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>リリース日: <strong>2026年6月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい機能および安定した言語機能、ツールのアップデート、各種プラットフォームのパフォーマンス向上、および重要な修正を含む言語リリースです。</p>
            <p>Kotlin 2.4.0の詳細については、<a href="whatsnew24.md" target="_blank">Kotlin 2.4.0の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>リリース日: <strong>2026年4月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.20のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>リリース日: <strong>2026年3月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>パフォーマンスの向上、バグ修正、およびツールのアップデートを含むツールリリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>リリース日: <strong>2026年2月5日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.0のバグ修正リリースです。パフォーマンスの向上と、稀に発生する <a href="https://youtrack.jetbrains.com/issue/KT-83984"><code>kotlinx.serialization</code> のレースコンディション</a>に関する重要な修正が含まれています。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>リリース日: <strong>2025年12月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい機能および安定した言語機能、ツールのアップデート、各種プラットフォームのパフォーマンス向上、および重要な修正を含む言語リリースです。</p>
            <p>Kotlin 2.3.0の詳細については、<a href="whatsnew23.md" target="_blank">Kotlin 2.3.0の新機能</a>を参照してください。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>リリース日: <strong>2025年10月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Xcode 26のサポート、およびその他の改善とバグ修正を含むバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">変更履歴</a>を参照してください。</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>リリース日: <strong>2025年9月10日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Web開発に関する重要な変更とその他の改善を含む、Kotlin 2.2.0のツールリリースです。</p>
            <p>Kotlin 2.2.20の詳細については、<a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>リリース日: <strong>2025年8月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>リリース日: <strong>2025年6月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい機能および安定した言語機能、ツールのアップデート、各種プラットフォームのパフォーマンス向上、および重要な修正を含む言語リリースです。</p>
            <p>Kotlin 2.2.0の詳細については、<a href="whatsnew22.md" target="_blank">Kotlin 2.2.0の新機能</a>を参照してください。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>リリース日: <strong>2025年5月13日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.20のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>リリース日: <strong>2025年3月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
           <p>新しい実験的な機能、パフォーマンスの向上、およびバグ修正を含む、Kotlin 2.1.0のツールリリースです。</p>
            <p>Kotlin 2.1.20の詳細については、<a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>リリース日: <strong>2025年1月27日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.0のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>リリース日: <strong>2024年11月27日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能を導入した言語リリースです。</p>
            <p>Kotlin 2.1.0の詳細については、<a href="whatsnew21.md" target="_blank">Kotlin 2.1.0の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>リリース日: <strong>2024年10月10日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.20のバグ修正リリースです。</p>
            <p>詳細は<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>リリース日: <strong>2024年8月22日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
           <p>パフォーマンスの向上とバグ修正を含む、Kotlin 2.0.0のツールリリースです。Kotlin/Nativeのガベージコレクタにおける並行マーキング（concurrent marking）、Kotlin共通標準ライブラリでのUUIDサポート、Composeコンパイラのアップデート、およびGradle 8.8までのサポートが含まれます。
            </p>
            <p>Kotlin 2.0.20の詳細については、<a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>リリース日: <strong>2024年8月6日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.0のバグ修正リリースです。</p>
            <p>Kotlin 2.0.0の詳細については、<a href="whatsnew20.md" target="_blank">Kotlin 2.0.0の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>リリース日: <strong>2024年5月21日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>安定版のKotlin K2コンパイラを搭載した言語リリースです。</p>
            <p>Kotlin 2.0.0の詳細については、<a href="whatsnew20.md" target="_blank">Kotlin 2.0.0の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>リリース日: <strong>2024年7月19日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.25" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、1.9.23、および 1.9.24 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.20の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>リリース日: <strong>2024年5月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、および 1.9.23 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.20の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>リリース日: <strong>2024年3月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、および 1.9.22 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.20の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>リリース日: <strong>2023年12月21日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 および 1.9.21 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.20の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>リリース日: <strong>2023年11月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.20の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>リリース日: <strong>2023年11月1日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>ベータ版のKotlin K2コンパイラを搭載し、Kotlin Multiplatformが安定版となった機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.10</strong>
            <p>リリース日: <strong>2023年8月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.0 のバグ修正リリースです。</p>
            <p>Kotlin 1.9.0の詳細については、<a href="whatsnew19.md" target="_blank">Kotlin 1.9.0の新機能</a>を参照してください。</p>
            <note>Android Studio Giraffe および Hedgehog 用の Kotlin プラグイン 1.9.10 は、今後の Android Studio のアップデートで提供される予定です。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>リリース日: <strong>2023年7月6日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin K2コンパイラのアップデート、新しい列挙型クラスのvalues関数、オープンエンド・レンジ用の新しい演算子、Kotlin MultiplatformでのGradle設定キャッシュのプレビュー、Kotlin MultiplatformにおけるAndroidターゲットサポートの変更、Kotlin/Nativeでのカスタムメモリアロケータのプレビューを含む機能リリースです。
            </p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew19.md" target="_blank">Kotlin 1.9.0の新機能</a></li>
                <li><a href="https://www.youtube.com/embed/fvwTZc-dxsM" target="_blank">Kotlinの新機能 YouTube動画</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.22</strong>
            <p>リリース日: <strong>2023年6月8日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.22" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 のバグ修正リリースです。</p>
            <p>Kotlin 1.8.20の詳細については、<a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>リリース日: <strong>2023年4月25日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 のバグ修正リリースです。</p>
            <p>Kotlin 1.8.20の詳細については、<a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20の新機能</a>を参照してください。</p>
            <note>Android Studio Flamingo および Giraffe 用の Kotlin プラグイン 1.8.21 は、今後の Android Studio のアップデートで提供される予定です。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>リリース日: <strong>2023年4月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin K2コンパイラのアップデート、AutoCloseableインターフェース、標準ライブラリでのBase64エンコーディング、デフォルトで有効になった新しいJVMインクリメンタルコンパイル、新しいKotlin/Wasmコンパイラバックエンドを含む機能リリースです。
            </p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20の新機能</a></li>
                <li><a href="https://youtu.be/R1JpkpPzyBU" target="_blank">Kotlinの新機能 YouTube動画</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.10</strong>
            <p>リリース日: <strong>2023年2月2日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.0 のバグ修正リリースです。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a>についての詳細。</p>
            <note>Android Studio Electric Eel および Flamingo 用の Kotlin プラグイン 1.8.10 は、今後の Android Studio のアップデートで提供される予定です。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>リリース日: <strong>2022年12月28日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>kotlin-reflectのパフォーマンス向上、JVM向けのディレクトリ内容の再帰的コピーまたは削除を行う新しい実験的関数、Objective-C/Swift相互運用性の改善を含む機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew18.md" target="_blank">Kotlin 1.8.0の新機能</a></li>
                <li><a href="compatibility-guide-18.md" target="_blank">Kotlin 1.8.0 互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.21</strong>
            <p>リリース日: <strong>2022年11月9日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.20 のバグ修正リリースです。</p>
            <p>Kotlin 1.7.20の詳細については、<a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20の新機能</a>を参照してください。</p>
            <note>Android Studio Dolphin、Electric Eel、および Flamingo 用の Kotlin プラグイン 1.7.21 は、今後の Android Studio のアップデートで提供される予定です。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>リリース日: <strong>2022年9月29日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、Kotlin K2コンパイラにおける複数のコンパイラプラグインのサポート、デフォルトで有効になった新しいKotlin/Nativeメモリマネージャ、およびGradle 7.1のサポートを含むインクリメンタルリリースです。
            </p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20の新機能</a></li>
                <li><a href="https://youtu.be/OG9npowJgE8" target="_blank">Kotlinの新機能 YouTube動画</a></li>
                <li><a href="compatibility-guide-1720.md" target="_blank">Kotlin 1.7.20 互換性ガイド</a></li>
            </list>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">Kotlin 1.7.20</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.10</strong>
            <p>リリース日: <strong>2022年7月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.0 のバグ修正リリースです。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a>についての詳細。</p>
            <note>Android Studio Dolphin (213) および Android Studio Electric Eel (221) 用の Kotlin プラグイン 1.7.10 は、今後の Android Studio のアップデートで提供される予定です。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>リリース日: <strong>2022年6月9日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>JVM向けのアルファ版Kotlin K2コンパイラ、安定化した言語機能、パフォーマンスの向上、および実験的APIの安定化といった進化的変更を含む機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="whatsnew17.md" target="_blank">Kotlin 1.7.0の新機能</a></li>
                <li><a href="https://youtu.be/54WEfLKtCGk" target="_blank">Kotlinの新機能 YouTube動画</a></li>
                <li><a href="compatibility-guide-17.md" target="_blank">Kotlin 1.7.0 互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.21</strong>
            <p>リリース日: <strong>2022年4月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.20 のバグ修正リリースです。</p>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>リリース日: <strong>2022年4月4日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>以下のような様々な改善を含むインクリメンタルリリースです：</p>
            <list>
                <li>コンテキストレシーバー（Context receivers）のプロトタイプ</li>
                <li>関数型インターフェースのコンストラクタへの呼び出し可能参照（Callable references）</li>
                <li>Kotlin/Native: 新しいメモリマネージャのパフォーマンス向上</li>
                <li>Multiplatform: デフォルトでの階層的プロジェクト構造</li>
                <li>Kotlin/JS: IRコンパイラの改善</li>
                <li>Gradle: コンパイラ実行戦略</li>
            </list>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.10</strong>
            <p>リリース日: <strong>2021年12月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.0 のバグ修正リリースです。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>リリース日: <strong>2021年11月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、パフォーマンスの向上、および実験的APIの安定化といった進化的変更を含む機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew16.md" target="_blank">Kotlin 1.6.0の新機能</a></li>
                <li><a href="compatibility-guide-16.md" target="_blank">互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.32</strong>
            <p>リリース日: <strong>2021年11月29日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.32" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.31 のバグ修正リリースです。</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>リリース日: <strong>2021年9月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.30 のバグ修正リリースです。</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>リリース日: <strong>2021年8月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>以下のような様々な改善を含むインクリメンタルリリースです：</p>
            <list>
                <li>JVMでのアノテーションクラスのインスタンス化</li>
                <li>オプトイン要求メカニズムと型推論の改善</li>
                <li>ベータ版のKotlin/JS IRバックエンド</li>
                <li>Apple Siliconターゲットのサポート</li>
                <li>CocoaPodsサポートの改善</li>
                <li>Gradle: Javaツールチェーンのサポートとデーモン設定の改善</li>
            </list>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/08/kotlin-1-5-30-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.21</strong>
            <p>リリース日: <strong>2021年7月13日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.20 のバグ修正リリースです。</p>
            <p><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>リリース日: <strong>2021年6月24日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>以下のような様々な改善を含むインクリメンタルリリースです：</p>
            <list>
                <li>JVMでのデフォルトでの <code>invokedynamic</code> による文字列結合</li>
                <li>Lombokのサポート改善とJSpecifyのサポート</li>
                <li>Kotlin/Native: Objective-CヘッダーへのKDocエクスポート、および単一配列内での <code>Array.copyInto()</code> の高速化</li>
                <li>Gradle: アノテーションプロセッサのクラスローダーのキャッシングと Gradle の <code>--parallel</code> プロパティのサポート</li>
                <li>プラットフォーム間での標準ライブラリ関数の動作の統一</li>
            </list>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.10</strong>
            <p>リリース日: <strong>2021年5月24日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.0 のバグ修正リリースです。</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>リリース日: <strong>2021年5月5日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、パフォーマンスの向上、および実験的APIの安定化といった進化的変更を含む機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew15.md" target="_blank">Kotlin 1.5.0の新機能</a></li>
                <li><a href="compatibility-guide-15.md" target="_blank">互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.32</strong>
            <p>リリース日: <strong>2021年3月22日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.32" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 のバグ修正リリースです。</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>リリース日: <strong>2021年2月25日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 のバグ修正リリースです。</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>リリース日: <strong>2021年2月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>以下のような様々な改善を含むインクリメンタルリリースです：</p>
            <list>
                <li>ベータ版となった新しいJVMバックエンド</li>
                <li>新しい言語機能のプレビュー</li>
                <li>Kotlin/Nativeのパフォーマンス向上</li>
                <li>標準ライブラリAPIの改善</li>
            </list>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.21</strong>
            <p>リリース日: <strong>2020年12月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.21" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.20 のバグ修正リリースです。</p>
            <p><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a>についての詳細。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>リリース日: <strong>2020年11月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>以下のような様々な改善を含むインクリメンタルリリースです：</p>
            <list>
                <li><code>invokedynamic</code> による文字列結合など、新しいJVM機能のサポート</li>
                <li>Kotlin Multiplatform Mobileプロジェクトのパフォーマンスと例外処理の改善</li>
                <li>JDK Pathの拡張: <code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.10</strong>
            <p>リリース日: <strong>2020年9月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.10" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.0 のバグ修正リリースです。</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a>についての詳細。</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p> リリース日: <strong>2020年8月17日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>品質とパフォーマンスに重点を置いた、多くの機能と改善を含む機能リリースです。</p>
            <p>詳細はこちら：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">リリースのブログ記事</a></li>
                <li><a href="whatsnew14.md" target="_blank">Kotlin 1.4.0の新機能</a></li>
                <li><a href="compatibility-guide-14.md" target="_blank">互換性ガイド</a></li>
                <li><a href="whatsnew14.md#migrating-to-kotlin-1-4-0" target="_blank">Kotlin 1.4.0 への移行</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.3.72</strong>
            <p> リリース日: <strong>2020年4月15日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">GitHubでのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.3.70 のバグ修正リリースです。</p>
            <p>詳細は<a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a>についての記事を参照してください。</p>
        </td>
    </tr>
</table>