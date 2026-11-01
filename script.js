
/* ==========================================
   M87* INTERACTIVE BLACK HOLE LABORATORY
   ========================================== */

/* ---------- NAVIGATION ---------- */

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

function showPage(target) {
    pages.forEach(page => {
        page.classList.toggle("active", page.id === target);
    });

    navButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.target === target
        );
    });

    // Redraw diagrams after a page becomes visible.
    requestAnimationFrame(drawAll);
}

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.target);
    });
});


/* ---------- GENERAL CANVAS HELPERS ---------- */

function getCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
        canvas,
        ctx,
        width: rect.width,
        height: rect.height
    };
}

function drawBackground(ctx, w, h) {
    ctx.fillStyle = "#080f1d";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 55; i++) {
        const x = (i * 137.5) % w;
        const y = (i * 79.3) % h;

        ctx.fillStyle = "rgba(190,220,255,0.35)";
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBlackHole(ctx, x, y, radius) {
    const glow = ctx.createRadialGradient(
        x, y, radius * 0.6,
        x, y, radius * 2.2
    );

    glow.addColorStop(0, "rgba(0,0,0,1)");
    glow.addColorStop(0.55, "rgba(0,0,0,0.9)");
    glow.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,180,95,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.stroke();
}

function label(ctx, text, x, y, color = "#dceaff", size = 12) {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}


/* ---------- 01 STRUCTURE DIAGRAM ---------- */

function drawStructure() {
    const data = getCanvas("structureCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const x = w * 0.5;
    const y = h * 0.52;
    const r = Math.min(w, h) * 0.12;

    // Accretion disc
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.16);

    ctx.strokeStyle = "#f58c47";
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 2.25, r * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffd28a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.7, r * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Photon sphere
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#68cfff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Event horizon
    drawBlackHole(ctx, x, y, r);

    label(ctx, "Accretion disc", x + r * 2.1, y - r * 1.6, "#ffbd79");
    label(ctx, "Photon sphere", x + r * 1.5, y + r * 1.7, "#68cfff");
    label(ctx, "Event horizon", x - r * 0.55, y + 5);
}


/* ---------- 02 ACCRETION DISC ANIMATION ---------- */

let discAngle = 0;
let discSpeed = 5;
let discPaused = false;

const discSlider = document.getElementById("discSpeed");
const discSpeedValue = document.getElementById("discSpeedValue");
const discToggle = document.getElementById("discToggle");

if (discSlider) {
    discSlider.addEventListener("input", () => {
        discSpeed = Number(discSlider.value);
        if (discSpeedValue) discSpeedValue.textContent = discSpeed;
    });
}

if (discToggle) {
    discToggle.addEventListener("click", () => {
        discPaused = !discPaused;
        discToggle.textContent = discPaused ? "Resume disc" : "Pause disc";
    });
}

function drawDisc() {
    const data = getCanvas("discCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const x = w / 2;
    const y = h / 2;
    const radius = Math.min(w, h) * 0.16;

    if (!discPaused) {
        discAngle += discSpeed * 0.002;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.18);

    // Outer disc
    const gradient = ctx.createLinearGradient(
        -radius * 2, 0, radius * 2, 0
    );

    gradient.addColorStop(0, "#b94124");
    gradient.addColorStop(0.5, "#ffcf76");
    gradient.addColorStop(1, "#d44c24");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.ellipse(
        0, 0,
        radius * 2.15,
        radius * 0.68,
        0, 0, Math.PI * 2
    );
    ctx.stroke();

    // Rotating bright particles
    for (let i = 0; i < 22; i++) {
        const angle = discAngle * (1 + i * 0.025) + i * 0.29;
        const orbit = radius * (1.35 + (i % 7) * 0.13);

        const px = Math.cos(angle) * orbit;
        const py = Math.sin(angle) * orbit * 0.34;

        ctx.fillStyle = i % 2 ? "#ffe2a3" : "#ff8b4c";
        ctx.beginPath();
        ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    drawBlackHole(ctx, x, y, radius);

    label(ctx, "HOT ORBITING PLASMA", 15, 25, "#ffbd79", 11);
    label(ctx, "M87*", x - 14, y + 5);
}


/* ---------- 03 RELATIVISTIC JET ---------- */

let jetAnimation = 0;

const jetSlider = document.getElementById("jetSpeed");
const jetSpeedValue = document.getElementById("jetSpeedValue");
const jetResult = document.getElementById("jetResult");

if (jetSlider) {
    jetSlider.addEventListener("input", () => {
        const speed = Number(jetSlider.value);

        if (jetSpeedValue) {
            jetSpeedValue.textContent = (speed / 100).toFixed(2) + "c";
        }

        if (jetResult) {
            jetResult.textContent = speed + "% of c";
        }
    });
}

function drawJet() {
    const data = getCanvas("jetCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const x = w * 0.5;
    const y = h * 0.68;
    const r = Math.min(w, h) * 0.09;

    // Upper jet
    const jetGradient = ctx.createLinearGradient(x, y, x, 5);
    jetGradient.addColorStop(0, "rgba(255,190,100,0.95)");
    jetGradient.addColorStop(0.35, "rgba(83,172,255,0.75)");
    jetGradient.addColorStop(1, "rgba(55,110,255,0.03)");

    ctx.fillStyle = jetGradient;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, y);
    ctx.lineTo(x - r * 0.13, 10);
    ctx.lineTo(x + r * 0.13, 10);
    ctx.lineTo(x + r * 0.45, y);
    ctx.closePath();
    ctx.fill();

    // Lower counter-jet, schematic
    ctx.fillStyle = "rgba(65,135,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.4, y);
    ctx.lineTo(x - r * 0.15, h - 5);
    ctx.lineTo(x + r * 0.15, h - 5);
    ctx.lineTo(x + r * 0.4, y);
    ctx.closePath();
    ctx.fill();

    // Moving particles
    for (let i = 0; i < 20; i++) {
        const phase = (jetAnimation * 0.018 + i / 20) % 1;
        const py = y - phase * (y - 10);
        const spread = r * 0.4 * phase;

        ctx.fillStyle = "rgba(170,220,255,0.8)";
        ctx.beginPath();
        ctx.arc(
            x + Math.sin(i * 2) * spread,
            py,
            1.5 + (i % 3),
            0, Math.PI * 2
        );
        ctx.fill();
    }

    jetAnimation++;

    drawBlackHole(ctx, x, y, r * 0.65);

    label(ctx, "RELATIVISTIC JET", x + r, 25, "#83caff", 11);
    label(ctx, "M87*", x - 13, y + 5);
}


/* ---------- 04 SPACETIME GRID ---------- */

function drawSpacetime() {
    const data = getCanvas("spacetimeCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const cx = w / 2;
    const cy = h * 0.48;
    const radius = Math.min(w, h) * 0.14;

    // Horizontal grid
    for (let row = -5; row <= 5; row++) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(90,170,240,0.45)";
        ctx.lineWidth = 1;

        for (let col = -12; col <= 12; col++) {
            const px = cx + col * (w / 25);
            const distance = Math.sqrt(
                (px - cx) ** 2 + (row * 28) ** 2
            );

            const dip = radius * 1.5 *
                Math.exp(-distance / (radius * 1.3));

            const py = cy + row * 28 + dip;

            if (col === -12) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.stroke();
    }

    // Vertical grid
    for (let col = -10; col <= 10; col++) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(90,170,240,0.38)";

        for (let row = -6; row <= 6; row++) {
            const py = cy + row * 25;
            const distance = Math.sqrt(
                (col * 35) ** 2 + (py - cy) ** 2
            );

            const dip = radius * 1.4 *
                Math.exp(-distance / (radius * 1.3));

            const px = cx + col * 35;
            const adjustedY = py + dip;

            if (row === -6) ctx.moveTo(px, adjustedY);
            else ctx.lineTo(px, adjustedY);
        }

        ctx.stroke();
    }

    drawBlackHole(ctx, cx, cy, radius * 0.7);
    label(ctx, "MASS CURVES SPACETIME", 15, 25, "#75cbff", 11);
}


/* ---------- 05 LIGHT PATHS ---------- */

const impactSlider = document.getElementById("impactSlider");
const impactValue = document.getElementById("impactValue");
const lightResult = document.getElementById("lightResult");

if (impactSlider) {
    impactSlider.addEventListener("input", updateLight);
}

function updateLight() {
    if (!impactSlider) return;

    const distance = Number(impactSlider.value);

    if (impactValue) {
        impactValue.textContent = distance.toFixed(1);
    }

    if (lightResult) {
        if (distance <= 2.598) {
            lightResult.textContent = "Near or below critical impact parameter";
        } else if (distance <= 4) {
            lightResult.textContent = "Strong gravitational bending";
        } else if (distance <= 6) {
            lightResult.textContent = "Moderate gravitational bending";
        } else {
            lightResult.textContent = "Relatively weak bending";
        }
    }
}

function drawLight() {
    const data = getCanvas("lightCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * 0.11;

    const impact = impactSlider
        ? Number(impactSlider.value)
        : 3;

    const closest = Math.max(impact, 1.2);
    const bend = Math.max(0.12, Math.min(1.35, 4 / closest));

    drawBlackHole(ctx, cx, cy, radius);

    // Incoming ray
    ctx.strokeStyle = "#f6df82";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, cy - radius * closest * 0.28);
    ctx.quadraticCurveTo(
        cx * 0.55,
        cy - radius * closest * 0.28,
        cx,
        cy - radius * bend
    );
    ctx.stroke();

    // Outgoing conceptual ray
    ctx.strokeStyle = "#69d5ff";
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius * bend);
    ctx.quadraticCurveTo(
        cx + radius * 1.3,
        cy - radius * bend * 1.6,
        w - 10,
        cy - radius * (bend * 2 + 0.2)
    );
    ctx.stroke();

    // Labels
    label(ctx, "Incoming light", 15, cy - radius * 1.2, "#f6df82");
    label(ctx, "Deflected light", w - 120, cy - radius * 2, "#69d5ff");
    label(ctx, "M87*", cx - 14, cy + 5);
}


/* ---------- 06 OBJECT EXPERIMENT ---------- */

const objectDistance = document.getElementById("objectDistance");
const objectSpeed = document.getElementById("objectSpeed");

function updateObject() {
    const distance = Number(objectDistance?.value || 8);
    const speed = Number(objectSpeed?.value || 50);

    const distanceOutput = document.getElementById("objectDistanceValue");
    const speedOutput = document.getElementById("objectSpeedValue");
    const result = document.getElementById("objectResult");

    if (distanceOutput) distanceOutput.textContent = distance;
    if (speedOutput) speedOutput.textContent = speed;

    if (result) {
        if (distance < 6) {
            result.textContent = "Inside the Schwarzschild ISCO radius";
        } else if (distance < 10) {
            result.textContent = "Relatively close orbit";
        } else {
            result.textContent = "Farther from the black hole";
        }
    }
}

objectDistance?.addEventListener("input", updateObject);
objectSpeed?.addEventListener("input", updateObject);

let objectAngle = 0;

function drawObject() {
    const data = getCanvas("objectCanvas");
    if (!data) return;

    const { ctx, width: w, height: h } = data;

    drawBackground(ctx, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.09;

    const distance = Number(objectDistance?.value || 8);
    const speed = Number(objectSpeed?.value || 50);

    const orbitRadius = r * distance * 0.42;

    ctx.strokeStyle = "rgba(105,201,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, orbitRadius, orbitRadius * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    objectAngle += speed * 0.0007;

    const ox = cx + Math.cos(objectAngle) * orbitRadius;
    const oy = cy + Math.sin(objectAngle) * orbitRadius * 0.48;

    ctx.fillStyle = "#ffe28b";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffe28b";
    ctx.beginPath();
    ctx.arc(ox, oy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    drawBlackHole(ctx, cx, cy, r);

    label(ctx, "ORBITING TEST OBJECT", 15, 25, "#ffe28b", 11);
    label(ctx, `${distance} Rs`, cx + orbitRadius + 7, cy);
}


/* ---------- 07 TIME DILATION ---------- */

const timeSlider = document.getElementById("timeSlider");

function updateTime() {
    if (!timeSlider) return;

    const radius = Number(timeSlider.value);
    const ratio = Math.sqrt(Math.max(0, 1 - 1 / radius));

    const radiusOutput = document.getElementById("timeRadiusValue");
    const result = document.getElementById("timeResult");
    const explanation = document.getElementById("timeExplanation");

    if (radiusOutput) radiusOutput.textContent = radius.toFixed(1);
    if (result) result.textContent = ratio.toFixed(4);

    if (explanation) {
        explanation.textContent =
            `At ${radius.toFixed(1)} Rs, a stationary clock has a rate factor of ${ratio.toFixed(4)} relative to a clock far away.`;
    }
}

timeSlider?.addEventListener("input", updateTime);


/* ---------- 08 GRAVITATIONAL REDSHIFT ---------- */

const redshiftSlider = document.getElementById("redshiftSlider");

function updateRedshift() {
    if (!redshiftSlider) return;

    const radius = Number(redshiftSlider.value);
    const ratio = Math.sqrt(Math.max(0, 1 - 1 / radius));

    const radiusOutput = document.getElementById("redshiftRadiusValue");
    const result = document.getElementById("redshiftResult");

    if (radiusOutput) radiusOutput.textContent = radius.toFixed(1);
    if (result) result.textContent = ratio.toFixed(4);
}

redshiftSlider?.addEventListener("input", updateRedshift);


/* ---------- 09 SCHWARZSCHILD RADIUS ---------- */

const massSlider = document.getElementById("massSlider");

function updateMass() {
    if (!massSlider) return;

    const mass = Number(massSlider.value);

    // Schwarzschild radius per solar mass = approximately 2.953 km.
    const radiusKm = mass * 1e9 * 2.953;

    const massOutput = document.getElementById("massValue");
    const radiusOutput = document.getElementById("radiusValue");

    if (massOutput) massOutput.textContent = mass.toFixed(1);
    if (radiusOutput) {
        radiusOutput.textContent =
            (radiusKm / 1e9).toFixed(2) + " billion km";
    }
}

massSlider?.addEventListener("input", updateMass);


/* ---------- 10 HAWKING TEMPERATURE ---------- */

const thermoMass = document.getElementById("thermoMass");

function updateThermo() {
    if (!thermoMass) return;

    const mass = Number(thermoMass.value);
    const solarMassKg = 1.98847e30;
    const blackHoleMass = mass * 1e9 * solarMassKg;

    const hbar = 1.054571817e-34;
    const c = 299792458;
    const G = 6.67430e-11;
    const kB = 1.380649e-23;

    const temperature =
        (hbar * c ** 3) /
        (8 * Math.PI * G * blackHoleMass * kB);

    const massOutput = document.getElementById("thermoMassValue");
    const result = document.getElementById("temperatureResult");

    if (massOutput) massOutput.textContent = mass.toFixed(1);

    if (result) {
        result.textContent = temperature.toExponential(3) + " K";
    }
}

thermoMass?.addEventListener("input", updateThermo);


/* ---------- DRAW ALL VISIBLE DIAGRAMS ---------- */

function drawAll() {
    drawStructure();
    drawDisc();
    drawJet();
    drawSpacetime();
    drawLight();
    drawObject();
}


/* ---------- ANIMATION LOOP ---------- */

function animationLoop() {
    drawDisc();
    drawJet();
    drawObject();

    requestAnimationFrame(animationLoop);
}


/* ---------- RESIZE ---------- */

window.addEventListener("resize", () => {
    drawAll();
});


/* ---------- INITIALISE ---------- */

updateMass();
updateLight();
updateObject();
updateTime();
updateRedshift();
updateThermo();

requestAnimationFrame(() => {
    drawAll();
    animationLoop();
});
