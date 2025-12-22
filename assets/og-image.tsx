// biome-ignore lint/correctness/noUndeclaredDependencies: satori provides React JSX runtime
import type { ReactNode } from "react"

const SAFE_BORDER = 40
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

function DiagonalLine({ x, opacity, width }: { x: number; opacity: number; width: number }) {
	return (
		<div
			style={{
				position: "absolute",
				width: width,
				height: 2000,
				backgroundColor: BRAND_GREEN,
				opacity: opacity,
				left: x,
				top: -400,
				transform: "rotate(45deg)",
				transformOrigin: "top left",
			}}
		/>
	)
}

export function OGImage({ logoSvg }: OGImageProps): ReactNode {
	return (
		<div
			style={{
				width: WIDTH,
				height: HEIGHT,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#ffffff",
				padding: SAFE_BORDER,
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Diagonal lines pattern - equally spaced */}
			{Array.from({ length: 60 }).map((_, i) => (
				<DiagonalLine key={i} x={-400 + i * 70} opacity={0 + i * 0.005} width={2} />
			))}

			{/* Content layer with white background to mask lines */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					backgroundColor: "#ffffff",
					padding: "20px 30px",
					boxShadow: "0 0 40px 30px #ffffff",
				}}
			>
				{/* Logo */}
				{/* biome-ignore lint/a11y/useAltText: satori OG image, not web */}
				{/* biome-ignore lint/performance/noImgElement: satori OG image, not web */}
				<img src={`data:image/svg+xml;base64,${logoSvg}`} width={840} height={150} />

				{/* Subtitle with accent */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 16,
					}}
				>
					<p
						style={{
							fontSize: 44,
							color: "#4b5563",
							fontFamily: "Inter, sans-serif",
							fontWeight: 500,
							margin: 0,
							textAlign: "center",
							letterSpacing: "0.01em",
						}}
					>
						Specs in sync with code and tests
					</p>
				</div>
			</div>
		</div>
	)
}
