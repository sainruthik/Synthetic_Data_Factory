import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPanel } from '../ChatPanel'

// Mock useChat so we control messages/isLoading without hitting the API
vi.mock('../../../hooks/useChat', () => ({
  useChat: vi.fn(),
}))

import { useChat } from '../../../hooks/useChat'
const mockUseChat = vi.mocked(useChat)

const defaultChatReturn = {
  messages: [],
  isLoading: false,
  sendMessage: vi.fn(),
  clearMessages: vi.fn(),
}

beforeEach(() => {
  mockUseChat.mockReturnValue({ ...defaultChatReturn, sendMessage: vi.fn() })
})

describe('ChatPanel', () => {
  it('renders the header', () => {
    render(<ChatPanel onSchema={vi.fn()} />)
    expect(screen.getByText('AI Schema Assistant')).toBeInTheDocument()
  })

  it('renders the empty state when there are no messages', () => {
    render(<ChatPanel onSchema={vi.fn()} />)
    expect(screen.getByText(/Describe the dataset/i)).toBeInTheDocument()
  })

  it('renders messages when provided', () => {
    mockUseChat.mockReturnValue({
      ...defaultChatReturn,
      messages: [
        { id: '1', role: 'user', content: 'Hello bot', timestamp: 1 },
        { id: '2', role: 'assistant', content: 'Here is your schema.', timestamp: 2 },
      ],
      sendMessage: vi.fn(),
    })
    render(<ChatPanel onSchema={vi.fn()} />)
    expect(screen.getByText('Hello bot')).toBeInTheDocument()
    expect(screen.getByText('Here is your schema.')).toBeInTheDocument()
  })

  it('shows typing indicator when isLoading is true', () => {
    mockUseChat.mockReturnValue({
      ...defaultChatReturn,
      messages: [{ id: '1', role: 'user', content: 'make schema', timestamp: 1 }],
      isLoading: true,
      sendMessage: vi.fn(),
    })
    render(<ChatPanel onSchema={vi.fn()} />)
    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument()
  })

  it('disables the send button while loading', () => {
    mockUseChat.mockReturnValue({
      ...defaultChatReturn,
      isLoading: true,
      sendMessage: vi.fn(),
    })
    render(<ChatPanel onSchema={vi.fn()} />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('calls sendMessage when the user types and clicks Send', async () => {
    const sendMessage = vi.fn()
    mockUseChat.mockReturnValue({ ...defaultChatReturn, sendMessage })
    render(<ChatPanel onSchema={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: /message input/i })
    await userEvent.type(input, 'give me a user table')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))

    expect(sendMessage).toHaveBeenCalledWith('give me a user table')
  })
})
