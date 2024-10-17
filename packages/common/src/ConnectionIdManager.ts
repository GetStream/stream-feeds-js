export class ConnectionIdManager {
  loadConnectionIdPromise: Promise<string> | undefined;
  connectionId?: string;
  private resolve?: (connectionId: string) => void;
  private reject?: (reason: any) => void;

  reset = () => {
    this.loadConnectionIdPromise = undefined;
    this.connectionId = undefined;
  };

  resetConnectionIdPromise = () => {
    this.connectionId = undefined;
    this.loadConnectionIdPromise = new Promise<string>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  };

  resolveConnectionidPromise = (connectionId: string) => {
    this.connectionId = connectionId;
    this.resolve?.(connectionId);
  };

  rejectConnectionIdPromise = (reason: any) => {
    this.connectionId = undefined;
    this.reject?.(reason);
  };

  getConnectionId = () => {
    if (this.connectionId) {
      return this.connectionId;
    }

    if (this.loadConnectionIdPromise) {
      return this.loadConnectionIdPromise;
    }

    throw new Error(
      `No connection id, try to get one by calling "connectUser"`,
    );
  };
}
