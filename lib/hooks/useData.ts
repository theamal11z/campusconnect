
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Database } from '../types/supabase';

export function useColleges() {
  const [colleges, setColleges] = useState<Database['public']['Tables']['colleges']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  async function fetchColleges() {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setColleges(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { colleges, loading, error, refetch: fetchColleges };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { profiles, loading, error, refetch: fetchProfiles };
}
