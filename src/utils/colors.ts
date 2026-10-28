const ESC = "\x1b["
const RESET = `${ESC}0m`
const CYAN = `${ESC}36m`
const YELLOW = `${ESC}33m`
const GREEN = `${ESC}32m`
const RED = `${ESC}31m`
const BOLD = `${ESC}1m`

const forceColor = process.env.FORCE_COLOR
const useColor = process.env.NO_COLOR
  ? false
  : forceColor !== undefined
    ? forceColor !== "0"
    : Boolean(process.stdout.isTTY)

function paint(code: string, text: string): string {
  return useColor ? `${code}${text}${RESET}` : text
}

export function cyan(text: string): string {
  return paint(CYAN, text)
}

export function yellow(text: string): string {
  return paint(YELLOW, text)
}

export function green(text: string): string {
  return paint(GREEN, text)
}

export function red(text: string): string {
  return paint(RED, text)
}

export function bold(text: string): string {
  return paint(BOLD, text)
}
