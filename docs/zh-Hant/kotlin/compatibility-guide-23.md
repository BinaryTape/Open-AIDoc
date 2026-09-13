[//]: # (title: Kotlin 2.3.x 相容性指南)

_[保持語言現代化](kotlin-evolution-principles.md)_與 _[舒適更新](kotlin-evolution-principles.md)_是 Kotlin 語言設計的基本原則。前者指出應移除阻礙語言演進的結構，後者則要求此類移除應事先進行良好溝通，以使程式碼遷移儘可能平滑。

雖然大多數語言變更已透過其他管道宣布（如更新日誌或編譯器警告），但本文件總結了所有變更，為從 Kotlin 2.2 到 Kotlin 2.3 的遷移提供完整參考。本文件也包含工具相關變更的資訊。

## 基本術語 {id="basic-terms"}

在本文件中，我們介紹了幾種相容性：

- _source（原始碼）_：原始碼不相容的變更會導致原本編譯正常的程式碼（無錯誤或警告）無法再編譯
- _binary（二進制）_：若兩個二進制產物可以互相替換而不導致載入或連結錯誤，則稱它們為二進制相容
- _behavioral（行為）_：若同一程式在套用變更前後表現出不同的行為，則稱該變更為行為不相容

請記住，這些定義僅針對純 Kotlin。從其他語言（例如 Java）角度來看的 Kotlin 程式碼相容性不在本文件的討論範圍內。

## 語言 (Language) {id="language"}

### `-language-version` 停止支援 1.8 和 1.9 {id="drop-support-in-language-version-for-1-8-and-1-9"}

> **問題**：[KT-76343](https://youtrack.jetbrains.com/issue/KT-76343), [KT-76344](https://youtrack.jetbrains.com/issue/KT-76344)。
>
> **組建**：編譯器
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：從 Kotlin 2.3 開始，編譯器不再支援 [`-language-version=1.8`](compiler-reference.md#language-version-version)。
> 對於非 JVM 平台，也移除了對 `-language-version=1.9` 的支援。
>
> **棄用週期**：
>
> - 2.2.0：使用版本 1.8 和 1.9 的 `-language-version` 時報告警告
> - 2.3.0：在所有平台上對版本 1.8 的 `-language-version` 提升警告為錯誤，並在非 JVM 平台上對版本 1.9 提升警告為錯誤

### 報告包含 typealias 之推論型別的上界約束違反錯誤 {id="report-upper-bound-constraint-violation-errors-for-inferred-types-with-typealiases"}

> **問題**：[KTLC-287](https://youtrack.jetbrains.com/issue/KTLC-287)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：以前，編譯器從未報告過有關推論型別之上界違反約束的錯誤。這在 Kotlin 2.3.0 中已修復，因此現在會跨所有型別參數一致地報告錯誤。
>
> **棄用週期**：
>
> - 2.2.20：針對隱式型別引數的界限違反報告棄用警告
> - 2.3.0：對隱式型別引數的 `UPPER_BOUND_VIOLATED` 提升警告為錯誤

### 禁止在 `inline` 和 `crossinline` Lambda 上使用 `@JvmSerializableLambda` 註解 {id="prohibit-jvmserializablelambda-annotation-on-inline-and-crossinline-lambdas"}

> **問題**：[KTLC-9](https://youtrack.jetbrains.com/issue/KTLC-9)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：你不能再將 `@JvmSerializableLambda` 註解套用於 `inline` 或 `crossinline` Lambda。
> 這些 Lambda 是不可序列化的，因此套用 `@JvmSerializableLambda` 沒有任何效果。
>
> **棄用週期**：
>
> - 2.1.20：當 `@JvmSerializableLambda` 套用於 `inline` 和 `crossinline` Lambda 時報告警告
> - 2.3.0：將警告提升為錯誤；此變更可在漸進模式中啟用

### 當泛型簽章不相符時，禁止將 Kotlin 介面委派給 Java 類別 {id="prohibit-delegating-a-kotlin-interface-to-a-java-class-when-the-generic-signatures-don-t-match"}

> **問題**：[KTLC-267](https://youtrack.jetbrains.com/issue/KTLC-267)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 禁止委派給使用非泛型覆寫來實作泛型介面方法的 Java 類別。以前，允許此行為會導致型別不符，並在執行時報告 `ClassCastException`。
> 此變更將錯誤從執行時移至編譯時。
>
> **棄用週期**：
>
> - 2.1.20：報告警告
> - 2.3.0：將警告提升為錯誤

### 棄用在未明確宣告回傳型別的運算式主體函式中使用 `return` {id="deprecate-use-of-return-in-expression-bodied-functions-without-explicit-return-type"}

> **問題**：[KTLC-288](https://youtrack.jetbrains.com/issue/KTLC-288)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 現在棄用在未明確宣告函式回傳型別的情況下，在運算式主體內使用 `return`。
>
> **棄用週期**：
>
> - 2.3.0：報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止繼承透過 typealias 引入的可為 null 超型別 {id="prohibit-inheritance-from-nullable-supertypes-introduced-via-typealias"}

> **問題**：[KTLC-279](https://youtrack.jetbrains.com/issue/KTLC-279)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 現在在嘗試從可為 null 的 typealias 繼承時報告錯誤，這與其處理直接可為 null 超型別的方式一致。
>
> **棄用週期**：
>
> - 2.2.0：報告警告
> - 2.3.0：將警告提升為錯誤

### 統一頂層 Lambda 和呼叫引數的泛型簽章產生 {id="unify-generic-signature-generation-for-top-level-lambdas-and-call-arguments"}

> **問題**：[KTLC-277](https://youtrack.jetbrains.com/issue/KTLC-277)
>
> **組建**：反射
>
> **不相容變更類型**：行為
>
> **簡短摘要**：Kotlin 2.3.0 對頂層 Lambda 使用與對作為呼叫引數傳遞的 Lambda 相同的型別檢查邏輯，確保在兩種情況下產生一致的泛型簽章。
>
> **棄用週期**：
>
> - 2.3.0：引入新行為；不適用於漸進模式

### 禁止具現化型別參數被推論為交集型別 {id="prohibit-reified-type-parameters-from-being-inferred-as-intersection-types"}

> **問題**：[KTLC-13](https://youtrack.jetbrains.com/issue/KTLC-13)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 禁止將具現化型別參數推論為交集型別的情況，因為這可能會導致錯誤的執行時行為。
>
> **棄用週期**：
>
> - 2.1.0：當具現化型別參數被推論為交集型別時報告警告
> - 2.3.0：將警告提升為錯誤

### 禁止透過型別參數界限公開可見性較低的型別 {id="prohibit-exposing-less-visible-types-through-type-parameter-bounds"}

> **問題**：[KTLC-275](https://youtrack.jetbrains.com/issue/KTLC-275)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 禁止使用公開比函式或宣告本身更具限制性之可見性型別的型別參數界限，使函式規則與已套用於類別的規則保持一致。
>
> **棄用週期**：
>
> - 2.1.0：在有問題的型別參數界限上報告警告
> - 2.3.0：將警告提升為錯誤

## 標準程式庫 (Standard library) {id="standard-library"}

### 棄用 Char 到數字的轉換，並引入明確的 digit 和 code API {id="deprecate-char-to-number-conversions-and-introduce-explicit-digit-and-code-apis"}

> **問題**：[KTLC-321](https://youtrack.jetbrains.com/issue/KTLC-321)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 棄用了數值型別的 `Char.toX()` 和 `X.toChar()` 轉換，並引入了用於存取字元代碼和數字值的新明確 API。
>
> **棄用週期**：
>
> - 1.4.30：引入新函式作為實驗性
> - 1.5.0：將新函式提升為穩定；針對舊函式報告警告並提供替換建議
> - 2.3.0：將警告提升為錯誤

### 棄用 `Number.toChar()` 函式 {id="deprecate-number-tochar-function"}

> **問題**：[KT-56822](https://youtrack.jetbrains.com/issue/KT-56822)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`Number.toChar()` 函式已棄用。請改用 `toInt().toChar()` 或 `Char` 建構函式。
>
> **棄用週期**：
>
> - 1.9.0：使用 `Number.toChar()` 函式時報告警告
> - 2.3.0：將警告提升為錯誤

### 棄用 `String.subSequence(start, end)` 函式 {id="deprecate-string-subsequence-start-end-function"}

> **問題**：[KTLC-282](https://youtrack.jetbrains.com/issue/KTLC-282)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`String.subSequence(start, end)` 函式已棄用。請改用 [`String.subSequence(startIndex, endIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/sub-sequence.html) 函式。
>
> **棄用週期**：
>
> - 1.0：使用 `String.subSequence(start, end)` 時報告警告
> - 2.3.0：將警告提升為錯誤

### 棄用 `kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函式 {id="deprecate-kotlin-io-createtempdirectory-and-kotlin-io-createtempfile-functions"}

> **問題**：[KTLC-281](https://youtrack.jetbrains.com/issue/KTLC-281)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函式已棄用。
> 請改用 [`kotlin.io.path.createTempDirectory()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-directory.html) 和 [`kotlin.io.path.createTempFile()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-file.html) 函式。
>
> **棄用週期**：
>
> - 1.4.20：使用 `kotlin.io.createTempDirectory()` 和 `kotlin.io.createTempFile()` 函式時報告警告
> - 2.3.0：將警告提升為錯誤

### 隱藏 `InputStream.readBytes(Int)` 函式 {id="hide-inputstream-readbytes-int-function"}

> **問題**：[KTLC-280](https://youtrack.jetbrains.com/issue/KTLC-280)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：在棄用很長一段時間後，`InputStream.readBytes(estimatedSize: Int = DEFAULT_BUFFER_SIZE): ByteArray` 函式現在已被隱藏。
>
> **棄用週期**：
>
> - 1.3.0：報告警告
> - 1.5.0：將警告提升為錯誤
> - 2.3.0：隱藏該函式

### 統一 Kotlin/Native 與其他平台的堆疊追蹤列印 {id="unify-kotlin-native-stack-trace-printing-with-other-platforms"}

> **問題**：[KT-81431](https://youtrack.jetbrains.com/issue/KT-81431)
>
> **組建**：Kotlin/Native
>
> **不相容變更類型**：行為
>
> **簡短摘要**：格式化例外堆疊追蹤時，如果已列印過相同的例外原因，則不再列印額外的原因。
>
> **棄用週期**：
>
> - 2.3.20：統一 Kotlin/Native 與其他 Kotlin 平台的例外堆疊追蹤格式

### 修正 `Iterable<T>.intersect()` 和 `Iterable<T>.subtract()` 的行為 {id="correct-iterable-t-intersect-and-iterable-t-subtract-behavior"}

> **問題**：[KTLC-268](https://youtrack.jetbrains.com/issue/KTLC-268)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：行為
>
> **簡短摘要**：[`Iterable<T>.intersect()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/intersect.html) 和 [`Iterable<T>.subtract()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/subtract.html) 函式現在會在將每個接收端元素加入結果集之前測試其成員資格。結果集使用 `Any::equals` 比較元素，確保即使引數集合使用參照相等性（例如 `IdentityHashMap.keys`），也能獲得正確的結果。
>
> **棄用週期**：
>
> - 2.3.0：啟用新行為

## 工具 (Tools) {id="tools"}

### 同時使用 `kotlin-dsl` 和 `kotlin("jvm")` 外掛程式時的不支援 KGP 版本警告 {id="unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins"}

> **問題**：[KT-79851](https://youtrack.jetbrains.com/issue/KT-79851)
>
> **組建**：Gradle
>
> **不相容變更類型**：行為
>
> **簡短摘要**：在 Kotlin 2.3 中，如果你在 Gradle 專案中同時使用 `kotlin-dsl` **和** `kotlin("jvm")` 外掛程式，你可能會看到關於不支援的 Kotlin Gradle 外掛程式 (KGP) 版本的 Gradle 警告。
>
> **遷移步驟**：
> 
> 通常我們不建議在同一個 Gradle 專案中同時使用 `kotlin-dsl` 和 `kotlin("jvm")` 外掛程式。此配置不被支援。
> 
> 對於慣例外掛程式、預先編譯的腳本外掛程式或任何其他形式的未發佈建置邏輯，你有三個選項：
> 
> 1. 不要明確套用 `kotlin("jvm")` 外掛程式。相反地，讓 `kotlin-dsl` 外掛程式自動提供相容的 KGP 版本。
> 2. 如果你想明確套用 `kotlin("jvm")` 外掛程式，請使用 [`embeddedKotlinVersion`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.kotlin.dsl/embedded-kotlin-version.html) 常數來指定內嵌的 Kotlin 版本。
>
>     要升級內嵌的 Kotlin 和語言版本，請更新你的 Gradle 版本。你可以在 Gradle 的 [Kotlin 相容性注意事項](https://docs.gradle.org/current/userguide/compatibility.html#kotlin)中找到相容的 Gradle 版本。
> 
> 3. 不要使用 `kotlin-dsl` 外掛程式。這對於不限於特定 Gradle 版本的二進制外掛程式可能更合適。
>
> 作為最後的手段，你可以將專案配置為使用語言版本 2.1 或更高版本，這會覆蓋 `kotlin-dsl` 外掛程式的衝突行為。但是，我們強烈建議不要這樣做。
> 
> 如果你在遷移過程中遇到困難，請在我們的 [Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 的 #gradle 頻道中尋求支援。
> 
> **棄用週期**：
>
> - 2.3.0：引入診斷功能，偵測何時將 `kotlin-dsl` 外掛程式與不相容的編譯器語言或 API 版本一起使用

### 針對 AGP 9.0.0 及更高版本棄用 `kotlin-android` 外掛程式 {id="deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later"}

> **問題**：[KT-81199](https://youtrack.jetbrains.com/issue/KT-81199)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：在 Kotlin 2.3.0 中，當使用 Android Gradle 外掛程式 (AGP) 9.0.0 或更高版本時，`org.jetbrains.kotlin.android` 外掛程式已棄用。
> 從 AGP 9.0.0 開始，[AGP 提供對 Kotlin 的內建支援](https://kotl.in/gradle/agp-built-in-kotlin)，因此不再需要 `kotlin-android` 外掛程式。
>
> **棄用週期**：
>
> - 2.3.0：當 `kotlin-android` 外掛程式與 AGP 9.0.0 或更高版本一起使用，且 `android.builtInKotlin` 和 `android.newDsl=false` Gradle 屬性都設置為 `false` 時報告警告

### 棄用 `testApi` 配置 {id="deprecate-testapi-configuration"}

> **問題**：[KT-63285](https://youtrack.jetbrains.com/issue/KT-63285)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 棄用了 `testApi` 配置。此配置將測試相依性和原始碼公開給其他模組，但 Gradle 不支援此行為。
> 
> **遷移選項**：
> 將所有 `testApi()` 實例替換為 `testImplementation()`，對其他變體也進行同樣操作。例如，
> 將 `kotlin.sourceSets.commonTest.dependencies.api()` 替換為 `kotlin.sourceSets.commonTest.dependencies.implementation()`。
> 
> 對於 Kotlin/JVM 專案，請考慮改用 Gradle 的 [測試夾具 (test fixtures)](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)。
> 如果你希望在多平台專案中看到對測試夾具的支援，請在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-63142) 中分享你的使用案例。
> 
> **棄用週期**：
>
> - 2.3.0：報告警告

### 棄用 `createTestExecutionSpec()` 函式 {id="deprecate-createtestexecutionspec-function"}

> **問題**：[KT-75449](https://youtrack.jetbrains.com/issue/KT-75449)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 棄用了 `KotlinJsTestFramework` 介面中的 `createTestExecutionSpec()` 函式，因為它已不再使用。
>
> **棄用週期**：
>
> - 2.2.20：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除該函式

### 移除 `closureTo()`、`createResultSet()` 和 `KotlinToolingVersionOrNull()` 函式 {id="remove-closureto-createresultset-and-kotlintoolingversionornull-functions"}

> **問題**：[KT-64273](https://youtrack.jetbrains.com/issue/KT-64273)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 從 `closure` DSL 中移除了 `closureTo()`、`createResultSet()` 函式，因為它們不再被使用。此外，`KotlinToolingVersionOrNull()` 函式也被移除。請改用 `KotlinToolingVersion()` 函式。
>
> **棄用週期**：
> 
> - 1.7.20：報告錯誤
> - 2.3.0：移除這些函式

### 棄用 `ExtrasProperty` API {id="deprecate-the-extrasproperty-api"}

> **問題**：[KT-74915](https://youtrack.jetbrains.com/issue/KT-74915)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：自 Kotlin 2.0.0 起已棄用的 `ExtrasProperty` API，現在在 Kotlin 2.3.0 中被設為內部使用。
> 請改用 Gradle 的 [`ExtraPropertiesExtension`](https://docs.gradle.org/current/dsl/org.gradle.api.plugins.ExtraPropertiesExtension.html) API 作為替代。
> 
> **棄用週期**：
>
> - 2.0.0：報告警告
> - 2.1.0：將警告提升為錯誤
> - 2.3.0：將 API 設為內部 (internal)

### 棄用 `KotlinCompilation` 中的 `HasKotlinDependencies` {id="deprecate-haskotlindependencies-in-kotlincompilation"}

> **問題**：[KT-67290](https://youtrack.jetbrains.com/issue/KT-67290)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 棄用了 [`KotlinCompilation`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compilation/) 中的 `HasKotlinDependencies` 介面。
> 相依性相關的 API 現在改由 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 介面公開。
>
> **棄用週期**：
>
> - 2.3.0：報告警告

### 棄用 npm 和 Yarn 封裝管理員內部函式與屬性 {id="deprecate-npm-and-yarn-package-manager-internal-functions-and-properties"}

> **問題**：[KT-81009](https://youtrack.jetbrains.com/issue/KT-81009)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：下列與 npm 和 Yarn 封裝管理員相關的函式與屬性已棄用：
> 
> * `CompositeDependency.dependencyName`, `CompositeDependency.dependencyVersion`, `CompositeDependency.includedBuildDir`。
> * `KotlinNpmInstallTask.Companion.NAME`。
> * `LockCopyTask.Companion.STORE_PACKAGE_LOCK_NAME`, `LockCopyTask.Companion.RESTORE_PACKAGE_LOCK_NAME`, `LockCopyTask.Companion.UPGRADE_PACKAGE_LOCK`。
> * `Npm.npmExec()`。
> * `NpmProject.require()`, `NpmProject.useTool()`。
> * `PublicPackageJsonTask.jsIrCompilation`。
> * `YarnBasics.yarnExec()`。
> * `YarnPlugin.Companion.STORE_YARN_LOCK_NAME`, `YarnPlugin.Companion.RESTORE_YARN_LOCK_NAME`, `YarnPlugin.Companion.UPGRADE_YARN_LOCK`。
> * `YarnSetupTask.Companion.NAME`。
>
> **棄用週期**：
>
> - 2.2.0 和 2.2.20：使用這些函式或屬性時報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除這些函式與屬性

### 棄用對 PhantomJS 的支援 {id="deprecate-support-for-phantomjs"}

> **問題**：[KT-76019](https://youtrack.jetbrains.com/issue/KT-76019)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：由於 PhantomJS 不再維護，Kotlin 2.3.0 棄用了 `NpmVersions` API 中的 `karmaPhantomjsLauncher` 屬性。
> 
> **棄用週期**：
>
> - 2.3.0：報告警告

### 禁止子類別化用於設置測試執行或 JavaScript 執行階段的類別 {id="prohibit-subclassing-of-classes-that-set-up-test-runs-or-javascript-runtime"}

> **問題**：[KT-75869](https://youtrack.jetbrains.com/issue/KT-75869), [KT-81007](https://youtrack.jetbrains.com/issue/KT-81007)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 禁止子類別化下列類別：
> * `KotlinTest`
> * `KotlinNativeTest`
> * `KotlinJsTest`
> * `KotlinJsIrTarget`
> * `KotlinNodeJsIr`
> * `KotlinD8Ir`
> * `KotlinKarma`
> * `KotlinMocha`
> * `KotlinWebpack`
> * `TypeScriptValidationTask`
> * `YarnRootExtension`
> 
> 這些類別從未打算被子類別化。所有子類別化的使用案例現在都應由 Kotlin Gradle 外掛程式 DSL 提供的配置區塊涵蓋。
> 如果這些任務的現有 API 無法滿足你設置測試執行或 JavaScript 執行階段的需求，請在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-75869) 中分享你的意見。
>
> **棄用週期**：
>
> - 2.2.0：對從這些類別建立子類別的程式碼報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除這些 API

### 棄用 `ExperimentalWasmDsl` 註解類別 {id="deprecate-experimentalwasmdsl-annotation-class"}

> **問題**：[KT-81005](https://youtrack.jetbrains.com/issue/KT-81005)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`ExperimentalWasmDsl` 註解類別已棄用，因為功能已移至 `kotlin-plugin-annotations` 模組。
>
> **棄用週期**：
>
> - 2.0.20：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除該註解類別

### 棄用 `ExperimentalDceDsl` 註解類別 {id="deprecate-experimentaldcedsl-annotation-class"}

> **問題**：[KT-81008](https://youtrack.jetbrains.com/issue/KT-81008)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`ExperimentalDceDsl` 註解類別已不再使用，因此已被棄用。
>
> **棄用週期**：
>
> - 2.2.0：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除該註解類別

### 棄用 JavaScript 工具程式 {id="deprecate-javascript-utilities"}

> **問題**：[KT-81010](https://youtrack.jetbrains.com/issue/KT-81010)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：下列函式與屬性僅供內部使用，因此已被棄用：
> * `JsIrBinary.generateTs`
> * `KotlinJsIrLink.mode`
> * `NodeJsSetupTask.Companion.NAME`
> * `Appendable.appendConfigsFromDir()`
> * `ByteArray.toHex()`
> * `FileHasher.calculateDirHash()`
> * `String.jsQuoted()`
>
> **棄用週期**：
>
> - 2.2.0：使用 `KotlinJsIrLink.mode` 屬性時報告警告
> - 2.2.0：使用 `NodeJsSetupTask.Companion.NAME` 屬性和函式時報告警告
> - 2.2.20：使用 `JsIrBinary.generateTs` 屬性時報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除這些 API

### 棄用已遷移的 D8 和 Binaryen 屬性 {id="deprecate-migrated-d8-and-binaryen-properties"}

> **問題**：[KT-81006](https://youtrack.jetbrains.com/issue/KT-81006)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：下列屬性已棄用，因為它們已從 `org.jetbrains.kotlin.gradle.targets.js` 套件遷移至 `org.jetbrains.kotlin.gradle.targets.wasm` 套件：
> 
> * `binaryen.BinaryenEnvSpec`
> * `binaryen.BinaryenExtension`
> * `binaryen.BinaryenPlugin`
> * `binaryen.BinaryenRootPlugin`
> * `BinaryenSetupTask.Companion.NAME`
> * `d8.D8EnvSpec`
> * `d8.D8Plugin`
> * `D8SetupTask.Companion.NAME`
>
> **棄用週期**：
>
> - 2.2.0：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除這些屬性

### 棄用 `NodeJsExec` DSL 中的 `create()` 函式 {id="deprecate-create-function-in-nodejsexec-dsl"}

> **問題**：[KT-81004](https://youtrack.jetbrains.com/issue/KT-81004)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`NodeJsExec` DSL 伴隨物件中的 `create()` 函式已棄用。請改用 `register()` 函式。
>
> **棄用週期**：
>
> - 2.1.20：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除該函式

### 棄用 `kotlinOptions` DSL 中的屬性 {id="deprecate-properties-in-kotlinoptions-dsl"}

> **問題**：[KT-76720](https://youtrack.jetbrains.com/issue/KT-76720)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：自 Kotlin 2.2.0 起，透過 `kotlinOptions` DSL 和相關的 `KotlinCompile<KotlinOptions>` 任務介面配置編譯器選項的能力已被棄用，取而代之的是新的 `compilerOptions` DSL。
> Kotlin 2.3.0 繼續對 `kotlinOptions` 介面中的所有屬性進行棄用週期。
> 要進行遷移，請使用 `compilerOptions` DSL 來配置編譯器選項。有關遷移指南，請參閱 [從 `kotlinOptions {}` 遷移至 `compilerOptions {}`](gradle-compiler-options.md#migrate-from-kotlinoptions-to-compileroptions)。
>
> **棄用週期**：
>
> - 2.0.0：對 `kotlinOptions` DSL 報告警告
> - 2.2.0：將警告提升為錯誤，並棄用 `kotlinOptions` 中的所有屬性
> - 2.3.0：對 `kotlinOptions` 中的所有屬性將警告提升為錯誤

### 棄用 `kotlinArtifacts` API {id="deprecate-kotlinartifacts-api"}

> **問題**：[KT-77066](https://youtrack.jetbrains.com/issue/KT-77066)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：實驗性的 `kotlinArtifacts` API 已棄用。請使用 Kotlin Gradle 外掛程式中現有的 DSL 來 [建置最終原生二進制檔](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。
> 如果現有 DSL 不足以進行遷移，請在 [此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-74953) 中留言。
>
> **棄用週期**：
>
> - 2.2.0：使用 `kotlinArtifacts` API 時報告警告
> - 2.3.0：將此警告提升為錯誤
> - 2.4.0：移除該 API

### 移除 `kotlin.mpp.resourcesResolutionStrategy` Gradle 屬性 {id="remove-kotlin-mpp-resourcesresolutionstrategy-gradle-property"}

> **問題**：[KT-74955](https://youtrack.jetbrains.com/issue/KT-74955)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：以前 `kotlin.mpp.resourcesResolutionStrategy` Gradle 屬性因未被使用而被棄用。在 Kotlin 2.3.0 中，該 Gradle 屬性已被完全移除。
>
> **棄用週期**：
>
> - 2.2.0：報告配置階段診斷
> - 2.3.0：移除該 Gradle 屬性

### 棄用舊模式的多平台 IDE 匯入 {id="deprecated-old-mode-of-multiplatform-ide-import"}

> **問題**：[KT-61127](https://youtrack.jetbrains.com/issue/KT-61127)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：在 Kotlin 2.3.0 之前，我們支援多種模式的多平台 IDE 匯入。現在，較舊的模式已棄用，僅保留一種可用模式。以前，舊模式是使用 `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 屬性啟用的。現在使用此屬性將觸發棄用警告。
>
> **棄用週期**：
>
> - 2.3.0：使用 `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 屬性時報告警告

### 移除用於停用精確編譯備份的屬性 {id="remove-properties-to-disable-precise-compilation-backup"}

> **問題**：[KT-81038](https://youtrack.jetbrains.com/issue/KT-81038)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 1.9.0 引入了一種稱為精確編譯備份 (precise compilation backup) 的增量編譯實驗性最佳化。經過成功測試，此最佳化在 Kotlin 2.0.0 中已預設啟用。Kotlin 2.3.0 移除了用於退出此最佳化的 `kotlin.compiler.preciseCompilationResultsBackup` 和 `kotlin.compiler.keepIncrementalCompilationCachesInMemory` Gradle 屬性。
>
> **棄用週期**：
>
> - 2.1.20：報告警告
> - 2.3.0：移除這些屬性

### 棄用 `CInteropProcess` 中的 `destinationDir` {id="deprecate-destinationdir-in-cinteropprocess"}

> **問題**：[KT-74910](https://youtrack.jetbrains.com/issue/KT-74910)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`CInteropProcess` 任務中的 `destinationDir` 屬性已棄用。
> 請改用 `CInteropProcess.destinationDirectory.set()` 函式。
>
> **棄用週期**：
>
> - 2.1.0：使用 `destinationDir` 屬性時報告警告
> - 2.2.0：將此警告提升為錯誤
> - 2.3.0：隱藏 `destinationDir` 屬性

### 棄用 `CInteropProcess` 中的 `konanVersion` {id="deprecate-konanversion-in-cinteropprocess"}

> **問題**：[KT-74911](https://youtrack.jetbrains.com/issue/KT-74911)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`CInteropProcess` 任務中的 `konanVersion` 屬性已棄用。
> 請改用 `CInteropProcess.kotlinNativeVersion`。
>
> **棄用週期**：
>
> - 2.1.0：使用 `konanVersion` 屬性時報告警告
> - 2.2.0：將此警告提升為錯誤
> - 2.3.0：隱藏 `konanVersion` 屬性

### 移除 `KotlinCompile.classpathSnapshotProperties` 屬性 {id="remove-kotlincompile-classpathsnapshotproperties-properties"}

> **問題**：[KT-76177](https://youtrack.jetbrains.com/issue/KT-76177)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`kotlin.incremental.useClasspathSnapshot` Gradle 屬性已在 Kotlin 2.2.0 中移除。
> 在 Kotlin 2.3.0 中，下列屬性也將被移除：
> * `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot`
> * `KotlinCompile.classpathSnapshotProperties.classpath`
>
> **棄用週期**：
>
> - 2.0.20：對 `kotlin.incremental.useClasspathSnapshot` 屬性報告警告棄用
> - 2.2.0：移除 `kotlin.incremental.useClasspathSnapshot` 屬性
> - 2.3.0：移除 `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot` 和 `KotlinCompile.classpathSnapshotProperties.classpath` 屬性

### 棄用 `getPluginArtifactForNative()` 函式 {id="deprecate-getpluginartifactfornative-function"}

> **問題**：[KT-78870](https://youtrack.jetbrains.com/issue/KT-78870)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：在 Kotlin 2.2.20 中，[`getPluginArtifactForNative()` 函式已被棄用](whatsnew2220.md#reduced-size-of-kotlin-native-distribution)。 
> 請改用 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 函式。
>
> **棄用週期**：
>
> - 2.2.20：報告警告
> - 2.3.0：將警告提升為錯誤
> - 2.4.0：移除該函式

### 變更註冊所有產生之原始碼的方法 {id="change-the-approach-to-registering-all-generated-sources"}

> **問題**：[KT-45161](https://youtrack.jetbrains.com/issue/KT-45161)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：Kotlin 2.3.0 在 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 介面中引入了一個新的 [實驗性](components-stability.md#stability-levels-explained) API，讓你可以在 Gradle 專案中 [註冊產生的原始碼](gradle-configure-project.md#register-generated-sources)。以前，你可以使用 [`kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 屬性來存取所有產生的原始碼。從 Kotlin 2.3.0 開始，如果你的外掛程式或建置邏輯需要存取所有產生的原始碼，請改用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 屬性。
>
> **遷移建議**：
> * 要註冊產生的原始碼，請使用 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 屬性。
> * 要存取所有原始碼（包括非產生的原始碼），請使用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 屬性。

### 棄用 `kotlin.publishJvmEnvironmentAttribute` 屬性 {id="deprecate-kotlin-publishjvmenvironmentattribute-property"}

> **問題**：[KT-83678](https://youtrack.jetbrains.com/issue/KT-83678)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：在 Kotlin 2.3.20 中，`kotlin.publishJvmEnvironmentAttribute` 屬性已棄用。
> 此屬性允許停用多平台程式庫中 `org.gradle.jvm.environment` 屬性的發佈。
> 從 Kotlin 2.0.20 開始，預設會發佈 `org.gradle.jvm.environment` 以確保常規的相依性解析。
>
> **棄用週期**：
>
> - 2.3.20：報告警告
> - 2.4.0：移除該屬性

### 棄用 `CleanableStore` 介面和 `CleanDataTask` 類別 {id="deprecate-cleanablestore-interface-and-cleandatatask-class"}

> **問題**：[KT-78104](https://youtrack.jetbrains.com/issue/KT-78104)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`CleanableStore` 介面和 `CleanDataTask` 類別已棄用，因為它們已不再使用。
>
> **棄用週期**：
>
> - 2.3.20：報告警告
> - 2.4.20：將警告提升為錯誤

### 棄用 `kotlin.kmp.isolated-projects.support` Gradle 屬性 {id="deprecate-kotlin-kmp-isolated-projects-support-gradle-property"}

> **問題**：[KT-79257](https://youtrack.jetbrains.com/issue/KT-79257)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：由於多平台專案預設與隔離專案 (isolated projects) 相容，且沒有其他選項，因此 `kotlin.kmp.isolated-projects.support` Gradle 屬性已棄用。
>
> **棄用週期**：
>
> - 2.3.20：報告警告

### 棄用 `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 屬性 {id="deprecate-kotlin-mpp-enablekotlintoolingmetadataartifact-gradle-property"}

> **問題**：[KT-79924](https://youtrack.jetbrains.com/issue/KT-79924)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：由於現在多平台專案總是會產生 `kotlin-tooling-metadata.json` 成品 (artifact)，因此 `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 屬性已棄用。
>
> **棄用週期**：
>
> - 2.3.20：報告警告
> - 2.4.0：停止支援

### 棄用 `LanguageSettings.enableLanguageFeature` DSL {id="deprecate-languagesettings-enablelanguagefeature-dsl"}

> **問題**：[KT-82323](https://youtrack.jetbrains.com/issue/KT-82323), [KT-82847](https://youtrack.jetbrains.com/issue/KT-82847)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：`LanguageSettings.enableLanguageFeature` DSL 公開了一個僅供 Kotlin 編譯器測試使用的內部編譯器配置。因此，該 DSL 已被棄用。
>
> **棄用週期**：
>
> - 2.3.20：使用 `LanguageSettings.enableLanguageFeature` 時報告警告
> - 2.4.0：將警告提升為錯誤

### 棄用「進程外」(out of process) 編譯器執行策略 {id="deprecate-out-of-process-compiler-execution-strategy"}

> **問題**：[KT-83125](https://youtrack.jetbrains.com/issue/KT-83125)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡短摘要**：「進程外」(out of process) [編譯器執行策略](compiler-execution-strategy.md) 不受 [建置工具 API](build-tools-api.md) 支援，且是現有最慢的策略。在 Kotlin 2.3.20 中，該策略已被棄用，建議改用「daemon」（常駐程式）和「進程內」(in process) 編譯器執行策略。
>
> **棄用週期**：
>
> - 2.3.20：報告警告
> - 2.4.0：移除「進程外」(out of process) 編譯器執行策略

## 移除建置工具 {id="build-tool-removal"}

### 移除對 Ant 的支援 {id="remove-support-for-ant"}

> **問題**：[KT-75875](https://youtrack.jetbrains.com/issue/KT-75875)
>
> **組建**：Ant
>
> **簡短摘要**：Kotlin 2.3.0 移除了對 Ant 作為建置工具的支援。請改用 [Gradle](gradle.md) 或 [Maven](maven.md)。
>
> **棄用週期**：
>
> - 2.2.0：報告警告
> - 2.3.0：移除支援