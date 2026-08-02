[//]: # (title: Maven으로 Kotlin 프로젝트 테스트하기)

Kotlin은 Maven 생태계와 원활하게 통합되어, 업계 표준 도구를 사용하여 백엔드 애플리케이션을 검증할 수 있습니다. 이 가이드에서는 JUnit으로 테스트를 작성하고 Maven 플러그인을 사용하여 단위 및 통합 테스트를 실행하는 방법을 알아봅니다.

> Maven 프로젝트에서 Kotlin과 Java를 함께 사용하도록 설정하는 자세한 방법은 [](mixing-java-kotlin-intellij.md#project-configuration)을 참고하세요.
> 
{style="tip"}

## JUnit으로 테스트 만들기

[JUnit](https://junit.org/)은 Kotlin 백엔드 개발을 위한 표준 테스팅 프레임워크입니다. Kotlin은 여러 JUnit 버전을 지원하지만, 대부분의 최신 프로젝트에서는 JUnit 6를 사용해야 합니다.

JUnit을 사용하여 Kotlin에서 테스트를 만들려면 `kotlin.test` 또는 JUnit 패키지의 `@Test` 어노테이션을 사용하세요.

### 의존성 추가

`kotlin-test` 라이브러리는 시작하는 가장 쉬운 방법입니다. 이 라이브러리는 공통 단언(assertions) 세트를 제공하며 필요한 JUnit 아티팩트를 자동으로 가져옵니다.

#### JUnit 5 및 이후 버전

모든 새 프로젝트에는 `kotlin-test-junit5` 아티팩트를 사용하세요. 이 아티팩트는 중첩 테스트(nested tests) 및 병렬 실행과 같은 기능을 포함하여 JUnit에 대한 완전한 지원을 제공합니다. Kotlin/JVM은 최신 안정화 버전인 JUnit 6를 지원합니다.

`pom.xml` 파일을 다음과 같이 업데이트하세요:

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-test-junit5</artifactId>
        <version>%kotlinVersion%</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

> 이름에도 불구하고 `kotlin-test-junit5`는 JUnit 6를 포함한 모든 최신 JUnit 버전을 지원합니다.
>
{style="note"}

#### JUnit 4

레거시 프로젝트와 같이 이전 버전의 JUnit을 사용하려는 경우, JUnit 4를 활용하는 `kotlin-test-junit` 아티팩트를 사용하세요:

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-test-junit</artifactId>
        <version>%kotlinVersion%</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

> JUnit을 사용한 테스트에 대한 자세한 가이드와 샘플 프로젝트는 [Kotlin으로 Java 코드 테스트하기](jvm-test-using-junit.md) 튜토리얼을 참고하세요.
>
{style="tip"}

### 단위 테스트 작성하기

단위 테스트(Unit tests)는 개별 함수나 클래스와 같이 코드의 격리된 부분을 검증합니다. 
관례적으로 단위 테스트 이름에는 `*Test` 접미사를 붙입니다. 예시:

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

class OrderServiceTest {
    @Test
    fun `calculate total should sum item prices`() {
        val service = OrderService()
        val result = service.calculateTotal(listOf(10.0, 25.0))
        assertEquals(35.0, result)
    }
}
```

### 통합 테스트 작성하기

통합 테스트(Integration tests)는 서비스와 데이터베이스 등 컴포넌트 간의 상호작용을 검증합니다. 
관례적으로 통합 테스트 이름에는 `*IT` 접미사를 붙입니다. 예시:

```kotlin
import kotlin.test.Test
import kotlin.test.assertNotNull

class UserRepositoryIT {
    @Test
    fun saveFindUser() {
        // Example integration with a database or service
        val repository = UserRepository()
        repository.save(User("KotlinUser"))
        
        val user = repository.findByName("KotlinUser")
        assertNotNull(user)
    }
}
```

## 테스트 실행하기

Maven 프로젝트에서 테스트 실행은 일반적으로 빌드 수명 주기를 깔끔하게 유지하기 위해 Surefire와 Failsafe 두 가지 플러그인으로 나뉩니다.

### Surefire 플러그인 사용

[Surefire 플러그인](https://maven.apache.org/surefire/maven-surefire-plugin/)은 _단위 테스트_를 처리합니다. 
이 플러그인은 `*Test` 명명 패턴을 따르는 모든 Kotlin 및 Java 테스트를 실행합니다.

기본적으로 빌드 수명 주기의 `test` 단계에서 실행되며, 테스트가 실패하면 즉시 빌드를 중단합니다.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.5.5</version>
</plugin>
```

단위 테스트만 실행하려면 다음 명령을 사용하세요:

```bash
mvn test
```

### Failsafe 플러그인 사용

[Failsafe 플러그인](https://maven.apache.org/surefire/maven-failsafe-plugin/)은 _통합 테스트_를 처리합니다. 
이 플러그인은 `*IT` 명명 패턴을 따르는 모든 Kotlin 및 Java 테스트를 실행합니다.

Surefire와 달리 Failsafe는 `integration-test` 단계에서 테스트가 실패하더라도 빌드를 계속 진행할 수 있게 하여, `post-integration-test` 단계의 작업(예: Docker 컨테이너 중지)을 실행할 수 있도록 합니다. 
빌드는 최종적으로 `verify` 단계에서 테스트 실패 여부에 따라 실패 처리됩니다.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.5</version>
    <executions>
        <execution>
            <goals>
                <goal>integration-test</goal>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

단위 테스트와 통합 테스트를 모두 실행하려면 다음 명령을 사용하세요:

```bash
mvn verify
```

## 상세한 실패 메시지 확인하기

Kotlin [Power-assert 컴파일러 플러그인](power-assert.md)은 단언(assertions)의 중간 값을 보여주는 상세한 실패 메시지를 생성하여 콘솔 출력에서 전체 다이어그램을 제공합니다.

1. Power-assert를 활성화하려면 프로젝트의 `pom.xml`에 다음 설정을 추가하세요:

    ```xml
    <properties>
        <kotlin.version>%kotlinVersion%</kotlin.version>
        <kotlin.compiler.jdkRelease>17</kotlin.compiler.jdkRelease>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-test-junit5</artifactId>
            <version>${kotlin.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <extensions>true</extensions>
                <executions>
                    <execution>
                        <id>compile</id>
                        <phase>process-sources</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <phase>process-test-sources</phase>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <!-- Power-assert 플러그인 지정 -->
                    <compilerPlugins>
                        <plugin>power-assert</plugin>
                    </compilerPlugins>
                    <!-- 변환할 함수 지정 -->
                    <pluginOptions>
                        <option>power-assert:function=kotlin.test.assertEquals</option>
                        <option>power-assert:function=kotlin.test.assertTrue</option>
                    </pluginOptions>
                </configuration>
                <!-- Power-assert 플러그인 의존성 추가 -->
                <dependencies>
                    <dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-power-assert</artifactId>
                        <version>${kotlin.version}</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
    ```
    {initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="kotlin-maven-power-assert 설정"}
    
    * `<properties>` 섹션에서 Kotlin 버전과 대상 JDK 릴리스 버전(예: JDK 17)을 설정합니다.
    * `<dependencies>` 섹션에서 테스트 실행을 위한 `kotlin-test-junit5`를 추가합니다.
    * `<build><plugins>` 섹션에서 `power-assert` 컴파일러 플러그인을 사용하여 `kotlin-maven-plugin`을 구성합니다. `<pluginOptions>` 아래에 변환하려는 단언 함수를 나열하고 Power-assert 플러그인 의존성을 추가합니다.

2. `src/test/kotlin` 디렉토리에 `UserProfileBackendTest.kt` 테스트 파일을 생성하세요:

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class UserProfileBackendTest {
    
        data class UserProfile(val id: Long, val email: String)
    
        @Test
        fun `verify backend entity mapping matches`() {
            // 예상되는 객체 상태 정의
            val expectedRecord = UserProfile(id = 451L, email = "admin-dev@company.internal")
    
            // 일치하지 않는 백엔드 응답 시뮬레이션
            val actualRecord = UserProfile(id = 451L, email = "admin-prod@company.com")
    
            // 표준 kotlin.test 단언 사용
            assertEquals(expectedRecord, actualRecord, "Profile configurations out of sync")
        }
    }
    ```

3. 테스트를 실행하고 출력을 확인하세요:

    ```bash
    mvn test
    ```

콘솔에는 전체 Power-assert 다이어그램이 표시되어 표현식의 각 위치에서 예상 값과 실제 값의 차이를 보여줍니다:

```text
Profile configurations out of sync
assertEquals(expectedRecord, actualRecord, "Profile configurations out of sync")
             |               |
             |               UserProfile(id=451, email=admin-prod@company.com)
             UserProfile(id=451, email=admin-dev@company.internal)
```

## 다른 테스팅 프레임워크 살펴보기

JUnit 외에도 Kotlin 테스트를 더 관용적(idiomatic)이고 읽기 쉽게 만들어주는 다른 인기 있는 프레임워크를 사용할 수 있습니다:

| 라이브러리 | 설명 |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| [AssertJ](https://github.com/assertj/assertj)               | 체이닝 가능한 단언을 제공하는 유연한(Fluent) 단언 라이브러리입니다. |
| [Mockito-Kotlin](https://github.com/mockito/mockito-kotlin) | 헬퍼 함수와 Kotlin 타입 시스템과의 더 나은 통합을 제공하는 Mockito용 Kotlin 래퍼입니다. |
| [MockK](https://github.com/mockk/mockk)                     | 코루틴 및 확장 함수를 포함하여 Kotlin 전용 기능을 지원하는 네이티브 Kotlin 모킹 라이브러리입니다. |
| [Kotest](https://github.com/kotest/kotest)                  | 여러 단언 스타일과 광범위한 매처(matcher) 지원을 제공하는 Kotlin용 단언 라이브러리입니다. |
| [Strikt](https://github.com/robfletcher/strikt)             | 타입 안전한 단언과 데이터 클래스 지원을 제공하는 Kotlin용 단언 라이브러리입니다. |

## 다음 단계

* [`kotlin.test` 라이브러리](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/)의 기능을 살펴보세요.
* [Power-assert 컴파일러 플러그인](power-assert.md)에 대해 자세히 알아보세요.