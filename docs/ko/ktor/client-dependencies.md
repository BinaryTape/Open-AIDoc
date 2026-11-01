[//]: # (title: 클라이언트 의존성 추가)

<show-structure for="chapter" depth="2"/>

<link-summary>기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.</link-summary>

프로젝트에서 Ktor HTTP 클라이언트를 사용하려면 [저장소를 구성](#repositories)하고 다음 의존성을 추가해야 합니다.

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core`에는 Ktor 클라이언트의 핵심 기능이 포함되어 있습니다.
- **[엔진 의존성](#engine-dependency)**

  엔진은 네트워크 요청을 처리하는 데 사용됩니다.
  [특정 플랫폼](client-supported-platforms.md)에서는 네트워크 요청을 처리하기 위해 특정 엔진이 필요할 수 있습니다.
- (선택 사항) **[로깅 의존성](#logging-dependency)**

  구조화되고 유연한 로깅 기능을 사용할 수 있도록 로깅 프레임워크를 제공합니다.

- (선택 사항) **[플러그인 의존성](#plugin-dependency)**

  플러그인은 클라이언트에 특정 기능을 확장하는 데 사용됩니다.

<chapter title="저장소 구성" id="repositories">
        <p>
            Ktor 의존성을 추가하기 전에 먼저 이 프로젝트에 대한 저장소를 구성해야 합니다:
        </p>
        <list>
            <li>
                <p>
                    <control>프로덕션(Production)</control>
                </p>
                <p>
                    Ktor의 프로덕션 릴리스는 Maven Central 저장소에서 제공됩니다.
                    빌드 스크립트에 다음과 같이 이 저장소를 선언할 수 있습니다:
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
                                프로젝트가 <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a>으로부터 중앙 저장소를 상속받으므로 <Path>pom.xml</Path> 파일에 Maven Central 저장소를 추가할 필요가 없습니다.
                            </p>
                        </note>
                    </TabItem>
                </Tabs>
            </li>
            <li>
                <p>
                    <control>Early Access Program (EAP)</control>
                </p>
                <p>
                    Ktor의 <a href="https://ktor.io/eap/">EAP</a> 버전을 사용하려면 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 저장소</a>를 참조해야 합니다:
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
                    Ktor EAP 버전은 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin 개발 저장소(dev repository)</a>를 필요로 할 수 있습니다:
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

## 의존성 추가 {id="add-ktor-dependencies"}

> [다양한 플랫폼](client-supported-platforms.md)을 위해 Ktor는 `ktor-client-core-jvm`과 같이 `-jvm` 또는 `-js`와 같은 접미사가 붙은 플랫폼별 아티팩트를 제공합니다. Gradle은 주어진 플랫폼에 적합한 아티팩트를 자동으로 확인하고 해결하지만, Maven은 이 기능을 지원하지 않습니다. 따라서 Maven을 사용할 때는 플랫폼별 접미사를 직접 추가해야 합니다.
>
{type="tip"}

### 클라이언트 의존성 {id="client-dependency"}

핵심 클라이언트 기능은 `ktor-client-core` 아티팩트에서 제공됩니다. 사용하는 빌드 시스템에 따라 다음과 같은 방법으로 추가할 수 있습니다:

<var name="artifact_name" value="ktor-client-core"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.core"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 멀티플랫폼 {id="client-dependency-multiplatform"}

멀티플랫폼 프로젝트의 경우, <Path>settings.gradle.kts</Path> 파일에서 Ktor 버전 카탈로그를 가져옵니다:

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
    }
}
```

그런 다음, `commonMain` 소스 세트에 `ktor-client-core`를 의존성으로 추가합니다:

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
              implementation(ktorLibs.client.core)
            }
        }
    }
}
```

### 엔진 의존성 {id="engine-dependency"}

[엔진](client-engines.md)은 네트워크 요청을 처리하는 역할을 담당합니다. Ktor는 다양한 플랫폼에 맞는 여러 클라이언트 엔진을 제공합니다.

예를 들어, 다음과 같이 `CIO` 엔진을 추가할 수 있습니다:

<var name="artifact_name" value="ktor-client-cio"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.cio"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 멀티플랫폼 {id="engine-dependency-multiplatform"}

##### 기본 엔진 사용 {id="use-default-engines"}

멀티플랫폼 프로젝트에서는 `ktor-client-engine-defaults` 아티팩트를 사용하여 각 타깃 플랫폼에 적합하게 선별된 클라이언트 엔진을 제공할 수 있습니다.

해당 아티팩트 의존성을 `commonMain` 소스 세트에 추가합니다:

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api(ktorLibs.client.engineDefaults)
            }
        }
    }
}
```
<note>
    위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
    Ktor 버전 카탈로그</a>를 사용합니다.
</note>

##### 특정 엔진 사용 {id="kmp-specific-engine"}

특정 엔진이 필요한 경우, 대신 해당하는 플랫폼 소스 세트에 해당 엔진의 의존성을 추가합니다. 예를 들어 Android에서 `OkHttp`를 사용하려면 `androidMain` 소스 세트에 `ktorLibs.client.okhttp`를 추가합니다:

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(ktorLibs.client.okhttp)
    }
}
```

<note>
    위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
    Ktor 버전 카탈로그</a>를 사용합니다.
</note>

> 각 엔진에 필요한 의존성은 [엔진 의존성 추가](client-engines.md#dependencies)를 참조하세요.
> 
{style="tip"}

### 로깅 의존성 {id="logging-dependency"}

<p>
  <a href="client-engines.md#jvm">JVM</a>에서 Ktor는 로깅을 위한 추상화 계층으로 Java용 Simple Logging Facade(<a href="http://www.slf4j.org/">SLF4J</a>)를 사용합니다. SLF4J는 로깅 API를 기본 로깅 구현과 분리하므로, 애플리케이션 요구사항에 가장 적합한 로깅 프레임워크를 통합할 수 있습니다. 
  일반적으로 <a href="https://logback.qos.ch/">Logback</a> 또는 
  <a href="https://logging.apache.org/log4j">Log4j</a>가 많이 사용됩니다. 프레임워크가 제공되지 않으면 SLF4J는 기본적으로 NOP(No-Operation) 구현을 사용하며, 이는 사실상 로깅을 비활성화합니다.
</p>

<p>
  로깅을 활성화하려면 <a href="https://logback.qos.ch/">Logback</a>과 같이 필요한 SLF4J 구현이 포함된 아티팩트를 추가합니다:
</p>
<var name="group_id" value="ch.qos.logback"/>
<var name="artifact_name" value="logback-classic"/>
<var name="version" value="logback_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

Ktor에서의 로깅에 관한 자세한 내용은 [Ktor Client 로깅](client-logging.md)을 참조하세요.

### 플러그인 의존성 {id="plugin-dependency"}

Ktor를 사용하면 인증이나 직렬화와 같이 기본적으로 제공되지 않는 추가 클라이언트 기능([플러그인](client-plugins.md))을 사용할 수 있습니다. 이러한 기능 중 일부는 별도의 아티팩트로 제공됩니다. 필요한 플러그인에 대한 주제 문서에서 어떤 의존성이 필요한지 확인할 수 있습니다.

> 멀티플랫폼 프로젝트의 경우 플러그인 의존성은 `commonMain` 소스 세트에 추가해야 합니다. 일부 플러그인은 특정 플랫폼에 대해 [제한 사항](client-engines.md#limitations)이 있을 수 있습니다.

## Ktor 버전 일관성 보장 {id="ensure-ktor-version-consistency"}

<chapter title="Ktor BOM 의존성 사용">

Ktor BOM을 사용하면 각 의존성의 버전을 개별적으로 지정하지 않고도 모든 Ktor 모듈이 동일하고 일관된 버전을 사용하도록 보장할 수 있습니다.

Ktor BOM 의존성을 추가하려면 빌드 스크립트에 다음과 같이 선언합니다:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(platform(&quot;io.ktor:ktor-bom:$ktor_version&quot;))"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation platform &quot;io.ktor:ktor-bom:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependencyManagement&gt;&#10;              &lt;dependencies&gt;&#10;                  &lt;dependency&gt;&#10;                      &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                      &lt;artifactId&gt;ktor-bom&lt;/artifactId&gt;&#10;                      &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                      &lt;type&gt;pom&lt;/type&gt;&#10;                      &lt;scope&gt;import&lt;/scope&gt;&#10;                  &lt;/dependency&gt;&#10;              &lt;/dependencies&gt;&#10;          &lt;/dependencyManagement&gt;"/>
    </TabItem>
</Tabs>
</chapter>

<var name="target_module" value="client"/>
<chapter id="using-version-catalog" title="게시된 버전 카탈로그 사용">
            <p>
                게시된 버전 카탈로그를 사용하여 Ktor 의존성 선언을 중앙 집중식으로 관리할 수도 있습니다.
                이 방식은 다음과 같은 이점을 제공합니다:
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    자체 카탈로그에서 Ktor 버전을 수동으로 선언할 필요가 없습니다.
                </li>
                <li>
                    단일 네임스페이스 아래에 모든 Ktor 모듈을 노출합니다.
                </li>
            </list>
            <p>
                카탈로그를 선언하려면 <Path>settings.gradle.kts</Path>에서 원하는 이름으로 버전 카탈로그를 생성합니다:
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                그런 다음 해당 카탈로그 이름을 참조하여 모듈의 <Path>build.gradle.kts</Path>에 의존성을 추가할 수 있습니다:
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>