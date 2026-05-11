# TikTok Shop Integration

This guide explains how to connect your TikTok Shop store to Smart ERP Next.

## Prerequisites
- A TikTok Shop seller account
- API credentials (App Key, App Secret) from the TikTok Shop Developer Portal

## Setup Steps

1. In Smart ERP Next, go to **Settings → E‑commerce**.
2. Click the **TikTok Shop** tab.
3. Enter your App Key, App Secret, and Shop ID.
4. Click **Save**.

## Sync Behavior

- **Products**: automatically synced every 30 minutes (cron) or manually via "Sync now".
- **Orders**: synced every 30 minutes. New orders are created in Smart ERP Next with channel `tiktokshop`.
- **Customers**: extracted from order data (buyer name, phone).

## Webhooks (Optional)

To enable real‑time updates, register webhooks by calling `POST /ecommerce/stores/:id/webhooks` after configuration. Webhook events: `order:create`, `order:ship`, `product:update`.

## Troubleshooting

- **Invalid signature**: ensure your App Secret is correct.
- **Rate limits**: TikTok Shop allows 1000 requests per minute. Our sync respects limits.

## Supported Features

- Product catalog sync (name, SKU, price, stock, images)
- Order sync (status mapping, line items, shipping)
- Basic customer extraction
