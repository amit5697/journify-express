
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Error signing out: ' + error.message);
        return;
      }
      
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
