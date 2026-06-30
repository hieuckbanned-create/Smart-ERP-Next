# PII Classification

## Overview

This document classifies personally identifiable information (PII) stored in Smart ERP Next and defines access controls for each category.

## Classification levels

| Level | Definition | Examples | Storage |
|-------|-----------|----------|---------|
| **Sensitive** | Directly identifies an individual; regulated by law | Full name, email, phone, government ID, bank account, address | Encrypted at rest (column-level) |
| **Internal** | Identifies in context but not directly | User ID, tenant ID, employee ID, customer ID | Standard encryption |
| **Public** | No PII risk | Product names, SKUs, order codes, category names | No special treatment |

## Sensitive PII locations

| Field | Table | Classification | Protection |
|-------|-------|---------------|------------|
| email | users | Sensitive | Not exposed in API responses |
| name | users, customers, employees | Sensitive | Audited access |
| phone | users, customers, suppliers | Sensitive | Not exposed in public APIs |
| address | orders, customers | Sensitive | Masked in logs |
| passwordHash | users | Sensitive | Never exposed (bcrypt hash only) |
| bankAccount | payments, suppliers | Sensitive | Encrypted |

## Access rules

- **Sensitive PII**: Only accessible by authenticated users with explicit role grants
- **Internal data**: Accessible by any authenticated user within the same tenant
- **Public data**: Accessible without authentication

## Audit requirements

All access to Sensitive PII must be logged with:
- User ID who accessed the data
- Timestamp
- Action performed
- Resource accessed
