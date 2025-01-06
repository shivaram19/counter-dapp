/// <reference types="vite/client" />
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise;
    on: (event: string, callback: (accounts: string[]) => void) => void;
    removeListener: (event: string, callback: (accounts: string[]) => void) => void;
  };
}
