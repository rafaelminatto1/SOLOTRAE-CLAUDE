import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../utils'
import Input from '../../../components/ui/Input'

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders input with label', () => {
    render(<Input label="Username" />)
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('renders input with value', () => {
    render(<Input value="test value" readOnly />)
    
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('handles text input correctly', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')
    
    expect(handleChange).toHaveBeenCalledTimes(11) // One call per character
    expect(input).toHaveValue('Hello World')
  })

  it('renders different input types correctly', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    
    rerender(<Input type="tel" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
    
    rerender(<Input type="url" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url')
  })

  it('shows error state correctly', () => {
    render(<Input error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(<Input helperText="Enter your email address" />)
    
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />)
    
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('is readonly when readonly prop is true', () => {
    render(<Input readOnly value="readonly value" />)
    
    const input = screen.getByDisplayValue('readonly value')
    expect(input).toHaveAttribute('readonly')
  })

  it('shows required indicator when required', () => {
    render(<Input label="Required Field" required />)
    
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Input className="custom-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    
    render(<Input ref={ref} />)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <div>
        <Input placeholder="First input" />
        <Input placeholder="Second input" />
      </div>
    )
    
    const firstInput = screen.getByPlaceholderText('First input')
    const secondInput = screen.getByPlaceholderText('Second input')
    
    firstInput.focus()
    expect(firstInput).toHaveFocus()
    
    await user.tab()
    expect(secondInput).toHaveFocus()
  })

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    
    render(<Input type="email" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'invalid-email')
    
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveValue('invalid-email')
  })

  it('handles number input with min and max', async () => {
    const user = userEvent.setup()
    
    render(<Input type="number" min="0" max="100" />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
    
    await user.type(input, '50')
    expect(input).toHaveValue(50)
  })

  it('shows character count when maxLength is provided', () => {
    render(<Input maxLength={100} showCharCount />)
    
    expect(screen.getByText('0/100')).toBeInTheDocument()
  })

  it('updates character count as user types', async () => {
    const user = userEvent.setup()
    
    render(<Input maxLength={10} showCharCount />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello')
    
    expect(screen.getByText('5/10')).toBeInTheDocument()
  })

  it('prevents input when maxLength is reached', async () => {
    const user = userEvent.setup()
    
    render(<Input maxLength={5} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello')
  })

  it('renders with icon', () => {
    render(<Input icon="🔍" placeholder="Search" />)
    
    expect(screen.getByText('🔍')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('renders with suffix', () => {
    render(<Input suffix="@example.com" />)
    
    expect(screen.getByText('@example.com')).toBeInTheDocument()
  })

  it('handles password visibility toggle', async () => {
    const user = userEvent.setup()
    
    render(<Input type="password" showPasswordToggle />)
    
    const input = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByLabelText(/show password/i)
    
    expect(input).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('has proper ARIA attributes', () => {
    render(
      <Input 
        label="Email"
        error="Invalid email"
        helperText="Enter your email"
        required
        aria-describedby="email-description"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('supports autocomplete attributes', () => {
    render(<Input autoComplete="email" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('handles clear button functionality', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input value="test value" onChange={handleChange} clearable />)
    
    const clearButton = screen.getByLabelText(/clear/i)
    await user.click(clearButton)
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: '' })
    }))
  })

  it('maintains consistent styling across themes', () => {
    const { rerender } = render(<Input placeholder="Theme input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
    
    // Test with dark theme context
    rerender(
      <div className="dark">
        <Input placeholder="Theme input" />
      </div>
    )
    
    const darkInput = screen.getByRole('textbox')
    expect(darkInput).toHaveClass('dark:border-gray-600')
  })
})