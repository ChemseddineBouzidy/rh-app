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
import Image from 'next/image';

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

const Dashboard = ( {children}) => {
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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (itemId: string) => {
    setActiveView(itemId);
  };

  const filteredNavigation = navigationData.filter(item => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.children?.some(child => 
             child.name.toLowerCase().includes(searchQuery.toLowerCase())
           );
  });

  const renderBadge = (badge: number | string | undefined) => {
    if (!badge) return null;
    
    const isNew = badge === 'NEW';
    const isNumber = typeof badge === 'number';
    
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
        isNew 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      }`}>
        {isNumber && badge > 99 ? '99+' : badge}
      </span>
    );
  };

  const renderTooltip = (item: any, children: React.ReactNode) => {
    if (!isCollapsed) return children;
    
    return (
      <div className="group relative">
        {children}
        <div className="invisible group-hover:visible absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
            <div className="font-medium">{item.name}</div>
            {item.badge && (
              <div className="mt-1 text-[10px] opacity-75">
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge} éléments
              </div>
            )}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Make the sidebar fixed with appropriate height and overflow handling */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 flex flex-col">
        {/* Header */}
        <div className="px-3 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
              
                <Image
                  src="/Bayllo.png"
                  alt="Logo"
                  width={102}
                  height={42}
                  className="hidden md:block rounded-lg items-center mx-auto"
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-3 py-3 border-b border-gray-200/50 flex-shrink-0">
          {!isCollapsed && !showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center px-3 py-2 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/50"
            >
              <Search className="w-3.5 h-3.5 mr-2" />
              <span>Rechercher...</span>
            </button>
          )}

          {showSearch && !isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher dans la navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center">
              {renderTooltip({ name: 'Rechercher', badge: null },
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <div key={item.id}>
                {renderTooltip(item,
                  <div>
                    <button
                      onClick={() => {
                        if (item.children && !isCollapsed) {
                          toggleExpanded(item.id);
                        } else {
                          handleNavigation(item.id);
                        }
                      }}
                      className={`relative w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:cursor-pointer group ${
                        item.current
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-3'}`} />
                      
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate text-xs font-medium">{item.name}</span>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            {item.badge && renderBadge(item.badge)}
                            
                            {item.children && (
                              <div className={`transform transition-transform duration-200 ${
                                expandedItems.includes(item.id) ? 'rotate-90' : ''
                              }`}>
                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Badge pour mode collapsed */}
                      {isCollapsed && item.badge && (
                        <div className="absolute -top-1 -right-1">
                          {renderBadge(item.badge)}
                        </div>
                      )}

                      {/* Indicateur actif pour mode collapsed */}
                      {isCollapsed && item.current && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-r"></div>
                      )}
                    </button>

                    {/* Sous-menu */}
                    {item.children && !isCollapsed && expandedItems.includes(item.id) && (
                      <div className="mt-1 ml-7 space-y-0.5">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleNavigation(child.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors group ${
                              child.current
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{child.name}</span>
                            {child.badge && renderBadge(child.badge)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message si recherche sans résultat */}
          {searchQuery && filteredNavigation.length === 0 && !isCollapsed && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Aucun résultat
              </div>
              <div className="text-xs text-gray-400">
                Essayez avec d'autres termes
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section - always at the bottom */}
        <div className="px-3 py-3 border-t border-gray-200/50 flex-shrink-0 mt-auto">
          {!isCollapsed && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">Entreprise RH</span>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px]">En ligne</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {[
              { name: 'Documents', icon: File, id: 'files' },
              { name: 'Paramètres', icon: Settings, id: 'settings' },
              { name: 'Système', icon: Server, id: 'system' },
              { name: 'Déconnexion', icon: LogOut, className: 'text-red-600 hover:bg-red-50' },
            ].map((item) => (
              <div key={item.name}>
                {renderTooltip(item,
                  <button 
                    onClick={() => item.id && handleNavigation(item.id)}
                    className={`${item?.className || ''} w-full flex items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${
                      isCollapsed ? 'justify-center' : 'space-x-3'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area with padding to account for the fixed sidebar width */}
      <div className="flex-1 ml-64 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export { Dashboard };