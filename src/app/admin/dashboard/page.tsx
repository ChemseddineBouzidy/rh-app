    'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Clock, 
  UserPlus, 
  Award, 
  Building,
  Search,
  Bell,
  Settings,
  ChevronDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  ChevronRight,
  X,
  LogOut,
  Server,
  File,
  MessageSquare,
  Shield,
  BarChart3,
  Target,
  Briefcase,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { Dashboard } from '@/components/Layout/Dashboard';
interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: typeof Home;
  current?: boolean;
  badge?: number | string;
  children?: Array<{
    id: string;
    name: string;
    href: string;
    current?: boolean;
    badge?: number | string;
  }>;
}

const Home = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigationData: NavigationItem[] = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      current: activeView === 'dashboard'
    },
    { 
      id: 'employees', 
      name: 'Employés', 
      href: '/employees', 
      icon: Users,
      badge: 847,
      children: [
        { id: 'directory', name: 'Annuaire', href: '/employees/directory' },
        { id: 'onboarding', name: 'Intégration', href: '/employees/onboarding', badge: 3 },
        { id: 'evaluations', name: 'Évaluations', href: '/employees/evaluations', badge: 12 }
      ],
      current: activeView === 'employees'
    },
    { 
      id: 'recruitment', 
      name: 'Recrutement', 
      href: '/recruitment', 
      icon: UserPlus,
      badge: 23,
      children: [
        { id: 'candidates', name: 'Candidats', href: '/recruitment/candidates', badge: 15 },
        { id: 'interviews', name: 'Entretiens', href: '/recruitment/interviews', badge: 8 },
        { id: 'offers', name: 'Offres d\'emploi', href: '/recruitment/offers' }
      ],
      current: activeView === 'recruitment'
    },
    { 
      id: 'attendance', 
      name: 'Présences', 
      href: '/attendance', 
      icon: Clock,
      current: activeView === 'attendance'
    },
    { 
      id: 'payroll', 
      name: 'Paie', 
      href: '/payroll', 
      icon: DollarSign,
      badge: 'NEW',
      children: [
        { id: 'salary', name: 'Salaires', href: '/payroll/salary' },
        { id: 'benefits', name: 'Avantages', href: '/payroll/benefits' },
        { id: 'taxes', name: 'Charges', href: '/payroll/taxes' }
      ],
      current: activeView === 'payroll'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      href: '/performance', 
      icon: Target,
      current: activeView === 'performance'
    },
    { 
      id: 'training', 
      name: 'Formation', 
      href: '/training', 
      icon: GraduationCap,
      badge: 5,
      current: activeView === 'training'
    },
    { 
      id: 'calendar', 
      name: 'Calendrier', 
      href: '/calendar', 
      icon: Calendar,
      current: activeView === 'calendar'
    },
    { 
      id: 'reports', 
      name: 'Rapports', 
      href: '/reports', 
      icon: BarChart3,
      current: activeView === 'reports'
    }
  ];

  // Données simulées
  const stats = [
    {
      title: "Total Employés",
      value: "847",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Nouveaux Recrutements",
      value: "23",
      change: "+8%",
      changeType: "positive",
      icon: UserPlus,
      color: "bg-green-500"
    },
    {
      title: "Congés en Attente",
      value: "15",
      change: "-5%",
      changeType: "negative",
      icon: Calendar,
      color: "bg-orange-500"
    },
    {
      title: "Taux de Satisfaction",
      value: "94%",
      change: "+2%",
      changeType: "positive",
      icon: Award,
      color: "bg-purple-500"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "recruitment",
      message: "Nouveau candidat: Marie Dubois - Développeur Frontend",
      time: "Il y a 2h",
      status: "new"
    },
    {
      id: 2,
      type: "leave",
      message: "Demande de congé approuvée pour Jean Martin",
      time: "Il y a 4h",
      status: "approved"
    },
    {
      id: 3,
      type: "evaluation",
      message: "Évaluation complétée pour Sophie Laurent",
      time: "Il y a 1 jour",
      status: "completed"
    },
    {
      id: 4,
      type: "onboarding",
      message: "Intégration terminée pour Alex Chen",
      time: "Il y a 2 jours",
      status: "completed"
    }
  ];

  const employees = [
    {
      id: 1,
      name: "Marie Dubois",
      position: "Développeur Frontend",
      department: "IT",
      status: "Actif",
      avatar: "MD"
    },
    {
      id: 2,
      name: "Jean Martin",
      position: "Chef de Projet",
      department: "Marketing",
      status: "En congé",
      avatar: "JM"
    },
    {
      id: 3,
      name: "Sophie Laurent",
      position: "Designer UX",
      department: "Design",
      status: "Actif",
      avatar: "SL"
    },
    {
      id: 4,
      name: "Alex Chen",
      position: "Data Analyst",
      department: "Analytics",
      status: "Actif",
      avatar: "AC"
    }
  ];

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);



  return (
    <Dashboard>
    <div className="min-h-screen bg-gray-50 flex">


    </div>
    </Dashboard>
  );
};

export default Home;