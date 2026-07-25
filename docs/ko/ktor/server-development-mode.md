<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="개발 모드"
       help-id="development_mode;development-mode">
    <show-structure for="chapter" depth="2"/>
    <p>
        Ktor는 개발을 위해 특화된 특별한 모드를 제공합니다. 이 모드를 사용하면 다음과 같은 기능들을 활용할 수 있습니다.
    </p>
    <list>
        <li>서버를 재시작하지 않고 애플리케이션 클래스를 다시 로드하기 위한 <Links href="//server-auto-reload" summary="Learn how to use Auto-reload to reload application classes on code changes.">자동 리로드(Auto-reload)</Links>.
        </li>
        <li><a href="#pipelines">파이프라인(pipelines)</a> 디버깅을 위한 확장 정보(스택 트레이스 포함).
        </li>
        <li><emphasis>5**</emphasis> 서버 오류가 발생한 경우 <Links href="//server-status-pages" summary="%plugin_name% allows Ktor applications to respond appropriately to any failure state based on a thrown exception or status code.">응답 페이지(response page)</Links>에 표시되는 확장 디버깅 정보.
        </li>
    </list>
    <note>
        <p>
            개발 모드는 성능에 영향을 미치므로 운영 환경(production)에서는 사용해서는 안 됩니다.
        </p>
    </note>
    <chapter title="개발 모드 활성화하기" id="enable">
        <p>
            애플리케이션 설정 파일, 전용 시스템 속성 또는 환경 변수를 사용하는 등 다양한 방법으로 개발 모드를 활성화할 수 있습니다.
        </p>
        <chapter title="설정 파일" id="application-conf">
            <p>
                <Links href="//server-configuration-file" summary="Learn how to configure various server parameters in a configuration file.">설정 파일</Links>에서 개발 모드를 활성화하려면 <code>development</code> 옵션을 <code>true</code>로 설정하세요.
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
        <chapter title="'io.ktor.development' 시스템 속성" id="system-property">
            <p>
                <code>io.ktor.development</code> <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">시스템 속성</a>을 사용하면 애플리케이션을 실행할 때 개발 모드를 활성화할 수 있습니다.
            </p>
            <p>
                IntelliJ IDEA를 사용하여 애플리케이션을 개발 모드로 실행하려면, <code>-D</code> 플래그와 함께 <code>io.ktor.development</code>를 <a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VM 옵션</a>에 전달하세요.
            </p>
            <code-block code="                -Dio.ktor.development=true"/>
            <p>
                <Links href="//server-dependencies" summary="Learn how to add Ktor Server dependencies to an existing Gradle/Maven project.">Gradle</Links> 태스크를 사용하여 애플리케이션을 실행하는 경우, 다음 두 가지 방법 중 하나로 개발 모드를 활성화할 수 있습니다.
            </p>
            <list>
                <li>
                    <p>
                        <code>build.gradle.kts</code> 파일의 <code>ktor</code> 블록을 구성합니다.
                    </p>
                    <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
                </li>
                <li>
                    <p>
                        Gradle CLI 플래그를 전달하여 단일 실행에 대해 개발 모드를 활성화합니다.
                    </p>
                    <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
                </li>
            </list>
            <tip>
                <p>
                    <code>-ea</code> 플래그를 사용하여 개발 모드를 활성화할 수도 있습니다.
                    단, <code>-D</code> 플래그로 전달된 <code>io.ktor.development</code> 시스템 속성이 <code>-ea</code>보다 우선순위를 가집니다.
                </p>
            </tip>
        </chapter>
        <chapter title="'io.ktor.development' 환경 변수" id="environment-variable">
            <p>
                <a href="#native">네이티브 클라이언트(Native client)</a>의 개발 모드를 활성화하려면 <code>io.ktor.development</code> 환경 변수를 사용하세요.
            </p>
        </chapter>
    </chapter>
</topic>