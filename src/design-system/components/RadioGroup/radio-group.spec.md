# RadioGroup 設計原則

**實作基礎**：基於 Radix RadioGroup（shadcn 包裝）+ 橋接 DS token。

共用規則見 `../Checkbox/checkbox.spec.md`(Checkbox & RadioGroup 設計原則,含 SelectionItem 佈局與 clamp 政策)。

**與 Select 的分界詳見 `../Select/select.spec.md` 的「與 RadioGroup 的分界」**（SSOT）——Select 是 Select vs RadioGroup 判斷的 owner。簡言：RadioGroup 用於「使用者需對比評估的決策節點」（付款方式、訂閱方案、票種），Select 用於「label 自帶語意、空間受限、使用者熟悉選項」。

RadioGroup 與 Checkbox 的差異僅在:
- **形狀**:`rounded-full`(Checkbox 是 `rounded-md`)
- **指示器**:filled dot(Checkbox 是 check / minus icon)
- **語意**:互斥選擇(Checkbox 可多選)
- **`fieldLayout`**:`'block'`(放進 `<Field>` 時,Field 自動把 control area 切成 block 模式;Checkbox 沒有此 static 屬性,因為單個 Checkbox 是 inline primitive)
