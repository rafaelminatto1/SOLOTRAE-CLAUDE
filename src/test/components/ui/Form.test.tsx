import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../utils'
import Form from '../../../components/ui/Form'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

// Mock form data
const mockFormData = {
  name: '',
  email: '',
  phone: '',
  message: ''
}

const mockValidationRules = {
  name: {
    required: true,
    minLength: 2,
    message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email deve ter um formato válido'
  },
  phone: {
    required: false,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone deve ter o formato (XX) XXXXX-XXXX'
  },
  message: {
    required: true,
    maxLength: 500,
    message: 'Mensagem é obrigatória e deve ter no máximo 500 caracteres'
  }
}

describe('Form Component', () => {
  it('renders form with fields', () => {
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <Input name="name" label="Nome" placeholder="Digite seu nome" />
        <Input name="email" label="Email" type="email" placeholder="Digite seu email" />
        <Input name="phone" label="Telefone" placeholder="(XX) XXXXX-XXXX" />
        <Input name="message" label="Mensagem" as="textarea" placeholder="Digite sua mensagem" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.type(screen.getByLabelText('Email'), 'joao@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com'
      })
    })
  })

  it('prevents submission with invalid data', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Form 
        onSubmit={handleSubmit} 
        initialData={mockFormData}
        validationRules={mockValidationRules}
      >
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório e deve ter pelo menos 2 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Email deve ter um formato válido')).toBeInTheDocument()
    })
    
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('shows field-level validation errors', async () => {
    const user = userEvent.setup()
    
    render(
      <Form 
        onSubmit={vi.fn()} 
        initialData={mockFormData}
        validationRules={mockValidationRules}
      >
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
      </Form>
    )
    
    const nameInput = screen.getByLabelText('Nome')
    const emailInput = screen.getByLabelText('Email')
    
    // Test invalid name (too short)
    await user.type(nameInput, 'A')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório e deve ter pelo menos 2 caracteres')).toBeInTheDocument()
    })
    
    // Test invalid email format
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Email deve ter um formato válido')).toBeInTheDocument()
    })
  })

  it('clears validation errors when field becomes valid', async () => {
    const user = userEvent.setup()
    
    render(
      <Form 
        onSubmit={vi.fn()} 
        initialData={mockFormData}
        validationRules={mockValidationRules}
      >
        <Input name="name" label="Nome" />
      </Form>
    )
    
    const nameInput = screen.getByLabelText('Nome')
    
    // First, trigger validation error
    await user.type(nameInput, 'A')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório e deve ter pelo menos 2 caracteres')).toBeInTheDocument()
    })
    
    // Then, fix the error
    await user.clear(nameInput)
    await user.type(nameInput, 'João Silva')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.queryByText('Nome é obrigatório e deve ter pelo menos 2 caracteres')).not.toBeInTheDocument()
    })
  })

  it('handles form reset', async () => {
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
        <Button type="reset">Limpar</Button>
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    const nameInput = screen.getByLabelText('Nome')
    const emailInput = screen.getByLabelText('Email')
    
    // Fill form
    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'joao@example.com')
    
    expect(nameInput).toHaveValue('João Silva')
    expect(emailInput).toHaveValue('joao@example.com')
    
    // Reset form
    await user.click(screen.getByRole('button', { name: 'Limpar' }))
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('shows loading state during submission', async () => {
    const handleSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    expect(screen.getByText('Enviando...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
  })

  it('handles submission errors', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Erro no servidor'))
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    await waitFor(() => {
      expect(screen.getByText('Erro no servidor')).toBeInTheDocument()
    })
  })

  it('supports controlled form values', () => {
    const formData = {
      name: 'João Silva',
      email: 'joao@example.com'
    }
    
    render(
      <Form onSubmit={vi.fn()} data={formData}>
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
      </Form>
    )
    
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument()
  })

  it('supports custom validation functions', async () => {
    const customValidation = {
      name: {
        validator: (value: string) => {
          if (value.toLowerCase().includes('admin')) {
            return 'Nome não pode conter "admin"'
          }
          return null
        }
      }
    }
    
    const user = userEvent.setup()
    
    render(
      <Form 
        onSubmit={vi.fn()} 
        initialData={mockFormData}
        validationRules={customValidation}
      >
        <Input name="name" label="Nome" />
      </Form>
    )
    
    await user.type(screen.getByLabelText('Nome'), 'admin user')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('Nome não pode conter "admin"')).toBeInTheDocument()
    })
  })

  it('supports conditional field validation', async () => {
    const conditionalRules = {
      phone: {
        required: (formData: any) => formData.contactMethod === 'phone',
        message: 'Telefone é obrigatório quando método de contato é telefone'
      }
    }
    
    const user = userEvent.setup()
    
    render(
      <Form 
        onSubmit={vi.fn()} 
        initialData={{ ...mockFormData, contactMethod: 'phone' }}
        validationRules={conditionalRules}
      >
        <Input name="phone" label="Telefone" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    await waitFor(() => {
      expect(screen.getByText('Telefone é obrigatório quando método de contato é telefone')).toBeInTheDocument()
    })
  })

  it('supports field dependencies', async () => {
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <Input name="hasPhone" type="checkbox" label="Possui telefone" />
        <Input 
          name="phone" 
          label="Telefone" 
          disabled={(formData: any) => !formData.hasPhone}
        />
      </Form>
    )
    
    const phoneInput = screen.getByLabelText('Telefone')
    expect(phoneInput).toBeDisabled()
    
    await user.click(screen.getByLabelText('Possui telefone'))
    
    expect(phoneInput).not.toBeDisabled()
  })

  it('handles file upload fields', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    render(
      <Form onSubmit={handleSubmit} initialData={mockFormData}>
        <Input name="document" type="file" label="Documento" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    const fileInput = screen.getByLabelText('Documento')
    await user.upload(fileInput, file)
    
    expect(fileInput.files?.[0]).toBe(file)
    
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        document: file
      })
    })
  })

  it('supports form sections and fieldsets', () => {
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <fieldset>
          <legend>Informações Pessoais</legend>
          <Input name="name" label="Nome" />
          <Input name="email" label="Email" type="email" />
        </fieldset>
        <fieldset>
          <legend>Contato</legend>
          <Input name="phone" label="Telefone" />
        </fieldset>
      </Form>
    )
    
    expect(screen.getByText('Informações Pessoais')).toBeInTheDocument()
    expect(screen.getByText('Contato')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <Input name="name" label="Nome" required />
        <Input name="email" label="Email" type="email" required />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    const nameInput = screen.getByLabelText('Nome')
    expect(nameInput).toHaveAttribute('required')
    expect(nameInput).toHaveAttribute('aria-required', 'true')
    
    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={vi.fn()} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Input name="email" label="Email" type="email" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    const nameInput = screen.getByLabelText('Nome')
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Enviar' })
    
    nameInput.focus()
    expect(nameInput).toHaveFocus()
    
    await user.tab()
    expect(emailInput).toHaveFocus()
    
    await user.tab()
    expect(submitButton).toHaveFocus()
  })

  it('supports form submission via Enter key', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Form onSubmit={handleSubmit} initialData={mockFormData}>
        <Input name="name" label="Nome" />
        <Button type="submit">Enviar</Button>
      </Form>
    )
    
    const nameInput = screen.getByLabelText('Nome')
    await user.type(nameInput, 'João Silva')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'João Silva'
      })
    })
  })
})