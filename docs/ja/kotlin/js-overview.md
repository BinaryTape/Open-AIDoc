[//]: # (title: Kotlin/JavaScript)

Kotlin/JavaScript (Kotlin/JS) を使用すると、Kotlinコード、Kotlin標準ライブラリ、および互換性のある依存関係をJavaScriptにトランスパイル（transpile）できます。これにより、KotlinアプリケーションをJavaScriptがサポートされているあらゆる環境で実行できるようになります。

[Kotlin Multiplatform Gradleプラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) (`kotlin.multiplatform`) を通じてKotlin/JSを使用することで、JavaScriptをターゲットとするKotlinプロジェクトの設定と管理を一箇所で行うことができます。

Kotlin Multiplatform Gradleプラグインを使用すると、アプリケーションのバンドリングの制御や、npmからのJavaScript依存関係の直接追加といった機能にアクセスできます。利用可能な設定オプションの概要については、「[Kotlin/JSプロジェクトの設定](js-project-setup.md)」を参照してください。

> 現在のKotlin/JSの実装は、[ES5](https://www.ecma-international.org/ecma-262/5.1/)、[ES2015](https://262.ecma-international.org/6.0/)、および[ES2020](https://262.ecma-international.org/11.0/)標準をターゲットにしています。
>
{style="tip"}

## Kotlin/JSのユースケース {id="use-cases-for-kotlin-js"}

Kotlin/JSの一般的な活用方法は以下の通りです。

*  **フロントエンドとJVMバックエンド間での共通ロジックの共有**

   バックエンドがKotlinまたは他のJVM互換言語で書かれている場合、Webアプリケーションとバックエンドの間で共通のコードを共有できます。これには、データ転送オブジェクト（DTO）、バリデーション（検証）や認証のルール、REST APIエンドポイントの抽象化などが含まれます。

*  **Android、iOS、およびWebクライアント間での共通ロジックの共有**

   ネイティブのユーザーインターフェースを維持しながら、WebインターフェースとAndroid・iOS向けのモバイルアプリケーション間でビジネスロジックを共有できます。これにより、REST APIの抽象化、ユーザー認証、フォームバリデーション、ドメインモデルなどの共通機能の重複を避けることができます。

* **Kotlin/JSを使用したフロントエンドWebアプリケーションの構築**

     既存のツールやライブラリと統合しながら、Kotlinを使用して従来のWebフロントエンドを開発できます。

     * Android開発に慣れている場合は、[Kobweb](https://kobweb.varabyte.com/)や[Kilua](https://kilua.dev/)などのComposeベースのフレームワークを使用してWebアプリケーションを構築できます。
     * JetBrainsが提供する[一般的なJavaScriptライブラリ用のKotlinラッパー](https://github.com/JetBrains/kotlin-wrappers)（`kotlin-wrappers`）を使用して、Kotlin/JSで完全に型安全なReactアプリケーションを構築できます。これらのラッパーは、Reactやその他のJavaScriptフレームワークのための抽象化と統合を提供します。
       
       これらのラッパーは、[React Redux](https://react-redux.js.org/)、[React Router](https://reactrouter.com/)、[styled-components](https://styled-components.com/)などの補完的なライブラリもサポートしています。また、JavaScriptエコシステムとの相互運用性（interoperability）を通じて、サードパーティのReactコンポーネントやコンポーネントライブラリを使用することも可能です。
  
     * Kotlinエコシステムと統合され、簡潔で表現力豊かなコードをサポートする[Kotlin/JSフレームワーク](js-frameworks.md)を使用できます。

*  **古いブラウザをサポートするマルチプラットフォームアプリケーションの構築**

      Compose Multiplatformを使用すると、Kotlinを使用してアプリケーションを構築し、モバイルやデスクトップのユーザーインターフェースをWebプロジェクトで再利用できます。この目的には[Kotlin/Wasm](wasm-overview.md)が主なターゲットとなりますが、Kotlin/JSもターゲットに含めることで、より古いブラウザへのサポートを拡張できます。

* **Kotlin/JSを使用したサーバーサイドおよびサーバーレスアプリケーションの構築**

  Kotlin/JSのNode.jsターゲットを使用すると、JavaScriptランタイム上のサーバーサイドまたはサーバーレス環境向けのアプリケーションを作成できます。これにより、高速な起動と低メモリ使用量が実現します。[`kotlinx-nodejs`](https://github.com/Kotlin/kotlinx-nodejs)ライブラリは、Kotlinから[Node.js API](https://nodejs.org/docs/latest/api/)への型安全なアクセスを提供します。

ユースケースに応じて、Kotlin/JSプロジェクトではKotlinエコシステムの互換性のあるライブラリや、JavaScriptおよびTypeScriptエコシステムのサードパーティライブラリを使用できます。

Kotlinコードからサードパーティライブラリを使用するには、独自の型安全なラッパーを作成するか、コミュニティによって維持されているラッパーを使用できます。さらに、Kotlin/JSの[dynamic型](dynamic-type.md)を使用すると、型安全性を犠牲にする代わりに、厳密な型定義やライブラリラッパーをスキップして利用することも可能です。

Kotlin/JSは、[ESM](https://tc39.es/ecma262/#sec-modules)、[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)、[UMD](https://github.com/umdjs/umd)、[AMD](https://github.com/amdjs/amdjs-api)といった主要なモジュールシステムとも互換性があります。これにより、構造化された方法で[モジュールを作成および利用](js-modules.md)し、JavaScriptエコシステムと統合できます。

### ユースケースの共有 {id="share-your-use-cases"}

[Kotlin/JSのユースケース](#kotlinjsのユースケース)に挙げたリストがすべてではありません。さまざまなアプローチを試して、あなたのプロジェクトに最適な方法を見つけてください。

あなたのユースケース、経験、質問などは、[Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)の[#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69)チャンネルでKotlin/JSコミュニティと共有してください。

## Kotlin/JSを始める {id="get-started-with-kotlin-js"}

Kotlin/JSでの開発を始めるための基本事項と最初のステップを確認しましょう。

* Kotlinが初めての場合は、まず[基本構文](basic-syntax.md)を復習し、[Kotlinツアー](kotlin-tour-welcome.md)を体験することをお勧めします。
* インスピレーションを得るために、[Kotlin/JSサンプルプロジェクト](#kotlinjsのサンプルプロジェクト)のリストを確認してください。これらのサンプルには、プロジェクトを開始するのに役立つ便利なコードスニペットやパターンが含まれています。
* Kotlin/JSが初めての場合は、より高度なトピックを調べる前に[セットアップガイド](js-project-setup.md)から始めてください。

Kotlin/JSを自分で試してみませんか？

<a href="js-get-started.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin/JSを始める</a>

## Kotlin/JSのサンプルプロジェクト {id="sample-projects-for-kotlin-js"}

以下の表は、さまざまなKotlin/JSのユースケース、アーキテクチャ、およびコード共有戦略を示すサンプルプロジェクトのリストです。

| プロジェクト | 説明 |
|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Petclinic with common code between Spring and Angular](https://github.com/Kotlin/kmp-spring-petclinic/#readme) | データ転送オブジェクト、バリデーションおよび認証ルール、REST APIエンドポイントの抽象化を共有することで、エンタープライズアプリケーションにおけるコードの重複を避ける方法を示します。コードは、[Spring Boot](https://spring.io/projects/spring-boot)バックエンドと[Angular](https://angular.dev/)フロントエンド間で共有されます。 |
| [Fullstack Conference CMS](https://github.com/Kotlin/kmp-fullstack-conference-cms/#readme) | 最も単純なものから、[Ktor](https://ktor.io/)、[Jetpack Compose](https://developer.android.com/compose)、[Vue.js](https://vuejs.org/)アプリケーション間でのフルスタックなコード共有まで、複数のコード共有アプローチを紹介します。 |
| [Todo App on a Compose-HTML-based Kobweb framework](https://github.com/varabyte/kobweb-templates/tree/main/examples/todo/#readme) | Android開発者に馴染みのある手法を再利用して、ToDoリストアプリケーションを作成する方法を示します。[Kobwebフレームワーク](https://kobweb.varabyte.com/)を利用したクライアントUIアプリケーションを構築します。 |
| [Simple logic sharing between Android, iOS, and web](https://github.com/Kotlin/kmp-logic-sharing-simple-example/#readme) | Kotlinで共通ロジックを構築し、それをAndroid（[Jetpack Compose](https://developer.android.com/compose)）、iOS（[SwiftUI](https://developer.apple.com/tutorials/swiftui/)）、Web（[React](https://react.dev/)）の各プラットフォームネイティブUIアプリケーションで利用するためのテンプレートが含まれています。 |
| [Full-stack collaborative to-do list](https://github.com/kotlin-hands-on/jvm-js-fullstack/#readme) | JSとJVMターゲットを持つKotlin Multiplatformを使用して、共同作業用のToDoリストアプリケーションを作成する方法を示します。バックエンドには[Ktor](https://ktor.io/)、フロントエンドにはReactを用いたKotlin/JSを使用しています。 |

## Kotlin/JSフレームワーク {id="kotlin-js-frameworks"}

Kotlin/JSフレームワークは、モダンなWebアプリケーションを構築するためのコンポーネント、ルーティング、状態管理、その他のツールを提供することで、Web開発を簡素化します。

[さまざまな作者によって作成された、Kotlin/JSで利用可能なフレームワークを確認してください](js-frameworks.md)。

## Kotlin/JSコミュニティに参加する {id="join-the-kotlin-js-community"}

公式の[Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)にある[#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69)チャンネルに参加して、コミュニティやKotlin/JSチームとチャットできます。

## 次のステップ {id="what-s-next"}

* [Kotlin/JSプロジェクトの設定](js-project-setup.md)
* [Kotlin/JSプロジェクトの実行](running-kotlin-js.md)
* [Kotlin/JSコードのデバッグ](js-debugging.md)
* [Kotlin/JSでのテストの実行](js-running-tests.md)