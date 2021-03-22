import { writable } from 'svelte/store'

export const scale = writable(1)
export const updateMs = writable(5 * 1000)
export const view = writable({ left: 0, top: 0, width: 0, height: 0 })
export const popOver = writable()
