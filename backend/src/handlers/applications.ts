import type { Request, Response } from "express";
import crypto from "crypto";
import { createApplication, listApplications, ApplicationStatus } from "../store/memoryStore";

const DEMO_USER_ID = "demo-user-123"; // later: Cognito JWT "sub"

function isStatus(x: unknown): x is ApplicationStatus {
  return typeof x === "string" && [
    "APPLIED","RECRUITER_SCREEN","HM_SCREEN","ONSITE","OFFER","REJECTED","WITHDRAWN"
  ].includes(x);
}

export function listHandler(_req: Request, res: Response) {
  res.json(listApplications(DEMO_USER_ID));
}

export function createHandler(req: Request, res: Response) {
  const { company, role, appliedDate, status } = req.body ?? {};
  if (typeof company !== "string" || typeof role !== "string" || typeof appliedDate !== "string" || !isStatus(status)) {
    return res.status(400).json({ error: "Invalid body. Expect { company, role, appliedDate, status }" });
  }

  const id = crypto.randomUUID();
  const created = createApplication(DEMO_USER_ID, { id, company, role, appliedDate, status });
  res.status(201).json(created);
}