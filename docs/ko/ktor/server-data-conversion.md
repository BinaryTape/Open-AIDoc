[//]: # (title: 데이터 변환)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-data-conversion"/>
<var name="package_name" value="io.ktor.server.plugins.dataconversion"/>
<var name="plugin_name" value="DataConversion"/>
<var name="example_name" value="data-conversion"/>

<tldr>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
Ktor 서버용 %plugin_name% 플러그인을 사용하면 값 목록을 직렬화 및 역직렬화하기 위한 커스텀 컨버터를 추가할 수 있습니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-data-conversion/index.html) 플러그인을 사용하면 값 목록을 직렬화(serialize) 및 역직렬화(deserialize)할 수 있습니다. 기본적으로 Ktor는 [DefaultConversionService](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-default-conversion-service/index.html)를 통해 기본 타입(primitive types)과 열거형(enums)을 처리합니다. `%plugin_name%` 플러그인을 설치하고 구성하여 추가적인 타입을 처리하도록 이 서비스를 확장할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션 구조를 잡을 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 이를 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## 컨버터 추가 {id="add-converters"}

`%plugin_name%` 구성 내에서 타입 변환을 정의할 수 있습니다. 지정된 타입에 대해 `convert<T>` 메서드를 제공하고 사용 가능한 함수들을 사용하여 값 목록을 직렬화 및 역직렬화하세요:

* 값 목록을 역직렬화하려면 `decode()` 함수를 사용하세요. 이 함수는 URL의 반복된 값을 나타내는 문자열 목록을 인자로 받아 디코딩된 값을 반환합니다.

  ```kotlin
  decode { values -> // 컨버터: (values: List<String>) -> Any?
    //값 역직렬화
  }
  ```

* 값을 직렬화하려면 `encode()` 함수를 사용하세요. 이 함수는 임의의 값을 인자로 받아 이를 나타내는 문자열 목록을 반환합니다.

  ```kotlin
     encode { value -> // 컨버터: (value: Any?) -> List<String>
       //값 직렬화
      }
  ```

## 서비스 접근하기

{id="service"}

현재 컨텍스트에서 `%plugin_name%` 서비스에 접근할 수 있습니다:

```kotlin
val dataConversion = application.conversionService
```

그런 다음 컨버터 서비스를 사용하여 콜백 함수를 호출할 수 있습니다:

* `fromValues(values: List<String>, type: TypeInfo)` 콜백 함수는 문자열 목록인 `values`와 변환할 대상인 `TypeInfo`를 인자로 받아 디코딩된 값을 반환합니다.
* `toValues(value: Any?)` 콜백 함수는 임의의 값을 인자로 받아 이를 나타내는 문자열 목록을 반환합니다.

## 예제

다음 예제에서는 `LocalDate` 타입에 대한 컨버터가 정의되어 값들을 직렬화 및 역직렬화하도록 설정되었습니다. `encode` 함수가 호출되면 서비스는 `SimpleDateFormat`을 사용하여 값을 변환하고 포맷된 값이 포함된 목록을 반환합니다.
`decode` 함수가 호출되면 서비스는 날짜를 `LocalDate`로 포맷하여 반환합니다.

```kotlin
    install(DataConversion) {
        convert<LocalDate> { // this: DelegatingConversionService
            val formatter = DateTimeFormatterBuilder()
                .appendValue(ChronoField.YEAR, 4, 4, SignStyle.NEVER)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2)
                .toFormatter(Locale.ROOT)

            decode { values -> // 컨버터: (values: List<String>) -> Any?
                LocalDate.from(formatter.parse(values.single()))
            }

            encode { value -> // 컨버터: (value: Any?) -> List<String>
                listOf(SimpleDateFormat.getInstance().format(value))
            }
        }
    }
```

이후 컨버전 서비스를 수동으로 호출하여 인코딩 및 디코딩된 값을 가져올 수 있습니다:

```kotlin
val encodedDate = application.conversionService.toValues(call.parameters["date"])
val decodedDate = application.conversionService.fromValues(encodedDate, typeInfo<LocalDate>())
```

전체 예제는 [%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%)에서 확인할 수 있습니다.