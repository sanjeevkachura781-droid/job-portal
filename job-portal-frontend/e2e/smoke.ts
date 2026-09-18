import { chromium, type Page } from "playwright";

const baseUrl = process.env.QA_FRONTEND_URL || "http://localhost:5173";
const stamp = Date.now();

const fillRegistration = async (page: Page, role: "candidate" | "recruiter", email: string) => {
  await page.goto(`${baseUrl}/register`);
  await page.getByLabel("Full name").fill(`QA ${role}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("QaPassword!123");
  await page.getByLabel("I am joining as").selectOption(role);
  await page.getByRole("button", { name: "Create account" }).click();
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("401")) consoleErrors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 500) networkErrors.push(`${response.status()} ${response.url()}`); });

  await page.goto(`${baseUrl}/jobs`);
  await page.getByRole("heading", { name: /Find work that moves/i }).waitFor();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill(`qa-invalid-${stamp}@test.com`);
  await page.getByLabel("Password").fill("WrongPassword!123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByText("Invalid email or password").waitFor();

  const candidateEmail = `qa-candidate-${stamp}@test.com`;
  await fillRegistration(page, "candidate", candidateEmail);
  await page.getByRole("heading", { name: /Your job search/i }).waitFor();
  const tokenBeforeJobs = await page.evaluate(() => localStorage.getItem("job_portal_token"));
  await page.getByRole("link", { name: "Find Jobs" }).click();
  await page.getByRole("heading", { name: /Find work that moves/i }).waitFor();
  if (!page.url().endsWith("/jobs")) throw new Error("Find Jobs did not navigate to /jobs");
  if (!await page.getByRole("link", { name: "Dashboard" }).isVisible()) throw new Error("Authenticated header disappeared on public jobs page");
  const tokenAfterJobs = await page.evaluate(() => localStorage.getItem("job_portal_token"));
  if (!tokenBeforeJobs || tokenBeforeJobs !== tokenAfterJobs) throw new Error("Find Jobs cleared the auth token");
  await page.goto(`${baseUrl}/jobs/4`);
  await page.getByRole("heading", { name: /Full Stack Developer Intern/i }).waitFor();
  if (!await page.getByRole("link", { name: "Dashboard" }).isVisible()) throw new Error("Authenticated header disappeared on job details");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("heading", { name: /Your job search/i }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: /Your job search/i }).waitFor();
  await page.getByRole("button", { name: /Sign out/i }).click();
  await page.getByRole("heading", { name: "Sign in" }).waitFor();

  const recruiterEmail = `qa-recruiter-${stamp}@test.com`;
  await fillRegistration(page, "recruiter", recruiterEmail);
  await page.getByRole("heading", { name: /Build the team/i }).waitFor();
  await page.goto(`${baseUrl}/recruiter/company`);
  await page.getByRole("heading", { name: /Your company presence/i }).waitFor();
  await page.goto(`${baseUrl}/recruiter/jobs/new`);
  await page.getByRole("heading", { name: /Create a role/i }).waitFor();
  const companyRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/api/companies")) companyRequests.push(request.url()); });
  await page.reload();
  await page.getByRole("heading", { name: /Create a role/i }).waitFor();
  if (!companyRequests.some((url) => url.endsWith("/api/companies/mine"))) throw new Error("Recruiter job form did not request /api/companies/mine");
  await page.getByRole("button", { name: /Sign out/i }).click();
  await page.getByRole("heading", { name: "Sign in" }).waitFor();

  if (consoleErrors.length || networkErrors.length) throw new Error(`Browser errors: ${JSON.stringify({ consoleErrors, networkErrors })}`);
  console.log(JSON.stringify({ passed: true, candidateEmail, recruiterEmail, consoleErrors, networkErrors }));
  await browser.close();
};

main().catch((error) => { console.error(error); process.exitCode = 1; });
