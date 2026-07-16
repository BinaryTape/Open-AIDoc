<topic xmlns="" xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="server-development-mode" title="개발 모드"
       help-id="development_mode;development-mode">
<show-structure for="chapter" depth="2"/>
<p>
    Ktor는 개발을 위한 특별한 모드를 제공합니다. 이 모드는 다음과 같은 기능을 활성화합니다:
</p>
<list>
    <li><Links href="/ktor/server-auto-reload" summary="코드 변경 시 애플리케이션 클래스를 리로드하는 자동 리로드 사용법을 알아보세요.">자동 리로드</Links>로 서버를 재시작하지 않고 애플리케이션 클래스를 리로드합니다.
    </li>
    <li><a href="#pipelines">파이프라인</a> 디버깅을 위한 확장 정보 (스택 트레이스와 함께).
    </li>
    <li><emphasis>5**</emphasis> 서버 오류 발생 시 <Links href="/ktor/server-status-pages" summary="%plugin_name% 플러그인을 사용하면 Ktor 애플리케이션이 발생한 예외나 상태 코드에 따라 모든 실패 상태에 적절하게 응답할 수 있습니다.">응답 페이지</Links>에 확장된 디버깅 정보.
    </li>
</list>
<note>
    <p>
        개발 모드는 성능에 영향을 미치므로 프로덕션 환경에서는 사용해서는 안 됩니다.
    </p>
</note>
<chapter title="개발 모드 활성화" id="enable">
    <p>
        개발 모드는 다양한 방법으로 활성화할 수 있습니다: 애플리케이션 설정 파일에서, 전용 시스템 속성을 사용하거나, 환경 변수를 통해 활성화할 수 있습니다.
    </p>
    <chapter title="설정 파일" id="application-conf">
        <p>
            <Links href="/ktor/server-configuration-file" summary="설정 파일에서 다양한 서버 매개변수를 구성하는 방법을 알아보세요.">설정 파일</Links>에서 개발 모드를 활성화하려면, <code>development</code> 옵션을 <code>true</code>로 설정하세요:
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
    <chapter title="'io.ktor.development' 시스템 속성" id="system-property">
        <p>
            <control>io.ktor.development</control> <a href="https://docs.oracle.com/javase/tutorial/essential/environment/sysprop.html">시스템 속성</a>을 사용하면 애플리케이션 실행 시 개발 모드를 활성화할 수 있습니다.
        </p>
        <p>
            IntelliJ IDEA를 사용하여 개발 모드에서 애플리케이션을 실행하려면, <code>io.ktor.development</code>를 <code>-D</code> 플래그와 함께 <a href="https://www.jetbrains.com/help/idea/run-debug-configuration-kotlin.html#1">VM 옵션</a>으로 전달하세요:
        </p>
        <code-block code="                -Dio.ktor.development=true"/>
        <p>
            <Links href="/ktor/server-dependencies" summary="기존 Gradle/Maven 프로젝트에 Ktor 서버 종속성을 추가하는 방법을 알아보세요.">Gradle</Links> 태스크를 사용하여 애플리케이션을 실행하는 경우, 개발 모드를 두 가지 방법 중 하나로 활성화할 수 있습니다:
        </p>
        <list>
            <li>
                <p>
                    <Path>build.gradle.kts</Path> 파일에서 <code>ktor</code> 블록을 구성하세요:
                </p>
                <code-block lang="Kotlin" code="                        ktor {&#10;                            development = true&#10;                        }"/>
            </li>
            <li>
                <p>
                    Gradle CLI 플래그를 전달하여 단일 실행에 대해 개발 모드를 활성화하세요:
                </p>
                <code-block lang="bash" code="                          ./gradlew run -Pio.ktor.development=true"/>
            </li>
        </list>
        <tip>
            <p>
                <code>-ea</code> 플래그를 사용하여 개발 모드를 활성화할 수도 있습니다. <code>-D</code> 플래그와 함께 전달되는 <code>io.ktor.development</code> 시스템 속성이 <code>-ea</code>보다 우선순위가 높다는 점에 유의하세요.
            </p>
        </tip>
    </chapter>
    <chapter title="'io.ktor.development' 환경 변수" id="environment-variable">
        <p>
            <a href="#native">네이티브 클라이언트</a>의 개발 모드를 활성화하려면, <code>io.ktor.development</code> 환경 변수를 사용하세요.
        </p>
    </chapter>
</chapter>
</topic>