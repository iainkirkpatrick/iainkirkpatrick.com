export interface Env {
	AI: any
	VECTORIZE_INDEX: any
	ASSETS: { fetch: (request: Request) => Promise<Response> }
	APP_ENV?: string
}
