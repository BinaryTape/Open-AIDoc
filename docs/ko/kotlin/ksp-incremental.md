[//]: # (title: 증분 처리)

KSP는 증분 처리(incremental processing)를 지원합니다. KSP는 하나 이상의 의존성이 변경된 경우에만 파일을 재처리합니다. 이를 통해 불필요한 재처리를 방지하고 컴파일 시간을 단축합니다.

증분 처리는 기본적으로 활성화되어 있습니다. 문제 해결 시 또는 강제로 전체 재빌드가 필요한 경우 이를 비활성화할 수 있습니다. 비활성화하려면 `gradle.properties` 파일에 다음 줄을 추가하세요:

```
ksp.incremental=false
```

## 수정된(dirty) 파일

개발자가 직접 수정했거나 다른 수정된 파일의 변경으로 인해 간접적으로 영향을 받은 파일은 _수정된(dirty)_ (재처리가 필요한) 파일로 간주됩니다.

어떤 소스가 수정되었는지 결정하기 위해 KSP는 프로세서에 의존하며, 프로세서는 생성된 출력물과 그에 대응하는 입력 소스를 연결합니다. KSP는 이러한 연결을 사용하여 변경이 발생할 때 재처리해야 하는 소스를 식별합니다.

KSP는 최소한의 루트 소스(root sources) 세트만 요구합니다. 프로세서는 이러한 소스를 코드 구조를 탐색하기 위한 시작점으로 사용합니다.

루트 소스는 다음 메서드 중 하나로부터 심볼을 직접 얻은 소스 파일입니다:

* `Resolver.getAllFiles()`
* `Resolver.getSymbolsWithAnnotation()`
* `Resolver.getClassDeclarationByName()`
* `Resolver.getDeclarationsFromPackage()`

프로세서는 루트 소스의 정보를 해석(resolving)하여 다른 소스 파일로부터 추가 심볼을 얻을 수 있습니다. KSP는 이러한 의존성을 자동으로 추적합니다.

출력을 생성할 때 프로세서는 해당 출력에 기여하는 루트 소스를 선언해야 합니다. KSP는 해당 루트 소스와 추적된 의존성을 사용하여 출력을 다시 생성해야 하는 시점을 결정합니다.

> 출력 파일을 생성하고 입력을 출력과 연결하려면 `CodeGenerator` 인터페이스를 사용하세요. 자세한 내용은 [소스 코드의 `CodeGenerator.kt`](https://github.com/google/ksp/blob/main/api/src/main/kotlin/com/google/devtools/ksp/processing/CodeGenerator.kt)를 참조하세요.
>
{style="tip"}

### 집계형(Aggregating) 및 격리형(Isolating) 출력

KSP는 생성된 출력을 집계형과 격리형의 두 가지 유형으로 분류합니다.

> Gradle 어노테이션 처리와 달리, KSP는 프로세서 전체가 아닌 개별 출력에 대해 이 분류를 적용합니다.
>
{style="note"}

<deflist collapsible="true">
<def title="집계형(Aggregating)">

집계형 출력은 다른 파일에 영향을 주지 않는 삭제를 제외하고, 모든 소스 파일의 변경에 의해 잠재적으로 영향을 받을 수 있습니다.

모든 입력 변경은 모든 집계형 출력의 재빌드와 대응하는 모든 등록된 소스, 새 소스 또는 수정된 소스 파일의 재처리를 유발합니다.

예를 들어, 특정 어노테이션이 있는 모든 심볼을 수집하는 출력은 집계형입니다.

</def>
<def title="격리형(Isolating)">

격리형 출력은 지정된 소스에만 의존합니다.

다른 소스의 변경은 해당 출력에 영향을 주지 않습니다. 하나의 출력에 여러 소스 파일을 연결할 수 있습니다.

예를 들어, 구현하는 인터페이스 전용으로 생성된 클래스는 격리형입니다.

</def>
</deflist>

### 수정 상태 전파(Dirtiness propagation)

KSP는 다음과 같은 방식으로 수정 상태를 전파합니다:

1. **해석 추적(resolution tracing)에 의한 전파**: 타입 해석(resolution)은 한 파일에서 다른 파일로 이동하는 유일한 방법입니다. 프로세서가 타입 참조를 (명시적 또는 암시적으로) 해석할 때, KSP는 해당 참조를 포함하는 파일과 해당 해석에 영향을 주는 심볼을 정의하는 파일 사이의 의존성을 고려합니다. 결과적으로, 해석된 심볼이 변경되면 참조하는 파일이 수정된(dirty) 상태로 표시될 수 있습니다.

2. **입출력 대응(input-output correspondence)에 의한 전파**: 소스 파일이 변경되거나 영향을 받으면, 생성된 출력을 공유하는 다른 모든 소스 파일도 영향을 받은 것으로 표시됩니다. 이는 공유된 출력을 기반으로 관련 파일들을 동치류(equivalence classes)로 그룹화합니다.

> 규칙 (1)과 (2)는 서로를 반복적으로 트리거할 수 있습니다. 예를 들어, 규칙 (1)이 규칙 (2)를 트리거하고, 다시 규칙 (2)가 규칙 (1)을 트리거할 수 있습니다.
>
{style="tip"}

## 구현 방식

의존성은 입력 파일과 출력 파일 간의 다대다(many-to-many) 관계에 의해 결정됩니다.

KSP가 재처리해야 할 파일을 결정하는 방식은 다음과 같습니다:

* 입력 파일이 변경되면 항상 재처리됩니다.

   **이유:** 입력이 변경되면 새로운 정보가 도입될 수 있습니다. 프로세서는 해당 입력을 사용하여 다시 실행되어야 합니다.

* 입력 파일이 변경되고 해당 파일이 출력과 연결되어 있다면, 동일한 출력과 연결된 다른 모든 입력 파일도 재처리됩니다. 이는 새로운 수정된(dirty) 파일이 없을 때까지 반복적으로 발생합니다.

   **이유:** 출력은 입력 세트로 만들어집니다. 프로세서는 출력을 다시 생성하기 위해 모든 입력이 필요할 수 있습니다.

* 변경되지 않은 입력 파일이 어떤 집계형 출력과도 연결되어 있지 않다면 재처리되지 않습니다.

   **이유:** 이 파일은 변경되지 않았고 집계형 출력과 연결되어 있지 않으므로 어떤 출력에도 영향을 줄 수 없습니다. 위의 규칙 중 하나가 적용되지 않는 한 재처리되지 않습니다.

예를 들어, 다음과 같은 구조의 프로젝트를 가정해 보겠습니다:

```none
.
├── src
│   ├── sourceA.kt
│   └── sourceB.kt
└── generated
   ├── outputA
   └── outputB
```

프로세서가 다음과 같이 동작할 때:

1. `sourceA`를 읽습니다.

2. `outputA`를 생성합니다.

3. `sourceB`를 읽습니다.

4. `outputB`를 생성합니다.

`sourceA`가 변경될 때:

* `outputB`가 집계형(aggregating)이면, KSP는 `sourceA`와 `sourceB`를 모두 재처리합니다.

* `outputB`가 격리형(isolating)이면, KSP는 `sourceA`만 재처리합니다.

`sourceC`가 추가될 때:

* `outputB`가 집계형(aggregating)이면, KSP는 `sourceC`와 `sourceB`를 재처리합니다.

* `outputB`가 격리형(isolating)이면, KSP는 `sourceC`만 재처리합니다.

`sourceA` 또는 `sourceB`가 삭제될 때, KSP는 어떤 파일도 재처리할 필요가 없습니다.

## 예제 프로세서

다음 프로젝트에는 `A`가 `B`를 상속하는 클래스 `A`와 `B`가 포함되어 있습니다.

```kotlin
// A.kt
@Interesting
class A : B()

// B.kt
open class B

// Example1Processor.kt
class Example1Processor : SymbolProcessor {
   override fun process(resolver: Resolver) {
       val declA = resolver.getSymbolsWithAnnotation("Interesting").first() as KSClassDeclaration
       val declB = declA.superTypes.first().resolve().declaration
       // B.kt는 KSP에 의해 의존성으로 추론될 수 있으므로 명시할 필요가 없습니다.
       val dependencies = Dependencies(aggregating = true, declA.containingFile!!)
       // outputForA.kt
       val outputName = "outputFor${declA.simpleName.asString()}"
       // outputForA는 A.kt와 B.kt에 의존합니다.
       val output = codeGenerator.createNewFile(dependencies, "com.example", outputName, "kt")
       output.write("// $declA : $declB
".toByteArray())
       output.close()
   }
   // ...
}
```

`outputForA`를 생성하기 위해 프로세서는 다음을 수행합니다:

1. `Resolver.getSymbolsWithAnnotation`을 호출하여 A를 가져옵니다.

2. A에 대해 `KSClassDeclaration.superTypes`를 호출하여 B를 가져옵니다.

KSP는 해석 추적을 통해 이 관계를 추적하고 `B`를 `A`의 의존성으로 자동으로 기록합니다. 따라서 `outputForA`의 의존성으로 `B.kt`를 명시적으로 선언할 필요가 없습니다.

## 버그 보고

증분 처리가 활성화된 경우에만 발생하는 오류가 발견되면 [GitHub 저장소](https://github.com/google/ksp/issues)에 이슈를 생성하고 관련 로그 파일을 첨부해 주세요.

1. `gradle.properties`에 다음 줄을 추가하여 증분 처리 로그를 활성화합니다:

   ```
   ksp.incremental.log=true
   ```

2. 성공적으로 완료되는 클린 빌드(clean build)를 수행합니다.

3. 생성된 로그 파일을 다른 위치로 복사하여 저장합니다:

   * `build/kspCaches/<source set>/logs/kspDirtySet.log`
   * `build/kspCaches/<source set>/logs/kspSourceToOutputs.log`

4. 이슈를 유발하는 소스 파일을 수정하고 빌드를 다시 실행합니다.

5. 성공한 빌드와 이슈가 재현된 빌드의 로그 파일을 모두 GitHub 이슈에 첨부합니다.