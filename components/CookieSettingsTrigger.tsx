"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function CookieSettingsTrigger() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		// Only show the trigger if consent has already been given
		const stored = localStorage.getItem("booppa_consent");
		if (stored) {
			setShow(true);
		}

		const handleConsentChange = () => {
			setShow(true);
		};

		window.addEventListener("consent:changed", handleConsentChange);
		return () =>
			window.removeEventListener("consent:changed", handleConsentChange);
	}, []);

	const openSettings = () => {
		// Clear local storage briefly or just dispatch a custom event that CookieBanner listens to
		// For simplicity, we'll tell CookieBanner to show up again
		window.dispatchEvent(new CustomEvent("consent:open-settings"));
	};

	if (!show) return null;

	return (
		<button
			onClick={openSettings}
			className="fixed bottom-6 left-6 z-[9998] p-3 bg-white border border-blue-600/40 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all shadow-lg group"
			aria-label="Cookie Settings"
			title="Manage Cookie Preferences"
		>
			<ShieldCheck className="w-5 h-5" />
			<span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-medium">
				Cookie Settings
			</span>
		</button>
	);
}
