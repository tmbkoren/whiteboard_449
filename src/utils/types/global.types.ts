import { type Session } from '@supabase/supabase-js';
import { type Database } from '../../../database.types';

export interface RouterContext {
  session: Session | null;
}


export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Project = Database['public']['Tables']['project']['Row'];

export type UserProjectRole = 'owner' | 'editor' | 'viewer';

export interface UserProject extends Project {
  role: UserProjectRole;
}