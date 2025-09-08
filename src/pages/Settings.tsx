import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import { UserRole } from '@shared/types';
import {
  Settings as SettingsIcon,
  User,
  Monitor,
  Building,
  Bell,
  Globe,
  Palette,
  Clock,
  Shield,
  Save,
  AlertCircle
} from 'lucide-react';

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  timezone: string;
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
}

interface ClinicSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: {
    monday: { start: string; end: string; closed: boolean };
    tuesday: { start: string; end: string; closed: boolean };
    wednesday: { start: string; end: string; closed: boolean };
    thursday: { start: string; end: string; closed: boolean };
    friday: { start: string; end: string; closed: boolean };
    saturday: { start: string; end: string; closed: boolean };
    sunday: { start: string; end: string; closed: boolean };
  };
  specialties: string[];
  appointment_duration: number;
  max_advance_booking: number;
}

export default function Settings() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('user');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Carregar configurações do usuário
      const { data: userSettingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (userSettingsData) {
        setUserSettings(userSettingsData);
      } else {
        // Criar configurações padrão se não existirem
        const defaultSettings: Partial<UserSettings> = {
          user_id: user?.id,
          theme: 'system',
          language: 'pt',
          notifications_email: true,
          notifications_push: true,
          notifications_sms: false,
          timezone: 'America/Sao_Paulo',
          date_format: 'DD/MM/YYYY',
          time_format: '24h'
        };
        
        const { data: newSettings } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (newSettings) setUserSettings(newSettings);
      }

      // Carregar configurações da clínica (apenas para admin/fisioterapeuta)
      if (hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST])) {
        const { data: clinicData } = await supabase
          .from('clinic_settings')
          .select('*')
          .single();

        if (clinicData) {
          setClinicSettings(clinicData);
        } else {
          // Criar configurações padrão da clínica
          const defaultClinicSettings: Partial<ClinicSettings> = {
            name: 'FisioFlow Clínica',
            address: '',
            phone: '',
            email: '',
            opening_hours: {
              monday: { start: '08:00', end: '18:00', closed: false },
              tuesday: { start: '08:00', end: '18:00', closed: false },
              wednesday: { start: '08:00', end: '18:00', closed: false },
              thursday: { start: '08:00', end: '18:00', closed: false },
              friday: { start: '08:00', end: '18:00', closed: false },
              saturday: { start: '08:00', end: '12:00', closed: false },
              sunday: { start: '08:00', end: '12:00', closed: true }
            },
            specialties: ['Fisioterapia Geral', 'Ortopedia', 'Neurologia'],
            appointment_duration: 60,
            max_advance_booking: 30
          };
          
          const { data: newClinicSettings } = await supabase
            .from('clinic_settings')
            .insert(defaultClinicSettings)
            .select()
            .single();
            
          if (newClinicSettings) setClinicSettings(newClinicSettings);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const saveUserSettings = async () => {
    if (!userSettings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .update(userSettings)
        .eq('id', userSettings.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const saveClinicSettings = async () => {
    if (!clinicSettings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('clinic_settings')
        .update(clinicSettings)
        .eq('id', clinicSettings.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Configurações da clínica salvas com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar configurações da clínica:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações da clínica' });
    } finally {
      setSaving(false);
    }
  };

  const updateUserSetting = (key: keyof UserSettings, value: any) => {
    if (userSettings) {
      setUserSettings({ ...userSettings, [key]: value });
    }
  };

  const updateClinicSetting = (key: keyof ClinicSettings, value: any) => {
    if (clinicSettings) {
      setClinicSettings({ ...clinicSettings, [key]: value });
    }
  };

  const updateOpeningHours = (day: string, field: 'start' | 'end' | 'closed', value: any) => {
    if (clinicSettings) {
      setClinicSettings({
        ...clinicSettings,
        opening_hours: {
          ...clinicSettings.opening_hours,
          [day]: {
            ...clinicSettings.opening_hours[day as keyof typeof clinicSettings.opening_hours],
            [field]: value
          }
        }
      });
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
    { id: 'user', label: 'Usuário', icon: User },
    { id: 'system', label: 'Sistema', icon: Monitor },
    ...(hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST]) 
      ? [{ id: 'clinic', label: 'Clínica', icon: Building }] 
      : [])
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-500" />
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5" />
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

          {/* Conteúdo das configurações */}
          <div className="flex-1">
            {activeTab === 'user' && userSettings && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Configurações de Usuário
                </h2>

                <div className="space-y-6">
                  {/* Preferências de Perfil */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Preferências de Perfil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={userSettings.language} onValueChange={(value) => updateUserSetting('language', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select value={userSettings.timezone} onValueChange={(value) => updateUserSetting('timezone', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fuso horário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Formato de Data e Hora */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Formato de Data e Hora</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date_format">Formato de Data</Label>
                        <Select value={userSettings.date_format} onValueChange={(value) => updateUserSetting('date_format', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato de data" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="time_format">Formato de Hora</Label>
                        <Select value={userSettings.time_format} onValueChange={(value) => updateUserSetting('time_format', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato de hora" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveUserSettings} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'system' && userSettings && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Configurações do Sistema
                </h2>

                <div className="space-y-6">
                  {/* Tema */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Aparência
                    </h3>
                    <div>
                      <Label htmlFor="theme">Tema</Label>
                      <Select value={userSettings.theme} onValueChange={(value) => updateUserSetting('theme', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notificações */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notificações
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifications_email">Notificações por Email</Label>
                          <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
                        </div>
                        <Switch
                          checked={userSettings.notifications_email}
                          onCheckedChange={(checked) => updateUserSetting('notifications_email', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifications_push">Notificações Push</Label>
                          <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                        </div>
                        <Switch
                          checked={userSettings.notifications_push}
                          onCheckedChange={(checked) => updateUserSetting('notifications_push', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifications_sms">Notificações por SMS</Label>
                          <p className="text-sm text-gray-500">Receber notificações por mensagem de texto</p>
                        </div>
                        <Switch
                          checked={userSettings.notifications_sms}
                          onCheckedChange={(checked) => updateUserSetting('notifications_sms', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveUserSettings} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'clinic' && clinicSettings && hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST]) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Configurações da Clínica
                </h2>

                <div className="space-y-6">
                  {/* Dados da Clínica */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados da Clínica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="clinic_name">Nome da Clínica</Label>
                        <Input
                          id="clinic_name"
                          value={clinicSettings.name}
                          onChange={(e) => updateClinicSetting('name', e.target.value)}
                          placeholder="Nome da clínica"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="clinic_address">Endereço</Label>
                        <Input
                          id="clinic_address"
                          value={clinicSettings.address}
                          onChange={(e) => updateClinicSetting('address', e.target.value)}
                          placeholder="Endereço completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="clinic_phone">Telefone</Label>
                        <Input
                          id="clinic_phone"
                          value={clinicSettings.phone}
                          onChange={(e) => updateClinicSetting('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="clinic_email">Email</Label>
                        <Input
                          id="clinic_email"
                          type="email"
                          value={clinicSettings.email}
                          onChange={(e) => updateClinicSetting('email', e.target.value)}
                          placeholder="contato@clinica.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horários de Funcionamento */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Horários de Funcionamento
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(clinicSettings.opening_hours).map(([day, hours]) => {
                        const dayNames: { [key: string]: string } = {
                          monday: 'Segunda-feira',
                          tuesday: 'Terça-feira',
                          wednesday: 'Quarta-feira',
                          thursday: 'Quinta-feira',
                          friday: 'Sexta-feira',
                          saturday: 'Sábado',
                          sunday: 'Domingo'
                        };
                        
                        return (
                          <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-32">
                              <span className="font-medium">{dayNames[day]}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!hours.closed}
                                onCheckedChange={(checked) => updateOpeningHours(day, 'closed', !checked)}
                              />
                              <span className="text-sm">Aberto</span>
                            </div>
                            
                            {!hours.closed && (
                              <>
                                <Input
                                  type="time"
                                  value={hours.start}
                                  onChange={(e) => updateOpeningHours(day, 'start', e.target.value)}
                                  className="w-32"
                                />
                                <span>às</span>
                                <Input
                                  type="time"
                                  value={hours.end}
                                  onChange={(e) => updateOpeningHours(day, 'end', e.target.value)}
                                  className="w-32"
                                />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configurações de Agendamento */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Configurações de Agendamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="appointment_duration">Duração da Consulta (minutos)</Label>
                        <Input
                          id="appointment_duration"
                          type="number"
                          value={clinicSettings.appointment_duration}
                          onChange={(e) => updateClinicSetting('appointment_duration', parseInt(e.target.value))}
                          min="15"
                          max="180"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max_advance_booking">Agendamento Antecipado (dias)</Label>
                        <Input
                          id="max_advance_booking"
                          type="number"
                          value={clinicSettings.max_advance_booking}
                          onChange={(e) => updateClinicSetting('max_advance_booking', parseInt(e.target.value))}
                          min="1"
                          max="365"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveClinicSettings} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}