// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// Advocate Types
export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date | null;
}

// Search and Filter Types
export interface SearchFilters {
  searchTerm: string;
  specialties?: string[];
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;
  cities?: string[];
  degrees?: string[];
}

// Component Props Types
export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  placeholder?: string;
}

export interface AdvocateTableProps {
  advocates: Advocate[];
  isLoading?: boolean;
  error?: string | null;
}

export interface AdvocateRowProps {
  advocate: Advocate;
  index: number;
}

// Event Handler Types
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;
export type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

// Database Types
export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: unknown | null;
}

// Form Types
export interface SearchFormData {
  searchTerm: string;
} 