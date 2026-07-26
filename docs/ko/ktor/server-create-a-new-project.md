<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="새로운 Ktor 프로젝트 생성, 열기 및 실행"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-get-started"/>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        Ktor를 사용하여 서버 애플리케이션을 열고, 실행하고, 테스트하는 방법을 알아봅니다.
    </link-summary>
    <web-summary>
        첫 번째 Ktor 서버 애플리케이션 구축을 시작해 보세요. 이 튜토리얼에서는 새로운 Ktor 프로젝트를 생성하고, 열고, 실행하는 방법을 배웁니다.
    </web-summary>
    <p>
        이 튜토리얼에서는 첫 번째 Ktor 서버 프로젝트를 생성하고, 열고, 실행하는 방법을 배웁니다. 프로젝트가 실행되면 일련의 과제를 완료하여 Ktor에 익숙해질 수 있습니다.
    </p>
    <p>
        이것은 Ktor로 서버 애플리케이션을 구축하기 위한 시작 단계인 일련의 튜토리얼 중 첫 번째입니다. 각 튜토리얼을 독립적으로 진행할 수 있지만, 다음 권장 순서를 따르는 것이 좋습니다:
    </p>
    <list type="decimal">
        <li>새로운 Ktor 프로젝트 생성, 열기 및 실행</li>
        <li><Links href="//server-requests-and-responses" summary="Task Manager 애플리케이션을 빌드하며 Ktor와 Kotlin을 사용한 라우팅, 요청 처리 및 매개변수의 기본 사항을 알아봅니다.">요청 처리 및 응답 생성</Links></li>
        <li><Links href="//server-create-restful-apis" summary="JSON 파일을 생성하는 RESTful API 예제를 통해 Kotlin과 Ktor를 사용하여 백엔드 서비스를 빌드하는 방법을 알아봅니다.">JSON을 생성하는 RESTful API 만들기</Links></li>
        <li><Links href="//server-create-website" summary="Ktor와 Thymeleaf 템플릿을 사용하여 Kotlin으로 웹사이트를 빌드하는 방법을 알아봅니다.">Thymeleaf 템플릿을 사용하여 웹사이트 만들기</Links></li>
        <li><Links href="//server-create-websocket-application" summary="WebSocket의 기능을 활용하여 콘텐츠를 주고받는 방법을 알아봅니다.">WebSocket 애플리케이션 만들기</Links></li>
        <li><Links href="//server-integrate-database" summary="Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 프로세스를 알아봅니다.">Exposed를 사용하여 데이터베이스 통합</Links></li>
    </list>
    <chapter id="create-project" title="새로운 Ktor 프로젝트 생성">
        <p>
            새로운 Ktor 프로젝트를 생성하는 가장 빠른 방법 중 하나는 <a href="#create-project-with-the-ktor-project-generator">웹 기반 Ktor 프로젝트 생성기를 사용</a>하는 것입니다.
        </p>
        <p>
            또는 <a href="#create_project_with_intellij">IntelliJ IDEA Ultimate용 전용 Ktor 플러그인</a>이나 <a href="#create_project_with_ktor_cli_tool">Ktor CLI 도구</a>를 사용하여 프로젝트를 생성할 수 있습니다.
        </p>
        <chapter title="Ktor 프로젝트 생성기 사용"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                Ktor 프로젝트 생성기로 새로운 프로젝트를 생성하려면 아래 단계를 따르세요:
            </p>
            <procedure>
                <step>
                    <p><a href="https://start.ktor.io/">Ktor 프로젝트 생성기</a>로 이동합니다.</p>
                </step>
                <step>
                    <p>
                        <control>Project artifact</control> 필드에 프로젝트 아티팩트 이름으로 <Path>com.example.ktor-sample</Path>을 입력합니다.
                        <img src="ktor_343_project_generator_new_project_artifact_name.png"
                             alt="Project Artifact Name에 com.example.ktor-sample이 입력된 Ktor 프로젝트 생성기"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step id="configure-project-step">
                    <p>
                        <control>Configure</control>를 클릭하여 설정 드롭다운 메뉴를 엽니다:
                        <img src="ktor_343_project_generator_new_project_configure.png"
                             style="block"
                             alt="확장된 Ktor 프로젝트 설정 보기" border-effect="line" width="706"/>
                    </p>
                    <p>
                        다음 설정을 사용할 수 있습니다:
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>:
                                원하는 <Links href="//server-dependencies" summary="기존 Gradle/Maven 프로젝트에 Ktor 서버 종속성을 추가하는 방법을 알아봅니다.">빌드 시스템</Links>을 선택합니다.
                                <emphasis>Gradle Kotlin</emphasis>,
                                <emphasis>Gradle Groovy</emphasis>,
                                <emphasis>Maven</emphasis>, 또는 <emphasis>Amper</emphasis> 중 하나를 선택할 수 있습니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>:
                                서버를 실행하는 데 사용할 <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진</Links>을 선택합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>:
                                서버 매개변수를 <Links href="//server-configuration-file" summary="구성 파일에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">YAML 또는 HOCON 파일</Links>에 지정할지, 아니면 <Links href="//server-configuration-code" summary="코드에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">코드</Links>에 직접 지정할지 선택합니다.
                            </p>
                            <warning>
                                YAML 구성은 현재 Maven 기반 Ktor 프로젝트에서 지원되지 않습니다.
                            </warning>
                        </li>
                    </list>
                    <p>이 튜토리얼에서는 이러한 설정에 대해 기본값을 그대로 두어도 됩니다.</p>
                </step>
                <step>
                    <p>
                        <control>Done</control>을 클릭하여 구성을 저장하고 메뉴를 닫습니다.
                    </p>
                </step>
                <step>
                    <p>아래에서 프로젝트에 추가할 수 있는 <Links href="//server-plugins" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.">플러그인</Links> 세트를 확인할 수 있습니다. 플러그인은 인증, 직렬화 및 콘텐츠 인코딩, 압축, 쿠키 지원 등 Ktor 애플리케이션에서 공통 기능을 제공하는 구성 블록입니다.
                    </p>
                    <p>이 튜토리얼의 목적상, 지금 단계에서는 플러그인을 추가할 필요가 없습니다.</p>
                </step>
                <step>
                    <p>
                        <control>Download</control> 버튼을 클릭하여 Ktor 프로젝트를 생성하고 다운로드합니다.
                        <img src="ktor_343_project_generator_new_project_download.png"
                             alt="Ktor 프로젝트 생성기 다운로드 버튼"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>다운로드가 자동으로 시작됩니다.</p>
            </procedure>
            <p>이제 새로운 프로젝트를 생성했으므로, 이어서 <a href="#unpacking">Ktor 프로젝트를 압축 해제하고 실행</a>해 보겠습니다.</p>
        </chapter>
        <chapter title="IntelliJ IDEA Ultimate용 Ktor 플러그인 사용" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                이 섹션에서는 IntelliJ IDEA Ultimate용 <a href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 플러그인</a>을 사용하여 프로젝트를 설정하는 방법을 설명합니다.
            </p>
            <p>
                새로운 Ktor 프로젝트를 생성하려면 <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEA를 열고</a> 다음 단계를 따르세요:
            </p>
            <procedure>
                <step>
                    <p>
                        시작(Welcome) 화면에서 <control>New Project</control>를 클릭합니다.
                    </p>
                    <p>
                        또는 메인 메뉴에서 <ui-path>File | New | Project</ui-path>를 선택합니다.
                    </p>
                </step>
                <step>
                    <p>
                        <control>New Project</control> 마법사의 왼쪽 목록에서 <control>Ktor</control>를 선택합니다.
                    </p>
                </step>
                <step>
                    <p>
                        오른쪽 창에서 다음 설정을 지정할 수 있습니다:
                    </p>
                    <img src="ktor_idea_new_project_settings.png" alt="Ktor 프로젝트 설정" width="706"
                         border-effect="rounded"/>
                    <list>
                        <li>
                            <p>
                                <control>Name</control>: 프로젝트 이름을 지정합니다. 프로젝트 이름으로 <Path>ktor-sample</Path>을 입력합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Location</control>: 프로젝트를 저장할 디렉토리를 지정합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Website</control>: 패키지 이름을 생성하는 데 사용할 도메인을 지정합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Artifact</control>: 이 필드에는 생성된 아티팩트 이름이 표시됩니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>: 서버를 실행하는 데 사용할 <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진</Links>을 선택합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Include samples</control>: 플러그인용 샘플 코드를 추가하려면 이 옵션을 활성화된 상태로 둡니다.
                            </p>
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        <control>Advanced Settings</control>를 클릭하여 추가 설정 메뉴를 확장합니다:
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 프로젝트 고급 설정"
                         width="706" border-effect="rounded"/>
                    <p>
                        다음 설정을 사용할 수 있습니다:
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>:
                                원하는 <Links href="//server-dependencies" summary="기존 Gradle/Maven 프로젝트에 Ktor 서버 종속성을 추가하는 방법을 알아봅니다.">빌드 시스템</Links>을 선택합니다.
                                <emphasis>Gradle Kotlin</emphasis>,
                                <emphasis>Gradle Groovy</emphasis>,
                                <emphasis>Maven</emphasis>, 또는 <emphasis>Amper</emphasis> 중 하나를 선택할 수 있습니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor version</control>:
                                필요한 Ktor 버전을 선택합니다.
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>:
                                서버 매개변수를 <Links href="//server-configuration-file" summary="구성 파일에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">YAML 또는 HOCON 파일</Links>에 지정할지, 아니면 <Links href="//server-configuration-code" summary="코드에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">코드</Links>에 직접 지정할지 선택합니다.
                            </p>
                            <warning>
                                YAML 구성은 현재 Maven 기반 Ktor 프로젝트에서 지원되지 않습니다.
                            </warning>
                        </li>
                    </list>
                    <p>이 튜토리얼의 목적상, 이러한 설정의 기본값을 그대로 두어도 됩니다.</p>
                </step>
                <step>
                    <p>
                        <control>Next</control>를 클릭하여 다음 페이지로 이동합니다.
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 플러그인" width="706"
                         border-effect="rounded"/>
                    <p>
                        이 페이지에서 Ktor 애플리케이션의 공통 기능(예: 인증, 직렬화 및 콘텐츠 인코딩, 압축, 쿠키 지원 등)을 제공하는 구성 블록인 <Links href="//server-plugins" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.">플러그인</Links> 세트를 선택할 수 있습니다.
                    </p>
                    <p>이 튜토리얼의 목적상, 지금 단계에서는 플러그인을 추가할 필요가 없습니다.</p>
                </step>
                <step>
                    <p>
                        <control>Create</control>를 클릭하고 IntelliJ IDEA가 프로젝트를 생성하고 종속성을 설치할 때까지 기다립니다.
                    </p>
                </step>
            </procedure>
            <p>
                이제 새로운 프로젝트를 생성했으므로, 이어서 애플리케이션을 <a href="#open-explore-run">열고, 탐색하고, 실행</a>하는 방법을 알아봅니다.
            </p>
        </chapter>
        <chapter title="Ktor CLI 도구 사용" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                이 섹션에서는 <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 도구</a>를 사용하여 프로젝트를 설정하는 방법을 설명합니다.
            </p>
            <p>
                새로운 Ktor 프로젝트를 생성하려면 원하는 터미널을 열고 다음 단계를 따르세요:
            </p>
            <procedure>
                <step>
                    다음 명령 중 하나를 사용하여 Ktor CLI 도구를 설치합니다:
                    <Tabs>
                        <TabItem title="macOS/Linux" id="macos-linux">
                            <code-block lang="console" code="                                brew install ktor"/>
                        </TabItem>
                        <TabItem title="Windows" id="windows">
                            <code-block lang="console" code="                                winget install JetBrains.KtorCLI"/>
                        </TabItem>
                    </Tabs>
                </step>
                <step>
                    대화형 모드(interactive mode)에서 새로운 프로젝트를 생성하려면 다음 명령을 사용합니다:
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    프로젝트 이름으로 <Path>ktor-sample</Path>을 입력합니다:
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="대화형 모드에서 Ktor CLI 도구 사용하기"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        (선택 사항) 프로젝트 이름 아래의 <ui-path>Location</ui-path> 경로를 수정하여 프로젝트가 저장될 위치를 변경할 수도 있습니다.
                    </p>
                </step>
                <step>
                    <shortcut>Enter</shortcut>를 눌러 계속합니다.
                </step>
                <step>
                    다음 단계에서는 프로젝트에 추가할 <Links href="//server-plugins" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.">플러그인</Links>을 검색하고 추가할 수 있습니다. 플러그인은 인증, 직렬화 및 콘텐츠 인코딩, 압축, 쿠키 지원 등 Ktor 애플리케이션에서 공통 기능을 제공하는 구성 블록입니다.
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="Ktor CLI 도구를 사용하여 프로젝트에 플러그인 추가"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>이 튜토리얼의 목적상, 지금 단계에서는 플러그인을 추가할 필요가 없습니다.</p>
                </step>
                <step>
                    <shortcut>CTRL+G</shortcut>를 눌러 프로젝트를 생성합니다.
                    <p>
                        또는 <control>CREATE PROJECT (CTRL+G)</control>를 선택하고 <shortcut>Enter</shortcut>를 눌러 프로젝트를 생성할 수 있습니다.
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="Ktor 프로젝트 압축 해제 및 실행" id="unpacking">
        <p>
            이 섹션에서는 명령줄에서 프로젝트를 압축 해제하고, 빌드하고, 실행하는 방법을 알아봅니다. 아래 단계는 다음을 가정합니다:
        </p>
        <list type="bullet">
            <li><Path>ktor-sample</Path>이라는 이름의 Gradle 프로젝트를 생성하고 다운로드했습니다.</li>
            <li>이 프로젝트는 홈 디렉토리의 <Path>myprojects</Path> 폴더에 위치합니다.</li>
        </list>
        <p>필요한 경우 자신의 환경에 맞게 이름과 경로를 변경하세요.</p>
        <p>원하는 명령줄 도구를 열고 다음 단계를 따르세요:</p>
        <procedure>
            <step>
                <p>터미널 창에서 프로젝트를 다운로드한 폴더로 이동합니다:</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>동일한 이름의 폴더에 ZIP 아카이브를 압축 해제합니다:</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                    </TabItem>
                </Tabs>
                <p>이제 디렉토리에 ZIP 아카이브와 압축이 해제된 폴더가 포함됩니다.</p>
            </step>
            <step>
                <p>해당 디렉토리에서 새로 생성된 폴더로 이동합니다:</p>
                <code-block lang="console" code="                    cd ktor-sample"/>
            </step>
            <step>
                <p>macOS 및 UNIX 시스템에서는 Gradle 헬퍼 스크립트를 실행 가능하게 만들어야 시스템이 이를 실행 가능한 명령으로 인식합니다. 이를 위해 <code>chmod</code> 명령을 사용합니다:</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </TabItem>
                </Tabs>
            </step>
            <step>
                <p>프로젝트를 빌드하려면 다음 명령을 사용합니다:</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </TabItem>
                </Tabs>
                <p>빌드가 성공하면 다음 단계로 넘어가 프로젝트를 실행합니다.</p>
            </step>
            <step>
                <p>프로젝트를 실행하려면 다음 명령을 사용합니다:</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew run"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew run"/>
                    </TabItem>
                </Tabs>
            </step>
            <step>
                <p>프로젝트가 실행 중인지 확인하려면 터미널 출력에 표시된 URL(<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>)로 브라우저를 엽니다. 브라우저에 "Hello World!" 메시지가 표시되어야 합니다:</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="생성된 Ktor 프로젝트의 출력 결과"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>축하합니다! Ktor 프로젝트를 성공적으로 시작했습니다.</p>
        <note>
            기본 프로세스가 Ktor 애플리케이션을 실행하느라 사용 중이므로 명령줄이 응답하지 않을 것입니다. 애플리케이션을 종료하려면 <shortcut>CTRL+C</shortcut>를 누르세요.
        </note>
    </chapter>
    <chapter title="IntelliJ IDEA에서 Ktor 프로젝트 열기, 탐색 및 실행" id="open-explore-run">
        <chapter title="프로젝트 열기" id="open">
            <p><a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>가 설치되어 있다면 명령줄에서 쉽게 프로젝트를 열 수 있습니다.</p>
            <p>
                프로젝트 폴더에 있는지 확인한 다음, <code>idea</code> 명령 뒤에 현재 폴더를 나타내는 마침표를 입력합니다:
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                또는 수동으로 프로젝트를 열려면 IntelliJ IDEA를 실행합니다.
            </p>
            <p>
                시작(Welcome) 화면이 나타나면 <control>Open</control>을 클릭합니다. 그렇지 않으면 메인 메뉴에서 <ui-path>File | Open</ui-path>으로 이동하여 <Path>ktor-sample</Path> 폴더를 선택해 엽니다.
            </p>
            <tip>
                프로젝트 관리에 대한 자세한 내용은 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA 문서</a>를 참조하세요.
            </tip>
        </chapter>
        <chapter title="프로젝트 탐색" id="explore">
            <p>프로젝트를 열면 다음과 같은 구조를 볼 수 있습니다:</p>
            <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE에서 생성된 Ktor 프로젝트 뷰" width="706"/>
            <p>
                전체 레이아웃을 보려면 <control>Project</control> 뷰에서 각 폴더 옆의 확장 화살표를 클릭하여 폴더를 확장합니다.
            </p>
            <p>
                애플리케이션 소스 코드는 <Path>src/main/kotlin</Path> 아래에 위치합니다. 기본적으로 <Path>Application.kt</Path>와 <Path>Routing.kt</Path>라는 두 개의 파일이 생성됩니다.
            </p>
            <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktor 프로젝트 src 폴더 구조" width="400"/>
            <p>프로젝트 이름은 <Path>settings.gradle.kts</Path> 파일에 구성되어 있습니다:</p>
            <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
            <p>
                구성 파일 및 기타 콘텐츠 종류는 <Path>src/main/resources</Path> 폴더 안에 위치합니다.
            </p>
            <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktor 프로젝트 resources 폴더 구조"
                 width="400"/>
        </chapter>
        <chapter title="프로젝트 실행" id="run">
            <procedure>
                <p>IntelliJ IDEA 내에서 프로젝트를 실행하려면:</p>
                <step>
                    <p>오른쪽 사이드바의 Gradle 아이콘(<img alt="IntelliJ IDEA Gradle 아이콘"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 도구 창</a>을 엽니다.</p>
                </step>
                <step>
                    <p>이 도구 창에서 <ui-path>Tasks | application</ui-path>으로 이동하여 <control>run</control> 태스크를 더블 클릭합니다.
                    </p>
                    <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA의 Gradle 탭"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>Ktor 애플리케이션이 IDE 하단의 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html">Run 도구 창</a>에서 시작됩니다:</p>
                    <img src="tutorial_server_get_started_idea_run_terminal.png" alt="터미널에서 실행 중인 프로젝트" width="706"/>
                    <p>이전에 명령줄에 표시되었던 것과 동일한 메시지가 이제 <ui-path>Run</ui-path> 도구 창에 표시됩니다.
                    </p>
                </step>
                <step>
                    <p>프로젝트가 실행 중인지 확인하려면 지정된 URL(<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>)로 브라우저를 엽니다.</p>
                    <p>화면에 다시 한 번 "Hello World!" 메시지가 표시되어야 합니다:</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="브라우저 화면의 Hello World"
                         width="706"/>
                </step>
            </procedure>
            <p>
                <ui-path>Run</ui-path> 도구 창을 통해 애플리케이션을 관리할 수 있습니다.
            </p>
            <list type="bullet">
                <li>
                    애플리케이션을 종료하려면 중지 버튼(<img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="IntelliJ IDEA 중지 아이콘"/>)을 클릭합니다.
                </li>
                <li>
                    프로세스를 재시작하려면 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="IntelliJ IDEA 재실행 아이콘"/>)을 클릭합니다.
                </li>
            </list>
            <p>
                이러한 옵션에 대한 자세한 설명은 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Run 도구 창 문서</a>를 참조하세요.
            </p>
        </chapter>
    </chapter>
    <chapter title="추가 과제 시도해 보기" id="additional-tasks">
        <p>다음은 시도해 볼 수 있는 몇 가지 추가 과제입니다:</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">기본 포트 변경</a></li>
            <li><a href="#add-a-new-http-endpoint">새로운 HTTP 엔드포인트 추가</a></li>
            <li><a href="#configure-static-content">정적 콘텐츠 구성</a></li>
            <li><a href="#write-an-integration-test">통합 테스트 작성</a></li>
            <li><a href="#register-error-handlers">오류 핸들러 등록</a></li>
        </list>
        <p>
            이 과제들은 서로 종속되어 있지는 않지만 난이도가 점차 높아집니다. 선언된 순서대로 시도하는 것이 단계적으로 학습하기 가장 쉬운 방법입니다. 단순화하고 중복을 피하기 위해 아래 설명은 과제를 순서대로 시도하는 것을 가정합니다.
        </p>
        <p>
            코딩이 필요한 경우 코드와 해당 import를 모두 지정했습니다. IDE가 이러한 import를 자동으로 추가해 줄 수도 있습니다.
        </p>
        <chapter title="기본 포트 변경" id="change-the-default-port">
            <chapter title="구성 파일에서 포트 변경" id="change-the-port-in-config">
                <p>
                    구성을 YAML 또는 HOCON 파일 내에 외부적으로 저장하도록 선택한 경우, <ui-path>Project</ui-path> 뷰에서 <Path>src/main/resources</Path> 폴더로 이동하여 다음 단계를 따르세요:
                </p>
                <procedure id="change-default-port-yaml-procedure">
                    <step>
                        구성 파일(<Path>application.yaml</Path> 또는 <Path>application.conf</Path>)을 엽니다. 다음과 같이 보여야 합니다:
                        <Tabs>
                            <TabItem title="application.yaml (YAML)" group-key="yaml">
                                <code-block lang="yaml" code="ktor:&#10;  deployment:&#10;    port: 8080&#10;  application:&#10;    modules:&#10;      - com.example.RoutingKt.configureRouting"/>
                            </TabItem>
                            <TabItem title="application.conf (HOCON)" group-key="hocon">
                                <code-block lang="generic" code="ktor {&#10;  deployment {&#10;    port = 8080&#10;    port = ${?PORT}&#10;  }&#10;  application {&#10;    modules = [&#10;      com.example.RoutingKt.configureRouting&#10;    ]&#10;  }&#10;}"/>
                            </TabItem>
                        </Tabs>
                    </step>
                    <step>
                        파일의 <code>port</code> 값을 <code>9292</code>와 같이 원하는 다른 숫자로 변경합니다.
                    </step>
                    <step>
                        <p>재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)을 클릭하여 애플리케이션을 재시작합니다.</p>
                    </step>
                    <step>
                        <p>애플리케이션이 새로운 포트 번호에서 실행 중인지 확인하려면 새로운 URL(<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>)로 브라우저를 열거나, <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEA에서 새로운 HTTP Request 파일을 생성</a>할 수 있습니다:</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="IntelliJ IDEA에서 HTTP request 파일로 포트 변경 테스트" width="706"/>
                    </step>
                </procedure>
            </chapter>
            <chapter title="코드에서 포트 변경" id="change-the-port-in-code">
                <p>
                    <a href="#configure-project-step">새로운 Ktor 프로젝트를 생성할 때</a>, 구성을 코드에 저장하거나 YAML 또는 HOCON 파일 내에 외부적으로 저장하는 옵션이 있습니다.
                </p>
                <p>
                    구성을 코드에 저장하도록 선택한 경우, <ui-path>Project</ui-path> 뷰에서 <Path>src/main/kotlin</Path> 폴더로 이동하여 다음 단계를 따르세요:
                </p>
                <procedure id="change-the-default-port-code-procedure">
                    <step>
                        <p><Path>main.kt</Path> 파일을 엽니다. 다음과 유사한 코드를 찾을 수 있습니다:
                        </p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p><code>embeddedServer()</code> 함수에서 <code>port</code> 매개변수를 <code>9292</code>와 같이 원하는 다른 숫자로 변경합니다.</p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)을 클릭하여 애플리케이션을 재시작합니다.</p>
                    </step>
                    <step>
                        <p>애플리케이션이 새로운 포트 번호에서 실행 중인지 확인하려면 새로운 URL(<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>)로 브라우저를 열거나, <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEA에서 새로운 HTTP Request 파일을 생성</a>할 수 있습니다:</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="IntelliJ IDEA에서 HTTP request 파일로 포트 변경 테스트" width="706"/>
                    </step>
                </procedure>
            </chapter>
        </chapter>
        <chapter title="새로운 HTTP 엔드포인트 추가" id="add-a-new-http-endpoint">
            <p>
                <ui-path>Project</ui-path> 도구 창에서 <Path>src/main/kotlin</Path> 폴더로 이동하여 다음 단계를 따르세요:
            </p>
            <procedure>
                <step>
                    <p><Path>Routing.kt</Path> 파일을 엽니다. 다음과 같은 코드가 표시됩니다:
                    </p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>새로운 엔드포인트를 생성하려면 아래와 같이 추가 라우트를 삽입합니다:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <note><code>/test1</code> URL은 원하는 대로 변경할 수 있습니다.</note>
                </step>
                <step>
                    <p>IDE가 자동으로 <code>ContentType</code>에 대한 import를 추가합니다:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
                </step>
                <step>
                    <p>재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)을 클릭하여 애플리케이션을 재시작합니다.</p>
                </step>
                <step>
                    <p>브라우저에서 새로운 URL(<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>)을 요청합니다. 포트 번호는 <a href="#change-the-default-port">기본 포트 변경</a> 과제를 완료했는지 여부에 따라 달라집니다. 아래와 같은 출력이 표시되어야 합니다:</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="Hello from Ktor를 표시하는 브라우저 화면" width="706"/>
                    <p>HTTP request 파일을 생성했다면 거기에서도 새로운 엔드포인트를 확인할 수 있습니다:</p>
                    <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                    <note>서로 다른 요청을 구분하려면 세 개의 해시 기호(<code>###</code>)가 포함된 줄이 필요합니다.</note>
                </step>
            </procedure>
        </chapter>
        <chapter title="정적 콘텐츠 구성" id="configure-static-content">
            <p>
                <ui-path>Project</ui-path> 도구 창에서 <Path>src/main/kotlin</Path> 폴더로 이동하여 다음 단계를 따르세요:
            </p>
            <procedure>
                <step>
                    <p><Path>Routing.kt</Path> 파일을 열고 라우팅 섹션에 다음 라우트를 추가합니다:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                    <p>이 줄의 의미는 다음과 같습니다:</p>
                    <list type="bullet">
                        <li><code>staticResources()</code>를 호출하면 애플리케이션에서 HTML 및 JavaScript 파일과 같은 표준 웹사이트 콘텐츠를 제공할 수 있게 됩니다. 이 콘텐츠는 브라우저 내에서 실행될 수 있지만, 서버의 관점에서는 정적(static)인 것으로 간주됩니다.
                        </li>
                        <li>URL <code>/content</code>는 이 콘텐츠를 가져오는 데 사용되는 경로를 지정합니다.
                        </li>
                        <li>경로 <code>mycontent</code>는 정적 콘텐츠가 위치할 폴더의 이름입니다. Ktor는 <code>resources</code> 디렉토리 내에서 이 폴더를 찾습니다.
                        </li>
                    </list>
                </step>
                <step>
                    <p>IDE가 자동으로 추가하지 않는 경우 다음 import를 추가합니다.</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
                </step>
                <step>
                    <p><control>Project</control> 도구 창에서 <Path>src/main/resources</Path> 폴더를 마우스 오른쪽 버튼으로 클릭하고 <control>New | Directory</control>를 선택합니다.
                    </p>
                    <p>또는 <Path>src/main/resources</Path> 폴더를 선택하고 <shortcut>⌘Cmd+N</shortcut>(macOS) 또는 <shortcut>Ctrl+N</shortcut>(Windows/Linux)을 누른 다음 <control>Directory</control>를 클릭합니다.
                    </p>
                </step>
                <step>
                    <p>새 디렉토리 이름을 <code>mycontent</code>로 지정하고 <shortcut>↩Enter</shortcut>를 누릅니다.
                    </p>
                </step>
                <step>
                    <p>새로 생성된 폴더를 마우스 오른쪽 버튼으로 클릭하고 <control>New | File</control>을 클릭합니다.
                    </p>
                </step>
                <step>
                    <p>새 파일 이름을 <Path>sample.html</Path>로 지정하고 <shortcut>↩Enter</shortcut>를 누릅니다.
                    </p>
                </step>
                <step>
                    <p>새로 생성된 파일 페이지를 유효한 HTML로 채웁니다. 예:</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)을 클릭하여 애플리케이션을 재시작합니다.</p>
                </step>
                <step>
                    <p>브라우저에서 <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a>을 열면 샘플 페이지의 콘텐츠가 표시되어야 합니다:</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="브라우저에서의 정적 페이지 출력 결과" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="통합 테스트 작성" id="write-an-integration-test">
            <p>
                Ktor는 <Links href="//server-testing" summary="특별한 테스팅 엔진을 사용하여 서버 애플리케이션을 테스트하는 방법을 알아봅니다.">통합 테스트 생성</Links> 기능을 제공하며, 생성된 프로젝트에는 이 기능이 번들로 포함되어 있습니다.
            </p>
            <p>이를 사용하려면 아래 단계를 따르세요:</p>
            <procedure>
                <step>
                    <p>
                        <Path>src/test/kotlin</Path> 폴더로 이동합니다.
                    </p>
                </step>
                <step>
                    <p><Path>ServerTest.kt</Path> 파일을 엽니다. 아래와 같은 코드가 표시됩니다:</p>
                    <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // loads default configuration&#10;        configure()&#10;        // verify server root returns 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                    <p><code>testApplication()</code> 함수는 Ktor의 새로운 인스턴스를 생성합니다. 이 인스턴스는 Netty와 같은 서버가 아닌 테스트 환경 내부에서 실행됩니다.</p>
                    <p>그런 다음 <code>configure()</code> 함수를 사용하여 <code>embeddedServer()</code>에서 호출되는 것과 동일한 설정을 호출할 수 있습니다.</p>
                    <p>마지막으로 내장된 <code>client</code> 객체와 JUnit assertion을 사용하여 샘플 요청을 보내고 응답을 확인할 수 있습니다.</p>
                </step>
            </procedure>
            <p>
                IntelliJ IDEA에서 테스트를 실행하는 일반적인 방법 중 하나를 사용하여 테스트를 실행할 수 있습니다. Ktor의 새로운 인스턴스를 실행하는 것이므로 테스트의 성공 또는 실패는 애플리케이션이 <code>0.0.0.0</code>에서 실행 중인지 여부에 의존하지 않습니다.
            </p>
            <p>
                <a href="#add-a-new-http-endpoint">새로운 HTTP 엔드포인트 추가</a> 과제를 성공적으로 완료했다면 다음 테스트를 추가해 보세요:
            </p>
            <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
            <p>다음 추가 import를 추가합니다:</p>
            <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
        </chapter>
        <chapter title="오류 핸들러 등록" id="register-error-handlers">
            <p>
                <Links href="//server-status-pages" summary="%plugin_name% 플러그인을 사용하면 Ktor 애플리케이션이 발생한 예외나 상태 코드에 따라 모든 실패 상태에 적절하게 응답할 수 있습니다.">StatusPages 플러그인</Links>을 사용하여 Ktor 애플리케이션에서 오류를 처리할 수 있습니다.
            </p>
            <tip>
                이 플러그인은 기본적으로 프로젝트에 포함되어 있지 않습니다. Ktor 프로젝트 생성기 또는 IntelliJ IDEA의 프로젝트 마법사에서 프로젝트를 생성할 때 <ui-path>Plugins</ui-path> 섹션을 통해 추가할 수 있습니다.
            </tip>
            <p>
                다음 단계에서는 플러그인을 수동으로 추가하고 구성하는 방법을 배웁니다. 이를 달성하기 위한 네 가지 단계가 있습니다:
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">Gradle 빌드 파일에 새로운 종속성을 추가합니다.</a></li>
                <li><a href="#install-plugin-and-specify-handler">플러그인을 설치하고 예외 핸들러를 지정합니다.</a></li>
                <li><a href="#write-sample-code">핸들러를 트리거하기 위한 샘플 코드를 작성합니다.</a></li>
                <li><a href="#restart-and-invoke">샘플 코드를 재시작하고 호출합니다.</a></li>
            </list>
            <procedure title="새로운 종속성 추가" id="add-dependency">
                <p><control>Project</control> 도구 창에서 프로젝트 루트 폴더로 이동하여 다음 단계를 따르세요:
                </p>
                <step>
                    <p><Path>build.gradle.kts</Path> 파일을 열고 아래와 같이 새로운 종속성을 추가합니다:</p>
                    <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // Add new dependency&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
                </step>
                <step>
                    <p><shortcut>Shift+⌘Cmd+I</shortcut>(macOS) 또는 <shortcut>Ctrl+Shift+O</shortcut>(Windows/Linux)를 눌러 프로젝트를 다시 로드합니다.
                    </p>
                </step>
            </procedure>
            <procedure title="플러그인 설치 및 예외 핸들러 지정"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p><Path>Routing.kt</Path>의 <code>.configureRouting()</code> 메서드로 이동하여 다음 코드 줄을 추가합니다:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                    <p>이 줄들은 <code>StatusPages</code> 플러그인을 설치하고 <code>IllegalStateException</code> 유형의 예외가 발생했을 때 수행할 작업을 지정합니다.</p>
                </step>
                <step>
                    <p>다음 import를 추가합니다:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
                </step>
            </procedure>
            <p>
                일반적으로 응답에 HTTP 오류 코드가 설정되지만, 이 과제의 목적을 위해 출력이 브라우저에 직접 표시되도록 했습니다.
            </p>
            <procedure title="핸들러 트리거를 위한 샘플 코드 작성" id="write-sample-code">
                <step>
                    <p><code>.configureRouting()</code> 메서드 내에서 아래와 같이 추가 라우트를 추가합니다:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>이제 URL이 <code>/error-test</code>인 엔드포인트를 추가했습니다. 이 엔드포인트가 트리거되면 핸들러에서 사용된 유형의 예외가 발생합니다.</p>
                </step>
            </procedure>
            <procedure title="샘플 코드 재시작 및 호출" id="restart-and-invoke">
                <step>
                    <p>재실행 버튼(<img alt="IntelliJ IDEA 재실행 버튼 아이콘"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)을 클릭하여 애플리케이션을 재시작합니다.</p></step>
                <step>
                    <p>브라우저에서 <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a> URL로 이동합니다. 아래와 같이 오류 메시지가 표시되어야 합니다:</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="`App in illegal state as Too Busy` 메시지가 표시된 브라우저 화면" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="다음 단계" id="next_steps">
        <p>
            추가 과제의 끝까지 마쳤다면 이제 Ktor 서버 구성, Ktor 플러그인 통합 및 새로운 라우트 구현에 대한 이해를 갖추게 된 것입니다. 하지만 이것은 시작에 불과합니다. Ktor의 기본 개념을 더 깊이 탐구하려면 이 가이드의 다음 튜토리얼로 계속 진행하세요.
        </p>
        <p>
            다음으로는 <Links href="//server-requests-and-responses" summary="Task Manager 애플리케이션을 빌드하며 Ktor와 Kotlin을 사용한 라우팅, 요청 처리 및 매개변수의 기본 사항을 알아봅니다.">Task Manager 애플리케이션을 만들며 요청을 처리하고 응답을 생성하는 방법</Links>을 배웁니다.
        </p>
    </chapter>
</topic>