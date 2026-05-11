# eBay Integration

Connect your eBay store to Smart ERP Next for automatic syncing of products, orders, and customers.

## Prerequisites

- An eBay seller account
- Register as an eBay Developer and create an application to obtain:
  - App ID (Client ID)
  - Cert ID (Client Secret)
  - Dev ID
- Generate a User Access Token (OAuth) for the seller account (from eBay Developers Portal → My Applications → User Tokens)

## Setup Steps

1. In Smart ERP Next, go to **Settings → E‑commerce**.
2. Click the **eBay** tab.
3. Fill in the required fields:
   - **App ID**, **Cert ID**, **Dev ID** – from your eBay Developer application.
   - **User Access Token** – obtained from the eBay developer portal (long-lived token, requires your permission).
   - **Site ID** – numerical code for the eBay marketplace (default 0 = US / eBay Motors).
4. Click **Save**.

## Sync Behaviour

- **Products**: synced every 30 minutes (cron) or manually via "Sync now". Pulls inventory items, SKUs, titles, prices, stock levels.
- **Orders**: synced every 30 minutes. New orders are created in Smart ERP Next with channel `ebay`.
- **Customers**: derived from order buyer information (eBay does not provide a dedicated customer list API).

## Webhooks (Optional)

eBay supports webhooks for real‑time updates. After saving your store, run the `POST /ecommerce/stores/:id/webhooks` endpoint to register webhooks for `ORDER.CREATED`, `ORDER.SHIPPED`, `INVENTORY.ITEM.UPDATED`.

## Troubleshooting

- **Invalid token** – ensure the User Access Token is valid (tokens expire after a few months; regenerate it from eBay Developer Portal).
- **Rate limits** – eBay API has rate limits. Our sync respects a safe delay and back‑off mechanism.

## Supported Features

- Product catalog sync (SKU, title, price, stock, images)
- Order sync (status mapping, total amount, buyer name)
- Basic buyer information extraction

## Limitations

- Inventory sync is one‑way (eBay → ERP). Two‑way sync (ERP → eBay) is planned.
- eBay’s product model uses SKU as the primary identifier.
