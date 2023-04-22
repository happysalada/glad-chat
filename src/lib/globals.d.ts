/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

export type User = {
  email: string,
  password: string,
}

export type Property = {
  id: string,
  name: string,
  address: string,
  lat: number,
  long: number,
}

export enum FormState {
	Ready,
	Submitted,
	Success,
	Error,
}
