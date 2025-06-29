'use client';

import { Dashboard } from '@/components/Layout/Dashboard';
import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, 
  UserPlus, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Key,
  AlertTriangle,
  XCircle,
  Mail,
  Phone,
  Home,
  Briefcase,
  Building,
  User,
  Clock,
  CreditCard,
  ShieldCheck,
  Check,
  Users,
  Shield,
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

// Schéma de formulaire avec Zod (traduction française)
const formSchema = z.object({
  first_name: z.string().min(2, { message: 'Le prénom est requis' }),
  last_name: z.string().min(2, { message: 'Le nom est requis' }),
  gender: z.string(),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  birth_date: z.date(),
  national_id: z.string().min(1, { message: 'La pièce d\'identité est requise' }),
  phone_number: z.string().min(1, { message: 'Le numéro de téléphone est requis' }),
  address: z.string().min(1, { message: 'L\'adresse est requise' }),
  hire_date: z.date(),
  job_title: z.string().min(1, { message: 'Le titre du poste est requis' }),
  department_id: z.number().nullable(),
  employment_type: z.string(),
  salaire_brut: z.number().positive(),
  status: z.string(),
  photo: z.string().optional(),
  role: z.string(),
});

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  birth_date: string;
  national_id: string;
  hire_date: string;
  job_title: string;
  department_id: number | null;
  employment_type: string;
  salaire_brut: number;
  status: string;
  role: string;
  gender: string;
}

interface Department {
  id: number;
  name: string;
}

const EditUserPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  // États pour la gestion des données
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour la gestion de la photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialisation du formulaire avec react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      gender: '',
      email: '',
      national_id: '',
      phone_number: '',
      address: '',
      job_title: '',
      department_id: null,
      employment_type: 'CDI',
      salaire_brut: 0,
      status: 'actif',
      photo: '',
      role: 'employe',
    },
  });

  // Fetch user data and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch('/api/department');
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }

        // Fetch user data if editing
        if (userId) {
          const userResponse = await fetch(`/api/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Update form with fetched data
            form.reset({
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              email: userData.email || '',
              phone_number: userData.phone_number || '',
              address: userData.address || '',
              birth_date: userData.birth_date ? new Date(userData.birth_date) : new Date(),
              national_id: userData.national_id || '',
              hire_date: userData.hire_date ? new Date(userData.hire_date) : new Date(),
              job_title: userData.job_title || '',
              department_id: userData.department_id || null,
              employment_type: userData.employment_type || 'CDI',
              salaire_brut: userData.salaire_brut || 0,
              status: userData.status || 'actif',
              role: userData.role || 'employe',
              gender: userData.gender || '',
              photo: userData.photo || '',
            });
            
            // Set photo preview if exists
            if (userData.photo) {
              setPhotoPreview(userData.photo);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, form]);

  // Gestionnaire de téléchargement de photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      form.setValue('photo', base64String);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      console.error("Erreur lors du chargement de l'image");
      toast.error("Erreur lors du chargement de l'image");
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    form.setValue('photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        ...data,
        birth_date: data.birth_date.toISOString(),
        hire_date: data.hire_date.toISOString()
      };

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Utilisateur modifié avec succès", {
          description: `${data.first_name} ${data.last_name} a été mis à jour.`,
          duration: 5000,
        });
        
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        const errorData = await response.json();
        
        if (errorData.details && errorData.details.includes("Unique constraint failed on the fields: (`email`)")) {
          toast.error("Email déjà utilisé", {
            description: `L'adresse email "${data.email}" est déjà utilisée par un autre employé.`,
            duration: 8000,
          });
          
          form.setError("email", { 
            type: "manual", 
            message: "Cette adresse email est déjà utilisée"
          });
        } else {
          toast.error("Erreur lors de la modification", {
            description: errorData.error || 'Erreur lors de la sauvegarde',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error("Erreur de communication", {
        description: "Impossible de communiquer avec le serveur.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Les classes communes pour les inputs et selects
  const inputClasses = "border-blue-500 focus:border-blue-600 focus:ring-blue-500/20 dark:border-blue-700 dark:focus:border-blue-600";

  if (loading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <Toaster position="top-right" richColors />
      
      <div className="py-10 max-w-9xl px-4 sm:px-6 mx-auto">
        {/* En-tête professionnel avec dégradé */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Modifier l'Employé</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Modifiez les informations de l'employé ci-dessous</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Système RH</span>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section Informations Personnelles */}
            <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Informations Personnelles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" className={inputClasses} {...field} />
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
                        <Input placeholder="Nom" className={inputClasses} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de naissance</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal border-blue-500 focus:border-blue-600",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="national_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <ShieldCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Carte d'identité
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Numéro de carte d'identité" 
                          {...field} 
                          className={inputClasses}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section Coordonnées */}
            <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Coordonnées</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" className={inputClasses} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de téléphone" className={inputClasses} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Adresse" className={inputClasses} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section Informations d'Emploi */}
            <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Informations d'Emploi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du poste</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du poste" className={inputClasses} {...field} />
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
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun département</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'emploi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CDI">CDI</SelectItem>
                          <SelectItem value="CDD">CDD</SelectItem>
                          <SelectItem value="stage">Stage</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'embauche</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal border-blue-500 focus:border-blue-600",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaire_brut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire Brut</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Salaire brut" 
                          className={inputClasses}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="en_conge">En congé</SelectItem>
                          <SelectItem value="suspendu">Suspendu</SelectItem>
                          <SelectItem value="archive">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Rôle
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employe">Employé</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="rh">RH</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section Photo */}
            <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Photo de Profil</h2>
              </div>
              
              {/* Zone de prévisualisation de la photo */}
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : photoPreview ? (
                    <>
                      <img 
                        src={photoPreview} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Supprimer la photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-blue-400 dark:text-blue-300">
                      <Camera className="w-10 h-10 mb-1" />
                      <span className="text-xs font-medium">Aucune photo</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <label 
                    htmlFor="photo-upload" 
                    className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Télécharger</span>
                  </label>
                  <input 
                    id="photo-upload" 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden" 
                  />
                  
                  {/* Champ caché pour stocker les données de l'image */}
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Actions du formulaire */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => router.back()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 font-medium"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/30 font-medium flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Modification en cours...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Dashboard>
  );
};

export default EditUserPage;