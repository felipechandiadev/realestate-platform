"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Middleware handles "/" → "/portal/" redirect
    // This is a fallback in case middleware doesn't trigger
    router.push("/portal/");
  }, [router]);

  // No need to render anything, just redirect
  return null;
}
