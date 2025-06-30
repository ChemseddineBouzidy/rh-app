'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Layout/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings,
  Euro,
  X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  annual_quota: number;
  remuneration: boolean;
  created_at: string;
  updated_at: string;
}

const LeaveTypesPage = () => {
  // États pour les données
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    annual_quota: '',
    remuneration: false
  });

  // Charger les types de congé
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave_types');
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data);
        setFilteredLeaveTypes(data);
      } else {
        toast.error('Erreur lors du chargement des types de congé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Filtrer les types de congé
  useEffect(() => {
    const filtered = leaveTypes.filter(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLeaveTypes(filtered);
  }, [searchTerm, leaveTypes]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      annual_quota: '',
      remuneration: false,
    });
  };

  // Ouvrir le dialog d'ajout
  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  // Ouvrir le dialog d'édition
  const handleEdit = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description || '',
      annual_quota: leaveType.annual_quota.toString(),
      remuneration: leaveType.remuneration
    });
    setShowEditDialog(true);
  };

  // Ouvrir le dialog de suppression
  const handleDelete = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setShowDeleteDialog(true);
  };

  // Créer un nouveau type de congé
  const handleSubmitAdd = async () => {
    if (!formData.name.trim() || !formData.annual_quota) {
      toast.error('Le nom et le quota annuel sont requis');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/leave_types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          annual_quota: parseInt(formData.annual_quota),
          remuneration: formData.remuneration
        })
      });

      if (response.ok) {
        toast.success('Type de congé créé avec succès');
        setShowAddDialog(false);
        resetForm();
        fetchLeaveTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modifier un type de congé
  const handleSubmitEdit = async () => {
    if (!formData.name.trim() || !formData.annual_quota || !selectedLeaveType) {
      toast.error('Le nom et le quota annuel sont requis');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/leave_types/${selectedLeaveType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          annual_quota: parseInt(formData.annual_quota),
          remuneration: formData.remuneration
        })
      });

      if (response.ok) {
        toast.success('Type de congé modifié avec succès');
        setShowEditDialog(false);
        resetForm();
        setSelectedLeaveType(null);
        fetchLeaveTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un type de congé
  const handleSubmitDelete = async () => {
    if (!selectedLeaveType) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/leave_types/${selectedLeaveType.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Type de congé supprimé avec succès');
        setShowDeleteDialog(false);
        setSelectedLeaveType(null);
        fetchLeaveTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dashboard>
      <Toaster position="top-right" richColors />
      
      <div className="py-10 max-w-9xl px-4 sm:px-6 mx-auto">
        {/* En-tête */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg shadow-blue-500/30">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Types de Congé</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Gestion des types de congé et quotas annuels</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Système RH</span>
            </div>
          </div>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white dark:bg-gray-800/90 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des types de congé..."
                className="pl-10 border-blue-500 focus:border-blue-600 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Bouton d'ajout */}
            <Button 
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/30 font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Type
            </Button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Nom</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Quota Annuel</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Rémunération</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date de Création</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucun type de congé trouvé</p>
                      <p className="text-sm">
                        {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par créer un nouveau type de congé'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaveTypes.map((leaveType) => (
                    <TableRow key={leaveType.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {leaveType.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300 max-w-xs">
                        <div className="truncate">
                          {leaveType.description || (
                            <span className="italic text-gray-400">Aucune description</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {leaveType.annual_quota} jours
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {leaveType.remuneration ? (
                            <>
                              <Euro className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 font-medium">Rémunéré</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 dark:text-red-400 font-medium">Non rémunéré</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {new Date(leaveType.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(leaveType)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(leaveType)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Total: {filteredLeaveTypes.length} type(s) de congé</span>
            {searchTerm && (
              <span>Filtré de {leaveTypes.length} type(s)</span>
            )}
          </div>
        </div>
      </div>

      {/* Dialog d'ajout */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Nouveau Type de Congé
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau type de congé avec son quota annuel.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nom du type *</Label>
              <Input
                id="add-name"
                placeholder="Ex: Congés Payés"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                placeholder="Description du type de congé (optionnel)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-quota">Quota annuel (jours) *</Label>
              <Input
                id="add-quota"
                type="number"
                min="0"
                placeholder="25"
                value={formData.annual_quota}
                onChange={(e) => handleInputChange('annual_quota', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add-remuneration"
                checked={formData.remuneration}
                onCheckedChange={(checked) => handleInputChange('remuneration', checked as boolean)}
              />
              <Label htmlFor="add-remuneration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Congé rémunéré
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitAdd}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Modifier le Type de Congé
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations du type de congé sélectionné.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du type *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Congés Payés"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Description du type de congé (optionnel)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-quota">Quota annuel (jours) *</Label>
              <Input
                id="edit-quota"
                type="number"
                min="0"
                placeholder="25"
                value={formData.annual_quota}
                onChange={(e) => handleInputChange('annual_quota', e.target.value)}
                className="border-blue-500 focus:border-blue-600"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-remuneration"
                checked={formData.remuneration}
                onCheckedChange={(checked) => handleInputChange('remuneration', checked as boolean)}
              />
              <Label htmlFor="edit-remuneration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Congé rémunéré
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Modifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la Suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le type de congé "{selectedLeaveType?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Attention</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Si des demandes de congé utilisent ce type, la suppression sera impossible.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default LeaveTypesPage;