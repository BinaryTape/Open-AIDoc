[//]: # (title: Kotlin のリリースプロセス)

<web-summary>Kotlin リリースの種類、各バージョンへのアップデート方法、および Kotlin のリリース履歴について説明します。</web-summary>

<tldr>
    <p>最新の Kotlin バージョン: <strong>%kotlinVersion%</strong></p>
    <p><a href="%kotlinLatestWhatsnew%">Kotlin 2.4.20 の新機能</a>を参照してください。バグ修正の詳細については<a href="%kotlinLatestUrl%">変更履歴（changelog）</a>で確認できます。</p>
</tldr>

このページでは、Kotlin のリリースサイクルと提供されるさまざまなリリースの種類について説明します。また、過去および今後の Kotlin リリースに関する詳細と、特定のリリースへアップデートする手順も記載しています。

Kotlin 2.0.0 以降、以下の種類のリリースポリシーを導入しています。

* _言語リリース（Language releases）_ (2._x_._0_): 言語にメジャーな変更をもたらし、ツールのアップデートを含みます。6か月に1回リリースされます。
* _ツーリングリリース（Tooling releases）_ (2._x_._20_): 言語リリースの間にリリースされ、ツールのアップデート、パフォーマンスの改善、バグ修正を含みます。対応する_言語リリース_の3か月後にリリースされます。
* _バグ修正リリース（Bug fix releases）_ (2._x_._yz_): _ツーリングリリース_に対するバグ修正を含みます。これらのリリースには厳密なスケジュールはありません。

> 例えば、言語リリース 2.2.0 に対するツーリングリリースは 2.2.20 の1回のみで、バグ修正リリースは 2.2.21 の1回のみでした。
>
{style="tip"}

各言語リリースおよびツーリングリリースに対しては、新機能が正式リリースされる前にお試しいただけるプレビュー（_EAP_）バージョンも複数提供されます。詳細については、[Kotlin Early Access Preview（EAP）への参加](eap.md)を参照してください。

> 新しい Kotlin リリースの通知を受け取りたい場合は、[Kotlin ニュースレター](https://lp.jetbrains.com/subscribe-to-kotlin-news/)に登録するか、[X の Kotlin アカウント](https://x.com/kotlin)をフォローするか、または [Kotlin GitHub リポジトリ](https://github.com/JetBrains/kotlin)で **Watch | Custom | Releases** オプションを有効にしてください。
> 
{style="note"}

## 今後の Kotlin リリース {id="upcoming-kotlin-releases"}

今後の安定版（Stable）Kotlin リリースの概ねの予定は以下のとおりです。

* **2.5.0**: 2026年12月予定
* **2.5.20**: 2027年3月予定

## 新しい Kotlin バージョンへのアップデート {id="update-to-a-new-kotlin-version"}

プロジェクトを新しいリリースにアップグレードするには、ビルドシステム内の Kotlin バージョンを更新します。

### Gradle {id="gradle"}

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

以前の Kotlin バージョンで作成されたプロジェクトがある場合は、[kotlinx ライブラリのバージョンも更新](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)する必要があるかどうかを確認してください。

新しい言語リリースに移行する場合、Kotlin プラグインのマイグレーションツールが移行プロセスを支援します。

> プロジェクトで Gradle を使用する方法について詳しくは、[Gradle プロジェクトの設定](gradle-configure-project.md)を参照してください。
> 
{style="tip"}

### Maven {id="maven"}

Kotlin %kotlinVersion% にアップデートするには、`pom.xml` ファイル内のバージョンを変更します。

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

以前の Kotlin バージョンで作成されたプロジェクトがある場合は、[kotlinx ライブラリのバージョンも更新](maven-set-dependencies.md#dependency-on-a-kotlinx-library)する必要があるかどうかを確認してください。

> プロジェクトで Maven を使用する方法について詳しくは、[Maven](maven.md) を参照してください。
>
{style="tip"}

## IDE サポート {id="ide-support"}

Kotlin は [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/kotlin/get-started) で最初から完全にサポートされています。

## 標準ライブラリのセキュリティサポート {id="standard-library-security-support"}

Kotlin 2.4.0 以降、JVM 向けの Kotlin 標準ライブラリには、各リリースラインに対して18か月のサポート期間が設けられています。
言語リリース (2._x_._0_) とそれに続くツーリングリリース (2._x_._20_) は、同じリリースライン (2._x_) に属します。

JVM 向けの Kotlin 標準ライブラリに影響を与えるセキュリティ脆弱性が発見された場合、以下を同時にリリースします。

* そのリリースラインの最新 Kotlin リリースをベースとした、セキュリティ修正を含むバグ修正リリース。
* アクティブなサポート期間内にあるすべてのリリースライン向けのバグ修正リリース。

例えば、セキュリティ脆弱性が発見された時点で最新の Kotlin リリースが Kotlin 2.4.20 である場合、Kotlin 2.4.20 のみのバグ修正バージョンをリリースします。Kotlin 2.4.0 に対するバグ修正バージョンはリリースされません。

以下の表に、すべての Kotlin リリースラインとそのサポート期間を示します。

<table>
    <tr>
        <th>Kotlin リリースライン</th>
        <th>リリース日</th>
        <th>サポート終了</th>
        <th>最新リリース</th>
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
            <p>2.4.21</p>
        </td>
    </tr>
</table>

> セキュリティに関する問題を発見した場合は、ぜひご報告ください。Kotlin で発見した問題を報告するには、[課題トラッカー](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem)に直接投稿するか、[メール](mailto:security@jetbrains.org)でお問い合わせください。
> 
{style="tip"}

## リリース履歴 {id="release-history"}

以下の表に、過去の Kotlin リリースの詳細を示します。

> [Kotlin の Early Access Preview（EAP）バージョン](eap.md#build-details)を試すこともできます。
> 
{style="tip"}

<table>
    <tr>
        <th>ビルド情報</th>
        <th>ビルドのハイライト</th>
    </tr>
    <tr>
        <td><strong>2.4.21</strong>
            <p>リリース日: <strong>2026年10月8日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.21 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.20</strong>
            <p>リリース日: <strong>2026年9月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新しい実験的機能や安定版機能、パフォーマンスの改善、バグ修正、およびツールのアップデートを含むツーリングリリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>リリース日: <strong>2026年7月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.0 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>リリース日: <strong>2026年6月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新規および安定版の言語機能、ツールのアップデート、さまざまなプラットフォーム向けのパフォーマンス改善、重要な修正を含む言語リリース。</p>
            <p>Kotlin 2.4.0 の詳細については、<a href="whatsnew24.md" target="_blank">Kotlin 2.4.0 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>リリース日: <strong>2026年4月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.20 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>リリース日: <strong>2026年3月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>パフォーマンスの改善、バグ修正、およびツールのアップデートを含むツーリングリリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>リリース日: <strong>2026年2月5日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>パフォーマンスの改善と、稀に発生する <a href="https://youtrack.jetbrains.com/issue/KT-83984"><code>kotlinx.serialization</code> での競合状態</a> に対する重要な修正を含む、Kotlin 2.3.0 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>リリース日: <strong>2025年12月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新規および安定版の言語機能、ツールのアップデート、さまざまなプラットフォーム向けのパフォーマンス改善、重要な修正を含む言語リリース。</p>
            <p>Kotlin 2.3.0 の詳細については、<a href="whatsnew23.md" target="_blank">Kotlin 2.3.0 の新機能</a>を参照してください。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>リリース日: <strong>2025年10月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Xcode 26 のサポート、ならびにその他の改善およびバグ修正を含むバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">変更履歴</a>を参照してください。</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>リリース日: <strong>2025年9月10日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Web 開発に関する重要な変更やその他の改善を含む、Kotlin 2.2.0 のツーリングリリース。</p>
            <p>Kotlin 2.2.20 の詳細については、<a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>リリース日: <strong>2025年8月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>リリース日: <strong>2025年6月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新規および安定版の言語機能、ツールのアップデート、さまざまなプラットフォーム向けのパフォーマンス改善、重要な修正を含む言語リリース。</p>
            <p>Kotlin 2.2.0 の詳細については、<a href="whatsnew22.md" target="_blank">Kotlin 2.2.0 の新機能</a>を参照してください。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>リリース日: <strong>2025年5月13日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.20 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>リリース日: <strong>2025年3月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
           <p>新しい実験的機能、パフォーマンスの改善、バグ修正を含む、Kotlin 2.1.0 のツーリングリリース。</p>
            <p>Kotlin 2.1.20 の詳細については、<a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>リリース日: <strong>2025年1月27日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.0 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>リリース日: <strong>2024年11月27日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能を導入した言語リリース。</p>
            <p>Kotlin 2.1.0 の詳細については、<a href="whatsnew21.md" target="_blank">Kotlin 2.1.0 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>リリース日: <strong>2024年10月10日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.20 のバグ修正リリース。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>リリース日: <strong>2024年8月22日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
           <p>パフォーマンスの改善とバグ修正を含む、Kotlin 2.0.0 のツーリングリリース。機能面では、Kotlin/Native のガベージコレクタにおける並行マーキング（concurrent marking）、Kotlin 共通標準ライブラリでの UUID サポート、Compose コンパイラのアップデート、最大 Gradle 8.8 のサポートも含まれます。
            </p>
            <p>Kotlin 2.0.20 の詳細については、<a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>リリース日: <strong>2024年8月6日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.0 のバグ修正リリース。</p>
            <p>Kotlin 2.0.0 の詳細については、<a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>リリース日: <strong>2024年5月21日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>安定版（Stable）の Kotlin K2 コンパイラを導入した言語リリース。</p>
            <p>Kotlin 2.0.0 の詳細については、<a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>リリース日: <strong>2024年7月19日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.25" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、1.9.23、および 1.9.24 のバグ修正リリース。</p>
            <p>Kotlin 1.9.20 の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>リリース日: <strong>2024年5月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、および 1.9.23 のバグ修正リリース。</p>
            <p>Kotlin 1.9.20 の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>リリース日: <strong>2024年3月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、および 1.9.22 のバグ修正リリース。</p>
            <p>Kotlin 1.9.20 の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>リリース日: <strong>2023年12月21日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 および 1.9.21 のバグ修正リリース。</p>
            <p>Kotlin 1.9.20 の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>リリース日: <strong>2023年11月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 のバグ修正リリース。</p>
            <p>Kotlin 1.9.20 の詳細については、<a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>リリース日: <strong>2023年11月1日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>ベータ版の Kotlin K2 コンパイラと、安定版の Kotlin Multiplatform を導入した機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.10</strong>
            <p>リリース日: <strong>2023年8月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.0 のバグ修正リリース。</p>
            <p>Kotlin 1.9.0 の詳細については、<a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 の新機能</a>を参照してください。</p>
            <note>Android Studio Giraffe および Hedgehog では、今後の Android Studio アップデートに伴って Kotlin プラグイン 1.9.10 が提供されます。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>リリース日: <strong>2023年7月6日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin K2 コンパイラのアップデート、enum クラスの新しい values 関数、開区間レンジ（open-ended ranges）用の新しい演算子、Kotlin Multiplatform における Gradle 構成キャッシュ（configuration cache）のプレビュー、Kotlin Multiplatform における Android ターゲットサポートの変更、Kotlin/Native におけるカスタムメモリアロケータのプレビューを含む機能リリース。
            </p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 の新機能</a></li>
                <li><a href="https://www.youtube.com/embed/fvwTZc-dxsM" target="_blank">Kotlin の新機能に関する YouTube 動画</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.22</strong>
            <p>リリース日: <strong>2023年6月8日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.22" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 のバグ修正リリース。</p>
            <p>Kotlin 1.8.20 の詳細については、<a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>リリース日: <strong>2023年4月25日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 のバグ修正リリース。</p>
            <p>Kotlin 1.8.20 の詳細については、<a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 の新機能</a>を参照してください。</p>
            <note>Android Studio Flamingo および Giraffe では、今後の Android Studio アップデートに伴って Kotlin プラグイン 1.8.21 が提供されます。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>リリース日: <strong>2023年4月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin K2 コンパイラのアップデート、標準ライブラリにおける AutoCloseable インターフェースおよび Base64 エンコーディング、デフォルトで有効化された新しい JVM インクリメンタルコンパイル、新しい Kotlin/Wasm コンパイラバックエンドを含む機能リリース。
            </p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 の新機能</a></li>
                <li><a href="https://youtu.be/R1JpkpPzyBU" target="_blank">Kotlin の新機能に関する YouTube 動画</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.10</strong>
            <p>リリース日: <strong>2023年2月2日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.0 のバグ修正リリース。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a> の詳細を参照してください。</p>
            <note>Android Studio Electric Eel および Flamingo では、今後の Android Studio アップデートに伴って Kotlin プラグイン 1.8.10 が提供されます。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>リリース日: <strong>2022年12月28日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>kotlin-reflect のパフォーマンス改善、JVM 向けのディレクトリ内容を再帰的にコピーまたは削除する新しい実験的関数、Objective-C/Swift 相互運用の改善を含む機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew18.md" target="_blank">Kotlin 1.8.0 の新機能</a></li>
                <li><a href="compatibility-guide-18.md" target="_blank">Kotlin 1.8.0 の互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.21</strong>
            <p>リリース日: <strong>2022年11月9日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.20 のバグ修正リリース。</p>
            <p>Kotlin 1.7.20 の詳細については、<a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 の新機能</a>を参照してください。</p>
            <note>Android Studio Dolphin、Electric Eel、および Flamingo では、今後の Android Studio アップデートに伴って Kotlin プラグイン 1.7.21 が提供されます。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>リリース日: <strong>2022年9月29日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、Kotlin K2 コンパイラにおける複数のコンパイラプラグインのサポート、デフォルトで有効化された新しい Kotlin/Native メモリマネージャー、Gradle 7.1 のサポートを含むインクリメンタルリリース。
            </p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 の新機能</a></li>
                <li><a href="https://youtu.be/OG9npowJgE8" target="_blank">Kotlin の新機能に関する YouTube 動画</a></li>
                <li><a href="compatibility-guide-1720.md" target="_blank">Kotlin 1.7.20 の互換性ガイド</a></li>
            </list>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">Kotlin 1.7.20</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.10</strong>
            <p>リリース日: <strong>2022年7月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.0 のバグ修正リリース。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a> の詳細を参照してください。</p>
            <note>Android Studio Dolphin (213) および Android Studio Electric Eel (221) では、今後の Android Studio アップデートに伴って Kotlin プラグイン 1.7.10 が提供されます。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>リリース日: <strong>2022年6月9日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>JVM 向けアルファ版 Kotlin K2 コンパイラ、安定化された言語機能、パフォーマンスの改善、実験的 API の安定化などの漸進的な変更を含む機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="whatsnew17.md" target="_blank">Kotlin 1.7.0 の新機能</a></li>
                <li><a href="https://youtu.be/54WEfLKtCGk" target="_blank">Kotlin の新機能に関する YouTube 動画</a></li>
                <li><a href="compatibility-guide-17.md" target="_blank">Kotlin 1.7.0 の互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.21</strong>
            <p>リリース日: <strong>2022年4月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.20 のバグ修正リリース。</p>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>リリース日: <strong>2022年4月4日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>以下のようなさまざまな改善を含むインクリメンタルリリース:</p>
            <list>
                <li>コンテキストレシーバー（context receivers）のプロトタイプ</li>
                <li>関数型インターフェースのコンストラクタへの呼び出し可能参照（callable references）</li>
                <li>Kotlin/Native: 新しいメモリマネージャーのパフォーマンス改善</li>
                <li>Multiplatform: デフォルトでの階層的プロジェクト構造</li>
                <li>Kotlin/JS: IR コンパイラの改善</li>
                <li>Gradle: コンパイラ実行戦略</li>
            </list>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.10</strong>
            <p>リリース日: <strong>2021年12月14日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.0 のバグ修正リリース。</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>リリース日: <strong>2021年11月16日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、パフォーマンスの改善、実験的 API の安定化などの漸進的な変更を含む機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew16.md" target="_blank">Kotlin 1.6.0 の新機能</a></li>
                <li><a href="compatibility-guide-16.md" target="_blank">互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.32</strong>
            <p>リリース日: <strong>2021年11月29日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.32" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.31 のバグ修正リリース。</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>リリース日: <strong>2021年9月20日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.30 のバグ修正リリース。</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>リリース日: <strong>2021年8月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>以下のようなさまざまな改善を含むインクリメンタルリリース:</p>
            <list>
                <li>JVM 上でのアノテーションクラスのインスタンス化</li>
                <li>オプトイン要求メカニズムおよび型推論の改善</li>
                <li>ベータ版の Kotlin/JS IR バックエンド</li>
                <li>Apple Silicon ターゲットのサポート</li>
                <li>CocoaPods サポートの改善</li>
                <li>Gradle: Java ツールチェーンのサポートおよびデーモン設定の改善</li>
            </list>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/08/kotlin-1-5-30-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30 の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.21</strong>
            <p>リリース日: <strong>2021年7月13日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.20 のバグ修正リリース。</p>
            <p><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>リリース日: <strong>2021年6月24日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>以下のようなさまざまな改善を含むインクリメンタルリリース:</p>
            <list>
                <li>JVM 上でデフォルトとなった <code>invokedynamic</code> による文字列連結</li>
                <li>Lombok サポートの改善および JSpecify のサポート</li>
                <li>Kotlin/Native: Objective-C ヘッダーへの KDoc エクスポートおよび同一配列内での高速な <code>Array.copyInto()</code></li>
                <li>Gradle: アノテーションプロセッサのクラスローダーのキャッシュおよび <code>--parallel</code> Gradle プロパティのサポート</li>
                <li>各プラットフォーム間での標準ライブラリ関数の動作の統一</li>
            </list>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20 の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.10</strong>
            <p>リリース日: <strong>2021年5月24日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.0 のバグ修正リリース。</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>リリース日: <strong>2021年5月5日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>新しい言語機能、パフォーマンスの改善、実験的 API の安定化などの漸進的な変更を含む機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew15.md" target="_blank">Kotlin 1.5.0 の新機能</a></li>
                <li><a href="compatibility-guide-15.md" target="_blank">互換性ガイド</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.32</strong>
            <p>リリース日: <strong>2021年3月22日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.32" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 のバグ修正リリース。</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>リリース日: <strong>2021年2月25日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 のバグ修正リリース。</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>リリース日: <strong>2021年2月3日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>以下のようなさまざまな改善を含むインクリメンタルリリース:</p>
            <list>
                <li>新しい JVM バックエンド（ベータ版）</li>
                <li>新しい言語機能のプレビュー</li>
                <li>Kotlin/Native のパフォーマンス改善</li>
                <li>標準ライブラリ API の改善</li>
            </list>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30 の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.21</strong>
            <p>リリース日: <strong>2020年12月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.21" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.20 のバグ修正リリース。</p>
            <p><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a> の詳細を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>リリース日: <strong>2020年11月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>以下のようなさまざまな改善を含むインクリメンタルリリース:</p>
            <list>
                <li><code>invokedynamic</code> による文字列連結などの新しい JVM 機能のサポート</li>
                <li>Kotlin Multiplatform Mobile プロジェクトのパフォーマンスと例外処理の改善</li>
                <li>JDK Path 向けの拡張: <code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20 の新機能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.10</strong>
            <p>リリース日: <strong>2020年9月7日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.10" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.0 のバグ修正リリース。</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a> の詳細を参照してください。</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p> リリース日: <strong>2020年8月17日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>主に品質とパフォーマンスに焦点を当てた、多数の機能と改善を含む機能リリース。</p>
            <p>詳細はこちらを参照してください:</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">リリースのブログ投稿</a></li>
                <li><a href="whatsnew14.md" target="_blank">Kotlin 1.4.0 の新機能</a></li>
                <li><a href="compatibility-guide-14.md" target="_blank">互換性ガイド</a></li>
                <li><a href="whatsnew14.md#migrating-to-kotlin-1-4-0" target="_blank">Kotlin 1.4.0 への移行</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.3.72</strong>
            <p> リリース日: <strong>2020年4月15日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">GitHub のリリース</a></p>
        </td>
        <td>
            <p>Kotlin 1.3.70 のバグ修正リリース。</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a> の詳細を参照してください。</p>
        </td>
    </tr>
</table>