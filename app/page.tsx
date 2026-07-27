"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import aiResumeHero from "./components/AiResume.png";
import aiResumeMobile from "./components/AiResume2.png";
import logoResume from "./components/logoresume.png";

type HugeIconProps = {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

const hugeIcon = (name: string) => {
  function HugeIcon({ size = 24, className = "", style }: HugeIconProps) {
    const dimension = typeof size === "number" ? `${size}px` : size;
    return (
      <i
        aria-hidden="true"
        className={`hgi-stroke hgi-${name} huge-ui-icon ${className}`.trim()}
        style={{ fontSize: dimension, width: dimension, height: dimension, ...style }}
      />
    );
  }
  HugeIcon.displayName = `HugeIcon(${name})`;
  return HugeIcon;
};

const Bell = hugeIcon("notification-02");
const BriefcaseBusiness = hugeIcon("briefcase-02");
const Building2 = hugeIcon("building-03");
const CalendarDays = hugeIcon("calendar-03");
const Check = hugeIcon("tick-02");
const ChevronDown = hugeIcon("arrow-down-01");
const ChevronRight = hugeIcon("arrow-right-01");
const CircleUserRound = hugeIcon("user-circle");
const Clock3 = hugeIcon("clock-03");
const FileSearch = hugeIcon("file-search");
const FileText = hugeIcon("file-02");
const LayoutDashboard = hugeIcon("dashboard-square-01");
const LogOut = hugeIcon("logout-03");
const Menu = hugeIcon("menu-01");
const MessageCircle = hugeIcon("message-01");
const MoreHorizontal = hugeIcon("more-horizontal");
const Plus = hugeIcon("add-01");
const Search = hugeIcon("search-01");
const Send = hugeIcon("sent");
const Settings = hugeIcon("settings-02");
const Sparkles = hugeIcon("sparkles");
const Upload = hugeIcon("upload-02");
const UserRound = hugeIcon("user");
const UsersRound = hugeIcon("user-group");
const WandSparkles = hugeIcon("magic-wand-01");
const X = hugeIcon("cancel-01");
const Zap = hugeIcon("zap");
const Eye = hugeIcon("view");
const EyeOff = hugeIcon("view-off");
const LockKeyhole = hugeIcon("square-lock-02");
const Mail = hugeIcon("mail-01");
const ArrowLeft = hugeIcon("arrow-left-01");
const Trash2 = hugeIcon("delete-02");
const Edit3 = hugeIcon("edit-02");
const Filter = hugeIcon("filter");
const Download = hugeIcon("download-02");
const Video = hugeIcon("video-01");
const CheckCircle2 = hugeIcon("checkmark-circle-02");
const Folder = hugeIcon("folder-01");
const FolderOpen = hugeIcon("folder-open");
const ClipboardCheck = hugeIcon("task-done-01");
const BrainCircuit = hugeIcon("ai-brain-02");
const Route = hugeIcon("route-01");
const ShieldCheck = hugeIcon("shield-02");
const TrendingUp = hugeIcon("analytics-up");
const Sun = hugeIcon("sun-03");
const Moon = hugeIcon("moon-02");
const Monitor = hugeIcon("computer");

type Role = "Applicant" | "Office" | "Administrator";
type Application = { role: string; office: string; status: string; score: number; date: string; color: string };
type User = { name: string; email: string; role: Role; office?: string; avatar?: string };
type SharedMessage={id:number;from:Role;to:Role;text:string;time:string;applicantEmail?:string};
type SubmittedApplication={
  id:number;name:string;email:string;job:string;office:string;score:number;
  skillScore?:number;qualificationScore?:number;skills?:string[];status:string;reviewed?:boolean;
  resumeUrl?:string;resumeName?:string;resumeType?:string;extractedText?:string;summary?:string;
  applicantAvatar?:string;
  education?:string[];experience?:string[];qualifications?:string[];missingSkills?:string[];
  interviewSuggestions?:string[];interviewDate?:string;interviewTime?:string;
  interviewMethod?:string;interviewLocation?:string
};

const applications: Application[] = [];
const jobs: Array<{role:string;office:string;type:string;score:number;skills:string[];accent:string}> = [];
const candidates: Array<{name:string;role:string;score:number;status:string;initials:string}> = [];

function downloadExcel(filename:string,headers:string[],rows:Array<Array<string|number>>) {
  const escape=(value:string|number)=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  const table=`<table><thead><tr>${headers.map(header=>`<th>${escape(header)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(value=>`<td>${escape(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const workbook=`<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial}th{background:#246fdf;color:#fff}th,td{border:1px solid #cfd8e6;padding:8px}</style></head><body>${table}</body></html>`;
  const url=URL.createObjectURL(new Blob([workbook],{type:"application/vnd.ms-excel;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=filename.endsWith(".xls")?filename:`${filename}.xls`;link.click();URL.revokeObjectURL(url);
}

function ScoreRing({ score, small = false }: { score: number; small?: boolean }) {
  return (
    <div className={`score-ring ${small ? "small" : ""}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}>
      <div><strong>{score}%</strong>{!small && <span>match</span>}</div>
    </div>
  );
}

function ResumeDocument({ application }: { application: SubmittedApplication }) {
  const download=()=>{
    if(!application.resumeUrl)return;
    const link=document.createElement("a");
    link.href=application.resumeUrl;
    link.download=application.resumeName||`${application.name}-resume`;
    link.click();
  };
  return <div className="uploaded-resume">
    <div className="uploaded-resume-head">
      <div><span>Original applicant file</span><b>{application.resumeName||"No uploaded file available"}</b></div>
      {application.resumeUrl&&<button className="secondary" onClick={download}><Download size={14}/> Download</button>}
    </div>
    {application.resumeUrl&&application.resumeType==="application/pdf"
      ?<iframe src={application.resumeUrl} title={`${application.name} resume`}/>
      :application.resumeUrl
        ?<div className="docx-preview"><FileText size={34}/><h3>{application.resumeName}</h3><p>Word resumes are preserved as the original file. Download it above; the verified extracted text is shown below.</p><pre>{application.extractedText||"The document was parsed successfully."}</pre></div>
        :<div className="no-resume-file"><FileSearch size={35}/><h3>Original resume unavailable</h3><p>This is a demonstration record created before file storage was enabled. No generated resume is shown.</p></div>}
  </div>;
}

function Brand() {
  return <div className="brand"><div className="brand-mark brand-logo-image"><Image src={logoResume} alt="CareerBridge AI logo"/></div><span>CareerBridge AI</span></div>;
}

function Sidebar({ role, page, setPage, open, close, onLogout, user, messageCount }: { role: Role; page: string; setPage: (p: string) => void; open: boolean; close: () => void; onLogout: () => void; user:User;messageCount:number }) {
  const applicant = [
    ["Overview", LayoutDashboard], ["Find jobs", Search], ["My applications", FileText],
    ["Messages", MessageCircle], ["Interviews", CalendarDays]
  ] as const;
  const office = [
    ["Overview", LayoutDashboard], ["Applications", FileText], ["Candidates", UsersRound],
    ["Job postings", BriefcaseBusiness], ["Messages", MessageCircle], ["Interviews", CalendarDays]
  ] as const;
  const admin = [
    ["Overview", LayoutDashboard], ["Applicants", UsersRound], ["Applications", FileText],
    ["Candidates", CircleUserRound], ["Job postings", BriefcaseBusiness], ["Interviews", CalendarDays],
    ["Messages", MessageCircle], ["AI insights", WandSparkles], ["Workflows", Zap]
  ] as const;
  const items = role === "Applicant" ? applicant : role === "Office" ? office : admin;
  return (
    <>
      {open && <button className="backdrop" onClick={close} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top"><Brand /><button className="mobile-close" onClick={close}><X size={20}/></button></div>
        <div className="role-caption">{role} portal</div>
        <nav>{items.map(([label, Icon]) => (
          <button key={label} className={page === label ? "active" : ""} onClick={() => { setPage(label); close(); }}>
            <Icon size={19} /><span>{label}</span>{label === "Messages"&&messageCount>0&&<em>{messageCount}</em>}
          </button>
        ))}</nav>
        <div className="sidebar-bottom">
          <button onClick={()=>setPage("Settings")}><Settings size={19}/> Settings</button>
          <button onClick={onLogout}><LogOut size={19}/> Sign out</button>
          <div className="profile-mini"><div className="avatar">{role==="Administrator"?<Image src={logoResume} alt="CareerBridge AI administrator"/>:user.avatar?<img src={user.avatar} alt={user.name}/>:user.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><b>{user.name}</b><span>{role}</span></div><MoreHorizontal size={18}/></div>
        </div>
      </aside>
    </>
  );
}

function Header({ role, setRole, onMenu, setPage, notify,user,messageCount }: { role: Role; setRole: (r: Role) => void; onMenu: () => void; setPage:(p:string)=>void; notify:(s:string)=>void;user:User;messageCount:number }) {
  const [rolesOpen, setRolesOpen] = useState(false);
  const [panel,setPanel]=useState<"notifications"|"search"|null>(null); const [search,setSearch]=useState("");
  const results=(role==="Applicant"?["Find jobs","My applications","Messages","Interviews","Settings"]:["Applicants","Applications","Candidates","Job postings","Interviews","Messages","AI insights","Workflows","Settings"]).filter(x=>x.toLowerCase().includes(search.toLowerCase()));
  return (
    <header>
      <button className="menu-button" onClick={onMenu}><Menu size={22}/></button>
      <div className="top-search" onClick={()=>setPanel("search")}><Search size={18}/><input value={search} onChange={e=>{setSearch(e.target.value);setPanel("search")}} placeholder="Search jobs, applicants, messages..." /><kbd>⌘ K</kbd></div>
      <div className="header-actions">
        <button className="icon-button" onClick={()=>setPanel(panel==="notifications"?null:"notifications")}><Bell size={20}/></button>
        <div className="avatar">{role==="Administrator"?<Image src={logoResume} alt="CareerBridge AI administrator"/>:user.avatar?<img src={user.avatar} alt={user.name}/>:user.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div>
      </div>
      {panel==="search"&&<div className="header-panel search-panel"><div className="panel-head"><b>Search CareerBridge</b><button onClick={()=>setPanel(null)}><X size={16}/></button></div>{search?<>{results.map(x=><button key={x} onClick={()=>{setPage(x);setPanel(null)}}><Search size={14}/><span>{x}<small>Open page</small></span><ChevronRight size={14}/></button>)}{!results.length&&<p>No results found.</p>}</>:<p>Type a page name to navigate.</p>}</div>}
      {panel==="notifications"&&<div className="header-panel notification-panel"><div className="panel-head"><b>Notifications</b><button onClick={()=>setPanel(null)}><X size={16}/></button></div><p>No new notifications.</p></div>}
    </header>
  );
}

function Metric({ label, value, note, icon: Icon, tint }: { label: string; value: string; note: string; icon: typeof UsersRound; tint: string }) {
  return <div className="metric card"><div className="metric-icon" style={{ background: tint }}><Icon size={21}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><div className="spark"><i/><i/><i/><i/><i/></div></div>;
}

function ApplicantHome({ setPage }: { setPage: (p: string) => void }) {
  return <div className="page-content">
    <section className="welcome hero-gradient">
      <div><div className="eyebrow"><BriefcaseBusiness size={14}/> Recruitment overview</div><h1>Good morning, Jamie</h1><p>Your profile is getting noticed. You have <b>3 strong job matches</b> and one interview coming up.</p>
        <div className="hero-actions"><button className="primary" onClick={() => setPage("Find jobs")}>Explore matches <ChevronRight size={17}/></button><button className="secondary" onClick={() => setPage("Resume analysis")}><Upload size={17}/> Update resume</button></div>
      </div>
      <div className="profile-score"><ScoreRing score={88}/><div><b>Profile strength</b><span>Great progress!</span><small>Complete 2 items to reach 100%</small></div></div>
    </section>
    <div className="metrics">
      <Metric label="Applications" value="8" note="+2 this month" icon={FileText} tint="#eef0ff"/>
      <Metric label="Strong matches" value="12" note="3 new today" icon={Sparkles} tint="#fff0f5"/>
      <Metric label="Profile views" value="24" note="+18% this week" icon={UserRound} tint="#ecfaf7"/>
      <Metric label="Messages" value="3" note="2 unread" icon={MessageCircle} tint="#fff6e7"/>
    </div>
    <div className="content-grid">
      <section className="card panel">
        <div className="panel-title"><div><h2>Your best matches</h2><p>Positions selected by CareerBridge AI</p></div><button className="text-button" onClick={() => setPage("Find jobs")}>View all <ChevronRight size={16}/></button></div>
        <div className="job-list">{jobs.map(job => <div className="job-row" key={job.role}><div className="job-logo" style={{ background: job.accent }}><Building2 size={20}/></div><div className="job-main"><b>{job.role}</b><span>{job.office} · {job.type}</span><div>{job.skills.map(s => <small key={s}>{s}</small>)}</div></div><ScoreRing score={job.score} small/><button className="arrow-button"><ChevronRight size={18}/></button></div>)}</div>
      </section>
      <aside className="right-stack">
        <section className="card interview-card"><div className="panel-title"><div><div className="eyebrow"><CalendarDays size={14}/> Upcoming</div><h2>Interview</h2></div><button className="dots"><MoreHorizontal/></button></div><div className="date-block"><b>29</b><span>JUL<br/>WED</span></div><h3>IT Support Specialist</h3><p>Information Technology Office</p><div className="interview-meta"><span><Clock3 size={15}/> 10:30 AM</span><span>Video interview</span></div><button className="secondary full">View details</button></section>
        <section className="card ai-tip"><div className="ai-icon"><WandSparkles size={20}/></div><div><b>AI career tip</b><p>Add “Active Directory” to your skills to improve your IT match score by up to 6%.</p><button>Improve profile <ChevronRight size={14}/></button></div></section>
      </aside>
    </div>
    <section className="card panel application-panel"><div className="panel-title"><div><h2>Recent applications</h2><p>Track your progress across school offices</p></div><button className="text-button">View all <ChevronRight size={16}/></button></div>
      <div className="application-table">{applications.map(a => <div className="application-row" key={a.role}><div className="job-logo" style={{background:a.color}}><BriefcaseBusiness size={19}/></div><div><b>{a.role}</b><span>{a.office}</span></div><span className={`status ${a.status.toLowerCase().replace(" ","-")}`}>{a.status}</span><span className="match">{a.score}% match</span><span className="date">{a.date}</span><button className="dots"><MoreHorizontal size={18}/></button></div>)}</div>
    </section>
  </div>;
}

function NewApplicantHome({user,setPage,jobs}:{user:User;setPage:(p:string)=>void;jobs:JobRecord[]}) {
  const open=jobs.filter(j=>j.status==="Open");
  return <div className="page-content"><section className="welcome hero-gradient"><div><div className="eyebrow"><UserRound size={14}/> New applicant account</div><h1>Welcome, {user.name}</h1><p>Your account is ready. Upload one resume from Find Jobs and CareerBridge will identify your strongest job match.</p><div className="hero-actions"><button className="primary" onClick={()=>setPage("Find jobs")}>View open jobs <ChevronRight size={17}/></button></div></div></section><div className="metrics new-account-metrics"><Metric label="Applications" value="0" note="No applications yet" icon={FileText} tint="#eef4ff"/><Metric label="Interviews" value="0" note="No interviews scheduled" icon={CalendarDays} tint="#eef4ff"/><Metric label="Messages" value="0" note="No new messages" icon={MessageCircle} tint="#eef4ff"/></div><section className="card panel"><div className="panel-title"><div><h2>Open school positions</h2><p>Current jobs published by Admin/HR</p></div><button className="text-button" onClick={()=>setPage("Find jobs")}>View all <ChevronRight size={15}/></button></div><div className="job-list">{open.map((job,i)=><div className="job-row" key={job.id}><div className="job-logo" style={{background:["#3478f6","#4f8de9","#5b7fce"][i%3]}}><BriefcaseBusiness size={19}/></div><div className="job-main"><b>{job.title}</b><span>{job.office} · {job.type} · {job.location}</span><div><small>{job.status}</small></div></div><button className="arrow-button" onClick={()=>setPage("Find jobs")}><ChevronRight size={18}/></button></div>)}</div></section></div>
}

function ResumeAnalysis() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File|null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [analysis,setAnalysis]=useState<{skills?:string[];missingSkills?:string[];matchScore?:number;summary?:string}|null>(null);
  const analyze = async () => {
    if(!file){input.current?.click();return}
    setAnalyzing(true);
    try {
      const form=new FormData();form.append("resume",file);form.append("jobDescription","IT Support Specialist for a school; requires technical support, networking, Active Directory, cybersecurity, communication, and ticketing systems.");
      const response=await fetch("/api/resume/parse",{method:"POST",body:form});
      if(!response.ok)throw new Error("Analysis failed");
      setAnalysis(await response.json());setDone(true);
    } catch { setDone(true); }
    finally { setAnalyzing(false); }
  };
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> AI-powered insights</div><h1>Resume analysis</h1><p>See how employers and school offices see your resume.</p></div><button className="primary" onClick={() => input.current?.click()}><Upload size={17}/> Upload new resume</button></div>
    <div className="resume-grid">
      <section className="card resume-preview">
        <div className="fake-resume"><div className="resume-name">JAMIE DELA CRUZ</div><div className="resume-role">IT SUPPORT PROFESSIONAL</div><div className="resume-columns"><div><b>PROFILE</b><p>Detail-oriented IT professional with experience supporting users and school systems.</p><b>EXPERIENCE</b><h4>IT Support Associate</h4><small>Northfield Learning Center · 2023—Present</small><p>Resolved technical issues, maintained workstations and supported classroom technology.</p><h4>Technical Intern</h4><small>Digital Works Inc. · 2022—2023</small></div><div><b>CONTACT</b><p>jamie@email.com<br/>Manila, Philippines</p><b>SKILLS</b><p>Technical Support<br/>Networking<br/>Microsoft 365<br/>Hardware</p><b>EDUCATION</b><p>BS Information Technology</p></div></div></div>
        <input ref={input} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={e => setFile(e.target.files?.[0] || null)}/>
        {file && <div className="file-chip"><FileText size={16}/>{file.name}<button onClick={() => setFile(null)}><X size={14}/></button></div>}
      </section>
      <section className="analysis-side">
        <div className="card score-card"><ScoreRing score={analysis?.matchScore||88}/><div><h2>Your resume score</h2><p>{analysis?.summary||"Upload a PDF or DOCX resume for real parsing and job matching."}</p><div className="score-labels"><span>ATS readiness <b>92</b></span><span>Content quality <b>86</b></span><span>Skills relevance <b>{analysis?.matchScore||84}</b></span></div></div></div>
        <div className="card insights"><div className="panel-title"><div><div className="eyebrow"><WandSparkles size={14}/> CareerBridge AI</div><h2>Smart analysis</h2></div><span className="live-dot">AI ready</span></div>
          <div className="insight-good"><Check size={18}/><div><b>What stands out</b><p>Strong IT support experience, clear education history, and measurable responsibility.</p></div></div>
          <div className="insight-warn"><Zap size={18}/><div><b>Missing skills</b><p>Add Active Directory, ticketing systems, and basic cybersecurity to strengthen your top matches.</p></div></div>
          <div className="skill-cloud">{(analysis?.skills||["Technical Support", "Networking", "Microsoft 365", "Hardware", "Troubleshooting"]).map(x => <span key={x}>{x}</span>)}</div>
          <button className="primary full" onClick={analyze} disabled={analyzing}>{analyzing ? "Analyzing with AI..." : done ? "Analysis refreshed" : "Run AI analysis"}</button>
        </div>
      </section>
    </div>
  </div>;
}

function OfficeHome() {
  return <div className="page-content">
    <div className="metrics"><Metric label="New applications" value="24" note="+8 this week" icon={FileText} tint="#eef0ff"/><Metric label="In review" value="16" note="5 need action" icon={FileSearch} tint="#fff0f5"/><Metric label="Interviews" value="7" note="3 this week" icon={CalendarDays} tint="#ecfaf7"/><Metric label="Avg. match" value="86%" note="+4% this month" icon={Sparkles} tint="#fff6e7"/></div>
    <div className="content-grid office-grid"><section className="card panel"><div className="panel-title"><div><h2>Top recommended candidates</h2><p>Ranked by skills, experience, and role requirements</p></div><button className="text-button">View all <ChevronRight size={16}/></button></div>
      <div className="candidate-list">{candidates.map((c,i)=><div className="candidate-row" key={c.name}><span className="rank">0{i+1}</span><div className="avatar alt">{c.initials}</div><div><b>{c.name}</b><span>{c.role}</span></div><div className="candidate-score"><b>{c.score}%</b><span>AI match</span></div><span className={`status ${c.status.toLowerCase()}`}>{c.status}</span><button className="secondary">Review</button></div>)}</div></section>
      <aside className="right-stack"><section className="card panel"><div className="panel-title"><div><h2>Hiring progress</h2><p>Current pipeline</p></div></div>{[["Applied",42],["AI screened",31],["Office review",16],["Interview",7],["Offer",3]].map(([x,n])=><div className="pipeline" key={x}><span>{x}</span><div><i style={{width:`${Number(n)*2}%`}}/></div><b>{n}</b></div>)}</section><section className="card ai-tip"><div className="ai-icon"><Sparkles size={20}/></div><div><b>AI recommendation</b><p>Maria Santos is an exceptional 94% match and meets every required qualification.</p><button>Review candidate <ChevronRight size={14}/></button></div></section></aside>
    </div>
  </div>;
}

function AdminHome() {
  return <div className="page-content">
    <div className="metrics"><Metric label="Total applicants" value="1,284" note="+12.4% this month" icon={UsersRound} tint="#eef0ff"/><Metric label="Open positions" value="38" note="Across 8 offices" icon={BriefcaseBusiness} tint="#fff0f5"/><Metric label="Active applications" value="426" note="74 need review" icon={FileText} tint="#ecfaf7"/><Metric label="Time to hire" value="18d" note="3 days faster" icon={Clock3} tint="#fff6e7"/></div>
    <div className="admin-grid"><section className="card panel chart-panel"><div className="panel-title"><div><h2>Application activity</h2><p>Applications received over the last 7 months</p></div><button className="secondary">Last 7 months <ChevronDown size={14}/></button></div><div className="chart"><div className="y-labels"><span>300</span><span>200</span><span>100</span><span>0</span></div><svg viewBox="0 0 700 210" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7478ed" stopOpacity=".28"/><stop offset="100%" stopColor="#7478ed" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0,170 C80,150 90,130 150,140 S230,85 300,105 S390,55 450,73 S540,55 590,28 S650,42 700,10 L700,210 L0,210Z"/><path className="line" d="M0,170 C80,150 90,130 150,140 S230,85 300,105 S390,55 450,73 S540,55 590,28 S650,42 700,10"/></svg><div className="x-labels">{["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(x=><span key={x}>{x}</span>)}</div></div></section>
      <section className="card panel status-panel"><div className="panel-title"><div><h2>Application status</h2><p>Current distribution</p></div><button className="dots"><MoreHorizontal size={18}/></button></div><div className="modern-donut-wrap"><div className="modern-donut">
        <svg viewBox="0 0 140 140" role="img" aria-label="426 applications by status"><circle className="donut-track" cx="70" cy="70" r="52"/><circle className="donut-segment review" cx="70" cy="70" r="52" pathLength="100" strokeDasharray="38.3 61.7" strokeDashoffset="0"/><circle className="donut-segment interview-segment" cx="70" cy="70" r="52" pathLength="100" strokeDasharray="23.3 76.7" strokeDashoffset="-39.4"/><circle className="donut-segment shortlisted" cx="70" cy="70" r="52" pathLength="100" strokeDasharray="20.5 79.5" strokeDashoffset="-63.8"/><circle className="donut-segment decision" cx="70" cy="70" r="52" pathLength="100" strokeDasharray="13.5 86.5" strokeDashoffset="-85.4"/></svg>
        <div className="donut-center"><b>426</b><span>Total applications</span><small>+12.4% this month</small></div></div>
        <div className="modern-legend">{[["In review",168,"39.4%","#6c63e8"],["Interview",104,"24.4%","#e58aaa"],["Shortlisted",92,"21.6%","#65b7a7"],["Decision",62,"14.6%","#e9b866"]].map(([x,n,p,c])=><div key={x}><i style={{background:c}}/><span><b>{x}</b><small>{p} of applications</small></span><strong>{n}</strong></div>)}</div></div></section>
    </div>
    <section className="card panel"><div className="panel-title"><div><h2>Office performance</h2><p>Hiring activity and efficiency by department</p></div><button className="text-button">View report <ChevronRight size={16}/></button></div><div className="office-table"><div className="table-head"><span>Office</span><span>Open roles</span><span>Applicants</span><span>Avg. match</span><span>Progress</span></div>{[["Information Technology",7,128,88,76],["Academic Office",12,184,82,64],["Human Resources",5,72,85,83],["Accounting Office",4,61,79,58]].map(([name,open,app,match,progress],i)=><div className="table-row" key={name}><div><span className="office-icon">{["IT","AC","HR","AO"][i]}</span><b>{name}</b></div><span>{open}</span><span>{app}</span><span><b>{match}%</b></span><div className="progress"><i style={{width:`${progress}%`}}/></div></div>)}</div></section>
  </div>;
}

function LandingPage({onLogin}:{onLogin:()=>void}) {
  const [contact,setContact]=useState(false);const [copied,setCopied]=useState(false);
  const [theme,setTheme]=useState<"light"|"dark"|"system">("system");const [systemDark,setSystemDark]=useState(false);
  const [buddyOpen,setBuddyOpen]=useState(false);const [buddyInput,setBuddyInput]=useState("");const [buddyLoading,setBuddyLoading]=useState(false);
  const [buddyMessages,setBuddyMessages]=useState<Array<{role:"user"|"assistant";content:string}>>([{role:"assistant",content:"Hi! I’m CareerBuddy. Ask me anything about CareerBridge AI, resume matching, applications, or school recruitment."}]);
  const email="barnacheajassy@gmail.com";
  const go=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  useEffect(()=>{const elements=[...document.querySelectorAll<HTMLElement>(".landing-reveal")];const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.13,rootMargin:"0px 0px -40px"});elements.forEach(element=>observer.observe(element));return()=>observer.disconnect()},[]);
  useEffect(()=>{const media=window.matchMedia("(prefers-color-scheme: dark)");const update=()=>setSystemDark(media.matches);update();media.addEventListener("change",update);const saved=localStorage.getItem("careerbridge_landing_theme");if(saved==="light"||saved==="dark"||saved==="system")setTheme(saved);return()=>media.removeEventListener("change",update)},[]);
  const selectTheme=(value:"light"|"dark"|"system")=>{setTheme(value);localStorage.setItem("careerbridge_landing_theme",value)};
  const sendBuddy=async(event:FormEvent)=>{
    event.preventDefault();const content=buddyInput.trim();if(!content||buddyLoading)return;
    const next=[...buddyMessages,{role:"user" as const,content}];setBuddyMessages(next);setBuddyInput("");setBuddyLoading(true);
    try{const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});const data=await response.json();if(!response.ok)throw new Error(data.error);setBuddyMessages([...next,{role:"assistant",content:String(data.reply)}])}
    catch(error){setBuddyMessages([...next,{role:"assistant",content:error instanceof Error?error.message:"CareerBuddy is temporarily unavailable."}])}
    finally{setBuddyLoading(false)}
  };
  const effectiveTheme=theme==="system"?(systemDark?"dark":"light"):theme;
  return <div className="landing-page" data-theme={effectiveTheme}>
    <div className="landing-bubbles" aria-hidden="true">{Array.from({length:8},(_,index)=><i key={index}/>)}</div>
    <div className="landing-3d-scene" aria-hidden="true">{Array.from({length:6},(_,index)=><i key={index}/>)}</div>
    <nav className="landing-nav"><Brand/><div className="landing-links"><button onClick={()=>go("home")}>Home</button><button onClick={()=>go("features")}>Features</button><button onClick={()=>go("how-it-works")}>How it works</button><button onClick={()=>setContact(true)}>Contact</button></div><div className="landing-theme-switch" aria-label="Color theme"><button className={theme==="light"?"active":""} title="Light" onClick={()=>selectTheme("light")}><Sun size={15}/></button><button className={theme==="dark"?"active":""} title="Dark" onClick={()=>selectTheme("dark")}><Moon size={15}/></button><button className={theme==="system"?"active":""} title="System" onClick={()=>selectTheme("system")}><Monitor size={15}/></button></div></nav>
    <main className="landing-main">
      <section className="landing-hero" id="home"><div className="landing-glow one"/><div className="landing-glow two"/><div className="landing-copy landing-reveal"><h1>Connect great talent with the <span>right school opportunity.</span></h1><p>CareerBridge AI analyzes resumes, scores job compatibility, and organizes every qualified applicant into the correct hiring workflow.</p><div className="landing-actions"><button className="landing-primary" onClick={onLogin}>Get started <ChevronRight size={16}/></button><button className="landing-secondary" onClick={()=>go("features")}>Explore features</button></div><div className="landing-trust"><span><CheckCircle2/> AI resume parsing</span><span><CheckCircle2/> Explainable matching</span><span><CheckCircle2/> Secure applicant data</span></div></div><div className="landing-dashboard-frame landing-reveal"><div className="browser-dots"><i/><i/><i/><span>CareerBridge AI dashboard</span></div><Image src={aiResumeHero} priority alt="CareerBridge AI blue applicant recruitment dashboard"/></div></section>
      <section className="landing-features" id="features"><div className="landing-section-title landing-reveal"><span>Platform features</span><h2>Everything your school needs to hire intelligently</h2><p>One connected platform for applicants and authorized recruitment administrators.</p></div><div className="feature-grid">{([[FileSearch,"Resume intelligence","Extract skills, education, experience, and qualifications from PDF or DOCX resumes."],[BrainCircuit,"AI job matching","Compare every applicant with open positions and produce transparent match scores."],[Route,"Automatic organization","Place qualified applicants into each matching job folder without manual sorting."],[MessageCircle,"Secure messaging","Keep applicant and Admin/HR conversations connected to the correct account."],[CalendarDays,"Interview coordination","Schedule onsite, Zoom, or Google Meet interviews and notify applicants."],[ShieldCheck,"Protected information","Role-based access keeps original resumes and applicant details private."]] as const).map(([Icon,title,description],index)=><article className="landing-reveal" style={{transitionDelay:`${index%3*90}ms`}} key={title}><div><Icon size={22}/></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="landing-showcase" id="how-it-works"><div className="showcase-phone landing-reveal"><div className="phone-orbit"/><Image src={aiResumeMobile} alt="CareerBridge AI mobile resume upload and analysis experience"/></div><div className="showcase-copy landing-reveal"><div className="landing-pill"><Upload size={14}/> Applicant experience</div><h2>Upload once. Let AI find the strongest opportunities.</h2><p>Applicants upload one resume from any device. CareerBridge extracts real qualifications, compares every open position, and routes strong matches to the right job folders.</p>{[["01","Upload securely","Submit a PDF or DOCX resume from desktop or mobile."],["02","Analyze qualifications","Groq extracts resume evidence and produces real scoring factors."],["03","Track every update","Review applications, messages, and interviews in one organized portal."]].map(([number,title,text])=><div className="showcase-step" key={number}><b>{number}</b><span><strong>{title}</strong><small>{text}</small></span></div>)}<button className="landing-primary" onClick={onLogin}>Open CareerBridge AI <ChevronRight size={16}/></button></div></section>
      <section className="landing-cta landing-reveal"><div><span>Ready to modernize school recruitment?</span><h2>Build a faster, clearer hiring experience.</h2><p>Contact us to inquire about CareerBridge AI for your school.</p></div><button onClick={()=>setContact(true)}>Inquire now <Mail size={17}/></button></section>
    </main>
    <footer className="landing-footer"><Brand/><p>AI-powered recruitment and applicant management for schools.</p><button onClick={()=>setContact(true)}>{email}</button><small>© 2026 CareerBridge AI</small></footer>
    <button className={`careerbuddy-launcher ${buddyOpen?"open":""}`} onClick={()=>setBuddyOpen(!buddyOpen)} aria-label={buddyOpen?"Close CareerBuddy":"Open CareerBuddy"}><span><BrainCircuit size={24}/></span><b>CareerBuddy</b>{buddyOpen?<X size={17}/>:<Sparkles size={16}/>}</button>
    {buddyOpen&&<section className="careerbuddy-panel" aria-label="CareerBuddy chat">
      <header><div><span><BrainCircuit size={20}/></span><div><b>CareerBuddy</b><small><i/> Powered by Groq AI</small></div></div><button onClick={()=>setBuddyOpen(false)}><X size={17}/></button></header>
      <div className="careerbuddy-messages">{buddyMessages.map((message,index)=><div className={message.role} key={index}>{message.role==="assistant"&&<span><BrainCircuit size={14}/></span>}<p>{message.content}</p></div>)}{buddyLoading&&<div className="assistant"><span><BrainCircuit size={14}/></span><p className="buddy-typing"><i/><i/><i/></p></div>}</div>
      <div className="careerbuddy-suggestions">{["How does AI matching work?","What files can I upload?","How can I contact you?"].map(question=><button key={question} onClick={()=>setBuddyInput(question)}>{question}</button>)}</div>
      <form onSubmit={sendBuddy}><input value={buddyInput} onChange={event=>setBuddyInput(event.target.value)} maxLength={800} placeholder="Ask CareerBuddy..."/><button disabled={!buddyInput.trim()||buddyLoading} aria-label="Send message"><Send size={17}/></button></form>
      <small className="buddy-credit">CareerBridge AI · Developed by Jasmine Barnachea</small>
    </section>}
    {contact&&<div className="modal-backdrop landing-contact-backdrop" onClick={()=>setContact(false)}><div className="landing-contact" onClick={event=>event.stopPropagation()}><button className="contact-close" onClick={()=>setContact(false)}><X size={18}/></button><div className="contact-icon"><Mail size={25}/></div><span>CareerBridge AI inquiries</span><h2>Let’s talk about your school’s hiring needs.</h2><p>Send your inquiry directly to:</p><a href={`mailto:${email}`}>{email}</a><div className="contact-actions"><button onClick={()=>{navigator.clipboard?.writeText(email);setCopied(true)}}>{copied?<Check size={16}/>:<FileText size={16}/>} {copied?"Email copied":"Copy email"}</button><a href={`mailto:${email}?subject=CareerBridge AI Inquiry`}>Open email app <Send size={16}/></a></div></div></div>}
  </div>
}

function AdminLiveHome({jobs,applications,applicants,setPage}:{jobs:JobRecord[];applications:SubmittedApplication[];applicants:User[];setPage:(page:string)=>void}) {
  const [chartRange,setChartRange]=useState<"7"|"30"|"90">("7");
  const [ranking,setRanking]=useState<"score"|"latest"|"review">("score");
  const openJobs=jobs.filter(job=>job.status==="Open");
  const reviewed=applications.filter(item=>item.reviewed).length;
  const interviews=applications.filter(item=>item.status==="Interview scheduled").length;
  const average=applications.length?Math.round(applications.reduce((sum,item)=>sum+item.score,0)/applications.length):0;
  const shortlisted=applications.filter(item=>item.status==="AI shortlisted"||item.status==="Priority").length;
  const pending=Math.max(0,applications.length-reviewed);
  const chartData=applications.reduce((counts,item)=>{counts[Math.abs(item.id)%7]+=1;return counts},[0,0,0,0,0,0,0]);
  const chartMaximum=Math.max(1,...chartData);
  const rankedApplications=applications.slice().sort((a,b)=>ranking==="score"?b.score-a.score:ranking==="latest"?b.id-a.id:Number(a.reviewed)-Number(b.reviewed));
  const kpis: Array<[typeof UsersRound,string,string,string,string]> = [
    [UsersRound,"Total applicants",String(applicants.length),"Live","Applicant accounts"],
    [BriefcaseBusiness,"Open positions",String(openJobs.length),"Live","Active opportunities"],
    [CheckCircle2,"Review progress",`${applications.length?Math.round(reviewed/applications.length*100):0}%`,"Live","Applications reviewed"],
    [BrainCircuit,"Average AI match",`${average}%`,"Live","Across active roles"]
  ];
  const exportInsights=()=>downloadExcel("careerbridge-ai-insights.xls",["Applicant","Email","Position","Office","AI Match","Skill Score","Status"],applications.map(item=>[item.name,item.email,item.job,item.office,`${item.score}%`,`${item.skillScore??item.score}%`,item.status]));
  return <div className="page-content overview-dashboard">
    <div className="overview-title"><div><h1>Dashboard Overview</h1><p>Recruitment activity and AI performance across all school positions.</p></div><button className="overview-export" onClick={exportInsights}><Download size={17}/> Export insights</button></div>
    <div className="overview-kpis">
      {kpis.map(([Icon,label,value,trend,note])=><article className="card overview-kpi" key={label}><div className="overview-kpi-head"><span><Icon size={18}/>{label}</span><MoreHorizontal size={17}/></div><div><strong>{value}</strong><b><TrendingUp size={13}/>{trend}</b></div><small>{note}</small></article>)}
    </div>
    <div className="overview-analytics">
      <section className="card recruitment-chart">
        <div className="overview-panel-head"><div><h2>Application Summary</h2><p>Applicant and review performance</p></div><label className="overview-select"><select value={chartRange} onChange={event=>setChartRange(event.target.value as "7"|"30"|"90")}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><ChevronDown size={14}/></label></div>
        <div className="chart-legend"><span><i/>Applications</span><span><i/>Reviewed</span></div>
        <div className="bar-chart"><div className="chart-axis"><span>{chartMaximum}</span><span>{Math.round(chartMaximum*.75)}</span><span>{Math.round(chartMaximum*.5)}</span><span>{Math.round(chartMaximum*.25)}</span><span>0</span></div>{chartData.map((value,index)=><div className="bar-day" key={index}><div className="bar-pair"><i style={{height:`${value/chartMaximum*100}%`}}/><i style={{height:`${applications.filter(item=>Math.abs(item.id)%7===index&&item.reviewed).length/chartMaximum*100}%`}}/></div><span>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][index]}</span></div>)}</div>
      </section>
      <section className="card status-chart">
        <div className="overview-panel-head"><div><h2>Application Status</h2><p>Current hiring pipeline</p></div><MoreHorizontal size={18}/></div>
        <div className="overview-donut-wrap"><div className="overview-donut" style={{"--reviewed":`${applications.length?reviewed/applications.length*100:0}%`,"--interview":`${applications.length?interviews/applications.length*100:0}%`,"--shortlisted":`${applications.length?shortlisted/applications.length*100:0}%`} as React.CSSProperties}><div><b>{applications.length}</b><span>Total</span></div></div></div>
        <div className="status-legend"><span><i className="reviewed"/><b>Reviewed</b><em>{reviewed}</em></span><span><i className="interview"/><b>Interview</b><em>{interviews}</em></span><span><i className="shortlisted"/><b>Shortlisted</b><em>{shortlisted}</em></span><span><i className="pending"/><b>Pending</b><em>{pending}</em></span></div>
      </section>
    </div>
    <section className="card overview-table">
      <div className="overview-panel-head"><div><h2>Applicant Performance</h2><p>Candidates ranked by CareerBridge AI</p></div><div className="overview-table-actions"><label className="overview-select"><select value={ranking} onChange={event=>setRanking(event.target.value as "score"|"latest"|"review")}><option value="score">Top matches</option><option value="latest">Latest applicants</option><option value="review">Needs review</option></select><ChevronDown size={14}/></label><button onClick={()=>setPage("Candidates")}>View all <ChevronRight size={14}/></button></div></div>
      <div className="overview-table-head"><span>Applicant</span><span>Position</span><span>AI match</span><span>Review status</span><span>Recommendation</span></div>
      {rankedApplications.slice(0,5).map(item=><div className="overview-table-row" key={item.id}><div><div className="avatar">{item.applicantAvatar?<img src={item.applicantAvatar} alt={item.name}/>:item.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><span><b>{item.name}</b><small>{item.email}</small></span></div><span><b>{item.job}</b><small>{item.office}</small></span><strong>{item.score}%</strong><span className={`status ${item.reviewed?"reviewed":"under-review"}`}>{item.reviewed?"Reviewed":"In review"}</span><em className={item.score>=90?"top-match":"good-match"}>{item.score>=90?"Top match":"Good match"}</em></div>)}
      {!rankedApplications.length&&<div className="overview-empty"><UsersRound size={24}/><b>No applicant data yet</b><span>New accounts and analyzed resumes will appear here.</span></div>}
    </section>
  </div>
}

function ApplicantDirectory({accounts,applications}:{accounts:User[];applications:SubmittedApplication[]}) {
  const people=[...new Map([...accounts,...applications.map(a=>({name:a.name,email:a.email,role:"Applicant" as Role,avatar:a.applicantAvatar}))].map(person=>[person.email.toLowerCase(),person])).values()];
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><UsersRound size={14}/> Applicants</div><h1>Applicants</h1><p>Applicant accounts and application activity.</p></div></div><section className="card panel candidate-report"><div className="candidate-report-head"><span>Applicant</span><span>Email</span><span>Applications</span><span>Top score</span><span>Status</span></div>{people.map(person=>{const records=applications.filter(a=>a.email.toLowerCase()===person.email.toLowerCase());return <div className="candidate-report-row" key={person.email}><div><div className="avatar">{person.avatar?<img src={person.avatar} alt={person.name}/>:person.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><span><b>{person.name}</b><small>Applicant</small></span></div><span>{person.email}</span><b>{records.length}</b><b className="blue-score">{records.length?`${Math.max(...records.map(r=>r.score))}%`:"—"}</b><span className="status">{records.length?"Applied":"Registered"}</span></div>})}{!people.length&&<div className="empty-jobs"><UsersRound/><h3>No applicants</h3><p>Applicant accounts will appear here.</p></div>}</section></div>
}

function SettingsPage({user,setUser,notify}:{user:User;setUser:React.Dispatch<React.SetStateAction<User|null>>;notify:(text:string)=>void}) {
  const [draft,setDraft]=useState(user); const [emailUpdates,setEmailUpdates]=useState(true); const [applicationUpdates,setApplicationUpdates]=useState(true);
  useEffect(()=>setDraft(user),[user]);
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><Settings size={14}/> Account preferences</div><h1>Settings</h1><p>Manage the information connected to this signed-in account.</p></div></div><form className="card panel settings-form" onSubmit={event=>{event.preventDefault();const clean={...draft,name:draft.name.trim(),email:draft.email.trim().toLowerCase()};setUser(clean);if(clean.role==="Applicant"){localStorage.setItem("careerbridge_signup_user",JSON.stringify(clean));const existing=JSON.parse(localStorage.getItem("careerbridge_applicants")||"[]") as User[];const withoutOld=existing.filter(item=>item.email.toLowerCase()!==user.email.toLowerCase());localStorage.setItem("careerbridge_applicants",JSON.stringify([...withoutOld,clean]));localStorage.setItem(`careerbridge_preferences_${clean.email}`,JSON.stringify({applicationUpdates,emailUpdates}))}notify("Settings saved successfully")}}><div className="panel-title"><div><h2>Profile information</h2><p>Used on your account and applicant conversations.</p></div>{user.role==="Applicant"&&<div className="avatar settings-avatar">{draft.avatar?<img src={draft.avatar} alt={draft.name}/>:draft.name.split(" ").map(part=>part[0]).join("").slice(0,2)}</div>}</div><div className="form-two"><label>Full name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} required/></label><label>Email address<input type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} required/></label></div>{user.role==="Applicant"&&<label>Profile image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>2*1024*1024){notify("Profile image must be 2 MB or smaller.");e.target.value="";return}const reader=new FileReader();reader.onload=()=>setDraft(current=>({...current,avatar:String(reader.result)}));reader.readAsDataURL(file)}}}/><small>PNG, JPG, or WebP · Maximum 2 MB</small></label>}<div className="settings-toggles"><label><input type="checkbox" checked={applicationUpdates} onChange={e=>setApplicationUpdates(e.target.checked)}/><span><b>Application updates</b><small>Receive status and interview notifications.</small></span></label><label><input type="checkbox" checked={emailUpdates} onChange={e=>setEmailUpdates(e.target.checked)}/><span><b>Email notifications</b><small>Receive important recruitment messages by email.</small></span></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setDraft(user)}>Discard changes</button><button className="primary"><Check size={15}/> Save settings</button></div></form></div>
}

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signup,setSignup]=useState(false); const [name,setName]=useState(""); const [photo,setPhoto]=useState("");
  const [authTheme,setAuthTheme]=useState<"light"|"dark">("light");
  useEffect(()=>{
    const media=window.matchMedia("(prefers-color-scheme: dark)");
    const apply=()=>{const preference=localStorage.getItem("careerbridge_landing_theme")||"system";setAuthTheme(preference==="dark"||(preference==="system"&&media.matches)?"dark":"light")};
    apply();media.addEventListener("change",apply);return()=>media.removeEventListener("change",apply);
  },[]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    if(signup){
      const normalized=email.trim().toLowerCase();
      const accounts=JSON.parse(localStorage.getItem("careerbridge_local_accounts")||"[]") as Array<User&{password:string}>;
      if(accounts.some(account=>account.email.toLowerCase()===normalized)){setError("An account with this email already exists.");setLoading(false);return}
      const applicant:User={name:name.trim()||"New Applicant",email:normalized,role:"Applicant",avatar:photo};
      try{
        localStorage.setItem("careerbridge_local_accounts",JSON.stringify([...accounts,{...applicant,password}]));
      }catch{
        try{localStorage.setItem("careerbridge_local_accounts",JSON.stringify([...accounts,{...applicant,avatar:undefined,password}]))}catch{}
      }
      onLogin(applicant);setLoading(false);return
    }
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to sign in");
      onLogin(data.user);
    } catch (e) {
      const accounts=JSON.parse(localStorage.getItem("careerbridge_local_accounts")||"[]") as Array<User&{password:string}>;
      const account=accounts.find(item=>item.email.toLowerCase()===email.trim().toLowerCase()&&item.password===password);
      if(account){const {password:_password,...applicant}=account;onLogin(applicant)}
      else setError(e instanceof Error ? e.message : "Unable to sign in");
    }
    finally { setLoading(false); }
  }
  return <div className="login-page" data-theme={authTheme}>
    <section className="login-visual">
      <Brand/>
      <div className="login-copy"><h1>Connect talent with the right opportunity.</h1><p>CareerBridge AI makes school hiring faster, fairer, and more human with intelligent resume analysis and applicant matching.</p>
        <div className="login-features"><div><WandSparkles/><span><b>AI resume insights</b><small>Instant skills and qualification analysis</small></span></div><div><Zap/><span><b>Smart job matching</b><small>Applicants ranked by true role fit</small></span></div><div><Building2/><span><b>Automated routing</b><small>Every application reaches the right office</small></span></div></div>
      </div>
      <div className="login-art"><div className="floating-card fc-one"><ScoreRing score={94} small/><span><b>Excellent match</b><small>IT Support Specialist</small></span></div><div className="floating-card fc-two"><CheckCircle2/><span><b>Application routed</b><small>Information Technology</small></span></div></div>
      <small className="copyright">© 2026 CareerBridge AI · Built for modern schools</small>
    </section>
    <section className="login-form-wrap"><form className="login-form" onSubmit={submit}>
      <div className="mobile-brand"><Brand/></div><div className="eyebrow">{signup?"Applicant registration":"Welcome back"}</div><h2>{signup?"Create your account":"Sign in to your portal"}</h2><p>{signup?"Set up your applicant profile and profile photo.":"Enter your school recruitment account details."}</p>
      {signup&&<><label className="signup-photo"><input type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>setPhoto(String(r.result));r.readAsDataURL(f)}}}/><span className="avatar">{photo?<img src={photo} alt="Profile preview"/>:<UserRound/>}</span><b>{photo?"Change profile photo":"Upload profile photo"}</b></label><label>Full name<div className="input-wrap"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} required placeholder="Your full name"/></div></label></>}
      <label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu" required/></div></label>
      <label>Password<div className="input-wrap"><LockKeyhole size={17}/><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
      <div className="login-options"><label><input type="checkbox" defaultChecked/> Remember me</label><button type="button" onClick={()=>setError("Password reset instructions were sent to your email.")}>Forgot password?</button></div>
      {error && <div className={error.includes("sent")?"form-success":"form-error"}>{error}</div>}
      <button className="primary login-submit" disabled={loading}>{loading?(signup?"Creating account...":"Signing in..."):(signup?"Create applicant account":"Sign in securely")} <ChevronRight size={17}/></button>
      <button className="signup-switch" type="button" onClick={()=>{setSignup(!signup);setError("")}}>{signup?"Already registered? Sign in":"New applicant? Create an account"}</button>
    </form></section>
  </div>;
}

const pageCopy: Record<string, [string,string]> = {
  "Find jobs":["Find your next opportunity","AI-matched positions available across school offices."],
  "My applications":["My applications","Track every application and hiring decision in one place."],
  "Messages":["Messages","Communicate securely with applicants and school departments."],
  "Interviews":["Interview schedule","Manage upcoming interviews and meeting details."],
  "Applications":["Application review","Review, rank, and progress incoming applications."],
  "Candidates":["Candidate directory","Discover and compare qualified applicants."],
  "Job postings":["Job postings","Create and manage opportunities across the school."],
  "Applicants":["Applicant management","Manage applicant records and recruitment activity."],
  "School offices":["School offices","Configure departments, routing, and office managers."],
  "AI insights":["AI recruitment insights","Monitor recommendations, matching quality, and hiring trends."],
  "Workflows":["Application workflows","Configure every stage from submission to hiring decision."]
  ,"Settings":["Account settings","Manage your profile, security, and notification preferences."]
};

function MessagesPage({ role,messages,setMessages,user,applicants }: { role: Role;messages:SharedMessage[];setMessages:React.Dispatch<React.SetStateAction<SharedMessage[]>>;user:User;applicants:SubmittedApplication[] }) {
  const [selected,setSelected]=useState(0); const [draft,setDraft]=useState("");
  const applicantContacts=[...new Map(applicants.map(a=>[a.email.toLowerCase(),{name:a.name,email:a.email,avatar:a.applicantAvatar}])).values()];
  if(user.email==="applicant@careerbridge.edu"&&!applicantContacts.some(a=>a.email===user.email))applicantContacts.unshift({name:user.name,email:user.email,avatar:user.avatar});
  const contacts=role==="Applicant"?[{name:"Admin / HR",email:"admin@careerbridge.edu",avatar:undefined as string|undefined}]:applicantContacts;
  const contact=contacts[Math.min(selected,Math.max(contacts.length-1,0))];
  const applicantEmail=role==="Applicant"?user.email:contact?.email;
  const thread=messages.filter(m=>m.applicantEmail===applicantEmail&&((m.from===role&&m.to===(role==="Applicant"?"Administrator":"Applicant"))||(m.to===role&&m.from===(role==="Applicant"?"Administrator":"Applicant"))));
  const target:Role=role==="Applicant"?"Administrator":"Applicant";
  return <div className="page-content"><div className="page-heading"><div><h1>Messages</h1><p>Secure conversations and hiring updates.</p></div></div><div className="messages-layout card">
    <div className="chat-list"><div className="chat-search"><Search size={15}/><input placeholder="Search conversations"/></div>{contacts.map((x,i)=>{const count=messages.filter(m=>m.applicantEmail===(role==="Applicant"?user.email:x.email)&&m.to===role).length;return <button className={selected===i?"selected":""} key={x.email} onClick={()=>setSelected(i)}><div className="avatar">{x.avatar?<img src={x.avatar} alt={x.name}/>:x.name.split(" ").map(y=>y[0]).join("").slice(0,2)}</div><span><b>{x.name}</b><small>{messages.filter(m=>m.applicantEmail===(role==="Applicant"?user.email:x.email)).at(-1)?.text||"Start a secure conversation"}</small></span>{count>0&&<i>{count}</i>}</button>})}</div>
    {contact?<div className="conversation"><div className="conversation-head"><div className="avatar">{contact.avatar?<img src={contact.avatar} alt={contact.name}/>:contact.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><span><b>{contact.name}</b><small>{role==="Applicant"?"School recruitment administrator":contact.email}</small></span></div>
      <div className="messages">{thread.map(m=><div className={`message-line ${m.from===role?"mine":"theirs"}`} key={m.id}><div className="message-avatar">{m.from===role&&user.avatar?<img src={user.avatar} alt={user.name}/>:m.from.slice(0,1)}</div><div className={`bubble ${m.from===role?"mine":"theirs"}`}>{m.text}<small>{m.time}</small></div></div>)}{!thread.length&&<div className="empty-thread">Start a secure conversation with {contact.name}.</div>}</div>
      <form className="message-box" onSubmit={e=>{e.preventDefault();if(draft.trim()&&applicantEmail){setMessages([...messages,{id:Date.now(),from:role,to:target,text:draft,time:"Just now",applicantEmail}]);setDraft("");}}}><button type="button"><Plus size={18}/></button><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={`Message ${contact.name}...`}/><button className="send" aria-label="Send"><Send size={17}/></button></form>
    </div>:<div className="conversation empty-thread">No applicants are available to message yet.</div>}</div></div>;
}

const offices = [
  { name:"Information Technology", code:"IT", qualified:12, total:38, roles:7, color:"#829cbe", candidates:["Maria Santos","John Reyes","Angela Cruz"] },
  { name:"Academic Office", code:"AC", qualified:18, total:64, roles:12, color:"#9589b9", candidates:["Camille Flores","Rafael Lim","Nicole Tan"] },
  { name:"Human Resources", code:"HR", qualified:7, total:22, roles:5, color:"#87aa9a", candidates:["Jamie Dela Cruz","Sofia Ramos","Kyle Mendoza"] },
  { name:"Accounting Office", code:"AO", qualified:9, total:31, roles:4, color:"#b59a68", candidates:["Paolo Garcia","Bea Castillo","Luis Navarro"] }
];

function OfficePortfolios({ notify,submitted }: { notify:(s:string)=>void;submitted:SubmittedApplication[] }) {
  const [selected,setSelected]=useState<typeof offices[0]|null>(null); const [q,setQ]=useState(""); const [candidate,setCandidate]=useState(0); const [tab,setTab]=useState<"applicants"|"analytics">("applicants");
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><Mail size={14}/> Applicant routing</div><h1>Office applicant inboxes</h1><p>Qualified resumes are automatically routed to—and securely held by—the correct school office.</p></div><button className="primary" onClick={()=>notify("Office creation form opened")}><Plus size={16}/> Add office</button></div>
    <div className="portfolio-summary"><div><Mail/><span><b>4</b><small>Office inboxes</small></span></div><div><UsersRound/><span><b>46</b><small>Qualified applicants</small></span></div><div><FileText/><span><b>155</b><small>Routed resumes</small></span></div><div><Sparkles/><span><b>86%</b><small>Average AI match</small></span></div></div>
    <section className="card portfolio-section"><div className="portfolio-title"><div><span>School recruitment</span><h2>Office applicant portfolios</h2><p>Point at an envelope to open it, then select the portfolio inside.</p></div><div className="mini-search"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Find an office..."/></div></div><div className="portfolio-grid modern-portfolio-grid">{offices.filter(o=>o.name.toLowerCase().includes(q.toLowerCase())).map((o,i)=><button className={`modern-portfolio-card full-envelope tone-${i}`} key={o.name} onClick={()=>{setSelected(o);setCandidate(0);setTab("applicants")}}>
      <div className="full-envelope-back"/><div className="full-envelope-flap"/>
      <div className="portfolio-letter"><div className="modern-portfolio-top"><div className="letter-office-icon"><Building2 size={19}/></div><div className="portfolio-count"><Bell size={12}/>{o.qualified}</div></div><h3>{o.name}</h3><p>{o.total} applicant resumes routed to this office</p><div className="portfolio-stats"><span><b>{o.qualified}</b> Qualified</span><span><b>{o.roles}</b> Open roles</span></div><div className="portfolio-open"><span>View portfolio</span><ChevronRight size={16}/></div></div>
      <div className="full-envelope-pocket"/><div className="closed-envelope-label"><b>{o.name}</b><span>{o.total} applicants</span></div>
    </button>)}</div></section>
    {selected&&<div className="office-drawer-backdrop" onClick={()=>setSelected(null)}><aside className="office-drawer office-workspace" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div className="office-badge" style={{background:selected.color,color:"white"}}>{selected.code}</div><div><span>Applicant inbox</span><h2>{selected.name}</h2></div><button onClick={()=>setSelected(null)}><X/></button></div>
      <div className="workspace-tabs"><button className={tab==="applicants"?"active":""} onClick={()=>setTab("applicants")}><UsersRound size={15}/> Applicants & resumes <i>{selected.total}</i></button><button className={tab==="analytics"?"active":""} onClick={()=>setTab("analytics")}><LayoutDashboard size={15}/> Office analytics</button></div>
      {tab==="applicants"?<div className="resume-workspace"><div className="workspace-list"><div className="drawer-ai"><Sparkles/><div><b>{submitted.filter(a=>a.office===selected.name).length} applicant records</b><p>Actual uploads sorted by AI match.</p></div></div>{submitted.filter(a=>a.office===selected.name).sort((a,b)=>b.score-a.score).map((item,i)=><button className={`drawer-candidate ${candidate===i?"selected":""}`} key={item.id} onClick={()=>setCandidate(i)}><div className="avatar">{item.name.split(" ").map(y=>y[0]).join("")}</div><div><b>{item.name}</b><span>{item.score}% match · {item.resumeName||"Legacy record"}</span></div><ChevronRight size={15}/></button>)}</div>
        {(()=>{const ranked=submitted.filter(a=>a.office===selected.name).sort((a,b)=>b.score-a.score);const person=ranked[candidate]||ranked[0];return person?<div className="actual-resume"><ResumeDocument application={person}/><aside className="candidate-analysis"><div className="analysis-score"><ScoreRing score={person.score}/><div><b>AI scorer</b><span>{person.skillScore??person.score}% skills</span></div></div><p>{person.summary||"No AI summary stored for this legacy record."}</p>{person.skills?.length?<div className="parsed-skills">{person.skills.map(skill=><span key={skill}>{skill}</span>)}</div>:null}</aside></div>:<div className="no-resume-file"><FileSearch size={35}/><h3>No applicants in this portfolio</h3><p>New resume uploads routed here will appear automatically.</p></div>})()}
      </div>:<div className="office-analytics"><div className="analytics-cards"><div><span>Total applicants</span><b>{selected.total}</b><small>+8 this month</small></div><div><span>AI qualified</span><b>{selected.qualified}</b><small>{Math.round(selected.qualified/selected.total*100)}% qualification rate</small></div><div><span>Average match</span><b>86%</b><small>Above school average</small></div><div><span>Open positions</span><b>{selected.roles}</b><small>3 priority roles</small></div></div><div className="analytics-panels"><section className="card"><h3>Applicant qualification funnel</h3>{[["Applications",selected.total],["AI analyzed",selected.total-2],["Qualified",selected.qualified],["Interview",Math.max(3,selected.qualified-5)],["Recommended",3]].map(([x,n])=><div className="analytics-bar" key={x}><span>{x}</span><div><i style={{width:`${Number(n)/selected.total*100}%`}}/></div><b>{n}</b></div>)}</section><section className="card"><h3>Top applicant skills</h3>{["Communication","Microsoft 365","Technical support","Documentation","Data analysis"].map((x,i)=><div className="analytics-skill" key={x}><span>{x}</span><b>{92-i*7}%</b></div>)}</section></div><div className="drawer-ai"><Sparkles/><div><b>AI office insight</b><p>Candidate quality is 8% above the school average. Prioritize the top three applicants for interview scheduling this week.</p></div></div></div>}
    </aside></div>}
  </div>;
}

function AIInsightsPage({ notify,priorityNames,setPriorityNames }: { notify:(s:string)=>void;priorityNames:string[];setPriorityNames:React.Dispatch<React.SetStateAction<string[]>> }) {
  const [range,setRange]=useState("30 days"); const [running,setRunning]=useState(false); const [explain,setExplain]=useState<typeof candidates[0]|null>(null); const [recommendation,setRecommendation]=useState<[string,string,string]|null>(null);
  const recommendations:[string,string,string][]=[["Prioritize 12 IT candidates","Applicants exceed the 90% match threshold.","High"],["Expand Academic search","Learning-management skills are scarce.","Medium"],["Review Accounting criteria","A requirement may be limiting diversity.","Review"]];
  const run=async()=>{setRunning(true);try{await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeText:"Analyze the current school recruitment talent pool with IT, academic, accounting, and HR applicants.",jobDescription:"Identify qualification trends, missing skills, recommendations, and interview priorities."})});notify("AI analysis refreshed with current applicant data")}catch{notify("Current insights retained; AI service is temporarily unavailable")}finally{setRunning(false)}};
  const exportInsights=()=>{downloadExcel("careerbridge-ai-insights.xls",["Candidate","Position","Match Score","Top Factors"],candidates.map((c,i)=>[c.name,c.role,`${c.score}%`,`Skills +${32-i}; Experience +${28-i}; Education +18`]));notify("AI insights Excel report exported")};
  return <div className="page-content" onClick={e=>{const button=(e.target as HTMLElement).closest("button");if(button?.textContent?.includes("Add to priority review")&&explain&&!priorityNames.includes(explain.name)){setPriorityNames([...priorityNames,explain.name])}}}><div className="page-heading"><div><div className="eyebrow"><WandSparkles size={14}/> Live recruitment intelligence</div><h1>AI insights</h1><p>Explainable recommendations generated from applicant qualifications and job requirements.</p></div><button className="primary" onClick={run}><Sparkles size={16}/>{running?"Analyzing…":"Run live analysis"}</button></div>
    <div className="insight-kpis"><Metric label="Profiles analyzed" value="1,284" note="100% processed" icon={FileSearch} tint="#eef0ff"/><Metric label="Strong matches" value="326" note="+18 this week" icon={Sparkles} tint="#fff0f5"/><Metric label="Skills gaps found" value="74" note="Across 12 roles" icon={Zap} tint="#fff6e7"/><Metric label="Bias checks" value="100%" note="No flags detected" icon={CheckCircle2} tint="#ecfaf7"/></div>
    <div className="ai-dashboard-grid"><section className="card panel"><div className="panel-title"><div><h2>Qualification intelligence</h2><p>Most influential skills across current openings</p></div><select value={range} onChange={e=>setRange(e.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select></div>{[["Technical support",92,186],["Microsoft 365",86,154],["Learning systems",78,129],["Data analysis",72,98],["Financial reporting",64,73]].map(([skill,n,count])=><div className="skill-insight" key={skill}><div><b>{skill}</b><span>{count} applicants</span></div><div><i style={{width:`${n}%`}}/></div><strong>{n}%</strong></div>)}</section>
      <section className="card panel"><div className="panel-title"><div><h2>AI recommendations</h2><p>High-impact actions</p></div><span className="live-dot">Live</span></div>{recommendations.map(r=><button className="recommendation" key={r[0]} onClick={()=>setRecommendation(r)}><div className="ai-icon"><BrainCircuit size={17}/></div><span><b>{r[0]}</b><small>{r[1]}</small></span><em>{r[2]}</em><ChevronRight size={15}/></button>)}</section></div>
    <section className="card panel explain-table"><div className="panel-title"><div><h2>Top AI-ranked applicants</h2><p>Transparent scoring with the strongest contributing factors</p></div><button className="text-button" onClick={exportInsights}><Download size={14}/> Export report</button></div>{candidates.map((c,i)=><div className="explain-row" key={c.name}><div className="avatar">{c.initials}</div><div><b>{c.name}</b><span>{c.role}</span></div><ScoreRing score={c.score} small/><div className="factor"><span>Top factors</span><div><i>Skills +{32-i}</i><i>Experience +{28-i}</i><i>Education +18</i></div></div><button className="secondary" onClick={()=>setExplain(c)}>Explain score</button></div>)}</section>
    {explain&&<div className="modal-backdrop" onClick={()=>setExplain(null)}><div className="insight-modal card" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Match score explanation</h2><p>{explain.name} · {explain.role}</p></div><button onClick={()=>setExplain(null)}><X/></button></div><div className="explanation-hero"><ScoreRing score={explain.score}/><div><b>{explain.score}% overall match</b><p>Calculated from job requirements, resume evidence, qualifications, and relevant experience.</p></div></div>{[["Required skills",94,"Strong technical support, Microsoft 365, and networking alignment."],["Relevant experience",90,"Demonstrated school systems and user-support responsibilities."],["Education",88,"Degree meets the minimum position qualification."],["Role keywords",85,"Most priority terms are supported by resume evidence."]].map(([x,n,d])=><div className="explanation-factor" key={x}><div><b>{x}</b><span>{n}%</span></div><div><i style={{width:`${Number(n)}%`}}/></div><p>{d}</p></div>)}<div className="analysis-note"><ShieldCheck/><p>This score is decision support only. Final hiring decisions remain with authorized school staff.</p></div><button className="primary full" onClick={()=>{notify(`${explain.name} added to priority review`);setExplain(null)}}>Add to priority review</button></div></div>}
    {recommendation&&<div className="modal-backdrop" onClick={()=>setRecommendation(null)}><div className="insight-modal card" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{recommendation[0]}</h2><p>AI recommendation · {recommendation[2]} priority</p></div><button onClick={()=>setRecommendation(null)}><X/></button></div><div className="recommendation-detail"><BrainCircuit size={25}/><div><b>Why this was recommended</b><p>{recommendation[1]} Current application volume, qualification coverage, match scores, and office response times were evaluated.</p></div></div><h3>Suggested actions</h3>{["Review the highest-ranked applicants","Confirm required skills with the hiring office","Schedule qualified candidates for interviews"].map((x,i)=><label className="action-check" key={x}><input type="checkbox" defaultChecked={i===0}/><span>{x}</span></label>)}<div className="modal-actions"><button className="secondary" onClick={()=>setRecommendation(null)}>Dismiss</button><button className="primary" onClick={()=>{notify("Recommendation added to recruitment workflow");setRecommendation(null)}}>Add actions to workflow</button></div></div></div>}
  </div>;
}

function LiveAIInsightsPage({items,notify,priorityNames,setPriorityNames}:{items:SubmittedApplication[];notify:(s:string)=>void;priorityNames:string[];setPriorityNames:React.Dispatch<React.SetStateAction<string[]>>}) {
  const [selected,setSelected]=useState<SubmittedApplication|null>(null);const [running,setRunning]=useState(false);
  const ranked=[...items].sort((a,b)=>b.score-a.score);
  const strong=items.filter(item=>item.score>=80&&(item.skillScore??item.score)>=80);
  const skillCounts=new Map<string,number>();items.forEach(item=>item.skills?.forEach(skill=>skillCounts.set(skill,(skillCounts.get(skill)||0)+1)));
  const topSkills=[...skillCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6);
  const run=async()=>{if(!items.length){notify("Upload applicant resumes before running AI insights.");return}setRunning(true);try{const response=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeText:items.map(item=>item.extractedText).filter(Boolean).join("\n\n"),jobDescription:items.map(item=>`${item.job}: ${item.score}% match`).join("\n")})});if(!response.ok)throw new Error();notify("AI insights refreshed from current applications.")}catch{notify("Unable to refresh AI insights.")}finally{setRunning(false)}};
  const exportReport=()=>{if(!items.length){notify("There is no applicant data to export.");return}downloadExcel("careerbridge-ai-insights.xls",["Applicant","Email","Job","Overall Score","Skill Score","Status"],ranked.map(item=>[item.name,item.email,item.job,`${item.score}%`,`${item.skillScore??item.score}%`,item.status]));notify("AI insights Excel report exported")};
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><WandSparkles size={14}/> Applicant intelligence</div><h1>AI insights</h1><p>Calculated only from resumes uploaded during this test.</p></div><button className="primary" onClick={run} disabled={running}><Sparkles size={16}/>{running?"Analyzing…":"Run live analysis"}</button></div>
    <div className="insight-kpis"><Metric label="Profiles analyzed" value={String(items.length)} note="Actual applications" icon={FileSearch} tint="#eef4ff"/><Metric label="Strong matches" value={String(strong.length)} note="80% and above" icon={CheckCircle2} tint="#eef4ff"/><Metric label="Unique skills" value={String(skillCounts.size)} note="Extracted from resumes" icon={Zap} tint="#eef4ff"/><Metric label="Priority review" value={String(priorityNames.length)} note="Selected by Admin" icon={ShieldCheck} tint="#eef4ff"/></div>
    {!items.length?<section className="card panel empty-ai-state"><BrainCircuit/><h2>No AI insight data yet</h2><p>Create a job posting, register an applicant, and upload a resume. Real Groq scores and extracted skills will appear here.</p></section>:<><div className="ai-dashboard-grid"><section className="card panel"><div className="panel-title"><div><h2>Extracted skill frequency</h2><p>Based on current uploaded resumes</p></div></div>{topSkills.map(([skill,count])=><div className="skill-insight" key={skill}><div><b>{skill}</b><span>{count} applicant{count===1?"":"s"}</span></div><div><i style={{width:`${Math.round(count/items.length*100)}%`}}/></div><strong>{Math.round(count/items.length*100)}%</strong></div>)}</section><section className="card panel"><div className="panel-title"><div><h2>Current recruitment data</h2><p>No generated sample recommendations</p></div><button className="text-button" onClick={exportReport}><Download size={14}/> Export</button></div><div className="live-data-summary"><span><b>{items.length}</b> Applications</span><span><b>{new Set(items.map(item=>item.job)).size}</b> Matched jobs</span><span><b>{items.filter(item=>item.reviewed).length}</b> Reviewed</span></div></section></div><section className="card panel explain-table"><div className="panel-title"><div><h2>AI-ranked applicants</h2><p>Scores returned from each applicant’s real resume analysis</p></div></div>{ranked.map(item=><div className="explain-row" key={item.id}><div className="avatar">{item.applicantAvatar?<img src={item.applicantAvatar} alt={item.name}/>:item.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><b>{item.name}</b><span>{item.job}</span></div><ScoreRing score={item.score} small/><div className="factor"><span>Measured factors</span><div><i>Skills {item.skillScore??item.score}%</i><i>Qualifications {item.qualificationScore??item.score}%</i></div></div><button className="secondary" onClick={()=>setSelected(item)}>Explain score</button></div>)}</section></>}
    {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="insight-modal card" onClick={event=>event.stopPropagation()}><div className="modal-head"><div><h2>AI score details</h2><p>{selected.name} · {selected.job}</p></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="explanation-hero"><ScoreRing score={selected.score}/><div><b>{selected.score}% overall match</b><p>{selected.summary||"The score was calculated from resume evidence and the job requirements."}</p></div></div>{[["Skills",selected.skillScore??selected.score],["Qualifications",selected.qualificationScore??selected.score]].map(([label,value])=><div className="explanation-factor" key={label}><div><b>{label}</b><span>{value}%</span></div><div><i style={{width:`${Number(value)}%`}}/></div></div>)}<div className="parsed-skills">{selected.skills?.map(skill=><span key={skill}>{skill}</span>)}</div><button className="primary full" onClick={()=>{if(!priorityNames.includes(selected.name))setPriorityNames([...priorityNames,selected.name]);notify(`${selected.name} added to priority review`);setSelected(null)}}>Add to priority review</button></div></div>}
  </div>
}

function WorkflowPage({ notify }: { notify:(s:string)=>void }) {
  const [active,setActive]=useState(0); const stages=["Application received","AI resume analysis","Office qualification review","Interview","Hiring decision"];
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><Zap size={14}/> Automated routing</div><h1>Application workflow</h1><p>Control how applicants move from submission to the correct office and final decision.</p></div><button className="primary" onClick={()=>notify("Workflow changes published")}><Check size={16}/> Publish workflow</button></div>
    <section className="card workflow-board"><div className="workflow-toolbar"><div><b>Default school hiring workflow</b><span>Active · Used by 8 offices</span></div><button onClick={()=>notify("Workflow duplicated")}><FileText size={15}/> Duplicate</button><button onClick={()=>notify("Workflow settings opened")}><Settings size={15}/> Configure</button></div><div className="workflow-canvas">{stages.map((s,i)=><div className="workflow-step-wrap" key={s}><button className={`workflow-step ${active===i?"active":""}`} onClick={()=>setActive(i)}><span>{i+1}</span><div><b>{s}</b><small>{i===0?"Capture profile and selected position":i===1?"Extract skills, education and experience":i===2?"Route resume to matching office":i===3?"Schedule panel and AI suggestions":"Record decision and notify applicant"}</small></div>{i===1&&<em>AI</em>}</button>{i<stages.length-1&&<ChevronRight className="flow-arrow"/>}</div>)}</div>
      <div className="workflow-config"><div><span>Selected stage</span><h3>{stages[active]}</h3><p>{active===2?"CareerBridge compares qualifications to position rules, then places the resume only inside the responsible office portfolio.":active===1?"Groq AI extracts structured qualifications and creates an explainable match score.":"Configure notifications, owners, deadlines, and automatic actions for this stage."}</p></div><div className="config-options"><label><input type="checkbox" defaultChecked/> Notify applicant when complete</label><label><input type="checkbox" defaultChecked/> Notify assigned office</label><label><input type="checkbox" defaultChecked/> Add notification counter</label><button className="secondary" onClick={()=>notify(`${stages[active]} settings saved`)}><Edit3 size={14}/> Edit automation</button></div></div></section>
    <div className="workflow-stats"><div className="card"><b>426</b><span>Currently in workflow</span></div><div className="card"><b>92%</b><span>Routing accuracy</span></div><div className="card"><b>4.2h</b><span>Average office response</span></div><div className="card"><b>18 days</b><span>Average completion</span></div></div>
  </div>;
}

type JobRecord={id:number;title:string;office:string;type:string;location:string;description:string;requirements:string;status:"Open"|"Closed";applicants:number;match:number};
const initialJobRecords:JobRecord[]=[];

function JobPostingsPage({ role,notify,records,setRecords,setSubmitted,user }:{role:Role;notify:(s:string)=>void;records:JobRecord[];setRecords:React.Dispatch<React.SetStateAction<JobRecord[]>>;setSubmitted:React.Dispatch<React.SetStateAction<SubmittedApplication[]>>;user:User}) {
  const [editing,setEditing]=useState<JobRecord|null>(null); const [applying,setApplying]=useState<JobRecord|null>(null); const [matching,setMatching]=useState(false); const [analysisProgress,setAnalysisProgress]=useState(0); const [resumeFile,setResumeFile]=useState<File|null>(null); const [q,setQ]=useState(""); const [status,setStatus]=useState<"All"|"Open"|"Closed">("All");
  useEffect(()=>{if(!matching)return;setAnalysisProgress(1);const timer=window.setInterval(()=>setAnalysisProgress(progress=>progress>=94?progress:Math.min(94,progress+(progress<35?7:progress<70?4:2))),420);return()=>window.clearInterval(timer)},[matching]);
  const visible=records.filter(j=>(role==="Applicant"?j.status==="Open":status==="All"||j.status===status)&&j.title.toLowerCase().includes(q.toLowerCase()));
  const save=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!editing)return;setRecords(editing.id?records.map(j=>j.id===editing.id?editing:j):[{...editing,id:Date.now()},...records]);notify(editing.id?"Job posting updated":"Job posting published");setEditing(null)};
  const analyzeAndApply=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();if(!applying||!resumeFile)return;setMatching(true);setAnalysisProgress(1);
    const f=new FormData(e.currentTarget);
    try{
      const resume=resumeFile;
      const openJobs=records.filter(j=>j.status==="Open");
      if(!openJobs.length)throw new Error("There are no open jobs available for matching.");
      const aiForm=new FormData();aiForm.append("resume",resume);
      aiForm.append("jobDescription",openJobs.map(j=>`JOB: ${j.title}\nOFFICE: ${j.office}\nDESCRIPTION: ${j.description}\nREQUIREMENTS: ${j.requirements}`).join("\n\n"));
      const response=await fetch("/api/resume/parse",{method:"POST",body:aiForm});
      const responseText=await response.text();
      let analysis:Record<string,unknown>;
      try{analysis=JSON.parse(responseText) as Record<string,unknown>}catch{throw new Error("The resume service returned an invalid response. Please try again.")}
      if(!response.ok)throw new Error(String(analysis.error||"Unable to analyze this resume."));
      const ranked=(Array.isArray(analysis.jobMatches)?analysis.jobMatches:[]).sort((a:{score:number},b:{score:number})=>Number(b.score)-Number(a.score));
      const qualified=ranked.filter((match:{score:number;skillScore?:number})=>Number(match.score)>=80&&Number(match.skillScore??match.score)>=80);
      const routedMatches=qualified.length?qualified:ranked.slice(0,1);
      if(!routedMatches.length)throw new Error("The AI could not rank the available jobs. Please try the analysis again.");
      const resumeUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Unable to preserve the uploaded resume."));reader.readAsDataURL(resume)});
      const baseId=Date.now();
      const routedApplications:SubmittedApplication[]=routedMatches.flatMap((match:{title:string;score:number;skillScore?:number;qualificationScore?:number;missingSkills?:string[]},index:number)=>{
        const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
        const matchTitle=normalize(String(match.title||""));
        const matchWords=new Set(matchTitle.split(" ").filter(word=>word.length>2));
        const job=openJobs.find(j=>normalize(j.title)===matchTitle)
          ||openJobs.map(candidate=>({candidate,overlap:normalize(candidate.title).split(" ").filter(word=>matchWords.has(word)).length})).sort((a,b)=>b.overlap-a.overlap)[0]?.candidate;
        if(!job)return [];
        const score=Math.min(100,Math.max(0,Number(match.score||0)));
        const skillScore=Math.min(100,Math.max(0,Number(match.skillScore??score)));
        const shortlisted=score>=80&&skillScore>=80;
        return [{id:baseId+index,name:String(f.get("name")),email:String(f.get("email")),applicantAvatar:user.avatar,job:job.title,office:job.office,score,skillScore,qualificationScore:Number(match.qualificationScore||score),skills:Array.isArray(analysis.skills)?analysis.skills.map(String):[],status:shortlisted?"AI shortlisted":"Under review",resumeUrl,resumeName:resume.name,resumeType:resume.type,extractedText:String(analysis.extractedText||""),summary:String(analysis.summary||""),education:Array.isArray(analysis.education)?analysis.education.map(String):[],experience:Array.isArray(analysis.experience)?analysis.experience.map(String):[],qualifications:Array.isArray(analysis.qualifications)?analysis.qualifications.map(String):[],missingSkills:Array.isArray(match.missingSkills)?match.missingSkills.map(String):Array.isArray(analysis.missingSkills)?analysis.missingSkills.map(String):[],interviewSuggestions:Array.isArray(analysis.interviewSuggestions)?analysis.interviewSuggestions.map(String):[]}];
      });
      if(!routedApplications.length)throw new Error("AI results did not match an available job title.");
      setSubmitted(s=>[...routedApplications,...s]);
      const routedTitles=new Set(routedApplications.map(a=>a.job));
      setRecords(records.map(j=>routedTitles.has(j.title)?{...j,applicants:j.applicants+1}:j));
      setAnalysisProgress(100);await new Promise(resolve=>setTimeout(resolve,450));notify("Resume uploaded successfully.");setApplying(null);setResumeFile(null)
    }catch(err){setAnalysisProgress(0);const message=err instanceof Error?err.message:"Resume analysis failed";notify(/match the expected pattern/i.test(message)?"The resume could not be processed by this browser. Please select the attached PDF or DOCX again.":message)}finally{setMatching(false)}
  };
  const blank:JobRecord={id:0,title:"",office:"Admin / HR",type:"Full-time",location:"Main Campus",description:"",requirements:"",status:"Open",applicants:0,match:0};
  return <div className="page-content recruit-page"><div className="page-heading"><div><div className="eyebrow"><BriefcaseBusiness size={14}/> Recruitment opportunities</div><h1>{role==="Applicant"?"Available school jobs":"Job postings"}</h1><p>{role==="Applicant"?"Upload one resume and Groq will match you to the most relevant open position.":"Create, edit, open, or close positions visible to applicants."}</p></div>{role==="Applicant"?<button className="primary" onClick={()=>setApplying({id:-1,title:"Resume job matching",office:"Automatic office routing",type:"AI matching",location:"All school campuses",description:"Your resume will be compared with every open school position.",requirements:"Groq will extract skills, experience, education, and qualifications before selecting the strongest job match.",status:"Open",applicants:0,match:0})}><Upload size={17}/> Upload resume</button>:<button className="dark-button" onClick={()=>setEditing(blank)}><Plus size={17}/> Create job posting</button>}</div>
    <div className="recruit-toolbar"><div className="top-search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search job title..."/></div>{role!=="Applicant"&&<div className="pill-tabs">{(["All","Open","Closed"] as const).map(x=><button className={status===x?"active":""} onClick={()=>setStatus(x)} key={x}>{x}</button>)}</div>}<span>{visible.length} positions</span></div>
    <div className="posting-grid">{visible.map((job,i)=><article className={`posting-card ${job.status.toLowerCase()}`} key={job.id}><div className="posting-top"><div className="posting-logo" style={{background:["#e9defa","#def0c8","#f8dfd9","#e1e1fb"][i%4]}}><BriefcaseBusiness size={21}/></div><span className={`posting-state ${job.status.toLowerCase()}`}>{job.status}</span></div><h2>{job.title}</h2><p className="posting-office">{job.office} · {job.location}</p><p>{job.description}</p><div className="posting-tags"><span>{job.type}</span><span>{job.applicants} applicants</span></div>{role!=="Applicant"&&<div className="posting-actions"><button className="edit-button" onClick={()=>setEditing({...job})}><Edit3 size={14}/> Edit</button><button className={job.status==="Open"?"close-button":"open-button"} onClick={()=>{setRecords(records.map(j=>j.id===job.id?{...j,status:j.status==="Open"?"Closed":"Open"}:j));notify(`${job.title} is now ${job.status==="Open"?"closed and hidden from applicants":"open and visible to applicants"}`)}}>{job.status==="Open"?<EyeOff size={14}/>:<Eye size={14}/>} {job.status==="Open"?"Close":"Open"}</button></div>}</article>)}</div>
    {!visible.length&&<div className="empty-jobs"><BriefcaseBusiness/><h3>No positions found</h3><p>Try another search or status filter.</p></div>}
    {editing&&<div className="modal-backdrop" onClick={()=>setEditing(null)}><form className="modal job-modal card" onClick={e=>e.stopPropagation()} onSubmit={save}><div className="modal-head"><div><h2>{editing.id?"Edit job posting":"Create job posting"}</h2><p>Open positions become immediately visible in the applicant portal.</p></div><button type="button" onClick={()=>setEditing(null)}><X/></button></div><div className="form-two"><label>Position title<input required value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="e.g. School Registrar"/></label><label>Employment type<select value={editing.type} onChange={e=>setEditing({...editing,type:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Temporary</option></select></label><label>Campus location<input value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value})}/></label></div><label>Description<textarea required value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Position responsibilities and summary"/></label><label>Qualifications and required skills<textarea required value={editing.requirements} onChange={e=>setEditing({...editing,requirements:e.target.value})} placeholder="Education, experience, skills, and certifications"/></label><label className="status-toggle">Posting status<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as "Open"|"Closed"})}><option>Open</option><option>Closed</option></select><small>{editing.status==="Open"?"Applicants can see and apply to this job.":"This job is hidden from applicants."}</small></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="dark-button">{editing.status==="Open"?"Save and publish":"Save as closed"}</button></div></form></div>}
    {applying&&<div className="modal-backdrop" onClick={()=>{if(!matching){setApplying(null);setResumeFile(null)}}}><form className="modal job-modal card resume-upload-modal" onClick={e=>e.stopPropagation()} onSubmit={analyzeAndApply}><div className="modal-head"><div><div className="eyebrow"><Sparkles size={13}/> Secure AI resume matching</div><h2>Upload your resume</h2><p>CareerBridge will compare your qualifications with every open position.</p></div><button type="button" disabled={matching} onClick={()=>{setApplying(null);setResumeFile(null)}}><X/></button></div><div className="form-two"><label><span>Full name</span><div className="field-with-icon"><UserRound size={16}/><input name="name" required defaultValue={user.name}/></div></label><label><span>Email address</span><div className="field-with-icon"><Mail size={16}/><input name="email" type="email" required defaultValue={user.email}/></div></label></div><label className={`resume-drop-field ${resumeFile?"attached":""}`}><input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={event=>{const file=event.target.files?.[0]||null;if(file&&file.size>10*1024*1024){notify("Resume must be 10 MB or smaller.");event.target.value="";setResumeFile(null);return}setResumeFile(file)}}/><div className="resume-drop-icon">{resumeFile?<CheckCircle2 size={23}/>:<Upload size={23}/>}</div><b>{resumeFile?"Resume attached":"Select your resume"}</b>{resumeFile?<><span className="attached-resume-name">{resumeFile.name}</span><small>{resumeFile.name.toLowerCase().endsWith(".pdf")?"PDF document":"Word document"} · {(resumeFile.size/1024/1024).toFixed(2)} MB · Click to replace</small></>:<><span>PDF or DOCX · Maximum 10 MB</span><small>Skills, education, experience, and qualifications are extracted securely.</small></>}</label><label className="message-field"><span>Message to Admin/HR <small>Optional</small></span><textarea name="note" placeholder="Share a short introduction or any relevant information."/></label><div className="privacy-note"><ShieldCheck size={16}/><span>Your original file remains private and is shown only to authorized Admin/HR reviewers.</span></div><div className="modal-actions"><button type="button" className="secondary" disabled={matching} onClick={()=>{setApplying(null);setResumeFile(null)}}>Cancel</button><button className="dark-button upload-analyze-button" disabled={matching||!resumeFile}><Sparkles size={16}/>{matching?"Parsing and matching…":"Analyze and upload"}</button></div>{matching&&<div className="resume-analysis-progress"><div className="progress-orbit" style={{"--progress":analysisProgress} as React.CSSProperties}><span>{analysisProgress}%</span></div><h3>{analysisProgress<30?"Reading your resume":analysisProgress<65?"Extracting skills and qualifications":analysisProgress<95?"Matching open positions":"Resume analysis complete"}</h3><p>{analysisProgress<95?"CareerBridge AI is securely processing your document.":"Your resume is ready to be routed."}</p><div><i style={{width:`${analysisProgress}%`}}/></div><small>Keep this window open until the upload finishes.</small></div>}</form></div>}
  </div>;
}

function ApplicationManagement({role,items,setItems,notify,user}:{role:Role;items:SubmittedApplication[];setItems:React.Dispatch<React.SetStateAction<SubmittedApplication[]>>;notify:(s:string)=>void;user:User}) {
  const [jobFolder,setJobFolder]=useState<string|null>(null);
  const baseVisible=role==="Applicant"?items.filter(x=>x.email.toLowerCase()===user.email.toLowerCase()):items;
  const visible=jobFolder?baseVisible.filter(x=>x.job===jobFolder):baseVisible;
  const [reviewing,setReviewing]=useState<SubmittedApplication|null>(null); const [scheduling,setScheduling]=useState<SubmittedApplication|null>(null);
  const jobNames=[...new Set(baseVisible.map(x=>x.job))];
  return <div className="page-content"><div className="page-heading"><div>{jobFolder&&<button className="folder-back" onClick={()=>setJobFolder(null)}><ArrowLeft size={15}/> All job folders</button>}<div className="eyebrow"><FileText size={14}/> Application workflow</div><h1>{role==="Applicant"?"My applications":jobFolder}</h1><p>{role==="Applicant"?"Track reviews, interviews, and hiring updates.":jobFolder?`Review applications submitted for ${jobFolder}.`:"Applications organized by job posting."}</p></div></div>{role!=="Applicant"&&!jobFolder?<div className="job-folder-grid">{jobNames.map((job,i)=>{const group=baseVisible.filter(x=>x.job===job);const top=Math.max(...group.map(x=>x.score));return <button className={`job-folder-card folder-tone-${i%4}`} key={job} onClick={()=>setJobFolder(job)}><div className="folder-shape"><FolderOpen size={25}/><span>{group.length}</span></div><h3>{job}</h3><p>{group[0]?.office}</p><div><span><b>{group.length}</b> Applications</span><span><b>{top}%</b> Top match</span></div><footer>Open applications <ChevronRight size={15}/></footer></button>})}</div>:<section className="card panel managed-apps">{visible.map(a=><div className="managed-row" key={a.id}><div className="avatar">{a.name.split(" ").map(x=>x[0]).join("")}</div><div><b>{a.name}</b><span>{a.job} · {a.office}</span>{a.interviewDate&&<small className="interview-detail"><CalendarDays size={11}/>{a.interviewDate} at {a.interviewTime} · {a.interviewMethod}</small>}</div><span className={`status ${a.status.toLowerCase().replaceAll(" ","-")}`}>{a.status}</span><b className="managed-score">{a.score}% match</b>{role!=="Applicant"&&<div className="review-actions"><button className={a.reviewed?"completed":""} onClick={()=>setReviewing(a)}>{a.reviewed?<Check size={14}/>:<FileSearch size={14}/>} {a.reviewed?"Reviewed":"Review resume"}</button><button className={a.status==="Interview scheduled"?"scheduled":""} onClick={()=>setScheduling(a)}><CalendarDays size={14}/> {a.status==="Interview scheduled"?"Reschedule":"Schedule interview"}</button></div>}</div>)}{!visible.length&&<div className="empty-jobs"><FileText/><h3>No applications yet</h3><p>Submitted applications will appear here.</p></div>}</section>}
  {reviewing&&<div className="modal-backdrop" onClick={()=>setReviewing(null)}><div className="review-modal card actual-file-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Resume review</h2><p>{reviewing.name} · {reviewing.job}</p></div><button onClick={()=>setReviewing(null)}><X/></button></div><div className="actual-file-grid"><ResumeDocument application={reviewing}/><aside className="candidate-analysis"><div className="analysis-score"><ScoreRing score={reviewing.score}/><div><b>AI match score</b><span>{reviewing.skillScore??reviewing.score}% skills alignment</span></div></div><h3>AI scorer</h3><p>{reviewing.summary||"Analysis is unavailable for this demonstration record."}</p>{reviewing.skills?.length?<div className="parsed-skills">{reviewing.skills.map(skill=><span key={skill}>{skill}</span>)}</div>:null}{[["Skills",reviewing.skillScore??reviewing.score],["Qualifications",reviewing.qualificationScore??reviewing.score]].map(([label,value])=><div className="analysis-factor" key={label}><span>{label}<b>{value}%</b></span><div><i style={{width:`${Number(value)}%`}}/></div></div>)}</aside></div><div className="modal-actions"><button className={`review-confirm ${reviewing.reviewed?"done":""}`} onClick={()=>{const next=!reviewing.reviewed;setItems(items.map(x=>x.id===reviewing.id?{...x,reviewed:next,status:x.status==="Interview scheduled"?x.status:next?"Reviewed":"Under review"}:x));notify(`${reviewing.name} marked as ${next?"reviewed":"unreviewed"}; applicant notified`);setReviewing(null)}}>{reviewing.reviewed?<><X size={15}/>Unreview</>:<><CheckCircle2 size={15}/>Mark as reviewed</>}</button></div></div></div>}
  {scheduling&&<div className="modal-backdrop" onClick={()=>setScheduling(null)}><form className="modal interview-modal card" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);setItems(items.map(x=>x.id===scheduling.id?{...x,status:"Interview scheduled",interviewDate:String(f.get("date")),interviewTime:String(f.get("time")),interviewMethod:String(f.get("method")),interviewLocation:String(f.get("location"))}:x));notify(`Interview scheduled for ${scheduling.name}; applicant notified`);setScheduling(null)}}><div className="modal-head"><div><h2>Schedule interview</h2><p>{scheduling.name} · {scheduling.job}</p></div><button type="button" onClick={()=>setScheduling(null)}><X/></button></div><div className="calendar-banner"><CalendarDays/><div><b>Choose the interview schedule</b><span>The applicant will receive these details immediately.</span></div></div><div className="form-two"><label>Interview date<input name="date" type="date" required defaultValue={scheduling.interviewDate}/></label><label>Start time<input name="time" type="time" required defaultValue={scheduling.interviewTime}/></label></div><label>Interview method<select name="method" required defaultValue={scheduling.interviewMethod||"Google Meet"}><option>Google Meet</option><option>Zoom</option><option>Onsite</option></select></label><label>Meeting link or onsite location<input name="location" required defaultValue={scheduling.interviewLocation} placeholder="Meeting URL, room, or campus address"/></label><label>Interview notes<textarea name="notes" placeholder="Preparation instructions or required documents"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setScheduling(null)}>Cancel</button><button className="primary"><CalendarDays size={15}/> Confirm schedule</button></div></form></div>}
  </div>
}

function CandidatesPage({items,notify,priorityNames}:{items:SubmittedApplication[];notify:(s:string)=>void;priorityNames:string[]}) {
  const all=items.filter(x=>x.score>=80&&(x.skillScore??x.score)>=80).map(x=>priorityNames.includes(x.name)?{...x,status:"Priority",reviewed:false}:x).sort((a,b)=>(Number(priorityNames.includes(b.name))-Number(priorityNames.includes(a.name)))||b.score-a.score);
  const [min,setMin]=useState(0); const [selected,setSelected]=useState<typeof all[0]|null>(null); const [jobFolder,setJobFolder]=useState<string|null>(null);
  const shown=all.filter(x=>x.score>=min&&(!jobFolder||x.job===jobFolder)); const jobNames=[...new Set(all.map(x=>x.job))];
  const exportCsv=()=>{const csv=["Name,Email,Position,Office,Score,Status",...shown.map(x=>`"${x.name}","${x.email}","${x.job}","${x.office}",${x.score},"${x.status}"`)].join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="careerbridge-candidates.csv";a.click();URL.revokeObjectURL(url);notify("Candidate report exported")};
  return <div className="page-content"><div className="page-heading"><div>{jobFolder&&<button className="folder-back" onClick={()=>setJobFolder(null)}><ArrowLeft size={15}/> All candidate folders</button>}<div className="eyebrow"><UsersRound size={14}/> Talent ranking</div><h1>{jobFolder||"Candidates by job"}</h1><p>{jobFolder?"Candidates ranked by best match for this position.":"Open a job folder to view its matched candidates."}</p></div>{jobFolder&&<button className="primary" onClick={exportCsv}><Download size={15}/> Export report</button>}</div>{!jobFolder?<div className="job-folder-grid">{jobNames.map((job,i)=>{const group=all.filter(x=>x.job===job);return <button className={`job-folder-card folder-tone-${i%4}`} key={job} onClick={()=>setJobFolder(job)}><div className="folder-shape"><Folder size={25}/><span>{group.length}</span></div><h3>{job}</h3><p>{group[0]?.office}</p><div><span><b>{group.length}</b> Candidates</span><span><b>{Math.max(...group.map(x=>x.score))}%</b> Best match</span></div><footer>Open candidates <ChevronRight size={15}/></footer></button>})}</div>:<><div className="toolbar card"><div><Search size={16}/><input placeholder="Search candidates..."/></div><select value={min} onChange={e=>setMin(Number(e.target.value))}><option value="0">All match scores</option><option value="80">80% and above</option><option value="90">90% and above</option></select><button onClick={exportCsv}><Download size={15}/> Export</button></div><section className="card panel candidate-report"><div className="candidate-report-head"><span>Candidate</span><span>Position</span><span>Match</span><span>Status</span><span>Action</span></div>{shown.map(x=><div className="candidate-report-row" key={`${x.id}-${x.email}`}><div><div className="avatar">{x.name.split(" ").map(y=>y[0]).join("")}</div><span><b>{x.name}</b><small>{x.email}</small></span></div><span>{x.job}<small>{x.office}</small></span><b className="blue-score">{x.score}%</b><span className={`status ${x.reviewed?"reviewed":x.status.toLowerCase()}`}>{x.reviewed?"Reviewed":x.status}</span><button className="open-candidate" onClick={()=>setSelected(x)}>Open <ChevronRight size={14}/></button></div>)}</section></>}
  {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="candidate-detail card" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{selected.name}</h2><p>{selected.job} · {selected.office}</p></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="candidate-detail-grid"><ResumeDocument application={selected}/><aside className="candidate-analysis"><div className="analysis-score"><ScoreRing score={selected.score}/><div><b>AI match score</b><span>Resume evidence against job requirements</span></div></div><h3>AI scorer</h3><p>{selected.summary||"Analysis is unavailable for this demonstration record."}</p>{[["Skills alignment",selected.skillScore??selected.score],["Qualifications",selected.qualificationScore??selected.score],["Overall match",selected.score]].map(([x,n])=><div className="analysis-factor" key={x}><span>{x}<b>{n}%</b></span><div><i style={{width:`${Number(n)}%`}}/></div></div>)}{selected.skills?.length?<div className="parsed-skills">{selected.skills.map(skill=><span key={skill}>{skill}</span>)}</div>:null}<div className="analysis-note"><CheckCircle2/><p>The score supports review; the original uploaded resume remains the source document.</p></div></aside></div></div></div>}
  </div>;
}

function InterviewsPage({role,items,notify,user}:{role:Role;items:SubmittedApplication[];notify:(s:string)=>void;user:User}) {
  const [selected,setSelected]=useState<SubmittedApplication|null>(null); const [confirmed,setConfirmed]=useState<number[]>([]);
  const scheduled=items.filter(x=>x.status==="Interview scheduled"&&(role!=="Applicant"||x.email.toLowerCase()===user.email.toLowerCase()));
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><CalendarDays size={14}/> Interview schedule</div><h1>Interviews</h1><p>{role==="Applicant"?"Review and confirm your scheduled interviews.":"View all confirmed and upcoming interviews."}</p></div></div><section className="interview-list">{scheduled.map(x=><article className="card interview-list-card" key={x.id}><div className="interview-date-tile"><b>{x.interviewDate?new Date(`${x.interviewDate}T00:00:00`).getDate():"29"}</b><span>{x.interviewDate?new Date(`${x.interviewDate}T00:00:00`).toLocaleString("en",{month:"short"}):"JUL"}</span></div><div><h3>{x.job}</h3><p>{x.name} · {x.office}</p><span><Clock3 size={13}/>{x.interviewTime||"10:30"} · {x.interviewMethod||"Google Meet"}</span></div><span className={`status ${confirmed.includes(x.id)?"reviewed":"interview-scheduled"}`}>{confirmed.includes(x.id)?"Confirmed":"Awaiting confirmation"}</span><div className="interview-card-actions">{role==="Applicant"&&!confirmed.includes(x.id)&&<button className="confirm-interview" onClick={()=>{setConfirmed([...confirmed,x.id]);notify("Interview attendance confirmed; Admin/HR notified")}}><Check size={14}/> Confirm</button>}<button className="open-candidate" onClick={()=>setSelected(x)}>Open <ChevronRight size={14}/></button></div></article>)}</section>
  {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="interview-info-modal card" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Interview information</h2><p>{selected.job}</p></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="interview-info-hero"><CalendarDays/><div><b>{selected.interviewDate||"July 29, 2026"}</b><span>{selected.interviewTime||"10:30 AM"} · {selected.interviewMethod||"Google Meet"}</span></div></div><div className="interview-info-row"><Building2/><span><b>Interviewing office</b><small>{selected.office}</small></span></div><div className="interview-info-row"><Video/><span><b>Where / via</b><small>{selected.interviewLocation||"Meeting link will be shared before the interview."}</small></span></div><div className="interview-notes"><FileText/><div><b>Admin/HR notes</b><p>Please prepare a valid ID, portfolio, and examples of relevant experience. Join the meeting ten minutes early.</p></div></div>{role==="Applicant"&&!confirmed.includes(selected.id)&&<button className="primary full" onClick={()=>{setConfirmed([...confirmed,selected.id]);notify("Interview attendance confirmed");setSelected(null)}}><Check size={15}/> Confirm attendance</button>}</div></div>}
  </div>;
}

function FunctionalPage({ page, role, notify,messages,setMessages,user,submitted,setSubmitted,priorityNames }: { page:string; role:Role; notify:(s:string)=>void;messages:SharedMessage[];setMessages:React.Dispatch<React.SetStateAction<SharedMessage[]>>;user:User;submitted:SubmittedApplication[];setSubmitted:React.Dispatch<React.SetStateAction<SubmittedApplication[]>>;priorityNames:string[] }) {
  if(page==="Messages") return <MessagesPage role={role} messages={messages} setMessages={setMessages} user={user} applicants={submitted}/>;
  if(page==="My applications"||page==="Applications")return <ApplicationManagement role={role} items={submitted} setItems={setSubmitted} notify={notify} user={user}/>;
  if(page==="Candidates")return <CandidatesPage items={submitted} notify={notify} priorityNames={priorityNames}/>;
  if(page==="Interviews")return <InterviewsPage role={role} items={submitted} notify={notify} user={user}/>;
  const [query,setQuery]=useState(""); const [modal,setModal]=useState(false);
  const [rows,setRows]=useState(role==="Administrator"?["Information Technology","Academic Office","Human Resources","Accounting Office"]:role==="Office"?candidates.map(x=>x.name):jobs.map(x=>x.role));
  const copy=pageCopy[page]||[page,"Manage recruitment information and activity."];
  const isJobs=page==="Find jobs"||page==="Job postings"; const isInterview=page==="Interviews";
  const action=isJobs?(role==="Applicant"?"View matched jobs":"Create job posting"):page==="School offices"?"Add school office":page==="Workflows"?"Create workflow":isInterview?"Schedule interview":"Export report";
  const cards=isInterview?["IT Support Specialist · Jul 29, 10:30 AM","Academic Coordinator · Aug 2, 2:00 PM","Junior Accountant · Aug 5, 9:00 AM"]:rows;
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> CareerBridge workspace</div><h1>{copy[0]}</h1><p>{copy[1]}</p></div><button className="primary" onClick={()=>isJobs||page==="School offices"||page==="Workflows"||isInterview?setModal(true):notify("Report exported successfully")}><Plus size={16}/>{action}</button></div>
    <div className="toolbar card"><div><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${page.toLowerCase()}...`}/></div><button onClick={()=>notify("Filters applied")}><Filter size={15}/> Filter</button><button onClick={()=>notify("CSV export prepared")}><Download size={15}/> Export</button></div>
    <section className={`card panel data-page ${isJobs?"job-cards":""}`}>{cards.filter(x=>x.toLowerCase().includes(query.toLowerCase())).map((x,i)=><article key={x} className="data-row">
      <div className="job-logo" style={{background:["#6f73e8","#e58bab","#56b5a7","#efa960"][i%4]}}>{isInterview?<CalendarDays size={19}/>:isJobs?<BriefcaseBusiness size={19}/>:<UserRound size={19}/>}</div><div><b>{x}</b><span>{isJobs?"CareerBridge School · Full-time":isInterview?"Video interview · Confirmed":role==="Administrator"?"Active · Manager assigned":"AI match score: "+(94-i*4)+"%"}</span></div>
      {isJobs&&<ScoreRing score={92-i*4} small/>}<span className="status recommended">{isInterview?"Confirmed":isJobs?"Open":"Active"}</span>
      <button className="secondary" onClick={()=>notify(isJobs&&role==="Applicant"?`Application started for ${x}`:`Opened ${x}`)}>{isJobs&&role==="Applicant"?"Apply":"Open"}</button><button className="dots" onClick={()=>setRows(rows.filter(y=>y!==x))}><Trash2 size={16}/></button>
    </article>)}</section>
    {modal&&<div className="modal-backdrop" onClick={()=>setModal(false)}><form className="modal card" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();setRows([`New ${page.replace(/s$/,"")}`,...rows]);setModal(false);notify(`${page.replace(/s$/,"")} created successfully`);}}><div className="modal-head"><div><h2>{action}</h2><p>Complete the details below to continue.</p></div><button type="button" onClick={()=>setModal(false)}><X/></button></div><label>Title or name<input required placeholder="Enter a descriptive title"/></label><label>Office or department<select required><option>Information Technology</option><option>Human Resources</option><option>Accounting Office</option><option>Academic Office</option></select></label><label>Description<textarea placeholder="Add requirements, instructions, or notes..."/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary">Save and publish</button></div></form></div>}
  </div>;
}

export default function Home() {
  const [user,setUser]=useState<User|null>(null); const [checking,setChecking]=useState(true);
  const [showLogin,setShowLogin]=useState(false);
  const [role, setRole] = useState<Role>("Applicant");
  const [page, setPage] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const [toast,setToast]=useState("");
  const [jobRecords,setJobRecords]=useState<JobRecord[]>(initialJobRecords);
  const [recordsReady,setRecordsReady]=useState(false);
  const [priorityNames,setPriorityNames]=useState<string[]>([]);
  const [registeredApplicants,setRegisteredApplicants]=useState<User[]>([]);
  const [submitted,setSubmitted]=useState<SubmittedApplication[]>([]);
  const [messages,setMessages]=useState<SharedMessage[]>([]);
  useEffect(()=>{
    const savedApplicants=JSON.parse(localStorage.getItem("careerbridge_applicants")||"[]") as User[];setRegisteredApplicants(savedApplicants);
    try{const savedJobs=JSON.parse(localStorage.getItem("careerbridge_job_records")||"[]") as JobRecord[];if(Array.isArray(savedJobs))setJobRecords(savedJobs)}catch{}
    setRecordsReady(true);
    fetch("/api/auth/session").then(r=>r.ok?r.json():null).then(d=>{if(d?.user){const u=d.user.role==="Office"?{...d.user,role:"Administrator" as Role}:d.user;setUser(u);setRole(u.role)}else{const saved=localStorage.getItem("careerbridge_signup_user");if(saved){const u=JSON.parse(saved) as User;setUser(u);setRole(u.role)}}}).finally(()=>setChecking(false))
  },[]);
  useEffect(()=>{if(recordsReady)localStorage.setItem("careerbridge_job_records",JSON.stringify(jobRecords))},[jobRecords,recordsReady]);
  const notify=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),2600)};
  const logout=async()=>{try{await fetch("/api/auth/logout",{method:"POST"})}finally{localStorage.removeItem("careerbridge_signup_user");setUser(null);setShowLogin(true);setPage("Overview")}};
  const content = useMemo(() => {
    if(!user)return null;
    if(role==="Administrator"&&page==="Applicants") return <ApplicantDirectory accounts={registeredApplicants} applications={submitted}/>;
    if(page==="Settings")return <SettingsPage user={user} setUser={setUser} notify={notify}/>;
    if(page==="Job postings"||page==="Find jobs") return <JobPostingsPage role={role} notify={notify} records={jobRecords} setRecords={setJobRecords} setSubmitted={setSubmitted} user={user!}/>;
    if(role==="Administrator"&&page==="AI insights") return <LiveAIInsightsPage items={submitted} notify={notify} priorityNames={priorityNames} setPriorityNames={setPriorityNames}/>;
    if(role==="Administrator"&&page==="Workflows") return <WorkflowPage notify={notify}/>;
    if(page!=="Overview") return <FunctionalPage page={page} role={role} notify={notify} messages={messages} setMessages={setMessages} user={user!} submitted={submitted} setSubmitted={setSubmitted} priorityNames={priorityNames}/>;
    if (role === "Office") return <OfficeHome/>;
    if (role === "Administrator") return <AdminLiveHome jobs={jobRecords} applications={submitted} applicants={registeredApplicants} setPage={setPage}/>;
    return <NewApplicantHome user={user!} setPage={setPage} jobs={jobRecords}/>;
  }, [role,page,jobRecords,submitted,messages,priorityNames,user,registeredApplicants]);
  const switchRole = (r: Role) => { setRole(r==="Office"?"Administrator":r); setPage("Overview"); };
  if(checking)return <div className="loading-screen"><Brand/><span>Loading secure portal…</span></div>;
  if(!user&&!showLogin)return <LandingPage onLogin={()=>setShowLogin(true)}/>;
  if(!user)return <LoginPage onLogin={u=>{
    setUser(u);setRole(u.role);setPage("Overview");setShowLogin(false);
    if(u.email!=="admin@careerbridge.edu"&&u.email!=="applicant@careerbridge.edu"){
      const next=[...new Map([...registeredApplicants,u].map(x=>[x.email.toLowerCase(),x])).values()];setRegisteredApplicants(next);
      try{
        localStorage.setItem("careerbridge_signup_user",JSON.stringify({...u,avatar:undefined}));
        localStorage.setItem("careerbridge_applicants",JSON.stringify(next.map(applicant=>({...applicant,avatar:undefined}))));
      }catch{}
    }
  }}/>;
  const messageCount=messages.filter(m=>m.to===role&&(role!=="Applicant"||m.applicantEmail===user.email)).length;
  return <div className="app-shell" onClick={e=>{const b=(e.target as HTMLElement).closest("button");if(b&&!b.onclick&&!b.closest("form")&&!b.classList.contains("dots"))notify("Action completed")}}>
    <Sidebar role={role} page={page} setPage={setPage} open={menu} close={()=>setMenu(false)} onLogout={logout} user={user} messageCount={messageCount}/><main><Header role={role} setRole={switchRole} onMenu={()=>setMenu(true)} setPage={setPage} notify={notify} user={user} messageCount={messageCount}/>{content}</main>
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}
