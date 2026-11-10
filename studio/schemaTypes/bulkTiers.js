import { defineArrayMember, defineField } from "sanity";

export const bulkTiersField = (description) =>
  defineField({
    name: "bulkTiers",
    title: "Bulk prices",
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        name: "tier",
        fields: [
          defineField({ name: "minQty", title: "From quantity", type: "number", validation: (r) => r.required().integer().min(2) }),
          defineField({ name: "price", title: "Price each (P)", type: "number", validation: (r) => r.required().min(0) }),
        ],
        preview: {
          select: { minQty: "minQty", price: "price" },
          prepare: ({ minQty, price }) => ({ title: `${minQty}+ at P${price} each` }),
        },
      }),
    ],
  });
