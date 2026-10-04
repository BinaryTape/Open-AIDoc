[//]: # (title: プラットフォーム間でのコード共有)

Kotlin Multiplatformを使用すると、Kotlinが提供するメカニズムを利用してコードを共有できます。
 
* [プロジェクトで使用されるすべてのプラットフォーム間でのコード共有](#share-code-on-all-platforms)：すべてのプラットフォームに適用される共通のビジネスロジックを共有するために使用します。
* [プロジェクトに含まれる一部のプラットフォーム間でのコード共有](#share-code-on-similar-platforms)：プロジェクトに含まれる一部（すべてではない）のプラットフォーム間でコードを共有します。階層構造を利用することで、類似したプラットフォーム間でコードを再利用できます。

共有コードからプラットフォーム固有のAPIにアクセスする必要がある場合は、Kotlinの[expected宣言とactual宣言](multiplatform-expect-actual.md)のメカニズムを使用してください。

## すべてのプラットフォームでのコード共有 {id="share-code-on-all-platforms"}

すべてのプラットフォームで共通するビジネスロジックがある場合、プラットフォームごとに同じコードを書く必要はありません。共通のソースセット（common source set）で共有するだけです。

![すべてのプラットフォームで共有されるコード](flat-structure.svg)

ソースセットの一部の依存関係はデフォルトで設定されています。手動で `dependsOn` の関係を指定する必要はありません。
* `jvmMain` や `macosArm64Main` など、共通ソースセットに依存するすべてのプラットフォーム固有ソースセット向け。
* `androidMain` と `androidUnitTest` など、特定のターゲットの `main` ソースセットと `test` ソースセット間。

共有コードからプラットフォーム固有のAPIにアクセスする必要がある場合は、Kotlinの[expected宣言とactual宣言](multiplatform-expect-actual.md)のメカニズムを使用してください。

## 類似したプラットフォーム間でのコード共有 {id="share-code-on-similar-platforms"}

多くの共通ロジックやサードパーティAPIを再利用できる可能性のある、複数のネイティブターゲットを作成する必要が生じることはよくあります。

たとえば、iOSをターゲットとする典型的なマルチプラットフォームプロジェクトでは、2つのiOS関連ターゲットがあります。1つはiOS ARM64デバイス用、もう1つはx64シミュレーター用です。これらにはプラットフォーム固有の個別のソースセットがありますが、実際にはデバイス用とシミュレーター用で異なるコードが必要になることはめったになく、依存関係もほぼ同じです。そのため、iOS固有のコードはそれらの間で共有できます。

明らかに、このような構成では、2つのiOSターゲット用の共有ソースセットを持ち、iOSデバイスとシミュレーターの両方に共通する任意のAPIを直接呼び出すことができるKotlin/Nativeコードを用意することが望ましいでしょう。

このような場合、[階層構造](multiplatform-hierarchy.md)を利用して、以下のいずれかの方法でプロジェクト内のネイティブターゲット間でコードを共有できます。

* [デフォルトの階層テンプレートを使用する](multiplatform-hierarchy.md#default-hierarchy-template)
* [階層構造を手動で設定する](multiplatform-hierarchy.md#manual-configuration)

詳細については、[ライブラリでのコード共有](#share-code-in-libraries)および[プラットフォーム固有のライブラリの連携](#connect-platform-specific-libraries)を参照してください。

## ライブラリでのコード共有 {id="share-code-in-libraries"}

階層的なプロジェクト構造のおかげで、ライブラリもターゲットのサブセットに対して共通APIを提供できます。[ライブラリが公開される](multiplatform-publish-lib-setup.md)と、中間ソースセット（intermediate source set）のAPIがプロジェクト構造に関する情報とともにライブラリ成果物（アーティファクト）に埋め込まれます。このライブラリを使用すると、プロジェクトの中間ソースセットは、各ソースセットのターゲットで利用可能なライブラリのAPIにのみアクセスします。

たとえば、`kotlinx.coroutines` リポジトリの以下のソースセット階層を確認してください。

![ライブラリの階層構造](lib-hierarchical-structure.svg)

`concurrent` ソースセットは `runBlocking` 関数を宣言し、JVMおよびネイティブターゲット向けにコンパイルされます。`kotlinx.coroutines` ライブラリが階層的なプロジェクト構造で更新・公開されると、ライブラリの `concurrent` ソースセットの「ターゲットシグネチャ」と一致するため、JVMとネイティブターゲット間で共有されているソースセットからこのライブラリに依存し、`runBlocking` を呼び出すことができます。

## プラットフォーム固有のライブラリの連携 {id="connect-platform-specific-libraries"}

プラットフォーム固有の依存関係に制約されることなく、より多くのネイティブコードを共有するには、Foundation、UIKit、POSIXなどの[プラットフォームライブラリ](https://kotlinlang.org/docs/native-platform-libs.html)を使用します。これらのライブラリはKotlin/Nativeに同梱されており、デフォルトで共有ソースセット内で利用可能です。

さらに、プロジェクトで [Kotlin CocoaPods Gradle](multiplatform-cocoapods-overview.md) プラグインを使用している場合は、[`cinterop` メカニズム](https://kotlinlang.org/docs/native-c-interop.html)で取り込んだサードパーティのネイティブライブラリを操作できます。

## 次のステップ {id="what-s-next"}

* [Kotlinのexpected宣言とactual宣言のメカニズムについて読む](multiplatform-expect-actual.md)
* [階層的なプロジェクト構造の詳細を学ぶ](multiplatform-hierarchy.md)
* [マルチプラットフォームライブラリの公開を設定する](multiplatform-publish-lib-setup.md)
* [マルチプラットフォームプロジェクトにおけるソースファイルの命名に関する推奨事項を見る](https://kotlinlang.org/docs/coding-conventions.html#source-file-names)