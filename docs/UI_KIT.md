# Woosh UI kit

Brand tokens live in `src/app/globals.css`. Components in `src/components/ui/`.

## Primitives

| Component | Notes |
|-----------|--------|
| `Button` / `ButtonLink` | primary, secondary, ghost, danger |
| `Input` / `Select` / `TextArea` / `Label` | form fields |
| `Checkbox` / `Switch` | Radix; `checkbox-switch.tsx` |
| `Badge` / `StatusBadge` | tones; StatusBadge maps domain enums |
| `Panel` / `PageHeader` / `EmptyState` | page structure |
| `AppPage` / `DataToolbar` | list-page scaffold + filter row |
| `Tabs` | Radix tabs |
| `Dialog` / `ConfirmDialog` | modal + confirm pattern |
| `Sheet` | side/bottom drawer (Radix Dialog) |
| `DropdownMenu` | user menus / actions |
| `ToastProvider` / `useToast` | flash feedback — call after mutations |
| `Table` / `THead` / `TBody` / `TR` / `TH` / `TD` | data tables |
| `Avatar` | initials fallback |
| `Skeleton` | loading placeholders |
| `Stat` | metric cards |
| `ProgressBar` | readiness / audience bars |
| `VerifiedCheck` | blue verified mark next to names |
| `Stepper` | multi-step flows |
| `FileDropzone` | deliverable uploads |
| `FilterChips` | link-based filter chips |
| `Pagination` | prev/next with href builder |
| `Tooltip` / `TooltipProvider` | Radix tooltips |
| `Logo` / `BackLink` | chrome |

## Shell

`AppShell` in `src/components/layout/app-shell.tsx` — desktop sidebar, mobile drawer + bottom nav, role nav from `src/lib/nav.ts`.

## Usage

Prefer kit components over raw Tailwind for new screens. Keep Electric Blue / Dark Navy / Bright Teal only. Toast on every successful mutation.
