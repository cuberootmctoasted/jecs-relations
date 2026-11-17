import { Entity, pair } from "@rbxts/jecs";
import { w } from "./w";
import { RRelation } from "./rRelation";

export class REntity<T = unknown> {
	public static rEntities: REntity[] = [];

	private static isEntity: Entity = w.component();

	private static strongOf: Entity = w.component();
	private static weakOf: Entity = w.component();

	private tag: Entity;
	private component: Entity<T>;
	private strongREntities: REntity[];

	constructor(...strongREntities: REntity[]) {
		this.tag = w.component();
		this.component = w.component<T>();
		this.strongREntities = strongREntities;
		REntity.rEntities.push(this);
	}

	public spawn(state: T, ...strongs: Entity[]): void {
		assert(this.strongREntities.size() === strongs.size());
		strongs.forEach((owner) => {
			assert(w.has(owner, REntity.isEntity));
		});
		const id = w.entity();
		w.add(id, REntity.isEntity);
		w.add(id, this.tag);
		strongs.forEach((strong) => {
			w.add(id, pair(REntity.weakOf, strong));
			w.add(strong, pair(REntity.strongOf, id));
		});
		w.set(id, this.component, state);
	}

	public despawn(id: Entity): void {
		assert(w.has(id, this.tag));
		RRelation.rRelations.forEach((rRelation) => {
			rRelation.queryMentionsOf(id).forEach((id) => {
				rRelation.despawn(id);
			});
		});
		REntity.rEntities.forEach((rEntity) => {
			rEntity.queryWeakOf(id).forEach((weak) => {
				rEntity.despawn(weak);
			});
		});
		w.delete(id);
	}

	public get(id: Entity): T {
		assert(w.has(id, this.tag));
		return w.get(id, this.tag) as T;
	}

	public set(id: Entity, newState: T) {
		assert(w.has(id, this.tag));
		w.set(id, this.tag, newState);
	}

	public query(): Entity[] {
		const ids: Entity[] = [];
		for (const [id] of w.query(this.tag)) {
			ids.push(id);
		}
		return ids;
	}

	public queryStrongOf(weak: Entity): Entity[] {
		const ids: Entity[] = [];
		for (const [id] of w.query(pair(REntity.strongOf, weak))) {
			ids.push(id);
		}
		return ids;
	}

	public queryWeakOf(strong: Entity): Entity[] {
		const ids: Entity[] = [];
		for (const [id] of w.query(pair(REntity.weakOf, strong))) {
			ids.push(id);
		}
		return ids;
	}
}
