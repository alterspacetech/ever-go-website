# EVER-GO Fragrance World

Perfume and beauty catalogue for Botswana. The owner edits products in Sanity, and customers fill a bag and send the order on WhatsApp.

- Site: Next.js, built as static pages (`out/`)
- CMS: Sanity free plan, in the `studio/` folder
- Node 22.12 or newer

## 1. Run the site on sample data

```bash
npm install
npm run dev        # http://localhost:3000
```

Works before Sanity is connected, using `data/sample-dataset.json`.

## 2. Create the Sanity project

```bash
cd studio
npm install
npx sanity login
npx sanity projects create "EVER-GO Fragrance" --dataset production --dataset-visibility public
cp .env.local .env
```

Put the new project ID in `studio/.env`. Then at [sanity.io/manage](https://www.sanity.io/manage):

1. Under API > Tokens, create a token with Editor access and put it in `SANITY_WRITE_TOKEN`.
2. Under API > CORS origins, add `http://localhost:3333`.

## 3. Import the products

1. Paste the Excel rows, header included, over `studio/seed/products.tsv`.
2. Paste the category bulk rows over `studio/seed/categoryBulk.tsv`.
3. Put photos in `studio/seed/img/`, named as in the "Photo File Name" column.
4. Check the section rules and bestsellers at the top of `studio/scripts/import.mjs`.

```bash
npm run import
```

It is safe to run again, because it only adds what is missing. `npm run import:replace` overwrites existing documents with the sheet, including any edits made in the Studio.

## 4. Use the Studio

```bash
npm run dev        # http://localhost:3333
npm run deploy     # publishes it at <name>.sanity.studio for the owner
```

Set the real WhatsApp number under Site settings. Invite the owner at sanity.io/manage > Members.

## 5. Connect the site to Sanity

```bash
cd ..
cp .env.local .env.local
```

Add the project ID to `.env.local`, then run `npm run dev`. Restart it to see new content.

## 6. Deploy on Cloudflare Pages

Connect the Git repo to Cloudflare Pages with:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `out` |
| `NODE_VERSION` | `22` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | your project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SITE_URL` | the live address |

So that publishing updates the site:

1. In Cloudflare Pages, under Settings > Builds > Deploy hooks, create a hook and copy its URL.
2. At sanity.io/manage > API > Webhooks, create a document webhook with that URL, method POST, on create, update and delete, filtered to `!(_id in path("drafts.**"))`.

After you publish in the Studio, the site rebuilds and updates in a minute or two.

## Project layout

```
app/                     routes and page metadata
components/              shared parts
components/views/        one view per page
context/                 catalogue, bag, wishlist, compare
lib/data.js              the Sanity query and data clean-up
lib/catalog.js           pricing and product lists
lib/whatsappMessages.js  WhatsApp message wording
data/sample-dataset.json sample content
studio/schemaTypes/      the CMS fields
studio/scripts/import.mjs  Excel import
```

Run `npm run sample` in `studio/` to rebuild the sample data from the seed sheets.
