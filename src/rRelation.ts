import { Entity, Id, pair } from "@rbxts/jecs";
import { w } from "./w";
import { REntity } from "./rEntity";

type Relation = Map<string, Entity>;

export class RRelation {
	public static rRelations: RRelation[] = [];

	private static isRelation: Entity = w.component();

	private tag: Entity;
	private fieldTags: Map<string, Entity> = new Map();
	private fieldREntities: Map<string, REntity> = new Map();

	constructor(fieldREntities: Map<string, REntity>) {
		this.tag = w.component();
		this.fieldREntities = fieldREntities;
		fieldREntities.forEach((_, field) => {
			this.fieldTags.set(field, w.component());
		});
		RRelation.rRelations.push(this);
	}

	public contains(relationId: Entity): boolean {
		return w.has(relationId, this.tag);
	}

	public spawn(relation: Relation): Entity {
		relation.forEach((target, field) => {
			assert(this.fieldTags.has(field));
			assert(!w.has(target, RRelation.isRelation));
			assert(this.fieldREntities.get(field)!.contains(target));
		});
		this.fieldTags.forEach((_, field) => {
			assert(relation.has(field));
		});
		const relationId = w.entity();
		w.add(relationId, RRelation.isRelation);
		w.add(relationId, this.tag);
		relation.forEach((target, field) => {
			const fieldTag = this.fieldTags.get(field)!;
			w.add(relationId, pair(fieldTag, target));
		});
		return relationId;
	}

	public despawn(relationId: Entity): void {
		assert(this.contains(relationId));
		w.delete(relationId);
	}

	public get(relationId: Entity): Relation {
		assert(this.contains(relationId));
		const relation: Relation = new Map();
		this.fieldTags.forEach((fieldTag) => {
			assert(w.target(relationId, fieldTag, 0) !== undefined);
			assert(w.target(relationId, fieldTag, 1) === undefined);
		});
		this.fieldTags.forEach((fieldTag, field) => {
			relation.set(field, w.target(relationId, fieldTag)!);
		});
		return relation;
	}

	public query(partialRelation: Relation): Entity[] {
		partialRelation.forEach((_, field) => {
			assert(this.fieldTags.has(field));
		});
		const jecsQuery: Id[] = [];
		partialRelation.forEach((target, field) => {
			const fieldTag = this.fieldTags.get(field)!;
			jecsQuery.push(pair(fieldTag, target));
		});
		const relationIds: Entity[] = [];
		for (const [relationId] of w.query(...jecsQuery)) {
			relationIds.push(relationId);
		}
		return relationIds;
	}

	public queryMentionsOf(entityId: Entity): Entity[] {
		const relationIds: Entity[] = [];
		this.fieldTags.forEach((fieldTag) => {
			for (const [relationId] of w.query(pair(fieldTag, entityId))) {
				relationIds.push(relationId);
			}
		});
		return relationIds;
	}
}
