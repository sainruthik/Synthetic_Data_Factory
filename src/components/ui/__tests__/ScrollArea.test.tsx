import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea } from '../ScrollArea'

describe('ScrollArea', () => {
  it('renders children', () => {
    render(<ScrollArea><p>hello</p></ScrollArea>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ScrollArea className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('passes extra props to the div', () => {
    render(<ScrollArea data-testid="scroll-area" />)
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
  })
})
