import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreBadge } from '../ScoreBadge'

describe('ScoreBadge', () => {
  it('renders null when score is null', () => {
    const { container } = render(<ScoreBadge score={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows score text', () => {
    render(<ScoreBadge score={75} />)
    expect(screen.getByText(/75\/100/)).toBeInTheDocument()
  })

  it('has green class for score >= 80', () => {
    render(<ScoreBadge score={85} />)
    const el = screen.getByText(/85\/100/).closest('span')
    expect(el?.className).toMatch(/green/)
  })

  it('has yellow class for score 50-79', () => {
    render(<ScoreBadge score={65} />)
    const el = screen.getByText(/65\/100/).closest('span')
    expect(el?.className).toMatch(/yellow/)
  })

  it('has red class for score < 50', () => {
    render(<ScoreBadge score={30} />)
    const el = screen.getByText(/30\/100/).closest('span')
    expect(el?.className).toMatch(/red/)
  })

  it('shows Pass label on lg size for passing score', () => {
    render(<ScoreBadge score={90} size="lg" />)
    expect(screen.getByText('Pass')).toBeInTheDocument()
  })

  it('shows Fail label on lg size for failing score', () => {
    render(<ScoreBadge score={20} size="lg" />)
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('shows Review label on lg size for mid score', () => {
    render(<ScoreBadge score={60} size="lg" />)
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('has an accessible aria-label', () => {
    render(<ScoreBadge score={80} />)
    expect(screen.getByLabelText(/80 out of 100/)).toBeInTheDocument()
  })
})
