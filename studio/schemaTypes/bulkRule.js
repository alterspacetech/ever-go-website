import { defineField, defineType } from "sanity";
import { bulkTiersField } from "./bulkTiers";

export const bulkRule = defineType({
  name: "bulkRule",
  title: "Bulk price rule",
  type: "document",
  description: "Applies to every product of this type and size that has no bulk prices of its own.",
  fields: [
    defineField({ name: "productType", title: "Product type", description: "Must match the Product type on the products exactly.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "size", title: "Size", type: "string", validation: (r) => r.required() }),
    bulkTiersField("Quantity needed and the price each."),
  ],
  preview: {
    select: { title: "productType", subtitle: "size" },
  },
});
