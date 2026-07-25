<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="開發模式"
       help-id="development_mode;development-mode">
    <show-structure for="chapter" depth="2"/>
    <p>
        Ktor 提供了一種專門針對開發的特殊模式。此模式啟用了以下功能：
    </p>
    <list>
        <li>用於在不重新啟動伺服器的情況下重新載入應用程式類別的 <Links href="//server-auto-reload" summary="了解如何使用 Auto-reload 在程式碼變更時重新載入應用程式類別。">Auto-reload</Links>。
        </li>
        <li>用於偵錯<a href="#pipelines">管線</a>的延伸資訊（包含堆疊追蹤）。
        </li>
        <li>發生 <emphasis>5**</emphasis> 伺服器錯誤時，在 <Links href="//server-status-pages" summary="%plugin_name% 允許 Ktor 應用程式根據擲出的例外狀況或狀態碼，對任何失敗狀態做出適當的回應。">回應頁面</Links>上顯示延伸的偵錯資訊。
        </li>
    </list>
    <note>
        <p>
            請注意，開發模式會影響效能，不應在生產環境中使用。
        </p>
    </note>
    <chapter title="啟用開發模式" id="enable">
        <p>
            您可以透過不同的方式啟用開發模式：在應用程式配置檔案中、使用專用的系統屬性或環境變數。
        </p>
        <chapter title="配置檔案" id="application-conf">
            <p>
                若要在 <Links href="//server-configuration-file" summary="了解如何在配置檔案中配置各種伺服器參數。">配置檔案</Links>中啟用開發模式，請將 <code>development</code> 選項設為 <code>true</code>：
            </p>
            <Tabs group="config">
                <TabItem title="application.conf" group-key="hocon">
                    <code-block code="                        ktor {&#10;                            development = true&#10;                        }"/>
                </TabItem>
                <TabItem title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="                        ktor:&#10;                            development: true"/>
                </TabItem>
            </Tabs>
        </chapter>
        <chapter title="'io.ktor.development' 系統屬性" id="system-property">
            <p>
                <control>io.ktor.development</control> <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">系統屬性</a>允許您在執行應用程式時啟用開發模式。
            </p>
            <p>
                若要使用 IntelliJ IDEA 在開發模式下執行應用程式，請將 <code>io.ktor.development</code> 搭配 <code>-D</code> 旗標傳遞給 <a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">虛擬機選項</a>：
            </p>
            <code-block code="                -Dio.ktor.development=true"/>
            <p>
                如果您使用 <Links href="//server-dependencies" summary="了解如何將 Ktor Server 相依性新增至現有的 Gradle/Maven 專案。">Gradle</Links> 任務執行應用程式，可以透過以下兩種方式之一啟用開發模式：
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
                        透過傳遞 Gradle CLI 旗標來為單次執行啟用開發模式：
                    </p>
                    <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
                </li>
            </list>
            <tip>
                <p>
                    您也可以使用 <code>-ea</code> 旗標來啟用開發模式。請注意，使用 <code>-D</code> 旗標傳遞的 <code>io.ktor.development</code> 系統屬性優先級高於 <code>-ea</code>。
                </p>
            </tip>
        </chapter>
        <chapter title="'io.ktor.development' 環境變數" id="environment-variable">
            <p>
                若要為 <a href="#native">原生用戶端</a>啟用開發模式，請使用 <code>io.ktor.development</code> 環境變數。
            </p>
        </chapter>
    </chapter>
</topic>