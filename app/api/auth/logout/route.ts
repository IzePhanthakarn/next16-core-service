import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import AUTH_API from "@/constants/api/auth";
import { getApiBaseUrl } from "@/lib/api-url";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-token";

export async function POST() {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${getApiBaseUrl()}${AUTH_API.LOGOUT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);

  return response;
}
