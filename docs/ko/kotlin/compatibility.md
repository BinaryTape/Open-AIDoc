<!--- TOC -->

* [호환성](#compatibility)
* [공개 API 유형](#public-api-types)
  * [실험적(Experimental) API](#experimental-api)
  * [Flow 미리보기(Preview) API](#flow-preview-api)
  * [더 이상 사용되지 않는(Obsolete) API](#obsolete-api)
  * [내부(Internal) API](#internal-api)
  * [안정적(Stable) API](#stable-api)
  * [지원 종료 주기(Deprecation cycle)](#deprecation-cycle)
* [어노테이션이 지정된 API 사용하기](#using-annotated-api)
  * [프로그래밍 방식](#programmatically)
  * [Gradle](#gradle)
  * [Maven](#maven)

<!--- END -->

## 호환성 {id="compatibility"}
이 문서는 버전 1.0.0 이후 `kotlinx.coroutines` 라이브러리의 호환성 정책과 호환성 관련 어노테이션의 의미(semantics)를 설명합니다.

## 공개 API 유형 {id="public-api-types"}
`kotlinx.coroutines`의 공개 API는 안정적(stable), 실험적(experimental), 더 이상 사용되지 않음(obsolete), 내부(internal), 지원 종료(deprecated)의 다섯 가지 종류로 나뉩니다. 
안정적 API를 제외한 모든 공개 API는 해당 어노테이션으로 표시됩니다.

### 실험적 API {id="experimental-api"}
실험적 API는 [@ExperimentalCoroutinesApi][ExperimentalCoroutinesApi] 어노테이션으로 표시됩니다.
API의 설계에 잠재적인 미결 사항이 남아 있어, 향후 API의 동작 방식(semantics)이 변경되거나 지원 종료로 이어질 가능성이 있는 경우 실험적 API로 표시됩니다.

기본적으로 대부분의 새로운 API는 실험적 API로 표시되며, 새로운 이슈가 발생하지 않으면 다음 주요 릴리스 중 하나에서 안정적 API가 됩니다.
그렇지 않은 경우, ABI(애플리케이션 바이너리 인터페이스) 변경 없이 동작 방식을 수정하거나 지원 종료 주기(deprecation cycle)를 거치게 됩니다. 

실험적 API 사용이 위험할 수 있는 경우:
* `kotlinx.coroutines`에 의존하는 라이브러리를 작성 중이며, 해당 라이브러리의 안정적인 API 내에서 실험적 코루틴 API를 사용하려는 경우. 라이브러리의 최종 사용자가 실험적 API의 동작 방식이 약간 변경된 최신 `kotlinx.coroutines` 버전으로 업데이트할 때 예기치 않은 결과가 발생할 수 있습니다.
* 애플리케이션의 핵심 인프라를 실험적 API를 기반으로 구축하려는 경우. 

### Flow 미리보기 API {id="flow-preview-api"}
모든 [Flow] 관련 API는 [@FlowPreview][FlowPreview] 어노테이션으로 표시됩니다.
이 어노테이션은 Flow API가 미리보기(preview) 상태임을 나타냅니다.
미리보기 기능에 대해서는 바이너리, 소스 및 동작 방식 호환성을 포함하여 릴리스 간의 호환성을 보장하지 않습니다.

미리보기 API 사용이 위험할 수 있는 경우:
* 라이브러리/프레임워크를 작성 중이며, 안정적인 릴리스나 안정적인 API에서 [Flow] API를 사용하려는 경우.
* 애플리케이션의 핵심 인프라에서 [Flow]를 사용하려는 경우.
* [Flow]를 "한 번 작성하고 잊어버리는" 솔루션으로 사용하고 싶으며, `kotlinx.coroutines` 업데이트 시 발생하는 추가 유지보수 비용을 감당할 수 없는 경우.

### 더 이상 사용되지 않는 API {id="obsolete-api"}
더 이상 사용되지 않는(Obsolete) API는 [@ObsoleteCoroutinesApi][ObsoleteCoroutinesApi] 어노테이션으로 표시됩니다.
Obsolete API는 실험적 API와 유사하지만, 이미 심각한 설계 결함이 발견되었고 잠재적인 대체 수단이 결정된 경우입니다. 다만, 대체 수단이 아직 구현되지 않았을 수 있습니다.

이 API의 동작 방식은 변경되지 않지만, 대체 수단이 준비되는 대로 지원 종료 주기(deprecation cycle)를 거치게 됩니다.

### 내부 API {id="internal-api"}
내부 API는 [@InternalCoroutinesApi][InternalCoroutinesApi]로 표시되거나 `kotlinx.coroutines.internal` 패키지의 일부입니다.
이 API는 안정성을 보장하지 않으며, 향후 릴리스에서 변경되거나 제거될 수 있습니다. 
내부 API 사용을 피할 수 없는 경우, [이슈 트래커(issue tracker)](https://github.com/Kotlin/kotlinx.coroutines/issues/new)에 보고해 주시기 바랍니다.

### 안정적 API {id="stable-api"}
안정적 API는 ABI와 문서화된 동작 방식을 유지하는 것을 보장합니다. 만약 수정 불가능한 설계 결함이 나중에 발견될 경우, 이 API는 지원 종료 주기를 거치게 되며 가능한 한 오랫동안 바이너리 호환성을 유지합니다.

### 지원 종료 주기 {id="deprecation-cycle"}
특정 API가 지원 종료(deprecated)될 때는 여러 단계를 거치며, 각 단계 사이에는 최소 한 번의 주요 릴리스가 포함됩니다.
* 기능이 컴파일 경고(warning)와 함께 지원 종료됩니다. 대부분의 경우, IntelliJ IDEA의 도움을 받아 지원 종료된 사용처를 자동으로 마이그레이션할 수 있도록 적절한 대체 수단(및 해당하는 `replaceWith` 선언)이 제공됩니다.
* 지원 종료 수준이 `error` 또는 `hidden`으로 격상됩니다. 더 이상 지원 종료된 API를 대상으로 새 코드를 컴파일할 수 없게 되지만, ABI 상에는 여전히 존재합니다.
* API가 완전히 제거됩니다. 저희는 가급적 API를 제거하지 않으려고 최선을 다하고 있으며 현재 제거 계획도 없으나, 보안 취약점과 같은 예기치 못한 문제에 대비하여 이 옵션을 남겨두고 있습니다.

## 어노테이션이 지정된 API 사용하기 {id="using-annotated-api"}
모든 API 어노테이션은 [kotlin.Experimental](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-experimental/)입니다.
이는 실험적 또는 Obsolete API 사용에 대해 컴파일 경고를 발생시키기 위함입니다.
경고는 특정 호출 지점에 대해 프로그래밍 방식으로 비활성화하거나 모듈 전체에 대해 전역적으로 비활성화할 수 있습니다.

### 프로그래밍 방식 {id="programmatically"}
특정 호출 지점에서 [OptIn](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) 어노테이션을 사용하여 경고를 비활성화할 수 있습니다.
```kotlin
@OptIn(ExperimentalCoroutinesApi::class) // 실험적 코루틴 API에 대한 경고 비활성화
fun experimentalApiUsage() {
    someKotlinxCoroutinesExperimentalMethod()
}
``` 

### Gradle {id="gradle"}
Gradle 프로젝트의 경우, `build.gradle` 파일에 컴파일러 플래그를 전달하여 경고를 비활성화할 수 있습니다.

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.AbstractKotlinCompile).all {
    kotlinOptions.freeCompilerArgs += ["-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi"]
}

```

### Maven {id="maven"}
Maven 프로젝트의 경우, `pom.xml` 파일에 컴파일러 플래그를 전달하여 경고를 비활성화할 수 있습니다.
```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    ... your configuration ...
    <configuration>
        <args>
            <arg>-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi</arg>
        </args>
    </configuration>
</plugin>
```

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html

<!--- INDEX kotlinx.coroutines -->

[ExperimentalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-experimental-coroutines-api/index.html
[FlowPreview]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-flow-preview/index.html
[ObsoleteCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-obsolete-coroutines-api/index.html
[InternalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-internal-coroutines-api/index.html

<!--- END -->