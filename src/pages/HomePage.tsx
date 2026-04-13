import { Link } from 'react-router'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { cn } from '../lib/cn'

export function HomePage() {
  const prefersReduced = useReducedMotion()

  return (
    <div className="relative">
      <HeroSection prefersReduced={prefersReduced} />
      <FeaturesSection />
    </div>
  )
}

interface HeroSectionProps {
  prefersReduced: boolean
}

function HeroSection({ prefersReduced }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-12 items-center"
    >
      {/* Left: copy */}
      <div className="flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] text-xs font-mono w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          v0.1.0 — frontend preview
        </div>

        <h1
          id="hero-heading"
          className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-[var(--color-heading)] leading-none"
        >
          Synthetic
          <br />
          <span className="text-[var(--color-accent)]">Data</span>
          <br />
          Factory
        </h1>

        <p className="text-base md:text-lg text-[var(--color-text)] max-w-md leading-relaxed">
          Generate realistic, schema-aware synthetic datasets at scale.
          Structured output for machine learning, testing, and prototyping —
          without touching real data.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/generate"
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded font-mono text-sm font-semibold',
              'bg-[var(--color-accent)] text-white',
              'hover:bg-[var(--color-accent-hover)] active:scale-95',
              !prefersReduced && 'transition-all duration-[var(--duration-fast)] ease-out'
            )}
          >
            Start generating
            <ArrowRight />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded font-mono text-sm font-medium',
              'border border-[var(--color-border-hover)] text-[var(--color-text)]',
              'hover:border-[var(--color-accent-border)] hover:text-[var(--color-heading)]',
              !prefersReduced && 'transition-colors duration-[var(--duration-fast)]'
            )}
          >
            View source
          </a>
        </div>
      </div>

      {/* Right: terminal-style visual */}
      <div
        className={cn(
          'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden font-mono text-xs',
          !prefersReduced && 'transition-transform duration-[var(--duration-normal)]'
        )}
        aria-hidden="true"
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[var(--color-text-muted)]">factory.py</span>
        </div>
        <div className="p-5 space-y-1 leading-relaxed">
          <Line comment="# Define your schema" />
          <Line keyword="schema" op=" = " />
          <Line indent="  " key_="name" val='"string"' />
          <Line indent="  " key_="age" val='"int[18..65]"' />
          <Line indent="  " key_="email" val='"email"' />
          <Line indent="  " key_="country" val='"iso_country"' />
          <Line />
          <Line comment="# Generate 10 000 rows" />
          <Line keyword="factory" op=".generate(" val="schema" suffix=", n=10_000)" />
          <Line />
          <Line text="✓ " accent="10 000 rows" rest=" written to output.jsonl" />
        </div>
      </div>
    </section>
  )
}

/* Mini pseudo-code line sub-components */
interface LineProps {
  comment?: string
  keyword?: string
  op?: string
  key_?: string
  val?: string
  indent?: string
  suffix?: string
  text?: string
  accent?: string
  rest?: string
}

function Line({ comment, keyword, op, key_, val, indent, suffix, text, accent, rest }: LineProps) {
  if (!comment && !keyword && !key_ && !val && !text) {
    return <div className="h-3" />
  }

  return (
    <div className="flex flex-wrap gap-0 text-[var(--color-text-muted)]">
      {indent && <span>{indent}</span>}
      {comment && <span className="text-[var(--color-text-muted)] italic">{comment}</span>}
      {keyword && <span className="text-[var(--color-accent-hover)]">{keyword}</span>}
      {op && <span>{op}</span>}
      {key_ && <span className="text-[var(--color-amber)]">  {key_}</span>}
      {key_ && <span className="text-[var(--color-text-muted)]">: </span>}
      {val && <span className="text-green-400">{val}</span>}
      {suffix && <span>{suffix}</span>}
      {text && <span className="text-green-400">{text}</span>}
      {accent && <span className="text-[var(--color-accent-hover)]">{accent}</span>}
      {rest && <span>{rest}</span>}
    </div>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: '⚡',
      title: 'Schema-aware generation',
      desc: 'Define field types, constraints, and relationships. The factory respects every rule.',
    },
    {
      icon: '📦',
      title: 'Multiple output formats',
      desc: 'Export as JSON Lines, CSV, Parquet, or SQL inserts — ready to drop into your pipeline.',
    },
    {
      icon: '🔒',
      title: 'No real data required',
      desc: 'Generate fully synthetic datasets without privacy risk. Safe for dev, staging, and demos.',
    },
    {
      icon: '🔁',
      title: 'Reproducible seeds',
      desc: 'Pin a seed to reproduce any dataset exactly. Share seeds with your team.',
    },
  ]

  return (
    <section
      aria-labelledby="features-heading"
      className="max-w-6xl mx-auto px-6 pb-24"
    >
      <h2
        id="features-heading"
        className="sr-only"
      >
        Features
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-border-hover)] transition-colors duration-[var(--duration-fast)]"
          >
            <div className="text-2xl mb-3" aria-hidden="true">{f.icon}</div>
            <h3 className="font-mono text-sm font-semibold text-[var(--color-heading)] mb-2">
              {f.title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
