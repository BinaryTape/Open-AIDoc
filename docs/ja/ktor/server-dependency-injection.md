[//]: # (title: 依存性の注入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[依存性の注入（DI: Dependency injection）](https://en.wikipedia.org/wiki/Dependency_injection)は、コンポーネントに必要な依存関係を提供するのに役立つデザインパターンです。モジュールが具体的な実装を直接生成するのではなく抽象に依存し、実行時にDIコンテナが適切なインスタンスを構築して提供します。この分離により結合度が下がり、テスト容易性が向上し、既存のコードを変更することなく実装の置き換えや再設定が容易になります。

Ktorには組み込みのDIプラグインが用意されており、サービスや設定オブジェクトを一度登録すればアプリケーション全体からアクセスできるようになります。一貫した型安全な方法で、これらの[依存関係をモジュール](server-di-dependency-resolution.md#inject-into-modules)、プラグイン、ルート、その他のKtorコンポーネントに注入できます。このプラグインはKtorアプリケーションのライフサイクルと統合されており、スコープ設定、構造化された設定、[リソースの自動管理](server-di-resource-lifecycle-management.md)をサポートしているため、アプリケーションレベルのサービスの整理や保守が容易になります。

## 依存関係の追加 {id="add-dependencies"}

DIを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含めます。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Ktorにおける依存性の注入の仕組み {id="how-dependency-injection-works-in-ktor"}

Ktorにおいて、依存性の注入は密接に関連する2つのステップからなる、単一の統合されたプロセスです。

* [依存関係の登録](server-di-dependency-registration.md) — インスタンスがどのように作成されるかを宣言します。
* [依存関係の解決](server-di-dependency-resolution.md) — 実行時にそれらのインスタンスにアクセスして注入します。

これらのステップは、単一のDIコンテナによって処理されます。

アプリケーションで依存性の注入の使用を開始するには、まず[依存関係の登録](server-di-dependency-registration.md)から始めます。依存関係を宣言したら、続けて[依存関係の解決](server-di-dependency-resolution.md)に進んでください。

## サポートされている機能 {id="supported-features"}

DIプラグインは、一般的なアプリケーションのニーズをカバーするためのさまざまな機能をサポートしています。

* [型安全な依存関係の解決](server-di-dependency-resolution.md)
* [オプションおよびnull許容の依存関係](server-di-dependency-resolution.md#optional-dependencies)
* [共変ジェネリクスの解決](server-di-dependency-resolution.md#covariant-generics)
* [非同期での依存関係の解決](server-di-dependency-resolution.md#async-dependency-resolution)
* [自動およびカスタムリソースライフサイクル管理](server-di-resource-lifecycle-management.md)

## 設定とライフサイクルの動作 {id="configuration-and-lifecycle-behavior"}

DIコンテナの動作は、設定オプションを使用してカスタマイズできます。これらのオプションにより、依存関係キーの照合方法、競合の処理方法、および高度なシナリオにおける解決の動作を制御します。

設定の詳細については、[DIプラグインの設定](server-di-configuration.md)を参照してください。

リソースのクリーンアップとシャットダウンの動作については、[リソースライフサイクル管理](server-di-resource-lifecycle-management.md)を参照してください。

## 依存性の注入を使用したテスト {id="testing-with-dependency-injection"}

DIプラグインはKtorのテストユーティリティと統合されており、テスト環境での依存関係のオーバーライド、設定の読み込み、競合動作の制御をサポートしています。

詳細および例については、[依存性の注入を使用したテスト](server-di-testing.md)を参照してください。