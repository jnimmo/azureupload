# Demo

- https://lemon-desert-0e568711e.5.azurestaticapps.net

- https://lemon-desert-0e568711e.5.azurestaticapps.net/portal (admin interface)

# Setup

1. Create a storage account in Azure
2. Create a .env.local file containing:

```
NEXT_PUBLIC_STORAGE_ACCOUNT=<storage account name>
SECRET_ACCESS_KEY=<storage account key>
```

If the SECRET_ACCESS_KEY is not defined, the managed identity configured in Azure Static Web Apps will be used instead. This will only need rights to create containers and write files to the given storage account.

## Install dependencies

```
cd frontend
pnpm install
```
