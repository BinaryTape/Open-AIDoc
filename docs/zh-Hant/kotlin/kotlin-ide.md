[//]: # (title: 用於 Kotlin 開發的 IDE)

<web-summary>JetBrains 為 IntelliJ IDEA、Android Studio 以及 Visual Studio Code 提供官方 Kotlin IDE 支援。</web-summary>

JetBrains 為以下 IDE 與程式碼編輯器提供官方 Kotlin 支援：[IntelliJ IDEA](#intellij-idea) 與 [Android Studio](#android-studio)。
您也可以為 [Visual Studio Code](#visual-studio-code) 安裝官方的 Kotlin by JetBrains 擴充套件，該套件目前處於 [Alpha](components-stability.md#stability-levels-explained) 階段。

其他 IDE 與程式碼編輯器僅有 Kotlin 社群支援的外掛程式。

## IntelliJ IDEA {id="intellij-idea"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 是一款專為 JVM 語言（如 Kotlin 與 Java）設計的 IDE，旨在極大化開發者生產力。
它透過提供智慧的程式碼補全、靜態程式碼分析與重構作業，為您處理常規且重複性的任務。
它讓您專注於軟體開發中充滿趣味的一面，不僅提高效率，還能帶來愉悅的體驗。

Kotlin 外掛程式隨每個 IntelliJ IDEA 版本一併提供。
每個 IDEA 版本都會引入新功能與升級，以改善 Kotlin 開發者在 IDE 中的體驗。
請參閱 [IntelliJ IDEA 的新功能](https://www.jetbrains.com/idea/whatsnew/)以了解 Kotlin 的最新更新與改進。

若要進一步了解 IntelliJ IDEA，請參閱[官方文件](https://www.jetbrains.com/help/idea/discover-intellij-idea.html)。

## Android Studio {id="android-studio"}

[Android Studio](https://developer.android.com/studio) 是 Android 應用程式開發的官方 IDE，基於 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
除了 IntelliJ 強大的程式碼編輯器與開發者工具之外，Android Studio 還提供了更多功能，可提升您在建置 Android 應用程式時的生產力。

Kotlin 外掛程式隨每個 Android Studio 版本一併提供。

若要進一步了解 Android Studio，請參閱[官方文件](https://developer.android.com/studio/intro)。

## Visual Studio Code {id="visual-studio-code"}
<primary-label ref="alpha"/>

[Visual Studio Code](https://code.visualstudio.com/) 是一款擁有眾多擴充套件的程式碼編輯器，其中包括[官方的 Kotlin by JetBrains 擴充套件](https://marketplace.visualstudio.com/items?itemName=JetBrains.kotlin-server)。

該 Kotlin 擴充套件透過 Kotlin 語言伺服器提供程式碼補全、導覽、偵錯以及其他 Kotlin 開發功能。

欲了解更多資訊，請參閱 [Kotlin 語言伺服器與 Visual Studio Code](kotlin-lsp.md#kotlin-in-visual-studio-code)。

## 其他 IDE 支援 {id="other-ide-support"}

JetBrains 不為其他 IDE 提供官方 Kotlin 外掛程式。
您可以在其他程式碼編輯器中使用 [Kotlin 語言伺服器](kotlin-lsp.md)。

若要在沒有 IDE 相關功能（例如程式碼格式化、偵錯工具、重構）的文字編輯器中使用 Kotlin，您可以從 Kotlin [GitHub Releases](%kotlinLatestUrl%) 下載最新的 Kotlin 命令列編譯器 (`kotlin-compiler-%kotlinVersion%.zip`) 並[手動安裝](command-line.md#manual-install)。此外，您也可以使用封裝管理員，例如 [Homebrew](command-line.md#homebrew)、[SDKMAN!](command-line.md#sdkman) 與 [Snap package](command-line.md#snap-package)。

## 與 Kotlin 語言版本的相容性 {id="compatibility-with-the-kotlin-language-versions"}

對於 IntelliJ IDEA 與 Android Studio，Kotlin 外掛程式隨每個版本一併提供。
當發佈新的 Kotlin 版本時，這些工具會自動建議將 Kotlin 更新至最新版本。
請在 [Kotlin 版本發佈](releases.md#ide-support)中查看最新支援的語言版本。

## IDE 中的 AI 支援 {id="ai-support-in-ides"}

IntelliJ IDEA 與 Android Studio 透過內建的 AI 功能以及與 AI 編碼代理 (AI coding agent) 的整合，支援 AI 輔助的 Kotlin 開發。根據您的工作流程，您可以直接在 IDE 中使用 AI、連接外部代理，或將 AI 工具與 Kotlin 專屬指導相結合。

如需可用 AI 工具的總覽以及何時使用它們，請參閱 [](ai-for-development.md)。

## 下一步？ {id="what-s-next"}

* [在 IntelliJ IDEA 中建立主控台應用程式](jvm-get-started.md)
* [使用 Android Studio 建立您的第一個跨平台行動應用程式](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)