export interface Quote {
  id?: number;
  quote: string;
  author: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    confetti: any;
  }
}