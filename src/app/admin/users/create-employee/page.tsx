'use client'

import { Dashboard } from '@/components/Layout/Dashboard'
import React, { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
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
  Image as ImageIcon
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useRouter } from 'next/navigation'
// Schéma de formulaire avec Zod (traduction française)
const formSchema = z.object({
  first_name: z.string().min(2, { message: 'Le prénom est requis' }),
  last_name: z.string().min(2, { message: 'Le nom est requis' }),
  gender: z.string(),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  password_confirmation: z.string().min(1, { message: 'Veuillez confirmer votre mot de passe' }),
  birth_date: z.date(),
  national_id: z.string().min(1, { message: 'La pièce d\'identité est requise' }),
  phone_number: z.string().min(1, { message: 'Le numéro de téléphone est requis' }),
  address: z.string().min(1, { message: 'L\'adresse est requise' }),
  hire_date: z.date(),
  job_title: z.string().min(1, { message: 'Le titre du poste est requis' }),
  department_id: z.number(),
  employment_type: z.string(),
  salaire_brut: z.number().positive(),
  status: z.string(),
  photo: z.string().optional(),
  role: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

const CreateEmployeePage = () => {
  // États pour la gestion du mot de passe
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [departmentName, setDepartmentName] = useState<Array<{id: number, name: string}> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Router for navigation after success
  const router = useRouter()
  
  // État pour la gestion de la photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
  getDepartmentName()
    
  }, [])

  // Initialisation du formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      gender: '',
      email: '',
      password: '',
      password_confirmation: '',
      national_id: '',
      phone_number: '',
      address: '',
      job_title: '',
      department_id: undefined,
      employment_type: 'CDI', // Updated to match Prisma enum
      salaire_brut: undefined,
      status: 'actif', // Updated to match Prisma enum
      photo: '',
      role: 'employe', // Updated to match Prisma enum
    },
  })

  // Calculate password strength when password changes
  useEffect(() => {
    const password = form.watch('password');
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [form.watch('password')]);

  // Auto-update confirmation password when generate is used
  useEffect(() => {
    if (isGeneratingPassword) {
      const password = form.watch('password');
      if (password) {
        form.setValue('password_confirmation', password);
      }
    }
  }, [form.watch('password'), isGeneratingPassword]);

  // Generate a secure password
  const generateSecurePassword = async () => {
    setIsGeneratingPassword(true);
    
    // Small delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    const all = charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
    let password = '';
    
    // Ensure at least one of each character type
    password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
    password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
    password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
    password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];
    
    // Complete to 12 characters
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    form.setValue('password', password);
    form.setValue('password_confirmation', password);
    setIsGeneratingPassword(false);
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    const password = form.getValues('password');
    if (password) {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Faible';
    if (passwordStrength <= 4) return 'Moyen';
    return 'Fort';
  };

  // Gestionnaire de téléchargement de photo amélioré
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      
      form.setValue('photo', base64String);
      console.log("Photo chargée avec succès:", base64String.substring(0, 50) + "...");
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      console.error("Erreur lors du chargement de l'image");
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
    console.log("Photo supprimée");
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Préparation des données du formulaire...");
      
      const formData = new FormData();
      
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('gender', data.gender);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('birth_date', data.birth_date.toISOString());
      formData.append('national_id', data.national_id);
      formData.append('phone_number', data.phone_number);
      formData.append('address', data.address);
      formData.append('hire_date', data.hire_date.toISOString());
      formData.append('job_title', data.job_title);
      formData.append('department_id', data.department_id.toString());
      formData.append('employment_type', data.employment_type);
      formData.append('salaire_brut', data.salaire_brut.toString());
      formData.append('status', data.status);
      formData.append('role', data.role);
      
      // Handle photo - if it's a base64 string from the preview, convert it to a file
      if (data.photo && data.photo.trim() !== '') {
        // If the photo is a base64 string (from our preview)
        if (data.photo.startsWith('data:image')) {
          // Convert base64 to blob
          const response = await fetch(data.photo);
          const blob = await response.blob();
          
          // Create a file from the blob
          const fileName = `photo_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          
          // Append the file to FormData
          formData.append('photo', file);
        } else {
          // If it's already a file or something else, just append it
          formData.append('photo', data.photo);
        }
      }
      
      console.log("Envoi des données au serveur...");
      const response = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log("Employé créé avec succès");
          
        toast.success("Employé créé avec succès", {
          description: `${data.first_name} ${data.last_name} a été ajouté à la base de données.`,
          duration: 5000,
          action: {
            label: "Voir tous les employés",
            onClick: () => router.push('/users')
          }
        });
        
        form.reset();
        setPhotoPreview(null);
        
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500); 
      } else {
        console.error("Erreur lors de la création de l'employé:", responseData);
        
        if (responseData.details && responseData.details.includes("Unique constraint failed on the fields: (`email`)")) {
          toast.error("Email déjà utilisé", {
            description: `L'adresse email "${data.email}" est déjà utilisée par un autre employé. Veuillez utiliser une adresse différente.`,
            duration: 8000,
          });
          
          // Met en évidence le champ email avec une erreur
          form.setError("email", { 
            type: "manual", 
            message: "Cette adresse email est déjà utilisée"
          });
        } else {
          toast.error("Erreur lors de la création", {
            description: responseData.message || responseData.error || "Une erreur est survenue lors de la création de l'employé",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Erreur de communication avec l'API:", error);
      
      toast.error("Erreur de communication", {
        description: "Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion et réessayer.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Données fictives des départements

  const getDepartmentName = async() => {
    
   try {
      const response = await fetch('/api/department');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des départements');
      }
      const data = await response.json();
      setDepartmentName(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      return [];
    }

  }

  // Les classes communes pour les inputs et selects
  const inputClasses = "border-blue-500 focus:border-blue-600 focus:ring-blue-500/20 dark:border-blue-700 dark:focus:border-blue-600";

  return (
    <Dashboard>
      {/* Add the Toaster component here */}
      <Toaster position="top-right" richColors />
      
      <div className="py-10 max-w-9xl px-4 sm:px-6 mx-auto">
        {/* En-tête professionnel avec dégradé */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Créer un Nouvel Employé</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Remplissez le formulaire ci-dessous avec les informations de l'employé</p>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Choisir une date de naissance"
                          id="birth_date"
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
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClasses}>
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentName?.map((dept: {id: number, name: string}) => (
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Choisir une date d'embauche"
                          id="hire_date"
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </div>
            </div>

            {/* Section Authentification & Identification */}
            <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Authentification & Identification</h2>
                </div>
                
                {/* Bouton de génération de mot de passe */}
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  disabled={isGeneratingPassword}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isGeneratingPassword ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Générer un mot de passe
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mot de passe avec fonctionnalités améliorées */}
                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Key className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Mot de passe
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Entrer le mot de passe" 
                              {...field} 
                              className={`pr-20 ${inputClasses}`}
                            />
                          </FormControl>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
                            {field.value && (
                              <button
                                type="button"
                                onClick={copyPassword}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                                title="Copier le mot de passe"
                              >
                                {passwordCopied ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Indicateur de force du mot de passe */}
                        {field.value && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Force du mot de passe:</span>
                              <span className={`text-xs font-medium ${
                                passwordStrength <= 2 ? 'text-red-600 dark:text-red-400' : 
                                passwordStrength <= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                              }`}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 6) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Exigences de mot de passe */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/20 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300 space-y-1 mt-2 border border-blue-100 dark:border-blue-900/30">
                    <div className="font-medium text-blue-700 dark:text-blue-400 mb-1">Exigences du mot de passe:</div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${form.watch('password')?.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Au moins 8 caractères</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(form.watch('password') || '') ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Une lettre majuscule</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(form.watch('password') || '') ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Un chiffre</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${/[^A-Za-z0-9]/.test(form.watch('password') || '') ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span>Un caractère spécial</span>
                    </div>
                  </div>
                </div>
                
                {/* Confirmation de mot de passe */}
                <div>
                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Confirmer le mot de passe
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPasswordConfirm ? "text" : "password"}
                              placeholder="Confirmer le mot de passe" 
                              {...field} 
                              className={`pr-12 ${inputClasses} ${
                                form.formState.errors.password_confirmation ? 'border-red-500 focus:border-red-600 focus:ring-red-500/20' : 
                                field.value && form.watch('password') === field.value ? 'border-green-500 focus:border-green-600' : ''
                              }`}
                            />
                          </FormControl>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {field.value && form.watch('password') === field.value && (
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                            )}
                            <button
                              type="button"
                              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                            >
                              {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        {field.value && form.watch('password') === field.value && !form.formState.errors.password_confirmation && (
                          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Les mots de passe correspondent</span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Champ de carte d'identité nationale */}
                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => (
                      <FormItem className="mt-4">
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

                {/* Sélection de rôle */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Rôle
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* Téléchargement de photo avec prévisualisation */}
                <div className="space-y-3">
                  <Label htmlFor="photo" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    Photo (optionnel)
                  </Label>
                  
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
              </div>
            </div>

            {/* Actions du formulaire */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="outline" 
                type="button"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 font-medium"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/30 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer l'employé"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Dashboard>
  )
}

export default CreateEmployeePage