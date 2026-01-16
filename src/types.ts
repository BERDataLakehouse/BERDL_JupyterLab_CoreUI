/**
 * Response from the KBase Auth2 /api/V2/token endpoint
 */
export interface ITokenInfo {
  type: string;
  id: string;
  expires: number; // Unix timestamp in milliseconds
  created: number;
  name: string | null;
  user: string;
  custom: Record<string, string>;
  cachefor: number;
}

/**
 * BERDL JupyterHub spawn profile information
 */
export interface IBerdlProfile {
  slug: string;
  display_name: string;
  description: string;
}
