import {z} from 'zod';

export const agentsInsertSchema = z.object({
    name: z.string().min(1, {message: "name is required"}),
    instructions: z.string().min(1, {message: "instructions are required"}),
});

export const agentUpdateSchema = agentsInsertSchema.extend({
    id: z.string().min(1, {message: "Id is required"}),
});
