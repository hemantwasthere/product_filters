import { z } from "zod";

export const AVAILABLE_SIZES = ["S", "M", "L"] as const;
export const AVAILABLE_COLORS = [
  "white",
  "beige",
  "green",
  "purple",
  "blue",
] as const;
export const AVAILABLE_SORTS = ["none", "price-asc", "price-desc"] as const;

export const ProductFilterValidtor = z.object({
  color: z.array(z.enum(AVAILABLE_COLORS)),
  size: z.array(z.enum(AVAILABLE_SIZES)),
  sort: z.enum(AVAILABLE_SORTS),
  price: z.tuple([z.number(), z.number()]),
});

export type ProductState = Omit<
  z.infer<typeof ProductFilterValidtor>,
  "price"
> & {
  price: {
    isCustom: boolean;
    range: [number, number];
  };
};
