export class ConnectionIdManager {
  loadConnectionIdPromise: Promise<string | undefined> | undefined;
  connectionId?: string;
  private resolve?: (connectionId?: string) => void;
  private reject?: (reason: any) => void;

  reset = () => {
    this.loadConnectionIdPromise = undefined;
    this.resolve = undefined;
    this.reject = undefined;
    this.connectionId = undefined;
  };

  resetConnectionIdPromise = () => {
    this.connectionId = undefined;
    this.loadConnectionIdPromise = new Promise<string | undefined>(
      (resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      },
    );
  };

  resolveConnectionidPromise = (connectionId?: string) => {
    this.connectionId = connectionId;
    this.resolve?.(connectionId);
    this.loadConnectionIdPromise = undefined;
    this.resolve = undefined;
    this.reject = undefined;
  };

  rejectConnectionIdPromise = (reason: any) => {
    this.connectionId = undefined;
    this.reject?.(reason);
    this.loadConnectionIdPromise = undefined;
    this.resolve = undefined;
    this.reject = undefined;
  };

  getConnectionId = () => {
    if (this.connectionId) {
      return this.connectionId;
    }

    if (this.loadConnectionIdPromise) {
      return this.loadConnectionIdPromise;
    }

    throw new Error(
      `No connection id was provided when trying to query with presence/watch. You should call "connectUser" to get a WebSocket connection id`,
    );
  };
}
