export type Key = 'distance' | 'speed' | 'time';

export type Values = Record<Key, number>;

export type BoatType = 'cruiser' | 'speed' | 'manual';

export type ScaleMode = 'log' | 'linear';

export type ScaleRange = [number, number];

export interface State {
	values: Values;
	edited: Key[];
	derived: Key;
	boatType: BoatType;
}

export interface BoatLimits {
	distance: number;
	speed: number;
}

export interface BoatOption {
	value: BoatType;
	label: string;
}

export interface Tick {
	v: number;
	len: number;
	label?: string;
	fontSize?: number;
	angleValue?: number;
}

export interface TimeTickSpec {
	label: boolean;
	angleValue?: number;
}

export interface FieldProps {
	k: Key;
	value: number;
	derived: boolean;
	boatType: BoatType;
	onChange: (key: Key, value: number) => void;
}

export interface ReadoutsProps {
	values: Values;
	derived: Key;
	boatType: BoatType;
	showValues: boolean;
	showPicker: boolean;
	compact?: boolean;
	onBoatTypeChange: (boatType: BoatType) => void;
	onChange: (key: Key, value: number) => void;
}

export interface RulerProps {
	values: Values;
	boatType: BoatType;
	onChange: (key: Key, value: number) => void;
}

export interface ScaleProps {
	r: number;
	color: string;
	selectionColor: string;
	selected: number;
	data: Tick[];
	range: ScaleRange;
	mode: ScaleMode;
	timeLabels?: boolean;
	zeroMain?: boolean;
}

export type AppAction = { type: 'value'; k: Key; v: number } | { type: 'boat'; boatType: BoatType };

export interface DragState {
	angle: number;
	rawValue: number;
	totalDelta: number;
	moved: boolean;
}

export type DragByScale = Record<Key, DragState | null>;

export interface PanelStyleProps {
	$pickerOnly: boolean;
}

export interface CardStyleProps {
	$derived: boolean;
	$accent: string;
}

export interface VisorFrameStyleProps {
	$accent: string;
	$background: string;
}

export interface VisorInputStyleProps {
	$width?: string;
	$maxWidth?: string;
}
