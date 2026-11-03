import type { APIRoute } from 'astro'
import { buildTerminalData } from '../lib/terminal-data'

export const GET: APIRoute = async () => Response.json(await buildTerminalData('it'))
