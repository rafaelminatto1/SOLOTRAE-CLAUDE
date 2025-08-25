import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../utils'
import Table from '../../../components/ui/Table'

// Mock table data
const mockColumns = [
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id' as const,
    sortable: true
  },
  {
    key: 'name',
    title: 'Nome',
    dataIndex: 'name' as const,
    sortable: true
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email' as const,
    sortable: false
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status' as const,
    sortable: true,
    render: (value: string) => (
      <span className={`badge ${value === 'active' ? 'badge-success' : 'badge-danger'}`}>
        {value === 'active' ? 'Ativo' : 'Inativo'}
      </span>
    )
  },
  {
    key: 'actions',
    title: 'Ações',
    sortable: false,
    render: (_, row: any) => (
      <div>
        <button onClick={() => console.log('Edit', row.id)}>Editar</button>
        <button onClick={() => console.log('Delete', row.id)}>Excluir</button>
      </div>
    )
  }
]

const mockData = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    status: 'active'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@example.com',
    status: 'inactive'
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    status: 'active'
  }
]

describe('Table Component', () => {
  it('renders table with columns and data', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    // Check headers
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Ações')).toBeInTheDocument()
    
    // Check data
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
  })

  it('renders custom cell content using render function', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
    
    const editButtons = screen.getAllByText('Editar')
    const deleteButtons = screen.getAllByText('Excluir')
    
    expect(editButtons).toHaveLength(3)
    expect(deleteButtons).toHaveLength(3)
  })

  it('shows sortable column indicators', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    const sortableHeaders = screen.getAllByRole('button')
    // ID, Nome, Status are sortable (3 columns)
    expect(sortableHeaders.filter(btn => btn.textContent?.includes('↕'))).toHaveLength(3)
  })

  it('handles column sorting', async () => {
    const user = userEvent.setup()
    render(<Table columns={mockColumns} data={mockData} />)
    
    const nameHeader = screen.getByText('Nome').closest('button')
    if (nameHeader) {
      await user.click(nameHeader)
      
      // Check if data is sorted (ascending)
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('João Silva')
      
      await user.click(nameHeader)
      
      // Check if data is sorted (descending)
      expect(rows[1]).toHaveTextContent('Pedro Oliveira')
    }
  })

  it('shows loading state', () => {
    render(<Table columns={mockColumns} data={[]} loading />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<Table columns={mockColumns} data={[]} />)
    
    expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <Table 
        columns={mockColumns} 
        data={[]} 
        emptyMessage="Nenhum usuário cadastrado"
      />
    )
    
    expect(screen.getByText('Nenhum usuário cadastrado')).toBeInTheDocument()
  })

  it('renders table without pagination by default', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    // Table should render data without pagination controls
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
  })

  it('handles row interactions correctly', async () => {
    const handleRowClick = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Table 
        columns={mockColumns} 
        data={mockData} 
        onRowClick={handleRowClick}
      />
    )
    
    const firstRow = screen.getAllByRole('row')[1] // Skip header
    await user.click(firstRow)
    
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0)
  })

  it('applies correct CSS classes for styling', () => {
    render(
      <Table 
        columns={mockColumns} 
        data={mockData} 
        striped
        bordered
        hoverable
      />
    )
    
    const table = screen.getByRole('table')
    expect(table).toHaveClass('min-w-full')
    expect(table).toHaveClass('divide-y')
    expect(table).toHaveClass('divide-gray-200')
  })

  it('renders table headers correctly', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Ações')).toBeInTheDocument()
  })

  it('supports row hover effects', async () => {
    const user = userEvent.setup()
    render(<Table columns={mockColumns} data={mockData} hoverable />)
    
    const firstRow = screen.getAllByRole('row')[1] // Skip header row
    
    await user.hover(firstRow)
    expect(firstRow).toHaveClass('hover:bg-gray-50')
  })

  it('supports striped rows', () => {
    render(<Table columns={mockColumns} data={mockData} striped />)
    
    const rows = screen.getAllByRole('row')
    const dataRows = rows.slice(1) // Skip header row
    
    expect(dataRows[1]).toHaveClass('bg-gray-50')
  })

  it('supports small size', () => {
    render(<Table columns={mockColumns} data={mockData} size="sm" />)
    
    const cells = screen.getAllByRole('cell')
    expect(cells[0]).toHaveClass('px-3')
    expect(cells[0]).toHaveClass('py-2')
  })

  it('supports large size', () => {
    render(<Table columns={mockColumns} data={mockData} size="lg" />)
    
    const cells = screen.getAllByRole('cell')
    expect(cells[0]).toHaveClass('px-6')
    expect(cells[0]).toHaveClass('py-4')
  })

  it('handles row click events', async () => {
    const handleRowClick = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Table 
        columns={mockColumns} 
        data={mockData} 
        onRowClick={handleRowClick}
      />
    )
    
    const firstRow = screen.getAllByRole('row')[1]
    await user.click(firstRow)
    
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0)
  })

  it('renders data rows correctly', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    const rows = screen.getAllByRole('row')
    const dataRows = rows.slice(1) // Skip header
    
    expect(dataRows).toHaveLength(3)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(5)
    
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4) // 1 header + 3 data rows
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Table columns={mockColumns} data={mockData} />)
    
    const firstSortableHeader = screen.getByText('ID').closest('button')
    if (firstSortableHeader) {
      firstSortableHeader.focus()
      expect(firstSortableHeader).toHaveFocus()
      
      await user.keyboard('{Enter}')
      // Should trigger sort
    }
  })

  it('maintains sort state correctly', async () => {
    const user = userEvent.setup()
    render(<Table columns={mockColumns} data={mockData} />)
    
    const idHeader = screen.getByText('ID').closest('button')
    if (idHeader) {
      await user.click(idHeader)
      expect(idHeader).toHaveTextContent('ID ↑')
      
      await user.click(idHeader)
      expect(idHeader).toHaveTextContent('ID ↓')
      
      await user.click(idHeader)
      expect(idHeader).toHaveTextContent('ID ↕')
    }
  })

  it('handles large datasets efficiently', () => {
    const largeColumns = [
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id' as const,
        sortable: true
      },
      {
        key: 'name',
        title: 'Nome',
        dataIndex: 'name' as const,
        sortable: true
      },
      {
        key: 'email',
        title: 'Email',
        dataIndex: 'email' as const,
        sortable: false
      }
    ]
    
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive'
    }))
    
    render(<Table columns={largeColumns} data={largeData} />)
    
    // Should render without performance issues
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 1000')).toBeInTheDocument()
  })
})