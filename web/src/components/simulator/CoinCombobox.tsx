"use client";

import { useEffect, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { searchCoins } from "@/lib/api";
import type { Coin } from "@/lib/types";

interface CoinComboboxProps {
  value: string;
  onChange: (symbol: string) => void;
  id?: string;
}

export function CoinCombobox({ value, onChange, id }: CoinComboboxProps) {
  // `query` is the input text. Empty → the backend returns the default coin list.
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(() => {
      setLoading(true);
      searchCoins(query.trim(), controller.signal)
        .then(setOptions)
        .catch(() => {
          if (!controller.signal.aborted) setOptions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query]);

  return (
    <Combobox<Coin>
      items={options}
      inputValue={query}
      onInputValueChange={setQuery}
      filter={null}
      itemToStringLabel={(coin) => coin.name}
      itemToStringValue={(coin) => coin.symbol}
      isItemEqualToValue={(a, b) => a.symbol === b.symbol}
      onValueChange={(coin) => {
        if (coin) {
          onChange(coin.symbol);
          setQuery(coin.name);
        }
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={value ? `${value} — rechercher une crypto…` : "Rechercher une crypto…"}
        showClear
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxList>
          {options.map((coin) => (
            <ComboboxItem key={coin.symbol} value={coin}>
              <span className="font-medium">{coin.name}</span>
              <span className="text-muted-foreground">{coin.symbol}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>{loading ? "Recherche…" : "Aucune crypto trouvée."}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
