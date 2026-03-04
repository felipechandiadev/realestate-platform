"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DotProgress from "@/shared/components/ui/DotProgress/DotProgress";

const REDIRECT_DELAY_MS = 3000;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/portal");
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-primary">
        Real Estate Platform
      </h1>
      <DotProgress className="justify-center" />
    </main>
  );
}
