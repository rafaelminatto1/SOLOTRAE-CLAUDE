import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../utils'
import Modal from '../../../components/ui/Modal'

describe('Modal Component', () => {
  it('renders modal when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('does not render modal when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('renders modal with title', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby')
  })

  it('renders modal with description', () => {
    render(
      <Modal 
        open={true} 
        onClose={vi.fn()} 
        title="Test Modal"
        description="This is a test modal description"
      >
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.getByText('This is a test modal description')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    )
    
    const closeButton = screen.getByLabelText(/close/i)
    await user.click(closeButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    )
    
    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside modal content', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    )
    
    const content = screen.getByText('Modal Content')
    await user.click(content)
    
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('closes when Escape key is pressed', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    )
    
    await user.keyboard('{Escape}')
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on Escape when closeOnEscape is false', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose} closeOnEscape={false}>
        <div>Modal Content</div>
      </Modal>
    )
    
    await user.keyboard('{Escape}')
    
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('does not close on overlay click when closeOnOverlayClick is false', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={handleClose} closeOnOverlayClick={false}>
        <div>Modal Content</div>
      </Modal>
    )
    
    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()} size="sm">
        <div>Small Modal</div>
      </Modal>
    )
    
    let modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('max-w-md')
    
    rerender(
      <Modal open={true} onClose={vi.fn()} size="md">
        <div>Medium Modal</div>
      </Modal>
    )
    
    modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('max-w-lg')
    
    rerender(
      <Modal open={true} onClose={vi.fn()} size="lg">
        <div>Large Modal</div>
      </Modal>
    )
    
    modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('max-w-2xl')
    
    rerender(
      <Modal open={true} onClose={vi.fn()} size="xl">
        <div>Extra Large Modal</div>
      </Modal>
    )
    
    modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('max-w-4xl')
  })

  it('renders with custom className', () => {
    render(
      <Modal open={true} onClose={vi.fn()} className="custom-modal">
        <div>Custom Modal</div>
      </Modal>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('custom-modal')
  })

  it('traps focus within modal', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal open={true} onClose={vi.fn()} title="Focus Test">
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </Modal>
    )
    
    const firstButton = screen.getByText('First Button')
    const secondButton = screen.getByText('Second Button')
    const closeButton = screen.getByLabelText(/close/i)
    
    // Focus should start on the first focusable element
    await waitFor(() => {
      expect(closeButton).toHaveFocus()
    })
    
    // Tab should move to next focusable element
    await user.tab()
    expect(firstButton).toHaveFocus()
    
    await user.tab()
    expect(secondButton).toHaveFocus()
    
    // Tab from last element should cycle back to first
    await user.tab()
    expect(closeButton).toHaveFocus()
  })

  it('restores focus to trigger element when closed', async () => {
    const user = userEvent.setup()
    
    const TestComponent = () => {
      const [open, setOpen] = React.useState(false)
      
      return (
        <div>
          <button onClick={() => setOpen(true)}>Open Modal</button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <div>Modal Content</div>
          </Modal>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const openButton = screen.getByText('Open Modal')
    await user.click(openButton)
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(openButton).toHaveFocus()
    })
  })

  it('prevents body scroll when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(document.body).toHaveStyle('overflow: hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(document.body).toHaveStyle('overflow: hidden')
    
    rerender(
      <Modal open={false} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(document.body).not.toHaveStyle('overflow: hidden')
  })

  it('renders with footer content', () => {
    render(
      <Modal 
        open={true} 
        onClose={vi.fn()}
        footer={
          <div>
            <button>Cancel</button>
            <button>Save</button>
          </div>
        }
      >
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(
      <Modal 
        open={true} 
        onClose={vi.fn()} 
        title="Accessible Modal"
        description="This modal is accessible"
      >
        <div>Modal Content</div>
      </Modal>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby')
    expect(modal).toHaveAttribute('aria-describedby')
  })

  it('supports custom z-index', () => {
    render(
      <Modal open={true} onClose={vi.fn()} zIndex={9999}>
        <div>High Z-Index Modal</div>
      </Modal>
    )
    
    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveStyle('z-index: 9999')
  })

  it('renders loading state', () => {
    render(
      <Modal open={true} onClose={vi.fn()} loading>
        <div>Modal Content</div>
      </Modal>
    )
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('handles animation states', async () => {
    const { rerender } = render(
      <Modal open={false} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    rerender(
      <Modal open={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('animate-in')
  })

  it('supports nested modals', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Parent Modal">
        <div>
          <p>Parent Content</p>
          <Modal open={true} onClose={vi.fn()} title="Child Modal">
            <div>Child Content</div>
          </Modal>
        </div>
      </Modal>
    )
    
    expect(screen.getByText('Parent Modal')).toBeInTheDocument()
    expect(screen.getByText('Child Modal')).toBeInTheDocument()
    expect(screen.getByText('Parent Content')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })
})