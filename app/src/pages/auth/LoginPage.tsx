import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est requise')
    .email('Veuillez saisir une adresse email valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, resetPassword, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch {
      // L'erreur est geree dans AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const email = getValues('email');
    if (!email) {
      setResetError('Veuillez saisir votre adresse email ci-dessus');
      return;
    }

    setResetError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      setResetError('Erreur lors de l\'envoi. Verifiez votre adresse email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo et branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PPEO</h1>
          <p className="text-slate-500 mt-1">Plateforme Projet Etude Ogoula</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-lg">
              {resetMode ? 'Reinitialiser le mot de passe' : 'Connexion'}
            </CardTitle>
            <CardDescription>
              {resetMode
                ? 'Saisissez votre email pour recevoir un lien de reinitialisation'
                : 'Entrez vos identifiants pour acceder a votre espace'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!resetMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Erreur d'authentification */}
                {authError && (
                  <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {authError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setResetSent(false);
                      setResetError(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Mot de passe oublie ?
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {resetSent ? (
                  <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg text-center">
                    Un lien de reinitialisation a ete envoye a votre adresse email.
                    Verifiez votre boite de reception.
                  </div>
                ) : (
                  <>
                    {resetError && (
                      <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {resetError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Adresse email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre@email.com"
                        {...register('email')}
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleResetPassword}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="size-4" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer le lien de reinitialisation'
                      )}
                    </Button>
                  </>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(false);
                      setResetSent(false);
                      setResetError(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Retour a la connexion
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          PPEO - Plateforme Projet Etude Ogoula
        </p>
      </div>
    </div>
  );
}
