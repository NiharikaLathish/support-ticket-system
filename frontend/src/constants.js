// Must match the choices on the Django Ticket model.
export const CATEGORIES = [
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
  { value: "account", label: "Account" },
  { value: "general", label: "General" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

// Chart colors, based on the Clootrack palette (warm oranges plus a blue accent).
export const CATEGORY_COLORS = {
  billing: "#d1571f",
  technical: "#2ea3f2",
  account: "#7f56d9",
  general: "#b7a89c",
};

export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}
