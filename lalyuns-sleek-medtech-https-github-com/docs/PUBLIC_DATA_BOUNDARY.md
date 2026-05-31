# Public Website and Internal System Data Boundary

This project intentionally separates the public website from the internal medical device version-control system.

## Public website

The public website may read:

- CMS content from `public_site_contents`
- Public product fields from `GET /api/v1/catalog/products`

The public website may write:

- Product order or inquiry requests to `POST /api/v1/catalog/requests`
- Join-us applications to `POST /api/v1/join-us/applications`

The public website must not expose:

- STL/model version records
- Material parameters
- BOM details or costs
- Reports
- Audit logs
- Traceability graph data
- Internal project files or clinical feedback

## CMS

The CMS edits website presentation content only:

- Brand name, logo, navigation labels
- Page copy
- Hero images and background images
- Public showcase cards
- Public 3D/image display cards
- LINE Bot and AI assistant copy

CMS changes should not directly modify internal project, material, BOM, report, audit, or traceability records.

## Internal system

The internal system remains the source of truth for controlled medical device work:

- Projects
- STL/model versions
- Materials
- Feedback
- Reports
- BOM and costs
- Audit logs
- Traceability

These APIs must require authentication and appropriate roles.

## Shared bridge

The bridge between the public website and internal system is intentionally narrow:

- Public product catalog exposes only approved summary fields.
- Website and LINE Bot orders flow into the same request table.
- Internal staff review requests before creating accounts, projects, or sharing controlled data.
