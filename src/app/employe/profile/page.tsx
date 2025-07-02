'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import EmployeeDashboardLayout from '../DashboardLayout';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2,
  Shield,
  Save,
  Edit,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Bell
} from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.any().optional(),
  hire_date: z.any().optional(),
});

const ProfilePage = () => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      birth_date: null,
      hire_date: null,
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUserProfile(userData);
          
          // Populate form with user data
          form.reset({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            birth_date: userData.birth_date ? dayjs(userData.birth_date) : null,
            hire_date: userData.hire_date ? dayjs(userData.hire_date) : null,
          });
        } else {
          toast.error('Erreur lors du chargement du profil');
        }
      } catch (error) {
        toast.error('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...data,
        birth_date: data.birth_date ? dayjs(data.birth_date).format('YYYY-MM-DD') : null,
        hire_date: data.hire_date ? dayjs(data.hire_date).format('YYYY-MM-DD') : null,
      };

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.user);
        setIsEditing(false);
        toast.success('Profil mis à jour avec succès !');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'rh':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'employe':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-orange-600';
      case 'archive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mon Profil
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos informations personnelles et professionnelles
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {userProfile?.status && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${
                  userProfile.status === 'active' ? 'bg-green-500' : 
                  userProfile.status === 'inactive' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <span className={getStatusColor(userProfile.status)}>
                  {userProfile.status === 'active' ? 'Actif' : 
                   userProfile.status === 'inactive' ? 'Inactif' : 'Archivé'}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              {isEditing ? <XCircle className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Profile Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.photo ? (
                    <img
                      src={userProfile.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-700 font-medium">
                      {getInitials(userProfile?.first_name || '', userProfile?.last_name || '')}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {userProfile?.first_name} {userProfile?.last_name}
                </h3>
                <p className="text-xs text-gray-500">
                  {userProfile?.role === 'admin' ? 'Administrateur' :
                   userProfile?.role === 'rh' ? 'RH' :
                   userProfile?.role === 'manager' ? 'Manager' :
                   'Employé'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Contact</h3>
                <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
              </div>
            </div>
          </div>

          {/* Department Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Département</h3>
                <p className="text-xs text-gray-500">{userProfile?.department?.name || 'Non assigné'}</p>
              </div>
            </div>
          </div>

          {/* Employment Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Embauche</h3>
                <p className="text-xs text-gray-500">
                  {userProfile?.hire_date ? 
                    new Date(userProfile.hire_date).toLocaleDateString('fr-FR') : 
                    'Non définie'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informations Personnelles</h2>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={userProfile?.first_name || ''}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={userProfile?.last_name || ''}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={userProfile?.phone_number || ''}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={userProfile?.birth_date ? userProfile.birth_date.split('T')[0] : ''}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={userProfile?.address || ''}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Professional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Informations Professionnelles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        value={userProfile?.role === 'admin' ? 'Administrateur' :
                               userProfile?.role === 'rh' ? 'Ressources Humaines' :
                               userProfile?.role === 'manager' ? 'Manager' :
                               userProfile?.role === 'employe' ? 'Employé' : userProfile?.role || ''}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'embauche
                      </label>
                      <input
                        type="date"
                        value={userProfile?.hire_date ? userProfile.hire_date.split('T')[0] : ''}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mise à jour...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Sauvegarder</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Résumé du Profil</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {getInitials(userProfile?.first_name || '', userProfile?.last_name || '')}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h3>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(userProfile?.role || '')}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {userProfile?.role === 'admin' ? 'Administrateur' :
                     userProfile?.role === 'rh' ? 'RH' :
                     userProfile?.role === 'manager' ? 'Manager' :
                     'Employé'}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {userProfile?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile?.department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{userProfile.department.name}</span>
                    </div>
                  )}
                  {userProfile?.hire_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Embauché le {new Date(userProfile.hire_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="text-xs text-gray-500">
                    <p><strong>ID:</strong> {userProfile?.id}</p>
                    <p><strong>Dernière mise à jour:</strong> {userProfile?.updated_at ? 
                      new Date(userProfile.updated_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
};

export default ProfilePage;
                          
