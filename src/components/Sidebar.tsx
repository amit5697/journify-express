
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle, Home, UtensilsCrossed, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/signin');
      } else if (session) {
        setUser(session.user);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Journal',
      path: '/journal',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: 'Diet Planner',
      path: '/diet-planner',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transition-transform duration-300 transform lg:translate-x-0 flex flex-col h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="px-6 py-8 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">Wellbeing App</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-10">
          <h3 className="text-xs font-medium uppercase text-muted-foreground tracking-wider mb-3 px-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <Link
              to="/journal"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <PlusCircle className="w-5 h-5" />
              New Journal Entry
            </Link>
            <Link
              to="/diet-planner"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <BookOpen className="w-5 h-5" />
              Add Meal
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        {user && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? 'Logging out...' : 'Log out'}
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
