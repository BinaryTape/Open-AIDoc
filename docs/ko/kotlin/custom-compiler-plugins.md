[//]: # (title: 커스텀 컴파일러 플러그인)

> Kotlin 컴파일러 플러그인 API는 불안정(unstable)하며, 매 릴리스마다 호환성을 깨뜨리는 변경 사항(breaking changes)이 도입됩니다.
> 
{style="warning"}

컴파일러 플러그인은 컴파일러 자체를 수정하지 않고도 컴파일 프로세스에 연동하여 코드가 컴파일되는 동안 코드를 분석하거나 변경합니다. 예를 들어, 코드에 어노테이션을 추가하거나 새로운 코드를 생성하여 다른 프레임워크나 API와 호환되도록 만들 수 있습니다.

커스텀 컴파일러 플러그인을 직접 만들기 전에 먼저 [사용 가능한 컴파일러 플러그인 목록](compiler-plugins-overview.md)을 확인하여 사용 목적에 맞는 플러그인이 이미 있는지 살펴보세요.

또한 [Kotlin Symbol Processing (KSP) API](https://kotlinlang.org/docs/ksp-overview.html)나 [Android lint](https://developer.android.com/studio/write/lint) 같은 외부 린터를 사용하여 원하는 목표를 달성할 수 있는지도 확인할 수 있습니다.

_그래도_ 필요한 기능을 찾을 수 없다면 커스텀 컴파일러 플러그인을 만들 수 있습니다. 단, Kotlin 컴파일러 플러그인 API는 **불안정(unstable)**하다는 점에 유의하세요. 컴파일러의 새 릴리스마다 호환성을 깨뜨리는 변경 사항이 발생하므로 이를 유지 관리하려면 상당한 지속적인 노력이 필요합니다.

### Kotlin 컴파일러와 컴파일러 플러그인 {id="the-kotlin-compiler-and-compiler-plugins"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements-->
<list columns="2">
    <li>
        <p></p>
        <br/>
        <img src="compiler-stages.svg" width="400" alt="Kotlin compiler stages"/>
    </li>
    <li>
        <p>Kotlin 컴파일러의 동작 과정:</p>
        <ol>
            <li>소스 코드를 파싱하여 구조화된 구문 트리(syntax tree)로 변환합니다.</li>
            <li>코드의 의미를 파악하고, 이름을 확인(resolve)하며, 타입을 검사하고, 가시성 규칙을 적용하여 코드를 분석 및 리졸브합니다.</li>
            <li>소스 코드와 머신 코드 사이의 가교 역할을 하는 데이터 구조인 중간 표현(IR, Intermediate Representation)을 생성합니다.</li>
            <li>IR을 점진적으로 더 단순한 형태로 로어링(lowering)합니다.</li>
            <li>로어링된 IR을 JVM 바이트코드, JavaScript, 네이티브 머신 코드 등 타깃에 맞는 출력물로 변환합니다.</li>
        </ol>
    </li>
</list>

플러그인은 프론트엔드 API를 통해 컴파일러의 초기 단계에 영향을 주어 컴파일러가 코드를 리졸브하는 방식을 변경할 수 있습니다.
예를 들어, 플러그인은 어노테이션을 추가하거나 본문이 없는 새 메서드를 도입하거나, 가시성 수식어를 변경할 수 있습니다. 이러한
변경 사항은 IDE에서도 확인할 수 있습니다.

플러그인은 또한 백엔드 API를 통해 이후 단계에 영향을 주어 선언부(declaration)의 동작을 수정할 수 있습니다. 이러한
변경 사항은 컴파일이 완료된 후 생성된 바이너리에 나타납니다.

실제로는 컴파일러 플러그인이 분석 및 리졸브 단계부터 코드 생성 단계까지 프론트엔드와 백엔드 모두에 영향을 미칩니다. 예를 들어, 프론트엔드 파트에서 선언을 생성하고 백엔드 파트에서 해당 선언에 본문을 추가하는 식입니다.

![Kotlin compiler stages with plugins](compiler-stages-with-plugins.svg){width=650}

[Kotlin 직렬화 플러그인(Kotlin serialization plugin)](https://github.com/Kotlin/kotlinx.serialization)이 좋은 예입니다. 이 플러그인의
프론트엔드 파트는 컴패니언 객체(companion object)와 serializer 함수를 추가하고, 이름 충돌을 방지하기 위한 검사를 수행합니다. 백엔드
파트는 `KSerializer` 객체를 통해 원하는 직렬화 동작을 구현합니다.

### Kotlin 컴파일러 플러그인 템플릿 {id="kotlin-compiler-plugin-template"}

커스텀 컴파일러 플러그인 작성을 시작하려면 [Kotlin 컴파일러 플러그인 템플릿](https://github.com/Kotlin/compiler-plugin-template)을 사용할 수 있습니다.
이후 프론트엔드 및 백엔드 플러그인 API의 확장 지점(extension points)을 등록합니다.

> 현재 커스텀 컴파일러 플러그인은 [Gradle](gradle.md)을 통해서만 개발할 수 있습니다.
> 
{style="note"}

### 프론트엔드 플러그인 API {id="frontend-plugin-api"}

프론트엔드 플러그인 API(FIR, frontend intermediate representation으로도 알려짐)에는 리졸브를 커스터마이즈할 수 있는 다음과 같은 전용 확장 지점이 있습니다.

| 확장 이름 | 설명 |
|---|---|
| [`FirAdditionalCheckersExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/checkers/src/org/jetbrains/kotlin/fir/analysis/extensions/FirAdditionalCheckersExtension.kt) | 커스텀 컴파일러 검사기(checker)를 추가합니다. |
| [`FirDeclarationGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/providers/src/org/jetbrains/kotlin/fir/extensions/FirDeclarationGenerationExtension.kt) | 새로운 선언을 생성합니다. |
| [`FirExtensionSessionComponent`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirExtensionSessionComponent.kt) | 플러그인의 다른 파트에서 사용할 커스텀 컴포넌트를 `FirSession`에 등록합니다. |
| [`FirFunctionTypeKindExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirFunctionTypeKindExtension.kt) | 함수형 타입의 새로운 패밀리를 정의합니다. |
| [`FirMetadataSerializerPlugin`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/fir-serialization/src/org/jetbrains/kotlin/fir/serialization/FirMetadataSerializerPlugin.kt) | 선언 메타데이터의 정보를 읽고 씁니다. |
| [`FirStatusTransformerExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirStatusTransformerExtension.kt) | 가시성(visibility) 또는 모달리티(modality)와 같은 선언 상태 속성을 수정합니다. |
| [`FirSupertypeGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/resolve/src/org/jetbrains/kotlin/fir/extensions/FirSupertypeGenerationExtension.kt) | 기존 클래스에 새로운 상위 타입을 추가합니다. |
| [`FirTypeAttributeExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/fir/tree/src/org/jetbrains/kotlin/fir/extensions/FirTypeAttributeExtension.kt) | 타입 어노테이션을 기반으로 특정 타입에 특수 속성을 추가합니다. |

#### IDE 연동 {id="ide-integration"}

리졸브의 변경 사항은 코드 하이라이팅 및 자동 완성과 같은 IDE 동작에 영향을 미치므로 플러그인이 IDE와 호환되는 것이 중요합니다. IntelliJ IDEA 및 Android Studio의 각 버전에는 개발 버전의 Kotlin 컴파일러가 포함되어 있습니다. 이 버전은 IDE 전용이며 공식 릴리스된 Kotlin 컴파일러와 바이너리 호환되지 않습니다.
따라서 IDE를 업데이트할 때 플러그인이 계속 작동하도록 컴파일러 플러그인도 함께 업데이트해야 합니다. 이러한 이유로 커뮤니티 플러그인은 기본적으로 로드되지 않습니다.

커스텀 컴파일러 플러그인이 다양한 IDE 버전에서 제대로 작동하는지 확인하려면 각 IDE 버전별로 테스트하고 발견된 문제를 수정하세요.

Kotlin 컴파일러 플러그인용 devkit이 제공된다면 여러 IDE 버전을 지원하는 작업이 더 수월해질 것입니다. 이 기능에 관심이 있다면 [이슈 트래커](https://youtrack.jetbrains.com/issue/KT-82617)에서 의견을 공유해 주세요.

### 백엔드 플러그인 API {id="backend-plugin-api"}

> 백엔드 플러그인 개발은 IDE나 디버거의 성능을 저하시키지 않고 올바르게 구현하기가 까다로우므로 신중하고 보수적으로 변경 작업을 진행해야 합니다.
> 
{style="warning"}

IR로도 알려진 백엔드 플러그인 API에는 [`IrGenerationExtension`](https://github.com/JetBrains/kotlin/blob/master/compiler/ir/backend.common/src/org/jetbrains/kotlin/backend/common/extensions/IrGenerationExtension.kt)이라는 단일 확장 지점이 있습니다.
이 확장 지점을 사용하고 `generate()` 함수를 오버라이드하여 프론트엔드에서 이미 생성된 선언에 본문을 추가하거나 기존 선언의 본문을 변경할 수 있습니다.

이 확장 지점을 통해 적용된 변경 사항은 컴파일러에 의해 **검사되지 않습니다**. 따라서 이 단계에서 컴파일러가 기대하는 바를 깨뜨리지 않도록 직접 보장해야 합니다. 예를 들어, 유효하지 않은 타입을 도입하거나, 잘못된 함수 참조를 추가하거나, 올바른 스코프를 벗어난 참조를 실수로 만들 수 있습니다.

#### 백엔드 플러그인 코드 살펴보기 {id="explore-backend-plugin-code"}

Kotlin 직렬화 플러그인 코드를 살펴보면 백엔드 플러그인 컴파일러 코드가 실제로 어떻게 구성되어 있는지 확인할 수 있습니다.
예를 들어, [`SerializableCompanionIrGenerator.kt`](https://github.com/JetBrains/kotlin/blob/master/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt)는
주요 serializer 멤버의 누락된 본문을 채워 넣습니다. 한 예로 [`generateChildSerializersGetter()`](https://github.com/JetBrains/kotlin/blob/9cfa558902abc13d245c825717026af63ef82dd2/plugins/kotlinx-serialization/kotlinx-serialization.backend/src/org/jetbrains/kotlinx/serialization/compiler/backend/ir/SerializerIrGenerator.kt#L242)
함수는 `KSerializer` 표현식 목록을 수집하여 배열로 반환합니다.

#### 백엔드 플러그인 코드의 문제 확인하기 {id="check-your-backend-plugin-code-for-problems"}

백엔드 플러그인 코드의 문제는 다음 세 가지 방법으로 확인할 수 있습니다.

1. **IR 검증**

    IR 트리를 빌드하고 `Xverify-ir` 컴파일러 옵션을 활성화합니다. 이 옵션은 컴파일 속도에 영향을 미치므로 테스트 중에만 사용하는 것이 좋습니다.

2. **IR 출력 덤프 및 비교**

    `-Xphases-to-dump-before=ExternalPackageParentPatcherLowering` 컴파일러 옵션을 사용하여 IR 로어링 컴파일 단계 이후의 덤프 파일을 생성합니다. JVM 백엔드의 경우 `-Xdump-directory=<your-file-directory>` 컴파일러 옵션으로 덤프 디렉터리를 구성합니다. 기대하는 코드를 직접 수동으로 작성하고 다른 덤프 파일을 생성한 뒤, 두 파일을 비교하여 차이점이 있는지 확인합니다.

3. **컴파일러 코드 디버깅**

    `convertToIr.kt` 파일의 `convertToIrAndActualize()` 함수에 중단점(breakpoint)을 추가하고 디버그 모드로 컴파일러를 실행하여 컴파일 과정에서 더 자세한 정보를 얻습니다.

### 플러그인 테스트 {id="test-your-plugin"}

플러그인을 구현한 후에는 철저히 테스트해야 합니다. [Kotlin 컴파일러 플러그인 템플릿](https://github.com/Kotlin/compiler-plugin-template)은
이미 [Kotlin 컴파일러 테스트 프레임워크](https://github.com/JetBrains/kotlin/blob/master/compiler/test-infrastructure/ReadMe.md)를 사용하도록 구성되어 있습니다.
다음 디렉터리에 테스트를 추가할 수 있습니다.

* `compiler-plugin/testData`
* 코드 생성 테스트용: `compiler-plugin/testData/box`
* 진단(diagnostics) 테스트용: `compiler-plugin/testData/diagnostics`

테스트가 실행되면 프레임워크는 다음 작업을 수행합니다.

1. 테스트 소스 파일을 파싱합니다. (예: [`anotherBoxTest.kt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.kt))
2. 각 파일에 대한 FIR 및 IR을 빌드합니다.
3. 이를 텍스트 덤프 파일로 작성합니다. (예: [`anotherBoxTest.fir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.txt) 및 [`anotherBoxTest.fir.ir.txt`](https://github.com/Kotlin/compiler-plugin-template/blob/master/compiler-plugin/testData/box/anotherBoxTest.fir.ir.txt))
4. 이 파일들을 이전에 생성된 파일(존재하는 경우)과 비교합니다.

이 파일들을 사용하여 생성된 diff에 의도치 않은 변경 사항이 있는지 확인할 수 있습니다. 문제가 없다면
새 덤프 파일이 최신 _골든(golden)_ 파일이 됩니다. 이는 향후 변경 사항을 비교할 수 있는 승인되고 신뢰할 수 있는 소스 역할을 합니다.

### 도움 받기 {id="get-help"}

커스텀 컴파일러 플러그인을 개발하다가 문제가 발생하면 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)의
[#compiler](https://slack-chats.kotlinlang.org/c/compiler) 채널에 문의해 주세요. 완벽한 해결책을 보장할 수는 없지만 가능한 한 최선을 다해 도와드리겠습니다.