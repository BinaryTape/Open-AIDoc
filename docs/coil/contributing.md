# 贡献指南

为了保持库的小巧和稳定，请将贡献限制在 bug 修复、文档改进和测试改进范围内。

标记为 [help wanted](https://github.com/coil-kt/coil/labels/help%20wanted) 的 issue 非常适合作为为 Coil 做贡献的起点。

如果你有新功能的想法，请[创建功能增强请求](https://github.com/coil-kt/coil/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)以便讨论，或者将其构建为一个外部库。

如果你发现了 bug，请贡献一个失败的测试用例，以便我们研究和修复。

如果你想贡献代码，可以在 GitHub 上 fork 本仓库并发送 pull request。

提交代码时，请尽量遵循现有的约定和风格，使代码尽可能保持可读性。另外，请确保你的代码能够通过运行 `./test.sh` 执行的所有测试。

如果你修改了 API，请运行 `./gradlew updateKotlinAbi`，并在 pull request 中包含所有发生变更的文件。

*改编自 OkHttp 的[贡献](https://square.github.io/okhttp/contributing/)章节。*
