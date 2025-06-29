'use client';
import { Dashboard } from '@/components/Layout/Dashboard';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building2,
  Users,
  AlertTriangle,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Department {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/department');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDepartment) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/department?id=${selectedDepartment.id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (response.ok) {
        fetchDepartments();
        closeModals();
      } else {
        // Show detailed error message
        console.error('Delete error:', responseData);
        alert(responseData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Erreur lors de la suppression du département');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = '/api/department';
      const method = showEditModal ? 'PUT' : 'POST';
      const body = showEditModal 
        ? { id: selectedDepartment?.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchDepartments();
        closeModals();
        resetForm();
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error('Submit error:', errorData);
        alert(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Erreur lors de la sauvegarde du département');
    } finally {
      setSubmitting(false);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({ name: department.name, description: department.description });
    setShowEditModal(true);
  };

  const openDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedDepartment(null);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
  };

  return (
    <Dashboard>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Départements</h2>
              <p className="text-gray-600">Gérez les départements de votre organisation</p>
            </div>
            
            <div className="flex items-center space-x-4">

              <Button
                onClick={openAddModal}
                className="flex items-center space-x-2 bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter département</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Liste des départements</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher un département..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDepartments.map((department) => (
                    <div key={department.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(department)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(department)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{department.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{department._count?.users || 0} employé{(department._count?.users || 0) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredDepartments.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'Aucun département trouvé' : 'Aucun département'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? 'Essayez avec d\'autres termes de recherche'
                        : 'Commencez par créer votre premier département'
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={openAddModal}>
                        Créer un département
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {showEditModal ? 'Modifier le département' : 'Ajouter un département'}
            </DialogTitle>
            <DialogDescription>
              {showEditModal 
                ? 'Modifiez les informations du département ci-dessous.'
                : 'Ajoutez un nouveau département à votre organisation.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du département</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Ressources Humaines"
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du département..."
                  rows={3}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModals}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{showEditModal ? 'Modifier' : 'Ajouter'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le département</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement le département "{selectedDepartment?.name}". 
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Êtes-vous sûr ?
            </h3>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModals}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Supprimer</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
}

export default DepartmentPage;