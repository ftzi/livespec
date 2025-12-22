// biome-ignore lint/correctness/noUndeclaredDependencies: satori provides React JSX runtime
import type { ReactNode } from "react"

const SAFE_BORDER = 60
const WIDTH = 1280
const HEIGHT = 640
const BRAND_GREEN = "#17ab55"

export const ogImageConfig = {
	width: WIDTH,
	height: HEIGHT,
}

export type OGImageProps = {
	logoSvg: string
}

function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9999) * 10000
	return x - Math.floor(x)
}

function Star({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
	return (
		<div
			style={{
				position: "absolute",
				width: size,
				height: size,
				backgroundColor: "#ffffff",
				borderRadius: "50%",
				left: x,
				top: y,
				opacity: opacity,
				boxShadow: `0 0 ${size * 2}px ${size * 0.5}px rgba(255, 255, 255, ${opacity * 0.5})`,
			}}
		/>
	)
}

function Nebula({
	x,
	y,
	size,
	color,
	opacity,
}: {
	x: number
	y: number
	size: number
	color: string
	opacity: number
}) {
	return (
		<div
			style={{
				position: "absolute",
				width: size,
				height: size,
				borderRadius: "50%",
				left: x - size / 2,
				top: y - size / 2,
				opacity: opacity,
				background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
			}}
		/>
	)
}

export function OGImage({ logoSvg }: OGImageProps): ReactNode {
	const stars: Array<{ x: number; y: number; size: number; opacity: number }> = []
	for (let i = 0; i < 150; i++) {
		stars.push({
			x: seededRandom(i * 3) * WIDTH,
			y: seededRandom(i * 7) * HEIGHT,
			size: seededRandom(i * 11) * 2.5 + 1,
			opacity: seededRandom(i * 13) * 0.6 + 0.3,
		})
	}

	return (
		<div
			style={{
				width: WIDTH,
				height: HEIGHT,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #0a0a1a 100%)",
				padding: SAFE_BORDER,
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Nebula clouds */}
			<Nebula x={100} y={100} size={400} color={BRAND_GREEN} opacity={0.08} />
			<Nebula x={1100} y={500} size={500} color="#4f46e5" opacity={0.06} />
			<Nebula x={640} y={320} size={600} color={BRAND_GREEN} opacity={0.04} />

			{/* Stars */}
			{stars.map((star, i) => (
				<Star key={i} x={star.x} y={star.y} size={star.size} opacity={star.opacity} />
			))}

			{/* Content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					position: "relative",
				}}
			>
				{/* Logo */}
				{/* biome-ignore lint/a11y/useAltText: satori OG image, not web */}
				{/* biome-ignore lint/performance/noImgElement: satori OG image, not web */}
				<img
					src={`data:image/svg+xml;base64,${logoSvg}`}
					width={840}
					height={150}
					style={{
						filter: "brightness(1.1) drop-shadow(0 0 30px rgba(23, 171, 85, 0.4))",
					}}
				/>

				{/* Subtitle */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 16,
					}}
				>
					<p
						style={{
							fontSize: 47,
							color: "#e5e7eb",
							fontFamily: "Inter, sans-serif",
							fontWeight: 600,
							margin: 0,
							textAlign: "center",
							letterSpacing: "0.01em",
							textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)",
						}}
					>
						Specs in sync with code and tests
					</p>
				</div>
			</div>
		</div>
	)
}
