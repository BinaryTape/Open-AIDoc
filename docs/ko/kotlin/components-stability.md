[//]: # (title: Kotlin 컴포넌트의 안정성)

Kotlin 언어와 툴셋은 JVM, JS, Native 타깃용 컴파일러, 표준 라이브러리(Standard Library), 다양한 부속 도구 등 수많은 컴포넌트로 나뉘어 있습니다.
이러한 컴포넌트 중 다수는 공식적으로 **Stable**(안정화) 단계로 릴리스되었으며, 이는 [‘편안한 업데이트(Comfortable Updates)’ 및 ‘언어의 현대성 유지(Keeping the Language Modern)’ 원칙](kotlin-evolution-principles.md)에 따라 하위 호환성을 유지하는 방식으로 발전해 왔음을 의미합니다.

커뮤니티가 미리 사용해 볼 수 있도록 많은 기능을 조기에 공개하는 ‘피드백 루프(Feedback Loop)’ 원칙에 따라, 아직 **Stable**로 릴리스되지 않은 컴포넌트도 다수 존재합니다.
이들 중 일부는 매우 초기 단계에 있고, 일부는 비교적 성숙한 단계에 도달해 있습니다.
각 컴포넌트가 얼마나 빠르게 발전하고 있는지, 사용자가 이를 도입할 때 감수해야 하는 위험 수준이 어느 정도인지에 따라 **Experimental**, **Alpha**, **Beta**로 구분하여 표시합니다.

## 안정성 단계 설명 {id="stability-levels-explained"}

각 안정성 단계와 그 의미에 대한 간략한 안내입니다.

**Experimental**은 "토이 프로젝트에서만 사용해 보세요"를 의미합니다.
* 아이디어와 실현 가능성을 테스트하는 단계입니다. 일부 사용자가 사용해 보고 피드백을 공유해 주기를 원합니다.
  적용 범위가 최소한이며, 기능이 언제든지 변경되거나 사라질 수 있습니다. 안정성이나 호환성을 보장하지 않습니다.

**Alpha**는 "이 기능이 프로덕션 환경에 적합한 수준으로 발전할 수 있는지 테스트하는 중입니다"를 의미합니다.
* 제품화할 의도를 가지고 있으며, 최종 형태를 다듬기 위해 사용자 가치와 시장 적합성을 검증하는 단계입니다.
  기능 구성이 아직 불완전하며, 호환성이 깨지는 변경(breaking changes)이 발생할 수 있습니다. 가설이 성립하지 않으면
  기능이 크게 변경되거나 중단될 수 있습니다.

**Beta**는 "사용하셔도 좋습니다. 마이그레이션 문제를 최소화하기 위해 최선을 다하겠습니다"를 의미합니다.
* 거의 완성된 상태이며, 현재 사용자 피드백이 특히 중요한 시기입니다.
* 여전히 100% 완성된 것은 아니므로 변경 사항(사용자 피드백에 기반한 변경 포함)이 발생할 수 있습니다.
* 최상의 업데이트 경험을 위해 사전에 지원 중단(deprecation) 경고를 확인하세요.

_Experimental_, _Alpha_, _Beta_ 단계를 통틀어 **pre-stable**(안정화 이전) 단계라고 부릅니다.

<a name="stable"/>

**Stable**은 "가장 보수적인 시나리오에서도 사용할 수 있습니다"를 의미합니다.
* 완성이 완료되었습니다. 엄격한 [하위 호환성 규칙](https://kotlinfoundation.org/language-committee-guidelines/)에 따라 지속적으로 발전시켜 나갈 것입니다.

안정성 단계는 해당 컴포넌트가 언제 Stable로 릴리스될 것인지를 나타내지 않습니다. 마찬가지로 릴리스 전에 컴포넌트가 얼마나 변경될지를 의미하지도 않습니다. 오직 컴포넌트가 얼마나 빠르게 변경되고 있으며, 사용자가 업데이트 시 겪을 수 있는 위험 수준이 어느 정도인지만을 나타냅니다.

## Kotlin 컴포넌트용 GitHub 배지 {id="github-badges-for-kotlin-components"}

[Kotlin GitHub 조직](https://github.com/Kotlin)에서는 다양한 Kotlin 관련 프로젝트를 호스팅합니다.
일부는 전담하여 개발하지만, 사이드 프로젝트로 진행되는 것들도 있습니다.

각 Kotlin 프로젝트에는 안정성과 지원 상태를 설명하는 두 가지 GitHub 배지가 있습니다.

* **Stability**(안정성) 상태: 각 프로젝트가 얼마나 빠르게 발전하고 있는지, 도입 시 사용자가 감수해야 하는 위험이 어느 정도인지를 보여줍니다.
  안정성 상태는 [Kotlin 언어 기능 및 컴포넌트의 안정성 단계](#stability-levels-explained)와 완전히 일치합니다.
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 배지는 **Experimental**을 의미합니다.
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 배지는 **Alpha**를 의미합니다.
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 배지는 **Beta**를 의미합니다.
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 배지는 **Stable**을 의미합니다.

* **Support**(지원) 상태: 프로젝트를 유지 관리하고 사용자의 문제 해결을 지원하겠다는 당사의 약속을 나타냅니다.
  지원 수준은 모든 JetBrains 제품에 통합 적용됩니다.  
  [자세한 내용은 JetBrains Open Source 문서를 참조하세요](https://github.com/JetBrains#jetbrains-on-github).

## 하위 컴포넌트의 안정성 {id="stability-of-subcomponents"}

안정화(Stable)된 컴포넌트라도 실험적(Experimental) 하위 컴포넌트를 가질 수 있습니다. 예를 들면 다음과 같습니다.
* 안정화된 컴파일러에 실험적 기능이 포함될 수 있습니다.
* 안정화된 API에 실험적 클래스나 함수가 포함될 수 있습니다.
* 안정화된 명령줄 도구에 실험적 옵션이 포함될 수 있습니다.

저희는 어떤 하위 컴포넌트가 **Stable**이 아닌지 정확하게 문서화하고 있습니다.
또한 안정화 버전으로 릴리스되지 않은 기능을 실수로 사용하는 것을 방지하기 위해 가능한 한 사용자에게 경고를 표시하고 명시적으로 옵트인(opt-in)하도록 요청하고 있습니다.

## Kotlin 컴포넌트의 현재 안정성 {id="current-stability-of-kotlin-components"}

> 기본적으로 모든 신규 컴포넌트는 Experimental 상태입니다.
>
{style="note"}

### Kotlin 컴파일러 {id="kotlin-compiler"}

| **컴포넌트**                                                        | **상태**   | **해당 상태 적용 버전** | **설명**     |
|---------------------------------------------------------------------|------------|--------------------------|--------------|
| Kotlin/JVM                                                          | Stable     | 1.0.0                    |              |
| Kotlin/Native                                                       | Stable     | 1.9.0                    |              |
| Kotlin/JS                                                           | Stable     | 1.3.0                    |              |
| Kotlin/Wasm                                                         | Beta       | 2.2.20                   |              |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |                          |              |

### 코어 컴파일러 플러그인 {id="core-compiler-plugins"}

| **컴포넌트**                                     | **상태**     | **해당 상태 적용 버전** | **설명**     |
|--------------------------------------------------|--------------|--------------------------|--------------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0                    |              |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0                    |              |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0                    |              |
| [kapt](kapt.md)                                  | Stable       | 1.3.0                    |              |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20                   |              |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0                    |              |

### Kotlin 라이브러리 {id="kotlin-libraries"}

| **컴포넌트**                  | **상태**   | **해당 상태 적용 버전** | **설명**     |
|-------------------------------|------------|--------------------------|--------------|
| kotlin-stdlib (JVM)           | Stable     | 1.0.0                    |              |
| kotlinx-coroutines            | Stable     | 1.3.0                    |              |
| kotlinx-serialization         | Stable     | 1.0.0                    |              |
| kotlin-metadata-jvm           | Stable     | 2.0.0                    |              |
| kotlin-reflect (JVM)          | Beta       | 1.0.0                    |              |
| kotlinx-datetime              | Alpha      | 0.2.0                    |              |
| kotlinx-io                    | Alpha      | 0.2.0                    |              |
| kotlinx-collections-immutable | Alpha      | 0.3.5                    |              |

### Kotlin Multiplatform {id="kotlin-multiplatform"}

| **컴포넌트**                    | **상태**   | **해당 상태 적용 버전** | **설명**                                                                                                                             |
|---------------------------------|------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform            | Stable     | 1.9.20                   |                                                                                                                                      |
| Kotlin Multiplatform IDE 플러그인 | Stable     | 0.9                      | [언어와 별도로 버전이 관리됨](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-plugin-releases.html)            |

### Kotlin/Native {id="kotlin-native"}

| **컴포넌트**                                 | **상태**   | **해당 상태 적용 버전** | **설명**                                                                                                                      |
|----------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native Runtime                        | Stable     | 1.9.20                   |                                                                                                                               |
| Kotlin/Native C 및 Objective-C 상호 운용성   | Beta       | 1.3.0                    | [C 및 Objective-C 라이브러리 임포트 안정성](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)     |
| klib 바이너리                                | Stable     | 1.9.20                   | cinterop klib은 제외, 아래 참조                                                                                              |
| cinterop klib 바이너리                       | Beta       | 1.3.0                    | [C 및 Objective-C 라이브러리 임포트 안정성](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)     |
| CocoaPods 연동                               | Stable     | 1.9.20                   |                                                                                                                               |

다양한 타깃에 대한 지원 수준에 대한 자세한 내용은 [](native-target-support.md)를 참조하세요.

### 빌드 도구 {id="build-tools"}

| **컴포넌트**                                        | **상태**   | **해당 상태 적용 버전** | **설명**                                                                                                                                                          |
|-----------------------------------------------------|------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle 플러그인](gradle-configure-project.md) | Stable     | 1.1.1                    | [Kotlin Multiplatform Gradle 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)은 Kotlin 1.9.20부터 Stable입니다. |
| [Kotlin Maven 플러그인](maven-configure-project.md)   | Stable     | 1.0.0                    |                                                                                                                                                                   |

### Build tools API (BTA) {id="build-tools-api-bta"}

| **컴포넌트**  | **상태**   | **해당 상태 적용 버전** | **설명**     |
|---------------|------------|--------------------------|--------------|
| JVM용 BTA     | Beta       | 2.4.20                   |              |
| JS용 BTA      | Alpha      | 2.4.20                   |              |
| Wasm용 BTA    | Alpha      | 2.4.20                   |              |

> Build tools API는 현재 Kotlin/Native를 지원하지 않습니다.
> 
{style="note"}

### 언어 도구 {id="language-tools"}

| **컴포넌트**                          | **상태**     | **해당 상태 적용 버전** | **설명**                                       |
|---------------------------------------|--------------|--------------------------|------------------------------------------------|
| 스크립팅 구문 및 시맨틱               | Alpha        | 1.2.0                    |                                                |
| 스크립팅 임베딩 및 확장 API           | Beta         | 1.5.0                    |                                                |
| 스크립팅 IDE 지원                     | Beta         |                          | IntelliJ IDEA 2023.1 이상부터 지원             |
| CLI 스크립팅                          | Alpha        | 1.2.0                    |                                                |

## 언어 기능 및 설계 제안서 {id="language-features-and-design-proposals"}

언어 기능 및 새로운 설계 제안서에 대한 내용은 [](kotlin-language-features-and-proposals.md)를 참조하세요.