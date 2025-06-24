"use client"

import { Dashboard } from '@/components/Layout/Dashboard'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { PlusCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Dummy data for demonstration
const dummyUsers = [
  { id: 1, name: "Jean Dupont", email: "jean@example.com", status: "Active", salary: 45000, hireDate: new Date(2021, 3, 15) },
  { id: 2, name: "Marie Claire", email: "marie@example.com", status: "Inactive", salary: 52000, hireDate: new Date(2020, 6, 22) },
  { id: 3, name: "Pierre Martin", email: "pierre@example.com", status: "Active", salary: 48000, hireDate: new Date(2022, 1, 10) },
  { id: 4, name: "Sophie Bernard", email: "sophie@example.com", status: "On Leave", salary: 51000, hireDate: new Date(2019, 11, 5) },
  { id: 5, name: "Lucas Petit", email: "lucas@example.com", status: "Active", salary: 49500, hireDate: new Date(2022, 8, 17) },
];

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState([40000, 60000]);
  const [hireDateFilter, setHireDateFilter] = useState(null);
  
  // Filter and search logic
  const filteredUsers = dummyUsers.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    // Salary filter
    const matchesSalary = user.salary >= salaryRange[0] && user.salary <= salaryRange[1];
    
    // Hire date filter
    const matchesHireDate = !hireDateFilter || 
      (user.hireDate.getFullYear() === hireDateFilter.getFullYear() &&
       user.hireDate.getMonth() === hireDateFilter.getMonth() &&
       user.hireDate.getDate() === hireDateFilter.getDate());
    
    return matchesSearch && matchesStatus && matchesSalary && matchesHireDate;
  });

  // Handle add employee button click
  const handleAddEmployee = () => {
    alert("Fonctionnalité d'ajout d'employé à implémenter");
  };

  return (
    <Dashboard>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Liste des Utilisateurs</h1>
          <Button onClick={handleAddEmployee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un employé
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Affinez votre recherche d'utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search input */}
              <div>
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status filter */}
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="Active">Actif</SelectItem>
                    <SelectItem value="Inactive">Inactif</SelectItem>
                    <SelectItem value="On Leave">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary range filter */}
              <div>
                <Label>Salaire: {salaryRange[0]}€ - {salaryRange[1]}€</Label>
                <Slider
                  defaultValue={[40000, 60000]}
                  min={30000}
                  max={100000}
                  step={1000}
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  className="mt-6"
                />
              </div>

              {/* Hire date filter */}
              <div>
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <DatePicker
                  id="hireDate"
                  selected={hireDateFilter}
                  onSelect={setHireDateFilter}
                  placeholder="Sélectionnez une date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Table>
          <TableCaption>Liste des utilisateurs - {filteredUsers.length} utilisateurs trouvés</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Salaire</TableHead>
              <TableHead>Date d'embauche</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.salary}€</TableCell>
                  <TableCell>{format(user.hireDate, "dd MMMM yyyy", { locale: fr })}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Aucun utilisateur trouvé</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Dashboard>
  )
}

export default UsersPage