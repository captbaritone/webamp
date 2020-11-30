import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URL,
  DISCORD_WEBAMP_SERVER_ID,
} from "../config";
import fetch from "node-fetch";

type AuthResponse = {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  localse: string;
  mfa_enabled: boolean;
  premium_type: number;
};

// Given a code from Discord auth, check that it's valid
export async function auth(code: string): Promise<string> {
  const data = {
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: DISCORD_REDIRECT_URL,
    code,
    scope: "identity",
  };

  const fetchResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(data),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!fetchResponse.ok) {
    throw new Error("Error getting auth token from Discord");
  }
  const info = await fetchResponse.json();

  const authResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${info.token_type} ${info.access_token}`,
    },
  });
  if (!authResponse.ok) {
    throw new Error("Error getting auth data from Discord");
  }

  const authBody = (await authResponse.json()) as AuthResponse;

  const guildsResponse = await fetch(
    "https://discord.com/api/users/@me/guilds",
    {
      headers: {
        authorization: `${info.token_type} ${info.access_token}`,
      },
    }
  );
  if (!guildsResponse.ok) {
    throw new Error("Error getting guild data from Discord");
  }

  const guildsBody = (await guildsResponse.json()) as any[];
  const hasMemership = guildsBody.some(
    (guild) => guild.id === DISCORD_WEBAMP_SERVER_ID
  );

  if (!hasMemership) {
    throw new Error("User is not a member of the Webamp server.");
  }

  return authBody.username;
}
