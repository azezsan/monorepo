import type { Metadata } from "next"
import ParaglideNextAdapter from "@/ParaglideNextAdapter"
import { languageTag } from "@inlang/paraglide-js/nextjs-example"

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ParaglideNextAdapter>
			<html lang={languageTag()}>
				<body>{children}</body>
			</html>
		</ParaglideNextAdapter>
	)
}
