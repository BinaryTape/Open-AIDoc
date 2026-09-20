[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing (KSP) は、Kotlin 用のソースコード生成フレームワークです。KSP API を使用すると、ソースコードに関する静的情報を調査し、それをもとに新しいコードを生成するプロセッサを作成できます。最も一般的なユースケースは、[アノテーション](annotations.md) に基づいてコードを生成することです。

KSP は、軽量なコンパイラプラグインの作成を簡素化することを目指しています。KSP を使用して構築されたコンパイラプラグインは「シンボルプロセッサ（symbol processor）」、または単に「プロセッサ」と呼ばれます。適切に定義された API によってコンパイラの変更が隠蔽されているため、プロセッサのメンテナンスに多大な労力を割く必要がありません。ただし、このアプローチにはトレードオフもあります。例えば、KSP ベースのプロセッサは、式（expression）や文（statement）を調査することはできず、ソースコードを変更することもできません。

KSP ベースのプラグインの代表的なユースケースには、以下が含まれます： 
* 依存関係の注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* シリアライゼーション ([Moshi](https://github.com/square/moshi))
* データベース管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

最初の KSP ベースのプロセッサを作成する方法については、[KSP 入門](ksp-quickstart.md) を参照してください。

## 要件 {id="requirements"}

最新の KSP バージョンである %kspVersion% は、以下の依存関係バージョンをサポートしています：

| 依存関係 | 最小および最大バージョン |
| ------------------------------ | ------------------------------------------------------ |
| Kotlin Gradle plugin (KGP) | 2.2.10–2.3.x |
| Android Gradle Plugin (AGP) | 8.12.0 以降 |
| Gradle | 8.13 以降。AGP 9.0 以降の場合は Gradle 9.x を使用してください。 |
| JDK | 17 以降 |

## コンパイル時に KSP が動作する仕組み {id="how-ksp-works-during-compilation"}

KSP は、[Kotlin の文法](https://kotlinlang.org/grammar/) に基づいて、Kotlin ソースコードをシンボルの階層構造として表現します。プロセッサはこれらのシンボルを使用して、クラス、関数、プロパティ、型などの宣言を調査します。

> KSP は宣言と型情報をモデル化しますが、プロセッサに関数の本体や式へのアクセスは提供しません。
{style="note"}

KSP はコンパイルプロセスにおいて以下のように動作します：

1. KSP プロセッサがソースコードとリソースを分析する。

2. プロセッサがソースファイルまたはその他の出力を生成する。

3. Kotlin コンパイラが、元のソースコードを生成されたコードと一緒にコンパイルする。

KSP についてさらに詳しく知るには、こちらの動画（英語）をご覧ください：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP がソースファイルをどのように見るか {id="how-ksp-looks-at-source-files"}

ほとんどのプロセッサは、入力ソースコードのさまざまなプログラム構造を辿ります。
API の使用方法に入る前に、KSP の視点からファイルがどのように見えるかを確認してみましょう：

```text
KSFile
  packageName: KSName
  fileName: String
  annotations: List<KSAnnotation>  (ファイルの注釈)
  declarations: List<KSDeclaration>
    KSClassDeclaration // クラス、インターフェース、オブジェクト
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      classKind: ClassKind
      primaryConstructor: KSFunctionDeclaration
      superTypes: List<KSTypeReference>
      // 内部クラス、メンバー関数、プロパティなどを含む
      declarations: List<KSDeclaration>
    KSFunctionDeclaration // トップレベル関数
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      functionKind: FunctionKind
      extensionReceiver: KSTypeReference?
      returnType: KSTypeReference
      parameters: List<KSValueParameter>
      // ローカルクラス、ローカル関数、ローカル変数などを含む
      declarations: List<KSDeclaration>
    KSPropertyDeclaration // グローバル変数
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      extensionReceiver: KSTypeReference?
      type: KSTypeReference
      getter: KSPropertyGetter
        returnType: KSTypeReference
      setter: KSPropertySetter
        parameter: KSValueParameter
```

このビューには、ファイル内で宣言されている一般的な要素（クラス、関数、プロパティなど）がリストされています。

## KSP がプロセッサを実行する仕組み {id="how-ksp-runs-a-processor"}

KSP は、`SymbolProcessor` のインスタンスを作成するためのエントリポイントとして `SymbolProcessorProvider` の実装を使用します：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor` インターフェースには処理ロジックが含まれています。KSP は `process()` 関数を呼び出し、プロセッサがソースコード内のシンボルにアクセスするために使用する `Resolver` を提供します：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

プロセッサの実装および登録方法に関するステップバイステップのガイドについては、[KSP 入門](ksp-quickstart.md) を参照してください。

## サポートされているライブラリ {id="supported-libraries"}

以下の表は、Android で人気のライブラリと、それらの KSP サポート状況のリストです：

| ライブラリ | ステータス |
|------------------|---------------------------------------------------------------------------------------------------|
| Room | [公式サポート済み](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi | [公式サポート済み](https://github.com/square/moshi/) |
| RxHttp | [公式サポート済み](https://github.com/liujingxing/rxhttp) |
| Kotshi | [公式サポート済み](https://github.com/ansman/kotshi) |
| Lyricist | [公式サポート済み](https://github.com/adrielcafe/lyricist) |
| Lich SavedState | [公式サポート済み](https://github.com/line/lich/tree/master/savedstate) |
| gRPC Dekorator | [公式サポート済み](https://github.com/mottljan/grpc-dekorator) |
| EasyAdapter | [公式サポート済み](https://github.com/AmrDeveloper/EasyAdapter) |
| Koin Annotations | [公式サポート済み](https://github.com/InsertKoinIO/koin-annotations) |
| Glide | [公式サポート済み](https://github.com/bumptech/glide) | 
| Micronaut | [公式サポート済み](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/) |
| Epoxy | [公式サポート済み](https://github.com/airbnb/epoxy) |
| Paris | [公式サポート済み](https://github.com/airbnb/paris) |
| Auto Dagger | [公式サポート済み](https://github.com/ansman/auto-dagger) |
| SealedX | [公式サポート済み](https://github.com/skydoves/sealedx) |
| Ktorfit | [公式サポート済み](https://github.com/Foso/Ktorfit) |
| Mockative | [公式サポート済み](https://github.com/mockative/mockative) |
| Kotest | [公式サポート済み](https://github.com/kotest/kotest) |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323 経由でサポート](https://github.com/airbnb/DeepLinkDispatch/pull/323) |
| Dagger | [アルファ](https://dagger.dev/dev-guide/ksp) |
| Motif | [アルファ](https://github.com/uber/motif) |
| Hilt | [進行中](https://dagger.dev/dev-guide/ksp) |
| Auto Factory | [未対応](https://github.com/google/auto/issues/982) |

## その他のリソース {id="other-resources"}

* [KSP 入門](ksp-quickstart.md)
* [例 (Examples)](ksp-examples.md)
* [KSP がどのように Kotlin コードをモデル化するか](ksp-additional-details.md)
* [Java アノテーションプロセッサ作成者のためのリファレンス](ksp-reference.md)
* [インクリメンタル処理に関するメモ](ksp-incremental.md)
* [マルチラウンド処理に関するメモ](ksp-multi-round.md)
* [マルチプラットフォームプロジェクトでの KSP](ksp-multiplatform.md)
* [コマンドラインからの KSP の実行](ksp-command-line.md)