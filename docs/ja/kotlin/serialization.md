[//]: # (title: シリアライゼーション)

**シリアライゼーション**（Serialization）とは、アプリケーションが使用するデータを、ネットワーク経由で転送したりデータベースやファイルに保存したりできる形式に変換するプロセスのことです。デシリアライゼーション（Deserialization）はその逆で、外部データをランタイムオブジェクトへと復元するプロセスです。これらはどちらも、サードパーティとデータをやり取りするほとんどのアプリケーションにとって不可欠です。

[JSON](https://www.json.org/json-en.html) や [Protocol Buffers](https://protobuf.dev/) など、特に広く普及しているデータシリアライゼーションフォーマットもあります。これらのフォーマットは言語やプラットフォームに依存しないため、任意のモダンな言語で書かれたシステム間でのデータ交換に使用できます。Kotlin では、複数のプラットフォームおよびデータフォーマットをサポートする [`kotlinx.serialization` ライブラリ](#kotlin-serialization-libraries) を通じてこの機能を提供しています。

Kotlin でのシリアライゼーションを初めて扱う場合は、[シリアライゼーション入門（Get Started with Serialization）](serialization-get-started.md) チュートリアルから始めることをお勧めします。このチュートリアルでは、プロジェクトへの Kotlin シリアライゼーションのセットアップ手順を説明し、最初のクラスをシリアライズおよびデシリアライズする方法を紹介します。

<a href="serialization-get-started.md"><img src="get-started-serialization.svg" width="700" alt="Get started with serialization" style="block"/></a>

## Kotlin シリアライゼーションライブラリ {id="kotlin-serialization-libraries"}

Kotlin シリアライゼーションは、JVM、JavaScript、Native を含むすべてのプラットフォームをサポートしています。ターゲットプラットフォームに関係なく、同じ[依存関係の宣言](serialization-get-started.md#add-plugins-and-dependencies)を使用できます。

Kotlin シリアライゼーションは、さまざまなシリアライゼーションフォーマットライブラリを通じて、JSON、CBOR、Protocol Buffers などの多様なシリアライゼーションフォーマットをサポートしています。これらのライブラリは `kotlinx-serialization-core` ライブラリを基盤として構築されています。サポートされているシリアライゼーションフォーマットの全リストについては、[サポートされているシリアライゼーションフォーマット](#supported-serialization-formats)を参照してください。

すべての `kotlinx.serialization` フォーマットライブラリは `org.jetbrains.kotlinx:` グループに属しており、名前は `kotlinx-serialization-` で始まり、シリアライゼーションフォーマットを表す接尾辞が付きます。例えば：

* `org.jetbrains.kotlinx:kotlinx-serialization-json` は JSON シリアライゼーションを提供します。
* `org.jetbrains.kotlinx:kotlinx-serialization-cbor` は CBOR シリアライゼーションを提供します。

`kotlinx.serialization` ライブラリは、Kotlin とは独立した独自のバージョニングを採用しています。最新のリリースバージョンは [GitHub](https://github.com/Kotlin/kotlinx.serialization/releases) で確認できます。

> 特定のフォーマットライブラリを使用しない場合（例えば、独自のシリアライゼーションフォーマットを作成する場合など）は、依存関係として `kotlinx-serialization-core` ライブラリを使用してください。
>
{style="tip"}

## サポートされているシリアライゼーションフォーマット {id="supported-serialization-formats"}

`kotlinx.serialization` プロジェクトは、さまざまなシリアライゼーションフォーマット用のライブラリを提供しています。

| フォーマット | アーティファクト ID | プラットフォーム | ステータス |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------|--------------|
| [JSON](https://www.json.org/json-en.html)            | [`kotlinx-serialization-json`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#json)             | サポートされているすべてのプラットフォーム | Stable       |
| [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) | [`kotlinx-serialization-hocon`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#hocon)           | JVM のみ                | Experimental |
| [Protocol Buffers](https://protobuf.dev/)            | [`kotlinx-serialization-protobuf`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#protobuf)     | サポートされているすべてのプラットフォーム | Experimental |
| [CBOR](https://cbor.io/)                             | [`kotlinx-serialization-cbor`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#cbor)             | サポートされているすべてのプラットフォーム | Experimental |
| [Properties](https://en.wikipedia.org/wiki/.properties) | [`kotlinx-serialization-properties`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#properties) | サポートされているすべてのプラットフォーム | Experimental |

JSON シリアライゼーションライブラリ（`kotlinx-serialization-json`）を除くすべてのシリアライゼーションフォーマットライブラリは、[Experimental（実験的）](components-stability.md#stability-levels-explained) です。それらの API はいつでも変更される可能性があります。
JSON シリアライゼーションの詳細については、[JSON シリアライゼーションの概要](serialization-configure-json-serialization.md)を参照してください。

また、[YAML](https://yaml.org/) や [Apache Avro](https://avro.apache.org/) など、さらに多くのシリアライゼーションフォーマットをサポートするコミュニティ主導のライブラリも存在します。

代替フォーマットおよびカスタムの実験的シリアライゼーションフォーマットの詳細については、[カスタムシリアライゼーションフォーマット](serialization-custom-formats.md)を参照してください。

## サポートされているシリアライゼーション型 {id="supported-serialization-types"}

Kotlin シリアライゼーションは、すべてのプリミティブ型や、`List` 型など Kotlin 標準ライブラリのほとんどの複合型を含む、さまざまな組み込み型をサポートしています。
詳細については、[組み込み型のシリアライズ](serialization-serialize-builtin-types.md)を参照してください。

さらに、`@Serializable` アノテーションが付加されたクラスはシリアライゼーションを完全にサポートしており、クラスインスタンスと JSON などのフォーマットとの相互変換が可能です。
詳細については、[クラスのシリアライズ](serialization-customization-options.md)を参照してください。

## 次のステップ {id="what-s-next"}

* [シリアライゼーション入門チュートリアル](serialization-get-started.md)で Kotlin シリアライゼーションの基本を学ぶ。
* Kotlin シリアライゼーションが[プリミティブ、コレクション、その他の組み込み型](serialization-serialize-builtin-types.md)をどのように処理するかを確認する。
* [JSON シリアライゼーションの概要](serialization-configure-json-serialization.md)で、より複雑な JSON シリアライゼーションのシナリオを探索する。
* [クラスのシリアライズ](serialization-customization-options.md)を確認し、クラスをシリアライズする方法や `@Serializable` アノテーションのデフォルトの動作を変更する方法を学ぶ。
* [シリアライザーの作成と使用](serialization-create-and-use-serializers.md)で、生成されたシリアライザーを取得する方法、カスタムシリアライザーを作成する方法、およびシリアライザーを適用する方法を学ぶ。
* [ポリモーフィックなクラスのシリアライズ](serialization-polymorphism.md)で、共通の基底型を通じて異なる型をシリアライズする方法を確認する。
* [カスタムシリアライゼーションフォーマット](serialization-custom-formats.md)で、カスタムフォーマットの作成方法を学ぶ。
* [CBOR](serialization-cbor.md) や [ProtoBuf](serialization-protobuf.md) などの実験的シリアライゼーションフォーマットを探索する。