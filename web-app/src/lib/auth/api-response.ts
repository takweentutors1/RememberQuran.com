import { NextResponse } from "next/server"

export function privateJson(
  body: Record<string, unknown>,
  status = 200,
  extraHeaders?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  })
}
