import { NavLink, Outlet } from 'react-router'
import { cn } from '../lib/cn'

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-svh relative z-10">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
      >
        <NavLink
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-[var(--color-heading)] hover:text-[var(--color-accent-hover)] transition-colors duration-[var(--duration-fast)]"
        >
          <FactoryIcon />
          synthetic-data-factory
        </NavLink>

        <ul className="flex items-center gap-1 list-none m-0 p-0">
          <li>
            <NavItem to="/">Home</NavItem>
          </li>
          <li>
            <NavItem to="/generate">Generate</NavItem>
          </li>
        </ul>
      </nav>
    </header>
  )
}

interface NavItemProps {
  to: string
  children: React.ReactNode
}

function NavItem({ to, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'px-3 py-1.5 rounded text-sm font-medium transition-colors duration-[var(--duration-fast)]',
          isActive
            ? 'text-[var(--color-heading)] bg-[var(--color-surface-2)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
        )
      }
    >
      {children}
    </NavLink>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-6">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--color-text-muted)] font-mono">
        <span>synthetic-data-factory</span>
        <span>frontend — no backend yet</span>
      </div>
    </footer>
  )
}

function FactoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 20V8l6-4v4l6-4v4l6-4v16H2z" />
      <rect x="6" y="14" width="3" height="6" />
      <rect x="11" y="14" width="3" height="6" />
      <rect x="16" y="14" width="3" height="6" />
    </svg>
  )
}
