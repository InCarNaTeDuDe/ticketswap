import { AppDataSource } from "../config/database.js";
import { EntityTarget, ObjectLiteral, Repository } from "typeorm";

export class BaseRepository<T extends ObjectLiteral> {
  private entityClass: EntityTarget<T>;
  private memoryStore: T[];
  private idKey: keyof T;

  constructor(entityClass: EntityTarget<T>, initialData: T[] = [], idKey: keyof T = "id" as keyof T) {
    this.entityClass = entityClass;
    this.memoryStore = [...initialData];
    this.idKey = idKey;
  }

  private get r(): Repository<T> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }
    return AppDataSource.getRepository(this.entityClass);
  }

  private get isDbReady(): boolean {
    return AppDataSource.isInitialized;
  }

  async find(options?: any): Promise<T[]> {
    if (this.isDbReady) {
      return await this.r.find(options);
    }
    return [...this.memoryStore];
  }

  async findOneBy(where: Partial<Record<keyof T, any>>): Promise<T | null> {
    if (this.isDbReady) {
      return await this.r.findOneBy(where as any);
    }
    return this.memoryStore.find(item => {
      return Object.entries(where).every(([key, val]) => item[key as keyof T] === val);
    }) || null;
  }

  async save(entity: T): Promise<T> {
    if (this.isDbReady) {
      return await this.r.save(entity);
    }
    const idValue = entity[this.idKey];
    const index = this.memoryStore.findIndex(item => item[this.idKey] === idValue);
    if (index >= 0) {
      this.memoryStore[index] = entity;
    } else {
      this.memoryStore.push(entity);
    }
    return entity;
  }

  async delete(idValue: any): Promise<boolean> {
    if (this.isDbReady) {
      const result = await this.r.delete(idValue);
      return (result.affected ?? 0) > 0;
    }
    const initialLen = this.memoryStore.length;
    this.memoryStore = this.memoryStore.filter(item => item[this.idKey] !== idValue);
    return this.memoryStore.length < initialLen;
  }

  // Clear memory cache, primarily for dev resets
  clearMemory() {
    this.memoryStore = [];
  }
}
