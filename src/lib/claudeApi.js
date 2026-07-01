const KEY_STORAGE = 'jt_claude_key';

const BACKGROUND = `You are evaluating job fit for Russell DeVore, a Senior Product Manager with this background:

CORE EXPERTISE:
- Fraud & Identity: Wells Fargo (financial crimes compliance, BSA/AML, identity proofing/KYC), Vesta (payment fraud prevention, real-time transaction risk decisioning, chargeback reduction)
- AI/ML Products: ML-driven fraud signal systems, model monitoring and governance, risk scoring pipelines; bridging data science teams with business risk outcomes
- Regulatory/Compliance: BSA/AML, identity proofing standards, fraud operations

CAREER CONTEXT:
- KForce: Staffing/contractor background (comfortable with both perm and contract roles)
- Target seniority: Senior IC PM or Lead/Principal PM
- Target domains: fraud detection, identity verification, trust & safety, financial crime, AI/ML platform products

STRENGTHS: Bridging technical ML systems and business risk outcomes; cross-functional leadership with data science and engineering; real-time risk decisioning; regulatory compliance fluency

GENUINE STRETCH AREAS (flag these honestly):
- Pure consumer product roles without a fraud/fintech angle
- Engineering-heavy platform roles without PM ownership layer
- Growth/monetization products without a risk component`;

export function getApiKey() {
  try { return localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
}

export function setApiKey(key) {
  try { localStorage.setItem(KEY_STORAGE, key.trim()); } catch {}
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

export async function evaluateRole(job) {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  const parts = [
    job.role ? `Role: ${job.role}` : null,
    job.company ? `Company: ${job.company}` : null,
    job.salary && job.salary !== 'Not listed' ? `Salary: ${job.salary}` : null,
    job.staffingAgency ? `Staffing Agency: ${job.staffingAgency}` : null,
    job.source ? `Source: ${job.source}` : null,
    job.applicationUrl ? `Job Posting: ${job.applicationUrl}` : null,
    job.jobDescription
      ? `Job Description:\n${job.jobDescription}`
      : 'Note: No job description available — evaluate based on role title and company context only.',
    job.notes ? `Notes: ${job.notes}` : null,
  ].filter(Boolean).join('\n\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `${BACKGROUND}

Evaluate fit and respond with ONLY valid JSON (no markdown, no text outside the JSON):
{"score":"strong"|"good"|"partial"|"weak","summary":"2-3 sentences: what fits Russell's background, any must-have gaps vs nice-to-have gaps, and whether it's worth pursuing. Flag clearly when experience is adjacent vs direct."}

Score guide:
- strong: Core fraud/identity/AI-PM role, direct background match
- good: Good fit with only minor or nice-to-have gaps
- partial: Some relevant experience but real gaps in must-haves
- weak: Significant stretch or outside Russell's target domains`,
      messages: [{ role: 'user', content: `Evaluate this role for Russell:\n\n${parts}` }],
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('INVALID_KEY');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text?.trim() || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse AI response');
  const parsed = JSON.parse(match[0]);
  if (!parsed.score || !parsed.summary) throw new Error('Invalid response format');
  return { score: parsed.score, summary: parsed.summary };
}
