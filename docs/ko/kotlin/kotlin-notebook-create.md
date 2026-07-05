[//]: # (title: 첫 번째 Kotlin Notebook 만들기)

> IntelliJ IDEA 2026.2부터 Kotlin Notebook은 더 이상 IDE에 포함되지 않으며 JetBrains에서 공식적으로 지원하지 않습니다.
> 소스 코드는 [GitHub](https://github.com/Kotlin/kotlin-notebook)에서 계속 확인할 수 있습니다.
>
> 자세한 내용은 [블로그 포스트](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)에서 확인하세요.
>
{style="note"}

<tldr>
   <p>이 문서는 <strong>Kotlin Notebook 시작하기</strong> 튜토리얼의 두 번째 파트입니다. 진행하기 전에 이전 단계를 완료했는지 확인하세요.</p>
   <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="kotlin-notebook-set-up-env.md">환경 설정</a><br/>
      <img src="icon-2.svg" width="20" alt="Second step"/> <strong>Kotlin Notebook 만들기</strong><br/>
      <img src="icon-3-todo.svg" width="20" alt="Third step"/> Kotlin Notebook에 의존성 추가하기<br/>
  </p>
</tldr>

[Kotlin Notebook](kotlin-notebook-overview.md)을 시작하는 세 가지 주요 방법이 있습니다.

* [Kotlin Notebook을 포함하는 새 프로젝트 생성하기](#create-a-new-project) 
* [기존 프로젝트에 Kotlin Notebook 추가하기](#add-a-new-kotlin-notebook-to-your-project)
* [스크래치 Kotlin Notebook 생성하기](#create-a-scratch-kotlin-notebook)

## 새 프로젝트 생성하기

Kotlin Notebook을 포함하는 새 프로젝트를 생성하려면:

1. IntelliJ IDEA 시작 화면에서 왼쪽 패널의 **Kotlin Notebook** | **New Notebook**을 선택합니다.
2. 새 노트북의 **Name**(이름)을 입력하고 **Type** | **In Folder**를 선택합니다.
   * **Scratch:** 프로젝트에 추가하지 않고 스크래치 노트북을 생성하는 옵션입니다.
   * **In Folder:** 프로젝트 내에 노트북을 생성하는 옵션입니다. 프로젝트의 위치를 지정해야 합니다.
3. **Create**를 클릭합니다.

![IntelliJ IDEA에서 새 Kotlin Notebook 만들기](create-notebook-welcome.png){width=700}

새 프로젝트 내에 새로운 Kotlin Notebook이 생성됩니다.

또는, 빈 프로젝트를 생성한 후 [Kotlin Notebook을 추가](#add-a-new-kotlin-notebook-to-your-project)할 수도 있습니다.

1. IntelliJ IDEA에서 **File | New | Project**를 선택합니다.
2. 왼쪽 패널에서 **New Project**를 선택합니다. 
3. 새 프로젝트의 이름을 지정하고 필요한 경우 위치를 변경합니다.

   > 새 프로젝트를 버전 관리 시스템에 추가하려면 **Create Git repository** 체크박스를 선택하세요. 
   > 이 작업은 나중에 언제든지 수행할 수 있습니다.
   > 
   {style="tip"}

4. **Language** 목록에서 **Kotlin**을 선택합니다.

   ![새 Kotlin Notebook 프로젝트 생성](new-notebook-project.png){width=700}

5. **IntelliJ** 빌드 시스템을 선택합니다.
6. **JDK** 목록에서 프로젝트에 사용할 [JDK](https://www.oracle.com/java/technologies/downloads/)를 선택합니다.
7. `"Hello World!"` 애플리케이션 샘플 코드가 포함된 파일을 생성하려면 **Add sample code** 옵션을 활성화합니다.

   > **Generate code with onboarding tips** 옵션을 활성화하여 샘플 코드에 유용한 추가 설명을 포함할 수도 있습니다.
   > 
   {style="tip"}

8. **Create**를 클릭합니다.

프로젝트가 생성되면 새로운 Kotlin Notebook을 추가합니다(다음 섹션 참조).

## 프로젝트에 새로운 Kotlin Notebook 추가하기

기존 프로젝트에 새로운 Kotlin Notebook을 추가하려면: 

1. **File | New | Kotlin Notebook**을 선택하거나, 폴더를 마우스 오른쪽 버튼으로 클릭하고 **New | Kotlin Notebook**을 선택합니다.

   ![새 Kotlin Notebook 만들기](new-notebook.png){width=700}

2. 새 노트북의 이름을 설정합니다(예: **first-notebook**).
3. **Enter**를 누릅니다. **first-notebook.ipynb**라는 Kotlin Notebook 파일이 새 탭에서 열립니다.

## 스크래치 Kotlin Notebook 생성하기

스크래치 파일로 Kotlin Notebook을 생성할 수도 있습니다. [스크래치 파일](https://www.jetbrains.com/help/idea/scratches.html#create-scratch-file)을 사용하면 새 프로젝트를 생성하거나 기존 프로젝트를 수정하지 않고도 짧은 코드를 테스트할 수 있습니다.

스크래치 Kotlin Notebook을 생성하려면:

1. **File | New | Scratch File**을 클릭합니다.
2. **New Scratch File** 목록에서 **Kotlin Notebook**을 선택합니다.

   ![스크래치 노트북](kotlin-notebook-scratch-file.png){width=400}

## 기본 작업 수행하기

1. 새로운 Kotlin Notebook의 코드 셀에 다음 코드를 입력합니다.

   ```kotlin
   println("Hello, this is a Kotlin Notebook!")
   ```

2. 코드 셀을 실행하려면 **Run Cell and Select Below** ![Run Cell and Select Below](run-cell-and-select-below.png){width=30}{type="joined"} 버튼을 클릭하거나 **Shift** + **Return**을 누릅니다.
3. **Add Markdown Cell** 버튼을 클릭하여 마크다운 셀을 추가합니다.
4. 셀에 `# Example operations`를 입력하고, 코드 셀을 실행할 때와 동일한 방식으로 실행하여 렌더링합니다.
5. 새 코드 셀에 `10 + 10`을 입력하고 실행합니다.
6. 코드 셀에 변수를 정의합니다. 예를 들어, `val a = 100`.

   > 변수가 정의된 코드 셀을 실행하면 해당 변수는 다른 모든 코드 셀에서 접근할 수 있게 됩니다.
   >
   {style="tip"}

7. 새 코드 셀을 만들고 `println(a * a)`를 추가합니다.
8. **Run All** ![Run all button](run-all-button.png){width=30}{type="joined"} 버튼을 사용하여 노트북의 모든 코드 및 마크다운 셀을 실행합니다.

   ![첫 번째 노트북](first-notebook.png){width=700}

축하합니다! 방금 첫 번째 Kotlin Notebook을 만들고 사용해 보았습니다.

## 다음 단계

튜토리얼의 다음 파트에서는 Kotlin Notebook에 의존성을 추가하는 방법을 배웁니다.

**[다음 장으로 진행하기](kotlin-notebook-add-dependencies.md)**