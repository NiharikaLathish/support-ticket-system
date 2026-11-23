import { CATEGORIES, PRIORITIES, STATUSES } from "../constants";

export default function TicketFilters({ filters, onChange }) {
  function handleChange(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  return (
    <div className="filters">
      <input
        type="search"
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search title and description"
        aria-label="Search tickets"
      />
      <FilterSelect name="category" label="All categories" options={CATEGORIES} filters={filters} onChange={handleChange} />
      <FilterSelect name="priority" label="All priorities" options={PRIORITIES} filters={filters} onChange={handleChange} />
      <FilterSelect name="status" label="All statuses" options={STATUSES} filters={filters} onChange={handleChange} />
    </div>
  );
}

function FilterSelect({ name, label, options, filters, onChange }) {
  return (
    <select name={name} value={filters[name]} onChange={onChange} aria-label={label}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
