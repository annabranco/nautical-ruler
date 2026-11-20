import { useReducer, useState } from 'react';
import { initial, setBoatType, setValue } from './model';
import { Ruler } from './Ruler';
import { Readouts } from './Readouts';
import { Timer } from './Timer';
import type { AppAction, Key } from './interfaces';
import {
	BoatBadge,
	BoatMark,
	CloseButton,
	Global,
	GithubLink,
	Header,
	InstructionsButton,
	InstructionsDialog,
	KeyboardAdjustmentInstruction,
	MainStage,
	CompactReadoutRegion,
	Overlay,
	Page,
	ManualStage,
	RulerTimerStage,
	Title,
} from './styled';
const App = () => {
	const [instructionsOpen, setInstructionsOpen] = useState(false);
	const [state, dispatch] = useReducer(
		(s: typeof initial, a: AppAction) => (a.type === 'value' ? setValue(s, a.k, a.v) : setBoatType(s, a.boatType)),
		initial,
	);

	const onChange = (k: Key, v: number) => dispatch({ type: 'value', k, v });

	return (
		<Page>
			<Global />
			<Header>
				<BoatBadge>
					<BoatMark src={`${import.meta.env.BASE_URL}sailboat-emblem.png`} alt="" />
				</BoatBadge>
				<Title>Nautical Slide Ruler</Title>
				<InstructionsButton
					type="button"
					aria-label="Open instructions"
					title="Instructions"
					onClick={() => setInstructionsOpen(true)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.7"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
						<path d="M4 5.5v16M8 7h8M8 10h8M8 14h6" />
					</svg>
				</InstructionsButton>
			</Header>
			{state.boatType !== 'manual' && (
				<CompactReadoutRegion>
					<Readouts
						values={state.values}
						derived={state.derived}
						boatType={state.boatType}
						showValues
						showPicker={false}
						compact
						onBoatTypeChange={(boatType) => dispatch({ type: 'boat', boatType })}
						onChange={onChange}
					/>
				</CompactReadoutRegion>
			)}
			{state.boatType === 'manual' ? (
				<ManualStage>
					<Readouts
						values={state.values}
						derived={state.derived}
						boatType={state.boatType}
						showValues
						showPicker={false}
						onBoatTypeChange={(boatType) => dispatch({ type: 'boat', boatType })}
						onChange={onChange}
					/>
					<Timer timeMinutes={state.values.time} />
				</ManualStage>
			) : (
				<RulerTimerStage>
					<MainStage>
						<Ruler values={state.values} boatType={state.boatType} onChange={onChange} />
					</MainStage>
					<Timer timeMinutes={state.values.time} />
				</RulerTimerStage>
			)}
			<Readouts
				values={state.values}
				derived={state.derived}
				boatType={state.boatType}
				showValues={false}
				showPicker
				onBoatTypeChange={(boatType) => dispatch({ type: 'boat', boatType })}
				onChange={onChange}
			/>
			<GithubLink
				href="https://github.com/annabranco"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub profile: annabranco"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 .5C5.65.5.5 5.75.5 12.23c0 5.19 3.38 9.59 8.06 11.14.59.09.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.28.73-3.97-1.62-3.97-1.62-.54-1.4-1.32-1.78-1.32-1.78-1.08-.76.08-.75.08-.75 1.2.09 1.83 1.27 1.83 1.27 1.06 1.86 2.79 1.32 3.47 1.01.11-.79.42-1.32.76-1.62-2.62-.31-5.38-1.34-5.38-5.96 0-1.32.46-2.4 1.24-3.25-.12-.31-.54-1.54.12-3.2 0 0 1.01-.33 3.3 1.24.96-.27 1.98-.41 3-.42 1.02.01 2.04.15 3 .42 2.29-1.57 3.3-1.24 3.3-1.24.66 1.66.24 2.89.12 3.2.77.85 1.24 1.93 1.24 3.25 0 4.63-2.77 5.65-5.4 5.95.43.38.81 1.1.81 2.22 0 1.61-.02 2.91-.02 3.3 0 .31.2.66.8.55 4.67-1.56 8.04-5.96 8.04-11.15C23.5 5.75 18.35.5 12 .5z" />
				</svg>
				GitHub
			</GithubLink>
			{instructionsOpen && (
				<Overlay
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) setInstructionsOpen(false);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Escape') setInstructionsOpen(false);
					}}
				>
					<InstructionsDialog role="dialog" aria-modal="true" aria-labelledby="instructions-title" tabIndex={-1}>
						<CloseButton autoFocus type="button" aria-label="Close instructions" onClick={() => setInstructionsOpen(false)}>
							×
						</CloseButton>
						<h2 id="instructions-title">How to use the slide ruler</h2>
						<h3>Ruler mode</h3>
						<ul>
							<li>
								Choose <strong>Cruiser</strong> or <strong>Speed</strong> to set the ruler limits.
							</li>
							<li>
								Drag the outer distance ring to change distance. Drag either green ring to adjust the linked speed and time.
							</li>
							<KeyboardAdjustmentInstruction>
								Click a ring to highlight it, then use <strong>+</strong> or <strong>−</strong> on your keyboard for small
								adjustments.
							</KeyboardAdjustmentInstruction>
							<li>
								Click a colored value window to type a value. Press <strong>Enter</strong> or click outside to apply it. For time,
								enter hours and minutes separately.
							</li>
						</ul>
						<h3>Manual mode</h3>
						<ul>
							<li>
								Select <strong>Manual</strong> to hide the rulers and show the value cards.
							</li>
							<li>
								Click any value to edit it, then press <strong>Enter</strong> or click outside to apply it.
							</li>
							<li>
								Changing a value recalculates the related value. Manual mode has no maximum limit; distance and speed have a
								minimum of 0.1.
							</li>
						</ul>
					</InstructionsDialog>
				</Overlay>
			)}
		</Page>
	);
};

export default App;
