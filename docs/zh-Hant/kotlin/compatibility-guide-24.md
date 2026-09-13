[//]: # (title: Kotlin 2.4.x 相容性指南)

「[保持語言現代化](kotlin-evolution-principles.md)」與「[舒適的更新](kotlin-evolution-principles.md)」是 Kotlin 語言設計的基本原則。前者指出應移除阻礙語言演進的結構，後者則強調這類移除應事先進行充分溝通，以使程式碼遷移儘可能平滑。

雖然大多數語言變更已透過其他管道宣布（如更新日誌或編譯器警告），本文件對其進行了全面總結，為從 Kotlin 2.3 遷移到 Kotlin 2.4 提供完整參考。本文件還包含與工具相關的變更資訊。

## 基本術語 {id="basic-terms"}

在本文件中，我們介紹了幾種相容性：

- *原始碼 (source)*：原始碼不相容的變更會導致原本可以正常編譯（無錯誤或警告）的程式碼無法再編譯。
- *二進位 (binary)*：如果兩個二進位構件相互替換不會導致載入或連結錯誤，則稱它們為二進位相容。
- *行為 (behavioral)*：如果在套用變更前後，同一個程式表現出不同的行為，則稱該變更為行為不相容。

請注意，這些定義僅針對純 Kotlin。從其他語言角度（例如 Java）看 Kotlin 程式碼的相容性不在本文件的討論範圍內。

## 語言 {id="language"}

### 停止支援 `-language-version=1.9` 與 K1 編譯器 {id="drop-support-for-language-version-1-9-and-the-k1-compiler"}

> **問題**：[KT-80590](https://youtrack.jetbrains.com/issue/KT-80590)
>
> **組建**：編譯器
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：從 Kotlin 2.4 開始，編譯器不再支援 [`-language-version=1.9`](compiler-reference.md#language-version-version)。因此，K1 編譯器也不再受到支援。
>
> **棄用週期**：
>
> - 2.2.0：使用 `-language-version` 為 1.9 版時報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止 Java 型別的彈性顯式可為 null 型別引數 {id="prohibit-flexible-explicit-nullable-type-arguments-for-java-types"}

> **問題**：[KTLC-284](https://youtrack.jetbrains.com/issue/KTLC-284)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：先前在 Kotlin 中呼叫 Java API 時，編譯器可能會將顯式指定的可為 null 型別引數視為彈性型別引數。Kotlin 2.4.0 不再對可為 null 的型別引數套用此行為，因此編譯器現在會針對可能破壞型別安全或在執行時失敗的程式碼報告錯誤。
>
> **棄用週期**：
>
> - 2.2.0：針對被視為彈性型別的顯式指定可為 null 型別引數報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止針對絕對不相容型別進行恆為假的 `is` 檢查 {id="prohibit-always-false-is-checks-for-definitely-incompatible-types"}

> **問題**：[KTLC-365](https://youtrack.jetbrains.com/issue/KTLC-365)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：編譯器現在會阻止毫無意義且恆為假的 `is` 檢查，因為受檢型別絕對不相容。這使該行為與其他涉及不相容型別的操作保持一致。
>
> **棄用週期**：
>
> - 2.0.0：針對絕對不相容型別的 `is` 檢查報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止在內嵌函式中公開具有較低可見性的型別與宣告 {id="prohibit-exposing-types-and-declarations-with-lower-visibility-in-inline-functions"}

> **問題**：[KTLC-283](https://youtrack.jetbrains.com/issue/KTLC-283)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：編譯器現在會阻止內嵌函式公開可見性低於內嵌函式本身的型別與宣告。
>
> **棄用週期**：
>
> - 2.3.0：針對在內嵌函式中公開較低可見性的型別與宣告報告警告
> - 2.4.0：將警告提升為錯誤

### 變更註解的預設使用處目標選取 {id="change-default-use-site-target-selection-for-annotations"}

> **問題**：[KTLC-391](https://youtrack.jetbrains.com/issue/KTLC-391)
>
> **組建**：核心語言
>
> **不相容變更類型**：二進位
>
> **簡要摘要**：Kotlin 2.4.0 更新了將註解傳遞給參數、屬性與欄位的預設規則。這可能會影響重新編譯後的註解處理、反射與二進位元資料。當您未指定使用處目標時，編譯器現在會優先使用 `param` 與 `property`（如果適用），且僅在 `property` 不適用時才使用 `field`。
>
> 您可以顯式指定使用處目標，例如使用 `@param:Annotation` 代替 `@Annotation`。若要針對整個專案使用先前的預設規則，請在組建檔案中加入 `-Xannotation-default-target=first-only`。
>  
> **棄用週期**：
>
> - 2.2.0：當新的預設規則改變選定的使用處目標時報告警告
> - 2.4.0：啟用新的預設規則

### 禁止隱式參照不可存取的型別 {id="forbid-implicit-references-to-inaccessible-types"}

> **問題**：[KTLC-384](https://youtrack.jetbrains.com/issue/KTLC-384)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：使用隱式參照來自間接相依性之不可存取型別的宣告，現在會導致錯誤。
> 
> 若要遷移，請對宣告該不可存取型別的模組新增顯式相依性，或更新中間層 API 以避免公開該型別。
> 
> **棄用週期**：
>
> - 2.3.0：針對隱式參照不可存取的型別報告警告
> - 2.4.0：將警告提升為錯誤

### 強制執行 Jakarta 可為 null 性註解 {id="enforce-jakarta-nullability-annotations"}

> **問題**：[KTLC-285](https://youtrack.jetbrains.com/issue/KTLC-285)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：編譯器現在會針對使用 [`jakarta.annotation.Nullable`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nullable) 或 [`jakarta.annotation.Nonnull`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nonnull) 的 Java 宣告，在 Kotlin 中強制執行宣告的可為 null 性。如果您將這些註解標記為可為 null 的 Java 宣告指派給不可為 null 的 Kotlin 型別，編譯器將報告錯誤。
>
> **棄用週期**：
>
> - 2.2.0：針對帶有 Jakarta 可為 null 性註解的 Java 宣告中的可為 null 性不符報告警告
> - 2.4.0：將警告提升為錯誤

### 報告可呼叫參照限定詞中位置錯誤的型別引數 {id="report-misplaced-type-arguments-in-callable-reference-qualifiers"}

> **問題**：[KTLC-388](https://youtrack.jetbrains.com/issue/KTLC-388)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：編譯器現在會檢查可呼叫參照的左側，如果內部類別在限定詞的錯誤部分包含型別引數，則會報告警告。
> 
> 若要遷移，請更新參照，使每個型別引數都屬於宣告它的類別。例如，應撰寫完整型別 `Outer<Int>.Inner<String>::toString`，而非 `Inner<String, Int>::toString`。
>
> **棄用週期**：
>
> - 2.4.0：當可呼叫參照左側的型別引數屬於限定詞的其他部分時報告警告

### 針對具有可為 null 上限之具體化型別參數的類別常值報告錯誤 {id="report-errors-for-class-literals-from-reified-type-parameters-with-nullable-upper-bounds"}

> **問題**：[KTLC-370](https://youtrack.jetbrains.com/issue/KTLC-370)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當您在一個型別來自具有可為 null 上限之具體化型別參數的運算式上使用 `::class` 時，編譯器現在會報告錯誤。如果您在此類運算式上使用 `::class`，請先透過顯式 null 檢查或 `!!` 運算子將值變為非 null。
>
> **棄用週期**：
>
> - 2.3.0：當在型別來自具有可為 null 上限之具體化型別參數的運算式上使用 `::class` 時報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止在匿名物件宣告前進行初始化 {id="prohibit-initialization-before-declarations-in-anonymous-objects"}

> **問題**：[KTLC-290](https://youtrack.jetbrains.com/issue/KTLC-290)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：現在當您在匿名物件的 `init` 區塊中，於宣告屬性之前初始化該屬性時，Kotlin 會報告錯誤。
> 
> **棄用週期**：
>
> - 2.2.20：當匿名物件中的 `init` 區塊在屬性宣告前初始化屬性時報告警告
> - 2.4.0：將警告提升為錯誤

### 對包含非抽象 Java 密封類別的 `when` 運算式強制執行詳盡性檢查 {id="enforce-exhaustiveness-for-when-expressions-with-non-abstract-java-sealed-classes"}

> **問題**：[KTLC-366](https://youtrack.jetbrains.com/issue/KTLC-366)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當您對非抽象 Java 密封類別使用 `when` 運算式時，Kotlin 現在會更嚴格地檢查詳盡性，要求提供 `else` 分支或與該密封類別本身匹配的分支。先前，儘管 Java 密封類別本身可以直接具現化，Kotlin 仍可能將此類 `when` 運算式視為已詳盡。
>
> **棄用週期**：
>
> - 2.3.0：針對包含非抽象 Java 密封類別的非詳盡 `when` 運算式報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止在參數過多的 `getValue()` 與 `setValue()` 函式上使用 `operator` 修飾詞 {id="prohibit-operator-modifier-on-getvalue-and-setvalue-functions-with-too-many-parameters"}

> **問題**：[KTLC-289](https://youtrack.jetbrains.com/issue/KTLC-289)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當您為 [`getValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-only-property/get-value.html) 或 [`setValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-write-property/set-value.html) 函式標記 `operator` 修飾詞時，編譯器現在會檢查它們是否具有要求的參數數量。`getValue()` 函式必須正好有兩個參數，而 `setValue()` 函式必須正好有三個。若要遷移，請移除 `operator` 修飾詞或更改函式簽章。
>
> **棄用週期**：
>
> - 2.2.20：針對參數過多的 `operator` `getValue()` 與 `setValue()` 函式報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止泛型呼叫中不一致的型別引數 {id="prohibit-inconsistent-type-arguments-in-generic-calls"}

> **問題**：[KTLC-373](https://youtrack.jetbrains.com/issue/KTLC-373)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當您在泛型呼叫中指定型別引數時，如果一個型別引數違反了取決於另一個型別引數的上限約束，編譯器現在會報告錯誤。如果型別參數相互依賴，請使用符合這些約束的型別引數，例如使用 `Container<Alpha, AlphaKey>()` 而非 `Container<Alpha, BetaKey>()`。
>
> **棄用週期**：
>
> - 2.3.0：當泛型呼叫中的顯式型別引數違反型別參數間的上限約束時報告警告
> - 2.4.0：將警告提升為錯誤

### 棄用對 `javaClass` 屬性的參照 {id="deprecate-references-to-the-javaclass-property"}

> **問題**：[KTLC-375](https://youtrack.jetbrains.com/issue/KTLC-375)
>
> **組建**：Kotlin/JVM
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：Kotlin 2.4.0 棄用了對 [`javaClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/java-class.html) 屬性的屬性參照，以減少與 `::class.java` 的混淆。請使用 `.javaClass` 獲取物件的執行時 Java 類別，或使用 `::class.java` 獲取 Java 類別參照。
>
> **棄用週期**：
>
> - 2.4.0：針對 `javaClass` 屬性的屬性參照報告警告

### 針對需要選擇性加入的隱式列舉建構函式呼叫報告錯誤 {id="report-errors-for-implicit-enum-constructor-calls-that-require-opt-in"}

> **問題**：[KTLC-359](https://youtrack.jetbrains.com/issue/KTLC-359)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：現在當列舉成員隱式呼叫需要選擇性加入（opt-in）的列舉主建構函數時，Kotlin 會報告錯誤。若要遷移，請在列舉類別或每個呼叫該建構函式的列舉成員上新增 `@OptIn`。
>
> **棄用週期**：
>
> - 2.2.20：當列舉成員隱式呼叫需要選擇性加入的列舉主建構函數時報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止在列舉成員上使用 `inline` 修飾詞 {id="forbid-inline-modifier-on-enum-entries"}

> **問題**：[KTLC-361](https://youtrack.jetbrains.com/issue/KTLC-361)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：現在當您在列舉成員上使用 `inline` 修飾詞時，Kotlin 會報告錯誤。
>
> **棄用週期**：
>
> - 2.3.0：當在列舉成員上使用 `inline` 修飾詞時報告警告
> - 2.4.0：將警告提升為錯誤

### 禁止在註解呼叫與參數預設值之外使用陣列常值 {id="prohibit-array-literals-outside-annotation-calls-and-parameter-defaults"}

> **問題**：[KTLC-369](https://youtrack.jetbrains.com/issue/KTLC-369)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：在註解呼叫與註解參數預設值之外使用陣列常值現在會導致錯誤。若要遷移，請使用 `arrayOf(...)`，例如使用 `Roles(arrayOf("admin", "user"))` 而非 `Roles(["admin", "user"])`。
> 
> **棄用週期**：
>
> - 2.3.0：針對註解呼叫與註解參數預設值之外的陣列常值報告警告
> - 2.4.0：將警告提升為錯誤

### 在命令列編譯器模式下禁止使用 `_root_ide_package_` {id="prohibit-rootidepackage-in-cli-compiler-mode"}

> **問題**：[KTLC-378](https://youtrack.jetbrains.com/issue/KTLC-378)
>
> **組建**：編譯器
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：在命令列編譯器模式下使用僅限 IDE 的 `_root_ide_package_` 限定詞現在會導致錯誤。
>
> **棄用週期**：
>
> - 2.3.20：針對命令列編譯器模式下的 `_root_ide_package_` 參照報告警告
> - 2.4.0：將警告提升為錯誤

### 修正帶有可變參數轉換之函式參照的相等性 {id="correct-equality-for-function-references-with-vararg-conversions"}

> **問題**：[KTLC-385](https://youtrack.jetbrains.com/issue/KTLC-385)
>
> **組建**：Kotlin/JVM
>
> **不相容變更類型**：行為
>
> **簡要摘要**：Kotlin/JVM 現在將具有不同轉換的函式參照視為不相等。先前，當同一個函式參照也使用其他轉換時，Kotlin/JVM 在相等性檢查中會忽略可變參數轉換，因此 `getDefault(::foo) == getDefaultAndVararg(::foo)` 可能傳回 `true`，即便只有一方使用了可變參數轉換。
>
> **棄用週期**：
>
> - 2.4.0：引入新行為

### 對伴隨物件存取強制執行選擇性加入 {id="enforce-opt-in-for-companion-object-access"}

> **問題**：[KTLC-386](https://youtrack.jetbrains.com/issue/KTLC-386)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當類別名稱參照解析為需要選擇性加入的伴隨物件時，Kotlin 現在會報告選擇性加入錯誤。例如，如果 `C` 解析為標記有選擇性加入註解的伴隨物件，則 `val p = C` 需要選擇性加入。
>
> **棄用週期**：
>
> - 2.3.20：當伴隨物件存取需要選擇性加入時報告警告
> - 2.4.0：針對 `ERROR` 層級的選擇性加入要求將警告提升為錯誤

### 報告來自具有巢狀泛型引數之超型別的型別不符 {id="report-type-mismatches-from-supertypes-with-nested-generic-arguments"}

> **問題**：[KTLC-372](https://youtrack.jetbrains.com/issue/KTLC-372)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：當編譯器偵測到涉及具有巢狀泛型引數之超型別的型別不符時，現在會報告錯誤。先前編譯器可能會漏掉此不符，導致稍後發生 `ClassCastException`。若要遷移，請使用與接收者泛型型別匹配的型別引數，或移除顯式型別引數以便編譯器進行推論。
>
> **棄用週期**：
>
> - 2.4.0：針對涉及具有巢狀泛型引數之超型別的型別不符報告錯誤

### 禁止包含不可存取宣告的推論型別 {id="prohibit-inferred-types-with-inaccessible-declarations"}

> **問題**：[KTLC-363](https://youtrack.jetbrains.com/issue/KTLC-363)
>
> **組建**：核心語言
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：使用包含在當前作用域內不可存取宣告的推論型別現在會導致錯誤。
>
> **棄用週期**：
>
> - 2.3.0：當推論型別包含在當前作用域內不可存取的宣告時報告警告
> - 2.4.0：將警告提升為錯誤

## 標準函式庫 {id="standard-library"}

### 棄用 `kotlin.io.readLine()` 函式 {id="deprecate-kotlin-io-readline-function"}

> **問題**：[KTLC-394](https://youtrack.jetbrains.com/issue/KTLC-394)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：[`kotlin.io.readLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/read-line.html) 函式已被棄用。請使用 [`readln()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln.html) 函式代替 `readLine()!!`，並使用 [`readlnOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln-or-null.html) 函式代替 `readLine()`。
>
> **棄用週期**：
>
> - 2.4.0：使用 `kotlin.io.readLine()` 時報告警告

### 棄用 `AbstractCoroutineContextKey` 及相關 API {id="deprecate-abstractcoroutinecontextkey-and-related-apis"}

> **問題**：[KT-84970](https://youtrack.jetbrains.com/issue/KT-84970)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：[`AbstractCoroutineContextKey`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-abstract-coroutine-context-key/) 類別及其相關 API 自 Kotlin 1.3 起即為實驗性功能，且事實證明容易出錯。因此，該類別及相關的 [`getPolymorphicElement()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/get-polymorphic-element.html) 與 [`minusPolymorphicKey()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/minus-polymorphic-key.html) 函式已被棄用。
>
> **棄用週期**：
>
> - 2.4.0：使用已棄用的 API 時報告警告

### 變更無限邊界下的 `Random.nextDouble()` 契約 {id="change-random-nextdouble-contract-for-infinite-bounds"}

> **問題**：[KT-84368](https://youtrack.jetbrains.com/issue/KT-84368)
>
> **組建**：kotlin-stdlib
>
> **不相容變更類型**：行為
>
> **簡要摘要**：[`Random.nextDouble(until)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.random/-random/next-double.html) 的文件契約現在要求 `until` 邊界必須為有限值。請改用有限邊界。
>
> **棄用週期**：
>
> - 2.4.0：啟用新行為

## 工具 {id="tools"}

### 棄用舊版 Kotlin/JS 編譯器類型選取 API {id="deprecate-legacy-kotlin-js-compiler-type-selection-apis"}

> **問題**：[KT-64275](https://youtrack.jetbrains.com/issue/KT-64275), [KT-84753](https://youtrack.jetbrains.com/issue/KT-84753)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：Kotlin 2.4.0 移除了與選取舊版 Kotlin/JS 編譯器類型相關的已棄用 Gradle API。
> 
> 此外，`KotlinJsCompilerType` 列舉以及帶有編譯器類型參數的 `KotlinProjectExtension.js()` 多載已被棄用。若要遷移，請從 `js()` 目標宣告中移除編譯器類型引數，並改用 `js {}` 區塊。
>
> **棄用週期**：
>
> - 1.8.0：棄用舊版 Kotlin/JS 編譯器類型常數
> - 2.4.0：移除已棄用的舊版編譯器類型 API，並在使用 `KotlinJsCompilerType` 或帶有編譯器類型參數的 `KotlinProjectExtension.js()` 多載時報告警告

### 棄用 Kotlin Android 擴充套件中的 `sourceSets` {id="deprecate-sourcesets-in-the-kotlin-android-extension"}

> **問題**：[KT-74451](https://youtrack.jetbrains.com/issue/KT-74451)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：`KotlinAndroidProjectExtension` 中的 `sourceSets` 屬性已被棄用。若要遷移，請改由 Android Gradle 外掛程式的 `android { sourceSets { ... } }` 區塊配置原始碼集。
>
> **棄用週期**：
>
> - 2.4.0：從 `KotlinAndroidProjectExtension` 存取 `sourceSets` 時報告警告

### 移除 Kotlin/Native Apple 框架的可取用組態 {id="remove-consumable-configurations-for-kotlin-native-apple-frameworks"}

> **問題**：[KT-74503](https://youtrack.jetbrains.com/issue/KT-74503), [KT-82230](https://youtrack.jetbrains.com/issue/KT-82230)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：Kotlin 2.4.0 移除了將 Kotlin/Native Apple 框架公開為傳出構件的已產生可取用 Gradle 組態。
>
> **棄用週期**：
>
> - 2.4.0：移除 Kotlin/Native Apple 框架的可取用組態

### 從 Kotlin Gradle 外掛程式中移除已棄用的任務、編譯與 DSL API {id="remove-deprecated-task-compilation-and-dsl-apis-from-the-kotlin-gradle-plugin"}

> **問題**：[KT-85509](https://youtrack.jetbrains.com/issue/KT-85509)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：Kotlin 2.4.0 移除了以下已棄用的 Kotlin Gradle 外掛程式 API：
>
> 編譯任務配置 API：
>   * `KotlinJvmCompile.parentKotlinOptions`
>   * `KotlinJvmCompile.moduleName`
>   * `KotlinJvmFactory.createKotlinJvmOptions()`
>   * `KotlinCompile` 與 `Kotlin2JsCompile` 任務中的 `BaseKotlinCompile.moduleName`
> 
> Kotlin 多平台階層與目標 API：
>   * `DeprecatedKotlinTargetHierarchyDsl`
>   * `KotlinMultiplatformExtension.targetHierarchy`
>   * `KotlinTargetComponent.sourcesArtifacts`
>   * `KotlinTarget.sourceSets`
>   * `KotlinHierarchyBuilder.withoutCompilations()`
>   * `KotlinHierarchyBuilder.filterCompilations()`
>   * `KotlinHierarchyBuilder.withWasm()`
>   * `KotlinCompilation.defaultSourceSetName`
> 
> Kotlin 編譯任務 API：
>   * `KotlinCompilation.compileKotlinTaskProvider`
>   * `KotlinCompilation.compileKotlinTask`
>
> Kotlin 相依性處理器 API：
>   * `KotlinDependencyHandler.enforcedPlatform()`
>   * `KotlinDependencyHandler.platform()`
> 其他已棄用的任務與延伸 API：
>   * `KaptExtension.processors`
>   * `KotlinTest.excludes`
>   * `KotlinTest.fileResolver`
>   * `KotlinTest.execHandleFactory`
>   * `IncrementalSyncTask.destinationDir`
>
> 若要遷移，請移除對這些 API 的使用，並改用棄用診斷訊息中建議的替代方案。
>
> **棄用週期**：
>
> - 2.4.0：移除已棄用的 API

### 棄用顯式縮減後的類別路徑快照配置 {id="deprecate-explicit-shrunk-classpath-snapshot-configuration"}

> **問題**：[KT-75837](https://youtrack.jetbrains.com/issue/KT-75837)
>
> **組建**：建置工具 API 
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：`ClasspathSnapshotBasedIncrementalCompilationApproachParameters` 中的 `shrunkClasspathSnapshot` 配置參數已被棄用。縮減後的類別路徑快照是一個內部增量編譯快取，因此編譯器現在會自動在增量編譯器中繼資料 `workingDirectory` 下建立並管理它。若要遷移，請使用自動管理的快照檔案，而非向 `shrunkClasspathSnapshot` 傳遞值。
>
> **棄用週期**：
>
> - 2.4.0：使用 `shrunkClasspathSnapshot` 時報告警告

### 移除多餘的 ABI 驗證 Gradle DSL 元素 {id="remove-redundant-abi-validation-gradle-dsl-elements"}

> **問題**：[KT-80685](https://youtrack.jetbrains.com/issue/KT-80685)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：Kotlin 2.4.0 簡化了 [ABI 驗證](gradle-binary-compatibility-validation.md) Gradle DSL 並移除了多餘的配置項目。若要遷移，請直接在 `abiValidation {}` 中配置報告設定，而非 `abiValidation { legacyDump { ... } }`；移除 `abiValidation { klib { enabled = ... } }`；並使用 `keepLocallyUnsupportedTargets` 代替 `klib.keepUnsupportedTargets`。
>
> **棄用週期**：
>
> - 2.4.0：移除多餘的 ABI 驗證 DSL 元素

### 棄用過時的 Compose 編譯器 Gradle 外掛程式選項 {id="deprecate-obsolete-compose-compiler-gradle-plugin-options"}

> **問題**：[KT-85343](https://youtrack.jetbrains.com/issue/KT-85343)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：在 Kotlin 2.4.0 中，以下已棄用的 Compose 編譯器 Gradle 外掛程式選項在使用時現在會報告錯誤：
>
> * `generateFunctionKeyMetaClasses`
> * `enableIntrinsicRemember`
> * `enableNonSkippingGroupOptimization`
> * `enableStrongSkippingMode`
> * `stabilityConfigurationFile`
> * `ComposeFeatureFlag.StrongSkipping`
> * `ComposeFeatureFlag.IntrinsicRemember`
>
> 請改用 `featureFlags` 代替已棄用的特性選項，並使用 `stabilityConfigurationFiles` 代替 `stabilityConfigurationFile`。
>
> **棄用週期**：
>
> - 2.0.20：針對 `enableIntrinsicRemember`、`enableNonSkippingGroupOptimization` 與 `enableStrongSkippingMode` 報告警告
> - 2.1.0：針對 `stabilityConfigurationFile` 報告警告
> - 2.4.0：將警告提升為錯誤

### 針對過時的 Kotlin/Native Gradle 任務 API 報告錯誤 {id="report-errors-for-obsolete-kotlin-native-gradle-task-apis"}

> **問題**：[KT-85510](https://youtrack.jetbrains.com/issue/KT-85510)
>
> **組建**：Gradle
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：以下已棄用的 Kotlin/Native Gradle 任務 API 在使用時現在會報告錯誤：
>
> `AbstractKotlinNativeCompile` 屬性：
>
> * `additionalCompilerOptions`
> * `languageSettings`
> * `progressiveMode`
>
> `KotlinNativeCompile` 屬性：
>
> * `moduleName`
> * `konanDataDir`
> * `konanHome`
> * `languageVersion`
> * `apiVersion`
> * `enabledLanguageFeatures`
> * `optInAnnotationsInUse`
> * `additionalCompilerOptions`
>
> `CInteropProcess` 屬性：
>
> * `outputFile`
> * `konanDataDir`
> * `konanHome`
> * `defFile`
>
> `KotlinNativeLink` 屬性：
>
> * `languageSettings`
> * `additionalCompilerOptions`
> * `konanDataDir`
> * `konanHome`
>
> 此外，`KotlinNativeLink.compilation` 屬性已被移除。
>
> **棄用週期**：
>
> - 2.4.0：針對已棄用的 Kotlin/Native Gradle 任務 API 報告錯誤，並移除 `KotlinNativeLink.compilation` 屬性

### 針對編譯器引數值中的大小寫不符報告警告 {id="report-warnings-for-case-mismatches-in-compiler-argument-values"}

> **問題**：[KT-86059](https://youtrack.jetbrains.com/issue/KT-86059)
>
> **組建**：建置工具 API
>
> **不相容變更類型**：原始碼
>
> **簡要摘要**：接受固定值集合的編譯器引數先前在處理字母大小寫時不一致：部分引數接受任意字母大小寫，而其他引數則要求完全相符。[建置工具 API](build-tools-api.md) 現在對這些值接受任意字母大小寫，但會報告警告，例如 `Case mismatch for -module-kind: expected 'commonjs', got 'CommonJS'`。若要遷移，請使用[編譯器參考](compiler-reference.md)中為該引數列出的字母大小寫。
>
> **棄用週期**：
>
> - 2.4.20：當編譯器引數值的字母大小寫與預期值不符時報告警告