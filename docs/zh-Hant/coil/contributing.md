# 貢獻指南

為了保持函式庫的小巧與穩定，請將貢獻限制在錯誤修正、文件改進和測試改進範圍內。

標記為 [help wanted](https://github.com/coil-kt/coil/labels/help%20wanted) 的 issue 非常適合作為為 Coil 做出貢獻的起點。

如果您有新功能的想法，請[建立功能增強請求](https://github.com/coil-kt/coil/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)以便討論，或者將其建構為一個外部函式庫。

如果您發現了錯誤，請貢獻一個失敗的測試案例，以便我們研究和修正。

如果您想貢獻程式碼，可以在 GitHub 上 fork 本儲存庫並發送 pull request。

提交程式碼時，請盡量遵循現有的慣例和風格，使程式碼盡可能保持可讀性。另外，請確保您的程式碼能夠通過執行 `./test.sh` 所跑的全部測試。

如果您修改了 API，請執行 `./gradlew updateKotlinAbi`，並在 pull request 中包含所有變更的檔案。

*改編自 OkHttp 的[貢獻](https://square.github.io/okhttp/contributing/)章節。*
