import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getUserById, updateUser } from "../db";
import { ENV } from "../_core/env";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
} from "@simplewebauthn/server";

// In-memory store for challenges (should really be in Redis or DB with expiry)
const challenges = new Map<number, string>();

export const passkeysRouter = router({
  generateRegistrationOptions: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const existingCredentials = user.passkeyCredentials
      ? JSON.parse(user.passkeyCredentials)
      : [];

    const options = await generateRegistrationOptions({
      rpName: "BISHOUY",
      rpID: new URL(ENV.appUrl).hostname,
      userID: Buffer.from(String(user.id)),
      userName: user.email || user.username || "user",
      attestationType: "none",
      excludeCredentials: existingCredentials.map((cred: any) => ({
        id: cred.credentialID,
        type: "public-key",
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    challenges.set(user.id, options.challenge);
    return options;
  }),

  verifyRegistration: protectedProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const expectedChallenge = challenges.get(user.id);
      if (!expectedChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No registration challenge found. Please try again.",
        });
      }

      try {
        const verification = await verifyRegistrationResponse({
          response: input,
          expectedChallenge,
          expectedOrigin: ENV.appUrl,
          expectedRPID: new URL(ENV.appUrl).hostname,
        });

        if (verification.verified && verification.registrationInfo) {
          const { credential } = verification.registrationInfo;
          const { id, publicKey, counter } = credential;

          const existingCredentials = user.passkeyCredentials
            ? JSON.parse(user.passkeyCredentials)
            : [];

          const newCredential = {
            credentialID: Buffer.from(id).toString("base64url"),
            credentialPublicKey: Buffer.from(publicKey).toString("base64url"),
            counter,
            transports: input.response.transports,
          };

          await updateUser(user.id, {
            passkeyCredentials: JSON.stringify([...existingCredentials, newCredential]),
          });

          challenges.delete(user.id);
          return { verified: true };
        }

        return { verified: false };
      } catch (error: any) {
        console.error("Passkey verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  removePasskey: protectedProcedure
    .input(z.object({ credentialID: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const credentials = user.passkeyCredentials
        ? JSON.parse(user.passkeyCredentials)
        : [];

      const filtered = credentials.filter(
        (c: any) => c.credentialID !== input.credentialID
      );

      await updateUser(user.id, {
        passkeyCredentials: JSON.stringify(filtered),
      });

      return { success: true };
    }),
});
