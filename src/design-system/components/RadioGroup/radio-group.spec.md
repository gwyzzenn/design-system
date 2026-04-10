# RadioGroup 設計原則

共用規則見 `../Checkbox/checkbox.spec.md`(Checkbox & RadioGroup 設計原則,含 SelectionItem 佈局與 clamp 政策)。

RadioGroup 與 Checkbox 的差異僅在:
- **形狀**:`rounded-full`(Checkbox 是 `rounded-md`)
- **指示器**:filled dot(Checkbox 是 check / minus icon)
- **語意**:互斥選擇(Checkbox 可多選)
- **`fieldLayout`**:`'block'`(放進 `<Field>` 時,Field 自動把 control area 切成 block 模式;Checkbox 沒有此 static 屬性,因為單個 Checkbox 是 inline primitive)
