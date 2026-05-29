# Partner Handoff

This folder contains the complete handoff package for integrating the Ruicheng public website into the partner `lalyuns/sleek-medtech` cloud system.

## File

- `ruicheng-public-site-full-bundle.zip`
- `data/cms-current-content.json`
- `data/public-products.json`
- `tools/import_public_site_data.py`

## What's Included

The zip includes:

- Git patch for the public website, CMS, AI assistant, LineBot entry, ordering page, Join Us page, and backend APIs.
- Current CMS content exported from the local database, including manually edited text and settings.
- Current public product catalog data.
- Public website image assets.
- Public 3D STL display models.
- Import script for loading CMS/product data into a local SQLite development database.
- Detailed setup README inside the zip.

## Suggested Usage

Send the zip to the partner team or unzip it and follow the included `README.md`.

The important point: this handoff is not only source code. It also contains the latest manually edited website content, images, and product data.

## CMS Manual Edits

The manually edited CMS content is also exported outside the zip for easier review:

- `data/cms-current-content.json`: the current public-site CMS content from the local database, including manually edited text, image settings, Hero image data URL, AI assistant settings, LineBot settings, homepage cards, and public 3D/product display settings.
- `data/public-products.json`: the current product catalog/order data.
- `data/export-summary.json`: record counts from the export.

After applying the patch and running migrations in the partner repo, import the current CMS/product data with:

```bash
cd backend
../partner-handoff/tools/import_public_site_data.py
```

If the SQLite database path differs:

```bash
../partner-handoff/tools/import_public_site_data.py /path/to/sleek_dev.db
```
