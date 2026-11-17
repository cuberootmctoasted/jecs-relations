import { REntity } from "./rEntity";
import { RRelation } from "./rRelation";

export function sample() {
	const House = new REntity<{ size: Vector3; location: string }>();
	const Resident = new REntity<{ name: string; height: number }>(House);

	const Ownership = new RRelation(
		new Map<string, REntity>([
			["Owner", Resident],
			["House", House],
		]),
	);

	const bigHouse = House.spawn({ size: new Vector3(10, 10, 10), location: "something avenue" });
	const bob = Resident.spawn({ name: "Bob", height: 179 }, bigHouse);
	const alice = Resident.spawn({ name: "Alice", height: 165 }, bigHouse);

	const bobOwnership = Ownership.spawn(
		new Map([
			["Owner", bob],
			["House", bigHouse],
		]),
	);
}
