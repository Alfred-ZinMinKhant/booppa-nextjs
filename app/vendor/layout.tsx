import type { ReactNode } from "react";
import VendorPageNav from "@/components/vendor/VendorPageNav";

export default function VendorLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<VendorPageNav />
			{children}
		</>
	);
}
