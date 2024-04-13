"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import debounce from "lodash.debounce";
import { ChevronDown, Filter } from "lucide-react";
import { NextPage } from "next";
import { useCallback, useState } from "react";

import EmptyState from "@/components/Products/EmptyState";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import type { Product as TProduct } from "@/db";
import { cn } from "@/lib/utils";
import { ProductState } from "@/lib/validators/product-validator";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

const COLOR_FILTERS = {
  id: "color",
  name: "Color",
  options: [
    {
      value: "white",
      label: "White",
    },
    {
      value: "beige",
      label: "Beige",
    },
    {
      value: "blue",
      label: "Blue",
    },
    {
      value: "green",
      label: "Green",
    },
    {
      value: "purple",
      label: "Purple",
    },
  ] as const,
};

const SIZE_FILTERS = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
  ] as const,
};

const PRICE_FILTERS = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 100], label: "Any price" },
    { value: [0, 40], label: "Under 40$" },
    { value: [0, 20], label: "Under 20$" },
    // custom option defined in jsx
  ],
} as const;

const SUBCATEGORIES = [
  {
    name: "T-Shirts",
    selected: true,
    href: "#",
  },
  {
    name: "Hoodies",
    selected: false,
    href: "#",
  },
  {
    name: "Sweatshirts",
    selected: false,
    href: "#",
  },
  {
    name: "Accessories",
    selected: false,
    href: "#",
  },
] as const;

const DEFAULT_CUSTOM_PRICE_RANGE = [0, 100] as [number, number];

const Home: NextPage = () => {
  const [filter, setFilter] = useState<ProductState>({
    color: ["white", "beige", "blue", "green", "purple"],
    size: ["S", "M", "L"],
    sort: "none",
    price: {
      isCustom: false,
      range: DEFAULT_CUSTOM_PRICE_RANGE,
    },
  });

  const MIN_PRICE = Math.min(filter.price.range[0], filter.price.range[1]);
  const MAX_PRICE = Math.max(filter.price.range[0], filter.price.range[1]);

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            price: filter.price.range,
            size: filter.size,
          },
        }
      );
      return data;
    },
  });

  const onSubmit = () => refetch();
  const debouncedSubmit = debounce(onSubmit, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _debouncedSubmit = useCallback(debouncedSubmit, []);

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, "sort" | "price">;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value as never);

    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }

    _debouncedSubmit();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High-quality cotton selection
        </h1>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.name}
                  className={cn("text-left w-full block px-4 py-2 text-sm", {
                    "text-gray-900 bg-gray-100": option.value === filter.sort,
                    "text-gray-500": option.value !== filter.sort,
                  })}
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      sort: option.value,
                    }));

                    _debouncedSubmit();
                  }}
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filter  */}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUBCATEGORIES.map((category, i) => (
                <li key={i}>
                  <button
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!category.selected}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" className="animate-none">
              {/* Color Filter  */}
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Color</span>
                </AccordionTrigger>

                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          id={`color-${i}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={() => {
                            applyArrayFilter({
                              category: "color",
                              value: option.value,
                            });
                          }}
                          checked={filter.color.includes(option.value)}
                        />
                        <label
                          htmlFor={`color-${i}`}
                          className="ml-3 text-sm text-gray-600 select-none"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size Filter  */}
              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Size</span>
                </AccordionTrigger>

                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTERS.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          id={`size-${i}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={() => {
                            applyArrayFilter({
                              category: "size",
                              value: option.value,
                            });
                          }}
                          checked={filter.size.includes(option.value)}
                        />
                        <label
                          htmlFor={`size-${i}`}
                          className="ml-3 text-sm text-gray-600 select-none"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Price Filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Price</span>
                </AccordionTrigger>

                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          id={`price-${i}`}
                          type="radio"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                        />
                        <label
                          htmlFor={`price-${i}`}
                          className="ml-3 text-sm text-gray-600 select-none"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}

                    <li className="flex justify-center flex-col gap-2">
                      <div>
                        <input
                          id={`price-${PRICE_FILTERS.options.length}`}
                          type="radio"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                          checked={filter.price.isCustom}
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className="ml-3 text-sm text-gray-600 select-none"
                        >
                          Custom
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <p className="font-medium">price</p>
                        <div>
                          {filter.price.isCustom
                            ? MIN_PRICE.toFixed(0)
                            : filter.price.range[0].toFixed(0)}
                          $ -{" "}
                          {filter.price.isCustom
                            ? MAX_PRICE.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{" "}
                          $
                        </div>
                      </div>
                      <Slider
                        className={cn({
                          "opacity-50": !filter.price.isCustom,
                        })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;

                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));

                          _debouncedSubmit();
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE_RANGE
                        }
                        min={DEFAULT_CUSTOM_PRICE_RANGE[0]}
                        max={DEFAULT_CUSTOM_PRICE_RANGE[1]}
                        defaultValue={DEFAULT_CUSTOM_PRICE_RANGE}
                        step={5}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Product Grid  */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products && products.length === 0 ? (
              <EmptyState />
            ) : products ? (
              products.map((product, i) => (
                <Product key={i} product={product.metadata!} />
              ))
            ) : (
              [...Array(12)].map((_, i) => <ProductSkeleton key={i} />)
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
