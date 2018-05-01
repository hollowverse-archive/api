declare module 'wait-for-mysql' {
  type AwaitOptions = {
    port: number;
    host: string;
    user: string;
    password: string;
    query: string;
    quiet?: boolean;
  };

  type Await = (options: AwaitOptions) => Promise<void>;

  const WaitForMySQL = {
    await: Await,
  };

  export = WaitForMySQL;
}
