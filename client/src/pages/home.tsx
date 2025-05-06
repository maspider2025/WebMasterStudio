import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-secondary border-b border-border py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg 
              className="w-8 h-8 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2L2 7L12 12L22 7L12 2Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M2 17L12 22L22 17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M2 12L12 17L22 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <span className="ml-2 text-xl font-semibold">NextGen Site Builder</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary">Login</Button>
            <Button>Registrar</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Construa seu site profissional sem código
            </h1>
            <p className="text-muted-foreground text-xl mb-8 max-w-3xl mx-auto">
              O NextGen Site Builder revoluciona a forma de criar websites com uma plataforma avançada de arrastar e soltar, 
              assistência de IA e ferramentas profissionais.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/editor?new=true">
                <Button size="lg" className="text-lg px-8 py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Projeto
                </Button>
              </Link>
              <Link href="/meus-projetos">
                <Button size="lg" className="text-lg px-8 py-6" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Meus Projetos
                </Button>
              </Link>
              <Link href="/editor?template=ecommerce">
                <Button size="lg" className="text-lg px-8 py-6" variant="secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Ver Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-secondary/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Recursos Exclusivos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <CardTitle>Editor Intuitivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Interface de arrastar e soltar avançada com controles precisos 
                    para criar seu site exatamente como você imagina.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-accent/10 text-accent p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <CardTitle>Assistente de IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Inteligência artificial integrada que sugere melhorias de design
                    e recomenda componentes ideais para cada seção.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <CardTitle>Modo de Código</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Alterne facilmente entre o editor visual e o código para personalização
                    avançada quando necessário.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary py-6 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2023 NextGen Site Builder. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
