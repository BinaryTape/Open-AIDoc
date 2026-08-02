[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing (KSP) は、Kotlin 用のソースコード生成フレームワークです。KSP API を使用すると、ソースコード内の [アノテーション](annotations.md) に基づいてコードを生成するプロセッサを作成できます。

KSP は、軽量なコンパイラプラグインの作成を簡素化することを目指しています。適切に定義された API によってコンパイラの変更が隠蔽されているため、プロセッサのメンテナンスに多大な労力を割く必要がありません。ただし、このアプローチにはトレードオフもあります。例えば、KSP ベースのプロセッサは、式（expression）や文（statement）を調査することはできず、ソースコードを変更することもできません。

KSP ベースのプラグインの代表的なユースケースには、以下が含まれます： 
* 依存関係の注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* シリアライゼーション ([Moshi](https://github.com/square/moshi))
* データベース管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

最初の KSP ベースのプロセッサを作成する方法については、[KSP クイックスタート](ksp-quickstart.md) をご覧ください。

## 概要

KSP API は、Kotlin プログラムを慣用的に処理します。KSP は、拡張関数、宣言区の変異（declaration-site variance）、ローカル関数といった Kotlin 特有の機能を理解しています。また、型を明示的にモデル化し、等価性や代入互換性などの基本的な型チェックも提供します。

この API は、[Kotlin の文法](https://kotlinlang.org/grammar/) に従って、プログラム構造をシンボルレベルでモデル化します。KSP ベースのプラグインがソースプログラムを処理する際、クラス、クラスメンバー、関数、および関連するパラメータなどの構成要素にはプロセッサからアクセスできますが、`if` ブロックや `for` ループなどはアクセス対象外となります。

概念的に、KSP は Kotlin リフレクションの [KType](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) に似ています。この API を使用すると、プロセッサはクラス宣言から特定の型引数を持つ対応する型へ、またその逆へとナビゲートできます。また、型引数の置換、変異（variance）の指定、スター投影（star projections）の適用、型の NULL 許容性のマークなども可能です。

KSP の別の捉え方として、Kotlin プログラムのプリプロセッサフレームワークと考えることもできます。KSP ベースのプラグインを「シンボルプロセッサ（symbol processors）」、あるいは単に「プロセッサ」と呼ぶ場合、コンパイルにおけるデータフローは以下のステップで説明できます。

1. プロセッサがソースプログラムとリソースを読み取り、分析する。
2. プロセッサがコードまたはその他の形式の出力を生成する。
3. Kotlin コンパイラが、ソースプログラムを生成されたコードと一緒にコンパイルする。

本格的なコンパイラプラグインとは異なり、プロセッサはコードを変更することはできません。言語のセマンティクス（意味論）を変更するコンパイラプラグインは、時に非常に混乱を招くことがあります。KSP は、ソースプログラムを読み取り専用として扱うことで、その問題を回避しています。

KSP の概要については、こちらの動画（英語）でもご確認いただけます：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP がソースファイルをどのように見るか

ほとんどのプロセッサは、入力ソースコードのさまざまなプログラム構造を辿ります。API の使用方法に入る前に、KSP の視点からファイルがどのように見えるかを確認してみましょう。

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

## SymbolProcessorProvider: エントリポイント

KSP は、`SymbolProcessor` をインスタンス化するために `SymbolProcessorProvider` インターフェースの実装を必要とします。

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

また、`SymbolProcessor` は次のように定義されています。

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated> // これに注目します
    fun finish() {}
    fun onError() {}
}
```

`Resolver` は、シンボルなどのコンパイラの詳細へのアクセスを `SymbolProcessor` に提供します。すべてのトップレベル関数と、トップレベルクラス内の非ローカル関数を見つけるプロセッサは、以下のようになります。

```kotlin
class HelloFunctionFinderProcessor : SymbolProcessor() {
    // ...
    val functions = mutableListOf<KSFunctionDeclaration>()
    val visitor = FindFunctionsVisitor()

    override fun process(resolver: Resolver) {
        resolver.getAllFiles().forEach { it.accept(visitor, Unit) }
    }

    inner class FindFunctionsVisitor : KSVisitorVoid() {
        override fun visitClassDeclaration(classDeclaration: KSClassDeclaration, data: Unit) {
            classDeclaration.getDeclaredFunctions().forEach { it.accept(this, Unit) }
        }

        override fun visitFunctionDeclaration(function: KSFunctionDeclaration, data: Unit) {
            functions.add(function)
        }

        override fun visitFile(file: KSFile, data: Unit) {
            file.declarations.forEach { it.accept(this, Unit) }
        }
    }
    // ...
    
    class Provider : SymbolProcessorProvider {
        override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor = TODO()
    }
}
```

## リソース

* [クイックスタート](ksp-quickstart.md)
* [なぜ KSP を使うのか？](ksp-why-ksp.md)
* [例 (Examples)](ksp-examples.md)
* [KSP がどのように Kotlin コードをモデル化するか](ksp-additional-details.md)
* [Java アノテーションプロセッサ作成者のためのリファレンス](ksp-reference.md)
* [インクリメンタル処理に関するメモ](ksp-incremental.md)
* [マルチラウンド処理に関するメモ](ksp-multi-round.md)
* [マルチプラットフォームプロジェクトでの KSP](ksp-multiplatform.md)
* [コマンドラインからの KSP の実行](ksp-command-line.md)
* [FAQ](ksp-faq.md)

## サポートされているライブラリ

以下の表は、Android で人気のライブラリと、それらの KSP サポート状況のリストです。

| ライブラリ | ステータス |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [公式サポート済み](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi            | [公式サポート済み](https://github.com/square/moshi/)                                          |
| RxHttp           | [公式サポート済み](https://github.com/liujingxing/rxhttp)                                     |
| Kotshi           | [公式サポート済み](https://github.com/ansman/kotshi)                                          |
| Lyricist         | [公式サポート済み](https://github.com/adrielcafe/lyricist)                                    |
| Lich SavedState  | [公式サポート済み](https://github.com/line/lich/tree/master/savedstate)                       |
| gRPC Dekorator   | [公式サポート済み](https://github.com/mottljan/grpc-dekorator)                                |
| EasyAdapter      | [公式サポート済み](https://github.com/AmrDeveloper/EasyAdapter)                               |
| Koin Annotations | [公式サポート済み](https://github.com/InsertKoinIO/koin-annotations)                          |
| Glide            | [公式サポート済み](https://github.com/bumptech/glide)                                         | 
| Micronaut        | [公式サポート済み](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)       |
| Epoxy            | [公式サポート済み](https://github.com/airbnb/epoxy)                                           |
| Paris            | [公式サポート済み](https://github.com/airbnb/paris)                                           |
| Auto Dagger      | [公式サポート済み](https://github.com/ansman/auto-dagger)                                     |
| SealedX          | [公式サポート済み](https://github.com/skydoves/sealedx)                                       |
| Ktorfit          | [公式サポート済み](https://github.com/Foso/Ktorfit)                                           |
| Mockative        | [公式サポート済み](https://github.com/mockative/mockative)                                    |
| Kotest           | [公式サポート済み](https://github.com/kotest/kotest)                                          |
| DeeplinkDispatch | [airbnb/DeepLinkDispatch#323 経由でサポート](https://github.com/airbnb/DeepLinkDispatch/pull/323)  |
| Dagger           | [アルファ](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [アルファ](https://github.com/uber/motif)                                                            |
| Hilt             | [進行中](https://dagger.dev/dev-guide/ksp)                                                   |
| Auto Factory     | [未対応](https://github.com/google/auto/issues/982)                                    |