[//]: # (title: 인자 생성 제약 조건)
[//]: # (description: Lincheck에서 연산 인자 생성을 구성하는 방법을 알아봅니다.)

동시성 데이터 구조를 테스트하기 위해, Lincheck은 연산을 서로 다른 스레드에 무작위로 배치하고 무작위 인자로 호출하여 일련의 동시성 시나리오를 생성합니다.

연산 인자의 범위를 제약함으로써 동시성 버그를 발견할 확률을 높일 수 있습니다. 예를 들어, 가능한 키 값의 범위가 제한되어 있으면 해시 맵의 동시 연산이 동일한 키에 접근할 가능성이 커집니다. 이를 통해 Lincheck은 경합 상태(race condition) 및 기타 동시성 버그를 더 효율적으로 노출할 수 있습니다.

Lincheck에서 생성되는 인자 값의 범위를 제한하려면 다음 단계를 따르세요:

1. `@Param` 어노테이션을 사용하여 인자 생성기를 선언합니다:

   ```kotlin
   @Param(name = "key", gen = IntGen::class, conf = "1:2")
   class MultiMapTest {
       // 테스트들
   }
   ```

   * `name` – 인자 생성기의 이름.
   * `gen` – 생성기의 [유형](#generator-types).
   * `conf` – 생성기를 위한 구성 문자열. 여기서는 Lincheck이 1에서 2 사이의 정수 값을 생성합니다.

   > Lincheck은 여러 값 유형에 대한 생성기를 제공합니다. 각 유형은 서로 다른 구성 문자열 템플릿을 사용합니다.
   >
   > 자세한 내용은 [생성기 유형](#generator-types) 섹션을 읽어보세요.
   { style = "tip" }

2. 제약 조건을 적용할 연산 매개변수에 `@Param` 어노테이션을 추가합니다:

   ```kotlin
   @Operation
   fun add(@Param(name = "key") key: Int, value: Int) = map.add(key, value)

   @Operation
   fun get(@Param(name = "key") key: Int) = map.get(key)
   ```

제약 조건이 적용되면, Lincheck은 지정된 범위 내의 값만 사용하여 시나리오를 생성합니다:

```text
| ---------------------------------- |
|    Thread 1     |     Thread 2     |
| ---------------------------------- |
| add(2, 0): void | add(2, -1): void |
| ---------------------------------- |
| get(2): [-1]    |                  |
| ---------------------------------- |
```

## 생성기 유형

Lincheck은 다음과 같은 인자 생성기 유형을 제공합니다:

<table>
    <tr>
      <th>생성기</th>
      <th>구성 템플릿</th>
      <th>설명</th>
    </tr>
    <tr>
      <td><code>IntGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code>과 <code>max</code> 사이의 <code>Int</code> 값을 생성합니다(양 끝값 포함). <br/><br/>
          구성 문자열이 비어 있으면 <code>Int.MIN_VALUE</code>에서 
          <code>Int.MAX_VALUE</code>까지의 전체 정수 범위를 사용합니다. <br/><br/>
          예시:
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>StringGen</code></td>
      <td><code>"maxWordLength:alphabet"</code><br/><code>"maxWordLength"</code><br/><code>""</code></td>
      <td>제공된 <code>alphabet</code>에서 최대 <code>maxWordLength</code> 길이까지의 무작위 문자열 값을 생성합니다.
          기본 <code>alphabet</code>은 <code>[a-zA-Z\d _]</code>입니다. <br/>
          기본 <code>maxWordLength</code>는 <code>15</code>입니다. <br/><br/>
          예시:
          <code-block lang="text">"2:abc" -> [
    "a", "b", "c",
    "aa", "bb", "cc",
    "ab", "bc", "ac",
    "ba", "cb", "ca"
]</code-block></td>
    </tr>
    <tr>
      <td><code>EnumGen</code></td>
      <td><code>"Enum.Const1,Enum.Const2,..."</code></td>
      <td>지정된 열거형(enum) 값 목록에서 무작위 값을 생성합니다. <br/><br/>
          예시:
          <code-block lang="text">"Enum.Const1,Enum.Const2" -> [
    Enum.Const1, 
    Enum.Const2
]</code-block></td>
    </tr>
    <tr>
      <td><code>BooleanGen</code></td>
      <td><code>""</code></td>
      <td><code>true</code>와 <code>false</code> 값을 생성합니다. 별도의 구성 문자열이 필요하지 않습니다. <br/><br/>
          예시:
          <code>"" -&gt; [true, false]</code></td>
    </tr>
    <tr>
      <td><code>DoubleGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td><code>start</code>부터 <code>end</code>까지 <code>step</code>만큼 증가하며 <code>Double</code> 값을 생성합니다. <br/><br/> 
          기본 <code>step</code> 값은 <code>(end - start)/100</code>입니다. <br/><br/> 
          구성 문자열이 비어 있으면 <code>Int.MIN_VALUE</code>부터 
          <code>Int.MAX_VALUE</code>까지 <code>step = 0.1</code>로 값을 생성합니다. <br/><br/>
          예시:
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>FloatGen</code></td>
      <td><code>"start:step:end"</code><br/><code>"start:end"</code><br/><code>""</code></td>
      <td><code>DoubleGen</code>과 동일하며 값이 <code>Float</code>으로 변환됩니다. <br/><br/>
          예시:
          <code>"0.0:0.1:1.0" -&gt; [0.0, 0.1, 0.2, ..., 0.9, 1.0]</code></td>
    </tr>
    <tr>
      <td><code>LongGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>IntGen</code>과 동일하며 값이 <code>Long</code>으로 변환됩니다. <br/><br/>
          예시:
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ShortGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code>과 <code>max</code> 사이의 <code>Short</code> 값을 생성합니다(양 끝값 포함). <br/><br/>
          구성 문자열이 비어 있으면 <code>-32768</code>부터 <code>32767</code>까지의 전체 Short 범위를 사용합니다. <br/><br/>
          예시:
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ByteGen</code></td>
      <td><code>"min:max"</code></td>
      <td><code>min</code>과 <code>max</code> 사이의 <code>Byte</code> 값을 생성합니다(양 끝값 포함). <br/><br/>
          구성 문자열이 비어 있으면 <code>-128</code>부터 
          <code>127</code>까지의 전체 바이트 범위를 사용합니다. <br/><br/>
          예시:
          <code>"1:3" -&gt; [1, 2, 3]</code></td>
    </tr>
    <tr>
      <td><code>ThreadIdGen</code></td>
      <td><code>""</code></td>
      <td>현재 스레드의 ID 번호를 반환합니다. 별도의 구성 문자열이 필요하지 않습니다. <br/><br/>
          예시:
          <code>"" -&gt; [1, 2]</code></td>
    </tr>
</table>

## 다음 단계

Lincheck에서 [특정 연산을 단일 스레드로 제한하는 방법](lincheck-operation-execution-options.md)을 알아보세요.

## 참고 항목

* [논블로킹 진행 보장 확인](lincheck-progress-guarantees.md)
* [알고리즘의 순차 명세 정의](lincheck-results-validation.md)