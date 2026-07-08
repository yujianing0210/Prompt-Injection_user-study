type LikertScaleProps = {
  name: string;
  legend: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function LikertScale({
  name,
  legend,
  lowLabel,
  highLabel,
  value,
  onChange,
  min = 1,
  max = 7,
}: LikertScaleProps) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <fieldset className="question likert-scale">
      <legend>{legend}</legend>
      <div className="likert-scale__track">
        <span className="likert-scale__endpoint">{lowLabel}</span>
        <div className="likert-scale__points">
          {points.map((point) => (
            <label key={point} className="likert-scale__point">
              <input
                type="radio"
                name={name}
                value={point}
                checked={value === point}
                onChange={() => onChange(point)}
              />
              <span>{point}</span>
            </label>
          ))}
        </div>
        <span className="likert-scale__endpoint likert-scale__endpoint--high">
          {highLabel}
        </span>
      </div>
    </fieldset>
  );
}
