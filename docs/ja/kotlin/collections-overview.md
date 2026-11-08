[//]: # (title: コレクションの概要)

Kotlin標準ライブラリは、コレクションを操作するための包括的なツールセットを提供しています。コレクションとは、解決しようとしている問題に関連し、通常まとめて処理されるアイテムのグループです。コレクションには通常、同じ型またはそのサブタイプの要素が含まれます。コレクション内のオブジェクトは、_要素_（elements）または_アイテム_（items）と呼ばれます。

コレクションAPIはジェネリックであるため、組み込み型やユーザー定義型に対して同じ関数やインターフェースを使用できます。`kotlin.collections` パッケージには、コレクションのインターフェースと関連する関数が含まれています。

Kotlinは主に3つのコレクション型を提供しています：

* [_List_](collection-types.md#list) は順序付けられたコレクションです。インデックスによるアクセスをサポートし、重複した要素を含むことができます。例えば、電話番号の各桁を格納するためにリストを使用できます。
* [_Set_](collection-types.md#set) は一意な要素のコレクションです。反復処理（イテレーション）の順序は保証されませんが、特定の実装では挿入順序を保持したり、要素をソートされた状態に保ったりすることができます。例えば、宝くじの番号を格納するためにセットを使用できます。
* [_Map_](collection-types.md#map)（または_ディクショナリ_）はキーと値のペアのセットです。各キーは一意であり、1つの値にマッピングされます。例えば、従業員IDとその役職を関連付けるためにマップを使用できます。

Kotlinは [`ArrayDeque`](collection-types.md#arraydeque) も提供しています。これはキューまたはスタックとして使用できる両端キュー（double-ended queue）です。

> 配列はコレクションの一種ではありません。配列とコレクションの使い分けについては、[配列を使用するタイミング](arrays.md#when-to-use-arrays)を参照してください。
>
{style="note"}

`List`、`Set`、`Map` について詳しく知るには、該当するセクションを読むか、KotlinデベロッパーアドボケイトであるSebastian Aignerによる動画をご覧ください：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

## 読み取り専用コレクションと可変コレクション {id="read-only-and-mutable-collections"}

それぞれの主要なコレクション型には、`List` などの読み取り専用インターフェースと、対応する `MutableList` などの可変（mutable）インターフェースがあります。読み取り専用インターフェースは要素にアクセスするための操作を提供し、可変インターフェースは要素の追加、削除、更新を行うための操作を追加します。

呼び出し側がコレクションを変更する必要がない場合は、読み取り専用インターフェースを優先して使用してください。これにより、APIにおいて意図が明確になり、そのインターフェースを介した意図しない変更を防ぐことができます。対照的に、不変（immutable）コレクションは作成後に要素を変更することができません。不変かつ永続的な実装には、[`kotlinx-collections-immutable`](https://kotlinlang.org/api/kotlinx.collections.immutable/) ライブラリを使用してください。

インターフェースは次のような階層を形成しています：

![Collection interfaces hierarchy](collections-diagram.png){width="500"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) は、`List` と `Set` の共通のスーパーインターフェースです。コレクションのサイズを確認するなどの操作を提供します。`Collection` は、要素の反復処理をサポートする `Iterable<T>` インターフェースを継承しています。`Map` は `Collection` を継承していません。

異なるコレクション型に適用できる関数のパラメータとして `Collection` を使用できます。型固有の操作を行うには、[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) や [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) など、`Collection` を継承するインターフェースを使用してください。