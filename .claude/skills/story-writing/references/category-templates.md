# 展示 Story Category Templates(2026-04-26)

每元件依「視覺結構特性」歸屬一個 category,每 category 有 **suggested core stories**(不是強制,但 ≥ 80% 元件應符合)+ optional stories。新 / audit 元件對照本表選 stories 集合。

對應 CLAUDE.md `# Story` 「Manual story 拆分原則」+ Polaris / Carbon 共識 + Storybook 4-tier idiom。

## 7 Categories(基於現況 47 元件 emergent pattern)

### A — Visual Variant + Size + State 元件(button-like pill)

**識別**:有多個視覺 variant(primary / secondary / etc),size 軸,state 軸,可能有 slot props。

**Suggested core stories**(必有 ≥ 5):
- `AllVariants` — 對照 grid
- `AllSizes` — 對照 grid
- `Disabled`
- 至少 1 個 slot story(`WithIcon` / `WithBadge` / `IconOnly` 等視 prop 而定)
- 至少 1 個 state story(`Pressed` / `Loading`)

**Optional**:`FullWidth` / `Hover / Focus` / 真實場景 / `Tooltip on Icon Only` / 跨元件整合

**範例元件**:Button(12)/ Tag(6)/ Badge(4)/ Toast(3)/ Chip(8)

### B — Mode-based Field Control(input-like)

**識別**:可編輯資料輸入(Field control), 有 `mode` prop(edit / display 等),受 form context 影響。

**Suggested core stories**(必有 ≥ 4):
- `Modes` — display vs edit 對照
- `SizeAlignment` — size + label 對齊(Field family 共通)
- `ErrorState` — 錯誤態
- 至少 1 個 slot story(`Start Icon` / `End Action` / `WithAvatar` 等視 prop 而定)

**Optional**:`Clearable` / `Searchable` / scenarios(`InDataTable` 等)

**範例元件**:Input(6)/ Select(6)/ Combobox(5)/ NumberInput(4)/ DatePicker(6)/ Textarea(5)/ PeoplePicker(3)/ LinkInput(6)/ TimePicker(scenario-driven 例外)

### C — Selection Control(checkbox-like)

**識別**:布林 / 多選 toggle,通常配 label 群組。

**Suggested core stories**(必有 ≥ 4):
- `States` — checked / unchecked / indeterminate / disabled 對照
- `VerticalGroup`
- `Horizontal`(layout 變體)
- `Disabled`(group level)

**Optional**:`WithLabel`(若 label slot 獨立)/ scenarios

**範例元件**:Checkbox(4)/ RadioGroup(4)/ Switch(2)/ SelectionControl(5)

### D — Layout / Structural Primitive(structural-heavy)

**識別**:Layout 多軸組合,結構變體本身教不同事。

**Suggested core stories**:每個結構變體 1 故事(無固定數)。

**範例元件**:Field(12 — vertical/horizontal/mixed/labelWidth 等)/ DataTable(11 — column types/sizes/alignment/heights/empty 等)/ Steps(8 — sizes/states/non-linear/horizontal 等)/ Tabs(6)/ Sidebar(4)/ Accordion(3)

### E — Scenario-driven 元件(canvas / overlay / contextual)

**識別**:無 visual variant 軸;主要由真實業務場景定義用法;大型 surface 元件。

**Suggested core stories**(必有 ≥ 2 真實場景):
- ≥ 2 個業務場景 named descriptively(Jira / Stripe / Notion / Figma / Gmail 等情境)
- `OpenSnapshot`(若是 overlay,M15 stakeholder visual 必有)

**範例元件**:Dialog(6,含 OpenSnapshot)/ Sheet(3)/ Calendar(3 — TeamCalendar 等)/ Carousel(2)/ Coachmark(3)/ Empty(5)/ FileViewer(7)/ FileUpload(4)/ Notice(5)/ Popover(2)/ TimePicker(MeetingSlot 等)

### F — Visual / Media Display 元件

**識別**:純視覺 / data display,無 user input,可能多 visual axis(shape / color / size 正交)。

**Suggested core stories**(必有 ≥ 4):
- 至少 4 個視覺軸 stories(`Modes` / `Shapes` / `Colors` / `AllSizes` / `Fallback` / `InContext` 任 4)

**範例元件**:Avatar(6)/ AspectRatio(5)/ Skeleton(6)/ FileItem(5)/ Chart(4)/ Rating(5)/ ProgressBar(3)/ CircularProgress(6)/ Slider(6)

### G — Internal Primitive(building block)

**識別**:被其他元件消費的 low-level primitive,public API 簡單;非 user-facing component 自身。

**Suggested core stories**(必有 ≥ 1,通常 ≤ 5):
- 至少 1 個 minimal demo
- 若 primitive 有意義的 usage variants(showcase context)→ 加 1-2 個

**範例元件**:HoverCard(5)/ DateGrid(4)/ OverflowIndicator(5)/ Menu(11 — internal 但 layered)/ Command(4)/ Notice(5)/ SelectMenu(7)/ Tooltip(4)/ Separator(4)/ ScrollArea(4)/ NameCard(1 — minimal)/ Breadcrumb(6)/ DescriptionList(6)/ TreeView(7)

## How to use(寫 / audit story 時)

1. 該元件屬哪 category?(若不確定 → 跟近親元件對齊)
2. 對照 category 的「Suggested core stories」list
3. 缺哪些 → 補(若**真有對應 prop / state / mode**)
4. 多哪些 → 過 earn-existence 2 test:(a) 教別 story 沒教的?(b) 移除後 spec degrade?
5. **不該強制**:某 category 的 element 不需 IconOnly(例:Tag 沒 iconOnly prop)→ 不畫該 story

## 邊界 case 處理

- 元件**橫跨多 category**(e.g. Button = A + 真實場景 → A 為主,真實場景補 1-2)
- **Internal/Components 移轉** → 重新對照 category(展示集合通常變多)
- **新 prop 加** → 評估是否新 slot rule → 加 story OR 用 Controls

## Cross-link

- CLAUDE.md `# Story` 拆分原則 — canonical 上游
- `/story-writing` SKILL.md Phase 0(rule-mapping)— 跟 spec rules 對應
- Hook `check_story_slot_split.sh` — write-time 反 pattern block
- `/design-system-audit` Dim 28 — periodic verify
