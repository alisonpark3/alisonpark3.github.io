import tracker from "./profile_tracker.json";

type TrackerRow = Record<string, string>;

type TrackerFile = {
  summary: {
    generated_on: string;
    high_level_counts: {
      outputs_total: number;
      journal_articles: number;
      conference_abstracts: number;
      unique_people: number;
      people_with_public_links: number;
      timeline_events: number;
      projects: number;
      named_conferences: number;
    };
  };
  tables: Record<string, TrackerRow[]>;
};

type AuthorLink = {
  name: string;
  href: string;
  isAlison: boolean;
  position: string;
};

type Publication = {
  id: string;
  title: string;
  year: string;
  venue: string;
  citation: string;
  type: string;
  authorPosition: string;
  authorRole: string;
  authorCount: string;
  authorsPreview: AuthorLink[];
  authorsAll: AuthorLink[];
  hiddenAuthorCount: number;
  tags: string[];
  topicSummary: string;
  officialUrl: string;
  doiUrl: string;
  conferenceName: string;
  conferenceSession: string;
  conferenceProgramUrl: string;
  conferenceOfficialUrl: string;
  localProofStatus: string;
  proofNote: string;
  metricSummary: string;
  metricHighlights: { label: string; value: string }[];
  posterUrl: string;
  posterLabel: string;
  awardLabel: string;
  nameVariantNote: string;
};

const trackerData = tracker as TrackerFile;
const tables = trackerData.tables;
const ALISON_ID = "person_alison_seongjee_park";
const CONTACT = {
  email: "alisonsjpark@gmail.com",
  phone: "516-580-2246",
  location: "New York, NY",
  linkedin: "https://www.linkedin.com/in/alison-s-park/",
  github: "https://github.com/alisonpark3",
  scholar: "https://scholar.google.com/citations?user=dVduBUMAAAAJ&hl=en"
};
const DOWNLOADS = {
  resumePdf: "/files/Alison_Park_Resume.pdf",
  cvPdf: "/files/Alison_Park_CV.pdf",
  cvDocx: "/files/Alison_Park_CV.docx"
};

const institutions = new Map((tables.institutions || []).map((row) => [row.institution_id, row]));
const officialLinks = new Map((tables.official_output_links || []).map((row) => [row.output_id, row]));
const peoplePublicLinks = new Map((tables.people_public_links || []).map((row) => [row.person_id, row]));
const digitalProfiles = new Map((tables.digital_profiles || []).map((row) => [row.platform, row]));
const outputs = [...(tables.outputs || [])];

const metricsByOutput = new Map<string, TrackerRow[]>();
for (const metric of tables.output_metrics || []) {
  const current = metricsByOutput.get(metric.output_id) || [];
  current.push(metric);
  metricsByOutput.set(metric.output_id, current);
}

const authorsByOutput = new Map<string, TrackerRow[]>();
for (const row of tables.output_authors || []) {
  const current = authorsByOutput.get(row.output_id) || [];
  current.push(row);
  authorsByOutput.set(row.output_id, current);
}

const profileMetricLookup = new Map((tables.profile_metrics || []).map((row) => [`${row.platform}:${row.metric_name}`, row]));
const posterLinks: Record<string, { url: string; label: string }> = {
  out_2024_blood_single_cell_apc: {
    url: "/files/posters/ASH_2024_POSTER_HRSR_MMRF_FINAL.pdf",
    label: "ASH 2024 poster"
  },
  out_2024_blood_immune_profiling: {
    url: "/files/posters/ASH_2024_POSTER_immunePSN_MMRF.pdf",
    label: "ASH 2024 poster"
  }
};

function institutionName(institutionId: string) {
  return (
    institutions.get(institutionId)?.display_name ||
    institutions.get(institutionId)?.institution_name ||
    institutions.get(institutionId)?.name ||
    ""
  );
}

function formatMonth(value?: string, style: "short" | "long" = "short") {
  if (!value) return "";

  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;
  const shortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const longNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const label = style === "long" ? longNames[monthIndex] : shortNames[monthIndex];
  return `${label || month} ${year}`;
}

function formatRange(start?: string, end?: string, isPresent = false, style: "short" | "long" = "short") {
  if (!start && !end) return "";
  if (!start) return formatMonth(end, style);
  if (!end) return `${formatMonth(start, style)} to Present`;
  if (isPresent) return `${formatMonth(start, style)} to Present`;
  if (start.slice(0, 7) === end.slice(0, 7)) return formatMonth(start, style);
  return `${formatMonth(start, style)} to ${formatMonth(end, style)}`;
}

function timelineDateLabel(event: TrackerRow) {
  return formatRange(event.start_date, event.end_date, event.event_id === "evt_2023_bioinformatician");
}

function ordinal(value: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Co-author";
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${number}th author`;
  const mod10 = number % 10;
  if (mod10 === 1) return `${number}st author`;
  if (mod10 === 2) return `${number}nd author`;
  if (mod10 === 3) return `${number}rd author`;
  return `${number}th author`;
}

function outputTypeLabel(value: string) {
  return value === "journal_article" ? "Journal article" : "Conference abstract";
}

function findMetric(outputId: string, label: string) {
  return (metricsByOutput.get(outputId) || []).find((metric) => metric.metric_label === label);
}

function formatMetric(metric?: TrackerRow) {
  if (!metric) return "";
  return `${metric.metric_value} ${metric.metric_unit}`.trim();
}

function metricSentence(outputId: string) {
  const custom: Record<string, string> = {
    out_2018_blood_e2f1_selinexor: "Selinexor-resistance work built on a 32-patient RNA-seq cohort with a 26-patient validation set.",
    out_2020_blood_eusox11_ccnd1_mcl: "Mantle-cell lymphoma mouse-model work reported median survival of 16.5 versus 19.7 months across the compared models.",
    out_2024_blood_immune_profiling: "Immune-profiling analysis connected 185 samples with 776,859 companion single-cell measurements.",
    out_2024_blood_single_cell_apc: "Single-cell cohort spanned 72 newly diagnosed patients, 567,340 cells, and 92 identified cell populations.",
    out_2025_clml_multiomic_snf: "Multi-omics subtype analysis integrated 389 patients into 6 clusters, with a hazard ratio of 4.46 for the highest-risk group.",
    out_2025_blood_setd8_epigenetic: "SETD8 abstract linked 54 relapsed multiple-myeloma samples to a biochemical IC50 of 0.16 +/- 0.03 uM for MS2928.",
    out_2025_blood_shared_immune_features: "Shared immune-feature analysis covered 159 patients and 435,000 cells across human subtypes and murine models.",
    out_2026_jmc_setd8_inhibitor: "The published SETD8 paper reports 0.14 +/- 0.04 uM potency with selectivity tested across 20 enzymes."
  };
  return custom[outputId] || "";
}

function outputCitation(output: TrackerRow) {
  const venue = output.venue || "";
  const volumeBlock = output.volume ? `${output.volume}${output.issue ? ` (${output.issue})` : ""}` : "";
  if (volumeBlock && output.pages) return `${venue} ${volumeBlock}: ${output.pages}`;
  if (volumeBlock) return `${venue} ${volumeBlock}`;
  return venue ? `${venue}, ${output.year}` : output.year;
}

function topicTags(output: TrackerRow, official?: TrackerRow) {
  const title = (output.title || "").toLowerCase();
  const venue = (output.venue || "").toLowerCase();
  const conferenceName = (official?.conference_name || "").toLowerCase();
  const methods = (output.methods || "").toLowerCase();
  const tags = [outputTypeLabel(output.output_type)];

  if (output.conference_id?.includes("ash") || venue.includes("blood") || conferenceName.includes("ash")) tags.push("ASH");
  if (
    output.conference_id?.includes("ims") ||
    venue.includes("clinical lymphoma") ||
    conferenceName.includes("international myeloma")
  ) {
    tags.push("IMS");
  }

  if (output.award_flag === "yes") tags.push("Awarded");
  if (title.includes("single-cell") || title.includes("immune") || methods.includes("scanpy") || methods.includes("seurat")) {
    tags.push("Single-Cell");
  }
  if (title.includes("multi-omic") || title.includes("subtype") || methods.includes("spectral clustering") || methods.includes("snf")) {
    tags.push("Multi-Omics");
  }
  if (title.includes("setd8") || title.includes("inhibitor") || title.includes("epigenetic")) tags.push("Drug Discovery");

  return [...new Set(tags)];
}

function authorLink(row: TrackerRow): AuthorLink {
  const publicLink = peoplePublicLinks.get(row.person_id)?.best_public_link || "";
  return {
    name: row.canonical_name,
    href: publicLink,
    isAlison: row.person_id === ALISON_ID,
    position: row.author_position
  };
}

function publicationAuthors(outputId: string) {
  const rows = [...(authorsByOutput.get(outputId) || [])].sort((left, right) => Number(left.author_position) - Number(right.author_position));
  const allAuthors = rows.map(authorLink);

  let previewRows = rows;
  if (rows.length > 5) {
    const firstThree = rows.slice(0, 3);
    const alison = rows.find((row) => row.person_id === ALISON_ID);
    const senior = rows.at(-1);
    const seen = new Set<string>();
    previewRows = [firstThree[0], firstThree[1], firstThree[2], alison, senior]
      .filter(Boolean)
      .filter((row) => {
        const key = `${row?.person_id || ""}:${row?.raw_name || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }) as TrackerRow[];
  }

  return {
    preview: previewRows.map(authorLink),
    all: allAuthors,
    hiddenCount: Math.max(allAuthors.length - previewRows.length, 0)
  };
}

function proofStatus(official?: TrackerRow) {
  if (official?.local_pdf_path) {
    return {
      label: "Official record and local PDF archived",
      note: "Public page verified and source file saved locally."
    };
  }

  return {
    label: "Official record verified",
    note: "Public publisher or conference record verified."
  };
}

function liveUrl(value?: string) {
  if (!value) return "";
  if (value.includes("annual-meeting-history/past-meetings")) return "";
  return value;
}

function nameVariantNote(variant: string) {
  if (!variant || variant === "Alison Seongjee Park") return "";
  if (variant === "Seongjee Park" || variant === "S Park") {
    return `Published under the earlier name variant ${variant}.`;
  }
  return `Publisher record lists the author as ${variant}.`;
}

function metricHighlights(outputId: string) {
  const recipes: Record<string, string[]> = {
    out_2018_blood_e2f1_selinexor: ["RNA-seq cohort size", "validation cohort size"],
    out_2020_blood_eusox11_ccnd1_mcl: ["median survival"],
    out_2024_blood_immune_profiling: ["samples", "single cells profiled"],
    out_2024_blood_single_cell_apc: ["patients", "single cells profiled", "identified cell populations"],
    out_2025_clml_multiomic_snf: ["newly diagnosed patients", "clusters", "hazard ratio"],
    out_2025_blood_setd8_epigenetic: ["relapsed MM samples", "MS2928 SETD8 IC50"],
    out_2025_blood_shared_immune_features: ["newly diagnosed patients", "single cells profiled", "hazard ratio for death"],
    out_2026_jmc_setd8_inhibitor: ["SETD8 IC50", "methyltransferases tested", "JJN-3 viability IC50"]
  };

  return (recipes[outputId] || [])
    .map((label) => findMetric(outputId, label))
    .filter(Boolean)
    .map((metric) => ({
      label: metric?.metric_label || "",
      value: formatMetric(metric)
    }));
}

const publications: Publication[] = outputs
  .map((output) => {
    const official = officialLinks.get(output.output_id);
    const authors = publicationAuthors(output.output_id);
    const proof = proofStatus(official);
    return {
      id: output.output_id,
      title: output.title,
      year: output.year,
      venue: output.venue,
      citation: outputCitation(output),
      type: outputTypeLabel(output.output_type),
      authorPosition: ordinal(output.alison_author_position),
      authorRole: `${ordinal(output.alison_author_position)} of ${output.author_count} authors`,
      authorCount: output.author_count,
      authorsPreview: authors.preview,
      authorsAll: authors.all,
      hiddenAuthorCount: authors.hiddenCount,
      tags: topicTags(output, official),
      topicSummary: output.topic,
      officialUrl: official?.official_url || output.official_url || "",
      doiUrl: official?.doi_url || (output.doi ? `https://doi.org/${output.doi}` : ""),
      conferenceName: official?.conference_name || "",
      conferenceSession: official?.conference_session || output.conference_session || "",
      conferenceProgramUrl: liveUrl(official?.conference_program_url),
      conferenceOfficialUrl: liveUrl(official?.conference_official_url),
      localProofStatus: proof.label,
      proofNote: proof.note,
      metricSummary: metricSentence(output.output_id),
      metricHighlights: metricHighlights(output.output_id),
      posterUrl: posterLinks[output.output_id]?.url || "",
      posterLabel: posterLinks[output.output_id]?.label || "",
      awardLabel: output.award_flag === "yes" ? "ASH Abstract Achievement Award" : "",
      nameVariantNote: nameVariantNote(output.alison_name_variant)
    };
  })
  .sort((left, right) => Number(right.year) - Number(left.year) || left.title.localeCompare(right.title));

const publicationById = new Map(publications.map((publication) => [publication.id, publication]));

const projectCopy: Record<string, { summary: string; framing: string; whatItShows: string; metrics?: string }> = {
  proj_diabetic_hospital_readmission: {
    summary:
      "A healthcare classification project focused on predicting diabetic-patient readmission and comparing model performance over a large hospital dataset.",
    framing:
      "Practical tabular modeling in a healthcare setting, with clear attention to feature engineering, model comparison, and evaluation.",
    whatItShows: "Healthcare tabular modeling, evaluation metrics, and decision-focused framing."
  },
  proj_pneumonia_xray_recognition: {
    summary:
      "A deep-learning project for pediatric pneumonia detection from chest X-rays, built in Python around a clinically relevant imaging problem.",
    framing:
      "Hands-on CNN training, image classification, and medical-imaging framing in a public notebook workflow.",
    whatItShows: "CNN experimentation, notebook-driven iteration, and medical-imaging context.",
    metrics: "About 6,000 pediatric chest X-rays; conclusion reports 99.7% recall and 99% accuracy."
  },
  proj_flu_vaccine_p3: {
    summary:
      "A public data-science repository centered on flu-vaccine modeling and health-focused predictive analysis.",
    framing:
      "Built from the 2009 H1N1 Flu Survey to model seasonal flu-vaccine uptake using demographics, health behaviors, and vaccine-belief features.",
    whatItShows: "Random forest modeling, feature interpretation, and health-focused predictive analysis.",
    metrics: "26,707 survey responses and 35 features; final random forest precision 0.7898; doctor's recommendation split was 73.8% vaccinated vs 34.6% without."
  }
};

const projects = (tables.projects || [])
  .map((project) => ({
    id: project.project_id,
    title: project.title,
    href: project.repo_url,
    language: project.language,
    createdDate: formatMonth(project.created_date, "long"),
    summary: projectCopy[project.project_id]?.summary || "",
    framing: projectCopy[project.project_id]?.framing || "",
    whatItShows: projectCopy[project.project_id]?.whatItShows || "",
    metrics: projectCopy[project.project_id]?.metrics || project.quantitative_claims,
    originality:
      project.originality_status === "public_fork_with_adaptation"
        ? "Adapted / forked training project"
        : "Original public repo",
    featuredOnLinkedIn: project.featured_on_linkedin === "yes"
  }))
  .sort((left, right) => left.title.localeCompare(right.title));

const timelineCopy: Record<
  string,
  Partial<{
    title: string;
    role: string;
    summary: string;
    detail: string;
    fullDateLabel: string;
  }>
> = {
  evt_2017_mount_sinai_trainee: {
    title: "Volunteer Research Trainee",
    role: "Cancer Epigenetics Laboratory",
    fullDateLabel: "September 2017 to July 2018",
    summary:
      "Learned how a translational oncology project moves from question to evidence by supporting Donna Edwards, PhD, on the SOX11 mantle-cell lymphoma program.",
    detail:
      "Built the bench foundation through compound screening, cell culture, flow cytometry, PCR/qPCR, Western blotting, lentiviral transduction, mouse breeding and lymph-node/spleen harvests, while observing ChIP-seq workflows, scientific writing, and Samir Parekh's clinical view of diagnosis and disease monitoring."
  },
  evt_2018_mount_sinai_ra: {
    summary:
      "Promoted from volunteer to research assistant, took ownership of a SETD8 drug-discovery project, and continued contributing to E2F1/selinexor and SOX11 work.",
    detail:
      "Built the program step by step: E2F1/selinexor work led to an ASH abstract; SETD8 work began with a Mount Sinai collaborator's compound, then moved through myeloma cell-line efficacy and toxicity screens, flow and cell-culture assays, qPCR/Western blot validation, cell-separation assays, CRISPR knockout studies for SOX11/SETD8, xenograft testing in immunocompromised mice versus saline placebo, and IHC/imaging review with pathologists. The SETD8 program later matured into the 2026 Journal of Medicinal Chemistry inhibitor paper."
  }
};

const timeline = [...(tables.timeline_events || [])]
  .sort((left, right) => left.start_date.localeCompare(right.start_date))
  .map((event) => {
    const copy = timelineCopy[event.event_id] || {};
    return {
      id: event.event_id,
      sortDate: event.start_date,
      dateLabel: timelineDateLabel(event),
      fullDateLabel:
        copy.fullDateLabel ||
        formatRange(event.start_date, event.end_date, event.event_id === "evt_2023_bioinformatician", "long"),
      title: copy.title || event.title,
      institution: institutionName(event.institution_id),
      role: copy.role || event.role_or_program,
      summary: copy.summary || event.summary,
      detail:
        copy.detail ||
        (event.event_id === "evt_2017_bs_start"
          ? "Honor verified as Cum Laude in the official CCNY commencement book."
          : event.quantifiable_details),
      category: event.category
    };
  });

const journeyMilestoneIds = new Set([
  "evt_2015_feinstein_internship",
  "evt_2017_bs_start",
  "evt_2017_mount_sinai_trainee",
  "evt_2018_mount_sinai_ra",
  "evt_2021_md_candidate",
  "evt_2023_flatiron",
  "evt_2023_bioinformatician",
  "evt_2024_ash_double_award",
  "evt_2026_jmc_publish"
]);

const timelineMetricMap: Record<string, string[]> = {
  evt_2026_jmc_publish: ["0.14 +/- 0.04 uM lead potency", "20 methyltransferases tested", "JMC publication"],
  evt_2024_ash_double_award: ["2 award-marked Blood abstracts", "2024 ASH meeting"],
  evt_2023_bioinformatician: ["389-patient cohort", "776,859-cell companion dataset", "Mount Sinai current role"],
  evt_2023_flatiron: ["525 hours", "5+ data-science projects"],
  evt_2021_md_candidate: ["2021 to 2023 medical training"],
  evt_2018_mount_sinai_ra: ["E2F1/selinexor ASH abstract", "SETD8 inhibitor program", "xenograft + IHC validation"],
  evt_2017_mount_sinai_trainee: ["SOX11 project training", "flow/qPCR/Western blot", "clinical shadowing"],
  evt_2017_bs_start: ["Cum Laude"],
  evt_2015_feinstein_internship: ["Summer internship"]
};

const journeyMilestones = timeline
  .filter((item) => journeyMilestoneIds.has(item.id))
  .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
  .map((item) => ({
    ...item,
    metricBadges: timelineMetricMap[item.id] || []
  }));

const proofStrip = [
  {
    label: "Public research record",
    value: "8 public outputs",
    note: "1 Journal of Medicinal Chemistry article and 7 conference abstracts tracked across Blood and CLML / IMS."
  },
  {
    label: "Multi-omics cohort",
    value: "389 NDMM patients",
    note: "The CLML / IMS subtype study integrates WES, RNA-seq, clinical data, and CyTOF immune profiling."
  },
  {
    label: "Single-cell scale",
    value: "776,859 cells",
    note: "The largest listed single-cell companion analysis; the APC study separately reports 72 patients and 567,340 cells."
  },
  {
    label: "ASH recognition",
    value: "2 award-marked abstracts",
    note: "The CV marks both 2024 Blood abstracts as ASH Abstract Achievement Award work."
  },
  {
    label: "SETD8 inhibitor signal",
    value: "0.14 +/- 0.04 uM",
    note: "Published MS2928 SETD8 biochemical potency, paired with selectivity testing across 20 methyltransferases."
  }
];

const rolePanels = [
  {
    title: "1. Cancer-biology foundation",
    body:
      "Built a cancer-biology foundation through wet-lab and translational assay work, especially SETD8-focused multiple-myeloma research that later matured into a peer-reviewed inhibitor publication."
  },
  {
    title: "2. Patient-scale computational modeling",
    body:
      "Transitioned that disease context into computational biology by integrating WES, single-cell RNA-seq, CyTOF, TCR-seq, and clinical data to build patient networks and multi-omic models of myeloma heterogeneity."
  },
  {
    title: "3. AI pipeline development",
    body:
      ""
  }
];

const focusMap = [
  {
    id: "multiomics",
    label: "Multi-omics modeling",
    title: "Subtype discovery from integrated cohorts",
    body: "This line of work combines WES, RNA-seq, CyTOF, and network integration to refine multiple-myeloma structure beyond standard staging labels.",
    evidence: "389 patients, 6 clusters, HR 4.46 vs Cluster 6",
    skills: ["SNF", "spectral clustering", "cohort integration", "survival analysis"],
    links: [
      {
        label: "2025 CLML / IMS abstract",
        href: publicationById.get("out_2025_clml_multiomic_snf")?.officialUrl || ""
      }
    ]
  },
  {
    id: "singlecell",
    label: "Single-cell immune profiling",
    title: "Cell-state changes in high-risk disease",
    body: "This vertical maps how aggressive disease changes antigen presentation, IFN-stimulated T-cell states, and immune composition at cellular resolution.",
    evidence: "72 NDMM patients, 567,340 BM cells, 92 identified cell populations",
    skills: ["Scanpy", "Seurat", "InferCNV", "CellphoneDB", "pySCENIC"],
    links: [
      {
        label: "2024 Blood abstract: APC / IFN-stimulated CD4 depletion",
        href: publicationById.get("out_2024_blood_single_cell_apc")?.officialUrl || ""
      },
      {
        label: "2024 Blood abstract: subtype-linked immune profiling",
        href: publicationById.get("out_2024_blood_immune_profiling")?.officialUrl || ""
      }
    ]
  },
  {
    id: "sharedimmune",
    label: "Cross-model comparison",
    title: "Shared immune features across patient and murine systems",
    body: "This work extends the single-cell story by asking which immune and clonal signals remain consistent across human subtypes and murine models.",
    evidence: "159 NDMM patients, 435,000 cells, HR 2.3 for single-clone fraction >=19%",
    skills: ["clone analysis", "single-cell integration", "survival association", "cross-model comparison"],
    links: [
      {
        label: "2025 Blood abstract: shared immune features",
        href: publicationById.get("out_2025_blood_shared_immune_features")?.officialUrl || ""
      }
    ]
  },
  {
    id: "therapeutics",
    label: "Translational therapeutics",
    title: "From epigenetic mechanism to inhibitor evidence",
    body: "The SETD8 program ties disease relevance, inhibitor design, selectivity, and in vivo evidence together in one translational thread.",
    evidence: "SETD8 IC50 0.14 +/- 0.04 uM; selectivity tested across 20 methyltransferases",
    skills: ["compound evaluation", "crystallography", "mass spectrometry", "xenograft studies"],
    links: [
      {
        label: "2025 Blood abstract: SETD8 in multiple myeloma",
        href: publicationById.get("out_2025_blood_setd8_epigenetic")?.officialUrl || ""
      },
      {
        label: "2026 JMC paper",
        href: publicationById.get("out_2026_jmc_setd8_inhibitor")?.officialUrl || ""
      }
    ]
  },
  {
    id: "ml-llm",
    label: "AI pipeline development",
    title: "AI pipeline development",
    body: "",
    evidence: "",
    skills: [],
    links: []
  }
];

const methods = [
  {
    title: "Machine learning and statistics",
    body: "Modeling, evaluation, and statistical analysis used across cohort-scale oncology datasets.",
    items: ["unsupervised learning", "feature engineering", "survival analysis", "statistical testing", "Python and R modeling"]
  },
  {
    title: "Multi-omics integration",
    body: "Recent multiple-myeloma work combines bulk and single-cell data with clinical context to produce clinically interpretable subtype structure.",
    items: ["SNF", "cNMF", "MOVICS", "MOFA", "integrAO"]
  },
  {
    title: "Single-cell genomics",
    body: "The current portfolio includes immune-state mapping, cell-cell signaling context, and regulon analysis across high-risk disease states.",
    items: ["Scanpy", "Seurat", "CellphoneDB", "InferCNV", "pySCENIC"]
  },
  {
    title: "Pipeline and collaboration habits",
    body: "Workflow habits built for multi-institutional cohorts and repeatable analysis.",
    items: ["Git and GitHub", "SQL", "shell scripting", "HPC environments", "reproducible workflows"]
  },
  {
    title: "Wet-lab translation context",
    body: "Earlier bench work provides context for what the assays mean once they become data.",
    items: ["cell culture", "flow cytometry", "Western blotting", "mouse xenografts", "qPCR and assay interpretation"]
  }
];

const awards = [
  {
    title: "ASH Abstract Achievement Award",
    meta: "2024 • 2 abstracts",
    body: "Two 2024 Blood abstracts are marked as award-winning in the CV, strengthening the visibility of the immune-profiling work."
  },
  {
    title: "Cum Laude",
    meta: "2021 • Sophie Davis / CCNY",
    body: "Verified in the official commencement record."
  },
  {
    title: "UKC FIRE 2025",
    meta: "2nd place presentation",
    body: "Recognition for the multiple-myeloma stratification work in an interdisciplinary research setting."
  },
  {
    title: "Katalyst 2025",
    meta: "Organizer • 200+ attendees",
    body: "Community leadership through programming, logistics, and mentorship-oriented event building."
  }
];

const researchStories = [
  {
    id: "story-setd8",
    yearLabel: "2026 / 2025",
    title: "SETD8 targeting from disease signal to inhibitor evidence",
    summary:
      "The SETD8 story is the clearest bridge between earlier wet-lab oncology work and later translational framing: disease relevance in multiple myeloma, a targetable epigenetic mechanism, and a published inhibitor paper with in vivo evidence.",
    contribution:
      "Co-authorship across the 2025 Blood abstract and the 2026 Journal of Medicinal Chemistry article, connecting the disease question to potency, selectivity, structural evidence, and xenograft suppression.",
    methods: ["compound design", "mass spectrometry", "crystallography", "viability assays", "xenograft studies"],
    results: [
      "SETD8 expression and functional evidence support the target in relapsed multiple myeloma.",
      "Lead compound MS2928 reached 0.14 +/- 0.04 uM biochemical potency in the published paper.",
      "Selectivity was tested across 20 methyltransferases, with in vivo tumor-suppression evidence in xenograft models."
    ],
    metrics: [
      { label: "Relapsed MM cohort", value: formatMetric(findMetric("out_2025_blood_setd8_epigenetic", "relapsed MM samples")) },
      { label: "Lead potency", value: formatMetric(findMetric("out_2026_jmc_setd8_inhibitor", "SETD8 IC50")) },
      { label: "Selectivity panel", value: formatMetric(findMetric("out_2026_jmc_setd8_inhibitor", "methyltransferases tested")) }
    ],
    links: [
      publicationById.get("out_2026_jmc_setd8_inhibitor"),
      publicationById.get("out_2025_blood_setd8_epigenetic")
    ].filter(Boolean)
  },
  {
    id: "story-subtypes",
    yearLabel: "2025",
    title: "Multi-omics subtype modeling in newly diagnosed multiple myeloma",
    summary:
      "This work asks whether myeloma classification becomes more clinically useful when tumor state and immune context are modeled together instead of as separate silos.",
    contribution:
      "Second-author work on the 2025 CLML / IMS abstract that integrates WES, RNA-seq, CyTOF, and unsupervised network methods into a clinically interpretable cluster framework.",
    methods: ["SNF", "spectral clustering", "WES", "RNA-seq", "CyTOF"],
    results: [
      "389 newly diagnosed patients integrated into one cohort.",
      "6 clusters with distinct mutational and immune profiles.",
      "Hazard ratio 4.46 between the highest-risk and reference cluster."
    ],
    metrics: [
      { label: "Patients", value: formatMetric(findMetric("out_2025_clml_multiomic_snf", "newly diagnosed patients")) },
      { label: "Clusters", value: formatMetric(findMetric("out_2025_clml_multiomic_snf", "clusters")) },
      { label: "Hazard ratio", value: formatMetric(findMetric("out_2025_clml_multiomic_snf", "hazard ratio")) }
    ],
    links: [publicationById.get("out_2025_clml_multiomic_snf")].filter(Boolean)
  },
  {
    id: "story-shared-immune",
    yearLabel: "2025",
    title: "Shared immune features across human subtypes and murine models",
    summary:
      "This follow-on abstract extends the immune story beyond one dataset by asking which cellular and clonal signals remain shared across patient subtypes and model systems.",
    contribution:
      "Third-author work on a cross-system immune-feature study that links clonal structure, cellular composition, and survival-associated patterns.",
    methods: ["single-cell integration", "tumor clone analysis", "survival association", "cross-model comparison"],
    results: [
      "159 newly diagnosed patients and 435,000 cells in the analysis set.",
      "A median of 8 clones per patient was reported across the cohort.",
      "Hazard ratio 2.3 for death when the single-clone fraction crossed the reported threshold."
    ],
    metrics: [
      { label: "Patients", value: formatMetric(findMetric("out_2025_blood_shared_immune_features", "newly diagnosed patients")) },
      { label: "Single cells", value: formatMetric(findMetric("out_2025_blood_shared_immune_features", "single cells profiled")) },
      { label: "Hazard ratio", value: formatMetric(findMetric("out_2025_blood_shared_immune_features", "hazard ratio for death")) }
    ],
    links: [publicationById.get("out_2025_blood_shared_immune_features")].filter(Boolean)
  },
  {
    id: "story-immune",
    yearLabel: "2024",
    title: "Single-cell immune depletion in high-risk newly diagnosed myeloma",
    summary:
      "The 2024 Blood abstracts bring cellular resolution to the risk question, showing that aggressive disease is not just a label but a distinct immune microenvironment.",
    contribution:
      "Second-author contributions across two award-marked ASH abstracts connecting cell-state shifts, immune depletion, and subtype-level structure.",
    methods: ["scRNA-seq", "InferCNV", "Seurat", "CellphoneDB", "pySCENIC"],
    results: [
      "72-patient cohort spanning 567,340 cells and 92 identified populations.",
      "Companion analysis of 185 samples and 776,859 cells.",
      "Depletion of APC and IFN-stimulated CD4 T-cell populations in higher-risk disease."
    ],
    metrics: [
      { label: "Patients", value: formatMetric(findMetric("out_2024_blood_single_cell_apc", "patients")) },
      { label: "Single cells", value: formatMetric(findMetric("out_2024_blood_single_cell_apc", "single cells profiled")) },
      { label: "Companion samples", value: formatMetric(findMetric("out_2024_blood_immune_profiling", "samples")) }
    ],
    links: [
      publicationById.get("out_2024_blood_single_cell_apc"),
      publicationById.get("out_2024_blood_immune_profiling")
    ].filter(Boolean)
  }
];

const experience = [
  {
    title: "Bioinformatician",
    organization: "Icahn School of Medicine at Mount Sinai",
    scope: "Multiple Myeloma Computational Research",
    dates: "December 2023 to Present",
    bullets: [
      "Integrated bulk RNA-seq, single-cell RNA-seq, and clinical data using SNF, cNMF, MOVICS, MOFA, and integrAO to stratify newly diagnosed multiple-myeloma patients.",
      "Built patient-similarity networks that refined disease classification beyond traditional staging systems and surfaced immune-based subtypes with distinct outcomes.",
      "Performed single-cell analysis in Scanpy and pySCENIC to identify depleted antigen-presenting-cell and IFN-stimulated CD4 T-cell populations in high-risk disease."
    ]
  },
  {
    title: "Research Assistant",
    organization: "Icahn School of Medicine at Mount Sinai",
    scope: "Cancer Epigenetics Laboratory",
    dates: "August 2018 to November 2021",
    bullets: [
      "Advanced from volunteer trainee into an owned SETD8 inhibitor project while continuing SOX11 and E2F1/selinexor programs in multiple myeloma and mantle cell lymphoma.",
      "Screened collaborator-derived compounds in cell lines, measured efficacy and toxicity with flow cytometry and cell-culture assays, and validated response with qPCR, Western blotting, cell-separation assays, and CRISPR knockout studies.",
      "Ran xenograft studies in immunocompromised mice against saline placebo and partnered with pathologists on IHC/imaging review of harvested tumors; related E2F1/selinexor work produced an ASH abstract and SETD8 work matured into a 2026 JMC publication."
    ]
  },
  {
    title: "Research Trainee and Early Internships",
    organization: "Mount Sinai and Northwell Health",
    scope: "Cancer biology foundations",
    dates: "2015 to 2018",
    bullets: [
      "Built early cancer-biology foundations through internships in chronic lymphocytic leukemia, chemo-resistant bladder cancer, and SOX11-focused mantle-cell lymphoma.",
      "Learned project-building from senior scientists and a postdoctoral mentor through compound screening, cell culture, flow cytometry, PCR/qPCR, Western blotting, lentiviral transduction, mouse-model workflows, ChIP-seq exposure, and scientific writing.",
      "Shadowed clinical decision-making in hematologic malignancy to connect bench assays with how clinicians diagnose, monitor, and interpret disease."
    ]
  }
];

const education = [
  {
    title: "CUNY School of Medicine",
    credential: "MD Candidate",
    dates: "August 2021 to January 2023",
    note: "Medical training period documented in the CV."
  },
  {
    title: "Sophie Davis / The City College of New York",
    credential: "BS Biomedical Sciences, Cum Laude",
    dates: "August 2017 to May 2021",
    note: "Public site uses the verified Cum Laude honor."
  },
  {
    title: "Flatiron School",
    credential: "Data Science Bootcamp",
    dates: "February 2023 to June 2023",
    note: "Focused data-science training in Python, machine learning, and applied project work."
  }
];

const resumeSkills = [
  {
    title: "Programming and modeling",
    items: ["Python", "R", "SQL", "scikit-learn", "PyTorch", "TensorFlow", "Keras"]
  },
  {
    title: "Bioinformatics and genomics",
    items: ["Scanpy", "Seurat", "pySCENIC", "DESeq2", "GSEA", "single-cell RNA-seq", "bulk RNA-seq"]
  },
  {
    title: "ML and statistics",
    items: ["survival analysis", "clustering", "dimensionality reduction", "XGBoost", "feature engineering", "statistical modeling"]
  },
  {
    title: "Infrastructure and workflow",
    items: ["Git/GitHub", "shell scripting", "HPC", "Docker", "workflow management", "reproducible research"]
  }
];

const contactCards = [
  {
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    note: "Best for recruiter or collaboration outreach."
  },
  {
    label: "Phone",
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/[^0-9+]/g, "")}`,
    note: "Publicly approved for this portfolio."
  },
  {
    label: "Location",
    value: CONTACT.location,
    href: "",
    note: "Based in New York and already working with multi-institutional biomedical teams."
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/alison-s-park",
    href: CONTACT.linkedin,
    note: "Best external profile for direct recruiter messaging."
  },
  {
    label: "GitHub",
    value: "github.com/alisonpark3",
    href: CONTACT.github,
    note: "Public repositories spanning healthcare modeling and medical-imaging projects."
  },
  {
    label: "Google Scholar",
    value: "Scholar profile",
    href: CONTACT.scholar,
    note: "Citation record and publication index."
  }
];

export const siteMeta = {
  title: "Alison Seongjee Park",
  shortTitle: "Alison Park",
  headline: "Machine Learning Scientist | Computational Oncology | Multi-Omics & Genomic AI Workflows",
  lead: "Machine learning, generative AI, and cancer-data analysis",
  subhead: "Machine-learning scientist working across computational oncology, multi-omics, single-cell genomics, GPU-accelerated genomic pipelines, and LLM-assisted analysis.",
  heroSummary:
    "Alison Seongjee Park works at the intersection of cancer genomics, machine learning, and LLM-assisted biomedical workflows. Her path runs from wet-lab cancer biology and medical training into multi-omics, accelerated single-cell analysis, and genomic analysis, where she connects genomic signal, immune context, and clinically meaningful cancer biology across myeloma and broader pan-cancer questions. Current work extends into GPU-accelerated genomic pipelines, consensus-calling and re-validation systems for reducing LLM hallucinations, and LLM-enabled codebases for analyzing multiple data modalities.",
  roleTargetLine:
    "Open to research and industry roles where machine learning, accelerated computing, and LLM-enabled genomic workflows can shape precision medicine, drug discovery, or clinically grounded biomedical software.",
  location: CONTACT.location,
  currentRole: "Bioinformatician at Icahn School of Medicine at Mount Sinai",
  headshot: "/images/alison-park-chatgpt.png",
  email: CONTACT.email,
  phone: CONTACT.phone,
  downloads: DOWNLOADS,
  generatedOn: trackerData.summary.generated_on,
  links: {
    linkedin: digitalProfiles.get("LinkedIn")?.url || CONTACT.linkedin,
    github: digitalProfiles.get("GitHub")?.url || CONTACT.github,
    scholar: digitalProfiles.get("Google Scholar")?.url || CONTACT.scholar
  },
  publicMetrics: {
    githubRepos: profileMetricLookup.get("GitHub:public_repos")?.metric_value || "",
    scholarCitations: profileMetricLookup.get("Google Scholar:citations")?.metric_value || "",
    linkedinConnections: profileMetricLookup.get("LinkedIn:connections")?.metric_value || ""
  }
};

export const stats = {
  outputsTotal: trackerData.summary.high_level_counts.outputs_total,
  timelineEvents: trackerData.summary.high_level_counts.timeline_events,
  projectsTotal: trackerData.summary.high_level_counts.projects
};

export const homepageData = {
  proofStrip,
  rolePanels,
  focusMap,
  researchStories,
  methods,
  selectedPublications: [
    publicationById.get("out_2026_jmc_setd8_inhibitor"),
    publicationById.get("out_2025_clml_multiomic_snf"),
    publicationById.get("out_2025_blood_shared_immune_features"),
    publicationById.get("out_2024_blood_single_cell_apc")
  ].filter(Boolean),
  projects,
  journeyMilestones,
  awards,
  contactCards
};

export const resumePageData = {
  summary:
    "Bioinformatician and machine-learning engineer with a research profile centered on multi-omics integration, single-cell genomics, and translational oncology. The strongest recent work focuses on multiple myeloma, where computational analysis is used to uncover clinically meaningful subtypes and immune patterns.",
  experience,
  education,
  skills: resumeSkills,
  publicationsSnapshot: publications.slice(0, 5),
  downloads: DOWNLOADS
};

export { publications, projects, timeline };
