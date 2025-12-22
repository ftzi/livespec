import { readFileSync, writeFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"
import { OGImage, ogImageConfig } from "./og-image"

const LOGO_PATH = new URL("./logo.svg", import.meta.url).pathname

const FONT_URL_REGEX = /src: url\((.+)\) format\('(opentype|truetype)'\)/

async function loadGoogleFont(font: string, weight: number): Promise<ArrayBuffer> {
	const API = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`
	const css = await (
		await fetch(API, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
			},
		})
	).text()

	const fontUrl = css.match(FONT_URL_REGEX)?.[1]
	if (!fontUrl) throw new Error(`Failed to load font: ${font}`)

	return await (await fetch(fontUrl)).arrayBuffer()
}

async function main() {
	const logoSvg = Buffer.from(readFileSync(LOGO_PATH)).toString("base64")

	const [interRegular, interSemiBold] = await Promise.all([loadGoogleFont("Inter", 400), loadGoogleFont("Inter", 600)])

	const svg = await satori(OGImage({ logoSvg }), {
		width: ogImageConfig.width,
		height: ogImageConfig.height,
		fonts: [
			{
				name: "Inter",
				data: interRegular,
				weight: 400,
				style: "normal",
			},
			{
				name: "Inter",
				data: interSemiBold,
				weight: 600,
				style: "normal",
			},
		],
	})

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: "width",
			value: ogImageConfig.width,
		},
	})
	const pngData = resvg.render()
	const pngBuffer = pngData.asPng()

	const outputPath = new URL("./og-image.png", import.meta.url).pathname
	writeFileSync(outputPath, pngBuffer)
}

main().catch(console.error)
