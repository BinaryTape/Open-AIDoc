<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="api-references" title="API 參考">
    <p>歡迎來到 Kotlin API 參考頁面。在這裡，您將找到官方 Kotlin 程式庫與工具的 API 文件連結。</p>
    <tip>如果您正在尋找 Kotlin Multiplatform 程式庫，請在 <a href="https://klibs.io"><b>klibs.io</b></a> 上瀏覽。</tip>
    <list columns="2">
        <li>
            <a href="https://kotlinlang.org/api/core/kotlin-stdlib/"><b>標準程式庫 (stdlib)</b></a>
            <br/>
            <p>Kotlin 標準程式庫提供 Kotlin 程式設計的核心功能，包括集合、文字與字串處理、範圍、序列等基本 API。它擴充了平台專屬的 API，並提供以 Kotlin 為主的 API 來操作這些功能。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">kotlin</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/core/kotlin-test/"><b>測試程式庫 (kotlin.test)</b></a>
            <br/>
            <p>這是一個多平台測試程式庫，提供常用的測試註解與公用函式。它支援與各個平台上流行的測試框架整合，並在 Kotlin 生態系統中提供統一的測試體驗。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">kotlin</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlinx.coroutines/"><b>協同程式 (kotlinx.coroutines)</b></a>
            <br/>
            <p>這是一個使用 Kotlin 協同程式進行非同步程式設計的強大程式庫。它提供的工具支援結構化並行、非同步串流、同步基元（如 mutex 與 semaphore）、測試等功能。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.coroutines">kotlinx.coroutines</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlinx.serialization/"><b>序列化 (kotlinx.serialization)</b></a>
            <br/>
            <p>一款多平台序列化程式庫。它提供了一種型別安全且編譯期的機制，用於將 Kotlin 物件與 JSON、CBOR 和 Protocol Buffers 等多種格式進行互相轉換。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.serialization">kotlinx.serialization</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlinx-io/"><b>Kotlin I/O 程式庫 (kotlinx-io)</b></a>
            <br/>
            <p>一款用於低階 I/O 操作的多平台程式庫。它定義了讀取與寫入二進制串流與緩衝區的抽象化，旨在提高效率並能在所有 Kotlin 平台上移植。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-io">kotlinx-io</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlinx-datetime/"><b>日期與時間 (kotlinx-datetime)</b></a>
            <br/>
            <p>一款用於日曆運算的多平台程式庫。它提供了日期值的表示方式，並支援特定時區的操作。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-datetime">kotlinx-datetime</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlin-gradle-plugin/"><b>Kotlin Gradle 外掛程式 (kotlin-gradle-plugin)</b></a>
            <br/>
            <p>用於編譯、測試與封裝 Kotlin 程式碼的 Kotlin Gradle 外掛程式。這些外掛程式簡化了 JVM 與多平台組建，管理相依性，並與 IDE 和 CI 系統整合。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin">kotlin-gradle-plugin</a>
            <br/>
        </li>
        <li>
            <a href="https://api.ktor.io/"><b>Ktor</b></a>
            <br/>
            <p>一個使用 Kotlin 在連網系統中建構非同步用戶端與伺服器的架構。Ktor 專為可擴充性與靈活性而設計，並與協同程式深度整合，以實現非阻塞 I/O 與結構化並行。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/ktorio/ktor">ktor</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/kotlinx-metadata-jvm/"><b>JVM 元資料 (kotlin-metadata-jvm)</b></a>
            <br/>
            <p>一款用於讀寫儲存在 JVM 類別檔案中 Kotlin 元資料的程式庫。它主要供註解處理器、靜態分析器與編譯器外掛程式等工具使用。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/kotlinx-metadata">kotlinx-metadata</a>
            <br/>
        </li>
        <li>
            <a href="https://kotlinlang.org/api/compose-multiplatform/material3/"><b>Compose Multiplatform Material3</b></a>
            <br/>
            <p>一款使用 Material Design 3 元件建構使用者介面的多平台程式庫。此 API 參考包含 Material 3 元件庫，您可以在其中預覽 composable。</p>
            <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/compose-multiplatform-core/tree/jb-main/compose/material3">compose-material3</a>
            <br/>
        </li>
    </list>
</topic>