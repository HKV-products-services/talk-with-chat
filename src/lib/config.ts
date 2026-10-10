import { z } from 'zod'

import type { BuiltinTool, ModelConfig } from '@/types'

// Talk with Optimalen: dezelfde chat dient ook de kennisbank (`/chat-kennisbank/`). Naam, welkom en de
// opslag van de gesprekken komen daarom uit de paginaconfiguratie; zonder is het de chat van OptiMalen.
export interface Welkom {
  titel: string
  zin: string
  /** De tekst in het lege invoerveld. */
  invoer: string
  /** Startvragen. Een open eindigende (zonder vraagteken) komt in het invoerveld om af te maken. */
  vragen: { label: string; prompt: string }[]
}

const WELKOM_OPTIMALEN: Welkom = {
  titel: 'Waar wil je naar kijken?',
  zin: 'Vraag wat er gepland was, wat de gemalen deden, en waarom.',
  invoer: 'Wat wil je weten over de planning?',
  vragen: [
    {
      label: 'Planning en inzet',
      prompt: 'Waar week de gedraaide inzet de afgelopen twee weken af van de planning, en waarom?',
    },
    {
      label: 'Controle',
      prompt: 'Waarom zou de controle van 9 september 22:00 anders kiezen dan de goedgekeurde planning?',
    },
    { label: 'Pompmodes', prompt: 'Welke pompen stonden niet op OptiMalen, en met welke reden?' },
    {
      label: 'Gebiedsregeling',
      prompt: 'Wat deed OptiMalen anders dan de gebiedsregeling in de eerste dagen van september?',
    },
  ],
}

/** Het pictogram bij een soort vervolgvraag. */
export type Icoon = 'zoeken' | 'vergelijken' | 'verklaren' | 'onderbouwen' | 'verbeteren' | 'verbinden' | 'uitvoeren'

/**
 * De vervolgvragen: de output-functie van de agent die het antwoord afsluit, de kop erboven, en per soort de sleutel
 * van zijn argument, het label en het pictogram, in de volgorde waarin ze onder het antwoord staan.
 */
export interface Vervolgopties {
  tool: string
  kop: string
  soorten: { sleutel: string; label: string; icoon: Icoon }[]
}

const VERVOLGOPTIES_OPTIMALEN: Vervolgopties = {
  tool: 'vervolgopties',
  kop: 'Verder vragen',
  soorten: [
    { sleutel: 'inzoomen', label: 'Inzoomen', icoon: 'zoeken' },
    { sleutel: 'vergelijken', label: 'Vergelijken', icoon: 'vergelijken' },
    { sleutel: 'verklaren', label: 'Verklaren', icoon: 'verklaren' },
  ],
}

/**
 * Een tool die een wijziging voorstelt en goedkeuring vraagt, als kaart: wat verandert ten opzichte van nu, en
 * waarom, met Overnemen, Aanpassen en Laten. `huidig` is een adres met `{argument}` erin dat de waarden van nu
 * geeft, in de vorm van de argumenten (404: er is nog niets). `titel` en `toelichting` zijn namen van argumenten.
 */
export interface Voorstel {
  tool: string
  titel: string
  toelichting: string
  /** `lijst`: de keuzelijst voor de waarde; bij een lijst van teksten met `scheiding` voor het deel ervoor. */
  velden: { sleutel: string; label: string; lijst?: string; scheiding?: string }[]
  huidig: string
}

/** Vaste waarden per lijst; een waarde uit een lijst is in de chat een keuzelijst. */
export type Keuzelijsten = Record<string, string[]>

export interface StartupConfig {
  basePath?: string
  apiPath?: string
  naam?: string
  opslag?: string
  welkom?: Welkom
  vervolgopties?: Vervolgopties
  voorstel?: Voorstel
}

export interface ResolvedStartupConfig {
  readonly basePath: string
  readonly apiPath: string
  readonly naam: string
  /** De naam van de IndexedDB met de gesprekken: elke chat zijn eigen gesprekken. */
  readonly opslag: string
  readonly welkom: Welkom
  readonly vervolgopties: Vervolgopties
  readonly keuzelijsten: Keuzelijsten
  readonly voorstel: Voorstel | null
}

export interface RemoteConfig {
  models: ModelConfig[]
  builtinTools: BuiltinTool[]
}

const PATH_ORIGIN = 'https://pydantic-ai-chat.invalid'

/** Normalize a same-origin directory path for safe suffix concatenation. */
export function normalizeDirectoryPath(path: string, name: string): string {
  const url = new URL(path, PATH_ORIGIN)
  if (url.origin !== PATH_ORIGIN || url.search || url.hash) {
    throw new TypeError(`${name} must be a same-origin path without a query or fragment`)
  }
  return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
}

function defaultBasePath(viteBase: string): string {
  const url = new URL(viteBase || '/', PATH_ORIGIN)
  return url.origin === PATH_ORIGIN ? normalizeDirectoryPath(url.pathname, 'Vite base') : '/'
}

const startupConfigSchema = z
  .object(
    {
      basePath: z.string({ error: 'PYDANTIC_AI_CHAT_CONFIG.basePath must be a string' }).optional(),
      apiPath: z.string({ error: 'PYDANTIC_AI_CHAT_CONFIG.apiPath must be a string' }).optional(),
      naam: z.string().optional(),
      opslag: z.string().optional(),
      welkom: z
        .object({
          titel: z.string(),
          zin: z.string(),
          invoer: z.string(),
          vragen: z.array(z.object({ label: z.string(), prompt: z.string() })),
        })
        .optional(),
      vervolgopties: z
        .object({
          tool: z.string(),
          soorten: z.array(
            z.object({
              sleutel: z.string(),
              label: z.string(),
              icoon: z.enum([
                'zoeken',
                'vergelijken',
                'verklaren',
                'onderbouwen',
                'verbeteren',
                'verbinden',
                'uitvoeren',
              ]),
            }),
          ),
          kop: z.string(),
        })
        .optional(),
      keuzelijsten: z.record(z.string(), z.array(z.string())).optional(),
      voorstel: z
        .object({
          tool: z.string(),
          titel: z.string(),
          toelichting: z.string(),
          velden: z.array(
            z.object({
              sleutel: z.string(),
              label: z.string(),
              lijst: z.string().optional(),
              scheiding: z.string().optional(),
            }),
          ),
          huidig: z.string(),
        })
        .optional(),
    },
    { error: 'PYDANTIC_AI_CHAT_CONFIG must be an object' },
  )
  .optional()

export function resolveStartupConfig(
  config: unknown = typeof window === 'undefined' ? undefined : window.PYDANTIC_AI_CHAT_CONFIG,
  viteBase: string = import.meta.env.BASE_URL,
): ResolvedStartupConfig {
  const parsedConfig = startupConfigSchema.safeParse(config)
  if (!parsedConfig.success) {
    throw new TypeError(parsedConfig.error.issues[0].message)
  }
  const { basePath, apiPath, naam, opslag, welkom, vervolgopties, keuzelijsten, voorstel } = parsedConfig.data ?? {}
  return Object.freeze({
    basePath: basePath === undefined ? defaultBasePath(viteBase) : normalizeDirectoryPath(basePath, 'basePath'),
    apiPath: apiPath === undefined ? '/api/' : normalizeDirectoryPath(apiPath, 'apiPath'),
    naam: naam ?? 'OptiMalen',
    opslag: opslag ?? 'chat-storage',
    welkom: welkom ?? WELKOM_OPTIMALEN,
    vervolgopties: vervolgopties ?? VERVOLGOPTIES_OPTIMALEN,
    keuzelijsten: keuzelijsten ?? {},
    voorstel: voorstel ?? null,
  })
}

export const startupConfig = resolveStartupConfig()

const remoteConfigSchema = z.looseObject({
  models: z.array(
    z.looseObject({
      id: z.string(),
      name: z.string(),
      builtinTools: z.array(z.string()),
    }),
  ),
  builtinTools: z.array(z.looseObject({ id: z.string(), name: z.string() })),
})

export function parseRemoteConfig(value: unknown): RemoteConfig {
  const parsedConfig = remoteConfigSchema.safeParse(value)
  if (!parsedConfig.success) {
    throw new Error('Configuration response did not contain models and builtin tools')
  }
  return parsedConfig.data
}

/**
 * Read the backend's model and builtin-tool configuration.
 *
 * Both the status and the shape are checked before the body is handed back. A
 * `fetch` resolves for a 4xx or 5xx just as happily as for a 200, so an error
 * payload used to be cast to a configuration and stored as a successful result:
 * the banner offering a retry never appeared, and the first read of a property
 * that error bodies do not have (`models.find(...)`) threw during render, taking
 * the chat down instead.
 */
export async function fetchConfig(): Promise<RemoteConfig> {
  const res = await fetch(`${startupConfig.apiPath}configure`)
  if (!res.ok) {
    throw new Error(`Configuration request failed with ${String(res.status)}`)
  }
  const body: unknown = await res.json()
  return parseRemoteConfig(body)
}
