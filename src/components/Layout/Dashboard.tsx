'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
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
  DollarSign,
  School,
  Lock
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

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeView, setActiveView] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigationData: NavigationItem[] = useMemo(() => [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      href: '/admin', 
      icon: Home, 
      current: activeView === 'dashboard'
    },
    { 
      id: 'users', 
      name: 'Utilisateurs', 
      href: '/admin/users', 
      icon: UserPlus,
      children: [
        { id: 'users-list', name: 'Liste des Employés', href: '/admin/users', current: activeView === 'users-list' },
        { id: 'users-create', name: 'Ajouter Employé', href: '/admin/users/create-employee', current: activeView === 'users-create' },
      ],
      current: activeView === 'users' || activeView === 'users-list' || activeView === 'users-create'
    },
    { 
      id: 'department', 
      name: 'Département', 
      href: '/admin/department', 
      icon: School,
      current: activeView === 'department'
    },
    {
      id: 'leave',  
      name: 'Congés',
      href: '/admin/leave',
      icon: Calendar,
      children: [
        { id: 'leave-list', name: 'Liste des types de Congés', href: '/admin/conges/leave_types', current: activeView === 'leave-list' },
        { id: 'leave-create', name: 'Demander Congé', href: '/admin/conges/leave-requests/create-leave-requests', current: activeView === 'leave-create' },
        { id: 'leave-requests', name: 'Gestion des Demandes', href: '/admin/conges/gestion-demandes', current: activeView === 'leave-requests' },
      ],
      current: activeView === 'leave' || activeView === 'leave-list' || activeView === 'leave-create'
    },
      { 
      id: 'reset-password', 
      name: 'Réinitialisation de mot de passe', 
      href: '/admin/users/reset-password', 
      icon: Lock,
      current: activeView === 'reset-password'
    },

  ], [activeView]);

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
    // Find the navigation item or child item by ID
    const findItem = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children) {
          const childItem = item.children.find(child => child.id === itemId);
          if (childItem) return childItem;
        }
      }
      return null;
    };

    // Find the item to navigate to
    const navItem = findItem(navigationData);
    
    // Update active state
    setActiveView(itemId);
    
    // Navigate to the page if we found a matching item
    if (navItem && navItem.href) {
      router.push(navItem.href);
    }
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

  // Add this useEffect to sync the activeView with the current URL
  useEffect(() => {
    // Extract the current path from window.location
    const path = window.location.pathname;
    
    // Find a matching navigation item
    const findMatchingItem = () => {
      // Check child items first for more specific matches
      for (const item of navigationData) {
        if (item.children) {
          for (const child of item.children) {
            if (path === child.href || path.startsWith(child.href + '/')) {
              // Also expand the parent item when a child is active
              setExpandedItems(prev => 
                prev.includes(item.id) ? prev : [...prev, item.id]
              );
              return child.id;
            }
          }
        }
      }
      
      // Then check main items
      for (const item of navigationData) {
        if (path === item.href || path.startsWith(item.href + '/')) {
          return item.id;
        }
      }
      
      // Default to dashboard if no match
      return 'dashboard';
    };
    
    const matchingId = findMatchingItem();
    setActiveView(matchingId);
  }, [navigationData]);

  // Also listen to router events for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      // Find a matching navigation item
      const findMatchingItem = () => {
        // Check child items first for more specific matches
        for (const item of navigationData) {
          if (item.children) {
            for (const child of item.children) {
              if (path === child.href || path.startsWith(child.href + '/')) {
                // Also expand the parent item when a child is active
                setExpandedItems(prev => 
                  prev.includes(item.id) ? prev : [...prev, item.id]
                );
                return child.id;
              }
            }
          }
        }
        
        // Then check main items
        for (const item of navigationData) {
          if (path === item.href || path.startsWith(item.href + '/')) {
            return item.id;
          }
        }
        
        // Default to dashboard if no match
        return 'dashboard';
      };
      
      const matchingId = findMatchingItem();
      setActiveView(matchingId);
    };

    // Call immediately
    handleRouteChange();

    // Listen for popstate events (back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [navigationData]);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user) return 'U';
    const firstName = session.user.first_name || '';
    const lastName = session.user.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  // Get user role display name
  const getUserRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'rh':
        return 'Ressources Humaines';
      case 'manager':
        return 'Manager';
      case 'employe':
        return 'Employé';
      default:
        return role;
    }
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
          {/* User Information */}
          {!isCollapsed && session?.user && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user.first_name} {session.user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {getUserRoleDisplay(session.user.role || '')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              {session.user.email && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Collapsed user info */}
          {isCollapsed && session?.user && (
            <div className="mb-3 flex justify-center">
              {renderTooltip(
                { 
                  name: `${session.user.first_name} ${session.user.last_name}`,
                  badge: getUserRoleDisplay(session.user.role || '')
                },
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold relative">
                  {getUserInitials()}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              )}
            </div>
          )}

          {!isCollapsed && !session?.user && (
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
            { [
              { name: 'Paramètres', icon: Settings, id: 'settings' },
              { name: 'Système', icon: Server, id: 'system' },
              { 
                name: 'Déconnexion', 
                icon: LogOut, 
                className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                onClick: () => signOut({ callbackUrl: "/auth/signin" })
              },
            ].map((item) => (
              <div key={item.name}>
                {renderTooltip(item,
                  <button 
                    onClick={() => item.onClick ? item.onClick() : item.id && handleNavigation(item.id)}
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