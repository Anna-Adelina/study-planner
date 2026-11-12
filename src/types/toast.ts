export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number; // новий id перезапускає таймер, навіть якщо текст той самий
  message: string;
  variant: ToastVariant;
}