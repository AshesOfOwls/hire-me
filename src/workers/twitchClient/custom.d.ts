declare module 'comlink-loader!*' {
  class WebpackWorker extends Worker {
    constructor();

    // Add any custom functions to this class.
    // Make note that the return type needs to be wrapped in a promise.
    subscribe(callback: any): Promise<string>;
    subscribeToMetadata(callback: any): Promise<string>;
    join(channel: string): Promise<string>;
    init(callback: any): Promise<string>;
    destroy(): Promise<string>;
  }

  export = WebpackWorker;
}
