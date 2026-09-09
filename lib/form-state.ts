export type SetupState = { message: string };

export type AuthState = { success: boolean; message: string; email: string };
export type RecoveryState = { success: boolean; message: string; email?: string };
