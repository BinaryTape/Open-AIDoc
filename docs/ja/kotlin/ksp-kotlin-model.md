[//]: # (title: KSPがKotlinコードをモデル化する方法)

<web-summary>KSP APIがKotlinソースコードをシンボルの階層としてモデル化する方法と、コストの高い分析を回避する方法について学びます。</web-summary>

KSPはソースコードをシンボルの階層として表現します。プロセッサはこの階層をナビゲートして、ソースコードの宣言、型、アノテーション、およびその他の要素を検査できます。
以下のトップレベル関数について考えてみましょう。

```kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSPはこの関数を以下のシンボル階層で表現します。

```text
KSFile: packageName = "" (root package)
└── declarations
    └── KSFunctionDeclaration: main
        ├── simpleName = "main"
        ├── qualifiedName = "main"
        ├── parentDeclaration = null
        ├── functionKind = TOP_LEVEL
        ├── annotations
        │   └── KSAnnotation: @HelloWorldAnnotation
        │       ├── shortName = "HelloWorldAnnotation"
        │       └── annotationType: KSTypeReference
        │           └── resolve().declaration.qualifiedName
        │               → com.example.annotations.HelloWorldAnnotation
        ├── parameters = []
        ├── typeParameters = []
        ├── extensionReceiver = null
        └── returnType: KSTypeReference
            └── resolve() → kotlin.Unit, NOT_NULL
```

階層内の `resolve()` の呼び出しは、完全な型解決（type resolution）を表しています。記述されたままの型参照を検査するのとは異なり、解決を行うにはKSPがそのコンテキストを分析し、参照している型を特定する必要があります。この追加の分析により、型解決はKSP APIの中で最もコストの高い処理の一つとなっています。

## 型解決 {id="type-resolution"}

`KSAnnotation.annotationType` や `KSFunctionDeclaration.returnType` など、型を参照するプロパティは `KSTypeReference` を返します。プロパティによっては、`returnType` のようにnull許容（nullable）になる場合があります。プロセッサはこれらの参照を直接検査することも、基になる型に関する詳細情報にアクセスするために解決することもできます。

```kotlin
interface KSFunctionDeclaration : ... {
    val returnType: KSTypeReference?
    // ...
}

interface KSTypeReference : KSAnnotated, KSModifierListOwner {
    val element: KSReferenceElement?
    fun resolve(): KSType
}
```

`KSTypeReference` は未解決の型を表します。これは、アノテーションや修飾子（modifiers）を含め、ソースコード内に記述された構文的な型の表現を保持します。その `element` プロパティは `KSReferenceElement` を保持し、これはKotlinの文法における対応する型要素をモデル化したものです。

`KSReferenceElement` は解決せずに検査できます。最も一般的な参照要素の種類は以下のとおりです。

* `KSClassifierReference`: `referencedName()` などの情報を提供します。
* `KSCallableReference`: `receiverType`、`functionParameters`、`returnType` などの情報を提供します。

プロセッサがソースコードと同じ型を参照するコードを生成する場合、それらの型を解決する必要はありません。代わりに、`KSTypeReference` から取得できる型名を使用して、同じ構文的な型参照を生成できます。KSPは生成されたソースファイルをコンパイル対象に追加し、後でKotlinコンパイラが残りのソースコードと一緒にその型参照を解決し、型チェックを行います。

`KSTypeReference.resolve()` は参照を解決して `KSType` を返します。これにより、その型を定義している宣言にアクセスできるようになります。

```kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

関数型参照の場合、ほとんどの情報はすでに `KSCallableReference` から利用可能です。関数型を解決すると `Function0`、`Function1`、およびその関連ファミリの型が生成されますが、通常は解決する必要はありません。ただし、解決を行うことで関数のプロトタイプの同一性など、追加の情報を取得できます。

### 型を解決すべきタイミング {id="when-to-resolve-types"}

型解決はKSP APIの中で最もコストの高い処理の一つです。不要な解決を避けるため、KSPは通常、型参照を暗黙的に解決しません。プロセッサで解決済みの型が必要な場合は、代わりに明示的に `KSTypeReference.resolve()` を呼び出してください。

可能な場合は、型を解決する前に `KSReferenceElement` を検査してください。例えば、`KSClassifierReference.referencedName()` を使用して、プロセッサに関係のない参照をフィルタリングします。

プロセッサが型を解決する必要があるかどうかは、必要とする情報によって決まります。以下の例では、解決ありと解決なしの両方で同じプロパティの型を検査し、両方のアプローチを比較します。入力として以下のトップレベルプロパティを使用します。

```kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

プロセッサプロバイダは、どちらのアプローチを使用するかを選択するために `resolveTypes` オプションをプロセッサに渡します。

```kotlin
import com.google.devtools.ksp.processing.*
import com.google.devtools.ksp.symbol.*

class TypeInventoryProcessor(
    private val logger: KSPLogger,
    private val resolveTypes: Boolean,
) : SymbolProcessor {

    override fun process(resolver: Resolver): List<KSAnnotated> {
        val deferred = mutableListOf<KSAnnotated>()

        // この例ではトップレベルプロパティのみを検査します。
        val properties = resolver.getAllFiles()
            .flatMap { it.declarations }
            .filterIsInstance<KSPropertyDeclaration>()

        for (property in properties) {
            val name = property.simpleName.asString()
            val reference = property.type

            if (!resolveTypes) {
                // 明示的に解決せずに参照を検査します。
                val element =
                    reference.element as? KSClassifierReference ?: continue

                logger.info(
                    "$name: writtenName=${element.referencedName()}, " +
                        "arguments=${element.typeArguments.size}",
                    property,
                )
            } else {
                // 参照を一度解決し、得られた型を再利用します。
                val type = reference.resolve()

                if (type.isError) {
                    deferred += property
                    continue
                }

                logger.info(
                    "$name: declaration=" +
                        "${type.declaration.qualifiedName?.asString()}, " +
                        "nullability=${type.nullability}",
                    property,
                )
            }
        }
        return deferred
    }
}
```

`resolveTypes = false` の場合、出力は以下のようになります。

```text
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

`resolveTypes = true` の場合、出力は以下のようになります。

```text
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

解決を行わない場合、プロセッサは型名や型引数などの構文情報を検査できます。例えば、ソースコードに記述されたとおりにインポートされたエイリアス `SqlDate` を処理します。解決後、プロセッサは完全修飾宣言名やnull許容性など、型に関する意味論的（セマンティック）な情報にアクセスできます。

## KSPモデルリファレンス {id="ksp-model-reference"}

次の図は、主要なKSP API型間の関係を示しています。

![KSP 2モデルの完全なクラス図。](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

> [フルサイズの図を見る](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="tip"}

完全なAPI定義については、KSP GitHubリポジトリの [KSP APIソース](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/) を参照してください。

## 関連項目 {id="see-also"}

* [KSP入門](ksp-quickstart.md) で、プロジェクトにプロセッサを追加する方法や独自のプロセッサを作成する方法を学びます。
* [Javaアノテーション処理からKSPへのリファレンス](ksp-reference.md) で、Javaのアノテーション処理APIに相当するKSPの機能を確認できます。
* KSPが型解決を追跡して [どのファイルを再処理するかを決定する](ksp-incremental.md#dirtiness-propagation) 方法を学びます。
* KSPリポジトリ内の [サンプルプロジェクト](https://github.com/google/ksp/tree/main/examples) を確認してください。
* Kotlin by JetBrains YouTubeチャンネルの [Kotlin Symbol Processing (KSP)](https://www.youtube.com/watch?v=bv-VyGM3HCY) の動画を視聴してください。