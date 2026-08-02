[//]: # (title: 使用 Maven 測試 Kotlin 專案)

Kotlin 與 Maven 生態系統無縫整合，讓您可以使用業界標準工具來驗證您的後端應用程式。在本指南中，您將學習如何使用 JUnit 建立測試，並使用 Maven 外掛程式執行單元測試與整合測試。

> 如需設定 Maven 專案以同時使用 Kotlin 與 Java 的詳細指南，請參閱 [](mixing-java-kotlin-intellij.md#project-configuration)。
> 
{style="tip"}

## 使用 JUnit 建立測試

[JUnit](https://junit.org/) 是 Kotlin 後端開發的標準測試架構。雖然 Kotlin 支援多個 JUnit 版本，但大多數現代專案應使用 JUnit 6。

若要使用 JUnit 在 Kotlin 中建立測試，請使用來自 `kotlin.test` 或 JUnit 套件的 `@Test` 註解。

### 新增相依性

`kotlin-test` 程式庫是開始測試最簡單的方式。它提供了一組通用的斷言，並會自動拉取必要的 JUnit 構件。

#### JUnit 5 及更高版本

對於所有新專案，請使用 `kotlin-test-junit5` 構件。它提供對 JUnit 的完整支援，包括巢狀測試和平行執行等功能。Kotlin/JVM 支援最新的穩定 JUnit 版本：JUnit 6。

請按如下方式更新您的 `pom.xml` 檔案：

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

> 儘管名稱如此，`kotlin-test-junit5` 仍支援所有最新的 JUnit 版本，包括 JUnit 6。
>
{style="note"}

#### JUnit 4

如果您想使用較早版本的 JUnit（例如用於舊版專案），請使用利用 JUnit 4 的 `kotlin-test-junit` 構件：

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

> 有關使用 JUnit 進行測試的詳細指南和範例專案，請參閱[使用 Kotlin 測試 Java 程式碼](jvm-test-using-junit.md)教學。
>
{style="tip"}

### 撰寫單元測試

單元測試驗證程式碼中孤立的部分，例如個別函式或類別。
依照慣例，單元測試以 `*Test` 後綴命名。例如：

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

### 撰寫整合測試

整合測試驗證組件之間的互動，例如服務與資料庫。
依照慣例，整合測試以 `*IT` 後綴命名。例如：

```kotlin
import kotlin.test.Test
import kotlin.test.assertNotNull

class UserRepositoryIT {
    @Test
    fun saveFindUser() {
        // 與資料庫或服務整合的範例
        val repository = UserRepository()
        repository.save(User("KotlinUser"))
        
        val user = repository.findByName("KotlinUser")
        assertNotNull(user)
    }
}
```

## 執行測試

在 Maven 專案中，測試執行通常分為兩個外掛程式：Surefire 和 Failsafe，以確保乾淨的建置生命週期。

### 使用 Surefire 外掛程式

[Surefire 外掛程式](https://maven.apache.org/surefire/maven-surefire-plugin/)處理*單元測試*。
它會執行所有遵循 `*Test` 命名模式的 Kotlin 和 Java 測試。

預設情況下，它在建置生命週期的 `test` 階段執行，如果測試失敗，會立即使建置失敗。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.5.5</version>
</plugin>
```

若要僅執行單元測試，請使用以下指令：

```bash
mvn test
```

### 使用 Failsafe 外掛程式

[Failsafe 外掛程式](https://maven.apache.org/surefire/maven-failsafe-plugin/)處理*整合測試*。
它會執行所有遵循 `*IT` 命名模式的 Kotlin 和 Java 測試。

與 Surefire 不同，如果測試在 `integration-test` 階段失敗，Failsafe 允許建置繼續進行，從而允許 `post-integration-test` 階段的任務（例如停止 Docker 容器）執行。
如果存在任何測試失敗，建置最終會在 `verify` 階段失敗。

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

若要執行單元測試和整合測試，請使用以下指令：

```bash
mvn verify
```

## 獲取詳細的失敗訊息

Kotlin [Power-assert 編譯器外掛程式](power-assert.md)會產生詳細的失敗訊息，顯示斷言中的中間值，並在主控台輸出中提供完整的圖表。

1. 若要啟用 Power-assert，請將以下配置新增至專案的 `pom.xml`：

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
                    <!-- 指定 Power-assert 外掛程式 -->
                    <compilerPlugins>
                        <plugin>power-assert</plugin>
                    </compilerPlugins>
                    <!-- 指定要轉換的函式 -->
                    <pluginOptions>
                        <option>power-assert:function=kotlin.test.assertEquals</option>
                        <option>power-assert:function=kotlin.test.assertTrue</option>
                    </pluginOptions>
                </configuration>
                <!-- 新增 Power-assert 外掛程式相依性 -->
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
    {initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="kotlin-maven-power-assert 配置"}
    
    * 在 `<properties>` 區塊中，設定 Kotlin 版本和目標 JDK 發行版本，例如 JDK 17。
    * 在 `<dependencies>` 區塊中，新增 `kotlin-test-junit5` 以執行測試。
    * 在 `<build><plugins>` 區塊中，使用 `power-assert` 編譯器外掛程式配置 `kotlin-maven-plugin`。在 `<pluginOptions>` 下列出您想要轉換的斷言函式，並新增 Power-assert 外掛程式相依性。

2. 在 `src/test/kotlin` 目錄中建立測試檔案 `UserProfileBackendTest.kt`：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class UserProfileBackendTest {
    
        data class UserProfile(val id: Long, val email: String)
    
        @Test
        fun `verify backend entity mapping matches`() {
            // 定義預期的物件狀態
            val expectedRecord = UserProfile(id = 451L, email = "admin-dev@company.internal")
    
            // 模擬不相符的後端回應 
            val actualRecord = UserProfile(id = 451L, email = "admin-prod@company.com")
    
            // 使用標準的 kotlin.test 斷言
            assertEquals(expectedRecord, actualRecord, "設定檔配置不同步")
        }
    }
    ```

3. 執行測試並驗證輸出：

    ```bash
    mvn test
    ```

主控台會顯示完整的 Power-assert 圖表，呈現運算式中每個位置的預期值與實際值之間的差異：

```text
設定檔配置不同步
assertEquals(expectedRecord, actualRecord, "設定檔配置不同步")
             |               |
             |               UserProfile(id=451, email=admin-prod@company.com)
             UserProfile(id=451, email=admin-dev@company.internal)
```

## 探索其他測試架構

除了 JUnit 之外，您還可以使用其他流行的架構，讓 Kotlin 測試更具慣用性且更易讀：

| 程式庫 | 說明 |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| [AssertJ](https://github.com/assertj/assertj)               | 具有可鏈式斷言的流暢斷言程式庫。 |
| [Mockito-Kotlin](https://github.com/mockito/mockito-kotlin) | Mockito 的 Kotlin 包裝函式，提供幫助函式並更好地與 Kotlin 型別系統整合。 |
| [MockK](https://github.com/mockk/mockk)                     | 原生 Kotlin 模擬程式庫，支援 Kotlin 特定功能，包括協同程式和擴充方法。 |
| [Kotest](https://github.com/kotest/kotest)                  | Kotlin 的斷言程式庫，提供多種斷言樣式和廣泛的匹配器支援。 |
| [Strikt](https://github.com/robfletcher/strikt)             | Kotlin 的斷言程式庫，具有型別安全斷言並支援資料類別。 |

## 後續步驟

* 探索 [`kotlin.test` 程式庫](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/)的功能。
* 進一步了解 [Power-assert 編譯器外掛程式](power-assert.md)。