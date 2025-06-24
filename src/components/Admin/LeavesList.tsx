"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Leave = {
  id: string;
  employee: string;
  initials: string;
  avatarColor: string;
  type: string;
  typeColor: string;
  duration: string;
};

const initialLeaves: Leave[] = [
  {
    id: "1",
    employee: "Michael Brown",
    initials: "MB",
    avatarColor: "bg-red-100 text-red-600",
    type: "Sick Leave",
    typeColor: "bg-yellow-100 text-yellow-800",
    duration: "May 20-22"
  },
  {
    id: "2",
    employee: "Emma Wilson",
    initials: "EW",
    avatarColor: "bg-green-100 text-green-600",
    type: "Vacation",
    typeColor: "bg-blue-100 text-blue-800",
    duration: "Jun 5-15"
  },
  {
    id: "3",
    employee: "David Thompson",
    initials: "DT",
    avatarColor: "bg-blue-100 text-blue-600",
    type: "Personal",
    typeColor: "bg-purple-100 text-purple-800",
    duration: "May 25"
  }
];

export default function LeavesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaves] = useState<Leave[]>(initialLeaves);

  const filteredLeaves = leaves.filter(leave =>
    leave.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.duration.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <CardDescription>Leave requests awaiting approval</CardDescription>
        
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
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Duration</th>
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
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leave.typeColor}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{leave.duration}</td>
                    <td className="px-3 py-3">
                      <button className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-gray-500">
                    No leave requests found matching your search
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
