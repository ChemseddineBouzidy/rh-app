'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Award, 
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  MessageSquare,
  DollarSign,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle
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

const EmployeeDashboardLayout = ({ children }: DashboardProps) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigationData: NavigationItem[] = useMemo(() => [
    { 
      id: 'dashboard', 
      name: 'Tableau de bord', 
      href: '/employe', 
      icon: Home, 
      current: activeView === 'dashboard'
    },
    { 
      id: 'profile', 
      name: 'Mon Profil', 
      href: '/employe/profile', 
      icon: User,
      current: activeView === 'profile'
    },
    {
      id: 'conges',  
      name: 'Mes Congés',
      href: '/employe/conges',
      icon: Calendar,
      badge: 2,
      children: [
        { id: 'conges-demandes', name: 'Mes Demandes', href: '/employe/conges/mes-demandes', current: activeView === 'conges-demandes', badge: 2 },
        { id: 'conges-nouvelle', name: 'Nouvelle Demande', href: '/employe/conges/nouvelle-demande', current: activeView === 'conges-nouvelle' },
        { id: 'conges-solde', name: 'Solde de Congés', href: '/employe/conges/solde', current: activeView === 'conges-solde' },
      ],
      current: activeView === 'conges' || activeView === 'conges-demandes' || activeView === 'conges-nouvelle' || activeView === 'conges-solde'
    },
    { 
      id: 'temps', 
      name: 'Temps de Travail', 
      href: '/employe/temps', 
      icon: Clock,
      children: [
        { id: 'temps-pointage', name: 'Pointage', href: '/employe/temps/pointage', current: activeView === 'temps-pointage' },
        { id: 'temps-heures', name: 'Mes Heures', href: '/employe/temps/mes-heures', current: activeView === 'temps-heures' },
      ],
      current: activeView === 'temps' || activeView === 'temps-pointage' || activeView === 'temps-heures'
    },
    { 
      id: 'documents', 
      name: 'Documents', 
      href: '/employe/documents', 
      icon: FileText,
      badge: 'NEW',
      current: activeView === 'documents'
    },
    { 
      id: 'formation', 
      name: 'Formations', 
      href: '/employe/formations', 
      icon: BookOpen,
      current: activeView === 'formation'
    },
    { 
      id: 'evaluations', 
      name: 'Évaluations', 
      href: '/employe/evaluations', 
      icon: Target,
      current: activeView === 'evaluations'
    },
    { 
      id: 'messages', 
      name: 'Messages', 
      href: '/employe/messages', 
      icon: MessageSquare,
      badge: 3,
      current: activeView === 'messages'
    }
  ], [activeView]);

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

    const navItem = findItem(navigationData);
    setActiveView(itemId);
    
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

  useEffect(() => {
    const path = window.location.pathname;
    
    const findMatchingItem = () => {
      for (const item of navigationData) {
        if (item.children) {
          for (const child of item.children) {
            if (path === child.href || path.startsWith(child.href + '/')) {
              setExpandedItems(prev => 
                prev.includes(item.id) ? prev : [...prev, item.id]
              );
              return child.id;
            }
          }
        }
      }
      
      for (const item of navigationData) {
        if (path === item.href || path.startsWith(item.href + '/')) {
          return item.id;
        }
      }
      
      return 'dashboard';
    };
    
    const matchingId = findMatchingItem();
    setActiveView(matchingId);
  }, [navigationData]);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      const findMatchingItem = () => {
        for (const item of navigationData) {
          if (item.children) {
            for (const child of item.children) {
              if (path === child.href || path.startsWith(child.href + '/')) {
                setExpandedItems(prev => 
                  prev.includes(item.id) ? prev : [...prev, item.id]
                );
                return child.id;
              }
            }
          }
        }
        
        for (const item of navigationData) {
          if (path === item.href || path.startsWith(item.href + '/')) {
            return item.id;
          }
        }
        
        return 'dashboard';
      };
      
      const matchingId = findMatchingItem();
      setActiveView(matchingId);
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [navigationData]);
  
  return (
    <div className="min-h-screen flex">
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

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-gray-200/50 flex-shrink-0">
            <div className="text-xs font-medium text-gray-500 mb-2">Actions rapides</div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleNavigation('conges-nouvelle')}
                className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="ml-1 text-xs text-blue-700 font-medium">Congé</span>
              </button>
              <button 
                onClick={() => handleNavigation('temps-pointage')}
                className="flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <Clock className="w-4 h-4 text-green-600" />
                <span className="ml-1 text-xs text-green-700 font-medium">Pointer</span>
              </button>
            </div>
          </div>
        )}

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

                      {isCollapsed && item.badge && (
                        <div className="absolute -top-1 -right-1">
                          {renderBadge(item.badge)}
                        </div>
                      )}

                      {isCollapsed && item.current && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-r"></div>
                      )}
                    </button>

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

        {/* Employee Status Section */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-t border-gray-200/50 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-700">Statut aujourd'hui</div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] text-green-600 font-medium">Présent</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Arrivée: 08:30</span>
                  <span>7h45 travaillées</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="px-3 py-3 border-t border-gray-200/50 flex-shrink-0 mt-auto">
          {!isCollapsed && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-medium text-blue-700">JD</span>
                </div>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-[10px] text-gray-500">Employé</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {[
              { name: 'Paramètres', icon: Settings, id: 'settings' },
              { name: 'Notifications', icon: Bell, id: 'notifications', badge: 3 },
              { 
                name: 'Déconnexion', 
                icon: LogOut, 
                className: 'text-red-600 hover:bg-red-50',
                onClick: () => signOut({ callbackUrl: "/auth/signin" })
              },
            ].map((item) => (
              <div key={item.name}>
                {renderTooltip(item,
                  <button 
                    onClick={() => item.onClick ? item.onClick() : item.id && handleNavigation(item.id)}
                    className={`${item?.className || ''} w-full flex items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${
                      isCollapsed ? 'justify-center' : 'space-x-3'
                    } relative`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto">{renderBadge(item.badge)}</span>
                    )}
                    {isCollapsed && item.badge && (
                      <div className="absolute -top-1 -right-1">
                        {renderBadge(item.badge)}
                      </div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-64 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default EmployeeDashboardLayout;