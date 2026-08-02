[//]: # (title: Maven を使用した Kotlin プロジェクトのテスト)

Kotlin は Maven エコシステムとシームレスに統合されており、業界標準のツールを使用してバックエンドアプリケーションを検証できます。このガイドでは、JUnit を使用してテストを作成する方法と、Maven プラグインを使用してユニットテストおよび統合テストを実行する方法について説明します。

> Kotlin と Java の両方を使用するように Maven プロジェクトをセットアップするための詳細なガイドについては、[](mixing-java-kotlin-intellij.md#project-configuration) を参照してください。
> 
{style="tip"}

## JUnit を使用したテストの作成

[JUnit](https://junit.org/) は、Kotlin バックエンド開発における標準的なテスティングフレームワークです。Kotlin は複数の JUnit バージョンをサポートしていますが、現代的なプロジェクトの多くは JUnit 6 を使用すべきです。

JUnit を使用して Kotlin でテストを作成するには、`kotlin.test` または JUnit パッケージの `@Test` アノテーションを使用します。

### 依存関係の追加

`kotlin-test` ライブラリを使用するのが最も簡単な方法です。これは共通のアサーションセットを提供し、必要な JUnit アーティファクトを自動的に取得します。

#### JUnit 5 以降

すべての新しいプロジェクトでは、`kotlin-test-junit5` アーティファクトを使用してください。これには、ネストされたテストや並列実行などの機能を含む、JUnit の完全なサポートが含まれています。Kotlin/JVM は、最新の安定した JUnit バージョンである JUnit 6 をサポートしています。

`pom.xml` ファイルを次のように更新します。

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

> その名称にかかわらず、`kotlin-test-junit5` は JUnit 6 を含む最新のすべての JUnit バージョンをサポートしています。
>
{style="note"}

#### JUnit 4

レガシープロジェクトなどで以前のバージョンの JUnit を使用したい場合は、JUnit 4 を利用する `kotlin-test-junit` アーティファクトを使用してください。

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

> JUnit を使用したテストの詳細なガイドとサンプルプロジェクトについては、[Kotlin による Java コードのテスト](jvm-test-using-junit.md) チュートリアルを参照してください。
>
{style="tip"}

### ユニットテストの作成

ユニットテストは、個々の関数やクラスなど、コードの隔離された部分を検証します。
慣例として、ユニットテストには `*Test` という接尾辞を付けます。例：

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

### 統合テストの作成

統合テストは、サービスとデータベースの間など、コンポーネント間の相互作用を検証します。
慣例として、統合テストには `*IT` という接尾辞を付けます。例：

```kotlin
import kotlin.test.Test
import kotlin.test.assertNotNull

class UserRepositoryIT {
    @Test
    fun saveFindUser() {
        // データベースまたはサービスとの統合例
        val repository = UserRepository()
        repository.save(User("KotlinUser"))
        
        val user = repository.findByName("KotlinUser")
        assertNotNull(user)
    }
}
```

## テストの実行

Maven プロジェクトでは、クリーンなビルドライフサイクルを確保するために、通常 Surefire と Failsafe の 2 つのプラグインでテスト実行を分担します。

### Surefire プラグインによる実行

[Surefire プラグイン](https://maven.apache.org/surefire/maven-surefire-plugin/) は、*ユニットテスト* を処理します。
`*Test` の命名パターンに従うすべての Kotlin および Java テストを実行します。

デフォルトでは、ビルドライフサイクルの `test` フェーズで実行され、テストが失敗した場合は直ちにビルドを失敗させます。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.5.5</version>
</plugin>
```

ユニットテストのみを実行するには、次のコマンドを使用します。

```bash
mvn test
```

### Failsafe プラグインによる実行

[Failsafe プラグイン](https://maven.apache.org/surefire/maven-failsafe-plugin/) は、*統合テスト* を処理します。
`*IT` の命名パターンに従うすべての Kotlin および Java テストを実行します。

Surefire とは異なり、Failsafe は `integration-test` フェーズ中にテストが失敗してもビルドを続行できるため、`post-integration-test` フェーズのタスク（Docker コンテナの停止など）を実行できます。
テストの失敗があった場合、最終的に `verify` フェーズでビルドが失敗します。

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

ユニットテストと統合テストの両方を実行するには、次のコマンドを使用します。

```bash
mvn verify
```

## 詳細な失敗メッセージの取得

Kotlin の [Power-assert コンパイラプラグイン](power-assert.md) は、アサーション内の中間値を表示する詳細な失敗メッセージを生成し、コンソール出力に完全な図（ダイアグラム）を表示します。

1. Power-assert を有効にするには、以下の設定をプロジェクトの `pom.xml` に追加します。

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
                    <!-- Power-assert プラグインを指定 -->
                    <compilerPlugins>
                        <plugin>power-assert</plugin>
                    </compilerPlugins>
                    <!-- 変換する関数を指定 -->
                    <pluginOptions>
                        <option>power-assert:function=kotlin.test.assertEquals</option>
                        <option>power-assert:function=kotlin.test.assertTrue</option>
                    </pluginOptions>
                </configuration>
                <!-- Power-assert プラグインの依存関係を追加 -->
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
    {initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="kotlin-maven-power-assert の設定"}
    
    * `<properties>` セクションで、Kotlin のバージョンとターゲット JDK リリースバージョン（例：JDK 17）を設定します。
    * `<dependencies>` セクションに、テスト実行用の `kotlin-test-junit5` を追加します。
    * `<build><plugins>` セクションで、`power-assert` コンパイラプラグインを使用して `kotlin-maven-plugin` を設定します。`<pluginOptions>` の下に変換したいアサーション関数をリストし、Power-assert プラグインの依存関係を追加します。

2. テストファイル `UserProfileBackendTest.kt` を `src/test/kotlin` ディレクトリに作成します。

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class UserProfileBackendTest {
    
        data class UserProfile(val id: Long, val email: String)
    
        @Test
        fun `verify backend entity mapping matches`() {
            // 期待されるオブジェクトの状態を定義
            val expectedRecord = UserProfile(id = 451L, email = "admin-dev@company.internal")
    
            // 不一致となるバックエンドレスポンスをシミュレート 
            val actualRecord = UserProfile(id = 451L, email = "admin-prod@company.com")
    
            // 標準の kotlin.test アサーションを使用
            assertEquals(expectedRecord, actualRecord, "Profile configurations out of sync")
        }
    }
    ```

3. テストを実行して出力を確認します。

    ```bash
    mvn test
    ```

コンソールには完全な Power-assert の図が表示され、式の各位置における期待値と実際の値の差が示されます。

```text
Profile configurations out of sync
assertEquals(expectedRecord, actualRecord, "Profile configurations out of sync")
             |               |
             |               UserProfile(id=451, email=admin-prod@company.com)
             UserProfile(id=451, email=admin-dev@company.internal)
```

## その他のテスティングフレームワークの探索

JUnit のほかに、Kotlin のテストをよりイディオマティック（Kotlin らしい書き方）で読みやすくするために、他の人気のあるフレームワークを使用することもできます。

| ライブラリ | 説明 |
|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| [AssertJ](https://github.com/assertj/assertj)               | メソッドチェーンが可能な、流れるような（Fluent）アサーションライブラリ。 |
| [Mockito-Kotlin](https://github.com/mockito/mockito-kotlin) | ヘルパー関数を提供し、Kotlin の型システムとの親和性を高めた Mockito の Kotlin 用ラッパー。 |
| [MockK](https://github.com/mockk/mockk)                     | コルーチンや拡張関数を含む Kotlin 固有の機能をサポートする、Kotlin ネイティブのモックライブラリ。 |
| [Kotest](https://github.com/kotest/kotest)                  | 複数のアサーションスタイルと広範なマッチャーをサポートする Kotlin 用アサーションライブラリ。 |
| [Strikt](https://github.com/robfletcher/strikt)             | 型安全なアサーションとデータクラスのサポートを備えた Kotlin 用アサーションライブラリ。 |

## 次のステップ

* [`kotlin.test` ライブラリ](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/) の機能を探索する。
* [Power-assert コンパイラプラグイン](power-assert.md) について詳しく学ぶ。