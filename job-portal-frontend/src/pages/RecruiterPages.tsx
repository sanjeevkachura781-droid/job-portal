import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Plus } from "lucide-react";
import { apiMessage } from "../api/client";
import { applicationApi } from "../api/applicationApi";
import { interviewApi } from "../api/interviewApi";
import { jobApi } from "../api/jobApi";
import type { Application, ApplicationStatus } from "../types/api";
import { Badge, Button, Card, Empty, Input, Loader, PageTitle, Select } from "../components/common/UI";

function Notice({ message, good = false }: { message?: string; good?: boolean }) { return message ? <p className={good ? "notice good" : "notice"} role="status">{message}</p> : null; }

export function RecruiterJobs() {
  const query = useQuery({ queryKey: ["recruiter", "jobs"], queryFn: jobApi.mine });
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const action = useMutation({ mutationFn: ({ id, type }: { id: number; type: "publish" | "close" | "delete" }) => type === "publish" ? jobApi.publish(id) : type === "close" ? jobApi.close(id) : jobApi.remove(id), onSuccess: () => { setMessage("Job updated."); client.invalidateQueries({ queryKey: ["recruiter", "jobs"] }); }, onError: e => setMessage(apiMessage(e)) });
  const jobs = query.data?.data.jobs || [];
  if (query.isLoading) return <><PageTitle eyebrow="Recruiter workspace" title="My jobs" /><Loader /></>;
  return <><PageTitle eyebrow="Recruiter workspace" title="My jobs"><Link className="button button-primary" to="/recruiter/jobs/new" data-testid="create-job"><Plus size={16} /> Create Job</Link></PageTitle><Notice message={message} good={message === "Job updated."} /><div className="list-stack">{jobs.map(job => <Card key={job.id} className="list-row"><div><span className="eyebrow"><BriefcaseBusiness size={14} /> {job.company?.name || "Company"}</span><h3>{job.title}</h3><Badge tone={job.status}>{job.status}</Badge></div><div className="row-actions"><Link className="button button-ghost" to={`/recruiter/jobs/${job.id}/edit`}>Edit job</Link>{job.status === "draft" && <Button disabled={action.isPending} onClick={() => action.mutate({ id: job.id, type: "publish" })}>Publish job</Button>}{job.status === "published" && <Button variant="ghost" disabled={action.isPending} onClick={() => window.confirm("Close this job?") && action.mutate({ id: job.id, type: "close" })}>Close job</Button>}<Link className="button button-ghost" to={`/recruiter/applications?jobId=${job.id}`}>View applications</Link></div></Card>)}{!jobs.length && <Empty>No jobs yet. Create your first job.</Empty>}</div></>;
}

type RecruiterApplication = Application & { candidate?: { id: number; name: string; email: string } };
const statuses: ApplicationStatus[] = ["applied", "shortlisted", "interview", "selected", "rejected", "withdrawn"];

export function RecruiterApplications() {
  const query = useQuery({ queryKey: ["recruiter", "applications"], queryFn: applicationApi.recruiter });
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [scheduleFor, setScheduleFor] = useState<number | null>(null);
  const status = useMutation({ mutationFn: ({ id, value }: { id: number; value: ApplicationStatus }) => applicationApi.status(id, value), onSuccess: () => { setMessage("Application status updated."); client.invalidateQueries({ queryKey: ["recruiter", "applications"] }); }, onError: e => setMessage(apiMessage(e)) });
  const schedule = useMutation({ mutationFn: ({ id, body }: { id: number; body: Record<string, string> }) => interviewApi.create(id, body), onSuccess: () => { setMessage("Interview scheduled."); setScheduleFor(null); client.invalidateQueries({ queryKey: ["recruiter", "applications"] }); }, onError: e => setMessage(apiMessage(e)) });
  const applications = (query.data?.data.applications || []) as RecruiterApplication[];
  if (query.isLoading) return <><PageTitle eyebrow="Recruiter workspace" title="Applications" /><Loader /></>;
  return <><PageTitle eyebrow="Recruiter workspace" title="Applications"><Link className="button button-ghost" to="/recruiter">Back to dashboard</Link></PageTitle><Notice message={message} good={message.endsWith("updated.") || message.endsWith("scheduled.")} /><div className="list-stack">{applications.map(item => <Card key={item.id} className="list-row"><div><span className="eyebrow">{item.job?.title || `Job #${item.jobId}`}</span><h3>{item.candidate?.name || `Candidate #${item.candidateId}`}</h3><p className="muted">{item.candidate?.email || "Candidate details unavailable"}</p><Badge tone={item.status}>{item.status}</Badge></div><div className="row-actions"><Select aria-label={`Status for application ${item.id}`} value={item.status} disabled={status.isPending} onChange={e => status.mutate({ id: item.id, value: e.target.value as ApplicationStatus })}>{statuses.map(value => <option key={value} value={value}>{value}</option>)}</Select>{item.status !== "withdrawn" && <Button variant="ghost" disabled={schedule.isPending} onClick={() => setScheduleFor(scheduleFor === item.id ? null : item.id)}><CalendarDays size={15} /> Schedule interview</Button>}</div>{scheduleFor === item.id && <ScheduleForm applicationId={item.id} pending={schedule.isPending} onSubmit={body => schedule.mutate({ id: item.id, body })} />}</Card>)}{!applications.length && <Empty>No applications for your jobs yet.</Empty>}</div></>;
}

function ScheduleForm({ applicationId, pending, onSubmit }: { applicationId: number; pending: boolean; onSubmit: (body: Record<string, string>) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ scheduledAt: String(data.get("scheduledAt")), meetingLink: String(data.get("meetingLink") || ""), notes: String(data.get("notes") || "") }); };
  return <form className="narrow-form" onSubmit={submit} data-testid={`schedule-form-${applicationId}`}><Input label="Scheduled date and time" name="scheduledAt" type="datetime-local" required /><Input label="Meeting link" name="meetingLink" /><label className="field"><span>Notes</span><textarea name="notes" rows={3} /></label><Button type="submit" disabled={pending}>{pending ? "Scheduling..." : "Schedule interview"} <ArrowRight size={15} /></Button></form>;
}
