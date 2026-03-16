import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  ReferenceLine, LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────
const G = {
  dark:"#1A6B3C", mid:"#2E8B57", light:"#52B788", pale:"#B7E4C7",
  bg:"#F0F7F2", amber:"#E69B1A", red:"#C62828", blue:"#1565C0",
  gray:"#607D8B", orange:"#E65100",
};

// ── Datos ─────────────────────────────────────────────────────────────────
const MODE_PART = [
  { name:"Auto privado",  value:60.0 },
  { name:"Rideshare",     value:32.1 },
  { name:"Colectivo",     value: 3.7 },
  { name:"Bici/A pie",    value: 3.7 },
  { name:"Moto",          value: 0.5 },
];
const MODE_EMIS = [
  { name:"Auto privado", value:75.9, kg:3412 },
  { name:"Rideshare",    value:17.9, kg: 805 },
  { name:"Colectivo",    value: 6.1, kg: 275 },
  { name:"Bici/A pie",   value: 0.0, kg:   0 },
  { name:"Moto",         value: 0.1, kg:   4 },
];
const EMI_PERSONA = [
  { mode:"Colectivo",    kg:34.4, fill:G.amber },
  { mode:"Auto privado", kg: 9.2, fill:G.dark  },
  { mode:"Rideshare",    kg: 4.3, fill:G.mid   },
  { mode:"Moto",         kg: 2.7, fill:G.light },
  { mode:"Bici/A pie",  kg: 0.0, fill:G.pale  },
];
const ESCENARIOS = [
  { label:"Central (n=216 × 46,3×)",       tco2:81.7, fill:G.mid  },
  { label:"Conservador (+15% incert.)",    tco2:94.0, fill:G.dark },
  { label:"Con carpooling a 4 pers.",      tco2:81.0, fill:G.light },
  { label:"Con shuttle oficial",           tco2:74.0, fill:G.amber },
];
const BEVERAGES = [
  { label:"Cocktails/Destilados", pct:63.7 },
  { label:"Cervezas",             pct:43.7 },
  { label:"Sin alcohol",          pct:20.9 },
  { label:"Energizantes",         pct: 5.6 },
];
const ACTIVITIES = [
  { label:"Deporte/Outdoor",  pct:73.5 },
  { label:"Viajes/Turismo",   pct:61.9 },
  { label:"Gastronomia",      pct:40.9 },
  { label:"Arte/Diseño",      pct:11.2 },
  { label:"Gaming/Tech",      pct: 7.4 },
];
const SOCIAL = [
  { name:"Fotos personales",     value:41.4 },
  { name:"Stories/Reels/TikTok", value:29.3 },
  { name:"Desconectado",         value:23.3 },
  { name:"Chat amigos",          value: 6.0 },
];
const TELCO = [
  { name:"Claro",    value:53.2 },
  { name:"Personal", value:37.9 },
  { name:"Movistar", value: 4.9 },
  { name:"Otra",     value: 3.9 },
];
const RADAR_DATA = [
  { activity:"Deporte",     asistente:74, sponsor:90 },
  { activity:"Turismo",     asistente:62, sponsor:80 },
  { activity:"Gastronomia", asistente:41, sponsor:75 },
  { activity:"Destilados",  asistente:64, sponsor:85 },
  { activity:"Cervezas",    asistente:44, sponsor:70 },
  { activity:"UGC digital", asistente:29, sponsor:65 },
];
const ME_CURVE = (() => {
  const pts = [];
  for (let n = 50; n <= 600; n += 5) {
    const fpc = Math.sqrt(1 - n / 10000);
    pts.push({ n, me: parseFloat((1.96 * Math.sqrt(0.25/n) * fpc * 100).toFixed(2)) });
  }
  return pts;
})();
const ISRAEL = [
  { margen:"±5%",  n95:278 },
  { margen:"±7%",  n95:192 },
  { margen:"±10%", n95: 95 },
];

// Equivalencias
const TOTAL_T   = 94.0;
const AVG_KG    = 8.17;
const N_VUELOS  = 303;
const TREES_30  = 157;
const TREES_10  = 470;
const KM_EQUIV  = 49;

const MC = [G.dark, G.mid, G.light, G.pale, G.amber];
const EC = [G.red,  G.amber, G.light, G.pale, G.gray];

// ── Helpers ────────────────────────────────────────────────────────────────
const pctLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.03) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r*Math.cos(-midAngle*R)} y={cy + r*Math.sin(-midAngle*R)}
          fill="white" textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight="bold">
      {`${(percent*100).toFixed(1)}%`}
    </text>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:"#fff", borderRadius:12, padding:"20px 24px",
    boxShadow:"0 2px 12px rgba(0,0,0,0.07)", border:`1px solid ${G.pale}`, ...style }}>
    {children}
  </div>
);

const Title = ({ children, sub }) => (
  <div style={{ marginBottom:12 }}>
    <h2 style={{ margin:0, color:G.dark, fontSize:17, fontWeight:800 }}>{children}</h2>
    {sub && <p style={{ margin:"3px 0 0", color:G.gray, fontSize:11 }}>{sub}</p>}
  </div>
);

const Note = ({ type="info", children }) => {
  const s = {
    info:   { bg:"#E3F2FD", border:G.blue,  icon:"💡" },
    ok:     { bg:"#E8F5E9", border:G.dark,  icon:"✅" },
    warn:   { bg:"#FFF8E1", border:G.amber, icon:"⚠️" },
    strong: { bg:G.bg,      border:G.dark,  icon:"📌" },
    cite:   { bg:"#F3E5F5", border:"#7B1FA2", icon:"📚" },
  }[type];
  return (
    <div style={{ background:s.bg, borderLeft:`4px solid ${s.border}`,
      borderRadius:"0 8px 8px 0", padding:"10px 14px", marginTop:10, fontSize:12, color:"#333" }}>
      {s.icon} {children}
    </div>
  );
};

const EqRow = ({ icon, value, label, source }) => (
  <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"12px 14px",
    background:G.bg, borderRadius:10, marginBottom:10, borderLeft:`4px solid ${G.dark}` }}>
    <div style={{ fontSize:34, flexShrink:0 }}>{icon}</div>
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:900, fontSize:20, color:G.dark }}>{value}</div>
      <div style={{ fontSize:13, color:"#333", marginTop:2 }}>{label}</div>
      <div style={{ fontSize:10, color:G.gray, marginTop:4, fontStyle:"italic", lineHeight:1.5 }}>{source}</div>
    </div>
  </div>
);

const Ref = ({ tag, text, uso }) => (
  <div style={{ background:G.bg, borderRadius:8, padding:"10px 14px",
    borderLeft:`3px solid ${G.mid}`, marginBottom:8 }}>
    <div style={{ fontWeight:800, color:G.dark, fontSize:13 }}>{tag}</div>
    <div style={{ fontSize:12, color:"#333", fontFamily:"Georgia,serif", lineHeight:1.6, margin:"4px 0" }}>{text}</div>
    <div style={{ fontSize:11, color:G.gray, fontStyle:"italic" }}>Uso: {uso}</div>
  </div>
);

// ── Sponsor card ────────────────────────────────────────────────────────────
const SponsorCard = ({ cat, color, fit, marcas, insight }) => (
  <div style={{ border:`2px solid ${color}20`, borderLeft:`4px solid ${color}`,
    borderRadius:10, padding:"14px 16px", background:"#fff" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
      <div>
        <div style={{ fontWeight:800, fontSize:14, color }}>{cat}</div>
        <div style={{ fontSize:11, color:G.gray, marginTop:2 }}>{fit}</div>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {marcas.map(m => (
          <span key={m} style={{ background:`${color}18`, color, borderRadius:20,
            padding:"3px 11px", fontSize:11, fontWeight:600 }}>{m}</span>
        ))}
      </div>
    </div>
    <div style={{ marginTop:9, fontSize:12, color:"#555", fontStyle:"italic",
      borderTop:`1px solid ${color}20`, paddingTop:8 }}>
      💡 {insight}
    </div>
  </div>
);

// ── Custom radar legend (avoids overlap) ────────────────────────────────────
const RadarLegend = () => (
  <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:8 }}>
    {[
      { color:G.mid,   label:"Afinidad asistente (%)" },
      { color:G.amber, label:"Potencial de activación (est.)" },
    ].map(({ color, label }) => (
      <div key={label} style={{ display:"flex", alignItems:"center", gap:7 }}>
        <div style={{ width:14, height:14, borderRadius:3,
          background:`${color}55`, border:`2px solid ${color}` }} />
        <span style={{ fontSize:12, color:"#444", fontWeight:600 }}>{label}</span>
      </div>
    ))}
  </div>
);

const TABS = ["🚗 Transporte","🌿 Equivalencias","📐 Marco Estadístico","🎯 Comportamiento","📱 Sponsors"];

// ── KPI header icons map ────────────────────────────────────────────────────
const KPI_ICONS = ["👥","📋","📏","⚠️","🌍","🛡️","🧍","🌳"];

export default function LandiaV3() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ fontFamily:"Arial, sans-serif", background:G.bg, minHeight:"100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:`linear-gradient(135deg, ${G.dark} 0%, #0D4A2A 100%)`,
        padding:"22px 20px 18px", color:"#fff" }}>
        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, opacity:.8 }}>
          Festival Landia · Villa Allende, Córdoba · Marzo 2026
        </div>
        <h1 style={{ margin:"5px 0 4px", fontSize:23, fontWeight:900, letterSpacing:-.3 }}>
          Auditoría de Huella de Carbono
        </h1>
        <div style={{ fontSize:12, opacity:.85 }}>
          Scope 3 Cat. 7 · Desplazamiento de Asistentes · GHG Protocol / ISO 20121:2024
        </div>

        {/* KPI strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:16 }}>
          {[
            { icon:"👥", val:"10.000",   lbl:"Asistentes" },
            { icon:"📋", val:"n = 216",  lbl:"Muestra válida" },
            { icon:"📏", val:"46,3×",    lbl:"Factor escala" },
            { icon:"⚠️", val:"±6,6%",   lbl:"Margen IC 95%" },
            { icon:"🌍", val:"81,7 t",   lbl:"CO₂e central" },
            { icon:"🛡️", val:"94,0 t",  lbl:"CO₂e conserv." },
            { icon:"🧍", val:"8,2 kg",   lbl:"Por asistente" },
            { icon:"🌳", val:"~157",      lbl:"Algarrobos 30a" },
          ].map(({ icon, val, lbl }) => (
            <div key={lbl} style={{ background:"rgba(255,255,255,0.15)",
              borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
              <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
              <div style={{ fontWeight:900, fontSize:16, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:9, opacity:.85, marginTop:3, lineHeight:1.2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Algarrobo callout */}
        <div style={{ marginTop:12, background:"rgba(255,255,255,0.12)",
          borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:28 }}>🌳</span>
          <div>
            <div style={{ fontSize:12, fontWeight:700 }}>
              La huella total equivale a la absorción de{" "}
              <span style={{ fontSize:16, fontWeight:900 }}>157 algarrobos adultos</span>{" "}
              durante 30 años
            </div>
            <div style={{ fontSize:10, opacity:.8, marginTop:2 }}>
              Prosopis alba · 20 kg CO₂/árbol/año (rango 10–30 kg, Espinal entrerriano — Scielo AR, 2021 + Fundación Aquae)
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", background:"#fff",
        borderBottom:`2px solid ${G.pale}`, overflowX:"auto" }}>
        {TABS.map((t,i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex:1, padding:"12px 6px", border:"none", cursor:"pointer",
            background: tab===i ? G.bg : "#fff",
            borderBottom: tab===i ? `3px solid ${G.dark}` : "3px solid transparent",
            color: tab===i ? G.dark : "#555",
            fontWeight: tab===i ? 800 : 500,
            fontSize:11, whiteSpace:"nowrap", minWidth:80
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding:"20px 14px", maxWidth:900, margin:"0 auto" }}>

        {/* ════════════════════ TAB 0: TRANSPORTE ═══════════════════════ */}
        {tab === 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Card>
              <Title sub="n=216 encuestas extrapoladas a 10.000 asistentes (ratio 46,3×)">
                Modo de transporte: participación vs. emisiones
              </Title>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:14 }}>
                {[
                  { title:"% Asistentes", data:MODE_PART, colors:MC },
                  { title:"% Emisiones CO₂e", data:MODE_EMIS, colors:EC },
                ].map(({ title, data, colors }, idx) => (
                  <div key={title} style={{ flex:1, minWidth:220 }}>
                    <div style={{ textAlign:"center", fontSize:12, fontWeight:700,
                      color:G.gray, marginBottom:4 }}>{title}</div>
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie data={data} cx="50%" cy="50%" outerRadius={85}
                             dataKey="value" labelLine={false} label={pctLabel}>
                          {data.map((_,i) => <Cell key={i} fill={colors[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v,n,p) =>
                          idx===1
                            ? [`${v}% (${p.payload.kg} kg CO₂e)`, "Emisiones"]
                            : [`${v}%`, "Asistentes"]
                        } />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6, justifyContent:"center" }}>
                {MODE_PART.map((d,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                    <div style={{ width:11, height:11, borderRadius:2, background:MC[i] }} />
                    <span style={{ color:"#444" }}>{d.name}</span>
                  </div>
                ))}
              </div>
              <Note type="warn">
                El auto privado transporta al <strong>60%</strong> de asistentes pero genera el{" "}
                <strong>76% de las emisiones</strong>. El colectivo, aunque solo el 3,7% de la muestra,
                tiene la mayor huella individual (34,4 kg/persona) por las mayores distancias de origen (prom. 331 km R/T).
              </Note>
            </Card>

            <Card>
              <Title sub="kg CO₂e por persona, viaje redondo origen → venue → origen">
                Emisión media por pasajero según modo
              </Title>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={EMI_PERSONA} layout="vertical"
                          margin={{ left:20, right:60, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit=" kg" fontSize={11} />
                  <YAxis type="category" dataKey="mode" width={85} fontSize={12} />
                  <Tooltip formatter={v => [`${v} kg CO₂e`, "Por persona"]} />
                  <Bar dataKey="kg" radius={[0,6,6,0]}>
                    {EMI_PERSONA.map((d,i) => <Cell key={i} fill={d.fill} />)}
                    <LabelList dataKey="kg" position="right"
                               formatter={v => `${v} kg`}
                               style={{ fontSize:12, fontWeight:700, fill:"#333" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Note type="strong">
                Factor fuente: UK Government GHG Conversion Factors 2025 (DECCA/DEFRA).
                Auto/Rideshare: <strong>0,167 kg CO₂e/vehículo-km</strong>.
                Colectivo: <strong>0,104 kg CO₂e/pax-km</strong>. Moto: <strong>0,114 kg CO₂e/veh-km</strong>.
              </Note>
            </Card>

            <Card>
              <Title sub="Extrapolado a 10.000 asistentes — potencial de reducción por iniciativa">
                Escenarios de huella total
              </Title>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ESCENARIOS} layout="vertical"
                          margin={{ left:20, right:80, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit=" t" fontSize={11} domain={[0,110]} />
                  <YAxis type="category" dataKey="label" width={170} fontSize={10} />
                  <Tooltip formatter={v => [`${v} tCO₂e`, "Emisiones"]} />
                  <Bar dataKey="tco2" radius={[0,6,6,0]}>
                    {ESCENARIOS.map((d,i) => <Cell key={i} fill={d.fill} />)}
                    <LabelList dataKey="tco2" position="right"
                               formatter={v => `${v} t`}
                               style={{ fontSize:12, fontWeight:700, fill:"#333" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ════════════════════ TAB 1: EQUIVALENCIAS ════════════════════ */}
        {tab === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Card style={{ background:`linear-gradient(135deg,${G.dark},#0D4A2A)`, color:"#fff" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, opacity:.85, textTransform:"uppercase", letterSpacing:1 }}>
                  Huella total del evento · escenario conservador
                </div>
                <div style={{ fontSize:66, fontWeight:900, lineHeight:1, margin:"10px 0 4px" }}>93,98</div>
                <div style={{ fontSize:22, fontWeight:700, opacity:.9 }}>tCO₂e</div>
                <div style={{ fontSize:12, marginTop:6, opacity:.8 }}>
                  = 93.984 kg CO₂e · 8,17 kg/asistente · n=216 × 46,3×
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:18, justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { v:"81,7 t",  l:"Valor central" },
                  { v:"+15%",    l:"Incertidumbre declarada" },
                  { v:"n=216",   l:"Muestra" },
                ].map(({ v, l }) => (
                  <div key={l} style={{ background:"rgba(255,255,255,0.18)",
                    borderRadius:8, padding:"10px 20px", textAlign:"center" }}>
                    <div style={{ fontWeight:900, fontSize:20 }}>{v}</div>
                    <div style={{ fontSize:10, opacity:.8 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <Title sub="¿Qué significa 94 tCO₂e? Equivalencias comprensibles — con fuente para cada una">
                Equivalencias de la huella total
              </Title>
              <div style={{ marginTop:14 }}>
                <EqRow icon="✈️" value={`${N_VUELOS} vuelos`}
                  label="Equivale a 303 vuelos de ida y vuelta Buenos Aires → Córdoba en clase turista (310 kg CO₂e c/u)"
                  source="Factor: UK DECCA 2025, Short-haul domestic with Radiative Forcing — 0,22928 kg CO₂e/pax-km. BA-CBA: 677 km OW × 2 = 1.354 km RT. 1.354 × 0,229 = 310 kg CO₂e/persona. 93.984 / 310 = 303 vuelos." />
                <EqRow icon="🌳" value={`${TREES_30} algarrobos`}
                  label="Absorción de 157 algarrobos adultos (Prosopis alba) durante 30 años completos"
                  source="Bosques del Espinal, Entre Ríos (Scielo Argentina, 2021): 1,91–4,95 tCO₂/ha/año. ~200 árboles adultos/ha → 10–25 kg CO₂/árbol/año. Fundación Aquae: rango 10-30 kg/árbol/año. Valor conservador: 20 kg/árbol/año. 93.984 / 20 / 30 = 157 árboles." />
                <EqRow icon="🌱" value={`${TREES_10} algarrobos`}
                  label="O bien: 470 algarrobos absorbiendo CO₂ durante 10 años"
                  source="Misma fuente. 93.984 / 20 / 10 = 470 árboles." />
                <EqRow icon="🚘" value={`${KM_EQUIV} km por asistente`}
                  label="La emisión promedio por persona (8,17 kg CO₂e) equivale a conducir 49 km solo en auto"
                  source="UK DECCA 2025 — average car, unknown fuel: 0,16725 kg CO₂e/km. 8,17 / 0,167 = 48,9 km." />
              </div>
              <Note type="warn">
                Las equivalencias con algarrobos son orientativas para comunicación pública.
                El valor de 20 kg CO₂/árbol/año es conservador dentro del rango bibliográfico
                y aplica a árboles adultos (más de 10 años). Prosopis alba es especie nativa del Chaco y Espinal argentino.
              </Note>
            </Card>

            <Card>
              <Title sub="Años de absorción necesarios (base: 20 kg CO₂/árbol adulto/año)">
                ¿Cuántos algarrobos para compensar la huella?
              </Title>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { años:"1 año",   árboles:4699 },
                  { años:"5 años",  árboles:940  },
                  { años:"10 años", árboles:470  },
                  { años:"20 años", árboles:235  },
                  { años:"30 años", árboles:157  },
                ]} margin={{ left:10, right:80, top:10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="años" fontSize={12} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={v => [`${v.toLocaleString()} algarrobos`, "Necesarios"]} />
                  <Bar dataKey="árboles" fill={G.mid} radius={[6,6,0,0]}>
                    <LabelList dataKey="árboles" position="top"
                               formatter={v => v.toLocaleString()}
                               style={{ fontSize:11, fontWeight:700, fill:G.dark }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize:10, color:G.gray, textAlign:"center", marginTop:6 }}>
                Fuente: Bosques del Espinal, Entre Ríos (Scielo AR, 2021) · Fundación Aquae
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════ TAB 2: MARCO ESTADÍSTICO ════════════════ */}
        {tab === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Parámetros clave */}
            <Card>
              <Title>La extrapolación: n=216 directamente a N=10.000</Title>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
                {[
                  { l:"Muestra válida",          v:"n = 216",    c:G.dark  },
                  { l:"Población total",          v:"N = 10.000", c:G.dark  },
                  { l:"Factor de escala",         v:"46,3×",      c:G.mid   },
                  { l:"Margen error IC 95%",      v:"±6,60%",     c:G.mid   },
                  { l:"FPC aplicada",             v:"0,9891",     c:G.light },
                  { l:"Incertidumbre declarada",  v:"+15%",       c:G.amber },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background:G.bg, borderRadius:8, padding:"10px 14px",
                    borderLeft:`3px solid ${c}` }}>
                    <div style={{ fontSize:11, color:G.gray }}>{l}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sobre la incertidumbre del +15% — versión honesta */}
            <Card style={{ borderLeft:`4px solid ${G.amber}` }}>
              <Title>¿Qué significa el +15% de incertidumbre?</Title>
              <p style={{ fontSize:13, color:"#333", lineHeight:1.7, margin:"8px 0" }}>
                El valor central calculado (81,73 tCO₂e) se reporta también en su versión conservadora
                de <strong>93,98 tCO₂e</strong>, incorporando un factor de incertidumbre del <strong>+15%</strong>.
                Este margen no es un requisito numérico fijo de ninguna norma, sino una
                práctica metodológica que responde a varios principios:
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
                {[
                  {
                    icon:"📐",
                    title:"Principio de exactitud e integridad (ISO 14064-1:2018)",
                    text:"La norma exige cuantificar y reportar la incertidumbre del inventario — no establece un porcentaje específico. El +15% es la elección metodológica de este estudio para cumplir con ese principio de forma conservadora y transparente.",
                  },
                  {
                    icon:"📊",
                    title:"Margen estadístico de la muestra",
                    text:`La muestra de n=216 tiene un margen de error de ±6,60% (IC 95%). El +15% cubre holgadamente esta incertidumbre muestral más posibles variaciones en los factores de emisión aplicados (UK DECCA 2025 en contexto argentino).`,
                  },
                  {
                    icon:"🛡️",
                    title:"Conservadurismo defensible",
                    text:"Reportar el valor conservador (+15%) en lugar del central es una decisión de transparencia: preferimos declarar más que menos. Esto es coherente con el principio de pertinencia y precaución del GHG Protocol.",
                  },
                ].map(({ icon, title, text }) => (
                  <div key={title} style={{ display:"flex", gap:12, padding:"12px 14px",
                    background:G.bg, borderRadius:10, borderLeft:`3px solid ${G.amber}` }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:G.dark }}>{title}</div>
                      <div style={{ fontSize:12, color:"#555", marginTop:3, lineHeight:1.6 }}>{text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Note type="cite">
                <strong>ISO 14064-1:2018</strong> establece principios de pertinencia, integridad, coherencia,
                exactitud y transparencia para inventarios GHG. La norma exige que la organización
                cuantifique y reporte su incertidumbre, pero <em>no prescribe</em> un porcentaje de buffer obligatorio.
                El +15% aplicado aquí es una decisión metodológica conservadora y declarada explícitamente,
                no una exigencia universal de la norma.
              </Note>
            </Card>

            {/* Curva margen error */}
            <Card>
              <Title sub="IC 95%, p=0,5, N=10.000, con corrección de población finita (FPC)">
                Curva margen de error vs. tamaño de muestra
              </Title>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ME_CURVE} margin={{ left:10, right:40, top:10, bottom:20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" label={{ value:"n (encuestas)", position:"insideBottom",
                    offset:-10, fontSize:11 }} fontSize={11} />
                  <YAxis domain={[0,18]} unit="%" label={{ value:"Margen (%)",
                    angle:-90, position:"insideLeft", fontSize:11 }} fontSize={11} />
                  <Tooltip formatter={v => [`±${v}%`,"Margen"]} labelFormatter={v=>`n=${v}`} />
                  <ReferenceLine x={216} stroke={G.dark} strokeWidth={2.5} strokeDasharray="5 4"
                    label={{ value:"n=216 → ±6,60%", position:"top",
                      fill:G.dark, fontSize:11, fontWeight:700 }} />
                  <ReferenceLine y={7} stroke="#bbb" strokeWidth={1} strokeDasharray="3 3"
                    label={{ value:"±7% (Israel, Glenn D. 1992: n=192)", position:"right",
                      fill:"#999", fontSize:10 }} />
                  <ReferenceLine y={5} stroke="#ddd" strokeWidth={1} strokeDasharray="3 3"
                    label={{ value:"±5% (n=278)", position:"right", fill:"#bbb", fontSize:10 }} />
                  <Line type="monotone" dataKey="me" stroke={G.dark}
                        strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <Note type="ok">
                n=216 produce ±6,60% (IC 95%) — supera el umbral de{" "}
                <strong>Israel, Glenn D. (1992)</strong> para ±7% (n_req=192) y cumple el
                criterio mínimo de <strong>Cochran (1977)</strong> (n≥200).
              </Note>
            </Card>

            {/* Israel table */}
            <Card>
              <Title sub="Israel, Glenn D. (1992). Determining Sample Size. UF/IFAS Extension — referencia estándar en investigación social aplicada">
                Israel, Glenn D. (1992): ¿cuánta muestra para N=10.000?
              </Title>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ISRAEL} margin={{ left:10, right:80, top:10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="margen" fontSize={12} />
                  <YAxis fontSize={11} domain={[0,330]} />
                  <Tooltip formatter={v => [`n=${v}`, "Muestra requerida IC 95%"]} />
                  <ReferenceLine y={216} stroke={G.dark} strokeWidth={2.5} strokeDasharray="6 4"
                    label={{ value:"n=216 este estudio", position:"insideTopRight",
                      fill:G.dark, fontSize:11, fontWeight:700 }} />
                  <Bar dataKey="n95" name="n requerido (IC 95%)" fill={G.mid} radius={[6,6,0,0]}>
                    <LabelList dataKey="n95" position="top"
                               style={{ fontSize:12, fontWeight:700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Note type="ok">
                Con n=216 superamos el requisito de{" "}
                <strong>Israel, Glenn D. (1992)</strong> para ±7% (n=192 requerido).
                A 62 encuestas de alcanzar ±5% (n=278). Zona de precisión aceptable
                para auditorías de campo en eventos.
              </Note>
            </Card>

            {/* Texto oficial */}
            <Card>
              <Title>Declaración metodológica oficial — texto listo para usar</Title>
              <div style={{ background:G.bg, borderRadius:8, padding:"16px 18px",
                fontFamily:"Georgia,serif", fontSize:13, lineHeight:1.9, color:"#222",
                marginTop:12, border:`1px solid ${G.pale}` }}>
                <em>
                  "La cuantificación de emisiones se realizó mediante encuesta de campo
                  (<strong>n=216</strong>) con metodología de muestreo por conveniencia
                  conforme GHG Protocol S3 Cat. 7 (WRI, 2013). La muestra supera el umbral
                  de <strong>Israel, Glenn D. (1992)</strong> para ±7% (n=192 requerido) y
                  el criterio mínimo de <strong>Cochran (1977)</strong> (n≥200), con
                  <strong> margen de error de ±6,60% (IC 95%)</strong>, corrección de
                  población finita aplicada (FPC=0,9891). Los resultados se extrapolaron a
                  los <strong>10.000 asistentes</strong> mediante escala directa (ratio
                  46,3×), bajo supuesto Missing at Random (MAR) para los no-encuestados
                  (Groves et al., 2009). Se reporta adicionalmente un escenario conservador
                  con un factor de incertidumbre del +15% sobre el valor central, aplicado
                  como práctica metodológica prudente en cumplimiento del principio de
                  exactitud de la <strong>ISO 14064-1:2018</strong> — no como requisito
                  normativo de porcentaje fijo."
                </em>
              </div>

              <div style={{ marginTop:16 }}>
                <div style={{ fontWeight:800, color:G.dark, fontSize:14, marginBottom:10 }}>
                  Referencias bibliográficas
                </div>
                <Ref tag="[1] Israel, Glenn D. (1992)" uso="Criterio n mínimo para N=10.000"
                  text="Israel, Glenn D. (1992). Determining Sample Size. PEOD-6. University of Florida/IFAS Extension. https://edis.ifas.ufl.edu/publication/PD006" />
                <Ref tag="[2] Krejcie & Morgan (1970)" uso="Tabla de referencia muestral"
                  text="Krejcie, R.V. & Morgan, D.W. (1970). Determining Sample Size for Research Activities. Educational and Psychological Measurement, 30(3), 607–610." />
                <Ref tag="[3] Cochran (1977)" uso="n≥200 como mínimo descriptivo IC 95%"
                  text="Cochran, W.G. (1977). Sampling Techniques (3ra ed.). John Wiley & Sons." />
                <Ref tag="[4] Groves et al. (2009)" uso="Supuesto MAR para no-respondentes"
                  text="Groves, R.M. et al. (2009). Survey Methodology (2nd ed.). John Wiley & Sons." />
                <Ref tag="[5] GHG Protocol S3 Cat. 7 (WRI, 2013)" uso="Metodología de encuesta para Cat. 7"
                  text="WRI/WBCSD (2013). Technical Guidance for Calculating Scope 3 Emissions — Category 7: Employee Commuting." />
                <Ref tag="[6] ISO 14064-1:2018" uso="Principios de cuantificación y reporte de GEI (pertinencia, exactitud, transparencia)"
                  text="ISO 14064-1:2018. Greenhouse gases — Part 1: Specification with guidance for quantification and reporting of GHG emissions." />
                <Ref tag="[7] ISO 20121:2024" uso="Marco de gestión sostenible del evento"
                  text="ISO 20121:2024. Event sustainability management systems — Requirements with guidance for use." />
                <Ref tag="[8] UK DECCA 2025" uso="Factores de emisión por modo de transporte"
                  text="UK DESNZ (2025). Greenhouse Gas Reporting: Conversion Factors 2025. UK Government / DECCA." />
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════ TAB 3: COMPORTAMIENTO ══════════════════ */}
        {tab === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Card>
              <Title sub="Respuesta múltiple (hasta 2). n=216">
                Preferencias de bebidas en eventos
              </Title>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={BEVERAGES} layout="vertical"
                          margin={{ left:10, right:70, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} unit="%" fontSize={11} />
                  <YAxis type="category" dataKey="label" width={145} fontSize={12} />
                  <Tooltip formatter={v => [`${v}%`, "Asistentes"]} />
                  <Bar dataKey="pct" radius={[0,6,6,0]}>
                    {BEVERAGES.map((_,i) => (
                      <Cell key={i} fill={[G.dark,G.mid,G.light,G.amber][i]} />
                    ))}
                    <LabelList dataKey="pct" position="right" formatter={v=>`${v}%`}
                               style={{ fontSize:12, fontWeight:700, fill:"#333" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Note type="info">
                Destilados + cócteles lideran con <strong>63,7%</strong> —
                mayor categoría de consumo. Oportunidad premium para Fernet Branca,
                Gin artesanal local, Aperol.
              </Note>
            </Card>

            <Card>
              <Title sub="Respuesta múltiple (hasta 3). n=216">
                Actividades en tiempo libre
              </Title>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ACTIVITIES} layout="vertical"
                          margin={{ left:10, right:70, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} unit="%" fontSize={11} />
                  <YAxis type="category" dataKey="label" width={145} fontSize={12} />
                  <Tooltip formatter={v => [`${v}%`, "Asistentes"]} />
                  <Bar dataKey="pct" radius={[0,6,6,0]}>
                    {ACTIVITIES.map((_,i) => (
                      <Cell key={i} fill={[G.dark,G.mid,G.light,G.amber,G.gray][i]} />
                    ))}
                    <LabelList dataKey="pct" position="right" formatter={v=>`${v}%`}
                               style={{ fontSize:12, fontWeight:700, fill:"#333" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Note type="ok">
                <strong>Deporte y outdoor 73,5%</strong> — categoría #1.
                Mayor potencial de activación con sponsors de indumentaria, calzado y wellness.
              </Note>
            </Card>

            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              {[
                { title:"Comportamiento digital",  data:SOCIAL,
                  colors:[G.dark, G.mid, G.amber, G.light] },
                { title:"Operadora de telefonía",  data:TELCO,
                  colors:[G.dark, G.mid, G.light, G.pale] },
              ].map(({ title, data, colors }) => (
                <Card key={title} style={{ flex:1, minWidth:220 }}>
                  <Title sub="n=216">{title}</Title>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" outerRadius={75}
                           dataKey="value" labelLine={false} label={pctLabel}>
                        {data.map((_,i) => <Cell key={i} fill={colors[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v,n,p) => [`${v}%`, p.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {data.map((d,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                        <div style={{ width:10, height:10, borderRadius:2,
                          background:colors[i], flexShrink:0 }} />
                        <span>{d.name} — <strong>{d.value}%</strong></span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 4: SPONSORS ════════════════════════ */}
        {tab === 4 && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Radar — con legend separado para evitar overlap */}
            <Card>
              <Title sub="Afinidad del perfil del asistente vs. potencial de activación — sobre 100">
                Radar de oportunidades para sponsors
              </Title>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart
                  data={RADAR_DATA}
                  cx="50%" cy="48%"
                  outerRadius={105}
                  margin={{ top:10, right:30, bottom:10, left:30 }}
                >
                  <PolarGrid stroke={G.pale} />
                  <PolarAngleAxis
                    dataKey="activity"
                    fontSize={12}
                    tick={{ fill:"#444", fontWeight:600 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    fontSize={9}
                    angle={90}
                    tickCount={5}
                    tick={{ fill:G.gray }}
                  />
                  <Radar
                    name="Afinidad asistente (%)"
                    dataKey="asistente"
                    stroke={G.mid}
                    fill={G.mid}
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Potencial de activación (est.)"
                    dataKey="sponsor"
                    stroke={G.amber}
                    fill={G.amber}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              {/* Custom legend below chart — no overlap */}
              <RadarLegend />
              <Note type="info">
                <strong>Deporte</strong> y <strong>Destilados</strong> combinan
                alta afinidad con alto potencial de activación — la intersección perfecta
                para sponsors premium con storytelling de sostenibilidad.
              </Note>
            </Card>

            {/* Mapa de sponsors */}
            <Card>
              <Title sub="Marcas argentinas ordenadas por fit estadístico con el perfil de asistentes (n=216)">
                Mapa de prospectos de sponsors
              </Title>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:14 }}>

                <SponsorCard
                  cat="🏃 Deportes & Outdoor"
                  color={G.dark}
                  fit="73,5% afinidad — CATEGORÍA LÍDER"
                  marcas={["Adidas", "Vans", "Puma", "Fila", "Qvox"]}
                  insight="Stand de testeo, zona recovery y workout pre-show. Qvox: activación de gym pop-up. Mayor ROI percibido de todos los sponsors."
                />

                <SponsorCard
                  cat="🍹 Destilados & Cócteles"
                  color="#6A1B9A"
                  fit="63,7% afinidad"
                  marcas={["Fernet Branca", "Gin artesanal", "Aperol", "Gancia"]}
                  insight="Bar oficial eco-branded con vaso reutilizable. Gancia: 'El que lleva no toma' — sponsor del programa de carpooling."
                />

                <SponsorCard
                  cat="✈️ Turismo & Experiencias"
                  color={G.blue}
                  fit="61,9% afinidad"
                  marcas={["Aerolíneas Argentinas", "Flybondi", "Pasaje en Mano", "Despegar"]}
                  insight="Sorteo de paquetes de viaje con compensación de huella CO₂ incluida. Flybondi y Pasaje en Mano: activaciones digitales pre-evento con descuentos."
                />

                <SponsorCard
                  cat="🍺 Cervezas"
                  color={G.orange}
                  fit="43,7% afinidad"
                  marcas={["Heineken", "Quilmes", "Patagonia Brewing", "Antares"]}
                  insight="Programa 'Green Pint': por cada vaso devuelto se planta un árbol. Heineken tiene compromisos ESG globales que se alinean con la política del festival."
                />

                <SponsorCard
                  cat="📱 Telecomunicaciones"
                  color={G.red}
                  fit="Claro: 53,2% de asistentes son clientes"
                  marcas={["Claro Argentina", "Personal"]}
                  insight="Claro: zona de conectividad + Claro Música como DJ set digital. Fit máximo — más de la mitad del público ya es cliente."
                />

                <SponsorCard
                  cat="🌱 Movilidad Sostenible & ESG"
                  color={G.mid}
                  fit="Sponsor estratégico de imagen"
                  marcas={["UBER", "Biocombustibles Córdoba", "Empresa de traslados", "YPF Agro"]}
                  insight="UBER: co-brand del shuttle oficial y app de carpooling. Biocombustibles de la provincia: compensación de huella con impacto local certificado. Empresa de traslados: shuttle patrocinado."
                />

              </div>
            </Card>

            {/* Propuesta de valor */}
            <Card>
              <Title sub="Por qué los datos de esta auditoría son un activo de comunicación diferencial">
                Propuesta de valor de sostenibilidad para sponsors
              </Title>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:14 }}>
                {[
                  { icon:"📊", msg:'"Gracias a [MARCA], Landia redujo X tCO₂e en esta edición"' },
                  { icon:"🚌", msg:'"[MARCA] financió el shuttle que evitó 80 autos privados en circulación"' },
                  { icon:"♻️", msg:'"Con [MARCA], reciclamos X vasos = Y kg de plástico evitado"' },
                  { icon:"🌳", msg:'"[MARCA] compensó la huella de carbono residual de Landia 2026"' },
                ].map(({ icon, msg }) => (
                  <div key={msg} style={{ display:"flex", gap:12, padding:"10px 14px",
                    background:G.bg, borderRadius:8, alignItems:"center" }}>
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <span style={{ fontSize:13, color:G.dark, fontWeight:600 }}>{msg}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"12px 14px",
                background:`${G.dark}15`, borderRadius:8, fontSize:12, color:G.dark }}>
                <strong>Ventaja competitiva vs. otros festivales:</strong> estas activaciones
                se basan en datos reales de una auditoría verificable (GHG Protocol /
                ISO 14064-1). La marca puede decir que su impacto es{" "}
                <strong>medible, auditable y reportado públicamente</strong> —
                no es greenwashing, es evidencia.
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:24, textAlign:"center", fontSize:10, color:G.gray, lineHeight:1.7 }}>
          Extrapolación: n=216 × 46,3× = 10.000 asistentes · Margen ±6,60% (IC 95%, FPC) ·
          Israel, Glenn D. (1992) · Cochran (1977) · GHG Protocol S3 Cat. 7 ·
          ISO 14064-1:2018 · ISO 20121:2024 · UK DECCA 2025 · Córdoba, Argentina — Marzo 2026
        </div>
      </div>
    </div>
  );
}
