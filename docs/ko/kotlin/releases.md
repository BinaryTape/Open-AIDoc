[//]: # (title: Kotlin 릴리스 프로세스)

<web-summary>Kotlin의 다양한 릴리스 유형, 각 버전으로 업데이트하는 방법, 그리고 Kotlin의 릴리스 내역에 대해 알아보세요.</web-summary>

<tldr>
    <p>최신 Kotlin 버전: <strong>%kotlinVersion%</strong></p>
    <p><a href="%kotlinLatestWhatsnew%">Kotlin 2.4.20의 새로운 기능</a>을 확인하고, <a href="%kotlinLatestUrl%">변경 로그(changelog)</a>에서 버그 수정에 대한 자세한 내용을 찾아보세요.</p>
</tldr>

이 페이지에서는 Kotlin의 릴리스 주기와 배포되는 다양한 릴리스 유형에 대해 설명합니다. 또한 이전 및 향후 출시될 Kotlin 릴리스에 대한 세부 정보와 특정 릴리스로 업데이트하는 방법도 다룹니다.

Kotlin 2.0.0부터 다음과 같은 유형의 릴리스를 배포합니다.

* _언어 릴리스(Language release)_ (2._x_._0_): 언어에 주요 변경 사항을 적용하고 툴링 업데이트를 포함합니다. 6개월에 한 번씩 출시됩니다.
* _툴링 릴리스(Tooling release)_ (2._x_._20_): 언어 릴리스 사이에 배포되며 툴링 업데이트, 성능 향상 및 버그 수정을 포함합니다. 해당 _언어 릴리스_ 후 3개월 뒤에 출시됩니다.
* _버그 수정 릴리스(Bug fix release)_ (2._x_._yz_): _툴링 릴리스_에 대한 버그 수정을 포함합니다. 이러한 릴리스에는 정해진 출시 일정이 없습니다.

> 예를 들어, 언어 릴리스 2.2.0의 경우 툴링 릴리스 2.2.20 하나와 버그 수정 릴리스 2.2.21 하나만 배포되었습니다.
>
{style="tip"}

각 언어 및 툴링 릴리스마다 새로운 기능이 정식 출시되기 전에 미리 사용해 볼 수 있도록 여러 프리뷰(_EAP_) 버전도 함께 배포됩니다. 자세한 내용은 [Kotlin Early Access Preview 참여하기](eap.md)를 참고하세요.

> 새로운 Kotlin 릴리스에 대한 알림을 받고 싶다면 [Kotlin 뉴스레터](https://lp.jetbrains.com/subscribe-to-kotlin-news/)를 구독하거나, [X의 Kotlin 공식 계정](https://x.com/kotlin)을 팔로우하거나, [Kotlin GitHub 저장소](https://github.com/JetBrains/kotlin)에서 **Watch | Custom | Releases** 옵션을 활성화하세요.
> 
{style="note"}

## 향후 Kotlin 릴리스 {id="upcoming-kotlin-releases"}

향후 출시 예정인 안정화(Stable) Kotlin 릴리스의 대략적인 일정은 다음과 같습니다.

* **2.5.0**: 2026년 12월 예정
* **2.5.20**: 2027년 3월 예정

## 새로운 Kotlin 버전으로 업데이트하기 {id="update-to-a-new-kotlin-version"}

프로젝트를 새 릴리스로 업그레이드하려면 빌드 시스템에서 Kotlin 버전을 업데이트하세요.

### Gradle {id="gradle"}

Kotlin %kotlinVersion%으로 업데이트하려면 `build.gradle(.kts)` 파일에서 Kotlin Gradle 플러그인 버전을 변경합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // `<...>` 부분을 타깃 환경에 맞는 플러그인 이름으로 변경하세요.
    kotlin("<...>") version "%kotlinVersion%"
    // 예를 들어 타깃 환경이 JVM인 경우:
    // kotlin("jvm") version "%kotlinVersion%"
    // 타깃 환경이 Kotlin Multiplatform인 경우:
    // kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // `<...>` 부분을 타깃 환경에 맞는 플러그인 이름으로 변경하세요.
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 예를 들어 타깃 환경이 JVM인 경우: 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    // 타깃 환경이 Kotlin Multiplatform인 경우:
    // id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

이전 Kotlin 버전으로 생성된 프로젝트가 있는 경우, [kotlinx 라이브러리의 버전도 업데이트](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)해야 하는지 확인하세요.

새로운 언어 릴리스로 마이그레이션하는 경우 Kotlin 플러그인의 마이그레이션 도구가 이 과정을 지원합니다.

> 프로젝트에서 Gradle을 사용하는 방법에 대해 자세히 알아보려면 [Gradle 프로젝트 구성](gradle-configure-project.md)을 참고하세요.
> 
{style="tip"}

### Maven {id="maven"}

Kotlin %kotlinVersion%으로 업데이트하려면 `pom.xml` 파일에서 버전을 변경합니다.

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>
```

또는 `pom.xml` 파일에서 `kotlin-maven-plugin`의 버전을 변경할 수도 있습니다.

```xml
<plugins>
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>%kotlinVersion%</version>
    </plugin>
</plugins>
```

이전 Kotlin 버전으로 생성된 프로젝트가 있는 경우, [kotlinx 라이브러리의 버전도 업데이트](maven-set-dependencies.md#dependency-on-a-kotlinx-library)해야 하는지 확인하세요.

> 프로젝트에서 Maven을 사용하는 방법에 대해 자세히 알아보려면 [Maven](maven.md)을 참고하세요.
>
{style="tip"}

## IDE 지원 {id="ide-support"}

Kotlin은 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/kotlin/get-started)에서 기본적으로 완벽하게 지원됩니다.

## 표준 라이브러리 보안 지원 {id="standard-library-security-support"}

Kotlin 2.4.0부터 JVM용 Kotlin 표준 라이브러리는 각 릴리스 라인마다 18개월의 지원 기간(support window)을 갖습니다. 언어 릴리스(2._x_._0_)와 이어지는 툴링 릴리스(2._x_._20_)는 동일한 릴리스 라인(2._x_)에 속합니다.

JVM용 Kotlin 표준 라이브러리에 영향을 주는 보안 취약점이 발견되면 다음을 동시에 배포합니다.

* 보안 패치가 포함된 해당 릴리스 라인의 최신 Kotlin 릴리스 기반 버그 수정 릴리스.
* 유효한 지원 기간 내에 있는 모든 릴리스 라인에 대한 버그 수정 릴리스.

예를 들어 보안 취약점이 발견되었을 때 최신 Kotlin 릴리스가 Kotlin 2.4.20인 경우, Kotlin 2.4.20에 대해서만 버그 수정 버전을 릴리스하며 Kotlin 2.4.0에 대한 버그 수정 버전은 릴리스하지 않습니다.

다음 표는 모든 Kotlin 릴리스와 지원 기간을 보여줍니다.

<table>
    <tr>
        <th>Kotlin 릴리스 라인</th>
        <th>릴리스 일자</th>
        <th>지원 종료일</th>
        <th>최신 릴리스</th>
    </tr>
    <tr>
        <td><strong>2.4</strong>
        </td>
        <td>
            <p>2026년 6월 3일</p>
        </td>
        <td>
            <p>2027년 12월 3일</p>
        </td>
        <td>
            <p>2.4.21</p>
        </td>
    </tr>
</table>

> 보안 이슈에 대한 제보는 언제나 환영합니다. Kotlin에서 발견한 문제를 신고하려면 [이슈 트래커](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem)에 직접 글을 남기거나 [이메일](mailto:security@jetbrains.org)을 보내주세요.
> 
{style="tip"}

## 릴리스 내역 {id="release-history"}

다음 표에는 이전 Kotlin 릴리스의 세부 정보가 나열되어 있습니다.

> [Kotlin Early Access Preview (EAP) 버전](eap.md#build-details)도 사용해 볼 수 있습니다.
> 
{style="tip"}

<table>
    <tr>
        <th>빌드 정보</th>
        <th>주요 하이라이트</th>
    </tr>
    <tr>
        <td><strong>2.4.21</strong>
            <p>릴리스 일자: <strong>2026년 10월 8일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.21을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.20</strong>
            <p>릴리스 일자: <strong>2026년 9월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 실험적 및 안정화 기능, 성능 향상, 버그 수정 및 툴링 업데이트가 포함된 툴링 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>릴리스 일자: <strong>2026년 7월 14일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.0을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>릴리스 일자: <strong>2026년 6월 3일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능 및 안정화된 언어 기능, 툴링 업데이트, 다양한 플랫폼에 대한 성능 향상, 중요한 버그 수정이 포함된 언어 릴리스입니다.</p>
            <p>Kotlin 2.4.0에 대한 자세한 내용은 <a href="whatsnew24.md" target="_blank">Kotlin 2.4.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>릴리스 일자: <strong>2026년 4월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.20을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>릴리스 일자: <strong>2026년 3월 16일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>성능 향상, 버그 수정 및 툴링 업데이트가 포함된 툴링 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>릴리스 일자: <strong>2026년 2월 5일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>성능 향상과 드물게 발생하는 <a href="https://youtrack.jetbrains.com/issue/KT-83984"><code>kotlinx.serialization</code> 관련 레이스 컨디션(race condition)</a>에 대한 중요 수정 사항이 포함된 Kotlin 2.3.0 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>릴리스 일자: <strong>2025년 12월 16일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능 및 안정화된 언어 기능, 툴링 업데이트, 다양한 플랫폼에 대한 성능 향상, 중요한 버그 수정이 포함된 언어 릴리스입니다.</p>
            <p>Kotlin 2.3.0에 대한 자세한 내용은 <a href="whatsnew23.md" target="_blank">Kotlin 2.3.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>릴리스 일자: <strong>2025년 10월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Xcode 26 지원 및 기타 개선 사항과 버그 수정이 포함된 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">변경 로그</a>를 참고하세요.</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>릴리스 일자: <strong>2025년 9월 10일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>웹 개발을 위한 중요 변경 사항 및 기타 개선 사항이 포함된 Kotlin 2.2.0용 툴링 릴리스입니다.</p>
            <p>Kotlin 2.2.20에 대한 자세한 내용은 <a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>릴리스 일자: <strong>2025년 8월 14일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>릴리스 일자: <strong>2025년 6월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능 및 안정화된 언어 기능, 툴링 업데이트, 다양한 플랫폼에 대한 성능 향상, 중요한 버그 수정이 포함된 언어 릴리스입니다.</p>
            <p>Kotlin 2.2.0에 대한 자세한 내용은 <a href="whatsnew22.md" target="_blank">Kotlin 2.2.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>릴리스 일자: <strong>2025년 5월 13일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.20을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>릴리스 일자: <strong>2025년 3월 20일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
           <p>새로운 실험적 기능, 성능 향상, 버그 수정이 포함된 Kotlin 2.1.0용 툴링 릴리스입니다.</p>
            <p>Kotlin 2.1.20에 대한 자세한 내용은 <a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>릴리스 일자: <strong>2025년 1월 27일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.0을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>릴리스 일자: <strong>2024년 11월 27일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능을 도입한 언어 릴리스입니다.</p>
            <p>Kotlin 2.1.0에 대한 자세한 내용은 <a href="whatsnew21.md" target="_blank">Kotlin 2.1.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>릴리스 일자: <strong>2024년 10월 10일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.20을 위한 버그 수정 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">변경 로그</a>를 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>릴리스 일자: <strong>2024년 8월 22일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
           <p>성능 향상 및 버그 수정이 포함된 Kotlin 2.0.0용 툴링 릴리스입니다. Kotlin/Native 가비지 컬렉터의 동시 마킹(concurrent marking), Kotlin 공통 표준 라이브러리의 UUID 지원, Compose 컴파일러 업데이트, Gradle 8.8까지의 지원 등이 포함되어 있습니다.
            </p>
            <p>Kotlin 2.0.20에 대한 자세한 내용은 <a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>릴리스 일자: <strong>2024년 8월 6일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.0을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 2.0.0에 대한 자세한 내용은 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>릴리스 일자: <strong>2024년 5월 21일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>안정화된 Kotlin K2 컴파일러가 포함된 언어 릴리스입니다.</p>
            <p>Kotlin 2.0.0에 대한 자세한 내용은 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>릴리스 일자: <strong>2024년 7월 19일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.25" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20, 1.9.21, 1.9.22, 1.9.23, 1.9.24를 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.20에 대한 자세한 내용은 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>릴리스 일자: <strong>2024년 5월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20, 1.9.21, 1.9.22, 1.9.23을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.20에 대한 자세한 내용은 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>릴리스 일자: <strong>2024년 3월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20, 1.9.21, 1.9.22를 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.20에 대한 자세한 내용은 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>릴리스 일자: <strong>2023년 12월 21일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 및 1.9.21을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.20에 대한 자세한 내용은 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>릴리스 일자: <strong>2023년 11월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.20에 대한 자세한 내용은 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>릴리스 일자: <strong>2023년 11월 1일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin K2 컴파일러 베타 및 안정화된 Kotlin Multiplatform이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20의 새로운 기능</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.10</strong>
            <p>릴리스 일자: <strong>2023년 8월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.0을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.9.0에 대한 자세한 내용은 <a href="whatsnew19.md" target="_blank">Kotlin 1.9.0의 새로운 기능</a>을 참고하세요.</p>
            <note>Android Studio Giraffe 및 Hedgehog의 경우, Kotlin 플러그인 1.9.10은 향후 Android Studio 업데이트를 통해 제공됩니다.</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>릴리스 일자: <strong>2023년 7월 6일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin K2 컴파일러 업데이트, 새로운 열거형(enum) 클래스 values 함수, 
                열린 범위(open-ended ranges)를 위한 새로운 연산자, Kotlin Multiplatform의 Gradle 구성 캐시(configuration cache) 프리뷰, 
                Kotlin Multiplatform의 Android 타깃 지원 변경 사항, Kotlin/Native의 커스텀 메모리 할당자 프리뷰가 포함된 기능 릴리스입니다.
            </p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew19.md" target="_blank">Kotlin 1.9.0의 새로운 기능</a></li>
                <li><a href="https://www.youtube.com/embed/fvwTZc-dxsM" target="_blank">Kotlin의 새로운 기능 YouTube 동영상</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.22</strong>
            <p>릴리스 일자: <strong>2023년 6월 8일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.22" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.8.20에 대한 자세한 내용은 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>릴리스 일자: <strong>2023년 4월 25일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.8.20에 대한 자세한 내용은 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20의 새로운 기능</a>을 참고하세요.</p>
            <note>Android Studio Flamingo 및 Giraffe의 경우, Kotlin 플러그인 1.8.21은 향후 Android Studio 업데이트를 통해 제공됩니다.</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>릴리스 일자: <strong>2023년 4월 3일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin K2 컴파일러 업데이트, stdlib의 AutoCloseable 인터페이스 및 Base64 인코딩, 
                기본값으로 활성화된 새로운 JVM 증분 컴파일, 새로운 Kotlin/Wasm 컴파일러 백엔드가 포함된 기능 릴리스입니다.
            </p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20의 새로운 기능</a></li>
                <li><a href="https://youtu.be/R1JpkpPzyBU" target="_blank">Kotlin의 새로운 기능 YouTube 동영상</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.10</strong>
            <p>릴리스 일자: <strong>2023년 2월 2일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.0을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a>에 대해 자세히 알아보세요.</p>
            <note>Android Studio Electric Eel 및 Flamingo의 경우, Kotlin 플러그인 1.8.10은 향후 Android Studio 업데이트를 통해 제공됩니다.</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>릴리스 일자: <strong>2022년 12월 28일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>개선된 kotlin-reflect 성능, JVM용 디렉터리 콘텐츠 재귀 복사 또는 삭제 실험적 함수 추가, Objective-C/Swift 상호 운용성 개선이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew18.md" target="_blank">Kotlin 1.8.0의 새로운 기능</a></li>
                <li><a href="compatibility-guide-18.md" target="_blank">Kotlin 1.8.0 호환성 가이드</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.21</strong>
            <p>릴리스 일자: <strong>2022년 11월 9일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.20을 위한 버그 수정 릴리스입니다.</p>
            <p>Kotlin 1.7.20에 대한 자세한 내용은 <a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20의 새로운 기능</a>을 참고하세요.</p>
            <note>Android Studio Dolphin, Electric Eel 및 Flamingo의 경우, Kotlin 플러그인 1.7.21은 향후 Android Studio 업데이트를 통해 제공됩니다.</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>릴리스 일자: <strong>2022년 9월 29일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능, Kotlin K2 컴파일러의 여러 컴파일러 플러그인 지원, 
                기본값으로 활성화된 새로운 Kotlin/Native 메모리 관리자, Gradle 7.1 지원이 포함된 점진적(incremental) 릴리스입니다.
            </p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20의 새로운 기능</a></li>
                <li><a href="https://youtu.be/OG9npowJgE8" target="_blank">Kotlin의 새로운 기능 YouTube 동영상</a></li>
                <li><a href="compatibility-guide-1720.md" target="_blank">Kotlin 1.7.20 호환성 가이드</a></li>
            </list>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">Kotlin 1.7.20</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.10</strong>
            <p>릴리스 일자: <strong>2022년 7월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.0을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a>에 대해 자세히 알아보세요.</p>
            <note>Android Studio Dolphin (213) 및 Android Studio Electric Eel (221)의 경우, Kotlin 플러그인 1.7.10은 향후 Android Studio 업데이트를 통해 제공됩니다.</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>릴리스 일자: <strong>2022년 6월 9일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>JVM용 Kotlin K2 컴파일러 알파 버전, 안정화된 언어 기능, 성능 향상, 실험적 API 안정화와 같은 점진적 변경 사항이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="whatsnew17.md" target="_blank">Kotlin 1.7.0의 새로운 기능</a></li>
                <li><a href="https://youtu.be/54WEfLKtCGk" target="_blank">Kotlin의 새로운 기능 YouTube 동영상</a></li>
                <li><a href="compatibility-guide-17.md" target="_blank">Kotlin 1.7.0 호환성 가이드</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.21</strong>
            <p>릴리스 일자: <strong>2022년 4월 20일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.20을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>릴리스 일자: <strong>2022년 4월 4일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>다음을 포함한 다양한 개선 사항이 적용된 점진적 릴리스입니다.</p>
            <list>
                <li>컨텍스트 리시버(context receivers) 프로토타입</li>
                <li>함수형 인터페이스 생성자에 대한 호출 가능 참조(callable reference)</li>
                <li>Kotlin/Native: 새 메모리 관리자의 성능 향상</li>
                <li>Multiplatform: 계층적 프로젝트 구조 기본 적용</li>
                <li>Kotlin/JS: IR 컴파일러 개선</li>
                <li>Gradle: 컴파일러 실행 전략</li>
            </list>
            <p><a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.10</strong>
            <p>릴리스 일자: <strong>2021년 12월 14일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.0을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>릴리스 일자: <strong>2021년 11월 16일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능, 성능 향상, 실험적 API 안정화와 같은 점진적 변경 사항이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew16.md" target="_blank">Kotlin 1.6.0의 새로운 기능</a></li>
                <li><a href="compatibility-guide-16.md" target="_blank">호환성 가이드</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.32</strong>
            <p>릴리스 일자: <strong>2021년 11월 29일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.32" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.31을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>릴리스 일자: <strong>2021년 9월 20일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.30을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>릴리스 일자: <strong>2021년 8월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>다음을 포함한 다양한 개선 사항이 적용된 점진적 릴리스입니다.</p>
            <list>
                <li>JVM에서 어노테이션 클래스 인스턴스화</li>
                <li>개선된 opt-in 요구 메커니즘 및 타입 추론</li>
                <li>베타 버전의 Kotlin/JS IR 백엔드</li>
                <li>Apple Silicon 타깃 지원</li>
                <li>개선된 CocoaPods 지원</li>
                <li>Gradle: Java 툴체인 지원 및 데몬 구성 개선</li>
            </list>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/08/kotlin-1-5-30-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30의 새로운 기능</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.21</strong>
            <p>릴리스 일자: <strong>2021년 7월 13일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.20을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>릴리스 일자: <strong>2021년 6월 24일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>다음을 포함한 다양한 개선 사항이 적용된 점진적 릴리스입니다.</p>
            <list>
                <li>JVM에서 기본적으로 <code>invokedynamic</code>을 통한 문자열 연결 사용</li>
                <li>Lombok 지원 개선 및 JSpecify 지원</li>
                <li>Kotlin/Native: Objective-C 헤더로 KDoc 내보내기 및 단일 배열 내에서 더 빠른 <code>Array.copyInto()</code> 수행</li>
                <li>Gradle: 어노테이션 프로세서 클래스로더 캐싱 및 <code>--parallel</code> Gradle 속성 지원</li>
                <li>여러 플랫폼 간 일관된 stdlib 함수 동작</li>
            </list>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20의 새로운 기능</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.10</strong>
            <p>릴리스 일자: <strong>2021년 5월 24일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.0을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>릴리스 일자: <strong>2021년 5월 5일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>새로운 언어 기능, 성능 향상, 실험적 API 안정화와 같은 점진적 변경 사항이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew15.md" target="_blank">Kotlin 1.5.0의 새로운 기능</a></li>
                <li><a href="compatibility-guide-15.md" target="_blank">호환성 가이드</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.32</strong>
            <p>릴리스 일자: <strong>2021년 3월 22일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.32" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>릴리스 일자: <strong>2021년 2월 25일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>릴리스 일자: <strong>2021년 2월 3일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>다음을 포함한 다양한 개선 사항이 적용된 점진적 릴리스입니다.</p>
            <list>
                <li>베타 단계로 진입한 새로운 JVM 백엔드</li>
                <li>새로운 언어 기능 프리뷰</li>
                <li>Kotlin/Native 성능 향상</li>
                <li>표준 라이브러리 API 개선</li>
            </list>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30의 새로운 기능</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.21</strong>
            <p>릴리스 일자: <strong>2020년 12월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.21" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.20을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>릴리스 일자: <strong>2020년 11월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>다음을 포함한 다양한 개선 사항이 적용된 점진적 릴리스입니다.</p>
            <list>
                <li><code>invokedynamic</code>을 통한 문자열 연결과 같은 새로운 JVM 기능 지원</li>
                <li>Kotlin Multiplatform Mobile 프로젝트의 성능 및 예외 처리 개선</li>
                <li>JDK Path에 대한 확장 함수: <code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20의 새로운 기능</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.10</strong>
            <p>릴리스 일자: <strong>2020년 9월 7일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.10" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.0을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a>에 대해 자세히 알아보세요.</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p>릴리스 일자: <strong>2020년 8월 17일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>주로 품질과 성능에 중점을 둔 다양한 기능 및 개선 사항이 포함된 기능 릴리스입니다.</p>
            <p>자세한 내용은 다음을 참고하세요.</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">릴리스 블로그 게시물</a></li>
                <li><a href="whatsnew14.md" target="_blank">Kotlin 1.4.0의 새로운 기능</a></li>
                <li><a href="compatibility-guide-14.md" target="_blank">호환성 가이드</a></li>
                <li><a href="whatsnew14.md#migrating-to-kotlin-1-4-0" target="_blank">Kotlin 1.4.0으로 마이그레이션하기</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.3.72</strong>
            <p>릴리스 일자: <strong>2020년 4월 15일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>Kotlin 1.3.70을 위한 버그 수정 릴리스입니다.</p>
            <p><a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a>에 대해 자세히 알아보세요.</p>
        </td>
    </tr>
</table>