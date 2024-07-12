import type { LintReport } from "@inlang/sdk/v2"
import {
	createMockBundleLintReport,
	createMockMessageLintReport,
	createMockVariantLintReport,
} from "@inlang/sdk/v2-mocks"

export const mockMessageLintReports: LintReport[] = [
	createMockMessageLintReport({
		ruleId: "messageBundleLintRule.inlang.missingReference",
		messageBundleId: "mock_bundle_human_id",
		messageId: "mock_message_id_en",
		body: "The bundle `mock_bundle_human_id` is missing the reference message for the locale `en`",
	}),
	createMockMessageLintReport({
		ruleId: "messageBundleLintRule.inlang.missingReference",
		messageBundleId: "mock_bundle_human_id",
		messageId: "mock_message_id_en",
		body: "The bundle `mock_bundle_human_id` is missing the reference message for the locale `en`",
		level: "warning",
	}),
]

export const mockVariantLintReports: LintReport[] = [
	createMockVariantLintReport({
		ruleId: "messageBundleLintRule.inlang.missingMessage",
		messageBundleId: "mock_bundle_human_id",
		messageId: "mock_message_id_de",
		variantId: "mock_variant_id_de_one",
		body: "Variant test for `de` to check if can be rendered correctly",
	}),
]

export const mockInstalledLintRules = [
	{
		id: "messageBundleLintRule.inlang.missingMessage",
		displayName: "Missing Message",
		description: "Reports when a message is missing in a message bundle",
		module:
			"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
		level: "error",
	},
	{
		id: "messageBundleLintRule.inlang.missingReference",
		displayName: "Missing Reference",
		description: "Reports when a reference message is missing in a message bundle",
		module:
			"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
		level: "warning",
	},
]