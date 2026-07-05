[//]: # (title: リソースの概要)

Compose Multiplatform は、サポートされているすべてのプラットフォームにわたって、共通コード（common code）からリソースにアクセスするための特別な `compose-multiplatform-resources` ライブラリと Gradle プラグインのサポートを提供しています。
リソースとは、画像、フォント、文字列などの静的コンテンツであり、アプリケーション内で使用できます。

Compose Multiplatform でリソースを操作する際は、現在の以下の状況を考慮してください：

* ほぼすべてのリソースは、呼び出し元のスレッドで同期的に読み込まれます。唯一の例外は、非同期で読み込まれる raw ファイルと [ウェブリソース](compose-web-resources.md) です。
* 長いビデオのような大きな raw ファイルをストリームとして読み込むことは、まだサポートされていません。
  [`getUri()`](compose-multiplatform-resources-usage.md#accessing-multiplatform-resources-from-external-libraries) 関数を使用して個別のファイルをシステム API（例えば [kotlinx-io](https://github.com/Kotlin/kotlinx-io) ライブラリなど）に渡すようにしてください。
* 1.6.10 以降、Kotlin 2.0.0 以降および Gradle 7.6 以降を使用している場合、リソースを任意のモジュールやソースセットに配置できるようになりました。

Compose Multiplatform でのリソースの扱い方については、以下の主要なセクションを参照してください：

* [マルチプラットフォームリソースのセットアップと設定](compose-multiplatform-resources-setup.md)

  `resources` ライブラリの依存関係を追加し、アプリがアクセスできるようにすべてのリソースをセットアップします。

* [アプリでのマルチプラットフォームリソースの使用](compose-multiplatform-resources-usage.md)

  自動生成されたアクセサを使用して、UI コードから直接リソースにアクセスする方法を学びます。

* [ローカルリソース環境](compose-resource-environment.md)
  
  アプリ内テーマや言語など、アプリのリソース環境を管理します。