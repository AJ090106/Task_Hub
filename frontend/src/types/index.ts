export interface UserProfile {

  id: string;

  name: string;

  email: string;

  role: 'admin' | 'user';

  created_at?: string;
}

export interface Task {

  id: string;

  title: string;

  description: string;

  status:
    | 'pending'
    | 'in_progress'
    | 'submitted'
    | 'accepted'
    | 'revision_requested';

  assigned_to: string;

  created_by: string;

  product_image_url: string;

  created_at?: string;
}

export interface GeneratedVariation {

  id: string;

  task_id: string;

  image_url: string;

  image_type: string;

  prompt?: string;

  created_at?: string;
}

export interface TaskWithVariations
  extends Task {

  variations:
    GeneratedVariation[];
}

export interface ApiResponse<T> {

  success: boolean;

  data?: T;

  error?: string;
}

export interface TaskFormData{
  title : string;
  description : string;
  product_image_url : string;
  assigned_to : string;
}

export interface Session {

  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  
}