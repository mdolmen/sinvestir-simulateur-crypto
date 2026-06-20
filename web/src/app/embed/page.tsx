import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";
import { parseSimParams } from "@/lib/params";

// Bare, embeddable view: just the simulator, driven by URL params, no chrome.
export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const defaults = parseSimParams(await searchParams);
  return (
    <main className="min-h-screen bg-sim-bg p-4 sm:p-6">
      <CryptoSimulator {...defaults} />
    </main>
  );
}
