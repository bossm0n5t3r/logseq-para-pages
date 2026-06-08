# logseq-para-pages

Logseq에서 `/para` slash command로 PARA 페이지를 만들고, 현재 커서 위치에 일반 페이지 링크(`[[page-name]]`)를 삽입하는 Logseq Desktop 플러그인입니다.

## 주요 기능

- `/para` slash command로 PARA 페이지 생성
- Project / Area / Resource / Archive 카테고리 선택 UI 제공
- 숫자 키 `1`, `2`, `3`, `4`로 빠른 카테고리 선택
- 현재 페이지가 PARA 디렉토리 안에 있으면 해당 카테고리 자동 선택
- 선택한 카테고리의 PARA 디렉토리에 Markdown 파일 생성
- 생성/이동/기존 페이지에 `para:: <kind>` 페이지 프로퍼티 추가
- 이미 `para:: ...` 프로퍼티가 있으면 중복 추가하지 않음
- Logseq 기본 `pages` 디렉토리에 먼저 생성된 파일이 있으면 PARA 디렉토리로 이동 시도
- 페이지가 Logseq에 인덱싱되면 현재 커서 위치에 `[[page-name]]` 링크 삽입

## 설치

프로젝트를 로컬에 받은 뒤 의존성을 설치하고 브라우저용 번들을 빌드합니다.

```bash
git clone https://codeberg.org/bossm0n5t3r/logseq-para-pages.git
cd logseq-para-pages
bun install
bun run build
```

> `index.html`은 `dist/index.js`를 로드합니다. 소스 변경 후 Logseq에서 다시 확인하려면 `bun run build`를 실행한 뒤 플러그인을 reload하세요.

Logseq Desktop 설정의 `Advanced`에서 `Developer mode`를 활성화합니다.

<img src="./assets/images/settings-advanced-enable-developer-mode.png" alt="Logseq advanced settings developer mode toggle" width="720" />

그런 다음 `Plugins` 화면에서 `Load unpacked plugin`을 누르고 이 프로젝트 폴더를 선택합니다.

<img src="./assets/images/plugins-load-unpacked-plugin.png" alt="Logseq plugin load unpacked plugin screen" width="720" />

## 사용 방법

1. Logseq 블록에서 `/para`를 입력합니다.
2. slash command 목록에서 `PARA: Create Page`를 실행합니다.

   <img src="./assets/images/command-0.png" alt="PARA slash command search result" width="500" />

3. PARA 카테고리를 선택합니다.
   - `1` = Project
   - `2` = Area
   - `3` = Resource
   - `4` = Archive
   - `Esc` = 취소

   현재 페이지가 `01-projects`, `02-areas`, `03-resources`, `04-archive` 같은 PARA 디렉토리 안에 있으면 해당 카테고리가 자동 선택되고 page name 입력 단계로 바로 이동합니다. 자동 선택된 카테고리를 바꾸려면 `Change category`를 누릅니다.

   <img src="./assets/images/command-1.png" alt="PARA category selection modal" width="500" />

   <img src="./assets/images/command-5.png" alt="PARA current category auto selection modal" width="500" />

4. page name을 입력하고 Create를 누릅니다.

   <img src="./assets/images/command-2.png" alt="PARA page name input modal" width="500" />

5. 플러그인이 Markdown 파일을 준비한 뒤 현재 커서 위치에 링크를 삽입합니다.

   <img src="./assets/images/command-4.png" alt="Inserted Logseq page link" width="300" />

## 생성 예시

Project를 선택하고 page name으로 `my-project`를 입력하면 기본 설정 기준으로 아래 파일이 생성됩니다.

```text
01-projects/my-project.md
```

파일 내용은 Markdown 기준으로 아래와 같습니다.

```markdown
## para:: project
```

페이지가 준비되면 현재 블록에는 아래 링크가 삽입됩니다.

```markdown
[[my-project]]
```

이미 같은 페이지 파일이 있거나 Logseq 기본 `pages` 디렉토리에서 PARA 디렉토리로 이동된 파일도 `para:: ...` 프로퍼티가 없으면 자동으로 추가됩니다.

<img src="./assets/images/command-3.png" alt="PARA page name example" width="500" />

| 선택     | 입력 page name | 생성/이동 대상 파일           | 삽입 링크         | 추가 프로퍼티     |
| -------- | -------------- | ----------------------------- | ----------------- | ----------------- |
| Project  | `my-project`   | `01-projects/my-project.md`   | `[[my-project]]`  | `para:: project`  |
| Area     | `my-area`      | `02-areas/my-area.md`         | `[[my-area]]`     | `para:: area`     |
| Resource | `my-resource`  | `03-resources/my-resource.md` | `[[my-resource]]` | `para:: resource` |
| Archive  | `old-page`     | `04-archive/old-page.md`      | `[[old-page]]`    | `para:: archive`  |

`name.md`처럼 `.md` 확장자를 입력해도 실제 파일명과 삽입 링크에서는 확장자가 제거됩니다.

> 현재는 Command Palette 방식은 사용하지 않고 `/para` slash command만 지원합니다.

## 설정

Logseq 플러그인 설정에서 PARA 디렉토리 이름을 변경할 수 있습니다.

<img src="./assets/images/plugins-setting.png" alt="PARA Pages plugin settings" width="720" />

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

빌드 후 Logseq에서 이 프로젝트 폴더를 플러그인으로 로드하세요. 코드 변경사항을 Logseq에 반영하려면 다시 빌드한 뒤 플러그인을 reload하세요.

### 구현 메모

- PARA 프로퍼티 Markdown 생성/수정 로직은 `src/para-metadata.ts`에 있습니다.
- 새 파일 생성뿐 아니라 기존/이동된 파일에도 `para:: <kind>` 프로퍼티를 보강합니다.
- 문서 파일 생성 후 현재 편집 커서에 페이지 링크를 삽입하고, 커서 삽입 실패 시 원래 블록 끝에 링크를 추가합니다.

> 파일 시스템 접근이 필요하므로 현재 구현은 Logseq Desktop 환경을 전제로 합니다.
