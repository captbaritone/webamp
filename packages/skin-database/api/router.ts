import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  DISCORD_CLIENT_ID,
  DISCORD_REDIRECT_URL,
  LOGIN_REDIRECT_URL,
} from "../config";
import { auth } from "./auth";

const router = Router();

// Purposefully REST
router.get(
  "/auth/",
  asyncHandler(async (req, res) => {
    res.redirect(
      302,
      `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(
        DISCORD_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        DISCORD_REDIRECT_URL
      )}&response_type=code&scope=identify%20guilds`
    );
  })
);
// Purposefully REST
router.get(
  "/auth/discord",
  asyncHandler(async (req, res) => {
    const code = req.query.code as string | undefined;

    if (code == null) {
      res.status(400).send({ message: "Expected to get a code" });
      return;
    }
    const username = await auth(code);
    if (username == null) {
      res.status(400).send({ message: "Invalid code" });
      return;
    }
    req.session.username = username;

    // TODO: What about dev?
    res.redirect(302, LOGIN_REDIRECT_URL);
  })
);

export default router;
