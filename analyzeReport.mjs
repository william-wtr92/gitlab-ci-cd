import fs from "fs"
import { JSDOM } from "jsdom"

const html = fs.readFileSync("zap_report.html", "utf8")
const dom = new JSDOM(html)
const document = dom.window.document

const highRiskElement = document.querySelector("td.risk-3 + td div")
const highRiskCount = highRiskElement
  ? parseInt(highRiskElement.textContent, 10)
  : 0

if (highRiskCount > 0) {
  // eslint-disable-next-line no-console
  console.error(`Found high risk issues: ${highRiskCount}`)
  process.exit(1)
} else {
  // eslint-disable-next-line no-console
  console.log("No high risk issues found.")
  process.exit(0)
}
