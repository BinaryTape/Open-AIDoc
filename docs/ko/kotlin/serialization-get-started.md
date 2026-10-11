[//]: # (title: Kotlin serialization 시작하기)

[직렬화(Serialization)](serialization.md)는 객체를 저장하거나 전송한 후 나중에 다시 재구성할 수 있는 형식으로 변환하는 과정입니다.

Kotlin serialization은 다양한 포맷을 지원합니다.
이 튜토리얼에서는 Kotlin serialization에 필요한 플러그인과 종속성을 추가하는 방법과 객체를 JSON 포맷으로 직렬화 및 역직렬화하는 방법을 안내합니다.

## 플러그인 및 종속성 추가 {id="add-plugins-and-dependencies"}

프로젝트에서 Kotlin serialization을 사용하려면 사용하는 빌드 도구에 따라 해당 플러그인과 종속성 구성을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("plugin.serialization") version "%kotlinVersion%"
}

dependencies { 
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id 'org.jetbrains.kotlin.plugin.serialization' version '%kotlinVersion%'  
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%'
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
    <serialization.version>%serializationVersion%</serialization.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>
                <execution>
                    <id>compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <compilerPlugins>
                    <plugin>kotlinx-serialization</plugin>
                </compilerPlugins>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-serialization</artifactId>
                    <version>${kotlin.version}</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>

<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json</artifactId>
        <version>${serialization.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

> Bazel용 Kotlin 컴파일러 플러그인을 설정하려면 [rules_kotlin 저장소](https://github.com/bazelbuild/rules_kotlin/tree/master/examples/plugin/src/serialization)의 예제를 참고하세요.
> Bazel은 Kotlin 팀에서 공식적으로 지원하지 않으며, 해당 저장소는 독립적으로 유지 관리됩니다.
>
{style="tip"}

### 멀티플랫폼 프로젝트에 라이브러리 추가 {id="add-the-library-to-a-multiplatform-project"}

멀티플랫폼 프로젝트에서 JSON용 Kotlin serialization을 사용하려면 공통 소스 세트(common source set)에 JSON 직렬화 라이브러리 종속성을 추가하세요:

```kotlin
commonMain {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:%serializationVersion%")
    }
}
```

이 종속성에는 코어 직렬화 라이브러리도 자동으로 포함됩니다.

### Android 프로젝트에서 Kotlin serialization을 위한 R8 구성 {initial-collapse-state="collapsed" collapsible="true" id="configure-r8-for-kotlin-serialization-in-android-projects"}

Kotlin serialization에는 기본 [ProGuard 규칙](https://github.com/Kotlin/kotlinx.serialization/blob/master/rules/common.pro)이 포함되어 있으므로, [코드 축소(shrinking)](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) 후에도 모든 직렬화 가능한 클래스의 직렬화 도구(serializer)를 유지하기 위한 추가 설정이 필요하지 않습니다.
그러나 이 규칙은 이름이 지정된 companion object가 있는 클래스에는 적용되지 않습니다.

이름이 지정된 companion object가 있는 클래스의 serializer를 유지하려면 사용하는 [호환 모드(compatibility mode)](https://r8.googlesource.com/r8/+/refs/heads/master/compatibility-faq.md)에 따른 규칙을 `proguard-rules.pro` 파일에 추가하세요:

<tabs>
<tab id="compatibility" title="R8 compatibility mode">

```bash
# 이름이 지정된 companion object가 있는 클래스의 Serializer는 getDeclaredClasses를 사용하여 검색됩니다.
# 이러한 클래스가 있는 경우 아래 예시를 본인의 클래스로 변경하세요.
-keepattributes InnerClasses # getDeclaredClasses에 필요합니다.

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 이름이 지정된 companion을 가진 직렬화 가능 클래스를 나열합니다.
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # serializer() 호출이 클래스를 올바르게 참조하기 위해 -keepnames로 충분합니다.
    static <1>$$serializer INSTANCE;
}
```

</tab>

<tab id="full" title="R8 full mode">

```bash
# 이름이 지정된 companion object가 있는 클래스의 Serializer는 getDeclaredClasses를 사용하여 검색됩니다.
# 이러한 클래스가 있는 경우 아래 예시를 본인의 클래스로 변경하세요.
-keepattributes InnerClasses # getDeclaredClasses에 필요합니다.

-if @kotlinx.serialization.Serializable class
com.example.myapplication.HasNamedCompanion, # <-- 이름이 지정된 companion을 가진 직렬화 가능 클래스를 나열합니다.
com.example.myapplication.HasNamedCompanion2
{
    static **$* *;
}
-keepnames class <1>$$serializer { # serializer() 호출이 클래스를 올바르게 참조하기 위해 -keepnames로 충분합니다.
    static <1>$$serializer INSTANCE;
}

# InnerClasses 속성을 유지하기 위해 serializer 및 직렬화 가능 클래스를 모두 유지합니다.
-keepclasseswithmembers, allowshrinking, allowobfuscation, allowaccessmodification class
com.example.myapplication.HasNamedCompanion, # <-- 이름이 지정된 companion을 가진 직렬화 가능 클래스를 나열합니다.
com.example.myapplication.HasNamedCompanion2
{
    *;
}
```

</tab>
</tabs>

> 더 좁은 범위의 [클래스 사양(class specifications)](https://www.guardsquare.com/manual/configuration/usage)을 사용하는 커스텀 ProGuard 규칙을 적용하여 런타임에 직렬화되지 않는 직렬화 가능 클래스를 제외할 수 있습니다.
> 
{style="tip"}

## 객체를 JSON으로 직렬화 {id="serialize-objects-to-json"}

Kotlin에서는 `kotlinx-serialization-json` 라이브러리를 사용하여 객체를 JSON으로 직렬화할 수 있습니다.

클래스를 직렬화 가능하게 만들려면 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 어노테이션을 지정해야 합니다.
이 어노테이션은 컴파일러에게 해당 클래스의 인스턴스를 직렬화 및 역직렬화하는 데 필요한 코드를 생성하도록 지시합니다.
자세한 내용은 [`@Serializable` 어노테이션](serialization-customization-options.md#the-serializable-annotation)을 참고하세요.

예제를 살펴보겠습니다:

1. 필요한 직렬화 라이브러리에서 선언을 가져옵니다(import):

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. `@Serializable` 어노테이션을 추가하여 클래스를 직렬화 가능하게 만듭니다:

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

   > `@Serializable` 어노테이션은 백킹 필드(backing field)가 있는 모든 프로퍼티의 기본 직렬화를 활성화합니다.
   > 프로퍼티 수준의 어노테이션, 선택적(optional) 프로퍼티 등을 사용하여 직렬화 동작을 커스터마이징할 수 있습니다.
   > 
   > 자세한 내용은 [클래스 직렬화](serialization-customization-options.md)를 참고하세요.
   >
   {style="note"}

3. [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 함수를 사용하여 이 클래스의 인스턴스를 직렬화합니다:

    ```kotlin
    // 직렬화 및 JSON 처리 라이브러리에서 선언 가져오기
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // Book 클래스를 직렬화 가능하도록 표시
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // Book 클래스의 인스턴스를 JSON 문자열로 직렬화
        val json = Json.encodeToString(Book(1937, "The Hobbit"))
        println(json)
        // {"yearPublished":1937,"title":"The Hobbit"}
    }
    ```
   {kotlin-runnable="true" id="serialize-get-started"}

   결과로 이 객체의 상태를 JSON 포맷으로 담은 문자열(`{"yearPublished":1937,"title":"The Hobbit"}`)을 얻을 수 있습니다.

   > 단일 호출로 객체 컬렉션을 직렬화할 수도 있습니다:
   >
   > ```kotlin
   > val bookList = listOf(Book(1937, "The Hobbit"), Book(1867, "War and Peace"))
   > val jsonList = Json.encodeToString(bookList)
   > ```
   >
   {style="tip"}

## JSON에서 객체로 역직렬화 {id="deserialize-objects-from-json"}

역직렬화는 JSON 문자열을 다시 객체로 변환합니다.

Kotlin에서 JSON을 객체로 역직렬화하려면:

1. 필요한 직렬화 라이브러리에서 선언을 가져옵니다:

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*
    ```

2. `@Serializable` 어노테이션을 추가하여 클래스를 직렬화 가능하게 만듭니다:

    ```kotlin
    @Serializable
    data class Book(val yearPublished: Int, val title: String)
    ```

3. [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 함수를 사용하여 JSON에서 객체를 역직렬화합니다:

    ```kotlin
    // 직렬화 및 JSON 처리 라이브러리에서 선언 가져오기
    import kotlinx.serialization.*
    import kotlinx.serialization.json.*

    // Book 클래스를 직렬화 가능하도록 표시
    @Serializable
    data class Book(val yearPublished: Int, val title: String)

    fun main() {
        // JSON 문자열을 Book 클래스의 인스턴스로 역직렬화
        val obj = Json.decodeFromString<Book>("""{"yearPublished":1937, "title": "The Hobbit"}""")
        println(obj)
        // Book(yearPublished=1937, title=The Hobbit)
    }
    ```
   {kotlin-runnable="true" id="deserialize-get-started"}

축하합니다! Kotlin에서 성공적으로 객체를 JSON으로 직렬화하고, 이를 다시 객체로 역직렬화했습니다.

## 다음 단계 {id="what-s-next"}

* [기본 제공 타입 직렬화](serialization-serialize-builtin-types.md)에서 기본형(primitives) 및 문자열과 같은 기본 타입과 특정 표준 라이브러리 클래스를 직렬화하는 방법을 알아보세요.
* [클래스 직렬화](serialization-customization-options.md)에서 클래스 직렬화를 커스터마이징하고 `@Serializable` 어노테이션의 기본 동작을 조정하는 방법을 살펴보세요.
* [JSON 직렬화 개요](serialization-configure-json-serialization.md)에서 JSON 데이터를 처리하고 JSON 직렬화를 구성하는 방법을 더 자세히 알아보세요.