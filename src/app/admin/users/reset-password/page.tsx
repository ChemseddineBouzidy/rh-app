'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Mail, 
  User, 
  ArrowLeft, 
  Send, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Square
} from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('id');

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUser = async () => {
    setIsLoadingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        toast.error('Utilisateur non trouvé');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Erreur lors du chargement de l\'utilisateur');
    } finally {
      setIsLoadingUser(false);
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast.error('Email utilisateur non disponible');
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending reset password request for:', user.email);
      
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        toast.success('Email de réinitialisation envoyé avec succès');
      } else {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        console.log('Error content type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.error('JSON error response:', data);
          toast.error(data.error || 'Erreur lors de l\'envoi de l\'email');
        } else {
          // Handle HTML error responses (like 500 pages)
          const text = await response.text();
          console.error('HTML error response:', text.substring(0, 500)); // Log first 500 chars
          
          // Try to extract error message from HTML
          const errorMatch = text.match(/"message":"([^"]+)"/);
          const errorMessage = errorMatch ? errorMatch[1] : `Erreur ${response.status}: ${response.statusText}`;
          
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Network error sending reset email:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="p-3 sm:p-6 max-w-9xl mx-auto h-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 border border-red-100 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/admin/users">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </Link>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 sm:p-3 rounded-lg shadow-lg shadow-red-500/30">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Réinitialisation de mot de passe</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Générer et envoyer un nouveau mot de passe</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
              <span className="text-xs sm:text-sm text-gray-600">Action Sensible</span>
            </div>
          </div>
        </div>

        {userId && user ? (
          <div className="grid gap-4 sm:gap-6">
            {/* User Information */}
            <Card className="border-blue-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Informations de l'utilisateur
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Vérifiez les informations avant d'envoyer le nouveau mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {isLoadingUser ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Nom complet</Label>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-sm sm:text-lg text-gray-900 flex items-center gap-2 break-all">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="min-w-0">{user.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Rôle</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {user.role === 'admin' ? 'Administrateur' :
                             user.role === 'rh' ? 'Ressources Humaines' :
                             user.role === 'manager' ? 'Manager' :
                             user.role === 'employe' ? 'Employé' : user.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Statut</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs sm:text-sm ${user.status === 'active' ? 'bg-green-100 text-green-700' : ''}`}
                          >
                            {user.status === 'active' ? 'Actif' : user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reset Password Action */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Action de réinitialisation
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Cette action va générer un nouveau mot de passe et l'envoyer par email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Ce qui va se passer :
                  </h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600 ml-4 sm:ml-6">
                    <li>• Un nouveau mot de passe sécurisé sera généré automatiquement</li>
                    <li>• Le mot de passe actuel sera remplacé immédiatement</li>
                    <li>• Un email sera envoyé à l'utilisateur avec le nouveau mot de passe</li>
                    <li>• L'utilisateur devra changer son mot de passe à la première connexion</li>
                  </ul>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      Email de destination : <span className="font-medium">{user.email}</span>
                    </p>
                  </div>
                  <Button
                    onClick={handleSendResetEmail}
                    disabled={isSending}
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-sm sm:text-base"
                  >
                    {isSending ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Envoyer le nouveau mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // No user selected - show user selector
          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <Square className="h-10 w-10 sm:h-12 sm:w-12 fill-gray-400 mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">Aucun utilisateur sélectionné</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Pour réinitialiser un mot de passe, vous devez d'abord sélectionner un utilisateur spécifique. 
                Cette page fonctionne en recevant l'ID d'un utilisateur via le paramètre URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-4 sm:p-6 pt-0">
              <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 sm:p-4 rounded-lg">
                <p className="font-medium mb-2">Comment utiliser cette fonctionnalité :</p>
                <ol className="text-left space-y-1">
                  <li>1. Allez à la liste des utilisateurs</li>
                  <li>2. Trouvez l'utilisateur dont vous voulez réinitialiser le mot de passe</li>
                  <li>3. Cliquez sur le bouton "Réinitialiser le mot de passe" dans les actions</li>
                </ol>
              </div>
              <Link href="/admin/users">
                <Button className="w-full sm:w-auto text-sm sm:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Aller à la liste des utilisateurs
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}
