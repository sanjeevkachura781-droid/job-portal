import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, BriefcaseBusiness, LogOut, Menu, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const navigation = {
	candidate: [["/candidate", "Dashboard"], ["/jobs", "Find Jobs"], ["/candidate/applications", "My Applications"], ["/candidate/interviews", "Interviews"], ["/candidate/profile", "Profile"]],
	recruiter: [["/recruiter", "Dashboard"], ["/recruiter/company", "Company"], ["/recruiter/jobs/new", "Create Job"], ["/recruiter/jobs", "My Jobs"], ["/recruiter/applications", "Applications"], ["/recruiter/interviews", "Interviews"]],
	admin: [["/admin", "Dashboard"], ["/admin/users", "Users"], ["/admin/companies", "Companies"], ["/admin/jobs", "Jobs"], ["/admin/applications", "Applications"]],
} as const;

export function Shell() { const { user, logout } = useAuth(); const navigate = useNavigate(); const [open, setOpen] = useState(false); const links = user ? navigation[user.role] : []; const signOut = () => { logout(); navigate("/login"); }; return <div className="app-shell"><aside className={open ? "sidebar open" : "sidebar"}><Link className="brand" to={user ? `/${user.role}` : "/jobs"}><span className="brand-mark"><BriefcaseBusiness size={18} /></span>northstar</Link><nav aria-label="Primary navigation">{links.map(([to, label]) => <NavLink className="button button-ghost nav-button" key={to} to={to} end={to === `/${user?.role}`} onClick={() => setOpen(false)}>{label}</NavLink>)}<NavLink className="button button-ghost nav-button" to="/notifications" onClick={() => setOpen(false)}><Bell size={16} /> Notifications</NavLink></nav><div className="sidebar-foot"><button className="button button-danger" onClick={signOut} data-testid="sign-out"><LogOut size={16} /> Sign Out</button></div></aside><div className="main-area"><header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(!open)}><Menu /></button><div className="topbar-spacer" /><Link to="/notifications" className="button button-ghost" aria-label="Notifications"><Bell size={19} /></Link><div className="user-chip"><UserRound size={17} /><span>{user?.name}</span></div></header><main className="content"><Outlet /></main></div></div>; }
