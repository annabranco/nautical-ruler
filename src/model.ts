import type { BoatLimits, BoatOption, BoatType, Key, ScaleMode, ScaleRange, State, Values } from './interfaces';

export const KEYS: Key[] = ['distance', 'speed', 'time'];
export const LABEL: Record<Key, string> = { distance: 'Distance', speed: 'Speed', time: 'Time' };
export const UNIT: Record<Key, string> = { distance: 'nm', speed: 'kn', time: 'min' };
const BOAT_MAX: Record<BoatType, BoatLimits> = {
	cruiser: { distance: 12, speed: 12 },
	speed: { distance: 50, speed: 50 },
	manual: {
		distance: Number.POSITIVE_INFINITY,
		speed: Number.POSITIVE_INFINITY,
	},
};
export const BOAT_OPTIONS: BoatOption[] = [
	{ value: 'cruiser', label: 'Cruiser' },
	{ value: 'speed', label: 'Speed' },
	{ value: 'manual', label: 'Manual' },
];
const MIN_DISTANCE = 0.1;
const MIN_SPEED = 0.1;
export const COLORS: Record<Key, string> = { distance: '#2680eb', speed: '#e23d36', time: '#f28c28' };
export const VALUE_STEP = 0.05;

// D = S * T / 60  (nm, knots, minutes)
const solve = (v: Values, k: Key): number => {
	if (k === 'distance') return (v.speed * v.time) / 60;
	if (k === 'speed') return (60 * v.distance) / v.time;
	return (60 * v.distance) / v.speed;
};

export const initial: State = {
	values: { distance: 4, speed: 8, time: 30 },
	edited: ['speed', 'distance'],
	derived: 'time',
	boatType: 'cruiser',
};

/** Round values to the ruler's 0.05 increment. */
export const roundValue = (n: number) => Number((Math.round(n / VALUE_STEP) * VALUE_STEP).toFixed(2));

/** Allowable value ranges; the time window follows the selected boat's distance and speed limits. */
export const getRanges = (boatType: BoatType) => {
	const max = BOAT_MAX[boatType];
	if (boatType === 'manual') {
		return {
			distance: [MIN_DISTANCE, Number.POSITIVE_INFINITY] as ScaleRange,
			speed: [MIN_SPEED, Number.POSITIVE_INFINITY] as ScaleRange,
			time: [0.1, Number.POSITIVE_INFINITY] as ScaleRange,
		};
	}
	const minTime = Math.ceil((60 * MIN_DISTANCE) / max.speed / VALUE_STEP) * VALUE_STEP;
	const maxTime = Math.floor((60 * max.distance) / MIN_SPEED / VALUE_STEP) * VALUE_STEP;
	return {
		distance: [MIN_DISTANCE, max.distance] as ScaleRange,
		speed: [MIN_SPEED, max.speed] as ScaleRange,
		time: [Number(minTime.toFixed(2)), Number(maxTime.toFixed(2))] as ScaleRange,
	};
};

const bounded = (value: number, range: ScaleRange) => roundValue(Math.min(range[1], Math.max(range[0], value)));

/** Set one value and recalculate the mathematically related value. */
export const setValue = (s: State, key: Key, raw: number): State => {
	if (!Number.isFinite(raw)) return s;
	const ranges = getRanges(s.boatType);
	let edited = [key, ...s.edited.filter((k) => k !== key)].slice(0, 2) as Key[];
	const values = { ...s.values, [key]: bounded(raw, ranges[key]) };
	// Distance and speed selections preserve one another and recalculate time.
	// A time selection preserves distance and recalculates speed.
	let derived: Key = key === 'time' ? 'speed' : 'time';
	if (key === 'time') {
		// Keep an explicitly selected time even when fixed distance would push speed
		// outside its limits. Move distance to the nearest valid value in that case.
		const requiredSpeed = solve(values, 'speed');
		// Once a time adjustment has moved distance to hold a speed limit, retain
		// that constraint across subsequent time steps instead of solving speed
		// again from the quantized distance (which can drift below/above the limit).
		const heldLimit =
			s.derived === 'distance' && s.edited[0] === 'time'
				? s.values.speed === ranges.speed[0] || s.values.speed === ranges.speed[1]
					? s.values.speed
					: null
				: null;
		const speedLimit =
			heldLimit ?? (requiredSpeed < ranges.speed[0] ? ranges.speed[0] : requiredSpeed > ranges.speed[1] ? ranges.speed[1] : null);
		if (speedLimit !== null) {
			values.distance = bounded((values.time * speedLimit) / 60, ranges.distance);
			// Distance is quantized to the ruler's 0.05 step, so solving speed again
			// from that rounded distance can make the speed oscillate near its limit.
			// Keep the limiting speed steady while the derived distance moves.
			values.speed = speedLimit;
			edited = ['time', 'distance'];
			derived = 'distance';
		} else {
			values.speed = bounded(requiredSpeed, ranges.speed);
		}
	} else if (derived === 'time') values.time = bounded(solve(values, 'time'), ranges.time);
	else {
		const timeRange: ScaleRange = [
			Math.max(ranges.time[0], (60 * values.distance) / ranges.speed[1]),
			Math.min(ranges.time[1], (60 * values.distance) / ranges.speed[0]),
		];
		values.time = bounded(values.time, timeRange);
		values.speed = bounded(solve(values, 'speed'), ranges.speed);
	}
	return { values, edited, derived, boatType: s.boatType };
};

/** Switch boat presets, clamp the selected inputs, and keep the formula consistent. */
export const setBoatType = (s: State, boatType: BoatType): State => {
	if (s.boatType === boatType) return s;
	return {
		values: { distance: 4, speed: 8, time: 30 },
		edited: ['speed', 'distance'],
		derived: 'time',
		boatType,
	};
};

/** Rotate the time/speed ring while preserving the selected distance. */
export const rotateTimeSpeed = (s: State, logDelta: number): State => {
	return setValue(s, 'time', s.values.time * 10 ** logDelta);
};

/** Map a value onto its current log scale, leaving a small gap between both endpoints. */
export const SCALE_START_ANGLE = 10;
export const SCALE_SWEEP_ANGLE = 340;
export const scaleAngle = (v: number, range: ScaleRange, mode: ScaleMode = 'log') => {
	const [min, max] = range;
	if (mode === 'linear') return SCALE_START_ANGLE + (SCALE_SWEEP_ANGLE * (v - min)) / (max - min);
	const span = Math.log10(max) - Math.log10(min);
	return SCALE_START_ANGLE + (SCALE_SWEEP_ANGLE * (Math.log10(v) - Math.log10(min))) / span;
};
export const fmt = (n: number) => roundValue(n).toFixed(2);
export const fmtTime = (min: number) => {
	const s = Math.round(min * 60);
	const h = Math.floor(s / 3600),
		m = Math.floor((s % 3600) / 60),
		r = s % 60;
	return `${h}h ${String(m).padStart(2, '0')}m ${String(r).padStart(2, '0')}s`;
};
