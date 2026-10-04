[//]: # (title: KSPがKotlinコードをモデル化する仕組み)
[//]: # (description: KSP APIがシンボルの階層構造を通じてKotlinソースコードをどのようにモデル化するかを学びます。)

KSPはソースコードをシンボルの階層構造として表現します。プロセッサーはこの階層を辿ることで、ソースコードの宣言、型、アノテーション、およびその他の要素を検査できます。
以下のトップレベル関数について考えてみましょう。

```Kotlin
import com.example.annotations.HelloWorldAnnotation

@HelloWorldAnnotation
fun main() {
    helloWorld()
}
```

KSPはこの関数を以下のシンボル階層で表現します：

```None
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

この階層における `resolve()` の呼び出しは完全な型解決（type resolution）を表しています。記述された通りの型参照を検査するのとは異なり、解決を行うにはKSPがそのコンテキストを解析し、参照先の型を特定する必要があります。この追加の解析により、型解決はKSP APIの中で最も負荷の高い（コストのかかる）操作の1つとなっています。以降で、型解決がどのように機能し、いつ使用すべきかについて解説します。

## 型解決 {id="type-resolution"}

シンボル階層内の一部のプロパティ（`annotationType` や `returnType` など）は `KSTypeReference` として表現されます。プロセッサーはこれらの参照を直接検査することも、解決して基礎となる型に関する詳細な情報にアクセスすることもできます。

`KSFunctionDeclaration.returnType` や `KSAnnotation.annotationType` のように、型を参照するプロパティは `KSTypeReference` を返します。

```Kotlin
interface KSFunctionDeclaration : ... {
    val returnType: KSTypeReference?
    // ...
}

interface KSTypeReference : KSAnnotated, KSModifierListOwner {
    val element: KSReferenceElement?
    fun resolve(): KSType
}
```

`KSTypeReference` は未解決の型を表し、ソースコードに記述されている型の構文的表現を保持します。その `KSReferenceElement` は、アノテーションや修飾子を含む、Kotlinの文法における対応する型要素をモデル化します。

`KSReferenceElement` は解決せずに検査できます。これは以下のいずれかになります。

* `KSClassifierReference`: `referencedName` などの情報を提供します。

* `KSCallableReference`: `receiverType`、`functionParameters`、`returnType` などの情報を提供します。

プロセッサーがソースコードと同じ型を参照するコードを生成する場合、それらの型を解決する必要はありません。代わりに、`KSTypeReference` から取得できる型名を使用して、同じ構文の型参照を生成できます。KSPは生成されたソースファイルをコンパイルに追加し、Kotlinコンパイラーが後で他のソースコードと一緒にその型参照を解決し、型チェックを行います。

`KSTypeReference.resolve()` は参照を解決して `KSType` に変換し、これによって型を定義している宣言にアクセスできるようになります。

```Kotlin
val ksTypeReference = functionDeclaration.returnType ?: return
val ksType: KSType = ksTypeReference.resolve()
val ksDeclaration: KSDeclaration = ksType.declaration
```

関数型の参照については、ほとんどの情報がすでに `KSCallableReference` から取得可能です。関数型を解決すると `Function0`、`Function1`、およびその関連ファミリーの型が生成されますが、通常は解決する必要はありません。ただし、解決によって関数のプロトタイプの同一性など、追加情報が得られる場合があります。

### いつ型を解決すべきか {id="when-to-resolve-types"}

型解決はKSP APIにおいて最もコストの高い操作の1つです。不要な解決を避けるため、KSPは通常、型参照を暗黙的に解決することはありません。代わりに、プロセッサーが解決された型を必要とする場合に、明示的に `KSTypeReference.resolve()` を呼び出してください。

可能な場合は、型を解決する前に `KSReferenceElement` を検査してください。例えば、`KSClassifierReference.referencedName()` を使用して、プロセッサーに関係のない参照をフィルタリングします。

プロセッサーが型を解決する必要があるかどうかは、必要とする情報によって異なります。以下の例では、解決ありと解決なしで同じプロパティ型を検査することにより、両方のアプローチを比較しています。プロセッサープロバイダーは、`resolveTypes` オプションを使用してどのアプローチを使用するかを選択します。

```Kotlin
import java.sql.Date as SqlDate

val birthday: SqlDate? = null
val names: List<String> = emptyList()
```

```Kotlin
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
                // 一度解決し、結果の型を再利用します。
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

`resolveTypes = false` の場合、関連する出力は次のようになります。

```Kotlin
birthday: writtenName=SqlDate, arguments=0
names: writtenName=List, arguments=1
```

`resolveTypes = true` の場合、出力は次のようになります。

```Kotlin
birthday: declaration=java.sql.Date, nullability=NULLABLE
names: declaration=kotlin.collections.List, nullability=NOT_NULL
```

解決を行わない場合、プロセッサーは型名や型引数などの構文情報を検査できます。例えば、ソースコードに記述された通りのインポートエイリアス `SqlDate` を確認できます。解決後は、完全修飾宣言名（fully qualified declaration name）やnull許容性（nullability）など、型に関する意味情報（セマンティック情報）にアクセスできます。

## KSPモデルのリファレンス {id="ksp-model-reference"}

以下の図は、主要なKSP API型間の関係を示しています。これはIntelliJ IDEAのクラス図機能を使用して、KSP APIのソースから生成されました。

![KSP 2モデルの完全なクラス図](ksp-class-diagram.svg){thumbnail="true" width="800" thumbnail-same-file="true"}

> [フルサイズの図を見る](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)。
>
{style="note"}

完全なAPI定義については、KSP GitHubリポジトリの [KSP APIのソース](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol/) を参照してください。