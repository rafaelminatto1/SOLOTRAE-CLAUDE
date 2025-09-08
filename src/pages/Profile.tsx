import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { UserRole } from '@shared/types';
import {
  User,
  Camera,
  Save,
  Upload,
  Activity,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'private' | 'contacts_only';
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
  allow_messages: boolean;
  allow_appointment_reminders: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function Profile() {
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do perfil
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Carregar configurações de privacidade
      const { data: privacyData } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (privacyData) {
        setPrivacySettings(privacyData);
      } else {
        // Criar configurações padrão de privacidade
        const defaultPrivacy: Partial<PrivacySettings> = {
          user_id: user?.id,
          profile_visibility: 'contacts_only',
          show_email: false,
          show_phone: false,
          show_address: false,
          allow_messages: true,
          allow_appointment_reminders: true
        };
        
        const { data: newPrivacy } = await supabase
          .from('privacy_settings')
          .insert(defaultPrivacy)
          .select()
          .single();
          
        if (newPrivacy) setPrivacySettings(newPrivacy);
      }

      // Carregar histórico de atividades (últimas 20)
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activityData) {
        setActivityLog(activityData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do perfil' });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          address: profile.address,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      // Registrar atividade
      await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id,
          action: 'profile_update',
          description: 'Perfil atualizado',
          created_at: new Date().toISOString()
        });
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      loadProfileData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' });
    } finally {
      setSaving(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!privacySettings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('privacy_settings')
        .update(privacySettings)
        .eq('id', privacySettings.id);

      if (error) throw error;
      
      // Registrar atividade
      await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id,
          action: 'privacy_update',
          description: 'Configurações de privacidade atualizadas',
          created_at: new Date().toISOString()
        });
      
      setMessage({ type: 'success', text: 'Configurações de privacidade salvas com sucesso!' });
      loadProfileData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar configurações de privacidade:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações de privacidade' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione apenas arquivos de imagem' });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB' });
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      // Atualizar perfil com nova URL do avatar
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Registrar atividade
      await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id,
          action: 'avatar_update',
          description: 'Foto de perfil atualizada',
          created_at: new Date().toISOString()
        });

      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
      loadProfileData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      setMessage({ type: 'error', text: 'Erro ao fazer upload da foto' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    if (!profile || !profile.avatar_url) return;

    try {
      setUploadingPhoto(true);
      
      // Remover URL do avatar do perfil
      const { error } = await supabase
        .from('users')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Registrar atividade
      await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id,
          action: 'avatar_remove',
          description: 'Foto de perfil removida',
          created_at: new Date().toISOString()
        });

      setProfile({ ...profile, avatar_url: undefined });
      setMessage({ type: 'success', text: 'Foto de perfil removida com sucesso!' });
      loadProfileData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setMessage({ type: 'error', text: 'Erro ao remover foto' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [key]: value });
    }
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: any) => {
    if (privacySettings) {
      setPrivacySettings({ ...privacySettings, [key]: value });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'profile_update':
        return <Save className="h-4 w-4" />;
      case 'avatar_update':
        return <Camera className="h-4 w-4" />;
      case 'privacy_update':
        return <Shield className="h-4 w-4" />;
      case 'appointment_create':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'activity', label: 'Atividades', icon: Activity }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <User className="h-8 w-8 text-blue-500" />
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie suas informações pessoais e configurações de privacidade
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com abas */}
          <div className="lg:w-64">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Conteúdo do perfil */}
          <div className="flex-1">
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                {/* Foto de Perfil */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Foto de Perfil
                  </h2>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.full_name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </Avatar>
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhoto ? 'Enviando...' : 'Alterar Foto'}
                      </Button>
                      
                      {profile.avatar_url && (
                        <Button
                          onClick={removePhoto}
                          disabled={uploadingPhoto}
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Foto
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Dados Pessoais */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Dados Pessoais</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name || ''}
                          onChange={(e) => updateProfile('full_name', e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={profile.date_of_birth || ''}
                          onChange={(e) => updateProfile('date_of_birth', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={(e) => updateProfile('address', e.target.value)}
                        placeholder="Seu endereço completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ''}
                        onChange={(e) => updateProfile('bio', e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={saveProfile} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'privacy' && privacySettings && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Privacidade
                </h2>

                <div className="space-y-6">
                  {/* Visibilidade do Perfil */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Visibilidade do Perfil</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="profile_visibility"
                          value="public"
                          checked={privacySettings.profile_visibility === 'public'}
                          onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-medium">Público</span>
                          <p className="text-sm text-gray-500">Qualquer pessoa pode ver seu perfil</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="profile_visibility"
                          value="contacts_only"
                          checked={privacySettings.profile_visibility === 'contacts_only'}
                          onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-medium">Apenas Contatos</span>
                          <p className="text-sm text-gray-500">Apenas profissionais da clínica podem ver</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="profile_visibility"
                          value="private"
                          checked={privacySettings.profile_visibility === 'private'}
                          onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-medium">Privado</span>
                          <p className="text-sm text-gray-500">Apenas você pode ver seu perfil</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Informações Visíveis */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informações Visíveis</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Mostrar Email</span>
                        </div>
                        <Switch
                          checked={privacySettings.show_email}
                          onCheckedChange={(checked) => updatePrivacySetting('show_email', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>Mostrar Telefone</span>
                        </div>
                        <Switch
                          checked={privacySettings.show_phone}
                          onCheckedChange={(checked) => updatePrivacySetting('show_phone', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Mostrar Endereço</span>
                        </div>
                        <Switch
                          checked={privacySettings.show_address}
                          onCheckedChange={(checked) => updatePrivacySetting('show_address', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comunicação */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Comunicação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Permitir Mensagens</span>
                          <p className="text-sm text-gray-500">Outros usuários podem enviar mensagens</p>
                        </div>
                        <Switch
                          checked={privacySettings.allow_messages}
                          onCheckedChange={(checked) => updatePrivacySetting('allow_messages', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Lembretes de Consulta</span>
                          <p className="text-sm text-gray-500">Receber lembretes sobre consultas agendadas</p>
                        </div>
                        <Switch
                          checked={privacySettings.allow_appointment_reminders}
                          onCheckedChange={(checked) => updatePrivacySetting('allow_appointment_reminders', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={savePrivacySettings} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'activity' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Histórico de Atividades
                </h2>

                <div className="space-y-4">
                  {activityLog.length > 0 ? (
                    activityLog.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          {getActivityIcon(activity.action)}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.description}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(activity.created_at)}
                            </span>
                            {activity.ip_address && (
                              <span>IP: {activity.ip_address}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade registrada ainda</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}