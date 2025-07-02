'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import EmployeeDashboardLayout from '../../DashboardLayout';
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
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  CalendarDays,
  XCircle
} from 'lucide-react';

const leaveRequestSchema = z.object({
  leave_type_id: z.string().min(1, 'Type de congé requis'),
  dateRange: z
    .array(z.any())
    .length(2)
    .refine(([start, end]) => !!start && !!end, {
      message: 'Veuillez sélectionner une plage de dates',
    }),
  reason: z.string().min(1, 'Raison requise'),
  description: z.string().optional(),
});

const NouvelleDemandePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypeSearch, setLeaveTypeSearch] = useState('');
  const [requestedDays, setRequestedDays] = useState<number | null>(null);

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type_id: '',
      dateRange: [null, null],
      reason: '',
      description: '',
    },
  });

  // Watch for date range changes to calculate days
  const watchedDateRange = form.watch('dateRange');

  useEffect(() => {
    if (watchedDateRange[0] && watchedDateRange[1]) {
      const startDate = dayjs(watchedDateRange[0]).format('YYYY-MM-DD');
      const endDate = dayjs(watchedDateRange[1]).format('YYYY-MM-DD');
      
      // Calculate business days
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
    } else {
      setRequestedDays(null);
    }
  }, [watchedDateRange]);

  // Fetch leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch('/api/leave_types');
        if (response.ok) {
          const data = await response.json();
          setLeaveTypes(data);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchLeaveTypes();
  }, []);

  const onSubmit = async (data: z.infer<typeof leaveRequestSchema>) => {
    setIsSubmitting(true);
    
    try {
      const [start, end] = data.dateRange;
      const startDate = start ? dayjs(start).format('YYYY-MM-DD') : '';
      const endDate = end ? dayjs(end).format('YYYY-MM-DD') : '';

      const requestData = {
        user_id: session?.user?.id,
        leave_type_id: parseInt(data.leave_type_id),
        startDate,
        endDate,
        status: 'EN_ATTENTE',
        reason: data.reason,
        decisionReason: data.description || null,
      };

      const response = await fetch('/api/leaveRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('Votre demande de congé a été soumise avec succès !');
        setTimeout(() => {
          router.push('/employe/conges/mes-demandes');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la soumission de la demande');
      }
    } catch (error) {
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLeaveType = leaveTypes.find(type => type.id === parseInt(form.watch('leave_type_id') || '0'));

  return (
    <EmployeeDashboardLayout>
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Nouvelle Demande de Congé</h1>
                <p className="text-gray-600 mt-1">Remplissez le formulaire ci-dessous pour créer votre demande</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">En Attente</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-6 lg:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Leave Type Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Type de congé</h3>
                  </div>

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
                  
                  {/* Duration Display */}
                  {requestedDays !== null && selectedLeaveType && (
                    <div className="mt-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Durée demandée: <span className="font-semibold">{requestedDays} jour{requestedDays > 1 ? 's' : ''} ouvrés</span>
                          </p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            Type: {selectedLeaveType.name}
                          </p>
                        </div>
                      </div>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Description supplémentaire <span className="text-gray-400 font-normal">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Détails supplémentaires sur votre demande..."
                            {...field}
                            className="w-full h-12 rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status Info */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Statut: En Attente
                      </p>
                      <p className="text-xs text-gray-600">
                        Votre demande sera automatiquement en attente d'approbation par votre manager
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                    className="h-12 px-8 rounded-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Soumettre la Demande
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EmployeeDashboardLayout>
  );
};

export default NouvelleDemandePage;
