/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REST_ENDPOINT: string;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.xlsx" {
  const src: string;
  export default src;
}
declare module "*.xls" {
  const src: string;
  export default src;
}
declare module "*.csv" {
  const src: string;
  export default src;
}