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

	public contains(entityId: Entity): boolean {
		return w.has(entityId, this.tag);
	}

	public spawn(state: T, ...strongs: Entity[]): Entity {
		assert(this.strongREntities.size() === strongs.size());
		strongs.forEach((owner) => {
			assert(w.has(owner, REntity.isEntity));
		});
		const entityId = w.entity();
		w.add(entityId, REntity.isEntity);
		w.add(entityId, this.tag);
		strongs.forEach((strong) => {
			w.add(entityId, pair(REntity.weakOf, strong));
			w.add(strong, pair(REntity.strongOf, entityId));
		});
		w.set(entityId, this.component, state);
		return entityId;
	}

	public despawn(entityId: Entity): void {
		assert(w.has(entityId, this.tag));
		RRelation.rRelations.forEach((rRelation) => {
			rRelation.queryMentionsOf(entityId).forEach((id) => {
				rRelation.despawn(id);
			});
		});
		REntity.rEntities.forEach((rEntity) => {
			rEntity.queryWeakOf(entityId).forEach((weak) => {
				rEntity.despawn(weak);
			});
		});
		w.delete(entityId);
	}

	public get(entityId: Entity): T {
		assert(w.has(entityId, this.tag));
		return w.get(entityId, this.tag) as T;
	}

	public set(entityId: Entity, state: T) {
		assert(w.has(entityId, this.tag));
		w.set(entityId, this.tag, state);
	}

	public query(): Entity[] {
		const entityIds: Entity[] = [];
		for (const [entityId] of w.query(this.tag)) {
			entityIds.push(entityId);
		}
		return entityIds;
	}

	public queryStrongOf(weak: Entity): Entity[] {
		const entityIds: Entity[] = [];
		for (const [entityId] of w.query(pair(REntity.strongOf, weak))) {
			entityIds.push(entityId);
		}
		return entityIds;
	}

	public queryWeakOf(strong: Entity): Entity[] {
		const entityIds: Entity[] = [];
		for (const [entityId] of w.query(pair(REntity.weakOf, strong))) {
			entityIds.push(entityId);
		}
		return entityIds;
	}
}
