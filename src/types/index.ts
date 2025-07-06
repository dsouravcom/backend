export interface CorsOptions {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => void;
  methods: string;
  credentials: boolean;
}