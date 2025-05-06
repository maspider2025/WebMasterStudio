import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, User, Mail, Lock, Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/lib/protected-route';

// Esquema de validação para o formulário de perfil
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: 'Nome de usuário deve ter pelo menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Email inválido',
  }),
  fullName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Esquema de validação para o formulário de senha
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: 'Senha atual é obrigatória',
  }),
  newPassword: z.string().min(8, {
    message: 'Nova senha deve ter pelo menos 8 caracteres',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Confirme sua nova senha',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Formulário de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  // Formulário de senha
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest('PATCH', `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest('PATCH', `/api/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submissão do formulário de perfil
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Submissão do formulário de senha
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configure suas preferências.
          </p>
        </div>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="profile" className="text-sm">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="text-sm">
              <Lock className="mr-2 h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user?.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{user?.fullName || user?.username}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Camera className="h-4 w-4" />
                        Alterar foto
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive">
                        <X className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>

                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="seunome" {...field} />
                            </FormControl>
                            <FormDescription>
                              Este é seu nome de usuário para login no sistema.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="exemplo@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Este email será usado para comunicações importantes.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu Nome Completo" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Seu nome completo será exibido no seu perfil público.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da foto de perfil</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/imagem.jpg" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Insira o URL de uma imagem para usar como foto de perfil.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto gap-1"
                      disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Atualize sua senha e configurações de segurança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha atual</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Insira sua senha atual para confirmar sua identidade.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Sua nova senha deve ter pelo menos 8 caracteres.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Digite novamente sua nova senha para confirmar.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto gap-1"
                      disabled={updatePasswordMutation.isPending || !passwordForm.formState.isDirty}
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Atualizando senha...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Atualizar senha
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Atividade da conta</CardTitle>
                <CardDescription>
                  Informações sobre segurança e atividade da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Último login</h3>
                  <p className="text-sm text-muted-foreground">Hoje, 7:23 AM</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Dispositivos conectados</h3>
                  <p className="text-sm text-muted-foreground">Chrome em Windows • São Paulo, Brasil</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Endereço IP</h3>
                  <p className="text-sm text-muted-foreground">187.123.45.678</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="gap-1 text-destructive">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1 h-3.5 w-3.5"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="M6 8h.01" />
                    <path d="M10 8h.01" />
                    <path d="M14 8h.01" />
                    <path d="M18 8h.01" />
                    <path d="M8 12h.01" />
                    <path d="M12 12h.01" />
                    <path d="M16 12h.01" />
                    <path d="M7 16h10" />
                  </svg>
                  Desconectar todos os dispositivos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProtectedProfilePage() {
  return (
    <ProtectedRoute path="/meu-perfil" component={ProfilePage} />
  );
}