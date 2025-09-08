import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { AnimatedContainer } from '../components/ui/AnimatedContainer';
import { EnhancedForm, FormField, EnhancedInput, SubmitButton } from '../components/ui/EnhancedForm';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema } from '../utils/formValidation';
import { toast } from 'sonner';
import { useEnhancedForm } from '../hooks/useEnhancedForm';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useEnhancedForm({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (data) => {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Erro ao fazer login');
      }
    }
  });

  const handleCredentialClick = (field: keyof LoginForm, value: string) => {
    form.setFieldValue(field, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">FisioFlow</CardTitle>
            <CardDescription>Entre na sua conta</CardDescription>
          </CardHeader>
          <CardContent>

             {/* Login Form */}
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="Digite seu email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     className="pl-10"
                     required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="password">Senha</Label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     placeholder="Digite sua senha"
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
               </div>

               <Button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
               >
                 {loading ? 'Entrando...' : 'Entrar'}
               </Button>

                {/* Test Credentials */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Credenciais de Teste:</h3>
                  <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                    <p><strong>Email:</strong> admin@fisioflow.com</p>
                    <p><strong>Senha:</strong> admin123</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Não tem uma conta?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="w-full"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Criar Nova Conta
            </Button>
          </div>
        </AnimatedContainer>
      </div>
  );
}