[//]: # (title: npm에 라이브러리 배포하기 – 튜토리얼)

<tldr>
<p><a href="https://npm-publish.petuska.dev/latest/">npm-publish Gradle 플러그인</a>을 사용하여 수동으로 또는 GitHub Actions를 통해 Kotlin Multiplatform 라이브러리를 npm에 배포해 보세요.</p>
</tldr>

라이브러리를 배포하려면 다음 단계가 필요합니다.

1. [npm 계정](https://docs.npmjs.com/creating-a-new-npm-user-account) 및 [액세스 토큰(Access Token)](https://docs.npmjs.com/creating-and-viewing-access-tokens)을 포함한 자격 증명 준비하기.
2. Kotlin Multiplatform 프로젝트에 배포 플러그인 설정하기.
3. 배포 플러그인에 자격 증명을 제공하거나 지속적 통합(CI)을 위한 Trusted Publisher(신뢰할 수 있는 게시자) 설정하기.
4. 수동으로 또는 CI를 사용하여 배포 작업(task) 실행하기.

이 튜토리얼에서는 GitHub를 사용하여 프로젝트를 호스팅하고 GitHub Actions를 통해 CI를 실행합니다.

## 샘플 라이브러리 {id="sample-library"}

[샘플 라이브러리 프로젝트](https://github.com/Kotlin/kotlin-multiplatform-web-library)를 참고하여 단계를 따라 진행하고 작동하는 설정을 확인할 수 있습니다.

코드를 재사용하는 경우, **모든 예제 값을 프로젝트에 맞는 값으로 변경**해야 합니다.

## 계정 및 자격 증명 준비하기 {id="prepare-accounts-and-credentials"}

npm에 배포하려면 [npm 포털에 로그인](https://www.npmjs.com/login)되어 있어야 합니다.

이 튜토리얼에서는 수동 배포를 구성하기 위해 조직(Organization)과 액세스 토큰이 필요합니다.

### 간단한 조직(Organization) 생성하기 {id="create-a-simple-organization"}

이 튜토리얼에서는 이름 충돌을 방지하기 위해 npm 조직 산하에 라이브러리를 배포합니다.

새 조직을 만들려면 [npm 문서](https://docs.npmjs.com/creating-an-organization)를 참고하세요.

### 액세스 토큰 생성하기 {id="generate-an-access-token"}

npm에 수동으로 배포하려면 새로 생성한 조직 아래에 패키지를 배포할 수 있는 권한을 가진 액세스 토큰이 필요합니다.
해당 토큰을 생성하려면 [npm 가이드](https://docs.npmjs.com/creating-and-viewing-access-tokens)를 참고하세요.

이 튜토리얼에서는 단순화된 보안 구성을 사용합니다.
* **Bypass two-factor authentication (2FA)** 옵션을 활성화합니다.
* 토큰의 일반 권한(General permissions)과 조직 권한(Organization permissions)을 모두 **Read and write**로 설정합니다.

## 라이브러리 프로젝트 구성하기 {id="configure-the-library-project"}

[샘플 프로젝트](https://github.com/Kotlin/kotlin-multiplatform-web-library)를 사용하는 경우, 배포하기 전에 기본 이름을 업데이트해야 합니다.
업데이트할 항목은 다음과 같습니다.

* 라이브러리 모듈의 이름.
* `settings.gradle.kts` 파일에 설정된 프로젝트 이름.

이름을 설정한 후 다음 단계에 따라 배포 설정을 진행하세요.

### 배포 플러그인 설정하기 {id="set-up-the-publishing-plugin"}

이 튜토리얼에서는 npm 배포를 지원하기 위해 공식 [npm-publish 플러그인](https://github.com/Kotlin/npm-publish)을 사용합니다.
플러그인 및 사용 가능한 구성 옵션에 대한 자세한 내용은 [플러그인 문서](https://npm-publish.petuska.dev)를 참고하세요.

Kotlin Multiplatform 프로젝트에 플러그인을 추가합니다.

1. 라이브러리 모듈의 `build.gradle.kts` 파일을 엽니다.

2. `plugins {}` 블록에 다음 라인을 추가합니다.

    ```kotlin
    // <module directory>/build.gradle.kts
    
    plugins {
        kotlin("npm-publish") version "%npmPublishPlugin%"
    }
    ```
    
    > 플러그인의 최신 버전은 [Releases](https://github.com/Kotlin/npm-publish/releases) 페이지에서 확인하세요.
    > 
    {style="note"}

3. 다음 설정을 추가합니다.
   라이브러리에 맞게 값을 사용자 지정해야 합니다.
   필수 매개변수는 `organization`, `authToken`, `packageName`, `version`뿐입니다.
   나머지는 확장된 예시로 제공됩니다.

    ```kotlin
    // <module directory>/build.gradle.kts
    npmPublish {
        organization = "organization_name_without_the_@_sign"
        
        registries {
            npmjs {
                // 패키지를 배포하는 명령을 실행할 때
                // 이 환경 변수로 npm 토큰을 전달합니다
                authToken = System.getenv("NPM_TOKEN")
            }
        }
    
        packages {
            named("js") {
                version = "0.0.1"
                packageName = "greetings"
                readme = file("../README.md")
    
                packageJson {
                    license = "Apache 2.0"
                    homepage = "https://github.com/Kotlin/kotlin-multiplatform-web-library#readme"
                    description = "Shared Kotlin/JS Greetings library"
                    keywords = listOf("kotlin", "kotlin-js", "greetings", "shared", "api")
                    author {
                        name = "Kotlin Developer Advocate"
                        url = "https://github.com/kotlin-hands-on/"
                    }
                    contributors = listOf(
                        Person {
                            name = "John Smith"
                            email = "john.smith@example.com"
                            url = "https://github.com/johnsmith"
                        },
                    )
                    repository {
                        type = "git"
                        url = "https://github.com/Kotlin/kotlin-multiplatform-web-library.git"
                    }
                }
            }
        }
    }
    ```

    > 이를 구성하기 위해 [Gradle 속성(Gradle properties)](https://docs.gradle.org/current/userguide/build_environment.html)을 사용할 수도 있습니다.
    > 
    {style="tip"}

`npmPublish {}` 블록의 주요 설정은 다음과 같습니다.

* `organization` 매개변수와 `registries {}` 블록은 인증 세부 정보를 지정합니다.
  여기서는 기본 npm 레지스트리와 배포 작업을 실행할 때 토큰을 보유할 `NPM_TOKEN` 환경 변수 이름을 사용합니다.
* `packageName` 및 `version` 매개변수는 필수 패키지 옵션을 정의합니다.
  * `version` 매개변수를 생략하면 모듈의 버전을 기본값으로 사용합니다.
  * `packageName` 매개변수를 생략하면 모듈 이름을 기본값으로 사용합니다.
* `packageJson {}` 블록은 다양한 메타데이터를 담고 있습니다.

## 수동으로 배포하기 {id="publish-manually"}

수동 배포는 프로젝트 구조를 아직 실험 중이거나 배포 자동화를 직접 구현하려는 경우에 유용합니다.

이제 로컬 머신에서 라이브러리를 npm에 배포할 수 있습니다.
배포하려면 앞서 생성한 액세스 토큰을 `YOUR_ACCESS_TOKEN` 자리에 붙여넣고 다음 명령을 실행합니다.

```bash
NPM_TOKEN=YOUR_ACCESS_TOKEN ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

라이브러리가 배포되면 npm 레지스트리에서 확인할 수 있습니다.
개인 **Packages** 페이지가 아닌, npm 조직 페이지를 열고 **Packages** 탭을 확인하세요.

![npm에 배포된 라이브러리](published-on-npm.png){width=700}

### 문제 해결 {id="troubleshooting"}

수동 배포 시 자주 발생할 수 있는 몇 가지 문제입니다.

* `build.gradle.kts` 설정의 `version` 필드를 추적 관리하세요.
  npm은 동일하거나 이전 버전으로 이미 배포된 패키지가 있는 경우 배포에 실패합니다.
* 조직 범위(organization-scoped) 패키지에 사용할 토큰을 생성할 때는 일반 권한(General permissions)과 조직 권한(Organization permissions)을 **모두** 설정해야 합니다.

## 지속적 통합(CI)을 사용하여 배포하기 {id="publish-using-continuous-integration-ci"}

npm의 Trusted Publisher 메커니즘을 사용하면 OpenID Connect를 활용하여 CI를 빠르게 구성할 수 있습니다.
이 접근 방식을 사용하면 토큰을 직접 생성하고 관리할 필요가 완전히 사라집니다.

이 예제에서는 [GitHub Actions](https://docs.github.com/en/actions)를 사용하여 워크플로를 설정합니다.

### GitHub Actions 워크플로 파일 생성하기 {id="create-a-github-actions-workflow-file"}

GitHub Action을 설정하는 `.github/workflows/publish.yml` 파일을 생성합니다.

```yaml
# .github/workflows/publish.yml

name: Publish

on:
  release:
    types: [released, prereleased]

permissions:
  id-token: write  # GitHub Actions가 npm의 trusted publishing과
                   # 연동하는 데 필요함
  contents: read

jobs:
  publish:
    name: Release build and publish
    runs-on: ubuntu-latest
    steps:
      # 트리거된 브랜치 체크아웃
      - name: Check out code
        uses: actions/checkout@v4

      # Gradle 작업을 실행할 JDK 설정
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: 21

      # 라이브러리 모듈에 대한 배포 Gradle 작업 실행
      - name: Publish to npm
        run: ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

이 파일을 프로젝트를 호스팅하는 GitHub 저장소에 커밋하고 푸시하면, 해당 저장소에서 GitHub 릴리스(Release)를 생성할 때마다 워크플로가 실행됩니다.

> 저장소에 [태그가 푸시될 때 트리거](https://stackoverflow.com/a/61892639)되도록 워크플로를 구성할 수도 있습니다.
> 
{style="tip"}

### GitHub Actions를 Trusted Publisher로 설정하기 {id="set-up-github-actions-as-your-trusted-publisher"}

이제 워크플로를 저장소에 올렸으므로 GitHub Action을 npm 패키지의 [Trusted Publisher](https://docs.npmjs.com/trusted-publishers)로 추가할 수 있습니다.

1. [배포된 패키지](#수동으로-배포하기) 페이지를 엽니다.
2. **Settings** 탭을 열고 **Trusted Publisher** 섹션을 찾습니다.
3. **Select your publisher** 아래에서 **GitHub Actions** 버튼을 클릭합니다.
4. 양식을 작성합니다.
   * GitHub 사용자 이름 (또는 조직 이름)
   * 저장소(Repository) 이름
   * 워크플로 파일 이름 (이 튜토리얼에서는 [publish.yml](#github-actions-워크플로-파일-생성하기)을 사용했습니다).
5. **Setup connection** 버튼을 클릭합니다.

![GitHub Actions를 위한 npm Trusted Publisher 설정](npm-trusted-publisher-github.png)

> [npm은 제공된 좌표(정보)를 별도로 검증하지 않으므로](https://docs.npmjs.com/trusted-publishers#troubleshooting), 세부 정보를 올바르게 입력했는지 확인하세요.
> 
{style="warning"}

생성된 연결은 패키지 설정의 **Trusted Publishers** 섹션에 나열되며, 이는 지정된 좌표의 워크플로가 이제 npm에 배포할 수 있는 권한을 얻었음을 의미합니다.

### GitHub에서 릴리스(Release) 생성하기 {id="create-a-release-on-github"}

워크플로와 Trusted Publisher 연결이 설정되었으므로 이제 [GitHub 릴리스를 생성](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release)하여 배포를 트리거할 수 있습니다.

1. `build.gradle.kts` 설정에서 패키지 버전을 배포하려는 버전으로 지정합니다.

   > 버전 번호가 이미 사용 중이거나 이미 배포된 버전보다 낮으면 npm에서 배포를 허용하지 않습니다.
   > 
   {style="note"}

2. GitHub 저장소로 이동합니다.
3. 오른쪽 사이드바에서 **Releases**를 클릭합니다.
4. **Draft a new release** 버튼을 클릭합니다 (이 저장소에서 이전에 릴리스를 생성한 적이 없는 경우 **Create a new release** 버튼 클릭).
5. Git 태그를 생성하거나 선택합니다 (시스템 전반에서 일관된 넘버링을 유지하기 위해 가능하면 모듈 버전과 일치시키세요).
6. 릴리스 제목을 설정합니다 (태그와 동일하게 릴리스 이름을 지정하는 것이 편리합니다).
   
   모든 항목을 명확하게 추적하기 위해 태그의 버전을 `build.gradle.kts` 파일에 지정한 라이브러리의 버전 번호와 동일하게 유지하는 것이 좋습니다.

   ![GitHub에서 릴리스 생성하기](create-release-and-tag-for-npm.png){width=700}

7. **Publish release** 버튼을 클릭합니다.

Action이 트리거되었는지 확인하려면 GitHub 저장소 페이지 상단의 **Actions** 탭을 클릭하세요.
새로 게시된 릴리스로 인해 배포 워크플로가 실행된 것을 볼 수 있습니다.
워크플로를 클릭하면 배포 작업의 로그를 확인할 수 있습니다.

워크플로 실행이 완료되면 npm 레지스트리의 패키지 페이지에 새 버전의 패키지가 표시됩니다.

![CI/CD를 통해 npm에 배포된 라이브러리](published-second-version-on-npm.png){width=700}

## 다음 단계 {id="what-s-next"}

* [README에 shields.io 뱃지 추가하기](https://shields.io/badges/npm-version)
* [Dokka로 API 문서 생성하기](https://kotl.in/dokka)
* [Renovate를 사용하여 종속성 업데이트 자동화하기](https://docs.renovatebot.com/)
* [Kotlin Slack에서 커뮤니티와 라이브러리 공유하기](https://kotlinlang.slack.com/)
  (가입하려면 https://kotl.in/slack 방문)