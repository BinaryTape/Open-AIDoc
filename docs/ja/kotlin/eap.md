[//]: # (title: Kotlin Early Access Preview への参加)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>最新の Kotlin EAP リリース: <strong>%kotlinEapVersion%</strong></p>
</tldr>

Kotlin Early Access Preview (EAP) に参加することで、リリース前の最新 Kotlin 機能をいち早く試すことができます。

すべての言語リリース（_2.x.0_）およびツールリリース（_2.x.20_）の前に、実際のプロジェクトでテストして早期フィードバックを共有していただくための Early Access Preview (EAP) ビルドを提供しています。
Kotlin EAP ビルドには、通常以下のステージが含まれます。

| EAP ビルド | 説明 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 今後追加される機能の第1弾、改善、その他の重要な変更が導入されます。新機能を早期に評価し、フィードバックを共有する機会を提供します。 |
| **Beta2** | 通常、受け取ったフィードバックに基づいて機能の追加や改良が行われます。機能としては完全（feature-complete）であり、リリース予定のプレビューを継続し、以前導入された機能をさらに成熟させます。 |
| **RC**    | 最初のリリース候補版（Release Candidate）。Beta1 および Beta2 で導入された変更の安定化や、テスト中に見つかったリグレッションの修正に重点を置きます。 |
| **RC2**   | リリースを確定し、準備が整っていることを確認するための重要な修正が含まれます。 | 

見つかったバグは、課題トラッカーである [YouTrack](https://kotl.in/issue) にご報告いただけると幸いです。
多くの場合、正式リリース前に修正できるため、問題が解決されるまで次の Kotlin リリースを待つ必要がなくなります。

Early Access Preview に参加してバグを報告することで、Kotlin に貢献し、[成長し続ける Kotlin コミュニティ](https://kotlinlang.org/community/)のすべての人のために Kotlin をより良いものにする手助けができます。

質問がある場合や議論に参加したい場合は、お気軽に [Kotlin Slack の #eap チャンネル](https://app.slack.com/client/T09229ZC6/C0KLZSCHF) にご参加ください。
このチャンネルでは、新しい EAP ビルドに関する通知を受け取ることもできます。

**[Kotlin EAP バージョン向けにプロジェクトを設定する](configure-build-for-eap.md)**

> EAP に参加することにより、EAP バージョンが信頼性に欠ける場合があること、意図したとおりに動作しない場合があること、およびエラーが含まれている可能性があることを明示的に認めるものとします。
>
> 同一リリースの EAP と正式バージョン間の互換性は保証されません。
>
{style="note"}

## EAP が Kotlin での生産性向上にどのように役立つか {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **安定版（Stable）リリースへの準備**。複雑なマルチモジュールプロジェクトで作業している場合、EAP に参加することで、安定版リリースバージョンを採用する際の移行作業がスムーズになります。安定版へのアップデートが早ければ早いほど、パフォーマンスの向上や新しい言語機能の恩恵をいち早く受けることができます。

  巨大で複雑なプロジェクトの移行には時間がかかることがあります。これは規模の大きさだけでなく、特定のユースケースが Kotlin チームによってまだカバーされていない可能性があるためでもあります。EAP に参加し、Kotlin の新しいバージョンを継続的にテストすることで、特定のユースケースに関する早期フィードバックを提供できます。これにより、可能な限り多くの問題に対処し、正式リリース時に安全に安定版へアップデートできるようになります。[Slack が Android、Kotlin、Gradle のプレリリース版のテストからどのような恩恵を受けているかをご覧ください](https://slack.engineering/shadow-jobs/)。
* **ライブラリを最新の状態に維持**。ライブラリの作者であれば、新しい Kotlin バージョンへの対応は極めて重要です。古いバージョンを使用し続けると、ユーザーが自身のプロジェクトで Kotlin をアップデートするのを妨げてしまう可能性があります。EAP バージョンで作業することで、安定版のリリースとほぼ同時にライブラリで最新の Kotlin バージョンをサポートできるようになり、ユーザーの満足度が向上し、ライブラリの人気も高まります。
* **知見や体験の共有**。あなたが Kotlin の愛好家で、教育用コンテンツの作成などを通じて Kotlin エコシステムに貢献したいと考えているなら、Kotlin EAP で新機能を試すことで、魅力的な新機能の使用体験をコミュニティへ誰よりも早く共有できます。

## ビルドの詳細 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>ビルド情報</th>
        <th>ビルドのハイライト</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta1</strong>
            <p>リリース日: <strong>2026年9月23日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1" target="_blank">GitHub でのリリース</a></p>
        </td>
        <td>
            <p>言語における主要な変更とツールのアップデートを含む言語リリースです。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1">変更履歴</a>または <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta1 の新機能</a>を参照してください。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.21-RC</strong>
            <p>リリース日: <strong>2026年9月30日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC" target="_blank">GitHub でのリリース</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.20 のバグ修正リリースです。</p>
            <p>詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC">変更履歴</a>を参照してください。</p>
        </td>
    </tr>
</table>