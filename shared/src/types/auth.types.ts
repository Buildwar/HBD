export enum RoleType {
  ADMIN = 'ADMIN',
  DESIGNER = 'DESIGNER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface PermissionDto {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface RoleDto {
  id: string;
  name: RoleType | string;
  description: string;
  permissions?: PermissionDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserThemePreferences {
  themeMode: 'dark' | 'light' | 'system';
  accentColor: string;
  sidebarCollapsed?: boolean;
  borderRadius?: string;
  density?: 'compact' | 'normal' | 'comfortable';
}

export interface UserDto {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  language: string;
  themePreferences: UserThemePreferences;
  roleId: string;
  role?: RoleDto;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  user: UserDto;
  token: string;
  expiresIn: string;
}

export interface LoginRequestDto {
  emailOrUsername: string;
  password?: string;
}

export interface RegisterRequestDto {
  email: string;
  username: string;
  name: string;
  password?: string;
  language?: string;
}
