export interface AppSettingDto {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface SystemInfoResponseDto {
  appName: string;
  tagline: string;
  author: string;
  version: string;
  copyright: string;
  environment: string;
  uptimeSeconds: number;
  databaseConnected: boolean;
  stats: {
    usersCount: number;
    projectsCount: number;
    floorPlansCount: number;
  };
}
