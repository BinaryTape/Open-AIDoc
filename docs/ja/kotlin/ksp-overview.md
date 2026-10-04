[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing（KSP）は、Kotlin向けのソースコード生成フレームワークです。KSP APIを使用することで、ソースコードに関する静的情報を検査し、それに基づいて新しいコードを生成するプロセッサを作成できます。最も一般的なユースケースは、[アノテーション](annotations.md)に基づくコード生成です。

KSPは、軽量なコンパイラプラグインの作成を簡素化することを目的としています。KSPで構築されたコンパイラプラグインは「シンボルプロセッサ（symbol processor）」、または単に「プロセッサ」と呼ばれます。KSPの明確に定義されたAPIによってコンパイラの変更が隠蔽されるため、プロセッサのメンテナンスに多くの労力を費やす必要がありません。ただし、このアプローチにはトレードオフもあります。例えば、KSPベースのプロセッサは式（expression）や文（statement）を検査することはできず、ソースコードを変更することもできません。

KSPベースのプラグインの代表的なユースケースには、以下のようなものがあります。
* 依存性注入（[Dagger](https://dagger.dev/dev-guide/ksp)）
* シリアライゼーション（[Moshi](https://github.com/square/moshi)）
* データベース管理（[Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02)）

最初のKSPベースのプロセッサを作成する方法については、[KSPの導入（Getting started with KSP）](ksp-quickstart.md)を参照してください。

## 必要要件 {id="requirements"}

最新のKSPバージョン（%kspVersion%）は、以下の依存関係バージョンをサポートしています。

| 依存関係 | 最小および最大バージョン |
| ------------------------------ | ------------------------------------------------------ |
| Kotlin Gradle plugin (KGP) | 2.2.10–2.3.x |
| Android Gradle Plugin (AGP) | 8.12.0以降 |
| Gradle | 8.13以降。AGP 9.0以降の場合はGradle 9.xを使用してください。 |
| JDK | 17以降 |

## コンパイル時のKSPの仕組み {id="how-ksp-works-during-compilation"}

KSPは、[Kotlin文法（Kotlin grammar）](https://kotlinlang.org/grammar/)に基づいて、Kotlinソースコードをシンボルの階層として表現します。プロセッサはこれらのシンボルを使用して、クラス、関数、プロパティ、型などの宣言を検査します。

> KSPは宣言と型情報をモデル化しますが、プロセッサに式や関数本体へのアクセスは提供しません。
{style="note"}

KSPはコンパイルプロセスにおいて次のように動作します。

1. KSPプロセッサがソースコードとリソースを解析します。

2. プロセッサがソースファイルやその他の出力を生成します。

3. Kotlinコンパイラが、元のソースコードと生成されたコードを一緒にコンパイルします。

KSPの詳細については、こちらの動画をご覧ください。

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSPによるプロセッサの実行方法 {id="how-ksp-runs-a-processor"}

KSPは、`SymbolProcessor`インスタンスを作成するためのエントリポイントとして`SymbolProcessorProvider`の実装を使用します。

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor`インターフェースには処理ロジックが含まれます。KSPは`process()`関数を呼び出し、プロセッサがソースコード内のシンボルにアクセスするために使用する`Resolver`を提供します。

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

プロセッサの実装および登録方法に関するステップバイステップのガイドについては、[KSPの導入](ksp-quickstart.md)を参照してください。

## サポートされているライブラリ {id="supported-libraries"}

以下の表は、Androidで人気のあるライブラリと、それぞれのKSPサポート状況を示しています。

| ライブラリ | ステータス |
|------------------|---------------------------------------------------------------------------------------------------|
| Room | [公式サポート](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi | [公式サポート](https://github.com/square/moshi/) |
| RxHttp | [公式サポート](https://github.com/liujingxing/rxhttp) |
| Kotshi | [公式サポート](https://github.com/ansman/kotshi) |
| Lyricist | [公式サポート](https://github.com/adrielcafe/lyricist) |
| Lich SavedState | [公式サポート](https://github.com/line/lich/tree/master/savedstate) |
| gRPC Dekorator | [公式サポート](https://github.com/mottljan/grpc-dekorator) |
| EasyAdapter | [公式サポート](https://github.com/AmrDeveloper/EasyAdapter) |
| Koin Annotations | [公式サポート](https://github.com/InsertKoinIO/koin-annotations) |
| Glide | [公式サポート](https://github.com/bumptech/glide) | 
| Micronaut | [公式サポート](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/) |
| Epoxy | [公式サポート](https://github.com/airbnb/epoxy) |
| Paris | [公式サポート](https://github.com/airbnb/paris) |
| Auto Dagger | [公式サポート](https://github.com/ansman/auto-dagger) |
| SealedX | [公式サポート](https://github.com/skydoves/sealedx) |
| Ktorfit | [公式サポート](https://github.com/Foso/Ktorfit) |
| Mockative | [公式サポート](https://github.com/mockative/mockative) |
| Kotest | [公式サポート](https://github.com/kotest/kotest) |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323によりサポート](https://github.com/airbnb/DeepLinkDispatch/pull/323) |
| Dagger | [アルファ](https://dagger.dev/dev-guide/ksp) |
| Motif | [アルファ](https://github.com/uber/motif) |
| Hilt | [対応進行中](https://dagger.dev/dev-guide/ksp) |
| Auto Factory | [未サポート](https://github.com/google/auto/issues/982) |

## その他のリソース {id="other-resources"}

* [KSPの導入](ksp-quickstart.md)
* [KSPによるKotlinコードのモデル化の仕組み](ksp-kotlin-model.md)
* [Javaアノテーションプロセッサ作成者向けリファレンス](ksp-reference.md)
* [インクリメンタル処理に関する注意事項](ksp-incremental.md)
* [マルチラウンド処理に関する注意事項](ksp-multi-round.md)
* [マルチプラットフォームプロジェクトにおけるKSP](ksp-multiplatform.md)
* [コマンドラインからのKSPの実行](ksp-command-line.md)