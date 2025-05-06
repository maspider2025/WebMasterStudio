import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, Bell, Shield, Eye, EyeOff, Save, Language, Monitor, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/lib/protected-route';

function ConfiguracoesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('geral');
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Estados das configurações
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('pt-BR');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showActivity: true,
    collectAnalytics: true,
  });
  const [appearance, setAppearance] = useState({
    fontSize: 'normal',
    colorScheme: 'blue',
    reduceMotion: false,
  });

  // Função para salvar configurações
  const saveSettings = () => {
    setSaving(true);
    
    // Simulação de salvar configurações
    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      });
    }, 1000);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Carregando suas configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da plataforma.
          </p>
        </div>
        
        <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex">
            <TabsTrigger value="geral" className="text-sm">
              <Settings className="mr-2 h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="text-sm">
              <Palette className="mr-2 h-4 w-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="text-sm">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="privacidade" className="text-sm">
              <Shield className="mr-2 h-4 w-4" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais da sua conta e preferências de idioma.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">Selecione o idioma de exibição da interface.</p>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="theme">Tema</Label>
                    <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Label
                          htmlFor="theme-light"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${theme === 'light' ? 'border-primary' : ''}`}
                        >
                          <Sun className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Claro</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Label
                          htmlFor="theme-dark"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${theme === 'dark' ? 'border-primary' : ''}`}
                        >
                          <Moon className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Escuro</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <Label
                          htmlFor="theme-system"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${theme === 'system' ? 'border-primary' : ''}`}
                        >
                          <Monitor className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Sistema</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <p className="text-sm text-muted-foreground">Selecione o tema da interface.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving} 
                  className="ml-auto gap-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Configurações de Aparência */}
          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a interface de acordo com suas preferências visuais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label>Tamanho da fonte</Label>
                    <RadioGroup 
                      value={appearance.fontSize} 
                      onValueChange={(value) => setAppearance({...appearance, fontSize: value})} 
                      className="grid grid-cols-3 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem value="small" id="font-small" className="sr-only" />
                        <Label
                          htmlFor="font-small"
                          className={`flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.fontSize === 'small' ? 'border-primary' : ''}`}
                        >
                          <span className="text-xs font-medium">Pequeno</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="normal" id="font-normal" className="sr-only" />
                        <Label
                          htmlFor="font-normal"
                          className={`flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.fontSize === 'normal' ? 'border-primary' : ''}`}
                        >
                          <span className="text-sm font-medium">Normal</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="large" id="font-large" className="sr-only" />
                        <Label
                          htmlFor="font-large"
                          className={`flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.fontSize === 'large' ? 'border-primary' : ''}`}
                        >
                          <span className="text-base font-medium">Grande</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label>Esquema de cores</Label>
                    <RadioGroup 
                      value={appearance.colorScheme} 
                      onValueChange={(value) => setAppearance({...appearance, colorScheme: value})} 
                      className="grid grid-cols-4 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem value="blue" id="color-blue" className="sr-only" />
                        <Label
                          htmlFor="color-blue"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.colorScheme === 'blue' ? 'border-primary' : ''}`}
                        >
                          <div className="h-6 w-6 rounded-full bg-blue-500 mb-2" />
                          <span className="text-sm font-medium">Azul</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="purple" id="color-purple" className="sr-only" />
                        <Label
                          htmlFor="color-purple"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.colorScheme === 'purple' ? 'border-primary' : ''}`}
                        >
                          <div className="h-6 w-6 rounded-full bg-purple-500 mb-2" />
                          <span className="text-sm font-medium">Roxo</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="green" id="color-green" className="sr-only" />
                        <Label
                          htmlFor="color-green"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.colorScheme === 'green' ? 'border-primary' : ''}`}
                        >
                          <div className="h-6 w-6 rounded-full bg-green-500 mb-2" />
                          <span className="text-sm font-medium">Verde</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="orange" id="color-orange" className="sr-only" />
                        <Label
                          htmlFor="color-orange"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${appearance.colorScheme === 'orange' ? 'border-primary' : ''}`}
                        >
                          <div className="h-6 w-6 rounded-full bg-orange-500 mb-2" />
                          <span className="text-sm font-medium">Laranja</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex items-center justify-between space-y-0 pb-2 pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduceMotion">Reduzir animações</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz ou desativa animações na interface
                    </p>
                  </div>
                  <Switch
                    id="reduceMotion"
                    checked={appearance.reduceMotion}
                    onCheckedChange={(checked) => setAppearance({...appearance, reduceMotion: checked})}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving} 
                  className="ml-auto gap-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure suas preferências de notificações e alertas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificações por email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notificações push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações em tempo real no navegador
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="updates-notifications">Atualizações de produtos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre novos recursos e melhorias
                      </p>
                    </div>
                    <Switch
                      id="updates-notifications"
                      checked={notifications.updates}
                      onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-notifications">Comunicações de marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba informações sobre promoções e ofertas especiais
                      </p>
                    </div>
                    <Switch
                      id="marketing-notifications"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving} 
                  className="ml-auto gap-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Configurações de Privacidade */}
          <TabsContent value="privacidade">
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Segurança</CardTitle>
                <CardDescription>
                  Controle suas configurações de privacidade e compartilhamento de informações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-profile">Perfil público</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {privacy.showProfile ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      <Switch
                        id="show-profile"
                        checked={privacy.showProfile}
                        onCheckedChange={(checked) => setPrivacy({...privacy, showProfile: checked})}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-activity">Atividade pública</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar sua atividade para outros usuários
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {privacy.showActivity ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      <Switch
                        id="show-activity"
                        checked={privacy.showActivity}
                        onCheckedChange={(checked) => setPrivacy({...privacy, showActivity: checked})}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="collect-analytics">Coleta de dados de uso</Label>
                      <p className="text-sm text-muted-foreground">
                        Compartilhar dados anônimos para melhorar a plataforma
                      </p>
                    </div>
                    <Switch
                      id="collect-analytics"
                      checked={privacy.collectAnalytics}
                      onCheckedChange={(checked) => setPrivacy({...privacy, collectAnalytics: checked})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
                <Button variant="outline" className="gap-1 text-destructive w-full sm:w-auto">
                  <Shield className="h-4 w-4" />
                  Verificar segurança da conta
                </Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving} 
                  className="gap-1 w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProtectedConfiguracoesPage() {
  return (
    <ProtectedRoute path="/configuracoes" component={ConfiguracoesPage} />
  );
}