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
  // `query` starts at the current symbol so the picker resolves its full name.
  const [query, setQuery] = useState(value);
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

  const selected = options.find((c) => c.symbol === value) ?? { symbol: value, name: value };

  return (
    <Combobox<Coin>
      items={options}
      value={selected}
      filter={null}
      itemToStringLabel={(coin) => `${coin.name} (${coin.symbol})`}
      itemToStringValue={(coin) => coin.symbol}
      isItemEqualToValue={(a, b) => a.symbol === b.symbol}
      onValueChange={(coin) => {
        if (coin) onChange(coin.symbol);
      }}
      onInputValueChange={setQuery}
    >
      <ComboboxInput
        id={id}
        placeholder="Rechercher une crypto…"
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
        <ComboboxEmpty>
          {loading ? "Recherche…" : "Aucune crypto trouvée."}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
