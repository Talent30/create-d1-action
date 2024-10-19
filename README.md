# Create or Get Cloudflare D1 Database GitHub Action

This GitHub Action creates or retrieves a Cloudflare D1 database by name and returns its `database_id`.

## Inputs

| Name         | Description                                       | Required |
| ------------ | ------------------------------------------------- | -------- |
| `db_name`    | Name of the D1 database to create or get          | `true`   |
| `account_id` | Your Cloudflare account ID                        | `true`   |
| `api_token`  | Cloudflare API token with D1 database permissions | `true`   |

## Outputs

| Name          | Description                      |
| ------------- | -------------------------------- |
| `database_id` | The ID of the D1 database (UUID) |

## Example Workflow

```yaml
name: Create or Get D1 Database

on:
  workflow_dispatch:

jobs:
  handle-d1-database:
    runs-on: ubuntu-latest
    steps:
      - name: Create or Get D1 Database
        uses: your-username/your-repo@main
        with:
          db_name: 'prod-d1-tutorial'
          account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Show Database ID
        run: echo "Database ID: ${{ steps.handle-d1-database.outputs.database_id }}"
```
