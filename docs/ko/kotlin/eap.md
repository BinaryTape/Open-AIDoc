[//]: # (title: Kotlin Early Access Preview 참여하기)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>최신 Kotlin EAP 릴리스: <strong>%kotlinEapVersion%</strong></p>
</tldr>

Kotlin Early Access Preview(EAP)에 참여하여 최신 Kotlin 기능이 공식 릴리스되기 전에 미리 사용해 볼 수 있습니다.

매 언어(_2.x.0_) 및 툴링(_2.x.20_) 릴리스에 앞서, 실제 프로젝트에서 테스트하고 초기 피드백을 공유할 수 있도록 Early Access Preview(EAP) 빌드를 제공합니다.
Kotlin EAP 빌드는 일반적으로 다음 단계를 거칩니다:

| EAP 빌드 | 설명 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 향후 출시될 새로운 기능, 개선 사항 및 기타 주요 변경 사항의 첫 번째 세트를 선보입니다. 새로운 기능을 조기에 평가하고 피드백을 공유할 수 있는 기회를 제공합니다. |
| **Beta2** | 일반적으로 접수된 피드백을 기반으로 더 많은 기능과 개선 사항을 추가합니다. 모든 기능이 구현된(feature-complete) 상태로 다가오는 릴리스의 프리뷰를 이어가며, 이전에 도입된 기능을 더욱 성숙시킵니다. |
| **RC**    | 첫 번째 릴리스 후보(Release Candidate)입니다. Beta1 및 Beta2에서 제공된 변경 사항을 안정화하고 테스트 중 발견된 회귀(regression) 문제를 수정하는 데 중점을 둡니다. |
| **RC2**   | 릴리스를 마무리하고 최종 준비 상태를 확인하기 위한 중요한 수정 사항을 포함합니다. | 

발견한 버그는 이슈 트래커인 [YouTrack](https://kotl.in/issue)에 제보해 주시면 감사하겠습니다. 
대부분의 경우 최종 릴리스 전에 수정할 수 있으므로, 이슈가 해결될 때까지 다음 Kotlin 릴리스를 기다리지 않아도 됩니다. 

Early Access Preview에 참여하고 버그를 제보함으로써 Kotlin에 기여하고, [성장하는 Kotlin 커뮤니티](https://kotlinlang.org/community/)의 모든 이들을 위해 Kotlin을 더욱 발전시키는 데 도움을 줄 수 있습니다.

질문이 있거나 토론에 참여하고 싶다면 [Kotlin Slack의 #eap 채널](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)에 참여해 보세요. 
이 채널에서는 새로운 EAP 빌드에 대한 알림도 받을 수 있습니다.

**[Kotlin EAP 버전에 맞게 프로젝트 구성하기](configure-build-for-eap.md)**

> EAP에 참여함으로써 귀하는 EAP 버전이 안정적이지 않을 수 있고, 의도한 대로 작동하지 않을 수 있으며, 오류를 포함할 수 있음을 명시적으로 인정합니다.
>
> 동일한 릴리스의 EAP 버전과 최종 버전 간의 호환성은 보장되지 않습니다. 
>
{style="note"}

## EAP를 통해 Kotlin 생산성을 높이는 방법 {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **안정화(Stable) 릴리스 대비**. 복잡한 멀티모듈 프로젝트를 다루고 있다면, EAP에 참여하여 안정화 릴리스 버전을 도입하는 과정을 간소화할 수 있습니다. 안정화 버전으로 빠르게 업데이트할수록 성능 개선 및 새로운 언어 기능의 이점을 더 일찍 누릴 수 있습니다. 

  규모가 크고 복잡한 프로젝트의 마이그레이션은 프로젝트 크기뿐만 아니라 Kotlin 팀에서 아직 다루지 못한 특정 사용 사례가 존재할 수 있어 시간이 걸릴 수 있습니다. EAP에 참여하여 새로운 Kotlin 버전을 지속적으로 테스트하면 특정 사용 사례에 대한 초기 피드백을 제공할 수 있습니다. 이를 통해 가능한 한 많은 문제를 사전에 해결하고 안정화 버전이 출시되었을 때 안전하게 업데이트할 수 있습니다. [Slack이 Android, Kotlin, Gradle 시험판 버전을 테스트하여 어떤 이점을 얻고 있는지 확인해 보세요](https://slack.engineering/shadow-jobs/).
* **라이브러리를 최신 상태로 유지**. 라이브러리 제작자라면 새로운 Kotlin 버전으로 업데이트하는 것이 매우 중요합니다. 이전 버전을 계속 사용할 경우 사용자가 자신의 프로젝트에서 Kotlin을 업데이트하는 데 걸림돌이 될 수 있습니다. EAP 버전을 사용하면 안정화 릴리스와 거의 동시에 라이브러리에서 최신 Kotlin 버전을 지원할 수 있어 사용자의 만족도를 높이고 라이브러리의 인기를 끌 수 있습니다.
* **경험 공유**. Kotlin에 열정을 가지고 교육용 콘텐츠를 제작하여 Kotlin 생태계에 기여하는 것을 즐긴다면, Kotlin EAP에서 새로운 기능을 미리 사용해 보고 새롭고 멋진 기능을 다룬 경험을 커뮤니티에 가장 먼저 공유할 수 있습니다.

## 빌드 세부 정보 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>빌드 정보</th>
        <th>빌드 주요 내용</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta2</strong>
            <p>릴리스 날짜: <strong>2026년 10월 21일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta2" target="_blank">GitHub 릴리스</a></p>
        </td>
        <td>
            <p>언어의 주요 변경 사항 및 툴링 업데이트가 포함된 언어 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta2">변경 로그(changelog)</a> 또는 <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta2의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
</table>