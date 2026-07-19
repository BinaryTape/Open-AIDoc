[//]: # (title: Kotlin 조기 액세스 프리뷰(EAP) 참여하기)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>최신 Kotlin EAP 릴리스: <strong>%kotlinEapVersion%</strong></p>
</tldr>

Kotlin 조기 액세스 프리뷰(Early Access Preview, EAP)에 참여하여 최신 Kotlin 기능이 정식 출시되기 전에 미리 사용해 볼 수 있습니다.

모든 언어(language, _2.x.0_) 및 도구(tooling, _2.x.20_) 릴리스 전에, 실제 프로젝트에서 테스트하고 조기 피드백을 공유할 수 있도록 조기 액세스 프리뷰(EAP) 빌드를 배포합니다.
Kotlin EAP 빌드는 일반적으로 다음과 같은 단계를 포함합니다:

| EAP 빌드 | 설명 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 곧 출시될 기능, 개선 사항 및 기타 주요 변경 사항의 첫 번째 세트를 도입합니다. 새로운 기능을 조기에 평가하고 피드백을 공유할 수 있는 기회를 제공합니다. |
| **Beta2** | 일반적으로 받은 피드백을 바탕으로 더 많은 기능과 개선 사항을 추가합니다. 기능이 완성된 상태(feature-complete)이며, 이전 버전에서 도입된 기능을 더욱 성숙시키면서 차기 릴리스의 프리뷰를 이어갑니다. |
| **RC**    | 첫 번째 출시 후보(release candidate)입니다. Beta1 및 Beta2에서 제공된 변경 사항을 안정화하고 테스트 중에 발견된 회귀(regression) 문제를 수정하는 데 중점을 둡니다. |
| **RC2**   | 릴리스를 마무리하고 준비 상태를 확인하기 위한 중요한 수정 사항이 포함됩니다. | 

이슈 트래커인 [YouTrack](https://kotl.in/issue)에서 버그를 찾아 보고해 주신다면 매우 감사하겠습니다. 
대부분의 경우 정식 출시 전에 수정될 수 있으며, 이는 여러분의 이슈를 해결하기 위해 다음 Kotlin 릴리스까지 기다릴 필요가 없음을 의미합니다. 

조기 액세스 프리뷰에 참여하고 버그를 보고함으로써 Kotlin에 기여하고, [성장하는 Kotlin 커뮤니티](https://kotlinlang.org/community/)의 모든 이들을 위해 Kotlin을 더 좋게 만드는 데 도움을 줄 수 있습니다.

질문이 있거나 논의에 참여하고 싶다면 [Kotlin Slack의 #eap 채널](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)에 가입해 주세요. 
이 채널에서는 새로운 EAP 빌드에 대한 알림도 받을 수 있습니다.

**[프로젝트에 Kotlin EAP 버전 설정하기](configure-build-for-eap.md)**

> EAP에 참여함으로써 귀하는 EAP 버전이 안정적이지 않을 수 있고, 의도한 대로 작동하지 않을 수 있으며, 오류가 포함될 수 있음을 명시적으로 인정하게 됩니다.
>
> 동일한 릴리스의 EAP 버전과 최종 버전 간의 호환성은 보장하지 않으므로 유의하시기 바랍니다. 
>
{style="note"}

## EAP가 Kotlin 생산성 향상에 도움이 되는 이유

* **안정(Stable) 버전 출시 준비**. 복잡한 멀티모듈 프로젝트에서 작업하는 경우, EAP에 참여하면 안정 버전을 채택할 때의 경험을 간소화할 수 있습니다. 안정 버전으로 더 빨리 업데이트할수록 해당 버전의 성능 향상 및 새로운 언어 기능을 더 일찍 활용할 수 있습니다. 

  대규모의 복잡한 프로젝트를 마이그레이션하는 것은 프로젝트의 규모뿐만 아니라, 특정 유스케이스가 아직 Kotlin 팀에 의해 다루어지지 않았을 수 있기 때문에 시간이 걸릴 수 있습니다. EAP에 참여하고 지속적으로 Kotlin의 새 버전을 테스트함으로써, 특정 유스케이스에 대한 조기 피드백을 제공할 수 있습니다. 이는 가능한 한 많은 문제를 해결하는 데 도움이 되며, 정식 출시 시 안전하게 안정 버전으로 업데이트할 수 있도록 보장합니다. [Slack이 Android, Kotlin 및 Gradle 프리릴리스 버전을 테스트하여 얻은 이점](https://slack.engineering/shadow-jobs/)을 확인해 보세요.
* **라이브러리를 최신 상태로 유지**. 라이브러리 제작자라면 새로운 Kotlin 버전으로 업데이트하는 것이 매우 중요합니다. 이전 버전을 계속 사용하면 사용자가 자신의 프로젝트에서 Kotlin을 업데이트하는 데 방해가 될 수 있습니다. EAP 버전을 사용하면 안정 버전 출시와 거의 동시에 라이브러리에서 최신 Kotlin 버전을 지원할 수 있으므로, 사용자의 만족도를 높이고 라이브러리의 인기를 더 높일 수 있습니다.
* **경험 공유**. Kotlin 애호가로서 교육 콘텐츠 제작을 통해 Kotlin 생태계에 기여하는 것을 즐긴다면, Kotlin EAP에서 새로운 기능을 먼저 사용해 보고 커뮤니티에 새로운 멋진 기능의 사용 경험을 가장 먼저 공유할 수 있습니다.

## 빌드 상세 정보 (Build details)

<!--
_No preview versions are currently available._
-->

<table>
    <tr>
        <th>빌드 정보 (Build info)</th>
        <th>빌드 주요 내용 (Build highlights)</th>
    </tr>
    <tr>
        <td><strong>2.4.20-Beta1</strong>
            <p>출시일: <strong>2026년 6월 24일</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1" target="_blank">GitHub에서 릴리스 보기</a></p>
        </td>
        <td>
            <p>성능 개선, 버그 수정 및 도구 업데이트가 포함된 도구(tooling) 릴리스입니다.</p>
            <p>자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1">변경 로그(changelog)</a> 또는 <a href="whatsnew-eap.md">Kotlin 2.4.20-Beta1의 새로운 기능</a>을 참고하세요.</p>
        </td>
    </tr>
</table>