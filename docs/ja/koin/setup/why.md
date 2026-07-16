---
title: なぜ Koin なのか？
---

Koin は、あらゆる Kotlin アプリケーション（マルチプラットフォーム、Android、バックエンドなど）に、依存関係注入（Dependency Injection）を簡単かつ効率的に組み込む方法を提供します。

## Koin の目標

Koin の目標は以下の通りです。
- スマートな API で依存関係注入（DI）のインフラを**簡素化**する
- 読みやすく使いやすい **Kotlin DSL** により、あらゆる種類のアプリケーションを作成できるようにする
- **エコシステムの統合** - Android エコシステムから、Ktor のようなバックエンドのニーズまで、さまざまな統合を提供する
- **柔軟性** - アノテーションの使用・不使用にかかわらず利用可能

---

## Koin の概要

### Kotlin 開発を容易にし、生産性を向上させる

Koin は、ツールではなくアプリ自体に集中できるように設計された、スマートな Kotlin 依存関係注入ライブラリです。

```kotlin
class MyRepository()
class MyPresenter(val repository : MyRepository)

// 宣言するだけ
val myModule = module {
  singleOf(::MyPresenter)
  singleOf(::MyRepository)
}
```

Koin は、Kotlin 関連のテクノロジーをアプリケーションに構築・組み立てるためのシンプルなツールと API を提供し、ビジネスの容易なスケールを可能にします。

```kotlin
fun main() {

  // Koin を開始する
  startKoin {
    modules(myModule)
  }
}
```

---

## プラットフォームのサポート

### Android 対応

Kotlin 言語のおかげで、Koin は Android プラットフォームを拡張し、オリジナルのプラットフォームの一部として新機能を提供します。

```kotlin
class MyApplication : Application() {
  override fun onCreate() {
    super.onCreate()

    startKoin {
      androidLogger()
      androidContext(this@MyApplication)
      modules(myModule)
    }
  }
}
```

Koin は、`by inject()` や `by viewModel()` を使用するだけで、Android コンポーネントのどこからでも依存関係を取得できる、簡単で強力な API を提供します。

```kotlin
class MyActivity : AppCompatActivity() {

  val myPresenter : MyPresenter by inject()

}
```

:::info
**詳しく学ぶ**: [Android で Koin を開始する](/docs/reference/koin-android/start)
:::

### Kotlin Multiplatform を強力にサポート

モバイルプラットフォーム間でのコード共有は、Kotlin Multiplatform の主要なユースケースの 1 つです。Kotlin Multiplatform Mobile を使用すると、クロスプラットフォームのモバイルアプリケーションを構築し、Android と iOS で共通のコードを共有できます。

Koin はマルチプラットフォームの依存関係注入を提供し、ネイティブモバイルアプリケーションや Web/バックエンドアプリケーション全体でコンポーネントを構築するのを支援します。

:::info
**詳しく学ぶ**: [Koin を使用した Kotlin Multiplatform](/docs/reference/koin-mp/kmp)
:::

### パフォーマンスと生産性

Koin は純粋な Kotlin フレームワークであり、使用法と実行の両面で分かりやすく設計されています。使いやすく、コンパイル時間に影響を与えず、追加のプラグイン設定も必要ありません。

---

## Koin：依存関係注入フレームワーク

Koin は、Kotlin で人気の依存関係注入（DI）フレームワークであり、最小限のボイラープレートコードでアプリケーションの依存関係を管理するための、モダンで軽量なソリューションを提供します。

### 依存関係注入 vs. サービスロケーター

Koin はサービスロケーターパターンに似ているように見えるかもしれませんが、それとは一線を画す重要な違いがあります。

| 項目 | サービスロケーター | 依存関係注入 (Koin) |
|--------|----------------|----------------------------|
| **レジストリ** | 静的でグローバルなレジストリ | モジュール化されたスコープ付きコンテナ |
| **アクセス** | サービスを明示的にリクエスト | 依存関係が自動的に渡される |
| **テスト容易性** | モックやテストが困難 | 依存関係の差し替えが容易 |
| **結合** | フレームワークへの密な結合 | 疎結合、明示的な依存関係 |
| **ベストプラクティス** | モダンなアプリでは非推奨 | 業界標準のパターン |

:::note
**サービスロケーター**: サービスロケーターは、本質的に利用可能なサービスのレジストリであり、必要に応じてサービスのインスタンスをリクエストできます。多くの場合、静的でグローバルなレジストリを使用して、これらのインスタンスの作成と管理を担当します。

**依存関係注入**: 対照的に、Koin は純粋な依存関係注入フレームワークです。Koin では、モジュール内で依存関係を宣言し、Koin がオブジェクトの作成と接続（配線）を処理します。独自のスコープを持つ複数の独立したモジュールを作成できるため、依存関係管理がよりモジュール化され、潜在的な競合を回避できます。
:::

### Koin のアプローチ：柔軟性とベストプラクティスの融合

Koin は DI とサービスロケーター（SL）パターンの両方をサポートしており、開発者に柔軟性を提供します。しかし、DI、特に依存関係をコンストラクタ引数として渡す**コンストラクタ注入**の使用を**強く推奨**しています。このアプローチはテスト容易性を高め、コードの推論を容易にします。

```kotlin
// ✅ 推奨：コンストラクタ注入
class UserViewModel(
    private val repository: UserRepository,
    private val analytics: Analytics
) : ViewModel() {
    // 依存関係が明確でテスト可能
}

// ⚠️ 許容されるが非推奨：サービスロケーターパターン
class UserViewModel : ViewModel(), KoinComponent {
    private val repository: UserRepository by inject()
    private val analytics: Analytics by inject()
    // 依存関係が隠蔽されている
}
```

Koin の設計思想は、必要に応じて複雑な構成を可能にしながらも、**シンプルさとセットアップの容易さ**を中心に据えています。Koin を使用することで、開発者は依存関係を効果的に管理でき、ほとんどのシナリオで DI が推奨され、好まれるアプローチとなります。

:::info
**詳しく学ぶ**: DI の概念に関する完全なガイドについては、[依存関係注入の基本](/docs/setup/why)を参照してください。
:::

---

## 透明性と設計の概要

Koin は、依存関係注入（DI）とサービスロケーター（SL）パターンの両方をサポートする、汎用性の高い制御の反転（IoC）コンテナとして設計されています。Koin がどのように動作するかを明確に理解し、効果的に使用するためのガイドとして、以下の側面を探ってみましょう。

### Koin が DI と SL のバランスをどう取っているか

Koin は DI と SL の両方の要素を組み合わせており、それがフレームワークの使用方法に影響を与える場合があります。

1. **グローバルコンテキストの使用:** デフォルトでは、Koin はサービスロケーターのように機能する、グローバルにアクセス可能なコンポーネントを提供します。これにより、`KoinComponent` や `inject` 関数を使用して、中央レジストリから依存関係を取得できます。

2. **独立したコンポーネント:** Koin は依存関係注入（特にコンストラクタ注入）の使用を推奨していますが、独立したコンポーネントも許可しています。この柔軟性により、DI が最も理にかなっている場所では DI を使用するようにアプリケーションを構成しつつ、特定のケースでは SL を活用することができます。

3. **Android コンポーネントにおける SL:** Android 開発において、Koin はセットアップを容易にするために、`Application` や `Activity` などのコンポーネント内で内部的に SL を使用することがよくあります。この時点から、Koin はより構造化された方法で依存関係を管理するために、DI（特にコンストラクタ注入）を推奨します。ただし、これは強制ではなく、開発者は必要に応じて SL を使用する柔軟性を持っています。

### なぜこれが重要なのか

DI と SL の違いを理解することは、アプリケーションの依存関係を効果的に管理するのに役立ちます。

**依存関係注入 (推奨):**
- ✅ テスト容易性の向上
- ✅ 明示的な依存関係
- ✅ より明確なコード構造
- ✅ 業界のベストプラクティス

**サービスロケーター:**
- ⚠️ セットアップには便利
- ⚠️ 結合が密になる可能性がある
- ⚠️ 依存関係が隠蔽される
- ⚠️ テストが困難

:::warning
Koin は利便性のため、特に Android コンポーネントにおいて SL をサポートしていますが、**SL のみに依存すると、結合が密になりテスト容易性が低下する可能性があります**。Koin の設計はバランスの取れたアプローチを提供し、実用的な場所で SL を使用できるようにしながらも、**ベストプラクティスとして DI を推進しています**。
:::

---

## Koin を最大限に活用するために

Koin を効果的に使用するために：

### 1. ベストプラクティスに従う

依存関係管理のベストプラクティスに合わせるため、可能な限り**コンストラクタ注入**を使用してください。このアプローチにより、テスト容易性とメンテナンス性が向上します。

```kotlin
// ✅ 良い例
class UserService(private val api: UserApi, private val db: UserDatabase)

module {
    singleOf(::UserService)
}

// ❌ 避けるべき例
class UserService : KoinComponent {
    private val api: UserApi by inject()
    private val db: UserDatabase by inject()
}
```

### 2. Koin の柔軟性を活用する

セットアップを簡素化できるシナリオでは Koin の SL サポートを利用しますが、コアアプリケーションの依存関係の管理には DI に頼ることを目指してください。

### 3. ドキュメントと例を参照する

プロジェクトのニーズに基づいて DI と SL を適切に構成および使用する方法を理解するために、Koin のドキュメントと例を確認してください。

### 4. スコープを賢く使用する

Koin のスコープ機能を使用すると、アプリケーションの特定の部分に対して依存関係を分離できます。

```kotlin
module {
    scope<MyActivity> {
        scoped { MyActivityDependency() }
    }
}
```

:::info
**詳しく学ぶ**: スコープパターンの詳細については、[スコープ](/docs/reference/koin-core/scopes)を参照してください。
:::

---

## 次のステップ

準備はできましたか？プラットフォームを選択してください：

### セットアップガイド
- [Koin のセットアップ](/docs/setup/koin) - 全プラットフォーム向けの Gradle 設定
- [Koin Annotations のセットアップ](/docs/setup/annotations) - アノテーションベース DI のための KSP 設定

### はじめてのチュートリアル
- [Android と ViewModel](/docs/quickstart/android-viewmodel) - Koin を使用した Android アプリ開発の開始
- [Jetpack Compose](/docs/quickstart/android-compose) - Koin と Compose UI
- [Kotlin Multiplatform](/docs/reference/koin-mp/kmp) - プラットフォーム間でのコード共有
- [Ktor バックエンド](/docs/quickstart/ktor) - サーバーアプリケーションの構築

### コアコンセプト
- [依存関係注入の基本](/docs/setup/why) - DI の基本的な概念
- [コア機能](/docs/reference/koin-core/dsl) - Koin DSL とモジュールシステム
- [Android 統合](/docs/reference/koin-android/start) - Android 特有の機能

---

> このガイダンスを提供することで、Koin の機能と設計の選択肢を効果的にナビゲートし、依存関係管理のベストプラクティスを遵守しながら、その可能性を最大限に活用できるよう支援することを目指しています。