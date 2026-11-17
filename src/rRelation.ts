import { Entity, Id, pair } from "@rbxts/jecs";
import { w } from "./w";

type Relation = Map<string, Entity>;

export class RRelation {
	public static rRelations: RRelation[] = [];

	private static isRelation: Entity = w.component();

	private tag: Entity;
	private fieldTags: Map<string, Entity> = new Map();

	constructor(...fields: string[]) {
		this.tag = w.component();
		fields.forEach((field) => {
			this.fieldTags.set(field, w.component());
		});
		RRelation.rRelations.push(this);
	}

	public spawn(relation: Relation): void {
		relation.forEach((target, field) => {
			assert(!w.has(target, RRelation.isRelation));
			assert(this.fieldTags.has(field));
		});
		this.fieldTags.forEach((_, field) => {
			assert(relation.has(field));
		});
		const id = w.entity();
		w.add(id, RRelation.isRelation);
		w.add(id, this.tag);
		relation.forEach((target, field) => {
			const fieldTag = this.fieldTags.get(field)!;
			w.add(id, pair(fieldTag, target));
		});
	}

	public despawn(id: Entity): void {
		assert(w.has(id, this.tag));
		w.delete(id);
	}

	public get(id: Entity): Relation {
		assert(w.has(id, this.tag));
		const relation: Relation = new Map();
		this.fieldTags.forEach((fieldTag) => {
			assert(w.target(id, fieldTag, 0) !== undefined);
			assert(w.target(id, fieldTag, 1) === undefined);
		});
		this.fieldTags.forEach((fieldTag, field) => {
			relation.set(field, w.target(id, fieldTag)!);
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
		const ids: Entity[] = [];
		for (const [id] of w.query(...jecsQuery)) {
			ids.push(id);
		}
		return ids;
	}

	public queryMentionsOf(entity: Entity): Entity[] {
		const ids: Entity[] = [];
		this.fieldTags.forEach((fieldTag) => {
			for (const [id] of w.query(pair(fieldTag, entity))) {
				ids.push(id);
			}
		});
		return ids;
	}
}
