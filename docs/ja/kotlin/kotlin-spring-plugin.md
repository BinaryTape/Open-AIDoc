[//]: # (title: Kotlin-springコンパイラプラグイン)

`kotlin-spring`コンパイラプラグインは、コンパイル時に特定のSpringアノテーションが付与されたクラスやメンバーを自動的に`open`にすることで、KotlinプロジェクトをSpring向けに設定します。

このプラグインは、[`all-open`プラグイン](all-open-plugin.md)の事前設定済みラッパーであり、同様に動作します。
Springアノテーションが付与されている場合、クラスとそのメンバーを`open`にします。
同一プロジェクト内で`all-open`と`kotlin-spring`の両方を使用することもできます。

> [start.spring.io](https://start.spring.io/#!language=kotlin)を使用してプロジェクトテンプレートを生成した場合、
> `kotlin-spring`プラグインはデフォルトで有効になっています。
>
{style="note"}

## サポートされているSpringアノテーション {id="supported-spring-annotations"}

このプラグインは、クラスに以下のいずれかのSpringアノテーションが付与されている場合に、そのクラスとメンバーを`open`にします。
* [`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)
* [`@Async`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/annotation/Async.html)
* [`@Transactional`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
* [`@Cacheable`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
* [`@SpringBootTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/context/SpringBootTest.html)

このプラグインはメタアノテーションもサポートしています。Springがこれらのアノテーションに[`@Component`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html)をメタアノテーションとして付与しているため、[`@Configuration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html)、
[`@Controller`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Controller.html)、
[`@RestController`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html)、
[`@Service`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html)、または
[`@Repository`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html)が付与されたクラスも`open`になります。

## プラグインの適用 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)`ファイルの`plugins {}`ブロックに`kotlin-spring`プラグインを追加します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%"  // 使用するKotlinのバージョン
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Springプラグイン
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%springBootSupportedKotlinVersion%"
    id "org.jetbrains.kotlin.plugin.spring" version "%springBootSupportedKotlinVersion%"
}
```

</tab>
</tabs>

### Maven {id="maven"}

Mavenでは、`kotlin-spring`プラグインのサポートは`kotlin-maven-allopen`プラグインによって提供されます。
これを`pom.xml`ファイルに追加します：

```xml
<properties>
    <kotlin.version>%springBootSupportedKotlinVersion%</kotlin.version>
</properties>

<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <args>
            <arg>-Xjsr305=strict</arg>
        </args>
        <compilerPlugins>
            <plugin>spring</plugin>
        </compilerPlugins>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-allopen</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

## `kotlin-spring`プラグインの使用 {id="use-the-kotlin-spring-plugin"}

プラグインを適用すると、コンパイラは一般的なSpringアノテーションが付いたクラスをコンパイル時に`open`として扱います。
これらのクラスは`open`キーワードを追加することなく記述できます：

```kotlin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class MessageController {
    // このクラスとすべてのメンバーはopenになります
    @GetMapping
    fun listMessages() = listOf(
        Message("1", "Hello!"),
        Message("2", "Bonjour!"),
        Message("3", "Privet!"),
    )
}
```

## 次のステップ {id="what-s-next"}

* 引数なしのコンストラクタ（zero-argument constructor）を必要とするJPAエンティティには、[`kotlin-jpa`プラグイン](kotlin-jpa-plugin.md)を使用してください。これは`@Entity`、`@Embeddable`、`@MappedSuperclass`などのJPAアノテーションで`no-arg`プラグインを設定します。
* [Spring BootとKotlin入門](jvm-get-started-spring-boot.md)チュートリアルを使用して、最初のSpring Bootアプリケーションを作成しましょう。