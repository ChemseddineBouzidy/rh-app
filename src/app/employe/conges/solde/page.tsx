"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
} from "lucide-react";
import { toast } from "sonner";
import EmployeeDashboardLayout from "../../DashboardLayout";

interface LeaveBalance {
  id: string;
  balance: number;
  leave_type: {
    id: number;
    name: string;
    description: string;
    annual_quota: number;
  };
  used_days: number;
  total_quota: number;
  usage_percentage: number;
  remaining_percentage: number;
  is_low_balance: boolean;
  is_critical_balance: boolean;
  status: 'épuisé' | 'critique' | 'faible' | 'normal';
}

interface LeaveBalanceResponse {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  balances: LeaveBalance[];
  summary: {
    total_leave_types: number;
    total_quota: number;
    total_used: number;
    total_remaining: number;
    overall_usage_percentage: number;
    low_balance_types: number;
    critical_balance_types: number;
  };
}

export default function SoldePage() {
  const { data: session, status } = useSession();
  const [balanceData, setBalanceData] = useState<LeaveBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/leave_balances/user/${session.user.id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || "Erreur lors du chargement des soldes");
        }
        const data = await res.json();
        setBalanceData(data);
      } catch (error: any) {
        console.error("Error fetching leave balances:", error);
        toast.error(error.message || "Erreur lors du chargement des soldes");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchLeaveBalances();
    }
  }, [session?.user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'épuisé':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'critique':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'faible':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'épuisé':
      case 'critique':
        return <AlertTriangle className="h-4 w-4" />;
      case 'faible':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (status === "loading" || loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  if (!session?.user) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500">Vous devez être connecté pour voir vos soldes de congés.</p>
          </div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 px-4 mt-9 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mon solde de congés</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Consultez vos jours de congés disponibles et utilisés
                </p>
              </div>
            </div>
          </div>

          {balanceData && (
            <>
              {/* Informations utilisateur */}
              <Card className="mb-6 border-0 shadow-lg shadow-gray-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {balanceData.user.first_name} {balanceData.user.last_name}
                      </h2>
                      <p className="text-sm text-gray-600">{balanceData.user.email}</p>
                      <p className="text-sm text-gray-500">{balanceData.user.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Résumé global */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg shadow-gray-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total quota</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {balanceData.summary.total_quota}
                        </p>
                        <p className="text-xs text-gray-500">jours par an</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-gray-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jours restants</p>
                        <p className="text-2xl font-bold text-green-600">
                          {balanceData.summary.total_remaining}
                        </p>
                        <p className="text-xs text-gray-500">jours disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-gray-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jours utilisés</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {balanceData.summary.total_used}
                        </p>
                        <p className="text-xs text-gray-500">
                          {balanceData.summary.overall_usage_percentage?.toFixed(1) || '0.0'}% utilisé
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-gray-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Types de congés</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {balanceData.summary.total_leave_types}
                        </p>
                        <p className="text-xs text-gray-500">types disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertes */}
              {(balanceData.summary.critical_balance_types > 0 || balanceData.summary.low_balance_types > 0) && (
                <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Attention à vos soldes</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          {balanceData.summary.critical_balance_types > 0 && 
                            `${balanceData.summary.critical_balance_types} type(s) de congé en solde critique. `}
                          {balanceData.summary.low_balance_types > 0 && 
                            `${balanceData.summary.low_balance_types} type(s) de congé en solde faible.`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Détail par type de congé */}
              <Card className="border-0 shadow-xl shadow-gray-200/50">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Détail par type de congé
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    {balanceData.balances.map((balance) => (
                      <div key={balance.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {balance.leave_type.name}
                              </h3>
                              <Badge className={`${getStatusColor(balance.status)} flex items-center gap-1`}>
                                {getStatusIcon(balance.status)}
                                {balance.status}
                              </Badge>
                            </div>
                            {balance.leave_type.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {balance.leave_type.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {balance.balance}
                            </p>
                            <p className="text-sm text-gray-500">jours restants</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Barre de progression */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Utilisation: {balance.usage_percentage?.toFixed(1) || '0.0'}%
                              </span>
                              <span className="text-sm text-gray-600">
                                {balance.used_days} / {balance.total_quota} jours
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(balance.usage_percentage)}`}
                                style={{ width: `${Math.min(balance.usage_percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Statistiques détaillées */}
                          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Quota annuel</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {balance.total_quota}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Jours utilisés</p>
                              <p className="text-lg font-semibold text-orange-600">
                                {balance.used_days}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Jours restants</p>
                              <p className="text-lg font-semibold text-green-600">
                                {balance.balance}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!balanceData && !loading && (
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun solde de congé trouvé
                </h3>
                <p className="text-gray-600">
                  Vos soldes de congés n'ont pas encore été configurés. 
                  Contactez le service RH pour plus d'informations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
