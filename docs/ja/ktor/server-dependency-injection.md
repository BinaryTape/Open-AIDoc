[//]: # (title: 依存性注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />

<tldr>
<p>
<b>必須依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依存性注入（DI）](https://en.wikipedia.org/wiki/Dependency_injection)は、コンポーネントが必要とする依存関係を供給するためのデザインパターンです。モジュールが具象実装を直接作成する代わりに抽象に依存するようにし、DIコンテナがランタイムに適したインスタンスを構築して提供する役割を担います。この分離により、結合度が低下し、テストのしやすさが向上します。また、既存のコードを修正することなく、実装の入れ替えや再構成が容易になります。

Ktorは、サービスや設定オブジェクトを一度登録するだけでアプリケーション全体でアクセスできるようにする、組み込みのDIプラグインを提供しています。これらの依存関係は、一貫性のある型安全な方法で、[モジュール](server-di-dependency-resolution.md#inject-into-modules)、プラグイン、ルート、その他のKtorコンポーネントに注入できます。このプラグインはKtorアプリケーションのライフサイクルと統合されており、スコープ設定、構造化された構成、[リソースの自動管理](server-di-resource-lifecycle-management.md)をサポートしているため、アプリケーションレベルのサービスの整理とメンテナンスが容易になります。

## 依存関係の追加

DIを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含めます。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## Ktorにおける依存性注入の仕組み

Ktorにおいて、依存性注入は密接に関連する2つのステップで構成される、単一の統合されたプロセスです。

* [依存関係の登録](server-di-dependency-registration.md) — インスタンスがどのように作成されるかを宣言します。
* [依存関係の解決](server-di-dependency-resolution.md) — ランタイムにそれらのインスタンスにアクセスして注入します。

これらのステップは、単一のDIコンテナによって処理されます。

アプリケーションで依存性注入の使用を開始するには、まず[依存関係の登録](server-di-dependency-registration.md)から始めてください。依存関係が宣言されたら、[依存関係の解決](server-di-dependency-resolution.md)に進みます。

## サポートされている機能

DIプラグインは、一般的なアプリケーションのニーズをカバーすることを目的としたさまざまな機能をサポートしています。

* [型安全な依存関係の解決](server-di-dependency-resolution.md)
* [オプショナルおよび null 許容の依存関係](server-di-dependency-resolution.md#optional-dependencies)
* [共変ジェネリクスの解決](server-di-dependency-resolution.md#covariant-generics)
* [非同期の依存関係の解決](server-di-dependency-resolution.md#async-dependency-resolution)
* [自動およびカスタムのリソースライフサイクル管理](server-di-resource-lifecycle-management.md)

## 設定とライフサイクルの動作

DIコンテナの動作は、設定オプションを使用してカスタマイズできます。これらのオプションにより、依存関係キーの一致方法、競合の処理方法、および高度なシナリオにおける解決の動作を制御できます。

設定の詳細については、[DIプラグインの設定](server-di-configuration.md)を参照してください。

リソースのクリーンアップとシャットダウンの動作については、[リソースのライフサイクル管理](server-di-resource-lifecycle-management.md)を参照してください。

## 依存性注入を使用したテスト

DIプラグインはKtorのテストユーティリティと統合されており、テスト環境での依存関係のオーバーライド、設定の読み込み、競合動作の制御をサポートしています。

詳細と例については、[依存性注入を使用したテスト](server-di-testing.md)を参照してください。