"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Search,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Dashboard } from "@/components/Layout/Dashboard";
import Link from "next/link";
import EmployeeDashboardLayout from "../../DashboardLayout";

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

export function MyLeaveRequestsClient() {
  const { data: session, status } = useSession();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);

  // Helper functions for dialog management
  const handleOpenDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setOpenRequestId(request.id);
  };
  
  const handleCloseDialog = () => {
    setOpenRequestId(null);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 300);
  };

  useEffect(() => {
    const fetchMyLeaveRequests = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch only the current user's leave requests
        const res = await fetch(`/api/leaveRequests/user/${session.user.id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || "Erreur lors du chargement des demandes");
        }
        const data = await res.json();
        
        // Map the data to match our interface
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
        console.error("Error fetching leave requests:", error);
        toast.error(error.message || "Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user?.id) {
      fetchMyLeaveRequests();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    let filtered = leaveRequests;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.leave_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        format(new Date(request.startDate), 'dd MMM yyyy', { locale: fr }).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, statusFilter, searchTerm]);

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
            <p className="text-red-500">Vous devez être connecté pour voir vos demandes de congés.</p>
          </div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
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
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mes demandes de congés</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Consultez et gérez vos demandes de congés</p>
                </div>
              </div>
              <Link href="/employe/conges/nouvelle-demande">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle demande
                </Button>
              </Link>
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
                      placeholder="Rechercher par type de congé, raison ou date..."
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
                Vos demandes de congés ({filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Type de congé</TableHead>
                      <TableHead className="font-semibold text-gray-700">Période</TableHead>
                      <TableHead className="font-semibold text-gray-700">Durée</TableHead>
                      <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                      <TableHead className="font-semibold text-gray-700">Demandé le</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors">
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
                                      Consultez les détails de votre demande
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedRequest && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium text-gray-700 mb-2">Type de congé</h4>
                                          <p className="text-gray-900">{selectedRequest.leave_type.name}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-700 mb-2">Statut</h4>
                                          {getStatusBadge(selectedRequest.status)}
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
                                      
                                      <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Raison</h4>
                                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                                      </div>

                                      {/* Afficher le commentaire de décision si présent */}
                                      {selectedRequest.decisionReason && (
                                        <div>
                                          <h4 className="font-medium text-gray-700 mb-2">Commentaire de décision</h4>
                                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.decisionReason}</p>
                                        </div>
                                      )}

                                      {/* Afficher un message spécifique selon le statut */}
                                      {selectedRequest.status === 'EN_ATTENTE' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                                          Votre demande est en cours d'examen par le service RH.
                                        </div>
                                      )}
                                      {selectedRequest.status === 'APPROUVE' && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                                          Votre demande a été approuvée. Votre congé est confirmé.
                                        </div>
                                      )}
                                      {selectedRequest.status === 'REFUSE' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                                          Votre demande a été refusée. Veuillez consulter le commentaire de décision pour plus d'informations.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-lg font-medium text-gray-500">Aucune demande trouvée</p>
                            <p className="text-sm text-gray-400 mb-4">
                              {searchTerm || statusFilter !== 'all' 
                                ? "Essayez de modifier vos filtres de recherche"
                                : "Vous n'avez pas encore fait de demande de congés"}
                            </p>
                            <Link href="/employe/conges/nouvelle-demande">
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                Créer une demande
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}

export default function Page() {
  return <MyLeaveRequestsClient />;
}
