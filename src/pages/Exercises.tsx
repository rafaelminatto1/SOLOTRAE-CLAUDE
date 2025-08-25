import React, { useState, useCallback, useEffect } from 'react';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { Exercise, ExerciseDifficulty, ExerciseCategory } from '@shared/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Clock,
  Target,
  Activity,
  Grid3X3,
  List,
  Zap,
  Shield,
  Dumbbell,
  MoreHorizontal,
  Video,
  Image,
  Users,
  Star,
} from 'lucide-react';

interface ExerciseFormData {
  name: string;
  description: string;
  category: ExerciseCategory;
  subcategory: string;
  difficulty: ExerciseDifficulty;
  estimated_duration: string;
  equipment: string;
  muscle_groups: string;
  objectives: string;
  instructions: string;
  contraindications: string;
  video_url: string;
  image_url: string;
  tags: string;
  is_active: boolean;
}

const Exercises: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    category: ExerciseCategory.STRENGTHENING,
    subcategory: '',
    difficulty: ExerciseDifficulty.BEGINNER,
    estimated_duration: '',
    equipment: '',
    muscle_groups: '',
    objectives: '',
    instructions: '',
    contraindications: '',
    video_url: '',
    image_url: '',
    tags: '',
    is_active: true,
  });

  // API calls
  const { data: exercisesData, loading, execute: fetchExercises } = useApiGet<{
    exercises: Exercise[];
    total: number;
    page: number;
    pages: number;
  }>('/exercises', true, false);

  const refetch = useCallback(() => {
    const queryParams = {
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: searchQuery,
      categoria: categoryFilter,
      nivel: levelFilter,
    };
    
    // Remove empty params
    Object.keys(queryParams).forEach(key => {
      if (!queryParams[key as keyof typeof queryParams]) {
        delete queryParams[key as keyof typeof queryParams];
      }
    });
    
    return fetchExercises(undefined, queryParams);
  }, [fetchExercises, currentPage, pageSize, searchQuery, categoryFilter, levelFilter]);

  // Fetch exercises when dependencies change
  useEffect(() => {
    refetch();
  }, [refetch]);

  const { data: categoriesData } = useApiGet<{ categories: Array<{ id: string; nome: string; subcategorias: string[]; }> }>('/exercises/categories');

  const { execute: createExercise, loading: creating } = useApiPost('/exercises');
  const { execute: updateExercise, loading: updating } = useApiPut('/exercises');
  const { execute: deleteExercise, loading: deleting } = useApiDelete('/exercises');

  const exercises = exercisesData?.exercises || [];
  const totalExercises = exercisesData?.total || 0;
  const categories = categoriesData?.categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const exerciseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        difficulty: formData.difficulty,
        estimated_duration: parseInt(formData.estimated_duration),
        // equipment: formData.equipment ? formData.equipment.split(',').map(e => e.trim()).filter(e => e) : [],
      // muscle_groups: formData.muscle_groups ? formData.muscle_groups.split(',').map(g => g.trim()).filter(g => g) : [],
      // objectives: formData.objectives ? formData.objectives.split(',').map(o => o.trim()).filter(o => o) : [],
        instructions: formData.instructions.trim(),
        precautions: formData.contraindications.trim() || undefined,
        video_url: formData.video_url.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        // tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        is_active: formData.is_active,
      };

      if (editingExercise) {
        await updateExercise(`/exercises/${editingExercise.id}`, exerciseData);
        toast.success('Exercício atualizado com sucesso!');
      } else {
        await createExercise(exerciseData);
        toast.success('Exercício criado com sucesso!');
      }

      setShowModal(false);
      setEditingExercise(null);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao salvar exercício');
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      category: exercise.category as ExerciseCategory,
      subcategory: '',
      difficulty: exercise.difficulty as ExerciseDifficulty,
      estimated_duration: exercise.estimated_duration?.toString() || '',
      equipment: '',
      muscle_groups: '',
      objectives: '',
      instructions: exercise.instructions || '',
      contraindications: exercise.precautions || '',
      video_url: exercise.video_url || '',
      image_url: exercise.image_url || '',
      tags: '',
      is_active: exercise.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!exerciseToDelete) return;
    
    try {
      await deleteExercise(`/exercises/${exerciseToDelete.id}`);
      toast.success('Exercício excluído com sucesso!');
      setShowDeleteModal(false);
      setExerciseToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao excluir exercício');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: ExerciseCategory.STRENGTHENING,
      subcategory: '',
      difficulty: ExerciseDifficulty.BEGINNER,
      estimated_duration: '',
      equipment: '',
      muscle_groups: '',
      objectives: '',
      instructions: '',
      contraindications: '',
      video_url: '',
      image_url: '',
      tags: '',
      is_active: true,
    });
  };

  const getDifficultyColor = (level: ExerciseDifficulty) => {
    switch (level) {
      case ExerciseDifficulty.BEGINNER:
        return 'bg-green-100 text-green-800';
      case ExerciseDifficulty.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-800';
      case ExerciseDifficulty.ADVANCED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: ExerciseDifficulty) => {
    switch (level) {
      case ExerciseDifficulty.BEGINNER:
        return 'Iniciante';
      case ExerciseDifficulty.INTERMEDIATE:
        return 'Intermediário';
      case ExerciseDifficulty.ADVANCED:
        return 'Avançado';
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercícios</h1>
          <p className="text-gray-600 mt-1">Gerencie o catálogo de exercícios</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingExercise(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Exercício
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{exercise.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {exercise.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedExercise(exercise); setShowDetailsModal(true); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(exercise)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setExerciseToDelete(exercise); setShowDeleteModal(true); }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {exercise.estimated_duration}min
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-1" />
                    {exercise.category}
                  </div>
                  
                  {/* muscle_groups display removed - property doesn't exist in Exercise interface */}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {exercise.video_url && (
                        <Video className="h-4 w-4 text-blue-500" />
                      )}
                      {exercise.image_url && (
                        <Image className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <Badge variant={exercise.is_active ? 'default' : 'secondary'}>
                      {exercise.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {exercise.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{exercise.category}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {exercise.estimated_duration}min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exercise.is_active ? 'default' : 'secondary'}>
                      {exercise.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedExercise(exercise); setShowDetailsModal(true); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(exercise)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => { setExerciseToDelete(exercise); setShowDeleteModal(true); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </DialogTitle>
            <DialogDescription>
              {editingExercise ? 'Edite as informações do exercício' : 'Adicione um novo exercício ao catálogo'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do exercício"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExerciseCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={ExerciseCategory.STRENGTHENING}>Fortalecimento</option>
                  <option value={ExerciseCategory.CARDIO}>Cardio</option>
                  <option value={ExerciseCategory.STRETCHING}>Alongamento</option>
                  <option value={ExerciseCategory.BALANCE}>Equilíbrio</option>
                  <option value={ExerciseCategory.CERVICAL}>Cervical</option>
                  <option value={ExerciseCategory.UPPER_LIMBS}>Membros Superiores</option>
                  <option value={ExerciseCategory.TRUNK}>Tronco</option>
                  <option value={ExerciseCategory.LOWER_LIMBS}>Membros Inferiores</option>
                  <option value={ExerciseCategory.NEURAL_MOBILIZATION}>Mobilização Neural</option>
                  <option value={ExerciseCategory.GENERAL_MOBILITY}>Mobilidade Geral</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do exercício"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Dificuldade *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as ExerciseDifficulty }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={ExerciseDifficulty.BEGINNER}>Iniciante</option>
                  <option value={ExerciseDifficulty.INTERMEDIATE}>Intermediário</option>
                  <option value={ExerciseDifficulty.ADVANCED}>Avançado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duração (minutos) *</label>
                <Input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                  placeholder="30"
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Instruções *</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instruções detalhadas do exercício"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipamentos</label>
                <Input
                  value={formData.equipment}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="Halteres, barra, etc. (separados por vírgula)"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupos Musculares</label>
                <Input
                  value={formData.muscle_groups}
                  onChange={(e) => setFormData(prev => ({ ...prev, muscle_groups: e.target.value }))}
                  placeholder="Peito, ombros, etc. (separados por vírgula)"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Exercício ativo
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating ? 'Salvando...' : editingExercise ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o exercício "{exerciseToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.name}</DialogTitle>
            <DialogDescription>{selectedExercise?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Categoria</h4>
                  <p>{selectedExercise.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Nível</h4>
                  <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                    {getDifficultyLabel(selectedExercise.difficulty)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-2">Instruções</h4>
                <p className="text-sm">{selectedExercise.instructions}</p>
              </div>
              
              {/* muscle_groups and equipment sections removed - properties don't exist in Exercise interface */}
              
              {selectedExercise.precautions && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Precauções</h4>
                  <p className="text-sm">{selectedExercise.precautions}</p>
                </div>
              )}
              
              {selectedExercise.video_url && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Vídeo</h4>
                  <a href={selectedExercise.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Ver vídeo do exercício
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exercises;