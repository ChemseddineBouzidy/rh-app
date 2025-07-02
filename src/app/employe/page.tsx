'use client';
import React from 'react';
import EmployeeDashboardLayout from './DashboardLayout';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Bell, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  User,
  Award,
  MessageSquare,
  Target,
  BookOpen
} from 'lucide-react';

const EmployeePage = () => {
  // Données simulées pour l'employé
  const employeeStats = [
    {
      title: "Congés Restants",
      value: "18 jours",
      subtitle: "Sur 25 jours",
      icon: Calendar,
      color: "bg-blue-500",
      progress: 72
    },
    {
      title: "Heures ce Mois",
      value: "152h",
      subtitle: "Objectif: 160h",
      icon: Clock,
      color: "bg-green-500",
      progress: 95
    },
    {
      title: "Évaluations",
      value: "Excellente",
      subtitle: "Dernière: 4.8/5",
      icon: Award,
      color: "bg-purple-500",
      progress: 96
    },
    {
      title: "Formations",
      value: "3 en cours",
      subtitle: "2 complétées",
      icon: BookOpen,
      color: "bg-orange-500",
      progress: 40
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "leave",
      title: "Demande de congé approuvée",
      description: "Congés du 15-17 Mars validés par votre manager",
      time: "Il y a 2h",
      status: "success",
      icon: CheckCircle
    },
    {
      id: 2,
      type: "document",
      title: "Nouveau document disponible",
      description: "Bulletin de paie de Février 2024",
      time: "Il y a 4h",
      status: "info",
      icon: FileText
    },
    {
      id: 3,
      type: "training",
      title: "Formation à compléter",
      description: "Sécurité informatique - Échéance: 30 Mars",
      time: "Il y a 1 jour",
      status: "warning",
      icon: AlertTriangle
    },
    {
      id: 4,
      type: "evaluation",
      title: "Entretien annuel programmé",
      description: "RDV fixé le 25 Mars à 14h avec votre manager",
      time: "Il y a 2 jours",
      status: "info",
      icon: Target
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Réunion équipe",
      date: "Aujourd'hui",
      time: "14:00 - 15:30",
      type: "meeting",
      location: "Salle de conférence A"
    },
    {
      id: 2,
      title: "Formation Sécurité",
      date: "Demain",
      time: "09:00 - 12:00",
      type: "training",
      location: "En ligne"
    },
    {
      id: 3,
      title: "Entretien annuel",
      date: "25 Mars",
      time: "14:00 - 15:00",
      type: "evaluation",
      location: "Bureau Manager"
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: "Demander un congé",
      description: "Nouvelle demande de congé",
      icon: Calendar,
      color: "bg-blue-500",
      href: "/employe/conges/nouvelle-demande"
    },
    {
      id: 2,
      title: "Pointer",
      description: "Enregistrer arrivée/départ",
      icon: Clock,
      color: "bg-green-500",
      href: "/employe/temps/pointage"
    },
    {
      id: 3,
      title: "Mes documents",
      description: "Consulter mes documents",
      icon: FileText,
      color: "bg-purple-500",
      href: "/employe/documents"
    },
    {
      id: 4,
      title: "Messages",
      description: "3 nouveaux messages",
      icon: MessageSquare,
      color: "bg-orange-500",
      href: "/employe/messages"
    }
  ];

  return (
    <EmployeeDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, John Doe
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Présent depuis 08:30</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className={`${action.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {employeeStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-2 rounded-lg text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.subtitle}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{stat.title}</span>
                  <span className="text-gray-900 font-medium">{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Activités Récentes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100 text-green-600' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Prochains Événements</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'training' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type === 'meeting' ? 'Réunion' :
                         event.type === 'training' ? 'Formation' : 'Évaluation'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracking Widget */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Temps de Travail Aujourd'hui</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir détails
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">08:30</div>
              <div className="text-sm text-gray-500">Arrivée</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">--:--</div>
              <div className="text-sm text-gray-500">Départ</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">7h45</div>
              <div className="text-sm text-gray-500">Travaillées</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">30 min</div>
              <div className="text-sm text-gray-500">Pause</div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
};

export default EmployeePage;