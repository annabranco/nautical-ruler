import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimerMode, TimerProps } from './interfaces';
import { TimerBody, TimerButton, TimerButtons, TimerDevice, TimerLabel, TimerScreen } from './styled';

const SEGMENTS: Record<string, string[]> = {
	'0': ['a', 'b', 'c', 'd', 'e', 'f'],
	'1': ['b', 'c'],
	'2': ['a', 'b', 'g', 'e', 'd'],
	'3': ['a', 'b', 'g', 'c', 'd'],
	'4': ['f', 'g', 'b', 'c'],
	'5': ['a', 'f', 'g', 'c', 'd'],
	'6': ['a', 'f', 'g', 'e', 'c', 'd'],
	'7': ['a', 'b', 'c'],
	'8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
	'9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

const Digit = ({ value }: { value: string }) => {
	const litSegments = SEGMENTS[value] ?? [];

	return (
		<span className="digit" aria-hidden="true">
			{['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((segment) => (
				<i key={segment} data-segment={segment} data-lit={litSegments.includes(segment)} />
			))}
		</span>
	);
};

const Timer = ({ timeMinutes }: TimerProps) => {
	const [mode, setMode] = useState<TimerMode>('following');
	const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const completionHandledRef = useRef(false);
	const displaySeconds = mode === 'following' ? Math.max(0, Math.round(timeMinutes * 60)) : (remainingSeconds ?? 0);
	const hours = Math.floor(displaySeconds / 3600);
	const minutes = Math.floor((displaySeconds % 3600) / 60);
	const seconds = displaySeconds % 60;
	const hourDigits = String(hours).padStart(2, '0');
	const timeDigits = `${hourDigits}${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}`;

	const playAlarm = useCallback(() => {
		try {
			const Context = window.AudioContext;
			if (!Context) return;
			const context = audioContextRef.current ?? new Context();
			audioContextRef.current = context;
			void context
				.resume()
				.then(() => {
					const startAt = context.currentTime + 0.04;
					for (let index = 0; index < 4; index += 1) {
						const oscillator = context.createOscillator();
						const gain = context.createGain();
						const beepStart = startAt + index * 0.36;
						oscillator.type = 'square';
						oscillator.frequency.setValueAtTime(880, beepStart);
						gain.gain.setValueAtTime(0.0001, beepStart);
						gain.gain.exponentialRampToValueAtTime(0.12, beepStart + 0.015);
						gain.gain.setValueAtTime(0.12, beepStart + 0.17);
						gain.gain.exponentialRampToValueAtTime(0.0001, beepStart + 0.19);
						oscillator.connect(gain);
						gain.connect(context.destination);
						oscillator.start(beepStart);
						oscillator.stop(beepStart + 0.2);
					}
				})
				.catch(() => undefined);
		} catch {
			// Keep timer completion working when audio is unavailable.
		}
	}, []);

	useEffect(() => {
		if (mode !== 'running') return undefined;
		const interval = window.setInterval(() => {
			setRemainingSeconds((current) => (current === null ? null : Math.max(0, current - 1)));
		}, 1000);
		return () => window.clearInterval(interval);
	}, [mode]);

	useEffect(() => {
		if (mode === 'running' && remainingSeconds === 0 && !completionHandledRef.current) {
			completionHandledRef.current = true;
			playAlarm();
			setRemainingSeconds(null);
			setMode('following');
		}
		if (mode !== 'running') completionHandledRef.current = false;
	}, [mode, playAlarm, remainingSeconds]);

	const onPlayPause = () => {
		if (mode === 'running') {
			setMode('paused');
			return;
		}
		if (mode === 'paused') {
			setMode('running');
			return;
		}
		try {
			const Context = window.AudioContext;
			if (Context) {
				audioContextRef.current ??= new Context();
				void audioContextRef.current.resume().catch(() => undefined);
			}
		} catch {
			// Audio is optional; the countdown can still run without it.
		}
		setRemainingSeconds(Math.max(0, Math.round(timeMinutes * 60)));
		setMode('running');
	};

	const onStop = () => {
		setRemainingSeconds(null);
		setMode('following');
	};

	return (
		<TimerDevice aria-label="Countdown timer">
			<TimerBody>
				<TimerLabel>Timer</TimerLabel>
				<TimerScreen role="timer" aria-label={`${hours} hours, ${minutes} minutes, ${seconds} seconds`} aria-live="off">
					{timeDigits.split('').map((digit, index) => (
						<span key={`${digit}-${index}`} className="digit-cell">
							<Digit value={digit} />
							{index === hourDigits.length - 1 || index === hourDigits.length + 1 ? (
								<span className="colon" aria-hidden="true">
									<i />
									<i />
								</span>
							) : null}
						</span>
					))}
				</TimerScreen>
				<TimerButtons>
					<TimerButton type="button" aria-label={mode === 'running' ? 'Pause timer' : 'Play timer'} onClick={onPlayPause}>
						{mode === 'running' ? (
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M7 5h4v14H7zM15 5h4v14h-4z" />
							</svg>
						) : (
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M7 4.8v14.4L19 12z" />
							</svg>
						)}
					</TimerButton>
					<TimerButton type="button" aria-label="Stop timer" onClick={onStop}>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M6 6h12v12H6z" />
						</svg>
					</TimerButton>
				</TimerButtons>
			</TimerBody>
		</TimerDevice>
	);
};

export { Timer };
