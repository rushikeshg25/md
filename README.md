# Next Markdown Editor

A powerful, feature-rich Markdown editor built with Next.js 16, React 19, and Tailwind CSS. Designed for a seamless writing experience with real-time preview, advanced syntax highlighting, and distraction-free modes.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)

## Features

- **Real-time Split Preview**: Synchronized scrolling between the editor and preview pane.
- **Advanced Editor**: Powered by CodeMirror with syntax highlighting for Markdown.
- **Rich Content Support**:
  - **GFM**: GitHub Flavored Markdown (tables, task lists, etc.).
  - **Math**: LaTeX equation support via KaTeX ($ E = mc^2 $).
  - **Diagrams**: Mermaid.js integration for flowcharts and graphs.
- **Distraction-Free Zen Mode**: Toggle UI elements to focus purely on your content.
- **Command Palette**: Rapidly access commands with `Cmd+K` (or `Ctrl+K`).
- **File Operations**:
  - Open local Markdown files.
  - Save changes to disk.
  - Download/Export options.
- **Customizable UI**:
  - Resizable editor/preview panes.
  - Dark/Light mode theming.
  - Responsive design.
- **Statistics**: Real-time word, character, line, and column counts.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor Core**: [CodeMirror](https://codemirror.net/) via [`@uiw/react-codemirror`](https://uiwjs.github.io/react-codemirror/)
- **Markdown Engine**:
  - [`react-markdown`](https://github.com/remarkjs/react-markdown)
  - [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
  - [`rehype-katex`](https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight) & [`katex`](https://katex.org/)
- **Diagrams**: [`mermaid`](https://mermaid.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `cmdk` (Command Palette), `clsx`, `tailwind-merge`

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rushikeshg25/md.git
    cd md
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
## Shortcuts

| Key | Action |
| :--- | :--- |
| `Cmd + K` / `Ctrl + K` | Open Command Palette |
| `Cmd + S` / `Ctrl + S` | Save File |
| `Esc` (in Zen Mode) | Exit Zen Mode |


