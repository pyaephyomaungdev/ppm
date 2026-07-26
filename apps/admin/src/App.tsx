import { useEffect, useState, type FormEvent } from "react";
import { api } from "./lib/api";

type Tab =
  | "profile"
  | "stats"
  | "projects"
  | "experience"
  | "education"
  | "honors"
  | "licenses";

export default function App() {
  const [email, setEmail] = useState<string | null>(null);
  const [boot, setBoot] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void api<{ email: string }>("/api/auth/me")
      .then((m) => setEmail(m.email))
      .catch(() => setEmail(null))
      .finally(() => setBoot(false));
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const m = await api<{ email: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      setEmail(m.email);
    } catch {
      setErr("Login failed");
    }
  }

  async function onLogout() {
    await api("/api/auth/logout", { method: "POST" });
    setEmail(null);
  }

  if (boot) return <p className="p-8 text-sm text-neutral-500">Loading…</p>;

  if (!email) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <h1 className="text-2xl font-semibold">PPM Admin</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to manage portfolio content.</p>
        <form onSubmit={onLogin} className="mt-6 space-y-3">
          <input
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "stats", label: "Stats" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "honors", label: "Honors" },
    { id: "licenses", label: "Licenses" },
  ];

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
        <strong>PPM Admin</strong>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">{email}</span>
          <button type="button" onClick={() => void onLogout()} className="underline">
            Log out
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-5xl gap-6 px-5 py-6">
        <aside className="w-40 shrink-0 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                tab === t.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </aside>
        <main className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white p-5">
          {tab === "profile" ? <ProfileEditor /> : null}
          {tab === "stats" ? <CrudList kind="stats" fields={["label", "value", "sortOrder"]} /> : null}
          {tab === "projects" ? (
            <CrudList
              kind="projects"
              fields={["title", "slug", "summary", "url", "repoUrl", "language", "featured", "sortOrder"]}
            />
          ) : null}
          {tab === "experience" ? <ExperienceEditor /> : null}
          {tab === "education" ? (
            <CrudList
              kind="education"
              fields={["school", "degree", "field", "startDate", "endDate", "url", "sortOrder"]}
            />
          ) : null}
          {tab === "honors" ? (
            <CrudList
              kind="honors"
              fields={["title", "issuer", "date", "description", "url", "sortOrder"]}
            />
          ) : null}
          {tab === "licenses" ? (
            <CrudList
              kind="licenses"
              fields={[
                "name",
                "issuer",
                "issueDate",
                "expiryDate",
                "credentialId",
                "url",
                "sortOrder",
              ]}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function ProfileEditor() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void api<Record<string, string | null>>("/api/admin/profile").then((p) => {
      if (!p) return;
      setForm({
        name: p.name || "",
        handle: p.handle || "",
        headline: p.headline || "",
        avatarUrl: p.avatarUrl || "",
        location: p.location || "",
        emailPublic: p.emailPublic || "",
        githubUrl: p.githubUrl || "",
        websiteUrl: p.websiteUrl || "",
        joinedLabel: p.joinedLabel || "",
        bio: p.bio || "",
      });
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    await api("/api/admin/profile", { method: "PUT", body: JSON.stringify(form) });
    setMsg("Saved");
  }

  const keys = Object.keys(form);
  return (
    <form onSubmit={(e) => void save(e)} className="space-y-3">
      <h2 className="text-lg font-semibold">Profile</h2>
      {keys.map((k) => (
        <label key={k} className="block text-sm">
          <span className="text-neutral-500">{k}</span>
          {k === "bio" ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              rows={4}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          )}
        </label>
      ))}
      <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">
        Save profile
      </button>
      {msg ? <span className="ml-3 text-sm text-green-700">{msg}</span> : null}
    </form>
  );
}

function CrudList({ kind, fields }: { kind: string; fields: string[] }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f, f === "featured" ? "false" : f === "sortOrder" ? "0" : ""])),
  );

  async function reload() {
    setRows(await api(`/api/admin/${kind}`));
  }

  useEffect(() => {
    void reload();
  }, [kind]);

  async function create(e: FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      if (f === "featured") body[f] = draft[f] === "true";
      else if (f === "sortOrder") body[f] = Number(draft[f] || 0);
      else body[f] = draft[f];
    }
    await api(`/api/admin/${kind}`, { method: "POST", body: JSON.stringify(body) });
    await reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await api(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      <h2 className="text-lg font-semibold capitalize">{kind}</h2>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={String(r.id)}
            className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
              {JSON.stringify(r, null, 0)}
            </pre>
            <button type="button" className="text-red-600" onClick={() => void remove(String(r.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => void create(e)} className="mt-6 space-y-2 border-t border-neutral-200 pt-4">
        <h3 className="font-medium">Add</h3>
        {fields.map((f) => (
          <input
            key={f}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder={f}
            value={draft[f]}
            onChange={(e) => setDraft({ ...draft, [f]: e.target.value })}
          />
        ))}
        <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">
          Create
        </button>
      </form>
    </div>
  );
}

function ExperienceEditor() {
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string; logoUrl: string | null; location: string | null; roles: Array<Record<string, unknown>> }>
  >([]);
  const [coName, setCoName] = useState("");
  const [roleDraft, setRoleDraft] = useState({
    companyId: "",
    title: "",
    employmentType: "",
    startDate: "",
    endDate: "",
    skills: "",
  });

  async function reload() {
    setCompanies(await api("/api/admin/experience"));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Experience</h2>
      {companies.map((co) => (
        <div key={co.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
          <div className="flex justify-between">
            <strong>{co.name}</strong>
            <button
              type="button"
              className="text-red-600"
              onClick={() =>
                void api(`/api/admin/experience/companies/${co.id}`, { method: "DELETE" }).then(reload)
              }
            >
              Delete company
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-neutral-600">
            {co.roles.map((r) => (
              <li key={String(r.id)}>
                {String(r.title)} ({String(r.startDate)} – {String(r.endDate || "Present")})
                <button
                  type="button"
                  className="ml-2 text-red-600"
                  onClick={() =>
                    void api(`/api/admin/experience/roles/${r.id}`, { method: "DELETE" }).then(reload)
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <form
        className="space-y-2 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void api("/api/admin/experience/companies", {
            method: "POST",
            body: JSON.stringify({ name: coName, sortOrder: 0 }),
          }).then(() => {
            setCoName("");
            return reload();
          });
        }}
      >
        <h3 className="font-medium">Add company</h3>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Company name"
          value={coName}
          onChange={(e) => setCoName(e.target.value)}
          required
        />
        <button type="submit" className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white">
          Add company
        </button>
      </form>

      <form
        className="space-y-2 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void api("/api/admin/experience/roles", {
            method: "POST",
            body: JSON.stringify({
              companyId: roleDraft.companyId,
              title: roleDraft.title,
              employmentType: roleDraft.employmentType || null,
              startDate: roleDraft.startDate,
              endDate: roleDraft.endDate || null,
              skills: roleDraft.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              sortOrder: 0,
            }),
          }).then(reload);
        }}
      >
        <h3 className="font-medium">Add role</h3>
        <select
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={roleDraft.companyId}
          onChange={(e) => setRoleDraft({ ...roleDraft, companyId: e.target.value })}
          required
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Title"
          value={roleDraft.title}
          onChange={(e) => setRoleDraft({ ...roleDraft, title: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Employment type"
          value={roleDraft.employmentType}
          onChange={(e) => setRoleDraft({ ...roleDraft, employmentType: e.target.value })}
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Start (e.g. Jun 2023)"
          value={roleDraft.startDate}
          onChange={(e) => setRoleDraft({ ...roleDraft, startDate: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="End (blank = Present)"
          value={roleDraft.endDate}
          onChange={(e) => setRoleDraft({ ...roleDraft, endDate: e.target.value })}
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Skills (comma-separated)"
          value={roleDraft.skills}
          onChange={(e) => setRoleDraft({ ...roleDraft, skills: e.target.value })}
        />
        <button type="submit" className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white">
          Add role
        </button>
      </form>
    </div>
  );
}
