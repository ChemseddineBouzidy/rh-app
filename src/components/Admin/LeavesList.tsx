"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from "lucide-react";

type Leave = {
  id: string;
  employee: string;
  initials: string;
  avatarColor: string;
  type: string;
  typeColor: string;
  duration: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
};

export default function LeavesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch pending leaves from API
  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaveRequests');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leave requests');
        }
        
        const data = await response.json();
        
        // Filter for pending leaves only and transform data
        const pendingLeaves = data
          .filter((request: any) => request.status === 'EN_ATTENTE')
          .map((request: any) => {
            const firstName = request.user?.first_name || '';
            const lastName = request.user?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
            
            // Generate avatar color based on name
            const colors = [
              'bg-red-100 text-red-600',
              'bg-green-100 text-green-600', 
              'bg-blue-100 text-blue-600',
              'bg-purple-100 text-purple-600',
              'bg-yellow-100 text-yellow-600',
              'bg-pink-100 text-pink-600',
              'bg-indigo-100 text-indigo-600'
            ];
            const avatarColor = colors[fullName.length % colors.length];
            
            // Generate type color based on leave type
            const typeColors: { [key: string]: string } = {
              'Congé annuel payé': 'bg-blue-100 text-blue-800',
              'Congé maladie': 'bg-yellow-100 text-yellow-800',
              'Congé maternité': 'bg-pink-100 text-pink-800',
              'Congé paternité': 'bg-green-100 text-green-800',
              'Mariage salarié': 'bg-purple-100 text-purple-800',
              'Mariage enfant': 'bg-purple-100 text-purple-800',
              'Décès (parent proche)': 'bg-gray-100 text-gray-800',
              'Circoncision d\'un enfant': 'bg-orange-100 text-orange-800',
              'Congé pour examen': 'bg-cyan-100 text-cyan-800',
              'Congé sans solde': 'bg-red-100 text-red-800',
              'Congé sabbatique': 'bg-indigo-100 text-indigo-800'
            };
            
            const leaveTypeName = request.leave_type?.name || 'Unknown';
            const typeColor = typeColors[leaveTypeName] || 'bg-gray-100 text-gray-800';
            
            // Format duration
            const startDate = new Date(request.startDate);
            const endDate = new Date(request.endDate);
            const duration = startDate.toDateString() === endDate.toDateString() 
              ? startDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
              : `${startDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`;
            
            return {
              id: request.id.toString(),
              employee: fullName,
              initials,
              avatarColor,
              type: leaveTypeName,
              typeColor,
              duration,
              startDate: request.startDate,
              endDate: request.endDate,
              reason: request.reason || '',
              status: request.status
            };
          });
        
        setLeaves(pendingLeaves);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLeaves();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROUVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJETE':
      case 'REFUSE':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.duration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDetailsClick = () => {
    router.push('/admin/conges/gestion-demandes');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-medium">Pending Leaves</CardTitle>
          <div className="p-2 bg-orange-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <CardDescription>
          {loading ? 'Loading...' : `${leaves.length} leave requests awaiting approval`}
        </CardDescription>
        
        {/* Search input for Leaves */}
        <div className="relative mt-3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="search" 
            className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" 
            placeholder="Search leave requests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Employee</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Duration</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map(leave => (
                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full ${leave.avatarColor} flex items-center justify-center font-medium`}>
                            {leave.initials}
                          </div>
                          <span>{leave.employee}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{leave.duration}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center">
                          {getStatusIcon(leave.status)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button 
                          onClick={handleDetailsClick}
                          className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                          title={`Reason: ${leave.reason}`}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                      {searchTerm ? 'No leave requests found matching your search' : 'No pending leave requests'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
