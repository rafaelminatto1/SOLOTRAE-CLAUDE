import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../utils'
import Button from '../../../components/ui/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('renders secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')
  })

  it('renders outline variant correctly', () => {
    render(<Button variant="outline">Outline Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-gray-300')
  })

  it('renders ghost variant correctly', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-gray-100')
  })

  it('renders destructive variant correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })

  it('renders small size correctly', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-3')
  })

  it('renders default size correctly', () => {
    render(<Button size="default">Default Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'px-4')
  })

  it('renders large size correctly', () => {
    render(<Button size="lg">Large Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'px-8')
  })

  it('renders icon size correctly', () => {
    render(<Button size="icon">🔍</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading state correctly', () => {
    render(<Button loading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('bg-blue-600') // Should have button styles
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    
    render(<Button ref={ref}>Button with ref</Button>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
  })

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Keyboard Button</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    await user.keyboard('{Space}')
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('has proper ARIA attributes', () => {
    render(
      <Button 
        aria-label="Custom label"
        aria-describedby="description"
      >
        ARIA Button
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
    expect(button).toHaveAttribute('aria-describedby', 'description')
  })

  it('supports different button types', () => {
    render(<Button type="submit">Submit Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders with icon and text', () => {
    render(
      <Button>
        <span>🔍</span>
        Search
      </Button>
    )
    
    expect(screen.getByText('🔍')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('applies hover and focus styles', async () => {
    const user = userEvent.setup()
    render(<Button>Hover Button</Button>)
    
    const button = screen.getByRole('button')
    
    await user.hover(button)
    expect(button).toHaveClass('hover:bg-blue-700')
    
    button.focus()
    expect(button).toHaveClass('focus-visible:ring-2')
  })

  it('handles long text content', () => {
    const longText = 'This is a very long button text that should be handled properly'
    render(<Button>{longText}</Button>)
    
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('maintains consistent styling across themes', () => {
    const { rerender } = render(<Button>Theme Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transition-colors')
    
    // Test with dark theme context
    rerender(
      <div className="dark">
        <Button>Theme Button</Button>
      </div>
    )
    
    const darkButton = screen.getByRole('button')
    expect(darkButton).toHaveClass('transition-colors')
  })
})