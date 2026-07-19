[//]: # (title: Kotlin Multiplatform スタートガイド)

## どこから始めるか

1. Kotlin Multiplatform (KMP) および Compose Multiplatform (CMP) について学びます。
   これらがどのようなものであるか、その[利点とユースケース](kmp-overview.md)を確認してください。
2. [サンプルプロジェクトで KMP を試して](quickstart.md)、プロジェクトがどのように構成され、異なるプラットフォームでどのように動作するかを確認してください。

## KMP の基本を学ぶ

基本事項には以下が含まれます：

* [KMP / CMP プロジェクトがどのように構成されているかを理解する](multiplatform-discover-project.md)。
  これには以下が含まれます：
    * 共有モジュール内の共通コードとプラットフォーム固有のコード。
    * ターゲットプラットフォームの宣言。
* [KMP プロジェクトへの依存関係の追加](multiplatform-add-dependencies.md)。
    * マルチプラットフォームおよびプラットフォーム固有の依存関係の構成に関する具体的な例については、こちらの[サンプル](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)を参照してください。
    * そのサンプルの最終状態に至るまでのチュートリアルは、[ドキュメントで公開されています](multiplatform-upgrade-app.md)。
* すでに KMP に慣れている場合は、一般的なプロジェクト向けの[推奨されるプロジェクト構造](multiplatform-project-recommended-structure.md)について最新の情報を確認してください。
  これには、Android Gradle プラグイン 9.0 のリリースが KMP プロジェクトの要件にどのように影響したかが考慮されており、以下の内容をカバーしています：
    * モジュール構造（ライブラリとして使用される共有コードモジュールを持つ独立したアプリモジュール）。
    * 新しいアプリモジュールの作成、および AGP 8 で使用されていた古い構造からの移行。
* JetBrains のデベロッパーアドボケイトが録画した、[プロジェクト構造に関する推奨ビデオ](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## コードの共有

KMP プロジェクトでコードを共有する方法はいくつかあり、プラットフォーム固有の事項も存在します：

* アプリモジュールから共通コードを呼び出す基本的な例は、オンボーディングチュートリアルで説明されています：
    * [ネイティブ UI と共有ロジックの場合](multiplatform-create-first-app.md)
    * [共有 UI とロジックの場合](compose-multiplatform-create-first-app.md)
* [プラットフォーム固有の API へのアクセス方法](multiplatform-connect-to-apis.md)：
    * 可能な場合はマルチプラットフォームライブラリを使用してください。
    * 適切なマルチプラットフォームライブラリが利用できない場合は、`expect`/`actual` メカニズムを使用してください。
* Android Kotlin から共有 Kotlin を呼び出すのは比較的簡単ですが、iOS の相互運用性（interoperability）についてはいくつか知っておくべきことがあります：
    * [共有コードを iOS アプリと統合する方法を学ぶ](multiplatform-ios-integration-overview.md#local-integration)（このドキュメントで参照されているすべてのサンプルには、iOS 統合の設定例が含まれています）。
      > CocoaPods は一般的に Swift Package Manager への移行が進んでおり、新しいプロジェクトでの使用は推奨されません。
      >
      {style="note"}   
    * Kotlin コルーチンを iOS で動作させる方法を含む[サンプルとチュートリアル](multiplatform-upgrade-app.md#add-more-dependencies)を確認してください。
    * KMP iOS アプリで既存の [SPM パッケージを使用する](multiplatform-spm-import.md)ためのガイドを参照してください。
    * [Kotlin から Swift / ObjC を呼び出す方法、およびその逆の方法](https://kotlinlang.org/docs/native-objc-interop.html)についての詳細な解説を読んでください。
    * より簡潔な [Swift export](https://kotlinlang.org/docs/native-swift-export.html) アプローチ（現在はアルファ版）について学びます。
    * 一般的に、相互運用（interop）は少ないほど良いため、よりスムーズな体験を得るには、Compose Multiplatform を使用して全プラットフォーム向けの UI の大部分を構築することをお勧めします。

## エコシステムを探る

マルチプラットフォームライブラリの包括的なカタログは [klibs.io](https://klibs.io/) で公開されています：

* 最も一般的なケースについては、すでに堅牢なソリューションが存在し、通常は代替案も利用可能です：
  データベース用の [SQLDelight](https://sqldelight.github.io/sqldelight/) と [Room](https://developer.android.com/kotlin/multiplatform/room)、ネットワーキング用の [Ktor](https://ktor.io/) と [OkHttp](https://square.github.io/okhttp/)、画像読み込み用の [Coil](https://coil-kt.github.io/coil/) など。
* 最も一般的なユースケースにマルチプラットフォームライブラリを使用するように構築されたアプリサンプルが用意されています：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) と対応する [チュートリアル](multiplatform-ktor-sqldelight.md)。
    * [元の Android サンプル](https://github.com/android/compose-samples/tree/main/Jetcaster)から移行された[マルチプラットフォーム Jetcaster アプリ](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## KMP ライブラリの作成

マルチプラットフォームライブラリを使用してコードを共有するアプリを作成する場合は、以下のドキュメントページを確認してください：

* [ライブラリの基本チュートリアル](create-kotlin-multiplatform-library.md)
* [KMP ライブラリの公開設定](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) および [npm](multiplatform-publish-libraries-to-npm.md) にアーティファクトを公開するためのチュートリアル

## アーティファクトの公開

* [KMP アプリの公開に関する全般的な記事](multiplatform-publish-apps.md)を読んでください。
* Apple App Store で必要となる[プライバシーマニフェスト](multiplatform-privacy-manifest.md)についても忘れないでください。

## 学習リソースカタログ

前述のすべてのリソースは、より詳細なガイドやサードパーティのコンテンツとともに、[学習リソース](kmp-learning-resources.md)ページにまとめられています。