export class InMemoryRepository<TItem extends { id: string }> {
  private readonly items = new Map<string, TItem>();

  list(): TItem[] {
    return Array.from(this.items.values());
  }

  getById(id: string): TItem | undefined {
    return this.items.get(id);
  }

  upsert(item: TItem): TItem {
    this.items.set(item.id, item);
    return item;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }

  count(): number {
    return this.items.size;
  }
}
