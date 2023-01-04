import { query } from "@inlang/core/query";
import { fs } from "@inlang/git-sdk/fs";
import type { PageHead } from "@src/renderer/types.js";
import { createResource, For, Match, Show, Switch } from "solid-js";
import { Messages } from "./Messages.jsx";
import {
	resources,
	inlangConfig,
	referenceResource,
	repositoryIsCloned,
} from "./state.js";
import { Layout as EditorLayout } from "./Layout.jsx";
import type * as ast from "@inlang/core/ast";
import type { EditorRouteParams } from "./types.js";
import { isCollaborator, onForkRepository } from "./index.telefunc.js";
import { useLocalStorage } from "@src/services/local-storage/LocalStorageProvider.jsx";
let owner: string;
let repository: string;
export const Head: PageHead = (props) => {
	const routeParams = props.pageContext.routeParams as EditorRouteParams;
	owner = routeParams.owner;
	repository = routeParams.repository;
	return {
		title: routeParams.owner + "/" + routeParams.repository,
		description: `Contribute translations to ${routeParams.repository} via inlangs editor.`,
	};
};

export function Page() {
	/** Messages from all resources for an id */
	const messages = (id: ast.Message["id"]["name"]) => {
		const result: Record<string, ast.Message | undefined> = {};
		for (const resource of resources) {
			result[resource.languageTag.language] = query(resource).get({ id });
		}
		return result;
	};
	const inludedMessageIds = () => {
		const _referenceResource = referenceResource();
		if (_referenceResource === undefined) {
			return [];
		}
		return query(_referenceResource).includedMessageIds();
	};
	const [localStorage] = useLocalStorage();
	return (
		<EditorLayout>
			<sl-button
				onClick={async () => {
					if (localStorage.user && repository) {
						const collaborator = await isCollaborator({
							encryptedAccessToken: localStorage.user.encryptedAccessToken,
							owner: owner,
							repository: repository,
							username: localStorage.user.username,
						});
						if (!collaborator) {
							const forking = await onForkRepository({
								encryptedAccessToken: localStorage.user.encryptedAccessToken,
								owner: owner,
								repository: repository,
								username: localStorage.user.username,
							});
							console.log(collaborator, "colla");
							console.log(forking, "forking");
						}
					}
				}}
			>
				Fork
			</sl-button>
			<Switch
				fallback={
					<p class="text-danger">
						Switch fallback. This is likely an error. Please report it with code
						e329jafs.
					</p>
				}
			>
				<Match when={repositoryIsCloned.error || inlangConfig.error}>
					<p class="text-danger">
						{repositoryIsCloned.error ?? inlangConfig.error}
					</p>
				</Match>
				<Match when={repositoryIsCloned.loading || inlangConfig.loading}>
					<p>loading ...</p>
				</Match>
				<Match when={inlangConfig() === undefined}>
					<Directories></Directories>
				</Match>
				<Match when={inlangConfig()}>
					<div class="space-y-2">
						<For each={inludedMessageIds()}>
							{(id) => <Messages messages={messages(id)}></Messages>}
						</For>
					</div>
				</Match>
			</Switch>
		</EditorLayout>
	);
}

function Directories() {
	const [dir] = createResource(
		repositoryIsCloned,
		() => fs.promises.readdir("/") as Promise<string[]>
	);

	return (
		<>
			<p>
				No inlang.config.js has been found in the current directory. Navigate to
				a directory that contains an inlang.config.js file.
				<span class="text-danger italic">not implemented yet</span>
			</p>
			<Show when={dir.loading}>
				<p>loading ...</p>
			</Show>
			<Show when={dir.error}>
				<p class="text-danger">{dir.error}</p>
			</Show>
			<Show when={dir()}>
				<For each={dir()}>{(file) => <p>{file}</p>}</For>
			</Show>
		</>
	);
}
