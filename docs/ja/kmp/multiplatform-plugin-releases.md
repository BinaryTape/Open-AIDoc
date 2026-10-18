[//]: # (title: Kotlin Multiplatform IDE プラグインのリリース)

[Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) は、Android、iOS、デスクトップ、および Web 向けのクロスプラットフォームアプリケーションの開発を支援します。
Kotlin Multiplatform プロジェクトを扱う際は、プラグインが最新バージョンであることを確認してください。

このプラグインは IntelliJ IDEA および Android Studio と互換性があります。
* IntelliJ IDEA では、macOS はバージョン 2025.1.1.1 以降、Windows および Linux はバージョン 2025.2.2 以降でプラグインをサポートしています。
* Android Studio では、macOS は Narwhal 2025.1.1 以降、Windows および Linux は Otter 2025.2.1 以降でプラグインをサポートしています。

Kotlin Multiplatform Gradle プラグインの詳細については、その [DSL リファレンス](multiplatform-dsl-reference.md) および [互換性ガイド](multiplatform-compatibility-guide.md) を参照してください。

## 最新リリースへのアップデート {id="update-to-the-latest-release"}

IDE は、新しい Kotlin Multiplatform プラグインのリリースが利用可能になると、すぐにアップデートを提案します。
その提案を承認すると、プラグインが最新バージョンにアップデートされます。
プラグインのバージョン確認および手動でのアップデートは、**Settings | Plugins** で行えます。

Kotlin Multiplatform IDE プラグインは IntelliJ IDEA および Android Studio の各リリースに合わせてアップデートされ、メジャーバージョンは対応する IDE バージョンと同期されます。

以下は、ツーリングが安定化する前に公開されたメジャーリリースの詳細です。

## 過去のリリース詳細 {collapsible="true" id="previous-release-details"}

以下の表は、Kotlin Multiplatform IDE プラグインのリリース一覧です。

<table> 

<tr>
<th>
リリース情報
</th>
<th>
リリースのハイライト
</th>
<th>
互換性のある Kotlin バージョン
</th>
</tr>

<tr id="0.9">
<td>

**0.9**

リリース日: 2025年5月19日

</td>
<td>

Kotlin Multiplatform プラグインをゼロから再構築しました。

* サポートされている IDE 向けに統合された **New Project** ウィザード。
* Java、Android、Xcode、Gradle を含む環境設定の問題を発見・解決するのに役立つ事前環境チェック（Preflight checks）。
* サポートされているすべてのプラットフォーム向けに自動生成される実行構成（iOS および Android 向けのデバイスセレクター付き）。
* 言語間サポート: Swift と Kotlin のクロス言語ナビゲーションおよびデバッグ、ならびに Swift のシンタックスハイライトとクイックドキュメント。
* Compose Multiplatform サポート: Kotlin Multiplatform IDE プラグインで Compose Multiplatform リソース、自動補完、共通コード向けの UI プレビューをサポート（[以前の Compose Multiplatform プラグイン](https://plugins.jetbrains.com/plugin/16541-compose-multiplatform-ide-support) は安全にアンインストールできます）。
* Compose Hot Reload: アプリを再起動することなく UI の変更を即座に確認可能（デスクトップ JVM ターゲットを使用）。詳細は [Hot Reload ドキュメント](compose-hot-reload.md) を参照してください。

既知の問題:

* Android Studio において、現在 Compose デバッガーが Kotlin 2.1.20 および 2.1.21 で動作しません。この問題は Kotlin 2.2.0-RC2 で修正される予定です。

</td>
<td>

プラグインは [いずれの Kotlin バージョン](https://kotlinlang.org/docs/releases.html#release-details) でも動作しますが、その機能の大部分は Kotlin 2.1.21 に依存しています。
最高の体験を得るには、最新の安定版 Kotlin バージョンへのアップデートを推奨します。

また、このバージョンでは K2 モードが必要となるため、必ず有効にしてください。
**Settings** | **Languages & Frameworks** | **Kotlin** で、**Enable K2 mode** にチェックを入れます。

</td>
</tr>

<tr>
<td>

**0.8.4**

リリース日: 2024年12月6日

</td>
<td>

* 安定性とコード解析を向上させる Kotlin の [K2 モード](https://kotlinlang.org/docs/k2-compiler-migration-guide.html#support-in-ides) をサポート。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.3**

リリース日: 2024年7月23日

</td>
<td>

* Xcode の互換性問題の修正。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.2**

リリース日: 2024年5月16日

</td>
<td>

* Android Studio Jellyfish および新しい Canary バージョンの Koala をサポート。
* 共有モジュールに `sourceCompatibility` および `targetCompatibility` の宣言を追加。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.1**

リリース日: 2023年11月9日

</td>
<td>

* Kotlin を 1.9.20 にアップデート。
* Jetpack Compose を 1.5.4 にアップデート。
* Gradle のビルドキャッシュおよびコンフィグレーションキャッシュをデフォルトで有効化。
* 新しい Kotlin バージョン向けにビルド構成をリファクタリング。
* iOS フレームワークがデフォルトで静的（static）になりました。
* Xcode 15 を使用した iOS デバイスでの実行に関する問題を修正。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.0**

リリース日: 2023年10月5日

</td>
<td>

* [KT-60169](https://youtrack.jetbrains.com/issue/KT-60169) Gradle バージョンカタログへ移行。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) `android` を `androidTarget` にリネーム。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) Kotlin および依存関係のバージョンをアップデート。
* [KTIJ-26773](https://youtrack.jetbrains.com/issue/KTIJ-26773) `-sdk` および `-arch` の代わりに `-destination` 引数を使用するようリファクタリング。
* [KTIJ-25839](https://youtrack.jetbrains.com/issue/KTIJ-25839) 生成されるファイル名のリファクタリング。
* [KTIJ-27058](https://youtrack.jetbrains.com/issue/KTIJ-27058) JVM ターゲット構成を追加。
* [KTIJ-27160](https://youtrack.jetbrains.com/issue/KTIJ-27160) Xcode 15.0 をサポート。
* [KTIJ-27158](https://youtrack.jetbrains.com/issue/KTIJ-27158) 新規モジュールウィザードを実験的（experimental）状態に移行。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.6.0**

リリース日: 2023年5月24日

</td>
<td>

* 新しい Canary の Android Studio Hedgehog をサポート。
* Multiplatform プロジェクト内の Kotlin、Gradle、およびライブラリのバージョンをアップデート。
* Multiplatform プロジェクトに新しい [`targetHierarchy.default()`](https://kotlinlang.org/docs/whatsnew1820.html#new-approach-to-source-set-hierarchy) を適用。
* Multiplatform プロジェクトで、プラットフォーム固有のファイルにソースセット名のサフィックスを適用。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.3**

リリース日: 2023年4月12日

</td>
<td>

* Kotlin および Compose のバージョンをアップデート。
* Xcode プロジェクトスキームの解析を修正。
* スキームのプロダクトタイプチェックを追加。
* `iosApp` スキームが存在する場合、デフォルトで選択されるようになりました。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.2**

リリース日: 2023年1月30日

</td>
<td>

* [Kotlin/Native デバッガーの問題（Spotlight のインデックス作成が遅い）を修正](https://youtrack.jetbrains.com/issue/KT-55988)。
* [マルチモジュールプロジェクトにおける Kotlin/Native デバッガーを修正](https://youtrack.jetbrains.com/issue/KT-24450)。
* [Android Studio Giraffe 2022.3.1 Canary 向けの新規ビルド](https://youtrack.jetbrains.com/issue/KT-55274)。
* [iOS アプリビルド用のプロビジョニングフラグを追加](https://youtrack.jetbrains.com/issue/KT-55204)。
* [生成された iOS プロジェクトの **Framework Search Paths** オプションに継承パスを追加](https://youtrack.jetbrains.com/issue/KT-55402)。

</td>
<td>

[いずれかの Kotlin プラグインバージョン](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.1**

リリース日: 2022年11月30日

</td>
<td>

* [新規プロジェクト生成の修正: 不要な "app" ディレクトリを削除](https://youtrack.jetbrains.com/issue/KTIJ-23790)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.0**

リリース日: 2022年11月22日

</td>
<td>

* [iOS フレームワークの配布に関するデフォルトオプションを変更: **Regular framework** に変更](https://youtrack.jetbrains.com/issue/KT-54086)。
* [生成された Android プロジェクトで `MyApplicationTheme` を別ファイルに移動](https://youtrack.jetbrains.com/issue/KT-53991)。
* [生成される Android プロジェクトを更新](https://youtrack.jetbrains.com/issue/KT-54658)。
* [新規プロジェクトディレクトリが予期せず消去される問題を修正](https://youtrack.jetbrains.com/issue/KTIJ-23707)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.4**

リリース日: 2022年9月12日

</td>
<td>

* [Android アプリを Jetpack Compose に移行](https://youtrack.jetbrains.com/issue/KT-53162)。
* [時代遅れになった HMPP フラグを削除](https://youtrack.jetbrains.com/issue/KT-52248)。
* [Android マニフェストからパッケージ名を削除](https://youtrack.jetbrains.com/issue/KTIJ-22633)。
* [Xcode プロジェクト用の `.gitignore` を更新](https://youtrack.jetbrains.com/issue/KT-53703)。
* [expect/actual の説明をよりわかりやすくするためにウィザードプロジェクトを更新](https://youtrack.jetbrains.com/issue/KT-53928)。
* [Android Studio の Canary ビルドとの互換性を更新](https://youtrack.jetbrains.com/issue/KTIJ-22063)。
* [Android アプリの最小 Android SDK を 21 に更新](https://youtrack.jetbrains.com/issue/KTIJ-22505)。
* [Xcode インストール後の初回起動時の問題を修正](https://youtrack.jetbrains.com/issue/KTIJ-22645)。
* [M1 上での Apple 実行構成に関する問題を修正](https://youtrack.jetbrains.com/issue/KTIJ-21781)。
* [Windows OS での `local.properties` に関する問題を修正](https://youtrack.jetbrains.com/issue/KTIJ-22037)。
* [Android Studio の Canary ビルドにおける Kotlin/Native デバッガーの問題を修正](https://youtrack.jetbrains.com/issue/KT-53976)。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.3**

リリース日: 2022年6月9日

</td>
<td>

* Kotlin IDE プラグイン 1.7.0 への依存関係を更新。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.2**

リリース日: 2022年4月4日

</td>
<td>

* Android Studio 2021.2 および 2021.3 での iOS アプリケーションのデバッグにおけるパフォーマンス問題を修正。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.1**

リリース日: 2022年2月15日

</td>
<td>

* [Kotlin Multiplatform Mobile ウィザードで M1 iOS シミュレーターを有効化](https://youtrack.jetbrains.com/issue/KT-51105)。
* XcProjects のインデックス作成パフォーマンスを向上: [KT-49777](https://youtrack.jetbrains.com/issue/KT-49777)、[KT-50779](https://youtrack.jetbrains.com/issue/KT-50779)。
* ビルドスクリプトの整理: `kotlin("test-common")` および `kotlin("test-annotations-common")` の代わりに `kotlin("test")` を使用。
* [Kotlin プラグインバージョン](https://youtrack.jetbrains.com/issue/KTIJ-20167) との互換性範囲を拡大。
* [Windows ホストでの JVM デバッグの問題を修正](https://youtrack.jetbrains.com/issue/KT-50699)。
* [プラグイン無効化後にバージョンが無効になる問題を修正](https://youtrack.jetbrains.com/issue/KT-50966)。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.0**

リリース日: 2021年11月16日

</td>
<td>

* [新規 Kotlin Multiplatform Library ウィザード](https://youtrack.jetbrains.com/issue/KTIJ-19367)。
* 新しい形式の Kotlin Multiplatform ライブラリ配布をサポート: [XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks)。
* 新しいクロスプラットフォームモバイルプロジェクトで [階層型プロジェクト構造](multiplatform-hierarchy.md#manual-configuration) を有効化。
* [明示的な iOS ターゲット宣言](https://youtrack.jetbrains.com/issue/KT-46861) をサポート。
* [Mac 以外のマシンで Kotlin Multiplatform Mobile プラグインのウィザードを有効化](https://youtrack.jetbrains.com/issue/KT-48614)。
* [Kotlin Multiplatform モジュールウィザードでのサブフォルダーをサポート](https://youtrack.jetbrains.com/issue/KT-47923)。
* [Xcode の `Assets.xcassets` ファイルをサポート](https://youtrack.jetbrains.com/issue/KT-49571)。
* [プラグインのクラスローダー例外を修正](https://youtrack.jetbrains.com/issue/KT-48103)。
* CocoaPods Gradle プラグインのテンプレートを更新。
* Kotlin/Native デバッガーの型評価を改善。
* Xcode 13 での iOS デバイス起動を修正。

</td>
<td>

[Kotlin 1.6.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.7**

リリース日: 2021年8月2日

</td>
<td>

* [AppleRunConfiguration に Xcode 構成オプションを追加](https://youtrack.jetbrains.com/issue/KTIJ-19054)。
* [Apple M1 シミュレーターのサポートを追加](https://youtrack.jetbrains.com/issue/KT-47618)。
* [Project Wizard に Xcode 統合オプションに関する情報を追加](https://youtrack.jetbrains.com/issue/KT-47466)。
* [CocoaPods を使用したプロジェクトが生成されたものの CocoaPods gem がインストールされていない場合のエラー通知を追加](https://youtrack.jetbrains.com/issue/KT-47329)。
* [Kotlin 1.5.30 で生成された共有モジュールに Apple M1 シミュレーターターゲットのサポートを追加](https://youtrack.jetbrains.com/issue/KT-47631)。
* [Kotlin 1.5.20 で生成された Xcode プロジェクトを整理](https://youtrack.jetbrains.com/issue/KT-47465)。
* 実際の iOS デバイスでの Xcode Release 構成の起動を修正。
* Xcode 12.5 でのシミュレーター起動を修正。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.6**

リリース日: 2021年6月10日

</td>
<td>

* Android Studio Bumblebee Canary 1 との互換性。
* [Kotlin 1.5.20](https://kotlinlang.org/docs/whatsnew1520.html) のサポート: Project Wizard で Kotlin/Native 向けの新しいフレームワークパッケージ化タスクを使用。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.5**

リリース日: 2021年5月25日

</td>
<td>

* [Android Studio Arctic Fox 2020.3.1 Beta 1 以降との互換性を修正](https://youtrack.jetbrains.com/issue/KT-46834)。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.4**

リリース日: 2021年5月5日

</td>
<td>

このバージョンのプラグインは、Android Studio 4.2 または Android Studio 2020.3.1 Canary 8 以降で使用してください。
* [Kotlin 1.5.0](https://kotlinlang.org/docs/whatsnew15.html) との互換性。
* [iOS 統合のための Kotlin Multiplatform モジュールで CocoaPods 依存関係マネージャーを使用する機能](https://youtrack.jetbrains.com/issue/KT-45946)。

</td>
<td>

[Kotlin 1.5.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.3**

リリース日: 2021年4月5日

</td>
<td>

* [Project Wizard: モジュール命名の改善](https://youtrack.jetbrains.com/issues?q=issue%20id:%20KT-43449,%20KT-44060,%20KT-41520,%20KT-45282)。
* [iOS 統合のための Project Wizard で CocoaPods 依存関係マネージャーを使用する機能](https://youtrack.jetbrains.com/issue/KT-45478)。
* [新規プロジェクトにおける gradle.properties の可読性を向上](https://youtrack.jetbrains.com/issue/KT-42908)。
* [「Add sample tests for Shared Module」のチェックを外した場合にサンプルのテストが生成されないように変更](https://youtrack.jetbrains.com/issue/KT-43441)。
* [修正およびその他の改善](https://youtrack.jetbrains.com/issues?q=Subsystems:%20%7BKMM%20Plugin%7D%20Type:%20Feature,%20Bug%20State:%20-Obsolete,%20-%7BAs%20designed%7D,%20-Answered,%20-Incomplete%20resolved%20date:%202021-03-10%20..%202021-03-25)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.2**

リリース日: 2021年3月3日

</td>
<td>

* [Xcode 関連ファイルを Xcode で開く機能](https://youtrack.jetbrains.com/issue/KT-44970)。
* [iOS 実行構成で Xcode プロジェクトファイルの場所を設定する機能](https://youtrack.jetbrains.com/issue/KT-44968)。
* [Android Studio 2020.3.1 Canary 8 のサポート](https://youtrack.jetbrains.com/issue/KT-45162)。
* [修正およびその他の改善](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.2%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.1**

リリース日: 2021年2月15日

</td>
<td>

このバージョンのプラグインは Android Studio 4.2 で使用してください。
* インフラストラクチャの改善。
* [修正およびその他の改善](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.1%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.0**

リリース日: 2020年11月23日

</td>
<td>

* [iPad デバイスのサポート](https://youtrack.jetbrains.com/issue/KT-41932)。
* [Xcode で構成されたカスタムスキーム名のサポート](https://youtrack.jetbrains.com/issue/KT-41677)。
* [iOS 実行構成にカスタムビルドステップを追加する機能](https://youtrack.jetbrains.com/issue/KT-41678)。
* [カスタム Kotlin/Native バイナリをデバッグする機能](https://youtrack.jetbrains.com/issue/KT-40954)。
* [Kotlin Multiplatform Mobile ウィザードによって生成されるコードを簡素化](https://youtrack.jetbrains.com/issue/KT-41712)。
* Kotlin 1.4.20 で非推奨となった [Kotlin Android Extensions プラグインのサポートを削除](https://youtrack.jetbrains.com/issue/KT-42121)。
* [ホストから切断した後に実機構成が保存されるよう修正](https://youtrack.jetbrains.com/issue/KT-42390)。
* その他の修正と改善。

</td>
<td>

[Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.3**

リリース日: 2020年10月2日

</td>
<td>

* iOS 14 および Xcode 12 との互換性を追加。
* Kotlin Multiplatform Mobile ウィザードによって作成されるプラットフォームテストでの命名を修正。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.2**

リリース日: 2020年9月29日

</td>
<td>

 * [Kotlin 1.4.20-M1](https://kotlinlang.org/docs/eap.html#build-details) との互換性を修正。
 * JetBrains へのエラー報告をデフォルトで有効化。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.1**

リリース日: 2020年9月10日

</td>
<td>

* Android Studio Canary 8 以降との互換性を修正。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.0**

リリース日: 2020年8月31日

</td>
<td>

* Kotlin Multiplatform Mobile プラグインの最初のバージョン。詳細は [ブログ記事](https://blog.jetbrains.com/kotlin/2020/08/kotlin-multiplatform-mobile-goes-alpha/) を参照してください。

</td>
<td>

* [Kotlin 1.4.0](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

</table>