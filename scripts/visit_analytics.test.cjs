const assert = require('node:assert/strict')
const { test } = require('node:test')
const ts = require('typescript')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const Module = require('node:module')

function loadVisitAnalytics() {
  const filename = join(__dirname, '..', 'src', 'lib', 'visitAnalytics.ts')
  const source = readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText

  const mod = new Module(filename)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(join(__dirname, '..', 'src', 'lib'))
  mod._compile(output, filename)
  return mod.exports
}

test('hashVisitIp returns a stable daily hash without exposing the raw IP', () => {
  const { hashVisitIp } = loadVisitAnalytics()

  const first = hashVisitIp('203.0.113.9', '2026-05-17')
  const second = hashVisitIp('203.0.113.9', '2026-05-17')
  const nextDay = hashVisitIp('203.0.113.9', '2026-05-18')

  assert.equal(first, second)
  assert.notEqual(first, nextDay)
  assert(!first.includes('203.0.113.9'))
})

test('getClientIp prefers forwarded client IP headers and ignores empty values', () => {
  const { getClientIp } = loadVisitAnalytics()
  const headers = new Map([
    ['x-forwarded-for', ' 198.51.100.4, 10.0.0.1'],
    ['x-real-ip', '203.0.113.1'],
  ])

  assert.equal(getClientIp(headers), '198.51.100.4')
})

test('normalizeReferrer groups empty, direct, same-site, and external referrers', () => {
  const { normalizeReferrer } = loadVisitAnalytics()

  assert.equal(normalizeReferrer(null), 'direct')
  assert.equal(normalizeReferrer('https://k-mystic.vercel.app/en/tarot'), 'internal')
  assert.equal(
    normalizeReferrer('https://k-mystic-nyl27wa6i-mins761s-projects.vercel.app/en'),
    'internal',
  )
  assert.equal(normalizeReferrer('https://www.google.com/search?q=tarot'), 'www.google.com')
  assert.equal(normalizeReferrer('not a url'), 'unknown')
})

test('buildVisitStats does not treat missing analytics columns as real unknown traffic', () => {
  const { buildVisitStats } = loadVisitAnalytics()
  const now = new Date('2026-05-17T12:00:00.000Z')
  const todayStart = new Date('2026-05-17T00:00:00.000Z')

  const stats = buildVisitStats(
    [
      {
        path: '/en',
        lang: 'en',
        referrer: 'https://k-mystic.vercel.app/en/tarot',
        created_at: '2026-05-17T10:00:00.000Z',
      },
    ],
    todayStart,
    false,
  )

  assert.equal(stats.uniqueToday, null)
  assert.deepEqual(stats.countryViews, [])
  assert.deepEqual(stats.referrerViews, [{ label: 'internal', count: 1 }])
  assert.equal(stats.trackingSchemaReady, false)
})
