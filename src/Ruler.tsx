import { useEffect, useRef, useState } from 'react';
import { COLORS, fmt, getRanges, scaleAngle, SCALE_SWEEP_ANGLE, UNIT, VALUE_STEP } from './model';
import type { DragByScale, Key, RulerProps, ScaleMode, ScaleProps, ScaleRange, Tick, TimeTickSpec } from './interfaces';
import { Svg, VisorFrame, VisorInput, VisorUnit } from './styled';

const R_OUT = 250,
	R_TIME = 180,
	R_SPEED = 100;
const DISTANCE_HIT_RADIUS = (R_OUT + R_TIME) / 2;
const DISTANCE_HIT_WIDTH = R_OUT - R_TIME + 3;
const TIME_HIT_RADIUS = (R_TIME + R_SPEED + 13) / 2;
const TIME_HIT_WIDTH = R_TIME - R_SPEED - 13;
const VISOR_HEIGHT = 20;
const VISOR_STROKE_GAP = 1.5;
const DISTANCE_VISOR_Y = -(R_OUT + 1.5 + VISOR_HEIGHT / 2 + VISOR_STROKE_GAP);
const TIME_VISOR_Y = -(R_TIME + 1.5 + VISOR_HEIGHT / 2 + VISOR_STROKE_GAP);
const SPEED_VISOR_Y = -(R_SPEED + 13 + 1 + VISOR_HEIGHT / 2 + VISOR_STROKE_GAP);
const visorWidth = (text: string) => Math.max(56, text.length * 7.2 + 10);
const formatVisorTime = (minutes: number) => {
	const totalSeconds = Math.round(minutes * 60);
	const hours = Math.floor(totalSeconds / 3600);
	const remainingSeconds = totalSeconds % 3600;
	const wholeMinutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;
	const parts = [
		...(hours > 0 ? [`${hours}h`] : []),
		...(wholeMinutes > 0 ? [`${wholeMinutes}m`] : []),
		...(minutes < 5 && seconds > 0 ? [`${seconds}s`] : []),
	];
	return parts.join(' ') || '0s';
};
const MAIN_LABEL_SIZE = 22;
const SMALL_LABEL_SIZE = 7;
const SPEED_LABEL_SIZE = 18;
const LONG_TIME_LABEL_SIZE = 14;
const COMPACT_TIME_LABEL_SIZE = 12;
const DENSE_TIME_LABEL_SIZE = 10;

const formatTick = (v: number) => Number(v.toPrecision(3)).toString();

const ticks = ([min, max]: [number, number], mainLabelSize = MAIN_LABEL_SIZE): Tick[] => {
	const values = new Set<number>([min, max]);

	for (let exponent = Math.floor(Math.log10(min)); exponent <= Math.floor(Math.log10(max)); exponent++) {
		const base = 10 ** exponent;
		for (let digit = 1; digit <= 9; digit++) {
			const value = Number((digit * base).toPrecision(8));
			if (value >= min && value <= max) values.add(value);
		}
	}

	return [...values]
		.sort((a, b) => a - b)
		.map((v) => {
			const major = v === min || v === max || [1, 2, 5].includes(Number((v / 10 ** Math.floor(Math.log10(v))).toPrecision(4)));
			return { v, len: major ? 15 : 7, label: major ? formatTick(v) : undefined, fontSize: major ? mainLabelSize : undefined };
		});
};

const oldLabels = (range: [number, number]) =>
	new Map(
		ticks(range)
			.filter((tick) => tick.label)
			.map((tick) => [tick.v, tick.label!]),
	);

const cruiserDistanceSpeedTicks = (
	range: [number, number],
	tickStep: number,
	labelStep: number,
	mainLabelSize = MAIN_LABEL_SIZE,
): Tick[] => {
	const existing = oldLabels(range);
	const precision = Math.round(1 / tickStep);
	const first = Math.ceil(range[0] * precision - 1e-8),
		last = Math.floor(range[1] * precision + 1e-8);
	const labelStart = Math.ceil((range[0] - 1e-8) / labelStep) * labelStep;
	const values = new Set<number>([range[0], range[1]]);

	for (let i = 0; i <= last - first; i++) values.add(Number(((first + i) / precision).toFixed(2)));
	return [...values]
		.sort((a, b) => a - b)
		.map((v) => {
			const onLabelStep =
				v >= labelStart - 1e-8 && Math.abs((v - labelStart) / labelStep - Math.round((v - labelStart) / labelStep)) < 1e-7;
			const currentLabel = onLabelStep ? existing.get(v) : undefined;
			const integerLabel = onLabelStep && Number.isInteger(v);
			const largeLabel = integerLabel;
			return {
				v,
				len: onLabelStep ? (largeLabel ? 15 : 7) : 5,
				label: onLabelStep ? (currentLabel ?? (integerLabel ? String(v) : v.toFixed(2))) : undefined,
				fontSize: onLabelStep ? (largeLabel ? mainLabelSize : SMALL_LABEL_SIZE) : undefined,
			};
		});
};

const demoteTick = (data: Tick[], value: number): Tick[] =>
	data.map((tick) => (tick.v === value ? { ...tick, len: 7, fontSize: SMALL_LABEL_SIZE } : tick));

const addSecondaryLabel = (data: Tick[], value: number): Tick[] => {
	return data.map((tick) =>
		tick.v === value ? { ...tick, len: 7, label: formatTick(value), fontSize: SMALL_LABEL_SIZE } : tick,
	);
};

const cruiserTimeTicks = (valueRange: ScaleRange): Tick[] => {
	const existing = oldLabels(valueRange);
	const values = new Map<number, TimeTickSpec>();
	const add = (value: number, label = false, angleValue?: number) => {
		const v = Number(value.toFixed(2));
		const current = values.get(v);
		values.set(v, { label: label || Boolean(current?.label), angleValue: angleValue ?? current?.angleValue });
	};
	const series = (start: number, end: number, step: number, labelEvery?: number) => {
		const steps = Math.round((end - start) / step);
		for (let i = 0; i <= steps; i++) {
			const value = Number((start + i * step).toFixed(2));
			add(value, labelEvery !== undefined && Math.abs(value / labelEvery - Math.round(value / labelEvery)) < 1e-8);
		}
	};

	series(0, 1, 0.1);
	series(1, 10, 0.5, 1);
	series(10, 20, 1);
	series(20, 50, 2);
	series(50, 100, 5);
	series(100, 300, 10);
	series(300, 700, 50);
	if (valueRange[1] > 720) {
		series(720, 1200, 120);
		series(1200, 3600, 300);
		series(3600, valueRange[1], 600);
	}
	// Keep the 1h landmark prominent; omit the additional compact labels.
	add(60, true);
	add(720, true);
	add(valueRange[0]);
	add(valueRange[1]);

	const result: Tick[] = [];
	for (const [v, spec] of [...values.entries()].sort(([a], [b]) => a - b)) {
		if (v < valueRange[0] - 1e-8 || v > valueRange[1] + 1e-8) continue;
		const currentLabel = existing.get(v);
		const mainHour = v === 60;
		const secondaryLabel = v === 50 || (!currentLabel && spec.label && !mainHour);
		const label = secondaryLabel ? undefined : (currentLabel ?? (spec.label ? formatTick(v) : undefined));
		const crowdedTimeLabel = (v >= 6 && v <= 9) || (v >= 11 && v <= 19);
		const denseLabel = v >= 11 && v <= 19;

		result.push({
			v,
			angleValue: spec.angleValue,
			len: mainHour ? 15 : currentLabel && !crowdedTimeLabel && !denseLabel ? 15 : spec.label || v === 50 ? 7 : 5,
			label,
			fontSize: label
				? v === 500 || v === 720
					? LONG_TIME_LABEL_SIZE
					: mainHour
						? MAIN_LABEL_SIZE
						: crowdedTimeLabel || denseLabel
							? DENSE_TIME_LABEL_SIZE
							: currentLabel || Number.isInteger(v)
								? MAIN_LABEL_SIZE
								: SMALL_LABEL_SIZE
				: undefined,
		});
	}
	return result;
};

const Scale = ({ r, color, selectionColor, selected, data, range, mode, timeLabels = false, zeroMain = false }: ScaleProps) => {
	const zeroAngle = scaleAngle(range[0], range, mode) - 6;

	return (
		<g stroke={color} fill={color} fontSize="11" textAnchor="middle">
			{data.map(({ v, len, label, fontSize, angleValue }) => {
				const hours = timeLabels && v >= 60 ? Math.floor(v / 60) : 0;
				const minutes = timeLabels && v >= 60 ? Math.round(v) % 60 : 0;
				const hasHourRemainder = hours > 0 && minutes > 0;
				const isSecondsLabel = Boolean(label && timeLabels && v > 0 && v < 1);
				const labelSize = isSecondsLabel
					? COMPACT_TIME_LABEL_SIZE
					: timeLabels && v >= 1 && v <= 20 && fontSize === MAIN_LABEL_SIZE
						? 16
						: timeLabels && v >= 60
							? minutes === 0
								? v === 60
									? MAIN_LABEL_SIZE
									: LONG_TIME_LABEL_SIZE
								: Math.min(fontSize ?? COMPACT_TIME_LABEL_SIZE, COMPACT_TIME_LABEL_SIZE)
							: (fontSize ?? MAIN_LABEL_SIZE);
				const labelText = isSecondsLabel
					? `${Math.round(v * 60)}s`
					: label && timeLabels && v >= 60
						? minutes === 0
							? `${hours}h`
							: `${String(hours)}${String(minutes).padStart(2, '0')}`
						: label;
				return (
					<g key={v} transform={`rotate(${scaleAngle(angleValue ?? v, range, mode)})`}>
						<line y1={-r} y2={-r + len} strokeWidth={labelText ? 1.5 : 0.8} />
						{labelText && (
							<text y={-r + len + (labelSize >= LONG_TIME_LABEL_SIZE ? 18 : 12)} fontSize={labelSize} stroke="none">
								{hasHourRemainder ? (
									<>
										<tspan fontSize={8} dy="-4">
											{hours}
										</tspan>
										<tspan dy="4">{String(minutes).padStart(2, '0')}</tspan>
									</>
								) : (
									labelText
								)}
							</text>
						)}
					</g>
				);
			})}
			<g transform={`rotate(${zeroAngle})`} pointerEvents="none">
				<line y1={-r} y2={-r + (zeroMain ? 15 : 5)} strokeWidth={zeroMain ? 1.5 : 0.8} />
				<text y={-r + (zeroMain ? 33 : 17)} fontSize={zeroMain ? MAIN_LABEL_SIZE : SMALL_LABEL_SIZE + 5} stroke="none">
					0
				</text>
			</g>
			<g transform={`rotate(${scaleAngle(selected, range, mode)})`} pointerEvents="none">
				<line y1={-r - 5} y2={-r + 10} stroke={selectionColor} strokeWidth="1.5" opacity="0.75" />
			</g>
		</g>
	);
};

export const Ruler = ({ values, boatType, onChange }: RulerProps) => {
	const svg = useRef<SVGSVGElement>(null);
	const visorRef = useRef<HTMLDivElement>(null);
	const [editing, setEditing] = useState<Key | null>(null);
	const [draft, setDraft] = useState('');
	const [draftHours, setDraftHours] = useState('');
	const [draftMinutes, setDraftMinutes] = useState('');
	const [animatedKeys, setAnimatedKeys] = useState<Key[]>([]);
	const [selectedScale, setSelectedScale] = useState<Key | null>(null);

	const finishingEdit = useRef(false);
	const cancelEdit = useRef(false);
	const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const drag = useRef<DragByScale>({ distance: null, speed: null, time: null });
	const ranges = getRanges(boatType);

	useEffect(() => {
		setSelectedScale(null);
	}, [boatType]);

	const scaleRanges = boatType === 'cruiser' ? { ...ranges, time: [0.05, ranges.time[1]] as [number, number] } : ranges;
	const mode = (key: Key): ScaleMode => (boatType !== 'manual' && key !== 'time' ? 'linear' : 'log');
	const timeVisorText = formatVisorTime(values.time);
	const distanceVisorText = `${fmt(values.distance)} ${UNIT.distance}`;
	const speedVisorText = `${fmt(values.speed)} ${UNIT.speed}`;

	const timeEditorValues = () => {
		const totalSeconds = Math.round(values.time) * 60;
		return {
			hours: String(Math.floor(totalSeconds / 3600)),
			minutes: String(Math.floor((totalSeconds % 3600) / 60)),
		};
	};

	const beginEditing = (key: Key) => {
		finishingEdit.current = false;
		cancelEdit.current = false;
		setSelectedScale(key);
		setEditing(key);
		if (key === 'time') {
			const parts = timeEditorValues();
			setDraftHours(parts.hours);
			setDraftMinutes(parts.minutes);
		} else {
			setDraft(fmt(values[key]));
		}
		requestAnimationFrame(() => {
			const input = visorRef.current?.querySelector<HTMLInputElement>('input');
			input?.focus();
			input?.select();
		});
	};

	const commitEditing = () => {
		if (!editing || finishingEdit.current) return;
		finishingEdit.current = true;
		const key = editing;
		let raw: number | null = null;
		if (key === 'time') {
			if (/^\d+$/.test(draftHours) && /^\d+$/.test(draftMinutes)) {
				raw = Number(draftHours) * 60 + Number(draftMinutes);
			}
		} else if (/^\d+(?:[.,]\d*)?$/.test(draft)) {
			raw = Number(draft.replace(',', '.'));
		}
		setEditing(null);
		setSelectedScale(null);
		setTimeout(() => {
			finishingEdit.current = false;
		}, 0);
		if (raw !== null && Number.isFinite(raw)) {
			const nextKeys: Key[] = key === 'time' ? ['time', 'speed'] : [key, 'time'];
			setAnimatedKeys(nextKeys);
			if (animationTimer.current) clearTimeout(animationTimer.current);
			animationTimer.current = setTimeout(() => setAnimatedKeys([]), 560);
			onChange(key, raw);
		}
	};

	const handleEditKey = (e: React.KeyboardEvent<HTMLInputElement>, part?: 'hours' | 'minutes') => {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitEditing();
			(e.currentTarget as HTMLInputElement).blur();
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			cancelEdit.current = true;
			setEditing(null);
			setSelectedScale(null);
			return;
		}

		const increment = ['+', '=', 'ArrowUp'].includes(e.key) ? 1 : ['-', '_', 'ArrowDown'].includes(e.key) ? -1 : 0;
		if (!increment || !editing) return;
		e.preventDefault();
		if (editing === 'time') {
			const isHours = part === 'hours';
			const current = Number(isHours ? draftHours : draftMinutes) || 0;
			const next = Math.max(0, current + increment * (isHours ? 1 : 1));
			if (isHours) setDraftHours(String(Math.round(next)));
			else setDraftMinutes(String(Math.round(next)));
		} else {
			const current = Number(draft.replace(',', '.')) || 0;
			setDraft(Math.max(0, current + increment * VALUE_STEP).toFixed(2));
		}
	};

	const data =
		boatType === 'cruiser'
			? {
					distance: cruiserDistanceSpeedTicks(ranges.distance, 0.05, 0.2),
					speed: demoteTick(cruiserDistanceSpeedTicks(ranges.speed, 0.1, 0.5, SPEED_LABEL_SIZE), 0.5),
					time: cruiserTimeTicks(ranges.time),
				}
			: boatType === 'speed'
				? {
						distance: addSecondaryLabel(cruiserDistanceSpeedTicks(ranges.distance, 0.2, 2), 0.2),
						speed: cruiserDistanceSpeedTicks(ranges.speed, 0.5, 5, SPEED_LABEL_SIZE),
						time: cruiserTimeTicks(ranges.time),
					}
				: {
						distance: ticks(ranges.distance),
						speed: demoteTick(ticks(ranges.speed, SPEED_LABEL_SIZE), 0.5),
						time: ticks(ranges.time),
					};

	const pointerAngle = (e: React.PointerEvent) => {
		const matrix = svg.current?.getScreenCTM();
		if (!svg.current || !matrix) return null;
		const point = svg.current.createSVGPoint();
		point.x = e.clientX;
		point.y = e.clientY;
		const { x, y } = point.matrixTransform(matrix.inverse());
		return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
	};

	const ringHandlers = (key: Key) => ({
		onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
			const angle = pointerAngle(e);
			if (angle === null) return;
			e.currentTarget.setPointerCapture(e.pointerId);
			drag.current[key] = { angle, rawValue: values[key], totalDelta: 0, moved: false };
		},

		onPointerMove: (e: React.PointerEvent<SVGGElement>) => {
			const activeDrag = drag.current[key];
			const current = pointerAngle(e);
			if (activeDrag === null || current === null) return;
			const delta = ((current - activeDrag.angle + 540) % 360) - 180;
			activeDrag.angle = current;
			activeDrag.totalDelta += delta;
			if (!activeDrag.moved && Math.abs(activeDrag.totalDelta) > 2) {
				activeDrag.moved = true;
			}
			if (mode(key) === 'linear') {
				activeDrag.rawValue -= (delta / SCALE_SWEEP_ANGLE) * (scaleRanges[key][1] - scaleRanges[key][0]);
			} else {
				const logRange = Math.log10(scaleRanges[key][1]) - Math.log10(scaleRanges[key][0]);
				activeDrag.rawValue *= 10 ** ((-delta / SCALE_SWEEP_ANGLE) * logRange);
			}
			onChange(key, activeDrag.rawValue);
		},

		onPointerUp: () => {
			const activeDrag = drag.current[key];
			if (activeDrag && !activeDrag.moved) {
				const nextSelection = selectedScale === key ? null : key;
				setSelectedScale(nextSelection);
			}
			drag.current[key] = null;
		},

		onPointerCancel: () => {
			drag.current[key] = null;
		},
		onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
			const up = ['+', '=', 'ArrowUp'].includes(e.key),
				down = ['-', '_', 'ArrowDown'].includes(e.key);
			if (!up && !down) return;
			e.preventDefault();
			const step = key === 'time' ? 1 : VALUE_STEP;
			onChange(key, values[key] + (up ? step : -step));
		},
		tabIndex: 0,
		role: 'slider',
		'aria-label': `${key} scale. Drag around the dial`,
		'aria-valuemin': ranges[key][0],
		'aria-valuemax': ranges[key][1],
		'aria-valuenow': Number(values[key].toFixed(2)),
		'data-selected': selectedScale === key ? 'true' : 'false',
	});

	return (
		<Svg ref={svg} viewBox="-262 -282 524 544">
			<circle r={R_OUT} fill="#f4ecd8" stroke="#1d2a44" strokeWidth="3" pointerEvents="none" />
			<circle r={R_TIME} fill="#2f7d4f" stroke="#12331f" strokeWidth="3" pointerEvents="none" />
			<circle r={R_SPEED + 13} fill="#266d48" stroke="#12331f" strokeWidth="2" pointerEvents="none" />

			<g
				{...ringHandlers('time')}
				data-animate={animatedKeys.includes('time') ? 'true' : 'false'}
				transform={`rotate(${-scaleAngle(values.time, scaleRanges.time)})`}
			>
				<circle r={TIME_HIT_RADIUS} fill="none" stroke="transparent" strokeWidth={TIME_HIT_WIDTH} pointerEvents="stroke" />
				<Scale
					r={R_TIME}
					color="#f4ecd8"
					selectionColor={COLORS.time}
					selected={values.time}
					data={data.time}
					range={scaleRanges.time}
					mode={mode('time')}
					timeLabels
				/>
			</g>
			<g
				{...ringHandlers('distance')}
				data-animate={animatedKeys.includes('distance') ? 'true' : 'false'}
				transform={`rotate(${-scaleAngle(values.distance, ranges.distance, mode('distance'))})`}
			>
				<circle
					r={DISTANCE_HIT_RADIUS}
					fill="none"
					stroke="transparent"
					strokeWidth={DISTANCE_HIT_WIDTH}
					pointerEvents="stroke"
				/>
				<Scale
					r={R_OUT}
					color="#1d2a44"
					selectionColor={COLORS.distance}
					selected={values.distance}
					data={data.distance}
					range={ranges.distance}
					mode={mode('distance')}
					zeroMain
				/>
			</g>
			<g
				{...ringHandlers('speed')}
				data-animate={animatedKeys.includes('speed') ? 'true' : 'false'}
				transform={`rotate(${-scaleAngle(values.speed, ranges.speed, mode('speed'))})`}
			>
				<circle r={R_SPEED + 14} fill="transparent" stroke="transparent" pointerEvents="all" />
				<Scale
					r={R_SPEED + 13}
					color="#f4ecd8"
					selectionColor={COLORS.speed}
					selected={values.speed}
					data={data.speed}
					range={ranges.speed}
					mode={mode('speed')}
				/>
			</g>

			<g pointerEvents="none">
				<circle r="8" fill="#12331f" />
			</g>

			<g transform={`translate(0 ${DISTANCE_VISOR_Y})`}>
				<foreignObject
					x={-visorWidth(editing === 'distance' ? `${draft} ${UNIT.distance}` : distanceVisorText) / 2}
					y={-VISOR_HEIGHT / 2}
					width={visorWidth(editing === 'distance' ? `${draft} ${UNIT.distance}` : distanceVisorText)}
					height={VISOR_HEIGHT}
				>
					<VisorFrame
						ref={editing === 'distance' ? visorRef : undefined}
						$accent={COLORS.distance}
						$background="#1d2a44"
						onClick={() => editing !== 'distance' && beginEditing('distance')}
					>
						{editing === 'distance' ? (
							<>
								<VisorInput
									aria-label="Distance"
									$width={`${Math.max(28, draft.length * 6)}px`}
									value={draft}
									onChange={(e) => /^\d*[.,]?\d*$/.test(e.target.value) && setDraft(e.target.value)}
									onKeyDown={(e) => handleEditKey(e)}
									onBlur={(e) => {
										if (!cancelEdit.current && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) commitEditing();
									}}
								/>
								<VisorUnit>{UNIT.distance}</VisorUnit>
							</>
						) : (
							<span>{distanceVisorText}</span>
						)}
					</VisorFrame>
				</foreignObject>
			</g>
			<g transform={`translate(0 ${TIME_VISOR_Y})`}>
				<foreignObject
					x={-visorWidth(editing === 'time' ? `${draftHours}h ${draftMinutes}m` : timeVisorText) / 2}
					y={-VISOR_HEIGHT / 2}
					width={visorWidth(editing === 'time' ? `${draftHours}h ${draftMinutes}m` : timeVisorText)}
					height={VISOR_HEIGHT}
				>
					<VisorFrame
						ref={editing === 'time' ? visorRef : undefined}
						$accent={COLORS.time}
						$background="#12331f"
						onClick={() => editing !== 'time' && beginEditing('time')}
					>
						{editing === 'time' ? (
							<>
								<VisorInput
									aria-label="Hours"
									inputMode="numeric"
									$maxWidth="44px"
									$width={`${Math.max(10, draftHours.length * 6)}px`}
									value={draftHours}
									onChange={(e) => /^\d*$/.test(e.target.value) && setDraftHours(e.target.value)}
									onKeyDown={(e) => handleEditKey(e, 'hours')}
									onBlur={(e) => {
										if (!cancelEdit.current && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) commitEditing();
									}}
								/>
								<VisorUnit>h</VisorUnit>
								<VisorInput
									aria-label="Minutes"
									inputMode="numeric"
									$maxWidth="54px"
									$width={`${Math.max(14, draftMinutes.length * 6)}px`}
									value={draftMinutes}
									onChange={(e) => /^\d*$/.test(e.target.value) && setDraftMinutes(e.target.value)}
									onKeyDown={(e) => handleEditKey(e, 'minutes')}
									onBlur={(e) => {
										if (!cancelEdit.current && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) commitEditing();
									}}
								/>
								<VisorUnit>m</VisorUnit>
							</>
						) : (
							<span>{timeVisorText}</span>
						)}
					</VisorFrame>
				</foreignObject>
			</g>
			<g transform={`translate(0 ${SPEED_VISOR_Y})`}>
				<foreignObject
					x={-visorWidth(editing === 'speed' ? `${draft} ${UNIT.speed}` : speedVisorText) / 2}
					y={-VISOR_HEIGHT / 2}
					width={visorWidth(editing === 'speed' ? `${draft} ${UNIT.speed}` : speedVisorText)}
					height={VISOR_HEIGHT}
				>
					<VisorFrame
						ref={editing === 'speed' ? visorRef : undefined}
						$accent={COLORS.speed}
						$background="#12331f"
						onClick={() => editing !== 'speed' && beginEditing('speed')}
					>
						{editing === 'speed' ? (
							<>
								<VisorInput
									aria-label="Speed"
									$width={`${Math.max(28, draft.length * 6)}px`}
									value={draft}
									onChange={(e) => /^\d*[.,]?\d*$/.test(e.target.value) && setDraft(e.target.value)}
									onKeyDown={(e) => handleEditKey(e)}
									onBlur={(e) => {
										if (!cancelEdit.current && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) commitEditing();
									}}
								/>
								<VisorUnit>{UNIT.speed}</VisorUnit>
							</>
						) : (
							<span>{speedVisorText}</span>
						)}
					</VisorFrame>
				</foreignObject>
			</g>
		</Svg>
	);
};
