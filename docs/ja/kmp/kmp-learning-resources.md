[//]: # (title: 学習リソース)

<web-summary>ご自身のKMPの経験レベルに最適な学習教材を選択してください。</web-summary>

Kotlin Multiplatform（KMP）およびCompose Multiplatformに関する30以上の重要な学習教材を集めました。スキルレベル別に閲覧して、ご自身の経験に合ったチュートリアル、コース、記事を見つけてください。

🌱 **初級者**。JetBrainsおよびGoogleの公式チュートリアルを通じて、KMPとComposeの基礎を学びます。Room、Ktor、SQLDelightなどのコアライブラリを使用してシンプルなアプリを構築します。

🌿 **中級者**。共有ViewModel、Koinによる依存性注入（DI）、クリーンアーキテクチャを使用して実践的なアプリを開発します。JetBrainsやコミュニティの教育者によるコースを通じて学びます。

🌳 **上級者**。バックエンドやゲーム開発向けの本格的なKMPエンジニアリングへと進み、大規模なマルチチームプロジェクトに向けたアーキテクチャのスケーリングや導入に関するガイダンスを学びます。

🧩 **ライブラリ作成者**。再利用可能なKMPライブラリを作成して公開します。JetBrainsの公式ツールやテンプレートを使用して、API設計、Dokkaによるドキュメント作成、Mavenへの公開方法を学びます。

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

[Kotlin Multiplatformの概要](kmp-overview.md)

記事

</td>
<td>
JetBrains
</td>

<td>
KMPのコアバリュー、実際のユースケース、および適切な学習パスを選択するためのガイダンス。
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

[初めてのKMPアプリを作成する](multiplatform-upgrade-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
UIを完全にネイティブに保ちながら、KMPプロジェクトをセットアップし、AndroidとiOS間でシンプルなビジネスロジックを共有する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
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
既存のAndroidプロジェクトに共有KMPモジュールを追加してiOSと統合し、SKIEプラグインを使用してKotlinコードから慣用的なSwift APIを生成する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[初めてのCompose Multiplatformアプリを作成する](compose-multiplatform-new-project.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
シンプルなテンプレートからAndroid、iOS、デスクトップ、Webで動作する実用的なタイムゾーンアプリへと進めながら、必須のUIコンポーネント、状態管理、リソース処理を網羅し、ゼロから完全なCompose Multiplatformアプリを構築する方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[KtorとSQLDelightを使用したマルチプラットフォームアプリの作成](multiplatform-ktor-sqldelight.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
ネットワーキングにKtor、ローカルデータベースにSQLDelightを使用して共有データ層を構築し、AndroidのJetpack ComposeおよびiOSのSwiftUIで構築されたネイティブUIに接続する方法。
</td>
<td>
無料
</td>
<td>
4〜6時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[expect宣言とactual宣言](multiplatform-expect-actual.md)

記事

</td>
<td>
JetBrains
</td>

<td>
関数、プロパティ、クラスの使用などさまざまな戦略を網羅した、共通コードからプラットフォーム固有のAPIにアクセスするためのコアとなるexpect/actualメカニズム。
</td>
<td>
無料
</td>
<td>
1〜2時間
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
KMPアプリでプラットフォーム固有のコードを使用するためのベストプラクティス。
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
expect/actualやソースセットといったKMPの基礎を習得し、ネットワーキングのKtor、依存性注入のKoin、Nav3、永続化のRoomといった最新ライブラリを使用して完全なアプリスタックを構築することで、既存のAndroid開発スキルをiOSへと拡張する方法。
</td>
<td>
$39
</td>
<td>
8〜12時間
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
クリーンアーキテクチャとMVIをゼロから適用して完全なKMPアプリケーションを構築し、Ktor、SQLDelight、Koinなどの重要なライブラリのフルスタックをネイティブのJetpack ComposeおよびSwiftUIのUIと統合する方法。
</td>
<td>
€10〜€20
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
基礎から、Firebase Authentication、SQLDelightによるオフラインサポート、リアルタイム更新などの高度で実践的な機能へとステップアップしながら、すべてCompose Multiplatformで完全かつ機能豊富なアプリケーションを構築する方法。
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
Compose MultiplatformとネイティブUIのアーキテクチャ上の選択、Swift相互運用の基礎、およびネットワーキング、永続化、依存性注入に不可欠なKMPエコシステムの包括的な概要。
</td>
<td>
約$30〜$40/月
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
Kodeco Team (Kevin D. Moore, Carlos Mota, Saeed Taheri)
</td>

<td>
ネイティブUIをネットワーキング、シリアライズ、永続化のためのKMP共有モジュールに接続することによるコード共有の基礎。また、保守性とスケーラビリティに優れた実践的なアプリを構築するために、依存性注入、テスト、最新アーキテクチャを適用する方法も学びます。
</td>
<td>
約$60
</td>
<td>
40〜60時間
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[AndroidアプリケーションをiOSに対応させる](multiplatform-integrate-in-existing-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
ビジネスロジックを共有モジュールに抽出し、元のAndroidアプリと新しいネイティブiOSプロジェクトの双方で使用できるようにすることで、既存のAndroidアプリをKMPに移行する実践的な手順。
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
既存のAndroid Roomデータベースを共有KMPモジュールに移行し、使い慣れたDAOやエンティティをAndroidとiOSの両方で再利用できるようにする方法。
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
依存性注入にKoinを使用してCompose Multiplatformプロジェクトで共有ViewModelを実装し、状態管理ロジックを一度書くだけで済むようにする方法。
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
クリーンアーキテクチャを使用して本番環境レベルの読書アプリを一から構築する方法。ネットワーキングのKtor、ローカルデータベースのRoom、依存性注入のKoin、マルチプラットフォームナビゲーションを含む最新のKMPスタックを網羅しています。
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
ネイティブUI（Jetpack ComposeとSwiftUI）間でViewModelとビジネスロジックを共有して実践的な翻訳アプリを構築する方法。クリーンアーキテクチャから両プラットフォームのユニットテスト、UIテスト、E2Eテストに至るまでの開発ライフサイクル全体を網羅しています。
</td>
<td>
約€99
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
リアルタイムWebSocketsのためのKtor、ローカル永続化のためのRoom、マルチモジュール依存性注入のためのKoinを含む完全なCompose Multiplatformスタックを使用して、大規模なオフラインファーストのチャットアプリケーションを一から構築する方法。
</td>
<td>
約€199
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
コアスタック（Ktor、Room、Koin）だけでなく、堅牢なユニット/UIテストや生体認証などの高度なプラットフォーム連携まで網羅し、すべてCompose Multiplatformで機能豊富な仮想暗号資産ウォレットアプリを構築する方法。
</td>
<td>
約€20
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
iOS（Obj-C/Swift）との相互運用性、SKIE、KMP-NativeCoroutines、言語機能のギャップに対する回避策、Swiftエクスポート、双方向相互運用。
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
FigmaでのEコマースアプリのUI設計から、Compose Multiplatformを使用した共有UIによる完全なマルチモジュールアプリケーションの構築、さらには認証、データベース、自動化されたCloud FunctionsのためのFirebaseサービスを備えた完全なバックエンドの作成と統合に至るまでの製品ライフサイクル全体。
</td>
<td>
約€50
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
まず安全なKtorバックエンドを作成してAWSにデプロイし、次にKotlin Multiplatformを使用してAPIを消費する共有コードを持つネイティブクライアントを構築することで、フルスタックKotlinアプリケーションを構築する方法。
</td>
<td>
約$30〜$40/月
</td>
<td>
2〜3時間
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
物理演算、衝突判定、スプライトシートアニメーションを網羅してCompose Multiplatformで完全な2Dゲームを構築する方法、およびそれをAndroid、iOS、デスクトップ、Web（Kotlin/Wasm経由）にデプロイする方法。
</td>
<td>
約€99
</td>
<td>
8〜10時間
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
WebSocketsを備えたマルチモジュールのSpring Bootバックエンドから、オフラインファーストのCompose Multiplatformクライアント（Android、iOS、デスクトップ、Web）、完全なCI/CDパイプラインに至るまで、完全なフルスタックチャットアプリケーションを設計、構築、デプロイする方法。
</td>
<td>
約€429
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

記事シリーズ

</td>
<td>
Touchlab
</td>

<td>
初期の賛同獲得や技術パイロットの実施から、持続可能な実践的ワークフローによる共有コードベースのスケーリングに至るまで、既存のネイティブモバイルチーム内でKMP導入プロセス全体を進める方法。
</td>
<td>
無料
</td>
<td>
6〜8時間
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[マルチプラットフォームライブラリ構築のためのAPIガイドライン](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
コードの再利用性を最大化し、幅広いプラットフォーム互換性を確保するための重要なベストプラクティスに従って、マルチプラットフォームライブラリのパブリックAPIを設計する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatformライブラリの作成](create-kotlin-multiplatform-library.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
公式スターターテンプレートの使用、ローカルMaven公開のセットアップ、ライブラリの構造化、および公開の設定を行う方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Dokkaによるドキュメント作成](https://kotlinlang.org/docs/dokka-introduction.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
Dokkaを使用して、Kotlin/Java混在プロジェクトをサポートしながら、KMPライブラリ向けのプロフェッショナルなAPIドキュメントを複数の形式で自動生成する方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP Library Template](https://github.com/Kotlin/multiplatform-library-template)

GitHubテンプレート

</td>
<td>
JetBrains

GitHub
</td>

<td>
ビルドのセットアップと公開に関するベストプラクティスがあらかじめ設定された公式テンプレートを使用して、新しいKMPライブラリプロジェクトを迅速に立ち上げる方法。
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

[Maven Centralへの公開](multiplatform-publish-libraries-to-maven.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
認証情報のセットアップ、公開プラグインの設定、CIによるプロセスの自動化を含む、KMPライブラリをMaven Centralに公開するための完全なステップバイステップの手順。
</td>
<td>
無料
</td>
<td>
3〜4時間
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
効果的なAPI設計やコード共有戦略から最終的な配布、ベストプラクティスに至るまで、KMPライブラリ作成の完全なライフサイクル。
</td>
<td>
約$30〜$40/月
</td>
<td>
2〜3時間
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>
</snippet>

<!-- END OF REVOKED BLOCK -->

</TabItem>

<TabItem id="beginner" title="🌱 初級者">

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

[Kotlin Multiplatformの概要](kmp-overview.md)

記事

</td>
<td>
JetBrains
</td>

<td>
KMPのコアバリュー、実際のユースケース、および適切な学習パスを選択するためのガイダンス。
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

[初めてのKMPアプリを作成する](multiplatform-upgrade-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
UIを完全にネイティブに保ちながら、KMPプロジェクトをセットアップし、AndroidとiOS間でシンプルなビジネスロジックを共有する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
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
既存のAndroidプロジェクトに共有KMPモジュールを追加してiOSと統合し、SKIEプラグインを使用してKotlinコードから慣用的なSwift APIを生成する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[初めてのCompose Multiplatformアプリを作成する](compose-multiplatform-new-project.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
シンプルなテンプレートからAndroid、iOS、デスクトップ、Webで動作する実用的なタイムゾーンアプリへと進めながら、必須のUIコンポーネント、状態管理、リソース処理を網羅し、ゼロから完全なCompose Multiplatformアプリを構築する方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[KtorとSQLDelightを使用したマルチプラットフォームアプリの作成](multiplatform-ktor-sqldelight.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
ネットワーキングにKtor、ローカルデータベースにSQLDelightを使用して共有データ層を構築し、AndroidのJetpack ComposeおよびiOSのSwiftUIで構築されたネイティブUIに接続する方法。
</td>
<td>
無料
</td>
<td>
4〜6時間
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[expect宣言とactual宣言](multiplatform-expect-actual.md)

記事

</td>
<td>
JetBrains
</td>

<td>
関数、プロパティ、クラスの使用などさまざまな戦略を網羅した、共通コードからプラットフォーム固有のAPIにアクセスするためのコアとなるexpect/actualメカニズム。
</td>
<td>
無料
</td>
<td>
1〜2時間
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
KMPアプリでプラットフォーム固有のコードを使用するためのベストプラクティス。
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
expect/actualやソースセットといったKMPの基礎を習得し、ネットワーキングのKtor、依存性注入のKoin、Nav3、永続化のRoomといった最新ライブラリを使用して完全なアプリスタックを構築することで、既存のAndroid開発スキルをiOSへと拡張する方法。
</td>
<td>
$39
</td>
<td>
8〜12時間
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
クリーンアーキテクチャとMVIをゼロから適用して完全なKMPアプリケーションを構築し、Ktor、SQLDelight、Koinなどの重要なライブラリのフルスタックをネイティブのJetpack ComposeおよびSwiftUIのUIと統合する方法。
</td>
<td>
€10〜€20
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
基礎から、Firebase Authentication、SQLDelightによるオフラインサポート、リアルタイム更新などの高度で実践的な機能へとステップアップしながら、すべてCompose Multiplatformで完全かつ機能豊富なアプリケーションを構築する方法。
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
Compose MultiplatformとネイティブUIのアーキテクチャ上の選択、Swift相互運用の基礎、およびネットワーキング、永続化、依存性注入に不可欠なKMPエコシステムの包括的な概要。
</td>
<td>
約$30〜$40/月
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
Kodeco Team (Kevin D. Moore, Carlos Mota, Saeed Taheri)
</td>

<td>
ネイティブUIをネットワーキング、シリアライズ、永続化のためのKMP共有モジュールに接続することによるコード共有の基礎。また、保守性とスケーラビリティに優れた実践的なアプリを構築するために、依存性注入、テスト、最新アーキテクチャを適用する方法も学びます。
</td>
<td>
約$60
</td>
<td>
40〜60時間
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="intermediate" title="🌿 中級者">

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

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[AndroidアプリケーションをiOSに対応させる](multiplatform-integrate-in-existing-app.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
ビジネスロジックを共有モジュールに抽出し、元のAndroidアプリと新しいネイティブiOSプロジェクトの双方で使用できるようにすることで、既存のAndroidアプリをKMPに移行する実践的な手順。
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
既存のAndroid Roomデータベースを共有KMPモジュールに移行し、使い慣れたDAOやエンティティをAndroidとiOSの両方で再利用できるようにする方法。
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
依存性注入にKoinを使用してCompose Multiplatformプロジェクトで共有ViewModelを実装し、状態管理ロジックを一度書くだけで済むようにする方法。
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
クリーンアーキテクチャを使用して本番環境レベルの読書アプリを一から構築する方法。ネットワーキングのKtor、ローカルデータベースのRoom、依存性注入のKoin、マルチプラットフォームナビゲーションを含む最新のKMPスタックを網羅しています。
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
ネイティブUI（Jetpack ComposeとSwiftUI）間でViewModelとビジネスロジックを共有して実践的な翻訳アプリを構築する方法。クリーンアーキテクチャから両プラットフォームのユニットテスト、UIテスト、E2Eテストに至るまでの開発ライフサイクル全体を網羅しています。
</td>
<td>
約€99
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
リアルタイムWebSocketsのためのKtor、ローカル永続化のためのRoom、マルチモジュール依存性注入のためのKoinを含む完全なCompose Multiplatformスタックを使用して、大規模なオフラインファーストのチャットアプリケーションを一から構築する方法。
</td>
<td>
約€199
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
コアスタック（Ktor、Room、Koin）だけでなく、堅牢なユニット/UIテストや生体認証などの高度なプラットフォーム連携まで網羅し、すべてCompose Multiplatformで機能豊富な仮想暗号資産ウォレットアプリを構築する方法。
</td>
<td>
約€20
</td>
<td>
8時間
</td>
</tr>
<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="advanced" title="🌳 上級者">

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

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

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
iOS（Obj-C/Swift）との相互運用性、SKIE、KMP-NativeCoroutines、言語機能のギャップに対する回避策、Swiftエクスポート、双方向相互運用。
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
FigmaでのEコマースアプリのUI設計から、Compose Multiplatformを使用した共有UIによる完全なマルチモジュールアプリケーションの構築、さらには認証、データベース、自動化されたCloud FunctionsのためのFirebaseサービスを備えた完全なバックエンドの作成と統合に至るまでの製品ライフサイクル全体。
</td>
<td>
約€50
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
まず安全なKtorバックエンドを作成してAWSにデプロイし、次にKotlin Multiplatformを使用してAPIを消費する共有コードを持つネイティブクライアントを構築することで、フルスタックKotlinアプリケーションを構築する方法。
</td>
<td>
約$30〜$40/月
</td>
<td>
2〜3時間
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
物理演算、衝突判定、スプライトシートアニメーションを網羅してCompose Multiplatformで完全な2Dゲームを構築する方法、およびそれをAndroid、iOS、デスクトップ、Web（Kotlin/Wasm経由）にデプロイする方法。
</td>
<td>
約€99
</td>
<td>
8〜10時間
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
WebSocketsを備えたマルチモジュールのSpring Bootバックエンドから、オフラインファーストのCompose Multiplatformクライアント（Android、iOS、デスクトップ、Web）、完全なCI/CDパイプラインに至るまで、完全なフルスタックチャットアプリケーションを設計、構築、デプロイする方法。
</td>
<td>
約€429
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

記事シリーズ

</td>
<td>
Touchlab
</td>

<td>
初期の賛同獲得や技術パイロットの実施から、持続可能な実践的ワークフローによる共有コードベースのスケーリングに至るまで、既存のネイティブモバイルチーム内でKMP導入プロセス全体を進める方法。
</td>
<td>
無料
</td>
<td>
6〜8時間
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="lib-authors" title="🧩 ライブラリ作成者">

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

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[マルチプラットフォームライブラリ構築のためのAPIガイドライン](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
コードの再利用性を最大化し、幅広いプラットフォーム互換性を確保するための重要なベストプラクティスに従って、マルチプラットフォームライブラリのパブリックAPIを設計する方法。
</td>
<td>
無料
</td>
<td>
1〜2時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatformライブラリの作成](create-kotlin-multiplatform-library.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
公式スターターテンプレートの使用、ローカルMaven公開のセットアップ、ライブラリの構造化、および公開の設定を行う方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Dokkaによるドキュメント作成](https://kotlinlang.org/docs/dokka-introduction.html)

ドキュメント

</td>
<td>
JetBrains
</td>

<td>
Dokkaを使用して、Kotlin/Java混在プロジェクトをサポートしながら、KMPライブラリ向けのプロフェッショナルなAPIドキュメントを複数の形式で自動生成する方法。
</td>
<td>
無料
</td>
<td>
2〜3時間
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP Library Template](https://github.com/Kotlin/multiplatform-library-template)

GitHubテンプレート

</td>
<td>
JetBrains

GitHub
</td>

<td>
ビルドのセットアップと公開に関するベストプラクティスがあらかじめ設定された公式テンプレートを使用して、新しいKMPライブラリプロジェクトを迅速に立ち上げる方法。
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

[Maven Centralへの公開](multiplatform-publish-libraries-to-maven.md)

チュートリアル

</td>
<td>
JetBrains
</td>

<td>
認証情報のセットアップ、公開プラグインの設定、CIによるプロセスの自動化を含む、KMPライブラリをMaven Centralに公開するための完全なステップバイステップの手順。
</td>
<td>
無料
</td>
<td>
3〜4時間
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
効果的なAPI設計やコード共有戦略から最終的な配布、ベストプラクティスに至るまで、KMPライブラリ作成の完全なライフサイクル。
</td>
<td>
約$30〜$40/月
</td>
<td>
2〜3時間
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

</Tabs>