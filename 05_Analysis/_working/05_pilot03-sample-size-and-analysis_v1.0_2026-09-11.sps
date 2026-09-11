* ============================================================================ .
* PILOT-03 - SPSS SYNTAX                                                       .
* File   : 05_pilot03-sample-size-and-analysis_v1.0_2026-09-11.sps             .
* Author : biostatistics-expert (agent), for Dr. Fehaid M. Alanazi             .
* Date   : 2026-09-11                                                          .
* ---------------------------------------------------------------------------- .
* HONESTY STATEMENT, REQUIRED BY DECISION_LOG D003 AND CLAUDE.md 1.9:          .
*   SPSS IS NOT INSTALLED IN THE ENVIRONMENT WHERE THIS FILE WAS WRITTEN.      .
*   THIS SYNTAX HAS NOT BEEN EXECUTED. NO SPSS OUTPUT EXISTS.                  .
*   The reported numbers come from the Python script                           .
*     05_pilot03-sample-size_v1.0_2026-09-11.py                                .
*   whose unedited output is                                                    .
*     05_pilot03-sample-size-output_v1.0_2026-09-11.txt                        .
*   This file is provided so Dr. Alanazi can reproduce and verify the same      .
*   computations natively. Any disagreement between the two is a finding to be  .
*   reported, not reconciled by preferring the convenient one.                  .
* ---------------------------------------------------------------------------- .
* CONTENTS                                                                      .
*   PART 1  Sample-size arithmetic (Blocks A-E) - reproduces the Python script  .
*   PART 2  The pre-specified PILOT-03 analysis (Blocks F-L)                    .
*   PART 3  Python-vs-SPSS default differences, and which one is reported       .
* ============================================================================ .

SET PRINTBACK=ON MPRINT=ON ERRORS=BOTH RESULTS=BOTH.
SET OVARS=BOTH OVALUES=BOTH TNUMBERS=BOTH.
SHOW VERSION.
* ^ record the SPSS version in the output. Several procedures below are         .
*   version-dependent and the version must be recorded for reproducibility.     .


* ############################################################################ .
* PART 1 - SAMPLE-SIZE ARITHMETIC                                               .
* ############################################################################ .
* SPSS Statistics has NO built-in sample-size / precision procedure. (SamplePower.
* is a separate licensed product and is NOT assumed here.) Everything below is   .
* therefore computed from first principles with COMPUTE, which has the advantage .
* that every formula is visible and auditable.                                   .


* ---------------------------------------------------------------------------- .
* BLOCK A - Wilson score and Clopper-Pearson exact intervals for a proportion.  .
* Wald is NOT implemented anywhere in this file. CLAUDE.md sec.6: Wald is invalid.
* near 0 and 1, which is where every rare-allele estimate in PILOT-03 sits.      .
* ---------------------------------------------------------------------------- .
* Edit the x / n pairs in the DATA LIST below to check any single estimate.      .
DATA LIST LIST /label (A44) x (F10.0) n (F10.0).
BEGIN DATA
"RHCE*ce(733G) Jazan allele"                67   708
"RHCE*ce(733G,1006T)"                        6   708
"RHCE*ceAR"                                  5   708
"RHCE*ce(712G)"                              3   708
"RHD*r's-RHCE*ce(733G,1006T)"                2   708
"Cw (RH8) zero count"                        0   354
END DATA.
DATASET NAME ci_check WINDOW=FRONT.

COMPUTE z      = IDF.NORMAL(0.975,0,1).          /* 1.959964 two-sided 95% */.
COMPUTE phat   = x / n.
* --- Wilson score interval (no continuity correction) --- .
COMPUTE w_den  = 1 + (z**2)/n.
COMPUTE w_ctr  = (phat + (z**2)/(2*n)) / w_den.
COMPUTE w_hw   = (z/w_den) * SQRT( phat*(1-phat)/n + (z**2)/(4*n*n) ).
COMPUTE w_lo   = MAX(0, w_ctr - w_hw).
COMPUTE w_hi   = MIN(1, w_ctr + w_hw).
* --- Clopper-Pearson exact interval via the beta quantile --- .
DO IF x = 0.
  COMPUTE cp_lo = 0.
ELSE.
  COMPUTE cp_lo = IDF.BETA(0.025, x, n - x + 1).
END IF.
DO IF x = n.
  COMPUTE cp_hi = 1.
ELSE.
  COMPUTE cp_hi = IDF.BETA(0.975, x + 1, n - x).
END IF.
COMPUTE cp_hw  = (cp_hi - cp_lo)/2.
* --- exact upper bound when x = 0 (the exact analogue of the rule of three) --- .
DO IF x = 0.
  COMPUTE zero_ub_exact = 1 - 0.025**(1/n).
  COMPUTE zero_ub_ro3   = 3/n.                   /* approximation, for contrast */.
END IF.
FORMATS phat w_lo w_hi w_hw cp_lo cp_hi cp_hw zero_ub_exact zero_ub_ro3 (F10.6).
LIST VARIABLES = label x n phat w_lo w_hi cp_lo cp_hi zero_ub_exact zero_ub_ro3.
* EXPECTED (from the Python run, section 1 and 3 of the .txt output):            .
*   67/708  -> CP 7.41% to 11.86%                                               .
*    2/708  -> CP 0.03% to  1.02%                                               .
*    0/354  -> exact upper bound 1.037%; rule of three 0.847%                    .


* ---------------------------------------------------------------------------- .
* BLOCK B - n required for a target absolute half-width (Wilson).               .
* Strategy: generate candidate n, compute the NOMINAL half-width at x = n*p,    .
* then take the smallest qualifying n. Edit p_plan and h_target.                .
* ---------------------------------------------------------------------------- .
NEW FILE.
INPUT PROGRAM.
  LOOP nn = 2 TO 400000 BY 1.
    COMPUTE nn = nn.
    END CASE.
  END LOOP.
  END FILE.
END INPUT PROGRAM.
DATASET NAME nsearch WINDOW=FRONT.

* ---- EDIT THESE TWO LINES ONLY ---- .
COMPUTE p_plan   = 67/708.        /* GULF Madkhali2025 RHCE*ce(733G), ALLELE level */.
COMPUTE h_target = 0.010.         /* target half-width, absolute (1.0 percentage pt) */.
* ----------------------------------- .

COMPUTE z   = IDF.NORMAL(0.975,0,1).
COMPUTE den = 1 + (z**2)/nn.
COMPUTE hw  = (z/den) * SQRT( p_plan*(1-p_plan)/nn + (z**2)/(4*nn*nn) ).
SELECT IF hw <= h_target.
AGGREGATE OUTFILE=* /BREAK= /n_required = MIN(nn) /p_plan=FIRST(p_plan)
          /h_target=FIRST(h_target).
COMPUTE n_donors = RND(n_required/2 + 0.4999).   /* allele denominator -> donors */.
LIST.
* EXPECTED: n_required = 3295 alleles, n_donors = 1648.                          .
* NOTE ON THE ALLELE->DONOR STEP: dividing by 2 assumes each donor contributes    .
* two alleles. Those two alleles are NOT independent observations. See Block J    .
* and PART 3 item 6 - the reported CI is the donor-level cluster bootstrap, not   .
* this closed form. This block gives the PLANNING number only.                    .


* ---------------------------------------------------------------------------- .
* BLOCK C - n required for a target half-width on Cohen's kappa.                .
* Fleiss-Cohen-Everitt (1969) large-sample variance, 2x2 case, symmetric        .
* marginals (equal prevalence for both methods, no differential bias).          .
* ---------------------------------------------------------------------------- .
DATA LIST LIST /antigen (A26) pi (F8.5) k0 (F8.4) h (F8.4) provenance (A34).
BEGIN DATA
"C (RH2)"                0.68360 0.80 0.10 "GULF PREDICTED Madkhali n=354"
"E (RH3)"                0.23440 0.80 0.10 "GULF PREDICTED Madkhali n=354"
"c (RH4)"                0.80480 0.80 0.10 "GULF PREDICTED Madkhali n=354"
"e (RH5)"                0.98840 0.80 0.10 "GULF PREDICTED Madkhali n=354"
"D (RH1) bracket 0.85"   0.85000 0.80 0.10 "ASSUMPTION-BRACKET unsourced"
"D (RH1) bracket 0.92"   0.92000 0.80 0.10 "ASSUMPTION-BRACKET unsourced"
"D (RH1) bracket 0.97"   0.97000 0.80 0.10 "ASSUMPTION-BRACKET unsourced"
END DATA.
DATASET NAME kappa_n WINDOW=FRONT.

COMPUTE z  = IDF.NORMAL(0.975,0,1).
COMPUTE pe = pi*pi + (1-pi)*(1-pi).
COMPUTE po = pe + k0*(1-pe).
COMPUTE b  = (1-po)/2.                    /* the two off-diagonal cells, equal   */.
COMPUTE a  = pi - b.                      /* both methods positive              */.
COMPUTE d  = (1-pi) - b.                  /* both methods negative              */.
DO IF (a < 0 OR d < 0 OR b < 0).
  COMPUTE attainable = 0.
ELSE.
  COMPUTE attainable = 1.
END IF.
* row marginals r1,r2 and column marginals c1,c2 (equal here, by construction)   .
COMPUTE r1 = a + b.
COMPUTE r2 = b + d.
COMPUTE c1 = a + b.
COMPUTE c2 = b + d.
* Fleiss-Cohen-Everitt variance, term by term                                    .
COMPUTE A_term = a*((1-pe) - (r1+c1)*(1-po))**2 + d*((1-pe) - (r2+c2)*(1-po))**2.
COMPUTE B_term = ((1-po)**2) * ( b*(c1+r2)**2 + b*(c2+r1)**2 ).
COMPUTE C_term = (po*pe - 2*pe + po)**2.
COMPUTE V1     = (A_term + B_term - C_term) / ((1-pe)**4).   /* = n * Var(kappa) */.
COMPUTE n_req  = RND(((z/h)**2)*V1 + 0.4999).
COMPUTE pabak  = 2*po - 1.
FORMATS pe po V1 pabak (F12.6).
LIST VARIABLES = antigen pi k0 h pe po V1 n_req pabak attainable provenance.
* EXPECTED (Python output section 6b, kappa=0.80, h=0.10):                       .
*   C 162 | E 197 | c 226 | e 3208 | D@0.85 281 | D@0.92 492 | D@0.97 1259       .
* THE POINT OF THE 'e' ROW: pi = 98.84% makes chance agreement pe = 0.9771, so   .
* kappa is unstable. See Block K for what is reported instead.                   .


* ---------------------------------------------------------------------------- .
* BLOCK D - design effect and effective sample size (multi-centre clustering).  .
* DEFF = 1 + ((cv^2 + 1)*mbar - 1)*ICC        (Kish, unequal cluster sizes)      .
* ---------------------------------------------------------------------------- .
NEW FILE.
INPUT PROGRAM.
  VECTOR #icc(5).
  COMPUTE #icc(1)=0.002. COMPUTE #icc(2)=0.005. COMPUTE #icc(3)=0.010.
  COMPUTE #icc(4)=0.020. COMPUTE #icc(5)=0.050.
  LOOP #k = 1 TO 5.
    LOOP mbar = 100 TO 1200 BY 100.
      COMPUTE icc = #icc(#k).
      COMPUTE mbar = mbar.
      END CASE.
    END LOOP.
  END LOOP.
  END FILE.
END INPUT PROGRAM.
DATASET NAME deff_tab WINDOW=FRONT.
COMPUTE cv    = 0.30.                /* LABELLED BRACKET: unequal centre sizes   */.
COMPUTE deff  = 1 + (((cv**2 + 1)*mbar) - 1)*icc.
COMPUTE n_tot = 3000.
COMPUTE n_eff = n_tot/deff.
FORMATS deff n_eff (F10.3).
SORT CASES BY icc mbar.
LIST VARIABLES = icc mbar cv deff n_eff.
* EXPECTED at icc=0.010, mbar=250, cv=0.30: DEFF = 3.7098, n_eff = 808.7         .


* ---------------------------------------------------------------------------- .
* BLOCK E - the centre-limited precision floor.                                 .
* As donors per centre grows, Var(pooled p) -> tau^2 / K. No donor recruitment  .
* beats this. tau^2 = ICC * p(1-p).                                             .
* ---------------------------------------------------------------------------- .
NEW FILE.
INPUT PROGRAM.
  VECTOR #i(5).
  COMPUTE #i(1)=0.002. COMPUTE #i(2)=0.005. COMPUTE #i(3)=0.010.
  COMPUTE #i(4)=0.020. COMPUTE #i(5)=0.050.
  VECTOR #K(4).
  COMPUTE #K(1)=6. COMPUTE #K(2)=8. COMPUTE #K(3)=12. COMPUTE #K(4)=20.
  LOOP #a = 1 TO 5.
    LOOP #b = 1 TO 4.
      COMPUTE icc = #i(#a).
      COMPUTE Kcentres = #K(#b).
      END CASE.
    END LOOP.
  END LOOP.
  END FILE.
END INPUT PROGRAM.
DATASET NAME floor_tab WINDOW=FRONT.
COMPUTE p   = 67/708.
COMPUTE tau = SQRT(icc*p*(1-p)).
COMPUTE hw_z = IDF.NORMAL(0.975,0,1) * tau / SQRT(Kcentres).
COMPUTE hw_t = IDF.T(0.975, Kcentres-1) * tau / SQRT(Kcentres).
* ^ hw_t is the one the SAP reports: with K < 15 centres the normal reference    .
*   distribution is anti-conservative. t(K-1) is used instead.                   .
FORMATS tau hw_z hw_t (F10.5).
SORT CASES BY icc Kcentres.
LIST VARIABLES = icc Kcentres tau hw_z hw_t.
* EXPECTED (Python section 7b uses z): icc=0.010, K=12 -> hw_z = 0.01657.        .
* The hw_t column has NO Python counterpart and is an SPSS-side addition;        .
* both are reported in the SAP, with t named as the primary.                     .


* ############################################################################ .
* PART 2 - THE PRE-SPECIFIED PILOT-03 ANALYSIS                                  .
* ############################################################################ .
* These blocks do not run until PILOT-03 data exist. They are written now so     .
* that the analysis is fixed BEFORE any result is seen (Gate G4, CLAUDE.md 6).   .
* Expected dataset: one row per donor, wide by antigen.                          .
*   donor_id  centre_id  state  nationality_grp  sex  age_band                   .
*   ser_D ser_C ser_E ser_c ser_e          serologic call, 1/0/9=indeterminate   .
*   gen_D gen_C gen_E gen_c gen_e          genotype-predicted, 1/0/9=unresolved  .
*   grade_D ... reaction grade; clone_D lot_D class_D  (D025 item 3)             .
*   disc_D ... 7-class taxonomy code C,D1..D7 (D025 item 2)                      .
* ---------------------------------------------------------------------------- .

* GET FILE = '<...>/05_pilot03-analysis-dataset_vX.Y_YYYY-MM-DD.sav'. .
* DATASET NAME pilot03 WINDOW=FRONT. .

* ---------------------------------------------------------------------------- .
* BLOCK F - data-quality description. LABELLED AS DATA QUALITY, NOT INFERENCE.  .
* No test is run here. Running a test here and then choosing the analysis would .
* be the p-hacking this SAP exists to prevent.                                  .
* ---------------------------------------------------------------------------- .
* FREQUENCIES VARIABLES = centre_id state nationality_grp sex age_band           .
*   /ORDER=ANALYSIS. .
* MISSING VALUES ser_D ser_C ser_E ser_c ser_e gen_D gen_C gen_E gen_c gen_e (9). .
* MULTIPLE RESPONSE is not used; each antigen is tabulated separately. .

* ---------------------------------------------------------------------------- .
* BLOCK G - allele / antigen frequency with an exact or score interval.         .
* SPSS 27+ : PROPORTIONS gives Wilson and Clopper-Pearson directly.             .
* Earlier  : fall back to Block A, feeding it the observed x and n.             .
* ---------------------------------------------------------------------------- .
* PROPORTIONS ser_D gen_D ser_C gen_C ser_E gen_E ser_c gen_c ser_e gen_e        .
*   /SUCCESS VALUE=1                                                            .
*   /CI TYPE=WILSON CLOPPERPEARSON LEVEL=95                                      .
*   /MISSING SCOPE=ANALYSIS. .
* [UNVERIFIED] The availability of PROPORTIONS in the PI's installed version     .
* could not be checked from this environment. If it errors, use Block A.         .
* DO NOT substitute the continuity-corrected Wilson variant: the sample size was .
* planned on the uncorrected one and the two do not match.                       .

* ---------------------------------------------------------------------------- .
* BLOCK H - Hardy-Weinberg exact test, biallelic locus, WITHIN ancestry stratum..
* Rationale in the SAP sec.6: in an admixed multi-national donor pool a pooled   .
* HWE test will reject through the Wahlund effect, which is population structure,.
* NOT a genotyping error. HWE is used here ONLY as an assay QC signal within a   .
* stratum, never as a population-genetic claim.                                  .
* Enter observed genotype counts: n_AA, n_AB, n_BB.                              .
* ---------------------------------------------------------------------------- .
DATA LIST LIST /stratum (A20) n_AA (F8.0) n_AB (F8.0) n_BB (F8.0).
BEGIN DATA
"EXAMPLE-replace"   0   0   0
END DATA.
DATASET NAME hwe WINDOW=FRONT.
COMPUTE n_tot  = n_AA + n_AB + n_BB.
COMPUTE n_A    = 2*n_AA + n_AB.
COMPUTE n_B    = 2*n_BB + n_AB.
* Exact conditional probability of a heterozygote count h given n_A, n_B, n_tot  .
* (Levene / Haldane conditional distribution). Computed with log-gamma to avoid  .
* overflow. The two-sided p is the sum of probabilities <= P(observed).          .
COMPUTE lgden  = LNGAMMA(2*n_tot+1) - LNGAMMA(n_A+1) - LNGAMMA(n_B+1).
COMPUTE p_obs  = EXP( LNGAMMA(n_tot+1) - LNGAMMA((n_A-n_AB)/2+1)
                      - LNGAMMA(n_AB+1) - LNGAMMA((n_B-n_AB)/2+1)
                      + n_AB*LN(2) - lgden ).
COMPUTE p_hwe  = 0.
LOOP #h = MOD(n_A,2) TO MIN(n_A,n_B) BY 2.
  COMPUTE #pr = EXP( LNGAMMA(n_tot+1) - LNGAMMA((n_A-#h)/2+1)
                     - LNGAMMA(#h+1) - LNGAMMA((n_B-#h)/2+1)
                     + #h*LN(2) - lgden ).
  DO IF #pr <= p_obs*(1 + 1E-7).
    COMPUTE p_hwe = p_hwe + #pr.
  END IF.
END LOOP.
COMPUTE p_hwe = MIN(1, p_hwe).
COMPUTE f_inb = 1 - ( n_AB / (2*n_tot*(n_A/(2*n_tot))*(n_B/(2*n_tot))) ).
* ^ Wright's F. A POSITIVE F (heterozygote deficiency) in a pooled multi-ancestry.
*   sample is the expected Wahlund signature, not evidence of assay failure.     .
FORMATS p_obs p_hwe f_inb (F12.6).
LIST VARIABLES = stratum n_AA n_AB n_BB n_tot p_hwe f_inb.
* Report the EXACT p to three decimals; p < 0.001 only below that (CLAUDE.md 6). .
* NOTE: neither SPSS nor statsmodels ships an HWE exact test. Both this block    .
* and the Python implementation are bespoke and must agree; they are checked     .
* against each other before any HWE result is reported.                          .

* ---------------------------------------------------------------------------- .
* BLOCK I - the 7-class discordance taxonomy (D025). Unit = antigen-donor pair. .
* Restructure wide -> long so that one row = one antigen-donor pair.            .
* ---------------------------------------------------------------------------- .
* VARSTOCASES                                                                    .
*   /MAKE ser FROM ser_D ser_C ser_E ser_c ser_e                                 .
*   /MAKE gen FROM gen_D gen_C gen_E gen_c gen_e                                 .
*   /MAKE disc FROM disc_D disc_C disc_E disc_c disc_e                           .
*   /INDEX = antigen(5)                                                          .
*   /KEEP = donor_id centre_id state nationality_grp sex age_band                 .
*   /NULL = KEEP. .
* VALUE LABELS antigen 1 'D (RH1)' 2 'C (RH2)' 3 'E (RH3)' 4 'c (RH4)' 5 'e (RH5)'. .
* VALUE LABELS disc 0 'C concordant' 1 'D1 ser+/gen-' 2 'D2 ser-/gen+'           .
*   3 'D3 quantitative' 4 'D4 qualitative-partial' 5 'D5 unresolved genotype'    .
*   6 'D6 assay/technical failure' 7 'D7 platform-vs-platform'. .
* CROSSTABS TABLES = antigen BY disc /CELLS=COUNT ROW /FORMAT=AVALUE. .
* D5 IS NEVER COLLAPSED INTO 'concordant'. D6 IS EXCLUDED FROM THE CONCORDANCE   .
* DENOMINATOR AND REPORTED SEPARATELY WITH ITS n. D7 IS NOT SEROLOGY-GENOTYPE    .
* DISCORDANCE AND IS TABULATED IN A SEPARATE TABLE ENTIRELY.                     .

* ---------------------------------------------------------------------------- .
* BLOCK J - overall percent agreement across antigen-donor pairs, with a        .
* DONOR-CLUSTERED variance. The pairs are nested within donor within centre.    .
* Treating 5n pairs as 5n independent observations would falsely narrow the CI. .
* ---------------------------------------------------------------------------- .
* COMPUTE agree = (disc = 0). .
* GENLIN agree (REFERENCE=FIRST)                                                 .
*   /MODEL INTERCEPT=YES DISTRIBUTION=BINOMIAL LINK=LOGIT                        .
*   /REPEATED SUBJECT=centre_id*donor_id CORRTYPE=EXCHANGEABLE COVB=ROBUST       .
*   /CRITERIA CILEVEL=95                                                         .
*   /PRINT CPS MODELINFO FIT SUMMARY SOLUTION. .
* Back-transform the intercept and its CI from the logit scale. The logit-scale  .
* CI back-transformed is preferred to a Wald CI on the proportion: it cannot     .
* leave [0,1], which matters because agreement here will be near 1.              .
* SEE PART 3 ITEM 4: SPSS applies NO small-sample correction to this sandwich    .
* estimator. With ~12 centres it is anti-conservative.                           .

* ---------------------------------------------------------------------------- .
* BLOCK K - kappa per antigen, with percent agreement, PPA, NPA and PABAK.      .
* D027: kappa with 95% CI PLUS percent agreement. NEVER bare percent agreement. .
* ---------------------------------------------------------------------------- .
* SORT CASES BY antigen. .
* SPLIT FILE LAYERED BY antigen. .
* CROSSTABS TABLES = ser BY gen                                                  .
*   /STATISTICS = KAPPA                                                          .
*   /CELLS = COUNT                                                               .
*   /COUNT ROUND CELL. .
* SPLIT FILE OFF. .
* TRAP, MUST BE HANDLED BEFORE RUNNING: CROSSTABS computes kappa only for a      .
* SQUARE table with identical category codes on both variables. If an antigen is .
* never called positive by one method the table is 2x1 and SPSS returns no kappa .
* rather than kappa = 0. Force squareness by adding two zero-weighted structural .
* rows, or the result will silently go missing:                                  .
*   (add cases ser=0 gen=1 wt=0 and ser=1 gen=0 wt=0, then WEIGHT BY wt).        .
* Python's statsmodels cohens_kappa requires a square count matrix as input, so  .
* the same issue must be handled there; it is handled explicitly in the Python   .
* analysis script rather than left to the procedure.                             .

* --- PPA / NPA and PABAK from the 2x2 counts (a,b,c,d) --- .
* For each antigen enter: a = ser+/gen+, b = ser+/gen-, c = ser-/gen+, d = both -.
DATA LIST LIST /antigen (A10) a (F10.0) b (F10.0) c (F10.0) d (F10.0).
BEGIN DATA
"EXAMPLE"  0 0 0 0
END DATA.
DATASET NAME agree2x2 WINDOW=FRONT.
COMPUTE n     = a+b+c+d.
COMPUTE po    = (a+d)/n.
COMPUTE pe    = ((a+b)/n)*((a+c)/n) + ((c+d)/n)*((b+d)/n).
COMPUTE kappa = (po-pe)/(1-pe).
COMPUTE pabak = 2*po - 1.
* PPA = positive percent agreement, genotype taken as the comparator; NPA the    .
* negative counterpart. Exact (Clopper-Pearson) intervals, per CLAUDE.md sec.6.  .
COMPUTE ppa   = a/(a+c).
COMPUTE npa   = d/(b+d).
COMPUTE ppa_lo = IDF.BETA(0.025, a, (a+c)-a+1).
COMPUTE ppa_hi = IDF.BETA(0.975, a+1, (a+c)-a).
COMPUTE npa_lo = IDF.BETA(0.025, d, (b+d)-d+1).
COMPUTE npa_hi = IDF.BETA(0.975, d+1, (b+d)-d).
COMPUTE prev  = (a+c)/n.
COMPUTE lead_stat_is_kappa = (prev >= 0.10 AND prev <= 0.90).
* ^ THE 10%-90% RULE IS PRE-SPECIFIED AND MECHANICAL (SAP sec.7). It is declared .
*   before any data are seen precisely so that it cannot be used to pick whichever.
*   statistic looks better after the fact. Outside that band kappa is still       .
*   REPORTED, but PPA/NPA and the raw 2x2 counts lead.                            .
FORMATS po pe kappa pabak ppa npa ppa_lo ppa_hi npa_lo npa_hi prev (F10.5).
LIST.
* PABAK CAVEAT THAT MUST APPEAR IN THE MANUSCRIPT: PABAK = 2*po - 1 is a strictly.
* monotone relabelling of observed agreement. It contains NO information beyond  .
* po. It is reported to show what kappa would have been under balanced marginals,.
* which this study does not have. It is NEVER offered as a prevalence-robust     .
* substitute for kappa, and a high PABAK is never evidence of good agreement.    .

* ---------------------------------------------------------------------------- .
* BLOCK L - centre heterogeneity and the ICC, per allele / antigen.             .
* Random-intercept logistic model, centre as the random effect.                 .
* ---------------------------------------------------------------------------- .
* GENLINMIXED                                                                    .
*   /DATA_STRUCTURE SUBJECTS=centre_id                                           .
*   /FIELDS TARGET=carrier TRIALS=NONE OFFSET=NONE                               .
*   /TARGET_OPTIONS REFERENCE=0 DISTRIBUTION=BINOMIAL LINK=LOGIT                 .
*   /FIXED USE_INTERCEPT=TRUE                                                    .
*   /RANDOM EFFECTS=(INTERCEPT) USE_INTERCEPT=TRUE SUBJECTS=centre_id            .
*             COVARIANCE_TYPE=VARIANCE_COMPONENTS                                .
*   /BUILD_OPTIONS TARGET_CATEGORY_ORDER=ASCENDING                               .
*   /EMMEANS_OPTIONS SCALE=ORIGINAL. .
* Latent-scale ICC = sigma_u^2 / (sigma_u^2 + (pi^2)/3), pi^2/3 = 3.28987.       .
* Report the ICC SCALE EXPLICITLY. The latent-scale ICC and the proportion-scale .
* ICC are different quantities and are routinely confused in the literature;     .
* PILOT-03 reports both, each named.                                             .
* PILOT-03 MUST PUBLISH ITS ICCs: no GCC multi-centre RH ICC exists, which is    .
* exactly why this study's own sample size had to be built on a bracket.         .


* ############################################################################ .
* PART 3 - PYTHON / SPSS DEFAULT DIFFERENCES, AND WHICH IS REPORTED             .
* ############################################################################ .
* 1. PROPORTION CI. Wilson and Clopper-Pearson are closed-form and identical in  .
*    both systems to floating-point precision. BUT SPSS PROPORTIONS also offers  .
*    continuity-corrected Wilson, Agresti-Coull, Jeffreys, logit and Wald. The   .
*    SAP reports the UNCORRECTED Wilson score interval as primary and the        .
*    Clopper-Pearson exact interval for any cell with count <= 5 or >= n-5.      .
*    Wald is never reported. Do not accept an SPSS default that differs.         .
*                                                                                .
* 2. KAPPA CI. SPSS CROSSTABS reports kappa with an asymptotic standard error.   .
*    Historically SPSS printed ASE1 (the variance under the NULL kappa = 0), used.
*    for the test statistic, alongside the asymptotic SE used for the CI in newer.
*    versions. statsmodels cohens_kappa returns BOTH std_kappa (under the         .
*    alternative, correct for a CI) and std_kappa0 (under the null, correct for a.
*    test). The SAP reports the CI built on the variance under the ALTERNATIVE.  .
*    The Python script's self-test (section 0 of the .txt output) confirms the   .
*    hand-coded Fleiss-Cohen-Everitt variance matches statsmodels to 6 dp.       .
*    [UNVERIFIED] Which of the two SPSS prints in the PI's version could not be  .
*    checked here. VERIFY BEFORE REPORTING: if the SPSS CI differs from the      .
*    Python CI, it is almost certainly this.                                     .
*                                                                                .
* 3. KAPPA WITH A NON-SQUARE TABLE. SPSS returns nothing; statsmodels raises.    .
*    Handled explicitly in Block K. A silently absent kappa is the failure mode  .
*    to watch for.                                                               .
*                                                                                .
* 4. GEE SANDWICH VARIANCE. SPSS GENLIN /REPEATED COVB=ROBUST gives the standard .
*    (Liang-Zeger) sandwich with NO small-sample correction and a Wald chi-square.
*    reference distribution. statsmodels GEE offers cov_type='bias_reduced'      .
*    (Mancl-DeRouen). With ~12 centres the uncorrected sandwich is               .
*    ANTI-CONSERVATIVE - CIs too narrow, exactly the error this design is most   .
*    exposed to. THE SAP REPORTS THE MANCL-DEROUEN-CORRECTED PYTHON RESULT WITH  .
*    A t(K-1) REFERENCE DISTRIBUTION, and reports the uncorrected SPSS result    .
*    alongside it as a stated sensitivity. This divergence is deliberate and     .
*    must be disclosed in the manuscript Methods; it is not a discrepancy.       .
*                                                                                .
* 5. GLMM ESTIMATION. SPSS GENLINMIXED uses pseudo-likelihood (linearisation)    .
*    by default for a binomial target; statsmodels BinomialBayesMixedGLM /       .
*    Laplace or adaptive Gauss-Hermite quadrature differ. For a rare binary       .
*    outcome pseudo-likelihood is known to bias the variance component DOWNWARD, .
*    which biases the ICC downward, which makes the design look better than it   .
*    is. The SAP reports the quadrature-based estimate as primary and states the .
*    pseudo-likelihood value beside it.                                          .
*                                                                                .
* 6. ALLELE-LEVEL DENOMINATORS. Neither system knows that 2n alleles from n      .
*    donors are not 2n independent observations. Both Block B here and the       .
*    Python planning code use the 2n approximation FOR PLANNING ONLY. The        .
*    REPORTED allele-frequency CI is a donor-level cluster bootstrap             .
*    (10,000 resamples, resampling CENTRES then DONORS within centre, BCa        .
*    interval). Neither SPSS nor statsmodels does this by default.                .
*                                                                                .
* 7. FISHER'S EXACT TEST. SPSS CROSSTABS gives exact 2-sided p for 2x2 tables    .
*    automatically; r x c exact tests require the licensed EXACT TESTS module.   .
*    scipy.stats.fisher_exact handles 2x2; r x c needs a Monte Carlo or network  .
*    algorithm. Where an r x c exact test is needed and the module is absent,    .
*    the SAP pre-specifies a Monte Carlo exact p with 100,000 replicates and a   .
*    fixed random seed, reported as such with its own Monte Carlo CI.            .
*                                                                                .
* 8. HARDY-WEINBERG. Not available as a built-in in EITHER system. Both          .
*    implementations here are bespoke and are cross-checked against each other   .
*    before any HWE result is reported. If they disagree, neither is reported.   .
*                                                                                .
* 9. RANDOM SEEDS. SPSS: SET SEED = 20260911. Python: numpy default_rng(20260911).
*    The two generators are DIFFERENT algorithms. Bootstrap and Monte Carlo      .
*    results WILL differ in the last digits between systems. This is expected and.
*    is not a discrepancy; the reported value is the Python one, and the number  .
*    of replicates is chosen so the Monte Carlo error is below the reporting     .
*    precision.                                                                  .
* ============================================================================ .
SET SEED = 20260911.
* END OF FILE .
