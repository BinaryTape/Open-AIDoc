[//]: # (title: マルチラウンド処理)

<web-summary>KSP が複数のラウンドでプロセッサーを実行する仕組みや、プロセッサーがシンボルを後続のラウンドへと延期（defer）する方法について学びます。</web-summary>

KSP はプロセッサーを複数のラウンドで実行します。各ラウンドにおいて、プロセッサーはそれ以前のラウンドで生成されたソースファイルを使用できます。

シンボルを次のラウンドに延期するには、`SymbolProcessor.process()` からそれらを `List<KSAnnotated>` として返します。KSP は次のラウンドでこれらのシンボルを再びプロセッサーに渡します。

無効なシンボルを延期するには、`KSAnnotated.validate()` を使用してフィルタリングします。例えば以下のようになります。

```kotlin
override fun process(resolver: Resolver): List<KSAnnotated> {
    val symbols = resolver.getSymbolsWithAnnotation("com.example.annotation.Builder")
    val result = symbols.filter { !it.validate() }.toList()
    symbols
        .filter { it is KSClassDeclaration && it.validate() }
        .forEach { it.accept(BuilderVisitor(), Unit) }
    return result
}
```

> KSP リポジトリにある [マルチラウンド処理](https://github.com/google/ksp/blob/main/examples/playground/processors/src/main/kotlin/BuilderProcessor.kt) の完全な例を参照してください。
>
{style="note"}

マルチラウンド処理は、あるラウンド全体で新しいファイルが一切生成されなくなったときに終了します。延期されたシンボルが未処理のまま残っている場合、KSP は延期されたシンボルが残っているプロセッサーごとにエラーを記録します。

## シンボルを次のラウンドに延期する {id="defer-symbols-to-the-next-round"}

プロセッサーは、他のプロセッサーからの追加情報が必要な場合に、シンボルを後のラウンドへと延期できます。プロセッサーは、必要な情報が利用可能になるまで、複数のラウンドにわたってシンボルの延期を継続できます。情報が利用可能になったら、プロセッサーはそのシンボルを処理できます。

シンボルの延期は、以下の場合にのみ行ってください。

* シンボルを処理する前に追加情報が必要である場合。
* シンボルがソースコードに由来する場合。

    > クラスパスに由来するシンボルは延期しないでください。KSP はこれらを自動的に除外します。
    >
    {style="note"}

例えば、アノテーションが付けられたクラスのビルダーを生成するプロセッサーでは、すべてのコンストラクタパラメータの型が具体的な型に解決される必要がある場合があります。最初のラウンドでは、パラメータ型のうちの1つが解決できない可能性があります。後のラウンドでは、その間に生成されたファイルによって解決可能になることがあります。その時点でプロセッサーはそのクラスを処理できます。

## シンボルの検証 {id="validate-symbols"}

検証（Validation）は、シンボルを後のラウンドへ延期すべきかどうかを判断するのに役立ちます。プロセッサーは、シンボルを正しく処理するために必要な情報を定義する必要があります。

> 検証には多くの場合、型解決が必要となり、負荷が高くなる可能性があります。シンボルの処理に必要な情報のみをチェックするようにしてください。
>
{style="tip"}

デフォルトの検証動作がすべてのユースケースに適しているとは限りません。検証をカスタマイズするには、`KSValidateVisitor` を使用し、検証対象のシンボルを選択する `predicate` ラムダを指定します。

カスタム検証を実装する際は、`KSType.isError` を使用して型が有効かどうかを判定します。`isError` が `true` の場合、KSP はその型を解決できませんでした。この情報を利用して、処理を後のラウンドに延期するかどうかを決定します。

## ファイルとシンボルへのアクセス {id="accessing-files-and-symbols"}

新しく生成されたファイルと既存のファイルは、両方とも `Resolver` を介してアクセスできます。

KSP はファイルにアクセスするための2つの API を提供しています。

* `Resolver.getAllFiles()` は、以前から存在していたファイルと新しく生成されたファイルの両方のリストを返します。
* `Resolver.getNewFiles()` は、前のラウンドで生成されたファイルのみを返します。

関連するシンボルを取得するための主要なエントリポイントとして、`Resolver.getSymbolsWithAnnotation()` を使用してください。

各ラウンドにおいて、`Resolver.getSymbolsWithAnnotation()` は新しく生成されたファイルからのシンボルと、前のラウンドから延期されたシンボルのみを返します。これにより、不要な再処理を回避できます。

## プロセッサーのインスタンス化 {id="processor-instantiation"}

KSP はプロセッサーのインスタンスを1回だけ作成します。プロセッサーインスタンス内に情報を保持し、複数のラウンドにわたって再利用することができます。

ただし、すべての KSP シンボルがラウンド間で再利用できるわけではありません。プロセッサーが新しいファイルを生成するとシンボルの解決結果が変わる可能性があり、それによって以前解決されたシンボルの有効性に影響を与えることがあります。

> 現在のラウンドでプロセッサーに渡された `Resolver` インスタンスのみを使用してください。`Resolver` を保持してラウンド間で再利用しないでください。
>
{style="note"}

## エラーと例外の処理 {id="error-and-exception-handling"}

### エラー {id="errors"}

プロセッサーは `KSPLogger.error()` を呼び出してエラーを報告します。

プロセッサーがエラーを報告すると、KSP は `SymbolProcessor.finish()` の代わりに `SymbolProcessor.onError()` を呼び出します。現在のラウンドが完了した後に処理が停止します。

そのラウンド中、他のプロセッサーは通常どおり処理を続行します。KSP はすべてのプロセッサーが現在のラウンドを終了した後にのみエラーを処理します。

### 例外 {id="exceptions"}

KSP は、KSP によってスローされた例外と、プロセッサーによってスローされた例外を区別します。どちらのタイプも処理を直ちに終了し、`KSPLogger` を通じてエラーとして記録されます。

KSP によってスローされた例外は、調査のために KSP 開発者に報告してください。[KSP issue tracker](https://github.com/google/ksp/issues) で issue を作成してください。

エラーまたは例外が発生したラウンドの終了時に、KSP はすべてのプロセッサーで `SymbolProcessor.onError()` を呼び出します。`SymbolProcessor` は `onError()` のデフォルトの no-op 実装を提供しています。カスタムのエラー処理ロジックを実装するには、このメソッドをオーバーライドしてください。

## 関連項目 {id="see-also"}

* ソースコードが変更されたときに KSP が [どのファイルを再処理するかを決定する仕組み](ksp-incremental.md) を確認してください。
* KSP が Kotlin コードをモデル化する方法と、[いつ型を解決すべきか](ksp-kotlin-model.md#when-to-resolve-types) を確認してください。