import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { polarClient } from "@/lib/polar";
import {
createTRPCRouter,
protectedProcedure,
} from "@/trpc/init";
import { eq, count } from "drizzle-orm";


export const premiumRouter = createTRPCRouter({
    getCurrentSuscription: protectedProcedure.query(async ({ctx}) => {
        const customer = await polarClient.customers.getStateExternal({
            externalId: ctx.auth.user.id,
        });

        const suscription = customer.activeSubscriptions[0];

        if(!suscription) {
            return null;
        }

        const product = await polarClient.products.get({
            id: suscription.productId,
        });

        return product;
    }),
    getProducts: protectedProcedure.query(async () => {
        const products = await polarClient.products.list({
            isArchived: false,
            isRecurring: true,
            sorting: ["price_amount"],
        });

        return products.result.items;
    }),
    getFreeUsage: protectedProcedure.query(async ({ctx}) =>{
        const customer = await polarClient.customers.getStateExternal({
            externalId: ctx.auth.user.id,
        });

        const subscription = customer.activeSubscriptions[0];

        if(subscription) {
            return null;
        }

        const [userMeetings] = await db 
        .select({
            count: count(meetings.id),
        })
        .from(meetings)
        .where(eq(meetings.userId,  ctx.auth.user.id));

        const [userAgents] = await db 
        .select({
            count: count(agents.id),
        })
        .from(agents)
        .where(eq(agents.userId,  ctx.auth.user.id));

        return {
            meetingCount: userMeetings.count,
            agentCount: userAgents.count,
        };
    })
});