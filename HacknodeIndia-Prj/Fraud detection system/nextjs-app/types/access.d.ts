export interface AccessLog {
  user: string;
  branch: string;
  timestamp: string;
  purpose: string;
  suspicious: boolean;
}
