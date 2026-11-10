import { defineArrayMember, defineField, defineType } from "sanity";
import { bulkTiersField } from "./bulkTiers";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Product name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Link name", description: "Press Generate. Avoid changing it after launch, because shared links use it.", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "photo", title: "Photo", description: "A square photo works best.", type: "image" }),
    defineField({ name: "category", title: "Site section", type: "reference", to: [{ type: "category" }], validation: (r) => r.required() }),
    defineField({ name: "brand", title: "Brand", type: "reference", to: [{ type: "brand" }] }),
    defineField({ name: "productType", title: "Product type", description: "For example Perfume, or Roll-on / Dip stick (oil). Bulk price rules match this exact text.", type: "string" }),
    defineField({ name: "typeLabel", title: "Label", description: "Shown under the name, for example Eau de parfum. Only fill this in if it is accurate.", type: "string" }),
    defineField({
      name: "audience",
      title: "For",
      type: "string",
      options: { list: ["Men", "Women", "Unisex"], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "illustration", title: "Placeholder drawing", description: "Optional. Overrides the drawing set on the site section.", type: "string", options: { list: [{ title: "Perfume bottle", value: "perfume" }, { title: "Oil bottle", value: "attar" }, { title: "Burner", value: "burner" }, { title: "Bowl", value: "chips" }, { title: "Jar", value: "jar" }, { title: "Ball", value: "ball" }] } }),
    defineField({ name: "optionLabel", title: "Option heading", description: "For example Size or Colour. Leave empty for Size.", type: "string" }),
    defineField({ name: "scentNotes", title: "Scent notes", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "sizes",
      title: "Sizes or colours",
      description: "Each option has its own price and stock.",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "sizeOption",
          fields: [
            defineField({ name: "label", title: "Size or colour", description: "For example 30ml, Gold, or One size.", type: "string", validation: (r) => r.required() }),
            defineField({ name: "price", title: "Price (P)", type: "number", validation: (r) => r.required().min(0) }),
            defineField({ name: "inStock", title: "In stock", type: "boolean", initialValue: true }),
            bulkTiersField("Leave empty to use the matching bulk price rule, if there is one."),
          ],
          preview: {
            select: { label: "label", price: "price", inStock: "inStock" },
            prepare: ({ label, price, inStock }) => ({ title: `${label}: P${price}`, subtitle: inStock === false ? "Out of stock" : "In stock" }),
          },
        }),
      ],
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      options: { list: [{ title: "Bestseller", value: "bestseller" }, { title: "New", value: "new" }], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "sortOrder", title: "Position", description: "Lower numbers show first under Featured. Leave empty to show last.", type: "number" }),
  ],
  orderings: [{ title: "Position", name: "position", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "name", section: "category.title", media: "photo" },
    prepare: ({ title, section, media }) => ({ title, subtitle: section, media }),
  },
});