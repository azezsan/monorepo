import {
	PathDefinitionTranslations,
	validatePathTranslations,
	resolveRoute,
	bestMatch,
	prettyPrintPathDefinitionIssues,
	UserPathDefinitionTranslations,
	resolveUserPathDefinitions,
} from "@inlang/paraglide-js/internal/adapter-utils"
import type { RoutingStragey } from "./interface"
import { createPrefixDetection } from "../middleware/detection/prefixDetection"
import { DEV } from "../env"
import { rsc } from "rsc-env"
import { availableLanguageTags, sourceLanguageTag } from "$paraglide/runtime.js"

/*
	Canonical Path = Path without locale (how you write the href)
	Localised Path = Path with locale (how the path is visible in the URL bar)
*/

export function PrefixStrategy<T extends string>({
	pathnames: userPathnames,
	exclude,
	prefix,
}: {
	exclude: (path: string) => boolean
	pathnames: UserPathDefinitionTranslations<T>
	prefix: "all" | "except-default" | "never"
}): RoutingStragey<T> {
	const resolvedPathnames = /** @__PURE__ */ resolveUserPathDefinitions(
		userPathnames,
		availableLanguageTags
	)

	// Make sure the given pathnames are valid during dev
	// middleware is not rsc so validating there guarantees this will run once
	if (DEV && !rsc) {
		const issues = validatePathTranslations(resolvedPathnames, availableLanguageTags as T[], {})
		if (issues.length) {
			console.warn(
				"Issues were found with your pathnames. Fix them before deploying:\n\n" +
					prettyPrintPathDefinitionIssues(issues)
			)
		}
	}

	function getCanonicalPath(localisedPath: string, locale: T): string {
		let pathWithoutLocale = localisedPath.startsWith(`/${locale}`)
			? localisedPath.replace(`/${locale}`, "")
			: localisedPath

		pathWithoutLocale ||= "/"

		for (const [canonicalPathDefinition, translationsForPath] of Object.entries(
			resolvedPathnames
		)) {
			if (!(locale in translationsForPath)) continue

			const translatedPathDefinition = translationsForPath[locale]
			if (!translatedPathDefinition) continue

			const match = bestMatch(pathWithoutLocale, [translatedPathDefinition], {})
			if (!match) continue

			return resolveRoute(canonicalPathDefinition, match.params)
		}

		return pathWithoutLocale
	}

	function getTranslatedPath(
		canonicalPath: string,
		lang: T,
		translations: PathDefinitionTranslations<T>
	) {
		const match = bestMatch(canonicalPath, Object.keys(translations), {})
		if (!match) return canonicalPath

		const translationsForPath = translations[match.id as `/${string}`]
		if (!translationsForPath) return canonicalPath

		const translatedPath = translationsForPath[lang]
		if (!translatedPath) return canonicalPath

		return resolveRoute(translatedPath, match.params)
	}

	return {
		getLocalisedUrl(canonicalPath, targetLanguage) {
			if (exclude(canonicalPath))
				return {
					pathname: canonicalPath,
				}

			const translatedPath = getTranslatedPath(canonicalPath, targetLanguage, resolvedPathnames)
			const shouldAddPrefix =
				prefix === "never"
					? false
					: prefix === "except-default"
					? targetLanguage !== sourceLanguageTag
					: true

			const localisedPath = shouldAddPrefix
				? `/${targetLanguage}${translatedPath == "/" ? "" : translatedPath}`
				: translatedPath
			return {
				pathname: localisedPath,
			}
		},
		getCanonicalPath,

		resolveLocale(request) {
			const detect = createPrefixDetection({ availableLanguageTags })
			return detect(request) as T | undefined
		},
	}
}
