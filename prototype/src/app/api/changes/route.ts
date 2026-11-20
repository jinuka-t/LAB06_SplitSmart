import { save } from "../../actions";

export async function POST(request: Request) {
  // The custom header requires a CORS preflight for cross-origin browser writes.
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("x-splitsmart-request") !== "1" || (site && site !== "same-origin")) {
    return Response.json({ error: "Open SplitSmart directly and try the change again." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "The form could not be read. Please submit it again." }, { status: 400 });
  }

  return Response.json(await save(form));
}
