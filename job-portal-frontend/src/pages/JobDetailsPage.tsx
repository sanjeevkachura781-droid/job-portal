import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiMessage } from "../api/client";
import { applicationApi } from "../api/applicationApi";
import { jobApi } from "../api/jobApi";
import { homeForRole, useAuth } from "../context/AuthContext";
import { Button, Card, Empty, Loader } from "../components/common/UI";

function PublicFrame({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="public-page"><header className="public-nav"><Link className="brand" to="/jobs"><span className="brand-mark"><BriefcaseBusiness size={18} /></span>northstar</Link><div><Link className="button button-ghost" to="/jobs">Browse Jobs</Link>{user ? <><Link className="button button-ghost" to={homeForRole(user.role)}>Dashboard</Link><button className="button button-danger" onClick={() => { logout(); navigate("/login"); }}>Sign Out</button></> : <><Link className="button button-ghost" to="/login">Sign In</Link><Link className="button button-primary" to="/register">Create Account</Link></>}</div></header>{children}</div>;
}

export function JobDetailsPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobApi.get(jobId),
    enabled: Number.isFinite(jobId),
  });
  const apply = useMutation({
    mutationFn: (body: { resumeUrl?: string; coverLetter?: string }) => applicationApi.apply(jobId, body),
  });
  const job = query.data?.data.job;

  if (query.isLoading) return <PublicFrame><Loader /></PublicFrame>;
  if (query.isError) return <PublicFrame><div className="detail-wrap"><p className="notice">{apiMessage(query.error)}</p></div></PublicFrame>;
  if (!job) return <PublicFrame><Empty>Job not found.</Empty></PublicFrame>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    apply.mutate({ coverLetter: String(data.get("coverLetter") || "") });
  };

  return <PublicFrame><div className="detail-wrap"><Link className="back-link" to="/jobs">← Back to opportunities</Link><div className="detail-grid"><article><div className="detail-icon"><Building2 /></div><span className="eyebrow">{job.company?.name || "Opportunity"}</span><h1>{job.title}</h1><div className="detail-meta"><span><MapPin size={16} />{job.location || "Remote"}</span><span><BriefcaseBusiness size={16} />{job.employmentType || "Full time"}</span></div><h2>The role</h2><p className="long-copy">{job.description}</p>{job.requirements && <><h2>What you bring</h2><p className="long-copy">{job.requirements}</p></>}</article><aside><Card><h3>Ready to apply?</h3>{!user ? <><p className="muted">Create a candidate account to submit your application.</p><Link className="button button-primary" to="/register">Create account <ArrowRight size={16} /></Link></> : user.role !== "candidate" ? <p className="muted">Only candidate accounts can apply for jobs.</p> : <form onSubmit={submit}><label className="field"><span>Cover letter</span><textarea name="coverLetter" rows={6} placeholder="Tell them why this role fits..." /></label>{apply.error && <p className="notice">{apiMessage(apply.error)}</p>}{apply.isSuccess && <p className="notice good">Application submitted.</p>}<Button type="submit" disabled={apply.isPending}>{apply.isPending ? "Submitting..." : "Submit application"} <ArrowRight size={16} /></Button></form>}</Card></aside></div></div></PublicFrame>;
}
