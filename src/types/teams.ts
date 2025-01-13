export type Department = 'management' | 'sales' | 'accounts' | 'trade_shop'

export interface Team {
  id: string;
  name: string;
  description?: string;
  department: Department;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'leader' | 'member';
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  member_count: number;
}

export interface TeamFormData {
  name: string;
  description: string;
  department: string;
} 