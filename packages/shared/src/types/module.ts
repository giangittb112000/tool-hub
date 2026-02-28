// Mọi interface module chung sẽ nằm ở đây
export interface CoreContext {
  // Thay thế bằng các logger/config thật sau này
  logger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface ToolHubModule {
  id: string;
  name: string;
  version: string;
  autorun?: boolean;

  onInit(ctx: CoreContext): Promise<void>;
  onStart(): Promise<boolean>;
  onStop(): Promise<boolean>;
}
