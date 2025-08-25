import React, { useState } from 'react';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { Patient, PatientStatus, Gender, MaritalStatus } from '@shared/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserPlus,
  Users,
  Activity,
  Calendar,
  FileText,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cake,
  IdCard,
  Home,
  Building
} from 'lucide-react';



interface PatientFormData {
  first_name: string;
  last_name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  profession: string;
  marital_status: MaritalStatus;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  insurance_name: string;
  insurance_number: string;
  medical_notes: string;
  allergies: string;
  current_medications: string;
  family_history: string;
  status: PatientStatus;
}

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sexFilter, setSexFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    last_name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    gender: Gender.MALE,
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    profession: '',
    marital_status: MaritalStatus.SINGLE,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_name: '',
    insurance_number: '',
    medical_notes: '',
    allergies: '',
    current_medications: '',
    family_history: '',
    status: PatientStatus.ACTIVE
  });

  // API calls
  const { data: patientsData, loading, refetch } = useApiGet<{
    patients: Patient[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/patients?search=${searchQuery}&status=${statusFilter}&sex=${sexFilter}&page=${currentPage}&limit=${pageSize}`);

  const { mutate: createPatient, loading: creating } = useApiPost('/patients');
  const { mutate: updatePatient, loading: updating } = useApiPut(`/patients/${editingPatient?.id}`);
  const { mutate: deletePatient, loading: deleting } = useApiDelete(`/patients/${patientToDelete?.id}`);

  const patients = patientsData?.patients || [];
  const totalPatients = patientsData?.total || 0;

  const getStatusBadge = (status: PatientStatus) => {
    const variants = {
      [PatientStatus.ACTIVE]: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      [PatientStatus.INACTIVE]: { variant: 'secondary' as const, label: 'Inativo', icon: Clock },
      [PatientStatus.DISCHARGED]: { variant: 'destructive' as const, label: 'Alta', icon: AlertTriangle }
    };
    
    const config = variants[status] || variants[PatientStatus.ACTIVE];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSexLabel = (gender: Gender | 'M' | 'F' | 'Other') => {
    const labels = {
      [Gender.MALE]: 'Masculino',
      [Gender.FEMALE]: 'Feminino',
      [Gender.OTHER]: 'Outro',
      'M': 'Masculino',
      'F': 'Feminino',
      'Other': 'Outro'
    };
    return labels[gender as keyof typeof labels] || gender;
  };

  const getMaritalStatusLabel = (maritalStatus: MaritalStatus) => {
    const labels = {
      [MaritalStatus.SINGLE]: 'Solteiro(a)',
      [MaritalStatus.MARRIED]: 'Casado(a)',
      [MaritalStatus.DIVORCED]: 'Divorciado(a)',
      [MaritalStatus.WIDOWED]: 'Viúvo(a)'
    };
    return labels[maritalStatus] || maritalStatus;
  };

  const getInitials = (firstName: string, lastName: string) => {
    const initials = (firstName[0] || '') + (lastName[0] || '');
    return initials.toUpperCase();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      cpf: patient.cpf,
      rg: patient.rg || '',
      birth_date: patient.birth_date,
      gender: patient.gender as Gender,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || '',
      state: patient.state || '',
      zip_code: patient.zip_code || '',
      profession: patient.profession || '',
      marital_status: patient.marital_status || MaritalStatus.SINGLE,
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      insurance_name: patient.insurance_name || '',
      insurance_number: patient.insurance_number || '',
      medical_notes: patient.medical_notes || '',
      allergies: patient.allergies || '',
      current_medications: patient.current_medications || '',
      family_history: patient.family_history || '',
      status: patient.status
    });
    setShowEditModal(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      cpf: '',
      rg: '',
      birth_date: '',
      gender: Gender.MALE,
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      profession: '',
      marital_status: MaritalStatus.SINGLE,
      emergency_contact_name: '',
      emergency_contact_phone: '',
      insurance_name: '',
      insurance_number: '',
      medical_notes: '',
      allergies: '',
      current_medications: '',
      family_history: '',
      status: PatientStatus.ACTIVE
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const patientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatting
        rg: formData.rg || undefined,
        birth_date: formData.birth_date,
        gender: formData.gender,
        phone: formData.phone.replace(/\D/g, ''), // Remove formatting
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip_code: formData.zip_code.replace(/\D/g, '') || undefined, // Remove formatting
        profession: formData.profession || undefined,
        marital_status: formData.marital_status,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone.replace(/\D/g, '') || undefined,
        insurance_name: formData.insurance_name || undefined,
        insurance_number: formData.insurance_number || undefined,
        medical_notes: formData.medical_notes || undefined,
        allergies: formData.allergies || undefined,
        current_medications: formData.current_medications || undefined,
        family_history: formData.family_history || undefined,
        status: formData.status
      };

      if (editingPatient) {
        await updatePatient(patientData);
        setShowEditModal(false);
        setEditingPatient(null);
      } else {
        await createPatient(patientData);
        setShowAddModal(false);
      }
      
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      await deletePatient();
      setShowDeleteModal(false);
      setPatientToDelete(null);
      refetch();
    }
  };

  const statusOptions = [
    { value: PatientStatus.ACTIVE, label: 'Ativo' },
    { value: PatientStatus.INACTIVE, label: 'Inativo' },
    { value: PatientStatus.DISCHARGED, label: 'Alta' }
  ];

  const sexOptions = [
    { value: Gender.MALE, label: 'Masculino' },
    { value: Gender.FEMALE, label: 'Feminino' },
    { value: Gender.OTHER, label: 'Outro' }
  ];

  const maritalStatusOptions = [
    { value: MaritalStatus.SINGLE, label: 'Solteiro(a)' },
    { value: MaritalStatus.MARRIED, label: 'Casado(a)' },
    { value: MaritalStatus.DIVORCED, label: 'Divorciado(a)' },
    { value: MaritalStatus.WIDOWED, label: 'Viúvo(a)' }
  ];

  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const PatientForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nome *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              placeholder="Digite o nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Sobrenome *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              placeholder="Digite o sobrenome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setFormData({ ...formData, cpf: value });
                }
              }}
              required
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              placeholder="Digite o RG"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento *</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo *</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sexOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marital_status">Estado Civil</Label>
            <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value as MaritalStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession">Profissão</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Digite a profissão"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              required
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número, complemento"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Digite a cidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosBrasil.map(estado => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                  setFormData({ ...formData, zip_code: value });
                }
              }}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
        </div>
      </div>

      {/* Contato de Emergência */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contato de Emergência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              placeholder="Nome do contato de emergência"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setFormData({ ...formData, emergency_contact_phone: value });
                }
              }}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Convênio */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Convênio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="insurance_name">Nome do Convênio</Label>
            <Input
              id="insurance_name"
              value={formData.insurance_name}
              onChange={(e) => setFormData({ ...formData, insurance_name: e.target.value })}
              placeholder="Nome do convênio médico"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance_number">Número do Convênio</Label>
            <Input
              id="insurance_number"
              value={formData.insurance_number}
              onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
              placeholder="Número da carteirinha"
            />
          </div>
        </div>
      </div>

      {/* Informações Médicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Médicas</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              rows={2}
              placeholder="Descreva alergias conhecidas..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_medications">Medicamentos em Uso</Label>
            <Textarea
              id="current_medications"
              value={formData.current_medications}
              onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
              rows={2}
              placeholder="Liste medicamentos em uso contínuo..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="family_history">Histórico Familiar</Label>
            <Textarea
              id="family_history"
              value={formData.family_history}
              onChange={(e) => setFormData({ ...formData, family_history: e.target.value })}
              rows={2}
              placeholder="Histórico de doenças na família..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medical_notes">Observações Médicas</Label>
            <Textarea
              id="medical_notes"
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              rows={3}
              placeholder="Observações gerais sobre o paciente..."
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
              setEditingPatient(null);
            } else {
              setShowAddModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={creating || updating}>
          {creating || updating ? 'Salvando...' : isEdit ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de pacientes da clínica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{totalPatients} pacientes</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{patients.filter(p => p.status === PatientStatus.ACTIVE).length} ativos</span>
            </div>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Paciente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do paciente abaixo.
                </DialogDescription>
              </DialogHeader>
              <PatientForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes por nome, CPF ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sexFilter} onValueChange={setSexFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os sexos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os sexos</SelectItem>
                  {sexOptions.map(sex => (
                    <SelectItem key={sex.value} value={sex.value}>
                      {sex.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {totalPatients} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Idade/Sexo</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Nenhum paciente encontrado
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(patient.first_name, patient.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Cake className="mr-1 h-3 w-3" />
                              {calculateAge(patient.birth_date)} anos
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center">
                            <Phone className="mr-2 h-3 w-3" />
                            {formatPhone(patient.phone)}
                          </div>
                          {patient.email && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="mr-2 h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {calculateAge(patient.birth_date)} anos
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getSexLabel(patient.gender)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {formatCPF(patient.cpf)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.insurance_name ? (
                            <div>
                              <div className="font-medium">{patient.insurance_name}</div>
                              {patient.insurance_number && (
                                <div className="text-muted-foreground">
                                  {patient.insurance_number}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Particular</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(patient.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(patient)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(patient)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPatients > pageSize && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                {Math.min(currentPage * pageSize, totalPatients)} de {totalPatients} pacientes
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage * pageSize >= totalPatients}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente abaixo.
            </DialogDescription>
          </DialogHeader>
          <PatientForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedPatient.first_name, selectedPatient.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                  <p className="text-muted-foreground">
                    {calculateAge(selectedPatient.birth_date)} anos • {getSexLabel(selectedPatient.gender)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedPatient.status)}
                    {selectedPatient.insurance_name && (
                      <Badge variant="outline">
                        {selectedPatient.insurance_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações Pessoais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">CPF:</span>
                      <span className="ml-2 font-mono">{formatCPF(selectedPatient.cpf)}</span>
                    </div>
                    {selectedPatient.rg && (
                      <div>
                        <span className="text-muted-foreground">RG:</span>
                        <span className="ml-2">{selectedPatient.rg}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Data de Nascimento:</span>
                      <span className="ml-2">{formatDate(selectedPatient.birth_date)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado Civil:</span>
                      <span className="ml-2">{getMaritalStatusLabel(selectedPatient.marital_status || MaritalStatus.SINGLE)}</span>
                    </div>
                    {selectedPatient.profession && (
                      <div>
                        <span className="text-muted-foreground">Profissão:</span>
                        <span className="ml-2">{selectedPatient.profession}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contato
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="ml-2">{formatPhone(selectedPatient.phone)}</span>
                    </div>
                    {selectedPatient.email && (
                      <div>
                        <span className="text-muted-foreground">E-mail:</span>
                        <span className="ml-2">{selectedPatient.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                {(selectedPatient.address || selectedPatient.city) && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Endereço
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedPatient.address && (
                        <div>
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="ml-2">{selectedPatient.address}</span>
                        </div>
                      )}
                      {selectedPatient.city && (
                        <div>
                          <span className="text-muted-foreground">Cidade:</span>
                          <span className="ml-2">{selectedPatient.city} - {selectedPatient.state}</span>
                        </div>
                      )}
                      {selectedPatient.zip_code && (
                        <div>
                          <span className="text-muted-foreground">CEP:</span>
                          <span className="ml-2">{formatCEP(selectedPatient.zip_code)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contato de Emergência */}
                {selectedPatient.emergency_contact_name && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Contato de Emergência
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="ml-2">{selectedPatient.emergency_contact_name}</span>
                      </div>
                      {selectedPatient.emergency_contact_phone && (
                        <div>
                          <span className="text-muted-foreground">Telefone:</span>
                          <span className="ml-2">{formatPhone(selectedPatient.emergency_contact_phone)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Convênio */}
                {selectedPatient.insurance_name && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Convênio
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Convênio:</span>
                        <span className="ml-2">{selectedPatient.insurance_name}</span>
                      </div>
                      {selectedPatient.insurance_number && (
                        <div>
                          <span className="text-muted-foreground">Número:</span>
                          <span className="ml-2">{selectedPatient.insurance_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações Médicas */}
                {(selectedPatient.allergies || selectedPatient.current_medications) && (
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Informações Médicas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedPatient.allergies && (
                        <div>
                          <span className="text-muted-foreground font-medium">Alergias:</span>
                          <p className="mt-1 text-sm bg-muted p-2 rounded">{selectedPatient.allergies}</p>
                        </div>
                      )}
                      {selectedPatient.current_medications && (
                        <div>
                          <span className="text-muted-foreground font-medium">Medicamentos em Uso:</span>
                          <p className="mt-1 text-sm bg-muted p-2 rounded">{selectedPatient.current_medications}</p>
                        </div>
                      )}
                      {selectedPatient.family_history && (
                        <div>
                          <span className="text-muted-foreground font-medium">Histórico Familiar:</span>
                          <p className="mt-1 text-sm bg-muted p-2 rounded">{selectedPatient.family_history}</p>
                        </div>
                      )}
                      {selectedPatient.medical_notes && (
                        <div>
                          <span className="text-muted-foreground font-medium">Observações Médicas:</span>
                          <p className="mt-1 text-sm bg-muted p-2 rounded">{selectedPatient.medical_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cadastrado em: {formatDate(selectedPatient.created_at)}</span>
                  <span>Atualizado em: {formatDate(selectedPatient.updated_at)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Paciente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o paciente {patientToDelete?.first_name} {patientToDelete?.last_name}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Paciente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;