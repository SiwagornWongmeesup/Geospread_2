export interface User {
  id: number;
  email: string;
  name?: string | null;
  lastname?: string | null;
  phone?: string | null;
  role?: string;
  created_at?: string;
}
