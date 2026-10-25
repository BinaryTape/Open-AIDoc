[//]: # (title: 編譯器外掛程式)

<snippet id="compiler-plugin-description">
編譯器外掛程式可在程式碼編譯期間掛鉤至編譯過程，藉此分析或修改程式碼，而無需修改編譯器本身。例如，它們可以為程式碼加入註解，或是產生新程式碼以使其與其他架構或 API 相容。
</snippet>

本頁面介紹可供使用的 Kotlin 編譯器外掛程式，以及在這些外掛程式皆不符合您的使用案例時可以採取的做法。

Kotlin 團隊維護以下編譯器外掛程式：

| 外掛程式 | 說明 |
|---|---|
| [All-open](all-open-plugin.md) | 自動將帶有註解的類別及其成員設為 `open`，以便架構能在執行階段擴充它們。 |
| [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu) | 將原子操作轉換為高效且針對特定平台的實作，以實現無鎖並行 (lock-free concurrency)。 |
| [DataFrame](https://kotlin.github.io/dataframe/compiler-plugin.html) | 產生型別化 API，讓您能以安全且符合 Kotlin 慣用語的方式操作 [`DataFrame`](https://kotlin.github.io/dataframe/home.html)。 |
| [JPA](kotlin-jpa-plugin.md) | 將帶有 JPA 註解的實體設為 `open`，並為其產生零引數建構函式；包裝了 `all-open` 與 `no-arg`。 |
| [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects) | 將 Kotlin 類別公開為純 JavaScript 物件，以改善與 JS 工具鏈及程式庫的互通性。 |
| [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen) | 產生應用程式二進位介面 (ABI) JAR 檔。 |
| [kapt](kapt.md) | 在 Kotlin 程式碼上執行 Java 註解處理器，並產生額外的原始碼檔案。 |
| [Lombok](lombok.md) | 讓 Kotlin 程式碼能夠辨識並使用 Java 原始碼中由 Lombok 註解產生的程式碼。 |
| [`no-arg`](no-arg-plugin.md) | 為帶有註解的類別產生無引數建構函式，以支援需要此類建構函式的架構。 |
| [Power-assert](power-assert.md) | 透過顯示運算式各部分的詳細值，增強斷言失敗時的資訊呈現。 |
| [SAM with receiver](sam-with-receiver-plugin.md) | 允許 SAM 介面使用帶有接收者的 Lambda 運算式，以實現更貼近 DSL 的語法。 |
| [Serialization](serialization.md) | 產生無需透過反射即可序列化與反序列化 Kotlin 物件的程式碼。 |
| [Spring](kotlin-spring-plugin.md) | 將帶有 Spring 註解的類別與成員設為 `open`；為預先設定好的 `all-open` 包裝函式。 |

Google 的 Android 團隊維護：

| 外掛程式 | 說明 |
|---|---|
| [Compose compiler Gradle plugin](https://developer.android.com/develop/ui/compose/compiler) | 將 Compose 編譯器與 Gradle 整合，以啟用宣告式 UI 功能與 Compose 專屬的最佳化。 |
| [Parcelize plugin](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize) | 自動產生 `Parcelable` 實作，讓您可以在 Android 元件之間傳遞 Kotlin 物件。 |

如果您需要調整編譯過程，而上述外掛程式無法涵蓋您的需求，請先確認是否可以使用
[Kotlin 符號處理 (KSP) API](https://kotlinlang.org/docs/ksp-overview.html) 或外部程式碼檢查工具（例如 [Android lint](https://developer.android.com/studio/write/lint)）。
您可以瀏覽我們的 [Kotlin Slack](https://slack-chats.kotlinlang.org/c/compiler) 或[與我們聯絡](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，
針對您的使用案例尋求建議。

如果您*仍然*找不到符合需求的方案，可以[建立自訂編譯器外掛程式](custom-compiler-plugins.md)。請僅將此做法作為最後手段，
因為 Kotlin 編譯器外掛程式 API **並不穩定**。如果您建立了自訂編譯器外掛程式，
由於每個新的編譯器版本都會引入破壞性變更 (breaking changes)，您將需要投入大量的持續心力來維護它。