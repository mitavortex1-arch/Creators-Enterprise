
/*
  VENOM CREATOR ENTERPRISE
  VCEE EXECUTION ENGINE
  Version 1.0
  Demonstration build
*/

export const VCEE_ENGINE = {
  identity: {
    id: "VCEE-ENGINE-001",
    name: "VENOM Creator Enterprise Execution Engine",
    version: "1.0.0",
    status: "ONLINE",
    purpose: "Coordinate and manage the six VCEE production factories."
  },

  architecture: {
    intake: "JOB_INTAKE",
    validation: "JOB_VALIDATION",
    orchestration: "ZEUS",
    intelligence: "ELEANOR",
    quality: "OMEGA",
    simulation: "KRONOS",
    operations: "TITAN",
    approval: "HUMAN_APPROVAL",
    delivery: "PDE"
  },

  factories: [
    { id: "VCI", name: "Creator Intelligence", function: "Research and strategy" },
    { id: "DVF", name: "Design Visualization Factory", function: "Visual design and branding" },
    { id: "MPF", name: "Media Production Factory", function: "Media creation and production" },
    { id: "ICF", name: "Interactive Creation Factory", function: "Interactive digital experiences" },
    { id: "IAR", name: "IP Asset Refinery", function: "Intellectual property development" },
    { id: "PDE", name: "Publishing and Distribution Enterprise", function: "Publishing and delivery" }
  ],

  workflow: [
    "RECEIVED",
    "VALIDATED",
    "FACTORY_ASSIGNED",
    "IN_PRODUCTION",
    "QUALITY_REVIEW",
    "HUMAN_APPROVAL",
    "READY_FOR_DELIVERY",
    "DELIVERED"
  ],

  agents: {
    ELEANOR: {
      role: "Intelligence",
      responsibility: "Analyze creator requests and identify requirements."
    },
    ZEUS: {
      role: "Orchestration",
      responsibility: "Coordinate workflow and factory assignment."
    },
    OMEGA: {
      role: "Quality control",
      responsibility: "Identify quality issues and flag risks."
    },
    KRONOS: {
      role: "Simulation",
      responsibility: "Evaluate projected timelines and workflow scenarios."
    },
    TITAN: {
      role: "Operations",
      responsibility: "Monitor execution and operational status."
    }
  }
};

const validFactories = VCEE_ENGINE.factories.map(factory => factory.id);

const jobs = new Map();

function createId() {
  return "VCEE-" + Date.now().toString(36).toUpperCase() +
    "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function createTimestamp() {
  return new Date().toISOString();
}

export function validateJob(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Job data is required."] };
  }

  if (!input.title || !String(input.title).trim()) {
    errors.push("A job title is required.");
  }

  if (!validFactories.includes(String(input.factory || "").toUpperCase())) {
    errors.push("A valid factory ID is required.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function submitJob(input) {
  const validation = validateJob(input);

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  const factory = String(input.factory).toUpperCase();

  const job = {
    id: createId(),
    title: String(input.title).trim(),
    creator: String(input.creator || "Unassigned creator").trim(),
    factory,
    status: "RECEIVED",
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    history: [
      {
        status: "RECEIVED",
        timestamp: createTimestamp(),
        actor: "VCEE_ENGINE"
      }
    ]
  };

  jobs.set(job.id, job);

  return {
    success: true,
    job: structuredClone(job)
  };
}

export function getJob(jobId) {
  const job = jobs.get(jobId);
  return job ? structuredClone(job) : null;
}

export function listJobs() {
  return Array.from(jobs.values()).map(job => structuredClone(job));
}

export function advanceJob(jobId, actor = "VCEE_ENGINE") {
  const job = jobs.get(jobId);

  if (!job) {
    return { success: false, error: "Job not found." };
  }

  const stages = VCEE_ENGINE.workflow;
  const currentIndex = stages.indexOf(job.status);

  if (currentIndex === -1 || currentIndex >= stages.length - 1) {
    return { success: false, error: "Job cannot advance further." };
  }

  const nextStatus = stages[currentIndex + 1];

  if (nextStatus === "HUMAN_APPROVAL") {
    return {
      success: false,
      requiresHumanApproval: true,
      message: "Human approval is required before this job can proceed."
    };
  }

  job.status = nextStatus;
  job.updatedAt = createTimestamp();

  job.history.push({
    status: nextStatus,
    timestamp: job.updatedAt,
    actor
  });

  return {
    success: true,
    job: structuredClone(job)
  };
}

export function approveJob(jobId, approvedBy) {
  const job = jobs.get(jobId);

  if (!job) {
    return { success: false, error: "Job not found." };
  }

  if (job.status !== "HUMAN_APPROVAL") {
    return {
      success: false,
      error: "Job is not awaiting human approval."
    };
  }

  if (!approvedBy || !String(approvedBy).trim()) {
    return {
      success: false,
      error: "An approving person's name is required."
    };
  }

  job.status = "READY_FOR_DELIVERY";
  job.updatedAt = createTimestamp();

  job.history.push({
    status: job.status,
    timestamp: job.updatedAt,
    actor: String(approvedBy).trim()
  });

  return {
    success: true,
    job: structuredClone(job)
  };
}

export function getEngineStatus() {
  const allJobs = listJobs();

  return {
    engine: VCEE_ENGINE.identity.name,
    status: "ONLINE",
    factoryCount: VCEE_ENGINE.factories.length,
    agentRoles: Object.keys(VCEE_ENGINE.agents).length,
    totalJobs: allJobs.length,
    activeJobs: allJobs.filter(job => job.status !== "DELIVERED").length,
    deliveredJobs: allJobs.filter(job => job.status === "DELIVERED").length,
    awaitingApproval: allJobs.filter(job => job.status === "HUMAN_APPROVAL").length
  };
}

export function runEngineDemo() {
  const submission = submitJob({
    title: "Demo Creator Campaign",
    creator: "VENOM Demo Creator",
    factory: "VCI"
  });

  if (!submission.success) return submission;

  return {
    success: true,
    message: "VCEE execution engine demo job created.",
    job: submission.job,
    engineStatus: getEngineStatus()
  };
}

export default VCEE_ENGINE;
