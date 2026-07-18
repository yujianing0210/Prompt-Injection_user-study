type AuthorshipValue = "human" | "ai" | "uncertain";

type AuthorshipChoiceProps = {
  name: string;
  legend: string;
  value: AuthorshipValue | null;
  onChange: (value: AuthorshipValue) => void;
  options?: ReadonlyArray<{ value: AuthorshipValue; label: string }>;
  disabled?: boolean;
};

const OPTIONS: { value: AuthorshipValue; label: string }[] = [
  { value: "human", label: "人类" },
  { value: "ai", label: "AI" },
  { value: "uncertain", label: "不确定" },
];

export function AuthorshipChoice({
  name,
  legend,
  value,
  onChange,
  options = OPTIONS,
  disabled = false,
}: AuthorshipChoiceProps) {
  return (
    <fieldset className="question binary-question">
      <legend>{legend}</legend>
      <div className="binary-question__options">
        {options.map((option) => (
          <label key={option.value} className="binary-question__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
