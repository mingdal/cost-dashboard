import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

// ── 상수 ──────────────────────────────────────────────────────
const DIVISIONS = ["영업본부", "개발본부", "운영본부", "재무본부", "지원본부"];
const DIV_CODES = {
  "영업본부": "S",
  "개발본부": "D",
  "운영본부": "O",
  "재무본부": "F",
  "지원본부": "G",
};
const DIV_COLORS = ["#2563EB", "#0891B2", "#059669", "#7C3AED", "#D97706"];

// ── 샘플 데이터 생성 ──────────────────────────────────────────
function generateSampleData() {
  const projects = [];
  DIVISIONS.forEach((div, di) => {
    for (let p = 1; p <= 4; p++) {
      const globalIdx = di * 4 + p - 1;
      const id = `P${(globalIdx + 1).toString().padStart(3, "0")}`;
      const base = 50_000 + Math.floor(Math.random() * 150_000);
      const std = base * 1000;

      // P001~P010: 표준원가 초과 / P011~P020: 표준원가 절감
      const over = globalIdx < 10;
      const ratio = over
        ? 1 + (0.03 + Math.random() * 0.22)
        : 1 - (0.03 + Math.random() * 0.18);
      const actual = Math.round(std * ratio);

      const labor       = Math.round(actual * (0.45 + Math.random() * 0.15));
      const expense     = Math.round(actual * (0.15 + Math.random() * 0.10));
      const depreciation= Math.round(actual * (0.10 + Math.random() * 0.08));
      const overhead    = Math.max(0, actual - labor - expense - depreciation);

      projects.push({
        id,
        name: `${DIV_CODES[div]}${p.toString().padStart(3, "0")}`,
        division: div,
        stdCost: std,
        labor,
        expense,
        depreciation,
        overhead,
      });
    }
  });
  return projects;
}

const INITIAL_DATA = generateSampleData();

// ── 유틸 함수 ─────────────────────────────────────────────────
const getActual = (p) =>
  (p.labor || 0) + (p.expense || 0) + (p.depreciation || 0) + (p.overhead || 0);

const fmtPct = (n) =>
  typeof n === "number" ? (n >= 0 ? "+" : "") + n.toFixed(1) + "%" : "-";

const FIELDS = [
  { key: "labor",        label: "인건비" },
  { key: "expense",      label: "경비" },
  { key: "depreciation", label: "감가상각비" },
  { key: "overhead",     label: "공통배부비" },
];

// ── 스타일 ────────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    minHeight: "100vh",
    background: "#f0f2f5",
    color: "#1a1a2e",
  },
  header: {
    background: "#1a2b4a",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.3px",
    margin: 0,
  },
  headerSub: { color: "#7fa8d4", fontSize: 12 },
  tabBar: {
    background: "#1a2b4a",
    display: "flex",
    padding: "0 32px",
    gap: 4,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  tabBtn: (active) => ({
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    color: active ? "#fff" : "#7fa8d4",
    borderBottom: active ? "2px solid #4a9eff" : "2px solid transparent",
    transition: "all 0.15s",
  }),
  body: { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" },
  card: {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e5e9ef",
    padding: "24px 28px",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1a2b4a",
    marginBottom: 16,
    letterSpacing: "-0.2px",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
    marginBottom: 5,
    display: "block",
  },
  select: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 5,
    fontSize: 13,
    background: "#fff",
    color: "#1a1a2e",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 5,
    fontSize: 13,
    textAlign: "right",
    boxSizing: "border-box",
    outline: "none",
    color: "#1a1a2e",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 },
  totalBox: {
    background: "#f0f4ff",
    border: "1px solid #c7d7f4",
    borderRadius: 6,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtn: {
    background: "#1a2b4a",
    color: "#fff",
    border: "none",
    padding: "10px 28px",
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#1a2b4a",
    color: "#b8cde8",
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
  },
  thR: {
    background: "#1a2b4a",
    color: "#b8cde8",
    padding: "10px 14px",
    textAlign: "right",
    fontSize: 12,
    fontWeight: 600,
  },
  td: (even) => ({
    padding: "9px 14px",
    borderBottom: "1px solid #f0f2f5",
    background: even ? "#fafbfc" : "#fff",
    color: "#374151",
  }),
  tdR: (even) => ({
    padding: "9px 14px",
    borderBottom: "1px solid #f0f2f5",
    textAlign: "right",
    background: even ? "#fafbfc" : "#fff",
    color: "#374151",
  }),
  summaryCard: (color) => ({
    background: "#fff",
    border: "1px solid #e5e9ef",
    borderRadius: 8,
    padding: "20px 24px",
    borderTop: `3px solid ${color}`,
  }),
};

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]                     = useState(0);
  const [projects, setProjects]           = useState(INITIAL_DATA);
  const [selectedDiv, setSelectedDiv]     = useState(DIVISIONS[0]);
  const [selectedProject, setSelectedProject] = useState(
    INITIAL_DATA.find((p) => p.division === DIVISIONS[0])?.id || ""
  );
  const [form, setForm] = useState({
    labor: "", expense: "", depreciation: "", overhead: ""
  });
  const [filterDiv, setFilterDiv]         = useState("전체");
  const [saved, setSaved]                 = useState(false);

  // 본부 변경
  function handleDivChange(div) {
    setSelectedDiv(div);
    const first = projects.find((p) => p.division === div);
    if (first) {
      setSelectedProject(first.id);
      setForm({
        labor: first.labor || "",
        expense: first.expense || "",
        depreciation: first.depreciation || "",
        overhead: first.overhead || "",
      });
    }
    setSaved(false);
  }

  // 프로젝트 변경
  function handleProjectChange(id) {
    setSelectedProject(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      setForm({
        labor: p.labor || "",
        expense: p.expense || "",
        depreciation: p.depreciation || "",
        overhead: p.overhead || "",
      });
    }
    setSaved(false);
  }

  // 입력 변경 (천 단위 콤마 처리)
  function handleFormChange(key, val) {
    const num = val.replace(/[^0-9]/g, "");
    setForm((f) => ({ ...f, [key]: num === "" ? "" : Number(num) }));
    setSaved(false);
  }

  // 저장
  function handleSave() {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject
          ? {
              ...p,
              labor:        Number(form.labor)        || 0,
              expense:      Number(form.expense)      || 0,
              depreciation: Number(form.depreciation) || 0,
              overhead:     Number(form.overhead)     || 0,
            }
          : p
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const divProjects     = useMemo(() => projects.filter((p) => p.division === selectedDiv), [projects, selectedDiv]);
  const currentProject  = useMemo(() => projects.find((p) => p.id === selectedProject), [projects, selectedProject]);
  const filteredProjects= useMemo(() => filterDiv === "전체" ? projects : projects.filter((p) => p.division === filterDiv), [projects, filterDiv]);

  const formTotal =
    (Number(form.labor) || 0) +
    (Number(form.expense) || 0) +
    (Number(form.depreciation) || 0) +
    (Number(form.overhead) || 0);

  // 대시보드 계산
  const enriched = useMemo(() =>
    projects.map((p) => {
      const actual = getActual(p);
      const diff   = actual - p.stdCost;
      const rate   = (diff / p.stdCost) * 100;
      return { ...p, actual, diff, rate };
    }),
    [projects]
  );

  const totalActual = enriched.reduce((s, p) => s + p.actual, 0);
  const totalStd    = enriched.reduce((s, p) => s + p.stdCost, 0);
  const totalRate   = ((totalActual - totalStd) / totalStd) * 100;

  const top5 = useMemo(() => [...enriched].sort((a, b) => b.rate - a.rate).slice(0, 5), [enriched]);
  const bot5 = useMemo(() => [...enriched].sort((a, b) => a.rate - b.rate).slice(0, 5), [enriched]);

  const barData = DIVISIONS.map((div, i) => ({
    name: div.replace("본부", ""),
    actual: enriched.filter((p) => p.division === div).reduce((s, p) => s + p.actual, 0),
    color: DIV_COLORS[i],
  }));

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* 헤더 */}
      <header style={S.header}>
        <div>
          <div style={S.headerTitle}>원가/관리회계 시스템</div>
          <div style={S.headerSub}>Cost Management &amp; Variance Analysis</div>
        </div>
        <div style={{ color: "#7fa8d4", fontSize: 12 }}>
          FY2026 · 5개 본부 · 20개 프로젝트
        </div>
      </header>

      {/* 탭바 */}
      <div style={S.tabBar}>
        {["원가 입력", "차이 분석", "대시보드"].map((t, i) => (
          <button key={i} style={S.tabBtn(tab === i)} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      <div style={S.body}>
        {/* ────────── TAB 1: 원가 입력 ────────── */}
        {tab === 0 && (
          <>
            {/* 프로젝트 선택 */}
            <div style={S.card}>
              <div style={S.sectionTitle}>프로젝트 선택</div>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>본부</label>
                  <select style={S.select} value={selectedDiv}
                    onChange={(e) => handleDivChange(e.target.value)}>
                    {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>프로젝트</label>
                  <select style={S.select} value={selectedProject}
                    onChange={(e) => handleProjectChange(e.target.value)}>
                    {divProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.id} · {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 원가 입력 */}
            <div style={S.card}>
              <div style={S.sectionTitle}>원가 항목 입력</div>
              <div style={S.grid4}>
                {FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label style={S.label}>{label}</label>
                    <input
                      type="text"
                      style={S.input}
                      value={form[key] === "" ? "" : Number(form[key]).toLocaleString("ko-KR")}
                      onChange={(e) => handleFormChange(key, e.target.value.replace(/,/g, ""))}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              {/* 합계 */}
              <div style={S.totalBox}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>실제원가 합계</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a2b4a" }}>
                  {formTotal.toLocaleString("ko-KR")}원
                </span>
              </div>

              {/* 미리보기 */}
              {currentProject && (
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6,
                  padding: "10px 16px", fontSize: 12, color: "#64748b",
                  marginBottom: 16, display: "flex", gap: 24,
                }}>
                  <span>표준원가: <strong style={{ color: "#1a2b4a" }}>
                    {currentProject.stdCost.toLocaleString("ko-KR")}원
                  </strong></span>
                  {formTotal > 0 && (() => {
                    const diff = formTotal - currentProject.stdCost;
                    const rate = (diff / currentProject.stdCost) * 100;
                    const color = diff > 0 ? "#dc2626" : "#2563eb";
                    return (
                      <>
                        <span>차이금액: <strong style={{ color }}>
                          {diff > 0 ? "+" : ""}{diff.toLocaleString("ko-KR")}원
                        </strong></span>
                        <span>차이율: <strong style={{ color }}>{fmtPct(rate)}</strong></span>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* 저장 */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
                {saved && <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>✓ 저장되었습니다</span>}
                <button style={S.saveBtn} onClick={handleSave}>저장</button>
              </div>
            </div>
          </>
        )}

        {/* ────────── TAB 2: 차이 분석 ────────── */}
        {tab === 1 && (
          <>
            {/* 필터 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginRight: 4 }}>본부 필터</span>
              {["전체", ...DIVISIONS].map((d) => (
                <button key={d} onClick={() => setFilterDiv(d)} style={{
                  padding: "5px 14px",
                  border: "1px solid",
                  borderColor: filterDiv === d ? "#1a2b4a" : "#d1d5db",
                  borderRadius: 20,
                  background: filterDiv === d ? "#1a2b4a" : "#fff",
                  color: filterDiv === d ? "#fff" : "#6b7280",
                  fontSize: 12,
                  fontWeight: filterDiv === d ? 700 : 400,
                  cursor: "pointer",
                }}>
                  {d}
                </button>
              ))}
            </div>

            {/* 테이블 */}
            <div style={S.card}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>프로젝트</th>
                    <th style={S.th}>본부</th>
                    <th style={S.thR}>표준원가</th>
                    <th style={S.thR}>실제원가</th>
                    <th style={S.thR}>차이금액</th>
                    <th style={S.thR}>차이율</th>
                    <th style={{ ...S.th, textAlign: "center" }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p, i) => {
                    const actual = getActual(p);
                    const diff   = actual - p.stdCost;
                    const rate   = (diff / p.stdCost) * 100;
                    const over   = diff > 0;
                    const even   = i % 2 === 1;
                    const varColor = over ? "#dc2626" : "#2563eb";
                    return (
                      <tr key={p.id}>
                        <td style={S.td(even)}>
                          <span style={{ fontWeight: 600, color: "#1a2b4a" }}>{p.id}</span>
                          <span style={{ color: "#9ca3af", marginLeft: 8 }}>{p.name}</span>
                        </td>
                        <td style={S.td(even)}>
                          <span style={{
                            background: "#eef2ff", color: "#4338ca",
                            borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                          }}>{p.division}</span>
                        </td>
                        <td style={S.tdR(even)}>{(p.stdCost / 1000).toLocaleString("ko-KR")}천</td>
                        <td style={S.tdR(even)}>{(actual / 1000).toLocaleString("ko-KR")}천</td>
                        <td style={{ ...S.tdR(even), color: varColor, fontWeight: 600 }}>
                          {over ? "+" : ""}{(diff / 1000).toLocaleString("ko-KR")}천
                        </td>
                        <td style={{ ...S.tdR(even), color: varColor, fontWeight: 700 }}>
                          {fmtPct(rate)}
                        </td>
                        <td style={{ ...S.td(even), textAlign: "center" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                            background: over ? "#fef2f2" : "#eff6ff",
                            color: varColor,
                          }}>
                            {over ? "초과" : "절감"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ────────── TAB 3: 대시보드 ────────── */}
        {tab === 2 && (
          <>
            {/* 요약 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              <div style={S.summaryCard("#2563eb")}>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>총 실제원가</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a2b4a" }}>
                  {(totalActual / 1_000_000).toFixed(1)}M
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  {totalActual.toLocaleString("ko-KR")}원
                </div>
              </div>
              <div style={S.summaryCard("#059669")}>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>총 표준원가</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a2b4a" }}>
                  {(totalStd / 1_000_000).toFixed(1)}M
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  {totalStd.toLocaleString("ko-KR")}원
                </div>
              </div>
              <div style={S.summaryCard(totalRate > 0 ? "#dc2626" : "#2563eb")}>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>전체 차이율</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: totalRate > 0 ? "#dc2626" : "#2563eb" }}>
                  {fmtPct(totalRate)}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  {totalRate > 0 ? "표준원가 초과" : "표준원가 절감"}
                </div>
              </div>
            </div>

            {/* 막대 그래프 */}
            <div style={{ ...S.card, marginBottom: 24 }}>
              <div style={S.sectionTitle}>본부별 실제원가 현황</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v) => (v / 1_000_000).toFixed(0) + "M"} />
                  <Tooltip
                    formatter={(v) => [(v / 1_000_000).toFixed(2) + "M원", "실제원가"]}
                    contentStyle={{ border: "1px solid #e5e9ef", borderRadius: 6, fontSize: 12 }}
                  />
                  <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 순위 테이블 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { label: "초과 상위 5개 프로젝트", color: "#dc2626", data: top5 },
                { label: "절감 상위 5개 프로젝트", color: "#2563eb", data: bot5 },
              ].map(({ label, color, data }) => (
                <div key={label} style={S.card}>
                  <div style={{ ...S.sectionTitle, color, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    {label}
                  </div>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>프로젝트</th>
                        <th style={S.th}>본부</th>
                        <th style={S.thR}>차이율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((p, i) => (
                        <tr key={p.id}>
                          <td style={S.td(i % 2 === 1)}>
                            <span style={{ fontWeight: 600 }}>{p.id}</span>
                          </td>
                          <td style={S.td(i % 2 === 1)}>
                            <span style={{ fontSize: 11, color: "#6b7280" }}>{p.division}</span>
                          </td>
                          <td style={{ ...S.tdR(i % 2 === 1), color, fontWeight: 700 }}>
                            {fmtPct(p.rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
