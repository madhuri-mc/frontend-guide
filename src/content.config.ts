import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['React', 'CSS', 'JavaScript', 'Career', 'Performance', 'Accessibility']),
    tags: z.array(z.string()),
    coreTakeaway: z.string(),
    publishDate: z.date(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    relatedArticles: z.array(z.string()).optional(),
  }),
});

export const collections = { articles };