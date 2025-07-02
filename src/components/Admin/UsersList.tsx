"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
  hire_date: string;
  job_title: string;
  department: string;
  department_id: string;
  employment_type: string;
  salaire_brut: number;
  status: string;
  photo: string;
  role: string;
  initials?: string;
  position?: string;
  joinDate?: string;
  statusColor?: string;
};

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('La réponse du réseau n\'était pas correcte');
        }
        const data = await response.json();
        
        
        setUsers(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };
    
    fetchUsers();
  }, [])
  
  const filteredUsers = users ? users.filter(user =>
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.hire_date?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Ajouter cette fonction en haut de votre composant, après les déclarations useState
  const getAvatarColor = (name: string = "") => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-red-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500"
    ];
    
    // Generate a consistent color based on the name
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  // Ajouter cette fonction pour le formatage de date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDetailsClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-medium">Nouveaux Utilisateurs</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        <CardDescription>Employés récents qui ont rejoint ce mois-ci</CardDescription>
        
        {/* Champ de recherche pour les utilisateurs */}
        <div className="relative mt-3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="search" 
            className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" 
            placeholder="Rechercher des utilisateurs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Nom</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Poste</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-3">
                        <div className={`h-9 w-9 rounded-full ${getAvatarColor(user.first_name)} flex items-center justify-center font-medium text-white text-sm shadow-sm`}>
                          {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{`${user.first_name} ${user.last_name}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{user.job_title}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{formatDate(user.hire_date)}</td>
                    <td className="px-3 py-3">
                      <button 
                        onClick={() => handleDetailsClick(user.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-gray-500">
                    Aucun utilisateur trouvé correspondant à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
