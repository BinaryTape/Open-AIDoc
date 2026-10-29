# 기여하기

이 프로젝트의 목표는 여러분이 신뢰할 수 있는 단순하고 빠르며 안전한 컴포넌트를 구축하는 것입니다. 우리는 일반적인 유스케이스를 쉽게 해결할 수 있도록 의도적으로 프로젝트의 범위를 설정했으며, 특수한 유스케이스도 처리할 수 있도록 확장 가능하게 만들었습니다.

## 생성형 도구 사용 금지 {id="no-generative-tools"}

우리는 소스 코드나 문서에 LLM 또는 생성형 도구를 사용하지 않습니다. 커밋, 이슈, 풀 리퀘스트에서의 사람 간 소통에도 이를 사용하지 않습니다. 우리는 글쓰기가 곧 사고하는 과정이라고 믿으며, 우리의 작업이 신중하게 이루어지기를 원합니다.

모든 기여자에게도 동일한 사항을 요구합니다. 모두가 노력할 때 만드는 과정이 더 즐거워집니다.

프로젝트의 문화를 보호하기 위해 LLM으로 생성된 기여는 즉시 거부합니다. 반복적인 위반자는 차단됩니다.

이 정책에 대한 몇 가지 예외 사항은 다음과 같습니다.

* 영어가 익숙하지 않은 사용자는 도구 사용 사실을 명시하는 조건으로 기계 번역 도구를 사용할 수 있습니다.
* 로컬 자동 완성 (토큰 단위로 과금되는 도구는 지양해 주세요).

코딩은 즐거운 일입니다.

## 코드 기여 {id="code-contributions"}

이 프로젝트에 코드를 기여하고 싶으시다면, GitHub에서 저장소를 포크(fork)한 뒤 풀 리퀘스트(pull request)를 보내주시면 됩니다.

코드를 제출할 때는 코드의 가독성을 최대한 유지하기 위해 기존의 컨벤션과 스타일을 준수하도록 최선을 다해 주시기 바랍니다.

## SQLDelight {id="sqldelight"}

기여를 시작하고 싶다면, SQLDelight의 어떤 부분에 기여하고 싶은지에 따라 아래의 특정 가이드를 확인해 보세요. 여전히 확실하지 않다면, 살펴보고 있는 이슈에 막히는 부분을 댓글로 남겨주시면 답변해 드리겠습니다. 또는 수행하려는 작업에 대한 이슈를 새로 생성하여 논의를 시작해 주세요.

### IDE 플러그인 (IDE Plugin) {id="ide-plugin"}

버그를 수정하거나 IDE 기능을 확장하고 싶다면, 코드 변경은 주로 `sqldelight-idea-plugin` 모듈에서 이루어집니다. `./gradlew runIde` 태스크를 사용하여 변경 사항을 테스트할 수 있으며, `./gradlew runIde --debug-jvm`을 사용하여 라이브 디버깅을 할 수 있습니다.

IDE에서 버그가 발생하지만 샘플 프로젝트에서 재현할 수 없는 경우, IDE를 라이브 디버깅할 수 있습니다. 이를 위해서는 IntelliJ를 별도로 하나 더 설치해야 합니다. [Toolbox](https://www.jetbrains.com/toolbox-app/)를 사용하여 IDE 목록 하단으로 스크롤한 뒤 다른 버전의 IntelliJ를 선택하여 설치할 수 있습니다.

디버거를 사용하려는 IDE에서 SQLDelight 저장소를 체크아웃한 다음, 새로운 `Remote` 실행 구성(Run Configuration)을 생성합니다. 그러면 "Command line arguments for remote JVM" 항목에 `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`와 같은 값이 이미 채워져 있을 것입니다. 이 값을 복사한 다음, 디버깅하려는 IDE를 엽니다. `Help -> Edit Custom VM Options`를 선택하고, 열린 파일의 맨 아래에 복사한 줄을 붙여넣습니다. 디버깅하려는 IDE를 재시작하고, 시작되면 실행 구성을 생성했던 IDE를 열어 생성한 원격 구성을 사용하여 디버거를 연결(attach)합니다.

IDE 플러그인 및 기능 구축에 대한 자세한 정보는 [공식 Jetbrains 문서](https://jetbrains.org/intellij/sdk/docs/reference_guide/custom_language_support.html)를 참조하거나 [Jetbrains Platform Slack](https://blog.jetbrains.com/platform/2019/10/introducing-jetbrains-platform-slack-for-plugin-developers/)에 참여하세요.

### 드라이버 (Drivers) {id="drivers"}

자신만의 드라이버를 만들고 싶다면 `runtime` 아티팩트를 사용하여 SQLDelight 저장소 외부에서 작업할 수 있습니다. 드라이버를 테스트하려면 `driver-test`에 의존성을 추가하고 `DriverTest` 및 `TransactionTest`를 확장하여 SQLDelight가 기대하는 대로 작동하는지 확인할 수 있습니다.

#### 비동기 드라이버 (Asynchronous Drivers) {id="asynchronous-drivers"}

비동기 호출을 수행하는 드라이버는 `runtime-async` 아티팩트를 사용하여 구현할 수 있습니다.

### Gradle {id="gradle"}

Gradle 관련 이슈가 발생하면, `sqldelight-gradle-plugin/src/test`에 기존 폴더들과 유사하게 이슈를 재현하는 테스트 픽스처(test fixture)를 만드는 것부터 시작하세요. 수정 방법을 모르더라도 이 실패하는 테스트와 함께 PR을 자유롭게 열어주세요! 테스트 케이스는 언제나 환영입니다. 통합 테스트(integration tests)는 SQLite/MySQL/PostgreSQL 등을 실행하고 해당 런타임 환경과 SQLDelight를 사용하여 SQL 쿼리를 실행하는 전체 Gradle 프로젝트를 설정하는 방법을 보여줍니다. SQLDelight에서 런타임 이슈가 발생하는 경우 기존 통합 테스트에 테스트를 추가하는 것을 고려해 보세요.

### 컴파일러 (Compiler) {id="compiler"}

SQLDelight의 컴파일러에는 많은 계층이 있습니다. SQL 파싱이 아닌 코드 생성(codegen)에만 관심이 있다면 `sqldelight-compiler` 모듈에서 기여하면 됩니다. 파서(parser)에 관심이 있다면 [sql-psi](https://github.com/alecstrong/sql-psi)에 기여해야 합니다. SQLDelight는 Kotlin 코드 생성을 위해 [kotlinpoet](https://github.com/square/kotlinpoet)을 사용하므로, 임포트(import)가 올바르게 작동하도록 Kotlin 타입을 참조할 때는 해당 API를 사용해야 합니다. 어떤 방식으로든 코드 생성을 수정한 경우, 풀 리퀘스트를 열기 전에 `./gradlew build`를 실행하세요. 그러면 `sqldelight-compiler:integration-tests`의 통합 테스트가 업데이트됩니다. 런타임 환경에서 SQL 쿼리를 실행하는 통합 테스트를 작성하고 싶다면 `sqldelight-compiler:integration-tests`에 테스트를 추가하세요.

---

## SQL PSI {id="sql-psi"}

다음 섹션에서는 파서와 PSI 계층에 기여하는 방법을 살펴보겠지만, 그 전에 [sql-psi](https://github.com/AlecStrong/sql-psi)의 다양한 구성 요소를 이해하기 위해 [다중 방언(multiple dialects)](https://www.alecstrong.com/posts/multiple-dialects/)에 관한 블로그 포스트를 읽어보시기 바랍니다. SQLDelight와 마찬가지로, 이슈가 발생했지만 수정 사항을 기여하는 방법을 모르거나 도움이 필요한 경우 GitHub 이슈에 댓글을 남기거나 새 이슈를 생성하여 논의를 시작해 주세요.

SQL-PSI의 모든 변경 사항에 대해서는 해당 `core/src/test/fixtures_*` 폴더에 테스트 픽스처를 추가해야 합니다. 접미사가 없는 `fixtures` 폴더는 모든 방언에 대해 실행됩니다. SQL-PSI에 변경 사항이 머지된 후 SQLDelight에서도 변경이 필요한 경우, SQLDelight의 `sql-psi-dev` 브랜치를 체크아웃하고 해당 브랜치를 대상으로 PR을 보내주세요. 이 브랜치는 SQL-PSI의 스냅샷 릴리스를 사용하므로 SQL-PSI 변경 사항이 머지된 후 약 10분 후에 SQLDelight 변경 사항을 빌드할 수 있습니다.

### 문법 (Grammar) {id="grammar"}

문법을 추가하는 경우, 먼저 이것이 기존 문법에 추가하는 새로운 규칙(rule)인지, 아니면 ANSI SQL([sql.bnf](https://github.com/AlecStrong/sql-psi/blob/master/core/src/main/kotlin/com/alecstrong/sql/psi/core/sql.bnf)에서 확인 가능)에서 오버라이드하려는 규칙인지 결정하세요. 두 경우 모두 새로운 문법에 해당 규칙을 정의해야 하지만, ANSI SQL 규칙을 오버라이드하는 경우에는 overrides 리스트에 추가하고 규칙에 override 속성을 설정해야 합니다.

```bnf
overrides ::= my_rule

my_rule ::= SOME_TOKEN {
  override = true
}
```

규칙의 정의는 ANSI-SQL의 규칙을 그대로 복사하여 붙여넣는 것으로 시작해야 합니다. ANSI-SQL의 규칙을 참조하려면 `{}`로 감싸야 하므로, 오버라이드하는 규칙 내의 모든 외부 규칙은 `{}`로 감싸야 합니다.

```bnf
my_rule ::= internal_rule {external_rule} {
  override = true
}
internal_rule ::= SOME_TOKEN
```

한 가지 주의할 점은 ANSI-SQL의 `expr` 규칙을 참조할 때는 특별하게 처리되어 오버라이드될 수 없으므로 `<<expr '-1'>>`과 같이 작성해야 한다는 것입니다.

ANSI SQL에서 사용하려는 모든 토큰(token)도 수동으로 임포트해야 합니다.

```bnf
{
  parserImports = [
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.DELETE"
    "static com.alecstrong.sql.psi.core.psi.SqlTypes.FROM"
  ]
}
overrides ::= delete

delete ::= DELETE FROM {table_name} {
  override = true
}
```

방언은 자신만의 토큰을 추가할 수 없지만, `""`로 감싸서 정확한 텍스트를 요구할 수는 있습니다.

```bnf
my_rule ::= "SOME_TOKEN"
```

오버라이드 규칙은 여전히 원래 규칙의 타입과 일치하는 코드를 생성해야 하므로, 원래 규칙에 대한 기존 타입을 반드시 `implement` 및 `extend` 해야 합니다.

```bnf
my_rule ::= internal_rule {external_rule} {
  extends = "com.alecstrong.sql.psi.core.psi.impl.SqlMyRuleImpl"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

문법에서 규칙을 오버라이드하는 예시는 PostgreSQL에 `RETURNING` 구문을 추가한 [이 PR](https://github.com/AlecStrong/sql-psi/pull/163/files)을 확인해 보세요.

### 규칙 동작 (Rule Behavior) {id="rule-behavior"}

종종 PSI 계층의 동작을 수정하고 싶을 때가 있습니다 (예: 컴파일을 실패시키고 싶은 상황에서 에러를 던지는 경우). 이를 위해 규칙에서 `extends` 대신 직접 작성한 새로운 로직이 포함된 클래스인 `mixin`을 사용하도록 하세요.

```bnf
my_rule ::= interal_rule {external_rule} {
  mixin = "com.alecstrong.sql.psi.MyRuleMixin"
  implements = "com.alecstrong.sql.psi.core.psi.SqlMyRule"
  overrides = true
}
```

그런 다음 해당 클래스가 원래의 ANSI SQL 타입과 SQL-PSI 베이스 클래스인 `SqlCompositeElementImpl`을 구현하도록 합니다.

```
class MyRule(
  node: ASTNode
) : SqlCompositeElementImpl(node),
    SqlMyRule {
  fun annotate(annotationHolder: SqlAnnotationHolder) {
    if (internal_rule.text == "bad_text") {
      annotationHolder.createErrorAnnotation("Invalid text value", internal_rule)
    }
  }
}
```

예를 들어, [DropIndexMixin](https://github.com/AlecStrong/sql-psi/blob/f1137ff82dd0aa77f741a09d88855fbf9b751c00/core/src/main/kotlin/com/alecstrong/sql/psi/core/psi/mixins/DropIndexMixin.kt)은 삭제하려는 인덱스가 스키마에 존재하는지 확인합니다.

---

이 문서에서 다루지 않은 기여에 관한 질문이 있다면 언제든지 SQLDelight에 이슈를 생성하거나, 이 문서를 개선할 수 있도록 PR을 열어주세요!