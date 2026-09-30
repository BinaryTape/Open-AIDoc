# 기여하기

라이브러리를 작고 안정적으로 유지하기 위해, 기여는 버그 수정, 문서 개선, 테스트 개선으로 제한해 주세요.

[help wanted](https://github.com/coil-kt/coil/labels/help%20wanted) 태그가 붙은 이슈는 Coil에 기여를 시작하기에 좋은 이슈입니다.

새로운 기능에 대한 아이디어가 있다면, 논의할 수 있도록 [개선 요청을 생성](https://github.com/coil-kt/coil/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)하거나 외부 라이브러리로 구축해 주세요.

버그를 발견했다면, 저희가 살펴보고 수정할 수 있도록 실패하는 테스트 케이스를 제공해 주세요.

코드를 기여하고 싶다면, GitHub에서 저장소를 포크한 후 풀 리퀘스트를 보내면 됩니다.

코드를 제출할 때는 코드를 최대한 읽기 쉽게 유지할 수 있도록 기존 규칙과 스타일을 따르기 위해 최선을 다해 주세요. 또한 `./test.sh`를 실행하여 코드가 모든 테스트를 통과하는지 확인해 주세요.

API를 변경하는 경우, `./gradlew updateKotlinAbi`를 실행하고 변경된 모든 파일을 풀 리퀘스트에 포함해 주세요.

*OkHttp의 [기여하기](https://square.github.io/okhttp/contributing/) 섹션을 수정했습니다.*
