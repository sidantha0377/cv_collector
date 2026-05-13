import { tagRepository } from "@/lib/repositories/tagRepository";
import type { TagsEntity } from "@/lib/types/azure-tables";

type TagListItem = {
  rowKey: string;
  tag: string;
};

// Business logic for tags.
export const tagService = {
  async getTags(tenantId: string): Promise<TagsEntity[]> {
    return await tagRepository.listByTenant(tenantId);
  },

  async getAlltage() {
    const tags = await tagRepository.listAll();
    return tags.map((t) => ({
      rowKey: t.rowKey,
      tag: t.tag,
    }));
  },

  // Creates tag if missing, otherwise increments count
  async createTag(tenantId: string, rawTag: string): Promise<TagsEntity> {
    const tag = rawTag.trim().toLowerCase();
    if (!tag) throw new Error("Tag is required");

    const existing = await tagRepository.get(tenantId, tag);

    if (!existing) {
      await tagRepository.create(tenantId, tag);
      return {
        partitionKey: tenantId,
        rowKey: tag,
        tag,
        count: 1,
      };
    }

    const nextCount = (existing.count ?? 0) + 1;
    await tagRepository.updateCount(tenantId, tag, nextCount);

    return { ...existing, count: nextCount };
  },

  // Decrements count; deletes row when count reaches 0
  async deleteTag(tenantId: string, rawTag: string): Promise<void> {
    const tag = rawTag.trim().toLowerCase();
    if (!tag) throw new Error("Tag is required");

    const existing = await tagRepository.get(tenantId, tag);
    if (!existing) return;

    const nextCount = (existing.count ?? 0) - 1;
    if (nextCount <= 0) {
      await tagRepository.delete(tenantId, tag);
      return;
    }

    await tagRepository.updateCount(tenantId, tag, nextCount);
  },
};
