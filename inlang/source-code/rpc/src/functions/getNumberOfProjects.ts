import type { Result } from "@inlang/result"
import { privateEnv } from "@inlang/env-variables"

export async function getNumberOfProjects(): Promise<Result<string, Error>> {
	try {
		// prettier-ignore
		const raw = JSON.stringify({
            "query": {
              "kind": "InsightVizNode",
              "source": {
                "kind": "TrendsQuery",
                "properties": {
                  "type": "AND",
                  "values": [
                    {
                      "type": "AND",
                      "values": [
                        {
                          "key": "numberOfMessages",
                          "type": "event",
                          "value": "10",
                          "operator": "gt"
                        }
                      ]
                    }
                  ]
                },
                "filterTestAccounts": true,
                "dateRange": {
                  "date_to": null,
                  "date_from": "-30d"
                },
                "series": [
                  {
                    "kind": "EventsNode",
                    "event": "SDK loaded project",
                    "name": "SDK loaded project",
                    "custom_name": "All projects (>10 messages)",
                    "math": "unique_group",
                    "math_group_type_index": 1
                  }
                ],
                "interval": "month",
                "trendsFilter": {
                  "showLegend": true,
                  "compare": false,
                  "display": "ActionsLineGraph",
                  "showValuesOnSeries": true
                }
              },
              "full": true
            }
          });

		const response = await fetch(
			`https://eu.posthog.com/api/projects/${privateEnv.PUBLIC_POSTHOG_PROJECT_ID}/query`,
			{
				method: "POST",
				headers: {
					Authorization: "Bearer " + privateEnv.POSTHOG_API_KEY,
					"Content-Type": "application/json",
				},
				body: raw,
				redirect: "follow",
			}
		)
		const json = await response.json()

		return { data: JSON.stringify(json.results[0].data[0]) }
	} catch (error) {
		return { error: error as Error }
	}
}