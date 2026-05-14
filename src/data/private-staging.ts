export const privateStagingMeta = {
  badge: "Private local staging",
  note: "Built from internal IMS 2026 and MMRADAR materials. Review locally before anything is made public."
};

export const imsCurrentResearchPage = {
  hero: {
    kicker: "Current research",
    title: "Daratumumab-aware MRD reanalysis in multiple myeloma",
    summary:
      "A daratumumab-aware reanalysis of longitudinal single-cell bone marrow data identifying relapse-associated biology that persists after confound adjustment and external validation."
  },
  statusPills: ["14 completed analyses", "23 patients x 2 timepoints", "185-patient validation cohort", "Private local preview"],
  proofStrip: [
    {
      label: "Signal retained after confound adjustment",
      value: "3,379",
      note: "Dara-robust genes that remained significant after adjustment, out of 19,726 nominal hits."
    },
    {
      label: "Signal that collapsed under adjustment",
      value: "16,347",
      note: "Nominal findings that appear to be therapy-driven rather than relapse-associated."
    },
    {
      label: "Strongest internal transcriptional signal",
      value: "1,632",
      note: "Robust DEGs in the CD4_Th_LEF1 TP1 state, with top genes surviving leave-one-out sensitivity checks."
    },
    {
      label: "Dara-clean signaling increase",
      value: "+37%",
      note: "Converted TP2 interaction count increase after rerunning CellChat on the Dara-clean network."
    },
    {
      label: "Most conservative survival signal",
      value: "HR 1.34-1.38",
      note: "Erythroid progenitor hazard signal that survives the conservative external Cox validation framing."
    }
  ],
  narrativeBlocks: [
    {
      title: "Clinical premise and confound",
      body:
        "Classical MRD-conversion explanations leaned heavily on NK depletion and CD8 exhaustion, but the dominant treatment arm was daratumumab. The project starts by treating that imbalance as a design problem rather than a post-hoc caveat."
    },
    {
      title: "Dara-aware analytical strategy",
      body:
        "Instead of rerunning one model, the whole stack was rebuilt in a Dara-aware framework: covariate-aware pseudobulk DE, communication reruns, pathway analysis, composition checks, healthy-baseline gradients, CAR-T replication, and external survival validation."
    },
    {
      title: "Dara-independent findings",
      body:
        "What survives adjustment is more defensible biology: myeloid expansion, erythroid hazard, mature B-cell protection, and early CD4 T-helper rewiring, with external outcome support and a clearer path toward future biomarker or intervention studies."
    }
  ],
  programGroups: [
    {
      title: "Cohort and confound reconstruction",
      count: "Foundation layer",
      body:
        "Locked patient-level Dara exposure from regimens and sample timing, including manual clinical overrides where maintenance labels no longer reflected active exposure.",
      methods: ["patient-timepoint exposure mapping", "clinical metadata joins", "manual override logic"]
    },
    {
      title: "Expression and composition reruns",
      count: "Analyses #06, #10, #11, #13",
      body:
        "Reran pseudobulk DESeq2, composition methods, pathway enrichment, and healthy-baseline gradient analysis to see which signals survive adjustment rather than simply look significant before it.",
      methods: ["DESeq2 with Group + Dara", "propeller / scCODA / DCATS", "fgsea + msigdbr", "UCell gradients"]
    },
    {
      title: "Communication and ligand programs",
      count: "Analyses #02, #03, #04",
      body:
        "Rebuilt communication and ligand-inference layers on Dara-clean or restricted sender-receiver spaces so interaction programs could be separated from CD38-targeted treatment effects.",
      methods: ["CellChat", "CellPhoneDB", "NicheNet planning", "pathway-flow ranking"]
    },
    {
      title: "Trajectory, clonality, and state modeling",
      count: "Analyses #01, #05, #08, #09",
      body:
        "Added orthogonal state readouts through repertoire, module scoring, trajectory, and differentiation analyses, turning the project into a broader translational program rather than a single differential-expression rerun.",
      methods: ["scRepertoire", "UCell", "Monocle3 + Slingshot", "CytoTRACE2"]
    },
    {
      title: "Replication and validation",
      count: "Analyses #12, #14, #15",
      body:
        "Tested whether the surviving signal holds up in a Dara-free CAR-T arm, in an external MMRF survival cohort, and under within-group Dara-stratified QC views.",
      methods: ["CAR-T replication", "MMRF Cox PFS", "strict vs lenient filtering", "within-group stratification"]
    },
    {
      title: "Robustness and audit trail",
      count: "Program-level quality control",
      body:
        "Used leave-one-out sensitivity, multiple survival-correction variants, cross-analysis convergence, and a numerical audit trail to keep the final claim set defensible.",
      methods: ["leave-one-out checks", "4 Cox correction variants", "cross-analysis convergence", "audit-trailed metrics"]
    }
  ],
  figureGallery: [
    {
      src: "/images/private-staging/ims_2026/Fig1_forest_cox_dara_robust.png",
      alt: "Forest plot showing external survival validation in the Dara-robust MMRF analysis.",
      title: "External validation in MMRF",
      caption: "Forest view of the external Cox validation layer, where erythroid hazard and mature B-cell protection become the cleanest survival-linked findings."
    },
    {
      src: "/images/private-staging/ims_2026/Fig2_volcano_CD4_Th_LEF1_TP1.png",
      alt: "Volcano plot for the CD4 T-helper LEF1 signal at TP1.",
      title: "CD4 T-helper rewiring",
      caption: "The largest internal Dara-robust transcriptional signal, with 1,632 DEGs and leave-one-out stability in the key cross-classified patients."
    },
    {
      src: "/images/private-staging/ims_2026/Fig6_module_scores_3way_gradient.png",
      alt: "Three-way module-score gradient from healthy baseline to sustained to converted disease.",
      title: "Healthy-baseline gradient",
      caption: "Normal-to-sustained-to-converted gradients add a Dara-independent line of evidence for immune-state shifts."
    },
    {
      src: "/images/private-staging/ims_2026/Fig4_rankNet_TP2_dara_clean.png",
      alt: "CellChat rankNet pathway flow in the Dara-clean TP2 network.",
      title: "Dara-clean signaling landscape",
      caption: "Cell-cell signaling stays biologically rich even after removing Dara-affected cell types, with TGFb remaining rank 1."
    }
  ],
  impactPoints: [
    "Shows that 83% of nominal differential-expression signal was treatment-driven rather than relapse-associated.",
    "Reframes the field-level story from NK/CD8 headline effects toward myeloid, erythroid, B-cell, and CD4 T-helper biology.",
    "Provides a stronger template for future MM studies that include Dara-treated cohorts.",
    "Creates a candidate biomarker and mechanism panel with external validation rather than a single descriptive signature."
  ]
};

export const mmradarPipelinePage = {
  hero: {
    kicker: "Clinical genomics pipeline",
    title: "Integrated WES + RNA interpretation for patient-level myeloma profiling",
    summary:
      "A translational genomics platform that combines tumor-normal whole-exome sequencing and tumor RNA-seq into subgroup prediction, disease-hallmark interpretation, evidence lookup, and patient-level precision-medicine reporting."
  },
  statusPills: ["Tumor-normal WES + tumor RNA", "Patient-level HTML reports", "137/137 tasks PASS", "Private local preview"],
  proofStrip: [
    {
      label: "Input scope",
      value: "WES + RNA",
      note: "Tumor-normal exome data and tumor RNA-seq are processed together rather than as disconnected analysis branches."
    },
    {
      label: "Interpretive layers",
      value: "DNA + RNA + PSN + hallmarks",
      note: "Somatic, CNV, fusion, expression, subgroup, and hallmark evidence are synthesized into one interpretive framework."
    },
    {
      label: "Documented validation run",
      value: "137/137",
      note: "Tasks passed in the documented BG_Batch_27 validation run."
    },
    {
      label: "Workflow breadth",
      value: "~80 processes",
      note: "The system spans primary processing, multimodal interpretation, reporting, and report-mode variants."
    },
    {
      label: "Operational scale",
      value: "~1,000 reports",
      note: "User-confirmed operational scale for precision-medicine report generation; keep private until you want this public."
    }
  ],
  architectureLayers: [
    {
      title: "Inputs",
      items: ["Tumor WES FASTQs", "Matched-normal WES FASTQs", "Tumor RNA-seq FASTQs"]
    },
    {
      title: "Molecular evidence extraction",
      items: ["alignment and QC", "somatic calling", "CNV and structural variants", "fusion detection", "expression quantification"]
    },
    {
      title: "Multimodal interpretation",
      items: ["PSN subgroup prediction", "myeloma hallmarks", "risk and pathway scoring", "clonal evolution context", "therapeutic evidence lookup"]
    },
    {
      title: "Patient-level outputs",
      items: ["full HTML report", "WES-only report", "RNA-only report", "patient-specific drug-evidence tables", "integrated disease characterization"]
    }
  ],
  engineeringPanels: [
    {
      title: "Evidence extraction across DNA and RNA",
      body:
        "The platform does not stop at variant calling or expression quantification. DNA and RNA evidence are carried forward into subgrouping, hallmarks, clonality context, and therapeutic evidence tables for each patient.",
      methods: ["Mutect2", "Manta / Strelka", "FACETS", "PhyloWGS", "STAR", "Arriba", "risk scoring", "prediction engine"]
    },
    {
      title: "Reproducible multimodal integration",
      body:
        "The workflow is orchestrated as one reproducible system rather than separate scripts. WES, RNA, interpretation, and reporting remain linked across runs, with documented traces, resumable execution, and environment-aware profiles.",
      methods: ["Nextflow DSL2", "LSF + large-node execution", "resume logic", "trace/timeline artifacts", "local Elasticsearch services"]
    },
    {
      title: "Report-ready translational outputs",
      body:
        "The end product is not just processed sequencing data. It is a patient-ready interpretive report that physicians can use to review genomic events, transcriptomic context, subgroup predictions, and candidate therapeutic evidence together.",
      methods: ["patient-specific reports", "VICC / CIViC integration", "operator documentation", "PHI-aware deployment"]
    }
  ],
  figureGallery: [
    {
      src: "/images/private-staging/mmradar/architecture.png",
      alt: "Overall architecture diagram for the MMRADAR pipeline.",
      title: "System overview",
      caption: "A high-level view of how WES, RNA, interpretation, and report generation are joined in one translational analysis system."
    },
    {
      src: "/images/private-staging/mmradar/wes_dag.png",
      alt: "Directed acyclic graph for the WES branch of MMRADAR.",
      title: "WES methods map",
      caption: "The exome branch covers somatic calling, CNV analysis, clonality, annotation, and the evidence layers that feed the final report."
    },
    {
      src: "/images/private-staging/mmradar/rna_dag.png",
      alt: "Directed acyclic graph for the RNA branch of MMRADAR.",
      title: "RNA methods map",
      caption: "The RNA branch adds fusion detection, expression-based scoring, and transcriptomic context to the multimodal interpretation layer."
    }
  ],
  appendixFigures: [
    {
      src: "/images/private-staging/mmradar/run_folder.png",
      alt: "Run-folder structure and operational layout for the pipeline.",
      title: "Reproducibility and operations",
      caption: "Per-run isolation, resumable execution, and artifact organization are part of the workflow design and support repeatable clinical operation."
    }
  ],
  capabilities: [
    {
      title: "Evidence extraction and annotation",
      items: ["somatic variant calling", "CNV and structural-variant interpretation", "fusion detection", "expression quantification", "knowledgebase annotation"]
    },
    {
      title: "Integrated patient-level interpretation",
      items: ["PSN subgroup prediction", "myeloma hallmark scoring", "risk-model support", "drug-evidence tables", "patient HTML reports"]
    },
    {
      title: "Reproducible workflow execution",
      items: ["Nextflow DSL2", "HPC execution", "resume / caching strategy", "launcher-owned reporting", "PHI-aware deployment discipline"]
    }
  ]
};
