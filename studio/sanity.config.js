import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const SINGLETON_ID = "siteSettings";

export default defineConfig({
  name: "default",
  title: "EVER-GO Fragrance",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("EVER-GO")
          .items([
            S.documentTypeListItem("product").title("Products"),
            S.documentTypeListItem("brand").title("Brands"),
            S.documentTypeListItem("category").title("Site sections"),
            S.documentTypeListItem("bulkRule").title("Bulk price rules"),
            S.divider(),
            S.listItem()
              .title("Site settings")
              .id(SINGLETON_ID)
              .child(S.document().schemaType(SINGLETON_ID).documentId(SINGLETON_ID).title("Site settings")),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((t) => t.schemaType !== SINGLETON_ID),
  },
  document: {
    actions: (actions, { schemaType }) =>
      schemaType === SINGLETON_ID ? actions.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action)) : actions,
  },
});
