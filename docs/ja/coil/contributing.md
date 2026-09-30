# コントリビューション

ライブラリを小さく安定した状態に保つため、コントリビューションはバグ修正、ドキュメントの改善、テストの改善に限定してください。

[help wanted](https://github.com/coil-kt/coil/labels/help%20wanted) タグが付いた issue は、Coil へのコントリビューションを始めるのに最適です。

新機能のアイデアがある場合は、議論できるように[機能拡張リクエストを作成](https://github.com/coil-kt/coil/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)するか、外部ライブラリとして構築してください。

バグを見つけた場合は、調査と修正ができるように、失敗するテストケースを提供してください。

コードをコントリビュートしたい場合は、GitHub でリポジトリをフォークしてプルリクエストを送信してください。

コードを提出する際は、コードをできるだけ読みやすく保つために、既存の規約やスタイルに従うよう最大限努めてください。また、`./test.sh` を実行して、コードがすべてのテストに合格することを確認してください。

API を変更する場合は、`./gradlew updateKotlinAbi` を実行し、変更されたファイルをすべてプルリクエストに含めてください。

*OkHttp の[コントリビューション](https://square.github.io/okhttp/contributing/)セクションを改変したものです。*
