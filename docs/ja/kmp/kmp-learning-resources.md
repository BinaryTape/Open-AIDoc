[//]: # (title: 学習リソース)

<web-summary>ご自身の KMP の経験レベルに最適な学習教材を選択してください。</web-summary>

Kotlin Multiplatform（KMP）および Compose Multiplatform に関する 30 以上の主要な学習教材をまとめました。スキルレベル別に、ご自身の経験に合ったチュートリアル、コース、記事を探すことができます。

🌱 **初級（Beginner）**: JetBrains や Google の公式チュートリアルを通じて、KMP と Compose の基礎を学びます。Room、Ktor、SQLDelight などのコアライブラリを使用してシンプルなアプリを構築します。

🌿 **中級（Intermediate）**: 共通の ViewModel、Koin による依存性注入（DI）、クリーンアーキテクチャを活用した実践的なアプリを開発します。JetBrains やコミュニティの講師によるコースを通じて学びます。

🌳 **上級（Advanced）**: バックエンドやゲーム開発向けの本格的な KMP エンジニアリングへと進み、大規模なマルチチームプロジェクトにおけるアーキテクチャのスケーリングや導入指針について学びます。

🧩 **ライブラリ作成者（Library authors）**: 再利用可能な KMP ライブラリを作成・公開します。JetBrains 公式のツールとテンプレートを使用して、API 設計、Dokka によるドキュメント作成、Maven への公開方法を学びます。

<Tabs>
<TabItem id="all-resources" title="すべて">

<snippet id="source">
<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**リソース /**

**種別**

</th>
<th>

**作成者 /**
**プラットフォーム**

</th>

<th>

**学べる内容**

</th>
<th>

**価格**

</th>
<th>

**所要時間（目安）**

</th>
</tr>

</thead>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Overview](kmp-overview.md)

記事

</td>
<td>
JetBrains
</td>

<td>
KMP の中核的な価値、実際のユースケース、適切な学習パスを選択するためのガイダンス。
</td>
<td>
無料
</td>
<td>
30分
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create Your First KMP App](multiplatform-upgrade-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
UI を完全にネイティブに保ちながら、KMP プロジェクトをセットアップし、Android と iOS 間でシンプルなビジネスロジックを共有する方法。
</td>
<td>
無料
</td>
<td>
1–2時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Get Started With Kotlin Multiplatform (Google Codelab)](https://developer.android.com/codelabs/kmp-get-started)

チュートリアル

</td>
<td>
Google

Android
</td>

<td>
既存の Android プロジェクトに共有 KMP モジュールを追加して iOS と統合する方法。SKIE プラグインを使用して Kotlin コードから慣用的な Swift API を生成する手法も扱います。
</td>
<td>
無料
</td>
<td>
1–2時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create Your First Compose Multiplatform App](compose-multiplatform-new-project.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
主要な UI コンポーネント、状態管理、リソース処理を網羅し、シンプルなテンプレートから Android、iOS、デスクトップ、Web で動作する実用的なタイムゾーンアプリへと発展させながら、Compose Multiplatform アプリを一から完全に構築する方法。
</td>
<td>
無料
</td>
<td>
2–3時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create a Multiplatform App Using Ktor and SQLDelight](multiplatform-ktor-sqldelight.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
ネットワーク通信に Ktor、ローカルデータベースに SQLDelight を使用して共有データ層を構築し、Android 上の Jetpack Compose および iOS 上の SwiftUI で構築されたネイティブ UI と接続する方法。
</td>
<td>
無料
</td>
<td>
4–6時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Expected and Actual Declarations](multiplatform-expect-actual.md)

記事

</td>
<td>
JetBrains
</td>

<td>
共通コードからプラットフォーム固有の API にアクセスするための中核的な expect/actual メカニズム。関数、プロパティ、クラスを使用するさまざまな戦略を解説します。
</td>
<td>
無料
</td>
<td>
1–2時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Using Platform-Specific APIs in KMP Apps](https://www.youtube.com/watch?v=bSNumV04y_w)

動画チュートリアル

</td>
<td>
JetBrains

YouTube
</td>

<td>
KMP アプリでプラットフォーム固有のコードを使用するためのベストプラクティス。
</td>
<td>
無料
</td>
<td>
15分
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[KMP for Android Developers](https://learnkmp.com/)

動画コース

</td>
<td>
Mykola Miroshnychenko

PayHip
</td>

<td>
expect/actual やソースセットなどの KMP の基礎を習得し、ネットワーク用の Ktor、依存性注入用の Koin、Nav3、永続化用の Room などの最新ライブラリを使用して完全なアプリスタックを構築することで、既存の Android 開発スキルを iOS に拡張する方法。
</td>
<td>
$39
</td>
<td>
8–12時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Masterclass](https://www.udemy.com/course/kotlin-multiplatform-masterclass/)

動画コース

</td>
<td>
Petros Efthymiou

Udemy
</td>

<td>
クリーンアーキテクチャと MVI を一から適用して完全な KMP アプリケーションを構築し、主要ライブラリのフルスタック（Ktor、SQLDelight、Koin）をネイティブの Jetpack Compose および SwiftUI UI と統合する方法。
</td>
<td>
€10–€20
</td>
<td>
6時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Compose Multiplatform Full Course 2025 | Zero to Hero](https://www.youtube.com/watch?v=Z92zJzL-6z0&list=PL0pXjGnY7PORAoIX2q7YG2sotapCp4hyl)

動画コース

</td>
<td>
Code with FK

YouTube
</td>

<td>
Compose Multiplatform のみを用いて機能豊富なアプリケーションを丸ごと構築する方法。基礎から始めて、Firebase Authentication、SQLDelight によるオフラインサポート、リアルタイム更新などの実践的で高度な機能までステップアップします。
</td>
<td>
無料
</td>
<td>
20時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Development](https://www.linkedin.com/learning/kotlin-multiplatform-development)

動画コース

</td>
<td>
Colin Lee

LinkedIn Learning
</td>

<td>
Compose Multiplatform とネイティブ UI のどちらを採用するかのアーキテクチャ上の選択基準、Swift との相互運用性の基礎、ならびにネットワーク、永続化、依存性注入に関する主要な KMP エコシステムの包括的な概要。
</td>
<td>
約 $30–$40/月
</td>
<td>
3時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform by Tutorials (Third Edition)](https://www.kodeco.com/books/kotlin-multiplatform-by-tutorials/v3.0)

書籍

</td>
<td>
Kodeco Team（Kevin D. Moore、Carlos Mota、Saeed Taheri）
</td>

<td>
ネイティブ UI をネットワーク、シリアライズ、永続化を担う KMP 共有モジュールに接続することによるコード共有の基礎。依存性注入、テスト、最新のアーキテクチャを適用して、保守性と拡張性に優れた実践的なアプリを構築する方法も解説します。
</td>
<td>
約 $60
</td>
<td>
40–60時間
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Make Your Android Application Work on iOS](multiplatform-integrate-in-existing-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
既存の Android アプリのビジネスロジックを共有モジュールに抽出し、元の Android アプリと新しいネイティブ iOS プロジェクトの双方で利用できるようにして KMP へ移行するための実践的な手順。
</td>
<td>
無料
</td>
<td>
2時間
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Migrate Existing Apps to Room KMP (Google Codelab)](https://developer.android.com/codelabs/kmp-migrate-room)

チュートリアル

</td>
<td>
Google

Android
</td>

<td>
既存の Android Room データベースを共有 KMP モジュールへ移行し、使い慣れた DAO やエンティティを Android と iOS の両方で再利用できるようにする方法。
</td>
<td>
無料
</td>
<td>
2時間
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[How to Share ViewModels in Compose Multiplatform (with Dependency Injection!)](https://www.youtube.com/watch?v=O85qOS7U3XQ)

動画チュートリアル

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
Compose Multiplatform プロジェクトにおいて、Koin による依存性注入を用いて共有 ViewModel を実装し、状態管理ロジックを一度だけ記述できるようにする方法。
</td>
<td>
無料
</td>
<td>
30分
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[The Compose Multiplatform Crash Course 2025](https://www.youtube.com/watch?v=WT9-4DXUqsM)

動画コース

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
クリーンアーキテクチャを用いてプロダクション対応の読書アプリを一から構築する方法。ネットワーク用の Ktor、ローカルデータベース用の Room、依存性注入用の Koin、マルチプラットフォームナビゲーションなど、最新の KMP スタックを網羅します。
</td>
<td>
無料
</td>
<td>
5時間
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Building Industry-Level Multiplatform Apps With KMP](https://pl-coding.com/kmp/)

動画コース

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
ネイティブ UI（Jetpack Compose と SwiftUI）間で ViewModel とビジネスロジックを共有して実践的な翻訳アプリを構築する方法。クリーンアーキテクチャから両プラットフォーム向けのユニットテスト、UI テスト、E2E テストに至るまで、開発ライフサイクル全体を網羅します。
</td>
<td>
約 €99
</td>
<td>
20時間
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Building Industry-Level Compose Multiplatform Android and iOS Apps](https://pl-coding.com/cmp-mobile)

動画コース

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
リアルタイム WebSocket 用の Ktor、ローカル永続化用の Room、マルチモジュール依存性注入用の Koin を含む完全な Compose Multiplatform スタックを使用して、大規模なオフラインファーストのチャットアプリケーションを一から構築する方法。
</td>
<td>
約 €199
</td>
<td>
34時間
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Ultimate Compose Multiplatform: Android/iOS and Testing](https://www.udemy.com/course/ultimate-compose-multiplatform-androidios-testing-kotlin/)

動画コース

</td>
<td>
Hamidreza Sahraei

Udemy

</td>

<td>
Compose Multiplatform のみを用いて機能豊富な仮想暗号資産ウォレットアプリを構築する方法。コアスタック（Ktor、Room、Koin）だけでなく、堅牢なユニット/UI テストや生体認証などの高度なプラットフォーム統合についても解説します。
</td>
<td>
約 €20
</td>
<td>
8時間
</td>
</tr>
<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Kotlin/Swift Interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)

記事

</td>
<td>
JetBrains

GitHub
</td>

<td>
iOS との相互運用性（Obj-C/Swift）、SKIE、KMP-NativeCoroutines、言語機能のギャップに対する回避策、Swift エクスポート、双方向の相互運用性。
</td>
<td>
無料
</td>
<td>
2時間
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Multi-Modular Ecommerce App for Android and iOS (KMP)](https://www.udemy.com/course/multi-modular-ecommerce-app-for-android-ios-kmp/)

動画コース

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
Figma での E コマースアプリの UI 設計から、Compose Multiplatform による共有 UI を備えた完全なマルチモジュールアプリケーションとしての構築、さらには認証、データベース、自動クラウドアクションのための Firebase サービスを用いたバックエンド全体の作成と統合まで、製品のライフサイクル全体を扱います。
</td>
<td>
約 €50
</td>
<td>
30時間
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Exploring Ktor with Kotlin Multiplatform and Compose](https://www.linkedin.com/learning/exploring-ktor-with-kotlin-multiplatform-and-compose)

動画コース

</td>
<td>
Troy Miles

LinkedIn Learning
</td>

<td>
安全な Ktor バックエンドを作成して AWS にデプロイし、Kotlin Multiplatform を使用してその API を利用するコード共有型のネイティブクライアントを構築する、フルスタック Kotlin アプリケーションの開発手法。
</td>
<td>
約 $30–$40/月
</td>
<td>
2-3時間
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Full-Stack Game Development - Kotlin and Compose Multiplatform](https://www.udemy.com/course/full-stack-game-development-kotlin-compose-multiplatform/)

動画コース

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
物理演算、衝突判定、スプライトシートアニメーションを網羅した完全な 2D ゲームを Compose Multiplatform で構築し、Android、iOS、デスクトップ、Web（Kotlin/Wasm 経由）にデプロイする方法。
</td>
<td>
約 €99
</td>
<td>
8–10時間
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Philipp Lackner Full-Stack Bundle: KMP and Spring Boot](https://pl-coding.com/full-stack-bundle)

動画コース

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
WebSockets を備えたマルチモジュールの Spring Boot バックエンドから、オフラインファーストの Compose Multiplatform クライアント（Android、iOS、デスクトップ、Web）、完全な CI/CD パイプラインに至るまで、フルスタックのチャットアプリケーションを設計、構築、デプロイする完全なプロセス。
</td>
<td>
約 €429
</td>
<td>
55時間
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[KMP for Native Mobile Teams](https://touchlab.co/kmp-teams-intro)

連載記事

</td>
<td>
Touchlab
</td>

<td>
初期の賛同獲得や技術パイロットの実施から、持続可能な実践ワークフローによる共有コードベースのスケーリングに至るまで、既存のネイティブモバイルチーム内で KMP の導入プロセス全体を進める方法。
</td>
<td>
無料
</td>
<td>
6–8時間
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[API Guidelines for Multiplatform Library Building](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
コードの再利用性を最大化し、幅広いプラットフォーム互換性を確保するための重要なベストプラクティスに従って、マルチプラットフォームライブラリのパブリック API を設計する方法。
</td>
<td>
無料
</td>
<td>
1–2時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Create Your Kotlin Multiplatform Library](create-kotlin-multiplatform-library.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
公式スターターテンプレートの使用、ローカル Maven 公開のセットアップ、ライブラリの構造化、公開設定の構成を行う方法。
</td>
<td>
無料
</td>
<td>
2–3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Documentation with Dokka](https://kotlinlang.org/docs/dokka-introduction.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
Dokka を使用して、Kotlin/Java の混在プロジェクトをサポートしながら、KMP ライブラリ向けの本格的な API ドキュメントを複数の形式で自動生成する方法。
</td>
<td>
無料
</td>
<td>
2–3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP Library Template](https://github.com/Kotlin/multiplatform-library-template)

GitHub テンプレート

</td>
<td>
JetBrains

GitHub
</td>

<td>
ビルド設定や公開に関するベストプラクティスがあらかじめ設定された公式テンプレートを使用して、新しい KMP ライブラリプロジェクトを迅速に立ち上げる方法。
</td>
<td>
無料
</td>
<td>
1時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Publish to Maven Central](multiplatform-publish-libraries-to-maven.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
認証情報のセットアップ、公開プラグインの設定、CI によるプロセスの自動化など、KMP ライブラリを Maven Central に公開するための詳細な手順。
</td>
<td>
無料
</td>
<td>
3–4時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatform Libraries](https://www.linkedin.com/learning/kotlin-multiplatform-libraries)

動画コース

</td>
<td>
LinkedIn Learning
</td>

<td>
効果的な API 設計やコード共有戦略から、最終的な配布やベストプラクティスに至るまで、KMP ライブラリ作成のライフサイクル全体。
</td>
<td>
約 $30–$40/月
</td>
<td>
2-3時間
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>
</snippet>

<!-- END OF REVOKED BLOCK -->

</TabItem>

<TabItem id="beginner" title="🌱 初級">

<include element-id="source" use-filter="empty,beginner" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="intermediate" title="🌿 中級">

<include element-id="source" use-filter="empty,intermediate" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="advanced" title="🌳 上級">

<include element-id="source" use-filter="empty,advanced" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="lib-authors" title="🧩 ライブラリ作成者">

<include element-id="source" use-filter="empty,lib-authors" from="kmp-learning-resources.md"/>

</TabItem>

</Tabs>