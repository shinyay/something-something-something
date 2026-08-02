// Hand-authored inline SVG diagrams for the Agentic SDLC guide.
// No external resources, no build deps, no separate .svg files: every diagram
// is an SVG string embedded directly into the generated HTML (same approach as
// the `svg()` icon helper in the renderer).
//
// Colour rules (must stay true):
//   * Only `currentColor` and the existing CSS custom properties are used.
//   * SVG presentation attributes cannot read var(), so colours are applied via
//     the `.diagram .d-*` CSS classes defined in the renderer STYLE block.
//   * No hex / rgb() / hsl() literals appear in the SVG markup.
//
// Japanese text does not wrap automatically in SVG, so labels are kept short and
// multi-line labels use explicit <tspan> line breaks.

const F = (n) => {
    const r = Math.round(n * 10) / 10;
    return Object.is(r, -0) ? 0 : r;
};

/** Point on a circle. deg measured clockwise from 12 o'clock is not used here;
 *  standard math angle in degrees with SVG's y-down coordinate system. */
function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [F(cx + r * Math.cos(rad)), F(cy + r * Math.sin(rad))];
}

/** Triangular arrowhead with its tip at (x, y), pointing along `deg`. */
function arrowHead(x, y, deg, size = 9, cls = "d-arrow") {
    const a = (deg * Math.PI) / 180;
    const back = a + Math.PI;
    const spread = (26 * Math.PI) / 180;
    const bx1 = F(x + size * Math.cos(back - spread));
    const by1 = F(y + size * Math.sin(back - spread));
    const bx2 = F(x + size * Math.cos(back + spread));
    const by2 = F(y + size * Math.sin(back + spread));
    return `<polygon class="${cls}" points="${F(x)},${F(y)} ${bx1},${by1} ${bx2},${by2}"></polygon>`;
}

function wrap(id, title, desc, w, h, body) {
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t ${id}-d" preserveAspectRatio="xMidYMid meet">
  <title id="${id}-t">${title}</title>
  <desc id="${id}-d">${desc}</desc>
${body}
</svg>`;
}

/* ─────────────────────────────────────────────────────────────────────────
 * 1. Agentic Modernization Loop — cyclic diagram (id: loop)
 * ───────────────────────────────────────────────────────────────────────── */
export function loopDiagram() {
    const id = "dg-loop";
    const w = 560;
    const h = 480;
    const cx = 280;
    const cy = 252;
    const R = 178;
    const bw = 138;
    const bh = 58;
    const nodes = [
        { main: "Code → Doc", sub: "構造復元" },
        { main: "Doc → Plan", sub: "計画" },
        { main: "Plan → Work", sub: "Issue 化" },
        { main: "Work → PR", sub: "実装・検証" },
        { main: "PR → Learning", sub: "知識還元" },
    ];
    const n = nodes.length;
    const parts = [];

    // Ring behind the nodes.
    parts.push(
        `  <circle class="d-flow" cx="${cx}" cy="${cy}" r="${R}" stroke-width="2.4" stroke-dasharray="5 5"></circle>`,
    );

    // Directional arrowheads at each mid-arc (clockwise = increasing angle).
    for (let i = 0; i < n; i += 1) {
        const mid = -90 + 72 * i + 36;
        const [tx, ty] = polar(cx, cy, R, mid);
        const [ax, ay] = polar(cx, cy, R, mid + 2);
        const [bx, by] = polar(cx, cy, R, mid - 2);
        const dir = (Math.atan2(ay - by, ax - bx) * 180) / Math.PI;
        parts.push(arrowHead(tx, ty, dir, 10, "d-flow-arrow"));
    }

    // Centre hub.
    parts.push(
        `  <circle class="d-box-emphasis" cx="${cx}" cy="${cy}" r="56"></circle>`,
        `  <text class="d-te" x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="15" font-weight="600">境界のある</text>`,
        `  <text class="d-te" x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="15" font-weight="600">委譲</text>`,
    );

    // Node boxes on the ring. The badge and label are laid out as a fixed
    // left-aligned unit (badge on the left, label starting after it) so the
    // badge and label keep a constant horizontal gap regardless of label length.
    nodes.forEach((node, i) => {
        const [px, py] = polar(cx, cy, R, -90 + 72 * i);
        const x = F(px - bw / 2);
        const y = F(py - bh / 2);
        const chipCx = F(x + 18);
        const chipCy = F(y + bh / 2);
        const tx = F(x + 38);
        parts.push(
            `  <g>
    <rect class="d-box-accent" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10"></rect>
    <circle class="d-chip" cx="${chipCx}" cy="${chipCy}" r="10"></circle>
    <text class="d-te" x="${chipCx}" y="${F(chipCy + 4)}" text-anchor="middle" font-size="12" font-weight="600">${i + 1}</text>
    <text class="d-t" x="${tx}" y="${F(y + 25)}" text-anchor="start" font-size="13" font-weight="600">${node.main}</text>
    <text class="d-tm" x="${tx}" y="${F(y + 43)}" text-anchor="start" font-size="11">${node.sub}</text>
  </g>`,
        );
    });

    const title = "Agentic Modernization Loop の循環図";
    const desc =
        "5 つの変換 Code→Doc、Doc→Plan、Plan→Work、Work→PR、PR→Learning が時計回りに一周し、PR→Learning から Code→Doc に戻る円環。中心には境界のある委譲が置かれ、各変換をつなぐ。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}

/* ─────────────────────────────────────────────────────────────────────────
 * 2. PR governance swimlanes — lane diagram (id: pr)
 * ───────────────────────────────────────────────────────────────────────── */
export function prDiagram() {
    const id = "dg-pr";
    const w = 680;
    const h = 384;
    const labelW = 96;
    const laneH = 72;
    const top = 52;
    const lanes = ["人間", "エージェント", "PR", "CI"];
    const laneY = (i) => top + i * laneH;
    const laneMid = (i) => laneY(i) + laneH / 2;
    const parts = [];

    // Lane bands + labels.
    lanes.forEach((name, i) => {
        const cls = i % 2 === 0 ? "d-lane" : "d-lane-alt";
        parts.push(
            `  <rect class="${cls}" x="0" y="${laneY(i)}" width="${w}" height="${laneH}"></rect>`,
            `  <text class="d-tm" x="${labelW - 14}" y="${F(laneMid(i) + 4)}" text-anchor="end" font-size="13" font-weight="600">${name}</text>`,
        );
    });
    parts.push(`  <line class="d-line" x1="${labelW}" y1="${top}" x2="${labelW}" y2="${top + lanes.length * laneH}"></line>`);

    // Phase captions (top).
    parts.push(
        `  <text class="d-tm" x="270" y="34" text-anchor="middle" font-size="12" font-weight="600">自律的な実行</text>`,
        `  <text class="d-tm" x="566" y="34" text-anchor="middle" font-size="12" font-weight="600">人間による受け入れ</text>`,
    );

    // Boundary line the agent cannot cross.
    const bx = 452;
    parts.push(
        `  <line class="d-boundary" x1="${bx}" y1="${top - 6}" x2="${bx}" y2="${top + lanes.length * laneH + 6}" stroke-width="2" stroke-dasharray="6 5"></line>`,
        `  <text class="d-danger" x="${bx}" y="${top + lanes.length * laneH + 22}" text-anchor="middle" font-size="11.5" font-weight="600">エージェントが越えられない境界</text>`,
    );

    const box = (cls, x, midI, tw, main, sub) => {
        const th = 46;
        const y = F(laneMid(midI) - th / 2);
        const cxp = F(x + tw / 2);
        return `  <g>
    <rect class="${cls}" x="${x}" y="${y}" width="${tw}" height="${th}" rx="9"></rect>
    <text class="d-t" x="${cxp}" y="${sub ? F(y + 20) : F(y + th / 2 + 4)}" text-anchor="middle" font-size="12.5" font-weight="600">${main}</text>${
        sub ? `\n    <text class="d-tm" x="${cxp}" y="${F(y + 36)}" text-anchor="middle" font-size="10.5">${sub}</text>` : ""
    }
  </g>`;
    };

    // Flow boxes.
    parts.push(box("d-box-accent", 118, 0, 128, "Issue を委譲", "Delegation Contract"));
    parts.push(box("d-box", 262, 1, 150, "実装 & push", "copilot/… ブランチ 1 本"));
    parts.push(box("d-box", 262, 2, 150, "draft PR", "Ready にできない"));
    parts.push(box("d-box-attention", 486, 3, 128, "checks 実行", "Approve and run 後"));
    parts.push(box("d-box-success", 486, 0, 150, "レビュー & Merge", "required reviews"));

    // Connective arrows.
    const arrow = (x1, y1, x2, y2, cls = "d-conn") => {
        const dir = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        return `  <line class="${cls}" x1="${F(x1)}" y1="${F(y1)}" x2="${F(x2)}" y2="${F(y2)}" stroke-width="1.6"></line>\n${arrowHead(x2, y2, dir, 8, "d-conn-arrow")}`;
    };
    parts.push(arrow(246, laneMid(0), 262, laneMid(1) - 6)); // 委譲 → 実装
    parts.push(arrow(337, laneMid(1) + 23, 337, laneMid(2) - 23)); // 実装 → draft PR
    parts.push(arrow(412, laneMid(2), 486, laneMid(3) - 6)); // draft PR → checks
    parts.push(arrow(550, laneMid(3) - 23, 561, laneMid(0) + 23)); // checks → レビュー(via human gate)

    // Blocked actions the agent cannot perform (crossing the boundary).
    const blocked = ["Ready", "Approve", "Merge"];
    const boxEdge = 262 + 150; // right edge of the 実装 & push box
    const cxBlock = 432; // × centre sits outside the box edge, left of the boundary
    blocked.forEach((label, i) => {
        const y = F(laneMid(1) - 18 + i * 18);
        parts.push(
            `  <g>
    <line class="d-block" x1="${boxEdge + 4}" y1="${y}" x2="448" y2="${y}" stroke-width="1.4" stroke-dasharray="4 3"></line>
    <circle class="d-block-x" cx="${cxBlock}" cy="${y}" r="8"></circle>
    <text class="d-danger" x="${cxBlock}" y="${F(y + 3.5)}" text-anchor="middle" font-size="11" font-weight="700">×</text>
    <text class="d-danger" x="${F(bx + 8)}" y="${F(y + 4)}" text-anchor="start" font-size="11">${label} 不可</text>
  </g>`,
        );
    });

    const title = "PR をガバナンス境界とするレーン図";
    const desc =
        "人間・エージェント・PR・CI の 4 レーン。エージェントは Issue の委譲を受けて copilot/… ブランチ 1 本に実装し draft PR を作るが、境界線の右側にある Ready 化・Approve・Merge は実行できず、人間がレビューしてマージする。自律的な実行は自律的な受け入れを意味しない。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}

/* ─────────────────────────────────────────────────────────────────────────
 * 3. Five interaction modes — continuum diagram (id: continuum)
 * ───────────────────────────────────────────────────────────────────────── */
export function continuumDiagram() {
    const id = "dg-continuum";
    const w = 680;
    const h = 420;
    const x0 = 120;
    const x1 = 636;
    const yBottom = 336;
    const yTop = 78;
    const parts = [];

    // Axes.
    parts.push(
        `  <line class="d-axis" x1="${x0}" y1="${yBottom}" x2="${x1}" y2="${yBottom}" stroke-width="1.6"></line>`,
        arrowHead(x1, yBottom, 0, 9, "d-axis-arrow"),
        `  <line class="d-axis" x1="${x0}" y1="${yBottom}" x2="${x0}" y2="${yTop - 8}" stroke-width="1.6"></line>`,
        arrowHead(x0, yTop - 8, -90, 9, "d-axis-arrow"),
        `  <text class="d-tm" x="${x0}" y="${yBottom + 26}" text-anchor="start" font-size="12">同期</text>`,
        `  <text class="d-tm" x="${x1}" y="${yBottom + 26}" text-anchor="end" font-size="12">非同期・並列</text>`,
        `  <text class="d-tm" x="${(x0 + x1) / 2}" y="${yBottom + 26}" text-anchor="middle" font-size="11" font-weight="600">実行の同期性 →</text>`,
    );
    // Y axis end labels (place as horizontal text near the axis ends).
    parts.push(
        `  <text class="d-tm" x="${x0 - 12}" y="${yTop + 2}" text-anchor="end" font-size="12">クラウド</text>`,
        `  <text class="d-tm" x="${x0 - 12}" y="${yBottom - 4}" text-anchor="end" font-size="12">ローカル</text>`,
        `  <text class="d-tm" x="0" y="0" text-anchor="middle" font-size="11" font-weight="600" transform="translate(${x0 - 44} ${(yBottom + yTop) / 2}) rotate(-90)">実行場所 ↑</text>`,
    );

    const modes = [
        { name: "Completion", prod: "コード補完", cls: "d-box" },
        { name: "Conversation", prod: "Copilot Chat", cls: "d-box" },
        { name: "Collaboration", prod: "Agent mode / CLI", cls: "d-box-accent" },
        { name: "Delegation", prod: "cloud agent", cls: "d-box-done" },
        { name: "Orchestration", prod: "Agents パネル", cls: "d-box-done" },
    ];
    const cw = 128;
    const ch = 40;
    // Chip centres form a diagonal strictly inside the axes (leftmost box clears
    // the Y axis, lowest box clears the X axis). Vertical spacing (>= 49) exceeds
    // the chip height, so chips never overlap one another either.
    const centres = [
        [198, 308],
        [303, 258],
        [408, 209],
        [513, 159],
        [598, 110],
    ];

    // Progression path through the chip centres.
    const path = centres.map(([mx, my], i) => `${i === 0 ? "M" : "L"} ${mx} ${my}`).join(" ");
    parts.push(`  <path class="d-progress" d="${path}" fill="none" stroke-width="2" stroke-dasharray="4 4"></path>`);

    // Mode chips.
    centres.forEach(([mx, my], i) => {
        const m = modes[i];
        const bx = F(mx - cw / 2);
        const by = F(my - ch / 2);
        parts.push(
            `  <g>
    <rect class="${m.cls}" x="${bx}" y="${by}" width="${cw}" height="${ch}" rx="9"></rect>
    <text class="d-t" x="${mx}" y="${F(by + 17)}" text-anchor="middle" font-size="12.5" font-weight="600">${i + 1}. ${m.name}</text>
    <text class="d-tm" x="${mx}" y="${F(by + 32)}" text-anchor="middle" font-size="10.5">${m.prod}</text>
  </g>`,
        );
    });

    const title = "5 つの相互作用モードの連続体図";
    const desc =
        "Completion、Conversation、Collaboration、Delegation、Orchestration の 5 モードを、横軸の同期から非同期・並列へ、縦軸のローカルからクラウドへの平面上に並べた図。左下の Completion から右上の Orchestration へと段階的に進む。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4. Delegation Contract — 2×4 grid diagram (id: contract)
 * ───────────────────────────────────────────────────────────────────────── */
export function contractDiagram() {
    const id = "dg-contract";
    const w = 680;
    const h = 392;
    const parts = [];
    const fields = [
        { name: "Outcome + Why", jp: "成果と目的", kind: "soft" },
        { name: "Scope + Out", jp: "範囲と除外", kind: "hard" },
        { name: "Context", jp: "文脈・前提", kind: "soft" },
        { name: "Tools + Constraints", jp: "能力・制約", kind: "hard" },
        { name: "Acceptance", jp: "受け入れ条件", kind: "hard" },
        { name: "Verification + Evidence", jp: "検証と証拠", kind: "hard" },
        { name: "Escalate", jp: "エスカレーション", kind: "mid" },
        { name: "Human gates", jp: "人間のゲート", kind: "hard" },
    ];
    const clsFor = { hard: "d-box-success", mid: "d-box-attention", soft: "d-box" };
    const cols = 2;
    const gx = 16;
    const gy = 14;
    const topPad = 20;
    const bw = F((w - gx * (cols + 1)) / cols);
    const bh = 66;

    fields.forEach((f, i) => {
        const r = Math.floor(i / cols);
        const col = i % cols;
        const x = F(gx + col * (bw + gx));
        const y = F(topPad + r * (bh + gy));
        parts.push(
            `  <g>
    <rect class="${clsFor[f.kind]}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10"></rect>
    <circle class="d-chip" cx="${F(x + 20)}" cy="${F(y + 20)}" r="11"></circle>
    <text class="d-te" x="${F(x + 20)}" y="${F(y + 24)}" text-anchor="middle" font-size="12" font-weight="600">${i + 1}</text>
    <text class="d-t" x="${F(x + 40)}" y="${F(y + 25)}" text-anchor="start" font-size="13" font-weight="600">${f.name}</text>
    <text class="d-tm" x="${F(x + 40)}" y="${F(y + 46)}" text-anchor="start" font-size="11.5">${f.jp}</text>
  </g>`,
        );
    });

    // Legend.
    const ly = topPad + 4 * (bh + gy) + 4;
    const legend = [
        { cls: "d-box-success", t: "構造的に強制可" },
        { cls: "d-box-attention", t: "半構造的" },
        { cls: "d-box", t: "プロンプトのみ" },
    ];
    let lx = gx;
    legend.forEach((lg) => {
        parts.push(
            `  <rect class="${lg.cls}" x="${lx}" y="${ly}" width="18" height="14" rx="4"></rect>`,
            `  <text class="d-tm" x="${lx + 24}" y="${ly + 12}" text-anchor="start" font-size="11.5">${lg.t}</text>`,
        );
        lx += 24 + lg.t.length * 12 + 30;
    });

    const title = "Delegation Contract の 8 フィールドの 2×4 グリッド図";
    const desc =
        "委譲契約の 8 フィールドを 2 列 4 行に並べた図。Outcome + Why、Scope + Out、Context、Tools + Constraints、Acceptance、Verification + Evidence、Escalate、Human gates。各フィールドは強制力（構造的に強制可・半構造的・プロンプトのみ）で色分けされる。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}

/* ─────────────────────────────────────────────────────────────────────────
 * 5. Autonomy Budget — four-dimension bar diagram (id: autonomy)
 * ───────────────────────────────────────────────────────────────────────── */
export function autonomyDiagram() {
    const id = "dg-autonomy";
    const w = 640;
    const h = 336;
    const parts = [];
    const dims = [
        { name: "Scope", jp: "範囲" },
        { name: "Capability", jp: "能力" },
        { name: "Compute", jp: "実行資源" },
        { name: "Decision", jp: "意思決定" },
    ];
    const labelW = 156;
    const barX = labelW + 14;
    const barW = w - barX - 24;
    const barH = 30;
    const gap = 26;
    const top = 44;
    const segs = 4;
    const segW = barW / segs;

    parts.push(
        `  <text class="d-t" x="20" y="26" text-anchor="start" font-size="13" font-weight="600">自律性 = 予算（スイッチではない）</text>`,
    );

    dims.forEach((d, i) => {
        const y = F(top + i * (barH + gap));
        parts.push(
            `  <text class="d-t" x="20" y="${F(y + 15)}" text-anchor="start" font-size="13" font-weight="600">${d.name}</text>`,
            `  <text class="d-tm" x="20" y="${F(y + 30)}" text-anchor="start" font-size="11">${d.jp}</text>`,
            `  <rect class="d-track" x="${barX}" y="${y}" width="${F(barW)}" height="${barH}" rx="7"></rect>`,
        );
        for (let s = 0; s < segs; s += 1) {
            const sx = F(barX + s * segW);
            const op = F(0.28 + s * 0.24);
            parts.push(
                `  <rect class="d-fill-accent" x="${sx}" y="${y}" width="${F(segW - 2)}" height="${barH}" rx="5" fill-opacity="${op}"></rect>`,
            );
        }
    });

    // Scale labels under the bars.
    const sy = F(top + segs * (barH + gap) - gap + 22);
    parts.push(
        `  <text class="d-tm" x="${barX}" y="${sy}" text-anchor="start" font-size="11">低</text>`,
        `  <text class="d-tm" x="${F(barX + barW / 2)}" y="${sy}" text-anchor="middle" font-size="11">→ 一度に 1 次元ずつ拡大 →</text>`,
        `  <text class="d-tm" x="${F(barX + barW)}" y="${sy}" text-anchor="end" font-size="11">高</text>`,
    );

    const title = "Autonomy Budget の 4 次元バー図";
    const desc =
        "自律性を Scope（範囲）、Capability（能力）、Compute（実行資源）、Decision（意思決定）の 4 次元に分解し、それぞれを低から高へ段階的に濃くなる帯で表した図。自律性はオンオフのスイッチではなく、次元ごとに配分する予算であり、一度に 1 次元ずつ拡大する。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}

/* ─────────────────────────────────────────────────────────────────────────
 * 6. Adoption ladder — staircase diagram (id: ladder)
 * ───────────────────────────────────────────────────────────────────────── */
export function ladderDiagram() {
    const id = "dg-ladder";
    const w = 680;
    const h = 372;
    const parts = [];
    const steps = [
        { name: "Assist", jp: "人が全ステップを所有" },
        { name: "Collaborate", jp: "調査・計画・実装を共有" },
        { name: "Delegate", jp: "契約を実行し PR を返す" },
        { name: "Standardize", jp: "instructions/skills を再利用" },
        { name: "Orchestrate", jp: "統治下で並列に走らせる" },
    ];
    const n = steps.length;
    const treadW = 340;
    const stepH = 46;
    const rise = 54;
    const indent = 66;
    const baseY = 320;

    // Growth arrow (bottom-left → top-right).
    parts.push(
        `  <line class="d-axis" x1="26" y1="${baseY + 8}" x2="26" y2="30" stroke-width="1.6"></line>`,
        arrowHead(26, 30, -90, 9, "d-axis-arrow"),
        `  <text class="d-tm" x="0" y="0" text-anchor="middle" font-size="11.5" transform="translate(16 ${(baseY) / 2}) rotate(-90)">コンテキストと検証の成熟 → 委譲の拡大</text>`,
    );

    steps.forEach((s, i) => {
        const x = F(42 + i * indent);
        const y = F(baseY - i * rise - stepH);
        parts.push(
            `  <g>
    <rect class="d-box-accent" x="${x}" y="${y}" width="${treadW}" height="${stepH}" rx="9"></rect>
    <circle class="d-chip" cx="${F(x + 22)}" cy="${F(y + stepH / 2)}" r="12"></circle>
    <text class="d-te" x="${F(x + 22)}" y="${F(y + stepH / 2 + 4)}" text-anchor="middle" font-size="12.5" font-weight="600">${i + 1}</text>
    <text class="d-t" x="${F(x + 44)}" y="${F(y + 20)}" text-anchor="start" font-size="13.5" font-weight="600">${s.name}</text>
    <text class="d-tm" x="${F(x + 44)}" y="${F(y + 37)}" text-anchor="start" font-size="11">${s.jp}</text>
  </g>`,
        );
        if (i < n - 1) {
            const nx = F(42 + (i + 1) * indent + 22);
            const ny = F(baseY - (i + 1) * rise - stepH);
            const sxp = F(x + treadW - 40);
            const syp = y;
            const dir = (Math.atan2(ny + stepH - syp, nx - sxp) * 180) / Math.PI;
            parts.push(
                `  <line class="d-conn" x1="${sxp}" y1="${syp}" x2="${nx}" y2="${F(ny + stepH)}" stroke-width="1.5" stroke-dasharray="4 3"></line>`,
                arrowHead(nx, F(ny + stepH), dir, 7, "d-conn-arrow"),
            );
        }
    });

    const title = "採用ラダーの階段図";
    const desc =
        "Assist、Collaborate、Delegate、Standardize、Orchestrate の 5 段が左下から右上へ上る階段。上の段ほど委譲の範囲が広がるが、上がる前提はリポジトリのコンテキストと検証の成熟である。";
    return wrap(id, title, desc, w, h, parts.join("\n"));
}
