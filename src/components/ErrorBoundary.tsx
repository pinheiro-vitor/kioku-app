import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
                    <div className="bg-destructive/10 p-6 rounded-full mb-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Ops, algo deu errado</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Ocorreu um erro inesperado em nossa aplicação. Nossa equipe foi notificada (mentira, foi só logado no console 😉).
                    </p>
                    <div className="space-x-4">
                        <Button onClick={this.handleReset} variant="default">
                            Tentar Novamente
                        </Button>
                        <Button onClick={() => window.location.href = '/'} variant="outline">
                            Voltar ao Início
                        </Button>
                    </div>
                    {this.state.error && (
                        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left max-w-lg w-full overflow-auto text-xs font-mono text-muted-foreground">
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
