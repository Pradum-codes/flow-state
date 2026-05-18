# FlowState Client

Frontend for FlowState built with Next.js App Router.

## Run
```bash
npm install
npm run dev
```

Default URL: `http://localhost:3000`

Set API URL in `.env`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_TIMEOUT_MS=15000
```

## Quality Gates
```bash
npm run lint
npm run build
```

## Phase 6 Improvements
- Route-level error and loading boundaries
- Mobile navigation accessibility improvements (skip link + toggle state)
- Offline connection banner for degraded network awareness
- API timeout handling with lightweight GET cache windows
- Production-oriented Next config (`poweredByHeader: false`, compression enabled)
