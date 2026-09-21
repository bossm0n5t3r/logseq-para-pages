# PARA Pages

[English](./README.en.md) · 한국어

Logseq에서 `/para` 슬래시 명령어로 PARA 페이지를 만들고,
현재 커서 위치에 일반 페이지 링크(`[[page-name]]`)를 삽입하는 Logseq Desktop 플러그인입니다.

> **지원 환경:** Logseq Desktop의 파일 그래프(Markdown)를 지원합니다. DB 그래프와 웹 버전은 지원하지 않습니다.

## 주요 기능

- `/para` 슬래시 명령어로 PARA 페이지 생성
- Project / Area / Resource / Archive 카테고리 선택 UI 제공
- 숫자 키 `1`, `2`, `3`, `4`로 빠른 카테고리 선택
- 현재 페이지가 PARA 디렉토리 안에 있으면 해당 카테고리 자동 선택
- 선택한 카테고리의 PARA 디렉토리에 Markdown 파일 생성
- 생성/이동/기존 페이지에 `para:: <kind>` 페이지 프로퍼티 추가
- 이미 `para:: ...` 프로퍼티가 있으면 중복 추가하지 않음
- Logseq 기본 `pages` 디렉토리에 먼저 생성된 파일이 있으면 PARA 디렉토리로 이동 시도
- 페이지가 Logseq에 인덱싱되면 현재 커서 위치에 `[[page-name]]` 링크 삽입

## 로컬 설치

소스에서 직접 실행하려면 [Bun](https://bun.sh/)이 필요합니다. 프로젝트를 로컬에 받은 뒤 의존성을 설치하고 플러그인 번들을 빌드합니다.

```bash
git clone https://github.com/bossm0n5t3r/logseq-para-pages.git
cd logseq-para-pages
bun install
bun run build
```

> `index.html`은 `dist/index.js`를 로드합니다.
> 소스 변경사항을 Logseq에서 확인하려면 `bun run build`를 실행한 뒤 플러그인을 다시 로드하세요.

Logseq Desktop의 `Settings` → `Advanced`에서 `Developer mode`를 활성화합니다.

<img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/settings-advanced-enable-developer-mode.png" alt="Logseq 고급 설정의 개발자 모드" width="720" />

그런 다음 `Plugins` 화면에서 `Load unpacked plugin`을 누르고 이 프로젝트 폴더를 선택합니다.

<img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/plugins-load-unpacked-plugin.png" alt="Logseq의 압축 해제된 플러그인 불러오기 화면" width="720" />

## 사용 방법

1. Logseq 블록에서 `/para`를 입력합니다.
2. 슬래시 명령어 목록에서 `PARA: Create Page`를 실행합니다.

   <img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-0.png" alt="PARA 슬래시 명령어 검색 결과" width="500" />

3. PARA 카테고리를 선택합니다.

   - `1` = Project
   - `2` = Area
   - `3` = Resource
   - `4` = Archive
   - `Esc` = 취소

   현재 페이지가 `01-projects`, `02-areas`, `03-resources`, `04-archive` 같은 PARA 디렉토리 안에 있으면 카테고리가
   자동으로 선택되고 페이지 이름 입력 단계로 바로 이동합니다. 자동 선택된 카테고리를 바꾸려면 `Change category`를 누릅니다.

   <img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-1.png" alt="PARA 카테고리 선택 창" width="500" />

   <img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-5.png" alt="현재 PARA 카테고리 자동 선택 화면" width="500" />

4. 페이지 이름을 입력하고 `Create`를 누릅니다.

   <img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-2.png" alt="PARA 페이지 이름 입력 창" width="500" />

5. 플러그인이 Markdown 파일을 준비한 뒤 현재 커서 위치에 링크를 삽입합니다.

   <img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-4.png" alt="현재 블록에 삽입된 Logseq 페이지 링크" width="300" />

## 생성 예시

Project를 선택하고 페이지 이름으로 `my-project`를 입력하면 기본 설정 기준으로 아래 파일이 생성됩니다.

```text
01-projects/my-project.md
```

파일 내용은 Markdown 기준으로 아래와 같습니다.

```markdown
para:: project
```

페이지가 준비되면 현재 블록에는 아래 링크가 삽입됩니다.

```markdown
[[my-project]]
```

이미 같은 페이지 파일이 있거나 Logseq 기본 `pages` 디렉토리에서 PARA 디렉토리로 이동된 파일도 `para:: ...` 프로퍼티가 없으면 자동으로 추가됩니다.

<img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/command-3.png" alt="PARA 페이지 이름 입력 예시" width="500" />

| 선택     | 입력 페이지 이름 | 생성/이동 대상 파일           | 삽입 링크         | 추가 프로퍼티     |
| -------- | ---------------- | ----------------------------- | ----------------- | ----------------- |
| Project  | `my-project`     | `01-projects/my-project.md`   | `[[my-project]]`  | `para:: project`  |
| Area     | `my-area`        | `02-areas/my-area.md`         | `[[my-area]]`     | `para:: area`     |
| Resource | `my-resource`    | `03-resources/my-resource.md` | `[[my-resource]]` | `para:: resource` |
| Archive  | `old-page`       | `04-archive/old-page.md`      | `[[old-page]]`    | `para:: archive`  |

`name.md`처럼 `.md` 확장자를 입력해도 실제 파일명과 삽입 링크에서는 확장자가 제거됩니다.

> 현재는 Command Palette가 아닌 `/para` 슬래시 명령어만 지원합니다.

## 설정

Logseq 플러그인 설정에서 PARA 디렉토리 이름을 변경할 수 있습니다.

<img src="https://raw.githubusercontent.com/bossm0n5t3r/logseq-para-pages/master/assets/images/plugins-setting.png" alt="PARA Pages 플러그인 설정" width="720" />

기본값은 아래와 같습니다.

```json
{
  "projectsDir": "01-projects",
  "areasDir": "02-areas",
  "resourcesDir": "03-resources",
  "archiveDir": "04-archive"
}
```

각 설정값은 현재 그래프 루트를 기준으로 하는 상대 디렉토리입니다.

## 개발

```bash
bun install
bun test
bun run typecheck
bun run build
```

빌드 후 Logseq에서 이 프로젝트 폴더를 플러그인으로 불러오세요. 코드 변경사항을 반영하려면 다시 빌드한 뒤 플러그인을 다시 로드하세요.

### 구현 메모

- PARA 프로퍼티 Markdown 생성/수정 로직은 `src/para-metadata.ts`에 있습니다.
- 새 파일 생성뿐 아니라 기존/이동된 파일에도 `para:: <kind>` 프로퍼티를 보강합니다.
- 문서 파일 생성 후 현재 편집 커서에 페이지 링크를 삽입하고, 커서 삽입 실패 시 원래 블록 끝에 링크를 추가합니다.
