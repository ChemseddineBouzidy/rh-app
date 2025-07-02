'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import { Dashboard } from '@/components/Layout/Dashboard';
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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';

const userSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.any().optional(),
  hire_date: z.any().optional(),
  job_title: z.string().optional(),
  department_id: z.string().optional(),
  role: z.string().min(1, 'Rôle requis'),
  status: z.string().min(1, 'Statut requis'),
  salaire_brut: z.number().optional(),
});

const UserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      birth_date: null,
      hire_date: null,
      job_title: '',
      department_id: '',
      role: '',
      status: '',
      salaire_brut: 0,
    },
  });

  // Fetch user profile and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await fetch(`/api/users/${userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserProfile(userData);
          
          // Populate form with user data
          form.reset({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone_number || '', // Fix: phone_number -> phone for form
            address: userData.address || '',
            birth_date: userData.birth_date ? dayjs(userData.birth_date) : null,
            hire_date: userData.hire_date ? dayjs(userData.hire_date) : null,
            job_title: userData.job_title || '',
            department_id: userData.department_id ? userData.department_id.toString() : '',
            role: userData.role || '',
            status: userData.status || '',
            salaire_brut: userData.salaire_brut || 0,
          });
        } else {
          toast.error('Utilisateur non trouvé');
          router.push('/admin/users');
        }

        // Fetch departments
        try {
          const deptResponse = await fetch('/api/department');
          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            setDepartments(deptData);
          } else {
            console.warn('Could not fetch departments');
            setDepartments([]);
          }
        } catch (deptError) {
          console.warn('Departments API not available:', deptError);
          setDepartments([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, form, router]);

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    setIsSubmitting(true);
    
    try {
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone || '', // Fix: provide empty string instead of null
        address: data.address || null,
        birth_date: data.birth_date ? dayjs(data.birth_date).format('YYYY-MM-DD') : null,
        hire_date: data.hire_date ? dayjs(data.hire_date).format('YYYY-MM-DD') : null,
        job_title: data.job_title || null,
        department_id: data.department_id && data.department_id !== "none" ? parseInt(data.department_id) : null,
        role: data.role,
        status: data.status,
        salaire_brut: data.salaire_brut || 0,
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Response:', response.status, result);

      if (response.ok) {
        setUserProfile(result.user);
        setIsEditing(false);
        toast.success('Utilisateur mis à jour avec succès !');
      } else {
        console.error('Update failed:', result);
        toast.error(result.error || result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Utilisateur supprimé avec succès');
        router.push('/admin/users');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
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
      <Dashboard>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="p-6 max-w-9xl mx-auto">
        <Toaster position="top-right" richColors />
        
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white p-6 border border-blue-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Détails Utilisateur</h1>
                <p className="text-gray-600 mt-1">Gérer les informations de l'utilisateur</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {userProfile?.status && (
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    userProfile.status === 'active' ? 'bg-green-500' : 
                    userProfile.status === 'inactive' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${getStatusColor(userProfile.status)}`}>
                    {userProfile.status === 'active' ? 'Actif' : 
                     userProfile.status === 'inactive' ? 'Inactif' : 'Archivé'}
                  </span>
                </div>
              )}
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                size="sm"
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Modifier
                  </>
                )}
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1  border-0">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="w-24 h-24  mx-auto">
                  <AvatarImage 
                    src={userProfile?.photo || undefined} 
                    alt={`${userProfile?.first_name} ${userProfile?.last_name}`} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                    {getInitials(userProfile?.first_name || '', userProfile?.last_name || '')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h2>
                  <p className="text-gray-500 text-sm">{userProfile?.job_title}</p>
                </div>

                <div className="space-y-2">
                  <Badge className={`px-3 py-1 ${getRoleColor(userProfile?.role || '')}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {userProfile?.role === 'admin' ? 'Administrateur' :
                     userProfile?.role === 'rh' ? 'Ressources Humaines' :
                     userProfile?.role === 'manager' ? 'Manager' :
                     userProfile?.role === 'employe' ? 'Employé' : userProfile?.role}
                  </Badge>
                  
                  {userProfile?.department && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{userProfile.department.name}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  {userProfile?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.phone_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{userProfile.phone_number}</span>
                    </div>
                  )}
                  {userProfile?.hire_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Embauché le {dayjs(userProfile.hire_date).format('DD/MM/YYYY')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="lg:col-span-2  border-0">
            <CardContent className="p-6 lg:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de naissance</FormLabel>
                            <FormControl>
                              <DatePicker
                                {...field}
                                disabled={!isEditing}
                                format="DD/MM/YYYY"
                                placeholder="Sélectionner une date"
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Poste</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Département</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || undefined}
                                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un département" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun département</SelectItem>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rôle</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employe">Employé</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="rh">RH</SelectItem>
                                  <SelectItem value="admin">Administrateur</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Actif</SelectItem>
                                  <SelectItem value="inactive">Inactif</SelectItem>
                                  <SelectItem value="archive">Archivé</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hire_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'embauche</FormLabel>
                            <FormControl>
                              <DatePicker
                                {...field}
                                disabled={!isEditing}
                                format="DD/MM/YYYY"
                                placeholder="Date d'embauche"
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salaire_brut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salaire brut</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                disabled={!isEditing}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  {isEditing && (
                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700  transition-all duration-200 font-medium flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Dashboard>
  );
};

export default UserDetailsPage;
