<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="開發模式"
       help-id="development_mode;development-mode">
    <show-structure for="chapter" depth="2"/>
    <p>
        Ktor 提供了一種專為開發而設的特殊模式。此模式啟用以下功能：
    </p>
    <list>
        <li><Links href="/ktor/server-auto-reload" summary="瞭解如何使用 Auto-reload 在程式碼變更時重新載入應用程式類別。">Auto-reload</Links> 用於在不重新啟動伺服器的情況下重新載入應用程式類別。
        </li>
        <li>用於偵錯<a href="#pipelines">管線</a>的擴展資訊（附帶堆疊追蹤）。
        </li>
        <li>當發生 <emphasis>5**</emphasis> 伺服器錯誤時，在<Links href="/ktor/server-status-pages" summary="%plugin_name% 允許 Ktor 應用程式根據拋出的異常或狀態碼，對任何失敗狀態做出適當的回應。">回應頁面</Links>上提供擴展偵錯資訊。
        </li>
    </list>
    <note>
        <p>
            請注意，開發模式會影響效能，不應在生產環境中使用。
        </p>
    </note>
    <chapter title="啟用開發模式" id="enable">
        <p>
            您可以透過多種方式啟用開發模式：在應用程式設定檔中、使用專用的系統屬性或環境變數。
        </p>
        <chapter title="設定檔" id="application-conf">
            <p>
                要在
                <Links href="/ktor/server-configuration-file" summary="瞭解如何在設定檔中配置各種伺服器參數。">設定檔</Links>中啟用開發模式，
                請將 <code>development</code> 選項設定為 <code>true</code>：
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon">
                    <code-block code="                        ktor {&#10;                            development = true&#10;                        }"/>
                </tab>
                <tab title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="                        ktor:&#10;                            development: true"/>
                </tab>
            </tabs>
        </chapter>
        <chapter title="「io.ktor.development」系統屬性" id="system-property">
            <p>
                <control>io.ktor.development</control>
                <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">系統屬性</a>
                允許您在運行應用程式時啟用開發模式。
            </p>
            <p>
                若要使用 IntelliJ IDEA 在開發模式下運行應用程式，
                請將帶有 <code>-D</code> 標誌的 <code>io.ktor.development</code> 傳遞給
                <a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VM 選項</a>：
            </p>
            <code-block code="                -Dio.ktor.development=true"/>
            <p>
                如果您使用<Links href="/ktor/server-dependencies" summary="瞭解如何將 Ktor 伺服器依賴項新增到現有的 Gradle/Maven 專案中。">Gradle</Links>任務運行應用程式，
                您可以透過兩種方式啟用開發模式：
            </p>
            <list>
                <li>
                    <p>
                        在您的 <Path>build.gradle.kts</Path> 檔案中配置 <code>ktor</code> 區塊：
                    </p>
                    <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
                </li>
                <li>
                    <p>
                        透過傳遞 Gradle CLI 標誌來啟用單次運行的開發模式：
                    </p>
                    <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
                </li>
            </list>
            <tip>
                <p>
                    您也可以使用 <code>-ea</code> 標誌啟用開發模式。
                    請注意，使用 <code>-D</code> 標誌傳遞的 <code>io.ktor.development</code> 系統屬性優先於 <code>-ea</code>。
                </p>
            </tip>
        </chapter>
        <chapter title="「io.ktor.development」環境變數" id="environment-variable">
            <p>
                若要為<a href="#native">原生客戶端 (Native client)</a>啟用開發模式，
                請使用 <code>io.ktor.development</code> 環境變數。
            </p>
        </chapter>
    </chapter>
</topic>