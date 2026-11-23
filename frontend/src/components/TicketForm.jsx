import { useEffect, useRef, useState } from "react";
import { classifyDescription, createTicket } from "../api";
import { CATEGORIES, PRIORITIES, labelFor } from "../constants";
import useDebouncedValue from "../hooks/useDebouncedValue";

const EMPTY_FORM = { title: "", description: "", category: "", priority: "" };
const TITLE_MAX_LENGTH = 200;
// Don't ask the LLM about very short text; there isn't enough to classify.
const MIN_CLASSIFY_LENGTH = 15;
const CLASSIFY_DELAY_MS = 800;

export default function TicketForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [suggestion, setSuggestion] = useState(null);
  const [classifyStatus, setClassifyStatus] = useState("idle"); // idle | loading | done | error
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Fields the user picked by hand; later suggestions must not overwrite them.
  const overriddenRef = useRef({ category: false, priority: false });

  const debouncedDescription = useDebouncedValue(form.description.trim(), CLASSIFY_DELAY_MS);

  useEffect(() => {
    if (debouncedDescription.length < MIN_CLASSIFY_LENGTH) {
      setClassifyStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    setClassifyStatus("loading");

    classifyDescription(debouncedDescription, controller.signal)
      .then((result) => {
        const next = {
          category: result.suggested_category,
          priority: result.suggested_priority,
        };
        setSuggestion(next);
        setForm((prev) => ({
          ...prev,
          category: overriddenRef.current.category ? prev.category : next.category,
          priority: overriddenRef.current.priority ? prev.priority : next.priority,
        }));
        setClassifyStatus("done");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setClassifyStatus("error");
        }
      });

    // A newer description cancels the in-flight request so stale
    // suggestions never overwrite fresher ones.
    return () => controller.abort();
  }, [debouncedDescription]);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "category" || name === "priority") {
      overriddenRef.current[name] = true;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError("");

    try {
      const ticket = await createTicket({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setForm(EMPTY_FORM);
      setSuggestion(null);
      overriddenRef.current = { category: false, priority: false };
      setSuccessMessage(`Ticket #${ticket.id} created.`);
      onCreated();
    } catch (error) {
      if (error.status === 400 && error.data) {
        setFieldErrors(error.data);
      } else {
        setFormError("Could not create the ticket. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={TITLE_MAX_LENGTH}
          required
          placeholder="Short summary of the problem"
        />
        <span className="hint">
          {form.title.length}/{TITLE_MAX_LENGTH}
        </span>
        <FieldError messages={fieldErrors.title} />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Describe the issue in detail. Category and priority will be suggested automatically."
        />
        <FieldError messages={fieldErrors.description} />
      </label>

      <AiPanel status={classifyStatus} suggestion={suggestion} />

      <div className="form-row">
        <label>
          <span className="label-row">
            Category
            <SuggestedBadge show={suggestion && form.category === suggestion.category} />
          </span>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.category} />
        </label>

        <label>
          <span className="label-row">
            Priority
            <SuggestedBadge show={suggestion && form.priority === suggestion.priority} />
          </span>
          <select name="priority" value={form.priority} onChange={handleChange} required>
            <option value="">Select a priority</option>
            {PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.priority} />
        </label>
      </div>

      {formError && <p className="error">{formError}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}

function AiPanel({ status, suggestion }) {
  return (
    <div className={`ai-panel ${status}`} aria-live="polite">
      <span className="ai-icon" aria-hidden="true">
        ✦
      </span>
      <div className="ai-body">
        <span className="ai-title">AI triage</span>
        {status === "idle" && (
          <p>Describe the issue and AI will suggest a category and priority.</p>
        )}
        {status === "loading" && (
          <p>
            Reading your description
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
        {status === "done" && suggestion && (
          <>
            <p>Suggested and applied below. You can change them before submitting.</p>
            <div className="ai-chips">
              <span className={`badge category-${suggestion.category}`}>
                {labelFor(CATEGORIES, suggestion.category)}
              </span>
              <span className={`badge priority-${suggestion.priority}`}>
                {labelFor(PRIORITIES, suggestion.priority)}
              </span>
            </div>
          </>
        )}
        {status === "error" && (
          <p>AI suggestions are unavailable right now. Please choose a category and priority.</p>
        )}
      </div>
    </div>
  );
}

function SuggestedBadge({ show }) {
  return show ? <span className="badge suggested">AI</span> : null;
}

function FieldError({ messages }) {
  if (!messages) return null;
  return <span className="error">{[].concat(messages).join(" ")}</span>;
}
