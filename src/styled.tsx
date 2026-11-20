import styled, { createGlobalStyle, css } from 'styled-components';
import type { CardStyleProps, PanelStyleProps, VisorFrameStyleProps, VisorInputStyleProps } from './interfaces';

const compactReadoutStyles = css`
	&[data-compact='true'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 6px;
		width: 100%;
	}

	&[data-compact='true'] > div {
		min-width: 0;
		padding: 8px 6px;
		border-left-width: 5px;
	}

	&[data-compact='true'] small {
		overflow: hidden;
		font-size: 8px;
		letter-spacing: 0.05em;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&[data-compact='true'] .big {
		min-width: 0;
		font-size: clamp(11px, 4vw, 23px);
	}

	&[data-compact='true'] .big button {
		white-space: nowrap;
	}

	&[data-compact='true'] .big span,
	&[data-compact='true'] .big .time-unit {
		margin-left: 3px;
		font-size: clamp(10px, 2.6vw, 12px);
	}

	&[data-compact='true'] .big input {
		width: 100%;
		min-width: 0;
		max-width: 100%;
		font-size: inherit;
	}

	&[data-compact='true'] .big input.time-part {
		width: 1.2em;
		max-width: 1.2em;
	}

	&[data-compact='true'] .sub {
		min-height: 0;
		font-size: 10px;
		white-space: nowrap;
	}
`;

export const Global = createGlobalStyle`
  body {
    margin: 0;
    overflow-x: hidden;
    background: #e9eef5;
    font-family: system-ui, sans-serif;
    color: #1b2430;
  }
`;

export const Page = styled.main`
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-content: flex-start;
	gap: 20px;
	padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom))
		max(24px, env(safe-area-inset-left));
	box-sizing: border-box;
	overflow-anchor: none;
	container-name: app-shell;
	container-type: inline-size;

	@media (max-width: 480px) {
		gap: 16px;
		padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom))
			max(16px, env(safe-area-inset-left));
	}
`;

export const Header = styled.header`
	position: relative;
	width: calc(100% - 16px);
	margin-inline: auto;
	box-sizing: border-box;
	min-height: 82px;
	padding: 12px 64px 12px 20px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 22px;
	background: #dce5ef;
	border: 1px solid #c5d2e0;
	border-radius: 18px;

	@media (max-width: 480px) {
		min-height: 68px;
		gap: 16px;
		padding: 10px 58px 10px 12px;
	}
`;

export const InstructionsButton = styled.button`
	position: absolute;
	top: 50%;
	right: 14px;
	transform: translateY(-50%);
	width: 38px;
	height: 38px;
	display: grid;
	place-items: center;
	padding: 0;
	border: 1px solid #aebdcc;
	border-radius: 11px;
	background: rgba(255, 255, 255, 0.6);
	color: #1d2a44;
	cursor: pointer;
	transition:
		background 150ms ease,
		transform 150ms ease;

	&:hover {
		background: #fff;
		transform: translateY(calc(-50% - 1px));
	}

	&:focus-visible {
		outline: 3px solid #4a8db8;
		outline-offset: 2px;
	}

	svg {
		width: 21px;
		height: 21px;
	}
`;

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	z-index: 20;
	display: grid;
	place-items: center;
	padding: 20px;
	box-sizing: border-box;
	background: rgba(12, 24, 39, 0.55);
`;

export const InstructionsDialog = styled.section`
	position: relative;
	width: min(100%, 520px);
	max-height: min(82vh, 720px);
	overflow: auto;
	box-sizing: border-box;
	padding: 28px 30px 30px;
	border: 1px solid #c5d2e0;
	border-radius: 18px;
	background: #f7f9fc;
	color: #1b2430;
	box-shadow: 0 24px 72px rgba(5, 18, 34, 0.3);

	h2 {
		margin: 0 44px 20px 0;
		color: #1d2a44;
		font:
			600 25px/1.2 'Palatino Linotype',
			Palatino,
			'Book Antiqua',
			Georgia,
			serif;
	}

	h3 {
		margin: 20px 0 8px;
		color: #1d2a44;
		font-size: 15px;
	}

	h3:first-of-type {
		margin-top: 0;
	}

	ul {
		margin: 0;
		padding-left: 20px;
	}

	li {
		margin: 7px 0;
		line-height: 1.5;
	}

	@media (max-width: 480px) {
		padding: 24px 22px;
	}
`;

export const KeyboardAdjustmentInstruction = styled.li`
	@media (max-width: 1024px) {
		display: none;
	}
`;

export const CloseButton = styled.button`
	position: absolute;
	top: 18px;
	right: 18px;
	width: 36px;
	height: 36px;
	display: grid;
	place-items: center;
	border: 1px solid #c4ced9;
	border-radius: 10px;
	background: white;
	color: #1d2a44;
	font-size: 22px;
	line-height: 1;
	cursor: pointer;

	&:hover {
		background: #eaf0f6;
	}

	&:focus-visible {
		outline: 3px solid #4a8db8;
		outline-offset: 2px;
	}
`;

export const GithubLink = styled.a`
	position: fixed;
	right: 18px;
	bottom: 14px;
	z-index: 10;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 9px;
	border: 1px solid #c5d2e0;
	border-radius: 999px;
	background: rgba(220, 229, 239, 0.94);
	color: #1d2a44;
	font:
		500 12px/1 system-ui,
		sans-serif;
	text-decoration: none;
	box-shadow: 0 2px 8px rgba(29, 42, 68, 0.08);
	transition:
		background 150ms ease,
		transform 150ms ease;

	&:hover {
		background: #f7f9fc;
		transform: translateY(-1px);
	}

	&:focus-visible {
		outline: 3px solid #4a8db8;
		outline-offset: 2px;
	}

	svg {
		width: 17px;
		height: 17px;
		fill: currentColor;
	}

	@media (max-width: 640px), (max-height: 640px) {
		position: static;
		align-self: flex-end;
		margin: 0 2px 0 0;
	}
`;

export const BoatBadge = styled.div`
	width: 54px;
	height: 54px;
	display: grid;
	place-items: center;
	flex: 0 0 auto;
	border-radius: 50%;
	background: #b9e5f2;
	box-shadow:
		0 0 0 1px rgba(94, 174, 201, 0.3),
		0 0 18px rgba(93, 196, 225, 0.58);

	@media (max-width: 480px) {
		width: 44px;
		height: 44px;
	}
`;

export const BoatMark = styled.img`
	display: block;
	width: 50px;
	height: 44px;
	object-fit: contain;

	@media (max-width: 480px) {
		width: 40px;
		height: 36px;
	}
`;

export const Title = styled.h1`
	min-width: 0;
	margin: 0;
	color: #1d2a44;
	text-align: left;
	font:
		600 clamp(28px, 4vw, 34px)/1.08 'Palatino Linotype',
		Palatino,
		'Book Antiqua',
		Georgia,
		serif;
	letter-spacing: 0.01em;

	@media (max-width: 480px) {
		font-size: clamp(20px, 5.4vw, 24px);
	}
`;

export const MainStage = styled.div`
	width: min(100%, 560px);
	min-height: min(95.5vw, 581px);
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;

	@media (max-width: 480px) {
		min-height: min(calc((100vw - 32px) * 1.04), 581px);
	}
`;

export const RulerTimerStage = styled.div`
	width: min(100%, 860px);
	min-height: min(95.5vw, 581px);
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: clamp(16px, 3vw, 36px);

	@media (max-width: 768px) {
		width: 100%;
		min-height: 0;
		flex-direction: column;
		gap: 14px;
	}

	@container app-shell (max-width: 768px) {
		width: 100%;
		min-height: 0;
		flex-direction: column;
		gap: 14px;
	}
`;

export const ManualStage = styled.div`
	width: min(100%, 640px);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 14px;
`;

export const TimerDevice = styled.section`
	width: min(100%, 160px);
	flex: 0 0 auto;
	box-sizing: border-box;
	padding: 5px;
	border: 1px solid #536a78;
	border-radius: 13px;
	background: linear-gradient(145deg, #263b46, #14242e 72%);
	box-shadow:
		0 10px 22px rgba(22, 39, 52, 0.18),
		inset 0 1px 0 rgba(255, 255, 255, 0.13);
`;

export const TimerBody = styled.div`
	padding: 4px;
	border: 1px solid rgba(182, 206, 215, 0.42);
	border-radius: 8px;
	background: #192b32;
`;

export const TimerLabel = styled.div`
	margin: 0 2px 4px;
	color: #b5c8ce;
	font:
		700 7px/1 system-ui,
		sans-serif;
	letter-spacing: 0.2em;
	text-align: left;
	text-transform: uppercase;
`;

export const TimerScreen = styled.div`
	min-height: 46px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1px;
	padding: 4px 1px;
	border: 1px solid #314c42;
	border-radius: 7px;
	background: #0c1714;
	box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.55);
	color: #80ffb4;

	.digit-cell {
		display: inline-flex;
		align-items: center;
		gap: 1px;
		flex: 0 0 auto;
	}

	.digit {
		position: relative;
		width: clamp(12px, 1.5vw, 15px);
		height: clamp(24px, 2.8vw, 29px);
		display: block;
	}

	.digit i {
		position: absolute;
		display: block;
		border-radius: 2px;
		background: #80ffb4;
		top: 0;
		left: 0;
		opacity: 0.1;
	}

	.digit i[data-lit='true'] {
		opacity: 1;
		box-shadow: 0 0 4px rgba(128, 255, 180, 0.55);
	}

	.digit i[data-segment='a'],
	.digit i[data-segment='g'],
	.digit i[data-segment='d'] {
		width: 66%;
		height: 7%;
		left: 17%;
	}

	.digit i[data-segment='a'] {
		top: 2%;
	}

	.digit i[data-segment='g'] {
		top: 46%;
	}

	.digit i[data-segment='d'] {
		top: 91%;
	}

	.digit i[data-segment='b'],
	.digit i[data-segment='c'],
	.digit i[data-segment='e'],
	.digit i[data-segment='f'] {
		width: 8%;
		height: 38%;
	}

	.digit i[data-segment='b'],
	.digit i[data-segment='c'] {
		right: 4%;
		left: auto;
	}

	.digit i[data-segment='e'],
	.digit i[data-segment='f'] {
		left: 4%;
	}

	.digit i[data-segment='b'],
	.digit i[data-segment='f'] {
		top: 8%;
	}

	.digit i[data-segment='c'],
	.digit i[data-segment='e'] {
		top: 54%;
	}

	.colon {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
	}

	.colon i {
		width: 2.5px;
		height: 2.5px;
		border-radius: 50%;
		background: #80ffb4;
		box-shadow: 0 0 4px rgba(128, 255, 180, 0.55);
	}
`;

export const TimerButtons = styled.div`
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-top: 6px;
`;

export const TimerButton = styled.button`
	width: 28px;
	height: 25px;
	display: grid;
	place-items: center;
	padding: 0;
	border: 1px solid #536e79;
	border-radius: 9px;
	background: #263b46;
	color: #dcebed;
	cursor: pointer;
	transition:
		background 140ms ease,
		transform 140ms ease;

	&:hover {
		background: #36525f;
		transform: translateY(-1px);
	}

	&:focus-visible {
		outline: 3px solid #80ffb4;
		outline-offset: 2px;
	}

	svg {
		width: 12px;
		height: 12px;
		fill: currentColor;
	}
`;

export const CompactReadoutRegion = styled.div`
	display: none;

	@media (max-width: 768px) {
		display: block;
		width: 100%;
		max-width: 560px;
	}

	@container app-shell (max-width: 768px) {
		display: block;
		width: 100%;
		max-width: 560px;
	}
`;

export const Panel = styled.div<PanelStyleProps>`
	display: grid;
	gap: 12px;
	box-sizing: border-box;
	width: ${(props) => (props.$pickerOnly ? 'min(100%, 640px)' : 'min(100%, 360px)')};

	@media (max-width: 768px) {
		${compactReadoutStyles}
	}

	@container app-shell (max-width: 768px) {
		${compactReadoutStyles}
	}
`;

export const BoatPicker = styled.fieldset`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	align-items: stretch;
	gap: 8px;
	width: 100%;
	min-width: 0;
	box-sizing: border-box;
	margin: 0;
	padding: 10px 12px 12px;
	border: 1px solid #b7c2d0;
	border-radius: 12px;
	background: #f5f7fa;

	legend {
		padding: 0 6px;
		font-weight: 700;
	}

	label {
		display: flex;
		align-items: center;
		gap: 5px;
		min-width: 0;
		padding: 7px 6px;
		border: 1px solid #9aa8bb;
		border-radius: 8px;
		background: white;
		font-size: clamp(10px, 1.8vw, 13px);
		line-height: 1.2;
		cursor: pointer;
	}

	label:has(input:checked) {
		border-color: #2563a6;
		background: #e7f1ff;
	}

	input {
		flex: 0 0 auto;
		margin: 0;
		accent-color: #2563a6;
	}

	@media (max-width: 480px) {
		gap: 4px;
		padding: 10px 8px 12px;

		label {
			gap: 4px;
			padding: 7px 4px;
			font-size: clamp(9px, 2.7vw, 12px);
		}
	}
`;

export const Card = styled.div<CardStyleProps>`
	background: #0f1724;
	color: #eaf2ff;
	border: 2px solid ${(props) => props.$accent};
	border-left-width: 8px;
	border-radius: 14px;
	padding: 14px 18px;
	opacity: ${(props) => (props.$derived ? 0.92 : 1)};

	small {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.7;
	}

	.big {
		display: flex;
		align-items: baseline;
		font:
			700 44px/1.1 ui-monospace,
			Menlo,
			monospace;
	}

	.big span {
		font-size: 18px;
		opacity: 0.7;
		margin-left: 6px;
	}

	.big button {
		border: 0;
		padding: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: text;
	}

	.big input {
		width: min(220px, 65vw);
		margin: 0;
		padding: 0;
		border: 0;
		border-bottom: 2px solid ${(props) => props.$accent};
		border-radius: 0;
		outline: none;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.big input.time-part {
		width: 1.5em;
	}

	.big .time-unit {
		margin-left: 2px;
		font-size: 18px;
		opacity: 0.7;
	}

	.sub {
		opacity: 0.7;
		font-size: 13px;
		min-height: 20px;
	}

	@media (max-width: 480px) {
		padding: 12px 14px;

		.big {
			font-size: clamp(30px, 9vw, 38px);
		}

		.big span,
		.big .time-unit {
			font-size: 15px;
		}
	}
`;

export const Svg = styled.svg`
	width: min(100%, 560px);
	height: auto;
	touch-action: none;
	user-select: none;

	g[role='slider'] {
		cursor: grab;
		outline: none;
	}

	g[role='slider']:active {
		cursor: grabbing;
	}

	g[role='slider'][data-selected='true'] > circle:first-child {
		stroke: #e8b100;
		stroke-width: 5;
	}

	g[role='slider']:focus-visible > circle:first-child {
		stroke: #e8b100;
		stroke-width: 5;
	}

	g[role='slider'][data-animate='true'] {
		transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
	}
`;

export const VisorFrame = styled.div<VisorFrameStyleProps>`
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2px;
	border: 1.2px solid ${(props) => props.$accent};
	border-radius: 4px;
	background: ${(props) => props.$background};
	color: #f4ecd8;
	font:
		700 11px system-ui,
		sans-serif;
	padding: 0 3px;
	white-space: nowrap;
`;

export const VisorInput = styled.input<VisorInputStyleProps>`
	min-width: 0;
	width: ${(props) => props.$width ?? 'auto'};
	max-width: ${(props) => props.$maxWidth ?? '82px'};
	border: 0;
	outline: 0;
	padding: 0;
	background: transparent;
	color: #f4ecd8;
	font: inherit;
	text-align: center;
	user-select: text;
`;

export const VisorUnit = styled.span`
	color: #9299a4;
`;
