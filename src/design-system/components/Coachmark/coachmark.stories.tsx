import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sparkles, Bot, Users, FolderPlus, Keyboard, MousePointer2, Command } from 'lucide-react'
import { Coachmark } from './coachmark'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Components/Coachmark/展示',
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ── Media helpers (placeholder gradients — avoid external image refs) ────────

const MediaGradient = ({
  from, to, icon: Icon, label,
}: {
  from: string; to: string; icon: React.ComponentType<{ className?: string }>; label: string
}) => (
  <div
    className="w-full h-full flex items-center justify-center"
    style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
  >
    <div className="flex flex-col items-center gap-2 text-white/90">
      <Icon className="w-10 h-10" />
      <span className="text-footnote font-medium">{label}</span>
    </div>
  </div>
)

// ── Single Coachmark: Intercom-style feature discovery ──────────────────────

export const FeatureDiscovery: Story = {
  name: '單步驟新功能介紹(Intercom / Slack 風格)',
  render: () => {
    const [open, setOpen] = React.useState(true)
    return (
      <div className="flex flex-col items-center gap-3">
        <Coachmark
          open={open}
          onOpenChange={setOpen}
          image={<MediaGradient from="var(--color-indigo-6)" to="var(--color-purple-6)" icon={Bot} label="AI 助理" />}
          title="試試新的 AI 助理"
          description="在任何文件中按下 AI 按鈕,讓 Claude 幫你摘要、翻譯或改寫內容。"
          onNext={() => setOpen(false)}
          isLastStep  /* single-step → CTA = 「知道了」 */
          side="bottom"
          align="center"
        >
          <Button variant="primary" startIcon={Bot}>AI 助理</Button>
        </Coachmark>
        <p className="text-footnote text-fg-muted">↑ 單步驟只有 1 個 CTA「知道了」,無 Skip(單步驟沒有跳過意義)</p>
      </div>
    )
  },
}

// ── Multi-step Tour: Linear/Notion/Figma onboarding ─────────────────────────

const tourSteps = [
  {
    anchor: '建立 Workspace',
    icon: FolderPlus,
    media: { from: 'var(--color-blue-6)', to: 'var(--color-cyan-6)', label: 'Workspace' },
    title: '建立你的第一個 Workspace',
    description: 'Workspace 是團隊協作的主要空間,所有專案、文件、成員都在這裡集中管理。',
  },
  {
    anchor: '邀請成員',
    icon: Users,
    media: { from: 'var(--color-yellow-6)', to: 'var(--color-deep-orange-6)', label: '團隊' },
    title: '邀請成員加入',
    description: '輸入 email 寄送邀請,新成員會自動加入這個 Workspace 並看到你目前的專案。',
  },
  {
    anchor: '建立第一個專案',
    icon: Sparkles,
    media: { from: 'var(--color-green-6)', to: 'var(--color-green-7)', label: '專案' },
    title: '建立你的第一個專案',
    description: '專案用來組織相關的任務、文件和討論。你隨時可以建立更多專案或邀請成員加入。',
  },
]

export const MultiStepTour: Story = {
  name: '多步 Onboarding Tour(Linear / Notion / Figma 風格)',
  render: () => {
    const [step, setStep] = React.useState(0)
    const [open, setOpen] = React.useState(true)
    const isLast = step === tourSteps.length - 1

    return (
      <div className="flex flex-col gap-6 min-w-[360px]">
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
          {tourSteps.map((s, i) => (
            <Coachmark
              key={s.anchor}
              open={open && step === i}
              // canonical fix:只有目前 active step 才回報 tour 退出;其他 Coachmark 的
              // 「被切換導致的關閉」不代表使用者要結束整個 tour(原本 bug:step i→i+1
              // 切換時 i 的 Coachmark 關閉會誤觸發全局 setOpen(false),導致 next 卡住)
              onOpenChange={(o) => { if (step === i && !o) setOpen(false) }}
              kind="new-features"
              image={<MediaGradient from={s.media.from} to={s.media.to} icon={s.icon} label={s.media.label} />}
              title={s.title}
              description={s.description}
              step={{ current: i + 1, total: tourSteps.length }}
              onPrev={i > 0 ? () => setStep(i - 1) : undefined}
              onSkip={() => setOpen(false)}
              onNext={() => (i === tourSteps.length - 1 ? setOpen(false) : setStep(i + 1))}
              isLastStep={i === tourSteps.length - 1}
              side="bottom"
              align="start"
            >
              <Button variant={i === step ? 'primary' : 'tertiary'} size="sm" startIcon={s.icon}>
                {s.anchor}
              </Button>
            </Coachmark>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm" onClick={() => { setStep(0); setOpen(true) }}>重設 Tour</Button>
          <span className="text-footnote text-fg-muted self-center">
            目前第 {step + 1} / {tourSteps.length} 步{isLast ? '(最後步 — Next 變 Done)' : ''}
          </span>
        </div>
        <p className="text-footnote text-fg-muted">
          ↑ 多步驟:`kind="new-features"` header 提示脈絡;第 1 步有 Skip,按 Next 進 2+ 步後 Skip 自動隱藏(canonical)
        </p>
      </div>
    )
  },
}

// ── Multi-step Tips: 鍵盤快捷鍵教學(Linear / Figma 風格)───────────────────

const tipSteps = [
  {
    anchor: '鍵盤導覽',
    icon: Keyboard,
    media: { from: 'var(--color-purple-6)', to: 'var(--color-indigo-6)', label: 'Cmd + K' },
    title: '用 Cmd + K 叫出全站搜尋',
    description: '快速搜尋任何檔案、指令、設定;支援模糊比對與歷史紀錄。多數操作都可以從這裡直接觸發。',
  },
  {
    anchor: '快速切換',
    icon: Command,
    media: { from: 'var(--color-blue-6)', to: 'var(--color-purple-6)', label: 'Cmd + P' },
    title: 'Cmd + P 在最近文件間切換',
    description: '相當於 VS Code / Figma 的 Go to File;按住 Cmd 不放可多次跳轉,放開即停在當前。',
  },
  {
    anchor: '右鍵動作',
    icon: MousePointer2,
    media: { from: 'var(--color-green-6)', to: 'var(--color-blue-6)', label: 'Right-click' },
    title: '右鍵選單集中所有情境動作',
    description: '在任一檔案或列表項上按右鍵,會列出所有可用動作:複製、分享、重新命名、刪除等。',
  },
]

export const TipsMultiStep: Story = {
  name: '多步 Tips(快捷鍵教學 / kind="tips")',
  render: () => {
    const [step, setStep] = React.useState(0)
    const [open, setOpen] = React.useState(true)

    return (
      <div className="flex flex-col gap-6 min-w-[360px]">
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
          {tipSteps.map((s, i) => (
            <Coachmark
              key={s.anchor}
              open={open && step === i}
              onOpenChange={(o) => { if (step === i && !o) setOpen(false) }}
              kind="tips"
              image={<MediaGradient from={s.media.from} to={s.media.to} icon={s.icon} label={s.media.label} />}
              title={s.title}
              description={s.description}
              step={{ current: i + 1, total: tipSteps.length }}
              onPrev={i > 0 ? () => setStep(i - 1) : undefined}
              onSkip={() => setOpen(false)}
              onNext={() => (i === tipSteps.length - 1 ? setOpen(false) : setStep(i + 1))}
              isLastStep={i === tipSteps.length - 1}
              side="bottom"
              align="start"
            >
              <Button variant={i === step ? 'primary' : 'tertiary'} size="sm" startIcon={s.icon}>
                {s.anchor}
              </Button>
            </Coachmark>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm" onClick={() => { setStep(0); setOpen(true) }}>重設 Tips</Button>
        </div>
        <p className="text-footnote text-fg-muted">
          ↑ `kind="tips"` header 文字 = 「使用技巧」(vs `new-features` = 「新功能介紹」),兩者都由元件內 canonical 映射,consumer 不重寫
        </p>
      </div>
    )
  },
}

// 備註(2026-04-21 決策):移除 `TextOnly` 與 `WithIllustration` 兩則範例。
// - TextOnly:user 明示「先不要提供純文字提示風格範例」(缺 media 的 Coachmark 跟 Popover
//   差異太小,讓消費者誤用)
// - WithIllustration:原本 illustration 用硬寫 hex(違 DS token 原則)且視覺差異不明顯,
//   無法傳達「動畫 / illustration 比 flat screenshot 更強」的主訴,刪除避免誤導
