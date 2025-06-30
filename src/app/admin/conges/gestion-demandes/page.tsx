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
  status: 'EN_ATTENTE' | 'APPROVED' | 'REFUSE';
  createdAt: string;
  validatedBy?: string;
  decisionReason?: string;
}

export function ManageLeaveRequestsClient({ adminId, userInfo }: { adminId: string | null; userInfo: any }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDecision = async (requestId: string, decision: 'APPROVED' | 'REFUSE') => {
    setIsProcessing(true);
    try {
    
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
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
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

      toast({
        title: "Succès",
        description: `Demande ${decision === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès`,
      });

      setSelectedRequest(null);
      setDecisionReason("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du traitement de la demande",
        variant: "destructive",
      });
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
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
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
                                    </div>
                                    
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
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Essayez de modifier vos filtres de recherche.' 
                      : 'Il n\'y a pas encore de demandes de congés.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Dashboard>
  );
}

// Ajoutez ce composant d'export par défaut à la fin du fichier
export default function Page(props: any) {
  // Passez les props nécessaires à votre composant client
  return <ManageLeaveRequestsClient {...props} />;
}
