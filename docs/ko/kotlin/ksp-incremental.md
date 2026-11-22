[//]: # (title: 증분 처리)

<web-summary>KSP의 증분 처리가 어떻게 동작하고 빌드 시간을 어떻게 단축하는지 알아보세요.</web-summary>

KSP는 증분 처리(incremental processing)를 지원합니다. 하나 이상의 의존성이 변경될 때만 파일을 다시 처리합니다. 이를 통해 불필요한 재처리를 방지하여 컴파일 시간을 단축합니다.

증분 처리는 기본적으로 활성화되어 있습니다. 문제를 해결하거나 전체 재빌드를 강제해야 할 때 비활성화할 수 있습니다. 증분 처리를 비활성화하려면 `gradle.properties` 파일에 다음 줄을 추가하세요.

```properties
ksp.incremental=false
```

## 더티 파일 {id="dirty-files"}

_더티(dirty)_ 파일은 KSP가 다시 처리해야 하는 파일입니다. 개발자가 파일을 직접 수정하거나 다른 더티 파일의 변경 사항이 간접적으로 영향을 미치는 경우 파일이 더티 상태가 됩니다.

어떤 소스가 더티인지 확인하기 위해, KSP는 생성된 출력과 해당 입력 소스를 연결해 주는 프로세서에 의존합니다. KSP는 이러한 연결 정보를 사용하여 변경 사항이 발생했을 때 다시 처리해야 하는 소스를 식별합니다.

KSP는 프로세서가 최소한의 _루트 소스(root sources)_ 집합만 선언하도록 요구합니다. 프로세서는 이를 코드 구조를 탐색하기 위한 진입점(entry point)으로 사용합니다.

루트 소스는 다음 메서드 중 하나로부터 직접 심볼을 가져오는 소스 파일입니다.

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

프로세서는 루트 소스의 정보를 분석(resolving)하여 다른 소스 파일로부터 추가 심볼을 얻을 수 있습니다. KSP는 이러한 의존성을 자동으로 추적합니다.

출력 파일을 생성할 때 프로세서는 해당 출력 생성에 기여하는 루트 소스를 선언해야 합니다. KSP는 이러한 루트 소스와 추적된 의존성을 사용하여 출력을 재생성해야 하는 시점을 결정합니다.

> 출력 파일을 생성하고 입력을 출력과 연결하려면 `CodeGenerator` 인터페이스를 사용하세요. 자세한 내용은 [KSP 소스 코드의 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)를 참고하세요.
>
{style="tip"}

### 집계 및 격리 출력 {id="aggregating-and-isolating-outputs"}

KSP는 생성된 출력을 집계(aggregating)와 격리(isolating)의 두 가지 유형으로 분류합니다.

> Gradle 어노테이션 처리와 달리, KSP는 프로세서 전체가 아닌 개별 출력에 이러한 분류를 적용합니다.
>
{style="note"}

<deflist collapsible="true">
<def title="Aggregating(집계)">

집계 출력은 모든 소스 파일의 변경 사항에 영향을 받을 수 있습니다.
예를 들어, 특정 어노테이션이 지정된 모든 심볼을 수집하는 출력이 이에 해당합니다.

파일 삭제를 포함하여 입력에 변경이 발생하면 모든 집계 출력의 재빌드가 트리거되고, 등록되었거나 새로 추가되었거나 수정된 모든 해당 소스 파일이 다시 처리됩니다.

</def>
<def title="Isolating(격리)">

격리 출력은 지정된 소스에만 의존합니다. 예를 들어, 특정 인터페이스를 구현하기 위해 생성된 클래스는 격리 출력입니다.

명시적으로 지정된 소스 이외의 소스가 변경되어도 해당 출력에는 영향을 주지 않습니다. 단일 출력에 여러 소스 파일이 연결될 수 있습니다.

</def>
</deflist>

### 더티 상태 전파 {id="dirtiness-propagation"}

파일이 더티 상태가 되면 KSP는 다음과 같은 방식으로 더티 상태를 전파합니다.

* **해석 추적(Resolution tracing)**: 프로세서가 타입 참조를 해석할 때, KSP는 해당 참조를 포함하는 파일과 결과에 영향을 줄 수 있는 모든 파일 간의 의존성을 기록합니다. 이 파일 중 어느 하나라도 변경되면 해당 참조를 포함하는 파일도 더티 상태가 됩니다. 이는 명시적 타입 해석과 암시적 타입 해석 모두에 적용됩니다.

  프로세서는 타입을 해석하는 방식으로만 파일 간을 이동할 수 있으므로, KSP가 추적해야 하는 파일 간 의존성은 이것이 유일합니다.

* **공유 출력(Shared outputs)**: 더티 파일이 특정 생성 출력에 기여하는 경우, 동일한 출력에 기여하는 다른 모든 파일도 더티 상태가 됩니다. 이를 통해 공유된 출력을 기반으로 관련 파일들을 동치 클래스(equivalence classes)로 그룹화합니다.

KSP는 새로운 더티 파일이 나타나지 않을 때까지 이 두 규칙을 반복적으로 적용합니다. 예를 들어, 해석 추적을 통해 더티 상태가 된 파일은 공유 출력을 통해 다른 파일을 더티 상태로 만들 수 있습니다. 그러면 그 파일들이 다시 해석 추적을 통해 더 많은 파일을 더티 상태로 만들 수 있습니다.

## 구현 세부 사항 {id="implementation"}

의존성은 입력 파일과 출력 파일 간의 다대다 관계에 따라 결정됩니다.

KSP는 다음 규칙을 사용하여 다시 처리할 파일을 결정합니다.

* 입력 파일이 변경되면 프로세서에 새로운 정보가 도입될 수 있으므로 항상 다시 처리됩니다.
* 변경된 입력 파일이 어떤 출력과 연결되어 있는 경우, KSP는 동일한 출력에 연결된 다른 모든 입력 파일도 다시 처리합니다. 프로세서가 출력을 재생성하기 위해 모든 입력이 필요할 수 있기 때문입니다. KSP는 새로운 더티 파일이 나타나지 않을 때까지 이 과정을 반복합니다.
* 이전 규칙 중 어느 것에도 해당하지 않는 한, KSP는 어떠한 집계 출력과도 연결되지 않은 변경되지 않은 입력 파일은 다시 처리하지 않습니다. 이러한 파일은 어떠한 출력에도 영향을 줄 수 없기 때문입니다.

예를 들어, `sourceA`와 `sourceB`가 서로 독립적이고 `outputA`가 격리(isolating) 출력인 다음과 같은 구조의 프로젝트를 고려해 보세요.

```text
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
    ├── outputA
    └── outputB
```

프로세서의 동작:

* `sourceA`를 읽고 `outputA`를 생성합니다.
* `sourceB`를 읽고 `outputB`를 생성합니다.

`sourceA`가 변경되는 경우:
* `outputB`가 집계(aggregating) 출력이라면, KSP는 `sourceA`와 `sourceB`를 모두 다시 처리합니다.
* `outputB`가 격리(isolating) 출력이라면, KSP는 `sourceA`만 다시 처리합니다.

`sourceC`가 추가되는 경우:
* `outputB`가 집계 출력이라면, KSP는 `sourceC`와 `sourceB`를 다시 처리합니다.
* `outputB`가 격리 출력이라면, KSP는 `sourceC`만 다시 처리합니다.

`sourceA`가 삭제되는 경우:
* `outputB`가 집계 출력이라면, KSP는 `sourceB`를 다시 처리합니다.
* `outputB`가 격리 출력이라면, KSP는 어떤 파일도 다시 처리할 필요가 없습니다.

`sourceB`가 삭제되는 경우, `sourceB`가 `outputB`의 유일한 소스였으므로 두 경우 모두 KSP가 어떤 파일도 다시 처리할 필요가 없습니다.

## 프로세서 예제 {id="example-processor"}

다음 프로젝트에는 `A`가 `B`를 상속하는 클래스 `A`와 `B`가 포함되어 있습니다.

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor(private val codeGenerator: CodeGenerator) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        val declA = resolver.getSymbolsWithAnnotation("Interesting")
            .firstOrNull() as? KSClassDeclaration
            // 이후 라운드에서 어노테이션이 달린 새 심볼이 없으면 조기 반환
            ?: return emptyList()
        val declB = declA.superTypes.first().resolve().declaration
        // B.kt는 KSP에 의해 의존성으로 유추될 수 있으므로 지정할 필요가 없음
        val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
        // outputForA.kt
        val outputName = "outputFor${declA.simpleName.asString()}"
        // outputForA는 A.kt와 B.kt에 의존함
        val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
        output.write("// $declA : $declB\n".toByteArray())
        output.close()
        return emptyList()
    }
    // ...
}
```

`outputForA`를 생성하기 위해 프로세서는 다음을 수행합니다.

1. `Resolver.getSymbolsWithAnnotation()`을 호출하여 `A`를 가져옵니다.
2. `A`의 `superTypes`에서 상위 타입 참조를 해석하여 `B`를 가져옵니다.

KSP는 해석 추적을 통해 이 관계를 추적하고 `B`를 `A`의 의존성으로 자동 기록합니다. 따라서 `B.kt`를 `outputForA`의 의존성으로 명시적으로 선언할 필요가 없습니다.

## 버그 신고 {id="reporting-bugs"}

증분 처리가 활성화되어 있을 때만 발생하는 오류가 있다면, [KSP GitHub 저장소](https://github.com/google/ksp/issues)에 이슈를 생성하고 관련 로그 파일을 첨부해 주세요.

로그 파일을 수집하여 이슈에 첨부하는 방법은 다음과 같습니다.

1. `gradle.properties` 파일에 다음 줄을 추가하여 증분 처리 로그를 캡처합니다.

   ```properties
   ksp.incremental.log=true
   ```

2. 성공적으로 완료되는 클린 빌드를 수행합니다.
3. 생성된 로그 파일을 다른 위치로 복사하여 저장합니다.

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 문제를 일으키는 소스 파일을 수정한 후 빌드를 다시 실행합니다.
5. 성공한 빌드의 로그 파일과 문제가 재현된 빌드의 로그 파일을 모두 GitHub 이슈에 첨부합니다.

### 심볼 의존성 그래프 시각화 {id="visualizing-the-symbol-dependency-graph"}

증분 처리 디버깅을 돕기 위해 KSP는 지정된 심볼부터 시작하는 심볼 의존성 그래프를 시각화하는 Graphviz DOT 파일을 생성할 수 있습니다.

증분 로깅을 활성화하고 그래프 시각화의 시작점으로 사용할 심볼의 [정규화된 이름(fully qualified name)](packages.md#package-headers)을 지정하세요.

```properties
ksp.incremental.log=true
ksp.incremental.log.graph.origin=<fully-qualified-name>
```

명령줄에서 KSP를 사용하는 경우 다음 옵션을 추가하세요.

```bash
-incremental-log=true -incremental-log-graph-origin=<fully-qualified-name>
```

KSP는 다른 증분 처리 로그와 동일한 `logs` 디렉터리의 `kspLookupGraphOrigin.dot` 파일에 그래프를 작성합니다.

## 참고 항목 {id="see-also"}

* 프로세서가 [출력의 의존성을 선언하는 방법](ksp-quickstart.md#create-and-register-a-processor) 알아보기
* KSP가 [여러 라운드에서 프로세서를 실행하는 방법](ksp-multi-round.md) 알아보기
* [KSP가 Kotlin 코드를 모델링하는 방식](ksp-kotlin-model.md)과 타입을 해석해야 하는 시점 알아보기
* Gradle용 KSP 플러그인 없이 [명령줄에서 KSP를 실행하는 방법](ksp-command-line.md) 알아보기