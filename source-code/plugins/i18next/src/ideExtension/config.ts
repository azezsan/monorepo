import type { PluginSettings } from "../settings.js"
import { parse } from "./messageReferenceMatchers.js"
import type { Plugin } from "@inlang/sdk"

export const ideExtensionConfig = (
	settings: PluginSettings,
): ReturnType<Exclude<Plugin["addAppSpecificApi"], undefined>> => ({
	"app.inlang.ideExtension": {
		messageReferenceMatchers: [
			async (args: { documentText: string }) => {
				return parse(args.documentText, settings)
			},
		],
		extractMessageOptions: [
			{
				callback: (args: { messageId: string }) => `{t("${args.messageId}")}`,
			},
		],
		documentSelectors: [
			{
				language: "javascript",
			},
			{
				language: "typescript",
			},
			{
				language: "svelte",
			},
		],
	},
})
