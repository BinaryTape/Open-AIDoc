[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing（KSP）は、Kotlin向けのソースコード生成フレームワークです。KSP APIを使用すると、ソースコードに関する静的情報を検査し、それをもとに新しいコードを生成するプロセッサーを作成できます。最も一般的なユースケースは、[アノテーション](annotations.md)に基づいたコード生成です。

KSPは、軽量なコンパイラープラグインの作成を簡素化することを目的としています。KSPで構築されたコンパイラープラグインは、シンボルプロセッサー（symbol processor）、または略してプロセッサーと呼ばれます。KSPの明確に定義されたAPIがコンパイラーの内部変更を隠蔽するため、プロセッサーのメンテナンスに多くの労力を費やす必要がありません。ただし、このアプローチにはトレードオフもあります。例えば、KSPベースのプロセッサーは式や文を検査することはできず、ソースコード自体を変更することもできません。

KSPベースのプラグインの代表的なユースケースには、以下のようなものがあります。
* 依存性注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* シリアライゼーション ([Moshi](https://github.com/square/moshi))
* データベース管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

最初のKSPベースのプロセッサーを作成する方法については、[KSP入門](ksp-quickstart.md)を参照してください。

## 必要条件 {id="requirements"}

最新のKSPバージョン（%kspVersion%）は、以下の依存関係バージョンをサポートしています：

| 依存関係 | 最小および最大バージョン |
|-----------------------------|------------------------------------------------------|
| Kotlin Gradleプラグイン (KGP)  | 2.3.20–2.4.x |
| Android Gradleプラグイン (AGP) | 8.13.0以降 |
| Gradle | 8.13以降。AGP 9.0以降の場合はGradle 9.xを使用。 |
| JDK | 17以降 |

## コンパイル時のKSPの動作 {id="how-ksp-works-during-compilation"}

KSPは、[Kotlin文法](https://kotlinlang.org/grammar/)に基づいてKotlinソースコードをシンボルの階層として表現します。プロセッサーはこれらのシンボルを使用して、クラス、関数、プロパティ、型などの宣言を検査します。

> KSPは宣言と型情報をモデル化しますが、プロセッサーに式や関数本体へのアクセスは提供しません。
{style="note"}

KSPはコンパイルプロセスにおいて以下のように動作します：

1. KSPプロセッサーがソースコードとリソースを解析します。

2. プロセッサーがソースファイルやその他の出力を生成します。

3. Kotlinコンパイラーが、元のソースコードを生成されたコードと一緒にコンパイルします。

KSPの詳細については、こちらの動画をご覧ください：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSPによるプロセッサーの実行方法 {id="how-ksp-runs-a-processor"}

KSPは、`SymbolProcessor`インスタンスを作成するためのエントリーポイントとして`SymbolProcessorProvider`の実装を使用します：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor`インターフェースには処理ロジックが含まれます。KSPは`process()`関数を呼び出し、プロセッサーがソースコード内のシンボルにアクセスするために使用する`Resolver`を提供します：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

プロセッサーの実装および登録方法に関するステップバイステップのガイドについては、[KSP入門](ksp-quickstart.md)を参照してください。

## サポートされているライブラリ {id="supported-libraries"}

以下の表は、Androidの主要なライブラリと、それぞれのKSPサポート状況を示しています：

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
| Dagger | [Alpha](https://dagger.dev/dev-guide/ksp) |
| Motif | [Alpha](https://github.com/uber/motif) |
| Hilt | [対応中](https://dagger.dev/dev-guide/ksp) |
| Auto Factory | [未サポート](https://github.com/google/auto/issues/982) |

## その他のリソース {id="other-resources"}

* [KSP入門](ksp-quickstart.md)
* [KSPによるKotlinコードのモデル化](ksp-kotlin-model.md)
* [Javaアノテーションプロセッサー作者向けリファレンス](ksp-reference.md)
* [インクリメンタル処理に関する注意事項](ksp-incremental.md)
* [マルチラウンド処理に関する注意事項](ksp-multi-round.md)
* [マルチプラットフォームプロジェクトにおけるKSP](ksp-multiplatform.md)
* [コマンドラインからのKSPの実行](ksp-command-line.md)