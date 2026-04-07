import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (
      "standalone" in window.navigator &&
      (window.navigator as any).standalone
    ) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert(
        "আপনার ব্রাউজার সরাসরি ইনস্টল সাপোর্ট করছে না।\n\n" +
          "১. ব্রাউজারের ৩-ডট মেনুতে ক্লিক করুন।\n" +
          "২. 'Install App' বা 'Add to Home Screen' এ ক্লিক করুন।",
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Only show button if app is installable
  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center gap-2 px-6 py-6 rounded-2xl text-base animate-pulse"
      size="lg"
    >
      <Download size={22} />
      অ্যাপ হোম স্ক্রিনে যোগ করুন
    </Button>
  );
}
