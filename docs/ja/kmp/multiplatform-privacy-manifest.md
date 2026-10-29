[//]: # (title: iOSアプリ用プライバシーマニフェスト)

あなたのアプリがApple App Store向けであり、[理由が必要なAPI (required reasons APIs)](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) を使用している場合、App Store Connectはアプリに正しいプライバシーマニフェスト（privacy manifest）が含まれていないという警告を出すことがあります。

![理由が必要なAPIに関する警告](app-store-required-reasons-warning.png){width=700}

これは、ネイティブかマルチプラットフォームかを問わず、すべてのAppleエコシステムのアプリに影響する可能性があります。アプリがサードパーティのライブラリやSDKを介して、それとは気づかずに「理由が必要なAPI」を使用している場合があります。Kotlin Multiplatformも、あなたが意識していないAPIを使用しているフレームワークの一つである可能性があります。

このページでは、問題の詳細な説明と、それに対処するための推奨事項を記載しています。

> このページは、この問題に関するKotlinチームの現在の見解を反映しています。
> 受け入れられるアプローチや回避策についてのデータや知識がさらに得られ次第、それらを反映するためにこのページを更新する予定です。
>
{style="tip"}

## 問題の概要 {id="what-s-the-issue"}

AppleのApp Storeへの提出に関する要件は、[2024年の春に変更されました](https://developer.apple.com/news/?id=r1henawx)。
[App Store Connect](https://appstoreconnect.apple.com) では、プライバシーマニフェスト内で「理由が必要なAPI」を使用する理由を指定していないアプリを受け付けなくなりました。

これは手動の審査ではなく自動チェックです。アプリのコードが分析され、問題のリストがメールで届きます。メールには「ITMS-91053: Missing API declaration（API宣言の不足）」という問題が参照され、アプリ内で使用されている[理由が必要なAPI](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)のカテゴリに該当するすべてのAPIカテゴリがリストアップされます。

理想的には、アプリが使用するすべてのSDKが独自のプライバシーマニフェストを提供しており、開発者が心配する必要がない状態が望ましいです。しかし、依存関係の一部がこれを行っていない場合、App Storeへの提出がフラグを立てられる可能性があります。

## 解決方法 {id="how-to-resolve"}

アプリを提出しようとしてApp Storeから詳細な問題リストを受け取った後、Appleのドキュメントに従ってマニフェストを構築できます：

* [プライバシーマニフェストファイルの概要 (Privacy manifest files overview)](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
* [プライバシーマニフェストでのデータ使用の記述 (Describing data use in privacy manifests)](https://developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests)
* [理由が必要なAPIの使用の記述 (Describing use of required reason API)](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)

作成されるファイルは辞書のコレクションです。アクセスされるAPIタイプごとに、提供されたリストから使用理由を1つ以上選択します。Xcodeは、視覚的なレイアウトと各フィールドの有効な値のドロップダウンリストを提供することで、`.xcprivacy` ファイルの編集をサポートします。

[専用のツール](#find-usages-of-required-reason-apis)を使用して、Kotlinフレームワークの依存関係内で「理由が必要なAPI」の使用箇所を見つけることができます。また、[別のプラグイン](#place-the-xcprivacy-file-in-your-kotlin-artifacts)を使用して、`.xcprivacy` ファイルをKotlinアーティファクトにバンドルすることができます。

新しいプライバシーマニフェストを追加してもApp Storeの要件を満たせない場合や、手順の進め方がわからない場合は、[このYouTrackのイシュー](https://youtrack.jetbrains.com/issue/KT-67603)でケースを共有し、お問い合わせください。

## 理由が必要なAPIの使用箇所を見つける {id="find-usages-of-required-reason-apis"}

アプリ内のKotlinコード、またはその依存関係の一つが、`platform.posix` などのライブラリから「理由が必要なAPI」（例：`fstat`）にアクセスしている可能性があります。

```kotlin
import platform.posix.fstat

fun useRequiredReasonAPI() {
    fstat(...)
}
```

場合によっては、どの依存関係が「理由が必要なAPI」を使用しているかを判断するのが難しいことがあります。それらを見つけるのを助けるために、シンプルなツールを作成しました。

これを使用するには、プロジェクト内でKotlinフレームワークが宣言されているディレクトリで以下のコマンドを実行してください：

```shell
/usr/bin/python3 -c "$(curl -fsSL https://github.com/JetBrains/kotlin/raw/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)"
```

また、[このスクリプトを別途ダウンロード](https://github.com/JetBrains/kotlin/blob/rrf_v0.0.1/libraries/tools/required-reason-finder/required_reason_finder.py)し、内容を確認してから `python3` を使用して実行することもできます。

## Kotlinアーティファクトに.xcprivacyファイルを配置する {id="place-the-xcprivacy-file-in-your-kotlin-artifacts"}

`PrivacyInfo.xcprivacy` ファイルをKotlinアーティファクトにバンドルする必要がある場合は、`apple-privacy-manifests` プラグインを使用します。

```kotlin
plugins {
    kotlin("multiplatform")
    kotlin("apple-privacy-manifests") version "1.0.0"
}

kotlin {
    privacyManifest {
        embed(
            privacyManifest = layout.projectDirectory.file("PrivacyInfo.xcprivacy").asFile,
        )
    }
}
```

プラグインは、プライバシーマニフェストファイルを[対応する出力場所](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk?language=objc)にコピーします。

## 既知の使用例 {id="known-usages"}

### Compose Multiplatform {id="compose-multiplatform"}

Compose Multiplatformを使用すると、バイナリ内で `fstat`、`stat`、および `mach_absolute_time` が使用される結果となる場合があります。これらの関数がトラッキングやフィンガープリント（fingerprinting）に使用されておらず、デバイスから送信もされていない場合でも、Appleはこれらを「理由が必要なAPI」の不足としてフラグを立てることがあります。

`stat` および `fstat` の使用理由を指定する必要がある場合は、`0A2A.1` を使用してください。`mach_absolute_time` の場合は、`35F9.1` を使用してください。

Compose Multiplatformで使用される「理由が必要なAPI」に関する今後の更新については、[このイシュー](https://github.com/JetBrains/compose-multiplatform/issues/4738)をフォローしてください。

### バージョン1.9.10以前のKotlin/Nativeランタイム {id="kotlin-native-runtime-in-versions-1-9-10-or-earlier"}

`mach_absolute_time` APIは、Kotlin/Nativeランタイムの `mimalloc` アロケータで使用されています。これはKotlin 1.9.10以前のバージョンのデフォルトのアロケータでした。

Kotlin 1.9.20以降のバージョンへのアップグレードを推奨します。アップグレードが不可能な場合は、メモリアロケータを変更してください。そのためには、Gradleビルドスクリプトで、現在のKotlinアロケータには `-Xallocator=custom` コンパイルオプションを、システムアロケータには `-Xallocator=std` を設定してください。

詳細については、[Kotlin/Nativeのメモリ管理](https://kotlinlang.org/docs/native-memory-manager.html)を参照してください。