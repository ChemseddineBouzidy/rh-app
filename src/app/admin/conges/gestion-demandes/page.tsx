"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Dashboard } from "@/components/Layout/Dashboard";

interface LeaveRequest {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    photo?: string;
  };
  leave_type: {
    id: number;
    name: string;
    description?: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';
  createdAt: string;
  validatedBy?: string;
  decisionReason?: string;
}

function ManageLeaveRequestsClient({ adminId, userInfo }: { adminId: string | null; userInfo: any }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Add helper function to calculate tenure
  const calculateTenure = (hireDate: string) => {
    if (!hireDate) return null;
    
    const hire = new Date(hireDate);
    const now = new Date();
    
    // Calculate total months
    const monthsDiff = (now.getFullYear() - hire.getFullYear()) * 12 + 
                      (now.getMonth() - hire.getMonth());
    
    // Calculate years and remaining months
    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;
    
    return {
      totalMonths: monthsDiff,
      years,
      months,
      isEligibleForAnnualLeave: monthsDiff >= 6
    };
  };

  const getTenureDisplay = (hireDate: string) => {
    const tenure = calculateTenure(hireDate);
    if (!tenure) return "Non définie";
    
    const { years, months, totalMonths, isEligibleForAnnualLeave } = tenure;
    
    let display = "";
    if (years > 0) {
      display += `${years} an${years > 1 ? 's' : ''}`;
      if (months > 0) {
        display += ` et ${months} mois`;
      }
    } else {
      display = `${months} mois`;
    }
    
    return {
      text: display,
      totalMonths,
      isEligible: isEligibleForAnnualLeave
    };
  };

  // Add helper function to handle dialog open/close
  const handleOpenDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setOpenRequestId(request.id);
    setDecisionReason("");
    
    // Fetch user details when opening dialog
    fetch(`/api/users/${request.user.id}`)
      .then(res => res.json())
      .then(data => setUserDetails(data))
      .catch(err => console.error('Error fetching user details:', err));
  };
  
  const handleCloseDialog = () => {
    setOpenRequestId(null);
    setUserDetails(null);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 300);
  };

  useEffect(() => {
    // Remplacer le mock par un appel à l'API
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/leaveRequests");
        if (!res.ok) throw new Error("Erreur lors du chargement des demandes");
        const data = await res.json();
        // Adapter les données pour correspondre à l'interface LeaveRequest
        const mapped = data.map((item: any) => ({
          id: item.id,
          user: {
            id: item.user.id,
            first_name: item.user.first_name,
            last_name: item.user.last_name,
            photo: item.user.photo || null,
          },
          leave_type: {
            id: item.leave_type.id,
            name: item.leave_type.name,
            description: item.leave_type.description,
          },
          startDate: item.startDate,
          endDate: item.endDate,
          reason: item.reason,
          status: item.status,
          createdAt: item.createdAt,
          validatedBy: item.validator ? item.validator.id : undefined,
          decisionReason: item.decisionReason,
        }));
        setLeaveRequests(mapped);
        setFilteredRequests(mapped);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    let filtered = leaveRequests;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        `${request.user.first_name} ${request.user.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.leave_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, statusFilter, searchTerm]);

  const handleDecision = async (requestId: string, decision: 'APPROUVE' | 'REFUSE') => {
    setIsProcessing(true);
    
    // Clear any previous status messages
    const statusEl = document.getElementById("processingStatus");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "text-center py-2 text-blue-600 font-medium min-h-[40px] transition-all duration-300";
    }
    
    try {
      // Si la demande est approuvée, vérifier d'abord le solde de congés
      if (decision === 'APPROUVE' && selectedRequest) {
        console.log("DEBUG: Vérification du solde de congés en cours...");
        toast("🔍 Vérification du solde de congés en cours...");
        
        if (statusEl) {
          statusEl.textContent = "Vérification du solde en cours...";
          statusEl.className = "text-center py-2 text-blue-600 font-medium";
        }
        
        try {
          const balanceRes = await fetch("/api/leave_balances", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: selectedRequest.user.id,
              leaveTypeId: selectedRequest.leave_type.id,
              startDate: selectedRequest.startDate,
              endDate: selectedRequest.endDate,
            }),
          });
          
          if (!balanceRes.ok) {
            const balanceError = await balanceRes.json();
            console.warn("Erreur lors de la mise à jour du solde:", balanceError);
            
            if (balanceError.message === "Solde insuffisant" && balanceError.debug) {
              const { soldeActuel, joursdemandes } = balanceError.debug;
              const errorMessage = `Impossible d'approuver: Solde insuffisant pour ${selectedRequest.user.first_name} ${selectedRequest.user.last_name}. Solde actuel: ${soldeActuel} jour(s), Jours demandés: ${joursdemandes} jour(s).`;
              
              toast.error(errorMessage);
              
              if (statusEl) {
                statusEl.textContent = errorMessage;
                statusEl.className = "text-center py-2 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-3";
              }
              
              setIsProcessing(false);
              return;
            } else {
              const errorMessage = `Impossible d'approuver: ${balanceError.message}`;
              toast.error(errorMessage);
              
              if (statusEl) {
                statusEl.textContent = errorMessage;
                statusEl.className = "text-center py-2 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-3";
              }
              
              setIsProcessing(false);
              return;
            }
          } else {
            const balanceData = await balanceRes.json();
            console.log("Solde mis à jour:", balanceData);
            toast.success("Solde de congés vérifié et mis à jour avec succès ✓");
            
            if (statusEl) {
              statusEl.textContent = "Solde de congés vérifié et mis à jour avec succès ✓";
              statusEl.className = "text-center py-2 text-green-600 font-medium bg-green-50 border border-green-200 rounded-md p-3";
            }
          }
        } catch (balanceError) {
          console.error("Erreur lors de la déduction du solde:", balanceError);
          toast.error("Impossible d'approuver: Erreur lors de la vérification du solde");
          
          if (statusEl) {
            statusEl.textContent = "Erreur lors de la vérification du solde";
            statusEl.className = "text-center py-2 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-3";
          }
          
          setIsProcessing(false);
          return;
        }
      }

      // Update the leave request status
      const res = await fetch("/api/leaveRequests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          status: decision,
          validatedBy: adminId || null,
          decisionReason: decisionReason || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // Handle specific validation errors for rejections too
        if (res.status === 403) {
          let errorMessage = "";
          
          if (errorData.error === 'Accès refusé aux congés annuels') {
            errorMessage = `Demande invalide: ${errorData.message}`;
            toast.error(errorMessage, {
              duration: 6000,
              description: "L'employé n'a pas l'ancienneté requise pour les congés annuels."
            });
          } else if (errorData.error === 'Quota de congés annuels dépassé') {
            errorMessage = `Quota dépassé: ${errorData.message}`;
            toast.error(errorMessage, {
              duration: 6000,
              description: errorData.debug ? 
                `Détails: ${errorData.debug.maxAllowed} jours max, ${errorData.debug.alreadyUsed} déjà utilisés, ${errorData.debug.requestedDays} demandés` : 
                undefined
            });
          } else {
            errorMessage = errorData.message || errorData.error;
            toast.error(errorMessage);
          }
          
          if (statusEl) {
            statusEl.textContent = errorMessage;
            statusEl.className = "text-center py-2 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-3";
          }
          
          setIsProcessing(false);
          return;
        } else {
          throw new Error(errorData.error || "Erreur lors de la mise à jour");
        }
      }
      
      const updated = await res.json();

      setLeaveRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: updated.status, 
                validatedBy: updated.validatedBy,
                decisionReason: updated.decisionReason
              }
            : request
        )
      );

      toast.success(`Demande ${decision === 'APPROUVE' ? 'approuvée' : 'rejetée'} avec succès`);
      
      setOpenRequestId(null);
      setSelectedRequest(null);
      setDecisionReason("");
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error(error.message || "Erreur lors du traitement de la demande");
      
      const statusEl = document.getElementById("processingStatus");
      if (statusEl) {
        statusEl.textContent = error.message || "Erreur lors du traitement de la demande";
        statusEl.className = "text-center py-2 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md p-3";
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'APPROUVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée</Badge>;
      case 'REFUSE':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Include the start and end dates in the calculation
    let days = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    
    // Set end hours to 0 for accurate comparison
    const endDateOnly = new Date(end);
    endDateOnly.setHours(0, 0, 0, 0);
    
    // Count all days between start and end (inclusive)
    while (current <= endDateOnly) {
      // Only count weekdays (Monday = 1, Friday = 5)
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  if (loading) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 px-4 mt-9 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
    {/* En-tête */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des demandes de congés</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Approuvez ou rejetez les demandes de congés</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Système RH</span>
            </div>
          </div>
        </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaveRequests.filter(r => r.status === 'EN_ATTENTE').length}
                    </p>
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
                    <p className="text-sm text-gray-600">Approuvées</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaveRequests.filter(r => r.status === 'APPROUVE').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rejetées</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaveRequests.filter(r => r.status === 'REFUSE').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{leaveRequests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-0 shadow-lg shadow-gray-200/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom, type de congé ou raison..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                      <SelectItem value="APPROUVE">Approuvées</SelectItem>
                      <SelectItem value="REFUSE">Rejetées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card className="border-0 shadow-xl shadow-gray-200/50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Demandes de congés ({filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Employé</TableHead>
                      <TableHead className="font-semibold text-gray-700">Type de congé</TableHead>
                      <TableHead className="font-semibold text-gray-700">Période</TableHead>
                      <TableHead className="font-semibold text-gray-700">Durée</TableHead>
                      <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                      <TableHead className="font-semibold text-gray-700">Demandé le</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {request.user.photo ? (
                              <img
                                src={request.user.photo}
                                alt={`${request.user.first_name} ${request.user.last_name}`}
                                className="w-10 h-10 rounded-full object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {request.user.first_name[0]}{request.user.last_name[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.user.first_name} {request.user.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{request.leave_type.name}</p>
                            {request.leave_type.description && (
                              <p className="text-sm text-gray-500">{request.leave_type.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {format(new Date(request.startDate), 'dd MMM yyyy', { locale: fr })}
                            </p>
                            <p className="text-gray-500">
                              au {format(new Date(request.endDate), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {calculateDuration(request.startDate, request.endDate)} jour(s)
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(request.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={openRequestId === request.id} onOpenChange={(open) => {
                              if (open) {
                                handleOpenDialog(request);
                              } else {
                                handleCloseDialog();
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(request)}
                                  className="h-8 px-3 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-semibold">
                                    Détails de la demande de congé
                                  </DialogTitle>
                                  <DialogDescription>
                                    Examinez les détails et prenez une décision
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedRequest && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Employé</h4>
                                        <p className="text-gray-900">
                                          {selectedRequest.user.first_name} {selectedRequest.user.last_name}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Type de congé</h4>
                                        <p className="text-gray-900">{selectedRequest.leave_type.name}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Date de début</h4>
                                        <p className="text-gray-900">
                                          {format(new Date(selectedRequest.startDate), 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Date de fin</h4>
                                        <p className="text-gray-900">
                                          {format(new Date(selectedRequest.endDate), 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Durée</h4>
                                        <p className="text-gray-900">
                                          {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)} jour(s) ouvrés
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Date de demande</h4>
                                        <p className="text-gray-900">
                                          {format(new Date(selectedRequest.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Employee Tenure Information */}
                                    {userDetails?.hire_date && (
                                      <div className={`p-4 rounded-lg border ${
                                        selectedRequest.leave_type.name === 'Congé annuel payé' && !getTenureDisplay(userDetails.hire_date).isEligible
                                          ? 'border-red-200 bg-red-50' 
                                          : selectedRequest.leave_type.name === 'Congé annuel payé' && getTenureDisplay(userDetails.hire_date).totalMonths === 6
                                          ? 'border-orange-200 bg-orange-50'
                                          : 'border-gray-200 bg-gray-50'
                                      }`}>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          Informations d'ancienneté
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-gray-600">Date d'embauche</p>
                                            <p className="font-medium text-gray-900">
                                              {format(new Date(userDetails.hire_date), 'dd MMMM yyyy', { locale: fr })}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">Temps dans l'entreprise</p>
                                            <p className="font-medium text-gray-900">{getTenureDisplay(userDetails.hire_date).text}</p>
                                          </div>
                                        </div>
                                        
                                        {selectedRequest.leave_type.name === 'Congé annuel payé' && (
                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                            {!getTenureDisplay(userDetails.hire_date).isEligible ? (
                                              <div className="flex items-center gap-2 text-red-700">
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                  ⚠️ Employé non éligible aux congés annuels (moins de 6 mois d'ancienneté)
                                                </span>
                                              </div>
                                            ) : getTenureDisplay(userDetails.hire_date).totalMonths === 6 ? (
                                              <div className="flex items-center gap-2 text-orange-700">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                  ℹ️ Employé avec 6 mois d'ancienneté - Quota limité à 9 jours pour la première année
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2 text-green-700">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                  ✓ Employé éligible aux congés annuels
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Raison</h4>
                                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-gray-700 mb-2">Statut actuel</h4>
                                      {getStatusBadge(selectedRequest.status)}
                                    </div>

                                    {/* Afficher la textarea et les boutons seulement si le statut est EN_ATTENTE */}
                                    {selectedRequest.status === 'EN_ATTENTE' && (
                                      <>
                                        <div>
                                          <h4 className="font-medium text-gray-700 mb-2">Commentaire de décision (optionnel)</h4>
                                          <Textarea
                                            placeholder="Ajoutez un commentaire sur votre décision..."
                                            value={decisionReason}
                                            onChange={(e) => setDecisionReason(e.target.value)}
                                            className="min-h-20 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                                          />
                                        </div>
                                        
                                        {/* Status indicator - fixed styling */}
                                        <div id="processingStatus" className="text-center py-2 text-blue-600 font-medium min-h-[40px] transition-all duration-300"></div>
                                        
                                        <DialogFooter className="flex gap-3">
                                          <Button
                                            variant="outline"
                                            onClick={() => handleDecision(selectedRequest.id, 'REFUSE')}
                                            disabled={isProcessing}
                                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                          >
                                            {isProcessing ? 'Traitement...' : 'Rejeter'}
                                          </Button>
                                          <Button
                                            onClick={() => handleDecision(selectedRequest.id, 'APPROUVE')}
                                            disabled={isProcessing}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            {isProcessing ? 'Traitement...' : 'Approuver'}
                                          </Button>
                                        </DialogFooter>
                                      </>
                                    )}

                                    {/* Afficher le commentaire de décision si présent */}
                                    {selectedRequest.decisionReason && (
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Commentaire de décision</h4>
                                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.decisionReason}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Dashboard>
  );
}

// Fix the default export to properly handle props
export default function Page() {
  // You may need to get adminId and userInfo from session or other source
  // For now, using null values - adjust according to your auth implementation
  const adminId = null; // Replace with actual admin ID logic
  const userInfo = null; // Replace with actual user info logic
  
  return <ManageLeaveRequestsClient adminId={adminId} userInfo={userInfo} />;
}
