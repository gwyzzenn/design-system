# SwitchField 設計原則

## 定位

SwitchField 是布林值的輸入與顯示元件，使用 Switch 控件。與 CheckboxField 的差異是語意：

| | SwitchField | CheckboxField |
|---|---|---|
| 語意 | 開啟/關閉功能（即時生效） | 勾選/取消（表單送出後生效） |
| 控件 | Switch | Checkbox |
| 適用 | 設定頁、偏好、即時 toggle | 表單、同意條款、多選 |

共用規則見 `field.spec.md`。本文件只記錄 SwitchField 特有的原則。

---

## 模式差異

| Mode | 渲染方式 | 說明 |
|------|---------|------|
| `edit` | Switch 元件 | 可切換開/關 |
| `readonly` | 文字（✓ 或 —） | 跟 CheckboxField 一致——不暗示可互動 |
| `disabled` | Disabled Switch | `opacity-disabled` 整體弱化 |

---

## 值的呈現

| 值 | Edit | Readonly | Display |
|----|------|----------|---------|
| `true` | Switch ON | ✓（`text-foreground`） | ✓ |
| `false` / `null` | Switch OFF | —（`text-fg-muted`） | — |

---

## 禁止事項

- ❌ 不在「需要表單送出才生效」的場景使用 SwitchField——用 CheckboxField
- ❌ 不在 readonly 模式使用 disabled Switch——語義不同（見 CheckboxField spec）
