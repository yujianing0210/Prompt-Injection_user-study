type Option = {
  value: string;
  label: string;
};

type BinaryQuestionProps = {
  name: string;
  legend: string;
  options: [Option, Option];
  value: string | null;
  onChange: (value: string) => void;
};

export function BinaryQuestion({
  name,
  legend,
  options,
  value,
  onChange,
}: BinaryQuestionProps) {
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
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
