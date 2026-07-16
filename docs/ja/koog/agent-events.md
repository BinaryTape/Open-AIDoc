# エージェントイベント

エージェントイベントは、エージェントワークフローの一部として発生するアクションまたはインタラクションです。これらには以下が含まれます：

- エージェントライフサイクルイベント
- ストラテジーイベント
- ノード実行イベント
- LLMコールイベント
- LLMストリーミングイベント
- ツール実行イベント

注意：機能イベントは `agents-core` モジュールで定義されており、`ai.koog.agents.core.feature.model.events` パッケージの下に配置されています。`agents-features-trace` や `agents-features-event-handler` などの機能は、これらのイベントを消費して、エージェントの実行中に作成されたメッセージを処理および転送します。

## 事前定義されたイベントタイプ

Koog は、カスタムメッセージプロセッサで使用できる事前定義されたイベントタイプを提供しています。事前定義されたイベントは、関連するエンティティに応じていくつかのカテゴリに分類できます：

- [エージェントイベント](#agent-events)
- [ストラテジーイベント](#strategy-events)
- [ノードイベント](#node-events)
- [サブグラフイベント](#subgraph-events)
- [LLMコールイベント](#llm-call-events)
- [LLMストリーミングイベント](#llm-streaming-events)
- [ツール実行イベント](#tool-execution-events)

### エージェントイベント

#### AgentStartingEvent

エージェント実行の開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `agentId`       | String              | はい |            | AIエージェントの一意の識別子。                                              |
| `runId`         | String              | はい |            | AIエージェント実行の一意の識別子。                                          |

#### AgentCompletedEvent

エージェント実行の終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `agentId`       | String              | はい |            | AIエージェントの一意の識別子。                                              |
| `runId`         | String              | はい |            | AIエージェント実行の一意の識別子。                                          |
| `result`        | String              | はい |            | エージェント実行の結果。結果がない場合は `null` になる可能性があります。     |

#### AgentExecutionFailedEvent

エージェント実行中にエラーが発生したことを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                                                            |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                                                  |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。                                          |
| `agentId`       | String              | はい |            | AIエージェントの一意の識別子。                                                                                  |
| `runId`         | String              | はい |            | AIエージェント実行の一意の識別子。                                                                              |
| `error`         | AIAgentError        | はい |            | エージェント実行中に発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

#### AgentClosingEvent

エージェントのクローズまたは終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `agentId`       | String              | はい |            | AIエージェントの一意の識別子。                                              |

<a id="aiagenterror"></a>
`AIAgentError` クラスは、エージェント実行中に発生したエラーに関する詳細情報を提供します。以下のフィールドが含まれます：

| 名前         | データ型 | 必須 | デフォルト | 説明                                                            |
|--------------|----------|------|------------|-----------------------------------------------------------------|
| `message`    | String   | はい |            | 特定のエラーに関する詳細情報を提供するメッセージ。              |
| `stackTrace` | String   | はい |            | 最後に実行されたコードまでのスタックレコードのコレクション。    |
| `cause`      | String   | いいえ | null       | 利用可能な場合、エラーの原因。                                  |

<a id="agentexecutioninfo"></a>
`AgentExecutionInfo` クラスは、実行パスに関するコンテキスト情報を提供し、エージェント実行内のネストされた実行コンテキストの追跡を可能にします。以下のフィールドが含まれます：

| 名前       | データ型             | 必須 | デフォルト | 説明                                                                                          |
|------------|---------------------|------|------------|-----------------------------------------------------------------------------------------------|
| `parent`   | AgentExecutionInfo  | いいえ | null       | 親実行コンテキストへの参照。null の場合、これはルート実行レベルを表します。                   |
| `partName` | String              | はい |            | 実行の現在のパートまたはセグメントの名前を表す文字列。                                        |

### ストラテジーイベント

#### GraphStrategyStartingEvent

グラフベースのストラテジー実行の開始を表します。以下のフィールドが含まれます：

| 名前            | データ型               | 必須 | デフォルト | 説明                                                                        |
|-----------------|------------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String                 | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo     | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String                 | はい |            | ストラテジー実行の一意の識別子。                                            |
| `strategyName`  | String                 | はい |            | ストラテジーの名前。                                                        |
| `graph`         | StrategyEventGraph     | はい |            | ストラテジーワークフローを表すグラフ構造。                                  |

#### FunctionalStrategyStartingEvent

関数型ストラテジー実行の開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `strategyName`  | String              | はい |            | ストラテジーの名前。                                                        |

#### StrategyCompletedEvent

ストラテジー実行の終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `strategyName`  | String              | はい |            | ストラテジーの名前。                                                        |
| `result`        | String              | はい |            | 実行の結果。結果がない場合は `null` になる可能性があります。                |

### ノードイベント

#### NodeExecutionStartingEvent

ノード実行の開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `nodeName`      | String              | はい |            | 実行が開始されたノードの名前。                                              |
| `input`         | JsonElement         | いいえ | null       | ノードへの入力値。                                                          |

#### NodeExecutionCompletedEvent

ノード実行の終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `nodeName`      | String              | はい |            | 実行が終了したノードの名前。                                              |
| `input`         | JsonElement         | いいえ | null       | ノードへの入力値。                                                          |
| `output`        | JsonElement         | いいえ | null       | ノードによって生成された出力値。                                            |

#### NodeExecutionFailedEvent

ノード実行中に発生したエラーを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                                                            |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                                                  |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。                                          |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                                                                |
| `nodeName`      | String              | はい |            | エラーが発生したノードの名前。                                                                                  |
| `input`         | JsonElement         | いいえ | null       | ノードに提供された入力データ。                                                                                  |
| `error`         | AIAgentError        | はい |            | ノード実行中に発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

### サブグラフイベント

#### SubgraphExecutionStartingEvent

サブグラフ実行の開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `subgraphName`  | String              | はい |            | 実行が開始されたサブグラフの名前。                                          |
| `input`         | JsonElement         | いいえ | null       | サブグラフへの入力値。                                                      |

#### SubgraphExecutionCompletedEvent

サブグラフ実行の終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                            |
| `subgraphName`  | String              | はい |            | 実行が終了したサブグラフの名前。                                            |
| `input`         | JsonElement         | いいえ | null       | サブグラフへの入力値。                                                      |
| `output`        | JsonElement         | いいえ | null       | サブグラフによって生成された出力値。                                        |

#### SubgraphExecutionFailedEvent

サブグラフ実行中に発生したエラーを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                                                            |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                                                  |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。                                          |
| `runId`         | String              | はい |            | ストラテジー実行の一意の識別子。                                                                                |
| `subgraphName`  | String              | はい |            | エラーが発生したサブグラフの名前。                                                                              |
| `input`         | JsonElement         | いいえ | null       | サブグラフに提供された入力データ。                                                                              |
| `error`         | AIAgentError        | はい |            | サブグラフ実行中に発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

### LLMコールイベント

#### LLMCallStartingEvent

LLMコールの開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                                |
|-----------------|---------------------|------|------------|-------------------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                      |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。              |
| `runId`         | String              | はい |            | LLM実行の一意の識別子。                                                             |
| `prompt`        | Prompt              | はい |            | モデルに送信されるプロンプト。詳細については [Prompt](#prompt) を参照してください。 |
| `model`         | ModelInfo           | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                            |
| `tools`         | `List<String>`        | はい |            | モデルが呼び出すことができるツールのリスト。                                        |

<a id="prompt"></a>
`Prompt` クラスは、メッセージのリスト、一意の識別子、および言語モデル設定のオプションパラメータで構成されるプロンプトのデータ構造を表します。以下のフィールドが含まれます：

| 名前       | データ型             | 必須 | デフォルト   | 説明                                                        |
|------------|---------------------|------|--------------|-------------------------------------------------------------|
| `messages` | `List<Message>`       | はい |              | プロンプトを構成するメッセージのリスト。                    |
| `id`       | String              | はい |              | プロンプトの一意の識別子。                                  |
| `params`   | LLMParams           | いいえ | LLMParams()  | LLMがコンテンツを生成する方法を制御する設定。                |

<a id="modelinfo"></a>
`ModelInfo` クラスは、プロバイダー、モデル識別子、および特性を含む言語モデルに関する情報を表します。以下のフィールドが含まれます：

| 名前              | データ型 | 必須 | デフォルト | 説明                                                                    |
|-------------------|----------|------|------------|-------------------------------------------------------------------------|
| `provider`        | String   | はい |            | プロバイダー識別子（例: "openai", "google", "anthropic"）。             |
| `model`           | String   | はい |            | モデル識別子（例: "gpt-4", "claude-3"）。                               |
| `displayName`     | String   | いいえ | null       | モデルのオプションの人間が読める表示名。                                |
| `contextLength`   | Long     | いいえ | null       | モデルが処理できるトークンの最大数。                                    |
| `maxOutputTokens` | Long     | いいえ | null       | モデルが生成できるトークンの最大数。                                    |

#### LLMCallCompletedEvent

LLMコールの終了を表します。以下のフィールドが含まれます：

| 名前                 | データ型               | 必須 | デフォルト | 説明                                                                        |
|----------------------|------------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`            | String                 | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo`      | AgentExecutionInfo     | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`              | String                 | はい |            | LLM実行の一意の識別子。                                                     |
| `prompt`             | Prompt                 | はい |            | コールで使用されたプロンプト。                                              |
| `model`              | ModelInfo              | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                    |
| `responses`          | `List<Message.Response>` | はい |            | モデルによって返された1つ以上のレスポンス。                                 |
| `moderationResponse` | ModerationResult       | いいえ | null       | モデレーションレスポンス（存在する場合）。                                  |

### LLMストリーミングイベント

#### LLMStreamingStartingEvent

LLMストリーミングコールの開始を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | LLM実行の一意の識別子。                                                     |
| `prompt`        | Prompt              | はい |            | モデルに送信されるプロンプト。                                              |
| `model`         | ModelInfo           | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                    |
| `tools`         | `List<String>`        | はい |            | モデルが呼び出すことができるツールのリスト。                                        |

#### LLMStreamingFrameReceivedEvent

LLMから受信したストリーミングフレームを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | LLM実行の一意の識別子。                                                     |
| `prompt`        | Prompt              | はい |            | モデルに送信されるプロンプト。                                              |
| `model`         | ModelInfo           | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                    |
| `frame`         | StreamFrame         | はい |            | ストリームから受信したフレーム。                                            |

#### LLMStreamingFailedEvent

LLMストリーミングコール中にエラーが発生したことを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                                                        |
|-----------------|---------------------|------|------------|-------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。                                      |
| `runId`         | String              | はい |            | LLM実行の一意の識別子。                                                                                     |
| `prompt`        | Prompt              | はい |            | モデルに送信されるプロンプト。                                                                              |
| `model`         | ModelInfo           | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                                                    |
| `error`         | AIAgentError        | はい |            | ストリーミング中に発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

#### LLMStreamingCompletedEvent

LLMストリーミングコールの終了を表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | LLM実行の一意の識別子。                                                     |
| `prompt`        | Prompt              | はい |            | モデルに送信されるプロンプト。                                              |
| `model`         | ModelInfo           | はい |            | モデル情報。[ModelInfo](#modelinfo) を参照してください。                    |
| `tools`         | `List<String>`        | はい |            | モデルが呼び出すことができるツールのリスト。                                        |

### ツール実行イベント

#### ToolCallStartingEvent

モデルがツールを呼び出すイベントを表します。以下のフィールドが含まれます：

| 名前            | データ型             | 必須 | デフォルト | 説明                                                                        |
|-----------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`       | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo` | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`         | String              | はい |            | ストラテジー/エージェント実行の一意の識別子。                               |
| `toolCallId`    | String              | いいえ | null       | 利用可能な場合、ツールコールの識別子。                                      |
| `toolName`      | String              | はい |            | ツールの名前。                                                              |
| `toolArgs`      | JsonObject          | はい |            | ツールに提供される引数。                                                    |

#### ToolValidationFailedEvent

ツールコール中のバリデーションエラーの発生を表します。以下のフィールドが含まれます：

| 名前              | データ型             | 必須 | デフォルト | 説明                                                                        |
|-------------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`         | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo`   | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`           | String              | はい |            | ストラテジー/エージェント実行の一意の識別子。                               |
| `toolCallId`      | String              | いいえ | null       | 利用可能な場合、ツールコールの識別子。                                      |
| `toolName`        | String              | はい |            | バリデーションに失敗したツールの名前。                                      |
| `toolArgs`        | JsonObject          | はい |            | ツールに提供される引数。                                                    |
| `toolDescription` | String              | いいえ | null       | バリデーションエラーが発生したツールの説明。                                |
| `message`         | String              | いいえ | null       | バリデーションエラーを説明するメッセージ。                                  |
| `error`           | AIAgentError        | はい |            | 発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

#### ToolCallFailedEvent

ツールの実行失敗を表します。以下のフィールドが含まれます：

| 名前              | データ型             | 必須 | デフォルト | 説明                                                                                                            |
|-------------------|---------------------|------|------------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`         | String              | はい |            | イベントまたはイベントグループの一意の識別子。                                                                  |
| `executionInfo`   | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。                                          |
| `runId`           | String              | はい |            | ストラテジー/エージェント実行の一意の識別子。                                                                   |
| `toolCallId`      | String              | いいえ | null       | 利用可能な場合、ツールコールの識別子。                                                                          |
| `toolName`        | String              | はい |            | ツールの名前。                                                                                                  |
| `toolArgs`        | JsonObject          | はい |            | ツールに提供される引数。                                                                                        |
| `toolDescription` | String              | いいえ | null       | 失敗したツールの説明。                                                                                          |
| `error`           | AIAgentError        | はい |            | ツールを呼び出そうとしたときに発生した特定のエラー。詳細については [AIAgentError](#aiagenterror) を参照してください。 |

#### ToolCallCompletedEvent

結果の返却を伴うツールコールの成功を表します。以下のフィールドが含まれます：

| 名前              | データ型             | 必須 | デフォルト | 説明                                                                        |
|-------------------|---------------------|------|------------|-----------------------------------------------------------------------------|
| `eventId`         | String              | はい |            | イベントまたはイベントグループの一意の識別子。                              |
| `executionInfo`   | AgentExecutionInfo  | はい |            | このイベントに関連付けられた実行に関するコンテキスト情報を提供します。      |
| `runId`           | String              | はい |            | 実行の一意の識別子。                                                        |
| `toolCallId`      | String              | いいえ | null       | ツールコールの識別子。                                                      |
| `toolName`        | String              | はい |            | ツールの名前。                                                              |
| `toolArgs`        | JsonObject          | はい |            | ツールに提供された引数。                                                    |
| `toolDescription` | String              | いいえ | null       | 実行されたツールの説明。                                                    |
| `result`          | JsonElement         | いいえ | null       | ツールコールの結果。                                                        |

## FAQとトラブルシューティング

以下のセクションには、トレース機能に関するよくある質問と回答が含まれています。

### エージェント実行の特定のパートのみをトレースするにはどうすればよいですか？

`messageFilter` プロパティを使用してイベントをフィルタリングします。例えば、ノードの実行のみをトレースするには以下のようにします：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent
    import ai.koog.agents.core.feature.model.events.LLMCallStartingEvent
    import ai.koog.agents.example.exampleTracing01.outputPath
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking
    const val input = "What's the weather like in New York?"
    fun main() {
    runBlocking {
    // エージェントの作成
    val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX
            }
        }
    }
    -->
    ```kotlin
    install(Tracing) {
        val fileWriter = TraceFeatureMessageFileWriter.create(outputPath)
        addMessageProcessor(fileWriter)
        
        // LLMコールのみをトレース
        fileWriter.setMessageFilter { message ->
            message is LLMCallStartingEvent || message is LLMCallCompletedEvent
        }
    }
    ```
    <!--- KNIT example-events-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent;
    import ai.koog.agents.core.feature.model.events.LLMCallStartingEvent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import java.nio.file.Files;
    import java.nio.file.Path;
    public class exampleEventsJava01 {
        public static void main(String[] args) {
            var outputPath = Path.of("/path/to/trace.log");
            var agent = AIAgent.builder()
                .promptExecutor(PromptExecutor.builder().ollama().build())
                .llmModel(OllamaModels.Meta.LLAMA_3_2)
    -->
    <!--- SUFFIX
            .build();
        }
    }
    -->
    ```java
    .install(Tracing.Feature, config -> {
        var fileWriter = TraceFeatureMessageFileWriter.create(outputPath);
        config.addMessageProcessor(fileWriter);

        // LLMコールのみをトレース
        fileWriter.setMessageFilter(message ->
            message instanceof LLMCallStartingEvent || message instanceof LLMCallCompletedEvent
        );
    })
    ```
    <!--- KNIT exampleEventsJava01.java -->

### 複数のメッセージプロセッサを使用できますか？

はい、複数のメッセージプロセッサを追加して、同時に異なる宛先にトレースすることができます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.remote.server.config.DefaultServerConnectionConfig
    import ai.koog.agents.example.exampleTracing01.outputPath
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageLogWriter
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageRemoteWriter
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import io.github.oshai.kotlinlogging.KotlinLogging
    import kotlinx.coroutines.runBlocking
    import kotlinx.io.buffered
    import kotlinx.io.files.Path
    import kotlinx.io.files.SystemFileSystem
    const val input = "What's the weather like in New York?"
    val logger = KotlinLogging.logger {}
    val connectionConfig = DefaultServerConnectionConfig(host = ai.koog.agents.example.exampleTracing06.host, port = ai.koog.agents.example.exampleTracing06.port)
    fun main() {
    runBlocking {
    // エージェントの作成
    val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX
            }
        }
    }
    -->
    ```kotlin
    install(Tracing) {
        addMessageProcessor(TraceFeatureMessageLogWriter(logger))
        addMessageProcessor(TraceFeatureMessageFileWriter.create(outputPath))
        addMessageProcessor(TraceFeatureMessageRemoteWriter(connectionConfig))
    }
    ```
    <!--- KNIT example-events-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageLogWriter;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageRemoteWriter;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import org.slf4j.LoggerFactory;
    import java.nio.file.Files;
    import java.nio.file.Path;
    public class exampleEventsJava02 {
        public static void main(String[] args) {
            var logger = LoggerFactory.getLogger("tracing");
            var outputPath = Path.of("/path/to/trace.log");
            var agent = AIAgent.builder()
                .promptExecutor(PromptExecutor.builder().ollama().build())
                .llmModel(OllamaModels.Meta.LLAMA_3_2)
    -->
    <!--- SUFFIX
            .build();
        }
    }
    -->
    ```java
    .install(Tracing.Feature, config -> {
        config.addMessageProcessor(TraceFeatureMessageLogWriter.create(logger));
        config.addMessageProcessor(TraceFeatureMessageFileWriter.create(outputPath));
        config.addMessageProcessor(new TraceFeatureMessageRemoteWriter());
    })
    ```
    <!--- KNIT exampleEventsJava02.java -->

### カスタムメッセージプロセッサを作成するにはどうすればよいですか？

`FeatureMessageProcessor` インターフェースを実装します：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.model.events.NodeExecutionStartingEvent
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent
    import ai.koog.agents.core.feature.message.FeatureMessage
    import ai.koog.agents.core.feature.message.FeatureMessageProcessor
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    import kotlinx.coroutines.flow.asStateFlow
    import kotlinx.coroutines.runBlocking
    fun main() {
    runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    class CustomTraceProcessor : FeatureMessageProcessor() {

        override suspend fun processMessage(message: FeatureMessage) {
            // カスタム処理ロジック
            if (message is NodeExecutionStartingEvent) {
                // ノード開始イベントを処理
            } else if (message is LLMCallCompletedEvent) {
                // LLMコール終了イベントを処理
            } else {
                // 他のイベントタイプを処理
            }
        }

        override suspend fun close() {
            // 確立されている場合は接続を閉じる
        }
    }

    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
        install(Tracing) {
            // カスタムプロセッサを使用する
            addMessageProcessor(CustomTraceProcessor())
        }
    }
    ```
    <!--- KNIT example-events-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.feature.message.FeatureMessage;
    import ai.koog.agents.core.feature.message.FeatureMessageProcessor;
    import ai.koog.agents.core.feature.model.events.NodeExecutionStartingEvent;
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    public class exampleEventsJava03 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    class CustomTraceProcessor extends FeatureMessageProcessor {

        @Override
        protected void handleMessage(FeatureMessage message) {
            // カスタム処理ロジック
            if (message instanceof NodeExecutionStartingEvent) {
                // ノード開始イベントを処理
            } else if (message instanceof LLMCallCompletedEvent) {
                // LLMコール終了イベントを処理
            } else {
                // 他のイベントタイプを処理
            }
        }

        @Override
        public void handleClose() {
            // 確立されている場合は接続を閉じる
        }
    }

    var agent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().ollama().build())
        .llmModel(OllamaModels.Meta.LLAMA_3_2)

        .install(Tracing.Feature, config -> {
            // カスタムプロセッサを使用する
            config.addMessageProcessor(new CustomTraceProcessor());
        })
        .build();
    ```
    <!--- KNIT exampleEventsJava03.java -->

メッセージプロセッサで処理できる既存のイベントタイプの詳細については、[事前定義されたイベントタイプ](#predefined-event-types) を参照してください。