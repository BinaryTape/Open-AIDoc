[//]: # (title: マルチプラットフォーム向けのKotlinライブラリの構築)

Kotlinライブラリを作成する際は、[Kotlin Multiplatformのサポートを含めてビルドおよび公開する](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html)ことを検討してください。
これにより、ライブラリの対象読者が広がり、複数のプラットフォームをターゲットとするプロジェクトとの互換性が生まれます。

> [klibs.io](https://klibs.io/) では、さまざまなユースケースやターゲットプラットフォーム向けに、すでに利用可能なKotlin Multiplatformライブラリを見つけることができます。
> 
{style="tip"}

以下のセクションでは、Kotlin Multiplatformライブラリを効果的に構築するためのガイドラインを提供します。

## リーチを最大化する

ライブラリを依存関係として可能な限り多くのプロジェクトで利用可能にするために、できるだけ多くのKotlin Multiplatformの[ターゲットプラットフォーム](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html#targets)をサポートすることを目指してください。

ライブラリが、マルチプラットフォームプロジェクト（ライブラリかアプリケーションかを問わず）で使用されているプラットフォームをサポートしていない場合、そのプロジェクトがあなたのライブラリに依存することは難しくなります。その場合、プロジェクトは一部のプラットフォームにはあなたのライブラリを使用し、他のプラットフォームには別のソリューションを実装する必要があるか、すべてのプラットフォームをサポートする別の代替ライブラリを選択することになります。

アーティファクトの生成を効率化するために、[クロスコンパイル](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html#host-requirements)を使用して、任意のホストからKotlin Multiplatformライブラリを公開してください。これにより、AppleのマシンがなくてもAppleターゲット向けの `.klib` アーティファクトを生成できます。

> Kotlin/Nativeターゲットについては、考えられるすべてのターゲットをサポートするために[階層化アプローチ（tiered approach）](native-target-support.md#for-library-authors)の使用を検討してください。
>
{style="note"}

## 共通コードから使用するためのAPI設計

ライブラリを作成する際は、プラットフォーム固有の実装を書くのではなく、共通のKotlinコードから使用できるようにAPIを設計してください。

可能であれば適切なデフォルト設定を提供し、プラットフォーム固有の設定オプションも含めてください。優れたデフォルト設定があれば、ユーザーはライブラリを構成するためにプラットフォーム固有の実装を書くことなく、共通のKotlinコードからライブラリのAPIを使用できるようになります。

以下の優先順位に従って、関連する最も広範なソースセットにAPIを配置してください：

* **`commonMain` ソースセット:** `commonMain` ソースセット内のAPIは、ライブラリがサポートするすべてのプラットフォームで利用可能です。ライブラリのAPIの大部分をここに配置することを目指してください。
* **中間ソースセット:** 一部のプラットフォームが特定のAPIをサポートしていない場合は、[中間ソースセット](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-discover-project.html#intermediate-source-sets)を使用して特定のプラットフォームをターゲットにします。例えば、マルチスレッドをサポートするターゲット向けの `concurrent` ソースセットや、すべての非JVMターゲット向けの `nonJvm` ソースセットを作成できます。
* **プラットフォーム固有のソースセット:** プラットフォーム固有のAPIについては、 `androidMain` のようなソースセットを使用します。

> Kotlin Multiplatformプロジェクトのソースセットの詳細については、[階層的プロジェクト構造](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-hierarchy.html)を参照してください。
>
{style="tip"}

## プラットフォーム間での動作の一貫性の確保

ライブラリがサポートされているすべてのプラットフォームで一貫して動作するように、マルチプラットフォームライブラリのAPIは、すべてのプラットフォームで同じ範囲の有効な入力を受け入れ、同じアクションを実行し、同じ結果を返す必要があります。同様に、ライブラリは無効な入力を一律に扱い、すべてのプラットフォームで一貫してエラーを報告したり例外をスローしたりする必要があります。

不整合な動作はライブラリを使いにくくし、ユーザーがプラットフォーム固有の違いを管理するために共通コードに条件分岐ロジックを追加することを強いることになります。

[`expect` および `actual` 宣言](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html)を使用して、各プラットフォームのネイティブAPIにフルアクセスできるプラットフォーム固有の実装を持つ関数を共通コードで宣言できます。これらの実装も、共通コードから確実に使用できるように同じ動作をする必要があります。

APIがプラットフォーム間で一貫して動作する場合、それらは `commonMain` ソースセットで一度ドキュメント化するだけで済みます。

> 一方のプラットフォームがより広範な入力セットをサポートしている場合など、プラットフォームの違いが避けられない場合は、可能な限りそれらを最小限に抑えてください。例えば、他のプラットフォームに合わせるために、あるプラットフォームの機能を制限したくない場合もあるでしょう。そのような場合は、具体的な違いを明確にドキュメント化してください。
>
> {style=”note”}

## すべてのプラットフォームでテストする

マルチプラットフォームライブラリでは、すべてのプラットフォームで実行される共通コードで記述された[マルチプラットフォームテスト](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-run-tests.html)を持つことができます。サポートされているプラットフォームでこの共通テストスイートを定期的に実行することで、ライブラリが正しく一貫して動作することを確認できます。

公開されているすべてのプラットフォームで定期的にKotlin/Nativeターゲットをテストすることは困難な場合があります。しかし、より広い互換性を確保するために、互換性をテストする際に[階層化手法](native-target-support.md#for-library-authors)を使用して、サポート可能なすべてのターゲットに対してライブラリを公開することを検討してください。

[`kotlin-test`](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリを使用して共通コードでテストを記述し、プラットフォーム固有のテストランナーで実行してください。

## Kotlin以外のユーザーを考慮する

Kotlin Multiplatformは、サポートされているターゲットプラットフォーム全体でネイティブAPIや言語との相互運用性を提供します。Kotlin Multiplatformライブラリを作成する際は、ユーザーがあなたのライブラリの型や宣言をKotlin以外の言語から使用する必要があるかどうかを検討してください。

例えば、ライブラリの一部の型が相互運用性を通じてSwiftコードに公開される場合、それらの型をSwiftから簡単にアクセスできるように設計してください。[Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)は、Swiftから呼び出されたときにKotlin APIがどのように見えるかについて役立つ洞察を提供します。

## ライブラリのプロモーション

あなたのライブラリを、開発者がKotlin Multiplatformライブラリを検索・評価するための検索プラットフォームである [klibs.io](https://klibs.io/) に掲載できます。

[klibs.io](https://klibs.io/) は、掲載基準を満たすライブラリを自動的にリストアップします。あなたのライブラリが該当するかどうかを確認するには、[FAQ](https://klibs.io/faq) を参照してください。