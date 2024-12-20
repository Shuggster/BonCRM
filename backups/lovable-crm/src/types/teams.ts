export interface Team {
  id: string;
  name: string;
  description?: string;
  department: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  member_count: number;
} 