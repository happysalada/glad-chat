import type { User } from '$lib/globals'
import { persisted } from 'svelte-local-storage-store'
import { writable} from 'svelte/store'
import type { Property } from "$lib/globals.d.ts"

export const user = persisted('user', {});
export const searchQuery = writable<string>("");
export const properties = writable<Property[]>([]);
export const selectedProperty = writable<Property | null>(null);
export const displayProperties = writable<Property[]>([]);
