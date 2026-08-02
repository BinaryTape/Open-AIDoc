[//]: # (title: 建置多平台 Kotlin 程式庫)

建立 Kotlin 程式庫時，請考慮[支援 Kotlin Multiplatform 並進行建置與發佈](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html)。
這能擴大程式庫的受眾範圍，使其與針對多個平台開發的專案相容。

> 您可以在 [klibs.io](https://klibs.io/) 上找到適用於不同使用案例和目標平台的現成 Kotlin Multiplatform 程式庫。
> 
{style="tip"}

以下章節提供的指南可協助您有效地建置 Kotlin Multiplatform 程式庫。

## 擴大觸及範圍

為了讓您的程式庫能作為相依性提供給最多數量的專案，
請目標支援盡可能多的 Kotlin Multiplatform [目標平台](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html#targets)。

如果您的程式庫不支援多平台專案（無論是程式庫還是應用程式）所使用的平台，
該專案將難以依賴您的程式庫。
在這種情況下，專案可能必須在某些平台使用您的程式庫，而針對其他平台則需實作獨立的解決方案，
或者乾脆選擇另一個支援其所有平台的替代程式庫。

為了簡化構件產出，請使用[交叉編譯](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html#host-requirements)從任何主機發佈 Kotlin Multiplatform 程式庫。
這讓您能夠在沒有 Apple 電腦的情況下，為 Apple 目標平台產生 `.klib` 構件。

> 對於 Kotlin/Native 目標平台，請考慮使用[分層方法](native-target-support.md#for-library-authors)來支援所有可能的目標。
>
{style="note"}

## 針對通用程式碼設計 API

在建立程式庫時，應將 API 設計為可從通用 Kotlin 程式碼中使用，而不是編寫平台特定的實作。

請盡可能提供合理的預設配置，並包含平台特定的配置選項。
良好的預設值能讓使用者從通用 Kotlin 程式碼中使用程式庫的 API，而無需為了配置程式庫而編寫平台特定的實作。

請根據以下優先順序，將 API 放置在最廣泛相關的原始碼集中：

* **`commonMain` 原始碼集：** `commonMain` 原始碼集中的 API 可用於程式庫支援的所有平台。請致力於將程式庫的大部分 API 放置於此。
* **中間原始碼集：** 如果某些平台不支援特定的 API，請使用[中間原始碼集](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-discover-project.html#intermediate-source-sets)來針對特定平台。
例如，您可以為支援多執行緒的目標建立 `concurrent` 原始碼集，或為所有非 JVM 目標建立 `nonJvm` 原始碼集。
* **平台特定原始碼集：** 對於平台特定的 API，請使用如 `androidMain` 之類的原始碼集。

> 若要進一步了解 Kotlin Multiplatform 專案的原始碼集，請參閱[階層式專案結構](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-hierarchy.html)。
>
{style="tip"}

## 確保跨平台行為一致

為了確保您的程式庫在所有支援的平台上表現一致，
多平台程式庫中的 API 應在所有平台上接受相同範圍的有效輸入、執行相同的操作，
並傳回相同的結果。
同樣地，程式庫應以統一的方式處理無效輸入，並在所有平台上一致地回報錯誤或拋出例外。

不一致的行為會使程式庫難以使用，並迫使使用者在通用程式碼中加入條件邏輯來管理平台特定的差異。

您可以使用 [`expect` 與 `actual` 宣告](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html)在通用程式碼中宣告函式，
並配合平台特定的實作，以完全存取各個平台的原生 API。
這些實作也必須具備相同的行為，以確保能從通用程式碼中可靠地使用。

當 API 在跨平台行為一致時，只需在 `commonMain` 原始碼集中撰寫一次文件。

> 如果平台差異無法避免（例如當某個平台
> 支援更廣泛的輸入集時），請盡可能減少差異。例如，您可能不想為了與其他平台匹配而限制某個平台的功能。在這種情況下，請明確說明具體的差異。
>
> {style=”note”}

## 在所有平台上進行測試

多平台程式庫可以擁有寫在通用程式碼中的[多平台測試](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-run-tests.html)，並在所有平台上執行。
定期在您支援的平台上執行此通用測試套件，可確保程式庫的行為正確且一致。

定期在所有發佈的平台上測試 Kotlin/Native 目標平台可能具有挑戰性。
然而，為了確保更廣泛的相容性，請考慮為其能支援的所有目標發佈程式庫，並在測試相容性時使用[分層方法](native-target-support.md#for-library-authors)。

使用 [`kotlin-test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫在通用程式碼中編寫測試，並使用平台特定的測試執行器執行測試。

## 考慮非 Kotlin 使用者

Kotlin Multiplatform 在其支援的目標平台上提供與原生 API 和語言的互通性。
建立 Kotlin Multiplatform 程式庫時，請考慮使用者是否需要從 Kotlin 以外的語言
使用您程式庫的型別與宣告。

例如，如果您程式庫中的某些型別將透過互通性公開給 Swift 程式碼，
請將這些型別設計為易於從 Swift 存取。
[Kotlin-Swift 互通性百科 (Kotlin-Swift interopedia)](https://github.com/kotlin-hands-on/kotlin-swift-interopedia) 提供了有關 Kotlin API 在從 Swift 呼叫時呈現方式的實用洞察。

## 推廣您的程式庫

您可以將您的程式庫收錄在 [klibs.io](https://klibs.io/)，這是一個讓開發者尋找與評估 Kotlin Multiplatform 程式庫的搜尋平台。

[klibs.io](https://klibs.io/) 會自動列出符合其收錄標準的程式庫。
若要檢查您的程式庫是否符合資格，請參閱[常見問題](https://klibs.io/faq)。