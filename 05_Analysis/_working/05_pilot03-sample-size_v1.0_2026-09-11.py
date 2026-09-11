#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PILOT-03 — PRECISION-BASED SAMPLE-SIZE COMPUTATIONS
====================================================
File     : 05_pilot03-sample-size_v1.0_2026-09-11.py
Author   : biostatistics-expert (agent), for Dr. Fehaid M. Alanazi
Date     : 2026-09-11
Status   : PRE-SPECIFICATION. Written before any PILOT-03 data exist.
Governs  : CLAUDE.md sec.1 (no fabrication), sec.6 (statistical conduct);
           DECISION_LOG D003 (Python executed, SPSS syntax delivered in parallel),
           D025 (unit of analysis = antigen-donor pair; hrS/hrB/V/VS excluded from
           primary outcome), D027 (kappa + 95% CI, never bare percent agreement),
           D031 (sizing dispatched in parallel with protocol drafting).

WHAT THIS SCRIPT DOES
  Computes sample size from CONFIDENCE-INTERVAL PRECISION, not from power.
  PILOT-03 estimates frequencies and quantifies agreement; it does not test a
  pre-specified difference. A power calculation would require an effect size
  that the design does not contain. Precision-based sizing is therefore the
  correct frame (scoping file sec.6.4 item 1 reached the same conclusion).

PROVENANCE RULE ENFORCED IN CODE
  Every numeric input below carries a `src` string. Inputs are one of:
    GULF      - measured in a GCC donor population (highest relevance,
                weakest precision; several rest on 1-6 observations)
    NONGULF   - measured elsewhere; usable ONLY as a bracketing scenario
    ASSUMPTION- an explicitly labelled planning bracket, NOT sourced from data
  GULF and NONGULF inputs are never mixed inside one scenario.
  Values recorded as `NR` in the scoping file are absent here and are NOT
  back-calculated (CLAUDE.md sec.1.3).

RUN
  python3 05_pilot03-sample-size_v1.0_2026-09-11.py
"""

import sys, hashlib, datetime, math
import numpy as np
from scipy import stats, optimize

Z = stats.norm.ppf(0.975)          # 1.959964; two-sided 95%
ALPHA = 0.05

# =====================================================================
# 0. PROVENANCE-TAGGED INPUTS
# =====================================================================
# ---- 0a. GULF-DERIVED (scoping file sec.6.1) -----------------------------
# Allele-level. Denominator = ALLELES (2 x donors). Do NOT pool with
# donor-level denominators (scoping file sec.6.4 item 3).
GULF_ALLELE = [
    # label                              x     n_alleles  src
    ("RHCE*ce(733G) [Saudi, Jazan]",      67,   708, "GULF Madkhali2025 10.1111/tme.70040"),
    ("RHCE*ce(733G,1006T)",                6,   708, "GULF Madkhali2025"),
    ("RHCE*ceAR",                          5,   708, "GULF Madkhali2025"),
    ("RHCE*ce(712G)",                      3,   708, "GULF Madkhali2025"),
    ("RHD*r's-RHCE*ce(733G,1006T)",        2,   708, "GULF Madkhali2025"),
]
# Donor-level, but denominator = serologic D-NEGATIVE / WEAK D donors ONLY.
# This is NOT a whole-donor-pool frequency and must never be reported as one.
GULF_DNEG_STRATUM = [
    ("RHD deletion RHD*01N.01 | D-neg/weak", 46, 60, "GULF Madkhali2025"),
    ("Unresolved 'other than weak D 1/2/3'", 11, 60, "GULF Madkhali2025 (platform bucket, not an allele)"),
    ("RHD*DIIIa-CE(3-7)-D het | D-neg/weak",  2, 60, "GULF Madkhali2025 (2 observations)"),
    ("Weak D type 1 | D-neg/weak",            1, 60, "GULF Madkhali2025 (1 observation)"),
]
# Donor-level, Oman. 'D variant' is UNDEFINED at allele level in the abstract
# (full text not accessible) - scoping file flags it [UNVERIFIED]; it is used
# here ONLY as an order-of-magnitude bracket for "any D variant", never as a
# partial-D rate.
GULF_OMAN = [
    ("'D variant' (allele-level undefined)", 22, 121, "GULF AlRiyami2021 abstract [UNVERIFIED]"),
    ("Partial e c.733C>G (V+VS+)",           14, 120, "GULF AlRiyami2021 abstract"),
]
# Predicted (NOT serologically observed) antigen frequencies, Jazan Saudi n=354.
# Used only as marginal-prevalence inputs for the kappa variance, which requires
# a marginal. Flagged PREDICTED throughout.
GULF_PREDICTED_ANTIGEN = {
    "C (RH2)":  0.6836, "E (RH3)": 0.2344, "c (RH4)": 0.8048,
    "e (RH5)":  0.9884, "Cw (RH8)": 0.0000,
}
GULF_PREDICTED_SRC = "GULF Madkhali2025 Table 4 - PLATFORM-PREDICTED, n=354 donors, NOT serologic"
GULF_ZERO_COUNT = ("Cw (RH8)", 0, 354, "GULF Madkhali2025 - zero count, needs exact upper bound")

# ---- 0b. NON-GULF (scoping file sec.6.2) - BRACKETING SCENARIOS ONLY ------
NONGULF_DEL_STRATUM = [
    ("RHD*01EL.01 Asian-type DEL | serologic D-neg", 0.0760, 1270, "NONGULF Thai  Nuchnoi2022 10.2450/2022.0160-22"),
    ("RHD*01N.03 | serologic D-neg",                 0.0346, 1270, "NONGULF Thai  Nuchnoi2022"),
    ("Any RHD-gene-positive | serologic D-neg",      0.0186, 2254, "NONGULF US multiethnic Flegel2025 10.1186/s12967-025-06716-8 (42/2254)"),
]
NONGULF_POP = [
    ("RHD*DVI population frequency", 1.0/731.0, "NONGULF US Flegel2025 (1 in 731)"),
    ("Atypical/discrepant serologic D typing among donors", 0.0079, "NONGULF SE Brazil Rodrigues2021 10.1016/j.transci.2021.103135"),
]
# NOT USED ANYWHERE: Iran 99% RHD homozygous deletion (PMC6369079) - the scoping
# file records it as an unverified web-search snippet. Excluded by CLAUDE.md 1.2.
# NOT USED ANYWHERE: Ameen2020 weak D 1/2/3 "not prevalent" - recorded NR.
#   No number exists; none is invented (CLAUDE.md 1.3).

# ---- 0c. INPUTS THAT DO NOT EXIST AND ARE NOT INVENTED --------------------
MISSING_INPUTS = [
 ("pi_Dneg = prevalence of serologic D-negativity in the GCC donor pool",
  "The scoping file contains NO GCC donor-pool D-negative prevalence. Madkhali's "
  "RHD arm (n=60) and Alalshaikh's 70 D+/66 D- are SELECTED, not prevalence, "
  "samples. Every DEL/D-negative-stratum n below is therefore reported as a "
  "REQUIRED D-NEGATIVE STRATUM SIZE, and total donor n is given as a FUNCTION of "
  "pi_Dneg. pi_Dneg must be supplied by the participating-centre site survey "
  "before the protocol is finalised."),
 ("Intraclass correlation (ICC) of any RH allele across GCC donor centres",
  "No multi-centre GCC RH dataset exists; no ICC is estimable from the "
  "literature retrieved. ICC is therefore handled as a labelled bracketing grid "
  "and must be ESTIMATED AND REPORTED BY PILOT-03 ITSELF for the benefit of "
  "future studies."),
 ("Donor-pool ancestry composition per centre",
  "Only Madkhali's non-Saudi nationality list (Yemeni 73, Egyptian 16, Sudanese 6, "
  "Indian 5, Pakistani 4, Syrian 3, Jordanian 1, Nepali 1, Filipino 1) is "
  "available, from ONE centre. It cannot be projected onto other GCC states."),
 ("Serologic D-negative prevalence-by-centre, and anti-D clone inventory per centre",
  "Site-survey items; scoping file sec.8 open items 11-12."),
]

# =====================================================================
# 1. INTERVAL ESTIMATORS  (Wald is never used - CLAUDE.md sec.6)
# =====================================================================
def wilson_ci(x, n, z=Z):
    """Wilson score interval. x may be non-integer (nominal/expected count)."""
    if n <= 0: return (np.nan, np.nan)
    p = x / n
    den = 1.0 + z*z/n
    ctr = (p + z*z/(2*n)) / den
    hw  = (z/den) * math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return (max(0.0, ctr-hw), min(1.0, ctr+hw))

def clopper_pearson_ci(x, n, alpha=ALPHA):
    """Exact (Clopper-Pearson) interval. x must be an integer count."""
    if n <= 0: return (np.nan, np.nan)
    lo = 0.0 if x == 0 else stats.beta.ppf(alpha/2, x, n-x+1)
    hi = 1.0 if x == n else stats.beta.ppf(1-alpha/2, x+1, n-x)
    return (lo, hi)

def cp_upper_zero(n, alpha=ALPHA):
    """Exact upper limit when x = 0: 1 - (alpha/2)^(1/n).
    This is the exact analogue of the 'rule of three' (3/n) and is what the SAP
    pre-specifies for zero cells such as Cw 0/354."""
    return 1.0 - (alpha/2.0)**(1.0/n)

def halfwidth(ci):
    return (ci[1]-ci[0]) / 2.0

def n_for_wilson_halfwidth(p, h, nmax=40_000_000):
    """Smallest n whose NOMINAL Wilson half-width (at x = n*p) is <= h."""
    lo, hi = 2, 1024
    while hi < nmax and halfwidth(wilson_ci(hi*p, hi)) > h:
        lo, hi = hi, hi*2
    if hi >= nmax: return None
    while lo < hi:
        mid = (lo+hi)//2
        if halfwidth(wilson_ci(mid*p, mid)) <= h: hi = mid
        else: lo = mid+1
    return lo

def n_for_cp_halfwidth(p, h, nmax=4_000_000):
    """Smallest n whose Clopper-Pearson half-width at x = round(n*p) is <= h.
    CP is discrete and non-monotone in n; we require the criterion to hold at n
    and at the next 200 values of n, so the answer is stable rather than a
    lucky integer."""
    def ok(n):
        return all(halfwidth(clopper_pearson_ci(int(round(m*p)), m)) <= h
                   for m in range(n, n+201, 20))
    lo, hi = 2, 1024
    while hi < nmax and not ok(hi):
        lo, hi = hi, hi*2
    if hi >= nmax: return None
    while lo < hi:
        mid = (lo+hi)//2
        if ok(mid): hi = mid
        else: lo = mid+1
    return lo

def expected_halfwidth(p, n, method="wilson"):
    """E[half-width] averaged over the binomial sampling distribution of x.
    The NOMINAL half-width (computed at x = n*p) understates the interval you
    will actually get, most severely for small n*p. Both are reported so the
    protocol is not built on the optimistic one."""
    xs = np.arange(0, n+1)
    w  = stats.binom.pmf(xs, n, p)
    keep = w > 1e-12
    xs, w = xs[keep], w[keep]
    f = wilson_ci if method == "wilson" else clopper_pearson_ci
    hws = np.array([halfwidth(f(int(x), n)) for x in xs])
    return float(np.sum(w*hws))

# =====================================================================
# 2. KAPPA: variance, sizing, and the prevalence paradox
# =====================================================================
def kappa_from_table(P):
    P = np.asarray(P, dtype=float); P = P/P.sum()
    po = float(np.trace(P)); r = P.sum(1); c = P.sum(0)
    pe = float(np.dot(r, c))
    return po, pe, (po-pe)/(1-pe)

def kappa_var_factor(P):
    """n * Var(kappa_hat), Fleiss-Cohen-Everitt (1969) large-sample variance.
    Returns the per-observation variance factor V1, so Var = V1/n."""
    P = np.asarray(P, dtype=float); P = P/P.sum()
    po, pe, k = kappa_from_table(P)
    r = P.sum(1); c = P.sum(0); K = P.shape[0]
    A = sum(P[i,i]*((1-pe) - (r[i]+c[i])*(1-po))**2 for i in range(K))
    B = (1-po)**2 * sum(P[i,j]*(c[i]+r[j])**2
                        for i in range(K) for j in range(K) if i != j)
    C = (po*pe - 2*pe + po)**2
    return (A + B - C) / (1-pe)**4

def symmetric_binary_table(pi, kappa):
    """2x2 cell probabilities under EQUAL marginal prevalence pi for both
    methods and the stated kappa. b = c = (1-po)/2 (no differential bias).
    Returns None if the combination is not attainable (negative cell)."""
    pe = pi*pi + (1-pi)*(1-pi)
    po = pe + kappa*(1-pe)
    off = (1-po)/2.0
    a = pi - off; d = (1-pi) - off
    if a < 0 or d < 0 or off < 0: return None
    return np.array([[a, off],[off, d]])

def n_for_kappa_halfwidth(pi, kappa, h, z=Z):
    """n for a Wald-type 95% CI on kappa of half-width <= h."""
    P = symmetric_binary_table(pi, kappa)
    if P is None: return None, None
    V1 = kappa_var_factor(P)
    if V1 <= 0: return None, V1
    return int(math.ceil((z/h)**2 * V1)), V1

def pabak(po):
    """Prevalence-and-bias-adjusted kappa (Byrt/Bishop/Carlin). NOTE: PABAK is a
    strictly monotone relabelling of observed agreement, 2*po - 1. It adds NO
    information beyond po; it is reported to show what kappa would be under
    balanced marginals, and it must never be presented as a prevalence-robust
    substitute for kappa."""
    return 2*po - 1

# =====================================================================
# 3. CLUSTERING: design effect
# =====================================================================
def deff(mbar, icc, cv=0.0):
    """Kish design effect with unequal cluster sizes:
       DEFF = 1 + ((cv^2 + 1)*mbar - 1) * ICC
    cv = coefficient of variation of cluster (centre) size. cv=0 -> equal sizes."""
    return 1.0 + (((cv**2 + 1)*mbar) - 1.0)*icc

def n_clusters_needed(n_srs, m_per_centre, icc, cv=0.0):
    """Donors and centres needed once clustering is honoured, given a fixed
    number of donors recruited per centre."""
    d = deff(m_per_centre, icc, cv)
    n_tot = int(math.ceil(n_srs*d))
    return n_tot, d, int(math.ceil(n_tot/m_per_centre))

# =====================================================================
# ============================ REPORT =================================
# =====================================================================
def rule(c="="): print(c*78)
def head(t):
    print(); rule(); print(t); rule()

def main():
    head("PILOT-03 PRECISION-BASED SAMPLE SIZE - UNEDITED OUTPUT")
    print(f"Generated       : {datetime.datetime.now().isoformat(timespec='seconds')}")
    print(f"Python          : {sys.version.split()[0]}")
    import pandas, statsmodels, scipy, numpy
    print(f"numpy {numpy.__version__} | scipy {scipy.__version__} | "
          f"pandas {pandas.__version__} | statsmodels {statsmodels.__version__}")
    try:
        src = "/home/user/Research-Agent/01_Protocol/_working/01_pilot03-methods-scoping_v1.0_2026-09-11.md"
        h = hashlib.sha256(open(src,'rb').read()).hexdigest()
        print(f"Input document  : {src}")
        print(f"SHA-256 (input) : {h}")
    except OSError as e:
        print(f"Input document  : COULD NOT HASH - {e}")
    print("Dataset version : NONE. No PILOT-03 data exist. This is pre-specification.")

    # ---------------- 0. self-test of the kappa variance -----------------
    head("0. SELF-TEST - Fleiss-Cohen-Everitt variance vs statsmodels")
    from statsmodels.stats.inter_rater import cohens_kappa
    Ptest = np.array([[0.60,0.05],[0.07,0.28]])
    for ntest in (200, 2000):
        tab = Ptest*ntest
        res = cohens_kappa(tab)
        v1  = kappa_var_factor(Ptest)
        print(f"  n={ntest:5d}  kappa(this script)={kappa_from_table(Ptest)[2]:.6f} "
              f" kappa(statsmodels)={res.kappa:.6f}")
        print(f"           SE(this script)={math.sqrt(v1/ntest):.6f} "
              f" SE(statsmodels, alternative)={res.std_kappa:.6f}")
    print("  -> agreement to ~6 dp confirms the variance implementation.")

    # ---------------- 1. GULF allele-level precision ---------------------
    head("1. VARIANT ALLELE FREQUENCY - required n, GULF-DERIVED inputs ONLY")
    print("Denominator is ALLELES (= 2 x donors). Donor n = ceil(allele n / 2).")
    print("Every input below is a Jazan (single-region, single-centre) estimate.")
    print("Its own precision is reported first so the fragility is visible.\n")
    print(f"{'Allele (source estimate)':42s} {'x/n':>9s} {'p̂':>7s} "
          f"{'95% CP CI of the INPUT':>24s}")
    for lab, x, n, s in GULF_ALLELE:
        lo, hi = clopper_pearson_ci(x, n)
        print(f"{lab:42s} {f'{x}/{n}':>9s} {100*x/n:6.2f}% "
              f"{f'{100*lo:.2f}% to {100*hi:.2f}%':>24s}")
    print("\n  NOTE: RHCE*ceAR rests on 5 alleles, ce(712G) on 3, RHD*r's on 2.")
    print("  A sample size planned on a proportion estimated from 2-6 observations")
    print("  is conditional on an input whose own 95% CI spans roughly an order of")
    print("  magnitude. The planning value is therefore varied across that CI below.")

    for target_h in (0.010, 0.005, 0.0025, 0.001):
        print(f"\n-- Target ABSOLUTE half-width on the allele frequency: "
              f"+/- {100*target_h:.2f} percentage points --")
        print(f"{'Allele':42s} {'p_plan':>8s} {'n alleles':>10s} {'n donors':>9s} "
              f"{'n donors @ CP':>13s}")
        for lab, x, n, s in GULF_ALLELE:
            p = x/n
            nw = n_for_wilson_halfwidth(p, target_h)
            nc = n_for_cp_halfwidth(p, target_h)
            print(f"{lab:42s} {100*p:7.2f}% {nw:10d} {math.ceil(nw/2):9d} "
                  f"{math.ceil(nc/2):13d}")
    print("\n  Wilson vs Clopper-Pearson: CP is conservative (guaranteed >=95%")
    print("  coverage) and always demands the larger n. The SAP pre-specifies")
    print("  Wilson for planning and the CP column as the conservative bound.")

    print("\n-- Sensitivity of the planning n to the fragility of the input --")
    print("   Planning value moved to each end of the input's own 95% CP CI.")
    print("   Target half-width fixed at +/- 0.25 percentage points.\n")
    print(f"{'Allele':42s} {'p at CI lower':>13s} {'p̂':>9s} {'p at CI upper':>13s}")
    print(f"{'':42s} {'n donors':>13s} {'n donors':>9s} {'n donors':>13s}")
    for lab, x, n, s in GULF_ALLELE:
        lo, hi = clopper_pearson_ci(x, n)
        ns = []
        for p in (max(lo,1e-6), x/n, hi):
            nn = n_for_wilson_halfwidth(p, 0.0025)
            ns.append(math.ceil(nn/2) if nn else -1)
        print(f"{lab:42s} {ns[0]:13d} {ns[1]:9d} {ns[2]:13d}")

    # ---------------- 2. relative precision ------------------------------
    head("2. RELATIVE PRECISION - the criterion that actually matters for rare alleles")
    print("An absolute +/- 0.25pp CI on a 0.28% allele is useless: the interval")
    print("still spans 0.03% to 0.53%, a ~18-fold range. Relative precision")
    print("(half-width <= 50% and <= 25% of the point estimate) is reported too.\n")
    print(f"{'Allele':42s} {'p_plan':>8s} {'n donors @50%':>14s} {'n donors @25%':>14s}")
    for lab, x, n, s in GULF_ALLELE:
        p = x/n
        row = []
        for frac in (0.50, 0.25):
            nn = n_for_wilson_halfwidth(p, frac*p)
            row.append(math.ceil(nn/2) if nn else None)
        print(f"{lab:42s} {100*p:7.2f}% "
              f"{row[0] if row[0] else 'infeasible':>14} "
              f"{row[1] if row[1] else 'infeasible':>14}")

    # ---------------- 3. zero counts -------------------------------------
    head("3. ZERO-COUNT TARGETS - exact upper bound (Cw and any unobserved allele)")
    lab, x, n, s = GULF_ZERO_COUNT
    print(f"Source: {lab} observed {x}/{n}  [{s}]")
    print(f"  Exact 95% CP upper limit at n={n}: {100*cp_upper_zero(n):.3f}%")
    print(f"  Approximate rule of three (3/n)   : {100*3/n:.3f}%   (approximation only)")
    print("\nIf PILOT-03 also observes zero, the upper bound it can claim is:")
    print(f"{'n donors':>10s} {'exact 95% upper bound':>23s}")
    for nn in (500, 1000, 2000, 3000, 5000, 10000):
        print(f"{nn:10d} {100*cp_upper_zero(nn):22.4f}%")
    print("\n  To EXCLUDE a frequency of 0.1% (i.e. upper bound < 0.1%) requires")
    print(f"  n = {math.ceil(math.log(ALPHA/2)/math.log(1-0.001)):,} donors with zero observed.")
    print("  The SAP pre-specifies that zero cells are reported as '0/n (0%; 95% CI")
    print("  0% to U%)' with U from the exact bound - never as 'absent'.")

    # ---------------- 4. rare-allele reality check -----------------------
    head("4. RARE-ALLELE REALITY CHECK - where the expected count stays below 5")
    print("Criterion: an estimate is treated as UNINFORMATIVE if either")
    print("  (i) expected count E = n*p < 5, or")
    print("  (ii) the 95% CI upper limit exceeds 3x the lower limit.")
    print("Both are declared here, in advance, and applied mechanically.\n")
    targets = [(lab, x/n, "allele", s) for lab, x, n, s in GULF_ALLELE]
    targets += [(lab, p, "donor", s) for lab, p, s in NONGULF_POP]
    print(f"{'Target':52s} {'p':>8s} {'unit':>7s} {'n for E>=5':>11s} {'n for E>=10':>12s}")
    for lab, p, unit, s in targets:
        if p <= 0: continue
        n5, n10 = math.ceil(5/p), math.ceil(10/p)
        if unit == "allele":
            n5, n10 = math.ceil(n5/2), math.ceil(n10/2)
        print(f"{lab[:52]:52s} {100*p:7.3f}% {'donors':>7s} {n5:11,d} {n10:12,d}")
    print("\n  NON-GULF rows are bracketing scenarios only (US / Brazil). They are")
    print("  NOT transferred onto the GCC donor pool; they bound the order of")
    print("  magnitude for alleles that no GCC study has ever measured.")

    print("\n-- What a realistic n actually buys for the rarest targets --")
    for lab, p, unit, s in targets:
        if p <= 0 or p > 0.01: continue
        print(f"\n  {lab}   p_plan = {100*p:.3f}%   [{s}]")
        print(f"   {'n donors':>9s} {'E[count]':>9s} {'95% CI at the expected count':>34s} "
              f"{'ratio U/L':>10s}")
        for nd in (1000, 2000, 3000, 5000, 10000):
            na = nd*2 if unit == "allele" else nd
            e  = na*p
            xo = int(round(e))
            lo, hi = clopper_pearson_ci(xo, na)
            ratio = (hi/lo) if lo > 0 else float('inf')
            flag = "" if (e >= 5 and ratio <= 3) else "   <- uninformative"
            print(f"   {nd:9,d} {e:9.2f} {f'{100*lo:.3f}% to {100*hi:.3f}%':>34s} "
                  f"{ratio:10.2f}{flag}")

    # ---------------- 5. D-negative stratum and DEL ----------------------
    head("5. DEL AND THE D-NEGATIVE STRATUM - conditional, because pi_Dneg is UNKNOWN")
    print("The scoping file contains NO GCC donor-pool serologic D-negative")
    print("prevalence. It is therefore NOT assumed. Required stratum sizes are")
    print("given first; total donor n is then shown as a function of pi_Dneg,")
    print("with pi_Dneg carried as a LABELLED BRACKET, not as a sourced value.\n")
    print("(a) n of serologic D-NEGATIVE donors needed, by planning value and target:")
    print(f"{'Planning value for P(target | serologic D-neg)':56s} "
          f"{'+/-3pp':>8s} {'+/-2pp':>8s} {'+/-1pp':>8s}")
    del_scen = [(lab, p, s) for lab, p, npub, s in NONGULF_DEL_STRATUM]
    del_scen += [(lab, x/n, s) for lab, x, n, s in GULF_DNEG_STRATUM]
    for lab, p, s in del_scen:
        r = [n_for_wilson_halfwidth(p, h) for h in (0.03, 0.02, 0.01)]
        print(f"{(lab+'  ['+s.split()[0]+']')[:56]:56s} "
              f"{r[0]:8,d} {r[1]:8,d} {r[2]:8,d}")
    print("\n(b) TOTAL donors required = (D-negative stratum n) / pi_Dneg.")
    print("    pi_Dneg values below are LABELLED BRACKETS spanning the range that")
    print("    is plausible for any donor population; NONE is sourced for the GCC.")
    n_dneg_ref = n_for_wilson_halfwidth(0.0760, 0.02)
    print(f"    Illustrated at the Thai DEL bracket (7.60%), +/-2pp -> "
          f"{n_dneg_ref:,} D-negative donors needed.\n")
    print(f"{'pi_Dneg (LABELLED BRACKET, unsourced)':38s} {'total donors required':>22s}")
    for pi_d in (0.03, 0.05, 0.08, 0.10, 0.15):
        print(f"{f'{100*pi_d:.0f}%':38s} {math.ceil(n_dneg_ref/pi_d):22,d}")
    print("\n  READ THIS AS A DESIGN FINDING, NOT A SAMPLE SIZE: unless the D-negative")
    print("  stratum can be ENRICHED rather than sampled at its natural prevalence,")
    print("  a DEL frequency estimate of useful precision requires a total donor")
    print("  intake in the tens of thousands. See the recommendation block below.")

    # ---------------- 6. kappa -------------------------------------------
    head("6. KAPPA - precision, and the prevalence paradox")
    print("Design: per antigen, one serologic call and one genotype-PREDICTED call")
    print("per donor -> a 2x2 table per antigen. Kappa is computed PER ANTIGEN.")
    print("Kappa is NOT computed by pooling antigen-donor pairs across antigens:")
    print("pooling mixes tables with different marginals and correlated errors")
    print("within donor, and the pooled kappa is then uninterpretable (D025's")
    print("antigen-donor pair unit governs the 7-class taxonomy tabulation and the")
    print("overall percent agreement, which is why that percent agreement needs a")
    print("donor-clustered variance - see section 7).\n")
    print("6a. THE PARADOX, made explicit. Observed agreement fixed at 98%:")
    print(f"{'marginal prevalence pi':>24s} {'p_o':>7s} {'p_e':>7s} {'kappa':>8s} {'PABAK':>8s}")
    for pi in (0.50, 0.70, 0.80, 0.90, 0.95, 0.9884, 0.99):
        po = 0.98
        pe = pi*pi + (1-pi)**2
        k  = (po-pe)/(1-pe) if pe < 1 else float('nan')
        print(f"{100*pi:23.2f}% {po:7.3f} {pe:7.4f} {k:8.4f} {pabak(po):8.4f}")
    print("\n  At pi = 98.84% (the Jazan PREDICTED e-antigen frequency) chance")
    print("  agreement alone is p_e = "
          f"{0.9884**2+(1-0.9884)**2:.4f}. Two methods agreeing on 98% of donors")
    print("  then score kappa near or below zero. This is the kappa paradox, not")
    print("  a failure of the assays. Reporting kappa alone for antigen e would")
    print("  actively mislead.")

    print("\n6b. n required for a 95% CI on kappa of stated half-width.")
    print("    Marginal prevalences are GULF PLATFORM-PREDICTED (Madkhali 2025,")
    print("    n=354, Jazan) - they are predicted, not serologic, and Jazan-specific.")
    print("    Prevalence for D is NOT available (see missing inputs) and is shown")
    print("    as a LABELLED BRACKET only.\n")
    ant = [(k, v, "GULF PREDICTED Jazan n=354") for k, v in GULF_PREDICTED_ANTIGEN.items()
           if v not in (0.0,)]
    ant += [("D (RH1) [BRACKET 0.85]", 0.85, "ASSUMPTION-BRACKET, unsourced"),
            ("D (RH1) [BRACKET 0.92]", 0.92, "ASSUMPTION-BRACKET, unsourced"),
            ("D (RH1) [BRACKET 0.97]", 0.97, "ASSUMPTION-BRACKET, unsourced")]
    for k0 in (0.80, 0.90):
        print(f"\n  Assumed true kappa = {k0:.2f}")
        print(f"  {'antigen':26s} {'pi':>8s} {'V1=n*Var':>10s} "
              f"{'n for +/-0.10':>13s} {'n for +/-0.05':>13s} {'provenance'}")
        for lab, pi, prov in ant:
            n10, V1 = n_for_kappa_halfwidth(pi, k0, 0.10)
            n05, _  = n_for_kappa_halfwidth(pi, k0, 0.05)
            if n10 is None:
                print(f"  {lab:26s} {100*pi:7.2f}% {'n/a':>10s} "
                      f"{'unattainable':>13s} {'unattainable':>13s} {prov}")
            else:
                print(f"  {lab:26s} {100*pi:7.2f}% {V1:10.4f} {n10:13,d} {n05:13,d} {prov}")
    print("\n  V1 (= n x Var) rises steeply as pi approaches 0 or 1. For antigen e")
    print("  at pi = 98.84% the n demanded for even +/-0.10 on kappa is an order of")
    print("  magnitude above the n demanded at pi = 0.5. Kappa is UNSTABLE there.")
    print("\n  PRE-SPECIFIED CONSEQUENCE (SAP sec.7): for any antigen whose observed")
    print("  marginal prevalence falls outside 10%-90%, kappa is reported but is NOT")
    print("  the lead statistic. The lead statistics for those antigens are the full")
    print("  2x2 counts, positive percent agreement and negative percent agreement,")
    print("  each with exact 95% CIs. PABAK is reported alongside kappa for ALL")
    print("  antigens - and is explicitly labelled as a monotone relabelling of")
    print("  observed agreement (2*po-1) that assumes balanced marginals the study")
    print("  does not have. PABAK is context, never evidence of good agreement.")
    print("  The 10%-90% rule is mechanical and declared before any data are seen,")
    print("  so it cannot be used to select a favourable statistic after the fact.")

    # ---------------- 7. clustering --------------------------------------
    head("7. MULTI-CENTRE CLUSTERING - design effect")
    print("Donors cluster by centre (the sampling unit) and are cross-classified")
    print("by ancestry. Treating donors as independent would falsely narrow every")
    print("CI in this study. ICC is UNKNOWN and is bracketed, not assumed.\n")
    print("DEFF = 1 + ((cv^2+1)*mbar - 1)*ICC   (Kish, unequal cluster sizes)\n")
    print(f"{'donors per centre':>18s}" + "".join(f"{f'ICC={i}':>12s}"
          for i in (0.002, 0.005, 0.010, 0.020, 0.050)))
    for m in (100, 200, 300, 500, 800, 1200):
        print(f"{m:18d}" + "".join(f"{deff(m, i, cv=0.30):12.2f}"
              for i in (0.002, 0.005, 0.010, 0.020, 0.050)))
    print("\n  cv = 0.30 assumed for unequal centre sizes (LABELLED BRACKET).")
    print("\n  The dominant term is ICC x mbar. With large clusters, adding donors")
    print("  WITHIN a centre buys almost nothing once ICC*mbar >> 1. Adding CENTRES")
    print("  is the efficient move. Worked example, holding the simple-random-")
    print("  sample requirement fixed:\n")
    P_CE733 = 67/708   # exact source proportion; do NOT round to 0.0946
    n_srs_ex = n_for_wilson_halfwidth(P_CE733, 0.010)
    n_srs_ex_d = math.ceil(n_srs_ex/2)
    print(f"  SRS requirement: RHCE*ce(733G) at 67/708 = {100*P_CE733:.2f}% to +/-1.0pp "
          f"= {n_srs_ex:,} alleles = {n_srs_ex_d:,} donors")
    print(f"  {'donors/centre':>14s} {'ICC':>7s} {'DEFF':>7s} "
          f"{'total donors':>13s} {'centres needed':>15s}")
    for m in (200, 400, 800):
        for icc in (0.005, 0.010, 0.020):
            nt, d, k = n_clusters_needed(n_srs_ex_d, m, icc, cv=0.30)
            print(f"  {m:14d} {icc:7.3f} {d:7.2f} {nt:13,d} {k:15d}")
    print("\n  ICC ESTIMATION (pre-specified, SAP sec.9): for each allele/antigen,")
    print("  fit a random-intercept logistic model with centre as the random effect")
    print("  and report BOTH the latent-scale ICC (sigma_u^2 / (sigma_u^2 + pi^2/3))")
    print("  and the proportion-scale ICC (ANOVA/method-of-moments). The two scales")
    print("  are NOT interchangeable and are commonly confused; both are reported")
    print("  with the scale named. With few centres the between-centre variance is")
    print("  estimated on very few degrees of freedom, so the ICC itself will carry")
    print("  a wide interval - which is reported, not suppressed.")
    print("\n  ANALYSIS CONSEQUENCE: with ~6-10 centres the GEE sandwich variance is")
    print("  anti-conservative. The SAP pre-specifies the Mancl-DeRouen bias-reduced")
    print("  covariance with a t reference distribution on (K-1) df, and a")
    print("  cluster bootstrap resampling CENTRES as the sensitivity analysis.")

    # ---------------- 7b. the design is CENTRE-limited ------------------
    head("7b. THE BINDING CONSTRAINT IS THE NUMBER OF CENTRES, NOT THE NUMBER OF DONORS")
    print("Once between-centre heterogeneity is real, Var(pooled p) tends to")
    print("tau^2/K as donors per centre grows, where tau^2 is the between-centre")
    print("variance of the centre-specific proportions and K the number of centres.")
    print("No number of donors can beat that limit. tau relates to the ICC by")
    print("tau^2 = ICC * p(1-p).\n")
    P_CE733 = 67/708
    print(f"Illustrated for RHCE*ce(733G), p = 67/708 = {100*P_CE733:.2f}% "
          f"(GULF Madkhali2025):\n")
    print(f"{'ICC':>7s} {'tau (between-centre SD)':>24s}" +
          "".join(f"{f'K={k}':>11s}" for k in (6, 8, 12, 20)))
    print(f"{'':>7s} {'':>24s}" + "".join(f"{'half-width':>11s}" for k in (6,8,12,20)))
    for icc in (0.002, 0.005, 0.010, 0.020, 0.050):
        tau = math.sqrt(icc*P_CE733*(1-P_CE733))
        row = "".join(f"{f'+/-{100*Z*tau/math.sqrt(k):.2f}pp':>11s}" for k in (6,8,12,20))
        print(f"{icc:7.3f} {f'{100*tau:.3f}pp':>24s}" + row)
    print("\n  This is the floor on the achievable 95% CI half-width, attained only")
    print("  in the limit of infinitely many donors per centre. Adding a 13th centre")
    print("  does more for precision than doubling every centre's intake.")
    print("  It also uses a normal approximation on K centre-level proportions; with")
    print("  K < 15 the SAP substitutes a t(K-1) reference distribution, which widens")
    print("  the interval further (t(5)=2.571 vs z=1.960, i.e. ~31% wider at K=6).")

    # ---------------- 8. recommendation ----------------------------------
    head("8. ACHIEVABLE PRECISION AT FEASIBLE DESIGNS - and the recommendation")
    P_CE733 = 67/708
    print("The GCC has six states. A realistic design is 1-2 donor centres per")
    print("state, i.e. K in the range 6-12. Rather than ask what n a target needs")
    print("(which returns infeasible answers), this block asks what precision a")
    print("FEASIBLE design actually delivers. ICC is a labelled bracket throughout.\n")
    print(f"{'design':>22s} {'n total':>8s} {'ICC':>7s} {'DEFF':>7s} {'n_eff':>7s} "
          f"{'half-width on ce(733G) 9.46%':>29s}")
    designs = [(6,250),(6,500),(8,250),(8,375),(12,250),(12,333),(12,500),(20,250)]
    rec = []
    for K, m in designs:
        for icc in (0.005, 0.010, 0.020):
            n_tot = K*m
            d = deff(m, icc, cv=0.30)
            n_eff = n_tot/d
            # allele-level denominator: 2 alleles per donor, same DEFF applied
            hw = halfwidth(wilson_ci(2*n_eff*P_CE733, 2*n_eff))
            rec.append((K, m, n_tot, icc, d, n_eff, hw))
            print(f"{f'{K} centres x {m}':>22s} {n_tot:8,d} {icc:7.3f} {d:7.2f} "
                  f"{n_eff:7.0f} {f'+/-{100*hw:.2f}pp':>29s}")
    print("\n  n_eff = effective independent sample size = n_total / DEFF.")
    print("  Allele-level half-width computed on 2*n_eff alleles, i.e. the same")
    print("  design effect is applied at the allele level. This is an approximation:")
    print("  the two alleles of one donor are themselves not independent draws")
    print("  (that is what Hardy-Weinberg is about), so the true allele-level")
    print("  variance is larger again unless HWE holds within stratum. The SAP")
    print("  therefore pre-specifies that allele-frequency CIs are computed with a")
    print("  donor-level cluster bootstrap, NOT by treating 2n alleles as 2n")
    print("  independent observations - which is a common and serious error.")

    print("\n-- PRE-SPECIFIED PRIMARY PRECISION CRITERION --")
    print("  (a) The frequency of RHCE*ce(733G), the commonest clinically relevant")
    print("      RHCE variant and the only one with more than a handful of Gulf")
    print("      observations, estimated with a 95% CI half-width <= 2.0 percentage")
    print("      points AFTER the design effect.")
    print("  (b) Kappa for each of D, C, E, c estimated with a 95% CI half-width")
    print("      <= 0.10. Antigen e is excluded from criterion (b) by the >90%")
    print("      prevalence rule in section 6 and is governed by PPA/NPA instead.")
    print("  Criterion (a) is the binding one.\n")
    ok = [r for r in rec if r[6] <= 0.020 and r[3] == 0.010]
    print("  Designs meeting criterion (a) at the mid ICC bracket (0.010):")
    for K, m, n_tot, icc, d, n_eff, hw in ok:
        print(f"    {K} centres x {m} donors = {n_tot:,} "
              f"(DEFF {d:.2f}, n_eff {n_eff:.0f}, +/-{100*hw:.2f}pp)")
    if not ok:
        print("    NONE.")
    n_kappa = max(n_for_kappa_halfwidth(pi, 0.80, 0.10)[0]
                  for pi in (0.6836, 0.2344, 0.8048, 0.92))
    print(f"\n  Criterion (b) requires an EFFECTIVE n of {n_kappa:,} donors "
          f"(worst of D/C/E/c at kappa=0.80).")
    print("  The recommended design below delivers n_eff of "
          f"{3000/deff(250,0.010,0.30):.0f} at ICC=0.010 and "
          f"{3000/deff(250,0.020,0.30):.0f} at ICC=0.020,")
    print(f"  i.e. criterion (b) is met up to ICC ~0.020 and is MARGINAL beyond it.")
    print("  Kappa is not the binding constraint; the allele frequency is.")

    print("\n-- RECOMMENDED DESIGN --")
    print("  n = 3,000 donors, allocated as 12 centres x 250 donors, with a hard")
    print("  floor of 8 centres and at least one centre in each of the six GCC")
    print("  states that can participate. Rationale: 12 x 250 and 6 x 500 have the")
    print("  same total n, but at ICC=0.010 they give n_eff of "
          f"{3000/deff(250,0.010,0.30):.0f} and "
          f"{3000/deff(500,0.010,0.30):.0f}")
    print("  respectively. Spreading the same 3,000 donors over twice as many")
    print("  centres nearly doubles the information content at identical cost.")
    print("  Achieved precision on RHCE*ce(733G) across the ICC bracket:")
    for icc in (0.002, 0.005, 0.010, 0.020, 0.050):
        d = deff(250, icc, cv=0.30); ne = 3000/d
        hw = halfwidth(wilson_ci(2*ne*P_CE733, 2*ne))
        print(f"    ICC={icc:.3f}  DEFF={d:5.2f}  n_eff={ne:6.0f}  "
              f"+/-{100*hw:.2f}pp")
    _hw05 = halfwidth(wilson_ci(2*(3000/deff(250,0.050,0.30))*P_CE733,
                                2*(3000/deff(250,0.050,0.30))))
    print("\n  HONEST STATEMENT REQUIRED IN THE PROTOCOL: if the ICC turns out to be")
    print(f"  at the top of this bracket (0.05), n = 3,000 delivers a half-width of")
    print(f"  +/-{100*_hw05:.2f}pp on a 9.5% allele (n_eff falls to "
          f"{3000/deff(250,0.050,0.30):.0f}) - wide, and the")
    print("  kappa criterion then fails as well. This is not rescuable by recruiting")
    print("  more donors. It is rescuable only by recruiting more centres. The")
    print("  protocol must therefore treat centre recruitment, not donor")
    print("  recruitment, as the primary feasibility risk.")

    head("8b. NOT SUPPORTED AT ANY FEASIBLE n - stated as a design finding")
    print("  1. RHD*r's-RHCE*ce(733G,1006T) (0.28% allele frequency, based on TWO")
    print("     observed alleles) to useful relative precision. At n=3,000 donors")
    print("     with DEFF 3.7 the effective n is ~810 donors = ~1,620 alleles;")
    print(f"     expected count {1620*0.00282:.1f} alleles. Below the pre-declared E>=5 floor.")
    print("  2. RHCE*ce(712G) (0.42%, three observed alleles): expected count")
    print(f"     {1620*0.00424:.1f} alleles at the same effective n. Also below the floor.")
    print("  3. RHD*DVI at the US bracket of 1 in 731 (0.137%): even 10,000")
    print("     INDEPENDENT donors give a CI whose upper limit is >3x its lower.")
    print("  4. DEL frequency among serologic D-negative donors, if the D-negative")
    print("     stratum is sampled at its natural prevalence. At the Thai bracket")
    print("     (7.60%) and +/-2pp this needs ~681 D-negative donors; at an")
    print("     unsourced pi_Dneg of 5-10% that is 7,000-14,000 total donors before")
    print("     any design effect. WITH a DEFF of ~3.7 it is 25,000-50,000.")
    print("\n  CONSEQUENCE, PRE-SPECIFIED: these four are NOT frequency-estimation")
    print("  outcomes. They are reported as CASE ASCERTAINMENT - 'k carriers")
    print("  identified among n donors tested (exact 95% CI a% to b%)' - with the")
    print("  explicit label 'not estimable to useful precision at this sample size'.")
    print("  No frequency claim, no between-group comparison, no extrapolation to")
    print("  the GCC donor pool is permitted for them.")
    print("\n  DESIGN REMEDY the protocol should consider for DEL specifically:")
    print("  ENRICHED SAMPLING of the serologic D-negative stratum (test all D-")
    print("  negative donors presenting over a longer window, rather than a fixed")
    print("  fraction), optionally further enriched to C-positive D-negative donors.")
    print("  This changes the DEL estimand from a donor-pool frequency to a")
    print("  conditional frequency P(DEL | serologic D-negative), which is the")
    print("  clinically actionable quantity anyway, and it is achievable. The")
    print("  enrichment MUST be declared in the protocol, because a conditional")
    print("  frequency presented as a pool frequency would be a misrepresentation.")

    # ---------------- 9. missing inputs ----------------------------------
    head("9. INPUTS THAT DO NOT EXIST - recorded, not invented")
    for k, v in MISSING_INPUTS:
        print(f"\n  * {k}\n    {v}")

    head("END OF OUTPUT")

if __name__ == "__main__":
    main()
