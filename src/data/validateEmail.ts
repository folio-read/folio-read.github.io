import { invokeFunction } from "../lib/functions";

interface ValidateEmailResult {
  valid: boolean;
  reason?: string;
}

export async function validateEmailDomain(email: string): Promise<ValidateEmailResult> {
  return invokeFunction<ValidateEmailResult>("validate-email", { email });
}
