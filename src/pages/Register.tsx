import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, UserCheck } from 'lucide-react';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { AnimatedContainer } from '../components/ui/AnimatedContainer';
import { registerSchema, RegisterFormData } from '../utils/formValidation';
import { useEnhancedForm } from '../hooks/useEnhancedForm';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useEnhancedForm<RegisterFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'patient'
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          userType: values.userType || 'patient'
        });
        
        toast.success('Cadastro realizado com sucesso!');
        navigate('/login');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao realizar cadastro');
        throw error;
      }
    }
  });

  const roleOptions = [
    { value: 'patient', label: 'Paciente' },
    { value: 'physiotherapist', label: 'Fisioterapeuta' },
    { value: 'admin', label: 'Administrador' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">FisioFlow</CardTitle>
            <CardDescription>Crie sua conta</CardDescription>
          </CardHeader>
          <CardContent>

            {/* Form */}
            <form onSubmit={form.handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    {...form.getFieldProps('name')}
                    className="pl-10"
                    required
                  />
                </div>
                {form.errors.name && form.touched.name && (
                  <p className="text-sm text-red-600">{form.errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    {...form.getFieldProps('email')}
                    className="pl-10"
                    required
                  />
                </div>
                {form.errors.email && form.touched.email && (
                  <p className="text-sm text-red-600">{form.errors.email}</p>
                )}
              </div>

              {/* User Type Field */}
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <select
                  id="userType"
                  {...form.getFieldProps('userType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {form.errors.userType && form.touched.userType && (
                  <p className="text-sm text-red-600">{form.errors.userType}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    {...form.getFieldProps('password')}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.errors.password && form.touched.password && (
                  <p className="text-sm text-red-600">{form.errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    {...form.getFieldProps('confirmPassword')}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.errors.confirmPassword && form.touched.confirmPassword && (
                  <p className="text-sm text-red-600">{form.errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={form.isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {form.isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">ou</span>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-muted-foreground mb-4">
                  Já tem uma conta?
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Fazer Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default Register;