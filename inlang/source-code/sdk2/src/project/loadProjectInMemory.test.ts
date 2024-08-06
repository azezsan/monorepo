import { expect, test } from "vitest";
import { newProject } from "./newProject.js";
import { loadProjectInMemory } from "./loadProjectInMemory.js";
import { generateBundleId } from "../bundle-id/bundle-id.js";

test("roundtrip should succeed", async () => {
	const file1 = await newProject();
	const project1 = await loadProjectInMemory({ blob: file1 });
	const numBundles1 = (
		await project1.db.selectFrom("bundle").select("id").execute()
	).length;
	expect(numBundles1).toBe(0);

	// modify project
	const insertedBundle = await project1.db
		.insertInto("bundle")
		.values({
			id: generateBundleId(),
			// @ts-expect-error - manual stringification
			alias: JSON.stringify({ default: "bundle1" }),
		})
		.returning("id")
		.executeTakeFirstOrThrow();

	const file1AfterUpdates = await project1.toBlob();
	await project1.close();

	const project2 = await loadProjectInMemory({ blob: file1AfterUpdates });
	const bundles = await project2.db.selectFrom("bundle").select("id").execute();
	expect(bundles.length).toBe(1);
	expect(bundles[0]?.id).toBe(insertedBundle.id);
});