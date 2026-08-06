import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleRestart = () => {
    try {
      sessionStorage.clear();
    } catch (e) {}
    window.location.replace('/');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fond-base flex flex-col justify-between p-20 select-none font-interface text-encre-forte">
          <div className="flex flex-col gap-24 mt-48 text-center">
            <h1 className="font-titres text-2xl font-bold text-danger">
              Erreur technique
            </h1>
            <p className="text-sm text-encre-douce leading-relaxed px-16">
              La réponse n'a pas pu être chargée ou une erreur inattendue est survenue. Pour votre sécurité, les numéros d'aide d'urgence indispensables restent accessibles en direct ci-dessous.
            </p>

            <div className="bg-fond-carte border border-bordure rounded-lg p-16 flex flex-col gap-12 mt-16 max-w-[320px] mx-auto w-full">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block text-center">
                Numéros d'urgence Congolais
              </span>

              <a
                href="tel:117"
                className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-danger text-texte-sur-fonce active:opacity-90 transition-transform active:scale-95 touch-manipulation text-base"
              >
                Appeler la Police (117)
              </a>

              <a
                href="tel:1444"
                className="w-full min-h-[56px] rounded-md font-bold text-center flex items-center justify-center gap-8 bg-primaire text-texte-sur-fonce active:bg-primaire-contact transition-transform active:scale-95 touch-manipulation text-base"
              >
                Appeler l'écoute (1444)
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-12 mb-24">
            <button
              onClick={this.handleRestart}
              className="w-full min-h-[48px] rounded-md font-bold text-center flex items-center justify-center bg-fond-encart text-encre-forte border border-bordure active:bg-fond-base transition-transform active:scale-95 touch-manipulation text-sm"
            >
              Redémarrer l'application
            </button>
            <button
              onClick={() => window.location.replace('https://www.google.cg')}
              className="w-full min-h-[48px] rounded-md font-bold text-center flex items-center justify-center bg-danger text-texte-sur-fonce active:opacity-90 transition-transform active:scale-95 touch-manipulation text-sm"
            >
              Sortie Rapide
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
