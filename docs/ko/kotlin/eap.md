[//]: # (title: Kotlin Early Access Preview 참여하기)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>최신 Kotlin EAP 릴리스: <strong>%kotlinEapVersion%</strong></p>
</tldr>

Kotlin Early Access Preview(EAP)에 참여하여 최신 Kotlin 기능이 정식 출시되기 전에 미리 사용해 볼 수 있습니다.

언어(_2.x.0_) 및 도구(_2.x.20_)의 모든 릴리스 전에, 실제 프로젝트에서 테스트하고 초기 피드백을 공유할 수 있도록 Early Access Preview(EAP) 빌드를 제공합니다.
Kotlin EAP 빌드는 일반적으로 다음 단계로 구성됩니다:

| EAP 빌드 | 설명 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 향후 제공될 기능, 개선 사항 및 기타 중요한 변경 사항의 첫 번째 세트를 도입합니다. 새로운 기능을 조기에 평가하고 피드백을 공유할 기회를 제공합니다. |
| **Beta2** | 일반적으로 접수된 피드백을 바탕으로 더 많은 기능과 개선 사항을 추가합니다. 기능이 완성(feature-complete)된 상태이며, 예정된 릴리스의 프리뷰를 이어가면서 이전에 도입된 기능을 더욱 완성도 있게 다듬습니다. |
| **RC**    | 첫 번째 릴리스 후보(release candidate)입니다. Beta1 및 Beta2에서 제공된 변경 사항을 안정화하고 테스트 중에 발견된 회귀 버그(regression)를 수정하는 데 중점을 둡니다. |
| **RC2**   | 릴리스를 마무리하고 준비 상태를 확인하기 위한 중요한 수정 사항을 포함합니다. | 

발견한 버그는 이슈 트래커인 [YouTrack](https://kotl.in/issue)에 제보해 주시면 감사하겠습니다. 
대부분의 경우 최종 릴리스 전에 버그를 수정할 수 있으므로, 다음 Kotlin 릴리스까지 기다리지 않고도 이슈를 해결할 수 있습니다. 

Early Access Preview에 참여하고 버그를 제보함으로써 Kotlin에 기여할 수 있으며, [성장하는 Kotlin 커뮤니티](https://kotlinlang.org/community/)의 모든 사람을 위해 Kotlin을 더 나은 언어로 만드는 데 도움을 줄 수 있습니다.

궁금한 점이 있거나 논의에 참여하고 싶다면 언제든지 [Kotlin Slack의 #eap 채널](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)에 참여해 주세요. 
이 채널에서는 새로운 EAP 빌드에 대한 알림도 받을 수 있습니다.

**[Kotlin EAP 버전을 사용하도록 프로젝트 설정](configure-build-for-eap.md)**

> EAP에 참여함으로써 귀하는 EAP 버전이 안정적이지 않을 수 있고, 의도한 대로 작동하지 않을 수 있으며, 오류가 포함될 수 있음을 명시적으로 인정합니다.
>
> 동일한 릴리스의 EAP 버전과 최종 버전 간의 호환성은 보장되지 않습니다. 
>
{style="note"}

## EAP를 통해 Kotlin 생산성을 높이는 방법 {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **Stable(안정화) 릴리스 준비**. 복잡한 멀티모듈 프로젝트를 진행 중이라면, EAP에 참여함으로써 향후 Stable 릴리스 버전을 도입할 때의 경험을 간소화할 수 있습니다. Stable 버전으로 더 일찍 업데이트할수록 성능 개선 사항과 새로운 언어 기능을 더 빠르게 활용할 수 있습니다. 

  거대하고 복잡한 프로젝트의 마이그레이션은 프로젝트 규모 때문만이 아니라, 특정 사용 사례가 Kotlin 팀에 의해 아직 다뤄지지 않았을 수도 있어 시간이 걸릴 수 있습니다. EAP에 참여하여 새로운 Kotlin 버전을 지속적으로 테스트하면, 본인의 구체적인 사용 사례에 대한 피드백을 조기에 제공할 수 있습니다. 이는 가능한 한 많은 문제를 해결하고 정식 출시 시 안전하게 Stable 버전으로 업데이트할 수 있도록 보장하는 데 도움이 됩니다. [Slack이 Android, Kotlin, Gradle 프리릴리스 버전을 테스트하여 어떻게 이점을 얻고 있는지 확인해 보세요](https://slack.engineering/shadow-jobs/).
* **라이브러리를 최신 상태로 유지**. 라이브러리 개발자라면 새로운 Kotlin 버전으로 업데이트하는 것이 매우 중요합니다. 이전 버전을 계속 사용하면 사용자가 자신의 프로젝트에서 Kotlin을 업데이트하지 못하게 막을 수 있습니다. EAP 버전을 활용하면 라이브러리에서 최신 Kotlin 버전을 Stable 릴리스와 거의 동시에 지원할 수 있어, 사용자 만족도를 높이고 라이브러리의 인기도를 높일 수 있습니다.
* **경험 공유**. Kotlin에 열정을 가지고 교육용 콘텐츠를 제작하여 Kotlin 생태계에 기여하는 것을 즐긴다면, Kotlin EAP에서 새로운 기능을 사용해 봄으로써 새롭고 멋진 기능을 사용한 경험을 커뮤니티에 가장 먼저 공유할 수 있습니다.

## 빌드 세부 정보 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>빌드 정보</th>
        <th>빌드 주요 내용</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta1</strong>
            <p>출시일: <strong>2026년 9월 23일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1" target="_blank">GitHub에서 릴리스 보기</a></p>
        </td>
        <td>
            <p>언어의 주요 변경 사항 및 도구 업데이트가 포함된 언어 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1">변경 로그(changelog)</a> 또는 <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta1의 새로운 기능</a>을 참조하세요.</p>
        </td>
    </tr>
</table>