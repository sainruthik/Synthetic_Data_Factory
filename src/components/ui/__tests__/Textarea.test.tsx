import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../Textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('forwards value and onChange', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="input" value="hello" onChange={onChange} />)
    const el = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(el.value).toBe('hello')
    await userEvent.type(el, 'x')
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onSubmit when Ctrl+Enter is pressed', () => {
    const onSubmit = vi.fn()
    render(<Textarea aria-label="input" onSubmit={onSubmit} />)
    const el = screen.getByRole('textbox')
    fireEvent.keyDown(el, { key: 'Enter', ctrlKey: true })
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onSubmit when Cmd+Enter is pressed', () => {
    const onSubmit = vi.fn()
    render(<Textarea aria-label="input" onSubmit={onSubmit} />)
    const el = screen.getByRole('textbox')
    fireEvent.keyDown(el, { key: 'Enter', metaKey: true })
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('does not call onSubmit for plain Enter', () => {
    const onSubmit = vi.fn()
    render(<Textarea aria-label="input" onSubmit={onSubmit} />)
    const el = screen.getByRole('textbox')
    fireEvent.keyDown(el, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('passes extra props to the underlying textarea', () => {
    render(<Textarea aria-label="desc" placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })
})
