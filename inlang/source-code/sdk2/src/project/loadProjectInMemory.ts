import { openLixInMemory } from "@lix-js/sdk"
import { createInMemoryDatabase, importDatabase } from "sqlite-wasm-kysely"
import { loadProject } from "./loadProject.js"

/**
 * Load a project from a blob in memory.
 */
export async function loadProjectInMemory(args: { blob: Blob }) {
	const lix = await openLixInMemory({ blob: args.blob })

	const dbFile = await lix.db
		.selectFrom("file")
		.select("data")
		.where("path", "=", "/db.sqlite")
		.executeTakeFirstOrThrow()

	const sqlite = await createInMemoryDatabase({})
	importDatabase({ db: sqlite, content: new Uint8Array(dbFile.data) })

	return await loadProject({ sqlite, lix })
}
