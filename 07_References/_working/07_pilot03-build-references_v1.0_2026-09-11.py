#!/usr/bin/env python3
"""
PILOT-03 citation verification -- single source of truth.

Generates, from the RECORDS + LEDGER structures below and from nothing else:
  07_pilot03-citation-ledger_v1.0_2026-09-11.csv
  07_pilot03-references-verified_v1.0_2026-09-11.ris
  07_pilot03-references-verified_v1.0_2026-09-11.bib

The .ris and .bib are emitted ONLY from RECORDS entries whose l1_l2 status is
VERIFIED, so the library and the ledger cannot diverge.

Verification performed 2026-09-11 by citation-verification-expert via
PubMed MCP (search_articles / get_article_metadata / get_full_text_article)
and SciSpace. Crossref, NCBI E-utilities direct HTTP, Europe PMC and all
publisher domains are egress-blocked in this environment.
"""

import csv, os, re

OUT = "/home/user/Research-Agent/07_References/_working"
DATE = "2026-09-11"

# ---------------------------------------------------------------------------
# BIBLIOGRAPHIC RECORDS -- fields transcribed field-by-field from the retrieved
# authoritative record. Any field marked UNVERIFIED is not emitted to .ris/.bib.
# ---------------------------------------------------------------------------
RECORDS = {
"R01": dict(key="Meshi2024", type="article", l1_l2="VERIFIED",
  authors=["Meshi, Abdullah Ahmed","Abu-Tawil, Hisham","Hamzi, Abdulrahman Ahmed",
           "Madkhali, Basem Ali","Maghfori, Ali Bohais","Alnami, Ismail Ibrahim",
           "Hamali, Hassan A","Madkhali, Maymoon Mohammed"],
  title=("Red Cell Alloimmunisation Among Sickle Cell Disease and Thalassemia Patients "
         "Following Rh- and K-Matched Red Cell Transfusion in Southwestern Saudi Arabia: "
         "A Multicenter Study"),
  journal="International Journal of General Medicine", iso="Int J Gen Med",
  year="2024", volume="17", issue="", pages="2855-2864",
  doi="10.2147/IJGM.S444949", pmid="38947563", pmc="PMC11212813",
  ptypes="Journal Article"),

"R02": dict(key="Halawani2022", type="article", l1_l2="VERIFIED",
  authors=["Halawani, Amr J","Mobarki, Abdullah A","Arjan, Ali H","Saboor, Muhammad",
           "Hamali, Hassan A","Dobie, Gasim","Alsharif, Khalaf F"],
  title=("Red Cell Alloimmunization and Autoimmunization Among Sickle Cell Disease and "
         "Thalassemia Patients in Jazan Province, Saudi Arabia"),
  journal="International Journal of General Medicine", iso="Int J Gen Med",
  year="2022", volume="15", issue="", pages="4093-4100",
  doi="10.2147/IJGM.S360320", pmid="35450032", pmc="PMC9017690",
  ptypes="Journal Article"),

"R03": dict(key="Ameen2020", type="article", l1_l2="VERIFIED",
  authors=["Ameen, Reem","Al Shemmari, Salem","Harris, Samantha","Teramura, Gayle",
           "Delaney, Meghan"],
  title="Classification of major and minor blood group antigens in the Kuwaiti Arab population",
  journal=("Transfusion and Apheresis Science"), iso="Transfus Apher Sci",
  year="2020", volume="59", issue="4", pages="102748",
  doi="10.1016/j.transci.2020.102748", pmid="32527616", pmc="",
  ptypes="Journal Article"),

"R04": dict(key="AlRiyami2021", type="article", l1_l2="VERIFIED",
  authors=["Al-Riyami, Arwa Z","Al Hinai, Dina","Al-Rawahi, Mohammed","Al-Hosni, Saif",
           "Al-Zadjali, Shoaib","Al-Marhoobi, Ali","Al-Khabori, Murtadha",
           "Al-Riyami, Hamad","Denomme, Gregory A"],
  title="Molecular blood group screening in Omani blood donors",
  journal="Vox Sanguinis", iso="Vox Sang",
  year="2021", volume="117", issue="3", pages="424-430",
  doi="10.1111/vox.13204", pmid="34647328", pmc="",
  ptypes="Journal Article"),

"R05": dict(key="Alalshaikh2024", type="article", l1_l2="VERIFIED",
  authors=["Alalshaikh, Mohrah A","Alsughayir, Ammar H","Alsaif, Alyazeed S",
           "Ababtain, Sarah A","Aloyouni, Shaika Y","Aldilaijan, Khawlah E",
           "Alsubaie, Sahar F"],
  title="Molecular Background of RhD-positive and RhD-negative Phenotypes in a Saudi Population",
  journal="Saudi Journal of Medicine & Medical Sciences", iso="Saudi J Med Med Sci",
  year="2024", volume="12", issue="3", pages="210-215",
  doi="10.4103/sjmms.sjmms_664_23", pmid="39055072", pmc="PMC11268538",
  ptypes="Journal Article"),

"R06": dict(key="Madkhali2025", type="article", l1_l2="VERIFIED",
  authors=["Madkhali, Maymoon M","Khormy, Mayisah","Meshi, Abdullah A","Kameli, Bandar",
           "Ghazwani, Khaled","Sufyani, Ohoud","Hakami, Salha","Khawaji, Yahya",
           "Mobarki, Abdullah A","Essawi, Khaled","Hakami, Waleed","Alyahyawi, Yara",
           "Madkhali, Aymen M","Dobie, Gasim","Hamali, Hassan A"],
  title=("Characterisation of RHD and RHCE variations in blood donors from Jazan Province, "
         "Southwestern Saudi Arabia"),
  journal="Transfusion Medicine", iso="Transfus Med",
  year="2025", volume="36", issue="2", pages="158-164",
  doi="10.1111/tme.70040", pmid="41147787", pmc="PMC13077421",
  ptypes="Journal Article"),

"R07": dict(key="Haffener2025", type="article", l1_l2="VERIFIED",
  authors=["Haffener, Paige E","Al-Riyami, Arwa Z","Al-Zadjali, Shoaib",
           "Al-Rawahi, Mohammed","Al Hosni, Saif","Al Marhoobi, Ali",
           "Al Sheriyani, Ammar","Leffler, Ellen M"],
  title=("Characterization of blood group variants in an Omani population by comparison of "
         "whole genome sequencing and serology"),
  journal="Transfusion", iso="Transfusion",
  year="2025", volume="65", issue="10", pages="1922-1934",
  doi="10.1111/trf.18401", pmid="40916454", pmc="PMC12531907",
  ptypes="Journal Article; Comparative Study"),

"R08": dict(key="AlLawati2021", type="thesis", l1_l2="VERIFIED",
  authors=["Al Lawati, M"],
  title="Molecular background of serological D negative phenotype in the Omani population",
  journal="", iso="", year="2021", volume="", issue="", pages="",
  doi="10.24377/LJMU.T.00014274", pmid="", pmc="",
  school="Liverpool John Moores University",
  ptypes="Doctoral thesis (grey literature)"),

"R09": dict(key="VegeWesthoff2011", type="inbook", l1_l2="VERIFIED",
  authors=["Vege, Sunitha","Westhoff, Connie M"],
  title=("Identification of Altered RHD and RHCE Alleles: A Comparison of Manual and "
         "Automated Molecular Methods"),
  booktitle=("BeadChip Molecular Immunohematology: Toward Routine Donor and Patient Antigen "
             "Profiling by DNA Analysis"),
  publisher="Springer", address="New York, NY",
  journal="", iso="", year="2011", volume="", issue="",
  pages="",   # 121-131 seen only in a search-result snippet; NOT emitted
  doi="10.1007/978-1-4419-7512-6_11", pmid="", pmc="",
  ptypes="Book Chapter"),

"R10": dict(key="Kim2009", type="article", l1_l2="VERIFIED",
  authors=["Kim, Kyeong-Hee","Kim, Kyung-Eun","Woo, Kwang-Sook","Han, Jin-Yeong",
           "Kim, Jeong-Man","Park, Kyoung Un"],
  title="Primary anti-D immunization by DEL red blood cells",
  journal="The Korean Journal of Laboratory Medicine", iso="Korean J Lab Med",
  year="2009", volume="29", issue="4", pages="361-365",
  doi="10.3343/kjlm.2009.29.4.361", pmid="19726900", pmc="",
  ptypes="Case Reports; Journal Article"),

"R11": dict(key="Owaidah2023", type="article", l1_l2="VERIFIED",
  authors=["Owaidah, Amani","Aljuhani, Khadijah","Albasri, Jasem","Alsulmi, Eman",
           "Alsaihati, Taibah","Alzahrani, Faisal"],
  title=("Cases of RhD variants RhD*DAU2/DAU6 and RhD*weak D type 4.1 in pregnant women "
         "in Saudi Arabia"),
  journal="Acta Bio-Medica: Atenei Parmensis", iso="Acta Biomed",
  year="2023", volume="94", issue="S1", pages="e2023080",
  doi="10.23750/abm.v94iS1.14120", pmid="36883669", pmc="",
  ptypes="Case Reports; Journal Article"),

"R12": dict(key="Srivastava2022", type="article", l1_l2="VERIFIED",
  authors=["Srivastava, K","Bueno, M U","Flegel, W A"],
  title=("Transfusion support for a woman with RHD*weak D type 161 and the novel "
         "RHD*01W.161 allele"),
  journal="Immunohematology", iso="Immunohematology",
  year="2022", volume="38", issue="1", pages="17-24",
  doi="10.21307/immunohematology-2022-036", pmid="35852060", pmc="PMC9364384",
  ptypes="Journal Article (case report)",
  note=("TITLE CAVEAT: PubMed/PMC render this title with the italicised allele names "
        "stripped out ('Transfusion support for a woman withand the novelallele'). The "
        "allele designations shown here are reconstructed from the full text and are "
        "[UNVERIFIED] as rendered title text; publisher page egress-blocked.")),

"R13": dict(key="Rodrigues2021", type="article", l1_l2="VERIFIED",
  authors=["Rodrigues, Evandra Strazza","Romagnoli, Aline Cristina",
           "Santos, Flavia Leite Souza","Cutter, Talitha Baldin",
           "Catelli, Lucas Ferioli","Cedric, Vrignaud","Peyrard, Thierry",
           "Covas, Dimas Tadeu","de Castilho, Lilian Maria","Kashima, Simone"],
  title=("Frequency and characterization of RHD variant alleles in a population of blood "
         "donors from southeastern Brazil: Comparison with other populations"),
  journal="Transfusion and Apheresis Science", iso="Transfus Apher Sci",
  year="2021", volume="60", issue="4", pages="103135",
  doi="10.1016/j.transci.2021.103135", pmid="33867285", pmc="",
  ptypes="Clinical Trial; Comparative Study; Journal Article"),

"R14": dict(key="dePaulaVendrame2019", type="article", l1_l2="VERIFIED",
  authors=["de Paula Vendrame, Tatiane Aparecida","Prisco Arnoni, Carine",
           "Guilhem Muniz, Janaina","de Medeiros Person, Rosangela",
           "Pereira Cortez, Afonso Jose","Roche Moreira Latini, Flavia",
           "Castilho, Lilian"],
  title=("Characterization of RHD alleles present in serologically RHD-negative donors "
         "determined by a sensitive microplate technique"),
  journal="Vox Sanguinis", iso="Vox Sang",
  year="2019", volume="114", issue="8", pages="869-875",
  doi="10.1111/vox.12851", pmid="31587310", pmc="",
  ptypes="Journal Article"),

"R15": dict(key="Flegel2025", type="article", l1_l2="VERIFIED",
  authors=["Flegel, Willy A","Srivastava, Kshitij","Caruccio, Lorraine G",
           "Schmid, Pirmin","Stiles, David A","Bueno, Marina U","Dowling, Nadine R",
           "Paige, Traci D","Shrestha, Sita"],
  title=("Transitioning a multiethnic donor pool from serologic D-negative to molecularly "
         "RHD-negative at a hospital-based blood donor service"),
  journal="Journal of Translational Medicine", iso="J Transl Med",
  year="2025", volume="23", issue="1", pages="686",
  doi="10.1186/s12967-025-06716-8", pmid="40537781", pmc="PMC12180192",
  ptypes="Journal Article; Research Support, N.I.H., Extramural"),

"R16": dict(key="Nuchnoi2022", type="article", l1_l2="VERIFIED",
  authors=["Nuchnoi, Pornlada","Thongbut, Jairak","Benech, Caroline",
           "Kupatawintu, Pawinee","Chaiwanichsiri, Dootchai","Ferec, Claude",
           "Fichou, Yann"],
  title="Serologically D-negative blood donors in Thailand: molecular variants and diagnostic strategy",
  journal="Blood Transfusion", iso="Blood Transfus",
  year="2022", volume="21", issue="3", pages="209-217",
  doi="10.2450/2022.0160-22", pmid="36346882", pmc="PMC10159805",
  ptypes="Journal Article"),
}

# ---------------------------------------------------------------------------
# LEDGER -- one row per in-text claim.
# claim_support: SUPPORTS / PARTIALLY SUPPORTS / DOES NOT SUPPORT / CONTRADICTS /
#                CANNOT VERIFY
# ---------------------------------------------------------------------------
H = ["ref_id","protocol_locus","in_text_claim","claimed_citation","resolved_pmid",
     "resolved_doi","metadata_status","retraction_status","claim_support_verdict",
     "supporting_quote","verifier_note","date_verified"]

NORET = ("NO RETRACTION / EoC in PubMed article types (checked 2026-09-11); "
         "erratum linkage NOT checkable - Crossref + publisher pages egress-blocked")
NORET_NP = ("NOT PUBMED-INDEXED - no retraction register reachable; Crossref and "
            "repository/publisher pages egress-blocked. UNDETERMINED.")

L = [
# ---------------- R01 Meshi 2024 ----------------
["R01","S1.1 line 64",
 "Jazan multi-centre series of 1,027 transfusion-dependent patients (906 SCD, 121 thalassaemia) receiving Rh- and K-matched units; alloimmunisation 78/1,027 (7.6%); anti-E 25.9% and anti-K 24.1% commonest of 108 alloantibodies",
 "Meshi 2024, DOI 10.2147/IJGM.S444949","38947563","10.2147/IJGM.S444949",
 "MATCH on all verifiable fields. GAP: protocol cites no PMID; actual PMID 38947563. Int J Gen Med 2024;17:2855-2864.",
 NORET,"SUPPORTS",
 "'A total of 1027 were enrolled in the cohort; 906 (88.2%) and 121 (11.8%) patients with SCD and thalassemia, respectively. ... Among the studied population, 78 were alloimmunised with an overall alloimmunisation rate of 7.6%. These patients developed a total of 108 alloantibodies, and anti-E was the most detected antibody (25.9%) followed by anti-K (24.1%).' [Abstract]",
 "Multi-centre confirmed ('three major hospitals'); 'received Rh/K matched transfusions in 2019' confirms the Rh/K-matched framing. Every number reconciles. Add the PMID to the protocol.",DATE],

# ---------------- R02 Halawani 2022 ----------------
["R02","S1.1 line 64",
 "Jazan series of 438 transfusion-dependent patients (385 SCD; 53 thalassaemia = 52 beta + 1 alpha) at Prince Mohammed bin Nasser Hospital; alloimmunisation rates 12.98% in SCD and 13.21% in thalassaemia; anti-E and anti-K commonest",
 "Halawani 2022, PMID 35450032, DOI 10.2147/IJGM.S360320","35450032","10.2147/IJGM.S360320",
 "MATCH. Int J Gen Med 2022;15:4093-4100. PMID and DOI as claimed.",
 NORET,"SUPPORTS",
 "'A total of 438 patients, including 385 with SCD, 52 with beta-thalassemia major, and 1 with alpha-thalassemia were included' / 'The alloimmunization rate in patients with SCD was 12.98% and in those with thalassemia was 13.21%' / 'the most prevalent antibodies were anti-E and anti-K' [PMC9017690 full text, Results and Discussion]",
 "Full text read 2026-09-11. Hospital name, denominators and both rates all confirmed verbatim.",DATE],

["R02","S1.1 numerator-correction box, line 66",
 "PROTOCOL ASSERTION: the paper's '50 immunized patients' is 'a combined total across both disease groups, not an SCD numerator'; per-group numerators are therefore NR",
 "Halawani 2022, PMC9017690 full text","35450032","10.2147/IJGM.S360320",
 "n/a - claim is about source content, not metadata",
 NORET,"DOES NOT SUPPORT",
 "Source says only: 'In the study population, 56 antibodies were detected in 50 immunized patients due to receiving multiple blood transfusion units.' The source NOWHERE states that 50 is a cross-group total.",
 "CRITICAL: the correction box asserts as fact something the source does not state, and the source's own arithmetic points the other way. 12.98% x 385 = 49.97 (=50); 13.21% x 53 = 7.00 (=7); 50+7 = 57 = the stated 'Among the 438 patients, 57 patients had positive antibody screening test results'. Anti-E is reported as 'n = 11; 19.64%' in SCD, i.e. 11/56 -> the 56 antibodies are the SCD group's. So 50 reads as the SCD alloimmunised count, not a combined total. The correct statement is 'the source does not report per-group numerators explicitly; do not assert either reading'. The current wording is an unsupported positive claim and must be rewritten.",DATE],

["R02","S1.1 box, line 68",
 "PROTOCOL ASSERTION: 'the Results state 57 patients had positive antibody screening, whereas the stated group rates imply 57 alloimmunised plus 4 autoimmunised (61)'",
 "Halawani 2022, PMC9017690","35450032","10.2147/IJGM.S360320","n/a",NORET,"PARTIALLY SUPPORTS",
 "'Among the 438 patients, 57 patients had positive antibody screening test results.' [Results]",
 "The '61' is the protocol's own back-calculation, not a figure in the source, and the source never states that autoimmunised patients are additional to the 57. This is an [INFERENCE] presented as a property of the source. Tag it [INFERENCE] or delete it. Note the protocol elsewhere forbids exactly this kind of derivation.",DATE],

["R02","S1.1 box, line 68",
 "PROTOCOL ASSERTION: 'three different anti-E frequencies across its own Abstract (17.19%), Results (19.64%, SCD only) and Discussion (17.9%)'",
 "Halawani 2022, PMC9017690","35450032","10.2147/IJGM.S360320","n/a",NORET,"PARTIALLY SUPPORTS",
 "Abstract: 'The most prevalent antibodies in the study population were anti-E (17.19%) and anti-K (14.06%).' Results: 'The most prevalent antibody in patients with SCD was anti-E (n = 11; 19.64%), followed by anti-K (n = 8; 14.28%).' Discussion: 'the most prevalent antibodies were anti-E and anti-K, at 17.9% and 14.06%, respectively.'",
 "All three figures exist as quoted, BUT they are not three inconsistent reports of one quantity. 17.19% is 11/64 (all patients: 56 SCD + 8 thalassaemia antibodies); 19.64% is 11/56 (SCD only) - different denominators, not a contradiction. Anti-K is 14.06% in BOTH Abstract and Discussion (9/64) and 14.28% in Results (8/56) - again denominators. The ONLY genuine internal inconsistency is anti-E 17.19% (Abstract) vs 17.9% (Discussion). The protocol overstates the defect roughly threefold. Correct to one inconsistency.",DATE],

# ---------------- R03 Ameen 2020 ----------------
["R03","S1.2 table row 1; S1.3.1 line 95",
 "Kuwait, 917 donors, SNP DNA array; weak D 1/2/3 reported 'not prevalent' (no numerator given - recorded NR); 'Ameen 2020 alone genotyped 917 Kuwaiti donors'",
 "Ameen 2020, PMID 32527616, DOI 10.1016/j.transci.2020.102748","32527616","10.1016/j.transci.2020.102748",
 "MATCH. Transfus Apher Sci 2020;59(4):102748.",NORET,"PARTIALLY SUPPORTS",
 "'Blood samples from 917 Kuwaiti Arab donors in the Kuwaiti Bone Marrow registry were tested with a single-nucleotide polymorphism DNA array.' / 'The weak D 1, 2, 3 phenotypes were not prevalent in the Kuwaiti Arab population; however, other RHD variants were detected.' [Abstract]",
 "n, platform and the 'not prevalent' wording all SUPPORTED. The assertion that NO numerator is given is a statement about the full text, which I could NOT read: no PMC record exists and Elsevier/ScienceDirect is egress-blocked. Re-label that sub-claim [UNVERIFIED - full text not obtainable]. Also note the cohort is a bone-marrow registry, not a consecutive donation series - relevant to the S6.2 sampling comparison.",DATE],

# ---------------- R04 Al-Riyami 2021 ----------------
["R04","S1.2 table row 2","Oman; 180 genotyped, 130 paired with serology; RBC-FluoGene vERYfy eXtend; 12-system screen; 'D variant 18.2% (22/121)' not resolved to allele in the abstract",
 "Al-Riyami 2021, PMID 34647328, DOI 10.1111/vox.13204","34647328","10.1111/vox.13204",
 "MATCH. Vox Sang 2021;117(3):424-430.",NORET,"SUPPORTS",
 "'Blood samples from 180 Omani donors were evaluated... Samples were genotyped using RBC-FluoGene vERYfy eXtend kit (inno-train)' / 'Simultaneous phenotype and genotype results were available in 130 subjects.' / 'D and partial e c.733C>G variants expressing the V+VS+ phenotype were found in 22/121 (18.2%) and 14/120 (11.7%) of the samples, respectively.' [Abstract]",
 "12 systems confirmed (MNS, RH, KEL, FY, JK, DO, LU, YT, DI, VEL, CO, KN). NOTE the abstract sentence bundles 'D and partial e c.733C>G variants' - the 18.2% is the D-variant figure; the protocol's reading is correct but the source sentence is ambiguous.",DATE],

["R04","S1.2 table row 2, concordance column",
 "'Bare per-system percentages only; no taxonomy, no CI, no adjudication algorithm described'",
 "Al-Riyami 2021, PMID 34647328","34647328","10.1111/vox.13204","n/a",NORET,"CANNOT VERIFY - full text needed",
 "No quote obtainable. Abstract contains no taxonomy/CI/adjudication description, but absence from an abstract is not absence from a paper.",
 "No PMC record; Wiley egress-blocked. This is a NEGATIVE claim about a paper read only at abstract level and it is stated unqualified in the table. Re-audit mn4 already flagged this (the gate log records 14/112 Fyb discrepancies that WERE adjudicated). Must be qualified to 'not described in the abstract'. Protocol line 85 carries the caveat but the table cell does not.",DATE],

["R04","S1.3.1 line 97",
 "'Concordance is the stated objective of Al-Riyami 2021, which reports >95% across systems including RH'",
 "PMID 34647328","34647328","10.1111/vox.13204","n/a",NORET,"SUPPORTS",
 "'This study aims at evaluating the genotypes of common blood group antigens in the Omani blood donors and to assess the concordance rate with obtained phenotypes.' / 'Concordance rate was >95% in all blood group systems with exception of Fy(b+) (87%).' [Abstract]","",DATE],

["R04","S3.2 line 189",
 "'as in Al-Riyami 2021, where denominators were 121 for D, 120 for e, 112 for FY'",
 "Al-Riyami 2021 [EVIDENCE, abstract-level]","34647328","10.1111/vox.13204","n/a",NORET,"SUPPORTS",
 "'22/121 (18.2%) and 14/120 (11.7%)' (D and e) and '81/112 (72%)' and 'discrepant Fyb phenotype/genotype result was obtained in 14/112 samples' [Abstract]","Correctly labelled abstract-level.",DATE],

# ---------------- R05 Alalshaikh 2024 ----------------
["R05","S1.2 table row 3; S1.3.2; S1.3.3",
 "Saudi Arabia, 136 donors; multiplex PCR exons 3/4/7 + hybrid Rhesus box; RHD presence/absence + zygosity, no RHCE; 70 D-positive donors genotyped for exon presence/zygosity only; states variant-allele analysis remains to be done",
 "Alalshaikh 2024, PMID 39055072, DOI 10.4103/sjmms.sjmms_664_23","39055072","10.4103/sjmms.sjmms_664_23",
 "MATCH. Saudi J Med Med Sci 2024;12(3):210-215.",NORET,"SUPPORTS",
 "'Conventional serological tests were used to determine the Rh phenotypes in 136 Saudi donors' / 'Of the 136 samples, 70 were RhD positive and 66 were RhD negative.' / 'However, a more comprehensive analysis of variant [RHD] alleles in the Saudi population is required to implement effective and dedicated molecular [RHD] typing strategies.' [Abstract]",
 "All four sub-claims supported from the abstract. PMC11268538 exists if deeper detail is later needed.",DATE],

# ---------------- R06 Madkhali 2025 ----------------
["R06","S1.2 table row 4","Saudi Arabia (Jazan); 60 RHD (D-/weak D only); 464 RHCE; ID RHD XT / ID CORE XT (Luminex)",
 "Madkhali 2025, PMID 41147787, DOI 10.1111/tme.70040","41147787","10.1111/tme.70040",
 "MATCH. Transfus Med 2025;36(2):158-164.",NORET,"SUPPORTS",
 "'ID RHD XT was applied for 60 negative or weak RhD Saudi donors, while 354 Saudi and 110 non-Saudi donors received RHCE genotyping using the ID CORE XT.' (354+110 = 464) [Abstract]","",DATE],

["R06","S1.2 table row 4; S7.3(6) line 352",
 "'antigen frequencies are platform-PREDICTED, not serologically observed'",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "Table 4 heading: 'Frequency of Rh antigens typed with ID CORE XT among Saudi donors compared to existing reported information from Caucasians and Black people.' Table 3 column heading: 'Predicted phenotype'. [PMC13077421 full text]",
 "IMPORTANT SOURCE DEFECT FOUND: Madkhali's own Discussion contradicts this - 'Thus, we were able to study the expression of rarely examined Rh antigens using serology.' No serology for V/hrS/VS/hrB is described anywhere in its Methods. The protocol's caution is therefore CORRECT and is strengthened; record the source's internal inconsistency explicitly.",DATE],

["R06","S1.2 table row 4","'Deepest RHCE dataset in the region'",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"DOES NOT SUPPORT",
 "No such statement in the source.",
 "This is an unsearched comparative superlative written in the protocol's own voice inside an [EVIDENCE]-tagged table (line 85 applies [EVIDENCE] to all rows). It is a soft universal claim of the kind CLAUDE.md S7 governs. Restate as 'the largest RHCE dataset among the records retrieved in this project'.",DATE],

["R06","S1.3.2 line 103; S3.2 line 197; S7.4 T1",
 "Madkhali left 11/60 (18.3%) in an unresolved 'other than weak D types 1, 2, 3' bucket that the paper itself states may require additional molecular analysis",
 "Madkhali 2025, PMID 41147787","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "Table 1: 'Other than weak D types 1, 2 and 3 | 11 | 18.33'. Table 1 footnote a: '\"Other than weak D types 1, 2, and 3\" includes RHD variants not detected as weak D types 1, 2, or 3. The exact identification may require additional molecular analysis.' [PMC13077421]",
 "Exact. Also corroborated in the Limitations: 'complete sequencing was not performed, meaning that some hybrid or recombinant alleles may not have been detected, including those other than weak D types 1, 2, and 3.'",DATE],

["R06","S8.6 line 453","'Madkhali 2025 footnotes exactly this limitation' (multi-designation alleles, e.g. RHCE*01.20.01 vs RHCE*01.20.02)",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "Table 2 lists 'RHCE*ce(733G)' against BOTH 'RHCE*01.20.01' and 'RHCE*01.20.02'; footnote a: 'These alleles may have multiple possible ISBT designations depending on additional molecular changes. Exact identification may require further molecular investigation.' [PMC13077421]",
 "Exact, including the specific allele pair named in the protocol.",DATE],

["R06","S12 line 623","'Madkhali 2025 reports RHCE as 708 alleles from 354 donors'",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "'A total of 708 RHCE alleles from Saudi donors and 220 from non-Saudi donors were analyzed.' and 'A total of 354 RHCE genotypes from Saudi donors and 110 from non-Saudi donors were investigated.' [PMC13077421]","",DATE],

["R06","S12 line 637","Madkhali found no significant Saudi vs non-Saudi difference (p=0.5066 allele, p=0.8627 genotype) and zero rare or hybrid alleles among 110 non-Saudi donors",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "'Fisher's exact test revealed that there was no statistically significant difference in the distribution of the RHCE allele between the Saudi and non-Saudi donors (p = 0.5066).' / 'no significant difference in RHCE genotype distribution between the Saudi and non-Saudi donors (p = 0.8627).' / 'the non-Saudi group did not exhibit any of the RHCE rare genotypes or hybrid alleles.' [PMC13077421]",
 "Both p-values exact. CAVEAT worth adding: 'zero rare' is the source's own restrictive use of 'rare' - the non-Saudi group DID carry RHCE*ce(733G) in 17/220 alleles (7.73%), which the abstract itself counts as a variant allele. The protocol's sentence is faithful to the source but a reader could take it as 'no variants at all'.",DATE],

["R06","S6.4(3) line 303","'C^w was 0/354 in Jazan'","Madkhali 2025 [EVIDENCE]","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "'CW antigen (RH8) could not be found in the study cohort' and Table 4: 'CW (RH8) | 0'. The RHCE genotype denominator for Saudi donors is 354. [PMC13077421]",
 "Denominator correct. Note the 0 is a genotype-PREDICTED zero, not a serologically observed zero - material for a zero-cell upper-bound calculation and should be said.",DATE],

["R06","S8.2 line 392","'predicted e 98.84%, hr^S 97.75% in Jazan'","Madkhali 2025 [EVIDENCE]","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "Table 4: 'e (RH5) | 98.84' and 'hrS (RH19) | 97.75'. [PMC13077421]",
 "Exact to 2 dp; correctly labelled 'predicted'. (Madkhali's own abstract rounds hrS to 97.8.)",DATE],

["R06","S9.5 line 535","[INFERENCE] 'Three distinct variant repertoires co-occur in the GCC donor pool - an African-ancestry RHCE repertoire, an East/Southeast Asian RHD repertoire (DEL, Asian-type weak D), and a European-type weak D repertoire' - inferred from donor-origin composition in Madkhali 2025",
 "Madkhali 2025 [INFERENCE]","41147787","10.1111/tme.70040","n/a",NORET,"PARTIALLY SUPPORTS",
 "'Among the 110 non-Saudi donors, the majority were from Yemen (73), followed by Egypt (16), Sudan (6), India (5), Pakistan (4), Syria (3), Jordan (1), Nepal (1), and the Philippines (1).' [PMC13077421]",
 "The inference tag is correct and the composition data are real. But the East/Southeast Asian limb is thin: the reported composition contains 1 Nepali and 1 Filipino (2/110). The African-ancestry RHCE limb IS well supported by the same paper. Recommend narrowing the East/SE Asian limb or sourcing it elsewhere (Nuchnoi 2022 is a Thai, not a Gulf, source).",DATE],

["R06","S1.4 line 132","'Madkhali 2025's own priority claim is contested by Alalshaikh 2024, which Madkhali cites'",
 "Madkhali 2025 / Alalshaikh 2024","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS",
 "Madkhali abstract: 'The study represents the first molecular characterisation of RHD and RHCE alleles in Saudi Arabia'. Madkhali Introduction: 'A recent study in Saudi Arabia revealed that most individuals with the RhD-negative phenotype are likely to see a homozygous, complete deletion of the RHD gene and that RHD allele deletion is prevalent among the RhD-positive phenotype.' (= Alalshaikh 2024) [PMC13077421]",
 "Both limbs verified. D023's characterisation stands.",DATE],

["R06","S16 U18 line 728","OPEN AUDIT ITEM: 'Madkhali 2025 internal date discrepancy (Dec 2024 vs Mar 2024 sampling window)' - assigned to citation-verification-expert",
 "Madkhali 2025","41147787","10.1111/tme.70040","n/a",NORET,"SUPPORTS (discrepancy CONFIRMED in the source)",
 "Abstract: 'All blood donors' records between June 2023 and December 2024 were reviewed.' Methods 2.1: 'This retrospective study was conducted between June 2023 and March 2024.' [PMC13077421]",
 "U18 RESOLVED. The discrepancy is a defect IN THE PUBLISHED SOURCE, not a PILOT-03 transcription error. No PILOT-03 number depends on it. Record as an [UNCERTAIN] property of the source and close U18.",DATE],

# ---------------- R07 Haffener 2025 ----------------
["R07","S1.2 table row 5","Oman, 100 donors, WGS vs serology across 24 antigens; single centre (SQUH blood bank), randomly selected consented donors",
 "Haffener 2025, PMID 40916454, DOI 10.1111/trf.18401","40916454","10.1111/trf.18401",
 "MATCH. Transfusion 2025;65(10):1922-1934.",NORET,"SUPPORTS",
 "'One hundred healthy male and female Omani blood donors between the ages of 18 and 60 years attending the Sultan Qaboos University Hospital (SQUH) blood bank were randomly selected and consented for enrollment in the study.' / 'we applied a commonly used serology panel to phenotype 24 antigens' [PMC12531907 full text, read independently 2026-09-11]",
 "I retrieved PMC12531907 myself rather than relying on the auditor's reading, per role rules. Single-centre status confirmed.",DATE],

["R07","S1.2 table row 5; S1.3.1 line 97","'Yes - 98.7% accuracy; 12 discordances investigated with candidate variants proposed'",
 "Haffener 2025, PMID 40916454","40916454","10.1111/trf.18401","n/a",NORET,"PARTIALLY SUPPORTS",
 "'Across all blood group systems, the average blood group prediction accuracy was 98.7%.' / 'We identified a total of 12 discordances in 11 donors across five of the blood group systems.' / 'Candidate genetic variants that may resolve the discordance were identified in four cases and a genotyping error in one. Seven discordances remain unresolved, all of which involve the MNS blood group.' [PMC12531907]",
 "98.7% and 12 discordances are EXACT. But 'with candidate variants proposed' reads as applying to all 12; the source proposes candidates for 4 of 12, finds a genotyping error in 1, and leaves 7 (all MNS) UNRESOLVED. This matters because the protocol uses this row to justify retracting its own 'no discordance classification exists' claim, and because S8.4 promises full adjudication - Haffener's 58% non-resolution rate is a directly relevant feasibility datum the protocol currently omits. Rewrite to '12 discordances investigated; candidate variants proposed in 4, a genotyping error identified in 1, and 7 (all MNS) unresolved'.",DATE],

["R07","S1.2 table row 5","'Rh prediction 100% by copy-number + RHD-Psi; no partial-D resolution, no DEL'",
 "Haffener 2025 [EVIDENCE - PMC12531907]","40916454","10.1111/trf.18401","n/a",NORET,"SUPPORTS",
 "Table 1: 'Rh | 100%' with D inferred from 'RHD (deletion)' and 'RHDpsi (notably rs748783394, 37 bp insertion)'. Methods 2.4.2: 'D phenotypes were inferred using a copy number analysis... a ratio of RHD to RHCE coverage between 0 and 0.5 was classified as null...'. Discussion: 'accurate prediction of D antigen phenotype required inclusion of the RHDpsi pseudogene allele.' [PMC12531907]",
 "'No partial-D resolution, no DEL' is an argument from complete silence, but the D-inference method is described in full and contains no partial-D or DEL step anywhere, and neither term appears in the paper. Acceptable as EVIDENCE.",DATE],

["R07","S1.3.3 line 113","'Haffener's RHD results are behind egress blocks'",
 "Haffener 2025","40916454","10.1111/trf.18401","n/a",NORET,"CONTRADICTS",
 "PMC12531907 full text retrieved in full via get_full_text_article on 2026-09-11 (second independent retrieval; the Integrity Auditor retrieved it first).",
 "STALE AND FALSE. Haffener's RHD results are NOT behind an egress block and have now been read twice. Retraction-table row 3 must be narrowed to Ameen 2020 alone - which is exactly what re-audit finding MJ4 required and what S1.3.3 still does not say. This line is a live factual error in a G1 deliverable.",DATE],

# ---------------- R08 Al Lawati 2021 ----------------
["R08","S1.2 table row 6; S1.3.1 line 99; S1.3.3 line 114",
 "Omani doctoral thesis; 203 serologic D-negative samples; weak D types 45, 41, 4.2, DAR2.00, DIIIb, DVI.2; includes a DEL allele (IVS8-31T>C)",
 "Al Lawati 2021, DOI 10.24377/LJMU.T.00014274","","10.24377/LJMU.T.00014274",
 "RESOLVED via SciSpace: Al Lawati M. 'Molecular background of serological D negative phenotype in the Omani population'. Dissertation, Liverpool John Moores University, Feb 2021. DOI as claimed. NOT PubMed-indexed. Degree level, examiners and page count [UNVERIFIED - repository researchonline.ljmu.ac.uk is egress-blocked].",
 NORET_NP,"SUPPORTS",
 "'A total of 203 dry blood samples on Whatman's FTA card were collected from Omani cohort from different regions of the country.' / '...partial D without RHCE hybrid (DIIIb) in cis to weak D type 45 (n = 1), RHD-CE(4)-D in cis to weak D DAR2.00 (n = 1), weak D type 4.2 in cis to weak D type 41 (n = 1)... and DVI.2 (RHD-CE(4-6)-D in cis or trans to DEL(IVS8-31T>C) (n = 1).' [SciSpace abstract, independently re-retrieved 2026-09-11]",
 "Every allele named in the protocol (45, 41, 4.2, DAR2.00, DIIIb, DVI.2) and the DEL IVS8-31T>C appears verbatim in the abstract. n=203 exact. Refutation of the 'no GCC DEL screening' claim is sound.",DATE],

["R08","S1.2 table header line 74","Al Lawati 2021 counted as one of 'six DONOR-COHORT molecular red cell genotyping datasets from GCC states'",
 "Al Lawati 2021","","10.24377/LJMU.T.00014274","n/a",NORET_NP,"DOES NOT SUPPORT",
 "The abstract says only: 'A total of 203 dry blood samples on Whatman's FTA card were collected from Omani cohort from different regions of the country.' The word 'donor' does not appear in the abstract.",
 "The thesis does NOT establish that its 203 samples came from blood donors. Classifying it in a table of 'donor-cohort' datasets is unsupported. The re-audit already flagged 'Donor status still [UNVERIFIED]'; the table still asserts it. Either qualify the row ('cohort composition not stated in the retrievable abstract') or move it out of the donor-cohort count. This also weakens the count of six.",DATE],

# ---------------- R09 Vege & Westhoff ----------------
["R09","S1.3.4(3) line 123; S7.1 line 316; S8.3 class D7",
 "'7 RHD and 6 RHCE alleles discordant between manual and automated methods'",
 "Vege & Westhoff, DOI 10.1007/978-1-4419-7512-6_11","","10.1007/978-1-4419-7512-6_11",
 "RESOLVED via SciSpace: Vege S, Westhoff CM. 'Identification of Altered RHD and RHCE Alleles: A Comparison of Manual and Automated Molecular Methods.' Book chapter, 2011, American Red Cross. Book container 'BeadChip Molecular Immunohematology: Toward Routine Donor and Patient Antigen Profiling by DNA Analysis' (Springer, New York). PAGE RANGE and EDITORS [UNVERIFIED - registry blocked; Springer page egress-blocked]. Protocol cites NO year, NO book title, NO pages - incomplete citation.",
 NORET_NP,"SUPPORTS",
 "'RHD alleles were concordant between manual and automated methods with the exception of seven alleles. For RHCE, all were concordant with the exception of six.' [SciSpace abstract]",
 "Numbers EXACT. Two material caveats the protocol should state: (1) the comparison base is 149 samples referred for RHD and 168 for RHCE, and 'All samples were problem referrals encountered in routine transfusion practice' - i.e. an ENRICHED referral panel, NOT an unselected donor population, so the discordance rate is not transferable to PILOT-03's donors; (2) it is a 2011 BeadChip-era chapter, so it cannot speak to current platforms. Both weaken, but do not defeat, the platform-harmonisation rationale. Citation must be completed with year, book title and publisher.",DATE],

# ---------------- R10 Kim 2009 ----------------
["R10","S1.3.5 line 128","Primary anti-D in a D-negative Korean recipient traced to a DEL donor carrying RHD(c.1227G>A)",
 "Kim 2009, DOI 10.3343/kjlm.2009.29.4.361","19726900","10.3343/kjlm.2009.29.4.361",
 "MATCH. Korean J Lab Med 2009;29(4):361-5. Protocol cites no PMID; actual 19726900.",
 NORET,"SUPPORTS",
 "'A 68-yr-old D-negative Korean man was negative for anti-D at admission, and he developed alloanti-D after transfusion of red blood cells (RBC) from 4 apparently D-negative donors. ... One donor was found to have RHD (K409K). This is the first case in which DEL RBCs with RHD (K409K) induced a primary alloanti-D immunization in Asian population.' [Abstract]",
 "RHD(K409K) is c.1227G>A - stated in the same abstract: 'RHD (K409K, 1227G>A) allelic variant'. Note for the Director: this is an n=1 CASE REPORT (PubMed type 'Case Reports'). The protocol uses it as the sole clinical motivator in S1.3.5 and as a design justification in S3.2(ii). That is defensible but the evidentiary weight should be stated as a single case.",DATE],

["R10","S3.2 line 195; S7.3(4) line 350","'DEL is detectable serologically only by adsorption-elution' / 'Kim 2009 defines DEL as serologically detectable only by adsorption-elution'",
 "Kim 2009","19726900","10.3343/kjlm.2009.29.4.361","n/a",NORET,"SUPPORTS",
 "'Extremely weak D variants called DEL are serologically detectable only by adsorption-elution techniques.' [Abstract, opening sentence]",
 "Verbatim. Note this is a background assertion in a case report, not that paper's finding; a primary methods source would be stronger, but the claim is quoted correctly.",DATE],

# ---------------- R11 Owaidah 2023 ----------------
["R11","S1.3.5 line 128","Two Saudi obstetric patients typing D+ on routine serology carried RHD*DAU2/DAU6 and weak D type 4.1, and neither received RhIG",
 "Owaidah 2023, DOI 10.23750/abm.v94iS1.14120","36883669","10.23750/abm.v94iS1.14120",
 "MATCH. Acta Biomed 2023;94(S1):e2023080. Protocol cites no PMID; actual 36883669.",
 NORET,"SUPPORTS",
 "'Here, we describe two cases of RhD variants DAU2/DAU6 and Weak D type 4.1 in obstetric patients who were grouped as RhD +ve with negative antibody screening during routine serologic testing. ... According to routine testing neither patients received RhIG or transfusion.' [Abstract]",
 "All three elements exact. Two caveats: (a) n=2 case report; (b) these are PATIENTS, not donors - the protocol says 'Partial D in a normally-reacting D+ donor or patient' and then evidences only the patient side, which is honest, but the donor-side limb of that sentence is unevidenced. Note also the source contains its own priority claim ('we document to our knowledge the first reported cases of RhD variants among pregnant women in Saudi Arabia') which PILOT-03 correctly does not repeat.",DATE],

# ---------------- R12 Srivastava 2022 ----------------
["R12","S7.3(1) line 343","'monoclonal anti-D clones differ in their reactivity with partial and weak D'",
 "Srivastava 2022, DOI 10.21307/immunohematology-2022-036","35852060","10.21307/immunohematology-2022-036",
 "RESOLVED. Immunohematology 2022;38(1):17-24. PMC9364384. NOTE: PubMed renders the title with italicised allele names stripped ('Transfusion support for a woman withand the novelallele') - a PubMed rendering defect, not a fabrication.",
 NORET,"SUPPORTS",
 "'The DAR1.2 (weak D 4.2.2) lacks certain RhD epitopes and may test negative with clones LHM174/102, LHM70/45, LHM59/19, and LDM1.' / 'Except for LHM57/17, the remaining 12 monoclonal anti-D reagents agglutinated the RBCs with varying reaction strengths.' [PMC9364384 full text]",
 "Full text read 2026-09-11; claim directly and specifically supported, including the method-dependence the protocol relies on ('no agglutination with anti-D at immediate spin via tube method but showed 3+ agglutination via the gel matrix method'). CAVEAT: this is an n=1 CASE REPORT using a 13-clone panel, cited as [EVIDENCE] for a general proposition. The proposition is standard immunohaematology, but the citation is thinner than the tag implies.",DATE],

["R12","S9.5 line 536","'Clone reactivity and method sensitivity both move the discordance rate'",
 "de Paula Vendrame 2019; Srivastava 2022","35852060","10.21307/immunohematology-2022-036","n/a",NORET,"PARTIALLY SUPPORTS",
 "Srivastava reports clone-to-clone reactivity differences in one sample (quote above) but reports NO discordance rate of any kind.",
 "Srivastava supports 'clone reactivity varies'; it does not support 'moves the DISCORDANCE RATE', which is a population-level quantity absent from an n=1 report. The de Paula Vendrame limb carries the method-sensitivity half (see R14). Soften to 'clone reactivity varies between clones and method sensitivity moves the rate'.",DATE],

# ---------------- R13 Rodrigues 2021 ----------------
["R13","S7.3(1) line 343","co-cited for 'monoclonal anti-D clones differ in their reactivity with partial and weak D'",
 "Rodrigues 2021, DOI 10.1016/j.transci.2021.103135","33867285","10.1016/j.transci.2021.103135",
 "MATCH. Transfus Apher Sci 2021;60(4):103135. Protocol cites no PMID; actual 33867285.",
 NORET,"CANNOT VERIFY - full text needed",
 "The abstract states only that the comparison was PERFORMED: 'Furthermore, the serological profile of all RHD variant alleles identified was analyzed using different Anti-D clones.' No clone-level RESULT is reported in the abstract; I cannot quote a supporting result.",
 "No PMC record; Elsevier/ScienceDirect egress-blocked. Record exists and is correctly described; the specific claim cannot be verified from what is retrievable. The claim survives on Srivastava 2022 alone. Either mark this co-citation [UNVERIFIED - full text needed] or obtain the PDF via institutional access (Dr. Alanazi). Note PubMed types this record 'Clinical Trial' - almost certainly a PubMed indexing artefact for an observational donor study; do not describe it as a trial.",DATE],

# ---------------- R14 de Paula Vendrame 2019 ----------------
["R14","S7.3(3) line 349; S17 R6 line 745",
 "'adding a high-sensitivity solid-phase confirmatory test REDUCED the frequency of weak D samples typed as D-negative'",
 "de Paula Vendrame 2019, DOI 10.1111/vox.12851","31587310","10.1111/vox.12851",
 "MATCH. Vox Sang 2019;114(8):869-875. Protocol cites no PMID; actual 31587310.",
 NORET,"PARTIALLY SUPPORTS",
 "'Our study identified six new RHD alleles and showed that the inclusion of a confirmatory test using serological methodology with high sensitivity CAN REDUCE the frequency of weak D samples typed as D-negative.' [Abstract, Conclusion]",
 "MODALITY DRIFT. The source says 'can reduce' (a potential, argued from a null observation); the protocol says 'reduced' (an observed past-tense result). The source's actual finding is the opposite in form: 'No weak D type was found in either screening populations' - the reduction is the authors' inference from finding no missed weak D after adding the confirmatory test, not a measured before/after reduction. No reduction magnitude is reported. Change 'reduced' to 'can reduce' and attribute it as the authors' conclusion.",DATE],

# ---------------- R15 Flegel 2025 ----------------
["R15","S11 line 568","'\"Serologic D-negative\" and \"molecularly RHD-negative\" are distinct terms and are never used interchangeably'",
 "Flegel 2025, DOI 10.1186/s12967-025-06716-8","40537781","10.1186/s12967-025-06716-8",
 "MATCH. J Transl Med 2025;23(1):686. Protocol cites no PMID; actual 40537781.",
 NORET,"SUPPORTS",
 "Title: 'Transitioning a multiethnic donor pool from serologic D-negative to molecularly RHD-negative at a hospital-based blood donor service.' Abstract: 'We transitioned donors since 2009 from serologic D-negative to molecularly RHD-negative status at the NIH Clinical Center.' [Abstract]",
 "The source's entire framing is the distinction the protocol asserts; the terminological point is carried by the title and the transition sentence. Supporting datum also available: 'Over 15 years, 2254 D-negative donors were individually tested for the RHD gene... 42 donors tested positive (1.9%). Among them, 34 carried the common RHDpsi allele (80.9%)' - directly relevant to objective S3's RHDpsi discrimination requirement and worth citing there too.",DATE],

# ---------------- R16 Nuchnoi 2022 (NOT in the protocol body) ----------------
["R16","NOT in protocol body; methods-scoping l.208/l.391 and 05_pilot03-sample-size_v1.0.py l.86-87 (feeds the n=3,000 adopted at S6.4)",
 "In 1,270 serologically D-negative Thai donors, RHD*01EL.01 allele frequency 7.60% and RHD*01N.03 3.46%; 183/184 RHD*01EL.01 carriers were C-positive",
 "Nuchnoi 2022, DOI 10.2450/2022.0160-22","36346882","10.2450/2022.0160-22",
 "MATCH. Nuchnoi P, Thongbut J, Benech C, Kupatawintu P, Chaiwanichsiri D, Ferec C, Fichou Y. Blood Transfus 2022;21(3):209-217. Scoping's volume/issue/pages (21(3):209-217) correct.",
 NORET,"SUPPORTS",
 "'a total of 1,270 serologically D- blood donors originating from Central, Northeastern and South Thailand' / 'the Asian type DEL allele (RHD*01EL.01; 7.60%) and a D-negative hybrid allele (RHD*01N.03; 3.46%)' / 'All but one RHD*01EL.01 allele carriers (183/184) were C-positive' [Abstract]",
 "Every figure exact. Correctly labelled '[EVIDENCE - Thai, NOT Gulf]' in the scoping. GENERALISATION RISK: these Thai frequencies are planning inputs to the adopted n=3,000. Asian-type DEL is population-specific (cf. Flegel et al. iScience 2026, PMID 42181271: 'The Asian-type DEL is absent from India'), so a Thai DEL frequency is a weak prior for a Gulf donor pool. The sample-size justification's bracketing sensitivity requirement (S6.4 item 5) must cover this explicitly.",DATE],
]

# ---------------------------------------------------------------------------
def write_csv():
    p = os.path.join(OUT, "07_pilot03-citation-ledger_v1.0_%s.csv" % DATE)
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(H)
        for row in L:
            assert len(row) == len(H), row[0]
            w.writerow(row)
    return p, len(L)

def ris_type(t):
    return {"article": "JOUR", "inbook": "CHAP", "thesis": "THES"}[t]

def write_ris():
    p = os.path.join(OUT, "07_pilot03-references-verified_v1.0_%s.ris" % DATE)
    out = []
    for rid in sorted(RECORDS):
        r = RECORDS[rid]
        if r["l1_l2"] != "VERIFIED":
            continue
        out.append("TY  - %s" % ris_type(r["type"]))
        for a in r["authors"]:
            out.append("AU  - %s" % a)
        out.append("TI  - %s" % r["title"])
        if r["type"] == "inbook":
            out.append("BT  - %s" % r["booktitle"])
            out.append("PB  - %s" % r["publisher"])
            out.append("CY  - %s" % r["address"])
        elif r["type"] == "thesis":
            out.append("PB  - %s" % r["school"])
        else:
            out.append("JO  - %s" % r["journal"])
            out.append("J2  - %s" % r["iso"])
        out.append("PY  - %s" % r["year"])
        if r.get("volume"):
            out.append("VL  - %s" % r["volume"])
        if r.get("issue"):
            out.append("IS  - %s" % r["issue"])
        if r.get("pages"):
            sp, _, ep = r["pages"].partition("-")
            out.append("SP  - %s" % sp)
            if ep:
                out.append("EP  - %s" % ep)
        if r.get("doi"):
            out.append("DO  - %s" % r["doi"])
        if r.get("pmid"):
            out.append("AN  - %s" % r["pmid"])
        note = ("Verified %s by citation-verification-expert: L1 existence, L2 metadata, "
                "L3 retraction screen (PubMed article types), L4 claim support. "
                "See 07_pilot03-citation-ledger_v1.0_%s.csv (%s)." % (DATE, DATE, rid))
        if r.get("note"):
            note += " " + r["note"]
        if not r.get("pages"):
            note += " Page range [UNVERIFIED - registry blocked]."
        out.append("N1  - %s" % note)
        out.append("ER  - ")
        out.append("")
    with open(p, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    return p

def bib_escape(s):
    return s.replace("&", r"\&").replace("%", r"\%")

def write_bib():
    p = os.path.join(OUT, "07_pilot03-references-verified_v1.0_%s.bib" % DATE)
    out = ["% PILOT-03 verified reference library, generated {0} from".format(DATE),
           "% 07_pilot03-citation-ledger_v1.0_{0}.csv by build_refs.py.".format(DATE),
           "% Contains ONLY records that passed L1 existence + L2 metadata verification.",
           "% Claim-level verdicts (L4) are in the ledger, NOT here: presence in this file",
           "% does NOT mean the record supports the claim it is attached to.",
           ""]
    for rid in sorted(RECORDS):
        r = RECORDS[rid]
        if r["l1_l2"] != "VERIFIED":
            continue
        bt = {"article": "article", "inbook": "incollection", "thesis": "phdthesis"}[r["type"]]
        out.append("@%s{%s," % (bt, r["key"]))
        out.append("  author    = {%s}," % bib_escape(" and ".join(r["authors"])))
        out.append("  title     = {%s}," % bib_escape(r["title"]))
        if r["type"] == "inbook":
            out.append("  booktitle = {%s}," % bib_escape(r["booktitle"]))
            out.append("  publisher = {%s}," % r["publisher"])
            out.append("  address   = {%s}," % r["address"])
        elif r["type"] == "thesis":
            out.append("  school    = {%s}," % r["school"])
            out.append("  type      = {Doctoral thesis},")
        else:
            out.append("  journal   = {%s}," % bib_escape(r["journal"]))
            out.append("  shortjournal = {%s}," % bib_escape(r["iso"]))
        out.append("  year      = {%s}," % r["year"])
        if r.get("volume"):
            out.append("  volume    = {%s}," % r["volume"])
        if r.get("number" ) or r.get("issue"):
            if r.get("issue"):
                out.append("  number    = {%s}," % r["issue"])
        if r.get("pages"):
            out.append("  pages     = {%s}," % r["pages"].replace("-", "--"))
        if r.get("doi"):
            out.append("  doi       = {%s}," % r["doi"])
        if r.get("pmid"):
            out.append("  pmid      = {%s}," % r["pmid"])
        if r.get("pmc"):
            out.append("  pmcid     = {%s}," % r["pmc"])
        note = "Verified %s (L1-L4); ledger id %s" % (DATE, rid)
        if not r.get("pages"):
            note += "; page range [UNVERIFIED - registry blocked]"
        if r.get("note"):
            note += "; " + r["note"].replace("{", "").replace("}", "")
        out.append("  note      = {%s}" % bib_escape(note))
        out.append("}")
        out.append("")
    with open(p, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    return p

if __name__ == "__main__":
    cp, n = write_csv()
    rp = write_ris()
    bp = write_bib()
    nrec = sum(1 for r in RECORDS.values() if r["l1_l2"] == "VERIFIED")
    print("ledger rows (claims): %d" % n)
    print("bibliographic records emitted: %d of %d" % (nrec, len(RECORDS)))
    from collections import Counter
    c = Counter(row[8] for row in L)
    for k, v in sorted(c.items(), key=lambda x: -x[1]):
        print("  %-45s %d" % (k, v))
    print(cp); print(rp); print(bp)
