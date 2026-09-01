# Flux (Web Interactive Demo)

> **Modern Financial Grant Allocations & Standard Unit Cost (UCS) Staff Timesheet Management**

An interactive browser-based showcase of **Flux**, an administrative and financial management tool for public grants, welfare funds, and Standard Unit Cost staff reporting.

---

## ✨ Key Features

- 📊 **Grant & Fund Management**: Multi-year budget tracking, personnel vs. services allocation breakdowns, and real-time commitment vs. remaining balance calculations.
- ⏱️ **Staff Timesheets & UCS Unit Costs**: Operator rosters, monthly worked hours logging, hourly rate assignments, and automatic financial cost aggregation.
- 🔗 **Smart Commitments Linking**: Link staff monthly cost pools directly to grant budget line items with conflict detection and automated reconciliation.
- 📈 **Analytical Dashboard**: Executive summary of multi-year budgets, utilization rates, and operational indicators.
- 💾 **In-Browser Sandbox**: Instant interactive simulation powered by localStorage — create, update, and manage records freely in demo mode.
- 🔄 **Sample Data Reset**: Reset the sandbox to pristine demo records anytime with a single click.

---

## 🚀 Live Demo & Getting Started

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/flux-demo.git
   cd flux-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) + [Vitest](https://vitest.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Design System**: Tailored high-density administrative design with custom CSS tokens, dark/light contrast, and responsive layout.

---

## 🛡️ Note on Demo Limitations

This repository is an **interactive web showcase** designed to run standalone in any modern browser without backend setup.
- Advanced OS integrations (e.g., local native SQLite backups, file system directory pickers, native document compilation engines) are demonstrated with informative preview modals representing the desktop Electron edition of Flux.
- All demo data is strictly stored in your local browser session storage and can be reset at any time.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
