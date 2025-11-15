# Getting Started with CF CMS 3.0

Complete guide to build and deploy production-ready applications with CF CMS.

## What is CF CMS?

CF CMS is a modern, production-ready headless CMS built for Cloudflare's edge platform. It features:

- **Fully Dynamic Plugin System**: Extend functionality without touching core code
- **Complete E-Commerce**: Products, orders, payments, inventory, multi-store
- **Edge-First**: Built for Cloudflare Workers with global performance
- **TypeScript-First**: Full type safety and excellent developer experience
- **AI-Friendly**: Clean architecture designed for AI-assisted development

## Quick Start

```bash
# Create new project
npx create-cf-cms@latest my-app
cd my-app
npm install
npm run dev
```

Access at: http://localhost:8787

## Key Features

### 1. Content Collections
Create and manage different types of content with dynamic fields.

### 2. E-Commerce (New!)
Full support for products, orders, customers, inventory, and payments.

### 3. Plugins (Enhanced!)
Fully dynamic plugin system - load/install/uninstall without rebuilding.

### 4. Multi-Store
Manage multiple stores from a single admin interface.

### 5. Admin Dashboard
Comprehensive admin UI for all CMS operations.

## Documentation

- [Plugin Development Guide](./plugins/PLUGIN_DEVELOPMENT_GUIDE.md)
- [E-Commerce Setup](./ecommerce-setup.md)
- [Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Upgrade Guide (from v2.0)](./UPGRADE_GUIDE_TO_CF_CMS_3.md)

## Core Commands

```bash
# Development
npm run dev           # Start dev server

# Building
npm run build        # Build for production
npm run build:core   # Build core package

# Testing
npm test            # Run tests
npm run test:watch  # Watch mode

# Database
npm run db:migrate  # Apply migrations
npm run db:studio   # Open DB studio

# Deployment
npm run deploy      # Deploy to Cloudflare
```

## Next Steps

1. Read [Getting Started with CF CMS 3.0](./GETTING_STARTED_CF_CMS.md)
2. Learn [Plugin Development](./PLUGIN_DEVELOPMENT_GUIDE_CF_CMS.md)
3. Set up [E-Commerce](./ecommerce-setup.md)
4. Deploy to [Production](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

Built with ❤️ for Cloudflare
