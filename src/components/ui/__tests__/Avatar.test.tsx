import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  it('renders "U" for user variant', () => {
    const { getByText } = render(<Avatar variant="user" />)
    expect(getByText('U')).toBeInTheDocument()
  })

  it('renders bot icon SVG for bot variant', () => {
    const { container } = render(<Avatar variant="bot" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar variant="user" className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})
