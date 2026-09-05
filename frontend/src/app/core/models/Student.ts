export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  studentNumber?: string;
  address?: string;
  avatarSeed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  studentNumber?: string;
  address?: string;
  avatarSeed?: string;
}
