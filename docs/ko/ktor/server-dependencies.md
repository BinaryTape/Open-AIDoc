<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="서버 의존성 추가하기"
   id="server-dependencies" help-id="Gradle">
<show-structure for="chapter" depth="2"/>
<link-summary>기존 Gradle/Maven 프로젝트에 Ktor 서버 의존성을 추가하는 방법을 알아봅니다.</link-summary>
<p>
    이 주제에서는 기존 Gradle/Maven 프로젝트에 Ktor 서버에 필요한 의존성을 추가하는 방법을 보여줍니다.
</p>
<chapter title="저장소 구성하기" id="repositories">
    <p>
        Ktor 의존성을 추가하기 전에 이 프로젝트의 저장소를 구성해야 합니다.
    </p>
    <list>
        <li>
            <p>
                <control>프로덕션 (Production)</control>
            </p>
            <p>
                Ktor의 프로덕션 릴리스는 Maven 중앙 저장소(Maven central repository)에서 사용할 수 있습니다.
                다음과 같이 빌드 스크립트에 이 저장소를 선언할 수 있습니다.
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <note>
                        <p>
                            프로젝트가 <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a>에서 중앙 저장소를 상속받으므로 <Path>pom.xml</Path> 파일에 Maven 중앙 저장소를 추가할 필요가 없습니다.
                        </p>
                    </note>
                </TabItem>
            </Tabs>
        </li>
        <li>
            <p>
                <control>얼리 액세스 프로그램 (EAP)</control>
            </p>
            <p>
                Ktor의 <a href="https://ktor.io/eap/">EAP</a> 버전에 접근하려면 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 저장소</a>를 참조해야 합니다.
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;)&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/ktor-eap&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </TabItem>
            </Tabs>
            <p>
                Ktor EAP에는 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin 개발 저장소 (dev repository)</a>가 필요할 수 있습니다.
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/dev&quot;)&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/dev&quot;&#10;                                }&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/dev&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                </TabItem>
            </Tabs>
        </li>
    </list>
</chapter>
<chapter title="의존성 추가하기" id="add-ktor-dependencies">
    <chapter title="핵심 의존성" id="core-dependencies">
        <p>
            모든 Ktor 애플리케이션에는 최소한 다음 의존성이 필요합니다.
        </p>
        <list>
            <li>
                <p>
                    <code>ktor-server-core</code>: 핵심 Ktor 기능이 포함되어 있습니다.
                </p>
            </li>
            <li>
                <p>
                    <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진 (engine)</Links>에 대한 의존성 (예: <code>ktor-server-netty</code>).
                </p>
            </li>
        </list>
        <p>
            다양한 플랫폼을 위해 Ktor는 <code>ktor-server-core-jvm</code> 또는 <code>ktor-server-netty-jvm</code>과 같이 <code>-jvm</code>과 같은 접미사가 붙은 플랫폼별 아티팩트(artifact)를 제공합니다.
            Gradle은 지정된 플랫폼에 적합한 아티팩트를 자동으로 확인하는 반면, Maven은 이 기능을 지원하지 않습니다.
            즉, Maven의 경우 플랫폼별 접미사를 수동으로 추가해야 합니다.
            기본 Ktor 애플리케이션의 <code>dependencies</code> 블록은 다음과 같을 수 있습니다.
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-server-core:%ktor_version%&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty:%ktor_version%&quot;)&#10;                        }"/>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-server-core:%ktor_version%&quot;&#10;                            implementation &quot;io.ktor:ktor-server-netty:%ktor_version%&quot;&#10;                        }"/>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <code-block lang="XML" code="                        &lt;dependencies&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-core-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                            &lt;dependency&gt;&#10;                                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                                &lt;artifactId&gt;ktor-server-netty-jvm&lt;/artifactId&gt;&#10;                                &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                            &lt;/dependency&gt;&#10;                        &lt;/dependencies&gt;"/>
            </TabItem>
        </Tabs>
    </chapter>
    <chapter title="로깅 의존성" id="logging-dependency">
        <p>
            Ktor는 다양한 로깅 프레임워크(예: Logback 또는 Log4j)의 퍼사드(facade)로 SLF4J API를 사용하며, 애플리케이션 이벤트를 로그로 남길 수 있게 해줍니다.
            필요한 아티팩트를 추가하는 방법을 알아보려면 <a href="server-logging.md#add_dependencies">로거 의존성 추가하기</a>를 참조하세요.
        </p>
    </chapter>
    <chapter title="플러그인 의존성" id="plugin-dependencies">
        <p>
            Ktor 기능을 확장하는 <Links href="//server-plugins" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.">플러그인</Links>에는 추가 의존성이 필요할 수 있습니다.
            해당 주제에서 더 자세히 알아볼 수 있습니다.
        </p>
    </chapter>
</chapter>
<var name="target_module" value="server"/>
<chapter title="Ktor 버전 일관성 보장" id="ensure-version-consistency">
    <chapter id="using-gradle-plugin" title="Ktor Gradle 플러그인 사용하기">
        <p>
            <a href="https://github.com/ktorio/ktor-build-plugins">Ktor Gradle 플러그인</a>을 적용하면
            Ktor BOM 의존성이 암시적으로 추가되어 모든 Ktor 의존성이 동일한 버전인지 확인할 수 있습니다.
            이 경우 Ktor 아티팩트에 의존할 때 더 이상 버전을 지정할 필요가 없습니다.
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                        plugins {&#10;                            // ...&#10;                            id(&quot;io.ktor.plugin&quot;) version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation(&quot;io.ktor:ktor-%target_module%-core&quot;)&#10;                            // ...&#10;                        }"/>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                        plugins {&#10;                            // ...&#10;                            id &quot;io.ktor.plugin&quot; version &quot;%ktor_version%&quot;&#10;                        }&#10;                        dependencies {&#10;                            implementation &quot;io.ktor:ktor-%target_module%-core&quot;&#10;                            // ...&#10;                        }"/>
            </TabItem>
        </Tabs>
    </chapter>
    <chapter id="using-version-catalog" title="게시된 버전 카탈로그 사용하기">
        <p>
            게시된 버전 카탈로그(version catalog)를 사용하여 Ktor 의존성 선언을 중앙 집중화할 수도 있습니다.
            이 접근 방식은 다음과 같은 이점을 제공합니다.
        </p>
        <list id="published-version-catalog-benefits">
            <li>
                자체 카탈로그에서 Ktor 버전을 수동으로 선언할 필요가 없습니다.
            </li>
            <li>
                모든 Ktor 모듈을 단일 네임스페이스 아래에 노출합니다.
            </li>
        </list>
        <p>
            카탈로그를 선언하려면 <Path>settings.gradle.kts</Path>에서 원하는 이름으로 버전 카탈로그를 생성합니다.
        </p>
        <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            그런 다음 모듈의 <Path>build.gradle.kts</Path>에서 카탈로그 이름을 참조하여 의존성을 추가할 수 있습니다.
        </p>
        <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
    </chapter>
</chapter>
<chapter title="애플리케이션 실행을 위한 엔트리 포인트 생성" id="create-entry-point">
    <p>
        Gradle/Maven을 사용하여 Ktor 서버를 <Links href="//server-run" summary="Ktor 서버 애플리케이션을 실행하는 방법을 알아봅니다.">실행</Links>하는 방식은 <Links href="//server-create-and-configure" summary="애플리케이션 배포 요구 사항에 따라 서버를 생성하는 방법을 알아봅니다.">서버를 생성</Links>하는 방식에 따라 다릅니다.
        다음 방법 중 하나로 애플리케이션의 메인 클래스를 지정할 수 있습니다.
    </p>
    <list>
        <li>
            <p>
                <a href="#embedded-server">embeddedServer</a>를 사용하는 경우 다음과 같이 메인 클래스를 지정합니다.
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;com.example.ApplicationKt&quot;)&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;com.example.ApplicationKt&quot;&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;com.example.ApplicationKt&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </TabItem>
            </Tabs>
        </li>
        <li>
            <p>
                <a href="#engine-main">EngineMain</a>을 사용하는 경우 이를 메인 클래스로 구성해야 합니다.
                Netty의 경우 다음과 같습니다.
            </p>
            <Tabs group="languages">
                <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                    <code-block lang="Kotlin" code="                            application {&#10;                                mainClass.set(&quot;io.ktor.server.netty.EngineMain&quot;)&#10;                            }"/>
                </TabItem>
                <TabItem title="Gradle (Groovy)" group-key="groovy">
                    <code-block lang="Groovy" code="                            application {&#10;                                mainClass = &quot;io.ktor.server.netty.EngineMain&quot;&#10;                            }"/>
                </TabItem>
                <TabItem title="Maven" group-key="maven">
                    <code-block lang="XML" code="                            &lt;properties&gt;&#10;                                &lt;main.class&gt;io.ktor.server.netty.EngineMain&lt;/main.class&gt;&#10;                            &lt;/properties&gt;"/>
                </TabItem>
            </Tabs>
        </li>
    </list>
    <note>
        <p>
            애플리케이션을 Fat JAR로 패키징하려는 경우, 해당 플러그인을 구성할 때 서버를 생성하는 방식도 고려해야 합니다.
            다음 주제에서 더 자세히 알아보세요.
        </p>
        <list>
            <li>
                <p>
                    <Links href="//server-fatjar" summary="Ktor Gradle 플러그인을 사용하여 실행 가능한 fat JAR을 만들고 실행하는 방법을 알아봅니다.">Ktor Gradle 플러그인을 사용하여 fat JAR 생성하기</Links>
                </p>
            </li>
            <li>
                <p>
                    <Links href="//maven-assembly-plugin" summary="샘플 프로젝트: tutorial-server-get-started-maven">Maven Assembly 플러그인을 사용하여 fat JAR 생성하기</Links>
                </p>
            </li>
        </list>
    </note>
</chapter>
</topic>