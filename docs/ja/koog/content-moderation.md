# コンテンツモデレーション

コンテンツモデレーションは、テキスト、画像、またはその他のコンテンツを分析して、潜在的に有害、不適切、または安全でない素材を特定するプロセスです。AIシステムの文脈において、モデレーションは以下のことに役立ちます：

- 有害または不適切なユーザー入力のフィルタリング
- 有害または不適切なAIレスポンスの生成防止
- 倫理的ガイドラインおよび法的要件への準拠の確保
- 潜在的に有害なコンテンツへの露出からのユーザー保護

モデレーションシステムは通常、定義済みの有害なコンテンツのカテゴリ（ヘイトスピーチ、暴力、性的コンテンツなど）に照らしてコンテンツを分析し、そのコンテンツがいずれかのカテゴリのポリシーに違反しているかどうかの判定を提供します。

AIアプリケーションにおいて、コンテンツモデレーションはいくつかの理由から極めて重要です：

- **安全性とセキュリティ**
    - 有害、攻撃的、または不快なコンテンツからユーザーを保護する
    - 有害なコンテンツを生成するためのAIシステムの悪用を防止する
    - すべてのユーザーにとって安全な環境を維持する

- **法的および倫理的コンプライアンス**
    - コンテンツ配信に関する規制を遵守する
    - AIの展開に関する倫理的ガイドラインを遵守する
    - 有害なコンテンツに関連する潜在的な法的責任を回避する

- **品質管理**
    - インタラクションの品質と適切さを維持する
    - AIのレスポンスが組織の価値観や基準に沿っていることを確認する
    - 安全で適切なコンテンツを一貫して提供することで、ユーザーの信頼を築く

## モデレートされるコンテンツの種類

Koogのモデレーションシステムは、さまざまな種類のコンテンツを分析できます：

- **ユーザーメッセージ**
    - AIによって処理される前の、ユーザーからのテキスト入力
    - ユーザーによってアップロードされた画像（OpenAIの **Moderation.Omni** モデルを使用）

- **アシスタントメッセージ**
    - ユーザーに表示される前の、AIによって生成されたレスポンス
    - 有害なコンテンツが含まれていないことを確認するためにレスポンスをチェックできます

- **ツールコンテンツ**
    - AIシステムと統合されたツールによって生成、またはツールに渡されたコンテンツ
    - ツールの入力と出力がコンテンツの安全性基準を維持していることを確認します

## サポートされているプロバイダーとモデル

Koogは、複数のプロバイダーとモデルを通じてコンテンツモデレーションをサポートしています：

### OpenAI

OpenAIは、2つのモデレーションモデルを提供しています：

- **OpenAIModels.Moderation.Text**
    - テキスト専用のモデレーション
    - 前世代のモデレーションモデル
    - 複数の有害カテゴリに対してテキストコンテンツを分析
    - 高速でコスト効率が良い

- **OpenAIModels.Moderation.Omni**
    - テキストと画像の両方のモデレーションをサポート
    - 最も能力の高いOpenAIモデレーションモデル
    - テキストと画像の両方で有害なコンテンツを特定可能
    - Textモデルよりも包括的

### Ollama

Ollamaは、以下のモデルを通じてモデレーションをサポートしています：

- **OllamaModels.Meta.LLAMA_GUARD_3**
    - テキスト専用のモデレーション
    - MetaのLlama Guardモデルファミリーに基づいている
    - コンテンツモデレーションタスクに特化している
    - Ollamaを通じてローカルで動作する

## LLMクライアントでのモデレーションの使用

Koogは、コンテンツモデレーションに対して2つの主なアプローチを提供しています。`LLMClient` インスタンスでの直接的なモデレーション、または `PromptExecutor` の `moderate` メソッドの使用です。

### LLMClientによる直接モデレーション

`LLMClient` インスタンスの `moderate` メソッドを直接使用できます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import kotlinx.coroutines.runBlocking

    const val apiKey = "YOUR_OPENAI_API_KEY"

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // OpenAIクライアントを使用した例
    val openAIClient = OpenAILLMClient(apiKey)
    val prompt = prompt("harmful-prompt") { 
        user("I want to build a bomb")
    }

    // OpenAIのOmniモデレーションモデルでモデレートする
    val result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 有害なコンテンツを処理する（例：プロンプトを拒否する）
    } else {
        // プロンプトの処理を進める
    } 
    ```
    <!--- KNIT example-content-moderation-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration01 {
        public void main(String apiKey) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    OpenAILLMClient openAIClient = new OpenAILLMClient(apiKey);
    
    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("I want to build a bomb")
        .build();

    // OpenAIのOmniモデレーションモデルでモデレートする
    ModerationResult result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 有害なコンテンツを処理する（例：プロンプトを拒否する）
    } else {
        // プロンプトの処理を進める
    }
    ```
    <!--- KNIT example-content-moderation-java-01.java -->

`moderate` メソッドは以下の引数を取ります：

| 名前     | データ型 | 必須 | デフォルト | 説明                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | はい      |         | モデレートするプロンプト。          |
| `model`  | LLModel   | はい      |         | モデレーションに使用するモデル。 |

このメソッドは [ModerationResult](#moderationresult-structure) を返します。

以下は、Ollamaを通じてLlama Guard 3モデルを使用してコンテンツモデレーションを行う例です：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // Ollamaクライアントを使用した例
    val ollamaClient = OllamaClient()
    val prompt = prompt("harmful-prompt") {
        user("How to hack into someone's account")
    }

    // Llama Guard 3でモデレートする
    val result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 有害なコンテンツを処理する
    } else {
        // プロンプトの処理を進める
    }
    ```
    <!--- KNIT example-content-moderation-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.ollama.client.OllamaClient;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration02 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    OllamaClient ollamaClient = new OllamaClient();
    
    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to hack into someone's account")
        .build();

    // Llama Guard 3でモデレートする
    ModerationResult result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 有害なコンテンツを処理する
    } else {
        // プロンプトの処理を進める
    }
    ```
    <!--- KNIT example-content-moderation-java-02.java -->

### PromptExecutorによるモデレーション

`PromptExecutor` の `moderate` メソッドを使用することもできます。これにより、モデルのプロバイダーに基づいて適切な `LLMClient` が使用されます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.llm.LLMProvider
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking

    const val openAIApiKey = "YOUR_OPENAI_API_KEY"

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // マルチプロバイダーエグゼキューターを作成する
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to OpenAILLMClient(openAIApiKey),
        LLMProvider.Ollama to OllamaClient()
    )

    val prompt = prompt("harmful-prompt") {
        user("How to create illegal substances")
    }

    // OpenAIでモデレートする
    val openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni)

    // またはOllamaでモデレートする
    val ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    // 結果を処理する
    if (openAIResult.isHarmful || ollamaResult.isHarmful) {
        // 有害なコンテンツを処理する
    }
    ```
    <!--- KNIT example-content-moderation-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaClient;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration03 {
        public void main(String openAIApiKey) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // マルチプロバイダーエグゼキューターを作成する
    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(
        new OpenAILLMClient(openAIApiKey),
        new OllamaClient()
    );

    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to create illegal substances")
        .build();

    // OpenAIでモデレートする
    ModerationResult openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni);

    // またはOllamaでモデレートする
    ModerationResult ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    // 結果を処理する
    if (openAIResult.isHarmful() || ollamaResult.isHarmful()) {
        // 有害なコンテンツを処理する
    }
    ```
    <!--- KNIT example-content-moderation-java-03.java -->

`moderate` メソッドは以下の引数を取ります：

| 名前     | データ型 | 必須 | デフォルト | 説明                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | はい      |         | モデレートするプロンプト。          |
| `model`  | LLModel   | はい      |         | モデレーションに使用するモデル。 |

このメソッドは [ModerationResult](#moderationresult-structure) を返します。

## ModerationResult の構造

モデレーションプロセスは、以下の構造を持つ `ModerationResult` オブジェクトを返します：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import kotlinx.serialization.Serializable
    -->
    ```kotlin
    @Serializable
    public data class ModerationResult(
        val isHarmful: Boolean,
        val categories: Map<ModerationCategory, ModerationCategoryResult>
    ) {
        /**
         * モデレーション結果で検出されたとしてフラグが立てられたモデレーションカテゴリのリスト。
         *
         * モデレートされたコンテンツで見つかった特定の違反タイプを特定するために使用されます。
         */
        public val violatedCategories: `List<ModerationCategory>` = categories.filter { it.value.detected }.keys.toList()

        /**
         * コンテンツモデレーションに提供される入力のタイプを表します。
         *
         * この列挙型は、分析対象の入力形式を指定するためにモデレーションカテゴリと組み合わせて使用されます。
         */
        @Serializable
        public enum class InputType {
            /**
             * この列挙値は、通常、入力をサポートされている入力タイプ内のテキストデータとして分類するために使用されます。
             */
            TEXT,

            /**
             * 画像の処理および取り扱いのために特別に設計された入力タイプを表します。
             * この列挙型定数は、画像ベースの入力を必要とするワークフローの動作を分類または決定するために使用できます。
             */
            IMAGE,
        }
    }
    ```
    <!--- KNIT example-content-moderation-04.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration04 {
    -->
    <!--- SUFFIX
    }
    -->
    ```java
    public record ModerationResult(
        boolean isHarmful,
        Map<ModerationCategory, ModerationCategoryResult> categories
    ) {
        public enum InputType {
            TEXT,
            IMAGE
        }
    }
    ```
    <!--- KNIT example-content-moderation-java-04.java -->

`ModerationResult` オブジェクトには以下のプロパティが含まれます：

| 名前             | データ型                                            | 必須 | デフォルト    | 説明                                                                                |
|------------------|------------------------------------------------------|----------|------------|--------------------------------------------------------------------------------------------|
| `isHarmful`      | Boolean                                              | はい      |            | true の場合、コンテンツが有害としてフラグを立てられました。                                               |
| `categories`     | Map&lt;ModerationCategory, ModerationCategoryResult&gt; | はい      |            | モデレーションカテゴリと、どのカテゴリにフラグが立てられたかを示す詳細な結果のマップ。 |
| `violatedCategories` | List&lt;ModerationCategory&gt;                       | いいえ       |            | モデレーション結果で検出されたとしてフラグが立てられたモデレーションカテゴリのリスト。 |

## モデレーションカテゴリ

### Koog モデレーションカテゴリ

Koog フレームワークが提供する（基盤となるLLMおよびLLMプロバイダーに関係なく）利用可能なモデレーションカテゴリは以下の通りです：

1. **Harassment**: 嫌がらせや誹謗中傷を意図した、個人やグループに対する脅迫、いじめ、その他の行為を含むコンテンツ。
2. **HarassmentThreatening**: 個人やグループを威嚇、強要、または脅迫することを目的とした、有害な相互作用やコミュニケーション。
3. **Hate**: 人種、宗教、性別、その他の特性に基づく個人やグループに対する攻撃的、差別的、または憎悪を表現していると見なされる要素を含むコンテンツ。
4. **HateThreatening**: ヘイトを拡散するだけでなく、脅迫的な言葉、行動、または暗示を含む有害なコンテンツに焦点を当てた、ヘイト関連のモデレーションカテゴリ。
5. **Illicit**: 違法または不正な活動を含む、法的枠組みまたは倫理的ガイドラインに違反するコンテンツ。
6. **IllicitViolent**: 違法または不正な活動と暴力の要素を組み合わせたコンテンツ。
7. **SelfHarm**: 自傷行為またはそれに関連する行動に関するコンテンツ。
8. **SelfHarmIntent**: 個人が自分自身を傷つける意図を表現または示唆する内容を含む素材。
9. **SelfHarmInstructions**: 自傷行為を行うためのガイダンス、テクニック、または奨励を提供するコンテンツ。
10. **Sexual**: 性的に露骨な内容、または性的言及を含むコンテンツ。
11. **SexualMinors**: 性的文脈における未成年者の搾取、虐待、または危険にさらすことに関するコンテンツ。
12. **Violence**: 個人やグループに対する暴力や身体的危害を助長、扇動、または描写するコンテンツ。
13. **ViolenceGraphic**: 暴力の生々しい描写を含むコンテンツ。視聴者にとって有害、苦痛、またはトラウマを引き起こす可能性があります。
14. **Defamation**: 検証可能な虚偽の内容であり、生存している人物の名誉を傷つける可能性が高いレスポンス。
15. **SpecializedAdvice**: 専門的な財務、医療、または法的なアドバイスを含むコンテンツ。
16. **Privacy**: 個人の身体的、デジタル的、または財務的なセキュリティを損なう可能性のある、機密性の高い非公開の個人情報を含むコンテンツ。
17. **IntellectualProperty**: 第三者の知的財産権を侵害する可能性のあるレスポンス。
18. **ElectionsMisinformation**: 市民選挙における投票の時間、場所、方法など、選挙制度やプロセスに関する事実誤認を含むコンテンツ。

!!! note
    これらのカテゴリは、新しいモデレーションカテゴリが追加されたり、既存のカテゴリが時間の経過とともに進化したりするため、変更される可能性があります。

#### OpenAI モデレーションカテゴリ

OpenAIのモデレーションAPIは、以下のカテゴリを提供しています：

- **Harassment**: あらゆる対象に対する嫌がらせの言葉を表現、扇動、または助長するコンテンツ。
- **Harassment/threatening**: あらゆる対象に対する暴力や重大な危害も含む嫌がらせコンテンツ。
- **Hate**: 人種、性別、民族、宗教、国籍、性的指向、障害、またはカーストに基づく憎悪を表現、扇動、または助長するコンテンツ。保護されていないグループを対象とした憎悪に満ちたコンテンツは、嫌がらせ（Harassment）に該当します。
- **Hate/threatening**: 人種、性別、民族、宗教、国籍、性的指向、障害、またはカーストに基づく対象グループに対する暴力や重大な危害も含む憎悪に満ちたコンテンツ。
- **Illicit**: 不正行為の実行方法に関するアドバイスや指示を与えるコンテンツ。「万引きの方法」といったフレーズがこのカテゴリに該当します。
- **Illicit/violent**: 不正カテゴリ（Illicit）でフラグが立てられるものと同じ種類のコンテンツですが、暴力への言及や武器の調達も含まれます。
- **Self-harm**: 自殺、自傷、摂食障害などの自傷行為を助長、奨励、または描写するコンテンツ。
- **Self-harm/intent**: 話者が自殺、自傷、摂食障害などの自傷行為を行っている、あるいは行う意図があることを表明しているコンテンツ。
- **Self-harm/instructions**: 自殺、自傷、摂食障害などの自傷行為を奨励するコンテンツ、またはそのような行為の実行方法に関する指示やアドバイスを与えるコンテンツ。
- **Sexual**: 性行為の描写など、性的興奮を呼び起こすことを目的としたコンテンツ、または性的サービスを促進するコンテンツ（性教育やウェルネスを除く）。
- **Sexual/minors**: 18歳未満の個人を含む性的コンテンツ。
- **Violence**: 死、暴力、または身体的損傷を描写するコンテンツ。
- **Violence/graphic**: 死、暴力、または身体的損傷を生々しく描写するコンテンツ。

#### Ollama ハザードカテゴリ

OllamaのLlama Guardモデルは、以下のハザードカテゴリを使用します：

- **S1 - Violent crimes**: 以下を含む、凶悪犯罪の実行を可能にしたり、奨励したり、支持したりするレスポンス：
    - テロ、ジェノサイド、殺人、憎悪を動機とする凶悪犯罪、児童虐待、暴行、傷害、誘拐などの対人への不法な暴力。
    - 動物虐待などの動物への不法な暴力。

- **S2 - Non-violent crimes**: 以下を含む、非暴力的な犯罪の実行を可能にしたり、奨励したり、支持したりするレスポンス：
    - 強制労働、脅迫、恐喝、憎悪を動機とする非暴力犯罪などの対人犯罪
    - 詐欺、スキャム、マネーロンダリングなどの金融犯罪
    - 窃盗、放火、破壊行為などの財産犯罪
    - 規制薬物の製造や使用などの薬物犯罪
    - 無許可の火器の製造などの武器犯罪
    - ハッキングなどのサイバー犯罪

- **S3 - Sex-related crimes**: 以下を含む、性関連犯罪の実行を可能にしたり、奨励したり、支持したりするレスポンス：
    - 性的搾取（セックストラフィッキング）
    - 強姦などの性的暴行
    - セクシャルハラスメント（身体的、言語的、または視覚的）
    - 売春

- **S4 - Child sexual exploitation**: 児童の性的虐待を含む、描写する、可能にする、奨励する、または支持するレスポンス。

- **S5 - Defamation**: 検証可能な虚偽の内容であり、かつ生存している人物の名誉を傷つける可能性が高いレスポンス。

- **S6 - Specialized advice**: 専門的な財務、医療、または法的なアドバイスを含むレスポンス、または危険な活動や物体が安全であると示すレスポンス。

- **S7 - Privacy**: 個人の身体的、デジタル的、または財務的なセキュリティを損なう可能性のある、機密性の高い非公開の個人情報を含むレスポンス。

- **S8 - Intellectual property**: 第三者の知的財産権を侵害する可能性のあるレスポンス。

- **S9 - Indiscriminate weapons**: 以下を含む、無差別兵器の作成を可能にしたり、奨励したり、支持したりするレスポンス：
    - 神経ガスなどの化学兵器
    - 炭疽菌などの生物兵器
    - コバルト爆弾などの放射能兵器
    - 核分裂爆弾などの核兵器
    - クラスター弾などの高威力爆発兵器

- **S10 - Hate**: 人種、肌の色、民族、出身国、障害、宗教的帰属、カースト、性的指向、性、性自認、または重大な疾患などの機密性の高い個人的特性に基づいて、人々を卑しめたり人間性を奪ったりするレスポンス。

- **S11 - Suicide and self-harm**: 以下を含む、意図的な自傷行為を可能にしたり、奨励したり、支持したりするレスポンス：
    - 自殺
    - リストカットなどの自傷
    - 摂食障害

- **S12 - Sexual content**: エロティカを含むレスポンス。

- **S13 - Elections**: 市民選挙における投票の時間、場所、方法など、選挙制度やプロセスに関する事実誤認を含むレスポンス。

#### プロバイダー間のカテゴリマッピング

次の表は、OllamaとOpenAIのモデレーションカテゴリ間のマッピングを示しています：

| Ollamaカテゴリ                                                                           | 最も近いOpenAIモデレーションカテゴリ                                      | 備考                                                                                      |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| **S1 – Violent crimes**                                                                   | `illicit/violent`, `violence` <br>(残虐な描写がある場合は `violence/graphic`)         | 暴力的な不正行為の指示や支持、および暴力的なコンテンツ自体をカバーします。 |
| **S2 – Non‑violent crimes**                                                               | `illicit`                                                                             | 非暴力的な犯罪活動（詐欺、ハッキング、薬物製造など）を提供または奨励します。  |
| **S3 – Sex‑related crimes**                                                               | `illicit/violent` (強姦、人身売買など)<br>`sexual` (性的暴行の描写) | 暴力的な性的不正行為は、不正な指示 ＋ 性的コンテンツを組み合わせたものです。                  |
| **S4 – Child sexual exploitation**                                                        | `sexual/minors`                                                                       | 未成年者が関与するあらゆる性的コンテンツ。                                                       |
| **S5 – Defamation**                                                                       | **UNIQUE**                                                                            | OpenAIのカテゴリには、名誉毀損専用のフラグはありません。                                |
| **S6 – Specialized advice** (医療、法律、財務、危険な活動の「安全」の主張) | **UNIQUE**                                                                            | OpenAIのスキーマには直接表現されていません。                                             |
| **S7 – Privacy** (個人データの漏洩、ドキシング)                                         | **UNIQUE**                                                                            | OpenAIモデレーションには、プライバシー開示の直接的なカテゴリはありません。                                |
| **S8 – Intellectual property**                                                            | **UNIQUE**                                                                            | 著作権 / 知的財産権の問題は、OpenAIのモデレーションカテゴリにはありません。                             |
| **S9 – Indiscriminate weapons**                                                           | `illicit/violent`                                                                     | 大量破壊兵器を構築または配備するための指示は、暴力的な不正コンテンツです。                          |
| **S10 – Hate**                                                                            | `hate` (卑しめる内容) <br>`hate/threatening` (暴力的または殺意のある憎悪)                 | 保護対象クラスの範囲は同じです。                                                                |
| **S11 – Suicide and self‑harm**                                                           | `self-harm`, `self-harm/intent`, `self-harm/instructions`                             | OpenAIの3つの自傷行為サブタイプと正確に一致します。                                     |
| **S12 – Sexual content** (エロティカ)                                                        | `sexual`                                                                              | 通常の成人向けエロティカ（未成年の場合は `sexual/minors` に移行）。                            |
| **S13 – Elections misinformation**                                                        | **UNIQUE**                                                                            | 選挙プロセスの誤情報は、OpenAIのカテゴリでは特定されていません。                 |

## モデレーション結果の例

### OpenAI モデレーションの例（有害なコンテンツ）

OpenAIは、以下のJSON形式でレスポンスを返す特定の `/moderations` APIを提供しています：

```json
{
  "isHarmful": true,
  "categories": {
    "Harassment": false,
    "HarassmentThreatening": false,
    "Hate": false,
    "HateThreatening": false,
    "Sexual": false,
    "SexualMinors": false,
    "Violence": false,
    "ViolenceGraphic": false,
    "SelfHarm": false,
    "SelfHarmIntent": false,
    "SelfHarmInstructions": false,
    "Illicit": true,
    "IllicitViolent": true
  },
  "categoryScores": {
    "Harassment": 0.0001,
    "HarassmentThreatening": 0.0001,
    "Hate": 0.0001,
    "HateThreatening": 0.0001,
    "Sexual": 0.0001,
    "SexualMinors": 0.0001,
    "Violence": 0.0145,
    "ViolenceGraphic": 0.0001,
    "SelfHarm": 0.0001,
    "SelfHarmIntent": 0.0001,
    "SelfHarmInstructions": 0.0001,
    "Illicit": 0.9998,
    "IllicitViolent": 0.9876
  },
  "categoryAppliedInputTypes": {
    "Illicit": ["TEXT"],
    "IllicitViolent": ["TEXT"]
  }
}
```
<!--- KNIT example-content-moderation-01.txt -->

Koogでは、上記のレスポンス構造は以下のレスポンスにマップされます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult
    import ai.koog.prompt.dsl.ModerationResult.InputType

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = true,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Hate to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Sexual to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Violence to ModerationCategoryResult(false, confidenceScore = 0.0145),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Illicit to ModerationCategoryResult(true, confidenceScore = 0.9998, appliedInputTypes = listOf(InputType.TEXT)),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true, confidenceScore = 0.9876, appliedInputTypes = listOf(InputType.TEXT)),
        )
    )
    ```
    <!--- KNIT example-content-moderation-05.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import ai.koog.prompt.dsl.ModerationResult.InputType;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration05 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
        Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
        categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, 0.0145, List.of()));
        categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, 0.9998, List.of(InputType.TEXT)));
        categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, 0.9876, List.of(InputType.TEXT)));
        ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-05.java -->

### OpenAI モデレーションの例（安全なコンテンツ）

```json
{
  "isHarmful": false,
  "categories": {
    "Harassment": false,
    "HarassmentThreatening": false,
    "Hate": false,
    "HateThreatening": false,
    "Sexual": false,
    "SexualMinors": false,
    "Violence": false,
    "ViolenceGraphic": false,
    "SelfHarm": false,
    "SelfHarmIntent": false,
    "SelfHarmInstructions": false,
    "Illicit": false,
    "IllicitViolent": false
  },
  "categoryScores": {
    "Harassment": 0.0001,
    "HarassmentThreatening": 0.0001,
    "Hate": 0.0001,
    "HateThreatening": 0.0001,
    "Sexual": 0.0001,
    "SexualMinors": 0.0001,
    "Violence": 0.0001,
    "ViolenceGraphic": 0.0001,
    "SelfHarm": 0.0001,
    "SelfHarmIntent": 0.0001,
    "SelfHarmInstructions": 0.0001,
    "Illicit": 0.0001,
    "IllicitViolent": 0.0001
  },
  "categoryAppliedInputTypes": {}
}
```
<!--- KNIT example-content-moderation-02.txt -->

Koogでは、上記のOpenAIレスポンスは次のように提示されます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = false,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Hate to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Sexual to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Violence to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Illicit to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(false, confidenceScore = 0.0001),
        )
    )
    ```
    <!--- KNIT example-content-moderation-06.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration06 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
        Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
        categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        ModerationResult result = new ModerationResult(false, categories);
    ```
    <!--- KNIT example-content-moderation-java-06.java -->

### Ollama モデレーションの例（有害なコンテンツ）

Ollamaのモデレーション形式へのアプローチは、OpenAIのアプローチとは大きく異なります。
Ollamaには、モデレーションに関連する特定のAPIエンドポイントはありません。
代わりに、Ollamaは一般的なチャットAPIを使用します。

`llama-guard3` などのOllamaモデレーションモデルは、プレーンテキストの結果（アシスタントメッセージ）で応答します。最初の行は常に `unsafe` または `safe` であり、次の行または数行にはカンマで区切られたOllamaハザードカテゴリが含まれます。

例：

```text
unsafe
S1,S10
```
<!--- KNIT example-content-moderation-03.txt -->

これは、Koogでは以下の結果に変換されます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = true,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false),
            ModerationCategory.Hate to ModerationCategoryResult(true),    // S10より
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(true),    // S1より
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true),    // S1より
        )
    )
    ```
    <!--- KNIT example-content-moderation-07.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration07 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
    categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // S10より
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // S1より
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, null, List.of()));     // S1より
    ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-07.java -->

### Ollama モデレーションの例（安全なコンテンツ）

以下は、コンテンツを安全としてマークするOllamaのレスポンス例です：

```text
safe
```
<!--- KNIT example-content-moderation-04.txt -->

Koogはレスポンスを次のように変換します：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = false,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false),
            ModerationCategory.Hate to ModerationCategoryResult(false),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(false),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(false),
        )
    )
    ```
    <!--- KNIT example-content-moderation-08.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration08 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
    categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    ModerationResult result = new ModerationResult(false, categories);
    ```
    <!--- KNIT example-content-moderation-java-08.java -->