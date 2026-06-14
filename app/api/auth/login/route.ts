import { NextResponse } from "next/server";

import AUTH_API from "@/constants/api/auth";
import { getApiBaseUrl } from "@/lib/api-url";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-token";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data?: T;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function POST(request: Request) {
  const body = await request.json();
  const backendLoginUrl = `${getApiBaseUrl()}${AUTH_API.LOGIN}`;
  let backendResponse: Response;

  try {
    backendResponse = await fetch(backendLoginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      {
        message: `Cannot connect to backend login API: ${backendLoginUrl}`,
      },
      { status: 503 }
    );
  }

  const responseData = (await backendResponse.json().catch(() => ({
    message: "Backend returned an invalid JSON response.",
  }))) as ApiResponse<AuthResponse>;

  if (!backendResponse.ok) {
    return NextResponse.json(responseData, { status: backendResponse.status });
  }

  if (!responseData.data?.access_token || !responseData.data.refresh_token) {
    return NextResponse.json(
      { message: "Login success, but tokens were not returned." },
      { status: 502 }
    );
  }

  const response = NextResponse.json({
    code: 200,
    message: responseData.message,
    status: responseData.status,
  });

  response.cookies.set({
    ...cookieOptions,
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: responseData.data.access_token,
    maxAge: responseData.data.expires_in,
  });
  response.cookies.set({
    ...cookieOptions,
    name: REFRESH_TOKEN_COOKIE_NAME,
    value: responseData.data.refresh_token,
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
