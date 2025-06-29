"use client"
import { Dashboard } from '@/components/Layout/Dashboard'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { PlusCircle, Search, Briefcase, Calendar, DollarSign, Filter, BadgeCheck, User, Edit, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

type User = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  password: string;
  birth_date: string;
  national_id: string;
  phone_number: string;
  address: string;
  hire_date: string | Date;
  job_title: string;
  department: {
    id: number;
    name: string;
  };
  department_id: number;
  employment_type: string;
  salaire_brut: number;
  status: string;
  photo?: string;
  role: string;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 100000]);
  const [minMaxSalary, setMinMaxSalary] = useState<number[]>([0, 100000]);
  const [hireDateFilter, setHireDateFilter] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setUsers(data);

        // Calculate min and max salary from user data
        if (data && data.length > 0) {
          // Extract all valid salary values (filter out undefined, null, NaN)
          const salaries = data
            .map(user => user.salaire_brut)
            .filter(salary => salary !== undefined && salary !== null && !isNaN(salary));

          if (salaries.length > 0) {
            const minSalary = Math.floor(Math.min(...salaries));
            const maxSalary = Math.ceil(Math.max(...salaries));
            console.log(`Salary range from DB: ${minSalary} - ${maxSalary}`);
            setMinMaxSalary([minSalary, maxSalary]);
            setSalaryRange([minSalary, maxSalary]);
          }
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Erreur lors du chargement des utilisateurs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === "" ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    let hireDate = user.hire_date;
    if (!(hireDate instanceof Date) && hireDate) {
      hireDate = new Date(hireDate);
    }

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesSalary = user.salaire_brut >= salaryRange[0] && user.salaire_brut <= salaryRange[1];

    const matchesHireDate = !hireDateFilter ||
      (hireDate &&
        hireDate.getFullYear() === hireDateFilter.getFullYear() &&
        hireDate.getMonth() === hireDateFilter.getMonth() &&
        hireDate.getDate() === hireDateFilter.getDate());

    return matchesSearch && matchesStatus && matchesSalary && matchesHireDate;
  });

  const handleAddEmployee = () => {
    // Redirect to the add employee page
    window.location.href = "/users/create-employee";
  };

  const toggleFilters = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSalaryRange(minMaxSalary);
    setHireDateFilter(null);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Dashboard>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-500">Liste des Employés</h1>
          <Link href="/users/create-employee">
          <Button  className="bg-blue-500 hover:bg-blue-600" >
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un employé
          </Button>
          </Link>
        </div>

        <Card className="mb-6 border-blue-500/20 shadow-md">
          <CardHeader className="border-b border-blue-500/10 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-blue-500 text-xl">Filtres avancés</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>
                {isFilterExpanded ? "Masquer" : "Afficher"}
              </Button>
            </div>
            <CardDescription>Utilisez ces options pour filtrer précisément les utilisateurs</CardDescription>
          </CardHeader>

          {isFilterExpanded && (
            <>
              <CardContent className="pt-6 pb-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="search" className="font-medium">Recherche</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="search"
                        placeholder="Nom, email, poste..."
                        className="pl-8 border-blue-500/20 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="hireDate" className="font-medium">Date d'embauche</Label>
                    </div>
                    <DatePicker
                      id="hireDate"
                      selected={hireDateFilter}
                      onSelect={setHireDateFilter}
                      placeholder="Sélectionnez une date"
                      className="border-blue-500/20 w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="status" className="font-medium">Statut</Label>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status" className="border-blue-500/20">
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

                  <div className="lg:col-start-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <Label className="font-medium">Salaire brut</Label>
                    </div>
                    <div className="px-2">
                      <div className="flex justify-between mb-2 text-sm ">
                        <span>{salaryRange[0].toLocaleString()}€</span>
                        <span>{salaryRange[1].toLocaleString()}€</span>
                      </div>
                      <Slider
                        min={minMaxSalary[0]}
                        max={minMaxSalary[1]}
                        step={100}
                        value={salaryRange}
                        onValueChange={setSalaryRange}
                        className="my-4 text-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className=" flex justify-end">
                <Button variant="outline" className="mr-2" onClick={resetFilters}>
                  Réinitialiser
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Appliquer les filtres
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <div className="bg-blue-50 p-3 mb-4 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-blue-800">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-sm text-blue-600">
            {searchTerm && `Recherche: "${searchTerm}"`}
            {statusFilter !== "all" && ` • Statut: ${statusFilter}`}
          </span>
        </div>

        <Table className=" rounded-md shadow-sm">
          <TableHeader>
            <TableRow className=" border-blue-500/20">
              <TableHead className="text-black font-bold">Photo</TableHead>
              <TableHead className="text-black font-bold">ID</TableHead>
              <TableHead className="text-black font-bold">Nom</TableHead>
              <TableHead className="text-black font-bold">Email</TableHead>
              <TableHead className="text-black font-bold">Département</TableHead>
              <TableHead className="text-black font-bold">Poste</TableHead>
              <TableHead className="text-black font-bold">Salaire</TableHead>
              <TableHead className="text-black font-bold">Statut</TableHead>
              <TableHead className="text-black font-bold">Date d'embauche</TableHead>
              <TableHead className="text-black font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">Chargement...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-red-500">{error}</TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-blue-50">
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      {user.photo ? (
                        <AvatarImage src={user.photo} alt={`${user.first_name} ${user.last_name}`} />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getUserInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department?.name}</TableCell>
                  <TableCell>{user.job_title}</TableCell>
                  <TableCell>{user.salaire_brut}€</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    {user.hire_date
                      ? format(user.hire_date instanceof Date
                        ? user.hire_date
                        : new Date(user.hire_date),
                        "dd MMMM yyyy",
                        { locale: fr })
                      : "Non définie"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Link href={`/admin/users/edit?id=${user.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Modifier l'utilisateur"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center">Aucun utilisateur trouvé</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption>Liste complète des utilisateurs dans le système</TableCaption>
        </Table>
      </div>
    </Dashboard>
  );
}

export default UsersPage