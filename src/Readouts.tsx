import { useRef, useState } from 'react';
import { BOAT_OPTIONS, COLORS, KEYS, LABEL, UNIT, VALUE_STEP, fmt, getRanges } from './model';
import type { FieldProps, ReadoutsProps } from './interfaces';
import { BoatPicker, Card, Panel } from './styled';

const Field = ({ k, value, derived, boatType, onChange }: FieldProps) => {
	const [draft, setDraft] = useState<string | null>(null);
	const [draftHours, setDraftHours] = useState('');
	const [draftMinutes, setDraftMinutes] = useState('');

	const inputRef = useRef<HTMLInputElement>(null);

	const range = getRanges(boatType)[k];

	const handleEditKey = (e: React.KeyboardEvent<HTMLInputElement>, part?: 'hours' | 'minutes') => {
		if (draft === null) return;
		const increment = ['+', '=', 'ArrowUp'].includes(e.key) ? 1 : ['-', '_', 'ArrowDown'].includes(e.key) ? -1 : 0;
		if (!increment) return;
		e.preventDefault();
		if (k === 'time') {
			const hours = Number(draftHours) || 0;
			const minutes = Number(draftMinutes) || 0;
			const unit = part === 'hours' ? 60 : 1;
			const total = hours * 60 + minutes + increment * unit;
			const boundedTotal = Math.min(range[1], Math.max(range[0], total));
			const roundedTotal = Math.round(boundedTotal);
			setDraftHours(String(Math.floor(roundedTotal / 60)));
			setDraftMinutes(String(roundedTotal % 60));
			return;
		}
		const current = Number((draft || '0').replace(',', '.')) || 0;
		const next = Math.min(range[1], Math.max(range[0], current + increment * VALUE_STEP));
		setDraft(next.toFixed(2));
	};

	const beginEditing = () => {
		if (k === 'time') {
			const totalMinutes = Math.round(value);
			setDraftHours(String(Math.floor(totalMinutes / 60)));
			setDraftMinutes(String(totalMinutes % 60));
			setDraft('time');
		} else setDraft(fmt(value));
		requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});
	};

	const commit = () => {
		if (draft === 'time' && /^\d+$/.test(draftHours) && /^\d+$/.test(draftMinutes)) {
			const parsed = Number(draftHours) * 60 + Number(draftMinutes);
			if (Number.isFinite(parsed)) onChange(k, Math.max(range[0], parsed));
		} else if (draft !== null && draft !== 'time' && /^\d+(?:[.,]\d*)?$/.test(draft)) {
			const parsed = Number(draft.replace(',', '.'));
			if (Number.isFinite(parsed)) onChange(k, Math.max(range[0], parsed));
		}
		setDraft(null);
	};

	const totalMinutes = Math.round(value);
	const timeHours = Math.floor(totalMinutes / 60);
	const timeMinutes = totalMinutes % 60;

	return (
		<Card $derived={derived} $accent={COLORS[k]}>
			<small>
				{LABEL[k]}
				{derived ? ' · calculated' : ''}
			</small>
			<div
				className="big"
				onBlur={(e) => {
					if (e.target instanceof HTMLInputElement && !e.currentTarget.contains(e.relatedTarget as Node)) commit();
				}}
			>
				{draft === null ? (
					<>
						<button type="button" aria-label={`Edit ${LABEL[k]}`} onClick={beginEditing}>
							{k === 'time' ? (
								<>
									{timeHours}h {timeMinutes}m
								</>
							) : (
								fmt(value)
							)}
						</button>
						{k !== 'time' && <span>{UNIT[k]}</span>}
					</>
				) : k === 'time' ? (
					<>
						<input
							className="time-part"
							ref={inputRef}
							type="text"
							inputMode="numeric"
							aria-label="Set hours"
							value={draftHours}
							onChange={(e) => /^\d*$/.test(e.target.value) && setDraftHours(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.currentTarget.blur();
								} else handleEditKey(e, 'hours');
							}}
						/>
						<span className="time-unit">h</span>
						<input
							className="time-part"
							type="text"
							inputMode="numeric"
							aria-label="Set minutes"
							value={draftMinutes}
							onChange={(e) => /^\d*$/.test(e.target.value) && setDraftMinutes(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.currentTarget.blur();
								} else handleEditKey(e, 'minutes');
							}}
						/>
						<span className="time-unit">m</span>
					</>
				) : (
					<>
						<input
							ref={inputRef}
							type="text"
							inputMode="decimal"
							aria-label={`Set ${k}`}
							value={draft}
							onChange={(e) => /^\d*[.,]?\d*$/.test(e.target.value) && setDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									e.currentTarget.blur();
								} else handleEditKey(e);
							}}
						/>
						<span>{UNIT[k]}</span>
					</>
				)}
			</div>
			{k === 'time' && <div className="sub">{fmt(value)} min</div>}
		</Card>
	);
};

export const Readouts = ({
	values,
	derived,
	boatType,
	showValues,
	showPicker,
	compact = false,
	onBoatTypeChange,
	onChange,
}: ReadoutsProps) => (
	<Panel $pickerOnly={showPicker && !showValues} data-compact={compact ? 'true' : undefined}>
		{showValues &&
			KEYS.map((k) => <Field key={k} k={k} value={values[k]} derived={k === derived} boatType={boatType} onChange={onChange} />)}
		{showPicker && (
			<BoatPicker>
				<legend>Ruler Type</legend>
				{BOAT_OPTIONS.map(({ value, label }) => {
					return (
						<label key={value}>
							<input
								type="radio"
								name="boat-type"
								value={value}
								checked={boatType === value}
								onChange={(e) => {
									e.currentTarget.blur();
									onBoatTypeChange(value);
								}}
							/>
							{value === 'cruiser' ? 'Cruiser - max 12' : value === 'speed' ? 'Speed - max 50' : label}
						</label>
					);
				})}
			</BoatPicker>
		)}
	</Panel>
);
