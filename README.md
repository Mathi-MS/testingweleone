# Wele UI - Design System

A comprehensive React design system built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Complete Theme System**: Consistent colors, typography, and spacing
- **Form Components**: Input, Select, Textarea, Checkbox with validation states
- **UI Components**: Button, Card, Badge, Alert with multiple variants
- **TypeScript Support**: Full type safety and IntelliSense
- **Tailwind Integration**: Utility-first CSS with custom design tokens

## Components

### Form Components
- `Input` - Text input with label, error states, and variants
- `Select` - Dropdown select with options
- `Textarea` - Multi-line text input
- `Checkbox` - Checkbox with label support

### UI Components
- `Button` - Multiple variants (primary, secondary, outline, ghost, danger)
- `Card` - Container with header, content, footer sections
- `Badge` - Status indicators with color variants
- `Alert` - Notification messages with different severity levels

### Theme
- Primary color palette based on #005AFF
- Secondary grays for text and backgrounds
- Success, warning, and error states
- Consistent spacing and border radius
- Custom shadows and typography

## Usage

```tsx
import { Button, Input, Card } from './components/ui';

function MyForm() {
  return (
    <Card>
      <Input label="Email" type="email" placeholder="Enter email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Installation

```bash
npm install
npm run dev
```

## Development

The design system includes:
- `/src/theme/` - Theme configuration and design tokens
- `/src/components/ui/` - Reusable UI components
- `/src/components/forms/` - Form examples
- `/src/components/examples/` - Component showcase

View the complete showcase at `/src/components/examples/ThemeShowcase.tsx`

## Configure Backend Base URL (API Gateway)

This UI calls the backend through the API Gateway at `https://app.wele.in`.

Environment files included:

- `.env.development` (local dev)
- `.env` and `.env.production` (server / Kubernetes)

Default production REST base:

- `VITE_REST_ENDPOINT=https://app.wele.in/api/microlearning/api/v1`

> If you expose other services (mentor, student, etc.) and the UI needs them later, add new API clients and point them to `https://app.wele.in/api/<service>/...`.

## Docker

Build and run locally:

```bash
docker build -t wele-ui:dev .
docker run --rm -p 8080:80 wele-ui:dev
# open http://localhost:8080
```

## Kubernetes (k3s)

Apply the manifest:

```bash
kubectl apply -f k8s/wele-ui.yaml
```

Access (NodePort):

- `http://app.wele.in:30050`

If you want **HTTPS on the same public domain** (`https://app.wele.in/ui`), expose this service through Traefik with an IngressRoute / Ingress and TLS (recommended), instead of using NodePort.
