"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { Dashboard } from "./Layout/Dashboard";
import { CalendarDays, FileText, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const leaveRequestSchema = z.object({
  user_id: z.string().min(1, "Utilisateur requis"),
  leave_type_id: z.string().min(1, "Type de congé requis"),
  dateRange: z
    .array(z.any())
    .length(2)
    .refine(([start, end]) => !!start && !!end, {
      message: "Veuillez sélectionner une plage de dates",
    }),
  reason: z.string().min(1, "Raison requise"),
  validatedBy: z.string().optional(),
  decisionReason: z.string().optional(),
});

export default function CreateLeaveRequestClient({ adminId, userInfo }: { adminId: string | null; userInfo: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string; photo?: string | null }[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [leaveTypeSearch, setLeaveTypeSearch] = useState("");
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [requestedDays, setRequestedDays] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      user_id: "",
      leave_type_id: "",
      dateRange: [null, null],
      reason: "",
      validatedBy: "",
      decisionReason: "",
    },
  });

  // Watch for changes in user, leave type and date range to check balance
  const watchedUserId = form.watch("user_id");
  const watchedLeaveTypeId = form.watch("leave_type_id");
  const watchedDateRange = form.watch("dateRange");

  useEffect(() => {
    // Reset balance info when any of the key fields change
    if (watchedDateRange[0] && watchedDateRange[1] && watchedUserId && watchedLeaveTypeId) {
      checkLeaveBalance();
    } else {
      setAvailableBalance(null);
      setRequestedDays(null);
      setBalanceError(null);
    }
  }, [watchedUserId, watchedLeaveTypeId, watchedDateRange]);

  const onSubmit = async (data: z.infer<typeof leaveRequestSchema>) => {
    setIsSubmitting(true);
    try {
      const [start, end] = data.dateRange;
      const startDate = start ? dayjs(start).format("YYYY-MM-DD") : "";
      const endDate = end ? dayjs(end).format("YYYY-MM-DD") : "";
      
      // Submit the leave request directly - let the API handle validation
      const res = await fetch("/api/leaveRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          leave_type_id: Number(data.leave_type_id),
          startDate,
          endDate,
          status: "APPROUVE", // Admin creates approved requests
          validatedBy: adminId,
        }),
      });
      
      if (res.ok) {
        toast.success("Demande de congé créée avec succès");
        form.reset();
        setAvailableBalance(null);
        setRequestedDays(null);
        setBalanceError(null);
        setValidationWarning(null);
      } else {
        const errorData = await res.json();
        
        // Handle specific validation errors
        if (res.status === 403) {
          if (errorData.error === 'Accès refusé aux congés annuels') {
            toast.error(`Demande refusée: ${errorData.message}`, {
              duration: 6000,
              description: `L'employé doit être embauché depuis au moins 6 mois pour demander des congés annuels.`
            });
          } else if (errorData.error === 'Quota de congés annuels dépassé') {
            toast.error(`Quota dépassé: ${errorData.message}`, {
              duration: 6000,
              description: errorData.debug ? 
                `Détails: ${errorData.debug.maxAllowed} jours max, ${errorData.debug.alreadyUsed} déjà utilisés, ${errorData.debug.requestedDays} demandés` : 
                undefined
            });
          } else {
            toast.error(errorData.message || errorData.error);
          }
        } else {
          toast.error(errorData.error || "Erreur lors de la création");
        }
        
        console.error("Leave request creation error:", errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced balance checking with validation warnings
  const checkLeaveBalance = async () => {
    if (!watchedUserId || !watchedLeaveTypeId || !watchedDateRange[0] || !watchedDateRange[1]) {
      return;
    }

    setIsCheckingBalance(true);
    setBalanceError(null);
    setValidationWarning(null);

    try {
      const startDate = dayjs(watchedDateRange[0]).format("YYYY-MM-DD");
      const endDate = dayjs(watchedDateRange[1]).format("YYYY-MM-DD");

      // Calculate business days first
      let businessDays = 0;
      const current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      setRequestedDays(businessDays);

      // Check if this is annual leave and get user info for validation preview
      const selectedLeaveType = leaveTypes.find(t => t.id.toString() === watchedLeaveTypeId);
      const selectedUser = users.find(u => u.id === watchedUserId);
      
      if (selectedLeaveType?.name === 'Congé annuel payé' && selectedUser) {
        // Get user details to check hire date
        const userResponse = await fetch(`/api/users/${watchedUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.hire_date) {
            const hireDate = new Date(userData.hire_date);
            const currentDate = new Date();
            const monthsDiff = (currentDate.getFullYear() - hireDate.getFullYear()) * 12 + 
                              (currentDate.getMonth() - hireDate.getMonth());
            
            if (monthsDiff < 6) {
              setValidationWarning(`⚠️ Attention: ${selectedUser.first_name} ${selectedUser.last_name} n'a que ${monthsDiff} mois d'ancienneté. 6 mois minimum requis pour les congés annuels.`);
              setBalanceError("Employé non éligible aux congés annuels");
              setIsCheckingBalance(false);
              return;
            } else if (monthsDiff === 6) {
              setValidationWarning(`ℹ️ Info: ${selectedUser.first_name} ${selectedUser.last_name} a exactement 6 mois d'ancienneté. Quota limité à 9 jours pour la première année.`);
            }
          }
        }
      }

      // Check available balance from API
      const res = await fetch(`/api/leave_balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: watchedUserId,
          leaveTypeId: Number(watchedLeaveTypeId),
          startDate,
          endDate
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur détaillée:", errorData);
        
        if (errorData.message === "Solde insuffisant" && errorData.debug) {
          setAvailableBalance(errorData.debug.soldeActuel);
          setBalanceError(`Solde insuffisant: ${errorData.debug.soldeActuel} jour(s) disponible(s), ${errorData.debug.joursdemandes} jour(s) demandé(s)`);
        } else if (errorData.message) {
          setBalanceError(`Erreur: ${errorData.message}`);
        } else {
          setBalanceError("Erreur lors de la vérification du solde. Veuillez réessayer.");
        }
      } else {
        const data = await res.json();
        setAvailableBalance(data.availableBalance);
      }
    } catch (error) {
      console.error("Exception lors de la vérification du solde:", error);
      setBalanceError("Erreur lors de la vérification du solde. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsCheckingBalance(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch { }
    };
    const fetchLeaveTypes = async () => {
      try {
        const res = await fetch("/api/leave_types");
        if (res.ok) {
          const data = await res.json();
          setLeaveTypes(data);
        }
      } catch { }
    };
    fetchUsers();
    fetchLeaveTypes();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Dashboard>
      <div className="sm:px-6 lg:px-8 py-6 lg:py-10 max-w-9xl">
        <Toaster position="top-right" richColors />

    {/* En-tête */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Créer une demande de congé</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">   Remplissez le formulaire ci-dessous pour créer une nouvelle demande de congé</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Système RH</span>
            </div>
          </div>
        </div>
        {/* Main Form */}
        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-6 lg:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Employee & Leave Type Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="space-y-3 w-full">
                          <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Employé
                          </FormLabel>
                          <FormControl className="w-full">
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full h-12 rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                                <SelectValue placeholder="Sélectionner un employé" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80     rounded-lg shadow-2xl border-gray-100">
                                <div className="p-3 sticky top-0 bg-white z-10 border-b border-gray-100">
                                  <Input
                                    placeholder="Rechercher un employé..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full h-9 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                  />
                                </div>
                                <div className="p-1">
                                  {users
                                    .filter(u =>
                                      `${u.first_name} ${u.last_name}`
                                        .toLowerCase()
                                        .includes(userSearch.toLowerCase())
                                    )
                                    .map(user => (
                                      <SelectItem
                                        key={user.id}
                                        value={user.id}
                                        className="h-14 hover:bg-blue-50 rounded-md transition-all duration-200 cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          <Avatar className="w-8 h-8 border-2 border-gray-200">
                                            <AvatarImage src={user.photo || undefined} alt={user.first_name} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                              {getInitials(user.first_name, user.last_name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium text-gray-800">
                                            {user.first_name} {user.last_name}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </div>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leave_type_id"
                      render={({ field }) => (
                        <FormItem className="space-y-3 w-full">
                          <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Type de congé
                          </FormLabel>
                          <FormControl className="w-full">
                      <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full h-12 rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                                <SelectValue placeholder="Sélectionner un type de congé">
                                  {field.value && leaveTypes.find(type => type.id.toString() === field.value)?.name}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-80 rounded-lg shadow-2xl border-gray-100">
                                <div className="p-3 sticky top-0 bg-white z-10 border-b border-gray-100">
                                  <Input
                                    placeholder="Rechercher un type..."
                                    value={leaveTypeSearch}
                                    onChange={e => setLeaveTypeSearch(e.target.value)}
                                    className="w-full h-9 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                  />
                                </div>
                                <div className="p-1">
                                  {leaveTypes
                                    .filter(t =>
                                      t.name.toLowerCase().includes(leaveTypeSearch.toLowerCase())
                                    )
                                    .map(type => (
                                      <SelectItem 
                                        key={type.id} 
                                        value={type.id.toString()} 
                                        className="min-h-[80px] hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer p-4 border-b border-gray-50 last:border-0"
                                      >
                                        <div className="flex flex-col gap-2 w-full">
                                          <span className="font-semibold text-gray-800 text-sm leading-tight">{type.name}</span>
                                          <div className="flex flex-wrap gap-2">
                                            {type.description && (
                                              <Badge variant="secondary" className="text-xs h-6 px-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                                                {type.description}
                                              </Badge>
                                            )}
                                            {typeof type.annual_quota !== 'undefined' && (
                                              <Badge className="text-xs h-6 px-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border-blue-200">
                                                Quota: {type.annual_quota} jours
                                              </Badge>
                                            )}
                                            {typeof type.remuneration !== 'undefined' && (
                                              <Badge className={`text-xs h-6 px-2 transition-colors ${
                                                type.remuneration 
                                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' 
                                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200'
                                              }`}>
                                                {type.remuneration ? '💰 Rémunéré' : '⚪ Non rémunéré'}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </div>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Date Range Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Période de congé</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Dates de début et fin
                        </FormLabel>
                        <FormControl>
                          <div className="w-full">
                            <Space direction="vertical" size={12} className="w-full">
                              <DatePicker.RangePicker
                                className="w-full h-12 rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500"
                                value={field.value}
                                onChange={val => field.onChange(val)}
                                format="DD/MM/YYYY"
                                placeholder={['Date de début', 'Date de fin']}
                              />
                            </Space>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Leave Balance Information */}
                  {(isCheckingBalance || availableBalance !== null || balanceError || validationWarning) && (
                    <div className={`mt-3 p-4 rounded-lg border transition-all duration-300 ${
                      balanceError ? 'border-red-200 bg-red-50' : 
                      validationWarning ? 'border-orange-200 bg-orange-50' : 
                      'border-gray-200'
                    }`}>
                      {isCheckingBalance && (
                        <div className="flex items-center text-gray-600">
                          <div className="w-4 h-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Vérification du solde et éligibilité...
                        </div>
                      )}
                      
                      {!isCheckingBalance && validationWarning && (
                        <div className="flex items-start gap-2 mb-3">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                          </div>
                          <p className="text-sm font-medium text-orange-700">{validationWarning}</p>
                        </div>
                      )}
                      
                      {!isCheckingBalance && availableBalance !== null && !balanceError && (
                        <div className="flex items-start gap-2">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Solde disponible: <span className="text-green-600 font-semibold">{availableBalance} jour(s)</span>
                            </p>
                            {requestedDays && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Jours ouvrés demandés: {requestedDays} jour(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!isCheckingBalance && balanceError && (
                        <div className="flex items-start gap-2">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-600">{balanceError}</p>
                            {availableBalance !== null && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Solde disponible: {availableBalance} jour(s)
                              </p>
                            )}
                            <button 
                              type="button"
                              onClick={checkLeaveBalance}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
                            >
                              Réessayer la vérification
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                {/* Reason Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Justification</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Motif de la demande
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez le motif de votre demande de congé..."
                            {...field}
                            className="w-full min-h-[120px] rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decisionReason"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Commentaire administratif <span className="text-gray-400 font-normal">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Commentaire ou note administrative..."
                            {...field}
                            className="w-full h-12 rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Hidden Field */}
                <input type="hidden" {...form.register("validatedBy")} value={adminId || ''} />

                <Separator className="my-8" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                  <Button
                    variant="outline"
                    type="button"
                    className="h-12 px-8 rounded-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (balanceError && !validationWarning)}
                    className="h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Créer la demande
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}